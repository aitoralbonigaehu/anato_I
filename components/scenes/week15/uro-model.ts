import { add, mix3, type V3 } from '@/lib/three-d/math';
import { curve3 } from '@/lib/three-d/mesh';
import type { Item3 } from '@/lib/three-d/scene';
import { blobParts, mixHex, tubeParts } from '@/components/scenes/week10/model3d';
import { T } from '@/components/scenes/week10/common';
import { C } from '@/lib/sim/palette';

/**
 * Topic 15's posterior body wall seen from the front (the notes' figures of the three kidney systems and of
 * the kidneys' ascent): the intermediate mesoderm along both sides of the aorta, the pronephros at the neck,
 * the mesonephros in the thoracic–lumbar region with its duct (Wolff) down to the cloaca, the ureteric bud and
 * the metanephric blastema in the sacral region; later the definitive kidney climbing to the lumbar region,
 * the ureter lengthening, the suprarenal gland staying where it forms and the gonads going down.
 *
 * Axes as every model of topics 10–14: x towards the embryo's LEFT, y cranial, z ventral. Seen from the
 * front the embryo's left is on the viewer's right. The body is drawn straight (as the notes' figures).
 *
 * Colour = what it is, kept through topics 15 and 16 (the notes draw the mesonephric duct dark purple and the
 * nephrons pink): pronephros pink, mesonephric tubules orange, mesonephric (Wolff) duct dark purple, the
 * ureteric bud and everything it gives (ureter, pelvis, calyces, collecting tubules) lilac, the metanephric
 * blastema and the nephrons magenta-pink, endoderm yellow, intermediate mesoderm coral.
 */

export const UC = {
  inter: C.mesoIntermediate,
  interDeep: '#8a3020',
  pro: '#f472b6',
  proDeep: '#9d1f62',
  meso: '#fb923c',
  mesoDeep: '#9a4a0e',
  ridge: '#fcd2a8',
  ridgeDeep: '#a06a3a',
  wolff: '#7c3aed',
  wolffDeep: '#3b1580',
  bud: '#c4b5fd',
  budDeep: '#5b4aa8',
  blast: '#ec4899',
  blastDeep: '#8a1650',
  kidney: '#d9467a',
  kidneyDeep: '#6e1638',
  gonad: '#2dd4bf',
  /** Topic 16: the paramesonephric (Müller) duct and what it leaves (the notes draw its vestiges orange). */
  muller: '#f59e0b',
  mullerDeep: '#8a5200',
  germ: '#fde047',
  gonadDeep: '#0f6b60',
  adrenal: '#f5b041',
  adrenalDeep: '#8a5a10',
  aorta: '#dc2626',
  aortaDeep: '#7f1d1d',
  glom: '#ef4444',
  endo: T.endo,
  endoDeep: T.endoDeep,
  somite: C.mesoParaxial,
  neural: '#3a5fd9',
  skin: '#f0c9b4',
  skinDeep: '#a07060',
} as const;

export interface UroPose {
  /** Intermediate mesoderm cords along both sides (0..1). */
  im: number;
  /** Pronephros: nephrotomes → tubules (0..1), their lateral ends joined into the pronephric duct (0..1), gone cranial → caudal (0..1). */
  pro: number;
  proDuct: number;
  proGone: number;
  /** Mesonephros: the ridges and their tubules, cranial → caudal (0..1); its duct (Wolff) down to the cloaca (0..1); degenerating (0..1). */
  meso: number;
  wolff: number;
  mesoGone: number;
  /** The urogenital ridge splits: the gonadal ridge medially (0..1). */
  gonadal: number;
  /** Metanephros: the ureteric bud (0..1), the metanephric blastema (0..1), the definitive kidney (0..1). */
  bud: number;
  blast: number;
  kidney: number;
  /** The kidneys' ascent from the sacral to the lumbar region (0..1). */
  ascend: number;
  /** The suprarenal gland (0..1); the gonads going down (0..1). */
  adrenal: number;
  gonadDown: number;
  /** The cloaca → the bladder (0..1). */
  bladder: number;
  /** Topic 16: the paramesonephric (Müller) duct growing down (0..1), its caudal ends brought together at the sinus (0..1). */
  muller?: number;
  mullerJoin?: number;
  /** Topic 16: the primordial germ cells on their way from the yolk sac to the gonadal ridges (0..1). */
  germ?: number;
}

