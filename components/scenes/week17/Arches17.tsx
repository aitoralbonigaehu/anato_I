'use client';

import './HeadMap'; // first: common.tsx and HeadMap.tsx import each other, and HeadMap needs ARCH at load
import type { SceneProps } from '@/components/kit';
import { Loading3D } from '@/components/kit/three/Stage3D';
import { useGeoReady } from '@/lib/three-d/offthread';
import type { V3 } from '@/lib/three-d/math';
import { ARCH_HEAD, AP0, V_OTHER, archModel, type ArchOpts, type ArchPose } from './arch-model';
import { ARCH, KEY_ARCH, poseStage17, SIDE, endPose, type StageSpec } from './common';
import { SITE17 } from './sites';

/**
 * Topic 17, 2.2 and 2.5 on the embryo's head from the left (arch-model.ts): the trigeminal nerve and its three
 * branches, the two processes of arch I round the stomodeum, arch V appearing and regressing.
 */

const build = (pose: ArchPose, opts: ArchOpts) => archModel(pose, opts);
const CAP = 'Enbrioiaren burua eta lepoa, ezkerretik (3D eredua): aurpegia zure ezkerrean';

/** Waits for the sculpted head as well as the fly-in's whole embryo. */
function withHead(View: ReturnType<typeof poseStage17>) {
  function Scene(props: SceneProps) {
    return useGeoReady([ARCH_HEAD]) ? <View {...props} /> : <Loading3D />;
  }
  Scene.geo = ['embryo5', 'arch-head'];
  Scene.spec = (View as { spec?: unknown }).spec;
  return Scene;
}

const T: V3 = [0, 0, 0];

// ———————————————————————————— Lehen arkuaren bi luzapenak ————————————————————————————
// Played first (notes 2.2 opens on the two processes); V3 enters the mandibular process here and stays.

export const S_P = [0, 0.3, 0.65] as const;

const specP: StageSpec<ArchPose, ArchOpts> = {
  S: S_P,
  site: SITE17.arch,
  arrive: 'Garunetik enbrioiaren burura: ezkerretik, I. arkua eta bere bi luzapenak',
  pose: AP0,
  opts: {},
  caption: CAP,
  map: 'arch1',
  key: [{ color: ARCH.i, text: 'I. arkua: bi luzapen' }],
  steps: [
    {
      cam: SIDE(15, [0, -0.3, 1], 62, -12),
      fit: ['luzapen-maxilarra', 'barail-luzapena', 'estomodeoa'],
      dim: ['luzapen-maxilarra', 'barail-luzapena', 'estomodeoa'],
      names: [
        { id: 'luzapen-maxilarra', sub: 'estomodeoaren goikaldetik' },
        { id: 'barail-luzapena', sub: 'estomodeoaren behekaldetik', from: 0.25 },
        { id: 'estomodeoa', from: 0.5 },
      ],
      note: 'I. arkua sudurretik beherantz hasten da: bi luzapen ditu estomodeoaren inguruan. Maxilarra goian, baraila behean',
    },
    {
      to: { open1: 1, gasser: 1, v3: 1 },
      run: [0.06, 0.75],
      cam: SIDE(14, [0, 0, 0.3], 88, 0),
      fit: ['barail-luzapena', 'barail-nerbioa'],
      glide: 0.05,
      dim: ['barail-luzapena', 'barail-nerbioa'],
      names: [
        { id: 'barail-nerbioa', text: 'V3 · barail-nerbioa', from: 0.45 },
        { id: 'barail-luzapena', sub: 'hemen baraila', from: 0.6 },
      ],
      note: 'Arku honetan V3 (barail-nerbioa) doa barail luzapenera: bertan garatuko da baraila',
    },
    {
      to: { open1: 0 },
      run: [0.06, 0.6],
      cam: SIDE(14, [0, 0.4, 0.2], 96, 4),
      fit: ['luzapen-maxilarra', 'barail-luzapena'],
      glide: 0.05,
      dim: ['luzapen-maxilarra', 'barail-luzapena'],
      names: [
        { id: 'luzapen-maxilarra', text: 'Luzapen maxilarra', sub: 'arkuaren alde dortsala: hezur maxilarra' },
      ],
      note: 'Arkuaren alde dortsalean luzapen maxilarra: bertan, besteak beste, hezur maxilarra garatzen da',
    },
  ],
};
export const Processes17 = withHead(poseStage17(specP, build));

