'use client';

import { IconMonitor, IconMoon, IconSun } from './icons';
import { THEME_LABEL, THEME_SHORT, nextThemePref, setThemePref, useTheme } from './theme';

/** The look, one key: follow the device → light → dark. Its icon says what is set now. */
export function ThemeKey({ className = 'icon-btn' }: { className?: string }) {
  const { pref } = useTheme();
  const next = nextThemePref(pref);
  return (
    <button
      type="button"
      className={`theme-key ${className}`}
      onClick={() => setThemePref(next)}
      aria-label={`Itxura: ${THEME_LABEL[pref]}. Aldatu: ${THEME_LABEL[next]}`}
      data-tip={`Itxura: ${THEME_LABEL[pref].toLowerCase()} → ${THEME_LABEL[next].toLowerCase()}`}
      data-tip-pos="bottom"
    >
      <span className="theme-key-icon" key={pref} aria-hidden>
        {pref === 'system' ? <IconMonitor size={16} /> : pref === 'light' ? <IconSun size={16} /> : <IconMoon size={16} />}
      </span>
    </button>
  );
}

/** The three looks side by side (menus, settings): a segmented control. */
export function ThemeSwitch() {
  const { pref } = useTheme();
  const opts: { v: 'system' | 'light' | 'dark'; icon: React.ReactNode }[] = [
    { v: 'system', icon: <IconMonitor size={15} /> },
    { v: 'light', icon: <IconSun size={15} /> },
    { v: 'dark', icon: <IconMoon size={15} /> },
  ];
  return (
    <div className="theme-switch" role="radiogroup" aria-label="Itxura">
      {opts.map((o) => (
        <button key={o.v} type="button" role="radio" aria-checked={pref === o.v} className={pref === o.v ? 'is-on' : ''} onClick={() => setThemePref(o.v)} title={THEME_LABEL[o.v]}>
          {o.icon}
          <span>{THEME_SHORT[o.v]}</span>
        </button>
      ))}
    </div>
  );
}
