'use client';

import type { ComponentType } from 'react';
import type { SceneProps } from '@/components/kit';
import { Loading3D } from '@/components/kit/three/Stage3D';
import { useGeoReady } from '@/lib/three-d/offthread';
import { BODY19_GEO, BP0, bodyModel, type BodyOpts, type BodyPose } from './body-model';
import { FRONT19, KEY19, LEFT19, endPose, poseStage19, type StageSpec } from './common';
import { SITE19 } from './sites';
import { C19 } from './tones';

/**
 * Topic 19, sections 1, 1.1–1.2.1, 2 and 4: the nervous system on the adult body (body-model.ts), the topic's root.
 * Seen from the front: the body's left is on the viewer's right.
 */

const CAP = 'Gorputz heldua, ornomuinetik koronalki moztuta (3D eredua): aurretik; gorputzaren ezkerra zure eskuinean';
const build = (pose: BodyPose, opts: BodyOpts) => bodyModel(pose, opts);
/** The body's surfaces come from the geometry worker (1.6 s that froze the page): the spinner until then. */
function withGeo(View: ComponentType<SceneProps> & { geo?: string[] }) {
  function Scene(props: SceneProps) {
    return useGeoReady([BODY19_GEO]) ? <View {...props} /> : <Loading3D />;
  }
  Scene.geo = ['body19', ...(View.geo ?? [])];
  return Scene;
}
const WHOLE = FRONT19(15.5, [0, 0.1, 0], 0, 4);
const HEAD = (dist = 3.4, yaw = 0, elev = 6) => FRONT19(dist, [0, 3.98, -0.02], yaw, elev);
const TRUNK = (dist = 8, y = 1.6, yaw = 0, elev = 4) => FRONT19(dist, [0, y, -0.1], yaw, elev);

// ———————————————————————— 1. Sarrera ————————————————————————

export const S_INTRO = [0, 0.4, 0.7] as const;
const specIntro: StageSpec<BodyPose, BodyOpts> = {
  S: S_INTRO,
  pose: { ...BP0, pns: 0 },
  opts: {},
  site: SITE19.body,
  arrive: 'Gorputz heldua, aurretik: nerbio sistema osoa bertan',
  caption: CAP,
  key: KEY19.cnsPns,
  steps: [
    {
      to: { pns: 1 },
      run: [0.12, 0.85],
      cam: WHOLE,
      fit: false,
      glide: 0.06,
      names: [
        { id: 'entzefaloa', text: 'Entzefaloa', from: 0.1 },
        { id: 'ornomuina', from: 0.2 },
        { id: 'nerbio-espinalak', from: 0.6 },
      ],
      note: 'Nerbio sistemak informazioa garraiatu eta prozesatzen du: ingurunearekin erlazionatzeko sistema da',
    },
    {
      cam: WHOLE,
      fit: false,
      glide: 0.05,
      dim: ['nerbio-sistema-zentrala', 'nerbio-sistema-periferikoa'],
      names: [
        { id: 'nerbio-sistema-zentrala', text: 'Erdiko nerbio sistema', sub: 'anatomikoki' },
        { id: 'nerbio-sistema-periferikoa', text: 'Nerbio sistema periferikoa', sub: 'anatomikoki', from: 0.3 },
      ],
      note: 'Anatomikoki: erdiko nerbio sistema eta nerbio sistema periferikoa',
    },
    {
      cam: TRUNK(10, 1.2),
      fit: false,
      glide: 0.06,
      dim: ['nerbio-espinalak', 'nerbio-bagoa'],
      names: [
        { id: 'nerbio-espinalak', text: 'Somatikoa', sub: 'funtzionalki' },
        { id: 'nerbio-bagoa', text: 'Autonomoa / begetatiboa', sub: 'erraiak; sinpatikoa eta parasinpatikoa', from: 0.3 },
      ],
      note: 'Funtzionalki: somatikoa eta autonomoa (begetatiboa); azken honek erraiak inerbatzen ditu',
    },
  ],
};
export const Intro19 = withGeo(poseStage19(specIntro, build));

// ———————————————————————— 2. Mozketak eta ardatzak (1.1, 1.2.1) ————————————————————————

