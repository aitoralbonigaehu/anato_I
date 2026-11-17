import { grid, curve3, type Mesh } from '@/lib/three-d/mesh';
import type { V3 } from '@/lib/three-d/math';
import { vessel, type Parts } from '@/lib/three-d/organic';
import type { Item3 } from '@/lib/three-d/scene';
import { blobParts, mixHex } from '@/components/scenes/week10/model3d';
import { ARCH, TISSUE, type PoseModel } from '@/components/scenes/week17/common';

/**
 * `archVModel` (topic 17; axes as every model: x the embryo's LEFT, y cranial, z ventral): the pharynx seen from behind
 * with its roof taken away (the notes' "V", 17 p.3): a yellow trough of endoderm, the arches as solid bars cut across
 * at the roof, each cut face showing its layers and contents. (Topic 18's first cleft and cervical sinus, once flat
 * slabs here, now run on the root pharynx: pharynx-d.ts.)
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