// ———————————————————————————— Trigeminoa: V3 da arkuaren nerbioa ————————————————————————————
// Played after the cartilages (notes 2.2.2): the head as the processes stage left it, V3 already in the arch.

export const S_V = [0, 0.2, 0.42, 0.62, 0.82] as const;

const endP = endPose(specP).pose;
const specV: StageSpec<ArchPose, ArchOpts> = {
  S: S_V,
  site: SITE17.arch,
  arrive: 'Enbrioiaren burura itzuli gara: I. arkuaren nerbioa, trigeminoaren hirugarren adarra',
  pose: endP,
  opts: {},
  caption: CAP,
  map: 'arch1',
  key: [
    { color: ARCH.i, text: 'I. arkua · V3' },
    { color: V_OTHER, text: 'V1, V2: ez arkuan' },
  ],
  steps: [
    {
      to: { glass: 1, open1: 1 },
      run: [0.1, 0.7],
      cam: SIDE(17, T, 90, 4),
      fit: ['gasser-gongoila', 'barail-nerbioa', 'lehen-arkua'],
      dim: ['gasser-gongoila', 'barail-nerbioa', 'lehen-arkua'],
      names: [
        { id: 'gasser-gongoila', text: 'Gasser gongoila', sub: 'trigeminoa (V)' },
        { id: 'barail-nerbioa', text: 'V3 · barail-nerbioa', sub: 'I. arkuaren nerbioa', from: 0.3 },
        { id: 'lehen-arkua', text: 'I. arkua', sub: 'kranealena', from: 0.5 },
      ],
      note: 'Arku bakoitzari nerbio bat: I. arkuari V3, barail-nerbioa, trigeminoaren (V) hirugarren adarra. Gongoil nagusi bat du (Gasser), hiru adarrekin',
      plainNote: 'Arku bakoitzari nerbio bat: I. arkuari V3, barail-nerbioa, trigeminoaren (V) hirugarren adarra. Trigeminoak hiru adar ditu',
      plainNames: [
        { id: 'gasser-gongoila', text: 'Trigeminoa (V)', sub: 'hiru adar' },
        { id: 'barail-nerbioa', text: 'V3 · barail-nerbioa', sub: 'I. arkuaren nerbioa', from: 0.3 },
        { id: 'lehen-arkua', text: 'I. arkua', sub: 'kranealena', from: 0.5 },
      ],
    },
    {
      to: { v1: 1 },
      run: [0.06, 0.8],
      cam: SIDE(14, [0, 1.6, 0.8], 80, 6),
      fit: ['nerbio-oftalmikoa', 'gasser-gongoila', 'begia'],
      glide: 0.05,
      dim: ['nerbio-oftalmikoa', 'gasser-gongoila', 'begia'],
      names: [
        { id: 'nerbio-oftalmikoa', text: 'V1 · adar oftalmikoa', sub: 'begirantz; ez du ikusmena ematen · 1. arkuan EZ', from: 0.25 },
        { id: 'begia', small: true, from: 0.5 },
      ],
      note: 'Goitik behera lehena, V1: begirantz doa, baina ez dauka ikusmenarekin zerikusirik. Gehien bat sentsitiboa. 1. faringe arkuan EZ',
      plainNote: 'Goitik behera lehena, V1, adar oftalmikoa. Gehien bat sentsitiboa. 1. faringe arkuan EZ',
      plainNames: [
        { id: 'nerbio-oftalmikoa', text: 'V1 · adar oftalmikoa', sub: 'gehien bat sentsitiboa · 1. arkuan EZ', from: 0.25 },
        { id: 'begia', small: true, from: 0.5 },
      ],
    },
    {
      to: { v2: 1 },
      run: [0.06, 0.8],
      cam: SIDE(14, [0, 0.9, 0.8], 76, 2),
      fit: ['nerbio-maxilarra', 'gasser-gongoila', 'luzapen-maxilarra'],
      glide: 0.05,
      dim: ['nerbio-maxilarra', 'gasser-gongoila', 'luzapen-maxilarra'],
      names: [
        { id: 'nerbio-maxilarra', text: 'V2 · adar maxilarra', sub: 'sentsitiboa: aurpegiko azala · 1. arkuan EZ', from: 0.25 },
        { id: 'luzapen-maxilarra', small: true, from: 0.5 },
      ],
      note: 'Tartekoa, V2: hezur maxilarrera doa, aurpegiaren behe erdikalderantz. Sentsitiboa. 1. faringe arkuan EZ',
      plainNote: 'Tartekoa, V2, adar maxilarra. Sentsitiboa. 1. faringe arkuan EZ',
      plainNames: [
        { id: 'nerbio-maxilarra', text: 'V2 · adar maxilarra', sub: 'sentsitiboa · 1. arkuan EZ', from: 0.25 },
        { id: 'luzapen-maxilarra', small: true, from: 0.5 },
      ],
    },
    {
      cam: SIDE(14, [0, 0.2, 0], 84, 0),
      fit: ['barail-nerbioa', 'gasser-gongoila', 'barail-luzapena'],
      glide: 0.05,
      dim: ['barail-nerbioa', 'gasser-gongoila', 'barail-luzapena'],
      names: [
        { id: 'barail-nerbioa', text: 'V3 · barail-nerbioa', sub: 'mistoa: trigeminoaren adar motor bakarra', from: 0.15 },
        { id: 'barail-luzapena', small: true, from: 0.4 },
      ],
      note: 'Azkena, V3: barail ingururantz. Sentsitiboa eta motorra: muskulu murtxikatzaileak mugitzen ditu (baraila igo); digastrikoak baraila jaisten du',
    },
    {
      cam: SIDE(15, [0, 0.8, 0.3], 90, 4),
      fit: ['trigeminoa', 'lehen-arkua'],
      glide: 0.05,
      dim: ['trigeminoa', 'gasser-gongoila', 'nerbio-oftalmikoa', 'nerbio-maxilarra', 'barail-nerbioa'],
      warn: true,
      names: [
        { id: 'nerbio-oftalmikoa', text: 'V1', sub: 'ez 1. arkuan' },
        { id: 'nerbio-maxilarra', text: 'V2', sub: 'ez 1. arkuan' },
        { id: 'barail-nerbioa', text: 'V3', sub: 'I. arkuaren nerbioa · mistoa' },
      ],
      note: 'V3 bakarrik da lehen arkuarena. KONTUZ: apunteek V1 "begiaren mugimenduetaz" dioten arren, begia III, IV eta VI. nerbioek mugitzen dute',
    },
  ],
};
export const Trigeminal17 = withHead(poseStage17(specV, build));

