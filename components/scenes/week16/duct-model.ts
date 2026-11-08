import { add, mix3, type V3 } from '@/lib/three-d/math';
import { curve3 } from '@/lib/three-d/mesh';
import { cupShell, plate, vessel, type Parts, type VesselOptions } from '@/lib/three-d/organic';
import type { Item3 } from '@/lib/three-d/scene';
import { blobParts, mixHex, tubeParts } from '@/components/scenes/week10/model3d';
import { UC } from '@/components/scenes/week15/uro-model';
import { GC16 } from './gonad-model';

/**
 * Topic 16: the genital ducts seen from the front (the notes' figures of 2.1, 3.2, 3.2.1 and 3.4): both gonads
 * on the mesonephros, the mesonephric (Wolff, dark purple as in topic 15) and paramesonephric (Müller, orange as
 * the notes draw its vestiges) ducts, the bladder and the urogenital sinus. Then either way:
 * - male: the Müller duct goes (its vestiges: the appendix of the testis, the prostatic utricle); the mesonephric
 *   tubules by the testis become the efferent ductules (those below: the paradidymis); the duct becomes the
 *   epididymis, the vas deferens, the seminal vesicle's bud and the ejaculatory duct into the prostatic urethra;
 * - female: the mesonephric duct goes (its vestiges: the epoophoron and paroophoron in the mesovarium); the
 *   Müller ducts give the uterine tubes (open at the top) and, fused, the uterus; the sinovaginal bulbs, the
 *   vaginal plate and the vagina (upper third from the Müller ducts, the rest from the sinus); the hymen; the
 *   gonad's ligaments and the broad ligament.
 *
 * Axes as every model of the topics: x towards the embryo's LEFT, y cranial, z ventral (front view: the embryo's
 * left on the viewer's right).
 *
 * Built to the quality bar (docs/quality/3d-quality-bar.md): everything lies on the posterior wall (opaque
 * ground); the ducts are profiled vessels (a regressing duct thins away rather than fading to glass), the Müller
 * duct's cranial end opens as a cup, the uterus is one pear-shaped vessel the two canals converge into, the
 * seminal vesicle buds off the vas, and the ligaments and the gubernaculum are tapered cords grown by arc length.
 * The bladder stays see-through on purpose: it lies in front of the uterus and the vagina.
 */

export interface DuctPose {
  /** Both ducts drawn (0..1). */
  ducts: number;
  /** Male changes (0..1 each). */
  male: number;
  efferent: number;
  epididymis: number;
  vesicle: number;
  prostate: number;
  /** Spermatozoa running the semen pathway (0..1). */
  semen: number;
  /** Female changes (0..1 each). */
  female: number;
  /** The two Müller ducts' caudal parts fused (the septum lost): the uterine canal (0..1). */
  fuse: number;
  /** The sinovaginal bulbs (0..1), the vaginal plate (0..1), the vagina's lumen (0..1), the hymen (0..1). */
  bulbs: number;
  plate: number;
  lumen: number;
  hymen: number;
  /** The ligaments (suspensory, utero-ovarian, round) (0..1) and the broad ligament (0..1). */
  ligaments: number;
  broad: number;
  /** Female descent (notes 4.2): the ovary going down into the pelvis (0..1); the gubernaculum as one cord (0..1). */
  ovDown?: number;
  gub?: number;
}

export const DP0: DuctPose = { ducts: 1, male: 0, efferent: 0, epididymis: 0, vesicle: 0, prostate: 0, semen: 0, female: 0, fuse: 0, bulbs: 0, plate: 0, lumen: 0, hymen: 0, ligaments: 0, broad: 0, ovDown: 0, gub: 0 };

