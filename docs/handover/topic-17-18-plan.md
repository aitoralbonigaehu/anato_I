# Topics 17–18 "Burua eta lepoa": plan and shared brief

Owner's brief (2026-11-09): add the head-and-neck topic(s) from the two PDFs "at the quality standards of previous topics, and even improving them". Two topics, as the notes number them: 17 (I) and 18 (II). They were started together and share one colour code and helpers.

**Source of truth, in order:** the notes' prose → the notes' figures → textbook knowledge (only to avoid drawing something wrong; never contradict the notes silently, use a KONTUZ).

- Notes text with citable ids: `content/notes-text/w17.ts`, `w18.ts` (generated: never edit).
- Original PDFs: `C:\Users\aitor\Downloads\17. GAIA. BURUA ETA LEPOA (ZUZENDUTA).pdf` and `18. GAIA_ Burua eta lepoa ll (Zuzenduta).pdf`. Read every figure of your section at good resolution (render with PyMuPDF, `python -I`, into your scratchpad; `Read` on PDFs does not work here, pdftoppm is missing).

## Read before starting (all short)

- `docs/quality/3d-quality-bar.md`: the bar. Every step passes it at start, middle and end.
- `docs/handover/topic-15-16.md`: what the last topics did.
- Examples to copy structure from: `components/scenes/week16/Ducts16.tsx` + `duct-model.ts`, `week15/Pelvis3D.tsx` + `pelvis-model.ts` (a cut body), `content/weeks/week16.ts`, `week16-structures.ts`.
- `components/scenes/week17/common.tsx`: colours, `poseStage17/18`, cameras, keys. `lib/three-d/organic.ts`: `vessel`, `cupShell`, `cutOpen`, `plate`, `wallSlab`, `bean`.
- `components/scenes/week14/common.tsx`: `StageSpec`, `Step`, `Where` (the fly-in).
- `AGENTS.md`: this Next.js differs from training data; read `node_modules/next/dist/docs/` before touching routing or framework code (scene and content work does not need it).

## How 17–18 must go beyond 15–16

1. **One colour code from embryo to adult, through both topics.** A derivative wears its arch's colour wherever it appears: I orange, II blue, III yellow, IV red, VI green (`ARCH`, the notes' own figure colours). A student sees "orange = I" in the embryo and then finds orange in the mandible, the malleus, the masseter and the tongue's body.
2. **Things change shape, they don't swap.** Each subject is one model with a continuous pose: the embryo's arches really become what they become, the face really moves from side to centre, the palatal shelves really swing up. No cross-fades between "before" and "after" pictures.
3. **One continuous skin where the notes draw one surface** (face, floor of the pharynx). `docs/quality/3d-quality-bar.md` lists "one continuous surface with no seams" as owed by topic 16. Here it is done: see `lib/three-d/field-surface.ts` below.
4. **"Non gaude?" on every view** (`map` in the stage spec, `HeadMap`) and, wherever the model is embryonic, the **fly-in from the whole embryo** (`where`).
5. **Figure parity.** Each notes figure has a matching picture at the step where the notes print it (tables below): same parts, same arrangement, same names.
6. **Tablet checked from the start** (15–16 skipped it): 1024×768 and 768×1024 on each finished stage.
7. **Study value first.** The owner studies from the notes and then checks the app side by side. A step that looks fine but does not make the fact easier to remember is not done. The hard facts of these topics are the many-to-many mappings (arch → nerve, cartilage, muscle; pouch → derivative; part of the tongue → nerve): the picture must make the mapping itself visible.

## Rules (each comes from a past failure)

