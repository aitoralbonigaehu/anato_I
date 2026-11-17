# Topic 18 (head and neck II: pharynx, glands, tongue, thyroid, face, palate, teeth): what is left (2026-11-16, 20:20)

Written for whoever picks topic 18 up next, from the final reports of the four agents (18-A root/pharynx/thyroid/face, 18-B ear pouches/tongue, 18-C palate/teeth, 18-D clefts/neck), who all stopped at 20:00, and from the lead's checks after the stop. **Nothing in this topic's new work has been seen on screen**: the dev server was overloaded and for a while every page returned 500 (a registry import of a then-missing `week19`), so no flight or stage sheet of the new work came out. Nothing is committed.

## Production standard 2026-11: what topic 18 still misses

Rules in `docs/quality/3d-quality-bar.md`, section "Production standard 2026-11" (most of them were learnt on this topic). Met: one root model for stages 1–9, sites measured and tested (including the new `SITE18B.neck`), every forward crossing a flight or run-on, whole-topic triage done. Still missing:

- [ ] Face skin with no folds on the visible side (fold probe at weeks 6, 8, 10, 12), then seen on screen.
- [ ] Run-on hygiene in `guruinen-jaisketa` step 1 (needle and fluid).
- [ ] `--back` flight sheets and tablet sizes.
- [ ] Tones `G18` measured on screen.

## State on 2026-11-17 (lead; seen on screen at 1440) — READ THIS FIRST, it supersedes sections A–F below where they disagree

### Done and looked at

