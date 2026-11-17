import { mulM, type View3 } from './math';
import { clipped, type Item3 } from './scene';

/**
 * What the pointer is on in a 3D view: the structure the eye sees at that pixel, found the way the WebGL
 * layer draws it (every triangle, both faces, the item's cut), nearest first. The invisible outlines the
 * flat fallback points with are painted by each item's mean depth, so a big wrapping item (a cut block, the
 * wall, a glass sac) could take the pointer over the small thing lying on or in front of it; this cannot.
 *
 * See-through items (context glass) let the pointer through to what shows behind them; one is picked only
 * when nothing more solid lies under the pointer. Unnamed context (the body) that is solid blocks it.
 */

/** Items at or above this strength are solid for pointing; below it, glass the eye looks through. */
const SOLID = 0.5;

interface Screen {
  sig: string;
  x: Float32Array;
  y: Float32Array;
  z: Float32Array;
  ok: Uint8Array;
  box: [number, number, number, number];
}
const cache = new WeakMap<object, Map<string, Screen>>();

function screenOf(it: Item3, v: View3): Screen {
  const mesh = it.hit ?? it.mesh;
  const sig = `${Array.prototype.join.call(v.vp, ',')}|${it.matrix ? Array.prototype.join.call(it.matrix, ',') : ''}|${it.clip ? JSON.stringify(it.clip) : ''}`;
  let byKey = cache.get(mesh);
  if (!byKey) cache.set(mesh, (byKey = new Map()));
  const was = byKey.get(it.key);
  if (was && was.sig === sig) return was;
  const m = it.matrix ? mulM(v.vp, it.matrix) : v.vp;
  const n = mesh.pos.length / 3;
  const x = new Float32Array(n);
  const y = new Float32Array(n);
  const z = new Float32Array(n);
  const ok = new Uint8Array(n);
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (let i = 0; i < n; i++) {
    const px = mesh.pos[i * 3];
    const py = mesh.pos[i * 3 + 1];
    const pz = mesh.pos[i * 3 + 2];
    const w = m[3] * px + m[7] * py + m[11] * pz + m[15];
    if (w <= 0.01) continue;
    if (it.clip && clipped(it.clip, [px, py, pz])) continue;
    ok[i] = 1;
    const sx = ((m[0] * px + m[4] * py + m[8] * pz + m[12]) / w) * 500 + 500;
    const sy = 320 - ((m[1] * px + m[5] * py + m[9] * pz + m[13]) / w) * 320;
    x[i] = sx;
    y[i] = sy;
    z[i] = (m[2] * px + m[6] * py + m[10] * pz + m[14]) / w;
    if (sx < x0) x0 = sx;
    if (sx > x1) x1 = sx;
    if (sy < y0) y0 = sy;
    if (sy > y1) y1 = sy;
  }
  const s: Screen = { sig, x, y, z, ok, box: [x0, y0, x1, y1] };
  byKey.set(it.key, s);
  return s;
}

/** Nearest depth of the item under frame point (px, py), or Infinity. */
function depthAt(it: Item3, v: View3, px: number, py: number): number {
  const s = screenOf(it, v);
  const [x0, y0, x1, y1] = s.box;
  if (px < x0 || px > x1 || py < y0 || py > y1) return Infinity;
  const idx = (it.hit ?? it.mesh).idx;
  const { x, y, z, ok } = s;
  let best = Infinity;
  for (let t = 0; t < idx.length; t += 3) {
    const a = idx[t];
    const b = idx[t + 1];
    const c = idx[t + 2];
    if (!ok[a] || !ok[b] || !ok[c]) continue;
    const ax = x[a];
    const ay = y[a];
    const bx = x[b];
    const by = y[b];
    const cx = x[c];
    const cy = y[c];
    // Quick reject on the triangle's box.
    if ((px < ax && px < bx && px < cx) || (px > ax && px > bx && px > cx) || (py < ay && py < by && py < cy) || (py > ay && py > by && py > cy)) continue;
    const d = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy);
    if (Math.abs(d) < 1e-9) continue;
    const l1 = ((by - cy) * (px - cx) + (cx - bx) * (py - cy)) / d;
    const l2 = ((cy - ay) * (px - cx) + (ax - cx) * (py - cy)) / d;
    const l3 = 1 - l1 - l2;
    if (l1 < 0 || l2 < 0 || l3 < 0) continue;
    // NDC depth is affine in screen space: interpolate it straight.
    const dz = l1 * z[a] + l2 * z[b] + l3 * z[c];
    if (dz > -1 && dz < best) best = dz;
  }
  return best;
}

/**
 * The structure id the eye sees at frame point (px, py) (frame units: 1000 × 640), or null on empty space or
 * unnamed solid context.
 */
export function pickAt(items: readonly Item3[], v: View3, px: number, py: number): string | null {
  let solid: { z: number; id: string | null; back: boolean } = { z: Infinity, id: null, back: false };
  let glass: { z: number; id: string | null } = { z: Infinity, id: null };
  for (const it of items) {
    if (it.stream) continue;
    const a = (it.show ?? 1) * (it.opacity ?? 1);
    if (a <= 0.01) continue;
    // Unnamed glass (the fly-in's embryo, a faint body) neither takes nor blocks the pointer.
    if (!it.id && a < SOLID) continue;
    const z = depthAt(it, v, px, py);
    if (z === Infinity) continue;
    if (a >= SOLID) {
      if (z < solid.z) solid = { z, id: it.id ?? null, back: !!it.ground || !it.id };
    } else if (z < glass.z) glass = { z, id: it.id! };
  }
  // A see-through structure lying on the backdrop (the wall, a cut block, the unnamed body) is what the eye
  // looks at there: it wins over the backdrop behind it, never over a named solid structure.
  if (glass.id && glass.z < solid.z && solid.back) return glass.id;
  if (solid.z < Infinity) return solid.id;
  return glass.id;
}
