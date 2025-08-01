import "./Form.css";
import { Button } from "../Button/Button";
import { BaseSyntheticEvent, FC } from "react";
import { ART_STYLES } from "../../types";

export const Form: FC<{
  onSubmit: (event: BaseSyntheticEvent) => void;
  onChange: (event: BaseSyntheticEvent) => void;
  disabled?: boolean;
  defaultValue?: string;
}> = (props) => {
  const { onSubmit, onChange, disabled, defaultValue } = props;
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
      <label className="art-style">
        <span>Art Style</span>
        <select name="art_style" disabled={disabled} onChange={onChange}>
          {ART_STYLES.map((s) => (
            <option key={s}> {s}</option>
          ))}
        </select>
      </label>
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
