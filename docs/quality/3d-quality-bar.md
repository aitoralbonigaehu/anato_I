# 3D quality bar — topics 15 onward

From topic 15 (urinary system) onward, every 3D stage is held to the bar below. This file explains the bar, the parts of the pipeline that serve it, and the work still owed by each stage. Topics 7–14 keep their tuned look: everything here is opt-in, and the topic 15/16 stage wrappers turn it on (`components/scenes/week15/common.tsx`, `components/scenes/week16/common.tsx`).

## Why: what was wrong (audit, November 2026)

All 34 stages of topics 15–16 were shot at the middle of each stage and compared against the figures of the notes (Langman-style: the side view with the three kidney systems, the branching sequence, the ascent, sagittal sections of the sinus, the trigone, the urethra series). Five problems ran through almost every stage:

| | Problem | What it looked like |
|---|---|---|
| A | **Form** | Everything was a tube of one radius or an ellipsoid. Nephrotomes were combs, mesonephric tubules were springs, the collecting system was a ball with three sticks, the kidney was not a bean. Junctions had seams; there were no tapers, ampullae or cups. |
| B | **Context and framing** | The body was a 9%-opaque glass bubble, so organs floated in a dark void with nothing to lie on. Subjects often filled a fifth of the frame. |
| C | **Motion** | Growth was a polyline cut at its sample points (it ticked forward) or a fade-in. There was no real budding, branching, swelling or opening. |
| D | **Rendering** | There was no contact or crevice shading, so the picture was flat. Dark structures were lost against a dark background, and stacked transparency made it muddy. |
| E | **Process** | There was no written bar and no way to see a whole topic at once, so problems were found one screenshot at a time. |

## The bar

A stage meets the bar when every one of its steps passes these checks at its start, middle and end (`scripts/quality/stage-sheet.mjs`):

1. **Form reads as tissue.**
   - Ducts taper and flare into what they leave.
   - Growing tips are ampullae, and calyces are cups.
   - Organs have their real silhouette: a bean with a hilum, a funnel-shaped pelvis.
   - No seam shows where one part meets another.
2. **Growth is the process, not a fade.**
   - What buds, buds: arc length grows smoothly, with the tip leading.
   - What branches, branches generation by generation.
   - What swells or opens changes shape continuously.
   - A fade is only for what really appears or disappears (a degenerating tubule), never for growth.
3. **Solid context.**
   - The structures lie on something opaque: the posterior wall, or a cut-away block with cut faces.
   - No see-through glass body as the main context.
   - Context keeps its own neutral colour (`Item3.ground`) when the step's unlit structures recede.
4. **Framing.**
   - What the step is about fills the free middle of the frame: between the name columns, below the caption and key, above the note.
   - Everything the step names or mentions stays in the frame.
   - The camera glides and never cuts.
5. **Depth.**
   - Contacts, folds and hollows darken (ambient occlusion).
   - The lit structures are the strongest colours on screen.
   - Nothing important is dark-on-dark.
6. **Faithful to the notes.**
   - Each step can be laid beside the notes' figure for it, and the same parts are there, in the same arrangement, named the same.
7. **Cheap.**
   - Nothing is rebuilt per frame that does not change.
   - Static context is built once.
   - New GPU passes stay gated.
   - The 30 Hz cap, render-on-change and the flat fallback all still hold (`docs/review/3d-performance-resilience.md`).
8. **One body, one camera** (topic 16 onward; see "Continuity" below).
   - A topic's models all sit in one shared body. A stage change is never two pictures dissolving into each other, and never a trip out of the embryo and back.
   - Between two models the camera flies from where the student was looking to the next model, which appears where it belongs in the one just left. A section's cut is shown on the whole before the block replaces it, and where the block was when the whole returns.
   - In the same model the camera glides and the pose runs on from where the stage before left it.
   - A line says, while the camera moves, where the student has come to ("Gonada gandorra zeharka ebaki dugu, hemen…"). Names come last, when the camera has arrived.
   - The same tissue has the same tone in every model of the topic, and the ground is light enough that an unlit part still stands out of it.

## The pipeline that serves it

### Rendering: `LOOK_V2` (`lib/three-d/scene.ts`, `components/kit/three/gl.ts`)

`Scene3.look` carries the look. `LOOK_V2` turns on **screen-space ambient occlusion**, which works in three passes:

