import type { V3 } from '@/lib/three-d/math';
import type { Site } from '@/lib/three-d/place';
import { ROOT17, onSite17, tie17 } from './sites';

/**
 * Topic 17, the sites of agent 17-C's models (muscles, the larynx, the cranial nerves, the closing map), in the
 * topic's one body (sites.ts: the root is the fetal skull, its space the shared body). Each is tied by ONE
 * landmark the student is watching when the story reaches it:
 *
 *   skull (root) ──┬── nerves   (the brain seen from below lies in the cranial cavity)
 *                  │     └── larynx   (the nerve model's larynx, where the vagus's two branches end)
 *                  │           └── map   (the head's larynx: the closing picture opens out of it)
 *                  └── muscle   (the fetal head with its muscles: the skull's own bones under them)
 *
 * tests/sites17c.test.ts keeps the landmarks together: if a model is redrawn and its landmark moves, move the
 * numbers here with it.
 */

/** The brain's middle in the nerve model (its cerebrum, a little behind the frontal lobes). */
export const NERVE_BRAIN_MID: V3 = [0, 0.75, -0.3];
/** The larynx of the nerve model (`laringea`, under the pharynx's constrictors). */
export const NERVE_LARYNX: V3 = [0, -8.62, -0.04];
/** The larynx model's middle: thyroid laminae over the cricoid ring. */
export const LARYNX_MID: V3 = [0, 0.1, -0.2];

/** The muscle head's midline between the chin's floor and the hyoid (muscle-model: mandible y -1.05, hyoid y -1.95). */
export const MUSCLE_JAW: V3 = [0, -1.5, 0.95];
/** The same point of the skull: midway between its mandible's body and its hyoid, on the midline. */
export const SKULL_JAW: V3 = [0, (ROOT17.mandibleL[1] + ROOT17.hyoid[1]) / 2, (ROOT17.mandibleL[2] + ROOT17.hyoid[2]) / 2];

const nerves: Site = { key: 'nerves', place: tie17({ at: NERVE_BRAIN_MID, atRoot: ROOT17.brain, scale: 1.4 }) };
const larynx: Site = { key: 'larynx', place: onSite17(nerves, { at: LARYNX_MID, atParent: NERVE_LARYNX, scale: 1.6 }) };

/** The fetal head with its muscles (muscle-model): its jaw and hyoid on the skull's, 0.74 of the skull's size. */
const muscle: Site = { key: 'muscle', place: tie17({ at: MUSCLE_JAW, atRoot: SKULL_JAW, scale: 0.74 }) };

export const SITE17C = {
  muscle,
  /** The adult brain from below, the twelve pairs and the vagus down the body (nerves-model). */
  nerves,
  /** The larynx in the arches' colours (larynx-model), blown up from the nerve model's larynx. */
  larynx,
};
