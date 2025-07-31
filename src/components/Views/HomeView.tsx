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
    <div className="home-view">
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
    </div>
  );
};
