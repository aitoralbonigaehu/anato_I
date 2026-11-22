import { useSyncExternalStore } from 'react';
import { studyKey } from './storage-scope';

export const SCENE_MARKS_KEY = 'enbrioatlas:scene-marks';

export interface SceneMarkLocation {
  week: number;
  stage: string;
  view: string;
  t: number;
  id: string;
  name: string;
  taughtOnly?: boolean;
}

export type SceneMarkState = 'red' | 'orange' | null;
export type SceneMark = Readonly<SceneMarkLocation & { state: SceneMarkState; updatedAt: number }>;
type SceneMarks = Readonly<Record<string, SceneMark>>;

export const sceneMarkKey = ({ week, id }: Pick<SceneMarkLocation, 'week' | 'id'>) => `${week}/${id}`;

function parseSceneMarks(raw: unknown): Record<string, SceneMark> {
  const marks: Record<string, SceneMark> = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return marks;
  for (const [key, value] of Object.entries(raw)) {
    if (!value || typeof value !== 'object') continue;
    const { week, stage, view, t, id, name, taughtOnly, state, updatedAt } = value as Partial<SceneMark>;
    if (typeof week !== 'number' || !Number.isSafeInteger(week) || week < 1 ||
        typeof stage !== 'string' || !stage || typeof view !== 'string' ||
        typeof t !== 'number' || !Number.isFinite(t) || t < 0 || t > 1 ||
        typeof id !== 'string' || !id || typeof name !== 'string' || !name.trim() ||
        (taughtOnly !== undefined && typeof taughtOnly !== 'boolean') ||
        (state !== 'red' && state !== 'orange' && state !== null) ||
        typeof updatedAt !== 'number' || !Number.isSafeInteger(updatedAt) || updatedAt < 0 ||
        key !== sceneMarkKey({ week, id })) continue;
    marks[key] = { week, stage, view, t, id, name, state, updatedAt, ...(taughtOnly === undefined ? {} : { taughtOnly }) };
  }
  return marks;
}

const priority = (state: SceneMarkState) => state === null ? 2 : state === 'orange' ? 1 : 0;

function newerMark(a: SceneMark, b: SceneMark): SceneMark {
  if (a.updatedAt !== b.updatedAt) return a.updatedAt > b.updatedAt ? a : b;
  if (a.state !== b.state) return priority(a.state) > priority(b.state) ? a : b;
  // Equal timestamps can occur on two devices. Choose the same location on both.
  return JSON.stringify(a) >= JSON.stringify(b) ? a : b;
}

export function mergeSceneMarks(local: unknown, remote: unknown): SceneMarks {
  const merged = parseSceneMarks(local);
  for (const [key, mark] of Object.entries(parseSceneMarks(remote))) {
    merged[key] = merged[key] ? newerMark(merged[key], mark) : mark;
  }
  return merged;
}

const EMPTY: SceneMarks = {};
let cachedKey: string | undefined;
let cachedRaw: string | null | undefined;
let cachedMarks = EMPTY;
const listeners = new Set<() => void>();

function readMarks(refresh = false): SceneMarks {
  const key = studyKey(SCENE_MARKS_KEY);
  if (key !== cachedKey) {
    cachedKey = key;
    cachedRaw = undefined;
    cachedMarks = EMPTY;
  }
  if (refresh || cachedRaw === undefined) {
    let raw: string | null;
    try {
      raw = window.localStorage.getItem(key);
    } catch {
      return cachedMarks;
    }
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      try {
        cachedMarks = raw === null ? EMPTY : parseSceneMarks(JSON.parse(raw));
      } catch {
        cachedMarks = EMPTY;
      }
    }
  }
  return cachedMarks;
}

const notify = () => listeners.forEach((listener) => listener());

const storageChanged = (event: StorageEvent) => {
  if (event.key !== null && event.key !== studyKey(SCENE_MARKS_KEY)) return;
  readMarks(true);
  notify();
};

function subscribe(listener: () => void) {
  if (!listeners.size) {
    window.addEventListener('storage', storageChanged);
    readMarks(true);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (!listeners.size) window.removeEventListener('storage', storageChanged);
  };
}

export const useSceneMarks = () => useSyncExternalStore(subscribe, readMarks, () => EMPTY);

export function cycleSceneMark(location: SceneMarkLocation) {
  const marks = readMarks(true);
  const key = sceneMarkKey(location);
  const previous = marks[key];
  const state = previous?.state === 'red' ? 'orange' : previous?.state === 'orange' ? null : 'red';
  const updatedAt = Math.max(Date.now(), (previous?.updatedAt ?? -1) + 1);
  // Keep the cleared entry so an older cloud copy cannot restore the mark.
  cachedMarks = { ...marks, [key]: { ...location, state, updatedAt } };
  try {
    const raw = JSON.stringify(cachedMarks);
    window.localStorage.setItem(studyKey(SCENE_MARKS_KEY), raw);
    cachedRaw = raw;
  } catch {
    // Keep the current page's marks when storage is unavailable.
  }
  notify();
}
