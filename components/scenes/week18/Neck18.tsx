'use client';

import { BACK, FRONT, TISSUE, poseStage18, type StageSpec } from '@/components/scenes/week17/common';
import { END_SINUS } from './Clefts18';
import type { PharynxBOpts } from './pharynx-b';
import { pharynxD } from './pharynx-d';
import { POUCH, type PharynxPose } from './pharynx-model';
import { SITE18 } from './sites';
import { SITE18B, WHERE18B } from './sites-b';
import { NECK_COLOR, NP0, neckModel, type NeckOpts, type NeckPose } from './neck-model';

/**
 * Topic 18's neck glands: their way down on the root pharynx (pharynx-d.ts, notes 1.2) and the grown neck
 * (neck-model.ts: the mature thyroid round topic 17's larynx, notes 3). From behind the embryo's left is on the
 * viewer's left.
 */

const build = (pose: NeckPose, opts: NeckOpts) => neckModel(pose, opts);
// The same colours as the descent on the pharynx (above): a gland keeps its pouch's colour into the grown neck.
const KEY = [
  { color: NECK_COLOR.thyroid, text: 'tiroidea' },
  { color: NECK_COLOR.thymus, text: '3. poltsatik' },
  { color: POUCH.p4, text: '4. poltsatik' },
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
      // Run on from the persistent sinus: its needle and fluid go at once (first quarter), with the walls.
      to: { persist: 0, fluid: 0, needle: 0, peelL: 1, peelR: 1 },
      run: [0, 0.25],
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
      // From in front and above: the isthmus before the cartilages, a lobe at each side, the U open behind.
      cam: BACK(7.6, [0, -3.75, 0.7], 332, 34),
      caption: 'Lepoa aurretik eta goitik (3D eredua): tiroidearen U-a laringeko kartilagoen inguruan',
      key: [
        { color: '#d98068', text: 'tiroidea' },
        { color: TISSUE.cartilage, text: 'laringeko kartilagoak' },
        { color: POUCH.p3, text: '3. poltsatik' },
        { color: POUCH.p4, text: '4. poltsatik' },
      ],
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
const front = (dist: number, y: number, yaw = 0, elev = 5) => FRONT(dist, [0, y, 0.4], yaw, elev);
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
      cam: front(10, -0.6, 22, 6),
      glide: 0.06,
      dim: ['tiroide-lobuluak', 'laringeko-kartilagoak'],
      names: [
        { id: 'tiroide-lobuluak', text: 'Bi lobulu', sub: 'eskuinekoa eta ezkerrekoa · luzangak' },
        { id: 'laringeko-kartilagoak', sub: 'lobuluek besarkatzen dituzte', from: 0.3 },
      ],
      note: 'Tiroideak bi lobulu ditu, eskuinekoa eta ezkerrekoa: luzangak, laringeko kartilagoak besarkatzen dituzte',
    },
    {
      cam: front(8.4, -1.6, 0, 4),
      glide: 0.05,
      dim: ['tiroide-istmoa', 'tiroide-lobuluak'],
      names: [{ id: 'tiroide-istmoa', sub: 'lobuluak aurretik lotzen ditu' }],
      note: 'Aurretik eremu estu batek lotzen ditu: istmoa',
    },
    {
      cam: BACK(9.4, [0, -0.9, 0], 180, 6),
      glide: 0.12,
      dim: ['goiko-paratiroidea', 'beheko-paratiroidea', 'tiroide-lobuluak'],
      names: [
        { id: 'goiko-paratiroidea', sub: 'bi: goian', from: 0.2 },
        { id: 'beheko-paratiroidea', sub: 'bi: behean', from: 0.35 },
      ],
      note: 'Eredua atzera biratu dugu: atzetik lobuluak ez daude lotuta, eta han daude lau paratiroideak, bi goian eta bi behean',
      plainNote: '7. astean tiroidea helduta: behin betiko kokapena eta itxura. Jaio aurreko 3. hilabetean funtzionala',
      plainNames: [
        { id: 'tiroide-lobuluak', text: 'Tiroidea', sub: '7. astean helduta' },
      ],
      plainDim: ['tiroide-lobuluak', 'tiroide-istmoa'],
    },
    {
      to: { pyramid: 1 },
      run: [0.3, 0.85],
      cam: front(9, -0.8, -16, 4),
      glide: 0.1,
      dim: ['piramide-lobulua', 'tiroide-istmoa'],
      names: [{ id: 'piramide-lobulua', sub: 'hodi tiroglosoaren azken atala · arazorik gabe', from: 0.55 }],
      note: 'Askotan (%50 edo gehiago) anomalia: piramide itxurako lobulua, hodi tiroglosoaren azken atala ondo endekatzen ez bada. Ez du arazorik ematen',
    },
    {
      to: { involute: 1 },
      run: [0.4, 0.92],
      cam: front(13, -2.4, 12, 6),
      glide: 0.06,
      dim: ['timoa', 'tiroide-lobuluak'],
      names: [{ id: 'timoa', sub: 'handia enbrioian · pubertarotik endekatu' }],
      note: 'Timoa lepora jaisten da, tiroidearen azpian geratzen da. Handia enbrioian, pubertarora arte hazi; gero endekatzen doa',
    },
  ],
};
export const MatureThyroid18 = poseStage18(specMature, build);
