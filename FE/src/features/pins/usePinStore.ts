import { create } from 'zustand';
import type { Assignment } from '../assignments/types';

interface PinState {
  pinnedIds: string[];
  togglePin: (id: string) => void;
  isPinned: (id: string) => boolean;
}

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

export function pinnedFirst(items: Assignment[], pinnedIds: string[]): Assignment[] {
  if (pinnedIds.length === 0) return items;
  const pinned = new Set(pinnedIds);
  const head: Assignment[] = [];
  const tail: Assignment[] = [];
  for (const a of items) (pinned.has(a.id) ? head : tail).push(a);
  return head.length === 0 ? items : [...head, ...tail];
}
