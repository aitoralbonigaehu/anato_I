import { add, mix3, type V3 } from '@/lib/three-d/math';
import { curve3 } from '@/lib/three-d/mesh';
import type { Item3 } from '@/lib/three-d/scene';
import { blobParts, mixHex, tubeParts } from '@/components/scenes/week10/model3d';

/**
 * Topic 16, notes 5–6: the external genitalia seen from below and in front (the notes' figures: the genital
 * tubercle at the top, the anus at the bottom). Week 4: the undivided cloacal membrane, the genital tubercle in
 * front of it, the cloacal folds either side, the genital swellings further out. By week 7: the urogenital
 * membrane in front and the anal membrane behind, the perineum between; the folds beside the urogenital
 * membrane are the urogenital (urethral) folds, the swellings the labioscrotal swellings. End of week 7: the
 * urogenital membrane breaks: the urogenital groove. Then:
 * - female: the tubercle grows little and bends in (the clitoris's glans); the urethral folds → labia minora,
 *   the groove → the vestibule (the urethra's opening in front, the vagina's behind); the swellings → labia majora;
 * - male: the tubercle lengthens (the phallus); the groove closes from behind forwards (the penile urethra,
 *   complete in the 4th month); the swellings thicken into the scrotum, its seam the scrotal raphe.
 *
 * Own frame: x towards the embryo's LEFT (on the viewer's right), y towards the tubercle (up in the figure),
 * z towards the viewer (out of the perineum).
 */

export interface ExternalPose {
  /** Week 4: tubercle, cloacal folds, genital swellings (0..1). */
  tubercle: number;
  folds: number;
  swellings: number;
  /** Week 7: the membrane divided, the perineum between (0..1); the urogenital membrane broken: the groove (0..1). */
  divide: number;
  groove: number;
  /** Female (0..1): tubercle → clitoris, folds → labia minora, groove → vestibule, swellings → labia majora. */
  female: number;
  /** Male (0..1): the phallus; the groove closing from behind (0..1); the scrotum (0..1). */
  male: number;
  closeGroove: number;
  scrotum: number;
}

export const EX0: ExternalPose = { tubercle: 0, folds: 0, swellings: 0, divide: 0, groove: 0, female: 0, male: 0, closeGroove: 0, scrotum: 0 };

export interface ExternalOpts {
  dim?: { ids: readonly string[]; k: number } | null;
}

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const darker = (c: string) => mixHex(c, '#000000', 0.55);
const L = (kps: readonly V3[], n = 16) => curve3(kps as V3[], n);
const X = (s: number, p: V3): V3 => [s * p[0], p[1], p[2]];

const SKIN = '#f0c9b4';
const TUB = '#f29bb0';
const FOLD = '#f7b6c2';
const SWELL = '#e9b48f';
const MEM = '#f4efe2';
const DARK = '#3a1622';

