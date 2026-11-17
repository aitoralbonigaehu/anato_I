import { add, mix3, norm, type V3 } from '@/lib/three-d/math';
import { curve3, grid } from '@/lib/three-d/mesh';
import { cachedMesh } from '@/lib/three-d/mesh-cache';
import { capsule, deform, deformBy, ellipsoid, smin, surfaceMesh, type SDF } from '@/lib/three-d/sdf';
import { vessel, type Parts, type VesselOptions } from '@/lib/three-d/organic';
import type { Clip3, Item3 } from '@/lib/three-d/scene';
import { blobParts, mixHex, tubeParts } from '@/components/scenes/week10/model3d';
import { ARCH, TISSUE } from './common';
import { maxillaF, zygomaticF } from './skull-model';

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
  /** Maxilla, zygomatic and the temporal's tympanic part (0..1). */
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
const PHARYNX_R = 0.56;
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

// ———— the head: the right half of a fetal head, cut in the midline (built once) ————
/** The profile, [y, z], from the base of the neck up the face, over the vertex and down the nape. */
const PROFILE: [number, number][] = [
  [-5.4, 1.05], [-3.6, 1.1], [-2.2, 1.26], [-1.2, 1.36], [-0.35, 1.75], [0.12, 2.5], [0.5, 3.2], [1.1, 3.44], [1.6, 3.3], [1.95, 3.56], [2.2, 3.42],
  [2.5, 3.7], [2.95, 3.62], [3.2, 4.3], [3.75, 3.95], [4.35, 3.66], [5.0, 3.78], [5.9, 3.3], [6.6, 2.0], [6.95, 0.2], [6.7, -1.8], [5.9, -3.4],
  [4.6, -4.3], [3.2, -4.3], [2.0, -3.7], [0.8, -3.0], [-0.8, -2.7], [-3.0, -2.65], [-5.4, -2.7],
];
const SPINE: [number, number][] = [[-5.4, -0.8], [-2, -0.7], [1, -0.35], [3.6, -0.3], [5.0, -0.45]];
const OUTLINE: [number, number][] = (() => {
  const c = curve3(PROFILE.map(([y, z]): V3 => [0, y, z]), 150).map((p): [number, number] => [p[1], p[2]]);
  const a = c[c.length - 1], b = c[0];
  for (let i = 1; i < 14; i++) c.push([a[0] + ((b[0] - a[0]) * i) / 14, a[1] + ((b[1] - a[1]) * i) / 14]);
  return c;
})();
/** Each outline point's nearest point on the head's inner line: the surface swells from the one to the other. */
const INNER: [number, number][] = OUTLINE.map(([y, z]) => {
  let best: [number, number] = SPINE[0], bd = Infinity;
  for (let i = 0; i < SPINE.length - 1; i++) {
    const [ay, az] = SPINE[i], [by, bz] = SPINE[i + 1];
    const dy = by - ay, dz = bz - az;
    const u = clamp01(((y - ay) * dy + (z - az) * dz) / (dy * dy + dz * dz));
    const q: [number, number] = [ay + dy * u, az + dz * u];
    const d = Math.hypot(y - q[0], z - q[1]);
    if (d < bd) { bd = d; best = q; }
  }
  return best;
});
const ring = (v: number) => Math.round(v * OUTLINE.length) % OUTLINE.length;
const headSkin = (nu: number, nv: number) => grid(nu, nv, (u, v) => {
  const j = ring(v), o = OUTLINE[j], s = INNER[j];
  const w = lerp(1.25, 2.45, ss(-0.5, 3.6, s[0]));
  const k = 1 - Math.cos((u * Math.PI) / 2);
  return [-w * Math.sin((u * Math.PI) / 2), o[0] + (s[0] - o[0]) * k, o[1] + (s[1] - o[1]) * k];
}, [-80, 2, 0]);
/** The flat cut face from the outline in to `to` (1 = all of it; a small `to` = the skin's cut edge). */
const headCut = (nu: number, nv: number, x: number, to: number) => grid(nu, nv, (u, v) => {
  const j = ring(v), o = OUTLINE[j], s = INNER[j];
  return [x, o[0] + (s[0] - o[0]) * u * to, o[1] + (s[1] - o[1]) * u * to];
}, [80, 2, 0]);
const disc = (x: number, c: [number, number], r: [number, number]) => grid(5, 44, (u, v) => [x, c[0] + r[0] * u * Math.sin(v * Math.PI * 2), c[1] + r[1] * u * Math.cos(v * Math.PI * 2)], [80, c[0], c[1]]);
const N_OUT = OUTLINE.length;
const HEAD = {
  skin: (): Parts => ({ mesh: cachedMesh('b17-head-skin', [1], () => headSkin(16, N_OUT)), hit: cachedMesh('b17-head-skin-h', [1], () => headSkin(4, 40)) }),
  cut: (): Parts => ({ mesh: cachedMesh('b17-head-cut', [1], () => headCut(6, N_OUT, 0, 1)), hit: cachedMesh('b17-head-cut-h', [1], () => headCut(2, 40, 0, 1)) }),
  rim: (): Parts => ({ mesh: cachedMesh('b17-head-rim', [1], () => headCut(1, N_OUT, 0.012, 0.055)), hit: cachedMesh('b17-head-rim-h', [1], () => headCut(1, 40, 0.012, 0.055)) }),
  brain: (): Parts => ({ mesh: cachedMesh('b17-head-brain', [1], () => disc(0.008, [4.55, -0.5], [1.9, 3.05])), hit: cachedMesh('b17-head-brain-h', [1], () => disc(0.008, [4.55, -0.5], [1.9, 3.05])) }),
  mouth: (): Parts => ({ mesh: cachedMesh('b17-head-mouth', [2], () => disc(0.008, [2.22, 2.0], [0.13, 1.3])), hit: cachedMesh('b17-head-mouth-h', [2], () => disc(0.008, [2.22, 2.0], [0.13, 1.3])) }),
};

