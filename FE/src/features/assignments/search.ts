import type { Assignment } from './types';

/**
 * Lọc theo tên bài và môn, không phân biệt hoa thường. Query rỗng trả lại chính
 * `items` (cùng tham chiếu) để chỗ gọi không phải làm gì thêm.
 */
export function filterByQuery(items: Assignment[], query: string): Assignment[] {
  const q = query.trim().toLocaleLowerCase('vi');
  if (q === '') return items;
  return items.filter(
    (a) =>
      a.title.toLocaleLowerCase('vi').includes(q) ||
      a.subject.toLocaleLowerCase('vi').includes(q),
  );
}
