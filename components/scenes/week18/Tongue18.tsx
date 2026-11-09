'use client';

import '@/components/scenes/week17/HeadMap'; // first: common.tsx and HeadMap.tsx import each other, and HeadMap needs ARCH at load
import { ARCH, BACK, KEY_ARCH, TISSUE, endPose, poseStage18, type StageSpec } from '@/components/scenes/week17/common';
import type { V3 } from '@/lib/three-d/math';
import { TP0, tongueModel, type TongueOpts, type TonguePose } from './tongue-model';

/**
 * Topic 18, section 2: the tongue on the floor of the pharynx (tongue-model.ts), one surface through four stages:
 * the body (arch I), the root (II, III and part of IV), the nerves region by region, and the occipital myoblasts.
 */

const build = (pose: TonguePose, opts: TongueOpts) => tongueModel(pose, opts);
const CAP = 'Faringearen zorua atzetik eta goitik (3D eredua): mihi-punta goian, enbrioiaren ezkerra zure ezkerrean';
const CAM = (dist = 10.5, target: V3 = [0, -0.25, 0], yaw = 180, elev = 12) => BACK(dist, target, yaw, elev);

// ———————————————————————————— 2.1 Gorputza ————————————————————————————

export const SB = [0, 0.25, 0.5, 0.75] as const;

const specBody: StageSpec<TonguePose, TongueOpts> = {
  S: SB,
  pose: TP0,
  opts: {},
  caption: CAP,
  key: KEY_ARCH,
  keyTitle: 'Kolorea = arkua',
  map: 'tongue',
  steps: [
    {
      cam: CAM(12, [0, -0.3, 0], 180, 14),
      glide: 0.06,
      names: [
        { id: 'lehen-arkua', text: 'I. arkua' },
        { id: 'bigarren-arkua', text: 'II. arkua', from: 0.2 },
        { id: 'hirugarren-arkua', text: 'III. arkua', from: 0.4 },
        { id: 'laugarren-arkua', text: 'IV. arkua', from: 0.6 },
      ],
      note: 'Faringearen zorua, barrutik: mihia hemen garatzen da, 4. astetik 8. astera, arku guztietatik',
    },
    {
      to: { lat: 1 },
      run: [0.1, 0.8],
      cam: CAM(9, [0, 0.75, 0], 172, 22),
      glide: 0.06,
      dim: ['alboko-goraguneak', 'lehen-arkua'],
      names: [{ id: 'alboko-goraguneak', text: 'Alboko goraguneak / goragune lateralak', sub: 'I. arkuaren mesenkimatik, erdirantz', from: 0.3 }],
      note: 'Lehen arkuaren mesenkiman bi goragune ateratzen dira erdikalderantz',
    },
    {
      to: { imp: 1 },
      run: [0.1, 0.75],
      cam: CAM(8, [0, 0.55, 0], 188, 26),
      glide: 0.05,
      dim: ['tuberkulu-bakoitia', 'alboko-goraguneak'],
      names: [{ id: 'tuberkulu-bakoitia', text: 'Tuberkulu bakoitia', sub: 'bien artean, I. arkutik ere', from: 0.25 }],
      note: 'Aldi berean, bien artean, lehen arkutik ere: tuberkulu bakoitia',
    },
    {
      to: { fuse: 1, grow: 0.45 },
      run: [0.08, 0.85],
      cam: CAM(9.5, [0, 0.55, 0], 180, 20),
      glide: 0.05,
      dim: ['mihiaren-gorputza', 'alboko-goraguneak', 'tuberkulu-bakoitia'],
      names: [{ id: 'mihiaren-gorputza', sub: 'hiru goragune fusionatuta: osoa I. arkutik', from: 0.55 }],
      note: 'Hiru goraguneak fusionatu: mihiaren gorputza. Gorputz osoa 1. arkutik (laranja)',
    },
  ],
};
export const TongueBody18 = poseStage18(specBody, build);

// ———————————————————————————— 2.1 Sustraia ————————————————————————————

export const SR = [0, 0.2, 0.4, 0.6, 0.8] as const;

