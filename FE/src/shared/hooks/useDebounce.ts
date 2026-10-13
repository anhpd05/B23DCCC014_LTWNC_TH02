import { useEffect, useState } from 'react';

/** Trả về `value` sau khi nó đứng yên `delay` ms; đổi liên tục thì chỉ phát giá trị cuối. */
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
