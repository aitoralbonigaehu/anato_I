// @ts-expect-error three ships this module without typings.
import earcut from 'three/src/extras/lib/earcut.js';
import type { Mesh } from './mesh';
import { surfaceMesh, type SDF } from './sdf';
import type { V3 } from './math';

/**
 * Exact flat cuts and extruded profiles, where a surface grid cannot be trusted:
 *
 * - A thin layer (a meninx, a membrane) meshed straight from its distance field needs a grid finer than its
 *   thickness, or both of its faces fall in one cell and the mesh breaks into dark teeth. Here a layer is built from
 *   its two faces, each the surface of a thick solid, so any grid fits.
 * - A solid cut by a plane (the brain halved, a block of cord) meshed with the cut in its field gets a staircase
 *   along the cut's rim. Here the uncut surface is clipped exactly at the plane, and the cut face is a flat cap
 *   traced on a fine 2D grid and triangulated (earcut).
 * - A prism (anything drawn as a 2D section extruded along z) is built from its outline: straight walls, two caps.
 */

export type F2 = (u: number, v: number) => number;
type P2 = [number, number];
type MutableV3 = [number, number, number];

/**
 * The closed outlines of the region g < 0 (marching squares over [lo, hi] at step h), each oriented with the region
 * on its left: outer outlines counter-clockwise, holes clockwise. The grid is padded so every outline closes.
 */
export function contourLoops(g: F2, lo: P2, hi: P2, h: number): P2[][] {
  const u0 = lo[0] - h, v0 = lo[1] - h;
  const nu = Math.ceil((hi[0] - lo[0]) / h) + 3, nv = Math.ceil((hi[1] - lo[1]) / h) + 3;
  const val = new Float64Array(nu * nv);
  // Narrow band: a coarse grid first, fine samples only where the outline can be near (a distance-like field).
  const B = 4, cu = Math.ceil((nu - 1) / B) + 1, cv = Math.ceil((nv - 1) / B) + 1;
  const coarse = new Float64Array(cu * cv);
  for (let j = 0; j < cv; j++) for (let i = 0; i < cu; i++) coarse[i + cu * j] = g(u0 + i * B * h, v0 + j * B * h);
  const reach = B * h * 1.9;
  for (let j = 0; j < nv; j++)
    for (let i = 0; i < nu; i++) {
      const c = coarse[Math.round(i / B) + cu * Math.round(j / B)];
      const x = Math.abs(c) > reach ? c : g(u0 + i * h, v0 + j * h);
      const border = i === 0 || j === 0 || i === nu - 1 || j === nv - 1;
      val[i + nu * j] = border ? Math.max(1e-9, Math.abs(x)) : x;
    }
  const V = (i: number, j: number) => val[i + nu * j];
  // Encode each horizontal edge as an even index and each vertical edge as an odd index.
  const Hid = (i: number, j: number) => 2 * (i + nu * j);
  const Vid = (i: number, j: number) => 2 * (i + nu * j) + 1;
  const point = new Map<number, P2>();
  const cross = (id: number): P2 => {
    let p = point.get(id);
    if (p) return p;
    const c = id >> 1, i = c % nu, j = (c - i) / nu;
    const a = V(i, j);
    const b = id & 1 ? V(i, j + 1) : V(i + 1, j);
    const t = a / (a - b);
    p = id & 1 ? [u0 + i * h, v0 + (j + t) * h] : [u0 + (i + t) * h, v0 + j * h];
    point.set(id, p);
    return p;
  };
  const next = new Map<number, number>();
  for (let j = 0; j < nv - 1; j++)
    for (let i = 0; i < nu - 1; i++) {
      // Corners counter-clockwise and the edges between them, in the same order.
      const a = V(i, j), b = V(i + 1, j), c = V(i + 1, j + 1), d = V(i, j + 1);
      const inside = a < 0;
      if ((b < 0) === inside && (c < 0) === inside && (d < 0) === inside) continue;
      const e = [Hid(i, j), Vid(i + 1, j), Hid(i, j + 1), Vid(i, j)];
      const ins = [inside, b < 0, c < 0, d < 0];
      const out: number[] = [], into: number[] = [];
      for (let q = 0; q < 4; q++) {
        if (ins[q] === ins[(q + 1) % 4]) continue;
        (ins[q] ? out : into).push(q);
      }
      if (!out.length) continue;
      if (out.length === 1) {
        next.set(e[out[0]], e[into[0]]);
        continue;
      }
      // A saddle: the centre decides whether the inside corners join (cut the outside corners off) or not.
      const joined = a + b + c + d < 0;
      for (const q of out) {
        let r = q;
        if (joined) {
          do r = (r + 1) % 4;
          while (!into.includes(r));
        } else {
          do r = (r + 3) % 4;
          while (!into.includes(r));
        }
        next.set(e[q], e[r]);
      }
    }
  const loops: P2[][] = [];
  const seen = new Set<number>();
  for (const start of next.keys()) {
    if (seen.has(start)) continue;
    const loop: P2[] = [];
    let id: number | undefined = start;
    while (id !== undefined && !seen.has(id)) {
      seen.add(id);
      loop.push(cross(id));
      id = next.get(id);
    }
    if (id !== start) continue;
    const lean = simplify(loop, h * 0.03);
    if (lean.length >= 3) loops.push(lean);
  }
  return loops;
}

