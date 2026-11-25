import { add, mix3, type V3 } from '@/lib/three-d/math';
import { curve3, type Mesh } from '@/lib/three-d/mesh';
import { vessel } from '@/lib/three-d/organic';
import type { Item3 } from '@/lib/three-d/scene';
import { blobParts, mixHex, tubeParts } from '@/components/scenes/week10/model3d';
import { UC } from '@/components/scenes/week15/uro-model';
import { DP0, ductModel, type DuctPose } from './duct-model';
import { EX0, externalModel, type ExternalPose } from './external-model';

/**
 * Topic 16 as ONE model (Ikasgela 16, "Mapa osoa"): the simulator draws the topic in separate models (the gonad cut
 * across, the ducts from the front, the descent cut down the side, the external genitalia from below); here the
 * ducts' model is the body and the rest is joined to it, so the whole way reads in one picture: the germ cells from
 * the yolk sac by the allantois and the hindgut to the gonads; the indifferent gonad and the two ducts; then either
 * way, the testis with its ducts down to the prostatic urethra and out through the inguinal canal into the scrotum,
 * or the ovary with the tubes, the uterus and the vagina; and below, on the perineum, the external genitalia from
 * the same four primordia.
 *
 * Frames: the ducts' model is the map's (x the embryo's LEFT, y cranial, z ventral). The external genitalia's model
 * (x left, y towards the tubercle, z out of the perineum) is turned under the sinus through one matrix: its y runs
 * ventral, its z caudal. The testis's descent moves the testis and what sits on it (epididymis, appendix, tubules)
 * through a matrix per side, and the vas deferens is drawn again on its way through the inguinal canal.
 */

export interface MapPose16 {
  duct: DuctPose;
  ext: ExternalPose;
  /** The germ cells' journey (0..1) and the early context (yolk sac, allantois, hindgut) shown (0..1). */
  germ: number;
  early: number;
  /** Male: the testis's descent (0..1), the gubernaculum (0..1), the processus vaginalis → inguinal canal (0..1). */
  tdown: number;
  gubM: number;
  canal: number;
  /** The mesonephros's own mass gone (0..1): by birth only its derivatives remain. */
  mesoGone: number;
}

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const ss = (a: number, b: number, x: number) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const darker = (c: string) => mixHex(c, '#000000', 0.55);
const L = (kps: readonly V3[], n = 20) => curve3(kps as V3[], n);
const X = (s: number, p: V3): V3 => [s * p[0], p[1], p[2]];

/** The external genitalia under the sinus: ext (x, y, z) → map (x, −z, y), scaled. */
const SE = 0.8;
const TE: V3 = [0, -3.72, 0.16];
const ME = new Float32Array([SE, 0, 0, 0, 0, 0, SE, 0, 0, -SE, 0, 0, TE[0], TE[1], TE[2], 1]);
export const PE = (p: V3): V3 => [p[0] * SE + TE[0], -p[2] * SE + TE[1], p[1] * SE + TE[2]];

/** The ducts' model's gonad (its GON) and the epididymis's tail (where the vas leaves it). */
const GON = (s: number): V3 => X(s, [1.25, 1.0, 0]);
const TAIL = (s: number): V3 => X(s, [1.79, 0.42, -0.12]);
/** The testis's way down: posterior wall → by the deep ring → through the canal → the scrotum. */
const RING = (s: number): V3 => X(s, [1.3, -2.3, 0.72]);
const RING_OUT = (s: number): V3 => X(s, [1.0, -3.05, 0.95]);
const SCROTUM = (s: number): V3 => add(PE([0.5 * s, -0.15, 0.22]), [0, -0.05, 0]);
const T_PATH = (s: number) => L([GON(s), X(s, [1.45, -0.6, 0.2]), RING(s), RING_OUT(s), SCROTUM(s)], 48);
/** Where along its way the testis passes the deep ring. */
const T_RING = 0.5;

const pathAt = (line: V3[], t: number): V3 => line[Math.min(line.length - 1, Math.max(0, Math.round(clamp01(t) * (line.length - 1))))];

