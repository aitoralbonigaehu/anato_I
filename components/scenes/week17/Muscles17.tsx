'use client';

import './HeadMap'; // first: common.tsx and HeadMap.tsx import each other, and HeadMap needs ARCH at load
import { ARCH, KEY_ARCH, orbit, poseStage17, type StageSpec } from './common';
import { MP0, muscleModel, type MuscleOpts, type MusclePose } from './muscle-model';

/**
 * Topic 17's muscles on the fetal head (the notes' p. 6 right figure): arch I (2.2.3), arch II (2.3.3), arches IV
 * and VI (2.6.3) and the closing map of section 2, every muscle in its arch's colour.
 */

const build = (pose: MusclePose) => muscleModel(pose);
const CAP = 'Fetu-burua eta lepoa (3D): muskulu bakoitza bere arkuaren kolorean';
const cam = (yaw: number, elev: number, dist: number, y: number, x = 0, z = 0, shift: [number, number] = [20, 0]) => orbit(yaw, elev, dist, [x, y, z], shift);

// ———————————————————————————— 2.2.3 Lehen arkuaren muskuluak ————————————————————————————

export const SM1 = [0, 0.2, 0.42, 0.62, 0.82] as const;

const spec1: StageSpec<MusclePose, MuscleOpts> = {
  S: SM1,
  pose: MP0,
  opts: {},
  caption: CAP,
  key: KEY_ARCH,
  map: 'face-bones',
  steps: [
    {
      to: { n1: 1 },
      run: [0.08, 0.8],
      cam: cam(62, 6, 15, 0),
      glide: 0.06,
      dim: ['barail-nerbioa'],
      names: [{ id: 'barail-nerbioa', text: 'Barail-nerbioa (V3)', sub: 'I. arkuaren nerbioa' }],
      note: 'Muskuluek migratu egiten dute: nerbioak esaten du zein arkutatik datozen',
    },
    {
      to: { m1: 1 },
      run: [0.06, 0.8],
      cam: cam(74, 8, 13, 0.1),
      glide: 0.05,
      dim: ['maseteroa', 'muskulu-tenporala'],
      names: [
        { id: 'maseteroa', sub: 'baraila igotzen du' },
        { id: 'muskulu-tenporala', text: 'Tenporala', sub: 'baraila igotzen du', from: 0.3 },
      ],
      note: 'Muskulu murtxikatzaileak: maseteroa eta tenporala, indartsuenetarikoak; baraila igotzen dute',
    },
    {
      to: { m1b: 1 },
      run: [0.06, 0.8],
      cam: cam(38, -42, 12, -1.3, 0, 0.5),
      glide: 0.05,
      dim: ['milohioideoa'],
      names: [{ id: 'milohioideoa', sub: 'ahoaren zoruaren muskulu nagusia' }],
      note: 'Milohioideoa: ahoaren zorua eratzen duen muskulu nagusiena (degluzioan)',
    },
    {
      cam: cam(62, -26, 11, -1.4, 0.2, 0.3),
      glide: 0.05,
      dim: ['digastrikoaren-aurreko-sabela', 'hioide-gorputza', 'baraila'],
      names: [
        { id: 'digastrikoaren-aurreko-sabela', text: 'Digastrikoaren aurreko sabela', sub: 'hioidetik barailera; V3' },
        { id: 'hioide-gorputza', small: true, text: 'Hioidea', from: 0.4 },
      ],
      note: 'Aurreko sabela hioide hezurretik barailera doa, eta baraila jaisten du',
    },
    {
      to: { m2c: 1 },
      run: [0.06, 0.7],
      opts: {},
      cam: cam(84, -14, 12.5, -1.1, 0.4, -0.1),
      glide: 0.05,
      dim: ['digastrikoaren-aurreko-sabela', 'digastrikoaren-atzeko-sabela'],
      names: [
        { id: 'digastrikoaren-aurreko-sabela', text: 'Aurreko sabela: I. arkua', sub: 'barail-nerbioa (V3)' },
        { id: 'digastrikoaren-atzeko-sabela', text: 'Atzeko sabela: II. arkua', sub: 'aurpegi-nerbioa (VII)', from: 0.2 },
      ],
      note: 'Muskulu bakarra, bi sabel, bi jatorri: bakoitza bere nerbioak inerbatzen du',
      warn: true,
    },
  ],
};
export const Muscles1 = poseStage17(spec1, build);

