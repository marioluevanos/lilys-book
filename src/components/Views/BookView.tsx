import { BaseSyntheticEvent, FC } from "react";
import { Form } from "../Form/Form";
import { Book } from "../Book/Book";
import { BookState } from "../../types";

export const BookView: FC<{
  onGenerateImage: (event: BaseSyntheticEvent) => Promise<void>;
  onSubmit: (event: BaseSyntheticEvent) => void;
  isGeneratingImage?: boolean;
  book?: BookState | undefined;
  prompt?: string;
}> = (props) => {
  const {
    onGenerateImage,
    onSubmit,
    book,
    prompt,
    isGeneratingImage = false,
  } = props;
  return (
    book && (
      <div className="book-view">
        <Book
          onGenerateImageClick={onGenerateImage}
          isGeneratingImage={isGeneratingImage}
          book={{
            ...book,
            pages: book.pages || [],
            title: book.title || "",
            response_id: book.response_id || "",
            random_fact: book.random_fact || "",
          }}
          key="Novel"
          form={
            <Form
              onSubmit={onSubmit}
              disabled={isGeneratingImage}
              defaultValue={prompt}
            />
          }
        />
      </div>
    )
  );
};
