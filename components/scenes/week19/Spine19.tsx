'use client';

import { FRONT19, endPose, poseStage19, type StageSpec } from './common';
import { SITE19B } from './sites-b';
import { SPP0, spineModel, type SpineOpts, type SpinePose } from './spine-model';
import { C19 } from './tones';

/**
 * Topic 19, section 8 (spine-model.ts): the lower spine from behind, the arches taken away. Seen from behind, the
 * body's left is on the viewer's left.
 */

const CAP = 'Bizkarrezurraren behealdea atzetik, arkuak kenduta (3D eredua): gorputzaren ezkerra zure ezkerrean';
const build = (pose: SpinePose, opts: SpineOpts) => spineModel(pose, opts);
const BACKV = (dist = 14, y = -1.2, yaw = 180, elev = 6) => FRONT19(dist, [0, y, -0.3], yaw, elev);
const KEY = [
  { color: C19.brain, text: 'ornomuina' },
  { color: C19.nerve, text: 'nerbio espinalak' },
  { color: C19.dura, text: 'dura materra' },
  { color: C19.csf, text: 'likido zefalorrakideoa' },
];

// ———————————————————————— 15. Ornomuinaren igoera (8) ————————————————————————

export const S_RISE = [0, 0.18, 0.36, 0.56, 0.74, 0.88] as const;
const specRise: StageSpec<SpinePose, SpineOpts> = {
  S: S_RISE,
  pose: { ...SPP0 },
  opts: {},
  site: SITE19B.spine,
  arrive: 'Bizkarrezurraren behealdera, atzetik: ornomuina eta bizkarrezurra',
  caption: CAP,
  key: KEY,
  steps: [
    {
      cam: BACKV(9, 0.4),
      fit: false,
      glide: 0.08,
      dim: ['ornoak', 'nerbio-espinalak', 'ornomuina'],
      names: [
        { id: 'ornoak', text: 'Ornoak', sub: 'egitura metamerikoa' },
        { id: 'nerbio-espinalak', sub: 'ornoen arteko zuloetatik', from: 0.3 },
      ],
      note: 'Bizkarrezurra egitura metamerikoa da; ornoen arteko zuloetatik nerbio espinalak ateratzen dira',
    },
    {
      cam: BACKV(8, 0.6),
      fit: false,
      glide: 0.05,
      dim: ['nerbio-espinalak', 'ornomuina'],
      names: [{ id: 'nerbio-espinalak', text: 'Bikote bakoitza bere zulotik', sub: 'parean: horizontalki' }],
      note: 'Bizkarrezurra eta ornomuina tamainaz berdinak direnean, bikote bakoitza bere parean dagoen zulotik ateratzen da',
    },
    {
      to: { grow: 1 },
      run: [0.05, 0.95],
      cam: BACKV(14.5, -1.6),
      fit: false,
      glide: 0.06,
      dim: ['ornoak', 'nerbio-espinalak'],
      names: [
        { id: 'nerbio-espinalak', text: 'Nerbioak luzatzen dira', sub: 'zuloak urruntzen dira', from: 0.4 },
        { id: 'ornoak', small: true, from: 0.5 },
      ],
      note: 'Bizkarrezurra ornomuina baino gehiago luzatzen da: zuloak urruntzen dira, eta nerbioak harekin batera luzatzen dira',
    },
    {
      cam: BACKV(10, -0.6),
      fit: false,
      glide: 0.06,
      dim: ['ornomuinaren-konoa', 'zaldi-buztana', 'orno-L1', 'orno-L2'],
      names: [
        { id: 'ornomuina', text: 'Ornomuina', sub: 'L1–T12/L2 arte' },
        { id: 'zaldi-buztana', text: 'Zaldi buztana', sub: 'L2tik behera: nerbio solteak', from: 0.35 },
      ],
      marks: [
        { p: 'orno-L1', text: 'L1' },
        { p: 'orno-L2', text: 'L2' },
      ],
      note: '4. hilabetetik aurrera, hazkuntzaren ondorioz, ornomuina L1–T12/L2 mailetara bakarrik iristen da; hortik behera nerbio solteak: zaldi buztana',
    },
    {
      to: { sac: 1 },
      run: [0.05, 0.6],
      cam: BACKV(11, -1.4),
      fit: false,
      glide: 0.05,
      dim: ['poltsa-durala', 'dura-materra', 'araknoidesa', 'zaldi-buztana'],
      names: [{ id: 'poltsa-durala', text: 'Likidoz betetako poltsa', sub: 'dura materraren eta araknoidesaren artean', from: 0.4 }],
      note: 'Zaldi buztaneko nerbioak likido zefalorrakideoz betetako poltsa batean daude, dura materraren eta araknoidesaren artean eratua',
      warn: true,
    },
    {
      cam: BACKV(7.5, -0.4),
      fit: false,
      glide: 0.05,
      dim: ['ornomuinaren-konoa', 'zuntz-terminala'],
      names: [
        { id: 'ornomuina', text: 'Ornomuinaren konoa', sub: 'amaiera' },
        { id: 'zuntz-terminala', text: 'Lotailua', sub: 'euspena', from: 0.3 },
      ],
      note: 'Ornomuinaren amaierak kono forma du; hortik behera zaldi buztana bakarrik, eta konotik aurrera euspen funtzioa duen lotailu bat',
    },
  ],
};
export const Rise19 = poseStage19(specRise, build);

