'use client';

import type { ComponentType } from 'react';
import type { SceneProps } from '@/components/kit';
import { Loading3D } from '@/components/kit/three/Stage3D';
import type { V3 } from '@/lib/three-d/math';
import { useGeoReady } from '@/lib/three-d/offthread';
import { BR0, BRAIN19_GEO, MENINGES19_GEO, VENTRICLES19_GEO, brainModel, type BrainOpts, type BrainPose } from './brain-model';
import { KEY19, LEFT19, endPose, poseStage19, type StageSpec } from './common';
import { SITE19 } from './sites';
import { C19 } from './tones';

/**
 * Topic 19 (the notes of 2026-11-23), sections 7 (the ventricles), 8 (the cerebrospinal fluid), 9 (the meninges),
 * 10.4 (the diencephalon), 10.4.1 (the hypophysis) and 11 (the cranial pairs), on the head cut down the middle
 * (brain-model.ts), seen from the left: the face on the viewer's left, the back of the head on the right. The other
 * half comes in (mirrored) for the whole brain seen from above or from below.
 */

const CAP = 'Burua erditik moztuta (3D eredua): ezkerretik ikusita, aurpegia zure ezkerrean';
const CAP_WHOLE = 'Garun osoa (3D eredua): bi erdiak';
const build = (pose: BrainPose, opts: BrainOpts) => brainModel(pose, opts);
type BrainSlot = typeof BRAIN19_GEO;
function withGeo(View: ComponentType<SceneProps> & { geo?: string[] }, extra: BrainSlot[]) {
  const slots = [BRAIN19_GEO, ...extra];
  function Scene(props: SceneProps) {
    return useGeoReady(slots) ? <View {...props} /> : <Loading3D />;
  }
  Scene.geo = [...slots.map(({ key }) => key), ...(View.geo ?? [])];
  Scene.spec = (View as { spec?: unknown }).spec;
  return Scene;
}
const SAG = (dist = 7, y = -0.3, z = 0, yaw = 90, elev = 3) => LEFT19(dist, [0, y, z], yaw, elev);
/** The whole brain from below (the base): the frontal lobes up the screen. */
const BELOW = (dist = 7.2, y = -0.9, z = -0.1, x = 0, yaw = 0, elev = -76) => LEFT19(dist, [x, y, z], yaw, elev, [0, 0]);
/**
 * The brain's own names (notes section 1.1): the brain lies horizontal, so its dorsal side is the top and its ventral
 * side the bottom; the front is rostral (frontal), the back occipital. The frame's pills say these, not the embryo's
 * kraneala/bentrala, so they agree with the stage's written orientation.
 */
const BRAIN_AXES = {
  up: 'goikoa (dortsala)',
  front: 'aurrekoa (rostrala)',
  side: 'ezkerra',
  sideDir: [1, 0, 0] as V3,
  edges: { up: 'Goikoa (dortsala)', down: 'Behekoa (bentrala)', front: 'Aurrekoa (rostrala)', back: 'Atzekoa (okzipitala)', side: 'Ezkerra', otherSide: 'Eskuina' },
};
const stage = (spec: StageSpec<BrainPose, BrainOpts>, ...extra: BrainSlot[]) => withGeo(poseStage19({ axes: BRAIN_AXES, ...spec }, build), extra);

// ———————————————————————— 7. Sistema bentrikularra eta ependimo hodia ————————————————————————

export const S_VENT = [0, 0.14, 0.29, 0.45, 0.6, 0.74, 0.87] as const;
const specVent: StageSpec<BrainPose, BrainOpts> = {
  S: S_VENT,
  pose: { ...BR0 },
  opts: {},
  site: SITE19.head,
  arrive: 'Xixkuetatik garun heldura: hodi neuralaren barrunbea',
  caption: CAP,
  key: [
    { color: C19.csf, text: 'bentrikuluak (likido zefalorrakideoa)' },
    { color: C19.tel, text: 'telentzefaloa' },
    { color: C19.dien, text: 'dientzefaloa' },
    { color: C19.mes, text: 'mesentzefaloa' },
  ],
  steps: [
    {
      to: { glass: 0.7, vent: 1, origin: 1 },
      run: [0.1, 0.8],
      cam: SAG(7.6, -0.7),
      fit: false,
      glide: 0.08,
      dim: ['bentrikulu-sistema', 'hodi-ependimarioa'],
      names: [
        { id: 'bentrikulu-sistema', text: 'Hodiaren barrunbea', sub: 'hodi neuraletik', from: 0.5 },
        { id: 'hodi-ependimarioa', text: 'Hodi formako gunea', sub: 'erdian', small: true, from: 0.65 },
      ],
      note: 'Erdiko nerbio sistema osoa hodi neuraletik garatzen da: hodi formako itxura, eta erdian hodi formako gune bat',
    },
    {
      cam: SAG(7.6, -1.2),
      fit: false,
      glide: 0.05,
      dim: ['hodi-ependimarioa', 'bentrikulu-sistema'],
      names: [
        { id: 'hodi-ependimarioa', text: 'Ependimoa', sub: 'ornomuinean: hodi forma ez da aldatzen' },
        { id: 'bentrikulu-sistema', text: 'Bentrikuluak', sub: 'garunean: xixkuaren barrunbea zabaldu', from: 0.35 },
      ],
      note: 'Ornomuinean hodi forma ez da aldatzen: erdian luzetarako barrunbea, ependimoa. Garunean xixkuak eratzen dira: xixkuaren barrunbea zabaldu, bentrikulua',
    },
    {
      to: { whole: 1, glass: 0.86 }, // the tissue under half strength: glass the pointer passes through to the cavities
      run: [0.05, 0.55],
      cam: LEFT19(6.4, [0, 0.3, 0.1], 28, 46),
      fit: false,
      glide: 0.07,
      dim: ['alboko-bentrikuluak'],
      names: [{ id: 'alboko-bentrikuluak', text: 'Alboko bentrikuluak', sub: 'telentzefaloan: ezkerra eta eskuina; handienak', from: 0.3 }],
      note: 'Telentzefaloaren barruan 2 bentrikulu: alboko bentrikuluak (ezkerra eta eskuina), tamainaz nagusienak',
    },
    {
      to: { whole: 0, glass: 0.7 },
      run: [0, 0.45],
      cam: SAG(3.6, 0.0, 0.1, 100, 10),
      fit: false,
      glide: 0.07,
      dim: ['hirugarren-bentrikulua', 'talamoa'],
      names: [
        { id: 'hirugarren-bentrikulua', text: 'III. bentrikulua', sub: 'dientzefaloan', from: 0.3 },
        { id: 'alboko-bentrikuluak', p: [-0.097, 0.191, 0.324], small: true, from: 0.55 },
        { id: 'talamoa', p: [-0.275, 0.211, -0.209], small: true, from: 0.4 },
      ],
      note: 'Telentzefaloaren jarraian dientzefaloa, telentzefalo xixkuen artean geratzen dena: bere barnean III. bentrikulua',
    },
    {
      cam: SAG(3.4, -0.45, -0.4, 90, 6),
      fit: false,
      glide: 0.05,
      dim: ['garun-akueduktoa', 'mesentzefaloa'],
      names: [{ id: 'garun-akueduktoa', text: 'Akueduktoa', sub: 'mesentzefaloan: pareta lodia, hodia estu (Silvio)' }],
      note: 'Mesentzefaloan pareta asko loditzen da eta erdiko hodia estutu: akueduktoa (mesentzefalo edo Silvio akueduktoa)',
    },
    {
      cam: SAG(3.8, -0.9, -0.7, 110, 6),
      fit: false,
      glide: 0.05,
      dim: ['laugarren-bentrikulua'],
      names: [{ id: 'laugarren-bentrikulua', text: 'IV. bentrikulua', sub: 'erronbentzefaloan: erronbo forma' }],
      note: 'Erronbentzefalotik (metentzefaloa eta mielentzefaloa) sortzen den bentrikuluak erronbo forma mantentzen du: IV. bentrikulua',
    },
    {
      to: { whole: 1, glass: 0.88 },
      run: [0.05, 0.5],
      cam: LEFT19(7.4, [0, 0.0, -0.3], 180, 62, [0, 0]),
      fit: false,
      glide: 0.08,
      dim: ['bentrikulu-sistema'],
      names: [
        { id: 'alboko-bentrikuluak', text: 'Alboko bentrikuluak', sub: 'EZ "I. eta II."' },
        { id: 'hirugarren-bentrikulua', text: 'III.', small: true, from: 0.25 },
        { id: 'garun-akueduktoa', text: 'Akueduktoa', small: true, from: 0.4 },
        { id: 'laugarren-bentrikulua', text: 'IV.', small: true, from: 0.55 },
      ],
      note: 'KONTUZ: "I. edo II. bentrikulua" esatea TXARTO dago: albokoak deitzen dira. Atzekaldetik ikusita (ikuspegi dortsala)',
      warn: true,
    },
  ],
};
export const Ventricles19 = stage(specVent, VENTRICLES19_GEO);

