import type { M4, V3 } from '@/lib/three-d/math';
import { curve3, grid, merge, type Mesh } from '@/lib/three-d/mesh';
import { cachedMesh } from '@/lib/three-d/mesh-cache';
import type { Item3 } from '@/lib/three-d/scene';
import { vessel } from '@/lib/three-d/organic';
import { blobParts, mixHex } from '@/components/scenes/week10/model3d';
import { ARCH, ARCH_DEEP, TISSUE } from '@/components/scenes/week17/common';
import { G18 } from './tones';

/**
 * Topic 18 §4.2 (odontogenesis). ONE solid tooth germ whose shape really changes (the notes' figures A–D and the
 * finished tooth of p.14): the lamina hangs from the thickened epithelium, its end swells into a bud, the bud's
 * underside folds in round the papilla (cap), deepens (bell) and lets go of the lamina; then enamel (outwards) and
 * dentine (inwards) are laid down from the line between them while the pulp narrows and the root grows into the
 * alveolus. `jawModel` is the block of p.15: milk teeth above, permanent germs in the bone below.
 *
 * Every part of the germ is a solid of revolution round the tooth's axis, cut open by the section plane: its back
 * half is whole (it bulges out of the tissue, which is scooped away round it so its shape is seen) and its layers
 * lie on the cut, each its own item. The epithelium is a slab with a real thickness, the lamina a sheet running
 * back along the arch, the mesenchyme a solid block (the same light ground as the topic's other cut faces).
 *
 * Own frame (a section block): x across the tooth, y towards the mouth (the crown up, as the notes draw it), z out
 * of the cut face towards the viewer. The block lies across the front of the lower jaw (components/scenes/week18/
 * sites-c.ts): x is the head's dorsal direction, z the embryo's left. The step that shows the two whole jaws first
 * (`arch`) draws them here at their real place, the block a slice of the lower one.
 */

export const TC = {
  epi: TISSUE.ecto,
  epiDeep: TISSUE.ectoDeep,
  reticulum: '#cfe7f8',
  papilla: '#ec8f80',
  papillaDeep: '#8c4a3a',
  pulp: '#ef7f86',
  odonto: '#c9574e',
  enamel: '#fbfaf3',
  enamelDeep: '#a6a08a',
  dentine: '#f1d283',
  dentineDeep: '#9b7c2c',
  cement: '#b9925a',
  cementDeep: '#6b4f28',
  ligament: '#f0a6b6',
  ligamentDeep: '#99505f',
  perm: '#4ed1c4',
  permDeep: '#1d7f76',
} as const;

/** The mesenchyme: the topic's cut-tissue ground, a touch pinker (the notes' figures); bone a cooler ivory. */
const MES = mixHex(G18.cut, '#f0b8a8', 0.25);
const MES_DEEP = G18.cutDeep;
const BONE = '#f2ead6';
const BONE_DEEP = '#958a6f';
const CELL = '#9a6a52';

export interface ToothPose {
  /** The two C-shaped jaws seen whole (0..1); the section block takes over as it goes. */
  arch: number;
  /** The epithelium thickens (0..1), the lamina pushes in (0..1). */
  thick: number;
  lam: number;
  /** The tip becomes a cap (0..1) round the papilla (0..1); inner/outer epithelium read apart (0..1). */
  cap: number;
  pap: number;
  /** The cap deepens into a bell (0..1) and lets go of the lamina (0..1). */
  bell: number;
  free: number;
  /** Cell layers appear (0..1). */
  cells: number;
  /** Dentine and enamel deposit (0..1). */
  dep: number;
  /** The root grows (0..1), cementum on it (0..1), ligaments (0..1), mesenchyme becomes alveolar bone (0..1). */
  root: number;
  cem: number;
  lig: number;
  alv: number;
  /** The tooth erupts: the crown through the epithelium (0..1). */
  rise: number;
  /** Arteries, veins and nerve in the pulp (0..1). */
  vess: number;
}

export const TP0: ToothPose = { arch: 0, thick: 0, lam: 0, cap: 0, pap: 0, bell: 0, free: 0, cells: 0, dep: 0, root: 0, cem: 0, lig: 0, alv: 0, rise: 0, vess: 0 };

export interface ToothOpts {
  dim?: { ids: readonly string[]; k: number } | null;
}

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const ss = (a: number, b: number, x: number) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const darker = (c: string) => mixHex(c, '#000000', 0.5);
const q4 = (x: number) => Math.round(x * 1e4) / 1e4;

type P2 = [number, number];
const N = 44;
const CROWN = 0.6;
/** The block: half width, the epithelium's top, the bottom, the back. */
const W = 3.3;
const YE = 2.1;
const YB = -3.6;
const ZB = -2.4;

/** The line between enamel and dentine (the inner epithelium before), apex → neck → root tip, as [r, y]. */
function junction(R: number, H: number, apex: number, root: number): P2[] {
  const out: P2[] = [];
  const neckY = apex - H;
  const neckR = R * lerp(1, 0.84, ss(0, 0.4, root));
  const L = root * 2.1;
  for (let i = 0; i <= N; i++) {
    const s = i / N;
    if (s <= CROWN) {
      const th = (s / CROWN) * (Math.PI / 2);
      // The crown's shoulder pulls in to the neck once the root is there.
      const r = R * Math.pow(Math.sin(th), 0.82) * lerp(1, lerp(1, 0.84, ss(0, 0.4, root)), ss(0.7, 1, s / CROWN));
      out.push([r, apex - H * (1 - Math.cos(th))]);
    } else {
      const v = (s - CROWN) / (1 - CROWN);
      // The root narrows to its tip only as it grows: with no root yet its points stay at the neck, so the dentine and
      // papilla do not run a flat, folded ledge inwards under the crown (it showed as a yellow foot over the pulp).
      out.push([neckR * (1 - Math.pow(v, 1.5) * 0.76 * ss(0, 0.2, root)), neckY - L * v]);
    }
  }
  return out;
}

