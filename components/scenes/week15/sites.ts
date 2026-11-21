import type { M4, V3 } from '@/lib/three-d/math';
import type { Plane } from '@/lib/three-d/flyin';
import { chain, link, type Site } from '@/lib/three-d/place';

/**
 * Topic 15's nine models in one body (lib/three-d/place.ts), so a stage change is one camera flight from where the
 * student was looking to the next model, which appears where it belongs in the one just left (the standard set
 * with topic 16 and kept in 17–18: docs/quality/3d-quality-bar.md, "Continuity").
 *
 * THE ROOT is the posterior wall seen from the front (uro-model.ts): the three kidney systems, the ridges, the
 * kidneys' ascent, the suprarenal glands. Its space IS the shared body: x towards the embryo's LEFT, y cranial,
 * z ventral (the 'trunk' frame of place.ts); levels (LV) neck 3.0, thorax 1.0, lumbar −1.2, sacral −3.5,
 * cloaca −4.75. Every other model is tied to the model the story reaches it from, by ONE landmark the student
 * is watching at that moment:
 *
 *   wall ─┬─ neck block   (the left nephrotome at the neck: stages 3–4)
 *         ├─ thorax block (the left mesonephric ridge at the thorax: stage 6)
 *         ├─ kidney ── nephron (the left metanephros at the sacrum; a collecting tubule's tip at its upper pole)
 *         ├─ adrenal      (the left suprarenal gland)
 *         └─ pelvis ─┬─ trigone (the bladder, from behind)
 *                    └─ glans   (the end of the phallus)
 *
 * Numbers measured on the models (tests/sites15.test.ts keeps the landmarks together).
 */

/** Points of the root (uro-model.ts), in its own space = the shared body. */
export const ROOT15 = {
  /** The left intermediate mesoderm at the neck, where the nephrotomes form (pts `nefrotomak`, LV.neck). */
  nephrotome: [1.24, 3.0, -0.5] as V3,
  /** The left mesonephric ridge at the thorax (box of `ridge1` at LV.thorax). */
  ridge: [1.33, 1.0, -0.3] as V3,
  /** The left metanephros at the sacrum (box of `kid1`, before the ascent). */
  metanephros: [1.47, -3.4, -0.85] as V3,
  /** The left suprarenal gland (box of `adr1`). */
  adrenal: [1.52, 0.15, -0.9] as V3,
  /** The cloaca, in the midline (box of the wall's cloaca). */
  cloaca: [0, -4.35, 0.5] as V3,
} as const;

/**
 * Tie a model whose axes are not one of place.ts's frames: the parent point `atParent` lands on the model's point
 * `at`, `scale` model units per parent unit, and the model's x, y, z axes are the parent directions `ex`, `ey`,
 * `ez` (orthonormal, right-handed: a similarity, never a mirror).
 */
function tieAxes(at: V3, atParent: V3, scale: number, ex: V3, ey: V3, ez: V3): M4 {
  const R = [ex, ey, ez];
  const m = new Array(16).fill(0) as unknown as M4;
  for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) (m as unknown as number[])[col * 4 + row] = R[row][col] * scale;
  for (let row = 0; row < 3; row++) (m as unknown as number[])[12 + row] = at[row] - (m[row] * atParent[0] + m[4 + row] * atParent[1] + m[8 + row] * atParent[2]);
  (m as unknown as number[])[15] = 1;
  return m;
}

/** A section block's two cut faces (unit-model: the slab z = ±1.05, dorsal up). */
const BLOCK_FACES: Plane[] = [-1, 1].map((s) => ({ center: [0, 0.1, s * 1.05] as V3, a: [2.3, 0, 0] as V3, b: [0, 1.75, 0] as V3 }));

/** The phallus's long axis in the pelvis model (from its root to the glans: ventral and caudal, 34° below ventral). */
const PHALLUS: V3 = [0, -Math.sin((34 * Math.PI) / 180), Math.cos((34 * Math.PI) / 180)];

const wall: Site = { key: 'wall', place: link('trunk', 1, [0, 0, 0], [0, 0, 0]) };
const kidney: Site = { key: 'kidney', place: link('trunk', 3.3, [0.3, 0, 0], ROOT15.metanephros) };
const pelvis: Site = {
  key: 'pelvis',
  place: link('trunk', 1.2, [0, -0.95, 0.12], ROOT15.cloaca),
  // The sagittal cut face (pelvis-model's plate x = 0).
  cut: [{ center: [0, 0.2, -0.05] as V3, a: [0, 0, 1.95] as V3, b: [0, 2.4, 0] as V3 }],
};

export const SITE15 = {
  /** The root: the posterior wall from the front (uro-model). */
  wall,
  /** The neck cut across at the left nephrotomes (unit-model, pronephros): one segment's units. */
  neck: { key: 'neck', place: link('block', 1, [1.28, 0.5, 0], ROOT15.nephrotome), cut: BLOCK_FACES } as Site,
  /** The thorax cut across at the left mesonephric ridge (unit-model, mesonephros). */
  thorax: { key: 'thorax', place: link('block', 1, [1.32, 0.12, 0], ROOT15.ridge), cut: BLOCK_FACES } as Site,
  /** The left metanephros close up (kidney-model): the blastema's middle on the wall's. */
  kidney,
  /**
   * A collecting tubule's tip in the cortex (nephron-model), at the kidney's upper pole: the tip's cap of
   * blastema is the kidney model's cap there, four times larger.
   */
  nephron: { key: 'nephron', place: chain(kidney.place, link('trunk', 4, [1.07, 1.16, 0], [0.31, 1.6, -0.3])) } as Site,
  /** The left suprarenal gland cut open (adrenal-model), on the wall's gland. */
  adrenal: { key: 'adrenal', place: link('trunk', 3.9, [0, 0, -0.49], ROOT15.adrenal) } as Site,
  /** The caudal end cut down the middle (pelvis-model, seen from the left), its cloaca on the wall's. */
  pelvis,
  /** The bladder from behind (trigone-model), twice the pelvis model's size, on its bladder. */
  trigone: { key: 'trigone', place: chain(pelvis.place, link('trunk', 2, [0, 0, 0], [0, -0.05, 0.82])) } as Site,
  /**
   * The end of the phallus cut down its middle (glans-model: x = towards the tip, y up, the cut face z = 0
   * towards the viewer). In the body its tip points ventrally and caudally as in the pelvis model, and its cut
   * faces the embryo's right: the camera goes round the front of the phallus to the other side, so the glans
   * is seen as the notes draw it (tip on the viewer's right) without turning the picture over.
   */
  glans: {
    key: 'glans',
    place: chain(
      pelvis.place,
      tieAxes([2.56, 0, 0], [0, -2.43, 2.67], 2.4, PHALLUS, [0, PHALLUS[2], -PHALLUS[1]], [-1, 0, 0]),
    ),
    cut: [{ center: [0.9, 0, 0] as V3, a: [2.55, 0, 0] as V3, b: [0, 0.75, 0] as V3 }],
  } as Site,
};
