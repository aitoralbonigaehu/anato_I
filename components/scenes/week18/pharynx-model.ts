import { add, mix3, type V3 } from '@/lib/three-d/math';
import { curve3, grid, type Mesh } from '@/lib/three-d/mesh';
import { cachedMesh } from '@/lib/three-d/mesh-cache';
import { bean, mergeParts, vessel, type Parts, type VesselOptions } from '@/lib/three-d/organic';
import type { Item3 } from '@/lib/three-d/scene';
import { blobParts, mixHex } from '@/components/scenes/week10/model3d';
import { ARCH, ARCH_DEEP, TISSUE } from '@/components/scenes/week17/common';

/**
 * The pharyngeal gut as one object (topic 17 §2 and topic 18 §1): the notes' dorsal "V" with its roof taken away.
 * The dorsal wall is cut off in a coronal plane (z = 0), so the viewer looks from behind into the hollow gut: on
 * the cut the arches stand in section, ectoderm outside, endoderm inside, mesenchyme between (and in it the
 * artery, the vein, the nerve and the cartilage, which are real arcs running round the gut inside the wall); past
 * the cut lies the floor of the pharynx.
 *
 * Everything comes from one contour pair per side, inner (lumen) and outer (skin), as the rows of one grid:
 * the cut's bands are strips between the two, the floor and the body's outside are those same contours swept round
 * to the ventral midline. So a pouch that deepens, a cleft that sinks or arch II growing over the clefts is one
 * shape changing, never a swap. Pouches bud on it (vessels grown by arc length) and the glands then go down from
 * it. `peelL`/`peelR` thin one side's wall away onto its endoderm, leaving the bare endodermal cast with the aortic
 * arches between its pouches: a side can be dissected while the other keeps its layers.
 *
 * Axes: x towards the embryo's LEFT, y cranial, z ventral. From behind (yaw 180) the embryo's left is on the
 * viewer's left, as the notes' dorsal figures are read.
 *
 * Colours: arches wear their arch's colour (ARCH), which `tissue` turns into the notes' section colours. Pouches'
 * derivatives share a colour per pouch (POUCH), so the pouch → derivative mapping is what the eye sees.
 */

export const POUCH = {
  /** First pouch: the tube and the tympanic cavity. */
  p1: '#a8d94a',
  p1Deep: '#55761a',
  /** Second pouch: the palatine tonsil. */
  p2: '#f59bb0',
  p2Deep: '#94465a',
  /** Third pouch: the inferior parathyroid and the thymus. */
  p3: '#c05fe0',
  p3Deep: '#5f2580',
  /** Fourth pouch: the superior parathyroid and the ultimobranchial body. */
  p4: '#1fc8b4',
  p4Deep: '#0d6a60',
} as const;

export interface PharynxPose {
  /** How deep the clefts (outside) and the pouches (inside) are: 0 a smooth wall, 1 the formed arches. */
  clefts: number;
  pouches: number;
  /** Arch V: a low ridge between IV and VI, which comes and goes. */
  v5: number;
  /** The cut's colours: 0 each arch its colour; 1 the notes' tissue colours (mesenchyme brown). */
  tissue: number;
  /** What each arch holds: grown in along it (0..1 each). */
  art: number;
  vein: number;
  nerve: number;
  cart: number;
  /** Neural crest cells streaming into the arches (0..1), and the cells of the mesenchyme shown. */
  crest: number;
  cells: number;
  /** One side's wall thinned away onto its endoderm (0..1). */
  peelL: number;
  peelR: number;
  /** The aortic arches run on behind the cut to the dorsal aortae, and the sac they leave (0..1). */
  aortic: number;
  /** The laryngeal orifice shown (0..1). */
  larynx: number;
  /** First pouch: the recess deepens into a tube (0..1), its end widens (0..1), the ossicles move in (0..1). */
  p1: number;
  cav: number;
  ossicles: number;
  /** First cleft sinks to the pouch (0..1). */
  c1: number;
  /** The second pouch's tonsil (0..1) and its lymphoid tissue (0..1). */
  tonsil: number;
  lymph: number;
  /** Third pouch: its two wings bud (0..1): dorsal → inferior parathyroid, ventral → thymus. */
  p3d: number;
  p3v: number;
  /** Fourth pouch: dorsal → superior parathyroid, ventral → ultimobranchial body. */
  p4d: number;
  p4v: number;
  /** Arch II grows down over the clefts (0..1). */
  flap: number;
  /** The space under it closes: the clefts are gone, the tissue is solid (0..1). */
  close: number;
  /** The rare case: a sinus stays (0..1), fills with fluid (0..1), a needle draws it off (0..1). */
  persist: number;
  fluid: number;
  needle: number;
  /** The neck lengthens below the arches (0..1). */
  neck: number;
  /** The glands go down (0..1); the thymus's two halves meet (0..1). */
  descend: number;
  meet: number;
  /** The thyroid in its place (0..1), the ultimobranchial body taken into it (0..1), the larynx's cartilages (0..1). */
  thyroid: number;
  ubIn: number;
  cartil: number;
}

export const PH0: PharynxPose = {
  clefts: 1, pouches: 1, v5: 0, tissue: 0, art: 0, vein: 0, nerve: 0, cart: 0, crest: 0, cells: 0, peelL: 0, peelR: 0, aortic: 0, larynx: 1,
  p1: 0, cav: 0, ossicles: 0, c1: 0, tonsil: 0, lymph: 0, p3d: 0, p3v: 0, p4d: 0, p4v: 0, flap: 0, close: 0, persist: 0, fluid: 0, needle: 0,
  neck: 0, descend: 0, meet: 0, thyroid: 0, ubIn: 0, cartil: 0,
};

export interface PharynxOpts {
  dim?: { ids: readonly string[]; k: number } | null;
}

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const ss = (a: number, b: number, x: number) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const gauss = (d: number, w: number) => Math.exp(-(d * d) / (w * w));
const L = (k: readonly V3[], n = 24) => curve3(k as V3[], n);
const SX = (s: number, p: V3): V3 => [s * p[0], p[1], p[2]];

/** A smooth curve through knots (x sorted from high to low: Catmull-Rom on the values). */
const curveOf = (K: readonly (readonly [number, number])[]) => (y: number) => {
  if (y >= K[0][0]) return K[0][1];
  if (y <= K[K.length - 1][0]) return K[K.length - 1][1];
  let i = 0;
  while (y < K[i + 1][0]) i++;
  const p0 = K[Math.max(0, i - 1)][1], p1 = K[i][1], p2 = K[i + 1][1], p3 = K[Math.min(K.length - 1, i + 2)][1];
  const u = (K[i][0] - y) / (K[i][0] - K[i + 1][0]);
  const u2 = u * u, u3 = u2 * u;
  return 0.5 * (2 * p1 + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u2 + (-p0 + 3 * p1 - 3 * p2 + p3) * u3);
};

// ———————————————————————————— the contour ————————————————————————————

/** The clefts' and pouches' levels (1st to 4th). */
export const PLEV = [1.62, 0.42, -0.72, -1.72] as const;
/** The arches' borders from cranial to caudal: maxillary process | I | II | III | IV | VI. */
const BORDER = [3.95, 2.85, PLEV[0], PLEV[1], PLEV[2], PLEV[3], -2.45] as const;
/** Arch ids per lobe (the maxillary process is part of arch I). */
const LOBE_ID = ['luzapen-maxilarra', 'lehen-arkua', 'bigarren-arkua', 'hirugarren-arkua', 'laugarren-arkua', 'seigarren-arkua'] as const;
const LOBE_C = [ARCH.i, ARCH.i, ARCH.ii, ARCH.iii, ARCH.iv, ARCH.vi];
const LOBE_D = [ARCH_DEEP.i, ARCH_DEEP.i, ARCH_DEEP.ii, ARCH_DEEP.iii, ARCH_DEEP.iv, ARCH_DEEP.vi];
const LOBE_MID = BORDER.slice(0, -1).map((b, i) => (b + BORDER[i + 1]) / 2);

const WMID = curveOf([[3.95, 2.72], [2.85, 2.98], [PLEV[0], 2.45], [PLEV[1], 1.86], [PLEV[2], 1.32], [PLEV[3], 0.92], [-2.45, 0.68], [-3.4, 0.5], [-9, 0.46]]);
const PLATE = 0.16;
/** The lobes' full height outwards and inwards, at each lobe's middle. */
const OUT_K: [number, number][] = LOBE_MID.map((y, i) => [y, [0.62, 0.95, 0.82, 0.66, 0.5, 0.3][i]]);
const IN_K: [number, number][] = LOBE_MID.map((y, i) => [y, [0.4, 0.75, 0.58, 0.46, 0.36, 0.2][i]]);
const H_OUT = curveOf(OUT_K);
const H_IN = curveOf(IN_K);
/** How deep the floor lies at each level, and the body's outside there. */
const D_IN = curveOf([[3.95, 0.95], [2.4, 1.45], [0.4, 1.28], [-1.7, 0.86], [-3.4, 0.5], [-9, 0.46]]);
const D_OUT = (y: number) => D_IN(y) + 0.85;

