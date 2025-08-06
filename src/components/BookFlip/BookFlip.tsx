import "./BookFlip.css";

import { FC, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BookDB, PageDB } from "../../types";
import { cn } from "../../utils/cn";

gsap.registerPlugin(ScrollTrigger);

export const BookFlip: FC<{ book?: BookDB }> = (props) => {
  const { book } = props;
  const pages = book?.pages || [];

  /**
   * Book pages
   */
  useEffect(() => {
    gsap.fromTo(
      ".book-flip",
      { scale: 0.5 },
      {
        scrollTrigger: {
          scrub: 1,
          start: () => 0,
          end: () => window.innerHeight * 1,
        },
        scale: 1,
      }
    );

    const PAGES = [...document.querySelectorAll(".book-flip-page")];

    PAGES.forEach((page, index) => {
      gsap.set(page, { z: index === 0 ? PAGES.length + 1 : -index * 1 });

      if (index === PAGES.length - 1) return false;

      gsap.to(page, {
        rotateY: `-=${180 - index / 2}`,
        scrollTrigger: {
          scrub: 1,
          start: () => (index + 1) * (window.innerHeight * 0.25),
          end: () => (index + 2) * (window.innerHeight * 0.25),
        },
      });

      gsap.to(page, {
        rotateY: `-=${180 - index / 2}`,
        scrollTrigger: {
          scrub: 1,
          start: () => (index + 1) * (window.innerHeight * 0.25),
          end: () => (index + 2) * (window.innerHeight * 0.25),
        },
      });

      gsap.to(page, {
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
      <div className="book-flip-spine"></div>

      <div
        className={cn(
          "pagina book-flip-page",
          "book-flip-cover book-flip-cover-front"
        )}
      >
        <div className="book-flip-page-half book-flip-page-half-front">
          <p>{book?.title}</p>
          <div className="book-flip-page-number">{0}</div>
        </div>
        <div className="book-flip-page-half book-flip-page-half-back">
          {pages[0]?.image?.url && <img src={pages[0].image?.url} />}
          <div className="book-flip-page-number">{1}</div>
        </div>
      </div>
      {((book?.pages || []) as PageDB[]).map((p, i) => (
        <div key={i} className={cn("pagina book-flip-page")}>
          <div className="book-flip-page-half">
            <p>{p.content}</p>
            <div className="book-flip-page-number">{i}</div>
          </div>
          <div className="book-flip-page-half book-flip-page-half-back">
            {pages[i + 1]?.image?.url && <img src={pages[i + 1]?.image?.url} />}
            <div className="book-flip-page-number">{i + 1}</div>
          </div>
        </div>
      ))}
      <div
        className={cn(
          "pagina book-flip-page",
          "book-flip-cover book-flip-cover-back"
        )}
      >
        <div className="book-flip-page-half">
          <p>randomf a</p>
          <p>{book?.random_fact}</p>
        </div>
        <div className="book-flip-page-half book-flip-page-half-back"></div>
      </div>
    </div>
  );
};
