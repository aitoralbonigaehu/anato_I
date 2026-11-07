'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { openKimu } from '@/components/kimu/store';
import { ACTIONS, GROUP_LABEL, PAGES, buildIndex, search, type Command, type CommandGroup } from './command-index';
import { IconCell, IconHistory, IconPage, IconReturn, IconSearch, IconSpark, IconStage } from './icons';
import { setThemePref, type ThemePref } from './theme';

/** Open the bar from anywhere (the bar's search key, a menu item). */
export const OPEN_COMMAND = 'enbrioatlas:open-command';
/** What the simulator listens for to run one of its own actions. */
export const RUN_COMMAND = 'enbrioatlas:command';
export const openCommandBar = () => window.dispatchEvent(new Event(OPEN_COMMAND));

const RECENT_KEY = 'enbrioatlas:command-recent';
const readRecent = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]');
  } catch {
    return [];
  }
};

const ICON: Record<CommandGroup, ReactNode> = {
  azkenak: <IconHistory size={16} />,
  ekintzak: <IconSpark size={16} />,
  gaiak: <IconStage size={16} />,
  etapak: <IconStage size={16} />,
  egiturak: <IconCell size={16} />,
  orriak: <IconPage size={16} />,
};

/** The platform's modifier, for the hints (⌘ on Apple devices, Ctrl elsewhere). */
export function useModKey() {
  const [mod, setMod] = useState('Ctrl');
  useEffect(() => {
    // Read once on the client (the server cannot know the device).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)) setMod('⌘');
  }, []);
  return mod;
}

/**
 * ⌘K / Ctrl+K: one place to find everything — topics, stages, structures, pages — and to do
 * anything (ask Kimu, open the notes, change the look), each with its own shortcut shown.
 */