/** Drop the points that lie on the line through their neighbours (straight runs make sliver triangles). */
function simplify(loop: P2[], tol: number): P2[] {
  const out: P2[] = [];
  const n = loop.length;
  for (let i = 0; i < n; i++) {
    const a = out.length ? out[out.length - 1] : loop[n - 1], p = loop[i], b = loop[(i + 1) % n];
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const len = Math.hypot(dx, dy);
    const off = len < 1e-12 ? Math.hypot(p[0] - a[0], p[1] - a[1]) : Math.abs((p[0] - a[0]) * dy - (p[1] - a[1]) * dx) / len;
    if (off > tol) out.push(p);
  }
  return out;
}

const area2 = (l: P2[]) => {
  let a = 0;
  for (let i = 0; i < l.length; i++) {
    const p = l[i], q = l[(i + 1) % l.length];
    a += p[0] * q[1] - q[0] * p[1];
  }
  return a / 2;
};
const insideLoop = (l: P2[], p: P2) => {
  let c = false;
  for (let i = 0, j = l.length - 1; i < l.length; j = i++) {
    const a = l[i], b = l[j];
    if (a[1] > p[1] !== b[1] > p[1] && p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]) c = !c;
  }
  return c;
};

/** The region inside `loops` as triangles, each counter-clockwise: points and index triples. */
export function fillLoops(loops: P2[][]): { pts: P2[]; tris: number[] } {
  const withA = loops.map((l) => ({ l, a: area2(l) }));
  const outers = withA.filter((x) => x.a > 0).sort((a, b) => a.a - b.a);
  const holes = outers.map(() => [] as P2[][]);
  for (const hl of withA.filter((x) => x.a < 0)) {
    const k = outers.findIndex((o) => insideLoop(o.l, hl.l[0]));
    if (k >= 0) holes[k].push(hl.l);
  }
  const pts: P2[] = [], tris: number[] = [];
  outers.forEach((o, k) => {
    const base = pts.length;
    const data: number[] = [], holeIdx: number[] = [];
    const add = (l: P2[]) => l.forEach((p) => (data.push(p[0], p[1]), pts.push(p)));
    add(o.l);
    for (const hl of holes[k]) {
      holeIdx.push(data.length / 2);
      add(hl);
    }
    const t: number[] = earcut(data, holeIdx, 2);
    for (let i = 0; i < t.length; i += 3) {
      const a = pts[base + t[i]], b = pts[base + t[i + 1]], c = pts[base + t[i + 2]];
      const ccw = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]) > 0;
      tris.push(base + t[i], base + (ccw ? t[i + 1] : t[i + 2]), base + (ccw ? t[i + 2] : t[i + 1]));
    }
  });
  return { pts, tris };
}

