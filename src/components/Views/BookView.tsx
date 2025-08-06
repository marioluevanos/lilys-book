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
        {useFlip ? (
          <BookFlip book={book} />
        ) : (
          <BookHorizontal
            book={book}
            isGeneratingImage={isGeneratingImage}
            firstPage={
              <Button
                data-variant="icon"
                style={{
                  position: "absolute",
                  top: "1.5rem",
                  left: "1.5rem",
                  background: "none",
                  border: "1px solid white",
                  zIndex: 1000,
                }}
                onClick={() => setUseFlip((prev) => !prev)}
              >
                <TestIcon />
              </Button>
            }
          />
        )}
      </main>
    )
  );
};
