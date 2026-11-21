# Topic 16 (genital system): what is left (2026-11-16, late evening)

## State on 2026-11-21 — READ THIS FIRST

A model-polish pass for the 17–18 standard ("better models", "one skin") is done. Nothing is committed.

- **External genitalia (`external-model.ts`): one skin.** The perineal skin is one continuous `fieldSurface` that runs on past the frame and curves away, so the body's caudal end reads as a body and no disc floats in the dark.
  - The swellings and the perineum are regions of that skin: they rise out of it with no seam.
  - Unlit, they are drawn exactly like the skin round them.
  - The three stages frame on the step's subject (`fit: { fill: 0.8, limits: [0.7, 1.25] }`, not the whole ground).
- **Shared renderer change (`Stage3D.tsx` `grounded`).** A ground item that has an id looks like the plain ground while it is not put forward; when lit, it glows as before.
- **Shared run-on change (`week14/common.tsx`).** A stage that runs on from a lit stage keeps the rest grey through the change.
- **Duct views (`duct-model.ts`): solid organs.**
  - Unlit solids stay opaque and grey; they no longer fade to glass. Only the parts that are see-through on purpose fade further: the bladder, the prostate and the broad ligament.
  - The gonads are solid and lighter on their shaded side.
  - The epididymis is a comma-shaped body (head, body, tail) on the testis's lateral border, its surface a fine coiled duct.
  - The close-up cameras (`LEFTSIDE`, yaw 44–50) turn to the lateral border, where the efferent ductules, the epididymis, the epoophoron and the paroophoron lie.
- **Shot:**
  - The external and duct stages at 1440, at 1024×768 and at 768×1024.
  - Six crossings with `--dwell 5000`: desberdindu-gabea, barrabila, hiloa, jaisketa-emeak, kanpo-genitalak, kanpo-genitalak-emeak. All read as one move.

**Still open:**

1. **Backward crossings** with a `--back` that opens at about 30 % (see below).
2. **Figure parity** with the official figure file (item 4 below).
3. **`desberdindu-gabea → muller-hodia`:** at about 0.3 of the flight the slab is still alone; the wall fades in by 0.6.
4. **`semen-bidea`:** the bladder is a translucent balloon in front of the vesicles. A view from behind would teach "the vesicles on its back wall" better.
5. **The female vestibule** is a dark pill; it could be a shallow cleft in the skin field.

Written for whoever picks topic 16 up next. Nothing here is committed yet. Read first: `docs/quality/3d-quality-bar.md` (point 8, "Continuity", "QA: the flight sheet", "Pitfalls").

## Production standard 2026-11: what topic 16 still misses

Topic 16 set the continuity standard; the rules added since ("Production standard 2026-11" in `docs/quality/3d-quality-bar.md`) were learnt on 17 and 18 and are not yet applied here:

- [ ] **Flight sheets with `--dwell 5000`**, all 18 crossings forwards and back (the strips above were shot without it; a crossing that showed a frozen or empty first frame may have been the loading spinner).
- [ ] **Heavy geometry:** check whether any topic-16 model builds slowly enough to show "3D eredua prestatzen…" on first arrival (cold browser, first visit); if so, register it in `lib/three-d/geo-registry.ts` and list its keys in the scene's static `.geo` (as `Skull17`, `Nerves17`, `Arches17` do).
- [ ] **Run-on hygiene:** for every run-on, what the previous stage showed and this one drops should fade within the first fifth of step 1.
- [ ] **QA order:** a whole-topic stage sheet at 0.5 / 0.95, each stage graded in the table, then tablet sizes 1024x768 and 768x1024 (none shot).
- [ ] **Plan file shape:** add a dated "State on <date> — READ THIS FIRST" section at the top when work resumes.

## What is in place (built, partly verified)

- **One body, one camera.** All 19 stages have `site` + `arrive` (`components/scenes/week16/sites.ts`); `tests/sites16.test.ts` 6/6 pass.
  - Between models: camera flight (`flyCamera`, pull-back only for long travel), old model fades in place, cut drawn as an outline + 10 % sheet (`frameMesh`).
  - Same model: glide + pose run-on over `RUN_ON_MS` (1400 ms); booleans, also ones the next stage drops, flip at mid-run; names wait during long turns.
  - Cold entry: `WHERE16` fly-in per site (`components/scenes/week16/common.tsx`).
