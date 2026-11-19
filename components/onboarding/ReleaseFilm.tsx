'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import type { Item3 } from '@/lib/three-d/scene';
import type { openProjector, Exhibit } from '../intro-review/renderStudy';
import { filmAudioChange } from '@/components/shell/StudyMusic';
import s from './release-film.module.css';

const end = 13.5;
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
function soundtrack(offset: number) {
  const ctx = new AudioContext(),
    bus = ctx.createGain();
  bus.gain.value = 0.13;
  bus.connect(ctx.destination);
  const start = ctx.currentTime;
  function tone(at: number, hz: number, duration: number, volume: number, attack: number, fall = 1) {
    const elapsed = Math.max(0, offset - at);
    const remaining = duration - elapsed;
    if (remaining <= 0.03) return;
    const onset = start + Math.max(0, at - offset);
    const osc = ctx.createOscillator(),
      env = ctx.createGain();
    osc.frequency.setValueAtTime(hz * fall ** (elapsed / duration), onset);
    osc.frequency.exponentialRampToValueAtTime(hz * fall, onset + remaining);
    env.gain.setValueAtTime(0.0001, onset);
    env.gain.exponentialRampToValueAtTime(volume, onset + Math.min(remaining / 2, Math.max(0.02, attack - elapsed)));
    env.gain.exponentialRampToValueAtTime(0.0001, onset + remaining);
    osc.connect(env);
    env.connect(bus);
    osc.start(onset);
    osc.stop(onset + remaining);
  }
  for (let t = 3.27; t < 12.3; t += 1 / 1.42) {
    tone(t, 77, 0.22, 0.46, 0.026, 0.58);
    tone(t + 0.17, 67, 0.15, 0.18, 0.02, 0.73);
  }
  tone(0.35, 110, 8.4, 0.19, 2.5);
  tone(2.2, 164.81, 7.2, 0.14, 2.1);
  tone(4.1, 261.63, 4.7, 0.1, 1.6);
  // The skin resolves, then the title arrives and the camera docks.
  tone(7.45, 220, 4.7, 0.19, 1.15);
  tone(7.65, 329.63, 4.4, 0.1, 0.9);
  tone(9.25, 261.63, 3.9, 0.19, 0.42);
  tone(9.52, 392, 3.7, 0.14, 0.25);
  tone(9.88, 523.25, 3.4, 0.09, 0.21);
  tone(11.85, 130.81, 1.59, 0.11, 0.33);
  return { ctx, bus };
}
export default function ReleaseFilm(props: Props) {
  const { opening, step } = props,
    latest = useRef(props);
  const canvas = useRef<HTMLCanvasElement>(null),
    title = useRef<HTMLDivElement>(null),
    rail = useRef<HTMLSpanElement>(null);
  const playback = useRef({ started: false, paused: false, t: opening ? 0 : end, frozen: false });
  const sound = useRef<ReturnType<typeof soundtrack> | null>(null);
  const [started, setStarted] = useState(false),
    [paused, setPaused] = useState(false),
    [muted, setMuted] = useState(true);
  const [fallback, setFallback] = useState(false),
    [ready, setReady] = useState(false);
  useEffect(() => {
    latest.current = props;
  }, [props]);
  useEffect(() => {
    if (!opening) {
      void sound.current?.ctx.close().catch(() => {});
      sound.current = null;
    }
    if (opening) window.dispatchEvent(new CustomEvent(filmAudioChange, { detail: true }));
    return () => {
      if (opening) window.dispatchEvent(new CustomEvent(filmAudioChange, { detail: false }));
      void sound.current?.ctx.close().catch(() => {});
      sound.current = null;
    };
  }, [opening]);
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
      state.t = Math.max(0, Math.min(end - 0.01, Number(frozen)));
      state.frozen = true;
      state.started = true;
      setStarted(true);
    }
    const visibility = () => {
      const score = sound.current;
      if (!score || !renderer || !state.started || state.paused) return;
      void (document.hidden ? score.ctx.suspend() : score.ctx.resume()).catch(() => {});
    };
    document.addEventListener('visibilitychange', visibility);
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
          if (state.started && !state.paused) void sound.current?.ctx.resume().catch(() => {});
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
            ended = false;
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
              state.t = Math.max(end, state.t);
              state.frozen = false;
              state.paused = false;
            }
            const t = state.t;
            if (title.current) {
              title.current.style.opacity = String(ease(9.4, 10.25, t) * (1 - ease(12, 12.78, t)));
              title.current.style.setProperty('--write', String(ease(9.4, 10.75, t) * 100) + '%');
              if (t >= 12.72) {
                const shell = art.current?.closest<HTMLElement>('[data-opening]');
                shell?.style.setProperty('--handoff', String(ease(12.72, end, t)));
              }
            }
            if (rail.current) rail.current.style.transform = 'scaleX(' + Math.min(1, t / end) + ')';
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
              ty = lerp(h * (0.512 - (portrait ? 0.12 : 0) * name), ay, dock);
              tr = lerp(Math.min(h / 9.35, w / 8.3) * (1 - 0.13 * (1 - ease(3, 7.3, t)) - 0.13 * name), unit, dock);
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
            if (opening && t >= end && !ended) {
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
      document.removeEventListener('visibilitychange', visibility);
      media.removeEventListener('change', change);
      el.removeEventListener('webglcontextlost', loss);
    };
  }, []);
  function enableSound() {
    try {
      const score = sound.current ?? soundtrack(playback.current.t);
      sound.current = score;
      score.bus.gain.setTargetAtTime(0.13, score.ctx.currentTime, 0.025);
      void (ready && !paused ? score.ctx.resume() : score.ctx.suspend()).catch(() => {});
      setMuted(false);
    } catch {}
  }
  useEffect(() => {
    if (!opening) return;
    playback.current.started = true;
    setStarted(true);
  }, [opening]);
  function toggle() {
    playback.current.frozen = false;
    playback.current.paused = !paused;
    setPaused(!paused);
    if (sound.current) void (paused ? sound.current.ctx.resume() : sound.current.ctx.suspend()).catch(() => {});
  }
  return (
    <>
      <canvas ref={canvas} className={s.canvas} hidden={fallback} aria-hidden="true" />
      {opening && (
        <section className={s.film} aria-label="EnbrioAtlas V2">
          {started && !ready && <p className={s.waiting}>Somitek egitura bilaterala dute…</p>}
          <div ref={title} className={s.wordmark}>
            <p>Ongi etorri</p>
            <h1 id="release-title">
              EnbrioAtlas <b>V2</b>
            </h1>
            <em>Hitzetatik formara.</em>
          </div>
          <button type="button" className={s.skip} onClick={props.onFinish}>
            Sarrera saltatu ↗
          </button>
          {started && (
            <footer className={s.transport}>
              <button type="button" onClick={toggle}>
                {paused ? 'Erreproduzitu' : 'Pausatu'}
              </button>
              <div className={s.rail} aria-hidden="true">
                <span ref={rail} />
              </div>
                <button
                  type="button"
                  aria-pressed={!muted}
                  onClick={() => {
                    if (muted) {
                      enableSound();
                    } else {
                      const score = sound.current;
                      if (score) score.bus.gain.setTargetAtTime(0, score.ctx.currentTime, 0.025);
                      setMuted(true);
                    }
                  }}
                >
                  {muted ? 'Soinua piztu' : 'Soinua itzali'}
                </button>
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
