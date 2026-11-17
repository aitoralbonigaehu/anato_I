# Topic 17: what the new notes change (2026-11-16, agent 17-B, for 17-A / 17-C and the lead)

New notes: `Downloads\17. GAIA. BURUA ETA LEPOA (ZUZENDUTA) fitxategiaren kopia.pdf` (10 pages, 218 sentences). The app was built from `...(ZUZENDUTA).pdf` (216 sentences). Notes 18: the copy is byte-identical (same SHA-256) to the file already used: nothing changes in 18.

The text is extracted again (`content/notes-text/w17.ts`), so **every `w17/...` id changed meaning from section 1 to 2.4**; 17-B re-cites every beat. Scene files never cite notes ids, so 17-A has nothing to re-cite. What 17-A must act on is below: a change of what a scene shows, names or says.

Status: v1 (first hour). Sections marked TODO are filled during the day.

## 0. Order changes (affect flights and run-on poses)

The new notes reorder two blocks. The stage order in `content/weeks/week17.ts` (`ORDER`) and `content/notes.ts` follow the notes:

| Was | Now | Why |
|---|---|---|
| … `hezurtze-motak`, `josturak-fontanelak`, `buru-ganga`, `kondrokraneoa`, `errai-kraneoa` | … `hezurtze-motak`, `buru-ganga`, `kondrokraneoa`, `josturak-fontanelak`, `errai-kraneoa` | Notes §1 now ends with "Bi atal bereizten dira: buru ganga / oinaldea"; §1.1 (Neurokraneoa) is only sutures and fontanelles; §1.2 is "Jatorri ezberdinak". |
| `bikote-kranealak`, `trigeminoa`, `lehen-arkua-luzapenak`, `lehen-arkua-kartilagoak`, `lehen-arkua-muskuluak` | `bikote-kranealak`, `lehen-arkua-luzapenak`, `lehen-arkua-kartilagoak`, `trigeminoa`, `lehen-arkua-muskuluak` | §2.2.1 is now "Kartilago eta hezurrak" and §2.2.2 "Nerbioak" (swapped). The processes paragraph opens 2.2.1 too ("Luzakin maxilarra eta Barail-luzakina desberdintzen dira"), so `luzapenak` stays before the cartilages. Ends on V3 → masseter/temporal/digastric, which leads into the muscles. |

Inside a stage (beats only; steps keep their times, the **picture of each step must follow**):

| Stage | Was | Now |
|---|---|---|
| `bigarren-arkua` (`SB2`) | step 0 VII nerve, steps 1–5 Reichert and its bones | steps 0–4 Reichert and its bones (§2.3.1), last step VII (§2.3.2), which also names the posterior digastric belly (lead into `bigarren-arkua-muskuluak`) |
| `hirugarren-arkua` (`SB3`) | step 0 IX nerve, step 1 hyoid | step 0 hyoid (§2.4.1 "Hezurrak"), step 1 IX (§2.4.2), which now names the stylopharyngeus |

17-B rewrites the beats in this new order in `week17d.ts`. Until the scene follows, the picture of those steps is one step out of phase with the narration.

## 1. Per stage: what a scene shows, names or says

Format: stage (step = beat index) · old → new · what the scene must do.

### `kraneoaren-bi-atalak` / `hezurtze-motak` (§1)
- Neurocranium: same definition. The notes now put the two ossifications **inside** the neurocranium item: "Neurokraneoaren atal batzuk mintzezko hezurtzapenetik sortzen dira (…hezur lauak: parietalak, okzipitalaren ezkata eta aurpegiarekin erlazionatutako hezurrak) … Oinaldeko hezurrak aldiz hezurtzapen endokondralaren bidez sortzen dira gehienak." No scene change.
- Removed: "* kondro = kartilago" footnote, "Horretaz gain, bi herzurtze mota daude". `hezurtze-motak` step 3 must not say "Kondro hitzak kartilago esan nahi du" any more (text is 17-B's; a label or overlay with it, if any, is 17-A's).
- Viscerocranium: "Bertako ia hezur guztiak gandor neuraleko zeluletatik sortzen dira (mesenkimatik lehenago kartilagoa eratuko da eta ondoren, kartilago hau hezurtuko da …)". The parenthesis is the old endochondral item pasted under the viscerocranium, and it contradicts the same notes (face bones listed as membranous in the neurocranium item; mandible from mesenchyme round Meckel in §2.2.1). **KONTUZ added; the scenes keep the face bones membranous.** No scene change.

