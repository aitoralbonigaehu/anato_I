NOT YET PHASE 1 DONE (stopped at 20:00 by the owner's instruction). Written: notes text, plan, three-way split, `tones.ts`, `sites.ts`, content stubs. Missing before 19-B / 19-C start: `components/scenes/week19/common.tsx` (`poseStage19`, `WHERE19`, cameras, keys) and `tests/sites19.test.ts`; topic 19 is NOT in `content/registry.ts` yet (an empty week answers 500), add `week19` there once the first stage renders.

# Topic 19 "Nerbio sistema": plan and three-way split (19-A, 2026-11-16, revised 19:55 for 19-C)

Three agents, one subject each, split along the notes' sections:
- **19-A, sections 1–5: the adult system** (what it is, cuts and axes, central / peripheral, somatic / autonomic, roots, meninges, grey and white matter, voluntary movement, reflex). Models `body`, `cord`, `head`.
- **19-B, sections 6–9: development** (neural crest, the cord's development, the column outgrowing the cord, the neural plate and the vesicles). Models `section`, `spine`, `neural`.
- **19-C, sections 10–13: the brain's working and its cavities** (thalamus, cortex and the path down, ventricles, cerebrospinal fluid). Models `brain` (adult brain + CNS pathway) and `ventricles` (the ventricular system: embryonic vesicles' cavities → adult ventricles, choroid plexuses, CSF flow, subarachnoid space).

Read first: `docs/handover/topics-17-19-brief.md` (the shared brief), the "Rules" of `docs/handover/topic-17-18-plan.md` (they hold here), `docs/quality/3d-quality-bar.md` (point 8 and "Continuity").

**Source:** `C:\Users\aitor\Downloads\19. GAIA. NERBIO SISTEMA (zuzendu gabe).docx`. It came as DOCX only: exported to PDF with Word (`… .docx.pdf`, same folder), extracted by `scripts/notes/extract.py` into `content/notes-text/w19.ts` (135 blocks, 321 sentences; pinned in `tests/notes.test.ts`). Figures: unzip the DOCX, `word/media` (17 images; list below). Page renders of the PDF are quick with PyMuPDF.

**Notes ids.** Sections are numbered as in the notes, 1–13. Two quirks: "1.2.1 Ikuspegi aldaketak" (no 1.2) is covered by section 1.1's stage; the heading "5.1 Mugimendu erreflexuak" sits inside section 11 (the notes' own number), so its blocks are `w19/5.1/p1…p3`, and `w19/5.1/p3` is the flexure paragraph ("Nerbio sistema tolestu egiten da…", the 5-week figure repeated): it belongs to 19-B's `bost-xixkuak` (exception already in `NOTES_EXCEPTIONS`).

**Colour of the notes' text:** grey text (p3–p5: T1-T12 / S2-S4 asides, the "bi muturretan" paragraph, the neuropore days) is cited but light. Nothing anywhere about exam questions (the notes' "berak ez galdetu / ez erabili" remarks are NOT carried into the app in any form).

## Stage list (notes order = play order; `content/weeks/week19.ts` ORDER and `content/notes.ts` NOTES[19] already list it)