// ———————————————————————— 8. Likido zefalorrakideoa ————————————————————————

export const S_CSF = [0, 0.16, 0.33, 0.5, 0.67, 0.83] as const;
const specCsf: StageSpec<BrainPose, BrainOpts> = {
  S: S_CSF,
  pose: endPose(specVent).pose,
  opts: {},
  site: SITE19.head,
  arrive: 'Bentrikulu berak: orain barnean dabilen likidoa',
  caption: CAP,
  key: [
    { color: C19.csf, text: 'likido zefalorrakideoa' },
    { color: '#e0607a', text: 'sare koroideak' },
    { color: C19.bone, text: 'kraneoa' },
  ],
  steps: [
    {
      to: { whole: 0, glass: 0.7, origin: 0 },
      run: [0, 0.5],
      cam: SAG(7.8, -0.8),
      fit: false,
      glide: 0.08,
      dim: ['likido-zefalorrakideoa', 'bentrikulu-sistema', 'hodi-ependimarioa'],
      names: [
        { id: 'bentrikulu-sistema', text: 'Bentrikuluetan', sub: 'likido amortiguatzailea: kolpeak', from: 0.4 },
        { id: 'hodi-ependimarioa', text: 'Ependimo hodian', small: true, from: 0.6 },
      ],
      note: 'Likido zefalorrakideoa erdiko nerbio sistemaren barnean garraiatzen den likido amortiguatzailea da (kolpeak, batez ere burmuinean): ependimo hodian eta bentrikuluetan',
    },
    {
      to: { men: 1, csf: 1 },
      run: [0.1, 0.6],
      cam: SAG(8.4, -0.4),
      fit: false,
      glide: 0.06,
      dim: ['neurokraneoa', 'likido-zefalorrakideoa'],
      names: [
        { id: 'likido-zefalorrakideoa', text: '5. astean hasten da', sub: 'ekoizpena etengabea' },
        { id: 'neurokraneoa', text: 'Hezurrak eremua mugatzen du', sub: 'ekoizten den bitartean xurgatu behar', from: 0.4 },
      ],
      note: 'Likidoa 5. astean hasten da eratzen, eta ekoizpena etengabea da. Hezurrak eremua mugatzen duenez, ekoizten den bitartean xurgatu egin behar da',
    },
    {
      to: { plex: 1, men: 0, csf: 0 },
      run: [0.05, 0.6],
      cam: SAG(4.6, -0.2, -0.3, 100, 10),
      fit: false,
      glide: 0.06,
      dim: ['sare-koroideak', 'bentrikulu-sistema'],
      names: [
        { id: 'sare-koroideak', text: 'Sare koroideak', sub: 'arteriolak: bentrikuluen sabaian', from: 0.3 },
        { id: 'bentrikulu-sistema', text: 'Bentrikuluak', small: true, from: 0.5 },
      ],
      note: 'Non ekoizten da? Sare koroideetan: arteriolaz eratutako sare formako egiturak, bentrikuluen sabaian, likidoa bentrikuluetara dreinatzeko',
    },
    {
      to: { flowShow: 1, flow: 4 },
      run: [0.02, 1],
      cam: SAG(4.4, 0.15, 0.1, 100, 12),
      fit: false,
      glide: 0.06,
      dim: ['alboko-bentrikuluak', 'monro-zuloak', 'hirugarren-bentrikulua'],
      names: [
        { id: 'alboko-bentrikuluak', p: [-0.125, 0.21, 0.362], text: 'Alboko bentrikuluetatik', small: true },
        { id: 'monro-zuloak', text: 'Monro-ren zuloa', sub: 'bentrikulu arteko zuloa', from: 0.3 },
        { id: 'hirugarren-bentrikulua', text: 'III. bentrikulura', small: true, from: 0.55 },
      ],
      note: 'Alboko bentrikuluetako likidoa III. bentrikulura pasatzen da Monro-ren zuloaren (bentrikulu arteko zuloaren) bidez',
    },
    {
      to: { flow: 9 },
      run: [0, 1],
      cam: SAG(4.6, -0.55, -0.5, 100, 8),
      fit: false,
      glide: 0.06,
      dim: ['garun-akueduktoa', 'laugarren-bentrikulua', 'sare-koroideak'],
      names: [
        { id: 'garun-akueduktoa', text: 'Akueduktotik', small: true },
        { id: 'laugarren-bentrikulua', text: 'IV. bentrikulura', sub: 'gehiago ekoizten da', from: 0.35 },
      ],
      note: 'III. bentrikulutik IV. bentrikulura akueduktotik pasatzen da, eta bertan gehiago ekoizten da',
    },
    {
      to: { flow: 16 },
      run: [0, 1],
      cam: SAG(6.4, -1.1, -0.7, 110, 8),
      fit: false,
      glide: 0.06,
      dim: ['luschka-zuloak', 'magendie-zuloa', 'hodi-ependimarioa'],
      names: [
        { id: 'luschka-zuloak', text: 'Luschka zuloak', sub: '2, albokoak' },
        { id: 'magendie-zuloa', text: 'Magendie', sub: 'erdikoa', from: 0.3 },
        { id: 'hodi-ependimarioa', text: 'Ependimotik behera', sub: 'parte bat', small: true, from: 0.55 },
      ],
      note: 'IV. bentrikulutik parte batek ependimotik jarraitzen du; bestea 3 zulotik ateratzen da, nerbio sistema inguratzeko: bi albokoak (Luschka) eta erdikoa (Magendie)',
    },
  ],
};
export const Csf19 = stage(specCsf, VENTRICLES19_GEO, MENINGES19_GEO);

// ———————————————————————— 9. Meningeak ————————————————————————

export const S_BMEN = [0, 0.14, 0.28, 0.43, 0.57, 0.71, 0.85] as const;
const specBMen: StageSpec<BrainPose, BrainOpts> = {
  S: S_BMEN,
  pose: endPose(specCsf).pose,
  opts: {},
  site: SITE19.head,
  arrive: 'Likidoa kanpora irten da: orain garuna inguratzen duten mintzak',
  caption: CAP,
  key: KEY19.meninges,
  steps: [
    {
      to: { men: 1, csf: 1, flowShow: 0, plex: 0, vent: 0, glass: 0 },
      run: [0.05, 0.7],
      cam: SAG(8.2, -0.4),
      fit: false,
      glide: 0.08,
      dim: ['meningeak', 'likido-zefalorrakideoa'],
      names: [
        { id: 'meningeak', text: 'Meningeak', sub: '5.–8. astean garatzen dira', from: 0.4 },
        { id: 'likido-zefalorrakideoa', text: 'Likidoa', sub: 'meningeetan xurgatzen da', small: true, from: 0.6 },
      ],
      note: 'Likido zefalorrakideoa meningeetan xurgatzen da. Meningeak 5.–8. astean garatzen dira: erdiko nerbio sistema inguratzen duten mintzak, hura babesteko',
    },
    {
      cam: SAG(4.2, 0.9, 0.1, 90, 8),
      fit: false,
      glide: 0.06,
      dim: ['dura-materra', 'araknoidesa', 'pia-materra'],
      names: [
        { id: 'dura-materra', text: 'Dura materra', sub: 'kanpoan' },
        { id: 'araknoidesa', text: 'Araknoidea', sub: 'barnean', from: 0.3 },
        { id: 'pia-materra', text: 'Pia materra', sub: 'ehunari lotuta', from: 0.55 },
      ],
      note: 'Kanpoan dura materra; dura materraren barnean araknoidea, eta gero pia materra (ehunari lotuta)',
    },
    {
      cam: SAG(4.0, 1.0, -0.2, 90, 8),
      fit: false,
      glide: 0.05,
      dim: ['araknoidesa', 'pia-materra', 'dura-materra'],
      names: [
        { id: 'pia-materra', text: 'Pia eta araknoidea', sub: 'gandor neuraletik: ektodermikoa' },
        { id: 'araknoidesa', small: true, from: 0.2 },
        { id: 'dura-materra', text: 'Dura materra', sub: 'mesodermikoa', from: 0.5 },
      ],
      note: 'Pia materrak eta araknoideak jatorri bera dute, gandor neurala (ektodermikoa); dura materrak, ordea, jatorri mesodermikoa',
    },
    {
      cam: SAG(3.4, 1.05, 0.25, 90, 8),
      fit: false,
      glide: 0.05,
      dim: ['dura-materra', 'neurokraneoa', 'pia-materra'],
      names: [
        { id: 'dura-materra', text: 'Dura materra hezurrari itsatsita', sub: 'garunean: ez dago eremu epiduralik' },
        { id: 'neurokraneoa', text: 'Kraneoa', small: true, from: 0.3 },
        { id: 'pia-materra', text: 'Pia materra garunari', small: true, from: 0.5 },
      ],
      note: 'Garunean dura materra zuzenean hezurrari itsatsita dago, eta pia materra garuneko ehunari: horregatik ez dago espazio epiduralik garunean',
    },
    {
      cam: SAG(5.2, -1.9, -0.9, 100, 6),
      fit: false,
      glide: 0.06,
      dim: ['dura-materra', 'ornomuina'],
      names: [
        { id: 'dura-materra', p: [0, -2.05, -1.12], text: 'Ornomuinean: hezurrari lotu gabe', sub: 'hezurraren eta dura materraren artean eremu epidurala' },
        { id: 'ornomuina', small: true, from: 0.4 },
      ],
      note: 'Ornomuinean, berriz, dura materra ez dago hezurrari lotuta: hezurraren eta dura materraren artean espazio epidurala sortzen da',
    },
    {
      cam: SAG(3.6, 1.0, -0.4, 90, 8),
      fit: false,
      glide: 0.05,
      dim: ['araknoidesa', 'eremu-azpiaraknoideoa'],
      names: [
        { id: 'araknoidesa', text: 'Araknoidea', sub: 'armiarma sarearen antzekoa' },
        { id: 'eremu-azpiaraknoideoa', text: 'Eremu azpiaraknoideoa', sub: 'araknoidearen eta piaren artean', from: 0.35 },
      ],
      note: 'Dura materraren barruan araknoidea, armiarmaren antzeko sare bat; araknoidea eta pia ez daude lotuta: bien artean eremu azpiaraknoideoa',
    },
    {
      to: { flowShow: 1, flow: 24 },
      run: [0.02, 1],
      cam: SAG(8.8, -0.2),
      fit: false,
      glide: 0.06,
      dim: ['eremu-azpiaraknoideoa', 'likido-zefalorrakideoa'],
      names: [{ id: 'eremu-azpiaraknoideoa', text: 'Likidoa eremu azpiaraknoideoan', sub: 'zain-sistemara pasa: berriz xurgatu', from: 0.2 }],
      note: 'Eremu azpiaraknoideoan likido zefalorrakideoa garraiatzen da; bertatik zain-sistemara pasatzen da, eta horrela berriro xurgatzen da',
    },
  ],
};
export const BrainMen19 = stage(specBMen, MENINGES19_GEO, VENTRICLES19_GEO);

