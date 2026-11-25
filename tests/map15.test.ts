import { describe, expect, it } from 'vitest';
import { MAP15_LINKS, MAP15_NODES, MAP15_TRAILS } from '@/content/eratorriak/map15';
import { MAP_MOMENTS, mapModel, poseAt } from '@/components/scenes/week15/map-model';
import { getWeek, structures } from '@/content/registry';

/** Topic 15's whole-topic map (Ikasgela 15): the relations web and the one 3D model it lights. */

const NODE = new Map(MAP15_NODES.map((n) => [n.id, n]));
const LAST = MAP_MOMENTS.length - 1;
const FEMALE = new Set(['baginaren-bestibulua', 'uretra-guruinak']);

/** Is `id` drawn (as an item, a group of items, or a named point) in the map at moment m? */
function drawn(id: string, m: number, sex: number) {
  const model = mapModel(poseAt(m, sex));
  return model.items.some((it) => (it.opacity ?? 1) > 0.05 && (it.id === id || it.groups?.includes(id)));
}

describe('Ikasgela 15 · Mapa osoa', () => {
  it('has unique nodes that are real structures', () => {
    expect(new Set(MAP15_NODES.map((n) => n.id)).size).toBe(MAP15_NODES.length);
    for (const n of MAP15_NODES) expect(structures.has(n.id), n.id).toBe(true);
  });

  it('links only nodes, never a node to itself, never twice', () => {
    const seen = new Set<string>();
    for (const l of MAP15_LINKS) {
      expect(NODE.has(l.a), `${l.a} (${l.kind} ${l.b})`).toBe(true);
      expect(NODE.has(l.b), `${l.b} (${l.a} ${l.kind})`).toBe(true);
      expect(l.a).not.toBe(l.b);
      const k = `${l.a}|${l.kind}|${l.b}`;
      expect(seen.has(k), k).toBe(false);
      seen.add(k);
    }
  });

  it('leaves no node without a link', () => {
    const linked = new Set(MAP15_LINKS.flatMap((l) => [l.a, l.b]));
    for (const n of MAP15_NODES) expect(linked.has(n.id), n.id).toBe(true);
  });

  it('draws every node (or its container) at the moments it says', () => {
    for (const n of MAP15_NODES) {
      expect(n.at, n.id).toBeGreaterThanOrEqual(0);
      expect(n.until ?? LAST, n.id).toBeLessThanOrEqual(LAST);
      expect(n.until ?? LAST, n.id).toBeGreaterThanOrEqual(n.at);
      const sex = FEMALE.has(n.id) ? 1 : 0;
      const id = n.in3d ?? n.id;
      expect(drawn(id, n.at, sex), `${n.id} as ${id} at ${n.at}`).toBe(true);
      expect(drawn(id, n.until ?? LAST, sex), `${n.id} as ${id} at ${n.until ?? LAST}`).toBe(true);
    }
  });

  it('points to simulator stages that exist', () => {
    const ids = new Set(getWeek(15)!.stages.map((s) => s.id));
    for (const n of MAP15_NODES) if (n.stage) expect(ids.has(n.stage), `${n.id} → ${n.stage}`).toBe(true);
  });

  it('walks trails through nodes shown at the step moment', () => {
    for (const t of MAP15_TRAILS)
      for (const s of t.steps) {
        const n = NODE.get(s.id);
        expect(n, `${t.id}: ${s.id}`).toBeTruthy();
        if (n && s.moment !== undefined) {
          expect(s.moment, `${t.id}: ${s.id}`).toBeGreaterThanOrEqual(n.at);
          expect(s.moment, `${t.id}: ${s.id}`).toBeLessThanOrEqual(n.until ?? LAST);
        }
      }
  });

  it('keeps the ducts ending where the pelvis model draws the cloaca and bladder (no NaN anywhere)', () => {
    for (let u = 0; u <= LAST; u += 0.5)
      for (const sex of [0, 1]) {
        const m = mapModel(poseAt(u, sex));
        for (const p of Object.values(m.pts)) expect(p.every(Number.isFinite)).toBe(true);
        for (const it of m.items) expect(Number.isFinite(it.opacity ?? 1), it.key).toBe(true);
      }
  });
});
