import "./BookShelf.css";

import { BookDB, ImageProps } from "../../types";
import { cn } from "../../utils/cn";
import {
  BaseSyntheticEvent,
  FC,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useBookShelf } from "./useBookShelf";
import { Button } from "../Button/Button";
import { TrashIcon } from "../Icon";
import { deleteBookDB, getBooksDB, getImageDB } from "../../db";

type BooksPreviewProps = {
  className?: string;
  onBookClick?: (event: BaseSyntheticEvent) => void;
};

type BookPreview = { id?: string; title: string; image: ImageProps | null };

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

export const BookShelf: FC<BooksPreviewProps> = (props) => {
  const { onBookClick } = props;
  const [bookPreviews, setBookPreviews] = useState<BookPreview[]>();
  const [activeIndex, setActiveIndex] = useState(0);
  const { booksRef } = useBookShelf(
    bookPreviews?.length || 0,
    onIntersection.bind(null, setActiveIndex)
  );

  /**
   * Delete a book
   */
  const onBookDeleteClick = useCallback(async (event: BaseSyntheticEvent) => {
    event.preventDefault();
    const bookId = event.target.dataset.bookId;
    if (bookId) {
      const apiResponse = await deleteBookDB(bookId);
      if (apiResponse.message) {
        console.log("deleted");
      }
    }
  }, []);

  /**
   * Fetch the first image in the book to use as the preview
   */
  const fetchImageForBook = useCallback(
    async (bPreviews: BookDB[] | undefined) => {
      const withImage = await Promise.all(
        (bPreviews || []).map<Promise<BookPreview>>(async (bookPre) => {
          const [firstPage] = bookPre.pages;
          const imageId = firstPage.image_id;

          if (imageId) {
            return {
              id: bookPre.id,
              title: bookPre.title,
              image: await getImageDB(imageId),
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
    if (!bookPreviews) getBooksDB().then(fetchImageForBook);
  }, [bookPreviews, fetchImageForBook]);

  return (
    <section className="book-shelf">
      <div className="book-shelf-scroll h-scroll">
        {bookPreviews?.map((b, i) => (
          <article
            key={b.title}
            className={cn("book-shelf-book", activeIndex === i && "active")}
            data-book-index={String(i)}
          >
            <Button
              data-variant="icon"
              data-book-id={String(b.id)}
              className="book-delete"
              onClick={onBookDeleteClick}
            >
              <TrashIcon />
            </Button>
            <figure
              onClick={onBookClick}
              ref={(el) => el && (booksRef.current[i] = el)}
              className={cn("book-shelf-image")}
              data-book-id={String(b.id)}
              data-book-index={String(i)}
            >
              <img src={b.image?.url} alt="" />
              <img src={b.image?.url} alt="" />
            </figure>
            <h3 className="book-shelf-title">{b.title}</h3>
          </article>
        ))}

        <div className="box">
          <div className="box__face box__face--front">front</div>
          <div className="box__face box__face--back">back</div>
          <div className="box__face box__face--right">right</div>
          <div className="box__face box__face--left">left</div>
          <div className="box__face box__face--top">top</div>
          <div className="box__face box__face--bottom">bottom</div>
        </div>
      </div>
    </section>
  );
};
