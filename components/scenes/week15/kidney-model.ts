import { add, mix3, type V3 } from '@/lib/three-d/math';
import { curve3 } from '@/lib/three-d/mesh';
import type { Item3 } from '@/lib/three-d/scene';
import { blobParts, mixHex, tubeParts } from '@/components/scenes/week10/model3d';
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
const grown = (line: V3[], g: number) => (g >= 0.999 ? line : line.slice(0, Math.max(2, Math.round(line.length * clamp01(g)))));
const ss = (a: number, b: number, x: number) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};

/** The hilum (medial: −x) and the pelvis's centre. */
const HILUM: V3 = [-0.62, -0.05, 0];
const PELVIS: V3 = [-0.25, 0, 0];
/** The three major calyces' ends (cranial, middle, caudal). */
const MAJOR: V3[] = [
  [0.15, 0.95, 0.02],
  [0.42, 0.02, 0.04],
  [0.15, -0.95, 0.0],
];
/** Each major calyx's minor calyces (directions, fanning out to the cortex). */
const MINOR_DIRS: [number, number][][] = [
  [[-0.35, 1.45], [0.25, 1.4], [0.7, 1.05]],
  [[0.95, 0.55], [1.05, -0.05], [0.95, -0.6]],
  [[0.7, -1.05], [0.25, -1.4], [-0.35, -1.45]],
];
const KIDNEY_R: V3 = [1.25, 1.85, 0.72];

