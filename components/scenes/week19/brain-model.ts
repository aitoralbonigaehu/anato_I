import type { V3 } from '@/lib/three-d/math';
import { curve3, type Mesh } from '@/lib/three-d/mesh';
import { cachedBlob } from '@/lib/three-d/mesh-cache';
import { geoOf, geoSlot } from '@/lib/three-d/offthread';
import { mergeParts, vessel, type Parts } from '@/lib/three-d/organic';
import { capsule, ellipsoid, mirrorX, smin, surfaceAlong, surfaceMesh, type SDF } from '@/lib/three-d/sdf';
import { cutSolid, onLattice, type Cut } from '@/lib/three-d/profile';
import type { Item3 } from '@/lib/three-d/scene';
import { blobParts, mixHex, routeLength, vesselRouteOf } from '@/components/scenes/week10/model3d';
import { C19, G19 } from './tones';

/**
 * Topic 19, sections 3 (the meninges round the brain), 10 (thalamus), 11 (cortex), 12 (ventricles) and 13 (the
 * cerebrospinal fluid): the head cut down the middle, the right half seen from the left (the face on the viewer's
 * left, as the notes' sagittal figures). Skull, dura, arachnoid, the subarachnoid space with its fluid, the pia on the
 * brain; the brain cut through: hemisphere, thalamus (in the wall of the third ventricle), hypothalamus, epithalamus,
 * midbrain with its aqueduct, pons, cerebellum, medulla and the cord with its central canal. The ventricles are
 * hollow, filled with the fluid as a cast when shown; the choroid plexuses in their roofs; the fluid's way as moving
 * drops. Each part can wear its vesicle's colour (origins). Tied to the body at the thalamus (sites.ts `SITE19.head`).
 *
 * Space: x the body's LEFT, y cranial, z ventral; the thalamus at the origin; 3 units per body unit.
 */

export interface BrainPose {
  /** The meninges and the skull round the brain (0..1); the subarachnoid fluid (0..1). */
  men: number;
  csf: number;
  /** The brain parts in their vesicle's colours (0..1). */
  origin: number;
  /** The ventricles' cast (0..1); the brain's tissue turned to glass round it (0..1); the choroid plexuses (0..1). */
  vent: number;
  glass: number;
  plex: number;
  /** The fluid moving: how far (any number; it runs while it grows) and how much shows (0..1). */
  flow: number;
  flowShow: number;
  /** Signals: up to the thalamus and on to the cortex (0..1), the motor order down (0..1), smell straight to the cortex (0..1). */
  sens: number;
  motor: number;
  smell: number;
  /** The other half (mirrored), for the whole brain seen from below or above (0..1). */
  whole: number;
  /** The cerebrum and cerebellum faded, to see the brainstem (0..1). */
  stem: number;
  /** The cranial pairs grown, in order (0..12). */
  nerves: number;
  /** The hypophysis developing (0..1: infundibulum and pouch, they meet, the pouch lets go, the two lobes); lobes told apart (0..1); hormones (0..1). */
  hyp: number;
  lobes: number;
  horm: number;
  /** The pineal gland in the epithalamus (0..1). */
  pineal: number;
  /**
   * Topic 20. `matter`: grey and white matter told apart on the cut (the cerebrum's grey outside, white inside; the
   * cord's grey inside, white outside) (0..1). `nuclei`: the basal nuclei (caudate, lentiform) and the internal capsule
   * between them, deep in the hemisphere (0..1). `comm`: the commissures, the anterior and posterior first (0..0.3),
   * then the corpus callosum from front to back (0.3..1).
   */
  matter?: number;
  nuclei?: number;
  comm?: number;
}
export const BR0: BrainPose = { men: 0, csf: 0, origin: 0, vent: 0, glass: 0, plex: 0, flow: 0, flowShow: 0, sens: 0, motor: 0, smell: 0, whole: 0, stem: 0, nerves: 0, hyp: 0, lobes: 0, horm: 0, pineal: 0, matter: 0, nuclei: 0, comm: 0 };

export interface BrainOpts {
  dim?: { ids: readonly string[]; k: number } | null;
}

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerpN = (a: number, b: number, k: number) => a + (b - a) * k;
const L = (kps: readonly V3[], n = 24) => curve3(kps as V3[], n);
const smax = (a: number, b: number, k: number) => -smin(-a, -b, k);

// ———————————————————————— the ventricles (one cavity system) ————————————————————————

const LAT: V3[] = [[-0.3, 0.38, 0.72], [-0.28, 0.54, 0.25], [-0.28, 0.52, -0.38], [-0.34, 0.2, -0.82], [-0.42, -0.2, -0.62], [-0.46, -0.34, -0.15]];
const latSegments = LAT.slice(1).map((p, i) => capsule(LAT[i], p, i === 0 ? 0.1 : 0.12, i >= 3 ? 0.08 : 0.12));
const latF: SDF = (x, y, z) => {
  let d = Infinity;
  for (const segment of latSegments) d = smin(d, segment(x, y, z), 0.06);
  return d;
};
const MONRO: [V3, V3] = [[-0.27, 0.32, 0.38], [-0.02, 0.2, 0.32]];
const monroF = capsule(MONRO[0], MONRO[1], 0.05, 0.05);
const thirdF = ellipsoid([0, -0.02, 0.04], [0.065, 0.32, 0.44]);
const AQ: [V3, V3] = [[0, -0.24, -0.36], [0, -0.58, -0.52]];
const aqF = capsule(AQ[0], AQ[1], 0.045, 0.045);
const fourthF: SDF = (() => {
  const body = ellipsoid([0, -0.84, -0.7], [0.2, 0.3, 0.12]);
  const recess = capsule([0, -0.86, -0.7], [-0.32, -0.9, -0.66], 0.06, 0.04);
  return (x, y, z) => smin(body(x, y, z), recess(x, y, z), 0.05);
})();
const CANAL: [V3, V3] = [[0, -1.08, -0.66], [0, -3.05, -0.78]];
const canalF = capsule(CANAL[0], CANAL[1], 0.024, 0.024);
const ventF: SDF = (x, y, z) => Math.min(latF(x, y, z), monroF(x, y, z), thirdF(x, y, z), aqF(x, y, z), fourthF(x, y, z), canalF(x, y, z));

// ———————————————————————— the brain's parts ————————————————————————

