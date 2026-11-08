import { add, mix3, type V3 } from '@/lib/three-d/math';
import { curve3, grid } from '@/lib/three-d/mesh';
import { cachedMesh } from '@/lib/three-d/mesh-cache';
import { plate } from '@/lib/three-d/organic';
import type { Item3 } from '@/lib/three-d/scene';
import { blobParts, mixHex, tubeParts } from '@/components/scenes/week10/model3d';
import { T } from '@/components/scenes/week10/common';

/**
 * Topic 15, notes 2.4 (the notes' three longitudinal sections of the penis's end; endoderm yellow, ectoderm
 * blue): the penile urethra (endoderm) runs up to the coronal groove but not to the tip. From the ectoderm at the
 * tip of the glans a cord grows inwards until it meets the urethra; it hollows out (a tube): the external
 * urethral orifice; the urethra joins it, and the ectodermal tube widens: the navicular fossa. The outer part of
 * the urethra is ectodermal, as in almost every endodermal tube. Round the glans, lateral cords grow in from
 * the skin and open (vesicles): the prepuce.
 *
 * Own frame: x along the penis (the tip at +x), y up, z towards the viewer. Cut down the middle, as the notes'
 * figures show it in section: a solid (docs/quality/3d-quality-bar.md) — the back half whole, the cut face
 * (shaft and glans tissue, the skin as a band along its edge) facing the viewer, and the urethra, the cord and
 * the prepuce lying half in the cut.
 */

export interface GlansPose {
  /** The ectodermal cord growing in from the tip (0..1), hollowing out (0..1), joined to the urethra (0..1). */
  cord: number;
  hollow: number;
  join: number;
  /** The navicular fossa widening (0..1). */
  fossa: number;
  /** The lateral cords round the glans (0..1), opening into the prepuce (0..1). */
  prep: number;
  prepOpen: number;
}

export const GP0: GlansPose = { cord: 0, hollow: 0, join: 0, fossa: 0, prep: 0, prepOpen: 0 };

export interface GlansOpts {
  dim?: { ids: readonly string[]; k: number } | null;
}

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const darker = (c: string) => mixHex(c, '#000000', 0.55);
const L = (kps: readonly V3[], n = 16) => curve3(kps as V3[], n);
const grown = (line: V3[], g: number) => (g >= 0.999 ? line : line.slice(0, Math.max(2, Math.round(line.length * clamp01(g)))));

const ENDO = T.endo;
const ECTO = T.ecto;
const BODY = '#f0a1b4';

/** The penis's outline along x: its radius (the coronal groove is the waist before the glans). */
const R = (x: number) => (x < 1.5 ? 0.62 : x < 1.8 ? lerp(0.62, 0.52, (x - 1.5) / 0.3) : x < 3.2 ? 0.52 + 0.2 * Math.sin(((x - 1.8) / 1.4) * Math.PI * 0.62) * (x < 2.6 ? 1 : lerp(1, 0.3, (x - 2.6) / 0.6)) : 0.3);
/** The outline with a rounded tip: R, then closing over the end (x from X0 to X1). */
const X0 = -1.6, XT = 3.12, X1 = 3.4, XG = 1.72;
const RR = (x: number) => (x <= XT ? R(x) : R(XT) * Math.sqrt(Math.max(0, 1 - ((x - XT) / (X1 - XT)) ** 2)));
/** x along the outline, denser at the rounded tip. */
const xs = (a: number, b: number, n: number) => Array.from({ length: n + 1 }, (_, i) => {
  const t = i / n;
  return b > XT ? a + (b - a) * (1 - (1 - t) ** 1.6) : a + (b - a) * t;
});
/** The cut face of one part (shaft or glans): its outline in the plane z = 0. */
const face = (a: number, b: number): [number, number][] => {
  const top = xs(a, b, 40).map((x): [number, number] => [x, RR(x)]);
  const bot = xs(a, b, 40).reverse().map((x): [number, number] => [x, -RR(x)]);
  return [...top, ...bot];
};
const FACE_SHAFT = face(X0, XG);
const FACE_GLANS = face(XG, X1);
/** The back half of the surface between a and b (z ≤ 0), facing out. */
const backHalf = (a: number, b: number, nu: number) =>
  cachedMesh('glans-back-v1', [a, b, nu], () =>
    grid(nu, 12, (u, v) => {
      const x = b > XT ? a + (b - a) * (1 - (1 - u) ** 1.6) : a + (b - a) * u;
      const f = v * Math.PI;
      const r = RR(x);
      return [x, r * Math.cos(f), -r * Math.sin(f)];
    }, [(a + b) / 2, 0, -10]),
  );
