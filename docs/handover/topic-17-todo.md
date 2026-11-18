# Topic 17 (head and neck I: skull, arches, nerves, larynx): what is left (2026-11-16, late evening)

## Four topic 17 scenes finished on 2026-11-17

- **Ossification and cranial base.** Both tissue sections grow within continuous stromal surfaces. The cells and trabeculae follow those surfaces as bone develops. The cranial floor follows the three fossae and opens into the foramen magnum. The paired wings sit above the steep fossa margin throughout their morph.
- **Pharyngeal arches and arch contents.** A local dissection of arch II shows the artery, vein, nerve and cartilage in situ. The opposite wall keeps their cut profiles. The artery and vein have distinct annular walls and recessed blood surfaces. The laryngeal inlet is part of the pharyngeal lining between IV and VI. Its rendered surface and its label both pass the ventral-position check. Topic 18 uses the original default pharynx.
- **Review.** The 148 checks selected for topic 17 passed across six test files, including placement, content, label anchors and visibility. TypeScript passed. The desktop and tablet captures and the before-and-after comparison are in the session scratch directory `enbrioatlas-3d-1718-nov17`. The earlier muscle and dental worklists are outside this pass.

## Historical handover from 2026-11-16

Written for whoever picks topic 17 up next, from the final reports of the four agents (17-A sites/skull/base/bones/arches, 17-B notes/content/figures, 17-C nerves/larynx, 17-D muscles/arch map), who all stopped at 20:00, and from the lead's checks after the stop. **Nothing in this topic's new work has been seen on screen**: the one dev server was overloaded by twelve agents, and no flight or stage sheet came out. Nothing is committed.

## Done in the late-evening session (seen on screen at 1440, guard tests run)

