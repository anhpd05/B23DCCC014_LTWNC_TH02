export const DAY_MS = 86_400_000;

export function startOfDay(t: number): number {
  return new Date(t).setHours(0, 0, 0, 0);
}
