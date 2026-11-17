import { mulM, rotateAbout, type M4, type V3 } from '@/lib/three-d/math';
import { chain, link, type Frame3, type Site } from '@/lib/three-d/place';

/**
 * Topic 18's models in one body (lib/three-d/place.ts), so a stage change is one camera flight from where the
 * student was looking to the next model, which appears where it belongs in the one just left.
 *
 * THE ROOT is the pharyngeal gut seen from behind (pharynx-model.ts): most of the topic's stages are on it or come
 * out of it (the arches, clefts and pouches, the glands that bud from the pouches, the floor the tongue and the
 * thyroid grow from, the stomodeum the face is built round). Its space IS the shared body:
 *
 *   x towards the embryo's LEFT, y cranial, z ventral (the 'trunk' frame of place.ts); units = pharynx units.
 *   The dorsal wall is cut off at z = 0 (the cut face the student looks at from behind); the floor of the
 *   pharynx (its ventral wall) lies at z ≈ 1.3; the skin of the neck's front at z ≈ 2.3.
 *   Levels (y) of the pouches and clefts, 1st to 4th: 1.62, 0.42, −0.72, −1.72 (PLEV). The arches' middles: I 2.2,
 *   II 1.0, III −0.15, IV −1.2, VI −2.1; the maxillary process above I (2.8 – 3.95).
 *   Landmarks (ROOT18): the buccopharyngeal membrane at the cranial end of the floor, the foramen caecum on the
 *   floor's midline at the first pouches' level, the laryngeal orifice low on the floor, the left pouches 1–4 on
 *   the cut (left = +x).
 *
 * Every other model is tied to the root by ONE landmark the student is watching when the story reaches it (`tie`).
 * Tie a model to a ROOT18 point, or to a point of another tied model through `onSite`. Agents 18-B and 18-C add
 * their sites in `sites-b.ts` / `sites-c.ts` with `tie`; the numbers here are kept stable (tests/sites18.test.ts).
 */

/** Points of the root (pharynx-model.ts at PH0), in its own space = the shared body. */
export const ROOT18 = {
  /** The buccopharyngeal membrane / the stomodeum's floor: the cranial end of the pharynx's floor. */
  membrane: [0, 3.0, 1.3] as V3,
  /** The foramen caecum: the floor's midline at the level of the first pouches (the thyroid's bud). */
  caecum: [0, 1.62, 1.42] as V3,
  /** The laryngeal orifice on the floor (pharynx-model pt `laringe-zuloa`). */
  larynx: [0.02, -2.3, 0.56] as V3,
  /** The left pouches' tips on the cut (pts `lehen-poltsa` … `laugarren-poltsa`). */
  pouch1: [2.21, 1.62, 0.02] as V3,
  pouch2: [1.57, 0.41, 0.02] as V3,
  pouch3: [1.03, -0.74, 0.02] as V3,
  pouch4: [0.67, -1.73, 0.02] as V3,
  /** The left first cleft on the cut (pt `lehen-arraildura` mirrored to the left: the clefts sit at |x| ≈ 2.7). */
  cleft1: [2.68, 1.62, -0.01] as V3,
} as const;

/** The root's own place: the identity (its space is the shared body). */
const ROOT_PLACE = link('trunk', 1, [0, 0, 0], [0, 0, 0]);

/**
 * Tie a model to the shared body: the root point `atRoot` lands on the model's point `at`, `scale` model units per
 * root unit, the model's axes as `frame` ('trunk' unless the model says otherwise), then turned by `turn` (degrees
 * about the model's own x, y, z, applied in that order round `at`) for a model drawn at another angle (a tooth
 * block lying in the jaw, a section turned to its plane). Returns a Site's `place`.
 */
export function tie(o: { at: V3; atRoot: V3; scale?: number; frame?: Frame3; turn?: readonly [number, number, number] }): M4 {
  let m = link(o.frame ?? 'trunk', o.scale ?? 1, o.at, o.atRoot);
  const t = o.turn;
  if (t) {
    const axes: V3[] = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    for (let k = 0; k < 3; k++) if (t[k]) m = mulM(rotateAbout(o.at, axes[k], (t[k] * Math.PI) / 180), m);
  }
  return m;
}

/**
 * Tie a model to a point of an already tied model (`parent` its site, `atParent` in the parent's own space):
 * the same as `tie`, with the scale relative to the parent's units.
 */
export function onSite(parent: Site, o: { at: V3; atParent: V3; scale?: number; frame?: Frame3; turn?: readonly [number, number, number] }): M4 {
  const local = tie({ at: o.at, atRoot: o.atParent, scale: o.scale, frame: o.frame, turn: o.turn });
  return chain(parent.place, local);
}

/** Scales (model units per root unit). */
const THYROID_SCALE = 0.42;
const FACE_SCALE = 0.62;

export const SITE18 = {
  /** The root: the pharyngeal gut from behind, roof taken away (pharynx-model). */
  pharynx: { key: 'pharynx', place: ROOT_PLACE } as Site,
  /**
   * The head and neck cut down the middle (thyroid-model), tied at the foramen caecum: the thyroid's bud sinks
   * from the floor exactly where the student saw the floor's midline. Its sagittal cut is the face x = 0.
   */
  thyroid: {
    key: 'thyroid',
    place: tie({ at: [0.04, 0.14, 0.22], atRoot: ROOT18.caecum, scale: THYROID_SCALE }),
    cut: [{ center: [0, 0.13, -0.13] as V3, a: [0, 3.25, 0] as V3, b: [0, 0, 2.9] as V3 }],
  } as Site,
  /**
   * The face from the front (face-model), tied at the buccopharyngeal membrane: the stomodeum the face is built
   * round is the pharynx's cranial end.
   */
  face: { key: 'face', place: tie({ at: [0, -0.8, 1.2], atRoot: ROOT18.membrane, scale: FACE_SCALE }) } as Site,
};
