import "./Book.css";
import { BookWImages, PageWImage } from "../../types";
import {
  BaseSyntheticEvent,
  FC,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button } from "../Button/Button";
import { useBookObserver } from "./useBookObserver";
import { generatePageWithImage } from "../../library";
import { cn } from "../../utils/cn";
import { events } from "../../events";

export const Book: FC<{
  book: BookWImages;
}> = (props) => {
  const { book } = props;
  const bookRef = useRef<HTMLOListElement>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const { pagesRef, pageIndex, bookProgress, onPageChange } = useBookObserver();

  /**
   * Generate an image for the page, and
   *   1. Update state and
   *   2. Update browser storage
   */
  const updatePageWithImage = useCallback(async (page: PageWImage) => {
    try {
      const hasImage = typeof page.image?.url === "string";
      console.log({ page });
      if (!hasImage) {
        setIsGeneratingImage(true);
        const pageWImage = await generatePageWithImage(page);
        events.emit("genratedimage", { data: { pageWImage, book } });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingImage(false);
    }
  }, []);

  if (typeof updatePageWithImage === "function") {
    //
  }

  /**
   * Handle generate image click
   */
  const onGenerateImage = useCallback(
    (event: BaseSyntheticEvent) => {
      event.preventDefault();
      const currentPage = book.pages[pageIndex];
      if (currentPage) updatePageWithImage(currentPage);
    },
    [updatePageWithImage, book, pageIndex]
  );

  useEffect(() => {
    if (bookRef.current) {
      bookRef.current.scrollTo({
        left: pageIndex * window.innerWidth,
        behavior: "smooth",
      });
    }
  }, [pageIndex]);

  return (
    <main id="book">
      <div
        className="book-progress"
        style={{
          background: "var(--accent)",
          height: "4px",
          width: "100%",
          position: "fixed",
          top: "0",
          left: "0",
          right: "0",
          transform: `scaleX(${bookProgress})`,
          transition: "0.3s var(--ease-in-out-sine)",
          transformOrigin: "0% 0%",
        }}
      >
        {bookProgress}
      </div>
      <p className="page-number">{pageIndex + 1}</p>
      <ol className="h-scroll book">
        {book.pages.map((page, i) => (
          <li
            key={page.synopsis}
            className="h-scroll-section page"
            data-page-index={String(i)}
            ref={(el) => el && (pagesRef.current[i] = el)}
          >
            {page.image?.url ? (
              <figure className="art">
                <img
                  key={page.synopsis}
                  alt={page.synopsis}
                  src={page.image.url}
                  width={512}
                  height={512}
                />
              </figure>
            ) : (
              <div className="cta">
                <Button
                  onClick={onGenerateImage}
                  disabled={isGeneratingImage}
                  className={cn(isGeneratingImage && "loading")}
                >
                  Generate Image
                </Button>
              </div>
            )}
            <p className="content">{page.content}</p>
          </li>
        ))}
      </ol>
      <nav className="book-nav" style={{ display: "none" }}>
        <button
          onClick={onPageChange}
          data-active={pageIndex}
          data-dir="prev"
          className="prev"
        >
          Prev
        </button>
        <button
          onClick={onPageChange}
          data-active={pageIndex}
          data-dir="next"
          className="next"
        >
          Next
        </button>
      </nav>
    </main>
  );
};
