'use client';

import { BLOCK19, KEY19, endPose, poseStage19, type StageSpec } from './common';
import { CP0, cordModel, type CordOpts, type CordPose } from './cord-model';
import { SITE19 } from './sites';
import { C19, G19 } from './tones';

/**
 * Topic 19 (the notes of 2026-11-23), section 3 (grey and white matter, rootlets and roots, the ganglion; 3.1–3.2 the
 * sensory path and the reflex arc) and 5.1 (the meninges of the cord), on one block of the spinal cord at T6
 * (cord-model.ts). Seen from above (dorsal) and the cranial side, its cut face towards us.
 */

const CAP = 'Ornomuinaren blokea, T6 mailan zeharka moztuta (3D eredua): goian dortsala, mozketa goitik ikusita';
const build = (pose: CordPose, opts: CordOpts) => cordModel(pose, opts);
const FACE = (dist = 9.5, yaw = 16, elev = 24, x = 0) => BLOCK19(dist, [x, -0.1, 0.6], yaw, elev);
const SIDE = (dist = 11, x = 2.2) => BLOCK19(dist, [x, -0.3, 0.6], 22, 26);

// ———————————————————————— Gai grisa eta gai zuria (3) ————————————————————————

export const S_GREY = [0, 0.2, 0.4, 0.6, 0.8] as const;
const specGrey: StageSpec<CordPose, CordOpts> = {
  S: S_GREY,
  pose: { ...CP0, roots: 0, rami: 0, pia: 1 },
  opts: {},
  site: SITE19.cord,
  arrive: 'Gorputzaren ornomuinera hurbildu gara, T6 mailan: zeharka moztuta',
  caption: CAP,
  key: [
    { color: C19.grey, text: 'gai grisa (somak)' },
    { color: C19.white, text: 'gai zuria (axoiak)' },
    { color: C19.motor, text: 'motorra' },
    { color: C19.sens, text: 'sentsitiboa' },
  ],
  steps: [
    {
      cam: FACE(6.4, 8, 28),
      fit: false,
      glide: 0.08,
      dim: ['gai-grisa', 'hodi-ependimarioa'],
      names: [
        { id: 'gai-grisa', text: 'Gai grisa', sub: 'barnean: neuronen somak' },
        { id: 'hodi-ependimarioa', text: 'Ependimoa', small: true, from: 0.4 },
      ],
      note: 'Ornomuinean, helduan eta garatzen ari den bitartean, beti: barnean gai grisa, neuronen somak (gongoiletan ere badaude)',
    },
    {
      to: { fn: 1 },
      run: [0.15, 0.75],
      cam: FACE(5.6, 6, 30),
      fit: false,
      glide: 0.06,
      dim: ['gai-grisa', 'aurreko-adarra', 'atzeko-adarra'],
      names: [
        { id: 'aurreko-adarra', text: '2 aurreko adar (bentralak)', sub: 'neurona motorrak', from: 0.3 },
        { id: 'atzeko-adarra', text: '2 atzeko adar (dortsalak)', sub: 'neurona sentsitiboak', from: 0.45 },
      ],
      note: 'Tximeleta edo H forma, 4 adarrekin: 2 aurreko adar (bentralak) neurona motorrekin eta 2 atzeko adar (dortsalak) sentsitiboekin',
    },
    {
      to: { inter: 1 },
      run: [0.1, 0.7],
      cam: FACE(5.4, 8, 30),
      fit: false,
      glide: 0.05,
      dim: ['interneurona', 'atzeko-adarra', 'aurreko-adarra'],
      names: [{ id: 'interneurona', text: 'Interneuronak', sub: 'aurreko eta atzeko adarrak lotzen dituzte', from: 0.3 }],
      note: 'Aurreko eta atzeko adarrak lotzen dituzten neuronak interneuronak dira',
    },
    {
      to: { inter: 0 },
      run: [0, 0.4],
      cam: FACE(6.2, 10, 28),
      fit: false,
      glide: 0.05,
      dim: ['gai-zuria'],
      names: [{ id: 'gai-zuria', text: 'Gai zuria', sub: 'kanpoan: neuronen axoiak (zuntzak)' }],
      note: 'Kanpokaldean gai zuria: gai zuritik eta nerbioetatik luzatzen dira neuronen axoiak (zuntzak)',
    },
    {
      to: { tracts: 1 },
      run: [0.1, 0.6],
      cam: FACE(5.6, 6, 30),
      fit: false,
      glide: 0.05,
      dim: ['gai-zuria', 'goranzko-bideak', 'beheranzko-bideak'],
      names: [
        { id: 'goranzko-bideak', text: 'Goranzko bideak', sub: 'sentsitiboak', from: 0.3 },
        { id: 'beheranzko-bideak', text: 'Beheranzko bideak', sub: 'motorrak', from: 0.45 },
      ],
      note: 'Gai zurian goranzko (sentsitiboak) eta beheranzko (motorrak) bideak edo traktuak daude',
    },
  ],
};
export const Grey19 = poseStage19(specGrey, build);

// ———————————————————————— Sustraiak eta gongoila (3) ————————————————————————

