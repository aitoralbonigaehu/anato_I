'use client';

import { BLOCK, KEY15, endPose, poseStage, type StageSpec } from './common';
import type { V3 } from '@/lib/three-d/math';
import { BLOCK_AXES, UNIT0, unitModel, type UnitOpts, type UnitPose } from './unit-model';

/**
 * Topic 15's section block (unit-model.ts): how one pronephric unit forms (stage 3) and gets its glomerulus
 * (stage 4), and how a mesonephric unit does the same in the urogenital ridge (stage 6). Dorsal up, the
 * embryo's left on the viewer's right, three segments deep so the longitudinal duct shows.
 */

const build = (pose: UnitPose, opts: UnitOpts) => unitModel(pose, opts);
const CAP_PRO = 'Lepo mailako zeharkako mozketa (3D blokea, goitik): bizkarra goian';
const CAP_MESO = 'Torax mailako zeharkako mozketa (3D blokea, goitik): bizkarra goian';

// ———————————————————————————— 3. Nefrotomak → hodixka eta hodi pronefrikoak ————————————————————————————

export const S3 = [0, 0.25, 0.5, 0.75] as const;

const spec3: StageSpec<UnitPose, UnitOpts> = {
  map: 'pro-unit',
  where: { th: 1.0, at: [0, 0.1, 0], frame: 'block', scale: 1.8, planes: [-1, 1].map((s) => ({ center: [0, 0.1, s * 1.05] as V3, a: [2.3, 0, 0] as V3, b: [0, 1.75, 0] as V3 })), note: 'Lepoaren mailako zeharkako ebakia: blokea goitik (kranealetik) ikusiko dugu' },
  S: S3,
  pose: UNIT0,
  opts: {},
  caption: CAP_PRO,
  key: KEY15.pro,
  axes: BLOCK_AXES,
  steps: [
    {
      to: { cluster: 1, vesicle: 1 },
      run: [0.05, 0.6],
      cam: BLOCK(),
      glide: 0.06,
      dim: ['bitarteko-mesodermoa', 'nefrotomak'],
      names: [
        { id: 'bitarteko-mesodermoa' },
        { id: 'nefrotomak', text: 'Zelula metaketa → xixkua', sub: 'barrunbea agertzen da (bakuolizatu)', from: 0.35 },
        { id: 'aorta-dortsalak', small: true, from: 0.5 },
        { id: 'hodi-neurala', small: true, from: 0.6 },
      ],
      note: 'Bitarteko mesodermoan zelula metaketa bat; zelulak aldendu eta barrunbe bat sortzen da: metaketa xixku bihurtzen da',
    },
    {
      to: { tubule: 1 },
      run: [0.08, 0.8],
      cam: BLOCK(6.6, [0.6, 0.2, 0], 20, 18),
      glide: 0.05,
      dim: ['hodixka-pronefrikoak', 'nefrotomak'],
      names: [{ id: 'hodixka-pronefrikoak', sub: 'xixkua luzatuz', from: 0.3 }],
      note: 'Xixkua luzatu eta hodi bat ematen du: hodixka pronefrikoa',
    },
    {
      to: { open: 1 },
      run: [0.08, 0.7],
      cam: BLOCK(5.6, [0.95, 0.0, 0], 8, 12),
      glide: 0.05,
      dim: ['hodixka-pronefrikoak', 'enbrioi-barruko-zeloma'],
      names: [
        { id: 'hodixka-pronefrikoak', p: 'hodixka-lateral', text: 'Alboko muturra', sub: 'zabaldu eta biribildu', key: 'lat' },
        { id: 'hodixka-pronefrikoak', p: 'hodixka-medial', text: 'Erdiko muturra', sub: 'barrunbe zelomikora irekita', key: 'med', from: 0.3 },
        { id: 'enbrioi-barruko-zeloma', from: 0.5 },
      ],
      note: 'Bi mutur: alboko muturra zabaldu eta biribiltzen da; erdikoa barrunbe zelomikora (enbrioi barruko zelomara) irekitzen da',
    },
    {
      to: { duct: 1 },
      run: [0.08, 0.8],
      cam: BLOCK(7.2, [0.8, 0.2, 0], 48, 18),
      glide: 0.06,
      dim: ['hodi-pronefrikoa', 'hodixka-pronefrikoak'],
      names: [
        { id: 'hodi-pronefrikoa', sub: 'luzetarakoa: maila desberdinetako nefrotomak lotuz', from: 0.2 },
        { id: 'hodixka-pronefrikoak', small: true },
      ],
      note: 'Hodixken alboko zabalguneak elkarren artean batzen dira, zefalikotik kaudalera: luzetarako hodi pronefrikoa',
    },
  ],
};
export const Neph15 = poseStage(spec3, build);

