import type { V3 } from '@/lib/three-d/math';
import type { Item3 } from '@/lib/three-d/scene';
import { blobParts } from '@/components/scenes/week10/model3d';
import { TISSUE } from '@/components/scenes/week17/common';
import { pharynxModel, type PharynxOpts, type PharynxPose } from './pharynx-model';

/**
 * Agent 18-B's stages on the topic's root model (pharynx-model.ts, owned by 18-A): the first and second pouches,
 * the clefts and the glands' descent are told on the same pharyngeal gut the topic opens with, so the stage changes
 * between them are run-ons in one body (sites.ts, SITE18.pharynx) instead of flights into separate blocks.
 *
 * This wrapper only names what those stages talk about (it adds groups, never moves or recolours 18-A's parts):
 * - the first pouch's deepening recess is the tubotympanic recess;
 * - at the tympanic membrane, its three origins as three thin layers seen in the cut (ectoderm, mesoderm,
 *   endoderm), shown only while `layers` is on, on the side the stage looks at (the embryo's left, +x).
 */

export interface PharynxBOpts extends PharynxOpts {
  /** The tympanic membrane's three layers drawn on the cut (0..1). */
  layers?: number;
}

const withGroup = (it: Item3, g: string): Item3 => ({ ...it, groups: [...(it.groups ?? []), g] });

export function pharynxB(pose: PharynxPose, o: PharynxBOpts = {}) {
  const m = pharynxModel(pose, o);
  const items = m.items.map((it) => (it.id === 'lehen-poltsa' ? withGroup(it, 'sakonune-tubotinpanikoa') : it));
  const pts: Record<string, V3> = { ...(m.pts as Record<string, V3>) };
  if (pts['eustakioren-tronpa']) pts['sakonune-tubotinpanikoa'] = pts['eustakioren-tronpa'];
  const k = o.layers ?? 0;
  const drum = pts['tinpano-mintza'];
  if (k > 0.01 && drum) {
    // The drum on the left side's cut, as three bands across it: outside ectoderm, the fine mesoderm, inside endoderm.
    const [x, y] = drum;
    const lay = (key: string, id: string, dx: number, color: string, deep: string) =>
      items.push({ key, id, groups: ['tinpano-mintza'], ...blobParts({ center: [x + dx, y, -0.03], radii: [0.035 * k, 0.24, 0.03], rings: 8, sides: 12 }), color, deep, tissue: 'epithelium', opacity: 1 });
    lay('drum-ecto', 'tinpano-kanpoko-epitelioa', 0.07, TISSUE.ecto, TISSUE.ectoDeep);
    lay('drum-mes', 'tinpano-tarteko-geruza', 0, TISSUE.mes, TISSUE.mesDeep);
    lay('drum-endo', 'tinpano-barneko-epitelioa', -0.07, TISSUE.endo, TISSUE.endoDeep);
    pts['tinpano-kanpoko-epitelioa'] = [x + 0.07, y + 0.12, -0.06];
    pts['tinpano-tarteko-geruza'] = [x, y, -0.06];
    pts['tinpano-barneko-epitelioa'] = [x - 0.07, y - 0.12, -0.06];
  }
  return { items, pts };
}
