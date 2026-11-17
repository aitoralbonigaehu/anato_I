# Topic 19 (nervous system): what is left (2026-11-16, 20:25)

Written for whoever builds topic 19, from the final reports of 19-A (foundation + sections 1–5), 19-B (sections 6–9) and 19-C (sections 10–13), who all stopped at 20:00. **No stage and no 3D model exists yet.** What exists: the notes text, the plan, the palette, the root landmarks, empty content stubs, and two detailed preparation files. Nothing is committed. `/astea/19` returns 404 (not registered, on purpose).

**Production standard:** build every model and stage to `docs/quality/3d-quality-bar.md`, section "Production standard 2026-11", from the start: one root body with as few separate models as possible, sites measured from a shared landmark and pinned by `tests/sites19*.test.ts`, `site` + `arrive` + `where` on every stage, run-ons from `endPose`, heavy models in `geo-registry.ts` + `.geo`, the neural tube's closing surface carried as a flow (no folds), whole-topic triage then flight sheets with `--dwell`, and a dated "State on <date>" section at the top of this file.

**State on 2026-11-17:** unchanged — still no stage and no model. The session of 2026-11-17 spent its time on topics 17 and 18. Start with Phase 1 below, exactly as written. Two things learnt since that matter for topic 19:
- A heavy model built off-thread must be registered in `lib/three-d/geo-registry.ts` (import its module) and listed in the scene's static `.geo`; otherwise the first arrival shows "3D eredua prestatzen…" instead of the flight. The shell now prewarms the next and previous stages' `.geo` keys (`components/shell/Simulator.tsx`), and `lib/three-d/geo-client.ts` builds on the main thread if the worker has not answered in 30 s.
- A skin that deforms a lot between ages (the topic-18 face) must be moved in small steps (a flow), not in one jump, or it folds over itself and shows black creases: see `face-model.ts` `carry` / `flowAt`. The neural tube closing (stages 17–19) is the same kind of surface.
- The flight sheet needs `--dwell 5000` (or more for the first heavy model) so the strip shows the flight and not the loading spinner.

Read first, in this order:
1. `docs/handover/topics-17-19-brief.md` — the shared brief: the standard as a recipe, tools, rules.
2. `docs/handover/topic-17-18-plan.md`, section "Rules" — they hold for topic 19.
3. `docs/quality/3d-quality-bar.md` — point 8, "Continuity", flight sheet, pitfalls.
4. `docs/handover/topic-19-plan.md` — **the plan**: 23 stages with notes sections, owners and figures to match; the root body and its axes; the sites table and crossings; the colour code `C19`; shared and new structure ids; file ownership; KONTUZ traps. Its first line says Phase 1 is not done.
5. `docs/handover/topic-19-prep-b.md` (stages 11–19) and `docs/handover/topic-19-prep-c.md` (stages 20–23) — section-by-section facts with sentence ids, figures, model designs, crossings, step lists, `ask` ideas.
6. How topic 16 does it: `components/scenes/week16/sites.ts`, `tones.ts`, `common.tsx` (`WHERE16`, `poseStage` wrapper), `Gonad16.tsx`, `Ducts16.tsx`, `tests/sites16.test.ts`.

## What exists (19-A)

