'use client';

import { TISSUE, orbit, poseStage18, type StageSpec } from '@/components/scenes/week17/common';
import type { Camera3, V3 } from '@/lib/three-d/math';
import { JP0, TC, TP0, jawModel, toothModel, type JawPose, type ToothOpts, type ToothPose } from './tooth-model';

/**
 * Topic 18, notes 4.2: one cut tooth germ (tooth-model.ts). The block is the notes' section: mouth up, the
 * epithelium on top, the mesenchyme below; the outline changes through figures A–D and the finished tooth.
 * Same pose runs through the first three stages, so each starts where the last ended.
 */

const SH: [number, number] = [20, 0];
const CAM = (dist = 11, target: V3 = [0, -0.5, 0], yaw = 14, elev = 8): Camera3 => orbit(yaw, elev, dist, target, SH);
const build = (p: ToothPose, o: ToothOpts) => toothModel(p, o);
const CAP = 'Hortz-mugurria erdibituta (3D blokea): ahoa goian, mesenkima behean';

const AXES = {
  up: 'ahoa',
  front: 'ebakia',
  side: 'albo',
  sideDir: [1, 0, 0] as V3,
  edges: { up: 'Ahoa', down: 'Hezurrerantz', front: 'Ebakia', back: 'Atzea', side: 'Alboa', otherSide: 'Alboa' },
};

const KEY_G = [
  { color: TC.epi, text: 'epitelioa (ektodermoa)' },
  { color: TISSUE.mes, text: 'mesenkima' },
  { color: TC.papilla, text: 'hortz-papila' },
] as const;
const KEY_L = [
  { color: TC.enamel, text: 'esmaltea' },
  { color: TC.dentine, text: 'dentina' },
  { color: TC.cement, text: 'zementoa' },
  { color: TC.pulp, text: 'hortz-pulpa' },
] as const;

export const S_LAM = [0, 0.32, 0.62] as const;
const specLam: StageSpec<ToothPose, ToothOpts> = {
  map: 'tooth',
  where: { th: 1.5, at: [0, -0.5, 0], scale: 2.6, planes: [{ center: [0, -0.5, 0], a: [3.3, 0, 0], b: [0, 3, 0] }], note: 'Ahoaren inguruko epitelioa: maxilar eta barailaren gainean' },
  S: S_LAM,
  pose: { ...TP0, arch: 1 },
  opts: {},
  axes: AXES,
  caption: 'Bi masailak, C forman (3D eredua): gero, ebaki bat hortz-laminan barrena',
  key: KEY_G,
  steps: [
    {
      to: { thick: 1 },
      run: [0.1, 0.8],
      cam: CAM(11.5, [0, 0, 0], 0, 34),
      fit: false,
      glide: 0.06,
      dim: ['hortz-lamina'],
      names: [
        { id: 'hortz-lamina', sub: 'C forman, bi masailetan · 8. astea' },
        { id: 'hezur-maxilarra', small: true, from: 0.3 },
        { id: 'baraila', small: true, from: 0.45 },
      ],
      note: '8. astea: maxilar eta barailaren gaineko epitelioa lodiagotu egiten da, C forman: hortz-laminak',
    },
    {
      to: { arch: 0 },
      run: [0.05, 0.75],
      cam: CAM(10.5, [0, 0.4, 0]),
      fit: false,
      glide: 0.09,
      dim: ['aho-sabaiko-epitelioa'],
      names: [
        { id: 'aho-sabaiko-epitelioa', text: 'Aho-sabaiko epitelioa', sub: 'jatorri ektodermikoa', from: 0.4 },
        { id: 'mesenkima', sub: 'azpian', from: 0.55 },
      ],
      caption: CAP,
      note: 'Hortz bakar baten ebakia: goian epitelioa (ektodermoa) lodituta, azpian mesenkima',
    },
    {
      to: { lam: 1 },
      run: [0.08, 0.85],
      cam: CAM(8.5, [0, 0.9, 0]),
      fit: false,
      glide: 0.06,
      dim: ['hortz-lamina', 'aho-sabaiko-epitelioa'],
      names: [
        { id: 'hortz-lamina', sub: 'ebaginatzen, hezurrerantz', from: 0.2 },
        { id: 'aho-sabaiko-epitelioa', small: true },
        { id: 'mesenkima', small: true },
      ],
      caption: CAP,
      note: 'Lodiunea ebaginatu egiten da: mesenkiman sartzen da, hezurrerantz (irudia A)',
    },
  ],
};
export const ToothLamina18 = poseStage18(specLam, build);

