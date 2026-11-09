import { add, type V3 } from '@/lib/three-d/math';
import { curve3 } from '@/lib/three-d/mesh';
import { plate, vessel, type Parts, type VesselOptions } from '@/lib/three-d/organic';
import type { Item3 } from '@/lib/three-d/scene';
import { blobParts, mixHex } from '@/components/scenes/week10/model3d';
import { ARCH, ARCH_DEEP, TISSUE } from './common';

/**
 * Topic 17, 2.6.2 and 2.6.3: one larynx, in the arches' colours (IV red, VI green). The thyroid's two laminae open
 * backwards (upper part IV, lower part VI), the cricoid signet ring, the epiglottis, the paired arytenoids,
 * corniculates and cuneiforms; the pharynx behind it with its constrictors (III yellow, IV red), the intrinsic
 * muscles (VI green) and the vagus's two branches.
 *
 * Axes: x towards the LEFT, y cranial, z ventral.
 */

export interface LarynxPose {
  /** The small paired cartilages grown (0..1). */
  ary: number;
  corn: number;
  /** Thyroid's upper and lower parts drawn apart: the division (0..1). */
  split: number;
  /** Pharynx grown (0..1). */
  pharynx: number;
  /** Constrictors grown along their fibres (0..1). */
  mid: number;
  sup: number;
  /** Pharynx away and the right constrictors drawn back, to see inside (0..1). */
  open: number;
  /** Intrinsic muscles grown (0..1). */
  intr: number;
  /** Vagus and its branches grown (0..1). */
  nerve: number;
}

export const LX0: LarynxPose = { ary: 0, corn: 0, split: 0, pharynx: 0, mid: 0, sup: 0, open: 0, intr: 0, nerve: 0 };

export interface LarynxOpts {
  dim?: { ids: readonly string[]; k: number } | null;
}

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const L = (kps: readonly V3[], n = 24) => curve3(kps as V3[], n);
const X = (s: number, p: V3): V3 => [s * p[0], p[1], p[2]];
const darker = (c: string) => mixHex(c, '#000000', 0.5);

const A = 0.714;
const B = 0.686;
/** Point `t` back along a thyroid lamina at height `y` (side `s`). */
const LAM = (s: number, t: number, y: number): V3 => [s * A * t, y, 1.0 - B * t];

type P2 = readonly [number, number];
const UPPER: readonly P2[] = [[0, 0.4], [0.6, 0.4], [1.2, 0.4], [1.72, 0.4], [1.74, 1.0], [1.74, 1.62], [1.2, 1.66], [0.45, 1.7], [0.14, 1.42], [0, 1.3], [0, 0.85]];
const LOWER: readonly P2[] = [[0, -0.35], [0.6, -0.55], [1.3, -0.45], [1.72, -0.3], [1.74, 0.05], [1.74, 0.4], [1.2, 0.4], [0.6, 0.4], [0, 0.4], [0, 0]];

/** One lamina as a solid plate; both sides right-handed, so the outer face is the front face on each. */
function lamina(key: string, s: number, out: readonly P2[], dy: number): Parts {
  const shift = (o: P2): [number, number] => [s > 0 ? o[0] - B : B - o[0], o[1] + dy];
  const outline = s > 0 ? out.map(shift) : [...out].reverse().map(shift);
  const frame = s > 0 ? { u: [A, 0, -B] as V3, v: [0, 1, 0] as V3, w: [B, 0, A] as V3 } : { u: [A, 0, B] as V3, v: [0, 1, 0] as V3, w: [-B, 0, A] as V3 };
  return plate(`larynx17-${key}-${s}-${dy.toFixed(3)}`, outline, A - 0.07, A + 0.07, frame);
}

/** The ring's centreline (the cricoid), higher behind. */
const RING = Array.from({ length: 41 }, (_, i): V3 => {
  const a = (i / 40) * Math.PI * 2;
  const back = 0.5 - 0.5 * Math.cos(a);
  return [1.16 * Math.sin(a), -1.55 + 0.42 * back, -0.05 + 1.1 * Math.cos(a)];
});

