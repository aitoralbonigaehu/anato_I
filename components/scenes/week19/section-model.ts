import type { V3 } from '@/lib/three-d/math';
import { curve3, type Mesh } from '@/lib/three-d/mesh';
import { cachedMesh } from '@/lib/three-d/mesh-cache';
import { mergeParts, vessel, type Parts } from '@/lib/three-d/organic';
import type { Item3 } from '@/lib/three-d/scene';
import { blobParts, mixHex } from '@/components/scenes/week10/model3d';
import { C19, G19 } from './tones';

/**
 * Topic 19, sections 6 (the neural crest and its derivatives) and 7 (the cord's development): one block of the
 * embryo's back cut across at a thoracic level, drawn at the cord's size (its canal at the origin, sites-b.ts), so the
 * adult cord's section and this one sit on each other.
 *
 * - `fold` 0→1: the neural plate in the ectoderm curls up into the tube (each half an arc whose curvature grows), the
 *   crest at the folds' edges; the ectoderm closes over the tube.
 * - `crest`: the crest cells lie as a plate on the tube, split, slide down each side and gather into the spinal ganglia;
 *   `drg`, `chain`, `preaortic`, `adrenal`, `melano`, `schwann`: the derivatives settle, one by one.
 * - `mature` −1 → 0 → 1: the closed tube of the 4th week thickens into the 5th-week wall (neuroepithelium, mantle,
 *   marginal layers; a diamond lumen whose lateral corner is the sulcus limitans; alar and basal plates, roof and floor),
 *   which becomes the 3rd-month cord: the grey H inside, the white outside, the small central canal, the fissures.
 *
 * Frame 'block': x the embryo's LEFT, y dorsal, z cranial. Every band is a ring between two radius functions round
 * the canal, extruded along z: the same items morph from the 4th week to the 3rd month.
 */

export interface SectionPose {
  fold: number;
  crest: number;
  drg: number;
  chain: number;
  preaortic: number;
  adrenal: number;
  melano: number;
  schwann: number;
  mature: number;
  /** Layer colours (0..1): neuroepithelium / mantle / marginal told apart. */
  layers: number;
  /** Plate colours (0..1): alar (sensory, light) and basal (motor, dark), roof and floor. */
  plates: number;
  /** Neuroblasts leaving the neuroepithelium for the mantle (0..1). */
  blasts: number;
  /** The lateral horns (0..1, T1–L2). */
  lat: number;
}
export const SP0: SectionPose = { fold: 0, crest: 0, drg: 0, chain: 0, preaortic: 0, adrenal: 0, melano: 0, schwann: 0, mature: -1, layers: 0, plates: 0, blasts: 0, lat: 0 };

export interface SectionOpts {
  dim?: { ids: readonly string[]; k: number } | null;
}

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const ss = (a: number, b: number, x: number) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const L = (kps: readonly V3[], n = 24) => curve3(kps as V3[], n);
const X = (s: number, p: V3): V3 => [s * p[0], p[1], p[2]];
const r3 = (x: number) => Math.round(x * 60) / 60;

/** Half the block's length along z. */
const H = 0.6;
/** The tube in the 4th week: its wall's mid-radius and thickness (the folded plate's). */
const R4 = 0.51;
const T4 = 0.18;
/** The plate's half-width: closing, each half becomes half a circle. */
const W = Math.PI * R4;

// ———————————————————————— a ring band, extruded ————————————————————————

const NA = 144;
type Radius = (th: number) => number;
/**
 * The band between rIn(θ) and rOut(θ) for θ in [a0, a1] (θ = 0 the embryo's left, π/2 dorsal), from z −H to +H:
 * cranial and caudal faces, the inner and outer walls (and the two ends when the band is a wedge).
 */
