import { create } from 'zustand';
import type { Assignment } from '../assignments/types';

interface PinState {
  pinnedIds: string[];
  togglePin: (id: string) => void;
  isPinned: (id: string) => boolean;
}

/** Ghim là trạng thái giao diện thuần (không đi qua BE) nên dùng Zustand, không đưa vào Redux. */
export const usePinStore = create<PinState>()((set, get) => ({
  pinnedIds: [],
  togglePin: (id) =>
    set((s) => ({
      pinnedIds: s.pinnedIds.includes(id)
        ? s.pinnedIds.filter((x) => x !== id)
        : [...s.pinnedIds, id],
    })),
  isPinned: (id) => get().pinnedIds.includes(id),
}));

/**
 * Đưa bài đã ghim lên đầu. Partition ổn định: mỗi nhóm giữ nguyên thứ tự
 * tương đối của `items`. Trả lại chính `items` khi chưa ghim gì.
 */
export function pinnedFirst(items: Assignment[], pinnedIds: string[]): Assignment[] {
  if (pinnedIds.length === 0) return items;
  const pinned = new Set(pinnedIds);
  const head: Assignment[] = [];
  const tail: Assignment[] = [];
  for (const a of items) (pinned.has(a.id) ? head : tail).push(a);
  return head.length === 0 ? items : [...head, ...tail];
}
