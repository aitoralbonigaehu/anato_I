'use client';

import { ARCH, SIDE, TISSUE, endPose, poseStage18, type StageSpec } from '@/components/scenes/week17/common';
import type { V3 } from '@/lib/three-d/math';
import { TP0, thyroidModel, type ThyroidOpts, type ThyroidPose } from './thyroid-model';

/**
 * Topic 18, notes 3: the thyroid on one sagittal section (thyroid-model.ts), seen from the embryo's left as the
 * notes' figures: the face on the viewer's left. The bud leaves the floor (`tiroidea-sorrera`), then travels down
 * in front of the hyoid along its duct, the duct closes and the same section grows into the adult's
 * (`tiroidea-jaisketa`).
 */

const build = (pose: ThyroidPose, opts: ThyroidOpts) => thyroidModel(pose, opts);
const CAP = 'Burua eta lepoa erditik moztuta, ezkerretik (3D eredua): aurpegia zure ezkerrean, bizkarra eskuinean';
const KEY = [
  { color: TISSUE.endo, text: 'endodermoa' },
  { color: TISSUE.ecto, text: 'ektodermoa' },
  { color: ARCH.i, text: 'I. arkua' },
  { color: ARCH.iii, text: 'II.–IV. arkuak' },
] as const;
const FC: V3 = [0, -0.1, 0.2];

export const S_SORRERA = [0, 0.26, 0.5, 0.75] as const;

const specA: StageSpec<ThyroidPose, ThyroidOpts> = {
  map: 'thyroid',
  where: { th: 1.5, at: [0, -0.2, -0.3], scale: 2.6, planes: [{ center: [0, 0, 0.2], a: [0, 0, 2.9], b: [0, 3.2, 0] }], note: 'Burua: erditik moztuta (ebakidura sagitala), ezkerretik ikusita' },
  S: S_SORRERA,
  pose: TP0,
  opts: {},
  caption: CAP,
  key: KEY,
  keyTitle: 'Kolorea = jatorria',
  steps: [
    {
      cam: SIDE(11, [0, -0.1, 0.1]),
      fit: ['faringe-hestea', 'estomodeoa', 'mintz-bukofaringeoa', 'tuberkulu-bakoitia', 'kopula'],
      glide: 0.06,
      dim: ['estomodeoa', 'mintz-bukofaringeoa', 'faringe-hestea'],
      names: [
        { id: 'estomodeoa', sub: 'ektodermoz estalia' },
        { id: 'mintz-bukofaringeoa', sub: 'estomodeoa baino barnerago', from: 0.3 },
        { id: 'faringe-hestea', sub: 'zorua, endodermoa', from: 0.55 },
      ],
      note: '4. astea: tiroidea faringe hestearen zoruan eratzen hasten da, estomodeoaren atzean, eta gorago garatzen da beheratu aurretik',
    },
    {
      to: { dimple: 1, bud: 0.55 },
      run: [0.1, 0.85],
      cam: SIDE(6, FC),
      fit: ['zulo-itsua', 'tuberkulu-bakoitia', 'kopula', 'hodi-tiroglosoa'],
      glide: 0.05,
      dim: ['zulo-itsua', 'tuberkulu-bakoitia', 'kopula', 'hodi-tiroglosoa'],
      names: [
        { id: 'zulo-itsua', sub: 'hemendik sartzen da' },
        { id: 'tuberkulu-bakoitia', sub: 'aurrean', from: 0.3 },
        { id: 'kopula', text: 'Kupula / Kopula', sub: 'atzean', from: 0.5 },
      ],
      note: 'Zoruan, tuberkulu bakoitiaren eta kupularen artean (zulo itsuaren mailan), luzapen bat sartzen da mesenkimarantz',
    },
    {
      to: { bud: 1, canal: 1 },
      run: [0.08, 0.7],
      cam: SIDE(5, [0, -0.4, 0.2]),
      fit: ['hodi-tiroglosoa', 'zulo-itsua'],
      glide: 0.05,
      dim: ['hodi-tiroglosoa', 'zulo-itsua'],
      names: [{ id: 'hodi-tiroglosoa', sub: 'luzapenaren erdiko hodia: gloso (mihia) + tiro', from: 0.2 }],
      note: 'Luzapenak erdian hodi bat du: hodi tiroglosoa, mihiarekin (-gloso) eta tiroidearekin (tiro-) lotuta',
    },
    {
      to: { seed: 1, canal: 0 },
      run: [0.08, 0.75],
      cam: SIDE(5, [0, -0.5, 0.2]),
      fit: ['tiroide-guruina', 'hodi-tiroglosoa', 'zulo-itsua'],
      glide: 0.05,
      dim: ['tiroide-guruina', 'hodi-tiroglosoa'],
      names: [
        { id: 'hodi-tiroglosoa', sub: 'gida' },
        { id: 'tiroide-guruina', text: 'Tiroide guruinaren hasikina', sub: 'hodiaren muturrean', from: 0.25 },
      ],
      note: 'Hodiaren muturrean tiroide guruinaren hasikina garatzen da: hodi tiroglosoa gida bezala erabiliko du bere tokira joateko',
    },
  ],
};
export const ThyroidBud18 = poseStage18(specA, build);

