import { add, cross, dot, len, mix3, mul, norm, perp, project, rotate, sub, viewOf, FRAME_H, FRAME_W, type Camera3, type M4, type V3 } from './math';
import { coverOf } from './occlusion';
import { orbitCamera } from './orbit';
import type { Mesh } from './mesh';
import type { Item3 } from './scene';

/**
 * The 3D views' study camera: when one structure is put forward (the step's tour, the 3D tour), the
 * camera turns towards the side it lies on and comes a little closer, so it is seen from where it is
 * best seen instead of wherever the step's camera happened to be. Pure: the shell animates between
 * cameras, the tests can check the aim.
 */

/** Mean vertex of a mesh in its own coordinates (computed once per mesh). */
const means = new WeakMap<Mesh, V3>();
function meanOf(m: Mesh): V3 {
  const hit = means.get(m);
  if (hit) return hit;
  const n = m.pos.length / 3;
  let x = 0;
  let y = 0;
  let z = 0;
  for (let i = 0; i < n; i++) {
    x += m.pos[i * 3];
    y += m.pos[i * 3 + 1];
    z += m.pos[i * 3 + 2];
  }
  const out: V3 = n ? [x / n, y / n, z / n] : [0, 0, 0];
  means.set(m, out);
  return out;
}

const apply = (m: M4, p: V3): V3 => [m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12], m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13], m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14]];

/** Where a structure is in the scene: the centre of every visible item that draws it (or a part of it). */
export function centreOf(items: Item3[], id: string, partsOf?: (id: string) => readonly string[]): V3 | null {
  const parts = partsOf?.(id) ?? [];
  let sum: V3 = [0, 0, 0];
  let n = 0;
  for (const it of items) {
    if ((it.show ?? 1) * (it.opacity ?? 1) < 0.3) continue;
    if (!it.id || !(it.id === id || it.groups?.includes(id) || parts.includes(it.id))) continue;
    const c = meanOf(it.hit ?? it.mesh);
    sum = add(sum, it.matrix ? apply(it.matrix, c) : c);
    n++;
  }
  return n ? mul(sum, 1 / n) : null;
}

/** How far towards the structure's side the camera turns (of the whole angle), and the elevation it keeps. */
const TURN = 0.6;
const ELEV: [number, number] = [-0.25, 1.15];

/** The step's camera turned towards `at` (a point in the scene), a little closer and re-centred on it. */
export function aimCamera(cam: Camera3, at: V3 | null): Camera3 {
  if (!at) return cam;
  const up = cam.up ?? [0, 1, 0];
  const off = sub(cam.eye, cam.target);
  const r = len(off);
  const o = norm(off);
  const v = sub(at, cam.target);
  let dir = o;
  // A structure off the centre: turn towards its side (one at the centre is seen from anywhere).
  if (len(v) > r * 0.04) {
    const vh = norm(v);
    const angle = Math.acos(Math.max(-1, Math.min(1, dot(o, vh))));
    if (angle > 0.08) {
      const axis = cross(o, vh);
      dir = rotate(o, len(axis) > 1e-4 ? norm(axis) : up, angle * TURN);
    }
  }
  // Never so low or so high that the picture loses its up and down.
  const el = Math.asin(Math.max(-1, Math.min(1, dot(dir, up))));
  if (el < ELEV[0] || el > ELEV[1]) {
    const e = Math.max(ELEV[0], Math.min(ELEV[1], el));
    const h = perp(dir, up);
    dir = norm(add(mul(h, Math.cos(e)), mul(up, Math.sin(e))));
  }
  const target = mix3(cam.target, at, 0.3);
  return { ...cam, target, eye: add(target, mul(dir, r * 0.92)) };
}

