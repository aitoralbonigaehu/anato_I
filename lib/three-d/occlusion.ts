import type { M4, V3 } from './math';
import { clipped, type Item3 } from './scene';

/**
 * Where a name's dot can sit so the camera sees it on its own structure. From a front view the dorsal
 * aortae lie behind the aortic sac: a dot at their anchor would be drawn on the sac. When something
 * solid is in front of the anchor, the dot moves to the nearest point of the named structure's own
 * surface that the eye does see. The test is a ray from the eye against the coarse (`hit`) meshes,
 * culled by bounding spheres, so an unhidden anchor costs one cheap pass.
 */

interface Sphere {
  c: V3;
  r: number;
}

interface Bound extends Sphere {
  /** World-space vertices (the matrix applied once). */
  pos: Float32Array;
  idx: Uint32Array;
  /** Runs of CHUNK triangles with their own spheres: a long curved vessel's one sphere is loose. */
  chunks: Sphere[];
}

const CHUNK = 48;

function sphereOf(pos: Float32Array, idx: Uint32Array | null, from = 0, to = 0): Sphere {
  const lo = [Infinity, Infinity, Infinity];
  const hi = [-Infinity, -Infinity, -Infinity];
  const n = idx ? to - from : pos.length / 3;
  for (let k = 0; k < n; k++) {
    const i = (idx ? idx[from + k] : k) * 3;
    for (let a = 0; a < 3; a++) {
      lo[a] = Math.min(lo[a], pos[i + a]);
      hi[a] = Math.max(hi[a], pos[i + a]);
    }
  }
  if (!n) return { c: [0, 0, 0], r: 0 };
  const c: V3 = [(lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, (lo[2] + hi[2]) / 2];
  return { c, r: Math.hypot(hi[0] - c[0], hi[1] - c[1], hi[2] - c[2]) };
}

const bounds = new WeakMap<Item3['mesh'], Map<M4 | undefined, Bound>>();

function boundOf(it: Item3): Bound {
  const mesh = it.hit ?? it.mesh;
  let per = bounds.get(mesh);
  if (!per) bounds.set(mesh, (per = new Map()));
  const hit = per.get(it.matrix);
  if (hit) return hit;
  const P = mesh.pos;
  const M = it.matrix;
  const pos = M ? new Float32Array(P.length) : P;
  if (M)
    for (let i = 0; i < P.length; i += 3) {
      const x = P[i], y = P[i + 1], z = P[i + 2];
      pos[i] = M[0] * x + M[4] * y + M[8] * z + M[12];
      pos[i + 1] = M[1] * x + M[5] * y + M[9] * z + M[13];
      pos[i + 2] = M[2] * x + M[6] * y + M[10] * z + M[14];
    }
  const chunks: Sphere[] = [];
  for (let k = 0; k < mesh.idx.length; k += CHUNK * 3) chunks.push(sphereOf(pos, mesh.idx, k, Math.min(mesh.idx.length, k + CHUNK * 3)));
  const b = { ...sphereOf(pos, null), pos, idx: mesh.idx, chunks };
  per.set(it.matrix, b);
  return b;
}

/** Things that hide what is behind them: drawn, mostly opaque, and not a glassy tissue or a stream. */
export const solid = (it: Item3) => !it.stream && !!it.id && (it.opacity ?? 1) * (it.show ?? 1) >= 0.6 && !(it.tissue && (it.opacity ?? 1) < 0.9);

/** The item is the named structure itself (or one of its pieces). */
const isOwn = (it: Item3, id: string) => it.id === id || !!it.groups?.includes(id);

/**
 * Where a structure is when the model gives it no named point (drawn only as pieces, or as a group of
 * other parts): the middle of its biggest drawn piece. Null when nothing of it is drawn.
 */
export function ownCentre(items: Item3[], id: string): V3 | null {
  let best: Sphere | null = null;
  for (const it of items) {
    // Anything drawn, glassy organs included (a lung seen through is still where its name points).
    if (!isOwn(it, id) || it.stream || (it.opacity ?? 1) * (it.show ?? 1) < 0.05) continue;
    const b = boundOf(it);
    if (!best || b.r > best.r) best = b;
  }
  return best ? best.c : null;
}

/** Whether the segment o → o + d (of length len) comes within the sphere. */
function nearSphere(s: Sphere, o: V3, d: V3, len: number) {
  const oc: V3 = [s.c[0] - o[0], s.c[1] - o[1], s.c[2] - o[2]];
  const near = Math.max(0, Math.min(len, (oc[0] * d[0] + oc[1] * d[1] + oc[2] * d[2]) / len));
  const px = o[0] + (d[0] / len) * near - s.c[0];
  const py = o[1] + (d[1] / len) * near - s.c[1];
  const pz = o[2] + (d[2] / len) * near - s.c[2];
  return px * px + py * py + pz * pz <= s.r * s.r;
}

/** Whether the segment eye → p (stopped a vessel's width short of p) crosses a triangle of the item. */
function crosses(b: Bound, o: V3, d: V3, len: number): boolean {
  if (!nearSphere(b, o, d, len)) return false;
  for (let c = 0; c < b.chunks.length; c++) if (nearSphere(b.chunks[c], o, d, len) && crossesRun(b, o, d, c * CHUNK * 3, Math.min(b.idx.length, (c + 1) * CHUNK * 3))) return true;
  return false;
}

function crossesRun(b: Bound, o: V3, d: V3, from: number, to: number): boolean {
  const P = b.pos;
  const I = b.idx;
  for (let k = from; k < to; k += 3) {
    const a = I[k] * 3, bb = I[k + 1] * 3, c = I[k + 2] * 3;
    const e1x = P[bb] - P[a], e1y = P[bb + 1] - P[a + 1], e1z = P[bb + 2] - P[a + 2];
    const e2x = P[c] - P[a], e2y = P[c + 1] - P[a + 1], e2z = P[c + 2] - P[a + 2];
    const qx = d[1] * e2z - d[2] * e2y, qy = d[2] * e2x - d[0] * e2z, qz = d[0] * e2y - d[1] * e2x;
    const det = e1x * qx + e1y * qy + e1z * qz;
    if (det > -1e-9 && det < 1e-9) continue;
    const inv = 1 / det;
    const tx = o[0] - P[a], ty = o[1] - P[a + 1], tz = o[2] - P[a + 2];
    const u = (tx * qx + ty * qy + tz * qz) * inv;
    if (u < 0 || u > 1) continue;
    const rx = ty * e1z - tz * e1y, ry = tz * e1x - tx * e1z, rz = tx * e1y - ty * e1x;
    const v = (d[0] * rx + d[1] * ry + d[2] * rz) * inv;
    if (v < 0 || u + v > 1) continue;
    const s = (e2x * rx + e2y * ry + e2z * rz) * inv;
    if (s > 0 && s < 1) return true;
  }
  return false;
}

/** Distance (0..1 of the segment) of the nearest crossing of the segment o → o + d with the item, or Infinity. */
function nearestHit(it: Item3, b: Bound, o: V3, d: V3, len: number): number {
  if (!nearSphere(b, o, d, len)) return Infinity;
  const P = b.pos;
  const I = b.idx;
  // A cut item (a sliced organ) is pointed at only where it is drawn; its cut is in its own frame.
  const clip = it.clip && !it.matrix ? it.clip : null;
  let best = Infinity;
  for (let c = 0; c < b.chunks.length; c++) {
    if (!nearSphere(b.chunks[c], o, d, len)) continue;
    const to = Math.min(I.length, (c + 1) * CHUNK * 3);
    for (let k = c * CHUNK * 3; k < to; k += 3) {
      const a = I[k] * 3, bb = I[k + 1] * 3, cc = I[k + 2] * 3;
      const e1x = P[bb] - P[a], e1y = P[bb + 1] - P[a + 1], e1z = P[bb + 2] - P[a + 2];
      const e2x = P[cc] - P[a], e2y = P[cc + 1] - P[a + 1], e2z = P[cc + 2] - P[a + 2];
      const qx = d[1] * e2z - d[2] * e2y, qy = d[2] * e2x - d[0] * e2z, qz = d[0] * e2y - d[1] * e2x;
      const det = e1x * qx + e1y * qy + e1z * qz;
      // det = d · (e1 × e2): a face the ray grazes (a sheet seen edge on) is a sliver on screen, never under the pointer.
      const nx = e1y * e2z - e1z * e2y, ny = e1z * e2x - e1x * e2z, nz = e1x * e2y - e1y * e2x;
      if (Math.abs(det) <= 0.03 * Math.hypot(nx, ny, nz) * len) continue;
      const inv = 1 / det;
      const tx = o[0] - P[a], ty = o[1] - P[a + 1], tz = o[2] - P[a + 2];
      const u = (tx * qx + ty * qy + tz * qz) * inv;
      if (u < -1e-6 || u > 1 + 1e-6) continue;
      const rx = ty * e1z - tz * e1y, ry = tz * e1x - tx * e1z, rz = tx * e1y - ty * e1x;
      const v = (d[0] * rx + d[1] * ry + d[2] * rz) * inv;
      if (v < -1e-6 || u + v > 1 + 1e-6) continue;
      const s = (e2x * rx + e2y * ry + e2z * rz) * inv;
      if (s <= 0 || s >= best) continue;
      if (clip && clipped(clip, [o[0] + d[0] * s, o[1] + d[1] * s, o[2] + d[2] * s])) continue;
      best = s;
    }
  }
  return best;
}

/** Items at or above this strength are solid for the pointer (as lib/three-d/pick.ts judges it). */
const POINT_SOLID = 0.5;

/**
 * What the pointer lights at the pixel where `p` is drawn: the eye's ray through `p` (on a little past
 * it, to its own surface behind a dot drawn just in front of it), judged as the hover pick judges a pixel
 * (lib/three-d/pick.ts): the nearest solid item, named or not; see-through named items only over the
 * backdrop. Null when nothing named is there.
 */
export function seenAt(items: Item3[], eye: V3, p: V3): Item3 | null {
  const full: V3 = [p[0] - eye[0], p[1] - eye[1], p[2] - eye[2]];
  const len0 = Math.hypot(full[0], full[1], full[2]);
  if (len0 < 1e-9) return null;
  const len = len0 * 1.08;
  const d: V3 = [full[0] * 1.08, full[1] * 1.08, full[2] * 1.08];
  let solidS = Infinity;
  let solidIt: Item3 | null = null;
  let glassS = Infinity;
  let glassIt: Item3 | null = null;
  for (const it of items) {
    if (it.stream) continue;
    const a = (it.show ?? 1) * (it.opacity ?? 1);
    if (a <= 0.01 || (!it.id && a < POINT_SOLID)) continue;
    const s = nearestHit(it, boundOf(it), eye, d, len);
    if (s === Infinity) continue;
    if (a >= POINT_SOLID) {
      if (s < solidS) (solidS = s), (solidIt = it);
    } else if (s < glassS) (glassS = s), (glassIt = it);
  }
  const back = !!solidIt && (!!solidIt.ground || !solidIt.id);
  if (glassIt && glassS < solidS && back) return glassIt;
  if (solidIt) return solidIt.id ? solidIt : null;
  return glassIt;
}

/** Whether the pointer on the dot at `p` lights the structure `id` (itself or one of its pieces). */
export function seenOwn(items: Item3[], eye: V3, p: V3, id: string): boolean {
  const full: V3 = [p[0] - eye[0], p[1] - eye[1], p[2] - eye[2]];
  const len0 = Math.hypot(full[0], full[1], full[2]);
  if (len0 < 1e-9) return false;
  const len = len0 * 1.08;
  const d: V3 = [full[0] * 1.08, full[1] * 1.08, full[2] * 1.08];
  // Its own nearest face along the ray first; then only what lies in front of that needs a look.
  let s0 = Infinity;
  let own: Item3 | null = null;
  for (const it of items) {
    if (it.stream || !isOwn(it, id) || alpha(it) <= 0.01) continue;
    const s = nearestHit(it, boundOf(it), eye, d, len);
    if (s < s0) (s0 = s), (own = it);
  }
  if (!own) return false;
  // A see-through or backdrop piece of its own: the full pick rule (rare).
  if (alpha(own) < POINT_SOLID || own.ground) {
    const it = seenAt(items, eye, p);
    return !!it && isOwn(it, id);
  }
  // A solid piece of its own: lit unless something else solid (named or not) lies in front of it.
  const dd: V3 = [d[0] * s0, d[1] * s0, d[2] * s0];
  const ll = len * s0;
  for (const it of items) {
    if (it.stream || isOwn(it, id) || alpha(it) < POINT_SOLID) continue;
    if (nearestHit(it, boundOf(it), eye, dd, ll) < 1) return false;
  }
  return true;
}

const alpha = (it: Item3) => (it.show ?? 1) * (it.opacity ?? 1);

/** The first solid structure other than `id` between the eye and `p`, or null when the eye sees `p`. */
export function coverOf(items: Item3[], eye: V3, p: V3, id: string, margin = 0.3): string | null {
  const full: V3 = [p[0] - eye[0], p[1] - eye[1], p[2] - eye[2]];
  const len = Math.hypot(full[0], full[1], full[2]);
  if (len <= margin) return null;
  const k = (len - margin) / len;
  const d: V3 = [full[0] * k, full[1] * k, full[2] * k];
  const dl = len - margin;
  for (const it of items) if (solid(it) && !isOwn(it, id) && crosses(boundOf(it), eye, d, dl)) return it.id!;
  return null;
}

/**
 * The anchor itself when the eye sees it; else the nearest vertex of the structure's own surface the
 * eye does see inside the picture (`inFrame`; at most `tries` tried, nearest first); else the anchor
 * (nothing of it is in sight).
 */
/**
 * `strict` (topics 15 on): the dot must light its own structure under the pointer, as the hover pick judges
 * it (`seenOwn`), with its own surface a few pixels round it. Otherwise (topics 10–14, laid out with it) it
 * only must not be hidden by another solid structure.
 */
export function visibleAnchor(
  items: Item3[],
  eye: V3,
  p: V3,
  id: string,
  inFrame: (q: V3) => boolean = () => true,
  tries = 48,
  strict = false,
  settle = false,
): V3 {
  // While the camera turns, an answer holds until the eye has moved a little: one search per name, not per frame.
  let memo = memos.get(items);
  if (!memo) memos.set(items, (memo = new Map()));
  const key = `${strict ? 's' : 'c'}|${id}|${p[0]},${p[1]},${p[2]}`;
  const was = memo.get(key);
  const near = (e: V3) => Math.hypot(eye[0] - e[0], eye[1] - e[1], eye[2] - e[2]) < 0.08;
  if (was && !(settle && was.resumed) && inFrame(was.q) && near(was.eye)) {
    if (was.resumed) resumedUsed = true;
    return was.q;
  }
  if (!strict) {
    const q = searchUncovered(items, eye, p, id, inFrame, tries);
    memo.set(key, { eye: [eye[0], eye[1], eye[2]], q });
    return q;
  }
  // While anything moves (a model rebuilt every frame as a layer grows, the camera gliding or dragged) the memo
  // above does not hold, and a full search per name per frame cost ~100–300 ms in topic 18's tooth. Then the
  // search resumes where it last succeeded, last frame's point first: a name whose every point lies on a seam
  // (a thin ligament, a layer on a layer) proved that once, not each frame. Such an answer may be a step below
  // the best: once the picture holds still, the view asks again with `settle` and gets the full search
  // (ModelView), the dot the hover tests check.
  const resume = settle ? undefined : lastAnswer.get(id);
  const r = search(items, eye, p, id, inFrame, tries, resume);
  memo.set(key, { eye: [eye[0], eye[1], eye[2]], q: r.q, resumed: !!resume });
  if (resume) resumedUsed = true;
  if (lastAnswer.size > 2000) lastAnswer.clear();
  lastAnswer.set(id, r);
  return r.q;
}

/** Whether a name was placed by a resumed (playback) search since the last call: the view then settles. */
export function takeResumed(): boolean {
  const r = resumedUsed;
  resumedUsed = false;
  return r;
}

/** Forgets the answers searches resume from (each next search is a full one, as on a still picture). */
export function forgetResume(): void {
  lastAnswer.clear();
}

let resumedUsed = false;
const memos = new WeakMap<Item3[], Map<string, { eye: V3; q: V3; resumed?: boolean }>>();
/** The latest strict answer per name: where it was found and by which pass. */
const lastAnswer = new Map<string, Answer>();

/** The dot only must not be hidden by another solid structure (the rule topics 10–14 were laid out with). */
function searchUncovered(items: Item3[], eye: V3, p: V3, id: string, inFrame: (q: V3) => boolean, tries: number): V3 {
  // Seen and inside the picture: it stays. Cut off by the frame's edge, it looks for a part in the picture too.
  if (!coverOf(items, eye, p, id) && inFrame(p)) return p;
  const cand: { q: V3; d: number }[] = [];
  for (const it of items) {
    // Its own drawn pieces, glassy ones included (a cartilage is seen through, yet it is where the name points).
    if (!isOwn(it, id) || it.stream || (it.opacity ?? 1) * (it.show ?? 1) < 0.2) continue;
    const b = boundOf(it);
    // Every other vertex is plenty (rings of a tube are close together) and halves the sort.
    for (let i = 0; i < b.pos.length; i += 6) {
      const q: V3 = [b.pos[i], b.pos[i + 1], b.pos[i + 2]];
      cand.push({ q, d: (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2 + (q[2] - p[2]) ** 2 });
    }
  }
  cand.sort((a, b) => a.d - b.d);
  // Seen with a little room round it: a point just past another vessel's edge would still read as on that one.
  const f: V3 = [p[0] - eye[0], p[1] - eye[1], p[2] - eye[2]];
  const fl = Math.hypot(f[0], f[1], f[2]) || 1;
  const rl = Math.hypot(f[2], f[0]) || 1;
  const right: V3 = [-f[2] / rl, 0, f[0] / rl];
  const up: V3 = [(right[1] * f[2] - right[2] * f[1]) / fl, (right[2] * f[0] - right[0] * f[2]) / fl, (right[0] * f[1] - right[1] * f[0]) / fl];
  // About 12 px on screen whatever the distance: the coarse hit meshes and the drawn outlines are a little wider.
  const ROOM = 0.012 * fl;
  const around = (q: V3): V3[] => [q, ...[right, up].flatMap((a) => [1, -1].map((k): V3 => [q[0] + a[0] * k * ROOM, q[1] + a[1] * k * ROOM, q[2] + a[2] * k * ROOM]))];
  const ok = (q: V3) => inFrame(q) && around(q).every((r) => !coverOf(items, eye, r, id, 0.12));
  const tight = (q: V3) => inFrame(q) && !coverOf(items, eye, q, id, 0.12);
  // Nearest first; farther along, the rest sampled sparsely. A thin thing lying on another (a slit along a
  // seam) never has room round it: then any point of it in sight beats a dot on what covers it.
  for (const pass of [ok, tight]) {
    for (let i = 0; i < Math.min(tries, cand.length); i++) if (pass(cand[i].q)) return cand[i].q;
    for (let i = tries; i < cand.length; i += Math.max(1, Math.floor(cand.length / 64))) if (pass(cand[i].q)) return cand[i].q;
  }
  return p;
}

/** Whether the pointer at `r` lights another named structure (not this one, not the bare ground). */
function litOther(items: Item3[], eye: V3, r: V3, id: string): boolean {
  if (seenOwn(items, eye, r, id)) return false;
  return !!seenAt(items, eye, r);
}

/** Four points a few pixels round `p` across the line of sight. */
function rimOf(eye: V3, p: V3): V3[] {
  const f: V3 = [p[0] - eye[0], p[1] - eye[1], p[2] - eye[2]];
  const fl = Math.hypot(f[0], f[1], f[2]) || 1;
  const rl = Math.hypot(f[2], f[0]) || 1;
  const right: V3 = [-f[2] / rl, 0, f[0] / rl];
  const up: V3 = [(right[1] * f[2] - right[2] * f[1]) / fl, (right[2] * f[0] - right[0] * f[2]) / fl, (right[0] * f[1] - right[1] * f[0]) / fl];
  const r = 0.004 * fl;
  return [right, up].flatMap((a) => [1, -1].map((k): V3 => [p[0] + a[0] * k * r, p[1] + a[1] * k * r, p[2] + a[2] * k * r]));
}

/**
 * Passes, best first: 0 the written point with a clean rim or a point of it with room and a clean rim, 1 room
 * all round, 2 lit at its pixel, 3 nothing else in front, 4 none (the written point). `resume` (last frame's
 * answer, the eye unmoved) starts at the pass that answered then, its point tried first.
 */
function search(items: Item3[], eye: V3, p: V3, id: string, inFrame: (q: V3) => boolean, tries: number, resume?: Answer): Answer {
  // Seen and inside the picture, with its own surface a few pixels all round: it stays. Cut off by the frame's
  // edge, it looks for a part in the picture too. Seen = the pointer on the dot lights this structure: a cover
  // a hair in front (a tubule round the nephrotome it grew from, a sheet over another) moves it as surely as a
  // far one, and so does a dot on its very edge (a few pixels off, the pointer lights the neighbour).
  const shown = (q: V3) => inFrame(q) && seenOwn(items, eye, q, id) && !coverOf(items, eye, q, id);
  // (One of the four points round it may light a neighbour for the written point; none for a moved one.)
  const written = (q: V3) => shown(q) && rimOf(eye, q).filter((r) => litOther(items, eye, r, id)).length <= 1;
  // Its own vertices, nearest first: built only when last frame's point no longer answers (a big bone has thousands).
  let cand: { q: V3; d: number }[] | null = null;
  const cands = () => {
    if (cand) return cand;
    cand = [];
    for (const it of items) {
      // Its own drawn pieces, glassy ones included (a cartilage is seen through, yet it is where the name points).
      if (!isOwn(it, id) || it.stream || (it.opacity ?? 1) * (it.show ?? 1) < 0.05) continue;
      const b = boundOf(it);
      // Every other vertex is plenty (rings of a tube are close together) and halves the sort.
      for (let i = 0; i < b.pos.length; i += 6) {
        const q: V3 = [b.pos[i], b.pos[i + 1], b.pos[i + 2]];
        cand.push({ q, d: (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2 + (q[2] - p[2]) ** 2 });
      }
    }
    return cand.sort((a, b) => a.d - b.d);
  };
  // Seen with a little room round it: a point just past another vessel's edge would still read as on that one.
  const f: V3 = [p[0] - eye[0], p[1] - eye[1], p[2] - eye[2]];
  const fl = Math.hypot(f[0], f[1], f[2]) || 1;
  const rl = Math.hypot(f[2], f[0]) || 1;
  const right: V3 = [-f[2] / rl, 0, f[0] / rl];
  const up: V3 = [(right[1] * f[2] - right[2] * f[1]) / fl, (right[2] * f[0] - right[0] * f[2]) / fl, (right[0] * f[1] - right[1] * f[0]) / fl];
  // About 12 px on screen whatever the distance: the coarse hit meshes and the drawn outlines are a little wider.
  const ROOM = 0.012 * fl;
  const around = (q: V3): V3[] => [q, ...[right, up].flatMap((a) => [1, -1].map((k): V3 => [q[0] + a[0] * k * ROOM, q[1] + a[1] * k * ROOM, q[2] + a[2] * k * ROOM]))];
  // A vertex is on the outline: the dot goes a little inside, towards the anchor (a tube's axis, a bud's middle).
  const inward = (q: V3): V3 => [q[0] + (p[0] - q[0]) * 0.2, q[1] + (p[1] - q[1]) * 0.2, q[2] + (p[2] - q[2]) * 0.2];
  // Lit at its pixel, and nothing else solid in front of it (a face seen edge on included).
  // Each candidate is tried by several passes: its answers are kept for this search (a name with no lit point
  // at all, a fluid under a solid layer, would otherwise cost every pass again, every frame).
  const litMemo = new Map<V3, boolean>();
  const lit = (q: V3) => {
    let r = litMemo.get(q);
    if (r === undefined) litMemo.set(q, (r = seenOwn(items, eye, q, id) && !coverOf(items, eye, q, id, 0.12)));
    return r;
  };
  const ok = (q: V3) => inFrame(q) && lit(q) && around(q).every((r) => !coverOf(items, eye, r, id, 0.12));
  const tight = (q: V3) => inFrame(q) && lit(q);
  // Nothing else named a few pixels round it: the pointer near the dot (not only on its exact pixel) lights it, or nothing.
  // The ring round a lit point is looked at for the nearest few only: a thin nerve on a named bone has no
  // point with a clear ring, and trying them all cost a frame.
  // (Resumed with the eye unmoved, a few: the full look already failed on a frame of this same view.)
  let rings = resume ? 8 : 48;
  const inside = (q: V3) => inFrame(q) && lit(q) && rings-- > 0 && !rimOf(eye, q).some((r) => litOther(items, eye, r, id)) && ok(q);
  // Nearest first; farther along, the rest sampled sparsely. A thin thing lying on another (a slit along a
  // seam) never has room round it: then any point of it in sight beats a dot on what covers it.
  // The roomy pass tries the point a little in (a vertex itself is on the outline: never room all round).
  const inwards = new Map<V3, V3>();
  const take = (pass: (q: V3) => boolean, q: V3) => {
    let r = inwards.get(q);
    if (!r) inwards.set(q, (r = inward(q)));
    return pass(r) ? r : pass !== inside && pass(q) ? q : null;
  };
  // Nothing of it lit anywhere (a thin thing inside another): at least a point nothing else hides.
  const clear = (q: V3) => inFrame(q) && !coverOf(items, eye, q, id, 0.12);
  const passes = [inside, ok, tight, clear];
  // Resumed: last frame's answer by the same test that found it, before anything else (the common case).
  if (resume) {
    // Nothing of it was found from here last frame: not looked for again until the eye moves.
    if (resume.level >= passes.length) return { q: p, level: resume.level, kept: true };
    if (resume.kept) {
      if (resume.level === 0 ? written(p) : shown(p)) return { q: p, level: resume.level, kept: true };
    } else if (passes[resume.level](resume.q)) return { q: resume.q, level: resume.level, kept: false };
  }
  const pLit = shown(p);
  if (pLit && rimOf(eye, p).filter((r) => litOther(items, eye, r, id)).length <= 1) return { q: p, level: 0, kept: true };
  for (let level = resume?.level ?? 0; level < passes.length; level++) {
    const pass = passes[level];
    // No point of it has room all round (a thin thing): its own written point, if the pointer lights it there.
    if (pass === ok && pLit) return { q: p, level, kept: true };
    const c = cands();
    for (let i = 0; i < Math.min(tries, c.length); i++) {
      const r = take(pass, c[i].q);
      if (r) return { q: r, level, kept: false };
    }
    for (let i = tries; i < c.length; i += Math.max(1, Math.floor(c.length / 64))) {
      const r = take(pass, c[i].q);
      if (r) return { q: r, level, kept: false };
    }
  }
  return { q: p, level: passes.length, kept: true };
}

type Answer = { q: V3; level: number; kept: boolean };
