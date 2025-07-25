import "./Book.css";
import { BookWImages } from "../../types";
import { FC } from "react";

export const Book: FC<{
  book: BookWImages;
}> = (props) => {
  const { book } = props;

  return (
    <main id="book">
      <ol className="h-scroll book">
        <li className="h-scroll-section page cover">
          <h1>{book.title}</h1>
        </li>
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
        <li className="h-scroll-section page fact">
          <h2>It's a Fact</h2>
          <p className="content">{book.randomFact}</p>
        </li>
      </ol>
    </main>
  );
};
