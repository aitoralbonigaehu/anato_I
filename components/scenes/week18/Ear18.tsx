'use client';

import { ARCH, FRONT, TISSUE, endPose, poseStage18, type StageSpec } from '@/components/scenes/week17/common';
import { EAR0, earModel, type EarOpts, type EarPose } from './ear-model';

/**
 * Topic 18, notes 1.1.1 and 1.1.2 (ear-model.ts): the first pouch becomes the Eustachian tube and the tympanic
 * cavity; the second, the palatine tonsil. A frontal cut seen from the front: the pharynx on the viewer's left.
 */

const build = (pose: EarPose, opts: EarOpts) => earModel(pose, opts);
const CAP = 'Faringearen ezker aldea, aurretik ebakita: faringea zure ezkerrean, azala eskuinean';
const KEY = [
  { color: ARCH.i, text: 'I. arkua' },
  { color: ARCH.ii, text: 'II. arkua' },
  { color: TISSUE.endo, text: 'endodermoa (poltsak)' },
  { color: TISSUE.ecto, text: 'ektodermoa' },
];

const NEAR = FRONT(9.2, [2.1, 0.1, 0], 6, 6);
const WIDE = FRONT(12, [1.6, 0, 0], 10, 8);
const TUBE = FRONT(8.8, [1.8, 0.1, 0], -8, 6);
const CUP = FRONT(7.2, [2.8, 0.3, 0], 10, 6);

export const S1 = [0, 0.2, 0.4, 0.6, 0.8] as const;

const spec1: StageSpec<EarPose, EarOpts> = {
  map: 'pouch1',
  S: S1,
  pose: EAR0,
  opts: {},
  caption: CAP,
  key: KEY,
  steps: [
    {
      cam: WIDE,
      glide: 0.06,
      dim: ['lehen-poltsa', 'bigarren-poltsa', 'lehen-arkua', 'bigarren-arkua'],
      names: [
        { id: 'lehen-poltsa', text: 'Lehenengo poltsa', sub: '5. aste hasieran: oraindik ez da sakona' },
        { id: 'bigarren-poltsa', small: true },
        { id: 'lehen-arkua', text: 'I. arkua', from: 0.3 },
        { id: 'bigarren-arkua', text: 'II. arkua', from: 0.4 },
      ],
      note: '5. aste hasieran poltsak ez dira asko sakondu; garapenean batzuk sakondu egiten dira eta beste batzuetan egiturak garatzen dira',
    },
    {
      to: { deep: 1 },
      run: [0.06, 0.9],
      cam: NEAR,
      glide: 0.05,
      dim: ['lehen-poltsa'],
      names: [
        { id: 'sakonune-tubotinpanikoa', text: 'Sakonune tubotinpanikoa', sub: 'endodermoa asko sakontzen da', from: 0.2 },
        { id: 'lehen-poltsa', text: '1. poltsa', small: true, from: 0.4 },
      ],
      note: 'Lehenengo poltsaren endodermoa asko sakontzen da: sakonune tubotinpanikoa',
    },
    {
      to: { cup: 0.35 },
      run: [0.1, 0.8],
      cam: TUBE,
      glide: 0.05,
      dim: ['eustakioren-tronpa', 'faringe-hestea'],
      names: [
        { id: 'eustakioren-tronpa', text: 'Tronpa faringeotinpanikoa / Eustakioren tronpa', sub: 'hurbileko atala: hodia' },
        { id: 'faringe-hestea', text: 'Faringea', small: true, from: 0.3 },
      ],
      note: 'Hurbileko atala hodi forman geratzen da: Eustakioren tronpa, tarteko belarria eta faringea komunikatzen dituena',
    },
    {
      to: { cup: 1 },
      run: [0.05, 0.85],
      cam: CUP,
      glide: 0.05,
      dim: ['tinpano-kutxa'],
      names: [{ id: 'tinpano-kutxa', text: 'Tinpano-kutxa', sub: 'muturra zabaldu: barrunbea', from: 0.3 }],
      note: 'Hodiaren muturrean poltsa zabaltzen da, eta barrunbe horretatik tinpano-kutxa sortzen da',
    },
    {
      to: { oss: 1 },
      run: [0.08, 0.85],
      cam: CUP,
      dim: ['mailua', 'ingudea', 'ointokia', 'lehen-arkua', 'bigarren-arkua'],
      names: [
        { id: 'mailua', text: 'Mailua', sub: 'I. arkua', from: 0.45 },
        { id: 'ingudea', text: 'Ingudea', sub: 'I. arkua', from: 0.55 },
        { id: 'ointokia', text: 'Ointokia', sub: 'II. arkua', from: 0.65 },
      ],
      note: 'Tinpano-kutxan tarteko belarriaren hiru hezurtxoak: mailua eta ingudea I. arkutik (laranja), ointokia II. arkutik (urdina)',
    },
  ],
};
export const FirstPouch18 = poseStage18(spec1, build);

export const S2 = [0, 0.3, 0.6, 0.82] as const;

const TON = FRONT(6.6, [1.15, -2.7, 0], 8, 6);

const spec2: StageSpec<EarPose, EarOpts> = {
  map: 'pouch2',
  S: S2,
  pose: endPose(spec1).pose,
  opts: {},
  caption: CAP,
  key: KEY,
  steps: [
    {
      cam: FRONT(11, [1.6, -1.2, 0], 8, 6),
      glide: 0.06,
      dim: ['bigarren-poltsa', 'lehen-poltsa'],
      names: [
        { id: 'bigarren-poltsa', text: 'Bigarren poltsa' },
        { id: 'lehen-poltsa', small: true },
      ],
      note: '2., 3., 4. eta 5. poltsetan, sakonean, zelula bereizketak ematen dira: egitura desberdinak sortzen dira',
    },
    {
      to: { tonsil: 1 },
      run: [0.08, 0.85],
      cam: TON,
      glide: 0.05,
      dim: ['aho-sabaiko-amigdala', 'bigarren-poltsa'],
      names: [{ id: 'aho-sabaiko-amigdala', text: 'Aho-sabaiko amigdala', sub: '5. astea: poltsako zelulak bereizten hasi', from: 0.25 }],
      note: '5. astean poltsako zelula batzuk bereizten hasten dira, eta aho-sabaiko amigdala garatzen hasten da',
    },
    {
      to: { lymph: 1 },
      run: [0.06, 0.92],
      cam: FRONT(5.8, [1.3, -2.8, 0], -6, 6),
      glide: 0.05,
      dim: ['ehun-linfatikoa', 'aho-sabaiko-amigdala'],
      names: [
        { id: 'ehun-linfatikoa', text: 'Ehun linfatikoa', sub: '3.–5. hilabetea arte ez dago', from: 0.2 },
        { id: 'aho-sabaiko-amigdala', text: 'Aho-sabaiko amigdala', small: true, from: 0.35 },
      ],
      note: 'Baina 3.–5. hilabetera arte ez du barnean ehun linfatikorik izango',
    },
    {
      to: { func: 1 },
      run: [0.1, 0.5],
      cam: TON,
      glide: 0.05,
      dim: ['aho-sabaiko-amigdala', 'ehun-linfatikoa'],
      names: [{ id: 'aho-sabaiko-amigdala', text: 'Aho-sabaiko amigdala', sub: '5. hilabetean funtzionala' }],
      note: 'Beraz, 5. hilabetean funtzionala izango da',
    },
  ],
};
export const SecondPouch18 = poseStage18(spec2, build);
