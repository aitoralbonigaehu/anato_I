'use client';

import { BLOCK19, KEY19, endPose, poseStage19, type StageSpec } from './common';
import { SP0, sectionModel, type SectionOpts, type SectionPose } from './section-model';
import { SITE19B } from './sites-b';
import { C19 } from './tones';

/**
 * Topic 19, sections 6 and 7 on one block of the embryo's back cut across (section-model.ts), drawn where the adult
 * cord's section was: seen from above (dorsal) and the cranial side.
 */

const CAP = 'Enbrioiaren bizkarraldea zeharka moztuta (3D eredua): goian dortsala, mozketa goitik ikusita';
const build = (pose: SectionPose, opts: SectionOpts) => sectionModel(pose, opts);
const VIEW = (dist = 9, y = -0.5, yaw = 12, elev = 24) => BLOCK19(dist, [0, y, 0.3], yaw, elev);
const CLOSE = (dist = 4.6, y = 0.0, yaw = 8, elev = 26) => BLOCK19(dist, [0.15, y, 0.3], yaw, elev);

// ———————————————————————— 11. Gandor neurala (6) ————————————————————————

export const S_CREST = [0, 0.28, 0.52, 0.76] as const;
const specCrest: StageSpec<SectionPose, SectionOpts> = {
  S: S_CREST,
  pose: { ...SP0 },
  opts: {},
  site: SITE19B.section,
  arrive: 'Ornomuin heldutik enbrioira: leku berean, 3–4. astean',
  caption: CAP,
  key: KEY19.crest,
  steps: [
    {
      to: { fold: 0.72 },
      run: [0.15, 0.95],
      cam: VIEW(8.4, -0.4),
      fit: false,
      glide: 0.06,
      dim: ['plaka-neurala', 'gandor-neurala'],
      names: [
        { id: 'plaka-neurala', text: 'Plaka neurala', sub: 'ektodermoan' },
        { id: 'gandor-neurala', text: 'Gandor neurala', sub: 'tolesduren muturretan', from: 0.5 },
      ],
      note: 'Plaka tolestean, muturretan beste zelula batzuk bereizten dira: gandor neurala',
    },
    {
      to: { fold: 1, crest: 0.18 },
      run: [0.05, 0.75],
      cam: VIEW(8.0, -0.3),
      fit: false,
      glide: 0.05,
      dim: ['hodi-neurala', 'gandor-neurala', 'azaleko-ektodermoa'],
      names: [
        { id: 'hodi-neurala', text: 'Hodi neurala', sub: 'ektodermotik askatuta', from: 0.6 },
        { id: 'gandor-neurala', text: 'Gandor neurala', sub: 'hodiaren eta ektodermoaren artean', from: 0.75 },
        { id: 'azaleko-ektodermoa', small: true, from: 0.5 },
      ],
      note: 'Hasieran gandor neurala hodiaren (gero ornomuina) eta ektodermoaren artean geratzen da',
    },
    {
      to: { crest: 1 },
      run: [0.05, 0.85],
      cam: CLOSE(5.2, -0.1),
      fit: false,
      glide: 0.05,
      dim: ['gandor-neurala', 'hodi-neurala'],
      names: [{ id: 'gandor-neurala', text: 'Gandor zelulak', sub: 'askatu eta bereizten dira', from: 0.4 }],
      note: 'Gero gandor neuraleko zelulak askatu eta bereizi egiten dira',
    },
    {
      to: { drg: 1 },
      run: [0.05, 0.7],
      cam: CLOSE(5.4, -0.1),
      fit: false,
      glide: 0.05,
      dim: ['gongoil-errakideoak', 'hodi-neurala'],
      names: [{ id: 'gongoil-errakideoak', text: 'Gongoil espinalak', sub: 'egitura desberdinetako bat', from: 0.4 }],
      note: 'Egitura desberdinak eratzen dituzte: adibidez, ornomuinaren atze-alboetan gongoil espinalak',
    },
  ],
};
export const Crest19 = poseStage19(specCrest, build);

// ———————————————————————— 12. Gandor eratorriak (6) ————————————————————————

