'use client';

import type { V3 } from '@/lib/three-d/math';
import { ARCH, TISSUE, poseStage17, type StageSpec, endPose } from './common';
import { LX0, larynxModel, type LarynxOpts, type LarynxPose } from './larynx-model';
import { orbit } from '@/components/scenes/week14/common';

/** Topic 17, 2.6.2 and 2.6.3: the larynx (larynx-model.ts) in the arches' colours. */

const build = (pose: LarynxPose, opts: LarynxOpts) => larynxModel(pose, opts);
const CAP = 'Laringea 3D eredu batean: IV. arkua gorria, VI.a berdea';
const VIEW = (yaw: number, dist = 13, target: V3 = [0, 0.3, -0.3], elev = 8) => orbit(yaw, elev, dist, target, [20, 0]);

const KEY_C = [
  { color: ARCH.iv, text: 'IV. arkua' },
  { color: ARCH.vi, text: 'VI. arkua' },
  { color: TISSUE.ground, text: 'trakea: ez da arkua' },
  { color: TISSUE.bone, text: 'hioidea (II–III)' },
] as const;
const KEY_M = [
  { color: ARCH.iii, text: 'III. arkua' },
  { color: ARCH.iv, text: 'IV. arkua' },
  { color: ARCH.vi, text: 'VI. arkua' },
  { color: TISSUE.nerve, text: 'nerbio bagoa' },
] as const;

export const S_LC = [0, 0.2, 0.36, 0.52, 0.68, 0.84] as const;

const specC: StageSpec<LarynxPose, LarynxOpts> = {
  S: S_LC,
  pose: LX0,
  opts: {},
  map: 'arch46',
  caption: CAP,
  key: KEY_C,
  steps: [
    {
      cam: VIEW(34),
      glide: 0.08,
      dim: ['tiroide-kartilagoa', 'krikoide-kartilagoa', 'epiglotisa'],
      names: [
        { id: 'tiroide-kartilagoa', sub: 'nagusia' },
        { id: 'krikoide-kartilagoa', sub: 'nagusia', from: 0.3 },
        { id: 'epiglotisa', sub: 'nagusia', from: 0.55 },
        { id: 'hioide-hezurra', small: true, from: 0.7 },
      ],
      note: 'IV. eta VI. arkuetan ez dago hezurrik ez lotailurik, kartilagoak bakarrik: laringekoak',
    },
    {
      cam: VIEW(90, 11, [0, 1.3, 0.1]),
      glide: 0.07,
      dim: ['epiglotisa'],
      names: [{ id: 'epiglotisa', sub: '"L" formako egitura', from: 0.15 }],
      note: 'Epiglotisa alboz: "L" formako egitura, tiroidearen atzean lotuta',
    },
    {
      to: { ary: 1 },
      run: [0.15, 0.75],
      cam: VIEW(155, 9.5, [0, -0.3, -0.8], 14),
      glide: 0.09,
      dim: ['aritenoide-kartilagoa', 'krikoide-kartilagoa'],
      names: [
        { id: 'aritenoide-kartilagoa', sub: 'bikoitza', from: 0.25 },
        { id: 'krikoide-kartilagoa', small: true, from: 0.5 },
      ],
      note: 'Atzetik begiratzeko biratu dugu: krikoidearen gainean aritenoideak, bikoitzak',
    },
    {
      to: { corn: 1 },
      run: [0.1, 0.7],
      cam: VIEW(165, 7, [0, 0.1, -1], 12),
      glide: 0.07,
      dim: ['kartilago-kornikulatua', 'kartilago-kuneiformea'],
      names: [
        { id: 'kartilago-kornikulatua', text: 'Kornikulatuak', sub: 'bikoitzak', from: 0.2 },
        { id: 'kartilago-kuneiformea', text: 'Kuneiformeak', sub: 'bikoitzak', from: 0.45 },
      ],
      note: 'Beste bi bikote: kornikulatuak eta kuneiformeak. Azken hiruak bikoitzak dira',
    },
    {
      to: { split: 1 },
      run: [0.12, 0.7],
      cam: VIEW(42, 10.5, [0, 0.6, 0.2]),
      glide: 0.09,
      dim: ['tiroide-goiko-atala', 'tiroide-beheko-atala'],
      names: [
        { id: 'tiroide-goiko-atala', text: 'Tiroidearen goiko aldea', sub: 'IV. arkua', from: 0.2 },
        { id: 'tiroide-beheko-atala', text: 'Beheko atala', sub: 'VI. arkua', from: 0.5 },
      ],
      note: 'Tiroidea bitan banatzen da: goikoa IV. arkutik, behekoa VI.etik',
    },
    {
      to: { split: 0 },
      run: [0.05, 0.5],
      cam: VIEW(58, 15, [0, -0.6, -0.2]),
      glide: 0.08,
      dim: ['tiroide-goiko-atala', 'tiroide-beheko-atala', 'krikoide-kartilagoa', 'epiglotisa', 'trakea'],
      names: [
        { id: 'tiroide-goiko-atala', text: 'Tiroidea (goian)', sub: 'IV', small: true },
        { id: 'tiroide-beheko-atala', text: 'Tiroidea (behean)', sub: 'VI', small: true },
        { id: 'krikoide-kartilagoa', sub: 'VI', small: true },
        { id: 'epiglotisa', sub: 'VI', small: true },
        { id: 'trakea', sub: 'aurreko hestea, ez arkuak', from: 0.35 },
      ],
      note: 'Goiko tiroidea ez beste guztia VI. arkutik. Hemendik behera trakea: aurreko hestetik, ez arkuetatik',
    },
  ],
};
export const LarynxCart17 = poseStage17(specC, build);

