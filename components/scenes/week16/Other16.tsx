'use client';

import { UC } from '@/components/scenes/week15/uro-model';
import { BLOCK16, BLOCK_AXES, LEFT16, orbit, poseStage, type StageSpec } from './common';
import { BR0, broadModel, type BroadOpts, type BroadPose } from './broad-model';
import { DS0, descentModel, type DescentOpts, type DescentPose } from './descent-model';
import { EX0, externalModel, type ExternalOpts, type ExternalPose } from './external-model';

/**
 * Topic 16: the pelvis cut across (broad-model.ts, stage 12), the testis's descent (descent-model.ts, stages 14
 * and 15) and the external genitalia (external-model.ts, stages 17–19).
 */

// ———————————————————————————— 12. Lotailu zabala eta zaku-hondoak ————————————————————————————

export const S12 = [0, 0.2, 0.4, 0.6, 0.8] as const;

const spec12: StageSpec<BroadPose, BroadOpts> = {
  S: S12,
  pose: BR0,
  opts: {},
  caption: 'Pelbisa zeharka ebakita (3D blokea, goitik): bizkarra goian',
  key: [
    { color: UC.muller, text: 'Müller hodiak, uteroa' },
    { color: '#f9a8b8', text: 'peritoneoa, lotailu zabala' },
    { color: '#8fb8ff', text: 'zaku-hondoak' },
  ],
  axes: BLOCK_AXES,
  steps: [
    {
      to: { merge: 0.5 },
      run: [0.1, 0.9],
      cam: BLOCK16(10, [0, 0.1, 0], 8, 10),
      glide: 0.06,
      dim: ['hodi-paramesonefrikoa', 'mesoa', 'obarioa'],
      names: [
        { id: 'hodi-paramesonefrikoa', sub: 'beherantz: erdialderantz' },
        { id: 'mesoa', text: 'Haien mesoa', from: 0.3 },
        { id: 'obarioa', small: true, from: 0.5 },
      ],
      note: 'Hiru zeharkako mozketa, goitik behera (abdomena → pelbisa): hodi paramesonefrikoak beherantz luzatu ahala erdialderantz mugitzen dira',
    },
    {
      to: { merge: 1 },
      run: [0.06, 0.85],
      cam: BLOCK16(10, [0, 0, 0], 10, 12),
      glide: 0.05,
      dim: ['utero-hodia', 'lotailu-zabala'],
      names: [
        { id: 'utero-hodia', sub: 'erdian elkartuta', from: 0.4 },
        { id: 'lotailu-zabala', sub: 'mesoa arrastatuta: alboko paretetaraino', from: 0.55 },
      ],
      note: 'Erdian bat egiten dute (utero hodia), eta mesoa berekin daramate: meso handi bat, pelbisaren alboko paretetaraino. Pelbisa bitan banatzen da',
    },
    {
      to: { bladder: 1, pouches: 1 },
      run: [0.06, 0.7],
      cam: BLOCK16(10, [0, -0.2, 0], 6, 14),
      glide: 0.05,
      dim: ['zaku-hondo-uterobesikala', 'zaku-hondo-uteroerrektala', 'lotailu-zabala', 'gernu-maskuria', 'ondestea'],
      names: [
        { id: 'zaku-hondo-uterobesikala', sub: 'gernu maskuria ↔ uteroa', from: 0.15 },
        { id: 'zaku-hondo-uteroerrektala', sub: 'uteroa ↔ ondestea', from: 0.35 },
        { id: 'lotailu-zabala', text: 'Lotailu zabala (mesometrioa)', from: 0.55 },
      ],
      note: 'Bi zaku-hondo: utero-besikala (aurrean, gernu maskuria eta uteroa artean) eta utero-errektala (atzean, uteroa eta ondestea artean); lotailu zabalak bereizten ditu',
    },
    {
      cam: orbit(-90, 6, 9.5, [0, -0.2, 0], [20, 0]),
      glide: 0.08,
      dim: ['gernu-maskuria', 'zaku-hondo-uterobesikala', 'uteroa', 'zaku-hondo-uteroerrektala', 'ondestea'],
      names: [
        { id: 'gernu-maskuria', text: 'Gernu maskuria', sub: 'aurrean' },
        { id: 'zaku-hondo-uterobesikala', text: '1. Zokogune uterobesikala' },
        { id: 'uteroa', text: '2. Uteroa', sub: 'gernu maskuriaren gainean etzanda' },
        { id: 'zaku-hondo-uteroerrektala', text: '3. Zokogune uteroerrektala', sub: 'haurdunaldi ektopikoa hemen' },
        { id: 'ondestea', sub: 'atzean' },
      ],
      note: 'Aurretik atzera: zokogune uterobesikala, uteroa (gernu maskuriaren gainean, hortik bagina), zokogune uteroerrektala. Beherago bestibulua: uretra aurrean, bagina atzerago',
    },
    {
      cam: BLOCK16(10, [0, -0.2, 0], 8, 12),
      glide: 0.08,
    },
  ],
};
export const Broad16 = poseStage(spec12, (p, o) => broadModel(p, o));

