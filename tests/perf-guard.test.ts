import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { blob, grid, tube, type Mesh } from '@/lib/three-d/mesh';
import { viewOf, type V3 } from '@/lib/three-d/math';
import { KEY_LIGHT, projectItem } from '@/lib/three-d/scene';
import { auditSurfaces } from '@/lib/three-d/sdf';
import { adrenalModel, AP0 } from '@/components/scenes/week15/adrenal-model';
import { glansModel, GP0 } from '@/components/scenes/week15/glans-model';
import { kidneyModel, KP0 } from '@/components/scenes/week15/kidney-model';
import { nephronModel, NP0 } from '@/components/scenes/week15/nephron-model';
import { pelvisModel, PP0 } from '@/components/scenes/week15/pelvis-model';
import { trigoneModel, TP0 } from '@/components/scenes/week15/trigone-model';
import { unitModel, UNIT0 } from '@/components/scenes/week15/unit-model';
import { uroModel, UP0 } from '@/components/scenes/week15/uro-model';
import { broadModel, BR0 } from '@/components/scenes/week16/broad-model';
import { descentModel, DS0 } from '@/components/scenes/week16/descent-model';
import { ductModel, DP0 } from '@/components/scenes/week16/duct-model';
import { externalModel, EX0 } from '@/components/scenes/week16/external-model';
import { gonadModel, GN0 } from '@/components/scenes/week16/gonad-model';
import { REEL } from '@/components/shell/HeroReel';

/**
 * The performance guard (2026-11-22). Each part pins a problem found and fixed, so it cannot come back unseen:
 *
 * 1. Played frames (topics 15–16): every model is rebuilt each frame of a played stage. A model must not mesh a
 *    distance field while it plays, must stay within a triangle and a per-frame vertex budget, and must give back
 *    the same meshes for the same pose (a paused or re-drawn frame builds nothing). The sweep moves every pose value
 *    at once: harder than any stage. Budgets are ~1.5× the worst model on the day they were set.
 * 2. The mesh builders were made faster without changing a single number they produce: their output is pinned by
 *    a checksum. A deliberate change of shape updates the checksums here, with the reason in the commit.
 * 3. With WebGL drawing the picture, each part's outline is read only for its box (zooming onto it). Writing out
 *    every triangle cost most of a big model's playback; the box must keep the outline's exact extent.
 * 4. The homepage loads the light registry (content/registry-lite.ts, registry-meta.json), never the topics'
 *    scenes: one static import of content/registry.ts from Home's tree put every topic's code on the homepage.
 *    Its showreel plays recorded clips of the 3D (public/reel/), never a live WebGL model: each clip must exist and
 *    stay small.
 *
 * Measured in a real browser too (scratch probes, Edge on the GPU): stage load ~1.7 s, playback ~115–120 fps.
 */

type Model = { items: { key: string; mesh: object; hit?: object; idx?: unknown }[] };
type Run = (pose: never) => Model;
const MODELS: [string, Run, Record<string, unknown>][] = [
  ['15 uro', uroModel as never, UP0 as never],
  ['15 kidney', kidneyModel as never, KP0 as never],
  ['15 nephron', nephronModel as never, NP0 as never],
  ['15 unit', unitModel as never, UNIT0 as never],
  ['15 pelvis', pelvisModel as never, PP0 as never],
  ['15 trigone', trigoneModel as never, TP0 as never],
  ['15 glans', glansModel as never, GP0 as never],
  ['15 adrenal', adrenalModel as never, AP0 as never],
  ['16 gonad', gonadModel as never, GN0 as never],
  ['16 duct', ductModel as never, DP0 as never],
  ['16 broad', broadModel as never, BR0 as never],
  ['16 descent', descentModel as never, DS0 as never],
  ['16 external', externalModel as never, EX0 as never],
];
/** Triangles drawn in one frame (worst on the day: 48 k). */
const MAX_TRIS = 75_000;
/** Vertices built in one frame of the sweep (worst on the day: 28 k). */
const MAX_VERTS = 42_000;
/** Mean build time per frame of the sweep, a backstop for order-of-magnitude slips only (worst on the day: ~20 ms). */
const MAX_MS = 80;
/** Items allowed to build a new mesh when the very same pose is drawn again (on the day: at most 2). */
const MAX_REBUILT = 2;

const trisOf = (m: Model) => m.items.reduce((n, i) => n + (i.mesh as Mesh).idx.length / 3, 0);

