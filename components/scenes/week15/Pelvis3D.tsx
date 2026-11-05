'use client';

import { T } from '@/components/scenes/week10/common';
import { endPose, orbit, poseStage, type StageSpec } from './common';
import { UC } from './uro-model';
import { PP0, pelvisModel, type PelvisOpts, type PelvisPose } from './pelvis-model';
import { TP0, trigoneModel, type TrigoneOpts, type TrigonePose } from './trigone-model';
import { GP0, glansModel, type GlansOpts, type GlansPose } from './glans-model';

/**
 * Topic 15, notes 2.2–2.4, on the caudal end cut down the middle (pelvis-model.ts, seen from the embryo's left
 * as the notes' figures: the belly on the viewer's left), the bladder from behind (trigone-model.ts) and the
 * end of the penis cut down its middle (glans-model.ts).
 */

const SH: [number, number] = [20, 0];
/** From the embryo's left: ventral on the viewer's left, as the notes draw their sagittal sections. */
const SIDE = (dist = 8.5, target: [number, number, number] = [0, -0.3, 0.2], yaw = 90, elev = 4) => orbit(yaw, elev, dist, target, SH);
const CAP_SIDE = 'Enbrioiaren alde kaudala, erdibituta, ezkerretik (3D eredua): sabela zure ezkerrean, bizkarra eskuinean';

const KEY_S = [
  { color: UC.endo, text: 'endodermoa' },
  { color: T.lateral, text: 'mesodermoa (trenkada)' },
  { color: T.ecto, text: 'ektodermoa' },
] as const;

// ———————————————————————————— 12. Sinu urogenitala ————————————————————————————

export const S12 = [0, 0.12, 0.25, 0.37, 0.5, 0.62, 0.75, 0.88] as const;

