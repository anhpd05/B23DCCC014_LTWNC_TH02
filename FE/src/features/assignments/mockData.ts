import { DAY_MS, startOfDay } from '../../shared/date';
import type { Priority, SeedAssignmentDto } from './types';

/** Số bài của nút "Tạo bài tập mẫu" (stress test của đề TH02). */
export const STRESS_COUNT = 10_000;

const SUBJECTS = [
  'Lập trình Web nâng cao',
  'Cơ sở dữ liệu',
  'Mạng máy tính',
  'Toán rời rạc',
  'Cấu trúc dữ liệu và giải thuật',
  'Hệ điều hành',
  'Anh văn chuyên ngành',
  'Kỹ thuật phần mềm',
];

const KINDS = [
  'Bài tập lớn',
  'Báo cáo thực hành',
  'Bài kiểm tra giữa kỳ',
  'Thuyết trình nhóm',
  'Bài tập về nhà',
  'Đồ án cuối kỳ',
];

const PRIORITIES: Priority[] = ['low', 'medium', 'high'];

/** PRNG mulberry32: cùng seed → cùng dãy số, để dữ liệu mẫu tái lập được. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Sinh `count` bài tập mẫu: 8 môn, 6 loại bài, hạn từ −30 đến +89 ngày tính từ
 * đầu ngày của `now`, khoảng 25% đã hoàn thành. `now` bắt buộc truyền vào (không
 * mặc định `Date.now()`) để kết quả không phụ thuộc đồng hồ ngầm.
 */
export function generateAssignments(
  count: number,
  now: number,
  seed = 2026,
): SeedAssignmentDto[] {
  const rand = mulberry32(seed);
  const today = startOfDay(now);
  return Array.from({ length: count }, (_, i) => {
    const subject = SUBJECTS[Math.floor(rand() * SUBJECTS.length)];
    const kind = KINDS[Math.floor(rand() * KINDS.length)];
    const dayOffset = Math.floor(rand() * 120) - 30;
    return {
      subject,
      title: `${kind} #${i + 1} — ${subject}`,
      dueDate: new Date(today + dayOffset * DAY_MS + DAY_MS - 1000).toISOString(),
      priority: PRIORITIES[Math.floor(rand() * PRIORITIES.length)],
      completed: rand() < 0.25,
    };
  });
}
