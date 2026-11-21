'use client';

import { useEffect } from 'react';

const SENT = 'enbrioatlas:bisita';

/** Counts a visit once per tab session and respects Do Not Track and Global Privacy Control. */
export function VisitBeacon() {
  useEffect(() => {
    const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
    if (nav.globalPrivacyControl || nav.doNotTrack === '1') return;

    const id = window.setTimeout(() => {
      try {
        if (window.sessionStorage.getItem(SENT)) return;
        window.sessionStorage.setItem(SENT, '1');
      } catch {
        return;
      }

      const headers = navigator.maxTouchPoints > 1 ? { 'X-Visit-Touch': '1' } : undefined;
      void fetch('/api/bisita', { method: 'POST', headers, keepalive: true }).catch(() => {});
    }, 4000);
    return () => window.clearTimeout(id);
  }, []);
  return null;
}