- **Notes:** the DOCX was exported with Word to `C:\Users\aitor\Downloads\19. GAIA. NERBIO SISTEMA (zuzendu gabe).docx.pdf` (next to the original) and extracted by `scripts/notes/extract.py` into `content/notes-text/w19.ts` (135 blocks, 321 sentences, 0 differences from the PDF). Pins in `tests/notes.test.ts`. Two quirks kept as written: "1.2.1" has no 1.2 above it; the heading "5.1 Mugimendu erreflexuak" sits inside section 11 (`w19/5.1/…`). The notes are marked "zuzendu gabe" (uncorrected): when the corrected file arrives, re-extract and diff, as 17-B did for topic 17 (`topic-17-notes-diff.md`).
- **Registries (small additive edits):** `content/notes-text/index.ts` (w19 + a notes exception for `19/bost-xixkuak`), `manifest.json`, `content/notes.ts` (table of contents), `lib/narration/server-utils.ts` (`MAX_WEEK` 19), `lib/narration/server.test.ts` (out-of-range week 20), `lib/sim/types.ts` (`| 19`). `scripts/notes/extract.py`: three rule changes apply to all PDFs (drop the "3. taldea" header; Roman numerals don't end a sentence for week 19; section numbers to 13 for week 19) and one for week 19 only (indented lines are not captions). `--check` confirmed weeks 1–5, 17, 18 unchanged; 15 and 16 could not be checked (their PDFs are no longer in Downloads).
- **Scene scaffold:** `components/scenes/week19/tones.ts` (`C19` functional colours, `G19` grounds — not yet measured on screen), `components/scenes/week19/sites.ts` (`ROOT19` landmarks, `tie19`, `onSite19`, `SITE19` body/cord/head).
- **Content stubs:** `content/weeks/week19.ts` (stage `ORDER`, `inPreparation: true`), empty `week19a.ts`, `week19b.ts`, `week19c.ts`, each with `-structures` and `-quiz` siblings.

## Build order (the critical path)

### Phase 1 — foundation (one person; blocks everything else)

1. **`components/scenes/week19/common.tsx`**: `poseStage19` (wrap `poseStage` from `components/scenes/week14/common.tsx` as week16's `common.tsx` does, adding `where` from `WHERE19[site.key]`), `WHERE19` (cold entry: none for the adult models body/cord/head/brain; the fly-in from `EMBRYO5` for the embryonic section/neural/spine), shared cameras, colour keys (legend) for `C19`.
2. **`tests/sites19.test.ts`**: the root landmarks on the body model; every site a similarity; cord at T6 carried onto the body's cord; head's thalamus on `ROOT19.thalamus`.
3. **First model + first stage** (`body-model.ts`, `Body19.tsx`, stage `sarrera` in `week19a.ts`): the adult body cut coronally through the cord, back half as solid ground, CNS and nerves on it, seen from the front.
4. **Register the topic** only once `sarrera` renders: add `week19` back to `content/registry.ts` (19-A added it and took it out, because a topic with no stages makes `/astea/19` return 500). Check `/astea/19` and two other topics return 200.
5. **Lead-owned shell entries** (filed in `kit-requests.md`): week 19's phase in `components/shell/Specimen.tsx`; a topic card in `components/shell/TopicShot.tsx`; a `lib/three-d/geo-registry.ts` slot for any model heavy enough to build off-thread.
6. Clean the plan's sites table into one table (the brain and ventricles rows sit under it).
7. Write `PHASE 1 DONE` at the top of `topic-19-plan.md`. Then 19-B and 19-C work can start in parallel.

### Phase 2 — three parallel blocks (split by file, as in the plan's "Files" section)

**Block A, stages 1–10 (sections 1–5), models `body`, `cord`, `head`** (files `Body19.tsx`, `Cord19.tsx`, `Head19.tsx`, `body-model.ts`, `cord-model.ts`, `head-model.ts`, `week19a*.ts`):

| # | Stage | Model | Notes | Figure to match | What it must show |
|---|---|---|---|---|---|
| 1 | sarrera | body | 1 | | the whole system on the body; where we will go |
| 2 | mozketak-ardatzak | body | 1.1, 1.2.1 | p1 cuts (coronal red, horizontal blue, sagittal green); p2 axes | the three planes passing through the brain; dorsal/ventral differ in brain vs cord (KONTUZ) |
| 3 | zentrala-periferikoa | body | 2 p2–p8 | p3 top | CNS vs PNS lit in turn; cranial + spinal nerves |
| 4 | somatikoa-autonomoa | body | 2 p9–p15, p17 | p3 bottom | sympathetic (T1–T12 / T1–L2, both as written) green, parasympathetic (cranial + S2–S4) violet |
| 5 | sustraiak-gongoila | cord | 2 p16–p17 | p5 | flight body → cord at T6; roots, ganglion, rami; axons join, never fuse |
| 6 | meningeak | cord | 3 p2–p6 | p17 right | dura, arachnoid, pia peel on in order; origins (dura mesoderm; arachnoid + pia neural crest) |
| 7 | garuneko-meningeak | head | 3 (figure) | p6 | flight cord → head; meninges and CSF in the sagittal head |
| 8 | gai-grisa-zuria | cord | 3 p7–p13 | p11 right | grey H and white columns; horns ("adarrak"), lateral horn only T1–T12 (L2) |
| 9 | borondatezko-mugimenduak | body | 4 | p14 right | the voluntary path, cortex → cord → muscle, as one moving signal |
| 10 | aktu-erreflexua | cord | 5 | p5 | the reflex arc: receptor → sensory (blue) → interneuron → motor (red) → effector |

**Block B, stages 11–19 (sections 6–9), models `section`, `spine`, `neural`** — full design in `topic-19-prep-b.md`. Files `sites-b.ts`, `section-model.ts`, `neural-model.ts`, `spine-model.ts`, `Section19.tsx`, `Neural19.tsx`, `Spine19.tsx`, `week19b*.ts`, `tests/sites19b.test.ts`.
- Cord cross-section (stages 11–14): every layer a band between two radius functions round the canal, all changing together with one `mature` number, so the 5th-week plates grow into the 3rd-month H continuously (2D prototype: scratchpad `cord.py`/`cord.png`, session scratchpad, may be gone). The section is drawn at the cord's size so it ties to the cord by the canal: `link('block', 1, [0,0,0], CORD_CANAL)`.
- Spine (15–16): the column grows longer while the cord keeps its length; the cord's end left at L1–L2; cauda equina; the puncture needle steps.
- Neural tube (17–19): one parametric surface whose sides curl up and close like a zipper (neuropores close as the notes say), then 3 and 5 vesicles, the centreline bending at the flexures; laid along the adult CNS (diencephalon on `ROOT19.thalamus`) so the 19 → 20 flight lands on the brain's thalamus.
- Warn steps: "4. astean oraindik hodi neurala existitzen da, ez da ornomuina" and "3. hilabetean jada ez dago plakarik".
- The 17 DOCX figures are extracted (scratchpad `n19/word/media`, may be gone: re-extract by unzipping the DOCX).

**Block C, stages 20–23 (sections 10–13), models `brain`, `ventricles`** — full design in `topic-19-prep-c.md`. Files `sites-c.ts`, `brain-model.ts`, `ventricle-model.ts`, `Brain19.tsx`, `Ventricles19.tsx`, `week19c*.ts`, `tests/sites19c.test.ts`.
- Crossings: 19 → 20 flight onto the thalamus; 20 → 21 run-on; 21 → 22 flight via the third ventricle; 22 → 23 run-on.
- Ventricles: embryonic vesicles' cavities → adult ventricles, choroid plexuses, CSF flow (Monro, aqueduct, Luschka, Magendie). Never "I. eta II. bentrikuluak": the two lateral ventricles.
- Figures on notes pages 6, 14 and 17 not yet looked at.

### Phase 3 — finish

1. `ask` checks: about one stage in three (plan).
2. The beat-count pin in `tests/notes.test.ts` (`expect(count)`) — update last.
3. Plates for `/fitxak` from the notes' figures (`content/plates.ts` pattern; see `topic-16-figure-parity.md` for how plates work); every notes figure needs a matching picture at its step.
4. Remove `inPreparation: true` from `week19.ts` only when all 23 stages pass the finish line.
5. Kimu class (Klasea) for topic 19: later, not part of the first build.

## Traps (from the plan; notes prose wins, KONTUZ where textbooks differ)

- Neuropores: notes say posterior closes day 25, anterior day 28 (textbooks the reverse).
- Dural sac: the notes put it "between the dura and the arachnoid" (w19/8/p4/s6); textbooks put CSF in the subarachnoid space. Say what the notes say, with a KONTUZ.
- Dorsal/ventral mean different directions in brain and cord; "kaudala ez deitu" for occipital.
- Epithalamus: "irudian ez da ageri" — draw it anyway and say so.
- The notes' remarks about what the teacher will or will not ask ("berak ez galdetu / ez erabili") never go into the app, in any form.

## Finish line for each stage

`npx tsc --noEmit -p .`; `npx vitest run tests/sites19*.test.ts` and topic 19's cases of `notes`, `visibility`, `anchors3d`, `labels`, `content`; flight sheet into and out of it, forwards and `--back`; stage sheet at 1440 and 1024×768 / 768×1024; every strip looked at.
