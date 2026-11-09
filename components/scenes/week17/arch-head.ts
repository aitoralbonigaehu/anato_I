import type { V3 } from '@/lib/three-d/math';
import { blob, curve3, type Mesh } from '@/lib/three-d/mesh';
import { geoOf, geoSlot } from '@/lib/three-d/offthread';
import { capsule, ellipsoid, partition, smin, ssub, surfaceMesh, type SDF } from '@/lib/three-d/sdf';

/**
 * Topic 17, arches: the embryo's head and neck at five weeks, sculpted (one distance field, one continuous skin).
 *
 * Axes: x the embryo's LEFT, y cranial, z ventral; seen from the embryo's left (yaw 90) the face looks to the viewer's
 * LEFT, as the notes' figures. The numbers follow the notes' side view (p. 1 and p. 4): a big head with the forebrain
 * bulging forward and down over the mouth, the arches running obliquely from behind the eye down and forward to meet
 * the midline over the heart. At two embryo-units (EMBRYO5) to one, so the fly-in lands on the same head.
 *
 * Each arch is its own region of the same surface (its colour stops in its cleft, the normals run on across it): the
 * skin is not a body with balls stuck on it.
 */

type Line = readonly V3[];

/** The arches' axes, from the dorsal root to the midline in front of the pharynx. */
export const ARCH_LINE = {
  /** The mandibular process (the arch proper). */
  mand: curve3([[1.72, 1.52, -1.72], [2.18, 0.62, -0.92], [1.92, -0.62, 0.02], [1.08, -1.42, 0.72], [0, -1.68, 0.98]], 12),
  /** The maxillary process: the dorsal offshoot of arch I, under the eye and forward along the mouth's upper edge. */
  max: curve3([[1.8, 1.42, -1.56], [2.28, 0.72, -0.34], [2.22, 0.26, 0.8], [1.72, -0.02, 1.62]], 10),
  ii: curve3([[1.68, 0.86, -2.46], [2.12, -0.22, -1.74], [1.88, -1.36, -0.82], [1.02, -2.18, -0.06], [0, -2.46, 0.2]], 12),
  iii: curve3([[1.56, -0.12, -2.72], [2.0, -1.2, -2.22], [1.78, -2.24, -1.34], [0.96, -2.98, -0.58], [0, -3.2, -0.34]], 12),
  iv: curve3([[1.44, -1.08, -2.86], [1.84, -2.08, -2.56], [1.64, -2.98, -1.78], [0.88, -3.62, -1.14], [0, -3.8, -0.92]], 12),
  vi: curve3([[1.3, -1.92, -2.96], [1.62, -2.84, -2.78], [1.44, -3.66, -2.14], [0.76, -4.22, -1.62], [0, -4.38, -1.44]], 12),
} as const;

export type ArchRegion = keyof typeof ARCH_LINE;
export const ARCH_REGIONS = Object.keys(ARCH_LINE) as ArchRegion[];

const ARCH_R: Record<ArchRegion, [number, number]> = {
  mand: [0.66, 0.55],
  max: [0.5, 0.36],
  ii: [0.56, 0.43],
  iii: [0.46, 0.36],
  iv: [0.38, 0.3],
  vi: [0.3, 0.25],
};

/** A swollen band along a line (one side: the field takes |x|). */
function band(line: Line, r0: number, r1: number): SDF {
  const n = line.length - 1;
  const cones = Array.from({ length: n }, (_, i) => capsule(line[i] as V3, line[i + 1] as V3, r0 + ((r1 - r0) * i) / n, r0 + ((r1 - r0) * (i + 1)) / n));
  return (x, y, z) => {
    let d = cones[0](x, y, z);
    for (let i = 1; i < n; i++) d = Math.min(d, cones[i](x, y, z));
    return d;
  };
}

/** The bands, kept apart: which arch a skin point belongs to, and how far off it is. */
function archFields(): Record<ArchRegion, SDF> {
  const out = {} as Record<ArchRegion, SDF>;
  for (const k of ARCH_REGIONS) out[k] = band(ARCH_LINE[k], ARCH_R[k][0], ARCH_R[k][1]);
  return out;
}

const CUT_Y = -6.9;

