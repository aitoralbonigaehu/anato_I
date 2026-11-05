import { add, mix3, type V3 } from '@/lib/three-d/math';
import { curve3 } from '@/lib/three-d/mesh';
import type { Item3 } from '@/lib/three-d/scene';
import { blobParts, mixHex, tubeParts } from '@/components/scenes/week10/model3d';
import { UC } from '@/components/scenes/week15/uro-model';
import { GC16 } from './gonad-model';

/**
 * Topic 16, notes 4 and 4.1: the testis's descent, the lower trunk cut down the middle near the testis's side and
 * seen from the embryo's LEFT (the belly on the viewer's left, as the notes' figures A–D). The testis forms on
 * the posterior abdominal wall behind the peritoneum; the gubernaculum runs from it to the skin of the scrotal
 * swelling. The body grows while the gubernaculum keeps its length: the testis goes down passively. In the 3rd
 * month the processus vaginalis (an outpouching of the peritoneal cavity) pushes out through the abdominal wall
 * behind the gubernaculum, carrying the wall's layers round it into the scrotum; the testis follows behind it.
 * At birth the processus's neck closes (the inguinal canal stays: vas deferens, vessels, nerves pass), leaving
 * the tunica vaginalis round the testis (parietal and visceral layers); the gubernaculum is gone.
 *
 * Axes as every model of the topics: x towards the embryo's LEFT, y cranial, z ventral.
 */

export interface DescentPose {
  /** The testis's way down (0..1: abdomen → pelvic floor at 0.5 (3rd month) → scrotum). */
  down: number;
  /** The processus vaginalis pushing out into the scrotum (0..1), carrying the wall's layers (0..1). */
  pv: number;
  layers: number;
  /** Its neck closed (0..1): the inguinal canal; the tunica vaginalis's two layers (0..1). */
  close: number;
  tunica: number;
  /** The gubernaculum gone (0..1). */
  gubGone: number;
}

export const DS0: DescentPose = { down: 0, pv: 0, layers: 0, close: 0, tunica: 0, gubGone: 0 };

export interface DescentOpts {
  dim?: { ids: readonly string[]; k: number } | null;
}

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const darker = (c: string) => mixHex(c, '#000000', 0.55);
const L = (kps: readonly V3[], n = 20) => curve3(kps as V3[], n);
const ss = (a: number, b: number, x: number) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};

const PERI = '#f7a8b8';
const GUB = '#9ca3af';
const WALL = '#e8b4a0';
const X0 = 0.9;

/** The testis's path: posterior abdominal wall → pelvic floor by the inguinal ring → the scrotum. */
const TESTIS_PATH = L([[X0, 1.4, -1.1], [X0, 0.0, -0.95], [X0, -1.2, -0.3], [X0, -1.65, 0.75], [X0, -2.6, 1.35], [X0, -3.05, 1.4]], 50);
const RING: V3 = [X0, -1.6, 1.05];
const SCROTUM: V3 = [X0, -3.0, 1.45];

