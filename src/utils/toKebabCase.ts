/**
 * The kebab cased text as in: 'some-slugged-text'
 */
export function toKebabCase(text: string = ""): string {
  return text
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .replace(/\W+/g, " ")
    .replace(/[ ]/g, "-")
    .replace(/^-/, "")
    .replace(/-$/, "")
    .trim()
    .toLowerCase();
}
