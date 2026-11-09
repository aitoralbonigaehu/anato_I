import type { V3 } from '@/lib/three-d/math';
import { curve3 } from '@/lib/three-d/mesh';
import { mergeParts, vessel, type Parts } from '@/lib/three-d/organic';
import type { Item3 } from '@/lib/three-d/scene';
import { blobParts, mixHex } from '@/components/scenes/week10/model3d';
import { ARCH_HEAD, ARCH_LINE, ARCH_REGIONS, archHead, type ArchRegion } from './arch-head';
import { ARCH, ARCH_DEEP, TISSUE } from './common';

export { ARCH_HEAD, ARCH_LINE };

/**
 * Topic 17, arches: the embryo's head and neck at five weeks from the left (arch-head.ts is the sculpted skin), with
 * what lies inside: the cartilage bars and the cranial nerves, every one in the colour of its arch.
 * Axes: x the embryo's LEFT, y cranial, z ventral. The `bones` stages can import this builder.
 */
export interface ArchPose {
  /** 0 solid skin, 1 the head's skin thin as a veil over the brain (the notes' side figures of the nerves). */
  glass: number;
  /** 0..1: the arches' own skin thins so that what is inside shows (each arch: I, II, III, IV+VI). */
  open1: number;
  open2: number;
  open3: number;
  open4: number;
  /** Trigeminal ganglion (0..1) and its three branches, grown by arc length. */
  gasser: number;
  v1: number;
  v2: number;
  v3: number;
  /** VII, IX, the vagus X (trunk down the neck), its superior laryngeal (to IV) and its recurrent laryngeal (to VI). */
  n7: number;
  n9: number;
  n10: number;
  laryngeal: number;
  recurrent: number;
  /** Cartilage bars in the arches (0..1 each, grown by arc length). */
  barI: number;
  barII: number;
  barIII: number;
  barIV: number;
  /** Arch V: rises (0..1) between IV and VI and sinks again. */
  arch5: number;
}

export const AP0: ArchPose = { glass: 0, open1: 0, open2: 0, open3: 0, open4: 0, gasser: 0, v1: 0, v2: 0, v3: 0, n7: 0, n9: 0, n10: 0, laryngeal: 0, recurrent: 0, barI: 0, barII: 0, barIII: 0, barIV: 0, arch5: 0 };

export interface ArchOpts {
  dim?: { ids: readonly string[]; k: number } | null;
}

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const L = (k: readonly V3[], n = 18) => curve3(k as V3[], n);
/** A nerve wears its arch's colour, lightened to tell it from the cartilage. */
const nerveC = (c: string) => mixHex(c, '#ffffff', 0.34);

export const REGION: Record<ArchRegion, { id: string; c: string; deep: string; groups: string[] }> = {
  mand: { id: 'barail-luzapena', c: ARCH.i, deep: ARCH_DEEP.i, groups: ['lehen-arkua', 'faringe-arkuak'] },
  max: { id: 'luzapen-maxilarra', c: ARCH.i, deep: ARCH_DEEP.i, groups: ['lehen-arkua', 'faringe-arkuak'] },
  ii: { id: 'bigarren-arkua', c: ARCH.ii, deep: ARCH_DEEP.ii, groups: ['faringe-arkuak'] },
  iii: { id: 'hirugarren-arkua', c: ARCH.iii, deep: ARCH_DEEP.iii, groups: ['faringe-arkuak'] },
  iv: { id: 'laugarren-arkua', c: ARCH.iv, deep: ARCH_DEEP.iv, groups: ['faringe-arkuak'] },
  vi: { id: 'seigarren-arkua', c: ARCH.vi, deep: ARCH_DEEP.vi, groups: ['faringe-arkuak'] },
};

const inset = (line: readonly V3[], k = 0.9): V3[] => line.map((p) => [p[0] * k, p[1], p[2]]);

/** The cartilage bars, in the arches (for the `bones` stages too). */
export const BAR_LINE = {
  meckel: inset(ARCH_LINE.mand),
  reichert: inset(ARCH_LINE.ii),
  iii: inset(ARCH_LINE.iii.slice(5)),
  iv: inset(ARCH_LINE.iv.slice(6)),
  vi: inset(ARCH_LINE.vi.slice(6)),
};