export const S_DERIV = [0, 0.15, 0.3, 0.44, 0.58, 0.72, 0.86] as const;
const specDeriv: StageSpec<SectionPose, SectionOpts> = {
  S: S_DERIV,
  pose: endPose(specCrest).pose,
  opts: {},
  site: SITE19B.section,
  arrive: 'Mozketa bera: gandorraren zelulak urrunago doaz',
  caption: CAP,
  key: [
    { color: C19.crest, text: 'gandor neurala' },
    { color: C19.sens, text: 'gongoil espinala' },
    { color: C19.symp, text: 'gongoil sinpatikoak' },
    { color: '#e9b44c', text: 'zelula kromafinak' },
  ],
  steps: [
    {
      to: { chain: 1, preaortic: 1 },
      run: [0.05, 0.9],
      cam: VIEW(9.6, -1.0),
      fit: false,
      glide: 0.06,
      dim: ['gongoil-errakideoak', 'gongoil-sinpatikoak', 'aorta-aurreko-gongoilak'],
      names: [
        { id: 'gongoil-errakideoak', text: 'Gongoil espinalak', small: true },
        { id: 'gongoil-sinpatikoak', text: 'Kate sinpatikoa', sub: 'gongoilak', from: 0.4 },
        { id: 'aorta-aurreko-gongoilak', text: 'Erraien inguruko sarea', sub: 'gongoilak', from: 0.6 },
      ],
      note: 'Gongoil espinalak, sinpatikoak eta parasinpatikoak: katean edo sarean, berdin du; gongoil guztietako neuronak gandor neuraletik',
    },
    {
      to: { adrenal: 1 },
      run: [0.05, 0.85],
      cam: VIEW(9.4, -1.2, 18),
      fit: false,
      glide: 0.05,
      dim: ['zelula-kromafinak', 'giltzurrun-gaineko-muina'],
      names: [
        { id: 'zelula-kromafinak', text: 'Zelula kromafinak', sub: 'muinean: noradrenalina eta adrenalina', from: 0.5 },
        { id: 'giltzurrun-gaineko-muina', small: true, from: 0.6 },
      ],
      note: 'Zelula kromafinak: giltzurrun gaineko guruinetan, gandor urogenitalaren erdian; muinekoak bakarrik gandorretik (kortexa ez)',
    },
    {
      cam: VIEW(9.0, -0.6),
      fit: false,
      glide: 0.05,
      dim: ['gandor-neurala'],
      names: [{ id: 'gandor-neurala', text: 'Gandorretik: 1.–3. arkuetako hezurrak', sub: 'eta kartilagoak' }],
      note: '1., 2. eta 3. arkuetatik ateratzen diren hezur eta kartilago guztiak: anomaliaren bat badago, ez da aurpegiko hezurrik eratzen',
    },
    {
      cam: VIEW(8.4, -0.3, 22),
      fit: false,
      glide: 0.05,
      dim: ['gandor-neurala', 'hodi-neurala'],
      names: [{ id: 'gandor-neurala', text: 'Pia materra eta araknoidea', sub: 'gandorretik; dura materra EZ' }],
      note: 'Meningetako zelulak: piamaterra eta araknoidea gandor neuraleko zeluletatik, BESTEA EZ (dura materra)',
      warn: true,
    },
    {
      to: { schwann: 1 },
      run: [0.1, 0.7],
      cam: VIEW(8.6, -0.7, 20),
      fit: false,
      glide: 0.05,
      dim: ['schwann-zelulak'],
      names: [{ id: 'schwann-zelulak', text: 'Schwann zelulak', sub: 'mielina, nerbio sistema periferikoan' }],
      note: 'Schwann zelulak: nerbio sistema periferikoan mielina ekoizten dute (zentralean oligodendrozitoek)',
      plainNote: 'Schwann zelulak: nerbio sistema periferikoan mielina ekoizten dute, axoiak mielinizatzeko',
    },
    {
      to: { melano: 1 },
      run: [0.05, 0.8],
      cam: VIEW(8.6, -0.2, 18),
      fit: false,
      glide: 0.05,
      dim: ['melanozitoak', 'azaleko-ektodermoa'],
      names: [{ id: 'melanozitoak', text: 'Melanozitoak', sub: 'larruazalari eta ileari kolorea', from: 0.5 }],
      note: 'Melanozitoak (larruazalaren eta ilearen pigmentazioa): guztiak gandor neuraletik',
    },
    {
      cam: VIEW(9.6, -0.8),
      fit: false,
      glide: 0.05,
      dim: ['gandor-neurala', 'gongoil-errakideoak', 'gongoil-sinpatikoak', 'aorta-aurreko-gongoilak', 'zelula-kromafinak', 'melanozitoak', 'schwann-zelulak'],
      names: [{ id: 'gandor-neurala', text: 'Gandorraren eratorriak', sub: 'anomaliak: sortzetiko malformazioen herena' }],
      note: 'Eratorriak ondo bereizten ez badira edo beren lekura iristen ez badira: jaioberrien malformazio kongenitoen herena',
    },
  ],
};
export const Deriv19 = poseStage19(specDeriv, build);

