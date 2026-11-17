'use client';

import '@/components/scenes/week17/HeadMap'; // first: common.tsx and HeadMap.tsx import each other, and HeadMap needs ARCH at load
import { ARCH, BACK, endPose, poseStage18, type StageSpec } from '@/components/scenes/week17/common';
import type { V3 } from '@/lib/three-d/math';
import { PH0, POUCH, type PharynxPose } from './pharynx-model';
import { pharynxB, type PharynxBOpts } from './pharynx-b';
import { SITE18 } from './sites';
import { WHERE18B } from './sites-b';

/**
 * Topic 18, notes 1.1.1 and 1.1.2, on the topic's one pharyngeal gut seen from behind (pharynx-model.ts through
 * pharynx-b.ts): the camera comes round to the embryo's LEFT first pouch (the viewer's left) and the pouch deepens
 * there into the tube and the tympanic cavity, the ossicles moving in from their arches; then down one level to
 * the second pouch and its tonsil. The stage before (clefts and pouches) and the one after (the third pouch) are on
 * the same model: every change is a run-on.
 */

const build = (pose: PharynxPose, opts: PharynxBOpts) => pharynxB(pose, opts);
const CAP = 'Faringe hestea atzetik, sabaia kenduta (3D eredua): enbrioiaren ezkerra zure ezkerrean';
const KEY = [
  { color: ARCH.i, text: 'I. arkua' },
  { color: ARCH.ii, text: 'II. arkua' },
  { color: POUCH.p1, text: '1. poltsa: tronpa, kutxa' },
  { color: POUCH.p2, text: '2. poltsa: amigdala' },
];
const CAM = (dist: number, target: V3, yaw = 180, elev = 6) => BACK(dist, target, yaw, elev);
/** The left side's arches, named beside the pouch (the model names them on the right). */
const I_L: V3 = [2.86, 2.25, -0.01];
const II_L: V3 = [2.3, 1.0, -0.01];

/** Where the stage before (clefts and pouches, Pharynx18) leaves the gut: the cut in the tissues' colours. */
const FROM_CLEFTS: PharynxPose = { ...PH0, tissue: 1 };

export const S1 = [0, 0.2, 0.4, 0.6, 0.8] as const;