const P_A: ToothPose = { ...TP0, thick: 1, lam: 1 };
export const S_CAP = [0, 0.25, 0.5, 0.75] as const;
const specCap: StageSpec<ToothPose, ToothOpts> = {
  map: 'tooth',
  S: S_CAP,
  pose: P_A,
  opts: {},
  axes: AXES,
  caption: CAP,
  key: KEY_G,
  steps: [
    {
      to: { cap: 1 },
      run: [0.08, 0.85],
      cam: CAM(8.5, [0, 0.8, 0]),
      fit: false,
      glide: 0.05,
      dim: ['txanoa', 'hortz-lamina'],
      names: [
        { id: 'txanoa', text: 'Txanoa', sub: '10. astea · txano aroa', from: 0.3 },
        { id: 'hortz-lamina', small: true },
      ],
      note: '10. astea: zelulak desberdintzen dira eta sartutako laminak txano forma hartzen du (txano aroa, irudia B)',
    },
    {
      to: { pap: 1 },
      run: [0.1, 0.8],
      cam: CAM(7.5, [0, 0.5, 0], 14, 6),
      fit: false,
      dim: ['kanpoko-epitelioa', 'barneko-epitelioa', 'hortz-papila'],
      names: [
        { id: 'kanpoko-epitelioa', sub: 'txanoaren kanpoan' },
        { id: 'barneko-epitelioa', sub: 'txanoaren barnean', from: 0.25 },
        { id: 'hortz-papila', sub: 'mesenkima, txanoak inguratuta', from: 0.5 },
      ],
      note: 'Txanoak kanpoko eta barneko epitelioa ditu; barrukoaren azpian mesenkimako zelulak bereizten dira: hortz-papila',
    },
    {
      to: { bell: 1 },
      run: [0.08, 0.85],
      cam: CAM(9, [0, 0.1, 0], -12, 6),
      fit: false,
      glide: 0.05,
      dim: ['kanpaia', 'hortz-papila'],
      names: [
        { id: 'kanpaia', text: 'Kanpaia', sub: '3. hilabetea · kanpai aroa', from: 0.3 },
        { id: 'hortz-papila', small: true },
      ],
      note: 'Txanoa sakontzen da: kanpai forma, gutxi gorabehera behin betiko hortzaren forma (3. hilabetea, irudia C)',
    },
    {
      to: { free: 1 },
      run: [0.1, 0.85],
      cam: CAM(9.5, [0, 0.6, 0], 12, 8),
      fit: false,
      glide: 0.05,
      dim: ['hortz-lamina', 'kanpaia'],
      names: [
        { id: 'hortz-lamina', sub: 'askatzen ari da', from: 0.2 },
        { id: 'kanpaia', small: true },
      ],
      note: 'Kanpaia laminatik askatzen da: lamina erretiratu eta kanpaia mesenkiman geratzen da',
    },
  ],
};
export const ToothCap18 = poseStage18(specCap, build);

