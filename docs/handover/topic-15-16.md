# Topics 15–16 handover: "Sistema urogenitala" and "Sistema urogenitala (gonadak)"

Owner's brief (2026-11-04): add topics 15 then 16; topic 14 did not convince, the circulation topics (10–13) read
more clearly: build on them, keep their best, avoid topic 14's weak points.

## What was taken from topics 10–13 (and what was avoided from 14)

- One posed 3D model per subject, always with its context in sight (topic 12/13's trunk and embryo glass): the
  posterior body wall (`week15/uro-model.ts`) carries topics 15 and 16 from the pronephros to the gonads' ducts.
- Saturated colour by origin, kept through both topics and stated in every view description; keys of at most
  four short entries (topic 14's long keys ran under the frame's controls).
- Names in the edge columns; the right column kept to [236, 468] (above the camera keys, below the toolbar).
- Fewer, focused stages (15 and 19) of 2–8 steps, each step one verb on screen; no free-floating primitives:
  organs are drawn in their section or wall.
- 100 % of the notes' sentences cited by some beat (checked with a throwaway script); every notes trap is a
  KONTUZ (e.g. nephrotomes "from somites" vs intermediate mesoderm; mesonephros functional or not; the two
  names of the round ligament; 4.2's "obarioaren euspen lotailua: obariotik uterora").

## Files

- Notes: `scripts/notes/extract.py` (FILES + `--weeks 15 16`, keeps the other topics' files and manifest),
  `content/notes-text/w15.ts`, `w16.ts`, manifest entries. Source PDFs: `15._GAIA_SISTEMA_UROGENITALA_Zuzenduta.pdf`,
  `16_GAIA_SISTEMA_UROGENITALA_GONADAK_zuzenduta.pdf`.
- Topic 15 models (`components/scenes/week15`): `uro-model` (wall; also topic 16's Müller duct, yolk sac and germ
  cells), `unit-model` (section block: nephrotome → tubule → glomerulus/capsule), `kidney-model` (collecting
  system), `nephron-model`, `adrenal-model`, `pelvis-model` (sagittal: cloaca → sinus, urachus, urethra),
  `trigone-model` (bladder from behind), `glans-model`. Scenes: `Wall3D`, `Unit3D`, `Detail3D`, `Pelvis3D`.
- Topic 16 models (`components/scenes/week16`): `gonad-model` (indifferent → testis / ovary), `duct-model` (front
  view of both ducts → male / female, ligaments, vagina, female descent), `broad-model` (pelvis cut across:
  broad ligament and pouches), `descent-model` (gubernaculum, processus vaginalis, inguinal canal),
  `external-model`. Scenes: `Wall16`, `Gonad16`, `Ducts16`, `Other16`.
- Content: `content/weeks/week15.ts` + `week15b.ts` (stages), `week15-structures.ts`, `week15-quiz.ts`;
  `week16.ts`, `week16-structures.ts`, `week16-quiz.ts`; `content/notes.ts` (NOTES[15], NOTES[16]; 3.2.1 and
  3.4.1 are covered by 3.2 and 3.4, the TOC format allows one dot); Eratorriak schemes in
  `content/eratorriak/schemes-15-16.ts` and three learning maps per topic.
- Shared, additive: `week14/common.tsx` `poseStage` takes a continuity, `axes` and `right`; registry, types,
  narration max week 16, Specimen, TopicShot.

## Checks at hand-over

`npx tsc --noEmit` clean; eslint clean on the new files; `npx vitest run`: only the 7 failures that were there
before (topic 7 anchor, figure parity 7–9, three topic 9 label cases, pleura-perikardioa). Screenshots of every
stage at 1440×900 reviewed. Not done: tablet sizes, the Kimu class for 15–16, narration audio.
