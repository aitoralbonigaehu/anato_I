import { add, mix3, type V3 } from '@/lib/three-d/math';
import { curve3 } from '@/lib/three-d/mesh';
import type { Item3 } from '@/lib/three-d/scene';
import { blobParts, mixHex, tubeParts } from '@/components/scenes/week10/model3d';
import { UC } from '@/components/scenes/week15/uro-model';

/**
 * Topic 16: one gonad cut across (the notes' section figures of 2.1, 3.1 and 3.3), a slab thick enough to see
 * the cords run into it. Dorsally the aorta and the mesonephros with its tubules and duct (Wolff), and the
 * paramesonephric duct (Müller) beside it; below them the gonad: its coelomic epithelium, the primordial germ
 * cells, the primary sex cords. Then either way:
 * - testis: the cords leave the epithelium (medullary cords), a connective layer forms under it (tunica
 *   albuginea), the cords narrow at the hilum into the rete testis and become horseshoe testis cords linked to
 *   the mesonephric tubules; Sertoli cells in the cords (4th month), Leydig cells between them (4th–6th month);
 *   at puberty the cords hollow: seminiferous tubules; the paramesonephric duct goes;
 * - ovary: the primary cords degenerate (the medulla), the epithelium thickens (cortex) and gives a second
 *   generation of cortical cords that break up (4th month); follicle cells surround the cells left free: primary
 *   oocytes; the mesonephric duct goes.
 *
 * Own frame (a block): x = the embryo's LEFT (lateral: the mesonephros on the viewer's right), y = DORSAL,
 * z = CRANIAL. Seen from the cranial side, dorsal up.
 */

export interface GonadPose {
  /** The germ cells arrived (0..1); the epithelium thickened and the primary sex cords grown in (0..1). */
  germ: number;
  cords: number;
  /** Male: medullary cords free of the epithelium + tunica albuginea (0..1); horseshoe testis cords and the rete (0..1);
   * linked to the mesonephric tubules (0..1); Sertoli (0..1), Leydig (0..1); hollowed (0..1); the Müller duct gone (0..1). */
  medulla: number;
  horseshoe: number;
  link: number;
  sertoli: number;
  leydig: number;
  hollow: number;
  mullerGone: number;
  /** Female: the primary cords gone (0..1); the cortex thickened, second cortical cords (0..1); broken up (0..1);
   * follicle cells round them: primary oocytes (0..1); the mesonephric duct gone (0..1). */
  primGone: number;
  cortex: number;
  breakUp: number;
  follicles: number;
  wolffGone: number;
}

export const GN0: GonadPose = { germ: 0, cords: 0, medulla: 0, horseshoe: 0, link: 0, sertoli: 0, leydig: 0, hollow: 0, mullerGone: 0, primGone: 0, cortex: 0, breakUp: 0, follicles: 0, wolffGone: 0 };

export interface GonadOpts {
  dim?: { ids: readonly string[]; k: number } | null;
}

export const GC16 = {
  epi: '#9be7dc',
  gonad: '#2dd4bf',
  gonadDeep: '#0f6b60',
  cord: '#5eead4',
  testisCord: '#14b8a6',
  albuginea: '#e5e7eb',
  rete: '#99f6e4',
  sertoli: '#ccfbf1',
  leydig: '#fb923c',
  follicle: '#a7f3d0',
  oocyte: '#fde68a',
} as const;

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const darker = (c: string) => mixHex(c, '#000000', 0.55);
const L = (kps: readonly V3[], n = 14) => curve3(kps as V3[], n);
const grown = (line: V3[], g: number) => (g >= 0.999 ? line : line.slice(0, Math.max(2, Math.round(line.length * clamp01(g)))));
const ss = (a: number, b: number, x: number) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};

/** The gonad's centre and size (a slab: depth along z). */
const G: V3 = [0, -0.45, 0];
const GR: V3 = [1.35, 1.1, 0.85];
const HILUM: V3 = [0.55, 0.45, 0];
const ZS = [0.45, 0, -0.45] as const;
/** Where the cords start on the surface (ventral and lateral face), angles in the cut plane. */
const CORD_A = [-2.5, -2.05, -1.6, -1.15, -0.7];
const onSurf = (a: number, k = 1): V3 => [G[0] + GR[0] * k * Math.cos(a), G[1] + GR[1] * k * Math.sin(a), 0];

