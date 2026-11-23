import type { V3 } from '@/lib/three-d/math';
import { curve3 } from '@/lib/three-d/mesh';
import { geoOf, geoSlot } from '@/lib/three-d/offthread';
import { mergeParts, plate, vessel, type Parts, type VesselOptions } from '@/lib/three-d/organic';
import { capsule, ellipsoid, partition, polygon2, prismZ, smin, surfaceMesh, type SDF } from '@/lib/three-d/sdf';
import { cutSolid, onLattice } from '@/lib/three-d/profile';
import type { Item3 } from '@/lib/three-d/scene';
import { blobParts, mixHex } from '@/components/scenes/week10/model3d';
import { C19, G19 } from './tones';
import { ROOT19 } from './sites';

/**
 * Topic 19's root (docs/handover/topic-19-plan.md): the adult body cut coronally through the spinal cord, seen from
 * the front. Its back half is the ground (skin round it, the cut face light); on it lie the central nervous system
 * (the brain in its skull, the cord in the vertebral canal) and the peripheral one: 31 pairs of spinal nerves leaving
 * through the intervertebral foramina, the plexuses and their big nerves (arm, intercostal, femoral, sciatic), the
 * cranial nerves; the autonomic system (the sympathetic chain T1–L2, the vagus and the sacral S2–S4 outflow) with
 * the organs it reaches; the brain's three cutting planes and the axes; the voluntary path as one moving signal.
 *
 * Space = the shared body (sites.ts): x the body's LEFT, y cranial, z ventral; vertex y 4.5, soles y −4.5.
 */

export interface BodyPose {
  /** The peripheral nerves grown out of the CNS (0..1). */
  pns: number;
  /** The autonomic system shown in its colours, with its organs (0..1). */
  auto: number;
  /** The brain's cutting planes (0..1 each) and the axes (0..1). */
  cor: number;
  hor: number;
  sag: number;
  axes: number;
  /** The voluntary path: the sensory signal up (0..1), the motor order down (0..1). */
  sens: number;
  /** The cerebrum turned to glass (0..1): the signal's synapses inside it show. */
  glass?: number;
  motor: number;
  /** The hand's skin, the forearm's muscle and the cortex areas shown (the voluntary path's two ends). */
  hand?: number;
  /** The cranial parasympathetic outflow to the face (2/p18–p20): ganglia, glands and the eye's pupil (0..1). */
  face?: number;
  /** The plexuses the autonomic nerves make in front of the organs (2/p16) (0..1). */
  plex?: number;
  /** Automatic movements (3.3): the loop through the cerebellum, grown (0..1). */
  cbl?: number;
}
export const BP0: BodyPose = { pns: 1, auto: 0, cor: 0, hor: 0, sag: 0, axes: 0, sens: 0, motor: 0, hand: 0, face: 0, plex: 0, cbl: 0, glass: 0 };

export interface BodyOpts {
  dim?: { ids: readonly string[]; k: number } | null;
}

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const L = (kps: readonly V3[], n = 24) => curve3(kps as V3[], n);
const X = (s: number, p: V3): V3 => [s * p[0], p[1], p[2]];
const smax = (a: number, b: number, k: number) => -smin(-a, -b, k);

/** The cut face (coronal, through the cord) and the body's back. */
export const CUT_Z = -0.32;
const BACK_Z = -0.95;
/** Nerves lie just in front of the cut face. */
const NZ = -0.24;
const CORD_Z = -0.27;

// ———————————————————————— the vertebral column and the spinal segments ————————————————————————

/** Vertebrae, top to bottom: [name, top y, bottom y]. 7 cervical, 12 thoracic, 5 lumbar; the sacrum below. */
const VERTS: [string, number, number][] = (() => {
  const out: [string, number, number][] = [];
  let y = 3.35;
  const add = (p: string, n: number, h: number) => {
    for (let i = 1; i <= n; i++) {
      out.push([`${p}${i}`, y, y - h]);
      y -= h;
    }
  };
  add('C', 7, 0.1);
  add('T', 12, 0.15);
  add('L', 5, 0.18);
  return out;
})();
const vert = (name: string) => VERTS.find((v) => v[0] === name)!;
const SACRUM_TOP = -0.05;
const SACRUM_BOT = -0.68;

/** The 31 pairs: their name, where they leave the cord, and the foramen they leave the column through. */
interface Segment {
  name: string;
  region: 'C' | 'T' | 'L' | 'S' | 'Co';
  origin: number;
  exit: number;
}
export const SEGMENTS: Segment[] = (() => {
  const out: Segment[] = [];
  let y = 3.4;
  const step = { C: 0.105, T: 0.11, L: 0.08, S: 0.05, Co: 0.04 } as const;
  const push = (region: Segment['region'], k: number, exit: number) => {
    out.push({ name: `${region}${region === 'Co' ? '' : k}`, region, origin: y - step[region] / 2, exit });
    y -= step[region];
  };
  for (let k = 1; k <= 8; k++) push('C', k, k <= 7 ? vert(`C${k}`)[1] : vert('C7')[2]);
  for (let k = 1; k <= 12; k++) push('T', k, vert(`T${k}`)[2]);
  for (let k = 1; k <= 5; k++) push('L', k, vert(`L${k}`)[2]);
  for (let k = 1; k <= 5; k++) push('S', k, SACRUM_TOP - 0.12 * (k - 0.5));
  push('Co', 1, SACRUM_BOT + 0.02);
  return out;
})();
const seg = (name: string) => SEGMENTS.find((s) => s.name === name)!;

/** The cord: radius along its length (cervical and lumbar enlargements, the conus). */
const CORD_TOP = ROOT19.magnum[1];
const CONUS = ROOT19.conus[1];
const cordR = (y: number) => {
  const cerv = Math.exp(-(((y - 2.85) / 0.35) ** 2));
  const lumb = Math.exp(-(((y - 0.95) / 0.22) ** 2));
  const cone = clamp01((y - CONUS) / 0.25);
  return (0.07 + 0.03 * cerv + 0.025 * lumb) * (0.25 + 0.75 * Math.sqrt(cone));
};

// ———————————————————————— the static ground ————————————————————————

