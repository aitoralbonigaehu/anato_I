import { add, mix3, type V3 } from '@/lib/three-d/math';
import { curve3 } from '@/lib/three-d/mesh';
import { cutOpen, mergeParts, plate, vessel, type Parts, type VesselOptions } from '@/lib/three-d/organic';
import type { Item3 } from '@/lib/three-d/scene';
import { blobParts, mixHex, tubeParts } from '@/components/scenes/week10/model3d';
import { C } from '@/lib/sim/palette';
import { UC } from './uro-model';

/**
 * Topic 15, notes 2.1: the suprarenal gland cut open (its front half taken away, the notes' row of round
 * sections): from the 6th week the fetal (embryonic) cortex from cells of the urogenital ridge (mesoderm,
 * pink); neural crest cells from the sympathetic ganglia at the same level go medially into it and settle
 * deep inside: the medulla (ectoderm, blue). A new layer forms in the fetal cortex: the definitive cortex
 * (dark magenta). The medulla first shrinks, then grows again; the fetal cortex is gone during the first year.
 *
 * Own frame: x towards the embryo's LEFT, y cranial, z ventral; the gland is seen from the front, cut at z = 0
 * (the medial side, where the crest cells come from, on the viewer's left).
 *
 * Built to the quality bar (docs/quality/3d-quality-bar.md): the gland is a solid cut open (`cutOpen`): its
 * back half whole, its layers as rings on the cut face, each changing thickness smoothly. It lies on the
 * posterior wall, with the urogenital ridge below (whose cells gather into the fetal cortex) and, medially,
 * the aorta and the sympathetic trunk with its ganglion (whose crest cells stream in as a chain and gather at
 * the centre into the medulla).
 */

export const AC = {
  fetal: '#f9a8d4',
  fetalDeep: '#a14c78',
  definitive: '#be185d',
  definitiveDeep: '#5c0a2c',
  medulla: '#38bdf8',
  medullaDeep: '#0e5a85',
  crest: C.neuralCrest,
  ridge: '#fcd2a8',
} as const;

export interface AdrenalPose {
  /** The fetal cortex gathering from the urogenital ridge (0..1). */
  fetal: number;
  /** Neural crest cells on their way in (0..1) and settled as the medulla (0..1). */
  crest: number;
  medulla: number;
  /** The definitive cortex forming (0..1); the medulla shrinking then growing again (0..1 → 1..2); the fetal cortex gone (0..1). */
  definitive: number;
  medSize: number;
  fetalGone: number;
}

export const AP0: AdrenalPose = { fetal: 0, crest: 0, medulla: 0, definitive: 0, medSize: 0, fetalGone: 0 };

export interface AdrenalOpts {
  dim?: { ids: readonly string[]; k: number } | null;
}

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const darker = (c: string) => mixHex(c, '#000000', 0.55);
const ss = (a: number, b: number, x: number) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};

const R = 1.15;
/** Depth of the gland (front to back) as a share of its height; width as a share of its height. */
const DEPTH = 0.85, WIDE = 0.92;
const GANGLION: V3 = [-2.45, 0.85, -0.75];
const RIDGE_TOP: V3 = [1.05, -1.55, -0.75];
/** The crest cells' way: out of the ganglion, medially into the gland, on to its centre (on the cut face). */
const CREST_PATH = curve3([GANGLION, [-1.85, 0.75, -0.45], [-1.3, 0.45, -0.05], [-0.75, 0.22, 0.02], [-0.3, 0.06, 0.03], [0, 0, 0.03]], 40);
/** The fetal cortex's cells: from the ridge's coelomic epithelium up into the gland. */
const RIDGE_PATH = curve3([RIDGE_TOP, [0.9, -1.1, -0.45], [0.55, -0.6, -0.2], [0.2, -0.2, -0.05]], 24);
/** The posterior wall the gland lies on. */
const WALL = Array.from({ length: 56 }, (_, i): [number, number] => {
  const a = (i / 56) * Math.PI * 2;
  const c = Math.cos(a), sn = Math.sin(a);
  return [-0.7 + 3.9 * Math.sign(c) * Math.abs(c) ** 0.35, -0.3 + 3.2 * Math.sign(sn) * Math.abs(sn) ** 0.35];
});
const cellJitter = (k: number): V3 => [Math.sin(k * 2.1) * 0.1, Math.cos(k * 1.7) * 0.1, Math.sin(k * 3.3) * 0.05];

