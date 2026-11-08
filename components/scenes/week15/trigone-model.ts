import { add, mix3, norm, type V3 } from '@/lib/three-d/math';
import { curve3, grid } from '@/lib/three-d/mesh';
import { cachedMesh } from '@/lib/three-d/mesh-cache';
import { plate, vessel, type VesselOptions } from '@/lib/three-d/organic';
import type { Item3 } from '@/lib/three-d/scene';
import { blobParts, mixHex, tubeParts } from '@/components/scenes/week10/model3d';
import { UC } from './uro-model';

/**
 * Topic 15, notes 2.3: the bladder seen from behind (the notes' "Gernu maskuriaren atzeko ikuspegia"): at first
 * each mesonephric duct (dark purple) reaches the bladder with the ureteric bud as its branch; the duct's end is
 * taken into the bladder's back wall, so the ureter and the duct open apart: the ureter higher and lateral, the
 * duct lower and medial. The stretch of wall between the four openings is mesodermal (from the ducts): the
 * trigone, a triangle (purple). Later endodermal cells cover it: the epithelium is endodermal all over, but
 * the triangle's trace stays (the ureteric openings at its upper corners).
 *
 * Own frame: x towards the embryo's LEFT, y cranial, z ventral. Seen from behind: the embryo's left on the
 * viewer's left.
 *
 * Built to the quality bar (docs/quality/3d-quality-bar.md): a solid bladder lying against the anterior body
 * wall (the ground, seen past it), the urethra and the urachus flaring out of it, the ducts as tapered vessels
 * flaring into its wall where they open.
 */

export interface TrigonePose {
  /** The ducts' common ends taken into the wall (0..1). */
  absorb: number;
  /** The ureter's opening moving up and out, the duct's down and in (0..1). */
  part: number;
  /** The trigone painted (0..1); covered by endoderm (0..1). */
  trigone: number;
  cover: number;
}

export const TP0: TrigonePose = { absorb: 0, part: 0, trigone: 0, cover: 0 };

export interface TrigoneOpts {
  dim?: { ids: readonly string[]; k: number } | null;
}

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const darker = (c: string) => mixHex(c, '#000000', 0.55);
const L = (kps: readonly V3[], n = 16) => curve3(kps as V3[], n);

const BR: V3 = [1.0, 1.25, 0.8];
/** The anterior body wall behind the bladder (seen from behind, it is the ground). */
const FRONT_WALL = Array.from({ length: 48 }, (_, i): [number, number] => {
  const a = (i / 48) * Math.PI * 2;
  const c = Math.cos(a), sn = Math.sin(a);
  return [3.0 * Math.sign(c) * Math.abs(c) ** 0.4, -0.1 + 2.7 * Math.sign(sn) * Math.abs(sn) ** 0.4];
});
/** A point on the bladder's back surface (z < 0) above (x, y), a little out. */
const onBack = (x: number, y: number, out = 0.03): V3 => {
  const u = x / BR[0];
  const v = y / BR[1];
  const w = Math.max(0, 1 - u * u - v * v);
  const z = -BR[2] * Math.sqrt(w);
  const n = norm([x / (BR[0] * BR[0]), y / (BR[1] * BR[1]), z / (BR[2] * BR[2])]);
  return add([x, y, z], [n[0] * out, n[1] * out, n[2] * out]);
};