// ———————————————————————————— 2.3.3 Bigarren arkuaren muskuluak ————————————————————————————

export const SM2 = [0, 0.2, 0.4, 0.58, 0.78] as const;
const P1: MusclePose = { ...MP0, m1: 1, m1b: 1, m2c: 0, m2b: 0 };

const spec2: StageSpec<MusclePose, MuscleOpts> = {
  S: SM2,
  pose: P1,
  opts: {},
  caption: CAP,
  key: KEY_ARCH,
  map: 'face-bones',
  steps: [
    {
      to: { n2: 1 },
      run: [0.08, 0.8],
      cam: cam(58, 4, 13.5, 0),
      glide: 0.06,
      dim: ['aurpegi-nerbioa'],
      names: [{ id: 'aurpegi-nerbioa', text: 'Aurpegi-nerbioa (VII)', sub: 'II. arkuaren nerbioa' }],
      note: 'Arku honetako muskulu guztiak aurpegi-nerbioak inerbatzen ditu',
    },
    {
      to: { m2: 1 },
      run: [0.06, 0.8],
      cam: cam(14, 6, 12.5, 0.2),
      glide: 0.05,
      dim: ['muskulu-mimikoak', 'begietako-orbikularra', 'ahoko-orbikularra'],
      names: [
        { id: 'muskulu-mimikoak', text: 'Muskulu mimikoak', sub: 'aurpegiko keinuak' },
        { id: 'begietako-orbikularra', text: 'Begietako m. orbikularra', from: 0.25 },
        { id: 'ahoko-orbikularra', text: 'Ahoko m. orbikularra', from: 0.4 },
      ],
      note: 'Aurpegiko muskulu txiki guztiak: larruazalean txertatuta, larruazala mugitzeko',
    },
    {
      to: { m2b: 1 },
      run: [0.06, 0.8],
      cam: cam(128, 8, 13, 0.3),
      glide: 0.05,
      dim: ['muskulu-aurikularrak', 'okzipitala'],
      names: [
        { id: 'muskulu-aurikularrak', text: 'Muskulu aurikularrak', sub: 'belarria mugitzeko; gizakietan funtzio gabeak' },
        { id: 'okzipitala', from: 0.3 },
      ],
      note: 'Aurikularrak eta okzipitala ere II. arkutik',
    },
    {
      to: { m2c: 1 },
      run: [0.06, 0.8],
      cam: cam(86, -14, 11.5, -1.1, 0.5, -0.1),
      glide: 0.05,
      dim: ['digastrikoaren-atzeko-sabela', 'estilohioideoa', 'estiloide-apofisia'],
      names: [
        { id: 'digastrikoaren-atzeko-sabela', text: 'Digastrikoaren atzeko sabela', sub: 'VII' },
        { id: 'estilohioideoa', text: 'Estilohioideoa', sub: 'apofisi estiloideotik hioidera', from: 0.3 },
      ],
      note: 'Apunteek «hezur estilohioideoa» diote: muskulua da, apofisi estiloideotik hioidera',
      warn: true,
    },
    {
      to: { platysma: 1 },
      run: [0.06, 0.8],
      cam: cam(-46, 2, 13.5, -1.4),
      glide: 0.05,
      dim: ['platisma'],
      names: [{ id: 'platisma', text: 'Platisma', sub: 'lepoaren larruazala mugitzen du' }],
      note: 'Platisma: lepoaren larruazalaren muskulua, hau ere II. arkutik',
    },
  ],
};
export const Muscles2 = poseStage17(spec2, build);