export function kidneyModel(pose: KidneyPose, o: KidneyOpts = {}) {
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
    items.push({ key, id: id || undefined, ...blobParts({ center: c, radii: r, rings, sides }), color, deep: darker(color), tissue: 'epithelium', opacity: op * (id ? fade(id, extra.groups) : 1), ...extra });
  };

  // ———— the blastema: a dense cap that wraps the bud's tip, then the kidney's bean ————
  const wrap = clamp01(pose.wrap);
  const bean = clamp01(pose.bean);
  const bc: V3 = [lerp(0.55, 0.12, wrap), lerp(0.1, 0, wrap), 0];
  const br: V3 = [lerp(0.75, KIDNEY_R[0], Math.max(wrap * 0.7, bean)), lerp(0.85, KIDNEY_R[1], Math.max(wrap * 0.6, bean)), lerp(0.6, KIDNEY_R[2], bean)];
  ball('blastema', bean > 0.5 ? 'giltzurruna' : 'blastema-metanefrikoa', bc, br, bean > 0.5 ? UC.kidney : UC.blast, 0.28 + 0.06 * bean, { groups: ['blastema-metanefrikoa', 'sistema-iraizlea'], outline: false, thin: 0.5, deep: UC.blastDeep }, 18, 24);
  pts['blastema-metanefrikoa'] = add(bc, [br[0] * 0.75, br[1] * 0.45, 0.3]);
  pts['giltzurruna'] = add(bc, [br[0] * 0.8, br[1] * 0.55, 0.25]);

  // ———— the ureteric bud / ureter, up into the hilum ————
  const enter = clamp01(pose.enter);
  const tip = mix3([-1.0, -0.6, 0], PELVIS, enter);
  const stalk = L([[-0.75, -3.2, 0], [-0.95, -1.8, 0], [-0.9, -0.85, 0], mix3([-0.95, -0.7, 0], HILUM, enter), tip], 18);
  const urId = pose.pelvis > 0.5 ? 'ureterra' : 'ureter-kimua';
  tube('ureter', urId, stalk, UC.bud, 0.13, 1, { groups: ['ureter-kimua', 'sistema-biltzailea'], deep: UC.budDeep });
  pts[urId] = stalk[5];
  pts['ureter-kimua'] = stalk[5];
  pts['ureterra'] = stalk[5];

  // The tip: ampulla → funnel (the pelvis), the only part left outside the blastema.
  const amp = clamp01(pose.amp);
  const pel = clamp01(pose.pelvis);
  if (amp > 0.01) {
    const id = pel > 0.5 ? 'giltzurrun-pelbisa' : 'metanefros-hasikina';
    ball('pelvis', id, add(tip, [0.05 * pel, 0, 0]), [lerp(0.15, 0.32, amp) + 0.1 * pel, lerp(0.15, 0.3, amp) + 0.22 * pel, lerp(0.15, 0.22, amp)], UC.bud, 1, { groups: ['sistema-biltzailea', 'giltzurrun-pelbisa', 'metanefros-hasikina'], deep: UC.budDeep });
    pts[id] = add(tip, [0.0, 0.35 + 0.15 * pel, 0.25]);
    pts['metanefros-hasikina'] = pts[id];
    pts['giltzurrun-pelbisa'] = pts[id];
  }

  // ———— branching: major calyces → minor calyces → collecting tubules ————
  const maj = clamp01(pose.major);
  // In one step the minor calyces branch first, then the collecting tubules grow out of their ends.
  const min = ss(0, 0.6, pose.minor);
  const col = ss(0.45, 1, pose.coll);
  const urinePaths: V3[][] = [];
  MAJOR.forEach((end, i) => {
    if (maj <= 0.04) return;
    // From the pelvis's wall out (the part inside the funnel would grow unseen).
    const line = L([mix3(PELVIS, end, 0.36), mix3(PELVIS, end, 0.68), end], 10);
    const majLine = grown(line, maj);
    tube(`maj${i}`, 'kaliza-nagusiak', majLine, UC.bud, 0.11, 1, { groups: ['sistema-biltzailea'], deep: UC.budDeep });
    ball(`majcup${i}`, 'kaliza-nagusiak', end, [0.17 * ss(0.6, 1, maj), 0.17 * ss(0.6, 1, maj), 0.14 * ss(0.6, 1, maj)], UC.bud, 1, { groups: ['sistema-biltzailea'], deep: UC.budDeep }, 10, 12);
    // Names at the growing tips (not where they will end).
    if (i === 0) pts['kaliza-nagusiak'] = add(majLine[majLine.length - 1], [0.12, 0.12, 0.18]);
    MINOR_DIRS[i].forEach(([dx, dy], j) => {
      if (min <= 0.01) return;
      const mEnd: V3 = [end[0] + dx * 0.45, end[1] + dy * 0.32, 0.03 * (j - 1)];
      const ml = L([end, mix3(end, mEnd, 0.5), mEnd], 8);
      const minLine = grown(ml, min);
      tube(`min${i}${j}`, 'kaliza-txikiak', minLine, UC.bud, 0.075, 1, { groups: ['sistema-biltzailea'], deep: UC.budDeep }, 10);
      ball(`mincup${i}${j}`, 'kaliza-txikiak', mEnd, [0.11 * ss(0.6, 1, min), 0.11 * ss(0.6, 1, min), 0.09 * ss(0.6, 1, min)], UC.bud, 1, { groups: ['sistema-biltzailea'], deep: UC.budDeep }, 8, 10);
      if (i === 1 && j === 0) pts['kaliza-txikiak'] = add(minLine[minLine.length - 1], [0.1, 0.1, 0.15]);
      // Collecting tubules: long, thin, out to the cortex.
      for (let k = 0; k < 3; k++) {
        if (col <= 0.01) break;
        const a = Math.atan2(dy, dx) + (k - 1) * 0.28;
        const far: V3 = [mEnd[0] + Math.cos(a) * 0.62, mEnd[1] + Math.sin(a) * 0.6, mEnd[2] + 0.05 * (k - 1)];
        const cl = L([mEnd, mix3(mEnd, far, 0.5), far], 8);
        const colLine = grown(cl, col);
        tube(`col${i}${j}${k}`, 'hodi-biltzaileak', colLine, UC.bud, 0.032, 1, { groups: ['sistema-biltzailea'], deep: UC.budDeep }, 6);
        if (i === 0 && j === 1 && k === 1) pts['hodi-biltzaileak'] = add(colLine[colLine.length - 1], [0, 0.05, 0.12]);
        if (k === 1 && j === 1) urinePaths.push([far, mEnd, end, PELVIS, ...stalk.slice().reverse().slice(1)]);
      }
    });
  });

  // ———— urine: drops from the collecting tubules out through the calyces, pelvis and ureter ————
  if (pose.urine > 0.01)
    urinePaths.forEach((path, i) => {
      const line = L(path, 40);
      for (let k = 0; k < 4; k++) {
        const u = (pose.urine * 1.6 + k * 0.22 + i * 0.07) % 1;
        const p = line[Math.min(line.length - 1, Math.floor(u * (line.length - 1)))];
        ball(`drop${i}${k}`, '', add(p, [0, 0, 0.12]), [0.06, 0.06, 0.06], '#facc15', ss(0, 0.15, pose.urine), { tissue: 'vessel', quiet: true }, 6, 8);
      }
    });
  return { items, pts };
}
