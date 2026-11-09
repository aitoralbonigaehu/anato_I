'use client';

import '@/components/scenes/week17/HeadMap'; // first: common.tsx and HeadMap.tsx import each other, and HeadMap needs ARCH at load
import { ARCH, BACK, FRONT, KEY_ARCH, KEY_LAYERS, TISSUE, endPose, poseStage17, poseStage18, type StageSpec } from '@/components/scenes/week17/common';
import { AP0, EP0, SP0, archVModel, earModel, sinusModel, type ArchPose, type Dim, type EarPose, type SinusPose } from './cleft-model';

/**
 * The pharynx from behind (topic 17, section 2) and the clefts (topic 18, section 1.2). See cleft-model.ts.
 */

const CAP_V = 'Faringea atzetik, sabaia kenduta (3D eredua): enbrioiaren ezkerra zure ezkerrean';
const CAP_S = 'Ebaketa frontala (3D blokea, aurretik): kanpoaldea zure eskuinean, faringea ezkerrean';

// ———————————————————————————— 17: faringe-arkuak ————————————————————————————

export const S_ARCHES = [0, 0.22, 0.44, 0.66, 0.84] as const;
const W = (d: number, y: number, yaw = 180, elev = 6) => BACK(d, [0, y, 0.2], yaw, elev);

const specA: StageSpec<ArchPose, Dim> = {
  S: S_ARCHES,
  pose: AP0,
  opts: {},
  caption: CAP_V,
  key: KEY_ARCH,
  map: 'arches',
  where: {
    th: 1.2,
    at: [0, 0.4, 0.5],
    scale: 2.2,
    planes: [{ center: [0, 0.4, -0.05], a: [3.4, 0, 0], b: [0, 3.2, 0] }],
    note: 'Faringe-hestea, lepo mailan: sabaia kendu eta atzetik begiratzen diogu',
  },
  steps: [
    {
      cam: W(14, 0.5),
      glide: 0.06,
      dim: ['faringe-arkuak', 'lehen-arkua', 'bigarren-arkua', 'hirugarren-arkua', 'laugarren-arkua', 'faringe-hestea'],
      names: [
        { id: 'faringe-arkuak', text: 'Faringe-arkuak / arku brankialak', sub: 'V-ko goraguneak, alde bietan' },
        { id: 'faringe-hestea', from: 0.35 },
      ],
      note: 'Zeharkako mozketa, atzetik: V hau. Alde bietako goraguneak faringe-arkuak dira (4.-5. asteak; 4. astean hasi)',
    },
    {
      cam: W(13, 0.5, 164, 10),
      glide: 0.05,
      dim: ['lehen-arkua', 'bigarren-arkua', 'hirugarren-arkua', 'laugarren-arkua'],
      names: [
        { id: 'lehen-arkua', small: true },
        { id: 'bigarren-arkua', small: true, from: 0.2 },
        { id: 'hirugarren-arkua', small: true, from: 0.4 },
        { id: 'laugarren-arkua', small: true, from: 0.6 },
      ],
      note: 'Arku brankialak ere deitzen zaie eta lepo mailan (maila zerbikalean) kokatzen dira',
    },
    {
      to: { v: 1 },
      run: [0.1, 0.92],
      cam: BACK(7.5, [0.7, -1.2, 0.2], 172, 8),
      glide: 0.05,
      dim: ['bosgarren-arkua', 'laugarren-arkua', 'seigarren-arkua'],
      names: [{ id: 'bosgarren-arkua', sub: 'garatu eta berehala endekatu: eratorririk ez', from: 0.15 }],
      note: 'Lau irudikatzen dira: 5.a garatu eta jarraian endekatzen da (ez du eratorririk uzten), batzuetan ez da existitzen',
    },
    {
      cam: BACK(7, [-0.9, -1.2, 0.2], 188, 8),
      glide: 0.05,
      dim: ['laugarren-arkua', 'seigarren-arkua', 'laringe-zuloa'],
      names: [
        { id: 'laugarren-arkua', sub: '6.arekin batera' },
        { id: 'seigarren-arkua', sub: 'batzuetan ez da marrazten', from: 0.25 },
        { id: 'laringe-zuloa', from: 0.5 },
      ],
      note: '4. arkua eta 6.a elkarrekin aurkitzen dira: horregatik argazki batzuetan ez da seigarrena irudikatzen',
    },
    {
      cam: W(13.5, 0.5, 192, 8),
      glide: 0.05,
      dim: ['lehen-arkua', 'bigarren-arkua', 'hirugarren-arkua', 'laugarren-arkua', 'seigarren-arkua'],
      names: [{ id: 'faringe-arkuak', sub: 'beti bikoteka: ezkerra + eskuina' }],
      note: 'Arkuak beti bikoteka agertzen dira: bakoitzak bere bikotea du beste aldean',
    },
  ],
};
export const ArchesV17 = poseStage17(specA, (p, o) => archVModel(p, o));

