'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import { UnderlayContext } from '@/components/kit/context';
import { Stage3D } from '@/components/kit/three/Stage3D';
import { FRONT } from '@/components/scenes/week17/common';
import { PAL0, palateModel } from '@/components/scenes/week18/palate-model';
import { LOOK_V2 } from '@/lib/three-d/scene';
import s from './journey.module.css';

const frames = [
  { week: 6, caption: 'Gandorrak mihiaren alboetan daude.' },
  { week: 7, caption: 'Mihia jaitsi eta gandorrak haren gainean kokatzen dira.' },
  { week: 9, caption: 'Bi gandorrek bat egiten dute erdiko lerroan.' },
];
const camera = FRONT(12, [0, 0.05, 0], -8, 5, [0, 0]);

export default function PalatePreview({
  shared,
  onModel,
}: {
  shared: boolean;
  onModel: (scene: import('./ReleaseFilm').PalateState | null) => void;
}) {
  const [pose, setPose] = useState({ yaw: -0.1, pitch: 0.06 });
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const [time, setTime] = useState(0);
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  const [group, setGroup] = useState<SVGGElement | null>(null);
  const scene = useMemo(() => {
    const swing = Math.min(1, time / 50);
    const fuse = Math.max(0, (time - 50) / 50);
    const { items } = palateModel({ ...PAL0, swing, drop: swing, fuse, sept: 0.15 + 0.4 * swing });
    return { items, camera, look: LOOK_V2 };
  }, [time]);
  const underlay = useMemo(() => (host ? { host, scene: group, zoomed: false } : null), [host, group]);
  useEffect(() => {
    onModel({ items: scene.items, ...pose });
    return () => onModel(null);
  }, [scene, pose, onModel]);
  const frame = frames[Math.round(time / 50)];
  return (
    <div className={s.instrument}>
      <div className={s.instrumentTop}>
        <span>18. GAIA</span>
        <span>Ebakidura koronala</span>
      </div>
      <div
        className={s.model}
        data-camera-target
        onPointerDown={(e) => {
          if (!shared) return;
          pointer.current = { x: e.clientX, y: e.clientY };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerUp={() => {
          pointer.current = null;
        }}
        onPointerCancel={() => {
          pointer.current = null;
        }}
        onPointerMove={(e) => {
          const prev = pointer.current;
          if (!prev) return;
          const dx = e.clientX - prev.x,
            dy = e.clientY - prev.y;
          setPose((p) => ({ yaw: p.yaw + dx * 0.012, pitch: Math.max(-0.85, Math.min(0.85, p.pitch + dy * 0.009)) }));
          pointer.current = { x: e.clientX, y: e.clientY };
        }}
      >
        {!shared && (
          <>
            <div className={s.gl} ref={setHost} />
            <svg viewBox="0 0 1000 640" role="img" aria-label={frame.caption}>
              <g ref={setGroup}>
                <UnderlayContext.Provider value={underlay}>
                  <Stage3D scene={scene} />
                </UnderlayContext.Provider>
              </g>
            </svg>
          </>
        )}
      </div>
      <div className={s.transport}>
        <div className={s.weekKeys}>
          {frames.map((f, i) => (
            <button type="button" key={f.week} aria-pressed={f === frame} onClick={() => setTime(i * 50)}>
              {f.week}. astea
            </button>
          ))}
        </div>
        <input
          type="range"
          aria-label="Aho-sabaiaren garapena"
          aria-valuetext={frame.week + '. astea'}
          min={0}
          max={100}
          value={time}
          onChange={(e) => setTime(Number(e.target.value))}
        />
        <p>{frame.caption}</p>
      </div>
    </div>
  );
}
