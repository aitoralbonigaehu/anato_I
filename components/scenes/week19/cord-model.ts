import type { V3 } from '@/lib/three-d/math';
import { curve3 } from '@/lib/three-d/mesh';
import { cachedMesh } from '@/lib/three-d/mesh-cache';
import { mergeParts, vessel, type Parts } from '@/lib/three-d/organic';
import { capsule, ellipsoid, smin } from '@/lib/three-d/sdf';
import { extrudeProfile, type F2 } from '@/lib/three-d/profile';
import type { Item3 } from '@/lib/three-d/scene';
import { blobParts, mixHex } from '@/components/scenes/week10/model3d';
import { C19, G19 } from './tones';

/**
 * Topic 19, sections 2 (roots and ganglion), 3 (meninges, grey and white matter) and 5 (the reflex arc): a block of
 * the spinal cord at T6 (sites.ts `SITE19.cord`: its central canal on the body's cord, 11 block units per body unit).
 * The cord is cut at both ends: on the cranial cut face the grey H (anterior horns motor, posterior horns sensory,
 * lateral horns from T1 to L2) in the white matter with its tracts; the central canal (ependyma) in the middle. Out of
 * each side the rootlets gather into the posterior root (with the spinal ganglion) and the anterior root, which join
 * into the spinal nerve, then its two rami. Round it the three meninges, each a little shorter than the one inside
 * (so all three show at the cranial end), the subarachnoid space with its fluid, the dura free of the bone (the
 * epidural space). The neurons of the reflex arc are drawn on the cranial cut face.
 *
 * Frame 'block': x the body's LEFT, y dorsal, z cranial. The central canal at the origin; the cord's radius ≈ 1.
 */

export interface CordPose {
  /** Rootlets, roots, ganglion and nerve grown (0..1); the two rami (0..1). */
  roots: number;
  rami: number;
  /** The meninges, outermost first as the notes list them (0..1 each); the fluid; the vertebral canal round them. */
  dura: number;
  arach: number;
  pia: number;
  csf: number;
  bone: number;
  /** The horns tinted by function (0..1); the lateral horns (0..1); the tracts in the white matter (0..1). */
  fn: number;
  lat: number;
  tracts: number;
  /** The reflex arc: sensory neuron (0..1), interneuron (0..1), motor neuron (0..1). */
  sens: number;
  inter: number;
  motor: number;
  /** The skin and the muscle at the two ends of the arc shown (0..1). */
  ends?: number;
  /**
   * The sympathetic way (topic 20, 3.1), on the left side: the chain beside the vertebral body with its paravertebral
   * ganglion, the white and grey communicating rami, the splanchnic nerve to a prevertebral ganglion on the aorta and
   * an organ (`symp` 0..1). The two neurons: the preganglionic axon from the lateral horn out through the anterior
   * root and the white ramus into the chain (`pre` 0..1); after a synapse there, the postganglionic axon back through
   * the grey ramus into the nerve (`post` 0..1); or on through the chain without a synapse, down the splanchnic nerve
   * to the prevertebral ganglion, and from there the postganglionic one to the organ (`splanch` 0..1: 0-0.6 the
   * first, 0.6-1 the second).
   */
  symp?: number;
  pre?: number;
  post?: number;
  splanch?: number;
}
export const CP0: CordPose = { roots: 1, rami: 1, dura: 0, arach: 0, pia: 0, csf: 0, bone: 0, fn: 0, lat: 0, tracts: 0, sens: 0, inter: 0, motor: 0, ends: 0, symp: 0, pre: 0, post: 0, splanch: 0 };

export interface CordOpts {
  dim?: { ids: readonly string[]; k: number } | null;
}

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const L = (kps: readonly V3[], n = 24) => curve3(kps as V3[], n);
const X = (s: number, p: V3): V3 => [s * p[0], p[1], p[2]];
const smax = (a: number, b: number, k: number) => -smin(-a, -b, k);
/** The ganglion swells once the roots are most of the way out. */
const gk = (roots: number) => Math.min(1, (roots - 0.6) / 0.3);

/** Half the block's length: the cut faces at z = ±LEN. */
export const LEN = 1.6;
/** The roots leave at this level, near the cranial face, so the arc on the face meets them. */
const RZ = 0.95;

// ———————————————————————— the cord in section ————————————————————————