/** Offset a half-profile along its normal: d > 0 towards the axis, d < 0 away from it. */
function offset(p: readonly P2[], d: (s: number, i: number) => number): P2[] {
  return p.map((q, i) => {
    const a = p[Math.max(0, i - 1)];
    const b = p[Math.min(p.length - 1, i + 1)];
    let tx = b[0] - a[0];
    let ty = b[1] - a[1];
    const l = Math.hypot(tx, ty);
    if (l < 1e-5) {
      tx = 0;
      ty = -1;
    } else {
      tx /= l;
      ty /= l;
    }
    const k = d(i / (p.length - 1), i);
    return [Math.max(0, q[0] + ty * k), q[1] - tx * k] as P2;
  });
}

const mirror = (p: readonly P2[]): P2[] => [...p.slice().reverse().map((q) => [-q[0], q[1]] as P2), ...p.slice(1)];
const axis = (p: readonly P2[]): P2[] => p.map((q) => [0, q[1]]);
const flat = (ps: readonly P2[]) => ps.flatMap((p) => [q4(p[0]), q4(p[1])]);

interface Xf {
  x: number;
  y: number;
  s: number;
}

/** A layer's face on the cut (z = 0): the band between its outer and inner half-profiles, mirrored. */
function faceMesh(outer: P2[], inner: P2[], f: Xf, z = 0.004): Mesh {
  return cachedMesh('tooth-face', [...flat(outer), ...flat(inner), f.x, f.y, f.s, z], () => {
    const a = mirror(outer);
    const b = mirror(inner);
    const n = a.length - 1;
    const at = (u: number, v: number): V3 => {
      const i = Math.min(n, Math.round(u * n));
      return [f.x + f.s * lerp(a[i][0], b[i][0], v), f.y + f.s * lerp(a[i][1], b[i][1], v), z];
    };
    const m = grid(n, 1, at, [f.x, f.y, 60]);
    // grid() judges the facing at the patch's middle, on the axis, where a band round the apex can be degenerate: judge the whole band.
    let area = 0;
    for (let k = 0; k < m.idx.length; k += 3) {
      const [p, q, r] = [m.idx[k] * 3, m.idx[k + 1] * 3, m.idx[k + 2] * 3];
      area += (m.pos[q] - m.pos[p]) * (m.pos[r + 1] - m.pos[p + 1]) - (m.pos[r] - m.pos[p]) * (m.pos[q + 1] - m.pos[p + 1]);
    }
    if (area < 0) {
      for (let k = 0; k < m.idx.length; k += 3) [m.idx[k + 1], m.idx[k + 2]] = [m.idx[k + 2], m.idx[k + 1]];
      for (let k = 0; k < m.nrm.length; k++) m.nrm[k] = -m.nrm[k];
    }
    return m;
  });
}

/**
 * A half-profile (apex on the axis → rim, then one closing point) turned round the tooth's axis through the back
 * half (z ≤ 0): the layer's whole outer surface behind the cut. Smooth normals from the surface itself.
 */
function shellMesh(p: P2[], f: Xf, sides = 30): Mesh {
  return cachedMesh('tooth-shell', [...flat(p), f.x, f.y, f.s, sides], () => {
    const n = p.length - 1;
    const at = (u: number, v: number): V3 => {
      const i = Math.min(n, Math.round(u * n));
      const th = Math.PI + Math.PI * v;
      const r = p[i][0];
      return [f.x + f.s * r * Math.cos(th), f.y + f.s * p[i][1], f.s * r * Math.sin(th)];
    };
    // Outward at the middle of the profile: left of the way it runs (apex → rim), seen at the back (θ = 3π/2).
    const i = Math.max(1, Math.min(n - 1, Math.floor(n * 0.4)));
    const tx = p[i + 1][0] - p[i - 1][0];
    const ty = p[i + 1][1] - p[i - 1][1];
    const nr = -ty;
    const ny = tx;
    const c = at(i / n, 0.5);
    return grid(n, sides, at, [c[0], c[1] + 50 * ny, c[2] - 50 * nr]);
  });
}

/**
 * Each layer's face sits a little proud of the cut, the deeper tissue lower: the odontoblasts are drawn over the
 * papilla's edge and the dentine's inner line can fold at the neck, and two faces at one depth flicker into stripes
 * (z-fighting). Pulp/papilla lowest, then the odontoblasts, then everything else, dentine on top of its neighbours.
 */
const FACE_Z = (key: string) => (key === 'papilla' || key.endsWith('-pulp') ? 0.002 : key === 'odonto' ? 0.004 : key === 'dentine' || key.endsWith('-dent') ? 0.008 : 0.006);