const gyri = (x: number, y: number, z: number) => 0.018 * Math.sin(17 * x + 5 * z) * Math.sin(15 * y + 3 * x) * Math.sin(16 * z - 2 * y);
const dienRegion = ellipsoid([-0.1, -0.05, 0.0], [0.42, 0.4, 0.56]);
const cerebrumRaw = ellipsoid([-0.3, 0.36, 0.06], [0.62, 0.82, 1.24]);
const thalF = ellipsoid([-0.17, 0.02, -0.05], [0.24, 0.24, 0.38]);
const hypoF = ellipsoid([-0.05, -0.3, 0.28], [0.15, 0.15, 0.22]);
const epiF = ellipsoid([-0.03, 0.15, -0.5], [0.07, 0.07, 0.08]);
const midF = capsule([0, -0.16, -0.32], [0, -0.6, -0.5], 0.25, 0.24);
const ponsF = ellipsoid([0, -0.84, -0.36], [0.34, 0.28, 0.3]);
const medF = capsule([0, -1.02, -0.56], [0, -1.6, -0.7], 0.21, 0.17);
const cordF = capsule([0, -1.6, -0.7], [0, -3.1, -0.78], 0.17, 0.16);
const cblF = ellipsoid([-0.42, -0.8, -1.02], [0.52, 0.4, 0.42]);
const carve = (d: number, x: number, y: number, z: number) => (d > 0.15 ? d : smax(d, -ventF(x, y, z), 0.015));
const PARTS: Record<string, { f: SDF; lo: V3; hi: V3 }> = {
  cerebrum: {
    f: (x, y, z) => {
      let d = smax(cerebrumRaw(x, y, z), -(dienRegion(x, y, z) - 0.03), 0.06);
      if (d < 0.06) d += gyri(x, y, z);
      return carve(d, x, y, z);
    },
    lo: [-0.95, -0.5, -1.2], hi: [0.02, 1.2, 1.32],
  },
  thal: { f: (x, y, z) => carve(thalF(x, y, z), x, y, z), lo: [-0.45, -0.25, -0.46], hi: [0.02, 0.28, 0.36] },
  hypo: { f: (x, y, z) => carve(hypoF(x, y, z), x, y, z), lo: [-0.22, -0.48, 0.04], hi: [0.02, -0.12, 0.52] },
  epi: { f: epiF, lo: [-0.12, 0.06, -0.6], hi: [0.02, 0.24, -0.4] },
  mid: {
    // The thalamus meets the midbrain here. Give them a shared boundary so the cut faces cannot overlap.
    f: (x, y, z) => carve(Math.max(midF(x, y, z), -thalF(x, y, z)), x, y, z),
    lo: [-0.3, -0.88, -0.78], hi: [0.02, 0.12, -0.04],
  },
  pons: { f: (x, y, z) => carve(ponsF(x, y, z), x, y, z), lo: [-0.38, -1.14, -0.7], hi: [0.02, -0.54, -0.04] },
  med: { f: (x, y, z) => carve(medF(x, y, z), x, y, z), lo: [-0.24, -1.82, -0.94], hi: [0.02, -0.8, -0.32] },
  cord: { f: (x, y, z) => carve(cordF(x, y, z), x, y, z), lo: [-0.2, -3.12, -0.98], hi: [0.02, -1.5, -0.5] },
  cbl: {
    f: (x, y, z) => {
      let d = smax(cblF(x, y, z), -(fourthF(x, y, z) + 0.02), 0.03);
      if (d < 0.05) d += 0.012 * Math.sin(48 * y + 9 * z);
      return d;
    },
    lo: [-0.96, -1.22, -1.46], hi: [0.02, -0.38, -0.56],
  },
};
/** The whole brain, smoothed: the meninges and the skull are shells at given distances from it. */
const envelope = (cerebrum: number, cbl: number, x: number, y: number, z: number) => {
  let d = smin(cerebrum, cbl, 0.15);
  d = smin(d, ponsF(x, y, z), 0.12);
  d = smin(d, medF(x, y, z), 0.1);
  d = smin(d, cordF(x, y, z), 0.08);
  d = smin(d, midF(x, y, z), 0.1);
  return d;
};
const brainU: SDF = (x, y, z) => envelope(cerebrumRaw(x, y, z), cblF(x, y, z), x, y, z);
/**
 * The brain's own surface, folds and all (the pia lies on it and goes into the sulci). It is never outside a part's
 * surface (smooth-min ≤ min, the parts' folds added alike), so the pia's cut never lies over a part's cut.
 */
const brainG: SDF = (x, y, z) => {
  let c = cerebrumRaw(x, y, z);
  if (c < 0.06) c += gyri(x, y, z);
  let b = cblF(x, y, z);
  if (b < 0.05) b += 0.012 * Math.sin(48 * y + 9 * z);
  return envelope(c, b, x, y, z);
};
/**
 * A layer at distances a..b from the brain: its outer face (distance b) and inner face (distance a, pushed out a
 * hair so it never coincides with the layer inside it), each the surface of a thick solid, so the thin layer stays
 * whole however coarse the grid; cut at the midline (and above yMin for the skull and scalp; at the block's foot).
 */
const PUSH = 0.004;
const shell = (a: number, b: number, yMin = -3.15) => ({ a, b, yMin, onBrain: false });
const SHELLS: Record<string, { a: number; b: number; yMin: number; onBrain: boolean }> = {
  pia: { ...shell(0.0, 0.04), onBrain: true },
  sub: shell(0.04, 0.13),
  arach: shell(0.13, 0.17),
  dura: shell(0.17, 0.25),
  skull: shell(0.25, 0.47, -1.05),
  scalp: shell(0.47, 0.56, -0.95),
};
const SHELL_BOX: [V3, V3] = [[-1.5, -3.3, -2.0], [0.02, 1.75, 1.85]];
const shellPoint = (d: number, z: number, field = brainU) =>
  surfaceAlong((x, y, zz) => field(x, y, zz) - d, [0, 0.36, z], [0, 1, 0]).p;
const meningealPoints = {
  'pia-materra': shellPoint(0.022, 0.12, brainG),
  'eremu-azpiaraknoideoa': shellPoint(0.085, -0.5),
  'araknoidesa': shellPoint(0.15, -0.1),
  'dura-materra': shellPoint(0.21, 0.3),
  'neurokraneoa': shellPoint(0.36, 0.6),
};

/** The ventricles' casts, slightly inside their cavities: one per cavity, so each can be lit and named. */
const cast = (f: SDF): SDF => (x, y, z) => f(x, y, z) + 0.008;
const CASTS: Record<string, { f: SDF; lo: V3; hi: V3 }> = {
  lat: { f: cast((x, y, z) => Math.min(latF(x, y, z), monroF(x, y, z))), lo: [-0.62, -0.5, -1.0], hi: [0.02, 0.72, 0.9] },
  third: { f: cast(thirdF), lo: [-0.1, -0.4, -0.45], hi: [0.02, 0.35, 0.52] },
  aq: { f: cast(aqF), lo: [-0.08, -0.66, -0.6], hi: [0.02, -0.16, -0.28] },
  fourth: { f: cast(fourthF), lo: [-0.42, -1.18, -0.86], hi: [0.02, -0.52, -0.54] },
  canal: { f: cast(canalF), lo: [-0.05, -3.1, -0.82], hi: [0.02, -1.0, -0.6] },
};

/** The midline cut: the right half kept (x ≤ 0). The casts sit a hair off it, inside their cavities. */
const MID: Cut = { axis: 0, at: 0, keep: 1 };
const CAST_MID: Cut = { axis: 0, at: -0.004, keep: 1 };
// Adjacent tissues overlap slightly to hide seams when rotating. Stagger their sagittal planes
// by a fraction of the grid spacing so their overlapping caps have a stable depth order.
const PART_DEPTH: Record<string, number> = {
  cerebrum: -0.012, cbl: -0.0105, cord: -0.0095, mid: -0.0085, med: -0.0075,
  pons: -0.0065, thal: -0.0055, hypo: -0.003, epi: -0.002,
};