// ———————————————————————— 10.4 Dientzefaloa ————————————————————————

export const S_THAL = [0, 0.16, 0.33, 0.5, 0.67, 0.83] as const;
const specThal: StageSpec<BrainPose, BrainOpts> = {
  S: S_THAL,
  pose: { ...BR0, origin: 1 },
  opts: {},
  site: SITE19.head,
  arrive: 'Mesentzefalotik gora: dientzefaloa, garunaren erdian',
  caption: CAP,
  key: [
    { color: C19.tel, text: 'telentzefaloa' },
    { color: C19.dien, text: 'dientzefaloa' },
    { color: C19.sens, text: 'sentsitiboa' },
    { color: '#b48cf0', text: 'usaimena' },
  ],
  steps: [
    {
      cam: SAG(7.4, -0.2),
      fit: false,
      glide: 0.08,
      dim: ['garun-hemisferioak', 'talamoa', 'hipotalamoa', 'epitalamoa'],
      names: [
        { id: 'garun-hemisferioak', text: 'Xixku telentzefalikoak', sub: 'hazi eta dientzefaloa estali' },
        { id: 'talamoa', text: 'Dientzefaloa', sub: 'erdialdean', from: 0.35 },
      ],
      note: 'Dientzefaloaren inguruan xixku telentzefalikoak hazten dira eta hura estaltzen dute: dientzefaloa erdialdean geratzen da',
    },
    {
      to: { vent: 1, plex: 1, glass: 0.45 },
      run: [0.05, 0.6],
      cam: SAG(3.8, 0.05, 0.0, 100, 10),
      fit: false,
      glide: 0.06,
      dim: ['hirugarren-bentrikulua', 'sare-koroideak'],
      names: [
        { id: 'hirugarren-bentrikulua', text: 'III. bentrikulua', sub: 'dientzefaloaren barruan', from: 0.3 },
        { id: 'sare-koroideak', text: 'Sare koroideak', small: true, from: 0.5 },
      ],
      note: 'Dientzefaloaren barruan III. bentrikulua eta sare koroideak aurkitzen dira',
    },
    {
      to: { vent: 0, plex: 0, glass: 0, origin: 0, sens: 0.5 },
      run: [0.05, 0.9],
      cam: SAG(7.2, -0.9),
      fit: false,
      glide: 0.06,
      dim: ['talamoa', 'neurona-sentsitiboa'],
      names: [
        { id: 'talamoa', text: 'Talamoa', sub: 'egitura nagusia: errelebo-zentroa' },
        { id: 'neurona-sentsitiboa', p: [-0.078, -1.847, -0.711], text: 'Sentsazioak', sub: 'ornomuina, belarria, ahoa, gibela…', from: 0.4 },
      ],
      note: 'Dientzefaloaren egitura nagusia talamoa da: errelebo-zentroa. Ornomuinetik, belarritik, ahotik, gibeletik… heltzen diren sentsazio gehienak talamotik pasatzen dira',
    },
    {
      to: { smell: 1 },
      run: [0.1, 0.8],
      cam: SAG(4.6, 0.1, 0.3, 90, 6),
      fit: false,
      glide: 0.06,
      dim: ['usaimen-nerbioa', 'talamoa'],
      names: [
        { id: 'talamoa', text: 'Talamotik ez bada: ez gara kontziente', small: true },
        { id: 'usaimen-nerbioa', text: 'Usaimena izan ezik', sub: 'zentzumen primitiboena', from: 0.4 },
      ],
      note: 'Sentsazio bat talamotik pasatzen ez bada ez gara kontziente izango: DENA pasatzen da talamotik, usaimena izan ezik',
    },
    {
      to: { smell: 0, sens: 0 },
      run: [0, 0.4],
      cam: SAG(3.2, -0.25, 0.25, 96, 8),
      fit: false,
      glide: 0.05,
      dim: ['hipotalamoa'],
      names: [{ id: 'hipotalamoa', text: 'Hipotalamoa', sub: 'talamoaren behean: hormonak eta haien erregulazioa' }],
      note: 'Talamoaren beheko aldean hipotalamoa: hormonak ekoizteko eta horien erregulazioa kontrolatzeko funtzioak',
    },
    {
      to: { pineal: 1 },
      run: [0.1, 0.6],
      cam: SAG(3.0, 0.1, -0.45, 96, 8),
      fit: false,
      glide: 0.05,
      dim: ['epitalamoa', 'guruin-pineala'],
      names: [
        { id: 'epitalamoa', text: 'Epitalamoa', sub: 'talamoaren goian' },
        { id: 'guruin-pineala', text: 'Guruin pineala (epifisia)', sub: 'melatonina: loaldi-esnaldi zikloak', from: 0.35 },
      ],
      note: 'Talamoaren goiko aldean epitalamoa; barruan guruin pineala edo epifisia, loaldi-esnaldi zikloak kontrolatzen dituena melatonina ekoiztuz',
    },
  ],
};
export const Thalamus19 = stage(specThal, VENTRICLES19_GEO);

// ———————————————————————— 10.4.1 Hipofisia ————————————————————————

