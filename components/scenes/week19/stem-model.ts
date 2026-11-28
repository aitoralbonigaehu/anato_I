import type { V3 } from '@/lib/three-d/math';
import { curve3 } from '@/lib/three-d/mesh';
import { cachedBlob, cachedMesh } from '@/lib/three-d/mesh-cache';
import { mergeParts, vessel, type Parts } from '@/lib/three-d/organic';
import { smin } from '@/lib/three-d/sdf';
import { extrudeProfile, type F2 } from '@/lib/three-d/profile';
import type { Item3 } from '@/lib/three-d/scene';
import { blobParts, mixHex, routeLength, vesselRouteOf } from '@/components/scenes/week10/model3d';
import { C19 } from './tones';

/**
 * Topic 19, section 10 (the brain's parts, caudal to cranial): the brainstem cut across, one block per level, each
 * tied to its level of the head (sites-b.ts), so a stage flies from the brain into the block where that part is.
 *
 * - 'med' (10.1, the medulla): the cord's plan, thicker and wider; the central canal keeps its name; the pyramids
 *   ventrally (motor axons going down), the ascending sensory paths dorsally. The cord continues below it (`cord`).
 * - 'met' (10.2, the metencephalon developing): the tube's two halves, each a strip bent round the canal (floor plate,
 *   basal plate, sulcus limitans, alar plate), the thin roof between their dorsal edges. `open` straightens the strips
 *   like a book opening on its floor: the roof widens, the canal opens from above into the 4th ventricle, the alar
 *   (sensory) plates end up lateral, the basal (motor) ones ventral and medial. `pons` the dense band in the floor;
 *   `lips` the rhombic lips on the alar plates' dorsal edges (cranially only); `fuse` they meet at the midline over the
 *   ventricle; `cover` the cerebellum grows back over the whole ventricle.
 * - 'mes' (10.3, the mesencephalon): `mat` 0 the 6th-week tube (like the cord), 1 the 12th week (the canal narrowed to
 *   the aqueduct, much white matter), 2 the 16th week (the cerebral peduncles ventrally). `nigra` the substantia nigra;
 *   `dopa` its dopamine carried cranially to the basal nuclei; `pd` Parkinson's: the cells die, nothing goes.
 *
 * Frame 'block': x the body's LEFT, y dorsal, z cranial; the canal at the origin; radius ≈ 1.
 */

export type StemKind = 'med' | 'met' | 'mes';
export interface StemPose {
  /** 'med': pyramids tinted (0..1), dorsal paths tinted (0..1), the axons drawn (0..1), the cord below (0..1). */
  pyr: number;
  dors: number;
  fib: number;
  cord: number;
  /** Signals moving: how far (any number) and how much shows (0..1). */
  flow: number;
  flowShow: number;
  /** Plates tinted by function: alar sensory, basal motor (0..1). */
  fn: number;
  /** 'met'. */
  open: number;
  pons: number;
  lips: number;
  fuse: number;
  cover: number;
  /** 'mes'. */
  mat: number;
  nigra: number;
  dopa: number;
  pd: number;
  /** The four colliculi on the dorsal side (topic 20, 2.1.3): caudal pair (hearing), cranial pair (sight) (0..1). */
  coll?: number;
}
export const STEM0: StemPose = { pyr: 0, dors: 0, fib: 0, cord: 0, flow: 0, flowShow: 0, fn: 0, open: 0, pons: 0, lips: 0, fuse: 0, cover: 0, mat: 0, nigra: 0, dopa: 0, pd: 0, coll: 0 };

export interface StemOpts {
  kind: StemKind;
  dim?: { ids: readonly string[]; k: number } | null;
}

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const ss = (a: number, b: number, x: number) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const L = (kps: readonly V3[], n = 24) => curve3(kps as V3[], n);
/** Quantised, so a morph rebuilds its outline a bounded number of times. */
const q = (x: number, n = 24) => Math.round(clamp01(x) * n) / n;

/** Half the block's length: the cut faces at z = ±LEN. */
export const STEM_LEN = 1.1;
const LEN = STEM_LEN;

// ———————————————————————— 2D helpers ————————————————————————

