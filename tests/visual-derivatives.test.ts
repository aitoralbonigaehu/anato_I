import { describe, expect, it } from 'vitest';
import { buildVisualFlows, hasVisualDerivatives, settledBeatT, VISUAL_MIN_WEEK } from '@/lib/learning/visual-derivatives';
import { getWeek } from '@/content/registry';

describe('visual-derivatives (topics 15+)', () => {
  it('enables visual 3D derivatives only for topics 15 and above', () => {
    expect(VISUAL_MIN_WEEK).toBe(15);
    expect(hasVisualDerivatives(7)).toBe(false);
    expect(hasVisualDerivatives(14)).toBe(false);
    for (const week of [15, 16, 17, 18, 19, 20]) {
      expect(hasVisualDerivatives(week)).toBe(true);
    }
  });

  it('resolves a valid 3D simulator target for every flow and step in topics 15–20', () => {
    for (const week of [15, 16, 17, 18, 19, 20]) {
      const flows = buildVisualFlows(week, false);
      expect(flows.length).toBeGreaterThan(0);
      for (const vf of flows) {
        expect(vf.steps.length).toBeGreaterThan(0);
        for (const step of vf.steps) {
          expect(step.target, `week ${week} flow ${vf.flow.id} node ${step.key}`).not.toBeNull();
          const t = step.target!;
          const targetWeek = getWeek(t.week);
          expect(targetWeek).toBeDefined();
          const stage = targetWeek!.stages.find((s) => s.id === t.stageId);
          expect(stage).toBeDefined();
          expect(stage!.views[t.viewIndex]).toBeDefined();
          expect(t.t).toBeGreaterThanOrEqual(0);
          expect(t.t).toBeLessThanOrEqual(1);
        }
      }
    }
  });

  it('respects taughtOnly by filtering blue flows and nodes in topics with blue content', () => {
    const full15 = buildVisualFlows(15, false);
    const taught15 = buildVisualFlows(15, true);
    expect(full15.length).toBeGreaterThan(taught15.length);
    expect(taught15.some((vf) => vf.flow.id === 'giltzurrun-gaineko-bi-jatorri')).toBe(false);
  });

  it('maps topic 20 brain derivative trees onto week 19 3D brain scenes', () => {
    const flows20 = buildVisualFlows(20, false);
    expect(flows20.length).toBeGreaterThan(0);
    const first = flows20[0];
    expect(first.steps[0].target?.week).toBe(19);
  });

  it('computes a settled beat progress inside the beat interval', () => {
    const w15 = getWeek(15)!;
    const stage = w15.stages[0];
    const t0 = settledBeatT(stage, 0);
    expect(t0).toBeGreaterThan(stage.beats[0].at);
    if (stage.beats.length > 1) {
      expect(t0).toBeLessThan(stage.beats[1].at);
    }
  });

  it('backs every topic 15–20 flow with Topic 15+ 3D models (never flat 2D eskema when a 3D view exists)', () => {
    for (const week of [15, 16, 17, 18, 19, 20]) {
      const flows = buildVisualFlows(week, false);
      let withId = 0;
      let exact = 0;
      for (const vf of flows) {
        for (const step of vf.steps) {
          const target = step.target!;
          const stage = getWeek(target.week)!.stages.find((s) => s.id === target.stageId)!;
          const view = stage.views[target.viewIndex]!;
          const hasNonEskema = stage.views.some((v) => v.plane !== 'eskema');
          if (hasNonEskema) expect(view.plane).not.toBe('eskema');
          if (step.id) {
            withId++;
            if (target.exact) exact++;
          }
        }
      }
      // Almost every structure-backed node in topics 15–20 resolves directly to a stage where it appears,
      // and the few conceptual/non-stage-listed structures fall back cleanly to their flow's 3D stage.
      expect(exact / Math.max(1, withId), `week ${week} exact structure coverage (${exact}/${withId})`).toBeGreaterThanOrEqual(0.9);
    }
  });
});
