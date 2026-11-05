'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { openKimu } from '@/components/kimu/store';

export type StudySection = 'ikasgela' | 'fitxak' | 'belortzioak' | 'irudiak' | 'eratorriak' | 'egiturak';

/** The study pages, all under one «Ikasgela» entry of the site bar (the structures' atlas sits under the images). */
const ITEMS: { id: StudySection; href: string; label: string; note: string; sub?: boolean }[] = [
  { id: 'ikasgela', href: '/ikasgela', label: 'Ikasgelak', note: 'gai bakoitzaren mapa, taulak eta fitxak' },
  { id: 'eratorriak', href: '/eratorriak', label: 'Eratorriak', note: 'nondik datoz, zer bihurtzen dira' },
  { id: 'belortzioak', href: '/belortzioak', label: 'Belortzioak', note: 'gezia → izena' },
  { id: 'irudiak', href: '/irudiak', label: 'Irudiak', note: 'etiketarik gabeko irudiak' },
  { id: 'egiturak', href: '/egiturak', label: 'Egiturak', note: 'egitura guztien atlasa', sub: true },
  { id: 'fitxak', href: '/fitxak', label: 'Fitxak', note: 'irudiak zenbakiekin' },
];

/** One «Ikasgela ▾» key in the site bar instead of six links; it says when the page you are on is one of them. */
export function StudyMenu({ current }: { current?: string }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const here = ITEMS.some((i) => i.id === current);
  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', away);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('pointerdown', away);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);
  return (
    <div className="nav-menu" ref={box}>
      <button type="button" className="nav-menu-key" aria-expanded={open} aria-haspopup="menu" aria-current={here ? 'page' : undefined} onClick={() => setOpen((v) => !v)}>
        Ikasgela <span aria-hidden>{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <div className="nav-menu-panel" role="menu">
          {ITEMS.map((i) => (
            <Link key={i.id} role="menuitem" href={i.href} className={i.sub ? 'is-sub' : undefined} aria-current={i.id === current ? 'page' : undefined} onClick={() => setOpen(false)}>
              <b>{i.sub ? <span aria-hidden>↳ </span> : null}{i.label}</b>
              <small>{i.note}</small>
            </Link>
          ))}
          <hr />
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              openKimu();
            }}
          >
            <b>Galdetu Kimuri</b>
            <small>galdetu edozer; azalpenera eramango zaitu · K</small>
          </button>
        </div>
      )}
    </div>
  );
}
