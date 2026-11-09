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
  max: ARCH.i,
  mand: '#ec7f36',
  mouth: '#8e4348',
  membrane: '#e0a6a6',
  eye: '#33242c',
  groove: '#a84a24',
  pit: '#74393e',
  body: '#dcb7a2',
  back: '#e6c5b1',
};
const SKIN = '#eebda3';

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
const H0 = NAMES.map((n) => LM[n][1]);

function lmAt(n: string, age: number): [number, number] {
  const k = LM[n];
  let i = 0;
  while (i < AGES.length - 2 && age > AGES[i + 1]) i++;
  const u = ss(0, 1, (age - AGES[i]) / (AGES[i + 1] - AGES[i]));
  return [k[i][0] + (k[i + 1][0] - k[i][0]) * u, k[i][1] + (k[i + 1][1] - k[i][1]) * u];
}

const SIG2 = 0.42 * 0.42;
/** The share of each handle at a material point (|a|, b): near handles lead; far from all, tissue stays. */
function handleWeights(a: number, b: number, out: Float32Array, at: number) {
  let sum = 0.0006;
  for (let k = 0; k < H0.length; k++) {
    const dx = a - H0[k][0], dy = b - H0[k][1];
    const w = Math.exp(-(dx * dx + dy * dy) / SIG2) + 1e-7;
    out[at + k] = w;
    sum += w;
  }
  for (let k = 0; k < H0.length; k++) out[at + k] /= sum;
}

const seg = (px: number, py: number, ax: number, ay: number, bx: number, by: number) => {
  const dx = bx - ax, dy = by - ay;
  const t = clamp01(((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1));
  return { d: Math.hypot(px - ax - dx * t, py - ay - dy * t), t };
};

// ———— the regions, in the chart (week 5) ————
const PIT: [number, number] = [1.0, -0.62];
const disc = (a: number, b: number) => Math.hypot(Math.abs(a) - PIT[0], b - PIT[1]);
const top = (A: number) => -1.02 + 0.28 * Math.max(0, A - 1.35);
const REGIONS: FieldRegion[] = [
  { name: 'front', weight: () => 0.015 },
  { name: 'back', weight: (a) => Math.abs(a) - 3.5 },
  { name: 'body', weight: (_, b) => -2.68 - b },
  { name: 'medial', weight: (a, b) => { const A = Math.abs(a); return Math.max(Math.min(0.52 - disc(a, b), PIT[0] - A), Math.min(1.0 - A, A - 0.42, b + 1.17, -0.62 - b)); } },
  { name: 'lateral', weight: (a, b) => Math.min(0.52 - disc(a, b), Math.abs(a) - PIT[0]) },
  { name: 'pit', weight: (a, b) => (0.17 - disc(a, b)) * 1.5 },
  { name: 'max', weight: (a, b) => { const A = Math.abs(a); return Math.min(top(A) - b, b + 1.36, 3.5 - A, A - 1.0 + 0.0 * b); } },
  { name: 'mand', weight: (a, b) => Math.min(-1.5 - b, b + 2.32, 3.35 - Math.abs(a)) },
  { name: 'arch2', weight: (a, b) => Math.min(-2.3 - b, b + 2.68, 3.35 - Math.abs(a)) },
  { name: 'mouth', weight: (a, b) => (1 - Math.hypot(a / 1.85, (b + 1.42) / 0.24)) * 0.24 },
  { name: 'membrane', weight: (a, b) => (1 - Math.hypot(a / 0.95, (b + 1.42) / 0.1)) * 0.3 },
  { name: 'eye', weight: (a, b) => 0.3 - Math.hypot(Math.abs(a) - 2.9, b + 0.1) },
  { name: 'groove', weight: (a, b) => 0.03 + 0.05 - seg(Math.abs(a), b, 1.42, -0.86, 2.62, -0.34).d },
];

const NU = 220;
const NV = 170;
let surf: ReturnType<typeof fieldSurface> | null = null;
let W: Float32Array | null = null;
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
    const K = H0.length;
    W = new Float32Array(surf.n * K);
    for (let v = 0; v < surf.n; v++) handleWeights(Math.abs(surf.material[v * 2]), surf.material[v * 2 + 1], W, v * K);
  }
  return { s: surf, w: W! };
};