export interface DuctOpts {
  dim?: { ids: readonly string[]; k: number } | null;
  /** Seen from behind: the wall the ducts lie on moves to the far side (it would hide them). */
  back?: boolean;
}

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const darker = (c: string) => mixHex(c, '#000000', 0.55);
const L = (kps: readonly V3[], n = 24) => curve3(kps as V3[], n);
const X = (s: number, p: V3): V3 => [s * p[0], p[1], p[2]];
const grown = (line: V3[], g: number) => (g >= 0.999 ? line : line.slice(0, Math.max(2, Math.round(line.length * clamp01(g)))));
const ss = (a: number, b: number, x: number) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const sub3 = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const norm3 = (a: V3): V3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
/** The broad ligament's outline (x, y): from one side wall over the tubes and the uterus to the other. */
const BROAD: [number, number][] = [
  ...Array.from({ length: 21 }, (_, i): [number, number] => {
    const x = -2.0 + (i / 20) * 4.0;
    return [x, -0.12 + 0.28 * (Math.abs(x) / 2) - 0.12 * Math.cos((x / 2) * Math.PI)];
  }),
  [2.0, -1.2], [1.4, -1.85], [0.6, -2.0], [-0.6, -2.0], [-1.4, -1.85], [-2.0, -1.2],
];
/** Blend two polylines point by point (resampled to the same count). */
const morph = (a: V3[], b: V3[], k: number): V3[] => (k <= 0.001 ? a : k >= 0.999 ? b : a.map((p, i) => mix3(p, b[Math.round((i / (a.length - 1)) * (b.length - 1))], k)));

const OVARY = '#b8e8e0';
const UTERUS = UC.muller;
const VAG_LOW = UC.endo;
const PROSTATE = '#d6a33a';
const LIG = '#c9c1b2';

/** The posterior wall behind everything (the ground). */
const WALL = Array.from({ length: 56 }, (_, i): [number, number] => {
  const a = (i / 56) * Math.PI * 2;
  const c = Math.cos(a), sn = Math.sin(a);
  return [2.75 * Math.sign(c) * Math.abs(c) ** 0.35, -0.65 + 3.3 * Math.sign(sn) * Math.abs(sn) ** 0.35];
});

/** The gonad's place (both sexes). */
const GON = (s: number): V3 => X(s, [1.25, 1.0, 0]);

