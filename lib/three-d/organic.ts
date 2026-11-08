import { add, cross, dot, mul, norm, sub, type V3 } from './math';
import { cachedBlob, cachedMerge, cachedMesh, cachedTube } from './mesh-cache';
import { grid, type BlobOptions, type Mesh } from './mesh';

/**
 * Organic shapes for the 3D views of topic 15 on (docs/quality/3d-quality-bar.md). The earlier kit drew
 * every structure as a tube of one radius or an ellipsoid, and showed growth by cutting a polyline at its
 * sample points: anatomy read as plumbing, and a growing duct ticked forward. Here:
 *
 * - `vessel`: a tube whose radius has a profile — tapering, a root flared into its parent, a bulging growing
 *   tip (an ampulla) or a cup at its end — flattened if asked;
 * - growth by arc length (`grow`): the drawn length follows the parameter exactly, the tip rounded and moving
 *   smoothly, never a jump from sample to sample;
 * - `tree`: a branching system grown generation by generation (the ureteric bud, the bronchial tree, glands),
 *   each branch flared at its root inside its parent so the junctions read as one tissue, merged per generation
 *   (one item, one outline, one draw);
 * - `bean`: an ellipsoid with a hilum (the kidney, the gonads, lymph nodes);
 * - `wallSlab`: a cut-away block of the body wall with a relief, opaque, with its cut faces: the solid context
 *   that structures lie on (contacts and shadows show where they are), instead of a see-through glass body.
 */

export interface Parts {
  mesh: Mesh;
  hit: Mesh;
}

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smooth = (a: number, b: number, x: number) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};

/** Cumulative arc length at each point. */
export function arcLengths(line: readonly V3[]): number[] {
  const s = [0];
  for (let i = 1; i < line.length; i++) s.push(s[i - 1] + Math.hypot(line[i][0] - line[i - 1][0], line[i][1] - line[i - 1][1], line[i][2] - line[i - 1][2]));
  return s;
}

/** The point at arc length `at` along a line. */
export function pointAt(line: readonly V3[], s: readonly number[], at: number): V3 {
  if (at <= 0) return line[0];
  const L = s[s.length - 1];
  if (at >= L) return line[line.length - 1];
  let i = 1;
  while (i < s.length - 1 && s[i] < at) i++;
  const k = (at - s[i - 1]) / Math.max(1e-9, s[i] - s[i - 1]);
  const a = line[i - 1], b = line[i];
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
}

/** `n` points evenly spaced along the line (by arc length). */
export function resample(line: readonly V3[], n: number): V3[] {
  const s = arcLengths(line);
  const L = s[s.length - 1];
  return Array.from({ length: n }, (_, i) => pointAt(line, s, (L * i) / (n - 1)));
}

/**
 * The first share `g` (0..1) of a line, by arc length, resampled to `n` points: the end moves smoothly with g.
 * Below a tiny length it returns null (nothing to draw yet).
 */
export function grow(line: readonly V3[], g: number, n = 16): V3[] | null {
  const s = arcLengths(line);
  const L = s[s.length - 1] * clamp01(g);
  if (L < 1e-3) return null;
  return Array.from({ length: n }, (_, i) => pointAt(line, s, (L * i) / (n - 1)));
}

/** How a vessel's radius runs along it (u = 0 at its root, 1 at its end; lengths in world units). */
export interface Profile {
  /** Radius at the root and at the end (before the root flare and the tip). */
  r0: number;
  r1?: number;
  /** The root widened into what it leaves (×(1 + flare) at the root, fading over `flareLen`). */
  flare?: number;
  flareLen?: number;
  /** The end swollen: an ampulla (a round bulb, ×(1 + bulb)) over `bulbLen`. */
  bulb?: number;
  bulbLen?: number;
  /** The end opened into a cup (a trumpet's bell, ×(1 + cup)) over `cupLen`. */
  cup?: number;
  cupLen?: number;
  /** Radii are drawn × (1 − flat) across the reference side (e.g. a pelvis flattened front to back). */
  flat?: number;
}