/** The matrix that carries the testis (and what sits on it) from its place to `to`, shrunk by k about its centre. */
function carry(from: V3, to: V3, k: number) {
  const t: V3 = [to[0] - from[0] * k, to[1] - from[1] * k, to[2] - from[2] * k];
  return new Float32Array([k, 0, 0, 0, 0, k, 0, 0, 0, 0, k, 0, t[0], t[1], t[2], 1]);
}
const apply = (m: Float32Array, p: V3): V3 => [p[0] * m[0] + m[12], p[1] * m[5] + m[13], p[2] * m[10] + m[14]];

/** The external model's perineal skin is a dome reaching far past its frame: the map keeps a patch round the
 * genitalia only (triangles with every corner within `r` of the midline point, in the external model's plane). */
const SKIN_R = 2.3;
const skinCache = new WeakMap<Mesh, Mesh>();
function cropSkin(m: Mesh): Mesh {
  const hit = skinCache.get(m);
  if (hit) return hit;
  const inside = (i: number) => m.pos[3 * i] ** 2 + m.pos[3 * i + 1] ** 2 < SKIN_R * SKIN_R;
  const idx: number[] = [];
  for (let t = 0; t < m.idx.length; t += 3) if (inside(m.idx[t]) && inside(m.idx[t + 1]) && inside(m.idx[t + 2])) idx.push(m.idx[t], m.idx[t + 1], m.idx[t + 2]);
  const out: Mesh = { ...m, idx: new Uint32Array(idx) };
  skinCache.set(m, out);
  return out;
}

