'use client';

import { ARCH, BACK, FRONT, TISSUE, endPose, poseStage18, type StageSpec } from '@/components/scenes/week17/common';
import { NP0, neckModel, type NeckOpts, type NeckPose } from './neck-model';

/**
 * Topic 18's neck glands (neck-model.ts): the thymus and the parathyroids going down (notes 1.2) and the mature
 * thyroid (notes 3). From behind the embryo's left is on the viewer's left.
 */

const build = (pose: NeckPose, opts: NeckOpts) => neckModel(pose, opts);
const KEY = [
  { color: ARCH.iii, text: '3. poltsatik' },
  { color: ARCH.iv, text: '4. poltsatik' },
  { color: '#b23c56', text: 'tiroidea' },
  { color: TISSUE.cartilage, text: 'kartilagoak' },
];
const CAP_BACK = 'Lepoa atzetik (3D eredua): enbrioiaren ezkerra zure ezkerrean';
const CAP_FRONT = 'Lepoa aurretik eta atzetik (3D eredua)';

// ———————————————————————————— Guruinen jaisketa (1.2) ————————————————————————————

export const SD = [0, 0.26, 0.6, 0.8] as const;
const cam1 = (dist: number, y: number, yaw = 180, elev = 6) => BACK(dist, [0, y, 0], yaw, elev);

const specDown: StageSpec<NeckPose, NeckOpts> = {
  S: SD,
  pose: NP0,
  opts: { back: true },
  caption: CAP_BACK,
  key: KEY,
  map: 'neck',
  steps: [
    {
      cam: cam1(9.5, 0.9, 188),
      glide: 0.06,
      dim: ['hirugarren-poltsa', 'laugarren-poltsa', 'timoa', 'beheko-paratiroidea', 'goiko-paratiroidea'],
      names: [
        { id: 'timoa', sub: '3. poltsa' },
        { id: 'beheko-paratiroidea', sub: '3. poltsa: goian hasten da', from: 0.2 },
        { id: 'goiko-paratiroidea', sub: '4. poltsa: behean hasten da', from: 0.4 },
      ],
      note: 'Hasieran 3. poltsakoa GORAGO dago: timoa eta beheko paratiroidea. 4. poltsakoa, goiko paratiroidea, beherago',
    },
    {
      to: { down: 0.72, sup: 0.6 },
      run: [0.06, 0.94],
      cam: cam1(11, -0.3, 184),
      glide: 0.08,
      dim: ['timoa', 'beheko-paratiroidea', 'goiko-paratiroidea'],
      names: [
        { id: 'timoa', sub: 'behera eta erdialdera', from: 0.1 },
        { id: 'beheko-paratiroidea', sub: 'timoak arrastatzen du', from: 0.3 },
        { id: 'goiko-paratiroidea', sub: 'ia ez da mugitzen', from: 0.5 },
      ],
      note: 'Timoa bi aldeetan eratzen da eta erdialdera jaisten da: 3. poltsako paratiroidea berekin darama, 4. poltsakoaren ondotik pasatuz',
    },
    {
      to: { down: 1, sup: 1 },
      run: [0.05, 0.75],
      cam: cam1(8.5, -0.45, 186),
      glide: 0.06,
      dim: ['beheko-paratiroidea', 'goiko-paratiroidea', 'tiroide-guruina', 'tiroide-lobuluak'],
      names: [
        { id: 'goiko-paratiroidea', text: 'Goiko paratiroidea', sub: '4. poltsatik' },
        { id: 'beheko-paratiroidea', text: 'Beheko paratiroidea', sub: '3. poltsatik', from: 0.3 },
      ],
      note: 'Gurutzatu dira: 3. poltsakoa azpian geratu da, 4. poltsakoa gainean. Izena amaierako lekutik dator, ez jatorritik',
      warn: true,
    },
    {
      to: { adult: 1 },
      run: [0.05, 0.75],
      cam: cam1(8, -0.2, 208, 12),
      glide: 0.06,
      dim: ['tiroide-lobuluak', 'laringeko-kartilagoak', 'beheko-paratiroidea', 'goiko-paratiroidea'],
      names: [
        { id: 'tiroide-lobuluak', text: 'Tiroide guruina', sub: 'U forma: atzetik irekita' },
        { id: 'laringeko-kartilagoak', sub: 'aurretik inguratuta', from: 0.3 },
      ],
      note: 'Tiroideak U forma du: aurretik laringeko kartilagoak inguratzen ditu, atzetik irekita. Atzeko lau muturretan lau paratiroide',
    },
  ],
};
export const GlandDescent18 = poseStage18(specDown, build);