/** The radius at arc length `s` of a vessel of length `L`. */
export function radiusAt(p: Profile, s: number, L: number): number {
  const u = L > 0 ? s / L : 0;
  let r = p.r0 + ((p.r1 ?? p.r0) - p.r0) * u;
  if (p.flare) r *= 1 + p.flare * Math.exp(-s / Math.max(1e-3, p.flareLen ?? 3 * p.r0));
  const back = L - s;
  if (p.bulb) {
    const w = Math.max(1e-3, p.bulbLen ?? 4 * p.r0);
    // A round bulb: the profile of a sphere sitting on the end.
    const x = clamp01(1 - back / w);
    r *= 1 + p.bulb * Math.sin(Math.PI * 0.5 * Math.min(1, x * 1.6)) ** 2 * (x < 0.65 ? 1 : 1 - 0.25 * (x - 0.65) / 0.35);
  }
  if (p.cup) {
    const w = Math.max(1e-3, p.cupLen ?? 3 * p.r0);
    r *= 1 + p.cup * smooth(0, 1, 1 - back / w) ** 1.6;
  }
  return r;
}

export interface VesselOptions extends Profile {
  /** Reference side (perpendicular to the start): which way `flat` squashes. Default world z. */
  ref?: V3;
  sides?: number;
  capStart?: boolean;
  capEnd?: boolean;
  /** Points along the drawn line (default 20). */
  n?: number;
}

/**
 * A vessel along `line`, its radius following the profile by arc length. With `g` < 1 it is that much grown:
 * the end moves smoothly and the tip profile (bulb, cup) rides on it.
 */
export function vessel(line: readonly V3[], o: VesselOptions, g = 1): Parts | null {
  const n = o.n ?? 20;
  const pts = g >= 0.9999 ? resample(line, n) : grow(line, g, n);
  if (!pts) return null;
  const s = arcLengths(pts);
  const L = s[s.length - 1];
  const R = s.map((x) => radiusAt(o, x, L));
  const radius = (u: number) => {
    const x = u * (pts.length - 1);
    const i = Math.min(pts.length - 2, Math.floor(x));
    return R[i] + (R[i + 1] - R[i]) * (x - i);
  };
  const flat = o.flat ?? 0;
  const around = flat > 0 ? (a: number) => 1 - flat * Math.cos(a) ** 2 : undefined;
  const ref = o.ref ?? [0, 0, 1];
  const opts = { radius, around, ref, sides: o.sides ?? 12, capStart: o.capStart ?? true, capEnd: o.capEnd ?? true };
  const hitPts = resample(pts, Math.max(3, Math.ceil(n / 3)));
  return { mesh: cachedTube(pts, opts), hit: cachedTube(hitPts, { ...opts, sides: Math.min(8, opts.sides) }) };
}

/**
 * One vessel drawn as consecutive pieces (each its own item: the ureter and the pelvis it ends in), cut at the
 * given shares of its grown length; the radius runs on across the cuts, so the joins do not show.
 */
