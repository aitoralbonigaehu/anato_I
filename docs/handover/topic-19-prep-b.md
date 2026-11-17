# Topic 19, part B (sections 6–9: development): preparation notes (19-B, 2026-11-16, stopped 20:00)

No app file was written. This is the reading and the model design for stages 11–19 of `docs/handover/topic-19-plan.md`
(`gandor-neurala`, `gandor-eratorriak`, `ornomuin-geruzak`, `ornomuin-plakak`, `ornomuinaren-igoera`, `puntzioa-epidurala`,
`plaka-neurala`, `hiru-xixkuak`, `bost-xixkuak`), so whoever builds them starts from here. Sentence ids are those of
`content/notes-text/w19.ts`. Figures are the DOCX's `word/media/imageN.png` (unzip the DOCX).

## Section 6. Gandor neuraleko eratorriak (w19/6/p2–p13)

**Facts.**
- p3: when the tube leaves the ectoderm the crest cells first stay as a plate (on top of the tube), then split to both sides
  of the tube and gather (dorso-lateral to the future cord) → the posterior-root (spinal) ganglia. Then the derivatives:
- p4: spinal, sympathetic and parasympathetic ganglia (neuron somas). Sympathetic: the chain (paravertebral) ganglia and the
  ganglia of the plexuses in front of / round the viscera (e.g. the pre-aortic plexus): all their neurons from the crest.