class Builder {
  pos: number[] = [];
  nrm: number[] = [];
  idx: number[] = [];
  v(p: V3, n: V3) {
    this.pos.push(p[0], p[1], p[2]);
    this.nrm.push(n[0], n[1], n[2]);
    return this.pos.length / 3 - 1;
  }
  mesh(): Mesh {
    return { pos: new Float32Array(this.pos), nrm: new Float32Array(this.nrm), uv: new Float32Array((this.pos.length / 3) * 2), idx: new Uint32Array(this.idx) };
  }
}

/**
 * The 2D region d2 < 0 (x, y) extruded from z0 to z1: walls straight along z (normals from the outline, smooth
 * except at sharp corners) and two flat caps. Exact at any thinness: `h` only sets how finely the outline is traced.
 */
export function extrudeProfile(d2: F2, lo: P2, hi: P2, h: number, z0: number, z1: number): Mesh {
  const loops = contourLoops(d2, lo, hi, h);
  const b = new Builder();
  for (const l of loops) {
    const n = l.length;
    // Each segment's outward normal (the region is on the loop's left, so outward is to the right).
    const sn = l.map((p, i) => {
      const q = l[(i + 1) % n];
      const dx = q[0] - p[0], dy = q[1] - p[1];
      const len = Math.hypot(dx, dy) || 1;
      return [dy / len, -dx / len] as P2;
    });
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      // Vertex normals: averaged with the neighbouring segment unless the turn is sharp (then flat).
      const at = (k: number, seg: number): V3 => {
        const other = k === seg ? (seg + n - 1) % n : (seg + 1) % n;
        const a = sn[seg], o = sn[other];
        if (a[0] * o[0] + a[1] * o[1] < 0.6) return [a[0], a[1], 0];
        const x = a[0] + o[0], y = a[1] + o[1], len = Math.hypot(x, y) || 1;
        return [x / len, y / len, 0];
      };
      const ni = at(i, i), nj = at(j, i);
      const A = b.v([l[i][0], l[i][1], z0], ni), B = b.v([l[j][0], l[j][1], z0], nj);
      const C = b.v([l[j][0], l[j][1], z1], nj), D = b.v([l[i][0], l[i][1], z1], ni);
      b.idx.push(A, B, C, A, C, D);
    }
  }
  const { pts, tris } = fillLoops(loops);
  for (const [z, s] of [[z1, 1], [z0, -1]] as const) {
    const base = b.pos.length / 3;
    for (const p of pts) b.v([p[0], p[1], z], [0, 0, s]);
    for (let t = 0; t < tris.length; t += 3)
      if (s > 0) b.idx.push(base + tris[t], base + tris[t + 1], base + tris[t + 2]);
      else b.idx.push(base + tris[t], base + tris[t + 2], base + tris[t + 1]);
  }
  return b.mesh();
}

/** Keep 1 retains coordinates at or below the cut plane. Keep -1 retains coordinates at or above it. */
export interface Cut {
  axis: 0 | 1 | 2;
  at: number;
  keep: 1 | -1;
}

