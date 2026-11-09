import type { V3 } from '@/lib/three-d/math';
import { cachedMesh } from '@/lib/three-d/mesh-cache';
import type { Mesh } from '@/lib/three-d/mesh';
import type { Item3 } from '@/lib/three-d/scene';
import { blobParts, mixHex, tubeParts } from '@/components/scenes/week10/model3d';
import { ARCH, TISSUE } from '@/components/scenes/week17/common';

/**
 * Topic 18, notes 4.1: the palate as one continuous model. Axes: x towards the embryo's LEFT, y cranial, z ventral.
 *
 * `palateModel`: the upper face and the mouth, solid, cut across at z = Z_CUT (the notes' coronal figures) and able
 * to grow back into the whole palate (`whole`) seen from below once the jaw and tongue are out of the way. The two
 * shelves are ONE mesh: both halves share their columns, the zipper (`fuse`) only opens the quads at the midline
 * ahead of its front, so the fused palate has no seam and no doubled surface.
 *
 * `choanaModel`: the same face cut down the nostril (the notes' sagittal figures of p.12), seen from the embryo's
 * left: the face on the viewer's left. Pit, buconasal membrane, its rupture, the choana carried back by the palate.
 */

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const ss = (a: number, b: number, x: number) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const darker = (c: string) => mixHex(c, '#000000', 0.55);
const r3 = (x: number) => Math.round(x * 1000) / 1000;

type P2 = readonly [number, number];
type Frame = (u: number, v: number, w: number) => V3;
const XY: Frame = (u, v, w) => [u, v, w];
/** The sagittal cut: u dorsal (the viewer's right from the embryo's left), v cranial, w towards the viewer. */
const SAG: Frame = (u, v, w) => [w, v, -u];

/** Catmull-Rom through key points, exactly n samples. */
function cr(k: readonly P2[], n: number): P2[] {
  const out: P2[] = [];
  const m = k.length - 1;
  for (let i = 0; i < n; i++) {
    const t = (i / (n - 1)) * m;
    const s = Math.min(m - 1, Math.floor(t));
    const f = t - s;
    const p0 = k[Math.max(0, s - 1)];
    const p1 = k[s];
    const p2 = k[s + 1];
    const p3 = k[Math.min(m, s + 2)];
    const c = (a: number, b: number, d: number, e: number) => 0.5 * (2 * b + (d - a) * f + (2 * a - 5 * b + 4 * d - e) * f * f + (3 * b - a - 3 * d + e) * f * f * f);
    out.push([c(p0[0], p1[0], p2[0], p3[0]), c(p0[1], p1[1], p2[1], p3[1])]);
  }
  return out;
}

/**
 * A solid lofted across stations `w`: each ring is a two-sided ribbon (its i-th point faces its (M−1−i)-th), so the
 * end caps are strips and need no star shape. Side walls shaded smooth, caps flat. `skip(r, i)` opens a quad.
 */
function loft(rings0: readonly (readonly P2[])[], ws: readonly number[], frame: Frame, o: { capStart?: boolean; capEnd?: boolean; skip?: (r: number, i: number) => boolean } = {}): Mesh {
  // Rings counter-clockwise, so the quads below face outwards whatever way a piece was described.
  let area = 0;
  const first = rings0[Math.floor(rings0.length / 2)];
  for (let i = 0; i < first.length; i++) {
    const a = first[i];
    const b = first[(i + 1) % first.length];
    area += a[0] * b[1] - b[0] * a[1];
  }
  const flip = area < 0;
  const M = first.length;
  const at = (r: number, i: number) => rings0[r][flip ? M - 1 - i : i];
  const R = rings0.length;
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  for (let r = 0; r < R; r++) {
    for (let i = 0; i < M; i++) {
      const p = at(r, i);
      pos.push(...frame(p[0], p[1], ws[r]));
      uv.push(r / (R - 1), i / M);
    }
  }
  const unskip = (r: number, i: number) => (o.skip ? o.skip(r, flip ? (M - 2 - i + M) % M : i) : false);
  for (let r = 0; r < R - 1; r++) {
    for (let i = 0; i < M; i++) {
      if (unskip(r, i)) continue;
      const a = r * M + i;
      const b = r * M + ((i + 1) % M);
      const c = (r + 1) * M + ((i + 1) % M);
      const d = (r + 1) * M + i;
      idx.push(a, b, c, a, c, d);
    }
  }
  const nrm = new Float32Array(pos.length);
  for (let t = 0; t < idx.length; t += 3) {
    const [a, b, c] = [idx[t] * 3, idx[t + 1] * 3, idx[t + 2] * 3];
    const ux = pos[b] - pos[a];
    const uy = pos[b + 1] - pos[a + 1];
    const uz = pos[b + 2] - pos[a + 2];
    const vx = pos[c] - pos[a];
    const vy = pos[c + 1] - pos[a + 1];
    const vz = pos[c + 2] - pos[a + 2];
    const nx = uy * vz - uz * vy;
    const ny = uz * vx - ux * vz;
    const nz = ux * vy - uy * vx;
    for (const q of [a, b, c]) {
      nrm[q] += nx;
      nrm[q + 1] += ny;
      nrm[q + 2] += nz;
    }
  }
  const normals: number[] = Array.from(nrm);
  const cap = (r: number, sign: number) => {
    const n = frame(0, 0, sign);
    const z = frame(0, 0, 0);
    const nn: V3 = [n[0] - z[0], n[1] - z[1], n[2] - z[2]];
    const base = pos.length / 3;
    for (let i = 0; i < M; i++) {
      const p = at(r, i);
      pos.push(...frame(p[0], p[1], ws[r]));
      normals.push(...nn);
      uv.push(r / (R - 1), i / M);
    }
    for (let i = 0; i < M / 2 - 1; i++) {
      if (unskip(r === 0 ? 0 : R - 2, i)) continue;
      const a = base + i;
      const b = base + i + 1;
      const c = base + M - 2 - i;
      const d = base + M - 1 - i;
      // Rings are counter-clockwise from +w: the far side of the ribbon comes first for the +w cap.
      if (sign > 0) idx.push(a, b, c, a, c, d);
      else idx.push(a, c, b, a, d, c);
    }
  };
  if (o.capStart) cap(0, -1);
  if (o.capEnd) cap(R - 1, 1);
  const out = new Float32Array(normals.length);
  for (let i = 0; i < normals.length; i += 3) {
    const l = Math.hypot(normals[i], normals[i + 1], normals[i + 2]) || 1;
    out[i] = normals[i] / l;
    out[i + 1] = normals[i + 1] / l;
    out[i + 2] = normals[i + 2] / l;
  }
  return { pos: new Float32Array(pos), nrm: out, uv: new Float32Array(uv), idx: new Uint32Array(idx) };
}