- **Tones.** `components/scenes/week16/tones.ts` (`G16`), used by the wall (topic-15 uro-model via `tone`), gonad, ducts, broad, descent models. The old ground was near black on screen (hex^2.2).
- **`Item3.calm`** on the external-genitalia skin parts (unlit swellings step back without going dark).
- **`Step.half: 1`** on six close-up steps in `Ducts16.tsx` (frame one side of the paired ducts).
- **Verified on strips:** all 18 forward crossings before the last fixes; seven re-shot after them (desberdindu-gabea, semen-bidea, bagina, lotailu-zabala ×2, baginaren-jatorria, jaisketa-arrak) read as one move. Lighter tones checked on montages.

## To do, in this order

**Seen on screen this evening (1440, quiet machine):**

- `half` close-ups (`hiloa`, `hodi-genitalak-arrak`, `hodi-genitalak-emeak`): read well; efferent ductules, epididymis, epoophoron and paroophoron are legible. Sheet flags to look at again after any camera change: `hiloa` 0.35 edge, `hodi-genitalak-arrak` 0.35 small subject, 0.65 edge.
- `calm` (`kanpo-genitalak*`): the lit swelling stands out; the unlit ones are a dull brown that still reads a little like patches (borderline, see polish list).
- **All 18 forward crossings** read as one camera move (cut frame appears on the right structure, old model fades in place, no empty frame, no name before its structure).
- **Backwards**: all 18 shot; the ones looked at (`muller-hodia`, `kanpo-genitalak`) are a move too. Caveat: `flight-sheet.mjs --back` opens the stage at 2 %, where the cold-entry whole embryo is still on screen, so a backward strip shows "embryo → previous stage", not "mid-stage → previous stage". To test the real case, make `--back` open at ~30 % (kit request).

1. ~~Shoot and look at `calm` and `half`~~ done, above.
2. ~~Forward and backward crossings~~ done, above (with the `--back` caveat).
3. **Tablet sizes.** Stage sheet at 1024×768 and 768×1024 for every stage (check `stage-sheet.mjs` flags for the viewport first). The arrival line and the names must not collide with the shell chrome.
4. **Figure parity with the official figure file** (`C:\Users\aitor\Downloads\Sistema genitala_irudiak_26-27.pdf`, 6 pages). Not started; the method and how plates work are in `docs/handover/topic-16-figure-parity.md`.
   - Render the pages (PyMuPDF, `python -I`), list each printed name, match it to a stage/step, record missing or differently spelled names and missing structures (descent wall layers, epigenital/paragenital tubules, …).
   - Fix names in the week-16 scene labels / `content/weeks/week16-structures.ts`; add missing structures to the models.
   - Add topic 16's plates: new `content/plates-16.ts`, one import + spread in `content/plates.ts`, `{ week: 16 }` in `PLATE_GROUPS`; mark priorities `key: true` (never say where priorities come from). Run `tests/plates.test.tsx`.
5. **Model polish** (the owner asked for better models). Seen this evening, worst first:
   - **External genitalia** (`external-model.ts`): the weakest model of the topic. A skin disc with a faceted rim floating in the void; the parts are separate primitives with dark outlines; the anus is a grey ball. Needs a real perineum (part of the body, as the arrival flight promises) and swellings that grow out of one skin.
   - **Gonad body in the duct views** (`duct-model.ts`): testis and ovary read near black even when their label is lit (hex^2.2 again: pick the tone by screenshot pixels).
   - **Epididymis**: a thick purple spring; should be a fine coiled duct against the testis.
   - **`calm` swellings**: unlit ones still a dull brown patch.
   - `desberdindu-gabea → muller-hodia` at mid-flight: the section slab is alone on black for a moment before the wall fades in (bring the wall in earlier).
   - Then look at every other stage at 1440 close up for faceting, flat sheets, seams, parts too small to see.
6. **Guards:** `npx tsc --noEmit -p .`, then the full `npx vitest run` (≈8 min). See "Test status" at the end.

## Notes for the next one

- Colours: choose grounds by screenshot pixels, never by hex (the 3D layer shows about hex^2.2).
- Tests mock `Stage3D` and call children with two args: any new child argument needs a default.
- Bash heredocs with apostrophes break here: write a Python edit script to the scratchpad (keep CRLF).

## Test status
(see the end of `docs/handover/remaining-work.md`)
