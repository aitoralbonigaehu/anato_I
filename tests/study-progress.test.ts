import { describe, expect, it } from 'vitest';
import { emptyActivity, mergeActivity, parseActivity, recordRecall, recordStageOpen, recordStudyTime, dayKey } from '@/lib/study/activity';
import { mergeSnapshot, sameSnapshot } from '@/lib/account/snapshot';
import { answerStudy, buildStudyQueue, flipStudy, isFirstTry, startStudy, type Cards } from '@/lib/belortzioakCards';
import { levelOf, summarize, type SummaryInput } from '@/lib/study/summary';
import { checkName, checkPin, nameKey } from '@/lib/account/types';

const T = new Date(2026, 10, 11, 10).getTime();
const DAY = 86_400_000;

describe('activity', () => {
  it('counts openings and time per stage and per day', () => {
    let a = recordStageOpen(emptyActivity(), 7, 'a', T);
    a = recordStageOpen(a, 7, 'a', T + 1000);
    a = recordStudyTime(a, 7, 'a', 30, T + 2000);
    a = recordRecall(a, true, T);
    a = recordRecall(a, false, T);
    expect(a.stages['7/a']).toMatchObject({ n: 2, s: 30, first: T });
    expect(a.days[dayKey(T)]).toEqual({ s: 30, st: 2, ok: 1, bad: 1 });
  });

  it('caps a single time slice so a sleeping laptop adds nothing absurd', () => {
    const a = recordStudyTime(emptyActivity(), 7, 'a', 5000, T);
    expect(a.stages['7/a'].s).toBe(120);
  });

  it('merges idempotently', () => {
    const a = recordStudyTime(recordStageOpen(emptyActivity(), 7, 'a', T), 7, 'a', 40, T);
    const b = recordStageOpen(recordStageOpen(emptyActivity(), 8, 'b', T), 7, 'a', T + DAY);
    const m = mergeActivity(a, b);
    expect(mergeActivity(m, m)).toEqual(m);
    expect(mergeActivity(m, a)).toEqual(m);
    expect(m.stages['7/a']).toMatchObject({ n: 1, s: 40, first: T, last: T + DAY });
    expect(m.stages['8/b'].n).toBe(1);
  });

  it('ignores junk when parsing', () => {
    expect(parseActivity({ stages: { bad: { n: 1 }, '7/a': { n: -3, s: 'x' } }, days: { nope: {} } })).toEqual({ v: 1, stages: { '7/a': { n: 0, s: 0, first: 0, last: 0 } }, days: {} });
  });
});

describe('account snapshot merge', () => {
  it('keeps both devices\' progress and is idempotent', () => {
    const local = {
      'enbrioatlas:visited': { 7: ['a', 'b'] },
      'enbrioatlas:belortzioak': { k1: { b: 2, due: 5, ok: 2, bad: 0 } },
      'enbrioatlas:answers': { q1: { streak: 1, right: 1, wrong: 0, due: 0, hist: [[100, 1]] } },
    };
    const remote = {
      'enbrioatlas:visited': { 7: ['b', 'c'], 8: ['x'] },
      'enbrioatlas:belortzioak': { k1: { b: 3, due: 9, ok: 3, bad: 0 }, k2: { b: 1, due: 1, ok: 0, bad: 1 } },
      'enbrioatlas:answers': { q1: { streak: 0, right: 1, wrong: 1, due: 0, hist: [[100, 1], [200, 0]] } },
    };
    const m = mergeSnapshot(local, remote);
    expect(m['enbrioatlas:visited']).toEqual({ 7: ['a', 'b', 'c'], 8: ['x'] });
    expect((m['enbrioatlas:belortzioak'] as Cards).k1.ok).toBe(3);
    expect((m['enbrioatlas:belortzioak'] as Cards).k2).toBeDefined();
    expect((m['enbrioatlas:answers'] as Record<string, { wrong: number }>).q1.wrong).toBe(1);
    expect(sameSnapshot(mergeSnapshot(m, m), m)).toBe(true);
    expect(sameSnapshot(mergeSnapshot(m, remote), m)).toBe(true);
  });

  it('fills from the cloud when this device has nothing', () => {
    const remote = { 'enbrioatlas:visited': { 7: ['a'] } };
    expect(mergeSnapshot({}, remote)).toEqual(remote);
  });
});

