'use client';

import type { V3 } from '@/lib/three-d/math';
import { FRONT19, KEY19, LEFT19, endPose, poseStage19, type StageSpec } from './common';
import { NP0, neuralModel, type NeuralOpts, type NeuralPose } from './neural-model';
import { SITE19B } from './sites-b';

/**
 * Topic 19, sections 4 and 6 (neural-model.ts): the neural plate folding into the tube, then the vesicles and the flexures.
 * The plate is seen from its dorsal side (from behind), the vesicles from the left.
 */

const CAP_DORSAL = 'Plaka neurala atzetik (3D eredua): buru aldea goian';
const CAP_SIDE = 'Hodi neurala ezkerretik (3D eredua): buru aldea goian, aurrealdea zure ezkerrean';
const build = (pose: NeuralPose, opts: NeuralOpts) => neuralModel(pose, opts);
const DORSAL = (dist = 14, y = 3.2, yaw = 180, elev = 6, x = 0) => FRONT19(dist, [x, y, 0] as V3, yaw, elev);
const SIDEV = (dist = 8, y = 4.8, z = 0.4, yaw = 90, elev = 4) => LEFT19(dist, [0, y, z], yaw, elev);

// ———————————————————————— Plaka neurala (4) ————————————————————————

export const S_PLATE = [0, 0.26, 0.5, 0.76] as const;
const specPlate: StageSpec<NeuralPose, NeuralOpts> = {
  S: S_PLATE,
  pose: { ...NP0 },
  opts: {},
  site: SITE19B.neural,
  arrive: 'Hasierara: 3. astea, plaka neurala, atzetik',
  caption: CAP_DORSAL,
  key: KEY19.crest,
  steps: [
    {
      to: { fold: 0.55 },
      run: [0.15, 0.9],
      cam: DORSAL(13.5, 3.2, 200, 14),
      fit: false,
      glide: 0.06,
      dim: ['plaka-neurala', 'hodi-neurala'],
      names: [{ id: 'plaka-neurala', text: 'Plaka neurala', sub: 'zapala; bi goragune sortzen dira' }],
      note: 'Hasieran plaka zapal bat da, baina garapenarekin bi goragune sortzen dira',
    },
    {
      to: { fold: 0.9 },
      run: [0.05, 0.7],
      cam: DORSAL(6.5, 3.2, 205, 18),
      fit: false,
      glide: 0.05,
      dim: ['gandor-neurala'],
      names: [
        { id: 'gandor-neurala', text: 'Gandor neurala', sub: 'muturretan bereizten da', from: 0.3 },
        { id: 'tolesdura-neuralak', small: true, from: 0.45 },
      ],
      note: 'Goraguneen muturrak gerturatzen doaz erdikaldean fusionatu arte; tolestean, muturretan gandor neuraleko zelulak bereizten dira',
    },
    {
      to: { fold: 1, zip: 0.62 },
      run: [0.05, 0.9],
      cam: DORSAL(14.5, 3.3, 200, 14),
      fit: false,
      glide: 0.05,
      dim: ['hodi-neurala', 'neuroporo-kraneala', 'neuroporo-kaudala'],
      names: [
        { id: 'hodi-neurala', text: 'Fusioa erdian hasten da', sub: 'hodi neurala' },
        { id: 'neuroporo-kraneala', text: 'Aurreko neuroporoa', from: 0.5 },
        { id: 'neuroporo-kaudala', text: 'Atzeko neuroporoa', from: 0.6 },
      ],
      note: 'Fusioa erdi mailan hasten da, atzean eta aurrean neuroporoak utziz',
    },
    {
      to: { zip: 1 },
      run: [0.05, 0.9],
      cam: DORSAL(14.5, 3.3, 200, 14),
      fit: false,
      glide: 0.05,
      dim: ['neuroporo-kraneala', 'neuroporo-kaudala', 'hodi-neurala'],
      names: [
        { id: 'neuroporo-kraneala', text: 'Aurrekoa: 25. eguna', sub: 'lehenago ixten da' },
        { id: 'neuroporo-kaudala', text: 'Atzekoa: 27./28. eguna', from: 0.4 },
        { id: 'hodi-neurala', text: 'Hodi neurala', small: true, from: 0.7 },
      ],
      note: 'Aurreko neuroporoa 25. egunean ixten da eta atzekoa 27./28. egunean: hodi neurala sortzen da',
    },
  ],
};
export const Plate19 = poseStage19(specPlate, build);

