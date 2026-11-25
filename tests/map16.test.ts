import { describe, expect, it } from 'vitest';
import { MAP16_LINKS, MAP16_NODES, MAP16_TRAILS } from '@/content/eratorriak/map16';
import { MAP16_MOMENTS, mapModel16, poseAt16 } from '@/components/scenes/week16/map-model';
import { getWeek, structures } from '@/content/registry';

/** Topic 16's whole-topic map (Ikasgela 16): the relations web and the one 3D model it lights. */

const NODE = new Map(MAP16_NODES.map((n) => [n.id, n]));
const LAST = MAP16_MOMENTS.length - 1;

/** Is `id` drawn (as an item, a group of items, or a named point) in the map at moment m? */
function drawn(id: string, m: number, sex: number) {
  const model = mapModel16(poseAt16(m, sex));
  return model.items.some((it) => (it.opacity ?? 1) > 0.05 && (it.id === id || it.groups?.includes(id)));
}

describe('Ikasgela 16 · Mapa osoa', () => {
  it('has unique nodes that are real structures', () => {
    expect(new Set(MAP16_NODES.map((n) => n.id)).size).toBe(MAP16_NODES.length);
    for (const n of MAP16_NODES) expect(structures.has(n.id), n.id).toBe(true);
  });

  it('pairs homologues male → female', () => {
    for (const l of MAP16_LINKS.filter((x) => x.kind === 'homologoa')) {
      expect(NODE.get(l.a)?.sex, l.a).toBe('m');
      expect(NODE.get(l.b)?.sex, l.b).toBe('f');
    }
  });

  it('links only nodes, never a node to itself, never twice', () => {
    const seen = new Set<string>();
    for (const l of MAP16_LINKS) {
      expect(NODE.has(l.a), `${l.a} (${l.kind} ${l.b})`).toBe(true);
      expect(NODE.has(l.b), `${l.b} (${l.a} ${l.kind})`).toBe(true);
      expect(l.a).not.toBe(l.b);
      const k = `${l.a}|${l.kind}|${l.b}`;
      expect(seen.has(k), k).toBe(false);
      seen.add(k);
    }
  });

  it('leaves no node without a link', () => {
    const linked = new Set(MAP16_LINKS.flatMap((l) => [l.a, l.b]));
    for (const n of MAP16_NODES) expect(linked.has(n.id), n.id).toBe(true);
  });

  it('draws every node (or its container) at the moments it says', () => {
    for (const n of MAP16_NODES) {
      expect(n.at, n.id).toBeGreaterThanOrEqual(0);
      expect(n.until ?? LAST, n.id).toBeLessThanOrEqual(LAST);
      expect(n.until ?? LAST, n.id).toBeGreaterThanOrEqual(n.at);
      const sex = n.sex === 'f' ? 1 : 0;
      const id = n.in3d ?? n.id;
      expect(drawn(id, n.at, sex), `${n.id} as ${id} at ${n.at}`).toBe(true);
      expect(drawn(id, n.until ?? LAST, sex), `${n.id} as ${id} at ${n.until ?? LAST}`).toBe(true);
    }
  });

  it('points to simulator stages that exist', () => {
    const ids = new Set(getWeek(16)!.stages.map((s) => s.id));
    for (const n of MAP16_NODES) if (n.stage) expect(ids.has(n.stage), `${n.id} → ${n.stage}`).toBe(true);
  });

  it('walks trails through nodes shown at the step moment', () => {
    for (const t of MAP16_TRAILS)
      for (const s of t.steps) {
        const n = NODE.get(s.id);
        expect(n, `${t.id}: ${s.id}`).toBeTruthy();
        if (n?.sex && s.sex) expect(s.sex, `${t.id}: ${s.id}`).toBe(n.sex);
        if (n && s.moment !== undefined) {
          expect(s.moment, `${t.id}: ${s.id}`).toBeGreaterThanOrEqual(n.at);
          expect(s.moment, `${t.id}: ${s.id}`).toBeLessThanOrEqual(n.until ?? LAST);
        }
      }
  });

  it('never draws a NaN between moments, either sex', () => {
    for (let u = 0; u <= LAST; u += 0.5)
      for (const sex of [0, 1]) {
        const m = mapModel16(poseAt16(u, sex));
        for (const p of Object.values(m.pts)) expect(p.every(Number.isFinite)).toBe(true);
        for (const it of m.items) expect(Number.isFinite(it.opacity ?? 1), it.key).toBe(true);
      }
  });
});
