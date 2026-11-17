import type { V3 } from '@/lib/three-d/math';
import { curve3, type Mesh } from '@/lib/three-d/mesh';
import { cachedBlob } from '@/lib/three-d/mesh-cache';
import { geoOf, geoSlot } from '@/lib/three-d/offthread';
import { mergeParts, vessel, type Parts } from '@/lib/three-d/organic';
import { capsule, ellipsoid, smin, surfaceMesh, type SDF } from '@/lib/three-d/sdf';
import { STREAM_ROUTE_N, type Item3 } from '@/lib/three-d/scene';
import { blobParts, mixHex, routeLength, vesselRouteOf } from '@/components/scenes/week10/model3d';
import { C19, G19 } from './tones';

/**
 * Topic 19, sections 3 (the meninges round the brain), 10 (thalamus), 11 (cortex), 12 (ventricles) and 13 (the
 * cerebrospinal fluid): the head cut down the middle, the right half seen from the left (the face on the viewer's
 * left, as the notes' sagittal figures). Skull, dura, arachnoid, the subarachnoid space with its fluid, the pia on the
 * brain; the brain cut through: hemisphere, thalamus (in the wall of the third ventricle), hypothalamus, epithalamus,
 * midbrain with its aqueduct, pons, cerebellum, medulla and the cord with its central canal. The ventricles are
 * hollow, filled with the fluid as a cast when shown; the choroid plexuses in their roofs; the fluid's way as moving
 * drops. Each part can wear its vesicle's colour (origins). Tied to the body at the thalamus (sites.ts `SITE19.head`).
 *
 * Space: x the body's LEFT, y cranial, z ventral; the thalamus at the origin; 3 units per body unit.
 */

export interface BrainPose {
  /** The meninges and the skull round the brain (0..1); the subarachnoid fluid (0..1). */
  men: number;
  csf: number;
  /** The brain parts in their vesicle's colours (0..1). */
  origin: number;
  /** The ventricles' cast (0..1); the brain's tissue turned to glass round it (0..1); the choroid plexuses (0..1). */
  vent: number;
  glass: number;
  plex: number;
  /** The fluid moving: how far (any number; it runs while it grows) and how much shows (0..1). */
  flow: number;
  flowShow: number;
  /** Signals: up to the thalamus and on to the cortex (0..1), the motor order down (0..1), smell straight to the cortex (0..1). */
  sens: number;
  motor: number;
  smell: number;
}
export const BR0: BrainPose = { men: 0, csf: 0, origin: 0, vent: 0, glass: 0, plex: 0, flow: 0, flowShow: 0, sens: 0, motor: 0, smell: 0 };

export interface BrainOpts {
  dim?: { ids: readonly string[]; k: number } | null;
}

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const L = (kps: readonly V3[], n = 24) => curve3(kps as V3[], n);
const smax = (a: number, b: number, k: number) => -smin(-a, -b, k);
/** The right half only: everything is cut at the midline (x = 0) and seen from the left. */
const half = (d: number, x: number) => Math.max(d, x);

// ———————————————————————— the ventricles (one cavity system) ————————————————————————

const LAT: V3[] = [[-0.3, 0.38, 0.72], [-0.28, 0.54, 0.25], [-0.28, 0.52, -0.38], [-0.34, 0.2, -0.82], [-0.42, -0.2, -0.62], [-0.46, -0.34, -0.15]];
const latF: SDF = (x, y, z) => {
  let d = Infinity;
  for (let i = 0; i + 1 < LAT.length; i++) d = smin(d, capsule(LAT[i], LAT[i + 1], i === 0 ? 0.1 : 0.12, i >= 3 ? 0.08 : 0.12)(x, y, z), 0.06);
  return d;
};
const MONRO: [V3, V3] = [[-0.27, 0.32, 0.38], [-0.02, 0.2, 0.32]];
const monroF = capsule(MONRO[0], MONRO[1], 0.05, 0.05);
const thirdF = ellipsoid([0, -0.02, 0.04], [0.065, 0.32, 0.44]);
const AQ: [V3, V3] = [[0, -0.24, -0.36], [0, -0.58, -0.52]];
const aqF = capsule(AQ[0], AQ[1], 0.045, 0.045);
const fourthF: SDF = (() => {
  const body = ellipsoid([0, -0.84, -0.7], [0.2, 0.3, 0.12]);
  const recess = capsule([0, -0.86, -0.7], [-0.32, -0.9, -0.66], 0.06, 0.04);
  return (x, y, z) => smin(body(x, y, z), recess(x, y, z), 0.05);
})();
const CANAL: [V3, V3] = [[0, -1.08, -0.66], [0, -3.05, -0.78]];
const canalF = capsule(CANAL[0], CANAL[1], 0.024, 0.024);
const ventF: SDF = (x, y, z) => Math.min(latF(x, y, z), monroF(x, y, z), thirdF(x, y, z), aqF(x, y, z), fourthF(x, y, z), canalF(x, y, z));