- **Every one of the 29 stages has been shot** (stage sheet at 0.5 and 0.95, session scratchpad `t18/all0`) and **every one of the 28 forward crossings is a camera flight or a run-on** (flight sheets `f18/a`, `f18/b`, shot with `--dwell 5000`). No crossing is a cut and no crossing shows the "3D eredua prestatzen…" spinner (the shell now prewarms the neighbouring stages' geometry: `components/shell/Simulator.tsx` + `warmGeo`).
- **Section D is done in a different way than D1 planned: the clefts and the glands' descent now run on the root pharynx model itself**, so stages 6 → 7 → 8 → 9 are run-ons on one model (no `sites-d.ts`, no `earModel` / `sinusModel` / neck block for them any more):
  - new `components/scenes/week18/pharynx-d.ts` (`pharynxD(pose, o)` wraps `pharynxB`: groups `kanpoko-entzumen-hodia → lehen-arraildura`, `tiroide-guruina → tiroide-lobuluak`, thyroid/cricoid → `laringeko-kartilagoak`; mirrors the right-side name points of clefts/arches/`goragune-epikardikoa` to the left; fades the fold items `fm|fe|fi|fs|sin` with the peel of their side);
  - `Clefts18.tsx`: `specE` (`lehen-arraildura`: pose `END_POUCH4` exported from `Pharynx18.tsx`, the first cleft meets the first pouch, eardrum's three layers with `opts.layers`) and `specS` (`beste-arraildurak`: arch II flap grows down, cervical sinus, closes; persistent sinus with fluid and needle). Both `site: SITE18.pharynx`, `where: WHERE18B.pharynx`, `arrive`. Exports `FirstCleft18`, `S_EAR`, `Sinus18`, `S_SINUS`, `END_SINUS`;
  - `Neck18.tsx` `specDown` (`guruinen-jaisketa`) on `pharynxD`, starting at `END_SINUS`: both walls peeled, the third/fourth pouch buds go down, cross, thyroid U round the laryngeal cartilages;
  - `content/weeks/week18g.ts` (`SEC`) and `week18i.ts` (`DESCENT`) updated to the new step marks.
- **`tiroidea-heldua` has a site:** `SITE18B.neck` in `sites-b.ts` (`NECK_LOBES` in the neck model on `ROOT_LOBES` = where the descent leaves the lobes on the root, scale 1.35), `arrive` line; test added to `tests/sites18b.test.ts` (10/10 pass). The thyroid sagittal stage flies into it with the cut plane (strip `f18/a/tiroidea-jaisketa.png`). It still uses `neckModel` with `MATURE0 = { ...NP0, down: 1, sup: 1, adult: 1 }`.
- **A2 done:** `Pharynx18.tsx` `P_CAST` keeps `p1, cav, ossicles, tonsil, lymph` at 1, so `hirugarren-poltsa` no longer shrinks the ear structures away. Its `arrive` line was reworded (no more "Faringera itzuli gara").
- **E (labels on strips):** the sheet scripts follow `ORDER`; the "→" names on the strips are right.
- **Face skin (in progress, see "Owed" 1):** `face-model.ts` no longer moves the skin in one jump from week 5 to the target age (that folded the skin over itself: the black creases, stripes and smeared colours on `aurpegi-fusioa`). The handles now carry the chart as a **flow in steps of 1/8 week** (`carry`, `flowAt`, `HOLD`, `press`); `pointOf` (name points) walks the same steps. A fold probe (count triangles whose face normal disagrees with the vertex normals) went from ~1 300 folded triangles at week 12 to 0 at week 8 and ~300 at week 12 (left: the cheek/ear side of `max`, `mand`, `arch2`, the head's back cap).

### Changed but NOT yet seen on screen (shoot these first)

1. `face-model.ts` second pass (`HOLD = 0.06`, `DT = 0.125`, lazy `flowAt`): the first pass (`DT = 0.25`, plain share) was shot (`t18/face1`) and the front of the face was clean, but dark pleats remained on the side of the head at week 12 and the medial rims did not yet look fused. The second pass has not been shot. Stage sheet `aurpegia-hasiera,sudur-plakodak,aurpegi-fusioa,ildo-nasolagrimala --at 0.2,0.45,0.7,0.97`, plus a 768×1024 shot. Check also that the playback stays smooth: the first time each age is played, `flowAt` computes the missing steps (37k grid vertices × 13 handles per step).
2. `beste-arraildurak` cameras pulled back (`WALL(...)` distances +1.4: the persistent sinus and needle were cut off at the left).
3. `guruinen-jaisketa` last step: camera `down(8.4, -3.7, 230, 24)` (from behind and the side, to show that the thyroid U wraps the cartilages from the front) and the cartilage rings thicker (`r0/r1 0.13` in `pharynx-model.ts` ring()). Before the change, the U read as two red ovals beside the tube.

### Owed for topic 18 (highest value first)

1. **Face (stages 17–20):** finish the skin above. If the side pleats remain: they come from handles (`ear`, `max`, `corner`) moving far relative to `SIG2`; try a wider bell for those handles only, or more steps for weeks 8–12. Then the D-level polish: make the medial rims meet visibly (the midline `press`), the little human face at week 12 (`relief()` "little human face" block), skin regions `calm: true`. The age rewind 12 → 7 into `ildo-nasolagrimala` is announced by its `arrive` and reads acceptably on the strip.
2. **`tiroidea-heldua` model:** the neck model is the weakest model left in the topic: lobes are flat dark maroon sausages, thymus two yellow horns, cartilages grey blocks. Options: (a) rebuild `neck-model.ts`'s adult mode with organic shapes and `G18` tones, or (b) tell the stage on `thyroid-model`'s adult mode. Keep `SITE18B.neck` (and its test) whatever model you use, or re-measure it.
3. **`koanak`** (stage 25): the middle steps are weak (dark slab with black blobs; the membrane breaking is hard to read). Make the pit a visible hollow tube, the membrane a thin lit sheet that tears, the choana a lit opening. Its flight in from `aho-sabai-akatsak` ends in a huge brown close-up at 0.8: start the camera further.
4. **Teeth (26–29):** `txano-kanpai` and `hortzaren-geruzak` render as flat blocks with dotted mesenchyme; acceptable but plain. Give the enamel organ thickness and the cap/bell real 3D curvature; check `esne-behin-betiko` jaws.
5. **Run-on hygiene:** in `guruinen-jaisketa` step 1 the needle and fluid from `beste-arraildurak` linger during the first second; fade them in `run: [0, 0.2]` instead of `[0.04, 0.55]`.
6. **`laugarren-poltsa` cameras (A3)** look fine on the strip; recheck at 1024×768.
7. **Tones `G18`** not measured; the thyroid model still uses its own `CUT_HEAD`.
8. **`--back` flight sheets** (none shot) and **tablet sizes** (none shot): every stage at 1024×768 and 768×1024.
9. **`ask` checks** (B3): `lehen-poltsa` (ossicles), `lehen-arraildura` (eardrum's three layers; beat `S_EAR[3]`), `guruinen-jaisketa` (crossing of the parathyroids; beat in `week18i.ts`).
10. **Dead code** to delete once the strips above are accepted: `components/scenes/week18/ear-model.ts` (imported by nothing), `earModel` and `sinusModel` in `cleft-model.ts` (imported by nothing; `cleft-model.ts` itself is still imported by topic 17's `sites.ts` and `Clefts18.tsx`, keep the rest), and in topic 17 `ArchMap17.tsx`, `Muscles4` / `SM4`.
11. Figure parity, Kimu class: as in section E below.

### Tests at the stop

Guard run of 2026-11-17 (the 11-file set in `next-agent-prompt.md`): `tsc` clean; 1664 passed, 15 failed. Of the 15:
- 3 were topic 18 and are fixed (all 198 topic-18 cases of `content`, `visibility`, `labels`, `anchors3d`, `sites18*` now pass): the C cells drawn in `guruinen-jaisketa` had no structure (added `c-zelulak` to `week18i-structures.ts`, from the notes w18/1.1.4/p7/s3); `guruinen-jaisketa` step 1 says "Faringea atzetik ikusten ari gara" (the gut tube in `pharynx-d.ts` now answers to `faringea`, and step 1 names it); `beste-arraildurak` step 4 says the sinus disappears (`MENTION_ONLY` exception in `tests/visibility.test.tsx`).
- 6 were timeouts under load (topic 17 `labels` `hezurtze-motak`, `buru-ganga`, `lehen-arkua-kartilagoak`; topic 10 `anchors3d` `bihotz-atalak`, `bihotz-lakioa`, `septum-primum`): all pass when run alone. Run the guard set on a quiet machine, with nothing else running.
- 6 are the old topic 7–9 failures listed in `remaining-work.md`.

Read first:
- `docs/handover/topics-17-19-brief.md` (the shared brief).
- `docs/quality/3d-quality-bar.md` (point 8, "Continuity", flight sheet, pitfalls).
- `docs/handover/topic-18-sites.md` (root, axes, landmarks, `tie`/`onSite`; 18-B's notes to 18-D and 18-A at its end).
- `docs/handover/topic-17-18-status.md` (gaps left by the first pass).

## Where things stand (checked by the lead at 20:00)

- `npx tsc --noEmit -p .` clean. `/astea/18` returns 200.
- `tests/sites18.test.ts` 5/5, `tests/sites18b.test.ts` 8/8, `tests/sites18c.test.ts` 7/7 pass.
- The notes for 18 were not re-extracted: the copy given today has the same size as the file the first pass used. Confirm with `python scripts/notes/extract.py --check --weeks 18` (17-B's run reported weeks 17 and 18 unchanged).

## The shared body

- Root: `pharynx-model` at `PH0` (`components/scenes/week18/sites.ts`, `ROOT18`, x left, y cranial, z ventral).
- `SITE18.pharynx` (root), `thyroid` (tied at the foramen caecum, 0.42, sagittal cut), `face` (tied at the buccopharyngeal membrane, 0.62).
- `SITE18B.tongue` (`sites-b.ts`: tongue floor at the foramen caecum, 0.6, tilted −30° about x).
- `sites-c.ts`: `palate` (on `face`, front ridge behind the upper lip, 2.5), `choana` (palate frame moved x = 0.45, cut x = 0), `tooth` (on the choana model's lower gum, 4, turned −90° about y), `jaw` (gum to gum with the tooth block, 0.5).
- **Missing:** sites for the clefts (`earModel`, `sinusModel` in `cleft-model.ts`) and the neck (`neck-model.ts`) → section D.
- Tones: `components/scenes/week18/tones.ts` (`G18`: cut, wall, cavity from topic 16's `G16`; skin `#f0cdb9` new). Not measured on screen yet; only the tongue model uses it.

## Stage table (play order = `ORDER` in `content/weeks/week18.ts`)

| # | Stage | Scene (file) | Site | State |
|---|---|---|---|---|
| 1 | sarrera | `Intro18` (Pharynx18) | pharynx | site + arrive + where, unseen |
| 2 | arraildurak-poltsak | `Clefts18` (Pharynx18) | pharynx | idem |
| 3 | lehen-poltsa | `FirstPouch18` (Ear18) | pharynx | **moved from the flat ear block onto the root** (18-B), unseen |
| 4 | bigarren-poltsa | `SecondPouch18` (Ear18) | pharynx | idem |
| 5 | hirugarren-poltsa | `Pouch3` (Pharynx18) | pharynx | site; **start pose must take over the ear stages' end** (A2) |
| 6 | laugarren-poltsa | `Pouch4` (Pharynx18) | pharynx | site; start pose fixed to `endPose(spec3)`; cameras not re-checked |
| 7 | lehen-arraildura | `FirstCleft18` (Clefts18, `earModel`) | none | nothing done (18-D) |
| 8 | beste-arraildurak | `Sinus18` (Clefts18, `sinusModel`) | none | nothing done |
| 9 | guruinen-jaisketa | `GlandDescent18` (Neck18) | none | nothing done |
| 10 | mihiaren-gorputza | `TongueBody18` (Tongue18) | tongue | site + arrive + where; step 4 cut off at the top (before-shot) |
| 11 | mihiaren-sustraia | `TongueRoot18` (Tongue18) | tongue | idem |
| 12 | mihiaren-inerbazioa | `TongueNerves18` (Tongue18) | tongue | idem |
| 13 | mihiaren-muskuluak | `TongueMuscles18` (Tongue18) | tongue | idem |
| 14 | tiroidea-sorrera | `ThyroidBud18` (Thyroid18) | thyroid | site + arrive + where |
| 15 | tiroidea-jaisketa | `ThyroidDescent18` (Thyroid18) | thyroid | idem |
| 16 | tiroidea-heldua | `MatureThyroid18` (Neck18) | none | nothing done; starts at `endPose(specDown)` |
| 17 | aurpegia-hasiera | `FaceStart18` (Face18) | face | site + arrive + where |
| 18 | sudur-plakodak | `Placodes18` (Face18) | face | idem |
| 19 | aurpegi-fusioa | `FaceFusion18` (Face18) | face | idem; skin tints changed against the blotchy end |
| 20 | ildo-nasolagrimala | `FaceDuct18` (Face18) | face | idem; run-on rewinds age 12 → 7 |
| 21 | maxilar-arteko-segmentua | `IntermaxSeg18` (Palate18) | palate | site + arrive + where |
| 22 | aho-sabai-gandorrak | `Shelves18` (Palate18) | palate | idem; run-on rewinds fused → week 6 |
| 23 | sudur-trenkada-korneteak | `Septum18` (Palate18) | palate | idem |
| 24 | aho-sabai-akatsak | `Defects18` (Palate18) | palate | idem |
| 25 | koanak | `Choana18` (Palate18) | choana | idem |
| 26 | hortz-lamina | `ToothLamina18` (Tooth18) | tooth | site + arrive; fly-in removed on purpose; **model rewritten, never rendered** |
| 27 | txano-kanpai | `ToothCap18` (Tooth18) | tooth | idem |
| 28 | hortzaren-geruzak | `ToothLayers18` (Tooth18) | tooth | idem |
| 29 | esne-behin-betiko | `JawTeeth18` (Tooth18) | jaw | idem |

All `arrive` lines were read against the current order at 20:20 and fit it. Small wording point: `hirugarren-poltsa` says "Faringera itzuli gara" (we are back in the pharynx) but the ear-pouch stages before it now stay on the same pharynx model.

## A. Pharynx, thyroid, face (18-A's area)

1. **Flight sheets** forwards and `--back` over stages 1–6, 14–15, 17–20. Look first at the three single shots already taken: scratchpad `a18/face0/` (`aurpegia-hasiera` 0.15, `aurpegi-fusioa` 0.45 and 0.97).
2. **Run-on fix asked by 18-B:** `hirugarren-poltsa` must start from `{ ...END_POUCH2, peelL: 1 }` (`END_POUCH2` exported by `Ear18.tsx`), or set `p1`, `cav`, `ossicles`, `tonsil`, `lymph` to 1 in `P_CAST`; otherwise the run-on shrinks the tympanic cavity, ossicles and tonsil away.
3. **`laugarren-poltsa` cameras** were written for `descend` 0; the stage now starts at 0.28 (fixed so the thymus does not run back up). Re-frame.
4. **Face:** the end of `aurpegi-fusioa` was blotchy; try `color: 0` in spec3's last step (`to: { age: 12, color: 0.3 }` in `Face18.tsx`), then polish the prominences (`LM` handles and `relief()` in `face-model.ts`); mark skin regions `calm: true`. Judge the age rewind into `ildo-nasolagrimala` on the strip (its arrive line announces it).
5. **Thyroid:** `thyroid-model.ts` still uses its own `CUT_HEAD`, not `G18.cut`.
6. **Tones:** measure `G18` on screen (hex^2.2) and apply to the pharynx, face and thyroid grounds.

## B. Ear pouches and tongue (18-B's area)

1. **Look at the moved ear stages** (3–4) on the strip: the camera comes round to the left first pouch; `p1`, `cav`, `ossicles` grow, then `tonsil` and `lymph` at the second pouch. `pharynx-b.ts` adds group `sakonune-tubotinpanikoa` and optionally the eardrum's three layers on the left cut.
2. **Guard risk:** `Ear18` names `sakonune-tubotinpanikoa` and pins some names at explicit left-side points, while the root model names arches on the embryo's right. Run `tests/visibility.test.tsx -t "18. gaia"`, `tests/anchors3d.test.ts`, `tests/labels.test.ts` and fix what they flag.
3. **`ask` checks to add** (prepared, not written): `lehen-poltsa` (ossicles, `week18h.ts` beat `S1[4]`), `lehen-arraildura` (the eardrum's three layers, `week18g.ts` beat `S_EAR[3]`), `guruinen-jaisketa` (`week18i.ts` beat `SD[2]`).
4. **Tongue showpiece:** framing (`fit` should include `lehen-arkua` so the whole floor shows; step 4 of `mihiaren-gorputza` is cut off at the top), nerve tubes and taste buds, and the many-to-many mapping (which arch → which part → which nerve) shown with colour.
5. `ear-model.ts` is now imported by nothing (checked 20:20): delete it once the strips confirm the root-based ear stages.

## C. Palate and teeth (18-C's area)

1. **Render the rewritten tooth model first** (highest risk in the topic): stage sheet of `hortz-lamina,txano-kanpai,hortzaren-geruzak,esne-behin-betiko` at 0.15, 0.5, 0.92. Check the bud and cap shapes, the scoop round the germ (depth and size), the cap's rim and the enamel organ's closing edge, which way each turned surface faces, step 1's two whole jaws with the block growing out of the lower jaw, and in `jawModel` the milk teeth now visible from the start with new heights (step 1 labels may need moving). The old before-shots (flat slab, dark mesenchyme) are in scratchpad `before/st/`.
2. **Palate rewind:** the end of `maxilar-arteko-segmentua` (fused, whole palate from below) runs on into the start of `aho-sabai-gandorrak` (coronal cut, week 6): un-fusing, shelves swinging down, jaw back. Only the arrive line explains it. Decide on the strip: keep, or make it a flight (different cut) so it does not look like a rewind of the same picture.
3. **Palate showpiece:** shelves swinging up from beside the tongue, the fusion front visible, the cleft variants (`aho-sabai-akatsak`) as the same model failing to fuse; surface parts `calm: true`.
4. **`koanak`** middle steps (weak since the first pass).
5. **Labels:** points moved onto the cut (z ≈ 0.02): run the guards.

## D. Clefts and neck (18-D's area: nothing was edited)

1. **Sites** in a new `components/scenes/week18/sites-d.ts` (use `tie`/`onSite` from `sites.ts`):
   - `ear` (`earModel` block, frontal, seen from the front): tie the cleft tip / tympanic border to `ROOT18.cleft1` / `pouch1`; turn the frame so the block's lateral side (+x) matches the root's left (+x); `cut` for its z = 0 face. `lehen-arraildura` then comes out of the pharynx at the first cleft.
   - `sinus` (`sinusModel`, left neck in frontal section): tie its clefts `CL[1..3]` to the root's left clefts II–IV (levels 0.42, −0.72, −1.72), scaled so the model's 0.2 / −0.62 / −1.3 match.
   - `neck` (`neckModel`): tie its pouch-3 stub tip `[1.42, 1.56, -0.12]` to `ROOT18.pouch3`. Its levels do not match the root's (model pouch 3 at y 1.6, pouch 4 at 0.65): rescale or re-level — a choice to settle.
   - `tiroidea-heldua`: consider `onSite(SITE18.thyroid, …)` at the gland's final place, so the thyroid stage flies into the neck. 18-B notes that the root pharynx model already has poses for these stages (`c1`, `flap`, `close`, `persist`, `fluid`, `needle`, `neck`, `descend`, `meet`, `thyroid`, `ubIn`, `cartil`) and that `thyroid-model` has a full adult mode: running these stages on the root/thyroid models instead of separate blocks is the better-continuity option (details in `topic-18-sites.md`).
2. **Specs:** `site`, a short Basque `arrive`, `where` on all four; keep `MatureThyroid18` starting at `endPose(specDown)`.
3. **Test:** `tests/sites18d.test.ts` like `sites18b.test.ts`.
4. **Clefts model:** replace the flat regions in `sinusModel` / `earModel` with a solid block (front face with depth walls); clefts as real grooves between bulging arch bars in the `ARCH` colours; the arch-II flap really growing down and the cervical sinus closing; `calm` on skin.
5. **Neck model:** glands following visible descent paths; fuller, lighter parts (`G18`); check faceting and parts too small in frame.
6. `Clefts18.tsx` also holds topic 17's `ArchesV17` and `ArchInside17` (stages `faringe-arkuak`, `arkuaren-osagaiak`): those need `SITE17.archV` (see `topic-17-todo.md` B4). Do not change them while doing topic 18.

## E. Tooling and open items

- `scripts/quality/flight-sheet.mjs` and `stage-sheet.mjs` list stages in file order (`week18a`…`m`), not topic 18's `ORDER`: the "→ to" labels on topic-18 strips name the wrong stage, though the crossing shot (Shift+→) is the real one. Fix in the scripts (lead-owned) before trusting labels.
- From the first pass: figures 18-4, 18-8, 18-12, 18-13, 18-19 have hand-typed names and estimated positions; notes conflicts (epiglottis arch IV here vs VI in 17; inferior parathyroid end point 1.1.3 vs 1.2); few `ask` checks; Kimu class not built.

## F. Finish line for topic 18

1. `npx tsc --noEmit -p .`
2. `npx vitest run tests/sites18.test.ts tests/sites18b.test.ts tests/sites18c.test.ts tests/sites18d.test.ts`, then topic 18's cases of `notes`, `visibility`, `anchors3d`, `labels`, `content`.
3. Flight sheets of all 28 crossings forwards and backwards, every strip looked at; stage sheets at 1440 and 1024×768 / 768×1024.
4. Only then tell the owner a stage is done.
