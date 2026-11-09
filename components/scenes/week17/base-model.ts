import type { V3 } from '@/lib/three-d/math';
import { grid, type Mesh } from '@/lib/three-d/mesh';
import { plate, vessel, type Parts } from '@/lib/three-d/organic';
import type { Item3, Tissue3 } from '@/lib/three-d/scene';
import { blobParts, mixHex } from '@/components/scenes/week10/model3d';
import { TISSUE } from './common';

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
const darker = (c: string) => mixHex(c, '#000000', 0.5);

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
const shift = (o: Polar, dx: number): Polar => ({ c: [o.c[0] + dx, o.c[1]], r: o.r });

/** A smooth pillow on the floor: the rim rounds up, the top is gently domed. Clipped at |x| ≤ clip from its centre. */
function pillowMesh(o: Polar, z0: number, h: number, clip?: number): Mesh {
  const at = (u: number, v: number): V3 => {
    const th = u * Math.PI * 2;
    const f = u * N;
    const i = Math.floor(f);
    let r = lerp(o.r[i % N], o.r[(i + 1) % N], f - i);
    const c = Math.cos(th), s = Math.sin(th);
    if (clip !== undefined) r = Math.min(r, clip / Math.max(Math.abs(c), 1e-3));
    let k: number, z: number;
    if (v < 0.42) {
      const w = v / 0.42;
      k = 1 - 0.08 * w * w;
      z = h * Math.sin((w * Math.PI) / 2);
    } else {
      const w = (v - 0.42) / 0.58;
      k = 0.92 * (1 - w);
      z = h * (1 + 0.12 * (1 - (1 - w) * (1 - w)));
    }
    return [o.c[0] + c * r * k, o.c[1] + s * r * k, z0 + z];
  };
  return grid(N, 10, at, [o.c[0], o.c[1], 50]);
}

/** Meshes kept per quantised shape: a morph reuses them instead of rebuilding every frame. */
const pillows = new Map<string, Parts>();
const Q = (x: number) => Math.round(x * 48) / 48;
function pillow(key: string, make: () => Polar, q: readonly number[], z0: number, h: number, clip?: number): Parts {
  const k = `${key}|${q.map(Q).join(',')}|${Q(h)}|${clip === undefined ? '' : Q(clip)}`;
  let p = pillows.get(k);
  if (!p) {
    const mesh = pillowMesh(make(), z0, h, clip);
    p = { mesh, hit: mesh };
    if (pillows.size > 4000) pillows.clear();
    pillows.set(k, p);
  }
  return p;
}

const roundBox = (x0: number, x1: number, y0: number, y1: number, n = 56): [number, number][] =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const c = Math.cos(a), s = Math.sin(a);
    return [(x0 + x1) / 2 + ((x1 - x0) / 2) * Math.sign(c) * Math.abs(c) ** 0.3, (y0 + y1) / 2 + ((y1 - y0) / 2) * Math.sign(s) * Math.abs(s) ** 0.3];
  });

const hash = (i: number, s: number) => {
  const v = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453;
  return v - Math.floor(v);
};

export const OC = {
  osteoblast: '#f5b041',
  osteoblastDeep: '#8f5c10',
  chondrocyte: '#2f7f73',
  tray: '#6a5243',
  trayDeep: '#33261d',
  floor: '#5d5350',
  floorDeep: '#2a2422',
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
  return { x: ((col + 0.5) / 6 - 0.5) * 3.7 + (hash(i, 1) - 0.5) * 0.34, y: ((row + 0.5) / 4 - 0.5) * 2.7 + (hash(i, 2) - 0.5) * 0.32 };
});

const FLAT: Polar = {
  c: [0, 0],
  r: Array.from({ length: N }, (_, k) => {
    const th = (k / N) * Math.PI * 2;
    const e = 1 / Math.sqrt((Math.cos(th) / 1.75) ** 2 + (Math.sin(th) / 1.22) ** 2);
    return e * (1 + 0.07 * Math.sin(3 * th + 0.5) + 0.04 * Math.sin(5 * th + 1.7));
  }),
};
const MODEL: Polar = polar([[-1.9, 0.56], [-1.2, 0.72], [0, 0.5], [1.2, 0.72], [1.9, 0.56], [2, 0], [1.9, -0.56], [1.2, -0.72], [0, -0.5], [-1.2, -0.72], [-1.9, -0.56], [-2, 0]], [0, 0]);
const scaleP = (o: Polar, k: number): Polar => ({ c: o.c, r: o.r.map((x) => Math.max(0.001, x * k)) });