// ———————————————————————————— 2.6.3 Laugarren eta seigarren arkuen muskuluak ————————————————————————————

export const SM4 = [0, 0.3, 0.55, 0.78] as const;
const P4: MusclePose = { ...MP0, m1: 1, m1b: 1, m2: 1, m2b: 1, m2c: 1, m3: 1 };

const spec4: StageSpec<MusclePose, MuscleOpts> = {
  S: SM4,
  pose: P4,
  opts: {},
  caption: 'Lepoa alboan eta atzealdetik (3D): faringea, laringea eta muskulu sakonak',
  key: KEY_ARCH,
  map: 'neck',
  steps: [
    {
      to: { m4: 1 },
      run: [0.06, 0.8],
      cam: cam(128, 6, 10, -2.2, 0, -0.1),
      glide: 0.06,
      dim: ['tarteko-ertzatzailea', 'beheko-ertzatzailea', 'goiko-ertzatzailea'],
      names: [
        { id: 'goiko-ertzatzailea', text: 'Goiko ertzatzailea', sub: 'III. arkua' },
        { id: 'tarteko-ertzatzailea', text: 'Tarteko ertzatzailea', sub: 'IV. arkua', from: 0.2 },
        { id: 'beheko-ertzatzailea', text: 'Beheko ertzatzailea', sub: 'IV. arkua', from: 0.4 },
      ],
      note: 'Muskulu sakonak: faringearen tarteko eta beheko ertzatzaileak IV. arkutik (goikoak III.etik)',
    },
    {
      to: { open: 1, m6: 1 },
      run: [0.08, 0.7],
      cam: cam(52, 8, 7.5, -2.45, 0.1, 0.5),
      glide: 0.05,
      dim: ['laringe-barneko-muskuluak', 'tiroide-kartilagoa', 'krikoide-kartilagoa'],
      names: [
        { id: 'laringe-barneko-muskuluak', text: 'Laringe barneko muskulu intrintsekoak', sub: 'VI. arkua' },
        { id: 'tiroide-kartilagoa', small: true, from: 0.4 },
      ],
      note: 'Tiroide kartilagoa zabalduta: barruan VI. arkuko muskulu intrintsekoak',
    },
    {
      to: { n4: 1, n6: 1, open: 0 },
      run: [0.06, 0.8],
      cam: cam(72, 4, 9.5, -2.4, 0.2, 0.2),
      glide: 0.05,
      dim: ['bagoa', 'goiko-laringe-nerbioa', 'laringe-atzerakaria', 'krikotiroidea'],
      names: [
        { id: 'bagoa', text: 'Nerbio bagoa (X)' },
        { id: 'goiko-laringe-nerbioa', text: 'Goiko laringe-nerbioa', sub: 'IV. arkua', from: 0.2 },
        { id: 'laringe-atzerakaria', text: 'Laringe-nerbio atzerakaria', sub: 'VI. arkua', from: 0.4 },
      ],
      note: 'Bagoaren bi adar: goiko laringekoa IV.ari eta atzerakaria VI.ari',
    },
    {
      cam: cam(38, 2, 11.5, -2.3),
      glide: 0.05,
      dim: ['bagoa'],
      names: [{ id: 'bagoa', text: 'Nerbio bagoa', sub: 'parasinpatiko nagusia: torax eta abdomeneko errai asko' }],
      note: 'Zein arkutakoa den, bagoaren zein adarrek inerbatzen duen esaten digu; trakea ez dator arkuetatik',
    },
  ],
};
export const Muscles4 = poseStage17(spec4, build);

// ———————————————————————————— 2 (laburpena) Arkuen mapa ————————————————————————————

export const SMAP = [0, 0.12, 0.32, 0.5, 0.66, 0.82] as const;

