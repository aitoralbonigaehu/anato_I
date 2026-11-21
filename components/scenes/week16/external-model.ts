import { add, mix3, norm, type V3 } from '@/lib/three-d/math';
import { curve3 } from '@/lib/three-d/mesh';
import type { Item3 } from '@/lib/three-d/scene';
import { vessel } from '@/lib/three-d/organic';
import { fieldSurface } from '@/lib/three-d/field-surface';
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
 *
 * Built to the quality bar (docs/quality/3d-quality-bar.md): everything grows out of the perineal skin. The skin is
 * one continuous surface (lib/three-d/field-surface.ts) that runs on past the frame and curves away like the body
 * it belongs to; the swellings and the perineum are regions of it that rise out of it, so there is no seam where a
 * mound meets the skin and no edge of a disc floating in the dark. The tubercle is the folds ridges that taper into it, the tubercle one shaft flaring from it with an
 * ovoid glans; unlit parts recede to grey but stay solid (the one see-through part is the fused folds over the
 * penile urethra, so the urethra shows inside).
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

/** Where the swellings are and how high they rise, for a pose (the skin's field and the raphe both read it). */
function swellingShape(pose: ExternalPose) {
  const sw = clamp01(pose.swellings);
  const sc = clamp01(pose.scrotum);
  const fem = clamp01(pose.female);
  return {
    sw,
    sc,
    cx: lerp(0.8, 0.5, sc),
    cy: lerp(0.0, -0.15, sc),
    // The footprint (a mound's half-widths) and its height: the scrotum's halves are larger, higher and meet.
    rx: 1.3 * lerp(0.3, 0.55, sc) * (1 - 0.15 * fem),
    ry: 1.25 * lerp(0.7, 0.6, sc) * (1 + 0.25 * fem),
    h: lerp(0.24, 0.74, sc) * (1 + 0.1 * fem),
  };
}

/** A full mound: 1 in its middle, falling to 0 with no slope at q = 1 (q: squared distance in footprints). */
const mound = (q: number) => (q >= 1 ? 0 : (1 - q) * (1 - q) * (1 + 2 * q));

/** Height of the perineal skin at (a, b) for a pose: a dome falling away past the frame, the swellings and the perineum on it. */
function skinZ(pose: ExternalPose, a: number, b: number): number {
  const r2 = a * a + b * b;
  const r = Math.sqrt(r2);
  let z = -0.05 - 0.035 * r2 - 0.07 * Math.max(0, r - 1.9) ** 2;
  const S = swellingShape(pose);
  if (S.sw > 0.01)
    for (const s of [-1, 1]) {
      const dx = (a - s * S.cx) / (S.rx * S.sw);
      const dy = (b - S.cy) / (S.ry * S.sw);
      z += S.h * S.sw * mound(dx * dx + dy * dy);
    }
  // The scrotal raphe: a shallow seam down the middle of the fused sac.
  if (S.sc > 0.01) z -= 0.05 * S.sc * Math.exp(-((a / 0.06) ** 2)) * mound(((b - S.cy) / (S.ry * 0.9)) ** 2);
  // The perineum: the low ridge of tissue between the two openings.
  const d = clamp01(pose.divide);
  if (d > 0.01) z += 0.06 * d * mound((a / 0.34) ** 2 + ((b + 0.5) / 0.2) ** 2);
  return z;
}

