'use client';

import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { DEMO_NAME } from '@/lib/demo/demo-script';
import s from './journey.module.css';


/** The narrowest and widest desktop the app inside is laid out for. */
const MIN_W = 1024;
const MAX_W = 1280;

/**
 * The real app, live, in a frame of the onboarding: the same pages a student opens, in demo mode (they
 * write nothing to the student's own progress). The frame lives above the stops, laid over the current
 * stop's `[data-frame-slot]`, so it stays loaded (and keeps its scene) from one stop to the next; it is
 * mounted one stop early, out of sight, so it is ready when its stop comes.
 */
export function AppFrame({
  src,
  shown,
  label,
  host,
  frameRef,
  onScale,
  isReady,
  onReady,
  children,
}: {
  src: string;
  shown: boolean;
  label: string;
  /** The journey's shell: the frame is placed over the slot found inside it. */
  host: RefObject<HTMLElement | null>;
  /** The iframe itself (the journey plays the demos through its window). */
  frameRef: RefObject<HTMLIFrameElement | null>;
  /** Screen pixels per pixel of the app inside (the app runs at a desktop size and is scaled down). */
  onScale?: (k: number) => void;
  /** True once the page inside shows what the stop is about (the 3D drawn, the figure's names placed). */
  isReady: (doc: Document) => boolean;
  onReady: () => void;
  children?: ReactNode;
}) {
  const box = useRef<HTMLDivElement>(null);
  const view = useRef<HTMLDivElement>(null);
  const frame = frameRef;
  const [loaded, setLoaded] = useState(false);
  const [ready, setReady] = useState(false);
  const check = useRef(isReady);
  const done = useRef(onReady);
  const scaled = useRef(onScale);
  useEffect(() => {
    check.current = isReady;
    done.current = onReady;
    scaled.current = onScale;
  });

  useEffect(() => {
    let raf = 0;
    let last = '';
    const place = () => {
      raf = requestAnimationFrame(place);
      const shell = host.current;
      const el = box.current;
      const v = view.current;
      const f = frame.current;
      if (!shell || !el || !v || !f) return;
      const slot = shell.querySelector<HTMLElement>('[data-frame-slot]') ?? shell.querySelector<HTMLElement>('[data-art-slot]');
      // Placed in the frames' layer (the stops' area), wherever the slot is in the stop.
      const h = (el.parentElement ?? shell).getBoundingClientRect();
      const r = slot?.getBoundingClientRect();
      const x = r ? r.left - h.left : 0;
      const y = r ? r.top - h.top : 0;
      const w = r && r.width > 40 ? r.width : 900;
      const hh = r && r.height > 40 ? r.height : 560;
      const key = `${Math.round(x)},${Math.round(y)},${Math.round(w)},${Math.round(hh)}`;
      if (key === last) return;
      last = key;
      el.style.transform = `translate(${x}px, ${y}px)`;
      el.style.width = `${w}px`;
      el.style.height = `${hh}px`;
      const vw = v.clientWidth;
      const vh = v.clientHeight;
      const W = Math.min(MAX_W, Math.max(MIN_W, vw / 0.8));
      const k = vw / W;
      f.style.width = `${W}px`;
      f.style.height = `${vh / k}px`;
      f.style.transform = `scale(${k})`;
      scaled.current?.(k);
    };
    raf = requestAnimationFrame(place);
    return () => cancelAnimationFrame(raf);
  }, [host, frame]);

  useEffect(() => {
    if (!loaded || ready) return;
    let n = 0;
    let settle = 0;
    const id = window.setInterval(() => {
      n++;
      let ok = false;
      try {
        const d = frame.current?.contentDocument;
        ok = !!d && check.current(d);
      } catch {}
      if (ok || n > 64) {
        window.clearInterval(id);
        settle = window.setTimeout(
          () => {
            setReady(true);
            done.current();
          },
          ok ? 700 : 0,
        );
      }
    }, 250);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(settle);
    };
  }, [loaded, ready, frame]);

  return (
    <div ref={box} className={s.frame} data-shown={shown} data-ready={ready} aria-hidden={!shown} inert={!shown}>
      <div className={s.frameBar}>
        <span className={s.frameLive}>
          <i aria-hidden />
          Benetako aplikazioa
        </span>
        <span className={s.frameLabel}>{label}</span>
      </div>
      <div ref={view} className={s.frameView}>
        <iframe ref={frame} name={DEMO_NAME} src={src} title={label} onLoad={() => setLoaded(true)} tabIndex={shown ? 0 : -1} />
        {!ready && (
          <p className={s.frameWait} role="status">
            <i aria-hidden />
            Aplikazioa kargatzen…
          </p>
        )}
        {children}
      </div>
    </div>
  );
}
