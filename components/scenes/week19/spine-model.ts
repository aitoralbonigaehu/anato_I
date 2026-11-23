import type { V3 } from '@/lib/three-d/math';
import { curve3 } from '@/lib/three-d/mesh';
import { mergeParts, vessel, type Parts } from '@/lib/three-d/organic';
import type { Item3 } from '@/lib/three-d/scene';
import { blobParts, mixHex } from '@/components/scenes/week10/model3d';
import { C19, G19 } from './tones';

/**
 * Topic 19, section 8: the lower spine seen from behind, its arches taken away so the vertebral canal shows. The
 * column grows (lengthens) more than the cord: with `grow` the vertebrae's spacing scales up while the cord keeps its
 * place, so its end (the conus) is left at L1–L2; each pair of roots runs from its cord level to its own foramen,
 * horizontal at first, longer and more oblique the lower it is; below the conus only loose nerves, the cauda equina,
 * in a sac of fluid; the filum terminale holds the conus to the coccyx. Then the needles: a lumbar puncture into the
 * sac at L2, an epidural between the dura and the bone.
 *
 * Space: x the body's LEFT, y cranial, z ventral; the conus at [0, 0, −0.3] (sites-b.ts), 4 units per body unit.
 */

export interface SpinePose {
  /** The column grown (0: as long as the cord; 1: the adult). */
  grow: number;
  /** The dural sac and the arachnoid (0..1); the epidural layer (0..1). */
  sac: number;
  epi: number;
  /** The puncture needle (0..1 in), the fluid drops out (0..1); the epidural needle (0..1 in). */
  needle: number;
  drops: number;
  epiNeedle: number;
  /** The cauda equina's nerves pushed aside round the puncture needle (5.1/p10/s4) (0..1). */
  aside?: number;
}
export const SPP0: SpinePose = { grow: 0, sac: 0, epi: 0, needle: 0, drops: 0, epiNeedle: 0, aside: 0 };

export interface SpineOpts {
  dim?: { ids: readonly string[]; k: number } | null;
}

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const L = (kps: readonly V3[], n = 24) => curve3(kps as V3[], n);
const X = (s: number, p: V3): V3 => [s * p[0], p[1], p[2]];

const CZ = -0.3;
const CORD_R = 0.34;
const TOP = 1.92;
/** The vertebrae at the adult size, from T11 down: [name, height]. The sacrum and coccyx last. */
const VERTS: [string, number][] = [['T11', 0.6], ['T12', 0.6], ['L1', 0.72], ['L2', 0.72], ['L3', 0.72], ['L4', 0.72], ['L5', 0.72], ['S', 2.5], ['Co', 0.4]];
/** The column's length scale: as long as the cord at first, the adult's at the end. */
const scaleOf = (g: number) => lerp(0.3, 1, g);
function levels(g: number) {
  const k = scaleOf(g);
  let y = TOP;
  return VERTS.map(([name, h]) => {
    const top = y, bot = y - h * k;
    y = bot;
    return { name, top, bot };
  });
}
/** The cord's segments whose roots this view shows, and where they leave the cord (fixed: the cord does not grow). */
const SEGS: { name: string; origin: number; vert: string; sacral?: number }[] = [
  { name: 'T11', origin: 1.75, vert: 'T11' },
  { name: 'T12', origin: 1.42, vert: 'T12' },
  { name: 'L1', origin: 1.1, vert: 'L1' },
  { name: 'L2', origin: 0.86, vert: 'L2' },
  { name: 'L3', origin: 0.66, vert: 'L3' },
  { name: 'L4', origin: 0.48, vert: 'L4' },
  { name: 'L5', origin: 0.34, vert: 'L5' },
  { name: 'S1', origin: 0.24, vert: 'S', sacral: 0.12 },
  { name: 'S2', origin: 0.16, vert: 'S', sacral: 0.32 },
  { name: 'S3', origin: 0.1, vert: 'S', sacral: 0.52 },
  { name: 'S4', origin: 0.06, vert: 'S', sacral: 0.7 },
  { name: 'S5', origin: 0.03, vert: 'S', sacral: 0.86 },
];

