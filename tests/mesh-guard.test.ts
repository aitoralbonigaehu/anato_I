import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { auditSurfaces, type SurfaceAudit } from '@/lib/three-d/sdf';
import { cutSolid, extrudeProfile } from '@/lib/three-d/profile';
import { buildForTransfer, geoSlotKeys } from '@/lib/three-d/offthread';
import '@/lib/three-d/geo-registry';
import { BrainMen19, Cranial19, Csf19, Hypophysis19, Thalamus19, Ventricles19 } from '@/components/scenes/week19/Brain19';
import { BR0, brainModel } from '@/components/scenes/week19/brain-model';
import { BP0, bodyModel } from '@/components/scenes/week19/body-model';
import { cordModel, CP0 } from '@/components/scenes/week19/cord-model';
import { sectionModel, SP0 } from '@/components/scenes/week19/section-model';
import { spineModel, SPP0 } from '@/components/scenes/week19/spine-model';
import { neuralModel, NP0 } from '@/components/scenes/week19/neural-model';

/**
 * The mesh guard: the 3D models' surfaces must be meshed on a grid fine enough for what they are, and the heavy
 * meshing must stay off the main thread.
 *
 * Why (2026-11-21, topic 19): the meninges, the subarachnoid fluid and the ventricles' cut faces were meshed
 * straight from their distance fields on grids as coarse as the layers were thin. Both faces of a layer fell in one
 * grid cell, and the pictures broke into dark teeth and staircases; the finer grids that hid it made 850 000
 * triangles and froze the page for seconds. Thin layers and flat cuts are built exactly in lib/three-d/profile.ts
 * (`extrudeProfile`, `cutSolid`); this test fails on any surface that slips back into the old way.
 *
 * The measure (sdf.ts `auditSurfaces`): of the grid samples next to a surface, the share that sit in a layer or a
 * gap only one sample thick. Broken meshes scored 7–29 %, sound ones under 4 %.
 */

const MAX_TRIS = 80_000;
const thinLimit = (a: SurfaceAudit) => (a.surface >= 2000 ? 0.06 : a.surface >= 500 ? 0.12 : 1);
const pct = (a: SurfaceAudit) => `${((100 * a.thin) / Math.max(1, a.surface)).toFixed(1)}% thin of ${a.surface} samples, step ${a.step.map((s) => +s.toFixed(4)).join('/')}, ${a.tris} triangles`;

// Pre-existing exceptions outside topic 19. Match individual surfaces so new failures still break the test.
const existing = new Map<string, string[]>([
  ['calvaria', [
    '13.0% thin of 1183 samples, step 0.018/0.018/0.018, 2436 triangles',
    '13.1% thin of 1220 samples, step 0.018/0.018/0.018, 2272 triangles',
    '14.2% thin of 3483 samples, step 0.016/0.016/0.016, 5400 triangles',
    '13.7% thin of 758 samples, step 0.016/0.016/0.016, 1264 triangles',
  ]],
  ['domains', ['13.4% thin of 1016 samples, step 0.07/0.07/0.07, 1580 triangles']],
  ['nerve-brain', ['1.3% thin of 51163 samples, step 0.085/0.085/0.085, 89492 triangles']],
]);

const log: SurfaceAudit[] = [];
beforeAll(() => auditSurfaces((a) => log.push(a)));
afterAll(() => auditSurfaces(null));
const take = () => log.splice(0);

describe('mesh guard: geometry slots (every topic)', () => {
  for (const key of geoSlotKeys()) {
    test(`${key}: grids fit what they mesh`, () => {
      take();
      buildForTransfer(key);
      const bad = take().filter((a) => a.tris === 0 || a.thin / Math.max(1, a.surface) > thinLimit(a) || a.tris > MAX_TRIS);
      const previous = [...(existing.get(key) ?? [])];
      const regressions = bad.map(pct).filter((entry) => {
        const index = previous.indexOf(entry);
        if (index < 0) return true;
        previous.splice(index, 1);
        return false;
      });
      expect(regressions, 'empty, under-resolved or over-budget mesh').toEqual([]);
    }, 120_000);
  }
});