/** The brain vesicles and the neck, without the skin's thickness. */
function bodyParts(shrink: number) {
  const s = shrink;
  return {
    fore: ellipsoid([0, 1.42, 2.0], [2.04 - s, 2.2 - s, 2.18 - s]),
    mid: ellipsoid([0, 1.82, -0.3], [2.1 - s, 2.04 - s, 2.46 - s]),
    hind: ellipsoid([0, 0.26, -2.38], [1.58 - s, 2.7 - s, 1.56 - s]),
  };
}

function skinField(): SDF {
  const { fore, mid, hind } = bodyParts(0);
  // Neck: narrower from side to side than front to back (x is stretched before measuring).
  const neck = capsule([0, 0.2, -2.1], [0, -8.4, -1.4], 2.0, 2.2);
  const wall = ellipsoid([0, -2.5, -0.9], [1.72, 3.0, 1.9]);
  const heart = ellipsoid([0, -4.72, 1.32], [1.98, 2.0, 2.1]);
  const frontonasal = ellipsoid([0, 0.26, 3.1], [1.18, 0.98, 0.98]);
  const eyeBulge = ellipsoid([2.02, 1.42, 2.44], [0.46, 0.68, 0.72]);
  const otic = ellipsoid([2.06, 1.24, -2.92], [0.42, 0.34, 0.3]);
  const arches = archFields();
  // The clefts (and, inside, the pouches' place): a groove along the middle of each pair of arches.
  const clefts = [
    [[2.75, 1.05, -2.04], [2.8, -0.24, -1.42], [2.5, -1.16, -0.64], [1.3, -1.92, 0.22]],
    [[2.6, -0.08, -2.68], [2.72, -1.14, -1.98], [2.42, -2.0, -1.12], [1.26, -2.74, -0.36]],
    [[2.48, -1.04, -2.86], [2.56, -1.98, -2.36], [2.3, -2.8, -1.56], [1.2, -3.42, -0.84]],
    [[2.3, -1.9, -2.98], [2.38, -2.76, -2.66], [2.1, -3.5, -1.96], [1.1, -4.08, -1.32]],
  ].map((k) => band(curve3(k as unknown as V3[], 8), 0.17, 0.08));
  const mouth = ellipsoid([0, -0.72, 2.32], [1.06, 0.46, 1.02]);
  const eyePit = ellipsoid([2.52, 1.42, 2.56], [0.2, 0.3, 0.3]);
  const nasal = ellipsoid([1.0, 0.1, 3.98], [0.24, 0.3, 0.14]);
  return (x, y, z) => {
    const ax = Math.abs(x);
    let d = smin(fore(x, y, z), mid(x, y, z), 0.7);
    d = smin(d, hind(x, y, z), 0.9);
    d = smin(d, neck(x * 1.22, y, z), 0.8);
    d = smin(d, wall(x, y, z), 0.5);
    d = smin(d, frontonasal(x, y, z), 0.5);
    d = smin(d, heart(x, y, z), 0.55);
    d = smin(d, eyeBulge(ax, y, z), 0.42);
    d = smin(d, otic(ax, y, z), 0.3);
    for (const k of ARCH_REGIONS) d = smin(d, arches[k](ax, y, z), 0.22);
    for (const c of clefts) d = ssub(d, c(ax, y, z), 0.12);
    d = ssub(d, mouth(x, y, z), 0.3);
    d = ssub(d, eyePit(ax, y, z), 0.14);
    d = ssub(d, nasal(ax, y, z), 0.14);
    return Math.max(d, CUT_Y - y);
  };
}

function coreField(): SDF {
  // Under the skin, what the arches and the head lie on: the pharynx wall and the neck.
  const neck = capsule([0, 0.3, -2.0], [0, -8.4, -1.4], 1.72, 1.9);
  const wall = ellipsoid([0, -2.5, -0.92], [1.46, 2.9, 1.66]);
  const heart = ellipsoid([0, -4.72, 1.32], [1.7, 1.72, 1.82]);
  const face = ellipsoid([0, 0.1, 2.2], [1.5, 1.02, 1.5]);
  return (x, y, z) => {
    let d = smin(neck(x * 1.22, y, z), wall(x, y, z), 0.5);
    d = smin(d, heart(x, y, z), 0.5);
    d = smin(d, face(x, y, z), 0.5);
    return Math.max(d, CUT_Y + 0.03 - y);
  };
}