export const S_HYP = [0, 0.16, 0.34, 0.5, 0.66, 0.83] as const;
const specHyp: StageSpec<BrainPose, BrainOpts> = {
  S: S_HYP,
  pose: endPose(specThal).pose,
  opts: {},
  site: SITE19.head,
  arrive: 'Hipotalamoaren azpira: hipofisia nola sortzen den',
  caption: CAP,
  key: [
    { color: C19.dien, text: 'neurohipofisia (hipotalamotik)' },
    { color: '#e07a4e', text: 'adenohipofisia (estomodeotik)' },
    { color: C19.ecto, text: 'estomodeoaren sabaia' },
  ],
  steps: [
    {
      to: { hyp: 0.22, pineal: 0 },
      run: [0.1, 0.9],
      cam: SAG(2.6, -0.62, 0.3, 90, 6),
      fit: false,
      glide: 0.07,
      dim: ['hipotalamoa', 'hipofisi-infundibulua'],
      names: [
        { id: 'hipotalamoa', text: 'Hipotalamotik eskegita', sub: 'hipofisia: egitura hormonala' },
        { id: 'hipofisi-infundibulua', text: 'Infundibulua', sub: 'lotura', from: 0.5 },
      ],
      note: 'Hipofisia egitura hormonala da: hipotalamotik eskegita dago, eta bien arteko loturari infundibulua deitzen zaio',
    },
    {
      to: { hyp: 0.5 },
      run: [0.05, 0.9],
      cam: SAG(2.9, -0.7, 0.34, 96, 6),
      fit: false,
      glide: 0.06,
      dim: ['hipofisi-infundibulua', 'rathke-poltsa', 'estomodeoa'],
      names: [
        { id: 'hipofisi-infundibulua', text: 'Infundibulua', sub: 'hipotalamotik beherantz' },
        { id: 'rathke-poltsa', text: 'Hipofisi poltsa', sub: 'estomodeoaren sabaitik gorantz', from: 0.3 },
        { id: 'estomodeoa', text: 'Estomodeoa', small: true, from: 0.45 },
      ],
      note: 'Bi jatorri: hipotalamoan luzapen bat (infundibulua) beherantz, eta estomodeoaren sabaian beste bat (hipofisi poltsa) gorantz; elkartzean hipofisia osatzen da',
    },
    {
      to: { hyp: 0.8 },
      run: [0.05, 0.9],
      cam: SAG(2.6, -0.72, 0.34, 96, 6),
      fit: false,
      glide: 0.05,
      dim: ['adenohipofisia', 'rathke-poltsa', 'estomodeoa'],
      names: [
        { id: 'rathke-poltsa', p: [0.054, -0.657, 0.329], text: 'Hipofisi poltsa', small: true },
        { id: 'adenohipofisia', text: 'Adenohipofisia', sub: 'poltsa estomodeotik askatu', from: 0.4 },
      ],
      note: 'Hipofisi poltsa estomodeotik askatzen da (harekin zuen lotura galduz): hortik adenohipofisia garatzen da',
    },
    {
      to: { hyp: 1, lobes: 1 },
      run: [0.05, 0.8],
      cam: SAG(2.2, -0.62, 0.3, 90, 6),
      fit: false,
      glide: 0.05,
      dim: ['neurohipofisia', 'hipofisi-infundibulua'],
      names: [
        { id: 'neurohipofisia', text: 'Neurohipofisia', sub: 'infundibulutik: hipotalamoari lotuta', from: 0.3 },
        { id: 'adenohipofisia', small: true, from: 0.5 },
      ],
      note: 'Infundibulua hipotalamoarekin lotuta mantentzen da, eta infundibulutik neurohipofisia eratzen da',
    },
    {
      to: { horm: 1, flow: 10 },
      run: [0.02, 1],
      cam: SAG(2.4, -0.62, 0.3, 92, 6),
      fit: false,
      glide: 0.05,
      dim: ['adenohipofisia', 'neurohipofisia', 'hipotalamoa'],
      names: [
        { id: 'adenohipofisia', text: 'Adenohipofisia', sub: 'hormonak ekoizten ditu (somatotropina, prolaktina)' },
        { id: 'neurohipofisia', text: 'Neurohipofisia', sub: 'hipotalamoko hormonak askatzen ditu', from: 0.35 },
      ],
      note: 'Adenohipofisiak hormonak ekoizten ditu (adib. somatotropina eta prolaktina); neurohipofisiak hipotalamoan sortutako hormonak askatzen ditu',
    },
    {
      to: { horm: 0 },
      run: [0.3, 0.8],
      cam: SAG(3.6, -0.5, 0.25, 90, 6),
      fit: false,
      glide: 0.06,
      dim: ['hipofisia', 'adenohipofisia', 'neurohipofisia'],
      names: [
        { id: 'hipofisia', text: '2. hilabetearen bukaeran eratuta', sub: '3. astean hasi, bi hilabete inguru' },
        { id: 'adenohipofisia', small: true, from: 0.3 },
        { id: 'neurohipofisia', small: true, from: 0.4 },
      ],
      note: 'Bi luzapenak 3. astean hasten dira, eta prozesuak bi hilabete inguru irauten du: 2. hilabetearen bukaeran hipofisia guztiz eratuta dago, bi atalekin',
    },
  ],
};
export const Hypophysis19 = stage(specHyp);

// ———————————————————————— 11. Bikote kranealak ————————————————————————

export const S_CN = [0, 0.16, 0.24, 0.32, 0.41, 0.49, 0.57, 0.65, 0.74, 0.82, 0.9] as const;
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
const CN_IDS = ['usaimen-nerbioa', 'nerbio-optikoa', 'nerbio-begi-eragilea', 'nerbio-troklearra', 'nerbio-trigeminoa', 'nerbio-aldentzailea', 'aurpegi-nerbioa', 'nerbio-estatoakustikoa', 'nerbio-glosofaringeoa', 'nerbio-bagoa', 'nerbio-osagarria', 'nerbio-hipoglosoa'];
const specCn: StageSpec<BrainPose, BrainOpts> = {
  S: S_CN,
  pose: endPose(specHyp).pose,
  opts: {},
  site: SITE19.head,
  arrive: 'Garun osoa azpitik: hemendik ateratzen dira bikote kranealak',
  caption: CAP_WHOLE + ', azpitik ikusita (ikuspegi bentrala): aurrealdea goian',
  key: [
    { color: C19.nerve, text: 'bikote kranealak' },
    { color: C19.brain, text: 'burmuina' },
  ],
  steps: [
    {
      to: { whole: 1, nerves: 12, lobes: 0 },
      run: [0.05, 0.95],
      cam: BELOW(7.6, -0.7, 0.0),
      fit: false,
      glide: 0.09,
      dim: CN_IDS,
      names: CN_IDS.map((id, i) => ({ id, p: `${id}:below`, text: ROMAN[i], small: true, from: 0.04 + i * 0.03 })),
      note: '12 bikote kraneal, aurretik atzera',
    },
    {
      cam: BELOW(3.6, -0.4, 0.75),
      fit: false,
      glide: 0.06,
      dim: ['usaimen-nerbioa'],
      names: [{ id: 'usaimen-nerbioa', text: 'I. Usaimen nerbioa', sub: 'nerbio txiki asko: usaimen erraboila ikusten da' }],
      note: 'Usaimen nerbioa: ez da nerbio trinko bakarra, sudur-barrunbearen sabaiko zuntz txiki askok osatzen dute; burmuinean usaimen erraboilak ikusten dira',
    },
    {
      cam: BELOW(3.6, -0.5, 0.55),
      fit: false,
      glide: 0.05,
      dim: ['nerbio-optikoa'],
      names: [{ id: 'nerbio-optikoa', text: 'II. Ikusmen nerbioa', sub: 'begietatik: prestaketetan beti moztuta' }],
      note: 'Ikusmen nerbioa: begietatik burmuinera; burmuina ateratzean moztu behar da (begiak kraneoan geratzen dira), horregatik beti moztuta. Lehen eta bigarren bikoteak ia ez dira ikusten',
    },
    {
      cam: BELOW(4.2, -0.6, 0.1),
      fit: false,
      glide: 0.05,
      dim: ['nerbio-begi-eragilea', 'nerbio-troklearra', 'nerbio-aldentzailea'],
      names: [
        { id: 'nerbio-begi-eragilea', text: 'III. Begi-eragilea' },
        { id: 'nerbio-troklearra', text: 'IV. Troklearra', from: 0.18 },
        { id: 'nerbio-aldentzailea', text: 'VI. Aldentzailea', from: 0.32 },
      ],
      note: 'III., IV. eta VI.: begiaren mugimendu guztiak (borondatezkoak)',
      warn: true,
    },
    {
      cam: BELOW(4.0, -0.8, -0.1, -0.35),
      fit: false,
      glide: 0.05,
      dim: ['nerbio-trigeminoa'],
      names: [{ id: 'nerbio-trigeminoa', text: 'V. Trigeminoa', sub: 'aurpegiaren sentsazioa: 3 adar' }],
      note: 'Trigeminoa: aurpegiaren sentsazio nagusia; hiru adar (oftalmikoa, maxilarra, mandibularra): aurpegiko azala, ahoa eta hortzak',
    },
    {
      cam: BELOW(4.0, -1.0, -0.35, -0.3),
      fit: false,
      glide: 0.05,
      dim: ['aurpegi-nerbioa'],
      names: [{ id: 'aurpegi-nerbioa', text: 'VII. Faziala (aurpegi nerbioa)', sub: 'adierazpen muskuluak: motorra' }],
      note: 'Faziala edo aurpegi nerbioa: aurpegiko adierazpen-muskuluen mugimendua kontrolatzen duen nerbio motor nagusia',
    },
    {
      cam: BELOW(4.0, -1.05, -0.42, -0.3),
      fit: false,
      glide: 0.05,
      dim: ['nerbio-estatoakustikoa'],
      names: [{ id: 'nerbio-estatoakustikoa', text: 'VIII. Estatoakustikoa', sub: 'oreka (bestibularra) eta entzumena (koklearra)' }],
      note: 'Estatoakustikoa: "estato" oreka, "akustiko" entzumena; belarritik burmuinera; bi adar, bestibularra (oreka) eta koklearra (entzumena)',
    },
    {
      cam: BELOW(4.2, -1.25, -0.5, -0.25),
      fit: false,
      glide: 0.05,
      dim: ['nerbio-glosofaringeoa', 'nerbio-bagoa'],
      names: [
        { id: 'nerbio-glosofaringeoa', text: 'IX. Glosofaringeoa', sub: 'ahoaren atzea eta faringea' },
        { id: 'nerbio-bagoa', text: 'X. Bagoa', sub: 'nerbio parasinpatikorik handiena', from: 0.4 },
      ],
      note: 'Glosofaringeoa: ahoaren atzeko zatiaren eta faringearen sentsazioak. Bagoa: gorputz osoko nerbio parasinpatikorik handiena',
    },
    {
      cam: BELOW(5.0, -1.6, -0.6, -0.2),
      fit: false,
      glide: 0.05,
      dim: ['nerbio-osagarria'],
      names: [{ id: 'nerbio-osagarria', text: 'XI. Osagarria (espinala)', sub: 'zati bat burmuinetik, bestea ornomuinetik' }],
      note: 'Osagarria (laguntzailea, espinala): atal bat burmuinetik eta bestea ornomuinetik; lepoa eta burua mugitzeko (esternokleidomastoideoa, trapezioa…)',
    },
    {
      cam: BELOW(4.0, -1.3, -0.25, -0.2),
      fit: false,
      glide: 0.05,
      dim: ['nerbio-hipoglosoa'],
      names: [{ id: 'nerbio-hipoglosoa', text: 'XII. Hipoglosoa', sub: 'mihiko muskuluak: mihiaren mugimendua' }],
      note: 'Hipoglosoa: mihiko muskuluak inerbatzen ditu, mihiaren mugimenduaren arduraduna',
    },
    {
      to: { stem: 1 },
      run: [0.05, 0.6],
      cam: LEFT19(5.6, [0, -0.6, -0.4], 200, 50, [0, 0]),
      fit: false,
      glide: 0.09,
      dim: ['nerbio-troklearra'],
      names: [{ id: 'nerbio-troklearra', p: [-0.12, -0.62, -0.7], text: 'IV.: alde dortsaletik', sub: 'bakarra; istmoa inguratu, bentralera' }],
      note: 'IV. bikotea alde dortsalean agertzen den bakarra da, eta istmoa inguratuz alde bentralerantz pasatzen da; beste guztiak alde bentralean',
    },
  ],
};
export const Cranial19 = stage(specCn);