export function ossModel(pose: OssPose, o: BaseOpts = {}) {
  const items: Item3[] = [];
  const pts: Record<string, V3> = {};
  const dim = o.dim;
  const fade = (id: string) => (!dim || dim.k <= 0.001 || dim.ids.includes(id) ? 1 : 1 - 0.65 * dim.k);
  const put = (key: string, id: string, parts: Parts | null, color: string, deep: string, tissue: Tissue3, extra: Partial<Item3> = {}) => {
    if (parts) items.push({ key, id, ...parts, color, deep, tissue, opacity: 1, ...extra });
  };

  // ———— the two blocks of tissue ————
  put('trayL', 'mintzezko-hezurtzapena', plate('oss17-tray-l', roundBox(LX - 2.2, LX + 2.2, -1.7, 1.7), 0, -0.4), OC.tray, OC.trayDeep, 'mesenchyme', { ground: true, quiet: true });
  put('trayR', 'hezurtzapen-endokondrala', plate('oss17-tray-r', roundBox(RX - 2.2, RX + 2.2, -1.7, 1.7), 0, -0.4), OC.tray, OC.trayDeep, 'mesenchyme', { ground: true, quiet: true });
  pts['mintzezko-hezurtzapena'] = [LX - 1.7, 1.3, 0.03];
  pts['hezurtzapen-endokondrala'] = [RX + 1.7, 1.3, 0.03];

  // ———— left: spicules, flat bone ————
  const spic = clamp01(pose.spic);
  const flat = clamp01(pose.flat);
  if (spic > 0.01) {
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + 0.2;
      const R = 1.05 + 0.5 * hash(i, 3);
      const end: V3 = [LX + Math.cos(a) * R * 1.05, Math.sin(a) * R * 0.78, 0.1];
      const mid: V3 = [LX + Math.cos(a + 0.12) * R * 0.55, Math.sin(a + 0.12) * R * 0.42, 0.1];
      put(`sp${i}`, 'hezur-espikulak', vessel([[LX, 0, 0.1], mid, end], { r0: 0.085, r1: 0.04, sides: 8, ref: [0, 0, 1] }, spic), TISSUE.bone, TISSUE.boneDeep, 'bone');
    }
    pts['hezur-espikulak'] = [LX + 0.82, 0.55, 0.14];
  }
  if (flat > 0.01) {
    put('flat', 'hezur-lauak', pillow('flat', () => shift(scaleP(FLAT, 0.2 + 0.8 * flat), LX), [flat], 0, 0.14 + 0.1 * flat), TISSUE.bone, TISSUE.boneDeep, 'bone');
    pts['hezur-lauak'] = [LX + 0.1, 0.4 * (0.2 + 0.8 * flat), 0.28];
  }

  // ———— right: the cartilage model, then the bone from the middle out ————
  const cart = clamp01(pose.cart);
  const bone = clamp01(pose.bone);
  const front = 2.1 * bone;
  if (cart > 0.01 && bone < 0.995) {
    put('model', 'kartilago-eredua', pillow('model', () => shift(scaleP(MODEL, 0.3 + 0.7 * cart), RX), [cart], 0, 0.3 * ss(0, 0.6, cart)), TISSUE.cartilage, TISSUE.cartilageDeep, 'cartilage');
    pts['kartilago-eredua'] = [RX + Math.min(1.45, 0.4 + front + 0.5), 0.34, 0.34];
  }
  if (bone > 0.005) {
    const shape = shift(MODEL, 0);
    // The bone grows in the model's own frame: its clip is measured from the model's centre.
    put('boneR', 'hezur-endokondrala', pillow('boneR', () => shift(shape, RX), [0], 0, 0.36, front), TISSUE.bone, TISSUE.boneDeep, 'bone');
    pts['hezur-endokondrala'] = [RX + 0.1 * Math.min(1, front), 0.05, 0.42];
  }

  // ———— the same cells, on each block ————
  const gather = clamp01(pose.gather);
  const hyper = clamp01(pose.hyper);
  CELLS.forEach((c, i) => {
    // Left: to a place round the ossification centre; then they ride up on the bone.
    {
      const a = Math.atan2(c.y, c.x);
      const rho = 0.3 + 0.32 * (i % 4);
      const tx = Math.cos(a) * rho * 1.25, ty = Math.sin(a) * rho * 0.86;
      const x = lerp(c.x, tx, gather), y = lerp(c.y, ty, gather);
      const z = 0.15 + 0.12 * flat;
      const col = mixHex(TISSUE.mes, OC.osteoblast, gather);
      const id = gather > 0.5 ? 'osteoblastoak' : 'mesenkima';
      const r = lerp(0.12, 0.105, gather);
      put(`cl${i}`, id, blobParts({ center: [LX + x, y, z], radii: [r, r, r * 0.7], rings: 8, sides: 10 }), col, mixHex(TISSUE.mesDeep, OC.osteoblastDeep, gather), 'epithelium', { opacity: fade(id), groups: ['mesenkima'] });
      if (i === 10) pts[id === 'osteoblastoak' ? 'osteoblastoak' : 'mesenkima-l'] = [LX + x, y, z + 0.1];
    }
    // Right: into the model's rows (the first sixteen); the others stay outside and thin out.
    {
      const inModel = i < 16;
      const k = i % 8;
      const tx = inModel ? -1.5 + (k * 3) / 7 : c.x;
      const ty = inModel ? (i < 8 ? 0.27 : -0.27) * (k === 3 || k === 4 ? 0.8 : 1) : c.y;
      const x = lerp(c.x, tx, cart), y = lerp(c.y, ty, cart);
      const passed = inModel ? ss(0.12, -0.08, Math.abs(tx) - front) * ss(0, 0.02, bone) : 0;
      const z = lerp(0.15, 0.3, cart) + 0.08 * passed;
      const op = inModel ? 1 : 1 - ss(0.1, 0.9, cart);
      if (op < 0.02) return;
      const col = passed > 0.01 ? mixHex(OC.chondrocyte, OC.osteoblast, passed) : mixHex(TISSUE.mes, OC.chondrocyte, ss(0.3, 1, cart));
      const id = passed > 0.5 ? 'osteoblastoak' : cart > 0.5 ? 'kondrozitoak' : 'mesenkima';
      const r = lerp(0.12, lerp(0.095, 0.14, hyper), cart) * lerp(1, 0.78, passed);
      put(`cr${i}`, id, blobParts({ center: [RX + x, y, z], radii: [r, r, r * 0.7], rings: 8, sides: 10 }), col, mixHex(TISSUE.mesDeep, OC.osteoblastDeep, passed), 'epithelium', { opacity: op * (id === 'mesenkima' ? fade(id) : 1) });
      if (i === 15) pts['kondrozitoak'] = [RX + x, y, z + 0.08];
      if (i === 11) {
        if (passed > 0.5) pts['osteoblastoak-r'] = [RX + x, y, z + 0.08];
        if (cart < 0.5) pts['mesenkima-r'] = [RX + x, y, z + 0.1];
      }
    }
  });
  pts['mesenkima'] = pts['mesenkima-l'] ?? [LX, 0, 0.2];
  pts['mesenkima-l'] ??= [LX, 0, 0.2];
  pts['mesenkima-r'] ??= [RX, 0, 0.2];
  pts['osteoblastoak'] ??= [LX + 0.3, 0.3, 0.3];
  pts['osteoblastoak-r'] ??= [RX, 0.27, 0.4];
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
    C: polar([[0.85, -0.26], [1.6, -0.22], [2.5, -0.75], [2.55, -1.3], [1.85, -1.34], [1.05, -0.92]], [1.72, -0.78]),
    B: polar([[-0.76, -0.12], [-1.42, -0.2], [-2.85, -1.12], [-2.75, -1.55], [-2, -1.46], [-1, -0.84]], [-1.8, -0.86]),
    grow: (p) => ss(0, 0.42, p.side),
    turn: (p) => ss(0, 0.42, p.oSide),
  },
  {
    key: 'temp',
    cart: 'hego-tenporala',
    bone: 'esfenoidesaren-hego-handia',
    C: polar([[0.76, 0.34], [1.4, 0.2], [2.3, 0.35], [2.35, 0.9], [1.5, 1], [0.82, 0.86]], [1.5, 0.6]),
    B: polar([[-0.8, 0.36], [-1.2, 0.12], [-2.6, -0.22], [-3, 0.4], [-2.7, 1.14], [-1.6, 0.98], [-0.82, 0.9]], [-1.75, 0.46]),
    grow: (p) => ss(0.3, 0.72, p.side),
    turn: (p) => ss(0.3, 0.72, p.oSide),
  },
  {
    key: 'orb',
    cart: 'begizulo-hegoa',
    bone: 'esfenoidesaren-hego-txikia',
    C: polar([[0.72, 1.22], [1.3, 1.2], [2, 1.5], [2, 1.95], [1.2, 1.86], [0.72, 1.7]], [1.32, 1.56]),
    B: polar([[-0.56, 1.2], [-1.2, 1.14], [-2.55, 1.42], [-2.55, 1.76], [-1.4, 1.82], [-0.54, 1.76]], [-1.5, 1.48]),
    grow: (p) => ss(0.58, 1, p.side),
    turn: (p) => ss(0.58, 1, p.oSide),
  },
];

