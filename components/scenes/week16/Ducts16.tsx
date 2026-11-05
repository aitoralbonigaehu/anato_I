'use client';

import { FRONT16, KEY16, endPose, poseStage, type StageSpec } from './common';
import { DP0, ductModel, type DuctOpts, type DuctPose } from './duct-model';

/**
 * Topic 16's genital ducts seen from the front (duct-model.ts): the testis's hilum and the adult arrangement
 * (stage 6), the male ducts (7), the semen's way (8), the female ducts and ligaments (10), the vagina (11, 13),
 * the adult uterus's ligaments (12, a second view) and the female descent (14, 16).
 */

const build = (pose: DuctPose, opts: DuctOpts) => ductModel(pose, opts);
const CAP = 'Hodi genitalak aurretik (3D eredua): enbrioiaren ezkerra zure eskuinean';
const MALE_END: DuctPose = { ...DP0, male: 1, efferent: 1, epididymis: 1, vesicle: 1, prostate: 1 };
const FEMALE0: DuctPose = { ...DP0 };
const CAM = (dist = 10.5, target: [number, number, number] = [0, -0.5, 0], yaw = 0, elev = 6) => FRONT16(dist, target, yaw, elev);
/** The embryo's left half (its gonad and ducts) close up. */
const LEFTSIDE = (dist = 7, target: [number, number, number] = [1.4, 0.6, 0], yaw = 18, elev = 8) => FRONT16(dist, target, yaw, elev);

// ———————————————————————————— 6. Barrabilaren hiloa ————————————————————————————

export const S6 = [0, 0.5] as const;

const spec6: StageSpec<DuctPose, DuctOpts> = {
  S: S6,
  pose: MALE_END,
  opts: {},
  caption: CAP,
  key: KEY16.ducts,
  steps: [
    {
      cam: LEFTSIDE(7, [1.05, 0.9, 0], 24, 8),
      glide: 0.06,
      dim: ['barrabila', 'hodixka-eferenteak', 'epididimoa'],
      names: [
        { id: 'barrabila', text: 'Barrabilaren hiloa', sub: 'hemendik espermatozoideak irten' },
        { id: 'hodixka-eferenteak', small: true, from: 0.4 },
      ],
      note: 'Hiloa: egitura askoren atal finagoa (lepoa), hortik arteriak, nerbioak eta linfa hodiak sartu eta zainak irteten dira. Barrabilean ez da hain estua: espermatozoideak irteten dira',
    },
    {
      cam: CAM(11.5, [0, -1.0, 0], -10, 8),
      glide: 0.06,
      dim: ['semen-xixkua', 'hodi-deferentea', 'prostata', 'uretra-prostatikoa'],
      names: [
        { id: 'semen-xixkua' },
        { id: 'hodi-deferentea', from: 0.2 },
        { id: 'prostata', from: 0.4 },
      ],
      note: 'Semen xixkuak eta hodi deferenteak batera isurtzen dute prostataren bidez uretrara: hortik likido seminala kanpora',
    },
  ],
};
export const Hilum16 = poseStage(spec6, build);

// ———————————————————————————— 7. Hodi genitalak: arrak ————————————————————————————

export const S7 = [0, 0.17, 0.34, 0.5, 0.67, 0.83] as const;

