import type { Where } from '@/components/scenes/week17/common';
import type { M4, V3 } from '@/lib/three-d/math';
import type { Site } from '@/lib/three-d/place';
import { ROOT18, tie } from './sites';

/**
 * Agent 18-B's models in topic 18's one body (sites.ts: the root is the pharyngeal gut from behind).
 *
 * Most of 18-B's stages need no site of their own: the first and second pouches, the clefts and the glands' descent
 * are told on the root model itself (pharynx-b.ts), and the mature thyroid on 18-A's head section (thyroid-model),
 * so those changes are run-ons. Only the tongue has its own model:
 *
 *   root (pharynx) ── tongue: the floor of the pharynx, tied at the foramen caecum
 *
 * The tongue model (tongue-model.ts) is the same floor drawn larger: its foramen caecum sits on the root's, 0.6
 * tongue units per root unit, tilted 30° about the left-right axis so that its laryngeal orifice falls on the root's
 * too (the root's floor rises dorsally towards the larynx; the tongue slab's runs the other way). The test
 * tests/sites18b.test.ts keeps both landmarks together.
 */

const apply = (m: M4, p: V3): V3 => [m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12], m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13], m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14]];

/** The tongue model's foramen caecum at its first pose (TP0), and its laryngeal orifice. */
export const TONGUE_CAECUM: V3 = [0, 0.135, -0.026];
export const TONGUE_LARYNX: V3 = [0, -2.02, 0.7];
export const TONGUE_SCALE = 0.6;
/** The middle of the thyroid's two lobes: in the neck model, and on the root once the gland is down. */
export const NECK_LOBES: V3 = [0, -0.3, 0.2];
export const ROOT_LOBES: V3 = [0, -3.72, 0.86];
export const NECK_SCALE = 1.35;

export const SITE18B = {
  /** The floor of the pharynx seen from behind and above (tongue-model). */
  tongue: { key: 'tongue', place: tie({ at: TONGUE_CAECUM, atRoot: ROOT18.caecum, scale: TONGUE_SCALE, turn: [-30, 0, 0] }) } as Site,
  /**
   * The grown neck (neck-model: the mature thyroid, front and back): its lobes sit on the root's lobes, where the
   * glands' descent left them (pharynx-model LOBE_X, LOBE_Y), 1.35 neck units per root unit.
   */
  neck: { key: 'neck', place: tie({ at: NECK_LOBES, atRoot: ROOT_LOBES, scale: NECK_SCALE }) } as Site,
};

/**
 * Cold entry (a stage opened from a link or the menu): the fly-in from the whole embryo (week14 `Where`), per model.
 * The pharynx's is 18-A's (Pharynx18 `sarrera`) with a note for the pouches and clefts.
 */
export const WHERE18B: Record<'pharynx' | 'tongue', Where> = {
  pharynx: {
    th: 1.15,
    at: [0, -0.6, 0.6],
    scale: 3,
    planes: [{ center: [0, -0.2, 0], a: [3.8, 0, 0], b: [0, 4, 0] }],
    note: 'Lepo mailan, faringe hestea: sabaia kendu eta atzetik begiratuko diogu, poltsak eta arraildurak ikusteko',
  },
  tongue: {
    th: 1.15,
    // The root's fly-in point carried into the tongue model (see SITE18B.tongue), at the tongue's scale.
    at: apply(SITE18B.tongue.place, [0, -0.6, 0.6]),
    scale: 3 * TONGUE_SCALE,
    planes: [{ center: [0, -0.3, 0.1], a: [2.3, 0, 0], b: [0, 2.6, 0] }],
    note: 'Lepo mailan, faringearen zorua: barrutik, atzetik eta goitik begiratuko diogu',
  },
};
