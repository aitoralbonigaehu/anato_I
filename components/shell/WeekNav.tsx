'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { weeks } from '@/content/registry';
import { spanOf } from '@/lib/sim/age';
import type { WeekDef } from '@/lib/sim/types';
import { inPrep, isWip } from './LandNav';
import { useVisitedAll } from './progress';
import { IconCheck, IconChevron } from './icons';
import { hueStyle } from './topicHue';

/** The topic sheet is two columns that read down, then across (1–5 | 6–10; 11 topics: 1–6 | 7–11). */

/**
 * The topic switcher of the top bar: the current topic by number and name (never a bare "03"), and
 * one click away, a sheet with every topic, its span, its stages and how far the student has got.
 * The sheet opens in place with no measuring (nothing jumps), takes the keyboard (arrows, Home/End,
 * Enter, Escape) and returns focus to the switcher when it closes.
 */
export function WeekNav({ current, stageId }: { current: WeekDef; stageId?: string }) {
  const visited = useVisitedAll();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const cur = new Set(visited[current.week] ?? []);
  const curDone = current.stages.filter((s) => cur.has(s.id)).length;

  useEffect(() => {
    if (!open) return;
    sheet.current?.querySelector<HTMLElement>('[aria-current="page"]')?.focus();
    const away = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  }, [open]);

  const close = (refocus: boolean) => {
    setOpen(false);
    if (refocus) btn.current?.focus();
  };

  // The sheet owns its keys while open (the simulator's arrows and Space must not step the stage).
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      close(true);
      return;
    }
    const items = Array.from(sheet.current?.querySelectorAll<HTMLElement>('.tsw-item') ?? []);
    const at = items.indexOf(document.activeElement as HTMLElement);
    let to = -1;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') to = Math.min(items.length - 1, Math.max(0, (at < 0 ? 0 : at) + (e.key === 'ArrowDown' ? 1 : -1)));
    else if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && at >= 0) {
      // Across the columns: the item beside this one (by position, whatever the grouping).
      const me = items[at].getBoundingClientRect();
      const side = items
        .map((el, i) => ({ i, r: el.getBoundingClientRect() }))
        .filter(({ r }) => (e.key === 'ArrowRight' ? r.left > me.right - 4 : r.right < me.left + 4))
        .sort((a, b) => Math.abs(a.r.top - me.top) - Math.abs(b.r.top - me.top))[0];
      if (side) to = side.i;
    }
    else if (e.key === 'Home') to = 0;
    else if (e.key === 'End') to = items.length - 1;
    if (to >= 0) {
      e.preventDefault();
      items[to]?.focus();
    }
    if (e.key !== 'Tab') e.stopPropagation();
  };

  return (
    <div className={`tsw${open ? ' is-open' : ''}`} ref={root} data-tour="gaiak" style={hueStyle(current.week)}>
      <button
        ref={btn}
        className="tsw-btn"
        data-tour="gaia-hautatu"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`Gaia: ${current.week}. ${current.title}. Gaiak aldatu`}
        data-tip={open ? undefined : 'Gaiak: guztiak, beren etapekin'}
        data-tip-pos="bottom"
      >
        <span className="tsw-n">{current.week}</span>
        <span className="tsw-t">{current.title}</span>
        <IconChevron size={14} className="tsw-caret" />
      </button>
      {open && (
        <div className="tsw-sheet" ref={sheet} role="dialog" aria-label="Gaiak" onKeyDown={onKey}>
          <div className="tsw-head">
            <div>
              <b className="tsw-title">Gaiak</b>
              <span className="tsw-sub">Garapenaren ordenan · {weeks.length} gai</span>
            </div>
            <span className="tsw-here">
              <Ring part={current.stages.length ? curDone / current.stages.length : 0} />
              <span>
                <b>{current.week}. gaia</b> · {curDone}/{current.stages.length} etapa ikusita
              </span>
            </span>
          </div>
          <TopicList current={current} stageId={stageId} visited={visited} onPick={() => close(false)} />
        </div>
      )}
    </div>
  );
}

/** How far through a topic: a small ring in the topic's colour; a check when every stage has been seen. */
function Ring({ part }: { part: number }) {
  const C = 2 * Math.PI * 7;
  if (part >= 1)
    return (
      <span className="tsw-ring is-done" aria-hidden>
        <IconCheck size={11} />
      </span>
    );
  return (
    <svg className="tsw-ring" width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <circle cx="9" cy="9" r="7" className="tsw-ring-track" />
      {part > 0 && <circle cx="9" cy="9" r="7" className="tsw-ring-fill" strokeDasharray={`${Math.max(1.5, part * C)} ${C}`} transform="rotate(-90 9 9)" />}
    </svg>
  );
}

/** The topics in two chapters: how a body begins, then its systems. */
const GROUPS: { title: string; from: number; to: number }[] = [
  { title: 'Garapen orokorra', from: 1, to: 6 },
  { title: 'Organo-sistemak', from: 7, to: 99 },
];

/** Every topic, in order: its number in its own colour, name, span, where the student is and how far they have got. */
export function TopicList({ current, stageId, visited, onPick }: { current: WeekDef; stageId?: string; visited: Record<number, string[] | undefined>; onPick?: () => void }) {
  return (
    <nav aria-label="Gaiak" className="tsw-groups">
      {GROUPS.map((g) => {
        const list = weeks.filter((w) => w.week >= g.from && w.week <= g.to);
        if (!list.length) return null;
        return (
          <section key={g.title} className="tsw-group">
            <p className="tsw-group-h">
              {g.title}
              <span>
                {list[0].week}–{list[list.length - 1].week}
              </span>
            </p>
            <ol className="tsw-grid" style={{ '--rows': Math.ceil(list.length / 2) } as CSSProperties}>
              {list.map((w) => {
                const on = w.week === current.week;
                const wip = isWip(w);
                const prep = inPrep(w);
                const seen = new Set(visited[w.week] ?? []);
                const done = w.stages.filter((s) => seen.has(s.id)).length;
                const span = spanOf(w);
                const now = on ? w.stages.find((s) => s.id === stageId) : undefined;
                return (
                  <li key={w.week}>
                    <Link
                      href={`/astea/${w.week}`}
                      style={hueStyle(w.week)}
                      className={`tsw-item${on ? ' is-on' : ''}${wip ? ' is-wip' : ''}${done === w.stages.length && done > 0 ? ' is-done' : ''}`}
                      aria-current={on ? 'page' : undefined}
                      aria-label={`${w.week}. gaia: ${w.title} (${span.long})${prep ? ' · prestatzen' : ''}${wip ? '' : ` · ${done}/${w.stages.length} etapa ikusita`}`}
                      onClick={onPick}
                      title={w.subtitle}
                    >
                      <span className="tsw-item-n">{String(w.week).padStart(2, '0')}</span>
                      <span className="tsw-item-body">
                        <b>{w.title}</b>
                        <span className="tsw-item-meta">
                          {now ? <em className="is-here">Hemen · {now.title}</em> : prep ? <em className="is-prep">Prestatzen</em> : span.long}
                        </span>
                      </span>
                      {!wip && (
                        <span className="tsw-item-prog" title={`${done}/${w.stages.length} etapa ikusita`}>
                          {done > 0 && done < w.stages.length && <small>{done}/{w.stages.length}</small>}
                          <Ring part={w.stages.length ? done / w.stages.length : 0} />
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </nav>
  );
}
