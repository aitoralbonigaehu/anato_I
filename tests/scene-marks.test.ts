import { afterEach, expect, it, vi } from 'vitest';
import { collectSnapshot, mergeSnapshot, sameSnapshot } from '@/lib/account/snapshot';
import { cycleSceneMark, SCENE_MARKS_KEY, sceneMarkKey, type SceneMark } from '@/lib/study/scene-marks';
import { initializeStudyOwner } from '@/lib/study/storage-scope';

const location = {
  week: 15, stage: 'ureter-kimua', view: 'adarkadura', t: 0.35,
  id: 'giltzurrun-pelbisa', name: 'Giltzurrun pelbisa', taughtOnly: false,
};

const markKey = sceneMarkKey(location);
const accountMarks = () => collectSnapshot()[SCENE_MARKS_KEY] as Record<string, SceneMark> | undefined;

afterEach(() => {
  initializeStudyOwner(null);
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

it('cycles a structure across scenes, saves its last location, and isolates guest and account marks', () => {
  const storage = new Map<string, string>();
  vi.stubGlobal('window', {
    localStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
    },
  });
  vi.spyOn(Date, 'now').mockReturnValue(1_000);

  cycleSceneMark(location);
  expect(accountMarks()?.[markKey]).toEqual({ ...location, state: 'red', updatedAt: 1_000 });
  const nextLocation = { ...location, stage: 'metanefrosa', view: '', t: 0.8, taughtOnly: true };
  cycleSceneMark(nextLocation);
  expect(accountMarks()?.[markKey]).toEqual({ ...nextLocation, state: 'orange', updatedAt: 1_001 });
  cycleSceneMark(nextLocation);
  expect(accountMarks()?.[markKey]).toMatchObject({ state: null, updatedAt: 1_002 });

  initializeStudyOwner('ane');
  expect(accountMarks()).toBeUndefined();
  cycleSceneMark(location);
  expect(accountMarks()?.[markKey]).toMatchObject({ state: 'red', updatedAt: 1_000 });

  initializeStudyOwner(null);
  expect(accountMarks()?.[markKey]).toMatchObject({ state: null, updatedAt: 1_002 });
});

it('merges independent changes across devices without reviving a cleared mark', () => {
  const secondLocation = { ...location, id: 'metanefrosa', name: 'Metanefrosa' };
  const secondKey = sceneMarkKey(secondLocation);
  const local = {
    [SCENE_MARKS_KEY]: {
      [markKey]: { ...location, updatedAt: 3, state: null },
    },
  };
  const remote = {
    [SCENE_MARKS_KEY]: {
      [markKey]: { ...location, updatedAt: 2, state: 'orange' },
      [secondKey]: { ...secondLocation, updatedAt: 1, state: 'red' },
    },
  };
  const merged = mergeSnapshot(local, remote);
  expect(merged).toEqual({
    [SCENE_MARKS_KEY]: {
      [markKey]: { ...location, updatedAt: 3, state: null },
      [secondKey]: { ...secondLocation, updatedAt: 1, state: 'red' },
    },
  });
  expect(mergeSnapshot(remote, local)).toEqual(merged);
  expect(mergeSnapshot(merged, remote)).toEqual(merged);
  remote[SCENE_MARKS_KEY][markKey].updatedAt = 3;
  expect(mergeSnapshot(remote, local)).toEqual(merged);
});

it('keeps a snapshot without an optional taught filter equal after merging', () => {
  const mark = { ...location, taughtOnly: undefined, updatedAt: 1, state: 'red' };
  const existing = JSON.parse(JSON.stringify({ [SCENE_MARKS_KEY]: { [markKey]: mark } }));
  expect(sameSnapshot(mergeSnapshot(existing, existing), existing)).toBe(true);
});