export function mapModel16(pose: MapPose16) {
  const dp = pose.duct;
  const male = clamp01(dp.male);
  const tdown = clamp01(pose.tdown) * ss(0.5, 1, male);
  // The ducts' own vas is drawn again (through the canal) once the testis moves.
  const own = tdown > 0.005;
  const duct = ductModel(dp);
  const ext = externalModel(pose.ext);
  const items: Item3[] = [];
  const pts: Record<string, V3> = { ...duct.pts };

  // The testis's matrix per side.
  const tpos = (s: number) => pathAt(T_PATH(s), tdown);
  const kT = lerp(1, 0.62, tdown);
  const mT = (s: number) => carry(GON(s), tpos(s), kT);
  const onTestis = /^(gonad|epidB|epid|app|tub)(-?1)/;
  for (const it of duct.items) {
    if (own && /^wolff-?1$/.test(it.key)) continue;
    if (/^meso-?1$/.test(it.key)) {
      const op = (it.opacity ?? 1) * (1 - clamp01(pose.mesoGone));
      if (op > 0.01) items.push({ ...it, opacity: op });
      continue;
    }
    const m = own && male > 0.5 ? onTestis.exec(it.key) : null;
    items.push(m ? { ...it, matrix: mT(Number(m[2])) } : it);
  }
  if (own && male > 0.5) {
    const m = mT(1);
    for (const id of ['barrabila', 'gonadak', 'epididimoa', 'barrabil-apendizea', 'hodixka-eferenteak', 'paradidimoa']) if (duct.pts[id]) pts[id] = apply(m, duct.pts[id]);
  }

  const push = (it: Item3) => items.push(it);
  const ball = (key: string, id: string | undefined, c: V3, r: V3, color: string, op: number, extra: Partial<Item3> = {}) => {
    if (op <= 0.01) return;
    push({ key, id, ...blobParts({ center: c, radii: r, rings: 10, sides: 14 }), color, deep: darker(color), tissue: 'epithelium', opacity: op, ...extra });
  };
  const vess = (key: string, id: string | undefined, line: V3[], color: string, prof: Parameters<typeof vessel>[1], g: number, op: number, extra: Partial<Item3> = {}) => {
    if (op <= 0.01) return;
    const parts = vessel(line, { ref: [0, 0, 1], sides: 12, ...prof }, g);
    if (parts) push({ key, id, ...parts, color, deep: darker(color), tissue: 'epithelium', opacity: op, ...extra });
  };

  // ———— the male: the vas through the canal, the canal, the processus / tunica vaginalis, the gubernaculum ————
  if (own && male > 0.5) {
    const passed = tdown > T_RING;
    for (const s of [-1, 1]) {
      const tail = apply(mT(s), TAIL(s));
      const way = [tail, ...(passed ? [mix3(tail, RING_OUT(s), 0.5), RING_OUT(s), RING(s)] : []), X(s, [1.55, -1.0, 0.1]), X(s, [1.3, -1.35, -0.35]), X(s, [0.5, -2.0, -0.2]), X(s, [0.15, -2.2, 0.05])];
      const line = L(way, 44);
      vess(`vas${s}`, 'hodi-deferentea', line, UC.wolff, { r0: 0.065, r1: 0.06, flare: 0.5, flareLen: 0.15 }, 1, 1, { deep: UC.wolffDeep, groups: ['hodi-mesonefrikoa', 'hodi-deferentea'] });
      if (s > 0) pts['hodi-deferentea'] = line[passed ? 26 : 14];
      // The processus vaginalis: the peritoneum's finger out through the wall ahead of the testis (3rd month); its
      // neck closes at birth, leaving the canal and, round the testis, the tunica vaginalis.
      const cn = clamp01(pose.canal);
      const pv = ss(0, 0.6, cn) * (1 - ss(0.75, 1, cn));
      if (pv > 0.01) vess(`pv${s}`, 'luzapen-baginala', L([RING(s), RING_OUT(s), SCROTUM(s)], 16), '#c7d2fe', { r0: 0.2, r1: 0.26, bulb: 0.6, bulbLen: 0.3, sides: 14 }, 1, 0.35 * pv, { tissue: 'membrane', thin: 0.6, outline: false });
      if (cn > 0.3) vess(`canal${s}`, 'iztai-hodia', L([RING(s), mix3(RING(s), RING_OUT(s), 0.5), RING_OUT(s)], 8), '#a5b4fc', { r0: 0.13, r1: 0.12, sides: 14 }, 1, 0.45 * ss(0.3, 0.7, cn), { tissue: 'membrane', thin: 0.5 });
      const tv = ss(0.75, 1, cn);
      if (tv > 0.01) ball(`tv${s}`, 'geruza-baginala', tpos(s), [0.42 * kT * 1.25, 0.6 * kT * 1.2, 0.4 * kT * 1.25], '#c7d2fe', 0.3 * tv, { tissue: 'membrane', thin: 0.7, outline: false });
      // The gubernaculum: from the testis's lower pole to the scrotum's skin; it keeps its length while the body
      // grows, so the testis comes down; then it shrinks away.
      const gb = clamp01(pose.gubM);
      if (gb > 0.01) {
        const top = add(tpos(s), [0, -0.5 * kT, 0.05]);
        const end = add(SCROTUM(s), [0, -0.25, 0.05]);
        vess(`gubM${s}`, 'gubernakulua', L([top, mix3(top, passed ? end : RING_OUT(s), 0.5), ...(passed ? [] : [RING_OUT(s)]), end], 14), '#9ca3af', { r0: 0.08, r1: 0.06, flare: 0.5, flareLen: 0.15, sides: 10 }, 1, gb, { tissue: 'tendon' });
        if (s > 0) pts['gubernakulua'] = add(mix3(top, end, 0.5), [0.12, 0, 0.1]);
      }
    }
    pts['iztai-hodia'] = add(mix3(RING(1), RING_OUT(1), 0.5), [0.15, 0, 0.12]);
    pts['luzapen-baginala'] = add(RING_OUT(1), [0.18, 0, 0.1]);
    pts['geruza-baginala'] = add(tpos(1), [0.3, 0.2, 0.15]);
  }

  // ———— the external genitalia, under the sinus ————
  for (const it of ext.items) items.push({ ...it, ...(it.key === 'skin' ? { mesh: cropSkin(it.mesh) } : {}), key: `x-${it.key}`, matrix: ME });
  for (const [k, v] of Object.entries(ext.pts)) {
    // The ducts' model names its own urethra and glans-less sinus; the perineum's parts are the external model's.
    if (k === 'uretra' || k === 'sinu-urogenitala') continue;
    pts[k] = PE(v);
  }

  // ———— early: the germ cells' way from the yolk sac by the allantois and the hindgut's mesentery to the gonads ————
  const ea = clamp01(pose.early);
  if (ea > 0.01) {
    const yolk: V3 = [0, -0.55, 2.75];
    ball('yolk', 'bitelo-zaku-sekundarioa', yolk, [0.55, 0.5, 0.5], '#f6d860', 0.9 * ea, { deep: '#8a6a10' });
    pts['bitelo-zaku-sekundarioa'] = add(yolk, [0.45, 0.3, 0.1]);
    const al = L([[0, -1.05, 0.95], [0, -0.95, 1.7], [0, -0.9, 2.3]], 12);
    vess('allantois', 'alantoidea', al, UC.endo, { r0: 0.1, r1: 0.07, flare: 0.5, flareLen: 0.2 }, 1, ea, { deep: UC.endoDeep });
    pts['alantoidea'] = add(al[6], [0.12, 0.05, 0.05]);
    const hg = L([[0, 1.6, -0.55], [0, 0.2, -0.5], [0, -1.6, -0.45], [0, -2.3, -0.35]], 20);
    vess('hindgut', 'atzeko-hestea', hg, UC.endo, { r0: 0.17, r1: 0.16 }, 1, ea, { deep: UC.endoDeep });
    pts['atzeko-hestea'] = add(hg[8], [0.2, 0, 0.05]);
    const g = clamp01(pose.germ);
    if (g > 0.001)
      for (const s of [-1, 1]) {
        // Along the allantois inwards, round the hindgut, up its dorsal mesentery, out to each gonadal ridge.
        const way = L([add(yolk, [0.1 * s, -0.25, -0.35]), [0.05 * s, -0.95, 1.6], [0.08 * s, -1.0, 0.9], [0.15 * s, -1.4, -0.2], X(s, [0.2, -0.6, -0.68]), X(s, [0.35, 0.6, -0.65]), X(s, [0.85, 1.0, -0.4]), add(GON(s), X(s, [0, 0, 0.1]))], 60);
        for (let k = 0; k < 7; k++) {
          const u = clamp01(g * 1.35 - k * 0.05);
          const p = pathAt(way, u);
          ball(`germ${s}${k}`, 'hasierako-hozi-zelulak', add(p, X(s, [0.03 * (k % 3), 0.04 * ((k * 5) % 3), 0.02 * (k % 2)])), [0.075, 0.075, 0.075], '#ffd84d', ea, { deep: '#8a6a10', groups: ['hasierako-hozi-zelulak'] });
          if (s > 0 && k === 3) pts['hasierako-hozi-zelulak'] = add(p, [0.15, 0.1, 0.12]);
        }
      }
  }
  return { items, pts };
}