const ell = (cx: number, cy: number, rx: number, ry: number): F2 => (x, y) => (Math.hypot((x - cx) / rx, (y - cy) / ry) - 1) * Math.min(rx, ry);
/** Both sides: the region mirrored across the midline. */
const both = (f: F2): F2 => (x, y) => f(Math.abs(x), y);
const cap2 = (ax: number, ay: number, bx: number, by: number, ra: number, rb: number): F2 => {
  const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
  return (x, y) => {
    const h = clamp01(((x - ax) * dx + (y - ay) * dy) / l2);
    return Math.hypot(x - ax - dx * h, y - ay - dy * h) - (ra + (rb - ra) * h);
  };
};
const uni = (...fs: F2[]): F2 => (x, y) => Math.min(...fs.map((f) => f(x, y)));
const cut = (a: F2, ...bs: F2[]): F2 => (x, y) => Math.max(a(x, y), ...bs.map((b) => -b(x, y)));
const inter = (...fs: F2[]): F2 => (x, y) => Math.max(...fs.map((f) => f(x, y)));
const prism = (key: string, deps: number[], f: F2, r: number, z0 = -LEN, z1 = LEN, h = 0.008): Parts => {
  const m = cachedMesh(`stem19-${key}`, [...deps, z0, z1, r], () => extrudeProfile(f, [-r, -r], [r, r], h, z0, z1));
  return { mesh: m, hit: m };
};

// ———————————————————————— 'med': the medulla ————————————————————————

const MED_CANAL = ell(0, 0.08, 0.07, 0.07);
const MED_EPEND = ell(0, 0.08, 0.11, 0.11);
const MED_PYR = both(ell(0.3, -0.78, 0.25, 0.2));
const MED_DORS = both(ell(0.24, 0.66, 0.2, 0.17));
const MED_OUT: F2 = (() => {
  const body = ell(0, 0, 1.12, 0.92);
  const fissure: F2 = (x, y) => Math.max(Math.abs(x) - 0.04, y + 0.62);
  const sulcus: F2 = (x, y) => Math.max(Math.abs(x) - 0.016, 0.78 - y);
  return (x, y) => Math.max(smin(body(x, y), MED_PYR(x, y), 0.08), -fissure(x, y), -sulcus(x, y));
})();
const MED_GREY = cut(uni(ell(0, 0.06, 0.42, 0.2), both(cap2(0.2, 0.12, 0.5, 0.48, 0.1, 0.06)), both(ell(0.3, -0.22, 0.18, 0.17))), MED_EPEND);
/** The cord below (10.1/p3: the medulla is the same plan, a little thicker and wider). */
const CORD_OUT = ell(0, 0, 0.82, 0.68);
const CORD_GREY = cut(uni(ell(0, 0.04, 0.26, 0.11), both(cap2(0.12, 0.06, 0.34, 0.52, 0.08, 0.045)), both(ell(0.27, -0.22, 0.16, 0.16))), ell(0, 0.04, 0.07, 0.07));

// ———————————————————————— 'met': the hindbrain opening ————————————————————————

