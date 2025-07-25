import { BaseSyntheticEvent, useCallback, useEffect, useState } from "react";
import { createMessage, generatePage, requestBook } from "../openai";
import { useModes } from "../hooks/useModes";
import { BookWImages, History } from "../types";
import { system, userPrompt } from "../system";
import { HISTORY_KEY, preloadStorage, USER_PROMPT } from "../storage";
import { Form } from "./Form/Form";
import { MessageHistory } from "./MessageHistory/MessageHistory";
import { Book } from "./Book/Book";

const NUMBER_OF_PAGES = 12;

function App() {
  const { size, theme } = useModes();
  const [loadingProgress, setLoadingProgress] = useState<number>(1);
  const loading = loadingProgress !== 1;
  const [prompt, setPrompt] = useState("");
  const [book, setBook] = useState<BookWImages>();
  const [history, setHistory] = useState<History[]>([system.initial]);

  /**
   * Handle form submit
   */
  const onSubmit = useCallback(
    async (event: BaseSyntheticEvent) => {
      event.preventDefault();

      setLoadingProgress((prev) => prev + 1);

      const form = event.target as HTMLFormElement;
      const formInput = form.firstElementChild as HTMLTextAreaElement;

      localStorage.setItem(USER_PROMPT, formInput.value);

      const engineeredPrompt = userPrompt({
        summary: formInput.value,
        numberOfPages: NUMBER_OF_PAGES,
      });

      console.log({ engineeredPrompt });

      const userInput = createMessage(engineeredPrompt);

      const bookResponse = await requestBook(history, userInput);

      if (bookResponse?.content && bookResponse.response) {
        const bookCreated: BookWImages = {
          title: bookResponse.content.title,
          pages: await Promise.all(
            bookResponse.content.pages.map((ch, idx) => {
              const p = book?.pages[idx - 1];
              const previousResponseId = p?.image?.id;
              return generatePage(ch, previousResponseId);
            })
          ),
          randomFact: bookResponse.content.randomFact,
        };

        setBook(bookCreated);
      }

      setHistory((prev) => {
        const payload: typeof prev = [
          ...prev,
          userInput,
          {
            role: "assistant",
            content: bookResponse?.response?.content,
          },
        ];
        localStorage.setItem(HISTORY_KEY, JSON.stringify(payload));
        return payload;
      });

      formInput.value = "";

      setLoadingProgress(1);
    },
    [history, book]
  );

  /**
   * Run preload
   */
  useEffect(() => {
    preloadStorage({
      setPrompt,
      setBook,
      setHistory,
    });
  }, []);

  return (
    <div className="app" data-size={size} data-theme={theme}>
      {loadingProgress === 1 ? "" : `Progress: ${100 * loadingProgress}%`}

      <MessageHistory history={history} />

      {book && (
        <main>
          <Book book={book} />
        </main>
      )}
      <Form onSubmit={onSubmit} disabled={loading} defaultValue={prompt} />
    </div>
  );
}

export default App;
