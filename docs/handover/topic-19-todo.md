# Topic 19 (nervous system): what is left (2026-11-16, 20:25)

## State on 2026-11-23 — READ THIS FIRST (supersedes everything below where they disagree)

**New notes.** The owner sent new notes: `19. gaia_ Nerbio sistema (ZUZENDU GABE).pdf`, with 11 sections and no blue text. They replace the old DOCX. `content/notes-text/w19.ts` was re-extracted (34 370 characters, pinned in `tests/notes.test.ts`). There is no topic 20. The topic was rebuilt to these notes: 28 stages in the notes' order (`content/weeks/week19.ts` ORDER, TOC in `content/notes.ts`).

- **Sections 1–3** (`week19a.ts`, `week19d.ts`): orientation, the two classifications, cord basics, the reflex arc, voluntary movement, and the new stage `mugimendu-automatikoak` (3.3–3.4).
- **Sections 4–6** (`week19b.ts`): every beat re-cited to the new sentence ids. The old `kortexa` stage is gone: its content is now in sections 3.1–3.2.
- **Sections 7–11** (`week19c.ts`): bentrikuluak, likido-zefalorrakideoa, garuneko-meningeak, then new stages: erraboila (10.1), metentzefaloa (10.2), mesentzefaloa (10.3), talamoa = Dientzefaloa (10.4), hipofisia (10.4.1), bikote-kranealak (11).
- **New 3D model** `stem-model.ts` + `Stem19.tsx`, with three blocks tied to the head (`SITE19B.medulla / hind / midbrain`, `STEM_AT` in `sites-b.ts`, pinned in `tests/sites19.test.ts`):
  - the medulla: pyramids with motor drops going down, dorsal sensory paths going up, the cord below to compare;
  - the hindbrain: the tube opens into the IV ventricle (sensory moves lateral, motor stays medial), the pons, the rhombic lips fuse into the cerebellum and cover the ventricle;
  - the midbrain: 6th → 12th → 16th week, aqueduct, peduncles, substantia nigra → basal nuclei dopamine, Parkinson.
- **brain-model.ts** gained:
  - a whole-brain mirror (`whole`), used for the lateral ventricles and the dorsal/ventral views;
  - `stem` fade (cerebrum see-through);
  - the 12 cranial nerves (`nerves` 0..12; trigeminal ganglion with 3 branches; IV leaves dorsally);
  - hypophysis development (`hyp`): stomodeum, Rathke's pouch rising and detaching, infundibulum; lobes and hormone drops;
  - the pineal gland.
- **Typos in the notes are taught as KONTUZ**:
  - Schwann cells placed in the CNS;
  - substantia nigra "in the metencephalon";
  - 3rd pair called "ikusmen";
  - pia "attached to bone";
  - the pupil remark (kept "apunteen arabera").
- Eratorriak schemes (`content/eratorriak/schemes-19.ts`) rewritten from the new notes. Learning maps (`learning-maps.ts`) regrouped. Topic 19 is no longer a blue topic (`tests/eratorriak-taught.test.ts`).
- Quizzes: 34 questions (`week19a/b/c-quiz.ts`), from the notes' wording only.

**Fixed in the same pass:**
- Optional pose fields missing from the zero poses made the poses NaN, so those parts were never drawn:
  - `face`, `plex`, `cbl` in `BP0`: the face glands and ganglia, the visceral plexuses, the cerebellar circuit;
  - `ends` in `CP0`: the reflex arc's skin.
  - Every optional pose field now has a 0 default.
- Frame pills:
  - the brain stages use brain axes (`BRAIN_AXES` in Brain19: Goikoa (dortsala) / Behekoa (bentrala) / Aurrekoa (rostrala) / Atzekoa (okzipitala)), as notes 1.1 says;
  - the block-frame models (cord, section, medulla, hind, midbrain) use `BLOCK_AXES19` (common.tsx), so turned views name dorsal correctly.
- The sulcus limitans is drawn in the hindbrain (it was only a point).
- The stomodeum stays while the pouch detaches.
- Visibility for topic 19 is all green:
  - names added where the text names a structure;
  - `MENTION_ONLY` / `GONE` entries with reasons for "usaimen erraboila", erronbentzefaloa, the lips → cerebellum, and kortex motorra out of frame.