// ———————————————————————————— 17: arkuaren-osagaiak ————————————————————————————

export const S_INSIDE = [0, 0.2, 0.42, 0.64, 0.82] as const;
const C_II = (d = 5.6, yaw = 176, elev = 4) => BACK(d, [2.0, 0.95, 0], yaw, elev);

const specB: StageSpec<ArchPose, Dim> = {
  S: S_INSIDE,
  pose: { ...endPose(specA).pose, v: 1 },
  opts: {},
  caption: CAP_V,
  key: KEY_LAYERS,
  map: 'arches',
  steps: [
    {
      to: { layers: 1 },
      run: [0.1, 0.7],
      cam: C_II(),
      glide: 0.07,
      dim: ['ektodermoa', 'endodermoa', 'mesenkima'],
      names: [
        { id: 'ektodermoa', text: 'Epitelio ektodermikoa', sub: 'kanpoan (urdina)', from: 0.1 },
        { id: 'endodermoa', text: 'Epitelio endodermikoa', sub: 'barnean (horia)', from: 0.3 },
        { id: 'mesenkima', sub: 'tartean (marroia)', from: 0.5 },
      ],
      note: 'Arku bakoitza: barnean endodermoa (horia), kanpoan ektodermoa (urdina), tartean mesenkima (marroia)',
    },
    {
      to: { crest: 1 },
      run: [0.04, 0.95],
      cam: C_II(6.6, 170, 12),
      glide: 0.05,
      dim: ['gandor-neurala', 'mesenkima'],
      names: [
        { id: 'gandor-neurala', text: 'Gandor neuraleko zelulak', sub: 'migratuz → aurpegiko hezurrak', from: 0.2 },
        { id: 'mesenkima', sub: 'zelula mesodermikoak + gandorrekoak', from: 0.4 },
      ],
      note: 'Mesenkiman zelula mesodermikoak eta gandor neuraletik migratutakoak. Gandorrekoek aurpegiko hezurrak emango dituzte',
    },
    {
      to: { artery: 1, vein: 1, nerve: 1, cartilage: 1 },
      run: [0.06, 0.8],
      cam: C_II(7, 180, 2),
      glide: 0.06,
      dim: ['arkuko-arteria', 'arkuko-zaina', 'arkuko-nerbioa', 'arkuko-kartilagoa'],
      names: [
        { id: 'arkuko-arteria', text: 'Arteria', from: 0.1 },
        { id: 'arkuko-zaina', text: 'Zaina', from: 0.2 },
        { id: 'arkuko-nerbioa', text: 'Nerbioa', from: 0.35 },
        { id: 'arkuko-kartilagoa', text: 'Kartilagoa', sub: 'batzuetan ez', from: 0.5 },
      ],
      note: 'Arku bakoitzean, mesenkimaren barnean: arteria bat, zaina bat, nerbio bat eta kartilago bat (batzuetan ez)',
    },
    {
      cam: W(13.5, 0.5, 170, 8),
      glide: 0.05,
      dim: ['mesenkima', 'arkuko-kartilagoa'],
      names: [
        { id: 'mesenkima', sub: 'hemendik muskuluak' },
        { id: 'arkuko-kartilagoa', text: 'Kartilagoa', sub: 'desagertu egingo da', from: 0.35 },
      ],
      note: 'Egitura guztiak errepikatzen dira arku bakoitzean. Mesenkimatik muskuluak; kartilagoa desagertu, hezurrak mintzezko hezurtzapenez',
    },
    {
      cam: BACK(6.6, [2.2, 0.35, 0], 178, 6),
      glide: 0.05,
      dim: ['faringe-arraildurak', 'lehen-arraildura', 'faringe-poltsak', 'lehen-poltsa'],
      names: [
        { id: 'faringe-arraildurak', text: 'Faringe-arraildurak', sub: 'kanpoan · ektodermikoak' },
        { id: 'faringe-poltsak', text: 'Faringe-poltsak', sub: 'barnean · endodermikoak', from: 0.3 },
      ],
      note: 'Kanpoan, arkuen artean: faringe-arraildurak (ektodermikoak). Barnean: faringe-poltsak (ez «brankialak»), endodermikoak',
    },
  ],
};
export const ArchInside17 = poseStage17(specB, (p, o) => archVModel(p, o));

