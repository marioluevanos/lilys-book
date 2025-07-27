import { ChatCompletionMessageParam as History } from "openai/resources/index.mjs";
import { Book, BookWImages } from "./types";

const PROMPT_KEY = "prompt";
const HISTORY_KEY = "history";
const BOOK_KEY = "book";

export const KEYS = {
  PROMPT_KEY,
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
    const prompt = localStorage.getItem(PROMPT_KEY);
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
  }
}

export function updateHistory(history: History[] | undefined) {
  if (Array.isArray(history)) {
    localStorage.setItem(KEYS.HISTORY_KEY, JSON.stringify(history));
  }
}

export function updateBook(bookCreated: Book | undefined) {
  if (bookCreated) {
    localStorage.setItem(KEYS.BOOK_KEY, JSON.stringify(bookCreated));
    return bookCreated;
  }
}

export function updatePrompt(prompt: string | undefined) {
  if (prompt) {
    localStorage.setItem(KEYS.PROMPT_KEY, prompt);
  }
}