### `buru-ganga`, `kondrokraneoa` (now §1, before §1.1)
- Same text, moved from §1.1 to §1. Removed: "Hemengo hezurrak somita okzipitaletako mesodermo paraxialetik eta gandor neuraleko zeluletatik garatzen dira" and "Neurokraneoko hezur guztiak ez dute mintzezko hezurtzapena, oinaldean hezurtzapen endokondrala da" (both said elsewhere). No scene change; order change in §0.

### `josturak-fontanelak` (§1.1, rewritten)
- New wording: fontanelles appear **where more than two bones meet**; the joint between **two** bones is a suture ("Hezur bien artean gertatzen lotura aldiz jostura deitzen da").
- Closing times: **anterior 18th month after birth (it ossifies)**, posterior **1st month after birth** (smaller, ossifies sooner). Was: anterior "2. urtean", posterior "2. hilabetean".
- Function: "Fontanelak erditzerakoan ezinbestekoak dira, buruaren neurria gutxitzeko." Removed: "Neurokraneoko hezurrak ezin dira giltzatuta egon … arazo larriak", "parietalak hurbilduko dira".
- Figure (notes p.2 and figure file p.1) still prints "Aurreko fontanela (2. urtean)" and "Atzeko fontanela (3. hilabetean)". **KONTUZ, prose wins: 18. hilabetea and 1. hilabetea.**
- Scene: any on-screen caption or label with "2. urtean", "2. hilabetean" or "3. hilabetean" must change to "18. hilabetean" / "1. hilabetean" (check `Skull17.tsx` / `Sutures17`). The step "parietals approach each other at birth" may stay as the picture of "buruaren neurria gutxitzeko". If a step shows the posterior fontanelle closing before the anterior, keep it (1 month vs 18 months).

