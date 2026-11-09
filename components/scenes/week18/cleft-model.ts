import { grid, curve3, type Mesh } from '@/lib/three-d/mesh';
import type { V3 } from '@/lib/three-d/math';
import { vessel, type Parts } from '@/lib/three-d/organic';
import type { Item3 } from '@/lib/three-d/scene';
import { blobParts, mixHex } from '@/components/scenes/week10/model3d';
import { ARCH, TISSUE, type PoseModel } from '@/components/scenes/week17/common';

/**
 * Three small models of topics 17–18 (axes as every model: x the embryo's LEFT, y cranial, z ventral):
 * - `archVModel`: the pharynx seen from behind with its roof taken away (the notes' "V", 17 p.3): a yellow trough of
 *   endoderm, the arches as solid bars cut across at the roof, each cut face showing its layers and contents.
 * - `earModel`: a frontal section through the first cleft and first pouch (18, 1.2).
 * - `sinusModel`: a frontal section of the left side of the neck, the second arch growing down over the clefts (18 p.1).
 * The sections are solid slabs: filled regions in the cut plane, a back wall behind the cavities.
 */

export type Dim = { dim?: { ids: readonly string[]; k: number } | null };

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const ss = (a: number, b: number, x: number) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const gauss = (x: number, c: number, s: number) => Math.exp(-(((x - c) / s) ** 2));
const darker = (c: string) => mixHex(c, '#000000', 0.5);

/** Geometry built once per shape and pose (the models are called every frame). */
const cache = new Map<string, Parts>();
function mem(key: string, build: () => Parts | Mesh | null): Parts | null {
  let p = cache.get(key);
  if (!p) {
    if (cache.size > 1500) cache.clear();
    const b = build();
    if (!b) return null;
    p = 'mesh' in b ? b : { mesh: b, hit: b };
    cache.set(key, p);
  }
  return p;
}
const q = (x: number) => Math.round(x * 300) / 300;

function kit(dim: Dim['dim']) {
  const items: Item3[] = [];
  const pts: Record<string, V3> = {};
  /** Solid parts grey when dimmed, they do not turn to glass. */
  const tone = (c: string, id?: string, groups?: readonly string[]) => (!id || !dim || dim.k <= 0.001 || dim.ids.includes(id) || (groups ?? []).some((g) => dim.ids.includes(g)) ? c : mixHex(c, '#8d8782', 0.72 * dim.k));
  const put = (key: string, id: string | undefined, parts: Parts | null, color: string, extra: Partial<Item3> = {}) => {
    if (!parts) return;
    const c = tone(color, id, extra.groups);
    items.push({ key, id, ...parts, color: c, deep: darker(c), tissue: 'epithelium', ...extra });
  };
  return { items, pts, put };
}

// ———————————————————————————— The V from behind (topic 17) ————————————————————————————

export interface ArchPose {
  /** Arch colours (0) → the tissues on the cut faces and bars (1). */
  layers: number;
  /** Arch V: appears (0..0.5) and regresses (0.5..1). */
  v: number;
  /** Neural crest cells going into the mesenchyme (0..1). */
  crest: number;
  artery: number;
  vein: number;
  nerve: number;
  cartilage: number;
  /** Clefts and pouches between the arches (0..1). */
  grooves: number;
}
export const AP0: ArchPose = { layers: 0, v: 0, crest: 0, artery: 0, vein: 0, nerve: 0, cartilage: 0, grooves: 1 };

type K = 'i' | 'ii' | 'iii' | 'iv' | 'vi';
const BARS: { k: K; id: string; y: number; x: number; r: number }[] = [
  { k: 'i', id: 'lehen-arkua', y: 2.4, x: 2.55, r: 0.76 },
  { k: 'ii', id: 'bigarren-arkua', y: 1.02, x: 2.3, r: 0.66 },
  { k: 'iii', id: 'hirugarren-arkua', y: -0.14, x: 1.85, r: 0.54 },
  { k: 'iv', id: 'laugarren-arkua', y: -1.06, x: 1.42, r: 0.44 },
  { k: 'vi', id: 'seigarren-arkua', y: -1.76, x: 1.08, r: 0.3 },
];
const V_NUB = { y: -1.46, x: 1.26, r: 0.16 };
/** Between neighbouring arches: where the cleft (outside) and the pouch (inside) lie. */
const GAPS = BARS.slice(0, 4).map((b, i) => {
  const c = BARS[i + 1];
  const at = b.r / (b.r + c.r);
  return { y: lerp(b.y, c.y, at), x: lerp(b.x, c.x, at), r: (b.r + c.r) / 2 };
});