const spec7: StageSpec<DuctPose, DuctOpts> = {
  S: S7,
  pose: DP0,
  opts: {},
  caption: CAP,
  key: KEY16.ducts,
  steps: [
    {
      to: { male: 1 },
      run: [0.1, 0.9],
      cam: CAM(12.5, [0, -0.2, 0]),
      glide: 0.06,
      dim: ['barrabila', 'hodi-paramesonefrikoa', 'hodi-mesonefrikoa'],
      names: [
        { id: 'barrabila', sub: '8. astea: testosterona + AMH' },
        { id: 'hodi-paramesonefrikoa', sub: 'endekatzen', from: 0.3 },
        { id: 'hodi-mesonefrikoa', sub: 'hodi genitalak', from: 0.5 },
      ],
      note: '8. astean: Leydig zelulek testosterona, Sertoli zelulek hormona antimüllerianoa. Paramesonefrikoak endekatu; mesonefrikotik hodi genitalak',
    },
    {
      to: { efferent: 1 },
      run: [0.08, 0.8],
      cam: LEFTSIDE(6.5, [1.45, 1.0, 0], 24, 8),
      glide: 0.05,
      dim: ['hodixka-eferenteak', 'barrabila'],
      names: [{ id: 'hodixka-eferenteak', text: 'Hodixka epigenitalak → eferenteak', sub: 'barrabil parean; rete testisaren bidez', from: 0.2 }],
      note: 'Barrabil pareko hodixka mesonefrikoak (epigenitalak) barrabil sarearen bidez barrabil kordoiekin lotu: hodixka eferenteak',
    },
    {
      cam: LEFTSIDE(6, [1.5, 0.45, 0], 30, 8),
      dim: ['paradidimoa'],
      names: [{ id: 'paradidimoa', text: 'Hodixka paragenitalak → paradidimoa', sub: 'beherago; endekatu: aztarna', from: 0.2 }],
      note: 'Beherago dauden hodixka paragenitalak ez dira rete testisarekin lotzen: endekatu eta aztarna txiki bat uzten dute, paradidimoa (funtzio handirik gabe)',
    },
    {
      to: { epididymis: 1 },
      run: [0.06, 0.85],
      cam: LEFTSIDE(6.5, [1.5, 0.7, 0], 34, 8),
      glide: 0.05,
      dim: ['epididimoa', 'hodixka-eferenteak'],
      names: [{ id: 'epididimoa', sub: 'hodi mesonefrikoa, oso bihurria: espermatozoideak heltzen', from: 0.25 }],
      note: 'Hodixka eferenteen azpian hodi mesonefrikoa epididimoa bihurtzen da: hodi oso bihurria, espermatozoideak heltzen diren lekua',
    },
    {
      to: { prostate: 1 },
      run: [0.1, 0.6],
      cam: CAM(10.5, [0.6, -0.6, 0], 14, 6),
      glide: 0.05,
      dim: ['hodi-deferentea', 'uretra-prostatikoa'],
      names: [
        { id: 'hodi-deferentea', sub: 'luzea eta zuzena → uretra prostatikoa' },
        { id: 'uretra-prostatikoa', small: true, from: 0.4 },
      ],
      note: 'Epididimoaren jarraian hodi deferentea, luzea eta zuzena, hodi mesonefrikotik: prostata barneko uretran amaitzen da',
    },
    {
      to: { vesicle: 1 },
      run: [0.06, 0.8],
      cam: CAM(7.5, [0, -1.85, 0], 8, 8),
      glide: 0.05,
      dim: ['semen-xixkua', 'hodi-isurlea', 'prostata', 'uretra-prostatikoa'],
      names: [
        { id: 'semen-xixkua', sub: 'deferentearen kimua · bikoitza', from: 0.15 },
        { id: 'hodi-isurlea', sub: 'deferentea + xixkua', from: 0.4 },
        { id: 'uretra-prostatikoa', small: true, from: 0.6 },
      ],
      note: 'Prostatara iritsi aurretik beste kimu bat: semen xixkua (bikoitza). Deferentea + xixkua = hodi isurlea, uretra prostatikoan irekita',
    },
  ],
};
export const MaleDucts16 = poseStage(spec7, build);

// ———————————————————————————— 8. Semen bidea ————————————————————————————

export const S8 = [0, 0.25, 0.5, 0.75] as const;

