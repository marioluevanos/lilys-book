import { BookDB, ImageProps } from "./types";

const PROMPT_KEY = "prompt";
const IMAGES_KEY = "images";
const BOOK_KEY = "book";

export const KEYS = {
  PROMPT_KEY,
  BOOK_KEY,
  IMAGES_KEY,
};

/**
 * Load from local storage
 */
export function preloadStorage(setters: {
  getBookIds: (payload: Array<number | string> | undefined) => void;
  getPrompt: (payload: string) => void;
  getImages: (payload: ImageProps[]) => void;
}) {
  const { getBookIds, getPrompt, getImages } = setters;

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

  const savedImages = localStorage.getItem(IMAGES_KEY);
  if (savedImages) {
    try {
      const images = JSON.parse(savedImages);
      if (Array.isArray(images)) {
        getImages(images);
      }
    } catch (error) {
      console.warn(error);
    }
  }
}

export function updateBookStorage(bookCreated: BookDB | undefined) {
  if (bookCreated) {
    localStorage.setItem(KEYS.BOOK_KEY, JSON.stringify([bookCreated.id]));
    return bookCreated;
  } else {
    localStorage.removeItem(KEYS.BOOK_KEY);
  }
}

export function updatePrompt(prompt: string | undefined) {
  if (prompt) {
    localStorage.setItem(KEYS.PROMPT_KEY, prompt);
  }
}

export function updateImageStorage(
  images: Record<number, ImageProps> | undefined
) {
  if (images) {
    localStorage.setItem(KEYS.IMAGES_KEY, JSON.stringify(images));
  }
}
