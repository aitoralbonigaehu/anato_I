# Topic 18 face: what is left (stopped at the 19:59 deadline)

Stages `aurpegia-hasiera`, `sudur-plakodak`, `aurpegi-fusioa`, `ildo-nasolagrimala` are written (week18c*, Face18.tsx, face-model.ts) but were never seen rendered: the dev server did not answer within 40 s at the time.

Left, per stage:
- All four: shoot, compare with notes p.9–10, tune the handles (`LM`) and `relief()` in face-model.ts; cameras are `fit: false` guesses.
- `aurpegia-hasiera`: fly-in values (`where`: th 2.42, scale 1.9) are unverified.
- `aurpegi-fusioa`: the week-12 face relief (nose, lips, eyelids) is authored blind; check it reads as a face.
- `ildo-nasolagrimala`: the duct and sac are drawn just proud of the skin, not inside it (no window or cut). Decide if that is acceptable.
- Coverage: sections 4 and 4.1 up to p11 are cited; p12 onwards belongs to the `palate` agent.
- Guard tests not yet passed: run `tests/visibility.test.tsx`, labels, anchors3d for these stages.
