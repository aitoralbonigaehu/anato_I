import type { M4, V3 } from '@/lib/three-d/math';
import { grid, type Mesh } from '@/lib/three-d/mesh';
import { mergeParts, vessel, type Parts } from '@/lib/three-d/organic';
import type { Item3, Tissue3 } from '@/lib/three-d/scene';
import { mixHex } from '@/components/scenes/week10/model3d';
import { TISSUE } from './common';
import { BASE_BONES, BASE_CARTILAGES, baseY } from './skull-model';

/**
 * Topic 17, notes 1 and 1.1 (last bullet). Two models that lie on a table (x–y plane, z up towards the viewer):
 *
 * - `ossModel`: the two ossifications side by side, on one clock. The same cells move and change on each block:
 *   left, mesenchyme cells gather, become osteoblasts, spicules radiate and fill in a flat bone (fast); right, the
 *   cells condense into a cartilage model and become chondrocytes, then bone replaces it from the middle out (slow).
 *   x = the viewer's right, y = away from the viewer.
 * - `baseModel`: the skull base from above, as the notes' figure on p.2: y anterior (ethmoid at the top), x = the
 *   viewer's right, so the embryo's LEFT half is on the viewer's LEFT (seen from above). Each cartilage is one shape
 *   on both sides; on the viewer's left it morphs into its bone, on the right it stays as cartilage so that each
 *   bone faces the cartilage it came from, the arrangement of the notes' figure. The occipital squama has no
 *   cartilage: it is membranous (notes 1.1 p7/s2), it grows straight on the floor.
 */

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const ss = (a: number, b: number, x: number) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};


// ———— star-shaped outlines in polar form, so that any two morph without swapping ————

const N = 72;
type P2 = readonly [number, number];
interface Polar {
  c: P2;
  r: number[];
}