export const S_CUTS = [0, 0.16, 0.3, 0.44, 0.58, 0.74, 0.88] as const;
const specCuts: StageSpec<BodyPose, BodyOpts> = {
  S: S_CUTS,
  pose: endPose(specIntro).pose,
  opts: {},
  site: SITE19.body,
  arrive: 'Gorputz berean, burura hurbilduz: burmuina mozteko planoak',
  caption: CAP,
  key: [
    { color: '#3e7bf0', text: 'horizontala' },
    { color: '#e5484d', text: 'koronala' },
    { color: '#3fb950', text: 'sagitala' },
  ],
  steps: [
    {
      to: { pns: 0.25 },
      run: [0, 0.3],
      cam: FRONT19(9, [0, 2.4, -0.1], 0, 4),
      fit: false,
      glide: 0.1,
      dim: ['ornomuina', 'entzefaloa'],
      names: [
        { id: 'ornomuina', sub: 'bertikalki (luzetara)' },
        { id: 'entzefaloa', text: 'Burmuina', sub: 'horizontalki', from: 0.3 },
      ],
      note: 'Enbrioian dena luzetara dago; helduan ornomuina bertikalki dago eta burmuina horizontalki',
    },
    {
      to: { hor: 1 },
      run: [0.1, 0.6],
      cam: HEAD(3.6, 26, 18),
      fit: false,
      glide: 0.08,
      dim: ['plano-horizontala', 'entzefaloa'],
      names: [{ id: 'plano-horizontala', text: 'Horizontala', sub: 'lurraren paraleloa: gorputzeko zeharkakoa', from: 0.3 }],
      note: 'Horizontala: lurraren paraleloa; gainerako gorputzeko zeharkako mozketaren baliokidea',
    },
    {
      to: { hor: 0, cor: 1 },
      run: [0.05, 0.55],
      cam: HEAD(3.6, 26, 12),
      fit: false,
      glide: 0.05,
      dim: ['plano-koronala', 'entzefaloa'],
      names: [{ id: 'plano-koronala', text: 'Frontala edo koronala', sub: 'ezkerretik eskuinera', from: 0.3 }],
      note: 'Frontala edo koronala: ezkerretik eskuinera',
    },
    {
      to: { cor: 0, sag: 1 },
      run: [0.05, 0.55],
      cam: HEAD(3.6, 34, 12),
      fit: false,
      glide: 0.05,
      dim: ['plano-sagitala', 'entzefaloa'],
      names: [{ id: 'plano-sagitala', text: 'Sagitala', sub: 'aurretik atzera, bertikalki', from: 0.3 }],
      note: 'Sagitala: aurretik atzera, bertikalki',
    },
    {
      to: { sag: 0, axes: 1 },
      run: [0.05, 0.5],
      cam: LEFT19(8.6, [0, 2.9, -0.2], 90, 6),
      fit: false,
      glide: 0.12,
      dim: ['ornomuina'],
      names: [{ id: 'ornomuina', sub: 'dortsala = atzekoa', from: 0.4 }],
      marks: [
        { p: 'ax-c-dors', text: 'dortsala (atzekoa)' },
        { p: 'ax-c-vent', text: 'bentrala (aurrekoa)' },
      ],
      note: 'Ornomuinean, orain arte bezala: dortsala atzekoa da eta bentrala aurrekoa',
    },
    {
      cam: LEFT19(4.4, [0, 3.96, -0.02], 90, 6),
      fit: false,
      glide: 0.08,
      dim: ['entzefaloa'],
      names: [{ id: 'entzefaloa', text: 'Burmuina', sub: 'makurtuta: dortsala goian' }],
      marks: [
        { p: 'ax-b-dors', text: 'dortsala (goikoa)' },
        { p: 'ax-b-vent', text: 'bentrala (behekoa)' },
      ],
      note: 'Makurduraren ondorioz, burmuinean dortsala ez da atzekoa, goikoa baizik; bentrala behekoa da',
      warn: true,
    },
    {
      cam: LEFT19(4.6, [0, 3.98, -0.02], 90, 4),
      fit: false,
      glide: 0.05,
      dim: ['entzefaloa'],
      names: [{ id: 'entzefaloa', text: 'Burmuina', small: true }],
      marks: [
        { p: 'ax-b-ros', text: 'rostrala (frontala)' },
        { p: 'ax-b-occ', text: 'okzipitala' },
      ],
      note: 'Burmuinaren aurrealdea atal rostrala (frontala ere bai) da; atzealdea atal okzipitala, ez kaudala',
    },
  ],
};
export const Cuts19 = withGeo(poseStage19(specCuts, build));

