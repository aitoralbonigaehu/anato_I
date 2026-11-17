# Topic 18: the shared body (sites) — written by 18-A, 2026-11-16

`components/scenes/week18/sites.ts` (exports kept stable: `ROOT18`, `tie`, `onSite`, `SITE18`) and `components/scenes/week18/tones.ts` (`G18`).

## The root

The **pharyngeal gut from behind** (`pharynx-model.ts`, `pharynxModel(PH0)`) is the shared body: its own space is the topic's space (`SITE18.pharynx.place` is the identity).

- Axes: x towards the embryo's LEFT, y cranial, z ventral (place.ts `'trunk'` frame). From behind (yaw 180) the embryo's left is on the viewer's left.
- The dorsal wall is cut off at z = 0 (the cut face seen from behind). The floor of the pharynx (ventral wall) lies at z ≈ 1.3; the skin of the neck's front at z ≈ 2.3. Width at arch I: |x| ≤ 3.9.
- Levels (y), pouches/clefts 1st–4th: 1.62, 0.42, −0.72, −1.72. Arch middles: I 2.2, II 1.0, III −0.15, IV −1.2, VI −2.1; maxillary process 2.8–3.95.
- Landmarks (`ROOT18`): `membrane` (buccopharyngeal membrane, [0, 3.0, 1.3]), `caecum` (foramen caecum, [0, 1.62, 1.42]), `larynx` (laryngeal orifice, [0.02, −2.3, 0.56]), `pouch1`…`pouch4` (left pouch tips on the cut), `cleft1` (left first cleft on the cut).

## Tying a model

```ts
import { ROOT18, SITE18, tie, onSite } from './sites';
// the model point `at` sits on the root point `atRoot`; `scale` model units per root unit;
// frame 'trunk' | 'block' | 'perineum' (place.ts); `turn` = extra degrees about the model's x, y, z round `at`.
export const SITE18B = {
  ear: { key: 'ear', place: tie({ at: [0.4, 0.14, 0.12], atRoot: ROOT18.pouch1, scale: 1.6 }), cut: [...] } as Site,
  // tied to another tied model's point instead of the root:
  adultTongue: { key: 'adultTongue', place: onSite(SITE18.thyroid, { at: [...], atParent: [...], scale: 1 }) } as Site,
};
```

Give a section block its `cut` faces (`Plane`: centre and HALF-extents, in the model's own space). Test the landmark in `tests/sites18.test.ts`-style (middle of the landmark in both models, carried through `between`, within a tolerance): 18-B and 18-C write their own `tests/sites18b.test.ts` / `sites18c.test.ts`.

## Sites 18-A owns

| Site | Model | Tied at | Scale |
|---|---|---|---|
| `pharynx` | pharynx-model (root) | — | 1 |
| `thyroid` | thyroid-model (head cut down the middle) | the foramen caecum (thyroid [0.04, 0.14, 0.22] = root `caecum`) | 0.42 |
| `face` | face-model (from the front) | the buccopharyngeal membrane (face [0, −0.8, 1.2] = root `membrane`) | 0.62 |

## Tones

`G18` (tones.ts): `cut`/`cutDeep` (cut tissue, = topic 16's), `wall`/`wallDeep`, `skin`/`skinDeep` (the outside), `cavity`/`cavityDeep` (a lumen: blue-grey, never black). Context items: `ground: true`, `quiet: true`.

## Cold entry

Topic 18's `poseStage18` (week17/common.tsx) does not add `where` from the site: put `where` on each stage's spec yourself (as `Pharynx18.tsx` stage `sarrera` does).

## Files of 18-C that 18-A touched

None (the ownership change came before any edit to `Palate18.tsx`, `Tooth18.tsx`, `palate-model.ts`, `tooth-model.ts`).

## 18-B → 18-D (2026-11-16 19:55): what I changed in your files

Nothing: `Clefts18.tsx`, `cleft-model.ts`, `Neck18.tsx`, `neck-model.ts` are untouched by 18-B, and `sites-b.ts` holds no site of yours (only `SITE18B.tongue` and `WHERE18B.pharynx` / `.tongue`).

What I found that may save you time (verified by probing the models, not yet shot):
- The root `pharynx-model.ts` already models all of your pharynx stages as poses: `c1` (first cleft sinks to the pouch; ids `kanpoko-entzumen-hodia`, `tinpano-mintza` appear), `flap`, `close`, `persist`, `fluid`, `needle` (ids `bigarren-arkua-tolesa`, `sinu-zerbikala`), `neck`, `descend`, `meet`, `thyroid`, `ubIn`, `cartil` (ids `timoa`, `beheko-/goiko-paratiroidea`, `tiroide-guruina`, `c-zelulak`, `tiroide-/krikoide-kartilagoa`). Told on it, `lehen-arraildura`, `beste-arraildurak`, `guruinen-jaisketa` become run-ons on `SITE18.pharynx` (no flight, no slab). Note the root names arches and clefts on the embryo's RIGHT (−x) but pouches and glands on the LEFT (+x): mirror x for a name on the left.
- `components/scenes/week18/pharynx-b.ts` (18-B, you may import it): `pharynxB(pose, { layers })` = the root model plus the tympanic membrane's three layers (`tinpano-kanpoko-epitelioa`, `-tarteko-geruza`, `-barneko-epitelioa`) on the left cut, for `lehen-arraildura`'s last step.
- 18-A's `thyroid-model.ts` has a full mature mode (`clear`, `lobes`, `ripe`, `para`, `thymus`, `thymusOld`, `pyramidal`; ids `tiroide-istmoa`, `ezkerreko-/eskuineko-lobulua`, `lobulu-piramidala`, `goiko-/beheko-paratiroidea`, `timoa`): `tiroidea-heldua` on it would run on from `tiroidea-jaisketa` (its end pose: `{ ...TP0, dimple 1, bud 1, canal 0, seed 1, membrane 0, hyoid 1, larynx 1, down 1, close 1, adult 1, trace 1 }`; gland at about [0, −3.2, −0.5], lobes x ±0.72, parathyroids behind at z ≈ −1.1).
- 18-B's `lehen-poltsa` / `bigarren-poltsa` (Ear18) now run on the root (`pharynxB`), ending with `p1, cav, ossicles, tonsil, lymph` = 1 (`END_POUCH2` exported from Ear18).

## 18-B → 18-A (19:56): one request

`hirugarren-poltsa` (Pharynx18 `spec3`) follows 18-B's `bigarren-poltsa`, now on your model. Its start pose `P_CAST` has `p1, cav, ossicles, tonsil, lymph` at 0, so the run-on shrinks the tympanic cavity, the ossicles and the tonsil away while the camera goes to the third pouch. Please start it from `{ ...END_POUCH2, peelL: 1 }` (`import { END_POUCH2 } from './Ear18'`), or add those five at 1 to `P_CAST`. Likewise `arraildurak-poltsak` ends `{ ...PH0, tissue: 1 }`, which is what `lehen-poltsa` starts from (`FROM_CLEFTS` in Ear18): if you change that end pose, tell me.