describe('mesh guard: topic 19 models built while a stage plays', () => {
  const full = { ...CP0, dura: 1, arach: 1, pia: 1, csf: 1, bone: 1, fn: 1, lat: 1, tracts: 1, sens: 1, inter: 1, motor: 1, ends: 1 };
  const slotsByModel: Record<string, string[]> = {
    body: ['body19'],
    brain: ['brain19', 'meninges19', 'ventricles19', 'cores20', 'nuclei20'],
  };
  const runs: [string, () => { items: { key: string; mesh: { idx: Uint32Array } }[] }[]][] = [
    ['body', () => [bodyModel(BP0), bodyModel({ ...BP0, auto: 1, cor: 1, hor: 1, sag: 1, axes: 1, sens: 1, motor: 1 })]],
    ['brain', () => [brainModel(BR0), brainModel({ ...BR0, men: 1, csf: 1, vent: 1, plex: 1, flowShow: 1 }), brainModel({ ...BR0, matter: 1, nuclei: 1, comm: 1 }), brainModel({ ...BR0, comm: 0.6 })]],
    ['cord', () => [cordModel(CP0), cordModel(full), cordModel({ ...full, sens: 0.4, motor: 0.6 }), cordModel({ ...full, symp: 1, pre: 1, post: 1, splanch: 1 })]],
    ['section', () => [-1, -0.5, 0, 0.5, 1].map((m) => sectionModel({ ...SP0, fold: 1, crest: 1, drg: 1, chain: 1, mature: m, layers: 1, plates: 1, blasts: 1, lat: 1 })).concat([sectionModel({ ...SP0, fold: 0.5 })])],
    ['spine', () => [0, 0.5, 1].map((g) => spineModel({ ...SPP0, grow: g, sac: g, epi: g, needle: g, drops: g, epiNeedle: g }))],
    ['neural', () => [0, 0.5, 1].map((g) => neuralModel({ ...NP0, fold: g, zip: g, three: g, five: g, flex: g, tint: g }))],
  ];
  for (const [name, run] of runs)
    test(`${name}: no grid meshing on the main thread, every part within budget`, () => {
      for (const key of slotsByModel[name] ?? []) buildForTransfer(key);
      take();
      const models = run();
      // Distance-field surfaces cost seconds: they belong in a geometry slot (built in a worker), not in a model
      // the page rebuilds while it plays.
      expect(take().map(pct)).toEqual([]);
      const bad = models.flatMap((m) => m.items.filter((i) => i.mesh.idx.length === 0 || i.mesh.idx.length / 3 > MAX_TRIS).map((i) => `${i.key}: ${i.mesh.idx.length / 3}`));
      expect(bad).toEqual([]);
    }, 60_000);
});

test('flat cuts preserve a thin ring and its hole with outward-facing caps', () => {
  const outer = (x: number, y: number, z: number) => Math.hypot(x, y, z) - 1;
  const inner = (x: number, y: number, z: number) => Math.hypot(x, y, z) - 0.97;
  const ring = (x: number, y: number, z: number) => Math.max(outer(x, y, z), -inner(x, y, z));
  const cut = cutSolid({
    faces: [{ f: outer }, { f: inner, flip: true }], solid: ring,
    lo: [-1.1, -1.1, -1.1], hi: [1.1, 1.1, 0], step: 0.12,
    cuts: [{ axis: 2, at: 0, keep: 1 }], capStep: 0.006,
  });
  const prism = extrudeProfile((x, y) => ring(x, y, 0), [-1.1, -1.1], [1.1, 1.1], 0.006, -1, 0);

  for (const { idx, pos, nrm } of [cut, prism]) {
    let area = 0;
    for (let i = 0; i < idx.length; i += 3) {
      const a = idx[i] * 3, b = idx[i + 1] * 3, c = idx[i + 2] * 3;
      if ([a, b, c].some((v) => pos[v + 2] !== 0 || nrm[v + 2] !== 1)) continue;
      const twiceArea = (pos[b] - pos[a]) * (pos[c + 1] - pos[a + 1]) - (pos[c] - pos[a]) * (pos[b + 1] - pos[a + 1]);
      expect(twiceArea).toBeGreaterThan(0);
      area += twiceArea / 2;
    }
    expect(area).toBeCloseTo(Math.PI * (1 - 0.97 ** 2), 3);
  }
});

test('head stages only wait for geometry they can display', () => {
  expect(Thalamus19.geo).toEqual(['brain19', 'ventricles19']);
  expect(Hypophysis19.geo).toEqual(['brain19']);
  expect(Cranial19.geo).toEqual(['brain19']);
  expect(BrainMen19.geo).toEqual(['brain19', 'meninges19', 'ventricles19']);
  expect(Ventricles19.geo).toEqual(['brain19', 'ventricles19']);
  expect(Csf19.geo).toEqual(['brain19', 'ventricles19', 'meninges19']);
});

describe('mesh guard: grid meshing only in geometry slots', () => {
  // Models that still mesh distance fields on the main thread (cached, but the first view freezes while they
  // build). Move them into a geometry slot; never add to this list.
  const LEGACY = new Set(['components/scenes/week17/bones-model.ts', 'components/scenes/week17/larynx-model.ts', 'components/scenes/week18/neck-model.ts', 'components/shell/eratorriak/Bone3D.tsx']);
  const root = join(__dirname, '..');
  const files: string[] = [];
  const walk = (d: string) => {
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.(ts|tsx)$/.test(f) && !/\.test\./.test(f)) files.push(p);
    }
  };
  walk(join(root, 'components'));
  test('every module that meshes a distance field registers a geometry slot', () => {
    const offenders = files
      .map((p) => ({ p: relative(root, p).replace(/\\/g, '/'), s: readFileSync(p, 'utf8') }))
      .filter(({ s }) => /\b(surfaceMesh|cutSolid)\(/.test(s) && !/\bgeoSlot\(/.test(s))
      .map(({ p }) => p)
      .filter((p) => !LEGACY.has(p));
    expect(offenders).toEqual([]);
  });
});
