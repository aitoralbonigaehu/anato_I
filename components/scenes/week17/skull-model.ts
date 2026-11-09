import { mixHex } from '@/components/scenes/week10/model3d';
import { add, cross, dot, mix3, mul, norm, sub, type M4, type V3 } from '@/lib/three-d/math';
import { curve3, grid, merge, type Mesh } from '@/lib/three-d/mesh';
import { cachedMesh } from '@/lib/three-d/mesh-cache';
import { cupShell, vessel, type Parts } from '@/lib/three-d/organic';
import { geoOf, geoSlot } from '@/lib/three-d/offthread';
import type { Clip3, Item3 } from '@/lib/three-d/scene';
import { capsule, ellipsoid, mirrorX, smin, ssub, surfaceMesh, type SDF } from '@/lib/three-d/sdf';
import { ARCH, ARCH_DEEP, TISSUE } from './common';

/**
 * Topic 17 §1: the fetal skull. One model, one continuous pose, for every stage of the section and for the
 * adult places of the arches' derivatives (`skullModel` with `rest: 0` and `archTint: 1`).
 *
 * Axes as every model of the topic: x towards the fetus's LEFT, y cranial, z ventral (the face). The origin is the
 * middle of the vault; the head is about 6 units long.
 *
 * How it is built, and why (docs/quality/3d-quality-bar.md, and the plan's "A. Skull"):
 * - The vault is a shell over a real head shape (`headR`): widest across the parietal eminences, narrower at the
 *   forehead. Its bones are plates with their true outlines, cut from one network of sutures drawn on that shape,
 *   each a solid with a rounded rim and a fine radial grain from its ossification centre (the notes' figure).
 *   Two plates never share an edge: the suture is the gap between them, with the membrane under it.
 * - Membranous ossification is a clip that spreads from each plate's centre over the membrane dome (static mesh, one
 *   number a frame); endochondral ossification is a cartilage plate that forms first and is overrun by bone later.
 * - Fontanelles close because the plates' corners really move in (the outlines are warped towards the fontanelle's
 *   centre), so nothing cross-fades. Moulding moves the plates over each other.
 * - The base is one cartilage lamina with the notes' pieces raised on it, over a solid floor; the face bones are
 *   sculpted distance fields, built once (off the main thread).
 */

export interface SkullPose {
  /** The membrane dome the flat bones form in (0..1). */
  membrane: number;
  /** The flat bones of the vault, spread from their centres (0..1). */
  vault: number;
  /** Fontanelles closed: anterior, posterior, the small lateral ones (0..1). */
  afClose: number;
  pfClose: number;
  sideClose: number;
  /** Sutures narrowed (0..1). */
  sutureClose: number;
  /** Birth: the plates ride over each other, the head narrows (0..1). */
  mould: number;
  /** The skullcap (frontals, parietals, its membrane) lifted off: 0.3 ajar, 1 gone. */
  lid: number;
  /** The encephalon inside (0..1). */
  brain: number;
  /** The cartilage lamina of the base has formed (0..1). */
  carti: number;
  /** The base's bones have overrun the cartilage, on each side (0..1). Left is the fetus's left. */
  boneL: number;
  boneR: number;
  /** The face's bones have formed (0..1). */
  face: number;
  /** The vault wears its origin: frontals crest, parietals and occipital squama paraxial mesoderm (0..1). */
  origin: number;
  /** The face wears its origin, the neural crest (0..1). */
  faceOrigin: number;
  /** Derivatives wear their arch's colour: maxilla, zygomatic, temporal squama, mandible orange; styloid blue; hyoid blue and yellow (0..1). */
  archTint: number;
  /** Everything else (the neurocranium that is not an arch's derivative): 1 shown, 0 gone, leaving the face and side bones. */
  rest: number;
  /** The mandible and the hyoid (0 hides them: the base from below, the vault alone). */
  jaw: number;
}

/** The finished fetal skull: every bone in place and ivory, no tints. */
export const SKULL0: SkullPose = { membrane: 1, vault: 1, afClose: 0, pfClose: 0, sideClose: 0, sutureClose: 0, mould: 0, lid: 0, brain: 0, carti: 1, boneL: 1, boneR: 1, face: 1, origin: 0, faceOrigin: 0, archTint: 0, rest: 1, jaw: 1 };

export interface SkullOpts {
  dim?: { ids: readonly string[]; k: number } | null;
}

export const SKULL_C = {
  bone: TISSUE.bone,
  boneDeep: TISSUE.boneDeep,
  cut: '#cdbfa3',
  membrane: '#8fc7ea',
  membraneDeep: '#2c6a94',
  suture: '#4e9fd8',
  sutureDeep: '#17527d',
  fontanelle: '#7cc8f0',
  cartilage: TISSUE.cartilage,
  cartilageDeep: TISSUE.cartilageDeep,
  /** The midline cartilages (the notes' figure sets them apart from the lateral ones). */
  cartMid: '#54b7a6',
  cartMidDeep: '#1f6d60',
  crest: TISSUE.crest,
  crestDeep: TISSUE.crestDeep,
  paraxial: TISSUE.paraxial,
  paraxialDeep: TISSUE.paraxialDeep,
  floor: '#c8b5a0',
  floorDeep: '#6a5848',
  brain: '#eab7b0',
  brainDeep: '#99564f',
  hollow: '#3a2f27',
  hollowDeep: '#120d0a',
} as const;

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const sm = (a: number, b: number, x: number) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const D = (x: number, y: number, z: number): V3 => norm([x, y, z]);
const X = (s: number, q: V3): V3 => [s * q[0], q[1], q[2]];
const ang = (a: V3, b: V3) => Math.acos(Math.max(-1, Math.min(1, dot(a, b))));
const q2 = (x: number, n = 32) => Math.round(clamp01(x) * n) / n;

// ———————————————————————————— the head ————————————————————————————

const EMIN: [V3, number, number][] = [
  [D(0.8, 0.5, -0.3), 0.05, 0.1], // parietal eminences
  [D(-0.8, 0.5, -0.3), 0.05, 0.1],
  [D(0.36, 0.42, 0.83), 0.032, 0.06], // frontal eminences
  [D(-0.36, 0.42, 0.83), 0.032, 0.06],
  [D(0, 0.12, -1), 0.03, 0.12], // occiput
  [D(0.86, 0.12, 0.5), -0.03, 0.05], // the temples
  [D(-0.86, 0.12, 0.5), -0.03, 0.05],
];

/** Distance from the vault's middle to the outside of its bones, in the direction q. */
export function headR(q: V3): number {
  const front = sm(0.25, 0.95, q[2]);
  const a = 2.44 - 0.42 * front;
  const b = 2.2 + 0.1 * sm(0.4, 0.95, q[1]) * (1 - front * 0.6);
  let r = 1 / Math.hypot(q[0] / a, q[1] / b, q[2] / 3.02);
  for (const [c, amp, w] of EMIN) r *= 1 + amp * Math.exp(-(1 - dot(q, c)) / w);
  return r;
}
const onHead = (q: V3, off = 0): V3 => mul(q, headR(q) + off);

// ———————————————————————————— the suture network ————————————————————————————

/** Nodes of the network on the fetus's left (direction from the middle of the vault). */
const N = {
  // Metopic line, nasion up to the anterior fontanelle.
  nasion: D(0, -0.17, 0.985),
  m1: D(0, 0.15, 0.99),
  m2: D(0, 0.47, 0.88),
  // Anterior fontanelle (a long kite, its point forward).
  afA: D(0, 0.7, 0.714),
  afMa: D(0.115, 0.785, 0.61),
  afL: D(0.235, 0.85, 0.47),
  afMp: D(0.115, 0.925, 0.362),
  afP: D(0, 0.955, 0.297),
  // Sagittal line.
  sg1: D(0, 0.995, 0.08),
  sg2: D(0, 0.975, -0.22),
  sg3: D(0, 0.875, -0.485),
  // Posterior fontanelle (a small triangle).
  pfA: D(0, 0.765, -0.645),
  pfL: D(0.125, 0.625, -0.77),
  pfP: D(0, 0.6, -0.8),
  // Coronal line, down to the sphenoidal fontanelle.
  c1: D(0.45, 0.785, 0.44),
  c2: D(0.68, 0.585, 0.445),
  c3: D(0.805, 0.34, 0.485),
  sfT: D(0.84, 0.215, 0.5),
  sfA: D(0.8, 0.105, 0.59),
  sfB: D(0.865, 0.015, 0.5),
  sfP: D(0.875, 0.14, 0.46),
  // Lambdoid line, down to the mastoid fontanelle.
  l1: D(0.38, 0.47, -0.8),
  l2: D(0.58, 0.275, -0.77),
  l3: D(0.695, 0.125, -0.71),
  mfT: D(0.74, 0.06, -0.67),
  mfA: D(0.805, -0.005, -0.595),
  mfB: D(0.8, -0.16, -0.58),
  mfP: D(0.715, -0.04, -0.7),
  // Squamous line, arching over the ear.
  q4: D(0.895, 0.285, 0.34),
  q3: D(0.93, 0.32, 0.1),
  q2: D(0.94, 0.28, -0.18),
  q1: D(0.9, 0.17, -0.4),
  // Lower edge of the squama.
  t1: D(0.86, -0.38, -0.34),
  t2: D(0.865, -0.5, -0.02),
  t3: D(0.86, -0.42, 0.27),
  t4: D(0.875, -0.22, 0.43),
  // Greater wing, frontal's lower border, the orbit's top.
  w1: D(0.84, -0.42, 0.36),
  w2: D(0.75, -0.42, 0.51),
  w3: D(0.735, -0.24, 0.63),
  fz: D(0.76, -0.12, 0.64),
  so1: D(0.62, -0.07, 0.78),
  so2: D(0.4, -0.015, 0.915),
  so3: D(0.17, -0.09, 0.98),
  // Occipital squama's lower edge.
  o1: D(0.7, -0.18, -0.69),
  o2: D(0.5, -0.38, -0.78),
  o3: D(0.25, -0.5, -0.83),
  o4: D(0, -0.535, -0.845),
} as const;