// ———— the face bones, sculpted (the fetal skull's own shapes, built once) ————
/** The fetal skull's frame (skull-model) → this model's: narrower across, so every part stays near the cut. */
const FROM_SKULL = (p: V3): V3 => [p[0] * 0.85 + 0.08, p[1] * 1.654 + 5.595, p[2] * 1.7 - 1.67];
const DIR_FROM_SKULL = (d: V3): V3 => norm([d[0] * 0.85, d[1] * 1.654, d[2] * 1.7]);
const sculpt = (kind: string, f: SDF, lo: V3, hi: V3, step: number): Parts => ({
  mesh: cachedMesh(`b17-${kind}`, [step], () => deform(surfaceMesh(f, lo, hi, step), FROM_SKULL)),
  hit: cachedMesh(`b17-${kind}-h`, [step], () => deform(surfaceMesh(f, lo, hi, step * 3), FROM_SKULL)),
});
/**
 * The left half of the mandible (fetal skull's frame), cut at the chin: a smooth body along the dental arch, a broad
 * ramus, the coronoid process and the condyle, a chin. Smooth segments, so the body is one bar and not a row of beads.
 */
const hemiMandibleF: SDF = (() => {
  const B: V3[] = [[0, -3.02, 2.62], [0.46, -3.0, 2.48], [0.96, -2.94, 2.08], [1.38, -2.84, 1.58], [1.72, -2.7, 1.12]];
  const R = [0.2, 0.19, 0.18, 0.17, 0.17];
  const body = B.slice(1).map((b, i) => capsule(B[i], b, R[i], R[i + 1]));
  const chin = ellipsoid([0.08, -3.1, 2.66], [0.3, 0.17, 0.17]);
  const ramus = ellipsoid([1.9, -2.3, 0.76], [0.1, 0.5, 0.27]);
  const angle = ellipsoid([1.8, -2.66, 0.86], [0.11, 0.22, 0.3]);
  const coronoid = capsule([1.84, -2.2, 0.98], [1.86, -1.62, 1.2], 0.1, 0.03);
  const neck = capsule([1.96, -2.1, 0.6], [2.02, -1.76, 0.5], 0.1, 0.1);
  const condyle = ellipsoid([2.03, -1.72, 0.5], [0.19, 0.11, 0.13]);
  return (x, y, z) => {
    let d = body[0](x, y, z);
    for (let i = 1; i < body.length; i++) d = smin(d, body[i](x, y, z), 0.06);
    d = smin(d, chin(x, y, z), 0.1);
    d = smin(d, angle(x, y, z), 0.14);
    d = smin(d, ramus(x, y, z), 0.16);
    d = smin(d, coronoid(x, y, z), 0.07);
    d = smin(d, neck(x, y, z), 0.07);
    d = smin(d, condyle(x, y, z), 0.05);
    return Math.max(d, 0.012 - x);
  };
})();
const MANDIBLE = () => sculpt('mandible3', hemiMandibleF, [0, -3.45, 0.2], [2.35, -1.5, 2.98], 0.03);
/** The temporal bone, sculpted in this model's own frame round `c` (the squama's centre) and `p` (the petrous part's). */
const SQUAMA_C: V3 = [0.55, 3.95, -0.95];
const PETROUS_C: V3 = [0.08, 3.2, -2.1];
const squamaF: SDF = (() => {
  const c = SQUAMA_C;
  // A thin scale, round above and cut straight below, with its zygomatic process running forwards.
  const fan = ellipsoid(c, [0.12, 1.0, 1.1]);
  const zp = capsule([c[0] + 0.1, c[1] - 0.42, c[2] + 0.55], [c[0] + 0.5, c[1] - 0.5, c[2] + 1.55], 0.11, 0.06);
  return (x, y, z) => smin(Math.max(fan(x, y, z), c[1] - 0.52 - y), zp(x, y, z), 0.12);
})();
const petrousF: SDF = (() => {
  const p = PETROUS_C;
  // The thick part that houses the ear, with the mastoid process below and behind.
  const mass = ellipsoid(p, [0.34, 0.5, 0.86]);
  const mastoid = ellipsoid([p[0] + 0.3, p[1] - 0.52, p[2] - 0.62], [0.24, 0.4, 0.3]);
  const pit = ellipsoid([p[0] + 0.5, p[1] + 0.06, p[2] + 0.12], [0.3, 0.3, 0.34]);
  return (x, y, z) => Math.max(smin(mass(x, y, z), mastoid(x, y, z), 0.2), -pit(x, y, z));
})();
const here = (kind: string, f: SDF, lo: V3, hi: V3, step: number): Parts => ({
  mesh: cachedMesh(`b17-${kind}`, [step], () => surfaceMesh(f, lo, hi, step)),
  hit: cachedMesh(`b17-${kind}-h`, [step], () => surfaceMesh(f, lo, hi, step * 3)),
});
const SQUAMA = () => here('squama2', squamaF, [0.3, 3.3, -2.2], [1.25, 5.1, 0.8], 0.03);
const PETROUS = () => here('petrous', petrousF, [-0.35, 2.2, -3.15], [0.75, 3.8, -1.15], 0.045);
/** A sculpted part grown from its centre (0..1) and carried by `d`. */
const grown = (p: Parts, c: V3, k: number, d: V3, slot: string): Parts => {
  const f = (q: V3): V3 => [c[0] + (q[0] - c[0]) * k + d[0], c[1] + (q[1] - c[1]) * k + d[1], c[2] + (q[2] - c[2]) * k + d[2]];
  return k > 0.999 && Math.abs(d[0]) + Math.abs(d[1]) + Math.abs(d[2]) < 1e-4 ? p : { mesh: deformBy(p.mesh, [k, ...d], f, slot), hit: deformBy(p.hit, [k, ...d], f, slot + 'h') };
};
const MAXILLA = () => sculpt('maxilla', maxillaF, [0, -2.45, 1.3], [1.75, -0.45, 3.2], 0.034);
const ZYGOMA = () => sculpt('zygoma', zygomaticF, [1.1, -1.9, 0.7], [2.3, -0.3, 2.2], 0.032);
/** A sculpted part carried to where the pose has it. */
const moved = (p: Parts, d: V3, slot: string): Parts =>
  Math.abs(d[0]) + Math.abs(d[1]) + Math.abs(d[2]) < 1e-4 ? p : { mesh: deformBy(p.mesh, d, (q) => add(q, d), slot), hit: deformBy(p.hit, d, (q) => add(q, d), slot + 'h') };

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
  const ground = { tissue: 'mesenchyme' as const, opacity: 1, quiet: true, ground: true };
  items.push({ key: 'head', ...HEAD.skin(), color: TISSUE.skin, deep: TISSUE.skinDeep, ...ground, tissue: 'skin' });
  items.push({ key: 'head-cut', ...HEAD.cut(), color: TISSUE.ground, deep: TISSUE.groundDeep, ...ground });
  items.push({ key: 'head-rim', ...HEAD.rim(), color: TISSUE.skin, deep: TISSUE.skinDeep, ...ground, tissue: 'skin', outline: false });
  items.push({ key: 'head-brain', ...HEAD.brain(), color: mixHex(TISSUE.ground, '#cdbfc4', 0.7), deep: mixHex(TISSUE.groundDeep, '#6b5b66', 0.7), ...ground, tissue: 'neural', outline: false });
  items.push({ key: 'head-mouth', ...HEAD.mouth(), color: mixHex(TISSUE.ground, '#6b3a3c', 0.5), deep: mixHex(TISSUE.groundDeep, '#3d2224', 0.5), ...ground, outline: false });

  // The pharynx, deep: only context (what the third arch's muscles act on).
  const phar = curve3(PHARYNX.map((p) => add(p, [0, -0.3 * a, -0.15 * a])), 20);
  put('pharynx', undefined, vessel(phar, { r0: PHARYNX_R, r1: PHARYNX_R * 0.82, ref: [1, 0, 0], sides: 22, n: 24 }), '#e6b9a8', 1, { quiet: true, ground: true, tissue: 'mesenchyme' });

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
  pts['meckel-kartilagoa'] = at(mLine, deg < 0.5 ? 0.55 : 0.04);

  // The mandible: membranous bone that forms beside Meckel from the chin backwards (spicules at its growing edge),
  // see-through while the cartilage is still there, then carried to its adult place.
  const bone = clamp01(pose.bone);
  const mand = boneOf(ARCH.i);
  const lift: V3 = [0, 0.6 * (1 - a), 0.3 * (1 - a)];
  if (bone > 0.01) {
    const clip: Clip3 | undefined = bone < 0.999 ? { o: add(FROM_SKULL([0.75, -2.98, 2.3]), lift), grow: { dir: [0, 0, 1], cos: Math.cos(bone * Math.PI * 0.98), spicules: 1 } } : undefined;
    put('mandible', 'baraila', moved(MANDIBLE(), lift, 'mand'), mand, lerp(0.42, 1, ss(0.15, 0.95, deg)), { tissue: 'bone', clip, outline: !clip });
  }
  pts['baraila'] = add(add(FROM_SKULL([1.02, -2.94, 2.0]), [0.14, 0, 0]), lift);

  // The maxillary process's bones (membranous, each grows in place).
  const mx = ss(0, 1, pose.maxBones);
  const squC = mix3([0.55, 3.95, -0.95], [0.5, 4.05, -1.2], a);
  const mxBone = boneOf(ARCH.i);
  const lift2: V3 = [0, 0.45 * (1 - a), 0.05 * (1 - a)];
  const growing = (c: V3, off: V3, ang: number): Clip3 | undefined => (mx < 0.999 ? { o: add(FROM_SKULL([c[0] - off[0], c[1] - off[1], c[2] - off[2]]), lift2), grow: { dir: DIR_FROM_SKULL(off), cos: Math.cos(mx * ang), spicules: 1 } } : undefined);
  if (mx > 0.01) {
    const cm = growing([0.62, -1.7, 2.3], [0, 0, 1.4], 1.1);
    put('maxilla', 'hezur-maxilarra', moved(MAXILLA(), lift2, 'max'), mxBone, 1, { groups: ['luzapen-maxilarra'], tissue: 'bone', clip: cm, outline: !cm });
    const cz = growing([1.55, -1.3, 1.6], [1.2, 0, 0.3], 1.3);
    put('zygoma', 'zigomatikoa', moved(ZYGOMA(), lift2, 'zyg'), mxBone, 1, { groups: ['luzapen-maxilarra'], tissue: 'bone', clip: cz, outline: !cz });
  }
  pts['hezur-maxilarra'] = add(add(FROM_SKULL([0.95, -1.78, 2.6]), [0.1, 0, 0]), lift2);
  pts['zigomatikoa'] = add(add(FROM_SKULL([1.72, -1.42, 1.72]), [0.12, 0, 0]), lift2);
  pts['tenporalaren-ezkata'] = add(squC, [0.1, 0.1, 0]);
  // The part of the temporal round the tympanic cavity and the ossicles (notes 2.2.1: arch I): a ring that frames
  // the three ossicles from the side, open above, growing round them.
  const tyC: V3 = add([0.98, 3.02, -1.9], ear);
  const tyRing: V3[] = Array.from({ length: 31 }, (_, i): V3 => {
    const t = (115 + (i / 30) * 310) * (Math.PI / 180);
    return [tyC[0], tyC[1] + Math.sin(t) * 0.56, tyC[2] + Math.cos(t) * 0.6];
  });
  vess('tympanic', 'loki-hezurraren-atal-tinpanikoa', tyRing, mxBone, { r0: 0.07, r1: 0.06, flat: 0.5, sides: 12, n: 40 }, mx);
  pts['loki-hezurraren-atal-tinpanikoa'] = tyRing[22];

  // The temporal's petrous part: grey, it comes from the base's mesenchyme, not from an arch.
  const pet = ss(0, 1, pose.petrous);
  const petC = mix3([0.08, 3.2, -2.1], [0.08, 3.05, -2.3], a);
  if (pet > 0.01) {
    put('petrous', 'arkaitza', grown(PETROUS(), PETROUS_C, pet, [petC[0] - PETROUS_C[0], petC[1] - PETROUS_C[1], petC[2] - PETROUS_C[2]], 'pet'), '#cdc5b4', 1, { tissue: 'bone' });
    // The squama: neutral too (the notes no longer give it to arch I), the thin scale above the petrous part.
    put('squama', 'tenporalaren-ezkata', grown(SQUAMA(), SQUAMA_C, pet, [squC[0] - SQUAMA_C[0], squC[1] - SQUAMA_C[1], squC[2] - SQUAMA_C[2]], 'squ'), '#e2dac8', 1, { tissue: 'bone' });
  }
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
  const C7 = mixHex(ARCH.ii, '#ffffff', 0.34), C9 = mixHex(ARCH.iii, '#ffffff', 0.2);
  vess('n7', 'aurpegi-nerbioa', n7, C7, { r0: 0.075, r1: 0.05, sides: 10, n: 36 }, pose.n7);
  vess('n9', 'glosofaringeoa', n9, C9, { r0: 0.075, r1: 0.05, sides: 10, n: 36 }, pose.n9);
  vess('n9b', 'glosofaringeoa', [at(n9, 0.5), add(at(n9, 0.5), [-0.1, -0.3, 0.25]), [0.56, 0.8, -1.25]], C9, { r0: 0.04, r1: 0.03, sides: 8, n: 10 }, ss(0.55, 1, pose.n9));
  pts['aurpegi-nerbioa'] = at(n7, 0.32);
  pts['glosofaringeoa'] = at(n9, 0.35);

  // ———— the third arch's deep muscles (yellow) ————
  const styTip = at(sty, 1);
  // The stylopharyngeus: a slender spindle from the styloid down to the pharynx's side wall, below the constrictor.
  const styTo: V3 = add(at(phar, 0.36), [PHARYNX_R * 0.92, 0, 0.12]);
  const sg = clamp01(pose.stylo);
  if (sg > 0.01) {
    const whole = curve3([styTip, add(mix3(styTip, styTo, 0.5), [0.16, 0.04, 0.1]), styTo], 24);
    const shown = whole.slice(0, Math.max(3, Math.round(whole.length * sg)));
    put('stylopharyngeus', 'muskulu-estilofaringeoa', tubeParts(shown, { radius: (u) => 0.035 + 0.085 * Math.sin(Math.PI * Math.min(1, u * (shown.length / whole.length))) ** 0.8, ref: [1, 0, 0], sides: 12, capStart: true, capEnd: true }), ARCH.iii, 1, { tissue: 'muscle' });
  }
  pts['muskulu-estilofaringeoa'] = add(mix3(styTip, styTo, 0.55), [0.2, 0, 0.08]);
  // The superior constrictor: a sheet of muscle wrapped round the top of the pharynx, from the dorsal seam forwards.
  const cs = clamp01(pose.constr);
  const [cU0, cU1] = [0.05, 0.27];
  const cAt = (h: number) => phar[Math.round(lerp(cU0, cU1, h) * (phar.length - 1))];
  if (cs > 0.01) {
    const sheet = (nu: number, nv: number) => grid(nv, nu, (v, h) => {
      const c = cAt(h);
      const th = -Math.PI / 2 + v * Math.PI * (0.06 + 0.94 * cs);
      const r = PHARYNX_R * lerp(1, 0.9, h) + 0.02 + 0.1 * Math.sin(Math.PI * h) ** 0.55 * Math.sin(Math.PI * Math.min(1, v * 1.15)) ** 0.4;
      return [Math.cos(th) * r, c[1], c[2] + Math.sin(th) * r];
    }, [60, cAt(0.5)[1], cAt(0.5)[2]]);
    put('constrictor', 'goiko-muskulu-ertzatzaileak', { mesh: cachedMesh('b17-constrictor2', [cs, a], () => sheet(14, 30)), hit: cachedMesh('b17-constrictor2-h', [cs, a], () => sheet(4, 10)) }, ARCH.iii, 1, { tissue: 'muscle' });
  }
  pts['goiko-muskulu-ertzatzaileak'] = [PHARYNX_R + 0.1, cAt(0.5)[1], cAt(0.5)[2] + 0.05];

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
  vess('epiglottis', 'epiglotisa', epL, ARCH.iv, { r0: 0.1, r1: 0.26, flat: 0.68, sides: 14, n: 18 }, ep);
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
