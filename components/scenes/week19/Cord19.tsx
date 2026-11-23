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
