import { calcDaysLeft, calcStats, isOverdue } from '../deadline';
import { dueInDays, makeAssignment } from '../../../../test/fixtures';

// Mốc cố định 13/10/2026 10:00 giờ địa phương — kết quả không phụ thuộc đồng hồ máy.
const NOW = new Date(2026, 9, 13, 10, 0, 0).getTime();

describe('calcDaysLeft', () => {
  it('so theo ngày lịch: hạn 23:59 hôm nay = 0, hôm qua = -1, ngày mai = 1', () => {
    expect(calcDaysLeft(dueInDays(0, NOW), NOW)).toBe(0);
    expect(calcDaysLeft(dueInDays(-1, NOW), NOW)).toBe(-1);
    expect(calcDaysLeft(dueInDays(1, NOW), NOW)).toBe(1);
  });

  it('ngày hỏng trả NaN và isOverdue của ngày hỏng là false', () => {
    expect(calcDaysLeft('không-phải-ngày', NOW)).toBeNaN();
    expect(isOverdue({ dueDate: 'không-phải-ngày', completed: false }, NOW)).toBe(false);
  });
});

describe('isOverdue', () => {
  it('chỉ quá hạn khi hạn đã qua VÀ chưa hoàn thành', () => {
    expect(isOverdue({ dueDate: dueInDays(-3, NOW), completed: true }, NOW)).toBe(false);
    expect(isOverdue({ dueDate: dueInDays(0, NOW), completed: false }, NOW)).toBe(false);
    expect(isOverdue({ dueDate: dueInDays(-1, NOW), completed: false }, NOW)).toBe(true);
  });
});

describe('calcStats', () => {
  it('danh sách rỗng → mọi số đếm bằng 0, bySubject rỗng', () => {
    expect(calcStats([], NOW)).toEqual({
      total: 0,
      completed: 0,
      overdue: 0,
      pending: 0,
      bySubject: [],
    });
  });

  it('nhóm theo môn, xong + quá hạn + chưa xong = tổng, sắp theo tổng giảm dần', () => {
    const items = [
      makeAssignment({ id: '1', subject: 'Toán rời rạc', completed: true }),
      makeAssignment({ id: '2', subject: 'Cơ sở dữ liệu', dueDate: dueInDays(-2, NOW) }),
      makeAssignment({ id: '3', subject: 'Cơ sở dữ liệu', completed: true, dueDate: dueInDays(-2, NOW) }),
      makeAssignment({ id: '4', subject: 'Cơ sở dữ liệu', dueDate: dueInDays(4, NOW) }),
      makeAssignment({ id: '5', subject: 'Toán rời rạc', dueDate: dueInDays(0, NOW) }),
      makeAssignment({ id: '6', subject: 'Mạng máy tính', dueDate: dueInDays(-1, NOW) }),
    ];

    const stats = calcStats(items, NOW);

    expect(stats).toMatchObject({ total: 6, completed: 2, overdue: 2, pending: 2 });
    expect(stats.completed + stats.overdue + stats.pending).toBe(stats.total);
    expect(stats.bySubject).toEqual([
      { subject: 'Cơ sở dữ liệu', total: 3, completed: 1, overdue: 1 },
      { subject: 'Toán rời rạc', total: 2, completed: 1, overdue: 0 },
      { subject: 'Mạng máy tính', total: 1, completed: 0, overdue: 1 },
    ]);
  });
});