// ———————————————————————— 13. Ornomuinaren geruzak (7) ————————————————————————

export const S_LAYERS = [0, 0.24, 0.48, 0.72] as const;
const specLayers: StageSpec<SectionPose, SectionOpts> = {
  S: S_LAYERS,
  pose: endPose(specDeriv).pose,
  opts: {},
  site: SITE19B.section,
  arrive: 'Hodi bera, 5. astetik aurrera: horma lodituz doa',
  caption: CAP,
  key: [
    { color: '#9fb6f2', text: 'neuroepitelioa' },
    { color: '#6a86d6', text: 'manto geruza' },
    { color: '#e6dcc2', text: 'geruza marginala' },
  ],
  steps: [
    {
      to: { mature: 0, chain: 0, preaortic: 0, adrenal: 0, melano: 0, schwann: 0 },
      run: [0, 0.8],
      cam: CLOSE(4.4, -0.05),
      fit: false,
      glide: 0.06,
      dim: ['hodi-neurala'],
      names: [{ id: 'hodi-neurala', text: 'Hodi neurala', sub: 'barruan ependimoa: zabala, gero estu eta borobil', from: 0.5 }],
      note: 'Ornomuinaren garapena (barnetik kanpora), 5. astetik 3. hilabetera: hodi forma mantentzen du; barruko ependimoa estutu egiten da',
      plainNote: 'Ornomuinaren garapena, barnetik kanpora: hodi neuralaren barnean ependimoa, hasieran zabala, gero estu eta borobildua',
    },
    {
      to: { layers: 1 },
      run: [0.05, 0.6],
      cam: CLOSE(3.6, 0.0, 14, 28),
      fit: false,
      glide: 0.05,
      dim: ['neuroepitelioa', 'barneko-mintz-mugatzailea'],
      names: [
        { id: 'barneko-mintz-mugatzailea', text: 'Barneko mintz mugatzailea', sub: 'ependimoa mugatzen du' },
        { id: 'neuroepitelioa', text: 'Zelula neuroepitelialak', sub: 'kanporantz begira: neuroepitelioa', from: 0.35 },
      ],
      note: 'Bi mintz: barneko mintz mugatzailea (ependimoa mugatzen du) eta kanpokoa (pia zelulak); barnekoari lotuta zelula neuroepitelialak',
    },
    {
      to: { blasts: 1 },
      run: [0.05, 0.85],
      cam: CLOSE(3.6, 0.0, 14, 28),
      fit: false,
      glide: 0.05,
      dim: ['neuroblastoak', 'neuroepitelioa'],
      names: [
        { id: 'neuroblastoak', text: 'Neuroblastoak', sub: 'haietatik neuronak', from: 0.3 },
        { id: 'neuroepitelioa', small: true, from: 0.5 },
      ],
      note: 'Zelula neuroepitelialak bereizten dira eta neuroblastoak ematen dituzte; askatu eta garatzean, ornomuineko neuronak',
    },
    {
      cam: CLOSE(4.2, -0.05),
      fit: false,
      glide: 0.05,
      dim: ['manto-geruza', 'geruza-marginala', 'kanpoko-mintz-mugatzailea'],
      names: [
        { id: 'manto-geruza', text: 'Manto geruza', sub: 'somak → gai grisa' },
        { id: 'geruza-marginala', text: 'Geruza marginala', sub: 'axoiak → gai zuria', from: 0.3 },
        { id: 'kanpoko-mintz-mugatzailea', text: 'Kanpoko mintz mugatzailea', sub: 'pia zelulak → pia materra', from: 0.55 },
      ],
      note: 'Neuroblastoen somak manto geruzan (gero gai grisa), haien axoiak geruza marginalean (gero gai zuria); geratzen diren zelulek ependimo geruza',
    },
  ],
};
export const Layers19 = poseStage19(specLayers, build);

