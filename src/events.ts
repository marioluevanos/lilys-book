import { ReactNode } from "react";
import { Image } from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */

export type EventPayload = {
  children?: ReactNode;
  data?: { image: Image; pageIndex: number };
};

interface EventEmitter {
  on: (event: string, listener: (payload: EventPayload) => void) => void;
  off: (event: string, listener: (payload: EventPayload) => void) => void;
  emit: (event: string, payload: EventPayload) => void;
}

/**
 * Typed event emitter
 */
export function createEventEmitter(): EventEmitter {
  const listeners: Partial<Record<string, Array<(args: any) => void>>> = {};

  return {
    on(event, fn) {
      listeners[event] = listeners[event] || [];
      listeners[event]!.push(fn);
    },
    off(event, fn) {
      if (!listeners[event]) return;
      listeners[event] = listeners[event].filter((l) => l !== fn);
    },
    emit(event, payload) {
      listeners[event]?.forEach((fn) => fn(payload));
    },
  };
}

/**
 * Singleton Instance
 */
export const events = createEventEmitter();
