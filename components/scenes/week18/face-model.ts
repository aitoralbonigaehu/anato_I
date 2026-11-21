import { curve3 } from '@/lib/three-d/mesh';
import { fieldSurface, type FieldRegion } from '@/lib/three-d/field-surface';
import type { V3 } from '@/lib/three-d/math';
import { vessel } from '@/lib/three-d/organic';
import type { Item3 } from '@/lib/three-d/scene';
import { mixHex } from '@/components/scenes/week10/model3d';
import { ARCH, ARCH_DEEP, TISSUE, type PoseModel } from '@/components/scenes/week17/common';

/**
 * Topic 18 §4–4.1: the face as one continuous skin from week 4 to week 12 (lib/three-d/field-surface.ts). Axes: x the
 * embryo's LEFT, y cranial, z ventral. The material chart (a, b) is the tissue's place at week 5, as arc on a head of
 * radius 2 (a = 2·longitude from the front, b = 2·latitude). Each region is cut in that chart, so it travels with its
 * tissue: handles carry the chart medially and forwards with age, and the relief is authored round the same handles.
 */

export interface FacePose {
  /** Weeks of development (4..12). */
  age: number;
  /** 1: the notes' colours; 0: skin (the little human face). */
  color: number;
  /** The nasolacrimal duct and the lacrimal sac (0..1). */
  duct: number;
}
export const FP0: FacePose = { age: 4, color: 1, duct: 0 };

export interface FaceOpts {
  dim?: { ids: readonly string[]; k: number } | null;
}

export const FACE_COLOR = {
  front: '#efcdb8',
  medial: '#f5d94e',
  lateral: '#86cdf0',
  /** The lateral nasal prominence's band above the nasolacrimal groove (same blue; it goes to skin as the groove closes). */
  band: '#86cdf0',
  max: ARCH.i,
  mand: '#ec7f36',
  mouth: '#8e4348',
  membrane: '#e0a6a6',
  eye: '#33242c',
  groove: '#7b3a8c',
  pit: '#74393e',
  body: '#dcb7a2',
  back: '#e6c5b1',
};
const SKIN = '#eebda3';
const SKIN_DEEP = '#9a6450';

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const ss = (a: number, b: number, x: number) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};

const AGES = [4, 5, 6, 7, 8, 10, 12];
type Key = readonly (readonly [number, number])[];
/** A handle: its place in the chart (= week 5) and where it is at each of AGES (a ≥ 0; the other side mirrors). */
const LM: Record<string, Key> = {
  eye: [[3.0, -0.1], [2.9, -0.1], [2.55, -0.1], [2.15, -0.1], [1.7, -0.1], [1.05, -0.12], [0.76, -0.1]],
  pit: [[1.0, -0.62], [1.0, -0.62], [0.8, -0.66], [0.56, -0.7], [0.4, -0.74], [0.24, -0.79], [0.15, -0.8]],
  medial: [[0.62, -0.7], [0.62, -0.7], [0.42, -0.72], [0.2, -0.76], [0.1, -0.76], [0.05, -0.76], [0.04, -0.76]],
  lateral: [[1.4, -0.56], [1.4, -0.56], [1.18, -0.6], [0.92, -0.64], [0.72, -0.68], [0.46, -0.73], [0.3, -0.75]],
  lip: [[0.75, -1.1], [0.75, -1.1], [0.55, -1.1], [0.3, -1.1], [0.16, -1.1], [0.11, -1.1], [0.1, -1.1]],
  max: [[2.1, -1.0], [2.0, -1.02], [1.75, -1.05], [1.45, -1.05], [1.2, -1.02], [0.95, -0.98], [0.85, -0.95]],
  maxTip: [[1.2, -1.14], [1.2, -1.14], [0.98, -1.14], [0.7, -1.14], [0.42, -1.14], [0.28, -1.14], [0.26, -1.14]],
  corner: [[1.8, -1.42], [1.7, -1.42], [1.42, -1.38], [1.1, -1.32], [0.8, -1.26], [0.48, -1.2], [0.36, -1.2]],
  mand: [[1.1, -1.95], [1.1, -1.95], [1.0, -1.92], [0.9, -1.86], [0.8, -1.8], [0.7, -1.72], [0.64, -1.68]],
  ear: [[3.7, -2.1], [3.7, -2.1], [3.6, -1.9], [3.5, -1.65], [3.4, -1.3], [3.25, -0.8], [3.15, -0.5]],
  brow: [[1.6, 0.5], [1.6, 0.5], [1.45, 0.45], [1.25, 0.42], [1.1, 0.4], [0.9, 0.38], [0.8, 0.36]],
  midLow: [[0, -1.2], [0, -1.2], [0, -1.18], [0, -1.16], [0, -1.14], [0, -1.12], [0, -1.12]],
  midHigh: [[0, -0.3], [0, -0.3], [0, -0.32], [0, -0.34], [0, -0.36], [0, -0.38], [0, -0.4]],
};
const NAMES = Object.keys(LM);