export function CommandBar() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const [index, setIndex] = useState<Command[] | null>(null);
  const [recent, setRecent] = useState<string[]>([]);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const path = usePathname();
  const inSim = path?.startsWith('/astea/') ?? false;
  const listId = useId();
  const mod = useModKey();

  const show = useCallback(() => {
    setRecent(readRecent());
    setQ('');
    setSel(0);
    setOpen(true);
  }, []);

  // ⌘K / Ctrl+K anywhere, also while typing: it is an explicit ask ("/" stays the pages' own search key).
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (open) setOpen(false);
        else show();
      }
    };
    window.addEventListener('keydown', key);
    window.addEventListener(OPEN_COMMAND, show);
    return () => {
      window.removeEventListener('keydown', key);
      window.removeEventListener(OPEN_COMMAND, show);
    };
  }, [open, show]);

  // The content index loads the first time the bar opens (it is not needed on any page before that).
  useEffect(() => {
    if (!open || index) return;
    let live = true;
    import('@/content/registry').then(({ weeks, structures, appearances }) => {
      if (!live) return;
      const first = new Map<string, { week: number; stage: string }>();
      for (const [id, refs] of appearances) if (refs[0]) first.set(id, { week: refs[0].week.week, stage: refs[0].stage.id });
      setIndex(buildIndex(weeks, first, structures));
    });
    return () => {
      live = false;
    };
  }, [open, index]);

  useEffect(() => {
    if (!open) return;
    input.current?.focus();
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = 'hidden';
    return () => {
      html.style.overflow = prev;
    };
  }, [open]);

  const actions = useMemo(() => ACTIONS.filter((a) => !a.sim || inSim), [inSim]);
  const all = useMemo(() => [...actions, ...PAGES, ...(index ?? [])], [actions, index]);

  const groups = useMemo(() => {
    if (q.trim()) return search(all, q, { gaiak: 4, etapak: 7, egiturak: 7, orriak: 4, ekintzak: 5 });
    const byId = new Map(all.map((c) => [c.id, c]));
    const rec = recent.map((id) => byId.get(id)).filter((c): c is Command => !!c).slice(0, 5);
    return [
      ...(rec.length ? [{ group: 'azkenak' as const, items: rec.map((c) => ({ ...c, group: 'azkenak' as const, origin: c.group })) }] : []),
      { group: 'ekintzak' as const, items: actions.slice(0, inSim ? 6 : 2) },
      { group: 'orriak' as const, items: PAGES.filter((p) => p.href !== path) },
    ];
  }, [q, all, recent, actions, inSim, path]);

  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);
  const pick = Math.min(sel, Math.max(0, flat.length - 1));

  useEffect(() => {
    list.current?.querySelector<HTMLElement>(`[data-i="${pick}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [pick]);

  const run = (c: Command) => {
    setOpen(false);
    const id = c.id;
    const next = [id, ...readRecent().filter((r) => r !== id)].slice(0, 8);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {}
    if (c.href) {
      router.push(c.href);
      return;
    }
    const a = c.action ?? '';
    if (a === 'kimu') openKimu();
    else if (a.startsWith('theme:')) setThemePref(a.slice(6) as ThemePref);
    else window.dispatchEvent(new CustomEvent(RUN_COMMAND, { detail: a }));
  };

  if (!open) return null;

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSel((pick + 1) % Math.max(1, flat.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSel((pick - 1 + flat.length) % Math.max(1, flat.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flat[pick]) run(flat[pick]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      // Escape steps back: first the query, then the bar.
      if (q) {
        setQ('');
        setSel(0);
      } else setOpen(false);
    } else if (e.key === 'Tab') e.preventDefault();
  };

  // Each group's first row number in the flat list (for the keyboard selection).
  const starts = groups.map((_, k) => groups.slice(0, k).reduce((n, g) => n + g.items.length, 0));
  return (
    <div className="cmdk" role="presentation" onPointerDown={(e) => e.target === e.currentTarget && setOpen(false)}>
      <div className="cmdk-panel" role="dialog" aria-modal="true" aria-label="Bilatu eta ekin">
        <div className="cmdk-field">
          <IconSearch size={18} />
          <input
            ref={input}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setSel(0);
            }}
            onKeyDown={onKey}
            placeholder="Bilatu gaiak, etapak, egiturak… edo zer egin nahi duzun"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={flat[pick] ? `${listId}-${pick}` : undefined}
            aria-autocomplete="list"
            spellCheck={false}
            autoComplete="off"
          />
          <kbd className="cmdk-esc" onClick={() => setOpen(false)}>
            esc
          </kbd>
        </div>
        <div className="cmdk-list" ref={list} id={listId} role="listbox" aria-label="Emaitzak">
          {q.trim() && !index && <p className="cmdk-empty">Bilatzen…</p>}
          {q.trim() && index && flat.length === 0 && (
            <p className="cmdk-empty">
              Ez da ezer aurkitu «{q.trim()}» bilatzean.
              <button type="button" onClick={() => run({ id: 'a:kimu', group: 'ekintzak', title: '', action: 'kimu' })}>
                Galdetu Kimuri →
              </button>
            </p>
          )}
          {groups.map((g, gk) => (
            <div className="cmdk-group" key={g.group} role="presentation">
              <p className="cmdk-head" role="presentation">
                {GROUP_LABEL[g.group]}
              </p>
              {g.items.map((c, k) => {
                const n = starts[gk] + k;
                const origin = (c as Command & { origin?: CommandGroup }).origin ?? c.group;
                return (
                  <div
                    key={`${g.group}:${c.id}`}
                    id={`${listId}-${n}`}
                    data-i={n}
                    role="option"
                    aria-selected={n === pick}
                    className={`cmdk-item${n === pick ? ' is-on' : ''}`}
                    onPointerMove={() => n !== pick && setSel(n)}
                    onClick={() => run(c)}
                  >
                    <span className="cmdk-icon" aria-hidden>
                      {c.week && origin !== 'ekintzak' && origin !== 'orriak' ? <b className="cmdk-week">{c.week}</b> : ICON[origin]}
                    </span>
                    <span className="cmdk-text">
                      <span className="cmdk-title">{c.title}</span>
                      {c.sub && <span className="cmdk-sub">{c.sub}</span>}
                    </span>
                    {c.kbd && <kbd>{c.kbd}</kbd>}
                    <span className="cmdk-go" aria-hidden>
                      <IconReturn size={14} />
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="cmdk-foot" aria-hidden>
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> aukeratu
          </span>
          <span>
            <kbd>↵</kbd> ireki
          </span>
          <span>
            <kbd>esc</kbd> itxi
          </span>
          <span className="cmdk-foot-end">
            <kbd>{mod}</kbd>
            <kbd>K</kbd> edonondik
          </span>
        </div>
      </div>
    </div>
  );
}

/** The bar's search key: looks like a field, opens the command bar. */
export function SearchKey({ compact = false }: { compact?: boolean }) {
  const mod = useModKey();
  return (
    <button type="button" className={`search-key${compact ? ' is-compact' : ''}`} onClick={openCommandBar} aria-label="Bilatu (gaiak, etapak, egiturak, ekintzak)" data-tip={compact ? `Bilatu · ${mod}K` : undefined} data-tip-pos="bottom">
      <IconSearch size={15} />
      {!compact && <span className="search-key-t">Bilatu…</span>}
      {!compact && (
        <span className="search-key-k" aria-hidden>
          <kbd>{mod}</kbd>
          <kbd>K</kbd>
        </span>
      )}
    </button>
  );
}