export function trigoneModel(pose: TrigonePose, o: TrigoneOpts = {}) {
  const items: Item3[] = [];
  const pts: Record<string, V3> = {};
  const dim = o.dim;
  const fade = (id: string, groups?: readonly string[]) => (!dim || dim.k <= 0.001 || dim.ids.includes(id) || (groups ?? []).some((g) => dim.ids.includes(g)) ? 1 : 1 - 0.75 * dim.k);
  const tube = (key: string, id: string, line: V3[], color: string, r: number, op = 1, extra: Partial<Item3> = {}) => {
    if (op <= 0.01 || line.length < 2) return;
    items.push({ key, id, ...tubeParts(line, { radius: () => r, ref: [0, 0, 1], sides: 14, capStart: true, capEnd: true }), color, deep: darker(color), tissue: 'epithelium', opacity: op * fade(id, extra.groups), ...extra });
  };
  const vess = (key: string, id: string, line: V3[], color: string, prof: VesselOptions, op = 1, extra: Partial<Item3> = {}) => {
    const parts = op > 0.01 ? vessel(line, { ref: [0, 0, 1], sides: 14, ...prof }) : null;
    if (parts) items.push({ key, id, ...parts, color, deep: darker(color), tissue: 'epithelium', opacity: op * fade(id, extra.groups), ...extra });
  };
  const absorb = clamp01(pose.absorb);
  const part = clamp01(pose.part);

  // The bladder (endoderm), pear-shaped: wider below the apex; the urethra below; the urachus from its apex.
  items.push({ key: 'wall', ...plate('trigone-front-wall-v1', FRONT_WALL, 1.05, 1.3), color: UC.wall, deep: UC.wallDeep, tissue: 'mesenchyme', opacity: 1, quiet: true, ground: true });
  items.push({ key: 'bladder', id: 'gernu-maskuria', ...blobParts({ center: [0, 0, 0], radii: BR, rings: 22, sides: 30 }), color: mixHex(UC.endo, '#fff3c4', 0.3), deep: UC.endoDeep, tissue: 'epithelium', opacity: fade('gernu-maskuria') });
  pts['gernu-maskuria'] = [-0.85, 0.65, -0.35];
  // The urethra and the urachus leave the bladder flared, narrowing away from it (no seam where they join).
  vess('urethra', 'uretra', L([[0, -0.95, -0.05], [0, -1.6, 0], [0, -2.3, 0.05]], 10), UC.endo, { r0: 0.2, r1: 0.15, flare: 0.9, flareLen: 0.35 });
  pts['uretra'] = [0.2, -1.8, -0.1];
  vess('urachus', 'urakoa', L([[0, 0.95, 0.12], [0, 1.7, 0.35], [0, 2.4, 0.62]], 10), '#d8c08a', { r0: 0.12, r1: 0.07, flare: 0.8, flareLen: 0.3 }, 0.95);
  pts['urakoa'] = [0.15, 1.95, 0.35];

  // Openings on the back wall: ureters (upper, lateral) and ducts (lower, medial); one common end at first.
  for (const s of [-1, 1]) {
    const common = onBack(s * 0.45, -0.55);
    const urO = mix3(common, onBack(s * 0.55, 0.25), part);
    const woO = mix3(common, onBack(s * 0.2, -0.85), part);
    // The common end, outside the wall at first and taken into it.
    const join: V3 = add(common, [s * 0.55 * (1 - absorb), 0.25 * (1 - absorb), -0.45 * (1 - absorb)]);
    // The mesonephric duct comes down from above and laterally; after parting it runs on downwards.
    const wo = L([[s * 1.9, 2.0, -0.9], [s * 1.6, 0.8, -1.0], mix3(join, add(woO, [s * 0.4, 0.2, -0.3]), part), woO], 22);
    vess(`wolff${s}`, 'hodi-mesonefrikoa', wo.slice().reverse(), UC.wolff, { r0: 0.1, r1: 0.11, flare: 0.5 * absorb, flareLen: 0.18 }, 1, { deep: UC.wolffDeep });
    // The ureter: the duct's branch; once apart it reaches the bladder by itself, higher.
    const urFrom = mix3(wo[12], [s * 2.0, 0.9, -0.7], part);
    const ur = L([[s * 2.3, 2.1, -0.4], mix3([s * 2.0, 1.6, -0.5], urFrom, 0.5), mix3(urFrom, add(urO, [s * 0.35, 0.15, -0.3]), part), part > 0.05 ? urO : join], 22);
    vess(`ureter${s}`, 'ureterra', ur.slice().reverse(), UC.bud, { r0: 0.085, r1: 0.075, flare: 0.5 * absorb * Math.min(1, part * 4), flareLen: 0.16 }, 1, { deep: UC.budDeep, groups: ['ureter-kimua'] });
    if (s > 0) {
      pts['hodi-mesonefrikoa'] = add(wo[5], [0.15, 0, -0.1]);
      pts['ureterra'] = add(ur[6], [0.12, 0.05, -0.1]);
      pts['ureter-kimua'] = pts['ureterra'];
      pts['ureter-zuloa'] = add(urO, [0, 0.05, -0.1]);
    }
    // Rings at the openings once the ends are in the wall.
    if (absorb > 0.3)
      for (const [k, q, c] of [['u', urO, UC.bud], ['w', woO, UC.wolff]] as const) {
        const ring = Array.from({ length: 17 }, (_, i): V3 => {
          const a = (i / 16) * Math.PI * 2;
          return onBack(q[0] + 0.1 * Math.cos(a), q[1] + 0.1 * Math.sin(a), 0.035);
        });
        tube(`ring${k}${s}`, k === 'u' ? 'ureterra' : 'hodi-mesonefrikoa', ring, c, 0.025, (absorb - 0.3) / 0.7);
      }
  }

  // The trigone: the triangle between the openings (ureters above, the urethra's start below), mesodermal.
  const tri = clamp01(pose.trigone);
  if (tri > 0.01) {
    const A = onBack(-0.55 * (0.5 + 0.5 * part), 0.25 * part - 0.55 * (1 - part), 0.04);
    const B = onBack(0.55 * (0.5 + 0.5 * part), 0.25 * part - 0.55 * (1 - part), 0.04);
    const Cc = onBack(0, -1.05, 0.04);
    const key = [A, B, Cc].flat().map((v) => Math.round(v * 1000));
    const mesh = cachedMesh('trigone15', key, () =>
      grid(10, 10, (u, v) => {
        const top = mix3(A, B, v);
        const p = mix3(Cc, top, u);
        return onBack(p[0], p[1], 0.045);
      }, [0, 0, -5]),
    );
    const col = mixHex(UC.wolff, UC.endo, clamp01(pose.cover) * 0.85);
    items.push({ key: 'trigone', id: 'trigonoa', mesh, hit: mesh, color: col, deep: darker(col), tissue: 'epithelium', opacity: tri * fade('trigonoa') });
    pts['trigonoa'] = onBack(0.15, -0.55, 0.1);
  }
  return { items, pts };
}
