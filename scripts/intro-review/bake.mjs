// Bake the same implicit body that backs embryo5().body, plus optical density
// for existing structures. Run from the repo root with Node 22.15+.
import { registerHooks } from 'node:module';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
const root = new URL('../../', import.meta.url);
const hooks = registerHooks({
  resolve(id, ctx, next) {
    if (id.startsWith('@/') || (id.startsWith('.') && ctx.parentURL?.endsWith('.ts'))) {
      const base = id.startsWith('@/') ? new URL(id.slice(2), root) : new URL(id, ctx.parentURL);
      if (existsSync(new URL(base.href + '.ts'))) return { url: base.href + '.ts', shortCircuit: true };
    }
    return next(id, ctx);
  },
});
const { embryo5, O, RC, HEART5, ARCHES5 } = await import('../../lib/three-d/embryo5.ts');
const { field, eyes, body } = embryo5();
hooks.deregister();
const size = [64, 120, 130],
  lo = [-1.72, -6.3, -3.83],
  hi = [1.72, 1.25, 4.27];
const bytes = Buffer.alloc(size.reduce((p, v) => p * v, 4));
const clamp = (v) => Math.max(0, Math.min(1, v));
const eye = eyes[0].pos;
const eyeCenter = [0, 1, 2].map((k) => eye.filter((_, i) => i % 3 === k).reduce((a, b) => a + b, 0) / (eye.length / 3));
for (let z = 0, i = 0; z < size[2]; z++)
  for (let y = 0; y < size[1]; y++)
    for (let x = 0; x < size[0]; x++, i += 4) {
      const [px, py, pz] = [x, y, z].map((v, k) => lo[k] + ((hi[k] - lo[k]) * (v + 0.5)) / size[k]);
      const a = Math.atan2(pz, py - O[1]),
        r = Math.hypot(py - O[1], pz) - RC,
        side = Math.abs(px);
      let d = field(px, py, pz);
      const eyeR = Math.hypot((py - eyeCenter[1]) / 0.176, (pz - eyeCenter[2]) / 0.166);
      if (side > 0.75 && eyeR < 1.8) {
        d += 0.067 * Math.exp(-3 * eyeR * eyeR) - 0.05 * Math.exp(-((eyeR - 0.81) ** 2) / 0.15);
      }
      bytes[i] = Math.round(clamp(0.5 + d / 1.6) * 255);
      if (d > 0.04) continue;
      // The emitter is inside the heart prominence used in embryo5.makeField().
      const h =
        (px / 0.63) ** 2 + ((py - HEART5[1] + 0.23 * (pz - HEART5[2])) / 0.87) ** 2 + ((pz - HEART5[2]) / 0.63) ** 2;
      let blood = 0.5 * Math.exp(-h * 1.55) + 0.28 * Math.exp(-h * 0.45);
      for (const arch of ARCHES5) {
        const v = (pz - arch.z) / 0.39;
        const cross = (py - arch.y - 0.2 * (pz - arch.z)) / 0.11;
        blood += 0.23 * Math.exp(-cross * cross - ((side - 0.9 + 0.13 * v * v) / 0.16) ** 2 - v ** 4);
      }
      bytes[i + 1] = Math.round(255 * clamp(blood));
      // The dorsal cord and paired paraxial condensations follow the trunk section
      // in Domains3D.tsx, carried along the curved y-z axis of the week-five mesh.
      const taper = clamp((a + 2.48) / 1.28) * clamp((1.69 - a) / 0.36);
      const neural = (px / 0.17) ** 2 + ((r - 0.55) / 0.3) ** 2;
      bytes[i + 2] = Math.round(255 * Math.exp(-neural * 1.4) * taper);
      const period = 0.6 / (RC + 0.55),
        centre = 0.2 / (RC + 0.55);
      const distance = (a - centre - Math.round((a - centre) / period) * period) * (RC + 0.55);
      const s = ((side - 0.48) / 0.26) ** 2 + ((r - 0.55) / 0.17) ** 2 + (distance / 0.245) ** 2;
      bytes[i + 3] = Math.round(255 * Math.exp(-s * 1.25) * taper);
    }
const dest = new URL('public/intro-review/', root);
await mkdir(dest, { recursive: true });
await writeFile(new URL('week-five.vol.gz', dest), gzipSync(bytes, { level: 9 }));
console.log('Field', size, 'eye', eyeCenter, 'compressed bytes', gzipSync(bytes).length);
/* A shuffled, area-weighted surface sample. Reject neighbours inside a minimum
   radius so dots resolve individually; the first N also cover the entire mesh. */
const count = 163840,
  points = new Int16Array(count * 3),
  pos = body.pos,
  index = body.idx;
let seed = 1718;
const random = () => (seed = (Math.imul(1664525, seed) + 1013904223) >>> 0) / 4294967296;
const areas = [],
  bins = new Map();
let sum = 0;
for (let i = 0; i < index.length; i += 3) {
  const a = index[i] * 3,
    b = index[i + 1] * 3,
    c = index[i + 2] * 3;
  const ux = pos[b] - pos[a],
    uy = pos[b + 1] - pos[a + 1],
    uz = pos[b + 2] - pos[a + 2];
  const vx = pos[c] - pos[a],
    vy = pos[c + 1] - pos[a + 1],
    vz = pos[c + 2] - pos[a + 2];
  sum += Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx);
  areas.push(sum);
}
const spacing = 0.01;
for (let n = 0; n < count; ) {
  let l = 0,
    h = areas.length - 1;
  const hit = random() * sum;
  while (l < h) {
    const m = (l + h) >> 1;
    if (areas[m] < hit) l = m + 1;
    else h = m;
  }
  const a = index[l * 3] * 3,
    b = index[l * 3 + 1] * 3,
    c = index[l * 3 + 2] * 3;
  const u = Math.sqrt(random()),
    v = random(),
    xyz = [0, 1, 2].map((k) => (1 - u) * pos[a + k] + u * (1 - v) * pos[b + k] + u * v * pos[c + k]);
  const cell = xyz.map((v) => Math.floor(v / spacing));
  let near = false;
  for (let j = -1; j <= 1 && !near; j++)
    for (let k = -1; k <= 1 && !near; k++)
      for (let z = -1; z <= 1 && !near; z++) {
        const group = bins.get(((cell[0] + j) * 2048 + cell[1] + k) * 2048 + cell[2] + z);
        if (group)
          near = group.some((i) => xyz.reduce((s, v, k) => s + (v - points[3 * i + k] / 4096) ** 2, 0) < spacing ** 2);
      }
  if (near) continue;
  const key = (cell[0] * 2048 + cell[1]) * 2048 + cell[2];
  if (!bins.has(key)) bins.set(key, []);
  bins.get(key).push(n);
  xyz.forEach((v, k) => (points[n * 3 + k] = Math.round(v * 4096)));
  n++;
}
await writeFile(new URL('surface.bin.gz', dest), gzipSync(Buffer.from(points.buffer), { level: 9 }));
