import { useSyncExternalStore } from 'react';

/** Theo dõi một media query; trả về `matches` hiện tại và render lại khi nó đổi. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
  );
}
