'use client';

import { orbit, poseStage as poseStage14, type PoseModel, type StageSpec as StageSpec14 } from '@/components/scenes/week14/common';
import type { Camera3, V3 } from '@/lib/three-d/math';
import { LOOK_V2 } from '@/lib/three-d/scene';
import { HeadMap, MAP_LEFT, type HeadFocus } from './HeadMap';

export { orbit, endPose, poseAt, type Step, type Where, type PoseModel } from '@/components/scenes/week14/common';
export type { HeadFocus } from './HeadMap';

/**
 * Topics 17–18 (head and neck): shared machinery. See docs/handover/topic-17-18-plan.md.
 *
 * Axes of every model unless its file says otherwise: x towards the embryo's LEFT, y cranial, z ventral. From the
 * front (yaw 0) the embryo's left is on the viewer's right. From the embryo's left side (yaw 90) the face looks to
 * the viewer's LEFT, as the notes' lateral figures do.
 */

/** A topic-17/18 stage: topic 14's spec, plus the corner map saying where in the head and neck the model is. */
export type StageSpec<P, O> = StageSpec14<P, O> & { map?: HeadFocus };

import { ARCH } from './arch-colors';
export { ARCH, ARCH_DEEP } from './arch-colors';

/** Tissues (the notes' section figures: ectoderm blue, endoderm yellow, mesenchyme brown). */
export const TISSUE = {
  ecto: '#7cc0ee',
  ectoDeep: '#2c6c9b',
  endo: '#f6d365',
  endoDeep: '#a4811f',
  mes: '#c08a63',
  mesDeep: '#6d4629',
  crest: '#b58cf2',
  crestDeep: '#5c3a99',
  paraxial: '#e58a8a',
  paraxialDeep: '#8d3c3c',
  cartilage: '#a7dbd2',
  cartilageDeep: '#487f76',
  bone: '#efe5cf',
  boneDeep: '#94866a',
  muscle: '#d9625c',
  muscleDeep: '#7c2723',
  nerve: '#ffe36e',
  nerveDeep: '#94790f',
  artery: '#e5484d',
  arteryDeep: '#7f1d20',
  vein: '#5a7fd8',
  veinDeep: '#25407f',
  skin: '#efc4ae',
  skinDeep: '#96624c',
  ground: '#d9c6b6',
  groundDeep: '#7d6a5b',
} as const;

/** The camera continuity of each topic: a stage change on the same model glides, never cuts. */
export const CONT17 = 'burua-17';
export const CONT18 = 'burua-18';

type Dim = { dim?: { ids: readonly string[]; k: number } | null };

function stageWith<P, O extends Dim>(continuity: string, spec: StageSpec<P, O>, build: (pose: P, opts: O) => PoseModel) {
  const { map, ...rest } = spec;
  // "Non gaude?" in the corner of every view (it hides with the names during the fly-in).
  const section = rest.section ?? (map ? () => ({ show: 1, node: <HeadMap focus={map} />, left: MAP_LEFT }) : undefined);
  return poseStage14({ right: [236, 540], look: LOOK_V2, fit: {}, ...rest, section }, build, false, continuity);
}

export const poseStage17 = <P, O extends Dim>(spec: StageSpec<P, O>, build: (pose: P, opts: O) => PoseModel) => stageWith(CONT17, spec, build);
export const poseStage18 = <P, O extends Dim>(spec: StageSpec<P, O>, build: (pose: P, opts: O) => PoseModel) => stageWith(CONT18, spec, build);

/** From the front (the embryo's left on the viewer's right). */
export const FRONT = (dist = 9, target: V3 = [0, 0, 0], yaw = 0, elev = 4, shift: [number, number] = [20, 0]): Camera3 => orbit(yaw, elev, dist, target, shift);
/** From the embryo's left side (the face on the viewer's left, as the notes' lateral figures). */
export const SIDE = (dist = 9, target: V3 = [0, 0, 0], yaw = 90, elev = 4, shift: [number, number] = [20, 0]): Camera3 => orbit(yaw, elev, dist, target, shift);
/** From behind (the notes' dorsal "V" of the pharynx, the thyroid's back). */
export const BACK = (dist = 9, target: V3 = [0, 0, 0], yaw = 180, elev = 6, shift: [number, number] = [20, 0]): Camera3 => orbit(yaw, elev, dist, target, shift);
/** From below (the palate). */
export const BELOW = (dist = 8, target: V3 = [0, 0, 0], yaw = 0, elev = -70, shift: [number, number] = [20, 0]): Camera3 => orbit(yaw, elev, dist, target, shift);

/** The arches' key (four entries at most: IV and VI share one). */
export const KEY_ARCH = [
  { color: ARCH.i, text: 'I. arkua' },
  { color: ARCH.ii, text: 'II. arkua' },
  { color: ARCH.iii, text: 'III. arkua' },
  { color: ARCH.iv, text: 'IV.–VI. arkuak' },
] as const;

/** The germ layers' key (an arch in section). */
export const KEY_LAYERS = [
  { color: TISSUE.ecto, text: 'ektodermoa' },
  { color: TISSUE.endo, text: 'endodermoa' },
  { color: TISSUE.mes, text: 'mesenkima' },
] as const;
