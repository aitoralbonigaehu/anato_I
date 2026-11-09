import { perfCount } from '@/lib/perf';
import type { Mesh } from './mesh';
import type { V3 } from './math';
import type { Parts } from './organic';

/**
 * One continuous deforming skin with named regions (docs/handover/topic-17-18-plan.md, "One continuous skin"):
 * the face of topic 18, the floor of the pharynx and the tongue.
 *
 * A grid over a parameter square, displaced for each pose by whatever the caller writes (`build`). The regions are
 * cut out of that grid once, in MATERIAL coordinates, so a region's outline is carried along with the tissue as the
 * surface deforms. Everything the regions share is computed on the whole field, so no seam shows where one meets
 * the next:
 *
 * - positions and normals come from the one grid (a border vertex is the same point, with the same normal, in the
 *   two regions that meet there);
 * - a border is a smooth curve, not a staircase: grid triangles are split where the two regions' weights are equal;
 * - a border is soft: each vertex has a colour multiplier towards its neighbour (`Mesh.tint`), so colours melt into
 *   each other over `soft` of weight. The tint is static, in material space. Highlighting stays per region (each is
 *   its own `Item3` with `id`, colour and glow);
 * - the tissue's fine texture is sampled at the material point (`Mesh.rest`), so it does not swim as the skin moves.
 *
 * Cost: the cut is done once. A pose fills one position array (the caller's field), normals by central differences
 * on the grid, then copies per region; a pose already built is returned as the very same mesh objects, so nothing
 * downstream redoes its work. Buffers are recycled, so playing a morph allocates nothing per frame.
 *
 *   const surf = fieldSurface({ key: 'tongue', nu: 120, nv: 90, chart: (u, v) => [u, v], regions: [...], colors: {...} });
 *   const parts = surf.build([pose.g], (a, b, out, at) => { out[at] = ...; out[at + 1] = ...; out[at + 2] = ...; });
 *   items.push({ key: 'body', id: 'mihia', ...parts.body, color: ..., soft: 1 });
 */

export interface FieldRegion {
  /** The region's name in `build`'s result. */
  name: string;
  /** How much of this region the material point (a, b) is: the highest weight wins, borders are where two are equal. Smooth. */
  weight: (a: number, b: number) => number;
}

export interface FieldSpec {
  /** Identifies the surface (a memo key; nothing global is read). */
  key: string;
  /** Grid cells along u and v. */
  nu: number;
  nv: number;
  /** Material coordinates of the parameter point (u, v), both 0..1. */
  chart: (u: number, v: number) => readonly [number, number];
  /** The u = 0 and u = 1 columns are the same tissue (a surface closed round): they share normals. */
  wrapU?: boolean;
  /** Row v = 0 / v = 1 is one point (a pole). */
  poleV0?: boolean;
  poleV1?: boolean;
  /** Which side is the front: by default the triangles face along ∂P/∂u × ∂P/∂v. */
  flip?: boolean;
  regions: readonly FieldRegion[];
  /** Region colours as authored (the tint is relative to them). Missing: that region gets no tint towards it. */
  colors: Readonly<Record<string, string>>;
  /** Width of the colour's melt, in units of weight (default 0.04). 0: hard borders. */
  soft?: number;
  /** Grid lines between the coarse mesh's (default 4): pointing and the flat fallback. */
  hitEvery?: number;
}

/** Writes the 3 coordinates of material point (a, b) at out[at..at+2]; `v` is the grid vertex (for per-vertex caches). */
export type FieldPlace = (a: number, b: number, out: Float32Array, at: number, v: number) => void;

export interface FieldSurface {
  /** Grid vertices (nu + 1) × (nv + 1), in order column × (nv + 1) + row. */
  n: number;
  /** Material coordinates of every grid vertex (a0, b0, a1, b1, ...). */
  material: Float32Array;
  /** The winning region's index at each grid vertex. */
  label: Uint8Array;
  /** The surface at a pose, per region. `deps` must name every number the field reads. */
  build(deps: readonly number[], place: FieldPlace): Record<string, Parts>;
  /** Point of the field built last, at parameter (u, v) (nearest grid vertex; for names and anchors). */
  pointAt(u: number, v: number): V3;
}

