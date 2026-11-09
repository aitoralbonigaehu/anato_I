'use client';

import './HeadMap'; // first: common.tsx and HeadMap.tsx import each other
import type { SceneProps } from '@/components/kit';
import { ARCH } from './common';

/**
 * Topic 17, closing synthesis: arch by arch, nerve, cartilages and bones, muscles. A structure that two arches share
 * straddles the line between their rows, so the many-to-many links read as one object in both colours.
 */

/** Row by row: I, II, III, IV, VI, then the shared items all together. */
export const S_MAP = [0, 0.17, 0.33, 0.47, 0.62, 0.8] as const;

const W = 1280;
const H = 720;
const TOP = 66;
const ROW = 124;
const X = { arch: 24, nerve: 118, nerveText: 188, car: 396, carShared: 610, mus: 824, musShared: 1040, end: 1256 };
const PILL = 104;

const ramp = (t: number, a: number, b: number) => Math.min(1, Math.max(0, (t - a) / (b - a)));

type Item = { text: string; head?: boolean };
interface Row { arch: string; color: string; nerve: string; name: string; sub: string; car: Item[]; mus: Item[] }

/** Each row names its arch and nerve for the study guards (what a step says is on screen). */
const ARCH_ID: Record<string, string> = { I: 'lehen-arkua', II: 'bigarren-arkua', III: 'hirugarren-arkua', IV: 'laugarren-arkua', VI: 'seigarren-arkua' };
const NERVE_ID: Record<string, string> = { I: 'trigeminoa', II: 'aurpegi-nerbioa', III: 'glosofaringeoa', IV: 'goiko-laringe-nerbioa', VI: 'laringe-atzerakaria' };

const ROWS: Row[] = [
  {
    arch: 'I', color: ARCH.i, nerve: 'V', name: 'Trigeminoa', sub: 'V3, barail-nerbioa',
    car: [{ text: 'Meckel kartilagoa', head: true }, { text: 'Baraila · Mailua' }, { text: 'Maxilarra · Zigomatikoa' }, { text: 'Tenporalaren ezkata' }],
    mus: [{ text: 'Murtxikatzaileak', head: true }, { text: 'Maseteroa · Tenporala' }, { text: 'Milohioideoa' }],
  },
  {
    arch: 'II', color: ARCH.ii, nerve: 'VII', name: 'Aurpegi-nerbioa', sub: 'faziala',
    car: [{ text: 'Reichert kartilagoa', head: true }, { text: 'Ointokia' }, { text: 'Estiloide apofisia' }],
    mus: [{ text: 'Mimikoak', head: true }, { text: 'Aurikularrak · Okzipitala' }, { text: 'Estilohioideoa · Platisma' }],
  },
  {
    arch: 'III', color: ARCH.iii, nerve: 'IX', name: 'Glosofaringeoa', sub: 'mihia eta faringea',
    car: [{ text: 'Ez du beste bien', head: true }, { text: 'bezalako kartilagorik' }],
    mus: [{ text: 'Sakonak', head: true }, { text: 'Estilofaringeoa' }],
  },
  {
    arch: 'IV', color: ARCH.iv, nerve: 'X', name: 'Goiko laringe-n.', sub: 'bagoaren adarra',
    car: [{ text: 'Kartilagoak bakarrik', head: true }, { text: 'hezurrik ez' }],
    mus: [{ text: 'Sakonak', head: true }],
  },
  {
    arch: 'VI', color: ARCH.vi, nerve: 'X', name: 'Laringe-n. atzerakaria', sub: 'bagoaren adarra',
    car: [{ text: 'Krikoidea · Epiglotisa', head: true }, { text: 'Aritenoidea' }, { text: 'Kornikulatua · Kuneiformea' }],
    mus: [{ text: 'Laringe barnekoak', head: true }, { text: 'muskulu intrintsekoak' }],
  },
];

interface Shared { row: number; x: number; w: number; title: string; a: string; b: string }

const carW = X.mus - X.carShared - 14;
const musW = X.end - X.musShared;
const SHARED: Shared[] = [
  { row: 0, x: X.carShared, w: carW, title: 'Ingudea', a: 'I: gorputza, adar txikia', b: 'II: adar luzea' },
  { row: 1, x: X.carShared, w: carW, title: 'Hioidea', a: 'II: adar txikia, goiko erdia', b: 'III: adar nagusia, beheko erdia' },
  { row: 3, x: X.carShared, w: carW, title: 'Tiroidea', a: 'IV: goiko aldea', b: 'VI: beheko atala' },
  { row: 0, x: X.musShared, w: musW, title: 'Digastrikoa', a: 'I: aurreko sabela (V)', b: 'II: atzeko sabela (VII)' },
  { row: 2, x: X.musShared, w: musW, title: 'Faringe-ertzatzaileak', a: 'III: goikoak', b: 'IV: tartekoak, behekoak' },
];

const rowY = (k: number) => TOP + k * ROW;
const DARK = '#14161d';

