import { add, mix3, mul, norm, sub, type V3 } from '@/lib/three-d/math';
import { curve3 } from '@/lib/three-d/mesh';
import { cupShell, mergeParts, plate, resample, vessel, vesselPieces, type Parts, type VesselOptions } from '@/lib/three-d/organic';
import type { Item3 } from '@/lib/three-d/scene';
import { blobParts, mixHex } from '@/components/scenes/week10/model3d';
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
 *
 * Built to the quality bar (docs/quality/3d-quality-bar.md): everything lies on a cut face of the cortex; the
 * collecting tubule tapers, its branches flare out of it and swell into ampullae; the cap is a cup of tissue
 * over the ampulla; and the nephron is ONE profiled vessel whose centre line bends continuously from the
 * vesicle to the comma, the S-shaped body and the grown nephron, its far end cupping the glomerulus (a
 * double-walled cup) and its near end flaring into the collecting tubule as they fuse.
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
const ss = (a: number, b: number, x: number) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};

const PCT_C = '#f9a8d4';
const HENLE_C = '#be185d';
const DCT_C = '#ec4899';

// ———— the nephron's centre line, in a site's own frame (the branch tip at the origin, mirrored by the site) ————

/** Points along each part of the grown nephron (so its parts can be told apart by index). */
const ND = 20, NH = 22, NP = 22, N = ND + NH + NP;

const arc = (c: V3, r: number, a0: number, a1: number, n: number, dz = 0.05): V3[] =>
  Array.from({ length: n }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / (n - 1);
    return [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a), c[2] + dz * Math.sin((Math.PI * i) / (n - 1))];
  });
const coil = (c: V3, r: number, turns: number, dy: number, n = 26): V3[] =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / (n - 1)) * Math.PI * 2 * turns;
    return add(c, [r * Math.cos(a), dy * (i / (n - 1)) + r * 0.4 * Math.sin(a * 0.5), r * Math.sin(a)]);
  });

/** The vesicle (a ring of epithelium round a lumen, almost closed), beside and below the ampulla. */
const VES_C: V3 = [0.4, -0.22, 0.04];
const VES_R = 0.14;
const K_VESICLE = resample(arc(VES_C, VES_R, 2.6, 2.6 - Math.PI * 1.86, 40, 0.03), N);
/** The comma-shaped body. */
const K_COMMA = resample(arc([0.5, -0.34, 0], 0.25, 2.45, 2.45 - Math.PI * 1.3, 32), N);
/** The S-shaped body: the upper limb at the ampulla, the lower limb (where the cup forms) below. */
const K_S = resample(L([[0.12, -0.05, 0], [0.45, 0.02, 0.04], [0.64, -0.22, 0.06], [0.42, -0.5, 0.04], [0.3, -0.76, 0.02], [0.52, -0.97, 0], [0.84, -0.92, 0]], 40), N);
/** The grown nephron: distal coils by the ampulla, Henle's loop straight down and up, proximal coils, the capsule. */
const K_GROWN = [
  ...resample([[0.12, -0.05, 0], ...coil([0.42, 0.02, 0.05], 0.18, 1.5, -0.25), [0.62, -0.45, 0]], ND),
  ...resample(L([[0.62, -0.45, 0], [0.66, -1.6, 0.02], [0.82, -2.35, 0.04], [0.98, -1.6, 0.02], [1.02, -0.45, 0]], 30), NH),
  ...resample([[1.02, -0.45, 0], ...coil([1.2, -0.05, 0.05], 0.2, 1.75, 0.3), [1.32, 0.3, 0.04], [1.36, 0.42, 0.04]], NP),
];