const spec12: StageSpec<PelvisPose, PelvisOpts> = {
  where: { th: -1.45, at: [0, -0.2, -0.5], scale: 2.2, planes: [{ center: [0, -0.2, 0.1], a: [0, 0, 2.1], b: [0, 2.7, 0] }], note: 'Enbrioiaren behealdea, erditik moztuta (ebakidura sagitala), ezkerretik ikusita' },
  S: S12,
  pose: PP0,
  opts: {},
  caption: CAP_SIDE,
  key: KEY_S,
  keyTitle: 'Kolorea = jatorria',
  steps: [
    {
      cam: SIDE(9, [0, -0.2, 0.1]),
      glide: 0.06,
      dim: ['kloaka', 'kloaka-mintza', 'atzeko-hestea'],
      names: [
        { id: 'atzeko-hestea', sub: 'digestio hodiaren amaiera' },
        { id: 'kloaka', sub: 'barrunbe bakarra', from: 0.25 },
        { id: 'kloaka-mintza', sub: 'endodermikoa', from: 0.45 },
      ],
      note: 'Hasieran digestio hodia barrunbe bakar batean amaitzen da, kloakan, mintz bakarrarekin: kloaka mintza (endodermikoa)',
    },
    {
      to: { sept: 1, split: 1 },
      run: [0.05, 0.85],
      cam: SIDE(7.5, [0, -0.7, 0.1]),
      glide: 0.05,
      dim: ['trenkada-uroerrektala', 'uzki-hodia', 'uzki-mintza', 'sinu-urogenitala'],
      names: [
        { id: 'trenkada-uroerrektala', sub: 'barnetik larruazaleraino (4.–7. asteak)' },
        { id: 'uzki-hodia', sub: 'atzean', from: 0.5 },
        { id: 'uzki-mintza', small: true, from: 0.6 },
        { id: 'sinu-urogenitala', text: 'Behin-behineko sinu urogenitala', sub: 'aurrean', from: 0.65 },
      ],
      note: '4.–7. asteetan kloaka trenkadatzen da, barnetik larruazaleraino: atzean uzki hodia (uzki mintzarekin), aurrean behin-behineko sinu urogenitala',
    },
    {
      to: { parts: 1 },
      run: [0.06, 0.8],
      cam: SIDE(7, [0, -0.4, 0.5]),
      glide: 0.05,
      dim: ['gernu-maskuria', 'sinu-urogenitala', 'alantoidea'],
      names: [
        { id: 'gernu-maskuria', sub: 'goian, zabalena', from: 0.35 },
        { id: 'alantoidea', small: true, from: 0.55 },
      ],
      note: 'Sinu urogenitalaren eremuan hiru barrunbe, luzatu eta alantoidean amaitzen direnak. Goian, zabalena: gernu maskuria',
    },
    {
      cam: SIDE(6, [0, -0.9, 0.6], 96, 4),
      dim: ['atal-pelbianoa'],
      names: [{ id: 'atal-pelbianoa', sub: 'estua → uretra' }],
      note: 'Atal pelbianoa: estutu egiten da, gernu maskuriaren jarraia; uretra bihurtzen da (emeetan mintzezkoa; arretan mintzezkoa eta prostatikoa)',
    },
    {
      cam: SIDE(6, [0, -1.2, 0.4], 84, 6),
      dim: ['behin-betiko-sinu-urogenitala', 'mintz-urogenitala', 'perineoa'],
      names: [
        { id: 'behin-betiko-sinu-urogenitala', sub: 'zapala: gernuaren irteera' },
        { id: 'mintz-urogenitala', small: true, from: 0.3 },
        { id: 'perineoa', sub: 'sinuaren eta uzkiaren artean', from: 0.5 },
      ],
      note: 'Behin-betiko sinu urogenitala: barrunbe zapala, mintz urogenitalez estalia (emeetan bestibulua, arretan zakil uretra). Uzkiaren artean: perineoa',
    },
    {
      cam: SIDE(8.5, [0, 0.1, 0.5], 90, 4),
      glide: 0.05,
      dim: ['alantoidea', 'gernu-maskuria', 'atal-pelbianoa', 'behin-betiko-sinu-urogenitala'],
      names: [
        { id: 'alantoidea', sub: '1. hodi moduan' },
        { id: 'gernu-maskuria', text: '2. Gernu maskuria', sub: 'zabalgunea' },
        { id: 'atal-pelbianoa', text: '3. Atal pelbianoa', sub: 'estua' },
        { id: 'behin-betiko-sinu-urogenitala', text: '4. Behin-betiko sinu urogenitala', sub: 'zapala' },
      ],
      note: 'Goitik behera: alantoidea (hodia) → gernu maskuria (zabalgunea) → atal pelbianoa (estua) → behin-betiko sinu urogenitala (zapala)',
    },
    {
      to: { urachus: 1, ligament: 1 },
      run: [0.06, 0.8],
      cam: SIDE(8.5, [0, 0.7, 1.0], 80, 6),
      glide: 0.05,
      dim: ['alantoidea', 'urakoa', 'erdiko-zilbor-lotailua', 'gernu-maskuria'],
      names: [
        { id: 'urakoa', sub: 'barrunbea galdu: soka trinkoa', from: 0.1 },
        { id: 'erdiko-zilbor-lotailua', sub: 'erpinetik zilborrera: gernu maskuria eusten du', from: 0.55 },
        { id: 'zilborrestea', small: true, from: 0.7 },
      ],
      note: 'Alantoideak barrunbea galdu eta itxi egiten da: urakoa (soka trinkoa). Hortik erdiko zilbor-lotailua, gernu maskuriaren erpinetik zilborrera',
    },
    {
      // Not closed: an urachus with cavities left in it, not the ligament.
      to: { fistula: 1, ligament: 0 },
      run: [0.1, 0.5],
      cam: SIDE(8, [0, 0.8, 1.1], 76, 6),
      glide: 0.05,
      dim: ['fistula-urakala', 'urakoa'],
      names: [
        { id: 'urakoa', sub: 'itxi gabe', small: true, from: 0.2 },
        { id: 'fistula-urakala', sub: 'urakoa guztiz itxi ez bada', from: 0.3 },
      ],
      note: 'KONTUZ: urakoa guztiz ixten ez bada (soka forma hartzen ez badu), barnean barrunbeak geratzen dira: fistulak, jaioberrietan arazoak',
      warn: true,
    },
  ],
};
export const Sinus15 = poseStage(spec12, (p, o) => pelvisModel(p, o));

