import {
  useRef,
  useEffect,
  useCallback,
  useState,
  BaseSyntheticEvent,
} from "react";
import { events } from "../../events";

/**
 * Intersection Observer for the BookProps
 */
export function useBookObserver() {
  const pagesRef = useRef<HTMLElement[]>([]);
  const [pageIndex, setPageIndex] = useState(0);

  /**w
   * For each Intersection Observer, add onScrollPosition callback
   */
  const onIntersection = useCallback(
    ({ intersectionRatio, target }: IntersectionObserverEntry) => {
      const elementInViewport = intersectionRatio >= 0.5;

      if (elementInViewport) {
        const li = target as HTMLLIElement;
        const { pageIndex } = li.dataset;
        if (pageIndex && !isNaN(+pageIndex)) {
          setPageIndex(+pageIndex);
        }
      }
    },
    []
  );

  /**
   * Handle on page change clicks
   */
  const onPageChange = useCallback((event: BaseSyntheticEvent) => {
    event.preventDefault();
    const btn = event.target;
    const { dir } = btn.dataset;
    const pages = pagesRef.current;

    setPageIndex((prev) => {
      if (dir === "prev") {
        return prev === 0 ? 0 : prev - 1;
      }
      if (dir === "next") {
        return prev === pages.length - 1 ? pages.length - 1 : prev + 1;
      }
      return prev;
    });
  }, []);

  /**
   * Handle on page change clicks
   */
  const onNextClick = useCallback(
    (event: BaseSyntheticEvent) => {
      event.preventDefault();
      const parent = pagesRef.current[0].parentElement;
      if (parent) {
        parent.scrollTo({
          left: (pageIndex + 1) * window.innerWidth,
          behavior: "smooth",
        });
      }
    },
    [pageIndex]
  );

  /**
   * Observe the scroll for each accordion item
   */
  useEffect(() => {
    const observers = pagesRef.current.map((element) => {
      return initObserver(element, onIntersection);
    });

    return () => {
      observers.forEach((io) => io.disconnect());
    };
  }, [onIntersection]);

  useEffect(() => {
    events.emit("pagechange", +pageIndex);
  }, [pageIndex]);

  return {
    pagesRef,
    pageIndex,
    onNextClick,
    onPageChange,
    get bookProgress() {
      return pageIndex / (pagesRef.current.length - 1);
    },
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
    rootMargin: "0px",
    threshold: [0, 0.25, 0.5, 0.75, 1],
  };

  const callback = (entries: IntersectionObserverEntry[]) =>
    entries.forEach(entriesCallback);

  const observer = new IntersectionObserver(callback, options);

  if (!target) return observer;

  observer.observe(target);

  return observer;
}
