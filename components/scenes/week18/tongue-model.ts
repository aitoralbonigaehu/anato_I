import { fieldSurface, type FieldRegion } from '@/lib/three-d/field-surface';
import { add, mix3, type V3 } from '@/lib/three-d/math';
import { curve3, type Mesh } from '@/lib/three-d/mesh';
import { vessel, type Parts, type VesselOptions } from '@/lib/three-d/organic';
import type { Item3 } from '@/lib/three-d/scene';
import { blobParts, mixHex } from '@/components/scenes/week10/model3d';
import { ARCH, TISSUE } from '@/components/scenes/week17/common';

/**
 * Topic 18, section 2: the floor of the pharynx seen from behind and above (the notes' figures A → B of 2.1), as one
 * continuous surface (lib/three-d/field-surface.ts). Its regions are cut once in material coordinates (a across,
 * b along the tongue), so the arches' colours travel with the tissue while the swellings rise, fuse and grow.
 *
 * Axes as every model of the topics: x towards the embryo's LEFT, y cranial, z ventral. The floor's free face looks
 * dorsally (−z): from behind (yaw 180) the embryo's left is on the viewer's left and the tongue's tip is up.
 */

export interface TonguePose {
  /** The two lateral swellings and the tuberculum impar rising (0..1). */
  lat: number;
  imp: number;
  /** The three fused into one body (0..1), and the body's growth forwards (0..1). */
  fuse: number;
  grow: number;
  /** The copula (0..1), the epiglottis (0..1), the arytenoid swellings (0..1). */
  cop: number;
  epi: number;
  ary: number;
  /** The sulcus terminalis (0..1), the foramen caecum (0..1). */
  sulc: number;
  fc: number;
  /** The copula's bands merged into one root (0..1); the root long and deep, towards the neck (0..1). */
  root: number;
  deep: number;
  /** Arch colours → nerve colours (0..1). */
  nerve: number;
  /** The nerves reaching their region (0..1 each); the taste buds on the body (0..1). */
  n5: number;
  n7: number;
  n9: number;
  n10: number;
  taste: number;
  /** A sagittal cut sweeps to the midline (0..1). */
  cut: number;
  /** The occipital somites (0..1), the myoblasts' stream (0..1), the intrinsic muscles (0..1), XII (0..1), the 4th somite gone (0..1). */
  som: number;
  myo: number;
  fib: number;
  n12: number;
  s4: number;
}

export const TP0: TonguePose = { lat: 0, imp: 0, fuse: 0, grow: 0, cop: 0, epi: 0.25, ary: 0.25, sulc: 0, fc: 0, root: 0, deep: 0, nerve: 0, n5: 0, n7: 0, n9: 0, n10: 0, taste: 0, cut: 0, som: 0, myo: 0, fib: 0, n12: 0, s4: 0 };

export interface TongueOpts {
  dim?: { ids: readonly string[]; k: number } | null;
}

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const ss = (a: number, b: number, x: number) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const sabs = (x: number) => Math.sqrt(x * x + 0.004);
const sp = (s: number) => 0.5 * (s + Math.sqrt(s * s + 0.02));
const g2 = (a: number, b: number, cx: number, cy: number, rx: number, ry: number) => Math.exp(-(((a - cx) / rx) ** 2 + ((b - cy) / ry) ** 2));
const darker = (c: string) => mixHex(c, '#000000', 0.5);

// ———— the material chart ————
const A = 2.1;
const BMAX = 2.05;
const BMIN = -2.75;
const SKIRT = 0.3;
/** The slab's underside. */
const BASE = 0.95;

