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
 * Topic 19, sections 1, 1.1, 2 and 3.2–3.4 (the notes of 2026-11-23): the nervous system on the adult body
 * (body-model.ts), the topic's root. Seen from the front: the body's left is on the viewer's right.
 */

const CAP = 'Gorputz heldua, ornomuinetik koronalki moztuta (3D eredua): aurretik; gorputzaren ezkerra zure eskuinean';
const build = (pose: BodyPose, opts: BodyOpts) => bodyModel(pose, opts);
/** The body's surfaces come from the geometry worker (1.6 s that froze the page): the spinner until then. */
function withGeo(View: ComponentType<SceneProps> & { geo?: string[] }) {
  function Scene(props: SceneProps) {
    return useGeoReady([BODY19_GEO]) ? <View {...props} /> : <Loading3D />;
  }
  Scene.geo = ['body19', ...(View.geo ?? [])];
  Scene.spec = (View as { spec?: unknown }).spec;
  return Scene;
}
// The whole body with room above the head (caption, key) and below the feet (the step's note): at 15.5 the
// head sat under the top edge and the feet under the dock.
const WHOLE = FRONT19(19.5, [0, 0, 0], 0, 4);
const HEAD = (dist = 3.4, yaw = 0, elev = 6) => FRONT19(dist, [0, 3.98, -0.02], yaw, elev);
const FACE = (dist = 3, yaw = 24, elev = 6) => FRONT19(dist, [0, 3.74, 0.1], yaw, elev);
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
      cam: TRUNK(13, 1.6),
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

// ———————————————————————— 2. Mozketa motak (1.1) ————————————————————————

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
        { id: 'entzefaloa', text: 'Burmuina', sub: 'mozketa horizontalak' },
        { id: 'ornomuina', sub: 'zeharkako mozketak', from: 0.3 },
      ],
      note: 'Nerbio sisteman orokorrean ez da zeharkako mozketa erabiltzen, horizontala baizik; ornomuinean, berriz, zeharkakoak',
    },
    {
      to: { hor: 1 },
      run: [0.1, 0.6],
      cam: HEAD(3.6, 26, 18),
      fit: false,
      glide: 0.08,
      dim: ['plano-horizontala', 'entzefaloa'],
      names: [{ id: 'plano-horizontala', p: [0.62, 4.044, 0.6], text: 'Horizontala', sub: 'zoruarekin horizontalki', from: 0.3 }],
      note: 'Horizontala: zoruarekin horizontalki',
    },
    {
      to: { hor: 0, cor: 1 },
      run: [0.05, 0.55],
      cam: HEAD(3.6, 26, 12),
      fit: false,
      glide: 0.05,
      dim: ['plano-koronala', 'entzefaloa'],
      names: [{ id: 'plano-koronala', text: 'Koronala', sub: 'ezkerretik eskuinera', from: 0.3 }],
      note: 'Koronala: ezkerretik eskuinera',
    },
    {
      to: { cor: 0, sag: 1 },
      run: [0.05, 0.55],
      cam: HEAD(3.6, 34, 12),
      fit: false,
      glide: 0.05,
      dim: ['plano-sagitala', 'entzefaloa'],
      names: [{ id: 'plano-sagitala', text: 'Sagitala', sub: 'aurretik atzera', from: 0.3 }],
      note: 'Sagitala: aurretik atzera',
    },
    {
      to: { sag: 0, axes: 1 },
      run: [0.05, 0.5],
      cam: LEFT19(8.6, [0, 2.9, -0.2], 90, 6),
      fit: false,
      glide: 0.12,
      dim: ['ornomuina'],
      names: [{ id: 'ornomuina', sub: 'bertikalki: dortsala = atzekoa', from: 0.4 }],
      marks: [
        { p: 'ax-c-dors', text: 'dortsala (atzekoa)' },
        { p: 'ax-c-vent', text: 'bentrala (aurrekoa)' },
      ],
      note: 'Orain arte bentrala eta aurrekoa berdinak ziren, eta atzekoa eta dortsala ere bai: ornomuinean (bertikalki) hala jarraitzen du',
    },
    {
      cam: LEFT19(4.4, [0, 3.96, -0.02], 90, 6),
      fit: false,
      glide: 0.08,
      dim: ['entzefaloa'],
      names: [{ id: 'entzefaloa', text: 'Burmuina', sub: 'horizontalizatuta: dortsala goian' }],
      marks: [
        { p: 'ax-b-dors', text: 'dortsala (goikoa)' },
        { p: 'ax-b-vent', text: 'bentrala (behekoa)' },
      ],
      note: 'Garuna horizontalizatuta dago eta ornomuinak bertikalki jarraitzen du: burmuinean dortsala ez da atzekoa, goikoa baizik; bentrala behekoa',
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
      note: 'Laburbilduz: rostrala (garunean frontala ere bai) aurrekaldekoa da; okzipitala atzealdekoa',
    },
  ],
};
export const Cuts19 = withGeo(poseStage19(specCuts, build));