export const UP0: UroPose = { im: 1, pro: 0, proDuct: 0, proGone: 0, meso: 0, wolff: 0, mesoGone: 0, gonadal: 0, bud: 0, blast: 0, kidney: 0, ascend: 0, adrenal: 0, gonadDown: 0, bladder: 0, muller: 0, mullerJoin: 0, germ: 0 };

export interface UroOpts {
  /** The body glass, the somites, the neural tube (0..1). */
  body?: number;
  /** Hindgut, cloaca and allantois (0..1). */
  gut?: number;
  /** Glomeruli and their branches off the aorta (0..1). */
  glom?: number;
  /** The common iliac arteries (0..1). */
  iliac?: number;
  /** The yolk sac and its stalk (0..1, topic 16's germ cells). */
  yolk?: number;
  dim?: { ids: readonly string[]; k: number } | null;
}

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const darker = (c: string) => mixHex(c, '#000000', 0.55);
const L = (kps: readonly V3[], n = 20) => curve3(kps as V3[], n);
/** The wall is drawn 1.55× wider than it is (as the notes' figures): every sided point goes through X. */
const XS = 1.55;
const X = (s: number, p: V3): V3 => [s * p[0] * XS, p[1], p[2]];
const grown = (line: V3[], g: number) => (g >= 0.999 ? line : line.slice(0, Math.max(2, Math.round(line.length * clamp01(g)))));
/** 0 → 1 as x goes a → b (smooth). */
const ss = (a: number, b: number, x: number) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};

/** Levels (y) of the regions along the posterior wall. */
export const LV = { neck: 3.0, thorax: 1.0, lumbar: -1.2, sacral: -3.5, cloaca: -4.75 } as const;
const PRO_Y = Array.from({ length: 8 }, (_, i) => 3.8 - i * 0.24);
const MESO_Y = Array.from({ length: 12 }, (_, i) => 2.0 - i * 0.4);
const IM_X = 0.8;
const WOLFF_X = 1.1;

/** The mesonephric duct of one side: down the ridge's lateral edge, then medially into the cloaca. */
export const wolffLine = (s: number) => L([X(s, [WOLFF_X, 2.25, -0.42]), X(s, [WOLFF_X, 0.0, -0.4]), X(s, [WOLFF_X, -2.8, -0.38]), X(s, [0.92, -3.85, -0.12]), X(s, [0.42, -4.55, 0.15])], 40);
/** The kidney's centre during the ascent. */
export const kidneyAt = (s: number, a: number): V3 => mix3(X(s, [0.95, -3.4, -0.82]), X(s, [1.08, -0.7, -0.95]), a);

export interface UroModel {
  items: Item3[];
  pts: Record<string, V3>;
}

