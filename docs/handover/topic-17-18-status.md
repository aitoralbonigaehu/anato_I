# Topics 17-18: what is left (2026-11-09)

All 51 stages exist and were shot at 1440 (t = 0.5 and 0.95); samples at 1024x768 and 768x1024. `tsc` is clean.
Cameras and shapes got one pass of fixes only where the shot was plainly broken.

Guards: `tests/visibility.test.tsx` and `tests/anchors3d.test.ts` pass for topics 17 and 18 (2026-11-09). The failures were fixed by naming or drawing the structure; a reasoned `GONE`/`MENTION_ONLY` entry went in only where it really leaves in that step (fontanelles closing, Meckel, Reichert, arch V, thyroglossal duct, dental lamina, the extracted tooth) or the text only mentions it. `agenesia` is an absence, so it is `LABEL_ONLY`.

Real bugs the guards found: the arch bars' rounded start hid the whole cross-section (`cleft-model.ts`, now open behind the cut face); the tooth's bands faced away (`faceMesh` in `tooth-model.ts` now judges the whole band); the sulcus terminalis had no drawn line (`tongue-model.ts`).

## Other known gaps
- Figures: 9 of the Irudiak figures have hand-typed names and estimated positions (17-6, 17-7, 17-9, 17-10, 18-4, 18-8, 18-12, 18-13, 18-19); check spelling and leaders.
- Weak visuals: `koanak` mid-steps, `bigarren-arkua-muskuluak` end (platysma sheet, eye area), `aurpegi-fusioa` end (blotchy skin colours), several flat section slabs (18 clefts, tooth germ), `arkuen-mapa` is a table, not the embryo-to-adult picture.
- Missing `where` fly-ins on most stages; few `ask` checks. Kimu class not built.
- Notes conflicts to settle: epiglottis arch (VI in 17, IV in 18); inferior parathyroid end point (1.1.3 vs 1.2); membranous ossification of the arch bones (notes vs textbooks).
- Failing before this work, at the last commit: `labels` topic 9 (3), `notes` topics 7-8 (3).
- Also failing, topic 7, not touched here: `visibility` pleura-perikardioa step 8 `errai-orria` (steps 7 and 9 already have the `MENTION_ONLY` entry; not confirmed at the last commit).