// ———————————————————————— 3. Zentrala eta periferikoa (2) ————————————————————————

export const S_CNS = [0, 0.18, 0.4, 0.6, 0.8] as const;
const specCns: StageSpec<BodyPose, BodyOpts> = {
  S: S_CNS,
  pose: { ...endPose(specCuts).pose, axes: 0 },
  opts: {},
  site: SITE19.body,
  arrive: 'Gorputz osora itzuli gara: nerbio sistemaren bi sailkapenak',
  caption: CAP,
  key: KEY19.cnsPns,
  steps: [
    {
      to: { pns: 1, axes: 0 },
      run: [0, 0.2],
      cam: WHOLE,
      fit: false,
      glide: 0.1,
      names: [
        { id: 'nerbio-sistema-zentrala', text: 'Kokapena', sub: 'zentrala / periferikoa' },
        { id: 'nerbio-bagoa', text: 'Funtzioa', sub: 'somatikoa / autonomoa', from: 0.3 },
        { id: 'nerbio-sistema-periferikoa', small: true, from: 0.45 },
      ],
      note: 'Bi sailkapen, sistema berarenak: ezin dira batu. Zentralean eta periferikoan badaude somatikoa eta autonomoa',
    },
    {
      cam: TRUNK(9.5, 2.3),
      fit: false,
      glide: 0.06,
      dim: ['nerbio-sistema-zentrala', 'neurokraneoa', 'ornoak'],
      names: [
        { id: 'entzefaloa', text: 'Entzefaloa', sub: 'garezurraren barruan' },
        { id: 'ornomuina', sub: 'bizkarrezurraren barruan', from: 0.2 },
        { id: 'neurokraneoa', text: 'Kraneoa', small: true, from: 0.45 },
        { id: 'ornoak', small: true, from: 0.55 },
      ],
      note: 'Erdiko nerbio sistema (zentrala): entzefaloa eta ornomuina, jarraiak, hezurrez babestuta; zelulak ez dira erregeneratzen',
    },
    {
      cam: TRUNK(12, 1.3),
      fit: false,
      glide: 0.06,
      dim: ['nerbio-sistema-periferikoa'],
      names: [
        { id: 'nerbio-kranialak', text: 'Nerbio (bikote) kranealak', sub: 'kraneotik' },
        { id: 'nerbio-espinalak', sub: 'ornomuinetik, bikoteka', from: 0.3 },
      ],
      note: 'Nerbio sistema periferikoa: hezurrez babestu gabeko nerbioak. Kraneotik bikote kranealak, ornomuinetik nerbio espinalak',
    },
    {
      cam: FRONT19(5.5, [0.3, 2.3, -0.2], 18, 4),
      fit: false,
      glide: 0.06,
      dim: ['nerbio-espinalak', 'gongoil-errakideoak'],
      names: [
        { id: 'nerbio-espinalak', sub: 'eskuinera eta ezkerrera, ornoen arteko zuloetatik' },
        { id: 'ornomuina', small: true, from: 0.3 },
        { id: 'gongoil-errakideoak', text: 'Gongoilak', small: true, from: 0.45 },
      ],
      note: 'Nerbio espinalak bikoteka ateratzen dira, eskuinera eta ezkerrera, eta gorputz osotik adarkatzen dira',
    },
    {
      cam: WHOLE,
      fit: false,
      glide: 0.08,
      dim: ['nerbio-sareak', 'nerbio-ziatikoa'],
      names: [
        { id: 'nerbio-sareak', text: 'Sare zerbikala eta brakiala', sub: 'lepoa, goiko gorputz adarra' },
        { id: 'nerbio-ziatikoa', sub: 'sare lunbosakrotik', from: 0.35 },
      ],
      note: 'Gune batzuetan adarrak nahasten dira sareak eginez, inoiz fusionatu gabe: zerbikala, brakiala, lunbosakroa (nerbio ziatikoa)',
    },
  ],
};
export const Cns19 = withGeo(poseStage19(specCns, build));