const V1: V3[] = [[2.12, 1.86, -0.72], [2.26, 2.3, 0.2], [2.14, 2.36, 1.3], [2.0, 2.12, 2.16]];
const V2: V3[] = [[2.14, 1.56, -0.62], [2.3, 1.02, 0.1], [2.3, 0.54, 0.86], [1.9, 0.18, 1.6]];
const V3_: V3[] = [[2.2, 1.34, -0.92], [2.36, 0.6, -0.86], [2.1, -0.56, 0.02], [1.2, -1.36, 0.68]];
const N7: V3[] = [[1.9, 1.34, -2.28], [2.26, 0.3, -2.0], [2.34, -0.5, -1.5], [2.0, -1.36, -0.84], [1.16, -2.12, -0.12]];
const N9: V3[] = [[1.8, 0.56, -2.98], [2.12, -0.56, -2.7], [2.2, -1.5, -2.16], [1.94, -2.26, -1.32], [1.1, -2.96, -0.62]];
const N10: V3[] = [[1.72, -0.16, -3.12], [2.0, -1.4, -3.02], [2.1, -3.0, -2.96], [1.96, -4.6, -2.64], [1.72, -6.8, -1.98]];
const N10_S: V3[] = [[2.06, -1.9, -3.0], [2.16, -2.3, -2.56], [1.88, -3.0, -1.78], [1.0, -3.62, -1.14]];
const N10_R: V3[] = [[2.04, -3.8, -2.82], [1.92, -4.34, -2.3], [1.56, -4.04, -1.94], [0.92, -4.2, -1.62]];
const HEART_TW: V3[] = [[1.86, -5.5, -2.36], [1.42, -5.7, -1.1], [1.0, -5.5, 0.2]];
const ROOTS10: V3[][] = [0, 1, 2, 3, 4].map((i) => [[1.1, 1.2 - i * 0.62, -3.34 + i * 0.03], [1.5, 0.6 - i * 0.36, -3.3 + i * 0.03], [1.72, -0.16, -3.12]]);

