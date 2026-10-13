import type { Assignment } from './types';

export function filterByQuery(items: Assignment[], query: string): Assignment[] {
  const q = query.trim().toLocaleLowerCase('vi');
  if (q === '') return items;
  return items.filter(
    (a) =>
      a.title.toLocaleLowerCase('vi').includes(q) ||
      a.subject.toLocaleLowerCase('vi').includes(q),
  );
}
