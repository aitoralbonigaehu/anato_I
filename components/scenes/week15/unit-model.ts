import { add, type V3 } from '@/lib/three-d/math';
import { curve3 } from '@/lib/three-d/mesh';
import type { Item3 } from '@/lib/three-d/scene';
import { blobParts, mixHex, tubeParts } from '@/components/scenes/week10/model3d';
import { T } from '@/components/scenes/week10/common';
import { UC } from './uro-model';

/**
 * Topic 15's section block (the notes' transverse figures of 1.1 and 1.2): a slab of the embryo cut across at
 * the neck (pronephros) or the thorax (mesonephros), three segments thick so the longitudinal duct that joins
 * the tubules is seen running from one to the next. Neural tube and somites dorsally, the dorsal aortas, the
 * intermediate mesoderm where the units form, the intra-embryonic coelom and the gut ventrally.
 *
 * The unit's whole story is posed here: cell cluster → vesicle → tubule (straight in the pronephros, opening
 * medially into the coelom; folded in the mesonephros, opening laterally into the mesonephric duct), the
 * lateral ends joined into the longitudinal duct, the aorta's branches ending in glomeruli (external, into the
 * coelom; internal, towards the tubule), the tubule's end capping the glomerulus (Bowman's capsule, never
 * fused), and the afferent and efferent arterioles.
 *
 * Own frame (a block): x = the embryo's LEFT, y = DORSAL, z = CRANIAL. A camera from the cranial side sees the
 * cut face as the notes draw it: dorsal up, the embryo's left on the viewer's right.
 */

export const BLOCK_AXES = {
  up: 'dortsala',
  front: 'kraneala',
  side: 'ezkerra',
  sideDir: [1, 0, 0] as V3,
  edges: { up: 'Dortsala', down: 'Bentrala', front: 'Kraneala', back: 'Kaudala', side: 'Ezkerra', otherSide: 'Eskuina' },
};

export interface UnitPose {
  /** 0 = pronephros (pink, straight, opens into the coelom), 1 = mesonephros (orange, folded, opens into the Wolff duct). */
  mode: number;
  /** Cells of the intermediate mesoderm gather (0..1), hollow into a vesicle (0..1). */
  cluster: number;
  vesicle: number;
  /** The vesicle lengthens into a tubule (0..1); its medial end opens into the coelom (0..1, pronephros). */
  tubule: number;
  open: number;
  /** The lateral ends join into the longitudinal duct, cranial → caudal (0..1). */
  duct: number;
  /** Branches of the dorsal aorta: internal glomeruli (0..1), external glomeruli (0..1). */
  glom: number;
  extGlom: number;
  /** The tubule's end and the glomerulus come together: the capsule round it (0..1). */
  cap: number;
  /** The tubule folds (0..1). */
  twist: number;
  /** The mesonephric ridge bulging into the coelom (0..1); the gonadal ridge medially (0..1). */
  ridge: number;
  gonadal: number;
  /** Afferent and efferent arterioles (0..1). */
  arterioles: number;
}

export const UNIT0: UnitPose = { mode: 0, cluster: 0, vesicle: 0, tubule: 0, open: 0, duct: 0, glom: 0, extGlom: 0, cap: 0, twist: 0, ridge: 0, gonadal: 0, arterioles: 0 };

export interface UnitOpts {
  dim?: { ids: readonly string[]; k: number } | null;
}

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const darker = (c: string) => mixHex(c, '#000000', 0.55);
const L = (kps: readonly V3[], n = 16) => curve3(kps as V3[], n);
const X = (s: number, p: V3): V3 => [s * p[0], p[1], p[2]];
const grown = (line: V3[], g: number) => (g >= 0.999 ? line : line.slice(0, Math.max(2, Math.round(line.length * clamp01(g)))));
const ss = (a: number, b: number, x: number) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};

