import { describe, expect, it } from 'vitest';
import { GRID_SCHEMES, type GridScheme } from '@/content/eratorriak/grid-schemes';
import { LEARNING_MAPS } from '@/content/eratorriak/learning-maps';
import { hasBlueContent, taughtGrid, taughtMap, taughtNodes } from '@/content/eratorriak/taught';
import type { MNode } from '@/content/migrations';
import { nameOf } from '@/content/registry';
import { buildReviewCards } from '@/lib/learning/scheme-review';

// "Aurten emandakoa" (default in Eratorriak from topic 15): the notes' blue or grey text, not taught this year, is left out.
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
/** What the map shows once its taught wording (`plain`) is applied, blue nodes kept: only blue ones may go. */
const plainLabels = (nodes: MNode[]): string[] => nodes.flatMap((n) => [n.plain?.label ?? n.label ?? n.id ?? '', ...plainLabels(n.kids ?? [])]);
const anyBlue = (nodes: MNode[]): boolean => nodes.some((n) => n.blue || anyBlue(n.kids ?? []));

describe('Eratorriak: taught this year', () => {
  it('only topics 15+ have blue content', () => {
    for (let w = 1; w <= 20; w++) expect(hasBlueContent(w), `topic ${w}`).toBe([15, 17, 18, 20].includes(w));
  });

  it('offers Topic 20 practice and keeps the cut brainstem columns out of taught practice', () => {
    const maps = LEARNING_MAPS.filter((map) => map.week === 20);
    const fullCards = buildReviewCards(maps, nameOf);
    const taughtCards = buildReviewCards(maps.map(taughtMap), nameOf);
    expect(fullCards.some((card) => card.mapId === 'mapa-20-zutabeak')).toBe(true);
    expect(taughtCards.some((card) => card.mapId === 'mapa-20-zutabeak')).toBe(false);
    expect(taughtCards.some((card) => card.mapId === 'mapa-20-telentzefaloa')).toBe(true);
  });

  it('keeps the taught parts of Topic 20 mixed maps in both the overview and practice', () => {
    const brainstem = LEARNING_MAPS.find((map) => map.id === 'mapa-20-enborra')!;
    expect(taughtMap(brainstem).flowIds).toEqual(['entzefalo-enborraren-eratorriak-20']);

    const forebrain = LEARNING_MAPS.find((map) => map.id === 'mapa-20-dientzefaloa')!;
    const taught = taughtMap(forebrain);
    expect(labels(taught.roots)).toEqual(expect.arrayContaining(['talamoa', 'Azpitalamoa', 'adenohipofisia', 'neurohipofisia']));
    expect(forebrain.details.flatMap((flow) => flow.pitfalls ?? []).join(' ')).toContain('zela turkiarrean');
    expect(taught.details.flatMap((flow) => flow.pitfalls ?? []).join(' ')).not.toContain('zela turkiarrean');

    const cardText = (map: typeof forebrain) => buildReviewCards([map], nameOf).map(({ prompt, answer }) => `${prompt}\n${answer}`).join('\n');
    expect(cardText(forebrain)).toContain('tenperatura, gosea eta egarria');
    expect(cardText(taught)).toContain('Azpitalamoa');
    expect(cardText(taught)).not.toContain('tenperatura, gosea eta egarria');
  });

  it('drops blue nodes and lifts their taught children', () => {
    const tree: MNode[] = [{ id: 'a', kids: [{ id: 'b', blue: true, kids: [{ id: 'c' }] }, { id: 'd', via: 'x', plain: { via: 'y', note: null }, note: 'n' }] }];
    expect(taughtNodes(tree)).toEqual([{ id: 'a', kids: [{ id: 'c' }, { id: 'd', via: 'y' }] }]);
  });

  it('maps keep no blue node, and lose only blue ones', () => {
    for (const map of LEARNING_MAPS) {
      const t = taughtMap(map);
      expect(anyBlue(t.roots), map.id).toBe(false);
      expect(t.flowIds, map.id).toEqual(t.details.map((flow) => flow.id));
      for (const d of t.details) expect(anyBlue(d.roots), `${map.id}/${d.id}`).toBe(false);
      if (!anyBlue(map.roots) && !map.details.some((d) => d.blue)) expect(labels(t.roots)).toEqual(plainLabels(map.roots));
      for (const d of t.details) expect(d.blue, `${map.id}/${d.id}`).toBeUndefined();
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
    expect(taughtGrid(GRID_SCHEMES.find((s) => s.id === 'bikote-kranealak-17')!)).toBeNull();
    const ear = taughtGrid(GRID_SCHEMES.find((s) => s.id === 'poltsa-arraildura-matrizea-18')!)!;
    const cleft = ear.rows.flatMap((r) => r.cells).find((c) => c?.text === '1. arraildura');
    expect(cleft?.span ?? 1).toBe(1);
    expect(ear.rows.flatMap((r) => r.cells.map((c) => c?.text))).not.toContain('Kanpoko entzumen hodia');
  });
});
