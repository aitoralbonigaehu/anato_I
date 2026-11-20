/**
 * Bakes the point clouds of the opening show (public/intro-v3/*.bin) from the app's own 3D models:
 * the fetal skull of topic 17 (arch colours) and the face of topic 18 at week 5 and week 10 (one point list,
 * the same surface place in both, so the points can travel from the separate prominences to the fused face).
 * The week-5 embryo comes from the earlier film's surface cloud, tinted here by region.
 *
 * Run: npx vitest run --config scripts/intro-v3/vitest.bake.config.ts
 *
 * Format of each file: count × 8 bytes: Int16 x, y, z (unit sphere × 16384), Uint8 r, g, b, Uint8 weight.
 * Clouds are centred on their bounding box and scaled to a bounding sphere of radius 1; axes as the models
 * (x the subject's left, y cranial, z ventral).
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { it } from 'vitest';
import { skullModel, SKULL0 } from '@/components/scenes/week17/skull-model';
import { faceModel } from '@/components/scenes/week18/face-model';
import type { Item3 } from '@/lib/three-d/scene';

type P = { x: number; y: number; z: number; r: number; g: number; b: number; w: number };
const OUT = 'public/intro-v3';

// A small deterministic random, so the bake is reproducible.
let seed = 1234567;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

const hex = (c: string) => {
  const n = parseInt(c.replace('#', '').slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

function apply(m: Float32Array | number[] | undefined, x: number, y: number, z: number): [number, number, number] {
  if (!m) return [x, y, z];
  return [m[0] * x + m[4] * y + m[8] * z + m[12], m[1] * x + m[5] * y + m[9] * z + m[13], m[2] * x + m[6] * y + m[10] * z + m[14]];
}

interface Tri {
  item: number;
  t: number;
  area: number;
}

/** Visible items with their triangles' areas (world space). */
function triangles(items: Item3[]) {
  const tris: Tri[] = [];
  items.forEach((it, k) => {
    const vis = (it.show ?? 1) * (it.opacity ?? 1);
    if (vis < 0.2 || it.stream) return;
    const { pos, idx } = it.mesh;
    for (let t = 0; t < idx.length; t += 3) {
      const a = apply(it.matrix, pos[idx[t] * 3], pos[idx[t] * 3 + 1], pos[idx[t] * 3 + 2]);
      const b = apply(it.matrix, pos[idx[t + 1] * 3], pos[idx[t + 1] * 3 + 1], pos[idx[t + 1] * 3 + 2]);
      const c = apply(it.matrix, pos[idx[t + 2] * 3], pos[idx[t + 2] * 3 + 1], pos[idx[t + 2] * 3 + 2]);
      const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]],
        v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
      const cx = u[1] * v[2] - u[2] * v[1],
        cy = u[2] * v[0] - u[0] * v[2],
        cz = u[0] * v[1] - u[1] * v[0];
      const area = 0.5 * Math.hypot(cx, cy, cz);
      if (area > 0) tris.push({ item: k, t, area });
    }
  });
  return tris;
}

/** Area-weighted samples: which triangle, and where in it (barycentric). */
function sample(tris: Tri[], n: number, weight: (item: number) => number) {
  const cum = new Float64Array(tris.length);
  let s = 0;
  tris.forEach((tr, i) => {
    s += tr.area * weight(tr.item);
    cum[i] = s;
  });
  const out: { tri: Tri; u: number; v: number }[] = [];
  for (let i = 0; i < n; i++) {
    const r = rnd() * s;
    let lo = 0,
      hi = cum.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cum[mid] < r) lo = mid + 1;
      else hi = mid;
    }
    let u = rnd(),
      v = rnd();
    if (u + v > 1) {
      u = 1 - u;
      v = 1 - v;
    }
    out.push({ tri: tris[lo], u, v });
  }
  return out;
}

function at(items: Item3[], s: { tri: Tri; u: number; v: number }, light = 0): P {
  const it = items[s.tri.item];
  const { pos, idx } = it.mesh;
  const t = s.tri.t;
  const corner = (k: number) => apply(it.matrix, pos[idx[t + k] * 3], pos[idx[t + k] * 3 + 1], pos[idx[t + k] * 3 + 2]);
  const a = corner(0),
    b = corner(1),
    c = corner(2);
  const w = 1 - s.u - s.v;
  const [r, g, bb] = hex(it.color);
  return {
    x: a[0] * w + b[0] * s.u + c[0] * s.v,
    y: a[1] * w + b[1] * s.u + c[1] * s.v,
    z: a[2] * w + b[2] * s.u + c[2] * s.v,
    r,
    g,
    b: bb,
    w: it.quiet || it.ground ? 90 + light : 255,
  };
}

