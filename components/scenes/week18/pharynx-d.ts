import type { V3 } from '@/lib/three-d/math';
import type { Item3 } from '@/lib/three-d/scene';
import { pharynxB, type PharynxBOpts } from './pharynx-b';
import type { PharynxPose } from './pharynx-model';

/**
 * The clefts (notes 1.2) and the glands' way down (1.2, "Nola jaisten dira egiturak?") on the topic's root model
 * (pharynx-model.ts through pharynx-b.ts), so these stages run on from the pouches instead of cutting to separate
 * blocks. This wrapper only names and hides; it never moves or recolours the root's parts:
 *
 * - the stages look at the embryo's LEFT (the viewer's left from behind), where the first pouch was told: the names
 *   the root puts on the right (clefts, arches, the epicardial ridge) come over to the left;
 * - once the first cleft is the external acoustic meatus it still answers to "first cleft";
 * - the thyroid's lobes and the larynx's two cartilages answer to the names the descent's text uses;
 * - where a wall is peeled to its endoderm, the fold of arch II that lay on it goes with it.
 */

const ALSO: Record<string, string> = {
  'kanpoko-entzumen-hodia': 'lehen-arraildura',
  'tiroide-guruina': 'tiroide-lobuluak',
  'tiroide-kartilagoa': 'laringeko-kartilagoak',
  'krikoide-kartilagoa': 'laringeko-kartilagoak',
};
const TO_LEFT = ['lehen-arraildura', 'faringe-arraildurak', 'goragune-epikardikoa', 'faringe-arkuak', 'lehen-arkua', 'bigarren-arkua', 'hirugarren-arkua', 'laugarren-arkua', 'seigarren-arkua'];
const FOLD = /^(fm|fe|fi|fs|sin)(-?1)$/;

export function pharynxD(pose: PharynxPose, o: PharynxBOpts = {}) {
  const m = pharynxB(pose, o);
  const items: Item3[] = [];
  for (const it of m.items) {
    const fold = FOLD.exec(it.key);
    if (fold) {
      const peel = fold[2] === '1' ? pose.peelL : pose.peelR;
      const k = (it.opacity ?? 1) * (1 - Math.min(1, peel * 1.5));
      if (k > 0.02) items.push(k > 0.98 ? it : { ...it, opacity: k });
      continue;
    }
    const g = it.id ? ALSO[it.id] : undefined;
    // The gut tube and its endoderm lining are what the descent's text calls the pharynx.
    const gut = it.id === 'faringe-hestea' || it.id === 'endodermoa' || (it.groups ?? []).includes('faringe-hestea');
    const extra = [...(g ? [g] : []), ...(gut ? ['faringea'] : [])];
    items.push(extra.length ? { ...it, groups: [...(it.groups ?? []), ...extra] } : it);
  }
  const pts: Record<string, V3> = { ...(m.pts as Record<string, V3>) };
  for (const id of TO_LEFT) {
    const p = pts[id];
    if (p && p[0] < 0) pts[id] = [-p[0], p[1], p[2]];
  }
  if (pose.c1 > 0.4 && pts['kanpoko-entzumen-hodia']) pts['lehen-arraildura'] = pts['kanpoko-entzumen-hodia'];
  if (pts['tiroide-guruina']) pts['tiroide-lobuluak'] = pts['tiroide-guruina'];
  if (pts['tiroide-kartilagoa']) pts['laringeko-kartilagoak'] = pts['tiroide-kartilagoa'];
  if (pts['faringe-hestea']) pts['faringea'] = pts['faringe-hestea'];
  return { items, pts };
}