// ———————————————————————— 3. Kokapen bidezko sailkapena (2.A) ————————————————————————

export const S_CNS = [0, 0.18, 0.4, 0.6, 0.8] as const;
const specCns: StageSpec<BodyPose, BodyOpts> = {
  S: S_CNS,
  pose: { ...endPose(specCuts).pose, axes: 0 },
  opts: {},
  site: SITE19.body,
  arrive: 'Gorputz osora itzuli gara: kokapen bidezko sailkapena',
  caption: CAP,
  key: KEY19.cnsPns,
  steps: [
    {
      to: { pns: 1, axes: 0 },
      run: [0, 0.2],
      cam: WHOLE,
      fit: false,
      glide: 0.1,
      dim: ['nerbio-sistema-zentrala'],
      names: [
        { id: 'nerbio-sistema-zentrala', text: 'Erdiko nerbio sistema', sub: 'gorputzaren erdian dagoelako' },
        { id: 'nerbio-sistema-periferikoa', small: true, from: 0.4 },
      ],
      note: 'A. Kokapen bidezko sailkapena: erdiko nerbio sistemak izen hori du gorputzaren erdian dagoelako',
    },
    {
      cam: TRUNK(9.5, 2.3),
      fit: false,
      glide: 0.06,
      dim: ['nerbio-sistema-zentrala', 'neurokraneoa', 'ornoak'],
      names: [
        { id: 'entzefaloa', text: 'Entzefaloa', sub: 'garezurraren barruan' },
        { id: 'ornomuina', text: 'Bizkar muina / ornomuina', sub: 'bizkarrezurraren barruan', from: 0.2 },
        { id: 'neurokraneoa', p: [-0.03, 4.366, -0.1], text: 'Kraneoa', small: true, from: 0.45 },
        { id: 'ornoak', small: true, from: 0.55 },
      ],
      note: 'Erdiko nerbio sistema (zentrala): hezurrez babestuta; entzefaloa eta ornomuina konektatuta daude, egitura jarraiak dira',
    },
    {
      cam: TRUNK(12, 1.3),
      fit: false,
      glide: 0.06,
      dim: ['nerbio-sistema-periferikoa'],
      names: [
        { id: 'nerbio-kranialak', text: 'Nerbio (bikote) kranealak', sub: 'kraneotik kanporantz' },
        { id: 'nerbio-espinalak', sub: 'ornomuinetik kanporantz', from: 0.3 },
      ],
      note: 'Nerbio sistema periferikoa: erdiko nerbio sistemarekin erlazionatutako nerbioak, kanporantz ateratzen diren guztiak',
    },
    {
      cam: FRONT19(6.2, [0.45, 2.65, -0.2], 16, 4),
      fit: false,
      glide: 0.06,
      dim: ['nerbio-sareak'],
      names: [
        { id: 'nerbio-sareak', text: 'Sare brakiala', sub: 'besokoa' },
        { id: 'nerbio-sareak', text: 'Sare zerbikala', sub: 'lepokoa', p: [0.3, 3.12, -0.22], from: 0.3 },
      ],
      note: 'Nerbioek sareak ateratzen dituzte: sare zerbikala (lepokoa) eta nerbio sare brakiala (besokoa)',
    },
    {
      cam: TRUNK(7.5, -0.5, 10),
      fit: false,
      glide: 0.08,
      dim: ['nerbio-sareak', 'nerbio-ziatikoa'],
      names: [{ id: 'nerbio-sareak', text: 'Sare lunbosakroa', sub: 'lunbarra eta sakroa batzen dira', p: [0.3, -0.55, -0.22] }],
      note: 'Lunbar eta sakro mailan sare lunbarra eta sakroa: gero batzen dira eta bat bezala agertzen dira, sare lunbosakroa',
    },
  ],
};
export const Cns19 = withGeo(poseStage19(specCns, build));

