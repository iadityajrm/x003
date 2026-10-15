export interface CurrentGuestBooking {
  guestPhone: string;
  guestName?: string;
  checkInDate?: string;
  checkOutDate?: string;
  daysOfStay?: string | number;
  notes?: string;
  updatedAt: string;
}

const STORAGE_PREFIX = 'dwellio_current_guest_';
const UNLOCKED_KEY_PREFIX = 'dwellio_unlocked_guest_';

/**
 * Normalize phone numbers by removing all non-digit characters
 */
export function normalizePhoneNumber(phone: string): string {
  return (phone || '').replace(/\D/g, '');
}

/**
 * Default sample bookings for demo properties so the experience works immediately
 */
const DEFAULT_DEMO_BOOKINGS: Record<string, CurrentGuestBooking> = {
  'cedar-house': {
    guestPhone: '555-0192',
    guestName: 'Sarah Jenkins',
    daysOfStay: 3,
    updatedAt: new Date().toISOString(),
  },
  'pine-crest-villa': {
    guestPhone: '555-0144',
    guestName: 'Alex Mercer',
    daysOfStay: 4,
    updatedAt: new Date().toISOString(),
  },
  'seaside-haven': {
    guestPhone: '555-0188',
    guestName: 'David Lee',
    daysOfStay: 2,
    updatedAt: new Date().toISOString(),
  },
};

/**
 * Get the current guest booking configuration set by the client for a property
 */
export function getCurrentGuestBooking(slug: string): CurrentGuestBooking | null {
  if (typeof window === 'undefined') {
    return DEFAULT_DEMO_BOOKINGS[slug] || null;
  }
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + slug);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to read current guest booking:', err);
  }
  return DEFAULT_DEMO_BOOKINGS[slug] || null;
}

/**
 * Save current guest booking information from Client Dashboard
 */
export function saveCurrentGuestBooking(slug: string, booking: CurrentGuestBooking | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (!booking) {
      localStorage.removeItem(STORAGE_PREFIX + slug);
    } else {
      localStorage.setItem(STORAGE_PREFIX + slug, JSON.stringify(booking));
    }
    window.dispatchEvent(new CustomEvent('guest-booking-updated', { detail: { slug, booking } }));
  } catch (err) {
    console.error('Failed to save current guest booking:', err);
  }
}

/**
 * Check if the guest has already verified/unlocked codes in their browser session
 */
export function isCodesUnlockedForGuest(slug: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const unlocked = sessionStorage.getItem(UNLOCKED_KEY_PREFIX + slug) || localStorage.getItem(UNLOCKED_KEY_PREFIX + slug);
    return unlocked === 'true';
  } catch {
    return false;
  }
}

/**
 * Mark codes as unlocked for this guest
 */
export function setCodesUnlockedForGuest(slug: string, unlocked: boolean = true): void {
  if (typeof window === 'undefined') return;
  try {
    if (unlocked) {
      sessionStorage.setItem(UNLOCKED_KEY_PREFIX + slug, 'true');
      localStorage.setItem(UNLOCKED_KEY_PREFIX + slug, 'true');
    } else {
      sessionStorage.removeItem(UNLOCKED_KEY_PREFIX + slug);
      localStorage.removeItem(UNLOCKED_KEY_PREFIX + slug);
    }
    window.dispatchEvent(new CustomEvent('guest-codes-unlocked-changed', { detail: { slug, unlocked } }));
  } catch {
    // ignore
  }
}

/**
 * Verify whether an entered phone number matches the current booked guest phone
 * (or fallback to host phone for emergency access)
 */
export function verifyGuestPhoneNumber(slug: string, enteredPhone: string, hostPhone?: string): boolean {
  const normEntered = normalizePhoneNumber(enteredPhone);
  if (!normEntered || normEntered.length < 4) return false;

  const booking = getCurrentGuestBooking(slug);
  if (booking && booking.guestPhone) {
    const normBooked = normalizePhoneNumber(booking.guestPhone);
    // Compare last 4 digits minimum or direct match if lengths comparable
    if (normBooked === normEntered) return true;
    if (normBooked.endsWith(normEntered) || normEntered.endsWith(normBooked)) return true;
    if (normEntered.length >= 7 && normBooked.slice(-7) === normEntered.slice(-7)) return true;
  }

  // Also allow host's phone as universal bypass
  if (hostPhone) {
    const normHost = normalizePhoneNumber(hostPhone);
    if (normHost === normEntered || (normEntered.length >= 7 && normHost.slice(-7) === normEntered.slice(-7))) {
      return true;
    }
  }

  return false;
}