export const S_ROOTS = [0, 0.24, 0.48, 0.72] as const;
const specRoots: StageSpec<CordPose, CordOpts> = {
  S: S_ROOTS,
  pose: endPose(specGrey).pose,
  opts: {},
  site: SITE19.cord,
  arrive: 'Ornomuin bera: orain bertatik ateratzen dena',
  caption: CAP,
  key: [
    { color: C19.grey, text: 'gai grisa (somak)' },
    { color: C19.white, text: 'gai zuria (axoiak)' },
    { color: C19.nerve, text: 'sustraitxoak, sustraiak' },
  ],
  steps: [
    {
      to: { tracts: 0, roots: 0.4 },
      run: [0.05, 0.8],
      cam: SIDE(10.5, 1.6),
      fit: false,
      glide: 0.06,
      dim: ['sustraitxoak', 'atzeko-adarra', 'aurreko-adarra'],
      names: [
        { id: 'sustraitxoak', text: 'Sustraitxoak', sub: 'aurrekoak eta atzekoak', from: 0.4 },
        { id: 'atzeko-adarra', small: true, from: 0.55 },
      ],
      note: 'Gai grisetik, atzeko adarrekin komunikatuta, sustraitxoak ateratzen dira ornomuinetik: aurrekoak eta atzekoak',
    },
    {
      to: { roots: 0.66 },
      run: [0.05, 0.75],
      cam: SIDE(11.5, 2.2),
      fit: false,
      glide: 0.06,
      dim: ['atzeko-sustraia', 'aurreko-sustraia', 'sustraitxoak'],
      names: [
        { id: 'atzeko-sustraia', text: 'Atzeko sustraia', sub: 'atzeko sustraitxoak elkartuta', from: 0.35 },
        { id: 'aurreko-sustraia', text: 'Aurreko sustraia', sub: 'aurreko sustraitxoak elkartuta', from: 0.5 },
      ],
      note: 'Aurreko sustraitxoak elkartu eta aurreko sustraia eratzen dute; atzekoak elkartu eta atzeko sustraia',
    },
    {
      to: { roots: 1, rami: 1 },
      run: [0.05, 0.7],
      cam: SIDE(9.5, 2.0),
      fit: false,
      glide: 0.06,
      dim: ['gongoil-errakideoak', 'atzeko-sustraia'],
      names: [{ id: 'gongoil-errakideoak', text: 'Atzeko sustrai-gongoila', sub: 'bertan ere neuronen somak', from: 0.45 }],
      note: 'Atzeko sustraian gongoil bat dago (atzeko sustrai-gongoila), eta bertan ere neuronen somak daude',
    },
    {
      to: { sens: 0.62 },
      run: [0.1, 0.85],
      cam: SIDE(10, 2.2),
      fit: false,
      glide: 0.06,
      dim: ['neurona-sentsitiboa', 'gongoil-errakideoak'],
      names: [
        { id: 'neurona-sentsitiboa', text: 'Neurona bipolarra', sub: 'zentripetoa ornomuinera; zentrifugoa larruazalera', from: 0.35 },
        { id: 'gongoil-errakideoak', small: true, from: 0.5 },
      ],
      note: 'Neurona bipolarrak: luzapen bat ornomuinerantz (zentripetoa edo zentrala) eta bestea periferiarantz, larruazalerantz (zentrifugoa)',
    },
  ],
};
export const Roots19 = poseStage19(specRoots, build);

// ———————————————————————— Sentsibilitatea eta arku erreflexua (3.1–3.2) ————————————————————————