/** The trough's half-width at y: the arches' inner edges, wider at each pouch. */
const troughW = (y: number) => lerp(0.75, 1.92, ss(-2.3, 2.6, y)) + GAPS.reduce((a, g) => a + 0.34 * gauss(y, g.y, 0.17), 0);
const FLOOR_D = 1.15;
const floorZ = (u: number, y: number) => {
  const across = 1 - u * u;
  // The trough, the arches crossing its floor as low transverse ridges.
  return FLOOR_D * across ** 0.7 - BARS.reduce((a, b) => a + 0.16 * gauss(y, b.y, b.r * 0.55), 0) * across;
};
const FLOOR_Y0 = 3.35;
const FLOOR_Y1 = -2.25;

function disc(c: V3, r0: number, r1: number, a0: number, a1: number, n = 36): Mesh {
  return grid(n, 3, (u, v) => {
    const a = a0 + (a1 - a0) * u;
    const r = r0 + (r1 - r0) * v;
    return [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a), c[2]];
  }, [0, 0, -1]);
}

export function archVModel(pose: ArchPose, o: Dim = {}): PoseModel {
  const { items, pts, put } = kit(o.dim);
  const layers = clamp01(pose.layers);
  const ly = q(layers);

  put('ground', undefined, mem('v-ground', () => grid(4, 4, (u, v) => [-5 + 10 * u, -3.4 + 7.8 * v, 2.5], [0, 0, -1])), TISSUE.ground, { ground: true, quiet: true, tissue: 'mesenchyme' });
  put('floor', 'faringe-hestea', mem('v-floor', () => grid(40, 64, (u, v) => {
    const y = lerp(FLOOR_Y0, FLOOR_Y1, v);
    const uu = -1 + 2 * u;
    return [uu * troughW(y), y, floorZ(uu, y)];
  }, [0, 0, -1])), TISSUE.endo, { groups: ['endodermoa'] });
  // The laryngeal orifice: a dark slit on the floor, at the bottom of the V.
  put('larynx', 'laringe-zuloa', mem('v-lar', () => blobParts({ center: [0, -1.42, floorZ(0, -1.42) - 0.03], radii: [0.11, 0.34, 0.03], rings: 12, sides: 18 })), '#4a2a22');
  pts['laringe-zuloa'] = [0, -1.42, floorZ(0, -1.42) - 0.06];
  pts['faringe-hestea'] = [0.1, 1.7, floorZ(0.05, 1.7) - 0.05];
  pts['endodermoa'] = [0.75, 0.42, floorZ(0.4, 0.42) - 0.05];

  for (const s of [1, -1]) {
    BARS.forEach((b) => {
      const groups = ['faringe-arkuak'];
      const arch = mixHex(ARCH[b.k], TISSUE.ecto, layers);
      const line = curve3([[s * b.x, b.y, -0.02], [s * b.x * 0.98, b.y, 0.9], [s * b.x * 0.62, b.y - 0.1, 1.72], [s * 0.04, b.y - 0.16, 2.02]] as V3[], 16);
      put(`bar${b.k}${s}`, b.id, mem(`v-bar${b.k}${s}`, () => vessel(line, { r0: b.r, r1: b.r * 0.72, sides: 26, n: 18, capStart: false, capEnd: true, ref: [0, 1, 0] })), arch, { groups });

      // The cut face: ectoderm outside (lateral), endoderm inside (medial), mesenchyme between.
      const c: V3 = [s * b.x, b.y, -0.04];
      const t = Math.max(0.07, b.r * 0.15);
      const tiss = (x: string) => mixHex(mixHex(ARCH[b.k], '#ffffff', 0.18), x, layers);
      const lat = s > 0 ? 0 : Math.PI;
      void ly;
      put(`faceM${b.k}${s}`, 'mesenkima', mem(`v-fm${b.k}${s}`, () => disc(c, 0.001, b.r - t, 0, Math.PI * 2)), tiss(TISSUE.mes), { groups: [b.id, 'faringe-arkuak'], tissue: 'mesenchyme' });
      put(`faceE${b.k}${s}`, 'ektodermoa', mem(`v-fe${b.k}${s}`, () => disc([c[0], c[1], c[2] - 0.005], b.r - t, b.r, lat - 1.75, lat + 1.75)), tiss(TISSUE.ecto), { groups: [b.id, 'faringe-arkuak'] });
      put(`faceN${b.k}${s}`, 'endodermoa', mem(`v-fn${b.k}${s}`, () => disc([c[0], c[1], c[2] - 0.005], b.r - t, b.r, lat + 1.75, lat + 2 * Math.PI - 1.75)), tiss(TISSUE.endo), { groups: [b.id, 'faringe-arkuak'] });

      // The four contents, cut across (rods running along the arch, ends at the cut face).
      const rod = (key: string, id: string, g: number, dx: number, dy: number, rr: number, col: string) => {
        if (g <= 0.01) return;
        const rad = b.r * rr * lerp(0.4, 1, ss(0, 1, g));
        const at: V3 = [c[0] + s * b.r * dx, c[1] + b.r * dy, -0.05];
        put(`${key}${b.k}${s}`, id, mem(`v-${key}${b.k}${s}${q(rad)}`, () => vessel([[at[0], at[1], -0.09], [at[0], at[1], 0.6]], { r0: rad, r1: rad, sides: 14, n: 3, capStart: true, ref: [0, 1, 0] })), col, { tissue: 'vessel', groups: [b.id] });
        if (s > 0 && b.k === 'ii') pts[id] = [at[0], at[1], -0.11];
      };
      rod('art', 'arkuko-arteria', pose.artery, -0.34, 0.42, 0.17, TISSUE.artery);
      rod('vei', 'arkuko-zaina', pose.vein, 0.34, 0.4, 0.15, TISSUE.vein);
      rod('ner', 'arkuko-nerbioa', pose.nerve, -0.4, -0.3, 0.14, TISSUE.nerve);
      rod('car', 'arkuko-kartilagoa', pose.cartilage, 0.16, -0.36, 0.22, TISSUE.cartilage);
      if (s > 0) pts[b.id] = [c[0] + b.r * 0.1, c[1] + b.r * 0.1, -0.08];
    });
    if (s > 0) {
      const b = BARS[1];
      pts['faringe-arkuak'] = [BARS[2].x, BARS[2].y, -0.08];
      pts['mesenkima'] = [b.x + b.r * 0.02, b.y + 0.02, -0.08];
      pts['ektodermoa'] = [b.x + b.r * 0.93, b.y, -0.08];
    }

    // Arch V: a small bump that comes and goes.
    const v = Math.sin(Math.PI * clamp01(pose.v));
    if (v > 0.02) {
      const r = V_NUB.r * v;
      put(`v5${s}`, 'bosgarren-arkua', mem(`v-5${s}${q(r)}`, () => vessel([[s * V_NUB.x, V_NUB.y, -0.02], [s * V_NUB.x * 0.9, V_NUB.y, 0.8]], { r0: r, r1: r * 0.6, sides: 16, n: 4, capStart: true, ref: [0, 1, 0] })), ARCH.v);
      if (s > 0) pts['bosgarren-arkua'] = [V_NUB.x, V_NUB.y, -0.2];
    }

    // Clefts (outside, ectoderm) and pouches (inside, endoderm) in the same gap, face to face.
    if (clamp01(pose.grooves) > 0.01)
      GAPS.forEach((gp, i) => {
        const cleft: V3 = [s * (gp.x + gp.r * 0.72), gp.y, 0.12];
        const pouch: V3 = [s * (troughW(gp.y) + 0.02), gp.y, 0.15];
        put(`cl${i}${s}`, i === 0 ? 'lehen-arraildura' : 'faringe-arraildurak', mem(`v-cl${i}${s}`, () => blobParts({ center: cleft, radii: [0.24, 0.12, 0.5], rings: 12, sides: 18 })), TISSUE.ectoDeep, { groups: ['faringe-arraildurak'] });
        put(`po${i}${s}`, i === 0 ? 'lehen-poltsa' : 'faringe-poltsak', mem(`v-po${i}${s}`, () => blobParts({ center: pouch, radii: [0.26, 0.14, 0.45], rings: 12, sides: 18 })), TISSUE.endoDeep, { groups: ['faringe-poltsak'] });
        if (s > 0 && i === 1) {
          pts['faringe-arraildurak'] = [cleft[0], cleft[1], -0.42];
          pts['faringe-poltsak'] = [pouch[0], pouch[1], -0.32];
        }
      });

    // Neural crest cells: they come down from the dorsal side and stay in each arch's mesenchyme.
    const cr = clamp01(pose.crest);
    if (cr > 0.01)
      BARS.slice(0, 4).forEach((b, i) => {
        for (let k = 0; k < 9; k++) {
          const a = (k * 2.4 + i) % (Math.PI * 2);
          const rho = b.r * (0.25 + 0.5 * (((k * 37) % 10) / 10));
          const end: V3 = [s * b.x + rho * Math.cos(a), b.y + rho * Math.sin(a), -0.08];
          const start: V3 = [s * (0.35 + k * 0.05), 3.3 - i * 0.5, -1.9];
          const u = ss(0.05 + k * 0.05, 0.55 + k * 0.05, cr);
          const p: V3 = [lerp(start[0], end[0], u), lerp(start[1], end[1], u), lerp(start[2], end[2], u)];
          put(`nc${i}-${k}${s}`, 'gandor-neurala', mem(`v-nc${i}-${k}${s}${q(u)}`, () => blobParts({ center: p, radii: [0.07, 0.07, 0.07], rings: 6, sides: 8 })), TISSUE.crest, { tissue: 'vessel' });
        }
      });
  }
  pts['gandor-neurala'] = [BARS[1].x - 0.3, BARS[1].y + 0.28, -0.14];
  return { items, pts };
}