// ———————————————————————— the brain's parts ————————————————————————

const gyri = (x: number, y: number, z: number) => 0.018 * Math.sin(17 * x + 5 * z) * Math.sin(15 * y + 3 * x) * Math.sin(16 * z - 2 * y);
const dienRegion = ellipsoid([-0.1, -0.05, 0.0], [0.42, 0.4, 0.56]);
const cerebrumRaw = ellipsoid([-0.3, 0.36, 0.06], [0.62, 0.82, 1.24]);
const thalF = ellipsoid([-0.17, 0.02, -0.05], [0.24, 0.24, 0.38]);
const hypoF = ellipsoid([-0.05, -0.3, 0.28], [0.15, 0.15, 0.22]);
const epiF = ellipsoid([-0.03, 0.15, -0.5], [0.07, 0.07, 0.08]);
const midF = capsule([0, -0.16, -0.32], [0, -0.6, -0.5], 0.25, 0.24);
const ponsF = ellipsoid([0, -0.84, -0.36], [0.34, 0.28, 0.3]);
const medF = capsule([0, -1.02, -0.56], [0, -1.6, -0.7], 0.21, 0.17);
const cordF = capsule([0, -1.6, -0.7], [0, -3.1, -0.78], 0.17, 0.16);
const cblF = ellipsoid([-0.42, -0.8, -1.02], [0.52, 0.4, 0.42]);
const carve = (d: number, x: number, y: number, z: number) => (d > 0.15 ? d : smax(d, -ventF(x, y, z), 0.015));
const PARTS: Record<string, { f: SDF; lo: V3; hi: V3 }> = {
  cerebrum: {
    f: (x, y, z) => {
      let d = smax(cerebrumRaw(x, y, z), -(dienRegion(x, y, z) - 0.03), 0.06);
      if (d < 0.06) d += gyri(x, y, z);
      return half(carve(d, x, y, z), x);
    },
    lo: [-0.95, -0.5, -1.2], hi: [0.02, 1.2, 1.32],
  },
  thal: { f: (x, y, z) => half(carve(thalF(x, y, z), x, y, z), x), lo: [-0.45, -0.25, -0.46], hi: [0.02, 0.28, 0.36] },
  hypo: { f: (x, y, z) => half(carve(hypoF(x, y, z), x, y, z), x), lo: [-0.22, -0.48, 0.04], hi: [0.02, -0.12, 0.52] },
  epi: { f: (x, y, z) => half(epiF(x, y, z), x), lo: [-0.12, 0.06, -0.6], hi: [0.02, 0.24, -0.4] },
  mid: { f: (x, y, z) => half(carve(midF(x, y, z), x, y, z), x), lo: [-0.3, -0.88, -0.78], hi: [0.02, 0.12, -0.04] },
  pons: { f: (x, y, z) => half(carve(ponsF(x, y, z), x, y, z), x), lo: [-0.38, -1.14, -0.7], hi: [0.02, -0.54, -0.04] },
  med: { f: (x, y, z) => half(carve(medF(x, y, z), x, y, z), x), lo: [-0.24, -1.82, -0.94], hi: [0.02, -0.8, -0.32] },
  cord: { f: (x, y, z) => half(carve(cordF(x, y, z), x, y, z), x), lo: [-0.2, -3.12, -0.98], hi: [0.02, -1.5, -0.5] },
  cbl: {
    f: (x, y, z) => {
      let d = smax(cblF(x, y, z), -(fourthF(x, y, z) + 0.02), 0.03);
      if (d < 0.05) d += 0.012 * Math.sin(48 * y + 9 * z);
      return half(d, x);
    },
    lo: [-0.96, -1.22, -1.46], hi: [0.02, -0.38, -0.56],
  },
};
/** The whole brain, smoothed: the meninges and the skull are shells at given distances from it. */
const brainU: SDF = (x, y, z) => {
  let d = smin(cerebrumRaw(x, y, z), cblF(x, y, z), 0.15);
  d = smin(d, ponsF(x, y, z), 0.12);
  d = smin(d, medF(x, y, z), 0.1);
  d = smin(d, cordF(x, y, z), 0.08);
  d = smin(d, midF(x, y, z), 0.1);
  return d;
};
const shell = (a: number, b: number, yMin = -9): SDF => (x, y, z) => half(Math.max(a - brainU(x, y, z), brainU(x, y, z) - b, yMin - y), x);
const SHELLS: Record<string, { f: SDF; step: number }> = {
  pia: { f: shell(0.0, 0.04), step: 0.04 },
  sub: { f: shell(0.04, 0.13), step: 0.055 },
  arach: { f: shell(0.13, 0.17), step: 0.04 },
  dura: { f: shell(0.17, 0.25), step: 0.05 },
  skull: { f: shell(0.25, 0.47, -1.05), step: 0.065 },
  scalp: { f: shell(0.47, 0.56, -0.95), step: 0.07 },
};
const SHELL_BOX: [V3, V3] = [[-1.5, -3.2, -2.0], [0.02, 1.75, 1.85]];

