import type { V3 } from '@/lib/three-d/math';
import { cachedMesh } from '@/lib/three-d/mesh-cache';
import type { Parts } from '@/lib/three-d/organic';
import { capsule, deformBy, ellipsoid, partition, smin, surfaceMesh, type SDF } from '@/lib/three-d/sdf';
import type { Item3 } from '@/lib/three-d/scene';
import { blobParts, mixHex } from '@/components/scenes/week10/model3d';
import { TISSUE } from '@/components/scenes/week17/common';
import { LARYNX_DIM, LARYNX_SDF, larynxSkeleton } from '@/components/scenes/week17/larynx-model';
import { POUCH } from './pharynx-model';

/**
 * Topic 18, notes 3 (w18/3/p10–p12): the grown neck. The thyroid gland is one sculpted surface: two long lobes,
 * pointed above and full below, whose inner faces are carved round the larynx's cartilages and the trachea they
 * "hug", joined in front by the isthmus over the upper tracheal rings; behind, the lobes are not joined and the four
 * parathyroids sit on their backs (figure 18-12, front and back views). The pyramidal lobe grows up from the isthmus
 * on the left; the thymus lies below the thyroid, in front of the trachea, large, then shrinking.
 *
 * The cartilages are topic 17's laryngeal skeleton (larynx-model.ts), so the student meets the same larynx, in its
 * frame and units. The colours are those of the glands' descent on the pharynx (pharynx-model.ts): the thyroid
 * salmon, the third pouch's glands violet, the fourth pouch's teal, cartilage pale.
 *
 * Axes as every model of the topics: x towards the embryo's LEFT, y cranial, z ventral.
 */

