import "./BookFlip.css";

import { FC, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BooksPreviewtate, PageState } from "../../types";
import { cn } from "../../utils/cn";

gsap.registerPlugin(ScrollTrigger);

export const BookFlip: FC<{ book?: BooksPreviewtate }> = (props) => {
  const { book } = props;
  const pages = book?.pages || [];

  /**
   * Book pages
   */
  useEffect(() => {
    gsap.to(".book-flip", {
      scrollTrigger: {
        scrub: 1,
        start: () => 0,
        end: () => window.innerHeight * 1,
      },
      scale: 0.5,
    });

    const PAGES = [...document.querySelectorAll(".book__page")];

    PAGES.forEach((pagina, index) => {
      gsap.set(pagina, { z: index === 0 ? PAGES.length + 1 : -index * 1 });

      if (index === PAGES.length - 1) return false;

      gsap.to(pagina, {
        rotateY: `-=${180 - index / 2}`,
        scrollTrigger: {
          scrub: 1,
          start: () => (index + 1) * (window.innerHeight * 0.25),
          end: () => (index + 2) * (window.innerHeight * 0.25),
        },
      });

      gsap.to(pagina, {
        rotateY: `-=${180 - index / 2}`,
        scrollTrigger: {
          scrub: 1,
          start: () => (index + 1) * (window.innerHeight * 0.25),
          end: () => (index + 2) * (window.innerHeight * 0.25),
        },
      });

      gsap.to(pagina, {
        z: index === 0 ? -(PAGES.length + 1) : index,
        scrollTrigger: {
          scrub: 1,
          start: () => (index + 1) * (window.innerHeight * 0.25),
          end: () => (index + 1.5) * (window.innerHeight * 0.25),
        },
      });
    });
  }, []);

  return (
    <div className="book-flip">
      <div className="book__spine"></div>

      <div
        className={cn("pagina book__page", "book__cover book__cover--front")}
      >
        <div className="page__half page__half--front">
          <p>{book?.title}</p>
          <div className="page__number">{0}</div>
        </div>
        <div className="page__half page__half--back">
          {pages[0]?.image?.url && <img src={pages[0].image?.url} />}
          <div className="page__number">{1}</div>
        </div>
      </div>

      {((book?.pages || []) as PageState[]).map((p, i, arr) => (
        <div
          key={i}
          className={cn(
            "pagina book__page",
            i === 0 && "book__cover book__cover--front",
            i === arr.length - 1 && "book__cover book__cover--back"
          )}
        >
          <div className="page__half page__half--front">
            <p>{p.content}</p>
            <div className="page__number">{i}</div>
          </div>
          <div className="page__half page__half--back">
            {pages[i + 1]?.image?.url && <img src={pages[i + 1]?.image?.url} />}
            <div className="page__number">{i + 1}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