/** A camera on the way from `a` to `b` (e = 0..1): round the target, never through the model. */
export function blendCamera(a: Camera3, b: Camera3, e: number): Camera3 {
  if (e <= 0) return a;
  if (e >= 1) return b;
  const target = mix3(a.target, b.target, e);
  const oa = sub(a.eye, a.target);
  const ob = sub(b.eye, b.target);
  const ua = norm(oa);
  const ub = norm(ob);
  const angle = Math.acos(Math.max(-1, Math.min(1, dot(ua, ub))));
  let dir = ub;
  if (angle > 1e-4) {
    const axis = cross(ua, ub);
    dir = rotate(ua, len(axis) > 1e-4 ? norm(axis) : (b.up ?? [0, 1, 0]), angle * e);
  }
  const r = len(oa) + (len(ob) - len(oa)) * e;
  const shift: [number, number] | undefined =
    a.shift || b.shift ? [(a.shift?.[0] ?? 0) + ((b.shift?.[0] ?? 0) - (a.shift?.[0] ?? 0)) * e, (a.shift?.[1] ?? 0) + ((b.shift?.[1] ?? 0) - (a.shift?.[1] ?? 0)) * e] : undefined;
  return { ...b, target, eye: add(target, mul(dir, r)), fov: a.fov + (b.fov - a.fov) * e, shift };
}

/** Where the structure lands in the frame for this camera, and whether it is inside with a margin. */
const inFrameFor = (cam: Camera3, at: V3) => {
  const q = project(viewOf(cam), at);
  return q.w > 0 && q.x > FRAME_W * 0.1 && q.x < FRAME_W * 0.9 && q.y > FRAME_H * 0.1 && q.y < FRAME_H * 0.9;
};

/** Turns tried round the target, smallest first: a little each way, then more, then from above or below. */
const TRIES: { yaw: number; pitch: number }[] = [0.3, 0.6, 0.9, 1.25].flatMap((yaw) => [
  { yaw, pitch: 0 },
  { yaw: -yaw, pitch: 0 },
]).concat([0.35, -0.3].flatMap((pitch) => [0, 0.45, -0.45, 0.9, -0.9].map((yaw) => ({ yaw, pitch }))));

const shown = new Map<string, Camera3>();

/**
 * The class's camera for the structure the voice has just named: the step's own camera while it shows it
 * (nothing solid in front of it, inside the frame), so the picture holds still; else the smallest turn
 * round the target that does (re-centred a little towards it); else the study camera's aim. Remembered
 * per camera and structure, so a playing scene does not search every frame.
 */
export function showCamera(cam: Camera3, items: Item3[], id: string, partsOf?: (id: string) => readonly string[]): Camera3 {
  const at = centreOf(items, id, partsOf);
  if (!at) return cam;
  const r = (v: V3) => v.map((x) => Math.round(x * 20)).join(',');
  const key = `${id}|${r(cam.eye)}|${r(cam.target)}|${r(at)}`;
  const hit = shown.get(key);
  if (hit) return hit;
  const sees = (c: Camera3) => inFrameFor(c, at) && !coverOf(items, c.eye, at, id);
  let out: Camera3 | null = sees(cam) ? cam : null;
  if (!out) {
    const base = { ...cam, target: mix3(cam.target, at, 0.3) };
    for (const t of TRIES) {
      const c = orbitCamera(base, t);
      if (sees(c)) {
        out = c;
        break;
      }
    }
  }
  out ??= aimCamera(cam, at);
  if (shown.size > 400) shown.clear();
  shown.set(key, out);
  return out;
}

type Quat = [number, number, number, number];

