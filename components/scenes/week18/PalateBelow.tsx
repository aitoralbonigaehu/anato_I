'use client';

import { ARCH } from '@/components/scenes/week17/arch-colors';
import { TISSUE } from '@/components/scenes/week17/common';
import { PALATE_PLAN as P, type PalatePose } from './palate-model';
import { G18 } from './tones';

/**
 * Topic 18, the palatal shelves: the palate seen from below (jaw and tongue taken away), drawn beside the 3D front
 * cut and computed from the same pose. The notes and the textbooks pair the two: in the cut the shelves hang
 * beside the tongue, swing up over it and meet; from below the same shelves are two narrow strips far apart,
 * then two plates nearly touching, then one palate zipped from the incisive foramen backwards. The blue line is
 * where the 3D is cut.
 *
 * Plan units are the model's (x towards the embryo's LEFT = the viewer's right, z ventral = up in the picture).
 */

/** The inset's box in the 3D view's 1000 × 640 frame: bottom left, under the left name column. */
export const BELOW_BOX = { x: 14, y: 316, w: 300, h: 282 } as const;
/** While it shows, the left name column keeps above it. */
export const BELOW_LEFT: [number, number] = [120, 300];

const K = 40;
const CX = 92;
const FRONT_Y = 48;
const X = (x: number) => CX + x * K;
const Y = (z: number) => FRONT_Y + (P.Z_END - z) * K;
const f1 = (n: number) => n.toFixed(1);
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const ss = (a: number, b: number, x: number) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const range = (a: number, b: number, n: number) => Array.from({ length: n }, (_, i) => a + ((b - a) * i) / (n - 1));
const path = (pts: [number, number][], close = true) => `M${pts.map(([x, z]) => `${f1(X(x))},${f1(Y(z))}`).join('L')}${close ? 'Z' : ''}`;

const SHELF = ARCH.i;
const PRIMARY = '#f6d95a';
const LABEL_X = 172;

type Label = { id: string; text: string[]; at: [number, number]; y?: number; tone?: string };