/** The ventricles' casts, slightly inside their cavities: one per cavity, so each can be lit and named. */
const cast = (f: SDF): SDF => (x, y, z) => half(f(x, y, z) + 0.008, x + 0.004);
const CASTS: Record<string, { f: SDF; lo: V3; hi: V3 }> = {
  lat: { f: cast((x, y, z) => Math.min(latF(x, y, z), monroF(x, y, z))), lo: [-0.62, -0.5, -1.0], hi: [0.02, 0.72, 0.9] },
  third: { f: cast(thirdF), lo: [-0.1, -0.4, -0.45], hi: [0.02, 0.35, 0.52] },
  aq: { f: cast(aqF), lo: [-0.08, -0.66, -0.6], hi: [0.02, -0.16, -0.28] },
  fourth: { f: cast(fourthF), lo: [-0.42, -1.18, -0.86], hi: [0.02, -0.52, -0.54] },
  canal: { f: cast(canalF), lo: [-0.05, -3.1, -0.82], hi: [0.02, -1.0, -0.6] },
};

function buildGeo() {
  const m = (f: SDF, lo: V3, hi: V3, s: number) => ({ m: surfaceMesh(f, lo, hi, s), h: surfaceMesh(f, lo, hi, s * 2.6) });
  const parts: Record<string, { m: Mesh; h: Mesh }> = {};
  for (const [k, p] of Object.entries(PARTS)) parts[k] = m(p.f, p.lo, p.hi, 0.028);
  const shells: Record<string, { m: Mesh; h: Mesh }> = {};
  for (const [k, s] of Object.entries(SHELLS)) shells[k] = m(s.f, SHELL_BOX[0], SHELL_BOX[1], s.step);
  const casts: Record<string, { m: Mesh; h: Mesh }> = {};
  // The thin ones (aqueduct, canal) keep a fine grid, or they fall through it.
  for (const [k, c] of Object.entries(CASTS)) casts[k] = m(c.f, c.lo, c.hi, k === 'aq' || k === 'canal' ? 0.012 : 0.02);
  return { parts, shells, casts };
}
/** Built once (off the main thread in the browser; the scenes wait with `useGeoReady`). */
export const BRAIN19_GEO = geoSlot('brain19', buildGeo);

