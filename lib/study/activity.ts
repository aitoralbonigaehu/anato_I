/**
 * Study activity kept in this browser: how many times each stage of the simulator was opened, how long
 * it was studied, and what was done each day (seconds studied, flashcards and questions right/wrong).
 * The progress page ("Aurrerapena") draws everything from here and from the other study stores; a
 * signed-in account has its own copy in this browser.
 *
 * Pure helpers (record*, mergeActivity) take and return snapshots, so they can be tested; the browser
 * store at the bottom wraps them with localStorage.
 */

import { studyKey } from './storage-scope';

export const ACTIVITY_KEY = 'enbrioatlas:jarduera';

export interface StageStat {
  /** Times the stage was opened. */
  n: number;
  /** Seconds studied on it (page visible and in use). */
  s: number;
  first: number;
  last: number;
}

export interface DayStat {
  /** Seconds studied. */
  s: number;
  /** Stages opened. */
  st: number;
  /** Answers and flashcards: right / wrong. */
  ok: number;
  bad: number;
}

export interface Activity {
  v: 1;
  /** By `${week}/${stageId}`. */
  stages: Record<string, StageStat>;
  /** By local date, YYYY-MM-DD. */
  days: Record<string, DayStat>;
}

export const emptyActivity = (): Activity => ({ v: 1, stages: {}, days: {} });

export const stageKey = (week: number, stageId: string) => `${week}/${stageId}`;

export function dayKey(t: number): string {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const day = (a: Activity, t: number): DayStat => a.days[dayKey(t)] ?? { s: 0, st: 0, ok: 0, bad: 0 };

export function recordStageOpen(a: Activity, week: number, stageId: string, now: number): Activity {
  const k = stageKey(week, stageId);
  const prev = a.stages[k];
  const d = day(a, now);
  return {
    ...a,
    stages: { ...a.stages, [k]: { n: (prev?.n ?? 0) + 1, s: prev?.s ?? 0, first: prev?.first ?? now, last: now } },
    days: { ...a.days, [dayKey(now)]: { ...d, st: d.st + 1 } },
  };
}

/** Time on a stage; capped per call so a sleeping laptop never adds hours. */
export function recordStudyTime(a: Activity, week: number, stageId: string, seconds: number, now: number): Activity {
  const sec = Math.round(Math.min(120, seconds));
  if (!Number.isFinite(sec) || sec <= 0) return a;
  const k = stageKey(week, stageId);
  const prev = a.stages[k] ?? { n: 1, s: 0, first: now, last: now };
  const d = day(a, now);
  return {
    ...a,
    stages: { ...a.stages, [k]: { ...prev, s: prev.s + sec, last: now } },
    days: { ...a.days, [dayKey(now)]: { ...d, s: d.s + sec } },
  };
}

/** One answer or flashcard, from any study page. */
export function recordRecall(a: Activity, ok: boolean, now: number): Activity {
  const d = day(a, now);
  return { ...a, days: { ...a.days, [dayKey(now)]: { ...d, ok: d.ok + (ok ? 1 : 0), bad: d.bad + (ok ? 0 : 1) } } };
}

const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : 0);

export function parseActivity(raw: unknown): Activity {
  const out = emptyActivity();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
  const r = raw as Record<string, unknown>;
  if (r.stages && typeof r.stages === 'object')
    for (const [k, v] of Object.entries(r.stages as Record<string, unknown>)) {
      if (!/^\d+\/./.test(k) || !v || typeof v !== 'object') continue;
      const x = v as Record<string, unknown>;
      out.stages[k] = { n: num(x.n), s: num(x.s), first: num(x.first), last: num(x.last) };
    }
  if (r.days && typeof r.days === 'object')
    for (const [k, v] of Object.entries(r.days as Record<string, unknown>)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(k) || !v || typeof v !== 'object') continue;
      const x = v as Record<string, unknown>;
      out.days[k] = { s: num(x.s), st: num(x.st), ok: num(x.ok), bad: num(x.bad) };
    }
  return out;
}

/**
 * Two copies of the same student's activity (this device and the cloud): each count is the larger of
 * the two, so merging twice, or merging a copy with itself, never inflates anything.
 */
export function mergeActivity(a: Activity, b: Activity): Activity {
  const out = emptyActivity();
  for (const k of new Set([...Object.keys(a.stages), ...Object.keys(b.stages)])) {
    const x = a.stages[k];
    const y = b.stages[k];
    out.stages[k] = !x ? y : !y ? x : { n: Math.max(x.n, y.n), s: Math.max(x.s, y.s), first: Math.min(x.first || y.first, y.first || x.first), last: Math.max(x.last, y.last) };
  }
  for (const k of new Set([...Object.keys(a.days), ...Object.keys(b.days)])) {
    const x = a.days[k];
    const y = b.days[k];
    out.days[k] = !x ? y : !y ? x : { s: Math.max(x.s, y.s), st: Math.max(x.st, y.st), ok: Math.max(x.ok, y.ok), bad: Math.max(x.bad, y.bad) };
  }
  return out;
}

// ---- the browser store -----------------------------------------------------------------------------

let cache: Activity | null = null;
const listeners = new Set<() => void>();
const EMPTY = emptyActivity();

export function readActivity(): Activity {
  if (cache) return cache;
  try {
    cache = parseActivity(JSON.parse(window.localStorage.getItem(studyKey(ACTIVITY_KEY)) ?? 'null'));
  } catch {
    cache = emptyActivity();
  }
  return cache;
}

function write(next: Activity) {
  cache = next;
  try {
    window.localStorage.setItem(studyKey(ACTIVITY_KEY), JSON.stringify(next));
  } catch {
    // Storage unavailable: this page still counts, nothing is remembered.
  }
  listeners.forEach((l) => l());
}

/** Another tab (or an account sync) changed the stored copy: read it again. */
export function reloadActivity() {
  cache = null;
  listeners.forEach((l) => l());
}

const storageChanged = (e: StorageEvent) => {
  if (e.key === null || e.key === studyKey(ACTIVITY_KEY)) reloadActivity();
};

export const subscribeActivity = (cb: () => void) => {
  if (!listeners.size) window.addEventListener('storage', storageChanged);
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
    if (!listeners.size) window.removeEventListener('storage', storageChanged);
  };
};

export const getActivityServer = () => EMPTY;

/** Writes start from the stored copy, never a stale one: another tab may have added to it. */
const fresh = () => {
  cache = null;
  return readActivity();
};
export const noteStageOpen = (week: number, stageId: string) => write(recordStageOpen(fresh(), week, stageId, Date.now()));
export const noteStudyTime = (week: number, stageId: string, seconds: number) => write(recordStudyTime(fresh(), week, stageId, seconds, Date.now()));
export const noteRecall = (ok: boolean) => write(recordRecall(fresh(), ok, Date.now()));
