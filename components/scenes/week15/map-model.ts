import { add, cross, mix3, norm, sub, type V3 } from '@/lib/three-d/math';
import { curve3 } from '@/lib/three-d/mesh';
import { plate, vessel } from '@/lib/three-d/organic';
import type { Item3 } from '@/lib/three-d/scene';
import { blobParts, mixHex, tubeParts } from '@/components/scenes/week10/model3d';
import { T } from '@/components/scenes/week10/common';
import { UC, UP0, uroModel, type UroPose } from './uro-model';
import { PP0, pelvisModel, type PelvisPose } from './pelvis-model';

/**
 * Topic 15 as ONE model (the study room's "Mapa osoa"): the simulator draws the topic in separate models (the
 * posterior wall, the pelvis cut down the middle, the kidney, the nephron, the glans); here the wall and the
 * pelvis are one body, so a student sees in one picture what lies above, below and beside what, and what
 * comes out of what: the three kidneys along the wall, the mesonephric duct running down into the cloaca, the
 * ureteric bud sprouting from its end, the cloaca divided, the bladder with the urachus to the navel, the
 * trigone on its back wall where the ducts open, the urethra down to the glans.
 *
 * The pelvis model (its own axes as the wall's: x the embryo's left, y cranial, z ventral) stands at the wall's
 * caudal end through one matrix (uniform scale, so its tubes stay round); its section, skin and spine are left
 * out (the wall is the ground), and the wall model's ducts end where the pelvis model's cloaca and bladder are.
 * The glans' details (ectodermal cord → navicular fossa, external opening, prepuce, coronal groove) and the
 * trigone are drawn here, in the pelvis model's frame.
 */

export interface MapPose {
  uro: UroPose;
  pelvis: PelvisPose;
  /** The trigone on the bladder's back wall (0..1). */
  trigone: number;
  /** The glans: the ectodermal cord (0..0.5) → canalised: navicular fossa, opening, prepuce (0.5..1). */
  glans: number;
}

/** The pelvis model's frame → the wall's: uniform scale, its cloaca at the wall's cloaca level. */
const S = 0.9;
const TR: V3 = [0, -3.9, 0.36];
const M = new Float32Array([S, 0, 0, 0, 0, S, 0, 0, 0, 0, S, 0, TR[0], TR[1], TR[2], 1]);
/** A pelvis-model point in the map's frame. */
export const P = (p: V3): V3 => [p[0] * S + TR[0], p[1] * S + TR[1], p[2] * S + TR[2]];

/** Pelvis items that are the cut's context (the wall stands for them here). */
const DROP = new Set(['section', 'skin', 'rectum']);

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const darker = (c: string) => mixHex(c, '#000000', 0.55);
const ss = (a: number, b: number, x: number) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};

/** The glans' tip as the pelvis model draws the male phallus (its `tipP`), and the shaft's direction. */
const BASE: V3 = [0, -1.55, 1.25];
const TIP: V3 = [0, -2.35, 2.55];
const AXIS = norm(sub(TIP, BASE));
const SIDE: V3 = [1, 0, 0];
const UPV = cross(AXIS, SIDE);

export interface MapModel {
  items: Item3[];
  pts: Record<string, V3>;
}

