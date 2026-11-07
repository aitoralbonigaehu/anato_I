'use client';

import { UC } from './uro-model';

/**
 * "Non gaude?": the notes' first figure of the urinary system (the 4–5-week embryo from the side, with the
 * three kidneys one after another along its back) as a small map in the corner of every topic-15 view. The
 * part the stage is about is lit and ringed, the generations that have already gone are drawn degenerating,
 * and a line says where in the body the 3D model sits — so a student never loses the thread between the
 * wall, a section block, the kidney, a nephron or the pelvis.
 */
export type UroFocus =
  | 'all'
  | 'pro'
  | 'pro-unit'
  | 'meso'
  | 'meso-unit'
  | 'meta'
  | 'kidney'
  | 'nephron'
  | 'ascent'
  | 'adrenal'
  | 'cloaca'
  | 'bladder'
  | 'urethra'
  | 'glans';

/** The map's box in the 3D view's 1000 × 640 frame: bottom left, under the left name column. */
export const MAP_BOX = { x: 14, y: 420, w: 268, h: 128 } as const;
/** While the map shows, the left name column keeps above it. */
export const MAP_LEFT: [number, number] = [120, 372];

const TEXT: Record<UroFocus, [string, string]> = {
  all: ['Hiru giltzurrun', 'lepotik kloakaraino, atzeko paretan'],
  pro: ['Pronefrosa', 'lepoa (zerbikala) · 4. astea'],
  'pro-unit': ['Pronefrosa · zeharkako mozketa', 'lepoko maila, bitarteko mesodermoa'],
  meso: ['Mesonefrosa', 'toraxa eta gerria · 4.–8. asteak'],
  'meso-unit': ['Mesonefrosa · zeharkako mozketa', 'toraxeko maila, gandor urogenitala'],
  meta: ['Metanefrosa', 'sakroa, kloakaren ondoan · 5. astea'],
  kidney: ['Giltzurruna barrutik', 'metanefrosa, handituta'],
  nephron: ['Nefrona bat', 'giltzurrunaren barruan, oso handituta'],
  ascent: ['Giltzurrunen igoera', 'sakrotik gerrira'],
  adrenal: ['Giltzurrun gaineko guruina', 'giltzurrunaren gainean'],
  cloaca: ['Kloaka', 'buztaneko muturra'],
  bladder: ['Gernu maskuria', 'sinu urogenitalaren goiko atala'],
  urethra: ['Uretra', 'sinu urogenitalaren beheko atalak'],
  glans: ['Glandea', 'kanpoko genitalak, handituta'],
};

/** Which parts of development have already passed for each focus (they draw degenerating). */
const ERA: Record<UroFocus, number> = { all: 0, pro: 0, 'pro-unit': 0, meso: 1, 'meso-unit': 1, meta: 2, kidney: 2, nephron: 2, ascent: 3, adrenal: 3, cloaca: 2, bladder: 3, urethra: 3, glans: 3 };

// Local geometry: the embryo curled round a centre, head at the top, back on the right, tail at the bottom.
const CX = 62;
const CY = 70;
const R = 36;
const pt = (deg: number, r = R): [number, number] => {
  const a = (deg * Math.PI) / 180;
  return [CX + Math.cos(a) * r, CY + Math.sin(a) * r];
};
const arc = (a0: number, a1: number, r = R) => {
  const [x0, y0] = pt(a0, r);
  const [x1, y1] = pt(a1, r);
  return `M${x0.toFixed(1)},${y0.toFixed(1)} A${r},${r} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} 1 ${x1.toFixed(1)},${y1.toFixed(1)}`;
};

/** Where each part sits along the back (angles round the curl: −90 is up, 0 the middle of the back, 90 down). */
const PRO: [number, number] = [-88, -62];
const MESO: [number, number] = [-56, 52];
const META: [number, number] = [62, 80];
const CLOACA = pt(104, R - 10);
const LUMBAR = pt(22, R - 4);