export function vesselPieces(line: readonly V3[], o: VesselOptions, cuts: readonly number[], g = 1): (Parts | null)[] {
  const n = o.n ?? 40;
  const pts = g >= 0.9999 ? resample(line, n) : grow(line, g, n);
  if (!pts) return [null, ...cuts.map(() => null)];
  const s = arcLengths(pts);
  const L = s[s.length - 1];
  const R = s.map((x) => radiusAt(o, x, L));
  const flat = o.flat ?? 0;
  const around = flat > 0 ? (a: number) => 1 - flat * Math.cos(a) ** 2 : undefined;
  const ref = o.ref ?? [0, 0, 1];
  const bounds = [0, ...cuts.map((c) => Math.round(clamp01(c) * (n - 1))), n - 1];
  const out: (Parts | null)[] = [];
  for (let k = 0; k < bounds.length - 1; k++) {
    // One sample of overlap each way, so the pieces meet inside each other.
    const i0 = Math.max(0, bounds[k] - (k > 0 ? 1 : 0));
    const i1 = Math.min(n - 1, bounds[k + 1] + (k < bounds.length - 2 ? 1 : 0));
    if (i1 - i0 < 1) {
      out.push(null);
      continue;
    }
    const sub = pts.slice(i0, i1 + 1);
    const rs = R.slice(i0, i1 + 1);
    const radius = (u: number) => {
      const x = u * (sub.length - 1);
      const i = Math.min(sub.length - 2, Math.floor(x));
      return rs[i] + (rs[i + 1] - rs[i]) * (x - i);
    };
    const opts = { radius, around, ref, sides: o.sides ?? 12, capStart: k === 0 && (o.capStart ?? true), capEnd: k === bounds.length - 2 && (o.capEnd ?? true) };
    out.push({ mesh: cachedTube(sub, opts), hit: cachedTube(resample(sub, Math.max(3, Math.ceil(sub.length / 3))), { ...opts, sides: Math.min(8, opts.sides) }) });
  }
  return out;
}

/** Several parts as one (one item, one outline, one draw). */
export function mergeParts(ps: readonly (Parts | null | undefined)[]): Parts | null {
  const ok = ps.filter((p): p is Parts => !!p);
  if (!ok.length) return null;
  if (ok.length === 1) return ok[0];
  return { mesh: cachedMerge(ok.map((p) => p.mesh)), hit: cachedMerge(ok.map((p) => p.hit)) };
}

// ———————————————————————————— branching trees ————————————————————————————

export interface Branch {
  /** The branch's centreline, from inside its parent to its end. */
  line: V3[];
  /** Generation: 0 = the trunk. */
  gen: number;
  /** Radius at its root and end. */
  r0: number;
  r1: number;
  kids: Branch[];
}

export interface TreeSpec {
  /** Where the trunk's end is, and which way it was going there. */
  from: V3;
  dir: V3;
  /** The plane the branching fans in (its normal); default world z (the branches spread in the frame). */
  normal?: V3;
  /** How many children each branch end gives at each generation (e.g. [3, 3, 2, 2]). */
  fan: readonly number[];
  /** Length and radius of each generation's branches. */
  len: readonly number[];
  radius: readonly number[];
  /** Half the angle the children of one end spread over (radians), per generation. */
  spread: readonly number[];
  /** Deterministic jitter (0..1): lengths and angles vary a little, as in tissue. */
  jitter?: number;
  /** A slight bend of each branch (share of its length). */
  bend?: number;
  /** Seed for the jitter. */
  seed?: number;
  /** The children of one end turn out of the fan plane by up to this (radians), alternating, for depth. */
  tilt?: number;
}

