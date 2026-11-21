import type { Beat, StageDef, StructureDef, ViewDef, WeekDef } from '@/lib/sim/types';

/** The shape of registry-meta.json (see content/registry-lite.ts) and how it is cut from the full registry. */

export type ViewMeta = Pick<ViewDef, 'id' | 'label' | 'description' | 'ownFocus'>;
export type BeatMeta = Pick<Beat, 'at' | 'text' | 'view' | 'focus' | 'tour'>;
export type StageMeta = Pick<StageDef, 'id' | 'day' | 'dayRange' | 'title' | 'subtitle' | 'structures' | 'optional'> & {
  views: ViewMeta[];
  beats: BeatMeta[];
};
export type WeekMeta = Pick<WeekDef, 'week' | 'slug' | 'title' | 'subtitle' | 'dayRange' | 'span' | 'inPreparation'> & { stages: StageMeta[] };
export type StructureMeta = Pick<StructureDef, 'id' | 'name' | 'category' | 'color' | 'space' | 'parts' | 'spans'> & { definition?: string };

export interface RegistryMeta {
  weeks: WeekMeta[];
  structures: StructureMeta[];
}

/**
 * The slice of the full registry kept here (the generator and its test use it). `defined`: the structures whose
 * definition is kept too (the timeline's chips show it as their tooltip).
 */
export function toMeta(weeks: readonly WeekDef[], structures: Iterable<StructureDef>, defined: ReadonlySet<string> = new Set()): RegistryMeta {
  const pick = <T extends object, K extends keyof T>(o: T, keys: readonly K[]) => {
    const out = {} as Pick<T, K>;
    for (const k of keys) if (o[k] !== undefined) out[k] = o[k];
    return out;
  };
  // A beat's text is kept only where it is the first to show a structure (content/chronology.ts `firstSeen`, the
  // one reader of beat text through this file); the rest is the simulator's and stays in the full registry.
  const firstText = new Set<Beat>();
  const seen = new Set<string>();
  for (const w of weeks)
    for (const s of w.stages)
      for (const b of s.beats)
        for (const id of [...(b.focus ?? []), ...(b.tour ?? [])])
          if (!seen.has(id)) {
            seen.add(id);
            firstText.add(b);
          }
  return {
    weeks: weeks.map((w) => ({
      ...pick(w, ['week', 'slug', 'title', 'subtitle', 'dayRange', 'span', 'inPreparation'] as const),
      stages: w.stages.map((s) => ({
        ...pick(s, ['id', 'day', 'dayRange', 'title', 'subtitle', 'structures', 'optional'] as const),
        views: s.views.map((v) => pick(v, ['id', 'label', 'description', 'ownFocus'] as const)),
        beats: s.beats.map((b) => ({ ...pick(b, ['at', 'view', 'focus', 'tour'] as const), text: firstText.has(b) ? b.text : '' })),
      })),
    })),
    structures: [...structures].map((s) => ({
      ...pick(s, ['id', 'name', 'category', 'color', 'space', 'parts', 'spans'] as const),
      ...(defined.has(s.id) ? { definition: s.definition } : {}),
    })),
  };
}
