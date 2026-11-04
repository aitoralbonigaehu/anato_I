'use client';

import { orbit, poseStage as poseStage14, type PoseModel, type StageSpec } from '@/components/scenes/week14/common';
import type { Camera3, V3 } from '@/lib/three-d/math';
import { UC } from '@/components/scenes/week15/uro-model';
import { GC16 } from './gonad-model';

export { orbit, endPose, type StageSpec } from '@/components/scenes/week14/common';
export { BLOCK_AXES } from '@/components/scenes/week15/unit-model';

/** Topic 16 continues topic 15's way: one posed model per subject, names in the edge columns, a gliding camera. */
export const CONT16 = 'gonadak-16';

export function poseStage<P, O extends { dim?: { ids: readonly string[]; k: number } | null }>(spec: StageSpec<P, O>, build: (pose: P, opts: O) => PoseModel) {
  return poseStage14({ right: [236, 468], ...spec }, build, false, CONT16);
}

/** From the front (the embryo's left on the viewer's right). */
export const FRONT16 = (dist = 12, target: V3 = [0, -0.5, 0], yaw = 0, elev = 6, shift: [number, number] = [20, 0]): Camera3 => orbit(yaw, elev, dist, target, shift);
/** From the embryo's left side (the belly on the viewer's left, as the notes' sagittal figures). */
export const LEFT16 = (dist = 9, target: V3 = [0.6, -0.8, 0.3], yaw = 90, elev = 4, shift: [number, number] = [20, 0]): Camera3 => orbit(yaw, elev, dist, target, shift);
/** A section block from the cranial side (dorsal up). */
export const BLOCK16 = (dist = 9, target: V3 = [0, 0, 0], yaw = 10, elev = 10, shift: [number, number] = [10, 10]): Camera3 => orbit(yaw, elev, dist, target, shift);

/** Colour keys (four entries at most). */
export const KEY16 = {
  ducts: [
    { color: UC.gonad, text: 'gonada' },
    { color: UC.wolff, text: 'Wolff hodia' },
    { color: UC.muller, text: 'Müller hodia' },
    { color: UC.endo, text: 'sinu urogenitala' },
  ],
  germ: [
    { color: UC.germ, text: 'hozi zelulak' },
    { color: UC.endo, text: 'endodermoa' },
    { color: UC.gonad, text: 'gonada gandorra' },
  ],
  gonad: [
    { color: UC.germ, text: 'hozi zelulak' },
    { color: GC16.cord, text: 'sexu kordoiak' },
    { color: UC.wolff, text: 'Wolff hodia' },
    { color: UC.muller, text: 'Müller hodia' },
  ],
  testis: [
    { color: GC16.testisCord, text: 'barrabil kordoiak' },
    { color: GC16.leydig, text: 'Leydig' },
    { color: UC.wolff, text: 'Wolff hodia' },
    { color: UC.muller, text: 'Müller hodia' },
  ],
  ovary: [
    { color: GC16.cord, text: 'kortex kordoiak' },
    { color: GC16.oocyte, text: 'obozitoak' },
    { color: GC16.follicle, text: 'folikulu zelulak' },
  ],
  vagina: [
    { color: UC.muller, text: 'Müller (mesodermoa)' },
    { color: UC.endo, text: 'sinua (endodermoa)' },
  ],
} as const;
