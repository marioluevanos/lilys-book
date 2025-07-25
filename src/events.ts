export type EventPayload = {
  event: string;
  payload: Record<string, any>;
};

export type EventMap = {
  [E in EventPayload as E["event"]]: E["payload"];
};

type EventName = keyof EventMap;

type Listener<K extends EventName> = (payload: EventMap[K]) => void;

interface EventEmitter {
  on: <K extends EventName>(event: K, listener: Listener<K>) => void;
  off: <K extends EventName>(event: K, listener: Listener<K>) => void;
  emit: <K extends EventName>(event: K, payload: EventMap[K]) => void;
}

/**
 * Typed event emitter
 */
export function createEventEmitter(): EventEmitter {
  const listeners: Partial<Record<EventName, Array<(args: any) => void>>> = {};

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
