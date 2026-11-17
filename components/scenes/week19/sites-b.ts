import type { V3 } from '@/lib/three-d/math';
import type { Site } from '@/lib/three-d/place';
import { neuralDien } from './neural-model';
import { CORD_CANAL, ROOT19, SITE19, onSite19, tie19 } from './sites';

/**
 * Topic 19's embryonic models in the one body (sites.ts). Each is tied by one landmark the student is watching:
 *
 * - `section` (section-model.ts): drawn at the cord block's size and in its frame, its canal on the cord's canal, so
 *   the adult section and the embryo's sit on each other (stage 10 → 11 is a change in place, not a trip).
 * - `spine` (spine-model.ts): its cord's end (the conus) on the body's conus, 4 units per body unit, seen from behind.
 * - `neural` (neural-model.ts): the neural tube laid along the adult nervous system, its diencephalon on the body's
 *   thalamus, so the last vesicles stage flies into the brain's thalamus (brain-model is tied there too).
 */

/** The spine model's conus (its own space) and scale. */
export const SPINE_CONUS: V3 = [0, 0, -0.3];
export const SPINE_SCALE = 4;
/** The neural tube's diencephalon (its own space, at the five vesicles with the flexures) and scale. */
export const NEURAL_DIEN: V3 = neuralDien();
export const NEURAL_SCALE = 1.4;

const face = (z: number, a: number, b: number) => ({ center: [0, -0.6, z] as V3, a: [a, 0, 0] as V3, b: [0, b, 0] as V3 });

export const SITE19B = {
  section: { key: 'section', place: onSite19(SITE19.cord, { at: [0, 0, 0], atParent: CORD_CANAL }), cut: [face(0.6, 3.4, 2.4), face(-0.6, 3.4, 2.4)] } as Site,
  spine: { key: 'spine', place: tie19({ at: SPINE_CONUS, atRoot: ROOT19.conus, scale: SPINE_SCALE }) } as Site,
  neural: { key: 'neural', place: tie19({ at: NEURAL_DIEN, atRoot: ROOT19.thalamus, scale: NEURAL_SCALE }) } as Site,
};
