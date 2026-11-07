'use client';

import { orbit, poseStage, type StageSpec } from './common';
import type { V3 } from '@/lib/three-d/math';
import { UC } from './uro-model';
import { KP0, kidneyModel, type KidneyOpts, type KidneyPose } from './kidney-model';
import { NP0, nephronModel, type NephronOpts, type NephronPose } from './nephron-model';
import { AC, AP0, adrenalModel, type AdrenalOpts, type AdrenalPose } from './adrenal-model';

/**
 * Topic 15's close-ups: the collecting system branching inside the blastema (stage 8), a nephron forming at
 * a collecting tubule's tip (stage 9), and the suprarenal gland cut open (stage 11).
 */

const SH: [number, number] = [20, 10];

// ———————————————————————————— 8. Sistema biltzailea ————————————————————————————

export const S8 = [0, 0.2, 0.42, 0.64, 0.82] as const;
const KCAM = (dist = 9, yaw = 0, elev = 8, target: [number, number, number] = [0, -0.2, 0]) => orbit(yaw, elev, dist, target, SH);
const KEY_K = [
  { color: UC.bud, text: 'ureter kimua (biltzailea)' },
  { color: UC.blast, text: 'blastema (iraizlea)' },
] as const;

const spec8: StageSpec<KidneyPose, KidneyOpts> = {
  map: 'kidney',
  where: { th: -0.9, at: [-2.4, -0.4, 3.0], scale: 6, planes: [-1, 1].map((s) => ({ center: [0, -0.4 + s * 2.2, 0] as V3, a: [2.2, 0, 0] as V3, b: [0, 0, 1.8] as V3 })), note: 'Ezkerreko metanefrosa: atzeko paretan, sakroaren mailan; aurretik eta gertutik' },
  S: S8,
  pose: KP0,
  opts: {},
  caption: 'Ezkerreko metanefrosa aurretik (3D eredua): hiloa zure ezkerrean',
  key: KEY_K,
  steps: [
    {
      to: { enter: 1, wrap: 1 },
      run: [0.08, 0.85],
      cam: KCAM(10, 0, 6, [-0.3, -0.6, 0]),
      glide: 0.06,
      dim: ['ureter-kimua', 'blastema-metanefrikoa'],
      names: [
        { id: 'ureter-kimua', sub: 'blasteman sartzen' },
        { id: 'blastema-metanefrikoa', sub: 'kimua inguratzen du', from: 0.4 },
      ],
      note: 'Kimua blasteman sartzen hasten da, eta blastemak kimua inguratzen du',
    },
    {
      to: { amp: 1, pelvis: 1 },
      run: [0.06, 0.85],
      cam: KCAM(7.5, 10, 8, [-0.3, 0, 0]),
      glide: 0.05,
      dim: ['metanefros-hasikina', 'giltzurrun-pelbisa'],
      names: [
        { id: 'metanefros-hasikina', sub: 'kimuaren muturra zabalduta' },
        { id: 'giltzurrun-pelbisa', sub: 'inbutu forma', from: 0.55 },
      ],
      note: 'Sartuta, kimuaren muturra zabaltzen da (metanefros hasikina) eta inbutu forma hartzen du: giltzurrun pelbisa',
    },
    {
      to: { major: 1 },
      run: [0.08, 0.8],
      cam: KCAM(8.5, 8, 8, [-0.1, 0, 0]),
      dim: ['kaliza-nagusiak', 'giltzurrun-pelbisa'],
      names: [{ id: 'kaliza-nagusiak', sub: 'bi edo hiru, kopa formakoak', from: 0.5 }],
      note: 'Pelbisa adarkatzen da: lehen adar nagusiak, kaliza nagusiak (bi edo hiru, kopa formakoak)',
    },
    {
      to: { minor: 1, coll: 1, bean: 1 },
      run: [0.05, 0.85],
      cam: KCAM(12.5, 14, 10, [0, -0.15, 0]),
      glide: 0.05,
      dim: ['kaliza-txikiak', 'hodi-biltzaileak', 'kaliza-nagusiak'],
      names: [
        { id: 'kaliza-txikiak', sub: '7. asterako', from: 0.15 },
        { id: 'hodi-biltzaileak', sub: 'luzeak eta finak · 9.–10. asterako', from: 0.5 },
      ],
      note: 'Kaliza nagusi bakoitza → kaliza txikiak (7. astea); hauek → hodi biltzaileak, luze eta finak (9.–10. astea)',
    },
    {
      to: { urine: 1 },
      run: [0.05, 0.95],
      cam: KCAM(13, -10, 8, [-0.1, -0.45, 0]),
      glide: 0.05,
      dim: ['hodi-biltzaileak', 'kaliza-txikiak', 'kaliza-nagusiak', 'giltzurrun-pelbisa', 'ureterra'],
      names: [
        { id: 'hodi-biltzaileak', small: true },
        { id: 'kaliza-txikiak', small: true },
        { id: 'kaliza-nagusiak', small: true },
        { id: 'giltzurrun-pelbisa', sub: 'blastematik kanpo geratzen den bakarra' },
        { id: 'ureterra', sub: '→ gernu maskurira', from: 0.3 },
      ],
      note: 'Gernua adarkaduraren kontrako norabidean: hodi biltzaileak → kaliza txikiak → nagusiak → pelbisa → ureterra → gernu maskuria',
    },
  ],
};
export const Kidney15 = poseStage(spec8, (p, o) => kidneyModel(p, o));

