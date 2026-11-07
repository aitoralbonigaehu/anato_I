'use client';

import { useSyncExternalStore } from 'react';

/** The reader's choice: follow the device, or always dark / always light. */
export type ThemePref = 'system' | 'dark' | 'light';
export type Theme = 'dark' | 'light';

import { THEME_KEY } from './theme-script';

export { THEME_KEY };

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

const readPref = (): ThemePref => {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === 'dark' || v === 'light' ? v : 'system';
  } catch {
    return 'system';
  }
};

const resolve = (p: ThemePref): Theme =>
  p === 'system' ? (typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark') : p;

/** Apply a theme with a short cross-fade (never on first paint). */
const apply = (t: Theme) => {
  const html = document.documentElement;
  if (html.dataset.theme === t) return;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!calm) html.classList.add('is-theming');
  html.dataset.theme = t;
  if (!calm) window.setTimeout(() => html.classList.remove('is-theming'), 360);
};

export function setThemePref(p: ThemePref) {
  try {
    if (p === 'system') localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, p);
  } catch {}
  apply(resolve(p));
  emit();
}

/** The next choice in the cycle the bar's key walks through: system → light → dark → system. */
export const nextThemePref = (p: ThemePref): ThemePref => (p === 'system' ? 'light' : p === 'light' ? 'dark' : 'system');

let watching = false;
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  if (!watching && typeof window !== 'undefined') {
    watching = true;
    // Following the device: a change of the system setting applies at once.
    matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
      if (readPref() === 'system') {
        apply(resolve('system'));
        emit();
      }
    });
    window.addEventListener('storage', (e) => {
      if (e.key === THEME_KEY) {
        apply(resolve(readPref()));
        emit();
      }
    });
  }
  return () => {
    listeners.delete(cb);
  };
};

/** The stored choice and the theme it resolves to, for the theme key and the command bar. */
export function useTheme(): { pref: ThemePref; theme: Theme } {
  const pref = useSyncExternalStore(subscribe, readPref, () => 'system' as ThemePref);
  const theme = useSyncExternalStore(
    subscribe,
    () => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark') as Theme,
    () => 'dark' as Theme,
  );
  return { pref, theme };
}

export const THEME_LABEL: Record<ThemePref, string> = { system: 'Gailuaren arabera', light: 'Argia', dark: 'Iluna' };
