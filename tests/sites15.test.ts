import { describe, expect, test } from 'vitest';
import { UP0, uroModel } from '@/components/scenes/week15/uro-model';
import { UNIT0, unitModel } from '@/components/scenes/week15/unit-model';
import { KP0, kidneyModel } from '@/components/scenes/week15/kidney-model';
import { NP0, nephronModel } from '@/components/scenes/week15/nephron-model';
import { AP0, adrenalModel } from '@/components/scenes/week15/adrenal-model';
import { PP0, pelvisModel } from '@/components/scenes/week15/pelvis-model';
import { TP0, trigoneModel } from '@/components/scenes/week15/trigone-model';
import { GP0, glansModel } from '@/components/scenes/week15/glans-model';
import { SITE15 } from '@/components/scenes/week15/sites';
import type { M4, V3 } from '@/lib/three-d/math';
import { between, invSim, type Site } from '@/lib/three-d/place';
import type { Item3 } from '@/lib/three-d/scene';

/**
 * Topic 15's nine models sit in one body (components/scenes/week15/sites.ts): a stage change flies the camera from
 * one into the next, and the next appears where it belongs in the one just left. That only reads when the
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

/** How far apart two landmarks are once `a`'s is carried into `b`'s space, in the shared body's (wall's) units. */
function apart(a: Site, pa: V3, b: Site, pb: V3): number {
  const carried = apply(between(a.place, b.place), pa);
  const back = invSim(b.place);
  const u = apply(back, carried);
  const v = apply(back, pb);
  return Math.hypot(u[0] - v[0], u[1] - v[1], u[2] - v[2]);
}

/** A model direction in the shared body. */
const dirIn = (s: Site, d: V3): V3 => {
  const back = invSim(s.place);
  const o = apply(back, [0, 0, 0]);
  const p = apply(back, d);
  const v: V3 = [p[0] - o[0], p[1] - o[1], p[2] - o[2]];
  const n = Math.hypot(...v);
  return [v[0] / n, v[1] / n, v[2] / n];
};

const wall = uroModel({ ...UP0, pro: 1, proDuct: 1, meso: 1, wolff: 1, gonadal: 1, bud: 1, blast: 1, kidney: 1, bladder: 1, adrenal: 1 }, { glom: 0, gut: 1 }) as unknown as Model;
const unitPro = unitModel({ ...UNIT0, cluster: 1, vesicle: 1, tubule: 1, duct: 1 }, {}) as unknown as Model;
const unitMeso = unitModel({ ...UNIT0, mode: 1, ridge: 1, gonadal: 1, cluster: 1, vesicle: 1, tubule: 1, duct: 1 }, {}) as unknown as Model;
const kidney = kidneyModel(KP0, {}) as unknown as Model;
const kidneyGrown = kidneyModel({ ...KP0, enter: 1, wrap: 1, amp: 1, pelvis: 1, major: 1, minor: 1, coll: 1, bean: 1 }, {}) as unknown as Model;
const nephron = nephronModel({ ...NP0, cap: 1 }, {}) as unknown as Model;
const adrenal = adrenalModel({ ...AP0, fetal: 1 }, {}) as unknown as Model;
const pelvis0 = pelvisModel(PP0, {}) as unknown as Model;
const pelvisMale = pelvisModel({ ...PP0, sept: 1, split: 1, parts: 1, male: 1 }, {}) as unknown as Model;
const trigone = trigoneModel(TP0, {}) as unknown as Model;
const glans = glansModel(GP0, {}) as unknown as Model;

const has = (it: Item3, id: string) => it.id === id || (it.groups ?? []).includes(id);
const key = (k: string) => (it: Item3) => it.key === k;