function lmAt(n: string, age: number): [number, number] {
  const k = LM[n];
  let i = 0;
  while (i < AGES.length - 2 && age > AGES[i + 1]) i++;
  const u = ss(0, 1, (age - AGES[i]) / (AGES[i + 1] - AGES[i]));
  return [k[i][0] + (k[i + 1][0] - k[i][0]) * u, k[i][1] + (k[i + 1][1] - k[i][1]) * u];
}

/**
 * Each handle's reach (its bell's width, in chart units). A handle that travels far carries a broad patch of skin with
 * it: the ear climbs from the neck to the eyes' level and the cheek with it, and a narrow bell round it sheared the
 * skin behind the cheek into dark pleats.
 */
const REACH: Record<string, number> = { ear: 0.9, max: 0.6, corner: 0.5, mand: 0.6, eye: 0.85, brow: 0.6 };
const SIG2K = Float64Array.from(Object.keys(LM).map((n) => (REACH[n] ?? 0.42) ** 2));
/**
 * How fast a handle's hold fades with distance: a point moves by (sum of w * move) / sqrt(HOLD^2 + (sum of w)^2). At
 * a handle that is the handle's own move; well away from all of them the tissue stays. The fall is as gentle as the
 * bell itself: a plain share (sum of w * move / sum of w) is a Voronoi map far from the handles, with a sharp edge
 * half way between two of them, and the skin sheared into pleats along that edge.
 */
const HOLD = 0.06;
/**
 * The handles carry the chart as a FLOW, in steps of DT weeks: at each step a material point moves with the handles
 * near it (their share is taken where the point is NOW, round where the handles are NOW). Every step is a small,
 * smooth move, so the skin is squeezed ahead of a handle and stretched behind it but never folds over itself. One
 * jump from week 5 to week 12 did fold (the eye crosses half the face), and a folded skin shows as dark creases,
 * stripes and colours smeared over their neighbours. The flow runs on the half face a >= 0; tissue squeezed past the
 * midline is pressed thin against it (`press`), so the two medial rims meet there.
 */
const DT = 0.125;
const AGE0 = AGES[0];
const NJ = Math.round((AGES[AGES.length - 1] - AGE0) / DT);
/** The step the chart is drawn at (week 5). */
const J5 = Math.round((5 - AGE0) / DT);
type Lm = Float64Array;
let LS: Lm[] | null = null;
const steps = () => (LS ??= Array.from({ length: NJ + 1 }, (_, j) => landmarks(AGE0 + j * DT)));

/**
 * One step for `n` points (|a|, b pairs): from the handles at L0 to the handles at L1. Every handle also acts as its
 * mirror image across the midline (at −a, moving with −da), so the field is symmetric: on the midline it has no
 * sideways part, tissue near it is narrowed smoothly, and no point is ever pushed across it (pushing tissue over the
 * midline and pressing it back folded the skin into the dark crease down the nose, lip and chin).
 */
