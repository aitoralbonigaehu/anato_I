'use client';

import { BACK, KEY_ARCH, KEY_LAYERS, TISSUE, endPose, poseStage18, type StageSpec } from '@/components/scenes/week17/common';
import type { V3 } from '@/lib/three-d/math';
import { PH0, POUCH, pharynxModel, type PharynxOpts, type PharynxPose } from './pharynx-model';

/**
 * Topic 18 §1 on one hollow pharyngeal gut seen from behind with its roof taken away (pharynx-model.ts): the
 * recap of the arches, clefts against pouches, then the two wings of the third and fourth pouches budding on the
 * same gut, one wall peeled onto its endoderm so the buds stand free.
 */

const build = (pose: PharynxPose, opts: PharynxOpts) => pharynxModel(pose, opts);
const CAP = 'Faringe hestea atzetik, sabaia kenduta (3D eredua): enbrioiaren ezkerra zure ezkerrean';
const KEY_POUCH = [
  { color: POUCH.p3, text: '3. poltsaren eratorriak' },
  { color: POUCH.p4, text: '4. poltsaren eratorriak' },
  { color: TISSUE.endo, text: 'endodermoa' },
  { color: TISSUE.mes, text: 'mesenkima' },
];
const CAM = (dist = 11, target: V3 = [0, 0.2, 0.3], yaw = 180, elev = 6) => BACK(dist, target, yaw, elev);
/** From behind and the embryo's left: the bare endoderm of the peeled side. */
const CAST = (dist = 8.5, target: V3 = [1.1, -0.9, 0.2], yaw = 132, elev = 12) => BACK(dist, target, yaw, elev);

// ———————————————————————————— 1. Sarrera ————————————————————————————

export const S1 = [0, 0.36, 0.68] as const;

const spec1: StageSpec<PharynxPose, PharynxOpts> = {
  where: { th: 1.15, at: [0, -0.6, 0.6], scale: 3, planes: [{ center: [0, -0.2, 0], a: [3.8, 0, 0], b: [0, 4, 0] }], note: 'Lepo mailan, faringe hestearen alboetan: arkuak. Sabaia kendu eta atzetik begiratuko dugu' },
  map: 'arches',
  S: S1,
  pose: PH0,
  opts: {},
  caption: CAP,
  key: KEY_ARCH,
  steps: [
    {
      cam: CAM(11.5),
      glide: 0.1,
      fit: false,
      dim: ['faringe-arkuak', 'lehen-arkua', 'bigarren-arkua', 'hirugarren-arkua', 'laugarren-arkua', 'seigarren-arkua', 'luzapen-maxilarra'],
      names: [
        { id: 'lehen-arkua', text: 'I. arkua', from: 0.1 },
        { id: 'bigarren-arkua', text: 'II. arkua', from: 0.2 },
        { id: 'hirugarren-arkua', text: 'III. arkua', from: 0.3 },
        { id: 'laugarren-arkua', text: 'IV. arkua', from: 0.4 },
        { id: 'faringe-hestea', from: 0.5 },
      ],
      note: 'Faringe hestearen alboetan arku faringeoak / arku brankialak: goraguneak, alde bietan',
    },
    {
      to: { tissue: 1 },
      run: [0.05, 0.5],
      cam: CAM(7.5, [-1.55, 0.6, 0], 180, 4),
      fit: false,
      glide: 0.06,
      key: KEY_LAYERS,
      dim: ['ektodermoa', 'endodermoa', 'mesenkima'],
      names: [
        { id: 'ektodermoa', text: 'Ektodermoa', sub: 'kanpotik', p: [-3.2, 1.05, -0.01] },
        { id: 'mesenkima', text: 'Mesenkima', sub: 'gandor neurala + mesodermoa', p: [-2.45, 1.0, -0.01], from: 0.2 },
        { id: 'endodermoa', text: 'Endodermoa', sub: 'barrutik', p: [-1.66, 1.02, -0.01], from: 0.4 },
      ],
      note: 'Arku bakoitza: kanpotik ektodermoa, barrutik endodermoa, tartean gandor neuralen eta zelula mesodermikoen mesenkima',
    },
    {
      cam: CAM(9.5, [0, 0.1, 0.2], 180, 6),
      fit: false,
      glide: 0.06,
      key: KEY_LAYERS,
      dim: ['faringe-arraildurak', 'lehen-arraildura', 'faringe-poltsak', 'lehen-poltsa', 'bigarren-poltsa', 'hirugarren-poltsa', 'laugarren-poltsa'],
      names: [
        { id: 'faringe-arraildurak', text: 'Faringe arraildurak', sub: 'kanpotik · ektodermoa' },
        { id: 'faringe-poltsak', text: 'Faringe poltsak', sub: 'barrutik · endodermoa', from: 0.3 },
      ],
      note: 'Bidea: arraildurak kanpotik, poltsak barrutik; gero poltsen eta arrailduren eratorriak',
    },
  ],
};
export const Intro18 = poseStage18(spec1, build);