// ———————————————————————————— Slab helpers ————————————————————————————

type Line = (t: number) => readonly [number, number];
function region(key: string, a: Line, b: Line, z = 0, n = 48): Parts | null {
  return mem(key, () => grid(n, 2, (u, v) => {
    const p = a(u);
    const r = b(u);
    return [lerp(p[0], r[0], v), lerp(p[1], r[1], v), z];
  }, [0, 0, 1]));
}
function poly(pts: readonly (readonly [number, number])[]): Line {
  return (t) => {
    const x = t * (pts.length - 1);
    const i = Math.min(pts.length - 2, Math.floor(x));
    const k = x - i;
    return [lerp(pts[i][0], pts[i + 1][0], k), lerp(pts[i][1], pts[i + 1][1], k)];
  };
}
/** A wall along a line, from the cut plane back to the slab's far side. */
function depthWall(key: string, l: Line, facing: V3, d = 1.1, n = 40): Parts | null {
  return mem(key, () => grid(n, 2, (u, v) => {
    const p = l(u);
    return [p[0], p[1], -d * v];
  }, facing));
}

// ———————————————————————————— The first cleft and pouch (topic 18) ————————————————————————————

export interface EarPose {
  /** The cleft and the pouch deepen towards each other (0..1). */
  deep: number;
  /** The mesenchyme between them thins out to a fine layer (0..1). */
  meet: number;
}
export const EP0: EarPose = { deep: 0, meet: 0 };

