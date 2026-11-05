'use client';

import { useEffect, useRef, useState } from 'react';
import { KimuFace } from './KimuFace';

/** Cheered this session (sessionStorage): once per visit, like the opening. */
const CHEER_KEY = 'enbrioatlas:kimu-animo';
/** How long Kimu stays big, ms (a click or Escape sends it home sooner). */
const STAY = 3200;

/**
 * Each time the app is opened, Kimu comes in big in the middle of the screen — a little animated figure that
 * hops and cheers the student on — then shrinks and flies home into its own small button (the corner
 * launcher, or the simulator's top-bar key). Right after the opening sequence on the home page, or as soon as
 * the first page shows anywhere else.
 */
export function KimuCheer() {
  const [phase, setPhase] = useState<'off' | 'in' | 'home'>('off');
  const box = useRef<HTMLButtonElement>(null);

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
        if (!opening()) show(350);
      });
      obs.observe(html, { attributes: true, attributeFilter: ['data-intro'] });
      obs.observe(document.body, { childList: true, subtree: true });
    } else show(600);
    return () => {
      obs?.disconnect();
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  // Going home: aim the shrink at Kimu's own small button wherever this page has it.
  const goHome = () => {
    const el = box.current;
    if (el) {
      const home = document.querySelector('.kimu-tool .kimu-face, .kimu-launch .kimu-face')?.getBoundingClientRect();
      const me = el.querySelector('.kimu-cheer-face')?.getBoundingClientRect();
      if (home && me && home.width) {
        el.style.setProperty('--kc-x', `${home.left + home.width / 2 - (me.left + me.width / 2)}px`);
        el.style.setProperty('--kc-y', `${home.top + home.height / 2 - (me.top + me.height / 2)}px`);
        el.style.setProperty('--kc-k', `${Math.max(0.08, home.width / me.width)}`);
      }
    }
    setPhase('home');
  };

  useEffect(() => {
    if (phase !== 'in') return;
    const t = window.setTimeout(goHome, STAY);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && goHome();
    document.addEventListener('keydown', esc);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener('keydown', esc);
    };
  }, [phase]);

  if (phase === 'off') return null;
  return (
    <button
      ref={box}
      type="button"
      className={`kimu-cheer is-${phase}`}
      role="status"
      aria-live="polite"
      onClick={goHome}
      onAnimationEnd={(e) => {
        if (phase === 'home' && (e.target as HTMLElement).classList.contains('kimu-cheer-face')) setPhase('off');
      }}
      title="Itxi"
    >
      <span className="kimu-cheer-bubble">Animo!!!!</span>
      <span className="kimu-cheer-face">
        <KimuFace mood="happy" talking size={168} />
      </span>
    </button>
  );
}