// ———————————————————————————— 4. Glomeruluak eta korpuskulua ————————————————————————————

export const S4 = [0, 0.25, 0.5, 0.76] as const;

const spec4: StageSpec<UnitPose, UnitOpts> = {
  map: 'pro-unit',
  where: { th: 1.0, at: [0, 0.1, 0], frame: 'block', scale: 1.8, planes: [-1, 1].map((s) => ({ center: [0, 0.1, s * 1.05] as V3, a: [2.3, 0, 0] as V3, b: [0, 1.75, 0] as V3 })), note: 'Lepoaren mailako zeharkako ebakia: pronefrosaren glomeruluak' },
  S: S4,
  pose: endPose(spec3).pose,
  opts: {},
  caption: CAP_PRO,
  key: KEY15.pro,
  axes: BLOCK_AXES,
  steps: [
    {
      to: { glom: 1 },
      run: [0.08, 0.8],
      cam: BLOCK(6.4, [0.5, 0.2, 0], 16, 16),
      glide: 0.06,
      dim: ['aorta-dortsalak', 'glomeruluak'],
      names: [
        { id: 'aorta-dortsalak', sub: 'adarrak nefrotometarantz' },
        { id: 'glomeruluak', sub: 'arteriola (kapilar) “ovilloak” adarren muturrean', from: 0.45 },
      ],
      note: 'Aorta dortsaletik adarrak nefrotometarantz; muturretan, arteriolaz (kapilarrez) osatutako “ovillo” formako egiturak: glomeruluak',
    },
    {
      to: { extGlom: 1 },
      run: [0.08, 0.7],
      cam: BLOCK(5.8, [0.65, -0.1, -0.1], 12, 10),
      dim: ['kanpoko-glomeruluak', 'barneko-glomeruluak', 'enbrioi-barruko-zeloma'],
      names: [
        { id: 'kanpoko-glomeruluak', sub: 'zelomara zuzenean', from: 0.2 },
        { id: 'barneko-glomeruluak', sub: 'hodixkarantz', from: 0.45 },
      ],
      note: 'Bi glomerulu mota, biak aortatik: kanpokoak zelomara zuzenean zabaltzen dira; barnekoak hodixka pronefrikoetarantz',
    },
    {
      to: { cap: 1 },
      run: [0.08, 0.8],
      cam: BLOCK(4.8, [0.9, 0.2, 0], 26, 16),
      glide: 0.05,
      dim: ['kapsula-glomerularra', 'barneko-glomeruluak', 'hodixka-pronefrikoak'],
      names: [
        { id: 'barneko-glomeruluak', small: true },
        { id: 'kapsula-glomerularra', text: 'Txano formako egitura', sub: 'glomerulu gainean: ez dira fusionatzen', from: 0.05 },
      ],
      note: 'Hodixka eta barneko glomerulua elkarrengana: hodixkak txano formako egitura osatzen du glomerulu gainean. KONTUZ: ez dira fusionatzen',
      warn: true,
    },
    {
      cam: BLOCK(5.6, [0.7, 0.2, 0], 18, 14),
      dim: ['korpuskulua', 'kapsula-glomerularra', 'barneko-glomeruluak'],
      names: [{ id: 'korpuskulua', sub: 'glomerulua + txanoa: hasierako iraitz unitatea' }],
      note: 'Egitura horri korpuskulua deritzo: hasierako iraitz unitateak, ia funtzionalak ez direnak',
    },
  ],
};
export const Glom15 = poseStage(spec4, build);

// ———————————————————————————— 6. Hodixka mesonefrikoak ————————————————————————————

export const S6 = [0, 0.2, 0.4, 0.6, 0.8] as const;
const MESO0: UnitPose = { ...UNIT0, mode: 1, ridge: 1, gonadal: 1 };

