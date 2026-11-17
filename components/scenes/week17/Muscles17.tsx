'use client';

import './HeadMap'; // first: common.tsx and HeadMap.tsx import each other, and HeadMap needs ARCH at load
import { ARCH, KEY_ARCH, endPose, orbit, poseStage17, type StageSpec } from './common';
import { MP0, muscleModel, type MuscleOpts, type MusclePose } from './muscle-model';
import { SITE17C } from './sites-c';

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
  site: SITE17C.muscle,
  arrive: 'Enbrioiaren buruaren ordez, fetuaren burua: V3k inerbatzen dituen muskuluak',
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
const P1: MusclePose = { ...endPose(spec1).pose, m2c: 0, m2b: 0 };

const spec2: StageSpec<MusclePose, MuscleOpts> = {
  S: SM2,
  site: SITE17C.muscle,
  arrive: 'Hezurretatik muskuluetara: fetuaren burua berriro, orain VII.aren muskuluak',
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
      names: [{ id: 'platisma', text: 'Platisma', sub: 'lepoko azalaren azpian, fina eta zapala' }],
      note: 'Platisma: lepoko azalaren azpian, fina eta zapala; muskulu mimikoen barnean sar genezake. Hau ere II. arkutik',
    },
  ],
};
export const Muscles2 = poseStage17(spec2, build);

// ———————————————————————————— 2 (laburpena) Arkuen mapa ————————————————————————————
// The closing picture: the fetal head on the left, each arch's nerve, bones and muscles lighting in its colour as
// its row of the table on the right fills. Rows I, II, III, IV, VI, then everything together (week17i's six beats).

export const S_MAP = [0, 0.17, 0.33, 0.47, 0.62, 0.8] as const;

type Row = { r: string; id: string; nerve: string; c: string; k: keyof MusclePose; n: string[]; b: string[]; m: string[] };
const ROWS: Row[] = [
  {
    r: 'I',
    id: 'lehen-arkua',
    nerve: 'trigeminoa',
    c: ARCH.i,
    k: 'n1',
    n: ['V3: barail-nerbioa', 'trigeminoaren 3. adarra'],
    b: ['Meckel (endekatu) → baraila', 'Mailua, ingudea', 'Hezur maxilarra, zigomatikoa,', 'loki hezurraren atal bat'],
    m: ['Maseteroa, tenporala', 'Milohioideoa', 'Digastrikoa: aurreko sabela'],
  },
  {
    r: 'II',
    id: 'bigarren-arkua',
    nerve: 'aurpegi-nerbioa',
    c: ARCH.ii,
    k: 'n2',
    n: ['VII: aurpegi-nerbioa'],
    b: ['Reichert → ointokia,', 'apofisi estiloidea,', 'hioidearen adar txikia eta', 'gorputzaren goiko erdia'],
    m: ['Mimikoak, aurikularrak', 'Okzipitala, platisma', 'Digastrikoa: atzeko sabela', 'Estilohioideoa'],
  },
  {
    r: 'III',
    id: 'hirugarren-arkua',
    nerve: 'glosofaringeoa',
    c: ARCH.iii,
    k: 'n3',
    n: ['IX: glosofaringeoa'],
    b: ['Hioidearen gorputzaren', 'beheko erdia, adar nagusiak'],
    m: ['Goiko ertzatzaileak', 'Estilofaringeoa'],
  },
  {
    r: 'IV',
    id: 'laugarren-arkua',
    nerve: 'goiko-laringe-nerbioa',
    c: ARCH.iv,
    k: 'n4',
    n: ['X: bagoa', 'goiko laringe-nerbioa'],
    b: ['Tiroide kartilagoaren', 'goiko aldea'],
    m: ['Tarteko eta beheko', 'ertzatzaileak'],
  },
  {
    r: 'VI',
    id: 'seigarren-arkua',
    nerve: 'laringe-atzerakaria',
    c: ARCH.vi,
    k: 'n6',
    n: ['X: bagoa', 'laringe-n. atzerakaria'],
    b: ['Tiroidearen beheko atala', 'Krikoidea, aritenoidea,', 'kornikulatuak, kuneiformeak'],
    m: ['Laringe barneko muskulu', 'intrintsekoak'],
  },
];
/** The structures two arches share, by the row they are written in: these lines turn white at the end. */
const SHARED: Record<string, RegExp> = { I: /Digastrikoa/, II: /hioidearen|gorputzaren|Digastrikoa/, III: /Hioidearen|beheko erdia|ertzatzaileak/, IV: /Tiroide|goiko aldea|ertzatzaileak|Tarteko/, VI: /Tiroidearen/ };

