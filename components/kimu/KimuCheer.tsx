'use client';

import { useEffect, useState } from 'react';
import { KimuFace } from './KimuFace';

/** Cheered this session (sessionStorage): once per visit, like the opening. */
const CHEER_KEY = 'enbrioatlas:kimu-animo';
/** How long Kimu stays, ms (a click or Escape sends it away sooner). */
const STAY = 3600;

/**
 * Each time the app is opened, Kimu pops up in the corner and cheers the student on — right after the
 * opening sequence (on the home page) or as soon as the first page shows (anywhere else).
 */
export function KimuCheer() {
  const [phase, setPhase] = useState<'off' | 'in' | 'out'>('off');

  useEffect(() => {
    try {
      if (sessionStorage.getItem(CHEER_KEY)) return;
    } catch {
      return;
    }
    const html = document.documentElement;
    const timers: number[] = [];
    let obs: MutationObserver | null = null;
    const show = (delay: number) => {
      obs?.disconnect();
      timers.push(
        window.setTimeout(() => {
          try {
            sessionStorage.setItem(CHEER_KEY, '1');
          } catch {}
          setPhase('in');
        }, delay),
      );
    };
    // The opening plays only on the home page; wait for it to end so Kimu never covers it.
    const opening = () => !!document.querySelector('.intro') && html.dataset.intro !== 'seen';
    if (opening()) {
      obs = new MutationObserver(() => {
        if (!opening()) show(450);
      });
      obs.observe(html, { attributes: true, attributeFilter: ['data-intro'] });
      obs.observe(document.body, { childList: true, subtree: true });
    } else show(700);
    return () => {
      obs?.disconnect();
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  useEffect(() => {
    if (phase !== 'in') return;
    const leave = () => setPhase('out');
    const t = window.setTimeout(leave, STAY);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && leave();
    document.addEventListener('keydown', esc);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener('keydown', esc);
    };
  }, [phase]);

  if (phase === 'off') return null;
  return (
    <button
      type="button"
      className={`kimu-cheer is-${phase}`}
      role="status"
      aria-live="polite"
      onClick={() => setPhase('out')}
      onAnimationEnd={(e) => {
        if (phase === 'out' && e.target === e.currentTarget) setPhase('off');
      }}
      title="Itxi"
    >
      <span className="kimu-cheer-face">
        <KimuFace mood="happy" talking size={64} />
      </span>
      <span className="kimu-cheer-bubble">Animo!!!!</span>
    </button>
  );
}