- p5: cranial-nerve ganglia (parasympathetic; e.g. the facial nerve's geniculate ganglion).
- p6: Schwann cells: myelin in the PNS only (in the CNS: oligodendrocytes).
- p7: meningeal cells: of the three meninges, two (arachnoid and pia) from the crest (dura mesodermal, section 3).
- p8: bones and cartilages of pharyngeal arches 1, 2, 3 (anomaly → no facial bones).
- p9: chromaffin cells of the adrenal medulla (cells leave the crest, enter the medulla).
- p10: melanocytes (skin and hair colour).
- p11: anomalies of crest derivatives (badly differentiated or not reaching their place) → no myelin, no facial bones…;
  ~30 % of newborns' congenital malformations come from the crest.
- p12: the nervous system is not only neurons: most nerve cells are neurons and glia.
- p13 (KONTUZ, warn step): "in week 4 there is still a neural tube, not a spinal cord".

**Figures.** image11 ("Gandor neurala", 4 drawings): plate in the ectoderm → folds rise, crest at the fold tips → tube closed
under the ectoderm, crest as a plate on top → crest split into paired spinal ganglia beside the cord (segmental row).
image10 (4. astea → 6. astea): tube + crest + notochord section; arrows: crest cell → DRG sensory neuron (pseudo-unipolar);
→ sympathetic-ganglion visceral motor neuron; → chromaffin cell; at 6 weeks the section shows the DRG beside the cord, the
sympathetic chain ganglion, the pre-aortic sympathetic ganglion in front of the aorta, the adrenal gland with chromaffin cells.

**Model (`section`, block frame: x left, y dorsal, z cranial; drawn at the cord's size, canal at the origin).** A trunk
slab cut across at a thoracic level, one pose that runs on through stages 11–14:
- `fold` 0→1: plate in the ectoderm sheet → folds rise (each half curls, see the curl formula below) → closed tube; the crest
  is the last ~12 % of each fold edge (`gandor-neurala`, `C19.crest` teal), the ectoderm sheet attached to the edges then
  sealed over the tube (no seam: one grid whose two ends coincide once closed; `finish()` merges coincident normals).
- `crest` 0→1: the crest strip on top of the tube becomes a plate (one item), splits into two (cut at the midline, the
  halves part at once), slides down each side and gathers into the DRG (bean, `gongoil-errakideoak`).
- `migrate` 0→1: cells (small blobs, Stream-like paths drawn as vessels grown by arc length) leave the crest streams to:
  the chain ganglion (dorso-lateral to the aorta, green `C19.symp`), the pre-aortic ganglion (in front of the aorta), the
  adrenal medulla (a cutOpen gland, chromaffin cells as a cluster entering its middle), a melanocyte under the skin, Schwann
  cells along a root. One beat per derivative; the notes' list order. Context: notochord (→ vertebral body ventral to the
  tube), aorta(s), the dorsal body wall as a solid cut plate (`plate()` + `G19.cut`), the coelom a blue-grey recess.
- A close-up inset (or a step zooming in) for "Schwann vs oligodendrocyte" (PNS axon wrapped by Schwann cells outside
  the cord, an oligodendrocyte inside): the hard mapping.

**Hard mappings to make visible.** crest → {DRG, chain, pre-aortic, cranial ganglia, Schwann, arachnoid + pia,
arch 1–3 bones, chromaffin, melanocytes}: colour every derivative teal as it arrives (teal = crest, same as topic 4) while
it also wears its function colour once settled (sensory blue DRG, sympathetic green); a closing step lights all the teal at
once (the "30 % of malformations" line). Dura is NOT crest (mesoderm): show it as another colour beside the teal pia.

## Section 7. Ornomuinaren garapena (w19/7/p2–p12)

**Facts.** 5th week → 3rd month; the cord keeps the tube's form. Ependyma at first flat, bounded inside by the internal
limiting membrane (5th week); the first cells inward: neuroepithelial cells → neuroepithelium; they give neuroblasts
(→ neurons). Neuroblast layer = mantle layer (→ grey matter, their somas); their axons outward → marginal layer (→ white
matter, yellowish); outer border the external limiting membrane, where the pia forms. Dorsal sensory, ventral motor:
two main plates, ventral basal plate (motor) and dorsal alar plate (sensory); between them no anatomical border but a
physiological one, the sulcus limitans. Roof plate dorsally, floor plate ventrally: axons cross there, no mantle layer,
only marginal (they join left and right). Cells left at the wall → ependymal layer; inner ones (from neuroblasts) →
neurons → grey matter, axons outside → white matter; finally the pia. Once developed the plates are gone: alar → sensory
area, basal → motor area; two fissures (ventral much deeper, dorsal); H grey matter, white outside; posterior horns sensory,
anterior motor, lateral horns (sympathetic) T1–L2 only. "Bizkar hezurra ornomuina baino gehiago hazten da" (lead into 8).
p11 repeats roof/floor/sulcus; "ependymal neuroepithelial cells develop from glioblasts" (as written), after birth
ependymal cells. KONTUZ (warn): "3. hilabetean jada ez dago plakarik": sensory and motor areas.

**Figure.** image14 (p11 of the PDF): top, histology strip 5th week (internal limiting membrane | neuroepithelium,
neuroblasts migrating | mantle | marginal | external limiting membrane, pia cells) → 3rd month (central canal, ependymal
layer | grey | white | pia); bottom, cross-sections: 5th week (roof plate, alar plate "sentsitiboa eta koordinatzailea",
basal plate "motorra", floor plate; ependyma, ependymal layer, mantle, marginal, sulcus limitans) → 3rd month (dorsal
sulcus, ependyma, posterior horn, ascending tracts, lateral horn, anterior horn, descending tracts, ventral fissure).
Colours: sensory half light (yellow white / light-blue grey), motor half dark (brown white / dark-blue grey).

**Model (same `section` block).** The cross-section is polar round the canal, every layer a band between two radius
functions r(θ) (θ = 0 the embryo's left, π/2 dorsal), all morphing with one `mature` 0→1 (a 2D prototype of these
functions was drawn and reads right, `scratchpad/cord.py`):
- lumen: diamond slit (|x|/a + |y|/b = 1, a 0.14, b 0.72) → small round canal (r 0.07) as the dorsal part closes;
  the diamond's lateral corner is the sulcus limitans (a groove: name it there);
- outer: tall oval (0.78 × 1.0) → wide oval (1.25 × 0.95) with a deep ventral fissure and a shallow dorsal sulcus
  (gaussian notches at θ = −π/2, π/2);
- grey (mantle): thick laterally, zero at roof/floor (`ss(0.15, 0.75, |cos θ|)`) → H: dorsal horns thin and long
  (bumps at ±62°/118°, w 0.22), ventral horns fat (−40°/−140°, w 0.42), lateral horn small (±5°, only at T1–L2);
- bands: ependyma [r_l, r_l + e], mantle/grey [.., r_g], marginal/white [r_g, r_o], pia [r_o, r_o + p]; split each by
  angle into dorsal (alar / sensory, ids `hegal-plaka` → `eremu-sentsitiboa`) and ventral (basal / motor, `oinalde-plaka`
  → `eremu-motorra`) items, roof and floor wedges their own ids (`sabai-plaka`, `zoru-plaka`), which fade into white
  matter as `mature` passes 0.6;
- mesh: each band = `grid(nu around, nv across)` top face on the slab's cranial cut + `grid` side walls (extrusion
  along z), through `staticMesh`/`cachedMesh` keyed on `mature` rounded to 1/60 (bounded rebuilds);
- cells: neuroblasts as small blobs drifting from the neuroepithelium into the mantle (`migrate`), their axons growing
  outward by arc length into the marginal layer (vessels); the external limiting membrane a thin rim, pia cells on it.
- The step order follows p4 → p5 → p6–p9 → p10 → p12 (warn). Names in the notes' terms; "adarrak" for horns.