// ———————————————————————————— 14–15. Barrabilaren jaisketa ————————————————————————————

const KEY_D = [
  { color: '#b9e6de', text: 'barrabila' },
  { color: '#9ca3af', text: 'gubernakulua' },
  { color: '#f7a8b8', text: 'peritoneoa (luzapen baginala)' },
  { color: UC.wolff, text: 'hodi deferentea' },
] as const;
const DCAP = 'Enbor behea, barrabilaren alboan ebakita, ezkerretik (3D eredua): sabela zure ezkerrean';
const DCAM = (dist = 9, target: [number, number, number] = [0.9, -0.6, 0.3], yaw = 90, elev = 4) => LEFT16(dist, target, yaw, elev);

export const S14 = [0, 0.25, 0.5, 0.75] as const;

const spec14: StageSpec<DescentPose, DescentOpts> = {
  S: S14,
  pose: DS0,
  opts: {},
  caption: DCAP,
  key: KEY_D,
  steps: [
    {
      cam: DCAM(10, [0.9, -0.2, 0.2]),
      glide: 0.06,
      dim: ['barrabila', 'paretako-peritoneoa'],
      names: [
        { id: 'barrabila', sub: 'abdomenean, peritoneo atzean' },
        { id: 'paretako-peritoneoa', small: true, from: 0.3 },
      ],
      note: 'Gonadek giltzurrunen aurkako bidea: abdomenean eratu (peritoneo atzean) eta behera. Arretan gorputzetik kanpo, emeetan barrunbe pelbianoan',
    },
    {
      cam: DCAM(10, [0.9, -0.8, 0.3], 80, 4),
      glide: 0.05,
      dim: ['gubernakulua', 'eskroto-goragunea'],
      names: [
        { id: 'gubernakulua', sub: 'gida: gonadatik larruazaleraino' },
        { id: 'eskroto-goragunea', sub: 'larruazalean ainguratuta', from: 0.35 },
      ],
      note: 'Gubernakulua: lotailu modukoa, «egitura gidaria». Mesonefrosarekin lotua, gonadatik larruazaleraino, eta larruazalean ainguratzen da',
    },
    {
      to: { down: 0.5 },
      run: [0.06, 0.9],
      cam: DCAM(10, [0.9, -0.8, 0.3], 96, 4),
      glide: 0.05,
      dim: ['barrabila', 'gubernakulua'],
      names: [{ id: 'barrabila', sub: 'pasiboki: inguruko guztia igotzen da' }],
      note: 'Gorputza handitu eta gubernakulua ez da luzatzen: gonada gero eta beherago geratzen da, pasiboki (ez du mugimendu aktiborik)',
    },
    { cam: DCAM(10, [0.9, -0.8, 0.3], 96, 4) },
  ],
};
export const Descent16 = poseStage(spec14, (p, o) => descentModel(p, o));

export const S15 = [0, 0.2, 0.4, 0.6, 0.8] as const;

