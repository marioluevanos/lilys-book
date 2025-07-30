import { BaseSyntheticEvent, useCallback, useEffect, useState } from "react";
import { generateBook, uploadBase64Image } from "../library";
import { useModes } from "../hooks/useModes";
import { BookProps, ImageProps } from "../types";
import { initialImages, bookPrompt } from "../system";
import {
  preloadStorage,
  updateBook,
  updateImages,
  updatePrompt,
} from "../storage";
import { Form } from "./Form/Form";
import { Drawer } from "./Drawer/Drawer";
import { EventPayload, events } from "../events";
import { PlusIcon } from "./Icon";
import { LoadingProgress } from "./LoadingProgress/LoadingProgress";
import { ActionButton } from "./ActionButton";
import { Book } from "./Book/Book";
import { toKebabCase } from "../utils/toKebabCase";

const { log } = console;

function App() {
  const { size, theme } = useModes();
  const [loading, setLoading] = useState<boolean>(false);
  const [prompt, setPrompt] = useState("");
  const [book, setBook] = useState<BookProps & { responseId?: string }>();
  const [images, setImages] = useState<ImageProps[]>(initialImages);
  const [_responseIds, setResponseIds] = useState<string[]>([]);

  /**
   * Handle the generated image
   */
  const onGeneratedImage = useCallback(async (payload: EventPayload) => {
    const { data } = payload;
    const pageIndex = data?.pageIndex || 0;
    const generatedImage = data?.image;
    const filename = `${toKebabCase(
      data?.bookTitle || "image"
    )}-${pageIndex}.png`;

    log(payload, { generatedImage, filename, pageIndex, data });

    if (generatedImage?.url && (generatedImage?.url || "").length > 0) {
      log("calling uploadBase64Image...", { filename });
      const uploadImage = await uploadBase64Image(generatedImage.url, filename);
      log("uploadBase64Image results:", { uploadImage });

      setImages((prev) => {
        const images = prev.map((img, i) => {
          log("setImages map", {
            i,
            pageIndex,
            img,
            uploadImage,
            url: uploadImage.url,
          });
          if (i === pageIndex) {
            log("setImages", { uploadImage, url: uploadImage.url });
            return {
              ...generatedImage,
              url: uploadImage.url,
            };
          }

          return img;
        });

        updateImages(images);
        return images;
      });
    }
  }, []);

  const getUserInput = useCallback((event: BaseSyntheticEvent): string => {
    const form = event.target;
    const textArea = form.firstElementChild;
    return textArea.value;
  }, []);

  /**
   * Handle form submit
   */
  const onSubmit = useCallback(
    async (event: BaseSyntheticEvent) => {
      event.preventDefault();
      setLoading(true);
      events.emit("drawerclose", {});

      const userInput = getUserInput(event);
      const prompt = bookPrompt(userInput);
      const bookResponse = await generateBook(prompt);

      if (bookResponse?.data) {
        const bookCreated: typeof book = {
          ...bookResponse?.data,
          responseId: bookResponse.responseId,
        };
        setBook(bookCreated);
        updateBook(bookCreated);
        updatePrompt(userInput);
      }

      event.target.value = "";

      setLoading(false);
      events.emit("drawerclose", {});
    },
    [getUserInput]
  );

  /**
   * Handle the main action button click
   */
  const onActionClick = useCallback(() => {
    events.emit("drawer", {
      children: <Form onSubmit={onSubmit} disabled={loading} />,
    });
  }, [loading, onSubmit]);

  /**
   * Set state from browser storage
   */
  useEffect(() => {
    preloadStorage({
      getPrompt: (p) => setPrompt(p),
      getBook: (b) => setBook(b),
      getResponseIds: (h) => setResponseIds(h),
      getImages: (h) => setImages(h),
    });

    events.on("generatedimage", onGeneratedImage);
  }, [onGeneratedImage]);

  return (
    <div className="app" data-size={size} data-theme={theme}>
      {loading && <LoadingProgress />}
      {book ? (
        <>
          <Book
            book={{
              ...book,
              responseId: book.responseId || "",
            }}
            images={images}
            key="Novel"
          />
          <Drawer />
          <ActionButton onClick={onActionClick}>
            <PlusIcon />
          </ActionButton>
        </>
      ) : (
        <Form onSubmit={onSubmit} disabled={loading} defaultValue={prompt} />
      )}
    </div>
  );
}

export default App;