// ———————————————————————————— Bosgarren arkua ————————————————————————————

export const S_5 = [0, 0.5] as const;

const spec5: StageSpec<ArchPose, ArchOpts> = {
  S: S_5,
  site: SITE17.arch,
  arrive: 'Enbrioiaren burura itzuli gara: lepoko arkuak, IV.a eta VI.a',
  pose: AP0,
  opts: {},
  caption: CAP,
  map: 'arch5',
  key: KEY_ARCH,
  steps: [
    {
      to: { arch5: 1 },
      run: [0.1, 0.85],
      cam: SIDE(13, [0, -3, -1.5], 90, 2),
      fit: ['laugarren-arkua', 'seigarren-arkua', 'bosgarren-arkua'],
      dim: ['bosgarren-arkua', 'laugarren-arkua', 'seigarren-arkua'],
      names: [
        { id: 'laugarren-arkua', small: true },
        { id: 'seigarren-arkua', small: true },
        { id: 'bosgarren-arkua', sub: 'hasieran agertu', from: 0.5 },
      ],
      note: 'Hasieran V. arkua ere agertzen da, IV.aren eta VI.aren artean',
    },
    {
      to: { arch5: 0 },
      run: [0.1, 0.8],
      cam: SIDE(13, [0, -3, -1.5], 80, 2),
      fit: ['laugarren-arkua', 'seigarren-arkua'],
      glide: 0.05,
      dim: ['laugarren-arkua', 'seigarren-arkua'],
      names: [
        { id: 'laugarren-arkua', small: true },
        { id: 'seigarren-arkua', small: true },
      ],
      note: 'Garapenean desagertu edo endekatu egiten da: ez du eratorririk uzten. Horregatik IV.etik VI.era pasatzen da',
    },
  ],
};
export const FifthArch17 = withHead(poseStage17(spec5, build));
