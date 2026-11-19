'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { RELEASE_SEEN, WELCOME_SEEN } from './visit';
import { markOffered, type TourId } from '@/components/shell/tour/store';
import { DEMO_NAME } from '@/lib/demo/demo-script';

const Journey = dynamic(() => import('./Journey'), { ssr: false });
const REPLAY = 'enbrioatlas:replay-welcome';
type Screen = 'film' | 'journey';
type Replay = { screen: Screen; at: number };
/** The journey's stop for each place's guide ("?"): the home page from the start, the simulator, Belortzioak, Eratorriak. */
export type GuidePlace = TourId | 'era';
export const GUIDE_STOP: Record<GuidePlace, number> = { home: 0, sim: 2, bel: 4, era: 5 };

function seen(key: string) {
  try { return localStorage.getItem(key) === '1'; } catch { return true; }
}
function remember(key: string) {
  try { localStorage.setItem(key, '1'); } catch {}
}
export function welcomeSeen() {
  return seen(WELCOME_SEEN);
}

/** Opens the film, or the journey at one of its stops (the guide of a place opens it at that place). */
export function openWelcome(screen: Screen = 'journey', at = 0) {
  window.dispatchEvent(new CustomEvent<Replay>(REPLAY, { detail: { screen, at } }));
}

export function WelcomeLink({ children = 'Ongietorria', screen = 'journey' }: { children?: React.ReactNode; screen?: Screen }) {
  return <button type="button" className="foot-link-btn" onClick={() => openWelcome(screen)}>{children}</button>;
}

export function Welcome() {
  const path = usePathname() ?? '/';
  const [screen, setScreen] = useState<Screen | null>(null);
  const [at, setAt] = useState(0);
  const tour: TourId | null = path === '/' ? 'home' : path.startsWith('/astea/') ? 'sim' : path.startsWith('/belortzioak') ? 'bel' : null;

  useEffect(() => {
    // The app inside the journey's own frames never opens it again.
    if (window.name === DEMO_NAME) return;
    const replay = (e: Event) => {
      const d = (e as CustomEvent<Replay | Screen>).detail;
      const r = typeof d === 'string' ? { screen: d, at: 0 } : d;
      setAt(r?.at ?? 0);
      setScreen(r?.screen || 'journey');
    };
    window.addEventListener(REPLAY, replay);
    const url = new URL(window.location.href);
    const showJourney = url.searchParams.get('ongietorria') === '1';
    const showFilm = url.searchParams.get('intro') === 'v2';
    let timer = 0;
    const offer = () => {
      if (path.startsWith('/dev')) return;
      const next = showFilm ? 'film' : showJourney ? 'journey' : seen(WELCOME_SEEN) ? null : seen(RELEASE_SEEN) ? 'journey' : 'film';
      if (!next) return;
      if (document.querySelector('dialog[open], .kimu-panel')) {
        timer = window.setTimeout(offer, 500);
        return;
      }
      setAt(0);
      setScreen(next);
    };
    timer = window.setTimeout(offer, 0);
    return () => {
      window.removeEventListener(REPLAY, replay);
      window.clearTimeout(timer);
    };
  }, [path]);

  function finishFilm() {
    remember(RELEASE_SEEN);
    setScreen('journey');
  }
  function closeJourney() {
    const url=new URL(location.href);
    if(url.searchParams.get('intro')==='v2'||url.searchParams.get('ongietorria')==='1'){
      url.searchParams.delete('intro');url.searchParams.delete('ongietorria');url.searchParams.delete('t');
      window.history.replaceState(window.history.state,'',url);
    }
    remember(RELEASE_SEEN);
    remember(WELCOME_SEEN);
    if (tour) markOffered(tour);
    setScreen(null);
  }

  return screen ? <Journey opening={screen === 'film'} onFilmEnd={finishFilm} onClose={closeJourney} home={path === '/'} start={screen === 'film' ? 0 : at} /> : null;
}