- Name dots (`tests/anchors3d`): all 28 topic 19 stages pass. Topic 19's `HOVER_KNOWN` went from 26 entries to 2: barneko-mintz and puntzioa-epidurala, both kept as they were. How:
  - names got `p` points found on their own mesh (pick + rim + 9 px spacing, both sampled frames);
  - the flexures are bends, not pieces: the wall stretch at each bend carries the flexure's name as a group (neural-model `flexAt`), and the dots sit on the wall;
  - the chromaffin cells reach the adrenal gland's cut face;
  - the fluid layers (brain `sub`, cord `csf`) are at 0.5 opacity, so they are solid for the pointer. Below 0.5 is glass, and the pointer went through to the pia;
  - the ventricles view uses glass 0.86, so the tissue is under 0.5 and the pointer reaches the casts;
  - the voluntary path turns the cerebrum to glass while the signal rises (`glass` in `BodyPose`, 0 in `BP0`), so the thalamus synapse shows;
  - nerve III in the body model ran inside the frontal lobe. It now runs under it, into the orbit;
  - IX is a little thicker (r 0.02);
  - the view from below names some pairs at `<id>:below` points (`CN_BELOW`). These are set only once the nerve has grown.

**Open:**
- Tablet shots (768/1024) and flight sheets for the new stem stages.
- Kimu class (Klasea) for topic 19 not written.
- `inPreparation` still set.
- Already failing before this work and unrelated: notes test topic 7 (`w7/2/p8/s1` outside 2.1) and the 7/8 figure caption checks.
- Nothing is committed.


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


## State on 2026-11-17, second session — READ THIS FIRST (supersedes the build plan below where they disagree)

**Topic 19 is built and registered**: all 23 stages exist in the notes' order, `/astea/19` answers 200, `inPreparation: true` is still set (remove it only when the finish line below is met for every stage). Six models instead of the plan's eight ("one body, as few models as possible"):

| Model (file) | Site | Stages |
|---|---|---|
| `body-model.ts` (root): adult body cut coronally through the cord, back half as ground; brain in the skull's back half, cord with its enlargements, 31 pairs of spinal nerves through their foramina with ganglia, plexuses (arm nerves, intercostals, femoral, sciatic), cauda equina, cranial nerves, vagus; autonomic layer (chain T1–L2, splanchnic branches, pelvic S2–S4, organs); the brain's three planes; the axes; the voluntary path as a growing signal | `SITE19.body` | 1–4, 9 |
| `cord-model.ts`: block of the cord at T6, grey H on the cut face (horns tinted by function, lateral horns), white with tracts, ependyma, rootlets → roots, ganglion, spinal nerve and its branches; dura / arachnoid / pia as stepped sleeves, subarachnoid fluid, epidural fat, vertebral canal; reflex arc on the cranial face | `SITE19.cord` | 5, 6, 8, 10 |
| `section-model.ts`: the embryo's back cut across, at the cord block's size and place; the plate curls into the tube (ribbon), crest plate → two lumps → spinal ganglia; derivatives (chain, pre-aortic, chromaffin in the adrenal medulla, melanocytes, Schwann cells); then polar bands round the canal morph 4th week → 5th week (neuroepithelium, mantle, marginal, limiting membranes, diamond lumen, alar/basal/roof/floor, sulcus limitans) → 3rd month (H, white, canal, fissures, lateral horns) | `SITE19B.section` (on the cord canal) | 11–14 |
| `spine-model.ts`: lower spine from behind, arches removed; the column lengthens while the cord stays, conus left at L1–L2, roots to their own foramina, cauda equina, filum, dural sac, epidural fat; puncture and epidural needles | `SITE19B.spine` (conus) | 15–16 |
| `neural-model.ts`: one surface whose sections curl by the section model's rule; zips from the middle (caudal neuropore first), 3 then 5 vesicles (isthmus band), cephalic / cervical / pontine flexures, vesicle colours | `SITE19B.neural` (diencephalon on the thalamus) | 17–19 |
| `brain-model.ts` (geometry slot `brain19`, registered in `geo-registry.ts`): head cut down the middle, right half from the left; skull, dura, arachnoid, subarachnoid fluid, pia as shells round the brain; hemisphere, thalamus (wall of the 3rd ventricle), hypothalamus, epithalamus, midbrain, pons, cerebellum, medulla, cord; ventricles as five casts (lateral + Monro, 3rd, aqueduct, 4th with the apertures, canal); choroid plexuses; CSF flow as streamed drops; sensory / motor / smell paths | `SITE19.head` (thalamus) | 7, 20–23 |