**Content**
- Basque, the notes' own terms. The first label shows both of the notes' names ("Faringe-arkuak / arku brankialak"). Never cut a name.
- Every sentence of your sections is cited by some beat's `notes` (ids like `w17/2.2.1/p3/s2`). Grey "EZ DU AIPATU" text (cranial nerve generalities) is cited but light. Check coverage with a throwaway script before reporting.
- Prose beats tables and figures when they disagree: KONTUZ (`cautions`, `warn: true` step). Traps are listed below; add any you find.
- Topic rule: nothing anywhere about past exam questions. The `exam` field on a beat (a fact likely asked) is the same as in topic 16 and is fine.
- Stage: `id` as listed below (already in `content/notes.ts`), `day`, `dayRange`, `title`, `subtitle`, `intro`, `duration`, `source`, `views`, `beats`, `structures`, `keyPoints`, `cautions`. 2–8 steps per stage, one verb on screen per step. `ask` checks where they earn it (about one in three stages).
- Short, plain Basque sentences. `note` under the picture, one line.

**Shared structure ids** (reuse them exactly; before minting any other id, grep `content/weeks/*-structures.ts` and reuse if it means the same):
`lehen-arkua`, `bigarren-arkua`, `hirugarren-arkua`, `laugarren-arkua`, `bosgarren-arkua`, `seigarren-arkua`, `faringe-arkuak`; `lehen-poltsa` … `laugarren-poltsa`, `faringe-poltsak`; `lehen-arraildura`, `faringe-arraildurak`; `trigeminoa`, `nerbio-oftalmikoa`, `nerbio-maxilarra`, `barail-nerbioa`, `gasser-gongoila`, `aurpegi-nerbioa`, `glosofaringeoa`, `bagoa`, `goiko-laringe-nerbioa`, `laringe-atzerakaria`, `hipoglosoa`; `luzapen-maxilarra`, `barail-luzapena`, `estomodeoa`, `mintz-bukofaringeoa`; `meckel-kartilagoa`, `reichert-kartilagoa`, `baraila`, `hezur-maxilarra`, `zigomatikoa`, `tenporalaren-ezkata`, `mailua`, `ingudea`, `ointokia`, `estiloide-apofisia`, `hioide-hezurra`, `hioide-gorputza`, `hioide-adar-txikia`, `hioide-adar-nagusia`, `tiroide-kartilagoa`, `krikoide-kartilagoa`, `epiglotisa`, `aritenoide-kartilagoa`; `tinpano-kutxa`, `eustakioren-tronpa`, `tinpano-mintza`, `kanpoko-entzumen-hodia`, `aho-sabaiko-amigdala`, `beheko-paratiroidea`, `goiko-paratiroidea`, `timoa`, `gorputz-ultimobrankiala`, `tiroide-guruina`, `hodi-tiroglosoa`, `zulo-itsua`, `laringe-zuloa`, `faringe-hestea`; `goragune-frontonasala`, `sudur-plakoda`, `sudur-hobitxoa`, `ildo-nasolagrimala`.

**3D and picture** (all from `MEMORY`; these were each reported by the owner at some point)
- Axes in every model file: x embryo's LEFT, y cranial, z ventral, unless the file states otherwise. Check every sided structure and every side caption against a real screenshot: from the embryo's left side the face looks to the viewer's LEFT.
- High-end: smooth shapes, no faceting or seams, solid context (never a glass body), semi-realistic, strong contrast. Solid parts keep `opacity: 1` (they grey, they do not turn to glass).
- Embryos must look like embryos: for a whole embryo use the shared `EMBRYO5` (`lib/three-d/embryo5`, the fly-in does this), never a bespoke doll or blob.
- Same structure looks the same across topics; short tidy leaders; no drawn pointers, rings or dashed boxes (glow/outline the thing itself); text always above lines.
- Lit = only that; mentioned = visible; the focus label pops. Names are said then shown (`from`), every name stays in frame.
- A label's dot sits well inside its structure, never on a seam. Composites light all their parts.
- Spaces need a body: a named hole, pouch or membrane is a drawn thing with its id.
- Narrated verbs happen on screen: push, fold, fuse, descend, ruptures. Too small to see: close-up.
- Paired → fused: cut geometry at the fusion front, the two copies part at once and never coincide, what is attached follows, the fused result has no seam and does not pop in. Fusion is its own beat.
- Gone means gone: every "degenerates" flag holds in all later poses. Ease all changes with `seg`/`run`, never `x ? 1 : 0`.
- Camera: glides, never cuts; every step change moves it towards what the step is about; a turn over ~120° is announced in the step's text; if the narration names something cut off by zoom, zoom out briefly, then back in.
- Back faces are culled in the flat render tests use: give sheets `facing`, and mirrored halves need flipped winding. Shoot both sides.
- Keep colour keys to four short entries. Names in the edge columns; the right column is `[236, 540]`.
- `'use client'` scene modules: content files may only index step arrays (`S17[i]`), never call methods on them.