| # | id | notes | model (site) | owner | figure(s) to match |
|---|---|---|---|---|---|
| 1 | `sarrera` | 1 | body | 19-A | |
| 2 | `mozketak-ardatzak` | 1.1, 1.2.1 | body | 19-A | p1 brain cuts (coronal red, horizontal blue, sagittal green); p2 axes figure |
| 3 | `zentrala-periferikoa` | 2 (p2–p8) | body | 19-A | p3 top (CNS / PNS, cranial + spinal nerves) |
| 4 | `somatikoa-autonomoa` | 2 (p9–p15, p17 last para) | body | 19-A | p3 bottom (parasympathetic / sympathetic) |
| 5 | `sustraiak-gongoila` | 2 (p16–p17) | cord | 19-A | p5 (cord segment, roots, ganglion, rami) |
| 6 | `meningeak` | 3 (p2–p6) | cord | 19-A | p17 right (spinal meninges) |
| 7 | `garuneko-meningeak` | 3 (figure "LZRa eta meningeak") | head | 19-A | p6 (sagittal brain, meninges, CSF) |
| 8 | `gai-grisa-zuria` | 3 (p7–p13) | cord | 19-A | p11 right (3rd month H) as adult |
| 9 | `borondatezko-mugimenduak` | 4 | body | 19-A | p14 right (pathway) |
| 10 | `aktu-erreflexua` | 5 | cord | 19-A | p5 |
| 11 | `gandor-neurala` | 6 (p3) + 9's transverse figure | section | 19-B | p8 (plate → tube → crest → spinal ganglia) |
| 12 | `gandor-eratorriak` | 6 (p4–p13) | section | 19-B | p9 (4th → 6th week, derivatives) |
| 13 | `ornomuin-geruzak` | 7 (p3–p5) | section | 19-B | p11 top (5th week layers → 3rd month) |
| 14 | `ornomuin-plakak` | 7 (p6–p12) | section | 19-B | p11 bottom (plates → 3rd month cord) |
| 15 | `ornomuinaren-igoera` | 8 (p3–p5) | spine | 19-B | (no figure: column, cone, cauda equina) |
| 16 | `puntzioa-epidurala` | 8 (p6–p8) | spine | 19-B | |
| 17 | `plaka-neurala` | 9 (p3) | neural | 19-B | p12 (20 / 21 days, dorsal + sections) |
| 18 | `hiru-xixkuak` | 9 (p4–p15) | neural | 19-B | p12 (3 → 5 vesicles), p14 tree |
| 19 | `bost-xixkuak` | 9 (p16–p18), 5.1 p3 | neural | 19-B | p13 (28 days, 5 weeks), p16 |
| 20 | `talamoa` | 10 | brain | 19-C | p14 right |
| 21 | `kortexa` | 11, 5.1 (p1–p2) | brain | 19-C | p14 right |
| 22 | `bentrikuluak` | 12 | ventricles | 19-C | p17 top (ventricles and ependymal canal) |
| 23 | `likido-zefalorrakideoa` | 13 | ventricles | 19-C | p6 again, p17 right |

Every stage gets `site` and `arrive`. About one stage in three gets an `ask`. 2–8 steps a stage.

## Models and sites (one body)