export const S_JAISKETA = [0, 0.3, 0.56, 0.78] as const;

const specB: StageSpec<ThyroidPose, ThyroidOpts> = {
  map: 'thyroid',
  S: S_JAISKETA,
  pose: { ...endPose(specA).pose, membrane: 0 },
  opts: {},
  caption: CAP,
  key: KEY,
  keyTitle: 'Kolorea = jatorria',
  steps: [
    {
      to: { hyoid: 1, larynx: 1, down: 1 },
      run: [0.06, 0.9],
      cam: SIDE(9, [0, -1.1, 0.1]),
      fit: ['tiroide-guruina', 'hodi-tiroglosoa', 'hioide-hezurra', 'zulo-itsua'],
      glide: 0.05,
      dim: ['tiroide-guruina', 'hodi-tiroglosoa', 'hioide-hezurra'],
      names: [
        { id: 'tiroide-guruina', sub: 'beherantz doa' },
        { id: 'hodi-tiroglosoa', sub: 'zoruari lotuta jarraitzen du', from: 0.3 },
        { id: 'hioide-hezurra', sub: 'guruina haren aurretik pasatzen da', from: 0.55 },
      ],
      note: 'Guruina beherantz doa, hioide hezurra aurretik pasatuz. Bidean faringearen zoruari lotuta dago: lotura hori hodi tiroglosoa da',
    },
    {
      cam: SIDE(8, [0, -1.6, 0]),
      fit: ['tiroide-guruina', 'krikoide-kartilagoa', 'tiroide-kartilagoa', 'trakea'],
      glide: 0.05,
      dim: ['tiroide-guruina', 'krikoide-kartilagoa', 'tiroide-kartilagoa'],
      names: [
        { id: 'tiroide-guruina', sub: 'hemen gelditzen da: 7. astea' },
        { id: 'krikoide-kartilagoa', sub: 'maila honetan, aurrekaldean', from: 0.25 },
        { id: 'tiroide-kartilagoa', small: true, from: 0.5 },
      ],
      note: '7. astean behin betiko kokapena hartzen du: hioidearen azpiko laringe kartilagoen (krikoidearen) mailan, aurrekaldean',
    },
    {
      to: { close: 1 },
      run: [0.06, 0.85],
      cam: SIDE(8, [0, -1.0, 0.1]),
      fit: ['hodi-tiroglosoa', 'zulo-itsua', 'tiroide-guruina'],
      glide: 0.05,
      dim: ['hodi-tiroglosoa', 'zulo-itsua'],
      names: [
        { id: 'hodi-tiroglosoa', sub: 'itxi eta endekatzen', from: 0 },
        { id: 'zulo-itsua', sub: 'marka-zuloa: hemen geratzen da', from: 0.45 },
      ],
      note: 'Beheratzen den heinean hodia itxi eta endekatzen da. Hasi zen tokian (V erpinean) aztarna txiki bat uzten du: zulo itsua',
    },
    {
      to: { adult: 1, trace: 1 },
      run: [0.04, 0.8],
      cam: SIDE(13, [0, 0, 0]),
      fit: false,
      glide: 0.06,
      dim: ['zulo-itsua', 'hodi-tiroglosoa', 'tiroide-guruina', 'hioide-hezurra', 'mihiaren-gorputza', 'mihiaren-sustraia'],
      names: [
        { id: 'zulo-itsua', sub: 'helduan, mihiaren atzean', from: 0.45 },
        { id: 'hodi-tiroglosoa', text: 'Hodi tiroglosoaren hasierako kokapena', from: 0.55 },
        { id: 'hioide-hezurra', small: true, from: 0.65 },
        { id: 'tiroide-guruina', sub: 'lepoan, laringearen aurrean', from: 0.75 },
      ],
      note: 'Heldua: bide osoa puntuz. Zulo itsua da enbrioi garapeneko tiroidearen bidearen marka',
    },
  ],
};
export const ThyroidDescent18 = poseStage18(specB, build);