const RX = 1.05, RY = 0.88;
/** White matter's outline: an oval with the anterior median fissure (deep) and the posterior median sulcus. */
const whiteD2 = (x: number, y: number) => {
  const e = (Math.hypot(x / RX, y / RY) - 1) * Math.min(RX, RY);
  // The fissure from the ventral surface up to y −0.42; the sulcus from the dorsal surface down to y 0.6.
  const fissure = Math.max(Math.abs(x) - 0.045, y + 0.42);
  const sulcus = Math.max(Math.abs(x) - 0.018, 0.6 - y);
  return Math.max(e, -fissure, -sulcus);
};
/** The grey H: central bar, broad anterior horns, slender posterior horns; the lateral horns when `lat`. */
const hCap = (ax: number, ay: number, bx: number, by: number, ra: number, rb: number) => {
  const dx = bx - ax, dy = by - ay;
  const l2 = dx * dx + dy * dy;
  return (x: number, y: number) => {
    const h = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / l2));
    return Math.hypot(x - ax - dx * h, y - ay - dy * h) - (ra + (rb - ra) * h);
  };
};
const bar = hCap(-0.22, -0.02, 0.22, -0.02, 0.12, 0.12);
const post = hCap(0.16, 0.04, 0.44, 0.76, 0.1, 0.055);
const ant = (x: number, y: number) => (Math.hypot((x - 0.36) / 0.3, (y + 0.36) / 0.3) - 1) * 0.3;
const latH = hCap(0.38, -0.02, 0.62, 0.0, 0.075, 0.05);
const greyD2 = (withLat: boolean) => (x: number, y: number) => {
  const ax = Math.abs(x);
  let d = Math.min(bar(x, y), post(ax, y), ant(ax, y));
  if (withLat) d = Math.min(d, latH(ax, y));
  d = Math.max(d, -(Math.hypot(x, y + 0.02) - 0.055));
  return d;
};
/** Regions of the H for the function tint: posterior horn (sensory), anterior horn (motor), lateral horn. */
const WHITE = (): Parts => {
  const m = cachedMesh('cord19-white-x', [LEN], () => extrudeProfile(whiteD2, [-1.12, -0.95], [1.12, 0.95], 0.008, -LEN, LEN));
  return { mesh: m, hit: m };
};
/** Split the grey matter before triangulating so the colours follow each region on the cut face. */
const greyParts = new Map<string, { post: Parts; ant: Parts; mid: Parts }>();
function greyByFn(lat: boolean) {
  const key = lat ? 'L' : '';
  let g = greyParts.get(key);
  if (!g) {
    const grey = greyD2(lat);
    const posterior: F2 = (_, y) => 0.12 - y;
    const anterior: F2 = (x, y) => Math.max(y + 0.1, Math.abs(x) - (lat ? 0.6 : 0.7));
    const part = (region: F2): Parts => {
      const field: F2 = (x, y) => Math.max(grey(x, y), region(x, y));
      const mesh = extrudeProfile(field, [-0.75, -0.72], [0.75, 0.85], 0.006, -LEN - 0.012, LEN + 0.012);
      return { mesh, hit: mesh };
    };
    g = { post: part(posterior), ant: part(anterior), mid: part((x, y) => -Math.min(posterior(x, y), anterior(x, y))) };
    greyParts.set(key, g);
  }
  return g;
}

/** A sleeve round the cord (a meninx): an oval ring of thickness `th`, from z0 to z1. */
const sleeve = (key: string, rx: number, ry: number, th: number, z0: number, z1: number): Parts => {
  const d2 = (x: number, y: number) => {
    const o = (Math.hypot(x / rx, y / ry) - 1) * Math.min(rx, ry);
    return Math.max(o, -(o + th));
  };
  const m = cachedMesh(`cord19-${key}-x`, [rx, ry, th, z0, z1], () => extrudeProfile(d2, [-rx - 0.02, -ry - 0.02], [rx + 0.02, ry + 0.02], Math.min(0.01, th / 4), z0, z1));
  return { mesh: m, hit: m };
};
const PIA = () => sleeve('pia', RX + 0.035, RY + 0.035, 0.03, -LEN, LEN - 0.04);
const ARACH = () => sleeve('arach', 1.5, 1.32, 0.035, -LEN, 0.85);
const DURA = () => sleeve('dura', 1.72, 1.52, 0.08, -LEN, 0.15);
/** The fluid between the arachnoid and the pia: a translucent fill. */
const CSF = () => sleeve('csf', 1.465, 1.29, 0.39, -LEN, 0.85);
const EPI = () => sleeve('epi', 2.1, 1.82, 0.32, -LEN, -0.55);
/** The vertebral canal behind and round: an arch of bone (the vertebra's body in front, the laminae behind). */
const BONE = (): Parts => {
  const d2 = (x: number, y: number) => {
    const o = (Math.hypot(x / 2.7, (y + 0.1) / 2.35) - 1) * 2.35;
    const i = (Math.hypot(x / 2.15, (y + 0.05) / 1.85) - 1) * 1.85;
    return Math.max(o, -i);
  };
  const m = cachedMesh('cord19-bone-x', [LEN], () => extrudeProfile(d2, [-2.75, -2.5], [2.75, 2.3], 0.012, -LEN, -0.55));
  return { mesh: m, hit: m };
};

