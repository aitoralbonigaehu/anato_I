'use client';

import { orbit, poseStage17, TISSUE, type StageSpec } from './common';
import type { V3 } from '@/lib/three-d/math';
import { BA0, OC, OS0, baseModel, ossModel, type BaseOpts, type BasePose, type OssPose } from './base-model';

/**
 * Notes 1 (the two ossifications, side by side on one clock) and 1.1 (the chondrocranium, seen from above with the
 * cartilages on the viewer's right and their bones on the left, as in the notes' figure on p.2).
 */

// ———————————————————————————— Bi hezurtze motak ————————————————————————————

const TABLE = (yaw = 0, elev = -34, dist = 15, target: V3 = [0, 0, 0]) => orbit(yaw, elev, dist, target, [0, 0]);
const KEY_OSS = [
  { color: TISSUE.mes, text: 'mesenkima' },
  { color: TISSUE.cartilage, text: 'kartilagoa' },
  { color: OC.osteoblast, text: 'osteoblastoak' },
  { color: TISSUE.bone, text: 'hezurra' },
] as const;
const AXES_TABLE = {
  up: 'atzealdea',
  front: 'gainaldea',
  side: 'eskuina',
  sideDir: [1, 0, 0] as V3,
  edges: { up: 'Atzealdea', down: 'Aurrealdea', front: 'Gainaldea', back: 'Azpialdea', side: 'Eskuina', otherSide: 'Ezkerra' },
};
const BLOCK_L = { id: 'mintzezko-hezurtzapena', text: 'Mintzezko hezurtzea', sub: 'mesenkima → hezurra' };
const BLOCK_R = { id: 'hezurtzapen-endokondrala', text: 'Hezurtze endokondrala', sub: 'mesenkima → kartilagoa → hezurra' };

export const S_OSS = [0, 0.18, 0.4, 0.62, 0.84] as const;

const specOss: StageSpec<OssPose, BaseOpts> = {
  S: S_OSS,
  pose: OS0,
  opts: {},
  map: 'skull',
  caption: 'Bi ehun bloke, ondoz ondo eta erloju berean: ezkerrean hezur laua, eskuinean oinaldeko hezurra',
  key: KEY_OSS,
  axes: AXES_TABLE,
  steps: [
    {
      cam: TABLE(0, -36, 15),
      fit: false,
      glide: 0.06,
      names: [BLOCK_L, BLOCK_R, { id: 'mesenkima', p: 'mesenkima-l', key: 'mes-l', sub: 'hasieran bietan berdin', from: 0.35 }],
      note: 'Bi hezurtze mota daude. Bietan abiapuntua bera da: mesenkima',
    },
    {
      to: { gather: 1, spic: 1, flat: 0.25, cart: 1 },
      run: [0.06, 0.92],
      cam: TABLE(-5, -38, 14),
      fit: false,
      glide: 0.05,
      dim: ['osteoblastoak', 'hezur-espikulak', 'kartilago-eredua', 'kondrozitoak'],
      names: [
        BLOCK_L,
        BLOCK_R,
        { id: 'osteoblastoak', sub: 'zuzenean, kartilagorik gabe', from: 0.15 },
        { id: 'hezur-espikulak', from: 0.45 },
        { id: 'kartilago-eredua', text: 'Kartilagoa', sub: 'hezurraren eredua', from: 0.3 },
        { id: 'kondrozitoak', from: 0.6 },
      ],
      note: 'Ezkerrean mesenkima zuzenean hezur bihurtzen hasi da. Eskuinean mesenkimak lehenago kartilagoa eratu du',
    },
    {
      to: { flat: 1, hyper: 1 },
      run: [0.05, 0.75],
      cam: TABLE(-16, -40, 12.5, [-1.4, 0, 0]),
      fit: false,
      glide: 0.05,
      dim: ['hezur-lauak', 'osteoblastoak'],
      names: [
        BLOCK_L,
        BLOCK_R,
        { id: 'hezur-lauak', text: 'Hezur laua', sub: 'azkar: dagoeneko bukatuta', from: 0.3 },
        { id: 'kartilago-eredua', text: 'Kartilagoa', sub: 'oraindik ez da hezurtu', from: 0.5 },
      ],
      note: 'Mintzezko hezurtzea azkarragoa da: urrats bakarra, mesenkimatik zuzenean hezurra. Eskuinekoa oraindik kartilagoa da',
    },
    {
      to: { bone: 0.62 },
      run: [0.05, 0.92],
      cam: TABLE(14, -40, 12.5, [1.5, 0, 0]),
      fit: false,
      glide: 0.05,
      dim: ['hezur-endokondrala', 'kondrozitoak', 'osteoblastoak'],
      names: [
        BLOCK_R,
        { id: 'kondrozitoak', sub: 'kartilagoan', from: 0.1 },
        { id: 'osteoblastoak', p: 'osteoblastoak-r', key: 'ost-r', sub: 'kondrozitoak bihurtuta', from: 0.35 },
        { id: 'hezur-endokondrala', text: 'Hezurra', sub: 'erditik muturretara', from: 0.55 },
      ],
      note: 'Kartilagoa hezurtzen da: kondrozitoak osteoblasto bihurtzen dira, eta hezurra erditik muturretara zabaltzen da',
    },
    {
      to: { bone: 1 },
      run: [0.04, 0.6],
      cam: TABLE(0, -36, 15),
      fit: false,
      glide: 0.05,
      dim: ['hezur-lauak', 'hezur-endokondrala'],
      names: [
        BLOCK_L,
        BLOCK_R,
        { id: 'hezur-lauak', text: 'Hezur lauak', sub: 'parietalak, okzipitalaren ezkata, aurpegikoak' },
        { id: 'hezur-endokondrala', text: 'Oinaldeko hezur gehienak', sub: 'prozesu luze eta geldoa', from: 0.2 },
      ],
      note: 'Azkenean biak hezur dira. Hezur lauak azkar; kraneoaren oinaldekoak, kartilagotik igarota, geldo',
    },
  ],
};