export interface NeckPose {
  /** Kept for the stage's pose shape (the descent itself is told on the root pharynx): unused. */
  down: number;
  sup: number;
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

/** The middle of the two lobes (the site's landmark: `NECK_LOBES` in sites-b.ts). */
export const LOBES_MID: V3 = [0, -0.85, 0.3];

export const NECK_COLOR = {
  thyroid: '#d98068',
  thyroidDeep: '#70301f',
  inferior: mixHex(POUCH.p3, '#ffffff', 0.32),
  superior: mixHex(POUCH.p4, '#ffffff', 0.2),
  thymus: POUCH.p3,
} as const;

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smax = (a: number, b: number, k: number) => -smin(-a, -b, k);
const { CR_C, TR_TOP } = LARYNX_DIM;

// ———————————————————————— the gland ————————————————————————

/** One lobe (left; the right is its mirror): a pear along a slightly curved axis, pointed above, full below. */
const LOBE_TOP: V3 = [1.04, 0.78, 0.4];
const LOBE_MID: V3 = [1.2, -0.7, 0.33];
const LOBE_LOW: V3 = [1.16, -1.75, 0.36];
const lobeA = capsule(LOBE_MID, LOBE_TOP, 0.46, 0.09);
const lobeB = ellipsoid(LOBE_LOW, [0.47, 0.66, 0.54]);
const lobeC = ellipsoid(LOBE_MID, [0.45, 0.8, 0.5]);
const isthmus = ellipsoid([0, -2.28, 0.98], [1.02, 0.3, 0.19]);
/** What the gland lies against: the thyroid cartilage, the cricoid, the trachea with its rings. */
const cartilage: SDF = (x, y, z) => {
  let d = Math.min(LARYNX_SDF.thyroid(x, y, z), LARYNX_SDF.cricoid(x, y, z));
  if (y < TR_TOP + 0.1) d = Math.min(d, LARYNX_SDF.airway(x, z) - 0.09);
  return d;
};
const glandF: SDF = (x, y, z) => {
  const ax = Math.abs(x);
  const lobe = smin(smin(lobeA(ax, y, z), lobeC(ax, y, z), 0.3), lobeB(ax, y, z), 0.32);
  const d = smin(lobe, isthmus(x, y, z), 0.32);
  // Carving only matters near the surface: far from it the plain distance is good enough (and much cheaper).
  if (d > 0.25) return d;
  return smax(d, -(cartilage(x, y, z) - 0.05), 0.1);
};
const BOX_LO: V3 = [-1.85, -2.62, -0.36];
const BOX_HI: V3 = [1.85, 1.0, 1.32];
/** The gland, split in lobes and isthmus (one surface: they share their border). */
const GLAND = () => {
  const whole = cachedMesh('neck18-gland', [0.035], () => surfaceMesh(glandF, BOX_LO, BOX_HI, 0.035));
  const hit = cachedMesh('neck18-gland-h', [0.09], () => surfaceMesh(glandF, BOX_LO, BOX_HI, 0.09));
  const isthmusSide = (c: V3) => Math.abs(c[0]) < 0.6 && c[1] < -1.9;
  const [isth, lob] = splitCache(whole, isthmusSide);
  const [hIsth, hLob] = splitCache(hit, isthmusSide, 'h');
  return { lobes: { mesh: lob, hit: hLob } as Parts, isthmus: { mesh: isth, hit: hIsth } as Parts };
};
const splits = new Map<string, ReturnType<typeof partition>>();
const splitCache = (m: Parameters<typeof partition>[0], side: (c: V3) => boolean, tag = '') => {
  const key = `${tag}:${m.idx.length}`;
  let s = splits.get(key);
  if (!s) splits.set(key, (s = partition(m, side)));
  return s;
};

/** The pyramidal lobe: a tapering finger from the isthmus up the front of the larynx, on the embryo's left. */
const PY_BASE: V3 = [0.26, -2.12, 1.1];
const pyramidF = capsule(PY_BASE, [0.36, 0.35, 1.24], 0.24, 0.1);
const PYRAMID = (): Parts => ({
  mesh: cachedMesh('neck18-pyr', [0.03], () => surfaceMesh(pyramidF, [-0.06, -2.45, 0.8], [0.68, 0.52, 1.5], 0.03)),
  hit: cachedMesh('neck18-pyr-h', [0.08], () => surfaceMesh(pyramidF, [-0.06, -2.45, 0.8], [0.68, 0.52, 1.5], 0.08)),
});

/** The thymus: two lobes side by side below the thyroid, in front of the trachea, lobulated. */
const thymusF: SDF = (() => {
  const parts = [
    ellipsoid([0.44, -4.35, 1.14], [0.5, 1.35, 0.3]),
    ellipsoid([-0.4, -4.5, 1.12], [0.52, 1.45, 0.3]),
    ellipsoid([0.5, -3.45, 1.12], [0.32, 0.45, 0.24]),
    ellipsoid([-0.46, -3.55, 1.1], [0.33, 0.48, 0.24]),
    ellipsoid([0.62, -5.2, 1.12], [0.36, 0.52, 0.26]),
    ellipsoid([-0.58, -5.4, 1.1], [0.38, 0.55, 0.26]),
  ];
  return (x, y, z) => {
    let d = parts[0](x, y, z);
    for (let i = 1; i < parts.length; i++) d = smin(d, parts[i](x, y, z), 0.18);
    return d;
  };
})();
const THYMUS = (): Parts => ({
  mesh: cachedMesh('neck18-thymus', [0.045], () => surfaceMesh(thymusF, [-1.1, -6.1, 0.72], [1.1, -2.9, 1.5], 0.045)),
  hit: cachedMesh('neck18-thymus-h', [0.1], () => surfaceMesh(thymusF, [-1.1, -6.1, 0.72], [1.1, -2.9, 1.5], 0.1)),
});
const THYMUS_TOP: V3 = [0, -3.2, 1.12];

/** A part scaled about `c` by k (growth, shrinking). */
const scaled = (p: Parts, c: V3, k: number, slot: string): Parts => {
  if (k > 0.999) return p;
  const f = (q: V3): V3 => [c[0] + (q[0] - c[0]) * k, c[1] + (q[1] - c[1]) * k, c[2] + (q[2] - c[2]) * k];
  return { mesh: deformBy(p.mesh, [k], f, slot), hit: deformBy(p.hit ?? p.mesh, [k], f, slot + 'h') };
};

/** The parathyroids on the lobes' backs: superior (4th pouch) high, inferior (3rd pouch) low. */
const PARA_SUP: V3 = [1.34, -0.78, -0.18];
const PARA_INF: V3 = [1.16, -1.82, -0.17];

export function neckModel(pose: NeckPose, o: NeckOpts = {}) {
  const items: Item3[] = [];
  const pts: Record<string, V3> = {};
  const dim = o.dim && o.dim.k > 0.001 ? o.dim : null;
  const k = dim ? dim.k : 0;
  const lit = (id: string, groups?: readonly string[]) => !dim || dim.ids.includes(id) || (groups ?? []).some((g) => dim.ids.includes(g));
  /** An unlit part steps back by losing colour towards a pale grey, never by going dark or see-through. */
  const put = (key: string, id: string | undefined, parts: Parts | null, color: string, deep: string, extra: Partial<Item3> = {}) => {
    if (!parts) return;
    const off = !!dim && !!id && !lit(id, extra.groups);
    items.push({
      key,
      id,
      ...parts,
      color: off ? mixHex(color, '#c4bcbb', 0.5 * k) : color,
      deep: off ? mixHex(deep, '#8a8081', 0.5 * k) : deep,
      tissue: 'epithelium',
      calm: true,
      ...extra,
    });
  };

  // ———— the larynx and the trachea (topic 17's skeleton) ————
  const sk = larynxSkeleton();
  const cartTone = { tissue: 'cartilage' as const };
  put('hyoid', 'hioide-hezurra', sk.hyoid, TISSUE.bone, TISSUE.boneDeep, { tissue: 'bone', quiet: true });
  put('thy-cart', 'laringeko-kartilagoak', sk.thyroid, TISSUE.cartilage, TISSUE.cartilageDeep, { ...cartTone, groups: ['tiroide-kartilagoa'] });
  put('cricoid', 'laringeko-kartilagoak', sk.cricoid, TISSUE.cartilage, TISSUE.cartilageDeep, { ...cartTone, groups: ['krikoide-kartilagoa'] });
  put('trachea', 'trakea', sk.trachea, mixHex(TISSUE.ground, '#e3a898', 0.35), mixHex(TISSUE.groundDeep, '#7a4a40', 0.35), { tissue: 'membrane' });
  put('tr-rings', 'trakea', sk.rings, mixHex(TISSUE.cartilage, '#ffffff', 0.2), TISSUE.cartilageDeep, cartTone);
  pts['laringeko-kartilagoak'] = [0.42, 0.55, 0.86];
  pts['hioide-hezurra'] = [0.45, 2.74, 1.1];
  pts['trakea'] = [0.3, -3.3, CR_C + 0.9];

  // ———— the thyroid gland ————
  const g = GLAND();
  put('lobes', 'tiroide-lobuluak', g.lobes, NECK_COLOR.thyroid, NECK_COLOR.thyroidDeep, { groups: ['tiroide-guruina'], tissue: 'mesenchyme' });
  put('isthmus', 'tiroide-istmoa', g.isthmus, NECK_COLOR.thyroid, NECK_COLOR.thyroidDeep, { groups: ['tiroide-guruina'], tissue: 'mesenchyme' });
  const side = o.back ? -1 : 1;
  pts['tiroide-lobuluak'] = [side * 1.5, -0.85, 0.12];
  pts['tiroide-guruina'] = pts['tiroide-lobuluak'];
  pts['tiroide-istmoa'] = [0.18, -2.3, 1.12];

  // ———— the pyramidal lobe ————
  const py = clamp01(pose.pyramid);
  if (py > 0.01) {
    put('pyramid', 'piramide-lobulua', scaled(PYRAMID(), PY_BASE, 0.15 + 0.85 * py, 'pyr'), NECK_COLOR.thyroid, NECK_COLOR.thyroidDeep, { groups: ['tiroide-guruina'], tissue: 'mesenchyme' });
    pts['piramide-lobulua'] = [0.3 + 0.04 * py, -2.12 + 1.6 * py, 1.2];
  }

  // ———— the thymus: large, then shrinking towards its top ————
  const inv = clamp01(pose.involute);
  put('thymus', 'timoa', scaled(THYMUS(), THYMUS_TOP, 1 - 0.62 * inv, 'thymus'), NECK_COLOR.thymus, POUCH.p3Deep, { tissue: 'mesenchyme' });
  pts['timoa'] = [0.5, -4.1 + 0.9 * inv * 0.62, 1.4 - 0.1 * inv];

  // ———— the parathyroids, behind ————
  for (const s of [1, -1]) {
    const sup: V3 = [s * PARA_SUP[0], PARA_SUP[1], PARA_SUP[2]];
    const inf: V3 = [s * PARA_INF[0], PARA_INF[1], PARA_INF[2]];
    put(`sup${s}`, 'goiko-paratiroidea', blobParts({ center: sup, radii: [0.15, 0.19, 0.12], rings: 12, sides: 16 }), NECK_COLOR.superior, POUCH.p4Deep);
    put(`inf${s}`, 'beheko-paratiroidea', blobParts({ center: inf, radii: [0.15, 0.19, 0.12], rings: 12, sides: 16 }), NECK_COLOR.inferior, POUCH.p3Deep);
    // Named on the embryo's right: the viewer's right when the neck is seen from behind.
    if (s === -1) {
      pts['goiko-paratiroidea'] = [sup[0], sup[1], sup[2] - 0.1];
      pts['beheko-paratiroidea'] = [inf[0], inf[1], inf[2] - 0.1];
    }
  }
  return { items, pts };
}