// ———————————————————————— paths ————————————————————————

const THAL_PT: V3 = [-0.17, 0.02, -0.05];
const SENS_CX: V3 = [-0.18, 1.08, -0.22];
const MOTOR_CX: V3 = [-0.18, 1.1, 0.06];
/** Sensory: up the cord and the brainstem to the thalamus (synapse), then on to the sensory cortex. */
export const SENS_UP: V3[] = L([[-0.1, -3.0, -0.72], [-0.1, -2.0, -0.7], [-0.1, -1.3, -0.62], [-0.12, -0.8, -0.44], [-0.14, -0.4, -0.3], THAL_PT], 60);
export const SENS_CX_PATH: V3[] = L([THAL_PT, [-0.2, 0.4, -0.14], [-0.2, 0.8, -0.2], SENS_CX], 30);
/** Motor: from the motor cortex down through the brainstem into the cord. */
export const MOTOR_DOWN: V3[] = L([MOTOR_CX, [-0.2, 0.7, 0.08], [-0.2, 0.25, 0.02], [-0.12, -0.3, -0.22], [-0.1, -0.85, -0.4], [-0.08, -1.4, -0.6], [-0.08, -2.2, -0.72], [-0.08, -3.0, -0.75]], 70);
/** Smell: from the nose's olfactory bulb under the frontal lobe straight to the cortex, past the thalamus. */
const SMELL: V3[] = L([[-0.12, -0.42, 1.1], [-0.14, -0.38, 0.7], [-0.2, -0.24, 0.42], [-0.26, 0.2, 0.36], [-0.24, 0.62, 0.42]], 30);

/** The fluid's way: lateral ventricle → Monro → third → aqueduct → fourth → out through the apertures, round the brain in the subarachnoid space, up to the top. */
const FLOW_IN: V3[] = [LAT[4], LAT[3], LAT[2], LAT[1], [-0.28, 0.46, 0.4], MONRO[0], MONRO[1], [0, 0.12, 0.16], [0, -0.1, -0.12], [0, -0.22, -0.34], AQ[0], AQ[1], [0, -0.74, -0.66], [0, -0.92, -0.72], [0, -1.06, -0.86], [-0.02, -1.24, -1.08]];
const FLOW_OUT: V3[] = [[-0.02, -1.24, -1.08], [-0.1, -1.18, -1.48], [-0.12, -0.6, -1.56], [-0.12, 0.2, -1.42], [-0.12, 0.9, -0.95], [-0.08, 1.24, -0.2], [-0.06, 1.24, 0.4]];
const FLOW_CANAL: V3[] = [[0, -0.92, -0.72], [0, -1.2, -0.68], [0, -2.0, -0.73], [0, -2.9, -0.77]];
const FLOW_LUSCHKA: V3[] = [[0, -0.86, -0.7], [-0.32, -0.9, -0.66], [-0.5, -0.98, -0.5], [-0.62, -0.62, -0.32]];

const cellsOf = (n: number, jit: number) => {
  const cells = new Float32Array(n * 4);
  const gates = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    cells.set([i / n, Math.sin(i * 12.9) * jit, Math.cos(i * 7.3) * jit * 0.6, Math.sin(i * 3.1) * jit], i * 4);
    gates[i] = ((i * 0.618034) % 1) * 0.85;
  }
  return { cells, gates };
};
const DROPS = cellsOf(18, 0.02);
void STREAM_ROUTE_N;

