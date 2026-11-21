import { add, cross, mul, norm, sub, type V3 } from '@/lib/three-d/math';
import type { Mesh } from '@/lib/three-d/mesh';
import type { Parts } from '@/lib/three-d/organic';
import type { Item3 } from '@/lib/three-d/scene';
import { mixHex } from '@/components/scenes/week10/model3d';
import { C19 } from './tones';

/**
 * Topic 19, section 9: the neural plate → tube → three vesicles → five vesicles with the flexures, as one surface.
 * Each cross-section is the plate's ribbon curling by the same rule as section-model's (each half an arc whose
 * curvature grows until the two edges meet): the tube closes in the middle first and zips towards both ends, leaving
 * the neuropores; the caudal one closes first (day 25), the cranial one later (day 28). Then the cranial end swells
 * into the vesicles (prosencephalon, mesencephalon, rhombencephalon; then telencephalon, diencephalon, mesencephalon,
 * metencephalon, myelencephalon) while the centreline bends at the cephalic, cervical and pontine flexures; the caudal
 * part stays a tube (the future cord).
 *
 * Space: x the embryo's LEFT, y cranial, z ventral (the dorsal side, where the plate folds, faces −z). The tube lies
 * along y, its diencephalon at `NEURAL_DIEN` (sites-b.ts), tied to the body's thalamus.
 */

export interface NeuralPose {
  /** The plate folding (0 flat … 1 every section able to close). */
  fold: number;
  /** The closure zipping from the middle: 0 nothing closed, 1 closed to both ends (caudal first). */
  zip: number;
  /** Three vesicles (0..1), then five (0..1); the flexures (0..1). */
  three: number;
  five: number;
  flex: number;
  /** Vesicle colours (0..1). */
  tint: number;
}
export const NP0: NeuralPose = { fold: 0, zip: 0, three: 0, five: 0, flex: 0, tint: 0 };

export interface NeuralOpts {
  dim?: { ids: readonly string[]; k: number } | null;
}

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const ss = (a: number, b: number, x: number) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const gauss = (x: number, c: number, w: number) => Math.exp(-(((x - c) / w) ** 2));

/** Along the tube: s from 0 (caudal end) to 1 (cranial end). Its length and base radius. */
const LEN = 6.4;
const R0 = 0.26;
/** Where each future part lies along s (the notes' figure, cranial at the top). */
const AT = { cord: 0.3, miel: 0.66, met: 0.73, isth: 0.78, mes: 0.83, dien: 0.9, tel: 0.95 } as const;

/** The radius profile: a tube, then three swellings, then five (the telencephalon's pair bulging sideways). */
function radius(s: number, three: number, five: number): { r: number; side: number } {
  const brain = ss(0.6, 0.66, s);
  const v3 = three * brain * (0.55 * gauss(s, 0.92, 0.05) + 0.4 * gauss(s, 0.82, 0.03) + 0.5 * gauss(s, 0.7, 0.05));
  const v5 = five * brain * (0.35 * gauss(s, AT.tel, 0.035) + 0.15 * gauss(s, AT.dien, 0.025) - 0.12 * gauss(s, AT.isth, 0.015) + 0.12 * gauss(s, AT.met, 0.025) - 0.1 * gauss(s, 0.68, 0.02));
  const tip = ss(1, 0.96, s) * 0.5 + 0.5;
  const tail = ss(0, 0.05, s) * 0.6 + 0.4;
  const r = R0 * (1 + v3 + v5) * Math.min(tip, tail);
  // The hemispheres grow out to the sides more than the rest.
  const side = 1 + 0.7 * five * gauss(s, AT.tel, 0.04);
  return { r, side };
}

const centres = new Map<number, { p: V3[]; t: V3[]; n: V3[]; b: V3[] }>();
/** `centre`, remembered by flexure (the names and the meshes ask for the same line), with the sections' side axis. */
function centreOf(flex: number) {
  let c = centres.get(flex);
  if (!c) {
    if (centres.size > 64) centres.clear();
    const l = centre(flex);
    centres.set(flex, (c = { ...l, b: l.t.map((t, i) => norm(cross(t, l.n[i]))) }));
  }
  return c;
}