/** The body's outline from the front (left half; x ≥ 0), head to the left sole and back up the inside. */
const HALF: [number, number][] = [
  [0, 4.5], [0.2, 4.47], [0.34, 4.36], [0.42, 4.15], [0.43, 3.92], [0.38, 3.68], [0.28, 3.5], [0.19, 3.38], [0.2, 3.18],
  [0.42, 3.06], [0.76, 2.98], [0.98, 2.86], [1.07, 2.62], [1.12, 2.1], [1.16, 1.42], [1.2, 0.86], [1.24, 0.2], [1.27, -0.12],
  [1.26, -0.42], [1.18, -0.52], [1.08, -0.46], [1.02, -0.2], [0.98, 0.22], [0.94, 0.9], [0.9, 1.5], [0.84, 2.1], [0.76, 2.36],
  [0.7, 2.1], [0.64, 1.5], [0.62, 1.1], [0.68, 0.5], [0.72, 0.0], [0.72, -0.5], [0.68, -1.3], [0.6, -2.2], [0.54, -2.7],
  [0.5, -3.4], [0.44, -4.1], [0.48, -4.38], [0.46, -4.5], [0.12, -4.5], [0.12, -4.3], [0.16, -3.6], [0.16, -2.7], [0.14, -1.8],
  [0.1, -0.9], [0, -0.62],
];
const OUTLINE: [number, number][] = [...HALF, ...HALF.slice(1, -1).reverse().map(([x, y]): [number, number] => [-x, y])];

/** The vertebral arches cut through beside the cord (the canal between them), the sacrum below. */
const columnF: SDF = (() => {
  const arches = VERTS.map(([, top, bot]) => {
    const h = top - bot;
    // A pedicle-and-lamina block each side; the gap between two is the foramen the nerve leaves by.
    const c = (top + bot) / 2 + 0.005;
    return capsule([0.16, c - h * 0.22, -0.36], [0.16, c + h * 0.22, -0.36], 0.065);
  });
  const sac = capsule([0.14, SACRUM_TOP - 0.06, -0.4], [0.05, SACRUM_BOT + 0.04, -0.42], 0.11, 0.05);
  return (x, y, z) => {
    const ax = Math.abs(x);
    let d = Infinity;
    for (const arch of arches) d = Math.min(d, arch(ax, y, z));
    return smin(d, sac(ax, y, z), 0.04);
  };
})();
const COLUMN = (): Parts => G().column;

/** The skull's back half: a bony bowl behind the brain. */
const B = ROOT19.brain;
const skullCenter: V3 = [B[0], B[1] + 0.02, B[2] - 0.02];
const skullOuter = ellipsoid(skullCenter, [0.41, 0.37, 0.5]);
const skullInner = ellipsoid(skullCenter, [0.37, 0.33, 0.46]);
const skullF: SDF = (x, y, z) => Math.max(skullOuter(x, y, z), -skullInner(x, y, z));
const SKULL = (): Parts => G().skull;

/** The brain: two hemispheres with folds, the cerebellum behind and below, the brainstem down to the foramen. */
const gyri = (x: number, y: number, z: number) => 0.012 * Math.sin(31 * x + 7 * z) * Math.sin(27 * y + 5 * x) * Math.sin(29 * z - 4 * y);
const cerebrumF: SDF = (() => {
  const h = ellipsoid([0.165, B[1] + 0.04, B[2]], [0.19, 0.27, 0.41]);
  return (x, y, z) => {
    const d = h(Math.abs(x), y, z);
    return d < 0.05 ? d + gyri(x, y, z) : d;
  };
})();
const cerebellumF: SDF = (() => {
  const c = ellipsoid([0.11, 3.7, -0.27], [0.15, 0.1, 0.13]);
  return (x, y, z) => c(Math.abs(x), y, z) + 0.006 * Math.sin(90 * y);
})();
const stemF: SDF = capsule([0, 3.86, -0.08], [ROOT19.magnum[0], ROOT19.magnum[1], ROOT19.magnum[2]], 0.075, 0.06);
const sculpt = (f: SDF, lo: V3, hi: V3, step: number, hitStep = step * 2.5): Parts => ({
  mesh: surfaceMesh(f, lo, hi, step),
  hit: surfaceMesh(f, lo, hi, hitStep),
});
const CEREBRUM = () => G().cerebrum;
const CEREBELLUM = () => G().cerebellum;
const STEM = () => G().stem;

/**
 * The body's surfaces from distance fields: built once, off the main thread in the
 * browser (the scenes wait with `useGeoReady`), here in the tests and on the server.
 */
function buildGeo() {
  const groundStep = 0.04;
  const groundLo: V3 = [-1.4, -4.62, BACK_Z - 0.02], groundHi: V3 = [1.4, 4.62, CUT_Z + 0.02];
  const outline = polygon2(OUTLINE);
  const profile = onLattice(outline, [groundLo[0], groundLo[1], 0], [groundHi[0], groundHi[1], 0], groundStep);
  const ground = prismZ((x, y) => profile(x, y, 0), BACK_Z, CUT_Z, 0.12);
  const [cut, back] = partition(surfaceMesh(ground, groundLo, groundHi, groundStep), (c) => c[2] > CUT_Z - 0.012);
  const skull = (step: number) => cutSolid({
    faces: [{ f: skullOuter }, { f: skullInner, flip: true }],
    solid: skullF,
    lo: [-0.45, 3.55, skullCenter[2] - 0.53],
    hi: [0.45, 4.45, B[2] - 0.08],
    step, cuts: [{ axis: 2, at: B[2] - 0.08, keep: 1 }], capStep: 0.008,
  });
  return {
    ground: { cut: { mesh: cut, hit: cut }, back: { mesh: back, hit: back } },
    column: sculpt(columnF, [-0.3, SACRUM_BOT - 0.12, -0.52], [0.3, 3.42, -0.24], 0.02, 0.025),
    skull: { mesh: skull(0.02), hit: skull(0.05) },
    cerebrum: sculpt(cerebrumF, [-0.4, 3.7, -0.46], [0.4, 4.36, 0.45], 0.016),
    cerebellum: sculpt(cerebellumF, [-0.3, 3.56, -0.44], [0.3, 3.84, -0.1], 0.016),
    stem: sculpt(stemF, [-0.1, 3.32, -0.26], [0.1, 3.96, 0.02], 0.014),
  };
}
export const BODY19_GEO = geoSlot('body19', buildGeo);
const G = () => geoOf(BODY19_GEO);