const spec8: StageSpec<DuctPose, DuctOpts> = {
  S: S8,
  pose: endPose(spec7).pose,
  opts: {},
  caption: CAP,
  key: KEY16.ducts,
  steps: [
    {
      to: { semen: 1 },
      run: [0.02, 0.98],
      cam: CAM(12, [0.5, -0.35, 0], 12, 6),
      glide: 0.06,
      dim: ['hodixka-seminiferoak', 'barrabila', 'hodixka-eferenteak', 'epididimoa', 'hodi-deferentea', 'uretra-prostatikoa'],
      names: [
        { id: 'barrabila', sub: 'tubulu seminiferoak → sarea' },
        { id: 'hodixka-eferenteak', small: true },
        { id: 'epididimoa', small: true },
        { id: 'hodi-deferentea', small: true },
        { id: 'uretra-prostatikoa', small: true },
      ],
      note: 'Semen bidea: tubulu seminiferoak → barrabil sarea → hodixka eferenteak → epididimoa (metatu) → hodi deferentea → uretra',
    },
    {
      cam: CAM(11.5, [0.5, -0.3, 0], 18, 8),
      glide: 0.05,
      dim: ['barrabil-apendizea', 'prostataren-utrikulua'],
      names: [
        { id: 'barrabil-apendizea', sub: 'goian · funtziorik gabe (laranja)' },
        { id: 'prostataren-utrikulua', sub: 'prostatan, zaku itsua', from: 0.35 },
      ],
      note: 'Hodi paramesonefrikoaren bi aztarna (laranjaz): barrabil apendizea (goian) eta prostataren utrikulua (zaku itsua, bi semen bideen artean)',
    },
    {
      cam: CAM(10.5, [0.6, -0.2, 0], 26, 8),
      glide: 0.05,
      dim: ['barrabila', 'epididimoa', 'hodi-deferentea'],
      names: [
        { id: 'epididimoa', sub: 'barrabilaren gainean' },
        { id: 'hodi-deferentea', sub: 'iztai hoditik barrunbe pelbikora', from: 0.3 },
      ],
      note: 'Helduetan barrabilak eskrotoan, epididimoa gainean. Hodi deferentea iztai hoditik (kordoi sexuala) barrunbe pelbikora doa',
    },
    {
      cam: CAM(8, [0, -1.7, 0.2], -8, 6),
      glide: 0.05,
      dim: ['gernu-maskuria', 'semen-xixkua', 'hodi-isurlea', 'uretra-prostatikoa', 'prostata'],
      names: [
        { id: 'gernu-maskuria', sub: 'prostataren gainean' },
        { id: 'semen-xixkua', sub: 'atzeko horman (bi)', from: 0.2 },
        { id: 'hodi-isurlea', small: true, from: 0.4 },
        { id: 'uretra', sub: 'mintzezkoa → zakila → kanpoko zuloa', from: 0.6 },
      ],
      note: 'Gernu maskuria prostataren gainean, semen xixkuak haren atzean. Hodi isurletik uretra prostatikora, mintzezkora, zakilera eta kanpoko uretra-zulora',
    },
  ],
};
export const Semen16 = poseStage(spec8, build);

// ———————————————————————————— 10. Hodi genitalak: emeak ————————————————————————————

export const S10 = [0, 0.14, 0.28, 0.42, 0.56, 0.7, 0.85] as const;

