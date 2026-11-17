# Prompt for the next session (topics 17–19), written 2026-11-17

Paste everything below the line into a new Claude Code session opened in this folder.

---

You are taking over unfinished work on EnbrioAtlas, a Basque embryology study app (Next.js + a custom WebGL 3D kit). Students study the course notes side by side with it, and anatomy teachers will see it. The owner wants topics 16–19 to feel like **one continuous, high-end 3D experience**: the student always knows where they come from, where they are and where they are going; a change of stage is a camera move through one body, never a cut or a trip out of the embryo and back. The 3D models must look like a professional medical-visualisation company made them, and be **easy for students to understand**. Each topic must be better than the one before it.

The owner's priority, in order: **finish topic 18, then the rest of topic 17, then topic 19** as far as you get.

## 1. Read before touching anything (in this order)

1. `docs/handover/remaining-work.md` — the index; its last section ("Session of 2026-11-17") says where things stopped and in what order to continue.
2. `docs/handover/topic-18-todo.md` — **start here.** Its first section "State on 2026-11-17" lists what is done, the three changes made but not yet seen on screen, and a numbered owed list. It supersedes the older sections A–F below it where they disagree.
3. `docs/handover/topic-17-todo.md` — first section "State on 2026-11-17", same shape.
4. `docs/handover/topic-19-todo.md` — nothing built yet; Phase 1 is the critical path. Then `topic-19-plan.md`, `topic-19-prep-b.md`, `topic-19-prep-c.md`.
5. `docs/handover/topics-17-19-brief.md` — the standard as a recipe (sites, `arrive` lines, run-on poses, cold entry, tones, flight sheet), the tools, the shared-tree rules.
6. `docs/quality/3d-quality-bar.md` — the quality bar. **Its section "Production standard 2026-11" (set on topics 16–18) is the standard every stage of topics 16–19 must meet**: one root model with as few separate models as possible, measured and tested sites, run-ons from `endPose`, no loading spinner instead of a flight, deforming skins carried as a flow, 3D closing summaries, the QA order, and the shape of the plan files. Each topic's todo has a checklist "Production standard 2026-11: what topic NN still misses".
7. `docs/handover/topic-18-sites.md`, `topic-17-sites.md` — roots, axes, landmarks, `tie` / `onSite`.
8. `AGENTS.md`: this Next.js differs from what you know; read `node_modules/next/dist/docs/` before any framework or routing code.

Reference implementation of the standard: topic 16 (`components/scenes/week16/`), `lib/three-d/place.ts`, `components/kit/three/Stage3D.tsx` (handover, flight, run-on), `components/scenes/week14/common.tsx` (`StageSpec`, `poseStage`, `runOn`, `endPose`).

## 2. The first batch (topic 18)

1. Shoot the three topic-18 changes nobody has seen yet (list in `topic-18-todo.md`, "Changed but NOT yet seen"): the face skin flow (`face-model.ts`), the `beste-arraildurak` cameras, the last step of `guruinen-jaisketa`. Read every PNG. Fix what is wrong.
2. Then the "Owed for topic 18" list, top down: face polish, a better adult-neck model for `tiroidea-heldua`, `koanak`, teeth, run-on hygiene, `--back` sheets and tablet sizes, `ask` checks, dead code.
3. Finish line for topic 18 (section F of its todo), then tell the owner what landed, and move to topic 17's owed list, then topic 19 Phase 1.
4. Topic 16 is built but older than the standard: back-port its checklist ("Production standard 2026-11: what topic 16 still misses" in `topic-16-todo.md`) when 17 and 18 are done, or sooner if a strip shows a problem there.

Work in batches with a clear finish line; after each batch: verify on screen, update the topic's todo file (tick what is done, add what you found), and say in a few lines what landed.

**Content accuracy comes first.** The course notes are the source: their prose wins over their tables and over textbooks; where they disagree with textbooks, follow the notes and add a KONTUZ. App text is Basque, in the notes' own terms. **Never put anything about past exam questions, or the notes' remarks about what the teacher will or will not ask, anywhere in the app.**

## 3. The 3D bar (what "high end" means here)

