# Topic 16 (genital system): figure parity with the official figure file

Status 2026-11-16, 20:00: **not started**. Stopped on the coordinator's instruction before rendering the figure file. No figure has been compared yet, and no app file was edited.

Source: `C:\Users\aitor\Downloads\Sistema genitala_irudiak_26-27.pdf` (6 pages: germ cells, indifferent stage, male and female differentiation of gonad and ducts, descent of the gonads, external genitalia, two pages of supplementary figures).

## What is known about how plates work (for whoever picks this up)

- `/fitxak` (`app/fitxak/page.tsx` -> `components/shell/PlateCards.tsx`) shows plates listed in `content/plates.ts` (`PLATES`, `PLATE_GROUPS`). A plate is not an image file: it is one of the atlas's own scene views (`week`, `stage`, `view`, `t`), and its numbers are the names that scene draws at that moment (optionally narrowed with `only`). So the names on a plate are spelled as the week-16 scene labels spell them (`components/scenes/week16/*.tsx`, `content/weeks/week16-structures.ts`, owned by the lead); a plate cannot rename a structure.
- Priority marking: `key: true` (shown as ★ Funtsezkoa). The app never says where priorities come from.
- Topic 15 has no plates yet; topics 17 and 18 have theirs inline in `content/plates.ts` (agent 17-B is editing them). Topic 16's plates would need a `{ week: 16, ... }` entry in `PLATE_GROUPS` plus plate rows; the smallest additive way is a separate `content/plates-16.ts` spread into `PLATES` (one import line and one spread in `content/plates.ts`).
- The course's own figure images are a separate, private mechanism: `private-images/` (git-ignored) read through `lib/privateImages.ts`, served by `app/api/irudiak/**` and `app/api/irudi-orriak/[file]/route.ts` with `Cache-Control: private, no-store` and `X-Robots-Tag: noindex`, never on Vercel; shown by `components/shell/PrivateImages.tsx` and `components/shell/CourseFigures.tsx`. The `irudi-orriak` route hard-codes seven page sets (`counts = [4, 3, 2, 4, 4, 8, 13]`): adding the topic-16 sheet there means a lead-owned edit to `app/**`.
- Test covering plates: `tests/plates.test.tsx` (not run).

## Figure by figure

Not done. For each of the six pages the remaining work is: render with PyMuPDF (`python -I`, high zoom), crop each figure, list every printed name, then match it to a stage and step in `content/weeks/week16.ts` and `components/scenes/week16/*.tsx`, and record missing or differently spelled names, missing or differently arranged structures (descent wall layers, epigenital and paragenital tubules, round ligament course, supplementary sagittal sections), and figures with no matching picture.