// ———————————————————————————— the moments ————————————————————————————

/** Per moment: the shared pose and what differs (a male and a female pose; mixed by `sex`). */
interface Moment16 {
  id: string;
  title: string;
  when: string;
  common: Omit<MapPose16, 'duct' | 'ext'> & { duct: Partial<DuctPose>; ext: Partial<ExternalPose> };
  m?: { duct?: Partial<DuctPose>; ext?: Partial<ExternalPose>; tdown?: number; gubM?: number; canal?: number };
  f?: { duct?: Partial<DuctPose>; ext?: Partial<ExternalPose> };
}

const M16: Moment16[] = [
  {
    id: 'hozi',
    title: 'Hozi zelulak',
    when: '3.–6. asteak',
    common: { duct: { ducts: 0.5 }, ext: { tubercle: 1, folds: 1, swellings: 1 }, germ: 0.55, early: 1, tdown: 0, gubM: 0, canal: 0, mesoGone: 0 },
  },
  {
    id: 'berdina',
    title: 'Desberdindu gabea',
    when: '6.–7. asteak',
    common: { duct: { ducts: 1 }, ext: { tubercle: 1, folds: 1, swellings: 1, divide: 1 }, germ: 1, early: 0.35, tdown: 0, gubM: 0, canal: 0, mesoGone: 0 },
  },
  {
    id: 'desberdintzea',
    title: 'Desberdintzea',
    when: '7.–8. asteak',
    common: { duct: { ducts: 1 }, ext: { tubercle: 1, folds: 1, swellings: 1, divide: 1, groove: 1 }, germ: 1, early: 0, tdown: 0, gubM: 0, canal: 0, mesoGone: 0 },
    m: { duct: { male: 0.6, efferent: 0.6 } },
    f: { duct: { female: 0.6 } },
  },
  {
    id: 'hodiak',
    title: 'Hodiak eta jaisketa',
    when: '3.–5. hilabeteak',
    common: { duct: { ducts: 1 }, ext: { tubercle: 1, folds: 1, swellings: 1, divide: 1, groove: 1 }, germ: 1, early: 0, tdown: 0, gubM: 0, canal: 0, mesoGone: 0.6 },
    m: { duct: { male: 1, efferent: 1, epididymis: 1, vesicle: 1, prostate: 1 }, ext: { male: 0.8, closeGroove: 0.7, scrotum: 0.7 }, tdown: 0.42, gubM: 1, canal: 0.5 },
    f: { duct: { female: 1, fuse: 1, bulbs: 1, plate: 0.8, gub: 1, ovDown: 0.5 }, ext: { female: 0.8 } },
  },
  {
    id: 'jaiotza',
    title: 'Jaiotzerako',
    when: 'jaiotza → heldua',
    common: { duct: { ducts: 1 }, ext: { tubercle: 1, folds: 1, swellings: 1, divide: 1, groove: 1 }, germ: 1, early: 0, tdown: 0, gubM: 0, canal: 0, mesoGone: 1 },
    m: { duct: { male: 1, efferent: 1, epididymis: 1, vesicle: 1, prostate: 1 }, ext: { male: 1, closeGroove: 1, scrotum: 1 }, tdown: 1, gubM: 0, canal: 1 },
    f: { duct: { female: 1, fuse: 1, bulbs: 1, plate: 1, lumen: 1, hymen: 1, ligaments: 1, broad: 1, gub: 0, ovDown: 1 }, ext: { female: 1 } },
  },
];

