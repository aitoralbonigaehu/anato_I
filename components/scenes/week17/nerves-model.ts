import type { V3 } from '@/lib/three-d/math';
import { blob, curve3, type Mesh } from '@/lib/three-d/mesh';
import { geoOf, geoSlot } from '@/lib/three-d/offthread';
import { vessel, type Parts } from '@/lib/three-d/organic';
import { capsule, ellipsoid, partition, smin, surfaceMesh, type SDF } from '@/lib/three-d/sdf';
import type { Item3 } from '@/lib/three-d/scene';
import { ARCH, ARCH_DEEP, TISSUE, type PoseModel } from './common';

/**
 * Topic 17, the cranial nerves: the adult brain's base (the notes' figure of 2.1, p. 4) with the twelve pairs leaving
 * it front to back, and the vagus running on down the neck and chest (2.6.1).
 *
 * Axes: x the body's LEFT, y cranial, z ventral. Seen from below (BELOW) the frontal lobes are at the top of the frame,
 * as in the notes, and the body's left is on the viewer's right. One model and one vagus: the stump that leaves the
 * brain in the first stage is the same nerve that grows down in the second.
 */

export type NervePose = { /** The vagus's growth past its stump. */ grow: number; /** Neck, chest and gut. */ body: number };
export type NerveOpts = { dim?: { ids: readonly string[]; k: number } | null };
export const NP0: NervePose = { grow: 0, body: 0 };

type Side = 1 | -1;
const side = (s: Side, p: V3): V3 => [s * p[0], p[1], p[2]];

/** A field that gets folds: the cortex's gyri, a shallow winding of the surface. */
const gyri = (x: number, y: number, z: number) => {
  const a = Math.sin(2.7 * z + 1.9 * Math.sin(1.4 * x + 0.5)) * Math.sin(2.3 * x + 1.6 * Math.sin(1.1 * z - y));
  return 0.075 * a;
};

function cerebrumField(): SDF {
  const frontal = ellipsoid([1.2, 0.36, 2.2], [1.24, 1.16, 2.5]);
  const body = ellipsoid([1.32, 1.05, -0.9], [1.42, 1.9, 3.75]);
  const temporal = ellipsoid([2.1, -0.34, 0.15], [1.06, 1.02, 2.1]);
  return (x0, y, z) => {
    const x = Math.abs(x0);
    return smin(smin(frontal(x, y, z), body(x, y, z), 0.42), temporal(x, y, z), 0.26) + gyri(x, y, z);
  };
}

function cerebellumField(): SDF {
  const lobe = ellipsoid([1.34, -1.42, -3.45], [1.56, 1.1, 1.44]);
  return (x0, y, z) => {
    const x = Math.abs(x0);
    return lobe(x, y, z) + 0.022 * Math.sin(15 * (y + 0.42 * z));
  };
}

function stemField(): SDF {
  const midbrain = capsule([0.34, -0.1, 0.42], [0.42, -0.9, -0.15], 0.42, 0.46);
  const pons = ellipsoid([0, -1.22, -0.78], [1.06, 0.72, 0.82]);
  const medulla = capsule([0, -1.5, -1.42], [0, -2.72, -2.54], 0.6, 0.36);
  const cord = capsule([0, -2.72, -2.54], [0, -3.5, -3.0], 0.36, 0.3);
  return (x0, y, z) => {
    const x = Math.abs(x0);
    return smin(smin(midbrain(x, y, z), pons(x, y, z), 0.16), smin(medulla(x, y, z), cord(x, y, z), 0.1), 0.18);
  };
}

const LO: V3 = [-3.5, -3.7, -5.4];
const HI: V3 = [3.5, 3.1, 5.0];

function build() {
  const cb = cerebrumField();
  const cl = cerebellumField();
  const st = stemField();
  const f: SDF = (x, y, z) => smin(smin(cb(x, y, z), cl(x, y, z), 0.05), st(x, y, z), 0.14);
  const fine = surfaceMesh(f, LO, HI, 0.085);
  const coarse = surfaceMesh(f, LO, HI, 0.3);
  const split = (m: Mesh) => {
    const [stem, restA] = partition(m, (c) => st(c[0], c[1], c[2]) <= Math.min(cb(c[0], c[1], c[2]), cl(c[0], c[1], c[2])));
    const [cereb, cortex] = partition(restA, (c) => cl(c[0], c[1], c[2]) < cb(c[0], c[1], c[2]));
    return { stem, cereb, cortex };
  };
  const a = split(fine);
  const b = split(coarse);
  return {
    cortex: { mesh: a.cortex, hit: b.cortex } as Parts,
    cereb: { mesh: a.cereb, hit: b.cereb } as Parts,
    stem: { mesh: a.stem, hit: b.stem } as Parts,
  };
}

