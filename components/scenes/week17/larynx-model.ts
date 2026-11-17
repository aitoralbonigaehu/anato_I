import { add, cross, mix3, mul, norm, sub, type V3 } from '@/lib/three-d/math';
import { curve3, grid, type Mesh } from '@/lib/three-d/mesh';
import { cachedMesh } from '@/lib/three-d/mesh-cache';
import { vessel, type Parts, type VesselOptions } from '@/lib/three-d/organic';
import { capsule, deformBy, ellipsoid, mirrorX, smin, surfaceMesh, type SDF } from '@/lib/three-d/sdf';
import type { Item3 } from '@/lib/three-d/scene';
import { mixHex, tubeParts } from '@/components/scenes/week10/model3d';
import { ARCH, ARCH_DEEP, TISSUE } from './common';

/**
 * Topic 17, 2.6.2 and 2.6.3: one larynx, in the arches' colours (IV red, VI green), sculpted as the laryngeal
 * skeleton of an atlas. The thyroid is a shield of two laminae meeting in front (notch above, horns behind; upper
 * part IV, lower part VI); the cricoid is a signet ring, low in front and a tall plate behind; the arytenoids are
 * pyramids standing on that plate, the corniculates on their tips, the cuneiforms in the fold that runs up to the
 * leaf of the epiglottis. Below, the trachea (hollow, C-shaped rings open behind); behind, the pharynx running on
 * into the oesophagus, with the three constrictors as sheets of fibres wrapped round it (III yellow, IV red), the
 * intrinsic muscles (VI green) and the vagus's two branches.
 *
 * Axes: x towards the LEFT, y cranial, z ventral.
 */

export interface LarynxPose {
  /** The small paired cartilages grown (0..1). */
  ary: number;
  corn: number;
  /** Thyroid's upper and lower parts drawn apart: the division (0..1). */
  split: number;
  /** Pharynx grown (0..1). */
  pharynx: number;
  /** Constrictors grown along their fibres (0..1). */
  mid: number;
  sup: number;
  /** Pharynx away and the right constrictors drawn back, to see inside (0..1). */
  open: number;
  /** Intrinsic muscles grown (0..1). */
  intr: number;
  /** Vagus and its branches grown (0..1). */
  nerve: number;
}

export const LX0: LarynxPose = { ary: 0, corn: 0, split: 0, pharynx: 0, mid: 0, sup: 0, open: 0, intr: 0, nerve: 0 };

export interface LarynxOpts {
  dim?: { ids: readonly string[]; k: number } | null;
}

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ss = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const smax = (a: number, b: number, k: number) => -smin(-a, -b, k);
const L = (kps: readonly V3[], n = 24) => curve3(kps as V3[], n);
const X = (s: number, p: V3): V3 => [s * p[0], p[1], p[2]];
const at = (line: readonly V3[], f: number): V3 => {
  const g = clamp01(f) * (line.length - 1);
  const i = Math.min(line.length - 2, Math.floor(g));
  return mix3(line[i], line[i + 1], g - i);
};

/** A sculpted part: the surface of `f` inside a box, with a coarse copy for pointing. */
const sculpt = (kind: string, f: SDF, lo: V3, hi: V3, step: number, hitStep = step * 2.5): Parts => ({
  mesh: cachedMesh(`lx17-${kind}`, [step], () => surfaceMesh(f, lo, hi, step)),
  hit: cachedMesh(`lx17-${kind}-h`, [hitStep], () => surfaceMesh(f, lo, hi, hitStep)),
});
/** The other side's copy of a paired part. */
const mirrored = (kind: string, p: Parts, deps: readonly number[] = [0]): Parts => ({
  mesh: cachedMesh(`lx17-${kind}-R`, deps, () => mirrorX(p.mesh)),
  hit: cachedMesh(`lx17-${kind}-Rh`, deps, () => mirrorX(p.hit ?? p.mesh)),
});
/** A sculpted part grown from `c` (0..1) and carried by `d`. */
const grown = (p: Parts, c: V3, k: number, d: V3, slot: string): Parts => {
  if (k > 0.999 && Math.abs(d[0]) + Math.abs(d[1]) + Math.abs(d[2]) < 1e-4) return p;
  const f = (q: V3): V3 => [c[0] + (q[0] - c[0]) * k + d[0], c[1] + (q[1] - c[1]) * k + d[1], c[2] + (q[2] - c[2]) * k + d[2]];
  return { mesh: deformBy(p.mesh, [k, ...d], f, slot), hit: deformBy(p.hit ?? p.mesh, [k, ...d], f, slot + 'h') };
};

// ———————————————————————— the thyroid: a shield ————————————————————————

/** The left lamina's mid-line seen from above (x, z), from the angle in front to its free border behind. */
const TH_LINE = L([[0, 0, 1.05], [0.3, 0, 0.82], [0.62, 0, 0.5], [0.9, 0, 0.14], [1.1, 0, -0.22], [1.2, 0, -0.5]], 17);
const TH_N = TH_LINE.length;
const THX = Float64Array.from(TH_LINE, (p) => p[0]);
const THZ = Float64Array.from(TH_LINE, (p) => p[2]);
const THS = new Float64Array(TH_N);
for (let i = 1; i < TH_N; i++) THS[i] = THS[i - 1] + Math.hypot(THX[i] - THX[i - 1], THZ[i] - THZ[i - 1]);
const TH_T = THS[TH_N - 1];
const TH_HALF = 0.085;
/** Where the upper (IV) and lower (VI) parts meet. */
const TH_CUT = 0.42;

