import { describe, expect, it } from 'vitest';
import { GRID_SCHEMES, type GridScheme } from '@/content/eratorriak/grid-schemes';
import { LEARNING_MAPS } from '@/content/eratorriak/learning-maps';
import { hasBlueContent, taughtGrid, taughtMap, taughtNodes } from '@/content/eratorriak/taught';
import type { MNode } from '@/content/migrations';

// "Aurten emandakoa" (default in Eratorriak from topic 16): the notes' blue text, not taught this year, is left out.
const slotsFilled = (s: GridScheme) => {
  const covered = s.rows.map(() => s.columns.map(() => 0));
  s.rows.forEach((row, r) =>
    row.cells.forEach((cell, c) => {
      if (!cell) return;
      for (let k = r; k < r + (cell.span ?? 1); k++) for (let j = c; j < c + (cell.cols ?? 1); j++) if (covered[k]) covered[k][j]++;
    }),
  );
  return covered.flat().every((n) => n === 1);
};
const labels = (nodes: MNode[]): string[] => nodes.flatMap((n) => [n.label ?? n.id ?? '', ...labels(n.kids ?? [])]);
const anyBlue = (nodes: MNode[]): boolean => nodes.some((n) => n.blue || anyBlue(n.kids ?? []));

describe('Eratorriak: taught this year', () => {
  it('only topics 16+ have blue content', () => {
    for (let w = 1; w <= 19; w++) expect(hasBlueContent(w), `topic ${w}`).toBe([16, 17, 18].includes(w));
  });

  it('drops blue nodes and lifts their taught children', () => {
    const tree: MNode[] = [{ id: 'a', kids: [{ id: 'b', blue: true, kids: [{ id: 'c' }] }, { id: 'd', via: 'x', plain: { via: 'y', note: null }, note: 'n' }] }];
    expect(taughtNodes(tree)).toEqual([{ id: 'a', kids: [{ id: 'c' }, { id: 'd', via: 'y' }] }]);
  });

  it('maps keep no blue node, and lose only blue ones', () => {
    for (const map of LEARNING_MAPS) {
      const t = taughtMap(map);
      expect(anyBlue(t.roots), map.id).toBe(false);
      for (const d of t.details) expect(anyBlue(d.roots), `${map.id}/${d.id}`).toBe(false);
      if (!anyBlue(map.roots)) expect(labels(t.roots)).toEqual(labels(map.roots));
    }
    const pharynx = LEARNING_MAPS.find((m) => m.week === 17 && anyBlue(m.roots))!;
    expect(labels(taughtMap(pharynx).roots)).not.toContain('milohioideoa');
  });

  it('tables stay whole after blue rows go, and fully blue sections disappear', () => {
    for (const s of GRID_SCHEMES) {
      const t = taughtGrid(s);
      if (s.blue) {
        expect(t, s.id).toBeNull();
        continue;
      }
      expect(t, s.id).not.toBeNull();
      expect(slotsFilled(t!), s.id).toBe(true);
      expect(t!.rows.length).toBe(s.rows.filter((r) => !r.blue).length);
      expect(t!.rows.some((r) => r.blue)).toBe(false);
    }
    const skull = taughtGrid(GRID_SCHEMES.find((s) => s.id === 'kraneoaren-hezurrak-17')!)!;
    expect(skull.rows.flatMap((r) => r.cells.map((c) => c?.text))).not.toContain('Frontalak');
    const ear = taughtGrid(GRID_SCHEMES.find((s) => s.id === 'poltsa-arraildura-matrizea-18')!)!;
    const cleft = ear.rows.flatMap((r) => r.cells).find((c) => c?.text === '1. arraildura');
    expect(cleft?.span ?? 1).toBe(1);
    expect(ear.rows.flatMap((r) => r.cells.map((c) => c?.text))).not.toContain('Kanpoko entzumen hodia');
  });
});