export function mapModel(pose: MapPose): MapModel {
  const pp = pose.pelvis;
  const part = clamp01(pp.part);
  // Where each duct opens (pelvis frame, as the pelvis model's own "ducts" draw them): one common opening into
  // the cloaca at first; then the ureter higher on the bladder, the mesonephric duct lower (by the urethra).
  const common = (s: number): V3 => [0.3 * s, -0.62, 0.42];
  const urOpen = (s: number) => mix3(common(s), [0.3 * s, 0.12, 0.38], part);
  const woOpen = (s: number) => mix3(common(s), [0.18 * s, -1.0, 0.5], part);

  const uro = uroModel(pose.uro, { gut: 0, glom: 0, iliac: 0, sink: { ureter: (s) => P(urOpen(s)), wolff: (s) => P(woOpen(s)) } });
  const pel = pelvisModel({ ...pp, ducts: 0 });

  const items: Item3[] = [...uro.items];
  const pts: Record<string, V3> = { ...uro.pts };
  for (const it of pel.items) {
    if (DROP.has(it.key) || it.key.startsWith('vert')) continue;
    items.push({ ...it, key: `p-${it.key}`, matrix: M });
  }
  for (const [k, v] of Object.entries(pel.pts)) pts[k] = P(v);

  // Local builders in the pelvis frame (drawn through the same matrix).
  const male = clamp01(pp.male);
  const push = (it: Item3) => items.push({ ...it, matrix: M });
  // The hindgut's last part only (the pelvis model's climbs to the cut's top edge, in front of the aorta here).
  {
    const hg = curve3([[0, 0.75, -0.9], [0, 0.1, -0.78], [0, -0.3, -0.58], [0, -0.55, -0.42]] as V3[], 14);
    const parts = vessel(hg, { ref: [1, 0, 0], r0: 0.25, r1: 0.23, sides: 16 }, 1);
    if (parts) push({ key: 'rectum', id: 'atzeko-hestea', ...parts, color: UC.endo, deep: UC.endoDeep, tissue: 'epithelium', opacity: 1 });
    pts['atzeko-hestea'] = P([0.22, 0.35, -0.85]);
  }
  const ball = (key: string, id: string, c: V3, r: V3, color: string, op: number, extra: Partial<Item3> = {}) => {
    if (op <= 0.01) return;
    push({ key, id, ...blobParts({ center: c, radii: r, rings: 10, sides: 14 }), color, deep: darker(color), tissue: 'epithelium', opacity: op, ...extra });
  };

  // ———— the trigone: the bladder's back wall between the ureters' and the ducts' openings (mesoderm) ————
  const tri = clamp01(pose.trigone);
  if (tri > 0.01) {
    const outline: [number, number][] = [];
    const corners: [number, number][] = [
      [-0.3, 0.12],
      [0.3, 0.12],
      [0, -0.56],
    ];
    // A rounded triangle (the plate is star-shaped from its centroid).
    for (let c = 0; c < 3; c++) {
      const a = corners[c];
      const b = corners[(c + 1) % 3];
      for (let k = 0; k < 6; k++) outline.push([lerp(a[0], b[0], k / 6), lerp(a[1], b[1], k / 6)]);
    }
    push({ key: 'trigone', id: 'trigonoa', ...plate('map15-trigone-v1', outline, 0.31, 0.27), color: UC.wolff, deep: UC.wolffDeep, tissue: 'epithelium', opacity: tri });
    pts['trigonoa'] = P([0.12, -0.12, 0.26]);
  }

  // ———— the glans: the ectodermal cord, then the navicular fossa, the external opening, the prepuce ————
  const gl = clamp01(pose.glans) * male;
  if (gl > 0.01) {
    const at = (along: number, up = 0): V3 => add(add(TIP, [AXIS[0] * along, AXIS[1] * along, AXIS[2] * along]), [UPV[0] * up, UPV[1] * up, UPV[2] * up]);
    const cord = 1 - ss(0.4, 0.6, gl);
    const open = ss(0.4, 0.6, gl);
    const inner = at(-0.16, 0.02);
    const outer = at(0.36, -0.02);
    const line = curve3([inner, mix3(inner, outer, 0.5), outer] as V3[], 10);
    if (cord > 0.01) {
      push({ key: 'ectocord', id: 'kordoi-ektodermikoa', ...tubeParts(line, { radius: () => 0.06, ref: [1, 0, 0], sides: 10, capStart: true, capEnd: true }), color: T.ecto, deep: darker(T.ecto), tissue: 'epithelium', opacity: cord });
      pts['kordoi-ektodermikoa'] = P(at(0.2, 0.12));
    }
    if (open > 0.01) {
      // Canalised: the ectodermal tube, widened inside the glans (the navicular fossa), open at the tip.
      const parts = vessel(line, { ref: [1, 0, 0], r0: 0.07, r1: 0.06, bulb: 0.8, bulbLen: 0.45, sides: 12, n: 14 }, 1);
      if (parts) push({ key: 'fossa', id: 'hobi-nabikularra', ...parts, color: T.ecto, deep: darker(T.ecto), tissue: 'epithelium', opacity: open, groups: ['uretra'] });
      pts['hobi-nabikularra'] = P(at(0.05, 0.12));
      ball('meatus', 'kanpoko-uretra-zuloa', at(0.38, -0.02), [0.07, 0.07, 0.03], '#3b4f8f', open);
      pts['kanpoko-uretra-zuloa'] = P(at(0.5, -0.06));
      // The prepuce: the skin round the glans (lateral ectodermal cords that open into a fold).
      ball('prepuce', 'prepuzioa', at(-0.02, 0), [0.43, 0.4, 0.42], '#f2c4a8', 0.32 * open, { tissue: 'skin', thin: 0.7, outline: false });
      pts['prepuzioa'] = P(at(-0.12, 0.42));
    }
    // The coronal groove: the ring between the shaft and the glans.
    const ring: V3[] = [];
    for (let k = 0; k <= 24; k++) {
      const a = (k / 24) * Math.PI * 2;
      ring.push(add(at(-0.3), add([SIDE[0] * Math.cos(a) * 0.31, SIDE[1] * Math.cos(a) * 0.31, SIDE[2] * Math.cos(a) * 0.31], [UPV[0] * Math.sin(a) * 0.31, UPV[1] * Math.sin(a) * 0.31, UPV[2] * Math.sin(a) * 0.31])));
    }
    push({ key: 'corona', id: 'ildo-koronarioa', ...tubeParts(ring, { radius: () => 0.035, ref: AXIS, sides: 8 }), color: '#c98a8a', deep: '#6e3a3a', tissue: 'skin', opacity: gl });
    pts['ildo-koronarioa'] = P(at(-0.3, 0.33));
  }
  return { items, pts };
}