function carry(from: Float32Array | Float64Array, to: Float32Array | Float64Array, n: number, L0: Lm, L1: Lm) {
  const K = NAMES.length;
  for (let v = 0; v < n; v++) {
    const a = from[v * 2], b = from[v * 2 + 1];
    let sum = 0, dx = 0, dy = 0;
    for (let k = 0; k < K; k++) {
      const hx = L0[k * 2], ey = b - L0[k * 2 + 1];
      const mx = L1[k * 2] - hx, my = L1[k * 2 + 1] - L0[k * 2 + 1];
      const s2 = SIG2K[k];
      for (let m = 0; m < (hx > 1e-6 ? 2 : 1); m++) {
        const ex = m ? a + hx : a - hx;
        const q = (ex * ex + ey * ey) / s2;
        if (q > 16) continue;
        const w = Math.exp(-q);
        sum += w;
        dx += w * (m ? -mx : mx);
        dy += w * my;
      }
    }
    const k = 1 / Math.sqrt(HOLD * HOLD + sum * sum);
    to[v * 2] = Math.max(0, a + dx * k);
    to[v * 2 + 1] = b + dy * k;
  }
}

/** The flow is symmetric about the midline, so a carried |a| stays ≥ 0 by itself (`carry` only guards rounding). */
const press = (A: number) => (A > 0 ? A : 0);
/** Where a step lies between two steps of the flow. */
const stepOf = (age: number) => {
  const f = Math.min(NJ, Math.max(0, (age - AGE0) / DT));
  const j = Math.min(NJ - 1, Math.floor(f));
  return { j, u: f - j };
};