// ———————————————————————— 14. Ornomuinaren plakak (7) ————————————————————————

export const S_PLATES = [0, 0.2, 0.4, 0.62, 0.84] as const;
const specPlates: StageSpec<SectionPose, SectionOpts> = {
  S: S_PLATES,
  pose: endPose(specLayers).pose,
  opts: {},
  site: SITE19B.section,
  arrive: 'Hodi bera: orain dortsala eta bentrala',
  caption: CAP,
  key: [
    { color: '#c7d3f4', text: 'hegal plaka: sentsitiboa' },
    { color: '#3c4f86', text: 'oinalde plaka: motorra' },
  ],
  steps: [
    {
      to: { plates: 1, blasts: 0 },
      run: [0.05, 0.6],
      cam: CLOSE(4.4, -0.05),
      fit: false,
      glide: 0.06,
      dim: ['hegal-plaka', 'oinalde-plaka'],
      names: [
        { id: 'hegal-plaka', text: 'Hegal plaka', sub: 'dortsala, sentsitiboa: atzeko sustraiak' },
        { id: 'oinalde-plaka', text: 'Oinalde plaka', sub: 'bentrala, motorra: aurreko sustraiak', from: 0.3 },
      ],
      note: 'Bi plaka nagusi: bentralean oinalde plaka, motorra (aurreko sustraiak); dortsalean hegal plaka, sentsitiboa (atzeko sustraiak)',
    },
    {
      cam: CLOSE(3.8, 0.0, 14, 30),
      fit: false,
      glide: 0.05,
      dim: ['ildo-mugatzailea', 'sabai-plaka', 'zoru-plaka'],
      names: [
        { id: 'ildo-mugatzailea', p: [0.31, 0, 0.6], text: 'Ildo mugatzailea', sub: 'muga birtuala, fisiologikoa' },
        { id: 'sabai-plaka', text: 'Sabai plaka', sub: 'axoiak bakarrik', from: 0.3 },
        { id: 'zoru-plaka', text: 'Zoru plaka', sub: 'axoiak bakarrik', from: 0.45 },
      ],
      note: 'Bien artean ez dago muga anatomikorik: muga birtuala, ildo mugatzailea. Sabai eta zoru plaketan geruza marginala bakarrik: axoiak, ez neuronak',
    },
    {
      to: { mature: 1 },
      run: [0.05, 0.92],
      cam: CLOSE(5.0, -0.1),
      fit: false,
      glide: 0.06,
      dim: ['ependimo-geruza', 'gai-grisa', 'gai-zuria', 'pia-materra'],
      names: [
        { id: 'ependimo-geruza', text: 'Ependimo geruza', small: true, from: 0.4 },
        { id: 'gai-grisa', text: 'Gai grisa', sub: 'barnean, H forma', from: 0.6 },
        { id: 'gai-zuria', text: 'Gai zuria', sub: 'kanpotik', from: 0.7 },
        { id: 'hodi-ependimarioa', text: 'Ependimoa', small: true, from: 0.5 },
      ],
      note: 'Heltzean bi ildo: atzekoa eta aurrekoa (askoz sakonagoa); gai zuria kanpotik, gai grisa barnean H forman. KONTUZ: izenak aldatu egiten dira',
      warn: true,
    },
    {
      cam: CLOSE(5.0, -0.1),
      fit: false,
      glide: 0.05,
      dim: ['eremu-sentsitiboa', 'eremu-motorra'],
      names: [
        { id: 'eremu-sentsitiboa', text: 'Eremu sentsitiboa', sub: 'hegal plakatik: atzeko adarrak' },
        { id: 'eremu-motorra', text: 'Eremu motorra', sub: 'oinalde plakatik: aurreko adarrak', from: 0.25 },
      ],
      note: 'Izenak aldatzen dira: hegal plaka sentsitiboa → eremu sentsitiboa; oinalde plaka motorra → eremu motorra',
      warn: true,
    },
    {
      to: { lat: 1 },
      run: [0.1, 0.6],
      cam: CLOSE(5.0, -0.1),
      fit: false,
      glide: 0.05,
      dim: ['alboko-adarra', 'hodi-ependimarioa'],
      names: [
        { id: 'alboko-adarra', text: 'Alboko adarrak', sub: 'alde motorrean: neurona sinpatikoak' },
        { id: 'hodi-ependimarioa', text: 'Ependimoa', sub: 'askoz estuagoa', small: true, from: 0.4 },
      ],
      note: 'Ependimoa askoz estuagoa; alboko adarrak (alde motorrean), neurona sinpatikoen somak: adarrak badaude, T1/T2 eta L2 arteko mozketa',
      warn: true,
    },
  ],
};
export const Plates19 = poseStage19(specPlates, build);

