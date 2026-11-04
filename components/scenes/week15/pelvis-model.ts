import { add, mix3, type V3 } from '@/lib/three-d/math';
import { curve3 } from '@/lib/three-d/mesh';
import type { Item3 } from '@/lib/three-d/scene';
import { blobParts, mixHex, tubeParts } from '@/components/scenes/week10/model3d';
import { T } from '@/components/scenes/week10/common';
import { UC } from './uro-model';

/**
 * Topic 15, notes 2.2–2.4: the caudal end of the embryo cut down the middle (the notes' sagittal figures),
 * seen from the embryo's LEFT as the notes draw them: the belly (and the allantois) on the viewer's left,
 * the back (and the rectum) on the right.
 *
 * The cloaca and its membrane; the urorectal septum growing down to the skin and dividing it (4th–7th week):
 * the anal canal behind with the anal membrane, the primitive urogenital sinus in front; the sinus becomes the
 * bladder (top, the widest), the narrow pelvic part and the flat definitive urogenital sinus, with the perineum
 * between it and the anus. The allantois loses its lumen: the urachus, then the median umbilical ligament
 * (or fistulas if it stays open). The ureter and the mesonephric duct part at the bladder (one up, one down) as
 * the kidney rises. The urethra: short in the female (the vestibule, the urethral and paraurethral glands),
 * long in the male (prostatic, membranous and penile parts, the prostate).
 *
 * Axes as every model of the topic: x towards the embryo's LEFT, y cranial, z ventral.
 */

export interface PelvisPose {
  /** The urorectal septum's growth (0..1); the cloaca divided (0..1). */
  sept: number;
  split: number;
  /** The urogenital sinus's three parts told apart (0..1). */
  parts: number;
  /** The allantois closes into the urachus (0..1), then the median umbilical ligament (0..1); a fistula left open (0..1). */
  urachus: number;
  ligament: number;
  fistula: number;
  /** The ureter and the mesonephric duct (0..1); parted, the ureter higher (0..1); the kidney rising (0..1). */
  ducts: number;
  part: number;
  kidUp: number;
  /** The urethra of the female (0..1) or of the male (0..1); its glands (0..1). */
  female: number;
  male: number;
  glands: number;
}

export const PP0: PelvisPose = { sept: 0, split: 0, parts: 0, urachus: 0, ligament: 0, fistula: 0, ducts: 0, part: 0, kidUp: 0, female: 0, male: 0, glands: 0 };

export interface PelvisOpts {
  dim?: { ids: readonly string[]; k: number } | null;
}

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const darker = (c: string) => mixHex(c, '#000000', 0.55);
const L = (kps: readonly V3[], n = 16) => curve3(kps as V3[], n);
const grown = (line: V3[], g: number) => (g >= 0.999 ? line : line.slice(0, Math.max(2, Math.round(line.length * clamp01(g)))));
const ss = (a: number, b: number, x: number) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};

const SEPT_TOP: V3 = [0, -0.15, -0.05];
const SEPT_BOT: V3 = [0, -1.62, -0.05];
const UMB: V3 = [0, 2.0, 1.75];
const LIGAMENT = '#c9c1b2';