export const Ossification17 = poseStage17(specOss, (pose, opts) => ossModel(pose, opts));

// ———————————————————————————— Kondrokraneoa ————————————————————————————

const ABOVE = (yaw = 0, elev = -16, dist = 11.5, target: V3 = [0, 0, 0]) => orbit(yaw, elev, dist, target, [0, 0]);
const KEY_BASE = [
  { color: TISSUE.cartilage, text: 'kartilagoa' },
  { color: TISSUE.bone, text: 'hezurra' },
] as const;
const AXES_ABOVE = {
  up: 'aurrealdea',
  front: 'goitik',
  side: 'eskuina',
  sideDir: [1, 0, 0] as V3,
  edges: { up: 'Aurrealdea', down: 'Atzealdea', front: 'Goitik', back: 'Behetik', side: 'Eskuina', otherSide: 'Ezkerra' },
};
const CARTS_MID = ['esklerotoma-okzipitalak', 'kartilago-parakordalak', 'hipofisi-kartilagoak', 'trenkada-kranialak'];
const CARTS_SIDE = ['kapsula-periotikoa', 'hego-tenporala', 'begizulo-hegoa'];
const N_SCL = { id: 'esklerotoma-okzipitalak', text: 'Esklerotoma okzipitalak' };
const N_PARA = { id: 'kartilago-parakordalak', text: 'Kartilago parakordala' };
const N_HYP = { id: 'hipofisi-kartilagoak', text: 'Hipofisi kartilagoa' };
const N_TRAB = { id: 'trenkada-kranialak', text: 'Trenkadatxo kranialak' };
const N_PERI = { id: 'kapsula-periotikoa', text: 'Kapsula periotikoa' };
const N_TEMP = { id: 'hego-tenporala', text: 'Hego tenporala' };
const N_ORB = { id: 'begizulo-hegoa', text: 'Begizulo hegoa' };
const N_ETH = { id: 'etmoidesa', text: 'Etmoides hezurra' };
const N_BODY = { id: 'esfenoidesaren-gorputza', text: 'Esfenoidesaren gorputza' };
const N_OCC = { id: 'okzipitalaren-oinaldea', text: 'Okzipitalaren oinaldea' };
const N_PETR = { id: 'harkaitza', text: 'Harkaitza' };
const N_GR = { id: 'esfenoidesaren-hego-handia', text: 'Esfenoidesaren hego handia' };
const N_LS = { id: 'esfenoidesaren-hego-txikia', text: 'Esfenoidesaren hego txikia' };
const N_SQ = { id: 'okzipitalaren-ezkata', text: 'Okzipitalaren ezkata' };