// ———————————————————————— roots, ganglion, nerve, rami (left; the right mirrors) ————————————————————————

const GANG: V3 = [2.15, 0.62, RZ];
const JOIN: V3 = [2.85, 0.12, RZ];
const NERVE_END: V3 = [3.4, 0.0, RZ];
const POST_ROOT: V3[] = [[1.35, 0.78, RZ], [1.8, 0.72, RZ], GANG];
const ANT_ROOT: V3[] = [[1.4, -0.52, RZ], [2.1, -0.3, RZ], JOIN];
const DORSAL_RAMUS: V3[] = [NERVE_END, [3.75, 0.7, RZ], [3.7, 1.6, RZ], [3.45, 2.3, RZ]];
const VENTRAL_RAMUS: V3[] = [NERVE_END, [4.3, -0.55, RZ], [5.1, -1.2, RZ], [5.8, -1.6, RZ]];
const SKIN: V3 = [5.95, -1.0, RZ];
const MUSCLE: V3 = [5.6, -2.35, RZ];
/** Rootlets: a fan from the cord's surface (posterolateral and anterolateral sulci) into each root. */
const rootlets = (kind: 'post' | 'ant'): V3[][] => {
  const out: V3[][] = [];
  const zs = [-0.28, -0.12, 0.04, 0.2, 0.34];
  for (const dz of zs) {
    const s: V3 = kind === 'post' ? [0.64, 0.66, RZ + dz] : [0.78, -0.56, RZ + dz];
    const e = kind === 'post' ? POST_ROOT[0] : ANT_ROOT[0];
    out.push(L([s, [(s[0] + e[0]) / 2 + 0.05, (s[1] + e[1]) / 2 + (kind === 'post' ? 0.06 : -0.04), RZ + dz * 0.5], e], 8));
  }
  return out;
};

// ———————————————————————— the reflex arc, on the cranial cut face ————————————————————————

const FZ = LEN + 0.03;
const SOMA_S: V3 = [GANG[0] + 0.02, GANG[1] + 0.02, RZ + 0.06];
const SOMA_I: V3 = [0.34, 0.12, FZ];
const SOMA_M: V3 = [0.4, -0.38, FZ];
/** Sensory: receptor in the skin → ventral ramus → nerve → posterior root → its soma in the ganglion → into the posterior horn. */
export const ARC_SENS: V3[] = L([SKIN, [5.1, -1.05, RZ + 0.05], [4.3, -0.48, RZ + 0.05], [3.3, 0.06, RZ + 0.05], JOIN, [2.5, 0.45, RZ + 0.06], SOMA_S, [1.6, 0.8, RZ + 0.06], [0.75, 0.74, RZ + 0.25], [0.6, 0.62, FZ], [0.42, 0.42, FZ], SOMA_I], 90);
/** Interneuron: posterior horn → anterior horn. */
export const ARC_INTER: V3[] = L([SOMA_I, [0.36, -0.08, FZ], SOMA_M], 20);
/** Motor: soma in the anterior horn → anterior root → nerve → ventral ramus → muscle. */
export const ARC_MOTOR: V3[] = L([SOMA_M, [0.7, -0.5, FZ], [0.85, -0.55, RZ + 0.25], [1.4, -0.5, RZ - 0.05], [2.1, -0.3, RZ - 0.05], [2.85, 0.06, RZ - 0.05], [3.4, -0.05, RZ - 0.05], [4.3, -0.62, RZ - 0.05], [5.0, -1.3, RZ - 0.05], [5.45, -2.05, RZ - 0.02]], 90);