export function uroModel(pose: UroPose, o: UroOpts = {}): UroModel {
  const items: Item3[] = [];
  const pts: Record<string, V3> = {};
  const dim = o.dim;
  const fade = (id: string, groups?: readonly string[]) => (!dim || dim.k <= 0.001 || dim.ids.includes(id) || (groups ?? []).some((g) => dim.ids.includes(g)) ? 1 : 1 - 0.78 * dim.k);
  const tube = (key: string, id: string | undefined, line: V3[], color: string, r: number | ((u: number) => number), op = 1, extra: Partial<Item3> = {}, sides = 12) => {
    if (op <= 0.01 || line.length < 2) return;
    items.push({ key, id, ...tubeParts(line, { radius: typeof r === 'number' ? () => r : r, ref: [0, 0, 1], sides, capStart: true, capEnd: true }), color, deep: darker(color), tissue: 'epithelium', opacity: op * (id ? fade(id, extra.groups) : 1), ...extra });
  };
  const ball = (key: string, id: string | undefined, c: V3, r: V3, color: string, op = 1, extra: Partial<Item3> = {}, rings = 10, sides = 14) => {
    if (op <= 0.01) return;
    items.push({ key, id, ...blobParts({ center: c, radii: r, rings, sides }), color, deep: darker(color), tissue: 'epithelium', opacity: op * (id ? fade(id, extra.groups) : 1), ...extra });
  };

  // ———— context: the body glass, the neural tube and somites, the aorta ————
  const body = o.body ?? 1;
  if (body > 0.01) {
    ball('body', undefined, [0, -0.35, -0.25], [2.75, 5.3, 1.45], UC.skin, 0.09 * body, { tissue: 'skin', outline: false, quiet: true, deep: UC.skinDeep }, 16, 22);
    tube('neural', 'hodi-neurala', L([[0, 4.4, -1.35], [0, 0, -1.4], [0, -4.3, -1.35]], 20), UC.neural, 0.15, 0.45 * body, { quiet: true, outline: false });
    pts['hodi-neurala'] = [0.12, 3.3, -1.35];
    for (let i = 0; i < 24; i++) {
      const y = 4.05 - i * 0.37;
      for (const s of [-1, 1]) ball(`som${i}${s}`, 'somitak', X(s, [0.42, y, -1.05]), [0.19, 0.14, 0.2], UC.somite, 0.42 * body, { quiet: true, outline: false }, 8, 10);
    }
    pts['somitak'] = [0.5, 3.3, -1.0];
  }
  // The aorta down the midline, in front of the vertebral level; its two common iliac arteries at the sacral level.
  const AO = L([[0, 4.3, -0.62], [0, 1.0, -0.62], [0, -1.8, -0.64], [0, -3.15, -0.62]], 30);
  tube('aorta', 'aorta-dortsalak', AO, UC.aorta, 0.14, 1, { tissue: 'vessel' });
  pts['aorta-dortsalak'] = [0, 1.6, -0.5];
  const il = o.iliac ?? 0;
  for (const s of [-1, 1]) tube(`iliac${s}`, 'arteria-iliako-primitiboak', L([[0, -3.1, -0.62], X(s, [0.5, -3.6, -0.6]), X(s, [1.05, -4.5, -0.45]), X(s, [1.25, -5.1, -0.3])], 14), UC.aorta, 0.1, il, { tissue: 'vessel' });
  if (il > 0.01) pts['arteria-iliako-primitiboak'] = X(1, [0.62, -3.75, -0.55]);

  // ———— the hindgut, the cloaca → bladder, the allantois ————
  const gut = o.gut ?? 1;
  const bl = clamp01(pose.bladder);
  if (gut > 0.01) {
    tube('hindgut', 'atzeko-hestea', L([[0, -2.9, 0.15], [0, -3.9, 0.12], [0, -4.6, 0.0]], 12), UC.endo, 0.15, 0.55 * gut, { quiet: true });
    pts['atzeko-hestea'] = [0.12, -3.3, 0.18];
    ball('cloaca', bl > 0.5 ? 'gernu-maskuria' : 'kloaka', [0, lerp(-4.75, -4.35, bl), lerp(0.22, 0.5, bl)], [lerp(0.45, 0.42, bl), lerp(0.38, 0.55, bl), lerp(0.42, 0.38, bl)], UC.endo, 0.85 * gut, { groups: ['kloaka'], deep: UC.endoDeep });
    pts['kloaka'] = [0.42, -4.75, 0.3];
    pts['gernu-maskuria'] = [0.4, -4.3, 0.55];
    tube('allantois', 'alantoidea', L([[0, lerp(-4.5, -3.9, bl), 0.55], [0, -3.7, 1.25], [0, -2.7, 1.55]], 12), UC.endo, 0.08, 0.7 * gut, { deep: UC.endoDeep });
    pts['alantoidea'] = [0.08, -3.3, 1.45];
  }

  // ———— the intermediate mesoderm: a cord on each side of the aorta, neck to sacrum ————
  if (pose.im > 0.01)
    for (const s of [-1, 1]) tube(`im${s}`, 'bitarteko-mesodermoa', L([X(s, [IM_X, 4.1, -0.52]), X(s, [IM_X, 0, -0.52]), X(s, [IM_X, -4.2, -0.52])], 24), UC.inter, 0.12, 0.55 * pose.im, { tissue: 'mesenchyme', outline: false });
  pts['bitarteko-mesodermoa'] = X(1, [IM_X, -1.6, -0.45]);

  // ———— pronephros: 7–10 pairs of nephrotomes at the neck → tubules joined laterally into the pronephric duct ————
  const pro = clamp01(pose.pro);
  if (pro > 0.01) {
    PRO_Y.forEach((y, i) => {
      // Cranial ones go first; each tubule fades as the gone front passes its level.
      const gone = ss(i / PRO_Y.length - 0.02, (i + 1.6) / PRO_Y.length, pose.proGone);
      const op = (1 - gone) * ss(i * 0.06, i * 0.06 + 0.35, pro);
      if (op <= 0.01) return;
      const tub = ss(0.35, 0.85, pro);
      for (const s of [-1, 1]) {
        ball(`neph${i}${s}`, 'nefrotomak', X(s, [IM_X, y, -0.5]), [lerp(0.11, 0.07, tub), 0.08, 0.1], UC.pro, op, { groups: ['pronefrosa'] }, 8, 10);
        if (tub > 0.01) tube(`ptub${i}${s}`, 'hodixka-pronefrikoak', grown(L([X(s, [IM_X, y, -0.5]), X(s, [0.62, y - 0.02, -0.28]), X(s, [0.52, y - 0.04, -0.08])], 8), tub), UC.pro, 0.045, op, { groups: ['pronefrosa'] }, 8);
        if (tub > 0.01) tube(`plat${i}${s}`, 'hodixka-pronefrikoak', grown(L([X(s, [IM_X, y, -0.5]), X(s, [0.97, y, -0.48])], 6), tub), UC.pro, 0.045, op, { groups: ['pronefrosa'] }, 8);
      }
    });
    pts['nefrotomak'] = X(1, [IM_X, PRO_Y[2], -0.42]);
    pts['hodixka-pronefrikoak'] = X(1, [0.6, PRO_Y[4], -0.24]);
    pts['pronefrosa'] = X(1, [0.85, PRO_Y[3], -0.45]);
  }
  if (pose.proDuct > 0.01) {
    const gone = clamp01(pose.proGone);
    for (const s of [-1, 1]) {
      const line = L([X(s, [0.97, PRO_Y[0], -0.48]), X(s, [0.99, PRO_Y[7], -0.46]), X(s, [WOLFF_X, 2.25, -0.42])], 16);
      const keep = line.slice(Math.floor(line.length * 0.85 * gone));
      tube(`pduct${s}`, 'hodi-pronefrikoa', grown(keep, pose.proDuct), UC.pro, 0.06, 1 - 0.85 * gone, { groups: ['pronefrosa'] });
    }
    pts['hodi-pronefrikoa'] = X(1, [0.99, PRO_Y[5], -0.46]);
  }

  // ———— mesonephros: the nephrogenic cords (urogenital ridges), their tubules, glomeruli and duct ————
  const meso = clamp01(pose.meso);
  const gonadal = clamp01(pose.gonadal);
  if (meso > 0.01) {
    for (const s of [-1, 1]) {
      // The ridge bulging into the coelom; with the gonadal ridge apart it is the urinary ridge.
      const g = ss(0, 0.3, meso);
      ball(`ridge${s}`, 'mesonefrosa', X(s, [0.86, -0.4, -0.3]), [lerp(0.12, 0.34, g) * (1 - 0.15 * gonadal), lerp(1.2, 2.55, g) * (1 - 0.3 * clamp01(pose.mesoGone)), lerp(0.14, 0.4, g)], UC.ridge, 0.3 * (1 - 0.6 * clamp01(pose.mesoGone)), { groups: ['kordoi-nefrogenoa', 'gandor-urogenitala', 'gernu-gandorra'], outline: false, deep: UC.ridgeDeep, tissue: 'mesenchyme' }, 14, 18);
      MESO_Y.forEach((y, j) => {
        const show = ss(j / MESO_Y.length, (j + 2) / MESO_Y.length, meso);
        // Degeneration: the cranial tubules first; the caudal few stay (for the male genital ducts).
        const gone = j < 9 ? ss(j / 12, (j + 3) / 12, pose.mesoGone) : 0;
        const op = show * (1 - gone);
        if (op <= 0.01) return;
        const lat = X(s, [WOLFF_X - 0.04, y, -0.4]);
        const cup = X(s, [0.63, y + 0.02, -0.3]);
        const tub = L([lat, X(s, [0.98, y + 0.1, -0.2]), X(s, [0.86, y - 0.06, -0.16]), X(s, [0.76, y + 0.08, -0.28]), cup], 14);
        tube(`mtub${j}${s}`, 'hodixka-mesonefrikoak', tub, UC.meso, 0.05, op, { groups: ['mesonefrosa'] }, 8);
        // Bowman's capsule round the glomerulus (a cup), the glomerulus inside it from the aorta.
        ball(`mcap${j}${s}`, 'kapsula-glomerularra', add(cup, X(s, [-0.05, 0, 0])), [0.1, 0.1, 0.1], UC.meso, 0.55 * op, { groups: ['mesonefrosa', 'korpuskulua'], thin: 0.6 }, 8, 10);
        const gl = o.glom ?? 1;
        if (gl > 0.01) {
          ball(`mglo${j}${s}`, 'glomeruluak', add(cup, X(s, [-0.06, 0, 0])), [0.065, 0.065, 0.065], UC.glom, op * gl, { groups: ['korpuskulua'], tissue: 'vessel' }, 8, 10);
          tube(`mbr${j}${s}`, 'glomeruluak', L([[0, y, -0.6], X(s, [0.3, y, -0.45]), add(cup, X(s, [-0.1, 0, 0]))], 8), UC.aorta, 0.025, op * gl, { tissue: 'vessel', groups: ['korpuskulua'] }, 6);
        }
      });
    }
    pts['mesonefrosa'] = X(1, [1.12, -1.2, -0.12]);
    pts['kordoi-nefrogenoa'] = pts['mesonefrosa'];
    pts['gandor-urogenitala'] = X(1, [1.0, 0.3, -0.05]);
    pts['gernu-gandorra'] = X(1, [1.14, -0.9, -0.15]);
    pts['hodixka-mesonefrikoak'] = X(1, [0.86, MESO_Y[3] - 0.05, -0.15]);
    pts['kapsula-glomerularra'] = X(1, [0.6, MESO_Y[5], -0.22]);
    pts['glomeruluak'] = X(1, [0.4, MESO_Y[6], -0.42]);
    pts['korpuskulua'] = pts['kapsula-glomerularra'];
  }
  if (pose.wolff > 0.01)
    for (const s of [-1, 1]) {
      const line = wolffLine(s);
      tube(`wolff${s}`, 'hodi-mesonefrikoa', grown(line, pose.wolff), UC.wolff, 0.065, 1, { deep: UC.wolffDeep });
      if (s > 0) pts['hodi-mesonefrikoa'] = line[22];
    }

  // The gonadal ridge: medial to the urinary ridge (the genital part of the urogenital ridge); later the gonads go down.
  if (gonadal > 0.01) {
    const down = clamp01(pose.gonadDown);
    for (const s of [-1, 1]) {
      const c = mix3(X(s, [0.5, -0.5, -0.12]), X(s, [0.62, -3.7, -0.05]), down);
      ball(`gonad${s}`, down > 0.3 ? 'gonadak' : 'gonada-gandorra', c, [0.15 * gonadal, lerp(1.05, 0.42, down) * gonadal, 0.2 * gonadal], UC.gonad, 0.95, { groups: ['gonadak', 'gonada-gandorra', 'gandor-urogenitala'], deep: UC.gonadDeep });
      if (s > 0) {
        pts['gonada-gandorra'] = add(c, [0.02, 0.2, 0.18]);
        pts['gonadak'] = add(c, [0.04, 0, 0.18]);
      }
    }
  }

  // ———— metanephros: the ureteric bud from the mesonephric duct, the metanephric blastema capping it ————
  const asc = clamp01(pose.ascend);
  const kid = clamp01(pose.kidney);
  for (const s of [-1, 1]) {
    const K = kidneyAt(s, asc);
    const root = X(s, [0.84, -3.95, -0.16]);
    if (pose.bud > 0.01) {
      // Before the kidney: the bud from the duct up into the blastema. After: the ureter from the hilum down to the bladder.
      const hilum = add(K, X(s, [-0.28, -0.05, 0.08]));
      const end = mix3(root, X(s, [0.32, -4.15, 0.32]), bl);
      const budLine = L([root, X(s, [0.9, -3.75, -0.5]), add(kidneyAt(s, 0), X(s, [-0.05, -0.1, 0.05]))], 12);
      const ureter = L([hilum, add(mix3(hilum, end, 0.5), X(s, [0.05, 0, -0.1])), end], 20);
      const line = kid < 0.5 ? grown(budLine, pose.bud) : ureter;
      const id = kid < 0.5 ? 'ureter-kimua' : 'ureterra';
      tube(`bud${s}`, id, line, UC.bud, kid < 0.5 ? 0.06 : 0.055, 1, { groups: ['ureter-kimua', 'sistema-biltzailea'], deep: UC.budDeep });
      if (s > 0) {
        pts['ureter-kimua'] = budLine[6];
        pts['ureterra'] = ureter[12];
      }
    }
    if (pose.blast > 0.01 || kid > 0.01) {
      // The blastema cap, then the bean-shaped kidney (its size grows with the nephrons).
      const r: V3 = [lerp(0.24, 0.32, kid), lerp(0.24, 0.56, kid), lerp(0.22, 0.25, kid)];
      const id = kid > 0.5 ? 'giltzurruna' : 'blastema-metanefrikoa';
      ball(`kid${s}`, id, K, r.map((v) => v * Math.max(0.3, clamp01(pose.blast + kid))) as unknown as V3, kid > 0.5 ? UC.kidney : UC.blast, 0.92, { groups: ['metanefrosa', 'blastema-metanefrikoa'], deep: kid > 0.5 ? UC.kidneyDeep : UC.blastDeep }, 14, 18);
      if (s > 0) {
        pts['blastema-metanefrikoa'] = add(K, [0.22, 0.05, 0.12]);
        pts['giltzurruna'] = add(K, [0.25, 0.15, 0.1]);
        pts['metanefrosa'] = pts['blastema-metanefrikoa'];
      }
      // Its artery from the aorta at the kidney's level of the moment (new ones as it climbs).
      if (kid > 0.5) {
        const ay = K[1] + 0.05;
        tube(`renal${s}`, 'giltzurrun-arteriak', L([[0, ay, -0.62], X(s, [0.45, ay, -0.75]), add(K, X(s, [-0.24, 0.05, 0.02]))], 10), UC.aorta, 0.035, ss(0.5, 0.8, kid), { tissue: 'vessel' }, 8);
        if (s > 0) pts['giltzurrun-arteriak'] = X(s, [0.48, ay, -0.72]);
      }
    }
    // The suprarenal gland: where it forms (it does not move), the kidney climbs up under it.
    if (pose.adrenal > 0.01) {
      const A = X(s, [0.98, 0.15, -0.9]);
      ball(`adr${s}`, 'giltzurrun-gaineko-guruinak', A, [0.27 * pose.adrenal, 0.22 * pose.adrenal, 0.2 * pose.adrenal], UC.adrenal, 0.95, { deep: UC.adrenalDeep });
      if (s > 0) pts['giltzurrun-gaineko-guruinak'] = add(A, [0.22, 0.12, 0.1]);
    }
  }
  // ———— topic 16: the paramesonephric (Müller) duct, lateral to the mesonephric duct, then across it to the midline ————
  const mu = clamp01(pose.muller ?? 0);
  if (mu > 0.01)
    for (const s of [-1, 1]) {
      const line = mullerLine(s, clamp01(pose.mullerJoin ?? 0));
      tube(`muller${s}`, 'hodi-paramesonefrikoa', grown(line, mu), UC.muller, 0.06, 1, { deep: UC.mullerDeep });
      // Its cranial end opens into the coelom: a small funnel.
      ball(`mfun${s}`, 'hodi-paramesonefrikoa', line[0], [0.11, 0.09, 0.11], UC.muller, ss(0, 0.2, mu), { deep: UC.mullerDeep, thin: 0.4 }, 8, 10);
      if (s > 0) {
        pts['hodi-paramesonefrikoa'] = line[10];
        pts['muller-sarrera'] = add(line[0], [0.12, 0.12, 0.1]);
      }
    }
  const tub = ss(0.4, 1, pose.mullerJoin ?? 0) * ss(0.6, 1, mu);
  if (tub > 0.01) {
    // The paramesonephric tubercle: the small elevation on the sinus's back wall where the two ducts end together.
    ball('mtub', 'tuberkulu-paramesonefrikoa', [0, -4.38, 0.02], [0.2 * tub, 0.1 * tub, 0.12 * tub], mixHex(UC.endo, UC.muller, 0.35), 1, { deep: UC.endoDeep }, 8, 12);
    pts['tuberkulu-paramesonefrikoa'] = [0.22, -4.42, 0.12];
  }

  // ———— topic 16: the yolk sac (ventral, its stalk to the gut) and the germ cells' way to the gonadal ridges ————
  const yolk = o.yolk ?? 0;
  if (yolk > 0.01) {
    tube('yolkstalk', 'hodi-onfalomesenterikoa', L([[0, -2.1, 0.5], [0, -2.5, 1.3], [0, -2.9, 1.9]], 10), UC.endo, 0.07, 0.7 * yolk, { deep: UC.endoDeep });
    ball('yolk', 'bitelo-zaku-sekundarioa', [0, -3.35, 2.35], [0.62, 0.6, 0.6], UC.endo, 0.55 * yolk, { deep: UC.endoDeep, outline: false });
    pts['bitelo-zaku-sekundarioa'] = [0.5, -3.1, 2.6];
    pts['hodi-onfalomesenterikoa'] = [0.1, -2.5, 1.3];
  }
  const germ = pose.germ ?? 0;
  if (germ > 0.001)
    for (const s of [-1, 1]) {
      const path = germPath(s);
      for (let k = 0; k < 7; k++) {
        // Each cell starts a little later; they bunch at the ridge as they arrive.
        const u = clamp01(germ * 1.35 - k * 0.05);
        const p = path[Math.min(path.length - 1, Math.round(u * (path.length - 1)))];
        const j: V3 = [Math.sin(k * 2.3 + s) * 0.06, Math.cos(k * 1.9) * 0.07, Math.sin(k * 3.1) * 0.05];
        ball(`germ${s}${k}`, 'hasierako-hozi-zelulak', add(p, j), [0.075, 0.075, 0.075], UC.germ, 1, { tissue: 'vessel' }, 6, 8);
      }
      if (s > 0) {
        const u = clamp01(germ * 1.35 - 0.15);
        pts['hasierako-hozi-zelulak'] = add(path[Math.min(path.length - 1, Math.round(u * (path.length - 1)))], [0.1, 0.1, 0.12]);
      }
    }
  return { items, pts };
}

/** The paramesonephric duct of one side: from its coelomic opening at the top of the mesonephros, down lateral to the
 * mesonephric duct, across it ventrally and medially to the sinus's back wall (`join`: the two ends side by side). */
export const mullerLine = (s: number, join: number) =>
  L([X(s, [1.3, 2.45, -0.18]), X(s, [1.3, 0.2, -0.15]), X(s, [1.24, -2.4, -0.1]), X(s, [1.0, -3.45, 0.12]), X(s, [lerp(0.4, 0.12, join), -4.05, 0.12]), X(s, [lerp(0.25, 0.05, join), -4.32, 0.04])], 40);

/** The germ cells' way: the yolk sac's wall near the allantois → the hindgut's wall → the dorsal mesentery → the gonadal ridge. */
const germPath = (s: number) => L([[0, -3.0, 1.85], [0, -3.75, 0.85], [0, -3.85, 0.32], [0, -3.2, 0.05], [0, -2.0, -0.2], [0, -1.2, -0.38], X(s, [0.25, -0.75, -0.3]), X(s, [0.5, -0.55, -0.12])], 40);