// ———————————————————————————— Tiroide heldua (3) ————————————————————————————

export const SM = [0, 0.18, 0.38, 0.6, 0.8] as const;
const front = (dist: number, y: number, yaw = 0, elev = 5) => FRONT(dist, [0, y, 0], yaw, elev);

const specMature: StageSpec<NeckPose, NeckOpts> = {
  S: SM,
  pose: endPose(specDown).pose,
  opts: {},
  caption: CAP_FRONT,
  key: KEY,
  map: 'thyroid',
  steps: [
    {
      cam: front(8.5, -0.2, 18),
      glide: 0.06,
      dim: ['tiroide-lobuluak', 'laringeko-kartilagoak'],
      names: [
        { id: 'tiroide-lobuluak', text: 'Bi lobulu', sub: 'eskuinekoa eta ezkerrekoa · luzangak' },
        { id: 'laringeko-kartilagoak', sub: 'lobuluek besarkatzen dituzte', from: 0.3 },
      ],
      note: 'Tiroideak bi lobulu ditu, eskuinekoa eta ezkerrekoa: luzangak, laringeko kartilagoak besarkatzen dituzte',
    },
    {
      cam: front(7, -0.55, 0, 3),
      glide: 0.05,
      dim: ['tiroide-istmoa', 'tiroide-lobuluak'],
      names: [{ id: 'tiroide-istmoa', sub: 'lobuluak aurretik lotzen ditu' }],
      note: 'Aurretik eremu estu batek lotzen ditu: istmoa',
    },
    {
      cam: BACK(7.5, [0, -0.35, 0], 180, 6),
      glide: 0.12,
      dim: ['goiko-paratiroidea', 'beheko-paratiroidea', 'tiroide-lobuluak'],
      names: [
        { id: 'goiko-paratiroidea', sub: 'bi: goian', from: 0.2 },
        { id: 'beheko-paratiroidea', sub: 'bi: behean', from: 0.35 },
      ],
      note: 'Eredua atzera biratu dugu: atzetik lobuluak ez daude lotuta, eta han daude lau paratiroideak, bi goian eta bi behean',
    },
    {
      to: { pyramid: 1 },
      run: [0.3, 0.85],
      cam: front(7, -0.2, -12, 4),
      glide: 0.1,
      dim: ['piramide-lobulua', 'tiroide-istmoa'],
      names: [{ id: 'piramide-lobulua', sub: 'hodi tiroglosoaren azken atala · arazorik gabe', from: 0.55 }],
      note: 'Askotan (%50 edo gehiago) anomalia: piramide itxurako lobulua, hodi tiroglosoaren azken atala ondo endekatzen ez bada. Ez du arazorik ematen',
    },
    {
      to: { involute: 1 },
      run: [0.4, 0.92],
      cam: front(10, -1.5, 10, 6),
      glide: 0.06,
      dim: ['timoa', 'tiroide-lobuluak'],
      names: [{ id: 'timoa', sub: 'handia enbrioian · pubertarotik endekatu' }],
      note: 'Timoa lepora jaisten da, tiroidearen azpian geratzen da. Handia enbrioian, pubertarora arte hazi; gero endekatzen doa',
    },
  ],
};
export const MatureThyroid18 = poseStage18(specMature, build);