/** 0 at a border between lobes, 1 at a lobe's middle: round lobes with sharp valleys. */
function lobe(y: number): number {
  for (let i = 0; i < BORDER.length - 1; i++) {
    if (y <= BORDER[i] && y >= BORDER[i + 1]) {
      const u = (y - LOBE_MID[i]) / ((BORDER[i] - BORDER[i + 1]) / 2);
      return Math.pow(Math.max(0, 1 - u * u), 0.55);
    }
  }
  return 0;
}

/** Rows of the grid, from cranial to caudal; the first pouch's window is sampled densely. */
const R1 = 0.5;
const seg_ = (a: number, b: number, n: number) => Array.from({ length: n }, (_, i) => a + ((b - a) * i) / n);
const HEAD_Y = [...seg_(BORDER[0], PLEV[0] + R1, 52), ...seg_(PLEV[0] + R1, PLEV[0] - R1, 110), ...seg_(PLEV[0] - R1, -3.4, 160)];
const N_HEAD = HEAD_Y.length;
const N_NECK = 26;
const N_ROWS = N_HEAD + N_NECK;
const NA = 22;

const rowAt = (y: number) => {
  let i = 0;
  while (i < N_HEAD - 1 && HEAD_Y[i] > y) i++;
  return i;
};
/** Where the body ends below (it lengthens: the neck grows). */
const yEnd = (neck: number) => lerp(-3.4, -7.2, neck);
const rowsY = (neck: number) => {
  const end = yEnd(neck);
  return [...HEAD_Y, ...Array.from({ length: N_NECK }, (_, i) => -3.4 + ((end + 3.4) * (i + 1)) / N_NECK)];
};

const smooth1 = (a: Float64Array, passes: number, i0 = 1, i1 = a.length - 2) => {
  for (let p = 0; p < passes; p++) {
    let prev = a[i0 - 1];
    for (let i = i0; i <= i1; i++) {
      const c = a[i];
      a[i] = 0.25 * prev + 0.5 * c + 0.25 * a[i + 1];
      prev = c;
    }
  }
};

export interface ShapeKey {
  clefts: number;
  pouches: number;
  v5: number;
  p1: number;
  cav: number;
  c1: number;
  close: number;
  neck: number;
}

interface Contour {
  y: number[];
  /** Inner (lumen) and outer (skin) curves, by row. */
  ix: Float64Array;
  iy: Float64Array;
  ox: Float64Array;
  oy: Float64Array;
}

const THICK = 0.055;

/** Where arch II's overgrowth lies (the inside of the fold), by height. */
const FLAP_IN = curveOf([[1.05, 3.1], [0.3, 2.62], [-0.2, 2.44], [-1.2, 1.86], [-2.1, 1.5], [-2.8, 1.52], [-9, 1.52]]);

const contours = new Map<string, Contour>();
function contourOf(sh: ShapeKey): Contour {
  const key = `${sh.clefts}|${sh.pouches}|${sh.v5}|${sh.p1}|${sh.cav}|${sh.c1}|${sh.close}|${sh.neck}`;
  const hit = contours.get(key);
  if (hit) return hit;
  const y = rowsY(sh.neck);
  const n = y.length;
  const ix = new Float64Array(n), iy = Float64Array.from(y), ox = new Float64Array(n), oy = Float64Array.from(y);
  // The first two arches thicken as the first pouch and cleft sink between them.
  const grow = Math.max(sh.p1, sh.c1);
  for (let i = 0; i < n; i++) {
    const q = y[i];
    const w = WMID(q);
    const lb = lobe(q);
    const near1 = gauss(q - PLEV[0], 1.25);
    let hin = H_IN(q) * lerp(0.62, lb, sh.pouches);
    let hout = H_OUT(q) * lerp(0.62, lb, sh.clefts);
    hin *= 1 + 0.5 * grow * near1;
    hout *= 1 + 0.32 * grow * near1;
    // The maxillary and the mandibular process are not parted by a deep valley.
    const fill = gauss(q - BORDER[1], 0.22);
    hin += 0.34 * fill;
    hout += 0.52 * fill;
    // Arch V: a low ridge in the fourth cleft and pouch.
    const v = sh.v5 * gauss(q - PLEV[3], 0.12);
    hin += 0.16 * v;
    hout += 0.2 * v;
    // Below the arches: the neck, a broad solid with the epicardial ridge on it.
    const low = ss(BORDER[6] + 0.05, BORDER[6] - 0.42, q);
    if (low > 0) {
      hout = lerp(hout, 0.52 + 0.17 * gauss(q + 3.0, 0.32), low);
      hin = lerp(hin, 0.14, low);
    }
    ix[i] = w - PLATE / 2 - hin;
    ox[i] = w + PLATE / 2 + hout;
    // The clefts filled: the skin runs smooth where arch II has come down over them.
    if (sh.close > 0 && q < 1.1 && q > -2.9) {
      const k = sh.close * ss(1.1, 0.75, q) * ss(-2.9, -2.6, q);
      ox[i] = lerp(ox[i], FLAP_IN(q), k);
    }
  }
  smooth1(ix, 3);
  smooth1(ox, 3);
  // The first pouch: a tube that widens at its end; the first cleft: a canal that reaches it.
  const P = PLEV[0];
  const a0 = rowAt(P + R1), a1 = rowAt(P - R1);
  if (sh.p1 > 0.001 || sh.c1 > 0.001) {
    const lipI: [number, number][] = [[ix[a0], y[a0]], [ix[a1], y[a1]]];
    const lipO: [number, number][] = [[ox[a0], y[a0]], [ox[a1], y[a1]]];
    const xmem = WMID(P) + 0.04;
    const rx = lerp(0.1, 0.42, sh.cav), ry = lerp(0.1, 0.5, sh.cav);
    const xc = xmem - rx - 0.09;
    const yc = P + 0.14 * sh.cav;
    const hw = 0.1;
    const te = 2.36;
    const bez = (A: [number, number], B: [number, number], C: [number, number], D: [number, number], u: number): [number, number] => {
      const v = 1 - u;
      const k = [v * v * v, 3 * v * v * u, 3 * v * u * u, u * u * u];
      return [k[0] * A[0] + k[1] * B[0] + k[2] * C[0] + k[3] * D[0], k[0] * A[1] + k[1] * B[1] + k[2] * C[1] + k[3] * D[1]];
    };
    const inner = (t: number): [number, number] => {
      const s = t >= 0 ? 1 : -1;
      const e: [number, number] = [xc + rx * Math.cos(te), yc + s * ry * Math.sin(te)];
      const lip = s > 0 ? lipI[0] : lipI[1];
      if (Math.abs(t) > 0.66) {
        const u = (1 - Math.abs(t)) / 0.34;
        return bez(lip, [lip[0] + 0.28, P + s * hw * 1.2], [e[0] - 0.22, P + s * hw], e, u);
      }
      const th = lerp(te, -te, (0.66 - t) / 1.32);
      return [xc + rx * Math.cos(th), yc + ry * Math.sin(th)];
    };
    const outer = (t: number): [number, number] => {
      const s = t >= 0 ? 1 : -1;
      const r = 0.15;
      const c: [number, number] = [xmem + 0.13 + r, P];
      const lip = s > 0 ? lipO[0] : lipO[1];
      if (Math.abs(t) > 0.3) {
        const u = (1 - Math.abs(t)) / 0.7;
        const e: [number, number] = [c[0], P + s * r];
        return bez(lip, [lip[0] - 0.42, P + s * 0.3], [c[0] + 0.36, P + s * r * 1.15], e, u);
      }
      const th = Math.PI / 2 + ((0.3 - t) / 0.6) * Math.PI;
      return [c[0] + r * Math.cos(th), P + r * Math.sin(th)];
    };
    for (let i = a0; i <= a1; i++) {
      const t = (y[i] - P) / R1;
      const qi = inner(t);
      const qo = outer(t);
      ix[i] = lerp(ix[i], qi[0], sh.p1);
      iy[i] = lerp(iy[i], qi[1], sh.p1);
      ox[i] = lerp(ox[i], qo[0], sh.c1);
      oy[i] = lerp(oy[i], qo[1], sh.c1);
    }
  }
  const c = { y, ix, iy, ox, oy };
  if (contours.size > 16) contours.delete(contours.keys().next().value as string);
  contours.set(key, c);
  return c;
}

/** The pouch rows' half-widths (the first is its whole window). */
const POUCH_R = [R1, 0.24, 0.22, 0.2];

/** Row ranges of the regions a surface is split into. */
interface Cut {
  i0: number;
  i1: number;
  /** 0–5 a lobe, 6.. neck; pouch/cleft index or -1. */
  lobe: number;
  groove: number;
  /** The first pouch: 1 tube, 2 cavity; the first cleft's end: 3. */
  part?: number;
}