/** The closed tube's mid-wall radius; along each half-strip (arc length s from the ventral midline): */
const RM = 0.55;
const S_FLOOR = 0.12, S_LIM = 0.78, S_ALAR = 1.42;
/** The wall's thickness along the strip: thin floor plate, thick basal and alar plates. */
const thick = (s: number) => lerp(0.08, 0.34, ss(0.04, 0.2, s)) * lerp(1, 0.55, ss(1.2, S_ALAR, s));
const kappa = (open: number) => (1 / RM) * (1 - 0.62 * open);
/** A point of a half-strip's mid-line (the left half; mirror for the right), and its inward normal. */
function stripAt(s: number, open: number): { p: [number, number]; n: [number, number] } {
  const k = kappa(open), a = k * s;
  return { p: [Math.sin(a) / k, -RM + (1 - Math.cos(a)) / k], n: [-Math.sin(a), Math.cos(a)] };
}
/** The half-strip between s0 and s1 (both sides). */
function stripF(open: number, s0: number, s1: number): F2 {
  const k = kappa(open), cy = -RM + 1 / k;
  return both((x, y) => {
    const vx = x, vy = y - cy;
    const r = Math.hypot(vx, vy);
    const a = Math.atan2(vx, -vy);
    const s = a / k, t = 1 / k - r;
    const sc = Math.max(0, Math.min(S_ALAR, s));
    return Math.max(Math.abs(t) - thick(sc) / 2, s0 - s, s - s1);
  });
}
/** The roof plate's arch: from one alar plate's dorsal edge to the other's (its circle's centre height and radius). */
function roofArc(open: number) {
  const e = stripAt(S_ALAR, open).p;
  const ya = lerp(RM, e[1] + 0.42, ss(0, 0.6, open));
  const cy = (ya * ya - e[0] * e[0] - e[1] * e[1]) / (2 * (ya - e[1]));
  return { e, cy, rho: ya - cy, ya };
}
/** The roof plate: a thin arch from one alar plate's dorsal edge to the other's. */
function roofF(open: number): F2 {
  const { e, cy, rho } = roofArc(open);
  return (x, y) => Math.max(Math.abs(Math.hypot(x, y - cy) - rho) - 0.03, e[1] - 0.02 - y);
}
/** The cavity: inside the plates' arc below their dorsal edges, inside the roof's arch above them. */
function lumenF(open: number): F2 {
  const k = kappa(open), cy = -RM + 1 / k;
  const { e, cy: rc, rho } = roofArc(open);
  return (x, y) => Math.min(Math.max(Math.hypot(x, y - cy) - (1 / k - 0.03), y - e[1]), Math.max(Math.hypot(x, y - rc) - (rho - 0.02), e[1] - y));
}
/** The sulcus limitans: a groove on the lumen side at the plates' border. */
const limitans = (open: number): F2 => {
  const { p, n } = stripAt(S_LIM, open);
  const t = thick(S_LIM) / 2;
  return both(ell(p[0] + n[0] * t, p[1] + n[1] * t, 0.06, 0.06));
};
const plateF = (open: number, s0: number, s1: number): F2 => cut(stripF(open, s0, s1), limitans(open));
/** The pons: the dense band of axons in the ventricle's floor (ventral to it). */
const ponsF = (p: number): F2 => ell(0, -RM - 0.08 - 0.36 * p, 0.12 + 0.9 * p, 0.06 + 0.36 * p);
/** The rhombic lips: on the alar plates' dorsal edges; `fuse` brings them to the midline over the ventricle. */
const lipsF = (open: number, lips: number, fuse: number): F2 => {
  const e = stripAt(S_ALAR, open).p;
  const cx = lerp(e[0] - 0.05, 0.22, ss(0, 1, fuse)), cy = lerp(e[1] + 0.06, e[1] + 0.5, ss(0, 1, fuse));
  const r = 0.05 + 0.17 * lips + 0.08 * fuse;
  const one = both(ell(cx, cy, r * 1.2, r));
  if (fuse < 0.6) return one;
  const bridge = ell(0, cy + 0.02, 0.3 * ss(0.6, 1, fuse) + 0.01, r * 0.9);
  return (x, y) => smin(one(x, y), bridge(x, y), 0.1);
};

// ———————————————————————— 'mes': the midbrain ————————————————————————