const BANDS = [
  { B: 0.1, k: 0.55 },
  { B: -0.38, k: 0.4 },
  { B: -0.82, k: 0.22 },
  { B: -1.14, k: 0.05 },
  { B: -1.58, k: 0 },
] as const;
/** The lower border of a band: a V, apex at the midline, flattening towards the caudal bands and at the side walls. */
const cur = (i: number, a: number) => BANDS[i].B + BANDS[i].k * Math.min(sabs(a), 1.25);
const APEX = cur(0, 0);
/** The tongue's half width at b (the rest of the floor is side wall). */
const W = (b: number) => (b <= 0.55 ? 1.12 : 1.12 * Math.sqrt(Math.max(0, 1 - ((b - 0.55) / 1.05) ** 2)));
const inside = (a: number, b: number) => Math.min(A - Math.abs(a), BMAX - b, b - BMIN);
const eImp = (a: number, b: number) => 0.2 * (1 - Math.hypot(a / 0.3, (b - 0.42) / 0.27));
const rFc = (a: number, b: number) => Math.hypot(a, b - APEX) - 0.075;
const eLar = (a: number, b: number) => 0.15 * (1 - Math.hypot(a / 0.15, (b + 2.02) / 0.36));
const eAry = (a: number, b: number) => 0.25 * (1 - Math.hypot((Math.abs(a) - 0.46) / 0.27, (b + 2.0) / 0.36));
const band = (i: number, a: number, b: number) => (i === 0 ? b - cur(0, a) : Math.min(b - cur(i, a), cur(i - 1, a) - b));

const tongueW = (i: number, a: number, b: number, extra = Infinity) => Math.min(band(i, a, b), W(b) - Math.abs(a), inside(a, b), rFc(a, b), extra);
const wallW = (i: number, a: number, b: number) => Math.min(band(i, a, b), Math.abs(a) - W(b), inside(a, b));
const epiT = (a: number) => 0.82 - Math.abs(a);
const caud = (a: number, b: number) => Math.min(cur(4, a) - b, inside(a, b));

const REGIONS: FieldRegion[] = [
  { name: 'latL', weight: (a, b) => tongueW(0, a, b, Math.min(-eImp(a, b), a)) },
  { name: 'latR', weight: (a, b) => tongueW(0, a, b, Math.min(-eImp(a, b), -a)) },
  { name: 'impar', weight: (a, b) => tongueW(0, a, b, eImp(a, b)) },
  { name: 'ii', weight: (a, b) => tongueW(1, a, b) },
  { name: 'iii', weight: (a, b) => tongueW(2, a, b) },
  { name: 'iv', weight: (a, b) => tongueW(3, a, b) },
  { name: 'epi', weight: (a, b) => Math.min(band(4, a, b), epiT(a), inside(a, b)) },
  { name: 'fc', weight: (a, b) => -rFc(a, b) },
  { name: 'wall1', weight: (a, b) => wallW(0, a, b) },
  { name: 'wall2', weight: (a, b) => wallW(1, a, b) },
  { name: 'wall3', weight: (a, b) => wallW(2, a, b) },
  { name: 'wall4', weight: (a, b) => wallW(3, a, b) },
  { name: 'wall5', weight: (a, b) => Math.min(band(4, a, b), -epiT(a), inside(a, b)) },
  { name: 'lar', weight: (a, b) => Math.min(caud(a, b), eLar(a, b)) },
  { name: 'aryL', weight: (a, b) => Math.min(caud(a, b), eAry(a, b), a) },
  { name: 'aryR', weight: (a, b) => Math.min(caud(a, b), eAry(a, b), -a) },
  { name: 'caud', weight: (a, b) => Math.min(caud(a, b), -eLar(a, b), -eAry(a, b)) },
  { name: 'base', weight: (a, b) => -inside(a, b) },
];

const NEUTRAL = '#d9c6b6';
const NEUTRAL_DEEP = '#7d6a5b';
const wallTint = (c: string) => mixHex(c, NEUTRAL, 0.58);
const COLORS: Record<string, string> = {
  latL: ARCH.i,
  latR: ARCH.i,
  impar: ARCH.i,
  ii: ARCH.ii,
  iii: ARCH.iii,
  iv: ARCH.iv,
  epi: ARCH.iv,
  fc: '#4a2410',
  wall1: wallTint(ARCH.i),
  wall2: wallTint(ARCH.ii),
  wall3: wallTint(ARCH.iii),
  wall4: wallTint(ARCH.iv),
  wall5: NEUTRAL,
  lar: '#2b1512',
  aryL: '#e3b39a',
  aryR: '#e3b39a',
  caud: NEUTRAL,
  base: NEUTRAL,
};