// ———————————————————————— Hiru xixkuak (6) ————————————————————————

export const S_THREE = [0, 0.16, 0.32, 0.5, 0.66, 0.84] as const;
const specThree: StageSpec<NeuralPose, NeuralOpts> = {
  S: S_THREE,
  pose: endPose(specPlate).pose,
  opts: {},
  site: SITE19B.neural,
  arrive: 'Hodi bera, ezkerretik: buru aldea zabaltzen da',
  caption: CAP_SIDE,
  key: KEY19.vesicles,
  steps: [
    {
      to: { three: 1, tint: 1 },
      run: [0.1, 0.9],
      cam: SIDEV(9.5, 4.2, 0.2),
      fit: false,
      glide: 0.08,
      dim: ['prosentzefaloa', 'mesentzefaloa', 'erronbentzefaloa'],
      names: [
        { id: 'prosentzefaloa', from: 0.3 },
        { id: 'mesentzefaloa', from: 0.4 },
        { id: 'erronbentzefaloa', from: 0.5 },
      ],
      note: 'Alde kranealean hodi neurala zabaldu eta 3 xixku sortzen ditu: prosentzefaloa (aurrekoa), mesentzefaloa (tartekoa), erronbentzefaloa (azkena)',
    },
    {
      cam: SIDEV(4.6, 5.6, 0.3),
      fit: false,
      glide: 0.05,
      dim: ['prosentzefaloa'],
      names: [{ id: 'prosentzefaloa', text: 'Prosentzefalotik: telentzefaloa', sub: 'luzatu, dientzefaloa estali: garun hemisferioak' }],
      note: 'Prosentzefalotik 2 xixku. Telentzefaloa: luzatu eta handitu, dientzefaloaren gainetik pasa eta estaltzen du; garun hemisferioak',
    },
    {
      cam: SIDEV(4.4, 5.4, 0.2),
      fit: false,
      glide: 0.05,
      dim: ['prosentzefaloa'],
      names: [{ id: 'prosentzefaloa', text: 'Dientzefaloa', sub: 'erdian: epitalamoa, talamoa, hipotalamoa, azpitalamoa' }],
      note: 'Dientzefaloa erdian geratzen da: epitalamoa (guruin pineala), talamoa (garrantzitsuena), hipotalamoa (hormonak) eta azpitalamoa',
    },
    {
      cam: SIDEV(4.4, 5.25, 0.3),
      fit: false,
      glide: 0.05,
      dim: ['mesentzefaloa'],
      names: [{ id: 'mesentzefaloa', text: 'Mesentzefaloa', sub: 'BETI berdin geratzen da' }],
      note: 'Mesentzefaloa BETI berdin geratzen da',
    },
    {
      cam: SIDEV(4.8, 4.6, 0.2),
      fit: false,
      glide: 0.05,
      dim: ['erronbentzefaloa'],
      names: [{ id: 'erronbentzefaloa', text: 'Erronbentzefaloa', sub: 'metentzefaloa + mielentzefaloa' }],
      note: 'Erronbentzefalotik: metentzefaloa (zubia bentralean, garuntxoa dortsalean) eta mielentzefaloa (erraboila: burmuina eta ornomuina lotzen ditu)',
    },
    {
      cam: SIDEV(10, 3.6, 0.1),
      fit: false,
      glide: 0.06,
      dim: ['ornomuina', 'hodi-neurala'],
      names: [
        { id: 'ornomuina', text: 'Lepotik kaudalera', sub: 'hodia ixten da: ornomuina' },
        { id: 'hodi-neurala', small: true, from: 0.3 },
      ],
      note: 'Atzekaldean, lepotik alde kaudalera, hodia ixten da eta hodi izaten jarraitzen du: ornomuina',
    },
  ],
};
export const Three19 = poseStage19(specThree, build);

// ———————————————————————— Bost xixkuak eta tolespenak (6) ————————————————————————

