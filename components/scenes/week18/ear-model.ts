import { ARCH, ARCH_DEEP, TISSUE, type PoseModel } from '@/components/scenes/week17/common';
import { blobParts, mixHex } from '@/components/scenes/week10/model3d';
import type { V3 } from '@/lib/three-d/math';
import { plate, vessel, vesselPieces, type Parts, type VesselOptions } from '@/lib/three-d/organic';
import type { Item3 } from '@/lib/three-d/scene';

/**
 * Topic 18, notes 1.1.1 and 1.1.2: the first two pharyngeal pouches in a frontal cut of the left side of the
 * pharynx, seen from the front (the pharynx on the viewer's left, the skin on the right; arch I above the first
 * pouch, arch II between the first and the second, arch III below).
 *
 * The first pouch is one flattened hollow bud grown by arc length out of the pharynx's endoderm: it deepens
 * (`deep`: the tubotympanic recess), its proximal part stays a tube and its end widens into a cup (`cup`: the
 * tympanic cavity), and the three ossicles arrive from their own arches (`oss`). The second pouch stays shallow:
 * buds of its epithelium grow into the wall (`tonsil`), lymphoid cells fill it (`lymph`), it works (`func`).
 *
 * Axes as every model of the topic: x towards the embryo's LEFT, y cranial, z ventral. The cut face is z = 0.
 */

export interface EarPose {
  /** The first pouch's depth (0..1), its end widened (0..1), the ossicles in the cavity (0..1). */
  deep: number;
  cup: number;
  oss: number;
  /** The palatine tonsil: bud (0..1), lymphoid tissue (0..1), functional (0..1). */
  tonsil: number;
  lymph: number;
  func: number;
}

export const EAR0: EarPose = { deep: 0.17, cup: 0, oss: 0, tonsil: 0, lymph: 0, func: 0 };

export interface EarOpts {
  dim?: { ids: readonly string[]; k: number } | null;
}

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const darker = (c: string) => mixHex(c, '#000000', 0.55);
const box = (x0: number, x1: number, y0: number, y1: number, n = 40): [number, number][] =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const c = Math.cos(a), s = Math.sin(a);
    return [(x0 + x1) / 2 + ((x1 - x0) / 2) * Math.sign(c) * Math.abs(c) ** 0.28, (y0 + y1) / 2 + ((y1 - y0) / 2) * Math.sign(s) * Math.abs(s) ** 0.28];
  });

const BLOCK = box(-1.9, 5.1, -4.7, 3.5);
const LUMEN = box(-1.85, -0.04, -4.72, 3.52);
const A1 = box(0.25, 4.85, 0.95, 3.25);
const A2 = box(0.25, 4.85, -2.15, -0.75);
const A3 = box(0.25, 4.85, -4.5, -3.4);

const WALL = '#c49a78';
const WALL_DEEP = '#6d4629';
const CAVITY = '#2a2030';
const CAVITY_DEEP = '#120d16';
export const TONSIL = '#e39ac4';
export const LYMPH = '#8a5fd0';

/** The first pouch's axis, from the pharynx's wall to the skin. */
const P1: V3[] = [[0, 0.12, 0.02], [1.1, 0.14, 0.02], [2.2, 0.2, 0.02], [3.15, 0.26, 0.02]];
/** The share of the pouch that stays a tube. */
const TUBE_END = 0.56;
/** The second pouch's axis (it stays shallow). */
const P2: V3[] = [[0, -2.8, 0.02], [0.55, -2.8, 0.02], [1.15, -2.8, 0.02]];
/** Where each ossicle starts (inside its arch), as an offset from where it ends. */
const FROM_I: V3 = [0.2, 1.55, 0];
const FROM_II: V3 = [0.5, -2.05, 0];
const FLAT = { flat: 0.9, ref: [0, 0, 1] as V3, sides: 22, n: 40 };