// ———————————————————————— the sympathetic way (topic 20, 3.1): left side only ————————————————————————

/** The chain runs cranio-caudally beside the vertebral body; its ganglion at the nerve's level. */
const CHAIN_X = 3.05, CHAIN_Y = -1.9;
const CHAIN_G: V3 = [CHAIN_X, CHAIN_Y, RZ];
const CHAIN_G2: V3 = [CHAIN_X, CHAIN_Y, RZ - 1.9];
/** The aorta in front of the vertebral body (along z), the prevertebral ganglion on its front, an organ below. */
const AORTA_X = 0.15, AORTA_Y = -3.35, AORTA_R = 0.42;
const PREV_G: V3 = [0.72, -3.82, RZ - 0.1];
const ORGAN: V3 = [1.55, -5.0, RZ - 0.1];
/** The white ramus leaves the nerve's start (myelinated, to the chain); the grey one joins it further out. */
const WHITE_RAMUS: V3[] = [[3.36, -0.06, RZ], [3.36, -0.85, RZ + 0.04], [CHAIN_X + 0.08, CHAIN_Y + 0.22, RZ]];
const GREY_RAMUS: V3[] = [[CHAIN_X + 0.2, CHAIN_Y + 0.16, RZ - 0.02], [3.72, -0.9, RZ - 0.02], [3.86, -0.32, RZ]];
const SPLANCH: V3[] = [[CHAIN_X - 0.14, CHAIN_Y - 0.12, RZ - 0.04], [2.2, -2.75, RZ - 0.08], [1.35, -3.45, RZ - 0.1], [PREV_G[0] + 0.12, PREV_G[1] + 0.06, PREV_G[2]]];
const SOMA_SY: V3 = [0.62, -0.04, FZ];
const PRE_AX: V3[] = [SOMA_SY, [0.82, -0.44, FZ], [0.9, -0.56, RZ + 0.3], [1.4, -0.48, RZ + 0.06], [2.1, -0.28, RZ + 0.06], [2.85, 0.1, RZ + 0.06], [3.32, -0.04, RZ + 0.06], [3.33, -0.85, RZ + 0.08], [CHAIN_X + 0.05, CHAIN_Y + 0.08, RZ + 0.04]];
/** Preganglionic, synapse in the chain ganglion. */
export const SYMP_PRE: V3[] = L(PRE_AX, 80);
/** Postganglionic from the chain ganglion: grey ramus, nerve, ventral ramus, out to the body wall. */
export const SYMP_POST: V3[] = L([[CHAIN_X, CHAIN_Y, RZ - 0.04], [3.5, -1.2, RZ - 0.06], [3.84, -0.36, RZ - 0.06], [4.3, -0.62, RZ - 0.06], [5.0, -1.25, RZ - 0.06], [5.6, -1.55, RZ - 0.06]], 50);
/** Preganglionic through the chain without a synapse, down the splanchnic nerve to the prevertebral ganglion. */
export const SYMP_PRE2: V3[] = L([...PRE_AX, [CHAIN_X - 0.06, CHAIN_Y - 0.1, RZ + 0.02], ...SPLANCH.slice(1, 3).map((q): V3 => [q[0], q[1], q[2] + 0.06]), PREV_G], 110);
/** Postganglionic from the prevertebral ganglion to the organ. */
export const SYMP_POST2: V3[] = L([PREV_G, [1.0, -4.4, RZ - 0.1], ORGAN], 30);

