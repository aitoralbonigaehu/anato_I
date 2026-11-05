'use client';

import { FRONT16, KEY16, endPose, poseStage, type StageSpec } from './common';
import { WALL_WHERE } from '@/components/scenes/week15/Wall3D';
import { UP0, uroModel, type UroOpts, type UroPose } from '@/components/scenes/week15/uro-model';

/**
 * Topic 16 on topic 15's posterior wall (uro-model.ts): the gonadal ridge and the two genital ducts (stage 1), the
 * primordial germ cells' way from the yolk sac (stage 2), the paramesonephric duct (stage 4).
 */

const build = (pose: UroPose, opts: UroOpts) => uroModel(pose, opts);
const CAP = 'Atzeko pareta aurretik (3D eredua): enbrioiaren ezkerra zure eskuinean';
const BASE: UroPose = { ...UP0, meso: 1, wolff: 1, mesoGone: 0.35, gonadal: 1, bud: 1, blast: 1 };

// ———————————————————————————— 1. Sarrera ————————————————————————————

export const S1 = [0, 0.33, 0.66] as const;

const spec1: StageSpec<UroPose, UroOpts> = {
  where: WALL_WHERE,
  S: S1,
  pose: { ...BASE, gonadal: 0 },
  opts: { glom: 0, gut: 1 },
  caption: CAP,
  key: KEY16.ducts,
  steps: [
    {
      to: { gonadal: 1 },
      run: [0.1, 0.7],
      cam: FRONT16(13, [0, -0.6, -0.3], 22, 8),
      glide: 0.06,
      dim: ['gonada-gandorra', 'mesonefrosa', 'gernu-gandorra'],
      names: [
        { id: 'mesonefrosa', text: 'Gandor urinarioa (mesonefrosa)' },
        { id: 'gonada-gandorra', sub: 'mesonefrosaren aurrean: gonadak', from: 0.4 },
      ],
      note: 'Gonadak mesonefrosaren aurreko aldean garatzen dira: gandor urogenitala bitan, gandor urinarioa eta gandor gonadala',
    },
    {
      to: { muller: 1, mullerJoin: 1 },
      run: [0.03, 0.6],
      cam: FRONT16(17, [0, -0.95, -0.3], 10, 6),
      glide: 0.05,
      dim: ['hodi-mesonefrikoa', 'hodi-paramesonefrikoa'],
      names: [
        { id: 'hodi-mesonefrikoa', sub: 'Wolff' },
        // Named at its cranial end, where it starts (it grows down from there).
        { id: 'hodi-paramesonefrikoa', p: 'muller-sarrera', sub: 'Müller · goitik behera hazten' },
      ],
      note: 'Ondoren hodi urogenitalak: hodi mesonefrikoa (Wolff) eta hodi paramesonefrikoa (Müller)',
    },
    {
      to: { gonadDown: 1 },
      run: [0.08, 0.8],
      cam: FRONT16(15, [0, -1.6, -0.3], -12, 6),
      glide: 0.05,
      dim: ['gonadak'],
      names: [{ id: 'gonadak', sub: 'garatu ondoren: jaitsi', from: 0.2 }],
      note: 'Garapenaren ostean gonadak jaitsi egiten dira; azkenik kanpo genitalak garatzen dira',
    },
  ],
};
export const Intro16 = poseStage(spec1, build);

// ———————————————————————————— 2. Hozi zelulak ————————————————————————————

export const S2 = [0, 0.3, 0.62] as const;

