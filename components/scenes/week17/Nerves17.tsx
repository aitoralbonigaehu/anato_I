'use client';

import './HeadMap'; // first: common.tsx and HeadMap.tsx import each other, and HeadMap needs ARCH at load
import type { V3 } from '@/lib/three-d/math';
import { ARCH, BELOW, FRONT, poseStage17, type Step } from './common';
import { NP0, nerveEnd, nerveModel, PAIRS, type NerveOpts, type NervePose } from './nerves-model';

/**
 * The cranial nerves (nerves-model.ts): the twelve pairs at the brain's base as the notes' figure of 2.1, and the
 * vagus (2.6.1) growing on from its stump down the neck and into the chest and gut.
 */

const build = (pose: NervePose) => nerveModel(pose);
const CAP_BASE = 'Garuna behetik (apunteetako irudia bezala): aurrealdea goian, gorputzaren ezkerra zure eskuinean';
const CAP_BODY = 'Bagoa aurretik: gorputzaren ezkerra zure eskuinean';

const ALL = [...PAIRS.map((p) => ({ n: p.n, id: p.id as string })), { n: 'X', id: 'bagoa' }];
const NUM = (ids?: readonly string[]) =>
  ALL.filter((a) => !ids || ids.includes(a.id)).flatMap((a) => [1, -1].map((s) => ({ p: nerveEnd(a.id, s as 1 | -1), text: a.n, dy: -6 })));

/** A name at the pair's end: odd ones on the viewer's left, even ones on the right, so both columns share them. */
const nameOf = (id: string, text: string, side: 1 | -1, sub?: string) => ({ id, p: nerveEnd(id, side) as V3, text, sub });
const LEFT = -1 as const;
const RIGHT = 1 as const;

const CAM_BASE = BELOW(17.5, [0, -1, -0.5], 0, -74);
const KEY_NERVE = [
  { color: ARCH.i, text: 'V · I. arkua' },
  { color: ARCH.ii, text: 'VII · II. arkua' },
  { color: ARCH.iii, text: 'IX · III. arkua' },
  { color: ARCH.iv, text: 'X · IV.–VI. arkuak' },
] as const;

export const S_PAIRS = [0, 0.18, 0.38, 0.58, 0.74, 0.88] as const;

const FIRST_SIX = ['usaimen-nerbioa', 'ikusmen-nerbioa', 'okulomotorea', 'patetikoa', 'trigeminoa', 'kanpoko-okulomotorea'];
const LAST_SIX = ['aurpegi-nerbioa', 'belarriko-nerbioa', 'glosofaringeoa', 'bagoa', 'laguntzailea', 'hipoglosoa'];
const ARCHED = ['trigeminoa', 'aurpegi-nerbioa', 'glosofaringeoa', 'bagoa'];
const EYE = ['okulomotorea', 'patetikoa', 'kanpoko-okulomotorea'];

const TXT = {
  'usaimen-nerbioa': 'usaimena',
  'ikusmen-nerbioa': 'ikusmena',
  okulomotorea: 'okulomotorea',
  patetikoa: 'patetikoa',
  trigeminoa: 'trigeminoa',
  'kanpoko-okulomotorea': 'kanpoko okul.',
  'aurpegi-nerbioa': 'aurpegia',
  'belarriko-nerbioa': 'belarria',
  glosofaringeoa: 'glosofaringeoa',
  bagoa: 'bagoa',
  laguntzailea: 'laguntzailea',
  hipoglosoa: 'hipoglosoa',
};

const pairsSteps: Step<NervePose, NerveOpts>[] = [
  {
    cam: CAM_BASE,
    fit: false,
    marks: NUM(),
    note: '12 bikote kraneal: binaka, ezkerra eta eskuina, garunetik ateratzen dira',
  },
  {
    cam: CAM_BASE,
    fit: false,
    glide: 0.08,
    dim: FIRST_SIX,
    marks: NUM(FIRST_SIX),
    names: [
      nameOf('usaimen-nerbioa', 'I. usaimen-nerbioa', LEFT),
      nameOf('ikusmen-nerbioa', 'II. ikusmen-nerbioa', RIGHT),
      nameOf('okulomotorea', 'III. okulomotorea', LEFT),
      nameOf('patetikoa', 'IV. patetiko-troklearra', RIGHT),
      nameOf('trigeminoa', 'V. trigeminoa', LEFT),
      nameOf('kanpoko-okulomotorea', 'VI. kanpoko okulomotorea', RIGHT),
    ],
    note: 'Aurretik atzera zenbatzen dira, zenbaki erromatarrekin',
  },
  {
    cam: CAM_BASE,
    fit: false,
    glide: 0.08,
    dim: LAST_SIX,
    marks: NUM(LAST_SIX),
    names: [
      nameOf('aurpegi-nerbioa', 'VII. aurpegi-nerbioa', LEFT),
      nameOf('belarriko-nerbioa', 'VIII. belarriko nerbioa', RIGHT),
      nameOf('glosofaringeoa', 'IX. glosofaringeoa', LEFT),
      nameOf('bagoa', 'X. nerbio bagoa', RIGHT),
      nameOf('laguntzailea', 'XI. laguntzailea', LEFT),
      nameOf('hipoglosoa', 'XII. hipoglosoa', RIGHT),
    ],
    note: 'Atzeko sei bikoteak: enborretik ateratzen dira, VII.etik XII.era',
  },
  {
    cam: CAM_BASE,
    fit: false,
    glide: 0.08,
    dim: ARCHED,
    marks: NUM(ARCHED),
    key: KEY_NERVE,
    keyTitle: 'Nerbioa · arkua',
    names: [
      nameOf('trigeminoa', 'V. trigeminoa', LEFT, 'I. arkua'),
      nameOf('aurpegi-nerbioa', 'VII. aurpegi-nerbioa', RIGHT, 'II. arkua'),
      nameOf('glosofaringeoa', 'IX. glosofaringeoa', LEFT, 'III. arkua'),
      nameOf('bagoa', 'X. nerbio bagoa', RIGHT, 'IV. eta VI. arkuak'),
    ],
    note: 'Arku bakoitzak nerbio bat: V, VII, IX eta X. Beste zortziak ez daude arkuekin lotuta',
  },
  {
    cam: CAM_BASE,
    fit: false,
    glide: 0.08,
    dim: EYE,
    marks: NUM(EYE),
    names: [
      nameOf('okulomotorea', 'III. okulomotorea', LEFT, 'begia mugitu'),
      nameOf('patetikoa', 'IV. patetiko-troklearra', RIGHT, 'begia mugitu'),
      nameOf('kanpoko-okulomotorea', 'VI. kanpoko okulomotorea', LEFT, 'begia mugitu'),
    ],
    note: 'III, IV eta VI: begien mugimendua. Kraneoko zuloetatik irteten dira',
  },
  {
    cam: CAM_BASE,
    fit: false,
    glide: 0.08,
    marks: NUM(),
    key: KEY_NERVE,
    keyTitle: 'Nerbioa · arkua',
    names: ALL.map((a, i) => nameOf(a.id, `${a.n}. ${(TXT as Record<string, string>)[a.id]}`, i % 2 ? RIGHT : LEFT)),
    note: 'Hiru mota: motorrak, sentsitiboak eta mistoak (axoi batzuk motorrak, beste batzuk sentsitiboak)',
  },
];