const SQUAMA = polar([[-0.04, -2.72], [-0.8, -2.66], [-1.7, -2.52], [-2.3, -2.4], [-2, -3], [-1.2, -3.5], [-0.04, -3.72]], [-1.05, -3.05]);
const OVAL = (rx: number, ry: number, n = 96): [number, number][] => Array.from({ length: n }, (_, i) => [rx * Math.cos((i / n) * Math.PI * 2), ry * Math.sin((i / n) * Math.PI * 2)]);
const MAGNUM = OVAL(0.64, 0.78, 40).map(([x, y]) => [x, y - 1.86] as [number, number]);

let RING: Parts | null = null;
const ring = () => {
  if (!RING) {
    const line = Array.from({ length: 121 }, (_, i): V3 => {
      const a = (i / 120) * Math.PI * 2;
      return [3.42 * Math.cos(a), 4.12 * Math.sin(a), 0.08];
    });
    RING = vessel(line, { r0: 0.2, sides: 14, n: 120, ref: [0, 0, 1], capStart: false, capEnd: false });
  }
  return RING;
};

export function baseModel(pose: BasePose, o: BaseOpts = {}) {
  void o;
  const items: Item3[] = [];
  const pts: Record<string, V3> = {};
  const push = (key: string, id: string | undefined, parts: Parts | null, color: string, deep: string, tissue: Tissue3, extra: Partial<Item3> = {}) => {
    if (parts) items.push({ key, id, ...parts, color, deep, tissue, opacity: 1, ...extra });
  };

  // ———— the floor of the skull and its cut wall ————
  push('floor', undefined, plate('base17-floor', OVAL(3.4, 4.1), 0, -0.3), OC.floor, OC.floorDeep, 'membrane', { ground: true, quiet: true });
  push('wall', undefined, ring(), TISSUE.bone, TISSUE.boneDeep, 'bone', { quiet: true });
  push('magnum', undefined, plate('base17-magnum', MAGNUM, 0.012, 0.004), '#15110f', '#050403', 'membrane', { ground: true, quiet: true, outline: false });

  for (const p of PIECES) {
    const g = p.grow(pose);
    if (g <= 0.01) continue;
    const t = p.turn(pose);
    const size = 0.35 + 0.65 * g;
    const H = 0.16 * ss(0, 0.5, g);
    // The viewer's right keeps the cartilage: the figure's own arrangement.
    const groups = ['kondrokraneoa', p.cart];
    push(`${p.key}R`, p.cart, pillow(`${p.key}R`, () => ({ c: p.C.c, r: p.C.r.map((x) => x * size) }), [g], 0, H), TISSUE.cartilage, TISSUE.cartilageDeep, 'cartilage', { groups });
    pts[p.cart] = [p.C.c[0], p.C.c[1], H + 0.04];
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
        0,
        h,
      ),
      color,
      deep,
      t > 0.5 ? 'bone' : 'cartilage',
      { groups: ['kondrokraneoa', p.cart, p.bone] },
    );
    if (p.anchors !== false) pts[p.bone] = [p.B.c[0], p.B.c[1], 0.28];
  }
  pts['kondrokraneoa'] = [0.32, -0.42, 0.24];

  // ———— the occipital squama: no cartilage before it, grown out of the membrane on both sides ————
  const sq = clamp01(pose.squama);
  if (sq > 0.01) {
    const sized = () => ({ c: SQUAMA.c, r: SQUAMA.r.map((x) => x * (0.25 + 0.75 * sq)) });
    push('squamaL', 'okzipitalaren-ezkata', pillow('squamaL', sized, [sq], 0, 0.1 + 0.12 * sq), TISSUE.bone, TISSUE.boneDeep, 'bone');
    push('squamaR', 'okzipitalaren-ezkata', pillow('squamaR', () => mirrorP(sized()), [sq], 0, 0.1 + 0.12 * sq), TISSUE.bone, TISSUE.boneDeep, 'bone');
    pts['okzipitalaren-ezkata'] = [SQUAMA.c[0], SQUAMA.c[1], 0.3];
  }
  return { items, pts };
}
