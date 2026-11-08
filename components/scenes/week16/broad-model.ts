import { mix3, type V3 } from '@/lib/three-d/math';
import { curve3, grid, merge } from '@/lib/three-d/mesh';
import { cachedMesh } from '@/lib/three-d/mesh-cache';
import { plate, vessel, type VesselOptions } from '@/lib/three-d/organic';
import type { Item3 } from '@/lib/three-d/scene';
import { blobParts, mixHex, tubeParts } from '@/components/scenes/week10/model3d';
import { T } from '@/components/scenes/week10/common';
import { UC } from '@/components/scenes/week15/uro-model';

/**
 * Topic 16, notes 3.4 (the three transverse sections and the sagittal one): a slab of the lower abdomen and
 * pelvis cut across. The urogenital folds hang from the posterior wall either side, each with its paramesonephric
 * duct at the free edge and the gonad beside it. Going down, the ducts move medially and meet in the midline (the
 * uterine canal), dragging their mesentery: one big fold from the uterus out to the pelvis's side walls, the broad
 * ligament, which divides the pelvic cavity in two: in front the vesicouterine pouch (between bladder and uterus),
 * behind the rectouterine pouch (between uterus and rectum). The ovaries end behind the broad ligament.
 *
 * Own frame (a block): x = the embryo's LEFT, y = DORSAL, z = CRANIAL; seen from the cranial side, dorsal up.
 *
 * Built to the quality bar (docs/quality/3d-quality-bar.md): a solid slab. The body wall is a ring with
 * thickness (its cut face on top, the inside lined with peritoneum), the cavity has a floor (the next cut), the
 * folds are sheets with real thickness running through the slab, and the organs are solid. The two pouches stay
 * see-through on purpose: they are spaces.
 */

export interface BroadPose {
  /** The folds (and their ducts) moving medially and meeting in the midline (0..1). */
  merge: number;
  /** The bladder in front (0..1); the two pouches named (0..1). */
  bladder: number;
  pouches: number;
  /** 0..1: the wall's right half lifts away (the block seen from that side). */
  open?: number;
}

export const BR0: BroadPose = { merge: 0, bladder: 0, pouches: 0, open: 0 };

export interface BroadOpts {
  dim?: { ids: readonly string[]; k: number } | null;
}

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const darker = (c: string) => mixHex(c, '#000000', 0.55);
const L = (kps: readonly V3[], n = 16) => curve3(kps as V3[], n);
const ZH = 0.85;
const ss01 = (a: number, b: number, x: number) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const PERI = '#f9a8b8';
const OVARY = '#b8e8e0';
const RX = 2.25, RY = 1.75, IN = 0.86;
const ell = (k: number, a: number, z: number): V3 => [RX * k * Math.sin(a), RY * k * Math.cos(a), z];
/** The body wall: a ring of tissue the slab's height, its top the cut face, its inside the cavity's wall. */
// Two halves (the embryo's left, x > 0, and right): the right one lifts away when the block is seen from that side.
const half = (h: 0 | 1, u: number) => (h + u) * Math.PI;
const WALL_TOP = (h: 0 | 1) => cachedMesh(`broad-wall-top-v2-${h}`, [], () => grid(32, 1, (u, v) => ell(lerp(IN, 1, v), half(h, u), ZH), [0, 0, 10]));
const WALL_SIDES = (h: 0 | 1) =>
  cachedMesh(`broad-wall-sides-v2-${h}`, [], () =>
    merge([
      grid(32, 2, (u, v) => ell(IN, half(h, u), lerp(ZH, -ZH, v)), [0, 0, 0]),
      grid(32, 2, (u, v) => ell(1, half(h, u), lerp(ZH, -ZH, v)), [0, -10, 0]),
      // The two ends of the half: the cut through the wall where the halves meet.
      grid(1, 2, (u, v) => ell(lerp(IN, 1, u), half(h, 0), lerp(ZH, -ZH, v)), [h ? -10 : 10, 0, 0]),
      grid(1, 2, (u, v) => ell(lerp(IN, 1, u), half(h, 1), lerp(ZH, -ZH, v)), [h ? -10 : 10, 0, 0]),
    ]),
  );
const FLOOR = Array.from({ length: 48 }, (_, i): [number, number] => {
  const a = (i / 48) * Math.PI * 2;
  return [RX * IN * Math.sin(a), RY * IN * Math.cos(a)];
});