- **Organic, solid, continuous.** Smooth organic shapes (`lib/three-d/organic.ts`), no faceting, no seams, no flat cardboard slabs where the anatomy has thickness: a section is a solid block with cut faces; context tissue is solid ground. Growth is shown as growth (a bud swells, a fold rolls, a duct lengthens), never as a part fading in where it ends.
- **Every narrated action visibly happens** (push, fold, fuse, descend, close). If it is small, frame it close.
- **A deforming skin moves in small steps** (topic-18 face: `carry` / `flowAt` in `face-model.ts`). A single big jump folds the mesh over itself and shows black creases and smeared colours. A quick check: count triangles whose face normal points against their vertex normals.
- **Tones:** one ground palette per topic (`tones.ts`). The 3D layer shows colours about hex^2.2 darker than the hex reads: choose grounds by the screenshot's pixels. Cavities are a blue-grey recess, never black. Skin and mucosa get `Item3.calm`. The same tissue has the same tone in every model of a topic.
- **Labels:** keep every name the notes give; text above lines; anchors well inside one structure, never on a seam; glow the lit thing, no drawn rings or dashed boxes; names arrive after the camera.
- **Continuity:** every stage has `site` + a short Basque `arrive` line + `where` (cold entry); between models one camera flight; on the same model the camera glides and the pose runs on from the previous stage's end pose (`pose: endPose(prevSpec).pose`). A new site gets a test in `tests/sitesNN*.test.ts` (landmark on landmark, similarity, sides kept).
- **Heavy models:** register the module in `lib/three-d/geo-registry.ts` and list its keys in the scene's static `.geo`; the shell prewarms the neighbouring stages.
- Each notes figure needs a matching picture at its step, with both names.

## 4. Verification (nothing is done until you have looked at it)

- Environment for the shooters (bash):
  `export NODE_PATH="C:/Users/aitor/AppData/Local/npm-cache/_npx/9833c18b2d85bc59/node_modules" CHROME="C:/Users/aitor/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe"`
- Stage sheet: `node scripts/quality/stage-sheet.mjs 18 <out> --stages a,b --at 0.2,0.5,0.95 [--shrink 2] [--vw 1024 --vh 768]`.
  Flight sheet: `node scripts/quality/flight-sheet.mjs 18 <out> --stages a,b --at 0.25,0.5,0.8 --shrink 3 --dwell 5000 [--back]` (without `--dwell` a crossing into a heavy model shows the loading spinner).
  Write outputs to your scratchpad and read every PNG yourself. Shoot at 1440 and at 1024×768 and 768×1024 (PC/tablet app; no phone work).
- The dev server at :3000 is shared: if it is not up, start it the way `.claude/launch.json` says (do not start a second one). Run **one shooter at a time**; do not edit source while a shooter or vitest runs. Never import a file before it exists (one bad import gives a 500 on every page).
- The in-app browser pane has no requestAnimationFrame: verify animations with the headless sheets.
- Tests: `npx tsc --noEmit -p .`, then the guard set (≈5 min):
  `npx vitest run tests/sites17.test.ts tests/sites17c.test.ts tests/sites18.test.ts tests/sites18b.test.ts tests/sites18c.test.ts tests/notes.test.ts tests/visibility.test.tsx tests/anchors3d.test.ts tests/labels.test.tsx tests/content.test.tsx tests/chronology.test.ts`.
  Six failures are old and not yours (topics 7–9; listed in `remaining-work.md`). The beat-count pin in `tests/notes.test.ts` is 1392; update it only when you add or split beats on purpose.
- Before reporting a non-trivial batch as done, get a fresh-context review of it (a verifier subagent if available) and check its claims yourself.

## 5. Rules

- Do not commit, push, stash, reset or checkout unless the owner asks. Work in this folder's current tree (nothing of topics 16–19's recent work is committed).
- Do not spawn subagents unless the owner asks for them in your session.
- No regressions in other topics: after shared-kit changes (`components/kit/**`, `lib/three-d/**`, `components/scenes/week14/common.tsx`, `components/shell/**`), re-check a stage from an older topic and run the guard tests. Tests mock `Stage3D` and call children with two arguments: any new child argument needs a default.
- Inline shell heredocs containing apostrophes break here: write Python or Node edit scripts to your scratchpad (Write tool), assert each replaced string matches exactly once, and keep each file's line endings (CRLF in places).
- Keep the plan files current: when you stop, each `topic-NN-todo.md` must say exactly what is left, so the next session can continue from it.
- Spend most of your effort on what students see (better 3D models and clearer steps); park side issues that do not reproduce.

Start by reading the files in section 1, then tell the owner in a few lines which batch you will do first and why, and begin.