const spec15: StageSpec<DescentPose, DescentOpts> = {
  S: S15,
  pose: { ...DS0, down: 0.5 },
  opts: {},
  caption: DCAP,
  key: KEY_D,
  steps: [
    {
      cam: DCAM(8.5, [0.9, -1.4, 0.6], 92, 4),
      glide: 0.06,
      dim: ['barrabila', 'sinfisi-pubikoa'],
      names: [
        { id: 'barrabila', sub: '3. hilabetea: barrunbe pelbikoaren zoruan' },
        { id: 'sinfisi-pubikoa', small: true },
        { id: 'eskroto-goragunea', sub: 'hona iritsi behar du', from: 0.35 },
      ],
      note: '3. hilabetean barrabila barrunbe pelbikoaren zoruan, ia iztai hodiaren mailan; oraindik eskroto poltsetara jaitsi behar du',
    },
    {
      to: { pv: 1 },
      run: [0.06, 0.85],
      cam: DCAM(8.5, [0.9, -1.9, 0.9], 84, 4),
      glide: 0.05,
      dim: ['luzapen-baginala', 'gubernakulua'],
      names: [{ id: 'luzapen-baginala', sub: 'pelbi barrunbetik, gubernakuluaren atzean', from: 0.2 }],
      note: 'Pelbi barrunbetik ebaginazio bat, gubernakuluaren atzekaldean, tolespen bat bezala: luzapen (prozesu) baginala',
    },
    {
      to: { layers: 1 },
      run: [0.06, 0.8],
      cam: DCAM(7.5, [0.9, -2.3, 1.1], 76, 6),
      glide: 0.05,
      dim: ['luzapen-baginala', 'horma-abdominala'],
      names: [
        { id: 'luzapen-baginala', small: true },
        { id: 'horma-abdominala', text: 'Hormaren geruzak', sub: 'luzapenak berekin darama', from: 0.25 },
      ],
      note: 'Luzapenak barrunbetik hasita hormaren atal bat darama: geruza muskular guztiak barrabilaren inguruan geratuko dira eskrotoan',
    },
    {
      to: { down: 1 },
      run: [0.04, 0.9],
      cam: DCAM(8.5, [0.9, -2.0, 0.9], 90, 4),
      glide: 0.05,
      dim: ['barrabila', 'gubernakulua'],
      names: [{ id: 'gubernakulua', sub: 'gero eta laburragoa' }],
      note: 'Barrabila gero eta beherago; gubernakulua gero eta laburragoa, barrabila larruazaletik hurbil dagoelako',
    },
    {
      to: { close: 1, tunica: 1, gubGone: 1 },
      run: [0.06, 0.85],
      cam: DCAM(8, [0.9, -2.1, 0.95], 82, 6),
      glide: 0.05,
      dim: ['iztai-hodia', 'geruza-baginala', 'hodi-deferentea', 'barrabila'],
      names: [
        { id: 'iztai-hodia', sub: 'luzapenaren hormak estutu: ia itxita', from: 0.25 },
        { id: 'geruza-baginala', small: true, from: 0.45 },
        { id: 'hodi-deferentea', sub: 'iztai hoditik pasatzen da', from: 0.6 },
        { id: 'luzapen-baginala', small: true },
      ],
      note: 'Jaiotzean barrabilak eskrotoan; luzapen baginalaren hormak estutu: iztai hodia, ez guztiz itxita (nerbioak, arteriak, zainak, hodi deferentea). Gubernakulua desagertzen da',
    },
  ],
};
export const DescentMale16 = poseStage(spec15, (p, o) => descentModel(p, o));

// ———————————————————————————— 17–19. Kanpo genitalak ————————————————————————————

const KEY_E = [
  { color: '#f29bb0', text: 'tuberkulua' },
  { color: '#f7b6c2', text: 'tolespenak' },
  { color: '#e9b48f', text: 'goraguneak' },
  { color: '#f4efe2', text: 'mintzak' },
] as const;
const ECAP = 'Kanpo genitalak behetik eta aurretik (3D eredua): tuberkulua goian, uzkia behean';
const EAXES = {
  up: 'tuberkulua',
  front: 'zugana',
  side: 'ezkerra',
  sideDir: [1, 0, 0] as [number, number, number],
  edges: { up: 'Tuberkulua', down: 'Uzkia', front: 'Zugana', back: 'Atzera', side: 'Ezkerra', otherSide: 'Eskuina' },
};
const ECAM = (dist = 6.5, target: [number, number, number] = [0, 0.1, 0], yaw = 0, elev = 6) => orbit(yaw, elev, dist, target, [20, 0]);