const rot = (v: V3, axis: V3, a: number): V3 => {
  const c = Math.cos(a), s = Math.sin(a);
  const k = dot(axis, v);
  const x = cross(axis, v);
  return [v[0] * c + x[0] * s + axis[0] * k * (1 - c), v[1] * c + x[1] * s + axis[1] * k * (1 - c), v[2] * c + x[2] * s + axis[2] * k * (1 - c)];
};
const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** A branching tree from a spec: deterministic (the same spec always gives the same tree). */
export function branchTree(t: TreeSpec): Branch[] {
  const nrm = norm(t.normal ?? [0, 0, 1]);
  const jit = t.jitter ?? 0.15;
  let seed = t.seed ?? 1;
  const rnd = () => hash(seed++) * 2 - 1;
  const out: Branch[] = [];
  const grow1 = (p: V3, d: V3, gen: number, side: number): Branch[] => {
    if (gen >= t.fan.length) return [];
    const k = t.fan[gen];
    const spread = t.spread[gen];
    const kids: Branch[] = [];
    for (let i = 0; i < k; i++) {
      const f = k === 1 ? 0 : (i / (k - 1)) * 2 - 1;
      const a = f * spread + rnd() * jit * spread * 0.5;
      let dir = norm(rot(d, nrm, a));
      const tilt = (t.tilt ?? 0) * (((i + gen + side) % 2) * 2 - 1);
      if (tilt) dir = norm(rot(dir, norm(cross(dir, nrm)), tilt));
      const len = t.len[gen] * (1 + rnd() * jit);
      // Starting a little inside the parent's end, so the flared root sits in it.
      const r0 = t.radius[gen];
      const start = sub(p, mul(d, r0 * 0.8));
      const end = add(p, mul(dir, len));
      const bendDir = norm(cross(nrm, dir));
      const mid = add(add(mul(add(start, end), 0.5), mul(bendDir, len * (t.bend ?? 0.08) * rnd())), mul(dir, len * 0.05));
      const line = smoothLine([start, add(p, mul(dir, len * 0.12)), mid, end], 14);
      const b: Branch = { line, gen, r0, r1: t.radius[gen] * 0.82, kids: [] };
      b.kids = grow1(end, dir, gen + 1, i);
      kids.push(b);
      out.push(b);
    }
    return kids;
  };
  grow1(t.from, norm(t.dir), 0, 0);
  return out;
}

/** A smooth line through key points (Catmull-Rom), n samples. */
function smoothLine(k: readonly V3[], n: number): V3[] {
  const at = (i: number) => k[Math.max(0, Math.min(k.length - 1, i))];
  const out: V3[] = [];
  for (let s = 0; s < n; s++) {
    const g = (s / (n - 1)) * (k.length - 1);
    const i = Math.min(k.length - 2, Math.floor(g));
    const u = g - i;
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    const u2 = u * u, u3 = u2 * u;
    const c = (j: number) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * u + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * u2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * u3);
    out.push([c(0), c(1), c(2)]);
  }
  return out;
}

export interface TreeLook {
  /** A growing tip swells into an ampulla (×(1 + ampulla)); a finished end of a generation listed in `cups` opens into a cup. */
  ampulla?: number;
  cups?: Partial<Record<number, number>>;
  /** Root flare (into the parent). */
  flare?: number;
  sides?: number | ((gen: number) => number);
}

/**
 * One generation of a tree drawn at its growth `g` (0..1): each branch grown by arc length, its growing end an
 * ampulla that becomes, once grown, a cup (if asked) or a plain rounded end; merged into one mesh.
 */
export function treeGeneration(tree: readonly Branch[], gen: number, g: number, look: TreeLook = {}): Parts | null {
  if (g <= 0.001) return null;
  const amp = look.ampulla ?? 0.6;
  const cup = look.cups?.[gen] ?? 0;
  const parts = tree
    .filter((b) => b.gen === gen)
    .map((b) => {
      // The ampulla while growing, easing to the end's final form once grown.
      const done = smooth(0.75, 1, g);
      const sides = typeof look.sides === 'function' ? look.sides(gen) : (look.sides ?? Math.max(6, 12 - gen * 2));
      return vessel(b.line, { r0: b.r0, r1: b.r1, flare: look.flare ?? 0.5, flareLen: b.r0 * 2.5, bulb: amp * (1 - done), bulbLen: b.r0 * 5, cup: cup * done, cupLen: b.r0 * 3.5, sides }, g);
    });
  return mergeParts(parts);
}

/** Where each branch of a generation ends (for names, caps, drops), at growth g. */
export function tipsOf(tree: readonly Branch[], gen: number, g = 1): V3[] {
  return tree.filter((b) => b.gen === gen).map((b) => {
    const s = arcLengths(b.line);
    return pointAt(b.line, s, s[s.length - 1] * clamp01(g));
  });
}

// ———————————————————————————— organs ————————————————————————————

