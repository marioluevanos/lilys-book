import "./view.css";
import { BaseSyntheticEvent, FC } from "react";

import { Books } from "../Books/Books";
import { Button } from "../Button/Button";
import { events } from "../../events";
import { Form } from "../Form/Form";
import { PlusIcon } from "../Icon";

export const HomeView: FC<{
  onBookClick: (event: BaseSyntheticEvent) => void;
  onSubmit: (event: BaseSyntheticEvent) => void;
  disabled?: boolean;
  prompt?: string;
}> = (props) => {
  const { onBookClick, onSubmit, disabled, prompt } = props;
  return (
    <main className="view home-view">
      <header>
        <h2>Lily's Books</h2>
      </header>
      <Books onBookClick={onBookClick} />
      <div className="app-cta">
        <Button
          onClick={() => {
            events.emit("drawer", {
              children: (
                <Form
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
      </div>
    </main>
  );
};
