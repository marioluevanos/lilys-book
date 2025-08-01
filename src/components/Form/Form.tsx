import "./Form.css";
import { Button } from "../Button/Button";
import { BaseSyntheticEvent, FC, useEffect, useState } from "react";
import { ART_STYLES, InputOptions } from "../../types";
import { cn } from "../../utils/cn";
import { getOptions } from "../../storage";

export const Form: FC<{
  onSubmit: (event: BaseSyntheticEvent) => void;
  onChange: (event: BaseSyntheticEvent) => void;
  disabled?: boolean;
}> = (props) => {
  const { onSubmit, onChange, disabled } = props;
  const [options, setOptions] = useState<InputOptions>();

  useEffect(() => {
    const options = getOptions();
    if (options) setOptions(options);
  }, []);

  return (
    <form onSubmit={onSubmit} aria-disabled={disabled}>
      <textarea
        id="prompt"
        name="prompt"
        disabled={disabled}
        rows={6}
        defaultValue={options?.input}
        placeholder="What kind of book would you like?"
      />
      <div className="form-col">
        <label className="apikey">
          OpenAI API Key
          <input
            className="input"
            type="text"
            name="apikey"
            placeholder="sk-proj..."
            defaultValue={options?.apikey}
            disabled={typeof options?.apikey === "string"}
          />
        </label>
        <label className="art-style">
          Art Style
          <span className="input">
            <select name="art_style" disabled={disabled} onChange={onChange}>
              {ART_STYLES.map((s) => (
                <option key={s} value={s} selected={s === options?.art_style}>
                  {s}
                </option>
              ))}
            </select>
          </span>
        </label>
      </div>
      <Button
        type="submit"
        name="cta"
        disabled={disabled}
        className={cn(`${disabled ? "loading " : ""}`, "outline")}
      >
        Make me a book
      </Button>
    </form>
  );
};
