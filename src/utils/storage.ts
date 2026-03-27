export type Expiring<T> = { data: T; expiresAt: number };

const DAY_MS = 24 * 60 * 60 * 1000;

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function setExpiringItem<T>(key: string, value: T, ttlMs: number = DAY_MS): void {
  if (!canUseStorage()) return;
  const payload: Expiring<T> = { data: value, expiresAt: Date.now() + ttlMs };
  window.localStorage.setItem(key, JSON.stringify(payload));
}

export function getExpiringItem<T>(key: string): T | null {
  if (!canUseStorage()) return null;
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Expiring<T>;
    if (!parsed || typeof parsed.expiresAt !== "number") return null;
    if (Date.now() > parsed.expiresAt) {
      window.localStorage.removeItem(key);
      return null;
    }
    return parsed.data as T;
  } catch {
    return null;
  }
}

export function mergeExpiringMap(key: string, updates: Record<string, unknown>, ttlMs: number = DAY_MS): void {
  const prev = getExpiringItem<Record<string, unknown>>(key) || {};
  const next = { ...prev, ...updates };
  setExpiringItem<Record<string, unknown>>(key, next, ttlMs);
}

export const QUIZ_STORE_KEY = "carcupid_quiz_answers";

export function getQuizAnswers(): Record<string, unknown> | null {
  return getExpiringItem<Record<string, unknown>>(QUIZ_STORE_KEY);
}

export function clearQuizAnswers(): void {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(QUIZ_STORE_KEY);
}

export function quizAnswerKey(id: string): string {
  return `q:${id}`;
}

export function setQuestionAnswer(id: string, value: unknown): void {
  const key = quizAnswerKey(id);
  mergeExpiringMap(QUIZ_STORE_KEY, { [key]: value }, DAY_MS);
}

export function getQuestionAnswer<T = unknown>(id: string): T | null {
  const all = getQuizAnswers();
  if (!all) return null;
  const key = quizAnswerKey(id);
  const v = all[key] as T | undefined;
  return typeof v === "undefined" ? null : v;
}

export const RESULTS_STORE_KEY = "autoMatch_savedResults";
export const RESULTS_UPDATED_EVENT = "autoMatch_results_updated";

export function getSavedResults(): { results: unknown[]; timestamp: number; expiresAt: number } | null {
  if (!canUseStorage()) return null;
  const raw = window.localStorage.getItem(RESULTS_STORE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.expiresAt !== "number") return null;
    if (Date.now() > parsed.expiresAt) {
      window.localStorage.removeItem(RESULTS_STORE_KEY);
      window.dispatchEvent(new Event(RESULTS_UPDATED_EVENT));
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveResults(results: unknown[]): void {
  if (!canUseStorage()) return;
  const savedData = {
    results,
    timestamp: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  };
  window.localStorage.setItem(RESULTS_STORE_KEY, JSON.stringify(savedData));
  window.dispatchEvent(new Event(RESULTS_UPDATED_EVENT));
}

export function clearSavedResults(): void {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(RESULTS_STORE_KEY);
  window.dispatchEvent(new Event(RESULTS_UPDATED_EVENT));
}

export type WishlistItem = {
  id: string;
  year?: number;
  make?: string;
  model?: string;
  trim?: string;
  image?: string;
  title?: string;
  subtitle?: string;
};

export const WISHLIST_STORE_KEY = "autoMatch_wishlist";
export const WISHLIST_UPDATED_EVENT = "autoMatch_wishlist_updated";

export function getWishlist(): { items: WishlistItem[]; timestamp: number; expiresAt: number } | null {
  if (!canUseStorage()) return null;
  const raw = window.localStorage.getItem(WISHLIST_STORE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.expiresAt !== "number") return null;
    if (Date.now() > parsed.expiresAt) {
      window.localStorage.removeItem(WISHLIST_STORE_KEY);
      window.dispatchEvent(new Event(WISHLIST_UPDATED_EVENT));
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function setWishlist(items: WishlistItem[]): void {
  if (!canUseStorage()) return;
  const payload = {
    items,
    timestamp: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000
  };
  window.localStorage.setItem(WISHLIST_STORE_KEY, JSON.stringify(payload));
  window.dispatchEvent(new Event(WISHLIST_UPDATED_EVENT));
}

export function addWishlistItem(item: WishlistItem): void {
  const current = getWishlist();
  const items = current?.items || [];
  const exists = items.some(i => i.id === item.id);
  const next = exists ? items : [item, ...items];
  setWishlist(next);
}

export function removeWishlistItem(id: string): void {
  const current = getWishlist();
  const items = current?.items || [];
  const next = items.filter(i => i.id !== id);
  setWishlist(next);
}

export function isWishlisted(id?: string | null): boolean {
  if (!id) return false;
  const current = getWishlist();
  const items = current?.items || [];
  return items.some(i => i.id === id);
}

export function getWishlistCount(): number {
  const current = getWishlist();
  return (current?.items || []).length;
}
