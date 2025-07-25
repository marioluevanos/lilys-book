import type { PropsWithChildren } from "react";

type Dictionary<V = string> = {
  [key: string | number]: V;
};

/**
 * Extract the data-attributes that are contained in the props.
 */
export function getDataAttributes<T>(props: PropsWithChildren<T>): Dictionary {
  return Object.entries(props).reduce((attrs: Dictionary, [key, value]) => {
    if (key.startsWith("data-") && Boolean(value)) {
      attrs[key] = String(value);
    }
    return attrs;
  }, {});
}
