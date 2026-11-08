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

### QA: the stage sheet (`scripts/quality/stage-sheet.mjs`)

```
node scripts/quality/stage-sheet.mjs 15 docs/quality/sheets/w15 --base http://localhost:3000 [--at 0.12,0.35,0.6,0.92] [--stages a,b]
```

- **What it shoots:** every stage of a topic at several moments, with a server running.
- **What it measures:** from the WebGL picture itself (a harness-only hook, `__glCoverage`), how much of the frame the subject covers and its bounding box, with context and ground hidden.
- **Flags:** `void`, `small`, `edge` (cut off).
- **Output:** one HTML contact sheet. Look at it beside the notes' figure pages before calling a stage done, and keep before/after sheets for any rebuild.

## Workflow for a new or rebuilt stage

1. Put the notes' figure for each step on screen.
2. Model with the organic kit: shapes with profiles, growth by arc length, branching by generation, solid ground with cut faces.
3. Light the step's subject (`dim`). Let the fit frame it; set `Step.fit` when context must stay in view, or `false` when an authored view matters.
4. Run the stage sheet at four or more moments. Fix every flag, or write down why it is right.
5. `npx tsc --noEmit -p .`, then `npx vitest run` (label, visibility and anchor guards).

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
| 16 `kanpo-genitalak`, `-emeak`, `-arrak` | The perineal skin is ground (keeps its colour), and the framing keeps the whole disc in sight. |
| 15 `sistema-biltzailea` (pilot) | Rebuilt on the kit. The bud's tip swells into the ampulla, then opens into a flattened funnel (one shape changing). Major calyces → minor calyces → two generations of collecting tubules grow by arc length, each tip an ampulla in a cap of blastema; minor calyces end in cups. The blastema becomes a bean with a hilum. |

**Owed**, roughly in order of how far each stage is from the bar:

| Stage(s) | What it needs |
|---|---|
| 15 `sinu-urogenitala`, `gernu-maskuria`, `uretra` (still owed) | Hollow organs shown cut open (lumen and wall) rather than as half-reliefs; the phallus as a solid half with the urethra in it (it is still see-through); the ducts' ends visibly absorbed into the bladder wall. |
| 15 `zakil-uretra` | A glans section with cut faces; the ectodermal cord canalising. |
| 16 gonad block stages | A solid block; sex cords as profiled vessels. |
| 16 ducts | Müller ducts fusing with a dissolving septum (uterus); profiled ducts. |
| 16 broad ligament | A folded sheet with real thickness. |
| 16 descent | A gubernaculum that shortens; a processus vaginalis that pouches. |
| 16 external genitalia | Sculpted tubercle, folds and swellings (SDF meshes built once per keyframe in the geometry worker) instead of discs and ellipses. |
