import "./Book.css";
import { BookProps, ImageProps, PageProps } from "../../types";
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
import { cn } from "../../utils/cn";
import { events } from "../../events";
import { BookProgress } from "./BookProgress";
import { generateImage } from "../../library";
import { imagePrompt } from "../../system";
import { ImageAddIcon } from "../Icon";

const { log } = console;

type NovelProps = {
  book: BookProps & { responseId: string };
  images: Record<number, ImageProps>;
};

export const Book: FC<NovelProps> = (props) => {
  const { book, images = [] } = props;
  const bookRef = useRef<HTMLOListElement>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const { pagesRef, pageIndex, bookProgress, onPageChange } = useBookObserver();

  /**
   * Generate an image for the page, and
   *   1. Update state and
   *   2. Update browser storage
   */
  const updatePageWithImage = useCallback(
    async (
      page: PageProps,
      pageIndex: number,
      bookTitle: string,
      previousResponseId?: string
    ) => {
      try {
        const hasImage = (images[pageIndex]?.url || "").length > 0;

        if (!hasImage) {
          setIsGeneratingImage(true);
          const prompt = imagePrompt({
            input: page.synopsis,
            previousResponseId,
          });
          log("imagePrompt", { prompt });
          const response = await generateImage(prompt);
          log("generateImage", { response });

          if (response.data.url.length <= 0) {
            console.error("Failed", response);
            setIsGeneratingImage(false);
            return;
          }

          events.emit("generatedimage", {
            data: { image: response.data, pageIndex, bookTitle },
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsGeneratingImage(false);
      }
    },
    [images]
  );

  /**
   * Handle generate image click
   */
  const onGenerateImage = useCallback(
    (event: BaseSyntheticEvent) => {
      event.preventDefault();
      const pageIndex = +event.target.dataset.pageIndex;
      const page = book.pages[pageIndex];
      const prevImage = images[pageIndex - 1];
      const previousResponseId = prevImage?.responseId || book.responseId;

      if (page) {
        updatePageWithImage(page, pageIndex, book.title, previousResponseId);
      }
    },
    [updatePageWithImage, images, book]
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
    <main id="book" data-page-index={String(pageIndex)}>
      <BookProgress progress={bookProgress} />
      <p className="page-number">{pageIndex}</p>
      <ol className="h-scroll book">
        {/* <li
          className="h-scroll-section page home"
          data-page-index={String(0)}
          ref={(el) => el && (pagesRef.current[0] = el)}
        >
          <h1>{book.title}</h1>
        </li> */}
        {book.pages.map((page, i) => (
          <li
            key={page.synopsis}
            className="h-scroll-section page"
            data-page-index={String(i)}
            ref={(el) => el && (pagesRef.current[i] = el)}
          >
            {images[i]?.url ? (
              <figure className="art">
                <img
                  key={images[i].responseId}
                  alt={page.synopsis}
                  src={images[i].url}
                  width={820}
                  height={1030}
                />
              </figure>
            ) : (
              <div className="cta">
                <Button
                  data-page-index={String(i)}
                  onClick={onGenerateImage}
                  disabled={isGeneratingImage}
                  className={cn(
                    isGeneratingImage && "loading loading-gradient",
                    "generate-image"
                  )}
                >
                  <ImageAddIcon />
                  Generate Image
                </Button>
              </div>
            )}
            <div className="content">
              {page.content
                .split(".")
                .map((p, i) => p && <p key={i}>{`${p}.`}</p>)}
            </div>
          </li>
        ))}
        {/* <li
          className="h-scroll-section page last"
          ref={(el) => el && (pagesRef.current[1 + book.pages.length] = el)}
          data-page-index={String(1 + book.pages.length)}
        >
          <h3>Fun Fact</h3>
          <p>{book.randomFact}</p>
        </li> */}
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
