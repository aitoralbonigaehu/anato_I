'use client';

import '@/components/scenes/week17/HeadMap'; // first: common.tsx and HeadMap.tsx import each other, and HeadMap needs ARCH at load
import { BACK, KEY_ARCH, KEY_LAYERS, TISSUE, endPose, poseStage17, poseStage18, type StageSpec } from '@/components/scenes/week17/common';
import { SITE17 } from '@/components/scenes/week17/sites';
import type { V3 } from '@/lib/three-d/math';
import { AP0, archVModel, type ArchPose, type Dim } from './cleft-model';
import { END_POUCH4 } from './Pharynx18';
import type { PharynxBOpts } from './pharynx-b';
import { pharynxD } from './pharynx-d';
import { POUCH, type PharynxPose } from './pharynx-model';
import { SITE18 } from './sites';
import { WHERE18B } from './sites-b';

/**
 * The pharynx from behind (topic 17, section 2) and the clefts (topic 18, section 1.2). See cleft-model.ts.
 */

const CAP_V = 'Faringea atzetik, sabaia kenduta (3D eredua): enbrioiaren ezkerra zure ezkerrean';
const CAP_ROOT = 'Faringe hestea atzetik, sabaia kenduta (3D eredua): enbrioiaren ezkerra zure ezkerrean';

// ———————————————————————————— 17: faringe-arkuak ————————————————————————————

export const S_ARCHES = [0, 0.22, 0.44, 0.66, 0.84] as const;
const W = (d: number, y: number, yaw = 180, elev = 6) => BACK(d, [0, y, 0.2], yaw, elev);

const specA: StageSpec<ArchPose, Dim> = {
  S: S_ARCHES,
  site: SITE17.archV,
  arrive: 'Gongoil horien nerbioak arkuetara doaz: enbrioiaren lepora jaitsi gara, faringea atzetik irekita',
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
      note: 'Hasteko, mesenkima lodiguneak dira, faringea izango denaren alboetan, aurreko hestearen hormetan: lau goragune (4.–5. asteak)',
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
      note: '4. arkua eta 6.a elkarrekin aurkitzen dira: horregatik argazki batzuetan ez da seigarrena irudikatzen. Zoruan laringe-zuloa: gainetik mihia garatuko da, azpitik laringea',
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
const C_II = (d = 7.2, yaw = 176, elev = 4) => BACK(d, [2.0, 0.95, 0], yaw, elev);

const specB: StageSpec<ArchPose, Dim> = {
  S: S_INSIDE,
  site: SITE17.archV,
  arrive: 'Faringe bera, atzetik: orain arku bakar baten barrura',
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
      note: 'Mesenkiman hiru zelula mota: mesodermo paraxialekoak (gero muskuluak), gandor neuralekoak eta alboko mesodermokoak',
    },
    {
      to: { artery: 1, vein: 1, nerve: 1, cartilage: 1, dissect: 1 },
      run: [0.06, 0.8],
      cam: BACK(9.1, [1.72, 1.02, 0.52], 132, 14),
      fit: false,
      glide: 0.06,
      dim: ['arkuko-arteria', 'arkuko-zaina', 'arkuko-nerbioa', 'arkuko-kartilagoa'],
      names: [
        { id: 'arkuko-arteria', text: 'Arteria', from: 0.1 },
        { id: 'arkuko-zaina', text: 'Zaina', from: 0.2 },
        { id: 'arkuko-nerbioa', text: 'Nerbioa', from: 0.35 },
        { id: 'arkuko-kartilagoa', text: 'Kartilagoa', sub: 'batzuetan ez', from: 0.5 },
      ],
      note: 'Arku bakoitzean, mesenkimaren barnean, orokorrean: zaina, arteria, nerbioa eta kartilagoa',
    },
    {
      to: { dissect: 0 },
      cam: W(13.5, 0.5, 170, 8),
      glide: 0.05,
      dim: ['mesenkima', 'arkuko-kartilagoa'],
      names: [
        { id: 'mesenkima', sub: 'hemendik muskuluak' },
        { id: 'arkuko-kartilagoa', text: 'Kartilagoa', sub: 'desagertu egingo da', from: 0.35 },
      ],
      note: 'Zelula horiek bereizi egingo dira egitura ezberdinak emateko: mesodermo paraxialekoetatik, muskuluak',
    },
    {
      cam: BACK(7.4, [2.2, 0.35, 0], 160, 12),
      glide: 0.05,
      dim: ['faringe-arraildurak', 'lehen-arraildura', 'faringe-poltsak', 'lehen-poltsa'],
      names: [
        { id: 'faringe-arraildurak', text: 'Faringe-arraildurak', sub: 'kanpoan · ektodermikoak' },
        { id: 'faringe-poltsak', text: 'Faringe-poltsak', sub: 'barnean · endodermikoak', from: 0.3 },
      ],
      note: 'Kanpoan, arkuen artean: faringe-arraildurak. Barnean: faringe-poltsak (ez «brankialak»), endodermozko epitelioarekin',
    },
  ],
};
export const ArchInside17 = poseStage17(specB, (p, o) => archVModel(p, o));