### `errai-kraneoa` → §1.2 "Jatorri ezberdinak" (new content)
Old §1.2 "Errai kraneoa" (crest, membranous, arches 1–2) is gone. New §1.2 lists where head structures come from; the stage keeps its id, its title becomes "Jatorri ezberdinak":
1. Paraxial mesoderm → the somatic (voluntary) muscles of the viscerocranium and the **dura mater**.
2. Lateral mesoderm (plate) → small laryngeal cartilages: **arytenoid and "trikoide"** (cricoid; the figure file p.1 names "Aritenoide, Krikoide" in yellow).
3. Neural crest → the viscerocranium bones and other bones too. "Zelotoki hezurra, Loki hezurra ia osoa eta esfenoidea ez dira errai kraneoa." Two meninges from crest: **arachnoid and pia mater**.
4. Ectodermal placodes (+ neural crest) → the ganglion cells of nerves **V, VII, IX and X**.
- Figure: figure file p.1 "Bekoki-h., Pareta-h., Loki-hezurraren ezkata, Loki-hezurraren harkaitza, Garondo-h., Sudur-h., Malko-h., H. zigomatikoa, H. maxilarra, Baraila, Esfenoide h., Hioide h., Laringeko kartilagoak (Aritenoide, Krikoide)": blue = crest, red = paraxial mesoderm, yellow = lateral mesoderm. **This figure has no picture in the app yet** (for 17-A: the skull from the left in three origin colours, the larynx's two small cartilages yellow; the meninges and ganglia can be a caption list).
- KONTUZ: §1.2 gives the arytenoid and cricoid to the lateral mesoderm, §2.6.2 gives all laryngeal cartilages to arches 4 and 6. Both stay in the notes; the app says both, with the KONTUZ.

### `faringe-arkuak` (§2)
- Removed: "Zeharkako mozketa honetan V hau ikusten da atzetik", "4.-5. astean garatzen direnak (4. astean hasi)", "Argazki urdinean ikusten den V…". The heading keeps "(4.-5. ASTEAK)"; the figure (V from behind) is unchanged. Beat 0 no longer says "zeharkako mozketa"; the picture can stay.
- New: "Hasteko, mesenkima lodiguneak dira … faringea izango den tokiaren alboetan … estomodeoaren atzetik aurreko hestearen ormetan. Lau goragune agertzen dira." If the scene can show the bars **swelling out of the foregut wall** at the start of the stage (thickening, then four swellings, behind the stomodeum), that is now the notes' first picture.
- New last line of §2: "Gainetik mihia garatuko da eta azpitik laringea." (tongue above, larynx below, on the floor of the V): a step that names the laryngeal orifice may name it here.

### `arkuaren-osagaiak` (§2)
- Layers: "Arku bakoitzak barnetik **endoteliozko** estalkia dauka (horiz)". The notes' figure says "Epitelio endodermikoa" and the next lines of §2 say the pouches have endodermal epithelium. **KONTUZ: read endodermal; the label stays "Epitelio endodermikoa".** No scene change.
- Mesenchyme now holds three kinds of cells: **paraxial mesoderm cells (later the muscles), neural crest cells and lateral mesoderm cells**. Was: mesodermal cells + crest cells. If the step shows migrating crest cells, add the other two (or name them in the caption): 17-A.
- Removed: "Gandor neuraleko zelula horiek emango dituzte aurpegiko hezurrak" and **"Kartilagoa desagertu egingo da, eta hezurrak mintzezko hezurtzapenez eratuko dira (ez da hezurtzapen endokondrala)"**. A step that shows "the cartilage disappears, bones by membranous ossification" for all arches no longer has a sentence; the step now says "Zelula horiek bereizi egingo dira egitura ezberdinak emateko". The open conflict "membranous ossification of the arch bones (notes vs textbooks)" is settled: the notes no longer claim it.
- Components: "orokorrean, zaina, arteria, nerbioa eta kartilagoa" (no "batzuetan ez"). Clefts lose "(ektodermikoak)" in the prose (the figure still says "Epitelio ektodermikoa").

### `bikote-kranealak` (§2.1)
- Same text. Ids renumber only.

### `lehen-arkua-luzapenak` (§2.2)
- Same text (the processes paragraph moved into §2.2.2's end, plus "Lehenengo arku brankialaren alde dortsalean luzapen maxilarra dago … desberdintzen dira" in §2.2.1). No scene change except the order (§0).

### `lehen-arkua-kartilagoak` (§2.2.1 "Kartilago eta hezurrak")
- Meckel: "Lehenengo arkuko kartilagoa Meckel kartilagoa da, garapenean endekatu egingo dena." **The malleus and incus come from its upper end** ("kartilagoaren goiko muturretik mailua eta ingudea"; was "luzapen maxilarraren goiko muturrean"). Scene: the ossicles must grow from the **dorsal (upper) end of Meckel's cartilage**, not from the maxillary process.
- Mandible: "bertako zelula batzuk gida funtzioa daukate … inguruko mesenkima hezurtzen baita kartilagoa zegoen tokian. Beraz, baraila EZ atera kartilagotik, kartilago inguruan egon diren mesenkimako zeluletatik baizik!" The notes now say what the app already showed; the old KONTUZ ("apunteek «bertatik» diote") is removed.
- **Temporal squama is no longer an arch I derivative.** Was: "Luzapen maxilarretik hezur maxilarra, zigomatikoa eta tenporalaren ezkata (harkaitz zatia oinaldeko mesenkimatik)". Now: "1. arkutik beste errai kraneoko hezur batzuk garatu: hezur maxilarra, zigomatikoa eta **loki hezurraren atal bat (kutxa tinpaniko + hezurtxoekin erlazionatuta dagoen atala)**". Scene: step 4 (`SB1[4]`) must not light/colour the temporal **squama** orange; it lights a small part of the temporal round the tympanic cavity and ossicles (or names "loki hezurraren atal bat" there). `tenporalaren-ezkata` must leave the focus of that step. The skull model's orange tint on the squama (`archTint`) must go everywhere in topic 17 (the figure file p.1 colours the squama blue = neural crest, not arch I).
- Removed: "Baita ere lotailu ezberdinak ateratzen dira baina ez ditugu emango."
- Other books (incus long crus from II): now ends "Guk horri kasurik ez" (we ignore it). The app keeps one KONTUZ line, lighter.
- Figure: the cartilage figure is new (see §2 of this doc): "Mailua, Ingudea, Ointokia, Meckel Kartilagoa, Estiloide apofisia, Lotailu estilohioidea, Hioide hezurraren adar txikia, Hioide hezurraren adar nagusia, Hioide hezurraren gorputza, Tiroide kartilagoa, Krikoide kartilagoa, Trakea". The old figure with "Tenporalaren ezkata, Apofisi zigomatikoa, Malarra" is gone from the notes.

### `trigeminoa` (§2.2.2 "Nerbioak")
- **V1 and V2 are NOT in the first arch** (red in the notes: "1. faringe arkuan EZ" under each). The first arch's nerve is **V3, the mandibular nerve** ("Lehenengo arku faringeoan barail nerbioak inerbatu, nerbio trigeminoaren (V) hirugarren adarra → V3"). Was: "Lehenengo arkuan V. bikote kraneala agertzen da, trigeminoa".
- Scene: V1 and V2 must not wear arch I's orange as if they belonged to the arch; they are the trigeminal's (keep them, they are in the figures), but in a neutral/lighter tone, and V3 in the first arch's colour, entering the mandibular process. Step 0 should land on V3 + the first arch, step 1–2 (V1, V2) say "ez 1. arkuan".
- V3: "motorra ere da (nerbio mistoa), eta nerbio trigeminoan osagai motorra duen nerbio bakarra da (V1 eta V2-k motorra ez). Aurpegiko muskulu murtxikatzaileak mugitzeko balio du: maseteroa eta tenporala → baraila igotzeko erabili. Muskulu digastrikoak … baraila jaisteko balio du." The last step can show the masseter and temporal (raise) and the digastric (lower), as a lead into the muscles stage.
- Removed: "(Tri deitzen da 3 adar dituelako)", "Nerbio batzuk sentsitiboak dira bakarrik … gehienak mixtoak", "V1 eta V2 gehienbat sentsibilitatearen eramaileak dira …". 
- V1 still "begiaren mugimenduetaz arduratzen da": the KONTUZ stays.

### `lehen-arkua-muskuluak` (§2.2.3)
- Digastric: "aurreko sabela (lepotik barailaren behekalderaino) 1. arkuaren eratorria da (barail nerbioak mugitu), eta atzeko sabelak beste jatorri bat du, bigarren arkuko nerbioak inerbatuko du." Removed: "belarriaren mailatik … atzetik aurrera … mihiraino" and "Aurreko sabela hioide hezurretik barailera doan atala". No scene change (the belly still runs from the hyoid region to the lower border of the mandible).

### `bigarren-arkua` (§2.3.1 Kartilagoak, §2.3.2 Nerbioak; order in §0)
- Stapes: "(ez osoki egiazki baina guk horrela balitz bezala egingo dugu)": the app shows it all from Reichert, with that line.
- Lower end: styloid process **and the stylohyoid ligament** ("eta estiloidetik hioide hezurrera doan lotailu estilohioideoa ere") **new in the prose**; then "Lepo atalean, hioide hezurraren atal batzuk … bi adar txikiak (argazkian horiak) eta gorputzaren goiko erdia". Scene: the step of the lower end must show and name the **stylohyoid ligament** (`lotailu-estilohioideoa`, already a structure) between the styloid and the lesser horn.
- New figure: the hyoid seen from the front (Google image, "Asta menor / Asta mayor / Cuerpo"), "soilik hioidea non dagoen ulertzeko". A step that turns to the hyoid from the front would match it (17-A, optional).
- VII: "Aurpegiko muskulu mimiko guztiak mugituko dira (eragin motorra), **borondatezko muskuluak (somatikoak)**. Berez nerbio mistoa da … Hala ere, **bereziki motorea da**. Muskulu digastrikoaren atzeko sabela nerbio honek inerbatuko du." The old conflict (notes said "alde sentsitiboarekin gehien bat geratuko gara") is gone: KONTUZ removed. Last step: VII and the posterior digastric belly.

### `bigarren-arkua-muskuluak` (§2.3.3)
- "muskulu mimikoak … aurpegiko borondatezko muskulo somatikoak". Platysma: "Platisma muskulua ere eratuko da 2. arkutik (lepoko azalaren azpian dagoena, fina eta zapala), muskulo mimikoen barnean sar genezake." Removed: "aurpegi nerbioak inerbaturikoak dira" (as a separate sentence) and "Platisma … lepoaren larruazala mugitzeaz arduratzen dena". Scene: the platysma is a thin flat sheet **under the neck skin**, grouped with the mimic muscles (same colour, same step as the mimic muscles is fine).
- "hezur estilohioideoa" still written: KONTUZ stays.

### `hirugarren-arkua` (§2.4.1 Hezurrak, §2.4.2 Nerbioak, §2.4.3 Muskuluak)
- Order: hyoid first, then IX (§0). IX now "faringeko muskuluak (estilofaringeoak) inerbatzera helduko da". Removed: "(ezkerrean bat eta bestea eskuinean)" and "Lotailuak ere agertuko dira … ez ditugu aipatuko". No scene change beyond the order.

### `bagoa` (§2.6.1)
- **"goiko laringe nerbioa helduko zaie → goiko, tarteko eta beheko muskulu ertzatzaileak inerbatzeko"**: was "tarteko eta beheko". §2.4.3 still says the superior constrictors come from arch III and IX moves them, §2.6.3 still says arch IV gives the middle and inferior ones. **KONTUZ: the app keeps superior = III (IX), middle and inferior = IV (superior laryngeal), and says §2.6.1 lists all three.** Scene: no change (do not light the superior constrictor red).
- "laringe barneko muskuluak" (plural). No scene change.

### `laringeko-kartilagoak` (§2.6.2)
- Thyroid cartilage: "goiko aldea 4. arkuko eratorria **(goranzko adarra)** da eta beheko atala eta beste kartilagoak 6. arkuaren eratorria **(gorputzaren beheko atala)**". Scene: the red (IV) part is the **ascending horn / upper part**, the green (VI) part the lower part of the body. Label names can stay ("tiroidearen goiko atala / beheko atala"); the line under the picture says "goranzko adarra".
- Epiglottis: still in the list of IV–VI cartilages; topic 18 §2.1 says the epiglottis comes from the dorsal part of the 4th arch. **KONTUZ (open conflict settled): IV, as topic 18 states it precisely; topic 17 only says "4. eta 6. arkuetatik".** If the scene paints the epiglottis green (VI), make it red (IV).
- Arytenoid and cricoid: also given to the lateral mesoderm in §1.2 (see `errai-kraneoa`).

### `laugarren-seigarren-muskuluak`, `arkuen-mapa`, `bosgarren-arkua`
- No change of content. `arkuen-mapa`: the map row I must drop "tenporalaren ezkata", and the map should show V3 (not V) as arch I's nerve. If `ArchMap17` prints those words, 17-A changes them.

## 2. Notes figures → stage/step (TODO, filled after the plate check)

## Status at the 20:00 stop (17-B)

- Done: notes re-extracted (`w17.ts`, manifest, pins in `tests/notes.test.ts`), `content/notes.ts` sections, `week17.ts` order and file name, all `FILE` constants, and `week17a.ts` fully rewritten to the new ids (5 stages; KONTUZ for fontanelle times and for the arytenoid/cricoid origin; two `ask` checks).
- Not done: `week17b`–`week17i.ts` beats still cite the OLD ids (most no longer exist, so `tests/notes.test.ts` fails for those stages); quiz items `w17-q-fontanelak` and `w17-q-luzapen-maxilarra`; structure definitions (V → V3, maxilla not from the temporal squama); `content/chronology.ts` line 195 (`w17/2/p3/s2`, `w17/2/p5/s1`, `w17/2/p5/s5` → `w17/2/p4/s2`, `w17/2/p4/s3`, `w17/2/p4/s10`); §2 figure table; plate box fixes (17-7, 17-9, 17-10 measured off; others unchecked).
