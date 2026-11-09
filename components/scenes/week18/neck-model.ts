import { mix3, type V3 } from '@/lib/three-d/math';
import { curve3 } from '@/lib/three-d/mesh';
import { vessel, type Parts, type VesselOptions } from '@/lib/three-d/organic';
import type { Item3 } from '@/lib/three-d/scene';
import { blobParts, mixHex, tubeParts } from '@/components/scenes/week10/model3d';
import { ARCH, ARCH_DEEP, TISSUE } from '@/components/scenes/week17/common';

/**
 * Topic 18: the neck glands, one model for two stages (notes 1.2 "Nola jaisten dira egiturak?" and 3).
 * The pharynx with its 3rd and 4th pouches; the thymus (3rd pouch) grows down and towards the midline dragging the
 * inferior parathyroid (3rd pouch) past the superior parathyroid (4th pouch), which barely moves. A gland keeps its
 * pouch's colour for good, so the yellow gland ending BELOW the red one is the point of the stage.
 * Then the adult: two long thyroid lobes hugging the laryngeal cartilages, the isthmus in front, the four
 * parathyroids behind, the pyramidal lobe, the thymus below.
 *
 * Axes as every model of the topics: x towards the embryo's LEFT, y cranial, z ventral.
 */

export interface NeckPose {
  /** The thymus and the inferior parathyroid going down (0..1). */
  down: number;
  /** The superior parathyroid's short way (0..1). */
  sup: number;
  /** The adult: the pharynx's upper part and the pouches gone, the cartilages grown (0..1). */
  adult: number;
  /** The pyramidal lobe (0..1). */
  pyramid: number;
  /** The thymus shrinking after puberty (0..1). */
  involute: number;
}

export const NP0: NeckPose = { down: 0, sup: 0, adult: 0, pyramid: 0, involute: 0 };

export interface NeckOpts {
  dim?: { ids: readonly string[]; k: number } | null;
  /** Names on the embryo's right (the viewer's right when seen from behind). */
  back?: boolean;
}

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const ss = (a: number, b: number, x: number) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const darker = (c: string) => mixHex(c, '#000000', 0.55);
const L = (kps: readonly V3[], n = 24) => curve3(kps as V3[], n);
const X = (s: number, p: V3): V3 => [s * p[0], p[1], p[2]];
const at = (line: readonly V3[], u: number): V3 => {
  const x = clamp01(u) * (line.length - 1);
  const i = Math.min(line.length - 2, Math.floor(x));
  return mix3(line[i], line[i + 1], x - i);
};
const span = (line: readonly V3[], a: number, b: number, n = 24): V3[] => Array.from({ length: n }, (_, i) => at(line, lerp(a, b, i / (n - 1))));

const THYROID = '#b23c56';
const THYROID_DEEP = '#551626';
/** The thymus: the third pouch's colour, a little paler than the parathyroid it drags. */
const THYMUS = mixHex(ARCH.iii, '#ffffff', 0.18);

/** An arc round the airway, by the angle from the front (radians). */
const arc = (a0: number, a1: number, y: number, rx: number, rz: number, n = 28): V3[] =>
  Array.from({ length: n }, (_, i): V3 => {
    const a = lerp(a0, a1, i / (n - 1));
    return [rx * Math.sin(a), y, rz * Math.cos(a)];
  });

