import { mulM, rotateAbout, type M4, type V3 } from '@/lib/three-d/math';
import { chain, link, type Frame3, type Site } from '@/lib/three-d/place';

/**
 * Topic 17's models in one body (lib/three-d/place.ts), so a stage change is one camera flight from where the
 * student was looking to the next model, which appears where it belongs in the one just left.
 *
 * THE ROOT is the fetal skull (skull-model.ts): the topic opens on it, five of its stages are on it, and every
 * later model is a part of that head (the base, the arches' bones, the muscles, the larynx under the hyoid) or the
 * embryo's head that becomes it. Its space IS the shared body:
 *
 *   x towards the fetus's LEFT, y cranial, z ventral (the 'trunk' frame of place.ts); units = skull units.
 *   The origin is the middle of the vault; the head is about 6 units long (z −3.1 … 3.2), 4.9 wide (x ±2.46);
 *   the vault's top at y 2.3, the chin at y ≈ −3.3, the hyoid at y ≈ −4.0 under it.
 *
 * Every other model is tied to the root by ONE landmark the student is watching when the story reaches it
 * (`tie17`), or to a point of an already tied model (`onSite17`). Agent 17-C adds the sites of its models
 * (muscles, larynx, nerves) in `sites-c.ts` with these two; ROOT17 and the two helpers stay stable
 * (tests/sites17.test.ts keeps the landmarks together).
 */

/** Points of the root (skull-model.ts at SKULL0), in its own space = the shared body. Left = +x. */
export const ROOT17 = {
  /** The middle of the vault (the origin). */
  vault: [0, 0, 0] as V3,
  /** The middle of the cranial cavity, where the encephalon sits (the brain of a model seen from below). */
  brain: [0, 0.3, 0] as V3,
  /** The hypophyseal fossa (sella turcica) on the base's midline: the middle of the chondrocranium. */
  sella: [0, -1.0, 0.62] as V3,
  /** The foramen magnum, between the occipital condyles. */
  magnum: [0, -2.1, -1.17] as V3,
  /** The left parietal bone's middle (a flat bone of the vault). */
  parietalL: [1.2, 1.15, -0.5] as V3,
  /** The left temporal squama's middle (where the vault meets the base, at the side). */
  squamaL: [2.24, -0.2, -0.19] as V3,
  /** The left middle ear (tympanic ring), where the malleus and incus lie. */
  earL: [2.15, -1.66, 0.04] as V3,
  /** The left mandible's middle (body and angle). */
  mandibleL: [1.12, -2.47, 1.59] as V3,
  /** The chin (the mandible's front, midline). */
  chin: [0, -3.2, 2.7] as V3,
  /** The mouth: between the maxillae and the mandible, midline (the stomodeum of the embryo). */
  mouth: [0, -2.3, 2.45] as V3,
  /** The left styloid process's middle. */
  styloidL: [1.62, -2.5, 0.0] as V3,
  /** The hyoid's body (midline). The larynx hangs under it. */
  hyoid: [0, -4.0, 1.57] as V3,
} as const;

/** The root's own place: the identity (its space is the shared body). */
const ROOT_PLACE = link('trunk', 1, [0, 0, 0], [0, 0, 0]);

/** Turns (degrees about the model's own x, y, z) applied round `at`, after the frame. */
type Turn = readonly [number, number, number];

/**
 * As place.ts `link`, for a model whose axes are none of the named frames: `rows[k]` is the root direction (a unit
 * axis, signed) that the model's axis k points along. The rows must make a proper rotation (no mirror).
 */
function linkRows(rows: readonly [V3, V3, V3], scale: number, at: V3, atRoot: V3): M4 {
  const m = link('trunk', 1, [0, 0, 0], [0, 0, 0]);
  for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) m[col * 4 + row] = rows[row][col] * scale;
  for (let row = 0; row < 3; row++) m[12 + row] = at[row] - (m[row] * atRoot[0] + m[4 + row] * atRoot[1] + m[8 + row] * atRoot[2]);
  return m;
}

/**
 * Tie a model to the shared body: the root point `atRoot` lands on the model's point `at`, `scale` model units per
 * root unit, the model's axes as `frame` ('trunk' unless the model says otherwise), then turned by `turn` (degrees
 * about the model's own x, y, z, applied in that order round `at`). A model lying on a table seen from above with
 * the face at the top (x = the viewer's right = the body's RIGHT, y anterior, z up) is `frame: 'block'` with
 * `turn: [0, 0, 180]` (`TABLE`). Returns a Site's `place`.
 */
