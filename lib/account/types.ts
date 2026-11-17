import type { ProgressBlob } from './snapshot';

/**
 * The account contract. The UI (components/account) only talks to an `AccountBackend`; the Supabase
 * implementation lives in lib/account/supabase.ts (see supabase/README.md for the hand-over).
 */

export interface AccountUser {
  id: string;
  /** What the app calls the student: the name they chose. */
  name: string;
  provider: 'pin';
}

export type AuthError =
  /** Sign-up: that name is already taken (choose another, or sign in). */
  | 'taken'
  /** Sign-in: no such name, or the PIN is wrong (never says which). */
  | 'wrong'
  /** Too many failed tries for this name: wait `retryAfterSec`. */
  | 'locked'
  /** The name or PIN does not follow the rules (validated on the client too). */
  | 'invalid'
  | 'network'
  /** The backend is not configured or not reachable. */
  | 'unavailable';

export type AuthResult = { ok: true; user: AccountUser } | { ok: false; error: AuthError; retryAfterSec?: number };

export interface AccountBackend {
  readonly kind: 'supabase' | 'mock';
  /** The signed-in user (a restored session); null when signed out. */
  currentUser(): Promise<AccountUser | null>;
  signInWithPin(name: string, pin: string): Promise<AuthResult>;
  signUpWithPin(name: string, pin: string): Promise<AuthResult>;
  signOut(): Promise<void>;
  /** The saved document, or null when no row exists. Throws on errors so sync never overwrites an unread document. */
  loadProgress(): Promise<ProgressBlob | null>;
  /** Replaces the saved progress document; false on error (it is retried on the next sync). */
  saveProgress(blob: ProgressBlob): Promise<boolean>;
}

// ---- the rules for a name and a PIN (client and server share them) ------------------------------

export const NAME_MIN = 3;
export const NAME_MAX = 24;
export const PIN_LENGTH = 4;
/** Failed sign-ins per name before it is locked, and for how long. */
export const MAX_FAILS = 5;
export const LOCK_SECONDS = 15 * 60;

/** The name as shown: trimmed, single spaces. */
export const cleanName = (raw: string) => raw.normalize('NFC').trim().replace(/\s+/g, ' ');

/** The name as a key: no case, no accents, so «Ane», «ane» and «Ané» are the same account. */
export const nameKey = (raw: string) =>
  cleanName(raw)
    .toLocaleLowerCase('eu')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\s/g, '-');

export function checkName(raw: string): string | null {
  const name = cleanName(raw);
  if (name.length < NAME_MIN) return `Izenak ${NAME_MIN} karaktere behar ditu gutxienez.`;
  if (name.length > NAME_MAX) return `Izenak ${NAME_MAX} karaktere ditu gehienez.`;
  if (!/^[\p{L}\p{N}][\p{L}\p{N} ._-]*$/u.test(name)) return 'Erabili letrak, zenbakiak, espazioak edo - _ .';
  return null;
}

export function checkPin(pin: string): string | null {
  if (!new RegExp(`^\\d{${PIN_LENGTH}}$`).test(pin)) return `PINak ${PIN_LENGTH} zenbaki ditu.`;
  return null;
}
