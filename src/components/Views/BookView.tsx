import "./views.css";

import { FC, useState } from "react";
import { BookDB } from "../../types";
import { BookHorizontal } from "../BookHorizontal/BookHorizontal";
import { BookFlip } from "../BookFlip/BookFlip";
import { Button } from "../Button/Button";
import { TestIcon } from "../Icon";

export const BookView: FC<{
  isGeneratingImage?: boolean;
  book?: BookDB;
}> = (props) => {
  const { book, isGeneratingImage = false } = props;
  const [useFlip, setUseFlip] = useState(false);
  return (
    book && (
      <main id="book-view" className="view">
        <Button
          data-variant="icon"
          style={{
            position: "fixed",
            top: "1.5rem",
            left: "1.5rem",

            zIndex: 1000,
          }}
          onClick={() => setUseFlip((prev) => !prev)}
        >
          <TestIcon />
        </Button>
        {useFlip ? (
          <BookFlip book={book} />
        ) : (
          <BookHorizontal book={book} isGeneratingImage={isGeneratingImage} />
        )}
      </main>
    )
  );
};