type Row = { r: string; c: string; k: keyof MusclePose; n: string[]; b: string[]; m: string[] };
const ROWS: Row[] = [
  {
    r: 'I',
    c: ARCH.i,
    k: 'n1',
    n: ['V: trigeminoa', '(V3 barail-nerbioa)'],
    b: ['Meckel (endekatu) → baraila', 'Mailua, ingudea', 'Hezur maxilarra, zigomatikoa,', 'tenporalaren ezkata'],
    m: ['Maseteroa, tenporala', 'Milohioideoa', 'Digastrikoa: aurreko sabela'],
  },
  {
    r: 'II',
    c: ARCH.ii,
    k: 'n2',
    n: ['VII: aurpegi-nerbioa'],
    b: ['Reichert → ointokia,', 'apofisi estiloidea,', 'hioidearen adar txikia eta', 'gorputzaren goiko erdia'],
    m: ['Mimikoak, aurikularrak', 'Okzipitala, platisma', 'Digastrikoa: atzeko sabela', 'Estilohioideoa'],
  },
  {
    r: 'III',
    c: ARCH.iii,
    k: 'n3',
    n: ['IX: glosofaringeoa'],
    b: ['Hioidearen gorputzaren', 'beheko erdia, adar nagusiak'],
    m: ['Goiko ertzatzaileak', 'Estilofaringeoa'],
  },
  {
    r: 'IV',
    c: ARCH.iv,
    k: 'n4',
    n: ['X: bagoa', '(goiko laringe-nerbioa)'],
    b: ['Tiroide kartilagoaren', 'goiko aldea'],
    m: ['Tarteko eta beheko', 'ertzatzaileak'],
  },
  {
    r: 'VI',
    c: ARCH.vi,
    k: 'n6',
    n: ['X: bagoa', '(laringe-n. atzerakaria)'],
    b: ['Tiroidearen beheko atala', 'Krikoidea, epiglotisa, aritenoidea,', 'kornikulatuak, kuneiformeak'],
    m: ['Laringe barneko muskulu', 'intrintsekoak'],
  },
];

const TX = 462;
const TW = 526;
const COLS = [TX + 12, TX + 48, TX + 166, TX + 374];
const LH = 15.6;

/** The photograph: arch → nerve → cartilages and bones → muscles, each row filling as its parts light up. */
function MapTable({ pose }: { pose: MusclePose }) {
  let y = 86;
  return (
    <g pointerEvents="none" style={{ fontFamily: 'inherit' }}>
      <rect x={TX} y={46} width={TW} height={514} rx={10} fill="rgba(13,17,28,0.86)" stroke="rgba(255,255,255,0.14)" />
      {['Arkua', 'Nerbioa', 'Kartilagoak eta hezurrak', 'Muskuluak'].map((h, i) => (
        <text key={h} x={COLS[i]} y={70} fontSize={12.5} fontWeight={700} letterSpacing={0.3} fill="#aeb7c8">
          {h}
        </text>
      ))}
      {ROWS.map((row) => {
        const lines = Math.max(row.n.length, row.b.length, row.m.length);
        const h = lines * LH + 22;
        const top = y;
        y += h;
        const v = Number(pose[row.k] ?? 0);
        const o = v < 0.02 ? 0.16 : 0.16 + 0.84 * Math.min(1, v * 1.6);
        const cell = (x: number, ls: string[], fill: string, weight = 500) =>
          ls.map((t, i) => (
            <text key={i} x={x} y={top + 22 + i * LH} fontSize={13.2} fontWeight={weight} fill={fill}>
              {t}
            </text>
          ));
        return (
          <g key={row.r} opacity={o}>
            <line x1={TX + 10} x2={TX + TW - 10} y1={top} y2={top} stroke="rgba(255,255,255,0.14)" />
            <rect x={TX + 10} y={top + 8} width={28} height={h - 16} rx={5} fill={row.c} />
            <text x={TX + 24} y={top + h / 2 + 5} textAnchor="middle" fontSize={13.5} fontWeight={800} fill="#10131c">
              {row.r}
            </text>
            {cell(COLS[1], row.n, '#ffffff', 600)}
            {cell(COLS[2], row.b, '#e9edf5')}
            {cell(COLS[3], row.m, row.c, 600)}
          </g>
        );
      })}
    </g>
  );
}

