# Remaining work, topics 16–19 (2026-11-16, end of day)

Start here. On 2026-11-16 the topic-16 continuity standard ("one body, one camera") was built, and twelve agents started bringing topics 17–18 up to it and building topic 19. All work stopped at 20:00 on the owner's instruction. The owner then asked for this plan of everything still missing, so that someone else can finish it later. **Nothing from today is committed.**

| Topic | Plan | State in one line |
|---|---|---|
| 16 genital system | [topic-16-todo.md](topic-16-todo.md) | Built and mostly verified on strips; left: skin/close-up shots, backward crossings, tablet, figure parity, plates, model polish |
| 17 head and neck I | [topic-17-todo.md](topic-17-todo.md) | Sites/arrive lines on 17 of 22 stages, none seen on screen; notes re-extracted, content re-citing half-done (notes test fails); five arrive lines assume the old order; muscles and arch map untouched |
| 18 head and neck II | [topic-18-todo.md](topic-18-todo.md) | Sites/arrive lines on 25 of 29 stages, none seen on screen; ear pouches moved onto the root; tooth model rewritten and never rendered; clefts and neck untouched |
| 19 nervous system | [topic-19-todo.md](topic-19-todo.md) | Notes text, plan, palette, landmarks, empty stubs; no stage or model; not registered (`/astea/19` 404) |

Other files:
- Shared brief and the standard as a recipe: [topics-17-19-brief.md](topics-17-19-brief.md); the bar: `docs/quality/3d-quality-bar.md`.
- Lead-owned changes the agents needed: [kit-requests.md](kit-requests.md).
- Topic notes: `topic-17-notes-diff.md`, `topic-17-sites.md`, `topic-18-sites.md`, `topic-19-plan.md`, `topic-19-prep-b.md`, `topic-19-prep-c.md`, `topic-16-figure-parity.md`, `topic-17-18-status.md` (first pass, 2026-11-09).

## Suggested order

1. Topic 16 items 1–3 (shots only, quick), so the standard everything copies is proven.
2. Topic 17 section A (content re-citing): it makes the notes test pass again.
3. One flight-sheet pass over topics 17 and 18 on a quiet machine (one shooter at a time), fixing order-dependent arrive lines and run-ons; render the new tooth model.
4. The untouched areas: 17 muscles + arch map, 18 clefts + neck.
5. Topic 19 Phase 1, then its three blocks.

Lesson from today: one dev server cannot serve twelve agents (pages took 30–50 s, every page returned 500 whenever one file was half-saved or imported a missing file). Shoot strips in batches with few writers, and never import a file before it exists.

## State of the tree at the stop (checked by the lead, 20:00–20:30)

- `npx tsc --noEmit -p .`: clean.
- Pages: `/`, `/astea/7`, `/astea/16`, `/astea/17`, `/astea/18`, `/fitxak` return 200; `/astea/19` 404 (topic not registered yet, on purpose).
- Site tests: `sites16`, `sites17`, `sites17c`, `sites18`, `sites18b`, `sites18c`: 32/32 pass.
- No probe files left in `tests/`; the agents' leftover headless shooters were stopped.

### Full test suite (`npx vitest run`)

Run ended 2026-11-16 ≈20:35: **11 failed, 2883 passed, 6 skipped** (82 files, 6 with failures).

New today, all topic 17, all covered by `topic-17-todo.md`:
- `notes.test.ts` "gives every beat real anchors…" and "keeps anchors in the stage sections…": `week17b`–`week17i` beats still cite the old note ids (section A1).
- `chronology.test.ts` "cite notes sentences that exist": `content/chronology.ts` ≈l.195 cites old topic-17 ids (A6).
- `visibility.test.tsx` "errai-kraneoa: urrats bakoitzak aipatzen duena ikusten da": the stage's text was rewritten to §1.2 "Jatorri ezberdinak" and names structures the scene does not show yet (B, stage 7).
- `anchors3d.test.ts` and `content.test.tsx` on `lehen-arkua-luzapenak`: 5 s timeouts on the arch-head stages (C5; at the earlier run it was `trigeminoa`, so it moves with machine load).

