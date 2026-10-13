import reducer, {
  deleteAssignment,
  fetchAssignments,
  seedAssignments,
} from '../assignmentsSlice';
import { api } from '../api';
import { STRESS_COUNT } from '../mockData';
import type { Assignment, SeedAssignmentDto } from '../types';
import { makeStore } from '../../../app/store';
import { ApiError } from '../../../shared/ApiError';
import { assignmentsState, deferred, makeAssignment } from '../../../../test/fixtures';

jest.mock('../api');
const mockedApi = jest.mocked(api);

const withIds = (dtos: SeedAssignmentDto[]): Assignment[] =>
  dtos.map((d, i) => ({ ...d, id: `seed-${i}` }));

afterEach(() => {
  jest.resetAllMocks();
});

describe('assignmentsSlice reducer', () => {
  it('fetchAssignments.rejected không có payload → failed + "Lỗi không xác định"', () => {
    const state = reducer(
      assignmentsState({ status: 'loading' }),
      fetchAssignments.rejected(new Error('boom'), 'req-1'),
    );
    expect(state.status).toBe('failed');
    expect(state.error).toBe('Lỗi không xác định');
  });

  it('deleteAssignment.fulfilled với id không tồn tại → items giữ nguyên, mutatingIds được dọn', () => {
    const items = [makeAssignment({ id: 'a1' }), makeAssignment({ id: 'a2' })];
    const ghost = makeAssignment({ id: 'ghost' });

    const state = reducer(
      assignmentsState({ items, mutatingIds: ['ghost'] }),
      deleteAssignment.fulfilled(ghost, 'req-1', 'ghost'),
    );

    expect(state.items).toEqual(items);
    expect(state.mutatingIds).toEqual([]);
  });
});

describe('seedAssignments', () => {
  it('pending → seeding; fulfilled nối thêm items và done; rejected → idle kèm error', async () => {
    const existing = makeAssignment({ id: 'old' });
    const pending = deferred<Assignment[]>();
    mockedApi.bulkCreate.mockReturnValueOnce(pending.promise);
    const store = makeStore({ assignments: assignmentsState({ items: [existing] }) });

    const running = store.dispatch(seedAssignments());
    expect(store.getState().assignments.seedState).toBe('seeding');

    const sent = mockedApi.bulkCreate.mock.calls[0][0];
    expect(sent).toHaveLength(STRESS_COUNT);
    expect(sent[0]).not.toHaveProperty('id');

    pending.resolve(withIds(sent));
    await running;
    const done = store.getState().assignments;
    expect(done.seedState).toBe('done');
    expect(done.items).toHaveLength(STRESS_COUNT + 1);
    expect(done.items[0]).toBe(existing);

    mockedApi.bulkCreate.mockRejectedValueOnce(new ApiError(500, 'BE quá tải', 'HTTP'));
    const failing = makeStore({ assignments: assignmentsState() });
    await failing.dispatch(seedAssignments());
    expect(failing.getState().assignments).toMatchObject({
      seedState: 'idle',
      error: 'BE quá tải',
      items: [],
    });
  });

  it('condition chặn seed khi danh sách chưa tải xong hoặc đã/đang seed', async () => {
    const blocked = [
      assignmentsState({ status: 'loading' }),
      assignmentsState({ status: 'failed' }),
      assignmentsState({ seedState: 'seeding' }),
      assignmentsState({ seedState: 'done' }),
    ];
    for (const assignments of blocked) {
      const store = makeStore({ assignments });
      const result = await store.dispatch(seedAssignments());
      expect(result.meta).toMatchObject({ condition: true });
      expect(store.getState().assignments).toEqual(assignments);
    }
    expect(mockedApi.bulkCreate).not.toHaveBeenCalled();
  });
});
