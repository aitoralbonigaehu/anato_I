import { add, mix3, type V3 } from '@/lib/three-d/math';
import { curve3 } from '@/lib/three-d/mesh';
import { cutOpen, plate, vessel, type Parts, type VesselOptions } from '@/lib/three-d/organic';
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
 *
 * Built to the quality bar (docs/quality/3d-quality-bar.md): a solid cross-section. The dorsal wall is an opaque
 * cut face (the aorta, the mesonephros and the ducts cut across in it), the coelom dark behind; the gonad hangs
 * into it as a solid cut organ whose layers (epithelium, tunica albuginea, the ovary's medulla) are rings on its
 * cut face; the cords, the rete and the cells lie in the cut, the cords as tapered vessels grown by arc length.
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
const ss = (a: number, b: number, x: number) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};

/** The gonad's centre and size (its back half kept; the cut at z = 0). */
const G: V3 = [0, -0.45, 0];
const GR: V3 = [1.35, 1.1, 0.85];
const HILUM: V3 = [0.55, 0.45, 0];
const MESO: V3 = [1.55, 0.95, 0];
const MR: V3 = [0.85, 0.7, 0.8];
/** Where the cords start on the surface (ventral and lateral face), angles in the cut plane. */
const CORD_A = [-2.5, -2.05, -1.6, -1.15, -0.7];
const onSurf = (a: number, k = 1): V3 => [G[0] + GR[0] * k * Math.cos(a), G[1] + GR[1] * k * Math.sin(a), 0];
/** On the cut face, a little out of it (things lying in the cut). */
const F = 0.015;
const box = (x0: number, x1: number, y0: number, y1: number, n = 48): [number, number][] =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const c = Math.cos(a), sn = Math.sin(a);
    return [(x0 + x1) / 2 + ((x1 - x0) / 2) * Math.sign(c) * Math.abs(c) ** 0.3, (y0 + y1) / 2 + ((y1 - y0) / 2) * Math.sign(sn) * Math.abs(sn) ** 0.3];
  });
const DORSAL = box(-2.9, 3.05, 0.22, 2.55);
const COELOM = box(-2.7, 2.85, -2.15, 0.4);

