import { DAY_MS, startOfDay } from '../../shared/date';
import type { Assignment } from './types';

export function calcDaysLeft(dueDate: string, now: number = Date.now()): number {
  return Math.round((startOfDay(Date.parse(dueDate)) - startOfDay(now)) / DAY_MS);
}

export function isOverdue(
  a: Pick<Assignment, 'dueDate' | 'completed'>,
  now: number = Date.now(),
): boolean {
  return !a.completed && calcDaysLeft(a.dueDate, now) < 0;
}

export interface SubjectStats {
  subject: string;
  total: number;
  completed: number;
  overdue: number;
}

export interface AssignmentStats {
  total: number;
  completed: number;
  overdue: number;
  pending: number;
  bySubject: SubjectStats[];
}

export function calcStats(items: Assignment[], now: number = Date.now()): AssignmentStats {
  const bySubject = new Map<string, SubjectStats>();
  let completed = 0;
  let overdue = 0;

  for (const a of items) {
    let s = bySubject.get(a.subject);
    if (!s) {
      s = { subject: a.subject, total: 0, completed: 0, overdue: 0 };
      bySubject.set(a.subject, s);
    }
    s.total += 1;
    if (a.completed) {
      s.completed += 1;
      completed += 1;
    } else if (isOverdue(a, now)) {
      s.overdue += 1;
      overdue += 1;
    }
  }

  return {
    total: items.length,
    completed,
    overdue,
    pending: items.length - completed - overdue,
    bySubject: [...bySubject.values()].sort(
      (a, b) => b.total - a.total || a.subject.localeCompare(b.subject, 'vi'),
    ),
  };
}