/** The canal (`mat` 0 a cord-like lumen → 1 the narrow aqueduct). */
const mesLumen = (m: number): F2 => ell(0, 0.06, lerp(0.24, 0.07, ss(0, 1, m)), lerp(0.32, 0.07, ss(0, 1, m)));
const mesOut = (m: number): F2 => {
  const body = ell(0, 0, lerp(0.62, 1.0, ss(0, 1, m)), lerp(0.62, 0.86, ss(0, 1, m)));
  const ped = both(ell(0.48, -0.78, 0.4, 0.3));
  const p = ss(1, 2, m);
  if (p < 0.01) return body;
  const pedK: F2 = (x, y) => ped(x, y) + 0.5 * (1 - p);
  const notch: F2 = (x, y) => Math.max(Math.abs(x) - 0.06 * p, y + 0.7);
  return (x, y) => Math.max(smin(body(x, y), pedK(x, y), 0.12), -notch(x, y));
};
/** The grey round the canal (the periaqueductal grey and the tegmentum's nuclei), thinner once the white thickens. */
const mesGrey = (m: number): F2 => cut(ell(0, 0.02, lerp(0.5, 0.42, ss(0, 1, m)), lerp(0.5, 0.36, ss(0, 1, m))), ell(0, 0.06, lerp(0.3, 0.1, ss(0, 1, m)), lerp(0.38, 0.1, ss(0, 1, m))));
const mesPed = (m: number): F2 => inter(both(ell(0.48, -0.78, 0.4, 0.3)), (x, y) => (mesOut(m)(x, y)), (x, y) => y + 0.52);
const NIGRA: F2 = both((x, y) => {
  // A crescent between the tegmentum and the peduncle, tilted up laterally.
  const c = Math.cos(0.42), s = Math.sin(0.42);
  const u = (x - 0.42) * c - (y + 0.5) * s, v = (x - 0.42) * s + (y + 0.5) * c;
  return (Math.hypot(u / 0.3, v / 0.065) - 1) * 0.065;
});
const NIGRA_PT: V3 = [-0.42, -0.5, 0];
/** Dopamine's way: out of the nigra, cranially, to the basal nuclei of the telencephalon (above and to the side). */
const DOPA: V3[] = L([[-0.42, -0.5, -LEN], [-0.42, -0.48, 0], [-0.46, -0.4, LEN], [-0.7, 0.1, LEN + 0.7], [-1.0, 0.55, LEN + 1.3]], 50);
const BASAL: V3 = [-1.05, 0.62, LEN + 1.42];

// ———————————————————————— signals ————————————————————————

const cellsOf = (n: number, jit: number) => {
  const cells = new Float32Array(n * 4);
  const gates = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    cells.set([i / n, Math.sin(i * 12.9) * jit, Math.cos(i * 7.3) * jit, Math.sin(i * 3.1) * jit], i * 4);
    gates[i] = ((i * 0.618034) % 1) * 0.85;
  }
  return { cells, gates };
};
const DROPS = cellsOf(10, 0.05);
const along = (x: number, y: number, down: boolean, ext = 0) => {
  const a: V3 = [x, y, LEN + 0.02 + ext], b: V3 = [x, y, -LEN - 0.02 - ext];
  const route = vesselRouteOf(L(down ? [a, [x, y, 0], b] : [b, [x, y, 0], a], 20));
  return { route, rate: 0.7 / routeLength(route) };
};
const MED_FLOWS = [
  { id: 'piramideak', color: C19.motor, deep: C19.motorDeep, ...along(0.3, -0.78, true, 0.9) },
  { id: 'piramideak', color: C19.motor, deep: C19.motorDeep, ...along(-0.3, -0.78, true, 0.9) },
  { id: 'goranzko-bideak', color: C19.sens, deep: C19.sensDeep, ...along(0.24, 0.66, false, 0.9) },
  { id: 'goranzko-bideak', color: C19.sens, deep: C19.sensDeep, ...along(-0.24, 0.66, false, 0.9) },
];
const PONS_FLOWS = [
  { id: 'zubia', color: C19.motor, deep: C19.motorDeep, ...along(0.35, -1.0, true) },
  { id: 'zubia', color: C19.motor, deep: C19.motorDeep, ...along(-0.35, -1.0, true) },
  { id: 'zubia', color: C19.sens, deep: C19.sensDeep, ...along(0.62, -0.86, false) },
  { id: 'zubia', color: C19.sens, deep: C19.sensDeep, ...along(-0.62, -0.86, false) },
];
const PED_FLOWS = [
  { id: 'garun-pedunkuluak', color: C19.motor, deep: C19.motorDeep, ...along(0.5, -0.82, true) },
  { id: 'garun-pedunkuluak', color: C19.motor, deep: C19.motorDeep, ...along(-0.5, -0.82, true) },
  { id: 'garun-pedunkuluak', color: C19.sens, deep: C19.sensDeep, ...along(0.36, -0.7, false) },
  { id: 'garun-pedunkuluak', color: C19.sens, deep: C19.sensDeep, ...along(-0.36, -0.7, false) },
];
const DOPA_FLOW = (() => {
  const route = vesselRouteOf(DOPA);
  return { route, rate: 0.8 / routeLength(route) };
})();

