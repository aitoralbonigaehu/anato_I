'use client';

import { BLOCK19, endPose, poseStage19, type StageSpec } from './common';
import { SITE19B } from './sites-b';
import { STEM0, stemModel, type StemOpts, type StemPose } from './stem-model';
import { C19 } from './tones';

/**
 * Topic 19 (the notes of 2026-11-23), section 10: the brain's parts from the caudal end, on the brainstem cut across
 * (stem-model.ts): the medulla (10.1), the metencephalon as it develops (10.2: the 4th ventricle, the pons, the
 * cerebellum) and the midbrain (10.3: the aqueduct, the peduncles, the substantia nigra). Each block is tied to its
 * level of the halved head, so the flight from the brain lands on the part being described. Dorsal up, the cranial
 * cut face towards us.
 */

const build = (pose: StemPose, opts: StemOpts) => stemModel(pose, opts);
const FACE = (dist = 6, yaw = 14, elev = 24, y = 0) => BLOCK19(dist, [0, y, 0.6], yaw, elev);

// ———————————————————————— 10.1 Mielentzefaloa: erraboila ————————————————————————

export const S_MED = [0, 0.2, 0.4, 0.6, 0.8] as const;
const specMed: StageSpec<StemPose, StemOpts> = {
  S: S_MED,
  pose: { ...STEM0 },
  opts: { kind: 'med' },
  site: SITE19B.medulla,
  arrive: 'Garunaren mutur kaudalera: erraboila zeharka moztuta',
  caption: 'Erraboila zeharka moztuta (3D eredua): goian dortsala, mozketa (kraneala) zuregana',
  key: [
    { color: C19.grey, text: 'gai grisa' },
    { color: C19.white, text: 'gai zuria (axoiak)' },
    { color: C19.motor, text: 'motorra (beheranzkoa)' },
    { color: C19.sens, text: 'sentsitiboa (goranzkoa)' },
  ],
  steps: [
    {
      cam: FACE(6.4, 18, 26),
      fit: false,
      glide: 0.08,
      dim: ['erraboila'],
      names: [
        { id: 'erraboila', text: 'Erraboila', sub: 'mielentzefalotik: lehenengo egitura' },
        { id: 'gai-grisa', text: 'Gai grisa', small: true, from: 0.5 },
      ],
      note: 'Burmuinaren atalak, mutur kaudaletik zefalikora: lehenengoa erraboila, mielentzefaloaren eratorria',
    },
    {
      to: { cord: 1 },
      run: [0.1, 0.7],
      cam: BLOCK19(9.2, [0, -0.1, -0.4], 52, 18),
      fit: false,
      glide: 0.06,
      dim: ['erraboila', 'ornomuina'],
      names: [
        { id: 'erraboila', text: 'Erraboila', sub: 'ornomuinaren antzekoa, lodiagoa eta zabalagoa' },
        { id: 'ornomuina', text: 'Ornomuina', sub: 'behean jarraitzen du', from: 0.35 },
      ],
      note: 'Burmuina eta ornomuina lotzen ditu: egitura ornomuinaren antzekoa, apur bat lodiagoa eta zabalagoa',
    },
    {
      cam: FACE(4.2, 10, 30, 0.05),
      fit: false,
      glide: 0.05,
      dim: ['hodi-ependimarioa'],
      names: [{ id: 'hodi-ependimarioa', text: 'Hodi ependimarioa (zentrala)', sub: 'ornomuinaren izen bera' }],
      note: 'Erraboilaren mailan hodi ependimarioa edo hodi zentrala agertzen da, ornomuinaren izen bera mantenduz',
    },
    {
      to: { pyr: 1, flowShow: 1, flow: 7 },
      run: [0.05, 1],
      cam: FACE(5.6, 22, 12, -0.3),
      fit: false,
      glide: 0.06,
      dim: ['piramideak'],
      names: [{ id: 'piramideak', text: 'Piramideak', sub: 'bentralean: axoi motorrak beherantz', from: 0.2 }],
      note: 'Alde bentralean piramideak: burmuinetik ornomuinera jaisten diren axoi motorrez osatuak',
    },
    {
      to: { dors: 1, fib: 1, flow: 14 },
      run: [0.05, 1],
      cam: FACE(6.2, 26, 34, 0.2),
      fit: false,
      glide: 0.06,
      dim: ['goranzko-bideak', 'piramideak'],
      names: [
        { id: 'goranzko-bideak', text: 'Goranzko bideak', sub: 'dortsalean: sentsitiboak', from: 0.15 },
        { id: 'piramideak', text: 'Zuntza = axoia', sub: 'nerbio sistemako terminoa', small: true, from: 0.5 },
      ],
      note: 'Alde dortsalean goranzko bideak, sentsitiboak, axoiez eratuak. Gogoratu: zuntza = axoia (nerbio sisteman)',
    },
  ],
};
export const Medulla19 = poseStage19(specMed, build);

