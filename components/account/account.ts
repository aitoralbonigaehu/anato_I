'use client';

import { useSyncExternalStore } from 'react';
import { initializeStudyOwner } from '@/lib/study/storage-scope';
import { getBackend } from '@/lib/account/backend';
import { applySnapshot, collectSnapshot, isEmptySnapshot, mergeSnapshot, sameSnapshot } from '@/lib/account/snapshot';
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
  accountMode?: 'sartu' | 'sortu';
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
let ready = false;
let reloading = false;
let running: Promise<void> | null = null;
const EVERY = 3 * 60_000;

export function syncNow(): Promise<void> {
  const owner = state.user?.id;
  if (reloading || !backend || state.status !== 'in' || !owner) return Promise.resolve();
  if (running) return running;
  const b = backend;
  running = (async () => {
    set({ syncing: true });
    try {
      for (let attempt = 0; attempt < 3; attempt++) {
        if (reloading) return;
        const remote = await b.loadProgress(owner);
        if ((await b.currentUser())?.id !== owner || reloading) return;
        const local = collectSnapshot();
        if (!remote && isEmptySnapshot(local)) return;
        const merged = remote ? mergeSnapshot(local, remote.blob.data) : local;
        if (!sameSnapshot(merged, local)) applySnapshot(merged);
        if (!remote || !sameSnapshot(merged, remote.blob.data)) {
          const result = await b.saveProgress(owner, { v: 1, savedAt: Date.now(), data: merged }, remote?.revision ?? null);
          if (result === 'conflict') continue;
          if (result === 'failed') return;
        }
        if (!reloading) set({ synced: Date.now() });
        return;
      }
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
  let observed: AccountUser | null | undefined;
  backend.onSessionChange?.((user) => {
    observed = user;
    if (ready) changeSession(user);
  });
  let restored: AccountUser | null = null;
  try {
    restored = await backend.currentUser();
  } catch {
    // A session that cannot be restored must not select an account's local progress.
  }
  const user = observed === undefined ? restored : observed;
  initializeStudyOwner(user?.id ?? null);
  ready = true;
  set({ status: user ? 'in' : 'out', user });
  window.addEventListener('pageshow', (event) => {
    if (event.persisted && !reloading) {
      void backend?.currentUser().then(changeSession, reloadStudy);
    }
  });
  if (state.status === 'in') void syncNow();
  window.setInterval(() => !document.hidden && void syncNow(), EVERY);
  document.addEventListener('visibilitychange', () => void syncNow());
  window.addEventListener('online', () => void syncNow());
}

function reloadStudy() {
  if (reloading) return;
  reloading = true;
  set({ status: 'loading', user: null, asking: false });
  window.setTimeout(() => window.location.replace('/aurrerapena'), 0);
}

function changeSession(user: AccountUser | null) {
  if (user?.id !== state.user?.id) reloadStudy();
}

function afterSignIn(r: AuthResult): AuthResult {
  if (r.ok) changeSession(r.user);
  return r;
}

export const signInWithPin = async (name: string, pin: string) => (backend ? afterSignIn(await backend.signInWithPin(name, pin)) : ({ ok: false, error: 'unavailable' } as AuthResult));
export const signUpWithPin = async (name: string, pin: string) => (backend ? afterSignIn(await backend.signUpWithPin(name, pin)) : ({ ok: false, error: 'unavailable' } as AuthResult));

export async function signOut() {
  await syncNow();
  await backend?.signOut();
  changeSession(null);
}

// ---- the first-visit card ------------------------------------------------------------------------

const ASKED = 'enbrioatlas:kontua-galdetuta';

/** Opens the account card on "Sortu kontua" (a first visit) or "Hasi saioa". */
export function openAccount(mode: 'sartu' | 'sortu') {
  if (state.status === 'out') set({ asking: true, accountMode: mode });
}

export const askAccount = () => openAccount('sortu');

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