// ———————————————————————— class 31 (topic 21), reshaped since for class 32: the scenes as its steps were written ————————————————————————


// ———————————————————————— class 31 (topic 21): the scenes as its notes go ————————————————————————

export const S_BMEN31 = [0, 0.26, 0.52, 0.76] as const;
const specBMen31: StageSpec<BrainPose, BrainOpts> = {
  S: S_BMEN31,
  pose: { ...BR0 },
  opts: {},
  site: SITE19.head,
  arrive: 'Ornomuinetik burura igo gara: burua erditik moztuta',
  caption: CAP,
  key: KEY19.meninges,
  steps: [
    {
      to: { men: 1 },
      run: [0.15, 0.75],
      cam: SAG(8.2, -0.4),
      fit: false,
      glide: 0.08,
      dim: ['meningeak', 'entzefaloa'],
      names: [
        { id: 'entzefaloa', text: 'Entzefaloa', sub: 'erditik moztuta' },
        { id: 'meningeak', text: 'Meningeak', sub: 'ornomuinekoen jarraipena', from: 0.6 },
      ],
      note: 'Meningeak ornomuinetik garunera jarraitzen dute: hiru mintz nerbio sistema zentral osoaren inguruan',
    },
    {
      cam: SAG(4.2, 0.9, 0.1, 90, 8),
      fit: false,
      glide: 0.06,
      dim: ['dura-materra', 'neurokraneoa'],
      names: [
        { id: 'dura-materra', text: 'Dura materra', sub: 'kraneoari itsatsita' },
        { id: 'neurokraneoa', text: 'Kraneoa', small: true, from: 0.3 },
      ],
      note: 'Garunean dura materra hezurrari (kraneoari) itsatsita dago: garunean ez dago eremu epiduralik',
      warn: true,
    },
    {
      to: { csf: 1 },
      run: [0.05, 0.4],
      cam: SAG(3.6, 1.0, -0.4, 90, 8),
      fit: false,
      glide: 0.05,
      dim: ['araknoidesa', 'eremu-azpiaraknoideoa'],
      names: [
        { id: 'araknoidesa', text: 'Araknoidesa', sub: 'dura materretik hurbil' },
        { id: 'eremu-azpiaraknoideoa', text: 'Eremu azpiaraknoideoa', sub: 'likido zefalorrakideoa', from: 0.35 },
      ],
      note: 'Araknoidesaren eta pia materraren artean eremu azpiaraknoideoa: likido zefalorrakideoa',
    },
    {
      cam: SAG(3.4, 1.0, 0.2, 90, 8),
      fit: false,
      glide: 0.05,
      dim: ['pia-materra'],
      names: [{ id: 'pia-materra', text: 'Pia materra', sub: 'garunari lotuta' }],
      note: 'Pia materra beti ehunari lotuta: garunean ere, bihurguneetan sartuz',
    },
  ],
};
export const BrainMen31 = stage(specBMen31, MENINGES19_GEO, VENTRICLES19_GEO);

export const S_THAL31 = [0, 0.24, 0.48, 0.74] as const;
const specThal31: StageSpec<BrainPose, BrainOpts> = {
  S: S_THAL31,
  pose: { ...BR0, origin: 1 },
  opts: {},
  site: SITE19.head,
  arrive: 'Xixkuetatik garun heldura: dientzefaloa talamoa da orain',
  caption: CAP,
  key: [
    { color: C19.sens, text: 'sentsitiboa' },
    { color: C19.dien, text: 'talamoa (dientzefaloa)' },
    { color: '#b48cf0', text: 'usaimena' },
  ],
  steps: [
    {
      to: { origin: 0 },
      run: [0.3, 0.9],
      cam: SAG(7.8, -0.5),
      fit: false,
      glide: 0.08,
      dim: ['entzefaloa', 'ornomuina'],
      names: [
        { id: 'talamoa', sub: 'dientzefalotik', from: 0.1 },
        { id: 'garun-hemisferioak', text: 'Kortexa', sub: 'telentzefalotik', from: 0.3 },
        { id: 'entzefaloa', small: true, from: 0.5 },
      ],
      note: 'Nerbio sistema ingurunearekin erlazionatzeko sistema nagusia da: estimulu guztiak (ikusi, usaindu, ukitu, mina…) bertatik hartzen ditugu',
    },
    {
      to: { sens: 0.5 },
      run: [0.05, 0.9],
      cam: SAG(7.2, -0.9),
      fit: false,
      glide: 0.06,
      dim: ['neurona-sentsitiboa', 'ornomuina', 'talamoa'],
      names: [{ id: 'neurona-sentsitiboa', p: [-0.127, -1.894, -0.7], text: 'Neurona sentsitiboa', sub: 'garunerantz', from: 0.3 }],
      note: 'Neurona sentsitibo batek estimulua garunerantz darama: batzuetan ornomuinean sinapsia, bestela entzefaloan egiten du lehena',
    },
    {
      cam: SAG(3.6, 0.0, -0.1, 90, 6),
      fit: false,
      glide: 0.06,
      dim: ['talamoa', 'neurona-sentsitiboa'],
      names: [{ id: 'talamoa', text: 'Talamoa', sub: 'sinapsi garrantzitsuena' }],
      note: 'Kortexera iritsi aurretik, sinapsi garrantzitsuena talamoan: hor sinapsia egin ezean ez gara sentsazioaz kontziente',
      warn: true,
    },
    {
      to: { smell: 1 },
      run: [0.1, 0.8],
      cam: SAG(4.6, 0.1, 0.3, 90, 6),
      fit: false,
      glide: 0.06,
      dim: ['usaimen-nerbioa', 'talamoa'],
      names: [
        { id: 'usaimen-nerbioa', text: 'Usaimena', sub: 'sudurretik zuzenean kortexera', from: 0.4 },
        { id: 'talamoa', small: true, from: 0.5 },
      ],
      note: 'Sentsazio guztiak talamotik, usaimena izan ezik: sudurretik zuzenean kortexera doa (primitiboena delako)',
    },
  ],
};
export const Thalamus31 = stage(specThal31, VENTRICLES19_GEO);