/**
 * A bean (the kidney): an ellipsoid with its hilum pushed in on the side `hilum` points to (local frame, the
 * blob's axes), by `dent` (0..1, a share of the radius), and slightly lobulated (`lobes`, the fetal kidney).
 */
export function bean(o: BlobOptions & { hilum: V3; dent: number; lobes?: number }): Parts {
  const h = norm(o.hilum);
  const dent = o.dent;
  const lobes = o.lobes ?? 0;
  const shape = (d: V3) => {
    const c = dot(d, h);
    // The hilum: a smooth dimple, deeper towards its middle, narrow across the long axis.
    const pit = dent * smooth(0.25, 1, c) * (1 - 0.65 * Math.abs(d[1]));
    const lob = lobes ? lobes * (Math.cos(d[1] * 9) * 0.5 + 0.5) * (1 - Math.abs(c)) : 0;
    return 1 - pit + lob;
  };
  const id = `bean:${h.map((x) => x.toFixed(4)).join(',')}:${dent.toFixed(4)}:${lobes.toFixed(4)}`;
  const coarse = { ...o, rings: Math.max(8, Math.round((o.rings ?? 18) / 2)), sides: Math.max(10, Math.round((o.sides ?? 24) / 2)), shape };
  return { mesh: cachedBlob({ ...o, shape }, id), hit: cachedBlob(coarse, id) };
}

export interface SlabSpec {
  /** Extent in x and y (the wall's plane), and where its back is (z). */
  x: [number, number];
  y: [number, number];
  back: number;
  /** The front surface's z at (x, y): the wall's relief. */
  front: (x: number, y: number) => number;
  /** Grid resolution of the front surface. */
  nx?: number;
  ny?: number;
  /** Cache key: the slab is static for a given key (built once). */
  key: string;
}

/**
 * A block of the body wall cut out of the embryo: its front surface (with its relief: the vertebral column,
 * the somites, the gutters the kidneys lie in) and its four cut faces and back, as two meshes (the surface, and
 * the cut, drawn in the paler colour of a section). Static: built once per key.
 */
export function wallSlab(sp: SlabSpec): { surface: Parts; cut: Parts } {
  const nx = sp.nx ?? 48;
  const ny = sp.ny ?? 64;
  const build = (fx: number, fy: number) => {
    const ux = Math.max(4, Math.round(nx / fx));
    const uy = Math.max(4, Math.round(ny / fy));
    const X = (i: number) => sp.x[0] + ((sp.x[1] - sp.x[0]) * i) / ux;
    const Y = (j: number) => sp.y[0] + ((sp.y[1] - sp.y[0]) * j) / uy;
    // Front surface.
    const pos: number[] = [];
    const uv: number[] = [];
    const idx: number[] = [];
    for (let j = 0; j <= uy; j++)
      for (let i = 0; i <= ux; i++) {
        const x = X(i), y = Y(j);
        pos.push(x, y, sp.front(x, y));
        uv.push(j / uy, i / ux);
      }
    for (let j = 0; j < uy; j++)
      for (let i = 0; i < ux; i++) {
        const a = j * (ux + 1) + i, b = a + 1, c = a + ux + 1, d = c + 1;
        idx.push(a, b, c, b, d, c);
      }
    const surface = meshOf(pos, uv, idx);
    // Cut faces: the four sides (a strip between the front's edge and the back) and the back.
    const cp: number[] = [];
    const cu: number[] = [];
    const ci: number[] = [];
    const strip = (edge: V3[], out: V3) => {
      const base = cp.length / 3;
      edge.forEach((p, k) => {
        cp.push(p[0], p[1], p[2], p[0], p[1], sp.back);
        cu.push(k / (edge.length - 1), 0, k / (edge.length - 1), 1);
      });
      for (let k = 0; k < edge.length - 1; k++) {
        const a = base + k * 2, b = a + 1, c = a + 2, d = a + 3;
        // Facing `out`.
        const e1 = sub(edge[k + 1], edge[k]);
        const n = cross(e1, [0, 0, -1]);
        if (dot(n, out) > 0) ci.push(a, c, b, b, c, d);
        else ci.push(a, b, c, b, d, c);
      }
    };
    const P = (x: number, y: number): V3 => [x, y, sp.front(x, y)];
    strip(Array.from({ length: ux + 1 }, (_, i) => P(X(i), sp.y[0])), [0, -1, 0]);
    strip(Array.from({ length: ux + 1 }, (_, i) => P(X(i), sp.y[1])), [0, 1, 0]);
    strip(Array.from({ length: uy + 1 }, (_, j) => P(sp.x[0], Y(j))), [-1, 0, 0]);
    strip(Array.from({ length: uy + 1 }, (_, j) => P(sp.x[1], Y(j))), [1, 0, 0]);
    const b0 = cp.length / 3;
    cp.push(sp.x[0], sp.y[0], sp.back, sp.x[1], sp.y[0], sp.back, sp.x[0], sp.y[1], sp.back, sp.x[1], sp.y[1], sp.back);
    cu.push(0, 0, 1, 0, 0, 1, 1, 1);
    ci.push(b0, b0 + 2, b0 + 1, b0 + 1, b0 + 2, b0 + 3);
    const cut = meshOf(cp, cu, ci);
    return { surface, cut };
  };
  const fine = cachedSlab(`${sp.key}:fine`, () => build(1, 1));
  const coarse = cachedSlab(`${sp.key}:coarse`, () => build(3, 3));
  return { surface: { mesh: fine.surface, hit: coarse.surface }, cut: { mesh: fine.cut, hit: coarse.cut } };
}

