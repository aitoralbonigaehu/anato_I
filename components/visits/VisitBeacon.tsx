'use client';

import { useEffect } from 'react';
import { accountState } from '@/components/account/account';

const SENT = 'enbrioatlas:bisita';

/**
 * Counts a visit: once per browser session, a few facts the browser knows (screen, language, time zone,
 * the hour, the page, the referring site) go to /api/bisita, which adds the browser, system and the
 * shortened IP. No identifier is kept in the browser, and nothing is sent when the browser asks not to
 * be tracked (Do Not Track / Global Privacy Control).
 */
export function VisitBeacon() {
  useEffect(() => {
    const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
    if (nav.globalPrivacyControl || nav.doNotTrack === '1') return;
    try {
      if (window.sessionStorage.getItem(SENT)) return;
    } catch {
      return;
    }
    // After the page has settled (and the account has been found), off the critical path. Marked as
    // sent only when it goes, so a remount (StrictMode, a fast navigation) neither loses nor doubles it.
    const id = window.setTimeout(() => {
      try {
        if (window.sessionStorage.getItem(SENT)) return;
        window.sessionStorage.setItem(SENT, '1');
      } catch {
        return;
      }
      const body = {
        path: location.pathname,
        ref: document.referrer && !document.referrer.startsWith(location.origin) ? document.referrer : '',
        lang: navigator.language,
        langs: (navigator.languages ?? []).slice(0, 5).join(','),
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        hour: new Date().getHours(),
        sw: screen.width,
        sh: screen.height,
        vw: innerWidth,
        vh: innerHeight,
        dpr: devicePixelRatio,
        touch: navigator.maxTouchPoints ?? 0,
        scheme: matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
        signedIn: accountState().status === 'in',
      };
      void fetch('/api/bisita', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), keepalive: true }).catch(() => {});
    }, 4000);
    return () => window.clearTimeout(id);
  }, []);
  return null;
}