function brainField(): SDF {
  const { fore, mid, hind } = bodyParts(0.3);
  const cord = capsule([0, -1.4, -2.74], [0, -8.4, -2.3], 0.82, 0.62);
  const stalk = capsule([1.1, 1.35, 2.3], [1.82, 1.42, 2.42], 0.32, 0.26);
  const pons = ellipsoid([0, 0.9, -1.25], [1.32, 1.0, 0.86]);
  return (x, y, z) => {
    let d = smin(fore(x, y, z), mid(x, y, z), 0.35);
    d = smin(d, hind(x * 1.04, y, z), 0.42);
    d = smin(d, pons(x, y, z), 0.35);
    d = smin(d, cord(x, y, z), 0.45);
    d = smin(d, stalk(Math.abs(x), y, z), 0.16);
    return Math.max(d, CUT_Y + 0.03 - y);
  };
}

export interface HeadPart {
  mesh: Mesh;
  hit: Mesh;
}

export interface ArchHead {
  /** The skin without the arches, then one region per arch (same surface). */
  skin: HeadPart;
  regions: Record<ArchRegion, HeadPart>;
  cut: HeadPart;
  core: HeadPart;
  brain: HeadPart;
  eyes: Mesh[];
  lenses: Mesh[];
}

const BOX_LO: V3 = [-3.05, -7.0, -4.3];
const BOX_HI: V3 = [3.05, 4.1, 4.5];

function build(): ArchHead {
  const field = skinField();
  const fine = surfaceMesh(field, BOX_LO, BOX_HI, 0.11);
  const coarse = surfaceMesh((x, y, z) => field(x, y, z) - 0.04, BOX_LO, BOX_HI, 0.3);
  const fields = archFields();
  const LIMIT = 0.145;
  const owner = (c: V3): ArchRegion | null => {
    const ax = Math.abs(c[0]);
    let best: ArchRegion | null = null;
    let bd = LIMIT;
    for (const k of ARCH_REGIONS) {
      const d = fields[k](ax, c[1], c[2]);
      if (d < bd) {
        bd = d;
        best = k;
      }
    }
    return best;
  };
  const split = (m: Mesh) => {
    const [cut, whole] = partition(m, (c) => c[1] < CUT_Y + 0.012);
    const out = {} as Record<ArchRegion, Mesh>;
    let rest = whole;
    for (const k of ARCH_REGIONS) {
      const [mine, others] = partition(rest, (c) => owner(c) === k);
      out[k] = mine;
      rest = others;
    }
    return { cut, rest, out };
  };
  const a = split(fine);
  const b = split(coarse);
  const regions = {} as Record<ArchRegion, HeadPart>;
  for (const k of ARCH_REGIONS) regions[k] = { mesh: a.out[k], hit: b.out[k] };
  const cf = coreField();
  const bf = brainField();
  const eyeAt = (s: number): V3 => [s * 2.2, 1.42, 2.56];
  const lensAt = (s: number): V3 => [s * 2.36, 1.42, 2.58];
  return {
    skin: { mesh: a.rest, hit: b.rest },
    regions,
    cut: { mesh: a.cut, hit: b.cut },
    core: { mesh: surfaceMesh(cf, BOX_LO, BOX_HI, 0.16), hit: surfaceMesh(cf, BOX_LO, BOX_HI, 0.36) },
    brain: { mesh: surfaceMesh(bf, BOX_LO, BOX_HI, 0.13), hit: surfaceMesh(bf, BOX_LO, BOX_HI, 0.36) },
    eyes: [1, -1].map((s) => blob({ center: eyeAt(s), radii: [0.3, 0.42, 0.42], rings: 14, sides: 20 })),
    lenses: [1, -1].map((s) => blob({ center: lensAt(s), radii: [0.12, 0.2, 0.2], rings: 10, sides: 16 })),
  };
}

/** Built once, off the main thread in the browser. */
export const ARCH_HEAD = geoSlot('arch-head', build);

export const archHead = () => geoOf(ARCH_HEAD);