let nearD = 0;
let nearT = 0;
/** Nearest point of the lamina's mid-line to (ax, z), ax ≥ 0: leaves the distance in `nearD`, the arc in `nearT`. */
function thNear(ax: number, z: number) {
  let best = Infinity;
  let bt = 0;
  for (let i = 0; i + 1 < TH_N; i++) {
    const ex = THX[i + 1] - THX[i];
    const ez = THZ[i + 1] - THZ[i];
    const wx = ax - THX[i];
    const wz = z - THZ[i];
    const l2 = ex * ex + ez * ez;
    const h = Math.max(0, Math.min(1, (wx * ex + wz * ez) / l2));
    const dx = wx - ex * h;
    const dz = wz - ez * h;
    const d2 = dx * dx + dz * dz;
    if (d2 < best) {
      best = d2;
      bt = THS[i] + Math.sqrt(l2) * h;
    }
  }
  nearD = Math.sqrt(best);
  nearT = bt;
}
/** A point of a lamina: side `s`, arc `t` back from the angle, height `y`, `out` off its mid-surface (outwards +). */
function thyAt(s: number, t: number, y: number, out = 0): V3 {
  const tt = Math.max(0, Math.min(TH_T, t));
  let i = 0;
  while (i + 2 < TH_N && THS[i + 1] < tt) i++;
  const seg = THS[i + 1] - THS[i] || 1;
  const h = (tt - THS[i]) / seg;
  const tx = (THX[i + 1] - THX[i]) / seg;
  const tz = (THZ[i + 1] - THZ[i]) / seg;
  return [s * (THX[i] + (THX[i + 1] - THX[i]) * h - tz * out), y, THZ[i] + (THZ[i + 1] - THZ[i]) * h + tx * out];
}

const thyroidF: SDF = (() => {
  const back = TH_T - 0.07;
  // Superior horns up towards the hyoid's greater horns, inferior horns down and in to the cricoid's sides.
  const hs0 = thyAt(1, back, 1.48);
  const hs1: V3 = [1.25, 2.02, -0.63];
  const hs2: V3 = [1.27, 2.44, -0.72];
  const hi0 = thyAt(1, back, -0.28);
  const hi1: V3 = [1.1, -0.78, -0.56];
  const hi2: V3 = [0.98, -1.1, -0.57];
  const sup = [capsule(hs0, hs1, 0.105, 0.085), capsule(hs1, hs2, 0.085, 0.07)];
  const inf = [capsule(hi0, hi1, 0.105, 0.09), capsule(hi1, hi2, 0.09, 0.08)];
  // The oblique line: a low ridge on the outer face, from the upper tubercle down and forwards to the lower one.
  const o0 = thyAt(1, TH_T * 0.8, 1.2, TH_HALF);
  const o1 = thyAt(1, TH_T * 0.52, -0.36, TH_HALF);
  const oblique = capsule(o0, o1, 0.055, 0.05);
  const prominence = ellipsoid([0, 0.56, 1.03], [0.15, 0.36, 0.1]);
  return (x, y, z) => {
    const ax = Math.abs(x);
    thNear(ax, z);
    const q = nearT / TH_T;
    // The upper border dips into the notch at the midline; the lower border is nearly level.
    const top = 1.48 + 0.16 * q - 0.6 * Math.exp(-((nearT / 0.34) ** 2));
    const bot = -0.55 + 0.13 * q;
    let d = smax(nearD - TH_HALF, smax(bot - y, y - top, 0.1), 0.07);
    d = smin(d, prominence(ax, y, z), 0.12);
    d = smin(d, oblique(ax, y, z), 0.07);
    d = smin(d, smin(sup[0](ax, y, z), sup[1](ax, y, z), 0.05), 0.1);
    d = smin(d, smin(inf[0](ax, y, z), inf[1](ax, y, z), 0.05), 0.1);
    return d;
  };
})();
const THY_UP = () => sculpt('thy-up', (x, y, z) => Math.max(thyroidF(x, y, z), TH_CUT - y), [-1.48, TH_CUT - 0.08, -0.98], [1.48, 2.66, 1.3], 0.036);
const THY_LO = () => sculpt('thy-lo', (x, y, z) => Math.max(thyroidF(x, y, z), y - TH_CUT), [-1.48, -1.34, -0.98], [1.48, TH_CUT + 0.08, 1.3], 0.036);

// ———————————————————————— the cricoid: a signet ring ————————————————————————

