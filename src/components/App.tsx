import { BaseSyntheticEvent, useCallback, useEffect, useState } from "react";
import {
  generateBook,
  getBookDB,
  updateBookDB,
  uploadBase64ImageDB,
  uploadBookDB,
} from "../library";
import { useModes } from "../hooks/useModes";
import { BookDB, ImageProps } from "../types";
import { initialImages, bookPrompt } from "../system";
import { preloadStorage, updateBookStorage, updatePrompt } from "../storage";
import { Form } from "./Form/Form";
import { Drawer } from "./Drawer/Drawer";
import { EventMap, events } from "../events";
import { LoadingProgress } from "./LoadingProgress/LoadingProgress";
import { ActionButton } from "./ActionButton";
import { Book } from "./Book/Book";
import { toKebabCase } from "../utils/toKebabCase";

const { log } = console;

function App() {
  const { size, theme } = useModes();
  const [loading, setLoading] = useState<boolean>(false);
  const [prompt, setPrompt] = useState("");
  const [book, setBook] = useState<BookDB & { responseId?: string }>();
  const [images, setImages] = useState<ImageProps[]>(initialImages);

  const onPageChange = useCallback(
    (payload: EventMap["pagechange"]) => {
      const currentImage = images[payload.data];
      const currentImageId = book?.pages[payload.data];

      if (!currentImage.url) {
        //
      }
      console.log(payload, { currentImage, currentImageId });
    },
    [images, book]
  );
  /**
   * Handle the generated image
   */
  const onGeneratedImage = useCallback(
    async (payload: EventMap["generatedimage"]) => {
      const { data } = payload;
      const pageIndex = data?.pageIndex || 0;
      const generatedImage = data?.image;
      const filename = `${toKebabCase(
        data?.bookTitle || "image"
      )}-${pageIndex}.png`;

      log(payload, { generatedImage, filename, pageIndex, data });

      if (generatedImage?.url && (generatedImage?.url || "").length > 0) {
        log("calling uploadBase64Image...", { generatedImage, filename });
        const uploadImage = await uploadBase64ImageDB(
          generatedImage.url,
          filename,
          generatedImage.responseId
        );
        log("uploadBase64Image results:", { uploadImage });

        if (book && book.id) {
          const pageToUpdate = book.pages[pageIndex];
          if (pageToUpdate) {
            pageToUpdate.imageId = uploadImage.id;
            pageToUpdate.responseId = generatedImage.responseId;
          }

          console.log({ pageToUpdate, bookId: book.id });

          const bookUpdated = {
            ...book,
            pages: book.pages.map((p, i) => {
              return i === pageIndex ? pageToUpdate : p;
            }),
          };

          console.log("bookUpdated", bookUpdated);

          const bookImageUpdated = await updateBookDB(bookUpdated, book.id);
          updateBookStorage(bookImageUpdated);
          setBook(bookImageUpdated);

          setImages((prev) =>
            prev.map((img, i) => {
              if (i === pageIndex) {
                log("setImages", { uploadImage, url: uploadImage.url });
                return {
                  ...generatedImage,
                  url: uploadImage.url,
                };
              }

              return img;
            })
          );
        }
      }
    },
    [book]
  );

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
      const prompt = bookPrompt(userInput);

      updatePrompt(userInput);

      const bookResponse = await generateBook(prompt);

      if (bookResponse?.data) {
        const bookCreated: typeof book = {
          ...bookResponse?.data,
          responseId: bookResponse.responseId,
        };
        const bookUploaded = await uploadBookDB(bookCreated);
        setBook(bookUploaded);
        updateBookStorage(bookUploaded);
      }

      event.target.value = "";

      setLoading(false);
      events.emit("drawerclose", undefined);
      events.emit("generatedbook", undefined);
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
    events.on("generatedimage", onGeneratedImage);
    events.on("pagechange", onPageChange);
  }, [onGeneratedImage, onPageChange]);

  /**
   * Set state from browser storage
   */
  useEffect(() => {
    preloadStorage({
      getPrompt: (p) => setPrompt(p),
      getBookIds: async (b) => {
        if (!book) {
          try {
            const promises = (b || []).map((id) => getBookDB(id));
            if (promises.some((v) => v)) {
              const responses = await Promise.all(promises);

              if (responses.some((v) => v)) {
                const [dbBook] = responses;

                if (dbBook) {
                  console.log(dbBook);
                  setBook(dbBook as BookDB);
                }
              } else {
                updateBookStorage(undefined);
              }
            }
          } catch (error) {
            log(error);
            updateBookStorage(undefined);
          }
        }
      },
      getImages: (h) => setImages(h),
    });
  }, [book]);

  // useEffect(() => {
  //   updateImageStorage(images);
  // }, [images]);

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
            form={<Form onSubmit={onSubmit} disabled={loading} />}
          />
          <Drawer />
          <ActionButton onClick={onActionClick} />
        </>
      ) : (
        <Form onSubmit={onSubmit} disabled={loading} defaultValue={prompt} />
      )}
    </div>
  );
}

export default App;
