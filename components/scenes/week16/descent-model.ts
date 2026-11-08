import { add, mix3, type V3 } from '@/lib/three-d/math';
import { curve3 } from '@/lib/three-d/mesh';
import type { Item3 } from '@/lib/three-d/scene';
import { cupShell, plate, vessel, type Parts, type VesselOptions } from '@/lib/three-d/organic';
import { blobParts, mixHex } from '@/components/scenes/week10/model3d';
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
 *
 * Built to the quality bar (docs/quality/3d-quality-bar.md): the trunk is cut through the testis's plane (x = X0)
 * and seen from that side. The cut is a solid plate (the body's tissue) with the peritoneal cavity a dark recess
 * and the anterior wall its own band; what lies in the plane (the testis in the posterior wall, the processus,
 * the gubernaculum) stands half out of it. The scrotum and the layers the processus carries into it are shells
 * cut open towards the viewer, so the testis shows inside them; the gubernaculum is a thick cord that shortens
 * and then shrinks away.
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
const MUSCLE = '#c98272';
const CUT = '#9c8f8a';
const CUT_DEEP = '#3e3532';
const BONE = '#cfc6b4';
const X0 = 0.9;

/** The testis's path: posterior abdominal wall → pelvic floor by the inguinal ring → the scrotum. */
const TESTIS_PATH = L([[X0, 1.4, -1.1], [X0, 0.0, -0.98], [X0, -1.45, -0.35], [X0, -1.78, 0.75], [X0, -2.6, 1.35], [X0, -3.05, 1.4]], 50);
const RING: V3 = [X0, -1.6, 1.05];
const SCROTUM: V3 = [X0, -3.0, 1.45];

/** The cut plane, seen from the embryo's left: the plate's own (u, v) = (−z, y), its front towards +x. */
const SAGITTAL = { u: [0, 0, -1] as V3, v: [0, 1, 0] as V3, w: [1, 0, 0] as V3 };
const zy = (pts: readonly (readonly [number, number])[]) => pts.map(([z, y]): [number, number] => [-z, y]);
/** The trunk's cut (z, y). */
const TRUNK = zy([[1.62, 2.6], [0.9, 2.66], [0, 2.68], [-0.9, 2.66], [-1.62, 2.6], [-1.75, 1.6], [-1.72, 0.6], [-1.6, -0.4], [-1.55, -1.2], [-1.4, -1.8], [-1.05, -2.25], [-0.5, -2.45], [0.2, -2.45], [0.8, -2.35], [1.25, -2.12], [1.55, -1.75], [1.72, -1.1], [1.78, -0.2], [1.74, 0.9], [1.68, 1.8]]);
/** The peritoneal cavity (the parietal peritoneum's line). */
const CAVITY = zy([[1.0, 2.55], [1.05, 1.2], [1.05, 0.4], [0.95, -0.6], [0.85, -1.25], [0.45, -1.5], [0.0, -1.5], [-0.5, -1.1], [-0.75, -0.8], [-0.82, 0.2], [-0.82, 1.0], [-0.85, 2.55]]);
/** The anterior abdominal wall, its lower end at the inguinal ring. */
const FRONT_WALL = zy([[1.08, 2.58], [1.6, 2.58], [1.66, 1.8], [1.72, 0.9], [1.76, -0.2], [1.7, -1.1], [1.52, -1.72], [1.3, -2.0], [1.14, -1.8], [1.12, -0.6], [1.1, 1.0]]);
const PERI_LINE = L([[X0, 2.5, 1.0], [X0, 0.4, 1.05], [X0, -1.25, 0.85], [X0, -1.5, 0.0], [X0, -0.8, -0.75], [X0, 1.0, -0.82], [X0, 2.5, -0.85]], 40);
const SOLID = new Set(['barrabila', 'eskroto-goragunea', 'sinfisi-pubikoa', 'gubernakulua', 'hodi-deferentea', 'iztai-hodia']);
const half = (center: V3, radius: number, thick: number, wrap = 0.5): Parts => cupShell({ center, axis: [1, 0, 0], radius, thick, wrap, rings: 14, sides: 28 });

export function descentModel(pose: DescentPose, o: DescentOpts = {}) {
  const items: Item3[] = [];
  const pts: Record<string, V3> = {};
  const dim = o.dim;
  const fade = (id: string, groups?: readonly string[]) => (!dim || dim.k <= 0.001 || dim.ids.includes(id) || (groups ?? []).some((g) => dim.ids.includes(g)) ? 1 : 1 - 0.75 * dim.k);
  // Solid parts keep their opacity when unlit (they recede to grey instead): faded, they would read as glass.
  const put = (key: string, id: string | undefined, parts: Parts | null, color: string, op = 1, extra: Partial<Item3> = {}) => {
    if (!parts || op <= 0.01) return;
    const see = id && !SOLID.has(id) && !extra.quiet ? fade(id, extra.groups) : 1;
    items.push({ key, id, ...parts, color, deep: darker(color), tissue: 'epithelium', opacity: op * see, ...extra });
  };
  const vess = (key: string, id: string | undefined, line: V3[], color: string, prof: VesselOptions, op = 1, extra: Partial<Item3> = {}) =>
    line.length >= 2 && put(key, id, vessel(line, { ref: [1, 0, 0], sides: 16, ...prof }), color, op, extra);
  const ball = (key: string, id: string | undefined, c: V3, r: V3, color: string, op = 1, extra: Partial<Item3> = {}) => put(key, id, blobParts({ center: c, radii: r, rings: 12, sides: 16 }), color, op, extra);
  const down = clamp01(pose.down);
  const pv = clamp01(pose.pv);
  const close = clamp01(pose.close);
  const ly = clamp01(pose.layers);
  const tv = clamp01(pose.tunica);

  // ———— the cut: the trunk's tissue, the cavity a dark recess, the anterior wall its own band ————
  items.push({ key: 'trunk', ...plate('descent-trunk-v1', TRUNK, X0 - 0.03, X0 - 0.4, SAGITTAL), color: CUT, deep: CUT_DEEP, tissue: 'mesenchyme', opacity: 1, quiet: true, ground: true });
  items.push({ key: 'cavity', ...plate('descent-cavity-v1', CAVITY, X0 - 0.02, X0 - 0.03, SAGITTAL), color: '#2b3247', deep: '#10131c', tissue: 'membrane', opacity: 1, quiet: true, ground: true, outline: false });
  put('wall', 'horma-abdominala', plate('descent-wall-v1', FRONT_WALL, X0 - 0.01, X0 - 0.03, SAGITTAL), MUSCLE, 1, { tissue: 'muscle', quiet: true, ground: true, deep: '#6e3a30' });
  pts['horma-abdominala'] = ly > 0.5 ? add(SCROTUM, [0, 0.62, 0.62]) : [X0, 0.6, 1.4];
  // The parietal peritoneum lining the cavity (the testis lies behind it, retroperitoneal).
  vess('peri', 'paretako-peritoneoa', PERI_LINE, PERI, { r0: 0.04, capStart: false, capEnd: false }, 1, { tissue: 'membrane', outline: false });
  pts['paretako-peritoneoa'] = [X0, 1.6, 1.0];
  // The pubic bone's ramus, cut where the plane crosses it.
  ball('pubis', 'sinfisi-pubikoa', [X0 - 0.05, -1.95, 0.8], [0.2, 0.32, 0.24], BONE, 1, { tissue: 'bone', deep: '#6e6656' });
  pts['sinfisi-pubikoa'] = [X0, -2.1, 0.6];

  // ———— the scrotal swelling: its skin a shell cut open towards the viewer ————
  put('scrotum', 'eskroto-goragunea', half(SCROTUM, 0.78, 0.07, 0.5), '#e9b48f', 1, { tissue: 'skin', deep: '#a07060' });
  pts['eskroto-goragunea'] = add(SCROTUM, [0.2, -0.55, 0.55]);

  // ———— the processus vaginalis: the peritoneal cavity pushing out through the wall into the scrotum ————
  if (pv > 0.01) {
    const neck = lerp(0.2, 0.03, close);
    const pvLine = L([[X0, -1.2, 0.95], RING, mix3(RING, SCROTUM, 0.5), add(SCROTUM, [0, 0.35, 0.02])], 24);
    const n = Math.max(2, Math.round(pvLine.length * pv));
    vess('pv', 'luzapen-baginala', pvLine.slice(0, n), PERI, { r0: neck, r1: neck, capStart: false }, 1, { thin: 0.5, tissue: 'membrane' });
    // Its end opens into a sac in the scrotum: later the parietal layer of the tunica vaginalis.
    const sac = ss(0.7, 1, pv);
    if (sac > 0.02) put('pvSac', 'luzapen-baginala', half(SCROTUM, lerp(0.22, 0.56, sac), 0.035, lerp(0.3, 0.5, sac)), PERI, 1, { thin: 0.5, tissue: 'membrane', groups: ['geruza-baginala', 'geruza-baginala-paretako-orria'] });
    pts['luzapen-baginala'] = mix3(add(mix3(RING, SCROTUM, 0.5), [0.2, 0, 0.18]), add(SCROTUM, [0.2, 0.42, 0.3]), close);
    // The wall's layers carried round it: in the scrotum they wrap the testis (cut open like the skin).
    if (ly > 0.01)
      [0.63, 0.7].forEach((r, k) => put(`layer${k}`, 'horma-abdominala', half(SCROTUM, lerp(0.4, r, ly), 0.03, lerp(0.25, 0.5, ly)), k ? '#f4e3d7' : '#d97a6a', 1, { thin: 0.4, tissue: k ? 'membrane' : 'muscle' }));
  }
  // The inguinal canal: the closed processus's way through the wall (vas, vessels, nerves).
  if (close > 0.05) {
    vess('canal', 'iztai-hodia', L([[X0, -1.3, 0.92], RING, add(RING, [0, -0.35, 0.25])], 10), '#d98a9c', { r0: 0.12 * close, r1: 0.1 * close }, 1, { thin: 0.4, deep: '#7a3346' });
    pts['iztai-hodia'] = add(RING, [0.15, 0.05, 0.15]);
  }

  // ———— the testis going down, the gubernaculum from it to the scrotum's skin ————
  const T = TESTIS_PATH[Math.round(down * (TESTIS_PATH.length - 1))];
  ball('testis', 'barrabila', T, [0.28, 0.42, 0.3], mixHex(GC16.gonad, '#d9f2ee', 0.6), 1, { groups: ['gonadak'], deep: GC16.gonadDeep });
  pts['barrabila'] = add(T, [0.3, 0.2, 0.15]);
  // The tunica vaginalis's visceral layer: a cup on the testis, open towards the viewer.
  if (tv > 0.01) {
    put('tvv', 'geruza-baginala', half(T, 0.47, 0.03, lerp(0.3, 0.5, tv)), PERI, 1, { thin: 0.5, tissue: 'membrane', groups: ['geruza-baginala-errai-orria'] });
    pts['geruza-baginala'] = add(T, [0.3, -0.38, 0.32]);
  }
  // A thick jelly cord from the testis's lower pole to the scrotum's floor: it shortens as the testis nears its
  // anchor, and once the testis is down it shrinks away.
  // It lies along the way the testis will take (outside the peritoneum: down the posterior wall, under the
  // pelvic floor, through the ring), so the testis following it is what shortens it.
  const gk = (1 - 0.35 * down) * (1 - clamp01(pose.gubGone));
  if (gk > 0.06) {
    const N = TESTIS_PATH.length;
    const i = Math.round(down * (N - 1));
    const end = add(SCROTUM, [0, -0.62, 0]);
    const way = TESTIS_PATH.slice(Math.min(N - 1, i + 6), N - 1).filter((_, k) => k % 3 === 0);
    const line = L([add(T, [0, -0.36, 0]), ...way, end], 28);
    vess('gub', 'gubernakulua', line, GUB, { r0: 0.12 * gk, r1: 0.2 * gk, flare: 0.35, flareLen: 0.2 }, 1, { tissue: 'mesenchyme', deep: '#4b5563' });
    pts['gubernakulua'] = add(line[Math.round(line.length * 0.45)], [0.25, 0, 0]);
  }
  // The vas deferens trailing behind the testis to the pelvis (purple, topic 15's mesonephric duct).
  // Once the testis is through the wall, the vas runs back up through the inguinal canal into the pelvis.
  const via = ss(0.55, 0.85, down);
  const v0 = add(T, [-0.05, 0.25, -0.15]);
  const vEnd: V3 = [X0 - 0.02, -1.6, -0.75];
  const vas = L([v0, mix3(mix3(v0, vEnd, 0.33), add(RING, [0, 0.05, -0.05]), via), mix3(mix3(v0, vEnd, 0.66), [X0, -1.25, 0.1], via), vEnd], 24);
  vess('vas', 'hodi-deferentea', vas, UC.wolff, { r0: 0.055 }, ss(0.05, 0.4, down), { deep: UC.wolffDeep });
  pts['hodi-deferentea'] = add(vas[15], [0.1, 0.05, 0]);
  return { items, pts };
}