/** The airway's centre (z) and the ring's two half-axes. */
const CR_C = -0.12;
const CR_RX = 0.95;
const CR_RZ = 0.9;
const CR_TOP = -0.5;
const cricoidF: SDF = (() => {
  // The plate's median ridge behind, between the two hollows of the muscles.
  const ridge = capsule([0, -0.74, CR_C - CR_RZ - 0.13], [0, -1.62, CR_C - CR_RZ - 0.13], 0.045, 0.06);
  return (x, y, z) => {
    const dz = z - CR_C;
    const k = Math.hypot(x / CR_RX, dz / CR_RZ);
    // 0 in front … 1 behind: the arch is low, the plate tall.
    const a = Math.atan2(Math.abs(x), dz) / Math.PI;
    const back = ss(0.42, 0.8, a);
    const radial = Math.abs(k - 1) * 0.92 - (0.115 + 0.03 * back);
    const top = -1.32 + (CR_TOP + 1.32) * back;
    const d = smax(radial, smax(-1.8 - y, y - top, 0.12), 0.08);
    return smin(d, ridge(x, y, z), 0.09);
  };
})();
const CRICOID = () => sculpt('cricoid', cricoidF, [-1.28, -1.96, -1.38], [1.28, -0.34, 1.0], 0.034);
/** The plate's back surface at `x`. */
const plateBack = (x: number) => CR_C - CR_RZ * Math.sqrt(Math.max(0, 1 - (x / CR_RX) ** 2)) - 0.15;

// ———————————————————————— the small paired cartilages ————————————————————————

/** Left arytenoid: base on the plate, apex, vocal process (forwards), muscular process (out and back). */
const AR_BASE: V3 = [0.36, -0.44, -0.98];
const AR_APEX: V3 = [0.3, 0.22, -1.08];
const AR_VOCAL: V3 = [0.2, -0.38, -0.5];
const AR_MUSC: V3 = [0.68, -0.42, -1.1];
const arytenoidF: SDF = (() => {
  const body = capsule(AR_BASE, AR_APEX, 0.21, 0.07);
  const vocal = capsule([AR_BASE[0] - 0.04, AR_BASE[1], AR_BASE[2] + 0.1], AR_VOCAL, 0.12, 0.045);
  const musc = capsule(AR_BASE, AR_MUSC, 0.13, 0.095);
  // The hollow of the antero-lateral face: the pyramid's edges read.
  const pit = ellipsoid([0.56, -0.12, -0.86], [0.16, 0.26, 0.14]);
  return (x, y, z) => {
    let d = smin(body(x, y, z), vocal(x, y, z), 0.1);
    d = smin(d, musc(x, y, z), 0.1);
    d = smax(d, -pit(x, y, z), 0.06);
    return smax(d, CR_TOP - y, 0.03);
  };
})();
const ARYTENOID = () => sculpt('arytenoid', arytenoidF, [0.0, -0.62, -1.42], [0.96, 0.42, -0.34], 0.024);
const CORN_TIP: V3 = [0.23, 0.52, -1.2];
const corniculateF: SDF = (() => {
  const horn = capsule([AR_APEX[0], AR_APEX[1] + 0.02, AR_APEX[2]], CORN_TIP, 0.09, 0.04);
  return (x, y, z) => horn(x, y, z);
})();
const CORNICULATE = () => sculpt('corniculate', corniculateF, [0.04, 0.06, -1.4], [0.52, 0.68, -0.9], 0.018);
const CUN_A: V3 = [0.64, 0.56, -0.88];
const CUN_B: V3 = [0.7, 0.98, -0.72];
const cuneiformF: SDF = capsule(CUN_A, CUN_B, 0.055, 0.095);
const CUNEIFORM = () => sculpt('cuneiform', cuneiformF, [0.44, 0.4, -1.08], [0.92, 1.2, -0.5], 0.018);

// ———————————————————————— the epiglottis: a leaf on a stalk ————————————————————————

const EP_Y0 = 0.98;
const EP_Y1 = 3.2;
const EP_W = 0.66;
/** The leaf's mid-surface: it leans back as it rises, its tip curls forwards; its edges curl back. */
const epZ = (t: number) => 0.32 - 0.62 * t ** 1.3 + 0.2 * ss(0.78, 1, t);
const epW = (t: number) => (t < 0.6 ? EP_W * (0.14 + 0.86 * ss(0, 0.6, t)) : EP_W * Math.sqrt(Math.max(0, 1 - ((t - 0.6) / 0.4) ** 2)));
const EP_CURL = 0.34;
const epiglottisF: SDF = (() => {
  // The stalk: the foot of the "L", forwards and down to the inside of the thyroid's angle, under the notch.
  const s1 = capsule([0, 1.06, 0.3], [0, 0.84, 0.6], 0.1, 0.09);
  const s2 = capsule([0, 0.84, 0.6], [0, 0.68, 0.9], 0.09, 0.07);
  return (x, y, z) => {
    const t = clamp01((y - EP_Y0) / (EP_Y1 - EP_Y0));
    const w = Math.abs(z - (epZ(t) - EP_CURL * x * x)) - (0.05 + 0.035 * (1 - t));
    let leaf = smax(w, Math.abs(x) - epW(t), 0.05);
    leaf = smax(leaf, smax(EP_Y0 - y, y - EP_Y1, 0.05), 0.05);
    return smin(leaf, smin(s1(x, y, z), s2(x, y, z), 0.05), 0.09);
  };
})();
const EPIGLOTTIS = () => sculpt('epiglottis', epiglottisF, [-0.82, 0.5, -0.6], [0.82, 3.36, 1.1], 0.03);

