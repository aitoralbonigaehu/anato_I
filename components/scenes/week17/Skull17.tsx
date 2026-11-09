'use client';

import type { SceneProps } from '@/components/kit';
import { Loading3D } from '@/components/kit/three/Stage3D';
import { useGeoReady } from '@/lib/three-d/offthread';
import type { ComponentType } from 'react';
import { FRONT, KEY_ARCH, SIDE, TISSUE, endPose, poseStage17, type StageSpec } from './common';
import { SKULL0, SKULL_GEO, skullModel, type SkullOpts, type SkullPose } from './skull-model';

/**
 * Topic 17 §1 on the fetal skull (skull-model.ts). Axes: x the fetus's left, y cranial, z ventral. Seen from above
 * with the forehead at the top of the frame (as the notes' figure), the fetus's left is on the viewer's left.
 */

const build = (pose: SkullPose, opts: SkullOpts) => skullModel(pose, opts);

function withGeo(View: ComponentType<SceneProps> & { geo?: string[] }) {
  function Scene(props: SceneProps) {
    return useGeoReady([SKULL_GEO]) ? <View {...props} /> : <Loading3D />;
  }
  Scene.geo = ['skull17', ...(View.geo ?? [])];
  return Scene;
}

const CAP = 'Fetuaren burezurra (3D eredua)';
const CAP_TOP = 'Burezurra goitik (3D eredua): kopeta goian, fetuaren ezkerra zure ezkerrean';
const KEY_ORIGIN = [
  { color: TISSUE.crest, text: 'gandor neurala' },
  { color: TISSUE.paraxial, text: 'mesodermo paraxiala' },
] as const;
const TOP = (yaw = 180, elev = 76) => FRONT(14, [0, 0.4, 0], yaw, elev);

// ———————————————————————————— Sarrera ————————————————————————————

export const SA = [0, 0.5] as const;
const specA: StageSpec<SkullPose, SkullOpts> = {
  S: SA,
  pose: SKULL0,
  opts: {},
  caption: CAP,
  map: 'all',
  steps: [
    {
      cam: FRONT(15, [0, -0.6, 0], 42, 8),
      glide: 0.08,
      names: [
        { id: 'neurokraneoa', text: 'Neurokraneoa', from: 0.15 },
        { id: 'errai-kraneoa', text: 'Errai kraneoa', from: 0.35 },
      ],
      note: 'Burua eta lepoa (I): lehenik kraneoaren garapena, gero faringe-arkuak eta eratorriak',
    },
    {
      to: { archTint: 1 },
      run: [0.1, 0.7],
      cam: SIDE(15, [0, -0.8, 0], 70, 6),
      glide: 0.08,
      key: KEY_ARCH,
      keyTitle: 'Kolorea = arkua',
      names: [
        { id: 'baraila', from: 0.3 },
        { id: 'hioide-hezurra', text: 'Hioide hezurra', from: 0.5 },
      ],
      note: 'Bidea: kolore bakoitza faringe-arku bat da, enbrioitik helduraino kolore bera',
    },
  ],
};
export const Intro17 = withGeo(poseStage17(specA, build));

// ———————————————————————————— Kraneoaren bi atalak ————————————————————————————

export const SB = [0, 0.3, 0.55, 0.78] as const;
const specB: StageSpec<SkullPose, SkullOpts> = {
  S: SB,
  pose: SKULL0,
  opts: {},
  caption: CAP,
  map: 'skull',
  steps: [
    {
      cam: SIDE(15, [0, -0.6, 0], 90, 4),
      fit: false,
      names: [
        { id: 'neurokraneoa', sub: 'garuna inguratu eta babestu' },
        { id: 'errai-kraneoa', sub: 'aurpegiko hezurrak', from: 0.35 },
      ],
      note: 'Kraneoan bi atal nagusi: neurokraneoa eta errai kraneoa',
    },
    {
      to: { lid: 0.34, brain: 1 },
      run: [0.1, 0.75],
      cam: FRONT(17, [0, 0.8, 0], 55, 16),
      fit: false,
      glide: 0.06,
      dim: ['neurokraneoa', 'entzefaloa', 'buru-ganga'],
      names: [
        { id: 'entzefaloa', sub: 'barnean dago', from: 0.4 },
        { id: 'neurokraneoa', from: 0.1 },
      ],
      note: 'Neurokraneoa: garuna inguratu eta babesten duten hezurrak. Entzefaloa dago barnean',
    },
    {
      to: { lid: 0, brain: 0, origin: 1 },
      run: [0.06, 0.6],
      cam: FRONT(15, [0, 0.2, 0], 118, 28),
      fit: false,
      glide: 0.06,
      dim: ['neurokraneoa', 'buru-ganga'],
      key: KEY_ORIGIN,
      keyTitle: 'Kolorea = jatorria',
      names: [
        { id: 'hezur-frontala', sub: 'gandor neurala', from: 0.3 },
        { id: 'hezur-parietala', sub: 'somita okzipitalen mesodermo paraxiala', from: 0.5 },
      ],
      note: 'Neurokraneoa bi jatorritik: somita okzipitaletako mesodermo paraxiala eta gandor neuraleko zelulak',
    },
    {
      to: { faceOrigin: 1 },
      run: [0.06, 0.6],
      cam: FRONT(14, [0, -1.2, 0.8], 40, 2),
      fit: false,
      glide: 0.06,
      dim: ['errai-kraneoa'],
      key: KEY_ORIGIN,
      keyTitle: 'Kolorea = jatorria',
      names: [{ id: 'errai-kraneoa', sub: 'gandor neuraletik soilik', from: 0.3 }],
      note: 'Errai kraneoa: aurpegiko hezurrak, gandor neuraleko zeluletatik',
    },
  ],
};
export const TwoParts17 = withGeo(poseStage17(specB, build));

