import { screen } from '@testing-library/react';
import { AssignmentForm } from '../components/AssignmentForm';
import { api } from '../api';
import type { NewAssignmentDto } from '../types';
import { renderWithStore } from '../../../../test/renderWithStore';

jest.mock('../api');
const mockedApi = jest.mocked(api);

afterEach(() => {
  jest.resetAllMocks();
});

describe('AssignmentForm', () => {
  it('submit form rỗng → hiện 3 lỗi, không gọi api.create', async () => {
    const { user } = renderWithStore(<AssignmentForm />);

    await user.click(screen.getByRole('button', { name: 'Thêm bài tập' }));

    expect(screen.getByText('Nhập môn học')).toBeInTheDocument();
    expect(screen.getByText('Nhập tên bài tập')).toBeInTheDocument();
    expect(screen.getByText('Chọn hạn nộp')).toBeInTheDocument();
    expect(mockedApi.create).not.toHaveBeenCalled();
  });

  it('nhập hợp lệ → api.create nhận DTO có dueDate ISO cuối ngày, form được reset', async () => {
    mockedApi.create.mockImplementation(async (dto: NewAssignmentDto) => ({
      ...dto,
      id: 'new-1',
      completed: false,
    }));
    const { user, store } = renderWithStore(<AssignmentForm />);

    await user.type(screen.getByLabelText('Môn học'), 'Mạng máy tính');
    await user.type(screen.getByLabelText('Tên bài tập'), 'Lab 4 — VLAN');
    await user.type(screen.getByLabelText('Hạn nộp'), '2026-10-20');
    await user.selectOptions(screen.getByLabelText('Độ ưu tiên'), 'high');
    await user.click(screen.getByRole('button', { name: 'Thêm bài tập' }));

    expect(mockedApi.create).toHaveBeenCalledTimes(1);
    expect(mockedApi.create).toHaveBeenCalledWith({
      subject: 'Mạng máy tính',
      title: 'Lab 4 — VLAN',
      dueDate: new Date(2026, 9, 20, 23, 59, 59).toISOString(),
      priority: 'high',
    });

    expect(await screen.findByLabelText('Môn học')).toHaveValue('');
    expect(screen.getByLabelText('Tên bài tập')).toHaveValue('');
    expect(screen.getByLabelText('Hạn nộp')).toHaveValue('');
    expect(screen.getByLabelText('Độ ưu tiên')).toHaveValue('medium');
    expect(store.getState().assignments.items.map((a) => a.id)).toEqual(['new-1']);
  });
});
