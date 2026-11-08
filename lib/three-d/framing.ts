import { add, apply4, dot, FRAME_H, FRAME_W, mul, norm, sub, viewOf, type Camera3, type M4, type V3 } from './math';
import type { Item3 } from './scene';

/**
 * Framing (docs/quality/3d-quality-bar.md): a step's camera is aimed so that what the step is about fills the
 * free middle of the frame — between the name columns, below the caption and the colour key, above the note —
 * instead of sitting small in a dark void. The camera keeps its direction (yaw, elevation, field of view): only
 * its distance, its target and the picture's shift change, so authored views keep their meaning.
 */

export interface FitSpec {
  /** The free part of the 1000×640 frame (default: between the name columns, below the key, above the note). */
  region?: { x: [number, number]; y: [number, number] };
  /** Share of the region the subject's larger side fills (default 0.74: a margin of context round it). */
  fill?: number;
  /** How far the camera may come closer or go back, as a factor of its authored distance (default [0.45, 1.6]). */
  limits?: [number, number];
  /** Frame the context it lies on (`Item3.ground`) with the subject, so the whole ground stays in sight. */
  ground?: boolean;
}

export const FREE_REGION = { x: [255, 745] as [number, number], y: [78, 566] as [number, number] };

const bboxOf = (cam: Camera3, pts: Float32Array) => {
  const v = viewOf(cam);
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (let i = 0; i < pts.length; i += 3) {
    const [x, y, , w] = apply4(v.vp, [pts[i], pts[i + 1], pts[i + 2]]);
    if (w <= 0.01) continue;
    const sx = (x / w) * 0.5 * FRAME_W + FRAME_W / 2;
    const sy = FRAME_H / 2 - (y / w) * 0.5 * FRAME_H;
    if (sx < x0) x0 = sx;
    if (sx > x1) x1 = sx;
    if (sy < y0) y0 = sy;
    if (sy > y1) y1 = sy;
  }
  return { x0, x1, y0, y1 };
};

/** Points of the items (world space), a sample of each mesh's coarse copy. */
export function pointsOf(items: readonly Item3[], keep: (it: Item3) => boolean): Float32Array {
  const out: number[] = [];
  for (const it of items) {
    if (!keep(it)) continue;
    const m = (it.hit ?? it.mesh).pos;
    const step = Math.max(1, Math.floor(m.length / 3 / 400)) * 3;
    for (let i = 0; i < m.length; i += step) {
      const p: V3 = [m[i], m[i + 1], m[i + 2]];
      const q = it.matrix ? applyPoint(it.matrix, p) : p;
      out.push(q[0], q[1], q[2]);
    }
  }
  return new Float32Array(out);
}

const applyPoint = (m: M4, p: V3): V3 => {
  const [x, y, z, w] = apply4(m, p);
  return [x / w, y / w, z / w];
};

/** Frame margin a named point must keep (its name's line needs room to reach it). */
const SAFE = { x: [36, 964] as const, y: [36, 604] as const };

/**
 * The camera, turned the same way, that fits `pts` in the region; `keep`: points (the named structures) that the
 * authored camera has in the frame and the fitted one must too — the fit backs off towards the authored camera
 * (as little as it can) until they are.
 */
export function fitCamera(cam: Camera3, pts: Float32Array, f: FitSpec = {}, keep?: readonly V3[]): Camera3 {
  const fitted = fitOnly(cam, pts, f);
  if (!keep?.length || fitted === cam) return fitted;
  const inside = (c: Camera3, p: V3) => {
    const v = viewOf(c);
    const [x, y, , w] = apply4(v.vp, p);
    if (w <= 0.01) return false;
    const sx = (x / w) * 0.5 * FRAME_W + FRAME_W / 2;
    const sy = FRAME_H / 2 - (y / w) * 0.5 * FRAME_H;
    return sx >= SAFE.x[0] && sx <= SAFE.x[1] && sy >= SAFE.y[0] && sy <= SAFE.y[1];
  };
  const must = keep.filter((p) => inside(cam, p));
  const ok = (c: Camera3) => must.every((p) => inside(c, p));
  if (ok(fitted)) return fitted;
  const mix = (k: number): Camera3 => {
    const l = (a: V3, b: V3): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
    const sa = cam.shift ?? [0, 0], sb = fitted.shift ?? [0, 0];
    return { ...fitted, eye: l(cam.eye, fitted.eye), target: l(cam.target, fitted.target), shift: [sa[0] + (sb[0] - sa[0]) * k, sa[1] + (sb[1] - sa[1]) * k] };
  };
  let lo = 0, hi = 1;
  for (let i = 0; i < 12; i++) {
    const m = (lo + hi) / 2;
    if (ok(mix(m))) lo = m;
    else hi = m;
  }
  return lo > 0 ? mix(lo) : cam;
}

function fitOnly(cam: Camera3, pts: Float32Array, f: FitSpec): Camera3 {
  if (pts.length < 9) return cam;
  const region = f.region ?? FREE_REGION;
  const fill = f.fill ?? 0.74;
  const [lo, hi] = f.limits ?? [0.45, 1.6];
  // Aim at the middle of the subject (so a turn of the view turns round it), keeping the direction of view.
  let mn: V3 = [Infinity, Infinity, Infinity];
  let mx: V3 = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < pts.length; i += 3) {
    mn = [Math.min(mn[0], pts[i]), Math.min(mn[1], pts[i + 1]), Math.min(mn[2], pts[i + 2])];
    mx = [Math.max(mx[0], pts[i]), Math.max(mx[1], pts[i + 1]), Math.max(mx[2], pts[i + 2])];
  }
  const c = mul(add(mn, mx), 0.5);
  const dir = norm(sub(cam.target, cam.eye));
  const off = sub(c, cam.target);
  const move = sub(off, mul(dir, dot(off, dir)));
  const dist0 = Math.hypot(...sub(cam.eye, cam.target));
  let out: Camera3 = { ...cam, target: add(cam.target, move), eye: add(cam.eye, move), shift: [0, 0] };
  const rw = region.x[1] - region.x[0];
  const rh = region.y[1] - region.y[0];
  let dist = dist0;
  // Perspective: two rounds bring the size within a few percent.
  for (let k = 0; k < 3; k++) {
    const b = bboxOf(out, pts);
    const s = Math.max((b.x1 - b.x0) / rw, (b.y1 - b.y0) / rh) / fill;
    if (!Number.isFinite(s) || s <= 0) return cam;
    dist = Math.min(dist0 * hi, Math.max(dist0 * lo, dist * s));
    out = { ...out, eye: add(out.target, mul(dir, -dist)) };
  }
  // Then the picture is shifted so the subject's middle is the region's middle.
  const b = bboxOf(out, pts);
  const shift: [number, number] = [(region.x[0] + region.x[1]) / 2 - (b.x0 + b.x1) / 2, (region.y[0] + region.y[1]) / 2 - (b.y0 + b.y1) / 2];
  return { ...out, shift };
}
