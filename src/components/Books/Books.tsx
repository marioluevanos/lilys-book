import { getBooksDB, getImageDB } from "../../library";
import { ImageProps } from "../../types";
import "./Books.css";
import { BaseSyntheticEvent, FC, useEffect, useState } from "react";

type BooksProps = {
  className?: string;
  onBookClick?: (event: BaseSyntheticEvent) => void;
};

type BookPreview = { id?: number; title: string; image: ImageProps | null };

export const Books: FC<BooksProps> = (props) => {
  const { className, onBookClick } = props;
  const [bookPreviews, setBookPreviews] = useState<BookPreview[]>();

  useEffect(() => {
    if (!bookPreviews)
      getBooksDB().then(async (books) => {
        const previews = (books || []).map<Promise<BookPreview>>(async (b) => {
          const imageId = b.pages[0].image_id;
          if (imageId) {
            return {
              id: b.id || 0,
              title: b.title || "",
              image: (await getImageDB(imageId)) || null,
            };
          }
          return { ...b, image: null };
        });

        const booksWImages = await Promise.all(previews);

        setBookPreviews(booksWImages);
      });
  }, [bookPreviews]);

  return (
    <main id="books" className={className}>
      <header>
        <h2>Lily's Books</h2>
      </header>
      <div className="books-scroll h-scroll">
        {bookPreviews?.map((b) => (
          <div
            key={b.title}
            data-book-id={String(b.id)}
            className="book-preview"
            onClick={onBookClick}
          >
            <figure className="book-preview-image">
              <img src={b.image?.url} alt="" />
            </figure>
            <h3>{b.title}</h3>
          </div>
        ))}
      </div>
    </main>
  );
};
