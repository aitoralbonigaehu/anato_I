import type { PoseModel } from '@/components/scenes/week17/common';
import { ARCH, ARCH_DEEP, TISSUE } from '@/components/scenes/week17/common';
import { mixHex } from '@/components/scenes/week10/model3d';
import { add, cross, type M4, norm, sub, type V3 } from '@/lib/three-d/math';
import { curve3, frames, grid, merge, tube, type Mesh } from '@/lib/three-d/mesh';
import { arcLengths, pointAt, resample, staticMesh, vessel, type Parts } from '@/lib/three-d/organic';
import type { Item3 } from '@/lib/three-d/scene';

/**
 * Topic 18, notes 3: the thyroid gland. One model from week 4 to the adult: the head and neck cut down the middle
 * and seen from the embryo's LEFT, as the notes' three sagittal figures (the face on the viewer's left). The bud
 * sinks from the floor of the pharynx at the foramen caecum, grows along its duct, travels down in front of the
 * hyoid to the level of the cricoid, the duct closes and only the pit stays; the same section grows into the adult
 * head; then it clears, and the same gland (it has spread into two lobes) hugs the larynx, seen from the front and
 * from behind with the four parathyroids.
 *
 * Axes as every model of the topic: x towards the embryo's LEFT, y cranial, z ventral.
 *
 * How the cut body is built: the lumen of the pharynx runs from the mouth to the neck's cut end, so it divides the
 * section into two solid pieces (roof and head above, floor and ventral neck below), each a flat cut face. Behind
 * the gap, the lumen's far wall is a real gutter. Every outline is a spline through key points that exist both for
 * the embryo and for the adult, so `adult` is one shape growing, not one picture swapped for another.
 */

export type P2 = readonly [number, number];

// ———————————————————————————— small kit (the tongue's and the tooth's models use it too) ————————————————————————————

export const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const ss = (a: number, b: number, x: number) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
export const darker = (c: string, k = 0.55) => mixHex(c, '#000000', k);
const round = (x: number) => Math.round(x * 2000) / 2000;

/** A smooth 2D line through key points. */
export function spline2(keys: readonly P2[], n: number): P2[] {
  return curve3(keys.map((k): V3 => [k[0], k[1], 0]), n).map((p): P2 => [p[0], p[1]]);
}
export const mixKeys = (a: readonly P2[], b: readonly P2[], k: number): P2[] => a.map((p, i): P2 => [lerp(p[0], b[i][0], k), lerp(p[1], b[i][1], k)]);

/** Indices of the triangles of a simple polygon (ear clipping, either winding). */
export function earclip(poly: readonly P2[]): number[] {
  const n = poly.length;
  let area = 0;
  for (let i = 0; i < n; i++) {
    const a = poly[i], b = poly[(i + 1) % n];
    area += a[0] * b[1] - b[0] * a[1];
  }
  const sign = area > 0 ? 1 : -1;
  const V = Array.from({ length: n }, (_, i) => i);
  const tri = (a: P2, b: P2, c: P2) => sign * ((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]));
  const out: number[] = [];
  let guard = n * n + 8;
  while (V.length > 3 && guard-- > 0) {
    let clipped = false;
    for (let i = 0; i < V.length; i++) {
      const ia = V[(i + V.length - 1) % V.length], ib = V[i], ic = V[(i + 1) % V.length];
      const a = poly[ia], b = poly[ib], c = poly[ic];
      if (tri(a, b, c) <= 1e-9) continue;
      let inside = false;
      for (const j of V) {
        if (j === ia || j === ib || j === ic) continue;
        const p = poly[j];
        if (tri(a, b, p) >= -1e-9 && tri(b, c, p) >= -1e-9 && tri(c, a, p) >= -1e-9) {
          inside = true;
          break;
        }
      }
      if (inside) continue;
      out.push(ia, ib, ic);
      V.splice(i, 1);
      clipped = true;
      break;
    }
    if (!clipped) V.shift();
  }
  if (V.length === 3) out.push(V[0], V[1], V[2]);
  return out;
}

/**
 * A flat cut face from a simple polygon. `to3` puts a 2D point in the world; the face looks along `nrm`. Built once
 * for each outline (the numbers of the outline and of `plane` are the cache key).
 */
export function faceMesh(kind: string, poly: readonly P2[], to3: (p: P2) => V3, nrm: V3, plane: readonly number[]): Mesh {
  const deps: number[] = [...plane];
  for (const p of poly) deps.push(round(p[0]), round(p[1]));
  return staticMesh(`face:${kind}`, deps, () => {
    const idx = earclip(poly);
    const pos = new Float32Array(poly.length * 3);
    const n = new Float32Array(poly.length * 3);
    const uv = new Float32Array(poly.length * 2);
    poly.forEach((p, i) => {
      const q = to3(p);
      pos.set(q, i * 3);
      n.set(nrm, i * 3);
      uv.set([0.5 + p[0] * 0.2, 0.5 + p[1] * 0.2], i * 2);
    });
    // Each triangle facing `nrm`.
    for (let t = 0; t < idx.length; t += 3) {
      const a = to3(poly[idx[t]]), b = to3(poly[idx[t + 1]]), c = to3(poly[idx[t + 2]]);
      const f = cross(sub(b, a), sub(c, a));
      if (f[0] * nrm[0] + f[1] * nrm[1] + f[2] * nrm[2] < 0) [idx[t + 1], idx[t + 2]] = [idx[t + 2], idx[t + 1]];
    }
    return { pos, nrm: n, uv, idx: new Uint32Array(idx) };
  });
}

/** A mesh and its coarser pointing copy for a flat polygon. */
export function faceParts(kind: string, poly: readonly P2[], to3: (p: P2) => V3, nrm: V3, plane: readonly number[]): Parts {
  const coarse = poly.filter((_, i) => i % 3 === 0);
  return { mesh: faceMesh(kind, poly, to3, nrm, plane), hit: faceMesh(`${kind}:c`, coarse.length >= 3 ? coarse : poly, to3, nrm, plane) };
}

/**
 * A surface with thickness and a rounded edge, from its middle surface: both faces meet along the border, where
 * the thickness runs out. A cartilage plate. `wrap` closes it in u (a ring).
 */