/** The camera's attitude (its right, up and back axes) as a quaternion. */
function attitude(c: Camera3): Quat {
  const z = norm(sub(c.eye, c.target));
  const x = norm(cross(c.up ?? [0, 1, 0], z));
  const y = cross(z, x);
  const tr = x[0] + y[1] + z[2];
  if (tr > 0) {
    const s = Math.sqrt(tr + 1) * 2;
    return [(y[2] - z[1]) / s, (z[0] - x[2]) / s, (x[1] - y[0]) / s, s / 4];
  }
  if (x[0] > y[1] && x[0] > z[2]) {
    const s = Math.sqrt(1 + x[0] - y[1] - z[2]) * 2;
    return [s / 4, (y[0] + x[1]) / s, (z[0] + x[2]) / s, (y[2] - z[1]) / s];
  }
  if (y[1] > z[2]) {
    const s = Math.sqrt(1 + y[1] - x[0] - z[2]) * 2;
    return [(y[0] + x[1]) / s, s / 4, (z[1] + y[2]) / s, (z[0] - x[2]) / s];
  }
  const s = Math.sqrt(1 + z[2] - x[0] - y[1]) * 2;
  return [(z[0] + x[2]) / s, (z[1] + y[2]) / s, s / 4, (x[1] - y[0]) / s];
}

const spin = (q: Quat, v: V3): V3 => {
  const u: V3 = [q[0], q[1], q[2]];
  const t = mul(cross(u, v), 2);
  return add(add(v, mul(t, q[3])), cross(u, t));
};

/**
 * A flight from one view to another (a stage change between two models): the whole camera turns once, the
 * short way, so the picture never rolls on the way and what was up comes round to the new up in one move; the
 * distance closes evenly on a log scale (a zoom reads as steady), and the aim moves over as the distance does.
 * Only a long way across draws back in the middle (both ends in one picture); a near move never goes out and in.
 */
export function flyCamera(a: Camera3, b: Camera3, e: number): Camera3 {
  if (e <= 0) return a;
  if (e >= 1) return b;
  const qa = attitude(a);
  let qb = attitude(b);
  let d = qa[0] * qb[0] + qa[1] * qb[1] + qa[2] * qb[2] + qa[3] * qb[3];
  if (d < 0) {
    qb = [-qb[0], -qb[1], -qb[2], -qb[3]];
    d = -d;
  }
  const th = Math.acos(Math.min(1, d));
  const sn = Math.sin(th);
  const wa = sn > 1e-4 ? Math.sin((1 - e) * th) / sn : 1 - e;
  const wb = sn > 1e-4 ? Math.sin(e * th) / sn : e;
  const q: Quat = [qa[0] * wa + qb[0] * wb, qa[1] * wa + qb[1] * wb, qa[2] * wa + qb[2] * wb, qa[3] * wa + qb[3] * wb];
  const ra = len(sub(a.eye, a.target));
  const rb = len(sub(b.eye, b.target));
  const r = Math.exp(Math.log(ra) + (Math.log(rb) - Math.log(ra)) * e);
  // The aim goes over with the distance closed (a zoom in centres its goal first), or evenly when there is no zoom.
  const w = Math.abs(ra - rb) > 0.08 * Math.max(ra, rb) ? 0.5 * e + 0.5 * ((ra - r) / (ra - rb)) : e;
  const target = mix3(a.target, b.target, w);
  // A long way across (the two aims farther apart than either view shows): the camera draws back on the way,
  // so both ends are seen together at mid-flight; a short way stays as close as it is.
  const far = len(sub(b.target, a.target)) / Math.sqrt(ra * rb);
  const back = 1 + (Math.min(1.9, Math.max(1, 1.5 * far)) - 1) * Math.sin(Math.PI * e) ** 2;
  const shift: [number, number] | undefined =
    a.shift || b.shift ? [(a.shift?.[0] ?? 0) + ((b.shift?.[0] ?? 0) - (a.shift?.[0] ?? 0)) * e, (a.shift?.[1] ?? 0) + ((b.shift?.[1] ?? 0) - (a.shift?.[1] ?? 0)) * e] : undefined;
  return { ...b, target, eye: add(target, mul(spin(q, [0, 0, 1]), r * back)), up: spin(q, [0, 1, 0]), fov: a.fov + (b.fov - a.fov) * e, shift };
}