// ———————————————————————————— 13. Gernu maskuria: igoera, trigonoa, urakoa ————————————————————————————

export const S13 = [0, 0.18, 0.36, 0.54, 0.72, 0.86] as const;
// The kidney, the ureter and the duct come in at the start (stage 12 had none).
const P13: PelvisPose = { ...PP0, sept: 1, split: 1, parts: 1, urachus: 0.6 };

const spec13side: StageSpec<PelvisPose, PelvisOpts> = {
  S: S13,
  pose: P13,
  opts: {},
  caption: CAP_SIDE,
  key: [
    { color: UC.endo, text: 'gernu maskuria' },
    { color: UC.wolff, text: 'hodi mesonefrikoa' },
    { color: UC.bud, text: 'ureterra' },
    { color: UC.kidney, text: 'giltzurruna' },
  ],
  steps: [
    {
      to: { kidUp: 1, ducts: 1 },
      run: [0.06, 0.9],
      cam: SIDE(10, [0, 0.4, 0.0], 70, 6),
      glide: 0.06,
      dim: ['giltzurruna', 'ureterra', 'gernu-maskuria'],
      names: [
        { id: 'gernu-maskuria', sub: 'endodermikoa · beherago' },
        { id: 'giltzurruna', sub: 'atzeko paretan gora (pasiboki)', from: 0.3 },
        { id: 'ureterra', sub: 'ia horizontala bukaeran', from: 0.6 },
      ],
      note: 'Enbrioia altxatu eta luzatzean gernu maskuria beherago geratzen da; bizkarra luzatzean giltzurrunak gora: mugimendu pasiboa',
    },
    {
      to: { part: 1 },
      run: [0.06, 0.85],
      cam: SIDE(7.5, [0.2, -0.3, 0.2], 60, 8),
      glide: 0.05,
      dim: ['ureterra', 'hodi-mesonefrikoa', 'gernu-maskuria'],
      names: [
        { id: 'hodi-mesonefrikoa', sub: 'beherantz' },
        { id: 'ureterra', sub: 'gorantz · askatuta', from: 0.3 },
      ],
      note: 'Hasieran hodi mesonefrikoa eta ureter kimua batera (kimua haren adarra zen). Askatu egiten dira: ureterra gorantz, hodi mesonefrikoa beherantz',
    },
    { cam: SIDE(7.5, [0.2, -0.3, 0.2], 60, 8) },
    { cam: SIDE(7.5, [0.2, -0.3, 0.2], 60, 8) },
    { cam: SIDE(7.5, [0.2, -0.3, 0.2], 60, 8) },
    {
      to: { urachus: 1, ligament: 1 },
      run: [0.05, 0.6],
      cam: SIDE(8.5, [0, 0.7, 1.0], 80, 6),
      glide: 0.05,
      dim: ['erdiko-zilbor-lotailua', 'gernu-maskuria'],
      names: [
        { id: 'erdiko-zilbor-lotailua', sub: 'urakotik (alantoidetik): erpinetik zilborrera' },
        { id: 'gernu-maskuria', small: true },
      ],
      note: 'Urakoa gernu maskuriaren erpinetik zilborrera: hortik erdiko zilbor-lotailua, gernu maskuria eusten duena',
    },
  ],
};
export const BladderSide15 = poseStage(spec13side, (p, o) => pelvisModel(p, o));

const BACK = (dist = 8, yaw = 180, elev = 6, target: [number, number, number] = [0, 0, 0]) => orbit(yaw, elev, dist, target, SH);