const CUTS: Cut[] = (() => {
  const out: Cut[] = [];
  const marks: { y: number; lobe: number; groove: number; part?: number }[] = [];
  const P = PLEV[0];
  // From the top: a lobe, then its pouch, the next lobe…
  marks.push({ y: BORDER[0], lobe: 0, groove: -1 });
  marks.push({ y: BORDER[1], lobe: 1, groove: -1 });
  marks.push({ y: P + R1, lobe: 1, groove: 0, part: 1 });
  marks.push({ y: P + R1 * 0.66, lobe: 1, groove: 0, part: 2 });
  marks.push({ y: P + R1 * 0.3, lobe: 1, groove: 0, part: 3 });
  marks.push({ y: P, lobe: 2, groove: 0, part: 3 });
  marks.push({ y: P - R1 * 0.3, lobe: 2, groove: 0, part: 2 });
  marks.push({ y: P - R1 * 0.66, lobe: 2, groove: 0, part: 1 });
  marks.push({ y: P - R1, lobe: 2, groove: -1 });
  for (let k = 1; k < 4; k++) {
    const R = POUCH_R[k];
    marks.push({ y: PLEV[k] + R, lobe: k + 1, groove: k });
    marks.push({ y: PLEV[k], lobe: k + 2, groove: k });
    marks.push({ y: PLEV[k] - R, lobe: k + 2, groove: -1 });
  }
  marks.push({ y: BORDER[6], lobe: 6, groove: -1 });
  marks.push({ y: -2.72, lobe: 7, groove: -1 });
  marks.push({ y: -3.3, lobe: 6, groove: -1 });
  marks.forEach((m, k) => {
    const i0 = rowAt(m.y);
    const i1 = k + 1 < marks.length ? rowAt(marks[k + 1].y) : N_ROWS - 1;
    if (i1 > i0) out.push({ i0, i1, lobe: m.lobe, groove: m.groove, part: m.part });
  });
  return out;
})();

// ———————————————————————————— meshes ————————————————————————————

/** Round one row's a-parameter: 0 = the cut, 1 = the midline of the floor. */
interface FullGrid {
  mesh: Mesh;
  coarse: Mesh;
  nv: number;
}

function sweep(c: { x: ArrayLike<number>; y: ArrayLike<number>; rows: ArrayLike<number> }, depth: (y: number, a: number) => number, mirror: number | null, facing: V3): FullGrid {
  const n = N_ROWS;
  const rows = c.rows;
  const at = (ri: number, a: number): V3 => {
    const y = lerp(c.y[ri], rows[ri], ss(0, 0.42, a));
    const x = c.x[ri] * Math.cos((a * Math.PI) / 2);
    return [x, y, depth(rows[ri], a) * Math.sin((a * Math.PI) / 2)];
  };
  // One side, or across both to the other cut edge.
  const build = (nu: number, nv: number) =>
    grid(nu, nv, (u, v) => {
      const ri = Math.round(u * (n - 1));
      if (mirror !== null) {
        const p = at(ri, v);
        return [mirror * p[0], p[1], p[2]];
      }
      const a = 1 - Math.abs(v * 2 - 1);
      const p = at(ri, a);
      return [(v < 0.5 ? 1 : -1) * p[0], p[1], p[2]];
    }, facing);
  const nv = mirror !== null ? NA : NA * 2;
  return { mesh: build(n - 1, nv), coarse: build(Math.ceil((n - 1) / 5), Math.ceil(nv / 3)), nv };
}

/** Rows i0..i1 of a whole grid (its smooth normals kept, so the pieces meet without a seam). */
function rowsOf(g: FullGrid, i0: number, i1: number): Parts {
  const cut = (m: Mesh, nu: number, nv: number): Mesh => {
    const j0 = Math.round((i0 / (N_ROWS - 1)) * nu), j1 = Math.max(j0 + 1, Math.round((i1 / (N_ROWS - 1)) * nu));
    const st = nv + 1;
    return {
      pos: m.pos.subarray(j0 * st * 3, (j1 + 1) * st * 3),
      nrm: m.nrm.subarray(j0 * st * 3, (j1 + 1) * st * 3),
      uv: m.uv.subarray(j0 * st * 2, (j1 + 1) * st * 2),
      idx: m.idx.slice(j0 * nv * 6, j1 * nv * 6).map((v) => v - j0 * st),
    };
  };
  return { mesh: cut(g.mesh, N_ROWS - 1, g.nv), hit: cut(g.coarse, Math.ceil((N_ROWS - 1) / 5), Math.ceil(g.nv / 3)) };
}

/** A flat strip on the cut, between two curves (rows i0..i1), facing the viewer behind (−z). */
function stripOf(ax: ArrayLike<number>, ay: ArrayLike<number>, bx: ArrayLike<number>, by: ArrayLike<number>, i0: number, i1: number, s: number): Parts {
  const build = (step: number): Mesh => {
    const rows: number[] = [];
    for (let i = i0; i < i1; i += step) rows.push(i);
    rows.push(i1);
    const pos = new Float32Array(rows.length * 6);
    const nrm = new Float32Array(rows.length * 6);
    const uv = new Float32Array(rows.length * 4);
    rows.forEach((i, k) => {
      pos.set([s * ax[i], ay[i], 0, s * bx[i], by[i], 0], k * 6);
      nrm.set([0, 0, -1, 0, 0, -1], k * 6);
      uv.set([k / (rows.length - 1), 0, k / (rows.length - 1), 1], k * 4);
    });
    const idx = new Uint32Array((rows.length - 1) * 6);
    for (let k = 0; k < rows.length - 1; k++) {
      const a = k * 2, b = a + 1, c = a + 2, d = a + 3;
      // Wound to face −z whichever side the strip is on.
      if (s > 0) idx.set([a, b, c, b, d, c], k * 6);
      else idx.set([a, c, b, b, c, d], k * 6);
    }
    return { pos, nrm, uv, idx };
  };
  return { mesh: build(1), hit: build(Math.max(1, Math.ceil((i1 - i0) / 10))) };
}

/** The cross band at the body's end (top or bottom row), a cut in the transverse plane. */
function capOf(cx: number, ry: number, facing: V3, dIn: number, dOut: number, innerX: number): Parts {
  const mk = (nu: number): Mesh =>
    grid(nu, 1, (u, v) => {
      const t = (u * 2 - 1) * Math.PI * 0.5;
      const xI = innerX * Math.sin(t), zI = dIn * Math.cos(t);
      const xO = cx * Math.sin(t), zO = dOut * Math.cos(t);
      return [lerp(xI, xO, v), ry, lerp(zI, zO, v)];
    }, facing);
  return { mesh: mk(32), hit: mk(10) };
}

const BONE_I = ARCH.i;
const BONE_II = ARCH.ii;