let surf: ReturnType<typeof fieldSurface> | null = null;
const surface = () =>
  (surf ??= fieldSurface({
    key: 'tongue18',
    nu: 180,
    nv: 170,
    chart: (u, v) => [lerp(-A - SKIRT, A + SKIRT, u), lerp(BMIN - SKIRT, BMAX + SKIRT, v)],
    regions: REGIONS,
    colors: COLORS,
    flip: true,
    soft: 0.014,
  }));

/** Height of the free surface (towards the dorsal side, the lumen) at material (a, b). */
function height(p: TonguePose, a: number, b: number): number {
  const s0 = b - cur(0, a);
  const abs = Math.abs(a);
  const lumps = clamp01(p.lat) * 0.62 * (g2(a, b, 0.56, 0.98, 0.46, 0.6) + g2(a, b, -0.56, 0.98, 0.46, 0.6)) + clamp01(p.imp) * 0.42 * g2(a, b, 0, 0.42, 0.26, 0.24);
  const dome = 0.68 * Math.exp(-(Math.hypot(a / 1.08, (b - 0.82) / 0.88) ** 3));
  let h = lerp(lumps, dome, clamp01(p.fuse));
  // The arches as transverse bars of the floor, and the copula rising on them at the midline.
  const bars = (0.17 * (1 - p.root) + 0.03) * (Math.exp(-(((b - (cur(0, a) + cur(1, a)) / 2) / 0.13) ** 2)) + Math.exp(-(((b - (cur(1, a) + cur(2, a)) / 2) / 0.13) ** 2)) + Math.exp(-(((b - (cur(2, a) + cur(3, a)) / 2) / 0.1) ** 2)));
  h += s0 < 0.25 ? bars * ss(0.25, 0.05, s0) : 0;
  h += 0.15 * (1 - p.fuse) * ss(0.95, 1.5, abs) * ss(0.45, 0.8, b) * ss(1.9, 1.5, b);
  h += p.cop * 0.34 * (1 - p.root) * g2(a, b, 0, -0.48, 0.4, 0.62);
  h += p.root * 0.34 * Math.exp(-(Math.hypot(a / 1.08, (b + 0.5) / 0.62) ** 3));
  h += clamp01(p.epi) * 0.42 * g2(a, b, 0, -1.36, 0.62, 0.17);
  h += clamp01(p.ary) * 0.36 * (g2(a, b, 0.46, -2, 0.22, 0.3) + g2(a, b, -0.46, -2, 0.22, 0.3));
  h -= 0.72 * Math.exp(-((a / 0.11) ** 2 + ((b + 2.02) / 0.3) ** 2));
  h += 0.55 * ss(1.35, 2.05, abs);
  h -= p.sulc * 0.11 * Math.exp(-((s0 / 0.07) ** 2)) * ss(1.2, 0.95, abs);
  h -= p.fc * 0.42 * Math.exp(-(((rFc(a, b) + 0.075) / 0.085) ** 2));
  return h;
}

const cutAt = (p: TonguePose) => lerp(A + SKIRT + 0.01, 0, clamp01(p.cut));

function placeXYZ(p: TonguePose, a0: number, b0: number, surfaceOnly = false): V3 {
  const a1 = Math.min(a0, cutAt(p));
  const a = Math.max(-A, Math.min(A, a1));
  const b = Math.max(BMIN, Math.min(BMAX, b0));
  const skirt = surfaceOnly ? 0 : clamp01(Math.max(Math.abs(a1) - A, b0 - BMAX, BMIN - b0) / SKIRT);
  const s0 = b - cur(0, a);
  const body = ss(-0.2, 0.25, s0);
  const x = a * (1 + 0.1 * p.grow * body);
  const y = b + p.grow * (0.85 * sp(s0) - 0.2 * sp(-s0)) - p.deep * 0.45 * sp(-s0 - 0.1) - 0.35 * p.grow + 0.15 * p.deep;
  const bend = p.deep * 0.22 * sp(-s0 - 0.1) ** 2;
  const top = -height(p, a, b) + bend;
  return [x, y, lerp(top, BASE + bend, skirt)];
}