export const S_FIVE = [0, 0.18, 0.38, 0.56, 0.72, 0.86] as const;
const specFive: StageSpec<NeuralPose, NeuralOpts> = {
  S: S_FIVE,
  pose: endPose(specThree).pose,
  opts: {},
  site: SITE19B.neural,
  arrive: 'Hodi bera: 28. egunetik 5. astera',
  caption: CAP_SIDE,
  key: [
    { color: '#a9c8f7', text: 'telentzefaloa' },
    { color: '#5a86e0', text: 'dientzefaloa' },
    { color: '#72c27a', text: 'mesentzefaloa' },
    { color: '#f3b08e', text: 'metentzefaloa / mielentzefaloa' },
  ],
  steps: [
    {
      to: { flex: 0.6 },
      run: [0.05, 0.9],
      cam: SIDEV(8.5, 4.6, 0.6),
      fit: false,
      glide: 0.06,
      dim: ['tolespen-zefalikoa', 'tolespen-zerbikala'],
      names: [
        { id: 'tolespen-zefalikoa', text: 'Tolespen zefalikoa', sub: 'mesentzefalo mailan', from: 0.4 },
        { id: 'tolespen-zerbikala', text: 'Tolespen zerbikala', sub: 'lepokoa', from: 0.55 },
      ],
      note: 'Enbrioia tolesten hasten da: 28. egunean 2 tolespen nagusi, zefalikoa (mesentzefaloaren inguruan) eta zerbikala (erronbentzefaloa-ornomuina mugan)',
      plainNote: 'Enbrioia tolesten hasten da: 28. egunean 2 tolespen nagusi garatzen dira burmuinaren mailan',
    },
    {
      to: { five: 1 },
      run: [0.05, 0.9],
      cam: SIDEV(6.5, 5.0, 0.8, 70, 10),
      fit: false,
      glide: 0.06,
      dim: ['telentzefaloa', 'dientzefaloa', 'metentzefaloa', 'mielentzefaloa'],
      names: [
        { id: 'telentzefaloa', from: 0.4 },
        { id: 'dientzefaloa', from: 0.5 },
        { id: 'metentzefaloa', from: 0.6 },
        { id: 'mielentzefaloa', from: 0.7 },
      ],
      note: '5. astean makurtuago: prosentzefalotik telentzefaloa eta dientzefaloa; hasieran dientzefaloa handiagoa, gero telentzefaloa askoz handiagoa',
    },
    {
      cam: SIDEV(6.5, 4.6, 0.6, 100, 8),
      fit: false,
      glide: 0.05,
      dim: ['metentzefaloa', 'mielentzefaloa', 'mesentzefaloa'],
      names: [
        { id: 'mesentzefaloa', text: 'Mesentzefaloa', sub: 'berdin', small: true },
        { id: 'metentzefaloa', text: 'Metentzefaloa', sub: 'atzean: zerebeloaren irtengunea', from: 0.25 },
        { id: 'mielentzefaloa', text: 'Mielentzefaloa', sub: 'ornomuina lotzen du', from: 0.45 },
      ],
      note: 'Mesentzefaloa berdin; erronbentzefalotik metentzefaloa eta mielentzefaloa (ornomuina lotzen du); metentzefaloaren atzean zerebeloaren irtengunea',
    },
    {
      cam: SIDEV(4.2, 5.2, 0.6),
      fit: false,
      glide: 0.05,
      dim: ['istmoa-entzefaloa'],
      names: [{ id: 'istmoa-entzefaloa', text: 'Istmoa', sub: 'mesentzefalo eta metentzefaloaren artean: estutasuna' }],
      note: 'Mesentzefaloaren eta metentzefaloaren artean istmoa sortzen da: estutasun bat',
    },
    {
      to: { flex: 1 },
      run: [0.05, 0.8],
      cam: SIDEV(6.5, 4.8, 0.9),
      fit: false,
      glide: 0.05,
      dim: ['metentzefaloa', 'zubi-tolespena'],
      names: [
        { id: 'metentzefaloa', small: true, from: 0.15 },
        { id: 'zubi-tolespena', text: 'Zubi tolespena', sub: 'hemen zubia eratzen da', from: 0.4 },
      ],
      note: 'Garapenarekin tolespen berri bat agertzen da: zubi tolespena; hemen zubia eratzen da',
    },
    {
      cam: SIDEV(8, 4.7, 0.6),
      fit: false,
      glide: 0.06,
      dim: ['tolespen-zefalikoa', 'tolespen-zerbikala'],
      names: [
        { id: 'tolespen-zefalikoa', text: 'Tolespen zefalikoa', sub: 'mesentzefaloaren mailan' },
        { id: 'tolespen-zerbikala', text: 'Tolespen zerbikala', sub: 'erraboilaren mailan', from: 0.3 },
      ],
      note: 'Tolespen zefalikoa eta tolespen zerbikala mantendu egiten dira, mesentzefaloaren eta erraboilaren mailetan',
    },
  ],
};
export const Five19 = poseStage19(specFive, build);

