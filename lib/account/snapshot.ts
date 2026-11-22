/**
 * A student's whole study progress as one JSON document: every store kept in this browser, by its
 * localStorage key. An account synchronizes its own copy across devices. Each store reconciles
 * differences according to its data model, including choosing one version for some per-item histories.
 */

import { studyKey } from '@/lib/study/storage-scope';
import { ACTIVITY_KEY, mergeActivity, parseActivity } from '@/lib/study/activity';
import { mergeSceneMarks, SCENE_MARKS_KEY } from '@/lib/study/scene-marks';

export type Snapshot = Record<string, unknown>;

export interface ProgressBlob {
  v: 1;
  savedAt: number;
  data: Snapshot;
}

/** Everything that is progress (not preferences: theme, speed, voice stay per device). */
export const SYNC_KEYS = [
  ACTIVITY_KEY,
  SCENE_MARKS_KEY,
  'enbrioatlas:visited',
  'enbrioatlas:places',
  'enbrioatlas:last',
  'enbrioatlas:answers',
  'enbrioatlas:belortzioak',
  'enbrioatlas:belortzioak:marks',
  'enbrioatlas.scheme-review.v1',
] as const;

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);

/** Per entry of a record: both sides' entry, the chosen one wins. */
function byEntry(a: unknown, b: unknown, pick: (x: unknown, y: unknown) => unknown): unknown {
  if (!isObj(a)) return isObj(b) ? b : a;
  if (!isObj(b)) return a;
  const out: Record<string, unknown> = {};
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) out[k] = !(k in a) ? b[k] : !(k in b) ? a[k] : pick(a[k], b[k]);
  return out;
}

const n = (v: unknown, k: string) => (isObj(v) && typeof v[k] === 'number' ? (v[k] as number) : 0);
/** Latest attempt of an answer record ([time, ok] pairs). */
const lastTry = (v: unknown) => (isObj(v) && Array.isArray(v.hist) && v.hist.length ? Number((v.hist[v.hist.length - 1] as unknown[])[0]) || 0 : 0);

const MERGE: Record<string, (local: unknown, remote: unknown) => unknown> = {
  [ACTIVITY_KEY]: (a, b) => mergeActivity(parseActivity(a), parseActivity(b)),
  [SCENE_MARKS_KEY]: mergeSceneMarks,
  // Stages opened per topic: the union, in the order first seen.
  'enbrioatlas:visited': (a, b) =>
    byEntry(a, b, (x, y) => {
      const xs = Array.isArray(x) ? x.filter((s) => typeof s === 'string') : [];
      const ys = Array.isArray(y) ? y.filter((s) => typeof s === 'string') : [];
      return [...new Set([...xs, ...ys])];
    }),
  // Where each topic was left: this device's place wins; the other fills topics it never opened.
  'enbrioatlas:places': (a, b) => byEntry(a, b, (x) => x),
  'enbrioatlas:last': (a, b) => (isObj(a) ? a : b),
  // An answer's history: the copy with the latest attempt (then the one with more attempts).
  'enbrioatlas:answers': (a, b) => byEntry(a, b, (x, y) => (lastTry(y) > lastTry(x) || (lastTry(y) === lastTry(x) && n(y, 'right') + n(y, 'wrong') > n(x, 'right') + n(x, 'wrong')) ? y : x)),
  // A flashcard: the copy answered more often (then the one due later).
  'enbrioatlas:belortzioak': (a, b) => byEntry(a, b, (x, y) => (n(y, 'ok') + n(y, 'bad') > n(x, 'ok') + n(x, 'bad') || (n(y, 'ok') + n(y, 'bad') === n(x, 'ok') + n(x, 'bad') && n(y, 'due') > n(x, 'due')) ? y : x)),
  'enbrioatlas:belortzioak:marks': (a, b) => byEntry(a, b, (x) => x),
  // A scheme card: the copy reviewed last.
  'enbrioatlas.scheme-review.v1': (a, b) => {
    const unwrap = (v: unknown) => (isObj(v) && 'version' in v && isObj(v.progress) ? v.progress : v);
    return byEntry(unwrap(a), unwrap(b), (x, y) => (n(y, 'lastReviewed') > n(x, 'lastReviewed') ? y : x));
  },
};

/** Merges the cloud copy into this device's copy. Unknown keys are kept as they are. */
export function mergeSnapshot(local: Snapshot, remote: Snapshot): Snapshot {
  const out: Snapshot = { ...remote, ...local };
  for (const k of SYNC_KEYS) {
    const has = (s: Snapshot) => s[k] !== undefined && s[k] !== null;
    if (has(local) && has(remote)) out[k] = MERGE[k](local[k], remote[k]);
    else out[k] = has(local) ? local[k] : remote[k];
    if (out[k] === undefined || out[k] === null) delete out[k];
  }
  return out;
}

/** Stable JSON (sorted keys), so two equal snapshots compare equal. */
export function stableJson(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(stableJson).join(',')}]`;
  if (isObj(v))
    return `{${Object.keys(v)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${stableJson(v[k])}`)
      .join(',')}}`;
  return JSON.stringify(v) ?? 'null';
}

export const sameSnapshot = (a: Snapshot, b: Snapshot) => stableJson(a) === stableJson(b);

/** Whether a snapshot holds any progress at all. */
export const isEmptySnapshot = (s: Snapshot) => SYNC_KEYS.every((k) => s[k] === undefined || (isObj(s[k]) && !Object.keys(s[k] as object).length));

// ---- the browser side ------------------------------------------------------------------------------

export function collectSnapshot(): Snapshot {
  const out: Snapshot = {};
  for (const k of SYNC_KEYS) {
    try {
      const raw = window.localStorage.getItem(studyKey(k));
      if (raw !== null) out[k] = JSON.parse(raw);
    } catch {
      // An unreadable store is left out (and so never overwrites the cloud copy).
    }
  }
  return out;
}

/** Writes a merged snapshot back and tells every store on the page to read it again. */
export function applySnapshot(s: Snapshot) {
  for (const k of SYNC_KEYS) {
    if (s[k] === undefined) continue;
    try {
      window.localStorage.setItem(studyKey(k), JSON.stringify(s[k]));
    } catch {
      // Storage unavailable: the cloud keeps the copy.
    }
  }
  try {
    window.dispatchEvent(new StorageEvent('storage', { key: null }));
  } catch {
    // Old browsers: the stores catch up on the next page.
  }
}