/** The cut face: a sheet from the free surface down to the underside at the sweeping sagittal plane. */
function cutFace(p: TonguePose): Parts {
  const cols = 90, rows = 8;
  const ac = cutAt(p);
  const pos = new Float32Array((cols + 1) * (rows + 1) * 3);
  const nrm = new Float32Array((cols + 1) * (rows + 1) * 3);
  const uv = new Float32Array((cols + 1) * (rows + 1) * 2);
  const idx: number[] = [];
  for (let i = 0; i <= cols; i++) {
    const b = lerp(BMIN, BMAX, i / cols);
    const t = placeXYZ(p, ac, b, true);
    for (let j = 0; j <= rows; j++) {
      const v = (i * (rows + 1) + j) * 3;
      const k = j / rows;
      pos[v] = t[0];
      pos[v + 1] = t[1];
      pos[v + 2] = lerp(t[2], BASE + (p.deep * 0.22 * sp(-(b - cur(0, ac)) - 0.1) ** 2), k);
      nrm[v] = 1;
      uv[(i * (rows + 1) + j) * 2] = i / cols;
      uv[(i * (rows + 1) + j) * 2 + 1] = k;
      if (i < cols && j < rows) {
        const a0 = i * (rows + 1) + j, b0 = a0 + 1, c0 = a0 + rows + 1, d0 = c0 + 1;
        idx.push(a0, c0, b0, b0, c0, d0);
      }
    }
  }
  const mesh: Mesh = { pos, nrm, uv, idx: Uint32Array.from(idx) };
  return { mesh, hit: mesh };
}

/** A line laid on the surface (material points), lifted into the lumen. */
const onSurface = (p: TonguePose, line: readonly (readonly [number, number])[], n = 20) => curve3(line.map(([a, b]) => add(placeXYZ(p, a, b, true), [0, 0, -0.035])) as V3[], n);

const STEP_V = (s: number) =>
  [
    [
      [s * 2.05, 1.25],
      [s * 1.4, 1.18],
      [s * 0.95, 1.0],
      [s * 0.62, 1.22],
    ],
    [
      [s * 0.95, 1.0],
      [s * 0.55, 0.92],
    ],
    [
      [s * 0.95, 1.0],
      [s * 0.7, 0.72],
    ],
  ] as const;
const STEP_VII = (s: number) => [
  [s * 2.05, 0.82],
  [s * 1.32, 0.86],
  [s * 0.96, 0.62],
  [s * 0.42, 0.6],
] as const;
const STEP_IX = (s: number) =>
  [
    [
      [s * 2.05, 0.05],
      [s * 1.25, 0.08],
      [s * 0.72, -0.06],
      [s * 0.3, -0.12],
    ],
    [
      [s * 0.72, -0.06],
      [s * 0.42, -0.5],
    ],
  ] as const;
const STEP_X = (s: number) => [
  [s * 2.05, -0.95],
  [s * 1.2, -0.92],
  [s * 0.6, -0.92],
  [s * 0.2, -0.96],
] as const;

const TASTE: [number, number][] = Array.from({ length: 34 }, (_, i) => {
  const r = 0.14 + 0.82 * Math.sqrt((i + 0.5) / 34);
  const th = i * 2.399963;
  return [r * Math.cos(th) * 0.92, 0.92 + r * Math.sin(th) * 0.5];
});

/** The way of the myoblasts and of XII: from the somites round the pharynx, ventrally and into the tongue's base. */
const somY = (k: number) => -3.25 - k * 0.56;
const streamLine = (k: number, end: V3, lift = 0): V3[] =>
  curve3(
    [
      [1.05, somY(k), -1.35],
      [1.42 + lift, -3.6 + k * 0.05, -0.1],
      [1.2 + lift, -3.1, 1.32],
      [0.62 + lift, -1.55, 1.32],
      [0.16, -0.5 + lift * 0.3, 1.1],
      [0.06, 0.1, 0.72],
      end,
    ] as V3[],
    60,
  );

