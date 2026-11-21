/**
 * A pretend backend for development only: accounts and their progress live in this browser's
 * localStorage, so the sign-in screens and the cloud sync can be tried before Supabase is connected.
 * Turned on with `localStorage['enbrioatlas:dev-kontuak'] = 'mock'` and never in a production build.
 * It is not secure in any way and is not meant to be.
 */

import type { ProgressBlob } from './snapshot';
import { checkName, checkPin, cleanName, LOCK_SECONDS, MAX_FAILS, nameKey, type AccountBackend, type AccountUser, type AuthResult } from './types';

const DB = 'enbrioatlas:dev-kontuak:db';
const SESSION = 'enbrioatlas:dev-kontuak:saioa';

interface Row {
  user: AccountUser;
  pin?: string;
  fails: number;
  lockedUntil: number;
  blob: ProgressBlob | null;
}
type Db = Record<string, Row>;

const read = (): Db => {
  try {
    return JSON.parse(window.localStorage.getItem(DB) ?? '{}') as Db;
  } catch {
    return {};
  }
};
const write = (db: Db) => window.localStorage.setItem(DB, JSON.stringify(db));
const wait = () => new Promise((r) => setTimeout(r, 350));
const session = () => window.localStorage.getItem(SESSION);

export const mockBackend: AccountBackend = {
  kind: 'mock',
  async currentUser() {
    const id = session();
    return id ? (read()[id]?.user ?? null) : null;
  },
  onSessionChange(listener) {
    window.addEventListener('storage', (event) => {
      if (event.key !== SESSION && event.key !== null) return;
      const id = session();
      listener(id ? (read()[id]?.user ?? null) : null);
    });
  },
  async signUpWithPin(name, pin): Promise<AuthResult> {
    await wait();
    if (checkName(name) || checkPin(pin)) return { ok: false, error: 'invalid' };
    const db = read();
    const id = `pin:${nameKey(name)}`;
    if (db[id]) return { ok: false, error: 'taken' };
    db[id] = { user: { id, name: cleanName(name), provider: 'pin' }, pin, fails: 0, lockedUntil: 0, blob: null };
    write(db);
    window.localStorage.setItem(SESSION, id);
    return { ok: true, user: db[id].user };
  },
  async signInWithPin(name, pin): Promise<AuthResult> {
    await wait();
    if (checkName(name) || checkPin(pin)) return { ok: false, error: 'invalid' };
    const db = read();
    const id = `pin:${nameKey(name)}`;
    const row = db[id];
    const now = Date.now();
    if (row && row.lockedUntil > now) return { ok: false, error: 'locked', retryAfterSec: Math.ceil((row.lockedUntil - now) / 1000) };
    if (!row || row.pin !== pin) {
      if (row) {
        row.fails += 1;
        if (row.fails >= MAX_FAILS) {
          row.fails = 0;
          row.lockedUntil = now + LOCK_SECONDS * 1000;
        }
        write(db);
      }
      return { ok: false, error: 'wrong' };
    }
    row.fails = 0;
    write(db);
    window.localStorage.setItem(SESSION, id);
    return { ok: true, user: row.user };
  },
  async signOut() {
    window.localStorage.removeItem(SESSION);
  },
  async loadProgress(owner) {
    if (session() !== owner) throw new Error('Study account changed');
    const blob = read()[owner]?.blob;
    return blob ? { blob, revision: String(blob.savedAt) } : null;
  },
  async saveProgress(owner, blob, revision) {
    const db = read();
    const row = db[owner];
    if (session() !== owner || !row) return 'failed';
    if ((row.blob ? String(row.blob.savedAt) : null) !== revision) return 'conflict';
    row.blob = blob;
    write(db);
    return 'saved';
  },
};