export function earModel(pose: EarPose, o: EarOpts = {}): PoseModel {
  const items: Item3[] = [];
  const pts: Record<string, V3> = {};
  const dim = o.dim;
  const fade = (id: string, groups?: readonly string[]) => (!dim || dim.k <= 0.001 || dim.ids.includes(id) || (groups ?? []).some((g) => dim.ids.includes(g)) ? 1 : 1 - 0.7 * dim.k);
  const put = (key: string, id: string | undefined, parts: Parts | null, color: string, extra: Partial<Item3> = {}) => {
    if (parts) items.push({ key, id, ...parts, color, deep: darker(color), tissue: 'epithelium', opacity: id ? fade(id, extra.groups) : 1, ...extra });
  };
  const vess = (key: string, id: string | undefined, line: V3[], color: string, prof: VesselOptions, g = 1, extra: Partial<Item3> = {}) =>
    put(key, id, vessel(line, { ref: [0, 0, 1], sides: 12, ...prof }, g), color, extra);
  const ball = (key: string, id: string | undefined, c: V3, r: V3, color: string, extra: Partial<Item3> = {}) =>
    put(key, id, blobParts({ center: c, radii: r, rings: 10, sides: 14 }), color, extra);
  const shifted = (p: V3, d: V3, k: number): V3 => [p[0] + d[0] * k, p[1] + d[1] * k, p[2] + d[2] * k];

  // ———— the cut block: mesenchyme, the three arches in it, the pharynx's cavity on the left ————
  items.push({ key: 'block', ...plate('ear-block-v1', BLOCK, -0.03, -0.9), color: WALL, deep: WALL_DEEP, tissue: 'mesenchyme', opacity: 1, quiet: true, ground: true });
  items.push({ key: 'pharynx-lumen', ...plate('ear-lumen-v1', LUMEN, -0.008, -0.92), color: CAVITY, deep: CAVITY_DEEP, tissue: 'membrane', opacity: 1, quiet: true, ground: true, outline: false });
  const arch = (id: string, key: string, shape: [number, number][], c: string, d: string) =>
    put(key, id, plate(`ear-${key}-v1`, shape, -0.012, -0.5), mixHex(c, WALL, 0.28), { deep: d, tissue: 'mesenchyme', ground: true });
  arch('lehen-arkua', 'a1', A1, ARCH.i, ARCH_DEEP.i);
  arch('bigarren-arkua', 'a2', A2, ARCH.ii, ARCH_DEEP.ii);
  arch('hirugarren-arkua', 'a3', A3, ARCH.iii, ARCH_DEEP.iii);
  pts['lehen-arkua'] = [4.15, 2.5, 0.05];
  pts['bigarren-arkua'] = [4.15, -1.55, 0.05];
  pts['hirugarren-arkua'] = [3.6, -4, 0.05];

  // ———— the pharynx's endoderm and the skin's ectoderm, with the first cleft facing the pouch ————
  vess('endo', 'faringe-hestea', [[0.02, 3.45, 0], [0.02, 0, 0], [0.02, -4.65, 0]], TISSUE.endo, { r0: 0.1, ...FLAT, n: 12 }, 1, { deep: TISSUE.endoDeep });
  pts['faringe-hestea'] = [-0.95, 1.8, 0.05];
  vess('ecto', 'lehen-arraildura', [[4.98, 3.45, 0], [4.98, 0.3, 0], [4.98, -4.65, 0]], TISSUE.ecto, { r0: 0.1, ...FLAT, n: 12 }, 1, { deep: TISSUE.ectoDeep });
  vess('cleft', 'lehen-arraildura', [[5, 0.3, 0.03], [4.6, 0.3, 0.03], [4.28, 0.3, 0.03]], TISSUE.ecto, { r0: 0.36, r1: 0.14, ...FLAT, n: 12 }, 1, { deep: TISSUE.ectoDeep });
  pts['lehen-arraildura'] = [4.72, 0.3, 0.1];

  // ———— the first pouch: one hollow bud, grown by arc length; the wall, then its cavity on top ————
  const g = clamp01(pose.deep);
  const k = clamp01(pose.cup);
  const wall: VesselOptions = { r0: 0.27, flare: 0.75, flareLen: 0.45, bulb: 2.9 * k, bulbLen: 2.1, ...FLAT };
  const whole = ['lehen-poltsa', 'sakonune-tubotinpanikoa', 'eustakioren-tronpa', 'tinpano-kutxa'];
  if (k <= 0.001) {
    vess('p1-wall', 'lehen-poltsa', P1, TISSUE.endo, wall, g, { deep: TISSUE.endoDeep, groups: whole });
  } else {
    // The same bud, its two parts named once the end has begun to widen.
    const [tube, cup] = vesselPieces(P1, { ...wall, ref: [0, 0, 1] }, [TUBE_END], g);
    put('p1-wall', 'eustakioren-tronpa', tube, TISSUE.endo, { deep: TISSUE.endoDeep, groups: ['lehen-poltsa', 'sakonune-tubotinpanikoa'] });
    put('p1-cup', 'tinpano-kutxa', cup, TISSUE.endo, { deep: TISSUE.endoDeep, groups: ['lehen-poltsa', 'sakonune-tubotinpanikoa'] });
  }
  vess('p1-lumen', undefined, [...P1.map((p): V3 => [p[0], p[1], 0.075])], CAVITY, { r0: 0.14, flare: 1.1, flareLen: 0.45, bulb: 6.1 * k, bulbLen: 2.05, ...FLAT }, Math.max(0.01, g * 0.985), { quiet: true, outline: false, deep: CAVITY_DEEP });
  const tip = P1[3];
  const tx = 3.15 * g;
  pts['lehen-poltsa'] = [Math.max(0.4, tx * 0.65), 0.14, 0.12];
  pts['sakonune-tubotinpanikoa'] = [Math.max(0.4, tx * 0.55), 0.16, 0.12];
  pts['eustakioren-tronpa'] = [1.05, 0.14, 0.12];
  pts['tinpano-kutxa'] = [tip[0] + 0.1, -0.4, 0.12];

  // ———— the ossicles, each from its own arch (I orange, II blue) ————
  const q = clamp01(pose.oss);
  if (q > 0.01) {
    const u = 1 - q * q * (3 - 2 * q);
    const z = 0.2;
    const m = (p: V3): V3 => shifted(p, FROM_I, u);
    const s = (p: V3): V3 => shifted(p, FROM_II, u);
    // Malleus (next to the skin's side): a head and a long handle.
    vess('malleus', 'mailua', [m([3.28, 0.82, z]), m([3.4, 0.35, z]), m([3.48, -0.32, z])], ARCH.i, { r0: 0.1, r1: 0.05, sides: 12, n: 12 }, 1, { deep: ARCH_DEEP.i });
    ball('malleus-head', 'mailua', m([3.25, 0.85, z]), [0.2, 0.2, 0.17], ARCH.i, { deep: ARCH_DEEP.i });
    // Incus: a body and two legs, the long one reaching the stapes.
    ball('incus-body', 'ingudea', m([2.86, 0.8, z]), [0.22, 0.2, 0.17], ARCH.i, { deep: ARCH_DEEP.i });
    vess('incus-long', 'ingudea', [m([2.82, 0.75, z]), m([2.74, 0.35, z]), m([2.62, 0.08, z])], ARCH.i, { r0: 0.095, r1: 0.05, sides: 12, n: 12 }, 1, { deep: ARCH_DEEP.i });
    vess('incus-short', 'ingudea', [m([2.75, 0.84, z]), m([2.5, 0.88, z]), m([2.34, 0.85, z])], ARCH.i, { r0: 0.09, r1: 0.04, sides: 12, n: 12 }, 1, { deep: ARCH_DEEP.i });
    // Stapes: a stirrup, two legs on a footplate, lying towards the inside.
    ball('stapes-head', 'ointokia', s([2.58, 0.04, z]), [0.09, 0.1, 0.09], ARCH.ii, { deep: ARCH_DEEP.ii });
    for (const side of [-1, 1]) vess(`stapes-${side}`, 'ointokia', [s([2.56, 0.04, z]), s([2.36, 0.04 + side * 0.17, z]), s([2.14, 0.04 + side * 0.2, z])], ARCH.ii, { r0: 0.04, sides: 10, n: 12 }, 1, { deep: ARCH_DEEP.ii });
    ball('stapes-foot', 'ointokia', s([2.1, 0.04, z]), [0.05, 0.3, 0.14], ARCH.ii, { deep: ARCH_DEEP.ii });
    pts.mailua = m([3.44, 0.1, z + 0.1]);
    pts.ingudea = m([2.86, 0.86, z + 0.15]);
    pts.ointokia = s([2.35, 0.04, z + 0.1]);
  }

  // ———— the second pouch: shallow; the tonsil grows round it ————
  const t = clamp01(pose.tonsil);
  if (t > 0.01) {
    ball('tonsil', 'aho-sabaiko-amigdala', [0.95, -2.8, 0], [0.25 + 0.95 * t, 0.2 + 0.42 * t, 0.06], mixHex(TONSIL, '#ffffff', 0.25 * clamp01(pose.func)), { deep: '#8d4a72' });
    pts['aho-sabaiko-amigdala'] = [1.55, -2.45, 0.12];
    for (const [i, a] of [-0.75, 0, 0.75].entries())
      vess(`crypt${i}`, 'bigarren-poltsa', [[1, -2.8, 0.09], [1.3, -2.8 + a * 0.3, 0.09], [1.7, -2.8 + a * 0.5, 0.09]], TISSUE.endo, { r0: 0.08, r1: 0.04, ...FLAT, n: 14 }, t, { deep: TISSUE.endoDeep });
  }
  vess('p2-wall', 'bigarren-poltsa', P2, TISSUE.endo, { r0: 0.24, r1: 0.14, flare: 0.8, flareLen: 0.4, ...FLAT, n: 18 }, 1, { deep: TISSUE.endoDeep });
  vess('p2-lumen', undefined, P2.map((p): V3 => [p[0], p[1], 0.075]), CAVITY, { r0: 0.12, r1: 0.06, flare: 1.1, flareLen: 0.4, ...FLAT, n: 18 }, 0.97, { quiet: true, outline: false, deep: CAVITY_DEEP });
  pts['bigarren-poltsa'] = [0.55, -2.8, 0.14];
  const NL = 44;
  const shown = Math.round(clamp01(pose.lymph) * NL);
  for (let i = 0; i < shown; i++) {
    const r = Math.sqrt((i + 0.5) / NL), a = i * 2.39996;
    const x = 0.98 + 1.02 * r * Math.cos(a), y = -2.8 + 0.5 * r * Math.sin(a);
    if (Math.abs(y + 2.8) < 0.12 && x < 1.25) continue;
    ball(`ly${i}`, 'ehun-linfatikoa', [x, y, 0.13], [0.058, 0.058, 0.04], clamp01(pose.func) > 0.5 ? '#a877ec' : LYMPH, { deep: '#3f2478' });
  }
  if (shown) pts['ehun-linfatikoa'] = [1.7, -3.1, 0.2];
  return { items, pts };
}