// ———————————————————————— class 31 (topic 21), reshaped since for class 32: the scenes as its steps were written ————————————————————————

export const S_PLATE31 = [0, 0.26, 0.5, 0.76] as const;
const specPlate31: StageSpec<NeuralPose, NeuralOpts> = {
  S: S_PLATE31,
  pose: { ...NP0 },
  opts: {},
  site: SITE19B.neural,
  arrive: 'Hasierara: 3. astea, plaka neurala, atzetik',
  caption: CAP_DORSAL,
  key: KEY19.crest,
  steps: [
    {
      to: { fold: 0.55 },
      run: [0.15, 0.9],
      cam: DORSAL(13.5, 3.2, 200, 14),
      fit: false,
      glide: 0.06,
      dim: ['plaka-neurala', 'hodi-neurala'],
      names: [{ id: 'plaka-neurala', text: 'Plaka neurala', sub: 'aldeak tolesten dira' }],
      note: 'Hasieran plaka bat da: plakaren aldeak tolestu egiten dira, erdikaldean fusionatu arte',
    },
    {
      to: { fold: 0.9 },
      run: [0.05, 0.7],
      cam: DORSAL(6.5, 3.2, 205, 18),
      fit: false,
      glide: 0.05,
      dim: ['gandor-neurala'],
      names: [
        { id: 'gandor-neurala', text: 'Gandor neurala', sub: 'tolesduren muturretan', from: 0.3 },
        { id: 'tolesdura-neuralak', small: true, from: 0.45 },
      ],
      note: 'Tolespen gandorren muturretan zelula bereziak eratzen dira, gandor neuralekoak: batzuk migratu egiten dute, beste batzuk ez',
    },
    {
      to: { fold: 1, zip: 0.62 },
      run: [0.05, 0.9],
      cam: DORSAL(14.5, 3.3, 200, 14),
      fit: false,
      glide: 0.05,
      dim: ['hodi-neurala', 'neuroporo-kraneala', 'neuroporo-kaudala'],
      names: [
        { id: 'hodi-neurala', text: 'Fusioa erdian hasten da', sub: 'hodi neurala' },
        { id: 'neuroporo-kraneala', text: 'Aurreko neuroporoa', from: 0.5 },
        { id: 'neuroporo-kaudala', text: 'Atzeko neuroporoa', from: 0.6 },
      ],
      note: 'Fusioa erdi mailan hasten da, atzean eta aurrean neuroporoak utziz',
    },
    {
      to: { zip: 1 },
      run: [0.05, 0.9],
      cam: DORSAL(14.5, 3.3, 200, 14),
      fit: false,
      glide: 0.05,
      dim: ['neuroporo-kaudala', 'neuroporo-kraneala'],
      names: [
        { id: 'neuroporo-kaudala', text: 'Atzekoa: 25. eguna', sub: 'lehenago ixten da' },
        { id: 'neuroporo-kraneala', text: 'Aurrekoa: 28. eguna', from: 0.4 },
      ],
      note: 'Atzeko neuroporoa 25. egunean ixten da eta aurrekoa 28. egunean: atzekoa arinago',
      plainNote: 'Atzeko neuroporoa aurrekoa baino arinago ixten da',
      plainNames: [
        { id: 'neuroporo-kaudala', text: 'Atzekoa', sub: 'lehenago ixten da' },
        { id: 'neuroporo-kraneala', text: 'Aurrekoa', from: 0.4 },
      ],
      warn: true,
    },
  ],
};
export const Plate31 = poseStage19(specPlate31, build);

