'use client';

import { useSyncExternalStore } from 'react';
import { getBackend } from '@/lib/account/backend';
import { applySnapshot, collectSnapshot, mergeSnapshot, sameSnapshot } from '@/lib/account/snapshot';
import type { AccountBackend, AccountUser, AuthResult } from '@/lib/account/types';

/**
 * The account, client side: who is signed in, and the sync that keeps this browser's progress and the
 * cloud copy the same (pull → merge → write here → push, on sign-in, on load, every few minutes and
 * when the page is hidden). Without a backend the status is 'off' and nothing happens.
 */

export type Status = 'off' | 'loading' | 'out' | 'in';
export interface AccountState {
  status: Status;
  user: AccountUser | null;
  syncing: boolean;
  /** Last successful sync (ms), 0 never. */
  synced: number;
  /** The first-visit card ("Gorde zure aurrerapena") is open. */
  asking: boolean;
}

const SERVER: AccountState = { status: 'off', user: null, syncing: false, synced: 0, asking: false };
let state: AccountState = { ...SERVER, status: 'loading' };
const listeners = new Set<() => void>();
const set = (next: Partial<AccountState>) => {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
};
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};

export const useAccount = () => useSyncExternalStore(subscribe, () => state, () => SERVER);
export const accountState = () => state;

let backend: AccountBackend | null = null;
let started = false;
let running: Promise<void> | null = null;
const EVERY = 3 * 60_000;

/** Pull, merge, write here, push. One at a time; a failure is retried on the next turn. */
export function syncNow(): Promise<void> {
  if (!backend || state.status !== 'in') return Promise.resolve();
  if (running) return running;
  const b = backend;
  running = (async () => {
    set({ syncing: true });
    try {
      const remote = await b.loadProgress();
      const local = collectSnapshot();
      const merged = remote ? mergeSnapshot(local, remote.data) : local;
      if (!sameSnapshot(merged, local)) applySnapshot(merged);
      if (!remote || !sameSnapshot(merged, remote.data)) {
        if (!(await b.saveProgress({ v: 1, savedAt: Date.now(), data: merged }))) return;
      }
      set({ synced: Date.now() });
    } catch {
      // Offline or the backend failed: the next turn tries again.
    } finally {
      set({ syncing: false });
      running = null;
    }
  })();
  return running;
}

/** Called once by <AccountRoot>: finds the backend and the session, and starts syncing. */
export async function startAccounts() {
  if (started) return;
  started = true;
  backend = getBackend();
  if (!backend) return set({ status: 'off' });
  try {
    const user = await backend.currentUser();
    set({ status: user ? 'in' : 'out', user });
  } catch {
    set({ status: 'out', user: null });
  }
  if (state.status === 'in') void syncNow();
  window.setInterval(() => !document.hidden && void syncNow(), EVERY);
  document.addEventListener('visibilitychange', () => document.hidden && void syncNow());
}

async function afterSignIn(r: AuthResult): Promise<AuthResult> {
  if (r.ok) {
    set({ status: 'in', user: r.user, asking: false });
    await syncNow();
  }
  return r;
}

export const signInWithPin = async (name: string, pin: string) => (backend ? afterSignIn(await backend.signInWithPin(name, pin)) : ({ ok: false, error: 'unavailable' } as AuthResult));
export const signUpWithPin = async (name: string, pin: string) => (backend ? afterSignIn(await backend.signUpWithPin(name, pin)) : ({ ok: false, error: 'unavailable' } as AuthResult));

export async function signOut() {
  await syncNow();
  await backend?.signOut();
  set({ status: 'out', user: null, synced: 0 });
}

// ---- the first-visit card ------------------------------------------------------------------------

const ASKED = 'enbrioatlas:kontua-galdetuta';

/** Opens the sign-in card (from any "Hasi saioa" button). */
export const askAccount = () => state.status !== 'off' && set({ asking: true });

export function closeAccountCard() {
  try {
    window.localStorage.setItem(ASKED, '1');
  } catch {}
  set({ asking: false });
}

/** Whether the first visit already offered an account (it is offered once; buttons offer it again). */
export function wasAskedAccount(): boolean {
  try {
    return window.localStorage.getItem(ASKED) === '1';
  } catch {
    return true;
  }
}