/** The centre line at a stage of development: vesicle → comma → S (`tub`), then the grown shape (`grow`). */
function centreLine(tub: number, grow: number, fuse: number): V3[] {
  const mixL = (a: V3[], b: V3[], k: number) => a.map((p, i) => mix3(p, b[i], k));
  let line = tub < 0.5 ? mixL(K_VESICLE, K_COMMA, ss(0, 0.5, tub)) : mixL(K_COMMA, K_S, ss(0.5, 1, tub));
  if (grow > 0.001) line = mixL(K_S, K_GROWN, ss(0, 1, grow));
  // Fusing: the near end pushes into the ampulla, and the lumens join.
  if (fuse > 0.001) {
    const d = sub([-0.04, 0.0, 0], line[0]);
    line = line.map((p, i) => (i < 8 ? add(p, mul(d, fuse * (1 - i / 8) ** 2)) : p));
  }
  return line;
}

interface Site {
  tip: V3;
  /** 1: the nephron to the right of its tip; −1: mirrored. */
  s: number;
  /** Size of the nephron (the later ones are drawn a little smaller). */
  sc: number;
  /** The branch it ends (from where on the stem, through which point). */
  branch: V3[];
}

/** The collecting tubule: up the middle to a T; the first nephron forms at the right branch's tip. */
const J: V3 = [0, 0.55, 0];
const STEM = L([[0, -3.7, 0], [0, -1.5, 0], [0, -0.2, 0], J], 16);
const SITES: Site[] = [
  { tip: [1.0, 1.15, 0], s: 1, sc: 1, branch: L([[0, 0.4, 0], [0.45, 0.82, 0], [1.0, 1.15, 0]], 12) },
  { tip: [-1.0, 1.15, 0], s: -1, sc: 1, branch: L([[0, 0.4, 0], [-0.45, 0.82, 0], [-1.0, 1.15, 0]], 12) },
  { tip: [0.68, -1.15, 0.05], s: 1, sc: 0.78, branch: L([[0, -1.65, 0], [0.32, -1.4, 0.03], [0.68, -1.15, 0.05]], 10) },
  { tip: [-0.68, -1.75, 0.05], s: -1, sc: 0.78, branch: L([[0, -2.25, 0], [-0.32, -2.0, 0.03], [-0.68, -1.75, 0.05]], 10) },
];

/** The section of cortex the whole scene lies on (its cut face towards the viewer). */
const SECTION = Array.from({ length: 56 }, (_, i): [number, number] => {
  const a = (i / 56) * Math.PI * 2;
  // A rounded rectangle (superellipse) round the scene.
  const c = Math.cos(a), sn = Math.sin(a);
  return [0.15 + 3.3 * Math.sign(c) * Math.abs(c) ** 0.4, -0.75 + 3.35 * Math.sign(sn) * Math.abs(sn) ** 0.4];
});

