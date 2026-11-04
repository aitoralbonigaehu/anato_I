import { add, type V3 } from '@/lib/three-d/math';
import { curve3, grid } from '@/lib/three-d/mesh';
import { cachedMesh } from '@/lib/three-d/mesh-cache';
import type { Item3 } from '@/lib/three-d/scene';
import { blobParts, mixHex, tubeParts } from '@/components/scenes/week10/model3d';
import { C } from '@/lib/sim/palette';

/**
 * Topic 15, notes 2.1: the suprarenal gland cut open (its front half taken away, the notes' row of round
 * sections): from the 6th week the fetal (embryonic) cortex from cells of the urogenital ridge (mesoderm,
 * pink); neural crest cells from the sympathetic ganglia at the same level go medially into it and settle
 * deep inside: the medulla (ectoderm, blue). A new layer forms in the fetal cortex: the definitive cortex
 * (dark magenta). The medulla first shrinks, then grows again; the fetal cortex is gone during the first year.
 *
 * Own frame: x towards the embryo's LEFT, y cranial, z ventral; the gland is seen from the front, cut at z = 0
 * (the medial side, where the crest cells come from, on the viewer's left).
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

export function adrenalModel(pose: AdrenalPose, o: AdrenalOpts = {}) {
  const items: Item3[] = [];
  const pts: Record<string, V3> = {};
  const dim = o.dim;
  const fade = (id: string) => (!dim || dim.k <= 0.001 || dim.ids.includes(id) ? 1 : 1 - 0.75 * dim.k);
  const shell = (key: string, id: string, r: number, color: string, deep: string, op: number) => {
    if (op <= 0.01 || r <= 0.01) return;
    // The back half of an ellipsoid (a bowl), its inside facing the viewer: the cut gland seen from the front.
    const q = Math.round(r * 200) / 200;
    const mesh = cachedMesh('adrenal-bowl15', [q], () =>
      grid(28, 14, (u, v) => {
        const a = u * Math.PI * 2;
        const th = v * Math.PI * 0.5;
        return [q * 0.92 * Math.sin(th) * Math.cos(a), q * Math.sin(th) * Math.sin(a), -q * 0.85 * Math.cos(th)];
      }, [0, 0, 6]),
    );
    items.push({ key, id, groups: ['giltzurrun-gaineko-guruinak'], mesh, hit: mesh, color, deep, tissue: 'epithelium', opacity: op * fade(id) });
  };

  // The urogenital ridge the fetal cortex comes from (context, below and lateral).
  items.push({ key: 'ridge', id: 'gandor-urogenitala', ...blobParts({ center: [1.0, -2.0, -0.2], radii: [0.5, 0.9, 0.45], rings: 10, sides: 14 }), color: AC.ridge, deep: darker(AC.ridge), tissue: 'mesenchyme', opacity: 0.5 * (1 - ss(0.6, 1, pose.fetal) * 0.6) * fade('gandor-urogenitala'), outline: false });
  pts['gandor-urogenitala'] = [1.35, -2.3, 0.3];

  // ———— the fetal cortex (mesoderm), thinning away during the first year ————
  const fetal = clamp01(pose.fetal);
  const gone = clamp01(pose.fetalGone);
  const def = clamp01(pose.definitive);
  const outer = R * (0.35 + 0.65 * fetal);
  // The definitive cortex: a layer forming in the fetal cortex's outer part, then the whole cortex.
  const defIn = outer * lerp(1, lerp(0.8, 0.5, gone), def);
  shell('def', 'behin-betiko-kortexa', outer * (1 + 0.02 * def), AC.definitive, AC.definitiveDeep, def);
  shell('fetal', 'fetu-kortexa', def > 0.01 ? defIn * 0.995 : outer, AC.fetal, AC.fetalDeep, fetal * (1 - gone));
  pts['fetu-kortexa'] = [lerp(0.55, 0.62, def) * outer, lerp(0.45, 0.2, def) * outer, -0.05];
  pts['behin-betiko-kortexa'] = [0.72 * outer, 0.62 * outer, -0.05];

  // ———— the medulla: neural crest cells come in from the sympathetic ganglion (medially) and settle inside ————
  const crest = clamp01(pose.crest);
  const med = clamp01(pose.medulla);
  // Size: shrinks at first, then grows again (medSize 0 → 1 → 2).
  const ms = pose.medSize <= 1 ? lerp(1, 0.6, pose.medSize) : lerp(0.6, 1.25, pose.medSize - 1);
  const ganglion: V3 = [-2.55, 0.9, -0.5];
  items.push({ key: 'ganglion', id: 'gandor-neurala', ...blobParts({ center: ganglion, radii: [0.45, 0.4, 0.4], rings: 10, sides: 14 }), color: AC.crest, deep: darker(AC.crest), tissue: 'nerve', opacity: 0.8 * fade('gandor-neurala') * (1 - 0.6 * med) });
  pts['gandor-neurala'] = add(ganglion, [-0.1, 0.42, 0.3]);
  if (crest > 0.01 && med < 0.99) {
    const path = curve3([ganglion, [-1.7, 0.7, -0.35], [-0.9, 0.35, -0.2], [-0.25, 0.05, -0.1]], 20);
    for (let k = 0; k < 9; k++) {
      const u = clamp01(crest * 1.3 - k * 0.04);
      const p = path[Math.min(path.length - 1, Math.floor(u * (path.length - 1)))];
      const j: V3 = [Math.sin(k * 2.1) * 0.12, Math.cos(k * 1.7) * 0.12, Math.sin(k * 3.3) * 0.08];
      items.push({ key: `cc${k}`, id: 'giltzurrun-gaineko-muina', ...blobParts({ center: add(p, j), radii: [0.11, 0.11, 0.11], rings: 6, sides: 8 }), color: AC.medulla, deep: AC.medullaDeep, tissue: 'nerve', opacity: (1 - med) * fade('giltzurrun-gaineko-muina') });
    }
    pts['muin-zelulak'] = path[10];
  }
  if (med > 0.01) {
    const r = 0.5 * ms * ss(0, 1, med);
    items.push({ key: 'medulla', id: 'giltzurrun-gaineko-muina', ...blobParts({ center: [-0.05, 0, -0.1], radii: [r, r * 1.05, r * 0.9], rings: 14, sides: 18 }), color: AC.medulla, deep: AC.medullaDeep, tissue: 'nerve', opacity: fade('giltzurrun-gaineko-muina') });
    pts['giltzurrun-gaineko-muina'] = [-0.05 - r * 0.4, r * 0.55, 0.2];
  } else if (crest > 0.01) pts['giltzurrun-gaineko-muina'] = pts['muin-zelulak'];

  // A thin capsule line round the cut so the half reads as a section.
  if (fetal > 0.01) {
    const ring = Array.from({ length: 49 }, (_, i): V3 => {
      const a = (i / 48) * Math.PI * 2;
      return [outer * 0.92 * Math.cos(a), outer * Math.sin(a), 0];
    });
    items.push({ key: 'rim', ...tubeParts(ring, { radius: () => 0.022, ref: [0, 0, 1], sides: 6 }), color: '#fde7f1', deep: '#8a5a70', tissue: 'membrane', opacity: 0.6 * fetal, quiet: true, outline: false });
  }
  pts['giltzurrun-gaineko-guruinak'] = [0.75 * outer, -0.62 * outer, 0];
  return { items, pts };
}
