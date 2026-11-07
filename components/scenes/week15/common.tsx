'use client';

import { orbit, poseStage as poseStage14, type PoseModel, type StageSpec as StageSpec14 } from '@/components/scenes/week14/common';
import type { Camera3, V3 } from '@/lib/three-d/math';
import { UC } from './uro-model';
import { MAP_LEFT, UroMap, type UroFocus } from './UroMap';

export { orbit, endPose, poseAt, type Step, type Where } from '@/components/scenes/week14/common';
export type { UroFocus } from './UroMap';

/** A topic-15 stage: topic 14's spec, plus where in the embryo its model is (the corner map). */
export type StageSpec<P, O> = StageSpec14<P, O> & { map?: UroFocus };

/**
 * Topic 15 in the circulation topics' way (10–13): one posed 3D model per subject, the whole posterior wall
 * or the whole section always in sight round the thing that changes, names in the edge columns, one colour
 * key of four entries at most, a camera that glides and never cuts.
 */
export const CONT15 = 'gernua-15';

export function poseStage<P, O extends { dim?: { ids: readonly string[]; k: number } | null }>(spec: StageSpec<P, O>, build: (pose: P, opts: O) => PoseModel) {
  const { map, ...rest } = spec;
  // "Non gaude?": the notes' side view of the embryo with the three kidneys, the stage's part lit, in the corner
  // of every view (it hides with the names during the fly-in, which shows the whole embryo itself).
  const section = rest.section ?? (map ? () => ({ show: 1, node: <UroMap focus={map} />, left: MAP_LEFT }) : undefined);
  // Names keep above the camera keys (bottom right of the frame; the column also stops above them by itself).
  return poseStage14({ right: [236, 540], ...rest, section }, build, false, CONT15);
}

/** Front view of the posterior wall: yaw 0 = from the front (the embryo's left on the viewer's right). */
export const FRONT = (dist = 17, target: V3 = [0, -0.3, -0.4], yaw = 0, elev = 6, shift: [number, number] = [20, 0]): Camera3 => orbit(yaw, elev, dist, target, shift);

/** The section block from the cranial side (dorsal up), a little turned so its thickness shows. */
export const BLOCK = (dist = 9.6, target: V3 = [0, 0.1, 0], yaw = 12, elev = 10, shift: [number, number] = [10, 10]): Camera3 => orbit(yaw, elev, dist, target, shift);

/** Colour keys (four entries at most, so the key never reaches the frame's controls). */
export const KEY15 = {
  three: [
    { color: UC.pro, text: 'pronefrosa' },
    { color: UC.meso, text: 'mesonefrosa' },
    { color: UC.wolff, text: 'Wolff hodia' },
    { color: UC.blast, text: 'metanefrosa' },
  ],
  pro: [
    { color: UC.inter, text: 'bitarteko meso.' },
    { color: UC.pro, text: 'pronefrosa' },
    { color: UC.aorta, text: 'aorta' },
  ],
  meso: [
    { color: UC.meso, text: 'hodixkak' },
    { color: UC.wolff, text: 'Wolff hodia' },
    { color: UC.aorta, text: 'glomeruluak' },
    { color: UC.gonad, text: 'gonada g.' },
  ],
  meta: [
    { color: UC.wolff, text: 'Wolff hodia' },
    { color: UC.bud, text: 'ureter kimua' },
    { color: UC.blast, text: 'blastema' },
  ],
  ascent: [
    { color: UC.kidney, text: 'giltzurruna' },
    { color: UC.bud, text: 'ureterra' },
    { color: UC.adrenal, text: 'g. gaineko guruina' },
    { color: UC.gonad, text: 'gonada' },
  ],
} as const;