// ———————————————————————— the hyoid above ————————————————————————

const hyoidF: SDF = (() => {
  const body = ellipsoid([0, 2.72, 1.03], [0.56, 0.19, 0.13]);
  const g1 = capsule([0.5, 2.72, 0.98], [1.12, 2.74, 0.4], 0.13, 0.11);
  const g2 = capsule([1.12, 2.74, 0.4], [1.32, 2.8, -0.6], 0.11, 0.075);
  const tip = ellipsoid([1.33, 2.81, -0.66], [0.1, 0.1, 0.12]);
  const lesser = capsule([0.6, 2.82, 0.88], [0.68, 3.0, 0.76], 0.06, 0.035);
  return (x, y, z) => {
    const ax = Math.abs(x);
    let d = smin(body(ax, y, z), g1(ax, y, z), 0.12);
    d = smin(d, g2(ax, y, z), 0.06);
    d = smin(d, tip(ax, y, z), 0.05);
    return smin(d, lesser(ax, y, z), 0.05);
  };
})();
const HYOID = () => sculpt('hyoid2', hyoidF, [-1.56, 2.38, -0.92], [1.56, 3.3, 1.3], 0.034);

// ———————————————————————— the trachea below, the pharynx behind ————————————————————————

const TR_R = 0.8;
const TR_TOP = -1.72;
const TR_END = -4.7;
/** The trachea's outline from above: round in front, flat behind (the membranous wall). */
const trOuter = (x: number, z: number) => smax(Math.hypot(x, z - CR_C) - TR_R, -(z - CR_C + 0.62 * TR_R), 0.12);
const tracheaF: SDF = (x, y, z) => {
  const o = trOuter(x, z);
  return smax(smax(o, -(o + 0.11), 0.02), smax(TR_END - y, y - TR_TOP, 0.03), 0.03);
};
const RING_Y0 = -2.12;
const RING_DY = 0.4;
const RING_N = 7;
/** The C-shaped rings: bands round the wall, open behind. */
const ringsF: SDF = (x, y, z) => {
  const k = Math.max(0, Math.min(RING_N - 1, Math.round((RING_Y0 - y) / RING_DY)));
  const q1 = Math.abs(y - (RING_Y0 - k * RING_DY)) - 0.095;
  const q2 = Math.abs(trOuter(x, z)) - 0.05;
  const d = Math.hypot(Math.max(q1, 0), Math.max(q2, 0)) + Math.min(Math.max(q1, q2), 0) - 0.035;
  return smax(d, -(z - CR_C + 0.5 * TR_R), 0.06);
};
const TRACHEA = () => sculpt('trachea', tracheaF, [-0.98, TR_END - 0.12, -0.82], [0.98, TR_TOP + 0.12, 0.84], 0.04, 0.09);
const RINGS = () => sculpt('rings', ringsF, [-1.02, TR_END - 0.1, -0.7], [1.02, RING_Y0 + 0.28, 0.9], 0.034, 0.08);

/** The pharynx's cross-section at height y: wide and flat behind the larynx, the narrow oesophagus below. */
const phAt = (y: number) => {
  const w = ss(-2.5, -0.9, y);
  return { cz: lerp(-1.3, -1.95, w), rx: lerp(0.56, 1.22, w), rz: lerp(0.44, 0.64, w) };
};
const PH_TOP = 5.3;
const pharynxF: SDF = (x, y, z) => {
  const { cz, rx, rz } = phAt(y);
  const d = (Math.hypot(x / rx, (z - cz) / rz) - 1) * rz;
  return smax(d, smax(TR_END - y, y - PH_TOP, 0.04), 0.06);
};
const PHARYNX = () => sculpt('pharynx', pharynxF, [-1.36, TR_END - 0.14, -2.74], [1.36, PH_TOP + 0.14, -0.68], 0.06);

// ———————————————————————— sheets of muscle fibres ————————————————————————

type Keys = readonly [V3, V3, V3, V3];
/** One fibre of a sheet: `f` runs across the fan (0 lowest … 1 highest), the four keys along the fibre. */
type Fibre = (f: number) => Keys;

