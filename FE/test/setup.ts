import '@testing-library/jest-dom';

type Listener = (e: MediaQueryListEvent) => void;

const matches = new Map<string, boolean>();
const listeners = new Map<string, Set<Listener>>();

function listenersOf(query: string): Set<Listener> {
  let set = listeners.get(query);
  if (!set) {
    set = new Set();
    listeners.set(query, set);
  }
  return set;
}

window.matchMedia = (query: string): MediaQueryList => {
  const add = (_type: string, cb: EventListenerOrEventListenerObject | null) => {
    if (typeof cb === 'function') listenersOf(query).add(cb as Listener);
  };
  const remove = (_type: string, cb: EventListenerOrEventListenerObject | null) => {
    if (typeof cb === 'function') listenersOf(query).delete(cb as Listener);
  };
  return {
    get matches() {
      return matches.get(query) ?? false;
    },
    media: query,
    onchange: null,
    addEventListener: add,
    removeEventListener: remove,
    addListener: (cb) => add('change', cb as EventListener | null),
    removeListener: (cb) => remove('change', cb as EventListener | null),
    dispatchEvent: () => false,
  };
};

export function setMediaMatches(query: string, value: boolean): void {
  matches.set(query, value);
  const event = { matches: value, media: query } as MediaQueryListEvent;
  for (const cb of listenersOf(query)) cb(event);
}

afterEach(() => {
  matches.clear();
  listeners.clear();
});