// ———————————————————————— class 31 (topic 21), reshaped since for class 32: the scenes as its steps were written ————————————————————————

export const S_CREST31 = [0, 0.28, 0.52, 0.76] as const;
const specCrest31: StageSpec<SectionPose, SectionOpts> = {
  S: S_CREST31,
  pose: { ...SP0 },
  opts: {},
  site: SITE19B.section,
  arrive: 'Ornomuin heldutik enbrioira: leku berean, 3–4. astean',
  caption: CAP,
  key: KEY19.crest,
  steps: [
    {
      to: { fold: 0.72 },
      run: [0.15, 0.95],
      cam: VIEW(8.4, -0.4),
      fit: false,
      glide: 0.06,
      dim: ['plaka-neurala', 'gandor-neurala'],
      names: [
        { id: 'plaka-neurala', text: 'Plaka neurala', sub: 'ektodermoan' },
        { id: 'gandor-neurala', text: 'Gandor neurala', sub: 'tolesduren muturretan', from: 0.5 },
      ],
      note: 'Plaka neurala ektodermoan: aldeak tolestu egiten dira; tolesduren muturretan gandor neuraleko zelulak',
    },
    {
      to: { fold: 1, crest: 0.18 },
      run: [0.05, 0.75],
      cam: VIEW(8.0, -0.3),
      fit: false,
      glide: 0.05,
      dim: ['hodi-neurala', 'gandor-neurala', 'azaleko-ektodermoa'],
      names: [
        { id: 'hodi-neurala', text: 'Hodi neurala', sub: 'ektodermotik askatuta', from: 0.6 },
        { id: 'gandor-neurala', text: 'Gandor zelulak', sub: 'hasieran plaka bezala', from: 0.75 },
        { id: 'azaleko-ektodermoa', small: true, from: 0.5 },
      ],
      note: 'Hodi neurala ektodermotik askatzean, gandor neuraleko zelulak hasieran plaka bezala gelditzen dira, hodiaren gainean',
    },
    {
      to: { crest: 1 },
      run: [0.05, 0.85],
      cam: CLOSE(5.2, -0.1),
      fit: false,
      glide: 0.05,
      dim: ['gandor-neurala', 'hodi-neurala'],
      names: [{ id: 'gandor-neurala', text: 'Gandor zelulak', sub: 'hodiaren alde bietara', from: 0.4 }],
      note: 'Gero banatu egiten dira, hodiaren alde bietara, eta metaketak eratzen dituzte',
    },
    {
      to: { drg: 1 },
      run: [0.05, 0.7],
      cam: CLOSE(5.4, -0.1),
      fit: false,
      glide: 0.05,
      dim: ['gongoil-errakideoak', 'hodi-neurala'],
      names: [{ id: 'gongoil-errakideoak', text: 'Atzeko sustraietako gongoilak', sub: 'ornomuinaren atze-alboetan', from: 0.4 }],
      note: 'Gero ornomuina izango den horren atze-alboetan metatu: atzeko sustraietako gongoilak',
    },
  ],
};
export const Crest31 = poseStage19(specCrest31, build);

