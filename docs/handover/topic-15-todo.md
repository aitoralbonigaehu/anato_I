# Topic 15 (urinary system): what is left

## State on 2026-11-21 — READ THIS FIRST

Topic 15 now meets the continuity standard set by topic 16 and kept in 17–18 (`docs/quality/3d-quality-bar.md`, "Continuity"). Nothing is committed yet.

**In place:**

- **One body.** The nine models (wall, neck block, thorax block, kidney, nephron, adrenal, pelvis, trigone, glans) are tied by one landmark each in `components/scenes/week15/sites.ts`; `tests/sites15.test.ts` (9 tests) keeps the landmarks together. If you move a model's landmark, move its site with it.
- **Every stage has `site` + `arrive`** (`Wall3D`, `Unit3D`, `Detail3D`, `Pelvis3D`). Another model: a 2.3 s flight, the cut glows, and the old model fades where it was. Same model: the pose and camera run on over 1.4 s.
- **Play order:** `ORDER` in `content/weeks/week15.ts`. `flight-sheet.mjs` and `stage-sheet.mjs` read it.
- **Tones:** `G16` (topic 16's palette) for the wall, cut faces and coelom (`uro-model.ts` `UC`).
- **Solid context:**
  - Section block: a solid body-wall band with an ectoderm rim. The neural tube, somites and aorta are opaque, because faded solids read as glass.
  - Kidney close-up: lies on the posterior wall.
  - Nephron close-up: lies on a cortex cut face.
  - Both of those grounds are larger than any camera shows, so neither reads as a card.
- **Run-on, shared code** (`components/scenes/week14/common.tsx`). A stage that runs on from a lit stage keeps the rest grey through the change: no flash to full colour and back. This applies to every topic that uses `poseStage` with a `site` (14–19).
- **Shot:**
  - All 14 forward crossings, and the changed ones again after the fixes.
  - Stage sheets of the block and kidney stages.
  - Tablet shots at 1024×768 (5 stages) and 768×1024 (3 stages).
- **Guards:** `tsc` is clean. In the topic-15-relevant guard files (sites15, visibility, anchors3d, labels, notes, content, chronology, narrated-actions, hand-over, named), 2068 of 2076 tests pass. The 8 failures are in topics 7, 8, 9 and 19 (notes captions, labels, two 5-second timeouts); none is in topic 15.

**Still open, in order:**

1. **Backward crossings** (`flight-sheet.mjs 15 <out> --back`): not shot.
2. **Cold entry into the kidney stage** (a jump straight to `sistema-biltzailea`): the fly-in shows the wall plate from an angle as a tilted slab. Played in order this never shows.
3. **Owed by the quality bar** (see its "Owed" table):
   - hollow organs cut open (lumen and wall) in the sinus, bladder and urethra side views;
   - the phallus as a solid half;
   - the ducts' ends absorbed into the bladder wall.
4. **`giltzurrun-igoera`:** the two "Gonadak" zoom pills sit close to the duct names (pre-existing).
5. **The adrenal stage** is all blue (not taught this year), so it is skipped by default. In the default play, the real crossing is ascent → sinus. Its site and arrive line are in place for "Osoa".

**Default mode skips blue and grey (2026-11-21):**

- From topic 15 on, the simulator and Eratorriak by default skip what the notes set in blue or in low-contrast grey. Beats use `plain` wording; Eratorriak shows "Aurten emandakoa", with "Osoa" giving the full version.
- The 3D scenes follow the same mode through `TaughtOnly` (`lib/sim/taught-context.ts`, provided by `Simulator`). A pose-stage step can set `plainNote`, `plainNames` and `plainDim` (`components/scenes/week14/common.tsx`); topic 15 fills these where the full note, a name's subtitle or the lit set states grey content.
- Topics 16–19 got the same pass on 2026-11-21 (39 scene steps). Steps left as they are on purpose: those whose beat has no `plain`, so that the other session's judgement that the content is taught holds (e.g. 16 hodi isurlea, 19 istmoa, 19 T1–T12), and grey words a note never states.