describe('perf guard: topics 15–16 played frames', () => {
  for (const [name, run, p0] of MODELS) {
    test(`${name}: no field meshing, within budget, same pose = same meshes`, () => {
      const keys = Object.keys(p0);
      const pose = (t: number) => Object.fromEntries(keys.map((k) => [k, typeof p0[k] === 'number' ? t : p0[k]])) as never;
      run(pose(0.5));
      let grids = 0;
      auditSurfaces(() => grids++);
      const g = globalThis as { __perf?: Record<string, number> };
      let maxTris = 0, maxVerts = 0;
      const t0 = performance.now();
      try {
        for (let f = 0; f <= 30; f++) {
          g.__perf = {};
          const m = run(pose(f / 30));
          maxVerts = Math.max(maxVerts, g.__perf.meshVerts ?? 0);
          maxTris = Math.max(maxTris, trisOf(m));
        }
      } finally {
        g.__perf = undefined;
        auditSurfaces(null);
      }
      const ms = (performance.now() - t0) / 31;
      expect(grids, 'a distance field was meshed while the stage plays: build it once (geoSlot / cached profile)').toBe(0);
      expect(maxTris).toBeLessThanOrEqual(MAX_TRIS);
      expect(maxVerts, 'too many vertices built per frame: cache the parts that do not move (cachedTube/cachedBlob)').toBeLessThanOrEqual(MAX_VERTS);
      expect(ms).toBeLessThan(MAX_MS);
      const a = run(pose(0.37)), b = run(pose(0.37));
      const was = new Map(a.items.map((i) => [i.key, i.mesh]));
      const rebuilt = b.items.filter((i) => was.get(i.key) !== i.mesh).map((i) => i.key);
      expect(rebuilt.length, `rebuilt for an unchanged pose: ${rebuilt.join(', ')}`).toBeLessThanOrEqual(MAX_REBUILT);
    });
  }
});

/** FNV-1a over the bytes of every array of a mesh. */
function checksum(ms: Mesh[]) {
  let h = 0x811c9dc5;
  for (const m of ms)
    for (const a of [m.pos, m.nrm, m.uv, m.idx]) {
      const u8 = new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
      for (let i = 0; i < u8.length; i++) h = Math.imul(h ^ u8[i], 0x01000193) >>> 0;
    }
  return h.toString(16);
}

describe('perf guard: mesh builders produce exactly the same geometry', () => {
  const line: V3[] = Array.from({ length: 17 }, (_, i) => [Math.sin(i * 0.4) * 1.3, i * 0.21 - 1.5, Math.cos(i * 0.3) * 0.6]);
  test('tube', () => {
    const ms = [
      tube(line, { radius: (u) => 0.2 + 0.1 * Math.sin(u * 6), sides: 12, capStart: true, capEnd: true, ref: [0, 0, 1] }),
      tube(line, { radius: () => 0.15, sides: 7, ref: [1, 0, 0] }),
      tube(line.slice(0, 5), { radius: (u) => 0.3 * (1 - u) + 0.05, sides: 16, capEnd: true, ref: [0, 0, 1], around: (a) => 1 + 0.2 * Math.cos(2 * a) }),
    ];
    expect(checksum(ms)).toMatchInlineSnapshot(`"7f89d462"`);
  });
  test('blob', () => {
    const ms = [
      blob({ center: [0.2, -0.4, 1], radii: [1, 0.6, 0.8] }),
      blob({ center: [0, 0, 0], radii: [0.3, 0.3, 0.3], rings: 6, sides: 8 }),
      blob({ center: [1, 2, 3], radii: [0.5, 1.2, 0.4], rings: 14, sides: 20 }),
    ];
    expect(checksum(ms)).toMatchInlineSnapshot(`"e0544f0c"`);
  });
  test('grid', () => {
    expect(checksum([grid(9, 7, (u, v) => [u * 2 - 1, Math.sin(u * 3) * v, v * 1.5])])).toMatchInlineSnapshot(`"30cfa14f"`);
  });
});

