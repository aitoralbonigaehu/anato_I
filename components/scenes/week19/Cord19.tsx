'use client';

import { BLOCK19, KEY19, endPose, poseStage19, type StageSpec } from './common';
import { CP0, cordModel, type CordOpts, type CordPose } from './cord-model';
import { SITE19 } from './sites';
import { C19, G19 } from './tones';

/**
 * Topic 19, sections 2 (roots, ganglion), 3 (meninges; grey and white matter) and 5 (the reflex arc), on one block of
 * the spinal cord at T6 (cord-model.ts). Seen from above (dorsal) and the cranial side, its cut face towards us.
 */

const CAP = 'Ornomuinaren blokea, T6 mailan zeharka moztuta (3D eredua): goian dortsala, mozketa goitik ikusita';
const build = (pose: CordPose, opts: CordOpts) => cordModel(pose, opts);
const FACE = (dist = 9.5, yaw = 16, elev = 24, x = 0) => BLOCK19(dist, [x, -0.1, 0.6], yaw, elev);
const SIDE = (dist = 11, x = 2.2) => BLOCK19(dist, [x, -0.3, 0.6], 22, 26);

// ———————————————————————— 5. Sustraiak eta gongoila (2) ————————————————————————

export const S_ROOTS = [0, 0.22, 0.46, 0.72] as const;
const specRoots: StageSpec<CordPose, CordOpts> = {
  S: S_ROOTS,
  pose: { ...CP0, roots: 0, rami: 0 },
  opts: {},
  site: SITE19.cord,
  arrive: 'Gorputzaren ornomuinera hurbildu gara, T6 mailan: zeharka moztuta',
  caption: CAP,
  key: [
    { color: C19.grey, text: 'gai grisa (somak)' },
    { color: C19.white, text: 'gai zuria (axoiak)' },
    { color: C19.nerve, text: 'sustraiak, nerbioa' },
  ],
  steps: [
    {
      cam: FACE(7, 10, 24),
      fit: false,
      glide: 0.06,
      dim: ['gai-grisa', 'gai-zuria'],
      names: [
        { id: 'gai-grisa', sub: 'barnean: somak' },
        { id: 'gai-zuria', sub: 'kanpoan: axoiak', from: 0.3 },
      ],
      note: 'Ornomuinean bi atal: barnean gai grisa (somak, gorputzak) eta kanpoan gai zuria (axoiak)',
    },
    {
      to: { roots: 1, rami: 1 },
      run: [0.05, 0.8],
      cam: SIDE(12.5, 2.4),
      fit: false,
      glide: 0.06,
      dim: ['atzeko-sustraia', 'aurreko-sustraia', 'nerbio-espinalak'],
      names: [
        { id: 'atzeko-sustraia', text: 'Atzeko sustraia', sub: 'dortsala', from: 0.3 },
        { id: 'aurreko-sustraia', text: 'Aurreko sustraia', sub: 'bentrala', from: 0.45 },
        { id: 'nerbio-espinalak', text: 'Nerbio espinala', from: 0.5 },
      ],
      note: 'Ornomuinetik bi sustrai: atzeko sustraia (dortsala) eta aurreko sustraia (bentrala)',
    },
    {
      to: { sens: 0.62 },
      run: [0.15, 0.85],
      cam: SIDE(9.5, 2.0),
      fit: false,
      glide: 0.06,
      dim: ['gongoil-errakideoak', 'neurona-sentsitiboa', 'atzeko-sustraia'],
      names: [
        { id: 'gongoil-errakideoak', text: 'Gongoila', sub: 'atzeko sustraian' },
        { id: 'neurona-sentsitiboa', text: 'Neurona sentsitiboaren soma', sub: 'bi adarkadura: kanpora eta ornomuinera', from: 0.5 },
      ],
      note: 'Atzeko sustraian gongoil bat: neurona sentsitiboaren soma beti hor dago; bi adarkadura ditu, bata ornomuinerantz eta bestea kanporantz',
    },
    {
      to: { sens: 1, tracts: 1, motor: 1 },
      run: [0.05, 0.9],
      cam: SIDE(12.5, 2.4),
      fit: false,
      glide: 0.06,
      dim: ['neurona-sentsitiboa', 'goranzko-bideak', 'beheranzko-bideak', 'motoneurona', 'muskulu-ildaskatuak'],
      names: [
        { id: 'goranzko-bideak', text: 'Gai zuritik gora', sub: 'burmuinera', from: 0.2 },
        { id: 'beheranzko-bideak', text: 'Kortexetik behera', sub: 'gai zuritik', from: 0.45 },
        { id: 'motoneurona', text: 'Neurona motorra', sub: 'aurreko sustraitik muskulura', from: 0.65 },
        { id: 'neurona-sentsitiboa', small: true, from: 0.1 },
      ],
      note: 'Estimulua gongoilera iritsi, ornomuinera sartu eta gai grisean sinapsia; gai zuritik burmuinera, eta kortexetik behera neurona motorrera eta muskulura',
    },
  ],
};
export const Roots19 = poseStage19(specRoots, build);