export function nephronModel(pose: NephronPose, o: NephronOpts = {}) {
  const items: Item3[] = [];
  const pts: Record<string, V3> = {};
  const dim = o.dim;
  const fade = (id: string, groups?: readonly string[]) => (!dim || dim.k <= 0.001 || dim.ids.includes(id) || (groups ?? []).some((g) => dim.ids.includes(g)) ? 1 : 1 - 0.75 * dim.k);
  const put = (key: string, id: string | undefined, parts: Parts | null, color: string, op = 1, extra: Partial<Item3> = {}) => {
    if (!parts || op <= 0.01) return;
    items.push({ key, id, ...parts, color, deep: darker(color), tissue: 'epithelium', opacity: op * (id ? fade(id, extra.groups) : 1), ...extra });
  };
  const vess = (key: string, id: string, line: V3[], color: string, prof: VesselOptions, g = 1, op = 1, extra: Partial<Item3> = {}) =>
    put(key, id, vessel(line, { ref: [0, 0, 1], ...prof }, g), color, op, extra);

  // ———— the ground: a cut face of the cortex (the metanephric tissue the nephrons form in) ————
  items.push({ key: 'section', id: 'blastema-metanefrikoa', ...plate('nephron-cortex-v1', SECTION, -0.55, -0.8), color: UC.wallCut, deep: UC.wallCutDeep, tissue: 'mesenchyme', opacity: 1, quiet: true, ground: true });
  pts['blastema-metanefrikoa'] = [1.75, 2.15, -0.5];

  // ———— the collecting tubule: a tapering stem; its branches flare out of it and swell into ampullae ————
  const BUD = { color: UC.bud, extra: { deep: UC.budDeep, groups: ['sistema-biltzailea'] } };
  vess('stem', 'hodi-biltzaileak', STEM, BUD.color, { r0: 0.19, r1: 0.15, sides: 14, n: 24 }, 1, 1, BUD.extra);
  pts['hodi-biltzaileak'] = [-0.2, -0.35, 0.14];

  const fuseA = clamp01(pose.fuse);
  SITES.forEach((site, n) => {
    const main = n === 0;
    // Each later nephron goes through the same development, one after another, as `many` runs.
    const q = main ? 1 : ss([0, 0, 0.15, 0.35][n], [0, 0.6, 0.75, 0.95][n], pose.many);
    const branchG = n < 2 ? clamp01(pose.branch) : ss(0, 0.3, q);
    const cap = main ? clamp01(pose.cap) : ss(0.05, 0.3, q);
    const ve = main ? clamp01(pose.vesicle) : ss(0.2, 0.4, q);
    const tub = main ? clamp01(pose.tubule) : ss(0.35, 0.6, q);
    const fuse = main ? fuseA : ss(0.5, 0.65, q);
    const glom = main ? clamp01(pose.glom) : ss(0.55, 0.8, q);
    const bow = main ? clamp01(pose.bowman) : ss(0.55, 0.8, q);
    const grow = main ? clamp01(pose.grow) : ss(0.7, 1, q) * clamp01(pose.grow);
    const parts = clamp01(pose.parts);
    if (n >= 2 && branchG <= 0.01) return;
    const X = (p: V3): V3 => [site.tip[0] + site.s * site.sc * p[0], site.tip[1] + site.sc * p[1], site.tip[2] + site.sc * p[2]];
    const dir = norm(sub(site.tip, site.branch[site.branch.length - 3]));

    // The branch, flared out of the stem, its tip an ampulla (it narrows as the nephron opens into it).
    vess(`br${n}`, 'hodi-biltzaileak', site.branch, BUD.color, { r0: 0.13 * (n < 2 ? 1 : 0.85), r1: 0.115 * (n < 2 ? 1 : 0.85), flare: 0.45, flareLen: 0.25, bulb: 0.55 * (1 - 0.55 * fuse), bulbLen: 0.32, sides: 12, n: 18 }, branchG, 1, BUD.extra);
    if (q <= 0.01) return;

    // The cap: a cup of metanephric tissue over the ampulla (it gathers, and stays to make the next nephrons).
    if (cap > 0.01) {
      const R = 0.4 * site.sc * (0.45 + 0.55 * cap);
      put(`cap${n}`, 'kapsula-metanefrikoa', cupShell({ center: site.tip, axis: mul(dir, -1), radius: R, thick: 0.15 * site.sc, wrap: 0.42 + 0.14 * cap }), UC.blast, (0.35 + 0.5 * cap) * (1 - 0.35 * ve), { deep: UC.blastDeep, tissue: 'mesenchyme', groups: ['kapsula-metanefrikoa'] });
      if (main) pts['kapsula-metanefrikoa'] = add(site.tip, add(mul(dir, R * 0.9), [0.12, 0.15, 0.22]));
    }
    if (ve <= 0.01) return;

    // The nephron: one vessel along a centre line that bends from vesicle to grown nephron.
    const line = centreLine(tub, grow, fuse).map(X);
    // The vesicle pinches off the cap: it starts in the cap and settles beside the ampulla.
    const pinch = 1 - ss(0, 0.7, ve);
    const fromCap = sub(add(site.tip, mul(dir, 0.15)), X(VES_C));
    const drawn = pinch > 0.001 ? line.map((p) => add(p, mul(fromCap, pinch))) : line;
    const size = ss(0, 0.6, ve);
    // Compact at first (the wall fills the ring), then the lumen opens, then the wall thins as it lengthens.
    const r = site.sc * lerp(lerp(VES_R, 0.1, ss(0.45, 1, ve)), 0.085, ss(0, 0.45, tub)) * (0.35 + 0.65 * size);
    const tone = (c: string) => mixHex(UC.blast, c, parts);
    const ids = tub < 0.08 ? (['xixku-metanefrikoa', 'xixku-metanefrikoa', 'xixku-metanefrikoa'] as const) : grow < 0.05 ? (['nefrona', 'nefrona', 'nefrona'] as const) : (['hodixka-bihurgunetsu-distala', 'henle-lakioa', 'hodixka-bihurgunetsu-proximala'] as const);
    // The parts by index (ND, NH, NP points of the line), as shares of its length.
    const sArc = (() => {
      const out = [0];
      for (let i = 1; i < drawn.length; i++) out.push(out[i - 1] + Math.hypot(...sub(drawn[i], drawn[i - 1])));
      return out.map((x) => x / out[out.length - 1]);
    })();
    const prof: VesselOptions = { r0: r, r1: r, flare: 0.9 * fuse, flareLen: 0.22 * site.sc, ref: [0, 0, 1], sides: 12, n: 96 };
    // One piece while it is one tissue; three (distal, Henle, proximal) once they are told apart.
    const pieces = grow < 0.05 ? [vessel(drawn, prof)] : vesselPieces(drawn, prof, [sArc[ND - 1], sArc[ND + NH - 1]]);
    const colors = [tone(DCT_C), tone(HENLE_C), tone(PCT_C)];
    pieces.forEach((pc, k) => put(`neph${n}.${k}`, ids[k], pc, colors[k], 1, { deep: darker(colors[k]), thin: 0.35 * (1 - ss(0, 0.5, tub)), groups: ['nefrona', 'xixku-metanefrikoa'] }));
    if (main) {
      const at = (i: number, off: V3): V3 => add(drawn[Math.min(drawn.length - 1, i)], off);
      pts['xixku-metanefrikoa'] = at(N >> 1, [0.15, 0.18, 0.22]);
      pts['nefrona'] = grow < 0.05 ? at(Math.round(N * 0.55), [0.12, -0.05, 0.16]) : at(ND + 6, [0.1, 0, 0.15]);
      pts['nefrona-fusioa'] = X([0.02, 0.12, 0.2]);
      pts['hodixka-bihurgunetsu-distala'] = at(8, [0, 0.12, 0.2]);
      pts['henle-lakioa'] = at(ND + 12, [0.1, 0, 0.12]);
      pts['hodixka-bihurgunetsu-proximala'] = at(ND + NH + 10, [0.1, 0.1, 0.2]);
    }

    // The far end cups the glomerulus: a double-walled cup (Bowman's capsule) on the vessel's end, its mouth
    // turned to the arterioles (the vascular pole).
    const end = drawn[drawn.length - 1];
    // The cup's mouth turned partly to the viewer, so the glomerulus shows inside it.
    const axis = norm(add(norm(sub(end, drawn[drawn.length - 4])), [0, 0, 0.9]));
    const Rc = 0.3 * site.sc;
    const C = add(end, mul(axis, Rc * 0.62));
    if (bow > 0.01) {
      const cc = tone(PCT_C);
      put(`bow${n}`, 'kapsula-glomerularra', cupShell({ center: C, axis, radius: Rc * (0.55 + 0.45 * bow), thick: 0.085 * site.sc, wrap: 0.15 + 0.6 * bow }), cc, 1, { deep: darker(cc), groups: ['korpuskulua', 'nefrona'] });
      if (main) pts['kapsula-glomerularra'] = add(C, add(mul(axis, -Rc * 0.7), [0.05, -0.2, 0.24]));
    }
    // The glomerulus: a tuft of capillary loops from a branch of the renal artery, pushing into the cup.
    if (glom > 0.01) {
      const g = ss(0.25, 1, glom);
      const side = norm([-axis[1], axis[0], 0.3]);
      const up = norm([axis[1] * 0.3, -axis[0] * 0.3, 1]);
      const lobes = [[0, 0, 0], [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0.6, 0.6, 0.5], [-0.6, -0.6, 0.5]].map(([a, b, c]) =>
        blobParts({ center: add(add(C, mul(axis, 0.04 + 0.08 * c)), add(mul(side, a * 0.1 * site.sc * g), mul(up, b * 0.1 * site.sc * g))), radii: [0.13 * site.sc * g, 0.12 * site.sc * g, 0.12 * site.sc * g], rings: 8, sides: 10 }),
      );
      put(`glo${n}`, 'glomeruluak', mergeParts(lobes), UC.glom, 1, { deep: UC.aortaDeep, tissue: 'vessel', groups: ['korpuskulua'] });
      const pole = add(C, mul(axis, Rc * 0.9));
      const affLine = L([add(pole, add(mul(axis, 0.7 * site.sc), mul(side, 0.3 * site.sc))), add(pole, add(mul(axis, 0.4 * site.sc), mul(side, 0.12 * site.sc))), add(C, mul(side, 0.04))], 10);
      const effLine = L([add(C, mul(side, -0.04)), add(pole, add(mul(axis, 0.4 * site.sc), mul(side, -0.14 * site.sc))), add(pole, add(mul(axis, 0.65 * site.sc), mul(side, -0.38 * site.sc)))], 10);
      vess(`aff${n}`, 'arteriola-aferentea', affLine, UC.aorta, { r0: 0.042 * site.sc, r1: 0.036 * site.sc, sides: 8, n: 12 }, glom, 1, { tissue: 'vessel', deep: UC.aortaDeep, groups: ['giltzurrun-arteriak'] });
      vess(`eff${n}`, 'arteriola-eferentea', effLine, '#3b82f6', { r0: 0.032 * site.sc, r1: 0.036 * site.sc, sides: 8, n: 12 }, ss(0.3, 1, glom), 1, { tissue: 'vessel' });
      if (main) {
        pts['glomeruluak'] = add(C, add(mul(side, 0.16), [0, 0.12, 0.22]));
        pts['arteriola-aferentea'] = add(affLine[5], [0.05, 0.05, 0.08]);
        pts['arteriola-eferentea'] = add(effLine[5], [0.05, -0.05, 0.08]);
        pts['giltzurrun-arteriak'] = affLine[0];
      }
    }
  });
  pts['korpuskulua'] = pts['kapsula-glomerularra'] ?? pts['glomeruluak'] ?? [1.4, 0.6, 0.2];

  // ———— urine: from the first nephron's capsule along its tubule into the collecting tubule, then down it ————
  if (pose.urine > 0.01) {
    const site = SITES[0];
    const X = (p: V3): V3 => [site.tip[0] + p[0], site.tip[1] + p[1], site.tip[2] + p[2]];
    const path = resample([...centreLine(1, clamp01(pose.grow), 1).map(X).reverse(), ...site.branch.slice().reverse(), ...STEM.slice().reverse()], 120);
    for (let k = 0; k < 8; k++) {
      const u = (pose.urine * 1.5 + k / 8) % 1;
      const p = path[Math.min(path.length - 1, Math.floor(u * (path.length - 1)))];
      // Lit with the tubules they run in (so they keep their colour when the rest recedes).
      items.push({ key: `drop${k}`, id: 'hodi-biltzaileak', ...blobParts({ center: add(p, [0, 0, 0.17]), radii: [0.07, 0.07, 0.07], rings: 6, sides: 8 }), color: '#facc15', deep: '#8a6a10', tissue: 'vessel', opacity: ss(0, 0.12, pose.urine), quiet: true, groups: ['nefrona'] });
    }
  }
  return { items, pts };
}
