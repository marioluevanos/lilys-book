import { ChatCompletionMessageParam as History } from "openai/resources/index.mjs";
import { BookWImages } from "./types";
import { BOOK_W_IMAGES } from "./data";

export const USER_PROMPT = "last-user-prompt";
export const HISTORY_KEY = "history";
export const PAGES_KEY = "pages";

/**
 * Load from local storage
 */
export function preloadStorage(setters: {
  setBook: React.Dispatch<React.SetStateAction<BookWImages | undefined>>;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  setHistory: React.Dispatch<React.SetStateAction<History[]>>;
}) {
  const { setBook, setHistory, setPrompt } = setters;

  try {
    const prompt = localStorage.getItem(USER_PROMPT);
    if (typeof prompt === "string" && prompt !== "undefined") {
      setPrompt(prompt);
    }
  } catch (error) {
    console.warn(error);
  }

  const savedHistory = localStorage.getItem(HISTORY_KEY);
  if (savedHistory) {
    try {
      const history = JSON.parse(savedHistory);
      if (Array.isArray(history)) {
        setHistory(history);
      }
    } catch (error) {
      console.warn(error);
    }
  }

  const savedChapters = localStorage.getItem(PAGES_KEY);
  if (savedChapters) {
    try {
      const story = JSON.parse(savedChapters);

      console.log({ BOOK_W_IMAGES, story });
      if (story && typeof story === "object") {
        setBook(story);
      }
    } catch (error) {
      console.warn(error);
    }
  } else {
    setBook(BOOK_W_IMAGES);
  }
}
