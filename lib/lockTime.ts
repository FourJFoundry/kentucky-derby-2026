export const LOCK_ISO = "2026-05-02T22:27:00Z";

export function isPicksLocked(): boolean {
  return Date.now() >= new Date(LOCK_ISO).getTime();
}

export function getLockDisplay(): string {
  return "Sat May 2 · 4:27 PM MDT";
}