export function shellMesh(kind: string, deps: readonly number[], o: { nu: number; nv: number; at: (u: number, v: number) => V3; thick: (u: number, v: number) => number; wrap?: boolean; v0?: number; v1?: number }): Mesh {
  return staticMesh(`shell:${kind}`, [...deps, o.nu, o.nv, o.wrap ? 1 : 0, o.v0 ?? 0, o.v1 ?? 1], () => {
    const v0 = o.v0 ?? 0, v1 = o.v1 ?? 1;
    const P = (u: number, v: number) => o.at(u, v0 + (v1 - v0) * v);
    const T = (u: number, v: number) => o.thick(u, v0 + (v1 - v0) * v);
    const e = 1e-3;
    const nor = (u: number, v: number): V3 => norm(cross(sub(P(Math.min(1, u + e), v), P(Math.max(0, u - e), v)), sub(P(u, Math.min(1, v + e)), P(u, Math.max(0, v - e)))));
    // s runs 0→1 over the outer face, 1→2 back over the inner one.
    return grid(o.nu, o.nv * 2, (u, s2) => {
      const s = s2 * 2;
      const v = s <= 1 ? s : 2 - s;
      const side = s <= 1 ? 1 : -1;
      const uu = o.wrap ? u % 1 : u;
      const p = P(uu, v);
      const n = nor(Math.min(1 - e, Math.max(e, uu)), Math.min(1 - e, Math.max(e, v)));
      const t = T(uu, v) * side;
      return [p[0] + n[0] * t, p[1] + n[1] * t, p[2] + n[2] * t];
    });
  });
}

/** Rounded border of a plate: 0 at the edges of 0..1, 1 in the middle. */
export const rim = (x: number, power = 2.4) => Math.max(0, 1 - Math.abs(2 * x - 1) ** power) ** 0.5;

/** A translation and a uniform scale. */
export function trs(t: V3, s: number): M4 {
  const m = new Float32Array(16);
  m[0] = s;
  m[5] = s;
  m[10] = s;
  m[15] = 1;
  m[12] = t[0];
  m[13] = t[1];
  m[14] = t[2];
  return m;
}
export const atTrs = (t: V3, s: number, p: V3): V3 => [t[0] + p[0] * s, t[1] + p[1] * s, t[2] + p[2] * s];

/** Tiny bumps from a few sines: repeatable lobulation (the same each frame, nothing random). */
const lobule = (a: number, u: number) => (Math.sin(a * 5 + u * 31) * Math.sin(a * 3 - u * 23) + 0.6 * Math.sin(a * 9 + u * 57) * Math.sin(u * 41 + 1.3)) * 0.5;

// ———————————————————————————— the section's outlines ————————————————————————————

const E_SKIN_UP: P2[] = [[1.72, 0.24], [2.28, 0.55], [2.62, 1.15], [2.74, 1.92], [2.34, 2.76], [1.35, 3.26], [0.05, 3.36], [-1.35, 3.06], [-2.4, 2.22], [-2.95, 1.0], [-2.98, -0.3], [-2.78, -1.6], [-2.6, -3.1]];
const A_SKIN_UP: P2[] = [[1.72, -0.25], [2.08, 0.06], [2.48, 0.52], [2.02, 1.12], [2.16, 1.92], [1.42, 3.1], [0.0, 3.56], [-1.5, 3.22], [-2.5, 2.22], [-2.78, 0.9], [-2.34, -0.42], [-2.12, -2.0], [-2.22, -4.2]];
const E_ROOF: P2[] = [[1.72, 0.24], [1.42, 0.62], [0.95, 1.05], [0.5, 1.22], [0.0, 1.25], [-0.6, 1.2], [-1.2, 0.85], [-1.55, -0.4], [-1.55, -3.1]];
const A_ROOF: P2[] = [[1.72, -0.25], [1.38, 0.25], [0.95, 0.62], [0.4, 0.72], [-0.25, 0.7], [-0.78, 0.42], [-1.3, 0.55], [-1.62, -1.2], [-1.76, -4.2]];
const E_FLOOR: P2[] = [[1.72, -0.1], [1.42, -0.02], [0.95, 0.32], [0.6, 0.35], [0.22, 0.2], [-0.35, 0.3], [-0.85, 0.05], [-1.05, -1.2], [-1.05, -3.1]];
const A_FLOOR: P2[] = [[1.72, -0.62], [1.32, -0.42], [0.98, 0.02], [0.6, 0.34], [0.12, 0.3], [-0.45, 0.02], [-0.72, -0.75], [-1.26, -1.9], [-1.3, -4.2]];
const E_SKIN_DOWN: P2[] = [[1.72, -0.1], [2.08, -0.55], [1.78, -1.05], [1.22, -1.34], [1.26, -2.2], [1.3, -3.1]];
const A_SKIN_DOWN: P2[] = [[1.72, -0.62], [1.96, -1.02], [1.56, -1.5], [0.62, -1.7], [0.34, -2.75], [0.24, -4.2]];
const E_BRAIN: P2[] = [[1.75, 2.28], [1.2, 2.86], [0.1, 3.0], [-1.1, 2.72], [-2.05, 1.98], [-2.42, 0.92], [-2.3, -0.1], [-1.82, -0.28], [-1.62, 0.9], [-1.0, 1.6], [0.0, 1.72], [1.15, 1.62]];
const A_BRAIN: P2[] = [[1.72, 2.05], [1.25, 2.86], [0.05, 3.24], [-1.25, 2.95], [-2.2, 2.05], [-2.38, 1.1], [-2.0, 0.28], [-1.5, 0.3], [-1.2, 1.0], [-0.6, 1.5], [0.4, 1.7], [1.35, 1.55]];
/** The duct's way: from the foramen caecum, in front of the hyoid, to the level of the cricoid. */
const E_PATH: P2[] = [[0.22, 0.2], [0.24, -0.35], [0.2, -0.95], [0.04, -1.55], [-0.19, -2.0]];
const A_PATH: P2[] = [[0.12, 0.3], [0.04, -0.6], [-0.02, -1.25], [-0.16, -2.15], [-0.29, -3.33]];
const FC_KEY = 4;
const N_ROOF = 72;
const N_SKIN = 68;

const LARYNX_E: { t: V3; s: number } = { t: [0, -0.95, -0.48], s: 0.55 };
const LARYNX_A: { t: V3; s: number } = { t: [0, -1.43, -0.81], s: 1 };

/** A point of the section on the cut plane. */
const S = (p: P2, x = 0): V3 => [x, p[1], p[0]];

export interface ThyroidPose {
  /** The floor starts to sink at the foramen caecum (0..1). */
  dimple: number;
  /** The evagination grows into the mesenchyme (0..1); its central canal shows (0..1). */
  bud: number;
  canal: number;
  /** The gland's beginning swells at the duct's tip (0..1). */
  seed: number;
  /** The descent along the duct's way (0..1). */
  down: number;
  /** The hyoid and the laryngeal cartilages form (0..1). */
  hyoid: number;
  larynx: number;
  /** The duct closes, from the gland up (0..1); the pit stays. */
  close: number;
  /** The buccopharyngeal membrane: there (1) or broken away (0). */
  membrane: number;
  /** The section grows from the embryo's to the adult's (0..1). */
  adult: number;
  /** The route the duct left, dotted (0..1). */
  trace: number;
  /** The section clears away, leaving the larynx and the gland (0..1). */
  clear: number;
  /** The bud spreads into two lobes and an isthmus (0..1); it has the adult colour (0..1). */
  lobes: number;
  ripe: number;
  /** The four parathyroids (0..1); the thymus (0..1); the thymus shrunk with age (0..1); the pyramidal lobe (0..1). */
  para: number;
  thymus: number;
  thymusOld: number;
  pyramidal: number;
}

