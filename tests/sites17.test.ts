import { describe, expect, test } from 'vitest';
import { SKULL0, skullModel } from '@/components/scenes/week17/skull-model';
import { AP0, archModel } from '@/components/scenes/week17/arch-model';
import { BONES0, bonesModel } from '@/components/scenes/week17/bones-model';
import { BA0, OS0, baseModel, ossModel } from '@/components/scenes/week17/base-model';
import { AP0 as VP0, archVModel } from '@/components/scenes/week18/cleft-model';
import { ROOT17, SITE17 } from '@/components/scenes/week17/sites';
import type { M4, V3 } from '@/lib/three-d/math';
import { between, invSim, type Site } from '@/lib/three-d/place';
import type { Item3 } from '@/lib/three-d/scene';

/**
 * Topic 17's models sit in one body, the fetal skull's (components/scenes/week17/sites.ts): a stage change flies
 * the camera from one into the next, and the next appears where it belongs in the one just left. That only reads
 * when the landmark the student is watching is in the same place in both. If a model is redrawn and its landmark
 * moves, these fail: move the site's numbers with it.
 */

type Model = { items: Item3[]; pts: Record<string, V3> };

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
      for (let k = 0; k < 3; k++) {
        lo[k] = Math.min(lo[k], p[i + k]);
        hi[k] = Math.max(hi[k], p[i + k]);
      }
      any = true;
    }
  }
  if (!any) throw new Error('no such item');
  return [(lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, (lo[2] + hi[2]) / 2];
}

/** A model's point carried into the shared body (the skull's space). */
const toRoot = (s: Site, p: V3): V3 => apply(invSim(s.place), p);
const dist = (a: V3, b: V3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

const skull = skullModel({ ...SKULL0, archTint: 1 }) as unknown as Model;
const base = baseModel({ ...BA0, mid: 1, side: 1, oMid: 1, oSide: 1 }) as unknown as Model;
const arch = archModel({ ...AP0 }) as unknown as Model;
const bones = bonesModel({ ...BONES0, adult: 1, bone: 1, deg: 1, maxBones: 1, rdeg: 1, h2: 1, h3: 1 }) as unknown as Model;
const oss = ossModel(OS0) as unknown as Model;

const has = (it: Item3, id: string) => it.id === id || (it.groups ?? []).includes(id);

describe('topic 17: the models in one body (the fetal skull)', () => {
  test('the base from above is the skull’s base: the hypophysis on the sella, the left petrous on the left petrous', () => {
    const sellaSkull = middle(skull, (it) => it.key === 'b-hyp');
    const sellaBase = toRoot(SITE17.base, middle(base, (it) => it.key === 'hypL' || it.key === 'hypR'));
    // The base is drawn flat: its floor lies at the sella's level, so the heights differ by the fossa's depth.
    expect(Math.hypot(sellaBase[0] - sellaSkull[0], sellaBase[2] - sellaSkull[2])).toBeLessThan(0.3);
    const petSkull = middle(skull, (it) => it.key === 'b-petL');
    // The base model's left half (the embryo's left, its −x) shows the bones.
    const petBase = toRoot(SITE17.base, middle(base, (it) => it.key === 'periL'));
    expect(Math.hypot(petBase[0] - petSkull[0], petBase[2] - petSkull[2])).toBeLessThan(0.35);
  });

  test('the ossification blocks lie on the left side of the head: the flat bone up in the vault, the endochondral one down in the base', () => {
    const flat = toRoot(SITE17.oss, middle(oss, (it) => it.key === 'trayL'));
    const endo = toRoot(SITE17.oss, middle(oss, (it) => it.key === 'trayR'));
    expect(flat[1]).toBeGreaterThan(endo[1] + 1.5);
    expect(Math.min(flat[0], endo[0])).toBeGreaterThan(1.8);
    // The table's up points out of the head's left side.
    const up = toRoot(SITE17.oss, [0, 0, 1]);
    const o = toRoot(SITE17.oss, [0, 0, 0]);
    expect(up[0] - o[0]).toBeGreaterThan(0.2);
  });

  test('the embryo’s head has its stomodeum on the fetal mouth and fits the skull', () => {
    const stomo = toRoot(SITE17.arch, middle(arch, (it) => it.id === 'estomodeoa'));
    expect(dist(stomo, ROOT17.mouth)).toBeLessThan(0.3);
    const top = toRoot(SITE17.arch, [0, 3.86, 0]);
    expect(top[1]).toBeLessThan(2.6);
    expect(top[1]).toBeGreaterThan(1.0);
  });

  test('the arches’ cartilages: the ossicles at the skull’s ear and the hyoid on its hyoid (seen from the left)', () => {
    const ossicles = toRoot(SITE17.bones, middle(bones, (it) => has(it, 'mailua') || has(it, 'ingudea')));
    const ear = middle(skull, (it) => it.key === 'tyrL');
    // The model is a sagittal half: its parts lie near the midline, so compare as the student sees it, from the left.
    expect(Math.hypot(ossicles[1] - ear[1], ossicles[2] - ear[2])).toBeLessThan(0.3);
    const hyoid = toRoot(SITE17.bones, middle(bones, (it) => it.id === 'hioide-gorputz-goia' || it.id === 'hioide-gorputz-behea'));
    const hyoidSkull = middle(skull, (it) => it.id === 'hioide-gorputza');
    expect(Math.hypot(hyoid[1] - hyoidSkull[1], hyoid[2] - hyoidSkull[2])).toBeLessThan(0.3);
    expect(Math.abs(ossicles[0] - ear[0])).toBeLessThan(1.2);
  });

  test('the pharynx from behind lies on the embryo’s arches: each pair at its own level of the flexed neck', () => {
    const v = archVModel({ ...VP0, v: 1 }) as unknown as Model;
    for (const id of ['lehen-arkua', 'hirugarren-arkua', 'seigarren-arkua']) {
      const inV = toRoot(SITE17.archV, [0, v.pts[id][1], v.pts[id][2]]);
      const inHead = toRoot(SITE17.arch, [0, arch.pts[id][1], arch.pts[id][2]]);
      expect(dist(inV, inHead)).toBeLessThan(0.45);
    }
    // Seen from behind: the pharynx's floor (the laryngeal opening) is ventral to its arches.
    const floor = toRoot(SITE17.archV, v.pts['laringe-zuloa']);
    const iv = toRoot(SITE17.archV, [0, v.pts['laugarren-arkua'][1], v.pts['laugarren-arkua'][2]]);
    expect(floor[2]).toBeGreaterThan(iv[2] + 0.3);
  });

  test('every site is a similarity (a flight never shears or mirrors the model left)', () => {
    for (const s of Object.values(SITE17)) {
      const m = s.place;
      const sx = Math.hypot(m[0], m[1], m[2]);
      const sy = Math.hypot(m[4], m[5], m[6]);
      const sz = Math.hypot(m[8], m[9], m[10]);
      expect(Math.abs(sx - sy) + Math.abs(sx - sz)).toBeLessThan(1e-6);
      const det = m[0] * (m[5] * m[10] - m[6] * m[9]) - m[4] * (m[1] * m[10] - m[2] * m[9]) + m[8] * (m[1] * m[6] - m[2] * m[5]);
      expect(det).toBeGreaterThan(0);
    }
    void between;
  });
});