// ———————————————————————————— 18: lehen-arraildura ————————————————————————————
// Told on the topic's one pharyngeal gut (pharynx-d.ts), at the embryo's left first cleft, where the first pouch
// was told: the wall peeled for the third and fourth pouches comes back, and the cleft sinks to meet the pouch.

const buildD = (pose: PharynxPose, opts: PharynxBOpts) => pharynxD(pose, opts);
const AT = (dist: number, target: V3, yaw = 180, elev = 6) => BACK(dist, target, yaw, elev);
/** The left first cleft's mouth on the cut (ROOT18.cleft1, a little outside it). */
const CLEFT1_L: V3 = [2.74, 1.62, -0.01];

export const S_EAR = [0, 0.26, 0.5, 0.72] as const;

const specE: StageSpec<PharynxPose, PharynxBOpts> = {
  where: WHERE18B.pharynx,
  site: SITE18.pharynx,
  arrive: 'Faringe berean, berriro gora: ezkerreko lehen arraildura, kanpotik, lehen poltsaren parean',
  S: S_EAR,
  pose: END_POUCH4,
  opts: {},
  caption: CAP_ROOT,
  key: [
    { color: TISSUE.ecto, text: 'ektodermoa' },
    { color: TISSUE.endo, text: 'endodermoa' },
    { color: TISSUE.mes, text: 'mesenkima' },
    { color: POUCH.p1, text: '1. poltsa: tronpa, kutxa' },
  ],
  map: 'arches',
  steps: [
    {
      to: { peelL: 0, c1: 0.38 },
      run: [0.06, 0.9],
      cam: AT(5.6, [2.4, 1.66, 0.05], 178, 8),
      fit: false,
      glide: 0.07,
      dim: ['lehen-arraildura', 'kanpoko-entzumen-hodia', 'lehen-poltsa', 'tinpano-kutxa'],
      names: [
        { id: 'lehen-arraildura', p: CLEFT1_L, text: 'Lehen arraildura', sub: 'sakondu eta luzatu', from: 0.3 },
        { id: 'lehen-poltsa', p: 'tinpano-kutxa', text: 'Lehen poltsa', sub: 'barnetik datorkio', from: 0.45 },
      ],
      note: 'Lehenengo arraildura sakondu eta luzatu egiten da, barneko poltsarantz',
    },
    {
      to: { c1: 1 },
      run: [0.08, 0.8],
      cam: AT(4.2, [2.45, 1.66, 0.02], 181, 6),
      fit: false,
      glide: 0.05,
      dim: ['tinpano-mintza', 'tinpano-kanpoko-epitelioa', 'tinpano-tarteko-geruza', 'tinpano-barneko-epitelioa'],
      names: [{ id: 'tinpano-mintza', text: 'Tinpano mintza', sub: 'batu ≠ fusionatu: muga ez da irekitzen', from: 0.3 }],
      note: 'Poltsarekin batu egiten da (≠ fusionatu; muga ez da irekitzen): bi guneen artean muga bat, tinpano mintza',
    },
    {
      cam: AT(5.8, [2.15, 1.72, 0.08], 174, 8),
      fit: false,
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
      opts: { layers: 1 },
      run: [0.1, 0.6],
      cam: AT(3.1, [2.46, 1.62, 0], 180, 3),
      fit: false,
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
export const FirstCleft18 = poseStage18(specE, buildD);

// ———————————————————————————— 18: beste-arraildurak ————————————————————————————
// The same left wall, one step back: arch II's fold grows down over clefts 2 to 4, the cervical sinus, its closing,
// and the rare sinus that stays.

export const S_SINUS = [0, 0.18, 0.44, 0.62, 0.8] as const;
const WALL = (dist: number, y: number, yaw = 174, elev = 8, x = 2.1) => BACK(dist, [x, y, 0.1], yaw, elev);

const specS: StageSpec<PharynxPose, PharynxBOpts> = {
  where: WHERE18B.pharynx,
  site: SITE18.pharynx,
  arrive: 'Horma bera, osorik: lehen arrailduraren azpiko beste hirurak',
  S: S_SINUS,
  pose: endPose(specE).pose,
  opts: endPose(specE).opts,
  caption: CAP_ROOT,
  key: KEY_ARCH,
  map: 'arches',
  steps: [
    {
      opts: { layers: 0 },
      run: [0, 0.3],
      cam: WALL(10.6, -0.3),
      fit: false,
      glide: 0.06,
      dim: ['faringe-arraildurak', 'lehen-arraildura'],
      names: [
        { id: 'lehen-arraildura', sub: 'hau bakarrik gelditzen da' },
        { id: 'faringe-arraildurak', text: 'Gainerako arraildurak', sub: 'desagertu egiten dira', from: 0.3 },
      ],
      note: 'Kanpotik ikusten diren gainerako faringe-arraildurak desagertu egiten dira',
    },
    {
      to: { flap: 1 },
      run: [0.06, 0.94],
      cam: WALL(9.4, -0.8, 168, 8, 2.2),
      fit: false,
      glide: 0.05,
      dim: ['bigarren-arkua', 'goragune-epikardikoa'],
      names: [
        { id: 'bigarren-arkua', p: 'bigarren-arkua-tolesa', sub: 'mesenkima beherantz hazi', from: 0.2 },
        { id: 'goragune-epikardikoa', text: 'Goragune epikardikoa', sub: 'hemen fusionatu', from: 0.55 },
      ],
      note: 'Bigarren arkuko mesenkima beherantz luzatu eta hazi egiten da, arrailduren gainetik pasatuz eta goragune epikardikoarekin fusionatuz',
    },
    {
      cam: WALL(7.6, -1.0, 178, 5, 2.0),
      fit: false,
      glide: 0.05,
      dim: ['sinu-zerbikala', 'faringe-arraildurak'],
      names: [{ id: 'sinu-zerbikala', text: 'Sinu zerbikala', sub: 'arraildurak estalita: aztarna txikia', from: 0.2 }],
      note: 'Arraildurak estalita gelditzen dira. Hasieran aztarna txiki bat ageri da: sinu zerbikala',
    },
    {
      to: { close: 1 },
      run: [0.06, 0.9],
      cam: WALL(9, -0.8, 170, 8, 2.1),
      fit: false,
      glide: 0.05,
      dim: ['bigarren-arkua', 'hirugarren-arkua', 'laugarren-arkua'],
      names: [
        { id: 'bigarren-arkua', p: 'bigarren-arkua-tolesa', sub: 'sinua desagertu: egitura trinkoa', from: 0.3 },
        { id: 'hirugarren-arkua', small: true, from: 0.4 },
        { id: 'laugarren-arkua', small: true, from: 0.5 },
      ],
      note: 'Gero sinu zerbikala desagertu egiten da eta egitura trinkoa eratzen da',
    },
    {
      to: { persist: 1, fluid: 1, needle: 1 },
      run: [0.06, 0.8],
      cam: WALL(8.2, -0.9, 164, 10, 2.2),
      fit: false,
      glide: 0.05,
      dim: ['sinu-zerbikala'],
      names: [{ id: 'sinu-zerbikala', text: 'Sinu zerbikala mantentzen bada', sub: 'barrunbea lepoan · likidoa → bultoma', from: 0.25 }],
      note: 'Batzuetan sinua mantentzen da: lepoan barrunbe bat, normalean arazorik gabe. Infekzioan likido serosoa metatu daiteke: xiringaz kentzen da',
    },
  ],
};
export const Sinus18 = poseStage18(specS, buildD);
/** Where the clefts leave the gut (the glands' descent, Neck18, runs on from here). */
export const END_SINUS = endPose(specS);
