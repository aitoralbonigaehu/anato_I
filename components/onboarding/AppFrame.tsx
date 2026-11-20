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
  expanded = false,
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
  /** Grown over the whole screen (the simulator's full screen, shown): the frame travels there and back. */
  expanded?: boolean;
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
  const grown = useRef(expanded);
  useEffect(() => {
    check.current = isReady;
    done.current = onReady;
    scaled.current = onScale;
    grown.current = expanded;
  });

  useEffect(() => {
    let raf = 0;
    let last = '';
    let was: { x: number; y: number; w: number; h: number; big: boolean } | null = null;
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
      const big = grown.current;
      // Grown: the whole window (the frames' layer lets it out while it is).
      const x = big ? -h.left : r ? r.left - h.left : 0;
      const y = big ? -h.top : r ? r.top - h.top : 0;
      const w = big ? window.innerWidth : r && r.width > 40 ? r.width : 900;
      const hh = big ? window.innerHeight : r && r.height > 40 ? r.height : 560;
      const key = `${Math.round(x)},${Math.round(y)},${Math.round(w)},${Math.round(hh)},${big}`;
      if (key === last) return;
      last = key;
      const from = was;
      was = { x, y, w, h: hh, big };
      el.style.width = `${w}px`;
      el.style.height = `${hh}px`;
      if (from && from.big !== big) {
        // FLIP: laid out once at the new size, drawn first where it was, then glides (transform only: smooth).
        el.style.transition = 'none';
        el.style.transform = `translate(${from.x}px, ${from.y}px) scale(${from.w / w}, ${from.h / hh})`;
        void el.offsetWidth;
        el.style.transition = 'transform .85s cubic-bezier(.2, .75, .12, 1), opacity .55s ease';
        el.style.transform = `translate(${x}px, ${y}px)`;
        const end = () => {
          el.style.transition = '';
          el.removeEventListener('transitionend', end);
        };
        el.addEventListener('transitionend', end);
      } else el.style.transform = `translate(${x}px, ${y}px)`;
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
    <div ref={box} className={s.frame} data-shown={shown} data-ready={ready} data-expanded={expanded} aria-hidden={!shown} inert={!shown}>
      <div className={s.frameBar}>
        <span className={s.frameLive}>
          <i aria-hidden />
          Benetako aplikazioa
        </span>
        <span className={s.frameLabel}>{label}</span>
      </div>
      <div ref={view} className={s.frameView}>
        <iframe ref={frame} name={DEMO_NAME} src={src} title={label} onLoad={() => setLoaded(true)} tabIndex={shown ? 0 : -1} allow="fullscreen" allowFullScreen />
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