**Hard mappings.** layer → adult: mantle → grey, marginal → white, neuroepithelium → ependyma, external limiting
membrane → pia; plate → area: alar → sensory (posterior horn), basal → motor (anterior horn); roof/floor = crossing axons,
no mantle. Keep the light/dark sensory/motor coding of the figure in every step so the mapping is the colour.

## Section 8. Bizkarrezur-muinaren aldaketak (w19/8/p2–p8)

**Facts.** The column grows (lengthens) more than the cord; the column is metameric; spinal nerves leave through the
intervertebral foramina at their own level while the two are the same size; once the system is formed and the column
grows, the foramina move away and the nerves lengthen with it. After the 4th month mostly growth: the cord reaches only
~L1–T12/L2, not the sacrum; below, loose nerves only: from L2 the cauda equina (zaldi buztana), in a CSF-filled sac
between dura and arachnoid (as written: KONTUZ? the dural sac holds the subarachnoid space; the notes say the pouch forms
"between dura and arachnoid": cite as written, a KONTUZ line). The cord's end is a cone (conus); from it a ligament with a
holding role (filum terminale, `zuntz-terminala`). Lumbar puncture (light text): CSF samples, markers in meningitis etc.;
CSF flows outside and inside the CNS, cushions blows; done at ~L2 in the cauda equina (no solid cord, fewer lesions).
Epidural anaesthesia: between the dura and the bone (fat, nerves, vessels), numbs the cauda equina's nerves.
No figure in the notes for 8 (image6, "nerbio errakideoa eta meningeak", dura opened from behind, is the nearest look).

**Model (`spine`, trunk frame, seen from behind, tied to `ROOT19.conus`).** Vertebrae as rounded blocks with arches cut
away from behind (laminae removed) so the dural sac shows; one pose `grow` 0→1: the vertebrae's spacing and size scale up
along y while the cord keeps its length, so its end (conus, a tapered `vessel` with `r1` small) is left at L1–L2 relative
to the vertebrae; each root pair is a vessel from its cord level to its foramen, re-drawn every frame: horizontal at
grow 0, longer and more oblique with each level lower, the lowest a bundle (cauda equina) inside the sac; filum terminale a
thin cord to the coccyx; dura a see-through sac to ~S2 (lilac arachnoid inside), epidural space a fat-yellow layer between
dura and bone. Stage 16: a needle (thin vessel) entering between L3–L4/L2 spinous processes into the sac (puncture), then
a second into the epidural layer only (anaesthesia), CSF drops as small blobs. Level labels (T12, L1, L2, S) as marks.

**Hard mappings.** cord ends L1–L2 (T12–L2 as written); puncture at L2 in the cauda equina (notes) / epidural = between
dura and bone; nerves exit at the foramen of their own number, so lower roots run longer.

## Section 9. Plaka neurala (w19/9/p2–p18, plus w19/5.1/p3)

**Facts.** A plate; its sides fold until they fuse in the middle; fusion starts mid-level, leaving neuropores at both ends:
posterior closes on day 25, anterior on day 28; posterior earlier than anterior (KONTUZ: textbooks give the reverse; prose
wins, warn step). Special cells at the folds' tips: crest cells, some migrate and some do not. Cranially the tube loses its
tube form → vesicles (cavities, CSF inside): 3 at first → derivatives: prosencephalon (front, most cephalic): telencephalon
(cerebral cortex, hemispheres; convoluted; grows most and surrounds the diencephalon) and diencephalon (inside, at the base;
small but important): epithalamus (above the thalamus; KONTUZ "irudian ez da ageri": draw it, say it), thalamus (the main
structure, in the middle; sensations not passing it are not felt), hypothalamus (below; hormones; hunger, sleep centres),
subthalamus. Mesencephalon: stays mesencephalon, nothing forms from it; large at first, then small. Rhombencephalon (rhombus
shape): metencephalon (pons between medulla and midbrain; cerebellum behind) and myelencephalon (in contact with the cord,
most caudal: medulla oblongata, the cord continues from it; link brain–cord, "bulbo"). Named front to back. The 3 vesicles
form only cephalically; caudally the tube stays a tube (the cord). Day 28: the 3 vesicles relatively formed, two flexures:
cephalic (at the mesencephalon) and cervical (rhombencephalon–cord). 5th week: telencephalon and diencephalon from the
prosencephalon; mesencephalon stays; metencephalon and myelencephalon from the rhombencephalon; cerebellum starting, pons in
front; pontine flexure (ventral) at the metencephalon; the mesencephalon–metencephalon border narrows: the isthmus (genetically
key: many organising genes from there). Growth in a limited space → bending and folding. Vesicles are hollow sacs, cavities
communicating with the cord's, full of CSF.