// ———————————————————————— 6. Meningeak (3) ————————————————————————

export const S_MEN = [0, 0.18, 0.4, 0.6, 0.8] as const;
const specMen: StageSpec<CordPose, CordOpts> = {
  S: S_MEN,
  pose: endPose(specRoots).pose,
  opts: {},
  site: SITE19.cord,
  arrive: 'Ornomuin bera: orain bere estalkiak',
  caption: CAP,
  key: KEY19.meninges,
  steps: [
    {
      to: { sens: 0, tracts: 0, motor: 0, dura: 1 },
      run: [0, 0.6],
      cam: FACE(10, 18, 26),
      fit: false,
      glide: 0.06,
      dim: ['dura-materra'],
      names: [
        { id: 'meningeak', text: 'Meningeak', sub: 'hiru mintz, kanpotik barnera; 5.–8. astean', from: 0.5 },
        { id: 'dura-materra', small: true, from: 0.6 },
      ],
      note: 'Nerbio sistema zentrala babesteko hiru mintz, meningeak, 25.–35. egunetan (5.–8. astean) eratzen dira',
    },
    {
      to: { bone: 1 },
      run: [0.05, 0.5],
      cam: FACE(11.5, 24, 28),
      fit: false,
      glide: 0.06,
      dim: ['dura-materra', 'ornoak', 'eremu-epidurala'],
      names: [
        { id: 'dura-materra', text: 'Dura materra', sub: 'kanpoan, gogorrena; mesodermikoa' },
        { id: 'eremu-epidurala', text: 'Eremu epidurala', sub: 'ez dago ornoei lotuta', from: 0.4 },
        { id: 'ornoak', small: true, from: 0.55 },
      ],
      note: 'Dura materra kanpoan dago eta gogorrena da. Garunean kraneoari itsatsita, baina ez ornoei: tartean eremu epidurala (garunean ez dago)',
    },
    {
      to: { arach: 1, csf: 1, pia: 1 },
      run: [0.05, 0.6],
      cam: FACE(9, 14, 24),
      fit: false,
      glide: 0.06,
      dim: ['araknoidesa', 'eremu-azpiaraknoideoa', 'likido-zefalorrakideoa'],
      names: [
        { id: 'araknoidesa', text: 'Araknoidesa', sub: 'tartekoa; armiarma sarea' },
        { id: 'eremu-azpiaraknoideoa', text: 'Eremu azpiaraknoideoa', sub: 'pia materraren artean', from: 0.4 },
        { id: 'pia-materra', small: true, from: 0.6 },
      ],
      note: 'Araknoidesa: tarteko mintza, fina, dura materretik oso hurbil. Haren eta pia materraren artean eremu azpiaraknoideoa',
      plainNote: 'Araknoidesa: tarteko mintza, dura materretik oso hurbil. Haren eta pia materraren artean eremu azpiaraknoideoa',
    },
    {
      to: { pia: 1 },
      run: [0.05, 0.5],
      cam: FACE(7.4, 10, 26),
      fit: false,
      glide: 0.06,
      dim: ['pia-materra'],
      names: [{ id: 'pia-materra', text: 'Pia materra', sub: 'barnekoena: ehunari lotuta' }],
      note: 'Pia materra: barnekoena, fina, beti ehunari (ornomuinari) lotuta, bai garunean bai ornomuinean',
      plainNote: 'Pia materra: barnekoena, beti ehunari (ornomuinari) lotuta, bai garunean bai ornomuinean',
    },
    {
      cam: FACE(10, 18, 26),
      fit: false,
      glide: 0.06,
      dim: ['meningeak'],
      names: [
        { id: 'dura-materra', text: 'Dura materra', sub: 'mesodermoa' },
        { id: 'araknoidesa', text: 'Araknoidesa', sub: 'gandor neurala', from: 0.25 },
        { id: 'pia-materra', text: 'Pia materra', sub: 'gandor neurala', from: 0.45 },
      ],
      note: 'Jatorria: dura materra mesodermikoa; araknoidesa eta pia materra gandor neuraletik',
    },
  ],
};
export const Meninges19 = poseStage19(specMen, build);

