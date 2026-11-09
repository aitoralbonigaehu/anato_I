import type { V3 } from '@/lib/three-d/math';
import { curve3, grid, type Mesh } from '@/lib/three-d/mesh';
import { staticMesh, vessel, type Parts } from '@/lib/three-d/organic';
import type { Item3 } from '@/lib/three-d/scene';
import { blobParts } from '@/components/scenes/week10/model3d';
import { ARCH, ARCH_DEEP, TISSUE, type PoseModel } from './common';

/**
 * Topic 17: the fetal head of the notes' p. 6 right figure, with the arches' muscles laid on it, each a sculpted
 * belly in its arch's colour. One solid head (a loft), the neck opened in front so the deep muscles show: pharynx,
 * larynx and hyoid stand free of the cervical column.
 *
 * Axes: x towards the embryo's LEFT, y cranial, z ventral. Muscles are patches in the head's own coordinates
 * (angle round the axis, 0 = the midline in front; height y), so they follow the surface; the ridges run with the
 * fibres. Each grows from its origin along its fibres (`m1`… 0..1). Bones wear the arch's colour with `b1`…
 */

export interface MusclePose {
  /** Muscles of each arch, grown along their fibres (0..1). */
  m1: number;
  /** Mylohyoid and the digastric's anterior belly (default m1). */
  m1b?: number;
  m2: number;
  /** Auricular, occipital (default m2). */
  m2b?: number;
  /** Digastric's posterior belly, stylohyoid (default m2). */
  m2c?: number;
  m3: number;
  m4: number;
  m6: number;
  platysma: number;
  /** Nerves of each arch, grown from the brainstem side (0..1). */
  n1: number;
  n2: number;
  n3: number;
  n4: number;
  n6: number;
  /** Bones and cartilages turned to their arch's colour (0..1). */
  b1: number;
  b2: number;
  b3: number;
  b4: number;
  /** The left plate of the thyroid cartilage swung open, to see the larynx's intrinsic muscles (0..1). */
  open: number;
}

export const MP0: MusclePose = { m1: 0, m1b: 0, m2b: 0, m2c: 0, m2: 0, m3: 0, m4: 0, m6: 0, platysma: 0, n1: 0, n2: 0, n3: 0, n4: 0, n6: 0, b1: 0, b2: 0, b3: 0, b4: 0, open: 0 };
export const MP_ALL: MusclePose = { m1: 1, m2: 1, m3: 1, m4: 1, m6: 1, platysma: 1, n1: 1, n2: 1, n3: 1, n4: 1, n6: 1, b1: 1, b2: 1, b3: 1, b4: 1, open: 0 };

export interface MuscleOpts {
  dim?: { ids: readonly string[]; k: number } | null;
}