**Figures.** image13 (Plaka neurala, 20 and 21 days): dorsal views of the embryo (plate, groove, folds, 1st cervical somite,
primitive streak; at 21 days folds fused mid-level, posterior neuropore) and cross-sections (ectoderm, future crest, plate,
groove, folds; crest at the fold tips). image12 (28. eguna): prosencephalon yellow with optic vesicle, mesencephalon red,
rhombencephalon green, cord blue; cephalic and cervical flexures. image2 (5. astea): telencephalon yellow (hemisphere,
olfactory bulb), diencephalon brown (epiphysis, optic cup, infundibulum), mesencephalon red, metencephalon blue (cerebellum
and pons), myelencephalon green (medulla), cord light blue; isthmus, IV-ventricle roof, cervical and pontine flexures.
image4 / image9: the vesicle tree (tube → 3 → 5 → adult parts) with the adult brain coloured by vesicle.

**Model (`neural`, trunk frame, diencephalon on `ROOT19.thalamus`).** One parametric surface S(s, a) for the whole plate
→ tube → vesicles, so folding is folding and swelling is swelling:
- centreline C(s) (s 0 cranial → 1 caudal) whose bends are the flexures (`cephalic`, `cervical`, `pontine` angles as pose
  numbers), frames by `frames()` with ref = dorsal;
- half-width w(s) (plate wider cranially), wall thickness t(s);
- curl k(s) 0→1: lateral arc length a ∈ [−w, w] turned by θ = π k a / w on a circle of radius R = w / (π k):
  x = R sin θ, y = R (1 − cos θ) (dorsal up); k = 1 closes the tube at the top; closure as a zipper k(s) = f(fuse, s)
  starting mid-level (~somite 4), the caudal end (posterior neuropore) closing at `pnp`, the cranial at `anp` later;
  outer and inner surfaces offset ±t/2 along the normal, edge strips only where k < 1;
- vesicles: w(s) swells in bumps (3 then 5), the isthmus a narrowing; the telencephalon's cross-section gains two
  dorso-lateral lobes (hemispheres); optic vesicle → cup (`cupShell`), infundibulum, epiphysis, olfactory bulb as small
  outgrowths; cerebellum a dorsal lip of the metencephalon;
- each vesicle its own item (the grid cut into s ranges from the same function: no seam), colours of image2 / image12,
  the prosencephalon's yellow splitting into telencephalon yellow and diencephalon brown as the 5 vesicles form (continuous
  colour mix); a cut-open half (a ∈ [−w, 0]) shows the lumen (the future ventricles: hand-off to 19-C's `ventricles`);
- ectoderm and somites as context for the 20/21-day dorsal view; the embryo's flexures on the 28-day / 5-week side view.

**Hard mappings.** 3 → 5 vesicles → adult parts (the tree of image9): prosencephalon → tel (hemispheres) + dien (epi-,
thalamus, hypo-, subthalamus); mes → mes; rhomb → met (pons, cerebellum) + myel (medulla). Flexures: cephalic (mes),
cervical (rhomb–cord), pontine (met, ventral, 5th week); isthmus between mes and met. Keep the vesicle colours on the adult
parts (19-C's brain model should wear them where a step shows origins).

## Sites and crossings I would have used

- `section` = `link('block', 1, [0,0,0], CORD_CANAL)` from 19-A's cord model (plan); entering from `aktu-erreflexua`
  (cord) the cord's canal is the landmark: arrive line e.g. "Ornomuina zeharka, enbrioian: hodi neurala oraindik (4. astea)".
- `spine` tied at `ROOT19.conus`; 14 → 15 is a flight out from the section block to the whole column (the block's cut faces
  glow at its thoracic level).
- `neural` tied at `ROOT19.thalamus` (diencephalon), its caudal end near the sacrum; 16 → 17 a flight from the conus up to
  the tube laid along the CNS.
- Tests (`tests/sites19b.test.ts`): section canal vs cord canal; spine conus vs ROOT19.conus; neural diencephalon vs
  ROOT19.thalamus; every site a similarity (copy `tests/sites16.test.ts`).

## Traps (KONTUZ)

- Neuropores: notes posterior day 25, anterior day 28; textbooks the reverse.
- "4. astean hodi neurala, ez ornomuina"; "3. hilabetean ez dago plakarik".
- Dural sac "between dura and arachnoid" (notes 8 p4) vs the subarachnoid space holding CSF in textbooks.
- Lateral horn T1–L2 (section 7) vs sympathetic T1–T12 (section 2): say both as written.
- "Ependymal neuroepithelial cells from glioblasts" (7 p11) as written.
- The notes' "berak ez galdetu / ez erabili" remarks are never carried into the app.