/**
 * A flat plate: a star-shaped outline in the x–y plane (from its centroid) extruded between z0 (its front) and
 * z1, rounded nowhere (it is a cut). The back face of a section block: the section's own tissues as a solid
 * ground behind what stands in the block. `frame` stands it in another plane (a sagittal cut face). Built once
 * per key.
 */
export function plate(key: string, outline: readonly (readonly [number, number])[], z0: number, z1: number, frame?: { u: V3; v: V3; w: V3 }): Parts {
  let p = plates.get(key);
  if (!p) {
    // In another plane: the plate's own x, y, z along `frame`'s u, v, w (a right-handed set: u × v = w).
    const at = frame ? (x: number, y: number, z: number): V3 => add(add(mul(frame.u, x), mul(frame.v, y)), mul(frame.w, z)) : (x: number, y: number, z: number): V3 => [x, y, z];
    const build = (o: readonly (readonly [number, number])[]) => {
      const n = o.length;
      const cx = o.reduce((a, q) => a + q[0], 0) / n;
      const cy = o.reduce((a, q) => a + q[1], 0) / n;
      const pos: number[] = [];
      const uv: number[] = [];
      const idx: number[] = [];
      // Front face (towards +z when z0 > z1): a fan from the centre.
      const face = (z: number, front: boolean) => {
        const c = pos.length / 3;
        pos.push(...at(cx, cy, z));
        uv.push(0.5, 0.5);
        o.forEach((q) => {
          pos.push(...at(q[0], q[1], z));
          uv.push(0, 0);
        });
        for (let i = 0; i < n; i++) {
          const a = c + 1 + i, b = c + 1 + ((i + 1) % n);
          if (front) idx.push(c, a, b);
          else idx.push(c, b, a);
        }
      };
      const ccw = o.reduce((acc, q, i) => acc + (q[0] * o[(i + 1) % n][1] - o[(i + 1) % n][0] * q[1]), 0) > 0;
      const towardsPlus = z0 > z1;
      face(z0, ccw === towardsPlus);
      face(z1, ccw !== towardsPlus);
      // The rim: its own vertices (a sharp edge with each face).
      const r = pos.length / 3;
      o.forEach((q, i) => {
        pos.push(...at(q[0], q[1], z0), ...at(q[0], q[1], z1));
        uv.push(i / n, 0, i / n, 1);
      });
      for (let i = 0; i < n; i++) {
        const a = r + i * 2, b = a + 1, c = r + ((i + 1) % n) * 2, d = c + 1;
        if (ccw) idx.push(a, b, c, b, d, c);
        else idx.push(a, c, b, b, c, d);
      }
      return meshOf(pos, uv, idx);
    };
    const coarse = outline.filter((_, i) => i % 3 === 0);
    p = { mesh: build(outline), hit: build(coarse.length >= 3 ? coarse : outline) };
    plates.set(key, p);
  }
  return p;
}
const plates = new Map<string, Parts>();