export const S_LM = [0, 0.18, 0.38, 0.6, 0.82] as const;

const specM: StageSpec<LarynxPose, LarynxOpts> = {
  S: S_LM,
  pose: { ...endPose(specC).pose, split: 0 },
  opts: {},
  map: 'arch46',
  caption: CAP,
  key: KEY_M,
  steps: [
    {
      to: { pharynx: 1 },
      run: [0.1, 0.85],
      cam: VIEW(125, 17, [0, 1.2, -1.2]),
      glide: 0.1,
      dim: ['faringea'],
      names: [{ id: 'faringea', sub: 'muskuluak sakonean', from: 0.4 }],
      note: 'IV. eta VI. arkuetako muskuluak ere sakonak edo barnekoak dira',
    },
    {
      to: { mid: 1, sup: 1 },
      run: [0.08, 0.85],
      cam: VIEW(150, 17, [0, 1.6, -1.6]),
      glide: 0.08,
      dim: ['tarteko-ertzatzailea', 'beheko-ertzatzailea', 'goiko-ertzatzailea'],
      names: [
        { id: 'goiko-ertzatzailea', text: 'Goiko ertzatzailea', sub: 'III. arkua', small: true, from: 0.2 },
        { id: 'tarteko-ertzatzailea', text: 'Tarteko ertzatzailea', sub: 'IV. arkua', from: 0.35 },
        { id: 'beheko-ertzatzailea', text: 'Beheko ertzatzailea', sub: 'IV. arkua', from: 0.55 },
      ],
      note: 'IV. arkutik faringearen tarteko eta beheko muskulu ertzatzaileak; goikoak III.etik',
    },
    {
      to: { open: 1, intr: 1 },
      run: [0.08, 0.85],
      cam: VIEW(186, 9.5, [0.1, -0.4, -1.2], 10),
      glide: 0.08,
      dim: ['laringe-barneko-muskuluak', 'aritenoide-kartilagoa'],
      names: [
        { id: 'laringe-barneko-muskuluak', text: 'Laringe barneko muskulu intrintsekoak', sub: 'VI. arkua', from: 0.45 },
        { id: 'aritenoide-kartilagoa', small: true, from: 0.65 },
      ],
      note: 'Faringea kendu dugu eta eskuineko ertzatzaileak atzeratu, barrua ikusteko: VI. arkutik laringe barneko muskuluak',
    },
    {
      to: { nerve: 1 },
      run: [0.08, 0.8],
      cam: VIEW(148, 14.5, [0.4, -0.2, -1.2], 10),
      glide: 0.08,
      dim: ['bagoa', 'goiko-laringe-nerbioa', 'laringe-atzerakaria', 'tarteko-ertzatzailea', 'beheko-ertzatzailea', 'laringe-barneko-muskuluak'],
      names: [
        { id: 'bagoa', sub: 'X. bikotea', from: 0.1 },
        { id: 'goiko-laringe-nerbioa', text: 'Goiko nerbio laringeoa', sub: 'IV. arkura', from: 0.35 },
        { id: 'laringe-atzerakaria', text: 'Laringe nerbio atzerakaria', sub: 'VI. arkura', from: 0.6 },
      ],
      note: 'Bagoaren lepoko adar nagusiak: goiko laringeoa IV.era, atzerakaria VI.era',
    },
    {
      cam: VIEW(130, 19, [0.4, 0, -1]),
      glide: 0.08,
      dim: ['bagoa', 'goiko-laringe-nerbioa', 'laringe-atzerakaria', 'tarteko-ertzatzailea', 'beheko-ertzatzailea', 'laringe-barneko-muskuluak'],
      names: [
        { id: 'bagoa', sub: 'nerbio parasinpatiko nagusiena' },
        { id: 'trakea', sub: 'ez arkuak', small: true, from: 0.5 },
      ],
      note: 'Bagoa handia da: toraxeko errai guztiak eta abdomeneko asko inerbatzen ditu. Horregatik zehazten da zein atalek',
    },
  ],
};
export const LarynxMuscle17 = poseStage17(specM, build);