export const S_REFLEX = [0, 0.16, 0.34, 0.52, 0.7, 0.86] as const;
const specReflex: StageSpec<CordPose, CordOpts> = {
  S: S_REFLEX,
  pose: { ...endPose(specRoots).pose, sens: 0 },
  opts: {},
  site: SITE19.cord,
  arrive: 'Ornomuin bera: estimulua sartu, eta erantzuna bertan',
  caption: CAP,
  key: KEY19.function,
  steps: [
    {
      to: { ends: 1 },
      run: [0.05, 0.5],
      cam: SIDE(13, 2.8),
      fit: false,
      glide: 0.08,
      dim: ['larruazala'],
      names: [{ id: 'larruazala', text: 'Larruazala', sub: 'ukimena, beroa…: sentsibilitate orokorra' }],
      note: 'Sentsazioak zentzumen organoetatik eta larruazaletik hartzen ditugu (ukimena, beroa…): azken honi sentsibilitate orokorra deritzo',
    },
    {
      to: { sens: 0.45 },
      run: [0.05, 0.9],
      cam: SIDE(12, 2.8),
      fit: false,
      glide: 0.05,
      dim: ['neurona-sentsitiboa', 'larruazala'],
      names: [{ id: 'neurona-sentsitiboa', p: [4.355, -0.477, 1.031], text: 'Luzapen periferikoa (zentrifugoa)', sub: 'informazioa larruazaletik somarantz', from: 0.4 }],
      note: 'Sua ukitzean hartzaileek beroa eta mina hautematen dute; informazioa luzapen periferikotik (zentrifugoa) igarotzen da, larruazaletik somarantz',
      warn: true,
    },
    {
      to: { sens: 1 },
      run: [0.05, 0.85],
      cam: SIDE(11, 2.2),
      fit: false,
      glide: 0.05,
      dim: ['neurona-sentsitiboa', 'gongoil-errakideoak', 'atzeko-sustraia', 'sustraitxoak'],
      names: [
        { id: 'gongoil-errakideoak', text: 'Soma gongoilean', from: 0.2 },
        { id: 'atzeko-sustraia', text: 'Atzeko sustraitik eta sustraitxoetatik', sub: 'beti hemendik sartzen da', from: 0.55 },
        { id: 'sustraitxoak', small: true, from: 0.65 },
      ],
      note: 'Gongoileko somara heltzen da, eta luzapen zentraletik (zentripetoa) ornomuinera: informazio sentsitiboa beti atzeko sustraitik sartzen da',
    },
    {
      to: { inter: 1 },
      run: [0.1, 0.7],
      cam: FACE(5.4, 8, 30),
      fit: false,
      glide: 0.06,
      dim: ['interneurona', 'atzeko-adarra', 'aurreko-adarra'],
      names: [
        { id: 'interneurona', text: 'Interneurona', sub: 'sinapsia, eta beste sinapsi bat', from: 0.3 },
        { id: 'aurreko-adarra', text: 'Neurona motorrak', small: true, from: 0.6 },
      ],
      note: 'Nerbio espinalak mixtoak dira. Ornomuinean sinapsi baten bidez interneuronetara, eta hauek beste sinapsi batez neurona motorrak aktibatzen dituzte',
    },
    {
      to: { motor: 1 },
      run: [0.05, 0.9],
      cam: SIDE(12.5, 2.8),
      fit: false,
      glide: 0.06,
      dim: ['motoneurona', 'muskulu-ildaskatuak', 'aurreko-sustraia'],
      names: [
        { id: 'motoneurona', text: 'Neurona motorra', sub: 'aurreko sustraitik' },
        { id: 'muskulu-ildaskatuak', text: 'Muskulua', sub: 'erantzun motorra', from: 0.6 },
      ],
      note: 'Erantzun motorra: neurona motorrek aurreko sustraietatik ateratzen diren axoien bidez eramaten dute agindua muskuluetara',
    },
    {
      cam: SIDE(13, 2.8),
      fit: false,
      glide: 0.08,
      dim: ['neurona-sentsitiboa', 'interneurona', 'motoneurona', 'ornomuina'],
      names: [
        { id: 'interneurona', text: 'Arku erreflexua', sub: 'burmuinera iritsi gabe' },
        { id: 'muskulu-ildaskatuak', text: 'Erreflexu rotulianoa', sub: 'mugimendu automatikoa', small: true, from: 0.4 },
        { id: 'neurona-sentsitiboa', p: [5.038, -0.974, 1.001], small: true, from: 0.15 },
        { id: 'motoneurona', small: true, from: 0.25 },
      ],
      note: 'Informazioa burmuinera iritsi gabe erantzun motorra ematen denean: ARKU ERREFLEXUA. Ezagunena, erreflexu rotulianoa',
    },
  ],
};
export const Reflex19 = poseStage19(specReflex, build);

// ———————————————————————— Ornomuinaren meningeak (5.1) ————————————————————————

