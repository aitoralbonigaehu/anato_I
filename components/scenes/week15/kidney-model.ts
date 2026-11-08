import { add, mix3, mul, norm, sub, type V3 } from '@/lib/three-d/math';
import { curve3 } from '@/lib/three-d/mesh';
import type { Item3 } from '@/lib/three-d/scene';
import { blobParts, mixHex } from '@/components/scenes/week10/model3d';
import { bean as beanParts, branchTree, mergeParts, pointAt, arcLengths, tipsOf, treeGeneration, vesselPieces, type Branch, type Parts } from '@/lib/three-d/organic';
import { UC } from './uro-model';

/**
 * Topic 15, notes 1.3 (sistema biltzailea): one metanephros close up, seen from the front (the embryo's left
 * kidney: its hilum, where the ureter comes in, on the viewer's left). The ureteric bud pushes into the
 * metanephric blastema, which wraps it; its tip widens (the metanephric ampulla), takes a funnel's shape (the
 * renal pelvis) and branches: 2–3 major calyces, each into minor calyces (7th week), each into long thin
 * collecting tubules (9th–10th week). Everything but the pelvis stays inside the blastema. Then the urine runs
 * the other way: collecting tubules → minor → major calyces → pelvis → ureter.
 *
 * Own frame: x towards the embryo's LEFT (lateral, for this left kidney), y cranial, z ventral.
 *
 * Built with the organic kit (lib/three-d/organic): the bud is one vessel whose end swells into the ampulla and
 * then opens into the flattened funnel of the pelvis (one shape changing, not one ball swapped for another);
 * the calyces and tubules are a branching tree grown generation by generation by arc length, each branch flared
 * into its parent, its growing tip an ampulla capped by blastema (the cap mesenchyme, where nephrons will form),
 * the minor calyces ending in cups; the blastema around it all becomes a bean with a hilum.
 */

export interface KidneyPose {
  /** The bud enters the blastema (0..1) and the blastema wraps its tip (0..1). */
  enter: number;
  wrap: number;
  /** The tip widens (ampulla, 0..1), then becomes a funnel: the renal pelvis (0..1). */
  amp: number;
  pelvis: number;
  /** Branching: major calyces (0..1), minor calyces (0..1), collecting tubules (0..1). */
  major: number;
  minor: number;
  coll: number;
  /** The blastema takes the kidney's bean shape (0..1). */
  bean: number;
  /** Urine running out (0..1 = how far the drops have gone; drawn while > 0). */
  urine: number;
}

export const KP0: KidneyPose = { enter: 0, wrap: 0, amp: 0, pelvis: 0, major: 0, minor: 0, coll: 0, bean: 0, urine: 0 };

export interface KidneyOpts {
  dim?: { ids: readonly string[]; k: number } | null;
}

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const darker = (c: string) => mixHex(c, '#000000', 0.55);
const L = (kps: readonly V3[], n = 12) => curve3(kps as V3[], n);
const ss = (a: number, b: number, x: number) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};

/** The hilum (medial: −x) and the pelvis's centre. */
const HILUM: V3 = [-0.62, -0.05, 0];
const PELVIS: V3 = [-0.25, 0, 0];
const KIDNEY_R: V3 = [1.25, 1.85, 0.72];
/** Where the funnel's wide end is (the calyces leave from it), and which way it opens. */
const FUNNEL_END: V3 = [-0.02, 0, 0];

/**
 * The branching (fixed: the same tree every frame): 3 major calyces fanning from the funnel, 3 minor calyces from
 * each, then two generations of collecting tubules (2 + 2) out to the cortex.
 */
const TREE: Branch[] = branchTree({
  from: FUNNEL_END,
  dir: [1, 0, 0],
  fan: [3, 3, 2, 2],
  len: [0.62, 0.42, 0.34, 0.3],
  radius: [0.115, 0.08, 0.036, 0.03],
  spread: [1.18, 0.62, 0.42, 0.36],
  jitter: 0.18,
  bend: 0.1,
  tilt: 0.22,
  seed: 7,
});
const parentOf = new Map<Branch, Branch>();
for (const b of TREE) for (const k of b.kids) parentOf.set(k, b);

/** From a branch back to the funnel (for the urine). */
const pathHome = (b: Branch): V3[] => {
  const out: V3[] = [];
  for (let x: Branch | undefined = b; x; x = parentOf.get(x)) out.push(...x.line.slice().reverse());
  return out;
};

