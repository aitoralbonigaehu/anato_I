'use client';

import { useEffect } from 'react';
import { IconHelp } from '../icons';
import { overlap, type Box } from './geometry';
import { STOPS } from './steps';
import { Tour } from './Tour';
import { endTour, useTourState, type TourId } from './store';
import { GUIDE_STOP, openWelcome, type GuidePlace } from '@/components/onboarding/Welcome';

/** What the guide must not cover for long: the specimen. */
const AVOID: Record<TourId, string[]> = { sim: ['eszena'], home: [], bel: [] };
const playing = () => {
  const p = document.querySelector('[data-tour="play"]');
  return !!p && (p.classList.contains('is-playing') || p.getAttribute('aria-label') === 'Pausatu');
};

/**
 * The old step-by-step tour of one place. The guide is now the onboarding journey (its "?" keys open it
 * at that place's stop) and no first-visit offer is made any more; this host only draws a tour that some
 * code still starts with `startTour`. `ready` is kept for the callers.
 */
export function TourHost({ tour, ready = true }: { tour: TourId; ready?: boolean }) {
  const s = useTourState();

  // The tour stops the explanation where it is: it talks about the screen, not over the voice.
  useEffect(() => {
    if (s.active !== tour) return;
    const p = document.querySelector<HTMLElement>('[data-tour="play"]');
    if (p && playing()) p.click();
  }, [s.active, s.run, tour]);

  return (
    <>
      {s.active === tour && <Tour key={s.run} stops={STOPS[tour]} scrolls={tour !== 'sim'} avoid={AVOID[tour]} onClose={endTour} />}
    </>
  );
}

/**
 * Where the old first-visit offer sat (kept for the tour's own card placement tests): under the "?" that keeps the guide, over the right column, when that is clear
 * of the picture and of the words a page opens with; else docked just above the bottom bar (over the
 * step text, never the specimen); on a page with no bar, in the bottom-right corner above `dock` (the
 * "Galdetu" key), like a note that steps in, never over the title or the first row of keys.
 */
export function offerSpot(card: { w: number; h: number }, vw: number, vh: number, help: Box | null, bar: Box | null, scene: Box | null, avoid: (Box | null)[] = [], dock: Box | null = null): { x: number; y: number } {
  const m = 12;
  // Clear of the picture, and of the keys over it (the view switch) that the card would hide.
  const clear = (b: Box) => (!scene || overlap(b, scene) === 0) && avoid.every((a) => !a || overlap(b, a) === 0);
  const fits = (b: Box) => b.x >= m && b.y >= m && b.x + b.w <= vw - m && b.y + b.h <= vh - m;
  if (help) {
    const b = { x: Math.min(help.x + help.w, vw - m) - card.w, y: help.y + help.h + 10, w: card.w, h: card.h };
    if (fits(b) && clear(b)) return b;
  }
  if (bar) {
    const b = { x: bar.x + bar.w - card.w - 8, y: bar.y - card.h - 8, w: card.w, h: card.h };
    if (fits(b) && clear(b)) return b;
    // Right on the bar's top edge, clear of the picture above it.
    return { x: Math.max(m, bar.x + bar.w - card.w - 8), y: Math.max(scene ? scene.y + scene.h + 8 : m, bar.y - card.h - 8) };
  }
  const right = dock ? dock.x + dock.w : vw - m - 12;
  const bottom = dock ? dock.y - 10 : vh - m - 12;
  return { x: Math.max(m, Math.min(right, vw - m) - card.w), y: Math.max(m, bottom - card.h) };
}

/** The "?" of a place without the simulator's help sheet: it opens the guide (the journey) at this place. */
export function GuideButton({ tour }: { tour: GuidePlace }) {
  return (
    <button type="button" className="icon-btn gida-help" data-tour="laguntza" aria-label="Gida" onClick={() => openWelcome('journey', GUIDE_STOP[tour])} data-tip="Gida: simulagailua, Kimu, Belortzioak eta Eratorriak, benetan" data-tip-pos="bottom-end">
      <IconHelp size={17} />
    </button>
  );
}
