import "./views.css";

import { BaseSyntheticEvent, FC } from "react";
import { Form } from "../Form/Form";
import { Book } from "../Book/Book";
import { BooksPreviewtate } from "../../types";

export const BookView: FC<{
  onGenerateImage: (event: BaseSyntheticEvent) => Promise<void>;
  onSubmit: (event: BaseSyntheticEvent) => void;
  onChange: (event: BaseSyntheticEvent) => void;
  isGeneratingImage?: boolean;
  book?: BooksPreviewtate;
  prompt?: string;
}> = (props) => {
  const {
    onGenerateImage,
    onChange,
    onSubmit,
    book,
    prompt,
    isGeneratingImage = false,
  } = props;
  return (
    book && (
      <main id="book-view" className="view">
        <Book
          book={book}
          isGeneratingImage={isGeneratingImage}
          onGenerateImageClick={onGenerateImage}
          form={
            <Form
              onChange={onChange}
              onSubmit={onSubmit}
              disabled={isGeneratingImage}
              promptDefaultValue={prompt}
            />
          }
        />
      </main>
    )
  );
};