/** The centreline: straight, then bent at the cephalic (mesencephalon), cervical (rhomb/cord) and pontine flexures. */
function centre(flex: number): { p: V3[]; t: V3[]; n: V3[] } {
  const N = 140;
  const p: V3[] = [];
  let pos: V3 = [0, 0, 0];
  let ang = 0;
  for (let i = 0; i <= N; i++) {
    const s = i / N;
    p.push(pos);
    // Curvature (bending ventrally = towards +z is positive).
    const k = flex * (2.6 * gauss(s, 0.62, 0.03) - 2.2 * gauss(s, 0.72, 0.025) + 4.6 * gauss(s, AT.mes, 0.03));
    ang += (k * LEN) / N;
    pos = add(pos, [0, Math.cos(ang) * (LEN / N), Math.sin(ang) * (LEN / N)]);
  }
  const t = p.map((_, i) => norm(sub(p[Math.min(N, i + 1)], p[Math.max(0, i - 1)])));
  // The section's "up" is dorsal (−z) turned with the line.
  const n = t.map((d) => norm(cross([1, 0, 0], d)));
  return { p, t, n };
}

/** How far each section is folded, given the plate's fold and the zip (closing from the middle, caudal end first). */
function foldAt(s: number, fold: number, zip: number): number {
  const fromMid = Math.abs(s - 0.5) * 2;
  // The caudal half zips a little faster than the cranial (the caudal neuropore closes first).
  const reach = zip * (s < 0.5 ? 1.12 : 0.98);
  const closed = ss(fromMid - 0.12, fromMid, reach * 1.08);
  return Math.min(1, fold * (0.9 + 0.1 * closed) + 0.1 * closed);
}

/** The ribbon's mid-line in its own plane: arc position u (−1..1 of the half-width w), fold f; x across, y up (dorsal). */
function ribbon(u: number, w: number, f: number, side: number): [number, number] {
  const s = u * w;
  const k = Math.max(1e-4, (f * Math.PI) / w);
  const a = s * k;
  const r = 1 / k;
  const x = r * Math.sin(a) * side;
  const y = -w / Math.PI + r * (1 - Math.cos(a));
  return [x, y];
}

const NU = 140, NA = 48;
type Sheet = { pos: Float32Array; nrm: Float32Array; uv: Float32Array; off: number };
/** The tube's two faces (outer, inner) over the whole (s, u) grid: computed once per pose, shared by every part. */
function sheets(pose: NeuralPose): { outer: Sheet; inner: Sheet } {
  const c = centreOf(pose.flex);
  const make = (off: number): Sheet => {
    const n = (NU + 1) * (NA + 1);
    const pos = new Float32Array(n * 3), nrm = new Float32Array(n * 3), uv = new Float32Array(n * 2);
    let v = 0;
    const sg = off > 0 ? 1 : -1;
    for (let i = 0; i <= NU; i++) {
      const s = i / NU;
      const ci = Math.round(s * (c.p.length - 1));
      const P = c.p[ci], Nn = c.n[ci], Bn = c.b[ci];
      const { r, side } = radius(s, pose.three, pose.five);
      const w = Math.PI * r;
      const f = foldAt(s, pose.fold, pose.zip);
      const k = Math.max(1e-4, (f * Math.PI) / w);
      for (let j = 0; j <= NA; j++, v++) {
        const u = -1 + (2 * j) / NA;
        const [x, y] = ribbon(u, w, f, side);
        // The normal of the curl at u (pointing out of the tube when closed); offset by the wall's half-thickness.
        const a = u * w * k;
        const nx = -Math.sin(a) * side, ny = Math.cos(a);
        const lx = x - nx * off, ly = y - ny * off;
        // Local x → Bn (the embryo's side), local y → −Nn (dorsal is where the plate opens).
        pos[v * 3] = P[0] + Bn[0] * lx - Nn[0] * ly;
        pos[v * 3 + 1] = P[1] + Bn[1] * lx - Nn[1] * ly;
        pos[v * 3 + 2] = P[2] + Bn[2] * lx - Nn[2] * ly;
        const wx = -Bn[0] * nx + Nn[0] * ny, wy = -Bn[1] * nx + Nn[1] * ny, wz = -Bn[2] * nx + Nn[2] * ny;
        const l = Math.hypot(wx, wy, wz) || 1;
        nrm[v * 3] = (wx / l) * sg;
        nrm[v * 3 + 1] = (wy / l) * sg;
        nrm[v * 3 + 2] = (wz / l) * sg;
        uv[v * 2] = s * 4;
        uv[v * 2 + 1] = u;
      }
    }
    return { pos, nrm, uv, off };
  };
  return { outer: make(-0.045), inner: make(0.045) };
}
/** One part of a face: its own triangles over the shared vertices. */
function partOf(sh: Sheet, part: (s: number, u: number) => boolean): Mesh {
  const { pos, nrm, off } = sh;
  const idx: number[] = [];
  const vi = (i: number, j: number) => i * (NA + 1) + j;
  for (let i = 0; i < NU; i++)
    for (let j = 0; j < NA; j++) {
      const sMid = (i + 0.5) / NU, uMid = -1 + (2 * (j + 0.5)) / NA;
      if (!part(sMid, uMid)) continue;
      const a = vi(i, j), b = vi(i, j + 1), cc = vi(i + 1, j), d = vi(i + 1, j + 1);
      if (off > 0) idx.push(a, cc, b, b, cc, d);
      else idx.push(a, b, cc, b, d, cc);
    }
  // Make the winding agree with the normals (front faces are the ones the normals point out of).
  let agree = 0;
  for (let t = 0; t < idx.length; t += 3 * 7) {
    const A = idx[t] * 3, B = idx[t + 1] * 3, C = idx[t + 2] * 3;
    const ux = pos[B] - pos[A], uy = pos[B + 1] - pos[A + 1], uz = pos[B + 2] - pos[A + 2];
    const vx = pos[C] - pos[A], vy = pos[C + 1] - pos[A + 1], vz = pos[C + 2] - pos[A + 2];
    const fx = uy * vz - uz * vy, fy = uz * vx - ux * vz, fz = ux * vy - uy * vx;
    agree += Math.sign(fx * (nrm[A] + nrm[B] + nrm[C]) + fy * (nrm[A + 1] + nrm[B + 1] + nrm[C + 1]) + fz * (nrm[A + 2] + nrm[B + 2] + nrm[C + 2]));
  }
  if (agree < 0) for (let t = 0; t < idx.length; t += 3) [idx[t + 1], idx[t + 2]] = [idx[t + 2], idx[t + 1]];
  return { pos, nrm, uv: sh.uv, idx: new Uint32Array(idx) };
}

