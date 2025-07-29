import { BookProps, ImageProps } from "./types";

const PROMPT_KEY = "prompt";
const RESPONSE_IDS_KEY = "responseIds";
const IMAGES_KEY = "images";
const BOOK_KEY = "book";

export const KEYS = {
  PROMPT_KEY,
  RESPONSE_IDS_KEY,
  BOOK_KEY,
  IMAGES_KEY,
};

/**
 * Load from local storage
 */
export function preloadStorage(setters: {
  getBook: (payload: BookProps | undefined) => void;
  getPrompt: (payload: string) => void;
  getResponseIds: (payload: string[]) => void;
  getImages: (payload: ImageProps[]) => void;
}) {
  const { getBook, getResponseIds, getPrompt, getImages } = setters;

  try {
    const prompt = localStorage.getItem(PROMPT_KEY);
    if (typeof prompt === "string" && prompt !== "undefined") {
      getPrompt(prompt);
    }
  } catch (error) {
    console.warn(error);
  }

  const savedHistory = localStorage.getItem(RESPONSE_IDS_KEY);
  if (savedHistory) {
    try {
      const responseIds = JSON.parse(savedHistory);
      if (Array.isArray(responseIds)) {
        getResponseIds(responseIds);
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

export function updateResponseIds(responseIds: string[] | undefined) {
  if (Array.isArray(responseIds)) {
    localStorage.setItem(KEYS.RESPONSE_IDS_KEY, JSON.stringify(responseIds));
  }
}

export function updateBook(bookCreated: BookProps | undefined) {
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

export function updateImages(images: Record<number, ImageProps> | undefined) {
  if (images) {
    localStorage.setItem(KEYS.IMAGES_KEY, JSON.stringify(images));
  }
}