// ———————————————————————————— the moments ————————————————————————————

const U = (o: Partial<UroPose>): UroPose => ({ ...UP0, ...o });
const PL = (o: Partial<PelvisPose>): PelvisPose => ({ ...PP0, ...o });

export interface MapMoment {
  id: string;
  /** Short title (the moment bar) and when. */
  title: string;
  when: string;
  pose: MapPose;
}

/** Male and female differ only at the end (the urethra): `sex` 0 male … 1 female is mixed in by `poseAt`. */
export const MAP_MOMENTS: MapMoment[] = [
  {
    id: 'pro',
    title: 'Pronefrosa',
    when: '4. astea (hasiera)',
    pose: { uro: U({ pro: 1, proDuct: 1 }), pelvis: PL({}), trigone: 0, glans: 0 },
  },
  {
    id: 'meso',
    title: 'Mesonefrosa',
    when: '4. astea',
    pose: { uro: U({ pro: 1, proDuct: 1, proGone: 1, meso: 1, wolff: 1, gonadal: 0.6 }), pelvis: PL({ sept: 0.2 }), trigone: 0, glans: 0 },
  },
  {
    id: 'meta',
    title: 'Metanefrosa',
    when: '5. astea',
    pose: { uro: U({ proGone: 1, meso: 1, wolff: 1, mesoGone: 0.35, gonadal: 1, bud: 1, blast: 1 }), pelvis: PL({ sept: 0.55 }), trigone: 0, glans: 0 },
  },
  {
    id: 'kloaka',
    title: 'Kloaka banatuta',
    when: '6.–7. asteak',
    pose: {
      uro: U({ proGone: 1, meso: 1, wolff: 1, mesoGone: 0.6, gonadal: 1, bud: 1, blast: 1, kidney: 1, ascend: 0.35, adrenal: 1, bladder: 1 }),
      pelvis: PL({ sept: 1, split: 1, parts: 1, urachus: 0.2, part: 0.45 }),
      trigone: 0,
      glans: 0,
    },
  },
  {
    id: 'fetua',
    title: 'Giltzurrunak gora',
    when: '3. hilabetea',
    pose: {
      uro: U({ proGone: 1, meso: 1, wolff: 1, mesoGone: 0.85, gonadal: 1, bud: 1, blast: 1, kidney: 1, ascend: 1, adrenal: 1, gonadDown: 0.6, bladder: 1 }),
      pelvis: PL({ sept: 1, split: 1, parts: 1, urachus: 1, part: 1, male: 1, glands: 1 }),
      trigone: 1,
      glans: 0.3,
    },
  },
  {
    id: 'heldua',
    title: 'Jaiotzerako',
    when: 'fetu berantiarra → heldua',
    pose: {
      uro: U({ proGone: 1, meso: 1, wolff: 1, mesoGone: 0.9, gonadal: 1, bud: 1, blast: 1, kidney: 1, ascend: 1, adrenal: 1, gonadDown: 1, bladder: 1 }),
      pelvis: PL({ sept: 1, split: 1, parts: 1, urachus: 1, ligament: 1, part: 1, male: 1, glands: 1 }),
      trigone: 1,
      glans: 1,
    },
  },
];

function mixNum<T extends object>(a: T, b: T, k: number): T {
  const out = { ...a } as Record<string, number>;
  for (const key of Object.keys({ ...a, ...b })) out[key] = lerp((a as Record<string, number>)[key] ?? 0, (b as Record<string, number>)[key] ?? 0, k);
  return out as T;
}

/** The pose at a moment that may lie between two (the glide), male (sex 0) or female (sex 1). */
export function poseAt(u: number, sex: number): MapPose {
  const n = MAP_MOMENTS.length;
  const i = Math.max(0, Math.min(n - 1, Math.floor(u)));
  const j = Math.min(n - 1, i + 1);
  const k = u - i;
  const e = k * k * (3 - 2 * k);
  const a = MAP_MOMENTS[i].pose;
  const b = MAP_MOMENTS[j].pose;
  const pelvis = mixNum(a.pelvis, b.pelvis, e);
  // The sex shows in the urethra only: what the male pose gives to the male, the female takes.
  const m = pelvis.male;
  pelvis.male = m * (1 - sex);
  pelvis.female = m * sex;
  return { uro: mixNum(a.uro, b.uro, e), pelvis, trigone: lerp(a.trigone, b.trigone, e), glans: lerp(a.glans, b.glans, e) };
}