export function kidneyModel(pose: KidneyPose, o: KidneyOpts = {}) {
  const items: Item3[] = [];
  const pts: Record<string, V3> = {};
  const dim = o.dim;
  const fade = (id: string, groups?: readonly string[]) => (!dim || dim.k <= 0.001 || dim.ids.includes(id) || (groups ?? []).some((g) => dim.ids.includes(g)) ? 1 : 1 - 0.75 * dim.k);
  const put = (key: string, id: string, parts: Parts | null, color: string, op = 1, extra: Partial<Item3> = {}) => {
    if (!parts || op <= 0.01) return;
    items.push({ key, id, ...parts, color, deep: darker(color), tissue: 'epithelium', opacity: op * fade(id, extra.groups), ...extra });
  };
  const ball = (key: string, id: string, c: V3, r: V3, color: string, op = 1, extra: Partial<Item3> = {}, rings = 12, sides = 16) => {
    if (op <= 0.01) return;
    items.push({ key, id: id || undefined, ...blobParts({ center: c, radii: r, rings, sides }), color, deep: darker(color), tissue: 'epithelium', opacity: op * (id ? fade(id, extra.groups) : 1), ...extra });
  };
  const BUD = { groups: ['sistema-biltzailea'], deep: UC.budDeep };

  // ———— the blastema: a dense cap that wraps the bud's tip, then the kidney's bean (its hilum on the medial side) ————
  const wrap = clamp01(pose.wrap);
  const bean = clamp01(pose.bean);
  const bc: V3 = [lerp(0.55, 0.12, wrap), lerp(0.1, 0, wrap), 0];
  const br: V3 = [lerp(0.75, KIDNEY_R[0], Math.max(wrap * 0.7, bean)), lerp(0.85, KIDNEY_R[1], Math.max(wrap * 0.6, bean)), lerp(0.6, KIDNEY_R[2], bean)];
  const blastId = bean > 0.5 ? 'giltzurruna' : 'blastema-metanefrikoa';
  put('blastema', blastId, beanParts({ center: bc, radii: br, rings: 22, sides: 30, hilum: [-1, 0, 0], dent: 0.32 * Math.max(0.35 * wrap, bean), lobes: 0.035 * bean }), bean > 0.5 ? UC.kidney : UC.blast, 0.3 + 0.06 * bean, { groups: ['blastema-metanefrikoa', 'sistema-iraizlea'], thin: 0.6, deep: UC.blastDeep });
  pts['blastema-metanefrikoa'] = add(bc, [br[0] * 0.75, br[1] * 0.45, 0.3]);
  pts['giltzurruna'] = add(bc, [br[0] * 0.8, br[1] * 0.55, 0.25]);

  // ———— the ureteric bud: one vessel, its end the ampulla, then the pelvis's flattened funnel ————
  const enter = clamp01(pose.enter);
  const amp = clamp01(pose.amp);
  const pel = clamp01(pose.pelvis);
  const tip = mix3([-1.0, -0.6, 0], add(FUNNEL_END, [-0.05, 0, 0]), enter);
  const stalk = L([[-0.75, -3.2, 0], [-0.95, -1.8, 0], [-0.9, -0.85, 0], mix3([-0.95, -0.7, 0], HILUM, enter), tip], 30);
  const urId = pel > 0.5 ? 'ureterra' : 'ureter-kimua';
  const endId = pel > 0.5 ? 'giltzurrun-pelbisa' : 'metanefros-hasikina';
  // The ampulla is a round swelling of the tip; the pelvis, a funnel opening over the last stretch (flattened
  // front to back, as the renal pelvis is).
  const [stem, end] = vesselPieces(
    stalk,
    { r0: 0.12, r1: 0.13, bulb: 1.3 * amp * (1 - pel), bulbLen: 0.42, cup: 2.0 * pel, cupLen: lerp(0.42, 1.0, pel), flat: 0.38 * pel, sides: 18, n: 44 },
    [0.78],
  );
  put('ureter', urId, stem, UC.bud, 1, { groups: ['ureter-kimua', 'sistema-biltzailea'], deep: UC.budDeep });
  pts[urId] = stalk[9];
  pts['ureter-kimua'] = stalk[9];
  pts['ureterra'] = stalk[9];
  if (amp > 0.01) {
    put('pelvis', endId, end, UC.bud, 1, { groups: ['sistema-biltzailea', 'giltzurrun-pelbisa', 'metanefros-hasikina'], deep: UC.budDeep });
    pts[endId] = add(tip, [-0.12, 0.3 + 0.2 * pel, 0.22]);
    pts['metanefros-hasikina'] = pts[endId];
    pts['giltzurrun-pelbisa'] = pts[endId];
  } else put('pelvis', urId, end, UC.bud, 1, { groups: ['ureter-kimua', 'sistema-biltzailea'], deep: UC.budDeep });

  // ———— branching: major calyces → minor calyces → collecting tubules (one item per generation) ————
  const g0 = clamp01(pose.major);
  // In one step the minor calyces branch first, then two generations of collecting tubules grow out of their ends.
  const g1 = ss(0, 0.6, pose.minor);
  const col = clamp01(pose.coll);
  const g2 = ss(0.4, 0.75, col);
  const g3 = ss(0.68, 1, col);
  const look = { ampulla: 0.7, cups: { 0: 0.45, 1: 0.9 }, flare: 0.55 };
  put('major', 'kaliza-nagusiak', treeGeneration(TREE, 0, g0, look), UC.bud, 1, BUD);
  put('minor', 'kaliza-txikiak', treeGeneration(TREE, 1, g1, look), UC.bud, 1, BUD);
  put('coll', 'hodi-biltzaileak', mergeParts([treeGeneration(TREE, 2, g2, { ...look, sides: 7 }), treeGeneration(TREE, 3, g3, { ...look, sides: 6 })]), UC.bud, 1, BUD);
  // Names at the growing tips (not where they will end).
  if (g0 > 0.04) pts['kaliza-nagusiak'] = add(tipsOf(TREE, 0, g0)[0], [0.1, 0.1, 0.18]);
  if (g1 > 0.04) pts['kaliza-txikiak'] = add(tipsOf(TREE, 1, g1)[4], [0.08, 0.08, 0.15]);
  if (g2 > 0.04) pts['hodi-biltzaileak'] = add(tipsOf(TREE, g3 > 0.3 ? 3 : 2, g3 > 0.3 ? g3 : g2)[g3 > 0.3 ? 6 : 3], [0, 0.05, 0.12]);

  // The cap mesenchyme: blastema gathered round every growing tip (where the nephrons will form), riding on the
  // tips of the newest generation and staying on the last one.
  const front = g3 > 0.01 ? 3 : g2 > 0.01 ? 2 : g1 > 0.01 ? 1 : g0 > 0.01 ? 0 : -1;
  if (front >= 0) {
    const gf = [g0, g1, g2, g3][front];
    const capR = [0.17, 0.13, 0.075, 0.065][front] * ss(0.05, 0.4, gf);
    const caps = TREE.filter((b) => b.gen === front).map((b) => {
      const s = arcLengths(b.line);
      const at = s[s.length - 1] * gf;
      const p = pointAt(b.line, s, at);
      const d = norm(sub(p, pointAt(b.line, s, Math.max(0, at - 0.05))));
      return blobParts({ center: add(p, mul(d, capR * 0.35)), radii: [capR, capR, capR], rings: 7, sides: 9 });
    });
    // Never faded with the unlit structures: what the tubules grow into stays in sight.
    const capParts = mergeParts(caps);
    if (capParts) items.push({ key: 'caps', id: 'blastema-metanefrikoa', ...capParts, color: UC.blast, deep: UC.blastDeep, tissue: 'mesenchyme', opacity: 0.62, groups: ['blastema-metanefrikoa', 'sistema-iraizlea'], thin: 0.7, outline: false });
  }

  // ———— urine: drops from the collecting tubules out through the calyces, pelvis and ureter ————
  if (pose.urine > 0.01) {
    const leaves = TREE.filter((b) => b.gen === 3);
    [leaves[1], leaves[17], leaves[30]].filter(Boolean).forEach((leaf, i) => {
      const line = L([...pathHome(leaf), PELVIS, ...stalk.slice().reverse().slice(3)], 60);
      for (let k = 0; k < 4; k++) {
        const u = (pose.urine * 1.6 + k * 0.22 + i * 0.07) % 1;
        const p = line[Math.min(line.length - 1, Math.floor(u * (line.length - 1)))];
        ball(`drop${i}${k}`, '', add(p, [0, 0, 0.1]), [0.055, 0.055, 0.055], '#facc15', ss(0, 0.15, pose.urine), { tissue: 'vessel', quiet: true }, 6, 8);
      }
    });
  }
  return { items, pts };
}