function stations(a: number, b: number, n: number) {
  return Array.from({ length: n }, (_, i) => a + ((b - a) * i) / (n - 1));
}

export interface PalatePose {
  /** Shelves: grown medially (0..1, only seen from below), swung to horizontal (0..1), zipped (0..1: front to back). */
  grow: number;
  swing: number;
  fuse: number;
  /** Tongue dropped (0..1); jaw and tongue taken away for the view from below (0..1). */
  drop: number;
  jaw: number;
  /** Septum down (0..1); conchae out (0..1). */
  sept: number;
  conchae: number;
  /** From the coronal cut to the whole palate (0..1). */
  whole: number;
  /** Intermaxillary segment joined (0..1) and shown (0..1); incisors; foramen; raphe; ridge shown. */
  seg: number;
  segShow: number;
  teeth: number;
  foramen: number;
  raphe: number;
  /** The soft palate told apart (0..1); a palate that did not close (0..1); cleft lip on the embryo's left, right. */
  soft: number;
  cleft: number;
  lip: number;
  lipL: number;
  lipR: number;
}

export const PAL0: PalatePose = { grow: 1, swing: 0, fuse: 0, drop: 0, jaw: 0, sept: 0.15, conchae: 0, whole: 0, seg: 1, segShow: 1, teeth: 0, foramen: 0, raphe: 0, soft: 0, cleft: 0, lip: 0, lipL: 0, lipR: 0 };

export interface PalateOpts {
  dim?: { ids: readonly string[]; k: number } | null;
}

const Z_BACK = -2.0;
const Z_CUT = 0.3;
const Z_F = 0.9;
const Z_J = 1.6;
const Z_END = 2.1;
const Z_SOFT = -0.95;
const T = 0.13;
const X_ROOT = 1.25;
const SHELF = ARCH.i;
const PRIMARY = '#f6d95a';
const TONGUE = '#d96a6a';
const SOFT = '#e9a7a0';
const BONE = TISSUE.bone;
const CUT = '#b89a86';
const CUT_DEEP = '#54402f';
const HOLE = '#3b3346';
const HOLE_ORAL = '#4a3540';

/** Half width of the palate's vault at z: straight behind the cut, closing round at the front. */
const hw = (z: number) => (z <= Z_CUT ? X_ROOT : X_ROOT * Math.sqrt(Math.max(0, 1 - ((z - Z_CUT) / (Z_END - Z_CUT)) ** 2)));
/** Half width of the primary triangle at z: nothing behind its apex at the foramen, then the two straight sides. */
const tri = (z: number) => (z <= Z_F ? 0 : Math.min(hw(z), (z - Z_F) * ((hw(Z_J) as number) / (Z_J - Z_F))));

const OUTER: P2[] = [[-1.5, -0.82], [-2.0, -0.55], [-2.2, 0.6], [-1.9, 2.1], [-0.9, 3.0], [0, 3.2], [0.9, 3.0], [1.9, 2.1], [2.2, 0.6], [2.0, -0.55], [1.5, -0.82]];
const INNER: P2[] = [[-1.24, -0.62], [-1.3, -0.05], [-1.0, 0.45], [-0.85, 1.1], [-0.62, 1.95], [-0.3, 2.35], [0, 2.42], [0.3, 2.35], [0.62, 1.95], [0.85, 1.1], [1.0, 0.45], [1.3, -0.05], [1.24, -0.62]];
const OUT40 = cr(OUTER, 40);
const IN40 = cr(INNER, 40);
const JAW_IN = cr([[-1.28, -0.95], [-1.25, -1.5], [-0.7, -1.95], [0, -2.05], [0.7, -1.95], [1.25, -1.5], [1.28, -0.95]], 24);
const JAW_OUT = cr([[-1.8, -1.0], [-2.05, -1.9], [-1.3, -2.95], [0, -3.25], [1.3, -2.95], [2.05, -1.9], [1.8, -1.0]], 24);
const NASAL_TOP = IN40.filter((p) => p[1] > 0.08);

