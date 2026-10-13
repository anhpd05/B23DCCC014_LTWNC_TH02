import { useEffect, useMemo, useState } from 'react';
import { calcDaysLeft } from '../../features/assignments/deadline';

export function useCountdown(dueDate: string) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  return useMemo(() => {
    const diff = calcDaysLeft(dueDate, now);
    if (diff > 0) {
      return {
        days: diff,
        isOverdue: false,
        label: `Còn ${diff} ngày`,
        tone: diff <= 2 ? 'warn' : 'ok',
      } as const;
    }
    if (diff === 0) {
      return { days: 0, isOverdue: false, label: 'Hạn hôm nay', tone: 'warn' } as const;
    }
    return {
      days: -diff,
      isOverdue: true,
      label: `Quá hạn ${-diff} ngày`,
      tone: 'danger',
    } as const;
  }, [dueDate, now]);
}
