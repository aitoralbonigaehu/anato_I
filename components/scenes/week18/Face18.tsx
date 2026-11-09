'use client';

import { FRONT, SIDE, poseStage18, type StageSpec } from '@/components/scenes/week17/common';
import type { V3 } from '@/lib/three-d/math';
import { FACE_COLOR, FP0, faceModel, type FaceOpts, type FacePose } from './face-model';

/** Topic 18 §4–4.1: the face as one continuous skin, week 4 to week 12 (face-model.ts). */

const build = (pose: FacePose, opts: FaceOpts) => faceModel(pose, opts);
const CAP = 'Aurpegia aurretik (3D): enbrioiaren ezkerra zure eskuinean';
const T: V3 = [0, -0.55, 0];
const KEY = [
  { color: FACE_COLOR.max, text: 'I. arkua: luzapenak' },
  { color: FACE_COLOR.medial, text: 'ertz mediala' },
  { color: FACE_COLOR.lateral, text: 'ertz laterala' },
  { color: FACE_COLOR.front, text: 'goragune frontonasala' },
] as const;

// ———————— Aurpegia 4. astean ————————
export const SF1 = [0, 0.3, 0.55, 0.78] as const;
const spec1: StageSpec<FacePose, FaceOpts> = {
  S: SF1,
  pose: FP0,
  opts: {},
  caption: CAP,
  key: KEY,
  map: 'face',
  where: { th: 2.42, at: [0, 0, 0], scale: 1.9, span: 0.06, note: 'Enbrioiaren aurpegia, 4. astearen bukaeran: buruaren behealdea, bihotz goragunearen gainean' },
  steps: [
    {
      cam: FRONT(10, T),
      fit: false,
      dim: ['goragune-frontonasala', 'luzapen-maxilarra', 'barail-luzapena', 'estomodeoa'],
      names: [
        { id: 'goragune-frontonasala', text: 'Bekoki goragunea / goragune frontonasala', sub: 'estomodeoaren gainean' },
        { id: 'luzapen-maxilarra', sub: 'I. arkua, alboetan', from: 0.2 },
        { id: 'barail-luzapena', sub: 'I. arkua, alboetan', from: 0.4 },
        { id: 'estomodeoa', text: 'Estomodeoa / hasierako ahoa', sub: 'epitelio ektodermikoa', from: 0.6 },
      ],
      note: 'Aurpegia 4. astearen bukaeran hasi eta 12. astearen inguruan bukatzen da: hasieran egiturak nahiko lateralak dira',
    },
    {
      cam: FRONT(7.2, [0, -1.4, 0], 0, -6),
      fit: false,
      glide: 0.05,
      dim: ['mintz-bukofaringeoa', 'estomodeoa'],
      names: [{ id: 'mintz-bukofaringeoa', sub: 'barnerago, estomodeoaren hondoan' }],
      note: 'Barnerago, mintz bukofaringeoa (argazkietan ez da ikusten, barneago dagoelako)',
    },
    {
      cam: FRONT(9.6, T, 58, 2),
      fit: false,
      glide: 0.06,
      dim: ['begia'],
      names: [{ id: 'begia', text: 'Begia', sub: 'guztiz lateralki' }],
      note: 'Kamera biratu da: begiak guztiz lateralki agertzen dira, buruaren alboan',
    },
    {
      to: { age: 4.4 },
      cam: FRONT(10, T),
      fit: false,
      glide: 0.06,
      names: [
        { id: 'goragune-frontonasala', text: 'Goragune frontonasala', sub: 'bertan, gero, sudur plakodak' },
        { id: 'luzapen-maxilarra', small: true },
        { id: 'barail-luzapena', small: true },
      ],
      note: 'Garapenarekin egiturak alde medialerantz eta aurrerantz mugituko dira: enbrioiak giza itxura hartzen du',
    },
  ],
};
export const FaceStart18 = poseStage18(spec1, build);