export const S_CX31 = [0, 0.26, 0.54, 0.76] as const;
const specCx31: StageSpec<BrainPose, BrainOpts> = {
  S: S_CX31,
  pose: endPose(specThal31).pose,
  opts: {},
  site: SITE19.head,
  arrive: 'Garun berean: talamotik kortexera',
  caption: CAP,
  key: [
    { color: C19.sens, text: 'sentsitiboa (goranzkoa)' },
    { color: C19.motor, text: 'motorra (beheranzkoa)' },
  ],
  steps: [
    {
      to: { smell: 0, sens: 1 },
      run: [0.05, 0.8],
      cam: SAG(4.8, 0.4, -0.1, 90, 8),
      fit: false,
      glide: 0.06,
      dim: ['kortex-sentsitiboa', 'kortex-motorra', 'neurona-sentsitiboa'],
      names: [
        { id: 'kortex-sentsitiboa', p: [-0.197, 1.153, -0.204], text: 'Kortex sentsitiboa', sub: 'informazioa prozesatu', from: 0.5 },
        { id: 'kortex-motorra', text: 'Kortex motorra', sub: 'erantzun motorra agindu', from: 0.75 },
      ],
      note: 'Kortexean prozesatzen da informazioa: kortex sentsitiboak kortex motorrari pasatzen dio, erantzun motor bat agintzeko',
    },
    {
      to: { motor: 1 },
      run: [0.05, 0.9],
      cam: SAG(9.6, -0.8),
      fit: false,
      glide: 0.06,
      dim: ['motoneurona', 'ornomuina'],
      names: [
        { id: 'motoneurona', p: [-0.229, 0.307, 0.025], text: 'Axoia beherantz', sub: 'gai zuritik ornomuinera', from: 0.3 },
        { id: 'kortex-motorra', p: [-0.187, 1.173, 0.1], small: true, from: 0.1 },
      ],
      note: 'Kortex motorreko neuronak axoiaren bidez beherantz bidaltzen du, gai zuritik; ornomuinaren mailan neurona motorrak aurreko sustraitik muskulura',
    },
    {
      cam: SAG(7.6, -0.6),
      fit: false,
      glide: 0.05,
      dim: ['kortex-sentsitiboa', 'kortex-motorra', 'talamoa'],
      names: [
        { id: 'kortex-motorra', p: [-0.187, 1.173, 0.1], text: 'Milisegundutan', sub: 'mina: eskua kendu' },
        { id: 'kortex-sentsitiboa', p: [-0.197, 1.153, -0.204], small: true, from: 0.3 },
      ],
      note: 'Goitik behera, sinapsi batzuen ondoren, azken moto neurona muskulura: guztia milisegundutan (mina badaukagu, eskua kendu)',
    },
    {
      to: { sens: 0, motor: 0 },
      run: [0, 0.35],
      cam: SAG(7.6, -1.0),
      fit: false,
      glide: 0.05,
      dim: ['ornomuina'],
      names: [{ id: 'ornomuina', text: 'Erreflexuak', sub: 'ornomuinean, kortexera iritsi gabe' }],
      note: 'Mugimendu erreflexuak askoz azkarragoak dira: informazio sentsitiboa ez da kortexera iristen, ornomuinean prozesatzen da',
    },
  ],
};
export const Cortex31 = stage(specCx31, VENTRICLES19_GEO);

export const S_VENT31 = [0, 0.16, 0.32, 0.48, 0.62, 0.76, 0.88] as const;
const specVent31: StageSpec<BrainPose, BrainOpts> = {
  S: S_VENT31,
  pose: endPose(specCx31).pose,
  opts: {},
  site: SITE19.head,
  arrive: 'Garun berean: orain bere barrunbeak',
  caption: CAP,
  key: [
    { color: C19.csf, text: 'bentrikuluak (likido zefalorrakideoa)' },
    { color: C19.tel, text: 'telentzefaloa' },
    { color: C19.dien, text: 'dientzefaloa' },
    { color: C19.mes, text: 'mesentzefaloa' },
  ],
  steps: [
    {
      to: { glass: 0.7, vent: 1, origin: 1 },
      run: [0.1, 0.8],
      cam: SAG(7.6, -0.7),
      fit: false,
      glide: 0.06,
      dim: ['bentrikulu-sistema', 'hodi-ependimarioa'],
      names: [
        { id: 'bentrikulu-sistema', text: 'Hodiaren barrunbea', sub: 'garunean zabaldua', from: 0.5 },
        { id: 'hodi-ependimarioa', text: 'Ependimoa', small: true, from: 0.6 },
      ],
      note: 'Nerbio sistema zentral osoa hodi neuraletik dator: ornomuinean hodi forma mantentzen du, garunean zabaldu eta estutu egiten da: xixkuak',
    },
    {
      cam: SAG(7.6, -1.2),
      fit: false,
      glide: 0.05,
      dim: ['hodi-ependimarioa', 'bentrikulu-sistema'],
      names: [
        { id: 'hodi-ependimarioa', text: 'Ependimoa', sub: 'ornomuinean' },
        { id: 'bentrikulu-sistema', text: 'Bentrikuluak', sub: 'garunean', from: 0.3 },
      ],
      note: 'Hodi bat izan denez, barnean espazio bat du: ornomuinean ependimoa (hodi ependimarioa), garunean bentrikuluak',
    },
    {
      cam: SAG(5.6, -0.2),
      fit: false,
      glide: 0.05,
      dim: ['bentrikulu-sistema'],
      names: [{ id: 'bentrikulu-sistema', text: 'Denak komunikatuta', sub: 'likido zefalorrakideoa' }],
      note: 'Bentrikuluak ez daude hutsik: likido zefalorrakideoa dabil, eta horretarako barrunbe guztiak komunikatuta daude',
    },
    {
      cam: SAG(4.0, 0.25, 0.0, 120, 18),
      fit: false,
      glide: 0.06,
      dim: ['alboko-bentrikuluak'],
      names: [{ id: 'alboko-bentrikuluak', p: [-0.021, 0.162, 0.32], text: 'Alboko bentrikuluak', sub: 'telentzefaloan, bat hemisferio bakoitzean' }],
      note: 'Telentzefaloan, hemisferio bakoitzean bat: bi alboko bentrikuluak (helduetan nahiko handiak)',
      plainNote: 'Telentzefaloan, hemisferio bakoitzean bat: bi alboko bentrikuluak',
      warn: true,
    },
    {
      cam: SAG(3.6, 0.0, 0.1, 100, 10),
      fit: false,
      glide: 0.05,
      dim: ['hirugarren-bentrikulua', 'monro-zuloak', 'talamoa'],
      names: [
        { id: 'hirugarren-bentrikulua', text: 'III. bentrikulua', sub: 'dientzefaloan, talamoaren mailan' },
        { id: 'monro-zuloak', text: 'Monro-ren zuloak', sub: 'bentrikulu arteko zuloak', from: 0.35 },
        { id: 'alboko-bentrikuluak', p: [-0.042, 0.166, 0.322], small: true, from: 0.5 },
      ],
      note: 'Dientzefaloan (talamoaren mailan) III. bentrikulua; alboko bentrikuluekin bentrikulu arteko zuloek (Monro-ren zuloak) komunikatzen dute',
    },
    {
      cam: SAG(3.4, -0.45, -0.4, 90, 6),
      fit: false,
      glide: 0.05,
      dim: ['garun-akueduktoa', 'mesentzefaloa'],
      names: [{ id: 'garun-akueduktoa', text: 'Garun akueduktoa', sub: 'mesentzefaloan: hodi estua' }],
      note: 'Mesentzefaloan ez du hodi forma galtzen: estutu egiten da, garun (mesentzefalo) akueduktoa',
    },
    {
      cam: SAG(3.8, -0.9, -0.7, 110, 6),
      fit: false,
      glide: 0.05,
      dim: ['laugarren-bentrikulua', 'luschka-zuloak', 'magendie-zuloa'],
      names: [
        { id: 'laugarren-bentrikulua', text: 'IV. bentrikulua', sub: 'erronbentzefaloan: erronbo forma' },
        { id: 'luschka-zuloak', text: 'Luschka zuloak', sub: '2, alboetan', from: 0.3 },
        { id: 'magendie-zuloa', text: 'Magendie zuloa', sub: 'erdian', from: 0.45 },
      ],
      note: 'Erronbentzefaloan IV. bentrikulua, erronbo formakoa: 3 zulo ditu, 2 alboko (Luschka) eta erdiko bat (Magendie)',
    },
  ],
};
export const Ventricles31 = stage(specVent31);