export function archModel(pose: ArchPose, _o: ArchOpts = {}) {
  const G = archHead();
  const items: Item3[] = [];
  const pts: Record<string, V3> = {};
  const glass = clamp01(pose.glass);
  const skinOp = lerp(1, 0.14, glass);
  const inside = Math.max(glass, pose.open1, pose.open2, pose.open3, pose.open4);
  // Solid inside: what the nerves and bars lie on (only drawn once it can be seen).
  if (inside > 0.01) {
    items.push({ key: 'core', ...G.core, color: TISSUE.mes, deep: TISSUE.mesDeep, tissue: 'mesenchyme', ground: true, quiet: true });
    items.push({ key: 'brain', ...G.brain, color: '#cdbfc4', deep: '#6b5b66', tissue: 'neural', ground: true, quiet: true });
  }
  items.push({ key: 'skin', ...G.skin, color: TISSUE.skin, deep: TISSUE.skinDeep, tissue: 'skin', ground: true, quiet: true, opacity: skinOp, outline: glass < 0.5 });
  items.push({ key: 'cut', ...G.cut, color: TISSUE.ground, deep: TISSUE.groundDeep, tissue: 'mesenchyme', ground: true, quiet: true });
  const openOf: Record<ArchRegion, number> = { mand: pose.open1, max: pose.open1, ii: pose.open2, iii: pose.open3, iv: pose.open4, vi: pose.open4 };
  for (const k of ARCH_REGIONS) {
    const R = REGION[k];
    items.push({ key: `arch-${k}`, id: R.id, groups: R.groups, ...G.regions[k], color: R.c, deep: R.deep, tissue: 'skin', opacity: lerp(1, 0.3, clamp01(Math.max(openOf[k], glass * 0.6))) });
    const mid = ARCH_LINE[k][Math.floor(ARCH_LINE[k].length * 0.45)];
    pts[R.id] = [mid[0] * 1.14, mid[1], mid[2]];
  }
  pts['lehen-arkua'] = pts['barail-luzapena'];
  G.eyes.forEach((m, i) => items.push({ key: `eye${i}`, id: 'begia', mesh: m, color: '#2a1c22', deep: '#0c0608', tissue: 'skin', quiet: true }));
  pts['begia'] = [2.3, 1.42, 2.6];
  items.push({ key: 'stomo', id: 'estomodeoa', ...blobParts({ center: [0, -0.74, 2.02], radii: [0.92, 0.36, 0.8], rings: 12, sides: 18 }), color: '#3a1c22', deep: '#12070a', tissue: 'epithelium' });
  pts['estomodeoa'] = [0.05, -0.92, 2.5];

  const put = (key: string, id: string, p: Parts | null, color: string, deep: string, extra: Partial<Item3> = {}) => {
    if (p) items.push({ key, id, ...p, color, deep, tissue: 'nerve', ...extra });
  };
  const nerve = (line: V3[], r0: number, r1: number, g: number) => (g <= 0.005 ? null : vessel(L(line), { r0, r1, flare: 0.3, sides: 10, ref: [0, 0, 1], n: 22 }, clamp01(g)));
  const twigs = (line: V3[], g: number, spread: V3[], r: number) => {
    if (g < 0.72) return [] as (Parts | null)[];
    const e = line[line.length - 1];
    return spread.map((d) => vessel(L([e, [e[0] + d[0] * 0.5, e[1] + d[1] * 0.5, e[2] + d[2] * 0.5], [e[0] + d[0], e[1] + d[1], e[2] + d[2]]], 8), { r0: r, r1: r * 0.4, sides: 7, ref: [0, 0, 1] }, clamp01((g - 0.72) / 0.28)));
  };

  // V: the ganglion, the three branches (orange: arch I).
  const VC = nerveC(ARCH.i);
  if (pose.gasser > 0.01) {
    const s = clamp01(pose.gasser);
    items.push({ key: 'gasser', id: 'gasser-gongoila', groups: ['trigeminoa'], ...blobParts({ center: [2.16, 1.62, -0.98], radii: [0.2 * s, 0.56 * s, 0.56 * s], rings: 14, sides: 20 }), color: VC, deep: ARCH_DEEP.i, tissue: 'nerve' });
    pts['gasser-gongoila'] = [2.36, 1.66, -1.02];
    pts['trigeminoa'] = pts['gasser-gongoila'];
    const root = vessel(L([[1.5, 1.72, -1.6], [1.86, 1.72, -1.34], [2.14, 1.66, -1.1]], 8), { r0: 0.2, r1: 0.26, sides: 10, ref: [0, 0, 1] }, s);
    put('v-root', 'trigeminoa', root, VC, ARCH_DEEP.i);
  }
  put('v1', 'nerbio-oftalmikoa', mergeParts([nerve(V1, 0.13, 0.05, pose.v1), ...twigs(V1, pose.v1, [[-0.1, 0.42, 0.42], [-0.06, -0.3, 0.5]], 0.04)]), VC, ARCH_DEEP.i, { groups: ['trigeminoa'] });
  put('v2', 'nerbio-maxilarra', mergeParts([nerve(V2, 0.13, 0.055, pose.v2), ...twigs(V2, pose.v2, [[-0.2, 0.08, 0.5], [-0.3, -0.32, 0.36]], 0.04)]), VC, ARCH_DEEP.i, { groups: ['trigeminoa'] });
  put('v3', 'barail-nerbioa', mergeParts([nerve(V3_, 0.16, 0.06, pose.v3), ...twigs(V3_, pose.v3, [[-0.34, -0.2, 0.3], [-0.5, 0.04, 0.2]], 0.045)]), VC, ARCH_DEEP.i, { groups: ['trigeminoa'] });
  pts['nerbio-oftalmikoa'] = V1[2];
  pts['nerbio-maxilarra'] = V2[2];
  pts['barail-nerbioa'] = V3_[2];
  // VII, IX, X.
  const C7 = nerveC(ARCH.ii), C9 = mixHex(ARCH.iii, '#ffffff', 0.2), C10 = nerveC(ARCH.iv), CR = nerveC(ARCH.vi);
  if (pose.n7 > 0.01) items.push({ key: 'g7', id: 'aurpegi-nerbioa', ...blobParts({ center: N7[0], radii: [0.15, 0.32, 0.26], rings: 12, sides: 16 }), color: C7, deep: ARCH_DEEP.ii, tissue: 'nerve', show: clamp01(pose.n7 * 4) });
  put('n7', 'aurpegi-nerbioa', nerve(N7, 0.14, 0.06, pose.n7), C7, ARCH_DEEP.ii);
  if (pose.n9 > 0.01) items.push({ key: 'g9', id: 'glosofaringeoa', ...blobParts({ center: N9[0], radii: [0.13, 0.26, 0.22], rings: 12, sides: 16 }), color: C9, deep: ARCH_DEEP.iii, tissue: 'nerve', show: clamp01(pose.n9 * 4) });
  put('n9', 'glosofaringeoa', nerve(N9, 0.12, 0.05, pose.n9), C9, ARCH_DEEP.iii);
  if (pose.n10 > 0.01) items.push({ key: 'g10', id: 'bagoa', ...blobParts({ center: N10[0], radii: [0.17, 0.34, 0.26], rings: 12, sides: 16 }), color: C10, deep: ARCH_DEEP.iv, tissue: 'nerve', show: clamp01(pose.n10 * 4) });
  put('n10', 'bagoa', mergeParts([nerve(N10, 0.17, 0.11, pose.n10), ...ROOTS10.map((r) => (pose.n10 > 0.05 ? vessel(L(r, 10), { r0: 0.03, r1: 0.075, sides: 7, ref: [0, 0, 1] }, clamp01(pose.n10 * 3)) : null)), pose.n10 > 0.78 ? nerve(HEART_TW, 0.05, 0.03, (pose.n10 - 0.78) / 0.22) : null]), C10, ARCH_DEEP.iv);
  put('n10s', 'goiko-laringe-nerbioa', mergeParts([nerve(N10_S, 0.09, 0.05, pose.laryngeal), ...twigs(N10_S, pose.laryngeal, [[-0.3, -0.16, 0.3]], 0.03)]), C10, ARCH_DEEP.iv, { groups: ['bagoa'] });
  put('n10r', 'laringe-atzerakaria', mergeParts([nerve(N10_R, 0.09, 0.05, pose.recurrent), ...twigs(N10_R, pose.recurrent, [[-0.3, 0.12, 0.2]], 0.03)]), CR, ARCH_DEEP.vi, { groups: ['bagoa'] });
  pts['aurpegi-nerbioa'] = N7[2];
  pts['glosofaringeoa'] = N9[2];
  pts['bagoa'] = N10[2];
  pts['goiko-laringe-nerbioa'] = N10_S[2];
  pts['laringe-atzerakaria'] = N10_R[2];

  // Cartilage bars.
  const bar = (key: string, id: string, line: V3[], r0: number, r1: number, g: number, c: string, d: string) => {
    if (g <= 0.01) return;
    const p = vessel(line, { r0, r1, sides: 14, ref: [0, 0, 1], n: 26 }, clamp01(g));
    if (p) items.push({ key, id, ...p, color: c, deep: d, tissue: 'cartilage' });
  };
  bar('b1', 'meckel-kartilagoa', BAR_LINE.meckel, 0.2, 0.15, pose.barI, ARCH.i, ARCH_DEEP.i);
  bar('b2', 'reichert-kartilagoa', BAR_LINE.reichert, 0.17, 0.13, pose.barII, ARCH.ii, ARCH_DEEP.ii);
  bar('b3', 'hirugarren-kartilagoa', BAR_LINE.iii, 0.14, 0.11, pose.barIII, ARCH.iii, ARCH_DEEP.iii);
  bar('b4', 'laugarren-kartilagoa', BAR_LINE.iv, 0.13, 0.1, pose.barIV, ARCH.iv, ARCH_DEEP.iv);
  bar('b6', 'seigarren-kartilagoa', BAR_LINE.vi, 0.11, 0.09, pose.barIV, ARCH.vi, ARCH_DEEP.vi);
  pts['meckel-kartilagoa'] = BAR_LINE.meckel[5];
  pts['reichert-kartilagoa'] = BAR_LINE.reichert[5];

  // Arch V: a ridge rising in the groove between IV and VI, then sinking.
  const a5 = clamp01(pose.arch5);
  if (a5 > 0.01) {
    const line = ARCH_LINE.iv.map((p, i): V3 => {
      const q = ARCH_LINE.vi[i];
      return [Math.max(p[0], q[0]) * 1.17, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2];
    });
    const p = vessel(line.slice(1, 9), { r0: 0.2 * a5, r1: 0.14 * a5, sides: 12, ref: [0, 0, 1] });
    if (p) items.push({ key: 'arch5', id: 'bosgarren-arkua', groups: ['faringe-arkuak'], ...p, color: ARCH.v, deep: ARCH_DEEP.v, tissue: 'mesenchyme' });
    pts['bosgarren-arkua'] = line[4];
  }
  return { items, pts };
}