1. A half-size depth and normal pre-pass of the opaque bodies only. It uses the same materials with a shared `uPass` switch, so clipping and streams behave the same.
2. A 12-sample scalable-ambient-obscurance pass. Samples rotate on a 4×4 pattern.
3. A 4×4 depth-aware blur that cancels that pattern exactly, so no noise or flicker is left.

The body shader then darkens towards the item's deep tint (never to black). See-through items don't take it, because they are not in the depth pass.

- **Reach:** a share of the camera's distance (`aoReach`, 0.06), so it means the same thing at every zoom.
- **Cost:** only on frames that are drawn at all, which still happens only when something changes.
- **Off switch:** a viewer can turn it off with `localStorage['enbrioatlas:3d-ao'] = '0'`. A lost context still falls back to the flat picture.

### Geometry: the organic kit (`lib/three-d/organic.ts`)

| Function | What it does |
|---|---|
| `vessel(line, profile, g)` | A tube whose radius follows a **profile** by arc length: taper (`r0` → `r1`), a root `flare` into the parent, a growing-tip `bulb` (ampulla), an end `cup`, and `flat` (squashed front to back). With `g` < 1 it is grown by **arc length**: the end moves continuously and the tip shape rides on it. |
| `vesselPieces(line, profile, cuts, g)` | The same vessel split into separately named items (the ureter and the pelvis it ends in). The radius runs on across the cuts, so the joins don't show. |
| `branchTree(spec)` and `treeGeneration(tree, gen, g, look)` | A deterministic branching system: a fan per generation, lengths, radii, spread, jitter, bend, and tilt for depth. Each generation is drawn as **one** merged item (one outline, one draw). Branches root inside their parent with a flare. Growing tips are ampullae that ease into cups or rounded ends once grown. `tipsOf` gives the tips (for names, caps, drops). |
| `bean({ hilum, dent, lobes })` | An ellipsoid with a hilum dimple and optional fetal lobulation. |
| `cupShell({ center, axis, radius, thick, wrap })` | A cup with a wall of real thickness and a rounded rim, its mouth open along `axis`: Bowman's capsule, a cap of tissue over a growing tip. A solid from every side, so the inside shows through the mouth. |
| `cutOpen({ center, radii, layers })` | A solid organ with its front half taken away: the back half whole, and its layers as flat rings on the cut, each its own item (name, colour) and free to change thickness. |
| `wallSlab({ x, y, back, front })` | A cut-away block of body wall: a front surface with relief, plus cut faces and back as a second mesh in a paler section colour. Built **once** per key. |

### Framing (`lib/three-d/framing.ts`, `StageSpec.fit`, `Step.fit`)

With `fit` on the stage (on by default for topics 15–16), each step's camera keeps its authored direction. It is moved to frame that step's structures at the step's end pose:

- **What it frames:** `Step.fit`, else the lit set `dim`, else every named structure.
- **Where it aims:** the camera re-aims at the subject's middle (so "3D bira" turns round it).
- **Distance:** set so the subject's larger side fills `fill` (0.74) of the free region, within `limits` of the authored distance.
- **Shift:** centres the subject in that region.
- **Guarantee:** every point the step names, and every drawn structure's naming point that the authored camera showed, stays inside the frame. The fit backs off towards the authored camera as little as needed. The label and visibility tests (`tests/anchors3d.test.ts`, `tests/visibility.test.tsx`) check this.
- **Escape hatch:** `fit: false` on a step keeps its camera exactly as written.
- **Ground in view:** `fit: { ground: true }` frames the ground (`Item3.ground`) with the subject. Use it where the context is the subject's surface and must be seen whole, such as the perineal disc of the external genitalia.

### Continuity: sites, handovers, flights (`lib/three-d/place.ts`, `Stage3D` `handover`, `StageSpec.site`)

The standard set with topic 16. A student must always know where they come from, where they are and where they are going, and the change of stage must not interrupt.