Content: `week19a.ts` (1–4, 9), `week19d.ts` (5, 6, 8, 10), `week19b.ts` (11–19), `week19c.ts` (7, 20–23); structures in `week19a/b/c-structures.ts` (ids shared with earlier topics reused); 13 `ask` checks. Every beat cites the notes; KONTUZ lines where the notes and textbooks differ (neuropores 25/28, the dural sac "between dura and arachnoid", "kaudala ez deitu", "ez esan I. eta II. bentrikuluak", epithalamus not in the figure, 4th week tube not cord, 3rd month no plates).

**Teacher's remarks removed from the app's notes text**: `w19.ts` carried three ("HOBETO AZALDUKO DU HURRENGO URTEAN", "berak ez erabili", "berak ez galdetu" ×2). They are stripped in `w19.ts` and by `REMARKS` in `scripts/notes/extract.py` (a re-extraction keeps them out); `tests/notes.test.ts` and `manifest.json` pins updated (length 32187).

**Tests**: `tests/sites19.test.ts` (6 cases: each landmark on its parent's, similarity, sides kept, conus between L1 and L2); topic 19's cases of `visibility`, `anchors3d`, `labels`, `content`, `notes` pass (115 + content); the beat-count pin is 1506.

### Seen on screen

- **Every stage** at 1440 (0.3 / 0.65 / 0.95), and at 1024×768 and 768×1024 (0.6): all 23 render, names and keys fit at both tablet sizes.
- **All 22 forward crossings** (`flight-sheet`, `--dwell 8000`): glides on one model, flights between models, no cut, no spinner. The adult cord's section gives way to the embryo's in place (10 → 11); the neural tube flies into the brain at the thalamus (19 → 20).
- **Load**: the brain geometry is ≈ 264 000 triangles (shells thickened and coarsened; the thin casts keep a 0.012 grid). In the software renderer the first frame after crossing into the brain takes ≈ 18 s (GPU upload); `flight-sheet.mjs` screenshots now wait up to 120 s. A cold link straight into `meningeak` crossed within ~8 s shows the spinner for ≈ 3 s (the prewarm starts ≈ 6 s after the page loads); a student watching the stage never sees it.

### Changed but NOT yet seen on screen

- The aqueduct / canal casts' finer grid (guard-tested, not re-shot).

### Owed for topic 19 (highest value first)

1. **Figures**: the 17 DOCX figures were not available in this session (the notes' DOCX/PDF live on the owner's computer). Check every step against its figure (`topic-19-plan.md` table) and add the figure names the notes use.
2. **`--back` flight sheets** (none shot).
3. **Brain model polish**: midbrain, pons, cerebellum and medulla read as dark blocky lumps on the cut (`brain-model.ts` PARTS): sculpt them (folia on the cerebellum's cut, the pons' bulge) and give them lighter tones; the hemisphere's medial face is plain.
4. **Neural tube look**: thin and dark-blue on the dark ground in the dorsal views (`plaka-neurala`); closer cameras or a lighter tube tone; the crest edge stripes; the vesicles' shapes (telencephalon's paired bulges) are schematic.
5. **Run-on hygiene**: `ornomuin-geruzak` step 1 fades the crest derivatives over `[0, 0.8]` (it also thickens the wall); split the step or fade the derivatives in the model by `mature`.
6. At 1024×768 a second orientation box shows briefly at the bottom left on `gandor-neurala` and `kortexa` (seen at 0.6): check whether it is the cold-entry overlay.
7. **Body model**: small in the whole-body frames; organs are plain blobs; the cortex areas on the body's brain are markers.
8. **Section model**: context (somites, notochord, aorta, adrenal) is plain; the crest lumps are blobs.
9. Plates for `/fitxak`, Kimu class: later. Remove `inPreparation: true` from `week19.ts` once 1–3 are done.

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