const EAR_W = 3.5;
const EAR_H = 2.3;
const EAR_D = 1.1;

export function earModel(pose: EarPose, o: Dim = {}): PoseModel {
  const { items, pts, put } = kit(o.dim);
  const deep = clamp01(pose.deep);
  const meet = clamp01(pose.meet);
  const k = `${q(deep)}|${q(meet)}`;
  const t = 0.1;
  const gap = lerp(0.6, 0.16, meet);
  const xe = lerp(2.5, gap / 2, deep);
  const xn = lerp(-1.7, -gap / 2, deep);
  const R = 0.72;
  const re = (x: number) => R * lerp(0.55, 1, deep) + 0.65 * ss(EAR_W - 0.8, EAR_W, x);
  const rn = (x: number) => lerp(0.4, lerp(0.5, 1.02, deep), ss(xn - 1.7, xn - 0.5, x));
  const N = 22;
  const across = (a: number, b: number, f: (x: number) => number) => Array.from({ length: N + 1 }, (_, i): [number, number] => {
    const x = lerp(a, b, i / N);
    return [x, f(x)];
  });
  const tipR = Math.min(re(xe), rn(xn));

  // One half (s = 1 above the canal, −1 below): the mesenchyme, in its arch's colour.
  for (const s of [1, -1]) {
    const edge: [number, number][] = [
      ...across(-EAR_W, xn - t, (x) => s * (rn(x) + t)),
      [xn, s * (rn(xn) + t)],
      [xn + 0.001, 0],
      [xe - 0.001, 0],
      [xe, s * (re(xe) + t)],
      ...across(xe + t, EAR_W, (x) => s * (re(x) + t)),
    ];
    const top = edge.map(([x]): [number, number] => [x, s * EAR_H]);
    const id = s > 0 ? 'lehen-arkua' : 'bigarren-arkua';
    const col = mixHex(TISSUE.mes, s > 0 ? ARCH.i : ARCH.ii, 0.42);
    put(`mes${s}`, id, mem(`e-m${s}${k}`, () => grid(edge.length - 1, 2, (u, v) => {
      const i = Math.round(u * (edge.length - 1));
      return [edge[i][0], lerp(edge[i][1], top[i][1], v), 0];
    }, [0, 0, 1])), col, { tissue: 'mesenchyme' });
    // The canal's walls: ectoderm (lateral) and endoderm (medial), cut through.
    put(`ec${s}`, 'kanpoko-entzumen-hodia', region(`e-e${s}${k}`, poly(across(xe, EAR_W, (x) => s * re(x))), poly(across(xe, EAR_W, (x) => s * (re(x) + t))), 0.004, N), TISSUE.ecto, { groups: ['lehen-arraildura'] });
    put(`en${s}`, 'tinpano-kutxa', region(`e-n${s}${k}`, poly(across(-EAR_W, xn, (x) => s * rn(x))), poly(across(-EAR_W, xn, (x) => s * (rn(x) + t))), 0.004, N), TISSUE.endo, { groups: ['lehen-poltsa'] });
    // The canals' floors and roofs, going back into the slab.
    put(`ew${s}`, 'kanpoko-entzumen-hodia', depthWall(`e-ew${s}${k}`, poly(across(xe, EAR_W, (x) => s * re(x))), [0, -s, 0.2], EAR_D, N), TISSUE.ecto, { groups: ['lehen-arraildura'] });
    put(`nw${s}`, 'tinpano-kutxa', depthWall(`e-nw${s}${k}`, poly(across(-EAR_W, xn, (x) => s * rn(x))), [0, -s, 0.2], EAR_D, N), TISSUE.endo, { groups: ['lehen-poltsa'] });
    // The block's outer top and bottom.
    put(`rim${s}`, undefined, depthWall(`e-rim${s}`, poly([[-EAR_W, s * EAR_H], [EAR_W, s * EAR_H]]), [0, s, 0], EAR_D, 4), TISSUE.ground, { quiet: true, ground: true, tissue: 'mesenchyme' });
  }
  // The far wall of each cavity.
  put('backE', 'kanpoko-entzumen-hodia', region(`e-be${k}`, poly(across(xe, EAR_W, (x) => -re(x))), poly(across(xe, EAR_W, (x) => re(x))), -EAR_D, N), mixHex(TISSUE.ecto, TISSUE.ectoDeep, 0.45), { groups: ['lehen-arraildura'] });
  const tubeX = Math.max(xn - 1.25, -EAR_W);
  put('backT', 'tinpano-kutxa', region(`e-bt${k}`, poly(across(tubeX, xn, (x) => -rn(x))), poly(across(tubeX, xn, (x) => rn(x))), -EAR_D, N), mixHex(TISSUE.endo, TISSUE.endoDeep, 0.4), { groups: ['lehen-poltsa'] });
  if (tubeX > -EAR_W) put('backF', 'eustakioren-tronpa', region(`e-bf${k}`, poly(across(-EAR_W, tubeX, (x) => -rn(x))), poly(across(-EAR_W, tubeX, (x) => rn(x))), -EAR_D, N), mixHex(TISSUE.endo, TISSUE.endoDeep, 0.6), { groups: ['lehen-poltsa'] });

  // The border: three layers at the tips (they never open).
  const lay = (key: string, id: string, x0: number, x1: number, c: string) =>
    put(key, id, region(`e-${key}${k}`, poly([[x0, -tipR], [x0, tipR]]), poly([[x1, -tipR], [x1, tipR]]), 0.008, 8), c, { groups: ['tinpano-mintza'] });
  lay('m1', 'tinpano-kanpoko-epitelioa', xe, xe + t, TISSUE.ecto);
  lay('m2', 'tinpano-tarteko-geruza', xn, xe, TISSUE.mes);
  lay('m3', 'tinpano-barneko-epitelioa', xn - t, xn, TISSUE.endo);

  pts['lehen-arkua'] = [0.3, 1.7, 0.02];
  pts['bigarren-arkua'] = [0.3, -1.7, 0.02];
  const mx = (xe + EAR_W) / 2;
  pts['kanpoko-entzumen-hodia'] = [mx, 0, -EAR_D + 0.02];
  pts['lehen-arraildura'] = [mx, 0, -EAR_D + 0.02];
  pts['tinpano-kutxa'] = [xn - 0.6, 0, -EAR_D + 0.02];
  pts['lehen-poltsa'] = [xn - 0.6, 0, -EAR_D + 0.02];
  pts['eustakioren-tronpa'] = [Math.max(-EAR_W + 0.3, xn - 2.1), 0, -EAR_D + 0.02];
  pts['tinpano-mintza'] = [(xe + xn) / 2, tipR * 0.5, 0.02];
  pts['tinpano-kanpoko-epitelioa'] = [xe + t / 2, tipR * 0.45, 0.02];
  pts['tinpano-tarteko-geruza'] = [(xe + xn) / 2, 0, 0.02];
  pts['tinpano-barneko-epitelioa'] = [xn - t / 2, -tipR * 0.45, 0.02];
  return { items, pts };
}

