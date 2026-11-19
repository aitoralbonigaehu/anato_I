'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { DEMO_NAME } from '@/lib/demo/demo-script';
import s from './study-music.module.css';

const key = 'enbrioatlas:study-music';
const change = 'enbrioatlas:study-music-change';
export const filmAudioChange = 'enbrioatlas:film-audio-change';
let enabled = false;

function subscribe(notify: () => void) {
  window.addEventListener(change, notify);
  return () => window.removeEventListener(change, notify);
}

export function StudyMusicButton({ floating = false }: { floating?: boolean }) {
  const on = useSyncExternalStore(subscribe, () => enabled, () => false);
  return (
    <button
      type="button"
      className={floating ? s.floating : s.button}
      onClick={() => {
        enabled = !enabled;
        try { localStorage.setItem(key, enabled ? '1' : '0'); } catch {}
        window.dispatchEvent(new Event(change));
      }}
    >
      <span aria-hidden="true">♫</span> {on ? 'Musika isilarazi' : 'Musika piztu'}
    </button>
  );
}

export function StudyMusic() {
  const audio = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    const player = audio.current;
    if (!player || window.name === DEMO_NAME) return;
    let film = false;
    try { enabled = localStorage.getItem(key) === '1'; } catch {}
    player.volume = 0.42;
    const sync = () => {
      if (!enabled || film || document.hidden) player.pause();
      else if (player.paused) void player.play().catch(() => {});
    };
    const onFilm = (event: Event) => {
      film = (event as CustomEvent<boolean>).detail;
      sync();
    };
    // A fresh page may need a gesture even when music was enabled previously.
    window.addEventListener('click', sync);
    window.addEventListener('keydown', sync);
    window.addEventListener(change, sync);
    window.addEventListener(filmAudioChange, onFilm);
    document.addEventListener('visibilitychange', sync);
    window.dispatchEvent(new Event(change));
    return () => {
      player.pause();
      window.removeEventListener('click', sync);
      window.removeEventListener('keydown', sync);
      window.removeEventListener(change, sync);
      window.removeEventListener(filmAudioChange, onFilm);
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);
  return (
    <>
      <audio ref={audio} src="/enbrioatlas-ambient.ogg" loop preload="none" />
      <StudyMusicButton floating />
    </>
  );
}
