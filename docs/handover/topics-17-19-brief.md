# Topics 17, 18 and 19: the shared brief (2026-11-16)

Owner's brief: "a new standard of quality from which we keep building the next topics": a topic must feel like one unified, continuous experience, really nice to follow; better animations and 3D models; the student always knows where they come from, where they are and where they are going; a change of stage is never an interruption. Topic 16 was rebuilt to that standard first. Topics 17 and 18 (first pass built 2026-11-09) are brought up to it, and topic 19 (nervous system) is built new, at it.

Twelve agents work at once in this tree (four each on topics 17 and 18, three on 19, one on topic 16 figures) while the lead keeps working on topic 16 and the shared kit. Read this whole file, then your own task.

## Read first (short)

1. `docs/quality/3d-quality-bar.md`: the bar. Point 8 and the section "Continuity: sites, handovers, flights" are the new standard; "Pitfalls" are real failures.
2. How topic 16 does it (copy the structure):
   - `components/scenes/week16/sites.ts`: the topic's models in one body. `lib/three-d/place.ts`: `Site`, `link`, `chain`, `invSim`.
   - `components/scenes/week16/tones.ts`: one ground palette for the topic.
   - `components/scenes/week16/common.tsx`: `WHERE16` (a cold-entry fly-in per site, applied by the `poseStage` wrapper).
   - `components/scenes/week16/Gonad16.tsx`, `Ducts16.tsx`: each `StageSpec` has `site:` and `arrive:`.
   - `tests/sites16.test.ts`: keeps the shared landmarks together.
   - `components/scenes/week14/common.tsx`: `StageSpec` (`site`, `arrive`, `where`), `poseStage` (run-on of the pose), `Where`.
3. `docs/handover/topic-17-18-plan.md`: the rules every topic follows (content, 3D, labels, cameras). They all still hold. Its "Rules" section is required reading for topic 19 too.
4. `AGENTS.md`: this Next.js is not the one you know; scene and content work does not touch the framework, routing work must read `node_modules/next/dist/docs/` first.

## The standard, as a recipe

For each topic:

1. **Sites.** List the topic's 3D models. Pick the root (the model most stages use) and tie every other model to the one the story reaches it from, by one landmark the student is watching at that moment (`link(frame, scale, at, atParent)`; a section block also gets its `cut` faces). One file `components/scenes/weekNN/sites.ts`, one test `tests/sitesNN.test.ts` (the landmark's middle in both models, carried, within a tolerance).
2. **Every stage gets `site` and `arrive`.** `arrive` is one short Basque line shown while the camera moves: where we have come to and how it relates to what we just saw ("Gonada gandorra zeharka ebaki dugu, hemen: blokea goitik ikusiko dugu"; "Ebakia hemen zegoen. Orain atzeko pareta osoa, aurretik"). A stage with a `site` takes the frame over by itself: between two models it is one camera flight, in the same model the camera glides and the pose runs on. A 2D view (an SVG scheme) has no site and keeps the shell's cross-fade.
3. **The pose must be able to run on.** Stages on the same model share one pose type; a stage's start pose equals the end pose of the stage before on that model (`endPose(spec)`), or the numbers differ and the run-on shows the change (which is fine when it is a real change, and a jump to look at when it is not). Switches in `opts` (`back: true`) turn over at mid-run.
4. **Cold entry.** Every stage has a `where` (per site, as `WHERE16`), so a stage opened from a link or the menu flies in from outside the embryo. For a model that is not embryonic (an adult skull, a tooth), use the fly-in only if it reads; otherwise none.
5. **Tones.** One ground palette per topic, light enough that an unlit part stands out of it. The 3D layer shows a colour much darker than its hex reads (about hex^2.2: `#7d6660` shows as `(51, 33, 29)`). Choose by the screenshot's pixels. Body cavities are a blue-grey recess (`G16.cavity`), never black. The same tissue has the same tone in every model of the topic.
6. **Flight sheet**, forwards and with `--back`, over every stage change you own; then the stage sheet at 1440 and at 1024×768 / 768×1024 for the stages you changed. Look at every strip; fix what does not read as one move.
7. **3D models at a professional level.** The owner asked again today for better models. Organic shapes (`lib/three-d/organic.ts`), no faceting, no seams, solid context, growth as growth; read "The bar" points 1–3 and the list of weak visuals in `docs/handover/topic-17-18-status.md`.

## Tools

The dev server runs at `http://localhost:3000` (the lead started it). Do not start another in this folder. If it is down, check once more a minute later; if still down, start `npx next dev -p 3000` in the background and say so in your report.