export function gonadModel(pose: GonadPose, o: GonadOpts = {}) {
  const items: Item3[] = [];
  const pts: Record<string, V3> = {};
  const dim = o.dim;
  const fade = (id: string, groups?: readonly string[]) => (!dim || dim.k <= 0.001 || dim.ids.includes(id) || (groups ?? []).some((g) => dim.ids.includes(g)) ? 1 : 1 - 0.75 * dim.k);
  const put = (key: string, id: string | undefined, parts: Parts | null, color: string, op = 1, extra: Partial<Item3> = {}) => {
    if (!parts || op <= 0.01) return;
    items.push({ key, id, ...parts, color, deep: darker(color), tissue: 'epithelium', opacity: op * (id ? fade(id, extra.groups) : 1), ...extra });
  };
  /** A solid part (the gonad's body and its cut layers): greyed with the unlit parts, never made see-through. */
  const solid = (key: string, id: string, parts: Parts | null, color: string, extra: Partial<Item3> = {}) => {
    if (parts) items.push({ key, id, ...parts, color, deep: darker(color), tissue: 'epithelium', opacity: 1, ...extra });
  };
  const vess = (key: string, id: string | undefined, line: V3[], color: string, prof: VesselOptions, g = 1, op = 1, extra: Partial<Item3> = {}) =>
    put(key, id, vessel(line, { ref: [0, 0, 1], sides: 10, ...prof }, g), color, op, extra);
  const ball = (key: string, id: string | undefined, c: V3, r: V3, color: string, op = 1, extra: Partial<Item3> = {}, rings = 8, sides = 10) =>
    put(key, id, op > 0.01 ? blobParts({ center: c, radii: r, rings, sides }) : null, color, op, extra);
  /** A duct or vessel cut across: a short stub standing out of the cut face, its end rounded. */
  const crossCut = (key: string, id: string, x: number, y: number, r: number, color: string, op: number, extra: Partial<Item3> = {}) =>
    vess(key, id, [[x, y, -0.06], [x, y, 0.08], [x, y, 0.22]], color, { r0: r, r1: r, sides: 16, capStart: false, ref: [0, 1, 0] }, 1, op, extra);
  const male = Math.max(pose.medulla, pose.horseshoe, pose.sertoli, pose.hollow) > 0.01;
  const female = Math.max(pose.primGone, pose.cortex, pose.follicles) > 0.01;

  // ———— context: the dorsal wall cut across (ground), the coelom behind; the aorta, mesonephros and ducts in it ————
  items.push({ key: 'dorsal', ...plate('gonad-dorsal-v1', DORSAL, -0.012, -0.9), color: UC.wallCut, deep: UC.wallCutDeep, tissue: 'mesenchyme', opacity: 1, quiet: true, ground: true });
  items.push({ key: 'coelom', ...plate('gonad-coelom-v1', COELOM, -1.15, -1.3), color: '#2b3247', deep: '#10131c', tissue: 'membrane', opacity: 1, quiet: true, ground: true, outline: false });
  crossCut('aorta', 'aorta-dortsalak', -1.75, 1.45, 0.3, UC.aorta, 1, { tissue: 'vessel', quiet: true, ground: true });
  pts['aorta-dortsalak'] = [-1.55, 1.75, 0.3];
  const mc = cutOpen({ center: MESO, radii: MR, layers: [[0, 1]] });
  put('meso', 'mesonefrosa', mc.faces[0], UC.ridge, 1, { deep: UC.ridgeDeep, tissue: 'mesenchyme', ground: true });
  pts['mesonefrosa'] = [2.1, 1.45, 0.2];
  const wolffOp = 1 - clamp01(pose.wolffGone);
  crossCut('wolff', 'hodi-mesonefrikoa', 1.85, 1.05, 0.14 * (0.4 + 0.6 * wolffOp), UC.wolff, wolffOp, { deep: UC.wolffDeep });
  pts['hodi-mesonefrikoa'] = [1.95, 1.25, 0.3];
  const mullerOp = 1 - clamp01(pose.mullerGone);
  crossCut('muller', 'hodi-paramesonefrikoa', 2.15, 0.5, 0.11 * (0.4 + 0.6 * mullerOp), UC.muller, mullerOp, { deep: UC.mullerDeep });
  pts['hodi-paramesonefrikoa'] = [2.3, 0.4, 0.3];
  // Mesonephric tubules in the cut, from the duct towards the gonad's hilum (the ones the rete links to).
  const mtOp = 0.9 * (1 - 0.7 * clamp01(pose.wolffGone));
  const MT: V3[][] = [[[1.78, 1.0, F], [1.45, 1.3, F], [1.15, 0.85, F], [0.95, 0.6, F]], [[1.8, 0.92, F], [1.6, 0.62, F], [1.3, 0.7, F], [1.05, 0.48, F]]];
  MT.forEach((kp, k) =>
    vess(`mt${k}`, 'hodixka-mesonefrikoak', L(kp, 14), UC.meso, { r0: 0.075, r1: 0.055, flare: 0.5, flareLen: 0.12 }, 1, mtOp),
  );
  pts['hodixka-mesonefrikoak'] = [1.4, 1.42, 0.1];

  // ———— the gonad: a solid cut across, its layers rings on the cut ————
  const cortexT = clamp01(pose.cortex);
  const alb = ss(0.3, 1, pose.medulla);
  const medOp = female ? ss(0, 1, pose.primGone) : 0;
  const epiW = 0.05 + 0.04 * clamp01(pose.cords) + 0.12 * cortexT;
  const albW = 0.07 * alb;
  const medR = 0.42 * medOp;
  const gc = cutOpen({ center: G, radii: GR, layers: [[1 - epiW, 1], [1 - epiW - albW, 1 - epiW], [medR, 1 - epiW - albW], [0, medR]] });
  solid('gonadBack', 'gonadak', gc.dome, GC16.gonad, { deep: GC16.gonadDeep, groups: ['gonada-gandorra'] });
  solid('epi', 'gonadaren-epitelioa', gc.faces[0], GC16.epi, { groups: female ? ['obarioaren-kortexa', 'gonadak'] : ['gonadak'] });
  solid('alb', 'tunika-albuginea', gc.faces[1], GC16.albuginea, { groups: ['gonadak'] });
  solid('gonad', 'gonadak', gc.faces[2], mixHex(GC16.gonad, '#0b3b36', 0.3), { deep: GC16.gonadDeep, groups: ['gonada-gandorra'] });
  solid('ovmed', 'obarioaren-muina', gc.faces[3], '#7dd3c4', { groups: ['gonadak'] });
  pts['gonadak'] = [-1.2, -1.05, 0.2];
  pts['gonadaren-epitelioa'] = [-1.32, -0.15, 0.1];
  pts['obarioaren-kortexa'] = [-1.36, -0.55, 0.1];
  if (alb > 0.01) pts['tunika-albuginea'] = [G[0] + GR[0] * (1 - epiW - albW / 2) * Math.cos(-2.2), G[1] + GR[1] * (1 - epiW - albW / 2) * Math.sin(-2.2), 0.08];
  if (medOp > 0.01) pts['obarioaren-muina'] = add(G, [0.2, 0.25, 0.1]);

  // ———— primordial germ cells: in the cortex first, then in the cords ————
  const germ = clamp01(pose.germ);
  if (germ > 0.01 && pose.follicles < 0.99) {
    for (let i = 0; i < 10; i++) {
      const a = -2.7 + (i / 9) * 2.3;
      const r0 = lerp(0.88, 0.62, ss(0.3, 1, pose.cords)) + 0.05 * Math.sin(i * 2.3);
      const p: V3 = [G[0] + GR[0] * r0 * Math.cos(a), G[1] + GR[1] * r0 * Math.sin(a), 0.04];
      ball(`gc${i}`, 'hasierako-hozi-zelulak', p, [0.1, 0.1, 0.08], UC.germ, germ * (1 - clamp01(pose.follicles)), { tissue: 'vessel' });
    }
    pts['hasierako-hozi-zelulak'] = [G[0] + GR[0] * 0.88 * Math.cos(-1.4), G[1] + GR[1] * 0.88 * Math.sin(-1.4), 0.2];
  }

  // ———— primary sex cords: from the epithelium in towards the medulla (both sexes alike) ————
  const cords = clamp01(pose.cords);
  const primOp = 1 - clamp01(pose.primGone);
  const free = ss(0, 1, pose.medulla);
  const hs = clamp01(pose.horseshoe);
  const hollow = clamp01(pose.hollow);
  if (cords > 0.01 && primOp > 0.01) {
    CORD_A.forEach((a, i) => {
      // Male: the cords leave the epithelium (start moves in), bend into horseshoes and meet at the rete by the hilum.
      const start = mix3(onSurf(a, 0.97), onSurf(a, 0.8), free);
      const end = mix3(onSurf(a, 0.25), add(HILUM, [0, -0.1 - 0.1 * i, 0]), hs);
      const bow = add(mix3(start, end, 0.5), [Math.cos(a) * 0.35 * hs, Math.sin(a) * 0.35 * hs, 0]);
      const line = L([start, bow, end].map((p) => [p[0], p[1], F] as V3), 16);
      const id = hs > 0.5 ? (hollow > 0.5 ? 'hodixka-seminiferoak' : 'barrabil-kordoiak') : free > 0.5 ? 'muin-kordoiak' : 'hasierako-sexu-kordoiak';
      const col = mixHex(GC16.cord, GC16.testisCord, hs);
      const r = lerp(0.085, 0.11, hs);
      // Rooted in the epithelium (flared) until they come free of it; flared into the rete once they reach it.
      vess(`cord${i}`, id, line, col, { r0: r, r1: r * 0.85, flare: 0.7 * (1 - free), flareLen: 0.15, bulb: 0.3 * hs, bulbLen: 0.18 }, cords, primOp * (female ? 0.75 : 1), { groups: ['hasierako-sexu-kordoiak', 'muin-kordoiak', 'barrabil-kordoiak', 'hodixka-seminiferoak'] });
      // Hollowed (puberty): a lumen down the middle of the cord, open in the cut.
      if (hollow > 0.01) vess(`lum${i}`, undefined, line.slice(2, -2).map((p) => add(p, [0, 0, r * 0.72])), '#062520', { r0: r * 0.5 * hollow, sides: 8 }, 1, 1, { outline: false, quiet: true });
      if (i === 2) {
        const at = add(line[7], [0, -0.05, 0.12]);
        for (const k of ['hasierako-sexu-kordoiak', 'muin-kordoiak', 'barrabil-kordoiak', 'hodixka-seminiferoak']) pts[k] = at;
      }
      // Sertoli cells in the cords.
      if (pose.sertoli > 0.01) [0.3, 0.6].forEach((u, j) => ball(`ser${i}${j}`, 'sertoli-zelulak', add(line[Math.round(u * (line.length - 1))], [0, 0, r * 0.8]), [0.055, 0.055, 0.04], GC16.sertoli, pose.sertoli));
    });
  }
  if (pose.sertoli > 0.01) pts['sertoli-zelulak'] = add(onSurf(-1.6, 0.62), [0, 0, 0.2]);
  // The rete testis at the hilum, and its link to the mesonephric tubules.
  if (hs > 0.01) {
    ball('rete', 'barrabil-sarea', [HILUM[0], HILUM[1] - 0.35, F], [0.24 * hs, 0.36 * hs, 0.12], GC16.rete, 1, {}, 10, 12);
    pts['barrabil-sarea'] = [HILUM[0] + 0.15, HILUM[1] - 0.05, 0.2];
    if (pose.link > 0.01)
      [0, 1].forEach((k) => vess(`link${k}`, 'barrabil-sarea', L([[HILUM[0] + 0.1, HILUM[1] - 0.3 + 0.1 * k, F], [0.8, 0.5 + 0.06 * k, F], [k ? 1.05 : 0.95, k ? 0.48 : 0.6, F]], 8), GC16.rete, { r0: 0.07, r1: 0.055, flare: 0.5, flareLen: 0.1 }, pose.link));
  }
  // Leydig cells between the cords.
  if (pose.leydig > 0.01) {
    for (let i = 0; i < 8; i++) {
      const a = -2.3 + i * 0.27;
      ball(`ley${i}`, 'leydig-zelulak', [G[0] + GR[0] * 0.55 * Math.cos(a), G[1] + GR[1] * 0.55 * Math.sin(a), 0.05], [0.09, 0.09, 0.07], GC16.leydig, pose.leydig);
    }
    pts['leydig-zelulak'] = [G[0] + GR[0] * 0.55 * Math.cos(-1.76), G[1] + GR[1] * 0.55 * Math.sin(-1.76), 0.2];
  }

  // ———— female: second-generation cortical cords, broken up into cells that follicle cells surround ————
  if (female) {
    const cc = ss(0, 0.6, pose.cortex);
    const br = ss(0.55, 1, pose.breakUp);
    const fol = clamp01(pose.follicles);
    for (let i = 0; i < 9; i++) {
      const a = -2.75 + (i / 8) * 2.5;
      const outer = onSurf(a, 0.99);
      const inner = onSurf(a, lerp(0.85, 0.6, cc));
      const cl: V3 = [inner[0], inner[1], F];
      if (br < 0.99) vess(`cc${i}`, 'kortex-kordoiak', L([[outer[0], outer[1], F], mix3([outer[0], outer[1], F], cl, 0.5), cl], 8), GC16.cord, { r0: 0.085, r1: 0.07, flare: 0.6, flareLen: 0.12 }, cc, 1 - br);
      // Broken up: the cells left free in the medulla, follicle cells round each → a primary oocyte.
      if (br > 0.01) {
        const c = add(cl, [0, 0, 0.04]);
        ball(`oo${i}`, fol > 0.5 ? 'obozito-primarioak' : 'hasierako-hozi-zelulak', c, [0.11, 0.11, 0.09], mixHex(UC.germ, GC16.oocyte, fol), br);
        // The follicle cells: a ring of flat cells round it, lying in the cut.
        if (fol > 0.01) {
          const ring = Array.from({ length: 25 }, (_, j): V3 => {
            const t = (j / 24) * Math.PI * 2;
            return add(c, [0.18 * Math.cos(t), 0.18 * Math.sin(t), -0.02]);
          });
          vess(`fol${i}`, 'folikulu-zelulak', ring, GC16.follicle, { r0: 0.05, sides: 8, n: 26 }, fol, 1);
        }
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