// ———————————————————————— 4. Somatikoa eta autonomoa (2) ————————————————————————

export const S_AUTO = [0, 0.2, 0.42, 0.64, 0.84] as const;
const specAuto: StageSpec<BodyPose, BodyOpts> = {
  S: S_AUTO,
  pose: endPose(specCns).pose,
  opts: {},
  site: SITE19.body,
  arrive: 'Gorputz bera, orain funtzioaren arabera',
  caption: CAP,
  key: KEY19.auto,
  steps: [
    {
      cam: WHOLE,
      fit: false,
      glide: 0.05,
      dim: ['nerbio-espinalak', 'nerbio-sareak', 'nerbio-ziatikoa'],
      names: [
        { id: 'nerbio-sareak', text: 'Nerbio sistema somatikoa', sub: 'borondatez mugitzeko: gorputz adarrak, lepoa, burua' },
        { id: 'nerbio-ziatikoa', small: true, from: 0.4 },
      ],
      note: 'Nerbio sistema somatikoa: gauzak borondatez mugitzeko (gorputz adarrak, lepoa, burua…)',
    },
    {
      to: { auto: 1 },
      run: [0.05, 0.6],
      cam: TRUNK(8.5, 1.3),
      fit: false,
      glide: 0.06,
      dim: ['nerbio-sistema-begetatiboa', 'bihotza', 'birikak', 'urdaila', 'gernu-maskuria'],
      names: [
        { id: 'nerbio-sistema-begetatiboa', text: 'Nerbio sistema autonomoa / begetatiboa', sub: 'borondatetik kanpo: erraiak', from: 0.3 },
        { id: 'bihotza', small: true, from: 0.5 },
        { id: 'birikak', small: true, from: 0.55 },
        { id: 'urdaila', small: true, from: 0.6 },
      ],
      note: 'Autonomoa edo begetatiboa: berak bakarrik egiten ditu gauzak, gure borondatetik kanpo; erraiak mugitzen ditu',
    },
    {
      cam: TRUNK(6.6, 1.65, 14),
      fit: false,
      glide: 0.06,
      dim: ['sistema-sinpatikoa', 'kate-sinpatikoa', 'alboko-adarra'],
      names: [
        { id: 'kate-sinpatikoa', text: 'Sinpatikoa', sub: 'T1–T12, eremu toraxikoan' },
        { id: 'alboko-adarra', sub: 'neuronen somak', from: 0.3 },
        { id: 'sistema-sinpatikoa', small: true, from: 0.5 },
      ],
      note: 'Sinpatikoa (T1–T12, eremu toraxikoa): estresaren eta emergentziaren sistema; bihotza azkartu, bronkioak zabaldu, begi-nini dilatazioa…',
    },
    {
      cam: TRUNK(10.5, 1.9, -8),
      fit: false,
      glide: 0.06,
      dim: ['sistema-parasinpatikoa', 'nerbio-bagoa', 'entzefalo-enborra'],
      names: [
        { id: 'nerbio-bagoa', text: 'Parasinpatikoa: entzefaloan', sub: 'bagoa (bikote kraneala)' },
        { id: 'sistema-parasinpatikoa', text: 'Parasinpatikoa: S2–S4', sub: 'alde sakroa', p: [0.12, -0.3, -0.14], from: 0.35 },
      ],
      note: 'Parasinpatikoa (S2–S4 eta entzefaloan): lasaitasunera, egoera basalera itzultzeko; erlaxazioaren sistema',
    },
    {
      cam: WHOLE,
      fit: false,
      glide: 0.08,
      dim: ['nerbio-sistema-begetatiboa'],
      names: [
        { id: 'sistema-parasinpatikoa', text: 'Parasinpatikoa', sub: 'bi muturretan' },
        { id: 'sistema-sinpatikoa', text: 'Sinpatikoa', sub: 'tartean', from: 0.3 },
      ],
      note: 'Osagarriak dira: parasinpatikoa bi muturretan (garunean eta alde sakroan), sinpatikoa tartean',
    },
  ],
};
export const Auto19 = withGeo(poseStage19(specAuto, build));