/** The cord, the conus and the filum terminale. */
const CORD = (): Parts => {
  const line = L([[0, CORD_TOP, -0.17], [0, 3.1, CORD_Z + 0.01], [0, 2.0, CORD_Z], [0, 1.0, CORD_Z], [0, CONUS, CORD_Z]], 60);
  const prof: VesselOptions = { r0: 0.08, r1: 0.02, sides: 14, n: 60 };
  const p = vessel(line, prof)!;
  // The radius follows the enlargements: rebuild as a tube whose radius is read from cordR along y.
  const pts = L([[0, CORD_TOP, -0.17], [0, 3.1, CORD_Z + 0.01], [0, 2.0, CORD_Z], [0, 1.0, CORD_Z], [0, CONUS - 0.02, CORD_Z]], 80);
  void p;
  return tubeBy('cord', pts, (u) => cordR(lerp(CORD_TOP, CONUS - 0.02, u)));
};
const FILUM = () => vessel(L([[0, CONUS, CORD_Z], [0, -0.1, CORD_Z - 0.02], [0, SACRUM_BOT + 0.02, -0.36]], 16), { r0: 0.012, r1: 0.008, sides: 8 })!;

/** A tube with an arbitrary radius along it (by the share of its length). */
function tubeBy(key: string, pts: V3[], r: (u: number) => number): Parts {
  // Built from short vessel pieces would show joins; instead sample the radius into a profile-free vessel.
  const n = pts.length;
  const parts: (Parts | null)[] = [];
  for (let i = 0; i < n - 1; i += 4) {
    const a = i, b = Math.min(n - 1, i + 5);
    const ra = r(a / (n - 1)), rb = r(b / (n - 1));
    parts.push(vessel(pts.slice(a, b + 1), { r0: ra, r1: rb, sides: 16, n: 8, capStart: i === 0, capEnd: b === n - 1 }));
  }
  void key;
  return mergeParts(parts)!;
}

// ———————————————————————— the peripheral nerves (left side; the right mirrors) ————————————————————————

const FOR_X = 0.2;
/** A spinal nerve's two roots inside the canal: from the cord down to its foramen. */
const rootLine = (s: Segment): V3[] => {
  const o: V3 = [cordR(s.origin) * 0.9, s.origin, CORD_Z + 0.02];
  const f: V3 = [FOR_X - 0.04, s.exit, NZ];
  if (s.origin - s.exit < 0.08) return L([o, [0.11, (s.origin + s.exit) / 2, NZ + 0.01], f], 10);
  // Long roots: down along the canal beside the cord (the cauda equina below the conus).
  return L([o, [0.07, s.origin - 0.08, CORD_Z + 0.01], [0.08, lerp(s.origin, s.exit, 0.6), CORD_Z + 0.01], [0.11, s.exit + 0.05, NZ], f], 18);
};
/** Where each nerve goes once out of its foramen. */
const ARM: V3[] = [[0.52, 2.74, NZ], [0.8, 2.6, NZ], [0.96, 2.25, NZ], [1.03, 1.4, NZ], [1.08, 0.6, NZ], [1.1, 0.15, NZ]];
const nerveLine = (s: Segment): V3[] => {
  const f: V3 = [FOR_X, s.exit, NZ];
  const k = Number(s.name.slice(1)) || 0;
  if (s.region === 'C' && k <= 4) return L([f, [0.3, s.exit - 0.05, NZ], [0.38 + 0.02 * k, s.exit - 0.16, NZ + 0.02]], 10);
  if ((s.region === 'C' && k >= 5) || s.name === 'T1') return L([f, [0.36, lerp(s.exit, 2.74, 0.5), NZ], ARM[0]], 12);
  if (s.region === 'T' && k <= 11) return L([f, [0.4, s.exit - 0.06, NZ + 0.01], [0.56, s.exit - 0.2, NZ + 0.02], [0.6, s.exit - 0.34, NZ + 0.04]], 12);
  if (s.name === 'T12' || (s.region === 'L' && k <= 3)) return L([f, [0.3, s.exit - 0.15, NZ], [0.36, -0.3, NZ], [0.38, -0.5, NZ + 0.02]], 14);
  if ((s.region === 'L' && k >= 4) || (s.region === 'S' && k <= 3)) return L([f, [0.24, s.exit - 0.12, NZ], [0.32, -0.6, NZ], [0.36, -0.82, NZ]], 14);
  return L([f, [0.26, s.exit - 0.05, NZ], [0.3, s.exit - 0.12, NZ + 0.02]], 8);
};
/** The big nerves of the limbs, from the plexuses. */
const ARM_BRANCHES: V3[][] = [
  [ARM[5], [1.16, -0.1, NZ], [1.2, -0.38, NZ]],
  [ARM[5], [1.11, -0.12, NZ], [1.12, -0.44, NZ]],
  [ARM[5], [1.06, -0.1, NZ], [1.04, -0.4, NZ]],
];
const FEMORAL: V3[] = [[0.38, -0.5, NZ + 0.02], [0.42, -0.9, NZ + 0.04], [0.43, -1.5, NZ + 0.04], [0.4, -2.1, NZ + 0.04]];
const SCIATIC: V3[] = [[0.36, -0.82, NZ], [0.43, -1.0, NZ], ROOT19.sciaticL, [0.42, -2.0, NZ], [0.38, -2.6, NZ], [0.33, -3.4, NZ], [0.3, -4.2, NZ]];

const NERVE = { r0: 0.016, r1: 0.013, sides: 8 } as const;
const THICK = { r0: 0.03, r1: 0.022, sides: 10 } as const;

/** All the spinal nerves of one region, both sides, merged (built once). */
const regionParts = new Map<string, Parts>();
function spinal(region: 'cerv' | 'brach' | 'thor' | 'lumb' | 'sacr', kind: 'root' | 'nerve'): Parts {
  const key = `${region}-${kind}`;
  let p = regionParts.get(key);
  if (p) return p;
  const pick = (s: Segment) => {
    const k = Number(s.name.slice(1)) || 0;
    if (region === 'cerv') return s.region === 'C' && k <= 4;
    if (region === 'brach') return (s.region === 'C' && k >= 5) || s.name === 'T1';
    if (region === 'thor') return s.region === 'T' && k >= 2;
    if (region === 'lumb') return s.region === 'L' && k <= 3;
    return (s.region === 'L' && k >= 4) || s.region === 'S' || s.region === 'Co';
  };
  const list: (Parts | null)[] = [];
  for (const s of SEGMENTS.filter(pick))
    for (const side of [1, -1]) {
      if (kind === 'root') list.push(vessel(rootLine(s).map((q) => X(side, q)), { ...NERVE, r0: 0.012, r1: 0.011 }));
      else {
        list.push(vessel(nerveLine(s).map((q) => X(side, q)), NERVE));
        // The spinal ganglion on the posterior root, at the foramen.
        list.push(blobParts({ center: X(side, [FOR_X - 0.03, s.exit, NZ]), radii: [0.03, 0.022, 0.022], rings: 6, sides: 8 }));
      }
    }
  if (kind === 'nerve' && region === 'brach')
    for (const side of [1, -1]) {
      list.push(vessel(L(ARM, 24).map((q) => X(side, q)), THICK));
      for (const b of ARM_BRANCHES) list.push(vessel(L(b, 10).map((q) => X(side, q)), NERVE));
    }
  if (kind === 'nerve' && region === 'lumb') for (const side of [1, -1]) list.push(vessel(L(FEMORAL, 16).map((q) => X(side, q)), THICK));
  p = mergeParts(list)!;
  regionParts.set(key, p);
  return p;
}
const SCIATIC_PARTS = () => {
  const k = 'sciatic';
  let p = regionParts.get(k);
  if (!p) regionParts.set(k, (p = mergeParts([1, -1].map((s) => vessel(L(SCIATIC, 30).map((q) => X(s, q)), { r0: 0.04, r1: 0.024, sides: 12 })))!));
  return p;
};