const solid = (f: SDF, lo: V3, hi: V3, step: number, cut: Cut, capStep: number, hitScale = 2.6) => ({
  m: cutSolid({ faces: [{ f }], solid: f, lo, hi, step, cuts: [cut], capStep }),
  h: cutSolid({ faces: [{ f }], solid: f, lo, hi, step: step * hitScale, cuts: [cut], capStep: capStep * 3 }),
});

function buildBrainParts() {
  const parts: Record<string, { m: Mesh; h: Mesh }> = {};
  for (const [k, p] of Object.entries(PARTS))
    parts[k] = solid(p.f, p.lo, p.hi, 0.028, { ...MID, at: PART_DEPTH[k] }, 0.008);
  return parts;
}

// ———————————————————————— topic 20: grey and white, the basal nuclei, the commissures ————————————————————————

/**
 * The cerebrum's white core: the hemisphere less a rim of cortex (grey outside, white inside), and the cord's grey
 * core (grey inside, white outside). Each is cut a hair nearer the viewer than its part, so on the midline cut the
 * core shows inside its part's rim; seen from outside it stays hidden in the part.
 */
const CORES: Record<string, { f: SDF; lo: V3; hi: V3; at: number }> = {
  cerebrum: {
    f: (x, y, z) => carve(smax(cerebrumRaw(x, y, z), -(dienRegion(x, y, z) - 0.03), 0.06) + 0.085, x, y, z),
    lo: [-0.85, -0.4, -1.1], hi: [0.02, 1.1, 1.22], at: -0.011,
  },
  cord: { f: (x, y, z) => carve(cordF(x, y, z) + 0.085, x, y, z), lo: [-0.12, -3.1, -0.9], hi: [0.02, -1.5, -0.6], at: -0.009 },
};
function buildCores() {
  const out: Record<string, { m: Mesh; h: Mesh }> = {};
  for (const [k, c] of Object.entries(CORES)) out[k] = solid(c.f, c.lo, c.hi, 0.028, { ...MID, at: c.at }, 0.008);
  return out;
}
/** The basal nuclei: the caudate along the lateral ventricle (head, body, tail), the lentiform lateral to the thalamus. */
const CAUDATE: V3[] = [[-0.42, 0.3, 0.56], [-0.42, 0.44, 0.22], [-0.42, 0.46, -0.18], [-0.44, 0.3, -0.56], [-0.5, 0.0, -0.66]];
const caudateF: SDF = (() => {
  const segs = CAUDATE.slice(1).map((q, i) => capsule(CAUDATE[i], q, [0.14, 0.09, 0.07, 0.05][i], [0.09, 0.07, 0.05, 0.04][i]));
  return (x, y, z) => segs.reduce((d, s) => smin(d, s(x, y, z), 0.04), Infinity);
})();
const lentiformF = ellipsoid([-0.6, 0.06, 0.16], [0.13, 0.2, 0.32]);
function buildNuclei() {
  const box = (lo: V3, hi: V3) => ({ lo, hi });
  const c = box([-0.62, -0.12, -0.78], [-0.26, 0.6, 0.74]);
  const l = box([-0.76, -0.18, -0.2], [-0.44, 0.3, 0.52]);
  return {
    caudate: { m: surfaceMesh(caudateF, c.lo, c.hi, 0.02), h: surfaceMesh(caudateF, c.lo, c.hi, 0.05) },
    lentiform: { m: surfaceMesh(lentiformF, l.lo, l.hi, 0.02), h: surfaceMesh(lentiformF, l.lo, l.hi, 0.05) },
  };
}

function buildMeninges() {
  const shells: Record<string, { m: Mesh; h: Mesh }> = {};
  // Each distance from the brain is one surface, shared by the layer outside it (its inner face, pushed out a hair)
  // and the layer inside it (its outer face); the caps share one plane grid, so the brain's field is read once.
  const STEP = 0.05, CAP = 0.007;
  const u2 = onLattice(brainU, [0, SHELL_BOX[0][1] - CAP, SHELL_BOX[0][2] - CAP], [0, SHELL_BOX[1][1] + CAP, SHELL_BOX[1][2] + CAP], CAP);
  const hiPast: V3 = [3 * STEP, SHELL_BOX[1][1], SHELL_BOX[1][2]];
  // The levels' grids are one lattice (the click meshes' a coarser subset of it): the field is read once per point.
  const u3 = onLattice(brainU, SHELL_BOX[0], hiPast, STEP);
  const g3 = onLattice(brainG, SHELL_BOX[0], hiPast, STEP);
  const g2 = onLattice(brainG, [0, SHELL_BOX[0][1] - CAP, SHELL_BOX[0][2] - CAP], [0, SHELL_BOX[1][1] + CAP, SHELL_BOX[1][2] + CAP], CAP);
  const levels = new Map<string, { m: Mesh; h: Mesh }>();
  const level = (field: SDF, d: number, step: number) => {
    const key = `${field === brainG ? 'g' : 'u'}${d}`;
    let l = levels.get(key);
    if (!l) {
      const lat = field === brainG ? g3 : u3;
      const f: SDF = (x, y, z) => lat(x, y, z) - d;
      levels.set(key, (l = { m: surfaceMesh(f, SHELL_BOX[0], hiPast, step), h: surfaceMesh(f, SHELL_BOX[0], hiPast, step * 2) }));
    }
    return l;
  };
  for (const [k, sh] of Object.entries(SHELLS)) {
    // The pia's inner face is the brain's folded surface itself, a hair out.
    const layer: SDF = (x, y, z) => Math.max(u2(x, y, z) - sh.b, sh.onBrain ? PUSH - g2(x, y, z) : sh.a + PUSH - u2(x, y, z));
    const cuts: Cut[] = [MID, { axis: 1, at: sh.yMin, keep: -1 }];
    const one = (q: 'm' | 'h', capStep: number) =>
      cutSolid({
        faces: [{ mesh: level(brainU, sh.b, STEP)[q] }, sh.onBrain ? { mesh: level(brainG, PUSH, STEP)[q], flip: true } : { mesh: level(brainU, sh.a, STEP)[q], flip: true, push: PUSH }],
        solid: layer, lo: SHELL_BOX[0], hi: SHELL_BOX[1], step: STEP, cuts, capStep,
      });
    shells[k] = { m: one('m', CAP), h: one('h', 0.02) };
  }
  return shells;
}

function buildVentricles() {
  const casts: Record<string, { m: Mesh; h: Mesh }> = {};
  // The thin ones keep a fine grid, or they fall through it: the canal is 0.016 across, the aqueduct 0.037, the
  // third ventricle a slit (tests/mesh-guard.test.ts checks every grid against what it meshes).
  const CAST_STEP: Record<string, number> = { canal: 0.006, aq: 0.012, third: 0.014 };
  for (const [k, c] of Object.entries(CASTS)) casts[k] = solid(c.f, c.lo, c.hi, CAST_STEP[k] ?? 0.02, CAST_MID, 0.004, 1.6);
  return casts;
}
/** Request only the anatomy the stage can display. */
export const BRAIN19_GEO = geoSlot('brain19', buildBrainParts);
export const MENINGES19_GEO = geoSlot('meninges19', buildMeninges);
export const VENTRICLES19_GEO = geoSlot('ventricles19', buildVentricles);
export const CORES20_GEO = geoSlot('cores20', buildCores);
export const NUCLEI20_GEO = geoSlot('nuclei20', buildNuclei);