const spec2: StageSpec<UroPose, UroOpts> = {
  S: S2,
  pose: { ...BASE, germ: 0 },
  opts: { glom: 0, gut: 1, yolk: 1 },
  caption: CAP,
  key: KEY16.germ,
  steps: [
    {
      cam: FRONT16(13, [0, -1.6, 0.3], 40, 8),
      glide: 0.06,
      dim: ['bitelo-zaku-sekundarioa', 'alantoidea', 'gonada-gandorra'],
      names: [
        { id: 'bitelo-zaku-sekundarioa', text: 'Bitelo zakua' },
        { id: 'alantoidea', from: 0.3 },
        { id: 'gonada-gandorra', sub: 'helmuga (6. astea)', from: 0.5 },
      ],
      note: 'Hasierako hozi zelulak 3. astetik 6. astera: alantoidetik hurbil sortu eta gandor genitaleraino',
    },
    {
      to: { germ: 0.12 },
      run: [0.15, 0.9],
      cam: FRONT16(9, [0, -3.2, 1.2], 55, 10),
      glide: 0.06,
      dim: ['hasierako-hozi-zelulak', 'bitelo-zaku-sekundarioa', 'alantoidea'],
      names: [
        { id: 'bitelo-zaku-sekundarioa', text: 'Bitelo zakua', small: true },
        { id: 'hasierako-hozi-zelulak', sub: 'bitelo zakuaren endodermoa, alantoidetik hurbil (3. astea)', from: 0.2 },
      ],
      note: '3. astean, alantoidetik hurbileko bitelo zakuaren endodermoko zelulak bereizten dira: hasierako hozi zelulak',
    },
    {
      to: { germ: 1 },
      run: [0.05, 0.9],
      cam: FRONT16(12, [0, -2.0, 0.1], 30, 8),
      glide: 0.06,
      dim: ['hasierako-hozi-zelulak', 'atzeko-hestea', 'gonada-gandorra'],
      names: [
        { id: 'hasierako-hozi-zelulak', sub: 'alantoidea → atzeko hestearen pareta → mesoa' },
        { id: 'atzeko-hestea', small: true, from: 0.2 },
        { id: 'gonada-gandorra', sub: '6. asterako', from: 0.55 },
      ],
      note: 'Alantoidea gida: atzeko hestearen paretatik eta haren mesotik gonada gandorretara sartzen dira, 6. asterako',
    },
  ],
};
export const Germ16 = poseStage(spec2, build);

// ———————————————————————————— 4. Hodi paramesonefrikoa (Müller) ————————————————————————————

export const S4 = [0, 0.25, 0.5, 0.75] as const;

const spec4: StageSpec<UroPose, UroOpts> = {
  S: S4,
  pose: { ...BASE },
  opts: { glom: 0, gut: 1 },
  caption: CAP,
  key: KEY16.ducts,
  steps: [
    {
      to: { muller: 0.55 },
      run: [0.1, 0.9],
      cam: FRONT16(11, [0, 0.4, -0.3], 24, 8),
      glide: 0.06,
      dim: ['hodi-paramesonefrikoa', 'hodi-mesonefrikoa', 'mesonefrosa'],
      names: [
        { id: 'hodi-paramesonefrikoa', sub: 'Wolff hodiaren aurre-alboan', from: 0.2 },
        { id: 'hodi-mesonefrikoa', small: true },
      ],
      note: 'Hodi paramesonefrikoa (Müller) mesonefrosan, hodi mesonefrikoaren aurre-alboan. Ez du gernu sisteman parte hartzen: sistema genitalean bai',
    },
    {
      to: { muller: 0.85, mesoGone: 0.6 },
      run: [0.06, 0.85],
      cam: FRONT16(12, [0, -1.6, -0.2], 34, 10),
      glide: 0.05,
      dim: ['hodi-paramesonefrikoa', 'hodi-mesonefrikoa'],
      names: [
        { id: 'hodi-paramesonefrikoa', sub: 'mesonefrikoaren gainetik pasatzen da' },
        { id: 'mesonefrosa', sub: 'endekatzen hasita', small: true, from: 0.4 },
        { id: 'hodi-mesonefrikoa', small: true },
      ],
      note: 'Hodi paramesonefrikoak mesonefrikoen gainetik pasatzen dira; une honetan mesonefrosa endekatzen hasita dago',
    },
    {
      cam: FRONT16(8, [0, 1.8, -0.3], 20, 10),
      glide: 0.05,
      dim: ['hodi-paramesonefrikoa'],
      names: [{ id: 'hodi-paramesonefrikoa', p: 'muller-sarrera', text: 'Goiko muturra', sub: 'barneko zelomara irekita → tronpak', key: 'goian' }],
      note: 'Egitura bilaterala. Goikaldean barneko zelomara irekita dago: hemendik Falopioren tronpak',
    },
    {
      to: { muller: 1, mullerJoin: 1 },
      run: [0.06, 0.8],
      cam: FRONT16(8, [0, -3.6, 0.0], 14, 14),
      glide: 0.06,
      dim: ['hodi-paramesonefrikoa', 'tuberkulu-paramesonefrikoa', 'kloaka'],
      names: [
        { id: 'hodi-paramesonefrikoa', sub: 'erdialderantz: batu, fusionatu gabe (trenkada)' },
        { id: 'tuberkulu-paramesonefrikoa', sub: 'sinuaren atzeko horman', from: 0.5 },
      ],
      note: 'Behean erdialderantz doaz eta batera iristen dira, fusionatu gabe (trenkada bat tartean), sinu urogenitalaren atzeko hormako goragunera: tuberkulu paramesonefrikoa',
    },
  ],
};
export const Muller16 = poseStage(spec4, build);
void endPose;