function band(rIn: Radius, rOut: Radius, a0: number, a1: number): Mesh {
  const n = Math.max(4, Math.round((NA * (a1 - a0)) / (2 * Math.PI)));
  const full = a1 - a0 > 2 * Math.PI - 1e-6;
  const pos: number[] = [], nrm: number[] = [], uv: number[] = [], idx: number[] = [];
  const ring = (r: Radius) => Array.from({ length: n + 1 }, (_, i) => {
    const t = a0 + ((a1 - a0) * i) / n;
    const R = r(t);
    return [R * Math.cos(t), R * Math.sin(t)] as [number, number];
  });
  const I = ring(rIn), O = ring(rOut);
  const v = (x: number, y: number, z: number, nx: number, ny: number, nz: number) => {
    pos.push(x, y, z);
    nrm.push(nx, ny, nz);
    uv.push(x * 0.5, y * 0.5);
    return pos.length / 3 - 1;
  };
  // Faces (cranial +z, caudal −z).
  for (const [z, s] of [[H, 1], [-H, -1]] as const) {
    const base = pos.length / 3;
    for (let i = 0; i <= n; i++) {
      v(I[i][0], I[i][1], z, 0, 0, s);
      v(O[i][0], O[i][1], z, 0, 0, s);
    }
    for (let i = 0; i < n; i++) {
      const a = base + i * 2, b = a + 1, c = a + 2, d = a + 3;
      if (s > 0) idx.push(a, b, c, b, d, c);
      else idx.push(a, c, b, b, c, d);
    }
  }
  // Walls: outer facing out, inner facing in.
  const wall = (P: [number, number][], out: boolean) => {
    const base = pos.length / 3;
    for (let i = 0; i <= n; i++) {
      const p = P[Math.max(0, i - 1)], q = P[Math.min(n, i + 1)];
      let tx = q[0] - p[0], ty = q[1] - p[1];
      const l = Math.hypot(tx, ty) || 1;
      tx /= l;
      ty /= l;
      // The normal to the ring, pointing away from the centre (out) or towards it (in).
      const nx = out ? ty : -ty, ny = out ? -tx : tx;
      v(P[i][0], P[i][1], H, nx, ny, 0);
      v(P[i][0], P[i][1], -H, nx, ny, 0);
    }
    for (let i = 0; i < n; i++) {
      const a = base + i * 2, b = a + 1, c = a + 2, d = a + 3;
      if (out) idx.push(a, b, c, b, d, c);
      else idx.push(a, c, b, b, c, d);
    }
  };
  wall(O, true);
  wall(I, false);
  if (!full)
    for (const [i, s] of [[0, -1], [n, 1]] as const) {
      const t = i === 0 ? a0 : a1;
      const nx = -Math.sin(t) * s, ny = Math.cos(t) * s;
      const a = v(I[i][0], I[i][1], H, nx, ny, 0), b = v(O[i][0], O[i][1], H, nx, ny, 0), c = v(I[i][0], I[i][1], -H, nx, ny, 0), d = v(O[i][0], O[i][1], -H, nx, ny, 0);
      if (s > 0) idx.push(a, b, c, b, d, c);
      else idx.push(a, c, b, b, c, d);
    }
  return { pos: new Float32Array(pos), nrm: new Float32Array(nrm), uv: new Float32Array(uv), idx: new Uint32Array(idx) };
}

// ———————————————————————— the wall's radius functions, by `mature` ————————————————————————

const gauss = (d: number, w: number) => Math.exp(-((d / w) ** 2));
/** Angular distance. */
const ad = (a: number, b: number) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
const D = Math.PI / 180;
/** The 4th-week circle, the 5th-week diamond, the 3rd-month canal. */
function lumen(m: number): Radius {
  return (t) => {
    const circle = R4 - T4 / 2;
    const diamond = 1 / (Math.abs(Math.cos(t)) / 0.15 + Math.abs(Math.sin(t)) / 0.62);
    const canal = 0.06;
    return m < 0 ? lerp(diamond, circle, -m) : lerp(diamond, canal, ss(0, 1, m));
  };
}
/** The neuroepithelium's (later the ependymal layer's) outer edge. */
function neuroEdge(m: number): Radius {
  const lu = lumen(m);
  return (t) => lu(t) + (m < 0 ? lerp(0.16, 0.06, -m) : lerp(0.16, 0.035, ss(0, 0.8, m)));
}
/** The mantle's outer edge (grey matter): none at the roof and floor; the H at the 3rd month. */
function greyEdge(m: number, lat: number): Radius {
  const ne = neuroEdge(m);
  return (t) => {
    const side = ss(0.18, 0.75, Math.abs(Math.cos(t)));
    const week5 = 0.26 * side;
    const h = 0.1 + 0.62 * Math.max(gauss(ad(t, 62 * D), 0.2), gauss(ad(t, 118 * D), 0.2)) + 0.46 * Math.max(gauss(ad(t, -42 * D), 0.38), gauss(ad(t, -138 * D), 0.38)) + 0.2 * lat * Math.max(gauss(ad(t, 4 * D), 0.12), gauss(ad(t, 176 * D), 0.12));
    const grey = m < 0 ? week5 * (1 + m) : lerp(week5, h, ss(0.1, 1, m));
    return ne(t) + Math.max(0.004, grey);
  };
}
/** The outer edge: a tall oval → a wide oval with the deep ventral fissure and the shallow dorsal sulcus. */
function outerEdge(m: number): Radius {
  return (t) => {
    const c = Math.cos(t), s = Math.sin(t);
    const oval = (a: number, b: number) => 1 / Math.sqrt((c / a) ** 2 + (s / b) ** 2);
    const r4 = R4 + T4 / 2;
    const r5 = oval(0.78, 0.98);
    const r3m = oval(1.05, 0.88) - 0.42 * gauss(ad(t, -90 * D), 0.05) - 0.22 * gauss(ad(t, 90 * D), 0.03);
    return m < 0 ? lerp(r5, r4, -m) : lerp(r5, r3m, ss(0, 1, m));
  };
}
const offset = (r: Radius, d: number): Radius => (t) => r(t) + d;
const atLeast = (r: Radius, floor: Radius, gap: number): Radius => (t) => Math.max(r(t), floor(t) + gap);

