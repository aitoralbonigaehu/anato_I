'use client';

import { ARCH, SIDE, KEY_ARCH, endPose, poseStage17, type StageSpec } from './common';
import { BONES0, bonesModel, type BonesOpts, type BonesPose } from './bones-model';

/**
 * Topic 17, the arches' cartilages and bones (bones-model.ts): the notes' figure of p.4 right, turned into one model
 * whose bars degenerate and whose parts go to their adult places. Each stage ends on the adult arrangement; the next
 * one starts again from the embryo's layout with everything earlier kept.
 */

const build = (pose: BonesPose, opts: BonesOpts) => bonesModel(pose, opts);
const CAP = 'Arkuen kartilagoak ezkerretik, burua erdiko planoan ebakita: aurpegia zure ezkerrean';
const KEY = KEY_ARCH;

// ———————————————————————————— Lehen arkua: kartilagoak eta hezurrak ————————————————————————————

export const SB1 = [0, 0.13, 0.27, 0.42, 0.58, 0.72, 0.87] as const;

const spec1: StageSpec<BonesPose, BonesOpts> = {
  S: SB1,
  pose: BONES0,
  opts: {},
  caption: CAP,
  key: KEY,
  map: 'arch1',
  steps: [
    {
      cam: SIDE(11.5, [0.5, 2.1, 0.7], 80, 4),
      glide: 0.06,
      dim: ['meckel-kartilagoa'],
      names: [{ id: 'meckel-kartilagoa', sub: 'barail luzapenaren kartilagoa: gida' }],
      note: 'Barail luzapenaren kartilagoa Meckel kartilagoa da: hasieran gida funtzioa dauka',
    },
    {
      to: { bone: 1 },
      run: [0.08, 0.85],
      cam: SIDE(10.5, [0.5, 2.0, 1.2], 72, 8),
      glide: 0.05,
      dim: ['meckel-kartilagoa', 'baraila'],
      names: [
        { id: 'baraila', sub: 'kartilagoaren inguruan hazten', from: 0.3 },
        { id: 'meckel-kartilagoa', small: true },
      ],
      note: 'Barail hezurra Meckel kartilagoaren inguruan eratzen da, kokotsetik atzera',
    },
    {
      to: { deg: 1 },
      run: [0.06, 0.8],
      cam: SIDE(10.5, [0.5, 2.0, 0.9], 84, 4),
      glide: 0.05,
      dim: ['meckel-kartilagoa', 'baraila'],
      names: [
        { id: 'meckel-kartilagoa', sub: 'endekatzen' },
        { id: 'baraila', sub: 'bera geratzen da', from: 0.55 },
      ],
      note: 'KONTUZ: Meckel endekatu egiten da, gida da. Baraila ez da kartilago hori hezurtuta: «bertatik» = haren inguruan',
      warn: true,
    },
    {
      to: { adult: 1 },
      run: [0.06, 0.85],
      cam: SIDE(13.5, [0.5, 1.8, 0.4], 80, 4),
      glide: 0.05,
      dim: ['baraila', 'mailua', 'ingudea'],
      names: [{ id: 'baraila', sub: 'bere lekura' }],
      note: 'Baraila aurrera eta behera doa bere lekura; koloreak ez du aldatzen: laranja = I. arkua',
    },
    {
      to: { maxBones: 1 },
      run: [0.06, 0.75],
      cam: SIDE(12, [0.5, 2.8, 0.6], 74, 6),
      glide: 0.05,
      dim: ['hezur-maxilarra', 'zigomatikoa', 'tenporalaren-ezkata'],
      names: [
        { id: 'hezur-maxilarra', from: 0.2 },
        { id: 'zigomatikoa', from: 0.4 },
        { id: 'tenporalaren-ezkata', sub: 'harkaitz zatia ez: oinaldeko mesenkimatik', from: 0.6 },
      ],
      note: 'Luzapen maxilarretik: hezur maxilarra, zigomatikoa eta tenporalaren ezkata (harkaitz zatia oinaldeko mesenkimatik)',
    },
    {
      cam: SIDE(6.5, [0.6, 3.2, -1.7], 72, 8),
      glide: 0.05,
      dim: ['mailua', 'ingudea'],
      names: [
        { id: 'mailua', sub: 'I. arkua' },
        { id: 'ingudea', sub: 'I. arkua', from: 0.35 },
      ],
      note: 'Luzapen maxilarraren goiko muturrean tarteko belarriaren bi hezurtxo: mailua eta ingudea',
    },
    {
      cam: SIDE(5.5, [0.6, 3.25, -1.95], 58, 10),
      glide: 0.05,
      dim: ['ingudea'],
      names: [{ id: 'ingudea', sub: 'gorputza + adar txikia: I · adar luzea: II?' }],
      note: 'KONTUZ: beste liburu batzuetan ingudearen gorputza eta adar txikia I. arkutik, adar luzea II.etik. Apunteek: ingudea I. arkutik',
      warn: true,
    },
  ],
};
export const FirstArchBones17 = poseStage17(spec1, build);

