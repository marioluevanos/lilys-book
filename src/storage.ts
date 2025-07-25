import { ChatCompletionMessageParam as History } from "openai/resources/index.mjs";
import { BookWImages } from "./types";
import { BOOK_W_IMAGES } from "./data/3-nights";

const USER_PROMPT = "last-user-prompt";
const HISTORY_KEY = "history";
const BOOK_KEY = "book";

export const KEYS = {
  USER_PROMPT,
  HISTORY_KEY,
  BOOK_KEY,
};

/**
 * Load from local storage
 */
export function preloadStorage(setters: {
  getBook: (payload: BookWImages | undefined) => void;
  getPrompt: (payload: string) => void;
  getHistory: (payload: History[]) => void;
}) {
  const { getBook, getHistory, getPrompt } = setters;

  try {
    const prompt = localStorage.getItem(USER_PROMPT);
    if (typeof prompt === "string" && prompt !== "undefined") {
      getPrompt(prompt);
    }
  } catch (error) {
    console.warn(error);
  }

  const savedHistory = localStorage.getItem(HISTORY_KEY);
  if (savedHistory) {
    try {
      const history = JSON.parse(savedHistory);
      if (Array.isArray(history)) {
        getHistory(history);
      }
    } catch (error) {
      console.warn(error);
    }
  }

  const savedBook = localStorage.getItem(BOOK_KEY);
  if (savedBook) {
    try {
      const story = JSON.parse(savedBook);

      if (story && typeof story === "object") {
        getBook(story);
      }
    } catch (error) {
      console.warn(error);
    }
  } else {
    getBook(BOOK_W_IMAGES);
    localStorage.setItem(KEYS.BOOK_KEY, JSON.stringify(BOOK_W_IMAGES));
  }
}