/** The angular parts: roof (dorsal wedge), alar (dorsal sides), basal (ventral sides), floor (ventral wedge). */
const ROOF: [number, number] = [76 * D, 104 * D];
const FLOOR: [number, number] = [-104 * D, -76 * D];
const ALAR: [number, number][] = [[2 * D, 76 * D], [104 * D, 178 * D]];
const BASAL: [number, number][] = [[-178 * D, -104 * D], [-76 * D, -2 * D]];
const LIMITANS: [number, number][] = [[-2 * D, 2 * D], [178 * D, 182 * D]];

const bandCache = new Map<string, Mesh>();
function bandAt(key: string, rIn: Radius, rOut: Radius, a0: number, a1: number): Mesh {
  let m = bandCache.get(key);
  if (!m) {
    if (bandCache.size > 600) bandCache.clear();
    bandCache.set(key, (m = band(rIn, rOut, a0, a1)));
  }
  return m;
}
const bands = (key: string, rIn: Radius, rOut: Radius, spans: [number, number][]): Parts => {
  const meshes = spans.map((s, i) => bandAt(`${key}:${i}`, rIn, rOut, s[0], s[1]));
  const p = mergeParts(meshes.map((m) => ({ mesh: m, hit: m })))!;
  return p;
};

// ———————————————————————— the folding plate (before the tube closes) ————————————————————————

/** A point of the folding plate: arc position s (−W..W), across offset o (thickness), fold f. */
function plateAt(s: number, o: number, f: number): [number, number] {
  const k = Math.max(1e-4, (f * Math.PI) / W);
  const a = s * k;
  const r = 1 / k;
  // Mid-line of the band: a circle arc of radius r touching y = −R4 at s = 0.
  const x = r * Math.sin(a), y = -R4 + r * (1 - Math.cos(a));
  // The band's normal (towards the arc's centre is inwards).
  const nx = -Math.sin(a), ny = Math.cos(a);
  return [x - nx * o, y - ny * o];
}
function plateMesh(f: number, s0: number, s1: number): Mesh {
  const n = 40, m = 3;
  const pos: number[] = [], nrm: number[] = [], uv: number[] = [], idx: number[] = [];
  const pushQuadStrip = (P: [number, number][], N: [number, number][], flip: boolean) => {
    const base = pos.length / 3;
    for (let i = 0; i < P.length; i++)
      for (const z of [H, -H]) {
        pos.push(P[i][0], P[i][1], z);
        nrm.push(N[i][0], N[i][1], 0);
        uv.push(P[i][0] * 0.5, z * 0.5);
      }
    for (let i = 0; i + 1 < P.length; i++) {
      const a = base + i * 2, b = a + 1, c = a + 2, d = a + 3;
      if (flip) idx.push(a, c, b, b, c, d);
      else idx.push(a, b, c, b, d, c);
    }
  };
  const S = Array.from({ length: n + 1 }, (_, i) => lerp(s0, s1, i / n));
  const k = Math.max(1e-4, (f * Math.PI) / W);
  const nrmOf = (s: number): [number, number] => [-Math.sin(s * k), Math.cos(s * k)];
  // Upper (dorsal/inner) and lower surfaces.
  pushQuadStrip(S.map((s) => plateAt(s, T4 / 2, f)), S.map((s) => nrmOf(s)), false);
  pushQuadStrip(S.map((s) => plateAt(s, -T4 / 2, f)), S.map((s) => { const q = nrmOf(s); return [-q[0], -q[1]] as [number, number]; }), true);
  // The cranial and caudal faces.
  for (const [z, sg] of [[H, 1], [-H, -1]] as const) {
    const base = pos.length / 3;
    for (let i = 0; i <= n; i++)
      for (let j = 0; j <= m; j++) {
        const p = plateAt(S[i], lerp(-T4 / 2, T4 / 2, j / m), f);
        pos.push(p[0], p[1], z);
        nrm.push(0, 0, sg);
        uv.push(p[0] * 0.5, p[1] * 0.5);
      }
    for (let i = 0; i < n; i++)
      for (let j = 0; j < m; j++) {
        const a = base + i * (m + 1) + j, b = a + 1, c = a + (m + 1), d = c + 1;
        if (sg > 0) idx.push(a, c, b, b, c, d);
        else idx.push(a, b, c, b, d, c);
      }
  }
  return { pos: new Float32Array(pos), nrm: new Float32Array(nrm), uv: new Float32Array(uv), idx: new Uint32Array(idx) };
}