// ———————————————————————— 10.2 Metentzefaloa: IV. bentrikulua, zubia, zerebeloa ————————————————————————

export const S_MET = [0, 0.13, 0.28, 0.43, 0.58, 0.72, 0.86] as const;
const specMet: StageSpec<StemPose, StemOpts> = {
  S: S_MET,
  pose: { ...STEM0 },
  opts: { kind: 'met' },
  site: SITE19B.hind,
  arrive: 'Erraboilatik gora, metentzefaloaren mailara: hasieran hodi bat',
  caption: 'Metentzefaloa garatzen, zeharka moztuta (3D eredua): goian dortsala, mozketa (kraneala) zuregana',
  key: [
    { color: C19.sens, text: 'hegal plaka (sentsitiboa)' },
    { color: C19.motor, text: 'oinalde plaka (motorra)' },
    { color: C19.met, text: 'garuntxoa' },
    { color: C19.csf, text: 'IV. bentrikulua' },
  ],
  steps: [
    {
      cam: FACE(6.2, 14, 26),
      fit: false,
      glide: 0.08,
      dim: ['sabai-plaka', 'zoru-plaka'],
      names: [
        { id: 'sabai-plaka', text: 'Sabai plaka', sub: 'fina: axoiak bakarrik' },
        { id: 'zoru-plaka', text: 'Zoru plaka', sub: 'fina: axoiak bakarrik', from: 0.3 },
      ],
      note: 'Garapenean sabai plaka eta zoru plaka bi plaka fin dira: hasieran axoiak bakarrik pasatzen dira bertatik',
    },
    {
      to: { open: 1 },
      run: [0.05, 0.85],
      cam: FACE(7.4, 12, 34, 0.1),
      fit: false,
      glide: 0.06,
      dim: ['sabai-plaka', 'laugarren-bentrikulua'],
      names: [
        { id: 'sabai-plaka', text: 'Sabai plaka zabaldu', sub: 'hodia goitik irekitzen da' },
        { id: 'laugarren-bentrikulua', text: 'IV. bentrikulua', sub: 'zabalgunea', from: 0.6 },
      ],
      note: 'Sabai plaka zabaldu egiten da eta hodi ependimarioa goitik irekitzen da: zabalgune bat sortzen da, IV. bentrikulua',
    },
    {
      to: { fn: 1 },
      run: [0.05, 0.6],
      cam: FACE(7.2, 8, 30, -0.1),
      fit: false,
      glide: 0.05,
      dim: ['hegal-plaka', 'oinalde-plaka', 'ildo-mugatzailea'],
      names: [
        { id: 'hegal-plaka', text: 'Eremu sentikorrak', sub: 'dortsalean eta alboetan' },
        { id: 'oinalde-plaka', text: 'Eremu motorra', sub: 'bentralean eta erdian', from: 0.3 },
        { id: 'ildo-mugatzailea', text: 'Ildo mugatzailea', small: true, from: 0.55 },
      ],
      note: 'Hegal plakako egitura sentikorrak alboratzen dira; motorrak bentralean eta erdian geratzen dira',
    },
    {
      to: { pons: 1, flowShow: 1, flow: 8 },
      run: [0.05, 1],
      cam: FACE(7.6, 18, 14, -0.5),
      fit: false,
      glide: 0.06,
      dim: ['zubia', 'laugarren-bentrikulua'],
      names: [
        { id: 'zubia', text: 'Zubia', sub: 'IV. bentrikuluaren zoruan: egitura trinkoa', from: 0.25 },
        { id: 'laugarren-bentrikulua', small: true, from: 0.5 },
      ],
      note: 'IV. bentrikuluaren zoruan egitura trinko bat eratzen da, zubia: lodia, axoi sentsitibo eta motorrez osatua',
    },
    {
      to: { lips: 1, flowShow: 0 },
      run: [0.05, 0.8],
      cam: FACE(7.4, 20, 36, 0.2),
      fit: false,
      glide: 0.06,
      dim: ['ezpain-erronboideak', 'hegal-plaka'],
      names: [
        { id: 'ezpain-erronboideak', text: 'Ezpain erronboideak', sub: 'hegal plaken eremu dortsala loditu', from: 0.3 },
        { id: 'hegal-plaka', small: true, from: 0.55 },
      ],
      note: 'IV. bentrikuluaren sabaian zerebeloa eratzen da: hegal plaken eremu dortsala loditu eta ezpain erronboideak agertzen dira',
    },
    {
      to: { fuse: 1 },
      run: [0.05, 0.85],
      cam: FACE(7.0, 24, 44, 0.3),
      fit: false,
      glide: 0.06,
      dim: ['garuntxoa', 'ezpain-erronboideak'],
      names: [
        { id: 'ezpain-erronboideak', small: true, from: 0.1 },
        { id: 'garuntxoa', text: 'Erdian fusionatu', sub: 'zerebelo hasikina', from: 0.55 },
      ],
      note: 'Ezpain erronboideak erdiko lerrora hurbildu eta fusionatzen dira: zerebelo hasikina. Bitartean, zubi tolespena agertzen da',
    },
    {
      to: { cover: 1 },
      run: [0.1, 0.9],
      cam: BLOCK19(8.6, [0, 0.4, 0], 4, 72),
      fit: false,
      glide: 0.07,
      dim: ['garuntxoa', 'laugarren-bentrikulua'],
      names: [
        { id: 'garuntxoa', text: 'Zerebeloa', sub: 'IV. bentrikulu osoa estaltzeko hazten da' },
        { id: 'laugarren-bentrikulua', text: 'IV. bentrikulua', small: true, from: 0.4 },
      ],
      note: 'Hegal plakak aurreko aldean (kranealean) bakarrik garatzen dira; fusionatu ondoren zerebeloak IV. bentrikulu osoa estaltzeko hazten jarraitzen du. Ikuspegi dortsala',
    },
  ],
};
export const Hind19 = poseStage19(specMet, build);