export const S_DERIV31 = [0, 0.15, 0.3, 0.44, 0.58, 0.72, 0.86] as const;
const specDeriv31: StageSpec<SectionPose, SectionOpts> = {
  S: S_DERIV31,
  pose: endPose(specCrest31).pose,
  opts: {},
  site: SITE19B.section,
  arrive: 'Mozketa bera: gandorraren zelulak urrunago doaz',
  caption: CAP,
  key: [
    { color: C19.crest, text: 'gandor neurala' },
    { color: C19.sens, text: 'gongoil espinala' },
    { color: C19.symp, text: 'gongoil sinpatikoak' },
    { color: '#e9b44c', text: 'zelula kromafinak' },
  ],
  steps: [
    {
      to: { chain: 1, preaortic: 1 },
      run: [0.05, 0.9],
      cam: VIEW(9.6, -1.0),
      fit: false,
      glide: 0.06,
      dim: ['gongoil-errakideoak', 'gongoil-sinpatikoak', 'aorta-aurreko-gongoilak'],
      names: [
        { id: 'gongoil-errakideoak', text: 'Gongoil espinalak', small: true },
        { id: 'gongoil-sinpatikoak', text: 'Kate sinpatikoa', sub: 'gongoilak', from: 0.4 },
        { id: 'aorta-aurreko-gongoilak', text: 'Aorta aurreko sarea', sub: 'gongoilak', from: 0.6 },
      ],
      note: 'Gongoil espinalak, sinpatikoak (katearenak eta aorta aurreko sarekoak) eta parasinpatikoak: haien neuronak gandorretik',
    },
    {
      to: { schwann: 1 },
      run: [0.1, 0.7],
      cam: VIEW(8.6, -0.7, 20),
      fit: false,
      glide: 0.05,
      dim: ['schwann-zelulak'],
      names: [{ id: 'schwann-zelulak', text: 'Schwann zelulak', sub: 'mielina, periferikoan bakarrik' }],
      note: 'Bikote kranealen gongoilak ere bai (adib. aurpegiko nerbioaren gongoil genikulatua). Schwann zelulek mielina ekoizten dute, nerbio sistema periferikoan soilik',
      plainNote: 'Schwann zelulek mielina ekoizten dute, nerbio sistema periferikoan soilik',
    },
    {
      cam: VIEW(9.0, -0.6),
      fit: false,
      glide: 0.05,
      dim: ['gandor-neurala', 'gongoil-errakideoak'],
      names: [{ id: 'gandor-neurala', text: 'Gandorretik: araknoidesa eta pia', sub: 'eta 1.–3. arkuetako hezurrak' }],
      note: 'Meningeetako bi (araknoidesa eta pia materra) gandor zeluletatik; baita 1., 2. eta 3. faringe arkuetako hezurrak eta kartilagoak ere',
    },
    {
      to: { adrenal: 1 },
      run: [0.05, 0.85],
      cam: VIEW(9.4, -1.2, 18),
      fit: false,
      glide: 0.05,
      dim: ['zelula-kromafinak', 'giltzurrun-gaineko-muina'],
      names: [
        { id: 'zelula-kromafinak', text: 'Zelula kromafinak', sub: 'giltzurrun gaineko guruinen muinean', from: 0.5 },
        { id: 'giltzurrun-gaineko-muina', small: true, from: 0.6 },
      ],
      note: 'Giltzurrun gaineko guruinen muineko zelula kromafinak: gandorretik askatu eta muinaren barruan sartzen dira',
    },
    {
      to: { melano: 1 },
      run: [0.05, 0.8],
      cam: VIEW(8.6, -0.2, 18),
      fit: false,
      glide: 0.05,
      dim: ['melanozitoak', 'azaleko-ektodermoa'],
      names: [{ id: 'melanozitoak', text: 'Melanozitoak', sub: 'larruazalari eta ileari kolorea', from: 0.5 }],
      note: 'Melanozitoak: gure larruazalari eta ileari kolorea ematen dietenak',
    },
    {
      cam: VIEW(9.6, -0.8),
      fit: false,
      glide: 0.05,
      dim: ['gandor-neurala', 'gongoil-errakideoak', 'gongoil-sinpatikoak', 'aorta-aurreko-gongoilak', 'zelula-kromafinak', 'melanozitoak', 'schwann-zelulak'],
      names: [{ id: 'gandor-neurala', text: 'Gandorraren eratorriak', sub: 'anomaliak: sortzetiko malformazioen %30' }],
      note: 'Eratorriak ondo bereizten ez badira edo beren lekura iristen ez badira, ez dute funtziorik betetzen: jaioberrien malformazio kongenitoen %30',
    },
    {
      cam: VIEW(8.0, -0.4),
      fit: false,
      glide: 0.05,
      dim: ['hodi-neurala'],
      names: [{ id: 'hodi-neurala', text: 'Hodi neurala', sub: '4. astean: ez da ornomuina' }],
      note: 'Kontuz: 4. astean oraindik hodi neurala existitzen da, ez da ornomuina',
      warn: true,
    },
  ],
};
export const Deriv31 = poseStage19(specDeriv31, build);

