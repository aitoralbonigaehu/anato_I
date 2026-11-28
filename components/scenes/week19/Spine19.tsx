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

// ———————————————————————— Bizkarrezur-muinaren hazkuntzaren aldaketak (5.1) ————————————————————————

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
      dim: ['ornoak', 'ornomuina'],
      names: [
        { id: 'ornomuina', text: 'Ornomuina', sub: 'hasieran bizkarrezurraren tamainakoa' },
        { id: 'ornoak', text: 'Bizkarrezurra', sub: 'askoz azkarrago hazten da', from: 0.35 },
      ],
      note: 'Hasieran enbrioia eta ornomuina tamaina berekoak dira; enbrioia hazi ahala, bizkarrezurra askoz azkarrago hazten da',
    },
    {
      cam: BACKV(8, 0.6),
      fit: false,
      glide: 0.06,
      dim: ['ornoak', 'nerbio-espinalak'],
      names: [
        { id: 'ornoak', text: 'Ornogorputzak', sub: 'aurrean; arkuak (arantza apofisia) kenduta' },
        { id: 'nerbio-espinalak', text: 'Nerbio bakoitza bere zulotik', sub: 'parean: 3. hilabetean', from: 0.35 },
      ],
      note: 'Ornoak: aurrean ornogorputza, atzean arantza apofisia. Nerbio espinal bakoitzak bere pareko zuloa du hasieran (3. hilabetean)',
    },
    {
      to: { grow: 1 },
      run: [0.05, 0.95],
      cam: BACKV(14.5, -1.6),
      fit: false,
      glide: 0.06,
      dim: ['ornoak', 'nerbio-espinalak'],
      names: [
        { id: 'nerbio-espinalak', text: 'Zuloak beherantz', sub: 'nerbioak beherago dauden zuloetatik', from: 0.4 },
        { id: 'ornoak', small: true, from: 0.2 },
      ],
      note: '20. astean ornomuina txikiagoa da, jaioberrian are gehiago, helduan askoz txikiagoa: zuloak beherantz, eta nerbioak beherago ateratzen dira',
    },
    {
      cam: BACKV(10, -0.6),
      fit: false,
      glide: 0.06,
      dim: ['ornomuinaren-konoa', 'zaldi-buztana', 'orno-L1', 'orno-L2'],
      names: [
        { id: 'ornomuina', text: 'Ornomuina', sub: 'L1/L2 inguruan amaitzen da' },
        { id: 'zaldi-buztana', text: 'Zaldi buztana', sub: 'nerbio multzoak, lotu gabe', from: 0.35 },
      ],
      marks: [
        { p: 'orno-L1', text: 'L1' },
        { p: 'orno-L2', text: 'L2' },
      ],
      note: 'Bizkarrezur osoan ez dago ornomuinik: egitura trinko bezala L1/L2 inguruan amaitzen da; hortik behera nerbio multzoak, zaldi buztana',
    },
    {
      to: { sac: 1 },
      run: [0.05, 0.6],
      cam: BACKV(11, -0.4),
      fit: false,
      glide: 0.06,
      dim: ['ornomuina', 'poltsa-durala'],
      names: [
        { id: 'ornomuina', text: 'Loditzea', sub: 'amaiera toraziko / lunbarrean (lepoan ere bai)' },
        { id: 'poltsa-durala', text: 'Zakua', sub: 'likido zefalorrakideoa barnean', small: true, from: 0.5 },
      ],
      note: 'Ornomuina lepo mailan eta amaiera toraziko/lunbarrean pixka bat loditzen da; dura materraren zakuan, likido zefalorrakideoa',
    },
    {
      cam: BACKV(7.5, -0.4),
      fit: false,
      glide: 0.06,
      dim: ['ornomuinaren-konoa', 'zuntz-terminala'],
      names: [
        { id: 'ornomuinaren-konoa', text: 'Konoa', sub: 'ornomuinaren amaiera' },
        { id: 'zuntz-terminala', text: 'Filum terminale', sub: 'pia materraren luzapena, zaldi buztanaren erdian', from: 0.3 },
      ],
      note: 'Ornomuinak amaieran kono forma hartzen du; filum terminale: pia materraren luzapena, ehun konektibozko hari mehe bat, zaldi buztanaren erdian',
    },
  ],
};
export const Rise19 = poseStage19(specRise, build);