export const S17 = [0, 0.25, 0.5, 0.75] as const;

const spec17: StageSpec<ExternalPose, ExternalOpts> = {
  S: S17,
  pose: EX0,
  opts: {},
  caption: ECAP,
  key: KEY_E,
  axes: EAXES,
  steps: [
    {
      to: { tubercle: 1 },
      run: [0.15, 0.85],
      cam: ECAM(),
      glide: 0.06,
      dim: ['kloaka-mintza', 'tuberkulu-genitala'],
      names: [
        { id: 'kloaka-mintza', sub: '4. astea: trenkadatu gabe' },
        { id: 'tuberkulu-genitala', sub: 'aurrean', from: 0.4 },
      ],
      note: '6.–7. astera arte berdin ar eta emeetan. 4. astean kloaka mintza trenkadatu gabe; aurrean tuberkulu genitala',
    },
    {
      to: { folds: 1, swellings: 1 },
      run: [0.06, 0.8],
      cam: ECAM(6.5, [0, 0, 0], 8, 10),
      glide: 0.05,
      dim: ['kloaka-tolespenak', 'goragune-genitalak'],
      names: [
        { id: 'kloaka-tolespenak', sub: 'mintzaren bi alboetan', from: 0.15 },
        { id: 'goragune-genitalak', sub: 'kanporago', from: 0.45 },
      ],
      note: 'Kloaka mintzaren bi alboetan kloaka tolespenak; haien alboan, kanporago, goragune genitalak',
    },
    {
      to: { divide: 1 },
      run: [0.06, 0.7],
      cam: ECAM(5.5, [0, -0.2, 0], 4, 14),
      glide: 0.05,
      dim: ['mintz-urogenitala', 'uzki-mintza', 'perineoa'],
      names: [
        { id: 'mintz-urogenitala', sub: 'sinu urogenitala estaliz' },
        { id: 'uzki-mintza', sub: 'atzekaldean', from: 0.25 },
        { id: 'perineoa', sub: 'bi zuloen artean', from: 0.45 },
      ],
      note: '7. asterako kloakaren trenkadatzea amaituta: mintz urogenitala (aurrean) eta uzki mintza (atzean); bien artean perineoa',
    },
    {
      to: { groove: 1 },
      run: [0.3, 0.85],
      cam: ECAM(6, [0, 0.1, 0], -6, 10),
      glide: 0.05,
      dim: ['tolespen-urogenitalak', 'tolespen-ezpaineskrotalak', 'ildo-urogenitala'],
      names: [
        { id: 'tolespen-urogenitalak', sub: 'sinuaren ertzetan (uretralak)' },
        { id: 'tolespen-ezpaineskrotalak', sub: 'goragune genitaletatik', from: 0.15 },
        { id: 'ildo-urogenitala', sub: '7. astearen bukaera: mintza apurtu', from: 0.55 },
      ],
      note: 'Tolespenak orain tolespen urogenitalak (uretralak); goraguneak tolespen ezpaineskrotalak. 7. astearen bukaeran mintz urogenitala apurtu: ildo urogenitala',
    },
  ],
};
export const External16 = poseStage(spec17, (p, o) => externalModel(p, o));

const EX_END: ExternalPose = { ...EX0, tubercle: 1, folds: 1, swellings: 1, divide: 1, groove: 1 };

export const S18 = [0, 0.33, 0.66] as const;