export const S_LAYERS31 = [0, 0.24, 0.48, 0.72] as const;
const specLayers31: StageSpec<SectionPose, SectionOpts> = {
  S: S_LAYERS31,
  pose: endPose(specDeriv31).pose,
  opts: {},
  site: SITE19B.section,
  arrive: 'Hodi bera, 5. astetik aurrera: horma lodituz doa',
  caption: CAP,
  key: [
    { color: '#9fb6f2', text: 'neuroepitelioa' },
    { color: '#6a86d6', text: 'manto geruza' },
    { color: '#e6dcc2', text: 'geruza marginala' },
  ],
  steps: [
    {
      to: { mature: 0, chain: 0, preaortic: 0, adrenal: 0, melano: 0, schwann: 0 },
      run: [0, 0.8],
      cam: CLOSE(4.4, -0.05),
      fit: false,
      glide: 0.06,
      dim: ['hodi-neurala'],
      names: [{ id: 'hodi-neurala', text: 'Hodiak hodi forma mantentzen du', sub: '5. astetik 3. hilabetera', from: 0.5 }],
      note: 'Ornomuinaren garapena 5. astean hasi eta 3. hilabetean amaitzen da: hodi neuralak hodi forma mantentzen du',
    },
    {
      to: { layers: 1 },
      run: [0.05, 0.6],
      cam: CLOSE(3.6, 0.0, 14, 28),
      fit: false,
      glide: 0.05,
      dim: ['neuroepitelioa', 'barneko-mintz-mugatzailea'],
      names: [
        { id: 'barneko-mintz-mugatzailea', text: 'Barneko mintz mugatzailea', sub: '5. astea' },
        { id: 'neuroepitelioa', text: 'Neuroepitelioa', sub: 'zelula neuroepiteliarrak', from: 0.35 },
      ],
      note: 'Ependimoa hasieran zapala da, barnetik barneko mintz mugatzaileak mugatua; barnerantz zelula neuroepiteliarrak: neuroepitelioa',
    },
    {
      to: { blasts: 1 },
      run: [0.05, 0.85],
      cam: CLOSE(3.6, 0.0, 14, 28),
      fit: false,
      glide: 0.05,
      dim: ['neuroblastoak', 'neuroepitelioa'],
      names: [
        { id: 'neuroblastoak', text: 'Neuroblastoak', sub: 'haietatik neuronak', from: 0.3 },
        { id: 'neuroepitelioa', small: true, from: 0.5 },
      ],
      note: 'Zelula neuroepiteliarrak bereizi eta zelula mota desberdinak sortzen dituzte, nagusiki neuroblastoak: haietatik neuronak',
    },
    {
      cam: CLOSE(4.2, -0.05),
      fit: false,
      glide: 0.05,
      dim: ['manto-geruza', 'geruza-marginala', 'kanpoko-mintz-mugatzailea'],
      names: [
        { id: 'manto-geruza', text: 'Manto geruza', sub: 'somak → gai grisa' },
        { id: 'geruza-marginala', text: 'Geruza marginala', sub: 'axoiak → gai zuria', from: 0.3 },
        { id: 'kanpoko-mintz-mugatzailea', text: 'Kanpoko mintz mugatzailea', sub: 'bertan pia materra', from: 0.55 },
      ],
      note: 'Neuroblastoen geruza manto geruza da (gero gai grisa); haien axoiak kanpora, geruza marginala (gero gai zuria); kanpoan mintz mugatzailea, bertan pia materra',
    },
  ],
};
export const Layers31 = poseStage19(specLayers31, build);