export const S_MEN = [0, 0.18, 0.4, 0.6, 0.8] as const;
const specMen: StageSpec<CordPose, CordOpts> = {
  S: S_MEN,
  pose: { ...CP0, fn: 1 },
  opts: {},
  site: SITE19.cord,
  arrive: 'Bizkarrezurretik ornomuinaren blokera: bere estalkiak',
  caption: CAP,
  key: KEY19.meninges,
  steps: [
    {
      to: { dura: 1 },
      run: [0.15, 0.7],
      cam: SIDE(12, 2.4),
      fit: false,
      glide: 0.06,
      dim: ['dura-materra', 'atzeko-sustraia', 'aurreko-sustraia', 'sustraitxoak'],
      names: [
        { id: 'sustraitxoak', text: 'Sustraitxoak → sustraiak', sub: 'nerbioak maila ezberdinetan', small: true },
        { id: 'dura-materra', text: 'Dura materra', sub: 'gogorrena / lodiena', from: 0.5 },
      ],
      note: 'Sustraitxoak batu eta sustraiak sortzen dira; sustraietatik nerbioak maila ezberdinetan. Parte gogorrena eta lodiena dura materra da',
    },
    {
      to: { bone: 1 },
      run: [0.05, 0.5],
      cam: FACE(11.5, 24, 28),
      fit: false,
      glide: 0.06,
      dim: ['dura-materra', 'ornoak'],
      names: [
        { id: 'meningeak', text: '3 meninge', sub: 'kanpotik barnera' },
        { id: 'dura-materra', text: 'Dura materra', sub: 'bizkarrezurrean ez dago hezurrari lotuta', from: 0.3 },
        { id: 'ornoak', small: true, from: 0.55 },
      ],
      note: '3 meninge, kanpotik barnera. Dura materra: kraneoan hezurrari lotuta, bizkarrezurrean ez; nerbio sistema zentrala babesten du',
    },
    {
      to: { arach: 1, csf: 1 },
      run: [0.05, 0.45],
      cam: FACE(9, 14, 24),
      fit: false,
      glide: 0.06,
      dim: ['araknoidesa', 'likido-zefalorrakideoa', 'eremu-azpiaraknoideoa'],
      names: [
        { id: 'araknoidesa', text: 'Araknoidea', sub: 'armiarma sarearen itxura' },
        { id: 'likido-zefalorrakideoa', text: 'Likido zefalorrakideoa', sub: 'dura materraren zakuaren barnean', from: 0.4 },
        { id: 'eremu-azpiaraknoideoa', small: true, from: 0.6 },
      ],
      note: 'Araknoidea: armiarma sarearen itxura. Dura materrak zakua eratzen du, eta likido zefalorrakideoa zakuaren barnean, meningeen artean',
    },
    {
      to: { pia: 1 },
      run: [0.05, 0.5],
      cam: FACE(7.4, 10, 26),
      fit: false,
      glide: 0.06,
      dim: ['pia-materra'],
      names: [{ id: 'pia-materra', text: 'Pia materra', sub: 'barnekoena' }],
      note: 'Pia materra: barnekoena. Apunteen arabera hezurrari lotuta dago, eta horregatik zakua askoz luzeagoa da: bizkarrezurrarekin hazten da',
      warn: true,
    },
    {
      cam: FACE(11.5, 24, 28),
      fit: false,
      glide: 0.06,
      dim: ['eremu-epidurala', 'dura-materra', 'ornoak'],
      names: [
        { id: 'eremu-epidurala', text: 'Hezurra eta dura materraren artean', sub: 'gantza, nerbioak eta odol hodiak' },
        { id: 'dura-materra', small: true, from: 0.4 },
        { id: 'ornoak', small: true, from: 0.55 },
      ],
      note: 'Ezberdintasun bakarra: burmuinean dura materra kraneoari lotuta; bizkarrezurrean ez, eta tartean gantza, nerbioak eta odol hodiak',
    },
  ],
};
export const Meninges19 = poseStage19(specMen, build);

void G19;

// ———————————————————————— topic 20 (both classes), 3.1: the sympathetic way, on the left side ————————————————————————