export const S_FIVE31 = [0, 0.18, 0.38, 0.56, 0.72, 0.86] as const;
const specFive31: StageSpec<NeuralPose, NeuralOpts> = {
  S: S_FIVE31,
  pose: endPose(specThree).pose,
  opts: {},
  site: SITE19B.neural,
  arrive: 'Hodi bera: 28. egunetik 5. astera',
  caption: CAP_SIDE,
  key: [
    { color: '#a9c8f7', text: 'telentzefaloa' },
    { color: '#5a86e0', text: 'dientzefaloa' },
    { color: '#72c27a', text: 'mesentzefaloa' },
    { color: '#f3b08e', text: 'metentzefaloa / mielentzefaloa' },
  ],
  steps: [
    {
      to: { flex: 0.6 },
      run: [0.05, 0.9],
      cam: SIDEV(8.5, 4.6, 0.6),
      fit: false,
      glide: 0.06,
      dim: ['tolespen-zefalikoa', 'tolespen-zerbikala'],
      names: [
        { id: 'tolespen-zefalikoa', text: 'Tolespen zefalikoa', sub: 'mesentzefalo mailan', from: 0.4 },
        { id: 'tolespen-zerbikala', text: 'Tolespen zerbikala', sub: 'lepokoa', from: 0.55 },
      ],
      note: '28. egunean 3 xixkuen artean bi tolespen: zefalikoa mesentzefalo mailan eta zerbikala (lepokoa) erronbentzefalo mailan',
    },
    {
      to: { five: 1 },
      run: [0.05, 0.9],
      cam: SIDEV(6.5, 5.0, 0.8, 70, 10),
      fit: false,
      glide: 0.06,
      dim: ['telentzefaloa', 'dientzefaloa', 'metentzefaloa', 'mielentzefaloa'],
      names: [
        { id: 'telentzefaloa', from: 0.4 },
        { id: 'dientzefaloa', from: 0.5 },
        { id: 'metentzefaloa', from: 0.6 },
        { id: 'mielentzefaloa', from: 0.7 },
      ],
      note: '5. astean prosentzefalotik telentzefaloa eta dientzefaloa; mesentzefaloa berdin; erronbentzefalotik metentzefaloa eta mielentzefaloa',
    },
    {
      to: { flex: 1 },
      run: [0.05, 0.8],
      cam: SIDEV(6.5, 4.8, 0.9),
      fit: false,
      glide: 0.05,
      dim: ['metentzefaloa', 'zubi-tolespena'],
      names: [
        { id: 'metentzefaloa', text: 'Garuntxoa eta zubia', sub: 'eratzen hasiak' },
        { id: 'zubi-tolespena', text: 'Zubi tolespena', sub: 'alde bentralean', from: 0.5 },
      ],
      note: 'Garuntxoa eratzen hasia dago eta haren aurrean zubia; tolespen gehiago: zubi tolespena, metentzefalo mailan',
      plainNames: [
        { id: 'metentzefaloa', text: 'Garuntxoa eta zubia', sub: 'eratzen hasiak' },
        { id: 'zubi-tolespena', text: 'Zubi tolespena', sub: 'zubian (metentzefaloa)', from: 0.5 },
      ],
    },
    {
      cam: SIDEV(4.2, 5.2, 0.6),
      fit: false,
      glide: 0.05,
      dim: ['istmoa-entzefaloa'],
      names: [{ id: 'istmoa-entzefaloa', text: 'Istmoa', sub: 'mesentzefalo eta metentzefaloaren artean: estutzea' }],
      note: 'Mesentzefaloaren eta metentzefaloaren arteko muga estutu egiten da: istmoa, genetikoki oso garrantzitsua',
    },
    {
      cam: SIDEV(7, 4.9, 0.8),
      fit: false,
      glide: 0.05,
      dim: ['entzefaloa'],
      names: [{ id: 'entzefaloa', text: 'Espazio mugatua', sub: 'egiturak tolestu egiten dira' }],
      note: 'Barneko egiturak handitzen dira baina espazioa mugatua da: bihurri edo tolestu egin behar dute',
    },
    {
      cam: SIDEV(7.5, 4.7, 0.6),
      fit: false,
      glide: 0.05,
      dim: ['entzefaloa', 'ornomuina'],
      names: [
        { id: 'dientzefaloa', text: 'Barrunbeak', sub: 'likido zefalorrakideoz beteta, komunikatuta' },
        { id: 'entzefaloa', small: true, from: 0.3 },
      ],
      note: 'Xixkuak zakuak dira: barrunbea dute, likido zefalorrakideoz beteta, eta ornomuinaren barnearekin komunikatuta',
    },
  ],
};
export const Five31 = poseStage19(specFive31, build);

