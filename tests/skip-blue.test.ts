import { describe, expect, it } from 'vitest';
import { getWeek, weeks } from '@/content/registry';
import { hasBlue, notesOf } from '@/content/notes-text';
import { blueSteps, nextShown, stageAllBlue } from '@/lib/sim/skip-blue';

// "Skip blue": the notes of topics 16+ set what was not taught this year in blue.
describe('skip blue', () => {
  it('marks blue text only from topic 16', () => {
    for (const w of weeks) expect(hasBlue(w.week), `topic ${w.week}`).toBe(w.week >= 16 && notesOf(w.week).length > 0);
  });

  it('flags steps whose notes are entirely blue', () => {
    const w17 = getWeek(17)!;
    const bikote = w17.stages.find((s) => s.id === 'bikote-kranealak')!;
    expect(stageAllBlue(bikote)).toBe(true);
    const buru = w17.stages.find((s) => s.id === 'buru-ganga')!;
    expect(blueSteps(buru)).toEqual([false, true, true]);
    // Steps without notes are never skipped; earlier topics have no blue steps.
    for (const w of weeks.filter((x) => x.week < 16)) for (const s of w.stages) expect(blueSteps(s).some(Boolean), s.id).toBe(false);
  });

  it('finds the next step that is not blue, across stages', () => {
    const stages = getWeek(17)!.stages;
    const i = stages.findIndex((s) => s.id === 'buru-ganga');
    // After step 1 of buru-ganga, steps 2–3 are blue: on to the next stage's first step that is not.
    const to = nextShown(stages, i, 1, 1)!;
    expect(to.i).toBeGreaterThan(i);
    expect(blueSteps(stages[to.i])[to.k]).toBe(false);
    // Backwards from the stage after the all-blue one lands before it.
    const b = stages.findIndex((s) => s.id === 'bikote-kranealak');
    const back = nextShown(stages, b + 1, -1, -1)!;
    expect(back.i).toBeLessThan(b);
    expect(nextShown(stages, stages.length - 1, stages.at(-1)!.beats.length, 1)).toBeNull();
  });
});
