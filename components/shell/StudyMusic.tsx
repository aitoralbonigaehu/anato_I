'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { DEMO_NAME } from '@/lib/demo/demo-script';
import s from './study-music.module.css';

/**
 * Study music: calm pieces made for the app (scripts/intro-v3/music.py), one after another, faded in and out.
 * Off until the student turns it on (or turns the opening film's sound on: the music then carries on into the app).
 */
const key = 'enbrioatlas:study-music';
const change = 'enbrioatlas:study-music-change';
export const filmAudioChange = 'enbrioatlas:film-audio-change';
const TRACKS = ['argia', 'itsasoa', 'goiza'];
const VOLUME = 0.38;
let enabled = false;

function subscribe(notify: () => void) {
  window.addEventListener(change, notify);
  return () => window.removeEventListener(change, notify);
}
function set(on: boolean) {
  enabled = on;
  try {
    localStorage.setItem(key, on ? '1' : '0');
  } catch {}
  window.dispatchEvent(new Event(change));
}
/** Music on (after a press of the student's: the opening film's sound key, for one). */
export function enableStudyMusic() {
  set(true);
}

const Note = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true">
    <path d="M6 12.2V3.6l7-1.6v8.4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <circle cx="4.3" cy="12.3" r="1.9" fill="currentColor" />
    <circle cx="11.3" cy="10.5" r="1.9" fill="currentColor" />
  </svg>
);

export function StudyMusicButton({ floating = false, compact = false, className }: { floating?: boolean; compact?: boolean; className?: string }) {
  const on = useSyncExternalStore(subscribe, () => enabled, () => false);
  const label = on ? 'Musika isilarazi' : 'Musika piztu';
  return (
    <button
      type="button"
      className={className ?? (floating ? s.floating : s.button)}
      data-on={on}
      aria-pressed={on}
      aria-label={compact ? label : undefined}
      data-tip={compact ? (on ? 'Ikasteko musika: isilarazi' : 'Ikasteko musika: piztu') : undefined}
      data-tip-pos={compact ? 'bottom' : undefined}
      onClick={() => set(!enabled)}
    >
      <span className={s.icon}>
        <Note />
        {on && (
          <span className={s.bars} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        )}
      </span>
      {!compact && <span>{label}</span>}
    </button>
  );
}

export function StudyMusic() {
  const audio = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    const player = audio.current;
    if (!player || window.name === DEMO_NAME) return;
    let film = false,
      track = Math.floor(Math.random() * TRACKS.length),
      fade = 0,
      wanted = false;
    try {
      enabled = localStorage.getItem(key) === '1';
    } catch {}
    const load = () => {
      const ogg = player.canPlayType('audio/ogg; codecs="vorbis"');
      player.src = `/music/${TRACKS[track]}.${ogg ? 'ogg' : 'mp3'}`;
    };
    // Volume moves over ~1.2 s (in and out): music never starts or stops with a click.
    const glide = (to: number, done?: () => void) => {
      cancelAnimationFrame(fade);
      const from = player.volume,
        t0 = performance.now();
      const step = (now: number) => {
        const k = Math.min(1, (now - t0) / 1200);
        player.volume = from + (to - from) * k * k * (3 - 2 * k);
        if (k < 1) fade = requestAnimationFrame(step);
        else done?.();
      };
      fade = requestAnimationFrame(step);
    };
    const sync = () => {
      const want = enabled && !film && !document.hidden;
      if (want === wanted && (!want || !player.paused)) return;
      wanted = want;
      if (want) {
        if (!player.src) load();
        player.volume = player.paused ? 0 : player.volume;
        void player
          .play()
          .then(() => glide(VOLUME))
          .catch(() => {
            wanted = false;
          });
      } else glide(0, () => player.pause());
    };
    const next = () => {
      track = (track + 1) % TRACKS.length;
      load();
      wanted = false;
      sync();
    };
    const onFilm = (event: Event) => {
      film = (event as CustomEvent<boolean>).detail;
      sync();
    };
    player.addEventListener('ended', next);
    // A fresh page may need a press even when music was on before.
    window.addEventListener('pointerdown', sync);
    window.addEventListener('keydown', sync);
    window.addEventListener(change, sync);
    window.addEventListener(filmAudioChange, onFilm);
    document.addEventListener('visibilitychange', sync);
    window.dispatchEvent(new Event(change));
    return () => {
      cancelAnimationFrame(fade);
      player.pause();
      player.removeEventListener('ended', next);
      window.removeEventListener('pointerdown', sync);
      window.removeEventListener('keydown', sync);
      window.removeEventListener(change, sync);
      window.removeEventListener(filmAudioChange, onFilm);
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);
  return (
    <>
      <audio ref={audio} preload="none" />
      <StudyMusicButton floating />
    </>
  );
}