/**
 * The internal capsule: a fan of myelinated axons from the cortex down between the caudate (and thalamus) and the
 * lentiform nucleus to the cerebral peduncle. The commissures: bundles of axons crossing the midline (x = 0) into the
 * hemisphere; the corpus callosum an arch of them from the genu (front) to the splenium (back).
 */
const CAPSULE_FIBRES: V3[][] = [0.42, 0.22, 0.02, -0.18].map((z, i) => L([[-0.5, 0.82, z + 0.05], [-0.5, 0.42, z * 0.8], [-0.48, 0.08, z * 0.55 - 0.02], [-0.3, -0.3, -0.18 - 0.03 * i], [-0.16, -0.52, -0.32 - 0.03 * i]], 24));
const CC_ARC: [number, number][] = [[0.4, 0.5], [0.52, 0.62], [0.64, 0.42], [0.69, 0.15], [0.7, -0.12], [0.66, -0.36], [0.56, -0.52], [0.46, -0.58]];
const ccFibre = (y: number, z: number, side = 1): V3[] => L([[0.02, y, z], [-0.2, y + 0.02, z], [-0.38, y + 0.1, z * 1.02], [-0.5, y + 0.3 * side, z * 1.05]], 12);
const CC_FIBRES: V3[][] = CC_ARC.flatMap(([y, z]) => [ccFibre(y, z), ccFibre(y - 0.04, z - 0.02, -0.4)]);
const AC_FIBRES: V3[][] = [[-0.1, 0.5], [-0.13, 0.49], [-0.07, 0.49]].map(([y, z]) => L([[0.02, y, z], [-0.2, y, z + 0.02], [-0.42, y - 0.1, z - 0.05], [-0.55, y - 0.3, z - 0.2]], 12));
const PC_FIBRES: V3[][] = [[-0.12, -0.44], [-0.15, -0.43]].map(([y, z]) => L([[0.02, y, z], [-0.14, y + 0.02, z], [-0.26, y + 0.06, z + 0.02]], 8));

// ———————————————————————— paths ————————————————————————

const THAL_PT: V3 = [-0.17, 0.02, -0.05];
const SENS_CX: V3 = [-0.18, 1.08, -0.22];
const MOTOR_CX: V3 = [-0.18, 1.1, 0.06];
/** Sensory: up the cord and the brainstem to the thalamus (synapse), then on to the sensory cortex. */
export const SENS_UP: V3[] = L([[-0.1, -3.0, -0.72], [-0.1, -2.0, -0.7], [-0.1, -1.3, -0.62], [-0.12, -0.8, -0.44], [-0.14, -0.4, -0.3], THAL_PT], 60);
export const SENS_CX_PATH: V3[] = L([THAL_PT, [-0.2, 0.4, -0.14], [-0.2, 0.8, -0.2], SENS_CX], 30);
/** Motor: from the motor cortex down through the brainstem into the cord. */
export const MOTOR_DOWN: V3[] = L([MOTOR_CX, [-0.2, 0.7, 0.08], [-0.2, 0.25, 0.02], [-0.12, -0.3, -0.22], [-0.1, -0.85, -0.4], [-0.08, -1.4, -0.6], [-0.08, -2.2, -0.72], [-0.08, -3.0, -0.75]], 70);
/** Smell: from the nose's olfactory bulb under the frontal lobe straight to the cortex, past the thalamus. */
const SMELL: V3[] = L([[-0.12, -0.42, 1.1], [-0.14, -0.38, 0.7], [-0.2, -0.24, 0.42], [-0.26, 0.2, 0.36], [-0.24, 0.62, 0.42]], 30);

/** The fluid's way: lateral ventricle → Monro → third → aqueduct → fourth → out through the apertures, round the brain in the subarachnoid space, up to the top. */
const FLOW_IN: V3[] = [LAT[4], LAT[3], LAT[2], LAT[1], [-0.28, 0.46, 0.4], MONRO[0], MONRO[1], [0, 0.12, 0.16], [0, -0.1, -0.12], [0, -0.22, -0.34], AQ[0], AQ[1], [0, -0.74, -0.66], [0, -0.92, -0.72], [0, -1.06, -0.86], [-0.02, -1.24, -1.08]];
const FLOW_OUT: V3[] = [[-0.02, -1.24, -1.08], [-0.1, -1.18, -1.48], [-0.12, -0.6, -1.56], [-0.12, 0.2, -1.42], [-0.12, 0.9, -0.95], [-0.08, 1.24, -0.2], [-0.06, 1.24, 0.4]];
const FLOW_CANAL: V3[] = [[0, -0.92, -0.72], [0, -1.2, -0.68], [0, -2.0, -0.73], [0, -2.9, -0.77]];
const FLOW_LUSCHKA: V3[] = [[0, -0.86, -0.7], [-0.32, -0.9, -0.66], [-0.5, -0.98, -0.5], [-0.62, -0.62, -0.32]];
const FLOWS = ([
  ['in', FLOW_IN, 1.6], ['out', FLOW_OUT, 1.6], ['canal', FLOW_CANAL, 1], ['luschka', FLOW_LUSCHKA, 1.2],
] as const).map(([key, line, speed]) => {
  const route = vesselRouteOf(L(line, 60));
  return { key, route, rate: speed / routeLength(route) };
});

const cellsOf = (n: number, jit: number) => {
  const cells = new Float32Array(n * 4);
  const gates = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    cells.set([i / n, Math.sin(i * 12.9) * jit, Math.cos(i * 7.3) * jit * 0.6, Math.sin(i * 3.1) * jit], i * 4);
    gates[i] = ((i * 0.618034) % 1) * 0.85;
  }
  return { cells, gates };
};
const DROPS = cellsOf(18, 0.02);

const mirrored = new WeakMap<Mesh, Mesh>();
const mirror = (m: Mesh) => {
  let r = mirrored.get(m);
  if (!r) mirrored.set(m, (r = mirrorX(m)));
  return r;
};
const ss = (a: number, b: number, x: number) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};

// ———————————————————————— the cranial pairs (11): the right side; the left is its mirror ————————————————————————