type P2 = readonly [number, number];
type SF = (a: number, y: number) => V3;

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const PI = Math.PI;
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const addS = (a: V3, b: V3, k: number): V3 => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: V3): V3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const gauss = (x: number, y: number) => Math.exp(-(x * x + y * y));
const mixHex = (a: string, b: string, k: number) => {
  const p = (s: string, i: number) => parseInt(s.slice(i, i + 2), 16);
  const c = (i: number) => Math.round(lerp(p(a, i), p(b, i), clamp01(k)));
  return `#${[c(1), c(3), c(5)].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
};

/** The head's section at height y: centre z, half-width, front and back half-depth. */
const KEYS: readonly (readonly [number, number, number, number, number])[] = [
  [1.15, -0.3, 2.05, 2.2, 2.4],
  [0.6, -0.3, 2.0, 2.12, 2.35],
  [0.2, -0.3, 1.85, 2.02, 2.2],
  [-0.2, -0.25, 1.62, 1.98, 1.95],
  [-0.6, -0.2, 1.42, 1.9, 1.6],
  [-0.95, -0.15, 1.26, 1.85, 1.2],
  [-1.25, -0.15, 1.05, 1.75, 1.0],
  [-1.5, -0.3, 0.82, 1.05, 0.9],
  [-1.8, -0.82, 0.62, 0.4, 0.6],
  [-3.7, -0.85, 0.6, 0.4, 0.58],
];

function section(y: number): [number, number, number, number] {
  if (y >= 1.15) {
    const k = Math.sqrt(Math.max(0, 1 - ((y - 1.15) / 1.95) ** 2));
    return [-0.3, 2.05 * k, 2.2 * k, 2.4 * k];
  }
  let i = 0;
  while (i < KEYS.length - 2 && y < KEYS[i + 1][0]) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const u = clamp01((a[0] - y) / (a[0] - b[0]));
  const s = u * u * (3 - 2 * u);
  const w = lerp(u, s, 0.6);
  return [lerp(a[1], b[1], w), lerp(a[2], b[2], w), lerp(a[3], b[3], w), lerp(a[4], b[4], w)];
}

/** The head's surface: a = angle from the front midline (positive towards the embryo's left). */
const HEAD: SF = (a, y) => {
  const [cz, rx, rf, rb] = section(y);
  const ca = Math.cos(a);
  const d = 1 + 0.15 * gauss(a / 0.17, (y + 0.22) / 0.34) - 0.075 * gauss((Math.abs(a) - 0.62) / 0.22, (y - 0.33) / 0.2) + 0.03 * gauss((Math.abs(a) - 0.5) / 0.4, (y - 0.68) / 0.12) + 0.05 * gauss(a / 0.45, (y + 1.14) / 0.2);
  return [rx * Math.sin(a) * d, y, cz + (ca > 0 ? rf : rb) * ca * d];
};

/** The pharynx's wall, for the constrictors: a from the front. */
const PHAR: SF = (a, y) => [0.58 * Math.sin(a), y, 0.08 + 0.46 * Math.cos(a)];

/** A surface through four corners (a sheet in the open, the floor of the mouth). */
const quadSF = (c00: V3, c10: V3, c01: V3, c11: V3): SF => (a, y) => {
  const p0: V3 = [lerp(c00[0], c10[0], a), lerp(c00[1], c10[1], a), lerp(c00[2], c10[2], a)];
  const p1: V3 = [lerp(c01[0], c11[0], a), lerp(c01[1], c11[1], a), lerp(c01[2], c11[2], a)];
  return [lerp(p0[0], p1[0], y), lerp(p0[1], p1[1], y), lerp(p0[2], p1[2], y)];
};

function cat(keys: readonly P2[], u: number): [number, number] {
  const n = keys.length - 1;
  const x = clamp01(u) * n;
  const i = Math.min(n - 1, Math.floor(x));
  const t = x - i;
  const g = (k: number) => keys[Math.max(0, Math.min(n, k))];
  const f = (j: 0 | 1) => {
    const p0 = g(i - 1)[j];
    const p1 = g(i)[j];
    const p2 = g(i + 1)[j];
    const p3 = g(i + 2)[j];
    return 0.5 * (2 * p1 + (p2 - p0) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (3 * p1 - p0 - 3 * p2 + p3) * t * t * t);
  };
  return [f(0), f(1)];
}

interface PatchSpec {
  sf: SF;
  A: readonly P2[];
  B: readonly P2[];
  /** Belly height. */
  t: number;
  /** Number of fibre ridges. */
  fib?: number;
  /** Closed round (the orbicular muscles): no taper at the ends of u. */
  ring?: boolean;
  /** A point the belly bulges away from (default the axis at its height). */
  from?: (p: V3) => V3;
  /** Mirror x (the embryo's right). */
  mirror?: boolean;
  lift?: number;
}

const axisFrom = (p: V3): V3 => [0, p[1], -0.2];

function patchAt(sp: PatchSpec, g: number) {
  const m = sp.mirror ? -1 : 1;
  const from = sp.from ?? axisFrom;
  const point = (u: number, v: number): { p: V3; n: V3 } => {
    const U = u * g;
    const a = cat(sp.A, U);
    const b = cat(sp.B, U);
    const q: [number, number] = [lerp(a[0], b[0], v), lerp(a[1], b[1], v)];
    const base = sp.sf(q[0], q[1]);
    const e = 0.012;
    let n = norm(cross(sub(sp.sf(q[0] + e, q[1]), base), sub(sp.sf(q[0], q[1] + e), base)));
    const out = sub(base, from(base));
    if (n[0] * out[0] + n[1] * out[1] + n[2] * out[2] < 0) n = [-n[0], -n[1], -n[2]];
    return { p: base, n };
  };
  const at = (u: number, v: number): V3 => {
    const { p, n } = point(u, v);
    const ev = Math.sin(PI * v) ** 0.6;
    const eu = sp.ring ? 1 : Math.sin(PI * clamp01(u)) ** 0.5;
    const fib = sp.fib ?? 7;
    const h = sp.t * eu * ev * (1 + 0.14 * ev * Math.cos(2 * PI * fib * v)) - 0.02 + (sp.lift ?? 0);
    const r = addS(p, n, h);
    return m < 0 ? [-r[0], r[1], r[2]] : r;
  };
  const mid = point(0.5, 0.5);
  const f = addS(mid.p, mid.n, 30);
  return { at, facing: (m < 0 ? [-f[0], f[1], f[2]] : f) as V3 };
}

function patch(key: string, sp: PatchSpec, g: number): Parts {
  const gq = Math.max(0.05, Math.round(clamp01(g) * 24) / 24);
  const build = (nu: number, nv: number): Mesh => {
    const { at, facing } = patchAt(sp, gq);
    return grid(nu, nv, at, facing);
  };
  const nv = Math.min(90, (sp.fib ?? 7) * 8);
  return { mesh: staticMesh('m17-' + key, [gq], () => build(30, nv)), hit: staticMesh('m17h-' + key, [gq], () => build(10, 10)) };
}

/** A round belly in the open: spindle-shaped along its line. */
function spindle(key: string, line: V3[], r: number, g: number, mirror: boolean, flat = 0): Parts {
  const gq = Math.max(0.05, Math.round(clamp01(g) * 24) / 24);
  const L = line.map((p): V3 => (mirror ? [-p[0], p[1], p[2]] : p));
  // The grown length, in segments of the line (a short line may have fewer than two).
  const n = Math.min(L.length - 1, Math.max(1, (L.length - 1) * gq));
  const mk = (sides: number, rings: number): Mesh =>
    grid(rings, sides, (u, v) => {
      const x = u * n;
      const i = Math.min(L.length - 2, Math.floor(x));
      const c: V3 = [lerp(L[i][0], L[i + 1][0], x - i), lerp(L[i][1], L[i + 1][1], x - i), lerp(L[i][2], L[i + 1][2], x - i)];
      const d = norm(sub(L[Math.min(L.length - 1, i + 1)], L[i]));
      const s = norm(cross(d, Math.abs(d[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0]));
      const t = cross(d, s);
      const rad = r * Math.max(0.04, Math.sin(PI * u) ** 0.65);
      const a = v * 2 * PI;
      return [c[0] + rad * (Math.cos(a) * s[0] * (1 - flat) + Math.sin(a) * t[0]), c[1] + rad * (Math.cos(a) * s[1] * (1 - flat) + Math.sin(a) * t[1]), c[2] + rad * (Math.cos(a) * s[2] * (1 - flat) + Math.sin(a) * t[2])];
    });
  // A closed tube: outward winding is what `grid` gives for this (u along, v round) order after the check below.
  const fixed = (m: Mesh): Mesh => {
    const ia = m.idx[0] * 3;
    const ib = m.idx[1] * 3;
    const ic = m.idx[2] * 3;
    const P = (i: number): V3 => [m.pos[i], m.pos[i + 1], m.pos[i + 2]];
    const nn = cross(sub(P(ib), P(ia)), sub(P(ic), P(ia)));
    const i0 = (Math.floor(m.pos.length / 6) - 0) * 3;
    const lineMid = L[Math.floor(L.length * 0.5)];
    if (nn[0] * (m.pos[ia] - lineMid[0]) + nn[1] * (m.pos[ia + 1] - lineMid[1]) + nn[2] * (m.pos[ia + 2] - lineMid[2]) < 0 && i0 >= 0) {
      const idx = new Uint32Array(m.idx);
      for (let i = 0; i < idx.length; i += 3) {
        const t = idx[i + 1];
        idx[i + 1] = idx[i + 2];
        idx[i + 2] = t;
      }
      const nrm = new Float32Array(m.nrm.length);
      for (let i = 0; i < nrm.length; i++) nrm[i] = -m.nrm[i];
      return { ...m, idx, nrm };
    }
    return m;
  };
  return { mesh: staticMesh('m17s-' + key, [gq, mirror ? 1 : 0], () => fixed(mk(14, 26))), hit: staticMesh('m17sh-' + key, [gq, mirror ? 1 : 0], () => fixed(mk(6, 8))) };
}

const LINE = (keys: V3[], n = 24) => curve3(keys, n);
const X = (s: number, p: V3): V3 => [s * p[0], p[1], p[2]];

// ———— the muscles' shapes (the embryo's left; the right mirrors) ————
const SP = {
  masseter: { sf: HEAD, A: [[1.0, -0.14], [0.9, -0.6], [0.86, -1.1]], B: [[1.42, -0.14], [1.5, -0.6], [1.42, -1.02]], t: 0.16, fib: 7 },
  temporal: { sf: HEAD, A: [[1.2, -0.02], [0.86, 0.7], [0.92, 1.55]], B: [[1.44, -0.02], [2.0, 0.55], [1.9, 1.55]], t: 0.12, fib: 11 },
  frontal: { sf: HEAD, A: [[0.05, 0.74], [0.05, 1.3], [0.08, 1.95]], B: [[0.86, 0.74], [0.78, 1.3], [0.62, 1.95]], t: 0.07, fib: 9 },
  occipital: { sf: HEAD, A: [[2.5, 0.25], [2.5, 0.7], [2.5, 1.2]], B: [[3.08, 0.25], [3.08, 0.7], [3.08, 1.2]], t: 0.08, fib: 6 },
  buccinator: { sf: HEAD, A: [[0.42, -0.62], [0.7, -0.5], [0.98, -0.46]], B: [[0.42, -0.86], [0.7, -0.96], [0.98, -1.0]], t: 0.07, fib: 7 },
  zygomaticus: { sf: HEAD, A: [[0.36, -0.54], [0.66, -0.3], [0.94, -0.02]], B: [[0.44, -0.6], [0.76, -0.34], [1.02, -0.08]], t: 0.075, fib: 2 },
  levator: { sf: HEAD, A: [[0.17, -0.5], [0.24, -0.15], [0.32, 0.12]], B: [[0.28, -0.5], [0.36, -0.15], [0.44, 0.12]], t: 0.06, fib: 2 },
  auricAnt: { sf: HEAD, A: [[1.56, 0.06], [1.46, 0.15], [1.34, 0.26]], B: [[1.56, -0.12], [1.42, -0.04], [1.24, 0.02]], t: 0.08, fib: 3, lift: 0.12 },
  auricSup: { sf: HEAD, A: [[1.64, 0.3], [1.52, 0.65], [1.44, 1.0]], B: [[1.84, 0.3], [2.02, 0.65], [2.12, 1.0]], t: 0.08, fib: 5, lift: 0.1 },
  auricPost: { sf: HEAD, A: [[2.0, 0.02], [2.3, 0.05], [2.48, 0.12]], B: [[2.0, -0.28], [2.3, -0.28], [2.48, -0.2]], t: 0.08, fib: 3 },
} satisfies Record<string, Omit<PatchSpec, 'mirror'>>;

/** A ring in head coordinates round a centre. */
function ring(ca: number, cy: number, rA0: number, rY0: number, rA1: number, rY1: number): { A: P2[]; B: P2[] } {
  const A: P2[] = [];
  const B: P2[] = [];
  for (let i = 0; i <= 24; i++) {
    const t = (i / 24) * 2 * PI;
    A.push([ca + rA0 * Math.cos(t), cy + rY0 * Math.sin(t)]);
    B.push([ca + rA1 * Math.cos(t), cy + rY1 * Math.sin(t)]);
  }
  return { A, B };
}
const OCULI = ring(0.62, 0.33, 0.17, 0.13, 0.42, 0.34);
const ORIS = ring(0, -0.72, 0.13, 0.05, 0.44, 0.26);

// ———— lines ————
const DIG_POST = LINE([[1.42, -0.6, -0.88], [1.22, -1.14, -0.5], [0.86, -1.62, 0.26], [0.46, -1.86, 0.74]], 26);
const DIG_ANT = LINE([[0.42, -1.86, 0.8], [0.34, -1.74, 1.02], [0.2, -1.5, 1.34]], 22);
const STYLOHY = LINE([[1.2, -0.84, -0.5], [1.02, -1.26, -0.08], [0.76, -1.58, 0.36], [0.56, -1.8, 0.66]], 22);
const STYLOID = LINE([[1.3, -0.56, -0.66], [1.14, -0.92, -0.42], [0.98, -1.26, -0.22]], 12);
const STYLOPH = LINE([[1.06, -1.18, -0.38], [0.84, -1.5, -0.2], [0.62, -1.96, 0.02]], 18);
const MANDIBLE_AY: P2[] = [[1.5, -0.98], [1.2, -1.14], [0.8, -1.2], [0.4, -1.22], [0, -1.24]];
const HYOID_BODY = LINE([[-0.42, -1.92, 0.76], [-0.24, -1.94, 0.88], [0, -1.95, 0.93], [0.24, -1.94, 0.88], [0.42, -1.92, 0.76]], 18);
const horn = (s: number) => LINE([X(s, [0.42, -1.92, 0.76]), X(s, [0.62, -1.88, 0.42]), X(s, [0.76, -1.78, 0.08])], 12);
const lessHorn = (s: number) => LINE([X(s, [0.4, -1.92, 0.76]), X(s, [0.5, -1.74, 0.7])], 8);

/** Rotate a point about the thyroid's front edge (the plate opening like a door). */
function door(p: V3, k: number): V3 {
  const a = 1.5 * k;
  const c = Math.cos(a);
  const s = Math.sin(a);
  const ox = 0;
  const oz = 0.9;
  const dx = p[0] - ox;
  const dz = p[2] - oz;
  return [ox + dx * c + dz * s, p[1], oz - dx * s + dz * c];
}

export function muscleModel(pose: MusclePose): PoseModel {
  const items: Item3[] = [];
  const pts: Record<string, V3> = {};

  // ———— the solid head and the neck's column ————
  items.push({
    key: 'head',
    mesh: staticMesh('m17-head', [3], () => grid(120, 110, (u, v) => (v < 0.3 ? HEAD(-PI + u * 2 * PI, 1.15 + 1.95 * Math.cos((v / 0.3) * (PI / 2))) : HEAD(-PI + u * 2 * PI, 1.15 - ((v - 0.3) / 0.7) * 4.85)), [0, 0, 50])),
    hit: staticMesh('m17-headh', [3], () => grid(36, 30, (u, v) => (v < 0.3 ? HEAD(-PI + u * 2 * PI, 1.15 + 1.95 * Math.cos((v / 0.3) * (PI / 2))) : HEAD(-PI + u * 2 * PI, 1.15 - ((v - 0.3) / 0.7) * 4.85)), [0, 0, 50])),
    color: '#f0dcc4',
    deep: '#9a7a5e',
    tissue: 'bone',
    quiet: true,
    ground: true,
  });
  for (const s of [-1, 1]) {
    const c = HEAD(s * 0.62, 0.33);
    items.push({ key: `eye${s}`, ...blobParts({ center: [c[0] * 0.98, c[1], c[2] - 0.03], radii: [0.17, 0.13, 0.08] }), color: '#3a2b30', deep: '#120a0d', tissue: 'skin', quiet: true, ground: true });
    const e = HEAD(s * 1.74, -0.14);
    items.push({ key: `ear${s}`, ...blobParts({ center: [e[0] * 1.05, e[1], e[2]], radii: [0.08, 0.34, 0.2] }), color: TISSUE.skin, deep: TISSUE.skinDeep, tissue: 'skin', quiet: true, ground: true });
  }

  // ———— pharynx, larynx, trachea ————
  items.push({ key: 'pharynx', ...vessel(LINE([[0, -1.2, 0.08], [0, -2.2, 0.08], [0, -3.1, 0.02], [0, -3.7, -0.05]], 20), { r0: 0.46, r1: 0.3, flat: 0.1, sides: 28, n: 26, capStart: true, capEnd: true })!, color: '#e0a79a', deep: '#8c5145', tissue: 'mesenchyme', quiet: true, ground: true });
  items.push({ key: 'airway', ...vessel(LINE([[0, -2.3, 0.62], [0, -3.0, 0.6], [0, -3.7, 0.56]], 16), { r0: 0.26, sides: 22, n: 18, capStart: true, capEnd: true })!, color: '#d7ded8', deep: '#7c8a80', tissue: 'cartilage', quiet: true, ground: true });

  // ———— bones and cartilages, neutral until their arch's row tints them ————
  const bone = (k: number, arch: keyof typeof ARCH) => mixHex('#efe2c8', ARCH[arch], k);
  const boneDeep = (k: number, arch: keyof typeof ARCH_DEEP) => mixHex('#94866a', ARCH_DEEP[arch], k);
  const bonePatch = (key: string, id: string, A: P2[], B: P2[], k: number, arch: keyof typeof ARCH_DEEP) => {
    for (const mirror of [false, true]) items.push({ key: key + (mirror ? 'R' : 'L'), id, ...patch('b-' + key, { sf: HEAD, A, B, t: 0.05, fib: 1, mirror }, 1), color: bone(k, arch), deep: boneDeep(k, arch), tissue: 'bone', outline: false });
  };
  bonePatch('mand', 'baraila', MANDIBLE_AY, MANDIBLE_AY.map(([a, y]): P2 => [a, y + 0.3]), pose.b1, 'i');
  bonePatch('maxi', 'hezur-maxilarra', [[0.14, -0.42], [0.5, -0.4], [0.88, -0.32]], [[0.14, -0.02], [0.42, 0.02], [0.88, 0.0]], pose.b1, 'i');
  bonePatch('zygo', 'zigomatikoa', [[0.92, -0.14], [1.2, -0.12], [1.52, -0.1]], [[0.92, 0.04], [1.2, 0.03], [1.52, 0.02]], pose.b1, 'i');
  bonePatch('squa', 'tenporalaren-ezkata', [[1.3, 0.05], [1.65, 0.05], [2.0, 0.05]], [[1.3, 0.72], [1.65, 0.86], [2.0, 0.72]], pose.b1, 'i');
  pts['baraila'] = HEAD(0.95, -1.05);
  pts['hezur-maxilarra'] = HEAD(0.45, -0.2);
  pts['zigomatikoa'] = HEAD(1.2, -0.05);
  pts['tenporalaren-ezkata'] = HEAD(1.66, 0.45);
  const hb = (key: string, id: string, line: V3[], r: number, k: number, arch: keyof typeof ARCH_DEEP) => items.push({ key, id, ...vessel(line, { r0: r, r1: r * 0.8, sides: 14, n: 14, capStart: true, capEnd: true })!, color: bone(k, arch), deep: boneDeep(k, arch), tissue: 'bone' });
  hb('styL', 'estiloide-apofisia', STYLOID, 0.06, pose.b2, 'ii');
  hb('styR', 'estiloide-apofisia', STYLOID.map((p) => X(-1, p)), 0.06, pose.b2, 'ii');
  pts['estiloide-apofisia'] = STYLOID[6];
  hb('hyoidUp', 'hioide-gorputza', HYOID_BODY.map((p): V3 => [p[0], p[1] + 0.05, p[2]]), 0.075, pose.b2, 'ii');
  hb('hyoidLo', 'hioide-gorputza', HYOID_BODY.map((p): V3 => [p[0], p[1] - 0.06, p[2]]), 0.075, pose.b3, 'iii');
  pts['hioide-gorputza'] = [0, -1.95, 1.0];
  for (const s of [-1, 1]) {
    hb(`gh${s}`, 'hioide-adar-nagusia', horn(s), 0.06, pose.b3, 'iii');
    hb(`lh${s}`, 'hioide-adar-txikia', lessHorn(s), 0.05, pose.b2, 'ii');
  }
  pts['hioide-adar-nagusia'] = horn(1)[8];
  pts['hioide-adar-txikia'] = lessHorn(1)[7];

  // The thyroid cartilage: two plates meeting in front; the left swings open.
  const openQ = Math.round(clamp01(pose.open) * 24) / 24;
  const THY: SF = (a, y) => [0.46 * Math.sin(a), y, 0.42 + 0.48 * Math.cos(a)];
  for (const mirror of [false, true]) {
    const k = mirror ? 0 : openQ;
    const sf: SF = (a, y) => door(THY(a, y), k);
    items.push({ key: 'thy' + (mirror ? 'R' : 'L'), id: 'tiroide-kartilagoa', ...staticMesh2('thy' + (mirror ? 'R' : 'L'), k, () => patchAt({ sf, A: [[0.0, -2.72], [0.8, -2.66], [1.5, -2.6]], B: [[0.0, -2.08], [0.8, -2.04], [1.5, -2.0]], t: 0.07, fib: 1, mirror, from: (p) => [0, p[1], 0.42] }, 1)), color: bone(pose.b4, 'iv'), deep: boneDeep(pose.b4, 'iv'), tissue: 'cartilage' });
  }
  pts['tiroide-kartilagoa'] = [0.34, -2.32, 0.86];
  items.push({ key: 'cric', id: 'krikoide-kartilagoa', ...vessel(LINE([[0, -2.76, 0.56], [0, -2.94, 0.56]], 6), { r0: 0.34, flat: 0, sides: 26, n: 8, capStart: true, capEnd: true })!, color: bone(pose.b4, 'vi'), deep: boneDeep(pose.b4, 'vi'), tissue: 'cartilage' });
  pts['krikoide-kartilagoa'] = [0.26, -2.86, 0.82];

  // ———— muscles ————
  const mus = (key: string, id: string, p: Parts, arch: keyof typeof ARCH_DEEP, groups?: string[]) => items.push({ key, id, groups, ...p, color: ARCH[arch], deep: ARCH_DEEP[arch], tissue: 'muscle', outline: true });
  const both = (name: string, id: string, sp: Omit<PatchSpec, 'mirror'>, g: number, arch: keyof typeof ARCH_DEEP, groups?: string[]) => {
    if (g <= 0.01) return;
    for (const mirror of [false, true]) mus(name + (mirror ? 'R' : 'L'), id, patch(name + (mirror ? 'R' : 'L'), { ...sp, mirror }, g), arch, groups);
  };
  const tubes = (name: string, id: string, line: V3[], r: number, g: number, arch: keyof typeof ARCH_DEEP, groups?: string[], flat = 0) => {
    if (g <= 0.01) return;
    for (const mirror of [false, true]) mus(name + (mirror ? 'R' : 'L'), id, spindle(name, line, r, g, mirror, flat), arch, groups);
  };

  // Arch I
  both('temporal', 'muskulu-tenporala', SP.temporal, pose.m1, 'i', ['murtxikatzaileak']);
  both('masseter', 'maseteroa', SP.masseter, pose.m1, 'i', ['murtxikatzaileak']);
  const m1b = pose.m1b ?? pose.m1;
  const m2b = pose.m2b ?? pose.m2;
  const m2c = pose.m2c ?? pose.m2;
  tubes('digA', 'digastrikoaren-aurreko-sabela', DIG_ANT, 0.135, m1b, 'i', ['digastrikoa']);
  if (m1b > 0.01) {
    const MYLO = quadSF([0, -1.92, 0.86], [0.76, -1.62, 0.34], [0, -1.5, 1.32], [0.82, -1.34, 0.98]);
    const dn = (p: V3): V3 => [p[0], p[1] + 2, p[2]];
    for (const mirror of [false, true]) mus('mylo' + (mirror ? 'R' : 'L'), 'milohioideoa', patch('mylo' + (mirror ? 'R' : 'L'), { sf: MYLO, A: [[0, 0.02], [0.5, 0.02], [1, 0.02]], B: [[0, 0.98], [0.5, 0.98], [1, 0.98]], t: 0.08, fib: 7, mirror, from: dn }, m1b), 'i');
  }
  pts['muskulu-tenporala'] = HEAD(1.45, 1.0);
  pts['maseteroa'] = HEAD(1.2, -0.62);
  pts['digastrikoaren-aurreko-sabela'] = DIG_ANT[11];
  pts['milohioideoa'] = [0.42, -1.72, 0.86];

  // Arch II
  const mim = ['muskulu-mimikoak'];
  both('frontal', 'muskulu-mimikoak', SP.frontal, pose.m2, 'ii', mim);
  both('buccin', 'muskulu-mimikoak', SP.buccinator, pose.m2, 'ii', mim);
  both('zygom', 'muskulu-mimikoak', SP.zygomaticus, pose.m2, 'ii', mim);
  both('levat', 'muskulu-mimikoak', SP.levator, pose.m2, 'ii', mim);
  both('oculi', 'begietako-orbikularra', { sf: HEAD, ...OCULI, t: 0.075, fib: 6, ring: true }, pose.m2, 'ii', mim);
  if (pose.m2 > 0.01) mus('oris', 'ahoko-orbikularra', patch('oris', { sf: HEAD, ...ORIS, t: 0.09, fib: 6, ring: true }, pose.m2), 'ii', mim);
  both('occip', 'okzipitala', SP.occipital, m2b, 'ii');
  both('aurA', 'muskulu-aurikularrak', SP.auricAnt, m2b, 'ii');
  both('aurS', 'muskulu-aurikularrak', SP.auricSup, m2b, 'ii');
  both('aurP', 'muskulu-aurikularrak', SP.auricPost, m2b, 'ii');
  tubes('digP', 'digastrikoaren-atzeko-sabela', DIG_POST, 0.135, m2c, 'ii', ['digastrikoa']);
  tubes('stylohy', 'estilohioideoa', STYLOHY, 0.06, m2c, 'ii');
  pts['muskulu-mimikoak'] = HEAD(0.4, 1.2);
  pts['begietako-orbikularra'] = HEAD(0.82, 0.42);
  pts['ahoko-orbikularra'] = HEAD(0.26, -0.72);
  pts['okzipitala'] = HEAD(2.8, 0.75);
  pts['muskulu-aurikularrak'] = HEAD(1.8, 0.7);
  pts['digastrikoaren-atzeko-sabela'] = DIG_POST[11];
  pts['estilohioideoa'] = STYLOHY[9];
  if (m1b > 0.5 && m2c > 0.5) {
    // The intermediate tendon: one muscle, two origins.
    for (const s of [-1, 1]) items.push({ key: `tend${s}`, ...vessel(LINE([X(s, [0.47, -1.87, 0.72]), X(s, [0.44, -1.88, 0.77]), X(s, [0.42, -1.87, 0.82])], 6), { r0: 0.06, sides: 12, n: 6, capStart: true, capEnd: true })!, color: '#f4efe2', deep: '#a39a84', tissue: 'tendon', quiet: true });
  }
  // The platysma: a sheet under the neck's skin, drawn on the embryo's right only (as the notes' figure), so the left stays open.
  if (pose.platysma > 0.01) {
    const NECK: SF = (a, y) => [1.22 * Math.sin(a), y, -0.2 + 1.38 * Math.cos(a)];
    mus('platysma', 'platisma', patch('platysma', { sf: NECK, A: [[0.12, -1.42], [0.16, -2.4], [0.2, -3.6]], B: [[1.45, -1.3], [1.75, -2.4], [2.0, -3.6]], t: 0.05, fib: 14, mirror: true, from: (p) => [0, p[1], -0.2] }, pose.platysma), 'ii');
    pts['platisma'] = [-1.02, -2.5, 0.35];
  }

  // Arch III
  const ph = (p: V3): V3 => [0, p[1], 0.08];
  tubes('styloph', 'estilofaringeoa', STYLOPH, 0.075, pose.m3, 'iii');
  pts['estilofaringeoa'] = STYLOPH[9];
  both('consU', 'goiko-ertzatzailea', { sf: PHAR, A: [[0.9, -1.64], [1.9, -1.62], [3.13, -1.5]], B: [[0.9, -1.24], [1.9, -1.2], [3.13, -1.08]], t: 0.055, fib: 7, from: ph }, pose.m3, 'iii', ['ertzatzaileak']);
  pts['goiko-ertzatzailea'] = PHAR(2.0, -1.42);
  // Arches IV, VI
  both('consM', 'tarteko-ertzatzailea', { sf: PHAR, A: [[0.7, -2.12], [1.9, -2.14], [3.13, -2.1]], B: [[0.7, -1.62], [1.9, -1.56], [3.13, -1.42]], t: 0.075, fib: 7, from: ph, lift: 0.04 }, pose.m4, 'iv', ['ertzatzaileak']);
  both('consI', 'beheko-ertzatzailea', { sf: PHAR, A: [[0.8, -2.86], [1.9, -2.86], [3.13, -2.88]], B: [[0.8, -2.14], [1.9, -2.08], [3.13, -2.02]], t: 0.09, fib: 9, from: ph, lift: 0.04 }, pose.m4, 'iv', ['ertzatzaileak']);
  pts['tarteko-ertzatzailea'] = PHAR(1.9, -1.84);
  pts['beheko-ertzatzailea'] = PHAR(1.9, -2.48);
  tubes('cricothy', 'krikotiroidea', LINE([[0.2, -2.86, 0.92], [0.34, -2.72, 0.86], [0.46, -2.6, 0.72]], 12), 0.085, pose.m4, 'iv');
  pts['krikotiroidea'] = [0.36, -2.72, 0.9];
  // The intrinsic muscles: on the airway, behind the thyroid plate.
  const intr = (name: string, line: V3[], r: number) => {
    if (pose.m6 <= 0.01) return;
    mus(name + 'L', 'laringe-barneko-muskuluak', spindle(name, line, r, pose.m6, false), 'vi');
    mus(name + 'R', 'laringe-barneko-muskuluak', spindle(name, line, r, pose.m6, true), 'vi');
  };
  intr('intTA', LINE([[0.12, -2.42, 0.86], [0.2, -2.44, 0.62], [0.22, -2.46, 0.38]], 12), 0.08);
  intr('intLCA', LINE([[0.3, -2.72, 0.66], [0.3, -2.6, 0.5], [0.24, -2.5, 0.36]], 12), 0.07);
  intr('intPCA', LINE([[0.14, -2.84, 0.28], [0.2, -2.68, 0.28], [0.25, -2.52, 0.31]], 12), 0.085);
  pts['laringe-barneko-muskuluak'] = [0.26, -2.5, 0.56];

  // ———— nerves, in their arch's colour, bright ————
  const nerve = (key: string, id: string, keys: V3[], g: number, arch: keyof typeof ARCH_DEEP, r = 0.04) => {
    if (g <= 0.01) return;
    const gq = Math.round(clamp01(g) * 24) / 24;
    for (const s of [1, -1]) {
      const p = vessel(LINE(keys.map((k) => X(s, k)), 24), { r0: r, r1: r * 0.6, sides: 10, n: 28, capStart: true, capEnd: true }, gq);
      if (p) items.push({ key: key + s, id, ...p, color: mixHex(ARCH[arch], '#ffffff', 0.28), deep: ARCH_DEEP[arch], tissue: 'nerve' });
    }
  };
  const above = (a: number, y: number, h = 0.17): V3 => {
    const p = HEAD(a, y);
    return addS(p, norm(sub(p, axisFrom(p))), h);
  };
  nerve('v3a', 'barail-nerbioa', [above(1.6, 0.0), above(1.45, -0.4), above(1.24, -0.8), above(1.05, -1.1)], pose.n1, 'i');
  nerve('v3b', 'barail-nerbioa', [above(1.45, -0.4), [0.98, -1.48, 0.55], [0.5, -1.62, 1.1]], pose.n1, 'i', 0.032);
  nerve('v3c', 'barail-nerbioa', [above(1.5, -0.05), above(1.5, 0.5, 0.2), above(1.45, 1.0, 0.2)], pose.n1, 'i', 0.03);
  pts['barail-nerbioa'] = above(1.24, -0.8);
  nerve('v7a', 'aurpegi-nerbioa', [above(1.9, -0.55), above(1.45, -0.25), above(0.9, 0.55), above(0.62, 1.0)], pose.n2, 'ii');
  nerve('v7b', 'aurpegi-nerbioa', [above(1.9, -0.55), above(1.4, -0.4), above(0.8, -0.36), above(0.42, -0.5)], pose.n2, 'ii', 0.032);
  nerve('v7c', 'aurpegi-nerbioa', [above(1.9, -0.55), above(1.45, -0.72), above(0.9, -0.82), above(0.42, -1.0)], pose.n2, 'ii', 0.032);
  nerve('v7d', 'aurpegi-nerbioa', [above(1.9, -0.55), [1.28, -1.18, -0.45], [1.05, -1.5, 0.2]], pose.n2, 'ii', 0.03);
  pts['aurpegi-nerbioa'] = above(1.45, -0.25);
  nerve('n9', 'glosofaringeoa', [[1.22, -0.98, -0.62], [0.98, -1.34, -0.36], [0.74, -1.72, -0.1], [0.5, -2.0, 0.42]], pose.n3, 'iii');
  pts['glosofaringeoa'] = [0.98, -1.34, -0.36];
  nerve('n10', 'bagoa', [[1.18, -1.2, -0.72], [0.92, -2.0, -0.42], [0.82, -3.0, -0.26], [0.72, -3.7, -0.18]], pose.n4, 'iv', 0.055);
  pts['bagoa'] = [0.86, -2.8, -0.3];
  nerve('slar', 'goiko-laringe-nerbioa', [[1.05, -1.62, -0.56], [0.86, -2.02, 0.06], [0.62, -2.24, 0.62], [0.38, -2.5, 0.9]], pose.n4, 'iv', 0.04);
  pts['goiko-laringe-nerbioa'] = [0.72, -2.18, 0.42];
  nerve('rlar', 'laringe-atzerakaria', [[0.78, -3.52, -0.22], [0.5, -3.66, 0.12], [0.34, -3.3, 0.36], [0.3, -2.88, 0.36]], pose.n6, 'vi', 0.04);
  pts['laringe-atzerakaria'] = [0.42, -3.34, 0.34];

  pts['digastrikoa'] = [0.46, -1.9, 0.84];
  return { items, pts };
}

function staticMesh2(key: string, k: number, mk: () => { at: (u: number, v: number) => V3; facing: V3 }): Parts {
  const q = Math.round(k * 24);
  return {
    mesh: staticMesh('m17t-' + key, [q], () => {
      const { at, facing } = mk();
      return grid(24, 20, at, facing);
    }),
    hit: staticMesh('m17th-' + key, [q], () => {
      const { at, facing } = mk();
      return grid(8, 8, at, facing);
    }),
  };
}