// ———————————————————————————— 2. Arraildurak eta poltsak ————————————————————————————

export const S2 = [0, 0.22, 0.44, 0.72] as const;

const spec2: StageSpec<PharynxPose, PharynxOpts> = {
  map: 'clefts',
  S: S2,
  pose: endPose(spec1).pose,
  opts: {},
  caption: CAP,
  key: KEY_LAYERS,
  steps: [
    {
      cam: CAM(7.6, [-1.75, 0.05, 0], 180, 4),
      fit: false,
      glide: 0.06,
      dim: ['faringe-arraildurak', 'lehen-arraildura'],
      names: [
        { id: 'lehen-arraildura', text: '1. arraildura', sub: 'I. eta II. arkuen artean' },
        { id: 'faringe-arraildurak', text: 'Arraildurak', sub: 'kanpoko inbaginazioak · ektodermoa', from: 0.3 },
      ],
      note: 'Arraildura faringeoak: kanpoko inbaginazioak, ektodermoan, arkuen artean: arkuen kanpoko aldeko ildoak',
    },
    {
      cam: CAM(7.6, [1.5, 0.05, 0], 180, 4),
      fit: false,
      glide: 0.06,
      dim: ['faringe-poltsak', 'lehen-poltsa', 'bigarren-poltsa', 'hirugarren-poltsa', 'laugarren-poltsa'],
      names: [
        { id: 'lehen-poltsa', text: '1. poltsa', p: [2.2, 1.62, 0.02] },
        { id: 'bigarren-poltsa', text: '2. poltsa', from: 0.15 },
        { id: 'hirugarren-poltsa', text: '3. poltsa', from: 0.3 },
        { id: 'laugarren-poltsa', text: '4. poltsa', sub: 'azkena: 4+5 batera', from: 0.45 },
      ],
      note: 'Poltsa faringeoak: barruko inbaginazioak, endodermoan, arrailduren kontrako aldean. 6 arku, 4 poltsa (azkena batera ikasten dugu)',
    },
    {
      to: { art: 1, aortic: 1, peelL: 1 },
      run: [0.04, 0.75],
      cam: CAST(9.5, [0.9, -0.2, 0.2], 140, 12),
      fit: false,
      glide: 0.07,
      dim: ['aorta-arkuak', 'arkuko-arteria', 'aorta-dortsala', 'faringe-poltsak', 'hirugarren-poltsa', 'bigarren-poltsa', 'laugarren-poltsa', 'lehen-poltsa'],
      names: [
        { id: 'aorta-arkuak', text: 'Aorta arkuak', sub: 'bakoitza arku batean', p: [2.0, 0.98, -0.05], from: 0.3 },
        { id: 'hirugarren-poltsa', text: 'Poltsa', sub: 'bi aorta arkuren artean', from: 0.5 },
      ],
      note: 'Ezker horma kenduta, endodermoa bakarrik: poltsak aorta arkuen artean kokatzen dira',
    },
    {
      to: { art: 0, aortic: 0, peelL: 0 },
      run: [0.04, 0.4],
      cam: CAM(6.2, [0, -1.7, 0.6], 180, 18),
      fit: false,
      glide: 0.06,
      dim: ['laringe-zuloa'],
      names: [{ id: 'laringe-zuloa', text: 'Laringe zuloa', sub: 'arnas aparatuaren hastapena', from: 0.2 }],
      note: 'Behealdean, faringearen aurreko paretan, laringe zuloa: hemendik ebaginatzen da arnas aparatua. 4. astean hasi, 7. asterako ia garatuta',
    },
  ],
};
export const Clefts18 = poseStage18(spec2, build);

// ———————————————————————————— 5. Hirugarren poltsa ————————————————————————————

export const S3 = [0, 0.18, 0.44, 0.7] as const;
const P_CAST: PharynxPose = { ...PH0, tissue: 1, peelL: 1 };

