import { mix3, type V3 } from '@/lib/three-d/math';
import { curve3 } from '@/lib/three-d/mesh';
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
 */

export interface BroadPose {
  /** The folds (and their ducts) moving medially and meeting in the midline (0..1). */
  merge: number;
  /** The bladder in front (0..1); the two pouches named (0..1). */
  bladder: number;
  pouches: number;
}

export const BR0: BroadPose = { merge: 0, bladder: 0, pouches: 0 };

export interface BroadOpts {
  dim?: { ids: readonly string[]; k: number } | null;
}

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const darker = (c: string) => mixHex(c, '#000000', 0.55);
const L = (kps: readonly V3[], n = 16) => curve3(kps as V3[], n);
const ZH = 0.85;
const PERI = '#f9a8b8';
const OVARY = '#b8e8e0';

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

  // ———— the body wall (ring), the sacrum/vertebra behind, the rectum ————
  const ring = Array.from({ length: 48 }, (_, i): V3 => {
    const a = (i / 47) * Math.PI * 2;
    return [2.25 * Math.sin(a), 1.75 * Math.cos(a), 0];
  });
  for (const z of [ZH, -ZH]) tube(`rim${z}`, undefined, ring.map((p) => [p[0], p[1], z] as V3), T.ecto, 0.03, 0.4, { quiet: true, outline: false }, 6);
  ball('wall', undefined, [0, 0, 0], [2.25, 1.75, ZH], '#f0c9b4', 0.07, { outline: false, quiet: true, tissue: 'skin' }, 14, 24);
  ball('sacrum', undefined, [0, 1.45, 0], [0.55, 0.28, ZH * 0.95], '#e9e1cf', 0.55, { tissue: 'bone', quiet: true }, 10, 14);
  tube('rectum', 'ondestea', along(0, 0.85), UC.endo, 0.32, 0.85, { deep: UC.endoDeep });
  pts['ondestea'] = [0.32, 1.05, ZH];

  // ———— the peritoneum lining the cavity; the folds with their ducts and the gonads ————
  const inner = ring.map((p): V3 => [p[0] * 0.9, p[1] * 0.88, 0]);
  for (const z of [ZH * 0.98]) tube('periLine', 'paretako-peritoneoa', inner.map((p) => [p[0], p[1], z] as V3), PERI, 0.03, 0.7, { outline: false }, 6);
  pts['paretako-peritoneoa'] = [-1.85, -0.6, ZH];
  for (const s of [-1, 1]) {
    // The duct goes from beside the posterior wall (lateral) to the midline, a little in front of the middle.
    const duct: V3 = [s * lerp(1.25, 0.16, m), lerp(0.35, -0.15, m), 0];
    // The fold: from the posterior wall (its root) to the duct; with the merge it becomes the broad ligament out to the side walls.
    const root: V3 = [s * lerp(1.25, 1.95, m), lerp(1.05, -0.15, m), 0];
    const sheet = L([root, mix3(root, duct, 0.5), duct], 10);
    items.push({ key: `fold${s}`, id: m > 0.6 ? 'lotailu-zabala' : 'mesoa', ...tubeParts(sheet.map((p) => [p[0], p[1], 0] as V3), { radius: () => 0.07, ref: [0, 0, 1], sides: 8, capStart: true, capEnd: true }), color: PERI, deep: darker(PERI), tissue: 'membrane', opacity: 0.9 * fade('lotailu-zabala', ['mesoa']), groups: ['lotailu-zabala', 'mesoa'] });
    // The fold as a sheet along the block (cranio-caudal) so it reads as a wall.
    const mid = mix3(root, duct, 0.5);
    ball(`foldW${s}`, m > 0.6 ? 'lotailu-zabala' : 'mesoa', mid, [Math.max(0.08, Math.abs(root[0] - duct[0]) / 2), Math.max(0.06, Math.abs(root[1] - duct[1]) / 2), ZH * 0.95], PERI, 0.28, { outline: false, thin: 0.6, tissue: 'membrane', groups: ['lotailu-zabala', 'mesoa'] }, 8, 12);
    tube(`muller${s}`, m > 0.8 ? 'utero-hodia' : 'hodi-paramesonefrikoa', along(duct[0], duct[1]), UC.muller, lerp(0.14, 0.18, m), 1, { deep: UC.mullerDeep, groups: ['hodi-paramesonefrikoa', 'utero-hodia'] });
    tube(`wolff${s}`, 'hodi-mesonefrikoa', along(duct[0] + s * 0.25, duct[1] + 0.08), UC.wolff, 0.07, 0.6 * (1 - 0.7 * m), { deep: UC.wolffDeep });
    // The gonad (ovary) lateral to the duct; at the end behind the broad ligament.
    const ov: V3 = [s * lerp(1.55, 1.1, m), lerp(-0.05, 0.3, m), 0.35];
    ball(`ov${s}`, 'obarioa', ov, [0.3, 0.22, 0.38], OVARY, 0.95, { groups: ['gonadak'], deep: '#3f8f84' });
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
    ball('uterus', 'uteroa', [0, -0.15, 0], [0.42, 0.3, ZH * 0.9], UC.muller, (m - 0.8) / 0.2, { deep: UC.mullerDeep, groups: ['utero-hodia'] });
    pts['uteroa'] = [0.35, -0.38, ZH * 0.8];
  }

  // ———— the bladder in front; the two pouches ————
  const bl = clamp01(pose.bladder);
  ball('bladder', 'gernu-maskuria', [0, -1.2, 0], [0.7, 0.35, ZH * 0.9], UC.endo, 0.8 * bl, { deep: UC.endoDeep });
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
