'use client';

import { useEffect } from 'react';

/**
 * The site bar sits flush with the page at the top and gains its hairline and shadow once the page
 * moves under it (html[data-scrolled]), like a sheet of glass lifting.
 */
export function BarScroll() {
  useEffect(() => {
    const html = document.documentElement;
    let on = false;
    const check = () => {
      const now = window.scrollY > 4;
      if (now !== on) {
        on = now;
        if (now) html.dataset.scrolled = '';
        else delete html.dataset.scrolled;
      }
    };
    check();
    window.addEventListener('scroll', check, { passive: true });
    return () => {
      window.removeEventListener('scroll', check);
      delete html.dataset.scrolled;
    };
  }, []);
  return null;
}
