export const PRIORITIES = ['low', 'medium', 'high'] as const;
export type Priority = (typeof PRIORITIES)[number];

export const FILTERS = ['all', 'pending', 'overdue', 'completed'] as const;
export type FilterStatus = (typeof FILTERS)[number];

export interface Assignment {
  id: string;
  subject: string;
  title: string;
  dueDate: string; // ISO 8601
  priority: Priority;
  completed: boolean;
}

export type NewAssignmentDto = Omit<Assignment, 'id' | 'completed'>;
export type SeedAssignmentDto = Omit<Assignment, 'id'>;
export type UpdateAssignmentDto = Partial<Omit<Assignment, 'id'>>;

export const PRIORITY_WEIGHT: Record<Priority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  high: 'Cao',
  medium: 'Trung bình',
  low: 'Thấp',
};

export const FILTER_LABEL: Record<FilterStatus, string> = {
  all: 'Tất cả',
  pending: 'Chưa hoàn thành',
  overdue: 'Quá hạn',
  completed: 'Đã hoàn thành',
};
