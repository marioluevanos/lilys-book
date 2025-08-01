import "./BooksPreview.css";

import { getBooksPreviewDB, getImageDB } from "../../library";
import { BookDB, ImageProps } from "../../types";
import { cn } from "../../utils/cn";
import {
  BaseSyntheticEvent,
  FC,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useBooksPreview } from "./useBooksPreview";

type BooksPreviewProps = {
  className?: string;
  onBookClick?: (event: BaseSyntheticEvent) => void;
};

type BookPreview = { id?: number; title: string; image: ImageProps | null };

/**
 * For each Intersection Observer, add onScrollPosition callback
 */
function onIntersection(
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>,
  { target }: IntersectionObserverEntry
) {
  const el = target as HTMLElement;
  const { bookIndex } = el.dataset;

  if (bookIndex && !isNaN(+bookIndex)) {
    setActiveIndex(+bookIndex);
  }
}

export const BooksPreview: FC<BooksPreviewProps> = (props) => {
  const { onBookClick } = props;
  const [bookPreviews, setBookPreviews] = useState<BookPreview[]>();
  const [activeIndex, setActiveIndex] = useState(0);
  const { booksRef } = useBooksPreview(
    bookPreviews?.length || 0,
    onIntersection.bind(null, setActiveIndex)
  );

  /**
   * Fetch the first image in the book to use as the preview
   */
  const fetchImageForBook = useCallback(
    async (bPreviews: BookDB[] | undefined) => {
      const withImage = await Promise.all(
        (bPreviews || []).map<Promise<BookPreview>>(async (bookPre) => {
          const imageId = bookPre.pages[0].image_id;

          if (imageId) {
            return {
              id: bookPre.id || 0,
              title: bookPre.title || "",
              image: (await getImageDB(imageId)) || null,
            };
          }

          return { ...bookPre, image: null };
        })
      );

      setBookPreviews(withImage);
    },
    []
  );

  /**
   * Fetch book previews
   */
  useEffect(() => {
    if (!bookPreviews) getBooksPreviewDB().then(fetchImageForBook);
  }, [bookPreviews]);

  return (
    <section className="books-preview-scroll h-scroll">
      {bookPreviews?.map((b, i) => (
        <article
          key={b.title}
          className={cn("book-preview", activeIndex === i && "active")}
          data-book-index={String(i)}
        >
          <figure
            onClick={onBookClick}
            ref={(el) => el && (booksRef.current[i] = el)}
            className={cn("book-preview-image")}
            data-book-id={String(b.id)}
            data-book-index={String(i)}
          >
            <img src={b.image?.url} alt="" />
            <img src={b.image?.url} alt="" />
          </figure>
          <h3>{b.title}</h3>
        </article>
      ))}
    </section>
  );
};