export function neckModel(pose: NeckPose, o: NeckOpts = {}) {
  const items: Item3[] = [];
  const pts: Record<string, V3> = {};
  const dim = o.dim;
  const named = o.back ? -1 : 1;
  const fade = (id: string, groups?: readonly string[]) => (!dim || dim.k <= 0.001 || dim.ids.includes(id) || (groups ?? []).some((g) => dim.ids.includes(g)) ? 1 : 1 - 0.75 * dim.k);
  const tube = (key: string, id: string | undefined, line: V3[], color: string, r: (u: number) => number, deep: string, extra: Partial<Item3> = {}, sides = 16) => {
    if (line.length < 2) return;
    items.push({ key, id, ...tubeParts(line, { radius: r, ref: [0, 0, 1], sides, capStart: true, capEnd: true }), color, deep, tissue: 'epithelium', opacity: id ? fade(id, extra.groups) : 1, ...extra });
  };
  const ball = (key: string, id: string, c: V3, r: number, color: string, deep: string, extra: Partial<Item3> = {}) =>
    items.push({ key, id, ...blobParts({ center: c, radii: [r, r * 1.1, r * 0.9], rings: 12, sides: 16 }), color, deep, tissue: 'epithelium', opacity: fade(id, extra.groups), ...extra });
  const put = (key: string, id: string, parts: Parts | null, color: string, deep: string, extra: Partial<Item3> = {}) => {
    if (parts) items.push({ key, id, ...parts, color, deep, tissue: 'epithelium', opacity: fade(id, extra.groups), ...extra });
  };
  const band = (line: V3[], o2: VesselOptions) => vessel(line, { sides: 14, n: 28, ...o2 }, 1);

  const adult = clamp01(pose.adult);
  const down = clamp01(pose.down);

  // ———— the airway (always) and the pharynx above it (goes in the adult) ————
  tube('airway', 'trakea', L([[0, 0.3, -0.02], [0, -1.5, 0], [0, -3.5, 0]], 20), TISSUE.endo, () => 0.3, TISSUE.endoDeep);
  pts['trakea'] = [named * 0.14, -2.0, o.back ? -0.26 : 0.26];
  const phK = 1 - ss(0, 0.8, adult);
  if (phK > 0.02) {
    tube('pharynx', 'faringea', L([[0, 2.85, -0.25], [0, 1.6, -0.25], [0, 0.65, -0.2], [0, -0.1, -0.05]], 24), TISSUE.endo, (u) => lerp(0.72, 0.31, ss(0, 1, u)) * lerp(0.4, 1, phK), TISSUE.endoDeep);
    pts['faringea'] = [named * 0.3, 2.3, -0.5];
  }
  // The pouches: stubs out of the pharynx that thin away once their glands have left.
  const pouchK = 1 - ss(0.15, 0.7, down);
  if (pouchK > 0.02)
    for (const s of [-1, 1]) {
      tube(`p3${s}`, 'hirugarren-poltsa', L([X(s, [0.5, 1.6, -0.25]), X(s, [1.0, 1.62, -0.22]), X(s, [1.42, 1.56, -0.12])], 12), TISSUE.endo, () => 0.2 * pouchK, TISSUE.endoDeep);
      tube(`p4${s}`, 'laugarren-poltsa', L([X(s, [0.36, 0.64, -0.2]), X(s, [0.8, 0.66, -0.2]), X(s, [1.08, 0.62, -0.18])], 12), TISSUE.endo, () => 0.16 * pouchK, TISSUE.endoDeep);
    }
  pts['hirugarren-poltsa'] = X(named, [0.95, 1.62, -0.3]);
  pts['laugarren-poltsa'] = X(named, [0.72, 0.66, -0.3]);

  // ———— the laryngeal cartilages and the tracheal rings (grown in the adult; open behind) ————
  if (adult > 0.02) {
    const g = ss(0, 1, adult);
    const open = 2.0;
    put('shield', 'laringeko-kartilagoak', band(arc(-open, open, 0.52, 0.62, 0.78), { r0: 0.66 * g, r1: 0.66 * g, flat: 0.84, ref: [Math.sin(-open), 0, Math.cos(-open)] }), TISSUE.cartilage, TISSUE.cartilageDeep);
    put('cricoid', 'laringeko-kartilagoak', band(arc(-Math.PI, Math.PI, -0.42, 0.56, 0.56, 40), { r0: 0.17 * g, r1: 0.17 * g, flat: 0.55, ref: [0, 0, -1] }), TISSUE.cartilage, TISSUE.cartilageDeep);
    for (let i = 0; i < 6; i++) {
      const a = 2.15;
      put(`ring${i}`, 'trakea', band(arc(-a, a, -0.86 - i * 0.44, 0.46, 0.46), { r0: 0.13 * g, r1: 0.13 * g, flat: 0.55, ref: [Math.sin(-a), 0, Math.cos(-a)], sides: 10 }), TISSUE.cartilage, TISSUE.cartilageDeep);
    }
    pts['laringeko-kartilagoak'] = [named * 0.3, 0.72, 0.72];
  }

  // ———— the thyroid: two long lobes, open behind, joined in front by the isthmus ————
  for (const s of [-1, 1]) {
    const lobe = L([X(s, [0.82, 0.68, -0.22]), X(s, [0.97, 0.12, -0.04]), X(s, [0.95, -0.62, 0.14]), X(s, [0.68, -1.36, 0.14])], 28);
    tube(`lobe${s}`, 'tiroide-lobuluak', lobe, THYROID, (u) => 0.06 + 0.22 * Math.sin(Math.PI * u) ** 0.65, THYROID_DEEP, { groups: ['tiroide-guruina'] }, 18);
  }
  pts['tiroide-lobuluak'] = X(named, [1.05, -0.3, 0.2]);
  pts['tiroide-guruina'] = X(named, [1.05, -0.3, 0.2]);
  tube('isthmus', 'tiroide-istmoa', L([X(-1, [0.78, -0.92, 0.32]), [0, -0.86, 0.68], X(1, [0.78, -0.92, 0.32])], 20), THYROID, () => 0.17, THYROID_DEEP, { groups: ['tiroide-guruina'] });
  pts['tiroide-istmoa'] = [0.2, -0.86, 0.82];

  // ———— the pyramidal lobe: a finger up from the isthmus, on the embryo's left ————
  const py = clamp01(pose.pyramid);
  if (py > 0.01) {
    const line = span(L([[0.22, -0.82, 0.72], [0.24, -0.25, 0.92], [0.17, 0.5, 1.02]], 24), 0, py, 18);
    tube('pyramid', 'piramide-lobulua', line, THYROID, (u) => lerp(0.15, 0.06, u), THYROID_DEEP, { groups: ['tiroide-guruina'] });
    pts['piramide-lobulua'] = at(line, 0.6);
  }

  // ———— the thymus: down and towards the midline, its tail lost once it has arrived ————
  const inv = clamp01(pose.involute);
  const tail = ss(0.5, 1, down) * 0.66;
  const head = lerp(0.13 + 0.87 * ss(0, 0.92, down), 0.84, inv);
  const big = lerp(0.3, 0.44, down) * (1 - 0.62 * inv);
  for (const s of [-1, 1]) {
    const path = L([X(s, [1.52, 1.62, 0.02]), X(s, [1.58, 0.6, 0.42]), X(s, [1.32, -0.8, 0.5]), X(s, [0.78, -2.0, 0.58]), X(s, [0.47, -3.3, 0.6])], 64);
    const line = span(path, tail, Math.max(tail + 0.06, head), 28);
    tube(`thymus${s}`, 'timoa', line, THYMUS, (v) => big * (0.26 + 0.74 * ss(0.05, 0.72, v)) * Math.sin(Math.PI * (0.04 + 0.92 * v)) ** 0.5, ARCH_DEEP.iii, {}, 18);
    if (s === named) pts['timoa'] = at(line, 0.68);
  }

  // ———— the parathyroids: the inferior one rides with the thymus past the superior one ————
  const infK = ss(0.06, 0.66, down);
  const supK = clamp01(pose.sup);
  for (const s of [-1, 1]) {
    const inf = at(L([X(s, [1.34, 1.6, -0.26]), X(s, [1.46, 0.55, -0.1]), X(s, [1.24, -0.5, -0.1]), X(s, [0.88, -1.08, -0.2])], 40), infK);
    const sup = at(L([X(s, [1.08, 0.64, -0.3]), X(s, [0.98, 0.5, -0.42]), X(s, [0.86, 0.3, -0.48])], 16), supK);
    ball(`inf${s}`, 'beheko-paratiroidea', inf, 0.17, ARCH.iii, darker(ARCH.iii));
    ball(`sup${s}`, 'goiko-paratiroidea', sup, 0.16, ARCH.iv, darker(ARCH.iv));
    // Named on the side the labels live on (always seen from behind).
    if (s === -1) {
      pts['beheko-paratiroidea'] = [inf[0], inf[1], inf[2] - 0.1];
      pts['goiko-paratiroidea'] = [sup[0], sup[1], sup[2] - 0.1];
    }
  }
  return { items, pts };
}