// ———————————————————————— 4. Sailkapen funtzionala (2.B) ————————————————————————

export const S_AUTO = [0, 0.13, 0.27, 0.41, 0.55, 0.7, 0.85] as const;
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
        { id: 'nerbio-sareak', text: 'Nerbio sistema somatikoa', sub: 'borondatezko mugimenduak' },
        { id: 'nerbio-espinalak', small: true, from: 0.35 },
      ],
      note: 'B. Sailkapen funtzionala. Nerbio sistema somatikoa: borondatezko mugimenduak bideratzen ditu',
    },
    {
      to: { auto: 1 },
      run: [0.05, 0.6],
      cam: TRUNK(8.5, 1.3),
      fit: false,
      glide: 0.06,
      dim: ['nerbio-sistema-begetatiboa', 'bihotza', 'birikak', 'urdaila', 'gernu-maskuria'],
      names: [
        { id: 'nerbio-sistema-begetatiboa', text: 'Nerbio sistema autonomoa / begetatiboa', sub: 'ez borondatezko mugimenduak: erraiak', from: 0.3 },
        { id: 'birikak', small: true, from: 0.5 },
        { id: 'urdaila', text: 'Hestea', sub: 'peristaltismoa', small: true, from: 0.55 },
      ],
      note: 'Autonomoa edo begetatiboa: ez borondatezko mugimenduak (esfinter batzuk, pupilarena; hestearen peristaltismoa; birikak…); erraiak mugitzeko',
    },
    {
      cam: TRUNK(6.6, 1.65, 14),
      fit: false,
      glide: 0.06,
      dim: ['sistema-sinpatikoa', 'kate-sinpatikoa', 'alboko-adarra'],
      names: [
        { id: 'kate-sinpatikoa', text: 'Sinpatikoa', sub: 'eremu torazikoa: T1–L2 gutxi gorabehera' },
        { id: 'alboko-adarra', sub: 'neuronen somak', from: 0.3 },
        { id: 'sistema-sinpatikoa', p: [0.239, 2.503, -0.209], small: true, from: 0.5 },
      ],
      note: 'Sinpatikoa (T1–T12, eremu torazikoan): estresaren sistema; urduri gaudenean bihotza arindu, arnasa arin, izerdi guruinak…',
      plainNote: 'Sinpatikoa: estresaren sistema; urduri gaudenean bihotza arindu, arnasa asko eta arin, izerdi guruinak aktibatu…',
    },
    {
      cam: TRUNK(10.5, 1.9, -8),
      fit: false,
      glide: 0.06,
      dim: ['sistema-parasinpatikoa', 'nerbio-bagoa', 'entzefalo-enborra'],
      names: [
        { id: 'nerbio-bagoa', p: [0.147, 2.781, -0.063], text: 'Parasinpatikoa: entzefaloan', sub: 'bikote kranealak' },
        { id: 'sistema-parasinpatikoa', text: 'Parasinpatikoa: S2–S4', sub: 'beheko muturra', p: [0.12, -0.3, -0.14], from: 0.35 },
      ],
      note: 'Parasinpatikoa (S2–S4 eta entzefaloan): lasaitasunera heltzeko; bihotzaren erritmoa jaitsi, esfinterrak zabaldu… egoera basalera',
      plainNote: 'Parasinpatikoa: lasaitasunera heltzeko; bihotzaren erritmoa jaitsi, esfinterrak zabaldu… egoera basalera itzultzeko',
      plainNames: [
        { id: 'nerbio-bagoa', p: [0.147, 2.781, -0.063], text: 'Parasinpatikoa: garunean', sub: 'bikote kranealak' },
        { id: 'sistema-parasinpatikoa', text: 'Parasinpatikoa: beheko muturra', p: [0.12, -0.3, -0.14], from: 0.35 },
      ],
    },
    {
      to: { face: 1 },
      run: [0.1, 0.7],
      cam: FACE(3.6, 30, 6),
      fit: false,
      glide: 0.08,
      dim: ['nerbio-bagoa', 'aurpegi-nerbioa', 'entzefalo-enborra'],
      names: [
        { id: 'nerbio-bagoa', text: 'Bagoa', sub: 'parasinpatikoa' },
        { id: 'aurpegi-nerbioa', text: 'Faziala', sub: 'parasinpatikoa', p: [0.179, 3.6, -0.064], from: 0.2 },
      ],
      note: 'Bikote kraneal baten nerbioak osagai autonomoa badauka, beti parasinpatikoa da: adibidez, bagoa eta faziala',
      warn: true,
    },
    {
      cam: FACE(2.8, 22, 6),
      fit: false,
      glide: 0.06,
      dim: ['buruko-gongoil-parasinpatikoak', 'malko-guruina', 'listu-guruinak', 'nerbio-begi-eragilea', 'begia'],
      names: [
        { id: 'buruko-gongoil-parasinpatikoak', text: 'Gara nerbioetako gongoilak', sub: 'neurona parasinpatikoak' },
        { id: 'malko-guruina', from: 0.25 },
        { id: 'listu-guruinak', from: 0.35 },
        { id: 'nerbio-begi-eragilea', text: '3. bikotea: begi nerbio eragilea', sub: 'begi ninira', from: 0.55 },
        { id: 'begia', text: 'Begi ninia', small: true, from: 0.65 },
      ],
      note: 'Goiko muturrean neuronak gara nerbioetako gongoiletan: aurpegiko guruinetara (malko, listu…); 3. bikotea begi ninira',
      warn: true,
    },
    {
      to: { plex: 1 },
      run: [0.1, 0.6],
      cam: WHOLE,
      fit: false,
      glide: 0.08,
      dim: ['nerbio-sistema-begetatiboa', 'errai-sareak'],
      names: [
        { id: 'sistema-parasinpatikoa', p: [0.144, 3.557, -0.065], text: 'Parasinpatikoa', sub: 'bi muturretan' },
        { id: 'sistema-sinpatikoa', text: 'Sinpatikoa', sub: 'T1–L2 gutxi gorabehera', from: 0.25 },
        { id: 'errai-sareak', p: [-0.045, 2.521, -0.072], text: 'Sareak', sub: 'erraien aurrean: bihotz sarea, esofago sarea', from: 0.5 },
      ],
      note: 'Guztiz konplementarioak: sinpatikoa T1–L2 inguruan, parasinpatikoa bi muturretan; erraien aurrean sareak eratzen dituzte',
    },
  ],
};
export const Auto19 = withGeo(poseStage19(specAuto, build));

