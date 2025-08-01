import "./views.css";
import { BaseSyntheticEvent, FC } from "react";

import { Button } from "../Button/Button";
import { events } from "../../events";
import { Form } from "../Form/Form";
import { PlusIcon } from "../Icon";
import { BooksPreview } from "../BooksPreview/BooksPreview";

export const HomeView: FC<{
  onBookClick: (event: BaseSyntheticEvent) => void;
  onSubmit: (event: BaseSyntheticEvent) => void;
  onChange: (event: BaseSyntheticEvent) => void;
  disabled?: boolean;
  prompt?: string;
}> = (props) => {
  const { onBookClick, onChange, onSubmit, disabled, prompt } = props;
  return (
    <main id="home-view" className="view">
      <header>
        <h2>Lily's Books</h2>
      </header>

      <BooksPreview onBookClick={onBookClick} />

      <footer className="app-cta">
        <Button
          onClick={() => {
            events.emit("drawer", {
              children: (
                <Form
                  onChange={onChange}
                  onSubmit={onSubmit}
                  defaultValue={prompt}
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