const spec10: StageSpec<DuctPose, DuctOpts> = {
  S: S10,
  pose: FEMALE0,
  opts: {},
  caption: CAP,
  key: KEY16.ducts,
  steps: [
    { cam: CAM(12.5, [0, -0.2, 0]) },
    {
      to: { female: 1 },
      run: [0.08, 0.9],
      cam: CAM(12.5, [0, -0.2, 0]),
      glide: 0.06,
      dim: ['hodi-mesonefrikoa', 'hodi-paramesonefrikoa', 'falopioren-tronpak', 'obarioa'],
      names: [
        { id: 'hodi-mesonefrikoa', sub: 'endekatzen (testosteronarik ez)' },
        { id: 'falopioren-tronpak', text: 'Hodi paramesonefrikoak', sub: 'mantendu (karenaren estrogenoak)', from: 0.3 },
        { id: 'obarioa', small: true, from: 0.5 },
      ],
      note: 'Emeetan ez dago testosteronarik (Leydig gabe); karenak estrogenoak. Hodi mesonefrikoa endekatu; paramesonefrikoak mantendu: tronpak, uteroa, baginaren lehen zatia',
    },
    {
      to: { fuse: 1 },
      run: [0.08, 0.85],
      cam: CAM(8.5, [0, -1.0, 0], 8, 6),
      glide: 0.05,
      dim: ['utero-hodia', 'uteroa'],
      names: [{ id: 'utero-hodia', sub: 'trenkada galdu: hodi bakarra', from: 0.25 }],
      note: 'Beherantz eta erdialderantz luzatzen dira eta erraboil sinubaginalean amaitzen. Hasieran trenkadatuta; trenkada galdu: utero hodia',
    },
    {
      cam: CAM(10.5, [0, -0.15, 0], -10, 8),
      glide: 0.05,
      dim: ['uteroa', 'falopioren-tronpak'],
      names: [
        { id: 'uteroa', sub: 'gorputza eta lepoa · endometrioa Müllerretik' },
        { id: 'falopioren-tronpak', sub: 'goian irekita (obozitoa hartzeko)', from: 0.3 },
      ],
      note: 'Hodi paramesonefrikoetatik uteroa (gorputza eta lepoa) eta tronpak (goian irekita). Endometrioa hodietatik; miometrioa eta perimetrioa inguruko mesenkimatik',
    },
    {
      cam: LEFTSIDE(6.5, [1.4, 0.8, 0], 24, 8),
      glide: 0.06,
      dim: ['epooforoa', 'paraooforoa', 'obarioa'],
      names: [
        { id: 'epooforoa', sub: 'hodi mesonefrikoaren aztarna' },
        { id: 'paraooforoa', sub: 'aztarna (mesoobarioan)', from: 0.3 },
      ],
      note: 'Hodi mesonefrikoaren aztarnak (ez funtzionalak), mesoobarioan: epooforoa eta paraooforoa. Mesoak: mesoobarioa, mesosalpinx, mesometrioa',
    },
    {
      to: { ligaments: 1 },
      run: [0.06, 0.8],
      cam: CAM(11.5, [0.6, -0.4, 0.1], 16, 8),
      glide: 0.05,
      dim: ['obarioaren-euspen-lotailua', 'lotailu-utero-obarikoa', 'uteroaren-lotailu-biribila'],
      names: [
        { id: 'obarioaren-euspen-lotailua', sub: '1. paretara', from: 0.15 },
        { id: 'lotailu-utero-obarikoa', sub: '2. uteroa ↔ obarioa', from: 0.35 },
        { id: 'uteroaren-lotailu-biribila', sub: '3. uteroa → paretara (larruazaleraino)', from: 0.55 },
      ],
      note: 'Mesonefrosa endekatzean lotailuak; emeetan hiru: obarioaren euspen lotailua (paretara), lotailu utero-obarikoa, lotailu biribila (larruazaleraino)',
    },
    {
      cam: CAM(11.5, [0, -0.25, 0], 0, 6),
      glide: 0.05,
      dim: ['falopioren-tronpak', 'uteroa'],
      names: [
        { id: 'falopioren-tronpak', sub: 'alde bakoitzean bat' },
        { id: 'uteroa', sub: 'erdian: hodiak elkartu diren tokian' },
      ],
      note: 'Laburbilduz: tronpa bat alde bakoitzean, eta erdian, hodi paramesonefrikoak elkartu diren tokian, uteroaren gorputza',
    },
  ],
};
export const FemaleDucts16 = poseStage(spec10, build);

// ———————————————————————————— 11. Bagina (3.4) ————————————————————————————

export const S11 = [0, 0.25, 0.5, 0.75] as const;
const F_END = endPose(spec10).pose;
/** The uterus and the vagina (the camera's height: `y`). */
const VCAM = (dist = 7, yaw = 10, elev = 6, y = -2.0) => CAM(dist, [0, y, 0.1], yaw, elev);

