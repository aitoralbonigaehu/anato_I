'use client';

import { useEffect, useRef, useState } from 'react';
import styles from '../eratorriak.module.css';

/**
 * A room's table of contents. It stays under the site bar while the page scrolls and marks the section in
 * view, so on these very long pages the student always sees where they are and can jump without going back up.
 */
export function RoomNav({ items }: { items: readonly (readonly [id: string, label: string])[] }) {
  const [active, setActive] = useState(items[0]?.[0] ?? '');
  const bar = useRef<HTMLElement>(null);
  // By value: the rooms rebuild their list on every render, and the listeners need not follow.
  const ids = items.map(([id]) => id).join(' ');
  useEffect(() => {
    let raf = 0;
    const list = ids.split(' ');
    const measure = () => {
      raf = 0;
      // The last section whose top has passed the bars is the one being read.
      let on = list[0] ?? '';
      for (const id of list) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 150) on = id;
      }
      setActive(on);
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    return () => {
      window.removeEventListener('scroll', queue);
      window.removeEventListener('resize', queue);
      cancelAnimationFrame(raf);
    };
  }, [ids]);
  // On a tablet the row scrolls sideways: the current section stays in it.
  useEffect(() => {
    const nav = bar.current;
    const on = nav?.querySelector<HTMLElement>('[aria-current]');
    if (nav && on && nav.scrollWidth > nav.clientWidth) nav.scrollTo({ left: on.offsetLeft - 24 });
  }, [active]);
  return (
    <nav ref={bar} className={styles.subnav} aria-label="Ikasgelaren atalak">
      {items.map(([id, label], i) => (
        <a key={id} href={`#${id}`} aria-current={id === active ? 'location' : undefined}>
          <b>{i + 1}</b>
          {label}
        </a>
      ))}
    </nav>
  );
}