/** Items collected for one model, with the shared dim rule. */
function maker(dim: ToothOpts['dim']) {
  const items: Item3[] = [];
  const fade = (id?: string, groups?: readonly string[]) => (!id || !dim || dim.k <= 0.001 || dim.ids.includes(id) || (groups ?? []).some((g) => dim.ids.includes(g)) ? 1 : 1 - 0.3 * dim.k);
  /**
   * One layer of a solid of revolution cut open: its face on the cut and (`shell`) its outer surface behind it.
   * Solid layers keep full opacity when unlit (they grey, the stage's recede does that), and only fade to go.
   */
  const layer = (key: string, id: string | undefined, outer: P2[], inner: P2[], color: string, deep: string, op: number, f: Xf, extra: Partial<Item3> = {}, shell = true, matrix?: M4) => {
    if (op <= 0.01) return;
    const opacity = op;
    const face = faceMesh(outer, inner, f, FACE_Z(key));
    items.push({ key, id, mesh: face, hit: face, color, deep, tissue: 'mesenchyme', opacity, outline: false, matrix, ...extra });
    if (shell) {
      const sh = shellMesh([...outer, inner[inner.length - 1]], f);
      items.push({ key: `${key}-s`, id, mesh: sh, hit: sh, color, deep, tissue: 'mesenchyme', opacity, outline: false, matrix, ...extra });
    }
  };
  return { items, fade, layer };
}

/** The tissue round the germ is scooped away so the germ's back half shows: depth at (x, y). */
interface Dish {
  x: number;
  y: number;
  rx: number;
  ry: number;
  d: number;
}
const dishAt = (ds: readonly Dish[], x: number, y: number) => {
  let z = 0;
  for (const D of ds) {
    const k = 1 - ((x - D.x) / D.rx) ** 2 - ((y - D.y) / D.ry) ** 2;
    if (k > 0) z = Math.max(z, D.d * k ** 1.5);
  }
  return z;
};

/** A block of tissue under a slab: its front scooped by `dishes`, its top following `topAt(x)`. Solid all round. */
function blockMesh(key: string, ds: readonly Dish[], w: number, yb: number, zb: number, topAt: (x: number) => number, topDeps: readonly number[]): Mesh {
  return cachedMesh(`tooth-block-${key}`, [...ds.flatMap((d) => [q4(d.x), q4(d.y), q4(d.rx), q4(d.ry), q4(d.d)]), w, yb, zb, ...topDeps], () => {
    const front = grid(64, 52, (u, v) => {
      const x = lerp(-w, w, u);
      const y = lerp(yb, topAt(x), v);
      return [x, y, -dishAt(ds, x, y)];
    }, [0, 0, 100]);
    const side = (s: number) => grid(10, 12, (u, v) => [s * w, lerp(yb, topAt(s * w), v), lerp(zb, 0, u)], [s * 100, 0, -1]);
    const bottom = grid(16, 10, (u, v) => [lerp(-w, w, u), yb, lerp(zb, 0, v)], [0, -100, -1]);
    const back = grid(16, 12, (u, v) => [lerp(-w, w, u), lerp(yb, topAt(lerp(-w, w, u)), v), zb], [0, 0, -100]);
    return merge([front, side(-1), side(1), bottom, back]);
  });
}

/**
 * A slab of epithelium (gum) on top of a block: the top `yTop(x)`, the underside `yBot(x)`, running back to `zb`;
 * its face on the cut opened between ±`open` where a crown comes through.
 */
function slabMesh(key: string, w: number, zb: number, yTop: (x: number) => number, yBot: (x: number) => number, open: number, deps: readonly number[]): Mesh {
  return cachedMesh(`tooth-slab-${key}`, [w, zb, q4(open), ...deps], () => {
    const top = grid(48, 10, (u, v) => {
      const x = lerp(-w, w, u);
      return [x, yTop(x), lerp(zb, 0, v)];
    }, [0, 100, -1]);
    const under = grid(48, 10, (u, v) => {
      const x = lerp(-w, w, u);
      return [x, yBot(x), lerp(zb, 0, v)];
    }, [0, -100, -1]);
    const parts = [top, under];
    const flank = (a: number, b: number) =>
      grid(24, 2, (u, v) => {
        const x = lerp(a, b, u);
        return [x, lerp(yBot(x), yTop(x), v), 0];
      }, [(a + b) / 2, 0, 100]);
    if (open > 0.02) parts.push(flank(-w, -open), flank(open, w));
    else parts.push(flank(-w, w));
    for (const s of [-1, 1]) parts.push(grid(6, 2, (u, v) => [s * w, lerp(yBot(s * w), yTop(s * w), v), lerp(zb, 0, u)], [s * 100, 0, -1]));
    return merge(parts);
  });
}

/** A sheet in the plane x = 0, `half(v)` thick on each side, from `y0` down to `y1`, running back from the cut to `zb`. */
function sheetMesh(key: string, y0: number, y1: number, half: (v: number) => number, zb: number, deps: readonly number[]): Mesh {
  return cachedMesh(`tooth-sheet-${key}`, [q4(y0), q4(y1), zb, ...deps], () => {
    const n = 16;
    const side = (s: number) =>
      grid(n, 6, (u, v) => {
        // Round at the far end (its edge on the germ): the thickness closes over the last share.
        const y = lerp(y0, y1, u);
        return [s * half(u), y, lerp(zb, 0, v)];
      }, [s * 100, (y0 + y1) / 2, -1]);
    const out: P2[] = Array.from({ length: n + 1 }, (_, i) => [half(i / n), lerp(y0, y1, i / n)]);
    const face = faceMesh(out, axis(out), { x: 0, y: 0, s: 1 }, 0.01);
    return merge([side(-1), side(1), face]);
  });
}