describe('topic 15: the nine models in one body', () => {
  test('the neck block is cut at the wall’s left nephrotomes', () => {
    const nephro = middle(wall, (it) => has(it, 'nefrotomak') && middle(wall, (x) => x === it)[0] > 0 && Math.abs(middle(wall, (x) => x === it)[1] - 3.0) < 0.25);
    const im = middle(unitPro, key('im1'));
    expect(apart(SITE15.wall, nephro, SITE15.neck, im)).toBeLessThan(0.3);
  });

  test('the thorax block is cut through the wall’s left mesonephric ridge', () => {
    const ridge = middle(unitMeso, key('ridge1'));
    expect(apart(SITE15.wall, [1.33, 1.0, -0.3], SITE15.thorax, ridge)).toBeLessThan(0.3);
    // The block's neural tube lies on the wall's midline, dorsal to the aorta.
    const neural = apply(invSim(SITE15.thorax.place), middle(unitMeso, key('neural')));
    expect(Math.abs(neural[0])).toBeLessThan(0.15);
    expect(neural[2]).toBeLessThan(-1);
  });

  test('the kidney close-up is the wall’s left metanephros', () => {
    const blastema = middle(wall, key('kid1'));
    const close = middle(kidney, key('blastema'));
    expect(apart(SITE15.wall, blastema, SITE15.kidney, close)).toBeLessThan(0.3);
    // The ureter leaves it caudally and medially, as on the wall.
    const ureter = apply(invSim(SITE15.kidney.place), middle(kidney, key('ureter')));
    const kid = apply(invSim(SITE15.kidney.place), close);
    expect(ureter[1]).toBeLessThan(kid[1]);
    expect(ureter[0]).toBeLessThan(kid[0]);
  });

  test('the nephron forms in a cap at a collecting tubule’s tip, inside the kidney', () => {
    const cap = apply(invSim(SITE15.nephron.place), middle(nephron, key('cap0')));
    const k = middle(kidneyGrown, key('blastema'));
    const kWall = apply(invSim(SITE15.kidney.place), k);
    // Within the kidney's bean (its half-height is 1.85 kidney units = 0.56 wall units).
    expect(Math.hypot(cap[0] - kWall[0], cap[1] - kWall[1], cap[2] - kWall[2])).toBeLessThan(0.6);
  });

  test('the suprarenal close-up is the wall’s left gland, its medial side towards the aorta', () => {
    const gland = middle(wall, key('adr1'));
    const close = middle(adrenal, key('dome'));
    expect(apart(SITE15.wall, gland, SITE15.adrenal, close)).toBeLessThan(0.3);
    const aorta = apply(invSim(SITE15.adrenal.place), middle(adrenal, key('aorta')));
    expect(aorta[0]).toBeLessThan(gland[0]);
  });

  test('the pelvis section is cut through the wall’s cloaca, in the midline', () => {
    const cloaca = middle(wall, key('cloaca'));
    const cut = middle(pelvis0, key('cloaca'));
    expect(apart(SITE15.wall, cloaca, SITE15.pelvis, cut)).toBeLessThan(0.35);
  });

  test('the bladder from behind is the pelvis model’s bladder', () => {
    const p = middle(pelvisMale, key('sinus'));
    const b = middle(trigone, key('bladder'));
    expect(apart(SITE15.pelvis, p, SITE15.trigone, b)).toBeLessThan(0.15);
  });

  test('the glans close-up is the end of the pelvis model’s phallus, pointing the same way', () => {
    const p = middle(pelvisMale, key('glans'));
    const g = middle(glans, key('glans'));
    // The model's glans is its near half (cut down the middle): compare at its axis.
    expect(apart(SITE15.pelvis, p, SITE15.glans, [g[0], g[1], 0])).toBeLessThan(0.2);
    const tip = dirIn(SITE15.glans, [1, 0, 0]);
    expect(tip[2]).toBeGreaterThan(0.7);
    expect(tip[1]).toBeLessThan(-0.3);
  });

  test('every site is a similarity (a flight never shears or mirrors the model left)', () => {
    for (const s of Object.values(SITE15)) {
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
