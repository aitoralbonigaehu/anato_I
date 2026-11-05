import { add, mix3, type V3 } from '@/lib/three-d/math';
import { curve3 } from '@/lib/three-d/mesh';
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
 * Own frame: x along the penis (the tip at +x), y up, z towards the viewer. Cut down the middle (see-through, as
 * the notes' figures show it in section).
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
  const axis = Array.from({ length: 40 }, (_, i): V3 => [-1.6 + (i / 39) * 4.75, 0, 0]);
  const rad = (u: number) => R(-1.6 + u * 4.75);
  // The shaft up to the coronal groove (x ≈ 1.72, axis point 27), the glans beyond it: one surface, no caps where they meet.
  const G = 27;
  tube('body', 'zakila', axis.slice(0, G + 1), BODY, (u) => rad(u * (G / 39)) - 0.06, 0.5, { tissue: 'mesenchyme', thin: 0.4 }, 16, [true, false]);
  // The body and the glans are the frame of every step: never faded with the step's lit set.
  items[items.length - 1].opacity = 0.5;
  tube('glans', 'glandea', axis.slice(G), mixHex(BODY, '#f7c4d2', 0.35), (u) => rad((G + u * (39 - G)) / 39) - 0.06, 0.55, { tissue: 'mesenchyme', thin: 0.4 }, 16, [false, true]);
  items[items.length - 1].opacity = 0.55;
  tube('skin', 'azaleko-ektodermoa', axis, ECTO, (u) => rad(u), 0.18, { thin: 0.6, outline: false, quiet: true });
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