export const TP0: ThyroidPose = { dimple: 0, bud: 0, canal: 0, seed: 0, down: 0, hyoid: 0, larynx: 0, close: 0, membrane: 1, adult: 0, trace: 0, clear: 0, lobes: 0, ripe: 0, para: 0, thymus: 0, thymusOld: 0, pyramidal: 0 };

export interface ThyroidOpts {
  dim?: { ids: readonly string[]; k: number } | null;
}

const CUT_HEAD = '#c7a496';
const CUT_HEAD_DEEP = '#5f433a';
const CUT_FLOOR = '#d39fb0';
const CUT_FLOOR_DEEP = '#6e4150';
const BRAIN = '#ab9bc2';
const BRAIN_DEEP = '#4a3f60';
const FAR_WALL = '#d3b254';
const FAR_DEEP = '#6e5512';
const GLAND_YOUNG = '#f7b52d';
const GLAND_ADULT = '#b23c56';
const GLAND_DEEP = '#551626';
const PARA = '#ffd86b';
const THYMUS = '#e7dcc6';

/** The route the gland travels, at the moment's body proportions. */
function pathOf(adult: number): { line: V3[]; s: number[]; L: number } {
  const line = resample(curve3(mixKeys(E_PATH, A_PATH, adult).map((p) => S(p)), 40), 60);
  const s = arcLengths(line);
  return { line, s, L: s[s.length - 1] };
}

/** A half tube (its far half), seen from the side of `+x`: the inside of what the sagittal cut has opened. */
function gutter(kind: string, line: readonly V3[], r: (u: number) => number, deps: readonly number[]): Parts {
  const build = (nu: number, nv: number) =>
    staticMesh(`gutter:${kind}`, [...deps, nu, nv], () => {
      const fr = frames(line, [1, 0, 0]);
      return grid(
        nu,
        nv,
        (u, v) => {
          const i = Math.min(fr.length - 1, Math.round(u * (fr.length - 1)));
          const f = fr[i];
          const a = Math.PI * v;
          const e = cross([1, 0, 0], f.t);
          const rr = r(u);
          return [-Math.sin(a) * rr, f.p[1] + e[1] * Math.cos(a) * rr, f.p[2] + e[2] * Math.cos(a) * rr];
        },
        [5, 0, 0],
      );
    });
  return { mesh: build(Math.max(8, line.length - 1), 10), hit: build(8, 4) };
}

/** A band lying on the cut face along `line`, from the line to `w` to one side; `round` makes it puffy. */
function band(kind: string, line: readonly P2[], w: (u: number) => number, side: number, x: number, puff = 0.012): Parts {
  const deps: number[] = [side, x, puff];
  for (let i = 0; i < line.length; i += 2) deps.push(round(line[i][0]), round(line[i][1]), round(w(i / (line.length - 1))));
  const build = (nu: number) =>
    staticMesh(`band:${kind}`, [...deps, nu], () => {
      const pts = nu === line.length - 1 ? line : resample(line.map((p): V3 => [p[0], p[1], 0]), nu + 1).map((p): P2 => [p[0], p[1]]);
      const nrm = (i: number): P2 => {
        const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
        const dx = b[0] - a[0], dy = b[1] - a[1];
        const l = Math.hypot(dx, dy) || 1;
        return [-dy / l, dx / l];
      };
      return grid(
        nu,
        3,
        (u, v) => {
          const i = Math.round(u * nu);
          const n = nrm(i);
          const d = side * w(i / nu) * v;
          return [x + puff * Math.sin(Math.PI * v), pts[i][1] + n[1] * d, pts[i][0] + n[0] * d];
        },
        [6, 0, 0],
      );
    });
  return { mesh: build(Math.max(8, line.length - 1)), hit: build(10) };
}

// ———————————————————————————— the larynx (built once, placed by a matrix) ————————————————————————————

const DEG = Math.PI / 180;

function hyoidParts() {
  const body: V3[] = curve3([[-0.46, 0.0, 0.3], [-0.26, 0.02, 0.48], [0, 0.03, 0.54], [0.26, 0.02, 0.48], [0.46, 0.0, 0.3]], 24);
  const half = (from: number, to: number) => ({ mesh: tube(body, { radius: (u) => 0.095 * (0.86 + 0.14 * Math.sin(Math.PI * u)), ref: [0, 1, 0], from, to, sides: 12 }), hit: tube(resample(body, 8), { radius: () => 0.09, ref: [0, 1, 0], from, to, sides: 6 }) });
  const horn = (s: number): V3[] => curve3([[s * 0.42, 0.0, 0.34], [s * 0.66, 0.05, 0.05], [s * 0.72, 0.13, -0.32], [s * 0.7, 0.2, -0.62]], 16);
  const lesser = (s: number): V3[] => curve3([[s * 0.42, 0.04, 0.32], [s * 0.47, 0.2, 0.3], [s * 0.5, 0.33, 0.28]], 8);
  return {
    top: half(-Math.PI / 2, Math.PI / 2),
    bottom: half(Math.PI / 2, (Math.PI * 3) / 2),
    greater: merge([-1, 1].map((s) => tube(horn(s), { radius: (u) => lerp(0.09, 0.055, u) + 0.03 * ss(0.85, 1, u), ref: [0, 1, 0], sides: 10, capStart: true, capEnd: true }))),
    lesser: merge([-1, 1].map((s) => tube(lesser(s), { radius: (u) => lerp(0.075, 0.035, u), ref: [0, 0, 1], sides: 8, capStart: true, capEnd: true }))),
  };
}

const HALF_THY = 112 * DEG;
const thyAt = (u: number, v: number): V3 => {
  const th = (2 * u - 1) * HALF_THY;
  const prom = 0.1 * Math.exp(-((th / 0.34) ** 2));
  const r = 0.64 + prom;
  const top = -0.3 - 0.2 * Math.exp(-((th / 0.2) ** 2)) + 0.28 * ss(0.62, 1, Math.abs(th) / HALF_THY) ** 1.6;
  const bot = -1.18 + 0.06 * Math.cos(th) - 0.2 * ss(0.8, 1, Math.abs(th) / HALF_THY) ** 1.6;
  return [Math.sin(th) * r * 1.02, lerp(bot, top, v), Math.cos(th) * r];
};
const thyThick = (u: number, v: number) => 0.05 * rim(u, 3.5) * rim(v, 3.5);

const cricAt = (u: number, v: number): V3 => {
  const th = 2 * Math.PI * u;
  const back = ss(0.1, 0.95, 0.5 - 0.5 * Math.cos(th - Math.PI) * -1);
  const top = -1.28 + 0.46 * back;
  return [Math.sin(th) * 0.46, lerp(-1.58, top, v), Math.cos(th) * 0.46];
};
const cricThick = (_u: number, v: number) => 0.06 * rim(v, 4);