const slabs = new Map<string, { surface: Mesh; cut: Mesh }>();
function cachedSlab(key: string, build: () => { surface: Mesh; cut: Mesh }) {
  let s = slabs.get(key);
  if (!s) {
    s = build();
    slabs.set(key, s);
  }
  return s;
}

/** A mesh with normals averaged over the faces that share each vertex (cut faces keep their own vertices: sharp edges). */
function meshOf(pos: number[], uv: number[], idx: number[]): Mesh {
  const p = new Float32Array(pos);
  const n = new Float32Array(pos.length);
  for (let i = 0; i < idx.length; i += 3) {
    const a = idx[i] * 3, b = idx[i + 1] * 3, c = idx[i + 2] * 3;
    const f = cross([p[b] - p[a], p[b + 1] - p[a + 1], p[b + 2] - p[a + 2]], [p[c] - p[a], p[c + 1] - p[a + 1], p[c + 2] - p[a + 2]]);
    for (const v of [a, b, c]) {
      n[v] += f[0];
      n[v + 1] += f[1];
      n[v + 2] += f[2];
    }
  }
  for (let v = 0; v < n.length; v += 3) {
    const l = Math.hypot(n[v], n[v + 1], n[v + 2]) || 1;
    n[v] /= l;
    n[v + 1] /= l;
    n[v + 2] /= l;
  }
  return { pos: p, nrm: n, uv: new Float32Array(uv), idx: new Uint32Array(idx) };
}

/**
 * A cup with a wall of real thickness: a spherical shell round `center`, its bottom towards −`axis`, its mouth
 * open towards +`axis`, wrapping `wrap` (0: a shallow dish, 1: almost closed) of the way round, with a rounded
 * rim. Bowman's capsule round a glomerulus, the optic cup, a cap of tissue over a growing tip. Seen from any side
 * it is a solid (outer face, rim, inner face), so the inside shows through the mouth.
 */