// ———————————————————————————— Josturak eta fontanelak ————————————————————————————

export const SC = [0, 0.24, 0.46, 0.68, 0.84] as const;
const specC: StageSpec<SkullPose, SkullOpts> = {
  S: SC,
  pose: { ...SKULL0, jaw: 0 },
  opts: {},
  caption: CAP_TOP,
  map: 'vault',
  steps: [
    {
      cam: TOP(),
      fit: false,
      glide: 0.05,
      dim: ['joskurak', 'hezur-frontala', 'hezur-parietala'],
      names: [
        { id: 'hezur-frontala', text: 'Hezur frontala' },
        { id: 'hezur-parietala', text: 'Hezur parietala' },
        { id: 'joskura-metopikoa', text: 'Jostura frontala', from: 0.2 },
        { id: 'joskura-koronala', text: 'Jostura koronala', from: 0.35 },
        { id: 'joskura-sagitala', text: 'Jostura sagitala', from: 0.5 },
        { id: 'joskura-lanbdoidea', text: 'Jostura lambdoidea', from: 0.65 },
      ],
      note: 'Josturak: hezur lauen arteko giltzapenak, hezurren arteko tarte estuak',
    },
    {
      cam: TOP(180, 72),
      fit: false,
      dim: ['fontanelak'],
      names: [
        { id: 'aurreko-fontanela', text: 'Aurreko fontanela' },
        { id: 'atzeko-fontanela', text: 'Atzeko fontanela', from: 0.3 },
      ],
      note: 'Josturak eratu baino lehen mintzak hezurrak lotzen ditu: fontanelak. Handienak: aurrekoa eta atzekoa',
    },
    {
      to: { mould: 1 },
      run: [0.1, 0.75],
      cam: TOP(180, 76),
      fit: false,
      dim: ['hezur-parietala', 'fontanelak'],
      names: [
        { id: 'hezur-parietala', sub: 'hurbildu: burua txikiago', from: 0.2 },
        { id: 'aurreko-fontanela', text: 'Aurreko fontanela', small: true, from: 0.3 },
      ],
      note: 'Erditzean parietalak hurbildu eta neurokraneoa txikitu: giltzatuta balego, buru trinkoak arazo larriak emango lituzke',
    },
    {
      to: { mould: 0, pfClose: 1 },
      run: [0.08, 0.8],
      cam: FRONT(11, [0, 1.2, -1.4], 180, 56),
      fit: false,
      glide: 0.05,
      dim: ['atzeko-fontanela', 'joskurak'],
      names: [{ id: 'atzeko-fontanela', text: 'Atzeko fontanela', sub: '2. hilabetean itxi' }],
      note: 'KONTUZ: testuak «2. hilabetean» dio, irudiak «3. hilabetean». Testua da nagusi: 2. hilabetean',
      warn: true,
    },
    {
      to: { afClose: 1, sutureClose: 0.6 },
      run: [0.08, 0.85],
      cam: FRONT(11, [0, 1.4, 1.2], 180, 70),
      fit: false,
      glide: 0.05,
      dim: ['aurreko-fontanela', 'joskurak'],
      names: [{ id: 'aurreko-fontanela', text: 'Aurreko fontanela', sub: '2. urtean itxi' }],
      note: 'Aurreko fontanela 2. urtean ixten da: fontanelak falta direnean, hezurrak josturen bidez bakarrik lotuta',
    },
  ],
};
export const Sutures17 = withGeo(poseStage17(specC, build));

// ———————————————————————————— Buru ganga ————————————————————————————

