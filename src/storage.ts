import { StorageOptions } from "./types";

const SETTINGS = "settings";

export const KEYS = {
  SETTINGS,
};

export function getOptions(): StorageOptions | undefined {
  try {
    const settings = localStorage.getItem(SETTINGS);
    if (typeof settings === "string" && settings !== "undefined") {
      return JSON.parse(settings);
    }
  } catch (error) {
    console.warn(error);
  }
}

/**
 * Load from local storage
 */
export function preloadStorage(setters: {
  getSettings: (payload: StorageOptions) => void;
}) {
  const { getSettings } = setters;
  const options = getOptions();
  if (options) getSettings(options);
}

export function updateUserOptions(args: StorageOptions | undefined) {
  if (args) {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(args));
  }
}