// ———————— Sudur plakodak ————————
export const SF2 = [0, 0.3, 0.58, 0.8] as const;
const spec2: StageSpec<FacePose, FaceOpts> = {
  S: SF2,
  pose: { ...FP0, age: 4.4 },
  opts: {},
  caption: CAP,
  key: KEY,
  map: 'face',
  steps: [
    {
      to: { age: 5 },
      run: [0.05, 0.8],
      cam: FRONT(8.6, [0, -0.7, 0]),
      fit: false,
      glide: 0.05,
      dim: ['sudur-plakoda', 'luzapen-maxilarra'],
      names: [
        { id: 'sudur-plakoda', text: 'Sudur plakoda / sudur hodi hastapena', sub: '5. astea · ez dira begiak', from: 0.2 },
        { id: 'luzapen-maxilarra', sub: 'plakodaren azpian', from: 0.5 },
      ],
      note: '5. astean sudur plakodak agertzen dira, luzapen maxilarren goikaldean. Hobitxoak ez dira begiak, sudur plakodak baizik',
    },
    {
      to: { age: 5.4 },
      run: [0.05, 0.8],
      cam: FRONT(7, [0.9, -0.75, 0], 16, 2),
      fit: false,
      glide: 0.05,
      dim: ['sudur-ertz-mediala', 'sudur-ertz-laterala'],
      names: [
        { id: 'sudur-ertz-mediala', text: 'Ertz mediala / barnekoa', sub: 'nasala (horia)' },
        { id: 'sudur-ertz-laterala', text: 'Ertz laterala / kanpokoa', sub: 'tenporala (urdina)', from: 0.3 },
      ],
      note: 'Plakodak gero eta lodiago: bi ertz, laterala edo kanpokoa (urdina, tenporala) eta mediala edo barnekoa (horia, nasala)',
    },
    {
      to: { age: 5.9 },
      run: [0.05, 0.85],
      cam: FRONT(6.6, [0.9, -0.75, 0], 20, 4),
      fit: false,
      glide: 0.05,
      dim: ['sudur-hobitxoa'],
      names: [{ id: 'sudur-hobitxoa', text: 'Sudur hobitxoa / usaimen hobitxoa', sub: 'gero eta sakonagoa' }],
      note: 'Bi ertzen erdian, sakonune gero eta sakonagoa: sudur hobitxoa. Sudur hobitxoak + ertzak = sudur plakodak (2)',
    },
    {
      cam: FRONT(7.4, [1.1, -0.65, 0], 34, 4),
      fit: false,
      glide: 0.05,
      dim: ['ildo-nasolagrimala'],
      names: [
        { id: 'ildo-nasolagrimala', sub: 'ertz laterala ↔ luzapen maxilarra' },
        { id: 'sudur-ertz-laterala', small: true, from: 0.3 },
        { id: 'luzapen-maxilarra', small: true, from: 0.5 },
      ],
      note: 'Sudur plakodaren ertz lateralaren eta luzapen maxilarraren artean ildo bat: ildo nasolagrimala',
    },
  ],
};
export const Placodes18 = poseStage18(spec2, build);

// ———————— Fusioa ————————
export const SF3 = [0, 0.26, 0.5, 0.74, 0.88] as const;
const spec3: StageSpec<FacePose, FaceOpts> = {
  S: SF3,
  pose: { ...FP0, age: 5.9 },
  opts: {},
  caption: CAP,
  key: KEY,
  map: 'face',
  steps: [
    {
      to: { age: 7 },
      run: [0.05, 0.92],
      cam: FRONT(8, [0, -0.8, 0]),
      fit: false,
      glide: 0.05,
      dim: ['sudur-ertz-mediala', 'sudur-ertz-laterala', 'sudur-hobitxoa'],
      names: [
        { id: 'sudur-ertz-mediala', text: 'Ertz medialak', sub: '6.–7. asteak: erdirantz' },
        { id: 'sudur-ertz-laterala', small: true, from: 0.4 },
      ],
      note: '6. eta 7. asteen artean sudur hastapenak aurrekalderantz mugitu eta hurbiltzen dira, ertz medialak fusionatzeko',
    },
    {
      to: { age: 8.4 },
      run: [0.05, 0.92],
      cam: FRONT(8, [0, -0.85, 0]),
      fit: false,
      glide: 0.05,
      dim: ['luzapen-maxilarra', 'barail-luzapena'],
      names: [{ id: 'luzapen-maxilarra', sub: 'erdirantz eta aurrerantz: guztia arrastatuz', from: 0.1 }],
      note: 'Luzapen maxilarrak alde medialerantz eta aurrerantz luzatzen dira, sudur hastapenak eta beste egiturak arrastatuz',
    },
    {
      to: { age: 10 },
      run: [0.05, 0.92],
      cam: FRONT(7, [0, -0.85, 0]),
      fit: false,
      glide: 0.05,
      dim: ['sudurraren-erdiko-atala', 'goiko-ezpainaren-erdiko-atala', 'sudur-hegalak'],
      names: [
        { id: 'sudurraren-erdiko-atala', text: 'Sudurraren erdiko atala', sub: 'ertz medialak (10. astea)', from: 0.2 },
        { id: 'goiko-ezpainaren-erdiko-atala', text: 'Goiko ezpainaren erdiko atala', sub: 'kanpotik; ez da luzapen maxilarra', from: 0.35 },
        { id: 'sudur-hegalak', text: 'Sudur hegalak', sub: 'ertz lateralak', from: 0.55 },
      ],
      note: '10. astean ertz medialak fusionatuta: sudurraren eta goiko ezpainaren erdiko atala. Barnetik, hasierako aho sabaia. Ertz lateralak: sudur hegalak',
    },
    {
      cam: FRONT(6.2, [0, -1.15, 0], 0, -4),
      fit: false,
      glide: 0.05,
      dim: ['luzapen-maxilarra', 'goiko-ezpainaren-erdiko-atala'],
      names: [
        { id: 'goiko-ezpainaren-erdiko-atala', text: 'Goiko ezpaina, erdian', sub: 'ertz medialak' },
        { id: 'luzapen-maxilarra', text: 'Goiko ezpaina, alboetan', sub: 'luzapen maxilarrak', from: 0.3 },
      ],
      note: 'Goiko ezpainak bi jatorri ditu: alde medialerantz mugitutako luzapen maxilarrak eta sudur hastapenen ertz mediala',
    },
    {
      to: { age: 12, color: 0.3 },
      run: [0.04, 0.85],
      cam: FRONT(8.2, [0, -0.45, 0], -24, 4),
      fit: false,
      glide: 0.05,
      names: [],
      note: '12. astearen inguruan aurpegia bukatzen da: fusio lerroak itxi dira eta ez da josturarik geratzen',
    },
  ],
};
export const FaceFusion18 = poseStage18(spec3, build);