Old, failing before today: `notes` topic 7 figure captions and topics 8–9 linked captions (2), `labels` topic 9 `somitomeroak-burua` / `okzipitalak` (2), `visibility` topic 7 `pleura-perikardioa` step text (1).

Log: session scratchpad `vitest2.log` (may be gone).

## Late-evening session, 2026-11-16 (lead)

- **Topic 16:** proof shots read; all 18 forward crossings are one camera move; `half` and `calm` look right. Open list (model polish, tablet sizes, figure parity) in `topic-16-todo.md`.
- **Topic 17:** content re-cited and scenes aligned to the corrected notes; the sagittal bones half rebuilt (first modelling pass). What is owed is at the top of `topic-17-todo.md`.
- **Topics 18 and 19:** not touched in this session.
- **Tests after this session:** `tsc` clean. `notes`, `chronology`, `visibility`, `anchors3d`, `labels`, `content`, `sites16/17/17c/18/18b/18c` pass for topics 16–18. Failing, all in older topics and not caused by this work (their files are unmodified here): `notes.test.ts` `7/peritoneo-barrunbea/6` cites `w7/2/p8/s1` outside its section, three topic-7 figure captions, the topic 8–9 linked captions; `labels.test.tsx` topic 9 `somitomeroak-burua / begia` and `okzipitalak / taula`; `visibility.test.tsx` topic 7 `pleura-perikardioa` step 8 (`errai-orria`).
- **Sheet scripts:** `stage-sheet.mjs` and `flight-sheet.mjs` now follow a topic's `ORDER` (kit request done).

## Session of 2026-11-17 (lead)

- **Topic 17:** every stage sited, all 21 crossings shot forwards and read, closing map now 3D, origins stage and larynx rebuilt, background geometry prewarm in the shell. What is owed is at the top of `topic-17-todo.md` ("State on 2026-11-17").
- **Topic 18:** all 29 stages shot, all 28 forward crossings are flights or run-ons. The clefts and the glands' descent now run on the root pharynx model (`pharynx-d.ts`); `tiroidea-heldua` has a site (`SITE18B.neck`); the face skin is being rebuilt as a flow (second pass not yet seen). What is owed is at the top of `topic-18-todo.md` ("State on 2026-11-17").
- **Topic 19:** not started; Phase 1 in `topic-19-todo.md` is next.
- **Order for the next session:** (1) shoot the three unseen topic-18 changes and finish the face; (2) the rest of topic 18's owed list; (3) topic 17's owed list (`--back`, tablet, muscle head polish); (4) topic 19 Phase 1. The prompt to start that session is `docs/handover/next-agent-prompt.md`.

## Session of 2026-11-17, second session

- **Topic 18: finish line reached** (details at the top of `topic-18-todo.md`). Face skin without folds (mirrored flow), `tiroidea-heldua` rebuilt on topic 17's larynx, the U round the cartilages, palate tones, `koanak` framing, three `ask` checks, dead code removed; all 28 crossings shot forwards and `--back`, every stage at 1024×768 and 768×1024. Left: plain teeth, the choana's recess, face polish, `G18` measured.
- **Topic 19: built and registered** (all 23 stages, six models; details at the top of `topic-19-todo.md`). Teacher's remarks stripped from the notes text (`extract.py` `REMARKS`). Left: figure parity (the DOCX figures were not reachable from this session), flight sheets, tablet sizes, neural-tube and body polish, then removing `inPreparation`.
- **Topic 17**: untouched in this session except dead code (`ArchMap17.tsx`, `Muscles4`) and an additive export in `larynx-model.ts` (`larynxSkeleton`, `LARYNX_SDF`, `LARYNX_DIM`) used by topic 18's neck. Its owed list (`--back`, tablet, muscle head) stands.
- **Tests**: `tsc` clean; guard set = only the six old topic 7–9 failures; beat-count pin 1506; `tests/sites19.test.ts` new.
- **Dev server note**: in this container `next dev` sometimes exits after its upgrade notice on the first start; start it again (it continues the second time).
