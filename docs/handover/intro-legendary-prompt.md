# Prompt: the EnbrioAtlas opening and onboarding, rebuilt live

Paste everything below the line into a fresh session opened in this repository.

---

You are rebuilding the first 90 seconds a medical student ever spends in EnbrioAtlas: the opening sequence and the five-stop onboarding that follows it. The owner (a medical student who builds this for classmates at the Basque university) wants the first visit to be a show: students should feel "I have never seen embryology like this" before they read a single word, and then be using the product within a minute. The current attempt does not do that, and the owner said so plainly. Your job is the version they would be proud to project in a lecture hall.

## What exists and why it fails

- `components/onboarding/Journey.tsx` runs five stops (Hasiera, Simulagailua, Belortzioak, Kimu, Hasi ikasten). Its copy is good. Keep the wording unless a stop's interaction changes.
- `components/onboarding/ReleaseFilm.tsx` plays a pre-rendered 46 s video (`public/intro-v2/*.mp4`, about 37 MB for both orientations) made by `scripts/intro-v2` (Blender plates composited in Python). When it ends, a still `.webp` shrinks into the first stop.

The owner's verdict, and mine after watching it frame by frame:

1. It is a video in a product whose whole point is live 3D. It is soft on a big screen, heavy to load, and the one moment that should be alive is a still picture.
2. It is four times too long, holds still for seconds at a time, and loops back to an image it already showed.
3. The dots do not organise. They are random samples of a 2D render, so they pass through a smeared cloud and settle into a grainy blob with no readable head, somites or limb buds. A hard gold/blue seam runs down the body.
4. The solid embryo looks like glossy clay, with pebble somites and vessels drawn as right-angle orange traces.
5. A chrome "V2" and a teal fibre tunnel have nothing to do with the brand or with embryology.
6. The handoff is a visible cut: a black rectangle on a brown-black page.

Do not patch the video. Replace it.

## The idea

The first stop's headline is "Hitzetatik formara." (from words to form). That is the product's promise, so make the opening perform it literally:

**The student's notes become the embryo, live, and the embryo never leaves the screen again.**

One WebGL canvas carries the whole first visit. It opens the show, it becomes the art of the first onboarding stop without a cut, and every later stop is a camera move on that same canvas.

### The sequence (about 13 s, one continuous camera move, no cuts)

0. **Threshold.** Dark screen, one slowly pulsing point of light, two buttons: "Sartu soinuarekin" and "Soinurik gabe". This click is what lets the browser play sound, and it builds a second of anticipation. A returning visitor never sees it.
1. **Words (0–1.5 s).** A few real lines from the course notes (take them from `content/notes-text/`, something about the week-4/5 embryo) hang in the dark, in soft focus, as the student knows them: text.
2. **Lift-off (1.5–3 s).** Each letter breaks into points of light. They leave the page and stream into a current.
3. **Formation (3–7.5 s).** The points build the week-5 embryo in the order the notes teach it: the midline first, drawn head to tail along the C curve; then the somites, snapping on in pairs from cranial to caudal like beads, on the beat; then the head swelling and the pharyngeal arches; the heart bulge; the limb buds last. At every moment a student should be able to name what just arrived. The camera pushes in and orbits about 40°.
4. **Life (7.5–9.5 s).** A band of light sweeps crown to tail. Where it passes, the points sink into a surface and the skin appears: translucent, lit from behind, with the heart glowing inside and beating. Hold the best frame for a second. That frame is also the poster.
5. **Name (9.5–12 s).** The camera settles on the pure lateral view. "EnbrioAtlas" writes in beside it, set in the onboarding's serif display face, with "Hitzetatik formara." under it. "V2" is a small tag, not the hero. If the embryo's curl can line up with the BrandMark for a beat, do it.
6. **Handoff (12–13.5 s).** The embryo glides to where the first stop's art sits and the stop's text fades in beside it. Same canvas, same embryo, still beating, and now it answers to the student's drag.

### The onboarding (five stops, under 60 s, one thing to do at each)

The canvas persists behind all five. Moving between stops moves the camera; nothing is swapped.

1. **Hasiera.** The embryo idles and beats. The student's first act in the product is turning it. Show a drag hint only if they have not touched it after 3 s.
2. **Simulagailua.** The camera flies into the face and arrives inside the palate model (`PalatePreview`, topic 18). The student scrubs the timeline and watches the shelves rise and meet.
3. **Belortzioak.** Pull back; the model resolves into a notes plate with a hidden name. The structure being asked about glows. The current trial draws a target ring: the owner has a standing rule against drawn pointers, so light the structure itself instead.
4. **Kimu.** Three question chips answered by the real engine in `lib/kimu` (it works offline). Pick questions whose answer points at something on the embryo, and let "take me there" fly the camera to it and light it. That is Kimu's real trick; show it.
5. **Hasi ikasten.** The embryo returns to rest. Devices advice, account, and the start button. Leaving for Home should also avoid a hard cut.

