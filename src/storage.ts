import { InputOptions } from "./types";

const PROMPT_KEY = "prompt";

export const KEYS = {
  PROMPT_KEY,
};

/**
 * Load from local storage
 */
export function preloadStorage(setters: {
  getPrompt: (payload: InputOptions) => void;
}) {
  const { getPrompt } = setters;

  try {
    const prompt = localStorage.getItem(PROMPT_KEY);
    if (typeof prompt === "string" && prompt !== "undefined") {
      getPrompt(JSON.parse(prompt));
    }
  } catch (error) {
    console.warn(error);
  }
}

export function updatePrompt(args: InputOptions | undefined) {
  if (args) {
    localStorage.setItem(KEYS.PROMPT_KEY, JSON.stringify(args));
  }
}
