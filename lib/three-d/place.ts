import { identity, mulM, type M4, type V3 } from './math';
import type { Plane } from './flyin';

/**
 * One body for a whole topic. Each 3D model of a topic (the posterior wall, a section block cut from it, the
 * pelvis, the perineum) is drawn in its own frame and at its own scale; a `Site` says where that model sits in
 * the topic's shared body. With it a stage change from one model to another is one camera flight: the view the
 * student was looking through is carried into the next model, the model just left stays where it belongs and
 * fades while the next one appears in its place (Stage3D `handover`), instead of two unrelated pictures
 * dissolving into each other, or a trip out of the embryo and back.
 */

/** A model's axes: 'trunk' (x left, y cranial, z ventral), 'block' (x left, y dorsal, z cranial), 'perineum' (x left, y ventral, z caudal). */
export type Frame3 = 'trunk' | 'block' | 'perineum';

export interface Site {
  /** The model's name: views of the same site are the same model (its pose can run on between them). */
  key: string;
  /** Puts the topic's shared body into this model's space. */
  place: M4;
  /** A section: the faces the model is cut at, in its own space. They glow on the model left or entered. */
  cut?: readonly Plane[];
}

/** Rows: which trunk axis (and sign) each of the frame's axes is. */
const ROT: Record<Frame3, readonly (readonly [number, number, number])[]> = {
  trunk: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
  // x = left, y = dorsal (−ventral), z = cranial.
  block: [[1, 0, 0], [0, 0, -1], [0, 1, 0]],
  // x = left, y = ventral, z = caudal (−cranial).
  perineum: [[1, 0, 0], [0, 0, 1], [0, -1, 0]],
};

/**
 * The matrix that takes a trunk-framed parent space into a child model's space: the parent point `atParent`
 * lands on the child point `at`, `scale` child units per parent unit, the axes turned to the child's `frame`.
 */
export function link(frame: Frame3, scale: number, at: V3, atParent: V3): M4 {
  const R = ROT[frame];
  const m = identity();
  for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) m[col * 4 + row] = R[row][col] * scale;
  for (let row = 0; row < 3; row++) m[12 + row] = at[row] - (m[row] * atParent[0] + m[4 + row] * atParent[1] + m[8 + row] * atParent[2]);
  return m;
}

/** The inverse of a similarity (uniform scale, rotation, translation). */
export function invSim(m: M4): M4 {
  const s2 = m[0] * m[0] + m[1] * m[1] + m[2] * m[2];
  const o = identity();
  for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) o[col * 4 + row] = m[row * 4 + col] / s2;
  for (let row = 0; row < 3; row++) o[12 + row] = -(o[row] * m[12] + o[4 + row] * m[13] + o[8 + row] * m[14]);
  return o;
}

/** `b` after `a`: a point of space A taken to B, then on to C. */
export const chain = (a: M4, b: M4): M4 => mulM(b, a);

/** The matrix that carries one site's space into another's, through the shared body. */
export const between = (from: M4, to: M4): M4 => mulM(to, invSim(from));

export const sameM = (a: M4, b: M4) => a.every((v, i) => Math.abs(v - b[i]) < 1e-5);
