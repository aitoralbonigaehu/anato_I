# Topic 17: the shared body (sites) — for 17-C (2026-11-16, agent 17-A)

Files: `components/scenes/week17/sites.ts` (root, helpers, my sites), `components/scenes/week17/tones.ts` (ground palette), `tests/sites17.test.ts`.

## The root

The fetal skull, `skull-model.ts` at `SKULL0`. Its space is the shared body (`SITE17.skull.place` is the identity).

- Axes: x the fetus's LEFT, y cranial, z ventral (place.ts `'trunk'`). Units: skull units.
- Origin: the middle of the vault. Head ≈ 6 long (z −3.1 … 3.2), x ±2.46; vault top y 2.3; chin y ≈ −3.3; hyoid body y ≈ −4.0, z ≈ 1.6.

## Landmarks (`ROOT17`, stable)

| name | point | what |
|---|---|---|
| `vault` | 0, 0, 0 | middle of the vault |
| `brain` | 0, 0.3, 0 | middle of the cranial cavity (a brain seen from below ties here) |
| `sella` | 0, −1.0, 0.62 | hypophyseal fossa on the base |
| `magnum` | 0, −2.1, −1.17 | foramen magnum |
| `parietalL` | 1.2, 1.15, −0.5 | left parietal's middle |
| `squamaL` | 2.24, −0.2, −0.19 | left temporal squama |
| `earL` | 2.15, −1.66, 0.04 | left middle ear (malleus, incus) |
| `mandibleL` | 1.12, −2.47, 1.59 | left mandible's middle |
| `chin` | 0, −3.2, 2.7 | chin |
| `mouth` | 0, −2.3, 2.45 | mouth (embryo's stomodeum) |
| `styloidL` | 1.62, −2.5, 0 | left styloid |
| `hyoid` | 0, −4.0, 1.57 | hyoid body; the larynx hangs under it |

## Helpers (stable)

- `tie17({ at, atRoot, scale, frame?, turn? })`: the root point `atRoot` lands on the model's point `at`, `scale` model units per root unit. Same as topic 18's `tie`.
- `onSite17(parent, { at, atParent, scale, frame?, turn? })`: tie to a point of an already tied model.
- `TABLE`: spread into `tie17` for a model on a table seen from above, face at the top (x the body's right, y anterior, z up).

## My sites (`SITE17`; numbers may still be tuned, keys stable)

`skull` (root), `base` (base-model, at the sella), `oss` (ossification blocks, at the left squama), `arch` (embryo head, arch-model, stomodeum on the mouth, 1.15 per skull unit), `bones` (bones-model, malleus at the left ear, 1.5 per unit), `archV` (week18 cleft-model `archVModel`, through `arch`).

Suggested ties for 17-C's models (all are in the trunk frame): muscles on the skull itself (the fetal head; probably scale ≈ 1, tie at `mandibleL` or `hyoid`); larynx at `hyoid` (its hyoid onto the root's); nerves (brain from below) at `brain`, scale ≈ 1.35 (its brain is x ±3.2 against the skull's cavity ±2.3).

## Cold entry

`WHERE17` in `common.tsx` (per site key). `poseStage17` looks up `WHERE17[spec.site.key]` when the spec has a `site` and no `where` (added; nothing changes for specs without a site). 17-C may add its keys' entries in its own file and pass `where` on the spec instead.

## Files of 17-C I changed

None.

## 17-C → 17-D (2026-11-16, 19:55): what I changed in your files

Nothing: `Muscles17.tsx`, `muscle-model.ts` and `ArchMap17.tsx` are untouched, and `sites-c.ts` holds only my own sites (`nerves`, `larynx`). Notes you may use:
- Measured fit of the current muscle head onto the root skull (chin, hyoid, styloid, ear, maxilla, vault top): muscle ≈ 0.78 × skull + (0, 1.18, −0.42); e.g. `tie17({ at: [0, -1.94, 0.84], atRoot: ROOT17.hyoid, scale: 0.78 })`. Spread about ±0.25 in y.
- The muscle model's bone patches render dark (inverted facing or recede on thin patches) and the platysma is a flat cylinder sheet; I was going to rebuild the muscles on the root skull itself (skullModel, tie identity), recolouring the skull's face items by arch per row.
- `SITE17C.larynx` is the larynx model's site (`laugarren-seigarren-muskuluak` → `arkuen-mapa` crosses from it): its larynx middle is `LARYNX_MID` in `sites-c.ts`.