export function pharynxModel(pose: PharynxPose, o: PharynxOpts = {}) {
  const items: Item3[] = [];
  const pts: Record<string, V3> = {};
  const dim = o.dim;
  const fade = (id: string | undefined, groups?: readonly string[]) => {
    if (!id || !dim || dim.k <= 0.001) return 1;
    return dim.ids.includes(id) || (groups ?? []).some((g) => dim.ids.includes(g)) ? 1 : 1;
  };
  const darker = (c: string) => mixHex(c, '#000000', 0.55);
  const put = (key: string, id: string | undefined, parts: Parts | null, color: string, extra: Partial<Item3> = {}, op = 1) => {
    if (!parts || op <= 0.01) return;
    items.push({ key, id, ...parts, color, deep: darker(color), tissue: 'epithelium', opacity: op * fade(id, extra.groups), ...extra });
  };
  const vess = (key: string, id: string | undefined, line: V3[], color: string, prof: VesselOptions, g = 1, op = 1, extra: Partial<Item3> = {}) => put(key, id, vessel(line, { ref: [0, 0, 1], sides: 12, ...prof }, g), color, extra, op);
  const ball = (key: string, id: string | undefined, c: V3, r: V3, color: string, extra: Partial<Item3> = {}, op = 1, rings = 12, sides = 16) => {
    if (r[0] <= 0.002) return;
    put(key, id, blobParts({ center: c, radii: r, rings, sides }), color, extra, op);
  };

  // ———— the body ————
  const sh: ShapeKey = { clefts: pose.clefts, pouches: pose.pouches, v5: pose.v5, p1: pose.p1, cav: pose.cav, c1: pose.c1, close: lerp(pose.close, Math.max(0, pose.close - 0.55), clamp01(pose.persist)), neck: pose.neck };
  const c = contourOf(sh);
  const deps = [sh.clefts, sh.pouches, sh.v5, sh.p1, sh.cav, sh.c1, sh.close, sh.neck];
  const n = N_ROWS;
  const rows = Float64Array.from(c.y);
  // The bands' borders: endoderm's outer side; ectoderm's inner side.
  const e1x = new Float64Array(n), e1y = new Float64Array(n), e2x = new Float64Array(n), e2y = new Float64Array(n);
  const dist = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const dx = c.ox[i] - c.ix[i], dy = c.oy[i] - c.iy[i];
    const d = Math.hypot(dx, dy) || 1;
    dist[i] = d;
    const te = Math.min(THICK, d * 0.32);
    e1x[i] = c.ix[i] + (dx / d) * te;
    e1y[i] = c.iy[i] + (dy / d) * te;
    e2x[i] = c.ox[i] - (dx / d) * te;
    e2y[i] = c.oy[i] - (dy / d) * te;
  }
  /** One side's skin and mesenchyme border, thinned onto the endoderm by its peel. */
  const peeled = (px: number) => {
    if (px <= 0.001) return { ox: c.ox, oy: c.oy, ex: e2x, ey: e2y };
    const ox = new Float64Array(n), oy = new Float64Array(n), ex = new Float64Array(n), ey = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      ox[i] = lerp(c.ox[i], e1x[i] + 0.004, px);
      oy[i] = lerp(c.oy[i], e1y[i], px);
      ex[i] = lerp(e2x[i], e1x[i] + 0.002, px);
      ey[i] = lerp(e2y[i], e1y[i], px);
    }
    return { ox, oy, ex, ey };
  };

  const dIn = (y: number) => D_IN(y);
  const ridgeK = (y: number) => 0.32 * (H_IN(y) * lobe(y));
  // The floor bulges towards the lumen where an arch lies.
  const dInner = (y: number, a: number) => dIn(y) - (a > 0.2 ? ridgeK(y) * ss(0.2, 0.9, a) * pose.pouches : 0);
  let fi: FullGrid | null = null;
  let fs: FullGrid | null = null;
  const innerG = () => (fi ??= sweep({ x: c.ix, y: c.iy, rows }, dInner, null, [0, 0, -60]));
  const shellG = () => (fs ??= sweep({ x: e1x, y: e1y, rows }, (y, a) => dInner(y, a) + THICK * (0.4 + 0.6 * a), null, [0, 0, 60]));
  const skin: Record<number, FullGrid | null> = {};
  const peelOf = (s: number) => (s > 0 ? clamp01(pose.peelL) : clamp01(pose.peelR));
  const skinG = (s: number) => {
    if (skin[s]) return skin[s]!;
    const pl = peeled(peelOf(s));
    return (skin[s] = sweep({ x: pl.ox, y: pl.oy, rows }, (y) => lerp(D_OUT(y), dIn(y) + 0.08, peelOf(s)), s, [s * 60, 0, 60]));
  };

  const tint = clamp01(pose.tissue);
  const mesCol = (k: number) => (k < 6 ? mixHex(LOBE_C[k], TISSUE.mes, tint) : TISSUE.mes);
  const mesDeep = (k: number) => (k < 6 ? mixHex(LOBE_D[k], TISSUE.mesDeep, tint) : TISSUE.mesDeep);
  const pouchId = ['lehen-poltsa', 'bigarren-poltsa', 'hirugarren-poltsa', 'laugarren-poltsa'];
  const endo = TISSUE.endo, endoD = TISSUE.endoDeep;

  // The surfaces of the lumen and of the endoderm's outside (its cast), split so each pouch can be named.
  const lumenGroupOf = (cu: Cut) => {
    if (cu.groove < 0) return { id: 'faringe-hestea', groups: ['endodermoa'] };
    const id = pouchId[cu.groove];
    const groups = ['faringe-poltsak', 'endodermoa', 'faringe-hestea'];
    if (cu.part === 1) groups.push('eustakioren-tronpa');
    if (cu.part === 2 || cu.part === 3) groups.push('tinpano-kutxa');
    return { id, groups };
  };
  const inPartColor = (cu: Cut) => {
    if (cu.groove !== 0) return { col: endo, deep: endoD };
    const k = clamp01(pose.p1 * 1.2);
    return { col: mixHex(endo, POUCH.p1, k), deep: mixHex(endoD, POUCH.p1Deep, k) };
  };
  CUTS.forEach((cu, k) => {
    const { id, groups } = lumenGroupOf(cu);
    const { col, deep } = inPartColor(cu);
    items.push({ key: `in${k}`, id, groups, ...partsCached('ph18-in', deps, k, () => rowsOf(innerG(), cu.i0, cu.i1)), color: col, deep, tissue: 'epithelium', opacity: 1 });
    // Its outside shows only where a wall has been peeled off.
    if (Math.max(pose.peelL, pose.peelR) > 0.05)
      items.push({ key: `sh${k}`, id, groups, ...partsCached('ph18-sh', deps, k, () => rowsOf(shellG(), cu.i0, cu.i1)), color: col, deep, tissue: 'epithelium', opacity: 1 });
  });

  // The cut: per side, bands from the lumen out.
  const cutDeps = (px: number) => [...deps, px];
  for (const s of [1, -1]) {
    const px = peelOf(s);
    const pl = peeled(px);
    const side = s > 0 ? 'L' : 'R';
    CUTS.forEach((cu, k) => {
      // Endoderm band.
      const lumenInfo = lumenGroupOf(cu);
      const { col, deep } = inPartColor(cu);
      const isDrum = cu.groove === 0 && cu.part === 3 && pose.c1 > 0.5;
      const endoIds = isDrum ? { id: 'tinpano-mintza', groups: ['endodermoa', ...lumenInfo.groups] } : { id: lumenInfo.id === 'faringe-hestea' ? 'endodermoa' : lumenInfo.id, groups: lumenInfo.groups };
      items.push({ key: `ce${side}${k}`, ...endoIds, ...partsCached('ph18-ce', [...deps, s], k, () => stripOf(c.ix, c.iy, e1x, e1y, cu.i0, cu.i1, s)), color: col, deep, tissue: 'epithelium', opacity: 1, outline: false });
      if (px >= 0.995) return;
      // Mesenchyme.
      const lobeIdx = cu.lobe;
      const lobeId = lobeIdx < 6 ? LOBE_ID[lobeIdx] : lobeIdx === 7 ? 'goragune-epikardikoa' : undefined;
      const v5Here = cu.groove === 3 && pose.v5 > 0.02;
      const id5 = v5Here ? 'bosgarren-arkua' : lobeId;
      const groupsM = [...(lobeIdx < 6 ? ['faringe-arkuak', 'mesenkima'] : ['mesenkima']), ...(isDrum ? ['tinpano-mintza'] : [])];
      const col5 = v5Here ? mixHex(mesCol(lobeIdx), ARCH.v, clamp01(pose.v5 * 1.3)) : mesCol(lobeIdx);
      items.push({
        key: `cm${side}${k}`,
        id: isDrum ? 'tinpano-mintza' : id5,
        groups: isDrum ? [...groupsM, lobeId ?? ''].filter(Boolean) : groupsM,
        ...partsCached('ph18-cm', cutDeps(px).concat(s), k, () => stripOf(e1x, e1y, pl.ex, pl.ey, cu.i0, cu.i1, s)),
        color: isDrum ? mixHex(TISSUE.mes, '#ffb37a', 0.5) : col5,
        deep: isDrum ? TISSUE.mesDeep : mesDeep(lobeIdx),
        tissue: 'mesenchyme',
        opacity: 1,
        outline: false,
      });
      // Ectoderm band: the clefts are its grooves.
      const cleftId = cu.groove === 0 ? 'lehen-arraildura' : cu.groove > 0 ? 'faringe-arraildurak' : 'ektodermoa';
      const ectoGroups = cu.groove >= 0 ? ['ektodermoa', 'faringe-arraildurak'] : [];
      items.push({
        key: `cc${side}${k}`,
        id: isDrum ? 'tinpano-mintza' : cu.groove === 0 && pose.c1 > 0.4 ? 'kanpoko-entzumen-hodia' : cleftId,
        groups: isDrum ? ['ektodermoa', 'lehen-arraildura'] : cu.groove === 0 ? ['ektodermoa', 'lehen-arraildura', 'faringe-arraildurak'] : ectoGroups,
        ...partsCached('ph18-cc', cutDeps(px).concat(s), k, () => stripOf(pl.ex, pl.ey, pl.ox, pl.oy, cu.i0, cu.i1, s)),
        color: TISSUE.ecto,
        deep: TISSUE.ectoDeep,
        tissue: 'epithelium',
        opacity: 1,
        outline: false,
      });
      // The body's outside (its skin), each lobe in its colour, the grooves in the ectoderm's blue.
      const skinId = cu.groove === 0 ? (pose.c1 > 0.4 ? 'kanpoko-entzumen-hodia' : 'lehen-arraildura') : cu.groove > 0 ? 'faringe-arraildurak' : lobeId;
      const skinC = cu.groove >= 0 ? TISSUE.ecto : lobeIdx < 6 ? mixHex(LOBE_C[lobeIdx], TISSUE.ecto, Math.max(0.2, tint * 0.9)) : TISSUE.skin;
      items.push({
        key: `sk${side}${k}`,
        id: skinId,
        groups: cu.groove >= 0 ? ['ektodermoa', 'faringe-arraildurak', ...(cu.groove === 0 ? ['lehen-arraildura'] : [])] : lobeIdx < 6 ? ['ektodermoa', 'faringe-arkuak'] : ['ektodermoa'],
        ...partsCached('ph18-sk', cutDeps(px).concat(s), k, () => rowsOf(skinG(s), cu.i0, cu.i1)),
        color: skinC,
        deep: cu.groove >= 0 ? TISSUE.ectoDeep : lobeIdx < 6 ? mixHex(LOBE_D[lobeIdx], TISSUE.ectoDeep, 0.3) : TISSUE.skinDeep,
        tissue: 'skin',
        opacity: 1,
      });
    });
  }

  // The body's two transverse ends: cut faces of the floor and wall.
  const topR = 0;
  const botR = n - 1;
  const capC = TISSUE.mes;
  const capDeep = TISSUE.mesDeep;
  items.push({ key: 'capT', ...partsCached('ph18-capT', deps, 0, () => capOf(c.ox[topR], rows[topR], [0, 60, 0], D_IN(rows[topR]), D_OUT(rows[topR]), c.ix[topR])), color: capC, deep: capDeep, tissue: 'mesenchyme', opacity: 1, quiet: true, ground: true, outline: false });
  items.push({ key: 'capB', ...partsCached('ph18-capB', [pose.neck], 0, () => capOf(c.ox[botR], rows[botR], [0, -60, 0], D_IN(rows[botR]), D_OUT(rows[botR]), c.ix[botR])), color: capC, deep: capDeep, tissue: 'mesenchyme', opacity: 1, quiet: true, ground: true, outline: false });

  // The body's front (what the gut lies on, seen from behind).
  const groundEnd = yEnd(pose.neck) - 0.6;
  items.push({ key: 'ground', ...partsCached('ph18-ground', [groundEnd], 0, () => groundPlate(groundEnd)), color: TISSUE.ground, deep: TISSUE.groundDeep, tissue: 'mesenchyme', opacity: 1, quiet: true, ground: true, outline: false });

  // ———— where things are ————
  const rowMid = (k: number) => rowAt(LOBE_MID[k]);
  const cm = (k: number): [number, number] => {
    const i = rowMid(k);
    return [(c.ix[i] + c.ox[i]) / 2, c.y[i]];
  };
  /** The arch's middle in the cut (arches named on the embryo's right, the viewer's right from behind). */
  LOBE_ID.forEach((id, k) => {
    const [x, y] = cm(k);
    pts[id] = [-x, y, -0.01];
  });
  pts['faringe-arkuak'] = [-cm(2)[0], cm(2)[1], -0.01];
  if (pose.v5 > 0.02) pts['bosgarren-arkua'] = [-c.ox[rowAt(PLEV[3])] + 0.1, PLEV[3], -0.01];
  /** A pouch's tip, on the lumen side, in the cut. */
  const tip = (k: number): V3 => {
    const i = rowAt(PLEV[k]);
    return [c.ix[i], c.iy[i], 0];
  };
  pouchId.forEach((id, k) => {
    const t = tip(k);
    pts[id] = [t[0] - 0.08, t[1], 0.02];
  });
  pts['faringe-poltsak'] = [tip(1)[0] - 0.08, tip(1)[1], 0.02];
  const cleft = (k: number): V3 => {
    const i = rowAt(PLEV[k]);
    return [c.ox[i] + 0.04, c.oy[i], -0.01];
  };
  pts['lehen-arraildura'] = SX(-1, cleft(0));
  pts['faringe-arraildurak'] = SX(-1, cleft(1));
  // Floor, lumen, germ layers.
  pts['faringe-hestea'] = [0, 0.1, D_IN(0.1) - 0.2];
  pts['endodermoa'] = [tip(1)[0] - 0.25, 1.0, 0];
  const lobeRow = rowMid(3);
  pts['endodermoa'] = [c.ix[lobeRow] + 0.025, c.iy[lobeRow], -0.01];
  const lobeR2 = rowMid(2);
  pts['ektodermoa'] = [c.ox[lobeR2] - 0.025, c.oy[lobeR2], -0.01];
  pts['mesenkima'] = [cm(3)[0] - 0.14, cm(3)[1] + 0.22, -0.01];
  pts['goragune-epikardikoa'] = [-c.ox[rowAt(-3.0)] + 0.25, -3.0, -0.01];

  // ———— the laryngeal orifice, on the floor ————
  const laY = -2.3;
  if (pose.larynx > 0.01) {
    const zf = dInner(laY, 1);
    put('la-rim', 'laringe-zuloa', blobParts({ center: [0, laY, zf - 0.015], radii: [0.17, 0.33, 0.07], rings: 10, sides: 18 }), '#e7bc4a', { deep: endoD, groups: [] }, pose.larynx);
    put('la-slit', 'laringe-zuloa', blobParts({ center: [0, laY, zf - 0.08], radii: [0.06, 0.25, 0.018], rings: 8, sides: 12 }), '#3a2410', { outline: false, tissue: 'membrane' }, pose.larynx);
    pts['laringe-zuloa'] = [0.02, laY, zf - 0.1];
  }

  // ———— what each arch holds: arcs inside the wall, seen cut on the section, whole where the wall is peeled ————
  type Run = { key: string; id: string; c: string; deep: string; g: number; off: [number, number]; r: number; end: number };
  const lobes = [1, 2, 3, 4, 5];
  lobes.forEach((lk) => {
    const scale = lk === 5 ? 0.62 : lk === 4 ? 0.82 : 1;
    const R0 = cm(lk);
    const [cx0, y0] = R0;
    const Dm = (D_IN(y0) + D_OUT(y0)) / 2;
    const runs: Run[] = [
      { key: 'ar', id: 'aorta-arkuak', c: TISSUE.artery, deep: TISSUE.arteryDeep, g: pose.art, off: [-0.2, 0.16], r: 0.095, end: 1.0 },
      { key: 've', id: 'arkuko-zaina', c: TISSUE.vein, deep: TISSUE.veinDeep, g: pose.vein, off: [0.2, 0.17], r: 0.082, end: 0.72 },
      { key: 'ne', id: 'arkuko-nerbioa', c: TISSUE.nerve, deep: TISSUE.nerveDeep, g: pose.nerve, off: [0.22, -0.17], r: 0.066, end: 0.62 },
      { key: 'ca', id: 'arkuko-kartilagoa', c: TISSUE.cartilage, deep: TISSUE.cartilageDeep, g: pose.cart, off: [-0.18, -0.19], r: 0.115, end: 0.85 },
    ];
    for (const s of [1, -1]) {
      for (const q of runs) {
        if (q.g <= 0.01) continue;
        const dx = q.off[0] * scale, dy = q.off[1] * scale;
        const r = q.r * scale * ss(0, 0.35, q.g);
        const samples = 16;
        const arc: V3[] = Array.from({ length: samples }, (_, i) => {
          const a = (i / (samples - 1)) * q.end;
          return [s * (cx0 + dx) * Math.cos((a * Math.PI) / 2), y0 + dy, 0.015 + Dm * Math.sin((a * Math.PI) / 2)] as V3;
        });
        vess(`${q.key}${s}${lk}`, q.id, arc, q.c, { r0: r, r1: r * 0.92, sides: 10, n: 18, ref: [0, 1, 0] }, clamp01(q.g), 1, { deep: q.deep, tissue: q.key === 'ar' || q.key === 've' ? 'vessel' : q.key === 'ne' ? 'nerve' : 'cartilage', groups: q.key === 'ar' ? ['arkuko-arteria'] : undefined });
        // Behind the cut each aortic arch runs on over the gut to the dorsal aorta (shown once the wall is off).
        if (q.key === 'ar' && pose.aortic > 0.01) {
          const a0 = arc[0];
          const dors: V3[] = L([[a0[0], a0[1], 0.1], [a0[0] * 0.92, a0[1], -0.35], [s * lerp(cx0 * 0.6, 0.55, 0.5), y0 + dy - 0.1, -1.05]], 12);
          vess(`da${s}${lk}`, 'aorta-arkuak', dors, q.c, { r0: r, r1: r * 0.95, sides: 10, ref: [0, 1, 0] }, clamp01(pose.aortic), 1, { deep: q.deep, tissue: 'vessel' });
        }
      }
    }
    if (lk === 2) {
      const X = cx0;
      for (const q of runs) {
        if (q.g > 0.01) pts[q.key === 'ar' ? 'arkuko-arteria' : q.id] = [X + q.off[0] * scale, y0 + q.off[1] * scale, -0.04];
      }
    }
  });
  if (pose.art > 0.01) pts['aorta-arkuak'] = pts['arkuko-arteria'];
  if (pose.aortic > 0.01) {
    // The dorsal aortae (one a side, behind the cut) and the aortic sac (under the floor).
    for (const s of [1, -1]) vess(`dao${s}`, 'aorta-dortsala', L([SX(s, [1.05, 2.6, -1.05]), SX(s, [0.86, 0.9, -1.05]), SX(s, [0.68, -1.2, -1.05]), SX(s, [0.55, -2.8, -1.05])], 20), TISSUE.artery, { r0: 0.13, r1: 0.14 }, clamp01(pose.aortic), 1, { deep: TISSUE.arteryDeep, tissue: 'vessel' });
    pts['aorta-dortsala'] = [0.75, -0.4, -1.1];
  }

  // ———— neural crest cells and the mesenchyme's two kinds of cell ————
  if (pose.crest > 0.01 || pose.cells > 0.01) {
    for (const s of [1, -1]) {
      lobes.forEach((lk) => {
        const [cx0, y0] = cm(lk);
        // A stream from behind and above into the arch, ending as cells spread in it.
        const COUNT = 7;
        const parts: Parts[] = [];
        for (let j = 0; j < COUNT; j++) {
          const seed = (Math.sin((lk + j * 7.3) * 12.9) * 0.5 + 0.5);
          const end: V3 = [s * (cx0 + (seed - 0.5) * 0.46 * (lk > 3 ? 0.7 : 1)), y0 + (Math.cos(j * 2.1 + lk) * 0.3 * (lk > 3 ? 0.55 : 1)), -0.018];
          const start: V3 = [s * 0.3, y0 + 2.0 - lk * 0.1, -1.8];
          const u = ss(j * 0.07, 0.55 + j * 0.06, pose.crest);
          if (u <= 0.001) continue;
          const p = mix3(mix3(start, [end[0] * 0.8, end[1] + 0.7, -0.8], Math.min(1, u * 1.4)), end, ss(0.4, 1, u));
          parts.push(blobParts({ center: p, radii: [0.042, 0.042, 0.014 + 0.028 * (1 - ss(0.85, 1, u))], rings: 6, sides: 8 }));
        }
        put(`cr${s}${lk}`, 'gandor-neuraleko-zelulak', mergeParts(parts), TISSUE.crest, { deep: TISSUE.crestDeep, tissue: 'mesenchyme', outline: false }, 1);
        if (pose.cells > 0.01) {
          const m: Parts[] = [];
          for (let j = 0; j < 7; j++) {
            const e: V3 = [s * (cx0 - 0.2 + 0.4 * (Math.sin(j * 3.7 + lk) * 0.5 + 0.5)), y0 + Math.sin(j * 1.9 + lk * 2) * 0.26 * (lk > 3 ? 0.55 : 1), -0.012];
            m.push(blobParts({ center: e, radii: [0.04, 0.04, 0.02], rings: 5, sides: 7 }));
          }
          put(`ms${s}${lk}`, 'zelula-mesodermikoak', mergeParts(m), TISSUE.paraxial, { deep: TISSUE.paraxialDeep, tissue: 'mesenchyme', outline: false }, pose.cells);
        }
      });
    }
    pts['gandor-neuraleko-zelulak'] = [cm(2)[0] + 0.02, cm(2)[1] + 0.1, -0.05];
    if (pose.cells > 0.01) pts['zelula-mesodermikoak'] = [cm(3)[0] - 0.05, cm(3)[1] - 0.15, -0.05];
  }

  // ———— pouch 1's ossicles ————
  const P = PLEV[0];
  const xmem = WMID(P) + 0.04;
  const cavC: V3 = [xmem - 0.42 - 0.09 - 0.02, P + 0.14, 0];
  pts['eustakioren-tronpa'] = [c.ix[rowAt(P + R1 * 0.82)] + 0.02, P + 0.09, 0.05];
  pts['tinpano-kutxa'] = [cavC[0] + 0.06, cavC[1] + 0.22, 0.08];
  pts['tinpano-mintza'] = [xmem + 0.06, P, -0.01];
  pts['kanpoko-entzumen-hodia'] = [c.ox[rowAt(P + R1 * 0.5)], c.oy[rowAt(P + R1 * 0.5)], -0.01];
  const os = clamp01(pose.ossicles);
  if (os > 0.01) {
    for (const s of [1, -1]) {
      const place = (fromArch: [number, number], to: [number, number]): V3 => {
        const t = ss(0, 1, os);
        return [s * lerp(fromArch[0], to[0], t), lerp(fromArch[1], to[1], t), -0.03];
      };
      const z = -0.03;
      const f1 = cm(1), f2 = cm(2);
      // Malleus: a club on the drum; incus: an anvil beside it; stapes: a stirrup at the medial wall.
      const mall = place([f1[0] - 0.2, f1[1] - 0.05], [xmem - 0.2, P + 0.2]);
      const inc = place([f1[0] - 0.42, f1[1] - 0.12], [xmem - 0.46, P + 0.3]);
      const stp = place([f2[0] - 0.3, f2[1] + 0.05], [xmem - 0.64, P + 0.08]);
      vess(`mal${s}`, 'mailua', L([[mall[0], mall[1] + 0.13, z], [mall[0] - s * 0.02, mall[1], z], [mall[0] + s * 0.11, mall[1] - 0.16, z]], 10), BONE_I, { r0: 0.058, r1: 0.03, bulb: 0, sides: 10 }, 1, 1, { deep: ARCH_DEEP.i, tissue: 'bone' });
      ball(`malH${s}`, 'mailua', [mall[0], mall[1] + 0.14, z], [0.078, 0.078, 0.06], BONE_I, { deep: ARCH_DEEP.i, tissue: 'bone' });
      ball(`inc${s}`, 'ingudea', [inc[0], inc[1], z], [0.1, 0.085, 0.06], BONE_I, { deep: ARCH_DEEP.i, tissue: 'bone' });
      vess(`incL${s}`, 'ingudea', L([[inc[0] - s * 0.03, inc[1] - 0.03, z], [inc[0] - s * 0.12, inc[1] - 0.14, z], [inc[0] - s * 0.1, inc[1] - 0.25, z]], 8), BONE_I, { r0: 0.036, r1: 0.024, sides: 8 }, 1, 1, { deep: ARCH_DEEP.i, tissue: 'bone' });
      vess(`stp${s}`, 'ointokia', L([[stp[0] - s * 0.12, stp[1] + 0.11, z], [stp[0] + s * 0.08, stp[1] + 0.16, z], [stp[0] + s * 0.08, stp[1] - 0.05, z], [stp[0] - s * 0.12, stp[1] - 0.0, z]], 14), BONE_II, { r0: 0.026, r1: 0.026, sides: 8 }, 1, 1, { deep: ARCH_DEEP.ii, tissue: 'bone' });
      ball(`stpF${s}`, 'ointokia', [stp[0] - s * 0.15, stp[1] + 0.055, z], [0.03, 0.12, 0.06], BONE_II, { deep: ARCH_DEEP.ii, tissue: 'bone' });
      if (s > 0) {
        pts['mailua'] = [mall[0] + 0.02, mall[1] + 0.13, z - 0.05];
        pts['ingudea'] = [inc[0], inc[1] + 0.02, z - 0.05];
        pts['ointokia'] = [stp[0] - 0.14, stp[1] + 0.05, z - 0.05];
      }
    }
  }

  // ———— pouch 2: the tonsil, in the pouch's wall ————
  const ton = clamp01(pose.tonsil);
  if (ton > 0.01)
    for (const s of [1, -1]) {
      const t = tip(1);
      const cent: V3 = [s * (t[0] - 0.12), t[1], 0.03];
      put(`ton${s}`, 'aho-sabaiko-amigdala', bean({ center: cent, radii: [0.2 + 0.2 * ton, 0.1 + 0.22 * ton, 0.09 + 0.34 * ton], hilum: [s, 0, 0], dent: 0.25, rings: 14, sides: 18 }), POUCH.p2, { deep: POUCH.p2Deep, tissue: 'epithelium', groups: ['bigarren-poltsa'] });
      const ly = clamp01(pose.lymph);
      if (ly > 0.01) {
        const dots: Parts[] = [];
        for (let j = 0; j < 22; j++) {
          const u = ss(j * 0.02, 0.5 + j * 0.02, ly);
          if (u <= 0.01) continue;
          const a = j * 2.4;
          const rr = 0.3 * Math.sqrt((j + 0.5) / 22);
          dots.push(blobParts({ center: [cent[0] + s * 0.08 + rr * Math.cos(a) * 0.85, cent[1] + rr * Math.sin(a) * 0.95, cent[2] - 0.28], radii: [0.045 * u, 0.045 * u, 0.03 * u], rings: 5, sides: 7 }));
        }
        put(`lym${s}`, 'ehun-linfatikoa', mergeParts(dots), '#5b2fb0', { deep: '#2a1466', tissue: 'mesenchyme', outline: false });
      }
      if (s > 0) {
        pts['aho-sabaiko-amigdala'] = [cent[0] + 0.05, cent[1] + 0.06, cent[2] - 0.3];
        if (ly > 0.01) pts['ehun-linfatikoa'] = [cent[0] + 0.05, cent[1] - 0.12, cent[2] - 0.32];
      }
    }

  // ———— pouches 3 and 4: the two wings of each ————
  const desc = clamp01(pose.descend);
  const meet = clamp01(pose.meet);
  const thy = clamp01(pose.thyroid);

  // Where the descending glands go (left side; the right mirrors it).
  const LOBE_Y = -3.72, LOBE_X = 0.78;
  const PARA_END: Record<3 | 4, V3> = { 3: [LOBE_X + 0.14, LOBE_Y - 0.6, 0.3], 4: [LOBE_X + 0.14, LOBE_Y + 0.56, 0.3] };

  /** The dorsal wing's end: the bud grows out of the pouch's tip, behind the cut. */
  const dorsalLine = (k: number): V3[] => {
    const t = tip(k);
    return L([[t[0] + 0.0, t[1], 0.08], [t[0] + 0.1, t[1] + 0.05, -0.26], [t[0] + 0.14, t[1] + 0.12, -0.62]], 16);
  };
  const ventralLine = (k: number): V3[] => {
    const t = tip(k);
    if (k === 2)
      return L([[t[0] - 0.05, t[1], 0.25], [t[0] + 0.16, t[1] - 0.16, 0.62], [t[0] + 0.14, t[1] - 0.72, 0.92], [t[0] - 0.02, t[1] - 1.3, 1.02]], 26);
    return L([[t[0] - 0.05, t[1], 0.25], [t[0] + 0.18, t[1] - 0.1, 0.56], [t[0] + 0.18, t[1] - 0.32, 0.72]], 18);
  };

  // A gland's place at the descent's progress d.
  const para3At = (s: number, d: number): V3 => {
    const e0 = dorsalLine(2)[15];
    const e1 = PARA_END[3];
    const u = ss(0, 0.78, d);
    return SX(s, L([e0, [e0[0] - 0.05, e0[1] - 0.75, e0[2] + 0.1], [1.38, -2.05, -0.28], [1.2, -3.0, 0.02], e1], 40)[Math.round(u * 39)]);
  };
  const para4At = (s: number, d: number): V3 => {
    const e0 = dorsalLine(3)[15];
    const e1 = PARA_END[4];
    const u = ss(0.2, 1, d);
    return SX(s, L([e0, [0.96, -2.2, -0.15], [1.02, -2.75, 0.1], e1], 30)[Math.round(u * 29)]);
  };

  for (const s of [1, -1]) {
    // ——— the third pouch: dorsal wing → inferior parathyroid ———
    const d3 = clamp01(pose.p3d);
    if (d3 > 0.01) {
      const pos = desc > 0.001 ? para3At(s, desc) : SX(s, dorsalLine(2)[15]);
      if (desc < 0.05) vess(`d3${s}`, 'hirugarren-poltsa', dorsalLine(2).map((p) => SX(s, p)), POUCH.p3, { r0: 0.1, r1: 0.1, flare: 0.5, flareLen: 0.12, sides: 12 }, d3, 1 - ss(0, 0.05, desc), { deep: POUCH.p3Deep, groups: ['faringe-poltsak'] });
      const r = 0.2 * ss(0.5, 1, d3);
      ball(`pi${s}`, 'beheko-paratiroidea', pos, [r, r, r * 0.9], mixHex(POUCH.p3, '#ffffff', 0.32), { deep: POUCH.p3Deep });
      if (s > 0) pts['beheko-paratiroidea'] = [pos[0] + 0.02, pos[1] + 0.04, pos[2] - 0.17];
    }
    // ——— ventral wing → thymus: grows down, then goes down with the parathyroid at its head ———
    const v3 = clamp01(pose.p3v);
    if (v3 > 0.01) {
      let line = ventralLine(2).map((p) => SX(s, p));
      if (desc > 0.001 || meet > 0.001) {
        const head0 = line[0];
        const tail0 = line[line.length - 1];
        const u = ss(0, 1, desc);
        const headEnd = SX(s, [lerp(0.5, 0.34, meet), -4.9, 0.52]);
        const tailEnd = SX(s, [lerp(0.48, 0.3, meet), -6.85, 0.5]);
        const head = desc < 0.72 ? add(para3At(s, desc), SX(s, [-0.06, -0.16, 0.22])) : SX(s, mix3(add(para3At(1, 0.72), [-0.06, -0.16, 0.22]), SX(1, headEnd), ss(0.72, 1, desc)));
        const tail = mix3(tail0, tailEnd, u);
        const mid = mix3(mix3(head0, tail0, 0.5), SX(s, [lerp(1.0, 0.4, u), lerp(-2.4, -5.9, u), 0.62]), u);
        line = L([head, mid, tail], 28);
      }
      vess(`thy${s}`, 'timoa', line, POUCH.p3, { r0: lerp(0.08, 0.2, ss(0.3, 1, desc)), r1: 0.2 + 0.18 * desc, flare: desc < 0.04 ? 0.4 : 0, flareLen: 0.15, bulb: 0.75, bulbLen: 0.5, sides: 14, n: 30, flat: 0.15 }, v3, 1, { deep: POUCH.p3Deep });
      const pl = line[Math.round((line.length - 1) * 0.72 * v3)];
      if (s > 0) pts['timoa'] = [pl[0] + 0.02, pl[1], pl[2] - 0.15];
    }
    // ——— the fourth pouch: dorsal wing → superior parathyroid ———
    const d4 = clamp01(pose.p4d);
    if (d4 > 0.01) {
      const pos = desc > 0.001 ? para4At(s, desc) : SX(s, dorsalLine(3)[15]);
      if (desc < 0.05) vess(`d4${s}`, 'laugarren-poltsa', dorsalLine(3).map((p) => SX(s, p)), POUCH.p4, { r0: 0.085, r1: 0.085, flare: 0.5, flareLen: 0.1, sides: 12 }, d4, 1 - ss(0, 0.05, desc), { deep: POUCH.p4Deep, groups: ['faringe-poltsak'] });
      const r = 0.175 * ss(0.5, 1, d4);
      ball(`ps${s}`, 'goiko-paratiroidea', pos, [r, r, r * 0.9], mixHex(POUCH.p4, '#ffffff', 0.2), { deep: POUCH.p4Deep });
      if (s > 0) pts['goiko-paratiroidea'] = [pos[0] + 0.02, pos[1] + 0.04, pos[2] - 0.15];
    }
    // ——— ventral wing → ultimobranchial body, which goes to the thyroid and is taken in ———
    const v4 = clamp01(pose.p4v);
    const ubI = clamp01(pose.ubIn);
    if (v4 > 0.01 && ubI < 0.98) {
      let line = ventralLine(3).map((p) => SX(s, p));
      if (desc > 0.001) {
        const u = ss(0.1, 0.85, desc);
        const end = SX(s, [LOBE_X + 0.2, LOBE_Y + 0.1, 0.78]);
        const tail = mix3(line[line.length - 1], end, u);
        const head = mix3(line[0], add(end, SX(s, [0.28, 0.38, -0.25])), u);
        line = L([head, mix3(head, tail, 0.5), tail], 18);
      }
      vess(`ub${s}`, 'gorputz-ultimobrankiala', line, mixHex(POUCH.p4, '#ffffff', 0.45), { r0: 0.09 * (1 - 0.6 * ubI), r1: 0.11 * (1 - 0.6 * ubI), flare: desc < 0.04 ? 0.4 : 0, flareLen: 0.12, bulb: 0.9, bulbLen: 0.28, sides: 12 }, v4, 1, { deep: POUCH.p4Deep });
      const pl = line[Math.round((line.length - 1) * 0.74 * v4)];
      if (s > 0) pts['gorputz-ultimobrankiala'] = [pl[0] + 0.03, pl[1], pl[2] - 0.11];
    }
    // ——— C cells: the ultimobranchial body's cells, now in the thyroid lobe ———
    if (ubI > 0.02 && thy > 0.5) {
      const dots: Parts[] = [];
      for (let j = 0; j < 16; j++) {
        const a = j * 2.4, rr = 0.25 * Math.sqrt((j + 0.5) / 16);
        const u = ss(j * 0.03, 0.5 + j * 0.03, ubI);
        if (u <= 0.01) continue;
        dots.push(blobParts({ center: SX(s, [LOBE_X + rr * Math.cos(a) * 0.9, LOBE_Y + rr * Math.sin(a) * 1.8, 0.56]), radii: [0.034 * u, 0.034 * u, 0.02 * u], rings: 5, sides: 7 }));
      }
      put(`c${s}`, 'c-zelulak', mergeParts(dots), mixHex(POUCH.p4, '#ffffff', 0.25), { deep: POUCH.p4Deep, tissue: 'epithelium', outline: false });
      if (s > 0) pts['c-zelulak'] = [LOBE_X - 0.02, LOBE_Y + 0.16, 0.5];
    }
  }

  // ———— the thyroid: U round the larynx from the front, open behind ————
  if (thy > 0.01) {
    const y = lerp(-1.6, LOBE_Y, ss(0, 1, thy));
    const k = 0.45 + 0.55 * thy;
    for (const s of [1, -1]) {
      ball(`lobe${s}`, 'tiroide-guruina', [s * LOBE_X, y, 0.86], [0.29 * k, 0.78 * k, 0.38 * k], '#d98068', { deep: '#70301f', tissue: 'mesenchyme' }, 1, 16, 20);
    }
    vess('isth', 'tiroide-guruina', L([[-LOBE_X * 0.9, y - 0.12, 1.02], [0, y - 0.18, 1.2], [LOBE_X * 0.9, y - 0.12, 1.02]], 14), '#d98068', { r0: 0.15 * k, r1: 0.15 * k, sides: 12, ref: [0, 1, 0] }, 1, 1, { deep: '#70301f', tissue: 'mesenchyme' });
    pts['tiroide-guruina'] = [LOBE_X + 0.05, y - 0.05, 0.5];
  }
  const ca = clamp01(pose.cartil);
  if (ca > 0.01) {
    // The larynx's cartilages, which the U hugs from the front.
    const ring = (y: number, r: number, col: string, deep: string, id: string) => {
      const line: V3[] = Array.from({ length: 22 }, (_, i) => {
        const t = -Math.PI * 0.5 + (i / 21) * Math.PI;
        return [r * Math.sin(t), y, 0.1 + 0.62 * Math.cos(t)];
      });
      vess(`ring${id}`, id, line, col, { r0: 0.09, r1: 0.09, sides: 10, ref: [0, 1, 0] }, ca, 1, { deep, tissue: 'cartilage' });
      pts[id] = [r, y, 0.12];
    };
    ring(-3.42, 0.56, ARCH.iv, ARCH_DEEP.iv, 'tiroide-kartilagoa');
    ring(-3.98, 0.52, ARCH.vi, ARCH_DEEP.vi, 'krikoide-kartilagoa');
  }

  // Foregut below: a name on the lumen.
  pts['aurreko-hestea'] = [0.1, yEnd(pose.neck) + 0.8, 0.3];

  // ———— arch II comes down over the clefts ————
  const fl = clamp01(pose.flap);
  if (fl > 0.01) {
    const closeK = sh.close;
    const fluid = clamp01(pose.fluid);
    const yTop = 1.02;
    const yTip = lerp(0.85, -2.72, fl);
    const NF = 46;
    for (const s of [1, -1]) {
      const inn = Array.from({ length: NF + 1 }, (_, i) => {
        const v = i / NF;
        const q = lerp(yTop, yTip, v);
        // Bulged where a kept sinus fills with fluid.
        return [FLAP_IN(q) + 0.34 * fluid * gauss(q + 0.8, 0.7), q] as [number, number];
      });
      const out = inn.map((p, i) => {
        const v = i / NF;
        const q = p[1];
        const th = lerp(0.6, 0.32, v) * Math.sqrt(clamp01((1 - v) / 0.1)) * (1 + 0.35 * fluid * gauss(q + 0.8, 0.7));
        return [p[0] + th, q] as [number, number];
      });
      const m = 1 - 0.0;
      const closedGap = closeK;
      // Mesenchyme of the fold, on the cut.
      const flDeps = [fl, fluid, closedGap, s];
      const midIn = inn.map((p, i) => [p[0] + 0.05 * (1 - closedGap), p[1]] as [number, number]);
      const midOut = out.map((p) => [p[0] - 0.05, p[1]] as [number, number]);
      const arr = (a: [number, number][], j: number) => a.map((p) => p[j]);
      items.push({ key: `fm${s}`, id: 'bigarren-arkua', groups: ['faringe-arkuak', 'mesenkima'], ...partsCached('ph18-fm', flDeps, 0, () => stripFrom(arr(midIn, 0), arr(midIn, 1), arr(midOut, 0), arr(midOut, 1), s)), color: mesCol(2), deep: mesDeep(2), tissue: 'mesenchyme', opacity: 1, outline: false });
      items.push({ key: `fe${s}`, id: 'ektodermoa', groups: [], ...partsCached('ph18-fe', flDeps, 0, () => stripFrom(arr(midOut, 0), arr(midOut, 1), arr(out, 0), arr(out, 1), s)), color: TISSUE.ecto, deep: TISSUE.ectoDeep, tissue: 'epithelium', opacity: 1, outline: false });
      // Its inner skin, gone when the fold fuses with what it covers.
      if (closedGap < 0.98) items.push({ key: `fi${s}`, id: 'ektodermoa', groups: [], ...partsCached('ph18-fi', flDeps, 0, () => stripFrom(arr(inn, 0), arr(inn, 1), arr(midIn, 0), arr(midIn, 1), s)), color: TISSUE.ecto, deep: TISSUE.ectoDeep, tissue: 'epithelium', opacity: 1 - closedGap, outline: false });
      // The fold's outside, swept round the body.
      items.push({ key: `fs${s}`, id: 'bigarren-arkua', groups: ['faringe-arkuak'], ...partsCached('ph18-fs', flDeps, 0, () => foldSkin(out, inn, s)), color: mixHex(LOBE_C[2], TISSUE.ecto, 0.2), deep: LOBE_D[2], tissue: 'skin', opacity: 1 });
      // The cervical sinus: the space left between the fold and the covered clefts.
      const nS = 34;
      const sinusIn: [number, number][] = [];
      const sinusOut: [number, number][] = [];
      const sTop = Math.min(0.55, yTop - 0.3);
      const sBot = Math.max(yTip + 0.12, -2.62);
      for (let i = 0; i <= nS; i++) {
        const q = lerp(sTop, sBot, i / nS);
        const r = rowAt(q);
        sinusIn.push([c.ox[r], q]);
        sinusOut.push([FLAP_IN(q) + 0.34 * fluid * gauss(q + 0.8, 0.7), q]);
      }
      const open = Math.max(0, fl > 0.1 ? 1 - closedGap : 0);
      if (open > 0.01) {
        const gap = Math.max(0, (sinusOut[Math.round(nS * 0.5)][0] - sinusIn[Math.round(nS * 0.5)][0]));
        if (gap > 0.002)
          items.push({ key: `sin${s}`, id: 'sinu-zerbikala', ...partsCached('ph18-sin', [fl, closedGap, fluid, s, sh.clefts], 0, () => stripFrom(arr(sinusIn, 0), arr(sinusIn, 1), arr(sinusOut, 0), arr(sinusOut, 1), s, 0.004)), color: fluid > 0.3 ? '#9dd3ff' : '#e9f1ff', deep: '#3f5d86', tissue: 'membrane', opacity: 1, outline: false });
      }
      if (s > 0) {
        const mid = Math.round(NF * 0.5);
        pts['bigarren-arkua-tolesa'] = [out[mid][0] - 0.2, out[mid][1], -0.01];
        const r = rowAt(-1.0);
        pts['sinu-zerbikala'] = [(c.ox[r] + FLAP_IN(-1.0)) / 2 + 0.01, -1.0, -0.02];
      }
      void m;
    }
    // A needle drawing off the fluid.
    const nd = clamp01(pose.needle);
    if (nd > 0.01) {
      const tipP: V3 = [FLAP_IN(-0.8) + 0.25, -0.8, -0.2];
      const base = add(tipP, [1.6, 0.05, -0.9]);
      const entry = mix3(base, tipP, nd);
      const shaft = L([add(entry, [1.1, 0.05, -0.6]), entry], 6);
      vess('needle', undefined, shaft, '#d9d9df', { r0: 0.02, r1: 0.02, sides: 8 }, 1, 1, { tissue: 'bone', quiet: true });
      vess('syringe', undefined, L([add(entry, [2.5, 0.12, -1.42]), add(entry, [1.1, 0.05, -0.6])], 6), '#e8eef8', { r0: 0.17, r1: 0.17, sides: 16 }, 1, 1, { tissue: 'bone', quiet: true });
    }
  }
  return { items, pts };
}