// ———————————————————————————— 9. Nefrona ————————————————————————————

export const S9 = [0, 0.16, 0.32, 0.5, 0.68, 0.84] as const;
const NCAM = (dist = 8, yaw = 0, elev = 6, target: [number, number, number] = [0.6, 0, 0]) => orbit(yaw, elev, dist, target, SH);
const KEY_N = [
  { color: UC.bud, text: 'hodi biltzailea' },
  { color: UC.blast, text: 'nefrona (blastema)' },
  { color: UC.glom, text: 'glomerulua' },
] as const;

const spec9: StageSpec<NephronPose, NephronOpts> = {
  map: 'nephron',
  where: { th: -0.9, at: [-2.4, -0.4, 3.0], scale: 6, planes: [-1, 1].map((s) => ({ center: [0, -0.4 + s * 2.2, 0] as V3, a: [2.2, 0, 0] as V3, b: [0, 0, 1.8] as V3 })), note: 'Giltzurrunaren barrura: nefrona bakoitza giltzurrun kortexean eratzen da' },
  S: S9,
  pose: NP0,
  opts: {},
  caption: 'Hodi biltzaile baten muturra blastema barruan (3D eredua, oso handituta)',
  key: KEY_N,
  steps: [
    {
      to: { cap: 1 },
      run: [0.1, 0.8],
      cam: NCAM(6.5, 6, 6, [0.9, 0.9, 0]),
      glide: 0.06,
      dim: ['hodi-biltzaileak', 'kapsula-metanefrikoa'],
      names: [
        { id: 'hodi-biltzaileak', sub: 'blasteman sartuta' },
        { id: 'kapsula-metanefrikoa', sub: 'adarraren muturrean, txano itxuran', from: 0.35 },
        { id: 'blastema-metanefrikoa', small: true, from: 0.5 },
      ],
      note: 'Hodi biltzaileen adarren muturrean, blastemako zelulak txano itxuran metatzen dira: ehun metanefrikozko kapsula',
    },
    {
      to: { vesicle: 1 },
      run: [0.1, 0.8],
      cam: NCAM(5.5, 12, 6, [1.2, 1.0, 0]),
      dim: ['xixku-metanefrikoa'],
      names: [{ id: 'xixku-metanefrikoa', sub: 'trinkoa → barrunbea (bakuolizatu)', from: 0.3 }],
      note: 'Hasieran trinkoa; gero barruan barrunbe bat sortzen da: xixku metanefrikoa',
    },
    {
      to: { tubule: 1, fuse: 1 },
      run: [0.06, 0.85],
      cam: NCAM(6, 8, 6, [1.3, 0.8, 0]),
      glide: 0.05,
      dim: ['nefrona', 'hodi-biltzaileak'],
      names: [
        { id: 'nefrona', text: 'Xixkua → hodia', sub: 'bi mutur' },
        { id: 'hodi-biltzaileak', p: 'nefrona-fusioa', text: 'Erdiko muturra', sub: 'hodi biltzailearekin fusionatu: hodi bakarra', key: 'fus', from: 0.45 },
      ],
      note: 'Xixkua luzatu eta hodi bihurtzen da. Erdiko muturra hodi biltzailearen adarrarekin fusionatzen da: hodi bakarra, komunikazioa irekita',
    },
    {
      to: { glom: 1, bowman: 1 },
      run: [0.06, 0.85],
      cam: NCAM(5.6, 22, 8, [1.6, 0.6, 0]),
      glide: 0.05,
      dim: ['glomeruluak', 'kapsula-glomerularra', 'arteriola-aferentea', 'arteriola-eferentea'],
      names: [
        { id: 'glomeruluak', sub: 'giltzurrun arteriaren adarretatik' },
        { id: 'kapsula-glomerularra', sub: 'beste muturra: txano formakoa', from: 0.3 },
        { id: 'arteriola-aferentea', small: true, from: 0.5 },
        { id: 'arteriola-eferentea', small: true, from: 0.6 },
      ],
      note: 'Beste muturra glomerulurantz: txano formako kapsula. Glomeruluak ez datoz aortatik zuzenean, giltzurrun arterien adarretatik',
    },
    {
      to: { grow: 1, parts: 1 },
      run: [0.05, 0.8],
      cam: NCAM(10, 10, 6, [1.1, -0.15, 0]),
      glide: 0.06,
      dim: ['hodixka-bihurgunetsu-proximala', 'henle-lakioa', 'hodixka-bihurgunetsu-distala', 'korpuskulua'],
      names: [
        { id: 'hodixka-bihurgunetsu-proximala', sub: 'kapsulatik hurbilena', from: 0.25 },
        { id: 'henle-lakioa', sub: 'atal zuzena', from: 0.4 },
        { id: 'hodixka-bihurgunetsu-distala', sub: 'hodi biltzailearen ondoan', from: 0.55 },
      ],
      note: 'Hodia bihurritu egiten da bi muturretan, tartekoa zuzen: hodixka bihurgunetsu proximala, Henle lakioa, hodixka bihurgunetsu distala',
    },
    {
      to: { many: 1, urine: 1 },
      run: [0.05, 0.95],
      cam: NCAM(13.5, 0, 6, [0.3, -0.55, 0]),
      glide: 0.06,
      dim: ['nefrona', 'hodi-biltzaileak'],
      names: [
        { id: 'nefrona', sub: 'unitate funtzionala · 14. astetik gernua' },
        { id: 'hodi-biltzaileak', sub: 'hainbat nefronaren gernua biltzen du', from: 0.35 },
      ],
      note: 'Nefrona: unitate iraizle funtzionala (blastematik). Gernua 14. astetik. Hodi biltzaile bakoitzak hainbat nefronaren gernua biltzen du',
    },
  ],
};
export const Nephron15 = poseStage(spec9, (p, o) => nephronModel(p, o));

