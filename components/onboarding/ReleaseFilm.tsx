'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import type { Item3 } from '@/lib/three-d/scene';
import type { openProjector, Exhibit } from '../intro-review/renderStudy';
import v from './show/show.module.css';
import s from './release-film.module.css';

/** The film's own clock (the projector's timeline, components/intro-review): the camera docks at 13.5. */
const end = 13.5;
/**
 * The film is played slower than its projector timeline, and not evenly: time to read the words, a calm
 * neural tube, the somites pair by pair, the body, the skin, the title held. Knots (real s → film s) sit on
 * the score's beats (85.2 bpm, a beat 0.704 s, scripts/intro-v3/music.py `score2`); between them a monotone
 * cubic keeps every point's speed continuous (no jolts where the pace changes).
 */
const BEAT = 60 / 85.2;
const KNOTS: [number, number][] = [
  [0, 0],
  [4 * BEAT, 0.62],
  [7 * BEAT, 1.3],
  [12 * BEAT, 3.97],
  [16 * BEAT, 4.95],
  [20 * BEAT, 6.75],
  [25 * BEAT, 8.95],
  [32 * BEAT, 11.85],
  [35 * BEAT, end],
];
export const FILM_END = KNOTS[KNOTS.length - 1][0];
const SLOPES = (() => {
  const n = KNOTS.length,
    d = KNOTS.slice(1).map(([x, y], i) => (y - KNOTS[i][1]) / (x - KNOTS[i][0])),
    m = KNOTS.map((_, i) => (i === 0 ? d[0] : i === n - 1 ? d[n - 2] : (d[i - 1] + d[i]) / 2));
  // Fritsch–Carlson: no overshoot, so film time never runs backwards.
  for (let i = 0; i < n - 1; i++) {
    const a = m[i] / d[i],
      b = m[i + 1] / d[i],
      h = a * a + b * b;
    if (h > 9) {
      const k = 3 / Math.sqrt(h);
      m[i] = k * a * d[i];
      m[i + 1] = k * b * d[i];
    }
  }
  return m;
})();
/** Real seconds → the projector's seconds. */
function filmTime(real: number) {
  if (real <= 0) return 0;
  const last = KNOTS.length - 1;
  if (real >= KNOTS[last][0]) return end + (real - KNOTS[last][0]);
  let i = 0;
  while (KNOTS[i + 1][0] < real) i++;
  const [x0, y0] = KNOTS[i],
    [x1, y1] = KNOTS[i + 1],
    h = x1 - x0,
    u = (real - x0) / h;
  const h00 = 2 * u ** 3 - 3 * u * u + 1,
    h10 = u ** 3 - 2 * u * u + u,
    h01 = -2 * u ** 3 + 3 * u * u,
    h11 = u ** 3 - u * u;
  return h00 * y0 + h10 * h * SLOPES[i] + h01 * y1 + h11 * h * SLOPES[i + 1];
}
/** What forms now, in film seconds (the projector's births, grains.ts): named as it appears, never pointed at. */
function reading(t: number): { kicker: string; value: string } | null {
  if (t < 0.12) return null;
  if (t < 1.75) return { kicker: 'Apunteak', value: '4. gaia · 3.1' };
  if (t < 2.75) return null;
  if (t < 3.95) return { kicker: '1 · Hodi neurala', value: 'Erdialdean, buztanetik burura' };
  if (t < 5.75) return { kicker: '2 · Somitak', value: 'Bikoteka, hodiaren bi aldeetan' };
  if (t < 6.3) return { kicker: '3 · Bihotz goragunea', value: 'Bihotza taupaka hasten da' };
  if (t < 7.3) return { kicker: '4 · Gorputz-adarren hasikinak', value: 'Besoak eta hankak' };
  if (t < 9.05) return { kicker: '4. gaia', value: '5. asteko enbrioia' };
  return null;
}
/** The heart's pulse (optics.ts `pulse`) peaks on the score's beats: 1.42 a second, 85.2 bpm. */
const pulseAt = (real: number) => 7.5 + real - 0.19 / 1.42;
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
function ease(a: number, b: number, t: number) {
  const u = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return u * u * (3 - 2 * u);
}
export type PalateState = { items: Item3[]; yaw: number; pitch: number };
type Props = {
  opening: boolean;
  step: number;
  destination: number | null;
  onFinish: () => void;
  onLive: (live: boolean) => void;
  focus: number;
  palate: RefObject<PalateState | null>;
  art: RefObject<HTMLDivElement | null>;
  turn: RefObject<{ yaw: number; pitch: number }>;
};
export default function ReleaseFilm(props: Props) {
  const { opening, step } = props,
    latest = useRef(props);
  const canvas = useRef<HTMLCanvasElement>(null),
    title = useRef<HTMLDivElement>(null),
    rail = useRef<HTMLSpanElement>(null),
    instrument = useRef<HTMLDivElement>(null),
    kicker = useRef<HTMLSpanElement>(null),
    value = useRef<HTMLSpanElement>(null);
  // The clock is in real seconds (the score's); the projector gets film seconds (`filmTime`).
  const playback = useRef({ started: false, paused: false, t: opening ? 0 : FILM_END, frozen: false });
  const [started, setStarted] = useState(false),
    [paused, setPaused] = useState(false);
  const [fallback, setFallback] = useState(false),
    [ready, setReady] = useState(false);
  useEffect(() => {
    latest.current = props;
  }, [props]);
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const ac = new AbortController();
    let renderer: Awaited<ReturnType<typeof openProjector>> | undefined,
      id = 0;
    const state = playback.current,
      media = matchMedia('(prefers-reduced-motion: reduce)');
    const stop = () => {
      ac.abort();
      cancelAnimationFrame(id);
      renderer?.dispose();
      renderer = undefined;
      setFallback(true);
      latest.current.onLive(false);
      if (latest.current.opening) latest.current.onFinish();
    };
    const change = () => {
      if (media.matches) stop();
    };
    const loss = (e: Event) => {
      e.preventDefault();
      stop();
    };
    const search = new URL(location.href).searchParams;
    const frozen = search.get('intro') === 'v2' ? search.get('t') : null;
    if (latest.current.opening && frozen !== null && Number.isFinite(Number(frozen))) {
      state.t = Math.max(0, Math.min(FILM_END - 0.01, Number(frozen)));
      state.frozen = true;
      state.started = true;
      setStarted(true);
    }
    media.addEventListener('change', change);
    el.addEventListener('webglcontextlost', loss);
    if (media.matches) stop();
    else
      void import('../intro-review/renderStudy')
        .then(async ({ openProjector }) => {
          if (ac.signal.aborted) return;
          renderer = await openProjector(el, ac.signal);
          if (ac.signal.aborted) {
            renderer.dispose();
            return;
          }
          setReady(true);
          latest.current.onLive(true);
          let prev = 0,
            x = 0,
            y = 0,
            scale = 0,
            yaw = 0,
            pitch = 0,
            skin = 0,
            power = 0,
            flat = 0,
            targetBefore = -1,
            travel = 0;
          let quality = 1,
            slow = 0,
            samples = 0,
            ended = false,
            said = '';
          const tick = (now: number) => {
            if (ac.signal.aborted || !renderer) return;
            const dt = prev ? (now - prev) / 1000 : 0;
            prev = now;
            const { opening, step, destination, onFinish, art, turn, focus, palate } = latest.current;
            if (document.hidden) {
              prev = 0;
              id = requestAnimationFrame(tick);
              return;
            }
            if (opening && !state.started) {
              id = requestAnimationFrame(tick);
              return;
            }
            if (!state.paused && !state.frozen) state.t += Math.min(0.16, dt);
            if (!opening) {
              state.t = Math.max(FILM_END, state.t);
              state.frozen = false;
              state.paused = false;
            }
            const real = state.t,
              t = filmTime(real);
            if (opening) {
              const r = reading(t),
                key = r ? r.kicker + r.value : '';
              if (key !== said && instrument.current && kicker.current && value.current) {
                said = key;
                instrument.current.dataset.on = String(!!r);
                if (r) {
                  kicker.current.textContent = r.kicker;
                  value.current.textContent = r.value;
                }
              }
            }
            if (title.current) {
              title.current.style.opacity = String(ease(9.4, 10.25, t) * (1 - ease(12, 12.78, t)));
              title.current.style.setProperty('--write', String(ease(9.4, 10.75, t) * 100) + '%');
              if (t >= 12.72) {
                const shell = art.current?.closest<HTMLElement>('[data-opening]');
                shell?.style.setProperty('--handoff', String(ease(12.72, end, t)));
              }
            }
            if (rail.current) rail.current.style.transform = 'scaleX(' + Math.min(1, real / FILM_END) + ')';
            const w = el.clientWidth,
              h = el.clientHeight;
            const target = destination ?? step;
            const cameraCue = target === 3 ? 30 + focus : target;
            if (cameraCue !== targetBefore) {
              travel = 0;
              targetBefore = cameraCue;
            }
            travel += dt;
            const slot = art.current,
              detail = slot?.querySelector<HTMLElement>('[data-camera-target]');
            const rect = (detail ?? slot)?.getBoundingClientRect();
            const ax = rect ? rect.left + rect.width / 2 : w * 0.7,
              ay = rect ? rect.top + rect.height / 2 : h * 0.5;
            const unit = rect ? Math.min(rect.height / 8.15, rect.width / 7.8) : h * 0.09;
            let tx = ax,
              ty = ay,
              tr = unit,
              ts = 1,
              tg = 0,
              tf = 0;
            let angle = 0.12 + turn.current.yaw + 0.065 * Math.sin(t * 0.22),
              tilt = turn.current.pitch;
            let exhibit: Exhibit | null = null;
            if (opening) {
              const name = ease(9.25, 10.65, t),
                dock = ease(11.85, end, t),
                portrait = w < h;
              tx = lerp(w * (0.518 + (portrait ? 0 : 0.18) * name), ax, dock);
              // Portrait: the title sits under the embryo, so the embryo rises and shrinks further to leave it room.
              ty = lerp(h * (0.512 - (portrait ? 0.17 : 0) * name), ay, dock);
              tr = lerp(Math.min(h / 9.35, w / 8.3) * (1 - 0.13 * (1 - ease(3, 7.3, t)) - (portrait ? 0.3 : 0.13) * name), unit, dock);
              angle = -0.59 + 0.74 * ease(2.5, 8.75, t) - 0.15 * name;
              tilt = -0.105;
              ts = ease(7.45, 8.9, t);
              tg = 1 - ease(7.5, 8.95, t);
            } else if (target === 1) {
              const dive = ease(0, 0.72, travel);
              tx -= unit * 1.35 * dive;
              ty += unit * 2.28 * dive;
              tr *= 1 + 1.7 * dive;
              ts = 1 - ease(0.3, 0.75, travel);
              if (step === 1 && detail && palate.current) {
                exhibit = { ...palate.current, rect: detail.getBoundingClientRect() };
              }
            } else if (target === 2) {
              tf = 1;
              tg = (1 - ease(1.03, 1.85, travel)) * 0.95;
              ts = 0;
            } else if (target === 3) {
              if (focus) {
                // Frame each landmark inside Kimu's viewing window.
                tr *= 1.75;
                angle = 0.1;
                tilt = -0.08;
                const anchor = focus === 1 ? [-2.52, 0.28] : focus === 2 ? [0.52, 0.93] : [0.72, 2.08];
                tx -= anchor[0] * tr * 0.72;
                ty += anchor[1] * tr * 0.72;
              } else {
                ts = 0;
                tg = (1 - ease(0.5, 1.25, travel)) * 0.8;
              }
            }
            const k = !scale || state.frozen ? 1 : 1 - Math.exp(-Math.min(dt, 0.15) * (opening ? 30 : 8.4));
            x = lerp(x, tx, k);
            y = lerp(y, ty, k);
            scale = lerp(scale, tr, k);
            yaw = lerp(yaw, angle, k);
            pitch = lerp(pitch, tilt, k);
            power = lerp(power, tg, k);
            skin = lerp(skin, ts, k);
            flat = lerp(flat, tf, k);
            // Sample active frames only. A long first shader compilation or tab switch
            // cannot permanently lower quality. CSS coordinates stay independent of resolution.
            if (dt > 0 && dt < 0.15 && !state.paused && !state.frozen) {
              samples++;
              if (dt > 0.022) slow++;
              if (samples === 40) {
                if (slow > 9) quality = Math.max(0.6, quality * 0.83);
                samples = 0;
                slow = 0;
              }
            }
            const settled = (target === 2 || (target === 3 && !focus)) && travel > 2.9;
            if (!settled || opening) {
              const clip = !opening && step === target && (step === 4 || (step === 3 && focus > 0)) ? rect : undefined;
              renderer.draw(
                {
                  t,
                  pulse: pulseAt(real),
                  box: [x, y, scale],
                  angles: [yaw, pitch],
                  skin,
                  grains: power,
                  flat,
                  focus: target === 3 ? focus : 0,
                  motes: opening ? ease(0.1, 2, t) : target === 0 || target === 4 ? 0.25 : 0,
                  exhibit,
                  clip,
                },
                quality,
              );
            }
            if (opening && real >= FILM_END && !ended) {
              ended = true;
              onFinish();
            }
            id = requestAnimationFrame(tick);
          };
          id = requestAnimationFrame(tick);
        })
        .catch(() => {
          if (!ac.signal.aborted) stop();
        });
    return () => {
      ac.abort();
      cancelAnimationFrame(id);
      renderer?.dispose();
      media.removeEventListener('change', change);
      el.removeEventListener('webglcontextlost', loss);
    };
  }, []);
  useEffect(() => {
    if (!opening) return;
    playback.current.started = true;
    // The film starts when it opens.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStarted(true);
  }, [opening]);
  function toggle() {
    const p = playback.current;
    p.frozen = false;
    p.paused = !p.paused;
    setPaused(p.paused);
  }
  return (
    <>
      <canvas ref={canvas} className={s.canvas} hidden={fallback} aria-hidden="true" />
      {opening && (
        <section className={s.film} aria-label="EnbrioAtlas V2: sarrera">
          {started && !ready && <p className={s.waiting}>Somitek egitura bilaterala dute…</p>}
          <div ref={instrument} className={v.instrument} data-on="false" aria-hidden="true">
            <i />
            <span ref={kicker} className={v.kicker} />
            <span ref={value} className={v.value} />
          </div>
          <div ref={title} className={s.wordmark}>
            <p>Ongi etorri</p>
            <h1 id="release-title">
              EnbrioAtlas <b>V2</b>
            </h1>
            <em>Hitzetatik formara.</em>
          </div>
          <button type="button" className={v.skip} onClick={props.onFinish}>
            Saltatu sarrera <span aria-hidden="true">→</span>
          </button>
          {started && (
            <footer className={v.transport}>
              <button type="button" className={v.round} onClick={toggle} aria-label={paused ? 'Erreproduzitu' : 'Pausatu'}>
                {paused ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                    <path d="M3 1.5v11l9-5.5z" fill="currentColor" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                    <path d="M3 1.5h3v11H3zM8 1.5h3v11H8z" fill="currentColor" />
                  </svg>
                )}
              </button>
              <div className={v.rail} aria-hidden="true">
                <span ref={rail} />
              </div>
            </footer>
          )}
        </section>
      )}
      {fallback && !opening && (step === 0 || step === 4) && (
        <style>{'[data-specimen-poster]{opacity:1!important}'}</style>
      )}
    </>
  );
}
