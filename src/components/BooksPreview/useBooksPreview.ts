import { useRef, useEffect } from "react";

/**
 * Intersection Observer for the BookProps
 */
export function useBooksPreview(
  length: number,
  callback: (event: IntersectionObserverEntry) => void
) {
  const booksRef = useRef<HTMLElement[]>([]);

  /**
   * Observe the scroll for each accordion item
   */
  useEffect(() => {
    if (length) {
      const observers = booksRef.current.map((element) => {
        return initObserver(element, callback);
      });

      return () => {
        observers.forEach((io) => io.disconnect());
      };
    }
  }, [callback, length]);

  return {
    booksRef,
  };
}

/**
 * Intersection Observer API initialization
 */
function initObserver(
  target: HTMLElement | null,
  entriesCallback: (entry: IntersectionObserverEntry) => void
) {
  const options = {
    rootMargin: "0px -50% 0px -50%",
    threshold: [0, 0.25, 0.5, 0.75, 1],
  };

  const callback = (entries: IntersectionObserverEntry[]) =>
    entries.forEach(entriesCallback);

  const observer = new IntersectionObserver(callback, options);

  if (!target) return observer;

  observer.observe(target);

  return observer;
}
