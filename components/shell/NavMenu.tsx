'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type ComponentProps } from 'react';
import { openKimu } from '@/components/kimu/store';
import { weeks } from '@/content/registry';
import { resumeHref, useLastPlace } from './progress';

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

/** A way into the simulator from any page: back to where the student left off, or the first topic on a first visit. */
export function SimLink({ fallback, children, ...rest }: Omit<ComponentProps<typeof Link>, 'href'> & { fallback: string }) {
  const last = useLastPlace();
  const w = last ? weeks.find((x) => x.week === last.week) : undefined;
  return (
    <Link href={w && last ? resumeHref(w.week, w.stages, last) : fallback} {...rest}>
      {children}
    </Link>
  );
}

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
          {/* On a phone the bar keeps only this menu: the site links and the simulator come first here. */}
          <SimLink role="menuitem" fallback="/astea/1" className="nav-menu-phone is-go" onClick={() => setOpen(false)}>
            <b>Ireki simulagailua</b>
            <small>etapak, urratsak eta egiturak</small>
          </SimLink>
          <Link role="menuitem" href="/kronologia" className="nav-menu-phone" aria-current={current === 'kronologia' ? 'page' : undefined} onClick={() => setOpen(false)}>
            <b>Kronologia</b>
            <small>zer dago egun bakoitzean?</small>
          </Link>
          <Link role="menuitem" href="/#gaiak" className="nav-menu-phone" onClick={() => setOpen(false)}>
            <b>Gaiak</b>
            <small>gai guztiak, garapenaren ordenan</small>
          </Link>
          <Link role="menuitem" href="/berriak" className="nav-menu-phone" onClick={() => setOpen(false)}>
            <b>Berriak</b>
            <small>zer dago berri</small>
          </Link>
          <hr className="nav-menu-phone" />
          {ITEMS.map((i) => (
            <Link key={i.id} role="menuitem" href={i.href} className={i.sub ? 'is-sub' : undefined} aria-current={i.id === current ? 'page' : undefined} onClick={() => setOpen(false)}>
              <b>{i.label}</b>
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
