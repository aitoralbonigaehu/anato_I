import { describe, expect, test } from 'vitest';
import { PH0, pharynxModel } from '@/components/scenes/week18/pharynx-model';
import { pharynxB } from '@/components/scenes/week18/pharynx-b';
import { TP0, tongueModel } from '@/components/scenes/week18/tongue-model';
import { ROOT18, SITE18 } from '@/components/scenes/week18/sites';
import { NECK_LOBES, ROOT_LOBES, SITE18B, TONGUE_CAECUM, TONGUE_LARYNX } from '@/components/scenes/week18/sites-b';
import { NP0, neckModel } from '@/components/scenes/week18/neck-model';
import type { M4, V3 } from '@/lib/three-d/math';
import { invSim } from '@/lib/three-d/place';
import type { Item3 } from '@/lib/three-d/scene';

/**
 * Agent 18-B's models in topic 18's one body (components/scenes/week18/sites-b.ts). The tongue's floor is the root
 * pharynx's floor drawn larger: the flight from the glands' descent lands on it only if its landmarks sit on the
 * root's. If the tongue model is redrawn and its foramen caecum or laryngeal orifice moves, these fail: move the
 * numbers in sites-b.ts with it.
 */

const apply = (m: M4, p: readonly number[]): V3 => [m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12], m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13], m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14]];
const dist = (a: V3, b: V3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const toRoot = (place: M4, p: V3) => apply(invSim(place), p);

const tongue = tongueModel(TP0);
const P = tongue.pts as Record<string, V3>;

describe('topic 18 (18-B): the tongue in the one body', () => {
  test('the site’s numbers are the tongue model’s own landmarks', () => {
    expect(dist(P['zulo-itsua'], TONGUE_CAECUM)).toBeLessThan(0.05);
    expect(dist(P['laringe-zuloa'], TONGUE_LARYNX)).toBeLessThan(0.05);
  });

  test('the tongue’s foramen caecum is the root’s', () => {
    expect(dist(toRoot(SITE18B.tongue.place, P['zulo-itsua']), ROOT18.caecum)).toBeLessThan(0.1);
  });

  test('the tongue’s laryngeal orifice falls on the root’s', () => {
    expect(dist(toRoot(SITE18B.tongue.place, P['laringe-zuloa']), ROOT18.larynx)).toBeLessThan(0.35);
  });

  test('the tongue lies on the root’s floor, in the midline, between its side walls', () => {
    const body = toRoot(SITE18B.tongue.place, P['mihiaren-gorputza'] ?? P['alboko-goraguneak']);
    expect(Math.abs(body[0])).toBeLessThan(1.6);
    expect(body[2]).toBeGreaterThan(0.6);
  });

  test('every site is a similarity (a flight never shears or mirrors the model left)', () => {
    for (const s of [SITE18B.tongue, SITE18B.neck]) {
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

describe('topic 18 (18-B): the pouches on the root model', () => {
  const ids = (items: Item3[]) => new Set(items.flatMap((it) => [it.id ?? '', ...(it.groups ?? [])]));

  test('pharynx-b only adds to the root model: same parts, same places', () => {
    const pose = { ...PH0, tissue: 1, p1: 1, cav: 1, ossicles: 1 };
    const a = pharynxModel(pose);
    const b = pharynxB(pose);
    expect(b.items.length).toBe(a.items.length);
    a.items.forEach((it, i) => expect(b.items[i].mesh).toBe(it.mesh));
    expect(SITE18.pharynx.place.every((v, i) => v === (i % 5 === 0 ? 1 : 0))).toBe(true);
  });

  test('the first pouch’s stage names what it draws', () => {
    const m = pharynxB({ ...PH0, tissue: 1, p1: 1, cav: 1, ossicles: 1 });
    const have = ids(m.items);
    for (const id of ['sakonune-tubotinpanikoa', 'eustakioren-tronpa', 'tinpano-kutxa', 'mailua', 'ingudea', 'ointokia']) expect(have.has(id), id).toBe(true);
    // The pouch is on the embryo's left (+x), where the stage's camera looks.
    expect(m.pts['tinpano-kutxa'][0]).toBeGreaterThan(1);
  });

  test('the tympanic membrane’s three layers sit on the drum, outside to inside', () => {
    const m = pharynxB({ ...PH0, tissue: 1, p1: 1, cav: 1, c1: 1 }, { layers: 1 });
    const pts = m.pts as Record<string, V3>;
    const drum = pts['tinpano-mintza'];
    for (const id of ['tinpano-kanpoko-epitelioa', 'tinpano-tarteko-geruza', 'tinpano-barneko-epitelioa']) expect(dist(pts[id], drum)).toBeLessThan(0.3);
    expect(pts['tinpano-kanpoko-epitelioa'][0]).toBeGreaterThan(pts['tinpano-barneko-epitelioa'][0]);
  });
});

describe('topic 18 (18-B): the grown neck in the one body', () => {
  const neck = neckModel({ ...NP0, down: 1, sup: 1, adult: 1 }, {});
  const N = neck.pts as Record<string, V3>;
  const root = pharynxModel({ ...PH0, neck: 1, descend: 1, meet: 1, thyroid: 1 });
  const R = root.pts as Record<string, V3>;

  test('the neck model lobes fall on the lobes the descent left on the root', () => {
    const lobe = N['tiroide-lobuluak'];
    const onRoot = toRoot(SITE18B.neck.place, [Math.abs(lobe[0]), lobe[1], lobe[2]]);
    const there = R['tiroide-guruina'];
    expect(dist(onRoot, [Math.abs(there[0]), there[1], there[2]])).toBeLessThan(0.45);
    expect(dist(toRoot(SITE18B.neck.place, NECK_LOBES), ROOT_LOBES)).toBeLessThan(1e-6);
  });

  test('the neck keeps the root sides and its front faces the root front', () => {
    const left = toRoot(SITE18B.neck.place, [1, 0, 0]);
    const mid = toRoot(SITE18B.neck.place, [0, 0, 0]);
    const front = toRoot(SITE18B.neck.place, [0, 0, 1]);
    expect(left[0]).toBeGreaterThan(mid[0]);
    expect(front[2]).toBeGreaterThan(mid[2]);
  });
});