- **Section A items 1–6 and 8 are done.** Every beat of `week17b`–`week17i` cites the corrected notes; texts, quiz, structure definitions, chronology and the arch I scheme (`content/eratorriak/schemes-17-18.ts`) follow them. Arch I's nerve is V3 everywhere (V1/V2 "ez 1. arkuan", drawn pale, not orange); the mandible forms from the mesenchyme beside Meckel, not from it; malleus and incus from Meckel's upper end; the temporal squama is neutral and a new structure `loki-hezurraren-atal-tinpanikoa` (tympanic ring) is arch I's share of the temporal; epiglottis red (IV, per topic 18) with a KONTUZ; superior constrictors III / IX with a KONTUZ on the notes' own list. `tests/notes.test.ts` passes for topic 17 (`'17/sarrera'` exception widened to section 2).
- **Scenes follow the text.** `Arches17.tsx`: `lehen-arkua-luzapenak` now plays first from the bare head (V3 enters the mandibular process there), `trigeminoa` starts from its end pose; both `arrive` lines rewritten for the current order (B1's two arch lines done). `Bones17.tsx`: steps of `bigarren-arkua` and `hirugarren-arkua` reordered to the notes' order (bar → degenerates → stapes → lower end → temporal → VII; hyoid → IX → stylopharyngeus → constrictors → deglutition). `Clefts18.tsx` (the two topic-17 specs only), `Muscles17.tsx`, `ArchMap17.tsx`, `HeadMap.tsx`, `Larynx17.tsx`, `larynx-model.ts`, `skull-model.ts`, `muscle-model.ts`: wording and colours as above (D2's squama tint is done: the map row dims the tympanic part instead).
- **Sagittal bones half rebuilt (`bones-model.ts`, B6 first pass).** The bean slab is now the right half of a fetal head with a real profile (forehead, nose, lips, chin, neck), the skin's cut edge, a brain region and the mouth; the pharynx is a mucosa tube. Mandible (own smooth SDF: body, ramus, coronoid, condyle), maxilla and zygomatic (the fetal skull's SDFs, exported from `skull-model.ts`) are sculpted, grow by the kit's ossification clip with spicules, and the mandible is glass while Meckel is still inside it. Tympanic ring sized to the ossicles. The temporal bone is sculpted too (squama as a scale with its zygomatic process, petrous part with the mastoid process, housing the stapes). Stylopharyngeus is a spindle from the styloid to the pharynx wall, the superior constrictor a fibre sheet wrapped round the pharynx. VII and IX wear their arch's colour (they were generic yellow, which read as arch III).
- **Tests:** the embryo-head mesh is warmed once per file (`beforeAll` in `tests/content.test.tsx` and `tests/anchors3d.test.ts`), so C5's timeouts are gone. `tests/visibility.test.tsx`: `GONE` key for Reichert renumbered; four reasoned `MENTION_ONLY` entries added (Meckel at the ossicles step, "barail prozesutik" at the incus step, mimic muscles at the VII step, stylopharyngeus at the IX step).

**Larynx rebuilt (night of 2026-11-16, seen at 1440 only; guard tests were started but their result was NOT read).** `larynx-model.ts` is now sculpted (SDF): thyroid shield with notch, horns and oblique line, cut into its IV and VI parts; signet cricoid; pyramidal arytenoids with corniculates on their tips and cuneiforms in a glass fold up to a leaf-shaped epiglottis on its stalk; hollow trachea with C rings; pharynx running into the oesophagus; three constrictors as fibre sheets, intrinsic muscles (fan behind the plate, band across the arytenoids, two spindles), vagus with both branches. Unlit parts step back by colour (kit `calm` + a little grey), the thyroid turns to glass only while a step looks inside it. `Larynx17.tsx`: side view of the epiglottis pulled back, intrinsic step from yaw 198, nerve steps from the left side (yaw 78 / 96) with the pharynx back (`open: 0`) and thyroid + cricoid lit. Backups of both files: scratchpad `w17/*.before-sculpt.*`. Item 2 below is done except: run `visibility`, `anchors3d`, `labels`, `content`, `sites17c` for topic 17 and read the result; tablet sizes; the arytenoid reads as a cone with a spur (vocal process hidden from behind).

**Origins scene (item 1 below) not started.** Plan agreed with the code: new `SkullPose` fields (default 0 in `SKULL0`) for dura (a shell over `G.brain`, paraxial colour, skullcap off via `lid`), a stepped window showing arachnoid + pia in crest colour, eye muscles in the left orbit as the somatic muscles, cricoid + arytenoids under the hyoid (reuse the new larynx SDFs; needs a lateral-mesoderm colour in `TISSUE`), four two-tone ganglia (needs a placode colour; where they can be seen on the skull is still undecided). Step 1 = `to: { face: 1, faceOrigin: 1 }`.

**Still owed from this session's own findings (highest value first):**

1. **`errai-kraneoa` shows the wrong thing.** The text is §1.2 "Jatorri ezberdinak" (neural crest → face bones; paraxial mesoderm → somatic muscles + dura; lateral mesoderm → arytenoid, cricoid; arachnoid + pia from the crest; ganglia of V, VII, IX, X from placodes + crest). `Viscero17` still plays the old three steps (face bones grow, crest colour, arch tint). Step 1 matches; steps 2 and 3 need a new picture on the same skull (muscles and dura; laryngeal cartilages; meninges; the four ganglia), coloured by origin with `KEY_ORIGIN`.
2. **Larynx model** (`larynx-model.ts`, stages 20–21): cuneiforms and corniculates are green eggs floating in a dark void; needs the same treatment as the bones half (solid context, sculpted cartilages).
3. **Bones half, second pass:** look at every step of the three stages at 1440 and tablet sizes (only six shots were read after the rebuild); hyoid body halves are pills; the styloid is a plain cone; the cut face's speckle looks blocky in the ossicle close-up; the cut face is flat (a hint of the tongue and the vertebral column would help orient).
4. **Flight sheets for topic 17 are still not shot** (section B2/B3, C1): none of the 21 crossings has been looked at. The three other `arrive` lines listed in B1 (`buru-ganga`, `josturak-fontanelak`, `errai-kraneoa`) still assume the old order.
5. Labels: while a stage is entering, the scene's own names fade in under the lit focus names for about two seconds (seen in the stage sheets as ghost pills); check on a real screen whether it reads as a flicker.
6. A shooter caveat: during one run three of five `trigeminoa` shots stayed on "3D eredua prestatzen…" for the full two minutes; eight fresh loads afterwards all resolved in ≈10 s (worker builds the head, delivers, closes). Not reproduced; if the owner ever sees an endless spinner on the embryo-head stages, look at `lib/three-d/geo-client.ts` (no time-out or hand-shake if the worker never answers).

## Production standard 2026-11: what topic 17 still misses

Rules in `docs/quality/3d-quality-bar.md`, section "Production standard 2026-11". Met: sites measured and tested (`SITE17.archV`, `SITE17C.muscle`), every stage `site` + `arrive`, all forward crossings flights or run-ons, heavy models registered and prewarmed, closing map in 3D with a synced table. Still missing:

- [ ] `--back` flight sheets (with `--dwell 5000`) and tablet sizes.
- [ ] Muscle head: sheets lying on the skull, not flat outlined bands (rule 3, "Sheets lie on what they cover").
- [ ] Run-on hygiene check on every run-on (fades in the first fifth of step 1).

## State on 2026-11-17 (lead; seen on screen at 1440, guard tests run) — READ THIS FIRST, it supersedes the lists below where they disagree

**Done and looked at:**

- **All 22 stages are sited; all 21 crossings were shot forwards and read** (scratchpad `f17/a…d`). Every crossing is a camera flight or a run-on. New sites: `SITE17.archV` measured (the V pharynx on the embryo's arches, tilted 34 degrees with the flexed neck; test in `tests/sites17.test.ts`), `SITE17C.muscle` (muscle head on the skull's jaw and hyoid, 0.74; test in `tests/sites17c.test.ts`). `faringe-arkuak`, `arkuaren-osagaiak`, `lehen-arkua-muskuluak`, `bigarren-arkua-muskuluak`, `arkuen-mapa` have `site` + `arrive`. The three stale `arrive` lines on the skull were rewritten.
- **`arkuen-mapa` is 3D** (`Muscles17.tsx` `specMap`, exported as `ArchMap17` / `S_MAP`): the muscle head on the left lights each arch's nerve, bones and muscles; the table on the right fills row by row; shared structures turn white at the end. `components/scenes/week17/ArchMap17.tsx` (the old SVG table) is now imported by nothing: delete it, or reuse it as a study scheme.
- **`errai-kraneoa` shows its text** (four steps: crest face bones; dura + eye muscles + cricoid/arytenoids; meninges window; ganglia of V, VII, IX, X on the base). One beat was split: the beat-count pin in `tests/notes.test.ts` is 1392.
- **Larynx (stages 20–21) rebuilt** (`larynx-model.ts`): sculpted thyroid with notch and horns, signet cricoid, arytenoids with corniculates, cuneiforms in a glass fold, leaf epiglottis, hollow trachea with C rings, constrictor sheets, intrinsic muscles, vagus with both laryngeal branches.
- **Platysma** now lies on the neck as a thin fibred sheet (it was a floating blue cylinder).
- **Kit fix that matters for every topic:** the first time a stage needed a heavy model (skull, embryo head, nerve brain) the student saw "3D eredua prestatzen…" instead of the flight. `components/shell/Simulator.tsx` now builds the neighbouring stages' geometry in the worker while the current stage plays (`warmGeo`), `lib/three-d/geo-registry.ts` registers `nerves-model`, and `lib/three-d/geo-client.ts` builds a slot on the main thread if the worker has not answered in 30 s (the "endless spinner" seen twice on `trigeminoa`). `scripts/quality/flight-sheet.mjs` has `--dwell <ms>` to stay on a stage before crossing: without it the strip shows the spinner on those crossings, because the shooter leaves after 2.4 s.
- **Tests:** `tsc` clean; `sites17`, `sites17c`, `notes`, `chronology`, `visibility`, `anchors3d`, `labels`, `content` pass for topics 16–18. The six failures left are the old ones in topics 7–9.

**Still owed for topic 17 (highest value first):**

1. `--back` flight sheets (none shot) and the tablet sizes 1024x768 / 768x1024 (none shot after these changes; the map's table is 548 units wide and must be checked at 768).
2. Muscle head polish: mimic muscles are flat bands with heavy outlines, the eye is a dark dot, bone patches render dark; the head is a plain mannequin. The arytenoid reads as a cone with a spur from behind.
3. `buru-ganga -> kondrokraneoa`: at the end of the flight the skull's rim is a ring round a dark hole for a moment before the base fades in.
4. Bones half second pass, tones `G17`, figure parity, `ask` checks, Kimu class: as listed in sections A7, B5, B6, E below (unchanged).
5. Dead code: `Muscles4` / `SM4` in `Muscles17.tsx`, `ArchMap17.tsx`.
6. No fresh-context review of this work has been done yet.

Read first:
- `docs/handover/topics-17-19-brief.md` (the shared brief: the standard as a recipe, tools, rules).
- `docs/quality/3d-quality-bar.md` (point 8, "Continuity", flight sheet, pitfalls).
- `docs/handover/topic-17-sites.md` (root, axes, landmarks, helpers; 17-C's note to 17-D at its end).
- `docs/handover/topic-17-notes-diff.md` (what the corrected notes change, stage by stage; its "Status at the 20:00 stop").
- `docs/handover/topic-17-18-status.md` (gaps left by the first pass, 2026-11-09).

## Where things stand (checked by the lead at 20:00)

- `npx tsc --noEmit -p .` clean. `/astea/17` returns 200.
- `tests/sites17.test.ts` 5/5 and `tests/sites17c.test.ts` pass.
- Source notes are now the corrected file `Downloads\17. GAIA. BURUA ETA LEPOA (ZUZENDUTA) fitxategiaren kopia.pdf`, re-extracted into `content/notes-text/w17.ts` (110 blocks, 218 sentences; pins in `tests/notes.test.ts` updated).
- **Failing in the full run at 20:35** (all expected, all below): `notes.test.ts` anchors ×2 (`week17b`–`week17i` beats cite note ids that no longer exist, A1); `chronology.test.ts` (A6); `visibility.test.tsx` `errai-kraneoa` — the rewritten §1.2 text names structures the scene does not show yet: draw/name them in `Viscero17` (`Skull17.tsx`) or add a reasoned `MENTION_ONLY` entry; `anchors3d` + `content` 5 s timeouts on the arch-head stages (`lehen-arkua-luzapenak` this run, `trigeminoa` earlier — C5).

## Stage table (play order = `ORDER` in `content/weeks/week17.ts`, new order from the corrected notes)

| # | Stage | Scene (file) | Site now | State |
|---|---|---|---|---|
| 1 | sarrera | `Intro17` (Skull17) | `SITE17.skull` | site + arrive written, unseen |
| 2 | kraneoaren-bi-atalak | `TwoParts17` (Skull17) | skull | idem |
| 3 | hezurtze-motak | `Ossification17` (Base17) | `oss` | idem |
| 4 | buru-ganga | `Vault17` (Skull17) | skull | idem; **order changed** |
| 5 | kondrokraneoa | `Chondrocranium17` (Base17) | `base` | idem |
| 6 | josturak-fontanelak | `Sutures17` (Skull17) | skull | idem; content rewritten (fontanelles) |
| 7 | errai-kraneoa | `Viscero17` (Skull17) | skull | idem; content now §1.2 "Jatorri ezberdinak": scene not yet showing it |
| 8 | faringe-arkuak | `ArchesV17` (**week18/Clefts18.tsx**) | none | needs `SITE17.archV` (placeholder) |
| 9 | arkuaren-osagaiak | `ArchInside17` (week18/Clefts18.tsx) | none | idem |
| 10 | bikote-kranealak | `Pairs17` (Nerves17) | `SITE17C.nerves` | site + arrive; brain now waits for the worker build |
| 11 | lehen-arkua-luzapenak | `Processes17` (Arches17) | `arch` | site + arrive |
| 12 | lehen-arkua-kartilagoak | `FirstArchBones17` (Bones17) | `bones` | site + arrive |
| 13 | trigeminoa | `Trigeminal17` (Arches17) | arch | site + arrive; test timeouts |
| 14 | lehen-arkua-muskuluak | `Muscles1` (Muscles17) | none | nothing done |
| 15 | bigarren-arkua | `SecondArch17` (Bones17) | bones | site + arrive |
| 16 | bigarren-arkua-muskuluak | `Muscles2` (Muscles17) | none | nothing done |
| 17 | hirugarren-arkua | `ThirdArch17` (Bones17) | bones | site + arrive |
| 18 | bosgarren-arkua | `FifthArch17` (Arches17) | arch | site + arrive |
| 19 | bagoa | `Vagus17` (Nerves17) | nerves | site + arrive |
| 20 | laringeko-kartilagoak | `LarynxCart17` (Larynx17) | `SITE17C.larynx` | site + arrive |
| 21 | laugarren-seigarren-muskuluak | `LarynxMuscle17` (Larynx17) | larynx | site + arrive; pose already runs on from 20 |
| 22 | arkuen-mapa | `ArchMap17` (ArchMap17.tsx, SVG table) | none | nothing done |

No topic-17 stage has a `where` of its own; `WHERE17` in `components/scenes/week17/common.tsx` gives `arch` and `bones` a cold-entry fly-in. Skull, base, oss, nerves and larynx have none on purpose (adult/fetal models) — to be judged on screen.

## A. Content and notes (17-B's area) — do this first, it unblocks the notes test

1. **Re-cite `week17b.ts` … `week17i.ts`** to the new note ids (`content/notes-text/w17.ts`). The planned mapping per stage is §1 of `topic-17-notes-diff.md`. Then `npx vitest run tests/notes.test.ts` must pass for topic 17.
2. **Apply the content changes in §1 of the diff doc** to each stage's beats (what a stage shows, names or says). `week17a.ts` is already done (fontanelles: anterior closes at 18 months after birth, posterior at 1 month, KONTUZ against the figure's «2. urtean» / «3. hilabetean»; `errai-kraneoa` = "Jatorri ezberdinak" with a KONTUZ on arytenoid/cricoid from lateral mesoderm (1.2) vs arches 4 and 6 (2.6.2); two `ask` checks).
3. **Quiz:** fix `w17-q-fontanelak` and `w17-q-luzapen-maxilarra` in `week17-quiz.ts`.
4. **Structures:** arch I nerve is V3, not V; the maxilla does not come "from the temporal squama" (`week17b-structures.ts`, `week17q-structures.ts`). The temporal squama is no longer an arch I derivative (also beats in `week17i.ts`).
5. **Muscle beats** (`week17e.ts`): the platysma is a thin flat sheet under the neck skin, grouped with the mimic muscles (not "lepoaren larruazala mugitzen du"); check the digastric and "Belarriaren mailatik…" lines against the notes.
6. **Chronology:** `content/chronology.ts` line ≈195 cites `w17/2/p3/s2`, `w17/2/p5/s1`, `w17/2/p5/s5`; they become `w17/2/p4/s2`, `w17/2/p4/s3`, `w17/2/p4/s10`.
7. **Figures (`/fitxak`, course figures):**
   - Boxes of `public/irudiak-pdf/17-7`, `17-9`, `17-10` are misplaced (overlays showed it). The other topic-17 plates are unchecked.
   - The corrected notes add a cartilage figure, a muscles figure and hyoid photos, and drop old 17-5, 17-9, 17-11. §2 of the diff doc (notes figure → stage/step) is still TODO; every notes figure needs a matching picture at its step (memory: notes figure parity).
   - Adding course-figure pages needs the hard-coded page counts in `components/shell/CourseFigures.tsx` changed (lead-owned; filed in `kit-requests.md`).
8. **Notes conflicts still open** (from the first pass): epiglottis arch (VI in 17, IV in 18); membranous ossification of the arch bones (notes vs textbooks). Notes prose wins; add a KONTUZ where they disagree.

## B. Continuity on the skull / base / arch / bones sites (17-A's area)

1. **Re-write the `arrive` lines that assume the OLD order.** 17-A wrote them while 17-B was changing `ORDER`. Checked by the lead at 20:15 against the current `ORDER`:
   - `buru-ganga` (`Skull17.tsx` ≈l.217) "Denboran atzera: ganga mintza da oraindik…" — written for a crossing from `josturak-fontanelak`; it now comes from `hezurtze-motak` (the oss blocks).
   - `josturak-fontanelak` (`Skull17.tsx` ≈l.143) "Ehun zatitik burezur osora…" — written for a crossing from the oss blocks; it now comes from `kondrokraneoa` (the base block).
   - `errai-kraneoa` (`Skull17.tsx` ≈l.271) "Oinaldetik burezur osora…" — it now comes from `josturak-fontanelak` (same skull, a run-on, not from the base).
   - `lehen-arkua-luzapenak` (`Arches17.tsx` ≈l.121) "Buru bera…" — it now comes from `bikote-kranealak` (the nerve model), so it is a flight, not the same head.
   - `trigeminoa` (`Arches17.tsx` ≈l.38) "Garunetik enbrioiaren burura…" — it now comes from `lehen-arkua-kartilagoak` (the sagittal bones half), not from the brain.
   - The others read right for the current order. The pose run-ons on the skull (sarrera → bi-atalak → buru-ganga → josturak → errai-kraneoa are not all adjacent any more) must be re-checked the same way: each stage's start pose against the end pose of the stage now before it on the same model. §0 of the diff doc lists the order changes and in-stage beat reorders.
2. **Flight sheets** forwards and `--back` over stages 1–7 and 11–18:
   `node scripts/quality/flight-sheet.mjs 17 <out> --stages sarrera,kraneoaren-bi-atalak,hezurtze-motak,buru-ganga,kondrokraneoa,josturak-fontanelak --at 0.12,0.35,0.5,0.65,0.85 --shrink 3` (then the next group, then `--back`). Tune the `SITE17` numbers in `components/scenes/week17/sites.ts` (base: sella, scale 1.55, table frame; oss: two blocks on the left of the head, scale 3.2; arch: stomodeum on the fetal mouth, 1.15; bones: sagittal half between ear and hyoid, 1.7) until each crossing reads as one move; keep `tests/sites17.test.ts` green.
3. **Run-ons to look at:** `sarrera → kraneoaren-bi-atalak` (archTint 1→0); the fontanelles reopening wherever the order now steps back in time; `trigeminoa → lehen-arkua-luzapenak` (glass and open1 1→0).
4. **`SITE17.archV` is a placeholder through `arch`** (numbers never measured). Measure it from the V-shaped pharynx model in `Clefts18.tsx` (`ArchesV17`, `ArchInside17`), then give stages 8–9 `site: SITE17.archV` + an `arrive` line. Those two specs live in a topic-18 file: whoever edits them must not touch the topic-18 specs there.
5. **Tones:** `components/scenes/week17/tones.ts` (`G17`) is copied from topic 16 and applied to no model yet. Shoot, measure the grounds' pixels, then apply `G17` to every model's ground/cut/cavity; skin and mucosa surfaces get `calm: true`.
6. **Model polish** (none started): skull, base block, ossification blocks, embryo arch head, sagittal bones half. Owner's bar: organic shapes, no faceting/seams, solid context. Known weak spots from the first pass are in `topic-17-18-status.md`.

## C. Nerves and larynx (17-C's area)

1. **Flight sheets** forwards over `arkuaren-osagaiak,bosgarren-arkua,bagoa,laringeko-kartilagoak` and `--back` over `bikote-kranealak,bagoa,laringeko-kartilagoak,laugarren-seigarren-muskuluak`; tune `SITE17C.nerves` (tied at `ROOT17.brain`, scale 1.4) and `SITE17C.larynx` (tied to the nerve model's larynx, scale 1.6) in `components/scenes/week17/sites-c.ts`.
2. **Landmark tests owed** in `tests/sites17c.test.ts` (it only checks similarity now): the nerve model's larynx carried onto the larynx model's; the nerve brain inside the skull's cavity; the arch head's vagus and Gasser ganglion against the nerve model's (17-C estimated ≈1.3 root units apart: needs tuning).
3. **Geometry worker:** `lib/three-d/geo-registry.ts` needs `import '@/components/scenes/week17/nerves-model';` so the `nerve-brain` slot builds in the worker (filed in `kit-requests.md`). `nerves-model.ts` was made worker-safe for this.
4. **Model polish:** larynx cartilages and muscles, the brain and nerve tubes.
5. **`trigeminoa` test timeouts** (`tests/anchors3d.test.ts`, `tests/content.test.tsx`: "Test timed out in 5000ms"): likely the arch-head SDF build being slow in the test process on a loaded machine. Re-run on a quiet machine first; if it still times out, give those cases a longer timeout or a lighter test build of `arch-head.ts`.

## D. Muscles and the arch map (17-D's area: nothing was edited)

1. **Muscle site:** new `components/scenes/week17/sites-d.ts` with `SITE17D.muscle = tie17({ at: <muscle-model hyoid body>, atRoot: ROOT17.hyoid, scale })`. Two estimates disagree: 17-C measured ≈0.78 (`at: [0,-1.94,0.84]`, muscle ≈ 0.78 × skull + (0, 1.18, −0.42)); 17-D estimated 0.55–0.6 (`at: [0,-1.95,0.93]`). Settle it by also matching the mandible (`HEAD(0.95,-1.05)` vs `ROOT17.mandibleL`). Test in `tests/sites17d.test.ts`. 17-C's alternative: rebuild the muscles on the root skull itself (no separate model) — better continuity, more work.
2. **`Muscles17.tsx`:** `site` + `arrive` on `spec1` and `spec2` (e.g. "Enbrioiaren buruaren ordez, fetuaren burua: V3-k inerbatzen dituen muskuluak"; "Hioidearen adar txikitik muskuluetara: VII-ren muskuluak"); make `spec2.pose` = `endPose(spec1)`. Drop `tenporalaren-ezkata` from the map's `dim` and its orange `b1` tint in `muscle-model.ts`. Platysma name sub/note: "lepoko larruazalaren azpian, fina eta zapala".
3. **`arkuen-mapa` → 3D:** replace the SVG table with a `poseStage17` built from the unused 3D `specMap`/`SMAP`/`MapTable` in `Muscles17.tsx` (bones, nerves, muscles tinted row by row in each arch's colour, `n1..n6`, `b1..b4`, `m1..m6`). Best: start on the embryo arch head and cross into the muscle head, so the arches visibly become their derivatives. Keep the exports `ArchMap17` and `S_MAP` (six steps) so `week17i.ts` needs no edit; the beats focus `lehen-arkua` … `seigarren-arkua` and `trigeminoa`, so those ids must be drawn or labelled (visibility test). Arch I nerve = V3; no squama. Site tied to `SITE17C.larynx` (the stage before) or to the muscle site, with an `arrive` line.
4. **Visuals:** platysma sheet at the end of `bigarren-arkua-muskuluak` (now a flat blue cylinder), the eye area (dark ring around a dark blob), faceted spindles, bone patches rendering dark grey.
5. **Dead code:** `Muscles4`, `SM4` are imported nowhere; remove or use.

## E. Still open from the first pass (2026-11-09)

- Nine course figures with hand-typed names and estimated positions (17-6, 17-7, 17-9, 17-10 and topic 18's): check spelling and leaders.
- Few `ask` checks (now 8 in the whole topic); Kimu class (Klasea) not built for 17.
- Tablet sizes (1024×768, 768×1024) never shot after today's changes.

## F. Finish line for topic 17

1. `npx tsc --noEmit -p .`
2. `npx vitest run tests/sites17.test.ts tests/sites17c.test.ts tests/sites17d.test.ts`, then topic 17's cases: `tests/notes.test.ts`, `tests/visibility.test.tsx -t "17. gaia"`, `tests/anchors3d.test.ts`, `tests/labels.test.ts`, `tests/content.test.tsx`.
3. Flight sheets of all 21 crossings forwards and backwards, every strip looked at; stage sheets at 1440 and both tablet sizes.
4. Only then tell the owner a stage is done.