const FONT = {
  af: { c: D(0, 0.86, 0.5), r: 0.42 },
  pf: { c: D(0, 0.67, -0.74), r: 0.2 },
  sf: { c: D(0.84, 0.115, 0.525), r: 0.17 },
  mf: { c: D(0.77, -0.045, -0.635), r: 0.17 },
};

interface Closing {
  af: number;
  pf: number;
  side: number;
}

/**
 * Closing a fontanelle: the outlines near it are pulled towards its middle (within its reach, fading out along the
 * sutures that leave it), so its bones' corners really move in.
 */
function warp(q: V3, k: Closing): V3 {
  let out = q;
  const pull = (c: V3, r: number, a: number) => {
    if (a <= 0.001) return;
    const d = ang(out, c);
    const w = 1 - sm(r * 0.95, r * 2.1, d);
    if (w > 0) out = norm(mix3(out, c, 0.955 * a * w));
  };
  pull(FONT.af.c, FONT.af.r, k.af);
  pull(FONT.pf.c, FONT.pf.r, k.pf);
  for (const s of [-1, 1]) {
    pull(X(s, FONT.sf.c), FONT.sf.r, k.side);
    pull(X(s, FONT.mf.c), FONT.mf.r, k.side);
  }
  return out;
}

/** A closed smooth loop through the control points (a doubled point makes a corner), n points by arc length. */
function loopOf(ctrl: readonly V3[], n: number): V3[] {
  const m = ctrl.length;
  const at = (i: number) => ctrl[((i % m) + m) % m];
  const dense: V3[] = [];
  for (let i = 0; i < m; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    for (let s = 0; s < 14; s++) {
      const u = s / 14, u2 = u * u, u3 = u2 * u;
      const c = (j: number) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * u + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * u2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * u3);
      dense.push([c(0), c(1), c(2)]);
    }
  }
  const len = [0];
  for (let i = 1; i <= dense.length; i++) {
    const a = dense[i - 1], b = dense[i % dense.length];
    len.push(len[i - 1] + Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]));
  }
  const L = len[len.length - 1];
  const out: V3[] = [];
  let k = 1;
  for (let j = 0; j < n; j++) {
    const s = (L * j) / n;
    while (k < len.length - 1 && len[k] < s) k++;
    const f = (s - len[k - 1]) / Math.max(1e-9, len[k] - len[k - 1]);
    const a = dense[k - 1], b = dense[k % dense.length];
    out.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f]);
  }
  return out;
}

const ccw = (o: readonly V3[], c: V3) => o.reduce((a, q, i) => a + dot(c, cross(q, o[(i + 1) % o.length])), 0) > 0;

/** The loop of directions, warped, wound anticlockwise seen from outside and moved inside by half a suture's width. */
function plateOutline(ctrl: readonly V3[], c: V3, n: number, k: Closing, gap: number): V3[] {
  let o = loopOf(ctrl, n).map((q) => warp(norm(q), k));
  if (!ccw(o, c)) o = o.reverse();
  return o.map((q, i) => {
    const t = sub(o[(i + 3) % n], o[(i - 3 + n) % n]);
    const l = Math.hypot(t[0], t[1], t[2]);
    if (l < 1e-5) return q;
    return norm(add(q, mul(cross(q, mul(t, 1 / l)), gap)));
  });
}

type Side = 'L' | 'R' | 'M';
interface PlateDef {
  key: string;
  id: string;
  side: Side;
  centre: V3;
  ctrl: V3[];
  kind: 'frontal' | 'parietal' | 'occipital' | 'squama' | 'wing';
}

const plateDefs = (): PlateDef[] => {
  const out: PlateDef[] = [];
  for (const s of [1, -1]) {
    const c = (q: V3) => X(s, q);
    const side: Side = s > 0 ? 'L' : 'R';
    const n = N;
    out.push({
      key: `front${side}`,
      id: 'hezur-frontala',
      side,
      kind: 'frontal',
      centre: c(D(0.36, 0.42, 0.83)),
      ctrl: [n.nasion, n.m1, n.m2, n.afA, n.afA, n.afMa, n.afL, n.afL, n.c1, n.c2, n.c3, n.sfT, n.sfT, n.sfA, n.sfA, n.fz, n.so1, n.so2, n.so3, n.nasion].map(c),
    });
    out.push({
      key: `par${side}`,
      id: 'hezur-parietala',
      side,
      kind: 'parietal',
      centre: c(D(0.8, 0.5, -0.3)),
      ctrl: [n.afP, n.afP, n.sg1, n.sg2, n.sg3, n.pfA, n.pfA, n.pfL, n.pfL, n.l1, n.l2, n.l3, n.mfT, n.mfT, n.mfA, n.mfA, n.q1, n.q2, n.q3, n.q4, n.sfP, n.sfP, n.sfT, n.sfT, n.c3, n.c2, n.c1, n.afL, n.afL, n.afMp].map(c),
    });
    out.push({
      key: `squa${side}`,
      id: 'tenporalaren-ezkata',
      side,
      kind: 'squama',
      centre: c(D(0.93, -0.04, -0.04)),
      ctrl: [n.sfP, n.sfP, n.q4, n.q3, n.q2, n.q1, n.mfA, n.mfA, n.mfB, n.mfB, n.t1, n.t2, n.t3, n.t4, n.sfB, n.sfB].map(c),
    });
    out.push({
      key: `wing${side}`,
      id: 'esfenoidesaren-hego-handia',
      side,
      kind: 'wing',
      centre: c(D(0.8, -0.16, 0.56)),
      ctrl: [n.sfA, n.sfA, n.sfB, n.sfB, n.t4, n.w1, n.w2, n.w3, n.fz].map(c),
    });
  }
  const n = N;
  const R = (q: V3) => X(-1, q);
  out.push({
    key: 'occ',
    id: 'okzipitalaren-ezkata',
    side: 'M',
    kind: 'occipital',
    centre: D(0, 0.1, -1),
    ctrl: [n.pfP, n.pfL, n.pfL, n.l1, n.l2, n.l3, n.mfP, n.mfP, n.o1, n.o2, n.o3, n.o4, R(n.o3), R(n.o2), R(n.o1), R(n.mfP), R(n.mfP), R(n.l3), R(n.l2), R(n.l1), R(n.pfL), R(n.pfL)],
  });
  return out;
};
export const PLATES = plateDefs();

interface SutureDef {
  key: string;
  id: string;
  groups: string[];
  ctrl: V3[];
}
const sutureDefs = (): SutureDef[] => {
  const n = N;
  const out: SutureDef[] = [
    { key: 'met', id: 'joskura-metopikoa', groups: ['joskurak'], ctrl: [n.nasion, n.m1, n.m2, n.afA] },
    { key: 'sag', id: 'joskura-sagitala', groups: ['joskurak'], ctrl: [n.afP, n.sg1, n.sg2, n.sg3, n.pfA] },
  ];
  for (const s of [1, -1]) {
    const c = (q: V3) => X(s, q);
    const side = s > 0 ? 'L' : 'R';
    out.push({ key: `cor${side}`, id: 'joskura-koronala', groups: ['joskurak'], ctrl: [n.afL, n.c1, n.c2, n.c3, n.sfT].map(c) });
    out.push({ key: `lam${side}`, id: 'joskura-lanbdoidea', groups: ['joskurak'], ctrl: [n.pfL, n.l1, n.l2, n.l3, n.mfT].map(c) });
    out.push({ key: `squ${side}`, id: 'joskurak', groups: [], ctrl: [n.sfP, n.q4, n.q3, n.q2, n.q1, n.mfA].map(c) });
  }
  return out;
};
const SUTURES = sutureDefs();

const fontDefs = () => {
  const n = N;
  const R = (q: V3) => X(-1, q);
  const out: { key: string; id: string; c: V3; ctrl: V3[]; which: 'af' | 'pf' | 'side' }[] = [
    { key: 'af', id: 'aurreko-fontanela', c: FONT.af.c, which: 'af', ctrl: [n.afA, n.afA, n.afMa, n.afL, n.afL, n.afMp, n.afP, n.afP, R(n.afMp), R(n.afL), R(n.afL), R(n.afMa)] },
    { key: 'pf', id: 'atzeko-fontanela', c: FONT.pf.c, which: 'pf', ctrl: [n.pfA, n.pfA, n.pfL, n.pfL, n.pfP, R(n.pfL), R(n.pfL)] },
  ];
  for (const s of [1, -1]) {
    const c = (q: V3) => X(s, q);
    const side = s > 0 ? 'L' : 'R';
    out.push({ key: `sf${side}`, id: 'fontanela-esfenoidala', c: c(FONT.sf.c), which: 'side', ctrl: [n.sfT, n.sfA, n.sfB, n.sfP].map(c) });
    out.push({ key: `mf${side}`, id: 'fontanela-mastoidea', c: c(FONT.mf.c), which: 'side', ctrl: [n.mfT, n.mfA, n.mfB, n.mfP].map(c) });
  }
  return out;
};
const FONTS = fontDefs();