export function cupShell(o: { center: V3; axis: V3; radius: number; thick: number; wrap: number; rings?: number; sides?: number }): Parts {
  const build = (rings: number, sides: number) =>
    cachedMesh('cupShell', [...o.center, ...o.axis, o.radius, o.thick, o.wrap, rings, sides], () => {
      const ax = norm(o.axis);
      const e1 = norm(cross(ax, Math.abs(ax[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]));
      const e2 = cross(ax, e1);
      const tMax = Math.PI * (0.12 + 0.76 * clamp01(o.wrap));
      const R = o.radius, r = Math.max(0.05 * R, R - o.thick), mid = (R + r) / 2, half = (R - r) / 2;
      const rim = 6;
      // The profile, from the outer pole round the rim to the inner pole: (polar angle, distance from centre).
      const prof: [number, number][] = [];
      for (let i = 0; i <= rings; i++) prof.push([(tMax * i) / rings, R]);
      for (let k = 1; k < rim; k++) {
        const a = (Math.PI * k) / rim;
        prof.push([tMax + (half / mid) * Math.sin(a), mid + half * Math.cos(a)]);
      }
      for (let i = rings; i >= 0; i--) prof.push([(tMax * i) / rings, r]);
      const pos: number[] = [];
      const uv: number[] = [];
      const idx: number[] = [];
      prof.forEach(([t, d], j) => {
        for (let k = 0; k < sides; k++) {
          const f = (k / sides) * Math.PI * 2;
          const side = add(mul(e1, Math.cos(f)), mul(e2, Math.sin(f)));
          const q = add(o.center, mul(add(mul(ax, -Math.cos(t)), mul(side, Math.sin(t))), d));
          pos.push(q[0], q[1], q[2]);
          uv.push(k / sides, j / (prof.length - 1));
        }
      });
      for (let j = 0; j < prof.length - 1; j++)
        for (let k = 0; k < sides; k++) {
          const a = j * sides + k, b = j * sides + ((k + 1) % sides), c = a + sides, d = b + sides;
          idx.push(a, c, b, b, c, d);
        }
      const m = meshOf(pos, uv, idx);
      // Wound so the outer face looks outwards (checked on the outer wall half way to the rim).
      const j = Math.max(1, Math.floor(rings / 2)), v = j * sides;
      const out = sub([m.pos[v * 3], m.pos[v * 3 + 1], m.pos[v * 3 + 2]], o.center);
      if (dot(out, [m.nrm[v * 3], m.nrm[v * 3 + 1], m.nrm[v * 3 + 2]]) < 0) {
        for (let i = 0; i < m.idx.length; i += 3) [m.idx[i + 1], m.idx[i + 2]] = [m.idx[i + 2], m.idx[i + 1]];
        for (let i = 0; i < m.nrm.length; i++) m.nrm[i] = -m.nrm[i];
      }
      return m;
    });
  return { mesh: build(o.rings ?? 12, o.sides ?? 20), hit: build(5, 10) };
}

/**
 * A solid organ cut open by the plane z = `center`[2] (its front half taken away, the back kept): the back half
 * of an ellipsoid (`dome`, seen whole when the view turns) and, on the cut, flat elliptical rings for its layers
 * from the outside in (`faces`: [inner, outer] as shares of the radii). Layers that change thickness change
 * smoothly; each ring is its own item, so each layer has its own name and colour.
 */
export function cutOpen(o: { center: V3; radii: V3; layers: readonly (readonly [number, number])[]; sides?: number }): { dome: Parts; faces: (Parts | null)[] } {
  const [cx, cy, cz] = o.center;
  const [rx, ry, rz] = o.radii;
  const q = (x: number) => Math.round(x * 400) / 400;
  const sides = o.sides ?? 48;
  const dome = (nu: number, nv: number) =>
    cachedMesh('cutDome', [cx, cy, cz, rx, ry, rz, nu, nv], () =>
      grid(nu, nv, (u, v) => {
        const a = u * Math.PI * 2, th = v * Math.PI * 0.5;
        return [cx + rx * Math.sin(th) * Math.cos(a), cy + ry * Math.sin(th) * Math.sin(a), cz - rz * Math.cos(th)];
      }, [cx - 10 * rx, cy, cz - 10 * rz]),
    );
  const ring = (a: number, b: number, k: number, nu: number) =>
    cachedMesh('cutRing', [cx, cy, cz, rx, ry, a, b, k, nu], () =>
      grid(nu, 1, (u, v) => {
        const t = u * Math.PI * 2, r = a + (b - a) * v;
        return [cx + rx * r * Math.cos(t), cy + ry * r * Math.sin(t), cz + 0.002 * k * Math.max(rx, ry)];
      }, [cx, cy, cz + 10]),
    );
  const faces = o.layers.map(([a, b], k) => {
    // A disc is a ring with a pin-hole (a ring of zero width at the centre has no normal).
    const A = q(Math.max(0.004, a)), B = q(Math.max(A, b));
    if (B - A < 0.004) return null;
    return { mesh: ring(A, B, k, sides), hit: ring(A, B, k, 16) };
  });
  return { dome: { mesh: dome(sides, 14), hit: dome(16, 5) }, faces };
}

/** A static mesh built once from fixed numbers (re-exported for models that build their own context). */
export const staticMesh = cachedMesh;