/** The three segments' levels (z) in the block, cranial first. */
export const SEG_Z = [0.7, 0, -0.7] as const;
const ZH = 1.05;
/** Where the unit forms (the intermediate mesoderm), the glomerulus, the duct, in the cut plane. */
const IM: [number, number] = [1.28, 0.5];
const GLOM: [number, number] = [0.84, 0.18];
const DUCT_PRO: [number, number] = [1.68, 0.5];
const DUCT_MESO: [number, number] = [1.62, 0.12];

export function unitModel(pose: UnitPose, o: UnitOpts = {}) {
  const items: Item3[] = [];
  const pts: Record<string, V3> = {};
  const dim = o.dim;
  const fade = (id: string, groups?: readonly string[]) => (!dim || dim.k <= 0.001 || dim.ids.includes(id) || (groups ?? []).some((g) => dim.ids.includes(g)) ? 1 : 1 - 0.78 * dim.k);
  const tube = (key: string, id: string | undefined, line: V3[], color: string, r: number | ((u: number) => number), op = 1, extra: Partial<Item3> = {}, sides = 12) => {
    if (op <= 0.01 || line.length < 2) return;
    items.push({ key, id, ...tubeParts(line, { radius: typeof r === 'number' ? () => r : r, ref: [0, 1, 0], sides, capStart: true, capEnd: true }), color, deep: darker(color), tissue: 'epithelium', opacity: op * (id ? fade(id, extra.groups) : 1), ...extra });
  };
  const ball = (key: string, id: string | undefined, c: V3, r: V3, color: string, op = 1, extra: Partial<Item3> = {}, rings = 12, sides = 16) => {
    if (op <= 0.01) return;
    items.push({ key, id, ...blobParts({ center: c, radii: r, rings, sides }), color, deep: darker(color), tissue: 'epithelium', opacity: op * (id ? fade(id, extra.groups) : 1), ...extra });
  };
  const along = (x: number, y: number): V3[] => [[x, y, ZH], [x, y, 0], [x, y, -ZH]];
  const m = clamp01(pose.mode);
  const unitColor = mixHex(UC.pro, UC.meso, m);
  const unitDeep = mixHex(UC.proDeep, UC.mesoDeep, m);

  // ———— context: body wall, neural tube, notochord, somites, aortas, coelom, gut ————
  const wall = Array.from({ length: 40 }, (_, i): V3 => {
    const a = (i / 39) * Math.PI * 2;
    return [2.2 * Math.sin(a), 0.1 + 1.65 * Math.cos(a), 0];
  });
  // The body wall as a see-through ring (ectoderm outside), extruded along the block.
  for (const z of [ZH, -ZH]) tube(`rim${z}`, undefined, wall.map((p) => [p[0], p[1], z]), T.ecto, 0.022, 0.3, { quiet: true, outline: false }, 6);
  items.push({ key: 'wall', ...blobParts({ center: [0, 0.1, 0], radii: [2.2, 1.65, ZH], rings: 14, sides: 24 }), color: '#f0c9b4', deep: '#a07060', tissue: 'skin', opacity: 0.08, outline: false, quiet: true });
  tube('neural', 'hodi-neurala', along(0, 1.22), T.neural, 0.3, 0.9, { tissue: 'neural', groups: [] });
  pts['hodi-neurala'] = [0.2, 1.42, ZH];
  tube('noto', undefined, along(0, 0.78), T.noto, 0.07, 0.8, { quiet: true });
  for (const z of SEG_Z)
    for (const s of [-1, 1]) ball(`som${z}${s}`, 'somitak', X(s, [0.78, 1.08, z]), [0.36, 0.32, 0.27], UC.somite, 0.75, { tissue: 'mesenchyme' }, 10, 12);
  pts['somitak'] = X(1, [0.9, 1.25, SEG_Z[0] + 0.2]);
  for (const s of [-1, 1]) tube(`ao${s}`, 'aorta-dortsalak', along(s * 0.32, 0.46), UC.aorta, 0.15, 1, { tissue: 'vessel' });
  pts['aorta-dortsalak'] = X(1, [0.34, 0.5, ZH]);
  // The intra-embryonic coelom: the cavity either side of the gut (a space, drawn as one).
  for (const s of [-1, 1]) ball(`coel${s}`, 'enbrioi-barruko-zeloma', X(s, [1.05, -0.62, 0]), [0.72, 0.52, ZH * 0.98], '#8fb8ff', 0.16, { outline: false, tissue: 'membrane', thin: 0.3 });
  pts['enbrioi-barruko-zeloma'] = X(1, [1.15, -0.75, ZH]);
  tube('gut', undefined, along(0, -0.72), UC.endo, 0.24, 0.75, { quiet: true });
  items.push({ key: 'mesentery', ...blobParts({ center: [0, -0.1, 0], radii: [0.06, 0.42, ZH * 0.98], rings: 6, sides: 10 }), color: T.visceral, deep: darker(T.visceral), tissue: 'membrane', opacity: 0.45, quiet: true, outline: false });

  // The intermediate mesoderm: where the units form, along the block on both sides.
  const imOp = 1 - 0.65 * ss(0.2, 0.9, pose.vesicle);
  for (const s of [-1, 1]) tube(`im${s}`, 'bitarteko-mesodermoa', along(s * IM[0], IM[1]), UC.inter, 0.2, 0.32 * imOp, { tissue: 'mesenchyme', outline: false });
  pts['bitarteko-mesodermoa'] = X(1, [IM[0] + 0.12, IM[1] + 0.16, ZH]);

  // The mesonephric ridge bulging into the coelom; medially, the gonadal ridge.
  if (pose.ridge > 0.01)
    for (const s of [-1, 1]) {
      ball(`ridge${s}`, 'mesonefrosa', X(s, [1.32, 0.12, 0]), [0.5 * pose.ridge, 0.5 * pose.ridge, ZH * 0.97], UC.ridge, 0.28, { groups: ['kordoi-nefrogenoa', 'gandor-urogenitala', 'gernu-gandorra'], outline: false, tissue: 'mesenchyme', deep: UC.ridgeDeep });
      if (s > 0) pts['mesonefrosa'] = X(s, [1.72, -0.18, ZH * 0.6]);
    }
  if (pose.gonadal > 0.01) {
    for (const s of [-1, 1]) ball(`gr${s}`, 'gonada-gandorra', X(s, [0.62, -0.32, 0]), [0.2 * pose.gonadal, 0.3 * pose.gonadal, ZH * 0.9], UC.gonad, 0.85, { groups: ['gandor-urogenitala'], deep: UC.gonadDeep });
    pts['gonada-gandorra'] = X(1, [0.72, -0.45, ZH * 0.8]);
    pts['gandor-urogenitala'] = X(1, [1.1, -0.5, ZH * 0.85]);
  }

  // ———— the units: one per side in each of the three segments ————
  const cl = clamp01(pose.cluster);
  const ve = clamp01(pose.vesicle);
  const tu = clamp01(pose.tubule);
  const tw = clamp01(pose.twist);
  const cap = clamp01(pose.cap);
  const duct = m > 0.5 ? DUCT_MESO : DUCT_PRO;
  SEG_Z.forEach((z, k) => {
    for (const s of [-1, 1]) {
      const at = X(s, [IM[0], IM[1], z]);
      // Cluster → vesicle (a hollow ball: a lumen shows through the thinned wall).
      const ballOp = cl * (1 - ss(0.5, 1, tu));
      if (ballOp > 0.01) {
        const id = m > 0.5 ? 'xixku-mesonefrikoa' : 'nefrotomak';
        ball(`clu${k}${s}`, id, at, [0.2, 0.18, 0.17].map((v) => v * (0.6 + 0.4 * cl)) as unknown as V3, unitColor, ballOp * (1 - 0.35 * ve), { deep: unitDeep, thin: 0.5 * ve, groups: ['xixkua'] }, 10, 12);
        if (ve > 0.01) ball(`lum${k}${s}`, undefined, at, [0.1 * ve, 0.09 * ve, 0.08 * ve], '#2a0f1c', ballOp, { quiet: true, outline: false }, 8, 10);
      }
      if (tu > 0.01) {
        // The tubule: medial end towards the coelom / the glomerulus, lateral end to the duct.
        const med: V3 = X(s, [lerp(0.98, GLOM[0] + 0.14, cap), lerp(-0.05, GLOM[1], cap), z]);
        const lat: V3 = X(s, [duct[0], duct[1], z]);
        const mid1 = add(at, X(s, [-0.12, -0.18 * tw, 0.12 * tw]));
        const mid2 = add(at, X(s, [0.16, 0.2 * tw, -0.14 * tw]));
        const path = L([med, mid1, at, mid2, lat], 20);
        const id = m > 0.5 ? 'hodixka-mesonefrikoak' : 'hodixka-pronefrikoak';
        tube(`tub${k}${s}`, id, grown(path.slice().reverse(), tu).reverse(), unitColor, 0.07, 1, { deep: unitDeep, groups: m > 0.5 ? [] : ['nefrotomak'] }, 10);
        // Pronephros: the medial end opens into the coelom (a little funnel); its lateral end widens and rounds.
        if (pose.open > 0.01 && m < 0.5) ball(`fun${k}${s}`, 'hodixka-pronefrikoak', add(med, X(s, [-0.04, -0.06, 0])), [0.11 * pose.open, 0.07 * pose.open, 0.11 * pose.open], unitColor, 0.9 * (1 - m), { deep: unitDeep, thin: 0.4 }, 8, 10);
        if (pose.duct < 0.5) ball(`wid${k}${s}`, id, lat, [0.11 * tu, 0.11 * tu, 0.13 * tu], unitColor, 0.95, { deep: unitDeep }, 8, 10);
        if (k === 1 && s > 0) {
          pts[id] = add(path[6], [0.05, -0.12, 0.25]);
          pts['hodixka-medial'] = med;
          pts['hodixka-lateral'] = lat;
        }
      }
      // Bowman's capsule: the tubule's end cups the glomerulus (in contact, not fused).
      if (cap > 0.01) {
        ball(`cap${k}${s}`, 'kapsula-glomerularra', X(s, [GLOM[0], GLOM[1], z]), [0.2 * cap, 0.2 * cap, 0.18 * cap], unitColor, 0.5, { thin: 0.75, deep: unitDeep, groups: ['korpuskulua'] }, 12, 16);
        if (k === 0 && s > 0) pts['kapsula-glomerularra'] = X(s, [GLOM[0] + 0.16, GLOM[1] + 0.1, z + 0.12]);
      }
      // Branches of the dorsal aorta: the internal glomerulus (to the unit) and the external one (into the coelom).
      if (pose.glom > 0.01) {
        const g = pose.glom;
        const line = L([X(s, [0.36, 0.42, z]), X(s, [0.58, 0.3, z]), X(s, [GLOM[0] - 0.06, GLOM[1], z])], 10);
        tube(`gbr${k}${s}`, 'glomeruluak', grown(line, g), UC.aorta, 0.04, 1, { tissue: 'vessel', groups: ['barneko-glomeruluak', 'korpuskulua'] }, 8);
        ball(`glo${k}${s}`, 'barneko-glomeruluak', X(s, [GLOM[0], GLOM[1], z]), [0.12 * ss(0.5, 1, g), 0.12 * ss(0.5, 1, g), 0.11 * ss(0.5, 1, g)], UC.glom, 1, { tissue: 'vessel', groups: ['glomeruluak', 'korpuskulua'] }, 10, 12);
        if (k === 1 && s > 0) pts['barneko-glomeruluak'] = X(s, [GLOM[0] + 0.05, GLOM[1] + 0.05, z + 0.2]);
      }
      if (pose.extGlom > 0.01) {
        const g = pose.extGlom;
        const line = L([X(s, [0.32, 0.36, z - 0.15]), X(s, [0.46, 0.0, z - 0.18]), X(s, [0.6, -0.2, z - 0.18])], 10);
        tube(`ebr${k}${s}`, 'kanpoko-glomeruluak', grown(line, g), UC.aorta, 0.035, 1, { tissue: 'vessel', groups: ['glomeruluak'] }, 8);
        ball(`eglo${k}${s}`, 'kanpoko-glomeruluak', X(s, [0.64, -0.24, z - 0.18]), [0.1 * ss(0.5, 1, g), 0.1 * ss(0.5, 1, g), 0.1 * ss(0.5, 1, g)], UC.glom, 1, { tissue: 'vessel', groups: ['glomeruluak'] }, 10, 12);
        if (k === 1 && s > 0) pts['kanpoko-glomeruluak'] = X(s, [0.7, -0.32, z - 0.05]);
      }
      // Afferent (from the aorta, red) and efferent (on to the posterior cardinal vein, blue) arterioles.
      if (pose.arterioles > 0.01) {
        const a = pose.arterioles;
        const eff = L([X(s, [GLOM[0] + 0.05, GLOM[1] + 0.12, z + 0.06]), X(s, [1.0, 0.62, z + 0.08]), X(s, [1.22, 0.92, z])], 10);
        tube(`eff${k}${s}`, 'arteriola-eferentea', grown(eff, a), T.deo2, 0.035, 1, { tissue: 'vessel' }, 8);
        if (k === 1 && s > 0) {
          pts['arteriola-eferentea'] = eff[5];
          pts['arteriola-aferentea'] = X(s, [0.6, 0.3, z]);
        }
      }
    }
  });
  if (pose.glom > 0.01) pts['glomeruluak'] = pts['barneko-glomeruluak'];
  if (pose.arterioles > 0.01) {
    // The afferent arteriole is the aortic branch itself (drawn above); the efferent joins the posterior cardinal vein.
    for (const s of [-1, 1]) tube(`card${s}`, 'atzeko-bena-kardinalak', along(s * 1.25, 0.95), T.deo2, 0.11, 0.9, { tissue: 'vessel' });
    pts['atzeko-bena-kardinalak'] = X(1, [1.28, 1.1, ZH]);
    for (const k of [0, 1, 2]) for (const s of [-1, 1]) {
      const it = items.find((i) => i.key === `gbr${k}${s}`);
      if (it) it.groups = [...(it.groups ?? []), 'arteriola-aferentea'];
    }
  }
  // The longitudinal duct joining the units' lateral ends, cranial → caudal.
  if (pose.duct > 0.01)
    for (const s of [-1, 1]) {
      const id = m > 0.5 ? 'hodi-mesonefrikoa' : 'hodi-pronefrikoa';
      tube(`duct${s}`, id, grown(L(along(s * duct[0], duct[1]), 14), pose.duct), m > 0.5 ? UC.wolff : UC.pro, 0.1, 1, { deep: m > 0.5 ? UC.wolffDeep : UC.proDeep });
      if (s > 0) pts[id] = X(s, [duct[0] + 0.08, duct[1] + 0.12, ZH * 0.75]);
    }
  if (cl > 0.01) {
    pts['nefrotomak'] = X(1, [IM[0] + 0.05, IM[1] + 0.14, SEG_Z[0] + 0.12]);
    pts['xixku-mesonefrikoa'] = pts['nefrotomak'];
  }
  pts['korpuskulua'] = pts['kapsula-glomerularra'] ?? pts['barneko-glomeruluak'] ?? X(1, [GLOM[0], GLOM[1], 0]);
  return { items, pts };
}
