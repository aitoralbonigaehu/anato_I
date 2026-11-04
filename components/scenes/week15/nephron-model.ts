import { add, mix3, type V3 } from '@/lib/three-d/math';
import { curve3 } from '@/lib/three-d/mesh';
import type { Item3 } from '@/lib/three-d/scene';
import { blobParts, mixHex, tubeParts } from '@/components/scenes/week10/model3d';
import { UC } from './uro-model';

/**
 * Topic 15, notes 1.3 (sistema iraizlea): how a nephron forms at the end of a collecting tubule (the notes'
 * row of figures): a cap of metanephric tissue round the branch's tip → hollowed into the metanephric vesicle
 * → a tubule with two ends: one fuses with the collecting tubule (one lumen), the other reaches the glomerulus
 * (from a branch of the renal artery) and cups it (Bowman's capsule). The tubule lengthens and coils at both
 * ends, straight in the middle: proximal convoluted tubule, Henle's loop, distal convoluted tubule. Then every
 * branch of the collecting tubule gets its own nephron, and urine runs from them into the tubule.
 *
 * Own frame: x across, y towards the kidney's surface (up), z towards the viewer. Not to scale.
 */

export interface NephronPose {
  /** The collecting tubule's branches (0..1). */
  branch: number;
  /** The metanephric cap round the tip (0..1), hollowed into a vesicle (0..1). */
  cap: number;
  vesicle: number;
  /** The vesicle lengthens into a tubule (0..1); one end fuses with the collecting tubule (0..1). */
  tubule: number;
  fuse: number;
  /** The glomerulus (0..1) and the other end cupping it: Bowman's capsule (0..1). */
  glom: number;
  bowman: number;
  /** The tubule lengthens and coils: proximal, Henle's loop, distal (0..1); its three parts coloured apart (0..1). */
  grow: number;
  parts: number;
  /** A nephron on every branch (0..1); urine running into the collecting tubule (0..1). */
  many: number;
  urine: number;
}

export const NP0: NephronPose = { branch: 1, cap: 0, vesicle: 0, tubule: 0, fuse: 0, glom: 0, bowman: 0, grow: 0, parts: 0, many: 0, urine: 0 };

export interface NephronOpts {
  dim?: { ids: readonly string[]; k: number } | null;
}

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const darker = (c: string) => mixHex(c, '#000000', 0.55);
const L = (kps: readonly V3[], n = 16) => curve3(kps as V3[], n);
const pick = (line: V3[], i: number) => line[Math.max(0, Math.min(line.length - 1, i))];
const grown = (line: V3[], g: number) => (g >= 0.999 ? line : line.slice(0, Math.max(2, Math.round(line.length * clamp01(g)))));
const ss = (a: number, b: number, x: number) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};

const PCT_C = '#f9a8d4';
const HENLE_C = '#be185d';
const DCT_C = '#ec4899';

/** The collecting tubule: up the middle, then a T into two branches; the nephron forms at the right branch's tip. */
const STEM = L([[0, -2.6, 0], [0, -0.9, 0], [0, 0.55, 0]], 12);
const TIP_R: V3 = [1.0, 1.15, 0];
const TIP_L: V3 = [-1.0, 1.15, 0];