/** The cord at T6 with the chain beside the vertebral body, the aorta in front: the two neurons and their two ways. */
export const S_SYMP = [0, 0.16, 0.33, 0.5, 0.67, 0.84] as const;
const SYMP_CAM = (dist = 12, x = 2.0, y = -2.2, yaw = 28, elev = 22) => BLOCK19(dist, [x, y, 0.6], yaw, elev);
const specSymp: StageSpec<CordPose, CordOpts> = {
  S: S_SYMP,
  pose: { ...CP0, pia: 1, fn: 1, lat: 1 },
  opts: {},
  site: SITE19.cord,
  arrive: 'Ornomuinaren blokea T6 mailan, ezkerreko aldea: kate sinpatikoa eta aorta',
  caption: 'Ornomuinaren blokea, T6 mailan zeharka moztuta (3D eredua): ezkerreko aldean kate sinpatikoa, aurrean aorta',
  key: [
    { color: C19.symp, text: 'sinpatikoa' },
    { color: C19.white, text: 'adar zuria (mielinizatua)' },
    { color: C19.grey, text: 'adar grisa (mielinik gabe)' },
  ],
  steps: [
    {
      to: { symp: 1 },
      run: [0.15, 0.8],
      cam: SYMP_CAM(12.5),
      fit: false,
      glide: 0.08,
      dim: ['alboko-adarra', 'kate-sinpatikoa', 'gongoil-parabertebralak'],
      names: [
        { id: 'alboko-adarra', text: 'Alboko adarra', sub: 'T1–L2/L3: neurona sinpatikoen somak' },
        { id: 'kate-sinpatikoa', text: 'Kate sinpatikoa', sub: 'bizkarrezurraren bi aldeetan', from: 0.4 },
        { id: 'gongoil-parabertebralak', text: 'Gongoil parabertebralak', sub: 'katearen gongoilak', from: 0.55 },
      ],
      note: 'T1–L2/L3 mailan, alboko adarretan neurona sinpatikoak. Bizkarrezurraren bi aldeetan kate sinpatikoak, gongoilez osatuak (gandor neuraletik)',
    },
    {
      to: { pre: 1 },
      run: [0.05, 0.95],
      cam: SYMP_CAM(9.6, 2.0, -0.9, 22, 26),
      fit: false,
      glide: 0.06,
      dim: ['gongoil-aurreko-neurona', 'aurreko-sustraia', 'adar-komunikante-zuria'],
      names: [
        { id: 'gongoil-aurreko-neurona', text: 'Gongoil aurreko neurona', sub: 'aurreko sustraitik nerbio espinalera', from: 0.2 },
        { id: 'adar-komunikante-zuria', text: 'Adar komunikante zuria', sub: 'mielinizatua: katera', from: 0.6 },
      ],
      note: 'Gongoil aurreko axoia aurreko sustraitik ateratzen da, axoi motore guztiak bezala; nerbio espinaletik adar komunikante zuriaren bidez katera sartzen da',
    },
    {
      to: { post: 1 },
      run: [0.1, 0.95],
      cam: SYMP_CAM(9.8, 3.6, -1.1, 34, 24),
      fit: false,
      glide: 0.06,
      dim: ['gongoil-osteko-neurona', 'adar-komunikante-grisa', 'gongoil-parabertebralak'],
      names: [
        { id: 'gongoil-parabertebralak', text: '1. aukera: sinapsia katean', small: true },
        { id: 'adar-komunikante-grisa', text: 'Adar komunikante grisa', sub: 'mielinik gabe: nerbiora itzuli', from: 0.35 },
        { id: 'gongoil-osteko-neurona', p: [3.485, -1.145, 0.882], text: 'Gongoil osteko neurona', sub: 'nerbiotik bere helmugara', from: 0.6 },
      ],
      note: '1. aukera: kateko gongoilean sinapsia; gongoil osteko axoia adar komunikante grisetik (mielinik gabe) nerbio espinalera itzultzen da',
    },
    {
      to: { post: 0, splanch: 1 },
      run: [0.05, 0.95],
      cam: SYMP_CAM(12.5, 1.6, -3.0, 22, 18),
      fit: false,
      glide: 0.06,
      dim: ['gongoil-aurreko-neurona', 'nerbio-esplaknikoa', 'gongoil-prebertebralak', 'gongoil-osteko-neurona'],
      names: [
        { id: 'gongoil-aurreko-neurona', text: 'Gongoil aurreko axoia', sub: 'katetik pasa, sinaptatu gabe', small: true },
        { id: 'nerbio-esplaknikoa', p: [2.35, -2.527, 0.893], text: '2. aukera: sinaptatu gabe', sub: 'nerbio esplaknikoan', from: 0.15 },
        { id: 'gongoil-prebertebralak', text: 'Gongoil prebertebralak', sub: 'aortaren inguruko sareetan', from: 0.45 },
        { id: 'gongoil-osteko-neurona', text: 'Gongoil osteko neurona', sub: 'erraiaraino', from: 0.6 },
      ],
      note: '2. aukera: kateko gongoiletik sinaptatu gabe pasa eta nerbio esplaknikoan aortaren inguruko sareetara; han sinapsia, eta bigarren neurona erraietaraino',
    },
    {
      cam: SYMP_CAM(13, 1.8, -2.4, 18, 20),
      fit: false,
      glide: 0.05,
      dim: ['gongoil-parabertebralak', 'gongoil-prebertebralak', 'aorta'],
      names: [
        { id: 'gongoil-parabertebralak', text: 'Parabertebralak', sub: 'bizkarrezurraren aldeetan' },
        { id: 'gongoil-prebertebralak', text: 'Prebertebralak', sub: 'bizkarrezurraren aurrean, aorta inguruan', from: 0.3 },
      ],
      note: 'Kateko gongoilak parabertebralak dira (bizkarrezurraren aldeetan); aorta ingurukoak prebertebralak (aurrekaldean)',
    },
    {
      to: { post: 1 },
      run: [0.05, 0.6],
      cam: SYMP_CAM(13, 2.0, -2.4, 26, 22),
      fit: false,
      glide: 0.05,
      dim: ['gongoil-aurreko-neurona', 'gongoil-osteko-neurona', 'erraiak'],
      names: [
        { id: 'gongoil-aurreko-neurona', text: 'Toraxean: sinapsia katean', small: true },
        { id: 'erraiak', text: 'Abdomen eta pelbisean: sareetan', sub: 'gongoil aurrekoa luzeagoa', from: 0.3 },
      ],
      note: 'Toraxeko erraietarako sinapsia kateko gongoiletan; abdomen eta pelbisekoetarako sareetan. Sinapsirik katean ez bada, gongoil aurrekoa luzeagoa eta ostekoa motzagoa',
    },
  ],
};
export const Symp20 = poseStage19(specSymp, build);

// ———————————————————————— class 31 (topic 21), reshaped since for class 32: the scenes as its steps were written ————————————————————————