export function adrenalModel(pose: AdrenalPose, o: AdrenalOpts = {}) {
  const items: Item3[] = [];
  const pts: Record<string, V3> = {};
  const dim = o.dim;
  const fade = (id: string, groups?: readonly string[]) => (!dim || dim.k <= 0.001 || dim.ids.includes(id) || (groups ?? []).some((g) => dim.ids.includes(g)) ? 1 : 1 - 0.75 * dim.k);
  const put = (key: string, id: string | undefined, parts: Parts | null, color: string, op = 1, extra: Partial<Item3> = {}) => {
    if (!parts || op <= 0.01) return;
    items.push({ key, id, ...parts, color, deep: darker(color), tissue: 'epithelium', opacity: op * (id ? fade(id, extra.groups) : 1), ...extra });
  };
  const vess = (key: string, id: string | undefined, line: V3[], color: string, prof: VesselOptions, g = 1, op = 1, extra: Partial<Item3> = {}) =>
    put(key, id, vessel(line, { ref: [0, 0, 1], ...prof }, g), color, op, extra);

  // ———— context: the posterior wall; medially the aorta and the sympathetic trunk; below, the urogenital ridge ————
  items.push({ key: 'wall', ...plate('adrenal-wall-v1', WALL, -1.25, -1.5), color: UC.wall, deep: UC.wallDeep, tissue: 'mesenchyme', opacity: 1, quiet: true, ground: true });
  vess('aorta', undefined, [[-3.45, 3.0, -0.85], [-3.42, 0, -0.82], [-3.4, -3.3, -0.85]], mixHex(UC.aorta, '#6b4a4a', 0.45), { r0: 0.36, r1: 0.33, sides: 16 }, 1, 1, { quiet: true, ground: true, tissue: 'vessel' });
  vess('trunk', undefined, [[-2.5, 3.0, -0.85], [-2.45, 0.85, -0.78], [-2.5, -3.3, -0.85]], mixHex(AC.crest, '#e8dcc0', 0.35), { r0: 0.07, sides: 8 }, 1, 1, { quiet: true, ground: true, tissue: 'nerve' });
  // The urogenital ridge: a fold of the posterior wall, its coelomic epithelium giving the fetal cortex's cells.
  const fetal = clamp01(pose.fetal);
  vess('ridge', 'gandor-urogenitala', curve3([[1.2, -3.4, -1.05], [1.15, -2.4, -0.95], RIDGE_TOP], 16), AC.ridge, { r0: 0.48, r1: 0.4, flat: 0.35, bulb: 0.2, sides: 16 }, 1, 1, { tissue: 'mesenchyme' });
  pts['gandor-urogenitala'] = [1.55, -2.55, -0.55];

  // ———— the gland: a solid cut open, its layers as rings on the cut face ————
  const gone = clamp01(pose.fetalGone);
  const def = clamp01(pose.definitive);
  const outer = R * (0.35 + 0.65 * fetal);
  const crest = clamp01(pose.crest);
  const med = clamp01(pose.medulla);
  // The medulla: shrinks at first, then grows again (medSize 0 → 1 → 2).
  const ms = pose.medSize <= 1 ? lerp(1, 0.6, pose.medSize) : lerp(0.6, 1.25, pose.medSize - 1);
  // The crest cells travel first, then settle; the medulla forms where they settle.
  const travel = crest;
  const rm = 0.42 * ms * ss(0.8, 1, med) * (R / outer);
  // The definitive cortex: a layer in the outer part of the fetal cortex, spreading in as the fetal cortex goes.
  const defIn = lerp(1, lerp(0.8, rm + 0.004, gone), def);
  if (fetal > 0.01) {
    const g = cutOpen({ center: [0, 0, 0], radii: [outer * WIDE, outer, outer * DEPTH], layers: [[defIn, 1], [rm, defIn], [0, rm]] });
    const shell = mixHex(AC.fetal, AC.definitive, ss(0.2, 0.8, def));
    put('dome', 'giltzurrun-gaineko-guruinak', g.dome, shell, 1, { deep: mixHex(AC.fetalDeep, AC.definitiveDeep, ss(0.2, 0.8, def)), groups: ['fetu-kortexa', 'behin-betiko-kortexa'] });
    put('def', 'behin-betiko-kortexa', g.faces[0], AC.definitive, 1, { deep: AC.definitiveDeep, groups: ['giltzurrun-gaineko-guruinak'] });
    put('fetal', 'fetu-kortexa', g.faces[1], AC.fetal, 1, { deep: AC.fetalDeep, groups: ['giltzurrun-gaineko-guruinak'] });
    put('medulla', 'giltzurrun-gaineko-muina', g.faces[2], AC.medulla, 1, { deep: AC.medullaDeep, tissue: 'nerve', groups: ['giltzurrun-gaineko-guruinak'] });
    // The capsule: a thin rim round the cut.
    const ring = Array.from({ length: 65 }, (_, i): V3 => {
      const a = (i / 64) * Math.PI * 2;
      return [outer * WIDE * Math.cos(a), outer * Math.sin(a), 0.004];
    });
    items.push({ key: 'rim', ...tubeParts(ring, { radius: () => 0.02, ref: [0, 0, 1], sides: 6 }), color: '#fde7f1', deep: '#8a5a70', tissue: 'membrane', opacity: 0.7, quiet: true, outline: false });
  }
  const mid = (a: number, b: number, t: number): V3 => {
    const r = outer * (a + b) * 0.5;
    return [r * WIDE * Math.cos(t), r * Math.sin(t), 0.05];
  };
  pts['fetu-kortexa'] = def > 0.05 ? mid(rm, defIn, 0.5) : mid(0.35, 0.8, 0.5);
  pts['behin-betiko-kortexa'] = mid(defIn, 1, 0.9);
  pts['giltzurrun-gaineko-guruinak'] = [0.75 * outer * WIDE, -0.62 * outer, -0.1];

  // The fetal cortex's cells coming up from the ridge while it gathers.
  const gather = fetal * (1 - ss(0.85, 1, fetal));
  if (gather > 0.01) {
    const cells = Array.from({ length: 12 }, (_, k) => {
      const u = ((fetal * 2.2 + k / 12) % 1);
      const p = RIDGE_PATH[Math.min(RIDGE_PATH.length - 1, Math.floor(u * (RIDGE_PATH.length - 1)))];
      return blobParts({ center: add(p, cellJitter(k)), radii: [0.085, 0.085, 0.085], rings: 6, sides: 8 });
    });
    put('fcells', 'fetu-kortexa', mergeParts(cells), AC.fetal, gather, { deep: AC.fetalDeep, quiet: true, outline: false });
  }

  // ———— the neural crest: a ganglion of the sympathetic trunk; its cells stream in medially as a chain ————
  put('ganglion', 'gandor-neurala', blobParts({ center: GANGLION, radii: [0.42, 0.5, 0.36], rings: 12, sides: 16 }), AC.crest, 1, { deep: darker(AC.crest), tissue: 'nerve' });
  pts['gandor-neurala'] = add(GANGLION, [-0.12, 0.5, 0.3]);
  if (travel > 0.01 && med < 0.999) {
    const n = 26;
    // Where each cell settles in the medulla (a cluster round the centre, on the cut face).
    const slot = (k: number): V3 => {
      const a = k * 2.399, r = 0.42 * R * 0.95 * Math.sqrt((k + 0.5) / n);
      return [r * Math.cos(a) * WIDE, r * Math.sin(a), 0.05];
    };
    const cells = Array.from({ length: n }, (_, k) => {
      // A chain: each cell leaves a little after the one before, and turns off the way to its own place.
      const u = clamp01(travel * 1.55 - (k / n) * 0.55);
      const x = u * (CREST_PATH.length - 1);
      const i = Math.min(CREST_PATH.length - 2, Math.floor(x));
      const p = mix3(CREST_PATH[i], CREST_PATH[i + 1], x - i);
      const on = add(p, mul3(cellJitter(k), 1 - u * 0.5));
      return blobParts({ center: mix3(on, slot(k), ss(0.72, 1, u)), radii: [0.1, 0.1, 0.08], rings: 6, sides: 8 });
    });
    put('crest', 'giltzurrun-gaineko-muina', mergeParts(cells), AC.medulla, 1 - ss(0.85, 1, med), { deep: AC.medullaDeep, tissue: 'nerve', groups: ['gandor-neurala'] });
    pts['muin-zelulak'] = CREST_PATH[22];
  }
  pts['giltzurrun-gaineko-muina'] = rm > 0.02 ? [-0.05 - rm * outer * 0.4, rm * outer * 0.55, 0.06] : (pts['muin-zelulak'] ?? [-0.6, 0.2, 0.05]);
  return { items, pts };
}

const mul3 = (v: V3, k: number): V3 => [v[0] * k, v[1] * k, v[2] * k];