/** The perineal skin's regions, cut once in its own (material) coordinates; the skin itself runs on past the frame. */
const SKIN_R = 8;
const ell = (cx: number, cy: number, rx: number, ry: number) => (a: number, b: number) => 1 - Math.sqrt(((a - cx) / rx) ** 2 + ((b - cy) / ry) ** 2);
let skinField: ReturnType<typeof fieldSurface> | null = null;
const perinealSkin = () =>
  (skinField ??= fieldSurface({
    key: 'perineum16',
    nu: 120,
    nv: 70,
    // Polar: fine in the middle where the parts are, coarse towards the edge that curves away out of sight.
    chart: (u, v) => {
      const r = SKIN_R * v ** 1.7;
      const t = u * Math.PI * 2;
      return [r * Math.cos(t), r * Math.sin(t)];
    },
    wrapU: true,
    poleV0: true,
    flip: true,
    regions: [
      { name: 'skin', weight: () => 0 },
      // Each swelling's region covers where its mound goes, the scrotum's medial shift included.
      { name: 'swL', weight: ell(-0.72, -0.07, 0.7, 1.05) },
      { name: 'swR', weight: ell(0.72, -0.07, 0.7, 1.05) },
      { name: 'per', weight: ell(0, -0.5, 0.3, 0.19) },
    ],
    // As drawn when grown (swellings: 0.75 of the way to their colour; the perineum: its colour), so the melt is exact
    // then; while they grow, each item's `soft` follows its growth (no melt towards a colour not there yet).
    colors: { skin: '#f0c9b4', swL: mixHex('#f0c9b4', '#e9b48f', 0.75), swR: mixHex('#f0c9b4', '#e9b48f', 0.75), per: mixHex('#f0c9b4', '#d98a7a', 0.4) },
    // A wide melt: a region's colour fades into the skin's well before its edge (its mound is smaller than it).
    soft: 0.5,
  }));

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
  // Unlit parts recede to grey (the stage does it) but stay solid: faded, a mound or a ridge reads as glass. Only
  // the parts already see-through (op < 1) fade further.
  const fade = (id: string, op: number, groups?: readonly string[]) => (op >= 1 || !dim || dim.k <= 0.001 || dim.ids.includes(id) || (groups ?? []).some((g) => dim.ids.includes(g)) ? 1 : 1 - 0.75 * dim.k);
  const tube = (key: string, id: string | undefined, line: V3[], color: string, r: number | ((u: number) => number), op = 1, extra: Partial<Item3> = {}, sides = 14) => {
    if (op <= 0.01 || line.length < 2) return;
    items.push({ key, id, ...tubeParts(line, { radius: typeof r === 'number' ? () => r : r, ref: [1, 0, 0], sides, capStart: true, capEnd: true }), color, deep: darker(color), tissue: 'skin', opacity: op * (id ? fade(id, op, extra.groups) : 1), ...extra });
  };
  const ball = (key: string, id: string | undefined, c: V3, r: V3, color: string, op = 1, extra: Partial<Item3> = {}, rings = 12, sides = 18) => {
    if (op <= 0.01) return;
    items.push({ key, id, ...blobParts({ center: c, radii: r, rings, sides }), color, deep: darker(color), tissue: 'skin', opacity: op * (id ? fade(id, op, extra.groups) : 1), ...extra });
  };
  /** A ridge rising from the skin: thickest in its middle, tapering into the skin at both ends. */
  const ridge = (r: number) => (u: number) => r * (0.4 + 0.6 * Math.sin(Math.PI * Math.min(1, Math.max(0, u))));
  const fem = clamp01(pose.female);
  const male = clamp01(pose.male);
  const divide = clamp01(pose.divide);
  const groove = clamp01(pose.groove);

  // The perineal skin: one surface, the swellings and the perineum regions of it (see the file's head). The skin
  // around them is the ground (it keeps its colour when the unlit parts recede).
  const S = swellingShape(pose);
  const skin = perinealSkin().build([pose.swellings, pose.scrotum, pose.female, pose.divide], (a, b, out, at) => {
    out[at] = a;
    out[at + 1] = b;
    out[at + 2] = skinZ(pose, a, b);
  });
  items.push({ key: 'skin', ...skin.skin, color: SKIN, deep: '#a07060', tissue: 'skin', opacity: 1, outline: false, quiet: true, ground: true, soft: Math.max(S.sw, divide) });
  {
    const id = S.sc > 0.5 ? 'eskrotoa' : fem > 0.5 ? 'ezpain-nagusiak' : divide > 0.5 ? 'tolespen-ezpaineskrotalak' : 'goragune-genitalak';
    const on = S.sw > 0.05;
    const SWG = ['goragune-genitalak', 'tolespen-ezpaineskrotalak', 'ezpain-nagusiak', 'eskrotoa'];
    // Unlit, a swelling melts back towards the skin it rises from and is drawn as the skin is (ground): a skin-coloured
    // mound, not a brown patch.
    const swLit = !dim || dim.k <= 0.001 || dim.ids.includes(id) || SWG.some((g) => dim.ids.includes(g));
    const back = swLit ? 0 : 0.5 * dim!.k;
    const swC = mixHex(mixHex(SKIN, mixHex(SWELL, '#e3a483', S.sc), 0.75 * S.sw), SKIN, back);
    for (const side of ['swL', 'swR'] as const)
      items.push({ key: side, id: on ? id : undefined, ...skin[side], color: swC, deep: mixHex('#a06a50', '#a07060', back), tissue: 'skin', opacity: 1, outline: false, soft: S.sw, quiet: !on, ground: !on || !swLit, calm: true, groups: on ? ['goragune-genitalak', 'tolespen-ezpaineskrotalak', 'ezpain-nagusiak', 'eskrotoa'] : undefined });
    if (on) {
      const c: V3 = [S.cx, S.cy, skinZ(pose, S.cx, S.cy)];
      pts[id] = add(c, [0.35, 0.3, 0.12]);
      pts['goragune-genitalak'] = pts[id];
      pts['tolespen-ezpaineskrotalak'] = pts[id];
      pts['ezpain-nagusiak'] = pts[id];
      pts['eskrotoa'] = pts[id];
    }
    const perOn = divide > 0.3;
    items.push({ key: 'per', id: perOn ? 'perineoa' : undefined, ...skin.per, color: mixHex(SKIN, mixHex(SKIN, '#d98a7a', 0.4), divide), deep: '#a07060', tissue: 'skin', opacity: 1, outline: false, soft: divide, quiet: !perOn, ground: !perOn || !(!dim || dim.k <= 0.001 || dim.ids.includes('perineoa')), calm: true });
    if (perOn) pts['perineoa'] = [0.3, -0.5, skinZ(pose, 0, -0.5) + 0.05];
  }

  // ———— the genital tubercle → phallus (male) or the clitoris's glans (female) ————
  if (pose.tubercle > 0.01) {
    const g = pose.tubercle;
    const base: V3 = [0, 1.0, -0.06];
    const tip: V3 = [0, lerp(1.25, 1.1, fem) + 0.35 * male, lerp(0.35, 0.22, fem) + 1.35 * male];
    const line = L([base, add(base, [0, 0.12 + 0.2 * male, 0.2 + 0.6 * male]), tip], 12);
    const id = male > 0.5 ? 'faloa' : fem > 0.5 ? 'klitoria' : 'tuberkulu-genitala';
    // One shaft flaring out of the skin at its root; the glans an ovoid on its end (longer in the male).
    const rs = g * (1 - 0.35 * fem);
    const shaft = vessel(line, { r0: 0.34 * rs, r1: 0.25 * rs, flare: 0.6, flareLen: 0.3, ref: [1, 0, 0], sides: 20, capStart: false, capEnd: false });
    if (shaft) items.push({ key: 'tub', id, ...shaft, color: TUB, deep: darker(TUB), tissue: 'skin', opacity: 1, groups: ['tuberkulu-genitala', 'klitoria', 'faloa'] });
    const rg = 0.29 * rs;
    ball('glans', male > 0.5 ? 'glandea' : fem > 0.5 ? 'klitoria' : 'tuberkulu-genitala', add(tip, [0, 0.02 * male, 0.06 * male]), [rg * 1.02, rg * (1 + 0.1 * male), rg * (1 + 0.45 * male)], mixHex(TUB, '#f7a3c0', 0.5), 1, { groups: ['tuberkulu-genitala', 'klitoria', 'glandea'] });
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
      if (front.length - k >= 2) tube(`fold${s}`, id, front.slice(k), FOLD, ridge(0.11 * folds), 1, extra, 12);
      // The fused part: one ridge in the midline, see-through so the urethra shows inside it, its seam (the raphe)
      // a line on its surface that grows from behind forwards with the closing.
      if (k >= 1 && s > 0) {
        const shutLine = front.slice(0, k + 1).map((p): V3 => [0, p[1], p[2]]);
        tube('foldc', id, shutLine, FOLD, 0.13 * folds, 0.45, extra, 12);
        const seam = shutLine.map((p): V3 => {
          // Out of the surface: towards the viewer on the perineum, downwards (−y) under the phallus.
          const u = clamp01((p[2] - 0.1) / 0.5);
          const n = norm([0, -u, 1 - 0.85 * u]);
          return add(p, [0, n[1] * 0.125, n[2] * 0.125]);
        });
        tube('raphe', id, seam, '#b34d66', 0.022, 1, extra, 6);
      }
      // Behind the perineum the cloacal folds go on round the anal membrane (the anal folds).
      tube(`afold${s}`, 'kloaka-tolespenak', L([X(s, [0.24, -0.25, 0.0]), X(s, [0.28, -0.75, 0.0]), X(s, [0.12, -1.1, -0.01])], 12), FOLD, ridge(0.085 * folds * (divide > 0.5 ? 0.8 : 1)), 1, { groups: ['kloaka-tolespenak'] }, 10);
      if (s > 0) {
        pts[id] = add(front[Math.max(k, Math.round(front.length * 0.55))], [0.18, 0, 0.1]);
        pts['kloaka-tolespenak'] = id === 'kloaka-tolespenak' ? pts[id] : X(s, [0.4, -0.7, 0.1]);
        pts['tolespen-urogenitalak'] = pts[id];
        pts['ezpain-txikiak'] = pts[id];
      }
    }

  // ———— the genital (labioscrotal) swellings → labia majora or the scrotum: regions of the skin (above); the raphe ————
  if (S.sw > 0.01 && S.sc > 0.5) {
    const seam = [0.25, 0.0, -0.2, -0.45, -0.6].map((y): V3 => [0, y, skinZ(pose, 0, y) + 0.012]);
    tube('sraphe', 'eskroto-errafea', L(seam, 10), '#b06a50', 0.026, ss(0.5, 1, S.sc), {}, 6);
    pts['eskroto-errafea'] = [0.1, -0.35, skinZ(pose, 0, -0.35) + 0.05];
  }
  // One skin: a part that is not lit steps back without going dark (`Item3.calm`).
  for (const it of items) if (it.id && (it.tissue ?? 'skin') === 'skin') it.calm = true;
  return { items, pts };
}

function ss(a: number, b: number, x: number) {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
}