export function UroMap({ focus, show = 1 }: { focus: UroFocus; show?: number }) {
  if (show <= 0.01) return null;
  const era = ERA[focus];
  const lit = (part: 'pro' | 'meso' | 'meta' | 'cloaca' | 'kidney'): number => {
    if (focus === 'all') return 1;
    if (part === 'pro') return focus.startsWith('pro') ? 1 : 0.28;
    if (part === 'meso') return focus.startsWith('meso') ? 1 : era >= 2 ? 0.3 : 0.45;
    if (part === 'meta') return ['meta', 'kidney', 'nephron', 'ascent', 'adrenal'].includes(focus) ? 1 : 0.4;
    if (part === 'cloaca') return ['cloaca', 'bladder', 'urethra', 'glans'].includes(focus) ? 1 : 0.4;
    return 0.4;
  };
  // Where "you are here" points.
  const here: [number, number] = focus.startsWith('pro')
    ? pt(-76, R - 2)
    : focus.startsWith('meso')
      ? pt(-6, R - 2)
      : focus === 'ascent'
        ? LUMBAR
        : focus === 'adrenal'
          ? pt(14, R - 4)
          : focus === 'cloaca' || focus === 'bladder' || focus === 'urethra'
            ? CLOACA
            : focus === 'glans'
              ? pt(118, R - 18)
              : focus === 'all'
                ? pt(0, R - 2)
                : pt(71, R - 2);
  const zoom = focus === 'kidney' || focus === 'nephron' || focus === 'glans' || focus.endsWith('-unit');
  const [title, sub] = TEXT[focus];
  const { x, y, w, h } = MAP_BOX;
  // The kidney after its ascent sits at the lumbar level.
  const kidneyAt: [number, number] = era >= 3 ? LUMBAR : pt(71, R - 2);
  const unitCut = focus === 'pro-unit' ? -76 : focus === 'meso-unit' ? -6 : null;
  return (
    <g transform={`translate(${x} ${y})`} opacity={show} pointerEvents="none" aria-label={`Non gaude: ${title}`}>
      <rect width={w} height={h} rx={16} fill="rgba(12,12,15,0.78)" stroke="rgba(255,255,255,0.1)" />
      <g transform="translate(0 -6)">
        {/* The body: a curled C, the head at the top, the tail with the cloaca at the bottom. */}
        <path d={arc(-150, 128, R)} fill="none" stroke="#f3c2ae" strokeOpacity={0.22} strokeWidth={21} strokeLinecap="round" />
        <circle cx={pt(-150, R)[0] + 2} cy={pt(-150, R)[1] + 4} r={15} fill="#f3c2ae" fillOpacity={0.2} />
        <path d={arc(-150, 128, R + 11)} fill="none" stroke="#f3c2ae" strokeOpacity={0.35} strokeWidth={1} />
        {/* Somites along the back. */}
        {Array.from({ length: 15 }, (_, i) => {
          const [sx, sy] = pt(-96 + i * 12, R + 6);
          return <circle key={i} cx={sx} cy={sy} r={1.5} fill="#f3c2ae" fillOpacity={0.35} />;
        })}
        {/* Wolff (mesonephric) duct down to the cloaca. */}
        <path d={`${arc(-62, 96, R - 8)}`} fill="none" stroke={UC.wolff} strokeWidth={2} strokeOpacity={0.35 + 0.6 * Math.max(lit('meso'), focus === 'cloaca' || focus === 'bladder' ? 1 : 0)} />
        {/* Pronephros: a few units in the neck; dashed once it has gone. */}
        <path d={arc(PRO[0], PRO[1], R - 2)} fill="none" stroke={UC.pro} strokeWidth={4.5} strokeLinecap="round" strokeOpacity={lit('pro')} strokeDasharray={era >= 1 ? '2 3' : undefined} />
        {/* Mesonephros: the long one, thorax to waist. */}
        <path d={arc(MESO[0], MESO[1], R - 2)} fill="none" stroke={UC.meso} strokeWidth={5} strokeLinecap="round" strokeOpacity={lit('meso')} strokeDasharray={era >= 3 ? '3 3' : undefined} />
        {/* Metanephros (the kidney): sacral, then up to the waist. */}
        {era >= 3 && <path d={`M${pt(71, R - 2).join(',')} L${LUMBAR.join(',')}`} stroke={UC.kidney} strokeWidth={1.2} strokeDasharray="2 2" strokeOpacity={0.7} markerEnd="" />}
        <ellipse cx={kidneyAt[0]} cy={kidneyAt[1]} rx={5} ry={6.5} fill={UC.kidney} fillOpacity={lit('meta')} transform={`rotate(${era >= 3 ? 20 : 70} ${kidneyAt[0]} ${kidneyAt[1]})`} />
        {focus === 'adrenal' && <ellipse cx={kidneyAt[0] - 4} cy={kidneyAt[1] - 11} rx={5} ry={3.5} fill={UC.adrenal} />}
        {/* Ureter from the kidney to the cloaca. */}
        <path d={`M${kidneyAt[0]},${kidneyAt[1]} Q${pt(92, R - 4).join(',')} ${CLOACA.join(',')}`} fill="none" stroke={UC.bud} strokeWidth={1.6} strokeOpacity={lit('meta') * 0.9} />
        {/* Cloaca, allantois, genital tubercle. */}
        <circle cx={CLOACA[0]} cy={CLOACA[1]} r={4.5} fill="#f5d06b" fillOpacity={lit('cloaca')} />
        <path d={`M${CLOACA[0] - 4},${CLOACA[1] - 3} Q${CLOACA[0] - 18},${CLOACA[1] - 10} ${CLOACA[0] - 24},${CLOACA[1] - 21}`} fill="none" stroke="#f5d06b" strokeWidth={2} strokeOpacity={lit('cloaca') * 0.7} />
        {focus === 'glans' && <circle cx={pt(118, R - 18)[0]} cy={pt(118, R - 18)[1]} r={4} fill="#e8a0b0" />}
        {/* A section's level: a cut across the back. */}
        {unitCut !== null && (
          <path d={`M${pt(unitCut, R + 13).join(',')} L${pt(unitCut, R - 16).join(',')}`} stroke="#fde68a" strokeWidth={1.6} strokeDasharray="3 2" />
        )}
        {/* You are here. */}
        <circle cx={here[0]} cy={here[1]} r={zoom ? 9 : 7.5} fill="none" stroke="#fde68a" strokeWidth={1.8} />
        {zoom && <path d={`M${here[0] + 6.5},${here[1] + 6.5} l5,5`} stroke="#fde68a" strokeWidth={2.2} strokeLinecap="round" />}
      </g>
      <text x={122} y={28} fill="#fde68a" fontSize={9} fontWeight={650} letterSpacing="0.1em">
        NON GAUDE?
      </text>
      <Lines x={122} y={47} lines={wrap(title, 20)} size={12.5} weight={650} fill="#f5f2ec" lead={15} />
      <Lines x={122} y={47 + wrap(title, 20).length * 15 + 4} lines={wrap(sub, 25)} size={10} weight={450} fill="rgba(245,242,236,0.62)" lead={13} />
      <text x={122} y={h - 12} fill="rgba(245,242,236,0.42)" fontSize={9}>
        burua ↑ · buztana ↓
      </text>
    </g>
  );
}

/** Greedy word wrap for SVG text (the map has no layout engine). */
function wrap(text: string, max: number): string[] {
  const out: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    if (line && (line + ' ' + word).length > max) {
      out.push(line);
      line = word;
    } else line = line ? `${line} ${word}` : word;
  }
  if (line) out.push(line);
  return out.slice(0, 3);
}

function Lines({ x, y, lines, size, weight, fill, lead }: { x: number; y: number; lines: string[]; size: number; weight: number; fill: string; lead: number }) {
  return (
    <text x={x} y={y} fill={fill} fontSize={size} fontWeight={weight}>
      {lines.map((l, i) => (
        <tspan key={i} x={x} dy={i ? lead : 0}>
          {l}
        </tspan>
      ))}
    </text>
  );
}