// ———————————————————————— 16. Puntzioa eta epidurala (8) ————————————————————————

export const S_PUNCT = [0, 0.24, 0.5, 0.74] as const;
const specPunct: StageSpec<SpinePose, SpineOpts> = {
  S: S_PUNCT,
  pose: endPose(specRise).pose,
  opts: {},
  site: SITE19B.spine,
  arrive: 'Bizkarrezur bera: orratzak zaldi buztanaren eremuan',
  caption: CAP,
  key: KEY,
  steps: [
    {
      cam: BACKV(11, -1.6, 205, 8),
      fit: false,
      glide: 0.06,
      dim: ['likido-zefalorrakideoa', 'poltsa-durala'],
      names: [
        { id: 'likido-zefalorrakideoa', text: 'Likido zefalorrakideoa', sub: 'NSZaren kanpotik eta barrutik; kolpeak amortiguatu' },
        { id: 'poltsa-durala', small: true, from: 0.4 },
      ],
      note: 'Puntzio lunbarrak likido zefalorrakideoaren laginak lortzeko dira; likido honek kolpeak amortiguatzen ditu',
    },
    {
      cam: BACKV(11, -1.6, 205, 8),
      fit: false,
      glide: 0.05,
      dim: ['likido-zefalorrakideoa'],
      names: [{ id: 'likido-zefalorrakideoa', text: 'Markatzaileak', sub: 'meningitisa eta beste gaixotasun batzuk' }],
      note: 'Meningitisean eta beste gaixotasun batzuetan, likidoan markatzaile bereziak agertzen dira: horregatik puntzioak',
    },
    {
      to: { needle: 1, drops: 1 },
      run: [0.05, 0.9],
      cam: BACKV(10, -1.2, 222, 10),
      fit: false,
      glide: 0.06,
      dim: ['puntzio-orratza', 'zaldi-buztana', 'likido-zefalorrakideoa', 'orno-L2'],
      names: [
        { id: 'puntzio-orratza', text: 'Puntzioa: L2 mailan', sub: 'zaldi buztanean: ornomuin trinkorik ez', from: 0.3 },
        { id: 'likido-zefalorrakideoa', small: true, from: 0.6 },
      ],
      marks: [{ p: 'orno-L2', text: 'L2' }],
      note: 'Puntzioak L2 mailan egiten dira, zaldi buztanaren eremuan: ez dago ornomuin trinkorik, eta lesioak errazago saihesten dira',
    },
    {
      to: { epi: 1, epiNeedle: 1, needle: 0, drops: 0 },
      run: [0.05, 0.85],
      cam: BACKV(9, -0.8, 230, 12),
      fit: false,
      glide: 0.06,
      dim: ['anestesia-epidurala', 'eremu-epidurala', 'dura-materra'],
      names: [
        { id: 'eremu-epidurala', text: 'Eremu epidurala', sub: 'dura materraren eta hezurraren artean' },
        { id: 'anestesia-epidurala', text: 'Anestesia epidurala', sub: 'zaldi buztaneko nerbioak lokartu', from: 0.4 },
      ],
      note: 'Anestesia epidurala dura materraren eta bizkar hezurraren arteko eremuan ematen da (gantza, nerbioak, odol hodiak): zaldi buztaneko nerbioak lokartzeko',
    },
  ],
};
export const Puncture19 = poseStage19(specPunct, build);