/** The surface ectoderm: attached at the folds' tips while open, a sheet over the tube once closed. */
function ectoMesh(f: number): Mesh {
  const tip = plateAt(W, 0, f);
  const n = 30;
  const pts: [number, number][] = [];
  const closed = ss(0.88, 1, f);
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    // From the fold tip outwards (open), or from the midline over the tube (closed).
    const xOpen = lerp(tip[0], 3.2, u), yOpen = lerp(tip[1], -R4 + 0.02 + 0.04 * u, ss(0, 0.6, u));
    const xC = lerp(0, 3.2, u), yC = lerp(R4 + 0.48, 0.42, ss(0.2, 1, u));
    pts.push([lerp(xOpen, xC, closed), lerp(yOpen, yC, closed)]);
  }
  const all = [...pts.slice(1).reverse().map(([x, y]) => [-x, y] as [number, number]), ...pts];
  const half = 0.05;
  const pos: number[] = [], nrm: number[] = [], uv: number[] = [], idx: number[] = [];
  const N = all.length;
  for (const off of [half, -half]) {
    const base = pos.length / 3;
    for (let i = 0; i < N; i++) {
      const p = all[Math.max(0, i - 1)], q = all[Math.min(N - 1, i + 1)];
      let tx = q[0] - p[0], ty = q[1] - p[1];
      const l = Math.hypot(tx, ty) || 1;
      tx /= l;
      ty /= l;
      const nx = -ty * Math.sign(off), ny = tx * Math.sign(off);
      for (const z of [H, -H]) {
        pos.push(all[i][0] - ty * off, all[i][1] + tx * off, z);
        nrm.push(nx, ny, 0);
        uv.push(all[i][0] * 0.5, z);
      }
    }
    for (let i = 0; i + 1 < N; i++) {
      const a = base + i * 2, b = a + 1, c = a + 2, d = a + 3;
      if (off > 0) idx.push(a, b, c, b, d, c);
      else idx.push(a, c, b, b, c, d);
    }
  }
  return { pos: new Float32Array(pos), nrm: new Float32Array(nrm), uv: new Float32Array(uv), idx: new Uint32Array(idx) };
}

// ———————————————————————— context: notochord, paraxial mesoderm, aorta, adrenal ————————————————————————

const prism = (key: string, c: [number, number], rx: number, ry: number): Parts => {
  const m = cachedMesh(`sec19-${key}`, [rx, ry], () => band(() => 0.0001, (t) => 1 / Math.sqrt((Math.cos(t) / rx) ** 2 + (Math.sin(t) / ry) ** 2), -Math.PI, Math.PI));
  const moved: Mesh = { ...m, pos: Float32Array.from(m.pos, (v, i) => (i % 3 === 0 ? v + c[0] : i % 3 === 1 ? v + c[1] : v)) };
  return { mesh: moved, hit: moved };
};
const ctxCache = new Map<string, Parts>();
const ctx = (key: string, c: [number, number], rx: number, ry: number) => {
  let p = ctxCache.get(key);
  if (!p) ctxCache.set(key, (p = prism(key, c, rx, ry)));
  return p;
};

