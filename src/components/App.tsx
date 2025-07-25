import { BaseSyntheticEvent, useCallback, useEffect, useState } from "react";
import { createBookProps, getBook, updateHistory } from "../library";
import { useModes } from "../hooks/useModes";
import { BookWImages, History } from "../types";
import { system } from "../system";
import { preloadStorage } from "../storage";
import { Form } from "./Form/Form";
import { MessageHistory } from "./MessageHistory/MessageHistory";
import { Book } from "./Book/Book";
import { Drawer } from "./Drawer/Drawer";
import { ActionButton } from "./Button/ActionButton";

function App() {
  const { size, theme } = useModes();
  const [loadingProgress, setLoadingProgress] = useState<number>(1);
  const loading = loadingProgress !== 1;
  const [prompt, setPrompt] = useState("");
  const [book, setBook] = useState<BookWImages>();
  const [history, setHistory] = useState<History[]>([system.initial]);
  const [isFormActive, setIsFormActive] = useState<boolean>(false);

  const getFormInput = useCallback((event: BaseSyntheticEvent) => {
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

      setLoadingProgress((prev) => prev + 1);

      const input = getFormInput(event);
      const { bookResponse, userHistory } = await getBook(input, history);
      console.log({ bookResponse, userHistory });
      const bookCreated = await createBookProps(bookResponse, book);

      setBook(bookCreated);
      setHistory((prev) => updateHistory(userHistory, bookResponse, prev));
      setLoadingProgress(1);

      event.target.value = "";
    },
    [history, book]
  );

  /**
   * Run preload
   */
  useEffect(() => {
    preloadStorage({
      getPrompt: (p) => setPrompt(p),
      getBook: (b) => setBook(b),
      getHistory: (h) => setHistory(h),
    });
  }, []);

  return (
    <div className="app" data-size={size} data-theme={theme}>
      {loadingProgress === 1 ? "" : `Progress: ${100 * loadingProgress}%`}
      <MessageHistory history={history} />
      {book && <Book book={book} />}
      <Drawer open={isFormActive}>
        <Form onSubmit={onSubmit} disabled={loading} defaultValue={prompt} />
      </Drawer>
      <ActionButton onClick={() => setIsFormActive(true)}>+</ActionButton>
    </div>
  );
}

export default App;
