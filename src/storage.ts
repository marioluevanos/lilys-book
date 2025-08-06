import { StorageOptions } from "./types";

const SETTINGS = "settings";

export const KEYS = {
  SETTINGS,
};

export function getStorageOptions(): StorageOptions | undefined {
  try {
    const settings = localStorage.getItem(SETTINGS);
    if (typeof settings === "string" && settings !== "undefined") {
      return JSON.parse(settings);
    }
  } catch (error) {
    console.warn(error);
  }
}

export function setStorageOptions(args: StorageOptions | undefined) {
  if (typeof args === "object") {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(args));
  } else {
    localStorage.removeItem(KEYS.SETTINGS);
  }
}
