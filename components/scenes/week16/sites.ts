import type { V3 } from '@/lib/three-d/math';
import { chain, invSim, link, type Site } from '@/lib/three-d/place';

/**
 * Topic 16's six models in one body (lib/three-d/place.ts), so a stage change is one camera flight from where
 * the student was looking to the next model, which appears where it belongs in the one just left.
 *
 * The models are drawn at their own scales and none is a blow-up of another, so each is tied to the model the
 * story reaches it from, by the landmark the student is watching at that moment:
 *
 *   wall ── gonad block ── ducts ──┬── pelvis block
 *   (the left gonadal ridge)       ├── descent (the left gonad)
 *            (the left gonad)      └── perineum (below the urethra's end)
 *
 * The duct model's space is the shared body. Numbers measured on the models (tests/sites16.test.ts keeps the
 * landmarks together).
 */

/** The left gonad of the duct model, and of the block cut through it (4 block units per duct unit). */
const DUCT_GONAD: V3 = [1.25, 1.0, 0];
const BLOCK_GONAD: V3 = [0, -0.45, -0.42];
const ductToBlock = link('block', 4, BLOCK_GONAD, DUCT_GONAD);

/** The wall's left gonadal ridge is where the block is cut (3 block units per wall unit). */
const WALL_RIDGE: V3 = [0.62, -0.5, -0.12];
const wallToBlock = link('block', 3, BLOCK_GONAD, WALL_RIDGE);

const faces = (z: readonly number[], centre: V3, a: V3, b: V3) => z.map((dz) => ({ center: [centre[0], centre[1], centre[2] + dz] as V3, a, b }));

export const SITE16 = {
  /** Topic 15's posterior wall (uro-model): the ridges, the two ducts, the germ cells' way. */
  wall: { key: 'wall', place: chain(ductToBlock, invSim(wallToBlock)) } as Site,
  /** One gonad cut across (gonad-model): the slab's cranial and caudal faces. */
  gonad: { key: 'gonad', place: ductToBlock, cut: faces([0.03, -0.93], [0.08, 0.2, 0], [3.0, 0, 0], [0, 2.4, 0]) } as Site,
  /** Both gonads and their ducts from the front (duct-model). */
  ducts: { key: 'ducts', place: link('trunk', 1, [0, 0, 0], [0, 0, 0]) } as Site,
  /** The pelvis cut across at the uterus (broad-model). */
  broad: { key: 'broad', place: link('block', 1.3, [0, -0.15, 0], [0, -0.8, 0.07]), cut: faces([0.85, -0.85], [0, 0, 0], [2.25, 0, 0], [0, 1.75, 0]) } as Site,
  /** The lower trunk cut beside the midline, through the testis (descent-model): its sagittal face. */
  descent: { key: 'descent', place: link('trunk', 1, [0.9, 1.4, -1.1], DUCT_GONAD), cut: [{ center: [0.88, -0.5, 0.2] as V3, a: [0, 0, 2.0] as V3, b: [0, 3.2, 0] as V3 }] } as Site,
  /** The perineum from below (external-model), under the urethra's end. */
  external: { key: 'external', place: link('perineum', 1.4, [0, 0, 0], [0, -3.9, 0.3]) } as Site,
};
