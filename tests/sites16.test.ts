import { describe, expect, test } from 'vitest';
import { UP0, uroModel } from '@/components/scenes/week15/uro-model';
import { GN0, gonadModel } from '@/components/scenes/week16/gonad-model';
import { DP0, ductModel } from '@/components/scenes/week16/duct-model';
import { BR0, broadModel } from '@/components/scenes/week16/broad-model';
import { DS0, descentModel } from '@/components/scenes/week16/descent-model';
import { EX0, externalModel } from '@/components/scenes/week16/external-model';
import { SITE16 } from '@/components/scenes/week16/sites';
import type { M4, V3 } from '@/lib/three-d/math';
import { between, invSim, type Site } from '@/lib/three-d/place';
import type { Item3 } from '@/lib/three-d/scene';

/**
 * Topic 16's six models sit in one body (components/scenes/week16/sites.ts): a stage change flies the camera
 * from one into the next, and the next appears where it belongs in the one just left. That only reads when the
 * landmark the student is watching is in the same place in both. If a model is redrawn and its landmark moves,
 * these fail: move the site's numbers with it.
 */

type Model = { items: Item3[] };

const apply = (m: M4, p: readonly number[]): V3 => [m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12], m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13], m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14]];

/** The middle of the box of the picked items, in the model's own space. */
function middle(m: Model, pick: (it: Item3) => boolean): V3 {
  const lo = [Infinity, Infinity, Infinity];
  const hi = [-Infinity, -Infinity, -Infinity];
  let any = false;
  for (const it of m.items) {
    if (!pick(it)) continue;
    const p = it.mesh.pos;
    for (let i = 0; i < p.length; i += 3) {
      const q = it.matrix ? apply(it.matrix as M4, [p[i], p[i + 1], p[i + 2]]) : [p[i], p[i + 1], p[i + 2]];
      for (let k = 0; k < 3; k++) {
        lo[k] = Math.min(lo[k], q[k]);
        hi[k] = Math.max(hi[k], q[k]);
      }
      any = true;
    }
  }
  if (!any) throw new Error('no such item');
  return [(lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, (lo[2] + hi[2]) / 2];
}

/** How far apart two landmarks are once `a`'s is carried into `b`'s space, in the shared body's (duct model's) units. */
function apart(a: Site, pa: V3, b: Site, pb: V3): number {
  const carried = apply(between(a.place, b.place), pa);
  const back = invSim(b.place);
  const u = apply(back, carried);
  const v = apply(back, pb);
  return Math.hypot(u[0] - v[0], u[1] - v[1], u[2] - v[2]);
}

const wall = uroModel({ ...UP0, meso: 1, wolff: 1, mesoGone: 0.35, gonadal: 1, bud: 1, blast: 1, muller: 1, mullerJoin: 1 } as never, { glom: 0, gut: 1 } as never) as unknown as Model;
const gonad = gonadModel({ ...GN0, germ: 1, cords: 1 }, {}) as unknown as Model;
const ducts = ductModel(DP0, {}) as unknown as Model;
const ductsF = ductModel({ ...DP0, female: 1 } as never, {}) as unknown as Model;
const broad = broadModel({ ...BR0, merge: 1, bladder: 1, pouches: 1 }, {}) as unknown as Model;
const descent = descentModel(DS0, {}) as unknown as Model;
const external = externalModel({ ...EX0, tubercle: 1, folds: 1, swellings: 1 }, {}) as unknown as Model;

const left = (m: Model, it: Item3) => middle(m, (x) => x === it)[0] > 0;
const has = (it: Item3, id: string) => it.id === id || (it.groups ?? []).includes(id);

describe('topic 16: the six models in one body', () => {
  test('the gonad block is cut at the wall’s left gonadal ridge', () => {
    const ridge = middle(wall, (it) => has(it, 'gonada-gandorra') && left(wall, it));
    const cut = middle(gonad, (it) => it.key === 'gonad');
    expect(apart(SITE16.wall, ridge, SITE16.gonad, cut)).toBeLessThan(0.45);
  });

  test('the gonad block is the duct model’s left gonad', () => {
    const whole = middle(ducts, (it) => has(it, 'gonadak') && left(ducts, it));
    const cut = middle(gonad, (it) => it.key === 'gonad');
    expect(apart(SITE16.ducts, whole, SITE16.gonad, cut)).toBeLessThan(0.35);
  });

  test('the descent starts at the duct model’s left gonad', () => {
    const whole = middle(ducts, (it) => has(it, 'gonadak') && left(ducts, it));
    const testis = middle(descent, (it) => it.key === 'testis');
    expect(apart(SITE16.ducts, whole, SITE16.descent, testis)).toBeLessThan(0.45);
  });

  test('the pelvis block is cut at the duct model’s uterus', () => {
    const uterus = middle(ductsF, (it) => has(it, 'uteroa'));
    const cut = middle(broad, (it) => has(it, 'uteroa'));
    const d = apart(SITE16.ducts, uterus, SITE16.broad, cut);
    expect(d).toBeLessThan(0.9);
  });

  test('the perineum lies below the trunk, in the midline', () => {
    const skin = middle(external, (it) => it.key === 'skin');
    const inDucts = apply(between(SITE16.external.place, SITE16.ducts.place), skin);
    const wallBox = middle(ducts, (it) => it.key === 'wall');
    expect(Math.abs(inDucts[0])).toBeLessThan(0.2);
    expect(inDucts[1]).toBeLessThan(wallBox[1] - 2);
  });

  test('every site is a similarity (a flight never shears or mirrors the model left)', () => {
    for (const s of Object.values(SITE16)) {
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