export const NERVE_BRAIN = geoSlot('nerve-brain', build);

/**
 * Each pair on the body's left, from where it leaves the brain to where it is cut. From below the ends fan outwards.
 * The numbering runs front to back, as the notes name them.
 */
export const PAIRS = [
  { n: 'I', id: 'usaimen-nerbioa', r: 0.09, line: [[0.62, -0.6, 1.25], [0.5, -0.86, 2.6], [0.44, -0.72, 3.72]] },
  { n: 'II', id: 'ikusmen-nerbioa', r: 0.15, line: [[1.02, -0.78, 0.0], [0.3, -1.1, 0.98], [0.28, -1.14, 1.28], [0.98, -1.42, 2.5]] },
  { n: 'III', id: 'okulomotorea', r: 0.11, line: [[0.3, -1.05, 0.0], [0.66, -1.5, 0.5], [1.14, -2.0, 1.28]] },
  { n: 'IV', id: 'patetikoa', r: 0.065, line: [[0.82, -0.72, -0.4], [1.42, -1.46, 0.08], [2.02, -2.0, 0.84]] },
  { n: 'V', id: 'trigeminoa', r: 0.25, line: [[0.86, -1.3, -0.72], [1.5, -1.72, -0.5], [2.36, -2.14, -0.2]] },
  { n: 'VI', id: 'kanpoko-okulomotorea', r: 0.08, line: [[0.24, -1.82, -1.24], [0.8, -2.24, -0.72], [1.5, -2.62, 0.1]] },
  { n: 'VII', id: 'aurpegi-nerbioa', r: 0.14, line: [[0.86, -1.56, -1.28], [1.62, -1.98, -1.22], [2.72, -2.36, -1.08]] },
  { n: 'VIII', id: 'belarriko-nerbioa', r: 0.14, line: [[0.96, -1.5, -1.58], [1.86, -1.96, -1.74], [2.96, -2.3, -1.86]] },
  { n: 'IX', id: 'glosofaringeoa', r: 0.12, line: [[0.56, -1.92, -1.88], [1.56, -2.5, -2.34], [2.72, -2.9, -2.72]] },
  { n: 'XI', id: 'laguntzailea', r: 0.1, line: [[0.36, -2.5, -2.56], [1.2, -3.1, -3.3], [1.96, -3.46, -4.1]] },
  { n: 'XII', id: 'hipoglosoa', r: 0.11, line: [[0.22, -2.3, -2.02], [0.72, -2.9, -1.62], [1.0, -3.36, -0.96]] },
] as const;

/** The vagus: leaves the medulla, its stump is the X of the brain's base, then down the neck, chest and to the gut. */
const VAGUS: readonly V3[] = curve3(
  [
    [0.48, -2.08, -2.18],
    [1.5, -2.86, -2.5],
    [1.7, -4.3, -2.3],
    [1.5, -6.2, -1.0],
    [1.38, -9, -0.2],
    [1.42, -11.2, 0.42],
    [1.46, -13.5, 0.52],
    [1.2, -15, 0.1],
    [0.7, -17, -0.55],
    [0.5, -19.5, -0.72],
    [0.82, -21.2, -0.2],
  ],
  64,
);
const lengthOf = (l: readonly V3[]) => {
  let L = 0;
  for (let i = 1; i < l.length; i++) L += Math.hypot(l[i][0] - l[i - 1][0], l[i][1] - l[i - 1][1], l[i][2] - l[i - 1][2]);
  return L;
};
const VAGUS_STUMP = 2.3 / lengthOf(VAGUS);

const vagusCache = new Map<string, Parts | null>();
function vagusAt(s: Side, g: number) {
  const q = Math.round(g * 60) / 60;
  const k = `${s}:${q}`;
  if (!vagusCache.has(k)) vagusCache.set(k, vessel(VAGUS.map((p) => side(s, p)), { r0: 0.17, r1: 0.11, flare: 0.3, n: 64, sides: 12, capEnd: true }, Math.max(VAGUS_STUMP, q)));
  return vagusCache.get(k) ?? null;
}

let staticParts: ReturnType<typeof buildStatic> | null = null;