export const Pairs17 = poseStage17<NervePose, NerveOpts>(
  { S: S_PAIRS, pose: NP0, opts: {}, caption: CAP_BASE, map: 'base', near: 1, steps: pairsSteps },
  build,
);

export const S_VAGUS = [0, 0.2, 0.42, 0.64, 0.84] as const;

const FULL_BODY = FRONT(46, [0.2, -14, 0], 0, 3);
const NECK = FRONT(13, [0.2, -7.6, -0.4], 28, 4);

export const Vagus17 = poseStage17<NervePose, NerveOpts>(
  {
    S: S_VAGUS,
    pose: NP0,
    opts: {},
    caption: CAP_BODY,
    map: 'neck',
    near: 1,
    steps: [
      {
        cam: BELOW(13.2, [0, -1.4, -0.5], 0, -74),
        fit: false,
        dim: ['bagoa'],
        marks: NUM(['bagoa']),
        names: [{ id: 'bagoa', p: nerveEnd('bagoa', 1), text: 'X. nerbio bagoa', sub: 'mistoa' }],
        note: 'X. bikotea: mistoa. Garunetik ateratzen da eta IV. eta VI. arkuetara luzatzen da',
      },
      {
        to: { grow: 1, body: 1 },
        run: [0.04, 0.85],
        cam: FULL_BODY,
        fit: false,
        glide: 0.72,
        dim: ['bagoa'],
        names: ['bagoa'],
        note: 'Bagoa lepoan behera jaisten da: toraxera eta abdomenera iristen da',
      },
      {
        cam: NECK,
        fit: false,
        glide: 0.14,
        dim: ['goiko-laringe-nerbioa', 'tarteko-ertzatzailea', 'beheko-ertzatzailea'],
        names: [
          { id: 'goiko-laringe-nerbioa', text: 'Goiko laringe nerbioa', sub: 'IV. arkua' },
          { id: 'tarteko-ertzatzailea', text: 'Tarteko muskulu ertzatzailea' },
          { id: 'beheko-ertzatzailea', text: 'Beheko muskulu ertzatzailea' },
        ],
        note: 'IV. arkua: goiko laringe nerbioa → tarteko eta beheko muskulu ertzatzaileak',
      },
      {
        cam: FRONT(15, [0.5, -10.8, -0.2], 34, 4),
        fit: false,
        glide: 0.14,
        dim: ['laringe-atzerakaria', 'laringe-barneko-muskuluak'],
        names: [
          { id: 'laringe-atzerakaria', text: 'Laringe nerbio atzerakaria', sub: 'VI. arkua' },
          { id: 'laringe-barneko-muskuluak', text: 'Laringe barneko muskuluak' },
          { id: 'aorta', small: true, text: 'Aorta' },
        ],
        note: 'VI. arkua: laringe nerbio atzerakaria → laringe barneko muskuluak',
      },
      {
        cam: FULL_BODY,
        fit: false,
        glide: 0.08,
        dim: ['bagoa', 'bihotza', 'birikak', 'urdaila', 'gibela', 'tarteko-hestea', 'hestegorria'],
        names: [
          { id: 'bagoa', text: 'Nerbio bagoa', sub: 'parasinpatiko nagusia' },
          { id: 'bihotza' },
          { id: 'birikak' },
          { id: 'hestegorria' },
          { id: 'urdaila', sub: 'aurreko hestea', from: 0.52 },
          { id: 'gibela', sub: 'aurreko hestea', from: 0.52 },
          { id: 'tarteko-hestea', sub: 'tarteko hestea', from: 0.52 },
        ],
        note: 'Toraxeko errai guztiak, bihotza eta aurreko eta tarteko hesteen eratorriak inerbatzen ditu (parasinpatikoa)',
      },
    ],
  },
  build,
);