export function gonadModel(pose: GonadPose, o: GonadOpts = {}) {
  const items: Item3[] = [];
  const pts: Record<string, V3> = {};
  const dim = o.dim;
  const fade = (id: string, groups?: readonly string[]) => (!dim || dim.k <= 0.001 || dim.ids.includes(id) || (groups ?? []).some((g) => dim.ids.includes(g)) ? 1 : 1 - 0.75 * dim.k);
  const tube = (key: string, id: string | undefined, line: V3[], color: string, r: number | ((u: number) => number), op = 1, extra: Partial<Item3> = {}, sides = 10) => {
    if (op <= 0.01 || line.length < 2) return;
    items.push({ key, id, ...tubeParts(line, { radius: typeof r === 'number' ? () => r : r, ref: [0, 1, 0], sides, capStart: true, capEnd: true }), color, deep: darker(color), tissue: 'epithelium', opacity: op * (id ? fade(id, extra.groups) : 1), ...extra });
  };
  const ball = (key: string, id: string | undefined, c: V3, r: V3, color: string, op = 1, extra: Partial<Item3> = {}, rings = 8, sides = 10) => {
    if (op <= 0.01) return;
    items.push({ key, id, ...blobParts({ center: c, radii: r, rings, sides }), color, deep: darker(color), tissue: 'epithelium', opacity: op * (id ? fade(id, extra.groups) : 1), ...extra });
  };
  const along = (x: number, y: number, h = 0.9): V3[] => [[x, y, h], [x, y, 0], [x, y, -h]];
  const male = Math.max(pose.medulla, pose.horseshoe, pose.sertoli, pose.hollow) > 0.01;
  const female = Math.max(pose.primGone, pose.cortex, pose.follicles) > 0.01;

  // ———— context: aorta, mesonephros (tubules + duct), paramesonephric duct ————
  tube('aorta', 'aorta-dortsalak', along(-1.75, 1.45), UC.aorta, 0.3, 0.8, { tissue: 'vessel', quiet: true });
  pts['aorta-dortsalak'] = [-1.55, 1.75, 0.9];
  ball('meso', 'mesonefrosa', [1.55, 0.95, 0], [0.85, 0.7, 0.92], UC.ridge, 0.22, { outline: false, tissue: 'mesenchyme', deep: UC.ridgeDeep });
  pts['mesonefrosa'] = [2.1, 1.45, 0.6];
  const wolffOp = 1 - clamp01(pose.wolffGone);
  tube('wolff', 'hodi-mesonefrikoa', along(1.85, 1.05), UC.wolff, 0.14, wolffOp, { deep: UC.wolffDeep });
  pts['hodi-mesonefrikoa'] = [1.95, 1.25, 0.85];
  const mullerOp = 1 - clamp01(pose.mullerGone);
  tube('muller', 'hodi-paramesonefrikoa', along(2.15, 0.5), UC.muller, 0.11, mullerOp, { deep: UC.mullerDeep });
  pts['hodi-paramesonefrikoa'] = [2.3, 0.4, 0.85];
  // Mesonephric tubules from the duct towards the gonad's hilum (the ones the rete links to in the male).
  ZS.forEach((z, k) => {
    const t = L([[1.8, 1.0, z], [1.45, 1.3, z + 0.1], [1.15, 0.85, z - 0.05], [0.95, 0.6, z]], 12);
    tube(`mt${k}`, 'hodixka-mesonefrikoak', t, UC.meso, 0.06, 0.85 * (1 - 0.7 * clamp01(pose.wolffGone)), {}, 8);
    if (k === 0) pts['hodixka-mesonefrikoak'] = [1.4, 1.42, z];
  });

  // ———— the gonad: coelomic epithelium (outer), the body (see-through) ————
  const cortexT = clamp01(pose.cortex);
  ball('gonad', 'gonadak', G, GR, GC16.gonad, 0.22, { outline: false, groups: ['gonada-gandorra'], deep: GC16.gonadDeep, thin: 0.3 }, 16, 22);
  pts['gonadak'] = [-1.2, -1.05, 0.7];
  // The surface epithelium: thickens (cortex in the female).
  ball('epi', 'gonadaren-epitelioa', G, [GR[0] + 0.04 + 0.08 * cortexT, GR[1] + 0.04 + 0.08 * cortexT, GR[2] + 0.02], GC16.epi, lerp(0.16, 0.34, Math.max(pose.cords * 0.5, cortexT)), { outline: false, thin: 0.6, groups: female ? ['obarioaren-kortexa'] : [] }, 16, 22);
  pts['gonadaren-epitelioa'] = [-1.32, -0.15, 0.6];
  pts['obarioaren-kortexa'] = [-1.36, -0.55, 0.55];
  // Tunica albuginea: a pale connective layer under the epithelium (male).
  const alb = ss(0.3, 1, pose.medulla);
  if (alb > 0.01) {
    ball('alb', 'tunika-albuginea', G, [GR[0] - 0.12, GR[1] - 0.12, GR[2] - 0.06], GC16.albuginea, 0.32 * alb, { outline: false, thin: 0.5 }, 16, 22);
    pts['tunika-albuginea'] = [-1.15, -1.2, 0.3];
  }

  // ———— primordial germ cells: in the cortex first, then in the cords ————
  const germ = clamp01(pose.germ);
  if (germ > 0.01 && pose.follicles < 0.99) {
    for (let i = 0; i < 12; i++) {
      const a = -2.7 + (i / 11) * 2.3;
      const z = ZS[i % 3] + 0.1 * Math.sin(i * 1.7);
      const r0 = lerp(1.25, 0.65, ss(0.3, 1, pose.cords));
      const p: V3 = [G[0] + GR[0] * r0 * Math.cos(a), G[1] + GR[1] * r0 * Math.sin(a), z];
      ball(`gc${i}`, 'hasierako-hozi-zelulak', p, [0.09, 0.09, 0.09], UC.germ, germ * (1 - clamp01(pose.follicles)), { tissue: 'vessel' });
    }
    pts['hasierako-hozi-zelulak'] = [G[0] + GR[0] * 1.0 * Math.cos(-1.4), G[1] + GR[1] * 1.0 * Math.sin(-1.4), 0.5];
  }

  // ———— primary sex cords: from the epithelium in towards the medulla (both sexes alike) ————
  const cords = clamp01(pose.cords);
  const primOp = 1 - clamp01(pose.primGone);
  CORD_A.forEach((a, i) =>
    ZS.forEach((z, k) => {
      if (cords <= 0.01 || primOp <= 0.01) return;
      // Male: the cords leave the epithelium (start moves in), bend into horseshoes and meet at the rete by the hilum.
      const free = ss(0, 1, pose.medulla);
      const hs = clamp01(pose.horseshoe);
      const start = mix3(onSurf(a, 1.0), onSurf(a, 0.8), free);
      const end = mix3(onSurf(a, 0.25), add(HILUM, [0, -0.1 - 0.1 * i, 0]), hs);
      const bow = add(mix3(start, end, 0.5), [Math.cos(a) * 0.35 * hs, Math.sin(a) * 0.35 * hs, 0]);
      const line = L([start, bow, end].map((p) => [p[0], p[1], z] as V3), 14);
      const id = hs > 0.5 ? (pose.hollow > 0.5 ? 'hodixka-seminiferoak' : 'barrabil-kordoiak') : free > 0.5 ? 'muin-kordoiak' : 'hasierako-sexu-kordoiak';
      const col = mixHex(GC16.cord, GC16.testisCord, hs);
      // Hollowed (puberty): the wall turns see-through so the lumen inside reads.
      tube(`cord${i}${k}`, id, grown(line, cords), col, lerp(0.075, 0.1, hs), primOp * (female ? 0.6 : 1) * (1 - 0.5 * clamp01(pose.hollow)), { groups: ['hasierako-sexu-kordoiak', 'muin-kordoiak', 'barrabil-kordoiak', 'hodixka-seminiferoak'] }, 10);
      if (pose.hollow > 0.01) tube(`lum${i}${k}`, undefined, line.slice(2, -2), '#062520', 0.055 * pose.hollow, 0.95, { outline: false, quiet: true }, 8);
      if (i === 2 && k === 0) pts[id] = add(line[6], [0, -0.05, 0.12]);
      if (i === 2 && k === 0) {
        pts['hasierako-sexu-kordoiak'] = pts[id];
        pts['muin-kordoiak'] = pts[id];
        pts['barrabil-kordoiak'] = pts[id];
        pts['hodixka-seminiferoak'] = pts[id];
      }
      // Sertoli cells in the cords.
      if (pose.sertoli > 0.01 && k === 0)
        [0.3, 0.6].forEach((u, j) => ball(`ser${i}${j}`, 'sertoli-zelulak', add(line[Math.round(u * (line.length - 1))], [0, 0, 0.1]), [0.055, 0.055, 0.055], GC16.sertoli, pose.sertoli));
    }),
  );
  if (pose.sertoli > 0.01) pts['sertoli-zelulak'] = add(onSurf(-1.6, 0.62), [0, 0, 0.55]);
  // The rete testis at the hilum, and its link to the mesonephric tubules.
  if (pose.horseshoe > 0.01) {
    ZS.forEach((z, k) => ball(`rete${k}`, 'barrabil-sarea', [HILUM[0], HILUM[1] - 0.2, z], [0.22, 0.28, 0.16], GC16.rete, pose.horseshoe, {}, 10, 12));
    pts['barrabil-sarea'] = [HILUM[0] + 0.15, HILUM[1] - 0.05, 0.6];
    if (pose.link > 0.01) ZS.forEach((z, k) => tube(`link${k}`, 'barrabil-sarea', grown(L([[HILUM[0] + 0.1, HILUM[1] - 0.15, z], [0.8, 0.55, z], [0.95, 0.6, z]], 8), pose.link), GC16.rete, 0.06, 1, {}, 8));
  }
  // Leydig cells between the cords.
  if (pose.leydig > 0.01) {
    for (let i = 0; i < 8; i++) {
      const a = -2.3 + i * 0.27;
      ball(`ley${i}`, 'leydig-zelulak', [G[0] + GR[0] * 0.55 * Math.cos(a), G[1] + GR[1] * 0.55 * Math.sin(a), ZS[i % 3] + 0.2], [0.09, 0.09, 0.09], GC16.leydig, pose.leydig);
    }
    pts['leydig-zelulak'] = [G[0] + GR[0] * 0.55 * Math.cos(-1.76), G[1] + GR[1] * 0.55 * Math.sin(-1.76), 0.6];
  }

  // ———— female: the primary cords gone (the medulla), second-generation cortical cords, follicles ————
  if (female) {
    const medOp = ss(0, 1, pose.primGone);
    ball('ovmed', 'obarioaren-muina', add(G, [0.25, 0.25, 0]), [0.55, 0.45, 0.7], '#7dd3c4', 0.35 * medOp, { outline: false });
    pts['obarioaren-muina'] = add(G, [0.45, 0.45, 0.6]);
    // The cortical cords grow in first, then break up (one step runs both: they read one after the other).
    const cc = ss(0, 0.6, pose.cortex);
    const br = ss(0.55, 1, pose.breakUp);
    const fol = clamp01(pose.follicles);
    for (let i = 0; i < 9; i++) {
      const a = -2.75 + (i / 8) * 2.5;
      const z = ZS[i % 3];
      const outer = onSurf(a, 1.02);
      const inner = onSurf(a, lerp(0.85, 0.6, cc));
      const cl: V3 = [inner[0], inner[1], z];
      if (br < 0.99) tube(`cc${i}`, 'kortex-kordoiak', grown(L([[outer[0], outer[1], z], mix3([outer[0], outer[1], z], cl, 0.5), cl], 8), cc), GC16.cord, 0.08, 1 - br, {}, 8);
      // Broken up: the cells left free in the medulla, follicle cells round each → a primary oocyte.
      if (br > 0.01) {
        const c = add(cl, [0, 0, 0.05]);
        ball(`oo${i}`, fol > 0.5 ? 'obozito-primarioak' : 'hasierako-hozi-zelulak', c, [0.11, 0.11, 0.11], mixHex(UC.germ, GC16.oocyte, fol), br);
        if (fol > 0.01) ball(`fol${i}`, 'folikulu-zelulak', c, [0.19 * fol, 0.19 * fol, 0.17 * fol], GC16.follicle, 0.5 * fol, { thin: 0.6 }, 10, 12);
      }
      if (i === 4) {
        pts['kortex-kordoiak'] = add(cl, [0, -0.15, 0.2]);
        pts['obozito-primarioak'] = add(cl, [0.05, 0.12, 0.25]);
        pts['folikulu-zelulak'] = add(cl, [0.12, -0.15, 0.25]);
      }
    }
  }
  return { items, pts };
}
