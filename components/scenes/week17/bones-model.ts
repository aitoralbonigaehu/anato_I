import { add, mix3, type V3 } from '@/lib/three-d/math';
import { curve3 } from '@/lib/three-d/mesh';
import { vessel, type Parts, type VesselOptions } from '@/lib/three-d/organic';
import type { Item3 } from '@/lib/three-d/scene';
import { blobParts, mixHex, tubeParts } from '@/components/scenes/week10/model3d';
import { ARCH, TISSUE } from './common';

/**
 * Topic 17, 2.2.2–2.6.2: the arches' cartilage bars from the embryo's left, the notes' figure of p.4 right, as a
 * head cut in the midline (a solid slab behind everything; midline parts are cut in half by it). One model with a
 * pose: the bars degenerate, the bones form, and every part travels from its embryonic place (adult 0) to its adult
 * place (adult 1). A part wears its arch's colour for good: I orange, II blue, III yellow, IV red, VI green.
 *
 * Axes: x towards the embryo's LEFT (the viewer), y cranial, z ventral. From the left the face looks to the
 * viewer's left.
 */

export interface BonesPose {
  /** Embryonic layout (0) → adult layout (1). */
  adult: number;
  /** Mandible's two plates growing from the chin along Meckel (0..1). */
  bone: number;
  /** Meckel degenerated (0..1); the plates close over where it was. */
  deg: number;
  /** Maxilla, zygomatic and temporal squama (0..1). */
  maxBones: number;
  /** Reichert degenerated, its ends left as bones (0..1). */
  rdeg: number;
  /** Upper half of the hyoid body (II) (0..1). */
  h2: number;
  /** Lower half of the hyoid body + greater horn (III) (0..1). */
  h3: number;
  /** The temporal's petrous part (0..1). */
  petrous: number;
  /** Nerves VII and IX grown (0..1). */
  n7: number;
  n9: number;
  /** Stylopharyngeus (0..1) and superior constrictor (0..1). */
  stylo: number;
  constr: number;
  /** Larynx parts (0..1 each): thyroid, cricoid, epiglottis, arytenoid + small pairs, tracheal rings. */
  thyroid: number;
  cricoid: number;
  epi: number;
  aryt: number;
  rings: number;
}

export const BONES0: BonesPose = { adult: 0, bone: 0, deg: 0, maxBones: 0, rdeg: 0, h2: 0, h3: 0, petrous: 0, n7: 0, n9: 0, stylo: 0, constr: 0, thyroid: 0, cricoid: 0, epi: 0, aryt: 0, rings: 0 };

export interface BonesOpts {
  dim?: { ids: readonly string[]; k: number } | null;
}

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const ss = (a: number, b: number, x: number) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const darker = (c: string) => mixHex(c, '#000000', 0.55);
/** Bone: the arch's colour, a little paler than its cartilage. */
const boneOf = (c: string) => mixHex(c, '#fff4e0', 0.22);

