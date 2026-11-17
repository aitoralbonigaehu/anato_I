import { describe, expect, test } from 'vitest';
import { FP0, faceModel } from '@/components/scenes/week18/face-model';
import { CH0, PAL0, choanaModel, palateModel } from '@/components/scenes/week18/palate-model';
import { JP0, TP0, jawModel, toothModel } from '@/components/scenes/week18/tooth-model';
import { SITE18 } from '@/components/scenes/week18/sites';
import { SITE18C } from '@/components/scenes/week18/sites-c';
import type { M4, V3 } from '@/lib/three-d/math';
import { between, invSim, type Site } from '@/lib/three-d/place';
import type { Item3 } from '@/lib/three-d/scene';

/**
 * Topic 18's palate, nose and tooth models sit in the topic's one body (components/scenes/week18/sites-c.ts): a
 * stage change flies the camera from one into the next, and the next appears where it belongs in the one just
 * left. That only reads when the landmark the student is watching is in the same place in both. If a model is
 * redrawn and its landmark moves, these fail: move the site's numbers with it.
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

function middle(ps: V3[]): V3 {
  const lo = [0, 1, 2].map((k) => Math.min(...ps.map((p) => p[k])));
  const hi = [0, 1, 2].map((k) => Math.max(...ps.map((p) => p[k])));
  return [(lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, (lo[2] + hi[2]) / 2];
}

/** A point of model `a` carried into model `b`'s space. */
const carry = (a: Site, b: Site, p: V3) => apply(between(a.place, b.place), p);
const dist = (u: V3, v: V3) => Math.hypot(u[0] - v[0], u[1] - v[1], u[2] - v[2]);
const scaleOf = (m: M4) => Math.hypot(m[0], m[1], m[2]);
const faceSite = SITE18.face;

describe('topic 18 (palate, nose, teeth): the models in one body', () => {
  test('the palate lies under the face’s intermaxillary segment, just behind the upper lip', () => {
    const face = faceModel({ ...FP0, age: 10.4, duct: 1 }) as unknown as Model;
    const lip = face.pts['goiko-ezpainaren-erdiko-atala'];
    const palate = palateModel({ ...PAL0, whole: 1, jaw: 1, swing: 1, grow: 1, seg: 1, segShow: 1 }) as unknown as Model;
    const ridge = points(palate, (it) => it.key === 'ridge-seg');
    // The ridge's front (the segment's arc) in the face's space: behind the lip, a little lower, on the midline.
    const front = ridge.reduce((a, p) => (p[2] > a[2] ? p : a));
    const inFace = carry(SITE18C.palate, faceSite, front);
    expect(Math.abs(inFace[0])).toBeLessThan(0.1);
    expect(lip[2] - inFace[2]).toBeGreaterThan(0.02);
    expect(lip[2] - inFace[2]).toBeLessThan(0.4);
    expect(dist(inFace, lip)).toBeLessThan(0.4);
  });

  test('the palate is no wider than the face’s mouth region', () => {
    const palate = palateModel({ ...PAL0, whole: 1, jaw: 1, swing: 1, seg: 1, segShow: 1 }) as unknown as Model;
    const ridge = points(palate, (it) => (it.key ?? '').startsWith('ridge'));
    const w = Math.max(...ridge.map((p) => Math.abs(p[0]))) / scaleOf(SITE18C.palate.place) * scaleOf(faceSite.place);
    // Face units: the face's mouth reaches |x| ≈ 0.5 at week 10, its cheeks ≈ 1.
    expect(w).toBeGreaterThan(0.4);
    expect(w).toBeLessThan(1.1);
  });

  test('the nostril cut lies on the palate’s primary palate', () => {
    const choana = choanaModel(CH0) as unknown as Model;
    const prim = middle(points(choana, (it) => it.key === 'prim'));
    const palate = palateModel({ ...PAL0, whole: 1, jaw: 1, swing: 1, seg: 1, segShow: 1 }) as unknown as Model;
    const tri = middle(points(palate, (it) => it.key === 'primary'));
    const inPal = carry(SITE18C.choana, SITE18C.palate, prim);
    // Same height and depth (the cut is off the midline by the nostril's offset).
    expect(Math.abs(inPal[1] - tri[1])).toBeLessThan(0.35);
    expect(Math.abs(inPal[2] - tri[2])).toBeLessThan(0.6);
  });

  test('the tooth block’s gum is the choana model’s lower gum at the front', () => {
    const tooth = toothModel({ ...TP0, thick: 1 }) as unknown as Model;
    const epi = points(tooth, (it) => it.key === 'epi');
    const top = epi.filter((p) => Math.abs(p[0]) < 0.3 && p[2] > -0.05).reduce((a, p) => (p[1] > a[1] ? p : a));
    const choana = choanaModel(CH0) as unknown as Model;
    const inCh = carry(SITE18C.tooth, SITE18C.choana, top);
    const lo = points(choana, (it) => it.key === 'head-lo').filter((p) => Math.abs(p[2] - inCh[2]) < 0.12);
    const floor = Math.max(...lo.map((p) => p[1]));
    expect(Math.abs(inCh[1] - floor)).toBeLessThan(0.2);
    expect(Math.abs(inCh[0])).toBeLessThan(0.1);
  });

  test('the two whole jaws of the first step pass through the block (it is a slice of the lower one)', () => {
    const tooth = toothModel({ ...TP0, arch: 1 }) as unknown as Model;
    const low = points(tooth, (it) => it.key === 'jaw-low').filter((p) => Math.abs(p[2]) < 1.0 && p[0] < 1.5);
    const c = middle(low);
    expect(Math.abs(c[0])).toBeLessThan(1.2);
    expect(c[1]).toBeLessThan(2.1);
    expect(c[1]).toBeGreaterThan(0);
  });

  test('the finished tooth stands where the jaw block’s middle tooth comes up', () => {
    const tooth = toothModel({ ...TP0, thick: 1, lam: 1, cap: 1, pap: 1, bell: 1, free: 1, cells: 1, dep: 1, vess: 1, root: 1, cem: 1, lig: 1, alv: 1, rise: 1 }) as unknown as Model;
    const crown = middle(points(tooth, (it) => it.key === 'enamel' || it.key === 'enamel-s'));
    const jaw = jawModel({ ...JP0, milk: 1 }) as unknown as Model;
    const milk = middle(points(jaw, (it) => (it.key ?? '').startsWith('milk1-enam')));
    const inJaw = carry(SITE18C.tooth, SITE18C.jaw, crown);
    expect(Math.abs(inJaw[0] - milk[0])).toBeLessThan(0.3);
    expect(Math.abs(inJaw[1] - milk[1])).toBeLessThan(0.6);
  });

  test('every site is a similarity (a flight never shears or mirrors the model left)', () => {
    for (const s of Object.values(SITE18C)) {
      const m = s.place;
      const sx = Math.hypot(m[0], m[1], m[2]);
      const sy = Math.hypot(m[4], m[5], m[6]);
      const sz = Math.hypot(m[8], m[9], m[10]);
      expect(Math.abs(sx - sy) + Math.abs(sx - sz)).toBeLessThan(1e-5);
      const det = m[0] * (m[5] * m[10] - m[6] * m[9]) - m[4] * (m[1] * m[10] - m[2] * m[9]) + m[8] * (m[1] * m[6] - m[2] * m[5]);
      expect(det).toBeGreaterThan(0);
      void invSim;
    }
  });
});