export const S_ROOTS31 = [0, 0.22, 0.46, 0.72] as const;
const specRoots31: StageSpec<CordPose, CordOpts> = {
  S: S_ROOTS31,
  pose: { ...CP0, roots: 0, rami: 0 },
  opts: {},
  site: SITE19.cord,
  arrive: 'Gorputzaren ornomuinera hurbildu gara, T6 mailan: zeharka moztuta',
  caption: CAP,
  key: [
    { color: C19.grey, text: 'gai grisa (somak)' },
    { color: C19.white, text: 'gai zuria (axoiak)' },
    { color: C19.nerve, text: 'sustraiak, nerbioa' },
  ],
  steps: [
    {
      cam: FACE(7, 10, 24),
      fit: false,
      glide: 0.06,
      dim: ['gai-grisa', 'gai-zuria'],
      names: [
        { id: 'gai-grisa', sub: 'barnean: somak' },
        { id: 'gai-zuria', sub: 'kanpoan: axoiak', from: 0.3 },
      ],
      note: 'Ornomuinean bi atal: barnean gai grisa (somak, gorputzak) eta kanpoan gai zuria (axoiak)',
    },
    {
      to: { roots: 1, rami: 1 },
      run: [0.05, 0.8],
      cam: SIDE(12.5, 2.4),
      fit: false,
      glide: 0.06,
      dim: ['atzeko-sustraia', 'aurreko-sustraia', 'nerbio-espinalak'],
      names: [
        { id: 'atzeko-sustraia', text: 'Atzeko sustraia', sub: 'dortsala', from: 0.3 },
        { id: 'aurreko-sustraia', text: 'Aurreko sustraia', sub: 'bentrala', from: 0.45 },
        { id: 'nerbio-espinalak', text: 'Nerbio espinala', from: 0.5 },
      ],
      note: 'Ornomuinetik bi sustrai: atzeko sustraia (dortsala) eta aurreko sustraia (bentrala)',
    },
    {
      to: { sens: 0.62 },
      run: [0.15, 0.85],
      cam: SIDE(9.5, 2.0),
      fit: false,
      glide: 0.06,
      dim: ['gongoil-errakideoak', 'neurona-sentsitiboa', 'atzeko-sustraia'],
      names: [
        { id: 'gongoil-errakideoak', text: 'Gongoila', sub: 'atzeko sustraian' },
        { id: 'neurona-sentsitiboa', text: 'Neurona sentsitiboaren soma', sub: 'bi adarkadura: kanpora eta ornomuinera', from: 0.5 },
      ],
      note: 'Atzeko sustraian gongoil bat: neurona sentsitiboaren soma beti hor dago; bi adarkadura ditu, bata ornomuinerantz eta bestea kanporantz',
    },
    {
      to: { sens: 1, tracts: 1, motor: 1 },
      run: [0.05, 0.9],
      cam: SIDE(12.5, 2.4),
      fit: false,
      glide: 0.06,
      dim: ['neurona-sentsitiboa', 'goranzko-bideak', 'beheranzko-bideak', 'motoneurona', 'muskulu-ildaskatuak'],
      names: [
        { id: 'goranzko-bideak', text: 'Gai zuritik gora', sub: 'burmuinera', from: 0.2 },
        { id: 'beheranzko-bideak', text: 'Kortexetik behera', sub: 'gai zuritik', from: 0.45 },
        { id: 'motoneurona', text: 'Neurona motorra', sub: 'aurreko sustraitik muskulura', from: 0.65 },
        { id: 'neurona-sentsitiboa', p: [4.875, -0.951, 0.967], small: true, from: 0.1 },
      ],
      note: 'Estimulua gongoilera iritsi, ornomuinera sartu eta gai grisean sinapsia; gai zuritik burmuinera, eta kortexetik behera neurona motorrera eta muskulura',
    },
  ],
};
export const Roots31 = poseStage19(specRoots31, build);

export const S_MEN31 = [0, 0.18, 0.4, 0.6, 0.8] as const;
const specMen31: StageSpec<CordPose, CordOpts> = {
  S: S_MEN31,
  pose: endPose(specRoots31).pose,
  opts: {},
  site: SITE19.cord,
  arrive: 'Ornomuin bera: orain bere estalkiak',
  caption: CAP,
  key: KEY19.meninges,
  steps: [
    {
      to: { sens: 0, tracts: 0, motor: 0, dura: 1 },
      run: [0, 0.6],
      cam: FACE(10, 18, 26),
      fit: false,
      glide: 0.06,
      dim: ['dura-materra'],
      names: [
        { id: 'meningeak', text: 'Meningeak', sub: 'hiru mintz, kanpotik barnera; 5.–8. astean', from: 0.5 },
        { id: 'dura-materra', small: true, from: 0.6 },
      ],
      note: 'Nerbio sistema zentrala babesteko hiru mintz, meningeak, 25.–35. egunetan (5.–8. astean) eratzen dira',
    },
    {
      to: { bone: 1 },
      run: [0.05, 0.5],
      cam: FACE(11.5, 24, 28),
      fit: false,
      glide: 0.06,
      dim: ['dura-materra', 'ornoak', 'eremu-epidurala'],
      names: [
        { id: 'dura-materra', text: 'Dura materra', sub: 'kanpoan, gogorrena; mesodermikoa' },
        { id: 'eremu-epidurala', text: 'Eremu epidurala', sub: 'ez dago ornoei lotuta', from: 0.4 },
        { id: 'ornoak', small: true, from: 0.55 },
      ],
      note: 'Dura materra kanpoan dago eta gogorrena da. Garunean kraneoari itsatsita, baina ez ornoei: tartean eremu epidurala (garunean ez dago)',
    },
    {
      to: { arach: 1, csf: 1, pia: 1 },
      run: [0.05, 0.6],
      cam: FACE(9, 14, 24),
      fit: false,
      glide: 0.06,
      dim: ['araknoidesa', 'eremu-azpiaraknoideoa', 'likido-zefalorrakideoa'],
      names: [
        { id: 'araknoidesa', text: 'Araknoidesa', sub: 'tartekoa; armiarma sarea' },
        { id: 'eremu-azpiaraknoideoa', text: 'Eremu azpiaraknoideoa', sub: 'pia materraren artean', from: 0.4 },
        { id: 'pia-materra', small: true, from: 0.6 },
      ],
      note: 'Araknoidesa: tarteko mintza, fina, dura materretik oso hurbil. Haren eta pia materraren artean eremu azpiaraknoideoa',
      plainNote: 'Araknoidesa: tarteko mintza, dura materretik oso hurbil. Haren eta pia materraren artean eremu azpiaraknoideoa',
    },
    {
      to: { pia: 1 },
      run: [0.05, 0.5],
      cam: FACE(7.4, 10, 26),
      fit: false,
      glide: 0.06,
      dim: ['pia-materra'],
      names: [{ id: 'pia-materra', text: 'Pia materra', sub: 'barnekoena: ehunari lotuta' }],
      note: 'Pia materra: barnekoena, fina, beti ehunari (ornomuinari) lotuta, bai garunean bai ornomuinean',
      plainNote: 'Pia materra: barnekoena, beti ehunari (ornomuinari) lotuta, bai garunean bai ornomuinean',
    },
    {
      cam: FACE(10, 18, 26),
      fit: false,
      glide: 0.06,
      dim: ['meningeak'],
      names: [
        { id: 'dura-materra', text: 'Dura materra', sub: 'mesodermoa' },
        { id: 'araknoidesa', text: 'Araknoidesa', sub: 'gandor neurala', from: 0.25 },
        { id: 'pia-materra', text: 'Pia materra', sub: 'gandor neurala', from: 0.45 },
      ],
      note: 'Jatorria: dura materra mesodermikoa; araknoidesa eta pia materra gandor neuraletik',
    },
  ],
};
export const Meninges31 = poseStage19(specMen31, build);