/** The cranial nerves: the ones a front view can show, both sides; the vagus runs down into the trunk. */
const CRANIAL: { id: string; line: V3[] }[] = [
  { id: 'usaimen-nerbioa', line: [[0.04, 3.86, 0.3], [0.05, 3.83, 0.4]] },
  { id: 'nerbio-optikoa', line: [[0.03, 3.8, 0.12], [0.1, 3.82, 0.28], [0.15, 3.88, 0.38]] },
  { id: 'nerbio-trigeminoa', line: [[0.07, 3.7, -0.06], [0.2, 3.72, 0.1], [0.28, 3.78, 0.3]] },
  { id: 'nerbio-trigeminoa', line: [[0.2, 3.72, 0.1], [0.25, 3.62, 0.3]] },
  { id: 'nerbio-trigeminoa', line: [[0.2, 3.72, 0.1], [0.22, 3.5, 0.22]] },
  { id: 'aurpegi-nerbioa', line: [[0.07, 3.64, -0.1], [0.24, 3.6, -0.05], [0.34, 3.62, 0.1]] },
  { id: 'nerbio-glosofaringeoa', line: [[0.06, 3.56, -0.12], [0.16, 3.46, -0.02], [0.18, 3.38, 0.08]] },
  { id: 'nerbio-hipoglosoa', line: [[0.05, 3.5, -0.12], [0.12, 3.42, 0.02], [0.1, 3.34, 0.14]] },
];
const VAGUS: V3[] = [[0.06, 3.54, -0.13], [0.12, 3.3, -0.08], [0.13, 2.9, -0.06], [0.14, 2.45, -0.02], [0.12, 2.1, 0.0], [0.2, 1.6, 0.02], [0.24, 1.25, 0.04]];

/** The organs the autonomic system reaches (context while it is told). */
const ORGANS: { id: string; c: V3; r: V3; color: string }[] = [
  { id: 'bihotza', c: [0.08, 2.02, 0.04], r: [0.17, 0.2, 0.14], color: '#c94c5c' },
  { id: 'birikak', c: [0.38, 2.12, -0.06], r: [0.2, 0.42, 0.18], color: '#e7a3b0' },
  { id: 'birikak', c: [-0.36, 2.12, -0.06], r: [0.2, 0.42, 0.18], color: '#e7a3b0' },
  { id: 'urdaila', c: [0.26, 1.28, 0.02], r: [0.2, 0.14, 0.12], color: '#e8c06a' },
  { id: 'gernu-maskuria', c: [0, -0.42, 0.02], r: [0.13, 0.11, 0.1], color: '#e6d27a' },
  { id: 'begia', c: [0.15, 3.98, 0.36], r: [0.06, 0.06, 0.06], color: '#f2f2f4' },
  { id: 'begia', c: [-0.15, 3.98, 0.36], r: [0.06, 0.06, 0.06], color: '#f2f2f4' },
];
/** The sympathetic chain beside the column, T1 to L2, and its branches to the organs. */
const CHAIN_X = 0.25;
const chainY = SEGMENTS.filter((s) => s.region === 'T' || (s.region === 'L' && Number(s.name.slice(1)) <= 2)).map((s) => s.exit);
const SPLANCH: V3[][] = [
  [[CHAIN_X, 2.3, NZ + 0.03], [0.18, 2.12, -0.05], [0.12, 2.06, 0.0]],
  [[CHAIN_X, 2.2, NZ + 0.03], [0.32, 2.15, -0.1]],
  [[CHAIN_X, 1.55, NZ + 0.03], [0.26, 1.42, -0.04], [0.26, 1.32, 0.0]],
  [[CHAIN_X, 0.9, NZ + 0.03], [0.14, 0.5, -0.06], [0.06, -0.3, 0.0]],
];
/** Sacral parasympathetic outflow (S2–S4) to the bladder. */
const PELVIC: V3[] = [[0.18, -0.25, NZ], [0.12, -0.36, -0.1], [0.06, -0.4, -0.02]];

// ———————————————————————— the voluntary path (left side) ————————————————————————

const HAND: V3 = [1.12, -0.44, NZ + 0.02];
const C7 = seg('C7');
/** Sensory: from the hand's skin up the arm, in at C7's posterior root, up the cord and the brainstem to the thalamus, then to the sensory cortex. */
export const SENS_PATH: V3[] = L(
  [HAND, [1.11, -0.1, NZ], ARM[5], ARM[4], ARM[3], ARM[2], ARM[1], ARM[0], [0.3, C7.exit + 0.02, NZ], [FOR_X - 0.03, C7.exit, NZ], [0.06, C7.origin + 0.02, CORD_Z + 0.04], [0.035, 3.1, CORD_Z + 0.06], [0.03, ROOT19.magnum[1], -0.13], [0.04, 3.7, -0.07], [0.06, ROOT19.thalamus[1], ROOT19.thalamus[2]], [0.16, 4.12, -0.06], [0.24, 4.24, -0.08]],
  140,
);
/** Motor: from the motor cortex down the brainstem and the cord to C7, out by its anterior root, down the arm to the forearm's muscle. */
export const MOTOR_PATH: V3[] = L(
  [[0.22, 4.25, 0.04], [0.12, 4.08, 0.0], [0.05, 3.8, -0.06], [0.025, ROOT19.magnum[1], -0.12], [0.025, 3.1, CORD_Z + 0.08], [0.05, C7.origin - 0.02, CORD_Z + 0.07], [FOR_X - 0.02, C7.exit - 0.02, NZ + 0.03], [0.3, C7.exit - 0.01, NZ + 0.03], ARM[0], ARM[1], ARM[2], [1.02, 1.5, NZ + 0.03], [1.06, 1.0, NZ + 0.03]],
  120,
);
const MUSCLE_C: V3 = [1.08, 0.82, NZ + 0.04];

