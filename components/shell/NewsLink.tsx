'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LATEST, SEEN_KEY } from '@/content/changelog';

/** True while there are changes newer than the student's last visit to "Berriak" (the bar's dot). */
export function useUnseenChanges() {
  const [unseen, setUnseen] = useState(false);
  useEffect(() => {
    const read = () => {
      try {
        setUnseen((localStorage.getItem(SEEN_KEY) ?? '') < LATEST);
      } catch {}
    };
    read();
    window.addEventListener('enbrioatlas:berriak-seen', read);
    window.addEventListener('storage', read);
    return () => {
      window.removeEventListener('enbrioatlas:berriak-seen', read);
      window.removeEventListener('storage', read);
    };
  }, []);
  return unseen;
}

/** "Berriak" in the site bar, with a small signal dot while there is something the student has not seen. */
export function NewsLink({ current }: { current?: boolean }) {
  const unseen = useUnseenChanges();
  return (
    <Link href="/berriak" className="nav-news" aria-current={current ? 'page' : undefined} aria-label={unseen ? 'Berriak (berririk ikusi gabe)' : 'Berriak'}>
      Berriak
      {unseen && <i className="nav-news-dot" aria-hidden />}
    </Link>
  );
}