export function larynxModel(pose: LarynxPose, o: LarynxOpts = {}) {
  const items: Item3[] = [];
  const pts: Record<string, V3> = {};
  const dim = o.dim;
  const fade = (id: string | undefined, groups?: readonly string[]) => (!id || !dim || dim.k <= 0.001 || dim.ids.includes(id) || (groups ?? []).some((g) => dim.ids.includes(g)) ? 1 : 1 - 0.75 * dim.k);
  const put = (key: string, id: string | undefined, parts: Parts | null, color: string, deep: string, op = 1, extra: Partial<Item3> = {}) => {
    if (!parts || op <= 0.01) return;
    items.push({ key, id, ...parts, color, deep, tissue: 'tendon', opacity: op * fade(id, extra.groups), ...extra });
  };
  const ball = (key: string, id: string, c: V3, r: V3, color: string, deep: string, k: number, extra: Partial<Item3> = {}) => {
    if (k <= 0.01) return;
    put(key, id, blobParts({ center: c, radii: [r[0] * k, r[1] * k, r[2] * k], rings: 14, sides: 18 }), color, deep, 1, extra);
  };
  const vess = (key: string, id: string | undefined, line: V3[], color: string, deep: string, prof: VesselOptions, g = 1, extra: Partial<Item3> = {}) => {
    if (g <= 0.01) return;
    put(key, id, vessel(line, { ref: [0, 0, 1], sides: 12, ...prof }, g), color, deep, 1, extra);
  };

  const split = clamp01(pose.split);
  const open = clamp01(pose.open);

  // ———— the hyoid above (context: II and III) ————
  vess('hyoid', 'hioide-hezurra', L([[-1.32, 2.72, -0.65], [-1.15, 2.72, 0.35], [-0.5, 2.72, 1.0], [0, 2.72, 1.1], [0.5, 2.72, 1.0], [1.15, 2.72, 0.35], [1.32, 2.72, -0.65]], 36), TISSUE.bone, TISSUE.boneDeep, { r0: 0.13, r1: 0.13, sides: 14, n: 36 }, 1, { quiet: true });
  pts['hioide-hezurra'] = [0.5, 2.74, 1.1];

  // ———— the thyroid: two laminae, each an upper (IV) and a lower (VI) part ————
  const up = 0.26 * split;
  const dn = -0.26 * split;
  for (const s of [-1, 1]) {
    put(`thy-up${s}`, 'tiroide-goiko-atala', lamina('up', s, UPPER, up), ARCH.iv, ARCH_DEEP.iv, 1, { groups: ['tiroide-kartilagoa'] });
    put(`thy-lo${s}`, 'tiroide-beheko-atala', lamina('lo', s, LOWER, dn), ARCH.vi, ARCH_DEEP.vi, 1, { groups: ['tiroide-kartilagoa'] });
    vess(`thy-hsup${s}`, 'tiroide-goiko-atala', [LAM(s, 1.68, 1.5 + up), LAM(s, 1.74, 1.95 + up), LAM(s, 1.82, 2.4 + up)], ARCH.iv, ARCH_DEEP.iv, { r0: 0.1, r1: 0.075, n: 12 }, 1, { groups: ['tiroide-kartilagoa'] });
    vess(`thy-hinf${s}`, 'tiroide-beheko-atala', [LAM(s, 1.66, -0.15 + dn), LAM(s, 1.7, -0.55 + dn), LAM(s, 1.72, -0.98 + dn)], ARCH.vi, ARCH_DEEP.vi, { r0: 0.1, r1: 0.08, n: 12 }, 1, { groups: ['tiroide-kartilagoa'] });
  }
  pts['tiroide-kartilagoa'] = LAM(1, 0.75, 0.45);
  pts['tiroide-goiko-atala'] = add(LAM(1, 0.85, 1.05 + up), [0.06, 0, 0.06]);
  pts['tiroide-beheko-atala'] = add(LAM(1, 0.85, 0.0 + dn), [0.06, 0, 0.06]);

  // ———— the cricoid: a ring, its signet plate behind ————
  vess('cri-ring', 'krikoide-kartilagoa', RING, ARCH.vi, ARCH_DEEP.vi, { r0: 0.2, r1: 0.2, n: 40, sides: 14, capStart: false, capEnd: false });
  const lam: [number, number][] = Array.from({ length: 28 }, (_, i) => {
    const a = (i / 28) * Math.PI * 2;
    const c = Math.cos(a), sn = Math.sin(a);
    return [0.66 * Math.sign(c) * Math.abs(c) ** 0.6, -1.13 + 0.56 * Math.sign(sn) * Math.abs(sn) ** 0.6];
  });
  put('cri-lam', 'krikoide-kartilagoa', plate('larynx17-cricoid-lamina', lam, -1.3, -1.03), ARCH.vi, ARCH_DEEP.vi);
  pts['krikoide-kartilagoa'] = [0.86, -1.42, 0.72];

  // ———— the epiglottis: a leaf with a stalk to the thyroid's angle (an L from the side) ————
  put('epi-leaf', 'epiglotisa', blobParts({ center: [0, 2.15, 0.12], radii: [0.6, 1.05, 0.08], rings: 18, sides: 26 }), ARCH.vi, ARCH_DEEP.vi);
  vess('epi-stalk', 'epiglotisa', L([[0, 1.25, 0.15], [0, 1.08, 0.42], [0, 1.1, 0.88]], 12), ARCH.vi, ARCH_DEEP.vi, { r0: 0.13, r1: 0.1, n: 12 });
  pts['epiglotisa'] = [0.26, 2.6, 0.16];

  // ———— the paired small cartilages on the cricoid's plate ————
  const ary = clamp01(pose.ary);
  const corn = clamp01(pose.corn);
  for (const s of [-1, 1]) {
    ball(`ary${s}`, 'aritenoide-kartilagoa', X(s, [0.34, -0.3, -1.16]), [0.21, 0.34, 0.2], ARCH.vi, ARCH_DEEP.vi, ary);
    ball(`cor${s}`, 'kartilago-kornikulatua', X(s, [0.3, 0.12, -1.16]), [0.1, 0.13, 0.1], ARCH.vi, ARCH_DEEP.vi, corn);
    ball(`cun${s}`, 'kartilago-kuneiformea', X(s, [0.55, 0.55, -0.92]), [0.09, 0.22, 0.09], ARCH.vi, ARCH_DEEP.vi, corn);
  }
  pts['aritenoide-kartilagoa'] = [0.36, -0.34, -1.34];
  pts['kartilago-kornikulatua'] = [0.3, 0.13, -1.25];
  pts['kartilago-kuneiformea'] = [0.56, 0.56, -1.0];

  // ———— the trachea below: foregut, not arches ————
  vess('trachea', 'trakea', L([[0, -1.55, -0.05], [0, -3.0, -0.05], [0, -4.6, -0.05]], 16), TISSUE.ground, TISSUE.groundDeep, { r0: 0.86, r1: 0.86, sides: 28, n: 16 }, 1, { quiet: true });
  for (let k = 0; k < 7; k++) {
    const y = -2.1 - k * 0.42;
    const line = Array.from({ length: 33 }, (_, i): V3 => {
      const a = (i / 32) * Math.PI * 2;
      return [0.9 * Math.sin(a), y, -0.05 + 0.9 * Math.cos(a)];
    });
    vess(`tr-r${k}`, 'trakea', line, mixHex(TISSUE.ground, '#ffffff', 0.25), TISSUE.groundDeep, { r0: 0.085, r1: 0.085, n: 32, capStart: false, capEnd: false, sides: 8 }, 1, { quiet: true });
  }
  pts['trakea'] = [0.6, -3.2, 0.72];

  // ———— the pharynx behind ————
  const ph = clamp01(pose.pharynx) * (1 - clamp01(open));
  vess('pharynx', 'faringea', L([[0, 5.3, -2.35], [0, 3, -2.35], [0, 0.5, -2.35], [0, -2.1, -2.3]], 18), TISSUE.endo, TISSUE.endoDeep, { r0: 1.05, r1: 0.92, n: 18, sides: 30 }, ph, { quiet: true });
  if (ph > 0.3) pts['faringea'] = [-1.0, 2.0, -2.9];

  // ———— the constrictors: fans of fibres from the larynx round the pharynx to the back's midline ————
  const fibres = (key: string, id: string, n: number, y0: [number, number], y1: [number, number], from: (i: number, s: number) => V3, color: string, deep: string, g0: number) => {
    for (const s of [-1, 1]) {
      const g = clamp01(g0) * (s < 0 ? 1 - open : 1);
      for (let i = 0; i < n; i++) {
        const u = n > 1 ? i / (n - 1) : 0.5;
        const y = y0[0] + (y0[1] - y0[0]) * u;
        const yb = y1[0] + (y1[1] - y1[0]) * u;
        const line = L([from(u, s), X(s, [1.32, y + (yb - y) * 0.3, -1.9]), X(s, [1.08, y + (yb - y) * 0.7, -3.0]), [0, yb, -3.62]], 18);
        vess(`${key}${s}-${i}`, id, line, color, deep, { r0: 0.12, r1: 0.14, n: 18, sides: 8 }, g, { tissue: 'muscle' });
      }
    }
  };
  fibres('sup', 'goiko-ertzatzailea', 5, [3.55, 5.0], [4.0, 5.2], (u, s) => X(s, [1.3, 3.5 + 1.5 * u, -1.5]), ARCH.iii, ARCH_DEEP.iii, pose.sup);
  fibres('mid', 'tarteko-ertzatzailea', 5, [2.72, 2.72], [1.9, 3.75], (u, s) => X(s, [1.32 + 0.02 * u, 2.72, -0.65 - 0.1 * u]), ARCH.iv, ARCH_DEEP.iv, pose.mid);
  fibres('inf', 'beheko-ertzatzailea', 7, [-1.25, 1.45], [-1.45, 1.75], (u, s) => (u < 0.2 ? X(s, [1.14, -1.25, -0.55]) : LAM(s, 1.5, -1.0 + 2.6 * u)), ARCH.iv, ARCH_DEEP.iv, pose.mid);
  if (pose.sup > 0.3) pts['goiko-ertzatzailea'] = [1.05, 4.5, -3.05];
  if (pose.mid > 0.3) {
    pts['tarteko-ertzatzailea'] = [1.05, 2.5, -3.05];
    pts['beheko-ertzatzailea'] = [1.05, 0.2, -3.05];
  }

  // ———— the intrinsic muscles (all VI, one name as in the notes) ————
  const intr = clamp01(pose.intr);
  if (intr > 0.01)
    for (const s of [-1, 1]) {
      const g = intr;
      // From the cricoid's plate up to the arytenoid; round to the side; from the thyroid's angle back to the arytenoid.
      for (let i = 0; i < 4; i++) {
        const dx = i * 0.12;
        vess(`int-pca${s}${i}`, 'laringe-barneko-muskuluak', L([X(s, [0.1 + dx, -1.55, -1.36]), X(s, [0.22 + dx * 0.7, -1.05, -1.4]), X(s, [0.36 + dx * 0.2, -0.56, -1.3])], 12), ARCH.vi, ARCH_DEEP.vi, { r0: 0.075, r1: 0.05, n: 12, sides: 8 }, g, { tissue: 'muscle' });
      }
      vess(`int-lca${s}`, 'laringe-barneko-muskuluak', L([X(s, [1.05, -1.2, -0.45]), X(s, [0.85, -0.85, -0.7]), X(s, [0.5, -0.42, -1.05])], 12), ARCH.vi, ARCH_DEEP.vi, { r0: 0.1, r1: 0.06, n: 12, sides: 8 }, g, { tissue: 'muscle' });
      vess(`int-ta${s}`, 'laringe-barneko-muskuluak', L([X(s, [0.05, 0.2, 0.86]), X(s, [0.22, 0.05, 0]), X(s, [0.32, -0.15, -1.0])], 16), ARCH.vi, ARCH_DEEP.vi, { r0: 0.09, r1: 0.07, n: 16, sides: 8 }, g, { tissue: 'muscle' });
    }
  if (intr > 0.01)
    vess('int-ia', 'laringe-barneko-muskuluak', L([[-0.42, -0.34, -1.36], [0, -0.3, -1.42], [0.42, -0.34, -1.36]], 12), ARCH.vi, ARCH_DEEP.vi, { r0: 0.1, r1: 0.1, n: 12, sides: 8 }, intr, { tissue: 'muscle' });
  if (intr > 0.3) pts['laringe-barneko-muskuluak'] = [-0.45, -1.05, -1.44];

  // ———— the vagus and its two branches (a left one: the side the camera sees) ————
  const nv = clamp01(pose.nerve);
  if (nv > 0.01) {
    const light = (c: string) => mixHex(c, '#ffffff', 0.25);
    vess('vagus', 'bagoa', L([[1.95, 5.3, -1.45], [2.05, 2.5, -1.35], [2.05, -1.0, -1.3], [1.95, -4.3, -1.2]], 24), TISSUE.nerve, TISSUE.nerveDeep, { r0: 0.1, r1: 0.09, n: 24, sides: 10 }, nv, { tissue: 'vessel' });
    vess('sln', 'goiko-laringe-nerbioa', L([[2.03, 3.95, -1.38], [2.0, 3.0, -0.9], [1.6, 2.25, -0.55], [1.15, 1.9, -0.25]], 18), light(ARCH.iv), ARCH_DEEP.iv, { r0: 0.075, r1: 0.06, n: 18, sides: 10 }, nv, { tissue: 'vessel' });
    vess('rln', 'laringe-atzerakaria', L([[1.97, -3.7, -1.24], [1.8, -4.45, -1.3], [1.32, -4.3, -1.3], [0.92, -3.2, -1.22], [0.78, -2.0, -1.36], [0.5, -1.45, -1.46]], 26), light(ARCH.vi), ARCH_DEEP.vi, { r0: 0.075, r1: 0.06, n: 26, sides: 10 }, nv, { tissue: 'vessel' });
    if (nv > 0.3) {
      pts['bagoa'] = [2.05, 0.5, -1.33];
      pts['goiko-laringe-nerbioa'] = [1.82, 2.55, -0.7];
      pts['laringe-atzerakaria'] = [0.9, -3.1, -1.24];
    }
  }
  return { items, pts };
}