/** A point `u` (0..1) along a fibre: a smooth curve through its four keys. */
function along(k: Keys, u: number): V3 {
  const g = clamp01(u) * 3;
  const i = Math.min(2, Math.floor(g));
  const t = g - i;
  const p0 = k[Math.max(0, i - 1)];
  const p1 = k[i];
  const p2 = k[i + 1];
  const p3 = k[Math.min(3, i + 2)];
  const t2 = t * t;
  const t3 = t2 * t;
  const c = (j: number) => 0.5 * (2 * p1[j] + (p2[j] - p0[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (3 * p1[j] - p0[j] - 3 * p2[j] + p3[j]) * t3);
  return [c(0), c(1), c(2)];
}

interface SheetOptions {
  /** Half thickness in the middle of the fan. */
  th: number;
  /** How far along its fibres the sheet has grown (0..1). */
  g?: number;
  /** Fascicles across the fan (ridges on the outer face). */
  ridges?: number;
  nu?: number;
  nv?: number;
}
/**
 * A sheet of muscle as one closed body: fibres `fibre(f)` side by side, a lens in section (thin at the fan's two
 * borders), pinched shut at both ends, fascicles as low ridges on its outer face. It grows along its fibres.
 */
function sheet(fibre: Fibre, o: SheetOptions): Mesh {
  const g = clamp01(o.g ?? 1);
  const mid = (u: number, f: number) => along(fibre(clamp01(f)), clamp01(u) * g);
  const e = 0.02;
  return grid(o.nu ?? 24, o.nv ?? 96, (u, v) => {
    const a = v * Math.PI * 2;
    const f = 0.5 - 0.5 * Math.cos(a);
    const side = Math.sin(a);
    const p = mid(u, f);
    const n = norm(cross(sub(mid(u + e, f), mid(u - e, f)), sub(mid(u, f + e), mid(u, f - e))));
    const taper = Math.sin(Math.PI * clamp01(u)) ** 0.4;
    const rid = side > 0 && o.ridges ? 0.72 + 0.5 * Math.abs(Math.cos(Math.PI * o.ridges * f)) ** 0.6 : 1;
    return add(p, mul(n, o.th * side * taper * rid));
  });
}
const sheetParts = (kind: string, deps: readonly number[], fibre: Fibre, o: SheetOptions): Parts => ({
  mesh: cachedMesh(`lx17-${kind}`, deps, () => sheet(fibre, o)),
  hit: cachedMesh(`lx17-${kind}-h`, deps, () => sheet(fibre, { ...o, nu: 8, nv: 12, ridges: 0 })),
});

/** A constrictor's fibre: from its origin at the larynx's side, round the pharynx, to the seam behind (`out`: how far outside). */
const round = (from: (f: number) => V3, seam: (f: number) => number, out: number): Fibre => (f) => {
  const a = from(f);
  const yb = seam(f);
  const p1 = phAt(lerp(a[1], yb, 0.35));
  const p2 = phAt(lerp(a[1], yb, 0.75));
  const p3 = phAt(yb);
  return [a, [p1.rx + 0.07 + out, lerp(a[1], yb, 0.35), p1.cz + 0.12], [p2.rx * 0.8 + out, lerp(a[1], yb, 0.75), p2.cz - p2.rz * 0.82 - out], [0, yb, p3.cz - p3.rz - 0.07 - out]];
};

/** The cricoid, the left arytenoid and the whole thyroid, in this model's frame, for another model to place (1.2: the origins). */
export const larynxOrigins = () => ({
  cricoid: CRICOID(),
  arytenoid: ARYTENOID(),
  thyroid: sculpt('thy-whole', thyroidF, [-1.48, -1.34, -0.98], [1.48, 2.66, 1.3], 0.05, 0.1),
});

/**
 * The laryngeal skeleton and the airway, for topic 18's grown neck (neck-model.ts: the thyroid gland hugs these
 * cartilages). The distance functions let that gland be carved round them; `dims` are this model's measures.
 */
export const larynxSkeleton = () => ({
  hyoid: HYOID(),
  thyroid: larynxOrigins().thyroid,
  cricoid: CRICOID(),
  trachea: TRACHEA(),
  rings: RINGS(),
});
export const LARYNX_SDF = { thyroid: thyroidF, cricoid: cricoidF, airway: (x: number, z: number) => trOuter(x, z) };
export const LARYNX_DIM = { CR_C, CR_RX, CR_RZ, TR_R, TR_TOP, TR_END, RING_Y0, RING_DY };

/** Parts in neutral tones already: they never step back. */
const NEUTRAL = new Set(['trakea', 'faringea', 'hioide-hezurra']);

export function larynxModel(pose: LarynxPose, o: LarynxOpts = {}) {
  const items: Item3[] = [];
  const pts: Record<string, V3> = {};
  const dim = o.dim && o.dim.k > 0.001 ? o.dim : null;
  const k = dim ? dim.k : 0;
  const lit = (id: string, groups?: readonly string[]) => !!dim && (dim.ids.includes(id) || (groups ?? []).some((g) => dim.ids.includes(g)));
  const put = (key: string, id: string | undefined, parts: Parts | null, color: string, deep: string, extra: Partial<Item3> = {}) => {
    if (!parts || (extra.opacity ?? 1) <= 0.01) return;
    // An unlit part steps back by losing a little colour (the kit's `calm`), never by going dark: the larynx stays one solid thing.
    // An arch-coloured part that a step does not light also gives up some of its colour here, so the lit ones lead.
    const off = !!dim && !!id && !NEUTRAL.has(id) && !lit(id, extra.groups);
    items.push({ key, id, ...parts, color: off ? mixHex(color, '#938c8e', 0.36 * k) : color, deep: off ? mixHex(deep, '#4d4648', 0.36 * k) : deep, tissue: 'cartilage', calm: true, ...extra });
  };
  const vess = (key: string, id: string | undefined, line: V3[], color: string, deep: string, prof: VesselOptions, g = 1, extra: Partial<Item3> = {}) => {
    if (g <= 0.01) return;
    put(key, id, vessel(line, { ref: [0, 0, 1], sides: 12, ...prof }, g), color, deep, extra);
  };
  /** A spindle of muscle along a line, grown from its start. */
  const spindle = (key: string, id: string, keys: V3[], r: number, color: string, deep: string, g: number) => {
    if (g <= 0.01) return;
    const whole = L(keys, 22);
    const shown = whole.slice(0, Math.max(3, Math.round(whole.length * clamp01(g))));
    const part = shown.length / whole.length;
    put(key, id, tubeParts(shown, { radius: (u) => 0.03 + r * Math.sin(Math.PI * Math.min(1, u * part)) ** 0.7, ref: [0, 0, 1], sides: 12, capStart: true, capEnd: true }), color, deep, { tissue: 'muscle' });
  };

  const split = clamp01(pose.split);
  const open = clamp01(pose.open);
  const thyGroup = ['tiroide-kartilagoa'];
  const thyLit = !dim || lit('tiroide-goiko-atala', thyGroup) || lit('tiroide-beheko-atala', thyGroup);
  // The shield turns to glass while a step looks at what lies inside it; the hyoid too, while the epiglottis is the subject.
  const inside = !!dim && !lit('bagoa') && ['epiglotisa', 'aritenoide-kartilagoa', 'kartilago-kornikulatua', 'kartilago-kuneiformea', 'laringe-barneko-muskuluak'].some((id) => lit(id));
  const glass = thyLit || !inside ? 1 : 1 - 0.56 * k;
  const frost = (c: string) => (thyLit || !inside ? c : mixHex(c, '#f6e9e4', 0.42 * k));
  const hyGlass = !!dim && lit('epiglotisa') && !thyLit ? 1 - 0.6 * k : 1;

  // ———— the hyoid above (context: II and III) ————
  put('hyoid', 'hioide-hezurra', HYOID(), TISSUE.bone, TISSUE.boneDeep, { tissue: 'bone', opacity: hyGlass });
  pts['hioide-hezurra'] = [0.45, 2.74, 1.1];

  // ———— the thyroid: one shield, its upper part (IV) and its lower part (VI) ————
  const up = 0.3 * split;
  const dn = -0.3 * split;
  put('thy-up', 'tiroide-goiko-atala', grown(THY_UP(), [0, 0, 0], 1, [0, up, 0], 'up'), frost(ARCH.iv), frost(ARCH_DEEP.iv), { groups: thyGroup, opacity: glass });
  put('thy-lo', 'tiroide-beheko-atala', grown(THY_LO(), [0, 0, 0], 1, [0, dn, 0], 'lo'), frost(ARCH.vi), frost(ARCH_DEEP.vi), { groups: thyGroup, opacity: glass });
  pts['tiroide-kartilagoa'] = thyAt(1, TH_T * 0.4, 0.42, TH_HALF * 0.6);
  pts['tiroide-goiko-atala'] = thyAt(1, TH_T * 0.45, 1.02 + up, TH_HALF * 0.6);
  pts['tiroide-beheko-atala'] = thyAt(1, TH_T * 0.45, -0.08 + dn, TH_HALF * 0.6);

  // ———— the cricoid: a signet ring, the plate behind ————
  put('cricoid', 'krikoide-kartilagoa', CRICOID(), ARCH.vi, ARCH_DEEP.vi);
  pts['krikoide-kartilagoa'] = [CR_RX + 0.1, -1.54, CR_C - 0.02];

  // ———— the epiglottis: a leaf on a stalk to the thyroid's angle (an L from the side) ————
  put('epiglottis', 'epiglotisa', EPIGLOTTIS(), ARCH.iv, ARCH_DEEP.iv);
  pts['epiglotisa'] = [0.2, 2.6, epZ((2.6 - EP_Y0) / (EP_Y1 - EP_Y0)) - EP_CURL * 0.04];

  // ———— the paired small cartilages: pyramids on the plate, horns on their tips, rods in the fold ————
  const ary = clamp01(pose.ary);
  const corn = clamp01(pose.corn);
  const pair = (key: string, id: string, left: Parts, c: V3, g: number, color: string, deep: string) => {
    if (g <= 0.01) return;
    put(`${key}1`, id, grown(left, c, g, [0, 0, 0], key), color, deep);
    put(`${key}-1`, id, grown(mirrored(key, left), X(-1, c), g, [0, 0, 0], key), color, deep);
  };
  pair('ary', 'aritenoide-kartilagoa', ARYTENOID(), [AR_BASE[0], CR_TOP, AR_BASE[2]], ary, ARCH.vi, ARCH_DEEP.vi);
  pair('cor', 'kartilago-kornikulatua', CORNICULATE(), AR_APEX, corn, mixHex(ARCH.vi, '#ffffff', 0.18), ARCH_DEEP.vi);
  pair('cun', 'kartilago-kuneiformea', CUNEIFORM(), mix3(CUN_A, CUN_B, 0.5), corn, mixHex(ARCH.vi, '#ffffff', 0.18), ARCH_DEEP.vi);
  pts['aritenoide-kartilagoa'] = [0.36, -0.14, -1.14];
  pts['kartilago-kornikulatua'] = [0.26, 0.4, -1.17];
  pts['kartilago-kuneiformea'] = mix3(CUN_A, CUN_B, 0.6);
  // The fold from the arytenoid's tip up to the epiglottis's border: the cuneiform lies in it (soft tissue, glass).
  if (corn > 0.01) {
    const foldTop: Keys = [[0.3, 0.42, -1.1], [0.6, 0.78, -0.86], [0.74, 1.42, -0.5], [0.6, 2.12, -0.1]];
    const foldLow: Keys = [[0.3, 0.02, -1.0], [0.56, 0.3, -0.74], [0.66, 0.9, -0.38], [0.5, 1.5, 0.02]];
    const fold: Fibre = (f) => [mix3(foldLow[0], foldTop[0], f), mix3(foldLow[1], foldTop[1], f), mix3(foldLow[2], foldTop[2], f), mix3(foldLow[3], foldTop[3], f)];
    const left = sheetParts('fold', [0], fold, { th: 0.035, nu: 20, nv: 20 });
    const look = { tissue: 'membrane' as const, quiet: true, ground: true, opacity: 0.5 * corn, outline: false };
    put('fold1', undefined, left, '#eec3b4', '#9a6a5c', look);
    put('fold-1', undefined, mirrored('fold', left), '#eec3b4', '#9a6a5c', look);
  }

  // ———— the trachea below: foregut, not arches (hollow; rings open behind) ————
  const ringTone = mixHex(TISSUE.ground, '#ffffff', 0.3);
  put('trachea', 'trakea', TRACHEA(), mixHex(TISSUE.ground, '#e3a898', 0.35), mixHex(TISSUE.groundDeep, '#7a4a40', 0.35), { tissue: 'membrane' });
  put('tr-rings', 'trakea', RINGS(), ringTone, TISSUE.groundDeep);
  pts['trakea'] = [0.56, RING_Y0 - 3 * RING_DY, CR_C + 0.62];

  // ———— the pharynx behind, running on into the oesophagus ————
  const ph = clamp01(pose.pharynx) * (1 - open);
  put('pharynx', 'faringea', PHARYNX(), '#e8bcab', '#96685a', { tissue: 'mesenchyme', opacity: ss(0, 0.6, ph) });
  if (ph > 0.3) pts['faringea'] = [0.62, 2.0, -1.95 - 0.64 * Math.sqrt(1 - (0.62 / 1.22) ** 2) + 0.02];

  // ———— the constrictors: three sheets wrapped round the pharynx, each overlapping the one above ————
  const horn: V3 = [1.3, 2.76, -0.5];
  const fans: { key: string; id: string; fibre: Fibre; color: string; deep: string; g: number; ridges: number }[] = [
    {
      key: 'sup',
      id: 'goiko-ertzatzailea',
      fibre: round((f) => [1.26, 3.55 + 1.5 * f, -1.42], (f) => 3.75 + 1.45 * f, 0),
      color: ARCH.iii,
      deep: ARCH_DEEP.iii,
      g: pose.sup,
      ridges: 7,
    },
    {
      key: 'mid',
      id: 'tarteko-ertzatzailea',
      // A narrow origin on the hyoid's greater horn, a broad fan behind.
      fibre: round((f) => [horn[0] + 0.02, horn[1] - 0.06 + 0.12 * f, horn[2] - 0.12 * f], (f) => 1.75 + 2.2 * f, 0.05),
      color: ARCH.iv,
      deep: ARCH_DEEP.iv,
      g: pose.mid,
      ridges: 8,
    },
    {
      key: 'inf',
      id: 'beheko-ertzatzailea',
      // From the cricoid's side and the thyroid's oblique line.
      fibre: round((f) => (f < 0.22 ? mix3([1.0, -1.3, -0.52], thyAt(1, TH_T * 0.8, -0.4, TH_HALF), f / 0.22) : mix3(thyAt(1, TH_T * 0.8, -0.4, TH_HALF), thyAt(1, TH_T * 0.74, 1.3, TH_HALF), (f - 0.22) / 0.78)), (f) => -1.45 + 3.75 * f, 0.1),
      color: mixHex(ARCH.iv, '#7a1420', 0.22),
      deep: ARCH_DEEP.iv,
      g: pose.mid,
      ridges: 10,
    },
  ];
  for (const m of fans) {
    const gl = Math.round(clamp01(m.g) * 100) / 100;
    const gr = Math.round(clamp01(m.g) * (1 - open) * 100) / 100;
    const opts = (g: number): SheetOptions => ({ th: 0.085, g, ridges: m.ridges });
    if (gl > 0.01) put(`${m.key}1`, m.id, sheetParts(m.key, [gl], m.fibre, opts(gl)), m.color, m.deep, { tissue: 'muscle' });
    if (gr > 0.01) put(`${m.key}-1`, m.id, mirrored(m.key, sheetParts(m.key, [gr], m.fibre, opts(gr)), [gr]), m.color, m.deep, { tissue: 'muscle' });
    if (m.g > 0.3) pts[m.id] = along(m.fibre(0.5), 0.74);
  }

  // ———— the intrinsic muscles (all VI, one name as in the notes) ————
  const intr = Math.round(clamp01(pose.intr) * 100) / 100;
  if (intr > 0.01) {
    const id = 'laringe-barneko-muskuluak';
    const tone = mixHex(ARCH.vi, '#f4ffd8', 0.34);
    // Behind: a fan from the plate's hollow up and out to the arytenoid's muscular process.
    const pca: Fibre = (h) => {
      // Fibres from the top of the median ridge (f 0), its foot (f 0.5) and the plate's lower border (f 1).
      const f = 1 - h;
      const a: V3 = f < 0.5 ? mix3([0.5, -1.66, 0], [0.09, -1.6, 0], f / 0.5) : mix3([0.09, -1.6, 0], [0.09, -0.84, 0], (f - 0.5) / 0.5);
      const b: V3 = [AR_MUSC[0] - 0.02, AR_MUSC[1] - 0.12 + 0.12 * f, AR_MUSC[2] - 0.08];
      const on = (p: V3): V3 => [p[0], p[1], plateBack(p[0]) - 0.035];
      return [on(a), on(mix3(a, b, 0.36)), on(mix3(a, b, 0.72)), b];
    };
    const left = sheetParts('pca2', [intr], pca, { th: 0.07, g: intr, ridges: 6, nu: 18, nv: 72 });
    put('int-pca1', id, left, tone, ARCH_DEEP.vi, { tissue: 'muscle' });
    put('int-pca-1', id, mirrored('pca2', left, [intr]), tone, ARCH_DEEP.vi, { tissue: 'muscle' });
    // Across the backs of the two arytenoids.
    const ia: Fibre = (f) => {
      const y = lerp(0.0, -0.4, f);
      const zb = lerp(-1.2, -1.24, f);
      return [[-0.44, y, zb + 0.03], [-0.15, y, zb - 0.05], [0.15, y, zb - 0.05], [0.44, y, zb + 0.03]];
    };
    const half = Math.round(intr * 100) / 100;
    put('int-ia', id, sheetParts('ia2', [half], (f) => ia(f).map((p) => [p[0] * half, p[1], p[2]] as V3) as unknown as Keys, { th: 0.06, ridges: 4, nu: 16, nv: 56 }), tone, ARCH_DEEP.vi, { tissue: 'muscle' });
    for (const s of [-1, 1]) {
      // From the arch's upper border back to the muscular process; from the thyroid's angle back to the vocal process.
      spindle(`int-lca${s}`, id, [X(s, [0.9, -1.22, -0.22]), X(s, [0.84, -0.86, -0.62]), X(s, [0.64, -0.5, -0.98])], 0.075, tone, ARCH_DEEP.vi, intr);
      spindle(`int-ta${s}`, id, [X(s, [0.07, -0.26, 0.84]), X(s, [0.2, -0.3, 0.2]), X(s, [0.24, -0.36, -0.5])], 0.085, tone, ARCH_DEEP.vi, intr);
    }
    if (intr > 0.3) pts[id] = X(-1, along(pca(0.5), 0.5));
  }

  // ———— the vagus and its two branches (a left one: the side the camera sees) ————
  const nv = clamp01(pose.nerve);
  if (nv > 0.01) {
    const light = (c: string) => mixHex(c, '#ffffff', 0.25);
    const vagus = L([[1.86, 5.3, -1.92], [2.0, 3.6, -1.78], [1.96, 1.2, -1.82], [2.03, -1.4, -1.7], [1.95, -4.3, -1.5]], 28);
    // The upper branch leaves high and enters between the hyoid and the thyroid; the lower one turns back below and climbs in the groove between trachea and oesophagus.
    const sln = L([[1.99, 3.9, -1.79], [1.96, 3.05, -1.2], [1.64, 2.32, -0.6], [1.22, 2.02, -0.22], [1.0, 2.06, -0.08]], 20);
    const rln = L([[1.97, -3.72, -1.53], [1.78, -4.5, -1.5], [1.3, -4.38, -1.3], [0.92, -3.3, -0.92], [0.84, -2.2, -0.88], [0.92, -1.42, -0.76]], 26);
    vess('vagus', 'bagoa', vagus, TISSUE.nerve, TISSUE.nerveDeep, { r0: 0.095, r1: 0.08, n: 28, sides: 12 }, nv, { tissue: 'nerve' });
    vess('sln', 'goiko-laringe-nerbioa', sln, light(ARCH.iv), ARCH_DEEP.iv, { r0: 0.075, r1: 0.055, n: 20, sides: 10 }, nv, { tissue: 'nerve' });
    vess('rln', 'laringe-atzerakaria', rln, light(ARCH.vi), ARCH_DEEP.vi, { r0: 0.075, r1: 0.055, n: 26, sides: 10 }, nv, { tissue: 'nerve' });
    if (nv > 0.3) {
      pts['bagoa'] = at(vagus, 0.72);
      pts['goiko-laringe-nerbioa'] = at(sln, 0.45);
      pts['laringe-atzerakaria'] = at(rln, 0.68);
    }
  }
  return { items, pts };
}
