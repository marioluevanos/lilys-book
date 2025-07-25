import "./Book.css";
import { BookWImages } from "../../types";
import { BaseSyntheticEvent, FC, useEffect, useRef } from "react";

export const Book: FC<{
  book: BookWImages;
  pageIndex: number;
  onPageChange: (event: BaseSyntheticEvent) => void;
}> = (props) => {
  const { book, pageIndex = 0, onPageChange } = props;
  const bookRef = useRef<HTMLOListElement>(null);

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
      <p className="page-number">{pageIndex + 1}</p>
      <ol className="h-scroll book" ref={bookRef}>
        {book.pages.map((ch, i) => (
          <li
            key={ch.synopsis}
            className="h-scroll-section page"
            data-page={i + 1}
          >
            <p className="content">{ch.content}</p>
            {ch.image?.url && (
              <figure className="art">
                <img
                  key={ch.synopsis}
                  alt={ch.synopsis}
                  src={ch.image.url}
                  width={512}
                  height={512}
                />
              </figure>
            )}
          </li>
        ))}
      </ol>
      <nav className="book-nav">
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