/** Each pair, front to back: its id, its way out of the brain (from where it leaves), its thickness. */
const CRANIAL: { n: number; id: string; line: V3[]; r: number }[] = [
  { n: 1, id: 'usaimen-nerbioa', line: L([[-0.15, -0.44, 0.4], [-0.14, -0.37, 0.68], [-0.13, -0.3, 0.86]], 16), r: 0.018 },
  { n: 2, id: 'nerbio-optikoa', line: L([[-0.28, -0.3, 0.0], [-0.18, -0.44, 0.24], [-0.04, -0.5, 0.45], [-0.12, -0.48, 0.62], [-0.22, -0.46, 0.78]], 24), r: 0.026 },
  { n: 3, id: 'nerbio-begi-eragilea', line: L([[-0.07, -0.5, -0.2], [-0.15, -0.53, 0.05], [-0.24, -0.5, 0.4]], 16), r: 0.02 },
  { n: 4, id: 'nerbio-troklearra', line: L([[-0.05, -0.62, -0.72], [-0.22, -0.62, -0.62], [-0.31, -0.58, -0.35], [-0.31, -0.56, -0.05], [-0.3, -0.52, 0.35]], 28), r: 0.012 },
  { n: 5, id: 'nerbio-trigeminoa', line: L([[-0.31, -0.8, -0.3], [-0.45, -0.79, -0.22], [-0.55, -0.78, -0.15]], 12), r: 0.04 },
  { n: 6, id: 'nerbio-aldentzailea', line: L([[-0.07, -1.08, -0.34], [-0.12, -1.0, -0.1], [-0.18, -0.86, 0.25]], 16), r: 0.016 },
  { n: 7, id: 'aurpegi-nerbioa', line: L([[-0.29, -1.02, -0.42], [-0.5, -1.0, -0.36], [-0.68, -0.99, -0.26]], 14), r: 0.022 },
  { n: 8, id: 'nerbio-estatoakustikoa', line: L([[-0.31, -1.07, -0.5], [-0.52, -1.07, -0.44], [-0.68, -1.1, -0.36]], 14), r: 0.026 },
  { n: 9, id: 'nerbio-glosofaringeoa', line: L([[-0.19, -1.18, -0.53], [-0.4, -1.2, -0.5], [-0.6, -1.25, -0.42]], 14), r: 0.02 },
  { n: 10, id: 'nerbio-bagoa', line: L([[-0.19, -1.28, -0.57], [-0.42, -1.32, -0.55], [-0.62, -1.44, -0.46]], 14), r: 0.026 },
  { n: 11, id: 'nerbio-osagarria', line: L([[-0.17, -2.15, -0.76], [-0.2, -1.75, -0.74], [-0.22, -1.46, -0.66], [-0.44, -1.47, -0.6], [-0.62, -1.6, -0.5]], 28), r: 0.016 },
  { n: 12, id: 'nerbio-hipoglosoa', line: L([[-0.09, -1.3, -0.44], [-0.25, -1.33, -0.25], [-0.4, -1.37, 0.0]], 14), r: 0.02 },
];
/** The trigeminal ganglion and its three branches (ophthalmic, maxillary, mandibular). */
const TRIG_GANGLION: V3 = [-0.57, -0.78, -0.13];
const TRIG_BRANCHES: V3[][] = [
  L([TRIG_GANGLION, [-0.6, -0.72, 0.05], [-0.6, -0.66, 0.24]], 10),
  L([TRIG_GANGLION, [-0.62, -0.8, 0.08], [-0.63, -0.82, 0.26]], 10),
  L([TRIG_GANGLION, [-0.61, -0.9, -0.02], [-0.62, -1.02, 0.14]], 10),
];
const OLF_BULB: V3 = [-0.13, -0.27, 0.95];
const CHIASM: V3 = [-0.035, -0.5, 0.46];
/** In the whole view from below, a few names sit further along their nerve (clear of the brain behind and of each other). */
const CN_BELOW: Record<string, V3> = {
  'nerbio-begi-eragilea': [-0.117, -0.501, -0.083],
  'nerbio-troklearra': [-0.304, -0.569, -0.177],
  'nerbio-aldentzailea': [-0.112, -1.012, -0.096],
  'nerbio-glosofaringeoa': [-0.36, -1.196, -0.505],
};
/** Where each pair's name points: a little out from where it leaves the brain (the bulb for the first). */
const CN_PT: Record<string, V3> = {
  'usaimen-nerbioa': OLF_BULB,
  'nerbio-optikoa': [-0.14, -0.475, 0.65],
  'nerbio-begi-eragilea': [-0.17, -0.53, 0.12],
  'nerbio-troklearra': [-0.31, -0.57, -0.2],
  'nerbio-trigeminoa': TRIG_GANGLION,
  'nerbio-aldentzailea': [-0.13, -0.98, -0.05],
  'aurpegi-nerbioa': [-0.55, -1.0, -0.33],
  'nerbio-estatoakustikoa': [-0.58, -1.08, -0.42],
  'nerbio-glosofaringeoa': [-0.47, -1.21, -0.48],
  'nerbio-bagoa': [-0.5, -1.36, -0.52],
  'nerbio-osagarria': [-0.2, -1.8, -0.74],
  'nerbio-hipoglosoa': [-0.3, -1.34, -0.17],
};

// ———————————————————————— the hypophysis (10.4.1) ————————————————————————

const INFUND: V3[] = L([[0, -0.42, 0.3], [0, -0.52, 0.29], [0, -0.63, 0.26]], 14);
const ORAL: V3 = [0, -1.0, 0.42];
const POUCH: V3[] = L([[0, -0.98, 0.4], [0, -0.84, 0.39], [0, -0.68, 0.36]], 14);
const NEURO: V3 = [0, -0.67, 0.25];
const ADENO: V3 = [0, -0.68, 0.36];
const HORM_DOWN = (() => {
  const route = vesselRouteOf(L([[0, -0.3, 0.3], [0, -0.45, 0.3], [0, -0.6, 0.27], [0, -0.7, 0.25], [0, -0.86, 0.24]], 30));
  return { route, rate: 0.6 / routeLength(route) };
})();
const HORM_ADENO = (() => {
  const route = vesselRouteOf(L([[0, -0.66, 0.37], [0, -0.74, 0.38], [0, -0.9, 0.4]], 20));
  return { route, rate: 0.5 / routeLength(route) };
})();
const PINEAL: V3 = [0, 0.1, -0.6];
const HDROPS = cellsOf(10, 0.012);