const spec1: StageSpec<PharynxPose, PharynxBOpts> = {
  site: SITE18.pharynx,
  arrive: 'Faringe hesteari atzetik begira jarraitzen dugu: orain ezkerreko lehen poltsara hurbilduko gara',
  where: WHERE18B.pharynx,
  map: 'pouch1',
  S: S1,
  pose: FROM_CLEFTS,
  opts: {},
  caption: CAP,
  key: KEY,
  steps: [
    {
      cam: CAM(8, [1.7, 1.2, 0.2], 172, 8),
      fit: false,
      glide: 0.07,
      dim: ['lehen-poltsa', 'bigarren-poltsa', 'lehen-arkua', 'bigarren-arkua'],
      names: [
        { id: 'lehen-poltsa', text: 'Lehenengo poltsa', sub: '5. aste hasieran: oraindik ez da sakona' },
        { id: 'bigarren-poltsa', small: true, from: 0.2 },
        { id: 'lehen-arkua', text: 'I. arkua', p: I_L, from: 0.3 },
        { id: 'bigarren-arkua', text: 'II. arkua', p: II_L, from: 0.4 },
      ],
      note: '5. aste hasieran poltsak ez dira asko sakondu; garapenean batzuk sakondu egiten dira eta beste batzuetan egiturak garatzen dira',
    },
    {
      to: { p1: 1 },
      run: [0.06, 0.9],
      cam: CAM(5.6, [2.0, 1.75, 0.1], 176, 8),
      fit: false,
      glide: 0.05,
      dim: ['lehen-poltsa'],
      names: [
        { id: 'sakonune-tubotinpanikoa', text: 'Sakonune tubotinpanikoa', sub: 'endodermoa asko sakontzen da', from: 0.25 },
        { id: 'lehen-poltsa', text: '1. poltsa', small: true, from: 0.45 },
      ],
      note: 'Lehenengo poltsaren endodermoa asko sakontzen da: sakonune tubotinpanikoa',
    },
    {
      to: { cav: 0.35 },
      run: [0.1, 0.8],
      cam: CAM(5.2, [1.75, 1.8, 0.1], 186, 8),
      fit: false,
      glide: 0.05,
      dim: ['eustakioren-tronpa', 'faringe-hestea'],
      names: [
        { id: 'eustakioren-tronpa', text: 'Tronpa faringeotinpanikoa / Eustakioren tronpa', sub: 'hurbileko atala: hodia' },
        { id: 'faringe-hestea', text: 'Faringea', small: true, p: [0.4, 1.4, 0.9], from: 0.3 },
      ],
      note: 'Hurbileko atala hodi forman geratzen da: Eustakioren tronpa, tarteko belarria eta faringea komunikatzen dituena',
    },
    {
      to: { cav: 1 },
      run: [0.05, 0.85],
      cam: CAM(4.6, [2.15, 1.85, 0.1], 178, 8),
      fit: false,
      glide: 0.05,
      dim: ['tinpano-kutxa'],
      names: [{ id: 'tinpano-kutxa', text: 'Tinpano-kutxa', sub: 'muturra zabaldu: barrunbea', from: 0.3 }],
      note: 'Hodiaren muturrean poltsa zabaltzen da, eta barrunbe horretatik tinpano-kutxa sortzen da',
    },
    {
      to: { ossicles: 1 },
      run: [0.08, 0.85],
      cam: CAM(4.4, [2.1, 1.95, 0.1], 172, 10),
      fit: false,
      glide: 0.05,
      dim: ['mailua', 'ingudea', 'ointokia', 'tinpano-kutxa'],
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

const TON = CAM(4.6, [1.45, 0.45, 0], 176, 10);

const spec2: StageSpec<PharynxPose, PharynxBOpts> = {
  site: SITE18.pharynx,
  arrive: 'Maila bat behera, ezkerreko bigarren poltsara: I. eta II. arkuen azpian',
  where: WHERE18B.pharynx,
  map: 'pouch2',
  S: S2,
  pose: endPose(spec1).pose,
  opts: {},
  caption: CAP,
  key: KEY,
  steps: [
    {
      cam: CAM(6.6, [1.6, 0.9, 0.1], 172, 8),
      fit: false,
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
      fit: false,
      glide: 0.05,
      dim: ['aho-sabaiko-amigdala', 'bigarren-poltsa'],
      names: [{ id: 'aho-sabaiko-amigdala', text: 'Aho-sabaiko amigdala', sub: '5. astea: poltsako zelulak bereizten hasi', from: 0.25 }],
      note: '5. astean poltsako zelula batzuk bereizten hasten dira, eta aho-sabaiko amigdala garatzen hasten da',
    },
    {
      to: { lymph: 1 },
      run: [0.06, 0.92],
      cam: CAM(3.9, [1.45, 0.4, -0.1], 188, 12),
      fit: false,
      glide: 0.05,
      dim: ['ehun-linfatikoa', 'aho-sabaiko-amigdala'],
      names: [
        { id: 'ehun-linfatikoa', text: 'Ehun linfatikoa', sub: '3.–5. hilabetea arte ez dago', from: 0.2 },
        { id: 'aho-sabaiko-amigdala', text: 'Aho-sabaiko amigdala', small: true, from: 0.35 },
      ],
      note: 'Baina 3.–5. hilabetera arte ez du barnean ehun linfatikorik izango',
    },
    {
      cam: TON,
      fit: false,
      glide: 0.05,
      dim: ['aho-sabaiko-amigdala', 'ehun-linfatikoa'],
      names: [{ id: 'aho-sabaiko-amigdala', text: 'Aho-sabaiko amigdala', sub: '5. hilabetean funtzionala' }],
      note: 'Beraz, 5. hilabetean funtzionala izango da',
    },
  ],
};
export const SecondPouch18 = poseStage18(spec2, build);

/** Where the second pouch's stage leaves the gut (Pharynx18's third pouch can start from it). */
export const END_POUCH2 = endPose(spec2).pose;