/** The skin's edge round the cut. */
const RIM: V3[] = [...xs(X0, X1, 70).map((x): V3 => [x, RR(x), 0]), ...xs(X0, X1, 70).reverse().slice(1).map((x): V3 => [x, -RR(x), 0])];

export function glansModel(pose: GlansPose, o: GlansOpts = {}) {
  const items: Item3[] = [];
  const pts: Record<string, V3> = {};
  const dim = o.dim;
  const fade = (id: string, groups?: readonly string[]) => (!dim || dim.k <= 0.001 || dim.ids.includes(id) || (groups ?? []).some((g) => dim.ids.includes(g)) ? 1 : 1 - 0.75 * dim.k);
  const tube = (key: string, id: string, line: V3[], color: string, r: number | ((u: number) => number), op = 1, extra: Partial<Item3> = {}, sides = 16, caps: [boolean, boolean] = [true, true]) => {
    if (op <= 0.01 || line.length < 2) return;
    items.push({ key, id, ...tubeParts(line, { radius: typeof r === 'number' ? () => r : r, ref: [0, 1, 0], sides, capStart: caps[0], capEnd: caps[1] }), color, deep: darker(color), tissue: 'epithelium', opacity: op * fade(id, extra.groups), ...extra });
  };

  // ———— the body (mesoderm) with its ectodermal skin, cut in half; the glans at the tip ————
  // The shaft up to the coronal groove, the glans beyond it: the back halves and the cut faces. They are the
  // frame of every step (ground: never faded or greyed with the step's lit set).
  const GLANS = mixHex(BODY, '#f7c4d2', 0.35);
  const skinTone = (c: string) => mixHex(c, ECTO, 0.18);
  const sb = backHalf(X0, XG, 30), gb = backHalf(XG, X1, 26);
  items.push({ key: 'body', id: 'zakila', mesh: sb, hit: sb, color: skinTone(BODY), deep: darker(BODY), tissue: 'skin', opacity: 1, ground: true });
  items.push({ key: 'glans', id: 'glandea', mesh: gb, hit: gb, color: skinTone(GLANS), deep: darker(GLANS), tissue: 'skin', opacity: 1, ground: true });
  items.push({ key: 'bodyCut', id: 'zakila', ...plate('glans-cut-shaft-v1', FACE_SHAFT, 0, -0.04), color: BODY, deep: darker(BODY), tissue: 'mesenchyme', opacity: 1, ground: true, outline: false });
  items.push({ key: 'glansCut', id: 'glandea', ...plate('glans-cut-glans-v1', FACE_GLANS, 0.004, -0.04), color: GLANS, deep: darker(GLANS), tissue: 'mesenchyme', opacity: 1, ground: true, outline: false });
  tube('skin', 'azaleko-ektodermoa', RIM, ECTO, 0.035, 1, { quiet: true, ground: true, outline: false }, 8);
  pts['zakila'] = [-0.6, 0.66, -0.1];
  pts['glandea'] = [2.4, 0.6, -0.1];
  pts['azaleko-ektodermoa'] = [-1.1, 0.7, -0.05];
  pts['ildo-koronarioa'] = [1.7, 0.56, -0.05];
  // The coronal groove: a ring at the waist.
  const ring = Array.from({ length: 25 }, (_, i): V3 => {
    const a = Math.PI + (i / 24) * Math.PI;
    return [1.72, 0.55 * Math.cos(a) * -1, 0.55 * Math.sin(a)];
  });
  tube('groove', 'ildo-koronarioa', ring, '#c97a8a', 0.035, 0.9, {}, 8);

  // ———— the penile urethra (endoderm): up to the coronal groove, not to the tip ————
  const ur = L([[-1.6, -0.02, 0], [0.4, 0, 0], [1.65, 0, 0]], 14);
  tube('urethra', 'zakil-uretra', ur, ENDO, 0.11, 1, { deep: T.endoDeep });
  pts['zakil-uretra'] = [0.7, 0.15, 0.05];

  // ———— the ectodermal cord from the tip in; hollowed: the external urethral orifice; joined; the fossa ————
  const cord = clamp01(pose.cord);
  const hollow = clamp01(pose.hollow);
  const join = clamp01(pose.join);
  const fossa = clamp01(pose.fossa);
  if (cord > 0.01) {
    const tip: V3 = [3.12, 0, 0];
    const end = mix3([2.6, 0, 0], [1.62, 0, 0], join);
    const cl = grown(L([tip, mix3(tip, end, 0.5), end], 16), cord);
    const r = (u: number) => lerp(0.09, 0.12, hollow) + fossa * 0.12 * Math.exp(-Math.pow((u - 0.45) / 0.22, 2));
    const id = hollow > 0.5 ? (fossa > 0.5 ? 'hobi-nabikularra' : 'kanpoko-uretra-zuloa') : 'kordoi-ektodermikoa';
    tube('cord', id, cl, ECTO, r, 1, { groups: ['kordoi-ektodermikoa', 'kanpoko-uretra-zuloa', 'hobi-nabikularra'], deep: T.ectoDeep });
    if (hollow > 0.01) tube('lumen', id, cl.slice(1), '#0d1a3a', (u) => r(u) * 0.55, hollow * 0.9, { groups: ['kordoi-ektodermikoa'], outline: false }, 10);
    pts['kordoi-ektodermikoa'] = add(cl[Math.floor(cl.length / 2)], [0, 0.18, 0.05]);
    pts['kanpoko-uretra-zuloa'] = [3.15, 0.12, 0.05];
    pts['hobi-nabikularra'] = [2.35, 0.25, 0.05];
  }
  // The joined urethra pours into the fossa (the outer part ectodermal).
  if (join > 0.01) {
    items.push({ key: 'joint', id: 'zakil-uretra', ...blobParts({ center: [1.66, 0, 0], radii: [0.13, 0.13, 0.13], rings: 8, sides: 10 }), color: mixHex(ENDO, ECTO, 0.5), deep: darker(ENDO), tissue: 'epithelium', opacity: join * fade('zakil-uretra') });
  }

  // ———— the prepuce: lateral cords from the skin round the glans, opening into vesicles ————
  const prep = clamp01(pose.prep);
  if (prep > 0.01) {
    const open = clamp01(pose.prepOpen);
    for (const side of [1, -1]) {
      // Just under the glans's surface, from the coronal groove towards the tip.
      const x1 = lerp(1.9, 3.0, prep);
      const line = Array.from({ length: 12 }, (_, i): V3 => {
        const x = lerp(1.9, x1, i / 11);
        return [x, side * (R(x) - 0.1), 0];
      });
      tube(`prep${side}`, 'prepuzioa', line, ECTO, open > 0.01 ? 0.07 + 0.05 * open : 0.07, 1, { deep: T.ectoDeep }, 12);
      if (open > 0.01) tube(`prepl${side}`, 'prepuzioa', line.slice(1, -1), '#0d1a3a', 0.06 * open, 0.9, { outline: false }, 8);
    }
    pts['prepuzioa'] = [2.45, R(2.45) - 0.04, 0.1];
  }
  return { items, pts };
}
