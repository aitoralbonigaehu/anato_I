# Kit requests (topics 17–19 agents → lead)

Append a dated entry: who, what, why, the smallest change that would do.

## 2026-11-16, 20:25 — collected by the lead from the agents' final reports (none had been filed)

- **17-C → `lib/three-d/geo-registry.ts`:** add `import '@/components/scenes/week17/nerves-model';` so the `nerve-brain` slot builds in the geometry worker (the brain is otherwise built on the main thread when the browser is idle). `nerves-model.ts` was made worker-safe for this. Check `bikote-kranealak` and `bagoa` load after it.
- **DONE 2026-11-17 (second session):** Specimen phase, TopicShot card (`bost-xixkuak`) and the `brain19` geometry slot are in. **19-A → `components/shell/Specimen.tsx`:** week 19's phase. **→ `components/shell/TopicShot.tsx`:** a topic card for 19. **→ `lib/three-d/geo-registry.ts`:** a slot for any topic-19 model heavy enough to build off-thread. Only once topic 19 has a first stage (see `topic-19-todo.md`).
- **17-B → `components/shell/CourseFigures.tsx`:** the course-figure page counts are hard-coded; the corrected notes 17 add figures (cartilages, muscles, hyoid photos) and drop old 17-5, 17-9, 17-11.
- **16-P → `app/api/irudi-orriak/[file]/route.ts`:** a fixed list of seven page sets (`counts = [4, 3, 2, 4, 4, 8, 13]`); adding the topic-16 figure sheet needs an entry there.
- **18-B, 18-C → `scripts/quality/flight-sheet.mjs`, `stage-sheet.mjs`:** they list stages in file order (`week18a`…`m`), not the topic's `ORDER`; the "→ to" labels on topic-18 strips (and topic 17's, whose order changed) name the wrong stage. Read `ORDER` from `content/weeks/weekNN.ts` instead.
- **17-C / 17-A → tests:** `content.test.tsx` and `anchors3d.test.ts` time out (5 s) on topic-17 arch-head stages (`trigeminoa`, `lehen-arkua-luzapenak`) on a loaded machine: a longer per-test timeout for those, or a lighter test build of `arch-head.ts`.

- **Done 2026-11-16 (late):** `scripts/quality/stage-sheet.mjs` and `flight-sheet.mjs` sort stages by the topic's `ORDER`.
- **Open:** `flight-sheet.mjs --back` opens the stage at 2 %, where the cold-entry embryo is still on screen; open at ~30 % to test "mid-stage → previous stage".
- **Open:** `lib/three-d/geo-client.ts` has no time-out or hand-shake: if the geometry worker never answers, the view stays on "3D eredua prestatzen…" (seen once under load, not reproduced).
