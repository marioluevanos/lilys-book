import { ChatCompletionMessageParam as History } from "openai/resources/index.mjs";
import { BookWImages } from "./types";
import { BOOK_W_IMAGES } from "./data/hello-kitty";

const USER_PROMPT = "last-user-prompt";
const HISTORY_KEY = "history";
const PAGES_KEY = "pages";

export const KEYS = {
  USER_PROMPT,
  HISTORY_KEY,
  PAGES_KEY,
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

  const savedChapters = localStorage.getItem(PAGES_KEY);
  if (savedChapters) {
    try {
      const story = JSON.parse(savedChapters);

      console.log({ BOOK_W_IMAGES, story });
      if (story && typeof story === "object") {
        getBook(story);
      }
    } catch (error) {
      console.warn(error);
    }
  } else {
    getBook(BOOK_W_IMAGES);
  }
}