export function cordModel(pose: CordPose, o: CordOpts = {}) {
  const items: Item3[] = [];
  const pts: Record<string, V3> = {};
  const dim = o.dim && o.dim.k > 0.001 ? o.dim : null;
  const k = dim ? dim.k : 0;
  const lit = (id: string | undefined, groups?: readonly string[]) => !dim || (!!id && dim.ids.includes(id)) || (groups ?? []).some((g) => dim.ids.includes(g));
  const put = (key: string, id: string | undefined, parts: Parts | null, color: string, deep: string, extra: Partial<Item3> = {}) => {
    if (!parts || (extra.opacity ?? 1) <= 0.01) return;
    const off = !!dim && !!id && !lit(id, extra.groups);
    items.push({ key, id, ...parts, color: off ? mixHex(color, '#bdb4b2', 0.45 * k) : color, deep: off ? mixHex(deep, '#7c7472', 0.45 * k) : deep, tissue: 'neural', ...extra });
  };
  const roots = clamp01(pose.roots), rami = clamp01(pose.rami), fn = clamp01(pose.fn), lat = clamp01(pose.lat);

  // ———— the cord ————
  put('white', 'gai-zuria', WHITE(), C19.white, C19.whiteDeep, { groups: ['ornomuina'], calm: true });
  const g = greyByFn(lat > 0.5);
  const grey = C19.grey, greyD = C19.greyDeep;
  put('grey-post', 'atzeko-adarra', g.post, mixHex(grey, C19.sens, 0.75 * fn), mixHex(greyD, C19.sensDeep, 0.6 * fn), { groups: ['gai-grisa', 'ornomuina'] });
  put('grey-ant', 'aurreko-adarra', g.ant, mixHex(grey, C19.motor, 0.75 * fn), mixHex(greyD, C19.motorDeep, 0.6 * fn), { groups: ['gai-grisa', 'ornomuina'] });
  put('grey-mid', lat > 0.5 ? 'alboko-adarra' : 'gai-grisa', g.mid, mixHex(grey, C19.symp, 0.7 * fn * lat), mixHex(greyD, C19.sympDeep, 0.6 * fn * lat), { groups: ['gai-grisa', 'ornomuina', 'hodi-ependimarioa'] });
  const canal = vessel(L([[0, -0.02, -LEN - 0.03], [0, -0.02, LEN + 0.03]], 4), { r0: 0.075, r1: 0.075, sides: 14 });
  put('canal', 'hodi-ependimarioa', canal, C19.ependyma, mixHex(C19.ependyma, '#000000', 0.5), { groups: ['ornomuina'] });
  pts['gai-zuria'] = [-0.85, 0.32, LEN + 0.02];
  pts['gai-grisa'] = [-0.36, -0.36, LEN + 0.02];
  pts['atzeko-adarra'] = [0.36, 0.6, LEN + 0.02];
  pts['aurreko-adarra'] = [0.4, -0.38, LEN + 0.02];
  pts['alboko-adarra'] = [0.56, 0.0, LEN + 0.02];
  pts['hodi-ependimarioa'] = [0, -0.02, LEN + 0.02];
  pts['ornomuina'] = [-0.7, -0.4, 0.6];

  // ———— the tracts: ascending (sensory) behind, descending (motor) at the sides ————
  const tr = clamp01(pose.tracts);
  if (tr > 0.01) {
    const patch = (key: string, id: string, c: V3, r: V3, color: string, deep: string) =>
      put(key, id, mergeParts([1, -1].map((s) => blobParts({ center: X(s, c), radii: r, rings: 8, sides: 12 }))), color, deep, { opacity: tr, groups: ['gai-zuria'] });
    patch('tr-up', 'goranzko-bideak', [0.16, 0.62, LEN + 0.005], [0.13, 0.16, 0.02], C19.sens, C19.sensDeep);
    patch('tr-down', 'beheranzko-bideak', [0.82, -0.08, LEN + 0.005], [0.12, 0.2, 0.02], C19.motor, C19.motorDeep);
    pts['goranzko-bideak'] = [0.16, 0.62, LEN + 0.03];
    pts['beheranzko-bideak'] = [0.82, -0.08, LEN + 0.03];
  }

  // ———— roots, ganglion, spinal nerve, rami ————
  if (roots > 0.01) {
    const yel = C19.nerve, yelD = C19.nerveDeep;
    const pr: (Parts | null)[] = [], ar: (Parts | null)[] = [], gg: (Parts | null)[] = [], nv: (Parts | null)[] = [];
    const plets: (Parts | null)[] = [], alets: (Parts | null)[] = [];
    // The rootlets come out first (3/p6/s1), then gather into the roots (s2), then the ganglion swells (p7).
    const rl = clamp01(roots / 0.4), rr = clamp01((roots - 0.4) / 0.25);
    for (const s of [1, -1]) {
      for (const l of rootlets('post')) plets.push(vessel(l.map((q) => X(s, q)), { r0: 0.035, r1: 0.05, sides: 8 }, rl));
      for (const l of rootlets('ant')) alets.push(vessel(l.map((q) => X(s, q)), { r0: 0.035, r1: 0.05, sides: 8 }, rl));
      if (rr > 0.001) pr.push(vessel(L(POST_ROOT, 12).map((q) => X(s, q)), { r0: 0.12, r1: 0.13, sides: 12 }, rr));
      if (rr > 0.001) ar.push(vessel(L(ANT_ROOT, 12).map((q) => X(s, q)), { r0: 0.11, r1: 0.12, sides: 12 }, rr));
      if (roots > 0.6) gg.push(blobParts({ center: X(s, GANG), radii: [0.42 * gk(roots), 0.3 * gk(roots), 0.3 * gk(roots)], rings: 12, sides: 16 }));
      if (roots > 0.8) nv.push(vessel(L([[GANG[0] + 0.3, GANG[1] - 0.15, RZ], JOIN, NERVE_END], 10).map((q) => X(s, q)), { r0: 0.15, r1: 0.17, sides: 14 }, (roots - 0.8) / 0.2));
    }
    put('post-lets', 'sustraitxoak', mergeParts(plets), mixHex(yel, C19.sens, 0.45 * fn), yelD, { tissue: 'nerve', groups: ['atzeko-sustraia'] });
    put('ant-lets', 'sustraitxoak', mergeParts(alets), mixHex(yel, C19.motor, 0.45 * fn), yelD, { tissue: 'nerve', groups: ['aurreko-sustraia'] });
    put('post-root', 'atzeko-sustraia', mergeParts(pr), mixHex(yel, C19.sens, 0.45 * fn), yelD, { tissue: 'nerve' });
    put('ant-root', 'aurreko-sustraia', mergeParts(ar), mixHex(yel, C19.motor, 0.45 * fn), yelD, { tissue: 'nerve' });
    put('ganglion', 'gongoil-errakideoak', mergeParts(gg), C19.ganglion, yelD, { tissue: 'nerve' });
    put('nerve', 'nerbio-espinalak', mergeParts(nv), yel, yelD, { tissue: 'nerve' });
    pts['atzeko-sustraia'] = [1.55, 0.76, RZ];
    pts['aurreko-sustraia'] = [1.75, -0.42, RZ];
    pts['gongoil-errakideoak'] = [GANG[0], GANG[1] + 0.25, RZ];
    pts['nerbio-espinalak'] = [3.1, 0.06, RZ + 0.1];
    pts['sustraitxoak'] = [1.0, 0.74, RZ + 0.2];
    if (rami > 0.01) {
      const dr = mergeParts([1, -1].map((s) => vessel(L(DORSAL_RAMUS, 14).map((q) => X(s, q)), { r0: 0.1, r1: 0.07, sides: 10 }, rami)));
      const vr = mergeParts([1, -1].map((s) => vessel(L(VENTRAL_RAMUS, 18).map((q) => X(s, q)), { r0: 0.13, r1: 0.09, sides: 12 }, rami)));
      // Its branches out to the body (the notes do not name them: they belong to the spinal nerve).
      put('ramus-d', 'nerbio-espinalak', dr, yel, yelD, { tissue: 'nerve' });
      put('ramus-v', 'nerbio-espinalak', vr, yel, yelD, { tissue: 'nerve' });
    }
  }

  // ———— the meninges, the fluid, the canal ————
  const dura = clamp01(pose.dura), arach = clamp01(pose.arach), pia = clamp01(pose.pia), csf = clamp01(pose.csf), bone = clamp01(pose.bone);
  const MEN = ['meningeak'];
  put('pia', 'pia-materra', PIA(), C19.pia, C19.piaDeep, { groups: MEN, opacity: 0.85 * pia, tissue: 'membrane' });
  put('csf', 'likido-zefalorrakideoa', CSF(), C19.csf, C19.csfDeep, { groups: ['eremu-azpiaraknoideoa'], opacity: 0.5 * csf, tissue: 'membrane', outline: false });
  put('arach', 'araknoidesa', ARACH(), C19.arach, C19.arachDeep, { groups: MEN, opacity: 0.9 * arach, tissue: 'membrane' });
  put('dura', 'dura-materra', DURA(), C19.dura, C19.duraDeep, { groups: MEN, opacity: dura, tissue: 'membrane' });
  put('bone', 'ornoak', BONE(), G19.bone, G19.boneDeep, { opacity: bone, tissue: 'bone', calm: true });
  // The epidural space: fat between the dura and the bone (the dura is not tied to the vertebrae).
  put('epi', 'eremu-epidurala', EPI(), '#f2d79a', '#8a6a2a', { opacity: 0.55 * bone, tissue: 'mesenchyme', outline: false });
  pts['pia-materra'] = [-0.66, 0.74, LEN - 0.2];
  pts['araknoidesa'] = [-1.06, 0.98, 0.7];
  // Two places on the fluid's cut ring (mid-thickness, on its end face): the space and the fluid that fills it.
  pts['eremu-azpiaraknoideoa'] = [-0.8, -0.84, 0.84];
  pts['likido-zefalorrakideoa'] = [-1.17, -0.375, 0.84];
  pts['dura-materra'] = [-1.3, 1.02, 0.1];
  pts['eremu-epidurala'] = [-1.95, 0.55, -0.6];
  pts['ornoak'] = [-2.3, 1.2, -0.6];
  pts['meningeak'] = [-1.06, 0.98, 0.7];

  // ———— the sympathetic way (left side) ————
  const symp = clamp01(pose.symp ?? 0);
  if (symp > 0.01) {
    const green = C19.symp, greenD = C19.sympDeep;
    const SY = ['sistema-sinpatikoa'];
    const trunk = vessel(L([[CHAIN_X, CHAIN_Y, LEN], CHAIN_G, CHAIN_G2, [CHAIN_X, CHAIN_Y, -LEN - 0.4]], 16), { r0: 0.07, r1: 0.07, sides: 10 }, symp);
    const gang = mergeParts([CHAIN_G, CHAIN_G2].map((c) => blobParts({ center: c, radii: [0.24, 0.22, 0.34], rings: 10, sides: 14 })));
    put('chain', 'kate-sinpatikoa', mergeParts([trunk]), mixHex(green, C19.nerve, 0.35), greenD, { tissue: 'nerve', groups: SY, opacity: symp });
    put('chain-g', 'gongoil-parabertebralak', gang, mixHex(green, C19.ganglion, 0.3), greenD, { tissue: 'nerve', groups: [...SY, 'kate-sinpatikoa'], opacity: symp });
    put('ram-white', 'adar-komunikante-zuria', vessel(L(WHITE_RAMUS, 12), { r0: 0.06, r1: 0.06, sides: 10 }, symp), C19.white, C19.whiteDeep, { tissue: 'nerve', groups: SY, opacity: symp });
    put('ram-grey', 'adar-komunikante-grisa', vessel(L(GREY_RAMUS, 12), { r0: 0.055, r1: 0.055, sides: 10 }, symp), mixHex(C19.grey, '#9a9090', 0.4), C19.greyDeep, { tissue: 'nerve', groups: SY, opacity: symp });
    put('splanch', 'nerbio-esplaknikoa', vessel(L(SPLANCH, 16), { r0: 0.06, r1: 0.055, sides: 10 }, symp), mixHex(green, C19.nerve, 0.35), greenD, { tissue: 'nerve', groups: SY, opacity: symp });
    put('aorta', 'aorta', vessel(L([[AORTA_X, AORTA_Y, LEN + 0.2], [AORTA_X, AORTA_Y, -LEN - 0.2]], 4), { r0: AORTA_R, r1: AORTA_R, sides: 20 }), '#d8524c', '#6e1a18', { tissue: 'vessel', opacity: 0.85 * symp });
    put('prev-g', 'gongoil-prebertebralak', blobParts({ center: PREV_G, radii: [0.24, 0.18, 0.3], rings: 10, sides: 14 }), mixHex(green, C19.ganglion, 0.3), greenD, { tissue: 'nerve', groups: SY, opacity: symp });
    put('organ', 'erraiak', blobParts({ center: ORGAN, radii: [0.62, 0.42, 0.55], rings: 12, sides: 16 }), '#e6a08a', '#7a3a2a', { tissue: 'muscle', opacity: symp });
    pts['kate-sinpatikoa'] = [CHAIN_X, CHAIN_Y, -0.35];
    pts['gongoil-parabertebralak'] = [CHAIN_X + 0.1, CHAIN_Y + 0.05, RZ + 0.2];
    pts['adar-komunikante-zuria'] = [3.36, -0.8, RZ + 0.04];
    pts['adar-komunikante-grisa'] = [3.72, -0.9, RZ - 0.02];
    pts['nerbio-esplaknikoa'] = [2.2, -2.75, RZ - 0.08];
    pts['aorta'] = [AORTA_X - 0.3, AORTA_Y - 0.25, -0.7];
    pts['gongoil-prebertebralak'] = [PREV_G[0], PREV_G[1] - 0.05, PREV_G[2] + 0.2];
    pts['erraiak'] = [ORGAN[0], ORGAN[1], ORGAN[2] + 0.3];
    pts['sistema-sinpatikoa'] = pts['gongoil-parabertebralak'];
    const axon = (key: string, id: string, line: V3[], g: number, color: string, deep: string, soma: V3 | null, r = 0.04) => {
      if (g <= 0.001) return;
      const parts: (Parts | null)[] = [vessel(line, { r0: r, r1: r, bulb: 0.8, bulbLen: 0.12, sides: 10, n: line.length }, g)];
      if (soma) parts.push(blobParts({ center: soma, radii: [0.1, 0.1, 0.07], rings: 10, sides: 12 }));
      put(key, id, mergeParts(parts), color, deep, { tissue: 'nerve' });
    };
    const preC = mixHex(green, '#ffffff', 0.15), postC = mixHex(green, '#ffe9a0', 0.45);
    const pre = clamp01(pose.pre ?? 0), post = clamp01(pose.post ?? 0), sp = clamp01(pose.splanch ?? 0);
    axon('pre', 'gongoil-aurreko-neurona', SYMP_PRE, pre, preC, greenD, SOMA_SY);
    axon('post', 'gongoil-osteko-neurona', SYMP_POST, post, postC, greenD, post > 0.02 ? CHAIN_G : null, 0.035);
    axon('pre2', 'gongoil-aurreko-neurona', SYMP_PRE2, clamp01(sp / 0.6), preC, greenD, pre > 0.01 ? null : SOMA_SY);
    axon('post2', 'gongoil-osteko-neurona', SYMP_POST2, clamp01((sp - 0.6) / 0.4), postC, greenD, sp > 0.62 ? PREV_G : null, 0.035);
    if (pre + sp > 0.01) pts['gongoil-aurreko-neurona'] = [3.33, -0.5, RZ + 0.1];
    if (post > 0.01 || sp > 0.62) pts['gongoil-osteko-neurona'] = post > 0.01 ? [4.3, -0.62, RZ - 0.06] : [1.0, -4.4, RZ - 0.1];
  }

  // ———— the reflex arc ————
  const sens = clamp01(pose.sens), inter = clamp01(pose.inter), motor = clamp01(pose.motor);
  if (sens + inter + motor > 0.001 || (pose.ends ?? 0) > 0.01) {
    put('skin', 'larruazala', blobParts({ center: SKIN, radii: [0.32, 0.12, 0.3], rings: 10, sides: 14 }), '#f1c7a8', '#8a5a40', { tissue: 'skin' });
    put('muscle', 'muskulu-ildaskatuak', blobParts({ center: MUSCLE, radii: [0.32, 0.55, 0.3], rings: 12, sides: 16 }), motor > 0.97 ? '#e8524c' : '#c97f78', C19.muscleDeep, { tissue: 'muscle' });
    pts['larruazala'] = SKIN;
    pts['muskulu-ildaskatuak'] = MUSCLE;
    const neuron = (key: string, id: string, line: V3[], g: number, color: string, deep: string, soma: V3 | null, somaR = 0.12) => {
      if (g <= 0.001) return;
      const parts: (Parts | null)[] = [vessel(line, { r0: 0.045, r1: 0.045, bulb: 0.8, bulbLen: 0.12, sides: 10, n: line.length }, g)];
      if (soma) parts.push(blobParts({ center: soma, radii: [somaR, somaR, somaR * 0.7], rings: 10, sides: 12 }));
      put(key, id, mergeParts(parts), color, deep, { tissue: 'nerve' });
    };
    neuron('n-sens', 'neurona-sentsitiboa', ARC_SENS, sens, C19.sens, C19.sensDeep, sens > 0.45 ? SOMA_S : null, 0.15);
    neuron('n-inter', 'interneurona', ARC_INTER, inter, C19.inter, mixHex(C19.inter, '#000000', 0.5), inter > 0.02 ? SOMA_I : null, 0.07);
    neuron('n-motor', 'motoneurona', ARC_MOTOR, motor, C19.motor, C19.motorDeep, SOMA_M, 0.1);
    pts['neurona-sentsitiboa'] = [4.3, -0.48, RZ + 0.1];
    pts['interneurona'] = [0.36, -0.08, FZ];
    pts['motoneurona'] = SOMA_M;
  }
  return { items, pts };
}

/** For the site's test: the block's central canal (origin) and its cranial face. */
export const CORD_FACE_Z = LEN;
void ellipsoid;
void capsule;
void smax;