export const S_BASE = [0, 0.2, 0.4, 0.6, 0.8] as const;

const specBase: StageSpec<BasePose, BaseOpts> = {
  S: S_BASE,
  pose: BA0,
  opts: {},
  map: 'base',
  caption: 'Kraneoaren oinaldea goitik (ganga kenduta): aurrealdea goian. Ezkerrean hezurrak, eskuinean haien kartilagoak',
  key: KEY_BASE,
  axes: AXES_ABOVE,
  steps: [
    {
      to: { mid: 1 },
      run: [0.06, 0.9],
      cam: ABOVE(0, -22, 12),
      fit: false,
      glide: 0.06,
      dim: [...CARTS_MID],
      names: [
        { id: 'kondrokraneoa', text: 'Kondrokraneoa', sub: 'kartilagozko neurokraneoa' },
        { ...N_SCL, from: 0.1 },
        { ...N_PARA, from: 0.3 },
        { ...N_HYP, from: 0.5 },
        { ...N_TRAB, from: 0.72 },
      ],
      note: 'Hasieran kartilagozko lamina bat dago oinaldean: erdian, atzetik aurrera, kartilago hauek',
    },
    {
      to: { side: 1 },
      run: [0.06, 0.9],
      cam: ABOVE(10, -20, 12),
      fit: false,
      glide: 0.05,
      dim: [...CARTS_SIDE],
      names: [{ ...N_PERI, from: 0.1 }, { ...N_TEMP, from: 0.42 }, { ...N_ORB, from: 0.7 }],
      note: 'Alboetan: kapsula periotikoa eta bi hego. Atal bakoitzetik hezur-atal bat aterako da',
    },
    {
      to: { oMid: 1 },
      run: [0.06, 0.92],
      cam: ABOVE(-8, -16, 11.5, [-0.4, 0, 0]),
      fit: false,
      glide: 0.05,
      dim: ['esklerotoma-okzipitalak', 'kartilago-parakordalak', 'okzipitalaren-oinaldea', 'hipofisi-kartilagoak', 'esfenoidesaren-gorputza', 'trenkada-kranialak', 'etmoidesa'],
      names: [{ ...N_OCC, sub: 'parakordalak + esklerotomak', from: 0.12 }, { ...N_BODY, from: 0.45 }, { ...N_ETH, from: 0.55 }, N_SCL, N_PARA, N_HYP, N_TRAB],
      note: 'Hezurtze endokondrala erdiko ardatzean: kartilago bakoitza bere hezurra bihurtzen da (ezkerrean ikusten da)',
    },
    {
      to: { oSide: 1 },
      run: [0.06, 0.92],
      cam: ABOVE(-14, -18, 11.5, [-0.8, 0, 0]),
      fit: false,
      glide: 0.05,
      dim: ['kapsula-periotikoa', 'harkaitza', 'hego-tenporala', 'esfenoidesaren-hego-handia', 'begizulo-hegoa', 'esfenoidesaren-hego-txikia'],
      names: [{ ...N_PETR, from: 0.12 }, { ...N_GR, from: 0.45 }, { ...N_LS, from: 0.72 }, N_PERI, N_TEMP, N_ORB],
      note: 'Alboetan ere bai: kapsula periotikoa → harkaitza; hego tenporala → hego handia; begizulo hegoa → hego txikia',
    },
    {
      to: { squama: 1 },
      run: [0.05, 0.6],
      cam: ABOVE(0, -12, 12.5),
      fit: false,
      glide: 0.05,
      warn: true,
      names: [N_ETH, N_LS, N_GR, N_BODY, N_PETR, N_OCC, { ...N_SQ, sub: 'mintzezkoa, kartilagorik gabe' }, N_TRAB, N_ORB, N_TEMP, N_HYP, N_PARA, N_PERI, N_SCL],
      note: 'Apunteetako irudia osorik. Okzipitalaren ezkatak ez du kartilagorik izan: mintzezkoa da, nahiz eta oinaldearen ondoan egon',
    },
  ],
};

export const Chondrocranium17 = poseStage17(specBase, (pose, opts) => baseModel(pose, opts));
