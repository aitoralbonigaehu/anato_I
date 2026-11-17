import { describe, expect, test } from 'vitest';
import { SITE17C } from '@/components/scenes/week17/sites-c';
import { ROOT17 } from '@/components/scenes/week17/sites';
import { MP0, muscleModel } from '@/components/scenes/week17/muscle-model';
import { invSim } from '@/lib/three-d/place';

/**
 * Topic 17, agent 17-C's sites (components/scenes/week17/sites-c.ts). Landmark tests (the nerve model's larynx on
 * the larynx model's, the brain in the skull's cavity) are still owed: see the report of 2026-11-16.
 */
describe('topic 17 (17-C): the sites', () => {
  test('the muscle head lies on the skull: its hyoid on the hyoid, its mandible on the mandible', () => {
    const m = invSim(SITE17C.muscle.place);
    const toRoot = (p: readonly number[]) => [0, 1, 2].map((r) => m[r] * p[0] + m[4 + r] * p[1] + m[8 + r] * p[2] + m[12 + r]);
    const pts = (muscleModel(MP0) as unknown as { pts: Record<string, number[]> }).pts;
    const d = (a: readonly number[], b: readonly number[]) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    expect(d(toRoot(pts['hioide-gorputza']), ROOT17.hyoid)).toBeLessThan(0.4);
    expect(d(toRoot(pts['baraila']), ROOT17.mandibleL)).toBeLessThan(0.4);
  });

  test('every site is a similarity (a flight never shears or mirrors the model left)', () => {
    for (const s of Object.values(SITE17C)) {
      const m = s.place;
      const sx = Math.hypot(m[0], m[1], m[2]);
      const sy = Math.hypot(m[4], m[5], m[6]);
      const sz = Math.hypot(m[8], m[9], m[10]);
      expect(Math.abs(sx - sy) + Math.abs(sx - sz)).toBeLessThan(1e-6);
      const det = m[0] * (m[5] * m[10] - m[6] * m[9]) - m[4] * (m[1] * m[10] - m[2] * m[9]) + m[8] * (m[1] * m[6] - m[2] * m[5]);
      expect(det).toBeGreaterThan(0);
    }
  });
});