describe('Ikasketa modua', () => {
  const items = ['a', 'b', 'c', 'd', 'e'].map((key) => ({ plate: 'p', key }));

  it('puts due cards first, then weak ones, then new ones', () => {
    const cards: Cards = {
      c: { b: 4, due: T - 1, ok: 4, bad: 0 },
      d: { b: 1, due: T + DAY, ok: 0, bad: 1 },
      e: { b: 5, due: T + 9 * DAY, ok: 5, bad: 0 },
    };
    expect(buildStudyQueue(items, cards, T).map((x) => x.key)).toEqual(['c', 'd', 'a', 'b']);
  });

  it('brings a miss back a few cards later, scores only first tries', () => {
    let s = startStudy(items);
    expect(isFirstTry(s)).toBe(true);
    s = answerStudy(flipStudy(s), false);
    expect(s.queue.map((x) => x.key)).toEqual(['b', 'c', 'd', 'a', 'e']);
    for (let i = 0; i < 3; i++) s = answerStudy(flipStudy(s), true);
    expect(s.queue[0].key).toBe('a');
    expect(isFirstTry(s)).toBe(false);
    s = answerStudy(flipStudy(s), true);
    s = answerStudy(flipStudy(s), true);
    expect(s.queue).toEqual([]);
    expect(s).toMatchObject({ right: 4, wrong: 1, total: 5 });
  });

  it('gives up on a card after three misses in one session', () => {
    let s = startStudy([items[0]]);
    for (let i = 0; i < 3; i++) s = answerStudy(flipStudy(s), false);
    expect(s.queue).toEqual([]);
    expect(s.misses.a).toBe(3);
  });
});

describe('summary', () => {
  const base = (over: Partial<SummaryInput> = {}): SummaryInput => ({
    now: T,
    activity: emptyActivity(),
    visited: {},
    answers: {},
    questionWeek: () => 7,
    bel: {},
    belSystems: [{ id: 'kardio', title: 'Kardio', keys: ['k1', 'k2'] }],
    scheme: { reviewed: 0, known: 0 },
    topics: [{ week: 7, title: 'Barrunbeak', ready: true, stages: [{ id: 'a', title: 'A' }, { id: 'b', title: 'B' }] }],
    ...over,
  });

  it('starts at zero', () => {
    const s = summarize(base());
    expect(s.xp).toBe(0);
    expect(s.level.name).toBe('Zigotoa');
    expect(s.streak.current).toBe(0);
    expect(s.badges.every((b) => !b.got)).toBe(true);
  });

  it('counts a streak ending today or yesterday', () => {
    let a = emptyActivity();
    for (const d of [1, 2, 3]) a = recordStudyTime(a, 7, 'a', 60, T - d * DAY);
    expect(summarize(base({ activity: a })).streak).toEqual({ current: 3, best: 3, today: false });
    a = recordRecall(a, true, T);
    expect(summarize(base({ activity: a })).streak).toMatchObject({ current: 4, today: true });
  });

  it('rewards a whole topic and its badges', () => {
    let a = recordStageOpen(emptyActivity(), 7, 'a', T);
    a = recordStageOpen(a, 7, 'b', T);
    const s = summarize(base({ activity: a }));
    expect(s.topics[0]).toMatchObject({ seen: 2, total: 2, views: 2 });
    expect(s.badges.find((b) => b.id === 'gai-osoa')?.got).toBe(true);
    expect(s.xp).toBe(15 + 15 + 100);
  });

  it('sorts flashcards into boxes', () => {
    const s = summarize(base({ bel: { k1: { b: 4, due: T - 1, ok: 4, bad: 0 } } }));
    expect(s.bel[0]).toMatchObject({ boxes: [1, 0, 0, 1], due: 1 });
  });

  it('levels go up with experience', () => {
    expect(levelOf(0).name).toBe('Zigotoa');
    expect(levelOf(60).name).toBe('Morula');
    expect(levelOf(99999)).toMatchObject({ name: 'Anatomista', to: null });
  });
});

describe('name and PIN rules', () => {
  it('treats case and accents as the same name', () => {
    expect(nameKey('  Ané  Etxe ')).toBe(nameKey('ane etxe'));
  });
  it('validates', () => {
    expect(checkName('Al')).not.toBeNull();
    expect(checkName('Ane Etxeberria')).toBeNull();
    expect(checkName('<script>')).not.toBeNull();
    expect(checkPin('1234')).toBeNull();
    expect(checkPin('12')).not.toBeNull();
    expect(checkPin('12a4')).not.toBeNull();
  });
});