export function tie17(o: { at: V3; atRoot: V3; scale?: number; frame?: Frame3; turn?: Turn; rows?: readonly [V3, V3, V3] }): M4 {
  let m = o.rows ? linkRows(o.rows, o.scale ?? 1, o.at, o.atRoot) : link(o.frame ?? 'trunk', o.scale ?? 1, o.at, o.atRoot);
  const t = o.turn;
  if (t) {
    const axes: V3[] = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    for (let k = 0; k < 3; k++) if (t[k]) m = mulM(rotateAbout(o.at, axes[k], (t[k] * Math.PI) / 180), m);
  }
  return m;
}

/** Tie a model to a point of an already tied model (`parent` its site, `atParent` in the parent's own space). */
export function onSite17(parent: Site, o: { at: V3; atParent: V3; scale?: number; frame?: Frame3; turn?: Turn; rows?: readonly [V3, V3, V3] }): M4 {
  const local = tie17({ at: o.at, atRoot: o.atParent, scale: o.scale, frame: o.frame, turn: o.turn, rows: o.rows });
  return chain(parent.place, local);
}

/** A table model seen from above, face at the top: x the body's right, y anterior, z cranial. */
export const TABLE = { frame: 'block' as Frame3, turn: [0, 0, 180] as Turn };

/** The embryo's head (arch-model): the stomodeum lies on the fetal mouth, the head about the skull's size. */
const ARCH_STOMO: V3 = [0, -0.74, 2.02];
const ARCH_SCALE = 1.15;

const archPlace = tie17({ at: ARCH_STOMO, atRoot: ROOT17.mouth, scale: ARCH_SCALE });

export const SITE17 = {
  /** The root: the fetal skull (skull-model). */
  skull: { key: 'skull', place: ROOT_PLACE } as Site,
  /**
   * The skull's base from above, vault lifted off (base-model `baseModel`), tied at the sella: the hypophyseal
   * cartilage is where the student saw the base's middle.
   */
  base: { key: 'base', place: tie17({ at: [0, 0.83, 0], atRoot: ROOT17.sella, scale: 1.55, ...TABLE }) } as Site,
  /**
   * The two ossifications (base-model `ossModel`): two blocks of tissue blown up from where the vault (a flat bone,
   * left block) meets the base (an endochondral bone, right block) at the side of the head.
   */
  // The table lies on the side of the head: its up (z) points out of the left side, the flat-bone block (−x) up
  // into the vault, the endochondral block (+x) down into the base, its far edge (+y) towards the back.
  oss: { key: 'oss', place: tie17({ at: [0, 0, 0], atRoot: [2.3, -0.6, -0.2], scale: 3.2, rows: [[0, -1, 0], [0, 0, -1], [1, 0, 0]] }) } as Site,
  /** The embryo's head and neck from the left (arch-model): its stomodeum on the fetal mouth. */
  arch: { key: 'arch', place: archPlace } as Site,
  /**
   * The head cut down the middle with the arches' cartilages (bones-model), seen from the left: tied half way from
   * the middle ear to the hyoid, so the ossicles lie at the skull's ear and the hyoid on its hyoid (the model's
   * parts lie near its midline, the skull's out at the sides: the tie splits the difference across). Its cut is the
   * midline face of the head.
   */
  bones: {
    key: 'bones',
    place: tie17({ at: [0.48, 1.4, -0.3], atRoot: [1.08, -2.83, 0.8], scale: 1.7 }),
    cut: [{ center: [0.2, -0.3, 0] as V3, a: [0, 0, 3.8] as V3, b: [0, 6.9, 0] as V3 }],
  } as Site,
  /**
   * The pharynx from behind (week18 cleft-model `archVModel`), in the embryo's neck: its third arches on the embryo's
   * third arches, and its long axis tilted 34 degrees with the flexed neck (arches I to VI run back as they go down),
   * so each pair of bulges lies on the pair the student saw from the left (tests/sites17.test.ts).
   */
  archV: { key: 'archV', place: onSite17({ key: 'arch', place: archPlace }, { at: [0, -0.09, -0.08], atParent: [0, -2.07, -1.5], scale: 1.15, turn: [-34, 0, 0] }) } as Site,
};
