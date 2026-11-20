'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { enableStudyMusic, filmAudioChange } from '@/components/shell/StudyMusic';
import { N, SWARM, model, openEngine, type Engine, type Shape, type Shot } from './engine';
import { END, HITS, LINES, T, camera, ease, frustum, introShot, label, skinAt } from './intro';
import type { openProjector } from '../../intro-review/renderStudy';
import { L, loadCloud, notesText, wordmark } from './shapes';
import s from './show.module.css';

/**
 * The opening show (a film of points, ~24 s, with its score) and, after it, the same points as the journey's
 * picture: the face fusing on the first stop, the skull on the last, a quiet dust between (where the live app
 * frames take the stage, the canvas stops drawing altogether).
 */
export type Place = 'face' | 'skull' | 'rest';
export type Pose = { yaw: number; pitch: number };
type Props = {
  opening: boolean;
  place: Place;
  /** Where the journey is going (the points leave as the page does). */
  toward: Place;
  onFinish: () => void;
  onLive: (live: boolean) => void;
  /** The journey's picture slot (its [data-camera-target] child if any): where the points sit. */
  art: RefObject<HTMLDivElement | null>;
  /** The journey's shell: it takes over during the film's last second. */
  shell: RefObject<HTMLDivElement | null>;
  turn: RefObject<Pose>;
};

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const CLOUDS: [string, number][] = [
  ['embryo', L.embryo],
  ['skull', L.skull],
  ['face5', L.face5],
  ['face10', L.face10],
];
/** How long the points take to go from one place to the next (s). */
const TRAVEL = 1.7;