export function externalModel(pose: ExternalPose, o: ExternalOpts = {}) {
  const items: Item3[] = [];
  const pts: Record<string, V3> = {};
  const dim = o.dim;
  const fade = (id: string, groups?: readonly string[]) => (!dim || dim.k <= 0.001 || dim.ids.includes(id) || (groups ?? []).some((g) => dim.ids.includes(g)) ? 1 : 1 - 0.75 * dim.k);
  const tube = (key: string, id: string | undefined, line: V3[], color: string, r: number | ((u: number) => number), op = 1, extra: Partial<Item3> = {}, sides = 14) => {
    if (op <= 0.01 || line.length < 2) return;
    items.push({ key, id, ...tubeParts(line, { radius: typeof r === 'number' ? () => r : r, ref: [1, 0, 0], sides, capStart: true, capEnd: true }), color, deep: darker(color), tissue: 'skin', opacity: op * (id ? fade(id, extra.groups) : 1), ...extra });
  };
  const ball = (key: string, id: string | undefined, c: V3, r: V3, color: string, op = 1, extra: Partial<Item3> = {}, rings = 12, sides = 18) => {
    if (op <= 0.01) return;
    items.push({ key, id, ...blobParts({ center: c, radii: r, rings, sides }), color, deep: darker(color), tissue: 'skin', opacity: op * (id ? fade(id, extra.groups) : 1), ...extra });
  };
  const fem = clamp01(pose.female);
  const male = clamp01(pose.male);
  const divide = clamp01(pose.divide);
  const groove = clamp01(pose.groove);

  // The perineal skin (the background surface).
  ball('skin', undefined, [0, -0.1, -0.35], [2.0, 2.0, 0.3], SKIN, 1, { outline: false, quiet: true, deep: '#a07060' }, 14, 22);

  // ———— the genital tubercle → phallus (male) or the clitoris's glans (female) ————
  if (pose.tubercle > 0.01) {
    const g = pose.tubercle;
    const base: V3 = [0, 1.0, 0.05];
    const tip: V3 = [0, lerp(1.25, 1.1, fem) + 0.35 * male, lerp(0.35, 0.22, fem) + 1.35 * male];
    const line = L([base, add(base, [0, 0.12 + 0.2 * male, 0.2 + 0.6 * male]), tip], 12);
    const id = male > 0.5 ? 'faloa' : fem > 0.5 ? 'klitoria' : 'tuberkulu-genitala';
    tube('tub', id, line, TUB, (u) => lerp(0.32, 0.26, u) * g * (1 - 0.35 * fem), 1, { groups: ['tuberkulu-genitala', 'klitoria', 'faloa'] });
    ball('glans', male > 0.5 ? 'glandea' : fem > 0.5 ? 'klitoria' : 'tuberkulu-genitala', tip, [0.3 * g * (1 - 0.35 * fem), 0.3 * g * (1 - 0.35 * fem), 0.3 * g * (1 - 0.3 * fem)], mixHex(TUB, '#f7a3c0', 0.5), 1, { groups: ['tuberkulu-genitala', 'klitoria', 'glandea'] });
    pts[id] = add(tip, [0.3, 0.2, 0.1]);
    pts['tuberkulu-genitala'] = pts[id];
    pts['glandea'] = add(tip, [0.32, 0.18, 0.15]);
    pts['klitoria'] = pts[id];
    pts['faloa'] = add(line[6], [0.35, 0, 0.1]);
  }

  // ———— the membrane: cloacal (one) → urogenital (front) + anal (back), the perineum between ————
  const memLen = (a: number, b: number): V3[] => [[0, a, 0.02], [0, (a + b) / 2, 0.03], [0, b, 0.02]];
  if (divide < 0.99) {
    tube('cm', 'kloaka-mintza', L(memLen(0.75, -0.85), 10), MEM, 0.11, 1 - divide, { tissue: 'membrane' }, 10);
    pts['kloaka-mintza'] = [0.14, -0.1, 0.12];
  }
  if (divide > 0.01) {
    const ug = 1 - groove;
    tube('ugm', 'mintz-urogenitala', L(memLen(0.75, -0.2), 10), MEM, 0.1, divide * ug, { tissue: 'membrane', groups: ['kloaka-mintza'] }, 10);
    pts['mintz-urogenitala'] = [0.12, 0.3, 0.12];
    ball('anm', 'uzki-mintza', [0, -0.85, 0.03], [0.14, 0.14, 0.06], MEM, divide, { tissue: 'membrane', groups: ['kloaka-mintza'] }, 8, 12);
    pts['uzki-mintza'] = [0.15, -0.9, 0.08];
    ball('per', 'perineoa', [0, -0.5, 0.0], [0.28, 0.13, 0.12], mixHex(SKIN, '#d98a7a', 0.4), divide, {}, 8, 12);
    pts['perineoa'] = [0.3, -0.5, 0.05];
  }
  // The urogenital groove's way: on the perineum in front of the anal membrane; in the male it runs on along
  // the phallus's underside, short of the glans. It closes from behind forwards (the penile urethra inside).
  const gI: V3[] = [[0, -0.18, 0.03], [0, 0.2, 0.05], [0, 0.45, 0.06], [0, 0.65, 0.07], [0, 0.78, 0.08]];
  const gM: V3[] = [[0, -0.18, 0.03], [0, 0.45, 0.06], [0, 0.74, 0.2], [0, 1.04, 0.85], [0, 1.25, 1.45]];
  const gK = gI.map((p, i) => mix3(p, gM[i], male));
  const close = clamp01(pose.closeGroove) * (male > 0.01 ? 1 : 0);
  if (groove > 0.01) {
    const full = L(gK, 24);
    const k = Math.round(close * (full.length - 1));
    const open = full.slice(k);
    const shut = full.slice(0, k + 1);
    const id = fem > 0.5 ? 'baginaren-bestibulua' : 'ildo-urogenitala';
    if (open.length >= 3) {
      tube('groove', id, open, DARK, 0.08 + 0.1 * fem, groove, { tissue: 'membrane', groups: ['ildo-urogenitala'] }, 10);
      pts[id] = add(open[Math.floor(open.length / 2)], [0.12, 0, 0.08]);
      pts['ildo-urogenitala'] = pts[id];
    }
    if (shut.length >= 3) {
      // The closed part: the penile urethra, seen through the folds fused over it.
      tube('urethra', 'zakil-uretra', shut, '#f06a7a', 0.06, 1, { deep: '#7a1f2c' }, 8);
      pts['zakil-uretra'] = add(shut[Math.floor(shut.length * 0.6)], [0.12, 0, 0.06]);
    }
    // Female: the urethra's opening (front) and the vagina's (behind) inside the vestibule.
    if (fem > 0.01) {
      ball('uo', 'kanpoko-uretra-zuloa', [0, 0.45, 0.1], [0.06, 0.06, 0.04], '#140810', fem, {}, 6, 8);
      ball('vo', 'baginaren-zuloa', [0, -0.05, 0.1], [0.1, 0.13, 0.05], '#140810', fem, {}, 6, 10);
      pts['kanpoko-uretra-zuloa'] = [0.1, 0.48, 0.15];
      pts['baginaren-zuloa'] = [0.13, -0.05, 0.15];
    }
  }

  // ———— the folds: cloacal → urogenital (urethral) and anal; female: labia minora; male: fused over the urethra ————
  const folds = clamp01(pose.folds);
  if (folds > 0.01)
    for (const s of [-1, 1]) {
      const wid = [0.24, 0.27, 0.27, 0.25, 0.22].map((w) => w + 0.06 * fem);
      const line = L(gK.map((p, i): V3 => [s * wid[i], p[1], p[2] + 0.02]), 16);
      // Behind the closing front they meet in the midline (the seam).
      const front = line.map((p, j): V3 => [p[0] * (1 - 0.8 * clamp01((close - j / (line.length - 1)) / 0.1)), p[1], p[2]]);
      const k = Math.round(close * (front.length - 1));
      const id = fem > 0.5 ? 'ezpain-txikiak' : divide > 0.5 ? 'tolespen-urogenitalak' : 'kloaka-tolespenak';
      const extra = { groups: ['kloaka-tolespenak', 'tolespen-urogenitalak', 'ezpain-txikiak'] };
      if (front.length - k >= 2) tube(`fold${s}`, id, front.slice(k), FOLD, 0.1 * folds, 1, extra, 10);
      // The fused part is see-through: the urethra shows inside it.
      if (k >= 1) tube(`foldc${s}`, id, front.slice(0, k + 1), FOLD, 0.1 * folds, 0.45, extra, 10);
      // Behind the perineum the cloacal folds go on round the anal membrane (the anal folds).
      tube(`afold${s}`, 'kloaka-tolespenak', L([X(s, [0.24, -0.25, 0.05]), X(s, [0.28, -0.75, 0.05]), X(s, [0.12, -1.1, 0.04])], 10), FOLD, 0.08 * folds, divide > 0.5 ? 0.6 : 1, { groups: ['kloaka-tolespenak'] }, 8);
      if (s > 0) {
        pts[id] = add(front[Math.max(k, Math.round(front.length * 0.55))], [0.18, 0, 0.1]);
        pts['kloaka-tolespenak'] = id === 'kloaka-tolespenak' ? pts[id] : X(s, [0.4, -0.7, 0.1]);
        pts['tolespen-urogenitalak'] = pts[id];
        pts['ezpain-txikiak'] = pts[id];
      }
    }

  // ———— the genital (labioscrotal) swellings → labia majora or the scrotum ————
  const sw = clamp01(pose.swellings);
  if (sw > 0.01) {
    const sc = clamp01(pose.scrotum);
    for (const s of [-1, 1]) {
      const c: V3 = X(s, [lerp(0.78, 0.5, sc), lerp(0.0, -0.15, sc), 0.05 + 0.2 * sc]);
      const id = sc > 0.5 ? 'eskrotoa' : fem > 0.5 ? 'ezpain-nagusiak' : divide > 0.5 ? 'tolespen-ezpaineskrotalak' : 'goragune-genitalak';
      ball(`sw${s}`, id, c, [lerp(0.3, 0.55, sc) * sw * (1 - 0.15 * fem), lerp(0.7, 0.6, sc) * sw * (1 + 0.25 * fem), lerp(0.18, 0.45, sc) * sw], mixHex(SWELL, '#e3a483', sc), 0.95, { groups: ['goragune-genitalak', 'tolespen-ezpaineskrotalak', 'ezpain-nagusiak', 'eskrotoa'] });
      if (s > 0) {
        pts[id] = add(c, [0.35, 0.3, 0.15]);
        pts['goragune-genitalak'] = pts[id];
        pts['tolespen-ezpaineskrotalak'] = pts[id];
        pts['ezpain-nagusiak'] = pts[id];
        pts['eskrotoa'] = pts[id];
      }
    }
    if (sc > 0.5) {
      tube('sraphe', 'eskroto-errafea', L([[0, 0.25, 0.42], [0, -0.15, 0.55], [0, -0.55, 0.42]], 8), '#b06a50', 0.03, ss(0.5, 1, sc), {}, 6);
      pts['eskroto-errafea'] = [0.1, -0.35, 0.55];
    }
  }
  return { items, pts };
}

function ss(a: number, b: number, x: number) {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
}