// ———————————————————————— 10.3 Mesentzefaloa ————————————————————————

export const S_MES = [0, 0.14, 0.28, 0.42, 0.56, 0.7, 0.84] as const;
const specMes: StageSpec<StemPose, StemOpts> = {
  S: S_MES,
  pose: { ...STEM0 },
  opts: { kind: 'mes' },
  site: SITE19B.midbrain,
  arrive: 'Metentzefaloaren gainetik: mesentzefaloa zeharka moztuta',
  caption: 'Mesentzefaloa zeharka moztuta (3D eredua): goian dortsala, mozketa (kraneala) zuregana',
  key: [
    { color: C19.sens, text: 'sentsitiboa (dortsala)' },
    { color: C19.motor, text: 'motorra (bentrala)' },
    { color: '#2a2124', text: 'gai beltza' },
    { color: '#e6c84a', text: 'dopamina' },
  ],
  steps: [
    {
      to: { mat: 1 },
      run: [0.35, 0.95],
      cam: FACE(6.2, 14, 26),
      fit: false,
      glide: 0.08,
      dim: ['mesentzefaloa', 'garun-akueduktoa'],
      names: [
        { id: 'mesentzefaloa', text: '6. astea: hodi forma', sub: 'ornomuin baten antzekoa' },
        { id: 'garun-akueduktoa', p: [0.09, 0.052, 1.108], text: '16. astea: zuloa estutu', sub: 'gorputza loditu', from: 0.6 },
      ],
      note: '6. astean hodi forma du, ornomuin baten antzekoa; 16. asterako gorputza loditu eta erdiko zuloa askoz estuagoa bihurtzen da',
    },
    {
      to: { mat: 2, fn: 1, flowShow: 1, flow: 8 },
      run: [0.05, 1],
      cam: FACE(6.8, 18, 18, -0.2),
      fit: false,
      glide: 0.06,
      dim: ['eremu-sentsitiboa', 'eremu-motorra', 'garun-pedunkuluak'],
      names: [
        { id: 'eremu-sentsitiboa', text: 'Sentikorrak', sub: '16. astea: dortsalean' },
        { id: 'eremu-motorra', text: 'Motorrak', sub: 'bentralean', from: 0.25 },
        { id: 'garun-pedunkuluak', text: 'Garun pedunkuluak', sub: 'axoi guztiak gora eta behera', from: 0.5 },
      ],
      note: '16. astean dortsalean egitura sentikorrak, bentralean motorrak; mutur bentralean bi lodigune, garun pedunkuluak: gora eta behera doazen axoi guztiak',
    },
    {
      cam: FACE(4.2, 10, 30, 0.1),
      fit: false,
      glide: 0.05,
      dim: ['garun-akueduktoa'],
      names: [{ id: 'garun-akueduktoa', text: 'Akueduktoa', sub: 'III. eta IV. bentrikuluak elkartzen ditu' }],
      note: 'Estutzen den hodia akueduktoa bihurtzen da: III. eta IV. bentrikuluak elkartzen ditu',
    },
    {
      to: { coll: 1 },
      run: [0.05, 0.6],
      cam: FACE(5.4, 24, 52, 0.2),
      fit: false,
      glide: 0.05,
      dim: ['kolikuluak', 'beheko-kolikuluak', 'goiko-kolikuluak'],
      names: [
        { id: 'goiko-kolikuluak', text: 'Goiko kolikuluak', sub: 'kranealenak: ikusmena', from: 0.3 },
        { id: 'beheko-kolikuluak', text: 'Beheko kolikuluak', sub: 'kaudalenak: entzumena', from: 0.45 },
      ],
      note: 'Alde dortsalean 4 goragune, bi bikote: beheko kolikuluak (entzumena) eta goiko kolikuluak (ikusmena); erreflexu motorrak, burua jiratu',
    },
    {
      to: { nigra: 1, flowShow: 0 },
      run: [0.05, 0.6],
      cam: FACE(5.0, 22, 16, -0.4),
      fit: false,
      glide: 0.05,
      dim: ['gai-beltza'],
      names: [{ id: 'gai-beltza', text: 'Gai beltza', sub: 'zelulek pigmentu beltza dute', from: 0.3 }],
      note: 'Beste egitura garrantzitsu bat: gai beltza. Ez dago tindatuta: bere zelulek pigmentu beltza dute',
      warn: true,
    },
    {
      to: { dopa: 1, flow: 18 },
      run: [0.05, 1],
      cam: BLOCK19(8.4, [-0.5, 0.1, 1.2], 42, 22),
      fit: false,
      glide: 0.06,
      dim: ['gai-beltza', 'oinaldeko-nukleoak'],
      names: [
        { id: 'gai-beltza', text: 'Zelula dopaminergikoak', sub: 'dopamina ekoizten dute' },
        { id: 'oinaldeko-nukleoak', text: 'Oinaldeko nukleoak', sub: 'telentzefaloan: hara dopamina', from: 0.45 },
      ],
      note: 'Zelula dopaminergikoek axoiak telentzefalora proiektatzen dituzte, batez ere oinaldeko nukleoetara: dopamina bidaltzen dute',
    },
    {
      to: { pd: 1, flow: 22 },
      run: [0.1, 0.8],
      cam: BLOCK19(8.0, [-0.4, 0, 1.0], 36, 22),
      fit: false,
      glide: 0.05,
      dim: ['gai-beltza', 'oinaldeko-nukleoak'],
      names: [
        { id: 'gai-beltza', text: 'Parkinson', sub: 'neurona dopaminergikoak hil' },
        { id: 'oinaldeko-nukleoak', text: 'Dopaminarik ez', sub: 'mugimendu automatikoak', from: 0.45 },
      ],
      note: 'Parkinsonean neurona dopaminergikoak hiltzen dira: dopamina ez da oinaldeko nukleoetara heltzen, eta borondatezkoak ez diren mugimendu automatikoak agertzen dira',
    },
  ],
};
export const Midbrain19 = poseStage19(specMes, build);

// ———————————————————————— class 31 (topic 22): the pons and the cerebellum as two stages ————————————————————————

/** Class 31's notes take the pons (2.1.2) and the cerebellum (2.2) apart: the metencephalon's steps, split in two. */
const PONS_STEPS = specMet.steps.slice(0, 4);
export const S_PONS31 = [0, 0.24, 0.48, 0.72] as const;
const specPons31: StageSpec<StemPose, StemOpts> = { ...specMet, S: S_PONS31, steps: PONS_STEPS };
export const Pons31 = poseStage19(specPons31, build);

export const S_CBL31 = [0, 0.32, 0.64] as const;
const specCbl31: StageSpec<StemPose, StemOpts> = {
  ...specMet,
  S: S_CBL31,
  pose: endPose(specPons31).pose,
  arrive: 'Metentzefalo berean: IV. bentrikuluaren sabaia',
  steps: specMet.steps.slice(4),
};
export const Cbl31 = poseStage19(specCbl31, build);
