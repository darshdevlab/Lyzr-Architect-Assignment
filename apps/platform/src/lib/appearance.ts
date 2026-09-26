import type { Theme, Mode } from './model';
export type PersonalAppearance = { theme: Theme; mode: Mode; compact: boolean };
export const defaultAppearance: PersonalAppearance = {
  theme: 'atelier',
  mode: 'light',
  compact: false,
};
export function normalizeAppearance(value: unknown): PersonalAppearance {
  const v = value && typeof value === 'object' ? (value as Partial<PersonalAppearance>) : {};
  return {
    theme: ['atelier', 'current', 'prism'].includes(v.theme || '')
      ? v.theme!
      : defaultAppearance.theme,
    mode: ['light', 'dark', 'system'].includes(v.mode || '') ? v.mode! : defaultAppearance.mode,
    compact: v.compact === true,
  };
}
export function readAppearance(account?: string): PersonalAppearance {
  try {
    const query = new URLSearchParams(location.search);
    if (query.has('theme') && query.has('mode')) {
      const value = normalizeAppearance({
        theme: query.get('theme'),
        mode: query.get('mode'),
        compact: false,
      });
      saveAppearance(value, account);
      const clean = new URL(location.href);
      clean.searchParams.delete('theme');
      clean.searchParams.delete('mode');
      history.replaceState({}, '', clean);
      return value;
    }
    if (account) {
      const pending = sessionStorage.getItem('architect.appearance.pending');
      if (pending) {
        sessionStorage.removeItem('architect.appearance.pending');
        const next = normalizeAppearance(JSON.parse(pending));
        saveAppearance(next, account);
        return next;
      }
    }
    const raw =
      (account && localStorage.getItem('architect.appearance.' + account)) ||
      localStorage.getItem('architect.appearance.device');
    return normalizeAppearance(raw ? JSON.parse(raw) : null);
  } catch {
    return { ...defaultAppearance };
  }
}
export function saveAppearance(value: PersonalAppearance, account?: string) {
  try {
    const raw = JSON.stringify(normalizeAppearance(value));
    localStorage.setItem('architect.appearance.device', raw);
    if (account) localStorage.setItem('architect.appearance.' + account, raw);
    else sessionStorage.setItem('architect.appearance.pending', raw);
  } catch {
    /* Appearance remains usable when storage is unavailable. */
  }
}