// ———————————————————————————— 18: lehen-arraildura ————————————————————————————

export const S_EAR = [0, 0.26, 0.5, 0.72] as const;

const specE: StageSpec<EarPose, Dim> = {
  S: S_EAR,
  pose: EP0,
  opts: {},
  caption: CAP_S,
  key: [
    { color: TISSUE.ecto, text: 'ektodermoa' },
    { color: TISSUE.endo, text: 'endodermoa' },
    { color: TISSUE.mes, text: 'mesenkima' },
    { color: ARCH.i, text: 'I. arkua (II.a urdina)' },
  ],
  map: 'arches',
  steps: [
    {
      to: { deep: 1 },
      run: [0.08, 0.92],
      cam: FRONT(11, [0, 0, -0.3], 8, 8),
      glide: 0.06,
      dim: ['lehen-arraildura', 'kanpoko-entzumen-hodia', 'lehen-poltsa', 'tinpano-kutxa'],
      names: [
        { id: 'lehen-arraildura', text: 'Lehen arraildura', sub: 'sakondu eta luzatu' },
        { id: 'lehen-poltsa', text: 'Lehen poltsa', sub: 'barnetik datorkio', from: 0.25 },
      ],
      note: 'Lehenengo arraildura sakondu eta luzatu egiten da, barneko poltsarantz',
    },
    {
      to: { meet: 1 },
      run: [0.08, 0.8],
      cam: FRONT(8, [0, 0, -0.2], 4, 6),
      glide: 0.05,
      dim: ['tinpano-mintza', 'tinpano-kanpoko-epitelioa', 'tinpano-tarteko-geruza', 'tinpano-barneko-epitelioa'],
      names: [{ id: 'tinpano-mintza', text: 'Tinpano mintza', sub: 'batu ≠ fusionatu: muga ez da irekitzen', from: 0.3 }],
      note: 'Poltsarekin batu egiten da (≠ fusionatu; muga ez da irekitzen): bi guneen artean muga bat, tinpano mintza',
    },
    {
      cam: FRONT(10.5, [0.4, 0, -0.3], -8, 8),
      glide: 0.05,
      dim: ['kanpoko-entzumen-hodia', 'tinpano-kutxa', 'eustakioren-tronpa'],
      names: [
        { id: 'kanpoko-entzumen-hodia', sub: 'kanpoko belarria ↔ tinpanoa' },
        { id: 'tinpano-kutxa', small: true, from: 0.3 },
        { id: 'eustakioren-tronpa', small: true, from: 0.5 },
      ],
      note: 'Sortzen den hodia kanpoko entzumen hodia da: kanpoko belarria eta tinpanoa lotzen ditu',
    },
    {
      cam: FRONT(6.2, [0, 0.1, 0], 0, 2),
      glide: 0.07,
      dim: ['tinpano-kanpoko-epitelioa', 'tinpano-tarteko-geruza', 'tinpano-barneko-epitelioa'],
      names: [
        { id: 'tinpano-kanpoko-epitelioa', text: '1. Kanpoko epitelioa', sub: 'ektodermikoa', from: 0.1 },
        { id: 'tinpano-barneko-epitelioa', text: '2. Barneko epitelioa', sub: 'endodermikoa', from: 0.35 },
        { id: 'tinpano-tarteko-geruza', text: '3. Tarteko zelulak', sub: 'mesodermikoa, oso fina', from: 0.6 },
      ],
      note: 'Tinpano mintza oso fina da (ia gardena; hemen handituta), baina hiru jatorri ditu: ektodermoa, endodermoa eta tartean mesodermoa',
    },
  ],
};
export const FirstCleft18 = poseStage18(specE, (p, o) => earModel(p, o));

