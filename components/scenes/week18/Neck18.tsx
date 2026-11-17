'use client';

import { ARCH, BACK, FRONT, TISSUE, poseStage18, type StageSpec } from '@/components/scenes/week17/common';
import { END_SINUS } from './Clefts18';
import type { PharynxBOpts } from './pharynx-b';
import { pharynxD } from './pharynx-d';
import { POUCH, type PharynxPose } from './pharynx-model';
import { SITE18 } from './sites';
import { SITE18B, WHERE18B } from './sites-b';
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
const CAP_BACK = 'Faringe hestea eta lepoa atzetik, hormak kenduta (3D eredua): enbrioiaren ezkerra zure ezkerrean';
const CAP_FRONT = 'Lepoa aurretik eta atzetik (3D eredua)';

// ———————————————————————————— Guruinen jaisketa (1.2) ————————————————————————————
// Told on the topic's one pharyngeal gut (pharynx-d.ts): both walls peeled to the endoderm, the buds of the third and
// fourth pouches (seen budding two stages ago) go down, the neck growing longer under them.

export const SD = [0, 0.26, 0.6, 0.8] as const;
const down = (dist: number, y: number, yaw = 182, elev = 8, x = 0) => BACK(dist, [x, y, 0.35], yaw, elev);
const KEY_DOWN = [
  { color: POUCH.p3, text: '3. poltsatik' },
  { color: POUCH.p4, text: '4. poltsatik' },
  { color: '#d98068', text: 'tiroidea' },
  { color: TISSUE.endo, text: 'endodermoa' },
];

const specDown: StageSpec<PharynxPose, PharynxBOpts> = {
  where: WHERE18B.pharynx,
  site: SITE18.pharynx,
  arrive: 'Faringe bera, bi hormak kenduta: 3. eta 4. poltsetako kimuak, jaisteko prest',
  S: SD,
  pose: END_SINUS.pose,
  opts: END_SINUS.opts,
  caption: CAP_BACK,
  key: KEY_DOWN,
  map: 'neck',
  steps: [
    {
      to: { persist: 0, fluid: 0, needle: 0, peelL: 1, peelR: 1 },
      run: [0.04, 0.55],
      cam: down(10.5, -1.5),
      fit: false,
      glide: 0.06,
      dim: ['hirugarren-poltsa', 'laugarren-poltsa', 'timoa', 'beheko-paratiroidea', 'goiko-paratiroidea'],
      names: [
        { id: 'faringea', small: true, from: 0.2 },
        { id: 'timoa', sub: '3. poltsa', from: 0.35 },
        { id: 'beheko-paratiroidea', sub: '3. poltsa: goian hasten da', from: 0.45 },
        { id: 'goiko-paratiroidea', sub: '4. poltsa: behean hasten da', from: 0.55 },
      ],
      note: 'Hasieran 3. poltsakoa GORAGO dago: timoa eta beheko paratiroidea. 4. poltsakoa, goiko paratiroidea, beherago',
    },
    {
      to: { neck: 1, descend: 0.72, thyroid: 1 },
      run: [0.06, 0.94],
      cam: down(14, -2.9),
      fit: false,
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
      to: { descend: 1, meet: 1 },
      run: [0.05, 0.75],
      cam: down(9.5, -3.9, 186),
      fit: false,
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
      to: { cartil: 1, ubIn: 1 },
      run: [0.05, 0.75],
      cam: down(8.4, -3.7, 230, 24),
      fit: false,
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
export const GlandDescent18 = poseStage18(specDown, (pose, opts) => pharynxD(pose, opts));

// ———————————————————————————— Tiroide heldua (3) ————————————————————————————

export const SM = [0, 0.18, 0.38, 0.6, 0.8] as const;
const front = (dist: number, y: number, yaw = 0, elev = 5) => FRONT(dist, [0, y, 0], yaw, elev);
/** The neck model with everything down and grown (the descent itself is told on the pharynx, above). */
const MATURE0: NeckPose = { ...NP0, down: 1, sup: 1, adult: 1 };

const specMature: StageSpec<NeckPose, NeckOpts> = {
  site: SITE18B.neck,
  arrive: 'Ebaki sagitaletik lepo osora: guruina iritsi den lekua, aurretik',
  S: SM,
  pose: MATURE0,
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