/** Clip a mesh at a plane exactly: triangles crossing it are cut along it (no saw teeth). */
function clip(m: Mesh, c: Cut): Mesh {
  const P = m.pos, N = m.nrm;
  const b = new Builder();
  const nv = P.length / 3;
  const keepV = new Int32Array(nv).fill(-1);
  const cutV = new Map<number, number>();
  const s = (i: number) => c.keep * (P[i * 3 + c.axis] - c.at);
  const vert = (i: number) => {
    if (keepV[i] < 0)
      keepV[i] = b.v([P[i * 3], P[i * 3 + 1], P[i * 3 + 2]], [N[i * 3], N[i * 3 + 1], N[i * 3 + 2]]);
    return keepV[i];
  };
  const edge = (i: number, j: number) => {
    if (s(i) === 0) return vert(i);
    if (s(j) === 0) return vert(j);
    const key = i < j ? i * nv + j : j * nv + i;
    let k = cutV.get(key);
    if (k === undefined) {
      const t = s(i) / (s(i) - s(j));
      const p: MutableV3 = [0, 0, 0], n: MutableV3 = [0, 0, 0];
      for (let a = 0; a < 3; a++) {
        p[a] = P[i * 3 + a] + (P[j * 3 + a] - P[i * 3 + a]) * t;
        n[a] = N[i * 3 + a] + (N[j * 3 + a] - N[i * 3 + a]) * t;
      }
      p[c.axis] = c.at;
      const l = Math.hypot(n[0], n[1], n[2]) || 1;
      cutV.set(key, (k = b.v(p, [n[0] / l, n[1] / l, n[2] / l])));
    }
    return k;
  };
  for (let t = 0; t < m.idx.length; t += 3) {
    const a = m.idx[t], bb = m.idx[t + 1], cc = m.idx[t + 2];
    const aIn = s(a) <= 0, bIn = s(bb) <= 0, cIn = s(cc) <= 0;
    if (!aIn && !bIn && !cIn) continue;
    if (aIn && bIn && cIn) {
      b.idx.push(vert(a), vert(bb), vert(cc));
      continue;
    }
    // Walk the triangle in order, keeping inside corners and the crossings: a triangle or a quad, same winding.
    const tri = [a, bb, cc], inside = [aIn, bIn, cIn];
    const poly: number[] = [];
    for (let q = 0; q < 3; q++) {
      const a = tri[q], bb = tri[(q + 1) % 3];
      if (inside[q]) poly.push(vert(a));
      if (inside[q] !== inside[(q + 1) % 3]) poly.push(edge(a, bb));
    }
    for (let q = 1; q + 1 < poly.length; q++)
      if (poly[0] !== poly[q] && poly[0] !== poly[q + 1] && poly[q] !== poly[q + 1])
        b.idx.push(poly[0], poly[q], poly[q + 1]);
  }
  return b.mesh();
}

/**
 * Cache a field on a fixed lattice shared by surfaces at different offsets and by their caps.
 * ask for the same points again and again. Points off the lattice are computed as usual.
 */
export function onLattice(f: SDF, lo: V3, hi: V3, h: number): SDF {
  const n = [0, 1, 2].map((a) => Math.max(1, Math.ceil((hi[a] - lo[a]) / h) + 4));
  const memo = new Float32Array(n[0] * n[1] * n[2]).fill(NaN);
  const idx = (x: number, o: number, len: number) => {
    const t = (x - o) / h;
    const i = Math.round(t);
    return Math.abs(t - i) < 1e-6 && i >= 0 && i < len ? i : -1;
  };
  return (x, y, z) => {
    const i = idx(x, lo[0], n[0]), j = idx(y, lo[1], n[1]), k = idx(z, lo[2], n[2]);
    if (i < 0 || j < 0 || k < 0) return f(x, y, z);
    const key = i + n[0] * (j + n[1] * k);
    let v = memo[key];
    if (v !== v) memo[key] = v = f(x, y, z);
    return v;
  };
}

/** Reverse a mesh's faces (an inner face of a layer looks inwards). */
function flipMesh(m: Mesh): Mesh {
  const idx = Uint32Array.from(m.idx);
  for (let t = 0; t < idx.length; t += 3) {
    const s = idx[t + 1];
    idx[t + 1] = idx[t + 2];
    idx[t + 2] = s;
  }
  return { ...m, nrm: m.nrm.map((x) => -x), idx };
}