const spec13back: StageSpec<TrigonePose, TrigoneOpts> = {
  S: S13,
  pose: TP0,
  opts: {},
  caption: 'Gernu maskuria atzetik (3D eredua): enbrioiaren ezkerra zure ezkerrean',
  key: [
    { color: UC.endo, text: 'endodermoa' },
    { color: UC.wolff, text: 'hodi mesonefrikoa, trigonoa' },
    { color: UC.bud, text: 'ureterra' },
  ],
  steps: [
    { cam: BACK(9) },
    { cam: BACK(9) },
    {
      to: { absorb: 1, part: 1 },
      run: [0.05, 0.85],
      cam: BACK(8, 180, 8, [0, 0, -0.2]),
      glide: 0.06,
      dim: ['ureterra', 'hodi-mesonefrikoa', 'gernu-maskuria'],
      names: [
        { id: 'ureterra', sub: 'atzeko hormarekin fusionatu: gorago' },
        { id: 'hodi-mesonefrikoa', sub: 'beherago', from: 0.4 },
        { id: 'gernu-maskuria', small: true },
      ],
      note: 'Askatzean ureterra gernu maskuriaren atzeko hormarekin fusionatzen da, gorago (gernua zuzenean botatzeko); hodi mesonefrikoa beherago',
    },
    {
      to: { trigone: 1 },
      run: [0.08, 0.6],
      cam: BACK(6.5, 180, 6, [0, -0.35, -0.3]),
      glide: 0.05,
      dim: ['trigonoa', 'ureterra', 'hodi-mesonefrikoa'],
      names: [
        { id: 'trigonoa', sub: 'hirukia: mesodermikoa (hodi mesonefrikoetatik)', from: 0.2 },
        { id: 'ureterra', small: true },
        { id: 'hodi-mesonefrikoa', small: true },
      ],
      note: 'Hodien askapenagatik (bata gora, bestea behera), atzeko horman hiruki bat: trigonoa (morez), mesodermikoa. Gainerako epitelioa endodermikoa',
    },
    {
      to: { cover: 1 },
      run: [0.08, 0.7],
      cam: BACK(6.5, 168, 8, [0, -0.35, -0.3]),
      glide: 0.05,
      dim: ['trigonoa', 'ureterra'],
      names: [
        { id: 'trigonoa', sub: 'endodermoz estalia · aztarna geratzen da' },
        { id: 'ureterra', text: 'Ureter zuloak', sub: 'trigonoaren goiko muga (sondak)', p: 'ureter-zuloa', key: 'zuloak', from: 0.4 },
      ],
      note: 'Zelula mesodermikoak endekatu eta endodermikoek ordezkatzen dituzte: helduetan epitelio osoa endodermikoa, baina hirukiaren aztarna geratzen da',
    },
    { cam: BACK(8.5, 180, 10, [0, 0.5, 0]), names: [{ id: 'urakoa', small: true }] },
  ],
};
export const BladderBack15 = poseStage(spec13back, (p, o) => trigoneModel(p, o));

// ———————————————————————————— 14. Uretra ————————————————————————————

export const S14 = [0, 0.2, 0.4, 0.6, 0.8] as const;
// From where stage 13 ended (the kidney, the ureter and the duct fade out first: this stage is the urethra).
const P14: PelvisPose = endPose(spec13side).pose;

