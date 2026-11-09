# Topics 17-18, skull agent: what is left

Stages in `content/weeks/week17a.ts`: `sarrera`, `kraneoaren-bi-atalak`, `josturak-fontanelak`, `buru-ganga`, `errai-kraneoa`. `hezurtze-motak` and `kondrokraneoa` went to agent `base`. `skullModel` still contains a base (`carti`, `boneL`, `boneR`), usable by that agent.

Not done because time ran out:
- None of the five stages has been looked at in a browser: the dev server did not answer and `playwright` could not be loaded by the stage sheet. All cameras, label anchors, and bone shapes (face SDFs especially) are unverified.
- `HeadMap.tsx` silhouette not polished (only a load-order crash fixed).
- `kraneoaren-bi-atalak`: the p.1 figure (embryo head with processes) has no matching picture.
- Guard tests (visibility, labels, anchors3d), eslint, tablet shots not run.
- Sentence-coverage: intro, 1 p3-p5, 1.1 p2-p7, 1.2 cited here; 1 p6-p9 and 1.1 p8 belong to agent `base`'s stages.