export const S_GREY31 = [0, 0.2, 0.4, 0.6, 0.8] as const;
const specGrey31: StageSpec<CordPose, CordOpts> = {
  S: S_GREY31,
  pose: { ...CP0, pia: 1 },
  opts: {},
  site: SITE19.cord,
  arrive: 'Burutik ornomuinera itzuli gara: bere barrura, mozketan',
  caption: CAP,
  key: KEY19.function,
  steps: [
    {
      to: { fn: 1 },
      run: [0.2, 0.8],
      cam: FACE(5.6, 6, 30),
      fit: false,
      glide: 0.08,
      dim: ['gai-grisa', 'aurreko-adarra', 'atzeko-adarra', 'hodi-ependimarioa'],
      names: [
        { id: 'aurreko-adarra', text: 'Aurreko adarrak', sub: 'neurona motorrak', from: 0.3 },
        { id: 'atzeko-adarra', text: 'Atzeko adarrak', sub: 'neurona sentsitiboak', from: 0.45 },
        { id: 'hodi-ependimarioa', text: 'Ependimoa', sub: 'erdian', small: true, from: 0.6 },
      ],
      note: 'Gai grisa erdian, ependimoaren inguruan: neuronen somak. H forma: aurreko adarretan neurona motorrak, atzekoetan sentsitiboak',
    },
    {
      to: { lat: 1 },
      run: [0.1, 0.5],
      cam: FACE(5.2, 8, 30),
      fit: false,
      glide: 0.05,
      dim: ['alboko-adarra'],
      names: [{ id: 'alboko-adarra', text: 'Alboko adarra', sub: 'T1–T12 (L2): sinpatikoak' }],
      note: 'T1etik T12ra (L2ra) alboko adarrak: neurona sinpatikoen somak, maila honetan bakarrik',
      warn: true,
    },
    {
      to: { tracts: 1 },
      run: [0.1, 0.6],
      cam: FACE(5.6, 6, 30),
      fit: false,
      glide: 0.05,
      dim: ['gai-zuria', 'goranzko-bideak', 'beheranzko-bideak'],
      names: [
        { id: 'gai-zuria', sub: 'axoiak, mielinizatuta' },
        { id: 'goranzko-bideak', text: 'Goranzko bideak', sub: 'sentsitiboak', from: 0.3 },
        { id: 'beheranzko-bideak', text: 'Beheranzko bideak', sub: 'motorrak', from: 0.45 },
      ],
      note: 'Kanpoan gai zuria: axoiak, mielinak ematen dio kolorea. Bertan goranzko (sentsitiboak) eta beheranzko (motorrak) bideak',
    },
    {
      to: { sens: 0.75 },
      run: [0.05, 0.9],
      cam: SIDE(12, 2.6),
      fit: false,
      glide: 0.08,
      dim: ['larruazala', 'neurona-sentsitiboa', 'gongoil-errakideoak'],
      names: [
        { id: 'larruazala', text: 'Larruazala', sub: 'sentsibilitate orokorra' },
        { id: 'neurona-sentsitiboa', text: 'Luzapen zentrifugoa eta zentripetoa', sub: 'soma gongoilean', from: 0.5 },
        { id: 'gongoil-errakideoak', small: true, from: 0.6 },
      ],
      note: 'Larruazaletik hartutako sentsazioa axoi batetik gongoileraino: hor somak. Bi luzapen: zentrifugoa periferiara, zentripetoa ornomuinera',
    },
    {
      to: { sens: 1 },
      run: [0.05, 0.6],
      cam: SIDE(12, 2.6),
      fit: false,
      glide: 0.05,
      dim: ['neurona-sentsitiboa', 'ornomuina'],
      names: [{ id: 'neurona-sentsitiboa', p: [4.875, -0.951, 0.967], text: 'Beti periferiatik ornomuinera', sub: 'gero: burmuinera edo erreflexua' }],
      note: 'Sentsazioa beti periferiatik ornomuinera doa: gero burmuineraino (borondatezko agindua) edo erreflexu bat',
    },
  ],
};
export const Grey31 = poseStage19(specGrey31, build);