/** One nephron at a branch tip `tip`, mirrored by `s` (1 = to the right). */
function nephronLines(tip: V3, s: number, grow: number, tub: number) {
  const X = (p: V3): V3 => [tip[0] + s * p[0], tip[1] + p[1], tip[2] + p[2]];
  // The S-shaped young tubule: from the tip (fusion end) round to the capsule end.
  const young = L([X([0.08, 0.02, 0]), X([0.5, 0.28, 0.05]), X([0.62, -0.08, 0.1]), X([0.3, -0.35, 0.05]), X([0.55, -0.7, 0])], 20);
  // The grown nephron: distal coils by the tip, Henle's loop straight down, proximal coils by the capsule.
  const caps = X([1.35, 0.35, 0.05]);
  const coil = (c: V3, r: number, turns: number, dy: number, n = 26): V3[] =>
    Array.from({ length: n }, (_, i) => {
      const a = (i / (n - 1)) * Math.PI * 2 * turns;
      return add(c, [s * r * Math.cos(a), dy * (i / (n - 1)) + r * 0.4 * Math.sin(a * 0.5), r * Math.sin(a)]);
    });
  const distal = [X([0.08, 0.02, 0]), ...coil(X([0.42, 0.05, 0.05]), 0.18, 1.5, -0.25), X([0.62, -0.45, 0])];
  const henle = L([X([0.62, -0.45, 0]), X([0.66, -1.6, 0.02]), X([0.82, -2.35, 0.04]), X([0.98, -1.6, 0.02]), X([1.02, -0.45, 0])], 24);
  const proximal = [X([1.02, -0.45, 0]), ...coil(X([1.2, -0.05, 0.05]), 0.2, 1.75, 0.3), caps];
  // Between the young and the grown shapes, each part grows out of the S.
  const g = clamp01(grow);
  const mixed = (line: V3[], from: V3[]) => line.map((p, i) => mix3(from[Math.min(from.length - 1, Math.round((i / (line.length - 1)) * (from.length - 1)))], p, g));
  const third = Math.floor(young.length / 3);
  return {
    young: grown(young, tub),
    distal: mixed(distal, young.slice(0, third + 1)),
    henle: mixed(henle, young.slice(third, 2 * third + 1)),
    proximal: mixed(proximal, young.slice(2 * third)),
    capsule: mix3(young[young.length - 1], caps, g),
  };
}