export const S_CSF31 = [0, 0.18, 0.36, 0.56, 0.78] as const;
const specCsf31: StageSpec<BrainPose, BrainOpts> = {
  S: S_CSF31,
  pose: endPose(specVent31).pose,
  opts: {},
  site: SITE19.head,
  arrive: 'Bentrikulu berak: orain likidoa nondik datorren eta nora doan',
  caption: CAP,
  key: [
    { color: C19.csf, text: 'likido zefalorrakideoa' },
    { color: '#e0607a', text: 'sare koroideak' },
    { color: C19.arach, text: 'araknoidesa' },
  ],
  steps: [
    {
      to: { origin: 0, men: 1, csf: 1 },
      run: [0.05, 0.7],
      cam: SAG(8.4, -0.4),
      fit: false,
      glide: 0.06,
      dim: ['likido-zefalorrakideoa', 'bentrikulu-sistema'],
      names: [
        { id: 'eremu-azpiaraknoideoa', text: 'Barrutik eta kanpotik', sub: 'kolpeak amortiguatu', from: 0.5 },
        { id: 'bentrikulu-sistema', text: 'Bentrikuluak', small: true, from: 0.3 },
        { id: 'hodi-ependimarioa', text: 'Ependimoa', small: true, from: 0.6 },
      ],
      note: 'Likido zefalorrakideoa 5. astean ekoizten hasten da: nerbio sistema zentralaren barrutik eta kanpotik doa, kolpeetatik babesteko',
    },
    {
      to: { plex: 1 },
      run: [0.05, 0.6],
      cam: SAG(4.6, -0.2, -0.3, 100, 10),
      fit: false,
      glide: 0.06,
      dim: ['sare-koroideak', 'bentrikulu-sistema'],
      names: [
        { id: 'sare-koroideak', text: 'Sare koroideak', sub: 'bentrikuluen sabaian: ekoizten dute', from: 0.3 },
        { id: 'bentrikulu-sistema', text: 'Bentrikuluak', small: true, from: 0.5 },
      ],
      note: 'Sare koroideak (arteriolak eta benulak) alboko, 3. eta 4. bentrikuluen sabaian: haiek ekoizten dute likidoa etengabe',
    },
    {
      to: { flowShow: 1, flow: 6 },
      run: [0.02, 1],
      cam: SAG(5.4, -0.3, -0.2),
      fit: false,
      glide: 0.06,
      dim: ['bentrikulu-sistema', 'monro-zuloak', 'garun-akueduktoa', 'laugarren-bentrikulua'],
      names: [
        { id: 'monro-zuloak', text: 'Monro', small: true },
        { id: 'bentrikulu-sistema', text: 'Bentrikuluak', small: true, from: 0.15 },
        { id: 'garun-akueduktoa', text: 'Akueduktoa', small: true, from: 0.3 },
        { id: 'laugarren-bentrikulua', text: 'IV. bentrikulua', small: true, from: 0.5 },
      ],
      note: 'Alboko bentrikuluetatik Monro-ren zuloetatik 3.era, akueduktotik 4.era',
    },
    {
      to: { flow: 13 },
      run: [0, 1],
      cam: SAG(8.4, -0.5),
      fit: false,
      glide: 0.06,
      dim: ['likido-zefalorrakideoa', 'luschka-zuloak', 'magendie-zuloa', 'hodi-ependimarioa'],
      names: [
        { id: 'magendie-zuloa', text: '3 zulotik kanpora', sub: 'Luschka eta Magendie' },
        { id: 'hodi-ependimarioa', text: 'Ependimotik behera', sub: 'zati bat', from: 0.4 },
        { id: 'luschka-zuloak', small: true, from: 0.5 },
      ],
      note: '4. bentrikuluan 3 zulotatik kanporatzen da (2 alboko eta erdiko bat); zati batek ependimotik jarraitzen du',
    },
    {
      to: { flow: 20 },
      run: [0, 1],
      cam: SAG(8.8, -0.2),
      fit: false,
      glide: 0.06,
      dim: ['eremu-azpiaraknoideoa', 'araknoidesa', 'pia-materra'],
      names: [{ id: 'eremu-azpiaraknoideoa', text: 'Eremu azpiaraknoideoa', sub: 'pia eta araknoidesaren artean; gero zainetara' }],
      note: 'Kanpotik eremu azpiaraknoideotik (pia materra eta araknoidesaren artean) doa, eta kraneoko egitura batzuetatik zain-sistemak berxurgatzen du',
    },
  ],
};
export const Csf31 = stage(specCsf31, VENTRICLES19_GEO, MENINGES19_GEO);

// ———————————————————————— topic 20 (both classes): grey and white, the brainstem, telencephalon, commissures ————————————————————————

/** 20. gaia, 1: the cord keeps its grey matter inside, the brain turns it outside (brain-model `matter`). */
export const S_MATTER = [0, 0.36, 0.7] as const;
const specMatter: StageSpec<BrainPose, BrainOpts> = {
  S: S_MATTER,
  pose: { ...BR0 },
  opts: {},
  site: SITE19.head,
  arrive: 'Burua erditik moztuta: ornomuina eta garuna, barrutik',
  caption: CAP,
  key: [
    { color: C19.grey, text: 'gai grisa (somak)' },
    { color: C19.white, text: 'gai zuria (axoiak)' },
  ],
  steps: [
    {
      to: { matter: 1 },
      run: [0.2, 0.8],
      cam: SAG(8.6, -1.5, -0.4, 90, 4),
      fit: false,
      glide: 0.08,
      dim: ['gai-grisa', 'ornomuina'],
      names: [
        { id: 'gai-grisa', text: 'Ornomuinean: gai grisa barnean', sub: 'somak, H forman', from: 0.4 },
        { id: 'ornomuina', text: 'Gai zuria kanpoan', sub: 'axoiak', from: 0.6 },
      ],
      note: 'Ornomuinean gai grisa (somak, H forman) barnean dago eta gai zuria (axoiak) kanpoan',
    },
    {
      cam: SAG(7.6, 0.25, 0.05, 90, 6),
      fit: false,
      glide: 0.06,
      dim: ['garun-hemisferioak', 'gai-zuria'],
      names: [
        { id: 'garun-hemisferioak', text: 'Burmuinean: gai grisa kanpoan', sub: 'somak kanpoko geruzan (kortexa)' },
        { id: 'gai-zuria', text: 'Gai zuria barnean', sub: 'axoiak barnerantz', from: 0.35 },
      ],
      note: 'Burmuinean alderantziz: gai grisa kanpoaldean (somak kanpoko geruzan) eta gai zuria barnean (axoiak barnerantz)',
    },
    {
      cam: SAG(9.2, -0.7, -0.2, 90, 4),
      fit: false,
      glide: 0.05,
      dim: ['gai-grisa', 'gai-zuria', 'ornomuina', 'garun-hemisferioak'],
      names: [
        { id: 'gai-zuria', text: 'Garunean: zuria barnean', small: true },
        { id: 'gai-grisa', text: 'Ornomuinean: grisa barnean', small: true },
      ],
      note: 'Garun eta ornomuinaren arteko desberdintasun garrantzitsuenetako bat: gai grisa eta zuria alderantziz kokatuta',
    },
  ],
};
export const Matter20 = stage(specMatter);

/** 20. gaia, 2.1: medulla, pons and midbrain, one unit (the cerebrum fades: brain-model `stem`). */
export const S_STEM = [0, 0.3, 0.62] as const;
const specStem: StageSpec<BrainPose, BrainOpts> = {
  S: S_STEM,
  pose: { ...BR0 },
  opts: {},
  site: SITE19.head,
  arrive: 'Burua erditik moztuta: garunaren behekaldea',
  caption: CAP,
  key: [
    { color: C19.mes, text: 'mesentzefaloa' },
    { color: C19.met, text: 'zubia' },
    { color: C19.miel, text: 'erraboila' },
  ],
  steps: [
    {
      to: { origin: 0.6 },
      run: [0.2, 0.8],
      cam: SAG(7.2, -0.5, -0.1, 90, 4),
      fit: false,
      glide: 0.08,
      dim: ['erraboila', 'zubia', 'mesentzefaloa'],
      names: [
        { id: 'mesentzefaloa', text: 'Mesentzefaloa', from: 0.2 },
        { id: 'zubia', text: 'Zubia', sub: 'IV. bentrikuluaren zorua', from: 0.35 },
        { id: 'erraboila', text: 'Erraboila', from: 0.5 },
      ],
      note: 'Erraboila, zubia eta mesentzefaloa funtzionalki estuki erlazionatuta daude: fisiologikoki unitate bakarra',
    },
    {
      to: { stem: 1 },
      run: [0.05, 0.7],
      cam: SAG(4.6, -0.8, -0.3, 100, 6),
      fit: false,
      glide: 0.06,
      dim: ['entzefalo-enborra', 'erraboila', 'zubia', 'mesentzefaloa'],
      names: [
        { id: 'entzefalo-enborra', p: [-0.143, -0.861, -0.092], text: 'Entzefalo-enborra', sub: 'erraboila + zubia + mesentzefaloa', from: 0.3 },
        { id: 'mesentzefaloa', text: 'Mesentzefaloa', small: true },
        { id: 'zubia', text: 'Zubia', small: true },
        { id: 'erraboila', text: 'Erraboila', small: true },
      ],
      note: 'Hiru egitura anatomikoen baturari entzefalo-enborra (enbor entzefalikoa) deitzen zaio',
    },
    {
      to: { nerves: 1 },
      run: [0.05, 0.7],
      cam: SAG(5.0, -0.9, -0.1, 70, 4),
      fit: false,
      glide: 0.05,
      dim: ['entzefalo-enborra', 'bikote-kranealak'],
      names: [
        { id: 'entzefalo-enborra', text: 'Enborretik', sub: 'bikote kraneal gehienak' },
        { id: 'bikote-kranealak', text: 'Bikote kranealak', small: true, from: 0.4 },
      ],
      note: 'Bikote kraneal gehienak entzefalo-enborretik ateratzen dira; ornomuineko eskema (oinalde eta hegal plakak) aldatuz doa',
    },
  ],
};
export const Stem20 = stage(specStem);

