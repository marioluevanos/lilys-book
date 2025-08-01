import { BookDB } from "./types";

const PROMPT_KEY = "prompt";
const BOOK_KEY = "book";

export const KEYS = {
  PROMPT_KEY,
  BOOK_KEY,
};

/**
 * Load from local storage
 */
export function preloadStorage(setters: {
  getBookIds: (payload: Array<number | string> | undefined) => void;
  getPrompt: (payload: string) => void;
}) {
  const { getBookIds, getPrompt } = setters;

  try {
    const prompt = localStorage.getItem(PROMPT_KEY);
    if (typeof prompt === "string" && prompt !== "undefined") {
      getPrompt(prompt);
    }
  } catch (error) {
    console.warn(error);
  }

  const savedBook = localStorage.getItem(BOOK_KEY);
  if (savedBook) {
    try {
      const story: Array<number | string> = JSON.parse(savedBook);

      if (Array.isArray(story)) {
        getBookIds(story);
      }
    } catch (error) {
      console.warn(error);
    }
  }
}

export function updateBookStorage(_bookCreated: BookDB | undefined) {
  // if (bookCreated) {
  //   localStorage.setItem(KEYS.BOOK_KEY, JSON.stringify([bookCreated.id]));
  //   return bookCreated;
  // } else {
  //   localStorage.removeItem(KEYS.BOOK_KEY);
  // }
}

export function updatePrompt(prompt: string | undefined) {
  if (prompt) {
    localStorage.setItem(KEYS.PROMPT_KEY, prompt);
  }
}