Root: **body** — the adult body cut coronally through the spinal cord, its back half as solid ground (the CNS and the nerves lie on / in it, seen from the front). Its space is the shared body: `trunk` frame (x the body's LEFT, y cranial, z ventral), units ≈ 19 cm (the body 9 units tall, vertex y 4.5, soles y −4.5). Landmarks in `ROOT19` (`sites.ts`): brain centre, thalamus, foramen magnum, the cord at T6 (`cordT6`), the cord's end at L1–L2 (`conus`), sacrum, the left sciatic nerve.

| site key | model file | frame | tied to | landmark | owner |
|---|---|---|---|---|---|
| `body` | `week19/body-model.ts` | trunk | root | — | 19-A |
| `cord` | `week19/cord-model.ts` | block (x left, y dorsal, z cranial) | body | the cord at T6; cord radius ≈ 1 unit (scale ≈ 11) | 19-A |
| `head` | `week19/head-model.ts` | trunk | body | the thalamus (midsagittal head block) | 19-A |
| `section` | `week19/section-model.ts` | block | cord | the central canal: **the tube section is drawn at the cord's size** (3rd-month cord ≈ the adult cord, radius ≈ 1, canal at the origin), so `link('block', 1, [0,0,0], CORD_CANAL)` | 19-B |
| `spine` | `week19/spine-model.ts` | trunk | body | the conus (`ROOT19.conus`) | 19-B |
| `neural` | `week19/neural-model.ts` | trunk | body | the whole neural tube laid along the adult CNS: its diencephalon on `ROOT19.thalamus`, its caudal end near the sacrum (the 9 → 10 flight lands on the brain's thalamus) | 19-B |
| `brain` | `week19/brain-model.ts` | trunk | body | the thalamus (`ROOT19.thalamus`); the adult brain and the cord below it, the CNS pathway | 19-C |
| `ventricles` | `week19/ventricle-model.ts` | trunk | brain or neural | the III ventricle (between the thalami / in the diencephalon) | 19-C |

19-B writes its sites in `week19/sites-b.ts` (`SITE19B`), 19-C in `week19/sites-c.ts` (`SITE19C`), both with `tie19` / `onSite19` / `ROOT19` from `sites.ts`, and their own tests `tests/sites19b.test.ts`, `tests/sites19c.test.ts`. `sites.ts` and `tests/sites19.test.ts` are 19-A's.

Crossings in play order: body → body (1–4, run-ons) → cord (5–6) → head (7) → cord (8) → body (9) → cord (10) → section (11) → section → section → section → spine → spine → neural → neural → neural → brain (20) → brain (21) → ventricles (22) → ventricles (23). **Each owner shoots the crossings FROM its stages** (19-A also shoots 10 → 11, 19-B 19 → 20).

Cold entry (`where`): adult models (body, cord, head, brain): none (an adult is not flown into from the 5-week embryo). Embryonic models (section, neural, spine): the fly-in from EMBRYO5 (`WHERE19` keys `section`, `neural`; 19-B may override with `where:` on the spec).

## Colour code (`tones.ts`, `C19`; the same everywhere, embryo to adult)

Functional (as topic 9's spinal nerve: motor red, sensory blue, vegetative green, nerves yellow):
- `C19.motor` red (motor neurons, anterior root, basal plate → motor area), `C19.sens` blue (sensory neurons, posterior root, the ganglion's soma, alar plate → sensory area).
- `C19.symp` green (sympathetic: lateral horn T1–L2, the chain), `C19.para` violet (parasympathetic: cranial + sacral).
- `C19.nerve` yellow (peripheral nerves as cables). `C19.crest` teal `#2dd4bf` and `C19.tube` blue `#3a5fd9` (topic 4's neural crest and neural tube).
- Tissue: `C19.grey` (grey matter), `C19.white` (white matter), `C19.brain` (brain surface), `C19.ependyma`.
- Meninges: `C19.dura` steel blue, `C19.arach` lilac, `C19.pia` rose; `C19.csf` light blue (CSF and the spaces that hold it). `C19.bone` ivory.
- Vesicles (p12 / p14 figures): `C19.pros` / `tel` / `dien` blues, `C19.mes` green, `C19.rhomb` / `met` / `miel` oranges; the adult brain parts wear their vesicle's colour where a step shows origins (thalamus = diencephalon, pons + cerebellum = metencephalon, medulla = myelencephalon).
- Ground `G19`: `body` (the back half), `cut` (cut faces), `cavity` (blue-grey recess, never black), `bone`.

## Shared structure ids (reuse exactly; grep `content/weeks/*-structures.ts` before minting another)

From earlier topics (do not redefine): `hodi-neurala`, `plaka-neurala`, `ildo-neurala`, `tolesdura-neuralak`, `gandor-neurala`, `neuroporo-kraneala`, `neuroporo-kaudala`, `prosentzefaloa`, `mesentzefaloa`, `erronbentzefaloa`, `ornomuina`, `laugarren-bentrikulua`, `notokorda`, `ektodermoa`, `azaleko-ektodermoa`, `somitak`, `gongoil-errakideoak` (spinal / dorsal root ganglia), `gongoil-sinpatikoak`, `gongoil-parasinpatikoak`, `nerbio-kranialen-gongoilak`, `schwann-zelulak`, `glia-zelulak`, `melanozitoak`, `giltzurrun-gaineko-muina`, `gai-grisa`, `gai-zuria`, `atzeko-sustraia`, `aurreko-sustraia`, `neurona-motoreak`, `neurona-sentsorialak`, `nerbio-espinalak`, `nerbio-kranialak`, `nerbio-bagoa`, `nerbio-ziatikoa`, `entzefaloa`.

Minted by 19-A (`week19a-structures.ts`), usable by all: `nerbio-sistema-zentrala`, `nerbio-sistema-periferikoa`, `burmuina`, `garun-hemisferioak` (also "garun kortexa"), `talamoa`, `hipotalamoa`, `zubia`, `garuntxoa`, `erraboila`, `dura-materra`, `araknoidesa`, `pia-materra`, `meningeak`, `eremu-azpiaraknoideoa`, `eremu-epidurala`, `likido-zefalorrakideoa`, `hodi-ependimarioa`, `aurreko-adarra`, `atzeko-adarra`, `alboko-adarra`, `sistema-sinpatikoa`, `sistema-parasinpatikoa`, `kate-sinpatikoa`, `kortex-sentsitiboa`, `kortex-motorra`.

Minted by 19-C (`week19c-structures.ts`): `alboko-bentrikuluak`, `hirugarren-bentrikulua`, `garun-akueduktoa`, `monro-zuloak`, `sare-koroideak`, `luschka-zuloak`, `magendie-zuloa`, `usaimena` (smell's direct way), `motoneurona`, `interneurona`.

Minted by 19-B (`week19b-structures.ts`): `telentzefaloa`, `dientzefaloa`, `metentzefaloa`, `mielentzefaloa`, `epitalamoa`, `azpitalamoa`, `istmoa-entzefaloa` (not `istmoa`: topic 1 owns it), `tolespen-zefalikoa`, `tolespen-zerbikala`, `zubi-tolespena`, `neuroepitelioa`, `neuroblastoak`, `manto-geruza`, `geruza-marginala`, `barneko-mintz-mugatzailea`, `kanpoko-mintz-mugatzailea`, `ependimo-geruza`, `hegal-plaka`, `oinalde-plaka`, `sabai-plaka`, `zoru-plaka`, `ildo-mugatzailea`, `eremu-sentsitiboa`, `eremu-motorra`, `zelula-kromafinak`, `oligodendrozitoak`, `zaldi-buztana`, `ornomuinaren-konoa`, `zuntz-terminala` (the ligament), `zaku-durala`, `aorta-aurreko-gongoilak`. If 19-A needs one of these first, 19-A uses the id and 19-B defines it.

## Files (nobody writes the other's files)

19-A: `components/scenes/week19/{common.tsx, sites.ts, tones.ts, body-model.ts, cord-model.ts, head-model.ts, Body19.tsx, Cord19.tsx, Head19.tsx}`; `content/weeks/{week19.ts, week19a.ts, week19a-structures.ts, week19a-quiz.ts}`; `tests/sites19.test.ts`; this plan.

19-C: `components/scenes/week19/{sites-c.ts, brain-model.ts, ventricle-model.ts, Brain19.tsx, Ventricles19.tsx}` (and any other `brain-*` / `ventricle-*` file); `content/weeks/{week19c.ts, week19c-structures.ts, week19c-quiz.ts}` (exports `stages19c`, `structures19c`, `quiz19c`; already wired in `week19.ts`); `tests/sites19c.test.ts`.

19-B: `components/scenes/week19/{sites-b.ts, section-model.ts, neural-model.ts, spine-model.ts, Section19.tsx, Neural19.tsx, Spine19.tsx}` (and any other `*-b*` / `section-*` / `neural-*` / `spine-*` file); `content/weeks/{week19b.ts, week19b-structures.ts, week19b-quiz.ts}`; `tests/sites19b.test.ts`.

Shared files already edited by 19-A (19-B, 19-C: smallest additive edits only, say so in your report): `scripts/notes/extract.py`, `content/notes-text/{w19.ts, manifest.json, index.ts}`, `content/notes.ts`, `content/registry.ts`, `lib/narration/server-utils.ts` (`MAX_WEEK` 19), `lib/narration/server.test.ts`, `lib/sim/types.ts`, `tests/notes.test.ts` (text pins; the beat count pin `expect(count)` is updated LAST, by whoever finishes last, to the real total).

Lead-owned (kit requests filed in `docs/handover/kit-requests.md`): `components/shell/Specimen.tsx` (week 19's phase), `components/shell/TopicShot.tsx` (a topic card shot), `lib/three-d/geo-registry.ts` (only if a model needs an off-thread slot).

## Traps (KONTUZ where the notes and textbooks disagree; prose wins)

- Neuropores: the notes say the posterior closes on day 25 and the anterior on day 28 ("atzekoa aurrekoa baino arinago"). Textbooks (Langman) give the reverse (anterior ~25, posterior ~28). Follow the notes, KONTUZ (19-B).
- Meninges: arachnoid and pia from the neural crest, dura mesodermal (notes). Meninges form "25.-35. egunetan (5-8. astean)" (as written).
- The notes call the cord's horns "adarrak" (aurreko / atzeko / alboko adarra); lateral horn T1–T12 (L2) only. Sympathetic T1–T12 in section 2, T1–L2 in section 3/7: say both as written.
- Parasympathetic "S2-S4" (section 2) and "S2, S4 mailetan" (same page): S2–S4.
- Section 1.2.1: in the brain dorsal = superior, ventral = inferior; in the cord dorsal = posterior, ventral = anterior; rostral (frontal) = anterior, occipital = posterior ("kaudala ez deitu").
- Epitalamus: "KONTUZ!! irudian ez da ageri" (the notes' own): draw it anyway, say it.
- "EZ esan I. eta II. bentrikuluak": the two lateral ventricles (19-C, 12).
- Spinal nerve: sensory and motor axons "batzen dira (ez fusionatu)"; plexuses mix, never fuse.
- "Kontuz!! 4. astean oraindik hodi neurala existitzen da, ez da ornomuina!!" and "3. hilabetean jada ez dago plakarik" (19-B, warn steps).