/** A lens-shaped ribbon on a spine in the (u, v) plane: `half(a)` is its half thickness. */
function ribbonRing(spine: readonly P2[], half: (a: number) => number): P2[] {
  const n = spine.length;
  const top: P2[] = [];
  const bot: P2[] = [];
  for (let i = 0; i < n; i++) {
    const p = spine[Math.max(0, i - 1)];
    const q = spine[Math.min(n - 1, i + 1)];
    const dx = q[0] - p[0];
    const dy = q[1] - p[1];
    const l = Math.hypot(dx, dy) || 1;
    const nx = -dy / l;
    const ny = dx / l;
    const t = half(i / (n - 1));
    top.push([spine[i][0] + nx * t, spine[i][1] + ny * t]);
    bot.push([spine[i][0] - nx * t, spine[i][1] - ny * t]);
  }
  return [...top, ...bot.reverse()];
}

const round = (a: number, p = 3) => Math.sqrt(Math.max(0, 1 - a ** p));

export function palateModel(pose: PalatePose, o: PalateOpts = {}) {
  const items: Item3[] = [];
  const pts: Record<string, V3> = {};
  const dim = o.dim;
  const fade = (id: string, groups?: readonly string[]) => (!dim || dim.k <= 0.001 || dim.ids.includes(id) || (groups ?? []).some((g) => dim.ids.includes(g)) ? 1 : 1 - 0.7 * dim.k);
  const add = (key: string, id: string | undefined, mesh: Mesh, color: string, extra: Partial<Item3> = {}) => {
    const op = extra.opacity ?? 1;
    if (op <= 0.01) return;
    items.push({ key, id, mesh, hit: mesh, color, deep: darker(color), tissue: 'mesenchyme', ...extra, opacity: op * (id ? fade(id, extra.groups) : 1) });
  };
  const ball = (key: string, id: string | undefined, c: V3, r: V3, color: string, extra: Partial<Item3> = {}) => {
    const op = extra.opacity ?? 1;
    if (op <= 0.01) return;
    items.push({ key, id, ...blobParts({ center: c, radii: r, rings: 12, sides: 16 }), color, deep: darker(color), tissue: 'epithelium', ...extra, opacity: op * (id ? fade(id, extra.groups) : 1) });
  };
  const tube = (key: string, id: string | undefined, line: V3[], color: string, r: number, extra: Partial<Item3> = {}) => {
    const op = extra.opacity ?? 1;
    if (op <= 0.01 || line.length < 2) return;
    items.push({ key, id, ...tubeParts(line, { radius: () => r, ref: [0, 1, 0], sides: 14, capStart: true, capEnd: true }), color, deep: darker(color), tissue: 'epithelium', ...extra, opacity: op * (id ? fade(id, extra.groups) : 1) });
  };

  const swing = clamp01(pose.swing);
  const fuse = clamp01(pose.fuse);
  const drop = ss(0, 1, pose.drop);
  const jaw = ss(0, 1, pose.jaw);
  const whole = ss(0, 1, pose.whole);
  const grow = clamp01(pose.grow);
  const sept = clamp01(pose.sept);
  const conch = clamp01(pose.conchae);
  const zFront = lerp(Z_CUT, Z_END - 0.01, whole);
  const zShelf = Math.min(zFront, Z_J);

  // ———— the upper face, solid, hollowed by the oronasal cavity ————
  {
    const zs = stations(Z_BACK, zFront, whole > 0.01 ? 26 : 2);
    const rings = zs.map((z) => {
      const k = Math.max(0.0, hw(z) / X_ROOT);
      return [...OUT40.map(([x, y]): P2 => [x * k, y]), ...[...IN40].reverse().map(([x, y]): P2 => [x * k, y])];
    });
    add('upper', undefined, cachedMesh('palate-upper', [r3(whole)], () => loft(rings, zs, XY, { capStart: true, capEnd: true })), CUT, { deep: CUT_DEEP, quiet: true, ground: true });
    add('nose-back', 'sudur-barrunbea', cachedMesh('palate-noseback', [], () => loft([[...NASAL_TOP, ...[...NASAL_TOP].reverse().map(([x]): P2 => [x, 0.08])], [...NASAL_TOP, ...[...NASAL_TOP].reverse().map(([x]): P2 => [x, 0.08])]], [Z_BACK - 0.1, Z_BACK + 0.01], XY, { capEnd: true })), HOLE, { quiet: true, opacity: 1 });
    pts['sudur-barrunbea'] = [0.42, 2.0, Z_BACK + 0.05];
    const eyes = 1 - ss(0, 0.2, whole);
    for (const s of [-1, 1]) ball(`eye${s}`, 'begia', [s * 1.62, 1.55, Z_CUT], [0.26, 0.26, 0.05], '#3a3a46', { opacity: eyes, quiet: true });
    pts['begia'] = [1.62, 1.55, Z_CUT + 0.05];
  }

  // ———— the lower jaw and the tongue (they go, out of the way, for the view from below) ————
  {
    const out = jaw * 2.4;
    const zs = [Z_BACK, Z_CUT];
    const ringJaw: P2[] = [...JAW_IN, ...[...JAW_OUT].reverse()].map(([x, y]): P2 => [x, y - out]);
    add('jaw', undefined, cachedMesh('palate-jaw', [r3(out)], () => loft([ringJaw, ringJaw], zs, XY, { capEnd: true })), CUT, { deep: CUT_DEEP, quiet: true, ground: true, opacity: 1 - ss(0.3, 1, jaw) });
    const oral: P2[] = [[-1.24, 0.08], [-1.24, -0.95], ...JAW_IN.slice(2, -2), [1.24, -0.95], [1.24, 0.08]];
    const ringOral: P2[] = [...oral.map(([x, y]): P2 => [x, y === 0.08 ? y : y - out]), ...[...oral].reverse().map(([x]): P2 => [x, 0.08])];
    add('oral-back', 'aho-barrunbea', cachedMesh('palate-oralback', [r3(out)], () => loft([ringOral, ringOral], [Z_BACK - 0.1, Z_BACK + 0.01], XY, { capEnd: true })), HOLE_ORAL, { quiet: true, opacity: 1 - ss(0, 0.5, jaw) });
    pts['aho-barrunbea'] = [1.0, -0.42, Z_BACK + 0.05];
    const cy = lerp(-0.48, -1.22, drop) - out;
    const rx = lerp(0.66, 1.08, drop);
    const ry = lerp(0.86, 0.46, drop);
    const n = 22;
    const ringT: P2[] = [];
    for (let i = 0; i < n; i++) {
      const u = Math.PI * (1 - i / (n - 1));
      ringT.push([rx * Math.cos(u), cy + ry * Math.sin(u)]);
    }
    for (let i = 0; i < n; i++) {
      const u = Math.PI * (i / (n - 1));
      ringT.push([rx * Math.cos(u), cy - (cy + 2.15 + out) * 0.98 * Math.sin(u)]);
    }
    add('tongue', 'mihia', cachedMesh('palate-tongue', [r3(cy), r3(rx), r3(ry)], () => loft([ringT, ringT], zs, XY, { capEnd: true })), TONGUE, { tissue: 'muscle', opacity: 1 - ss(0.3, 1, jaw) });
    pts['mihia'] = [0.2, cy - 0.05, Z_CUT + 0.02];
  }

  // ———— the two shelves: one mesh, opened at the midline ahead of the zipper ————
  {
    const front = lerp(Z_END + 0.2, Z_BACK - 0.2, fuse);
    const fAt = (z: number) => 1 - ss(front - 0.04, front + 0.12, z) * 0 - (1 - ss(front - 0.12, front + 0.04, z));
    const N = 14;
    const ringAt = (z: number): P2[] => {
      const f = fAt(z);
      const xr = hw(z) + 0.18;
      const xT = tri(z) + 0.2 * (1 - f) * (1 - clamp01(pose.cleft * 0)) + 0.34 * clamp01(pose.cleft);
      const xTip = lerp(xr, xT, grow);
      const L = Math.max(0.001, xr - xTip);
      const halves: P2[] = [];
      const lower: P2[] = [];
      let x = xr;
      let y = 0;
      const da = 1 / (N - 1);
      for (let c = 0; c < N; c++) {
        const a = c * da;
        const th = (1 - swing) * (1.33 + 0.4 * (a - 0.5));
        const tx = -Math.cos(th);
        const ty = -Math.sin(th);
        const sw = 1 + (1 - swing) * 0.9;
        const t = T * sw * (0.82 + 0.18 * (1 - a)) * lerp(round(a, 4), 1, f >= 0.97 ? 1 : f * 0.5);
        // Top: the nasal face (the medial face while the shelf hangs).
        halves.push([x + ty * t * -1 * -1, y - tx * t * -1]);
        lower.push([x - ty * t * -1 * -1, y + tx * t * -1]);
        x += tx * L * da;
        y += ty * L * da;
      }
      // Whole cross-section, right half (x < 0) then left half.
      const topL = halves;
      const botL = lower;
      const top: P2[] = [...topL.map(([u, v]): P2 => [-u, v]), ...[...topL].reverse()];
      const bot: P2[] = [...botL.map(([u, v]): P2 => [-u, v]), ...[...botL].reverse()];
      return [...top, ...[...bot].reverse()];
    };
    const col = 2 * N;
    const build = (zs: number[], capS: boolean, capE: boolean) => {
      const rings = zs.map(ringAt);
      const closed = zs.map((z) => fAt(z) >= 0.97);
      const M = col * 2;
      const skip = (r: number, i: number) => {
        const open = !(closed[r] && closed[Math.min(r + 1, zs.length - 1)]);
        return open && (i === N - 1 || i === M - N - 1);
      };
      return loft(rings, zs, XY, { capStart: capS, capEnd: capE, skip });
    };
    const softC = clamp01(pose.soft);
    const deps = [r3(swing), r3(fuse), r3(grow), r3(zShelf), r3(pose.cleft)];
    const zsHard = stations(Z_SOFT, zShelf, 44);
    const zsSoft = stations(Z_BACK, Z_SOFT, 18);
    const key = whole > 0.01 ? 1 : 0;
    add('shelves-hard', 'aho-sabai-gandorrak', cachedMesh('palate-hard', [...deps, key], () => build(zsHard, false, true)), SHELF, { groups: ['aho-sabai-gogorra'], tissue: 'mesenchyme' });
    add('shelves-soft', 'aho-sabai-gandorrak', cachedMesh('palate-soft', [...deps, key], () => build(zsSoft, true, false)), mixHex(SHELF, SOFT, softC), { groups: ['aho-sabai-biguna'], tissue: 'mesenchyme' });
    // Anchors: inside each shelf at its middle, on the cut when cut, on its underside from below.
    const midA = 0.55;
    const th = (1 - swing) * 1.33;
    const L0 = X_ROOT + 0.18;
    const ax = X_ROOT + 0.18 - L0 * midA * Math.cos(th);
    const ay = -L0 * midA * Math.sin(th);
    pts['aho-sabai-gandorrak'] = whole > 0.5 ? [0.62, -T, -0.4] : [ax, ay, Z_CUT + 0.01];
    pts['aho-sabai-gogorra'] = [-0.55, -T, 0.1];
    pts['aho-sabai-biguna'] = [0.5, -T, -1.5];
  }

  // ———— the septum, coming down from the roof to the palate ————
  {
    const yTip = lerp(1.7, T * 0.5, sept);
    const n = 18;
    const closes = ss(0.92, 1, sept);
    const ring: P2[] = [];
    for (let i = 0; i < n; i++) {
      const a = i / (n - 1);
      const y = lerp(2.55, yTip, a);
      ring.push([-(0.1 + 0.04 * a + closes * 0.16 * ss(0.78, 1, a) ** 2) * lerp(round(a, 5), 1, closes), y]);
    }
    const ringAll: P2[] = [...ring, ...[...ring].reverse().map(([x, y]): P2 => [-x, y])];
    const zs = [Z_BACK, Math.min(zFront, Z_J)];
    add('septum', 'sudur-trenkada', cachedMesh('palate-septum', [r3(yTip), r3(closes), r3(zs[1])], () => loft([ringAll, ringAll], zs, XY, { capEnd: true })), BONE, { deep: TISSUE.boneDeep, tissue: 'cartilage' });
    pts['sudur-trenkada'] = [0, lerp(2.2, 0.95, sept), zs[1] + 0.01];
  }

  // ———— the conchae, curling out of the side walls ————
  {
    const zs = [Z_BACK, Z_CUT];
    const defs = [
      { id: 'goiko-kornetea', y: 1.72, x: 0.7, L: 0.3, c: TISSUE.cartilage },
      { id: 'tarteko-kornetea', y: 1.2, x: 0.8, L: 0.36, c: TISSUE.cartilage },
      { id: 'beheko-kornetea', y: 0.66, x: 0.95, L: 0.44, c: '#c7a6e0' },
    ];
    if (conch > 0.01 && whole < 0.5) {
      for (const d of defs) {
        for (const s of [-1, 1]) {
          const spine: P2[] = stations(0, 1, 14).map((a) => [s * (d.x + 0.1 - d.L * conch * Math.sin(a * 1.75)), d.y + 0.05 - 0.55 * d.L * conch * (1 - Math.cos(a * 1.75))]);
          const ring = ribbonRing(spine, (a) => 0.06 * (1 - 0.45 * a) * round(a, 6));
          add(`c-${d.id}-${s}`, d.id, cachedMesh('palate-concha', [d.y, s, r3(conch)], () => loft([ring, ring], zs, XY, { capEnd: true })), d.c, { groups: ['korneteak'], tissue: 'bone', deep: darker(d.c) });
        }
        pts[d.id] = [-(d.x - d.L * conch * 0.45), d.y - 0.05 * conch, Z_CUT + 0.01];
      }
      pts['korneteak'] = pts['tarteko-kornetea'];
    }
  }

  // ———— the view from below: the primary triangle, the maxillary ridge, foramen, raphe, teeth, lip ————
  {
    const show = clamp01(pose.segShow) * ss(0.02, 0.5, whole);
    const seg = clamp01(pose.seg);
    const sep = (1 - ss(0, 0.97, seg)) * 0.36;
    if (show > 0.01) {
      const zs = stations(Z_F, Z_END - 0.02, 24);
      const N = 9;
      const ringAt = (z: number): P2[] => {
        const h = tri(z);
        const top: P2[] = [];
        const bot: P2[] = [];
        for (let s = -1; s <= 1; s += 2) {
          for (let c = 0; c < N; c++) {
            const a = c / (N - 1);
            const k = s < 0 ? 1 - a : a;
            const x = Math.min(hw(z), sep + k * h) * s;
            const t = T * (seg >= 0.97 ? 1 : round(1 - k, 4)) * 0.98;
            top.push([x, t]);
            bot.push([x, -t]);
          }
        }
        return [...top, ...bot.reverse()];
      };
      const M = N * 4;
      const open = seg < 0.97;
      add('primary', 'hasierako-aho-sabaia', cachedMesh('palate-primary', [r3(seg)], () => loft(zs.map(ringAt), zs, XY, { capEnd: true, skip: (_r, i) => open && (i === N - 1 || i === M - N - 1) })), PRIMARY, { groups: ['aho-sabai-gogorra', 'maxilar-arteko-segmentua'], opacity: show, tissue: 'mesenchyme' });
      pts['hasierako-aho-sabaia'] = [0.14, -T, 1.45];
      pts['maxilar-arteko-segmentua'] = [0.2, -0.42, 2.1];
      // The ridge: the maxillary processes round the sides, the segment at the front.
      for (const s of [-1, 1]) {
        const line: V3[] = stations(Z_BACK, Z_J, 22).map((z) => [s * (hw(z) + 0.24), -0.42, z]);
        tube(`ridge${s}`, 'luzapen-maxilarra', line, SHELF, 0.3, { opacity: show, tissue: 'mesenchyme' });
      }
      pts['luzapen-maxilarra'] = [1.49, -0.72, -0.3];
      const arc = (from: number, to: number, off: number): V3[] =>
        stations(from, to, 18).map((t): V3 => [Math.sign(t) * Math.min(hw(Z_J) + 0.24, Math.abs(t)) + Math.sign(t) * off, -0.42, Z_END - 0.0 - (0.5 * Math.abs(t) * Math.abs(t)) / (hw(Z_J) + 0.24)]);
      const A = hw(Z_J) + 0.24;
      if (open) {
        tube('ridge-seg-r', 'maxilar-arteko-segmentua', arc(-A, -0.001, sep), PRIMARY, 0.3, { opacity: show, groups: ['hasierako-aho-sabaia'] });
        tube('ridge-seg-l', 'maxilar-arteko-segmentua', arc(0.001, A, sep), PRIMARY, 0.3, { opacity: show, groups: ['hasierako-aho-sabaia'] });
      } else {
        tube('ridge-seg', 'maxilar-arteko-segmentua', arc(-A, A, 0), PRIMARY, 0.3, { opacity: show, groups: ['hasierako-aho-sabaia'] });
      }
    }
    // The incisors and the other teeth, on the ridge.
    const teeth = clamp01(pose.teeth);
    if (teeth > 0.01) {
      const A = hw(Z_J) + 0.24;
      const place = (t: number): V3 => [t, -0.74, Z_END - (0.5 * t * t) / A];
      [-0.66, -0.22, 0.22, 0.66].forEach((t, i) => ball(`incisor${i}`, 'ebakortzak', place(t), [0.17, 0.14 * ss(0, 1, teeth) + 0.01, 0.11], '#fbf8ee', { tissue: 'bone', deep: '#9a927c' }));
      pts['ebakortzak'] = place(0.22);
      for (const s of [-1, 1]) {
        [1.3, 0.8, 0.3, -0.2, -0.7, -1.2].forEach((z, i) => ball(`tooth${s}${i}`, undefined, [s * (hw(z) + 0.24), -0.74, z], [0.14, 0.12, 0.17], '#efe9d8', { tissue: 'bone', deep: '#8a826d', quiet: true, opacity: teeth }));
      }
    }
    ball('foramen', 'ebakortz-zuloa', [0, -T - 0.005, Z_F], [0.11, 0.03, 0.11], '#2a2230', { opacity: clamp01(pose.foramen), outline: false });
    pts['ebakortz-zuloa'] = [0, -T - 0.02, Z_F];
    const raphe = clamp01(pose.raphe);
    if (raphe > 0.01) {
      const z1 = lerp(Z_F - 0.12, Z_BACK, raphe);
      tube('raphe', 'aho-sabaiko-errafea', [[0, -T - 0.005, Z_F - 0.12], [0, -T - 0.008, (Z_F - 0.12 + z1) / 2], [0, -T - 0.005, z1]], '#fff0c2', 0.025, { outline: false, tissue: 'membrane' });
      pts['aho-sabaiko-errafea'] = [0, -T - 0.02, lerp(Z_F, Z_BACK, 0.4)];
    }
    const softK = clamp01(pose.soft);
    ball('uvula', 'ubula', [0, -0.2, Z_BACK - 0.14], [0.13, 0.3, 0.1], SOFT, { opacity: ss(0.15, 1, softK), groups: ['aho-sabai-biguna'] });
    pts['ubula'] = [0, -0.34, Z_BACK - 0.16];
    // A palate that did not close: the gap has a body, the nasal cavity seen through it.
    const cleft = clamp01(pose.cleft);
    if (cleft > 0.01) {
      const zs = [Z_BACK, Z_F];
      const hx = 0.34 * cleft;
      const ring: P2[] = [[-hx, 0.05], [0, 0.05], [hx, 0.05], [hx, 0.0], [0, 0.0], [-hx, 0.0]];
      add('cleft', 'aho-sabai-arraila', cachedMesh('palate-cleft', [r3(hx)], () => loft([ring, ring], zs, XY, { capStart: true, capEnd: true })), HOLE, { outline: false });
      pts['aho-sabai-arraila'] = [0, -0.02, -0.5];
    }
    // The upper lip round the front; a cleft is a real gap in it.
    const lip = clamp01(pose.lip);
    if (lip > 0.01) {
      const at = (p: number): V3 => [1.95 * Math.sin(p), -0.55, Z_CUT + 2.28 * Math.cos(p)];
      const pieces: [number, number][] = [];
      const gap = (s: number, k: number): [number, number] => [s * 0.3 - 0.13 * k, s * 0.3 + 0.13 * k];
      const L = clamp01(pose.lipL);
      const R = clamp01(pose.lipR);
      const [l0, l1] = gap(1, L);
      const [r0, r1] = gap(-1, R);
      if (R > 0.01) pieces.push([-1.0, r0], [r1, L > 0.01 ? l0 : 1.0]);
      else pieces.push([-1.0, L > 0.01 ? l0 : 1.0]);
      if (L > 0.01) pieces.push([l1, 1.0]);
      pieces.forEach(([a, b], i) => {
        if (b - a < 0.02) return;
        tube(`lip${i}`, 'goiko-ezpaina', stations(a, b, 16).map(at), TISSUE.skin, 0.17, { opacity: lip, tissue: 'skin', deep: TISSUE.skinDeep });
      });
      pts['goiko-ezpaina'] = at(-0.62);
      if (L > 0.01) {
        ball('cleft-lip', 'erbi-ezpaina', at(0.3), [0.12, 0.16, 0.12], HOLE, { opacity: L, outline: false });
        pts['erbi-ezpaina'] = at(0.3);
      }
      if (R > 0.01) ball('cleft-lip-r', 'erbi-ezpaina', at(-0.3), [0.12, 0.16, 0.12], HOLE, { opacity: R, outline: false });
    }
  }
  return { items, pts };
}

