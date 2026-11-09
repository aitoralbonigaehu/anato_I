# Topics 17-18: arches agent, what is left (2026-11-09, stopped at the deadline)

Stages in `content/weeks/week17b.ts`: `trigeminoa`, `lehen-arkua-luzapenak`, `bosgarren-arkua`. Model: `components/scenes/week17/arch-head.ts` (sculpted skin, geo slot `arch-head`, registered in `lib/three-d/geo-registry.ts`), `arch-model.ts` (`archModel`, `AP0`, `BAR_LINE`, nerves, bars), scenes `Arches17.tsx`.

Not verified: only the bare head was seen on screen (a prototype shot). The dev server stopped answering during the final shots, so none of the three finished stages has been seen rendered. tsc and eslint printed nothing for these files, but both ran under a timeout on a loaded machine, so that is not proof they finished: re-run them. Guard tests were not run to a result.

Left per stage:
- `trigeminoa`: shoot and check cameras and label fit. The plan's second half (V1-V3 on the fetal head, notes p.6 centre) is NOT built: embryo only.
- `lehen-arkua-luzapenak`: shoot; check the stomodeum reads from the 3/4 camera.
- `bosgarren-arkua`: shoot; arch V is a ridge added on the skin, not part of it.
- Citation coverage not checked with a script (sections 2.2 title, 2.2.1, 2.5 were cited by hand). The titles 2.6 etc. belong to the agents that took those stages.
- Tablet shots not done.

Import cycle: `common.tsx` and `HeadMap.tsx` import each other and HeadMap reads ARCH at load, so any scene file that loads `common` first gets "Cannot access 'ARCH' before initialization". `Arches17.tsx` imports `./HeadMap` first as a workaround; the real fix is moving ARCH out of `common.tsx`.
