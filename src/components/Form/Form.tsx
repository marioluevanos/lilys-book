import "./Form.css";
import { BaseSyntheticEvent, FC } from "react";

export const Form: FC<{
  onSubmit: (event: BaseSyntheticEvent) => void;
  disabled?: boolean;
  defaultValue?: string;
}> = (props) => {
  const { onSubmit, disabled, defaultValue } = props;
  return (
    <form onSubmit={onSubmit} aria-disabled={disabled}>
      <label>What kind of book would you like?</label>
      <textarea
        name="prompt"
        disabled={disabled}
        rows={8}
        defaultValue={defaultValue}
        placeholder="Generate a book about..."
      />
      <button
        type="submit"
        name="cta"
        disabled={disabled}
        className={`${disabled ? "loading " : ""}`}
      >
        Make me a book
      </button>
    </form>
  );
};