function polar(kps: readonly P2[], centre?: P2): Polar {
  const m = kps.length;
  const dense: P2[] = [];
  for (let i = 0; i < m; i++) {
    const p0 = kps[(i + m - 1) % m], p1 = kps[i], p2 = kps[(i + 1) % m], p3 = kps[(i + 2) % m];
    for (let s = 0; s < 8; s++) {
      const t = s / 8;
      const f = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (3 * b - a - 3 * c + d) * t * t * t);
      dense.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  const c: P2 = centre ?? [kps.reduce((a, q) => a + q[0], 0) / m, kps.reduce((a, q) => a + q[1], 0) / m];
  const r: number[] = [];
  for (let k = 0; k < N; k++) {
    const th = (k / N) * Math.PI * 2;
    const dx = Math.cos(th), dy = Math.sin(th);
    let best = 0;
    dense.forEach((a, i) => {
      const b = dense[(i + 1) % dense.length];
      const ex = b[0] - a[0], ey = b[1] - a[1];
      const det = dx * -ey + ex * dy;
      if (Math.abs(det) < 1e-9) return;
      const ax = a[0] - c[0], ay = a[1] - c[1];
      const t = (ax * -ey + ex * ay) / det;
      const u = (dx * ay - dy * ax) / det;
      if (t > best && u >= 0 && u <= 1) best = t;
    });
    r.push(best || (r[k - 1] ?? 0.1));
  }
  return { c, r };
}

const mirrorP = (o: Polar): Polar => ({ c: [-o.c[0], o.c[1]], r: o.r.map((_, k) => o.r[(N + N / 2 - k) % N]) });
const lerpP = (a: Polar, b: Polar, k: number): Polar => ({ c: [lerp(a.c[0], b.c[0], k), lerp(a.c[1], b.c[1], k)], r: a.r.map((x, i) => lerp(x, b.r[i], k)) });

/** A smooth pillow on the floor: the rim rounds up, the top is gently domed. Clipped at |x| ≤ clip from its centre. */
type Relief = (x: number, y: number) => number;
function pillowMesh(o: Polar, z0: number, h: number, clip?: number, relief?: Relief): Mesh {
  const at = (u: number, v: number): V3 => {
    const th = u * Math.PI * 2;
    const f = u * N;
    const i = Math.floor(f);
    let r = lerp(o.r[i % N], o.r[(i + 1) % N], f - i);
    const c = Math.cos(th), s = Math.sin(th);
    if (clip !== undefined) r = Math.min(r, clip / Math.max(Math.abs(c), 1e-3));
    let k: number, z: number;
    if (relief) {
      k = 1 - v;
      // A tapered margin continuous with the cartilaginous floor, with a low central ridge.
      z = h * (1 - k ** 2) * (0.62 + 0.38 * (1 - k));
    } else if (v < 0.42) {
      const w = v / 0.42;
      k = 1 - 0.08 * w * w;
      z = h * Math.sin((w * Math.PI) / 2);
    } else {
      const w = (v - 0.42) / 0.58;
      k = 0.92 * (1 - w);
      z = h * (1 + 0.12 * (1 - (1 - w) * (1 - w)));
    }
    const x = o.c[0] + c * r * k, y = o.c[1] + s * r * k;
    return [x, y, z0 + z + (relief?.(x, y) ?? 0)];
  };
  return grid(N, relief ? 32 : 10, at, [o.c[0], o.c[1], 50]);
}

/** Meshes kept per quantised shape: a morph reuses them instead of rebuilding every frame. */
const pillows = new Map<string, Parts>();
const Q = (x: number) => Math.round(x * 48) / 48;
function pillow(key: string, make: () => Polar, q: readonly number[], z0: number, h: number, clip?: number, relief?: Relief): Parts {
  const k = `${key}|${q.map(Q).join(',')}|${Q(h)}|${clip === undefined ? '' : Q(clip)}`;
  let p = pillows.get(k);
  if (!p) {
    const mesh = pillowMesh(make(), z0, h, clip, relief);
    p = { mesh, hit: mesh };
    if (pillows.size > 4000) pillows.clear();
    pillows.set(k, p);
  }
  return p;
}

const hash = (i: number, s: number) => {
  const v = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453;
  return v - Math.floor(v);
};

export const OC = {
  osteoblast: '#f5b041',
  osteoblastDeep: '#8f5c10',
  chondrocyte: '#2f7f73',
  tray: '#bf9587',
  trayDeep: '#795449',
  floor: '#d4bda6',
  floorDeep: '#92755f',
} as const;

// ———————————————————————————— The two ossifications ————————————————————————————

export interface OssPose {
  /** Left: cells gathered into osteoblasts; spicules grown; the flat bone filled in (each 0..1). */
  gather: number;
  spic: number;
  flat: number;
  /** Right: the cells condensed into the cartilage model; chondrocytes enlarged; bone replacing it, from the middle (each 0..1). */
  cart: number;
  hyper: number;
  bone: number;
}

export const OS0: OssPose = { gather: 0, spic: 0, flat: 0, cart: 0, hyper: 0, bone: 0 };

export interface BaseOpts {
  dim?: { ids: readonly string[]; k: number } | null;
}

const LX = -2.75;
const RX = 2.75;

const CELLS = Array.from({ length: 24 }, (_, i) => {
  const col = i % 6, row = Math.floor(i / 6);
  const x = ((col + 0.5) / 6 - 0.5) * 3.7 + (hash(i, 1) - 0.5) * 0.34;
  const y = ((row + 0.5) / 4 - 0.5) * 2.7 + (hash(i, 2) - 0.5) * 0.32;
  const a = Math.atan2(y, x);
  const radius = Math.min(outerRadius(a, 0), outerRadius(a, 1)) - 0.22;
  const scale = Math.min(1, radius / Math.hypot(x, y));
  return { x: x * scale, y: y * scale };
});

const FLAT: Polar = {
  c: [0, 0],
  r: Array.from({ length: N }, (_, k) => {
    const th = (k / N) * Math.PI * 2;
    const e = 1 / Math.sqrt((Math.cos(th) / 1.75) ** 2 + (Math.sin(th) / 1.22) ** 2);
    return e * (1 + 0.07 * Math.sin(3 * th + 0.5) + 0.04 * Math.sin(5 * th + 1.7));
  }),
};
// An endochondral anlage widens at either end and narrows across the future shaft.
const MODEL = polar([
  [-2.03, 0.13], [-1.87, 0.62], [-1.57, 0.83], [-1.18, 0.72], [-0.63, 0.47],
  [0.14, 0.42], [0.87, 0.52], [1.40, 0.78], [1.83, 0.73], [2.02, 0.31],
  [1.96, -0.35], [1.62, -0.66], [1.26, -0.64], [0.51, -0.36], [-0.24, -0.34],
  [-0.90, -0.49], [-1.53, -0.76], [-1.92, -0.51],
], [0, 0]);
// The section's stroma, cartilage and mineralization fronts partition one surface.
const STROMA = '#f4cdbe';
const STROMA_DEEP = '#d1a99a';
const outlineAt = (shape: Polar, a: number) => {
  const u = ((a / (2 * Math.PI) + 1) % 1) * N, i = Math.floor(u);
  return lerp(shape.r[i], shape.r[(i + 1) % N], u - i);
};
function outerRadius(a: number, side: number) {
  const c = Math.cos(a), s = Math.sin(a);
  const ellipse = 1 / Math.hypot(c / 2.46, s / 1.68);
  return ellipse * (1 + 0.065 * Math.sin(3 * a + side) + 0.031 * Math.sin(5 * a + 0.8 * side));
}
function fieldRadius(side: number, a: number, growth: number) {
  return outlineAt(side ? MODEL : FLAT, a) * growth ** 0.66;
}
function sectionHeight(side: number, x: number, y: number, growth: number) {
  const a = Math.atan2(y, x), r = Math.hypot(x, y);
  const edge = r / outerRadius(a, side);
  const f = fieldRadius(side, a, growth);
  const stroma = -0.095 * edge ** 2 + 0.031 * Math.sin(2.8 * x + y) + 0.017 * Math.sin(3.7 * y - x);
  const relief = (side ? 0.145 : 0.135) * growth * ss(f + 0.17, f - 0.34, r);
  return stroma + relief;
}
const sliceCache = new Map<string, Parts>();
type SliceZone = 'stroma' | 'field' | 'mineral' | 'edge' | 'back';
function tissueSlice(side: number, zone: SliceZone, growth: number, bone = 0): Parts {
  const key = `${side}/${zone}/${growth}/${bone}`;
  const hit = sliceCache.get(key);
  if (hit) return hit;
  const cx = side ? RX : LX;
  const mesh = grid(64, zone === 'edge' ? 6 : 16, (u, v) => {
    const a = 2 * Math.PI * u, c = Math.cos(a), s = Math.sin(a);
    const outer = outerRadius(a, side), field = fieldRadius(side, a, growth);
    const front = side ? Math.min(field, 2.13 * bone / Math.max(0.0001, Math.abs(c))) : 0;
    let r = 0;
    if (zone === 'stroma') r = lerp(field, outer, v);
    if (zone === 'field') r = lerp(front, field, v);
    if (zone === 'mineral') r = front * v;
    if (zone === 'edge') r = outer * (1 - 0.07 * v * v);
    if (zone === 'back') r = 0.93 * outer * v;
    const x = r * c, y = r * s;
    const z = zone === 'back' ? -0.32 + 0.06 * (1 - v * v)
      : zone === 'edge' ? lerp(sectionHeight(side, outer * c, outer * s, 0), -0.32, v)
      : sectionHeight(side, x, y, growth);
    return [cx + x, y, z];
  }, zone === 'back' ? [cx, 0, -18] : zone === 'edge' ? [cx - 12, 0, 0] : [cx, 0, 18]);
  // Blend the last part of each field into the stroma with vertex pigment.
  // This leaves cartilage and bone identifiable all the way to the section edge.
  if (zone === 'field' || zone === 'mineral') {
    const base = side && zone === 'field' ? TISSUE.cartilage : TISSUE.bone;
    const blend = [1, 3, 5].map(i => (parseInt(STROMA.slice(i, i + 2), 16) / parseInt(base.slice(i, i + 2), 16)) ** 2.2);
    mesh.tint = new Float32Array(mesh.pos.length);
    mesh.rest = mesh.pos;
    for (let i = 0; i < mesh.pos.length; i += 3) {
      const x = mesh.pos[i] - cx, y = mesh.pos[i + 1], r = Math.hypot(x, y);
      const edge = fieldRadius(side, Math.atan2(y, x), growth);
      const mix = ss(edge - Math.min(0.25, edge * 0.4), edge, r);
      for (let c = 0; c < 3; c++) mesh.tint[i + c] = lerp(1, blend[c], mix);
    }
  }
  const parts = { mesh, hit: mesh };
  if (sliceCache.size >= 640) sliceCache.clear();
  sliceCache.set(key, parts);
  return parts;
}

// A shallow spindle-shaped cell profile with a single central nuclear stain.
const CELL = (() => {
  const mesh = grid(18, 8, (u, v) => {
    const a = u * Math.PI * 2, k = 1 - v;
    return [k * Math.cos(a), k * Math.sin(a) * (0.62 + 0.38 * Math.sin(a) ** 2), 1 - k * k];
  }, [0, 0, 10]);
  mesh.tint = new Float32Array(mesh.pos.length);
  mesh.rest = mesh.pos;
  for (let i = 0; i < mesh.pos.length; i += 3) {
    const stain = 1 - ss(0.2, 1, Math.hypot(mesh.pos[i] / 0.39, mesh.pos[i + 1] / 0.54));
    mesh.tint.set([1 - 0.36 * stain, 1 - 0.33 * stain, 1 - 0.25 * stain], i);
  }
  return { mesh, hit: mesh };
})();
function cellMatrix(side: number, x: number, y: number, g: number, theta: number, length: number, width: number): M4 {
  const z = sectionHeight(side, x, y, g);
  const dx = (sectionHeight(side, x + 0.008, y, g) - z) / 0.008;
  const dy = (sectionHeight(side, x, y + 0.008, g) - z) / 0.008;
  const c = Math.cos(theta), s = Math.sin(theta);
  return new Float32Array([length * c, length * s, length * (dx * c + dy * s), 0,
    -width * s, width * c, width * (-dx * s + dy * c), 0, 0, 0, 0.012, 0,
    (side ? RX : LX) + x, y, z + 0.006, 1]);
}

// An irregular trabecular plexus spreads between nearby osteoblast clusters.
// New bridges close its lacunae; the cortical sheet grows over this fixed depth.
const SPICULE_NODES: P2[] = [
  [-0.1, 0.03], [-0.5, 0.35], [0.28, 0.41], [0.31, -0.23], [-0.28, -0.48],
  [-0.84, -0.19], [-0.99, 0.54], [-0.33, 0.79], [0.74, 0.67], [0.96, 0.16],
  [0.68, -0.63], [0.02, -0.81], [-0.92, -0.58], [-1.35, 0.09], [1.31, -0.16],
];
const SPICULE_EDGES = [
  [0, 1, 0], [0, 3, 0.02], [1, 2, 0.11], [3, 4, 0.12], [3, 2, 0.21],
  [1, 5, 0.23], [4, 5, 0.31], [1, 6, 0.32], [2, 7, 0.33], [3, 9, 0.36],
  [4, 11, 0.43], [5, 12, 0.46], [7, 6, 0.5], [2, 8, 0.5], [9, 8, 0.58],
  [3, 10, 0.51], [10, 11, 0.64], [5, 13, 0.59], [12, 13, 0.72], [9, 14, 0.69],
];
const spicules = new Map<number, Parts | null>();
function trabecularMesh(growth: number): Parts | null {
  const g = Q(growth);
  if (spicules.has(g)) return spicules.get(g)!;
  const parts = mergeParts(SPICULE_EDGES.map(([a, b, start], i) => {
    const [ax, ay] = SPICULE_NODES[a], [bx, by] = SPICULE_NODES[b];
    const bend = 0.24 * (hash(i, 7) - 0.5);
    const inStroma = (x: number, y: number): V3 => [LX + x, y, sectionHeight(0, x, y, 0)];
    const mid = inStroma((ax + bx) / 2 + (by - ay) * bend, (ay + by) / 2 - (bx - ax) * bend);
    return vessel([inStroma(ax, ay), mid, inStroma(bx, by)], {
      r0: 0.062 + 0.023 * hash(i, 8), r1: 0.032, flare: 0.08, flat: 0.46,
      sides: 9, n: 10, ref: [0, 0, 1],
    }, ss(start, start + 0.25, g));
  }));
  spicules.set(g, parts);
  return parts;
}

export function ossModel(pose: OssPose, o: BaseOpts = {}) {
  const items: Item3[] = [];
  const pts: Record<string, V3> = {};
  const dim = o.dim;
  const fade = (id: string) => (!dim || dim.k <= 0.001 || dim.ids.includes(id) ? 1 : 1 - 0.65 * dim.k);
  const put = (key: string, id: string, parts: Parts | null, color: string, deep: string, tissue: Tissue3, extra: Partial<Item3> = {}) => {
    if (parts) items.push({ key, id, ...parts, color, deep, tissue, opacity: 1, ...extra });
  };

  const flat = Q(clamp01(pose.flat)), cart = Q(clamp01(pose.cart)), bone = Q(clamp01(pose.bone));
  const front = 2.13 * bone;
  const spic = clamp01(pose.spic);
  const surface = { outline: false, calm: true };
  for (const [i, id] of ['mintzezko-hezurtzapena', 'hezurtzapen-endokondrala'].entries()) {
    const side = i ? 'R' : 'L', g = i ? cart : flat;
    const ground = { ground: true, quiet: true, ...surface };
    put(`tray${side}`, 'mesenkima', tissueSlice(i, 'stroma', g), STROMA, STROMA_DEEP, 'mesenchyme',
      { ...ground, groups: [id] });
    put(`edge${side}`, id, tissueSlice(i, 'edge', 0), '#ecc1af', '#b7988b', 'mesenchyme', ground);
    put(`back${side}`, id, tissueSlice(i, 'back', 0), '#dfb4a6', '#b18f81', 'mesenchyme', ground);
    const x = i ? 1.57 : -1.57, y = 0.92;
    pts[id] = [(i ? RX : LX) + x, y, sectionHeight(i, x, y, g)];
  }
  if (spic > 0.01 && flat < 0.98) {
    put('spicules', 'hezur-espikulak', trabecularMesh(spic), TISSUE.bone, TISSUE.boneDeep, 'bone', surface);
    // Follow a growing peripheral branch once the first one is covered by bone.
    const [a, b, advance] = spic <= 0.32 ? [0, 1, ss(0.05, 0.30, spic)] : [1, 6, ss(0.36, 0.64, spic)];
    const x = lerp(SPICULE_NODES[a][0], SPICULE_NODES[b][0], advance);
    const y = lerp(SPICULE_NODES[a][1], SPICULE_NODES[b][1], advance);
    pts['hezur-espikulak'] = [LX + x, y, sectionHeight(0, x, y, 0) + 0.014];
  }
  if (flat > 0) {
    put('flat', 'hezur-lauak', tissueSlice(0, 'field', flat), TISSUE.bone, '#cbbd9f', 'bone', surface);
    pts['hezur-lauak'] = [LX, 0, sectionHeight(0, 0, 0, flat)];
  }
  if (cart > 0 && bone < 0.995) {
    put('model', 'kartilago-eredua', tissueSlice(1, 'field', cart, bone), TISSUE.cartilage, '#86b7af', 'cartilage', surface);
    const x = lerp(Math.min(front, fieldRadius(1, 0, cart)), fieldRadius(1, 0, cart), 0.61);
    pts['kartilago-eredua'] = [RX + x, 0, sectionHeight(1, x, 0, cart)];
  }
  if (bone > 0) {
    put('boneR', 'hezur-endokondrala', tissueSlice(1, 'mineral', cart, bone), TISSUE.bone, '#cbbd9f', 'bone', surface);
    pts['hezur-endokondrala'] = [RX, 0, sectionHeight(1, 0, 0, cart)];
  }

  // ———— the same cells, on each block ————
  const gather = clamp01(pose.gather);
  const hyper = clamp01(pose.hyper);
  CELLS.forEach((c, i) => {
    // Left: to a place round the ossification centre; then they ride up on the bone.
    {
      const a = Math.atan2(c.y, c.x);
      const rho = 0.63 + 0.53 * hash(i, 22) + 0.21 * flat;
      const tx = Math.cos(a) * rho * 1.25, ty = Math.sin(a) * rho * 0.86;
      const x = lerp(c.x, tx, gather), y = lerp(c.y, ty, gather);
      const id = gather > 0.5 ? 'osteoblastoak' : 'mesenkima';
      const angle = lerp(0.42 * x - 0.38 * y, a + 1.54, gather) + (hash(i, 13) - 0.5) * 0.86;
      const matrix = cellMatrix(0, x, y, flat, angle, 0.12 + 0.03 * hash(i, 7), lerp(0.036, 0.043, gather));
      put(`cl${i}`, id, CELL, mixHex('#e0b3a9', '#e3b575', gather), '#b68f74', 'mesenchyme',
        { matrix, opacity: fade(id), outline: false, calm: true });
      if (i === 10) pts[id === 'osteoblastoak' ? 'osteoblastoak' : 'mesenkima-l'] = [matrix[12], y, matrix[14] + 0.012];
    }
    // Right: into the model's rows (the first sixteen); the others stay outside and thin out.
    {
      const inModel = i < 16;
      const k = i % 8;
      const tx = inModel ? -1.53 + (k * 3.06) / 7 + 0.13 * (hash(i, 18) - 0.5) : c.x;
      const ty = inModel ? (i < 8 ? 0.29 : -0.29) + 0.12 * Math.sin(i * 1.7) : c.y;
      const x = lerp(c.x, tx, cart), y = lerp(c.y, ty, cart);
      const passed = inModel ? ss(0.12, -0.08, Math.abs(tx) - front) * ss(0, 0.02, bone) : 0;
      const op = inModel ? 1 : 1 - ss(0.1, 0.9, cart);
      if (op < 0.02) return;
      const id = passed > 0.5 ? 'osteoblastoak' : cart > 0.5 ? 'kondrozitoak' : 'mesenkima';
      const col = mixHex(mixHex('#e0b3a9', '#97c1b8', cart), '#e3b575', passed);
      const angle = 0.22 * x + 0.36 * Math.sin(i * 3.8) + 0.43 * y;
      const width = lerp(0.034, 0.047 + 0.019 * hyper, cart);
      const matrix = cellMatrix(1, x, y, cart, angle, lerp(0.14, 0.09 + 0.017 * hyper, cart), width);
      put(`cr${i}`, id, CELL, col, mixHex('#bb998c', '#81a69f', cart * (1 - passed)), 'mesenchyme',
        { matrix, opacity: op * (id === 'mesenkima' ? fade(id) : 1), ...surface });
      const at: V3 = [matrix[12], y, matrix[14] + 0.012];
      if (id === 'kondrozitoak') pts['kondrozitoak'] = at;
      if (passed > 0.5) pts['osteoblastoak-r'] = at;
      if (i === 11 && cart < 0.5) pts['mesenkima-r'] = at;
    }
  });
  pts['mesenkima'] = [LX + 0.25, -1.44, sectionHeight(0, 0.25, -1.44, flat)];
  pts['mesenkima-l'] ??= [LX, 0, 0.2];
  pts['mesenkima-r'] ??= [RX, 0, 0.2];
  return { items, pts };
}

// ———————————————————————————— The skull base ————————————————————————————

export interface BasePose {
  /** The plate's midline, back to front (sclerotomes → parachordal → hypophyseal → trabeculae), 0..1. */
  mid: number;
  /** The lateral pieces (periotic capsule → temporal wing → orbital wing), 0..1. */
  side: number;
  /** Bone on the viewer's left: midline, back to front; lateral pieces (each 0..1). */
  oMid: number;
  oSide: number;
  /** The occipital squama, straight from membrane (0..1). */
  squama: number;
}

export const BA0: BasePose = { mid: 0, side: 0, oMid: 0, oSide: 0, squama: 0 };

interface Piece {
  key: string;
  cart: string;
  bone: string;
  C: Polar;
  B: Polar;
  grow: (p: BasePose) => number;
  turn: (p: BasePose) => number;
  anchors?: boolean;
}

// The lateral structures share their outlines with the intact fetal skull.
function wingOutline(defs: typeof BASE_CARTILAGES, key: string): Polar {
  const def = defs.find(d => d.key === key)!;
  return polar(def.spec.outer.map(([x, z]): P2 => [x * 1.55, (z - 0.62) * 1.55 + 0.83]));
}

const PIECES: Piece[] = [
  {
    key: 'scl',
    cart: 'esklerotoma-okzipitalak',
    bone: 'okzipitalaren-oinaldea',
    C: polar([[0.72, -1.2], [1.1, -1.08], [1.42, -1.65], [1.3, -2.3], [0.85, -2.5], [0.72, -1.9]], [1.02, -1.75]),
    B: polar([[-0.68, -1.2], [-1, -1.08], [-1.62, -1.72], [-1.5, -2.32], [-0.85, -2.55], [-0.7, -1.9]], [-1.08, -1.78]),
    grow: (p) => ss(0, 0.32, p.mid),
    turn: (p) => ss(0, 0.32, p.oMid),
    anchors: false,
  },
  {
    key: 'para',
    cart: 'kartilago-parakordalak',
    bone: 'okzipitalaren-oinaldea',
    C: polar([[0.04, -1.02], [0.36, -1.06], [0.6, -0.6], [0.62, -0.06], [0.34, 0.26], [0.04, 0.28]], [0.32, -0.42]),
    B: polar([[-0.04, -1.08], [-0.54, -1.14], [-0.74, -0.6], [-0.72, -0.08], [-0.34, 0.26], [-0.04, 0.28]], [-0.36, -0.45]),
    grow: (p) => ss(0.18, 0.5, p.mid),
    turn: (p) => ss(0.1, 0.42, p.oMid),
  },
  {
    key: 'hyp',
    cart: 'hipofisi-kartilagoak',
    bone: 'esfenoidesaren-gorputza',
    C: polar([[0.04, 0.34], [0.62, 0.38], [0.66, 0.95], [0.4, 1.3], [0.04, 1.32]], [0.32, 0.82]),
    B: polar([[-0.04, 0.32], [-0.72, 0.32], [-0.74, 1.05], [-0.46, 1.72], [-0.04, 1.8]], [-0.38, 1]),
    grow: (p) => ss(0.4, 0.72, p.mid),
    turn: (p) => ss(0.36, 0.7, p.oMid),
  },
  {
    key: 'trab',
    cart: 'trenkada-kranialak',
    bone: 'etmoidesa',
    C: polar([[0.05, 1.4], [0.4, 1.45], [0.42, 2.4], [0.3, 3.2], [0.05, 3.28]], [0.22, 2.3]),
    B: polar([[-0.04, 1.86], [-0.52, 1.95], [-0.56, 2.9], [-0.3, 3.4], [-0.04, 3.5]], [-0.28, 2.7]),
    grow: (p) => ss(0.68, 1, p.mid),
    turn: (p) => ss(0.66, 1, p.oMid),
  },
  {
    key: 'peri',
    cart: 'kapsula-periotikoa',
    bone: 'harkaitza',
    C: wingOutline(BASE_CARTILAGES, 'capL'),
    B: mirrorP(wingOutline(BASE_BONES, 'petL')),
    grow: (p) => ss(0, 0.42, p.side),
    turn: (p) => ss(0, 0.42, p.oSide),
  },
  {
    key: 'temp',
    cart: 'hego-tenporala',
    bone: 'esfenoidesaren-hego-handia',
    C: wingOutline(BASE_CARTILAGES, 'temL'),
    B: mirrorP(wingOutline(BASE_BONES, 'greL')),
    grow: (p) => ss(0.3, 0.72, p.side),
    turn: (p) => ss(0.3, 0.72, p.oSide),
  },
  {
    key: 'orb',
    cart: 'begizulo-hegoa',
    bone: 'esfenoidesaren-hego-txikia',
    C: wingOutline(BASE_CARTILAGES, 'orbL'),
    B: mirrorP(wingOutline(BASE_BONES, 'lesL')),
    grow: (p) => ss(0.58, 1, p.side),
    turn: (p) => ss(0.58, 1, p.oSide),
  },
];

const SQUAMA = polar([[-0.04, -2.72], [-0.8, -2.66], [-1.7, -2.52], [-2.3, -2.4], [-2, -3], [-1.2, -3.5], [-0.04, -3.72]], [-1.05, -3.05]);
// The cut is in the same three-fossa surface as the intact skull. The specimen's
// y coordinate is anterior; one root-model unit spans 1.55 specimen units.
const skullFloor: Relief = (x, y) => {
  const level = 1.38 * (baseY(x / 1.55, (y - 0.83) / 1.55 + 0.62) + 1.16);
  const ax = Math.abs(x);
  const orbitalRoof = 0.34 * Math.exp(-((ax - 1.35) ** 2 / 0.86) - ((y - 2.48) ** 2 / 0.72));
  const cerebellarFossa = 0.29 * Math.exp(-((ax - 1.46) ** 2 / 0.6) - ((y + 2.2) ** 2 / 0.78));
  return level + orbitalRoof - cerebellarFossa;
};

const skullMargin = polar([
  [0, 4.04], [1.15, 3.84], [2.14, 3.23], [2.63, 2.3], [2.86, 1.15],
  [3.33, 0.08], [3.42, -1.23], [3.04, -2.6], [2.16, -3.58], [1.06, -3.96],
  [0, -4.06], [-1.06, -3.96], [-2.16, -3.58], [-3.04, -2.6], [-3.42, -1.23],
  [-3.33, 0.08], [-2.86, 1.15], [-2.63, 2.3], [-2.14, 3.23], [-1.15, 3.84],
], [0, -1.86]);

function cranialSection(part: 'floor' | 'wall' | 'cut' | 'exterior' | 'canal' | 'underside' | 'lumen'): Parts {
  // Ray-cast the floor from the foramen to the saw cut so the opening has no cap.
  const mesh = grid(part === 'floor' ? N * 2 : N, part === 'floor' ? 62 : part === 'underside' ? 36 : 8, (u, v) => {
    const a = 2 * Math.PI * u, c = Math.cos(a), s = Math.sin(a);
    const inner = 1 / Math.hypot(c / 0.64, s / 0.78);
    const edge = u * N, index = Math.floor(edge);
    const outer = lerp(skullMargin.r[index % N], skullMargin.r[(index + 1) % N], edge - index);
    const rim = 0.62 + 0.24 * s + 0.08 * Math.cos(2 * a);
    const radius = part === 'floor' ? lerp(inner, outer, v)
      : part === 'underside' ? lerp(inner + 0.035, outer + 0.13, v)
      : part === 'wall' ? outer + 0.13 * v
      : part === 'cut' ? outer + 0.13 + 0.14 * v
      : part === 'exterior' ? outer + 0.27 - 0.14 * v
      : part === 'lumen' ? inner + 0.035 - 0.10 * v : inner + 0.035 * v;
    const x = radius * c, y = -1.86 + radius * s + (part === 'lumen' ? -0.92 * v * v : 0);
    let z = skullFloor(x, y);
    if (part === 'wall') z += rim * v;
    if (part === 'cut') z += rim + 0.025 * Math.sin(Math.PI * v);
    if (part === 'exterior') z += rim - (rim + 0.32) * v;
    if (part === 'canal') z -= v * 0.68;
    if (part === 'lumen') z = skullFloor((inner + 0.035) * c, -1.86 + (inner + 0.035) * s) - 0.68 - 1.35 * v;
    if (part === 'underside') z -= lerp(0.68, 0.32, v);
    return [x, y, z];
  }, part === 'wall' || part === 'canal' || part === 'lumen' ? [0, -1.86, 0] : part === 'exterior' ? [-9, -1.86, 0] : part === 'underside' ? [0, 0, -20] : [0, 0, 20]);
  return { mesh, hit: mesh };
}
const SECTION = {
  floor: cranialSection('floor'), wall: cranialSection('wall'), cut: cranialSection('cut'),
  exterior: cranialSection('exterior'), canal: cranialSection('canal'), lumen: cranialSection('lumen'), underside: cranialSection('underside'),
};

// Axial cartilage joins the two sides of the developing midline and broadens
// into the roots of the lateral wings. Its relief follows the same cranial fossae.
const laminae = new Map<string, Parts>();
function basalLamina(side: number, midline: number, lateral: number): Parts {
  const m = Q(midline), l = Q(lateral);
  const key = `${side}/${m}/${l}`;
  const saved = laminae.get(key);
  if (saved) return saved;
  const mesh = grid(48, 14, (u, v) => {
    const y = -1.09 + (1.12 + 3.14 * m) * u;
    const end = Math.sin(Math.PI * u) ** 0.48;
    const width = end * (0.34 + 0.24 * Math.exp(-((y - 0.56) ** 2 / 0.5))
      + l * (0.98 * Math.exp(-((y - 0.68) ** 2 / 0.57)) + 0.76 * Math.exp(-((y + 0.48) ** 2 / 0.31))));
    const x = side * width * v;
    return [x, y, skullFloor(x, y) + 0.025 + 0.03 * (1 - v * v) * end];
  }, [0, 0, 20]);
  const parts = { mesh, hit: mesh };
  laminae.set(key, parts);
  return parts;
}

// The paired occipital elements grow around the aperture, with their medial
// surfaces continuing down its wall. Each arc broadens toward its lateral mass.
const occipitalArcs = new Map<string, Parts>();
function occipitalArc(side: number, growth: number, bone: number): Parts {
  const g = Q(growth), b = Q(bone);
  const key = `${side}/${g}/${b}`;
  const cached = occipitalArcs.get(key);
  if (cached) return cached;
  const mesh = grid(52, 14, (u, v) => {
    const a = (u - 0.5) * (0.3 + 2.7 * g);
    const c = Math.cos(a), s = Math.sin(a);
    const inner = 1 / Math.hypot(c / 0.64, s / 0.78);
    const width = (0.19 + (0.57 + 0.16 * b) * c ** 2) * (0.15 + 0.85 * g);
    const radius = inner + 0.008 + width * v;
    const x = side * radius * c, y = -1.86 + radius * s;
    const crest = Math.sin(v * Math.PI) ** 0.74 * (0.16 + 0.19 * c ** 2);
    const ends = Math.min(1, Math.sin(u * Math.PI) * 9);
    return [x, y, skullFloor(x, y) + 0.02 + g * (0.035 + crest) * ends];
  }, [0, -1.86, 15]);
  const parts = { mesh, hit: mesh };
  occipitalArcs.set(key, parts);
  return parts;
}

export function baseModel(pose: BasePose, o: BaseOpts = {}) {
  void o;
  const items: Item3[] = [];
  const pts: Record<string, V3> = {};
  const push = (key: string, id: string | undefined, parts: Parts | null, color: string, deep: string, tissue: Tissue3, extra: Partial<Item3> = {}) => {
    if (parts) items.push({ key, id, ...parts, color, deep, tissue, opacity: 1, ...extra });
  };

  // ———— the floor of the skull and its cut wall ————
  const ground = { ground: true, quiet: true, outline: false };
  push('floor', undefined, SECTION.floor, OC.floor, OC.floorDeep, 'bone', ground);
  push('wall', undefined, SECTION.wall, '#cdb49c', '#8c715b', 'bone', ground);
  push('cut', undefined, SECTION.cut, '#ead3aa', '#a98d70', 'bone', ground);
  push('exterior', undefined, SECTION.exterior, '#bc9f89', '#7f6552', 'bone', ground);
  push('underside', undefined, SECTION.underside, '#bea38c', OC.floorDeep, 'bone', ground);
  push('magnum', undefined, SECTION.canal, '#a9bfc3', '#607b85', 'membrane', ground);
  push('magnum-depth', undefined, SECTION.lumen, '#829daa', '#536d78', 'membrane', ground);

  if (pose.mid > 0.08) {
    for (const side of [-1, 1]) {
      const b = side < 0 ? pose.oMid : 0;
      push(`lamina${side}`, 'kondrokraneoa', basalLamina(side, pose.mid, pose.side),
        mixHex('#a0c4b9', OC.floor, b), mixHex(TISSUE.cartilageDeep, OC.floorDeep, b), 'cartilage',
        { quiet: true, ground: true, outline: false });
    }
  }

  for (const p of PIECES) {
    const g = p.grow(pose);
    if (g <= 0.01) continue;
    const t = p.turn(pose);
    if (p.key === 'scl') {
      for (const side of [-1, 1]) {
        const b = side < 0 ? t : 0;
        push(side < 0 ? 'sclL' : 'sclR', b > 0.5 ? p.bone : p.cart, occipitalArc(side, g, b),
          mixHex(TISSUE.cartilage, TISSUE.bone, b), mixHex(TISSUE.cartilageDeep, TISSUE.boneDeep, b),
          b > 0.5 ? 'bone' : 'cartilage', { groups: ['kondrokraneoa', p.cart, ...(side < 0 ? [p.bone] : [])], outline: false, calm: true });
      }
      pts[p.cart] = [1.01, -1.86, skullFloor(1.01, -1.86) + 0.34 * g];
      continue;
    }
    const size = 0.35 + 0.65 * g;
    // Both sphenoid wings cross the steep anterior-to-middle fossa step.
    const margin = p.key === 'orb' || p.key === 'temp' ? 0.07 : 0.012;
    const H = (p.key === 'peri' ? 0.39 : p.key === 'trab' ? 0.24 : 0.14) * ss(0, 0.5, g);
    // The viewer's right keeps the cartilage: the figure's own arrangement.
    const groups = ['kondrokraneoa', p.cart];
    push(`${p.key}R`, p.cart, pillow(`${p.key}R`, () => ({ c: p.C.c, r: p.C.r.map((x) => x * size) }), [g], margin, H, undefined, skullFloor), TISSUE.cartilage, TISSUE.cartilageDeep, 'cartilage', { groups, outline: false, calm: true });
    pts[p.cart] = [p.C.c[0], p.C.c[1], skullFloor(...p.C.c) + H + 0.04];
    // The viewer's left turns from the same cartilage into its bone.
    const M = mirrorP(p.C);
    const color = mixHex(TISSUE.cartilage, TISSUE.bone, t);
    const deep = mixHex(TISSUE.cartilageDeep, TISSUE.boneDeep, t);
    const h = H + 0.08 * t;
    push(
      `${p.key}L`,
      t > 0.5 ? p.bone : p.cart,
      pillow(
        `${p.key}L`,
        () => {
          const s = lerpP(M, p.B, t);
          return { c: s.c, r: s.r.map((x) => x * size) };
        },
        [g, t],
        margin,
        h, undefined, skullFloor,
      ),
      color,
      deep,
      t > 0.5 ? 'bone' : 'cartilage',
      { groups: ['kondrokraneoa', p.cart, p.bone], outline: false, calm: true },
    );
    if (p.anchors !== false) pts[p.bone] = [p.B.c[0], p.B.c[1], skullFloor(...p.B.c) + h + 0.04];
  }
  pts['kondrokraneoa'] = [0.32, -0.42, skullFloor(0.32, -0.42) + 0.21];

  // ———— the occipital squama: no cartilage before it, grown out of the membrane on both sides ————
  const sq = clamp01(pose.squama);
  if (sq > 0.01) {
    const sized = () => ({ c: SQUAMA.c, r: SQUAMA.r.map((x) => x * (0.25 + 0.75 * sq)) });
    push('squamaL', 'okzipitalaren-ezkata', pillow('squamaL', sized, [sq], 0, 0.1 + 0.12 * sq, undefined, skullFloor), TISSUE.bone, TISSUE.boneDeep, 'bone');
    push('squamaR', 'okzipitalaren-ezkata', pillow('squamaR', () => mirrorP(sized()), [sq], 0, 0.1 + 0.12 * sq, undefined, skullFloor), TISSUE.bone, TISSUE.boneDeep, 'bone');
    pts['okzipitalaren-ezkata'] = [SQUAMA.c[0], SQUAMA.c[1], skullFloor(...SQUAMA.c) + 0.27];
  }
  return { items, pts };
}