const spec11: StageSpec<DuctPose, DuctOpts> = {
  S: S11,
  pose: F_END,
  opts: {},
  caption: CAP,
  key: KEY16.vagina,
  keyTitle: 'Kolorea = jatorria',
  steps: [
    {
      to: { bulbs: 1 },
      run: [0.08, 0.7],
      cam: VCAM(8.5, 8, 6, -1.75),
      glide: 0.06,
      dim: ['utero-hodia', 'bulbo-sinubaginalak', 'sinu-urogenitala'],
      names: [
        { id: 'utero-hodia', text: 'Utero hodia (hodi genitala)' },
        { id: 'bulbo-sinubaginalak', text: 'Erraboil sinubaginala', sub: 'sinuaren atzekaldean · 9. astean bakuolizatu', from: 0.3 },
      ],
      note: 'Hodi paramesonefrikoak sinu urogenitalaren atzekaldean, erraboil sinubaginalean, kontaktuan: utero hodia. 9. astean erraboila bakuolizatzen hasten da',
    },
    {
      to: { plate: 1, lumen: 1 },
      run: [0.06, 0.85],
      cam: VCAM(8, 14, 6, -1.9),
      glide: 0.05,
      dim: ['bagina', 'plaka-baginala', 'uteroa'],
      names: [{ id: 'bagina', sub: '20. astea: hodi genitala + erraboila fusionatu', from: 0.35 }],
      note: '20. astean hodi genitala eta erraboila fusionatzen dira: uteroaren behealdean bagina; bagina eta uteroa komunikatuta',
    },
    {
      cam: VCAM(7, 22, 8, -2.15),
      glide: 0.05,
      dim: ['bagina', 'baginaren-fornixa'],
      names: [
        { id: 'baginaren-fornixa', text: 'Goiko herena', sub: 'Müllerretik: mesodermikoa' },
        { id: 'bagina', text: 'Beheko bi herenak', sub: 'erraboil sinubaginaletik: endodermikoa', from: 0.3 },
      ],
      note: 'Baginaren goiko herena hodi paramesonefrikoetatik (mesodermikoa); beheko bi herenak erraboil sinubaginaletik (endodermikoa)',
    },
    {
      to: { hymen: 1 },
      run: [0.08, 0.6],
      cam: VCAM(6.5, 6, 4, -2.45),
      glide: 0.05,
      dim: ['himena', 'bagina'],
      names: [{ id: 'himena', sub: 'kanpoko zuloan · aro perinatalean zulatu', from: 0.2 }],
      note: 'Baginaren kanpoko zuloan mintz bat: himena. Jaiotza inguruan zulatzen da (ez bada, anomalia). Zulatzea ≠ apurtzea; lehen hilerokorako zulatuta egon behar du',
    },
  ],
};
export const Vagina16 = poseStage(spec11, build);

// ———————————————————————————— 12. Lotailuak (umetoki heldua, bigarren ikuspegia) ————————————————————————————

export const S12 = [0, 0.2, 0.4, 0.6, 0.8] as const;
const V_END = endPose(spec11).pose;

/** The adult uterus from behind (the ovaries behind the broad ligament): this view's only camera. */
const BACK = CAM(10, [0.4, -0.4, 0], 180 - 12, 8);