const MECKEL_E: V3[] = [[0.62, 3.25, -1.35], [0.75, 2.65, -0.35], [0.8, 2.05, 0.75], [0.7, 1.55, 1.85], [0.35, 1.35, 2.75], [0.08, 1.3, 3.1]];
const MECKEL_A: V3[] = [[0.72, 2.45, -1.15], [0.86, 1.25, -1.05], [0.86, 0.55, -0.45], [0.8, 0.45, 0.9], [0.45, 0.45, 2.2], [0.08, 0.5, 2.8]];
const REICHERT_E: V3[] = [[0.45, 3.02, -2.3], [0.5, 2.4, -1.95], [0.55, 1.6, -1.35], [0.55, 0.95, -0.7], [0.48, 0.5, -0.05], [0.42, 0.25, 0.55]];
const REICHERT_A: V3[] = [[0.42, 2.9, -2.4], [0.5, 2.45, -2.15], [0.55, 1.7, -1.9], [0.6, 0.9, -1.2], [0.6, -0.1, -0.1], [0.46, -0.32, 0.62]];
const NERVE7: V3[] = [[0.2, 4.4, -2.85], [0.62, 3.35, -2.95], [0.88, 2.25, -2.5], [0.98, 1.72, -1.25], [0.98, 2.05, 0.3], [0.92, 2.55, 1.7]];
const NERVE9: V3[] = [[0.2, 3.9, -3.05], [0.76, 2.6, -2.85], [0.78, 1.2, -2.15], [0.72, 0.45, -1.3], [0.62, 0.62, 0.0], [0.42, 0.8, 1.0]];
const PHARYNX: V3[] = [[0, 2.4, -1.55], [0, 0.8, -1.4], [0, -1.0, -1.08], [0, -2.5, -0.72]];
const HEAD_LINE_E: V3[] = [[-0.35, -5.4, -0.75], [-0.35, -1, -0.35], [-0.35, 2.2, 0.15], [-0.35, 6.4, -0.3]];
const HEAD_LINE_A: V3[] = [[-0.35, -5.4, -0.85], [-0.35, -1, -0.65], [-0.35, 2.2, 0.0], [-0.35, 6.4, -0.55]];
const mixLine = (a: readonly V3[], b: readonly V3[], k: number) => a.map((p, i) => mix3(p, b[i], k));
/** Offset a line in the y–z plane, perpendicular to it (the mandible's two plates). */
function offsetYZ(line: V3[], d: number): V3[] {
  return line.map((p, i) => {
    const a = line[Math.max(0, i - 1)];
    const b = line[Math.min(line.length - 1, i + 1)];
    const ty = b[1] - a[1], tz = b[2] - a[2];
    const l = Math.hypot(ty, tz) || 1;
    return [p[0], p[1] + (tz / l) * d, p[2] - (ty / l) * d];
  });
}
const at = (line: V3[], u: number) => line[Math.min(line.length - 1, Math.round(clamp01(u) * (line.length - 1)))];

