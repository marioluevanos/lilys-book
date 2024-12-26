import { useState, useEffect, useCallback } from "react";
import { useMediaQuery } from "./useMediaQuery";

type ModeSize = "small" | "large";

export function useModes() {
  const [size, setSize] = useState<ModeSize>("small");
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const isDark = useMediaQuery("(prefers-color-scheme: dark)");

  const getSize = useCallback((isDesktop: boolean): ModeSize => {
    return isDesktop ? "large" : "small";
  }, []);

  useEffect(() => {
    setSize(getSize(isDesktop));
  }, [isDesktop, getSize]);

  return {
    size,
    theme: isDark ? "dark" : "light",
  };
}