const MAPCAM = (yaw: number, elev: number, dist = 17, y = -0.5) => orbit(yaw, elev, dist, [0, y, 0], [-250, 0]);
const specMap: StageSpec<MusclePose, MuscleOpts> = {
  S: SMAP,
  pose: MP0,
  opts: {},
  caption: 'Arkuen mapa: arkua → nerbioa → kartilagoak eta hezurrak → muskuluak',
  map: 'all',
  fit: false,
  right: [600, 620],
  over: (_t, _at, pose) => <MapTable pose={pose} />,
  steps: [
    { cam: MAPCAM(60, 6), glide: 0.06, fit: false, note: 'Arku bakoitzak nerbio bat, kartilago edo hezur batzuk eta muskulu batzuk' },
    { to: { n1: 1, b1: 1, m1: 1, m1b: 1 }, run: [0.08, 0.7], cam: MAPCAM(66, 6), glide: 0.05, fit: false, dim: ['barail-nerbioa', 'baraila', 'hezur-maxilarra', 'zigomatikoa', 'tenporalaren-ezkata', 'maseteroa', 'muskulu-tenporala', 'milohioideoa', 'digastrikoaren-aurreko-sabela'], note: 'I: laranja. Trigeminoa, baraila, muskulu murtxikatzaileak' },
    { to: { n2: 1, b2: 1, m2: 1, m2b: 1, m2c: 1 }, run: [0.08, 0.7], cam: MAPCAM(32, 5), glide: 0.05, fit: false, dim: ['aurpegi-nerbioa', 'estiloide-apofisia', 'hioide-adar-txikia', 'hioide-gorputza', 'muskulu-mimikoak', 'begietako-orbikularra', 'ahoko-orbikularra', 'muskulu-aurikularrak', 'okzipitala', 'digastrikoaren-atzeko-sabela', 'estilohioideoa'], note: 'II: urdina. Aurpegi-nerbioa eta aurpegiaren muskulu guztiak' },
    { to: { n3: 1, b3: 1, m3: 1 }, run: [0.08, 0.7], cam: MAPCAM(112, 2, 15, -1.4), glide: 0.05, fit: false, dim: ['glosofaringeoa', 'hioide-adar-nagusia', 'hioide-gorputza', 'goiko-ertzatzailea', 'estilofaringeoa'], note: 'III: horia. Muskulu sakonak hasten dira: glosofaringeoa, hioidearen beheko erdia' },
    { to: { n4: 1, b4: 1, m4: 1 }, run: [0.08, 0.7], cam: MAPCAM(120, 2, 14, -1.8), glide: 0.05, fit: false, dim: ['bagoa', 'goiko-laringe-nerbioa', 'tiroide-kartilagoa', 'tarteko-ertzatzailea', 'beheko-ertzatzailea', 'krikotiroidea'], note: 'IV: gorria. Bagoaren goiko laringe-nerbioa, tarteko eta beheko ertzatzaileak' },
    { to: { n6: 1, m6: 1, platysma: 1 }, run: [0.06, 0.55], cam: MAPCAM(48, 5, 16.5, -0.7), glide: 0.05, fit: false, dim: ['laringe-atzerakaria', 'krikoide-kartilagoa', 'laringe-barneko-muskuluak'], note: 'VI: berdea. Laringe-nerbio atzerakaria eta laringearen muskulu intrintsekoak' },
  ],
};
export const ArchMap17 = poseStage17(specMap, build);