const TX = 446;
const TW = 548;
const COLS = [TX + 12, TX + 48, TX + 204, TX + 384];
const LH = 17.4;
const PAD = 30;
const ramp = (t: number, a: number, b: number) => Math.min(1, Math.max(0, (t - a) / (b - a)));

/** The table: arch → nerve → cartilages and bones → muscles, each row filling as its parts light up on the head. */
function MapTable({ t, pose }: { t: number; pose: MusclePose }) {
  let y = 82;
  const current = S_MAP.reduce<number>((best, at, k) => (t >= at ? k : best), 0);
  const all = ramp(t, S_MAP[5], S_MAP[5] + 0.05);
  return (
    <g pointerEvents="none" style={{ fontFamily: 'inherit' }}>
      <rect x={TX} y={46} width={TW} height={514} rx={10} fill="rgba(13,17,28,0.9)" stroke="rgba(255,255,255,0.14)" />
      {['', 'Nerbioa', 'Kartilagoak eta hezurrak', 'Muskuluak'].map((h, i) => (
        <text key={h} x={COLS[i]} y={70} fontSize={12.5} fontWeight={700} letterSpacing={0.3} fill="#aeb7c8">
          {h}
        </text>
      ))}
      {ROWS.map((row, k) => {
        const lines = Math.max(row.n.length, row.b.length, row.m.length);
        const h = lines * LH + PAD;
        const top = y;
        y += h;
        const v = Number(pose[row.k] ?? 0);
        // The row being told is full; the ones already told step back a little, and all return at the end.
        const o = v < 0.02 ? 0.16 : (0.16 + 0.84 * Math.min(1, v * 1.6)) * (k === current ? 1 : 0.62 + 0.38 * all);
        const shared = SHARED[row.r];
        const cell = (x: number, ls: string[], fill: string, weight = 500) =>
          ls.map((line, i) => {
            const two = all > 0 && shared.test(line);
            return (
              <text key={i} x={x} y={top + PAD / 2 + 13 + i * LH} fontSize={12.8} fontWeight={two ? 800 : weight} fill={two ? '#ffffff' : fill}>
                {line}
              </text>
            );
          });
        return (
          <g key={row.r} opacity={o} data-part={row.id} data-label={row.id}>
            <line x1={TX + 10} x2={TX + TW - 10} y1={top} y2={top} stroke="rgba(255,255,255,0.14)" />
            {k === current && all < 0.5 && <rect x={TX + 4} y={top + 3} width={TW - 8} height={h - 6} rx={7} fill={row.c} opacity={0.13} />}
            <rect x={TX + 10} y={top + 8} width={28} height={h - 16} rx={5} fill={row.c} />
            <text x={TX + 24} y={top + h / 2 + 5} textAnchor="middle" fontSize={13.5} fontWeight={800} fill="#10131c">
              {row.r}
            </text>
            <g data-part={row.nerve} data-label={row.nerve}>{cell(COLS[1], row.n, '#ffffff', 600)}</g>
            {cell(COLS[2], row.b, '#e9edf5')}
            {cell(COLS[3], row.m, row.c, 600)}
          </g>
        );
      })}
      <text x={TX + 14} y={546} fontSize={12} fill="#aeb7c8" opacity={0.25 + 0.75 * all}>
        Zuriz: bi arkuren artean banatzen diren egiturak (hioidea, tiroidea, digastrikoa, ertzatzaileak)
      </text>
    </g>
  );
}

