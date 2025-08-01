import type { CSSProperties } from 'react';

interface CSSVariables extends CSSProperties {
  [key: string]: unknown;
}

/**
 * Add custom CSS properties to an element.
 */
export function cssVars(keyValue: CSSVariables): CSSVariables {
  return keyValue;
}