export function PalateBelow({ pose, lit, show }: { pose: PalatePose; lit: readonly string[] | null; show: number }) {
  if (show <= 0.01) return null;
  const on = (...ids: string[]) => !lit || ids.some((id) => lit.includes(id));
  const op = (...ids: string[]) => (on(...ids) ? 1 : 0.66);
  const swing = clamp01(pose.swing);
  const fuse = clamp01(pose.fuse);
  const sept = clamp01(pose.sept);
  // The model's zipper: fused ahead of `front` (towards the incisors).
  const front = P.Z_END + 0.2 + (P.Z_BACK - 0.2 - (P.Z_END + 0.2)) * fuse;
  const fusedAt = (z: number) => ss(front - 0.12, front + 0.04, z);
  const th = (1 - swing) * 1.33;
  const outer = (z: number) => P.hw(z) + 0.18;
  // Seen from below a hanging shelf shows only its width projected on the roof: cos of its angle down.
  const inner = (z: number) => {
    const xr = outer(z);
    const tip = Math.min(xr, P.tri(z) + 0.2 * (1 - fusedAt(z)));
    return Math.max(0, xr - (xr - tip) * Math.cos(th));
  };
  const zs = range(P.Z_BACK, P.Z_J, 48);
  const shelf = (s: 1 | -1) => path([...zs.map((z): [number, number] => [s * outer(z), z]), ...[...zs].reverse().map((z): [number, number] => [s * inner(z), z])]);
  const vault = range(P.Z_BACK, P.Z_END, 48);
  const roof = path([...vault.map((z): [number, number] => [outer(z), z]), ...[...vault].reverse().map((z): [number, number] => [-outer(z), z])]);
  const tz = range(P.Z_F, P.Z_END, 32);
  const tri = (z: number) => Math.min(P.tri(z), P.hw(z) + 0.18);
  const primary = path([...tz.map((z): [number, number] => [tri(z), z]), ...[...tz].reverse().map((z): [number, number] => [-tri(z), z])]);
  const A = P.hw(P.Z_J) + 0.24;
  const ridgeSide = (s: 1 | -1) => path(zs.map((z): [number, number] => [s * (P.hw(z) + 0.24), z]), false);
  const arc = path(range(-A, A, 24).map((t): [number, number] => [t, P.Z_END - (0.5 * t * t) / A]), false);
  // The raphe: the zipped midline, from the foramen back to the zipper.
  const rapheEnd = Math.max(P.Z_BACK, Math.min(P.Z_F - 0.12, front));
  const rapheLen = P.Z_F - 0.12 - rapheEnd;
  const gapOpen = 1 - ss(0.55, 0.9, fuse);
  const week = fuse > 0.5 ? '9. astea' : swing > 0.5 ? '7. astea' : '6. astea';

  const labels: Label[] = [
    { id: 'hasierako-aho-sabaia', text: ['Hasierako', 'aho sabaia'], at: [0.12, 1.55], y: 70 },
    { id: 'ebakortz-zuloa', text: ['Ebakortz zuloa'], at: [0, P.Z_F], y: 98 },
    { id: 'ebaki-planoa', text: ['3D ebakia'], at: [A + 0.12, P.Z_CUT], y: Y(P.Z_CUT) + 4, tone: '#9fd3ff' },
    { id: 'aho-sabai-gandorrak', text: ['Gandorrak'], at: [(outer(-0.5) + inner(-0.5)) / 2, -0.5], y: Y(-0.5) + 6 },
  ];
  if (rapheLen > 0.7) labels.push({ id: 'aho-sabaiko-errafea', text: ['Errafea'], at: [0, P.Z_F - 0.12 - rapheLen * 0.62], y: 188 });
  else if (sept > 0.3 && gapOpen > 0.3) labels.push({ id: 'sudur-trenkada', text: ['Trenkada', '(zirrikituan)'], at: [0, -1.25], y: 188 });

  return (
    <g transform={`translate(${BELOW_BOX.x} ${BELOW_BOX.y})`} opacity={show} pointerEvents="none" aria-label={`Aho sabaia behetik, ${week}`}>
      <rect width={BELOW_BOX.w} height={BELOW_BOX.h} rx={14} fill="rgba(12,12,15,0.82)" stroke="rgba(255,255,255,0.12)" />
      <text x={12} y={20} style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: 0.4 }} fill="#f4e6c8">
        BEHETIK
      </text>
      <text x={72} y={20} style={{ fontSize: 10.5 }} fill="#b8b0c4">
        mihia kenduta
      </text>
      <text x={BELOW_BOX.w - 12} y={21} textAnchor="end" style={{ fontSize: 15, fontWeight: 750 }} fill="#ffb15c">
        {week}
      </text>
      <text x={CX} y={FRONT_Y - 14} textAnchor="middle" style={{ fontSize: 10.5, fontWeight: 600 }} fill="#b8b0c4">
        aurrea
      </text>
      <text x={CX} y={Y(P.Z_BACK) + 20} textAnchor="middle" style={{ fontSize: 10.5, fontWeight: 600 }} fill="#b8b0c4">
        atzea
      </text>
      <text x={12} y={BELOW_BOX.h - 10} style={{ fontSize: 11, fontWeight: 600 }} fill="#b8b0c4">
        ◀ eskuina
      </text>
      <text x={LABEL_X - 4} y={BELOW_BOX.h - 10} style={{ fontSize: 11, fontWeight: 600 }} fill="#b8b0c4">
        ezkerra ▶
      </text>

      {/* The roof seen through the gap: the nasal cavity, and the septum coming down into it. */}
      <path d={roof} fill={G18.cavity} />
      <rect x={X(-0.07)} y={Y(P.Z_F - 0.1)} width={0.14 * K} height={(P.Z_F - 0.1 - P.Z_BACK) * K} rx={2} fill={TISSUE.bone} opacity={ss(0.05, 0.5, sept) * 0.85 * op('sudur-trenkada')} />
      <path d={shelf(-1)} fill={SHELF} opacity={op('aho-sabai-gandorrak', 'aho-sabai-gogorra')} />
      <path d={shelf(1)} fill={SHELF} opacity={op('aho-sabai-gandorrak', 'aho-sabai-gogorra')} />
      <path d={primary} fill={PRIMARY} opacity={op('hasierako-aho-sabaia', 'aho-sabai-gogorra')} />
      {/* The alveolar ridge: the maxillary processes at the sides, the intermaxillary segment in front. */}
      <path d={ridgeSide(-1)} fill="none" stroke={SHELF} strokeWidth={9} strokeLinecap="round" opacity={0.9 * op('luzapen-maxilarra', 'aho-sabai-gandorrak')} />
      <path d={ridgeSide(1)} fill="none" stroke={SHELF} strokeWidth={9} strokeLinecap="round" opacity={0.9 * op('luzapen-maxilarra', 'aho-sabai-gandorrak')} />
      <path d={arc} fill="none" stroke={PRIMARY} strokeWidth={9} strokeLinecap="round" opacity={0.9 * op('maxilar-arteko-segmentua', 'hasierako-aho-sabaia')} />
      {rapheLen > 0.02 && <line x1={X(0)} y1={Y(P.Z_F - 0.12)} x2={X(0)} y2={Y(rapheEnd)} stroke="#fff0c2" strokeWidth={1.6} opacity={op('aho-sabaiko-errafea', 'aho-sabai-gandorrak')} />}
      <circle cx={X(0)} cy={Y(P.Z_F)} r={3.4} fill="#2a2230" stroke="#fff0c2" strokeWidth={0.8} />
      {/* Where the 3D beside is cut. */}
      <line x1={X(-A - 0.12)} y1={Y(P.Z_CUT)} x2={X(A + 0.12)} y2={Y(P.Z_CUT)} stroke="#9fd3ff" strokeWidth={1.4} opacity={0.9} />

      {labels.map((l) => {
        const px = X(l.at[0]);
        const py = Y(l.at[1]);
        const ty = l.y ?? py;
        const lines = l.text.length;
        const hot = lit?.includes(l.id);
        return (
          <g key={l.id}>
            <path d={`M${f1(px)},${f1(py)}L${LABEL_X - 5},${f1(ty - 4 - ((lines - 1) * 13) / 2)}`} stroke={l.tone ?? '#eee6f4'} strokeOpacity={0.6} strokeWidth={1} fill="none" />
            {l.tone ? null : <circle cx={px} cy={py} r={2} fill="#ffd27a" />}
            <text x={LABEL_X} y={ty - ((lines - 1) * 13) / 2} style={{ fontSize: 12.5, fontWeight: 700, paintOrder: 'stroke', stroke: 'rgba(10,8,14,0.92)', strokeWidth: 3.4, strokeLinejoin: 'round' }} fill={l.tone ?? (hot ? '#ffd27a' : '#eee6f4')}>
              {l.text.map((t, i) => (
                <tspan key={t} x={LABEL_X} dy={i ? 13 : 0}>
                  {t}
                </tspan>
              ))}
            </text>
          </g>
        );
      })}
    </g>
  );
}