Every stop can be skipped, arrow keys work, and the whole opening can be replayed later from somewhere sensible.

## What makes it look expensive

These are where the current version lost, so spend your effort here. Treat the list as a floor and use better techniques if you know them.

- **Points with a job.** Sample target positions on the surface of the real mesh (`embryo5()` in `lib/three-d/embryo5.ts`, the one lateral embryo the whole app reuses), evenly, area-weighted with blue-noise spacing. The mesh has no region tags, but `axisAt(θ)` gives the cranio-caudal position and the SDF `field` gives you the limb buds, so each point can carry a region and an arrival time. Animate entirely in the vertex shader (start, target, delay, seed as attributes): a curl-noise current, then a critically damped arrival. No per-frame CPU work.
- **Density and optics.** Roughly 150–250 k points on a laptop, 60–80 k on a tablet. Soft round sprites, HDR additive, real depth of field (points off the focal plane grow and fade into bokeh), bloom that only catches highlights.
- **Skin, not clay.** A custom surface shader: wrapped diffuse, back-light transmission scaled by thickness, a fresnel rim, fine normal detail, no hard specular blotches. Inner structures (heart, neural tube) drawn first so they glow through. Somites come from the mesh. No drawn vessels, no orbit rings.
- **A place.** The embryo floats in fluid: slow drifting motes at several depths, a soft light shaft, depth fog in the page's own brown-black so the canvas has no edge.
- **One pulse.** Everything keys to a heartbeat: the heart's glow, a faint breath in the bloom, the rhythm the somites arrive on, and the sound (a low thump plus an airy pad, synthesised with WebAudio so there is no asset to license).
- **Finishing.** Filmic tone mapping, light grain, a gentle vignette, eased camera with a trace of drift. Colours from the app's existing structure palette.
- **Type.** The film and the onboarding share the same two typefaces and the same motion curves, so it reads as one product.

## Constraints

- Target is PC and tablet. Check at 1440×900, 1024×768 and 768×1024 (portrait). Phones only need to not break.
- 60 fps on a mid laptop with integrated graphics, 30+ on a tablet. Pick the quality tier from a short measurement at start and step down if frames drop. First frame within 2 s of the click on a normal connection; nothing here should block the rest of the app from loading.
- No WebGL, or reduced motion requested: show the poster frame and go straight to the onboarding.
- The embryo must be anatomically honest for week 5. Anatomy teachers will see this. Invent nothing.
- All interface text is in Basque.
- Never mention past exams anywhere.
- The repo is on Next.js 16 with breaking changes: read `AGENTS.md` and the guide it points to before writing code. The stack already has three 0.186, React Three Fiber 9, drei and gsap; no post-processing library is installed, so use three's own passes or justify adding one.
- Another worker has been editing `components/onboarding/*` and `public/intro-v2/*` today. Confirm with the owner that they have stopped before you touch those files. Build the new sequence in new files (for example `components/onboarding/intro/`), switch it on behind a query flag, and leave `ReleaseFilm` and the videos in place until the owner approves the replacement.
- Do not commit, push, stash or reset. Most of the onboarding is uncommitted work in this folder.

## How to work

The last version was built end to end and then rejected on its look. Avoid that by getting the look approved first.

1. **Hero still.** One frame of beat 4, the lit translucent embryo in its fluid, at 1440×900 and 768×1024. Stop and show the owner. Iterate until they say yes.
2. **Formation.** Beats 1–4 moving. Make time a parameter (`?t=7.5` freezes the sequence at that second) so every review is reproducible.
3. **Name and handoff.** Beats 5–6 into stop 1.
4. **Stops 2–5** on the shared canvas.
5. **Trailer (optional).** Capture the live sequence frame by frame to a 1080p video the owner can share with classmates.

At the end of each stage, shoot a contact sheet (one frame every 0.5 s) with headless Chrome and look at it critically yourself before you show it; the in-app browser pane does not run animation frames, so it cannot be used to judge motion. Check each sheet against the six failures listed at the top. Report what you measured (frame rate per device tier, bundle and asset weight, time to first frame) and say plainly what is not finished.

Done means: the owner watches the opening once, cold, at full screen, and wants to show it to someone.
