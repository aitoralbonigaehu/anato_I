'use client';

import { ARCH, BELOW, FRONT, SIDE, TISSUE, poseStage18, type StageSpec } from '@/components/scenes/week17/common';
import { CH0, PAL0, choanaModel, palateModel, type ChoanaPose, type PalateOpts, type PalatePose } from './palate-model';

/** Topic 18, notes 4.1 (the palate, the septum, the conchae, the choanae). Model: palate-model.ts. */

const KEY_PAL = [
  { color: ARCH.i, text: 'luzakin maxilarrak (I. arkua)' },
  { color: '#f6d95a', text: 'hasierako aho sabaia' },
  { color: '#d96a6a', text: 'mihia' },
] as const;

const CAP_BELOW = 'Aho sabaia behetik (3D eredua): ebakortzak goian, enbrioiaren ezkerra zure eskuinean';
const CAP_COR = 'Burua zeharka moztuta, aurretik (ebakidura koronala): enbrioiaren ezkerra zure eskuinean';
const CAP_SAG = 'Burua sudur-zuloan zehar moztuta, ezkerretik: aurpegia zure ezkerrean, faringea eskuinean';

const COR = (dist = 12.5, y = 0.1, yaw = 10, elev = 8) => FRONT(dist, [0, y, 0], yaw, elev);
const UNDER = (dist = 10.5, z = 0.1, yaw = 0, elev = -68) => BELOW(dist, [0, -0.2, z], yaw, elev);

// ———————————————————————————— Maxilar arteko segmentua ————————————————————————————

export const S_SEG = [0, 0.3, 0.55, 0.78] as const;
const specSeg: StageSpec<PalatePose, PalateOpts> = {
  map: 'palate',
  S: S_SEG,
  pose: { ...PAL0, whole: 1, jaw: 1, swing: 1, grow: 0, seg: 0, sept: 0, fuse: 0 },
  opts: {},
  caption: CAP_BELOW,
  key: KEY_PAL.slice(0, 2),
  keyTitle: 'Kolorea = jatorria',
  steps: [
    {
      to: { seg: 1 },
      run: [0.15, 0.75],
      cam: UNDER(11),
      glide: 0.06,
      dim: ['luzapen-maxilarra', 'maxilar-arteko-segmentua'],
      names: [
        { id: 'luzapen-maxilarra', text: 'Luzakin maxilarrak', sub: 'alde bietan' },
        { id: 'maxilar-arteko-segmentua', sub: 'ertz medialak fusionatuta', from: 0.55 },
      ],
      note: 'Luzakin maxilarren artean, ertz medialak erdian fusionatu: maxilar arteko segmentua',
    },
    {
      cam: UNDER(8.5, 1.0),
      glide: 0.05,
      dim: ['hasierako-aho-sabaia', 'maxilar-arteko-segmentua'],
      names: [{ id: 'hasierako-aho-sabaia', sub: 'hiruki formakoa, aurrean' }],
      note: 'Segmentuak aurrekaldean hiruki formako atala ematen du: hasierako aho sabaia',
    },
    {
      to: { teeth: 1, foramen: 1 },
      run: [0.1, 0.7],
      cam: UNDER(7.5, 1.3),
      glide: 0.05,
      dim: ['ebakortzak', 'ebakortz-zuloa', 'hasierako-aho-sabaia'],
      names: [
        { id: 'ebakortzak', text: '4 ebakortzak', sub: 'hemen txertatzen dira', from: 0.2 },
        { id: 'ebakortz-zuloa', sub: 'hirukiaren erpinean', from: 0.5 },
      ],
      note: 'Hemen txertatzen dira 4 ebakortzak (4 ebakortzen hezur maxilarra); erpinean, ebakortz zuloa',
    },
    {
      to: { grow: 1, fuse: 1, raphe: 1 },
      run: [0.08, 0.8],
      cam: UNDER(10.5, 0.2),
      glide: 0.05,
      dim: ['aho-sabai-gandorrak', 'aho-sabaiko-errafea', 'ebakortz-zuloa', 'hasierako-aho-sabaia'],
      names: [
        { id: 'aho-sabai-gandorrak', text: 'Aho sabaiaren plakak / gandorrak', sub: 'erdirantz doaz' },
        { id: 'aho-sabaiko-errafea', sub: 'ebakortz zuloan gelditzen da', from: 0.6 },
        { id: 'ebakortz-zuloa', small: true, from: 0.7 },
      ],
      note: 'Plakak erdian fusionatu: errafea, ebakortz zuloraino bakarrik. Hiru atalek aho sabai gogorra eratzen dute',
    },
  ],
};
export const IntermaxSeg18 = poseStage18(specSeg, palateModel);

