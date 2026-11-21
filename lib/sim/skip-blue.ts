import { allBlue, expandNotes, sentence } from '@/content/notes-text';
import type { Beat, StageDef } from './types';

/**
 * "Skip blue" mode (topics 15+, the default): the notes set what was not taught this year in blue or grey.
 * A step whose notes passage is entirely not-taught (or marked `notTaught`) is skipped by playback and the
 * step/stage keys; a step the student picks directly (timeline, notes, links) still plays. Steps without
 * notes are never skipped unless marked.
 */
const cache = new WeakMap<StageDef, boolean[]>();
export function blueSteps(stage: StageDef): boolean[] {
  let flags = cache.get(stage);
  if (!flags) {
    flags = stage.beats.map((b) => {
      if (b.notTaught) return true;
      const ss = expandNotes(b.notes).map(sentence).filter((s) => !!s);
      return ss.length > 0 && ss.every(allBlue);
    });
    cache.set(stage, flags);
  }
  return flags;
}

/** The step as the default mode shows it: its `plain` wording applied (a null field is dropped). */
export function taughtBeat(beat: Beat): Beat {
  if (!beat.plain) return beat;
  const { plain, ...out } = beat;
  for (const [k, v] of Object.entries(plain) as [keyof typeof plain, string | null | undefined][]) {
    if (v === null) delete (out as Record<string, unknown>)[k];
    else if (v !== undefined) (out as Record<string, unknown>)[k] = v;
  }
  return out;
}
const taughtCache = new WeakMap<StageDef, StageDef>();
/** The stage with every step's `plain` wording applied (same object when no step has one). */
export function taughtStage(stage: StageDef): StageDef {
  let out = taughtCache.get(stage);
  if (!out) {
    out = stage.beats.some((b) => b.plain) ? { ...stage, beats: stage.beats.map(taughtBeat) } : stage;
    taughtCache.set(stage, out);
  }
  return out;
}
export const isBlueStep = (stage: StageDef, k: number) => blueSteps(stage)[k] === true;
export const stageAllBlue = (stage: StageDef) => stage.beats.length > 0 && blueSteps(stage).every(Boolean);

/** The first step that is not blue at or after (i, k) in `dir`, crossing into the next stages; null if none. */
export function nextShown(stages: readonly StageDef[], i: number, k: number, dir: 1 | -1): { i: number; k: number } | null {
  let j = i;
  let kk = k;
  while (j >= 0 && j < stages.length) {
    const st = stages[j];
    for (; kk >= 0 && kk < st.beats.length; kk += dir) if (!isBlueStep(st, kk)) return { i: j, k: kk };
    j += dir;
    kk = dir > 0 ? 0 : (stages[j]?.beats.length ?? 0) - 1;
  }
  return null;
}