export function brainModel(pose: BrainPose, o: BrainOpts = {}) {
  const parts = geoOf(BRAIN19_GEO);
  const items: Item3[] = [];
  const pts: Record<string, V3> = {};
  const dim = o.dim && o.dim.k > 0.001 ? o.dim : null;
  const k = dim ? dim.k : 0;
  const lit = (id: string | undefined, groups?: readonly string[]) => !dim || (!!id && dim.ids.includes(id)) || (groups ?? []).some((g) => dim.ids.includes(g));
  const put = (key: string, id: string | undefined, parts: Parts | null, color: string, deep: string, extra: Partial<Item3> = {}) => {
    if (!parts || (extra.opacity ?? 1) <= 0.01) return;
    const off = !!dim && !!id && !extra.ground && !lit(id, extra.groups);
    items.push({ key, id, ...parts, color: off ? mixHex(color, '#c4bcbb', 0.45 * k) : color, deep: off ? mixHex(deep, '#7c7472', 0.45 * k) : deep, tissue: 'neural', ...extra });
  };
  const P = (g: { m: Mesh; h: Mesh }): Parts => ({ mesh: g.m, hit: g.h });
  const origin = clamp01(pose.origin), glass = clamp01(pose.glass);
  const tone = (adult: string, vesicle: string) => mixHex(adult, vesicle, origin);
  const brainOp = 1 - 0.6 * glass;
  const B = C19.brain, BD = C19.brainDeep;
  const ENC = ['entzefaloa', 'nerbio-sistema-zentrala'];
  const whole = clamp01(pose.whole), stemK = clamp01(pose.stem);
  const fadeOp = brainOp * (1 - 0.88 * stemK);
  const PM = (g: { m: Mesh; h: Mesh }): Parts => ({ mesh: mirror(g.m), hit: mirror(g.h) });
  /** A part of the brain, and its mirror image (the other half) when the whole brain shows. */
  const half = (key: string, id: string, g: { m: Mesh; h: Mesh }, color: string, deep: string, extra: Partial<Item3>) => {
    put(key, id, P(g), color, deep, extra);
    if (whole > 0.01) put(`${key}-L`, id, PM(g), color, deep, { ...extra, opacity: (extra.opacity ?? 1) * whole });
  };

  // ———— the brain, cut down the middle ————
  // Topic 20 (grey and white matter): the cortex turns grey, the cord's outside white (their cores: below).
  const matterK = clamp01(pose.matter ?? 0);
  half('cerebrum', 'garun-hemisferioak', parts.cerebrum, mixHex(tone(B, C19.tel), C19.grey, 0.6 * matterK), BD, { groups: ['telentzefaloa', ...ENC], opacity: fadeOp, calm: true });
  half('thal', 'talamoa', parts.thal, tone(mixHex(B, '#c99a90', 0.35), C19.dien), BD, { groups: ['dientzefaloa', ...ENC], opacity: brainOp });
  half('hypo', 'hipotalamoa', parts.hypo, tone(mixHex(B, '#d6a092', 0.4), C19.dien), BD, { groups: ['dientzefaloa', ...ENC], opacity: brainOp });
  half('epi', 'epitalamoa', parts.epi, tone(mixHex(B, '#b98a80', 0.4), C19.dien), BD, { groups: ['dientzefaloa', ...ENC], opacity: brainOp });
  half('mid', 'mesentzefaloa', parts.mid, tone(mixHex(B, '#c9a094', 0.3), C19.mes), BD, { groups: ['entzefalo-enborra', ...ENC], opacity: brainOp });
  half('pons', 'zubia', parts.pons, tone(mixHex(B, '#d2a898', 0.3), C19.met), BD, { groups: ['metentzefaloa', 'entzefalo-enborra', ...ENC], opacity: brainOp });
  half('cbl', 'garuntxoa', parts.cbl, tone(mixHex(B, '#d99a8c', 0.4), C19.met), BD, { groups: ['metentzefaloa', ...ENC], opacity: fadeOp });
  half('med', 'erraboila', parts.med, tone(mixHex(B, '#c99a90', 0.3), C19.miel), BD, { groups: ['mielentzefaloa', 'entzefalo-enborra', ...ENC], opacity: brainOp });
  half('cord', 'ornomuina', parts.cord, mixHex(B, C19.white, 0.6 * matterK), BD, { groups: ['nerbio-sistema-zentrala', 'hodi-ependimarioa'], opacity: brainOp });
  pts['garun-hemisferioak'] = [0, 0.86, 0.5];
  pts['talamoa'] = [-0.07, 0.02, -0.05];
  pts['hipotalamoa'] = [0, -0.3, 0.32];
  pts['epitalamoa'] = [0, 0.16, -0.5];
  pts['mesentzefaloa'] = [0, -0.36, -0.28];
  pts['zubia'] = [0, -0.84, -0.18];
  pts['garuntxoa'] = [0, -0.8, -1.2];
  pts['erraboila'] = [0, -1.3, -0.52];
  pts['ornomuina'] = [0, -2.4, -0.62];
  pts['entzefaloa'] = [0, 0.5, -0.7];
  pts['entzefalo-enborra'] = [0, -0.84, -0.18];
  pts['dientzefaloa'] = [-0.07, 0.02, -0.05];
  pts['telentzefaloa'] = [0, 0.86, 0.5];
  pts['metentzefaloa'] = [0, -0.8, -1.2];
  pts['mielentzefaloa'] = [0, -1.3, -0.52];

  // ———— topic 20: grey and white matter on the cut ————
  const matter = clamp01(pose.matter ?? 0);
  if (matter > 0.01) {
    const cores = geoOf(CORES20_GEO);
    // The cerebrum's rim reads as the grey cortex, its core as the white matter; the cord the other way round.
    half('core-cerebrum', 'gai-zuria', cores.cerebrum, mixHex(B, C19.white, matter), C19.whiteDeep, { groups: ['telentzefaloa', 'garun-hemisferioak'], opacity: fadeOp, calm: true });
    half('core-cord', 'gai-grisa', cores.cord, mixHex(B, C19.grey, matter), C19.greyDeep, { groups: ['ornomuina'], opacity: brainOp });
    pts['gai-zuria'] = [0, 0.6, 0.05];
    pts['gai-grisa'] = [0, -2.3, -0.7];
  }
  // ———— topic 20: the basal nuclei and the internal capsule, deep in the hemisphere ————
  const nuclei = clamp01(pose.nuclei ?? 0);
  if (nuclei > 0.01) {
    const n = geoOf(NUCLEI20_GEO);
    const NB = ['oinaldeko-nukleoak', 'telentzefaloa'];
    half('caudate', 'nukleo-kaudatua', n.caudate, '#b48fd6', '#4e2f6c', { groups: NB, opacity: nuclei });
    half('lentiform', 'nukleo-lentikularra', n.lentiform, '#c99ee0', '#5a3478', { groups: NB, opacity: nuclei });
    const fan = mergeParts(CAPSULE_FIBRES.map((l) => vessel(l, { r0: 0.022, r1: 0.022, sides: 8, n: l.length }, nuclei)));
    put('capsule', 'barneko-kapsula', fan, '#fbf6ea', '#9a8c70', { groups: ['telentzefaloa', 'gai-zuria'], tissue: 'nerve' });
    pts['nukleo-kaudatua'] = [-0.42, 0.44, 0.22];
    pts['nukleo-lentikularra'] = [-0.6, 0.06, 0.16];
    pts['oinaldeko-nukleoak'] = [-0.6, 0.06, 0.16];
    pts['barneko-kapsula'] = [-0.49, 0.3, 0.12];
  }
  // ———— topic 20: the commissures, axons crossing the midline ————
  const comm = clamp01(pose.comm ?? 0);
  if (comm > 0.01) {
    const small = clamp01(comm / 0.3), cc = clamp01((comm - 0.3) / 0.7);
    const fib = (lines: V3[][], g: number, r: number) => mergeParts(lines.map((l) => vessel(l, { r0: r, r1: r * 0.8, sides: 8, n: l.length }, g)));
    const W = '#fbf6ea', WD = '#9a8c70';
    put('ac', 'aurreko-komisura', fib(AC_FIBRES, small, 0.024), W, WD, { groups: ['komisurak', 'gai-zuria'], tissue: 'nerve' });
    put('pc', 'atzeko-komisura', fib(PC_FIBRES, small, 0.022), W, WD, { groups: ['komisurak', 'gai-zuria'], tissue: 'nerve' });
    pts['aurreko-komisura'] = [0, -0.1, 0.5];
    pts['atzeko-komisura'] = [0, -0.13, -0.44];
    pts['komisurak'] = [0, -0.1, 0.5];
    // The corpus callosum grows from the front (genu) backwards (splenium): its fibres appear in that order.
    const shown = CC_FIBRES.map((l, i) => vessel(l, { r0: 0.04, r1: 0.03, sides: 8, n: l.length }, clamp01(cc * CC_FIBRES.length - i)));
    if (cc > 0.01) {
      put('cc', 'gorputz-kailukara', mergeParts(shown), W, WD, { groups: ['komisurak', 'gai-zuria'], tissue: 'nerve' });
      const at = CC_ARC[Math.min(CC_ARC.length - 1, Math.floor(cc * (CC_ARC.length - 1) * 0.5))];
      pts['gorputz-kailukara'] = [0, at[0], at[1]];
    }
  }

  // ———— the ventricles ————
  const vent = clamp01(pose.vent);
  if (vent > 0.01) {
    const casts = geoOf(VENTRICLES19_GEO);
    const VG = ['bentrikulu-sistema', 'likido-zefalorrakideoa'];
    const castItem = (k: string, id: string, extra: string[] = []) => half(`cast-${k}`, id, casts[k], C19.csf, C19.csfDeep, { groups: [...VG, ...extra], opacity: vent, tissue: 'membrane', calm: true });
    castItem('lat', 'alboko-bentrikuluak', ['monro-zuloak']);
    castItem('third', 'hirugarren-bentrikulua');
    castItem('aq', 'garun-akueduktoa');
    castItem('fourth', 'laugarren-bentrikulua', ['luschka-zuloak', 'magendie-zuloa']);
    castItem('canal', 'hodi-ependimarioa');
    pts['alboko-bentrikuluak'] = [-0.28, 0.54, 0.0];
    pts['monro-zuloak'] = [-0.12, 0.26, 0.35];
    pts['hirugarren-bentrikulua'] = [0, -0.06, 0.18];
    pts['garun-akueduktoa'] = [0, -0.42, -0.45];
    pts['laugarren-bentrikulua'] = [0, -0.84, -0.72];
    // Out along the lateral recess, towards its aperture (nearer the middle it shared the fourth ventricle's dot).
    pts['luschka-zuloak'] = [-0.3, -0.89, -0.67];
    pts['magendie-zuloa'] = [0, -1.04, -0.84];
    pts['hodi-ependimarioa'] = [0, -2.0, -0.73];
    pts['bentrikulu-sistema'] = [0, -0.06, 0.18];
    // The apertures: small glowing rings where the fluid leaves.
    const ring = (key: string, id: string, c: V3, r: number) => put(key, id, blobParts({ center: c, radii: [r, r, r], rings: 8, sides: 10 }), '#ffffff', C19.csfDeep, { opacity: 0.9 * vent, tissue: 'membrane' });
    ring('luschka', 'luschka-zuloak', [-0.34, -0.9, -0.66], 0.045);
    ring('magendie', 'magendie-zuloa', [0, -1.04, -0.84], 0.045);
    ring('monro', 'monro-zuloak', [-0.14, 0.26, 0.35], 0.04);
  }
  // ———— the choroid plexuses, in the roofs ————
  const plex = clamp01(pose.plex);
  if (plex > 0.01) {
    const tuft = (c: V3, n: number, r: number): (Parts | null)[] => Array.from({ length: n }, (_, i) => blobParts({ center: [c[0] + 0.02 * Math.sin(i * 2.1), c[1] + 0.03 * Math.cos(i * 1.7), c[2] + (i - n / 2) * r * 1.1], radii: [r, r * 0.8, r], rings: 6, sides: 8 }));
    const all = mergeParts([...tuft([-0.28, 0.46, -0.1], 7, 0.04), ...tuft([0, 0.22, -0.05], 5, 0.035), ...tuft([0, -0.98, -0.78], 4, 0.035)]);
    put('plex', 'sare-koroideak', all, '#e0607a', '#6e1a2c', { opacity: plex, tissue: 'vessel' });
    pts['sare-koroideak'] = [-0.28, 0.46, -0.1];
  }

  // ———— the meninges, the fluid, the skull ————
  const men = clamp01(pose.men), csf = clamp01(pose.csf);
  if (men > 0.01) {
    const shells = geoOf(MENINGES19_GEO);
    const MEN = ['meningeak'];
    put('pia', 'pia-materra', P(shells.pia), C19.pia, C19.piaDeep, { groups: MEN, opacity: 0.9 * men, tissue: 'membrane' });
    put('sub', 'eremu-azpiaraknoideoa', P(shells.sub), C19.csf, C19.csfDeep, { groups: ['likido-zefalorrakideoa'], opacity: 0.5 * csf * men, tissue: 'membrane', outline: false });
    put('arach', 'araknoidesa', P(shells.arach), C19.arach, C19.arachDeep, { groups: MEN, opacity: men, tissue: 'membrane' });
    put('dura', 'dura-materra', P(shells.dura), C19.dura, C19.duraDeep, { groups: MEN, opacity: men, tissue: 'membrane' });
    put('skull', 'neurokraneoa', P(shells.skull), G19.bone, G19.boneDeep, { opacity: men, tissue: 'bone', calm: true });
    put('scalp', undefined, P(shells.scalp), C19.skin, mixHex(C19.skin, '#5a3a2a', 0.5), { opacity: men, tissue: 'skin', ground: true, quiet: true, calm: true });
    Object.assign(pts, meningealPoints);
    pts['likido-zefalorrakideoa'] = meningealPoints['eremu-azpiaraknoideoa'];
    pts['meningeak'] = meningealPoints.araknoidesa;
  }

  // ———— the fluid's way ————
  const fs = clamp01(pose.flowShow);
  if (fs > 0.01) {
    const drop = cachedBlob({ center: [0, 0, 0], radii: [0.035, 0.035, 0.035], rings: 6, sides: 8 });
    for (const { key, route, rate } of FLOWS)
      items.push({ key: `flow-${key}`, id: 'likido-zefalorrakideoa', mesh: drop, color: '#bfe8ff', deep: C19.csfDeep, tissue: 'skin', stream: { route, phase: pose.flow * rate, grow: fs, ...DROPS } });
  }

  // ———— the cranial pairs, the right side and (whole brain) the left ————
  const nerves = Math.max(0, Math.min(12, pose.nerves));
  if (nerves > 0.001) {
    const NV = C19.nerve, ND = C19.nerveDeep;
    for (const c of CRANIAL) {
      const g = clamp01(nerves - (c.n - 1));
      if (g <= 0.001) continue;
      const pieces: (Parts | null)[] = [vessel(c.line, { r0: c.r, r1: c.r * 0.85, sides: 10, n: c.line.length }, g)];
      if (c.n === 1) pieces.push(blobParts({ center: OLF_BULB, radii: [0.045, 0.035, 0.11 * g + 0.01], rings: 10, sides: 12 }));
      if (c.n === 2) pieces.push(blobParts({ center: CHIASM, radii: [0.04 * g + 0.005, 0.022, 0.04], rings: 8, sides: 10 }));
      if (c.n === 5 && g > 0.5) {
        const b = ss(0.5, 1, g);
        pieces.push(blobParts({ center: TRIG_GANGLION, radii: [0.04 * b, 0.05 * b, 0.07 * b], rings: 8, sides: 10 }));
        for (const br of TRIG_BRANCHES) pieces.push(vessel(br, { r0: 0.022, r1: 0.016, sides: 8, n: br.length }, b));
      }
      const parts = mergeParts(pieces);
      if (!parts) continue;
      put(`cn-${c.n}`, c.id, parts, NV, ND, { groups: ['bikote-kranealak'], tissue: 'nerve' });
      if (whole > 0.01) put(`cn-${c.n}-L`, c.id, { mesh: mirror(parts.mesh), hit: mirror(parts.hit) }, NV, ND, { groups: ['bikote-kranealak'], tissue: 'nerve', opacity: whole });
      if (g > 0.3) {
        pts[c.id] = CN_PT[c.id];
        pts[`${c.id}:below`] = CN_BELOW[c.id] ?? CN_PT[c.id];
      }
    }
    pts['bikote-kranealak'] = CN_PT['nerbio-trigeminoa'];
  }

  // ———— the hypophysis: the infundibulum down from the hypothalamus, the pouch up from the stomodeum's roof ————
  const hyp = clamp01(pose.hyp);
  if (hyp > 0.001) {
    const inf = ss(0, 0.45, hyp), pouch = ss(0.05, 0.5, hyp), detach = ss(0.5, 0.75, hyp), mature = ss(0.72, 1, hyp);
    const lobes = clamp01(pose.lobes);
    const neuroC = mixHex(mixHex(B, '#d6a092', 0.4), C19.dien, 0.6 * lobes), adenoC = mixHex('#eab08e', '#e07a4e', 0.6 * lobes);
    // The stomodeum's roof stays while the pouch is said to come away from it (step 3), and goes as the lobes mature.
    const oral = 1 - ss(0.78, 0.97, hyp);
    if (oral > 0.01) {
      put('oral', 'estomodeoa', blobParts({ center: ORAL, radii: [0.24, 0.025, 0.42], rings: 10, sides: 16 }), C19.ecto, '#2a4a8a', { opacity: oral, tissue: 'skin' });
      pts['estomodeoa'] = [0, -1.0, 0.62];
    }
    const neuroR = 0.015 + 0.05 * ss(0.3, 1, hyp);
    put('infund', 'hipofisi-infundibulua', vessel(INFUND, { r0: 0.035, r1: 0.03, sides: 10, n: INFUND.length }, inf), neuroC, BD, { groups: ['hipofisia', 'neurohipofisia'] });
    if (inf > 0.6) put('neuro', 'neurohipofisia', blobParts({ center: NEURO, radii: [neuroR, neuroR * 1.1, neuroR], rings: 10, sides: 12 }), neuroC, BD, { groups: ['hipofisia'] });
    const adenoR = 0.02 + 0.06 * ss(0.3, 1, hyp);
    if (pouch > 0.01) {
      // The pouch: a tube up from the oral roof, its top a cup that becomes the adenohypophysis; its stalk thins and goes.
      const stalk = vessel(POUCH, { r0: lerpN(0.04, 0.004, detach), r1: lerpN(0.045, 0.006, detach), sides: 10, n: POUCH.length }, pouch);
      if (detach < 0.98) put('pouch', 'rathke-poltsa', stalk, adenoC, '#7a3a1e', { opacity: 1 - detach, groups: ['adenohipofisia'] });
      if (pouch > 0.6) put('adeno', mature > 0.3 ? 'adenohipofisia' : 'rathke-poltsa', blobParts({ center: ADENO, radii: [adenoR * 1.1, adenoR, adenoR * 1.05], rings: 10, sides: 12 }), adenoC, '#7a3a1e', { groups: ['hipofisia', 'adenohipofisia', 'rathke-poltsa'] });
      pts['rathke-poltsa'] = detach < 0.5 ? [0, -0.84, 0.39] : ADENO;
    }
    pts['hipofisi-infundibulua'] = [0, -0.53, 0.29];
    if (inf > 0.6) pts['neurohipofisia'] = NEURO;
    if (pouch > 0.6) pts['adenohipofisia'] = ADENO;
    pts['hipofisia'] = [0, -0.68, 0.31];
    const horm = clamp01(pose.horm);
    if (horm > 0.01) {
      const drop = cachedBlob({ center: [0, 0, 0], radii: [0.016, 0.016, 0.016], rings: 5, sides: 8 });
      items.push({ key: 'horm-n', id: 'neurohipofisia', mesh: drop, color: '#f6d365', deep: '#6a5410', tissue: 'skin', stream: { route: HORM_DOWN.route, phase: pose.flow * HORM_DOWN.rate, grow: horm, ...HDROPS } });
      items.push({ key: 'horm-a', id: 'adenohipofisia', mesh: drop, color: '#9be08a', deep: '#245a1a', tissue: 'skin', stream: { route: HORM_ADENO.route, phase: pose.flow * HORM_ADENO.rate, grow: horm, ...HDROPS } });
    }
  }

  // ———— the pineal gland, in the epithalamus ————
  const pin = clamp01(pose.pineal);
  if (pin > 0.01) {
    const kk = 0.4 + 0.6 * pin;
    put('pineal', 'guruin-pineala', blobParts({ center: PINEAL, radii: [0.04 * kk, 0.045 * kk, 0.06 * kk], rings: 10, sides: 12 }), '#d98fb0', '#6a2848', { groups: ['epitalamoa'] });
    pts['guruin-pineala'] = [0, 0.1, -0.62];
  }

  // ———— signals ————
  const sig = (key: string, id: string, line: V3[], g: number, color: string, deep: string) => {
    if (g <= 0.001) return;
    put(key, id, vessel(line, { r0: 0.03, r1: 0.03, bulb: 0.9, bulbLen: 0.08, sides: 10, n: line.length }, g), color, deep, { tissue: 'nerve' });
  };
  const sens = clamp01(pose.sens);
  sig('sens-up', 'neurona-sentsitiboa', SENS_UP, Math.min(1, sens * 2), C19.sens, C19.sensDeep);
  sig('sens-cx', 'neurona-sentsitiboa', SENS_CX_PATH, clamp01(sens * 2 - 1), C19.sens, C19.sensDeep);
  sig('motor', 'motoneurona', MOTOR_DOWN, clamp01(pose.motor), C19.motor, C19.motorDeep);
  sig('smell', 'usaimen-nerbioa', SMELL, clamp01(pose.smell), '#b48cf0', '#4a2f80');
  if (sens > 0.001 || pose.motor > 0.001) {
    put('cx-s', 'kortex-sentsitiboa', blobParts({ center: SENS_CX, radii: [0.06, 0.08, 0.14], rings: 10, sides: 12 }), C19.sens, C19.sensDeep, { opacity: clamp01(sens * 2 - 1) });
    put('cx-m', 'kortex-motorra', blobParts({ center: MOTOR_CX, radii: [0.06, 0.08, 0.14], rings: 10, sides: 12 }), C19.motor, C19.motorDeep, { opacity: Math.max(clamp01(pose.motor * 3), clamp01(sens * 2 - 1.4)) });
    pts['kortex-sentsitiboa'] = [0, SENS_CX[1], SENS_CX[2]];
    pts['kortex-motorra'] = [0, MOTOR_CX[1], MOTOR_CX[2]];
    pts['neurona-sentsitiboa'] = [0, -1.3, -0.62];
    pts['motoneurona'] = [0, -1.9, -0.7];
  }
  if (pose.smell > 0.001) pts['usaimen-nerbioa'] = [0, -0.38, 0.72];
  return { items, pts };
}
void G19;