const spec6: StageSpec<UnitPose, UnitOpts> = {
  map: 'meso-unit',
  where: { th: 0.1, at: [0, 0.1, 0], frame: 'block', scale: 1.8, planes: [-1, 1].map((s) => ({ center: [0, 0.1, s * 1.05] as V3, a: [2.3, 0, 0] as V3, b: [0, 1.75, 0] as V3 })), note: 'Toraxaren mailako zeharkako ebakia: mesonefrosaren hodixkak' },
  S: S6,
  pose: MESO0,
  opts: {},
  caption: CAP_MESO,
  key: KEY15.meso,
  axes: BLOCK_AXES,
  steps: [
    {
      to: { cluster: 1, vesicle: 1 },
      run: [0.1, 0.85],
      cam: BLOCK(7.2, [0.4, 0.1, 0], 14, 16),
      glide: 0.06,
      dim: ['mesonefrosa', 'xixku-mesonefrikoa', 'gonada-gandorra'],
      names: [
        { id: 'mesonefrosa', text: 'Gandorraren gernu osagaia' },
        { id: 'gonada-gandorra', small: true, from: 0.2 },
        { id: 'xixku-mesonefrikoa', sub: 'zelula metaketa → barrunbea', from: 0.45 },
      ],
      note: 'Gandor urogenitalaren gernu osagaian zelula metaketa bat; hustu (bakuolizatu) eta xixku mesonefrikoa sortzen da',
    },
    {
      to: { tubule: 1, duct: 1 },
      run: [0.08, 0.8],
      cam: BLOCK(6.4, [0.8, 0.1, 0], 30, 16),
      glide: 0.05,
      dim: ['hodixka-mesonefrikoak', 'hodi-mesonefrikoa'],
      names: [
        { id: 'hodixka-mesonefrikoak', sub: 'xixkua luzatuz', from: 0.2 },
        { id: 'hodi-mesonefrikoa', sub: 'more iluna (Wolff)', from: 0.45 },
      ],
      note: 'Xixkua luzatu eta hodixka mesonefrikoa bihurtzen da. KONTUZ: apunteetako esaldi batek «hodi mesonefrikoa» dio; hodixka da',
      warn: true,
    },
    {
      to: { glom: 1, cap: 1 },
      run: [0.08, 0.8],
      cam: BLOCK(5.4, [0.95, 0.15, 0], 18, 14),
      glide: 0.05,
      dim: ['hodixka-mesonefrikoak', 'hodi-mesonefrikoa', 'kapsula-glomerularra', 'glomeruluak'],
      names: [
        { id: 'hodixka-mesonefrikoak', p: 'hodixka-lateral', text: 'Alboko muturra', sub: 'hodi mesonefrikoan irekita', key: 'lat' },
        { id: 'glomeruluak', sub: 'aorta dortsalaren adartxoak', from: 0.25 },
        { id: 'kapsula-glomerularra', text: 'Bowman kapsula', sub: 'erdiko muturra: kontaktuan, ez fusionatuta', from: 0.5 },
      ],
      note: 'Bi mutur: alboa hodi mesonefrikoan irekitzen da; erdikoa glomerulurantz luzatu eta inguratzen du: Bowman kapsula (kontaktuan, ez fusionatuta)',
    },
    {
      to: { twist: 1 },
      run: [0.08, 0.75],
      cam: BLOCK(5.2, [0.95, 0.2, 0], 40, 18),
      glide: 0.05,
      dim: ['hodixka-mesonefrikoak', 'korpuskulua'],
      names: [
        { id: 'hodixka-mesonefrikoak', sub: 'bihurritua (pronefrikoa zuzena zen)' },
        { id: 'korpuskulua', text: 'Korpuskulua (mesonefrosarena)', sub: 'glomerulua + kapsula', from: 0.4 },
      ],
      note: 'Tokia mugatua denez, hodixka mesonefrikoa bihurritu (tolestu) egiten da; hodixka pronefrikoak zuzenak ziren. Glomerulua + kapsula = korpuskulua',
    },
    {
      to: { arterioles: 1 },
      run: [0.08, 0.7],
      cam: BLOCK(5.4, [0.85, 0.35, 0], 20, 20),
      glide: 0.05,
      dim: ['arteriola-aferentea', 'arteriola-eferentea', 'korpuskulua'],
      names: [
        { id: 'arteriola-aferentea', text: 'Arteriola aferentea', sub: 'aortatik glomerulura' },
        { id: 'arteriola-eferentea', sub: 'iraizpenaren ondoren', from: 0.3 },
        { id: 'atzeko-bena-kardinalak', small: true, from: 0.5 },
        { id: 'korpuskulua', small: true },
      ],
      note: 'KONTUZ: apunteek diote mesonefrosak ez duela gernurik egiten (ez funtzionala); beste paragrafo batek, «aurten esan gabea», funtzionala dela (arteriola aferente/eferenteak)',
      warn: true,
    },
  ],
};
export const MesoUnit15 = poseStage(spec6, build);