```
export NODE_PATH="C:/Users/aitor/AppData/Local/npm-cache/_npx/9833c18b2d85bc59/node_modules"
export CHROME="C:/Users/aitor/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe"
node scripts/quality/flight-sheet.mjs 17 <your scratch dir>/fl --stages a,b --at 0.12,0.35,0.5,0.65,0.85 --shrink 3
node scripts/quality/flight-sheet.mjs 17 <your scratch dir>/flb --stages b,c --back --at 0.15,0.5,0.85 --shrink 3
node scripts/quality/stage-sheet.mjs 17 <your scratch dir>/st --stages a,b --at 0.3,0.6,0.95
node scripts/quality/stage-sheet.mjs 17 <dir> --stages a --vw 1024 --vh 768      (check the flags the script takes first)
```

- Always pass `--stages` (the software GPU is slow and seven sessions share this machine). `--stages` names the stages to cross FROM.
- The PNG strips are the evidence: `Read` them. A page compiled while another agent was saving a file can come out broken: shoot that one again before concluding anything.
- PDFs and DOCX: `Read` does not work on these PDFs here. Render pages with PyMuPDF (`python -I`, `import fitz`) into your scratchpad and `Read` the PNGs; for DOCX use `python-docx` or unzip it (figures are in `word/media`).
- Inline shell heredocs with apostrophes or template strings break in this shell: write a Python or Node script file to your scratchpad and run it. Files here use CRLF in places: keep each file's line endings.
- Type check: `npx tsc --noEmit -p .` checks the whole tree, and other agents' half-saved files show up in it. Fix only errors in files you own; an error elsewhere that lasts, mention in your report.
- Tests: run only yours (`npx vitest run tests/sitesNN.test.ts`, `npx vitest run tests/visibility.test.tsx -t "17. gaia"`, `tests/anchors3d.test.ts`, `tests/labels.test.ts`, `tests/notes.test.ts` filtered the same way). The whole suite takes eight minutes: do not run it.

## Working in the shared tree

- **Touch only the files you own** (your task lists them). New files go in your topic's folders.
- **The lead owns** `components/kit/**`, `components/shell/**`, `lib/three-d/**`, `components/scenes/week14/common.tsx`, `components/scenes/week15/**`, `components/scenes/week16/**`, `scripts/quality/**`, `app/**`. If you need a change there, append a dated entry to `docs/handover/kit-requests.md` (what, why, the smallest change that would do) and work round it meanwhile. Exception: a pure addition to `lib/three-d/organic.ts` (a new shape function, nothing existing changed) is allowed; say so in your report.
- Other shared files (registries such as `content/notes.ts`, `content/weeks/index`, `lib/narration/server-utils.ts` `MAX_WEEK`, test lists): the smallest additive edit, never a reformat, and list each one in your report.
- **Never leave the tree unbuildable.** Every page of the app compiles all topics: an import of a file that does not exist yet (or a half-written file saved) gives a 500 on every page for every session and stalls everyone's sheets. Write the new file first, then the import; save a file only when it parses. If pages return 500, read the error before shooting: if it is in your file fix it at once; if it is another agent's, wait a minute and try again.
- No git command that changes state (no commit, stash, checkout, reset, restore). Nothing is committed until the lead has reviewed.
- Do not spawn further agents. Do not edit files under `C:\Users\aitor\.claude`.
- Text in the app is Basque, in the notes' own terms. Nothing anywhere about past exam questions.
- The lead may send you further topic-16 improvements while you work (a message, or a new dated section at the end of this file under "Later improvements"): read that section again before your final checks.

## Your report (the last thing you write)

Plain and short: what now works (per stage or group), what you verified and how (which sheets, which tests, with their results), what is not done or not verified, every shared file you touched, every kit request. Give the paths of your sheets. Do not claim a stage is done if you did not look at its strip.

## Later improvements

### 2026-11-16, evening

- `Item3.calm` (`lib/three-d/scene.ts`): a part of one continuous living surface (skin, mucosa: swellings, folds, prominences) steps back when unlit by losing a little colour, and never goes dark or grey. Without it an unlit swelling on light skin is a dark lump that reads as a bruise. Set it on surface parts; not on organs lying on a ground.
- `Step.half: 1 | -1` (`components/scenes/week14/common.tsx`): on a paired model the step's camera frames only the embryo's left (1) or right (−1) copy of what it is about, with the midline. Use it for small paired details that are too small when both sides are framed.
- `runOn`: a boolean the next stage does not set at all (it was `true`, now absent) also stays on until mid-run.
- The cut's outline in a flight is a thin frame with a faint sheet (`frameMesh`); long flights draw back in the middle (`flyCamera`), short ones never do.