describe('perf guard: outlines with WebGL up are one box of the same extent', () => {
  const boxOf = (d: string) => {
    const xs: number[] = [], ys: number[] = [];
    for (const m of d.matchAll(/([MLHV])([^MLHVZ]*)/g)) {
      const v = m[2].split(/[ ,]/).filter(Boolean).map(Number);
      if (m[1] === 'M' || m[1] === 'L') xs.push(v[0]), ys.push(v[1]);
      else if (m[1] === 'H') xs.push(v[0]);
      else ys.push(v[0]);
    }
    return xs.length ? [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)] : null;
  };
  test('topic 15–16 models from three cameras', () => {
    const models = [
      uroModel({ ...UP0, meso: 1, wolff: 1, gonadal: 1, germ: 0.6 } as never, { yolk: 1, gut: 1 } as never),
      gonadModel({ ...GN0, germ: 1, cords: 0.7, medulla: 0.5 } as never),
      ductModel({ ...DP0, male: 1, efferent: 1, epididymis: 1, semen: 0.5 } as never),
    ];
    const cams = [
      { eye: [0, 0, 14], target: [0, -1, 0], fov: 30 },
      { eye: [9, 4, 9], target: [0, -2, 0.5], fov: 28 },
      { eye: [-3, -8, 6], target: [0, 0, 0], fov: 40, shift: [40, -20] },
    ];
    let checked = 0;
    for (const cam of cams) {
      const v = viewOf(cam as never);
      for (const m of models)
        for (const it of m.items) {
          const flat = projectItem(it, v, KEY_LIGHT, true), gl = projectItem(it, v, KEY_LIGHT, false);
          expect(gl.any).toBe(flat.any);
          expect(gl.depth).toBe(flat.depth);
          expect(boxOf(gl.d)).toEqual(boxOf(flat.d));
          expect(gl.d.length).toBeLessThan(80);
          checked++;
        }
    }
    expect(checked).toBeGreaterThan(300);
  });
});

describe('perf guard: the homepage stays light', () => {
  const ROOT = join(__dirname, '..');
  const resolve = (from: string, spec: string): string | null => {
    let base: string;
    if (spec.startsWith('@/')) base = join(ROOT, spec.slice(2));
    else if (spec.startsWith('.')) base = join(from, '..', spec);
    else return null;
    for (const ext of ['', '.ts', '.tsx', '/index.ts', '/index.tsx']) {
      const p = base + ext;
      if (existsSync(p) && statSync(p).isFile()) return p;
    }
    return null;
  };
  /** Static imports only: `import type` is erased, `import()` is a split point loaded on demand. */
  const importsOf = (file: string) => {
    const src = readFileSync(file, 'utf8');
    const out: string[] = [];
    for (const m of src.matchAll(/^\s*(?:import|export)\s+(?!type\b)(?:[^'"]*?\sfrom\s+)?['"]([^'"]+)['"]/gm)) out.push(m[1]);
    return out;
  };
  test('Home reaches neither the full registry nor any topic content by static imports', () => {
    const seen = new Map<string, string>();
    const queue = [join(ROOT, 'app', 'page.tsx'), join(ROOT, 'app', 'layout.tsx')].filter(existsSync);
    for (const q of queue) seen.set(q, '(entry)');
    while (queue.length) {
      const f = queue.shift()!;
      if (!/\.(ts|tsx)$/.test(f)) continue;
      for (const spec of importsOf(f)) {
        const r = resolve(f, spec);
        if (!r || seen.has(r)) continue;
        seen.set(r, f);
        queue.push(r);
      }
    }
    const rel = (p: string) => p.slice(ROOT.length + 1).replace(/\\/g, '/');
    const chain = (p: string) => {
      const c = [rel(p)];
      for (let x = seen.get(p); x && x !== '(entry)'; x = seen.get(x)) c.push(rel(x));
      return c.reverse().join(' → ');
    };
    const bad = [...seen.keys()].filter((p) => /content[\\/](registry\.ts|weeks[\\/])/.test(p));
    expect(bad.map(chain), 'use content/registry-lite (and week-loader for scenes) on the homepage').toEqual([]);
    expect(seen.size).toBeGreaterThan(20);
  });
  test('registry-meta.json stays small', () => {
    const kb = statSync(join(ROOT, 'content', 'registry-meta.json')).size / 1024;
    // 630 KB on the day (125 KB compressed): beat text only where a structure is first focused.
    expect(kb).toBeLessThan(760);
  });
  test('the showreel: every clip recorded, each small', () => {
    expect(REEL.length, 'a reel pick names a stage the registry does not have').toBe(6);
    for (const r of REEL) {
      for (const ext of ['mp4', 'webp']) {
        const f = join(ROOT, 'public', 'reel', `${r.clip}.${ext}`);
        expect(existsSync(f), `${r.clip}.${ext} missing: node scripts/quality/reel-clips.mjs --only ${r.clip}`).toBe(true);
      }
      expect(statSync(join(ROOT, 'public', 'reel', `${r.clip}.mp4`)).size / 1024).toBeLessThan(900);
    }
  });
});