/** Which vesicle a station belongs to (by s), for ids and colours. */
function regionOf(s: number, three: number, five: number): { id: string; color: string } {
  if (s < 0.62) return { id: 'ornomuina', color: C19.tube };
  if (five > 0.5) {
    if (s < 0.705) return { id: 'mielentzefaloa', color: C19.miel };
    if (s < 0.765) return { id: 'metentzefaloa', color: C19.met };
    if (s < 0.795) return { id: 'istmoa-entzefaloa', color: mixHex(C19.mes, C19.met, 0.5) };
    if (s < 0.865) return { id: 'mesentzefaloa', color: C19.mes };
    if (s < 0.925) return { id: 'dientzefaloa', color: C19.dien };
    return { id: 'telentzefaloa', color: C19.tel };
  }
  if (three > 0.3) {
    if (s < 0.775) return { id: 'erronbentzefaloa', color: C19.rhomb };
    if (s < 0.865) return { id: 'mesentzefaloa', color: C19.mes };
    return { id: 'prosentzefaloa', color: C19.pros };
  }
  return { id: 'hodi-neurala', color: C19.tube };
}

const memo = new Map<string, Record<string, Parts>>();
export function neuralModel(pose: NeuralPose, o: NeuralOpts = {}) {
  const q = (x: number) => Math.round(x * 40) / 40;
  const P: NeuralPose = { fold: q(pose.fold), zip: q(pose.zip), three: q(pose.three), five: q(pose.five), flex: q(pose.flex), tint: pose.tint };
  const key = [P.fold, P.zip, P.three, P.five, P.flex].join(',');
  let parts = memo.get(key);
  if (!parts) {
    if (memo.size > 120) memo.clear();
    parts = {};
    const groups = new Map<string, (s: number, u: number) => boolean>();
    const crestEdge = (u: number) => Math.abs(u) > 0.86;
    const ids = new Set<string>();
    for (let i = 0; i < 50; i++) ids.add(regionOf(i / 50, P.three, P.five).id);
    for (const id of ids) groups.set(id, (s, u) => regionOf(s, P.three, P.five).id === id && !(crestEdge(u) && P.zip < 0.999 && foldAt(s, P.fold, P.zip) < 0.995));
    groups.set('gandor-neurala', (s, u) => crestEdge(u) && P.zip < 0.999 && foldAt(s, P.fold, P.zip) < 0.995);
    const sh = sheets(P);
    for (const [id, fn] of groups) {
      const outer = partOf(sh.outer, fn), inner = partOf(sh.inner, fn);
      parts[`${id}:o`] = { mesh: outer, hit: outer };
      parts[`${id}:i`] = { mesh: inner, hit: inner };
    }
    memo.set(key, parts);
  }
  const items: Item3[] = [];
  const pts: Record<string, V3> = {};
  const dim = o.dim && o.dim.k > 0.001 ? o.dim : null;
  const k = dim ? dim.k : 0;
  const lit = (id: string, groups?: readonly string[]) => !dim || dim.ids.includes(id) || (groups ?? []).some((g) => dim.ids.includes(g));
  const tint = clamp01(pose.tint);
  for (const [name, p] of Object.entries(parts)) {
    const [id, side] = name.split(':');
    if (!p.mesh.idx.length) continue;
    const reg = { color: id === 'gandor-neurala' ? C19.crest : mixHex(C19.tube, colorOf(id), tint) };
    const groups = id === 'gandor-neurala' ? ['tolesdura-neuralak'] : ['hodi-neurala', 'plaka-neurala', 'tolesdura-neuralak', 'neuroporo-kraneala', 'neuroporo-kaudala', ...(['telentzefaloa', 'dientzefaloa'].includes(id) ? ['prosentzefaloa'] : []), ...(['metentzefaloa', 'mielentzefaloa'].includes(id) ? ['erronbentzefaloa'] : []), ...(id === 'ornomuina' ? [] : ['entzefaloa'])];
    const off = !!dim && !lit(id, groups);
    const color = side === 'i' ? mixHex(reg.color, '#1a2550', 0.35) : reg.color;
    items.push({ key: `nt-${name}`, id, groups, mesh: p.mesh, hit: p.hit, color: off ? mixHex(color, '#c4bcbb', 0.45 * k) : color, deep: mixHex(color, '#0a1030', 0.55), tissue: 'neural' });
  }
  // Names along the tube.
  const c = centreOf(P.flex);
  const along = (s: number, lift = 0): V3 => {
    const i = Math.round(s * (c.p.length - 1));
    const { r } = radius(s, P.three, P.five);
    return add(c.p[i], mul(c.n[i], -(r + lift)));
  };
  pts['plaka-neurala'] = along(0.5, -0.3);
  pts['hodi-neurala'] = along(0.45, 0.05);
  pts['gandor-neurala'] = add(along(0.5, -0.1), [Math.PI * R0 * 0.95, 0, 0]);
  pts['tolesdura-neuralak'] = add(along(0.35, -0.1), [Math.PI * R0 * 0.7, 0, 0]);
  pts['neuroporo-kraneala'] = along(0.985, 0);
  pts['neuroporo-kaudala'] = along(0.015, 0);
  pts['ornomuina'] = along(0.3, 0.02);
  pts['prosentzefaloa'] = along(0.92, 0.02);
  pts['mesentzefaloa'] = along(AT.mes, 0.02);
  pts['erronbentzefaloa'] = along(0.71, 0.02);
  pts['telentzefaloa'] = add(along(AT.tel, -0.1), [radius(AT.tel, P.three, P.five).r * radius(AT.tel, P.three, P.five).side, 0, 0]);
  pts['dientzefaloa'] = along(AT.dien, 0.02);
  pts['metentzefaloa'] = along(AT.met, 0.02);
  pts['mielentzefaloa'] = along(0.68, 0.02);
  pts['istmoa-entzefaloa'] = along(AT.isth, 0.02);
  pts['tolespen-zefalikoa'] = along(AT.mes, 0.1);
  pts['tolespen-zerbikala'] = along(0.62, 0.1);
  const ventral = (s: number): V3 => {
    const i = Math.round(s * (c.p.length - 1));
    return add(c.p[i], mul(c.n[i], radius(s, P.three, P.five).r + 0.02));
  };
  pts['zubi-tolespena'] = ventral(0.72);
  pts['entzefaloa'] = along(0.86, 0.02);
  return { items, pts };
}

function colorOf(id: string): string {
  const m: Record<string, string> = {
    ornomuina: C19.tube,
    'hodi-neurala': C19.tube,
    'istmoa-entzefaloa': C19.mes,
    prosentzefaloa: C19.pros,
    mesentzefaloa: C19.mes,
    erronbentzefaloa: C19.rhomb,
    telentzefaloa: C19.tel,
    dientzefaloa: C19.dien,
    metentzefaloa: C19.met,
    mielentzefaloa: C19.miel,
  };
  return m[id] ?? C19.tube;
}

/** The diencephalon's place in the model at the five-vesicle pose with the flexures (sites-b.ts ties it to the thalamus). */
export function neuralDien(): V3 {
  const c = centre(1);
  const i = Math.round(AT.dien * (c.p.length - 1));
  return c.p[i];
}