function arcBand(y: number, r: number): V3[] {
  const c: V3 = [0, y, -0.86];
  const pts: V3[] = [];
  for (let i = 0; i <= 18; i++) {
    const a = (-0.68 + (1.36 * i) / 18) * Math.PI;
    pts.push([c[0] + r * Math.sin(a), y, c[2] - r * Math.cos(a)]);
  }
  return pts;
}

function buildStatic() {
  const v = (l: readonly V3[], r0: number, r1 = r0, x: object = {}) => vessel(l, { r0, r1, n: 32, sides: 14, capStart: true, capEnd: true, ...x }) as Parts;
  const nerves = PAIRS.map((p) => [1, -1].map((s) => {
    const line = curve3((p.line as unknown as V3[]).map((q) => side(s as Side, q)), 14);
    return v(line, p.r, p.r * 0.8, { capStart: false, flare: 0.3 });
  }));
  const bulb = [1, -1].map((s) => blob({ center: side(s as Side, [0.42, -0.72, 3.8]), radii: [0.2, 0.14, 0.46], rings: 12, sides: 16 }));
  const chiasm = blob({ center: [0, -1.12, 1.1], radii: [0.42, 0.13, 0.26], rings: 10, sides: 18 });
  const gasser = [1, -1].map((s) => blob({ center: side(s as Side, [1.9, -1.92, -0.36]), radii: [0.46, 0.14, 0.34], rings: 12, sides: 16 }));
  const parts = (m: Mesh): Parts => ({ mesh: m, hit: m });

  const pharynx = v(curve3([[0, -4.3, -1.0], [0, -6.2, -0.9], [0, -8.2, -0.86]], 12), 0.92, 0.48);
  const oesoph = v(curve3([[0, -8.1, -0.86], [0.08, -14, -0.82], [0.28, -19.7, -0.74], [1.0, -20.9, -0.2]], 20), 0.34);
  const midC = v(arcBand(-6.3, 0.86), 0.34, 0.34, { flat: 0.55, ref: [0, 1, 0] });
  const infC = v(arcBand(-7.55, 0.66), 0.32, 0.32, { flat: 0.55, ref: [0, 1, 0] });
  const larynx = parts(blob({ center: [0, -8.62, -0.04], radii: [0.86, 1.0, 0.72], rings: 18, sides: 24 }));
  const intrinsic = [1, -1].map((s) => parts(blob({ center: side(s as Side, [0.32, -8.68, -0.08]), radii: [0.24, 0.42, 0.36], rings: 12, sides: 16 })));
  const trachea = v(curve3([[0, -9.5, -0.08], [0, -14.8, -0.1]], 10), 0.42);
  const bronchi = [1, -1].map((s) => v(curve3([side(s as Side, [0, -14.7, -0.1]), side(s as Side, [0.9, -15.7, -0.12]), side(s as Side, [2.0, -16.2, -0.1])], 10), 0.3, 0.2));
  const aorta = v(curve3([[0.25, -16.4, 0.8], [0.15, -14.4, 0.8], [0.5, -13.3, 0.52], [1.02, -13.4, -0.12], [0.98, -15.2, -0.82], [0.72, -19.6, -1.3]], 26), 0.46, 0.38);
  const brachio = v(curve3([[0.22, -13.5, 0.62], [-0.45, -12.6, 0.42], [-1.0, -11.9, 0.1], [-2.8, -11.2, 0.0]], 16), 0.3, 0.2);
  const carotidL = v(curve3([[0.72, -13.3, 0.32], [0.92, -11, 0.2], [1.0, -8, -0.1]], 10), 0.2, 0.16);
  const subL = v(curve3([[1.02, -13.2, -0.1], [1.9, -12.1, -0.04], [3.0, -11.4, 0]], 10), 0.22, 0.18);
  const heart = parts(blob({ center: [0.42, -17.0, 0.95], radii: [1.56, 1.54, 1.24], rings: 22, sides: 30 }));
  const lungs = [1, -1].map((s) => parts(blob({ center: side(s as Side, [3.5, -15.9, -0.2]), radii: [1.52, 3.3, 1.9], rings: 22, sides: 30 })));
  const stomach = parts(blob({ center: [1.85, -21.9, 0.2], radii: [1.56, 1.2, 1.0], rings: 20, sides: 26 }));
  const liver = parts(blob({ center: [-1.7, -20.9, 0.6], radii: [2.25, 1.26, 1.34], rings: 20, sides: 26 }));
  const midgut = v(curve3([[1.6, -23.1, 0.3], [-1.2, -23.6, 0.6], [1.6, -24.4, 0.8], [-1.6, -25, 0.8], [1.6, -25.7, 0.8], [-1.4, -26.4, 0.7]], 56), 0.42);
  const sup = [1, -1].map((s) => v(curve3([side(s as Side, [1.5, -6.05, -1.02]), side(s as Side, [1.26, -6.5, -1.0]), side(s as Side, [0.98, -7.05, -1.05])], 12), 0.085, 0.07, { capStart: false }));
  const recL = v(curve3([[1.46, -13.75, 0.5], [1.5, -14.5, 0.22], [1.0, -14.72, -0.42], [0.5, -13.5, -0.62], [0.4, -10.6, -0.48], [0.34, -8.86, -0.1]], 30), 0.085, 0.07, { capStart: false });
  const recR = v(curve3([[-1.42, -11.45, 0.44], [-1.46, -12.2, 0.18], [-1.0, -12.42, -0.34], [-0.52, -11.6, -0.56], [-0.4, -10.3, -0.48], [-0.34, -8.86, -0.1]], 24), 0.085, 0.07, { capStart: false });
  return { nerves, bulb, chiasm, gasser, pharynx, oesoph, midC, infC, larynx, intrinsic, trachea, bronchi, aorta, brachio, carotidL, subL, heart, lungs, stomach, liver, midgut, sup, recL, recR };
}