export function bonesModel(pose: BonesPose, o: BonesOpts = {}) {
  const items: Item3[] = [];
  const pts: Record<string, V3> = {};
  const dim = o.dim;
  const fade = (id: string, groups?: readonly string[]) => (!dim || dim.k <= 0.001 || dim.ids.includes(id) || (groups ?? []).some((g) => dim.ids.includes(g)) ? 1 : 1 - 0.72 * dim.k);
  const put = (key: string, id: string | undefined, parts: Parts | null, color: string, op = 1, extra: Partial<Item3> = {}) => {
    if (!parts || op <= 0.01) return;
    items.push({ key, id, ...parts, color, deep: darker(color), tissue: 'epithelium', opacity: op * (id ? fade(id, extra.groups) : 1), ...extra });
  };
  const ball = (key: string, id: string | undefined, c: V3, r: V3, color: string, k = 1, extra: Partial<Item3> = {}) => {
    if (k <= 0.01) return;
    put(key, id, blobParts({ center: c, radii: [r[0] * k, r[1] * k, r[2] * k], rings: 14, sides: 18 }), color, 1, extra);
  };
  const vess = (key: string, id: string | undefined, line: V3[], color: string, prof: VesselOptions, g = 1, extra: Partial<Item3> = {}) => {
    if (g <= 0.01) return;
    put(key, id, vessel(line, { ref: [1, 0, 0], sides: 14, n: 26, ...prof }, g), color, 1, extra);
  };

  const a = ss(0, 1, pose.adult);
  const deg = clamp01(pose.deg);
  const rdeg = clamp01(pose.rdeg);

  // ———— the head cut in the midline: the ground everything lies on ————
  const headR = lerp(3.9, 3.7, a);
  const headLine = curve3(mixLine(HEAD_LINE_E, HEAD_LINE_A, a), 34);
  const headRadius = (u: number) => {
    const r = 1.85 + (headR - 1.85) * ss(0.34, 0.62, u);
    return u > 0.8 ? r * Math.sqrt(Math.max(0.0025, 1 - ((u - 0.8) / 0.2) ** 2)) : r;
  };
  items.push({ key: 'head', ...tubeParts(headLine.map((p): V3 => [p[0] - 0.95, p[1], p[2]]), { radius: headRadius, around: (ang) => 1 - 0.92 * Math.cos(ang) ** 2, ref: [1, 0, 0], sides: 40, capStart: true, capEnd: true }), color: TISSUE.ground, deep: TISSUE.groundDeep, tissue: 'mesenchyme', opacity: 1, quiet: true, ground: true });

  // The pharynx, deep: only context (what the third arch's muscles act on).
  const phar = curve3(PHARYNX.map((p) => add(p, [0, -0.3 * a, -0.15 * a])), 20);
  put('pharynx', undefined, vessel(phar, { r0: 0.68, r1: 0.55, ref: [1, 0, 0], sides: 18, n: 20 }), '#d8a48f', 1, { quiet: true, tissue: 'mesenchyme' });

  // ———— arch I ————
  const mLine = curve3(mixLine(MECKEL_E, MECKEL_A, a), 30);
  const ear: V3 = [-0.1 * a, -0.1 * a, -0.18 * a];
  const malleus: V3 = add([0.64, 3.42, -1.45], ear);
  const incus: V3 = add([0.72, 3.55, -2.0], ear);
  const stapes: V3 = add([0.5, 3.0, -2.42], ear);
  if (deg < 0.985) {
    // Thins away along its whole length; its top stays joined to the malleus until it has gone.
    const rm = (u: number) => (0.27 - 0.06 * u) * (1 - deg * (0.75 + 0.25 * u)) * (u > 0.94 ? Math.sqrt(Math.max(0.05, 1 - ((u - 0.94) / 0.06) ** 2)) : 1);
    const shown = deg < 0.02 ? mLine : mLine.slice(0, Math.max(3, Math.round(mLine.length * (1 - 0.5 * ss(0.5, 1, deg)))));
    items.push({ key: 'meckel', id: 'meckel-kartilagoa', ...tubeParts(shown, { radius: rm, ref: [1, 0, 0], sides: 16, capStart: true, capEnd: true }), color: ARCH.i, deep: darker(ARCH.i), tissue: 'epithelium', opacity: fade('meckel-kartilagoa') });
  }
  pts['meckel-kartilagoa'] = at(mLine, deg < 0.5 ? 0.55 : 0.25);

  const bone = clamp01(pose.bone);
  const mand = boneOf(ARCH.i);
  if (bone > 0.01) {
    const rev = [...mLine].reverse();
    const d = lerp(0.42, 0.14, deg);
    const r = lerp(0.2, 0.34, deg);
    const prof: VesselOptions = { r0: r, r1: r * 0.9, flat: 0.42, sides: 16, n: 30 };
    vess('mand-up', 'baraila', offsetYZ(rev, d), mand, prof, bone);
    vess('mand-lo', 'baraila', offsetYZ(rev, -d), mand, prof, bone);
    // The core fills the groove only as Meckel leaves it, so the two plates end as one bone.
    if (deg > 0.02) vess('mand-core', 'baraila', rev, mand, { r0: lerp(0.05, 0.42, deg), r1: lerp(0.05, 0.38, deg), flat: 0.42, sides: 16, n: 30, bulb: 0.25 * a }, bone);
    pts['baraila'] = add(at(rev, Math.min(0.5, bone * 0.5)), [0.2, -d, 0]);
  }

  // The maxillary process's bones (membranous, each grows in place).
  const mx = ss(0, 1, pose.maxBones);
  const maxC = mix3([0.55, 2.55, 2.2], [0.75, 2.0, 2.15], a);
  const zygC = mix3([0.75, 3.05, 1.1], [0.95, 2.7, 1.0], a);
  const squC = mix3([0.55, 3.95, -0.95], [0.5, 4.05, -1.2], a);
  const mxBone = boneOf(ARCH.i);
  ball('maxilla', 'hezur-maxilarra', maxC, [0.34, 0.62, 0.75], mxBone, mx, { groups: ['luzapen-maxilarra'] });
  ball('zygoma', 'zigomatikoa', zygC, [0.22, 0.34, 0.62], mxBone, mx, { groups: ['luzapen-maxilarra'] });
  ball('squama', 'tenporalaren-ezkata', squC, [0.18, 0.85, 0.95], mxBone, mx, { groups: ['luzapen-maxilarra'] });
  pts['hezur-maxilarra'] = add(maxC, [0.2, 0, 0]);
  pts['zigomatikoa'] = add(zygC, [0.15, 0, 0]);
  pts['tenporalaren-ezkata'] = add(squC, [0.1, 0.1, 0]);

  // The temporal's petrous part: grey, it comes from the base's mesenchyme, not from an arch.
  const pet = ss(0, 1, pose.petrous);
  const petC = mix3([0.08, 3.2, -2.1], [0.08, 3.05, -2.3], a);
  ball('petrous', 'arkaitza', petC, [0.3, 0.55, 0.95], '#b9b2a4', pet, { tissue: 'mesenchyme' });
  pts['arkaitza'] = add(petC, [0.1, -0.32, -0.55]);

  // The ossicles: drawn large enough to read (the notes' figure does the same).
  const iC = ARCH.i, iiC = ARCH.ii;
  ball('malleus-head', 'mailua', malleus, [0.2, 0.25, 0.2], boneOf(iC));
  vess('malleus-neck', 'mailua', [malleus, add(malleus, [0.03, -0.3, 0.12]), add(malleus, [0.03, -0.56, 0.16])], boneOf(iC), { r0: 0.09, r1: 0.05, sides: 10, n: 10 });
  ball('incus-body', 'ingudea', incus, [0.18, 0.21, 0.19], boneOf(iC));
  vess('incus-long', 'ingudea', [add(incus, [0, -0.05, 0]), add(incus, [-0.05, -0.34, -0.14]), add(stapes, [0.03, 0.16, 0.08])], boneOf(iC), { r0: 0.08, r1: 0.05, sides: 10, n: 10 });
  vess('incus-short', 'ingudea', [incus, add(incus, [0, 0.08, -0.34])], boneOf(iC), { r0: 0.08, r1: 0.04, sides: 10, n: 8 });
  pts['mailua'] = add(malleus, [0.15, 0.02, 0.02]);
  pts['ingudea'] = add(incus, [0.12, 0.02, 0]);

  // ———— arch II ————
  const rLine = curve3(mixLine(REICHERT_E, REICHERT_A, a), 30);
  const sub = (u0: number, u1: number) => rLine.slice(Math.round(u0 * (rLine.length - 1)), Math.round(u1 * (rLine.length - 1)) + 1);
  if (rdeg < 0.985) {
    items.push({ key: 'reichert', id: 'reichert-kartilagoa', ...tubeParts(rLine, { radius: () => 0.2 * (1 - rdeg) + 0.004, ref: [1, 0, 0], sides: 14, capStart: true, capEnd: true }), color: iiC, deep: darker(iiC), tissue: 'epithelium', opacity: fade('reichert-kartilagoa') });
  }
  pts['reichert-kartilagoa'] = at(rLine, 0.6);
  const rb = ss(0.05, 0.75, rdeg);
  const stBone = boneOf(iiC);
  // Stapes (always there: the top of the bar): the arch and the footplate.
  ball('stapes-plate', 'ointokia', add(stapes, [-0.04, -0.15, -0.12]), [0.1, 0.05, 0.14], stBone);
  vess('stapes-a', 'ointokia', [add(stapes, [0.03, 0.16, 0.08]), add(stapes, [0.02, 0.02, 0.14]), add(stapes, [-0.04, -0.15, -0.03])], stBone, { r0: 0.045, sides: 8, n: 8 });
  vess('stapes-b', 'ointokia', [add(stapes, [0.03, 0.16, 0.08]), add(stapes, [0.02, 0.05, -0.12]), add(stapes, [-0.04, -0.15, -0.2])], stBone, { r0: 0.045, sides: 8, n: 8 });
  pts['ointokia'] = add(stapes, [0.02, 0.04, 0.02]);
  // Its lower end: styloid, then the stylohyoid ligament (notes' figure), then the lesser horn.
  const sty = sub(0.14, 0.44);
  vess('styloid', 'estiloide-apofisia', sty, stBone, { r0: 0.13, r1: 0.05, sides: 12, n: 14 }, rb);
  pts['estiloide-apofisia'] = at(sty, 0.4);
  const lesser = sub(0.84, 1);
  vess('lesser', 'hioide-adar-txikia', [...lesser].reverse(), stBone, { r0: 0.13, r1: 0.075, sides: 12, n: 10 }, rb, { groups: ['hioide-hezurra'] });
  pts['hioide-adar-txikia'] = at(lesser, 0.35);
  const lig = sub(0.44, 0.84);
  vess('stylohyoid-lig', 'lotailu-estilohioideoa', lig, mixHex(iiC, '#ffffff', 0.45), { r0: 0.028, sides: 8, n: 16 }, ss(0.7, 1, rdeg));
  pts['lotailu-estilohioideoa'] = at(lig, 0.5);

  // ———— the hyoid: body split upper II / lower III, in the midline (cut by the slab) ————
  const yb = lerp(0.05, -0.55, a);
  const zb = lerp(0.65, 0.72, a);
  const body = (dy: number): V3[] => curve3([[0, yb + dy, zb + 0.52], [0.3, yb + dy, zb + 0.42], [0.52, yb + dy, zb + 0.08]], 12);
  const h2 = ss(0, 1, pose.h2);
  const h3 = ss(0, 1, pose.h3);
  if (h2 > 0.01) put('hy-up', 'hioide-gorputz-goia', vessel(body(0.125), { r0: 0.15 * h2 + 0.01, ref: [0, 1, 0], sides: 14, n: 12 }), stBone, 1, { groups: ['hioide-gorputza', 'hioide-hezurra'] });
  if (h3 > 0.01) put('hy-lo', 'hioide-gorputz-behea', vessel(body(-0.125), { r0: 0.15 * h3 + 0.01, ref: [0, 1, 0], sides: 14, n: 12 }), boneOf(ARCH.iii), 1, { groups: ['hioide-gorputza', 'hioide-hezurra'] });
  pts['hioide-gorputz-goia'] = [0.3, yb + 0.18, zb + 0.48];
  pts['hioide-gorputz-behea'] = [0.3, yb - 0.18, zb + 0.48];
  pts['hioide-gorputza'] = [0.3, yb, zb + 0.48];
  const great: V3[] = curve3([[0.5, yb - 0.1, zb + 0.08], [0.72, yb + 0.05, zb - 0.62], [0.8, yb + 0.38, zb - 1.42]], 18);
  vess('great', 'hioide-adar-nagusia', great, boneOf(ARCH.iii), { r0: 0.11, r1: 0.07, bulb: 0.45, sides: 12, n: 18 }, h3, { groups: ['hioide-hezurra'] });
  pts['hioide-adar-nagusia'] = at(great, 0.55);
  pts['hioide-hezurra'] = pts['hioide-gorputza'];

  // ———— nerves ————
  const n7 = curve3(NERVE7, 36);
  const n9 = curve3(NERVE9, 36);
  vess('n7', 'aurpegi-nerbioa', n7, TISSUE.nerve, { r0: 0.075, r1: 0.05, sides: 10, n: 36 }, pose.n7);
  vess('n9', 'glosofaringeoa', n9, TISSUE.nerve, { r0: 0.075, r1: 0.05, sides: 10, n: 36 }, pose.n9);
  vess('n9b', 'glosofaringeoa', [at(n9, 0.5), add(at(n9, 0.5), [-0.1, -0.3, 0.25]), [0.56, 0.8, -1.25]], TISSUE.nerve, { r0: 0.04, r1: 0.03, sides: 8, n: 10 }, ss(0.55, 1, pose.n9));
  pts['aurpegi-nerbioa'] = at(n7, 0.32);
  pts['glosofaringeoa'] = at(n9, 0.35);

  // ———— the third arch's deep muscles (yellow) ————
  const styTip = at(sty, 1);
  const styTo: V3 = add(at(phar, 0.42), [0.58, 0, 0.05]);
  vess('stylopharyngeus', 'muskulu-estilofaringeoa', [styTip, mix3(styTip, styTo, 0.5), styTo], ARCH.iii, { r0: 0.06, r1: 0.1, sides: 10, n: 14 }, pose.stylo);
  pts['muskulu-estilofaringeoa'] = mix3(styTip, styTo, 0.45);
  const cP = at(phar, 0.3);
  const crc = Array.from({ length: 19 }, (_, i): V3 => {
    const t = -Math.PI / 2 + (i / 18) * Math.PI;
    return [Math.cos(t) * 0.72, cP[1], cP[2] + Math.sin(t) * 0.72];
  });
  const cs = clamp01(pose.constr);
  if (cs > 0.01) put('constrictor', 'goiko-muskulu-ertzatzaileak', vessel(crc, { r0: 0.46, ref: [0, 0, 1], flat: 0.82, sides: 16, n: 22 }, cs), ARCH.iii, 1);
  pts['goiko-muskulu-ertzatzaileak'] = [0.68, cP[1], cP[2] + 0.05];

  // ———— the larynx: every part IV (red) or VI (green), then the tracheal rings ————
  const dy = -0.4 * a;
  const yT = -1.55 + dy;
  const lamina = (y: number): V3[] => curve3([[0.62, y, -0.6], [0.68, y, 0.1], [0.42, y, 0.72], [0.01, y, 1.02]], 18);
  const thy = ss(0, 1, pose.thyroid);
  const tgroups = { groups: ['tiroide-kartilagoa'] };
  if (thy > 0.01) {
    put('thy-up', 'tiroide-goia', vessel(lamina(yT + 0.27), { r0: 0.3 * thy, ref: [1, 0, 0], flat: 0.62, sides: 16, n: 20 }), ARCH.iv, 1, tgroups);
    put('thy-lo', 'tiroide-behea', vessel(lamina(yT - 0.27), { r0: 0.3 * thy, ref: [1, 0, 0], flat: 0.62, sides: 16, n: 20 }), ARCH.vi, 1, tgroups);
  }
  pts['tiroide-goia'] = [0.67, yT + 0.3, 0.32];
  pts['tiroide-behea'] = [0.67, yT - 0.3, 0.32];
  pts['tiroide-kartilagoa'] = [0.67, yT, 0.32];

  const yC = -2.52 + dy;
  const zL = 0.12;
  const ring: V3[] = Array.from({ length: 21 }, (_, i): V3 => {
    const t = (i / 20) * Math.PI; // ventral midline → dorsal midline, on the left
    return [Math.sin(t) * 0.55, yC - 0.02 + 0.3 * (i / 20) ** 2, zL + Math.cos(t) * 0.62];
  });
  const cri = ss(0, 1, pose.cricoid);
  if (cri > 0.01) put('cricoid', 'krikoide-kartilagoa', vessel(ring, { r0: 0.14, r1: 0.3, ref: [1, 0, 0], flat: 0.35, sides: 14, n: 22 }, cri), ARCH.vi);
  pts['krikoide-kartilagoa'] = at(ring, 0.35);

  const ep = clamp01(pose.epi);
  const epL: V3[] = curve3([[0.1, yT + 0.2, 0.52], [0.12, yT + 0.6, 0.62], [0.12, yT + 1.0, 0.5], [0.12, yT + 1.32, 0.15]], 18);
  vess('epiglottis', 'epiglotisa', epL, ARCH.vi, { r0: 0.1, r1: 0.26, flat: 0.68, sides: 14, n: 18 }, ep);
  pts['epiglotisa'] = at(epL, 0.82);

  const ar = ss(0, 1, pose.aryt);
  const ary: V3 = [0.22, yC + 0.62, -0.34];
  ball('arytenoid', 'aritenoide-kartilagoa', ary, [0.13, 0.26, 0.16], ARCH.vi, ar);
  ball('corniculate', 'kartilago-kornikulatua', add(ary, [-0.02, 0.32, -0.04]), [0.07, 0.09, 0.07], mixHex(ARCH.vi, '#ffffff', 0.18), ar);
  ball('cuneiform', 'kartilago-kuneiformea', add(ary, [0.02, 0.3, 0.3]), [0.07, 0.11, 0.07], mixHex(ARCH.vi, '#000000', 0.12), ar);
  pts['aritenoide-kartilagoa'] = add(ary, [0.05, -0.05, 0]);
  pts['kartilago-kornikulatua'] = add(ary, [-0.02, 0.32, -0.04]);
  pts['kartilago-kuneiformea'] = add(ary, [0.02, 0.3, 0.3]);

  // The tracheal rings: neutral, not an arch's.
  const rg = clamp01(pose.rings);
  for (let k = 0; k < 5; k++) {
    const y = yC - 0.72 - k * 0.42;
    const g = ss(k / 5, (k + 1) / 5, rg);
    const line: V3[] = Array.from({ length: 15 }, (_, i): V3 => {
      const t = (i / 14) * Math.PI * 0.86;
      return [Math.sin(t) * 0.48, y, zL + Math.cos(t) * 0.5];
    });
    if (g > 0.01) put(`ring${k}`, 'trakea', vessel(line, { r0: 0.11 * g, ref: [0, 1, 0], flat: 0.2, sides: 10, n: 16 }), '#cfd8dc');
  }
  pts['trakea'] = [0.42, yC - 1.14, zL + 0.25];

  return { items, pts };
}