const P_B: ToothPose = { ...P_A, cap: 1, pap: 1, bell: 1, free: 1 };
export const S_LAY = [0, 0.13, 0.27, 0.41, 0.55, 0.71, 0.86] as const;
const specLay: StageSpec<ToothPose, ToothOpts> = {
  map: 'tooth',
  S: S_LAY,
  pose: P_B,
  opts: {},
  axes: AXES,
  caption: CAP,
  key: KEY_L,
  steps: [
    {
      to: { cells: 1 },
      run: [0.1, 0.8],
      cam: CAM(7.5, [0, 0.1, 0], 12, 6),
      fit: false,
      glide: 0.05,
      dim: ['ameloblastoak', 'odontoblastoak'],
      names: [
        { id: 'ameloblastoak', sub: 'epitelioa → esmaltea', from: 0.15 },
        { id: 'odontoblastoak', sub: 'papila → dentina', from: 0.45 },
      ],
      note: 'Barneko epitelioa: ameloblastoak. Haren kontra, papilatik: odontoblastoak',
    },
    {
      to: { dep: 0.72 },
      run: [0.06, 0.92],
      cam: CAM(7, [0, 0.3, 0], -10, 6),
      fit: false,
      glide: 0.05,
      dim: ['esmaltea', 'dentina'],
      names: [
        { id: 'esmaltea', sub: 'ameloblastoek · kanpora, koroan bakarrik', from: 0.25 },
        { id: 'dentina', sub: 'odontoblastoek · barrura', from: 0.45 },
      ],
      note: 'Biak muga beretik hazten dira: esmaltea kanpora (koroan bakarrik), dentina barrura (irudia D)',
    },
    {
      to: { dep: 1, vess: 1 },
      run: [0.06, 0.9],
      cam: CAM(7.5, [0, -0.1, 0], 10, 6),
      fit: false,
      glide: 0.05,
      dim: ['hortz-pulpa', 'pulpa-hodiak', 'pulpa-nerbioa', 'hortz-papila'],
      names: [
        { id: 'hortz-pulpa', sub: 'papilatik · estutzen da dentina loditzean', from: 0.15 },
        { id: 'pulpa-hodiak', text: 'Arteria eta zainak', from: 0.5 },
        { id: 'pulpa-nerbioa', text: 'Nerbioa', from: 0.65 },
      ],
      note: 'Dentina loditu ahala, pulpa estutzen da. Bertatik arteria, zain eta nerbioa pasatzen dira',
    },
    {
      to: { root: 1 },
      run: [0.06, 0.88],
      cam: CAM(10.5, [0, -0.8, 0], -10, 6),
      fit: false,
      glide: 0.05,
      dim: ['dentina', 'hortz-pulpa'],
      names: [
        { id: 'dentina', sub: 'sustraian ere bai' },
        { id: 'hortz-pulpa', sub: 'luzatzen', from: 0.4 },
      ],
      note: 'Sustraia behera hazten da, hezurrerantz: dentinaz egina, pulpa luzatuz eta estutuz',
    },
    {
      to: { cem: 1 },
      run: [0.08, 0.85],
      cam: CAM(8.5, [0, -1.0, 0], 12, 6),
      fit: false,
      glide: 0.05,
      warn: true,
      dim: ['zementoa', 'zementoblastoak'],
      names: [
        { id: 'zementoa', sub: 'sustraiaren kanpoan', from: 0.2 },
        { id: 'zementoblastoak', sub: 'zementoa ekoizten', from: 0.45 },
      ],
      note: 'KONTUZ: apunteen hitzek nahasten dute, baina haien irudian zementoa sustraiaren kanpoan dago',
    },
    {
      to: { lig: 1, alv: 1 },
      run: [0.08, 0.85],
      cam: CAM(10, [0, -0.8, 0], -12, 6),
      fit: false,
      glide: 0.05,
      dim: ['lotailu-periodontalak', 'albeoloa', 'zementoa'],
      names: [
        { id: 'lotailu-periodontalak', sub: 'zementoa ↔ hezurra', from: 0.2 },
        { id: 'albeoloa', p: 'albeoloa', text: 'Albeoloa', sub: 'hezurra sustraiaren inguruan', from: 0.45 },
      ],
      note: 'Mesenkima hezur bihurtzen da: albeoloa. Lotailu periodontal finek zementoa hezurrari lotzen diote',
    },
    {
      to: { rise: 1 },
      run: [0.08, 0.9],
      cam: CAM(10.5, [0, 0.4, 0], 10, 8),
      fit: false,
      glide: 0.05,
      dim: ['koroa', 'esmaltea', 'dentina', 'zementoa', 'hortz-pulpa', 'lotailu-periodontalak'],
      names: [
        { id: 'koroa', text: 'Koroa', sub: 'kanpoan ikusten dena', from: 0.45 },
        { id: 'esmaltea', small: true, from: 0.6 },
        { id: 'dentina', small: true, from: 0.65 },
        { id: 'zementoa', small: true, from: 0.7 },
        { id: 'hortz-pulpa', small: true, from: 0.75 },
      ],
      note: 'Hortza albeoloan kokatuta geratzen da. Kanpoan ikusten den atala: koroa',
    },
  ],
};
export const ToothLayers18 = poseStage18(specLay, build);