/** Scale about a point (the block grows out of its slice of the jaw). */
const scaleAbout = (k: number, c: V3): M4 => {
  const m = new Float32Array(16);
  m[0] = k;
  m[5] = k;
  m[10] = k;
  m[15] = 1;
  m[12] = (1 - k) * c[0];
  m[13] = (1 - k) * c[1];
  m[14] = (1 - k) * c[2];
  return m;
};
const at = (m: M4 | undefined, p: V3): V3 => (m ? [m[0] * p[0] + m[12], m[5] * p[1] + m[13], m[10] * p[2] + m[14]] : p);

/** Fixed spots for the mesenchyme's scattered cells (the notes' figures), and the bone's lacunae afterwards. */
const SPOTS: P2[] = (() => {
  const out: P2[] = [];
  let s = 7;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let y = YB + 0.35; y < YE - 0.45; y += 0.48)
    for (let x = -W + 0.3; x < W - 0.2; x += 0.55) out.push([x + (rnd() - 0.5) * 0.36, y + (rnd() - 0.5) * 0.3]);
  return out;
})();

export function toothModel(pose: ToothPose, o: ToothOpts = {}) {
  const { items, fade, layer } = maker(o.dim);
  const pts: Record<string, V3> = {};
  const f: Xf = { x: 0, y: 0, s: 1 };

  // ———— the whole jaws: two C's with the lamina on them (the block is a slice of the lower one's front) ————
  const archK = ss(0.55, 0.95, pose.arch);
  const show = 1 - ss(0.45, 0.85, pose.arch);
  const sB = lerp(1, 0.33, ss(0, 0.6, pose.arch));
  const GUM: V3 = [0, YE, 0];
  const M = sB < 0.999 ? scaleAbout(sB, GUM) : undefined;
  if (archK > 0.01) {
    const RC = 6;
    const RB = 1.0;
    const c = (y: number, r = RC): V3[] => Array.from({ length: 40 }, (_, i) => {
      const a = lerp(-1.9, 1.9, i / 39);
      return [RC - r * Math.cos(a), y, r * Math.sin(a)];
    });
    const bar = (key: string, id: string, line: V3[], color: string, deep: string, r0: number, extra: Partial<Item3> = {}) => {
      const v = vessel(line, { r0, r1: r0 * 0.8, sides: 22, n: 40, capStart: true, capEnd: true, ref: [0, 1, 0] });
      if (v) items.push({ key, id, ...v, color, deep, tissue: 'mesenchyme', opacity: archK * fade(id, extra.groups), ...extra });
    };
    const yLow = YE - RB * 0.92;
    const yUp = YE + 1.5 + RB * 0.92;
    bar('jaw-up', 'hezur-maxilarra', c(yUp), ARCH.i, ARCH_DEEP.i, RB);
    bar('jaw-low', 'baraila', c(yLow), ARCH.i, ARCH_DEEP.i, RB);
    const lr = 0.16 * (0.35 + 0.65 * pose.thick);
    bar('lam-up', 'hortz-lamina', c(yUp - RB * 0.86, RC - 0.05), TC.epi, TC.epiDeep, lr, { tissue: 'epithelium' });
    bar('lam-low', 'hortz-lamina', c(yLow + RB * 0.86, RC - 0.05), TC.epi, TC.epiDeep, lr, { tissue: 'epithelium' });
    pts['hezur-maxilarra'] = [RC * (1 - Math.cos(1.2)), yUp + 0.7, RC * Math.sin(1.2)];
    pts['baraila'] = [RC * (1 - Math.cos(-1.3)), yLow - 0.5, RC * Math.sin(-1.3)];
    pts['hortz-lamina'] = [RC * (1 - Math.cos(0.5)), yLow + RB * 0.9, RC * Math.sin(0.5)];
  }

  // ———— the tooth's outline for this pose ————
  const shift = 1.5 * ss(0, 1, pose.rise);
  const lam = clamp01(pose.lam);
  const cap = clamp01(pose.cap);
  const bell = clamp01(pose.bell);
  // Bud: the lamina's end swells into a round bud whose underside is flat; cap: the underside folds in; bell: deep.
  const R = lerp(lerp(0.12, 0.42, lam), lerp(0.98, 0.96, bell), ss(0, 1, cap));
  const H = lerp(lerp(0.02, 0.06, lam), lerp(0.62, 1.72, ss(0, 1, bell)), ss(0, 1, cap));
  const apex0 = lerp(YE - 0.42 - lam * 0.9, 0.8, ss(0, 1, cap));
  const apex = lerp(apex0, 1.05, ss(0, 1, bell)) + shift;
  const J = junction(R, H, apex, pose.root);
  const neckY = apex - H;
  const dep = clamp01(pose.dep);

  // Enamel grows outwards from the line, on the crown only; dentine inwards, on crown and root.
  const eThick = (s: number) => dep * 0.27 * (1 - ss(0.42, CROWN, s));
  const dThick = (s: number, i: number) => {
    const d = dep * 0.33;
    return s > CROWN ? Math.min(d, J[i][0] * 0.68) : d;
  };
  const enamelOut = offset(J, (s) => -eThick(s));
  const dentineIn = offset(J, dThick);

  // The enamel organ, outside the enamel: a bud (thick over a flat underside), a cap, a bell; gone as the tooth erupts.
  const organK = 1 - ss(0.05, 0.6, pose.rise);
  const budK = 1 - ss(0, 0.7, cap);
  const orgT = (s: number) => {
    if (s > CROWN) return 0;
    const u = s / CROWN;
    // The bud: a dome over the flat underside (radius R, height ≈ 1.5 R); the cap and bell: a wall that thins to the rim.
    const bud = 1.5 * R * Math.sqrt(Math.max(0, 1 - u * u)) + 0.04;
    const wall = lerp(0.2, 0.42, ss(0, 0.7, cap)) * (1 - ss(0.4, 0.98, u) * 0.9);
    return lerp(wall, bud, budK);
  };
  const epiT = (s: number) => Math.min(0.075, orgT(s) * 0.4);
  const inner0 = enamelOut;
  const inner1 = offset(enamelOut, (s) => -epiT(s));
  const outer0 = offset(enamelOut, (s) => -(orgT(s) - epiT(s)));
  const outer1 = offset(enamelOut, (s) => -orgT(s));
  const orgOp = organK * ss(0.02, 0.2, lam) * show;

  // ———— the epithelium on top: a slab thickened along the lamina's line; the crown comes through it ————
  const th = (x: number) => 0.16 + pose.thick * (0.06 + 0.22 * Math.exp(-Math.pow(x / 0.6, 2)));
  const swell = (x: number) => 0.12 * Math.exp(-Math.pow(x / 2.2, 2));
  const yTop = (x: number) => YE + swell(x);
  const yBot = (x: number) => YE - th(x);
  // The crown's half width where it passes the epithelium (0 while it is below).
  let open = 0;
  if (pose.rise > 0.01) {
    const outer = organK > 0.05 ? outer1 : enamelOut;
    for (const [r, y] of outer) if (y > YE - 0.42 && r > open) open = r;
    open = (open + 0.04) * ss(0, 0.25, pose.rise);
  }
  if (show > 0.01) {
    const slab = slabMesh('epi', W, ZB, yTop, yBot, open, [q4(pose.thick)]);
    items.push({ key: 'epi', id: 'aho-sabaiko-epitelioa', mesh: slab, hit: slab, color: TC.epi, deep: TC.epiDeep, tissue: 'epithelium', opacity: show, outline: false, matrix: M });
    pts['aho-sabaiko-epitelioa'] = at(M, [-2.3, YE - 0.05, 0.02]);
  }

  // ———— the germ's extent: the tissue round it is scooped away so its back half shows ————
  const outermost = (pose.lig > 0.01 && pose.root > 0.03 ? offset(J, (s) => -(pose.cem * 0.12 * ss(CROWN - 0.02, CROWN + 0.06, s) + 0.17 * pose.lig)) : null) ?? (organK > 0.05 && lam > 0.02 ? outer1 : enamelOut);
  let rMax = 0;
  let yLo = Infinity;
  let yHi = -Infinity;
  for (const [r, y] of [...outermost, ...J]) {
    rMax = Math.max(rMax, r);
    yLo = Math.min(yLo, y);
    yHi = Math.max(yHi, y);
  }
  yHi = Math.min(yHi, YE - 0.2);
  const germK = ss(0.05, 0.5, lam);
  const dishes: Dish[] = germK > 0.01 ? [{ x: 0, y: (yLo + yHi) / 2, rx: rMax * 1.45 + 0.35, ry: Math.max(0.3, (yHi - yLo) / 2) * 1.3 + 0.35, d: germK * Math.min(1.05, rMax * 0.85 + 0.1) }] : [];

  // ———— the block: mesenchyme, which becomes the alveolar bone round the root ————
  const bone = ss(0, 1, pose.alv);
  if (show > 0.01) {
    const id = bone > 0.5 ? 'albeoloa' : 'mesenkima';
    const mesh = blockMesh('mes', dishes, W, YB, ZB, yBot, [q4(pose.thick)]);
    items.push({ key: 'block', id, mesh, hit: mesh, color: mixHex(MES, BONE, bone), deep: mixHex(MES_DEEP, BONE_DEEP, bone), tissue: 'mesenchyme', opacity: show, outline: true, ground: true, quiet: true, groups: ['albeoloa'], matrix: M });
    pts['mesenkima'] = at(M, [-2.3, -1.5, 0.02]);
    // The mesenchyme's scattered cells; the bone's lacunae afterwards. Not where the tissue is scooped away.
    SPOTS.forEach(([x, y], i) => {
      if (y > yBot(x) - 0.2) return;
      const away = 1 - ss(0.0, 0.04, dishAt(dishes, x, y));
      if (away < 0.02) return;
      const c = mixHex(CELL, '#b8a98a', bone);
      items.push({ key: `cell${i}`, ...blobParts({ center: [x, y, 0.01], radii: [0.07, 0.045, 0.02], rings: 5, sides: 8 }), color: c, deep: darker(c), tissue: 'mesenchyme', opacity: show * away, quiet: true, ground: true, outline: false, matrix: M });
    });
  }

  // ———— the lamina: a sheet hanging from the epithelium's ridge, running back along the arch ————
  const free = clamp01(pose.free);
  const lamTop = YE - 0.1;
  const lamBot = lerp(apex + orgT(0) * 0.6 * ss(0, 0.2, lam), lamTop - 0.24, ss(0.15, 1, free));
  const lamK = 1 - ss(0.75, 1, free);
  if (lam > 0.01 && lamK > 0.01 && show > 0.01) {
    const half = (v: number) => lerp(0.3, 0.13, ss(0, 0.5, v)) * (0.4 + 0.6 * lam) * lamK;
    const zb = -Math.max(0.6, (dishes[0]?.d ?? 0) + 0.6);
    const mesh = sheetMesh('lam', lamTop, lamBot, half, zb, [q4(lam), q4(lamK), q4(zb)]);
    items.push({ key: 'lamina', id: 'hortz-lamina', mesh, hit: mesh, color: TC.epi, deep: TC.epiDeep, tissue: 'epithelium', opacity: show, outline: false, matrix: M });
    pts['hortz-lamina'] = at(M, [0, lerp(lamTop, lamBot, 0.45), 0.02]);
  }

  // ———— the enamel organ: outer epithelium, the loose middle, inner epithelium (ameloblasts) ————
  const distinct = ss(0.15, 0.8, cap);
  if (orgOp > 0.01) {
    // One solid: its outside is the outer epithelium; on the cut, three layers once they read apart.
    const nc = Math.round(N * CROWN);
    const shell = shellMesh([...outer1.slice(0, nc + 1), inner0[nc]], f);
    items.push({ key: 'org-s', id: 'kanpoko-epitelioa', mesh: shell, hit: shell, color: distinct > 0.5 ? TC.epiDeep : TC.epi, deep: '#143b57', tissue: 'epithelium', opacity: orgOp, outline: false, groups: ['txanoa', 'kanpaia', 'esmalte-organoa'] });
    layer('org-mid', 'esmalte-organoa', outer0, inner1, mixHex(TC.epi, TC.reticulum, distinct), TC.epiDeep, orgOp, f, { tissue: 'epithelium', groups: ['txanoa', 'kanpaia'] }, false);
    layer('org-outer', 'kanpoko-epitelioa', outer1, outer0, mixHex(TC.epi, TC.epiDeep, distinct), '#143b57', orgOp, f, { tissue: 'epithelium', groups: ['txanoa', 'kanpaia', 'esmalte-organoa'] }, false);
    layer('org-inner', 'barneko-epitelioa', inner1, inner0, mixHex(mixHex(TC.epi, TC.epiDeep, distinct), '#2748a8', ss(0.3, 1, pose.cells)), '#143b57', orgOp, f, { tissue: 'epithelium', groups: ['txanoa', 'kanpaia', 'esmalte-organoa', 'ameloblastoak'] }, false);
  }

  // Papilla → pulp: what is left inside the dentine (a condensation of the mesenchyme, pinker).
  const papOp = ss(0.05, 0.9, pose.pap) * show;
  const mixP = ss(0.1, 1, dep);
  layer('papilla', 'hortz-papila', dentineIn, axis(dentineIn), mixHex(TC.papilla, TC.pulp, mixP), TC.papillaDeep, papOp, f, { groups: ['hortz-pulpa'] });

  // Odontoblasts line the dentine's inner face (on the cut).
  if (pose.cells > 0.02) {
    const odIn = offset(dentineIn, (s) => 0.07 * (1 - ss(0.86, 1, s)));
    layer('odonto', 'odontoblastoak', dentineIn, odIn, TC.odonto, darker(TC.odonto), ss(0, 0.7, pose.cells) * organK * show, f, {}, false);
  }

  // Dentine (crown and root) and enamel (crown only).
  if (dep > 0.01) {
    const op = show * ss(0, 0.12, dep);
    layer('dentine', 'dentina', J, dentineIn, TC.dentine, TC.dentineDeep, op, f);
    const nc = Math.round(N * CROWN);
    layer('enamel', 'esmaltea', enamelOut.slice(0, nc + 1), J.slice(0, nc + 1), TC.enamel, TC.enamelDeep, op, f, { tissue: 'bone', groups: ['koroa'] });
    pts['esmaltea'] = [0.04, lerp(apex, enamelOut[0][1], 0.5), 0.02];
    const d0 = J[Math.round(N * 0.34)];
    const d1 = dentineIn[Math.round(N * 0.34)];
    pts['dentina'] = [lerp(d0[0], d1[0], 0.5), lerp(d0[1], d1[1], 0.5), 0.02];
  }

  // Cementum: outside the root (the notes' own figure), with cementoblasts on it while it forms.
  const rootStart = Math.round(N * CROWN);
  const cemT = (s: number) => pose.cem * 0.12 * ss(CROWN - 0.02, CROWN + 0.06, s);
  const cemOut = offset(J, (s) => -cemT(s));
  if (pose.cem > 0.01 && pose.root > 0.03) {
    layer('cement', 'zementoa', cemOut.slice(rootStart), J.slice(rootStart), TC.cement, TC.cementDeep, show * ss(0, 0.2, pose.cem), f);
    const c = cemOut[Math.round(N * 0.78)];
    pts['zementoa'] = [c[0], c[1], 0.02];
    const clast = offset(cemOut, (s) => -0.08 * ss(CROWN, CROWN + 0.05, s));
    const op = ss(0, 0.3, pose.cem) * (1 - ss(0.2, 0.9, pose.lig));
    layer('cementoblast', 'zementoblastoak', clast.slice(rootStart), cemOut.slice(rootStart), '#7a4d9a', '#3e2453', op * show, f);
    const cb = clast[Math.round(N * 0.7)];
    pts['zementoblastoak'] = [cb[0], cb[1], 0.02];
  }

  // The periodontal ligaments: the sleeve between cementum and the socket's bone.
  if (pose.lig > 0.01 && pose.root > 0.03) {
    const gap = 0.17 * pose.lig;
    const lig = offset(cemOut, () => -gap);
    const tip = lig[lig.length - 1];
    const liga = [...lig.slice(rootStart), [0, tip[1] - gap] as P2];
    const cemA = [...cemOut.slice(rootStart), [0, tip[1] - 0.01] as P2];
    layer('ligament', 'lotailu-periodontalak', liga, cemA, TC.ligament, TC.ligamentDeep, show * ss(0, 0.3, pose.lig), f);
    const q = lig[Math.round(N * 0.82)];
    pts['lotailu-periodontalak'] = [q[0] - 0.05, q[1], 0.02];
    pts['albeoloa'] = [q[0] + 0.75, q[1] + 0.2, 0.02];
  }

  // Arteries, veins and nerve running up the pulp (on the cut, as the notes' figure D).
  if (pose.vess > 0.01) {
    const yTopV = apex - 0.62;
    const yBotV = J[J.length - 1][1] - 0.6;
    const v = (key: string, id: string, dx: number, color: string) => {
      const line = curve3([[dx * 0.5, yBotV, 0.03], [dx * 0.4, yBotV + 0.8 * pose.vess, 0.03], [dx, lerp(yBotV + 0.8, yTopV, pose.vess), 0.03]] as V3[], 18);
      const t = vessel(line, { r0: 0.045, r1: 0.035, sides: 10, capStart: true, capEnd: true, ref: [0, 0, 1] });
      if (t) items.push({ key, id, ...t, color, deep: darker(color), tissue: 'vessel', opacity: show * fade(id, ['hortz-pulpa']) });
    };
    v('v-art', 'pulpa-hodiak', -0.09, TISSUE.artery);
    v('v-vein', 'pulpa-hodiak', 0.09, TISSUE.vein);
    v('v-nerve', 'pulpa-nerbioa', 0.0, TISSUE.nerve);
    pts['pulpa-hodiak'] = [-0.08, lerp(yBotV, yTopV, 0.5), 0.04];
    pts['pulpa-nerbioa'] = [0.01, lerp(yBotV, yTopV, 0.75), 0.04];
  }

  // Points for the labels (on the cut, well inside their layer).
  const mid = (a: P2[], b: P2[], i: number): P2 => [(a[i][0] + b[i][0]) / 2, (a[i][1] + b[i][1]) / 2];
  const ii = Math.round(N * 0.28);
  const m1 = mid(outer0, inner1, budK > 0.5 ? 0 : ii);
  pts['esmalte-organoa'] = [m1[0], m1[1], 0.02];
  pts['txanoa'] = pts['esmalte-organoa'];
  pts['kanpaia'] = pts['esmalte-organoa'];
  const k1 = mid(outer1, outer0, ii);
  pts['kanpoko-epitelioa'] = [k1[0], k1[1], 0.02];
  const k2 = mid(inner1, inner0, Math.round(N * 0.2));
  pts['barneko-epitelioa'] = [k2[0], k2[1], 0.02];
  pts['ameloblastoak'] = pts['barneko-epitelioa'];
  const od = dentineIn[Math.round(N * 0.4)];
  pts['odontoblastoak'] = [od[0] * 0.92, od[1], 0.02];
  pts['hortz-papila'] = [0, lerp(apex - H, apex - 0.3, 0.45), 0.02];
  pts['hortz-pulpa'] = [0, lerp(neckY, apex, 0.4), 0.02];
  pts['koroa'] = [0.25, apex - 0.3, 0.02];
  pts['sustraia'] = [J[Math.round(N * 0.82)][0] * 0.4, J[Math.round(N * 0.82)][1], 0.02];
  return { items, pts };
}

