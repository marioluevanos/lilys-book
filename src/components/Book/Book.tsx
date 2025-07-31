import "./Book.css";
import { BookDB, ImageProps } from "../../types";
import {
  BaseSyntheticEvent,
  FC,
  ReactNode,
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

type _BookProps = {
  book: BookDB & { responseId: string };
  images: Record<number, ImageProps>;
  form: ReactNode;
};

export const Book: FC<_BookProps> = (props) => {
  const { book, images = [], form } = props;
  const bookRef = useRef<HTMLOListElement>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const { pagesRef, pageIndex, bookProgress, onPageChange } = useBookObserver();
  const currentImageId = book.pages[pageIndex].imageId;
  const currentImage = images[pageIndex];

  console.log({ currentImage, currentImageId });

  const onNewBook = useCallback(
    (event: BaseSyntheticEvent) => {
      event.preventDefault();
      events.emit("drawer", {
        children: form,
      });
    },
    [form]
  );

  /**
   * Handle generate image click
   */
  const onGenerateImage = useCallback(
    async (event: BaseSyntheticEvent) => {
      event.preventDefault();
      const pageIndex = +event.target.dataset.pageIndex;
      const page = book.pages[pageIndex];
      const prevImage = images[pageIndex - 1];
      const previousResponseId = prevImage?.responseId || book.responseId;

      if (page) {
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
              data: { image: response.data, pageIndex, bookTitle: book.title },
            });
          }
        } catch (e) {
          console.error(e);
        } finally {
          setIsGeneratingImage(false);
        }
      }
    },
    [images, book]
  );

  /**
   * Handle the generated image
   */
  const onBookGenerated = useCallback(async () => {
    if (bookRef.current) {
      bookRef.current.scrollTo({
        left: 0,
        behavior: "instant",
      });
    }
  }, []);

  useEffect(() => {
    events.on("generatedbook", onBookGenerated);
  }, [onBookGenerated]);

  return (
    <main id="book" data-page-index={String(pageIndex)}>
      <BookProgress progress={bookProgress} />
      <ol className="h-scroll book" ref={bookRef}>
        <li className="h-scroll-section page home">
          <h1>{book.title}</h1>
        </li>
        {book.pages.map((page, i) => (
          <li
            key={page.synopsis}
            className="h-scroll-section page"
            data-page-index={String(i)}
            ref={(el) => el && (pagesRef.current[i] = el)}
          >
            <p className="page-number">{String(i + 1)}</p>
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
        <li className="h-scroll-section page last">
          <h3>Fun Fact</h3>
          <p>{book.randomFact}</p>
          <Button className="cta-new-book" onClick={onNewBook}>
            Create new book
          </Button>
        </li>
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
