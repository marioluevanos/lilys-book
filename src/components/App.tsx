import { BaseSyntheticEvent, useCallback, useEffect, useState } from "react";
import { createBookProps, generateBook } from "../library";
import { useModes } from "../hooks/useModes";
import { Book, BookResponse, History, Image } from "../types";
import { system } from "../system";
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
import { ActionButton } from "./Button/ActionButton";
import { EventPayload, events } from "../events";
import { PlusIcon } from "./Icon";
import { LoadingProgress } from "./LoadingProgress/LoadingProgress";

function App() {
  const { size, theme } = useModes();
  const [loading, setLoading] = useState<boolean>(false);
  const [prompt, setPrompt] = useState("");
  const [book, setBook] = useState<Book>();
  const [images, setImages] = useState<Image[]>(
    Array.from({ length: book?.pages.length || 0 }, () => ({
      responseId: "",
      url: "",
    }))
  );
  const [history, setHistory] = useState<History[]>([system.initial]);

  /**
   * Handle the generated image
   */
  const onGeneratedImage = useCallback(
    (payload: EventPayload) => {
      const { data } = payload;

      console.log("onGeneratedImage", { data });
      const pIndex = data?.pageIndex || 0;

      if (data?.image) {
        const newImages = images.map((p, i) => {
          if (i === pIndex) {
            return data.image;
          }
          return p;
        });

        console.log({ newImages });

        updateImages(newImages);
        setImages(newImages);
      }
    },
    [images]
  );

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

  const getUserInput = useCallback((event: BaseSyntheticEvent) => {
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
      const { bookResponse, userHistory } = await generateBook(input, history);
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