export function ArchMap17({ t }: SceneProps) {
  const shown = ROWS.map((_, k) => ramp(t, S_MAP[k], S_MAP[k] + 0.05));
  const current = S_MAP.reduce<number>((best, at, k) => (t >= at ? k : best), 0);
  const summary = ramp(t, S_MAP[5], S_MAP[5] + 0.05);
  const rowAlpha = (k: number) => shown[k] * (k === current ? 1 : 0.55 + 0.45 * summary);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Arku faringeoen mapa: nerbioa, kartilagoak eta muskuluak">
      <defs>
        <linearGradient id="arch-map-iv-vi" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.5" stopColor={ARCH.iv} />
          <stop offset="0.5" stopColor={ARCH.vi} />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="#12141b" />
      <g fontSize={15} fontWeight={700} letterSpacing={1.2} fill="#a8adbd">
        <text x={X.arch + 44} y={46} textAnchor="middle">ARKUA</text>
        <text x={X.nerve} y={46}>NERBIOA</text>
        <text x={X.car} y={46}>KARTILAGOAK ETA HEZURRAK</text>
        <text x={X.mus} y={46}>MUSKULUAK</text>
      </g>

      {ROWS.map((r, k) => {
        const y = rowY(k);
        const mid = y + ROW / 2;
        return (
          <g key={r.arch}>
            <rect x={X.arch} y={y + 4} width={X.end - X.arch} height={ROW - 8} rx={12} fill={r.color} opacity={0.05 + 0.13 * rowAlpha(k)} />
            <circle cx={X.arch + 44} cy={mid} r={34} fill={r.color} opacity={0.3 + 0.7 * shown[k]} />
            <text x={X.arch + 44} y={mid + 11} textAnchor="middle" fontSize={32} fontWeight={800} fill={DARK}>{r.arch}</text>
            <g opacity={rowAlpha(k)} data-part={ARCH_ID[r.arch]} data-label={ARCH_ID[r.arch]}>
              {r.nerve !== 'X' && <rect x={X.nerve} y={mid - 24} width={60} height={48} rx={10} fill={r.color} />}
              {r.nerve !== 'X' && <text x={X.nerve + 30} y={mid + 9} textAnchor="middle" fontSize={25} fontWeight={800} fill={DARK}>{r.nerve}</text>}
              <text data-part={NERVE_ID[r.arch]} data-label={NERVE_ID[r.arch]} x={X.nerveText} y={mid - 3} fontSize={19} fontWeight={700} fill="#f3f4f8">{r.name}</text>
              <text x={X.nerveText} y={mid + 21} fontSize={16} fill="#c4c8d6">{r.sub}</text>
              {[{ list: r.car, x: X.car }, { list: r.mus, x: X.mus }].map(({ list, x }) =>
                list.map((item, n) => (
                  <text key={`${x}${item.text}`} x={x} y={mid - ((list.length - 1) * 25) / 2 + 6 + n * 25} fontSize={item.head ? 18 : 17} fontWeight={item.head ? 700 : 500} fill={item.head ? r.color : '#eceef4'}>{item.text}</text>
                )),
              )}
            </g>
          </g>
        );
      })}

      {/* The vagus: one nerve, one branch for each of arches IV and VI. */}
      <g opacity={shown[3] * (1 - shown[4])}>
        <rect x={X.nerve} y={rowY(3) + ROW / 2 - 24} width={60} height={48} rx={10} fill={ARCH.iv} />
        <text x={X.nerve + 30} y={rowY(3) + ROW / 2 + 9} textAnchor="middle" fontSize={25} fontWeight={800} fill={DARK}>X</text>
      </g>
      <g opacity={shown[4]}>
        <rect x={X.nerve} y={rowY(4) - 34} width={60} height={68} rx={10} fill="url(#arch-map-iv-vi)" />
        <text x={X.nerve + 30} y={rowY(4) + 10} textAnchor="middle" fontSize={27} fontWeight={800} fill={DARK}>X</text>
      </g>

      {SHARED.map((s) => {
        const top = ROWS[s.row].color;
        const bottom = ROWS[s.row + 1].color;
        const y = rowY(s.row + 1);
        const line = 1.5 + summary * 1.5;
        return (
          <g key={s.title} opacity={shown[s.row + 1]}>
            <rect x={s.x} y={y - PILL / 2} width={s.w} height={PILL} rx={12} fill="#1b1e28" />
            <rect x={s.x + 1} y={y - PILL / 2 + 1} width={s.w - 2} height={PILL / 2 - 1} rx={11} fill={top} opacity={0.26} />
            <rect x={s.x + 1} y={y} width={s.w - 2} height={PILL / 2 - 1} rx={11} fill={bottom} opacity={0.26} />
            <path d={`M${s.x} ${y}V${y - PILL / 2 + 12}a12 12 0 0 1 12 -12H${s.x + s.w - 12}a12 12 0 0 1 12 12V${y}`} fill="none" stroke={top} strokeWidth={line} />
            <path d={`M${s.x} ${y}V${y + PILL / 2 - 12}a12 12 0 0 0 12 12H${s.x + s.w - 12}a12 12 0 0 0 12 -12V${y}`} fill="none" stroke={bottom} strokeWidth={line} />
            <text x={s.x + s.w / 2} y={y - 26} textAnchor="middle" fontSize={17} fontWeight={800} fill="#ffffff">{s.title}</text>
            <text x={s.x + s.w / 2} y={y - 7} textAnchor="middle" fontSize={13.5} fontWeight={600} fill="#f3f4f8">{s.a}</text>
            <text x={s.x + s.w / 2} y={y + 24} textAnchor="middle" fontSize={13.5} fontWeight={600} fill="#f3f4f8">{s.b}</text>
          </g>
        );
      })}
    </svg>
  );
}