/** 20. gaia, 2.4: the hemispheres, the cortex, the basal nuclei and the internal capsule. */
export const S_TEL = [0, 0.17, 0.34, 0.52, 0.7, 0.86] as const;
const specTel: StageSpec<BrainPose, BrainOpts> = {
  S: S_TEL,
  pose: { ...BR0 },
  opts: {},
  site: SITE19.head,
  arrive: 'Garun berean: telentzefaloa, hemisferioak',
  caption: CAP,
  key: [
    { color: C19.tel, text: 'telentzefaloa' },
    { color: '#b48fd6', text: 'oinaldeko nukleoak' },
    { color: C19.white, text: 'gai zuria (axoiak)' },
  ],
  steps: [
    {
      to: { origin: 1 },
      run: [0.1, 0.6],
      cam: SAG(7.4, 0.1, 0.1, 90, 6),
      fit: false,
      glide: 0.08,
      dim: ['garun-hemisferioak', 'talamoa'],
      names: [
        { id: 'garun-hemisferioak', text: 'Bi xixku telentzefaliko', sub: 'handitu: hemisferioak' },
        { id: 'talamoa', text: 'Dientzefaloa', sub: 'hemisferioek estalita', from: 0.4 },
      ],
      note: 'Bi xixku hedatzen dira: biak handituko dira hemisferioak sortuz eta dientzefaloa estaliko dute',
    },
    {
      to: { origin: 0, vent: 1, plex: 1, glass: 0.45 },
      run: [0.05, 0.6],
      cam: SAG(5.6, 0.35, 0.0, 80, 14),
      fit: false,
      glide: 0.06,
      dim: ['alboko-bentrikuluak', 'sare-koroideak'],
      names: [
        { id: 'alboko-bentrikuluak', text: 'Alboko bentrikuluak', sub: 'hemisferio bakoitzean bat', from: 0.3 },
        { id: 'sare-koroideak', text: 'Sare koroideak', small: true, from: 0.5 },
      ],
      note: 'Hemisferio bakoitzean bentrikulu sistemaren osagai bat: alboko bentrikuluak, sare koroideekin',
    },
    {
      to: { vent: 0, plex: 0, glass: 0, matter: 1 },
      run: [0.05, 0.6],
      cam: SAG(6.0, 0.5, 0.15, 64, 18),
      fit: false,
      glide: 0.06,
      dim: ['garun-hemisferioak', 'gai-zuria'],
      names: [
        { id: 'garun-hemisferioak', text: 'Kortexa: gai grisa kanpoan', sub: 'bihurguneak: kraneoak mugatzen du' },
        { id: 'gai-zuria', text: 'Gai zuria barnean', from: 0.35 },
      ],
      note: '5. astean kortexa lamina fina da; loditzean, kraneoak eremua mugatzen duenez, bihurguneak eratzen dira. Barnean gai zuria, kanpoan grisa',
    },
    {
      to: { matter: 0, nuclei: 1, glass: 0.85 },
      run: [0.05, 0.6],
      cam: SAG(4.6, 0.2, 0.05, 58, 16),
      fit: false,
      glide: 0.06,
      dim: ['oinaldeko-nukleoak', 'nukleo-kaudatua', 'nukleo-lentikularra'],
      names: [
        { id: 'nukleo-kaudatua', text: 'Nukleo kaudatua', from: 0.3 },
        { id: 'nukleo-lentikularra', text: 'Nukleo lentikularra', sub: '6. astetik', from: 0.45 },
        { id: 'oinaldeko-nukleoak', p: [-0.657, -0.117, 0.142], text: 'Oinaldeko nukleoak', small: true, from: 0.6 },
      ],
      note: 'Hemisferioen oinaldean oinaldeko nukleoak, 6. astean eratzen hasiak: nukleo kaudatua eta nukleo lentikularra',
    },
    {
      cam: SAG(4.4, 0.0, -0.05, 52, 12),
      fit: false,
      glide: 0.05,
      dim: ['barneko-kapsula', 'oinaldeko-nukleoak'],
      names: [
        { id: 'barneko-kapsula', text: 'Barneko kapsula', sub: 'beheranzko eta goranzko bideen axoiak', from: 0.2 },
        { id: 'oinaldeko-nukleoak', text: 'Oinaldeko nukleoen artetik', small: true, from: 0.4 },
      ],
      note: 'Telentzefalotik beherantz eta ornomuinetik gorantz doazen bideek oinaldeko nukleoetan barneko kapsula osatzen dute',
    },
    {
      cam: SAG(5.2, 0.1, 0.05, 60, 14),
      fit: false,
      glide: 0.05,
      dim: ['oinaldeko-nukleoak', 'nukleo-kaudatua', 'nukleo-lentikularra'],
      names: [
        { id: 'oinaldeko-nukleoak', text: 'Oinaldeko nukleoak', sub: 'borondatezko mugimenduen HASIERA, jarrera' },
        { id: 'nukleo-kaudatua', text: 'Parkinson, Huntington', small: true, from: 0.4 },
        { id: 'nukleo-lentikularra', p: [-0.666, -0.107, 0.108], text: 'Nukleo lentikularra', small: true, from: 0.5 },
      ],
      note: 'Oinaldeko nukleoak borondatezko mugimenduen hasieraz eta gorputz jarreraren doikuntzaz arduratzen dira; Parkinson eta Huntington gaixotasunekin lotuta',
      warn: true,
    },
  ],
};
export const Tel20 = stage(specTel, VENTRICLES19_GEO);

/** 20. gaia, 2.4.1: the commissures, the anterior and posterior first, then the corpus callosum from front to back. */
export const S_COMM = [0, 0.3, 0.62] as const;
const specComm: StageSpec<BrainPose, BrainOpts> = {
  S: S_COMM,
  pose: { ...BR0 },
  opts: {},
  site: SITE19.head,
  arrive: 'Garun berean: bi hemisferioak lotzen dituzten bideak',
  caption: CAP,
  key: [{ color: C19.white, text: 'komisurak (gai zuria)' }],
  steps: [
    {
      to: { comm: 0.3, glass: 0.3 },
      run: [0.15, 0.8],
      cam: SAG(4.4, -0.05, 0.05, 96, 6),
      fit: false,
      glide: 0.08,
      dim: ['komisurak', 'aurreko-komisura', 'atzeko-komisura'],
      names: [
        { id: 'aurreko-komisura', text: 'Aurreko komisura', sub: 'aurrekaldean', from: 0.4 },
        { id: 'atzeko-komisura', text: 'Atzeko komisura', sub: 'epitalamoaren mailan', from: 0.55 },
      ],
      note: 'Bi hemisferioak axoi mielinizatuzko bideek lotzen dituzte (gai zuria): komisurak. Aurrean aurreko komisura, atzean atzeko komisura',
    },
    {
      to: { comm: 1 },
      run: [0.05, 0.95],
      cam: SAG(5.8, 0.35, 0.0, 92, 8),
      fit: false,
      glide: 0.06,
      dim: ['gorputz-kailukara'],
      names: [{ id: 'gorputz-kailukara', text: 'Gorputz kailukara', sub: '10. astetik, aurretik atzera', from: 0.25 }],
      note: 'Komisura nagusia gorputz kailukara da: 10. astean eratzen da, aurrekaldetik atzekaldera luzatuz',
    },
    {
      to: { glass: 0 },
      run: [0, 0.4],
      cam: SAG(6.6, 0.15, 0.0, 70, 12),
      fit: false,
      glide: 0.05,
      dim: ['komisurak', 'gorputz-kailukara', 'aurreko-komisura', 'atzeko-komisura'],
      names: [
        { id: 'gorputz-kailukara', text: 'Gorputz kailukara', small: true },
        { id: 'aurreko-komisura', text: 'Aurrekoa', small: true },
        { id: 'atzeko-komisura', text: 'Atzekoa', small: true },
      ],
      note: 'Hiru komisura: aurrekoa, atzekoa eta gorputz kailukara; informazioa hemisferio batetik bestera',
    },
  ],
};
export const Comm20 = stage(specComm);