// ———————————————————————— 8. Gai grisa eta zuria (3) ————————————————————————

export const S_GREY = [0, 0.2, 0.4, 0.6, 0.8] as const;
const specGrey: StageSpec<CordPose, CordOpts> = {
  S: S_GREY,
  pose: { ...CP0, pia: 1 },
  opts: {},
  site: SITE19.cord,
  arrive: 'Burutik ornomuinera itzuli gara: bere barrura, mozketan',
  caption: CAP,
  key: KEY19.function,
  steps: [
    {
      to: { fn: 1 },
      run: [0.2, 0.8],
      cam: FACE(5.6, 6, 30),
      fit: false,
      glide: 0.08,
      dim: ['gai-grisa', 'aurreko-adarra', 'atzeko-adarra', 'hodi-ependimarioa'],
      names: [
        { id: 'aurreko-adarra', text: 'Aurreko adarrak', sub: 'neurona motorrak', from: 0.3 },
        { id: 'atzeko-adarra', text: 'Atzeko adarrak', sub: 'neurona sentsitiboak', from: 0.45 },
        { id: 'hodi-ependimarioa', text: 'Ependimoa', sub: 'erdian', small: true, from: 0.6 },
      ],
      note: 'Gai grisa erdian, ependimoaren inguruan: neuronen somak. H forma: aurreko adarretan neurona motorrak, atzekoetan sentsitiboak',
    },
    {
      to: { lat: 1 },
      run: [0.1, 0.5],
      cam: FACE(5.2, 8, 30),
      fit: false,
      glide: 0.05,
      dim: ['alboko-adarra'],
      names: [{ id: 'alboko-adarra', text: 'Alboko adarra', sub: 'T1–T12 (L2): sinpatikoak' }],
      note: 'T1etik T12ra (L2ra) alboko adarrak: neurona sinpatikoen somak, maila honetan bakarrik',
      warn: true,
    },
    {
      to: { tracts: 1 },
      run: [0.1, 0.6],
      cam: FACE(5.6, 6, 30),
      fit: false,
      glide: 0.05,
      dim: ['gai-zuria', 'goranzko-bideak', 'beheranzko-bideak'],
      names: [
        { id: 'gai-zuria', sub: 'axoiak, mielinizatuta' },
        { id: 'goranzko-bideak', text: 'Goranzko bideak', sub: 'sentsitiboak', from: 0.3 },
        { id: 'beheranzko-bideak', text: 'Beheranzko bideak', sub: 'motorrak', from: 0.45 },
      ],
      note: 'Kanpoan gai zuria: axoiak, mielinak ematen dio kolorea. Bertan goranzko (sentsitiboak) eta beheranzko (motorrak) bideak',
    },
    {
      to: { sens: 0.75 },
      run: [0.05, 0.9],
      cam: SIDE(12, 2.6),
      fit: false,
      glide: 0.08,
      dim: ['larruazala', 'neurona-sentsitiboa', 'gongoil-errakideoak'],
      names: [
        { id: 'larruazala', text: 'Larruazala', sub: 'sentsibilitate orokorra' },
        { id: 'neurona-sentsitiboa', text: 'Luzapen zentrifugoa eta zentripetoa', sub: 'soma gongoilean', from: 0.5 },
        { id: 'gongoil-errakideoak', small: true, from: 0.6 },
      ],
      note: 'Larruazaletik hartutako sentsazioa axoi batetik gongoileraino: hor somak. Bi luzapen: zentrifugoa periferiara, zentripetoa ornomuinera',
    },
    {
      to: { sens: 1 },
      run: [0.05, 0.6],
      cam: SIDE(12, 2.6),
      fit: false,
      glide: 0.05,
      dim: ['neurona-sentsitiboa', 'ornomuina'],
      names: [{ id: 'neurona-sentsitiboa', text: 'Beti periferiatik ornomuinera', sub: 'gero: burmuinera edo erreflexua' }],
      note: 'Sentsazioa beti periferiatik ornomuinera doa: gero burmuineraino (borondatezko agindua) edo erreflexu bat',
    },
  ],
};
export const Grey19 = poseStage19(specGrey, build);

// ———————————————————————— 10. Aktu erreflexua (5) ————————————————————————