/** A strip between two polylines of equal length (not the body's rows). */
function stripFrom(ax: number[], ay: number[], bx: number[], by: number[], s: number, zOff = 0): Parts {
  const n = ax.length;
  const build = (step: number): Mesh => {
    const rows: number[] = [];
    for (let i = 0; i < n - 1; i += step) rows.push(i);
    rows.push(n - 1);
    const pos = new Float32Array(rows.length * 6);
    const nrm = new Float32Array(rows.length * 6);
    const uv = new Float32Array(rows.length * 4);
    rows.forEach((i, k) => {
      pos.set([s * ax[i], ay[i], zOff, s * bx[i], by[i], zOff], k * 6);
      nrm.set([0, 0, -1, 0, 0, -1], k * 6);
      uv.set([k / (rows.length - 1), 0, k / (rows.length - 1), 1], k * 4);
    });
    const idx = new Uint32Array((rows.length - 1) * 6);
    for (let k = 0; k < rows.length - 1; k++) {
      const a = k * 2, b = a + 1, c = a + 2, d = a + 3;
      if (s > 0) idx.set([a, b, c, b, d, c], k * 6);
      else idx.set([a, c, b, b, c, d], k * 6);
    }
    return { pos, nrm, uv, idx };
  };
  return { mesh: build(1), hit: build(Math.max(1, Math.ceil(n / 10))) };
}