type Lm = Float64Array;
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
    const open = 0.13 * (1 - fin) + 0.022;
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

function point(a: number, b: number, age: number, L: Lm, wAt?: (k: number) => number): V3 {
  const sgn = a < 0 ? -1 : 1;
  const A = Math.abs(a);
  let dx = 0, dy = 0;
  if (wAt)
    for (let k = 0; k < H0.length; k++) {
      const w = wAt(k);
      dx += w * (L[k * 2] - H0[k][0]);
      dy += w * (L[k * 2 + 1] - H0[k][1]);
    }
  const x = sgn * Math.max(0, A + dx);
  const y = b + dy;
  const d = dirFrom(x, y);
  const r = base(d, age) + relief(x, y, age, L);
  return [d[0] * r, d[1] * r + 0.25, d[2] * r];
}

const scratch = new Float32Array(H0.length);
/** A material point at this age (names, anchors). */
function pointOf(a: number, b: number, age: number, L: Lm): V3 {
  handleWeights(Math.abs(a), b, scratch, 0);
  return point(a, b, age, L, (k) => scratch[k]);
}

const OK = (id: string, dim: FaceOpts['dim'], groups?: readonly string[]) => !dim || dim.ids.includes(id) || (groups ?? []).some((g) => dim.ids.includes(g));

export function faceModel(pose: FacePose, o: FaceOpts = {}): PoseModel {
  const age = Math.round(pose.age * 200) / 200;
  const { s, w } = face();
  const L = landmarks(age);
  const K = H0.length;
  const parts = s.build([age], (a, b, out, at, v) => {
    const p = point(a, b, age, L, (k) => w[v * K + k]);
    out[at] = p[0];
    out[at + 1] = p[1];
    out[at + 2] = p[2];
  });
  const tone = (c: string) => mixHex(SKIN, c, pose.color);
  const eyeC = mixHex(FACE_COLOR.eye, SKIN, ss(9.2, 11.2, age));
  const mem = 1 - ss(4.1, 4.6, age);
  const reg = (name: string, id: string | undefined, color: string, extra: Partial<Item3> = {}, deep?: string) => {
    items.push({ key: `face-${name}`, id, ...parts[name], color, deep: deep ?? mixHex(color, '#3a1a18', 0.55), tissue: 'skin', soft: pose.color, ...extra });
  };
  const items: Item3[] = [];
  reg('front', 'goragune-frontonasala', tone(FACE_COLOR.front));
  reg('back', undefined, tone(FACE_COLOR.back), { quiet: true, ground: true });
  reg('body', undefined, tone(FACE_COLOR.body), { quiet: true, ground: true });
  reg('medial', 'sudur-ertz-mediala', tone(FACE_COLOR.medial), { groups: ['sudur-plakoda', 'sudurraren-erdiko-atala', 'goiko-ezpainaren-erdiko-atala'] });
  reg('lateral', 'sudur-ertz-laterala', tone(FACE_COLOR.lateral), { groups: ['sudur-plakoda', 'sudur-hegalak'] });
  reg('pit', 'sudur-hobitxoa', mixHex(FACE_COLOR.pit, SKIN, 0.15 * (1 - pose.color)), { groups: ['sudur-plakoda'] });
  reg('max', 'luzapen-maxilarra', tone(FACE_COLOR.max), {}, mixHex(tone(FACE_COLOR.max), ARCH_DEEP.i, 0.8));
  reg('mand', 'barail-luzapena', tone(FACE_COLOR.mand), {}, mixHex(tone(FACE_COLOR.mand), ARCH_DEEP.i, 0.8));
  reg('arch2', 'bigarren-arkua', tone(ARCH.ii), {}, mixHex(tone(ARCH.ii), ARCH_DEEP.ii, 0.8));
  reg('mouth', 'estomodeoa', FACE_COLOR.mouth);
  reg('membrane', 'mintz-bukofaringeoa', mixHex('#2a1216', FACE_COLOR.membrane, mem));
  reg('eye', 'begia', eyeC);
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