// ———————————————————————————— shells on the head ————————————————————————————

const THICK = 0.1;
/** Half a suture's width (radians on the head). */
const GAP = 0.026;
const MEM_OFF = -THICK * 0.62;

/** A radial grain from the ossification centre, as the bones of the notes' figure: one number per direction round it. */
const grain = (j: number, n: number, seed: number) => {
  const a = (j / n) * Math.PI * 2;
  return 0.55 * Math.sin(a * 23 + seed) + 0.3 * Math.sin(a * 37 + seed * 2.1) + 0.25 * Math.sin(a * 13 + seed * 0.7);
};

/** A bone plate: outer face, rounded rim, inner face, as one closed surface. The outline runs anticlockwise from outside. */
function shell(c: V3, o: readonly V3[], seed: number, rings: number, relief: number): Mesh {
  const n = o.length;
  const edge = o.map((q) => (THICK * 0.5) / (2.6 * Math.max(0.05, ang(c, q))));
  type Row = { r: (j: number) => number; off: (j: number, r: number) => number };
  const rows: Row[] = [];
  const reach = (j: number, r: number) => r * (1 - edge[j]);
  for (let i = 0; i <= rings; i++) {
    const r0 = 1 - (1 - i / rings) ** 1.5;
    rows.push({
      r: (j) => reach(j, r0),
      off: (j) => relief * grain(j, n, seed) * sm(0.12, 0.7, r0) * (1 - sm(0.92, 1, r0)),
    });
  }
  const RIM = 4;
  for (let k = 1; k < RIM; k++) {
    const a = (Math.PI * k) / RIM;
    rows.push({ r: (j) => 1 - edge[j] * (1 - Math.sin(a)), off: () => -(THICK / 2) * (1 - Math.cos(a)) });
  }
  const inner = Math.max(3, Math.round(rings / 3));
  for (let i = inner; i >= 0; i--) {
    const r0 = i / inner;
    rows.push({ r: (j) => reach(j, r0), off: () => -THICK - 0.03 * (1 - r0) ** 2 });
  }
  const nu = rows.length - 1;
  return grid(nu, n, (u, v) => {
    const i = Math.round(u * nu);
    const j = Math.round(v * n) % n;
    const R = rows[i];
    const r = R.r(j);
    const q = norm(mix3(c, o[j], r));
    return onHead(q, R.off(j, r));
  });
}

const STEP_C = 40;
/** A plate's mesh for these closings (cached: only the closing fontanelles' plates are ever rebuilt). */
function plateMesh(i: number, k: Closing, gap: number): Parts {
  const d = PLATES[i];
  // Only what can move this plate is in its key.
  const af = d.kind === 'frontal' || d.kind === 'parietal' ? q2(k.af, STEP_C) : 0;
  const pf = d.kind === 'parietal' || d.kind === 'occipital' ? q2(k.pf, STEP_C) : 0;
  const side = q2(k.side, STEP_C);
  const g = Math.round(gap * 2000) / 2000;
  const cl: Closing = { af, pf, side };
  const seed = 1.3 + i * 2.7;
  const big = d.kind === 'wing' ? 72 : d.kind === 'squama' ? 110 : 150;
  const rings = d.kind === 'wing' ? 8 : 16;
  const mesh = cachedMesh('skull-plate', [i, af, pf, side, g], () => shell(d.centre, plateOutline(d.ctrl, d.centre, big, cl, g), seed, rings, d.kind === 'wing' ? 0 : 0.0075));
  const hit = cachedMesh('skull-plate-hit', [i, af, pf, side, g], () => shell(d.centre, plateOutline(d.ctrl, d.centre, 40, cl, g), seed, 4, 0));
  return { mesh, hit };
}

/** Each plate's farthest reach from its centre (radians): its growth runs from 0 to there. */
const PLATE_REACH = PLATES.map((d) => loopOf(d.ctrl, 80).reduce((m, q) => Math.max(m, ang(d.centre, norm(q))), 0));

/** A ribbon along a suture, under the bones' surface (the connective tissue the gap shows). */
function sutureMesh(s: SutureDef, k: Closing, width: number, coarse: boolean): Mesh {
  const line = curve3(s.ctrl, coarse ? 12 : 44).map((q) => warp(norm(q), k));
  const nu = line.length - 1;
  const nv = 2;
  return grid(nu, nv, (u, v) => {
    const i = Math.round(u * nu);
    const q = line[i];
    const t = norm(sub(line[Math.min(nu, i + 1)], line[Math.max(0, i - 1)]));
    const side = cross(q, t);
    const f = (v - 0.5) * 2;
    return onHead(norm(add(q, mul(side, f * width))), MEM_OFF * 0.66 + 0.006 * (1 - f * f));
  }, mul(line[Math.round(nu / 2)], 30));
}

/** A fontanelle's own membrane: as big as the gap between its bones, tucked under their edges. */
function fontMesh(f: (typeof FONTS)[number], k: Closing, coarse: boolean): Mesh {
  const n = coarse ? 16 : 56;
  let o = loopOf(f.ctrl, n).map((q) => warp(norm(q), k));
  if (!ccw(o, f.c)) o = o.reverse();
  const rings = coarse ? 2 : 6;
  return grid(rings, n, (u, v) => {
    const j = Math.round(v * n) % n;
    const q = norm(mix3(f.c, o[j], u * 1.03));
    return onHead(q, MEM_OFF * 0.55 - 0.03 * (1 - u * u));
  });
}

/** The membrane the plates form in: a dome (open below), double-walled so it reads from inside too. */
function domeMesh(y0: number, y1: number, nu: number, nv: number): Mesh {
  // u from the top of the dome (y0 = 0: the crown) down to the rim; the rim's height depends on where round the head.
  const low = (a: number) => {
    const z = Math.cos(a);
    // Polar angle of the rim: higher in front (the orbits), lower at the sides and behind.
    return 1.72 + 0.46 * sm(0.5, -0.1, z) + 0.12 * sm(-0.3, -0.95, z);
  };
  const at = (off: number) => (u: number, v: number): V3 => {
    const a = v * Math.PI * 2;
    const th = (y0 + (y1 - y0) * u) * low(a);
    const q = norm([Math.sin(th) * Math.sin(a), Math.cos(th), Math.sin(th) * Math.cos(a)]);
    return onHead(q, off);
  };
  const outer = grid(nu, nv, at(MEM_OFF));
  const inner = grid(nu, nv, at(MEM_OFF - 0.03), [0, 0, 0]);
  // grid winds by `facing` at the middle of the patch only: the outer one wound outwards.
  const fix = (m: Mesh, out: boolean) => {
    const v = (Math.floor(nu / 2) * (nv + 1) + Math.floor(nv / 2)) * 3;
    const p: V3 = [m.pos[v], m.pos[v + 1], m.pos[v + 2]];
    const nv3: V3 = [m.nrm[v], m.nrm[v + 1], m.nrm[v + 2]];
    if (dot(p, nv3) > 0 === out) return m;
    const idx = Uint32Array.from(m.idx);
    for (let t = 0; t < idx.length; t += 3) [idx[t + 1], idx[t + 2]] = [idx[t + 2], idx[t + 1]];
    return { ...m, nrm: m.nrm.map((x) => -x), idx };
  };
  return merge([fix(outer, true), fix(inner, false)]);
}

function brainMesh(nu: number, nv: number): Mesh {
  return grid(nu, nv, (u, v) => {
    const th = u * Math.PI;
    const a = v * Math.PI * 2;
    const q = norm([Math.sin(th) * Math.sin(a), Math.cos(th), Math.sin(th) * Math.cos(a)]);
    let r = headR(q) - 0.17;
    // Flattened below, on the base.
    r *= 1 - 0.34 * sm(-0.1, -0.85, q[1]) * (1 - 0.3 * sm(0.3, -0.7, q[2]));
    // The interhemispheric fissure, the lateral sulcus, the shallow folds of a fetal brain.
    r -= 0.3 * Math.exp(-((q[0] / 0.035) ** 2)) * sm(-0.3, 0.3, q[1] + 0.45 * Math.abs(q[2]));
    const lat = Math.abs(q[0]);
    r -= 0.13 * Math.exp(-(((q[1] + 0.05 - 0.45 * (q[2] - 0.1) * (lat > 0 ? 0.6 : 0.6)) / 0.05) ** 2)) * sm(0.45, 0.8, lat) * sm(-0.5, -0.05, q[2]) * sm(0.75, 0.3, q[2]);
    r += 0.022 * Math.sin(q[2] * 21 + 2.1 * Math.sin(q[1] * 8)) * sm(0, 0.6, q[1]);
    return mul(q, r);
  });
}

