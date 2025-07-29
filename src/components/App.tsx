import { BaseSyntheticEvent, useCallback, useEffect, useState } from "react";
import { generateBook, uploadBase64Image } from "../library";
import { useModes } from "../hooks/useModes";
import { BookProps, History, ImageProps } from "../types";
import { initialImages, system, bookPrompt } from "../system";
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

function App() {
  const { size, theme } = useModes();
  const [loading, setLoading] = useState<boolean>(false);
  const [prompt, setPrompt] = useState("");
  const [book, setBook] = useState<BookProps & { responseId?: string }>();
  const [images, setImages] = useState<ImageProps[]>(initialImages);
  const [history, setHistory] = useState<History[]>([system.initial]);

  /**
   * Handle the generated image
   */
  const onGeneratedImage = useCallback(async (payload: EventPayload) => {
    const { data } = payload;

    console.log("onGeneratedImage", data);
    const pageIndex = data?.pageIndex || 0;
    const generatedImage = data?.image;

    if (generatedImage?.url && (generatedImage?.url || "").length > 0) {
      console.log({ generatedImage });
      const uploadImage = await uploadBase64Image(generatedImage.url);

      setImages((prev) => {
        const images = prev.map((img, i) => {
          if (i === pageIndex) {
            return {
              ...generatedImage,
              url: uploadImage.url,
            };
          }
          return img;
        });

        console.log({ images });
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

      const userInput = getUserInput(event);
      const bookResponse = await generateBook(bookPrompt(userInput));

      if (bookResponse?.data) {
        const bookCreated: typeof book = {
          ...bookResponse?.data,
          responseId: bookResponse.responseId,
        };
        setBook(bookCreated);
        // setHistory()
        updateBook(bookCreated);
        updatePrompt(userInput);
      }

      event.target.value = "";

      setLoading(false);
      events.emit("drawerclose", {});
    },
    [history, getUserInput]
  );

  /**
   * Handle the main action button click
   */
  const onActionClick = useCallback(() => {
    events.emit("drawer", {
      children: (
        <Form onSubmit={onSubmit} disabled={loading} defaultValue={prompt} />
      ),
    });
  }, [loading, onSubmit, prompt]);

  /**
   * Set state from browser storage
   */
  useEffect(() => {
    preloadStorage({
      getPrompt: (p) => setPrompt(p),
      getBook: (b) => setBook(b),
      getHistory: (h) => setHistory(h),
      getImages: (h) => setImages(h),
    });

    events.on("genratedimage", onGeneratedImage);
  }, [onGeneratedImage]);

  return (
    <div className="app" data-size={size} data-theme={theme}>
      <LoadingProgress progress={loading} />
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
          <ActionButton onClick={onActionClick} style={{ display: "none" }}>
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