// ———————————————————————— class 31 (topic 21): the scenes as its notes go ————————————————————————

export const S_THREE31 = [0, 0.2, 0.42, 0.6, 0.8] as const;
const specThree31: StageSpec<NeuralPose, NeuralOpts> = {
  S: S_THREE31,
  pose: endPose(specPlate31).pose,
  opts: {},
  site: SITE19B.neural,
  arrive: 'Hodi bera, ezkerretik: buru aldea zabaltzen da',
  caption: CAP_SIDE,
  key: KEY19.vesicles,
  steps: [
    {
      to: { three: 1, tint: 1 },
      run: [0.1, 0.9],
      cam: SIDEV(9.5, 4.2, 0.2),
      fit: false,
      glide: 0.08,
      dim: ['prosentzefaloa', 'mesentzefaloa', 'erronbentzefaloa'],
      names: [
        { id: 'prosentzefaloa', from: 0.3 },
        { id: 'mesentzefaloa', from: 0.4 },
        { id: 'erronbentzefaloa', from: 0.5 },
      ],
      note: 'Alde kranealean hodiak hodi forma galtzen du eta xixkuak eratzen dira: hasieran 3 xixku (zakuak, likido zefalorrakideoaz)',
    },
    {
      cam: SIDEV(4.6, 5.6, 0.3),
      fit: false,
      glide: 0.05,
      dim: ['prosentzefaloa'],
      names: [{ id: 'prosentzefaloa', text: 'Prosentzefaloa', sub: 'aurrekoa: telentzefaloa + dientzefaloa' }],
      note: 'Prosentzefaloa, aurrekoa: telentzefaloa (garun kortexa, hemisferioak) eta dientzefaloa (epitalamoa, talamoa, hipotalamoa, azpitalamoa)',
    },
    {
      cam: SIDEV(4.4, 5.25, 0.3),
      fit: false,
      glide: 0.05,
      dim: ['mesentzefaloa'],
      names: [{ id: 'mesentzefaloa', text: 'Mesentzefaloa', sub: 'tartekoa: mesentzefalo izaten jarraitzen du' }],
      note: 'Mesentzefaloa, tartekoa: mesentzefalo izaten jarraitzen du, ez da ezer eratzen bertatik',
    },
    {
      cam: SIDEV(4.8, 4.6, 0.2),
      fit: false,
      glide: 0.05,
      dim: ['erronbentzefaloa'],
      names: [{ id: 'erronbentzefaloa', text: 'Erronbentzefaloa', sub: 'metentzefaloa + mielentzefaloa' }],
      note: 'Erronbentzefaloa: metentzefaloa (zubia, garuntxoa) eta mielentzefaloa (erraboila, ornomuinarekin kontaktuan)',
    },
    {
      cam: SIDEV(10, 3.6, 0.1),
      fit: false,
      glide: 0.06,
      dim: ['ornomuina', 'hodi-neurala'],
      names: [
        { id: 'ornomuina', text: 'Alde kaudala', sub: 'hodia izaten jarraitzen du: ornomuina' },
        { id: 'hodi-neurala', small: true, from: 0.3 },
      ],
      note: '3 xixkuak alde zefalikoan bakarrik eratzen dira; alde kaudalean, ornomuina garatuko den tokian, hodiak hodi izaten jarraitzen du',
    },
  ],
};
export const Three31 = poseStage19(specThree31, build);