// ———————————————————————————— the base ————————————————————————————

type P2 = [number, number];

/** The floor of the skull seen from above: the three stairs of the fossae, the body of the sphenoid, the sella. */
export function baseY(x: number, z: number): number {
  const ant = sm(0.95, 1.4, z);
  const post = sm(-0.15, -0.95, z);
  let y = -1.4 + 0.72 * ant - 0.42 * post;
  const mid = Math.exp(-((x / 0.62) ** 2));
  y += mid * 0.48 * sm(-1.15, 0.15, z) * (1 - ant);
  y -= 0.2 * Math.exp(-((x / 0.3) ** 2) - ((z - 0.62) / 0.24) ** 2);
  y += 0.32 * sm(1.55, 2.3, Math.abs(x));
  return y;
}

const FM_C: P2 = [0, -1.2];
const FM_R: P2 = [0.4, 0.48];
const ellipse2 = (c: P2, r: P2, n = 16, power = 1): P2[] =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [c[0] + r[0] * Math.sign(Math.cos(a)) * Math.abs(Math.cos(a)) ** power, c[1] + r[1] * Math.sign(Math.sin(a)) * Math.abs(Math.sin(a)) ** power];
  });

function loop2(ctrl: readonly P2[], n: number): P2[] {
  const v = ctrl.map((p): V3 => [p[0], 0, p[1]]);
  return loopOf(v, n).map((q) => [q[0], q[2]]);
}
const area2 = (o: readonly P2[]) => o.reduce((a, p, i) => a + (p[0] * o[(i + 1) % o.length][1] - o[(i + 1) % o.length][0] * p[1]), 0);

interface Plate2Spec {
  outer: readonly P2[];
  /** A hole (an outline as many points as `outer`), or a centre point (a filled plate). */
  inner: readonly P2[] | P2;
  /** How far the top is above the base's floor at its edge and how much it domes in the middle; its thickness. */
  lift: number;
  dome: number;
  t: number;
  rings?: number;
}

/** A solid plate lying on the base (a closed surface with a rounded rim). */
function plate2(sp: Plate2Spec, n: number, rings: number): Mesh {
  let out = loop2(sp.outer, n);
  const hole = Array.isArray(sp.inner[0]);
  let inn: P2[] = hole ? loop2(sp.inner as P2[], n) : Array.from({ length: n }, () => sp.inner as P2);
  // Wound so the top faces up (grid: radial × around must point +y).
  if (area2(out) > 0) {
    out = out.reverse();
    if (hole) inn = inn.reverse();
  }
  if (hole) {
    // The two loops' starts may be far apart: turn the inner one to the closest.
    let best = 0, bd = Infinity;
    for (let k = 0; k < n; k++) {
      const d = Math.hypot(inn[k][0] - out[0][0], inn[k][1] - out[0][1]);
      if (d < bd) {
        bd = d;
        best = k;
      }
    }
    inn = [...inn.slice(best), ...inn.slice(0, best)];
  }
  const E = 0.05;
  type Row = { f: number; top: number };
  const rows: Row[] = [];
  const domeAt = (f: number) => (hole ? Math.sin(Math.PI * clamp01(f)) ** 0.6 : Math.sqrt(Math.max(0, 1 - f * f)));
  for (let i = 0; i <= rings; i++) rows.push({ f: hole ? i / rings : 1 - (1 - i / rings) ** 1.4, top: 1 });
  const RIM = 3;
  for (let k = 1; k < RIM; k++) {
    const a = (Math.PI * k) / RIM;
    rows.push({ f: 1 + 0.015 * Math.sin(a), top: (Math.cos(a) + 1) / 2 });
  }
  const back = Math.max(2, Math.round(rings / 3));
  for (let i = back; i >= 0; i--) rows.push({ f: i / back, top: 0 });
  if (hole) for (let k = 1; k < RIM; k++) {
    const a = (Math.PI * k) / RIM;
    rows.push({ f: -0.015 * Math.sin(a), top: (1 - Math.cos(a)) / 2 });
  }
  const nu = rows.length - 1 + (hole ? 1 : 0);
  void E;
  return grid(nu, n, (u, v) => {
    const i = Math.round(u * nu);
    const j = Math.round(v * n) % n;
    const R = rows[i % rows.length];
    const f = R.f;
    const x = inn[j][0] + (out[j][0] - inn[j][0]) * f;
    const z = inn[j][1] + (out[j][1] - inn[j][1]) * f;
    const top = baseY(x, z) + sp.lift + sp.dome * domeAt(f);
    const y = top - sp.t * (1 - R.top) * (R.top > 0 && R.top < 1 ? 1 : 1);
    return [x, y, z];
  });
}

const FM_OUT = ellipse2(FM_C, FM_R, 20);

/** The cartilages (the notes' figure, right half) and the bones they give (left half). Outlines on the fetus's left. */
const LEFT = {
  orbWing: [[0.3, 1.34], [0.72, 1.58], [1.28, 1.62], [1.8, 1.36], [1.62, 1.18], [1.06, 1.08], [0.6, 0.98], [0.3, 0.98]] as P2[],
  tempWing: [[0.36, 0.78], [0.84, 0.92], [1.46, 0.96], [1.96, 0.74], [2.08, 0.34], [1.66, 0.1], [1.0, 0.2], [0.36, 0.38]] as P2[],
  capsule: [[0.48, 0.16], [0.86, 0.1], [1.42, -0.16], [1.96, -0.6], [1.86, -0.98], [1.34, -0.88], [0.8, -0.42], [0.46, -0.1]] as P2[],
  lesser: [[0.26, 1.42], [0.72, 1.68], [1.32, 1.72], [1.9, 1.4], [1.66, 1.14], [1.06, 1.02], [0.6, 0.92], [0.26, 0.92]] as P2[],
  greater: [[0.32, 0.86], [0.86, 1.0], [1.5, 1.04], [2.05, 0.8], [2.2, 0.32], [1.7, 0.04], [1.0, 0.12], [0.32, 0.32]] as P2[],
  petrous: [[0.42, 0.2], [0.86, 0.16], [1.48, -0.1], [2.06, -0.58], [1.96, -1.08], [1.34, -0.96], [0.76, -0.46], [0.4, -0.1]] as P2[],
};
const mirror2 = (o: readonly P2[]): P2[] => o.map((p) => [-p[0], p[1]]);

/** The whole lamina's outline, from the foramen magnum out (star-shaped round it). */
const LAMINA: P2[] = (() => {
  const L: P2[] = [[0.2, 2.62], [0.42, 2.3], [0.42, 1.7], [0.74, 1.72], [1.34, 1.76], [1.96, 1.42], [1.76, 1.14], [2.18, 0.9], [2.32, 0.32], [2.14, -0.42], [2.12, -1.1], [1.5, -1.5], [1.06, -2.0], [0.5, -2.22]];
  return [...L, ...L.map((p): P2 => [-p[0], p[1]]).reverse()];
})();

interface BaseDef {
  key: string;
  id: string;
  groups?: string[];
  spec: Plate2Spec;
  kind: 'mid' | 'L' | 'R' | 'midDark';
  centre: P2;
}

const baseCartilages = (): BaseDef[] => {
  const out: BaseDef[] = [
    {
      key: 'trab',
      id: 'trenkada-kranialak',
      kind: 'midDark',
      centre: [0, 1.7],
      spec: { outer: [[0.1, 2.56], [0.26, 2.3], [0.26, 1.5], [0.2, 0.98], [-0.2, 0.98], [-0.26, 1.5], [-0.26, 2.3], [-0.1, 2.56]], inner: [0, 1.7], lift: 0.05, dome: 0.09, t: 0.2 },
    },
    {
      key: 'hyp',
      id: 'hipofisi-kartilagoak',
      kind: 'midDark',
      centre: [0, 0.62],
      spec: { outer: [[0.2, 1.04], [0.42, 0.92], [0.46, 0.5], [0.4, 0.26], [-0.4, 0.26], [-0.46, 0.5], [-0.42, 0.92], [-0.2, 1.04]], inner: [0, 0.62], lift: 0.05, dome: 0.05, t: 0.2 },
    },
    {
      key: 'para',
      id: 'kartilago-parakordalak',
      kind: 'midDark',
      centre: [0, -0.28],
      spec: { outer: [[0.4, 0.3], [0.46, 0.0], [0.44, -0.48], [0.3, -0.72], [-0.3, -0.72], [-0.44, -0.48], [-0.46, 0.0], [-0.4, 0.3]], inner: [0, -0.28], lift: 0.05, dome: 0.08, t: 0.2 },
    },
    {
      key: 'scler',
      id: 'esklerotoma-okzipitalak',
      kind: 'mid',
      centre: FM_C,
      spec: { outer: ellipse2(FM_C, [1.02, 0.98], 20), inner: ellipse2(FM_C, [FM_R[0] + 0.06, FM_R[1] + 0.06], 20), lift: 0.03, dome: 0.09, t: 0.18, rings: 8 },
    },
  ];
  for (const [side, f] of [['L', (o: readonly P2[]) => [...o]], ['R', mirror2]] as const) {
    const sx = side === 'L' ? 1 : -1;
    out.push(
      { key: `orb${side}`, id: 'begizulo-hegoa', kind: side, centre: [1.0 * sx, 1.32], spec: { outer: f(LEFT.orbWing), inner: [1.0 * sx, 1.32], lift: 0.04, dome: 0.08, t: 0.18 } },
      { key: `tem${side}`, id: 'hego-tenporala', kind: side, centre: [1.2 * sx, 0.56], spec: { outer: f(LEFT.tempWing), inner: [1.2 * sx, 0.56], lift: 0.04, dome: 0.08, t: 0.18 } },
      { key: `cap${side}`, id: 'kapsula-periotikoa', kind: side, centre: [1.22 * sx, -0.42], spec: { outer: f(LEFT.capsule), inner: [1.22 * sx, -0.42], lift: 0.06, dome: 0.3, t: 0.22 } },
    );
  }
  return out;
};

