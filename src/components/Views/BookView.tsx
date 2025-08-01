import "./views.css";

import { BaseSyntheticEvent, FC } from "react";
import { BooksPreviewtate } from "../../types";
// import { BookFlip } from "../BookFlip/BookFlip";
import { Book } from "../Book/Book";

export const BookView: FC<{
  onGenerateImage: (event: BaseSyntheticEvent) => Promise<void>;
  isGeneratingImage?: boolean;
  book?: BooksPreviewtate;
}> = (props) => {
  const { onGenerateImage, book, isGeneratingImage = false } = props;
  return (
    book && (
      <main id="book-view" className="view">
        {/* <BookFlip book={book} /> */}
        <Book
          book={book}
          isGeneratingImage={isGeneratingImage}
          onGenerateImageClick={onGenerateImage}
        />
      </main>
    )
  );
};