const parts = () => (staticParts ??= buildStatic());

const QUIET = { color: '#b7b6bd', deep: '#5f5e69' };
const STRONG: Record<string, { color: string; deep: string }> = {
  trigeminoa: { color: ARCH.i, deep: ARCH_DEEP.i },
  'aurpegi-nerbioa': { color: ARCH.ii, deep: ARCH_DEEP.ii },
  glosofaringeoa: { color: ARCH.iii, deep: ARCH_DEEP.iii },
};

/** Where a name or numeral sits: a nerve's cut end, on the body's left (s 1) or right (s −1). */
export function nerveEnd(id: string, s: Side): V3 {
  const p = PAIRS.find((q) => q.id === id);
  if (p) {
    const l = p.line as unknown as V3[];
    return side(s, l[l.length - 1]);
  }
  return side(s, [2.0, -3.1, -2.92]);
}

export function nerveModel(pose: NervePose): PoseModel {
  const B = geoOf(NERVE_BRAIN);
  const P = parts();
  const body = pose.body;
  const items: Item3[] = [
    { key: 'cortex', ...B.cortex, color: '#d9a595', deep: '#83493f', tissue: 'skin', ground: true, quiet: true },
    { key: 'cereb', ...B.cereb, color: '#c98f7c', deep: '#744034', tissue: 'skin', ground: true, quiet: true },
    { key: 'stem', ...B.stem, color: '#e6c6ab', deep: '#90694e', tissue: 'skin', ground: true, quiet: true },
  ];
  PAIRS.forEach((p) => {
    const c = STRONG[p.id] ?? QUIET;
    P.nerves[PAIRS.indexOf(p)].forEach((m, j) => items.push({ key: `n-${p.id}-${j}`, id: p.id, ...m, ...c, tissue: 'skin' }));
  });
  P.bulb.forEach((m, j) => items.push({ key: `bulb-${j}`, id: 'usaimen-nerbioa', mesh: m, ...QUIET, tissue: 'skin' }));
  items.push({ key: 'chiasm', id: 'ikusmen-nerbioa', mesh: P.chiasm, ...QUIET, tissue: 'skin' });
  P.gasser.forEach((m, j) => items.push({ key: `gasser-${j}`, id: 'trigeminoa', mesh: m, ...STRONG.trigeminoa, tissue: 'skin' }));
  const X = { color: ARCH.iv, deep: ARCH_DEEP.iv };
  ([1, -1] as Side[]).forEach((s) => {
    const g = VAGUS_STUMP + (1 - VAGUS_STUMP) * pose.grow;
    const m = vagusAt(s, g);
    if (m) items.push({ key: `bagoa-${s}`, id: 'bagoa', ...m, ...X, tissue: 'skin' });
  });

  if (body > 0.001) {
    const add = (it: Omit<Item3, 'show'>) => items.push({ ...it, show: body });
    const CTX = { tissue: 'skin' as const, ground: true, quiet: true };
    add({ key: 'pharynx', ...P.pharynx, color: '#e2b0a0', deep: '#8c5748', ...CTX });
    add({ key: 'oesoph', id: 'hestegorria', ...P.oesoph, color: '#e2a593', deep: '#8c5748', tissue: 'skin' });
    add({ key: 'larynx', id: 'laringea', ...P.larynx, color: TISSUE.cartilage, deep: TISSUE.cartilageDeep, tissue: 'skin', opacity: 0.42 });
    add({ key: 'trachea', id: 'trakea', ...P.trachea, color: TISSUE.cartilage, deep: TISSUE.cartilageDeep, tissue: 'skin' });
    P.bronchi.forEach((m, j) => add({ key: `bronch-${j}`, id: 'trakea', ...m, color: TISSUE.cartilage, deep: TISSUE.cartilageDeep, tissue: 'skin' }));
    add({ key: 'aorta', id: 'aorta', ...P.aorta, color: TISSUE.artery, deep: TISSUE.arteryDeep, tissue: 'skin' });
    add({ key: 'brachio', id: 'aorta', ...P.brachio, color: TISSUE.artery, deep: TISSUE.arteryDeep, tissue: 'skin' });
    add({ key: 'carL', id: 'aorta', ...P.carotidL, color: TISSUE.artery, deep: TISSUE.arteryDeep, tissue: 'skin' });
    add({ key: 'subL', id: 'aorta', ...P.subL, color: TISSUE.artery, deep: TISSUE.arteryDeep, tissue: 'skin' });
    add({ key: 'heart', id: 'bihotza', ...P.heart, color: '#d46a64', deep: '#7c2d2a', tissue: 'skin' });
    P.lungs.forEach((m, j) => add({ key: `lung-${j}`, id: 'birikak', ...m, color: '#e8b1b4', deep: '#94545b', tissue: 'skin' }));
    add({ key: 'stomach', id: 'urdaila', ...P.stomach, color: '#e39a84', deep: '#8c4b38', tissue: 'skin' });
    add({ key: 'liver', id: 'gibela', ...P.liver, color: '#a55a48', deep: '#5a2a1f', tissue: 'skin' });
    add({ key: 'midgut', id: 'tarteko-hestea', ...P.midgut, color: '#eab39a', deep: '#94624b', tissue: 'skin' });
    add({ key: 'midC', id: 'tarteko-ertzatzailea', ...P.midC, color: ARCH.iv, deep: ARCH_DEEP.iv, tissue: 'skin' });
    add({ key: 'infC', id: 'beheko-ertzatzailea', ...P.infC, color: ARCH.iv, deep: ARCH_DEEP.iv, tissue: 'skin' });
    P.intrinsic.forEach((m, j) => add({ key: `intr-${j}`, id: 'laringe-barneko-muskuluak', ...m, color: ARCH.vi, deep: ARCH_DEEP.vi, tissue: 'skin' }));
    P.sup.forEach((m, j) => add({ key: `sup-${j}`, id: 'goiko-laringe-nerbioa', ...m, color: ARCH.iv, deep: ARCH_DEEP.iv, tissue: 'skin' }));
    add({ key: 'recL', id: 'laringe-atzerakaria', ...P.recL, color: ARCH.vi, deep: ARCH_DEEP.vi, tissue: 'skin' });
    add({ key: 'recR', id: 'laringe-atzerakaria', ...P.recR, color: ARCH.vi, deep: ARCH_DEEP.vi, tissue: 'skin' });
  }

  const pts: Record<string, V3> = {
    bagoa: [1.68, -4.4, -2.2],
    'goiko-laringe-nerbioa': [1.26, -6.5, -1.0],
    'laringe-atzerakaria': [1.2, -14.65, -0.2],
    'tarteko-ertzatzailea': [-0.86, -6.3, -1.0],
    'beheko-ertzatzailea': [-0.66, -7.55, -1.0],
    'laringe-barneko-muskuluak': [0.32, -8.68, 0.3],
    laringea: [-0.7, -8.7, 0.2],
    bihotza: [0.42, -17, 2.0],
    birikak: [3.6, -15.5, 1.3],
    urdaila: [1.9, -21.9, 1.1],
    gibela: [-1.8, -20.9, 1.7],
    'tarteko-hestea': [0, -25, 1.2],
    hestegorria: [0.08, -12.2, -1.0],
    trakea: [0, -12.2, 0.32],
    aorta: [1.0, -13.4, 0.3],
  };
  return { items, pts };
}