const baseBones = (): BaseDef[] => {
  const out: BaseDef[] = [
    {
      key: 'eth',
      id: 'etmoidesa',
      kind: 'mid',
      centre: [0, 1.9],
      spec: { outer: [[0.14, 2.66], [0.38, 2.34], [0.38, 1.5], [0.26, 1.16], [-0.26, 1.16], [-0.38, 1.5], [-0.38, 2.34], [-0.14, 2.66]], inner: [0, 1.9], lift: 0.1, dome: 0.1, t: 0.24 },
    },
    {
      key: 'body',
      id: 'esfenoidesaren-gorputza',
      kind: 'mid',
      centre: [0, 0.62],
      spec: { outer: [[0.24, 1.2], [0.5, 1.04], [0.54, 0.5], [0.44, 0.2], [-0.44, 0.2], [-0.54, 0.5], [-0.5, 1.04], [-0.24, 1.2]], inner: [0, 0.62], lift: 0.1, dome: 0.04, t: 0.24 },
    },
    {
      key: 'obas',
      id: 'okzipitalaren-oinaldea',
      kind: 'mid',
      centre: FM_C,
      spec: {
        outer: [[0.44, 0.24], [0.54, -0.2], [0.66, -0.6], [1.12, -0.86], [1.28, -1.34], [1.1, -1.86], [0.56, -2.12], [0, -2.18], [-0.56, -2.12], [-1.1, -1.86], [-1.28, -1.34], [-1.12, -0.86], [-0.66, -0.6], [-0.54, -0.2], [-0.44, 0.24]].slice().reverse() as P2[],
        inner: ellipse2(FM_C, FM_R, 15),
        lift: 0.1,
        dome: 0.08,
        t: 0.24,
        rings: 8,
      },
    },
  ];
  for (const [side, f] of [['L', (o: readonly P2[]) => [...o]], ['R', mirror2]] as const) {
    const sx = side === 'L' ? 1 : -1;
    out.push(
      { key: `les${side}`, id: 'esfenoidesaren-hego-txikia', kind: side, centre: [1.0 * sx, 1.3], spec: { outer: f(LEFT.lesser), inner: [1.0 * sx, 1.3], lift: 0.1, dome: 0.08, t: 0.22 } },
      { key: `gre${side}`, id: 'esfenoidesaren-hego-handia', kind: side, centre: [1.25 * sx, 0.56], spec: { outer: f(LEFT.greater), inner: [1.25 * sx, 0.56], lift: 0.1, dome: 0.07, t: 0.22 } },
      { key: `pet${side}`, id: 'harkaitza', kind: side, centre: [1.2 * sx, -0.42], spec: { outer: f(LEFT.petrous), inner: [1.2 * sx, -0.42], lift: 0.12, dome: 0.46, t: 0.3 } },
    );
  }
  return out;
};

export const BASE_CARTILAGES = baseCartilages();
export const BASE_BONES = baseBones();

// ———————————————————————————— the face: sculpted once ————————————————————————————

/** A chain of rounded cones in a scaled space (a flat or tall section), smoothly joined. */
function chain(pts: readonly V3[], rad: readonly number[], scale: V3 = [1, 1, 1], k = 0.06): SDF {
  const sc = (p: V3): V3 => [p[0] * scale[0], p[1] * scale[1], p[2] * scale[2]];
  const links = pts.slice(0, -1).map((p, i) => capsule(sc(p), sc(pts[i + 1]), rad[i], rad[i + 1]));
  const div = Math.max(...scale);
  return (x, y, z) => {
    const X0 = x * scale[0], Y0 = y * scale[1], Z0 = z * scale[2];
    let d = links[0](X0, Y0, Z0);
    for (let i = 1; i < links.length; i++) d = smin(d, links[i](X0, Y0, Z0), k);
    return d / div;
  };
}

const ORBIT = ellipsoid([0.93, -0.86, 2.42], [0.68, 0.64, 0.95]);
const APERTURE = ellipsoid([0, -1.42, 3.05], [0.4, 0.58, 0.95]);

const maxillaF: SDF = (() => {
  const body = ellipsoid([0.62, -1.7, 2.22], [0.68, 0.5, 0.74]);
  const alv = ellipsoid([0.56, -2.14, 2.22], [0.64, 0.2, 0.68]);
  const fp = capsule([0.44, -1.42, 2.55], [0.22, -0.62, 2.78], 0.19, 0.1);
  const zp = capsule([0.98, -1.62, 2.1], [1.42, -1.46, 1.84], 0.25, 0.17);
  return (x, y, z) => {
    let d = smin(body(x, y, z), alv(x, y, z), 0.14);
    d = smin(d, fp(x, y, z), 0.14);
    d = smin(d, zp(x, y, z), 0.16);
    d = ssub(d, ORBIT(x, y, z), 0.05);
    d = ssub(d, APERTURE(x, y, z), 0.05);
    d = Math.max(d, -(y + 2.32), 0.012 - x);
    return Math.max(d, 1.38 - z);
  };
})();

const zygomaticF: SDF = (() => {
  const body = ellipsoid([1.54, -1.42, 1.72], [0.36, 0.33, 0.36]);
  const fr = capsule([1.6, -1.2, 1.76], [1.6, -0.48, 1.74], 0.15, 0.09);
  const tp = chain([[1.72, -1.45, 1.46], [2.02, -1.34, 0.86]], [0.13, 0.09], [1.6, 1, 1], 0.05);
  return (x, y, z) => {
    let d = smin(body(x, y, z), fr(x, y, z), 0.12);
    d = smin(d, tp(x, y, z), 0.1);
    return ssub(d, ORBIT(x, y, z), 0.04);
  };
})();

const nasalF: SDF = (x, y, z) => {
  const c = chain([[0.14, -0.44, 2.86], [0.18, -1.02, 3.1]], [0.11, 0.17], [1, 1, 2.2], 0.05)(x, y, z);
  return Math.max(c, 0.012 - x);
};

const mandibleF: SDF = (() => {
  const body = chain(
    [[0, -3.02, 2.6], [0.46, -3.0, 2.46], [0.96, -2.94, 2.06], [1.38, -2.82, 1.56], [1.74, -2.66, 1.08]],
    [0.17, 0.17, 0.165, 0.15, 0.14],
    [1, 0.55, 1],
    0.1,
  );
  const ramus = chain([[1.74, -2.66, 1.08], [1.94, -2.26, 0.72], [2.02, -1.76, 0.56]], [0.2, 0.2, 0.13], [2.2, 1, 1], 0.08);
  const coronoid = chain([[1.84, -2.36, 0.95], [1.88, -1.72, 1.12]], [0.14, 0.05], [2.4, 1, 1], 0.06);
  const condyle = ellipsoid([2.03, -1.72, 0.54], [0.2, 0.12, 0.13]);
  return (x, y, z) => {
    let d = smin(body(x, y, z), ramus(x, y, z), 0.1);
    d = smin(d, coronoid(x, y, z), 0.05);
    d = smin(d, condyle(x, y, z), 0.05);
    return Math.max(d, 0.012 - x);
  };
})();

const pterygoidF: SDF = (() => {
  const a = ellipsoid([0.72, -1.72, 0.96], [0.5, 0.56, 0.62]);
  const b = chain([[0.7, -1.3, 1.1], [0.72, -2.26, 1.3]], [0.2, 0.1], [2.4, 1, 1], 0.06);
  return (x, y, z) => smin(a(x, y, z), b(x, y, z), 0.14);
})();

const temporalProcessF: SDF = chain([[2.2, -1.26, 0.06], [2.06, -1.3, 0.86]], [0.13, 0.08], [1.7, 1, 1], 0.05);
const mastoidF: SDF = ellipsoid([1.92, -1.76, -0.6], [0.44, 0.4, 0.56]);
const condylesF: SDF = (x, y, z) => Math.min(ellipsoid([0.5, -2.2, -1.05], [0.22, 0.14, 0.36])(x, y, z), ellipsoid([0.5, -2.05, -1.2], [0.3, 0.2, 0.46])(x, y, z));
const cristaF: SDF = ellipsoid([0, -0.42, 2.1], [0.05, 0.24, 0.42]);

interface Pair {
  m: Mesh;
  h: Mesh;
}
interface SkullGeo {
  maxilla: Pair;
  zygomatic: Pair;
  nasal: Pair;
  mandible: Pair;
  pterygoid: Pair;
  tProcess: Pair;
  mastoid: Pair;
  condyles: Pair;
  crista: Pair;
  dome: Pair;
  band: Pair;
  brain: Pair;
  floor: Pair;
  cart: Record<string, Pair>;
  lamina: Pair;
  bones: Record<string, Pair>;
}

