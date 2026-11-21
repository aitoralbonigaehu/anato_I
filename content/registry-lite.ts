import meta from './registry-meta.json';
import type { RegistryMeta, StructureMeta, WeekMeta } from './registry-meta';

export type { BeatMeta, StageMeta, StructureMeta, ViewMeta, WeekMeta } from './registry-meta';

/**
 * The registry's text, without the scenes: what the homepage and the pages around it need (titles, stages, the
 * structures' names, the beats that date a structure). `content/registry` brings every topic's scene and 3D model
 * with it (5 MB of script); this brings 0.2 MB.
 *
 * `registry-meta.json` is generated from the full registry by tests/registry-meta.test.ts, which rewrites it and
 * fails when it is stale: run `npx vitest run tests/registry-meta` after changing a topic's stages or structures.
 * A scene is loaded on demand with `useScene` (content/week-store.ts, content/week-loader.ts).
 */

const data = meta as unknown as RegistryMeta;

export const weeks: WeekMeta[] = data.weeks;

export const structures: Map<string, StructureMeta> = new Map(data.structures.map((s) => [s.id, s]));

export const getWeek = (n: number) => weeks.find((w) => w.week === n);

export const nameOf = (id: string) => structures.get(id)?.name ?? id;

export const partsOf = (id: string): readonly string[] => structures.get(id)?.parts ?? structures.get(id)?.spans ?? [];

export const spansOf = (id: string): readonly string[] => structures.get(id)?.spans ?? [];

export const isSpace = (id: string) => {
  const s = structures.get(id);
  return !!s && (s.category === 'barrunbea' || !!s.space);
};