// ———————————————————————————— Aho sabaiko gandorrak ————————————————————————————

export const S_SH = [0, 0.2, 0.42, 0.62, 0.82] as const;
const specSh: StageSpec<PalatePose, PalateOpts> = {
  map: 'palate',
  S: S_SH,
  pose: PAL0,
  opts: {},
  caption: CAP_COR,
  key: KEY_PAL,
  keyTitle: 'Koloreak',
  steps: [
    {
      cam: COR(12.5, 0.1),
      glide: 0.06,
      dim: ['aho-sabai-gandorrak', 'mihia'],
      names: [
        { id: 'aho-sabai-gandorrak', text: 'Aho-sabaiko gandorrak / plakak', sub: 'beherantz, mihiaren alboan (6. astea)' },
        { id: 'mihia', sub: 'gandorrak baino gorago', from: 0.4 },
        { id: 'sudur-barrunbea', small: true, from: 0.6 },
      ],
      note: '6. astea: gandorrak beherantz, mihiaren alboetan; mihia gandorrak baino gorago dago',
    },
    {
      to: { drop: 1, swing: 1, sept: 0.55 },
      run: [0.08, 0.9],
      cam: COR(11.5, -0.1, -8, 6),
      glide: 0.05,
      dim: ['aho-sabai-gandorrak', 'mihia', 'sudur-trenkada'],
      names: [
        { id: 'mihia', sub: 'behera doa' },
        { id: 'aho-sabai-gandorrak', sub: 'horizontal bihurtzen dira (7. astea)', from: 0.35 },
        { id: 'sudur-trenkada', text: 'Trenkada', sub: 'goitik, etmoidetik', small: true, from: 0.6 },
      ],
      note: '7. astea: mihia behera doa eta gandorrak horizontalizatu, mihiaren gainean; goitik trenkada bat hasten da',
    },
    {
      to: { fuse: 1 },
      run: [0.05, 0.85],
      cam: COR(10, 0.1, 18, 12),
      glide: 0.05,
      dim: ['aho-sabai-gandorrak'],
      names: [{ id: 'aho-sabai-gandorrak', text: 'Gandorrak fusionatzen', sub: '9. astea, erdian: josturarik ez' }],
      note: '9. astea: bi gandorrak erdikaldean fusionatzen dira, aurretik atzera',
    },
    {
      to: { jaw: 1, whole: 1, segShow: 1, foramen: 1, raphe: 1, teeth: 1 },
      run: [0.05, 0.75],
      cam: UNDER(10.5, 0.2),
      glide: 0.2,
      dim: ['hasierako-aho-sabaia', 'aho-sabai-gandorrak', 'aho-sabaiko-errafea', 'ebakortz-zuloa'],
      names: [
        { id: 'hasierako-aho-sabaia', sub: 'hirukia', from: 0.4 },
        { id: 'aho-sabai-gandorrak', text: 'Aho-sabaiko 2 plakak', from: 0.45 },
        { id: 'aho-sabaiko-errafea', from: 0.5 },
        { id: 'ebakortz-zuloa', sub: 'errafea hemen gelditzen da', small: true, from: 0.55 },
      ],
      note: 'Biratu behetik: gauza bera. 3 atal lotzen dira: hasierako aho sabaia + 2 plakak',
    },
    {
      cam: UNDER(8.5, -0.2, 8, -72),
      glide: 0.05,
      dim: ['aho-sabai-gogorra', 'aho-sabaiko-errafea', 'ebakortz-zuloa'],
      names: [
        { id: 'aho-sabai-gogorra', text: 'Hezurrezko aho sabaia', sub: '3 atalak batera' },
      ],
      note: 'Hiru atalak: hezurrezko aho sabaia. Atzekaldean 3 hezurtxo palatino (ez da garrantzitsua)',
    },
  ],
};
export const Shelves18 = poseStage18(specSh, palateModel);

// ———————————————————————————— Sudur trenkada eta korneteak ————————————————————————————