- **A site per model.** `Site { key, place, cut? }` says where a model sits in the topic's shared body. `link(frame, scale, at, atParent)` builds `place` from one landmark seen in both models (the left gonad of the duct model is the gonad of the block cut through it). The topic's sites live in one file (`components/scenes/week16/sites.ts`) and one test keeps the landmarks together (`tests/sites16.test.ts`).
- **Opt in per stage.** `site: SITE16.gonad` and `arrive: '…'` on the `StageSpec`. A stage with a site takes the frame over by itself: the shell's cross-fade stays out (`GhostContext`, `.scene-enter:has(.stage3d.is-handover)`). Stages without a site keep the old behaviour, so older topics are untouched until they are given sites.
- **Another model → a flight** (`FLIGHT_MS`). The camera is carried into the new model's space (`carry`), so the first frame is exactly the last one of the stage before. Then, overlapping: the cut's outline glows (the new block's faces on the model left, or the block's faces left behind when the whole returns) and the arrival line shows; the camera flies (`flyCamera`: one turn of the whole attitude, no roll, distance on a log scale); the old model fades where it stands while the new one appears in its place; the names come.
- **Out and in only for a long way.** `flyCamera` draws back in mid-flight only when the two aims are farther apart than either view shows (both ends in one picture). A near move never leaves and returns.
- **Same model → a run-on** (`RUN_ON_MS`). The camera glides and every number of the pose and options goes from the last stage's to this one's (`runOn`); a switch (`back`) turns over at mid-run, when a camera coming round is edge-on to the wall. When the camera comes a long way round, the names wait for it.
- **Cold entry** (a deep link, a jump from the menu) is unchanged: the fly-in from outside the embryo (`where`), once.
- **Tones.** The grounds of a topic come from one palette (`components/scenes/week16/tones.ts`). The 3D layer shows a colour darker than its hex reads (about hex^2.2): choose ground colours by what is on screen, not by the hex.

### QA: the flight sheet (`scripts/quality/flight-sheet.mjs`)

```
node scripts/quality/flight-sheet.mjs 16 docs/quality/sheets/w16-flights [--at 0.12,0.35,0.5,0.65,0.85] [--stages a,b] [--back] [--shrink 3]
```

- **What it shoots:** every stage change of a topic, held at several moments of its move (`window.__flightAt`, a harness-only hook that holds the flight, the glide and the run-on), one strip per crossing: the stage before, then the move.
- **What to look for:** frame 1 equal to the stage before; the cut's outline on the right structure; the new model appearing on the landmark, not beside it; no frame with nothing in it; no name pointing at something not yet there; the last frame the new stage as it will stand.
- `--back` shoots the crossings backwards (the student steps back as often as forward).

### QA: the stage sheet (`scripts/quality/stage-sheet.mjs`)

```
node scripts/quality/stage-sheet.mjs 15 docs/quality/sheets/w15 --base http://localhost:3000 [--at 0.12,0.35,0.6,0.92] [--stages a,b]
```

- **What it shoots:** every stage of a topic at several moments, with a server running.
- **What it measures:** from the WebGL picture itself (a harness-only hook, `__glCoverage`), how much of the frame the subject covers and its bounding box, with context and ground hidden.
- **Flags:** `void`, `small`, `edge` (cut off).
- **Output:** one HTML contact sheet. Look at it beside the notes' figure pages before calling a stage done, and keep before/after sheets for any rebuild.

### Pitfalls met so far

