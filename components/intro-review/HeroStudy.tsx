'use client';

import { useEffect, useRef, useState } from 'react';
import { renderStudy } from './renderStudy';
import s from './study.module.css';

export function HeroStudy({ time }: { time: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [fallback, setFallback] = useState(false);
  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const abort = new AbortController();
    let dispose: (() => void) | undefined;
    renderStudy(element, time, abort.signal)
      .then((cleanup) => {
        if (abort.signal.aborted) cleanup();
        else dispose = cleanup;
      })
      .catch(() => {
        if (!abort.signal.aborted) setFallback(true);
      });
    return () => {
      abort.abort();
      dispose?.();
    };
  }, [time]);
  return (
    <main className={s.study} aria-label="Bosgarren asteko enbrioia, alboko ikuspegian">
      <canvas
        ref={canvas}
        hidden={fallback}
        role="img"
        aria-label="Bosgarren asteko enbrioia argi zeharrargitan. Bihotz-goragunea eta bizkarreko somitak ikus daitezke."
      />
      {fallback && (
        <picture>
          <source media="(orientation:portrait)" srcSet="/intro-review/hero-portrait.webp" />
          <img src="/intro-review/hero-landscape.webp" alt="Bosgarren asteko enbrioia" />
        </picture>
      )}
    </main>
  );
}
