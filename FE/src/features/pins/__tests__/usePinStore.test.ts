import { pinnedFirst, usePinStore } from '../usePinStore';
import { makeAssignment } from '../../../../test/fixtures';

afterEach(() => {
  usePinStore.setState(usePinStore.getInitialState(), true);
});

describe('usePinStore', () => {
  it('togglePin thêm rồi bỏ ghim, isPinned đúng; pinnedFirst giữ thứ tự tương đối', () => {
    const { togglePin, isPinned } = usePinStore.getState();

    togglePin('b');
    togglePin('d');
    expect(usePinStore.getState().pinnedIds).toEqual(['b', 'd']);
    expect(isPinned('b')).toBe(true);
    expect(isPinned('a')).toBe(false);

    togglePin('b');
    expect(usePinStore.getState().pinnedIds).toEqual(['d']);
    expect(isPinned('b')).toBe(false);

    const items = ['a', 'b', 'c', 'd', 'e'].map((id) => makeAssignment({ id }));
    const ids = (list: typeof items) => list.map((a) => a.id);

    expect(ids(pinnedFirst(items, ['d', 'b']))).toEqual(['b', 'd', 'a', 'c', 'e']);
    expect(pinnedFirst(items, [])).toBe(items);
    expect(pinnedFirst(items, ['zz'])).toBe(items);
  });
});