// ———————————————————————————— the jaw with both sets of teeth (p.15) ————————————————————————————

export interface JawPose {
  /** Milk teeth grow and come out (0..1). */
  milk: number;
  /** Permanent germs in the bone (0..1). */
  perm: number;
  /** Permanent teeth rise and push the milk teeth out (0..1); only the first two. */
  erupt: number;
  /** The third permanent tooth is missing (agenesis) (0..1). */
  agen: number;
  /** The kept milk tooth is extracted at 14–16 (0..1). */
  extract: number;
}

export const JP0: JawPose = { milk: 0, perm: 0, erupt: 0, agen: 0, extract: 0 };

const COLS = [-2.5, 0, 2.5] as const;
const JX = 4.1;
const JG = 1.15;
const JB = -4.6;
const JZ = -2.2;

/** A small whole tooth, solid and cut open: pulp, dentine, enamel (the enamel's colour tells milk from permanent). */
function miniTooth(layer: ReturnType<typeof maker>['layer'], prefix: string, id: string, f: Xf, root: number, op: number, enamel: string, enamelDeep: string, group: string) {
  const J = junction(0.85, 1.25, 1.2, root);
  const nc = Math.round(N * CROWN);
  const eT = (s: number) => 0.22 * (1 - ss(0.42, CROWN, s));
  const out = offset(J, (s) => -eT(s));
  const inn = offset(J, (s, i) => (s > CROWN ? Math.min(0.26, J[i][0] * 0.66) : 0.28));
  layer(`${prefix}-pulp`, id, inn, axis(inn), TC.pulp, TC.papillaDeep, op, f, { groups: [group] });
  layer(`${prefix}-dent`, id, J, inn, TC.dentine, TC.dentineDeep, op, f, { groups: [group] });
  layer(`${prefix}-enam`, id, out.slice(0, nc + 1), J.slice(0, nc + 1), enamel, enamelDeep, op, f, { groups: [group], tissue: 'bone' });
  return { J, out };
}

