import { mulM, rotateAbout, type M4, type V3 } from '@/lib/three-d/math';
import { chain, link, type Frame3, type Site } from '@/lib/three-d/place';

/**
 * Topic 19's models in one body (lib/three-d/place.ts), so a stage change is one camera flight from where the
 * student was looking to the next model, which appears where it belongs in the one just left.
 *
 * THE ROOT is the adult body (body-model.ts): cut coronally through the spinal cord, its back half the ground, the
 * central and peripheral nervous system lying in it. Its space IS the shared body:
 *
 *   x towards the body's LEFT, y cranial, z ventral (the 'trunk' frame of place.ts); about 19 cm per unit.
 *   The body is 9 units tall: the vertex at y 4.5, the soles at y −4.5; the cord runs at z ≈ −0.3.
 *
 * Every other model is tied to the root by ONE landmark the student is watching when the story reaches it
 * (`tie19`), or to a point of an already tied model (`onSite19`). 19-B adds its sites in `sites-b.ts`, 19-C in
 * `sites-c.ts`, with these; ROOT19 and the helpers stay stable (tests/sites19.test.ts keeps the landmarks together).
 */

/** Points of the root (body-model.ts), in its own space = the shared body. Left = +x. */
export const ROOT19 = {
  /** The middle of the brain (the cerebrum's centre). */
  brain: [0, 3.98, -0.02] as V3,
  /** The thalamus (the diencephalon's middle): where the brain models and the vesicles are tied. */
  thalamus: [0, 3.9, -0.04] as V3,
  /** The foramen magnum: the brain ends, the cord begins. */
  magnum: [0, 3.42, -0.16] as V3,
  /** The cord at the 6th thoracic level (the cord block is cut here). */
  cordT6: [0, 1.95, -0.3] as V3,
  /** The cord's end (the conus), at L1–L2. */
  conus: [0, 0.55, -0.3] as V3,
  /** The sacrum's middle (the cauda equina below the conus). */
  sacrum: [0, -0.25, -0.34] as V3,
  /** The left sciatic nerve, at the middle of the thigh. */
  sciaticL: [0.45, -1.35, -0.25] as V3,
} as const;

/** The root's own place: the identity (its space is the shared body). */
const ROOT_PLACE = link('trunk', 1, [0, 0, 0], [0, 0, 0]);

/** Turns (degrees about the model's own x, y, z) applied round `at`, after the frame. */
type Turn = readonly [number, number, number];

/**
 * Tie a model to the shared body: the root point `atRoot` lands on the model's point `at`, `scale` model units per
 * root unit, the model's axes as `frame` ('trunk' unless the model says otherwise), then turned by `turn`.
 */
export function tie19(o: { at: V3; atRoot: V3; scale?: number; frame?: Frame3; turn?: Turn }): M4 {
  let m = link(o.frame ?? 'trunk', o.scale ?? 1, o.at, o.atRoot);
  const t = o.turn;
  if (t) {
    const axes: V3[] = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    for (let k = 0; k < 3; k++) if (t[k]) m = mulM(rotateAbout(o.at, axes[k], (t[k] * Math.PI) / 180), m);
  }
  return m;
}

/** Tie a model to a point of an already tied model (`parent` its site, `atParent` in the parent's own space). */
export function onSite19(parent: Site, o: { at: V3; atParent: V3; scale?: number; frame?: Frame3; turn?: Turn }): M4 {
  const local = tie19({ at: o.at, atRoot: o.atParent, scale: o.scale, frame: o.frame, turn: o.turn });
  return chain(parent.place, local);
}

/** The cord block's scale: its cord (radius ≈ 1) is the body's cord (radius ≈ 0.09). */
export const CORD_SCALE = 11;
/** The cord block's central canal (its origin): the section model (19-B) is tied here, at the same size. */
export const CORD_CANAL: V3 = [0, 0, 0];
/** The head block's scale and its thalamus (its origin). */
export const HEAD_SCALE = 3;
export const HEAD_THALAMUS: V3 = [0, 0, 0];

const face = (z: number, a: number, b: number) => ({ center: [0, 0, z] as V3, a: [a, 0, 0] as V3, b: [0, b, 0] as V3 });

export const SITE19 = {
  /** The root: the adult body, its back half the ground (body-model). */
  body: { key: 'body', place: ROOT_PLACE } as Site,
  /** The spinal cord cut across at T6 (cord-model), dorsal up, seen from the cranial side: its cut faces glow. */
  cord: { key: 'cord', place: tie19({ at: CORD_CANAL, atRoot: ROOT19.cordT6, scale: CORD_SCALE, frame: 'block' }), cut: [face(1.6, 4.2, 3.2), face(-1.6, 4.2, 3.2)] } as Site,
  /** The head cut down the middle (head-model), seen from the left: tied at the thalamus. */
  head: { key: 'head', place: tie19({ at: HEAD_THALAMUS, atRoot: ROOT19.thalamus, scale: HEAD_SCALE }), cut: [{ center: [0, 0.2, 0] as V3, a: [0, 0, 2.6] as V3, b: [0, 2.6, 0] as V3 }] } as Site,
};