// ———————————————————————— Likido zefalorrakideoaren lagina eta epidurala (5.1) ————————————————————————

export const S_PUNCT = [0, 0.24, 0.5, 0.74] as const;
const specPunct: StageSpec<SpinePose, SpineOpts> = {
  S: S_PUNCT,
  pose: endPose(specRise).pose,
  opts: {},
  site: SITE19B.spine,
  arrive: 'Bizkarrezur bera: orratza zaldi buztanaren eremuan',
  caption: CAP,
  key: KEY,
  steps: [
    {
      cam: BACKV(11, -1.6, 205, 8),
      fit: false,
      glide: 0.06,
      dim: ['likido-zefalorrakideoa', 'poltsa-durala'],
      names: [
        { id: 'likido-zefalorrakideoa', text: 'Likido zefalorrakideoa', sub: 'infekzioak bertan ikusten dira' },
        { id: 'poltsa-durala', small: true, from: 0.4 },
      ],
      note: 'Erdiko nerbio sisteman infekzio bat badago, likido zefalorrakideoan ikus daiteke, lagin bat ateraz',
    },
    {
      to: { needle: 1 },
      run: [0.05, 0.9],
      cam: BACKV(10, -1.2, 222, 10),
      fit: false,
      glide: 0.06,
      dim: ['puntzio-orratza', 'zaldi-buztana', 'likido-zefalorrakideoa'],
      names: [
        { id: 'puntzio-orratza', text: 'Orratza zaldi buztanetik', sub: 'ornomuina ez lesionatzeko', from: 0.3 },
        { id: 'zaldi-buztana', small: true, from: 0.6 },
      ],
      note: 'Lagina zaldi buztanaren eremutik hartzen da: orratza likido zefalorrakideoraino iritsi behar da, ornomuina ez lesionatzeko',
    },
    {
      to: { aside: 1, drops: 1 },
      run: [0.05, 0.8],
      cam: BACKV(6.5, -1.3, 200, 14),
      fit: false,
      glide: 0.06,
      dim: ['zaldi-buztana', 'puntzio-orratza', 'likido-zefalorrakideoa'],
      names: [{ id: 'zaldi-buztana', text: 'Nerbioak apartatu egiten dira', sub: 'ez da lesiorik gertatzen', from: 0.3 }],
      note: 'Orratza zaldi buztanean sartzean, nerbioak apartatu egiten dira: ez da lesiorik gertatzen',
    },
    {
      to: { epi: 1, epiNeedle: 1, needle: 0, drops: 0, aside: 0 },
      run: [0.05, 0.85],
      cam: BACKV(9, -0.8, 230, 12),
      fit: false,
      glide: 0.06,
      dim: ['anestesia-epidurala', 'eremu-epidurala', 'dura-materra'],
      names: [
        { id: 'eremu-epidurala', text: 'Eremu epidurala', sub: 'hezurraren eta dura materraren artean: odol hodiak, gantza' },
        { id: 'anestesia-epidurala', text: 'Anestesia epidurala', sub: 'zaldi buztanean', from: 0.4 },
      ],
      note: 'Anestesia epidurala zaldi buztanean, eremu epiduralean (hezurraren eta dura materraren artean). Burmuinean ez dago eremu epiduralik',
    },
  ],
};
export const Puncture19 = poseStage19(specPunct, build);

// ———————————————————————— class 31 (topic 21), reshaped since for class 32: the scenes as its steps were written ————————————————————————

export const S_RISE31 = [0, 0.18, 0.36, 0.56, 0.74, 0.88] as const;
const specRise31: StageSpec<SpinePose, SpineOpts> = {
  S: S_RISE31,
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
export const Rise31 = poseStage19(specRise31, build);

export const S_PUNCT31 = [0, 0.24, 0.5, 0.74] as const;
const specPunct31: StageSpec<SpinePose, SpineOpts> = {
  S: S_PUNCT31,
  pose: endPose(specRise31).pose,
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
export const Puncture31 = poseStage19(specPunct31, build);
