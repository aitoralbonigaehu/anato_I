import { describe, expect, test } from 'vitest';
import { BP0, bodyModel } from '@/components/scenes/week19/body-model';
import { CP0, cordModel } from '@/components/scenes/week19/cord-model';
import { NP0, neuralModel } from '@/components/scenes/week19/neural-model';
import { SP0, sectionModel } from '@/components/scenes/week19/section-model';
import { SPP0, spineModel } from '@/components/scenes/week19/spine-model';
import { CORD_CANAL, HEAD_THALAMUS, ROOT19, SITE19 } from '@/components/scenes/week19/sites';
import { NEURAL_DIEN, SITE19B, SPINE_CONUS } from '@/components/scenes/week19/sites-b';
import type { M4, V3 } from '@/lib/three-d/math';
import { invSim } from '@/lib/three-d/place';

/**
 * Topic 19's models in the one body (components/scenes/week19/sites.ts, sites-b.ts). A flight lands where the story
 * says only if each model's landmark sits on its parent's: the cord block's canal on the body's cord at T6, the head
 * block's thalamus on the body's thalamus, the embryo's section on the cord block's canal, the spine's conus on the
 * body's conus, the neural tube's diencephalon on the thalamus. Every place is a similarity that keeps the sides.
 */

const apply = (m: M4, p: readonly number[]): V3 => [m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12], m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13], m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14]];
const dist = (a: V3, b: V3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const toRoot = (place: M4, p: V3) => apply(invSim(place), p);
const SITES = { ...SITE19, ...SITE19B };

describe('topic 19: the models in the one body', () => {
  test('the root body has its landmarks where sites.ts says (cord, brain)', () => {
    const P = bodyModel({ ...BP0, sens: 1, motor: 1 }).pts as Record<string, V3>;
    expect(dist(P['talamoa'], ROOT19.thalamus)).toBeLessThan(0.12);
    expect(Math.abs(P['ornomuina'][0])).toBeLessThan(0.1);
    expect(Math.abs(P['ornomuina'][2] - ROOT19.cordT6[2])).toBeLessThan(0.1);
  });

  test('the cord block’s canal is the body’s cord at T6; the head’s thalamus the body’s thalamus', () => {
    expect(dist(toRoot(SITE19.cord.place, CORD_CANAL), ROOT19.cordT6)).toBeLessThan(1e-6);
    expect(dist(toRoot(SITE19.head.place, HEAD_THALAMUS), ROOT19.thalamus)).toBeLessThan(1e-6);
  });

  test('the embryo’s section sits on the cord block, at the same size', () => {
    expect(dist(toRoot(SITE19B.section.place, [0, 0, 0]), ROOT19.cordT6)).toBeLessThan(1e-6);
    const a = toRoot(SITE19B.section.place, [1, 0, 0]);
    const b = toRoot(SITE19.cord.place, [1, 0, 0]);
    expect(dist(a, b)).toBeLessThan(1e-6);
  });

  test('the spine’s conus is the body’s; the neural tube’s diencephalon is on the thalamus', () => {
    expect(dist(toRoot(SITE19B.spine.place, SPINE_CONUS), ROOT19.conus)).toBeLessThan(1e-6);
    expect(dist(toRoot(SITE19B.neural.place, NEURAL_DIEN), ROOT19.thalamus)).toBeLessThan(1e-6);
    const P = neuralModel({ ...NP0, fold: 1, zip: 1, three: 1, five: 1, flex: 1 }).pts as Record<string, V3>;
    // The name point of the diencephalon lies on the tube there (its surface, a radius off the centreline).
    expect(dist(P['dientzefaloa'], NEURAL_DIEN)).toBeLessThan(0.6);
  });

  test('every place is a similarity that keeps the sides (left stays left, cranial stays cranial)', () => {
    for (const [key, s] of Object.entries(SITES)) {
      const m = s.place;
      const sx = Math.hypot(m[0], m[1], m[2]);
      const sy = Math.hypot(m[4], m[5], m[6]);
      const sz = Math.hypot(m[8], m[9], m[10]);
      expect(Math.abs(sx - sy) + Math.abs(sx - sz), key).toBeLessThan(1e-6);
      const det = m[0] * (m[5] * m[10] - m[6] * m[9]) - m[4] * (m[1] * m[10] - m[2] * m[9]) + m[8] * (m[1] * m[6] - m[2] * m[5]);
      expect(det, key).toBeGreaterThan(0);
      const o = toRoot(m, [0, 0, 0]);
      const left = toRoot(m, [1, 0, 0]);
      expect(left[0], key).toBeGreaterThan(o[0]);
    }
  });

  test('the models build and name what their stages light', () => {
    const cord = cordModel({ ...CP0, dura: 1, arach: 1, pia: 1, csf: 1, bone: 1, fn: 1, lat: 1, tracts: 1, sens: 1, inter: 1, motor: 1 }).pts as Record<string, V3>;
    for (const id of ['gai-grisa', 'atzeko-sustraia', 'aurreko-sustraia', 'gongoil-errakideoak', 'dura-materra', 'araknoidesa', 'pia-materra', 'interneurona']) expect(cord[id], id).toBeDefined();
    const sec = sectionModel({ ...SP0, fold: 1, mature: 0.2, plates: 1, layers: 1 }).pts as Record<string, V3>;
    for (const id of ['hegal-plaka', 'oinalde-plaka', 'sabai-plaka', 'zoru-plaka', 'ildo-mugatzailea']) expect(sec[id], id).toBeDefined();
    const sp = spineModel({ ...SPP0, grow: 1, sac: 1, epi: 1, needle: 1, epiNeedle: 1 }).pts as Record<string, V3>;
    for (const id of ['ornomuinaren-konoa', 'zaldi-buztana', 'poltsa-durala', 'eremu-epidurala', 'puntzio-orratza']) expect(sp[id], id).toBeDefined();
    // The cord ends at L1–L2 once the column has grown: the conus lies between L1's and L2's middles.
    expect(sp['ornomuinaren-konoa'][1]).toBeLessThan(sp['orno-L1'][1]);
    expect(sp['ornomuinaren-konoa'][1]).toBeGreaterThan(sp['orno-L2'][1]);
  });
});
