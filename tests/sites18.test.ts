import { describe, expect, test } from 'vitest';
import { PH0, pharynxModel } from '@/components/scenes/week18/pharynx-model';
import { TP0, thyroidModel } from '@/components/scenes/week18/thyroid-model';
import { FP0, faceModel } from '@/components/scenes/week18/face-model';
import { ROOT18, SITE18 } from '@/components/scenes/week18/sites';
import type { M4, V3 } from '@/lib/three-d/math';
import { between, invSim, type Site } from '@/lib/three-d/place';
import type { Item3 } from '@/lib/three-d/scene';

/**
 * Topic 18's models sit in one body (components/scenes/week18/sites.ts), the pharyngeal gut being the root: a
 * stage change flies the camera from one model into the next, and the next appears where it belongs in the one
 * just left. That only reads when the landmark the student is watching is in the same place in both. If a model
 * is redrawn and its landmark moves, these fail: move the site's numbers with it.
 */

type Model = { items: Item3[]; pts: Record<string, V3> };

const apply = (m: M4, p: readonly number[]): V3 => [m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12], m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13], m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14]];

function points(m: Model, pick: (it: Item3) => boolean): V3[] {
  const out: V3[] = [];
  for (const it of m.items) {
    if (!pick(it)) continue;
    const p = it.mesh.pos;
    for (let i = 0; i < p.length; i += 3) out.push(it.matrix ? apply(it.matrix as M4, [p[i], p[i + 1], p[i + 2]]) : [p[i], p[i + 1], p[i + 2]]);
  }
  if (!out.length) throw new Error('no such item');
  return out;
}

/** The middle of the box of the picked items, in the model's own space. */
function middle(m: Model, pick: (it: Item3) => boolean): V3 {
  const ps = points(m, pick);
  const lo = [0, 1, 2].map((k) => Math.min(...ps.map((p) => p[k])));
  const hi = [0, 1, 2].map((k) => Math.max(...ps.map((p) => p[k])));
  return [(lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, (lo[2] + hi[2]) / 2];
}

/** A point of model `a` carried into the shared body (the root's space). */
const toRoot = (a: Site, p: V3) => apply(invSim(a.place), p);
/** How far apart two landmarks are once both are in the shared body (root units). */
const apart = (a: Site, pa: V3, b: Site, pb: V3) => {
  const u = apply(invSim(b.place), apply(between(a.place, b.place), pa));
  const v = toRoot(b, pb);
  return Math.hypot(u[0] - v[0], u[1] - v[1], u[2] - v[2]);
};

const pharynx = pharynxModel(PH0) as unknown as Model;
const thyroid = thyroidModel({ ...TP0, dimple: 1 }) as unknown as Model;
const face = faceModel(FP0) as unknown as Model;
const lumen = (it: Item3) => /^in\d+$/.test(it.key ?? '');

/** The pharynx's floor (its lumen's ventral face) on the midline at level y. */
function floorAt(y: number): V3 {
  const near = points(pharynx, lumen).filter((p) => Math.abs(p[0]) < 0.35 && Math.abs(p[1] - y) < 0.2);
  const z = Math.max(...near.map((p) => p[2]));
  return [0, y, z];
}

describe('topic 18: the models in one body', () => {
  test('the root’s landmarks lie on the pharynx model', () => {
    const fc = floorAt(ROOT18.caecum[1]);
    expect(Math.abs(fc[2] - ROOT18.caecum[2])).toBeLessThan(0.25);
    const top = floorAt(ROOT18.membrane[1]);
    expect(Math.abs(top[2] - ROOT18.membrane[2])).toBeLessThan(0.3);
    const P = pharynxModel(PH0).pts as Record<string, V3>;
    for (const [k, id] of [['pouch1', 'lehen-poltsa'], ['pouch2', 'bigarren-poltsa'], ['pouch3', 'hirugarren-poltsa'], ['pouch4', 'laugarren-poltsa'], ['larynx', 'laringe-zuloa']] as const) {
      const a = ROOT18[k];
      const b = P[id];
      expect(Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])).toBeLessThan(0.05);
    }
  });

  test('the thyroid’s bud sinks from the pharynx’s floor at the foramen caecum', () => {
    const pit = middle(thyroid, (it) => it.id === 'zulo-itsua');
    expect(apart(SITE18.thyroid, pit, SITE18.pharynx, floorAt(ROOT18.caecum[1]))).toBeLessThan(0.3);
  });

  test('the thyroid section’s larynx lies below its foramen caecum, in the midline', () => {
    // The section is a whole head and neck drawn at its own proportions: only the direction is kept.
    const epi = (thyroid.pts as Record<string, V3>)['epiglotisa'];
    const inRoot = toRoot(SITE18.thyroid, epi);
    expect(Math.abs(inRoot[0])).toBeLessThan(0.4);
    expect(inRoot[1]).toBeLessThan(ROOT18.caecum[1] - 1);
  });

  test('the face is built round the pharynx’s cranial end (the buccopharyngeal membrane)', () => {
    const mem = middle(face, (it) => it.id === 'mintz-bukofaringeoa');
    expect(apart(SITE18.face, mem, SITE18.pharynx, ROOT18.membrane)).toBeLessThan(0.3);
    // The face's arch II lies below its mouth, as the root's arch II lies below the membrane.
    const a2 = toRoot(SITE18.face, middle(face, (it) => it.id === 'bigarren-arkua'));
    expect(a2[1]).toBeLessThan(ROOT18.membrane[1] - 1);
  });

  test('every site is a similarity (a flight never shears or mirrors the model left)', () => {
    for (const s of Object.values(SITE18)) {
      const m = s.place;
      const sx = Math.hypot(m[0], m[1], m[2]);
      const sy = Math.hypot(m[4], m[5], m[6]);
      const sz = Math.hypot(m[8], m[9], m[10]);
      expect(Math.abs(sx - sy) + Math.abs(sx - sz)).toBeLessThan(1e-5);
      const det = m[0] * (m[5] * m[10] - m[6] * m[9]) - m[4] * (m[1] * m[10] - m[2] * m[9]) + m[8] * (m[1] * m[6] - m[2] * m[5]);
      expect(det).toBeGreaterThan(0);
    }
  });
});
