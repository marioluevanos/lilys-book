import { BaseSyntheticEvent, useCallback, useEffect, useState } from "react";
import { createBookProps, generateBook, uploadBase64Image } from "../library";
import { useModes } from "../hooks/useModes";
import { Book, BookResponse, History, Image } from "../types";
import { initialImages, system } from "../system";
import {
  preloadStorage,
  updateBook,
  updateHistory,
  updateImages,
  updatePrompt,
} from "../storage";
import { Form } from "./Form/Form";
import { Novel } from "./Novel/Novel";
import { Drawer } from "./Drawer/Drawer";
import { EventPayload, events } from "../events";
import { PlusIcon } from "./Icon";
import { LoadingProgress } from "./LoadingProgress/LoadingProgress";
import { ActionButton } from "./ActionButton";

function App() {
  const { size, theme } = useModes();
  const [loading, setLoading] = useState<boolean>(false);
  const [prompt, setPrompt] = useState("");
  const [book, setBook] = useState<Book>();
  const [images, setImages] = useState<Image[]>(initialImages);
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
      console.log(generatedImage);
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
        updateImages(images);
        return images;
      });
    }
  }, []);

  /**
   * Merge new chat history with old chat history
   */
  const mergeHistory = useCallback(
    (
      prevHistory: History[],
      history: History,
      bookResponse: BookResponse | undefined
    ): History[] => {
      return [
        ...prevHistory,
        history,
        {
          role: "assistant",
          content: bookResponse?.response?.content,
        },
      ];
    },
    []
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

      const input = getUserInput(event);
      const { bookResponse, userHistory } = await generateBook(
        { summary: input, numberOfPages: initialImages.length },
        history
      );
      const bookCreated = await createBookProps(bookResponse);
      const historyWithBook = mergeHistory(history, userHistory, bookResponse);

      setBook(bookCreated);
      setHistory(historyWithBook);

      updateBook(bookCreated);
      updateHistory(historyWithBook);
      updatePrompt(input);

      event.target.value = "";

      setLoading(false);
      events.emit("drawerclose", {});
    },
    [history, getUserInput, mergeHistory]
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
  }, []);

  return (
    <div className="app" data-size={size} data-theme={theme}>
      <LoadingProgress progress={loading} />
      {book ? (
        <>
          <Novel book={book} images={images} key="Novel" />
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