export function ductModel(pose: DuctPose, o: DuctOpts = {}) {
  const items: Item3[] = [];
  const pts: Record<string, V3> = {};
  const dim = o.dim;
  const fade = (id: string, groups?: readonly string[]) => (!dim || dim.k <= 0.001 || dim.ids.includes(id) || (groups ?? []).some((g) => dim.ids.includes(g)) ? 1 : 1 - 0.75 * dim.k);
  const tube = (key: string, id: string | undefined, line: V3[], color: string, r: number | ((u: number) => number), op = 1, extra: Partial<Item3> = {}, sides = 12) => {
    if (op <= 0.01 || line.length < 2) return;
    items.push({ key, id, ...tubeParts(line, { radius: typeof r === 'number' ? () => r : r, ref: [0, 0, 1], sides, capStart: true, capEnd: true }), color, deep: darker(color), tissue: 'epithelium', opacity: op * (id ? fade(id, extra.groups) : 1), ...extra });
  };
  const ball = (key: string, id: string | undefined, c: V3, r: V3, color: string, op = 1, extra: Partial<Item3> = {}, rings = 12, sides = 16) => {
    if (op <= 0.01) return;
    items.push({ key, id, ...blobParts({ center: c, radii: r, rings, sides }), color, deep: darker(color), tissue: 'epithelium', opacity: op * (id ? fade(id, extra.groups) : 1), ...extra });
  };
  const put = (key: string, id: string | undefined, parts: Parts | null, color: string, op = 1, extra: Partial<Item3> = {}) => {
    if (!parts || op <= 0.01) return;
    items.push({ key, id, ...parts, color, deep: darker(color), tissue: 'epithelium', opacity: op * (id ? fade(id, extra.groups) : 1), ...extra });
  };
  const vess = (key: string, id: string | undefined, line: V3[], color: string, prof: VesselOptions, g = 1, op = 1, extra: Partial<Item3> = {}) =>
    put(key, id, vessel(line, { ref: [0, 0, 1], sides: 12, ...prof }, g), color, op, extra);
  const male = clamp01(pose.male);
  const female = clamp01(pose.female);
  items.push({ key: 'wall', ...(o.back ? plate('ducts16-wall-back-v1', WALL, 1.05, 1.3) : plate('ducts16-wall-v1', WALL, -0.8, -1.05)), color: UC.wall, deep: UC.wallDeep, tissue: 'mesenchyme', opacity: 1, quiet: true, ground: true });
  const ovd = clamp01(pose.ovDown ?? 0);
  const gon = (s: number): V3 => add(GON(s), X(s, [-0.2 * ovd, -0.65 * ovd, 0.1 * ovd]));

  // ———— the bladder and the urogenital sinus (endoderm), the mesonephros (context) ————
  ball('bladder', 'gernu-maskuria', [0, -1.35, 0.85], [0.6, 0.72, 0.45], UC.endo, 0.28, { outline: false, quiet: true, deep: UC.endoDeep }, 14, 18);
  pts['gernu-maskuria'] = [0.62, -1.0, 1.0];
  const sinusC: V3 = [0, -2.35, 0.25];
  ball('sinus', 'sinu-urogenitala', sinusC, [0.32, 0.4, 0.3], UC.endo, 0.75 * (1 - 0.5 * female), { deep: UC.endoDeep });
  pts['sinu-urogenitala'] = [0.3, -2.55, 0.35];
  vess('urethra', 'uretra', L([[0, -2.45, 0.28], [0, -3.1, 0.35], [0, -3.6, 0.4]], 10), UC.endo, { r0: 0.13, r1: 0.09, flare: 0.8, flareLen: 0.2 }, 1, 1, { deep: UC.endoDeep });
  pts['uretra'] = [0.14, -3.25, 0.4];
  for (const s of [-1, 1]) {
    // On the wall; it regresses (shrinks) as the ducts take their ways.
    const k = 1 - 0.55 * Math.max(male, female);
    ball(`meso${s}`, 'mesonefrosa', X(s, [1.72, 0.9, -0.55]), [0.32 * k, 1.0 * k, 0.28 * k], UC.ridge, 1, { deep: UC.ridgeDeep, tissue: 'mesenchyme' });
  }
  pts['mesonefrosa'] = X(1, [1.95, 1.55, -0.1]);

  // ———— the gonads → testes or ovaries ————
  for (const s of [-1, 1]) {
    const c = gon(s);
    const r: V3 = [lerp(0.32, 0.42, male), lerp(0.6, 0.55, Math.max(male, female)), lerp(0.28, 0.34, male)];
    const id = male > 0.5 ? 'barrabila' : female > 0.5 ? 'obarioa' : 'gonadak';
    ball(`gonad${s}`, id, c, r, mixHex(mixHex(GC16.gonad, '#d9f2ee', male), OVARY, female), 0.95, { groups: ['gonadak'], deep: GC16.gonadDeep });
    if (s > 0) {
      pts[id] = add(c, [0.3, 0.25, 0.2]);
      pts['gonadak'] = pts[id];
    }
  }

  // ———— the mesonephric (Wolff) duct and the mesonephric tubules ————
  const wolffOp = pose.ducts * (1 - female);
  for (const s of [-1, 1]) {
    const wolff0 = L([X(s, [1.75, 1.75, -0.25]), X(s, [1.72, 0.3, -0.25]), X(s, [1.25, -1.15, -0.15]), X(s, [0.55, -2.0, 0.05]), X(s, [0.15, -2.3, 0.15])], 40);
    // Male: tail of the epididymis down to the prostate — the vas deferens's longer, straighter way.
    const wolffM = L([X(s, [1.62, 0.4, -0.2]), X(s, [1.75, -0.4, -0.25]), X(s, [1.3, -1.35, -0.35]), X(s, [0.5, -2.0, -0.2]), X(s, [0.15, -2.2, 0.05])], 40);
    const wolff = morph(wolff0, wolffM, pose.epididymis);
    const wid = pose.epididymis > 0.5 ? 'hodi-deferentea' : 'hodi-mesonefrikoa';
    // In the female it thins away (and is gone at the end) rather than fading to glass.
    vess(`wolff${s}`, wid, wolff, UC.wolff, { r0: 0.075 * (1 - 0.6 * female), r1: 0.065 * (1 - 0.6 * female), flare: 0.5, flareLen: 0.2 }, 1, pose.ducts * (1 - ss(0.75, 1, female)), { deep: UC.wolffDeep, groups: ['hodi-mesonefrikoa', 'hodi-deferentea'] });
    if (s > 0) {
      pts[wid] = wolff[16];
      pts['hodi-mesonefrikoa'] = wolff[16];
      pts['hodi-deferentea'] = wolff[16];
    }
    // Mesonephric tubules beside the gonad: epigenital (at the gonad) → efferent ductules; paragenital (below) → paradidymis.
    const tubs = Array.from({ length: 6 }, (_, k) => 1.45 - k * 0.22);
    tubs.forEach((y, k) => {
      const epi = y > 0.65;
      const id = male > 0.5 ? (epi ? 'hodixka-eferenteak' : 'paradidimoa') : female > 0.5 ? (epi ? 'epooforoa' : 'paraooforoa') : epi ? 'hodixka-epigenitalak' : 'hodixka-paragenitalak';
      const toGonad = epi ? clamp01(pose.efferent) : 0;
      // In the female they lie in the mesovarium: they go down with the ovary.
      const dn = X(s, [-0.2 * ovd, -0.65 * ovd, 0.1 * ovd]);
      const end = add(mix3(X(s, [1.5, y, -0.15]), add(gon(s), X(s, [0.22, y - 1.0, -0.05])), toGonad), dn);
      const line = L([add(X(s, [1.72, y, -0.25]), dn), add(X(s, [1.6, y + 0.05, -0.1]), dn), end], 8);
      // Male: the paragenital ones mostly go (a small remnant); female: both groups stay as small vestiges.
      const op = (epi ? 1 : male > 0.5 ? 0.6 : 1) * pose.ducts;
      vess(`tub${s}${k}`, id, epi || male < 0.5 ? line : line.slice(0, 5), mixHex(UC.meso, '#a78bfa', Math.max(male, female)), { r0: 0.05, r1: 0.035, flare: 0.6, flareLen: 0.08, sides: 8 }, 1, op, { groups: ['hodixka-mesonefrikoak'] });
      if (s > 0 && k === 1) pts[id] = add(line[5], [0.05, 0.08, 0.15]);
      if (s > 0 && k === 4) pts[id] = add(line[3], [0.05, 0, 0.15]);
    });
    if (s > 0) {
      pts['hodixka-mesonefrikoak'] = X(1, [1.62, 1.0, 0]);
      pts['hodixka-epigenitalak'] = X(1, [1.6, 1.25, 0.05]);
      pts['hodixka-paragenitalak'] = X(1, [1.6, 0.4, 0.05]);
    }
    // The epididymis: the duct's coiled start along the testis.
    const ep = clamp01(pose.epididymis);
    if (ep > 0.01) {
      const coil = Array.from({ length: 40 }, (_, i): V3 => {
        const u = i / 39;
        const a = u * Math.PI * 2 * 7;
        return X(s, [1.62 + 0.09 * Math.cos(a), lerp(1.55, 0.4, u), -0.2 + 0.09 * Math.sin(a)]);
      });
      vess(`epid${s}`, 'epididimoa', coil, UC.wolff, { r0: 0.055, r1: 0.05, sides: 8, n: 120 }, ep, 1, { deep: UC.wolffDeep });
      if (s > 0) pts['epididimoa'] = X(s, [1.78, 0.95, 0]);
    }
    // The seminal vesicle (a bud of the vas deferens's end) and the ejaculatory duct.
    const ve = clamp01(pose.vesicle);
    if (ve > 0.01) {
      // The seminal vesicle buds off the vas's end and swells (a sac); the ejaculatory duct runs on into the urethra.
      vess(`sv${s}`, 'semen-xixkua', L([X(s, [0.52, -1.98, -0.25]), X(s, [0.6, -1.75, -0.35]), X(s, [0.66, -1.4, -0.38])], 12), '#9b7bf0', { r0: 0.07, r1: 0.12, flare: 0.6, flareLen: 0.1, bulb: 0.6, bulbLen: 0.3 }, ve, 1, { deep: '#4b2f9e' });
      vess(`ej${s}`, 'hodi-isurlea', L([X(s, [0.45, -2.0, -0.2]), X(s, [0.25, -2.15, -0.05]), X(s, [0.08, -2.25, 0.12])], 10), '#5b2fc4', { r0: 0.06, r1: 0.045 }, ve, 1);
      if (s > 0) {
        pts['semen-xixkua'] = X(s, [0.78, -1.55, -0.2]);
        pts['hodi-isurlea'] = X(s, [0.3, -2.12, 0.1]);
      }
    }
  }

  // ———— the paramesonephric (Müller) duct → uterine tubes and uterus (female), or its two vestiges (male) ————
  const mullerOp = pose.ducts * (1 - 0.95 * male);
  for (const s of [-1, 1]) {
    const m0 = L([X(s, [1.98, 1.95, -0.05]), X(s, [1.98, 0.6, 0.0]), X(s, [1.5, -0.9, 0.28]), X(s, [0.55, -1.85, 0.3]), X(s, [0.07, -2.1, 0.28])], 40);
    // Female: the tube (cranial, open) over the ovary to the uterus's horn; the caudal part is the uterus (drawn below).
    // The tube's lateral part goes down with the ovary (ovDown); its uterine end stays.
    const dw = (w: number): V3 => X(s, [-0.2 * ovd * w, -0.65 * ovd * w, 0.1 * ovd * w]);
    const mF = L([add(X(s, [1.55, 1.55, 0.25]), dw(1)), add(X(s, [1.75, 1.0, 0.25]), dw(1)), add(X(s, [1.3, 0.35, 0.18]), dw(0.6)), add(X(s, [0.7, -0.05, 0.1]), dw(0.2)), X(s, [0.38, -0.25, 0.05])], 40);
    const line = morph(m0, mF, female);
    const id = female > 0.5 ? 'falopioren-tronpak' : 'hodi-paramesonefrikoa';
    // In the male it thins away (its vestiges stay); its cranial end flares open into the coelom.
    const mr = 0.07 * (1 - 0.6 * male);
    vess(`mul${s}`, id, line, UC.muller, { r0: mr * 1.2, r1: mr, flare: 0.8, flareLen: 0.18 }, 1, mullerOp, { deep: UC.mullerDeep, groups: ['hodi-paramesonefrikoa', 'falopioren-tronpak'] });
    // The open end: a cup turned away from the duct (in the female the tube's ostium by the ovary).
    const out = norm3(sub3(line[0], line[3]));
    put(`mfun${s}`, id, cupShell({ center: add(line[0], [out[0] * 0.08, out[1] * 0.08, out[2] * 0.08]), axis: out, radius: 0.15 + 0.07 * female, thick: 0.045, wrap: 0.45 }), UC.muller, mullerOp, { deep: UC.mullerDeep, groups: ['hodi-paramesonefrikoa', 'falopioren-tronpak'] });
    if (s > 0) {
      pts[id] = line[12];
      pts['hodi-paramesonefrikoa'] = line[12];
      pts['falopioren-tronpak'] = line[12];
    }
    // Male vestiges: the appendix of the testis (at its top) — the prostatic utricle is midline (below).
    if (male > 0.01) {
      ball(`app${s}`, 'barrabil-apendizea', add(gon(s), X(s, [0.05, 0.68, 0.12])), [0.11 * male, 0.11 * male, 0.1 * male], UC.muller, 1, { deep: UC.mullerDeep }, 8, 10);
      if (s > 0) pts['barrabil-apendizea'] = add(gon(s), X(s, [0.15, 0.78, 0.2]));
    }
  }
  if (male > 0.01) {
    ball('utricle', 'prostataren-utrikulua', [0, -2.12, 0.0], [0.08 * male, 0.12 * male, 0.08 * male], UC.muller, 1, { deep: UC.mullerDeep }, 8, 10);
    pts['prostataren-utrikulua'] = [0.05, -2.0, -0.12];
  }
  const pr = clamp01(pose.prostate);
  if (pr > 0.01) {
    ball('prostate', 'prostata', [0, -2.18, 0.15], [0.48 * pr, 0.36 * pr, 0.36 * pr], PROSTATE, 0.45, { thin: 0.4 });
    tube('uprost', 'uretra-prostatikoa', L([[0, -1.95, 0.3], [0, -2.45, 0.3]], 6), '#ffd34d', 0.07, pr, { groups: ['uretra'] }, 8);
    pts['prostata'] = [-0.42, -2.3, 0.4];
    pts['uretra-prostatikoa'] = [0.08, -2.4, 0.42];
  }

  // ———— female: the uterus (fused Müller ducts), the vagina, the hymen ————
  if (female > 0.01) {
    const fu = clamp01(pose.fuse);
    // Before fusion: two tubes side by side with a septum; after: one uterine canal, the body and the neck.
    // Before fusion: two canals side by side; they converge (the septum between them lost) into one.
    for (const s of [-1, 1]) vess(`uc${s}`, 'utero-hodia', L([X(s, [0.38, -0.25, 0.05]), X(s, [lerp(0.28, 0.05, fu), -1.0, 0.08]), X(s, [lerp(0.12, 0.0, fu), -1.75, 0.1])], 16), UTERUS, { r0: 0.1, r1: lerp(0.09, 0.12, fu), flare: 0.4, flareLen: 0.15 }, 1, female, { deep: UC.mullerDeep, groups: ['uteroa'] });
    if (fu > 0.01) {
      // The uterus: one pear-shaped body round the joined canals, wide at the fundus, narrowing to the neck.
      vess('uterus', 'uteroa', L([[0, -0.3, 0.06], [0, -0.9, 0.07], [0, -1.85, 0.1]], 16), UTERUS, { r0: 0.55 * fu, r1: 0.19 * fu, bulb: 0, flat: 0.4, ref: [0, 0, 1], sides: 18 }, 1, female, { deep: UC.mullerDeep, groups: ['utero-hodia'] });
      pts['uteroa'] = [0.38, -0.55, 0.35];
      pts['utero-lepoa'] = [0.18, -1.65, 0.3];
    }
    pts['utero-hodia'] = [0.25, -1.15, 0.3];
    // The sinovaginal bulbs on the sinus's back wall, the vaginal plate growing between, the lumen.
    const bu = clamp01(pose.bulbs);
    const pl = clamp01(pose.plate);
    const lu = clamp01(pose.lumen);
    if (bu > 0.01) {
      for (const s of [-1, 1]) ball(`bulb${s}`, 'bulbo-sinubaginalak', X(s, [0.14, -2.25, 0.05]), [0.14 * bu, 0.14 * bu, 0.12 * bu], VAG_LOW, 1 - pl, { deep: UC.endoDeep, groups: ['plaka-baginala'] });
      pts['bulbo-sinubaginalak'] = [0.22, -2.3, 0.2];
    }
    if (pl > 0.01) {
      // The plate: solid; the vagina: the canal once it is hollow (upper third Müller, the rest from the bulbs).
      const upper = L([[0, -1.85, 0.1], [0, -2.25, 0.12]], 6);
      const lower = L([[0, -2.25, 0.12], [0, -2.75, 0.18], [0, -3.2, 0.25]], 10);
      vess('vagU', lu > 0.5 ? 'bagina' : 'plaka-baginala', upper, UTERUS, { r0: 0.2, r1: 0.17, flare: 0.3, flareLen: 0.12 }, 1, pl, { deep: UC.mullerDeep, groups: ['bagina', 'plaka-baginala', 'baginaren-fornixa'] });
      vess('vagL', lu > 0.5 ? 'bagina' : 'plaka-baginala', lower, VAG_LOW, { r0: 0.17, r1: 0.15 }, pl, 1, { deep: UC.endoDeep, groups: ['bagina', 'plaka-baginala', 'bulbo-sinubaginalak'] });
      if (lu > 0.01) tube('vagLum', undefined, L([[0, -1.9, 0.14], [0, -3.15, 0.3]], 10), '#2a1a08', 0.08 * lu, 0.85, { quiet: true, outline: false }, 8);
      pts['plaka-baginala'] = [0.22, -2.7, 0.3];
      pts['bagina'] = [0.22, -2.8, 0.3];
      pts['baginaren-fornixa'] = [0.22, -2.0, 0.3];
    }
    if (pose.hymen > 0.01) {
      ball('hymen', 'himena', [0, -3.25, 0.27], [0.2, 0.03, 0.18], '#f4efe2', pose.hymen, { thin: 0.7, tissue: 'membrane' }, 8, 12);
      pts['himena'] = [0.24, -3.3, 0.35];
    }
    // The ligaments: suspensory (ovary → wall above), utero-ovarian (ovary ↔ uterus), round (uterus → down and out).
    const lg = clamp01(pose.ligaments);
    if (lg > 0.01)
      for (const s of [-1, 1]) {
        const ov = gon(s);
        const cord: VesselOptions = { r0: 0.065, r1: 0.045, flare: 0.6, flareLen: 0.12, sides: 8 };
        vess(`lsus${s}`, 'obarioaren-euspen-lotailua', L([add(ov, X(s, [0.1, 0.55, 0])), add(ov, X(s, [0.45, 1.2, -0.05])), add(ov, X(s, [0.7, 1.8, -0.1]))], 12), LIG, cord, lg, 1, { tissue: 'tendon' });
        vess(`lov${s}`, 'lotailu-utero-obarikoa', L([add(ov, X(s, [-0.3, -0.35, 0])), X(s, [0.7, 0.05, 0.05]), X(s, [0.42, -0.35, 0.08])], 12), LIG, cord, lg, 1, { tissue: 'tendon' });
        vess(`lround${s}`, 'uteroaren-lotailu-biribila', L([X(s, [0.45, -0.45, 0.12]), X(s, [1.2, -1.0, 0.25]), X(s, [1.75, -1.9, 0.4]), X(s, [1.65, -2.9, 0.6])], 16), LIG, cord, lg, 1, { tissue: 'tendon' });
        if (s > 0) {
          pts['obarioaren-euspen-lotailua'] = add(ov, X(s, [0.28, 0.88, -0.03]));
          pts['lotailu-utero-obarikoa'] = X(s, [0.85, 0.1, 0.12]);
          pts['uteroaren-lotailu-biribila'] = X(s, [1.55, -1.6, 0.45]);
        }
      }
    // The broad ligament: a sheet from the uterus out to the side walls, the tubes in its top edge.
    const br = clamp01(pose.broad);
    if (br > 0.01) {
      // A fold of peritoneum with real thickness, the tubes along its top edge (a membrane: light comes through it).
      put('broad', 'lotailu-zabala', plate('ducts16-broad-v1', BROAD, 0.0, -0.12), '#f9a8b8', 0.7 * br, { thin: 0.5, tissue: 'membrane' });
      pts['lotailu-zabala'] = [-1.5, -0.65, 0.12];
    }
  }

  // ———— female descent: the gubernaculum, one cord from the ovary past the uterus's horn down to the labial swelling ————
  const gb = clamp01(pose.gub ?? 0);
  if (gb > 0.01)
    for (const s of [-1, 1]) {
      const ov = gon(s);
      // It grows down from the ovary; once the ligaments come (it gives them), it fades as they grow.
      const lgOn = clamp01(pose.ligaments) > 0.01;
      const gline = L([add(ov, X(s, [-0.2, -0.4, 0.05])), X(s, [0.62, -0.25, 0.12]), X(s, [1.25, -1.0, 0.28]), X(s, [1.7, -1.95, 0.42]), X(s, [1.65, -2.9, 0.6])], 20);
      const gl = lgOn ? gline : grown(gline, gb);
      vess(`gub${s}`, 'gubernakulua', gline, '#9ca3af', { r0: 0.085, r1: 0.06, flare: 0.5, flareLen: 0.15, bulb: 0.4, bulbLen: 0.3, sides: 10 }, lgOn ? 1 : gb, lgOn ? gb : 1, { tissue: 'tendon' });
      // Named along what is drawn (it grows down from the ovary).
      if (s > 0) pts['gubernakulua'] = add(gl[Math.floor((gl.length - 1) * 0.6)], X(s, [0.1, 0, 0.08]));
    }

  // ———— the semen's way: seminiferous tubules → rete → efferent ductules → epididymis → vas → ejaculatory duct → prostatic urethra ————
  if (pose.semen > 0.01) {
    const s = 1;
    const way = L([add(gon(s), [0, -0.1, 0.1]), add(gon(s), X(s, [0.25, 0.35, 0])), X(s, [1.6, 1.3, -0.1]), X(s, [1.62, 0.9, -0.2]), X(s, [1.62, 0.45, -0.2]), X(s, [1.75, -0.4, -0.25]), X(s, [1.3, -1.35, -0.35]), X(s, [0.5, -2.0, -0.2]), X(s, [0.15, -2.2, 0.05]), [0, -2.5, 0.3], [0, -3.4, 0.4]], 60);
    for (let k = 0; k < 9; k++) {
      const u = (pose.semen * 1.4 + k / 9) % 1;
      const p = way[Math.min(way.length - 1, Math.floor(u * (way.length - 1)))];
      ball(`sp${k}`, undefined, add(p, [0, 0, 0.15]), [0.05, 0.05, 0.05], '#e0f2fe', ss(0, 0.1, pose.semen), { quiet: true, tissue: 'vessel' }, 6, 8);
    }
  }
  return { items, pts };
}