/** Where the derivatives settle (left side; the right mirrors). */
const DRG: V3 = [1.12, 0.12, 0];
const CHAIN: V3 = [0.78, -1.45, 0];
const PREAORTIC: V3 = [0, -2.62, 0];
const ADRENAL: V3 = [1.55, -2.35, 0];
const MELANO: V3 = [2.2, 0.62, 0];
const CREST_TOP: V3 = [0.22, R4 + 0.2, 0];
const ROUTE = (to: V3, via: V3): V3[] => L([[0.42, R4 + 0.12, 0], via, to], 24);

export function sectionModel(pose: SectionPose, o: SectionOpts = {}) {
  const items: Item3[] = [];
  const pts: Record<string, V3> = {};
  const dim = o.dim && o.dim.k > 0.001 ? o.dim : null;
  const k = dim ? dim.k : 0;
  const lit = (id: string | undefined, groups?: readonly string[]) => !dim || (!!id && dim.ids.includes(id)) || (groups ?? []).some((g) => dim.ids.includes(g));
  const put = (key: string, id: string | undefined, parts: Parts | null, color: string, deep: string, extra: Partial<Item3> = {}) => {
    if (!parts || (extra.opacity ?? 1) <= 0.01) return;
    const off = !!dim && !!id && !extra.ground && !lit(id, extra.groups);
    items.push({ key, id, ...parts, color: off ? mixHex(color, '#c4bcbb', 0.45 * k) : color, deep: off ? mixHex(deep, '#7c7472', 0.45 * k) : deep, tissue: 'epithelium', ...extra });
  };
  const fold = clamp01(pose.fold);
  const m = Math.max(-1, Math.min(1, pose.mature));
  const mq = r3(m);
  const layers = clamp01(pose.layers), plates = clamp01(pose.plates), lat = clamp01(pose.lat);
  const tube = C19.tube, tubeD = C19.tubeDeep;

  // ———— context: the embryo's back, cut across ————
  const early = 1 - ss(0.2, 0.9, pose.crest + pose.drg);
  put('noto', 'notokorda', ctx('noto', [0, -1.05], 0.16, 0.16), '#b27ae8', '#4b2a78', { tissue: 'mesenchyme', opacity: 1 - ss(0.5, 1, m + 1) * 0.6 });
  for (const s of [1, -1]) put(`somite${s}`, 'mesodermo-paraxiala', ctx(`som${s}`, [s * 1.75, -0.35], 0.62, 0.55), mixHex(G19.cut, '#e3b8a0', 0.4), G19.cutDeep, { tissue: 'mesenchyme', quiet: true, opacity: 0.85 * early });
  const aortaY = lerp(-1.55, -1.95, ss(0, 1, pose.chain + pose.preaortic));
  put('aorta', 'aorta-dortsalak', ctx(`aorta${r3(aortaY)}`, [0, aortaY], 0.3, 0.3), '#d8524c', '#6e1a18', { tissue: 'vessel', opacity: 0.9 });
  pts['notokorda'] = [0, -1.05, H];
  pts['mesodermo-paraxiala'] = [1.75, -0.35, H];
  pts['aorta-dortsalak'] = [0, aortaY, H];

  // ———— the neural plate / tube ————
  if (fold < 0.999) {
    const pm = (s0: number, s1: number) => cachedMesh('sec19-plate', [r3(fold), s0, s1], () => plateMesh(fold, s0, s1));
    const crestFrom = W * 0.86;
    put('plate', 'plaka-neurala', mergeParts([{ mesh: pm(-crestFrom, crestFrom), hit: pm(-crestFrom, crestFrom) }]), tube, tubeD, { groups: ['hodi-neurala', 'tolesdura-neuralak'] });
    const crestParts = mergeParts([pm(-W, -crestFrom), pm(crestFrom, W)].map((mm) => ({ mesh: mm, hit: mm })));
    put('crest-edge', 'gandor-neurala', crestParts, C19.crest, C19.crestDeep, {});
    const tip = plateAt(W * 0.93, 0, fold);
    pts['plaka-neurala'] = [0, -R4 + 0.1, H];
    pts['tolesdura-neuralak'] = [plateAt(W * 0.6, T4 / 2, fold)[0], plateAt(W * 0.6, T4 / 2, fold)[1], H];
    pts['gandor-neurala'] = [tip[0], tip[1], H];
    pts['ildo-neurala'] = [0, -R4 + 0.1, H];
  } else {
    const lu = lumen(mq), ne = neuroEdge(mq), gr = greyEdge(mq, lat), ou = outerEdge(mq);
    const greyOut = atLeast(gr, ne, 0.004);
    const outer = atLeast(ou, greyOut, 0.03);
    const key = (n: string) => `${n}|${mq}|${r3(lat)}`;
    // Colours: one tube while nothing is told apart; the layers; then the plates (sensory light, motor dark).
    const layerC = { ne: mixHex(tube, '#9fb6f2', layers), mantle: mixHex(tube, '#6a86d6', layers), marg: mixHex(tube, '#e6dcc2', layers) };
    const alarC = (c: string) => mixHex(c, mixHex(c, '#ffffff', 0.38), plates);
    const basalC = (c: string) => mixHex(c, mixHex(c, '#20305a', 0.32), plates);
    const ALL: [number, number][] = [[-Math.PI, Math.PI]];
    const sides = (n: string, rin: Radius, rout: Radius, id: string, color: string, groups: string[], alarId: string, basalId: string) => {
      if (plates < 0.01) {
        put(n, id, bands(key(n), rin, rout, ALL), color, tubeD, { groups });
        return;
      }
      put(`${n}-alar`, alarId, bands(key(`${n}-a`), rin, rout, ALAR), alarC(color), tubeD, { groups: [id, ...groups, 'hegal-plaka'] });
      put(`${n}-basal`, basalId, bands(key(`${n}-b`), rin, rout, BASAL), basalC(color), tubeD, { groups: [id, ...groups, 'oinalde-plaka'] });
      put(`${n}-roof`, 'sabai-plaka', bands(key(`${n}-r`), rin, rout, [ROOF]), color, tubeD, { groups: [id, ...groups] });
      put(`${n}-floor`, 'zoru-plaka', bands(key(`${n}-f`), rin, rout, [FLOOR]), color, tubeD, { groups: [id, ...groups] });
      put(`${n}-lim`, 'ildo-mugatzailea', bands(key(`${n}-l`), rin, rout, LIMITANS), color, tubeD, { groups: [id, ...groups] });
    };
    const adult = ss(0.55, 1, m);
    sides('ne', lu, ne, adult > 0.5 ? 'ependimo-geruza' : 'neuroepitelioa', layerC.ne, ['hodi-neurala', 'neuroepitelioa', 'ependimo-geruza', ...(adult > 0.5 ? ['hodi-ependimarioa'] : [])], adult > 0.5 ? 'eremu-sentsitiboa' : 'hegal-plaka', adult > 0.5 ? 'eremu-motorra' : 'oinalde-plaka');
    sides('mantle', ne, greyOut, adult > 0.5 ? 'gai-grisa' : 'manto-geruza', mixHex(layerC.mantle, '#8f6470', adult), ['hodi-neurala', 'manto-geruza', 'gai-grisa', ...(lat > 0.5 ? ['alboko-adarra'] : [])], adult > 0.5 ? 'eremu-sentsitiboa' : 'hegal-plaka', adult > 0.5 ? 'eremu-motorra' : 'oinalde-plaka');
    sides('marg', greyOut, outer, adult > 0.5 ? 'gai-zuria' : 'geruza-marginala', mixHex(layerC.marg, C19.white, adult), ['hodi-neurala', 'geruza-marginala', 'gai-zuria'], adult > 0.5 ? 'eremu-sentsitiboa' : 'hegal-plaka', adult > 0.5 ? 'eremu-motorra' : 'oinalde-plaka');
    // The limiting membranes: inner on the lumen, outer on the surface (where the pia forms).
    if (m > -0.6) {
      const memb = ss(-0.6, -0.2, m);
      put('m-in', 'barneko-mintz-mugatzailea', bands(key('min'), lu, offset(lu, 0.012), ALL), '#ffffff', '#7a8090', { opacity: memb * (1 - adult), tissue: 'membrane' });
      put('m-out', adult > 0.5 ? 'pia-materra' : 'kanpoko-mintz-mugatzailea', bands(key('mout'), outer, offset(outer, 0.025), ALL), mixHex('#ffffff', C19.pia, adult), C19.piaDeep, { opacity: memb, tissue: 'membrane', groups: ['pia-materra'] });
    }
    // Names on the cranial face.
    const P = (t: number, r: Radius, f = 0.5, r2?: Radius): V3 => {
      const R = r2 ? lerp(r(t), r2(t), f) : r(t);
      return [R * Math.cos(t), R * Math.sin(t), H + 0.01];
    };
    pts['hodi-neurala'] = P(150 * D, ne, 0.5, greyOut);
    pts['neuroepitelioa'] = P(20 * D, lu, 0.5, ne);
    pts['ependimo-geruza'] = P(20 * D, lu, 0.5, ne);
    pts['barneko-mintz-mugatzailea'] = P(30 * D, lu, 0.5, offset(lu, 0.012));
    pts['manto-geruza'] = P(25 * D, ne, 0.5, greyOut);
    pts['geruza-marginala'] = P(30 * D, greyOut, 0.6, outer);
    pts['kanpoko-mintz-mugatzailea'] = P(40 * D, outer);
    pts['pia-materra'] = P(40 * D, outer);
    pts['hegal-plaka'] = P(40 * D, ne, 0.5, outer);
    pts['oinalde-plaka'] = P(-40 * D, ne, 0.5, outer);
    pts['sabai-plaka'] = P(90 * D, ne, 0.6, outer);
    pts['zoru-plaka'] = P(-90 * D, ne, 0.6, outer);
    pts['ildo-mugatzailea'] = P(0, lu);
    pts['eremu-sentsitiboa'] = P(62 * D, ne, 0.5, greyOut);
    pts['eremu-motorra'] = P(-42 * D, ne, 0.5, greyOut);
    pts['gai-grisa'] = P(-42 * D, ne, 0.5, greyOut);
    pts['gai-zuria'] = P(20 * D, greyOut, 0.5, outer);
    pts['alboko-adarra'] = P(4 * D, ne, 0.7, greyOut);
    pts['hodi-ependimarioa'] = [0, 0, H + 0.01];
    pts['ornomuina'] = P(-60 * D, greyOut, 0.5, outer);
    // Neuroblasts leaving the neuroepithelium for the mantle.
    const bl = clamp01(pose.blasts);
    if (bl > 0.01) {
      const cells: (Parts | null)[] = [];
      for (let i = 0; i < 14; i++) {
        const t = ((i % 7) / 7) * Math.PI * 0.8 + 0.1 * Math.PI + (i >= 7 ? Math.PI : 0);
        const g = clamp01(bl * 1.6 - (i % 7) * 0.08);
        const r0 = ne(t) - 0.03, r1 = lerp(ne(t), greyOut(t), 0.55);
        const R = lerp(r0, r1, g);
        cells.push(blobParts({ center: [R * Math.cos(t), R * Math.sin(t), H + 0.015], radii: [0.035, 0.035, 0.012], rings: 6, sides: 8 }));
      }
      put('blasts', 'neuroblastoak', mergeParts(cells), '#f0c35a', '#7a5a10', { tissue: 'epithelium' });
      pts['neuroblastoak'] = P(55 * D, ne, 0.4, greyOut);
    }
  }
  // The surface ectoderm.
  const ecto = cachedMesh('sec19-ecto', [r3(fold)], () => ectoMesh(fold));
  put('ecto', 'azaleko-ektodermoa', { mesh: ecto, hit: ecto }, C19.ecto, '#2c4a8a', { groups: ['ektodermoa'], tissue: 'skin' });
  pts['azaleko-ektodermoa'] = [1.6, fold > 0.9 ? 0.75 : -R4 + 0.1, H];

  // ———— the crest after closure: a plate on the tube, then two lumps going down each side ————
  const crest = clamp01(pose.crest), drg = clamp01(pose.drg);
  if (fold > 0.95 && crest > 0.01) {
    const split = ss(0.25, 0.6, crest), down = ss(0.5, 1, crest);
    const lumps: (Parts | null)[] = [];
    for (const s of [1, -1]) {
      const c: V3 = [s * lerp(lerp(0.12, 0.35, split), DRG[0], down), lerp(CREST_TOP[1], DRG[1], down), 0];
      lumps.push(blobParts({ center: c, radii: [lerp(0.28, 0.2, split) * (1 + 0.4 * drg), lerp(0.1, 0.16, down) * (1 + 0.6 * drg), H * 0.98], rings: 10, sides: 14 }));
    }
    const settled = drg > 0.5;
    put('crest', settled ? 'gongoil-errakideoak' : 'gandor-neurala', mergeParts(lumps), mixHex(C19.crest, C19.sens, 0.55 * drg), C19.crestDeep, { groups: ['gandor-neurala'] });
    pts['gandor-neurala'] = [lerp(0.25, DRG[0], down), lerp(CREST_TOP[1], DRG[1], down) + 0.18, H];
    pts['gongoil-errakideoak'] = [DRG[0], DRG[1] + 0.2, H];
  }

  // ———— the derivatives, one by one ————
  const derivative = (key: string, id: string, to: V3, via: V3, g: number, color: string, deep: string, r: V3, pin: V3, zr = 0.6) => {
    if (g <= 0.01) return;
    const tracks = mergeParts([1, -1].map((s) => vessel(ROUTE(to, via).map((q) => X(s, q)), { r0: 0.035, r1: 0.035, sides: 8 }, Math.min(1, g * 1.4))));
    put(`${key}-track`, 'gandor-neurala', tracks, C19.crest, C19.crestDeep, { opacity: 0.55 * (1 - ss(0.8, 1, g)) });
    const cl = mergeParts([1, -1].map((s) => blobParts({ center: X(s, to), radii: [r[0] * ss(0.4, 1, g), r[1] * ss(0.4, 1, g), H * zr], rings: 10, sides: 12 })));
    put(key, id, cl, mixHex(C19.crest, color, ss(0.6, 1, g)), deep, { groups: ['gandor-neurala'] });
    pts[id] = pin;
  };
  derivative('chain', 'gongoil-sinpatikoak', CHAIN, [1.1, -0.6, 0], pose.chain, C19.symp, C19.sympDeep, [0.17, 0.17, 0], [CHAIN[0], CHAIN[1], H]);
  derivative('preao', 'aorta-aurreko-gongoilak', [0.2, PREAORTIC[1], 0], [1.0, -1.6, 0], pose.preaortic, C19.symp, C19.sympDeep, [0.14, 0.12, 0], [0.2, PREAORTIC[1], H]);
  derivative('adrenal', 'zelula-kromafinak', ADRENAL, [1.35, -1.2, 0], pose.adrenal, '#e9b44c', '#7a5410', [0.2, 0.18, 0], [ADRENAL[0], ADRENAL[1], H], 1.06); // the medulla cells show through the gland's cut face
  derivative('melano', 'melanozitoak', MELANO, [1.6, 0.9, 0], pose.melano, '#7a4a2c', '#2a160a', [0.1, 0.07, 0], [MELANO[0], MELANO[1], H]);
  const adrenalShow = ss(0, 0.5, pose.adrenal);
  if (adrenalShow > 0.01) {
    for (const s of [1, -1]) put(`adr-gland${s}`, 'giltzurrun-gaineko-muina', ctx(`adr${s}`, [s * (ADRENAL[0] + 0.05), ADRENAL[1] - 0.02], 0.42, 0.34), '#e7c79a', '#7a5a30', { tissue: 'mesenchyme', opacity: 0.55 * adrenalShow, quiet: true });
    pts['giltzurrun-gaineko-muina'] = [ADRENAL[0] + 0.3, ADRENAL[1] - 0.2, H];
  }
  // Schwann cells: small cells strung along a root leaving the tube.
  const sch = clamp01(pose.schwann);
  if (sch > 0.01) {
    const root = L([[0.85, -0.35, 0], [1.4, -0.55, 0], [2.0, -0.85, 0], [2.6, -1.0, 0]], 16);
    const parts: (Parts | null)[] = [vessel(root, { r0: 0.04, r1: 0.035, sides: 8 })];
    for (let i = 2; i < 15; i += 3) parts.push(blobParts({ center: root[i], radii: [0.09 * sch, 0.06 * sch, 0.06 * sch], rings: 6, sides: 8 }));
    put('schwann', 'schwann-zelulak', mergeParts(parts), mixHex(C19.crest, '#f5f0e0', 0.35), C19.crestDeep, { groups: ['gandor-neurala'] });
    pts['schwann-zelulak'] = [2.0, -0.85, H];
  }
  return { items, pts };
}
