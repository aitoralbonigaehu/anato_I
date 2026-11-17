'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { getActivityServer, noteStageOpen, noteStudyTime, readActivity, subscribeActivity } from '@/lib/study/activity';

/** The study activity of this browser; empty on the server and during hydration. */
export const useActivity = () => useSyncExternalStore(subscribeActivity, readActivity, getActivityServer);

/** Idle this long (no pointer, key or wheel) and the clock stops: a page left open is not study. */
const IDLE = 3 * 60_000;
const TICK = 15_000;

/**
 * Counts one opening of a stage and the time studied on it: only while the page is visible and the
 * student has done something in the last three minutes (a running animation counts as being watched).
 */
export function useStageStudy(week: number, stageId: string, enabled = true, playing = false) {
  useEffect(() => {
    if (!enabled) return;
    noteStageOpen(week, stageId);
  }, [week, stageId, enabled]);

  useEffect(() => {
    if (!enabled) return;
    let lastInput = Date.now();
    let lastTick = Date.now();
    const poke = () => (lastInput = Date.now());
    const flush = () => {
      const now = Date.now();
      const active = !document.hidden && (now - lastInput < IDLE || playing);
      if (active) noteStudyTime(week, stageId, (now - lastTick) / 1000);
      lastTick = now;
    };
    const onHide = () => flush();
    const id = window.setInterval(flush, TICK);
    for (const ev of ['pointerdown', 'pointermove', 'keydown', 'wheel', 'touchstart'] as const) window.addEventListener(ev, poke, { passive: true });
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', onHide);
    return () => {
      flush();
      window.clearInterval(id);
      for (const ev of ['pointerdown', 'pointermove', 'keydown', 'wheel', 'touchstart'] as const) window.removeEventListener(ev, poke);
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', onHide);
    };
  }, [week, stageId, enabled, playing]);
}
