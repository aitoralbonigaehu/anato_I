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