const spec18: StageSpec<ExternalPose, ExternalOpts> = {
  S: S18,
  pose: EX_END,
  opts: {},
  caption: ECAP,
  key: KEY_E,
  axes: EAXES,
  steps: [
    {
      to: { female: 0.5 },
      run: [0.1, 0.9],
      cam: ECAM(6, [0, 0.4, 0.1], 12, 12),
      glide: 0.06,
      dim: ['tuberkulu-genitala', 'klitoria'],
      names: [{ id: 'klitoria', text: 'Klitoriaren glandea', sub: 'tuberkulua gutxi hazi, barnerantz tolestu', from: 0.3 }],
      note: 'Emeetan tuberkulua gutxi hazten da eta apur bat barnerantz tolesten: klitoriaren glandea',
    },
    {
      to: { female: 1 },
      run: [0.05, 0.6],
      cam: ECAM(5.5, [0, 0.1, 0], 6, 12),
      glide: 0.05,
      dim: ['ezpain-txikiak', 'baginaren-bestibulua', 'kanpoko-uretra-zuloa', 'baginaren-zuloa'],
      names: [
        { id: 'ezpain-txikiak', sub: 'tolespen urogenitaletatik' },
        { id: 'baginaren-bestibulua', sub: 'ildo genitaletik', from: 0.2 },
        { id: 'kanpoko-uretra-zuloa', sub: 'aurrean', from: 0.4 },
        { id: 'baginaren-zuloa', sub: 'atzean', from: 0.55 },
      ],
      note: 'Tolespen urogenitaletatik ezpain txikiak; erdiko ildoa baginaren bestibulua, uretraren kanpoko zuloa (aurrean) eta baginaren zuloa (atzean)',
    },
    {
      cam: ECAM(6.5, [0, 0, 0], -8, 10),
      glide: 0.05,
      dim: ['ezpain-nagusiak'],
      names: [{ id: 'ezpain-nagusiak', sub: 'tolespen ezpaineskrotaletatik, lateralago' }],
      note: 'Kanpoan, tolespen ezpaineskrotaletatik, lateralago, ezpain nagusiak',
    },
  ],
};
export const ExternalFemale16 = poseStage(spec18, (p, o) => externalModel(p, o));

export const S19 = [0, 0.25, 0.5, 0.75] as const;

const spec19: StageSpec<ExternalPose, ExternalOpts> = {
  S: S19,
  pose: EX_END,
  opts: {},
  caption: ECAP,
  key: KEY_E,
  axes: EAXES,
  steps: [
    {
      to: { male: 1 },
      run: [0.1, 0.85],
      cam: ECAM(7.5, [0, 0.5, 0.6], 40, 14),
      glide: 0.06,
      dim: ['faloa', 'tuberkulu-genitala'],
      names: [{ id: 'faloa', sub: 'tuberkulua luzatuta', from: 0.3 }],
      note: 'Gizonezkoetan tuberkulua luzatu egiten da: faloa',
    },
    {
      to: { closeGroove: 1 },
      run: [0.06, 0.9],
      cam: ECAM(7, [0, 0.4, 0.5], 60, 4),
      glide: 0.06,
      dim: ['ildo-urogenitala', 'zakil-uretra', 'tolespen-urogenitalak'],
      names: [
        { id: 'ildo-urogenitala', sub: 'atzekaldetik aurrerantz ixten' },
        { id: 'zakil-uretra', sub: 'itxitakoan barruan · 4. hilabetea', from: 0.5 },
      ],
      note: 'Ildoa mantendu, baina atzekaldetik aurrerantz ixten da; guztiz ixtean barruan zakil uretra (4. hilabetean osatuta)',
    },
    {
      to: { scrotum: 1 },
      run: [0.06, 0.85],
      cam: ECAM(7, [0, -0.1, 0.3], 20, 18),
      glide: 0.05,
      dim: ['eskrotoa', 'eskroto-errafea'],
      names: [
        { id: 'eskrotoa', sub: 'tolespen ezpaineskrotalak loditu', from: 0.2 },
        { id: 'eskroto-errafea', sub: 'trenkadaren aztarna kanpoan', from: 0.6 },
      ],
      note: 'Tolespen ezpaineskrotalak loditu: eskroto goragunea, gero eskroto poltsa. Barnean trenkadatuta; kanpoan aztarna: eskroto errafea',
    },
    {
      cam: ECAM(6.5, [0, 0.9, 0.9], 70, 8),
      glide: 0.06,
      dim: ['glandea', 'zakil-uretra'],
      names: [
        { id: 'glandea', sub: 'uretrak ez du zeharkatzen' },
        { id: 'zakil-uretra', small: true },
      ],
      note: 'Uretra azpikaldetik ixten da, baina ez du glandea zeharkatzen: ektodermoko kordoi bat glandean barneratzen da (15. gaia: kanpoko uretra-zuloa)',
    },
  ],
};
export const ExternalMale16 = poseStage(spec19, (p, o) => externalModel(p, o));