export const S_REFLEX31 = [0, 0.16, 0.34, 0.52, 0.7, 0.86] as const;
const specReflex31: StageSpec<CordPose, CordOpts> = {
  S: S_REFLEX31,
  pose: { ...CP0, pia: 1, fn: 1, ends: 1 },
  opts: {},
  site: SITE19.cord,
  arrive: 'Ornomuinera itzuli gara: erantzuna bertan, burmuinera iritsi gabe',
  caption: CAP,
  key: KEY19.function,
  steps: [
    {
      cam: SIDE(13, 2.8),
      fit: false,
      glide: 0.08,
      dim: ['ornomuina', 'larruazala', 'muskulu-ildaskatuak'],
      names: [
        { id: 'larruazala', text: 'Estimulua', sub: 'larruazalean' },
        { id: 'muskulu-ildaskatuak', text: 'Muskulua', sub: 'erantzuna', from: 0.3 },
      ],
      note: 'Aktu erreflexuan erantzuna ornomuinean bertan ematen da: estimulua ez da burmuineraino garraiatzen',
    },
    {
      to: { sens: 1 },
      run: [0.05, 0.9],
      cam: SIDE(12, 2.6),
      fit: false,
      glide: 0.05,
      dim: ['neurona-sentsitiboa', 'larruazala', 'gongoil-errakideoak'],
      names: [{ id: 'neurona-sentsitiboa', p: [4.881, -0.955, 0.967], text: 'Neurona sentsitiboa', sub: 'estimulua ornomuinera', from: 0.4 }],
      note: 'Larruazaleko nerbioek estimulua sentitzen dute (ukimena) eta neurona sentsitiboek ornomuinera eramaten dute',
    },
    {
      to: { inter: 1 },
      run: [0.1, 0.7],
      cam: FACE(5.4, 8, 30),
      fit: false,
      glide: 0.06,
      dim: ['interneurona', 'atzeko-adarra', 'aurreko-adarra'],
      names: [
        { id: 'interneurona', text: 'Sentsitiboa → motorra', sub: 'ornomuinean bertan', from: 0.3 },
        { id: 'atzeko-adarra', small: true, from: 0.5 },
        { id: 'aurreko-adarra', small: true, from: 0.6 },
      ],
      note: 'Sistema sentsitiboak informazioa sistema motorrari pasatzen dio, ornomuinean bertan',
    },
    {
      to: { motor: 1 },
      run: [0.05, 0.9],
      cam: SIDE(12.5, 2.8),
      fit: false,
      glide: 0.06,
      dim: ['motoneurona', 'muskulu-ildaskatuak', 'aurreko-sustraia'],
      names: [
        { id: 'motoneurona', text: 'Neurona motorra', sub: 'aurreko sustraitik' },
        { id: 'muskulu-ildaskatuak', text: 'Muskulua', sub: 'hanka mugitu', from: 0.6 },
      ],
      note: 'Neurona motorrak agindua muskulura bidaltzen du: adibidez, hanka mugitzeko (mailuarekin belauna kolpatzean)',
    },
    {
      cam: SIDE(9.5, 2.0),
      fit: false,
      glide: 0.06,
      dim: ['gongoil-errakideoak', 'neurona-sentsitiboa'],
      names: [{ id: 'gongoil-errakideoak', text: 'Soma gongoilean', sub: 'gandor neuraleko eratorria' }],
      note: 'Neurona sentsitibo primarioaren soma gongoilean dago (gandor neuraleko eratorria) eta beste luzapen bat du ornomuinerantz',
    },
    {
      to: { dura: 1, arach: 1 },
      run: [0.3, 0.8],
      cam: SIDE(12, 2.4),
      fit: false,
      glide: 0.06,
      dim: ['atzeko-sustraia', 'aurreko-sustraia', 'nerbio-espinalak'],
      names: [
        { id: 'atzeko-sustraia', text: 'Atzeko sustraia', sub: 'sentsazioak sartu' },
        { id: 'aurreko-sustraia', text: 'Aurreko sustraia', sub: 'agindu motorra atera', from: 0.2 },
        { id: 'nerbio-espinalak', text: 'Nerbio mistoa', sub: 'axoiak batu, fusionatu gabe', from: 0.4 },
      ],
      note: 'Sentsazioak atzeko sustraitik, agindua aurrekotik; nerbio espinalean axoiak batzen dira, fusionatu gabe: nerbio mistoa',
    },
  ],
};
export const Reflex31 = poseStage19(specReflex31, build);