// ———————————————————————————— 18: beste-arraildurak ————————————————————————————

export const S_SINUS = [0, 0.18, 0.44, 0.62, 0.8] as const;
const N = (d: number, y: number, yaw = 10, elev = 6) => FRONT(d, [1.5, y, -0.3], yaw, elev);

const specS: StageSpec<SinusPose, Dim> = {
  S: S_SINUS,
  pose: SP0,
  opts: {},
  caption: CAP_S,
  key: KEY_ARCH,
  map: 'arches',
  steps: [
    {
      cam: N(12, 0.2),
      glide: 0.06,
      dim: ['faringe-arraildurak', 'lehen-arraildura'],
      names: [
        { id: 'lehen-arraildura', sub: 'hau bakarrik gelditzen da' },
        { id: 'faringe-arraildurak', text: 'Gainerako arraildurak', sub: 'desagertu egiten dira', from: 0.3 },
      ],
      note: 'Kanpotik ikusten diren gainerako faringe-arraildurak desagertu egiten dira',
    },
    {
      to: { over: 1 },
      run: [0.06, 0.94],
      cam: N(8.5, -0.5, 14, 6),
      glide: 0.05,
      dim: ['bigarren-arkua', 'goragune-epikardikoa'],
      names: [
        { id: 'bigarren-arkua', sub: 'mesenkima beherantz hazi' },
        { id: 'goragune-epikardikoa', text: 'Goragune epikardikoa', sub: 'hemen fusionatu', from: 0.55 },
      ],
      note: 'Bigarren arkuko mesenkima beherantz luzatu eta hazi egiten da, arrailduren gainetik pasatuz eta goragune epikardikoarekin fusionatuz',
    },
    {
      cam: N(6.5, -0.65, 6, 4),
      glide: 0.05,
      dim: ['sinu-zerbikala', 'faringe-arraildurak'],
      names: [{ id: 'sinu-zerbikala', text: 'Sinu zerbikala', sub: 'arraildurak estalita: aztarna txikia', from: 0.2 }],
      note: 'Arraildurak estalita gelditzen dira. Hasieran aztarna txiki bat ageri da: sinu zerbikala',
    },
    {
      to: { close: 1 },
      run: [0.06, 0.9],
      cam: N(7.5, -0.5, 16, 6),
      glide: 0.05,
      dim: ['bigarren-arkua', 'hirugarren-arkua', 'laugarren-arkua'],
      names: [
        { id: 'bigarren-arkua', sub: 'sinua desagertu: egitura trinkoa', from: 0.3 },
        { id: 'hirugarren-arkua', small: true, from: 0.4 },
        { id: 'laugarren-arkua', small: true, from: 0.5 },
      ],
      note: 'Gero sinu zerbikala desagertu egiten da eta egitura trinkoa eratzen da',
    },
    {
      to: { persist: 1 },
      run: [0.06, 0.7],
      cam: N(6.5, -0.6, 8, 4),
      glide: 0.05,
      dim: ['sinu-zerbikala'],
      names: [{ id: 'sinu-zerbikala', text: 'Sinu zerbikala mantentzen bada', sub: 'barrunbea lepoan · likidoa → bultoma', from: 0.25 }],
      note: 'Batzuetan sinua mantentzen da: lepoan barrunbe bat, normalean arazorik gabe. Infekzioan likido serosoa metatu daiteke: xiringaz kentzen da',
    },
  ],
};
export const Sinus18 = poseStage18(specS, (p, o) => sinusModel(p, o));