export function jawModel(pose: JawPose, o: ToothOpts = {}) {
  const { items, layer } = maker(o.dim);
  const pts: Record<string, V3> = {};
  const dishes: Dish[] = [];
  let open: number[] = [];
  const gumTop = (x: number) => JG + 0.1 * Math.cos((x / JX) * Math.PI * 1.5) * 0.5;
  const gumBot = (x: number) => JG - 0.24 + 0.0 * x;

  COLS.forEach((cx, k) => {
    const pushed = k < 2 ? ss(0, 1, pose.erupt) : 0;
    const extracted = k === 2 ? ss(0, 1, pose.extract) : 0;
    // The milk tooth: comes up through the gum, its root resorbed as the permanent one pushes, then it goes.
    const rise = ss(0, 1, pose.milk);
    const fall = Math.max(ss(0.55, 1, pushed), extracted);
    const my = lerp(-1.9, 0.62, rise) + 2.6 * ss(0.3, 1, fall);
    const root = 0.55 * (1 - 0.95 * ss(0, 0.7, pushed));
    const op = 1 - ss(0.6, 1, fall);
    const fm: Xf = { x: cx + 0.35 * ss(0.5, 1, fall) * (k === 0 ? -1 : 1), y: my, s: 0.68 };
    if (op > 0.01) {
      const { out } = miniTooth(layer, `milk${k}`, 'esne-hortzak', fm, root, op, TC.enamel, TC.enamelDeep, 'hortzak');
      let w = 0;
      for (const [r, y] of out) if (fm.y + fm.s * y > JG - 0.3) w = Math.max(w, r * fm.s);
      if (w > 0) open.push(fm.x - w - 0.03, fm.x + w + 0.03);
    }
    if (k === 1) pts['esne-hortzak'] = [cx, my + 0.62, 0.02];
    if (k === 2) pts['esne-hortz-gelditua'] = [fm.x, my + 0.62, 0.02];
    dishes.push({ x: cx, y: -1.3, rx: 1.15, ry: 2.5, d: 0.55 });

    // The permanent germ, in the bone below; it rises and takes the place.
    const germ = ss(0, 0.8, pose.perm) * (k === 2 ? 1 - ss(0, 0.8, pose.agen) : 1);
    if (germ > 0.01) {
      const py = lerp(-3.4, 0.62, pushed);
      const fp: Xf = { x: cx, y: py, s: 0.76 * (0.55 + 0.45 * germ) };
      const { out } = miniTooth(layer, `perm${k}`, 'behin-betiko-hortzak', fp, lerp(0.05, 0.75, pushed), germ, TC.perm, TC.permDeep, 'hortzak');
      let w = 0;
      for (const [r, y] of out) if (fp.y + fp.s * y > JG - 0.3) w = Math.max(w, r * fp.s);
      if (w > 0) open.push(fp.x - w - 0.03, fp.x + w + 0.03);
      if (k === 1) pts['behin-betiko-hortzak'] = [cx, py + 0.7, 0.02];
    }
  });
  pts['agenesia'] = [COLS[2], -2.6, 0.02];

  // The bone, scooped round each tooth's column; the gum on top, its face opened where a crown comes through.
  const mesh = blockMesh('jaw', dishes, JX, JB, JZ, gumBot, []);
  items.push({ key: 'jaw-bone', id: 'baraila', mesh, hit: mesh, color: BONE, deep: BONE_DEEP, tissue: 'bone', opacity: 1, outline: true, ground: true, quiet: true });
  pts['baraila'] = [-3.4, -3.9, 0.02];
  SPOTS.forEach(([x, y], i) => {
    const X = x * (JX / W);
    const Y = lerp(JB, JG - 0.4, (y - YB) / (YE - YB));
    if (dishAt(dishes, X, Y) > 0.02) return;
    items.push({ key: `lac${i}`, ...blobParts({ center: [X, Y, 0.01], radii: [0.06, 0.04, 0.02], rings: 5, sides: 8 }), color: '#c4b48f', deep: '#6d6249', tissue: 'bone', quiet: true, ground: true, outline: false });
  });
  // Merge the openings into one span per crown (the gum's face is drawn round them).
  open = open.map((v) => q4(v));
  const gum = cachedMesh('jaw-gum', open, () => {
    const parts: Mesh[] = [];
    const yT = gumTop;
    const yB = gumBot;
    parts.push(grid(48, 8, (u, v) => [lerp(-JX, JX, u), yT(lerp(-JX, JX, u)), lerp(JZ, 0, v)], [0, 100, -1]));
    parts.push(grid(48, 8, (u, v) => [lerp(-JX, JX, u), yB(lerp(-JX, JX, u)), lerp(JZ, 0, v)], [0, -100, -1]));
    const spans: [number, number][] = [];
    let a = -JX;
    for (let i = 0; i < open.length; i += 2) {
      if (open[i] > a) spans.push([a, open[i]]);
      a = Math.max(a, open[i + 1]);
    }
    if (a < JX) spans.push([a, JX]);
    for (const [x0, x1] of spans) parts.push(grid(16, 2, (u, v) => { const x = lerp(x0, x1, u); return [x, lerp(yB(x), yT(x), v), 0]; }, [0, 0, 100]));
    return merge(parts);
  });
  items.push({ key: 'gum', id: 'oi-epitelioa', mesh: gum, hit: gum, color: G18.skin, deep: G18.skinDeep, tissue: 'skin', opacity: 1, outline: false });
  pts['oi-epitelioa'] = [3.6, JG - 0.1, 0.02];
  return { items, pts };
}