const MAPCAM = (yaw: number, elev: number, dist = 17, y = -0.5) => orbit(yaw, elev, dist, [0, y, 0], [-250, 0]);
const specMap: StageSpec<MusclePose, MuscleOpts> = {
  S: S_MAP,
  site: SITE17C.muscle,
  arrive: 'Laringetik buru osora: arku bakoitzak utzi duena, banan-banan',
  pose: MP0,
  opts: {},
  caption: 'Arkuen mapa (3D burua eta taula): arkua → nerbioa → kartilagoak eta hezurrak → muskuluak',
  fit: false,
  right: [600, 620],
  over: (t, _at, pose) => <MapTable t={t} pose={pose} />,
  steps: [
    { to: { n1: 1, b1: 1, m1: 1, m1b: 1 }, run: [0.1, 0.75], cam: MAPCAM(66, 6), glide: 0.06, fit: false, dim: ['barail-nerbioa', 'baraila', 'hezur-maxilarra', 'zigomatikoa', 'loki-hezurraren-atal-tinpanikoa', 'maseteroa', 'muskulu-tenporala', 'milohioideoa', 'digastrikoaren-aurreko-sabela'], note: 'I: laranja. V3 (barail-nerbioa), baraila, muskulu murtxikatzaileak' },
    { to: { n2: 1, b2: 1, m2: 1, m2b: 1, m2c: 1 }, run: [0.08, 0.7], cam: MAPCAM(32, 5), glide: 0.05, fit: false, dim: ['aurpegi-nerbioa', 'estiloide-apofisia', 'hioide-adar-txikia', 'hioide-gorputza', 'muskulu-mimikoak', 'begietako-orbikularra', 'ahoko-orbikularra', 'muskulu-aurikularrak', 'okzipitala', 'digastrikoaren-atzeko-sabela', 'estilohioideoa'], note: 'II: urdina. Aurpegi-nerbioa eta aurpegiaren muskulu guztiak' },
    { to: { n3: 1, b3: 1, m3: 1 }, run: [0.08, 0.7], cam: MAPCAM(112, 2, 15, -1.4), glide: 0.05, fit: false, dim: ['glosofaringeoa', 'hioide-adar-nagusia', 'hioide-gorputza', 'goiko-ertzatzailea', 'estilofaringeoa'], note: 'III: horia. Muskulu sakonak hasten dira: glosofaringeoa, hioidearen beheko erdia' },
    { to: { n4: 1, b4: 1, m4: 1 }, run: [0.08, 0.7], cam: MAPCAM(120, 2, 14, -1.8), glide: 0.05, fit: false, dim: ['bagoa', 'goiko-laringe-nerbioa', 'tiroide-kartilagoa', 'tarteko-ertzatzailea', 'beheko-ertzatzailea', 'krikotiroidea'], note: 'IV: gorria. Bagoaren goiko laringe-nerbioa, tarteko eta beheko ertzatzaileak' },
    { to: { n6: 1, m6: 1 }, run: [0.06, 0.55], cam: MAPCAM(104, 4, 13, -2.0), glide: 0.05, fit: false, dim: ['laringe-atzerakaria', 'krikoide-kartilagoa', 'laringe-barneko-muskuluak'], note: 'VI: berdea. Laringe-nerbio atzerakaria eta laringearen muskulu intrintsekoak' },
    { to: { platysma: 1 }, run: [0.1, 0.6], cam: MAPCAM(56, 6, 17.5, -0.6), glide: 0.04, fit: false, note: 'Lau nerbio, bost arku: muskulu bakoitzaren jatorria bere nerbioak esaten du' },
  ],
};
export const ArchMap17 = poseStage17(specMap, build);