export function nephronModel(pose: NephronPose, o: NephronOpts = {}) {
  const items: Item3[] = [];
  const pts: Record<string, V3> = {};
  const dim = o.dim;
  const fade = (id: string, groups?: readonly string[]) => (!dim || dim.k <= 0.001 || dim.ids.includes(id) || (groups ?? []).some((g) => dim.ids.includes(g)) ? 1 : 1 - 0.75 * dim.k);
  const tube = (key: string, id: string, line: V3[], color: string, r: number | ((u: number) => number), op = 1, extra: Partial<Item3> = {}, sides = 12) => {
    if (op <= 0.01 || line.length < 2) return;
    items.push({ key, id, ...tubeParts(line, { radius: typeof r === 'number' ? () => r : r, ref: [0, 0, 1], sides, capStart: true, capEnd: true }), color, deep: darker(color), tissue: 'epithelium', opacity: op * fade(id, extra.groups), ...extra });
  };
  const ball = (key: string, id: string, c: V3, r: V3, color: string, op = 1, extra: Partial<Item3> = {}, rings = 12, sides = 16) => {
    if (op <= 0.01) return;
    items.push({ key, id, ...blobParts({ center: c, radii: r, rings, sides }), color, deep: darker(color), tissue: 'epithelium', opacity: op * fade(id, extra.groups), ...extra });
  };

  // The blastema all round (context, see-through).
  items.push({ key: 'blast', id: 'blastema-metanefrikoa', ...blobParts({ center: [0, 0, -0.2], radii: [3.1, 3.0, 1.2], rings: 14, sides: 20 }), color: UC.blast, deep: UC.blastDeep, tissue: 'mesenchyme', opacity: 0.1 * fade('blastema-metanefrikoa'), outline: false });
  pts['blastema-metanefrikoa'] = [1.95, 1.75, 0.6];

  // ———— the collecting tubule and its branches ————
  tube('stem', 'hodi-biltzaileak', STEM, UC.bud, 0.16, 1, { deep: UC.budDeep, groups: ['sistema-biltzailea'] });
  const br = clamp01(pose.branch);
  for (const [k, tip] of [['R', TIP_R], ['L', TIP_L]] as const) tube(`br${k}`, 'hodi-biltzaileak', grown(L([STEM[STEM.length - 1], mix3(STEM[STEM.length - 1], tip, 0.5), tip], 10), br), UC.bud, 0.12, 1, { deep: UC.budDeep, groups: ['sistema-biltzailea'] });
  pts['hodi-biltzaileak'] = [-0.18, -1.4, 0.12];

  // ———— the nephron at the right branch (and, later, one at every branch) ————
  const tips: [V3, number, number][] = [[TIP_R, 1, 1], [TIP_L, -1, ss(0, 1, pose.many)], [[0.55, -0.3, 0], 1, ss(0.2, 1, pose.many)], [[-0.55, -1.3, 0], -1, ss(0.35, 1, pose.many)]];
  tips.forEach(([tip, s, show], n) => {
    if (show <= 0.01) return;
    const main = n === 0;
    const cap = main ? clamp01(pose.cap) : 1;
    const ve = main ? clamp01(pose.vesicle) : 1;
    const tub = main ? clamp01(pose.tubule) : 1;
    const fuse = main ? clamp01(pose.fuse) : 1;
    const glom = main ? clamp01(pose.glom) : 1;
    const bow = main ? clamp01(pose.bowman) : 1;
    const grow = clamp01(pose.grow);
    const parts = clamp01(pose.parts);
    const at = add(tip, [s * 0.35, 0.05, 0]);
    if (n > 0 && main === false && n >= 2) {
      // The extra nephrons sit on side branches of the stem.
      tube(`side${n}`, 'hodi-biltzaileak', L([[0, tip[1] - 0.2, 0], mix3([0, tip[1] - 0.2, 0], tip, 0.5), tip], 6), UC.bud, 0.08, show, { deep: UC.budDeep, groups: ['sistema-biltzailea'] }, 8);
    }
    // Cap → vesicle (before the tubule).
    const ballOp = cap * (1 - ss(0.3, 0.9, tub)) * show;
    if (ballOp > 0.01) {
      ball(`cap${n}`, ve > 0.5 ? 'xixku-metanefrikoa' : 'kapsula-metanefrikoa', at, [0.36, 0.3, 0.3].map((v) => v * (0.5 + 0.5 * cap)) as unknown as V3, UC.blast, ballOp * (1 - 0.3 * ve), { deep: UC.blastDeep, thin: 0.5 * ve, groups: ['kapsula-metanefrikoa', 'xixku-metanefrikoa'] }, 12, 14);
      if (ve > 0.01) ball(`lum${n}`, 'xixku-metanefrikoa', at, [0.16 * ve, 0.13 * ve, 0.12 * ve], '#3a0a20', ballOp, { quiet: true, outline: false }, 8, 10);
      if (main) {
        pts['kapsula-metanefrikoa'] = add(at, [0.32, 0.25, 0.2]);
        pts['xixku-metanefrikoa'] = pts['kapsula-metanefrikoa'];
      }
    }
    if (tub > 0.01) {
      const ln = nephronLines(tip, s, grow, tub);
      if (grow < 0.02) tube(`yt${n}`, 'nefrona', ln.young, UC.blast, 0.085, show, { deep: UC.blastDeep, groups: ['nefrona'] }, 10);
      else {
        const pc = mixHex(UC.blast, PCT_C, parts);
        const hc = mixHex(UC.blast, HENLE_C, parts);
        const dc = mixHex(UC.blast, DCT_C, parts);
        tube(`pct${n}`, 'hodixka-bihurgunetsu-proximala', ln.proximal, pc, 0.075, show, { deep: darker(pc), groups: ['nefrona'] }, 10);
        tube(`hen${n}`, 'henle-lakioa', ln.henle, hc, 0.07, show, { deep: darker(hc), groups: ['nefrona'] }, 10);
        tube(`dct${n}`, 'hodixka-bihurgunetsu-distala', ln.distal, dc, 0.075, show, { deep: darker(dc), groups: ['nefrona'] }, 10);
        if (main) {
          pts['hodixka-bihurgunetsu-proximala'] = add(pick(ln.proximal, 10), [0.1, 0.1, 0.2]);
          pts['henle-lakioa'] = add(pick(ln.henle, 12), [0.1, 0, 0.12]);
          pts['hodixka-bihurgunetsu-distala'] = add(pick(ln.distal, 8), [0, 0.12, 0.2]);
        }
      }
      if (main) {
        pts['nefrona'] = add(grow < 0.02 ? pick(ln.young, 10) : pick(ln.henle, 6), [0.1, 0, 0.15]);
        pts['nefrona-fusioa'] = add(tip, [s * 0.05, 0.1, 0.18]);
      }
      // The fusion: the tubule's end opens into the collecting tubule (a smooth collar where the two meet).
      if (fuse > 0.01) ball(`fuse${n}`, 'nefrona', add(tip, [s * 0.08, 0.02, 0]), [0.15, 0.15, 0.15], mixHex(UC.blast, UC.bud, 0.5), fuse * show, { groups: ['nefrona'] }, 8, 10);
      // The glomerulus from a branch of the renal artery, and Bowman's capsule round it.
      const capC = add(ln.capsule ?? pick(ln.young, 99), [s * 0.12, -0.08, 0]);
      if (glom > 0.01) {
        ball(`glo${n}`, 'glomeruluak', capC, [0.2 * ss(0.4, 1, glom), 0.2 * ss(0.4, 1, glom), 0.19 * ss(0.4, 1, glom)], UC.glom, show, { tissue: 'vessel', groups: ['korpuskulua'] }, 10, 12);
        tube(`aff${n}`, 'arteriola-aferentea', grown(L([add(capC, [s * 1.2, 0.9, -0.15]), add(capC, [s * 0.6, 0.45, -0.1]), add(capC, [s * 0.1, 0.06, 0])], 8), glom), UC.aorta, 0.045, show, { tissue: 'vessel', groups: ['giltzurrun-arteriak'] }, 8);
        tube(`eff${n}`, 'arteriola-eferentea', grown(L([add(capC, [s * 0.1, -0.05, 0.02]), add(capC, [s * 0.55, -0.4, 0.1]), add(capC, [s * 1.0, -0.6, 0.2])], 8), glom), '#3b82f6', 0.04, show, { tissue: 'vessel' }, 8);
        if (main) {
          pts['glomeruluak'] = add(capC, [s * 0.18, 0.18, 0.22]);
          pts['arteriola-aferentea'] = add(capC, [s * 0.75, 0.55, 0]);
          pts['arteriola-eferentea'] = add(capC, [s * 0.65, -0.45, 0.12]);
          pts['giltzurrun-arteriak'] = add(capC, [s * 1.15, 0.86, -0.1]);
        }
      }
      if (bow > 0.01) {
        ball(`bow${n}`, 'kapsula-glomerularra', capC, [0.32 * bow, 0.32 * bow, 0.3 * bow], mixHex(UC.blast, PCT_C, parts), 0.45 * show, { thin: 0.75, groups: ['korpuskulua', 'nefrona'] }, 12, 16);
        if (main) pts['kapsula-glomerularra'] = add(capC, [s * 0.24, -0.22, 0.24]);
      }
    }
  });
  pts['korpuskulua'] = pts['kapsula-glomerularra'] ?? pts['glomeruluak'] ?? [1.4, 0.6, 0.2];

  // ———— urine: from each nephron into the collecting tubule, then down it ————
  if (pose.urine > 0.01) {
    const down = L([TIP_R, [0.4, 0.85, 0], ...STEM.slice().reverse()], 30);
    for (let k = 0; k < 6; k++) {
      const u = (pose.urine * 1.5 + k / 6) % 1;
      const p = down[Math.min(down.length - 1, Math.floor(u * (down.length - 1)))];
      items.push({ key: `drop${k}`, ...blobParts({ center: add(p, [0, 0, 0.18]), radii: [0.07, 0.07, 0.07], rings: 6, sides: 8 }), color: '#facc15', deep: '#8a6a10', tissue: 'vessel', opacity: ss(0, 0.12, pose.urine), quiet: true });
    }
  }
  return { items, pts };
}