// ———————————————————————— the cranial parasympathetic outflow (2/p14, p18–p20) ————————————————————————

/** Its ganglia (their neurons, 2/p18) and the glands and the eye they reach (2/p19–p20); left side, mirrored. */
const FACE_GANGLIA: V3[] = [[0.11, 3.8, 0.24], [0.17, 3.75, 0.13], [0.2, 3.47, 0.17], [0.27, 3.6, 0.0]];
const GLANDS: { id: string; c: V3; r: V3 }[] = [
  { id: 'malko-guruina', c: [0.25, 4.04, 0.33], r: [0.04, 0.022, 0.032] },
  { id: 'listu-guruinak', c: [0.33, 3.62, 0.05], r: [0.045, 0.075, 0.04] },
  { id: 'listu-guruinak', c: [0.2, 3.42, 0.24], r: [0.045, 0.03, 0.04] },
];
/** III to the eye (the pupil), VII to the lacrimal and the submandibular gland, IX to the parotid. */
const FACE_PARA: { id: string; line: V3[] }[] = [
  // Under the frontal lobe (its floor is at y ≈ 3.79–3.86 here), forward into the orbit and up to the eye.
  { id: 'nerbio-begi-eragilea', line: [[0.03, 3.74, -0.03], [0.07, 3.75, 0.12], [0.11, 3.8, 0.24], [0.14, 3.93, 0.32]] },
  { id: 'aurpegi-nerbioa', line: [[0.07, 3.64, -0.1], [0.14, 3.7, 0.04], [0.17, 3.75, 0.13], [0.22, 3.92, 0.26], [0.24, 4.02, 0.31]] },
  { id: 'aurpegi-nerbioa', line: [[0.07, 3.64, -0.1], [0.15, 3.56, 0.06], [0.2, 3.47, 0.17], [0.2, 3.43, 0.22]] },
  { id: 'nerbio-glosofaringeoa', line: [[0.06, 3.56, -0.12], [0.17, 3.57, -0.06], [0.27, 3.6, 0.0], [0.31, 3.61, 0.03]] },
];
/** The autonomic plexuses in front of the organs (2/p16): the cardiac and the oesophageal. */
const PLEX_C: V3[] = [[0.08, 2.05, 0.2], [0.0, 2.42, -0.06]];

// ———————————————————————— automatic movements (3.3): the cerebellum takes part ————————————————————————

/** From the motor cortex down to the pons, across into the cerebellum, and back up to the cortex by the thalamus. */
export const CBL_PATH: V3[] = L(
  [[0.23, 4.24, 0.05], [0.14, 4.06, 0.02], [0.07, 3.82, -0.04], [0.09, 3.7, -0.12], [0.2, 3.68, -0.22], [0.16, 3.78, -0.16], [0.08, ROOT19.thalamus[1], ROOT19.thalamus[2] - 0.02], [0.16, 4.12, -0.02], [0.23, 4.24, 0.05]],
  100,
);

