import { GuestStayStatus } from '../types';

const STORAGE_KEY_PREFIX = 'stay_status_';

export function getStayStatus(slug: string): GuestStayStatus {
  if (typeof window === 'undefined') return 'not_checked_in';
  try {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + slug);
    if (saved === 'checked_in' || saved === 'checked_out' || saved === 'not_checked_in') {
      return saved;
    }
  } catch {
    // ignore
  }
  return 'not_checked_in';
}

export function setStayStatus(slug: string, status: GuestStayStatus): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + slug, status);
    // Dispatch custom event for intra-window reactivity
    window.dispatchEvent(new CustomEvent('stay-status-change', { detail: { slug, status } }));
  } catch {
    // ignore
  }
}

export function getAllStayStatuses(slugs: string[]): Record<string, GuestStayStatus> {
  const result: Record<string, GuestStayStatus> = {};
  for (const s of slugs) {
    result[s] = getStayStatus(s);
  }
  return result;
}
