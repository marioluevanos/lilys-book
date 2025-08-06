import "./Form.css";
import { Button } from "../Button/Button";
import {
  BaseSyntheticEvent,
  FC,
  useCallback,
  useEffect,
  useState,
} from "react";
import { ART_STYLES, StorageOptions } from "../../types";
import { cn } from "../../utils/cn";
import { getStorageOptions, setStorageOptions } from "../../storage";
import { TrashIcon } from "../Icon";
import { events } from "../../events";

export const Form: FC<{
  onSubmit: (event: BaseSyntheticEvent) => void;
  onChange: (event: BaseSyntheticEvent) => void;
  disabled?: boolean;
}> = (props) => {
  const { onSubmit, onChange, disabled } = props;
  const [options, setOptions] = useState<StorageOptions>();
  const hasAPIKey =
    typeof options?.api_key === "string" && options.api_key.length > 0;

  const onClearAPIKey = useCallback(() => {
    setStorageOptions(undefined);
  }, []);

  const onBlur = useCallback((event: BaseSyntheticEvent) => {
    events.emit("formblur", event);
  }, []);

  useEffect(() => {
    const options = getStorageOptions();
    if (options) setOptions(options);
  }, []);

  return (
    <form
      onSubmit={onSubmit}
      className={cn(disabled && "disabled")}
      aria-disabled={disabled}
    >
      <textarea
        id="input"
        name="input"
        disabled={disabled}
        rows={6}
        onBlur={onBlur}
        defaultValue={options?.input}
        placeholder="What kind of book would you like?"
      />
      <div className="form-col">
        <label className="api_key">
          OpenAI API Key
          <input
            className="input"
            type="text"
            name="api_key"
            placeholder="Enter OpenAI API key"
            defaultValue={options?.api_key}
            disabled={hasAPIKey || disabled}
            onBlur={onBlur}
          />
          {hasAPIKey && (
            <button className="clear-btn" type="button" onClick={onClearAPIKey}>
              <TrashIcon className="delete-icon" />
            </button>
          )}
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