export const S_REFLEX = [0, 0.16, 0.34, 0.52, 0.7, 0.86] as const;
const specReflex: StageSpec<CordPose, CordOpts> = {
  S: S_REFLEX,
  pose: { ...CP0, pia: 1, fn: 1, ends: 1 },
  opts: {},
  site: SITE19.cord,
  arrive: 'Ornomuinera itzuli gara: erantzuna bertan, burmuinera iritsi gabe',
  caption: CAP,
  key: KEY19.function,
  steps: [
    {
      cam: SIDE(13, 2.8),
      fit: false,
      glide: 0.08,
      dim: ['ornomuina', 'larruazala', 'muskulu-ildaskatuak'],
      names: [
        { id: 'larruazala', text: 'Estimulua', sub: 'larruazalean' },
        { id: 'muskulu-ildaskatuak', text: 'Muskulua', sub: 'erantzuna', from: 0.3 },
      ],
      note: 'Aktu erreflexuan erantzuna ornomuinean bertan ematen da: estimulua ez da burmuineraino garraiatzen',
    },
    {
      to: { sens: 1 },
      run: [0.05, 0.9],
      cam: SIDE(12, 2.6),
      fit: false,
      glide: 0.05,
      dim: ['neurona-sentsitiboa', 'larruazala', 'gongoil-errakideoak'],
      names: [{ id: 'neurona-sentsitiboa', text: 'Neurona sentsitiboa', sub: 'estimulua ornomuinera', from: 0.4 }],
      note: 'Larruazaleko nerbioek estimulua sentitzen dute (ukimena) eta neurona sentsitiboek ornomuinera eramaten dute',
    },
    {
      to: { inter: 1 },
      run: [0.1, 0.7],
      cam: FACE(5.4, 8, 30),
      fit: false,
      glide: 0.06,
      dim: ['interneurona', 'atzeko-adarra', 'aurreko-adarra'],
      names: [
        { id: 'interneurona', text: 'Sentsitiboa → motorra', sub: 'ornomuinean bertan', from: 0.3 },
        { id: 'atzeko-adarra', small: true, from: 0.5 },
        { id: 'aurreko-adarra', small: true, from: 0.6 },
      ],
      note: 'Sistema sentsitiboak informazioa sistema motorrari pasatzen dio, ornomuinean bertan',
    },
    {
      to: { motor: 1 },
      run: [0.05, 0.9],
      cam: SIDE(12.5, 2.8),
      fit: false,
      glide: 0.06,
      dim: ['motoneurona', 'muskulu-ildaskatuak', 'aurreko-sustraia'],
      names: [
        { id: 'motoneurona', text: 'Neurona motorra', sub: 'aurreko sustraitik' },
        { id: 'muskulu-ildaskatuak', text: 'Muskulua', sub: 'hanka mugitu', from: 0.6 },
      ],
      note: 'Neurona motorrak agindua muskulura bidaltzen du: adibidez, hanka mugitzeko (mailuarekin belauna kolpatzean)',
    },
    {
      cam: SIDE(9.5, 2.0),
      fit: false,
      glide: 0.06,
      dim: ['gongoil-errakideoak', 'neurona-sentsitiboa'],
      names: [{ id: 'gongoil-errakideoak', text: 'Soma gongoilean', sub: 'gandor neuraleko eratorria' }],
      note: 'Neurona sentsitibo primarioaren soma gongoilean dago (gandor neuraleko eratorria) eta beste luzapen bat du ornomuinerantz',
    },
    {
      to: { dura: 1, arach: 1 },
      run: [0.3, 0.8],
      cam: SIDE(12, 2.4),
      fit: false,
      glide: 0.06,
      dim: ['atzeko-sustraia', 'aurreko-sustraia', 'nerbio-espinalak'],
      names: [
        { id: 'atzeko-sustraia', text: 'Atzeko sustraia', sub: 'sentsazioak sartu' },
        { id: 'aurreko-sustraia', text: 'Aurreko sustraia', sub: 'agindu motorra atera', from: 0.2 },
        { id: 'nerbio-espinalak', text: 'Nerbio mistoa', sub: 'axoiak batu, fusionatu gabe', from: 0.4 },
      ],
      note: 'Sentsazioak atzeko sustraitik, agindua aurrekotik; nerbio espinalean axoiak batzen dira, fusionatu gabe: nerbio mistoa',
    },
  ],
};
export const Reflex19 = poseStage19(specReflex, build);

void G19;