export const S_SP = [0, 0.4, 0.72] as const;
const specSp: StageSpec<PalatePose, PalateOpts> = {
  map: 'palate',
  S: S_SP,
  pose: { ...PAL0, swing: 1, drop: 1, fuse: 1, sept: 0.55 },
  opts: {},
  caption: CAP_COR,
  key: [
    { color: TISSUE.bone, text: 'sudur trenkada' },
    { color: TISSUE.cartilage, text: 'etmoidearen korneteak' },
    { color: '#c7a6e0', text: 'beheko kornetea: hezur propioa' },
  ],
  keyTitle: 'Koloreak',
  steps: [
    {
      to: { sept: 1 },
      run: [0.1, 0.85],
      cam: COR(10, 0.8, -6, 5),
      glide: 0.06,
      dim: ['sudur-trenkada', 'aho-sabai-gandorrak'],
      names: [
        { id: 'sudur-trenkada', sub: 'goitik behera, etmoidetik' },
        { id: 'aho-sabai-gandorrak', text: 'Aho sabaia', from: 0.6, small: true },
      ],
      note: '10.–12. asteetan trenkada aho sabaira heldu eta fusionatzen da: bi sudur barrunbe',
    },
    {
      to: { conchae: 1 },
      run: [0.08, 0.8],
      cam: COR(8, 1.2, 12, 5),
      glide: 0.05,
      dim: ['korneteak', 'goiko-kornetea', 'tarteko-kornetea', 'beheko-kornetea'],
      names: [
        { id: 'goiko-kornetea', sub: 'etmoidea', from: 0.25 },
        { id: 'tarteko-kornetea', sub: 'etmoidea', from: 0.4 },
        { id: 'beheko-kornetea', sub: 'hezur propioa, soltea', from: 0.55 },
      ],
      note: 'Trenkada leuna da; alboko hormak bihurriak: 3 kornete / maskor bikote',
    },
    {
      cam: COR(9, 0.9, -10, 6),
      dim: ['sudur-barrunbea', 'sudur-trenkada', 'korneteak', 'goiko-kornetea', 'tarteko-kornetea', 'beheko-kornetea'],
      names: [
        { id: 'sudur-barrunbea', sub: 'bat alde bakoitzean' },
        { id: 'sudur-trenkada', small: true },
        { id: 'goiko-kornetea', small: true },
        { id: 'tarteko-kornetea', small: true },
        { id: 'beheko-kornetea', small: true },
      ],
      note: 'Sudurraren aurrekaldea kartilagoz, atzekaldea hezurrez; sudur barrunbeak barnerago',
    },
  ],
};
export const Septum18 = poseStage18(specSp, palateModel);

// ———————————————————————————— Akatsak ————————————————————————————

export const S_DEF = [0, 0.3, 0.58, 0.8] as const;
const P_DEF: PalatePose = { ...PAL0, whole: 1, jaw: 1, swing: 1, fuse: 1, sept: 1, foramen: 1, raphe: 1, teeth: 1 };
const specDef: StageSpec<PalatePose, PalateOpts> = {
  map: 'palate',
  S: S_DEF,
  pose: P_DEF,
  opts: {},
  caption: CAP_BELOW,
  key: [
    { color: ARCH.i, text: 'aho sabai gogorra (plakak)' },
    { color: '#f6d95a', text: 'hasierako aho sabaia' },
    { color: '#e9a7a0', text: 'aho sabai biguna' },
  ],
  keyTitle: 'Koloreak',
  steps: [
    {
      to: { soft: 1 },
      run: [0.1, 0.7],
      cam: UNDER(10.5, -0.3),
      glide: 0.06,
      dim: ['aho-sabai-gogorra', 'aho-sabai-biguna', 'ubula'],
      names: [
        { id: 'aho-sabai-gogorra', text: 'Hezurrezkoa / gogorra', sub: 'aurrean' },
        { id: 'aho-sabai-biguna', text: 'Biguna', sub: 'ez da inoiz hezurtuko', from: 0.3 },
        { id: 'ubula', sub: 'hezurtzea ez da hona heltzen', small: true, from: 0.55 },
      ],
      note: 'Bi atal: hezurrezkoa (aurrean) eta biguna (atzean): hezurtzea ez da ubularaino heltzen',
    },
    {
      to: { lip: 1, lipL: 1 },
      run: [0.1, 0.75],
      cam: UNDER(8.5, 1.5, 0, -48),
      glide: 0.05,
      dim: ['goiko-ezpaina', 'erbi-ezpaina'],
      names: [
        { id: 'goiko-ezpaina', small: true },
        { id: 'erbi-ezpaina', sub: 'alde batekoa; aho sabaia ondo egon daiteke', from: 0.4 },
      ],
      note: 'Batzuetan aho sabaia ondo dago eta arazoa kanpoan: erbi-ezpaina, alde batekoa',
      warn: true,
    },
    {
      to: { lipR: 1 },
      run: [0.1, 0.7],
      cam: UNDER(8.5, 1.5, -6, -50),
      dim: ['erbi-ezpaina'],
      names: [{ id: 'erbi-ezpaina', text: 'Aldebiko erbi-ezpaina', sub: 'bi aldeetan' }],
      note: 'Edo aldebikoa: bi aldeetan',
      warn: true,
    },
    {
      to: { lipL: 0, lipR: 0, fuse: 0.3, cleft: 1, raphe: 0 },
      run: [0.08, 0.75],
      cam: UNDER(9.5, -0.3, 0, -72),
      glide: 0.05,
      dim: ['aho-sabai-arraila', 'aho-sabai-gandorrak'],
      names: [{ id: 'aho-sabai-arraila', sub: 'janaria sudurrera pasa daiteke', from: 0.45 }],
      note: 'Gandorrak fusionatzen ez badira: aho-sabai arraila. Jateko arazoak; kirurgiaz konpon daiteke',
      warn: true,
    },
  ],
};
export const Defects18 = poseStage18(specDef, palateModel);