function mergeMeshes(ms: Mesh[]): Mesh {
  const coordinates = ms.reduce((sum, m) => sum + m.pos.length, 0);
  const pos = new Float32Array(coordinates), nrm = new Float32Array(coordinates);
  const idx = new Uint32Array(ms.reduce((sum, m) => sum + m.idx.length, 0));
  let offset = 0, index = 0;
  for (const m of ms) {
    pos.set(m.pos, offset);
    nrm.set(m.nrm, offset);
    const base = offset / 3;
    for (const i of m.idx) idx[index++] = base + i;
    offset += m.pos.length;
  }
  return { pos, nrm, idx, uv: new Float32Array((coordinates / 3) * 2) };
}

export interface CutSolid {
  /**
   * The faces, each the surface of an uncut field (no cut in it), or a surface already built (reaching past the
   * cuts); an inner face of a layer has `flip`, and `push` moves a face along its normals (a hair, so two layers'
   * faces never coincide).
   */
  faces: (({ f: SDF } | { mesh: Mesh }) & { flip?: boolean; push?: number })[];
  /** The solid's own field (inside < 0), read on the cut planes for the caps. */
  solid: SDF;
  /** The kept box (the faces' grid reaches a little past the cuts). */
  lo: V3;
  hi: V3;
  step: number;
  cuts: Cut[];
  /** The caps' 2D tracing step (fine: it only costs 2D samples). */
  capStep: number;
}

/**
 * A solid (or a layer) cut by planes: its faces from their own fields, clipped exactly at each plane, and a flat
 * cap on each plane where the solid is cut. The cap is traced from the solid's field, so it is exact however thin
 * the layer or sharp the rim.
 */
export function cutSolid(o: CutSolid): Mesh {
  const lo: MutableV3 = [...o.lo], hi: MutableV3 = [...o.hi];
  for (const c of o.cuts) {
    if (c.keep > 0) hi[c.axis] = Math.max(hi[c.axis], c.at + 2 * o.step);
    else lo[c.axis] = Math.min(lo[c.axis], c.at - 2 * o.step);
  }
  const parts: Mesh[] = [];
  for (const face of o.faces) {
    let m = 'mesh' in face ? face.mesh : surfaceMesh(face.f, lo, hi, o.step);
    if (face.push) m = { ...m, pos: m.pos.map((x, i) => x + m.nrm[i] * face.push!) };
    if (face.flip) m = flipMesh(m);
    for (const c of o.cuts) m = clip(m, c);
    parts.push(m);
  }
  for (const c of o.cuts) {
    const [ua, va] = ([0, 1, 2] as const).filter((a) => a !== c.axis) as [0 | 1 | 2, 0 | 1 | 2];
    const others = o.cuts.filter((x) => x !== c);
    const at = (u: number, v: number): V3 => {
      const p: MutableV3 = [0, 0, 0];
      p[c.axis] = c.at;
      p[ua] = u;
      p[va] = v;
      return p;
    };
    // The solid on the plane, inside the other cuts too.
    const g: F2 = (u, v) => {
      const p = at(u, v);
      let d = o.solid(p[0], p[1], p[2]);
      for (const x of others) d = Math.max(d, x.keep * (p[x.axis] - x.at));
      return d;
    };
    const loops = contourLoops(g, [o.lo[ua], o.lo[va]], [o.hi[ua], o.hi[va]], o.capStep);
    const { pts, tris } = fillLoops(loops);
    if (!tris.length) continue;
    const n: MutableV3 = [0, 0, 0];
    n[c.axis] = c.keep;
    const b = new Builder();
    for (const p of pts) b.v(at(p[0], p[1]), n);
    // Wind each triangle to face along the cap's outward normal.
    const ok = (c.axis === 1 ? -1 : 1) === c.keep;
    for (let t = 0; t < tris.length; t += 3) {
      b.idx.push(tris[t], ok ? tris[t + 1] : tris[t + 2], ok ? tris[t + 2] : tris[t + 1]);
    }
    parts.push(b.mesh());
  }
  return mergeMeshes(parts);
}