// ———————— Ildo nasolagrimala ————————
export const SF4 = [0, 0.3, 0.6, 0.82] as const;
const spec4: StageSpec<FacePose, FaceOpts> = {
  S: SF4,
  pose: { ...FP0, age: 7 },
  opts: {},
  caption: 'Aurpegia ezkerretik eta aurretik (3D): sudur-hegala eta begia, ildoaren bi muturrak',
  key: KEY,
  map: 'face',
  steps: [
    {
      cam: FRONT(7.2, [1.1, -0.55, 0], 32, 4),
      fit: false,
      dim: ['ildo-nasolagrimala'],
      names: [{ id: 'ildo-nasolagrimala', sub: 'sudur-hegala ↔ luzapen maxilarra' }, { id: 'begia', small: true, from: 0.4 }],
      note: 'Hasieran, sudur-hegalaren (alboko ertzaren) eta luzapen maxilarraren artean ildo bat: ildo nasolagrimala',
    },
    {
      to: { age: 9.4, duct: 0.72 },
      run: [0.05, 0.92],
      cam: FRONT(6.4, [0.75, -0.5, 0], 28, 4),
      fit: false,
      glide: 0.05,
      dim: ['hodi-nasolagrimala', 'begia'],
      names: [{ id: 'hodi-nasolagrimala', text: 'Hodi nasolagrimala / malko hodia', sub: 'ildoaren barnean eratzen da', from: 0.35 }, { id: 'begia', small: true }],
      note: 'Begiak aurrera datozenean ildoa eraldatu eta hodi bihurtzen da: ildoaren barnean malko hodia',
    },
    {
      to: { age: 10.4, duct: 1 },
      run: [0.05, 0.9],
      cam: FRONT(5.8, [0.7, -0.35, 0], 26, 6),
      fit: false,
      glide: 0.05,
      dim: ['malko-zakua', 'hodi-nasolagrimala'],
      names: [
        { id: 'malko-zakua', sub: 'goian zabalgunea: begiaren erpin medialean', from: 0.3 },
        { id: 'hodi-nasolagrimala', small: true },
      ],
      note: 'Hodiak goikaldean zabalgune bat du, malko zakua, begiaren erpin medialean: hark komunikatzen ditu begiaren erpin mediala eta sudur barrunbea',
    },
    {
      cam: SIDE(7.4, [0.6, -0.5, 0.6], 40, 4),
      fit: false,
      glide: 0.05,
      dim: ['malko-zakua', 'hodi-nasolagrimala'],
      names: [{ id: 'malko-zakua', small: true }, { id: 'hodi-nasolagrimala', text: 'Malko zakua + malko hodia', sub: 'begia ↔ sudur barrunbea' }],
      note: 'Horregatik, negar egitean, malko batzuk hodietatik sudur barrunbeetara ateratzen dira',
    },
  ],
};
export const FaceDuct18 = poseStage18(spec4, build);