const seg = (px: number, py: number, ax: number, ay: number, bx: number, by: number) => {
  const dx = bx - ax, dy = by - ay;
  const t = clamp01(((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1));
  return { d: Math.hypot(px - ax - dx * t, py - ay - dy * t), t };
};

// ———— the regions, in the chart (week 5) ————
const PIT: [number, number] = [1.0, -0.62];
const disc = (a: number, b: number) => Math.hypot(Math.abs(a) - PIT[0], b - PIT[1]);
/**
 * The nasolacrimal groove's line: from under the lateral rim up to the eye's medial corner. It is the seam between
 * the lateral nasal prominence (above) and the maxillary prominence (below), so both regions reach it: the maxillary
 * one's top edge follows it, and a band of the lateral one runs along its upper side to the eye.
 */
const GV = [1.42, -0.86, 2.62, -0.34] as const;
const gy = (A: number) => GV[1] + ((A - GV[0]) * (GV[3] - GV[1])) / (GV[2] - GV[0]);
const top = (A: number) => Math.max(-1.02, gy(A));
const latBand = (A: number, b: number) => { const u = b - gy(A); return Math.min(u, 0.34 - 0.09 * (A - GV[0]) - u, 2.52 - A, A - PIT[0]); };
const REGIONS: FieldRegion[] = [
  { name: 'front', weight: () => 0.015 },
  { name: 'back', weight: (a) => Math.abs(a) - 3.5 },
  { name: 'body', weight: (_, b) => -2.68 - b },
  { name: 'medial', weight: (a, b) => { const A = Math.abs(a); return Math.max(Math.min(0.52 - disc(a, b), PIT[0] - A), Math.min(1.0 - A, A - 0.42, b + 1.17, -0.62 - b)); } },
  { name: 'lateral', weight: (a, b) => Math.min(0.52 - disc(a, b), Math.abs(a) - PIT[0]) },
  { name: 'band', weight: (a, b) => latBand(Math.abs(a), b) },
  { name: 'pit', weight: (a, b) => (0.17 - disc(a, b)) * 1.5 },
  { name: 'max', weight: (a, b) => { const A = Math.abs(a); return Math.min(top(A) - b, b + 1.36, 3.5 - A, A - 1.0 + 0.0 * b); } },
  { name: 'mand', weight: (a, b) => Math.min(-1.5 - b, b + 2.32, 3.35 - Math.abs(a)) },
  { name: 'arch2', weight: (a, b) => Math.min(-2.3 - b, b + 2.68, 3.35 - Math.abs(a)) },
  { name: 'mouth', weight: (a, b) => (1 - Math.hypot(a / 1.85, (b + 1.42) / 0.24)) * 0.24 },
  { name: 'membrane', weight: (a, b) => (1 - Math.hypot(a / 0.95, (b + 1.42) / 0.1)) * 0.3 },
  { name: 'eye', weight: (a, b) => 0.3 - Math.hypot(Math.abs(a) - 2.9, b + 0.1) },
  { name: 'groove', weight: (a, b) => 0.11 - seg(Math.abs(a), b, GV[0], GV[1], GV[2], GV[3]).d },
];

const NU = 220;
const NV = 170;
let surf: ReturnType<typeof fieldSurface> | null = null;
/** The chart of every grid vertex (|a|, b) at each step of the flow: a step is worked out the first time an age needs it. */
const FLOW: (Float32Array | undefined)[] = [];
function flowAt(j: number): Float32Array {
  const n = surf!.n;
  const L = steps();
  const dir = j > J5 ? 1 : -1;
  let i = j;
  while (!FLOW[i]) i -= dir;
  for (; i !== j; i += dir) carry(FLOW[i]!, (FLOW[i + dir] = new Float32Array(n * 2)), n, L[i], L[i + dir]);
  return FLOW[j]!;
}
const face = () => {
  if (!surf) {
    surf = fieldSurface({
      key: 'face',
      nu: NU,
      nv: NV,
      wrapU: true,
      poleV0: true,
      poleV1: true,
      chart: (u, v) => {
        const s = 2 * u - 1;
        return [Math.sign(s) * 2 * Math.PI * Math.abs(s) ** 1.5, Math.PI * (2 * v - 1)];
      },
      regions: REGIONS,
      colors: FACE_COLOR,
      soft: 0.05,
    });
    const n = surf.n;
    const start = new Float32Array(n * 2);
    for (let v = 0; v < n; v++) {
      start[v * 2] = Math.abs(surf.material[v * 2]);
      start[v * 2 + 1] = surf.material[v * 2 + 1];
    }
    FLOW[J5] = start;
  }
  return surf;
};

function landmarks(age: number): Lm {
  const out = new Float64Array(NAMES.length * 2);
  NAMES.forEach((n, k) => {
    const p = lmAt(n, age);
    out[k * 2] = p[0];
    out[k * 2 + 1] = p[1];
  });
  return out;
}
const ix = (n: string) => NAMES.indexOf(n);
const I = Object.fromEntries(NAMES.map((n) => [n, ix(n)])) as Record<string, number>;

/** The relief (outwards, world units) at chart point (x, y) at this age. */
function relief(x: number, y: number, age: number, L: Lm): number {
  const A = Math.abs(x);
  const g = (n: string, sx: number, sy: number, amp: number, dx = 0, dy = 0) => {
    const k = I[n];
    const px = (A - L[k * 2] - dx) / sx, py = (y - L[k * 2 + 1] - dy) / sy;
    const q = px * px + py * py;
    return q > 9 ? 0 : amp * Math.exp(-q);
  };
  const G = (cx: number, cy: number, sx: number, sy: number, amp: number) => {
    const px = (x - cx) / sx, py = (y - cy) / sy;
    const q = px * px + py * py;
    return q > 9 ? 0 : amp * Math.exp(-q);
  };
  const emb = 1 - ss(8.5, 11, age);
  const fin = ss(8, 11.5, age);
  const nasal = ss(4.4, 5.6, age);
  let h = 0;
  // Swellings.
  h += g('max', 0.62, 0.34, 0.3 * emb + 0.14);
  h += g('mand', 0.95 - 0.3 * fin, 0.3, 0.26 * emb);
  h += g('brow', 0.5, 0.2, 0.05 * fin);
  // The nasal rims round the pit, the pit itself; the ridges merge into a nose.
  const rim = nasal * emb;
  h += g('medial', 0.2, 0.26, 0.34 * rim);
  h += g('lateral', 0.2, 0.26, 0.3 * rim);
  h += g('pit', 0.13 - 0.05 * fin, 0.14 - 0.08 * fin, (-0.42 - 0.12 * ss(5, 7, age)) * nasal * (1 - 0.6 * fin));
  h += g('eye', 0.34 - 0.04 * fin, 0.28 - 0.1 * fin, 0.16);
  // Grooves that zip closed, leaving no seam.
  const close = (start: number, end: number, s: number) => 1 - ss(start + (end - start) * 0.75 * s, start + (end - start) * (0.25 + 0.75 * s), age);
  {
    // Nasolacrimal: lateral rim ↔ maxillary, closing from the nose towards the eye.
    const a = I.lateral, b = I.eye;
    const ax = L[a * 2] + 0.08, ay = L[a * 2 + 1] - 0.26, bx = L[b * 2] - 0.2, by = L[b * 2 + 1] - 0.18;
    const r = seg(A, y, ax, ay, bx, by);
    if (r.d < 0.3) h -= 0.17 * Math.exp(-((r.d / 0.08) ** 2)) * close(7, 10.5, r.t) * nasal;
  }
  {
    // Medial rim ↔ maxillary, under the nostril.
    const a = I.pit, b = I.maxTip;
    const r = seg(A, y, L[a * 2], L[a * 2 + 1] - 0.1, L[b * 2] - 0.04, L[b * 2 + 1]);
    if (r.d < 0.3) h -= 0.16 * Math.exp(-((r.d / 0.07) ** 2)) * close(6.2, 8.6, r.t) * nasal;
  }
  {
    // The two medial rims' cleft, on the midline.
    if (A < 0.4) {
      const low = L[I.midLow * 2 + 1], high = L[I.midHigh * 2 + 1] - 0.35;
      const s = clamp01((y - low) / (high - low));
      if (s > -0.01 && y < high + 0.1) h -= 0.16 * Math.exp(-((A / (0.12 - 0.05 * fin)) ** 2)) * close(6.2, 9.5, s) * nasal;
    }
  }
  // The stomodeum: a wide pit that narrows as the corners fuse from the sides.
  {
    const c = I.corner;
    const hw = L[c * 2], yc = L[c * 2 + 1] - (1 - fin) * 0.02;
    const edge = clamp01(1 - A / hw);
    const open = 0.13 * (1 - fin) + 0.04;
    const dy = (y - yc) / open;
    if (dy * dy < 9 && edge > 0) h -= (0.62 * (1 - 0.72 * fin) + 0.04) * Math.exp(-dy * dy) * ss(0, 0.24, edge);
  }
  // The arches below (II), going under the neck.
  h += G(0, -2.5, 3.0, 0.14, 0.13 * (1 - ss(6, 9, age)));
  // The little human face.
  if (fin > 0) {
    let f = 0;
    f += G(0, -0.5, 0.15, 0.42, 0.26);
    f += G(0, -0.74, 0.16, 0.12, 0.3);
    f += g('lateral', 0.12, 0.1, 0.2);
    f += G(0, -1.02, 0.05, 0.1, -0.06);
    f += G(0, -1.11, 0.28, 0.05, 0.11);
    f += G(0, -1.3, 0.24, 0.07, 0.13);
    f += G(0, -1.46, 0.24, 0.06, -0.08);
    f += G(0, -1.72, 0.3, 0.18, 0.24);
    f += g('max', 0.42, 0.42, 0.1);
    f += g('eye', 0.28, 0.2, -0.04, 0, 0.13);
    f += g('eye', 0.2, 0.015 + 0.02, -0.05, 0, -0.03);
    h += f * fin;
  }
  // Under the chin: the neck appears as the heart bulge goes.
  h += G(0, -2.9, 1.8, 0.4, 0.5 * (1 - ss(6, 10, age)));
  h -= 0.34 * ss(7, 12, age) * Math.exp(-(((y + 2.38) / 0.28) ** 2));
  // Ear: a raised rim with a hollow, from the arches.
  h += g('ear', 0.26, 0.42, 0.22 * ss(6, 10, age));
  h += g('ear', 0.12, 0.22, -0.13 * ss(6, 10, age));
  return h;
}

const dirFrom = (a: number, b: number): V3 => {
  const lam = a / 2, phi = b / 2;
  const c = Math.cos(phi);
  return [Math.sin(lam) * c, Math.sin(phi), Math.cos(lam) * c];
};
function base(d: V3, age: number) {
  const low = d[1] < 0;
  const wide = 2.0 - 0.1 * ss(6, 12, age);
  const by = low ? 2.75 : 2.2;
  return 1 / Math.sqrt((d[0] / wide) ** 2 + (d[1] / by) ** 2 + (d[2] / 2.0) ** 2);
}

/** The skin at a carried chart point: its side (-1, 0 on the midline, 1), and |a| and b as carried to this age. */
function place(side: number, A: number, y: number, age: number, L: Lm): V3 {
  const x = side * press(A);
  const d = dirFrom(x, y);
  const r = base(d, age) + relief(x, y, age, L);
  return [d[0] * r, d[1] * r + 0.25, d[2] * r];
}
const sideOf = (a: number) => (a === 0 ? 0 : a < 0 ? -1 : 1);

/** A material point at this age (names, anchors): carried through the same steps as the skin. */
function pointOf(a: number, b: number, age: number, L: Lm): V3 {
  const S = steps();
  const { j, u } = stepOf(age);
  let p = new Float64Array([Math.abs(a), b]);
  let q = new Float64Array(2);
  const walk = (from: number, to: number) => {
    carry(p, q, 1, S[from], S[to]);
    const s = p;
    p = q;
    q = s;
  };
  let lo: [number, number], hi: [number, number];
  if (j >= J5) {
    for (let i = J5; i < j; i++) walk(i, i + 1);
    lo = [p[0], p[1]];
    walk(j, j + 1);
    hi = [p[0], p[1]];
  } else {
    for (let i = J5; i > j + 1; i--) walk(i, i - 1);
    hi = [p[0], p[1]];
    walk(j + 1, j);
    lo = [p[0], p[1]];
  }
  return place(sideOf(a), lo[0] + (hi[0] - lo[0]) * u, lo[1] + (hi[1] - lo[1]) * u, age, L);
}

const OK = (id: string, dim: FaceOpts['dim'], groups?: readonly string[]) => !dim || dim.ids.includes(id) || (groups ?? []).some((g) => dim.ids.includes(g));

export function faceModel(pose: FacePose, o: FaceOpts = {}): PoseModel {
  const age = Math.round(pose.age * 200) / 200;
  const s = face();
  const L = landmarks(age);
  const { j, u } = stepOf(age);
  const f0 = flowAt(j), f1 = flowAt(j + 1);
  const parts = s.build([age], (a, _b, out, at, v) => {
    const A = f0[v * 2] + (f1[v * 2] - f0[v * 2]) * u;
    const y = f0[v * 2 + 1] + (f1[v * 2 + 1] - f0[v * 2 + 1]) * u;
    const p = place(sideOf(a), A, y, age, L);
    out[at] = p[0];
    out[at + 1] = p[1];
    out[at + 2] = p[2];
  });
  const tone = (c: string) => mixHex(SKIN, c, pose.color);
  // The eyelids close over the eye (weeks 9–11): the eye ends in the same tone as the skin round it, not lighter.
  const eyeC = mixHex(FACE_COLOR.eye, tone(FACE_COLOR.front), ss(9.2, 11.2, age));
  const mem = 1 - ss(4.1, 4.6, age);
  const reg = (name: string, id: string | undefined, color: string, extra: Partial<Item3> = {}, deep?: string) => {
    // As the notes' colours go, every region's shade goes to the one skin's too: no patch keeps its own darker tint.
    const d = deep ?? mixHex(color, '#3a1a18', 0.55);
    items.push({ key: `face-${name}`, id, ...parts[name], color, deep: mixHex(SKIN_DEEP, d, pose.color), tissue: 'skin', soft: pose.color, ...extra });
  };
  const items: Item3[] = [];
  reg('front', 'goragune-frontonasala', tone(FACE_COLOR.front));
  reg('back', undefined, tone(FACE_COLOR.back), { quiet: true, ground: true });
  reg('body', undefined, tone(FACE_COLOR.body), { quiet: true, ground: true });
  reg('medial', 'sudur-ertz-mediala', tone(FACE_COLOR.medial), { groups: ['sudur-plakoda', 'sudurraren-erdiko-atala', 'goiko-ezpainaren-erdiko-atala'] });
  reg('lateral', 'sudur-ertz-laterala', tone(FACE_COLOR.lateral), { groups: ['sudur-plakoda', 'sudur-hegalak'] });
  // The band along the groove's upper side: the lateral rim's blue while the groove is open, the skin's once it has
  // closed (weeks 8–10.5), so the finished nose keeps only its alae blue.
  reg('band', 'sudur-ertz-laterala', mixHex(tone(FACE_COLOR.lateral), tone(FACE_COLOR.front), ss(8, 10.5, age)), { groups: ['sudur-plakoda'] });
  reg('pit', 'sudur-hobitxoa', mixHex(FACE_COLOR.pit, SKIN, 0.15 * (1 - pose.color)), { groups: ['sudur-plakoda'] });
  reg('max', 'luzapen-maxilarra', tone(FACE_COLOR.max), {}, mixHex(tone(FACE_COLOR.max), ARCH_DEEP.i, 0.8));
  reg('mand', 'barail-luzapena', tone(FACE_COLOR.mand), {}, mixHex(tone(FACE_COLOR.mand), ARCH_DEEP.i, 0.8));
  // Arch II is not one of the face's prominences: its colour goes once the neck forms (its skin rises with the ear).
  const ii = mixHex(SKIN, ARCH.ii, pose.color * (1 - ss(7.5, 10, age)));
  reg('arch2', 'bigarren-arkua', ii, {}, mixHex(ii, ARCH_DEEP.ii, 0.8 * (1 - ss(7.5, 10, age))));
  reg('mouth', 'estomodeoa', FACE_COLOR.mouth);
  reg('membrane', 'mintz-bukofaringeoa', mixHex('#2a1216', FACE_COLOR.membrane, mem));
  // The colour melt (`Mesh.tint`) is relative to the eye's authored dark colour: once the lids close and the eye takes
  // the skin's tone, that melt would brighten it into a pale disc, so it goes with the dark colour.
  reg('eye', 'begia', eyeC, { soft: pose.color * (1 - ss(9.2, 11.2, age)) });
  reg('groove', 'ildo-nasolagrimala', tone(FACE_COLOR.groove));
  const pts: Record<string, V3> = {};
  const P = (a: number, b: number) => pointOf(a, b, age, L);
  pts['goragune-frontonasala'] = P(0.2, 0.9);
  pts['sudur-plakoda'] = P(PIT[0], PIT[1]);
  pts['sudur-hobitxoa'] = P(PIT[0], PIT[1]);
  pts['sudur-ertz-mediala'] = P(0.68, -0.66);
  pts['sudur-ertz-laterala'] = P(1.34, -0.6);
  pts['sudurraren-erdiko-atala'] = P(0.68, -0.66);
  pts['goiko-ezpainaren-erdiko-atala'] = P(0.72, -1.05);
  pts['sudur-hegalak'] = P(1.34, -0.6);
  pts['luzapen-maxilarra'] = P(2.0, -1.1);
  pts['barail-luzapena'] = P(0.9, -1.92);
  pts.estomodeoa = P(1.2, -1.42);
  pts['mintz-bukofaringeoa'] = P(0.3, -1.42);
  pts.begia = P(2.9, -0.1);
  pts['ildo-nasolagrimala'] = P(2.0, -0.6);
  pts['bigarren-arkua'] = P(1.5, -2.5);
  // The duct under the groove, from the eye's medial corner to the nose (drawn just proud of the skin).
  if (pose.duct > 0.01) {
    const line = curve3([P(2.68, -0.26), P(2.3, -0.48), P(1.9, -0.66), P(1.5, -0.84)].map((q) => [q[0] * 1.012, q[1] * 1.012, q[2] * 1.012] as V3), 24);
    const col = '#9b6cf0';
    const duct = vessel(line, { r0: 0.05, r1: 0.04, sides: 10 }, pose.duct);
    if (duct) items.push({ key: 'nl-duct', id: 'hodi-nasolagrimala', ...duct, color: col, deep: '#452a80', tissue: 'epithelium' });
    if (pose.duct > 0.5) {
      const sac = vessel([line[0], line[3]], { r0: 0.1 * ss(0.5, 1, pose.duct) + 0.005, r1: 0.075, sides: 12 });
      if (sac) items.push({ key: 'nl-sac', id: 'malko-zakua', ...sac, color: '#c9a4ff', deep: '#5c3a99', tissue: 'epithelium' });
    }
    pts['hodi-nasolagrimala'] = line[14];
    pts['malko-zakua'] = line[1];
    pts['begiaren-erpin-mediala'] = line[0];
  }
  void OK;
  void TISSUE;
  void o;
  return { items, pts };
}