const GROW_STEPS = 80;
type SpineGeo = { bone: Parts | null; cord: Parts | null; filum: Parts | null; roots: Parts | null; cauda: Parts | null; caudaLines: V3[][] };
const geoMemo = new Map<number, SpineGeo>();
/** Everything whose shape depends only on the column's growth: built once per growth step. */
function spineGeo(g: number): SpineGeo {
  let m = geoMemo.get(g);
  if (m) return m;
  if (geoMemo.size > GROW_STEPS + 1) geoMemo.clear();
  const lv = levels(g);
  const at = (n: string) => lv.find((v) => v.name === n)!;
  const bottom = lv[lv.length - 1].bot;
  // The column, its arches taken away: bodies in front, pedicles beside the canal.
  const bone: (Parts | null)[] = [];
  for (const v of lv) {
    const h = v.top - v.bot;
    const c = (v.top + v.bot) / 2;
    if (v.name === 'S' || v.name === 'Co') {
      const w = v.name === 'S' ? 1.25 : 0.4;
      bone.push(blobParts({ center: [0, c, 0.55], radii: [w, h * 0.5, 0.42], rings: 14, sides: 18 }));
      continue;
    }
    bone.push(blobParts({ center: [0, c, 0.95], radii: [0.85, h * 0.4, 0.5], rings: 12, sides: 18 }));
    for (const s of [1, -1]) bone.push(blobParts({ center: [s * 0.92, c + h * 0.08, 0.1], radii: [0.17, h * 0.22, 0.42], rings: 8, sides: 12 }));
  }
  // The cord (fixed), its conus, the filum terminale to the coccyx.
  // The thoracolumbar enlargement just above the conus (5.1/p7), then the cone.
  const cord = mergeParts([
    vessel(L([[0, TOP + 0.4, CZ], [0, 1.25, CZ]], 12), { r0: CORD_R, r1: CORD_R * 1.28, sides: 16, n: 14 }),
    vessel(L([[0, 1.25, CZ], [0, 0.6, CZ], [0, 0, CZ]], 16), { r0: CORD_R * 1.28, r1: 0.06, sides: 16, n: 18 }),
  ]);
  const filum = vessel(L([[0, 0, CZ], [0, lerp(0, bottom, 0.5), CZ - 0.02], [0, bottom + 0.1, 0.0]], 12), { r0: 0.04, r1: 0.03, sides: 8 });
  // The roots: from their cord level to their own foramen.
  const upper: (Parts | null)[] = [], cauda: (Parts | null)[] = [], caudaLines: V3[][] = [];
  for (const s of SEGS) {
    const v = at(s.vert);
    const exit = s.sacral !== undefined ? lerp(v.top, v.bot, s.sacral) : v.bot + 0.04;
    for (const side of [1, -1]) {
      const o: V3 = [side * CORD_R * 0.8, s.origin, CZ];
      const f: V3 = [side * 1.05, exit, CZ + 0.15];
      const long = s.origin - exit;
      const line = long < 0.3 ? L([o, [side * 0.7, (s.origin + exit) / 2, CZ + 0.05], f], 10) : L([o, [side * (0.12 + 0.04 * Math.abs(SEGS.indexOf(s) - 6)), s.origin - 0.3, CZ], [side * 0.26, lerp(s.origin, exit, 0.75), CZ], [side * 0.62, exit + 0.12, CZ + 0.05], f], 22);
      const p = vessel(line, { r0: 0.05, r1: 0.045, sides: 8 });
      const inCauda = s.origin < 0.3 && g > 0.3;
      (inCauda ? cauda : upper).push(p);
      if (inCauda) caudaLines.push(line);
      // The ganglion at the foramen and the nerve going out.
      upper.push(blobParts({ center: [side * 1.0, exit, CZ + 0.14], radii: [0.12, 0.09, 0.09], rings: 6, sides: 8 }));
      upper.push(vessel(L([f, [side * 1.6, exit - 0.25, CZ + 0.3]], 4), { r0: 0.07, r1: 0.06, sides: 8 }));
    }
  }
  m = { bone: mergeParts(bone), cord, filum, roots: mergeParts(upper), cauda: mergeParts(cauda), caudaLines };
  geoMemo.set(g, m);
  return m;
}

