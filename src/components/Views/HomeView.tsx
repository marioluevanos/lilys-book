import "./views.css";
import { BaseSyntheticEvent, FC } from "react";

import { Button } from "../Button/Button";
import { events } from "../../events";
import { Form } from "../Form/Form";
import { PlusIcon } from "../Icon";
import { BookShelf } from "../BookShelf/BookShelf";

export const HomeView: FC<{
  onBookClick: (event: BaseSyntheticEvent) => void;
  onSubmit: (event: BaseSyntheticEvent) => void;
  onChange: (event: BaseSyntheticEvent) => void;
  disabled?: boolean;
}> = (props) => {
  const { onBookClick, onChange, onSubmit, disabled } = props;
  return (
    <main id="home-view" className="view">
      <header>
        <h1>Lily's Books</h1>
      </header>

      <BookShelf onBookClick={onBookClick} />

      <footer className="app-cta">
        <Button
          data-variant="icon"
          onClick={() => {
            events.emit("drawer", {
              children: (
                <Form
                  onChange={onChange}
                  onSubmit={onSubmit}
                  disabled={disabled}
                />
              ),
            });
          }}
        >
          <PlusIcon /> New Book
        </Button>
      </footer>
    </main>
  );
};
