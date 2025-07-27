import "./Novel.css";
import { Book, Image, Page } from "../../types";
import {
  BaseSyntheticEvent,
  FC,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button } from "../Button/Button";
import { useNovelObserver } from "./useNovelObserver";
import { cn } from "../../utils/cn";
import { events } from "../../events";
import { NovelProgress } from "./NovelProgress";
import { mainCharacters } from "../../system";
import { generateImage } from "../../library";

type NovelProps = {
  book: Book;
  images: Record<number, Image>;
};

export const Novel: FC<NovelProps> = (props) => {
  const { book, images = [] } = props;
  const bookRef = useRef<HTMLOListElement>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const { pagesRef, pageIndex, bookProgress, onPageChange } =
    useNovelObserver();

  /**
   * Generate an image for the page, and
   *   1. Update state and
   *   2. Update browser storage
   */
  const updatePageWithImage = useCallback(
    async (page: Page, pageIndex: number, previousResponseId?: string) => {
      try {
        const hasImage = (images[pageIndex]?.url || "").length > 0;

        if (!hasImage) {
          setIsGeneratingImage(true);

          const response = await generateImage({
            input: page.synopsis,
            previousResponseId,
            instructions: `${mainCharacters}\nThe image should be 820/1030 aspect ratio, and illustrated in a style for children.`,
          });
          const image = response.data;

          if (image.url.length <= 0) {
            console.error("FAILED TO GEN IMAGE");
            setIsGeneratingImage(false);
            return;
          }

          const data = { image, pageIndex };
          events.emit("genratedimage", { data });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsGeneratingImage(false);
      }
    },
    []
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
      const previousResponseId = prevImage?.responseId;

      if (page) updatePageWithImage(page, pageIndex, previousResponseId);
    },
    [updatePageWithImage, book]
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
    <main id="novel">
      <NovelProgress progress={bookProgress} />
      <p className="page-number">{pageIndex + 1}</p>
      <ol className="h-scroll book">
        {book.pages.map((page, i) => (
          <li
            key={page.synopsis}
            className="h-scroll-section page"
            data-page-index={String(i)}
            ref={(el) => el && (pagesRef.current[i] = el)}
          >
            {images[i]?.url ? (
              <figure className="art">
                <a
                  download={images[i].url}
                  href={images[i].url}
                  className="download"
                >
                  Download
                </a>
                <img
                  key={images[i].responseId}
                  alt={page.synopsis}
                  src={images[i].url}
                  width={512}
                  height={512}
                />
              </figure>
            ) : (
              <div className="cta">
                <Button
                  data-page-index={String(i)}
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
