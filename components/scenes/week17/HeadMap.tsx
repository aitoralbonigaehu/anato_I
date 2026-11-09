'use client';

import { ARCH } from './arch-colors';

/**
 * "Non gaude?": where in the head and neck the 3D model sits, as a small map in the corner of every view of
 * topics 17–18 (as topic 15's UroMap). First version from the plan: the skull agent polishes the drawing; the
 * focus names and MAP_LEFT stay as they are, the other scenes use them.
 */
export type HeadFocus =
  | 'all'
  | 'skull'
  | 'vault'
  | 'base'
  | 'face-bones'
  | 'arches'
  | 'arch1'
  | 'arch2'
  | 'arch3'
  | 'arch5'
  | 'arch46'
  | 'pouch1'
  | 'pouch2'
  | 'pouch3'
  | 'pouch4'
  | 'cleft1'
  | 'clefts'
  | 'neck'
  | 'tongue'
  | 'thyroid'
  | 'face'
  | 'palate'
  | 'nose'
  | 'tooth';

/** The map's box in the 3D view's 1000 × 640 frame: bottom left, under the left name column. */
export const MAP_BOX = { x: 14, y: 420, w: 268, h: 128 } as const;
/** While the map shows, the left name column keeps above it. */
export const MAP_LEFT: [number, number] = [120, 372];

const TEXT: Record<HeadFocus, [string, string]> = {
  all: ['Burua eta lepoa', 'kraneoa, arkuak, aurpegia'],
  skull: ['Kraneoa', 'neurokraneoa + errai kraneoa'],
  vault: ['Buru ganga', 'kraneoaren goialdea'],
  base: ['Burezurraren oinaldea', 'goitik ikusita'],
  'face-bones': ['Errai kraneoa', 'aurpegiko hezurrak'],
  arches: ['Faringe-arkuak', 'lepoa · 4.–5. asteak'],
  arch1: ['I. arkua', 'V · barailaren aldea'],
  arch2: ['II. arkua', 'VII · aurpegiko muskuluak'],
  arch3: ['III. arkua', 'IX · sakonagoa'],
  arch5: ['V. arkua', 'agertu eta endekatu'],
  arch46: ['IV. eta VI. arkuak', 'X · laringea'],
  pouch1: ['1. poltsa', 'barrutik, I. eta II. arkuen artean'],
  pouch2: ['2. poltsa', 'barrutik, II. eta III. arkuen artean'],
  pouch3: ['3. poltsa', 'barrutik, III. eta IV. arkuen artean'],
  pouch4: ['4. poltsa', 'barrutik, azkena'],
  cleft1: ['1. arraildura', 'kanpotik, I. eta II. arkuen artean'],
  clefts: ['Arraildurak', 'kanpotik, lepoan'],
  neck: ['Lepoa', 'guruinen behin betiko tokia'],
  tongue: ['Mihia', 'faringearen zorua'],
  thyroid: ['Tiroidea', 'zulo itsutik lepora'],
  face: ['Aurpegia', 'aurretik ikusita'],
  palate: ['Aho sabaia', 'sudurraren eta ahoaren artean'],
  nose: ['Sudurra', 'barrunbeak eta koanak'],
  tooth: ['Hortza', 'barailean, oso handituta'],
};

/** Which arch (colour) the focus is about, and where on the small head it sits. */
// A function: common.tsx and this file import each other, so ARCH is not ready while this module loads.
const SPOT = (): Partial<Record<HeadFocus, { c: string; x: number; y: number }>> => ({
  arch1: { c: ARCH.i, x: 46, y: 74 },
  arch2: { c: ARCH.ii, x: 54, y: 84 },
  arch3: { c: ARCH.iii, x: 61, y: 91 },
  arch5: { c: ARCH.v, x: 66, y: 96 },
  arch46: { c: ARCH.iv, x: 68, y: 98 },
  pouch1: { c: '#f6d365', x: 50, y: 79 },
  pouch2: { c: '#f6d365', x: 58, y: 87 },
  pouch3: { c: '#f6d365', x: 64, y: 94 },
  pouch4: { c: '#f6d365', x: 69, y: 100 },
  cleft1: { c: '#7cc0ee', x: 50, y: 79 },
  clefts: { c: '#7cc0ee', x: 60, y: 90 },
  neck: { c: '#fde68a', x: 62, y: 104 },
  tongue: { c: ARCH.i, x: 44, y: 78 },
  thyroid: { c: '#fde68a', x: 54, y: 96 },
  face: { c: '#fde68a', x: 32, y: 56 },
  palate: { c: '#fde68a', x: 36, y: 64 },
  nose: { c: '#fde68a', x: 32, y: 54 },
  tooth: { c: '#fde68a', x: 40, y: 72 },
  skull: { c: '#fde68a', x: 60, y: 34 },
  vault: { c: '#fde68a', x: 62, y: 18 },
  base: { c: '#fde68a', x: 62, y: 54 },
  'face-bones': { c: '#fde68a', x: 34, y: 62 },
});

export function HeadMap({ focus, show = 1 }: { focus: HeadFocus; show?: number }) {
  if (show <= 0.01) return null;
  const [title, sub] = TEXT[focus];
  const { x, y, w, h } = MAP_BOX;
  const spot = SPOT()[focus];
  const arches: [string, number, number, number][] = [
    [ARCH.i, 46, 74, 8],
    [ARCH.ii, 54, 84, 6.5],
    [ARCH.iii, 61, 91, 5],
    [ARCH.iv, 67, 97, 4.2],
  ];
  return (
    <g transform={`translate(${x} ${y})`} opacity={show} pointerEvents="none" aria-label={`Non gaude: ${title}`}>
      <rect width={w} height={h} rx={16} fill="rgba(12,12,15,0.78)" stroke="rgba(255,255,255,0.1)" />
      <path d="M22,62 C16,28 44,8 72,12 C100,16 110,44 100,70 C94,92 84,112 78,122 L54,122 C62,110 58,104 52,100 C40,94 26,86 22,62 Z" fill="#f3c2ae" fillOpacity={0.2} stroke="#f3c2ae" strokeOpacity={0.4} />
      {arches.map(([c, ax, ay, r]) => (
        <ellipse key={c} cx={ax} cy={ay} rx={r * 1.25} ry={r} fill={c} fillOpacity={focus === 'all' || focus === 'arches' ? 0.9 : 0.34} transform={`rotate(38 ${ax} ${ay})`} />
      ))}
      {spot && <circle cx={spot.x} cy={spot.y} r={8} fill="none" stroke={spot.c} strokeWidth={2} />}
      <text x={122} y={28} fill="#fde68a" fontSize={9} fontWeight={650} letterSpacing="0.1em">
        NON GAUDE?
      </text>
      <text x={122} y={49} fill="#f5f2ec" fontSize={12.5} fontWeight={650}>
        {title}
      </text>
      <text x={122} y={68} fill="rgba(245,242,236,0.62)" fontSize={10}>
        {sub}
      </text>
    </g>
  );
}