const hexRgb = (hex: string): [number, number, number] => {
  const s = hex.replace('#', '');
  const n = parseInt(s.length === 3 ? s.split('').map((c) => c + c).join('') : s, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

interface Piece {
  /** Vertices of the region: grid vertex (≥ 0) or −1 − cut index. */
  verts: Int32Array;
  idx: Uint32Array;
  uv: Float32Array;
  tint: Float32Array | undefined;
  rest: Float32Array;
  /** Coarse mesh: grid vertices and triangles. */
  hitVerts: Int32Array;
  hitIdx: Uint32Array;
  hitUv: Float32Array;
}

interface Built {
  key: string;
  parts: Record<string, Parts>;
}

export function fieldSurface(spec: FieldSpec): FieldSurface {
  perfCount('fieldCut');
  const { nu, nv } = spec;
  const cols = nu + 1;
  const rows = nv + 1;
  const n = cols * rows;
  const at = (i: number, j: number) => i * rows + j;
  const R = spec.regions.length;
  const material = new Float32Array(n * 2);
  const weights = new Float32Array(n * R);
  const label = new Uint8Array(n);
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++) {
      const v = at(i, j);
      const [a, b] = spec.chart(i / nu, j / nv);
      material[v * 2] = a;
      material[v * 2 + 1] = b;
      let best = 0, bw = -Infinity;
      for (let r = 0; r < R; r++) {
        const w = spec.regions[r].weight(a, b);
        weights[v * R + r] = w;
        if (w > bw) {
          bw = w;
          best = r;
        }
      }
      label[v] = best;
    }

  // ———— the cut, once, in material space ————
  // A cut vertex: up to three grid parents and their shares (an edge's point has two, a triple point three).
  const cutP: number[] = [];
  const cutW: number[] = [];
  const edgeCut = new Map<number, number>();
  const newCut = (p0: number, p1: number, p2: number, w0: number, w1: number, w2: number) => {
    cutP.push(p0, p1, p2);
    cutW.push(w0, w1, w2);
    return cutP.length / 3 - 1;
  };
  /** The point where the two labels' weights are equal on the edge (a, b). */
  const onEdge = (a: number, b: number) => {
    const key = a < b ? a * n + b : b * n + a;
    let c = edgeCut.get(key);
    if (c === undefined) {
      const la = label[a], lb = label[b];
      const da = weights[a * R + la] - weights[a * R + lb];
      const db = weights[b * R + la] - weights[b * R + lb];
      const t = Math.min(0.98, Math.max(0.02, da / Math.max(1e-9, da - db)));
      c = newCut(a, b, b, 1 - t, t, 0);
      edgeCut.set(key, c);
    }
    return -1 - c;
  };
  const tris: number[][] = spec.regions.map(() => []);
  const pushTri = (r: number, a: number, b: number, c: number) => tris[r].push(a, b, c);
  const tri = (a: number, b: number, c: number) => {
    const la = label[a], lb = label[b], lc = label[c];
    if (la === lb && lb === lc) {
      pushTri(la, a, b, c);
      return;
    }
    if (la !== lb && lb !== lc && la !== lc) {
      // Three regions: they meet at a triple point in the middle.
      const m = -1 - newCut(a, b, c, 1 / 3, 1 / 3, 1 / 3);
      const ab = onEdge(a, b), bc = onEdge(b, c), ca = onEdge(c, a);
      pushTri(la, a, ab, m);
      pushTri(la, a, m, ca);
      pushTri(lb, b, bc, m);
      pushTri(lb, b, m, ab);
      pushTri(lc, c, ca, m);
      pushTri(lc, c, m, bc);
      return;
    }
    // Two regions: one corner alone.
    let p = a, q = b, s = c;
    if (lb !== la && lb !== lc) [p, q, s] = [b, c, a];
    else if (lc !== la && lc !== lb) [p, q, s] = [c, a, b];
    const pq = onEdge(p, q), sp = onEdge(s, p);
    pushTri(label[p], p, pq, sp);
    pushTri(label[q], pq, q, s);
    pushTri(label[q], pq, s, sp);
  };
  for (let i = 0; i < nu; i++)
    for (let j = 0; j < nv; j++) {
      const a = at(i, j), b = at(i, j + 1), c = at(i + 1, j), d = at(i + 1, j + 1);
      if (spec.flip) {
        tri(a, b, c);
        tri(b, d, c);
      } else {
        tri(a, c, b);
        tri(b, c, d);
      }
    }

  // The colour's melt: per grid vertex, the soft mix of the regions round it.
  const soft = spec.soft ?? 0.04;
  const rgb = spec.regions.map((r) => (spec.colors[r.name] ? hexRgb(spec.colors[r.name]) : null));
  const mixAt = new Float32Array(n * 3);
  if (soft > 0)
    for (let v = 0; v < n; v++) {
      const top = weights[v * R + label[v]];
      let sum = 0, cr = 0, cg = 0, cb = 0;
      for (let r = 0; r < R; r++) {
        const c = rgb[r];
        if (!c) continue;
        const k = Math.exp((weights[v * R + r] - top) / soft);
        if (k < 0.004) continue;
        sum += k;
        cr += c[0] * k;
        cg += c[1] * k;
        cb += c[2] * k;
      }
      if (sum > 0) {
        mixAt[v * 3] = cr / sum;
        mixAt[v * 3 + 1] = cg / sum;
        mixAt[v * 3 + 2] = cb / sum;
      } else {
        const c = rgb[label[v]] ?? [1, 1, 1];
        mixAt[v * 3] = c[0];
        mixAt[v * 3 + 1] = c[1];
        mixAt[v * 3 + 2] = c[2];
      }
    }

  // Per region: its vertices, in the order of first use.
  const hitEvery = Math.max(1, spec.hitEvery ?? 4);
  const hitCols = Math.floor(nu / hitEvery);
  const hitRows = Math.floor(nv / hitEvery);
  const hitTris: number[][] = spec.regions.map(() => []);
  for (let i = 0; i < hitCols; i++)
    for (let j = 0; j < hitRows; j++) {
      const i0 = i * hitEvery, j0 = j * hitEvery;
      const i1 = Math.min(nu, i0 + hitEvery), j1 = Math.min(nv, j0 + hitEvery);
      const r = label[at(Math.round((i0 + i1) / 2), Math.round((j0 + j1) / 2))];
      const a = at(i0, j0), b = at(i0, j1), c = at(i1, j0), d = at(i1, j1);
      if (spec.flip) hitTris[r].push(a, b, c, b, d, c);
      else hitTris[r].push(a, c, b, b, c, d);
    }

  const pieces = spec.regions.map((reg, r): Piece => {
    const local = new Map<number, number>();
    const verts: number[] = [];
    const idx = tris[r].map((v) => {
      let k = local.get(v);
      if (k === undefined) {
        k = verts.length;
        local.set(v, k);
        verts.push(v);
      }
      return k;
    });
    const uv = new Float32Array(verts.length * 2);
    const rest = new Float32Array(verts.length * 3);
    const own = rgb[r];
    const tint = soft > 0 && own ? new Float32Array(verts.length * 3) : undefined;
    verts.forEach((v, k) => {
      let u = 0, w = 0, ma = 0, mb = 0;
      let mr = 0, mg = 0, mbb = 0;
      const add = (g: number, s: number) => {
        u += (Math.floor(g / rows) / nu) * s;
        w += ((g % rows) / nv) * s;
        ma += material[g * 2] * s;
        mb += material[g * 2 + 1] * s;
        mr += mixAt[g * 3] * s;
        mg += mixAt[g * 3 + 1] * s;
        mbb += mixAt[g * 3 + 2] * s;
      };
      if (v >= 0) add(v, 1);
      else {
        const c = -1 - v;
        add(cutP[c * 3], cutW[c * 3]);
        if (cutW[c * 3 + 1]) add(cutP[c * 3 + 1], cutW[c * 3 + 1]);
        if (cutW[c * 3 + 2]) add(cutP[c * 3 + 2], cutW[c * 3 + 2]);
      }
      uv[k * 2] = u;
      uv[k * 2 + 1] = w;
      rest[k * 3] = ma;
      rest[k * 3 + 1] = mb;
      rest[k * 3 + 2] = 0;
      if (tint && own) {
        tint[k * 3] = mr / Math.max(0.03, own[0]);
        tint[k * 3 + 1] = mg / Math.max(0.03, own[1]);
        tint[k * 3 + 2] = mbb / Math.max(0.03, own[2]);
      }
    });
    const hl = new Map<number, number>();
    const hv: number[] = [];
    const hi = hitTris[r].map((v) => {
      let k = hl.get(v);
      if (k === undefined) {
        k = hv.length;
        hl.set(v, k);
        hv.push(v);
      }
      return k;
    });
    const hitUv = new Float32Array(hv.length * 2);
    hv.forEach((v, k) => {
      hitUv[k * 2] = Math.floor(v / rows) / nu;
      hitUv[k * 2 + 1] = (v % rows) / nv;
    });
    void reg;
    return { verts: Int32Array.from(verts), idx: Uint32Array.from(idx), uv, tint, rest, hitVerts: Int32Array.from(hv), hitIdx: Uint32Array.from(hi), hitUv };
  });
  const parents = Int32Array.from(cutP);
  const shares = Float32Array.from(cutW);

  // ———— a pose ————
  const memo: Built[] = [];
  const MEMO = 8;
  const free: Built[] = [];
  let lastPos: Float32Array = new Float32Array(n * 3);
  let lastNrm: Float32Array = new Float32Array(n * 3);
  let scratchFree: [Float32Array, Float32Array] | null = null;

  function normals(P: Float32Array, N: Float32Array) {
    const sign = spec.flip ? -1 : 1;
    for (let i = 0; i < cols; i++) {
      const im = i > 0 ? i - 1 : spec.wrapU ? nu - 1 : 0;
      const ip = i < nu ? i + 1 : spec.wrapU ? 1 : nu;
      for (let j = 0; j < rows; j++) {
        const jm = Math.max(0, j - 1), jp = Math.min(nv, j + 1);
        const v = at(i, j) * 3;
        const a = at(im, j) * 3, b = at(ip, j) * 3, c = at(i, jm) * 3, d = at(i, jp) * 3;
        const ux = P[b] - P[a], uy = P[b + 1] - P[a + 1], uz = P[b + 2] - P[a + 2];
        const vx = P[d] - P[c], vy = P[d + 1] - P[c + 1], vz = P[d + 2] - P[c + 2];
        const nx = (uy * vz - uz * vy) * sign, ny = (uz * vx - ux * vz) * sign, nz = (ux * vy - uy * vx) * sign;
        const l = Math.hypot(nx, ny, nz);
        if (l > 1e-12) {
          N[v] = nx / l;
          N[v + 1] = ny / l;
          N[v + 2] = nz / l;
        } else {
          N[v] = 0;
          N[v + 1] = 0;
          N[v + 2] = 0;
        }
      }
    }
    // A pole's normal: the mean of the ring next to it.
    const pole = (j: number, ring: number) => {
      let x = 0, y = 0, z = 0;
      for (let i = 0; i < nu; i++) {
        const v = at(i, ring) * 3;
        x += N[v];
        y += N[v + 1];
        z += N[v + 2];
      }
      const l = Math.hypot(x, y, z) || 1;
      for (let i = 0; i < cols; i++) {
        const v = at(i, j) * 3;
        N[v] = x / l;
        N[v + 1] = y / l;
        N[v + 2] = z / l;
      }
    };
    if (spec.poleV0) pole(0, 1);
    if (spec.poleV1) pole(nv, nv - 1);
  }

  return {
    n,
    material,
    label,
    build(deps, place) {
      const key = deps.join(',');
      for (let m = memo.length - 1; m >= 0; m--)
        if (memo[m].key === key) {
          const hit = memo[m];
          if (m !== memo.length - 1) {
            memo.splice(m, 1);
            memo.push(hit);
          }
          return hit.parts;
        }
      perfCount('fieldBuild');
      // The grid's master arrays are recycled from the pose evicted last.
      const [P, N] = scratchFree ?? [new Float32Array(n * 3), new Float32Array(n * 3)];
      scratchFree = null;
      for (let v = 0; v < n; v++) place(material[v * 2], material[v * 2 + 1], P, v * 3, v);
      normals(P, N);
      const recycled = free.pop();
      const parts: Record<string, Parts> = {};
      spec.regions.forEach((reg, r) => {
        const pc = pieces[r];
        const nv3 = pc.verts.length * 3;
        const old = recycled?.parts[reg.name];
        const pos = old ? old.mesh.pos : new Float32Array(nv3);
        const nrm = old ? old.mesh.nrm : new Float32Array(nv3);
        for (let k = 0; k < pc.verts.length; k++) {
          const v = pc.verts[k];
          const o = k * 3;
          if (v >= 0) {
            const g = v * 3;
            pos[o] = P[g];
            pos[o + 1] = P[g + 1];
            pos[o + 2] = P[g + 2];
            nrm[o] = N[g];
            nrm[o + 1] = N[g + 1];
            nrm[o + 2] = N[g + 2];
          } else {
            const c = (-1 - v) * 3;
            const w0 = shares[c], w1 = shares[c + 1], w2 = shares[c + 2];
            const a = parents[c] * 3, b = parents[c + 1] * 3, d = parents[c + 2] * 3;
            pos[o] = P[a] * w0 + P[b] * w1 + P[d] * w2;
            pos[o + 1] = P[a + 1] * w0 + P[b + 1] * w1 + P[d + 1] * w2;
            pos[o + 2] = P[a + 2] * w0 + P[b + 2] * w1 + P[d + 2] * w2;
            const x = N[a] * w0 + N[b] * w1 + N[d] * w2;
            const y = N[a + 1] * w0 + N[b + 1] * w1 + N[d + 1] * w2;
            const z = N[a + 2] * w0 + N[b + 2] * w1 + N[d + 2] * w2;
            const l = Math.hypot(x, y, z) || 1;
            nrm[o] = x / l;
            nrm[o + 1] = y / l;
            nrm[o + 2] = z / l;
          }
        }
        const hn = pc.hitVerts.length * 3;
        const hOld = old?.hit;
        const hp = hOld ? hOld.pos : new Float32Array(hn);
        const hN = hOld ? hOld.nrm : new Float32Array(hn);
        for (let k = 0; k < pc.hitVerts.length; k++) {
          const g = pc.hitVerts[k] * 3, o = k * 3;
          hp[o] = P[g];
          hp[o + 1] = P[g + 1];
          hp[o + 2] = P[g + 2];
          hN[o] = N[g];
          hN[o + 1] = N[g + 1];
          hN[o + 2] = N[g + 2];
        }
        const mesh: Mesh = { pos, nrm, uv: pc.uv, idx: pc.idx, tint: pc.tint, rest: pc.rest };
        const hit: Mesh = { pos: hp, nrm: hN, uv: pc.hitUv, idx: pc.hitIdx };
        parts[reg.name] = { mesh, hit };
      });
      memo.push({ key, parts });
      if (memo.length > MEMO) free.push(memo.shift()!);
      // The newest master grid stays readable for `pointAt`; the one before goes back to be written over.
      scratchFree = [lastPos, lastNrm];
      lastPos = P;
      lastNrm = N;
      return parts;
    },
    pointAt(u, v) {
      const g = at(Math.round(Math.min(1, Math.max(0, u)) * nu), Math.round(Math.min(1, Math.max(0, v)) * nv)) * 3;
      return [lastPos[g], lastPos[g + 1], lastPos[g + 2]];
    },
  };
}