export function stemModel(pose: StemPose, o: StemOpts) {
  const items: Item3[] = [];
  const pts: Record<string, V3> = {};
  const dim = o.dim && o.dim.k > 0.001 ? o.dim : null;
  const k = dim ? dim.k : 0;
  const lit = (id: string | undefined, groups?: readonly string[]) => !dim || (!!id && dim.ids.includes(id)) || (groups ?? []).some((g) => dim.ids.includes(g));
  const put = (key: string, id: string | undefined, parts: Parts | null, color: string, deep: string, extra: Partial<Item3> = {}) => {
    if (!parts || (extra.opacity ?? 1) <= 0.01) return;
    const off = !!dim && !!id && !extra.ground && !lit(id, extra.groups);
    items.push({ key, id, ...parts, color: off ? mixHex(color, '#c4bcbb', 0.45 * k) : color, deep: off ? mixHex(deep, '#7c7472', 0.45 * k) : deep, tissue: 'neural', ...extra });
  };
  const fn = clamp01(pose.fn);
  const W = C19.white, WD = C19.whiteDeep, G = C19.grey, GD = C19.greyDeep;
  const flows = (list: { id: string; color: string; deep: string; route: Float32Array; rate: number }[], show: number) => {
    if (show <= 0.01) return;
    const drop = cachedBlob({ center: [0, 0, 0], radii: [0.045, 0.045, 0.07], rings: 6, sides: 8 });
    list.forEach((f, i) => items.push({ key: `flow-${i}`, id: f.id, mesh: drop, color: f.color, deep: f.deep, tissue: 'skin', stream: { route: f.route, phase: pose.flow * f.rate, grow: show, ...DROPS } }));
  };

  if (o.kind === 'med') {
    const pyr = clamp01(pose.pyr), dors = clamp01(pose.dors);
    const white = cut(MED_OUT, MED_GREY, MED_EPEND, MED_PYR, MED_DORS);
    put('white', 'erraboila', prism('med-white', [], white, 1.2), W, WD, { groups: ['mielentzefaloa', 'gai-zuria'] });
    put('grey', 'gai-grisa', prism('med-grey', [], MED_GREY, 1.2, -LEN - 0.006, LEN + 0.006), G, GD, { groups: ['erraboila'] });
    put('pyr', 'piramideak', prism('med-pyr', [], inter(MED_PYR, MED_OUT), 1.2, -LEN - 0.004, LEN + 0.004), mixHex(W, C19.motor, 0.85 * pyr), mixHex(WD, C19.motorDeep, pyr), { groups: ['erraboila', 'beheranzko-bideak'] });
    put('dors', 'goranzko-bideak', prism('med-dors', [], inter(MED_DORS, MED_OUT), 1.2, -LEN - 0.004, LEN + 0.004), mixHex(W, C19.sens, 0.85 * dors), mixHex(WD, C19.sensDeep, dors), { groups: ['erraboila'] });
    put('epend', 'hodi-ependimarioa', prism('med-epend', [], cut(MED_EPEND, MED_CANAL), 0.2, -LEN - 0.008, LEN + 0.008, 0.004), C19.ependyma, '#2a5a86', { tissue: 'membrane' });
    pts['erraboila'] = [-0.78, -0.2, LEN];
    pts['gai-grisa'] = [-0.3, 0.06, LEN];
    pts['piramideak'] = [-0.3, -0.8, LEN];
    pts['goranzko-bideak'] = [-0.24, 0.66, LEN];
    pts['hodi-ependimarioa'] = [0, 0.08, LEN];
    // The axons (fibres): long threads down the pyramids, up the dorsal paths.
    const fib = clamp01(pose.fib);
    if (fib > 0.01) {
      const threads = (xs: [number, number][], down: boolean) => mergeParts(xs.map(([x, y]) => vessel(L(down ? [[x, y, LEN + 0.6], [x, y, -LEN - 0.6]] : [[x, y, -LEN - 0.6], [x, y, LEN + 0.6]], 12), { r0: 0.018, r1: 0.018, sides: 8, n: 12 }, fib)));
      put('fib-m', 'piramideak', threads([[0.24, -0.74], [0.36, -0.82], [0.3, -0.68], [-0.24, -0.74], [-0.36, -0.82], [-0.3, -0.68]], true), C19.motor, C19.motorDeep, { tissue: 'nerve' });
      put('fib-s', 'goranzko-bideak', threads([[0.18, 0.62], [0.3, 0.7], [0.24, 0.56], [-0.18, 0.62], [-0.3, 0.7], [-0.24, 0.56]], false), C19.sens, C19.sensDeep, { tissue: 'nerve' });
    }
    flows(MED_FLOWS, clamp01(pose.flowShow));
    // The cord, continuing caudally: the same plan, smaller.
    const cord = clamp01(pose.cord);
    if (cord > 0.01) {
      const z0 = -LEN - 1.4, z1 = -LEN - 0.002;
      put('cord-white', 'ornomuina', prism('cord-white', [], cut(CORD_OUT, CORD_GREY), 0.9, z0, z1), W, WD, { opacity: cord, groups: ['gai-zuria'] });
      put('cord-grey', 'ornomuina', prism('cord-grey', [], CORD_GREY, 0.9, z0 - 0.006, z1), G, GD, { opacity: cord, groups: ['gai-grisa'] });
      pts['ornomuina'] = [-0.7, 0, -LEN - 0.9];
    }
    return { items, pts };
  }

  if (o.kind === 'met') {
    const op = q(pose.open), ponsK = q(pose.pons, 12), lips = q(pose.lips, 12), fuse = q(pose.fuse, 12), cover = clamp01(pose.cover);
    const basalC = mixHex(C19.brain, C19.motor, 0.8 * fn), alarC = mixHex(C19.brain, C19.sens, 0.8 * fn);
    put('floor', 'zoru-plaka', prism('met-floor', [op], stripF(op, 0, S_FLOOR), 1.9), W, WD, { groups: ['metentzefaloa'] });
    put('basal', 'oinalde-plaka', prism('met-basal', [op], plateF(op, S_FLOOR, S_LIM), 1.9), basalC, mixHex(C19.brainDeep, C19.motorDeep, fn), { groups: ['metentzefaloa', 'eremu-motorra'] });
    put('alar', 'hegal-plaka', prism('met-alar', [op], plateF(op, S_LIM, S_ALAR + 0.02), 1.9), alarC, mixHex(C19.brainDeep, C19.sensDeep, fn), { groups: ['metentzefaloa', 'eremu-sentsitiboa'] });
    put('roof', 'sabai-plaka', prism('met-roof', [op], roofF(op), 1.9, -LEN, LEN, 0.005), mixHex(W, C19.ependyma, 0.35), WD, { groups: ['metentzefaloa', 'laugarren-bentrikulua'], tissue: 'membrane', opacity: 1 - 0.35 * cover });
    const lim = stripAt(S_LIM, op), alar = stripAt(1.1, op), bas = stripAt(0.45, op), e = stripAt(S_ALAR, op).p;
    pts['zoru-plaka'] = [0, -RM, LEN];
    pts['oinalde-plaka'] = [-bas.p[0], bas.p[1], LEN];
    pts['hegal-plaka'] = [-alar.p[0], alar.p[1], LEN];
    pts['eremu-motorra'] = pts['oinalde-plaka'];
    pts['eremu-sentsitiboa'] = pts['hegal-plaka'];
    pts['ildo-mugatzailea'] = [-(lim.p[0] + lim.n[0] * 0.2), lim.p[1] + lim.n[1] * 0.2, LEN];
    // The sulcus limitans itself: a dark groove line along each side's plate border, on the lumen side.
    {
      const tl = thick(S_LIM) / 2, gx = lim.p[0] + lim.n[0] * tl, gy = lim.p[1] + lim.n[1] * tl;
      // Its ends stand a hair proud of the cut faces, so the groove reads as a dark dot on the section as well.
      put('limitans', 'ildo-mugatzailea', prism('met-lim', [op], both(ell(gx, gy, 0.04, 0.04)), 1.9, -LEN - 0.012, LEN + 0.012, 0.01), '#4a5070', '#1c1f2c', { groups: ['metentzefaloa'] });
    }
    pts['sabai-plaka'] = [0, roofArc(op).ya, LEN];
    // The 4th ventricle: the space under the roof, once the canal is open (a faint fluid fill, so it can be named).
    // The canal, and once it opens the 4th ventricle: a faint fluid fill between the plates and under the roof.
    const v4 = op > 0.3 ? 'laugarren-bentrikulua' : 'hodi-ependimarioa';
    put('cavity', v4, prism('met-cavity', [op], cut(lumenF(op), stripF(op, 0, S_ALAR + 0.02), roofF(op), limitans(op)), 1.9, -LEN + 0.01, LEN - 0.01, 0.008), C19.csf, C19.csfDeep, { groups: ['bentrikulu-sistema'], tissue: 'membrane', opacity: 0.4, outline: false });
    pts[v4] = [0, lerp(0, e[1] + 0.14, ss(0, 1, op)), LEN - 0.01];
    if (ponsK > 0.01) {
      put('pons', 'zubia', prism('met-pons', [ponsK], cut(ponsF(ponsK), stripF(op, 0, S_ALAR)), 1.9, -LEN, LEN, 0.008), mixHex(W, '#e8c7a8', 0.4), WD, { groups: ['metentzefaloa'] });
      pts['zubia'] = [0, -RM - 0.1 - 0.36 * ponsK, LEN];
      flows(PONS_FLOWS, clamp01(pose.flowShow) * ponsK);
    }
    if (lips > 0.01) {
      // Cranially only (10.2.2/p4): the lips, then the cerebellum, from the block's cranial part back over it.
      const zc = lerp(0.1, -LEN, cover);
      const id = fuse > 0.6 ? 'garuntxoa' : 'ezpain-erronboideak';
      const f = lipsF(op, lips, fuse);
      const sz = 1 + 0.35 * cover;
      const grown: F2 = (x, y) => f(x / sz, (y - e[1]) / sz + e[1]) * sz;
      put('lips', id, prism('met-lips', [op, lips, fuse, Math.round(cover * 12)], grown, 2.0, zc, LEN + 0.004), C19.met, '#7a4026', { groups: ['metentzefaloa', 'garuntxoa', 'ezpain-erronboideak'] });
      const cx = lerp(e[0] - 0.05, 0.22, ss(0, 1, fuse));
      pts[id] = [fuse > 0.6 ? 0 : -cx, lerp(e[1] + 0.06, e[1] + 0.5, ss(0, 1, fuse)), LEN];
      if (fuse <= 0.6) pts['garuntxoa'] = pts[id];
    }
    return { items, pts };
  }

  // 'mes'
  const m = Math.round(Math.max(0, Math.min(2, pose.mat)) * 12) / 12;
  const out = mesOut(m), lumen = mesLumen(m), grey = mesGrey(m);
  const p = ss(1, 2, m);
  const ped = mesPed(m);
  const dorsal: F2 = (x, y) => -y - 0.02;
  const ventral: F2 = (x, y) => y + 0.02;
  const nig = clamp01(pose.nigra), pd = clamp01(pose.pd);
  const white = p > 0.01 ? cut(out, grey, lumen, ped) : cut(out, grey, lumen);
  put('white', 'mesentzefaloa', prism('mes-white', [m], white, 1.3), W, WD, { groups: ['gai-zuria'] });
  put('grey-d', 'eremu-sentsitiboa', prism('mes-grey-d', [m], inter(grey, dorsal), 1.3, -LEN - 0.005, LEN + 0.005), mixHex(G, C19.sens, 0.75 * fn), mixHex(GD, C19.sensDeep, fn), { groups: ['mesentzefaloa', 'gai-grisa'] });
  put('grey-v', 'eremu-motorra', prism('mes-grey-v', [m], inter(grey, ventral), 1.3, -LEN - 0.005, LEN + 0.005), mixHex(G, C19.motor, 0.75 * fn), mixHex(GD, C19.motorDeep, fn), { groups: ['mesentzefaloa', 'gai-grisa'] });
  const epend = cut((x, y) => lumen(x, y) - 0.035, lumen);
  put('aq', 'garun-akueduktoa', prism('mes-aq', [m], epend, 0.5, -LEN - 0.008, LEN + 0.008, 0.004), C19.ependyma, '#2a5a86', { groups: ['hodi-ependimarioa'], tissue: 'membrane' });
  pts['mesentzefaloa'] = [-0.78, 0.3, LEN];
  pts['garun-akueduktoa'] = [0, 0.06, LEN];
  pts['eremu-sentsitiboa'] = [-0.2, 0.34, LEN];
  pts['eremu-motorra'] = [-0.22, -0.2, LEN];
  pts['hodi-ependimarioa'] = pts['garun-akueduktoa'];
  if (p > 0.01) {
    put('ped', 'garun-pedunkuluak', prism('mes-ped', [m], ped, 1.3, -LEN - 0.003, LEN + 0.003), mixHex(W, '#f6e2c8', 0.4), WD, { groups: ['mesentzefaloa'], opacity: p });
    pts['garun-pedunkuluak'] = [-0.55, -0.85, LEN];
    flows(PED_FLOWS, clamp01(pose.flowShow) * p);
  }
  if (nig > 0.01) {
    const col = mixHex('#2a2124', '#b9aeb0', pd);
    put('nigra', 'gai-beltza', prism('mes-nigra', [], NIGRA, 1.0, -LEN - 0.01, LEN + 0.01, 0.005), col, '#120c0e', { groups: ['mesentzefaloa'], opacity: nig });
    pts['gai-beltza'] = [NIGRA_PT[0], NIGRA_PT[1], LEN];
    // Its dopaminergic cells: dark dots in the crescent, fading as they die.
    const cells = mergeParts([0.24, 0.36, 0.48, 0.6].flatMap((x, i) => [-1, 1].map((sg) => blobParts({ center: [sg * x, -0.6 + 0.12 * i * 0.6 + (x - 0.42) * 0.45, LEN + 0.012], radii: [0.03, 0.03, 0.01], rings: 5, sides: 8 }))));
    put('nigra-cells', 'gai-beltza', cells, '#140d10', '#000000', { opacity: nig * (1 - pd) });
  }
  // The colliculi (topic 20): four mounds on the dorsal side, two pairs; the caudal ones (hearing), the cranial ones (sight).
  const coll = clamp01(pose.coll ?? 0);
  if (coll > 0.01) {
    const top = lerp(0.62, 0.86, ss(0, 1, m));
    const mound = (z: number) => mergeParts([-1, 1].map((sg) => blobParts({ center: [sg * 0.3, top - 0.05, z], radii: [0.25 * coll, 0.2 * coll, 0.36 * LEN], rings: 10, sides: 14 })));
    put('coll-inf', 'beheko-kolikuluak', mound(-0.5 * LEN), mixHex(W, '#e9b86a', 0.55), '#7a5418', { groups: ['mesentzefaloa', 'kolikuluak'], opacity: coll });
    put('coll-sup', 'goiko-kolikuluak', mound(0.5 * LEN), mixHex(W, '#9ac4f0', 0.55), '#244a72', { groups: ['mesentzefaloa', 'kolikuluak'], opacity: coll });
    pts['beheko-kolikuluak'] = [-0.3, top + 0.12, -0.5 * LEN];
    pts['goiko-kolikuluak'] = [-0.3, top + 0.12, 0.5 * LEN];
    pts['kolikuluak'] = [-0.3, top + 0.12, 0];
  }
  const dopa = clamp01(pose.dopa) * (1 - pd);
  const basalShow = Math.max(clamp01(pose.dopa) * 0.9, 0);
  if (basalShow > 0.01) {
    put('basal', 'oinaldeko-nukleoak', blobParts({ center: BASAL, radii: [0.32, 0.24, 0.42], rings: 12, sides: 14 }), mixHex('#c9a3d8', '#b9b0b4', pd), '#4e2f5c', { opacity: basalShow });
    pts['oinaldeko-nukleoak'] = BASAL;
    put('dopa-axon', 'gai-beltza', vessel(DOPA, { r0: 0.025, r1: 0.02, sides: 8, n: DOPA.length }, clamp01(pose.dopa)), mixHex('#8a6a9c', '#b9b0b4', pd), '#2e1e38', { tissue: 'nerve', opacity: 1 - 0.6 * pd });
  }
  if (dopa > 0.01) {
    const drop = cachedBlob({ center: [0, 0, 0], radii: [0.04, 0.04, 0.04], rings: 6, sides: 8 });
    items.push({ key: 'dopa', id: 'gai-beltza', mesh: drop, color: '#e6c84a', deep: '#6a5410', tissue: 'skin', stream: { route: DOPA_FLOW.route, phase: pose.flow * DOPA_FLOW.rate, grow: dopa, ...DROPS } });
  }
  return { items, pts };
}