// ———————————————————————————— 11. Giltzurrun gaineko guruinak ————————————————————————————

export const S11 = [0, 0.2, 0.4, 0.6, 0.8] as const;
const ACAM = (dist = 8, yaw = 0, elev = 4, target: [number, number, number] = [-0.4, 0, 0]) => orbit(yaw, elev, dist, target, SH);
const KEY_A = [
  { color: AC.fetal, text: 'fetu-kortexa (mesodermoa)' },
  { color: AC.medulla, text: 'muina (gandor neurala)' },
  { color: AC.definitive, text: 'behin-betiko kortexa' },
] as const;

const spec11: StageSpec<AdrenalPose, AdrenalOpts> = {
  map: 'adrenal',
  where: { th: 0.1, at: [-2.6, -0.4, 3.0], scale: 6, planes: [-1, 1].map((s) => ({ center: [-0.2, -0.4 + s * 2.0, 0] as V3, a: [2.2, 0, 0] as V3, b: [0, 0, 1.8] as V3 })), note: 'Ezkerreko giltzurrun gaineko guruina: gonadaren eta giltzurrunaren artean; aurretik eta gertutik' },
  S: S11,
  pose: AP0,
  opts: {},
  caption: 'Giltzurrun gaineko guruina erdibituta, aurretik (3D eredua): alde mediala zure ezkerrean',
  key: KEY_A,
  steps: [
    {
      to: { fetal: 0.35 },
      run: [0.3, 0.9],
      cam: ACAM(8.5, 0, 6, [-0.2, -0.4, 0]),
      glide: 0.06,
      names: [{ id: 'gandor-urogenitala', small: true, from: 0.4 }],
    },
    {
      to: { fetal: 1 },
      run: [0.06, 0.8],
      cam: ACAM(8, 6, 6, [0, -0.4, 0]),
      dim: ['fetu-kortexa', 'gandor-urogenitala'],
      names: [
        { id: 'fetu-kortexa', sub: 'gandor urogenitaletako zelulak: mesodermoa' },
        { id: 'gandor-urogenitala', small: true },
      ],
      note: '6. astetik: lehenengo kortexa, enbrio- edo fetu-kortexa, gandor urogenitaleko zelulek multzokatuta (mesodermoa)',
    },
    {
      to: { crest: 1, medulla: 1 },
      run: [0.05, 0.9],
      cam: ACAM(8.5, -8, 6, [-0.9, 0.2, 0]),
      glide: 0.05,
      dim: ['gandor-neurala', 'giltzurrun-gaineko-muina', 'fetu-kortexa'],
      names: [
        { id: 'gandor-neurala', text: 'Gandor neuraleko zelulak', sub: 'maila bereko gongoiletatik' },
        { id: 'giltzurrun-gaineko-muina', sub: 'alde medialetik sartu → muina', from: 0.45 },
      ],
      note: 'Maila bereko gongoiletako gandor neuraleko zelulak alde medialerantz doaz, itsatsi eta barneratzen dira: muina (ektodermoa)',
    },
    {
      to: { definitive: 1 },
      run: [0.06, 0.8],
      cam: ACAM(6.5, 6, 6, [0, 0, 0]),
      glide: 0.05,
      dim: ['behin-betiko-kortexa', 'fetu-kortexa', 'giltzurrun-gaineko-muina'],
      names: [
        { id: 'behin-betiko-kortexa', sub: 'fetu-kortexean bereizten den geruza berria', from: 0.25 },
        { id: 'fetu-kortexa', small: true },
      ],
      note: 'Fetu-kortexaren barruan beste geruza bat bereizten da: behin-betiko kortexaren hasikina; gero geruza gehiago',
    },
    {
      to: { medSize: 2, fetalGone: 1 },
      run: [0.05, 0.9],
      cam: ACAM(6.5, 0, 6, [0, 0, 0]),
      glide: 0.05,
      dim: ['giltzurrun-gaineko-muina', 'behin-betiko-kortexa', 'fetu-kortexa'],
      names: [
        { id: 'giltzurrun-gaineko-muina', sub: 'txikitu, gero handitu' },
        { id: 'fetu-kortexa', sub: 'lehen urtean desagertzen', from: 0.3 },
        { id: 'behin-betiko-kortexa', small: true, from: 0.5 },
      ],
      note: 'Muina hasieran txikitu eta gero handitzen da. Behin-behineko (fetu) kortexa lehen urtean desagertzen da: guruina jaio ondoren ere garatzen ari da',
    },
  ],
};
export const Adrenal15 = poseStage(spec11, (p, o) => adrenalModel(p, o));
