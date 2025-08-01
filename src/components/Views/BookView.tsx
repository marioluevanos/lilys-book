import "./views.css";

import { BaseSyntheticEvent, FC } from "react";
import { BooksPreviewtate } from "../../types";
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
        <Book
          book={book}
          isGeneratingImage={isGeneratingImage}
          onGenerateImageClick={onGenerateImage}
        />
      </main>
    )
  );
};