export function descentModel(pose: DescentPose, o: DescentOpts = {}) {
  const items: Item3[] = [];
  const pts: Record<string, V3> = {};
  const dim = o.dim;
  const fade = (id: string, groups?: readonly string[]) => (!dim || dim.k <= 0.001 || dim.ids.includes(id) || (groups ?? []).some((g) => dim.ids.includes(g)) ? 1 : 1 - 0.75 * dim.k);
  const tube = (key: string, id: string | undefined, line: V3[], color: string, r: number | ((u: number) => number), op = 1, extra: Partial<Item3> = {}, sides = 14) => {
    if (op <= 0.01 || line.length < 2) return;
    items.push({ key, id, ...tubeParts(line, { radius: typeof r === 'number' ? () => r : r, ref: [1, 0, 0], sides, capStart: true, capEnd: true }), color, deep: darker(color), tissue: 'epithelium', opacity: op * (id ? fade(id, extra.groups) : 1), ...extra });
  };
  const ball = (key: string, id: string | undefined, c: V3, r: V3, color: string, op = 1, extra: Partial<Item3> = {}, rings = 12, sides = 16) => {
    if (op <= 0.01) return;
    items.push({ key, id, ...blobParts({ center: c, radii: r, rings, sides }), color, deep: darker(color), tissue: 'epithelium', opacity: op * (id ? fade(id, extra.groups) : 1), ...extra });
  };
  const down = clamp01(pose.down);
  const pv = clamp01(pose.pv);
  const close = clamp01(pose.close);

  // ———— the wall: the anterior abdominal wall (with the scrotal swelling below), the pubic symphysis, the back ————
  const front = L([[X0, 2.4, 1.25], [X0, 0.6, 1.35], [X0, -1.0, 1.3], [X0, -1.75, 1.1]], 20);
  tube('wall', 'horma-abdominala', front, WALL, 0.22, 0.5, { tissue: 'muscle', outline: false });
  pts['horma-abdominala'] = [X0, 0.6, 1.6];
  ball('scrotum', 'eskroto-goragunea', SCROTUM, [0.55, 0.62, 0.55], '#f0c9b4', 0.32, { tissue: 'skin', outline: false, deep: '#a07060' }, 14, 18);
  pts['eskroto-goragunea'] = add(SCROTUM, [0.4, -0.35, 0.35]);
  ball('pubis', 'sinfisi-pubikoa', [0.1, -1.95, 0.85], [0.22, 0.35, 0.25], '#e9e1cf', 0.6, { tissue: 'bone' }, 8, 12);
  pts['sinfisi-pubikoa'] = [0.25, -2.1, 0.6];
  tube('back', undefined, L([[X0, 2.4, -1.45], [X0, 0, -1.4], [X0, -1.8, -1.0]], 12), '#e9e1cf', 0.18, 0.2, { tissue: 'bone', quiet: true, outline: false });
  // The parietal peritoneum lining the cavity (the testis lies behind it, retroperitoneal).
  const peri = L([[X0 - 0.05, 2.3, 1.0], [X0 - 0.05, 0.4, 1.05], [X0 - 0.05, -1.25, 0.85], [X0 - 0.05, -1.5, 0.0], [X0 - 0.05, -0.8, -0.75], [X0 - 0.05, 1.0, -0.82], [X0 - 0.05, 2.3, -0.85]], 40);
  tube('peri', 'paretako-peritoneoa', peri, PERI, 0.035, 0.75, { outline: false, tissue: 'membrane' }, 8);
  pts['paretako-peritoneoa'] = [X0, 1.6, 1.0];
  // The gut (context).
  tube('gut', undefined, L([[0.2, 2.2, 0.0], [0.4, 0.8, 0.3], [0.1, -0.4, 0.1], [0.2, -1.2, -0.4]], 16), UC.endo, 0.22, 0.25, { quiet: true, outline: false });

  // ———— the processus vaginalis: the peritoneal cavity pushing out through the wall into the scrotum ————
  if (pv > 0.01) {
    const neck = lerp(0.2, 0.025, close);
    const pvLine = L([[X0, -1.2, 0.95], RING, mix3(RING, SCROTUM, 0.5), add(SCROTUM, [0, 0.0, 0.05])], 20);
    const n = Math.max(2, Math.round(pvLine.length * pv));
    tube('pv', 'luzapen-baginala', pvLine.slice(0, n), PERI, (u) => (u < 0.55 ? neck : lerp(neck, 0.42, ss(0.55, 1, u))), 0.45 * (1 - 0.6 * clamp01(pose.tunica)), { thin: 0.6, outline: false, tissue: 'membrane' }, 16);
    // Once its neck closes, what is left of it is the sac round the testis (the tunica vaginalis).
    pts['luzapen-baginala'] = mix3(add(mix3(RING, SCROTUM, 0.5), [0.25, 0, 0.1]), add(SCROTUM, [0.4, 0.45, 0.1]), close);
    // The wall's layers carried round it (in the scrotum they wrap the testis).
    const ly = clamp01(pose.layers);
    if (ly > 0.01)
      [0.5, 0.6].forEach((r, k) => {
        const line = L([RING, mix3(RING, SCROTUM, 0.55), add(SCROTUM, [0, -0.05, 0.05])], 16);
        tube(`layer${k}`, 'horma-abdominala', line, k ? '#f4e3d7' : '#d97a6a', (u) => lerp(neck + 0.08 * (k + 1), r, ss(0.4, 1, u)), 0.18 * ly, { thin: 0.5, outline: false, tissue: 'membrane' }, 16);
      });
  }
  // The inguinal canal: the closed processus's way through the wall (vas, vessels, nerves).
  if (close > 0.01) {
    tube('canal', 'iztai-hodia', L([[X0, -1.3, 0.9], RING, add(RING, [0, -0.35, 0.25])], 8), '#d98a9c', 0.11, close, { thin: 0.5, deep: '#7a3346' }, 12);
    pts['iztai-hodia'] = add(RING, [0.2, 0.05, 0.15]);
  }

  // ———— the testis going down, the gubernaculum from it to the scrotum's skin ————
  const T = TESTIS_PATH[Math.round(down * (TESTIS_PATH.length - 1))];
  ball('testis', 'barrabila', T, [0.28, 0.42, 0.3], mixHex(GC16.gonad, '#d9f2ee', 0.6), 1, { groups: ['gonadak'], deep: GC16.gonadDeep });
  pts['barrabila'] = add(T, [0.3, 0.2, 0.15]);
  // The tunica vaginalis: its visceral layer on the testis, the parietal one round it.
  const tv = clamp01(pose.tunica);
  if (tv > 0.01) {
    ball('tvv', 'geruza-baginala', T, [0.33, 0.47, 0.35], PERI, 0.5 * tv, { thin: 0.6, outline: false, groups: ['geruza-baginala-errai-orria'] });
    ball('tvp', 'geruza-baginala', T, [0.48, 0.6, 0.5], PERI, 0.25 * tv, { thin: 0.6, outline: false, groups: ['geruza-baginala-paretako-orria'] });
    pts['geruza-baginala'] = add(T, [0.45, -0.3, 0.25]);
  }
  const gub = 1 - clamp01(pose.gubGone);
  if (gub > 0.01) {
    const low = add(T, [0, -0.4, 0]);
    const end = add(SCROTUM, [0, -0.55, 0]);
    const mid = down < 0.5 ? mix3(low, RING, 0.6) : mix3(low, end, 0.5);
    tube('gub', 'gubernakulua', L([low, mid, end], 14), GUB, (u) => lerp(0.12, 0.18, u) * (1 - 0.4 * down), gub, { tissue: 'tendon' }, 12);
    pts['gubernakulua'] = add(mid, [0.25, 0, 0]);
  }
  // The vas deferens trailing behind the testis to the pelvis (purple, topic 15's mesonephric duct).
  // Once the testis is through the wall, the vas runs back up through the inguinal canal into the pelvis.
  const via = ss(0.55, 0.85, down);
  const v0 = add(T, [-0.1, 0.25, -0.15]);
  const vEnd: V3 = [0.3, -1.6, -0.75];
  const vas = L([v0, mix3(mix3(v0, vEnd, 0.33), add(RING, [-0.12, 0.05, -0.05]), via), mix3(mix3(v0, vEnd, 0.66), [0.55, -1.25, 0.1], via), vEnd], 24);
  tube('vas', 'hodi-deferentea', vas, UC.wolff, 0.05, ss(0.05, 0.4, down), { deep: UC.wolffDeep }, 8);
  pts['hodi-deferentea'] = add(vas[15], [0.1, 0.05, 0]);
  return { items, pts };
}
