'use client';

import { orbit, poseStage as poseStage14, type PoseModel, type StageSpec, type Where } from '@/components/scenes/week14/common';
import type { Camera3, V3 } from '@/lib/three-d/math';
import { LOOK_V2 } from '@/lib/three-d/scene';
import { C19 } from './tones';

export { endPose, orbit, type PoseModel, type StageSpec } from '@/components/scenes/week14/common';

/** Topic 19's camera continuity: a stage change on the same model glides, between models it flies. */
export const CONT19 = 'nerbio-19';

type Dim = { dim?: { ids: readonly string[]; k: number } | null };

/**
 * Cold entry (a stage opened from a link or the menu): where each model lies in the whole embryo. The adult models
 * (body, cord, brain, spine) have none: an adult is not flown into from the five-week embryo. The embryonic ones fly
 * in from the embryo (week14 `Where`).
 */
export const WHERE19: Record<string, Where> = {
  section: { th: 0, at: [0, 0, 0], frame: 'block', scale: 4, note: 'Enbrioiaren bizkarraldea, zeharka moztuta: hodi neurala eta gandor neurala' },
  neural: { th: 0.2, at: [0, 0.6, -0.3], scale: 0.8, note: 'Enbrioiaren bizkarraldea: nerbio sistema osoa hodi neuraletik dator' },
};

export function poseStage19<P, O extends Dim>(spec: StageSpec<P, O>, build: (pose: P, opts: O) => PoseModel) {
  const where = spec.where ?? (spec.site ? WHERE19[spec.site.key] : undefined);
  return poseStage14({ right: [236, 540], look: LOOK_V2, fit: {}, strictAnchors: true, where, ...spec }, build, false, CONT19);
}

/** From the front (the body's left on the viewer's right). */
export const FRONT19 = (dist = 12, target: V3 = [0, 0, 0], yaw = 0, elev = 4, shift: [number, number] = [20, 0]): Camera3 => orbit(yaw, elev, dist, target, shift);
/** From the body's left side (the face on the viewer's left, as the notes' sagittal figures). */
export const LEFT19 = (dist = 9, target: V3 = [0, 0, 0], yaw = 90, elev = 4, shift: [number, number] = [20, 0]): Camera3 => orbit(yaw, elev, dist, target, shift);
/** A block from above and in front (the cord block: dorsal up). */
export const BLOCK19 = (dist = 9, target: V3 = [0, 0, 0], yaw = 18, elev = 22, shift: [number, number] = [10, 0]): Camera3 => orbit(yaw, elev, dist, target, shift);

/** Colour keys (four entries at most). */
export const KEY19 = {
  cnsPns: [
    { color: C19.brain, text: 'nerbio sistema zentrala' },
    { color: C19.nerve, text: 'nerbio sistema periferikoa' },
  ],
  auto: [
    { color: C19.symp, text: 'sinpatikoa' },
    { color: C19.para, text: 'parasinpatikoa' },
    { color: C19.nerve, text: 'somatikoa' },
  ],
  function: [
    { color: C19.sens, text: 'sentsitiboa' },
    { color: C19.motor, text: 'motorra' },
    { color: C19.inter, text: 'interneurona' },
    { color: C19.symp, text: 'sinpatikoa' },
  ],
  meninges: [
    { color: C19.dura, text: 'dura materra' },
    { color: C19.arach, text: 'araknoidesa' },
    { color: C19.pia, text: 'pia materra' },
    { color: C19.csf, text: 'likido zefalorrakideoa' },
  ],
  vesicles: [
    { color: C19.pros, text: 'prosentzefaloa' },
    { color: C19.mes, text: 'mesentzefaloa' },
    { color: C19.rhomb, text: 'erronbentzefaloa' },
    { color: C19.tube, text: 'hodi neurala' },
  ],
  crest: [
    { color: C19.tube, text: 'hodi neurala' },
    { color: C19.crest, text: 'gandor neurala' },
    { color: C19.ecto, text: 'ektodermoa' },
  ],
} as const;