const specRoot: StageSpec<TonguePose, TongueOpts> = {
  S: SR,
  pose: endPose(specBody).pose,
  opts: {},
  caption: CAP,
  key: KEY_ARCH,
  keyTitle: 'Kolorea = arkua',
  map: 'tongue',
  steps: [
    {
      to: { cop: 1 },
      run: [0.08, 0.7],
      cam: CAM(9.5, [0, -0.5, 0], 174, 16),
      glide: 0.06,
      dim: ['kupula', 'bigarren-arkua', 'hirugarren-arkua', 'laugarren-arkua'],
      names: [
        { id: 'kupula', text: 'Kupula (irudian: Kopula)', sub: 'II., III. eta IV. arkuen erdian', from: 0.2 },
        { id: 'bigarren-arkua', text: 'II. arkua', small: true, from: 0.4 },
        { id: 'hirugarren-arkua', text: 'III. arkua', small: true, from: 0.5 },
        { id: 'laugarren-arkua', text: 'IV. arkua (atal bat)', small: true, from: 0.6 },
      ],
      note: 'Bigarren, hirugarren eta laugarrenaren atal batetik: erdian goragune bat, kupula. Hortik mihiaren sustraia',
    },
    {
      to: { epi: 1 },
      run: [0.08, 0.7],
      cam: CAM(7.5, [0, -1.15, 0], 186, 20),
      glide: 0.05,
      dim: ['epiglotisa', 'laugarren-arkua'],
      names: [{ id: 'epiglotisa', sub: 'IV. arkuaren erdi dortsaletik, kupularen behean', from: 0.3 }],
      note: 'KONTUZ: IV. arkutik atal bat bakarrik, gainerakoak epiglotisa ematen baitu. Apunteen irudian berdez; hemen IV. arkua beti gorriz',
      warn: true,
    },
    {
      to: { sulc: 1, fc: 1, grow: 1 },
      run: [0.08, 0.75],
      cam: CAM(9.5, [0, 0.2, 0], 180, 24),
      glide: 0.05,
      dim: ['ildo-terminala', 'zulo-itsua', 'mihiaren-gorputza', 'kupula'],
      names: [
        { id: 'ildo-terminala', text: 'Ildo terminala', sub: 'V forma: gorputza | sustraia', p: 'ildo-terminala', from: 0.3 },
        { id: 'zulo-itsua', sub: 'V-aren erpinean: tuberkulua eta kupularen artean', from: 0.5 },
      ],
      note: 'Gorputza eta sustraiaren artean V formako ildoa. Bere erpinean aztarnatxo bat: zulo itsua',
    },
    {
      to: { ary: 1 },
      run: [0.08, 0.7],
      cam: CAM(6.8, [0, -2.0, 0], 176, 26),
      glide: 0.05,
      dim: ['laringe-zuloa', 'aritenoide-goraguneak', 'epiglotisa'],
      names: [
        { id: 'laringe-zuloa', sub: 'epiglotisak estaltzen du' },
        { id: 'aritenoide-goraguneak', text: 'Aritenoides goraguneak', sub: 'gero aritenoides kartilagoak', from: 0.35 },
      ],
      note: 'Epiglotisak laringe zuloa estaltzen du, janaria arnasbideetara joan ez dadin; jaioberriek jan eta arnasa batera. Alboetan aritenoides goraguneak',
    },
    {
      to: { root: 1, deep: 1 },
      run: [0.06, 0.8],
      cam: CAM(11.5, [0, -0.5, 0.2], 128, 12),
      glide: 0.07,
      dim: ['mihiaren-sustraia', 'mihiaren-gorputza', 'kupula'],
      names: [
        { id: 'mihiaren-gorputza', sub: 'kanpotik ikusten duguna' },
        { id: 'mihiaren-sustraia', sub: 'barnetik: luzatu, leporaino', from: 0.45 },
      ],
      note: 'Kamera alborantz biratu da. Kanpotik gorputza ikusten dugu; sustraia luzatu eta leporaino heltzen da: mihia handia da sakonean',
    },
  ],
};
export const TongueRoot18 = poseStage18(specRoot, build);

// ———————————————————————————— 2.2 Inerbazioa ————————————————————————————

export const SN = [0, 0.16, 0.33, 0.5, 0.66, 0.83] as const;

const KEY_NERVE = [
  { color: ARCH.i, text: 'V3 · orokorra' },
  { color: ARCH.ii, text: 'VII · dastamena' },
  { color: ARCH.iii, text: 'IX · aurreko sustraia' },
  { color: ARCH.iv, text: 'X · atzeko sustraia' },
] as const;

