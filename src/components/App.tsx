import { BaseSyntheticEvent, useCallback, useEffect, useState } from "react";
import {
  createBookProps,
  generatePageWithImage,
  getBook,
  updateHistory,
} from "../library";
import { useModes } from "../hooks/useModes";
import { BookWImages, History, PageWImage } from "../types";
import { system } from "../system";
import { KEYS, preloadStorage } from "../storage";
import { Form } from "./Form/Form";
import { Book } from "./Book/Book";
import { Drawer } from "./Drawer/Drawer";
import { ActionButton } from "./Button/ActionButton";
import { events } from "../events";
import { PlusIcon } from "./Icon";
import { LoadingProgress } from "./LoadingProgress/LoadingProgress";

function App() {
  const { size, theme } = useModes();
  const [loading, setLoading] = useState<boolean>(false);
  const [prompt, setPrompt] = useState("");
  const [book, setBook] = useState<BookWImages>();
  const [history, setHistory] = useState<History[]>([system.initial]);
  const [pageIndex, setPageIndex] = useState(0);
  const currentPage = book?.pages[pageIndex] as PageWImage | undefined;

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

      setLoading(true);

      const input = getFormInput(event);
      const { bookResponse, userHistory } = await getBook(input, history);
      const bookCreated = await createBookProps(bookResponse);

      setBook(bookCreated);
      setHistory((prev) => updateHistory(userHistory, bookResponse, prev));
      setLoading(false);

      event.target.value = "";
    },
    [history, getFormInput]
  );

  const onActionClick = useCallback(() => {
    events.emit("drawer", {
      children: (
        <Form onSubmit={onSubmit} disabled={loading} defaultValue={prompt} />
      ),
    });
  }, [loading, onSubmit, prompt]);

  const onPageChange = useCallback(
    (event: BaseSyntheticEvent) => {
      event.preventDefault();
      const btn = event.target as HTMLButtonElement;
      const { dir, active } = btn.dataset;

      setPageIndex((prev) => {
        if (dir === "prev" && book) {
          return prev === 0 ? 0 : prev - 1;
        }
        if (dir === "next" && book) {
          return prev === book.pages.length - 1
            ? book.pages.length - 1
            : prev + 1;
        }
        return prev;
      });

      if (book) {
        if (Number(active) === 0 && btn.classList.contains("prev")) {
          events.emit("drawer", {
            children: (
              <div className="cover">
                <h1>{book.title}</h1>
              </div>
            ),
          });
        }

        if (
          Number(active) === book?.pages.length - 1 &&
          btn.classList.contains("next")
        ) {
          events.emit("drawer", {
            children: (
              <div className="fact">
                <h2>It's a Fact</h2>
                <p className="content">{book.randomFact}</p>
              </div>
            ),
          });
        }
      }
    },
    [book]
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

  /**
   * Run preload
   */
  useEffect(() => {
    if (currentPage) {
      updatePageImage(currentPage);
    }

    async function updatePageImage(page: PageWImage) {
      setLoading(true);

      try {
        const hasImage = typeof page.image?.url === "string";

        if (!hasImage) {
          const p = await generatePageWithImage(page);
          setBook((prev) => {
            const updated = {
              title: prev?.title || "",
              randomFact: prev?.randomFact || "",
              pages: [
                p,
                ...(prev?.pages.slice(1, prev.pages.length - 1) || []),
              ],
            };

            localStorage.setItem(KEYS.BOOK_KEY, JSON.stringify(updated));
            return updated;
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
  }, [book, currentPage]);

  return (
    <div className="app" data-size={size} data-theme={theme}>
      <LoadingProgress progress={loading} />
      {book ? (
        <>
          <Book pageIndex={pageIndex} book={book} onPageChange={onPageChange} />
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