export const MAP16_MOMENTS = M16.map(({ id, title, when }) => ({ id, title, when }));

function mixNum<T extends object>(a: T, b: T, k: number): T {
  const out = { ...a } as Record<string, number>;
  for (const key of Object.keys({ ...a, ...b })) out[key] = lerp((a as Record<string, number>)[key] ?? 0, (b as Record<string, number>)[key] ?? 0, k);
  return out as T;
}

/** One moment's full pose for one sex (0 male, 1 female). */
function poseOf(m: Moment16, sex: 0 | 1): MapPose16 {
  const c = m.common;
  const side = sex ? m.f : m.m;
  const ms = sex ? undefined : m.m;
  return {
    duct: { ...DP0, ...c.duct, ...side?.duct },
    ext: { ...EX0, ...c.ext, ...side?.ext },
    germ: c.germ,
    early: c.early,
    tdown: ms?.tdown ?? c.tdown,
    gubM: ms?.gubM ?? c.gubM,
    canal: ms?.canal ?? c.canal,
    mesoGone: c.mesoGone,
  };
}

/** The pose at a moment that may lie between two (the glide), male (sex 0) … female (sex 1). */
export function poseAt16(u: number, sex: number): MapPose16 {
  const n = M16.length;
  const i = Math.max(0, Math.min(n - 1, Math.floor(u)));
  const j = Math.min(n - 1, i + 1);
  const k = u - i;
  const e = k * k * (3 - 2 * k);
  const at = (m: Moment16): MapPose16 => {
    const a = poseOf(m, 0);
    const b = poseOf(m, 1);
    if (sex <= 0.001) return a;
    if (sex >= 0.999) return b;
    return { duct: mixNum(a.duct, b.duct, sex), ext: mixNum(a.ext, b.ext, sex), germ: a.germ, early: a.early, tdown: lerp(a.tdown, b.tdown, sex), gubM: lerp(a.gubM, b.gubM, sex), canal: lerp(a.canal, b.canal, sex), mesoGone: a.mesoGone };
  };
  const a = at(M16[i]);
  const b = at(M16[j]);
  return {
    duct: mixNum(a.duct, b.duct, e),
    ext: mixNum(a.ext, b.ext, e),
    germ: lerp(a.germ, b.germ, e),
    early: lerp(a.early, b.early, e),
    tdown: lerp(a.tdown, b.tdown, e),
    gubM: lerp(a.gubM, b.gubM, e),
    canal: lerp(a.canal, b.canal, e),
    mesoGone: lerp(a.mesoGone, b.mesoGone, e),
  };
}