const specNerve: StageSpec<TonguePose, TongueOpts> = {
  S: SN,
  pose: { ...endPose(specRoot).pose },
  opts: {},
  caption: CAP,
  key: KEY_NERVE,
  keyTitle: 'Kolorea = nerbioa',
  map: 'tongue',
  steps: [
    {
      to: { nerve: 1, deep: 0.25 },
      run: [0.1, 0.8],
      cam: CAM(11, [0, -0.2, 0], 180, 18),
      glide: 0.07,
      names: [
        { id: 'mihiaren-gorputza', sub: 'aurreko bi herenak', from: 0.2 },
        { id: 'mihiaren-sustraia', sub: 'atzeko herena', from: 0.4 },
      ],
      note: 'Kamera atzera itzuli da. Arku bakoitzari nerbio bat: mihia arku ezberdinetatik datorrenez, inerbazio konplexua. Orain koloreak nerbioak dira',
    },
    {
      to: { n5: 1 },
      run: [0.08, 0.7],
      cam: CAM(8.5, [0, 1.0, 0], 170, 24),
      glide: 0.05,
      dim: ['barail-nerbioa', 'mihiaren-gorputza'],
      names: [{ id: 'barail-nerbioa', text: 'V3: trigeminoaren barail adarra', sub: 'gorputzaren sentsibilitate orokorra', from: 0.2 }],
      note: 'Gorputza: V3 (V. bikote kraneala). Sentsibilitate orokorra: hotza, berotasuna, ukimena, mina, testurak',
    },
    {
      to: { n7: 1, taste: 1 },
      run: [0.08, 0.75],
      cam: CAM(8.5, [0, 0.8, 0], 190, 26),
      glide: 0.05,
      dim: ['aurpegi-nerbioa', 'mihiaren-gorputza'],
      names: [
        { id: 'aurpegi-nerbioa', text: 'VII: aurpegi nerbioaren adarra', sub: 'gorputzaren dastamena (puntu urdinak)', from: 0.2 },
        { id: 'mihiaren-gorputza', small: true, from: 0.4 },
      ],
      note: 'Gorputza: VII.aren adar batek dastamena. Gorputz berean bi nerbio: V3 orokorra, VII dastamena',
    },
    {
      to: { n9: 1 },
      run: [0.08, 0.7],
      cam: CAM(8, [0, -0.75, 0], 174, 20),
      glide: 0.05,
      dim: ['glosofaringeoa'],
      names: [{ id: 'glosofaringeoa', text: 'IX: nerbio glosofaringeoa', sub: 'sustraiaren aurrekoa: OSOA (dastamena + orokorra)', from: 0.2 }],
      note: 'Sustraiaren aurreko aldea: IX.aren adarra. Informazio sentsitibo OSOA: dastamena eta sentsibilitate orokorra',
    },
    {
      to: { n10: 1 },
      run: [0.08, 0.7],
      cam: CAM(7.5, [0, -1.25, 0], 186, 22),
      glide: 0.05,
      dim: ['goiko-laringe-nerbioa'],
      names: [{ id: 'goiko-laringe-nerbioa', text: 'X: bagoaren adarra (goiko laringe nerbioa)', sub: 'sustraiaren atzekoa: OSOA', from: 0.2 }],
      note: 'Sustraiaren atzeko aldea: bagoaren adar bat, goiko laringe nerbioa (X.). Informazio sentsitibo OSOA hemen ere',
    },
    {
      cam: CAM(10.5, [0, -0.1, 0], 180, 18),
      glide: 0.05,
      dim: ['barail-nerbioa', 'aurpegi-nerbioa', 'glosofaringeoa', 'goiko-laringe-nerbioa', 'mihiaren-gorputza', 'mihiaren-sustraia'],
      names: [
        { id: 'barail-nerbioa', text: 'V3', sub: 'orokorra' },
        { id: 'aurpegi-nerbioa', text: 'VII', sub: 'dastamena', from: 0.15 },
        { id: 'glosofaringeoa', text: 'IX', sub: 'aurreko sustraia, biak', from: 0.3 },
        { id: 'goiko-laringe-nerbioa', text: 'X', sub: 'atzeko sustraia, biak', from: 0.45 },
      ],
      note: 'Taula irudi batean: gorputza V3 + VII; sustraia IX (aurrean) eta X (atzean), bakoitzak bi sentsibilitateak',
    },
  ],
};
export const TongueNerves18 = poseStage18(specNerve, build);