const spec14: StageSpec<PelvisPose, PelvisOpts> = {
  S: S14,
  pose: P14,
  opts: {},
  caption: CAP_SIDE,
  key: KEY_S,
  keyTitle: 'Kolorea = jatorria',
  steps: [
    {
      to: { ducts: 0 },
      run: [0.02, 0.45],
      cam: SIDE(7.5, [0, -0.6, 0.6]),
      glide: 0.06,
      dim: ['atal-pelbianoa', 'gernu-maskuria'],
      names: [
        { id: 'gernu-maskuria', sub: 'trenkadaren aurreko lehen zabalgunea' },
        { id: 'atal-pelbianoa', sub: 'hemendik uretra', from: 0.35 },
      ],
      note: 'Gernu maskuriaren ostean hodia estutu egiten da: atal pelbianoa. Hortik sortzen da uretra, emakumeetan askoz laburragoa',
    },
    {
      to: { female: 1, glands: 1 },
      run: [0.06, 0.8],
      cam: SIDE(6.5, [0, -0.9, 0.7], 96, 4),
      glide: 0.05,
      dim: ['uretra', 'uretra-guruinak', 'baginaren-bestibulua', 'mintzezko-uretra'],
      names: [
        { id: 'mintzezko-uretra', text: 'Uretra (emakumea)', sub: 'laburra: ~4 cm' },
        { id: 'uretra-guruinak', sub: '3. hilabetearen bukaeran', from: 0.4 },
        { id: 'baginaren-bestibulua', small: true, from: 0.6 },
      ],
      note: 'Emakumeetan uretra laburra (~4 cm): gernu maskuria eta bestibulua hurbil. 3. hilabetearen bukaeran, guruin uretralak eta parauretralak',
    },
    {
      cam: SIDE(5.5, [0, -1.3, 0.75], 84, 4),
      dim: ['baginaren-bestibulua', 'uretra'],
      names: [{ id: 'baginaren-bestibulua', sub: 'uretraren kanpoko zuloa hemen' }],
      note: 'Emakumeetan uretraren kanpoko zuloa sinu urogenitalera heltzen da: baginaren bestibuluan amaitzen da',
    },
    {
      to: { female: 0, male: 1 },
      run: [0.05, 0.85],
      cam: SIDE(9, [0, -1.0, 1.0], 90, 4),
      glide: 0.05,
      dim: ['uretra-prostatikoa', 'mintzezko-uretra', 'zakil-uretra', 'prostata'],
      names: [
        { id: 'uretra-prostatikoa', sub: 'prostata guruina', from: 0.3 },
        { id: 'mintzezko-uretra', from: 0.4 },
        { id: 'zakil-uretra', sub: 'zatirik luzeena', from: 0.5 },
        { id: 'prostata', sub: '3. hilabetearen bukaeran', from: 0.65 },
      ],
      note: 'Gizonetan uretra zakilean sartu eta luzatzen da: prostatikoa (prostata), mintzezkoa eta zakil uretra (luzeena)',
    },
    {
      cam: SIDE(6.5, [0, -2.0, 2.0], 80, 6),
      glide: 0.05,
      dim: ['zakil-uretra', 'glandea', 'zakila'],
      names: [
        { id: 'zakil-uretra', sub: 'ez da muturrera heltzen' },
        { id: 'glandea', sub: 'kanpoko zulo berri bat behar', from: 0.3 },
      ],
      note: 'Zakil uretra ez da muturrera heltzen: kanpoko zulo berri bat eratu behar zaio gernua kanporatzeko (hurrengo etapa)',
    },
  ],
};
export const Urethra15 = poseStage(spec14, (p, o) => pelvisModel(p, o));

// ———————————————————————————— 15. Zakil uretra: glandea ————————————————————————————

export const S15 = [0, 0.2, 0.4, 0.6, 0.8] as const;
const GCAM = (dist = 7.5, yaw = 0, elev = 4, target: [number, number, number] = [1.0, 0, 0]) => orbit(yaw, elev, dist, target, SH);