const spec3: StageSpec<PharynxPose, PharynxOpts> = {
  map: 'pouch3',
  S: S3,
  pose: P_CAST,
  opts: {},
  caption: CAP,
  key: KEY_POUCH,
  steps: [
    {
      cam: CAST(8.5),
      fit: false,
      glide: 0.06,
      dim: ['hirugarren-poltsa'],
      names: [{ id: 'hirugarren-poltsa', text: '3. poltsa', sub: 'bi alde: dortsala eta bentrala' }],
      note: 'Hirugarren poltsan bi alde (bi kimu) bereiz ditzakegu: biak mugituko dira garapenean. Ezker horma kenduta: endodermoa bakarrik',
    },
    {
      to: { p3d: 1 },
      run: [0.08, 0.8],
      cam: CAST(6.6, [1.65, -0.7, -0.1], 138, 14),
      fit: false,
      glide: 0.06,
      dim: ['hirugarren-poltsa', 'beheko-paratiroidea'],
      names: [{ id: 'beheko-paratiroidea', text: 'Beheko paratiroide guruina', sub: 'alde dortsaletik', from: 0.4 }],
      note: 'Alde dortsaletik beheko paratiroide guruinak: parato hormona ekoizten dute; helduan tiroidearekin batera',
    },
    {
      to: { p3v: 1 },
      run: [0.08, 0.85],
      cam: CAST(7.4, [1.5, -1.0, 0.45], 118, 12),
      fit: false,
      glide: 0.06,
      dim: ['timoa', 'beheko-paratiroidea', 'hirugarren-poltsa'],
      names: [
        { id: 'timoa', text: 'Timoa', sub: 'alde bentraletik', from: 0.4 },
        { id: 'beheko-paratiroidea', text: 'Beheko paratiroidea', sub: 'dortsala' },
      ],
      note: 'Alde bentraletik timoa. Pubertaroraino garatzen da, gero endekatu: helduan ia funtziorik ez',
    },
    {
      to: { descend: 0.28 },
      run: [0.08, 0.9],
      cam: CAST(8.6, [1.35, -1.6, 0.3], 138, 10),
      fit: false,
      glide: 0.06,
      dim: ['timoa', 'beheko-paratiroidea'],
      names: [
        { id: 'timoa', text: 'Timoa', sub: 'beherantz eta medialerantz' },
        { id: 'beheko-paratiroidea', text: 'Beheko paratiroidea', sub: 'timoarekin batera' },
      ],
      note: 'Bere tokira jaitsi behar du timoak: beherantz eta alde medialerantz; paratiroidea harekin batera doa',
    },
  ],
};
export const Pouch3 = poseStage18(spec3, build);

// ———————————————————————————— 6. Laugarren poltsa ————————————————————————————

export const S4 = [0, 0.2, 0.46, 0.72] as const;
const P4_START: PharynxPose = { ...P_CAST, p3d: 1, p3v: 1 };
const LOOK4 = CAST(6.8, [1.35, -1.55, 0.1], 132, 14);

const spec4: StageSpec<PharynxPose, PharynxOpts> = {
  map: 'pouch4',
  S: S4,
  pose: P4_START,
  opts: {},
  caption: CAP,
  key: KEY_POUCH,
  steps: [
    {
      to: { p4d: 1 },
      run: [0.08, 0.85],
      cam: LOOK4,
      fit: false,
      glide: 0.06,
      dim: ['laugarren-poltsa', 'goiko-paratiroidea'],
      names: [
        { id: 'laugarren-poltsa', text: '4. poltsa', sub: 'bi kimu: dortsala eta bentrala' },
        { id: 'goiko-paratiroidea', text: 'Goiko paratiroide guruina', sub: 'alde dortsaletik', from: 0.45 },
      ],
      note: 'Laugarren poltsak ere bi alde ditu. Alde dortsaletik goiko paratiroide guruinak',
    },
    {
      cam: CAST(8, [1.45, -1.2, -0.1], 150, 12),
      fit: false,
      glide: 0.06,
      warn: true,
      dim: ['beheko-paratiroidea', 'goiko-paratiroidea'],
      names: [
        { id: 'beheko-paratiroidea', text: 'BEHEKOA', sub: 'goiko poltsan (3.) hasten da' },
        { id: 'goiko-paratiroidea', text: 'GOIKOA', sub: 'beheko poltsan (4.) hasten da', from: 0.2 },
      ],
      note: 'KONTUZ! Behekoak goiko poltsan hasten dira: izena ez da sorrerarena, behin betiko kokapenarena baizik',
    },
    {
      to: { p4v: 1 },
      run: [0.08, 0.85],
      cam: CAST(6.4, [1.25, -1.75, 0.5], 118, 12),
      fit: false,
      glide: 0.06,
      dim: ['gorputz-ultimobrankiala', 'laugarren-poltsa'],
      names: [{ id: 'gorputz-ultimobrankiala', text: 'Gorputz ultimobrankiala', sub: 'alde bentraletik → C zelulak (kaltzitonina)', from: 0.4 }],
      note: 'Alde bentraletik gorputz ultimobrankiala: jaitsi eta tiroidean barneratzen da; C zelulak, kaltzitonina ekoizten dutenak',
    },
    {
      cam: CAST(8.6, [1.3, -1.3, 0.2], 138, 12),
      fit: false,
      glide: 0.06,
      dim: ['beheko-paratiroidea', 'timoa', 'goiko-paratiroidea', 'gorputz-ultimobrankiala'],
      names: [
        { id: 'beheko-paratiroidea', text: 'Behekoa', sub: '3. poltsa' },
        { id: 'timoa', text: 'Timoa', sub: '3. poltsa' },
        { id: 'goiko-paratiroidea', text: 'Goikoa', sub: '4. poltsa' },
        { id: 'gorputz-ultimobrankiala', text: 'Ultimobrankiala', sub: '4. poltsa' },
      ],
      note: 'GOGORATU: goikaldean behekoa, behekaldean goikoa. 3. eta 4. poltsetatik eratutako egiturak jaitsi egin behar dira',
    },
  ],
};
export const Pouch4 = poseStage18(spec4, build);
