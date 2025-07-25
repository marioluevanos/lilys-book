import "./Form.css";
import { Button } from "../Button/Button";
import { BaseSyntheticEvent, FC } from "react";

export const Form: FC<{
  onSubmit: (event: BaseSyntheticEvent) => void;
  disabled?: boolean;
  defaultValue?: string;
}> = (props) => {
  const { onSubmit, disabled, defaultValue } = props;
  return (
    <form onSubmit={onSubmit} aria-disabled={disabled}>
      <textarea
        id="prompt"
        name="prompt"
        disabled={disabled}
        rows={6}
        defaultValue={defaultValue}
        placeholder="What kind of book would you like?"
      />
      <Button
        type="submit"
        name="cta"
        disabled={disabled}
        className={`${disabled ? "loading " : ""}`}
      >
        Make me a book
      </Button>
    </form>
  );
};