/** The fold's section (outside, round its tip, inside) swept round the body to the midline. */
function foldSkin(out: [number, number][], inn: [number, number][], s: number): Parts {
  const path: [number, number][] = [...out, ...[...inn].reverse()];
  const NF = NA;
  const build = (nu: number, nv: number) =>
    grid(nu, nv, (u, v) => {
      const k = Math.round(u * (path.length - 1));
      const [x, y] = path[k];
      const a = v * 0.92;
      const dz = D_OUT(y) + (x - FLAP_IN(y)) * 0.55 + 0.05;
      return [s * x * Math.cos((a * Math.PI) / 2), y, dz * Math.sin((a * Math.PI) / 2)];
    }, [s * 60, 0, 60]);
  return { mesh: build(path.length - 1, NF), hit: build(Math.ceil((path.length - 1) / 6), Math.ceil(NF / 3)) };
}

/** The body's front, the ground the gut lies on (a rounded plate, seen from behind). */
function groundPlate(yBot: number): Parts {
  const outline = (n: number): [number, number][] =>
    Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      const c = Math.cos(a), sn = Math.sin(a);
      const yc = (4.95 + yBot) / 2, hy = (4.95 - yBot) / 2;
      return [4.95 * Math.sign(c) * Math.abs(c) ** 0.42, yc + hy * Math.sign(sn) * Math.abs(sn) ** 0.42];
    });
  const mk = (n: number): Mesh => {
    const o = outline(n);
    return grid(n, 1, (u, v) => {
      const k = Math.round(u * n) % n;
      const p = o[k];
      const yc = (4.95 + yBot) / 2;
      const q: V3 = [p[0] * v, yc + (p[1] - yc) * v, 3.3];
      return q;
    }, [0, 0, -60]);
  };
  return { mesh: mk(64), hit: mk(20) };
}

/** Cached parts: a piece of a surface that only changes with the shape. */
function partsCached(kind: string, deps: readonly number[], k: number, build: () => Parts): Parts {
  let built: Parts | null = null;
  const b = () => (built ??= build());
  return { mesh: cachedMesh(`${kind}:m`, [...deps, k], () => b().mesh), hit: cachedMesh(`${kind}:h`, [...deps, k], () => b().hit) };
}
