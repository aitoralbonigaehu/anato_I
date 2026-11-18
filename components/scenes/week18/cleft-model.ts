import type { V3 } from '@/lib/three-d/math';
import { mixHex } from '@/components/scenes/week10/model3d';
import type { PoseModel } from '@/components/scenes/week17/common';
import { PH0, pharynxModel, type PharynxOpts } from './pharynx-model';

export type Dim = PharynxOpts;

export interface ArchPose {
  /** Arch colours (0) → the tissues on the cut faces and bars (1). */
  layers: number;
  /** Arch V: appears (0..0.5) and regresses (0.5..1). */
  v: number;
  /** Neural crest cells going into the mesenchyme (0..1). */
  crest: number;
  artery: number;
  vein: number;
  nerve: number;
  cartilage: number;
  /** Clefts and pouches between the arches (0..1). */
  grooves: number;
  /** Left wall dissected while the course identifies its contents. */
  dissect: number;
}
export const AP0: ArchPose = { layers: 0, v: 0, crest: 0, artery: 0, vein: 0, nerve: 0, cartilage: 0, grooves: 1, dissect: 0 };

/**
 * Dorsal dissection for topic 17. The cut, pouches and vessels belong to the same
 * continuous pharyngeal wall the student will see again in topic 18. During the
 * core beat the left wall peels back to reveal the length of its contents. The
 * opposite wall retains their cross sections, as in figure 17-4.
 */
export function archVModel(pose: ArchPose, o: Dim = {}): PoseModel {
  // In the early V section the inlet lies in the floor between IV and VI
  // (figure 17-4); the left lateral window is centred on arch II.
  const section: PharynxOpts = { ...o, inletY: -1.62, peelBand: [1.02, 0.89] };
  const { items: rootItems, pts: rootPoints } = pharynxModel({
    ...PH0, tissue: pose.layers, v5: pose.v > 0 && pose.v < 1 ? Math.sin(Math.PI * pose.v) : 0,
    clefts: pose.grooves, pouches: pose.grooves, crest: pose.crest,
    art: pose.artery, vein: pose.vein, nerve: pose.nerve, cart: pose.cartilage,
    peelL: 0.85 * pose.dissect,
  }, section);

  const pts: Record<string, V3> = { ...rootPoints };
  for (const id of ['faringe-arraildurak', 'lehen-arraildura', 'faringe-arkuak',
    'lehen-arkua', 'bigarren-arkua', 'hirugarren-arkua', 'laugarren-arkua', 'seigarren-arkua', 'bosgarren-arkua']) {
    const p = pts[id];
    if (p) pts[id] = [Math.abs(p[0]), p[1], p[2]];
  }
  if (pts['gandor-neuraleko-zelulak']) pts['gandor-neurala'] = pts['gandor-neuraleko-zelulak'];
  const items = rootItems.filter(it => it.key !== 'ground').map(it => {
    if (it.id === 'gandor-neuraleko-zelulak') {
      return { ...it, id: 'gandor-neurala', opacity: 1 - 0.88 * pose.cartilage, outline: false };
    }
    if (it.id === 'laringe-zuloa') return it;
    if (it.tissue === 'epithelium' || it.tissue === 'skin') {
      const mucosa = it.key.startsWith('in') || it.key.startsWith('sh');
      return { ...it, calm: true, outline: false,
        color: mixHex(it.color, mucosa ? '#efcca5' : '#edbda9', mucosa ? 0.53 : 0.22),
        deep: mixHex(it.deep ?? it.color, mucosa ? '#b49171' : '#a78b85', 0.55) };
    }
    if (it.tissue === 'mesenchyme') {
      const color = mixHex(it.color, '#efc6a9', 0.4);
      return { ...it, calm: true, color, deep: mixHex(it.deep ?? color, color, 0.49) };
    }
    return { ...it, calm: true, outline: false };
  });
  return { items, pts };
}