// ———————————————————————— 9. Borondatezko mugimenduak (4) ————————————————————————

export const S_VOL = [0, 0.16, 0.36, 0.58, 0.78] as const;
const specVol: StageSpec<BodyPose, BodyOpts> = {
  S: S_VOL,
  pose: { ...BP0, hand: 1 },
  opts: {},
  site: SITE19.body,
  arrive: 'Gorputz osora itzuli gara: eskutik burmuinera, eta itzuli',
  caption: CAP,
  key: [
    { color: C19.sens, text: 'sentsitiboa (goranzkoa)' },
    { color: C19.motor, text: 'motorra (beheranzkoa)' },
  ],
  steps: [
    {
      cam: FRONT19(9, [0.5, 1.6, -0.1], 10, 4),
      fit: false,
      glide: 0.08,
      dim: ['larruazala', 'muskulu-ildaskatuak'],
      names: [
        { id: 'larruazala', text: 'Larruazala', sub: 'estimulua: erretzen da' },
        { id: 'muskulu-ildaskatuak', text: 'Muskulua', sub: 'eskua kentzeko', from: 0.3 },
      ],
      note: 'Borondatezko mugimenduak ikasi egiten dira: umeek erretzen direnean eskua kendu behar dela ikasten dute',
    },
    {
      to: { sens: 0.36 },
      run: [0.05, 0.9],
      cam: FRONT19(7, [0.6, 1.6, -0.1], 12, 4),
      fit: false,
      glide: 0.06,
      dim: ['neurona-sentsitiboa', 'gongoil-errakideoak', 'larruazala'],
      names: [
        { id: 'neurona-sentsitiboa', text: 'Neurona sentsitiboa', sub: 'atzeko sustraitik sartzen da', from: 0.4 },
        { id: 'gongoil-errakideoak', text: 'Gongoila', sub: 'atzeko sustraian: sentsitiboa bakarrik', small: true, from: 0.45 },
      ],
      note: 'Sentsazioa larruazaleko nerbiotik, atzeko sustraitik (sentsitiboa bakarrik) sartzen da ornomuinera',
    },
    {
      to: { sens: 1 },
      run: [0.05, 0.85],
      cam: FRONT19(7.5, [0.2, 3.2, -0.1], 8, 4),
      fit: false,
      glide: 0.06,
      dim: ['neurona-sentsitiboa', 'kortex-sentsitiboa'],
      names: [
        { id: 'neurona-sentsitiboa', text: 'Burmuineraino', small: true, from: 0.3 },
        { id: 'kortex-sentsitiboa', text: 'Kortex somatosentsitiboa', sub: 'hemen nabaritzen da', from: 0.8 },
      ],
      note: 'Axoia luzatuz burmuineraino: goikaldean sinapsiak egin eta informazioa kortex somatosentsitibora iristen da; han nabaritzen dugu',
    },
    {
      to: { motor: 0.45 },
      run: [0.05, 0.9],
      cam: HEAD(3.2, 18, 14),
      fit: false,
      glide: 0.06,
      dim: ['kortex-sentsitiboa', 'kortex-motorra', 'motoneurona'],
      names: [
        { id: 'kortex-motorra', text: 'Kortex motorra', sub: 'agindua' },
        { id: 'motoneurona', text: 'Neurona motorra', sub: 'axoia beherantz, gai zuritik', from: 0.5 },
      ],
      note: 'Kortex somatosentsitiboak kortex motorrari pasatzen dio informazioa; honek agindua bidaltzen du, axoiak beherantz',
    },
    {
      to: { motor: 1 },
      run: [0.05, 0.8],
      cam: FRONT19(9, [0.5, 1.9, -0.1], 10, 4),
      fit: false,
      glide: 0.06,
      dim: ['motoneurona', 'muskulu-ildaskatuak'],
      names: [
        { id: 'motoneurona', text: 'Aurreko sustraitik', sub: 'agindu motorra' },
        { id: 'muskulu-ildaskatuak', text: 'Muskulua', sub: 'eskua kendu', from: 0.6 },
      ],
      note: 'Agindu motorra aurreko sustraitik ateratzen da eta muskuluan mugimendua: dena milisegundutan',
    },
  ],
};
export const Voluntary19 = withGeo(poseStage19(specVol, build));