export default function Show(props: Props) {
  const latest = useRef(props);
  const canvas = useRef<HTMLCanvasElement>(null);
  // The earlier film's skin render (the embryo turns solid for a few seconds), drawn over the points.
  const skinCanvas = useRef<HTMLCanvasElement>(null);
  const caption = useRef<HTMLParagraphElement>(null);
  const tag = useRef<HTMLDivElement>(null);
  const kicker = useRef<HTMLSpanElement>(null);
  const value = useRef<HTMLSpanElement>(null);
  const instrument = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLSpanElement>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const clock = useRef({ t: 0, paused: false, frozen: false, ended: false });
  const [ready, setReady] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [paused, setPaused] = useState(false);
  const [sound, setSound] = useState(false);

  useEffect(() => {
    latest.current = props;
  }, [props]);

  // The ambient music waits while the film plays (the film has its own score).
  useEffect(() => {
    if (!props.opening) return;
    window.dispatchEvent(new CustomEvent(filmAudioChange, { detail: true }));
    return () => {
      window.dispatchEvent(new CustomEvent(filmAudioChange, { detail: false }));
    };
  }, [props.opening]);

  useEffect(() => {
    const cv = canvas.current;
    if (!cv) return;
    const el: HTMLCanvasElement = cv;
    const ac = new AbortController();
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    let engine: Engine | null = null,
      raf = 0;
    let skin: Awaited<ReturnType<typeof openProjector>> | null = null,
      skinFrom = -1;
    const skinEl = skinCanvas.current;
    const dropSkin = () => {
      skin?.dispose();
      skin = null;
      if (skinEl) skinEl.style.visibility = 'hidden';
    };
    const loaded = new Set<number>();
    const stop = () => {
      ac.abort();
      cancelAnimationFrame(raf);
      engine?.dispose();
      engine = null;
      setFallback(true);
      latest.current.onLive(false);
      if (latest.current.opening) latest.current.onFinish();
    };
    const lost = (e: Event) => {
      e.preventDefault();
      stop();
    };
    el.addEventListener('webglcontextlost', lost);
    const motion = () => media.matches && stop();
    media.addEventListener('change', motion);
    const search = new URL(location.href).searchParams;
    const frozenAt = search.get('intro') === 'v3' ? Number(search.get('t')) : NaN;
    if (Number.isFinite(frozenAt) && search.has('t')) {
      clock.current.t = Math.max(0, Math.min(END - 0.01, frozenAt));
      clock.current.frozen = true;
    }

    // The pointer parts the points; it is followed in device pixels with a short memory.
    const pointer = { x: -1e4, y: -1e4, push: 0, moved: 0 };
    const move = (e: PointerEvent) => {
      if (!engine) return;
      const k = engine.width / Math.max(1, el.clientWidth);
      const r = el.getBoundingClientRect();
      pointer.x = (e.clientX - r.left) * k;
      pointer.y = (r.bottom - e.clientY) * k;
      pointer.moved = performance.now();
    };
    window.addEventListener('pointermove', move, { passive: true });

    const run = async () => {
      if (media.matches) return stop();
      // The skin needs its volume (~0.75 MB) by second 9; if it is late the points simply stay points.
      if (latest.current.opening && skinEl)
        void import('../../intro-review/renderStudy')
          .then(({ openProjector }) => openProjector(skinEl, ac.signal, false))
          .then((p) => {
            if (ac.signal.aborted || !latest.current.opening) return p.dispose();
            skin = p;
          })
          .catch(() => {});
      engine = await openEngine(el, ac.signal);
      if (ac.signal.aborted) return engine.dispose();
      // The words and the wordmark are drawn here (fonts first, briefly); the clouds come over the network.
      await Promise.race([document.fonts?.ready, new Promise((r) => setTimeout(r, 700))]);
      const text = notesText();
      engine.upload(L.text, text.xyzw, text.rgb);
      const logo = wordmark();
      engine.upload(L.logo, logo.xyzw, logo.rgb);
      loaded.add(L.text).add(L.logo);
      for (const [name, layer] of CLOUDS)
        void loadCloud(name, ac.signal)
          .then((c) => {
            if (!engine || ac.signal.aborted) return;
            engine.upload(layer, c.xyzw, c.rgb);
            loaded.add(layer);
          })
          .catch(() => {});
      setReady(true);
      latest.current.onLive(true);
      loop();
    };

    function loop() {
      let prev = 0,
        count = N,
        slowFrames = 0,
        sampled = 0,
        scale = 1;
      // The journey's places: where the points were, where they go, and since when.
      let from: Shape | null = null,
        going: Place | null = null,
        since = 0,
        journeyT = 0,
        lastB: Shape | null = null,
        drewRest = false,
        caps = -1,
        lab = '',
        hit = 0;
      const tick = (now: number) => {
        if (!engine || ac.signal.aborted) return;
        raf = requestAnimationFrame(tick);
        if (document.hidden) {
          prev = 0;
          return;
        }
        const dt = prev ? Math.min(0.1, (now - prev) / 1000) : 0;
        prev = now;
        const { opening, place, toward, onFinish, art, turn } = latest.current;
        const c = clock.current;
        const W = el.clientWidth,
          H = el.clientHeight,
          aspect = W / Math.max(1, H);
        const sinceMove = (now - pointer.moved) / 1000;
        pointer.push = lerp(pointer.push, sinceMove < 0.25 ? 1 : 0, 1 - Math.exp(-dt * (sinceMove < 0.25 ? 6 : 1.6)));
        const pp: [number, number] = [pointer.x, pointer.y];

        // Weak machines: fewer points and a smaller buffer, decided on the film's first steady second.
        if (dt > 0 && dt < 0.1 && sampled < 90) {
          sampled++;
          if (dt > 0.024) slowFrames++;
          if (sampled === 90 && slowFrames > 30) {
            count = slowFrames > 60 ? 28000 : 42000;
            scale = slowFrames > 60 ? 0.62 : 0.8;
            engine.setScale(scale);
          }
        }

        let shot: Shot;
        if (opening) {
          // The score is the clock when it plays; else the frame time.
          const a = audio.current;
          if (!c.frozen && !c.paused) {
            // The clouds are needed from the drop on: the film waits for them there (rarely, on a slow network).
            const need = c.t > T.compact[1] - 0.2 && !(loaded.has(L.embryo) && loaded.has(L.skull) && loaded.has(L.face5) && loaded.has(L.face10));
            if (a && !a.paused && !need) c.t = a.currentTime;
            else if (!need) c.t += dt;
            else a?.pause();
          }
          const t = Math.min(END, c.t);
          shot = introShot(t, aspect, count, pp, pointer.push);
          lastB = shot.mix < 0.5 ? shot.a : shot.b;
          // The page's words over the picture.
          const line = LINES.findIndex((l) => t >= l.at[0] && t < l.at[1]);
          if (line !== caps && caption.current) {
            caps = line;
            if (line >= 0) caption.current.textContent = LINES[line].text;
            caption.current.dataset.on = String(line >= 0);
          }
          const l = label(t);
          const key = l ? l.kicker + l.value : '';
          if (key !== lab && kicker.current && value.current && instrument.current) {
            lab = key;
            instrument.current.dataset.on = String(!!l);
            if (l) {
              kicker.current.textContent = l.kicker;
              value.current.textContent = l.value;
            }
          }
          const h = HITS.findIndex((x) => t >= x && t < x + 0.1);
          if (h >= 0 && h !== hit - 1) {
            hit = h + 1;
            instrument.current?.animate([{ boxShadow: '0 0 0 0 rgb(255 154 85 / .55)' }, { boxShadow: '0 0 0 14px rgb(255 154 85 / 0)' }], { duration: 650, easing: 'ease-out' });
          }
          if (tag.current) {
            const { h: fh } = frustum(aspect);
            const logoH = Math.min(frustum(aspect).w * 0.62, fh * 1.6) * 0.2;
            const y = 0.12 - logoH - 0.1;
            tag.current.style.top = `${(0.5 - y / (2 * fh)) * 100}%`;
            tag.current.style.opacity = String(ease(20.9, 21.8, t) * (1 - ease(22.4, 23, t)));
          }
          if (rail.current) rail.current.style.transform = `scaleX(${t / END})`;
          if (t >= END && !c.ended) {
            c.ended = true;
            // The score rings out under the journey; the study music follows it (the sound was wanted).
            if (a && !a.paused) a.addEventListener('ended', () => enableStudyMusic(), { once: true });
            onFinish();
          }
          engine.draw(shot);
          // The skin over the points (it fades in from when it is ready, if that is late).
          const sk = skin && skinEl ? skinAt(t, W, H) : null;
          if (sk && skin && skinEl) {
            // Ready in time (before the skin starts): as timed. Late: it fades in over 0.6 s of real time.
            if (skinFrom < 0) skinFrom = t < 9.1 ? 0 : now;
            const late = skinFrom ? Math.min(1, (now - skinFrom) / 600) : 1;
            skin.draw({ t, box: sk.box, angles: sk.angles, skin: sk.skin * late, grains: 0, flat: 0, focus: 0, motes: 0 }, scale);
            skinEl.style.visibility = 'visible';
          } else if (skinEl && skinEl.style.visibility === 'visible') skinEl.style.visibility = 'hidden';
          if (t > T.skull[0] + 0.5 && skin) dropSkin();
          return;
        }

        // ———— The journey ————
        journeyT += dt;
        const t = journeyT;
        const target = going === null ? place : toward;
        const slot = art.current?.querySelector<HTMLElement>('[data-camera-target]') ?? art.current;
        const r = slot?.getBoundingClientRect();
        const { h, w } = frustum(aspect);
        const cam = camera(aspect, t, 0);
        const fitIn = (k = 0.47): [number, [number, number, number]] => {
          if (!r || !r.width) return [h * 0.8, [w * 0.35, 0, 0]];
          const cx = ((r.left + r.width / 2) / W) * 2 - 1,
            cy = 1 - ((r.top + r.height / 2) / H) * 2;
          return [Math.min((r.height / H) * h * 2, (r.width / W) * w * 2) * k, [cx * w, cy * h, 0]];
        };
        const pose = turn.current;
        const shapeOf = (p: Place | 'logo'): Shape => {
          if (p === 'face') {
            const [k, at] = fitIn(0.47);
            return { layer: L.face10, model: model(k, 0.28 + pose.yaw + 0.22 * Math.sin(t * 0.23), pose.pitch * 0.9 + 0.04, at) };
          }
          if (p === 'skull') {
            const [k, at] = fitIn(0.45);
            return { layer: L.skull, model: model(k, -0.55 + pose.yaw + t * 0.16, pose.pitch * 0.9 - 0.04, at) };
          }
          return { layer: SWARM, model: model(Math.max(h, w) * 0.85, t * 0.02, 0, [w * 0.15, 0, -1.5]), tint: [0.85, 0.68, 0.55] };
        };
        if (target !== going) {
          from = lastB ?? shapeOf(target);
          going = target;
          since = t;
          drewRest = false;
        }
        const k = ease(since, since + TRAVEL, t);
        const base = {
          t,
          drift: 0.004,
          cells: 4,
          compact: 1,
          viewProj: cam.viewProj,
          eye: cam.eye,
          focus: 6.2,
          aperture: 0.45,
          size: 14,
          bloom: 0.75,
          count,
          pointer: pp,
          push: pointer.push * 0.8,
          fade: 1,
          color: 1,
          flash: 0,
          ground: 1,
          groundAt: [r ? (r.left + r.width / 2) / W : 0.72, r ? 1 - (r.top + r.height / 2) / H : 0.5] as [number, number],
        };
        const restExposure = 0.3;
        const exposureOf = (p: Place) => (p === 'rest' ? restExposure : 1.0);
        if (k < 1) {
          const b = shapeOf(going);
          shot = { ...base, a: from!, b, mix: k, spread: 0.5, sweep: 1, stir: going === 'rest' ? 0.9 : 1.3, exposure: lerp(from!.layer === SWARM ? restExposure : 1.0, exposureOf(going), k) };
        } else if (going === 'face') {
          // The face, fusing and parting again: week 5 → week 10, held at each end.
          const ph = (t * 0.085) % 1;
          const m = 1 - ease(0.12, 0.42, ph) + ease(0.62, 0.92, ph);
          const f10 = shapeOf('face');
          shot = { ...base, a: { ...f10, layer: L.face5 }, b: f10, mix: m, spread: 0.12, sweep: 0, stir: 0.03, exposure: 1.0 };
        } else {
          const b = shapeOf(going);
          shot = { ...base, a: b, b, mix: 1, spread: 0, sweep: 0, stir: 0, exposure: exposureOf(going) };
        }
        lastB = shot.mix < 0.5 ? shot.a : shot.b;
        // At rest (the live app on stage), the canvas keeps its last picture and costs nothing.
        if (going === 'rest' && k >= 1 && pointer.push < 0.02) {
          if (drewRest) return;
          drewRest = true;
        } else drewRest = false;
        engine.draw(shot);
      };
      raf = requestAnimationFrame(tick);
    }

    run().catch(() => {
      if (!ac.signal.aborted) stop();
    });
    return () => {
      ac.abort();
      cancelAnimationFrame(raf);
      engine?.dispose();
      dropSkin();
      el.removeEventListener('webglcontextlost', lost);
      media.removeEventListener('change', motion);
      window.removeEventListener('pointermove', move);
    };
  }, []);

  // Sound: tried at once (a returning visitor's browser may allow it), else one press away.
  useEffect(() => {
    if (!props.opening || !ready) return;
    const a = audio.current;
    if (!a) return;
    a.volume = 0.9;
    a.currentTime = clock.current.t;
    if (clock.current.frozen) return;
    void a
      .play()
      .then(() => setSound(true))
      .catch(() => setSound(false));
  }, [props.opening, ready]);

  function toggleSound() {
    const a = audio.current;
    if (!a) return;
    if (sound) {
      a.pause();
      setSound(false);
      return;
    }
    a.currentTime = clock.current.t;
    void a
      .play()
      .then(() => {
        setSound(true);
        if (clock.current.paused) a.pause();
      })
      .catch(() => {});
  }
  function togglePause() {
    const c = clock.current;
    c.frozen = false;
    c.paused = !c.paused;
    setPaused(c.paused);
    const a = audio.current;
    if (a && sound) {
      if (c.paused) a.pause();
      else {
        a.currentTime = c.t;
        void a.play().catch(() => {});
      }
    }
  }

  return (
    <>
      <canvas ref={canvas} className={s.canvas} hidden={fallback} aria-hidden="true" />
      {props.opening && <canvas ref={skinCanvas} className={s.skin} hidden={fallback} aria-hidden="true" />}
      {fallback && !props.opening && <style>{'[data-specimen-poster]{opacity:1!important}'}</style>}
      <audio ref={audio} preload="auto">
        <source src="/intro-v3/score.ogg" type="audio/ogg" />
        <source src="/intro-v3/score.mp3" type="audio/mpeg" />
      </audio>
      {props.opening && (
        <section className={s.film} aria-label="EnbrioAtlas: sarrera" data-ready={ready}>
          <div ref={instrument} className={s.instrument} data-on="false" aria-hidden="true">
            <i />
            <span ref={kicker} className={s.kicker} />
            <span ref={value} className={s.value} />
          </div>
          <p ref={caption} className={s.caption} data-on="false" aria-live="off" />
          <div ref={tag} className={s.tag}>
            <h1 id="release-title" className={s.srOnly}>
              EnbrioAtlas
            </h1>
            <p>Hitzetatik formara.</p>
          </div>
          <button type="button" className={s.skip} onClick={props.onFinish}>
            Saltatu sarrera <span aria-hidden="true">→</span>
          </button>
          <footer className={s.transport}>
            <button type="button" className={s.round} onClick={togglePause} aria-label={paused ? 'Erreproduzitu' : 'Pausatu'}>
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
            <div className={s.rail} aria-hidden="true">
              <span ref={rail} />
            </div>
            <button type="button" className={s.sound} data-on={sound} aria-pressed={sound} onClick={toggleSound}>
              <span className={s.bars} aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
              </span>
              {sound ? 'Soinua itzali' : 'Piztu soinua'}
            </button>
          </footer>
        </section>
      )}
    </>
  );
}