// ———————————————————————————— the sagittal cut: the nose, the choana ————————————————————————————

export interface ChoanaPose {
  /** The pit deepens (0..1); the buconasal membrane forms (0..1) and breaks (0..1); the palate carries the choana back (0..1). */
  pit: number;
  memb: number;
  breakUp: number;
  back: number;
}

export const CH0: ChoanaPose = { pit: 0.08, memb: 0, breakUp: 0, back: 0 };

export function choanaModel(pose: ChoanaPose, o: PalateOpts = {}) {
  const items: Item3[] = [];
  const pts: Record<string, V3> = {};
  const dim = o.dim;
  const fade = (id: string, groups?: readonly string[]) => (!dim || dim.k <= 0.001 || dim.ids.includes(id) || (groups ?? []).some((g) => dim.ids.includes(g)) ? 1 : 1 - 0.7 * dim.k);
  const add = (key: string, id: string | undefined, mesh: Mesh, color: string, extra: Partial<Item3> = {}) => {
    const op = extra.opacity ?? 1;
    if (op <= 0.01) return;
    items.push({ key, id, mesh, hit: mesh, color, deep: darker(color), tissue: 'mesenchyme', ...extra, opacity: op * (id ? fade(id, extra.groups) : 1) });
  };
  const pit = clamp01(pose.pit);
  const memb = clamp01(pose.memb);
  const brk = clamp01(pose.breakUp);
  const back = ss(0, 1, pose.back);
  const P = (u: number, v: number, w = 0.01): V3 => SAG(u, v, w);
  const W = [-0.7, 0];

  // The solid head, cut down the nostril: above the mouth, and below it.
  const up = cr([[-2.05, -0.22], [-2.28, 0.95], [-2.15, 1.8], [-1.2, 2.85], [0.7, 3.35], [2.5, 3.1], [3.5, 2.2]], 30);
  const roof = cr([[-2.05, -0.3], [-1.2, -0.2], [-0.2, -0.1], [1.4, -0.02], [3.5, 0.05]], 30);
  const ringUp: P2[] = [...up, ...[...roof].reverse()];
  add('head-up', undefined, cachedMesh('choana-up', [], () => loft([ringUp, ringUp], W, SAG, { capEnd: true })), CUT, { deep: CUT_DEEP, quiet: true, ground: true });
  const floor = cr([[-1.95, -0.85], [-1.2, -0.95], [0.4, -1.1], [2.2, -1.5], [3.5, -1.7]], 24);
  const chin = cr([[-1.95, -0.85], [-2.0, -1.6], [-1.3, -2.5], [0.6, -3.0], [2.4, -3.1], [3.5, -3.1]], 24);
  const ringLo: P2[] = [...floor, ...[...chin].reverse()];
  add('head-lo', undefined, cachedMesh('choana-lo', [], () => loft([ringLo, ringLo], W, SAG, { capEnd: true })), CUT, { deep: CUT_DEEP, quiet: true, ground: true });
  // The mouth's and pharynx's space, drawn behind.
  const ringMouth: P2[] = [...roof, ...[...cr([[-2.05, -0.85], [-1.2, -0.95], [0.4, -1.1], [2.2, -1.5], [3.5, -1.7]], 30)].reverse()];
  add('mouth', 'aho-barrunbea', cachedMesh('choana-mouth', [], () => loft([ringMouth, ringMouth], [-0.72, -0.5], SAG, { capEnd: true })), HOLE_ORAL, { quiet: true });
  pts['aho-barrunbea'] = P(-1.3, -0.56, -0.48);

  // The tongue on the floor of the mouth.
  const tSpine = cr([[-1.3, -1.0], [-0.5, -0.8], [0.6, -0.95], [1.6, -1.45]], 18);
  const ringTongue = ribbonRing(tSpine, (a) => 0.3 * round(Math.abs(2 * a - 1), 4));
  add('tongue', 'mihia', cachedMesh('choana-tongue', [], () => loft([ringTongue, ringTongue], [-0.5, 0.0], SAG, { capEnd: true })), TONGUE, { tissue: 'muscle' });
  pts['mihia'] = P(-0.3, -0.85, 0.01);

  // The pit, deepening from the nostril to above the roof of the mouth.
  const pitLine = cr([[-2.24, 0.95], [-1.6, 0.85], [-0.95, 0.62], [-0.5, 0.34], [-0.3, 0.14]], 26);
  const nPit = Math.max(3, Math.round(lerp(3, 26, pit)));
  const ringPit = ribbonRing(pitLine.slice(0, nPit), (a) => lerp(0.1, 0.3, ss(0, 0.5, a)) * round(a, 6));
  add('pit', 'sudur-barrunbea', cachedMesh('choana-pit', [nPit], () => loft([ringPit, ringPit], [-0.5, 0.012], SAG, { capEnd: true })), HOLE, { groups: ['sudur-hobitxoa', 'narina'], outline: false });
  pts['sudur-barrunbea'] = pitLine[Math.max(2, Math.floor(nPit * 0.72))] ? P(pitLine[Math.floor(nPit * 0.72)][0], pitLine[Math.floor(nPit * 0.72)][1], 0.02) : P(-1.6, 0.85);
  pts['sudur-hobitxoa'] = P(-2.0, 0.92, 0.02);
  pts['narina'] = P(-2.14, 0.95, 0.02);

  // The nasal cavity grows back over the palate.
  const tipU = lerp(-0.3, 2.3, back);
  if (back > 0.01) {
    const line = cr([[-0.5, 0.52], [(tipU - 0.5) / 2, 0.68], [tipU, 0.56]], 16);
    const ringN = ribbonRing(line, (a) => 0.44 * round(Math.abs(2 * a - 1), 8));
    add('nose-back', 'sudur-barrunbea', cachedMesh('choana-noseback', [r3(tipU)], () => loft([ringN, ringN], [-0.5, 0.012], SAG, { capEnd: true })), HOLE, { outline: false });
  }

  // The primary palate: the wedge between the pit and the mouth.
  const primTop = cr([[-1.98, 0.6], [-1.3, 0.42], [-0.72, 0.1], [-0.55, -0.02]], 16);
  const primBot = cr([[-2.05, -0.28], [-1.4, -0.21], [-0.9, -0.16], [-0.55, -0.12]], 16);
  const ringPrim: P2[] = [...primTop, ...[...primBot].reverse()];
  add('prim', 'hasierako-aho-sabaia', cachedMesh('choana-prim', [], () => loft([ringPrim, ringPrim], [-0.5, 0.02], SAG, { capEnd: true })), PRIMARY, { tissue: 'mesenchyme' });
  pts['hasierako-aho-sabaia'] = P(-1.45, 0.1, 0.03);

  // The secondary palate, growing backwards and carrying the choana.
  if (back > 0.01) {
    const line = cr([[-0.6, -0.05], [(tipU - 0.6) / 2, 0.0], [tipU, 0.0]], 16);
    const ringS = ribbonRing(line, (a) => 0.13 * (a > 0.8 ? round((a - 0.8) / 0.2, 2) : 1));
    add('secondary', 'aho-sabai-gandorrak', cachedMesh('choana-sec', [r3(tipU)], () => loft([ringS, ringS], [-0.5, 0.03], SAG, { capEnd: true })), SHELF, { tissue: 'mesenchyme' });
    pts['aho-sabai-gandorrak'] = P(lerp(-0.4, 1.0, back), 0, 0.04);
  }

  // The buconasal membrane: thin, closing the pit's end; it tears from the middle.
  if (memb > 0.01) {
    const gapK = ss(0, 1, brk);
    if (gapK < 0.98) {
      const a = cr([[-0.68, 0.0], [-0.42, -0.02], [-0.18, -0.05]], 8);
      const pieces: P2[][] = gapK < 0.02 ? [a] : [a.map(([u, v]): P2 => [lerp(-0.68, u, 1 - gapK), v - 0.01 * gapK]).map(([u, v], i): P2 => [lerp(-0.68, u, 0.5) + 0.0 * i, v]), a.map(([u, v]): P2 => [lerp(-0.18, u, (1 - gapK) * 0.5), v])];
      pieces.forEach((pc, i) => {
        const ring = ribbonRing(pc, (t) => 0.055 * round(Math.abs(2 * t - 1), 6));
        add(`memb${i}`, 'mintz-bukonasala', cachedMesh('choana-memb', [i, r3(gapK)], () => loft([ring, ring], [-0.5, 0.05], SAG, { capEnd: true })), '#f4efe6', { tissue: 'membrane', opacity: memb });
      });
    }
    pts['mintz-bukonasala'] = P(-0.42, -0.02, 0.06);
  }

  // The choana: the open way from the nasal cavity down to the mouth, at the palate's back end.
  if (brk > 0.01) {
    const u = lerp(-0.42, tipU + 0.24, back);
    const h = 0.26 * ss(0, 1, brk);
    const top = lerp(0.3, 0.42, back);
    const ring: P2[] = [[u - h, top], [u, top + 0.06], [u + h, top], [u + h, -0.42], [u, -0.46], [u - h, -0.42]];
    add('choana', 'koana', cachedMesh('choana-way', [r3(u), r3(h)], () => loft([ring, ring], [-0.5, 0.016], SAG, { capEnd: true })), '#5a4b78', { outline: false });
    pts['koana'] = P(u, -0.16, 0.02);
  }
  pts['faringea'] = P(3.0, -0.75, -0.48);
  return { items, pts };
}
