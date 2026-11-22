import { describe, expect, it } from 'vitest';
import { orbit } from '@/components/scenes/week10/Heart3D';
import { toothModel, TP0, type ToothPose } from '@/components/scenes/week18/tooth-model';
import { viewOf } from '@/lib/three-d/math';
import { forgetResume, seenOwn, takeResumed, visibleAnchor } from '@/lib/three-d/occlusion';

/**
 * Name dots while a model plays (2026-11-22). In topic 18's tooth (stage 28, step 6: the periodontal ligaments and
 * the alveolar bone growing) the strict dot search ran in full every frame, because the model is a new item list
 * each frame: ~115 ms a frame, playback at a crawl. While the eye holds still the search now resumes from last
 * frame's answer (`visibleAnchor` with a live view); once the picture stops, ModelView asks once more with
 * `settle` and gets the full search, the dot the hover tests check. These pin both halves.
 */

const BASE: ToothPose = { ...TP0, thick: 1, lam: 1, cap: 1, pap: 1, bell: 1, free: 1, cells: 1, dep: 1, vess: 1, root: 1, cem: 1 };
const NAMES = ['lotailu-periodontalak', 'albeoloa', 'zementoa'];
const DIM = { dim: { ids: NAMES, k: 1 } };
const cam = orbit(-12, 6, 10, [0, -0.8, 0], [20, 0]);
const view = viewOf(cam);
const eye = view.eye;
const frame = (k: number) => toothModel({ ...BASE, lig: k, alv: k }, DIM);
/** The step's growth in 48 played frames (the app plays it in a few hundred: smaller changes, more resumes). */
const KS = Array.from({ length: 48 }, (_, f) => 0.2 + f * 0.0125);

const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[xs.length >> 1];

describe('name dots while a model plays', () => {
  it('a played frame resumes from the last one, several times cheaper than a full search', { timeout: 120_000 }, () => {
    const time = (settle: boolean) => {
      forgetResume();
      const per: number[] = [];
      for (const k of KS) {
        const m = frame(k);
        const t0 = performance.now();
        for (const id of NAMES) visibleAnchor(m.items, eye, m.pts[id], id, () => true, 48, true, settle);
        per.push(performance.now() - t0);
      }
      return median(per.slice(1));
    };
    const full = time(true);
    takeResumed();
    const played = time(false);
    expect(takeResumed(), 'played frames resume').toBe(true);
    // On the day: ~115 ms full, ~7 ms played.
    expect(played, `played ${played.toFixed(1)} ms vs full ${full.toFixed(1)} ms a frame`).toBeLessThan(full / 4);
  });

  it('a resumed dot lights its own structure wherever a fresh search finds one that does', { timeout: 120_000 }, () => {
    // (The hover rule as the solver asks it: `seenOwn`, pinned to the pick in anchors-hover.test.ts.)
    const fresh = (k: number) => {
      forgetResume();
      const m = frame(k);
      return NAMES.map((id) => seenOwn(m.items, eye, visibleAnchor(m.items, eye, m.pts[id], id, () => true, 48, true, true), id));
    };
    const want = KS.map(fresh);
    forgetResume();
    const misses: string[] = [];
    KS.forEach((k, f) => {
      const m = frame(k);
      NAMES.forEach((id, i) => {
        const q = visibleAnchor(m.items, eye, m.pts[id], id, () => true, 48, true);
        if (want[f][i] && !seenOwn(m.items, eye, q, id)) misses.push(`${id} k=${k.toFixed(4)}`);
      });
    });
    expect(want.flat().filter(Boolean).length).toBeGreaterThan(KS.length * 2);
    expect(misses).toEqual([]);
  });

  it('a settled frame gets the full search: the same dot as a fresh one, whatever played before', { timeout: 120_000 }, () => {
    const fresh = (k: number) => {
      forgetResume();
      const m = frame(k);
      return NAMES.map((id) => visibleAnchor(m.items, eye, m.pts[id], id, () => true, 48, true, true));
    };
    for (const stop of [12, 32, 47]) {
      forgetResume();
      // Played up to here (resumed answers in the memo of the last frame's items)...
      let m = frame(KS[0]);
      for (const k of KS.slice(0, stop + 1)) {
        m = frame(k);
        for (const id of NAMES) visibleAnchor(m.items, eye, m.pts[id], id, () => true, 48, true);
      }
      // ...then the picture holds still and the view settles on the same items.
      const settled = NAMES.map((id) => visibleAnchor(m.items, eye, m.pts[id], id, () => true, 48, true, true));
      expect(settled, `stopped at k=${KS[stop]}`).toEqual(fresh(KS[stop]));
    }
  });
});