const spec12d: StageSpec<DuctPose, DuctOpts> = {
  S: S12,
  pose: { ...V_END, ligaments: 1 },
  opts: {},
  caption: 'Hodi genitalak atzetik (3D eredua): enbrioiaren ezkerra zure ezkerrean',
  key: KEY16.female,
  steps: [
    { cam: BACK },
    { cam: BACK },
    { cam: BACK },
    { cam: BACK },
    {
      to: { broad: 1 },
      run: [0.04, 0.5],
      cam: BACK,
      dim: ['lotailu-zabala', 'obarioaren-euspen-lotailua', 'lotailu-utero-obarikoa', 'obarioa'],
      names: [
        { id: 'lotailu-zabala', sub: 'hodien mesotik' },
        { id: 'obarioaren-euspen-lotailua', text: 'Esekitze lotailua', sub: 'obulutegitik gora', from: 0.2 },
        { id: 'lotailu-utero-obarikoa', text: 'Berariazko lotailua', sub: 'obulutegia ↔ umetokia', from: 0.35 },
        { id: 'obarioa', sub: 'lotailu zabalaren atzean', from: 0.5 },
      ],
      note: 'Atzetik ikusita (obulutegiak lotailu zabalaren atzean): lotailu zabala, mesoobarioa, esekitze lotailua eta berariazko lotailua',
    },
  ],
};
export const BroadDucts16 = poseStage(spec12d, build);

// ———————————————————————————— 13. Baginaren jatorria (3.4.1) ————————————————————————————

export const S13 = [0, 0.25, 0.5, 0.75] as const;

const spec13: StageSpec<DuctPose, DuctOpts> = {
  S: S13,
  pose: { ...F_END },
  opts: {},
  caption: CAP,
  key: KEY16.vagina,
  keyTitle: 'Kolorea = jatorria',
  steps: [
    {
      cam: VCAM(8.5, 8, 6, -1.75),
      glide: 0.06,
      dim: ['utero-hodia', 'sinu-urogenitala'],
      names: [
        { id: 'utero-hodia', sub: 'mesodermikoa (Müller ← bitarteko mesodermoa)' },
        { id: 'sinu-urogenitala', sub: 'endodermikoa', from: 0.3 },
      ],
      note: 'Uteroa kanpoarekin baginaren bidez. Baginaren jatorria bikoitza: mesodermikoa (hodi paramesonefrikoak) eta endodermikoa (sinu urogenitala)',
    },
    {
      to: { bulbs: 1 },
      run: [0.08, 0.7],
      cam: VCAM(6.5, 12, 6, -2.05),
      glide: 0.05,
      dim: ['bulbo-sinubaginalak', 'utero-hodia'],
      names: [{ id: 'bulbo-sinubaginalak', sub: 'zati pelbianoaren atzean: bi goragune', from: 0.25 }],
      note: 'Utero hodia sinuaren zati pelbianoaren atzeko aldearekin kontaktuan: bi goragune, bulbo sinubaginalak',
    },
    {
      to: { plate: 1, lumen: 1 },
      run: [0.06, 0.9],
      cam: VCAM(7.5, 16, 6, -2.3),
      glide: 0.05,
      dim: ['plaka-baginala', 'bagina'],
      names: [
        { id: 'plaka-baginala', sub: 'kaudalerantz hazi; uteroa urrundu', from: 0.2 },
        { id: 'bagina', sub: '5. hilabetea: lumena osoa', from: 0.6 },
      ],
      note: 'Bulboak kaudalerantz hazi: plaka baginala; zefalikorantz hazten denez, uteroa sinutik urruntzen da. 5. hilabetean baginaren argia osatuta',
    },
    {
      to: { hymen: 1 },
      run: [0.06, 0.6],
      cam: VCAM(7, 24, 8, -2.4),
      glide: 0.05,
      dim: ['baginaren-fornixa', 'bagina', 'himena'],
      names: [
        { id: 'baginaren-fornixa', text: 'Baginaren fornixa', sub: 'mesodermikoa (uteroaren jatorri bera)' },
        { id: 'bagina', text: 'Gainerakoa', sub: 'endodermikoa (sinutik)', from: 0.25 },
        { id: 'himena', sub: 'sinuaren epitelioa + zelula baginalak', from: 0.5 },
      ],
      note: 'Fornixa: umetokiaren barrunbearekin kontaktuan, mesodermikoa. Gainerako atal kaudala: endodermikoa. Himena: sinuaren epitelio zelulak eta zelula baginalak',
    },
  ],
};
export const VaginaOrigin16 = poseStage(spec13, build);

