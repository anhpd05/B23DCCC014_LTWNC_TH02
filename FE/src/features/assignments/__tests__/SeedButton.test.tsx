import { act, screen, within } from '@testing-library/react';
import { SeedButton } from '../components/SeedButton';
import { AssignmentList } from '../components/AssignmentList';
import { api } from '../api';
import { STRESS_COUNT } from '../mockData';
import type { Assignment, SeedAssignmentDto } from '../types';
import { ApiError } from '../../../shared/ApiError';
import { renderWithStore } from '../../../../test/renderWithStore';
import { assignmentsState, deferred, makeAssignment } from '../../../../test/fixtures';

jest.mock('../api');
const mockedApi = jest.mocked(api);

/** Như trang chính: nút seed + danh sách (nơi hiện banner lỗi). Danh sách coi như đã tải. */
function renderPage() {
  return renderWithStore(
    <>
      <SeedButton />
      <AssignmentList>
        <AssignmentList.Items />
      </AssignmentList>
    </>,
    {
      preloadedState: {
        assignments: assignmentsState({ items: [makeAssignment({ id: 'old', title: 'Bài cũ' })] }),
      },
    },
  );
}

const withIds = (dtos: SeedAssignmentDto[]): Assignment[] =>
  dtos.map((d, i) => ({ ...d, id: `seed-${i}` }));

afterEach(() => {
  jest.resetAllMocks();
});

describe('SeedButton', () => {
  it('tạo 10.000 bài: khoá trong lúc chờ, xong thì khoá hẳn; API lỗi thì hiện banner và mở lại nút', async () => {
    const pending = deferred<Assignment[]>();
    mockedApi.bulkCreate.mockReturnValueOnce(pending.promise);
    const first = renderPage();

    await first.user.click(screen.getByRole('button', { name: 'Tạo 10.000 bài tập mẫu' }));

    expect(screen.getByRole('button', { name: 'Đang tạo…' })).toBeDisabled();
    expect(mockedApi.bulkCreate).toHaveBeenCalledTimes(1);
    const sent = mockedApi.bulkCreate.mock.calls[0][0];
    expect(sent).toHaveLength(STRESS_COUNT);

    await act(async () => pending.resolve(withIds(sent)));

    expect(screen.getByRole('button', { name: 'Đã tạo 10.000 bài' })).toBeDisabled();
    expect(first.store.getState().assignments.items).toHaveLength(STRESS_COUNT + 1);
    first.unmount();

    // Lần lỗi: store mới, BE trả lỗi.
    mockedApi.bulkCreate.mockRejectedValueOnce(new ApiError(504, 'Máy chủ phản hồi quá chậm', 'TIMEOUT'));
    const second = renderPage();

    await second.user.click(screen.getByRole('button', { name: 'Tạo 10.000 bài tập mẫu' }));

    const banner = await screen.findByRole('alert');
    expect(banner).toHaveTextContent('Máy chủ phản hồi quá chậm');
    expect(screen.getByRole('button', { name: 'Tạo 10.000 bài tập mẫu' })).toBeEnabled();
    expect(second.store.getState().assignments.items).toHaveLength(1);
    expect(within(banner).getByRole('button', { name: 'Đóng' })).toBeInTheDocument();
  });
});