export function broadModel(pose: BroadPose, o: BroadOpts = {}) {
  const items: Item3[] = [];
  const pts: Record<string, V3> = {};
  const dim = o.dim;
  const fade = (id: string, groups?: readonly string[]) => (!dim || dim.k <= 0.001 || dim.ids.includes(id) || (groups ?? []).some((g) => dim.ids.includes(g)) ? 1 : 1 - 0.75 * dim.k);
  const along = (x: number, y: number, h = ZH): V3[] => [[x, y, h], [x, y, 0], [x, y, -h]];
  const tube = (key: string, id: string | undefined, line: V3[], color: string, r: number, op = 1, extra: Partial<Item3> = {}, sides = 14) => {
    if (op <= 0.01 || line.length < 2) return;
    items.push({ key, id, ...tubeParts(line, { radius: () => r, ref: [0, 1, 0], sides, capStart: true, capEnd: true }), color, deep: darker(color), tissue: 'epithelium', opacity: op * (id ? fade(id, extra.groups) : 1), ...extra });
  };
  const ball = (key: string, id: string | undefined, c: V3, r: V3, color: string, op = 1, extra: Partial<Item3> = {}, rings = 12, sides = 18) => {
    if (op <= 0.01) return;
    items.push({ key, id, ...blobParts({ center: c, radii: r, rings, sides }), color, deep: darker(color), tissue: 'epithelium', opacity: op * (id ? fade(id, extra.groups) : 1), ...extra });
  };
  const m = clamp01(pose.merge);
  const vess = (key: string, id: string | undefined, line: V3[], color: string, prof: VesselOptions, op = 1, extra: Partial<Item3> = {}) => {
    const parts = op > 0.01 ? vessel(line, { ref: [0, 1, 0], sides: 16, ...prof }) : null;
    if (parts) items.push({ key, id, ...parts, color, deep: darker(color), tissue: 'epithelium', opacity: op * (id ? fade(id, extra.groups) : 1), ...extra });
  };

  // ———— the body wall (a ring with thickness), the cavity's floor, the sacrum behind, the rectum ————
  const open = clamp01(pose.open ?? 0);
  for (const h of [0, 1] as const) {
    // h = 1 is the right half (x < 0), the side the block is turned to: it lifts away.
    const op = h ? 1 - open : 1;
    if (op < 0.02) continue;
    const top = WALL_TOP(h), sides = WALL_SIDES(h);
    items.push({ key: `wallTop${h}`, mesh: top, hit: top, color: UC.wallCut, deep: UC.wallCutDeep, tissue: 'mesenchyme', opacity: op, quiet: true, ground: true });
    items.push({ key: `wallSides${h}`, mesh: sides, hit: sides, color: mixHex(UC.wall, PERI, 0.25), deep: UC.wallDeep, tissue: 'mesenchyme', opacity: op, quiet: true, ground: true, outline: false });
  }
  items.push({ key: 'floor', ...plate('broad-floor-v1', FLOOR, -ZH, -ZH - 0.1), color: '#2b3247', deep: '#10131c', tissue: 'membrane', opacity: 1, quiet: true, ground: true, outline: false });
  items.push({ key: 'sacrum', ...blobParts({ center: [0, 1.45, 0], radii: [0.55, 0.28, ZH * 0.98], rings: 10, sides: 14 }), color: '#cfc6b4', deep: '#6e6656', tissue: 'bone', opacity: 1, quiet: true, ground: true });
  vess('rectum', 'ondestea', along(0, 0.85), UC.endo, { r0: 0.32 }, 1, { deep: UC.endoDeep });
  pts['ondestea'] = [0.32, 1.05, ZH];

  // ———— the peritoneum lining the cavity; the folds with their ducts and the gonads ————
  // The parietal peritoneum: the lining of the cavity's wall (a pink line round the cut).
  const lining = Array.from({ length: 65 }, (_, i): V3 => ell(IN * 0.995, (i / 64) * Math.PI * 2, ZH));
  tube('periLine', 'paretako-peritoneoa', lining, PERI, 0.035, 1, { outline: false }, 6);
  pts['paretako-peritoneoa'] = [-1.85, -0.6, ZH];
  for (const s of [-1, 1]) {
    // The duct goes from beside the posterior wall (lateral) to the midline, a little in front of the middle.
    const duct: V3 = [s * lerp(1.25, 0.16, m), lerp(0.35, -0.15, m), 0];
    // The fold: from the posterior wall (its root) to the duct; with the merge it becomes the broad ligament out to the side walls.
    const root: V3 = [s * lerp(1.25, 2.0, m), lerp(1.05, -0.15, m), 0];
    // The fold: a sheet with real thickness from its root to the duct, running the slab's height (a tube tall
    // in z, squashed across its own line).
    const sheet = L([root, mix3(root, duct, 0.5), duct], 12);
    const d = [duct[0] - root[0], duct[1] - root[1]];
    const across: V3 = [-d[1], d[0], 0];
    vess(`fold${s}`, m > 0.6 ? 'lotailu-zabala' : 'mesoa', sheet, PERI, { r0: ZH * 0.92, flat: 0.91, ref: across, sides: 20, capStart: false, capEnd: false }, 1, { tissue: 'membrane', thin: 0.4, groups: ['lotailu-zabala', 'mesoa'] });
    const mid = mix3(root, duct, 0.5);
    vess(`muller${s}`, m > 0.8 ? 'utero-hodia' : 'hodi-paramesonefrikoa', along(duct[0], duct[1]), UC.muller, { r0: lerp(0.14, 0.18, m) }, 1, { deep: UC.mullerDeep, groups: ['hodi-paramesonefrikoa', 'utero-hodia'] });
    // The mesonephric duct thins away (the female), rather than fading to glass.
    vess(`wolff${s}`, 'hodi-mesonefrikoa', along(duct[0] + s * 0.25, duct[1] + 0.08), UC.wolff, { r0: 0.075 * (1 - 0.6 * m) }, 1 - ss01(0.8, 1, m), { deep: UC.wolffDeep });
    // The gonad (ovary) lateral to the duct; at the end behind the broad ligament.
    const ov: V3 = [s * lerp(1.55, 1.1, m), lerp(-0.05, 0.3, m), 0.35];
    ball(`ov${s}`, 'obarioa', ov, [0.3, 0.22, 0.38], OVARY, 1, { groups: ['gonadak'], deep: '#3f8f84' });
    if (s > 0) {
      pts['hodi-paramesonefrikoa'] = [duct[0] + 0.1, duct[1] - 0.2, ZH];
      pts['utero-hodia'] = [duct[0] + 0.05, duct[1] - 0.25, ZH];
      pts['obarioa'] = [ov[0] + 0.25, ov[1] + 0.2, ZH * 0.6];
      pts['lotailu-zabala'] = [mid[0] + 0.1, mid[1] - 0.12, ZH];
      pts['mesoa'] = pts['lotailu-zabala'];
      pts['hodi-mesonefrikoa'] = [duct[0] + s * 0.3, duct[1] + 0.25, ZH];
    }
  }
  // The uterus (the fused ducts) once they meet.
  if (m > 0.8) {
    // The fused ducts' walls thicken round them: the uterus grows out of the two.
    const k = (m - 0.8) / 0.2;
    ball('uterus', 'uteroa', [0, -0.15, 0], [lerp(0.3, 0.42, k), lerp(0.2, 0.3, k), ZH * 0.9], UC.muller, 1, { deep: UC.mullerDeep, groups: ['utero-hodia'] });
    pts['uteroa'] = [0.35, -0.38, ZH * 0.8];
  }

  // ———— the bladder in front; the two pouches ————
  const bl = clamp01(pose.bladder);
  if (bl > 0.01) ball('bladder', 'gernu-maskuria', [0, -1.2, 0], [0.7 * (0.5 + 0.5 * bl), 0.35 * (0.5 + 0.5 * bl), ZH * 0.9], UC.endo, 1, { deep: UC.endoDeep });
  pts['gernu-maskuria'] = [0.6, -1.35, ZH * 0.7];
  const po = clamp01(pose.pouches);
  if (po > 0.01) {
    ball('vu', 'zaku-hondo-uterobesikala', [0, -0.7, 0], [0.9, 0.16, ZH * 0.85], '#8fb8ff', 0.35 * po, { outline: false, tissue: 'membrane', thin: 0.3 });
    ball('ru', 'zaku-hondo-uteroerrektala', [0, 0.38, 0], [0.75, 0.16, ZH * 0.85], '#8fb8ff', 0.35 * po, { outline: false, tissue: 'membrane', thin: 0.3 });
    pts['zaku-hondo-uterobesikala'] = [-0.75, -0.72, ZH];
    pts['zaku-hondo-uteroerrektala'] = [-0.65, 0.42, ZH];
  }
  return { items, pts };
}