// ———————————————————————————— Koanak ————————————————————————————

export const S_CH = [0, 0.22, 0.45, 0.62, 0.82] as const;
const SAGC = (dist = 11, u = 0.3, v = 0.3, yaw = 90, elev = 4) => SIDE(dist, [0, v, -u], yaw, elev);
const specCh: StageSpec<ChoanaPose, PalateOpts> = {
  map: 'palate',
  S: S_CH,
  pose: CH0,
  opts: {},
  caption: CAP_SAG,
  key: [
    { color: '#f6d95a', text: 'hasierako aho sabaia' },
    { color: ARCH.i, text: 'aho sabaiaren plakak' },
    { color: '#3b3346', text: 'sudur barrunbea' },
  ],
  keyTitle: 'Koloreak',
  steps: [
    {
      to: { pit: 0.55 },
      run: [0.1, 0.85],
      cam: SAGC(10, -0.6, 0.4),
      glide: 0.06,
      dim: ['sudur-hobitxoa', 'sudur-barrunbea'],
      names: [
        { id: 'sudur-hobitxoa', text: 'Sudur-hobitxoa', sub: '5. astea: kanpotik' },
        { id: 'aho-barrunbea', small: true, from: 0.5 },
      ],
      note: '5. astea: sudur zuloak kanpoan hasten dira, sudur hobitxotik; hobitxoa sakontzen doa',
    },
    {
      to: { pit: 1, memb: 1 },
      run: [0.05, 0.75],
      cam: SAGC(10, -0.6, 0.3),
      glide: 0.05,
      dim: ['mintz-bukonasala', 'sudur-barrunbea', 'hasierako-aho-sabaia'],
      names: [
        { id: 'sudur-barrunbea', sub: 'sakonunea' },
        { id: 'hasierako-aho-sabaia', small: true, from: 0.3 },
        { id: 'mintz-bukonasala', sub: '6. astea: mintz fina', from: 0.55 },
      ],
      note: '6. astea: sudur barrunbea eta ahoa bereizten dituen mintz fina: mintz bukonasala',
    },
    {
      to: { breakUp: 1 },
      run: [0.1, 0.7],
      cam: SAGC(9.5, -0.5, 0.2),
      glide: 0.05,
      dim: ['koana', 'mintz-bukonasala'],
      names: [{ id: 'koana', text: 'Hasierako koana', sub: '7. astea: mintza desagertu da', from: 0.35 }],
      note: '7. astea: mintza apurtu eta desagertu: sudurraren eta ahoaren arteko komunikabidea, hasierako koana',
    },
    {
      cam: SAGC(9, -0.8, 0.3),
      dim: ['narina', 'koana', 'sudur-barrunbea'],
      names: [
        { id: 'narina', sub: '2 kanpoan' },
        { id: 'koana', sub: '2 barnean' },
      ],
      note: 'Sudurrean 4 zulo nagusi: 2 narina (kanpoan) eta 2 koana (barnean)',
    },
    {
      to: { back: 1 },
      run: [0.06, 0.85],
      cam: SAGC(11, 0.7, 0.3),
      glide: 0.05,
      dim: ['koana', 'aho-sabai-gandorrak', 'sudur-barrunbea'],
      names: [
        { id: 'aho-sabai-gandorrak', text: 'Aho sabaia', sub: 'atzerantz', from: 0.3 },
        { id: 'koana', sub: 'atzera, faringera', from: 0.5 },
      ],
      note: 'Koanak hasieran aurrean, ahotik gertu; gero atzerantz, faringerantz, nasofaringea eta ahofaringea lotuz',
    },
  ],
};
export const Choana18 = poseStage18(specCh, choanaModel);