// ———————————————————————— 8. Erantzun motorra eta borondatezko mugimenduak (3.2) ————————————————————————

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
      dim: ['larruazala', 'muskulu-ildaskatuak', 'entzefaloa'],
      names: [
        { id: 'larruazala', text: 'Larruazala', sub: 'informazio sentsitiboa' },
        { id: 'entzefaloa', p: [-0.05, 3.634, -0.193], text: 'Burmuina', sub: 'bertan prozesatzen da', from: 0.3 },
        { id: 'muskulu-ildaskatuak', text: 'Muskulua', sub: 'nerbio sistema somatikoa', from: 0.5 },
      ],
      note: 'Mugimendua borondatezkoa bada, informazio sentsitiboa burmuineraino eraman behar da: bertan prozesatu eta agindua sortzen da',
    },
    {
      to: { sens: 0.36 },
      run: [0.05, 0.9],
      cam: FRONT19(7, [0.6, 1.6, -0.1], 12, 4),
      fit: false,
      glide: 0.06,
      dim: ['neurona-sentsitiboa', 'gongoil-errakideoak', 'larruazala'],
      names: [
        { id: 'neurona-sentsitiboa', text: 'Neurona sentsitiboa', sub: 'luzapen zentrala ornomuinera', from: 0.4 },
        { id: 'gongoil-errakideoak', text: 'Atzeko sustrai-gongoila', small: true, from: 0.45 },
      ],
      note: 'Neurona sentsitiboaren luzapen zentrala ornomuinean sartzen da; oro har, beste neurona batzuei sinapsien bidez pasatzen die',
    },
    {
      to: { sens: 1, glass: 1 },
      run: [0.05, 0.85],
      cam: FRONT19(7.5, [0.2, 3.2, -0.1], 8, 4),
      fit: false,
      glide: 0.06,
      dim: ['neurona-sentsitiboa', 'kortex-sentsitiboa', 'talamoa'],
      names: [
        { id: 'neurona-sentsitiboa', p: [0.25, 2.75, -0.225], text: 'Gorantz garunera', small: true, from: 0.3 },
        { id: 'talamoa', text: 'Sinapsiak burmuinean', small: true, from: 0.6 },
        { id: 'kortex-sentsitiboa', text: 'Kortex sentsitiboa', from: 0.8 },
      ],
      note: 'Axoiek gorantz eramaten dute (batzuetan gongoileko axoia zuzenean); burmuinean sinapsiak egin ondoren, kortex sentsitibora',
    },
    {
      to: { motor: 0.45, glass: 0 },
      run: [0.05, 0.9],
      cam: HEAD(3.2, 18, 14),
      fit: false,
      glide: 0.06,
      dim: ['kortex-sentsitiboa', 'kortex-motorra', 'motoneurona'],
      names: [
        { id: 'kortex-sentsitiboa', text: 'Kortex sentsitiboa', sub: 'konturatzen gara' },
        { id: 'kortex-motorra', text: 'Kortex motorra', sub: 'erantzuna', from: 0.3 },
        { id: 'motoneurona', text: 'Axoia beherantz', small: true, from: 0.6 },
      ],
      note: 'Kortex sentsitiboan konturatzen gara zer sentitzen ari garen; neurona batek kortex motorrera pasatzen du, erantzuna emateko',
    },
    {
      to: { motor: 1 },
      run: [0.05, 0.8],
      cam: FRONT19(9, [0.5, 1.9, -0.1], 10, 4),
      fit: false,
      glide: 0.06,
      dim: ['motoneurona', 'muskulu-ildaskatuak'],
      names: [
        { id: 'motoneurona', text: 'Beherantzko bideak', sub: 'batzuetan sinapsiak bidean' },
        { id: 'muskulu-ildaskatuak', text: 'Muskulua', sub: 'helmuga', from: 0.6 },
      ],
      note: 'Axoia beherantzko bideetatik jaisten da bere helmugara (batzuetan sinapsiak egiten ditu bidean)',
    },
  ],
};
export const Voluntary19 = withGeo(poseStage19(specVol, build));