export const SD = [0, 0.34, 0.66] as const;
const specD: StageSpec<SkullPose, SkullOpts> = {
  S: SD,
  pose: { ...SKULL0, vault: 0, jaw: 0 },
  opts: {},
  caption: CAP,
  map: 'vault',
  steps: [
    {
      to: { vault: 1 },
      run: [0.12, 0.92],
      cam: FRONT(15, [0, 0.3, 0], 62, 26),
      fit: false,
      dim: ['buru-ganga', 'mintza'],
      names: [
        { id: 'buru-ganga', text: 'Buru ganga / Mintzezko neurokraneoa' },
        { id: 'mintza', text: 'Mintza', sub: 'mesenkima', from: 0.05 },
      ],
      note: 'Buru ganga: hezur lauak mintzean zuzenean hezurtzen dira, bakoitza bere zentrotik. Oinaldea, berriz, endokondrala',
    },
    {
      to: { origin: 1 },
      run: [0.08, 0.5],
      cam: FRONT(14, [0, 0.4, 0.4], 28, 22),
      fit: false,
      glide: 0.05,
      dim: ['hezur-frontala'],
      key: KEY_ORIGIN,
      keyTitle: 'Kolorea = jatorria',
      names: [{ id: 'hezur-frontala', text: 'Hezur frontalak', sub: 'gandor neurala · mintzezkoa', from: 0.25 }],
      note: 'Hezur frontalak: gandor neuraleko zeluletatik garatu, mintzezko hezurtzez',
    },
    {
      cam: FRONT(15, [0, 0.4, -0.4], 135, 26),
      fit: false,
      glide: 0.05,
      dim: ['hezur-parietala', 'okzipitalaren-ezkata'],
      key: KEY_ORIGIN,
      keyTitle: 'Kolorea = jatorria',
      names: [
        { id: 'hezur-parietala', text: 'Parietalak', sub: 'mesodermo paraxiala · mintzezkoa', from: 0.2 },
        { id: 'okzipitalaren-ezkata', text: 'Okzipitalaren ezkata', sub: 'mesodermo paraxiala · mintzezkoa', from: 0.45 },
      ],
      note: 'Parietalak eta okzipitalaren ezkata: mesodermo paraxialaren eratorriak, hauek ere mintzezko hezurtzez',
    },
  ],
};
export const Vault17 = withGeo(poseStage17(specD, build));
void endPose;

// ———————————————————————————— Errai kraneoa ————————————————————————————

export const SE = [0, 0.36, 0.68] as const;
const specE: StageSpec<SkullPose, SkullOpts> = {
  S: SE,
  pose: { ...SKULL0, face: 0 },
  opts: {},
  caption: CAP,
  map: 'face-bones',
  steps: [
    {
      to: { face: 1 },
      run: [0.1, 0.9],
      cam: FRONT(13, [0, -1.3, 0.9], 48, 2),
      fit: false,
      dim: ['errai-kraneoa'],
      names: [
        { id: 'hezur-maxilarra', from: 0.25 },
        { id: 'zigomatikoa', from: 0.4 },
        { id: 'baraila', from: 0.55 },
      ],
      note: 'Errai kraneoa: aurpegiko hezurrak, mintzezko hezurtzearen ondorioz (kartilagorik gabe)',
    },
    {
      to: { faceOrigin: 1 },
      run: [0.08, 0.55],
      cam: FRONT(13, [0, -1.3, 0.9], 28, 2),
      fit: false,
      glide: 0.05,
      dim: ['errai-kraneoa'],
      key: KEY_ORIGIN.slice(0, 1),
      keyTitle: 'Kolorea = jatorria',
      names: [{ id: 'errai-kraneoa', text: 'Errai kraneoa', sub: 'gandor neuraleko zeluletatik', from: 0.2 }],
      note: 'Hemengo hezurrak gandor neuraleko zeluletatik garatzen dira',
    },
    {
      to: { faceOrigin: 0, archTint: 1 },
      run: [0.08, 0.6],
      cam: SIDE(15, [0, -1.6, 0.6], 66, 2),
      glide: 0.05,
      fit: false,
      dim: ['errai-kraneoa', 'hioide-hezurra', 'estiloide-apofisia', 'tenporalaren-ezkata'],
      key: KEY_ARCH.slice(0, 3),
      keyTitle: 'Kolorea = arkua',
      names: [
        { id: 'baraila', sub: 'I. arkua', from: 0.2 },
        { id: 'estiloide-apofisia', sub: 'II. arkua', from: 0.4 },
        { id: 'hioide-hezurra', text: 'Hioide hezurra', from: 0.6 },
      ],
      note: '1. eta 2. arku faringeoen/brankialen eratorriak dira',
    },
  ],
};
export const Viscero17 = withGeo(poseStage17(specE, build));
