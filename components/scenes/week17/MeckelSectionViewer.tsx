'use client';

import { useContext, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { GhostContext, UnderlayContext, useScene } from '@/components/kit/context';
import type { At3 } from '@/components/kit/three/Stage3D';
import { add, mul, type V3 } from '@/lib/three-d/math';
import { BONES0, type BonesPose } from './bones-model';
import { meckelPlane, meckelSection } from './meckel-section';
import styles from './meckel-section.module.css';

type Point = readonly [number, number];
type Loops = readonly (readonly Point[])[];
type Tissue = 'mesenchyme' | 'cartilage' | 'bone';
// One square field fits the cartilage and the fully formed bone at both stations.
const LEFT = -0.35, TOP = 0.48, SIDE = 1.35;
const corners: Point[] = [[LEFT, TOP], [LEFT + SIDE, TOP], [LEFT + SIDE, TOP - SIDE], [LEFT, TOP - SIDE]];
const names: Record<Tissue, string> = { mesenchyme: 'Mesenkima', cartilage: 'Meckel kartilagoa', bone: 'Barail-hezurra' };
const explanations: Record<Tissue, string> = {
  mesenchyme: 'Kartilagoaren inguruko mesenkiman hasten da hezurtzea.',
  cartilage: 'Meckel kartilagoa gida da. Haren profila txikitu egiten da endekatzean.',
  bone: 'Ertz argiak ebakidura honetara iritsi den barail-hezurra erakusten du.',
};

function outline(loops: Loops, closed = true) {
  return loops.map(ring => ring.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(4)} ${(-y).toFixed(4)}`).join(' ') + (closed ? 'Z' : '')).join(' ');
}

export function MeckelSectionViewer({ at, pose }: { at: At3; pose: BonesPose }) {
  const underlay = useContext(UnderlayContext);
  const ghost = useContext(GhostContext);
  const scene = useScene();
  const [opened, setOpened] = useState(false);
  const [station, setStation] = useState<0 | 1>(0);
  const [picked, setPicked] = useState<Tissue | null>(null);
  const [point, setPoint] = useState<Point | null>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const mesFillId = useId();
  const cartFillId = useId();
  const boneFillId = useId();
  const active = !!underlay && !ghost && !scene.quiz && !scene.numberOf;
  // The pose evaluator creates a new object on every camera frame. Reuse the slice when
  // only the camera moves; a change of absolute time or station recomputes its contours.
  const { adult, bone, deg } = pose;
  const inspect = opened || picked !== null;
  const data = useMemo(() => inspect && active ? meckelSection({ ...BONES0, adult, bone, deg }, station) : null,
    [inspect, active, adult, bone, deg, station]);
  if (!active || !underlay.host.parentElement) return null;
  const plane = data ?? meckelPlane(pose, station);
  const { origin, right, up } = plane;
  const inWorld = (x: number, y: number): V3 => add(add(origin, mul(right, x)), mul(up, y));
  const projectPath = (loops: Loops, closed = true) => loops.map(ring => ring.map(([x, y], i) => {
    const p = at(inWorld(x, y));
    return `${i ? 'L' : 'M'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
  }).join(' ') + (closed ? 'Z' : '')).join(' ');
  const closed = () => { setOpened(false); toggle.current?.focus(); };
  const tissueVisible = (key: Tissue) => key === 'mesenchyme' || !!data?.[key].length;
  const selection = picked && tissueVisible(picked) ? picked : null;
  const choose = (key: Tissue, here: Point | null = null) => {
    setPoint(here);
    setPicked(current => current === key && !here ? null : key);
  };
  const matchingPoint = data && selection && point && data.tissueAt(...point) === selection ? point : null;
  const worldPoint = matchingPoint && at(inWorld(...matchingPoint));
  const layer = (key: 'cartilage' | 'bone', paths: Loops, fillId: string) => paths.length > 0 && (
    <path d={outline(paths)} fill={`url(#${fillId})`} fillRule="evenodd" stroke={selection === key ? '#fff9de' : key === 'bone' ? '#8f734e' : '#225652'}
      strokeWidth={selection === key ? 3 : 1.3} vectorEffect="non-scaling-stroke" />
  );
  return <>
    <g aria-hidden="true" pointerEvents="none">
      <path d={projectPath([corners])} fill="#96dcd2" fillOpacity={opened ? 0.16 : 0.07} stroke="#c6f7ee" strokeWidth={opened ? 2 : 1.25} strokeDasharray={opened ? undefined : '6 4'} />
      {data && selection && selection !== 'mesenchyme' && <path d={projectPath(data[selection])} fill="#fff6ca" fillOpacity={0.5} fillRule="evenodd" stroke="#fff9de" strokeWidth={2.8} />}
      {data && selection === 'bone' && data.front.length > 0 && <path d={projectPath(data.front, false)} fill="none" stroke="#9b4433" strokeWidth={2.6} />}
      {worldPoint && <circle cx={worldPoint.x} cy={worldPoint.y} r={4} fill="#fff9de" stroke="#493b2d" strokeWidth={2} />}
    </g>
    {createPortal(
      <div className={`${styles.host} ${opened ? styles.open : ''}`}
        onPointerDown={e => e.stopPropagation()} onPointerUp={e => e.stopPropagation()} onPointerMove={e => e.stopPropagation()}
        onClick={e => e.stopPropagation()} onDoubleClick={e => e.stopPropagation()}
        onKeyDown={e => { if (e.key === ' ') e.stopPropagation(); if (e.key === 'Escape' && opened) { e.stopPropagation(); closed(); } }}>
        <button className={styles.toggle} type="button" ref={toggle} aria-expanded={opened} aria-controls={opened ? panelId : undefined}
          onClick={() => setOpened(value => !value)}>
          <span aria-hidden="true">{opened ? '←' : '⊞'}</span>{opened ? 'Ikuspegi osora itzuli' : 'Ebakidura ireki'}
        </button>
        {opened && data && <section id={panelId} className={styles.panel} aria-label="Meckel kartilagoaren zeharkako ebakidura">
          <div className={styles.heading}><h3>Zeharkako ebakidura</h3><small>Ezkerreko baraila · eskema</small></div>
          <div className={styles.stations} role="group" aria-label="Ebakiduraren kokapena">
            {(['Aurrekoa', 'Atzekoa'] as const).map((label, i) => <button type="button" key={label} aria-pressed={station === i}
              onClick={() => { setStation(i === 0 ? 0 : 1); setPoint(null); }}>{label}</button>)}
          </div>
          <svg className={styles.plot} viewBox={`${LEFT} ${-TOP} ${SIDE} ${SIDE}`} role="img"
            onClick={event => {
              const svg = event.currentTarget;
              const transform = svg.getScreenCTM();
              if (!transform) return;
              const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(transform.inverse());
              if (point.x >= LEFT && point.x <= LEFT + SIDE && point.y >= -TOP && point.y <= SIDE - TOP) {
                choose(data.tissueAt(point.x, -point.y), [point.x, -point.y]);
              }
            }}
            aria-label={`${station === 0 ? 'Aurreko' : 'Atzeko'} ebakidura: ${(['mesenchyme', 'cartilage', 'bone'] as const).filter(tissueVisible).map(key => names[key]).join(', ')}`}>
            <defs>
              <linearGradient id={mesFillId} x2=".3" y2="1"><stop stopColor="#c29d88" /><stop offset=".56" stopColor="#b48773" /><stop offset="1" stopColor="#9c6c59" /></linearGradient>
              <linearGradient id={cartFillId} x2=".6" y2="1"><stop stopColor="#ccf2e8" /><stop offset=".68" stopColor="#8fc9bc" /><stop offset="1" stopColor="#5f9c92" /></linearGradient>
              <linearGradient id={boneFillId} x2=".4" y2="1"><stop stopColor="#fff4cb" /><stop offset=".65" stopColor="#e9d5a4" /><stop offset="1" stopColor="#c5a777" /></linearGradient>
            </defs>
            <rect x={LEFT} y={-TOP} width={SIDE} height={SIDE} fill={`url(#${mesFillId})`} />
            {layer('bone', data.bone, boneFillId)}
            {data.front.length > 0 && <path d={outline(data.front, false)} fill="none" stroke="#9b4433" strokeWidth={selection === 'bone' ? 2.8 : 1.8} vectorEffect="non-scaling-stroke" />}
            {layer('cartilage', data.cartilage, cartFillId)}
            {matchingPoint && <circle cx={matchingPoint[0]} cy={-matchingPoint[1]} r={0.026} fill="#fff9de" stroke="#493b2d" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />}
          </svg>
          <div className={styles.tissues} role="group" aria-label="Ebakidurako ehunak">
            {(['mesenchyme', 'cartilage', 'bone'] as const).filter(tissueVisible).map(key => <button type="button" key={key} aria-pressed={selection === key} onClick={() => choose(key)}>
              <i aria-hidden="true" className={styles[key]} />{names[key]}</button>)}
          </div>
          <p aria-live="polite">{selection === 'bone' && data.front.length ? 'Hezurtze-frontea marra gorriz ageri da: hemendik aurrera mesenkima dago.' : selection ? explanations[selection] : 'Hautatu ehun bat ebakiduran.'}</p>
        </section>}
      </div>, underlay.host.parentElement)}
  </>;
}
