import type { AssignmentsState } from '../src/features/assignments/assignmentsSlice';
import type { Assignment } from '../src/features/assignments/types';

/** ISO của 23:59:59 giờ địa phương, cách ngày của `now` `days` ngày (âm = quá khứ). */
export function dueInDays(days: number, now: number = Date.now()): string {
  const d = new Date(now);
  d.setDate(d.getDate() + days);
  d.setHours(23, 59, 59, 0);
  return d.toISOString();
}

export function makeAssignment(overrides: Partial<Assignment> = {}): Assignment {
  return {
    id: 'a1',
    subject: 'Lập trình Web nâng cao',
    title: 'Bài tập thực hành 02',
    dueDate: dueInDays(5),
    priority: 'medium',
    completed: false,
    ...overrides,
  };
}

/** State `assignments` đầy đủ, mặc định đã tải xong — ghi đè từng phần khi cần. */
export function assignmentsState(overrides: Partial<AssignmentsState> = {}): AssignmentsState {
  return {
    items: [],
    status: 'succeeded',
    error: null,
    mutatingIds: [],
    filter: 'all',
    seedState: 'idle',
    ...overrides,
  };
}

/** Promise điều khiển được từ test để quan sát trạng thái "đang chờ". */
export function deferred<T>() {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}