const mk = (f: SDF, lo: V3, hi: V3, step: number, hitStep = step * 3.2): Pair => {
  const pad = hitStep * 0.45;
  return {
    m: surfaceMesh(f, lo, hi, step),
    h: surfaceMesh((x, y, z) => f(x, y, z) - pad, [lo[0] - pad, lo[1] - pad, lo[2] - pad], [hi[0] + pad, hi[1] + pad, hi[2] + pad], hitStep),
  };
};

function buildGeo(): SkullGeo {
  const plate = (s: Plate2Spec, n = 96): Pair => ({ m: plate2(s, n, s.rings ?? 10), h: plate2(s, 32, 3) });
  const cart: Record<string, Pair> = {};
  for (const b of BASE_CARTILAGES) cart[b.key] = plate(b.spec);
  const bones: Record<string, Pair> = {};
  for (const b of BASE_BONES) bones[b.key] = plate(b.spec);
  const floorOut = (() => {
    const n = 40;
    return Array.from({ length: n }, (_, i): P2 => {
      const a = (i / n) * Math.PI * 2;
      const q = norm([Math.sin(a) * 0.9, -0.42, Math.cos(a) * 0.9]);
      const p = onHead(q, -THICK * 1.2);
      return [p[0], p[2]];
    });
  })();
  const toFM = (o: readonly P2[]) => Array.from({ length: o.length }, (_, i) => {
    const p = o[i];
    const a = Math.atan2(p[1] - FM_C[1], p[0] - FM_C[0]);
    return [FM_C[0] + FM_R[0] * Math.cos(a), FM_C[1] + FM_R[1] * Math.sin(a)] as P2;
  });
  return {
    maxilla: mk(maxillaF, [0, -2.45, 1.3], [1.75, -0.45, 3.2], 0.032),
    zygomatic: mk(zygomaticF, [1.1, -1.9, 0.7], [2.3, -0.3, 2.2], 0.03),
    nasal: mk(nasalF, [0, -1.3, 2.6], [0.42, -0.25, 3.35], 0.022),
    mandible: mk(mandibleF, [0, -3.45, 0.3], [2.35, -1.5, 2.95], 0.032),
    pterygoid: mk(pterygoidF, [0.1, -2.5, 0.3], [1.35, -1.05, 1.7], 0.05),
    tProcess: mk(temporalProcessF, [1.85, -1.55, -0.2], [2.45, -1.05, 1.05], 0.025),
    mastoid: mk(mastoidF, [1.42, -2.25, -1.25], [2.45, -1.3, 0.05], 0.04),
    condyles: mk(condylesF, [0.1, -2.45, -1.75], [0.95, -1.75, -0.55], 0.04),
    crista: mk(cristaF, [-0.1, -0.75, 1.6], [0.1, -0.1, 2.6], 0.02),
    dome: { m: domeMesh(0, 0.72, 40, 96), h: domeMesh(0, 0.72, 10, 24) },
    band: { m: domeMesh(0.72, 1, 16, 96), h: domeMesh(0.72, 1, 3, 24) },
    brain: { m: brainMesh(96, 140), h: brainMesh(18, 28) },
    floor: { m: plate2({ outer: floorOut, inner: toFM(floorOut), lift: -0.16, dome: 0, t: 0.16 }, 96, 8), h: plate2({ outer: floorOut, inner: toFM(floorOut), lift: -0.16, dome: 0, t: 0.16 }, 32, 2) },
    cart,
    lamina: (() => {
      const hole = ellipse2(FM_C, FM_R, LAMINA.length);
      const sp: Plate2Spec = { outer: LAMINA, inner: hole, lift: -0.05, dome: 0, t: 0.1 };
      return { m: plate2(sp, 128, 10), h: plate2(sp, 40, 2) };
    })(),
    bones,
  };
}

/** The sculpted parts, built once (off the main thread in the browser; see `useGeoReady`). */
export const SKULL_GEO = geoSlot('skull17', buildGeo);

// ———————————————————————————— other small parts ————————————————————————————

const tubeOf = (kps: V3[], r0: number, r1: number, sides = 12, n = 16): Parts => vessel(curve3(kps, n), { r0, r1, ref: [0.3, 0.2, 1], sides, flare: 0.3, flareLen: r0 * 2 })!;

const styloid = (s: number) => tubeOf([X(s, [1.72, -2.0, -0.28]), X(s, [1.6, -2.5, 0.0]), X(s, [1.44, -3.08, 0.36])], 0.075, 0.022, 10);
const hyoidUpper = tubeOf([[-0.44, -3.97, 1.44], [-0.22, -3.92, 1.66], [0, -3.91, 1.72], [0.22, -3.92, 1.66], [0.44, -3.97, 1.44]], 0.075, 0.075, 12, 24);
const hyoidLower = tubeOf([[-0.44, -4.1, 1.44], [-0.22, -4.06, 1.66], [0, -4.05, 1.72], [0.22, -4.06, 1.66], [0.44, -4.1, 1.44]], 0.085, 0.085, 12, 24);
const lesserHorn = (s: number) => tubeOf([X(s, [0.36, -3.96, 1.52]), X(s, [0.5, -3.74, 1.5]), X(s, [0.62, -3.56, 1.44])], 0.065, 0.04, 10, 10);
const greaterHorn = (s: number) => tubeOf([X(s, [0.42, -4.04, 1.44]), X(s, [0.84, -3.98, 1.0]), X(s, [1.08, -3.84, 0.56])], 0.075, 0.05, 10, 14);
const ring = (s: number): Parts => {
  const c: V3 = X(s, [2.27, -1.66, 0.04]);
  const line = Array.from({ length: 22 }, (_, i): V3 => {
    const a = -0.9 + (i / 21) * 5.4;
    return add(c, [s * 0.05 * Math.cos(a), 0.27 * Math.sin(a), 0.22 * Math.cos(a)]);
  });
  return vessel(line, { r0: 0.055, r1: 0.055, ref: [s, 0, 0.001], sides: 8 })!;
};
const ORBIT_CUP = (s: number) => cupShell({ center: X(s, [0.93, -0.86, 1.92]), axis: D(s * 0.32, 0, 0.95), radius: 0.76, thick: 0.05, wrap: 0.55, rings: 12, sides: 28 });
const NOSE_HOLE: Parts = cupShell({ center: [0, -1.42, 2.1], axis: [0, 0.05, 1], radius: 0.74, thick: 0.05, wrap: 0.5, rings: 10, sides: 24 });
const meatus = (s: number): Parts => cupShell({ center: X(s, [2.1, -1.66, 0.04]), axis: D(s, 0, 0.1), radius: 0.24, thick: 0.03, wrap: 0.5, rings: 6, sides: 16 });
const hypophysis = (() => {
  const m = cachedMesh('skull-hyp', [1], () =>
    grid(14, 20, (u, v) => {
      const th = u * Math.PI, a = v * Math.PI * 2;
      return [0.2 * Math.sin(th) * Math.cos(a), baseY(0, 0.62) + 0.12 + 0.13 * Math.cos(th), 0.62 + 0.18 * Math.sin(th) * Math.sin(a)];
    }),
  );
  return { mesh: m } as Parts;
})();

// ———————————————————————————— the model ————————————————————————————

const SEQ_SIDE = { L: 1, R: -1 } as const;
const identity = (): M4 => {
  const m = new Float32Array(16);
  m[0] = m[5] = m[10] = m[15] = 1;
  return m;
};
/** Moulding: the head a little narrower and longer, one plate's own shift on top. */
const moulded = (k: number, d: V3): M4 => {
  const m = identity();
  m[0] = 1 - 0.07 * k;
  m[5] = 1 + 0.03 * k;
  m[10] = 1 + 0.035 * k;
  m[12] = d[0] * k;
  m[13] = d[1] * k;
  m[14] = d[2] * k;
  return m;
};
const shifted = (d: V3): M4 => {
  const m = identity();
  m[12] = d[0];
  m[13] = d[1];
  m[14] = d[2];
  return m;
};
const compose = (k: number, d: V3, lift: V3): M4 => {
  const m = moulded(k, d);
  m[12] += lift[0];
  m[13] += lift[1];
  m[14] += lift[2];
  return m;
};

/** Where the lid goes: straight up first, then up and back out of the picture. */
const lidOffset = (l: number): V3 => [0, 8.5 * sm(0, 1, l), -5 * sm(0.45, 1, l)];

export const skullPoints = (mould: number): Record<string, V3> => {
  const v = (q: V3, off = 0.02): V3 => {
    const p = onHead(norm(q), off);
    return [p[0] * (1 - 0.07 * mould), p[1] * (1 + 0.03 * mould), p[2] * (1 + 0.035 * mould)];
  };
  return {
    'hezur-frontala': v(D(0.42, 0.34, 0.84)),
    'hezur-parietala': v(D(0.74, 0.58, -0.34)),
    'okzipitalaren-ezkata': v(D(0.16, 0.14, -0.98)),
    'tenporalaren-ezkata': v(D(0.93, -0.06, -0.05)),
    'joskura-metopikoa': v(D(0, 0.42, 0.9), 0),
    'joskura-sagitala': v(D(0, 0.98, -0.2), 0),
    'joskura-koronala': v(D(0.56, 0.71, 0.44), 0),
    'joskura-lanbdoidea': v(D(0.48, 0.37, -0.79), 0),
    joskurak: v(D(0.93, 0.31, -0.02), 0),
    'aurreko-fontanela': v(FONT.af.c, -0.03),
    'atzeko-fontanela': v(FONT.pf.c, -0.03),
    'fontanela-esfenoidala': v(FONT.sf.c, -0.03),
    'fontanela-mastoidea': v(FONT.mf.c, -0.03),
    fontanelak: v(FONT.af.c, -0.03),
  };
};