function frame(lists: P[][]) {
  // One frame for every list (the face's two ages share it, so the points do not jump).
  let lo = [Infinity, Infinity, Infinity],
    hi = [-Infinity, -Infinity, -Infinity];
  for (const l of lists)
    for (const p of l) {
      lo = [Math.min(lo[0], p.x), Math.min(lo[1], p.y), Math.min(lo[2], p.z)];
      hi = [Math.max(hi[0], p.x), Math.max(hi[1], p.y), Math.max(hi[2], p.z)];
    }
  const c = [(lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, (lo[2] + hi[2]) / 2];
  let r = 0;
  for (const l of lists) for (const p of l) r = Math.max(r, Math.hypot(p.x - c[0], p.y - c[1], p.z - c[2]));
  return { c, r };
}

function write(name: string, pts: P[], f: { c: number[]; r: number }) {
  const buf = Buffer.alloc(pts.length * 10);
  pts.forEach((p, i) => {
    const q = (v: number, c: number) => Math.max(-32767, Math.min(32767, Math.round(((v - c) / f.r) * 16384)));
    buf.writeInt16LE(q(p.x, f.c[0]), i * 10);
    buf.writeInt16LE(q(p.y, f.c[1]), i * 10 + 2);
    buf.writeInt16LE(q(p.z, f.c[2]), i * 10 + 4);
    buf.writeUInt8(p.r, i * 10 + 6);
    buf.writeUInt8(p.g, i * 10 + 7);
    buf.writeUInt8(p.b, i * 10 + 8);
    buf.writeUInt8(p.w, i * 10 + 9);
  });
  mkdirSync(OUT, { recursive: true });
  writeFileSync(`${OUT}/${name}.bin`, buf);
  console.log(name, pts.length, 'points', (buf.length / 1024).toFixed(0), 'KB', 'radius', f.r.toFixed(2));
}

/** Shuffled order: any prefix of the file is a fair thinner cloud (the engine draws fewer on weak GPUs). */
function shuffle<T>(a: T[]) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const N = 65536;

it('bakes the skull', () => {
  const { items } = skullModel({ ...SKULL0, archTint: 1 });
  const tris = triangles(items);
  const pts = shuffle(sample(tris, N, (k) => (items[k].quiet ? 0.3 : 1)).map((s) => at(items, s)));
  write('skull', pts, frame([pts]));
}, 120_000);

it('bakes the face at week 5 and week 10', () => {
  const young = faceModel({ age: 5, color: 1, duct: 0 }).items;
  const old = faceModel({ age: 10.5, color: 1, duct: 0 }).items;
  // The same surface place at both ages needs the same triangles: keep items whose topology matches.
  const same = young.map((it) => {
    const o = old.find((x) => x.key === it.key);
    return !!o && o.mesh.idx.length === it.mesh.idx.length && o.mesh.pos.length === it.mesh.pos.length;
  });
  console.log('face items', young.map((it, k) => `${it.key}:${same[k] ? 'same' : 'DIFF'}`).join(' '));
  const keep = young.filter((_, k) => same[k]);
  const keepOld = keep.map((it) => old.find((x) => x.key === it.key)!);
  const tris = triangles(keep);
  const picks = shuffle(sample(tris, N, (k) => (keep[k].quiet ? 0.16 : 1)));
  const a = picks.map((s) => at(keep, s));
  const b = picks.map((s) => at(keepOld, s));
  const f = frame([a, b]);
  write('face5', a, f);
  write('face10', b, f);
}, 120_000);

it('tints the week-5 embryo', () => {
  const raw = gunzipSync(readFileSync('public/intro-review/surface.bin.gz'));
  const n = raw.length / 6;
  const pts: P[] = [];
  for (let i = 0; i < n; i++) {
    const x = raw.readInt16LE(i * 6) / 4096,
      y = raw.readInt16LE(i * 6 + 2) / 4096,
      z = raw.readInt16LE(i * 6 + 4) / 4096;
    // The regions of the earlier film's shader (grains.ts): neural tube, somites, heart bulge, limb buds.
    const a = Math.atan2(z, y + 2.8),
      outward = Math.hypot(y + 2.8, z) - 2.6;
    const side = Math.abs(x);
    const segW = 0.6 / 3.15,
      crest = Math.cos(((a - 0.2 / 3.15) * 2 * Math.PI) / segW);
    let c = [250, 214, 186];
    if (outward > 0.2 && side < 0.31 && a < 1.72) c = [196, 202, 250];
    else if (outward > 0.14 && side < 0.88 && a < 1.51 && crest > -0.18) c = [255, 178, 125];
    else if (side > 0.96 && (Math.abs(a - 0.78) < 0.24 || Math.abs(a + 0.82) < 0.23)) c = [255, 226, 200];
    else if (y < -2.45 && z > 0.45 && z < 1.8) c = [232, 99, 107];
    pts.push({ x, y, z, r: c[0], g: c[1], b: c[2], w: 255 });
  }
  // The heart: tinted by distance from its centre (a soft blush, not a cut-out block).
  const red = pts.filter((p) => p.r === 232);
  const hc = [0, 1, 2].map((k) => red.reduce((a, p) => a + [p.x, p.y, p.z][k], 0) / Math.max(1, red.length));
  const base = [250, 214, 186];
  for (const p of pts) {
    if (p.r !== 232) continue;
    const d = Math.hypot(p.x - hc[0], p.y - hc[1], p.z - hc[2]);
    const k = Math.exp(-(d * d) / (2 * 0.55 * 0.55));
    p.r = Math.round(base[0] + (236 - base[0]) * k);
    p.g = Math.round(base[1] + (104 - base[1]) * k);
    p.b = Math.round(base[2] + (110 - base[2]) * k);
  }
  const out = shuffle(pts).slice(0, N);
  // Framed on the whole surface (not the sample) so the page can place the earlier film's skin render
  // exactly over the points: intro.ts EMBRYO_FRAME keeps these numbers.
  const f = frame([pts]);
  console.log('embryo frame', JSON.stringify({ c: f.c.map((v) => +v.toFixed(5)), r: +f.r.toFixed(5) }));
  write('embryo', out, f);
}, 120_000);
