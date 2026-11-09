import type { V3 } from '@/lib/three-d/math';
import { grid, type Mesh } from '@/lib/three-d/mesh';
import type { Item3 } from '@/lib/three-d/scene';
import { curve3 } from '@/lib/three-d/mesh';
import { blobParts, mixHex, tubeParts } from '@/components/scenes/week10/model3d';
import { plate } from '@/lib/three-d/organic';
import { ARCH, TISSUE } from '@/components/scenes/week17/common';

/**
 * Topic 18 §4.2 (odontogenesis). One cut tooth germ whose outline really changes (the notes' figures A–D and the
 * finished tooth of p.14): the lamina pushes into the mesenchyme, the cap forms round the papilla, the bell frees
 * itself from the lamina, then enamel (outwards) and dentine (inwards) are laid down from the line between them
 * while the pulp narrows and the root grows into the alveolus. `jawModel` is the block of p.15: milk teeth above,
 * permanent germs in the bone below.
 *
 * Own frame (a section block): x across the tooth, y towards the mouth (the crown up, as the notes draw it), z out
 * of the cut face towards the viewer.
 */

export const TC = {
  epi: TISSUE.ecto,
  epiDeep: TISSUE.ectoDeep,
  reticulum: '#c9e4f7',
  papilla: '#e8a08f',
  papillaDeep: '#8c4a3a',
  pulp: '#ef8f8f',
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

type P2 = [number, number];
const N = 44;
const CROWN = 0.6;
const YE = 2.1;
const W = 3.3;
const YB = -3.6;
const ZB = -1.3;

/** The line between enamel and dentine, apex → neck → root tip, as [radius, y] (one half of the section). */
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
      out.push([neckR * (1 - Math.pow(v, 1.5) * 0.76), neckY - L * v]);
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

interface Xf {
  x: number;
  y: number;
  s: number;
}

function faceMesh(outer: P2[], inner: P2[], z: number, f: Xf): Mesh {
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
}

function wallMesh(outer: P2[], z: number, f: Xf, zBack = ZB): Mesh {
  const a = mirror(outer);
  const n = a.length - 1;
  const at = (u: number, v: number): V3 => {
    const i = Math.min(n, Math.round(u * n));
    return [f.x + f.s * a[i][0], f.y + f.s * a[i][1], lerp(z, zBack, v)];
  };
  return grid(n, 1, at, [f.x, f.y + 100, 0]);
}

/** Items collected for one model, with the shared dim rule. */
function maker(dim: ToothOpts['dim']) {
  const items: Item3[] = [];
  const fade = (id?: string, groups?: readonly string[]) => (!id || !dim || dim.k <= 0.001 || dim.ids.includes(id) || (groups ?? []).some((g) => dim.ids.includes(g)) ? 1 : 1 - 0.55 * dim.k);
  const band = (key: string, id: string | undefined, outer: P2[], inner: P2[], z: number, color: string, deep: string, op: number, f: Xf, extra: Partial<Item3> = {}, wall = false) => {
    if (op <= 0.01) return;
    const opacity = op * fade(id, extra.groups);
    const mesh = faceMesh(outer, inner, z, f);
    items.push({ key, id, mesh, hit: mesh, color, deep, tissue: 'mesenchyme', opacity, outline: false, ...extra });
    if (wall) {
      const w = wallMesh(outer, z, f);
      items.push({ key: `${key}-w`, id, mesh: w, hit: w, color, deep, tissue: 'mesenchyme', opacity, outline: false, ...extra });
    }
  };
  return { items, fade, band };
}

export function toothModel(pose: ToothPose, o: ToothOpts = {}) {
  const { items, fade, band } = maker(o.dim);
  const pts: Record<string, V3> = {};
  const f: Xf = { x: 0, y: 0, s: 1 };
  const show = 1 - ss(0.15, 0.85, pose.arch);

  // ———— the whole jaws: two C's with the lamina on them ————
  if (pose.arch > 0.01) {
    const c = (y: number): V3[] => Array.from({ length: 28 }, (_, i) => {
      const a = lerp(-1.75, 1.75, i / 27);
      return [3.1 * Math.sin(a), y, 2.3 * Math.cos(a) - 0.6];
    });
    const k = ss(0.15, 0.85, pose.arch);
    const bar = (key: string, id: string, line: V3[], color: string, r: number, extra: Partial<Item3> = {}) => items.push({ key, id, ...tubeParts(line, { radius: () => r, ref: [0, 1, 0], sides: 14, capStart: true, capEnd: true }), color, deep: darker(color), tissue: 'mesenchyme', opacity: k * fade(id, extra.groups), ...extra });
    bar('jaw-up', 'hezur-maxilarra', c(1.15), ARCH.i, 0.46);
    bar('jaw-low', 'baraila', c(-1.15), ARCH.i, 0.46);
    bar('lam-up', 'hortz-lamina', c(1.15 - 0.42), TC.epi, 0.13 * (0.4 + 0.6 * pose.thick), { tissue: 'epithelium' });
    bar('lam-low', 'hortz-lamina', c(-1.15 + 0.42), TC.epi, 0.13 * (0.4 + 0.6 * pose.thick), { tissue: 'epithelium' });
    pts['hezur-maxilarra'] = [2.6, 1.3, 1.1];
    pts['baraila'] = [2.6, -1.3, 1.1];
    pts['hortz-lamina'] = [0, 0.73, 1.7];
  }

  const bone = ss(0, 1, pose.alv);

  // ———— the block: mesenchyme, which becomes the alveolar bone round the root ————
  const blockColor = mixHex(TISSUE.mes, TISSUE.bone, bone);
  const blockDeep = mixHex(TISSUE.mesDeep, TISSUE.boneDeep, bone);
  if (show > 0.01) {
    const rect: P2[] = [[-W, YB], [W, YB], [W, YE - 0.05], [-W, YE - 0.05]];
    // The block is mesenchyme until it has turned to bone: from then on it is the alveolus.
    const id = bone > 0.5 ? 'albeoloa' : 'mesenkima';
    items.push({ key: 'block', id, ...plate('tooth-block-v1', rect, 0, ZB), color: blockColor, deep: blockDeep, tissue: 'mesenchyme', opacity: show * fade(id, ['albeoloa']), outline: true, ground: true, quiet: true });
    pts['mesenkima'] = [-2.3, -1.5, 0.02];
    // The mesenchyme's scattered cells, as in the notes' figures; the bone's lacunae afterwards.
    const CELLS: P2[] = [[-2.7, 1.15], [-2.1, 0.55], [-2.8, -0.2], [-1.9, -0.9], [-2.7, -1.6], [-2.1, -2.5], [-2.9, -3.1], [2.7, 1.2], [2.2, 0.5], [2.85, -0.3], [1.95, -1.0], [2.7, -1.75], [2.1, -2.6], [2.8, -3.15], [-1.1, -3.2], [1.1, -3.2], [-1.6, 1.45], [1.65, 1.5]];
    CELLS.forEach(([x, y], i) => items.push({ key: `cell${i}`, ...blobParts({ center: [x, y, 0.015], radii: [0.075, 0.05, 0.02], rings: 5, sides: 8 }), color: mixHex(TISSUE.mesDeep, TISSUE.boneDeep, bone), deep: '#3a2415', tissue: 'mesenchyme', opacity: show * (1 - 0.3 * bone), quiet: true, outline: false }));
  }

  // ———— the tooth's outline for this pose ————
  const shift = 1.5 * ss(0, 1, pose.rise);
  const lam = clamp01(pose.lam);
  const cap = clamp01(pose.cap);
  const bell = clamp01(pose.bell);
  const R = lerp(lerp(0.1, 0.3, lam), lerp(1.02, 0.98, bell), ss(0, 1, cap));
  const H = lerp(lerp(lerp(0.12, 0.24, lam), 0.62, ss(0, 1, cap)), 1.72, ss(0, 1, bell));
  const apex0 = lerp(YE - 0.3 - lam * 0.82, 0.8, ss(0, 1, cap));
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

  // The enamel organ, outside the enamel; it thins out and is gone as the tooth erupts.
  const organK = 1 - ss(0.05, 0.6, pose.rise);
  const orgT = (s: number) => lerp(0.2, 0.42, ss(0, 0.7, cap)) * (1 - ss(0.4, CROWN * 0.98, s) * 0.9) * (s > CROWN ? 0 : 1);
  const epiT = (s: number) => Math.min(0.075, orgT(s) * 0.4);
  const inner0 = enamelOut;
  const inner1 = offset(enamelOut, (s) => -epiT(s));
  const outer0 = offset(enamelOut, (s) => -(orgT(s) - epiT(s)));
  const outer1 = offset(enamelOut, (s) => -orgT(s));
  const orgOp = organK * ss(0.02, 0.2, lam) * show;

  // The epithelium on top, thickened over the lamina; the crown comes through it as the tooth erupts.
  const th = (r: number) => 0.14 + pose.thick * (0.08 + 0.2 * Math.exp(-Math.pow(r / 0.6, 2)));
  const span = Array.from({ length: 41 }, (_, i): P2 => [(i / 40) * W, YE]);
  // Opened over the crown by the erupting tooth: the epithelium's inner edge moves out with the crown.
  const open = ss(0.15, 0.7, pose.rise) * (R + 0.08);
  const topOut: P2[] = span.map(([r]) => [lerp(open, W, r / W), YE]);
  const topIn: P2[] = span.map(([r]) => [lerp(open, W, r / W), YE - th(lerp(open, W, r / W))]);
  if (open > 0.02) {
    // Two gum flanks: each half alone.
    for (const sgn of [-1, 1]) {
      const a = topOut.map(([r, y]) => [sgn * r, y] as P2);
      const b = topIn.map(([r, y]) => [sgn * r, y] as P2);
      const n = a.length - 1;
      const m = grid(n, 1, (u, v): V3 => {
        const i = Math.min(n, Math.round(u * n));
        return [lerp(a[i][0], b[i][0], v), lerp(a[i][1], b[i][1], v), 0.06];
      }, [0, YE, 60]);
      const w = grid(n, 1, (u, v): V3 => {
        const i = Math.min(n, Math.round(u * n));
        return [a[i][0], a[i][1], lerp(0.06, ZB, v)];
      }, [0, 100, 0]);
      items.push({ key: `epi${sgn}`, id: 'aho-sabaiko-epitelioa', mesh: m, hit: m, color: TC.epi, deep: TC.epiDeep, tissue: 'epithelium', opacity: show * fade('aho-sabaiko-epitelioa'), outline: false });
      items.push({ key: `epi${sgn}w`, id: 'aho-sabaiko-epitelioa', mesh: w, hit: w, color: TC.epi, deep: TC.epiDeep, tissue: 'epithelium', opacity: show * fade('aho-sabaiko-epitelioa'), outline: false });
    }
  } else {
    band('epi', 'aho-sabaiko-epitelioa', topOut, topIn, 0.06, TC.epi, TC.epiDeep, show, f, { tissue: 'epithelium' }, true);
  }
  pts['aho-sabaiko-epitelioa'] = [2.2, YE - 0.08, 0.07];

  // The lamina: a band from the thickening down to the germ, which lets go at `free` and withers towards the top.
  const free = clamp01(pose.free);
  const lamTop = YE - 0.08;
  const lamBot = lerp(apex + 0.02 + orgT(0) * ss(0, 0.2, lam), lamTop - 0.24, ss(0.15, 1, free));
  const lamK = 1 - ss(0.75, 1, free);
  if (lam > 0.01 && lamK > 0.01) {
    const n = 16;
    const widthAt = (v: number) => lerp(0.34, 0.15, ss(0, 0.5, v)) * (0.4 + 0.6 * lam) * lamK;
    const out: P2[] = Array.from({ length: n + 1 }, (_, i): P2 => [widthAt(i / n), lerp(lamTop, lamBot, i / n)]);
    // The germ's own colour at its neck: one tissue with the epithelium.
    band('lamina', 'hortz-lamina', out, axis(out), 0.07, TC.epi, TC.epiDeep, show, f, { tissue: 'epithelium' }, true);
    pts['hortz-lamina'] = [0, lerp(lamTop, lamBot, 0.45), 0.08];
  }

  // Enamel organ: outer epithelium, the loose middle, inner epithelium (ameloblasts).
  const distinct = ss(0.15, 0.8, cap);
  band('org-mid', 'esmalte-organoa', outer1, inner0, 0.07, lerp(0, 1, distinct) > 0.5 ? TC.reticulum : TC.epi, TC.epiDeep, orgOp, f, { tissue: 'epithelium', groups: ['txanoa', 'kanpaia'] }, true);
  if (distinct > 0.05) {
    band('org-outer', 'kanpoko-epitelioa', outer1, outer0, 0.08, TC.epiDeep, '#143b57', orgOp * distinct, f, { tissue: 'epithelium', groups: ['txanoa', 'kanpaia', 'esmalte-organoa'] });
    band('org-inner', 'barneko-epitelioa', inner1, inner0, 0.08, mixHex(TC.epiDeep, '#2748a8', ss(0.3, 1, pose.cells)), '#143b57', orgOp * distinct, f, { tissue: 'epithelium', groups: ['txanoa', 'kanpaia', 'esmalte-organoa', 'ameloblastoak'] });
  }

  // Papilla → pulp: what is left inside the dentine.
  const papOp = ss(0.05, 0.9, pose.pap) * show;
  const mixP = ss(0.1, 1, dep);
  band('papilla', 'hortz-papila', dentineIn, axis(dentineIn), 0.05, mixHex(TC.papilla, TC.pulp, mixP), TC.papillaDeep, papOp, f, { groups: ['hortz-pulpa'] }, true);

  // Odontoblasts line the dentine's inner face.
  if (pose.cells > 0.02) {
    const odIn = offset(dentineIn, (s) => 0.07 * (1 - ss(0.86, 1, s)));
    band('odonto', 'odontoblastoak', dentineIn, odIn, 0.08, TC.odonto, darker(TC.odonto), ss(0, 0.7, pose.cells) * organK * show, f);
  }

  // Dentine (crown and root) and enamel (crown only).
  if (dep > 0.01) {
    band('dentine', 'dentina', J, dentineIn, 0.09, TC.dentine, TC.dentineDeep, show * ss(0, 0.12, dep), f, {}, true);
    const eOp = show * ss(0, 0.12, dep);
    const nc = Math.round(N * CROWN);
    band('enamel', 'esmaltea', enamelOut.slice(0, nc + 1), J.slice(0, nc + 1), 0.11, TC.enamel, TC.enamelDeep, eOp, f, { tissue: 'bone', groups: ['koroa'] }, true);
    pts['esmaltea'] = [0.04, lerp(apex, enamelOut[0][1], 0.5) + 0.0, 0.12];
    const d0 = J[Math.round(N * 0.34)];
    const d1 = dentineIn[Math.round(N * 0.34)];
    pts['dentina'] = [lerp(d0[0], d1[0], 0.5), lerp(d0[1], d1[1], 0.5), 0.1];
  }

  // Cementum: outside the root (the notes' own figure), with cementoblasts on it while it forms.
  const rootStart = Math.round(N * CROWN);
  const cemT = (s: number) => pose.cem * 0.12 * ss(CROWN - 0.02, CROWN + 0.06, s);
  const cemOut = offset(J, (s) => -cemT(s));
  if (pose.cem > 0.01 && pose.root > 0.03) {
    band('cement', 'zementoa', cemOut.slice(rootStart), J.slice(rootStart), 0.045, TC.cement, TC.cementDeep, show * ss(0, 0.2, pose.cem), f, {}, true);
    const c = cemOut[Math.round(N * 0.78)];
    pts['zementoa'] = [c[0] + 0.0, c[1], 0.11];
    const clast = offset(cemOut, (s) => -0.08 * ss(CROWN, CROWN + 0.05, s));
    const op = ss(0, 0.3, pose.cem) * (1 - ss(0.2, 0.9, pose.lig));
    band('cementoblast', 'zementoblastoak', clast.slice(rootStart), cemOut.slice(rootStart), 0.045, '#7a4d9a', '#3e2453', op * show, f);
    const cb = clast[Math.round(N * 0.7)];
    pts['zementoblastoak'] = [cb[0], cb[1], 0.12];
  }

  // The periodontal ligaments: the gap between cementum and the socket's bone.
  if (pose.lig > 0.01 && pose.root > 0.03) {
    const gap = 0.17 * pose.lig;
    const lig = offset(cemOut, () => -gap);
    const tip = lig[lig.length - 1];
    const liga = [...lig.slice(rootStart), [0, tip[1] - gap] as P2];
    const cemA = [...cemOut.slice(rootStart), [0, tip[1] - 0.01] as P2];
    band('ligament', 'lotailu-periodontalak', liga, cemA, 0.04, TC.ligament, TC.ligamentDeep, show * ss(0, 0.3, pose.lig), f, {}, false);
    const q = lig[Math.round(N * 0.82)];
    pts['lotailu-periodontalak'] = [q[0] - 0.05, q[1], 0.06];
    pts['albeoloa'] = [q[0] + 0.55, q[1] + 0.2, 0.02];
  }

  // Arteries, veins and nerve running up the pulp.
  if (pose.vess > 0.01) {
    const yTop = apex - 0.62;
    const yBot = J[J.length - 1][1] - 0.6;
    const v = (key: string, id: string, dx: number, color: string) => {
      const line = curve3([[dx * 0.5, yBot, 0.08], [dx * 0.4, yBot + 0.8 * pose.vess, 0.08], [dx, lerp(yBot + 0.8, yTop, pose.vess), 0.08]] as V3[], 18);
      items.push({ key, id, ...tubeParts(line, { radius: () => 0.04, ref: [0, 0, 1], sides: 8, capStart: true, capEnd: true }), color, deep: darker(color), tissue: 'vessel', opacity: show * fade(id, ['hortz-pulpa']) });
    };
    v('v-art', 'pulpa-hodiak', -0.09, TISSUE.artery);
    v('v-vein', 'pulpa-hodiak', 0.09, TISSUE.vein);
    v('v-nerve', 'pulpa-nerbioa', 0.0, TISSUE.nerve);
    pts['pulpa-hodiak'] = [-0.08, lerp(yBot, yTop, 0.5), 0.1];
    pts['pulpa-nerbioa'] = [0.01, lerp(yBot, yTop, 0.75), 0.1];
  }

  // Points for the labels.
  const mid = (a: P2[], b: P2[], i: number): P2 => [(a[i][0] + b[i][0]) / 2, (a[i][1] + b[i][1]) / 2];
  const ii = Math.round(N * 0.28);
  const m1 = mid(outer1, inner0, ii);
  pts['esmalte-organoa'] = [m1[0], m1[1], 0.09];
  pts['txanoa'] = pts['esmalte-organoa'];
  pts['kanpaia'] = pts['esmalte-organoa'];
  const k1 = mid(outer1, outer0, ii);
  pts['kanpoko-epitelioa'] = [k1[0], k1[1], 0.09];
  const k2 = mid(inner1, inner0, Math.round(N * 0.2));
  pts['barneko-epitelioa'] = [k2[0], k2[1], 0.09];
  pts['ameloblastoak'] = pts['barneko-epitelioa'];
  const od = dentineIn[Math.round(N * 0.4)];
  pts['odontoblastoak'] = [od[0], od[1], 0.09];
  pts['hortz-papila'] = [0, lerp(apex - H, apex - 0.3, 0.45), 0.06];
  pts['hortz-pulpa'] = [0, lerp(neckY, apex, 0.4), 0.06];
  pts['koroa'] = [0.25, apex - 0.3, 0.12];
  pts['sustraia'] = [J[Math.round(N * 0.82)][0] * 0.4, J[Math.round(N * 0.82)][1], 0.1];
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

function miniTooth(band: ReturnType<typeof maker>['band'], prefix: string, id: string, f: Xf, root: number, op: number, enamel: string, enamelDeep: string, group: string) {
  const J = junction(0.85, 1.25, 1.2, root);
  const nc = Math.round(N * CROWN);
  const eT = (s: number) => 0.22 * (1 - ss(0.42, CROWN, s));
  const out = offset(J, (s) => -eT(s));
  const inn = offset(J, (s, i) => (s > CROWN ? Math.min(0.26, J[i][0] * 0.66) : 0.28));
  band(`${prefix}-pulp`, id, inn, axis(inn), 0.07, TC.pulp, TC.papillaDeep, op, f, { groups: [group] }, true);
  band(`${prefix}-dent`, id, J, inn, 0.09, TC.dentine, TC.dentineDeep, op, f, { groups: [group] }, true);
  band(`${prefix}-enam`, id, out.slice(0, nc + 1), J.slice(0, nc + 1), 0.11, enamel, enamelDeep, op, f, { groups: [group], tissue: 'bone' }, true);
}

export function jawModel(pose: JawPose, o: ToothOpts = {}) {
  const { items, fade, band } = maker(o.dim);
  const pts: Record<string, V3> = {};
  const YG = 1.15;
  const X0 = 4.1;
  const Y0 = -4.6;
  const rect: P2[] = [[-X0, Y0], [X0, Y0], [X0, YG - 0.15], [-X0, YG - 0.15]];
  items.push({ key: 'jaw-bone', id: 'baraila', ...plate('jaw-block-v1', rect, 0, ZB), color: TISSUE.bone, deep: TISSUE.boneDeep, tissue: 'bone', opacity: fade('baraila'), outline: true, ground: true, quiet: true });
  pts['baraila'] = [-3.4, -3.9, 0.02];
  const span = Array.from({ length: 25 }, (_, i): P2 => [(i / 24) * X0, YG]);
  const gIn = span.map(([r]) => [r, YG - 0.22] as P2);
  band('gum', 'oi-epitelioa', span, gIn, 0.05, TISSUE.skin, TISSUE.skinDeep, 1, { x: 0, y: 0, s: 1 }, {}, true);
  pts['oi-epitelioa'] = [3.6, YG - 0.1, 0.06];

  COLS.forEach((cx, k) => {
    const pushed = k < 2 ? ss(0, 1, pose.erupt) : 0;
    const extracted = k === 2 ? ss(0, 1, pose.extract) : 0;
    // The milk tooth: comes up through the gum, its root resorbed as the permanent one pushes, then it goes.
    const rise = ss(0, 1, pose.milk);
    const fall = Math.max(ss(0.55, 1, pushed), extracted);
    const my = lerp(-2.4, 0.05, rise) + 2.6 * ss(0.3, 1, fall);
    const root = lerp(0.55, 0.55 * (1 - 0.95 * ss(0, 0.7, pushed)), 1);
    const op = Math.min(ss(0, 0.2, pose.milk), 1 - ss(0.6, 1, fall));
    const fm: Xf = { x: cx + 0.35 * ss(0.5, 1, fall) * (k === 0 ? -1 : 1), y: my, s: 0.68 };
    miniTooth(band, `milk${k}`, 'esne-hortzak', fm, root, op, TC.enamel, TC.enamelDeep, 'hortzak');
    if (k === 1) pts['esne-hortzak'] = [cx + 0.0, my + 0.66, 0.13];
    if (k === 2) pts['esne-hortz-gelditua'] = [cx, my + 0.66, 0.13];

    // The permanent germ, in the bone below; it rises and takes the place.
    const germ = ss(0, 0.8, pose.perm) * (k === 2 ? 1 - ss(0, 0.8, pose.agen) : 1);
    if (germ > 0.01) {
      const py = lerp(-3.1, 0.2, pushed);
      const fp: Xf = { x: cx, y: py, s: 0.76 * (0.55 + 0.45 * germ) };
      miniTooth(band, `perm${k}`, 'behin-betiko-hortzak', fp, lerp(0.05, 0.75, pushed), germ, TC.perm, TC.permDeep, 'hortzak');
      if (k === 1) pts['behin-betiko-hortzak'] = [cx, py + 0.7, 0.13];
    }
  });
  pts['agenesia'] = [COLS[2], -2.9, 0.05];
  return { items, pts };
}