export function brainModel(pose: BrainPose, o: BrainOpts = {}) {
  const G = geoOf(BRAIN19_GEO);
  const items: Item3[] = [];
  const pts: Record<string, V3> = {};
  const dim = o.dim && o.dim.k > 0.001 ? o.dim : null;
  const k = dim ? dim.k : 0;
  const lit = (id: string | undefined, groups?: readonly string[]) => !dim || (!!id && dim.ids.includes(id)) || (groups ?? []).some((g) => dim.ids.includes(g));
  const put = (key: string, id: string | undefined, parts: Parts | null, color: string, deep: string, extra: Partial<Item3> = {}) => {
    if (!parts || (extra.opacity ?? 1) <= 0.01) return;
    const off = !!dim && !!id && !extra.ground && !lit(id, extra.groups);
    items.push({ key, id, ...parts, color: off ? mixHex(color, '#c4bcbb', 0.45 * k) : color, deep: off ? mixHex(deep, '#7c7472', 0.45 * k) : deep, tissue: 'neural', ...extra });
  };
  const P = (g: { m: Mesh; h: Mesh }): Parts => ({ mesh: g.m, hit: g.h });
  const origin = clamp01(pose.origin), glass = clamp01(pose.glass);
  const tone = (adult: string, vesicle: string) => mixHex(adult, vesicle, origin);
  const brainOp = 1 - 0.6 * glass;
  const B = C19.brain, BD = C19.brainDeep;
  const ENC = ['entzefaloa', 'nerbio-sistema-zentrala'];

  // ———— the brain, cut down the middle ————
  put('cerebrum', 'garun-hemisferioak', P(G.parts.cerebrum), tone(B, C19.tel), BD, { groups: ['telentzefaloa', ...ENC], opacity: brainOp, calm: true });
  put('thal', 'talamoa', P(G.parts.thal), tone(mixHex(B, '#c99a90', 0.35), C19.dien), BD, { groups: ['dientzefaloa', ...ENC], opacity: brainOp });
  put('hypo', 'hipotalamoa', P(G.parts.hypo), tone(mixHex(B, '#d6a092', 0.4), C19.dien), BD, { groups: ['dientzefaloa', ...ENC], opacity: brainOp });
  put('epi', 'epitalamoa', P(G.parts.epi), tone(mixHex(B, '#b98a80', 0.4), C19.dien), BD, { groups: ['dientzefaloa', ...ENC], opacity: brainOp });
  put('mid', 'mesentzefaloa', P(G.parts.mid), tone(mixHex(B, '#c9a094', 0.3), C19.mes), BD, { groups: ['entzefalo-enborra', ...ENC], opacity: brainOp });
  put('pons', 'zubia', P(G.parts.pons), tone(mixHex(B, '#d2a898', 0.3), C19.met), BD, { groups: ['metentzefaloa', 'entzefalo-enborra', ...ENC], opacity: brainOp });
  put('cbl', 'garuntxoa', P(G.parts.cbl), tone(mixHex(B, '#d99a8c', 0.4), C19.met), BD, { groups: ['metentzefaloa', ...ENC], opacity: brainOp });
  put('med', 'erraboila', P(G.parts.med), tone(mixHex(B, '#c99a90', 0.3), C19.miel), BD, { groups: ['mielentzefaloa', 'entzefalo-enborra', ...ENC], opacity: brainOp });
  put('cord', 'ornomuina', P(G.parts.cord), B, BD, { groups: ['nerbio-sistema-zentrala', 'hodi-ependimarioa'], opacity: brainOp });
  pts['garun-hemisferioak'] = [0, 0.86, 0.5];
  pts['talamoa'] = [-0.07, 0.02, -0.05];
  pts['hipotalamoa'] = [0, -0.3, 0.32];
  pts['epitalamoa'] = [0, 0.16, -0.5];
  pts['mesentzefaloa'] = [0, -0.36, -0.28];
  pts['zubia'] = [0, -0.84, -0.18];
  pts['garuntxoa'] = [0, -0.8, -1.2];
  pts['erraboila'] = [0, -1.3, -0.52];
  pts['ornomuina'] = [0, -2.4, -0.62];
  pts['entzefaloa'] = [0, 0.5, -0.7];
  pts['entzefalo-enborra'] = [0, -0.84, -0.18];
  pts['dientzefaloa'] = [-0.07, 0.02, -0.05];
  pts['telentzefaloa'] = [0, 0.86, 0.5];
  pts['metentzefaloa'] = [0, -0.8, -1.2];
  pts['mielentzefaloa'] = [0, -1.3, -0.52];

  // ———— the ventricles ————
  const vent = clamp01(pose.vent);
  if (vent > 0.01) {
    const VG = ['bentrikulu-sistema', 'likido-zefalorrakideoa'];
    const castItem = (k: string, id: string, extra: string[] = []) => put(`cast-${k}`, id, P(G.casts[k]), C19.csf, C19.csfDeep, { groups: [...VG, ...extra], opacity: vent, tissue: 'membrane', calm: true });
    castItem('lat', 'alboko-bentrikuluak', ['monro-zuloak']);
    castItem('third', 'hirugarren-bentrikulua');
    castItem('aq', 'garun-akueduktoa');
    castItem('fourth', 'laugarren-bentrikulua', ['luschka-zuloak', 'magendie-zuloa']);
    castItem('canal', 'hodi-ependimarioa');
    pts['alboko-bentrikuluak'] = [-0.28, 0.54, 0.0];
    pts['monro-zuloak'] = [-0.12, 0.26, 0.35];
    pts['hirugarren-bentrikulua'] = [0, -0.06, 0.18];
    pts['garun-akueduktoa'] = [0, -0.42, -0.45];
    pts['laugarren-bentrikulua'] = [0, -0.84, -0.72];
    // On the recess where the cut shows it (the aperture itself lies on the far, lateral side).
    pts['luschka-zuloak'] = [-0.1, -0.87, -0.69];
    pts['magendie-zuloa'] = [0, -1.04, -0.84];
    pts['hodi-ependimarioa'] = [0, -2.0, -0.73];
    pts['bentrikulu-sistema'] = [0, -0.06, 0.18];
    // The apertures: small glowing rings where the fluid leaves.
    const ring = (key: string, id: string, c: V3, r: number) => put(key, id, blobParts({ center: c, radii: [r, r, r], rings: 8, sides: 10 }), '#ffffff', C19.csfDeep, { opacity: 0.9 * vent, tissue: 'membrane' });
    ring('luschka', 'luschka-zuloak', [-0.34, -0.9, -0.66], 0.045);
    ring('magendie', 'magendie-zuloa', [0, -1.04, -0.84], 0.045);
    ring('monro', 'monro-zuloak', [-0.14, 0.26, 0.35], 0.04);
  }
  // ———— the choroid plexuses, in the roofs ————
  const plex = clamp01(pose.plex);
  if (plex > 0.01) {
    const tuft = (c: V3, n: number, r: number): (Parts | null)[] => Array.from({ length: n }, (_, i) => blobParts({ center: [c[0] + 0.02 * Math.sin(i * 2.1), c[1] + 0.03 * Math.cos(i * 1.7), c[2] + (i - n / 2) * r * 1.1], radii: [r, r * 0.8, r], rings: 6, sides: 8 }));
    const all = mergeParts([...tuft([-0.28, 0.46, -0.1], 7, 0.04), ...tuft([0, 0.22, -0.05], 5, 0.035), ...tuft([0, -0.98, -0.78], 4, 0.035)]);
    put('plex', 'sare-koroideak', all, '#e0607a', '#6e1a2c', { opacity: plex, tissue: 'vessel' });
    pts['sare-koroideak'] = [-0.28, 0.46, -0.1];
  }

  // ———— the meninges, the fluid, the skull ————
  const men = clamp01(pose.men), csf = clamp01(pose.csf);
  if (men > 0.01) {
    const MEN = ['meningeak'];
    put('pia', 'pia-materra', P(G.shells.pia), C19.pia, C19.piaDeep, { groups: MEN, opacity: 0.9 * men, tissue: 'membrane' });
    put('sub', 'eremu-azpiaraknoideoa', P(G.shells.sub), C19.csf, C19.csfDeep, { groups: ['likido-zefalorrakideoa'], opacity: 0.45 * csf * men, tissue: 'membrane', outline: false });
    put('arach', 'araknoidesa', P(G.shells.arach), C19.arach, C19.arachDeep, { groups: MEN, opacity: men, tissue: 'membrane' });
    put('dura', 'dura-materra', P(G.shells.dura), C19.dura, C19.duraDeep, { groups: MEN, opacity: men, tissue: 'membrane' });
    put('skull', 'neurokraneoa', P(G.shells.skull), G19.bone, G19.boneDeep, { opacity: men, tissue: 'bone', calm: true });
    put('scalp', undefined, P(G.shells.scalp), C19.skin, mixHex(C19.skin, '#5a3a2a', 0.5), { opacity: men, tissue: 'skin', ground: true, quiet: true, calm: true });
    pts['pia-materra'] = [0, 1.19, 0.12];
    pts['eremu-azpiaraknoideoa'] = [0, 1.25, -0.5];
    pts['likido-zefalorrakideoa'] = [0, 1.25, -0.5];
    pts['araknoidesa'] = [0, 1.31, -0.1];
    pts['dura-materra'] = [0, 1.36, 0.3];
    pts['neurokraneoa'] = [0, 1.5, 0.6];
    pts['meningeak'] = [0, 1.31, -0.1];
  }

  // ———— the fluid's way ————
  const fs = clamp01(pose.flowShow);
  if (fs > 0.01) {
    const drop = cachedBlob({ center: [0, 0, 0], radii: [0.035, 0.035, 0.035], rings: 6, sides: 8 });
    const add = (key: string, line: V3[], speed: number) => {
      const route = vesselRouteOf(L(line, 60));
      items.push({ key: `flow-${key}`, id: 'likido-zefalorrakideoa', mesh: drop, color: '#bfe8ff', deep: C19.csfDeep, tissue: 'skin', stream: { route, phase: (pose.flow * speed) / routeLength(route), grow: fs, ...DROPS } });
    };
    add('in', FLOW_IN, 1.6);
    add('out', FLOW_OUT, 1.6);
    add('canal', FLOW_CANAL, 1.0);
    add('luschka', FLOW_LUSCHKA, 1.2);
  }

  // ———— signals ————
  const sig = (key: string, id: string, line: V3[], g: number, color: string, deep: string) => {
    if (g <= 0.001) return;
    put(key, id, vessel(line, { r0: 0.03, r1: 0.03, bulb: 0.9, bulbLen: 0.08, sides: 10, n: line.length }, g), color, deep, { tissue: 'nerve' });
  };
  const sens = clamp01(pose.sens);
  sig('sens-up', 'neurona-sentsitiboa', SENS_UP, Math.min(1, sens * 2), C19.sens, C19.sensDeep);
  sig('sens-cx', 'neurona-sentsitiboa', SENS_CX_PATH, clamp01(sens * 2 - 1), C19.sens, C19.sensDeep);
  sig('motor', 'motoneurona', MOTOR_DOWN, clamp01(pose.motor), C19.motor, C19.motorDeep);
  sig('smell', 'usaimen-nerbioa', SMELL, clamp01(pose.smell), '#b48cf0', '#4a2f80');
  if (sens > 0.001 || pose.motor > 0.001) {
    put('cx-s', 'kortex-sentsitiboa', blobParts({ center: SENS_CX, radii: [0.06, 0.08, 0.14], rings: 10, sides: 12 }), C19.sens, C19.sensDeep, { opacity: clamp01(sens * 2 - 1) });
    put('cx-m', 'kortex-motorra', blobParts({ center: MOTOR_CX, radii: [0.06, 0.08, 0.14], rings: 10, sides: 12 }), C19.motor, C19.motorDeep, { opacity: Math.max(clamp01(pose.motor * 3), clamp01(sens * 2 - 1.4)) });
    pts['kortex-sentsitiboa'] = [0, SENS_CX[1], SENS_CX[2]];
    pts['kortex-motorra'] = [0, MOTOR_CX[1], MOTOR_CX[2]];
    pts['neurona-sentsitiboa'] = [0, -1.3, -0.62];
    pts['motoneurona'] = [0, -1.9, -0.7];
  }
  if (pose.smell > 0.001) pts['usaimen-nerbioa'] = [0, -0.38, 0.72];
  return { items, pts };
}
void G19;
