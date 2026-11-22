'use client';

import { orbit, poseStage as poseStage14, type PoseModel, type StageSpec, type Where } from '@/components/scenes/week14/common';
import type { Camera3, V3 } from '@/lib/three-d/math';
import { LOOK_V2 } from '@/lib/three-d/scene';
import { UC } from '@/components/scenes/week15/uro-model';
import { GC16 } from './gonad-model';

export { orbit, endPose, type StageSpec } from '@/components/scenes/week14/common';
export { BLOCK_AXES } from '@/components/scenes/week15/unit-model';

/** Topic 16 continues topic 15's way: one posed model per subject, names in the edge columns, a gliding camera. */
export const CONT16 = 'gonadak-16';

/**
 * Where each of the topic's models lies in the whole embryo: a stage opened cold (a link, a jump from the menu)
 * flies in from outside the embryo to its model, whichever stage it is. Reached from the stage before, the
 * camera flies or glides from that one instead (`site`), and this is not played.
 */
const face = (z: number, a: number, b: number, at: V3 = [0, 0, 0]) => ({ center: [at[0], at[1], at[2] + z] as V3, a: [a, 0, 0] as V3, b: [0, b, 0] as V3 });
export const WHERE16: Record<string, Where> = {
  wall: { th: 0, at: [0, -0.3, -0.25], scale: 1.3, planes: [face(-0.62, 1.6, 3.4, [0, -0.3, 0])], note: 'Enbrioiaren enborra, lepotik kloakaraino: atzeko pareta aurretik ikusiko dugu' },
  gonad: { th: -0.2, at: [0, 0.1, 0], frame: 'block', scale: 1.8, planes: [face(-0.9, 2.3, 1.75, [0, 0.1, 0]), face(0.9, 2.3, 1.75, [0, 0.1, 0])], note: 'Gerriko mailako zeharkako ebakia: gonada mesonefrosaren ondoan; blokea goitik ikusiko dugu' },
  ducts: { th: -0.9, at: [0, -0.9, 0.5], scale: 1.5, planes: [face(-0.8, 2.3, 2.9, [0, -0.9, 0])], note: 'Enborraren behealdea: atzeko pareta aurretik, gonadak eta hodi genitalak gainean' },
  broad: { th: -1.1, at: [0, 0, 0], frame: 'block', scale: 1.8, planes: [face(-0.85, 2.3, 1.8), face(0.85, 2.3, 1.8)], note: 'Pelbisaren mailako zeharkako ebakia (emea): blokea goitik ikusiko dugu' },
  descent: { th: -1.0, at: [0, -0.4, 0.2], scale: 1.5, planes: [{ center: [0.9, -0.6, 0.2], a: [0, 0, 1.8], b: [0, 2.4, 0] }], note: 'Enborraren behealdea, barrabilaren ondotik moztuta (sagitala), ezkerretik ikusita' },
  external: { th: -1.75, at: [0, -2.6, 0.6], frame: 'perineum', scale: 3, planes: [face(0.2, 2.2, 2.2)], note: 'Kanpo genitalak: enbrioiaren behealdea, behetik eta aurretik ikusita' },
};

export function poseStage<P, O extends { dim?: { ids: readonly string[]; k: number } | null }>(spec: StageSpec<P, O>, build: (pose: P, opts: O) => PoseModel) {
  return poseStage14({ right: [236, 468], look: LOOK_V2, fit: {}, strictAnchors: true, where: spec.site ? WHERE16[spec.site.key] : undefined, ...spec }, build, false, CONT16);
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
    { color: UC.wolff, text: 'hodi mesonefrikoa' },
    { color: UC.muller, text: 'hodi paramesonefrikoa' },
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
    { color: UC.wolff, text: 'hodi mesonefrikoa' },
    { color: UC.muller, text: 'hodi paramesonefrikoa' },
  ],
  testis: [
    { color: GC16.testisCord, text: 'barrabil kordoiak' },
    { color: GC16.leydig, text: 'Leydig' },
    { color: UC.wolff, text: 'hodi mesonefrikoa' },
    { color: UC.muller, text: 'hodi paramesonefrikoa' },
  ],
  ovary: [
    { color: GC16.cord, text: 'kortex kordoiak' },
    { color: GC16.oocyte, text: 'obozitoak' },
    { color: GC16.follicle, text: 'folikulu zelulak' },
  ],
  female: [
    { color: UC.gonad, text: 'obulutegia' },
    { color: UC.muller, text: 'tronpak, uteroa' },
    { color: UC.endo, text: 'sinu urogenitala' },
    { color: '#c9c1b2', text: 'lotailuak' },
  ],
  vagina: [
    { color: UC.muller, text: 'hodi paramesonefrikoak (mesodermoa)' },
    { color: UC.endo, text: 'sinua (endodermoa)' },
  ],
} as const;