export function pelvisModel(pose: PelvisPose, o: PelvisOpts = {}) {
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
  const sept = clamp01(pose.sept);
  const split = clamp01(pose.split);
  const parts = clamp01(pose.parts);
  const female = clamp01(pose.female);
  const male = clamp01(pose.male);

  // ———— the body's caudal end: its outline in the cut (ectoderm), the cord at the navel ————
  const outline = L([[0, 2.6, 1.7], UMB, [0, 0.6, 1.85], [0, -0.9, 1.65], [0, -1.62, 1.35], [0, -2.0, 0.85], [0, -2.15, 0.1], [0, -2.15, -0.6], [0, -1.75, -1.45], [0, -0.5, -1.9], [0, 1.2, -1.95], [0, 2.6, -1.9]], 60);
  tube('skin', 'azaleko-ektodermoa', outline, T.ecto, 0.05, 0.8, { quiet: true });
  ball('body', undefined, [0, 0.2, 0], [1.0, 2.6, 2.0], '#f0c9b4', 0.07, { tissue: 'skin', outline: false, quiet: true, deep: '#a07060' }, 16, 20);
  tube('cord', 'zilborrestea', L([add(UMB, [0, -0.1, -0.1]), add(UMB, [0, 0.35, 0.55]), add(UMB, [0, 0.6, 1.1])], 8), '#d9d2e6', 0.34, 0.25, { outline: false, tissue: 'membrane' });
  pts['zilborrestea'] = add(UMB, [0, 0.55, 1.0]);
  // A spine-like line of mesoderm behind (sacrum and coccyx, context).
  tube('back', undefined, L([[0, 2.4, -1.45], [0, 0.4, -1.5], [0, -1.2, -1.25], [0, -1.85, -0.85]], 16), '#e9e1cf', 0.16, 0.18, { quiet: true, outline: false, tissue: 'bone' });

  // ———— the hindgut → rectum and anal canal ————
  const hg = L([[0, 2.3, -0.95], [0, 1.0, -0.85], [0, -0.1, -0.62], [0, -0.55, -0.42]], 18);
  tube('rectum', 'atzeko-hestea', hg, UC.endo, 0.24, 0.9, { deep: UC.endoDeep });
  pts['atzeko-hestea'] = add(hg[5], [0.2, 0, -0.1]);

  // ———— the cloaca (undivided) ————
  if (split < 0.99) {
    ball('cloaca', 'kloaka', [0, -0.95, 0.12], [0.42, 0.62, 0.8], UC.endo, 0.88 * (1 - split), { deep: UC.endoDeep });
    pts['kloaka'] = [0.4, -0.95, 0.15];
  }

  // ———— the sinus in front, the anal canal behind ————
  if (split > 0.01) {
    // Primitive sinus → bladder (top, widest) + pelvic part (narrow) + definitive urogenital sinus (flat).
    const bladderC: V3 = [0, lerp(-0.6, -0.05, parts), lerp(0.62, 0.82, parts)];
    const bladderR: V3 = [lerp(0.38, 0.45, parts), lerp(0.55, 0.62, parts), lerp(0.42, 0.52, parts)];
    const sinusId = parts > 0.5 ? 'gernu-maskuria' : 'sinu-urogenitala';
    ball('sinus', sinusId, bladderC, bladderR, mixHex(UC.endo, '#ffe08a', 0.2), 0.9 * split, { groups: ['sinu-urogenitala'], deep: UC.endoDeep });
    pts[sinusId] = add(bladderC, [0.42, 0.25, 0.15]);
    pts['sinu-urogenitala'] = add(bladderC, [0.4, 0.1, 0.1]);
    if (parts > 0.01) {
      // The pelvic part: narrow, below the bladder; with sex, the urethra.
      const pelv = L([add(bladderC, [0, -bladderR[1] + 0.05, -0.1]), [0, -0.95, 0.66], [0, -1.22, 0.64]], 10);
      const pelvId = female > 0.5 || male > 0.5 ? 'uretra' : 'atal-pelbianoa';
      tube('pelvic', pelvId, grown(pelv, parts), mixHex(UC.endo, '#e8b830', 0.25), 0.11, 1 - male, { groups: ['sinu-urogenitala', 'atal-pelbianoa', 'uretra', ...(female > 0.5 ? ['mintzezko-uretra'] : [])], deep: UC.endoDeep });
      pts['atal-pelbianoa'] = add(pelv[5], [0.18, 0, 0.12]);
      pts['uretra'] = add(pelv[4], [0.16, 0, 0.12]);
      // The definitive urogenital sinus: flat, at the surface, closed by the urogenital membrane.
      const defId = female > 0.5 ? 'baginaren-bestibulua' : male > 0.5 ? 'zakil-uretra' : 'behin-betiko-sinu-urogenitala';
      if (male < 0.5) {
        ball('defsinus', defId, [0, -1.42, lerp(0.66, 0.75, female)], [0.3, lerp(0.14, 0.08, female), lerp(0.3, 0.42, female)], mixHex(UC.endo, '#d9a520', 0.25), parts, { groups: ['sinu-urogenitala', 'behin-betiko-sinu-urogenitala'], deep: UC.endoDeep });
        pts[defId] = [0.32, -1.42, 0.7];
      }
      pts['behin-betiko-sinu-urogenitala'] = [0.32, -1.42, 0.7];
    }
    // The urogenital membrane (in front) closing the sinus at the surface, until it opens.
    const ugm = split * (1 - Math.max(female, male));
    if (ugm > 0.01) {
      ball('ugm', 'mintz-urogenitala', [0, -1.6, 0.68], [0.3, 0.035, 0.38], '#f4efe2', ugm, { groups: ['kloaka-mintza'], thin: 0.7, tissue: 'membrane' }, 8, 12);
      pts['mintz-urogenitala'] = [0.3, -1.62, 0.78];
    }
    // The anal canal and its membrane.
    const an = L([[0, -0.55, -0.42], [0, -1.1, -0.48], [0, -1.55, -0.5]], 10);
    tube('anal', 'uzki-hodia', an, UC.endo, lerp(0.22, 0.16, split), split, { deep: UC.endoDeep, groups: ['hodi-anoerrektala'] });
    pts['uzki-hodia'] = add(an[5], [0.2, 0, -0.12]);
    ball('am', 'uzki-mintza', [0, -1.62, -0.5], [0.24, 0.035, 0.24], '#f4efe2', split, { groups: ['kloaka-mintza'], thin: 0.7, tissue: 'membrane' }, 8, 12);
    pts['uzki-mintza'] = [0.28, -1.64, -0.5];
  }
  // The cloacal membrane (one, before the division).
  if (split < 0.99) {
    ball('cm', 'kloaka-mintza', [0, -1.6, 0.12], [0.32, 0.04, 0.8], '#f4efe2', 1 - split, { thin: 0.7, tissue: 'membrane' }, 8, 14);
    pts['kloaka-mintza'] = [0.3, -1.64, 0.3];
  }

  // ———— the urorectal septum (mesoderm), growing down to the skin; its end = the perineum ————
  if (sept > 0.01) {
    const tip = mix3(SEPT_TOP, SEPT_BOT, sept);
    items.push({ key: 'sept', id: 'trenkada-uroerrektala', ...blobParts({ center: mix3(SEPT_TOP, tip, 0.5), radii: [0.4, Math.max(0.05, (SEPT_TOP[1] - tip[1]) / 2 + 0.05), 0.09], rings: 10, sides: 14 }), color: T.lateral, deep: darker(T.lateral), tissue: 'mesenchyme', opacity: fade('trenkada-uroerrektala') });
    pts['trenkada-uroerrektala'] = add(mix3(SEPT_TOP, tip, 0.55), [0.4, 0, 0]);
    const per = ss(0.85, 1, sept) * split;
    if (per > 0.01) {
      ball('per', 'perineoa', [0, -1.78, 0.08], [0.38, 0.18, 0.32], mixHex(T.lateral, '#ffffff', 0.15), per, { tissue: 'mesenchyme' });
      pts['perineoa'] = [0.36, -1.85, 0.1];
    }
  }

  // ———— the allantois → urachus → median umbilical ligament ————
  {
    const ura = clamp01(pose.urachus);
    const lig = clamp01(pose.ligament);
    const base: V3 = split > 0.5 ? [0, lerp(-0.1, 0.5, parts), lerp(0.85, 1.05, parts)] : [0, -0.5, 0.7];
    const al = L([base, [0, 0.9, 1.4], [0, 1.6, 1.55], add(UMB, [0, -0.05, -0.12])], 18);
    const id = lig > 0.5 ? 'erdiko-zilbor-lotailua' : ura > 0.5 ? 'urakoa' : 'alantoidea';
    const col = mixHex(mixHex(UC.endo, '#d8c08a', ura), LIGAMENT, lig);
    tube('allantois', id, al, col, lerp(0.14, 0.07, ura), 1, { groups: ['alantoidea', 'urakoa'], deep: darker(col) });
    // The lumen while it lasts (a dark core seen through the wall).
    if (ura < 0.99) tube('allumen', undefined, al.slice(1, -1), '#3a2a10', 0.06, 0.6 * (1 - ura), { quiet: true, outline: false }, 8);
    pts[id] = add(al[10], [0.18, 0, 0.12]);
    pts['alantoidea'] = pts[id];
    pts['urakoa'] = pts[id];
    // A fistula: cavities left along the urachus (it did not close completely).
    if (pose.fistula > 0.01)
      [0.35, 0.6].forEach((u, k) => {
        const p = al[Math.round(u * (al.length - 1))];
        ball(`fis${k}`, 'fistula-urakala', p, [0.13, 0.17, 0.13], '#e5484d', pose.fistula, { thin: 0.4 }, 8, 10);
        if (k === 0) pts['fistula-urakala'] = add(p, [0.16, 0, 0.1]);
      });
  }

  // ———— the kidney rising, the ureter and the mesonephric duct parting at the bladder ————
  const ducts = clamp01(pose.ducts);
  if (ducts > 0.01) {
    const part = clamp01(pose.part);
    const K: V3 = [0.7, lerp(-0.55, 1.9, clamp01(pose.kidUp)), -1.15];
    ball('kidney', 'giltzurruna', K, [0.32, 0.5, 0.25], UC.kidney, ducts, { deep: UC.kidneyDeep });
    pts['giltzurruna'] = add(K, [0.25, 0.3, 0.1]);
    const meso: V3 = [0.62, 1.6, -0.95];
    ball('meso', 'mesonefrosa', meso, [0.25, 0.75, 0.25], UC.ridge, 0.55 * ducts * (1 - 0.4 * part), { deep: UC.ridgeDeep, outline: false, tissue: 'mesenchyme' });
    pts['mesonefrosa'] = add(meso, [0.25, 0.45, 0.05]);
    // Where each opens: one common opening at first; then the ureter higher on the bladder, the duct lower.
    const common: V3 = [0.3, -0.62, 0.42];
    const urOpen = mix3(common, [0.3, 0.12, 0.38], part);
    const woOpen = mix3(common, [0.18, -1.0, 0.5], part);
    const wolff = L([add(meso, [0, -0.5, 0.05]), [0.62, 0.2, -0.75], [0.5, -0.5, -0.1], woOpen], 20);
    tube('wolff', 'hodi-mesonefrikoa', wolff, UC.wolff, 0.06, ducts, { deep: UC.wolffDeep });
    pts['hodi-mesonefrikoa'] = add(wolff[8], [0.12, 0, 0.05]);
    const urBase = mix3(wolff[17], urOpen, part);
    const ureter = L([add(K, [-0.05, -0.3, 0.2]), mix3(add(K, [0, -0.4, 0.25]), urBase, 0.5), urBase], 18);
    tube('ureter', 'ureterra', ureter, UC.bud, 0.055, ducts, { deep: UC.budDeep, groups: ['ureter-kimua'] });
    pts['ureterra'] = add(ureter[9], [0.12, 0, 0.05]);
  }

  // ———— the urethra: female (short; the vestibule; glands) or male (prostatic, membranous, penile; prostate) ————
  const gl = clamp01(pose.glands);
  if (female > 0.01 && gl > 0.01) {
    for (const [k, y, z] of [[0, -0.95, 0.85], [1, -1.15, 0.5], [2, -1.05, 0.9]] as const) ball(`ug${k}`, 'uretra-guruinak', [0.05, y, z], [0.09 * gl, 0.09 * gl, 0.09 * gl], '#d6a33a', female, {}, 8, 10);
    pts['uretra-guruinak'] = [0.2, -0.95, 0.92];
  }
  if (male > 0.01) {
    // The phallus (the genital tubercle lengthened), the urethra through it to the glans.
    const base: V3 = [0, -1.55, 1.25];
    const tipP: V3 = [0, -2.35, 2.55];
    const shaft = L([base, mix3(base, tipP, 0.5), tipP], 12);
    tube('penis', 'zakila', grown(shaft, male), '#f0b39a', 0.3, 0.35, { tissue: 'skin', outline: false });
    ball('glans', 'glandea', add(tipP, [0, -0.08, 0.12]), [0.34 * male, 0.3 * male, 0.38 * male], '#f0a8bc', 0.55, { tissue: 'skin' }, 10, 12);
    pts['zakila'] = add(shaft[5], [0.3, 0.15, 0]);
    pts['glandea'] = add(tipP, [0.3, 0.1, 0.3]);
    // Prostatic (just below the bladder), membranous (through the perineum), penile (in the shaft).
    const pros = L([[0, -0.7, 0.66], [0, -1.0, 0.68]], 6);
    const memb = L([[0, -1.0, 0.68], [0, -1.35, 0.85], [0, -1.55, 1.2]], 8);
    const pen = L([[0, -1.55, 1.2], mix3(base, tipP, 0.45), add(tipP, [0, 0.05, -0.18])], 14);
    tube('upros', 'uretra-prostatikoa', pros, '#ffd34d', 0.075, male, { groups: ['uretra'], deep: UC.endoDeep }, 10);
    tube('umemb', 'mintzezko-uretra', memb, '#f2b53a', 0.07, male, { groups: ['uretra'], deep: UC.endoDeep }, 10);
    tube('upen', 'zakil-uretra', grown(pen, male), '#e89a2c', 0.07, male, { groups: ['uretra'], deep: UC.endoDeep }, 10);
    pts['uretra-prostatikoa'] = [0.15, -0.82, 0.7];
    pts['mintzezko-uretra'] = [0.15, -1.3, 0.85];
    pts['zakil-uretra'] = add(pen[8], [0.12, 0, 0]);
    if (gl > 0.01) {
      ball('prostate', 'prostata', [0, -0.85, 0.66], [0.32 * gl, 0.26 * gl, 0.3 * gl], '#d6a33a', 0.6 * male, { thin: 0.4 });
      pts['prostata'] = [0.3, -0.85, 0.55];
    }
  }
  if (female > 0.01) pts['mintzezko-uretra'] = pts['uretra'];
  return { items, pts };
}