const spec15: StageSpec<GlansPose, GlansOpts> = {
  where: { th: -1.75, at: [0.6, -2.6, 0.6], frame: 'perineum', scale: 3, planes: [{ center: [0.6, 0, 0.2], a: [2.2, 0, 0], b: [0, 2.2, 0] }], note: 'Kanpo genitalak: enbrioiaren behealdea, behetik eta aurretik ikusita' },
  S: S15,
  pose: GP0,
  opts: {},
  caption: 'Zakilaren muturra erdibituta (3D eredua): muturra zure eskuinean',
  key: [
    { color: T.endo, text: 'endodermoa' },
    { color: T.ecto, text: 'ektodermoa' },
    { color: '#f0a1b4', text: 'mesodermoa' },
  ],
  keyTitle: 'Kolorea = jatorria',
  axes: {
    up: 'gora',
    front: 'zugana',
    side: 'muturra',
    sideDir: [1, 0, 0],
    edges: { up: 'Gora', down: 'Behera', front: 'Zugana', back: 'Atzera', side: 'Muturra', otherSide: 'Oinarria' },
  },
  steps: [
    {
      cam: GCAM(8, 0, 4, [0.6, 0, 0]),
      glide: 0.06,
      dim: ['glandea', 'ildo-koronarioa', 'zakil-uretra'],
      names: [
        { id: 'glandea', sub: 'zakilaren muturra' },
        { id: 'zakila', small: true },
        { id: 'ildo-koronarioa', sub: 'gorputzaren eta glandearen artean', from: 0.3 },
        { id: 'zakil-uretra', sub: 'ildo koronarioraino: zulorik ez', from: 0.5 },
      ],
      note: 'Zakilaren muturrean glandea; haren eta gorputzaren artean ildo koronarioa. Uretra ildo koronarioraino bakarrik: ez du kanporatzeko zulorik',
    },
    {
      to: { cord: 1 },
      run: [0.08, 0.85],
      cam: GCAM(6.8, 6, 6, [1.7, 0, 0]),
      glide: 0.05,
      dim: ['kordoi-ektodermikoa', 'zakil-uretra'],
      names: [
        { id: 'kordoi-ektodermikoa', sub: 'glandearen muturretik barnerantz', from: 0.2 },
        { id: 'zakil-uretra', small: true },
      ],
      note: 'Glandearen muturrean, geruza ektodermikotik kordoi (trenkada) bat barnerantz sartzen da, uretrarekin kontaktatu arte',
    },
    {
      to: { hollow: 1, join: 1 },
      run: [0.06, 0.85],
      cam: GCAM(6.2, 10, 6, [1.9, 0, 0]),
      glide: 0.05,
      dim: ['kanpoko-uretra-zuloa', 'kordoi-ektodermikoa', 'zakil-uretra'],
      names: [
        { id: 'kordoi-ektodermikoa', text: 'Kordoia hustu → hodia' },
        { id: 'kanpoko-uretra-zuloa', sub: 'kordoiaren muturrean', from: 0.4 },
        { id: 'zakil-uretra', sub: 'kordoiarekin fusionatu', small: true, from: 0.6 },
      ],
      note: 'Kordoia hustu eta hodi bihurtzen da; muturrean kanpoko uretra-zuloa. Uretra kordoiaren barneko muturrarekin fusionatzen da',
    },
    {
      to: { fossa: 1 },
      run: [0.06, 0.7],
      cam: GCAM(6.2, 0, 4, [1.9, 0, 0]),
      glide: 0.05,
      dim: ['hobi-nabikularra', 'kanpoko-uretra-zuloa', 'zakil-uretra'],
      names: [
        { id: 'hobi-nabikularra', sub: 'ektodermoko hodia zabalduta' },
        { id: 'kanpoko-uretra-zuloa', small: true },
      ],
      note: 'Ektodermoko hodia zabaldu: hobi nabikularra. Uretra hobira isurtzen da: kanpoko atala ektodermikoa (endodermoko hodi ia guztietan bezala)',
    },
    {
      to: { prep: 1, prepOpen: 1 },
      run: [0.06, 0.85],
      cam: GCAM(7, 20, 10, [1.8, 0, 0]),
      glide: 0.05,
      dim: ['prepuzioa', 'glandea', 'zakil-uretra', 'hobi-nabikularra'],
      names: [{ id: 'prepuzioa', sub: 'alboko trenkadak → xixkuak → ireki', from: 0.3 }],
      note: 'Glandea inguratzen duen larruazalean alboko trenkadak sartu eta ireki (xixkuak) egiten dira: glandea prepuzioak babestuta',
    },
  ],
};
export const Glans15 = poseStage(spec15, (p, o) => glansModel(p, o));