export const S_JAW = [0, 0.2, 0.42, 0.66, 0.84] as const;
const JC = (dist = 13, target: V3 = [0, -1.5, 0], yaw = 10, elev = 6) => orbit(yaw, elev, dist, target, SH);
const specJaw: StageSpec<JawPose, ToothOpts> = {
  map: 'tooth',
  S: S_JAW,
  pose: JP0,
  opts: {},
  axes: AXES,
  caption: 'Baraila ebakita (3D eredua): esne-hortzak goian, behin betikoak hezurrean behean',
  key: [
    { color: TC.enamel, text: 'esne-hortzak' },
    { color: TC.perm, text: 'behin betikoak' },
    { color: TISSUE.bone, text: 'hezurra' },
  ],
  steps: [
    {
      to: { milk: 1 },
      run: [0.08, 0.85],
      cam: JC(13.5, [0, -1.2, 0]),
      fit: false,
      glide: 0.06,
      dim: ['esne-hortzak'],
      names: [
        { id: 'esne-hortzak', text: 'Behin-behineko hortzak (esnekoak)', sub: 'jaio ostean · 6.–24. hilabeteak', from: 0.3 },
        { id: 'baraila', small: true },
      ],
      note: 'Behin-behineko (esne) hortzak jaio ostean ateratzen dira: 6. hilabetetik 24.era',
    },
    {
      to: { perm: 1 },
      run: [0.08, 0.85],
      cam: JC(13, [0, -2, 0], -8, 6),
      fit: false,
      glide: 0.05,
      dim: ['behin-betiko-hortzak'],
      names: [
        { id: 'behin-betiko-hortzak', sub: 'bigarren ilara · jaio aurreko 3. hilabetetik', from: 0.3 },
        { id: 'esne-hortzak', small: true },
      ],
      note: 'Behin betikoak jaio aurretik ere eratzen dira (3. hilabetean), hezurraren barnean: bigarren ilara',
    },
    {
      to: { erupt: 1 },
      run: [0.06, 0.92],
      cam: JC(13.5, [0, -0.7, 0], 9, 6),
      fit: false,
      glide: 0.05,
      dim: ['behin-betiko-hortzak', 'esne-hortzak'],
      names: [
        { id: 'behin-betiko-hortzak', sub: 'sakatzen · 6 urte inguru', from: 0.15 },
        { id: 'esne-hortzak', sub: 'ez dira bere kabuz jausten', from: 0.35 },
      ],
      note: 'Behin betikoek sakatu eta mugitzen dituzte: esne-hortzak ez dira bere kabuz jausten (6. urtetik aurrera)',
    },
    {
      to: { agen: 1 },
      run: [0.1, 0.85],
      cam: JC(10, [1.8, -1.2, 0], 16, 6),
      fit: false,
      glide: 0.06,
      warn: true,
      dim: ['agenesia', 'esne-hortzak'],
      names: [
        { id: 'agenesia', text: 'Agenesia', sub: 'behin betikoa ez da eratu', from: 0.35 },
        { id: 'esne-hortzak', p: 'esne-hortz-gelditua', sub: 'ez da jausten: ez du inork sakatzen', key: 'gelditua', from: 0.55 },
      ],
      note: 'Behin betikoa eratzen ez bada (agenesia), esne-hortza ez da jausten: inork ez du sakatzen',
    },
    {
      to: { extract: 1 },
      run: [0.1, 0.9],
      cam: JC(14, [1, 0.7, 0], 12, 6),
      fit: false,
      glide: 0.05,
      dim: ['esne-hortzak', 'behin-betiko-hortzak'],
      names: [{ id: 'esne-hortzak', p: 'esne-hortz-gelditua', text: 'Esne-hortza', sub: '14–16 urte: atera egin behar', key: 'gelditua', from: 0.25 }],
      note: 'Azkenean atera egin behar da, 14–16 urte bitartean: ez dago prestatuta helduetan irauteko (kariesak)',
    },
  ],
};
export const JawTeeth18 = poseStage18(specJaw, (p, o) => jawModel(p, o));