const epiAt = (u: number, v: number): V3 => {
  const x = (2 * u - 1) * lerp(0.2, 0.34, ss(0.1, 0.7, v));
  return [x, lerp(-0.7, 0.42, v), -0.16 + 0.18 * (v - 0.5) ** 2 - 0.9 * x * x - 0.05];
};
const epiThick = (u: number, v: number) => 0.032 * rim(u, 3) * rim(v, 2.6);

const trachLine: V3[] = curve3([[0, -1.5, 0], [0, -2.2, 0], [0, -3.2, 0], [0, -4.0, 0]], 40);
const trachea = (sides: number) =>
  tube(trachLine, {
    radius: (u) => 0.41 * (1 + 0.05 * Math.cos(u * 2 * Math.PI * 9)),
    around: (a) => (Math.cos(a) > 0.82 ? 0.9 : 1),
    ref: [0, 0, -1],
    sides,
    capStart: true,
    capEnd: true,
  });

let larynxMeshes: ReturnType<typeof buildLarynx> | null = null;
function buildLarynx() {
  const shell = (k: string, nu: number, nv: number, at: (u: number, v: number) => V3, thick: (u: number, v: number) => number, wrap = false, v0 = 0, v1 = 1) => ({
    mesh: shellMesh(k, [], { nu, nv, at, thick, wrap, v0, v1 }),
    hit: shellMesh(`${k}:c`, [], { nu: Math.round(nu / 3), nv: Math.max(3, Math.round(nv / 3)), at, thick, wrap, v0, v1 }),
  });
  return {
    hyoid: hyoidParts(),
    thyUp: shell('thyUp', 48, 14, thyAt, thyThick, false, 0.5, 1),
    thyDown: shell('thyDown', 48, 14, thyAt, thyThick, false, 0, 0.5),
    cric: shell('cric', 44, 10, cricAt, cricThick, true),
    epi: shell('epi', 22, 18, epiAt, epiThick),
    trach: { mesh: trachea(24), hit: trachea(10) },
  };
}
const larynxParts = () => (larynxMeshes ??= buildLarynx());

// ———————————————————————————— the gland ————————————————————————————

const R_ISTH = 0.56;

/** The gland, the isthmus at the origin (the trachea behind it, at z = −R): a ball when b = 0, two lobes when b = 1. */
function glandLine(b: number): { line: V3[]; r: (u: number) => number } {
  const line: V3[] = [];
  const N = 44;
  const ball = 0.34;
  for (let i = 0; i < N; i++) {
    const u = (i / (N - 1)) * 2 - 1;
    const au = Math.abs(u);
    const th = Math.sign(u) * 96 * DEG * ss(0.02, 0.62, au);
    const lobe: V3 = [Math.sin(th) * R_ISTH * 1.05, 0.17 * (1 - ss(0, 0.32, au)) - 0.26 * ss(0.1, 0.42, au) + 1.66 * ss(0.42, 1, au) ** 1.15, (Math.cos(th) - 1) * R_ISTH];
    const sph: V3 = [u * ball * 0.998, 0, 0];
    line.push([lerp(sph[0], lobe[0], b), lerp(sph[1], lobe[1], b), lerp(sph[2], lobe[2], b)]);
  }
  const lobeR = (au: number) => lerp(0.135, 0.345, ss(0.08, 0.42, au)) * (1 - 0.42 * ss(0.55, 1, au)) * Math.sqrt(Math.max(0, 1 - ss(0.86, 1, au) ** 2));
  const r = (x: number) => {
    const u = x * 2 - 1;
    const au = Math.abs(u);
    return Math.max(0.004, lerp(ball * Math.sqrt(Math.max(0, 1 - u * u)), lobeR(au), b));
  };
  return { line, r };
}

function glandParts(b: number): Parts {
  const k = Math.round(b * 400) / 400;
  const build = (sides: number, step: number) =>
    staticMesh('thyroid-gland', [k, sides, step], () => {
      const { line, r } = glandLine(k);
      const pts = line.filter((_, i) => i % step === 0 || i === line.length - 1);
      const flat = 0.42 * k;
      return tube(pts, { radius: r, around: (a, u) => (1 - flat * Math.cos(a) ** 2) * (1 + 0.035 * lobule(a, u)), ref: [0, 0, 1], sides, capStart: true, capEnd: true });
    });
  return { mesh: build(30, 1), hit: build(12, 3) };
}

/** Where a parathyroid lies on the gland: `u` along a lobe, on the side facing backwards. */
function lobePoint(b: number, u: number, side: number): V3 {
  const { line } = glandLine(b);
  const i = Math.round(((side * u + 1) / 2) * (line.length - 1));
  return line[Math.max(0, Math.min(line.length - 1, i))];
}

// ———————————————————————————— the model ————————————————————————————

