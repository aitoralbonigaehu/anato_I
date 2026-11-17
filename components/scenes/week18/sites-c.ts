import type { Where } from '@/components/scenes/week14/common';
import type { M4, V3 } from '@/lib/three-d/math';
import { between, type Site } from '@/lib/three-d/place';
import { SITE18, onSite } from './sites';

/**
 * Topic 18, notes 4.1 and 4.2 (palate, nose, teeth): their four models tied into the topic's one body
 * (components/scenes/week18/sites.ts, the pharynx being the root), each by the landmark the student is watching
 * when the story reaches it:
 *
 *   face ── palate ── choana ── tooth ── jaw
 *   (the intermaxillary segment, behind the upper lip)
 *            (the same palate, cut down the nostril)
 *                     (the front of the lower jaw: the gum over the incisor germ)
 *                              (the gum: the finished tooth is one of the row)
 *
 * The palate and choana models share their axes (x the embryo's LEFT, y cranial, z ventral) and units; the tooth
 * and jaw blocks are drawn mouth up (x across the tooth, y towards the mouth, z out of the cut towards the viewer)
 * and lie in the sagittal plane at the front of the lower jaw, where a cut across the arch is a sagittal cut: their
 * x is the head's dorsal direction, their z the embryo's left. tests/sites18c.test.ts keeps the landmarks together.
 */

/** The face (face-model, age ≈ 10): just behind the middle of the upper lip, where the segment's ridge lies. */
export const FACE_SEGMENT: V3 = [0, -0.98, 1.72];
/** The palate model's ridge at the front (the intermaxillary segment's arc, palate-model `ridge-seg`). */
export const PALATE_SEGMENT: V3 = [0, -0.42, 2.12];
/** The sagittal cut of the choana model lies off the midline, down the nostril (palate units). */
export const NOSTRIL_X = 0.45;
/** The choana model's lower gum at the front (its mouth floor behind the lower lip). */
export const CHOANA_GUM: V3 = [0, -0.93, 1.62];
/** The tooth block's gum over the lamina (tooth-model: the epithelium's top at x = 0, on the cut). */
export const TOOTH_GUM: V3 = [0, 2.1, 0];
/** The jaw block's gum over the middle tooth (jaw-model). */
export const JAW_GUM: V3 = [0, 1.15, 0];

const palate = onSite(SITE18.face, { at: PALATE_SEGMENT, atParent: FACE_SEGMENT, scale: 2.5 });
const palateSite: Site = { key: 'palate', place: palate };
const choanaSite: Site = {
  key: 'choana',
  place: onSite(palateSite, { at: [0, 0, 0], atParent: [NOSTRIL_X, 0, 0], scale: 1 }),
  cut: [{ center: [0, 0.1, -0.6], a: [0, 3.3, 0], b: [0, 0, 3.0] }],
};
const toothSite: Site = {
  key: 'tooth',
  // Mouth up: the block's y is cranial, its x dorsal, its z (out of its cut) the embryo's left: turned −90° about y.
  place: onSite(choanaSite, { at: TOOTH_GUM, atParent: CHOANA_GUM, scale: 4, turn: [0, -90, 0] }),
};
const jawSite: Site = { key: 'jaw', place: onSite(toothSite, { at: JAW_GUM, atParent: TOOTH_GUM, scale: 0.5 }) };

export const SITE18C = {
  /** The palate from below and cut across (palate-model `palateModel`), under the face's intermaxillary segment. */
  palate: palateSite,
  /** The same head cut down the nostril (palate-model `choanaModel`): its cut face glows on the palate. */
  choana: choanaSite,
  /** One tooth germ in a block cut across the lower jaw's front (tooth-model `toothModel`). */
  tooth: toothSite,
  /** The jaw with both sets of teeth (tooth-model `jawModel`): the finished tooth is the middle one of the row. */
  jaw: jawSite,
};

const apply = (m: M4, p: V3): V3 => [m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12], m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13], m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14]];
const scaleOf = (m: M4) => Math.hypot(m[0], m[1], m[2]);

/**
 * The cold entry (a stage opened from a link or the menu) of a model in the trunk frame: the fly-in from outside
 * the embryo to the head, as the face's own (Face18 `WHERE`: the face's centre on the body's axis at 2.42, 1.9 face
 * units per embryo unit), carried into this model.
 */
export function whereC(site: Site, note: string): Where {
  const face = SITE18.face.place;
  return { th: 2.42, at: apply(between(face, site.place), [0, 0, 0]), scale: (1.9 * scaleOf(site.place)) / scaleOf(face), span: 0.06, note };
}
