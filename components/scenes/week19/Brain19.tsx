'use client';

import type { ComponentType } from 'react';
import type { SceneProps } from '@/components/kit';
import { Loading3D } from '@/components/kit/three/Stage3D';
import { useGeoReady } from '@/lib/three-d/offthread';
import { BR0, BRAIN19_GEO, brainModel, type BrainOpts, type BrainPose } from './brain-model';
import { KEY19, LEFT19, endPose, poseStage19, type StageSpec } from './common';
import { SITE19 } from './sites';
import { C19 } from './tones';

/**
 * Topic 19, sections 3 (the meninges round the brain), 10, 11, 12 and 13, on the head cut down the middle
 * (brain-model.ts), seen from the left: the face on the viewer's left, the back of the head on the right.
 */

const CAP = 'Burua erditik moztuta (3D eredua): ezkerretik ikusita, aurpegia zure ezkerrean';
const build = (pose: BrainPose, opts: BrainOpts) => brainModel(pose, opts);
function withGeo(View: ComponentType<SceneProps> & { geo?: string[] }) {
  function Scene(props: SceneProps) {
    return useGeoReady([BRAIN19_GEO]) ? <View {...props} /> : <Loading3D />;
  }
  Scene.geo = ['brain19', ...(View.geo ?? [])];
  Scene.spec = (View as { spec?: unknown }).spec;
  return Scene;
}
const SAG = (dist = 7, y = -0.3, z = 0, yaw = 90, elev = 3) => LEFT19(dist, [0, y, z], yaw, elev);
const stage = (spec: StageSpec<BrainPose, BrainOpts>) => withGeo(poseStage19(spec, build));

// ———————————————————————— 7. Garuneko meningeak (3) ————————————————————————

export const S_BMEN = [0, 0.26, 0.52, 0.76] as const;
const specBMen: StageSpec<BrainPose, BrainOpts> = {
  S: S_BMEN,
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
      run: [0.05, 0.6],
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
export const BrainMen19 = stage(specBMen);

// ———————————————————————— 20. Talamoa (10) ————————————————————————

export const S_THAL = [0, 0.24, 0.48, 0.74] as const;
const specThal: StageSpec<BrainPose, BrainOpts> = {
  S: S_THAL,
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
      names: [{ id: 'neurona-sentsitiboa', text: 'Neurona sentsitiboa', sub: 'garunerantz', from: 0.3 }],
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
export const Thalamus19 = stage(specThal);

// ———————————————————————— 21. Kortexa (11, 5.1) ————————————————————————

export const S_CX = [0, 0.26, 0.54, 0.76] as const;
const specCx: StageSpec<BrainPose, BrainOpts> = {
  S: S_CX,
  pose: endPose(specThal).pose,
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
        { id: 'kortex-sentsitiboa', text: 'Kortex sentsitiboa', sub: 'informazioa prozesatu', from: 0.5 },
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
        { id: 'motoneurona', text: 'Axoia beherantz', sub: 'gai zuritik ornomuinera', from: 0.3 },
        { id: 'kortex-motorra', small: true, from: 0.1 },
      ],
      note: 'Kortex motorreko neuronak axoiaren bidez beherantz bidaltzen du, gai zuritik; ornomuinaren mailan neurona motorrak aurreko sustraitik muskulura',
    },
    {
      cam: SAG(7.6, -0.6),
      fit: false,
      glide: 0.05,
      dim: ['kortex-sentsitiboa', 'kortex-motorra', 'talamoa'],
      names: [
        { id: 'kortex-motorra', text: 'Milisegundutan', sub: 'mina: eskua kendu' },
        { id: 'kortex-sentsitiboa', small: true, from: 0.3 },
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
export const Cortex19 = stage(specCx);

// ———————————————————————— 22. Bentrikuluak (12) ————————————————————————

export const S_VENT = [0, 0.16, 0.32, 0.48, 0.62, 0.76, 0.88] as const;
const specVent: StageSpec<BrainPose, BrainOpts> = {
  S: S_VENT,
  pose: endPose(specCx).pose,
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
      names: [{ id: 'alboko-bentrikuluak', text: 'Alboko bentrikuluak', sub: 'telentzefaloan, bat hemisferio bakoitzean' }],
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
        { id: 'alboko-bentrikuluak', small: true, from: 0.5 },
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
export const Ventricles19 = stage(specVent);

// ———————————————————————— 23. Likido zefalorrakideoa (13) ————————————————————————

export const S_CSF = [0, 0.18, 0.36, 0.56, 0.78] as const;
const specCsf: StageSpec<BrainPose, BrainOpts> = {
  S: S_CSF,
  pose: endPose(specVent).pose,
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
export const Csf19 = stage(specCsf);
