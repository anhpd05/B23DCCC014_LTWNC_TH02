import { screen, within } from '@testing-library/react';
import StatsPage from '../StatsPage';
import { renderWithStore } from '../../../../test/renderWithStore';
import { assignmentsState, dueInDays, makeAssignment } from '../../../../test/fixtures';

/** Giá trị <dd> đi kèm nhãn <dt> trong khối thẻ số liệu. */
const cardValue = (label: string) => screen.getByText(label, { selector: 'dt' }).nextElementSibling;

describe('StatsPage', () => {
  it('store có sẵn dữ liệu → hiển thị đúng số xong, quá hạn và bảng theo môn', () => {
    const items = [
      makeAssignment({ id: '1', subject: 'Hệ điều hành', completed: true }),
      makeAssignment({ id: '2', subject: 'Hệ điều hành', dueDate: dueInDays(-3) }),
      makeAssignment({ id: '3', subject: 'Hệ điều hành', dueDate: dueInDays(2) }),
      makeAssignment({ id: '4', subject: 'Toán rời rạc', dueDate: dueInDays(-1) }),
      makeAssignment({ id: '5', subject: 'Toán rời rạc', completed: true, dueDate: dueInDays(-1) }),
    ];
    renderWithStore(<StatsPage />, { preloadedState: { assignments: assignmentsState({ items }) } });

    expect(cardValue('Tổng số bài')).toHaveTextContent('5');
    expect(cardValue('Đã hoàn thành')).toHaveTextContent('2');
    expect(cardValue('Quá hạn')).toHaveTextContent('2');
    expect(cardValue('Chưa hoàn thành')).toHaveTextContent('1');

    const table = screen.getByRole('table', { name: 'Theo môn học' });
    const rows = within(table).getAllByRole('row').slice(1);
    expect(rows.map((r) => [...r.children].map((c) => c.textContent))).toEqual([
      ['Hệ điều hành', '3', '1', '1'],
      ['Toán rời rạc', '2', '1', '1'],
    ]);
  });
});