export function bodyModel(pose: BodyPose, o: BodyOpts = {}) {
  const items: Item3[] = [];
  const pts: Record<string, V3> = {};
  const dim = o.dim && o.dim.k > 0.001 ? o.dim : null;
  const k = dim ? dim.k : 0;
  const lit = (id: string | undefined, groups?: readonly string[]) => !dim || (!!id && dim.ids.includes(id)) || (groups ?? []).some((g) => dim.ids.includes(g));
  const put = (key: string, id: string | undefined, parts: Parts | null, color: string, deep: string, extra: Partial<Item3> = {}) => {
    if (!parts || (extra.opacity ?? 1) <= 0.01) return;
    const off = !!dim && !!id && !extra.ground && !lit(id, extra.groups);
    items.push({ key, id, ...parts, color: off ? mixHex(color, '#bdb4b2', 0.45 * k) : color, deep: off ? mixHex(deep, '#7c7472', 0.45 * k) : deep, tissue: 'nerve', ...extra });
  };
  const pns = clamp01(pose.pns);
  const auto = clamp01(pose.auto);

  // ———— the ground: the body's back half, cut through the cord ————
  const g = G().ground;
  put('ground-cut', undefined, g.cut, G19.cut, G19.cutDeep, { ground: true, quiet: true, tissue: 'mesenchyme', calm: true });
  put('ground-back', undefined, g.back, G19.body, G19.bodyDeep, { ground: true, quiet: true, tissue: 'skin', calm: true });

  // ———— bone: the skull's back half, the vertebral arches ————
  const CNS = ['nerbio-sistema-zentrala'];
  put('skull', 'neurokraneoa', SKULL(), G19.bone, G19.boneDeep, { tissue: 'bone', calm: true });
  put('column', 'ornoak', COLUMN(), G19.bone, G19.boneDeep, { tissue: 'bone', calm: true });
  pts['neurokraneoa'] = [0.36, 4.2, -0.2];
  pts['ornoak'] = [0.17, 1.6, -0.3];

  // ———— the central nervous system ————
  const brainC = C19.brain, brainD = C19.brainDeep;
  const glass = clamp01(pose.glass ?? 0);
  put('cerebrum', 'garun-hemisferioak', CEREBRUM(), brainC, brainD, { groups: ['entzefaloa', ...CNS], tissue: 'neural', ...(glass > 0.001 ? { opacity: 1 - 0.6 * glass } : {}) });
  put('cerebellum', 'garuntxoa', CEREBELLUM(), mixHex(brainC, '#d99a8c', 0.4), brainD, { groups: ['entzefaloa', ...CNS], tissue: 'neural' });
  // The brainstem carries the cranial parasympathetic outflow: violet while the autonomic system is told.
  put('stem', 'entzefalo-enborra', STEM(), mixHex(mixHex(brainC, '#c99a90', 0.5), C19.para, 0.55 * auto), brainD, { groups: ['entzefaloa', ...CNS], tissue: 'neural' });
  put('cord', 'ornomuina', CORD(), brainC, brainD, { groups: CNS, tissue: 'neural' });
  put('filum', undefined, FILUM(), mixHex(brainC, '#ffffff', 0.2), brainD, { tissue: 'neural', quiet: true });
  pts['garun-hemisferioak'] = [0.2, 4.18, 0.2];
  pts['entzefaloa'] = [-0.22, 4.08, 0.25];
  pts['garuntxoa'] = [0.22, 3.68, -0.22];
  pts['entzefalo-enborra'] = [0.04, 3.55, -0.08];
  pts['ornomuina'] = [0.05, 1.7, CORD_Z + 0.06];
  pts['nerbio-sistema-zentrala'] = [0.04, 2.4, CORD_Z + 0.06];
  pts['talamoa'] = [0.06, ROOT19.thalamus[1], ROOT19.thalamus[2]];
  // The sympathetic preganglionic cells, T1–L2 (the lateral horns): a green stripe on the cord.
  if (auto > 0.01) {
    const t1 = seg('T1').origin, l2 = seg('L2').origin;
    const stripe = mergeParts([1, -1].map((s) => vessel(L([[s * 0.045, t1, CORD_Z + 0.05], [s * 0.045, l2, CORD_Z + 0.05]], 20), { r0: 0.022, r1: 0.022, sides: 8 })));
    put('lat-horn', 'alboko-adarra', stripe, C19.symp, C19.sympDeep, { groups: ['sistema-sinpatikoa'], opacity: auto });
    pts['alboko-adarra'] = [0.045, lerp(t1, l2, 0.3), CORD_Z + 0.07];
  }

  // ———— the peripheral nervous system ————
  if (pns > 0.01) {
    const PNS = ['nerbio-sistema-periferikoa'];
    const SP = ['nerbio-espinalak', ...PNS];
    const op = pns;
    const yel = C19.nerve, yelD = C19.nerveDeep;
    const somatic = (c: string) => mixHex(c, '#d8d0b0', 0.35 * auto);
    put('roots-c', 'nerbio-espinalak', spinal('cerv', 'root'), somatic(yel), yelD, { groups: PNS, opacity: op });
    put('roots-b', 'nerbio-espinalak', spinal('brach', 'root'), somatic(yel), yelD, { groups: PNS, opacity: op });
    put('roots-t', 'nerbio-espinalak', spinal('thor', 'root'), somatic(yel), yelD, { groups: PNS, opacity: op });
    put('roots-l', 'nerbio-espinalak', spinal('lumb', 'root'), somatic(yel), yelD, { groups: PNS, opacity: op });
    put('cauda', 'zaldi-buztana', spinal('sacr', 'root'), somatic(yel), yelD, { groups: SP, opacity: op });
    put('n-cerv', 'nerbio-sareak', spinal('cerv', 'nerve'), somatic(yel), yelD, { groups: [...SP, 'gongoil-errakideoak'], opacity: op });
    put('n-brach', 'nerbio-sareak', spinal('brach', 'nerve'), somatic(yel), yelD, { groups: [...SP, 'gongoil-errakideoak'], opacity: op });
    put('n-thor', 'saihets-arteko-nerbioak', spinal('thor', 'nerve'), somatic(yel), yelD, { groups: [...SP, 'gongoil-errakideoak'], opacity: op });
    put('n-lumb', 'nerbio-sareak', spinal('lumb', 'nerve'), somatic(yel), yelD, { groups: [...SP, 'gongoil-errakideoak'], opacity: op });
    put('n-sacr', 'nerbio-sareak', spinal('sacr', 'nerve'), somatic(yel), yelD, { groups: SP, opacity: op });
    put('sciatic', 'nerbio-ziatikoa', SCIATIC_PARTS(), somatic(yel), yelD, { groups: ['nerbio-sareak', ...SP], opacity: op });
    for (const c of CRANIAL)
      for (const s of [1, -1]) put(`cn-${c.id}-${c.line[0][1]}-${s}`, c.id, vessel(L(c.line.map((q) => X(s, q)), 10), NERVE), somatic(yel), yelD, { groups: ['nerbio-kranialak', ...PNS], opacity: op });
    const vagC = mixHex(yel, C19.para, auto);
    for (const s of [1, -1]) put(`vagus${s}`, 'nerbio-bagoa', vessel(L(VAGUS.map((q) => X(s, q)), 30), { r0: 0.02, r1: 0.016, sides: 8 }), vagC, mixHex(yelD, C19.paraDeep, auto), { groups: ['nerbio-kranialak', 'sistema-parasinpatikoa', ...PNS], opacity: op });
    pts['nerbio-sistema-periferikoa'] = [0.6, 2.15, NZ + 0.03];
    pts['nerbio-espinalak'] = [0.42, 1.55, NZ + 0.03];
    pts['nerbio-kranialak'] = [0.26, 3.66, 0.14];
    pts['nerbio-bagoa'] = [0.13, 2.7, -0.05];
    pts['nerbio-sareak'] = ARM[1];
    pts['saihets-arteko-nerbioak'] = [0.5, 1.9, NZ + 0.03];
    pts['nerbio-ziatikoa'] = [0.43, -1.6, NZ + 0.03];
    pts['zaldi-buztana'] = [0.06, 0.25, CORD_Z + 0.04];
    pts['gongoil-errakideoak'] = [FOR_X - 0.03, seg('T6').exit, NZ];
  }

  // ———— the autonomic system ————
  if (auto > 0.01) {
    const SY = ['sistema-sinpatikoa', 'nerbio-sistema-begetatiboa'];
    const PA = ['sistema-parasinpatikoa', 'nerbio-sistema-begetatiboa'];
    const chain: (Parts | null)[] = [];
    for (const s of [1, -1]) {
      chain.push(vessel(L([[s * CHAIN_X, chainY[0] + 0.05, NZ + 0.03], [s * CHAIN_X, chainY[chainY.length - 1] - 0.05, NZ + 0.03]], 20), { r0: 0.012, r1: 0.012, sides: 8 }));
      for (const y of chainY) chain.push(blobParts({ center: [s * CHAIN_X, y, NZ + 0.03], radii: [0.026, 0.034, 0.024], rings: 6, sides: 8 }));
      for (const y of chainY) chain.push(vessel(L([[s * (FOR_X + 0.01), y + 0.01, NZ], [s * CHAIN_X, y, NZ + 0.03]], 4), { r0: 0.008, r1: 0.008, sides: 6 }));
    }
    put('chain', 'kate-sinpatikoa', mergeParts(chain), C19.symp, C19.sympDeep, { groups: SY, opacity: auto });
    const spl = mergeParts(SPLANCH.flatMap((l) => [1, -1].map((s) => vessel(L(l.map((q) => X(s, q)), 12), { r0: 0.012, r1: 0.01, sides: 6 }))));
    put('splanch', 'sistema-sinpatikoa', spl, C19.symp, C19.sympDeep, { groups: SY, opacity: auto });
    const pel = mergeParts([1, -1].map((s) => vessel(L(PELVIC.map((q) => X(s, q)), 10), { r0: 0.014, r1: 0.012, sides: 6 })));
    put('pelvic', 'sistema-parasinpatikoa', pel, C19.para, C19.paraDeep, { groups: PA, opacity: auto });
    for (const [i, og] of ORGANS.entries())
      put(`organ${i}`, og.id, blobParts({ center: og.c, radii: og.r, rings: 12, sides: 16 }), og.color, mixHex(og.color, '#3a2020', 0.5), { tissue: 'mesenchyme', opacity: 0.85 * auto, calm: true });
    pts['kate-sinpatikoa'] = [CHAIN_X, 1.6, NZ + 0.05];
    pts['sistema-sinpatikoa'] = [CHAIN_X, 2.2, NZ + 0.05];
    pts['sistema-parasinpatikoa'] = [0.13, 2.7, -0.05];
    pts['nerbio-sistema-begetatiboa'] = [0.2, 1.5, 0];
    pts['bihotza'] = [0.12, 2.0, 0.17];
    pts['birikak'] = [0.42, 2.3, 0.1];
    pts['urdaila'] = [0.3, 1.3, 0.12];
    pts['gernu-maskuria'] = [0.04, -0.4, 0.11];
    pts['begia'] = [0.16, 3.98, 0.42];
  }

  // ———— the cranial parasympathetic outflow to the face (violet) ————
  const face = clamp01(pose.face ?? 0);
  if (face > 0.01) {
    const PA = ['sistema-parasinpatikoa', 'nerbio-sistema-begetatiboa'];
    for (const f of FACE_PARA)
      for (const s of [1, -1]) put(`fp-${f.id}-${f.line[1][1]}-${s}`, f.id, vessel(L(f.line.map((q) => X(s, q)), 14), { r0: 0.014, r1: 0.011, sides: 8 }, face), C19.para, C19.paraDeep, { groups: ['nerbio-kranialak', ...PA] });
    const gg = mergeParts(FACE_GANGLIA.flatMap((c) => [1, -1].map((s) => blobParts({ center: X(s, c), radii: [0.022, 0.022, 0.022], rings: 8, sides: 10 }))));
    put('face-ganglia', 'buruko-gongoil-parasinpatikoak', gg, mixHex(C19.para, '#ffffff', 0.25), C19.paraDeep, { groups: PA, opacity: face });
    for (const [i, g] of GLANDS.entries())
      for (const s of [1, -1]) put(`gland${i}${s}`, g.id, blobParts({ center: X(s, g.c), radii: g.r, rings: 10, sides: 12 }), '#e9a8c0', '#7a3a52', { tissue: 'mesenchyme', opacity: face, calm: true });
    for (const s of [1, -1]) put(`eye${s}`, 'begia', blobParts({ center: [s * 0.15, 3.98, 0.36], radii: [0.06, 0.06, 0.06], rings: 12, sides: 16 }), '#f2f2f4', '#7a7a80', { tissue: 'mesenchyme', opacity: face * (1 - auto), calm: true });
    pts['nerbio-begi-eragilea'] = [0.08, 3.755, 0.15];
    pts['malko-guruina'] = [0.26, 4.05, 0.34];
    pts['listu-guruinak'] = [0.34, 3.62, 0.07];
    pts['buruko-gongoil-parasinpatikoak'] = [0.17, 3.75, 0.14];
    pts['begia'] = [0.16, 3.98, 0.42];
  }
  // ———— the autonomic plexuses in front of the organs ————
  const plex = clamp01(pose.plex ?? 0) * auto;
  if (plex > 0.01) {
    const net: (Parts | null)[] = [];
    for (const [ci, c] of PLEX_C.entries()) {
      const r = ci === 0 ? 0.13 : 0.06, h = ci === 0 ? 0.12 : 0.3;
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        net.push(vessel(L([[c[0] + r * Math.cos(a), c[1] + h, c[2] + 0.06 * Math.sin(a)], [c[0] + r * Math.cos(a + 1.3), c[1], c[2] + 0.06 * Math.sin(a + 1.3)], [c[0] + r * Math.cos(a + 2.4), c[1] - h, c[2] + 0.06 * Math.sin(a + 2.4)]], 10), { r0: 0.008, r1: 0.008, sides: 6 }, plex));
      }
    }
    put('plexus', 'errai-sareak', mergeParts(net), mixHex(C19.symp, C19.para, 0.5), C19.sympDeep, { groups: ['nerbio-sistema-begetatiboa'] });
    pts['errai-sareak'] = [0.18, 2.12, 0.24];
  }
  // ———— automatic movements: the loop through the cerebellum ————
  const cbl = clamp01(pose.cbl ?? 0);
  if (cbl > 0.001) {
    put('cbl-loop', 'garuntxo-zirkuitua', vessel(CBL_PATH, { r0: 0.02, r1: 0.02, bulb: 0.9, bulbLen: 0.06, sides: 10, n: 100 }, cbl), C19.inter, mixHex(C19.inter, '#000000', 0.5), { groups: ['garuntxoa'] });
    pts['garuntxo-zirkuitua'] = CBL_PATH[Math.max(1, Math.round(Math.min(cbl, 0.55) * (CBL_PATH.length - 1)))];
  }

  // ———— the brain's cutting planes ————
  const plane = (key: string, id: string, w: number, frame: { u: V3; v: V3; w: V3 }, at: V3, color: string) => {
    if (w <= 0.01) return;
    const s = 0.62;
    const pp = plate(`b19-${key}`, [[-s, -s], [s, -s], [s, s], [-s, s]], -0.004, 0.004, frame);
    const moved: Parts = { mesh: shift(pp.mesh, at), hit: shift(pp.hit ?? pp.mesh, at) };
    put(`plane-${key}`, id, moved, color, mixHex(color, '#000000', 0.4), { tissue: 'membrane', opacity: 0.42 * w, outline: true });
  };
  const BC: V3 = [0, B[1] + 0.04, B[2]];
  plane('cor', 'plano-koronala', pose.cor, { u: [1, 0, 0], v: [0, 1, 0], w: [0, 0, 1] }, [BC[0], BC[1], BC[2] + 0.05], '#e5484d');
  plane('hor', 'plano-horizontala', pose.hor, { u: [1, 0, 0], v: [0, 0, -1], w: [0, 1, 0] }, [BC[0], BC[1] + 0.02, BC[2]], '#3e7bf0');
  plane('sag', 'plano-sagitala', pose.sag, { u: [0, 0, -1], v: [0, 1, 0], w: [1, 0, 0] }, [0, BC[1], BC[2]], '#3fb950');
  pts['plano-koronala'] = [0.5, BC[1] + 0.45, BC[2] + 0.05];
  pts['plano-horizontala'] = [0.55, BC[1] + 0.02, BC[2] + 0.5];
  pts['plano-sagitala'] = [0, BC[1] + 0.5, BC[2] - 0.5];

  // ———— the axes: dorsal is up in the brain but back in the cord ————
  const ax = clamp01(pose.axes);
  if (ax > 0.01) {
    const arrow = (key: string, from: V3, to: V3, color: string) => {
      const d: V3 = [to[0] - from[0], to[1] - from[1], to[2] - from[2]];
      const tipStart: V3 = [from[0] + d[0] * 0.78, from[1] + d[1] * 0.78, from[2] + d[2] * 0.78];
      const shaft = vessel(L([from, tipStart], 4), { r0: 0.016, r1: 0.016, sides: 10 }, ax);
      const tip = ax > 0.9 ? vessel(L([tipStart, to], 4), { r0: 0.045, r1: 0.002, sides: 12 }) : null;
      put(`ax-${key}`, undefined, mergeParts([shaft, tip]), color, mixHex(color, '#000000', 0.5), { tissue: 'membrane', quiet: true });
    };
    const dors = '#f2b24a', vent = '#7fb6e6';
    arrow('b-dors', [0, 4.34, B[2]], [0, 4.78, B[2]], dors);
    arrow('b-vent', [0, 3.76, 0.25], [0, 3.34, 0.25], vent);
    arrow('b-ros', [0, 4.02, 0.44], [0, 4.02, 0.86], '#c9b8ff');
    arrow('b-occ', [0, 4.02, -0.5], [0, 4.02, -0.9], '#c9b8ff');
    arrow('c-dors', [0, 1.8, -0.36], [0, 1.8, -0.78], dors);
    arrow('c-vent', [0, 1.8, -0.18], [0, 1.8, 0.24], vent);
  }
  // The axes' ends (named by marks; defined even before the arrows grow).
  pts['ax-b-dors'] = [0, 4.8, B[2]];
  pts['ax-b-vent'] = [0, 3.3, 0.25];
  pts['ax-b-ros'] = [0, 4.02, 0.9];
  pts['ax-b-occ'] = [0, 4.02, -0.94];
  pts['ax-c-dors'] = [0, 1.8, -0.82];
  pts['ax-c-vent'] = [0, 1.8, 0.28];

  // ———— the voluntary path: a signal that travels ————
  const sens = clamp01(pose.sens), motor = clamp01(pose.motor);
  if (sens > 0.001 || motor > 0.001 || (pose.hand ?? 0) > 0.01) {
    put('skin-pt', 'larruazala', blobParts({ center: HAND, radii: [0.05, 0.05, 0.03], rings: 8, sides: 10 }), '#f1c7a8', '#8a5a40', { tissue: 'skin' });
    put('thal', 'talamoa', blobParts({ center: [0.07, ROOT19.thalamus[1], ROOT19.thalamus[2]], radii: [0.06, 0.05, 0.08], rings: 10, sides: 12 }), C19.dien, mixHex(C19.dien, '#000000', 0.5), { tissue: 'neural' });
    put('cx-s', 'kortex-sentsitiboa', blobParts({ center: [0.25, 4.22, -0.09], radii: [0.09, 0.06, 0.08], rings: 10, sides: 12 }), C19.sens, C19.sensDeep, { tissue: 'neural' });
    put('cx-m', 'kortex-motorra', blobParts({ center: [0.23, 4.24, 0.05], radii: [0.09, 0.06, 0.08], rings: 10, sides: 12 }), C19.motor, C19.motorDeep, { tissue: 'neural' });
    put('muscle', 'muskulu-ildaskatuak', blobParts({ center: MUSCLE_C, radii: [0.085, 0.3, 0.07], rings: 12, sides: 14 }), lerp(0, 1, motor) > 0.98 ? '#e0605c' : '#c8807a', C19.muscleDeep, { tissue: 'muscle' });
    pts['larruazala'] = HAND;
    pts['talamoa'] = [0.08, ROOT19.thalamus[1], ROOT19.thalamus[2]];
    pts['kortex-sentsitiboa'] = [0.27, 4.26, -0.1];
    pts['kortex-motorra'] = [0.25, 4.27, 0.07];
    pts['muskulu-ildaskatuak'] = MUSCLE_C;
    if (sens > 0.001) {
      put('sens', 'neurona-sentsitiboa', vessel(SENS_PATH, { r0: 0.022, r1: 0.022, bulb: 0.9, bulbLen: 0.08, sides: 10, n: 140 }, sens), C19.sens, C19.sensDeep, { tissue: 'nerve' });
      pts['neurona-sentsitiboa'] = SENS_PATH[Math.max(1, Math.round(sens * 0.7 * (SENS_PATH.length - 1)))];
    }
    if (motor > 0.001) {
      put('motor', 'motoneurona', vessel(MOTOR_PATH, { r0: 0.022, r1: 0.022, bulb: 0.9, bulbLen: 0.08, sides: 10, n: 120 }, motor), C19.motor, C19.motorDeep, { tissue: 'nerve' });
      pts['motoneurona'] = MOTOR_PATH[Math.max(1, Math.round(motor * 0.6 * (MOTOR_PATH.length - 1)))];
    }
  }
  return { items, pts };
}

/** A mesh moved by `d` (cached per mesh and offset). */
const shifted = new WeakMap<object, Map<string, import('@/lib/three-d/mesh').Mesh>>();
function shift(m: import('@/lib/three-d/mesh').Mesh, d: V3) {
  let byM = shifted.get(m);
  if (!byM) shifted.set(m, (byM = new Map()));
  const key = d.join(',');
  let r = byM.get(key);
  if (!r) {
    const pos = new Float32Array(m.pos.length);
    for (let i = 0; i < pos.length; i += 3) {
      pos[i] = m.pos[i] + d[0];
      pos[i + 1] = m.pos[i + 1] + d[1];
      pos[i + 2] = m.pos[i + 2] + d[2];
    }
    byM.set(key, (r = { ...m, pos }));
  }
  return r;
}