export function tongueModel(pose: TonguePose, o: TongueOpts = {}) {
  const items: Item3[] = [];
  const pts: Record<string, V3> = {};
  const dim = o.dim;
  /** Lit keeps its colour; the rest greys and stays solid (never glass). */
  const cc = (color: string, id: string | undefined, groups: readonly string[] = []) => {
    if (!dim || dim.k <= 0.001 || (id && dim.ids.includes(id)) || groups.some((g) => dim.ids.includes(g))) return color;
    return mixHex(color, '#bdb6ad', 0.78 * dim.k);
  };
  const put = (key: string, id: string | undefined, parts: Parts | null, color: string, extra: Partial<Item3> = {}) => {
    if (!parts) return;
    items.push({ key, id, ...parts, color: cc(color, id, extra.groups ?? []), deep: darker(cc(color, id, extra.groups ?? [])), tissue: 'epithelium', opacity: 1, ...extra });
  };
  const ball = (key: string, id: string | undefined, c: V3, r: V3, color: string, extra: Partial<Item3> = {}, rings = 10, sides = 12) => put(key, id, blobParts({ center: c, radii: r, rings, sides }), color, extra);
  const nerveTube = (key: string, id: string, line: V3[], color: string, g: number, prof: Partial<VesselOptions> = {}) => {
    if (g <= 0.01) return;
    put(key, id, vessel(line, { ref: [0, 0, 1], sides: 9, ...prof, r0: prof.r0 ?? 0.04, r1: prof.r1 ?? 0.026 }, clamp01(g)), mixHex(color, '#fff6da', 0.5), { tissue: 'vessel' });
  };

  const P = pose;
  const parts = surface().build([P.lat, P.imp, P.fuse, P.grow, P.cop, P.epi, P.ary, P.sulc, P.fc, P.root, P.deep, P.cut], (a, b, out, at) => {
    const q = placeXYZ(P, a, b);
    out[at] = q[0];
    out[at + 1] = q[1];
    out[at + 2] = q[2];
  });

  const n = clamp01(P.nerve);
  const fused = P.fuse > 0.5;
  const rootId = P.root > 0.5 ? 'mihiaren-sustraia' : 'kupula';
  const BODYG = ['mihiaren-gorputza', 'lehen-arkua', 'barail-nerbioa', 'aurpegi-nerbioa'];
  const region = (name: string, id: string | undefined, color: string, groups: string[], extra: Partial<Item3> = {}) => put(`f-${name}`, id, parts[name], color, { groups, soft: 1, ...extra });
  region('latL', fused ? 'mihiaren-gorputza' : 'alboko-goraguneak', ARCH.i, [...BODYG, 'alboko-goraguneak']);
  region('latR', fused ? 'mihiaren-gorputza' : 'alboko-goraguneak', ARCH.i, [...BODYG, 'alboko-goraguneak']);
  region('impar', fused ? 'mihiaren-gorputza' : 'tuberkulu-bakoitia', ARCH.i, [...BODYG, 'tuberkulu-bakoitia']);
  region('ii', rootId, mixHex(ARCH.ii, ARCH.iii, n), ['kupula', 'mihiaren-sustraia', 'bigarren-arkua', 'glosofaringeoa']);
  region('iii', rootId, ARCH.iii, ['kupula', 'mihiaren-sustraia', 'hirugarren-arkua', 'glosofaringeoa']);
  region('iv', rootId, ARCH.iv, ['kupula', 'mihiaren-sustraia', 'laugarren-arkua', 'goiko-laringe-nerbioa']);
  region('epi', 'epiglotisa', ARCH.iv, ['laugarren-arkua']);
  region('fc', 'zulo-itsua', COLORS.fc, []);
  const w = (c: string) => mixHex(c, NEUTRAL, 0.6 * n);
  region('wall1', 'lehen-arkua', w(COLORS.wall1), [], { tissue: 'mesenchyme' });
  region('wall2', 'bigarren-arkua', w(COLORS.wall2), [], { tissue: 'mesenchyme' });
  region('wall3', 'hirugarren-arkua', w(COLORS.wall3), [], { tissue: 'mesenchyme' });
  region('wall4', 'laugarren-arkua', w(COLORS.wall4), [], { tissue: 'mesenchyme' });
  region('wall5', undefined, COLORS.wall5, [], { tissue: 'mesenchyme', quiet: true });
  region('lar', 'laringe-zuloa', COLORS.lar, [], { outline: false });
  region('aryL', 'aritenoide-goraguneak', COLORS.aryL, []);
  region('aryR', 'aritenoide-goraguneak', COLORS.aryR, []);
  region('caud', undefined, COLORS.caud, [], { tissue: 'mesenchyme', quiet: true });
  region('base', undefined, COLORS.base, [], { tissue: 'mesenchyme', quiet: true, deep: NEUTRAL_DEEP, ground: true });

  if (P.cut > 0.01) put('cutface', undefined, cutFace(P), TISSUE.mes, { tissue: 'mesenchyme', quiet: true, deep: TISSUE.mesDeep });

  // ———— naming points (well inside each part, on the surface) ————
  const at = (a: number, b: number): V3 => add(placeXYZ(P, a, b, true), [0, 0, -0.02]);
  pts['alboko-goraguneak'] = at(0.58, 1.05);
  pts['tuberkulu-bakoitia'] = at(0, 0.42);
  pts['mihiaren-gorputza'] = at(0.3, 1.05);
  pts['kupula'] = at(0.05, -0.55);
  pts['mihiaren-sustraia'] = at(0.3, -0.45);
  pts['epiglotisa'] = at(0.25, -1.36);
  pts['zulo-itsua'] = at(0, APEX);
  pts['ildo-terminala'] = at(0.6, cur(0, 0.6));
  // The sulcus terminalis itself: a fine line along the bottom of the V groove (the groove alone is too shallow to read).
  if (P.sulc > 0.3 && P.cut < 0.02) {
    const vee = Array.from({ length: 33 }, (_, i) => {
      const a = -0.98 + (1.96 * i) / 32;
      return at(a, cur(0, a));
    });
    put('sulcus', 'ildo-terminala', vessel(vee, { ref: [1, 0, 0], sides: 6, r0: 0.03, r1: 0.03, n: 40 }), '#7d3a2c', { tissue: 'membrane', outline: false });
  }
  pts['laringe-zuloa'] = at(0, -2.02);
  pts['aritenoide-goraguneak'] = at(0.48, -2.0);
  pts['lehen-arkua'] = at(1.72, 1.45);
  pts['bigarren-arkua'] = at(1.72, cur(1, 1.72) + 0.25);
  pts['hirugarren-arkua'] = at(1.72, cur(2, 1.72) + 0.18);
  pts['laugarren-arkua'] = at(1.72, cur(3, 1.72) + 0.15);
  pts['sustrai-aurrekoa'] = at(0.55, -0.42);
  pts['sustrai-atzekoa'] = at(0.55, -0.98);

  // ———— the nerves, laid on their region from the side walls (both sides) ————
  for (const s of [1, -1]) {
    STEP_V(s).forEach((l, k) => nerveTube(`n5-${s}-${k}`, 'barail-nerbioa', onSurface(P, l), ARCH.i, k === 0 ? P.n5 : ss(0.55, 1, P.n5), k ? { r0: 0.028, r1: 0.016 } : {}));
    nerveTube(`n7-${s}`, 'aurpegi-nerbioa', onSurface(P, STEP_VII(s)), ARCH.ii, P.n7);
    STEP_IX(s).forEach((l, k) => nerveTube(`n9-${s}-${k}`, 'glosofaringeoa', onSurface(P, l), ARCH.iii, k === 0 ? P.n9 : ss(0.55, 1, P.n9), k ? { r0: 0.028, r1: 0.016 } : {}));
    nerveTube(`n10-${s}`, 'goiko-laringe-nerbioa', onSurface(P, STEP_X(s)), ARCH.iv, P.n10);
  }
  pts['barail-nerbioa'] = onSurface(P, STEP_V(1)[0])[7];
  pts['aurpegi-nerbioa'] = onSurface(P, STEP_VII(1))[7];
  pts['glosofaringeoa'] = onSurface(P, STEP_IX(1)[0])[7];
  pts['goiko-laringe-nerbioa'] = onSurface(P, STEP_X(1))[7];

  // ———— taste buds: VII's share of the body, blue points over the orange ————
  if (P.taste > 0.01)
    TASTE.forEach(([a, b], i) => {
      if (P.cut > 0.5 && a > 0) return;
      const r = 0.042 * ss(i / 34 - 0.02, i / 34 + 0.3, P.taste * 1.3);
      if (r < 0.004) return;
      ball(`bud${i}`, 'aurpegi-nerbioa', add(placeXYZ(P, a, b, true), [0, 0, -0.012]), [r, r, r * 0.8], ARCH.ii, { tissue: 'vessel' }, 6, 8);
    });
  pts['dastamen-zelulak'] = at(0.25, 0.92);

  // ———— somites, myoblasts, intrinsic muscles, XII ————
  if (P.som > 0.01) {
    for (let k = 0; k < 4; k++) {
      const gone = k === 3 ? 1 - clamp01(P.s4) : 1;
      const r = 0.3 * clamp01(P.som) * gone;
      if (r < 0.02) continue;
      for (const s of [1, -1]) ball(`som${s}${k}`, 'somita-okzipitalak', [s * 1.05, somY(k), -1.35], [r, r * 0.86, r * 1.05], TISSUE.paraxial, { deep: TISSUE.paraxialDeep, tissue: 'mesenchyme' }, 12, 16);
    }
    pts['somita-okzipitalak'] = [1.1, somY(1), -1.5];
  }
  const inner = (b: number, d: number): V3 => {
    const t = placeXYZ(P, 0, b, true);
    const under = BASE + (P.deep * 0.22 * sp(-(b - cur(0, 0)) - 0.1) ** 2);
    return [0.03, t[1], lerp(t[2], under, d)];
  };
  if (P.myo > 0.01) {
    const N = 26;
    for (let i = 0; i < N; i++) {
      const b = lerp(-0.7, 1.45, (i * 0.618) % 1);
      const d = lerp(0.15, 0.85, (i * 0.382) % 1);
      const line = streamLine(i % 3, inner(b, d), ((i * 0.27) % 1) * 0.14);
      const u = clamp01(P.myo * 1.7 - (i / N) * 0.7);
      if (u <= 0) continue;
      const q = line[Math.min(line.length - 1, Math.round(u * (line.length - 1)))];
      const shrink = 1 - 0.75 * ss(0.15, 0.9, P.fib);
      ball(`myo${i}`, 'mioblasto-okzipitalak', q, [0.06 * shrink, 0.06 * shrink, 0.06 * shrink], TISSUE.muscle, { deep: TISSUE.muscleDeep, tissue: 'vessel' }, 6, 8);
    }
    pts['mioblasto-okzipitalak'] = [1.05, -2.6, 1.34];
  }
  if (P.fib > 0.01) {
    const g = clamp01(P.fib);
    [0.2, 0.36, 0.52, 0.68, 0.84].forEach((d, k) =>
      put(`fibL${k}`, 'mihiaren-muskuluak', vessel(curve3(Array.from({ length: 6 }, (_, i) => inner(lerp(-0.75, 1.4, i / 5), d)) as V3[], 26), { ref: [1, 0, 0], sides: 9, r0: 0.04, r1: 0.03 }, g), TISSUE.muscle, { tissue: 'muscle', deep: TISSUE.muscleDeep }),
    );
    [-0.55, -0.2, 0.15, 0.5, 0.85, 1.2].forEach((b, k) =>
      put(`fibV${k}`, 'mihiaren-muskuluak', vessel(curve3([inner(b, 0.08), inner(b, 0.5), inner(b, 0.92)], 12), { ref: [1, 0, 0], sides: 8, r0: 0.03, r1: 0.025 }, g), mixHex(TISSUE.muscle, '#f3a39b', 0.35), { tissue: 'muscle', deep: TISSUE.muscleDeep }),
    );
    pts['mihiaren-muskuluak'] = inner(0.55, 0.45);
  }
  if (P.n12 > 0.01) {
    const line = streamLine(1, inner(0.8, 0.52), 0.32);
    put('n12', 'hipoglosoa', vessel(line, { ref: [0, 0, 1], sides: 10, r0: 0.07, r1: 0.04 }, clamp01(P.n12)), '#f7e17a', { tissue: 'vessel', deep: TISSUE.nerveDeep });
    pts['hipoglosoa'] = mix3(line[18], line[20], 0.5);
  }
  return { items, pts };
}
