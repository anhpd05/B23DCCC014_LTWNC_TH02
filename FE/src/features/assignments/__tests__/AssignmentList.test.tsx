import { act, screen, within } from '@testing-library/react';
import { AssignmentList } from '../components/AssignmentList';
import { api } from '../api';
import { usePinStore } from '../../pins/usePinStore';
import { ApiError } from '../../../shared/ApiError';
import { renderWithStore } from '../../../../test/renderWithStore';
import { deferred, dueInDays, makeAssignment } from '../../../../test/fixtures';
import type { Assignment } from '../types';

jest.mock('../api');
const mockedApi = jest.mocked(api);

const ITEMS: Assignment[] = [
  makeAssignment({ id: 'a1', subject: 'Mạng máy tính', title: 'Lab 1 — Subnet', dueDate: dueInDays(1) }),
  makeAssignment({ id: 'a2', subject: 'Kỹ thuật phần mềm', title: 'Đồ án giữa kỳ', dueDate: dueInDays(4) }),
  makeAssignment({ id: 'a3', subject: 'Anh văn chuyên ngành', title: 'Thuyết trình nhóm', dueDate: dueInDays(9) }),
];

type UserOptions = NonNullable<Parameters<typeof renderWithStore>[1]>['userOptions'];

function renderList(userOptions?: UserOptions) {
  return renderWithStore(
    <AssignmentList>
      <AssignmentList.Search />
      <AssignmentList.Filters />
      <AssignmentList.Items />
      <AssignmentList.Empty>Chưa có bài tập nào trong mục này</AssignmentList.Empty>
    </AssignmentList>,
    { userOptions },
  );
}

const rowTitles = () =>
  screen
    .getAllByRole('listitem')
    .map((row) => row.querySelector('.assignment-item__title')?.textContent);

afterEach(() => {
  jest.resetAllMocks();
  act(() => usePinStore.setState(usePinStore.getInitialState(), true));
});

describe('AssignmentList — tải dữ liệu', () => {
  it('đang tải hiện skeleton role="status", tải xong hiện card', async () => {
    const pending = deferred<Assignment[]>();
    mockedApi.getAll.mockReturnValueOnce(pending.promise);
    renderList();

    expect(screen.getByRole('status', { name: 'Đang tải danh sách bài tập' })).toBeInTheDocument();
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();

    await act(async () => pending.resolve(ITEMS));

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(rowTitles()).toEqual(['Lab 1 — Subnet', 'Đồ án giữa kỳ', 'Thuyết trình nhóm']);
  });

  it('lỗi hiện role="alert" kèm thông điệp; "Thử lại" thành công thì hiện card', async () => {
    mockedApi.getAll
      .mockRejectedValueOnce(new ApiError(0, 'Không kết nối được máy chủ', 'NETWORK'))
      .mockResolvedValueOnce(ITEMS);
    const { user } = renderList();

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Không tải được danh sách');
    expect(alert).toHaveTextContent('Không kết nối được máy chủ');

    await user.click(within(alert).getByRole('button', { name: 'Thử lại' }));

    expect(await screen.findByText('Lab 1 — Subnet')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(mockedApi.getAll).toHaveBeenCalledTimes(2);
  });
});

describe('AssignmentList — ghim và tìm kiếm', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => jest.runOnlyPendingTimers());
    jest.useRealTimers();
  });

  it('ghim bài cuối thì bài đó lên đầu; gõ tìm kiếm chỉ lọc sau 300 ms', async () => {
    mockedApi.getAll.mockResolvedValueOnce(ITEMS);
    const { user } = renderList({ advanceTimers: jest.advanceTimersByTime });
    await screen.findByText('Thuyết trình nhóm');

    await user.click(screen.getByRole('button', { name: 'Ghim Thuyết trình nhóm' }));
    expect(rowTitles()).toEqual(['Thuyết trình nhóm', 'Lab 1 — Subnet', 'Đồ án giữa kỳ']);

    await user.type(screen.getByRole('searchbox', { name: 'Tìm bài tập' }), 'MẠNG');
    act(() => jest.advanceTimersByTime(299));
    expect(rowTitles()).toHaveLength(3);
    act(() => jest.advanceTimersByTime(1));
    expect(rowTitles()).toEqual(['Lab 1 — Subnet']);
  });

  it('gõ chuỗi không khớp → sau 300 ms báo "Không có bài tập khớp"; xoá ô thì danh sách trở lại', async () => {
    mockedApi.getAll.mockResolvedValueOnce(ITEMS);
    const { user } = renderList({ advanceTimers: jest.advanceTimersByTime });
    await screen.findByText('Lab 1 — Subnet');
    const search = screen.getByRole('searchbox', { name: 'Tìm bài tập' });

    await user.type(search, 'xyz');
    act(() => jest.advanceTimersByTime(300));
    expect(screen.getByText('Không có bài tập khớp “xyz”')).toBeInTheDocument();
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();

    await user.clear(search);
    act(() => jest.advanceTimersByTime(300));
    expect(screen.queryByText(/Không có bài tập khớp/)).not.toBeInTheDocument();
    expect(rowTitles()).toEqual(['Lab 1 — Subnet', 'Đồ án giữa kỳ', 'Thuyết trình nhóm']);
  });
});

describe('AssignmentList — xoá lỗi', () => {
  it('xoá bài đã ghim mà API lỗi → banner hiện, bài vẫn ở đầu và còn ghim; "Đóng" ẩn banner', async () => {
    mockedApi.getAll.mockResolvedValueOnce(ITEMS);
    mockedApi.remove.mockRejectedValueOnce(new ApiError(500, 'Máy chủ trả về 500', 'HTTP'));
    const { user, store } = renderList();
    await screen.findByText('Thuyết trình nhóm');

    await user.click(screen.getByRole('button', { name: 'Ghim Thuyết trình nhóm' }));
    await user.click(screen.getByRole('button', { name: 'Xoá Thuyết trình nhóm' }));

    const banner = await screen.findByRole('alert');
    expect(banner).toHaveTextContent('Máy chủ trả về 500');
    expect(mockedApi.remove).toHaveBeenCalledWith('a3');
    expect(rowTitles()).toEqual(['Thuyết trình nhóm', 'Lab 1 — Subnet', 'Đồ án giữa kỳ']);
    expect(screen.getByRole('button', { name: 'Bỏ ghim Thuyết trình nhóm' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(store.getState().assignments.mutatingIds).toEqual([]);

    await user.click(within(banner).getByRole('button', { name: 'Đóng' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(store.getState().assignments.error).toBeNull();
  });
});