export function thyroidModel(pose: ThyroidPose, _o: ThyroidOpts = {}): PoseModel {
  const items: Item3[] = [];
  const pts: Record<string, V3> = {};
  const k = ss(0, 1, pose.adult);
  const dimple = ss(0, 1, pose.dimple);
  const bud = clamp01(pose.bud);
  const clear = ss(0, 1, pose.clear);
  const show = 1 - clear;
  const ctx: Partial<Item3> = { opacity: 1, show, quiet: true, ground: true, outline: false };

  // ———— the outlines of this moment ————
  const skinUp = spline2(mixKeys(E_SKIN_UP, A_SKIN_UP, k), N_SKIN);
  const skinDown = spline2(mixKeys(E_SKIN_DOWN, A_SKIN_DOWN, k), 34);
  const roof = spline2(mixKeys(E_ROOF, A_ROOF, k), N_ROOF);
  const floorKeys = mixKeys(E_FLOOR, A_FLOOR, k);
  const FCp = floorKeys[FC_KEY];
  const floor0 = spline2(floorKeys, N_ROOF);
  // The floor's pit: deep while the bud leaves it, shallower once the duct has closed (the foramen caecum stays).
  const pitD = 0.08 * dimple + 0.2 * ss(0.1, 0.8, bud) * (1 - 0.72 * ss(0, 1, pose.close));
  const pit = (z: number) => pitD * Math.exp(-(((z - FCp[0]) / 0.1) ** 2));
  const floor = floor0.map((p, i): P2 => (i < N_ROOF * 0.75 ? [p[0], p[1] - pit(p[0])] : p));
  const fcIdx = floor.reduce((b, p, i) => (Math.abs(p[0] - FCp[0]) < Math.abs(floor[b][0] - FCp[0]) && i < N_ROOF * 0.75 ? i : b), 0);

  // ———— the body in the cut: head and roof above the lumen, floor and ventral neck below it ————
  if (show > 0.005) {
    const bottomY = lerp(-3.1, -4.2, k);
    const upper = [...roof, ...skinUp.slice().reverse().slice(0, -1)];
    const lower = [...floor, ...skinDown.slice().reverse().slice(0, -1)];
    items.push({ key: 'head', id: undefined, ...faceParts('th-head', upper, S, [1, 0, 0], [0]), color: CUT_HEAD, deep: CUT_HEAD_DEEP, tissue: 'mesenchyme', ...ctx });
    items.push({ key: 'floor', ...faceParts('th-floor', lower, S, [1, 0, 0], [0]), color: CUT_FLOOR, deep: CUT_FLOOR_DEEP, tissue: 'mesenchyme', ...ctx });
    // The brain in the head: tissue and its hollow.
    const brain = spline2([...mixKeys(E_BRAIN, A_BRAIN, k), mixKeys(E_BRAIN, A_BRAIN, k)[0]], 72).slice(0, -1);
    items.push({ key: 'brain', ...faceParts('th-brain', brain, (p) => S(p, 0.012), [1, 0, 0], [0]), color: BRAIN, deep: BRAIN_DEEP, tissue: 'neural', ...ctx });
    const bc: P2 = [brain.reduce((a, p) => a + p[0], 0) / brain.length, brain.reduce((a, p) => a + p[1], 0) / brain.length];
    const hollow = brain.map((p): P2 => [bc[0] + (p[0] - bc[0]) * 0.62, bc[1] + (p[1] - bc[1]) * 0.55]);
    items.push({ key: 'brainHollow', ...faceParts('th-brainH', hollow, (p) => S(p, 0.02), [1, 0, 0], [0]), color: '#3b3346', deep: '#17121f', tissue: 'mesenchyme', ...ctx });
    // The skin along the outside (ectoderm), a thin band of the cut.
    const skin = [...skinUp, ...[...skinDown].reverse().slice(0)].filter((_, i) => i % 1 === 0);
    items.push({ key: 'skinUp', ...band('th-skinU', skinUp, () => 0.07, 1, 0.022, 0.006), color: TISSUE.ecto, deep: TISSUE.ectoDeep, tissue: 'skin', ...ctx });
    items.push({ key: 'skinDown', ...band('th-skinD', skinDown, () => 0.07, -1, 0.022, 0.006), color: TISSUE.ecto, deep: TISSUE.ectoDeep, tissue: 'skin', ...ctx });
    void skin;
    // The eye: in the figure, a disc beside the face (embryo only).
    const eye = spline2(Array.from({ length: 21 }, (_, i): P2 => [1.95 + 0.17 * Math.cos((i / 20) * 2 * Math.PI), 1.28 + 0.17 * Math.sin((i / 20) * 2 * Math.PI)]), 41).slice(0, -1);
    if (k < 0.5) items.push({ key: 'eye', ...faceParts('th-eye', eye, (p) => S(p, 0.024), [1, 0, 0], [0]), color: '#e9b2a6', deep: '#8a4a42', tissue: 'mesenchyme', ...ctx, show: show * (1 - ss(0, 0.5, k)) });
    // The far wall of the lumen: a real gutter behind the gap, lined with endoderm; in front of the membrane, the stomodeum.
    const memU = N_ROOF * 0.19;
    const roofLine = roof.map((p): V3 => S(p));
    const floorLine = floor.map((p): V3 => S(p));
    const iMem = Math.round(memU);
    const gut = (kind: string, a: number, b: number, id: string | undefined, color: string, deep: string, groups?: string[]) => {
      const nu = (b - a) * 2;
      const deps: number[] = [a, b, round(k), round(pitD)];
      const build = (n: number, m: number) =>
        staticMesh(`far:${kind}`, [...deps, n, m], () =>
          grid(
            n,
            m,
            (u, v) => {
              const i = a + (b - a) * u;
              const f = Math.min(N_ROOF - 1, i);
              const i0 = Math.floor(f), i1 = Math.min(N_ROOF - 1, i0 + 1), t = f - i0;
              const R: V3 = [0, lerp(roofLine[i0][1], roofLine[i1][1], t), lerp(roofLine[i0][2], roofLine[i1][2], t)];
              const F: V3 = [0, lerp(floorLine[i0][1], floorLine[i1][1], t), lerp(floorLine[i0][2], floorLine[i1][2], t)];
              const an = Math.PI * v;
              const c = 0.5 - 0.5 * Math.cos(an);
              return [-Math.sin(an) * 0.95, lerp(F[1], R[1], c), lerp(F[2], R[2], c)];
            },
            [4, 0, 0],
          ),
        );
      items.push({ key: `far-${kind}`, id, groups, mesh: build(Math.round(nu), 12), hit: build(10, 4), color, deep, tissue: 'epithelium', ...ctx, quiet: !id, ground: true });
    };
    gut('sto', 0, iMem, 'estomodeoa', mixHex(TISSUE.ecto, '#6b8fb0', 0.35), '#2b4a66');
    gut('phx', iMem, N_ROOF - 1, 'faringe-hestea', FAR_WALL, FAR_DEEP);
    pts['estomodeoa'] = S(lerp2(roof[Math.round(memU * 0.45)], floor[Math.round(memU * 0.45)], 0.5), -0.02);
    pts['faringe-hestea'] = S(lerp2(roof[Math.round(N_ROOF * 0.42)], floor[Math.round(N_ROOF * 0.42)], 0.55), -0.03);
    // The endoderm lining, along the gap's two edges (it turns to ectoderm in front of the membrane).
    const lining = (key: string, line: P2[], side: number, a: number, b: number, color: string, deep: string, id?: string) => items.push({ key, id, groups: id ? undefined : undefined, ...band(`th-${key}`, line.slice(a, b + 1), () => 0.075, side, 0.03, 0.01), color, deep, tissue: 'epithelium', ...ctx, quiet: true, ground: !id, show });
    lining('roofE', roof, 1, iMem, N_ROOF - 1, TISSUE.endo, TISSUE.endoDeep);
    lining('floorE', floor, -1, iMem, N_ROOF - 1, TISSUE.endo, TISSUE.endoDeep);
    lining('roofS', roof, 1, 0, iMem, TISSUE.ecto, TISSUE.ectoDeep);
    lining('floorS', floor, -1, 0, iMem, TISSUE.ecto, TISSUE.ectoDeep);
    // The membrane: from roof to floor, at the back of the stomodeum, while it is there.
    const mb = clamp01(pose.membrane);
    if (mb > 0.01) {
      const line: V3[] = curve3([S(roof[iMem], 0.04), S(lerp2(roof[iMem], floor[iMem], 0.5), 0.04), S(floor[iMem], 0.04)], 8);
      const mem = vessel(line, { r0: 0.05, r1: 0.05, sides: 10, n: 10, ref: [1, 0, 0] }, 1);
      if (mem) items.push({ key: 'membrane', id: 'mintz-bukofaringeoa', ...mem, color: '#f4e7ac', deep: '#8e7c3a', tissue: 'membrane', opacity: 1, show: show * mb, thin: 0.5 });
      pts['mintz-bukofaringeoa'] = S(lerp2(roof[iMem], floor[iMem], 0.5), 0.06);
    }
    // The tongue under the floor's surface: its body (arch I) in front of the pit, its root (arches II–IV) behind it.
    const depth = (u: number) => lerp(0.2, 1.05, k) * Math.sin(Math.PI * clamp01(u)) ** 0.7;
    const a0 = Math.round(N_ROOF * 0.2);
    const a2 = Math.round(N_ROOF * lerp(0.76, 0.78, k));
    const bodyLine = floor.slice(a0, fcIdx + 1);
    const rootLine = floor.slice(fcIdx, a2 + 1);
    const span = a2 - a0;
    const uOf = (i: number) => i / span;
    items.push({ key: 'tongueBody', id: k > 0.6 ? 'mihiaren-gorputza' : 'tuberkulu-bakoitia', groups: ['mihia', 'tuberkulu-bakoitia', 'mihiaren-gorputza'], ...band('th-tgb', bodyLine, (u) => depth(uOf(u * (fcIdx - a0))), -1, 0.018, 0.018), color: ARCH.i, deep: ARCH_DEEP.i, tissue: 'muscle', opacity: 1, show });
    items.push({ key: 'tongueRoot', id: k > 0.6 ? 'mihiaren-sustraia' : 'kopula', groups: ['mihia', 'kopula', 'mihiaren-sustraia'], ...band('th-tgr', rootLine, (u) => depth(uOf(fcIdx - a0 + u * (a2 - fcIdx))) * lerp(1, 1.5, k * Math.sin(Math.PI * clamp01(u))), -1, 0.018, 0.018), color: ARCH.iii, deep: ARCH_DEEP.iii, tissue: 'muscle', opacity: 1, show });
    const anchorB = floor[Math.round(lerp(a0, fcIdx, 0.55))];
    const anchorR = floor[Math.round(lerp(fcIdx, a2, 0.4))];
    pts['tuberkulu-bakoitia'] = S([anchorB[0], anchorB[1] - depth(0.3) * 0.55], 0.03);
    pts['kopula'] = S([anchorR[0], anchorR[1] - depth(0.7) * 0.5], 0.03);
    pts['mihiaren-gorputza'] = pts['tuberkulu-bakoitia'];
    pts['mihia'] = pts['tuberkulu-bakoitia'];
    pts['mihiaren-sustraia'] = pts['kopula'];
    // In the adult: the palate's bony shelf and soft part, the jaw, the spine. They grow in with the head.
    if (k > 0.05) {
      const ad = ss(0.25, 1, k);
      const palate = roof.slice(Math.round(N_ROOF * 0.2), Math.round(N_ROOF * 0.45));
      const soft = roof.slice(Math.round(N_ROOF * 0.44), Math.round(N_ROOF * 0.66));
      items.push({ key: 'hardPal', id: 'aho-sabai-gogorra', ...band('th-hp', palate, () => 0.13, 1, 0.034, 0.01), color: TISSUE.bone, deep: TISSUE.boneDeep, tissue: 'bone', opacity: 1, show: show * ad, quiet: true });
      items.push({ key: 'softPal', id: 'aho-sabai-biguna', ...band('th-sp', soft, () => 0.15, 1, 0.034, 0.01), color: '#e79aa6', deep: '#7b3c47', tissue: 'mesenchyme', opacity: 1, show: show * ad, quiet: true });
      const hp = palate[Math.round(palate.length * 0.5)];
      const sp = soft[Math.round(soft.length * 0.45)];
      pts['aho-sabai-gogorra'] = S([hp[0], hp[1] + 0.07], 0.05);
      pts['aho-sabai-biguna'] = S([sp[0], sp[1] + 0.08], 0.05);
      const jawKeys: P2[] = [[1.62, -0.92], [1.7, -1.25], [1.42, -1.46], [0.9, -1.42], [0.82, -1.24], [1.28, -1.16], [1.36, -0.94], [1.5, -0.86], [1.62, -0.92]];
      const jaw = spline2(jawKeys, 50).slice(0, -1);
      items.push({ key: 'jaw', ...faceParts('th-jaw', jaw, (p) => S(p, 0.03), [1, 0, 0], [0]), color: TISSUE.bone, deep: TISSUE.boneDeep, tissue: 'bone', ...ctx, show: show * ad });
      const spine = curve3([[0, -0.1, -2.1], [0, -1.4, -2.0], [0, -2.9, -2.02], [0, -4.0, -2.05]], 7);
      spine.forEach((p, i) => items.push({ key: `vert${i}`, ...vertebra(p), color: TISSUE.bone, deep: TISSUE.boneDeep, tissue: 'bone', ...ctx, show: show * ad }));
    }
    void bottomY;
  }

  // ———— the duct ————
  const path = pathOf(k);
  const L0 = 0.55; // How far the evagination reaches before the descent.
  const tipS = Math.min(path.L, lerp(L0 * ss(0.05, 1, bud), path.L, ss(0, 1, pose.down)));
  const tip = pointAt(path.line, path.s, tipS);
  const close = clamp01(pose.close);
  const base = S([FCp[0], FCp[1] - pitD * 0.7]);
  const start = add(base, [0, 0.02, 0]);
  if (tipS > 0.01 && close < 0.998) {
    const u1 = tipS / path.L;
    // Fragments: the duct thins from the gland upwards, beading as it goes, until only the pit is left.
    const drawn = (n: number) => Array.from({ length: n }, (_, i): V3 => {
      const q = pointAt(path.line, path.s, (tipS * i) / (n - 1));
      return i === 0 ? start : q;
    });
    const line = drawn(48);
    const rOf = (x: number) => {
      const rr = lerp(0.075, 0.05, ss(0.2, 1, pose.down)) * (1 + 0.8 * Math.exp(-x * 9));
      const front = 1 - close * 1.45;
      const gone = ss(front - 0.1, front + 0.1, 1 - x);
      const bead = 1 + 0.55 * close * Math.cos(x * 34) * (1 - x);
      return Math.max(0.003, rr * (1 - gone) * bead);
    };
    const canal = ss(0, 1, pose.canal);
    if (canal < 0.999) {
      items.push({ key: 'duct', id: 'hodi-tiroglosoa', mesh: tube(line, { radius: rOf, ref: [1, 0, 0], sides: 12, capStart: true, capEnd: true }), hit: tube(resample(line, 10), { radius: rOf, ref: [1, 0, 0], sides: 8, capStart: true, capEnd: true }), color: TISSUE.endo, deep: TISSUE.endoDeep, tissue: 'epithelium', opacity: 1, show: 1 - canal });
    }
    if (canal > 0.001) {
      // Opened by the cut: the far half of the wall, the canal dark inside it, the near edges standing.
      const deps = [round(tipS), round(k), round(close), round(pose.down)];
      const open = gutter('thy-duct', line, rOf, deps);
      items.push({ key: 'ductFar', id: 'hodi-tiroglosoa', ...open, color: '#8d6a15', deep: '#3a2a05', tissue: 'epithelium', opacity: 1, show: canal });
      const edge = (s: number) =>
        tube(line.map((p, i): V3 => [p[0] + 0.012, p[1] + s * rOf(i / 47) * nz(line, i)[0], p[2] + s * rOf(i / 47) * nz(line, i)[1]]), { radius: (x) => 0.32 * rOf(x), ref: [1, 0, 0], sides: 8, capStart: true, capEnd: true });
      items.push({ key: 'ductEdges', id: 'hodi-tiroglosoa', mesh: merge([edge(1), edge(-1)]), hit: merge([edge(1), edge(-1)]), color: TISSUE.endo, deep: TISSUE.endoDeep, tissue: 'epithelium', opacity: 1, show: canal });
    }
    pts['hodi-tiroglosoa'] = add(pointAt(path.line, path.s, Math.min(tipS * 0.55, tipS)), [0.03, 0, 0]);
    void u1;
  }
  // The pit (a body of its own: a small dark dimple on the lining, named).
  {
    const r = 0.02 + 0.075 * Math.min(1, dimple + bud);
    if (dimple + bud > 0.01) {
      const m = merge([tube(curve3([add(base, [0.04, 0.08, 0]), add(base, [0.04, -0.03, 0]), add(base, [0.04, -0.08, 0])], 8), { radius: () => r * 0.7, ref: [1, 0, 0], sides: 10, capStart: true, capEnd: true })]);
      items.push({ key: 'pit', id: 'zulo-itsua', mesh: m, hit: m, color: '#5a3a12', deep: '#1e1205', tissue: 'epithelium', opacity: 1, show });
    }
    pts['zulo-itsua'] = add(base, [0.06, 0.0, 0]);
  }
  // The dotted route, after the duct has gone (as the notes' adult figure).
  if (pose.trace > 0.01) {
    const n = 22;
    const dots: Mesh[] = [];
    for (let i = 1; i < n; i++) {
      const p = pointAt(path.line, path.s, (path.L * i) / n);
      dots.push(staticMesh('route-dot', [round(p[0]), round(p[1]), round(p[2])], () => dotMesh(add(p, [0.05, 0, 0]), 0.035)));
    }
    const m = merge(dots);
    items.push({ key: 'route', id: 'hodi-tiroglosoa', mesh: m, hit: m, color: '#f4efe2', deep: '#6e675a', opacity: 1, show: show * clamp01(pose.trace), outline: false, tissue: 'membrane' });
    pts['hodi-tiroglosoa'] = add(pointAt(path.line, path.s, path.L * 0.32), [0.06, 0, 0]);
  }

  // ———— the larynx, placed by the moment's proportions ————
  const lp = larynxParts();
  const LT: V3 = [lerp(LARYNX_E.t[0], LARYNX_A.t[0], k), lerp(LARYNX_E.t[1], LARYNX_A.t[1], k), lerp(LARYNX_E.t[2], LARYNX_A.t[2], k)];
  const LS = lerp(LARYNX_E.s, LARYNX_A.s, k);
  const placed = (key: string, id: string | undefined, parts: Parts | { mesh: Mesh; hit: Mesh }, color: string, deep: string, g: number, tissue: Item3['tissue'], groups?: string[]) => {
    if (g <= 0.01) return;
    items.push({ key, id, groups, ...parts, matrix: trs(LT, LS * lerp(0.6, 1, ss(0, 1, g))), color, deep, tissue, opacity: 1, show: ss(0, 0.5, g) });
  };
  const hy = clamp01(pose.hyoid);
  const lx = clamp01(pose.larynx);
  placed('hyoT', 'hioide-hezurra', lp.hyoid.top, ARCH.ii, ARCH_DEEP.ii, hy, 'cartilage', ['hioide-gorputza']);
  placed('hyoB', 'hioide-hezurra', lp.hyoid.bottom, ARCH.iii, ARCH_DEEP.iii, hy, 'cartilage', ['hioide-gorputza']);
  placed('hyoG', 'hioide-hezurra', { mesh: lp.hyoid.greater, hit: lp.hyoid.greater }, ARCH.iii, ARCH_DEEP.iii, hy, 'cartilage', ['hioide-adar-nagusia']);
  placed('hyoL', 'hioide-hezurra', { mesh: lp.hyoid.lesser, hit: lp.hyoid.lesser }, ARCH.ii, ARCH_DEEP.ii, hy, 'cartilage', ['hioide-adar-txikia']);
  placed('thyU', 'tiroide-kartilagoa', lp.thyUp, ARCH.iv, ARCH_DEEP.iv, lx, 'cartilage');
  placed('thyD', 'tiroide-kartilagoa', lp.thyDown, ARCH.vi, ARCH_DEEP.vi, lx, 'cartilage');
  placed('cric', 'krikoide-kartilagoa', lp.cric, ARCH.vi, ARCH_DEEP.vi, lx, 'cartilage');
  placed('epi', 'epiglotisa', lp.epi, ARCH.iv, ARCH_DEEP.iv, lx * (1 - clear * 0), 'cartilage');
  placed('trach', 'trakea', lp.trach, '#d9d2c2', '#6f675a', lx, 'cartilage');
  const L = (p: V3): V3 => atTrs(LT, LS, p);
  pts['hioide-hezurra'] = L([0.24, -0.015, 0.5]);
  pts['tiroide-kartilagoa'] = L([0.5, -0.65, 0.44]);
  pts['krikoide-kartilagoa'] = L([0.32, -1.45, 0.33]);
  pts['epiglotisa'] = L([0.16, 0.3, -0.12]);
  pts['trakea'] = L([0.27, -2.75, 0.31]);

  // ———— the gland: a ball at the duct's end, later two lobes round the larynx ————
  const seed = ss(0, 1, pose.seed);
  const lobes = ss(0, 1, pose.lobes);
  if (seed > 0.01) {
    const parts = glandParts(lobes);
    const color = mixHex(GLAND_YOUNG, GLAND_ADULT, ss(0, 1, pose.ripe));
    const size = lerp(0.2, 1, seed) * LS * lerp(0.75, 1, ss(0, 1, pose.down));
    // The ball sits on the duct's way; the two lobes round the trachea, the isthmus at the way's end.
    const c: V3 = [tip[0], tip[1], tip[2]];
    items.push({ key: 'gland', id: 'tiroide-guruina', ...parts, matrix: trs(c, size), color, deep: mixHex('#7a4708', GLAND_DEEP, ss(0, 1, pose.ripe)), tissue: 'epithelium', opacity: 1 });
    const P = (p: V3) => atTrs(c, size, p);
    // Names: the isthmus in the middle, the left lobe, the right lobe.
    pts['tiroide-guruina'] = P(lobes > 0.5 ? lobePoint(lobes, 0.62, 1) : [0.05, 0.05, 0.2]);
    pts['tiroide-istmoa'] = P([0, 0.06, 0.13]);
    pts['ezkerreko-lobulua'] = P(add(lobePoint(lobes, 0.62, 1), [0.14, 0, 0.1]));
    pts['eskuineko-lobulua'] = P(add(lobePoint(lobes, 0.62, -1), [-0.14, 0, 0.1]));
    // Id'd parts (invisible apart from naming: the isthmus and the two lobes are lit by colour on the same gland).
    if (lobes > 0.05) {
      items.push({ key: 'isthmusMark', id: 'tiroide-istmoa', groups: ['tiroide-guruina'], ...glandIsthmusParts(lobes), matrix: trs(c, size), color, deep: mixHex('#7a4708', GLAND_DEEP, ss(0, 1, pose.ripe)), tissue: 'epithelium', opacity: lobes });
    }

    // The four parathyroids, on the back of the lobes (they appear on the same gland, seen when the view turns).
    const para = clamp01(pose.para);
    if (para > 0.01) {
      const mk = (key: string, id: string, u: number, side: number, r: number) => {
        const q = add(lobePoint(1, u, side), [0, 0, -0.26]);
        const m = staticMesh(`para:${key}`, [q[0], q[1], q[2], r], () => dotMesh(q, r, [1.12, 0.9, 0.75]));
        items.push({ key, id, mesh: m, hit: m, matrix: trs(c, size * lerp(0.4, 1, ss(0, 1, para))), color: id === 'goiko-paratiroidea' ? PARA : '#ffbe5a', deep: '#8f6412', tissue: 'epithelium', opacity: 1, show: ss(0, 0.4, para) });
        pts[`${key}-p`] = P(add(q, [0, 0, -0.05]));
      };
      mk('ptUL', 'goiko-paratiroidea', 0.74, 1, 0.1);
      mk('ptUR', 'goiko-paratiroidea', 0.74, -1, 0.1);
      mk('ptLL', 'beheko-paratiroidea', 0.42, 1, 0.1);
      mk('ptLR', 'beheko-paratiroidea', 0.42, -1, 0.1);
      pts['goiko-paratiroidea'] = pts['ptUL-p'];
      pts['beheko-paratiroidea'] = pts['ptLL-p'];
    }

    // The pyramidal lobe: the last piece of the duct, left standing on the isthmus (towards the left lobe).
    const pyr = clamp01(pose.pyramidal);
    if (pyr > 0.01) {
      const line: V3[] = curve3([[0.04, 0.05, 0.04], [0.12, 0.42, 0.07], [0.2, 0.92, 0.1], [0.22, 1.42, 0.12]], 24);
      const v = vessel(line, { r0: 0.13, r1: 0.05, flare: 0.8, flareLen: 0.2, sides: 12 }, pyr);
      if (v) items.push({ key: 'pyramid', id: 'lobulu-piramidala', groups: ['tiroide-guruina'], ...v, matrix: trs(c, size), color, deep: GLAND_DEEP, tissue: 'epithelium', opacity: 1 });
      pts['lobulu-piramidala'] = P([0.2, 0.92, 0.2]);
    }

    // The thymus: below the gland, large in the child, small in the adult.
    const thy = clamp01(pose.thymus);
    if (thy > 0.01) {
      const old = ss(0, 1, pose.thymusOld);
      const scale = lerp(1, 0.42, old);
      const mkLobe = (s: number): Parts => {
        const line: V3[] = curve3([[s * 0.04, -0.72, 0.08], [s * 0.3, -1.25, 0.15], [s * 0.42, -2.0, 0.18], [s * 0.3, -2.62, 0.12]], 22);
        return vessel(line.map((p): V3 => [p[0] * lerp(1, 0.8, old), -0.72 + (p[1] + 0.72) * scale, p[2]]), { r0: 0.16 * scale, r1: 0.26 * scale, bulb: 0.4, bulbLen: 0.5, sides: 16, flat: 0.45, ref: [0, 0, 1] }, 1)!;
      };
      for (const s of [1, -1]) items.push({ key: `thymus${s}`, id: 'timoa', ...mkLobe(s), matrix: trs(c, size), color: mixHex(THYMUS, '#b7ab96', old), deep: '#6b6250', tissue: 'mesenchyme', opacity: 1, show: ss(0, 0.5, thy) });
      pts['timoa'] = P([0.4, -0.72 - 1.2 * scale, 0.22]);
    }
  }
  pts['tiroide-guruina'] ??= tip;

  return { items, pts };
}