// ———————————————————————————— The second arch over the clefts (topic 18) ————————————————————————————

export interface SinusPose {
  /** The second arch's mesenchyme grows down over the clefts to the epicardial ridge (0..1). */
  over: number;
  /** The covered clefts and the sinus go: a solid structure (0..1). */
  close: number;
  /** The rare case: part of the sinus stays, with fluid in it (0..1). */
  persist: number;
}
export const SP0: SinusPose = { over: 0, close: 0, persist: 0 };

const Y_TOP = 3.1;
const Y_BOT = -2.7;
const CL = [1.42, 0.2, -0.62, -1.3];
const FLAP_IN = 2.92;
const FLAP_W = 0.5;
const endoX = (y: number) => 0.55 + CL.reduce((a, c, i) => a + (i === 0 ? 0.95 : 0.85) * gauss(y, c, 0.16), 0);

export function sinusModel(pose: SinusPose, o: Dim = {}): PoseModel {
  const { items, pts, put } = kit(o.dim);
  const over = clamp01(pose.over);
  const close = clamp01(pose.close);
  const persist = clamp01(pose.persist);
  const k = `${q(over)}|${q(close)}|${q(persist)}`;
  const t = 0.09;
  const yt = lerp(0.14, -1.62, over);
  const closeAt = (y: number) => close * (1 - persist * gauss(y, -0.62, 0.46));
  const cyst = (y: number) => persist * 0.34 * gauss(y, -0.62, 0.48);
  const upper = (y: number) => 2.15 + 0.6 * gauss(y, 2.25, 0.5) + 0.62 * gauss(y, 0.82, 0.42) - 0.95 * gauss(y, 1.42, 0.13);
  const outerII = (y: number) => lerp(upper(y), Math.max(upper(y), FLAP_IN + FLAP_W), ss(0, 0.25, over) * (1 - ss(0.2, 0.95, y)));
  const coreOpen = (y: number) => 2.15 + 0.5 * gauss(y, -0.22, 0.26) + 0.42 * gauss(y, -0.96, 0.24) - 0.3 * gauss(y, 0.2, 0.1) - 0.45 * gauss(y, -0.62, 0.1) - 0.4 * gauss(y, -1.3, 0.09) + 1.2 * ss(1.3, 1.68, -y) * (1 - ss(2.1, 2.95, -y));
  const core = (y: number) => (y < -1.45 ? coreOpen(y) : lerp(coreOpen(y), FLAP_IN, closeAt(y)));
  const flapW = (y: number) => FLAP_W * lerp(Math.sqrt(clamp01((y - yt) / 0.3)), 1, ss(0.9, 1, over));
  const flapIn = () => FLAP_IN;
  const flapOut = (y: number) => FLAP_IN + flapW(y) + cyst(y);
  const span = (y0: number, y1: number, f: (y: number) => number): Line => (u) => {
    const y = lerp(y0, y1, u);
    return [f(y), y];
  };
  const tint = (c: string) => mixHex(TISSUE.mes, c, 0.5);
  const bandN = 64;

  const arch = (key: string, id: string, y0: number, y1: number, outer: (y: number) => number, c: string) =>
    put(key, id, region(`s-${key}${k}`, span(y0, y1, endoX), span(y0, y1, outer), 0, bandN), tint(c), { tissue: 'mesenchyme', groups: ['faringe-arkuak'] });
  arch('a1', 'lehen-arkua', Y_TOP, CL[0], (y) => upper(y) - t, ARCH.i);
  arch('a2', 'bigarren-arkua', CL[0], CL[1], (y) => outerII(y) - t, ARCH.ii);
  arch('a3', 'hirugarren-arkua', CL[1], CL[2], (y) => core(y) - 0.001, ARCH.iii);
  arch('a4', 'laugarren-arkua', CL[2], CL[3], (y) => core(y) - 0.001, ARCH.iv);
  put('ridge', 'goragune-epikardikoa', region(`s-r${k}`, span(CL[3], Y_BOT, endoX), span(CL[3], Y_BOT, core), 0, bandN), TISSUE.mes, { tissue: 'mesenchyme' });

  // The flap: arch II's own mesenchyme, one piece with the arch.
  if (over > 0.01) put('flap', 'bigarren-arkua', region(`s-f${k}`, span(CL[1] + 0.02, yt, flapIn), span(CL[1] + 0.02, yt, (y) => flapOut(y) - t * 0.8), 0, bandN), tint(ARCH.ii), { tissue: 'mesenchyme', groups: ['faringe-arkuak'] });

  // Ectoderm: the outer skin (blue line), the lining of the sinus while it lasts.
  const skin = (key: string, id: string, y0: number, y1: number, f: (y: number) => number, w = t) =>
    put(key, id, region(`s-${key}${k}`, span(y0, y1, (y) => f(y) - w), span(y0, y1, f), 0.004, bandN), TISSUE.ecto);
  skin('ek1', 'ektodermoa', Y_TOP, CL[0] - 0.02, upper);
  skin('ek2', 'ektodermoa', CL[0] + 0.02, CL[1], outerII);
  if (over > 0.01) skin('ek3', 'ektodermoa', CL[1], yt, flapOut, t * 0.8);
  put('ek4', 'faringe-arraildurak', region(`s-ek4${k}`, span(CL[1], CL[3], (y) => core(y) - t * (1 - closeAt(y))), span(CL[1], CL[3], core), 0.004, bandN), TISSUE.ecto, { groups: ['sinu-zerbikala'] });
  skin('ek5', 'ektodermoa', CL[3], Y_BOT, core);
  // The first cleft stays (the external meatus's beginning).
  const u1 = upper(1.42);
  put('cl1', 'lehen-arraildura', region('s-cl1', poly([[u1 - 0.02, 1.54], [u1 - 0.02, 1.3]]), poly([[u1 + 0.5, 1.62], [u1 + 0.5, 1.22]]), -0.9, 6), TISSUE.ectoDeep);

  // Endoderm: the pouches on the inside, face to face with the clefts.
  put('endo', 'faringe-poltsak', region('s-n', span(Y_TOP, Y_BOT, (y) => endoX(y) - t), span(Y_TOP, Y_BOT, endoX), 0.004, 120), TISSUE.endo);
  put('lumen', 'faringe-hestea', region('s-lu', span(Y_TOP, Y_BOT, () => -0.7), span(Y_TOP, Y_BOT, (y) => endoX(y) - t), -1.1, 80), mixHex(TISSUE.endo, TISSUE.endoDeep, 0.5));
  put('lumW', undefined, depthWall('s-lw', span(Y_TOP, Y_BOT, (y) => endoX(y) - t), [-1, 0, 0.3], 1.1, 100), TISSUE.endo, { quiet: true });

  // The cervical sinus: a real cavity, walled by the flap and the covered arches.
  const sinTop = CL[1] - 0.02;
  const sinBot = Math.max(yt, -1.62);
  if (over > 0.02) {
    put('sinB', 'sinu-zerbikala', region(`s-sb${k}`, span(sinTop, sinBot, core), span(sinTop, sinBot, flapIn), -1.1, bandN), mixHex(TISSUE.ectoDeep, '#10222f', 0.45), { groups: ['faringe-arraildurak'] });
    put('sinW', 'sinu-zerbikala', depthWall(`s-sw${k}`, span(sinTop, sinBot, flapIn), [-1, 0, 0.3], 1.1, bandN), TISSUE.ecto, { quiet: true });
    put('sinC', 'sinu-zerbikala', depthWall(`s-sc${k}`, span(sinTop, sinBot, core), [1, 0, 0.3], 1.1, bandN), TISSUE.ecto, { quiet: true });
  }
  if (persist > 0.02) put('fluid', 'sinu-zerbikala', region(`s-fl${k}`, span(-0.2, -1.05, (y) => core(y) + 0.01), span(-0.2, -1.05, () => FLAP_IN - 0.01), 0.006, 24), mixHex(TISSUE.mes, '#c2e6f3', persist));

  // The slab's rim: the skin going back, so the block reads as solid.
  put('rimU', undefined, depthWall('s-ru', span(Y_TOP, CL[1], upper), [1, 0, 0.2], 1.1, 80), TISSUE.ecto, { quiet: true });
  put('topW', undefined, depthWall('s-tw', poly([[-0.7, Y_TOP], [2.75, Y_TOP]]), [0, 1, 0], 1.1, 6), TISSUE.ground, { ground: true, quiet: true, tissue: 'mesenchyme' });

  pts['lehen-arkua'] = [1.4, 2.25, 0.02];
  pts['bigarren-arkua'] = [1.4, 0.82, 0.02];
  pts['hirugarren-arkua'] = [1.3, -0.22, 0.02];
  pts['laugarren-arkua'] = [1.3, -0.96, 0.02];
  pts['goragune-epikardikoa'] = [1.6, -2.0, 0.02];
  pts['lehen-arraildura'] = [u1 + 0.15, 1.42, -0.85];
  pts['faringe-arraildurak'] = over < 0.5 ? [core(-0.62) - t / 2, -0.62, 0.02] : [core(-1.3) - 0.04, -1.3, 0.02];
  pts['faringe-poltsak'] = [endoX(0.2) - 0.05, 0.2, 0.02];
  pts['ektodermoa'] = [upper(2.25) - t / 2, 2.25, 0.02];
  pts['sinu-zerbikala'] = persist > 0.5 ? [(core(-0.62) + FLAP_IN) / 2, -0.62, 0.03] : [(core(-0.5) + FLAP_IN) / 2, Math.min(-0.05, (sinTop + sinBot) / 2), -1.08];
  return { items, pts };
}