export const S_PLATES31 = [0, 0.2, 0.4, 0.62, 0.84] as const;
const specPlates31: StageSpec<SectionPose, SectionOpts> = {
  S: S_PLATES31,
  pose: endPose(specLayers31).pose,
  opts: {},
  site: SITE19B.section,
  arrive: 'Hodi bera: orain dortsala eta bentrala',
  caption: CAP,
  key: [
    { color: '#c7d3f4', text: 'hegal plaka: sentsitiboa' },
    { color: '#3c4f86', text: 'oinalde plaka: motorra' },
  ],
  steps: [
    {
      to: { plates: 1, blasts: 0 },
      run: [0.05, 0.6],
      cam: CLOSE(4.4, -0.05),
      fit: false,
      glide: 0.06,
      dim: ['hegal-plaka', 'oinalde-plaka'],
      names: [
        { id: 'hegal-plaka', text: 'Hegal plaka', sub: 'dortsala: sentsitiboa' },
        { id: 'oinalde-plaka', text: 'Oinalde plaka', sub: 'bentrala: motorra', from: 0.3 },
      ],
      note: 'Alde dortsalean neurona sentsitiboak, bentralean motorrak: bi plaka nagusi, hegal plaka (sentsitiboa) eta oinalde plaka (motorra)',
    },
    {
      cam: CLOSE(3.8, 0.0, 14, 30),
      fit: false,
      glide: 0.05,
      dim: ['ildo-mugatzailea', 'sabai-plaka', 'zoru-plaka'],
      names: [
        { id: 'ildo-mugatzailea', p: [0.202, 0.004, 0.6], text: 'Ildo mugatzailea', sub: 'muga fisiologikoa' },
        { id: 'sabai-plaka', text: 'Sabai plaka', sub: 'axoiak bakarrik', from: 0.3 },
        { id: 'zoru-plaka', text: 'Zoru plaka', sub: 'axoiak bakarrik', from: 0.45 },
      ],
      note: 'Bien artean ildo mugatzailea (muga fisiologikoa). Dortsalean sabai plaka, bentralean zoru plaka: ez dute manto geruzarik, axoiak alde batetik bestera',
    },
    {
      to: { mature: 1 },
      run: [0.05, 0.92],
      cam: CLOSE(5.0, -0.1),
      fit: false,
      glide: 0.06,
      dim: ['ependimo-geruza', 'gai-grisa', 'gai-zuria', 'pia-materra'],
      names: [
        { id: 'ependimo-geruza', p: [0.066, 0.027, 0.6], text: 'Ependimo geruza', sub: 'pareta', from: 0.4 },
        { id: 'gai-grisa', text: 'Gai grisa', from: 0.6 },
        { id: 'gai-zuria', text: 'Gai zuria', from: 0.7 },
        { id: 'hodi-ependimarioa', text: 'Ependimoa', small: true, from: 0.75 },
      ],
      note: 'Pareta eratzen gelditu diren zelulek ependimo geruza; barnerago geratutakoek neuronak (gai grisa), haien axoiak kanpora (gai zuria); azkenean pia materra',
    },
    {
      to: { lat: 1 },
      run: [0.1, 0.6],
      cam: CLOSE(5.0, -0.1),
      fit: false,
      glide: 0.05,
      dim: ['eremu-sentsitiboa', 'eremu-motorra', 'alboko-adarra'],
      names: [
        { id: 'eremu-sentsitiboa', text: 'Eremu sentsitiboa', sub: 'hegal plakatik: atzeko adarrak' },
        { id: 'eremu-motorra', text: 'Eremu motorra', sub: 'oinalde plakatik: aurreko adarrak', from: 0.25 },
        { id: 'alboko-adarra', text: 'Alboko adarrak', sub: 'T1etik L2ra', from: 0.5 },
      ],
      note: 'Garatuta, plakak desagertzen dira: hegal plaka eremu sentsitiboa, oinalde plaka eremu motorra. H forma; aurrean idor sakona; alboko adarrak T1etik L2ra',
    },
    {
      cam: CLOSE(5.0, -0.1),
      fit: false,
      glide: 0.05,
      dim: ['eremu-sentsitiboa', 'eremu-motorra'],
      names: [
        { id: 'eremu-sentsitiboa', text: '3. hilabetean', sub: 'ez dago plakarik' },
        { id: 'eremu-motorra', small: true, from: 0.2 },
      ],
      note: 'Kontuz: 3. hilabetean jada ez dago plakarik; ornomuinaren eremu sentsitiboa eta motorra daude',
      warn: true,
    },
  ],
};
export const Plates31 = poseStage19(specPlates31, build);