// ———————————————————————————— Bigarren arkua ————————————————————————————

export const SB2 = [0, 0.16, 0.32, 0.47, 0.64, 0.82] as const;

const start2: BonesPose = { ...endPose(spec1).pose, adult: 0 };

const spec2: StageSpec<BonesPose, BonesOpts> = {
  S: SB2,
  pose: start2,
  opts: {},
  caption: CAP,
  key: KEY,
  map: 'arch2',
  steps: [
    {
      to: { n7: 1 },
      run: [0.06, 0.8],
      cam: SIDE(11.5, [0.6, 2.4, -0.6], 78, 4),
      glide: 0.06,
      dim: ['aurpegi-nerbioa', 'reichert-kartilagoa'],
      names: [{ id: 'aurpegi-nerbioa', text: 'Aurpegi-nerbioa / nerbio faziala (VII)', sub: 'muskulu mimiko guztiak · mistoa', from: 0.25 }],
      note: 'KONTUZ: VII.a berez mistoa da eta apunteek alde sentsitiboa aipatzen dute, baina hemen bere lana motorra da: aurpegiko muskulu mimikoak',
      warn: true,
    },
    {
      cam: SIDE(11, [0.5, 1.6, -1.0], 84, 4),
      glide: 0.05,
      dim: ['reichert-kartilagoa'],
      names: [{ id: 'reichert-kartilagoa', sub: 'II. arkua' }],
      note: 'Bigarren arkuak ere kartilago bat dauka hasieran: Reichert kartilagoa',
    },
    {
      to: { rdeg: 1, h2: 1 },
      run: [0.06, 0.82],
      cam: SIDE(11, [0.5, 1.5, -0.8], 76, 6),
      glide: 0.05,
      dim: ['reichert-kartilagoa', 'ointokia', 'estiloide-apofisia', 'hioide-adar-txikia', 'hioide-gorputz-goia', 'lotailu-estilohioideoa'],
      names: [
        { id: 'reichert-kartilagoa', sub: 'endekatzen' },
        { id: 'ointokia', small: true, from: 0.5 },
        { id: 'lotailu-estilohioideoa', small: true, from: 0.75 },
      ],
      note: 'Endekatu egiten da, eta azkenean muturretan bakarrik eratzen dira hezurrak',
    },
    {
      cam: SIDE(6, [0.6, 3.1, -2.15], 66, 8),
      glide: 0.05,
      dim: ['ointokia', 'mailua', 'ingudea'],
      names: [
        { id: 'ointokia', sub: 'goiko muturra · II. arkua' },
        { id: 'ingudea', small: true },
        { id: 'mailua', small: true },
      ],
      note: 'Goiko muturrean: tarteko belarriaren hirugarren hezurtxoa, ointokia (urdina, beste biak laranjak)',
    },
    {
      cam: SIDE(9.5, [0.6, 1.1, -0.7], 66, 6),
      glide: 0.05,
      dim: ['estiloide-apofisia', 'hioide-adar-txikia', 'hioide-gorputz-goia'],
      names: [
        { id: 'estiloide-apofisia', text: 'Tenporalaren estiloide apofisia', sub: 'muskulu asko hemen txertatzen dira' },
        { id: 'hioide-adar-txikia', text: 'Hioidearen adar txikia', from: 0.3 },
        { id: 'hioide-gorputz-goia', text: 'Hioide-gorputzaren goiko erdia', sub: 'beheko erdia: III. arkua', from: 0.55 },
      ],
      note: 'Beheko muturrean: estiloide apofisia, hioide hezurraren adar txikia eta gorputzaren goiko erdia',
    },
    {
      to: { adult: 1, petrous: 1 },
      run: [0.06, 0.8],
      cam: SIDE(11.5, [0.5, 2.0, -1.2], 72, 6),
      glide: 0.05,
      dim: ['estiloide-apofisia', 'arkaitza', 'tenporalaren-ezkata', 'ointokia'],
      names: [
        { id: 'tenporalaren-ezkata', sub: 'atal mehea' },
        { id: 'arkaitza', sub: 'atal lodia: tarteko eta barneko belarria', from: 0.3 },
        { id: 'estiloide-apofisia', sub: 'lotailuak barailerantz eta faringerantz', from: 0.55 },
      ],
      note: 'Estiloide apofisitik lotailuak barailerantz eta faringerantz. Tenporalak ezkata (mehea) eta arkaitza (lodia, belarriak barruan) ditu',
    },
  ],
};
export const SecondArch17 = poseStage17(spec2, build);

