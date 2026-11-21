import type { WeekDef } from '@/lib/sim/types';

/**
 * (No React here: content/registry.ts, which servers import too, registers into it.)
 *
 * One topic's full definition (scenes and all), loaded on demand: the homepage reads the light registry
 * (content/registry-lite.ts) and fetches a topic's code only when one of its scenes is about to be drawn.
 * Pages that import the full registry register every topic at once (`provideWeeks`), so there a scene is
 * there on the first render.
 */
const LOAD: Record<number, () => Promise<WeekDef>> = {
  1: () => import('./weeks/week1').then((m) => m.week1),
  2: () => import('./weeks/week2').then((m) => m.week2),
  3: () => import('./weeks/week3').then((m) => m.week3),
  4: () => import('./weeks/week4').then((m) => m.week4),
  5: () => import('./weeks/week5').then((m) => m.week5),
  6: () => import('./weeks/week6').then((m) => m.week6),
  7: () => import('./weeks/week7').then((m) => m.week7),
  8: () => import('./weeks/week8').then((m) => m.week8),
  9: () => import('./weeks/week9').then((m) => m.week9),
  10: () => import('./weeks/week10').then((m) => m.week10),
  11: () => import('./weeks/week11').then((m) => m.week11),
  12: () => import('./weeks/week12').then((m) => m.week12),
  13: () => import('./weeks/week13').then((m) => m.week13),
  14: () => import('./weeks/week14').then((m) => m.week14),
  15: () => import('./weeks/week15').then((m) => m.week15),
  16: () => import('./weeks/week16').then((m) => m.week16),
  17: () => import('./weeks/week17').then((m) => m.week17),
  18: () => import('./weeks/week18').then((m) => m.week18),
  19: () => import('./weeks/week19').then((m) => m.week19),
};

const loaded = new Map<number, WeekDef>();
const pending = new Map<number, Promise<WeekDef | undefined>>();
const subs = new Set<() => void>();
const changed = () => subs.forEach((f) => f());

/** Called by content/registry.ts: every topic is already in memory on pages that import it. */
export function provideWeeks(list: readonly WeekDef[]) {
  for (const w of list) loaded.set(w.week, w);
}

/** Starts (or joins) the load of one topic. */
export function loadWeek(n: number): Promise<WeekDef | undefined> {
  const have = loaded.get(n);
  if (have) return Promise.resolve(have);
  let p = pending.get(n);
  if (!p) {
    const load = LOAD[n];
    p = load
      ? load().then(
          (w) => {
            loaded.set(n, w);
            changed();
            return w;
          },
          () => {
            pending.delete(n);
            return undefined;
          },
        )
      : Promise.resolve(undefined);
    pending.set(n, p);
  }
  return p;
}

/** For hooks (content/week-loader.ts): told when a topic arrives. */
export const subscribeWeeks = (f: () => void) => {
  subs.add(f);
  return () => subs.delete(f);
};

/** A topic's full definition if it is in memory. */
export const loadedWeek = (n: number) => loaded.get(n) ?? null;
