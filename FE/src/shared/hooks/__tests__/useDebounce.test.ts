import { act, renderHook } from '@testing-library/react';
import { useDebounce } from '../useDebounce';

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('useDebounce', () => {
  it('giữ giá trị cũ trước 300 ms, ra giá trị mới sau 300 ms, đổi liên tục chỉ phát giá trị cuối', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'a' },
    });
    expect(result.current).toBe('a');

    rerender({ value: 'ab' });
    act(() => jest.advanceTimersByTime(299));
    expect(result.current).toBe('a');
    act(() => jest.advanceTimersByTime(1));
    expect(result.current).toBe('ab');

    const seen: string[] = [];
    for (const value of ['abc', 'abcd', 'abcde']) {
      rerender({ value });
      act(() => jest.advanceTimersByTime(100));
      seen.push(result.current);
    }
    expect(seen).toEqual(['ab', 'ab', 'ab']);
    act(() => jest.advanceTimersByTime(200));
    expect(result.current).toBe('abcde');
  });
});