// ———————————————————————————— Hirugarren arkua ————————————————————————————

export const SB3 = [0, 0.18, 0.4, 0.58, 0.8] as const;

const start3: BonesPose = { ...endPose(spec2).pose, adult: 0 };

const spec3: StageSpec<BonesPose, BonesOpts> = {
  S: SB3,
  pose: start3,
  opts: {},
  caption: CAP,
  key: KEY,
  map: 'arch3',
  steps: [
    {
      to: { n9: 1 },
      run: [0.06, 0.8],
      cam: SIDE(11, [0.6, 1.9, -1.0], 78, 4),
      glide: 0.06,
      dim: ['glosofaringeoa'],
      names: [{ id: 'glosofaringeoa', text: 'Nerbio glosofaringeoa (IX)', sub: 'mistoa · mihia eta faringea', from: 0.25 }],
      note: 'III. arkuaren nerbioa IX.a da, glosofaringeoa (gloso = mihia): luzatu egiten da mihira eta faringeko muskuluetara',
    },
    {
      to: { h3: 1 },
      run: [0.1, 0.8],
      cam: SIDE(7, [0.6, 0.35, 0.3], 70, 8),
      glide: 0.05,
      dim: ['hioide-gorputz-behea', 'hioide-adar-nagusia', 'hioide-gorputz-goia', 'hioide-adar-txikia'],
      names: [
        { id: 'hioide-gorputz-behea', text: 'Hioide-gorputzaren beheko erdia', sub: 'III. arkua', from: 0.2 },
        { id: 'hioide-adar-nagusia', text: 'Hioidearen adar nagusia', sub: 'III. arkua', from: 0.4 },
        { id: 'hioide-gorputz-goia', text: 'Goiko erdia', sub: 'II. arkua', small: true, from: 0.6 },
        { id: 'hioide-adar-txikia', text: 'Adar txikia', sub: 'II. arkua', small: true, from: 0.7 },
      ],
      note: 'Ez dago aurreko bi arkuen bezalako kartilagorik; hala ere, hioidearen gorputzaren beheko erdia eta adar nagusiak hemendik',
    },
    {
      to: { stylo: 1 },
      run: [0.08, 0.8],
      cam: SIDE(9, [0.6, 1.1, -1.5], 66, 6),
      glide: 0.05,
      dim: ['muskulu-estilofaringeoa', 'estiloide-apofisia'],
      names: [
        { id: 'muskulu-estilofaringeoa', text: 'Muskulu estilofaringeoa', sub: 'faringea igo eta zabaldu · IX', from: 0.25 },
        { id: 'estiloide-apofisia', small: true },
      ],
      note: 'Muskulu estilofaringeoa estiloide apofisitik faringera doa: faringea igo eta zabaldu',
    },
    {
      to: { constr: 1 },
      run: [0.08, 0.8],
      cam: SIDE(9, [0.6, 1.1, -1.5], 52, 8),
      glide: 0.05,
      dim: ['goiko-muskulu-ertzatzaileak', 'muskulu-estilofaringeoa'],
      names: [{ id: 'goiko-muskulu-ertzatzaileak', text: 'Faringearen goiko muskulu ertzatzaileak', sub: 'faringea estutu · IX', from: 0.25 }],
      note: 'I. eta II. arkuetakoak azalekoak; III., IV. eta VI.etakoak sakonak. Goiko ertzatzaileak III. arkutik, IX.ak mugituta (3 talde: goikoak, tartekoak, behekoak)',
    },
    {
      to: { adult: 1 },
      run: [0.06, 0.82],
      cam: SIDE(11.5, [0.5, 1.0, -0.7], 74, 6),
      glide: 0.05,
      dim: ['muskulu-estilofaringeoa', 'goiko-muskulu-ertzatzaileak', 'hioide-gorputz-behea', 'hioide-adar-nagusia'],
      names: [
        { id: 'muskulu-estilofaringeoa', small: true },
        { id: 'goiko-muskulu-ertzatzaileak', small: true },
        { id: 'hioide-adar-nagusia', small: true },
      ],
      note: 'Bi muskulu mota hauek degluzioan parte hartzen dute, faringea uzkurtuz',
    },
  ],
};
export const ThirdArch17 = poseStage17(spec3, build);