const lerp2 = (a: P2, b: P2, k: number): P2 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

/** In-plane unit normal of a line at i, in the plane x = const (returned as [y, z]). */
function nz(line: readonly V3[], i: number): [number, number] {
  const a = line[Math.max(0, i - 1)], b = line[Math.min(line.length - 1, i + 1)];
  const dy = b[1] - a[1], dz = b[2] - a[2];
  const l = Math.hypot(dy, dz) || 1;
  return [-dz / l, dy / l];
}

function dotMesh(c: V3, r: number, squash: V3 = [1, 1, 1]): Mesh {
  const nu = 12, nv = 8;
  return grid(
    nu,
    nv,
    (u, v) => {
      const th = v * Math.PI, ph = u * Math.PI * 2;
      const q: V3 = [Math.sin(th) * Math.cos(ph), Math.cos(th), Math.sin(th) * Math.sin(ph)];
      return [c[0] + q[0] * r * squash[0], c[1] + q[1] * r * squash[1], c[2] + q[2] * r * squash[2]];
    },
    [c[0], c[1] + 10, c[2]],
  );
}

function vertebra(p: V3): { mesh: Mesh; hit: Mesh } {
  const m = staticMesh('th-vert', [p[0], p[1], p[2]], () => dotMesh([0.04, p[1], p[2]], 0.26, [0.3, 0.72, 0.95]));
  return { mesh: m, hit: m };
}

/** A slim overlay on the isthmus, so the isthmus can be named and lit on its own (same colour as the gland). */
function glandIsthmusParts(b: number): Parts {
  const k = Math.round(b * 400) / 400;
  const build = (sides: number) =>
    staticMesh('thyroid-isthmus', [k, sides], () => {
      const { line, r } = glandLine(k);
      const mid = line.slice(15, 29);
      return tube(mid, { radius: (x) => r((15 + x * 13) / 43) * 1.015, around: (a) => 1 - 0.42 * k * Math.cos(a) ** 2, ref: [0, 0, 1], sides, capStart: true, capEnd: true });
    });
  return { mesh: build(20), hit: build(10) };
}
