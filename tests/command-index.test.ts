import { describe, expect, it } from 'vitest';
import { appearances, structures, weeks } from '@/content/registry';
import { ACTIONS, PAGES, buildIndex, fold, search } from '@/components/shell/command-index';

const first = new Map<string, { week: number; stage: string }>();
for (const [id, refs] of appearances) if (refs[0]) first.set(id, { week: refs[0].week.week, stage: refs[0].stage.id });
const all = [...ACTIONS, ...PAGES, ...buildIndex(weeks, first, structures)];

describe('command bar search', () => {
  it('folds accents, case and punctuation', () => {
    expect(fold('Bitelo-Zakua')).toBe('bitelo zakua');
    expect(fold('  Ápice  ')).toBe('apice');
  });

  it('puts an exact stage first', () => {
    const groups = search(all, 'gibela');
    expect(groups[0].group).toBe('etapak');
    expect(groups[0].items[0].title).toBe('Gibela');
  });

  it('finds structures by their Spanish name too', () => {
    const hit = search(all, 'saco vitelino').find((g) => g.group === 'egiturak');
    expect(hit?.items.length).toBeGreaterThan(0);
  });

  it('does not match scattered letters', () => {
    const topics = search(all, 'gibel').find((g) => g.group === 'gaiak');
    expect(topics?.items.some((c) => c.title === 'Zirkulazio aparatua')).toBeFalsy();
  });

  it('links every structure somewhere', () => {
    for (const c of all.filter((x) => x.group === 'egiturak')) expect(c.href).toMatch(/^\/(astea|egiturak)/);
  });
});