// ———————————————————————————— 14 (bigarren ikuspegia) eta 16. Emeen jaisketa ————————————————————————————

export const S14 = [0, 0.25, 0.5, 0.75] as const;

const spec14f: StageSpec<DuctPose, DuctOpts> = {
  S: S14,
  pose: { ...F_END, ligaments: 0 },
  opts: {},
  caption: CAP,
  key: KEY16.female.slice(0, 3),
  steps: [
    { cam: CAM(10.5, [0.5, -0.3, 0], 30, 8) },
    { cam: CAM(10.5, [0.5, -0.3, 0], 30, 8) },
    { cam: CAM(10.5, [0.5, -0.3, 0], 30, 8) },
    {
      to: { ovDown: 1 },
      run: [0.08, 0.85],
      cam: CAM(10.5, [0.5, -0.3, 0], 30, 8),
      dim: ['obarioa', 'falopioren-tronpak'],
      names: [
        { id: 'obarioa', sub: 'atzeko paretatik pelbisera' },
        { id: 'falopioren-tronpak', text: 'Hodi paramesonefrikoak', sub: 'obulutegiak arrastatzen', from: 0.3 },
      ],
      note: 'Hodi paramesonefrikoek obulutegiak arrastatzen dituzte: atzeko paretatik pelbisera, giltzurrunen kontrako bidean; hodien aurretik egotetik atzean egotera',
    },
  ],
};
export const OvaryDown16 = poseStage(spec14f, build);

export const S16 = [0, 0.33, 0.66] as const;

const spec16: StageSpec<DuctPose, DuctOpts> = {
  S: S16,
  pose: { ...F_END, ligaments: 0, ovDown: 0.6 },
  opts: {},
  caption: CAP,
  key: KEY16.female,
  steps: [
    {
      to: { gub: 1, ovDown: 1 },
      run: [0.08, 0.8],
      cam: CAM(11.5, [0.6, -0.6, 0.1], 26, 8),
      glide: 0.06,
      dim: ['gubernakulua', 'obarioa'],
      names: [
        { id: 'obarioa', sub: 'abdomenetik pelbisera (bide motzagoa)' },
        { id: 'gubernakulua', sub: 'iztai hoditik → ezpain handien larruazala', from: 0.5 },
      ],
      note: 'Obulutegiek ere abdomenetik pelbisera. Gubernakulua iztai hoditik atera, pelbis hezurraren aurretik, ezpain handien larruazaleraino; ez da horrenbeste txikitzen',
    },
    {
      to: { gub: 0, ligaments: 1 },
      run: [0.06, 0.85],
      cam: CAM(11.5, [0.6, -0.6, 0.1], 18, 8),
      glide: 0.05,
      dim: ['lotailu-utero-obarikoa', 'uteroaren-lotailu-biribila', 'gubernakulua'],
      names: [
        { id: 'lotailu-utero-obarikoa', text: '«Obarioaren euspen lotailua»', sub: 'obariotik uterora (berariazkoa)', from: 0.25 },
        { id: 'uteroaren-lotailu-biribila', sub: 'uterotik ezpain nagusietara', from: 0.45 },
      ],
      note: 'KONTUZ: gubernakulua endekatu eta bi lotailu. Apunteek «obarioaren euspen lotailua: obariotik uterora» diote; hori lotailu utero-obarikoa da (euspen lotailua paretara doa)',
      warn: true,
    },
    {
      cam: CAM(9, [1.2, -1.8, 0.4], 30, 8),
      glide: 0.05,
      dim: ['uteroaren-lotailu-biribila'],
      names: [{ id: 'uteroaren-lotailu-biribila', sub: 'iztai hodia: hau bakarrik pasatzen da' }],
      note: 'Emeetan iztai hodia guztiz itxita eta txikiagoa: ez dira muskulu eta fasziak arrastatzen, lotailu biribila bakarrik pasatzen da',
    },
  ],
};
export const FemaleDescent16 = poseStage(spec16, build);