// ———————————————————————— 9. Mugimendu automatikoak eta arinak (3.3–3.4) ————————————————————————

export const S_AUTOM = [0, 0.2, 0.42, 0.62, 0.82] as const;
const specAutom: StageSpec<BodyPose, BodyOpts> = {
  S: S_AUTOM,
  pose: endPose(specVol).pose,
  opts: {},
  site: SITE19.body,
  arrive: 'Gorputz bera: ikasitako mugimenduak',
  caption: CAP,
  key: [
    { color: C19.inter, text: 'zerebeloaren zirkuitua' },
    { color: C19.motor, text: 'motorra' },
    { color: C19.sens, text: 'sentsitiboa' },
  ],
  steps: [
    {
      to: { sens: 0, motor: 0, cbl: 1 },
      run: [0.05, 0.85],
      cam: HEAD(3.4, 40, 10),
      fit: false,
      glide: 0.08,
      dim: ['garuntxoa', 'garuntxo-zirkuitua'],
      names: [
        { id: 'garuntxoa', text: 'Zerebeloa / garuntxoa', sub: 'parte hartzen du', from: 0.3 },
        { id: 'garuntxo-zirkuitua', p: [0.112, 3.702, -0.118], text: 'Muskulu somatikoak', sub: 'mugimendu automatikoak', small: true, from: 0.6 },
      ],
      note: 'Mugimendu automatikoak muskulu somatikoek eragindakoak dira, eta hauetan zerebeloak hartzen du parte',
    },
    {
      to: { motor: 1 },
      run: [0.05, 0.6],
      cam: FRONT19(8, [0.4, 2.4, -0.1], 18, 6),
      fit: false,
      glide: 0.08,
      dim: ['kortex-motorra', 'motoneurona', 'garuntxoa', 'garuntxo-zirkuitua'],
      names: [
        { id: 'kortex-motorra', text: 'Hasteko: borondatea', sub: 'kortex motorra' },
        { id: 'garuntxoa', text: 'Gero automatikoki', sub: 'bizikletan ibili, gidatu…', from: 0.45 },
      ],
      note: 'Ondo ikasitako mugimenduak (bizikletan ibili, gidatu…): hasteko borondatea behar da, baina gero automatikoki jarraitzen dugu',
    },
    {
      to: { motor: 0, cbl: 0 },
      run: [0, 0.4],
      cam: HEAD(3.8, 0, 8),
      fit: false,
      glide: 0.08,
      dim: ['entzefaloa', 'neurokraneoa'],
      names: [
        { id: 'neurokraneoa', text: 'Burua', sub: 'haurretan oso handia eta pisutsua', from: 0.3 },
        { id: 'entzefaloa', small: true, from: 0.45 },
      ],
      note: 'Mugimendu arinak: haurrak erortzean buruan hartzen dituzte kolpeak; burua oso handia eta pisutsua da, eta lehenengo jotzen du',
    },
    {
      to: { motor: 1 },
      run: [0.05, 0.55],
      cam: FRONT19(9, [0.5, 1.9, -0.1], 10, 4),
      fit: false,
      glide: 0.08,
      dim: ['motoneurona', 'muskulu-ildaskatuak', 'nerbio-sareak'],
      names: [
        { id: 'motoneurona', text: 'Eskuak jartzen ikasi', sub: 'mugimendu arina' },
        { id: 'muskulu-ildaskatuak', text: 'Besoa', sub: 'ikasitakoa, oso arin', small: true, from: 0.5 },
      ],
      note: 'Eskuak jartzen ikasi arte gertatzen da: hori da mugimendu arina, ikasitakoa baina oso arin egiten dena',
    },
    {
      to: { sens: 1 },
      run: [0.02, 0.4],
      cam: WHOLE,
      fit: false,
      glide: 0.08,
      dim: ['neurona-sentsitiboa', 'motoneurona', 'kortex-sentsitiboa', 'kortex-motorra'],
      names: [
        { id: 'neurona-sentsitiboa', p: [0.714, 2.683, -0.256], text: 'Zirkuito osoa', sub: 'sentsitiboa gora…' },
        { id: 'motoneurona', text: '…eta motorra behera', small: true, from: 0.4 },
      ],
      note: 'Hala ere, mugimendu horiek egiteko zirkuito osoa bete behar da nerbio sisteman',
    },
  ],
};
export const Automatic19 = withGeo(poseStage19(specAutom, build));