**Working in the shared tree (five agents at once)**
- Touch only the files you own (below). Shared files you need changed: make the smallest additive edit and say so in your report; never reformat them.
- Do NOT run git commands that change state (no commit, stash, checkout, reset). Nothing gets committed until the lead reviews.
- A dev server already runs at `http://localhost:3000` (Next allows only one per folder, so don't start another while it is up). `/astea/17` and `/astea/18` answer 500 until the first stages exist. If it refuses connections, wait a minute and retry; if it is still down, start one with `npx next dev -p 3000` in the background.
- If a page errors because of a file someone else is editing, wait a minute and retry. Don't touch their file.
- Shots: `node scripts/quality/stage-sheet.mjs <week> <your scratchpad>/sheet --base http://localhost:3000 --stages a,b --at 0.12,0.5,0.92` (and `--vw 1024 --vh 768`, `--vw 768 --vh 1024` when a stage is done). It starts its own browser, so agents don't collide. Images are expensive: shoot only what changed, and use `?etapa=<id>&une=<0..1>` on single frames for quick checks.
- Before reporting, on your stages: `npx tsc --noEmit -p .`; `npx eslint <your files>`; `npx vitest run tests/visibility.test.tsx tests/labels.test.tsx tests/anchors3d.test.ts tests/narrated-actions.test.tsx tests/content.test.tsx -t "<topic>. gaia"` (use the test names that exist, some tests take no `-t` filter). Failures in stages that are not yours are not your concern; failures on clean HEAD before this work are listed in `docs/handover/topic-15-16.md`.
- If you run low on budget, stop at a stage boundary and write what is left in `docs/handover/topic-17-18-<yourarea>.md`. Half-built stages must still compile.
- End with: stages finished, which were shot at which sizes, test results, KONTUZ added, anything you changed outside your files, anything that is still weak (be honest: the lead will look at the screenshots).

## `lib/three-d/field-surface.ts` (owned by the face agent)

One continuous skin deformed per pose: a grid over parameter space displaced by a smooth field, normals computed on the whole field so nothing shows a seam, with named regions (each its own `Item3` with `id`, colour and glow, sharing boundary vertices with its neighbours). Regions are defined in **material** coordinates, so a region's outline travels with the tissue as the surface deforms. The tongue uses it too; its agent starts on other stages and builds the tongue once this exists.

## Parts, files and owners

Colour, cameras and map live in `components/scenes/week17/common.tsx` and `HeadMap.tsx`.

### A. Skull (topic 17 §1) — agent `skull`
Owns: `components/scenes/week17/skull-model.ts`, `Skull17.tsx`, `HeadMap.tsx`; `content/weeks/week17a.ts` (`stages17a`), `week17a-structures.ts` (`structures17a`).

Exports for the arches agent, as soon as possible: `skullModel(pose: SkullPose, opts?: SkullOpts): PoseModel` and `SKULL0`, a fetal skull that can show just the face and side bones (maxilla, zygomatic, temporal squama, mandible, styloid, hyoid) in arch colours (`archTint` 0..1).

| Stage id | Notes | Shows | Figure to match |
|---|---|---|---|
| `sarrera` | intro, 1 (start) | Whole head: skull, arches, face; the road through both topics | |
| `kraneoaren-bi-atalak` | 1 | Neurocranium (holds the encephalon) vs viscerocranium; origin colours (crest vs occipital-somite paraxial mesoderm) | p.1 |
| `hezurtze-motak` | 1 | Two ossifications side by side, really happening: membrane (fast, direct) vs endochondral (cartilage model, then bone, slow) | |
| `josturak-fontanelak` | 1.1 | Skull from above: membranes, sutures, fontanelles closing; bones approach each other for birth (moulding) | p.2 top view, all names |
| `buru-ganga` | 1.1 | Calvaria by origin: frontals (crest) vs parietals and occipital squama (paraxial) | |
| `kondrokraneoa` | 1.1 | Base from above: cartilage plate → the bones | p.2 chondrocranium, all names |
| `errai-kraneoa` | 1.2 | Face bones: crest, membranous; arches 1–2 (grey in the notes) | |

Polish `HeadMap.tsx` (keep the `HeadFocus` names): an embryo-head silhouette that reads, the arches in their colours.

Traps: posterior fontanelle closes "2. hilabetean" in the prose, the figure says 3. hilabetean (KONTUZ, prose wins). Frontals come from the crest, parietals and occipital squama from paraxial mesoderm. The base is endochondral, the vault membranous.

### B. Arches: pharynx from behind (topic 17 §2 start and all of topic 18 §1) — agent `pharynx`
Owns: `components/scenes/week18/pharynx-model.ts`, `Pharynx18.tsx`; `content/weeks/week17c.ts` (`stages17c`), `week17c-structures.ts` (`structures17c`); `week18a.ts` (`stages18a`), `week18a-structures.ts` (`structures18a`).

One hollow pharyngeal gut: V-shaped from behind with its roof taken away, arches as solid bars with real layers (ectoderm outside, endoderm inside, mesenchyme between, each arch with artery, vein, nerve and cartilage in it), clefts outside, pouches inside, aortic arches between the pouches, the laryngeal orifice on the floor. Pouches deepen and bud into their derivatives on this same model, which then shows the descent.

| Stage id | Topic | Notes | Shows | Figure |
|---|---|---|---|---|
| `faringe-arkuak` | 17 | 2 | The V from behind and where it sits in the embryo; 4 drawn, V degenerates, IV+VI together, paired | 17 p.3 left and centre |
| `arkuaren-osagaiak` | 17 | 2 | Inside one arch: layers, then artery, vein, nerve, cartilage; crest cells migrating in; clefts vs pouches | 17 p.3 centre, all names |
| `sarrera` | 18 | 1 | Recap of arches; clefts (outside, ecto) vs pouches (inside, endo); the road of the topic | 18 p.1 |
| `arraildurak-poltsak` | 18 | 1 | Clefts and pouches on opposite sides, between arches; pouches between aortic arches; laryngeal orifice | 18 p.1 three figures, p.2 |
| `lehen-poltsa` | 18 | 1.1.1 | Tubotympanic recess deepens: tube (proximal) and tympanic cavity (distal), three ossicles with their arch colours | |
| `bigarren-poltsa` | 18 | 1.1.2 | Palatine tonsil; lymphoid tissue 3rd–5th month, functional 5th | |
| `hirugarren-poltsa` | 18 | 1.1.3 | Dorsal: inferior parathyroids. Ventral: thymus | 18 p.1 right |
| `laugarren-poltsa` | 18 | 1.1.4 | Dorsal: superior parathyroids. Ventral: ultimobranchial body → C cells in the thyroid | 18 p.1 right |
| `lehen-arraildura` | 18 | 1.2 | Deepens and meets the pouch without opening: tympanic membrane in its 3 layers; external meatus | close-up |
| `beste-arraildurak` | 18 | 1.2 | II arch grows down over the clefts, meets the epicardial ridge; cervical sinus; vanishes; persisting sinus | 18 p.1 centre |
| `guruinen-jaisketa` | 18 | 1.2 | The descent, really: thymus goes down and medially carrying the inferior parathyroid past the superior one | 18 p.4 two figures |

Traps: pouches are NOT "poltsa brankialak"; pouches endoderm, clefts ectoderm. Notes count "6 arches, 4 pouches" and study the last pouch as one (4+5 together): say it. The inferior parathyroid comes from the upper pouch (3rd), the superior from the lower (4th): named for where they end, not where they start (the notes' own KONTUZ). First cleft and pouch "batu ≠ fusionatu": the border never opens.

### C. Arches: nerves, cartilages, muscles (topic 17 §2.1–2.6) — agent `arches`
Owns: `components/scenes/week17/arch-model.ts` (and any further model files named `arch-*`), `Arches17.tsx`; `content/weeks/week17b.ts` (`stages17b`), `week17b-structures.ts` (`structures17b`).

The embryo's head and neck from the left, the arches bulging on it and cleft-separated, the cartilage bars and nerves inside, then the same parts going to their adult places on the skull (`skullModel`). This model is the showpiece of topic 17.

| Stage id | Notes | Shows | Figure |
|---|---|---|---|
| `bikote-kranealak` | 2.1 | The 12 pairs at the brain's base, front to back; V, VII, IX, X strong, the rest quiet (grey in the notes); one nerve per arch | 17 p.4 |
| `trigeminoa` | 2.2.1 | Gasser's ganglion, V1 V2 V3 from above down, on the embryo then the head | 17 p.5, p.6 centre |
| `lehen-arkua-luzapenak` | 2.2.1 | Maxillary and mandibular processes round the stomodeum | 17 p.1, p.6 |
| `lehen-arkua-kartilagoak` | 2.2.2 | Meckel degenerates, mandible forms around it; maxillary process → maxilla, zygomatic, temporal squama; malleus, incus | 17 p.4 right, p.6 left |
| `lehen-arkua-muskuluak` | 2.2.3 | Masseter, temporal, mylohyoid, digastric anterior belly; muscle → nerve → arch | 17 p.6 right |
| `bigarren-arkua` | 2.3.1–2 | VII; Reichert → stapes, styloid, lesser horn, upper half of hyoid body | 17 p.4 right |
| `bigarren-arkua-muskuluak` | 2.3.3 | Mimic muscles, auricular, occipital, digastric posterior belly, stylohyoid, platysma | 17 p.6 right |
| `hirugarren-arkua` | 2.4 | IX; lower half of the hyoid body + greater horns; stylopharyngeus, upper constrictors (deep) | 17 p.4 right |
| `bosgarren-arkua` | 2.5 | Appears and regresses (short) | |
| `bagoa` | 2.6.1 | X's branches: superior laryngeal → IV; recurrent → VI; what the vagus also supplies | 17 p.5 |
| `laringeko-kartilagoak` | 2.6.2 | Thyroid (upper part IV, lower VI), cricoid, epiglottis, arytenoid, corniculate, cuneiform; trachea not from arches | 17 p.4 right |
| `laugarren-seigarren-muskuluak` | 2.6.3 | Middle and inferior constrictors; intrinsic larynx muscles | 17 p.6 right |
| `arkuen-mapa` | 2 (recap) | The whole map: arch → nerve, cartilage/bones, muscles, built row by row from the embryo to the adult. The topic's closing picture | |

Traps: the notes say V1 "begiaren mugimenduetaz arduratzen da", yet the same page says III, IV and VI move the eye and V1 is mostly sensory: KONTUZ. V2 and V3 are named as in the notes; only V3 has muscles. Incus: notes say I; "other books" give the long crus to II (notes' own remark, in the KONTUZ). Temporal squama from the maxillary process, petrous part from the base. "Hezur estilohioideoa" in the notes is the stylohyoid **muscle** (their figure names it). VII: notes say mixed and speak of its sensory side, but its job here is motor (mimic muscles). Meckel degenerates, it is a guide: the mandible is not ossified Meckel. Digastric: anterior V3, posterior VII. Derivative muscles are told apart by their nerve (the notes' point).

### D. Face, nose and palate (topic 18 §4–4.1) — agent `face`
Owns: `lib/three-d/field-surface.ts`, `components/scenes/week18/face-model.ts` (and `face-*`, `palate-*`, `nose-*`), `Face18.tsx`; `content/weeks/week18c.ts` (`stages18c`), `week18c-structures.ts` (`structures18c`).

The face as one continuous skin morphing from week 4 to week 12: a real sequence, the showpiece of topic 18. Colours as the notes' figures: maxillary and mandibular orange (arch I), medial edge yellow, lateral edge blue. By the end it must read as a little human face.

| Stage id | Notes | Shows | Figure |
|---|---|---|---|
| `aurpegia-hasiera` | 4 | Week 4 end: frontonasal prominence, maxillary and mandibular, stomodeum, buccopharyngeal membrane behind, eyes far lateral | 18 p.9 top two |
| `sudur-plakodak` | 4.1 | Placodes thicken, medial and lateral edges rise, the pit deepens (they are not the eyes); nasolacrimal groove | 18 p.9 third |
| `aurpegi-fusioa` | 4.1 | Weeks 6–7, 10: everything moves to the midline; maxillary swellings drag; medial edges fuse → middle of nose, middle of upper lip; lateral → alae; upper lip's two origins | 18 p.9 last, p.10 top |
| `ildo-nasolagrimala` | 4.1 | Groove → duct and lacrimal sac; the eye-to-nose link | 18 p.10 |
| `maxilar-arteko-segmentua` | 4.1 | Intermaxillary segment → primary palate from below; incisive foramen; four incisors | 18 p.10 |
| `aho-sabai-gandorrak` | 4.1 | Coronal: shelves beside the tongue (6), swing up over it (7), fuse (9); from below in step; raphe stops at the foramen | 18 p.11 six figures |
| `sudur-trenkada-korneteak` | 4.1 | Septum comes down from the ethmoid and meets the palate (10–12); conchae, three pairs | 18 p.11 |
| `aho-sabai-akatsak` | 4.1 | Hard vs soft palate; the two ways it fails: cleft lip (one or both sides), cleft palate | 18 p.12 |
| `koanak` | 4.1 | Sagittal: pit deepens, buconasal membrane (6), breaks (7), primary choana; nares vs choanae; choanae move back to the pharynx | 18 p.12 |

Traps: the pits are not eyes (notes). Notes use "plakak" and "gandorrak" for the shelves: show both once. Three palatine bones are named "not important": light. Choanae first lie forward, then move back. Inferior concha is its own bone; superior and middle are parts of the ethmoid.

### E. Tongue, thyroid and teeth (topic 18 §2, §3, §4.2) — agent `glands`
Owns: `components/scenes/week18/tongue-model.ts`, `thyroid-model.ts`, `tooth-model.ts`, `Tongue18.tsx`, `Thyroid18.tsx`, `Tooth18.tsx`; `content/weeks/week18b.ts` (`stages18b`), `week18b-structures.ts`; `week18d.ts` (`stages18d`), `week18d-structures.ts`.

Start with thyroid and teeth; build the tongue once `field-surface.ts` is there (or write your own small version if the face agent has not delivered after your other stages).

| Stage id | Notes | Shows | Figure |
|---|---|---|---|
| `mihiaren-gorputza` | 2.1 | Floor of the pharynx from above: 2 lateral swellings + tuberculum impar fuse → body, all arch I (orange) | 18 p.5 A, p.7 |
| `mihiaren-sustraia` | 2.1 | Copula from II, III, part of IV; root; epiglottis; sulcus terminalis, foramen caecum; arytenoid swellings; the root is deep and long | 18 p.5 B, p.7 B |
| `mihiaren-inerbazioa` | 2.2 | The table as a picture: body V3 (general) + VII (taste), root IX (anterior) + X (posterior), each region lit with its nerve | 18 p.6 table |
| `mihiaren-muskuluak` | 2.2 (table's last row) | Occipital somite myoblasts stream into the tongue; XII; not from the arches | 18 p.6 table |
| `tiroidea-sorrera` | 3 | Sagittal: bud at the foramen caecum, 4th week; duct, the gland's beginning at its tip; buccopharyngeal membrane; stomodeum | 18 p.7 first |
| `tiroidea-jaisketa` | 3 | Descends in front of the hyoid to the cricoid (7th week); duct closes; foramen caecum stays | 18 p.7 second, p.8 first |
| `tiroidea-heldua` | 3 | Two lobes hug the larynx, isthmus in front, open behind with the 4 parathyroids; functional 3rd month; pyramidal lobe (≥50 %); thymus | 18 p.8, p.4 |
| `hortz-lamina` | 4.2 | Week 8: lamina (C shape) on both arches, invaginates | 18 p.14 A |
| `txano-kanpai` | 4.2 | Week 10 cap, papilla; detaches; bell (3rd month) | 18 p.14 B, C |
| `hortzaren-geruzak` | 4.2 | Ameloblasts → enamel; odontoblasts → dentine; cementoblasts → cementum; pulp narrows; alveolus, periodontal ligaments; crown | 18 p.14 D, right |
| `esne-behin-betiko` | 4.2 | Milk teeth 6–24 months; permanent germs in the bone from before birth, 6 years; permanent teeth push out the milk teeth; agenesis, extraction at 14–16 | 18 p.15 |

Traps: tongue body from arch I only, root from II, III and part of IV. The notes write "kupula", their figure "Kopula": show both. Body: V3 general + VII taste; root: IX anterior, X posterior, each with both senses. Muscles: somites, not arches. Thyroid: the buccopharyngeal membrane sentence in the notes says it is endodermal: follow the notes, keep it light. Teeth: the notes' wording about cementum is confused ("dentina... barnetik zementoz", "dentina bi ataletan... ZEMENTO"); the notes' own figure puts cementum on the outside of the root: draw that, KONTUZ on the wording.

### F. Study layer (after stages land; lead assigns)
`week17-quiz.ts`, `week18-quiz.ts`, Eskemak (`content/eratorriak`), learning maps, grid schemes, Irudi-fitxak and the PDF figures page, chronology, `TopicShot`, changelog (Berriak), `tests/notes.test.ts` beat count.

## REASSIGNMENT at 19:42 (overrides the owners above): hard deadline 19:58

The owner has about 20 minutes of agent time left (check the clock with `date +%H:%M`). Twelve agents now, each with one model and few stages. The stage tables above still define what each stage shows.

| Agent | Stages | Files you own |
|---|---|---|
| `skull` | as above (7) | as above |
| `pharynx` | topic 18: `sarrera`, `arraildurak-poltsak`, `lehen-poltsa`, `bigarren-poltsa`, `hirugarren-poltsa`, `laugarren-poltsa`, `guruinen-jaisketa` | `week18/pharynx-model.ts`, `Pharynx18.tsx`, `week18a*.ts` |
| `clefts` (new) | topic 17: `faringe-arkuak`, `arkuaren-osagaiak`; topic 18: `lehen-arraildura`, `beste-arraildurak` | `week18/cleft-model.ts`, `Clefts18.tsx`, `week17c*.ts`, `week18g*.ts` |
| `arches` | `bikote-kranealak`, `trigeminoa`, `lehen-arkua-luzapenak`, `bosgarren-arkua`, `bagoa` | `week17/arch-model.ts`, `Arches17.tsx`, `week17b*.ts` |
| `bones` (new) | `lehen-arkua-kartilagoak`, `bigarren-arkua`, `hirugarren-arkua`, `laringeko-kartilagoak` | `week17/bones-model.ts`, `Bones17.tsx`, `week17d*.ts` |
| `muscles` (new) | `lehen-arkua-muskuluak`, `bigarren-arkua-muskuluak`, `laugarren-seigarren-muskuluak`, `arkuen-mapa` | `week17/muscle-model.ts`, `Muscles17.tsx`, `week17e*.ts` |
| `face` | `aurpegia-hasiera`, `sudur-plakodak`, `aurpegi-fusioa`, `ildo-nasolagrimala` | `field-surface.ts`, `week18/face-model.ts`, `Face18.tsx`, `week18c*.ts` |
| `palate` (new) | `maxilar-arteko-segmentua`, `aho-sabai-gandorrak`, `sudur-trenkada-korneteak`, `aho-sabai-akatsak`, `koanak` | `week18/palate-model.ts`, `Palate18.tsx`, `week18e*.ts` |
| `glands` | `tiroidea-sorrera`, `tiroidea-jaisketa`, `tiroidea-heldua` | `week18/thyroid-model.ts`, `Thyroid18.tsx`, `week18b*.ts` |
| `tongue` (new) | `mihiaren-gorputza`, `mihiaren-sustraia`, `mihiaren-inerbazioa`, `mihiaren-muskuluak` | `week18/tongue-model.ts`, `Tongue18.tsx`, `week18f*.ts` |
| `teeth` (new) | `hortz-lamina`, `txano-kanpai`, `hortzaren-geruzak`, `esne-behin-betiko` | `week18/tooth-model.ts`, `Tooth18.tsx`, `week18d*.ts` |
| `study` (new) | quizzes, Eskemak, learning maps, grid schemes, chronology, topic cards, Berriak | listed in its brief |

Each `*Xx*.ts` above means both `weekXx.ts` (exporting `stagesXx: StageDef[]`) and `weekXx-structures.ts` (exporting `structuresXx: StructureDef[]`). They already exist as empty stubs. `week17.ts` and `week18.ts` sort the stages into the notes' order, so the file a stage lives in doesn't matter. Stage arrays use `id:` at 4 spaces of indent (the stage sheet greps it).

**Working to the deadline**
1. By 19:50 every one of your stages exists and renders: model, spec, beats citing the notes. The bar is a usable, correct, recognisable stage first; refinement after. The tree must compile whenever you save: write a file in one go.
2. 19:50–19:56: one stage-sheet pass (`--at 0.5,0.92`, your stages only), fix what is wrong, tsc on your files.
3. At 19:57, stop: whatever isn't finished goes in `docs/handover/topic-17-18-<yourname>.md` (what's left, per stage), and send your report. An unfinished stage must not stay in the array if it does not render.
4. Skip tablet shots and the full guard tests unless done early; the lead runs those after.

## REASSIGNMENT at 19:46 (overrides the tables above), same deadline

| Agent | Stages / work | Files |
|---|---|---|
| ear | 18: `lehen-poltsa`, `bigarren-poltsa` (from pharynx) | `week18/ear-model.ts`, `Ear18.tsx`, `week18h*` |
| neck | 18: `guruinen-jaisketa` (from pharynx), `tiroidea-heldua` (from glands) | `week18/neck-model.ts`, `Neck18.tsx`, `week18i*` |
| nerves | 17: `bikote-kranealak`, `bagoa` (from arches) | `week17/nerves-model.ts`, `Nerves17.tsx`, `week17g*` |
| plates | Irudiak figures and numbered plates for 17 and 18 | `public/irudiak-pdf/17-*`, `18-*`, `content/plates.ts` |
| coverage | Undefined ids, uncited notes sentences, citation checks | `week17q-structures.ts`, `week18q-structures.ts`, `docs/handover/topic-17-18-coverage.md` |

## REASSIGNMENT at 19:49: everyone stops at 20:00 (finish by 19:59)

| Agent | Stages | Files |
|---|---|---|
| larynx | 17: `laringeko-kartilagoak` (from bones), `laugarren-seigarren-muskuluak` (from muscles) | `week17/larynx-model.ts`, `Larynx17.tsx`, `week17h*` |
| archmap | 17: `arkuen-mapa` (from muscles) | `week17/ArchMap17.tsx`, `week17i*` |
| tongue2 | 18: `mihiaren-inerbazioa`, `mihiaren-muskuluak` (from tongue) | `week18/adult-tongue-model.ts`, `AdultTongue18.tsx`, `week18j*` |
| nose | 18: `sudur-trenkada-korneteak`, `koanak` (from palate) | `week18/nose-model.ts`, `Nose18.tsx`, `week18k*` |
| eruption | 18: `esne-behin-betiko` (from teeth) | `week18/eruption-model.ts`, `Eruption18.tsx`, `week18l*` |
| clefts2 | 18: `lehen-arraildura`, `beste-arraildurak` (from clefts) | `week18/cleft-model.ts`, `Clefts18.tsx`, `week18m*` |

**Correction at 19:50:** agents tongue2, nose, eruption and clefts2 could not be started (limit of 20 concurrent agents). Their stages stay with tongue, palate, teeth and clefts; parts `week18j` to `week18m` stay empty. Only larynx and archmap from the table above are running.