- A vessel's `ref` (its reference side) must not run along the vessel: a duct cut across, running along z, needs `ref: [0, 1, 0]`, or its rings degenerate and nothing is drawn.
- Solid parts (an organ's body and its cut layers) keep `opacity: 1`: they grey out with the unlit parts but never turn see-through, or the section reads as glass again.
- Context and cut faces are `quiet` (not counted by the stage sheet's coverage) and `ground` (they keep their colour).
- **Faded solids read as glass.** A step's emphasis dims unlit parts; the stage already greys them, so a solid part must not also lose opacity (keep a `SOLID` set or skip the fade for opaque parts). Only parts that are see-through on purpose fade further.
- **A view from behind looks through the ground.** A wall plate that is the ground from the front hides everything from behind; give the model a `back` option that moves it to the far side.
- **A cut plane drawn as a sheet hides what it cuts** (and flickers against a cut face in the same plane). A handover draws the cut as an outline with a faint sheet (`frameMesh`).
- **A hex is not what is seen.** The wall brown `#7d6660` reads as a mid tone and shows as near black `(51, 33, 29)`; an unlit part on it was dark on dark. Measure a shot's pixels before choosing a ground.
- **A switch that changes at once shows.** A wall that jumps to the other side while the camera is still behind it hides the whole model for half a second; turn it over at mid-run.
- **A wall that is ground from above blocks the side view.** Split it so the near half can lift away when the camera turns (`open` in the broad-ligament block).

## Production standard 2026-11 (set on topics 16–18 with Claude Fable 5.2)

The rules below were learnt building and checking topics 16, 17 and 18 in November 2026. They add to "The bar" and to "Continuity" above, and every stage of topics 16 onward must meet them. Each topic's todo file says which ones it still misses.

### 1. One body, told on as few models as possible

- **Tell consecutive stages on the topic's root model whenever the scale allows**, as run-ons, instead of giving each a separate block. Topic 18 moved its first cleft, the cervical sinus and the glands' descent from three flat blocks onto the root pharynx (`components/scenes/week18/pharynx-d.ts`): stages 3–9 are now one model and one camera. A wrapper module (`pharynxB`, `pharynxD`) adds the stage-specific groups, name points and fades without touching the root.
- A separate model is right only when the view or the scale really changes (the tongue floor, the sagittal head, the face, the tooth). Then it gets a site.
- **A site is measured, never guessed.** Take one landmark seen in both models (`tie({ at, atRoot, scale, turn })`, `onSite(parent, …)`), and pin it with a test in `tests/sitesNN*.test.ts`: the landmark falls within a tolerance of the parent's, the place is a similarity (no shear, no mirror: `det > 0`), the sides are kept (the model's left goes to the root's left, its front to the root's front). Use `turn` when the parent is tilted (topic 17's V pharynx sits on the embryo's arches turned 34° with the flexed neck).

### 2. Every stage, every crossing

- `site` + a short Basque `arrive` line + `where` (cold entry) on every `StageSpec`. Write the `arrive` against the current `ORDER`: it describes the move from the stage before (it is read again whenever stages are reordered).
- A run-on starts exactly where the stage before ended: `pose: endPose(prevSpec).pose`, `opts: endPose(prevSpec).opts`, exported from the previous file (`END_POUCH4`, `END_SINUS`). Anything the previous stage showed that this one does not need fades in the first fifth of step 1 (`run: [0, 0.2]`), not over the whole step.
- **No spinner instead of a flight.** A model whose geometry is built off-thread must be imported in `lib/three-d/geo-registry.ts` and list its keys in the scene's static `.geo`. The shell prewarms the next and previous stages' keys while the current one plays (`components/shell/Simulator.tsx`, `warmGeo`), and `lib/three-d/geo-client.ts` builds a slot on the main thread when the worker has not answered in 30 s. A first arrival that shows "3D eredua prestatzen…" is a bug.
- If the narration names a structure the camera has cut off, the camera pulls back (or zooms out and back in) to show it.

### 3. Models

- **A deforming skin moves in small steps.** A field surface whose handles travel far (the face from week 5 to week 12) must be carried as a flow (`face-model.ts`: `carry`, `flowAt`, steps of 1/8 week, a smooth hold `w / sqrt(HOLD² + Σw²)` instead of a plain share, a monotonic `press` at the midline). One big jump folds the mesh over itself: black creases, pleats and colours smeared across their neighbours. Check with a fold probe: count the triangles whose face normal points against their vertex normals; aim for none on the visible side.
- **Sheets lie on what they cover.** A muscle sheet (topic 17's platysma) is a patch over the surface with its normal reference taken from the right centre at each height, lifted enough not to sink in; never a floating tube.
- **Show the relation, not just the parts.** When the text says A wraps B (the thyroid's U round the laryngeal cartilages), the last camera shows it from the side where that is visible, and B is thick enough to read.
- **Closing summaries are 3D.** A summary table (topic 17's `arkuen-mapa`) is a 3D model lighting each row's structures in turn, with the table beside it filled row by row in sync (`data-part`, `data-label` on rows; shared structures turn white at the end). No stage-ending flat slide.
- Organic, solid, continuous, the tones measured on screen (hex^2.2), `calm` on skin and mucosa: as in "The bar".

### 4. QA method (the order that worked)

1. **Triage the whole topic first:** stage sheet of every stage at 0.5 and 0.95 (`--shrink 2`); read every PNG; write each stage's state (good / mediocre / poor and why) into the topic's todo table.
2. **Fix the worst first**, then shoot the changed stages at five moments (`--at 0.15,0.4,0.6,0.85,0.97`).
3. **Flight sheet of every crossing** with `--dwell 5000` (more for the first heavy model; without it the strip shows the loading spinner, because the shooter leaves after 2.4 s), forwards, then `--back`.
4. Tablet sizes: `--vw 1024 --vh 768` and `--vw 768 --vh 1024`; side tables and right-hand names must fit at 768.
5. One shooter at a time on the single dev server; no source edits while a shooter or vitest runs; never import a file before it exists.
6. `tsc`, the site tests and the guard set (`notes`, `visibility`, `anchors3d`, `labels`, `content`, `chronology`). Then a fresh-context review before calling a batch done.

### 5. Plan files

Each `docs/handover/topic-NN-todo.md` starts with a dated **"State on <date> — READ THIS FIRST"** section with three lists: *done and looked at*, *changed but not yet seen on screen*, *owed* (highest value first, with exact files and functions). Older sections stay below it as history. When work stops, those lists must say exactly what is left.

## Workflow for a new or rebuilt stage

1. Put the notes' figure for each step on screen.
2. Model with the organic kit: shapes with profiles, growth by arc length, branching by generation, solid ground with cut faces.
3. Light the step's subject (`dim`). Let the fit frame it; set `Step.fit` when context must stay in view, or `false` when an authored view matters.
4. Run the stage sheet at four or more moments. Fix every flag, or write down why it is right.
5. Give the model its site (one landmark shared with the model the story reaches it from), give each stage its `site` and `arrive` line, and run the flight sheet forwards and with `--back`.
6. `npx tsc --noEmit -p .`, then `npx vitest run` (label, visibility and anchor guards).

## Status of topics 15–16 (after the foundation pass)

**Done:**

| Stage(s) | What changed |
|---|---|
| All topic 15–16 views | Ambient occlusion and framing. |
| Wall views: 15 `sarrera`, `pronefrosa`, `mesonefrosa`, `metanefrosa`, `giltzurrun-igoera`; 16 `sarrera`, `hozi-zelulak`, `muller-hodia` | Now lie on a solid cut-away posterior wall (vertebral ridge, paravertebral gutters, somites standing out of it) instead of the glass body. |
| 15 `nefrotomak`, `glomeruluak`, `mesonefros-hodixkak` (section block) | The glass ellipse became a solid section plate with dark coelom faces. Tubules, aortic branches and arterioles are profiled vessels, the tubule ending in a Bowman cup round the glomerulus. |
| 15 `mesonefrosa`, `metanefrosa`, `giltzurrun-igoera` | Pronephric and mesonephric tubules, the Wolff and Müller ducts and the ureteric bud are vessels grown by arc length; mesonephric tubules are S-shapes with a cup. Kidneys are beans whose hilum turns from ventral to medial as they rise. |
| 15 `nefrona` | Lies on a cut face of the cortex. The collecting tubule tapers, its branches flare out of it into ampullae, and the cap is a cup of tissue over the ampulla. The nephron is one vessel whose centre line bends from the vesicle (a ring round its lumen) to the comma, the S-shaped body and the grown nephron. Its near end flares into the ampulla as they fuse; its far end carries a double-walled cup (`cupShell`) round a lobed glomerulus, the mouth turned to the arterioles. The later nephrons go through the same development one after another. |
| 15 `giltzurrun-gaineko-guruinak` | A solid gland cut open (`cutOpen`): its back half whole, its layers as rings on the cut face. The definitive cortex spreads in as the fetal cortex thins to nothing; the medulla shrinks, then grows. It lies on the posterior wall, with the urogenital ridge below (its cells stream up into the fetal cortex) and, medially, the aorta and the sympathetic trunk. The crest cells leave the ganglion as a chain and settle into a cluster that becomes the medulla. |
| 15 `sinu-urogenitala`, `gernu-maskuria`, `uretra` (side views) | The body is a solid cut down the middle: an opaque mid-sagittal cut face (`plate` in the sagittal plane) with the skin round it and the vertebral bodies along the back, the organs lying half in it. The urorectal septum grows down as a fold with a rounded leading edge. The rectum, allantois, ducts and urethra are profiled vessels. |
| 15 `gernu-maskuria` (back view) | A solid bladder against the anterior wall (the ground seen past it); the urethra and urachus flare out of it; the ducts flare into its wall where they open. |
| 15 `zakil-uretra` | A solid half cut lengthwise: the back half whole, the cut face (shaft and glans tissue, the skin as an ectoderm band along its edge) facing the viewer, a rounded tip. The urethra, the ectodermal cord and the prepuce lie half in the cut. |
| 16 `desberdindu-gabea`, `barrabila`, `obarioa` (gonad block) | A solid cross-section: the dorsal wall as an opaque cut face with the aorta, the mesonephros and the ducts cut across in it, the coelom dark behind. The gonad hangs into it as a solid cut organ whose layers (epithelium, tunica albuginea, the ovary's medulla) are rings on its cut face and only grey out, never go see-through. The cords are tapered vessels grown by arc length, rooted in the epithelium until they come free and flared into the rete; follicle cells are a ring round each oocyte. |
| 16 duct views (`hiloa`, `hodi-genitalak-arrak`, `semen-bidea`, `hodi-genitalak-emeak`, `bagina`, `baginaren-jatorria`, `jaisketa-emeak`, the female view of `jaisketa`) | Everything lies on an opaque posterior wall plate (moved to the far side for the from-behind view of `lotailu-zabala`). The ducts, tubules, epididymis, ligaments and gubernaculum are profiled vessels; the Wolffian duct thins away in the female and the Müllerian duct in the male instead of fading. The Müllerian ostium is a cup; the two uterine canals converge into a pear-shaped uterus (flattened front to back); the seminal vesicle buds as a vessel with a bulb; the mesonephros shrinks on the wall. |
| 16 `lotailu-zabala` (block) | A solid pelvic slab: the body wall a ring with thickness (cut face on top, lined with peritoneum) on a dark cavity floor; the folds are sheets with real thickness running the slab's height, from the side wall to the ducts; the ovaries, uterus and bladder are solid (the two pouches stay see-through: they are spaces). When the block turns to its side, the wall's near half lifts away so the row bladder → pouch → uterus → pouch → rectum shows. |
| 16 `jaisketa`, `jaisketa-arrak` | A solid parasagittal cut through the testis's plane: the trunk's tissue, the peritoneal cavity a dark recess, the anterior wall its own muscle band; the testis sits in the posterior wall behind the peritoneum. The scrotum, the wall layers the processus vaginalis carries, its sac and the tunica vaginalis are half-shells (`cupShell`) cut open towards the viewer, so they read as concentric layers round the testis. The gubernaculum is a thick cord lying along the testis's way, outside the peritoneum; it shortens as the testis follows it, then shrinks away. |
| 16 `kanpo-genitalak`, `-emeak`, `-arrak` | The perineal skin is ground (keeps its colour), and the framing keeps the whole disc in sight. The swellings are mounds rising out of the skin, the folds ridges tapering into it, the tubercle one shaft flaring from it with an ovoid glans (longer in the male). Unlit parts recede to grey but stay solid; only the fused folds over the penile urethra stay see-through, on purpose. |
| 15 `sistema-biltzailea` (pilot) | Rebuilt on the kit. The bud's tip swells into the ampulla, then opens into a flattened funnel (one shape changing). Major calyces → minor calyces → two generations of collecting tubules grow by arc length, each tip an ampulla in a cap of blastema; minor calyces end in cups. The blastema becomes a bean with a hilum. |

**Owed**, roughly in order of how far each stage is from the bar:

| Stage(s) | What it needs |
|---|---|
| 15 `sinu-urogenitala`, `gernu-maskuria`, `uretra` (still owed) | Hollow organs shown cut open (lumen and wall) rather than as half-reliefs; the phallus as a solid half with the urethra in it (it is still see-through); the ducts' ends visibly absorbed into the bladder wall. |
| 16 ducts (uterus) | The fusion is shown as the canals converging into one pear; a septum that dissolves between two lumens would teach the uterine anomalies (septate, bicornuate) better. |
| 16 external genitalia (finer sculpting) | The parts are still separate primitives grown out of the skin. One continuous surface (an SDF mesh built once per keyframe in the geometry worker) would remove the seams where they meet; the labia majora and the scrotum's raphe would gain the most. |