/** The cauda's nerves bent away from the needle at height `y` (x ≈ 0): `k` 0..1, in tenths (memoised). */
const asideMemo = new Map<string, Parts | null>();
function caudaAside(geo: SpineGeo, g: number, y: number, k: number): Parts | null {
  const key = `${g},${k}`;
  let m = asideMemo.get(key);
  if (m !== undefined) return m;
  if (asideMemo.size > 24) asideMemo.clear();
  m = mergeParts(
    geo.caudaLines.map((line) =>
      vessel(
        line.map(([x, yy, z]): V3 => {
          const fall = Math.exp(-(((yy - y) / 0.45) ** 2));
          const sx = x >= 0.05 ? 1 : -1;
          return [x + sx * 0.22 * k * fall * Math.max(0, 1 - Math.abs(x - 0.05) / 0.5), yy, z];
        }),
        { r0: 0.05, r1: 0.045, sides: 8 },
      ),
    ),
  );
  asideMemo.set(key, m);
  return m;
}

export function spineModel(pose: SpinePose, o: SpineOpts = {}) {
  const items: Item3[] = [];
  const pts: Record<string, V3> = {};
  const dim = o.dim && o.dim.k > 0.001 ? o.dim : null;
  const k = dim ? dim.k : 0;
  const lit = (id: string | undefined, groups?: readonly string[]) => !dim || (!!id && dim.ids.includes(id)) || (groups ?? []).some((g) => dim.ids.includes(g));
  const put = (key: string, id: string | undefined, parts: Parts | null, color: string, deep: string, extra: Partial<Item3> = {}) => {
    if (!parts || (extra.opacity ?? 1) <= 0.01) return;
    const off = !!dim && !!id && !extra.ground && !lit(id, extra.groups);
    items.push({ key, id, ...parts, color: off ? mixHex(color, '#c4bcbb', 0.45 * k) : color, deep: off ? mixHex(deep, '#7c7472', 0.45 * k) : deep, tissue: 'nerve', ...extra });
  };
  // The column's growth in small steps, so a played stage rebuilds its geometry only when a step is crossed.
  const g = Math.round(clamp01(pose.grow) * GROW_STEPS) / GROW_STEPS;
  const lv = levels(g);
  const at = (n: string) => lv.find((v) => v.name === n)!;
  const bottom = lv[lv.length - 1].bot;

  const geo = spineGeo(g);
  put('bone', 'ornoak', geo.bone, G19.bone, G19.boneDeep, { tissue: 'bone', calm: true });
  for (const n of ['T12', 'L1', 'L2', 'L3', 'L4', 'L5']) pts[`orno-${n}`] = [-1.25, (at(n).top + at(n).bot) / 2, 0.4];
  pts['ornoak'] = [-1.1, (at('L3').top + at('L3').bot) / 2, 0.6];
  pts['sakroa'] = [-0.9, (at('S').top + at('S').bot) / 2, 0.2];

  // ———— the cord (fixed), its conus, the filum terminale to the coccyx ————
  put('cord', 'ornomuina', geo.cord, C19.brain, C19.brainDeep, { tissue: 'neural', groups: ['nerbio-sistema-zentrala', 'ornomuinaren-konoa'] });
  pts['ornomuina'] = [0.2, 1.3, CZ - 0.32];
  pts['ornomuinaren-konoa'] = [0.08, 0.15, CZ - 0.2];
  put('filum', 'zuntz-terminala', geo.filum, mixHex(C19.brain, '#ffffff', 0.25), C19.brainDeep, { tissue: 'tendon' });
  pts['zuntz-terminala'] = [0.05, lerp(0, bottom, 0.55), CZ - 0.05];

  // ———— the roots: from their cord level to their own foramen ————
  put('roots', 'nerbio-espinalak', geo.roots, C19.nerve, C19.nerveDeep, {});
  const ak = Math.round(clamp01(pose.aside ?? 0) * 10) / 10;
  const l2c = (at('L2').top + at('L2').bot) / 2 - 0.15;
  put('cauda', 'zaldi-buztana', ak > 0 ? caudaAside(geo, g, l2c, ak) : geo.cauda, mixHex(C19.nerve, '#fff2b0', 0.2), C19.nerveDeep, { groups: ['nerbio-espinalak'] });
  pts['nerbio-espinalak'] = [1.45, at('T12').bot - 0.15, CZ + 0.2];
  pts['zaldi-buztana'] = [0.2, lerp(0, bottom, 0.3), CZ - 0.1];

  // ———— the dural sac (dura, the arachnoid inside), the epidural fat round it ————
  const sac = clamp01(pose.sac);
  if (sac > 0.01) {
    const sacEnd = lerp(at('S').top, at('S').bot, 0.32);
    const line = L([[0, TOP + 0.4, CZ], [0, 0, CZ], [0, sacEnd + 0.3, CZ]], 20);
    put('dura', 'dura-materra', vessel(line, { r0: 0.62, r1: 0.58, sides: 22, n: 26, capEnd: true, capStart: false }), C19.dura, C19.duraDeep, { opacity: 0.32 * sac, tissue: 'membrane', groups: ['meningeak', 'poltsa-durala'] });
    put('arach', 'araknoidesa', vessel(line, { r0: 0.56, r1: 0.52, sides: 22, n: 26, capEnd: true, capStart: false }), C19.arach, C19.arachDeep, { opacity: 0.22 * sac, tissue: 'membrane', groups: ['meningeak'] });
    put('csf', 'likido-zefalorrakideoa', vessel(L([[0, 0.1, CZ], [0, sacEnd + 0.32, CZ]], 10), { r0: 0.5, r1: 0.46, sides: 18 }), C19.csf, C19.csfDeep, { opacity: 0.22 * sac, tissue: 'membrane', outline: false });
    pts['dura-materra'] = [0.6, lerp(0, sacEnd, 0.2), CZ - 0.2];
    pts['araknoidesa'] = [-0.5, lerp(0, sacEnd, 0.35), CZ - 0.2];
    pts['likido-zefalorrakideoa'] = [-0.3, lerp(0, sacEnd, 0.6), CZ - 0.3];
    pts['poltsa-durala'] = [0.45, lerp(0, sacEnd, 0.8), CZ - 0.3];
  }
  const epi = clamp01(pose.epi);
  if (epi > 0.01) {
    const fat: (Parts | null)[] = [];
    for (let i = 0; i < 14; i++) {
      const y = lerp(TOP, at('S').top, i / 13);
      for (const s of [1, -1]) fat.push(blobParts({ center: [s * 0.7, y, CZ - 0.42], radii: [0.12, 0.16, 0.1], rings: 6, sides: 8 }));
    }
    put('epi', 'eremu-epidurala', mergeParts(fat), '#f2d79a', '#8a6a2a', { opacity: 0.8 * epi, tissue: 'mesenchyme' });
    pts['eremu-epidurala'] = [0.72, lerp(TOP, at('S').top, 0.5), CZ - 0.5];
  }

  // ———— the needles, from behind ————
  const l2 = (at('L2').top + at('L2').bot) / 2 - 0.15;
  const needle = clamp01(pose.needle);
  if (needle > 0.01) {
    const tip: V3 = [0.05, l2, lerp(-3.4, CZ - 0.18, needle)];
    put('needle', 'puntzio-orratza', vessel(L([[0.05, l2 - 0.1, -4.6], tip], 4), { r0: 0.045, r1: 0.03, sides: 10 }), '#d6dbe2', '#5a6270', { tissue: 'bone' });
    pts['puntzio-orratza'] = [0.05, l2 - 0.05, -2.2];
    const dr = clamp01(pose.drops);
    if (dr > 0.01) {
      const drops: (Parts | null)[] = [];
      for (let i = 0; i < 4; i++) {
        const u = clamp01(dr * 1.3 - i * 0.12);
        if (u > 0) drops.push(blobParts({ center: [0.05, l2 - 0.1 - 0.2 * Math.sin(u * 2), lerp(-0.7, -4.4, u)], radii: [0.08, 0.1, 0.08], rings: 6, sides: 8 }));
      }
      put('drops', 'likido-zefalorrakideoa', mergeParts(drops), '#bfe8ff', C19.csfDeep, { tissue: 'membrane' });
    }
  }
  const en = clamp01(pose.epiNeedle);
  if (en > 0.01) {
    const y = l2 + 0.5;
    const tip: V3 = [0.62, y, lerp(-3.4, CZ - 0.48, en)];
    put('epi-needle', 'anestesia-epidurala', vessel(L([[0.62, y - 0.1, -4.6], tip], 4), { r0: 0.05, r1: 0.032, sides: 10 }), '#e8d29a', '#6a5a30', { tissue: 'bone' });
    pts['anestesia-epidurala'] = [0.62, y, -2.2];
  }
  return { items, pts };
}
