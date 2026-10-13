import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AssignmentCard } from '../components/AssignmentCard';
import { dueInDays, makeAssignment } from '../../../../test/fixtures';

function setup(props: { busy?: boolean; pinned?: boolean } = {}) {
  const data = makeAssignment({
    id: 'a7',
    subject: 'Cơ sở dữ liệu',
    title: 'Báo cáo thực hành 3',
    dueDate: dueInDays(5),
    priority: 'high',
  });
  const handlers = { onToggle: jest.fn(), onRemove: jest.fn(), onTogglePin: jest.fn() };
  const view = render(
    <AssignmentCard
      data={data}
      busy={props.busy ?? false}
      pinned={props.pinned ?? false}
      {...handlers}
    />,
  );
  return { data, ...handlers, ...view, user: userEvent.setup() };
}

describe('AssignmentCard', () => {
  it('hiển thị tên, môn, ngày hạn, nhãn ưu tiên và đếm ngược', () => {
    const { data } = setup();

    expect(screen.getByText('Báo cáo thực hành 3')).toBeInTheDocument();
    expect(screen.getByText('Cơ sở dữ liệu')).toBeInTheDocument();
    expect(
      screen.getByText(new Date(data.dueDate).toLocaleDateString('vi-VN')),
    ).toBeInTheDocument();
    expect(screen.getByText('Cao')).toBeInTheDocument();
    expect(screen.getByText('Còn 5 ngày')).toBeInTheDocument();
  });

  it('bấm checkbox gọi onToggle(data) đúng 1 lần; busy thì checkbox và nút xoá bị khoá', async () => {
    const { data, onToggle, user, rerender, onRemove, onTogglePin } = setup();
    const checkbox = screen.getByRole('checkbox', { name: 'Đánh dấu hoàn thành Báo cáo thực hành 3' });

    await user.click(checkbox);
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith(data);

    rerender(
      <AssignmentCard
        data={data}
        busy
        pinned={false}
        onToggle={onToggle}
        onRemove={onRemove}
        onTogglePin={onTogglePin}
      />,
    );
    expect(checkbox).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Xoá Báo cáo thực hành 3' })).toBeDisabled();
    await user.click(checkbox);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('bấm nút ghim gọi onTogglePin(id); aria-pressed theo prop pinned', async () => {
    const { data, onToggle, onRemove, onTogglePin, user, rerender } = setup();

    const pinBtn = screen.getByRole('button', { name: 'Ghim Báo cáo thực hành 3' });
    expect(pinBtn).toHaveAttribute('aria-pressed', 'false');
    await user.click(pinBtn);
    expect(onTogglePin).toHaveBeenCalledWith('a7');

    rerender(
      <AssignmentCard
        data={data}
        busy={false}
        pinned
        onToggle={onToggle}
        onRemove={onRemove}
        onTogglePin={onTogglePin}
      />,
    );
    expect(screen.getByRole('button', { name: 'Bỏ ghim Báo cáo thực hành 3' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