// ———————————————————————————— 2.2 Muskuluak ————————————————————————————

export const SM = [0, 0.18, 0.38, 0.6, 0.8] as const;

const KEY_MUSCLE = [
  { color: TISSUE.paraxial, text: 'somita okzipitalak' },
  { color: TISSUE.muscle, text: 'mioblastoak → muskuluak' },
  { color: '#f7e17a', text: 'XII. nerbioa' },
] as const;

const SIDE_CAM = (dist = 11.5, target: V3 = [0.2, -1.0, 0.2], yaw = 118, elev = 8) => BACK(dist, target, yaw, elev);

const specMuscle: StageSpec<TonguePose, TongueOpts> = {
  S: SM,
  pose: { ...endPose(specNerve).pose, nerve: 0.0, n5: 0, n7: 0, n9: 0, n10: 0, taste: 0 },
  opts: {},
  caption: CAP,
  key: KEY_MUSCLE,
  map: 'tongue',
  steps: [
    {
      to: { som: 1 },
      run: [0.08, 0.7],
      cam: CAM(14, [0, -1.5, -0.2], 180, 16),
      glide: 0.07,
      dim: ['somita-okzipitalak'],
      names: [{ id: 'somita-okzipitalak', text: '3 somita bikote okzipital', sub: 'ez arkuetatik: oso bestelako jatorria', from: 0.3 }],
      note: 'Mihiaren barneko muskuluak ez dira arkuetatik garatzen, baizik eta 3 somita bikote okzipitaleko mioblastoetatik',
    },
    {
      to: { cut: 1 },
      run: [0.1, 0.8],
      cam: SIDE_CAM(13, [0.2, -0.9, 0.2], 118, 8),
      glide: 0.08,
      fit: false,
      dim: ['somita-okzipitalak', 'mihiaren-gorputza', 'mihiaren-sustraia'],
      names: [
        { id: 'mihiaren-gorputza', text: 'Mihia erdibitan ebakita', sub: 'barrua ikusteko', from: 0.3 },
        { id: 'mihiaren-sustraia', small: true, from: 0.45 },
      ],
      note: 'Kamera ezkerreko alborantz biratu da eta mihia erdiko planoan ebaki da: barrua ikusteko',
    },
    {
      to: { myo: 1, s4: 1 },
      run: [0.04, 0.92],
      cam: SIDE_CAM(13, [0.3, -1.1, 0.2], 112, 8),
      glide: 0.05,
      fit: false,
      dim: ['mioblasto-okzipitalak', 'somita-okzipitalak'],
      names: [
        { id: 'mioblasto-okzipitalak', text: 'Mioblastoak', sub: 'mugitu eta mihiaren barrura migratu', from: 0.2 },
        { id: 'somita-okzipitalak', sub: '4. bikote kraneala desagertu', from: 0.55 },
      ],
      note: 'Mioblastoak mugitu eta mihiaren barrura sartzen dira. 4. somita bikote kraneala desagertu egiten da',
    },
    {
      to: { fib: 1 },
      run: [0.06, 0.8],
      cam: SIDE_CAM(9, [0.05, 0.6, 0.2], 106, 8),
      glide: 0.05,
      fit: false,
      dim: ['mihiaren-muskuluak'],
      names: [{ id: 'mihiaren-muskuluak', text: 'Mihiaren muskulu intrinsekoak (barnekoak)', from: 0.35 }],
      note: 'Bertan muskulu intrinsekoak eratzen dituzte: mihia egitura muskularra da',
    },
    {
      to: { n12: 1 },
      run: [0.06, 0.85],
      cam: SIDE_CAM(13, [0.3, -1.0, 0.2], 114, 8),
      glide: 0.05,
      fit: false,
      dim: ['hipoglosoa', 'mihiaren-muskuluak'],
      names: [
        { id: 'hipoglosoa', text: 'XII: nerbio hipoglosoa', sub: 'motorra · ez dago arkuekin zuzenean lotuta', from: 0.3 },
        { id: 'mihiaren-muskuluak', small: true, text: 'Muskulu intrinsekoak' },
      ],
      note: 'XII. bikotea, nerbio hipoglosoa (gloso = mihia), motorra: mihia mugitzen du. V, VII, IX eta X mistoak: mihian sentsibilitateaz arduratzen dira',
    },
  ],
};
export const TongueMuscles18 = poseStage18(specMuscle, build);