export function skullModel(pose: SkullPose, opts: SkullOpts = {}): { items: Item3[]; pts: Record<string, V3> } {
  void opts;
  const G = geoOf(SKULL_GEO);
  const items: Item3[] = [];
  const rest = clamp01(pose.rest);
  const tint = clamp01(pose.archTint);
  const mould = clamp01(pose.mould);
  const lid = clamp01(pose.lid);
  const k: Closing = { af: clamp01(pose.afClose), pf: clamp01(pose.pfClose), side: clamp01(pose.sideClose) };
  const gap = GAP * (1 - 0.72 * clamp01(pose.sutureClose));
  const lidGone = lid >= 0.995;
  const lidAt = lidOffset(lid);
  const lidM = (d: V3) => compose(mould, d, lidAt);

  const put = (key: string, id: string | undefined, p: Parts | Pair, color: string, deep: string, extra: Partial<Item3> = {}) => {
    const mesh = 'mesh' in p ? p.mesh : p.m;
    const hit = 'mesh' in p ? p.hit : p.h;
    items.push({ key, id, mesh, hit, color, deep, tissue: 'bone', ...extra });
  };

  // ———— context: the floor and the hollows of the face ————
  if (rest > 0.01) {
    put('floor', undefined, G.floor, SKULL_C.floor, SKULL_C.floorDeep, { tissue: 'mesenchyme', quiet: true, ground: true, show: rest, outline: false });
    put('band', undefined, G.band, SKULL_C.membrane, SKULL_C.membraneDeep, { tissue: 'membrane', quiet: true, ground: true, show: rest * pose.membrane, outline: false });
  }

  // ———— the encephalon ————
  if (pose.brain > 0.01 && rest > 0.01) put('brain', 'entzefaloa', G.brain, SKULL_C.brain, SKULL_C.brainDeep, { tissue: 'neural', show: pose.brain * rest, groups: ['neurokraneoa-edukia'] });

  // ———— the membrane dome and the flat bones ————
  const domeShow = pose.membrane * rest;
  if (domeShow > 0.01 && !lidGone) put('dome', 'mintza', G.dome, SKULL_C.membrane, SKULL_C.membraneDeep, { tissue: 'membrane', quiet: true, ground: true, show: domeShow, matrix: lidM([0, 0, 0]), outline: false });
  const g = clamp01(pose.vault);
  if (g > 0.003 && rest > 0.01) {
    PLATES.forEach((d, i) => {
      const inLid = d.kind === 'frontal' || d.kind === 'parietal';
      if (d.kind !== 'squama' && d.kind !== 'wing' && rest < 0.01) return;
      if (inLid && lidGone) return;
      const isSquama = d.kind === 'squama';
      // Birth: the parietals ride up over their neighbours and towards each other; the others slip under them.
      const sign = d.side === 'L' ? 1 : d.side === 'R' ? -1 : 0;
      const shift: V3 = d.kind === 'parietal' ? [-sign * 0.13, 0.06 + (sign > 0 ? 0.05 : 0), 0] : d.kind === 'frontal' ? [0, -0.05, -0.18] : d.kind === 'occipital' ? [0, -0.05, 0.2] : [0, 0, 0];
      const parts = plateMesh(i, k, gap);
      const growing = g < 0.999;
      const clip: Clip3 | undefined = growing ? { o: [0, 0, 0], grow: { dir: d.centre, cos: Math.cos(g * PLATE_REACH[i] * 1.03), spicules: 1 } } : undefined;
      const wingFade = d.kind === 'wing' ? clamp01(pose.face) : 1;
      if (wingFade < 0.01) return;
      const orig = clamp01(pose.origin);
      let color: string = SKULL_C.bone;
      let deep: string = SKULL_C.boneDeep;
      if (orig > 0 && (d.kind === 'frontal' || d.kind === 'parietal' || d.kind === 'occipital')) {
        const to = d.kind === 'frontal' ? SKULL_C.crest : SKULL_C.paraxial;
        const toD = d.kind === 'frontal' ? SKULL_C.crestDeep : SKULL_C.paraxialDeep;
        color = mixHex(color, to, orig);
        deep = mixHex(deep, toD, orig);
      }
      if (isSquama && tint > 0) {
        color = mixHex(color, ARCH.i, tint);
        deep = mixHex(deep, ARCH_DEEP.i, tint);
      }
      const show = isSquama ? 1 : rest * wingFade;
      put(d.key, d.id, parts, color, deep, { groups: d.kind === 'wing' ? ['neurokraneoa'] : ['buru-ganga', 'neurokraneoa'], show, clip, outline: !growing, matrix: inLid ? lidM(shift) : moulded(mould, shift) });
    });
  }

  // ———— sutures and fontanelles: the membrane the gaps show, each its own thing ————
  const hideLid = 1 - sm(0.01, 0.1, lid);
  const sutSeen = domeShow * sm(0.6, 0.95, g) * hideLid;
  if (sutSeen > 0.01) {
    const headM = moulded(mould, [0, 0, 0]);
    const qk: Closing = { af: q2(k.af, STEP_C), pf: q2(k.pf, STEP_C), side: q2(k.side, STEP_C) };
    const width = gap * 1.5;
    const wq = Math.round(width * 2000) / 2000;
    const closed = 1 - 0.7 * clamp01(pose.sutureClose);
    for (const s of SUTURES) {
      const i = SUTURES.indexOf(s);
      const m = cachedMesh('skull-suture', [i, qk.af, qk.pf, qk.side, wq], () => sutureMesh(s, qk, wq, false));
      const h = cachedMesh('skull-suture-hit', [i, qk.af, qk.pf, qk.side, wq], () => sutureMesh(s, qk, wq * 1.4, true));
      put(`sut-${s.key}`, s.id, { mesh: m, hit: h }, SKULL_C.suture, SKULL_C.sutureDeep, { tissue: 'membrane', groups: s.groups, show: sutSeen * closed, matrix: headM, outline: false });
    }
    for (const f of FONTS) {
      const amount = f.which === 'af' ? qk.af : f.which === 'pf' ? qk.pf : qk.side;
      if (amount >= 0.97) continue;
      const i = FONTS.indexOf(f);
      const m = cachedMesh('skull-font', [i, qk.af, qk.pf, qk.side], () => fontMesh(f, qk, false));
      const h = cachedMesh('skull-font-hit', [i, qk.af, qk.pf, qk.side], () => fontMesh(f, qk, true));
      put(`font-${f.key}`, f.id, { mesh: m, hit: h }, SKULL_C.fontanelle, SKULL_C.sutureDeep, { tissue: 'membrane', groups: ['fontanelak'], show: sutSeen, matrix: headM, outline: false, thin: 0.4 });
    }
  }

  // ———— the base ————
  const carti = clamp01(pose.carti);
  if (carti > 0.003 && rest > 0.01) {
    const growing = carti < 0.999;
    const cartClip = (c: P2): Clip3 | undefined => (growing ? { o: [c[0], 1.5, c[1]], grow: { dir: [0, -1, 0], cos: Math.cos(carti * 1.35) } } : undefined);
    const bL = clamp01(pose.boneL), bR = clamp01(pose.boneR);
    if (bL < 0.999 || bR < 0.999) put('lamina', 'kondrokraneoa', G.lamina, SKULL_C.cartilage, SKULL_C.cartilageDeep, { tissue: 'cartilage', groups: ['neurokraneoa'], show: rest, clip: cartClip([0, 0]) });
    for (const b of BASE_CARTILAGES) {
      const done = b.kind === 'L' ? bL >= 0.999 : b.kind === 'R' ? bR >= 0.999 : bL >= 0.999 && bR >= 0.999;
      if (done) continue;
      const dark = b.kind === 'midDark';
      put(`c-${b.key}`, b.id, G.cart[b.key], dark ? SKULL_C.cartMid : SKULL_C.cartilage, dark ? SKULL_C.cartMidDeep : SKULL_C.cartilageDeep, { tissue: 'cartilage', groups: ['kondrokraneoa', 'neurokraneoa'], show: rest, clip: cartClip([0, 0]) });
    }
    const midAng = ((bL + bR) / 2) * Math.PI;
    const boneOut = (key: string, id: string, p: Pair | Parts, kind: BaseDef['kind'], centre: P2, reach: number) => {
      const v = kind === 'L' ? bL : kind === 'R' ? bR : (bL + bR) / 2;
      if (v <= 0.003) return;
      const y = baseY(centre[0], centre[1]) + 2;
      let clip: Clip3 | undefined;
      if (kind === 'mid' || kind === 'midDark') {
        if (v < 0.999) clip = { o: [0, y - 2, centre[1]], grow: { dir: [1, 0, 0], cos: Math.cos(midAng), spicules: 1 } };
      } else if (v < 0.999) clip = { o: [centre[0], y, centre[1]], grow: { dir: [0, -1, 0], cos: Math.cos(v * Math.atan(reach / 2)), spicules: 1 } };
      put(`b-${key}`, id, p, SKULL_C.bone, SKULL_C.boneDeep, { groups: ['kondrokraneoa', 'neurokraneoa'], show: rest, clip, outline: !clip });
    };
    for (const b of BASE_BONES) {
      const reach = b.spec.outer.reduce((m, p) => Math.max(m, Math.hypot(p[0] - b.centre[0], p[1] - b.centre[1])), 0);
      boneOut(b.key, b.id, G.bones[b.key], b.kind, b.centre, reach * 1.08);
    }
    boneOut('crista', 'etmoidesa', G.crista, 'mid', [0, 2.1], 1);
    boneOut('hyp', 'hipofisi-guruina', hypophysis, 'mid', [0, 0.62], 1);
    put('condyles', undefined, { m: merge([G.condyles.m, mirrorX(G.condyles.m)]), h: G.condyles.h }, SKULL_C.bone, SKULL_C.boneDeep, { quiet: true, ground: true, show: rest * Math.max(bL, bR) });
  }

  // ———— the face ————
  const fg = clamp01(pose.face);
  if (fg > 0.003) {
    const growing = fg < 0.999;
    const crest = clamp01(pose.faceOrigin);
    const shade = (arch: 'i' | 'ii' | 'iii' | null, base: string = SKULL_C.bone, baseD: string = SKULL_C.boneDeep): [string, string] => {
      const c0 = mixHex(base, SKULL_C.crest, crest), d0 = mixHex(baseD, SKULL_C.crestDeep, crest);
      if (!arch || tint <= 0) return [c0, d0];
      return [mixHex(c0, ARCH[arch], tint), mixHex(d0, ARCH_DEEP[arch], tint)];
    };
    const clipOf = (c: V3, off: V3, a: number): Clip3 | undefined => (growing ? { o: sub(c, off), grow: { dir: norm(off), cos: Math.cos(fg * a), spicules: 1 } } : undefined);
    const faceItem = (key: string, id: string, p: Pair | Parts, arch: 'i' | 'ii' | 'iii' | null, c: V3, off: V3, a: number, extra: Partial<Item3> = {}) => {
      const [cl, dp] = shade(arch);
      const clip = clipOf(c, off, a);
      put(key, id, p, cl, dp, { groups: ['errai-kraneoa'], clip, outline: !clip, ...extra });
    };
    for (const s of [1, -1]) {
      const side = s > 0 ? 'L' : 'R';
      const mir = (p: Pair): Pair => (s > 0 ? p : { m: mirrorCached(p.m), h: mirrorCached(p.h) });
      faceItem(`max${side}`, 'hezur-maxilarra', mir(G.maxilla), 'i', X(s, [0.62, -1.7, 2.3]), [0, 0, 1.4], 1.1);
      faceItem(`zyg${side}`, 'zigomatikoa', mir(G.zygomatic), 'i', X(s, [1.55, -1.3, 1.6]), [s * 1.2, 0, 0.3], 1.3);
      faceItem(`nas${side}`, 'hezur-nasala', mir(G.nasal), null, X(s, [0.16, -0.8, 3]), [0, 0, 1.2], 1.0, rest < 1 ? { show: rest } : {});
      if (pose.jaw > 0.01) faceItem(`man${side}`, 'baraila', mir(G.mandible), 'i', X(s, [1.2, -2.8, 1.6]), [0, -0.2, 1.6], 1.5, { show: pose.jaw });
      // The rest of the side of the skull that belongs with them.
      faceItem(`tpr${side}`, 'tenporalaren-ezkata', mir(G.tProcess), 'i', X(s, [2.15, -1.3, 0.5]), [s * 1.2, 0, 0], 1.3, { groups: [] });
      if (rest > 0.01) {
        put(`pty${side}`, undefined, mir(G.pterygoid), mixHex(SKULL_C.bone, '#8c7b63', 0.55), SKULL_C.floorDeep, { quiet: true, show: rest * fg, outline: false });
        put(`mas${side}`, 'harkaitza', mir(G.mastoid), SKULL_C.bone, SKULL_C.boneDeep, { groups: ['neurokraneoa'], show: rest * fg });
        put(`orb${side}`, undefined, ORBIT_CUP(s), SKULL_C.hollow, SKULL_C.hollowDeep, { quiet: true, ground: true, outline: false, show: rest });
        put(`tyr${side}`, undefined, ring(s), SKULL_C.bone, SKULL_C.boneDeep, { quiet: true, show: rest * fg });
        put(`mea${side}`, undefined, meatus(s), SKULL_C.hollow, SKULL_C.hollowDeep, { quiet: true, ground: true, outline: false, show: rest * fg });
      }
      const [stC, stD] = shade('ii');
      if (pose.jaw > 0.01) put(`sty${side}`, 'estiloide-apofisia', styloid(s), stC, stD, { show: pose.jaw * fg });
      const [lhC, lhD] = shade('ii');
      const [ghC, ghD] = shade('iii');
      if (pose.jaw > 0.01) {
        put(`hyl${side}`, 'hioide-adar-txikia', lesserHorn(s), lhC, lhD, { groups: ['hioide-hezurra'], show: pose.jaw * fg });
        put(`hyg${side}`, 'hioide-adar-nagusia', greaterHorn(s), ghC, ghD, { groups: ['hioide-hezurra'], show: pose.jaw * fg });
      }
    }
    if (rest > 0.01) put('nose', undefined, NOSE_HOLE, SKULL_C.hollow, SKULL_C.hollowDeep, { quiet: true, ground: true, outline: false, show: rest });
    if (pose.jaw > 0.01) {
      const [uC, uD] = shade('ii');
      const [lC, lD] = shade('iii');
      put('hyb1', 'hioide-gorputza', hyoidUpper, uC, uD, { groups: ['hioide-hezurra'], show: pose.jaw * fg });
      put('hyb2', 'hioide-gorputza', hyoidLower, lC, lD, { groups: ['hioide-hezurra'], show: pose.jaw * fg });
    }
  }

  // ———— names ————
  const pts: Record<string, V3> = { ...skullPoints(mould) };
  const onBase = (x: number, z: number, up = 0.2): V3 => [x, baseY(x, z) + up, z];
  Object.assign(pts, {
    neurokraneoa: pts['hezur-parietala'],
    'buru-ganga': pts['hezur-parietala'],
    mintza: pts['hezur-parietala'],
    'errai-kraneoa': [1.0, -1.72, 2.72] as V3,
    'hezur-maxilarra': [0.86, -1.82, 2.82] as V3,
    zigomatikoa: [1.74, -1.36, 1.84] as V3,
    'hezur-nasala': [0.17, -0.82, 3.2] as V3,
    baraila: [1.3, -2.9, 1.82] as V3,
    'estiloide-apofisia': [1.58, -2.65, 0.1] as V3,
    'hioide-gorputza': [0, -3.98, 1.82] as V3,
    'hioide-adar-txikia': [0.5, -3.74, 1.5] as V3,
    'hioide-adar-nagusia': [0.84, -3.98, 1.0] as V3,
    'hioide-hezurra': [0, -3.98, 1.82] as V3,
    harkaitza: bonesSeen(pose) ? onBase(1.2, -0.42, 0.55) : ([2.3, -1.9, -0.65] as V3),
    entzefaloa: [0.9, 1.3, 0.3] as V3,
    kondrokraneoa: onBase(0.9, 0.5, 0.15),
    'trenkada-kranialak': onBase(-0.12, 1.8, 0.2),
    'hipofisi-kartilagoak': onBase(-0.26, 0.62, 0.15),
    'kartilago-parakordalak': onBase(-0.22, -0.3, 0.16),
    'esklerotoma-okzipitalak': onBase(-0.72, -1.26, 0.15),
    'begizulo-hegoa': onBase(-1.1, 1.32, 0.15),
    'hego-tenporala': onBase(-1.3, 0.56, 0.15),
    'kapsula-periotikoa': onBase(-1.25, -0.46, 0.42),
    etmoidesa: onBase(0.2, 2.0, 0.22),
    'esfenoidesaren-gorputza': onBase(0.3, 0.62, 0.18),
    'esfenoidesaren-hego-txikia': onBase(1.0, 1.32, 0.2),
    'okzipitalaren-oinaldea': onBase(0.78, -1.3, 0.2),
    'hipofisi-guruina': onBase(0, 0.62, 0.15),
    'esfenoidesaren-hego-handia': bonesSeen(pose) ? onBase(1.3, 0.56, 0.2) : onHead(D(0.82, -0.17, 0.55), 0.02),
  });
  return { items, pts };
}

const bonesSeen = (p: SkullPose) => p.lid > 0.5;

const mirrored = new WeakMap<Mesh, Mesh>();
function mirrorCached(m: Mesh): Mesh {
  let r = mirrored.get(m);
  if (!r) {
    r = mirrorX(m);
    mirrored.set(m, r);
  }
  return r;
}

void SEQ_SIDE;
void shifted;
