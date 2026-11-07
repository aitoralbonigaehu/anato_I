'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { CHANGES, KIND, LATEST, SEEN_KEY, longDate, type Change, type ChangeKind } from '@/content/changelog';
import { KimuFace } from '@/components/kimu/KimuFace';
import { LandFoot, LandNav } from './LandNav';
import { TopicShot } from './TopicShot';
import { BrandMark, IconMoon, IconSearch, IconSun } from './icons';
import { hueStyle } from './topicHue';
import { useModKey } from './CommandBar';
import './landing.css';

/** Last time this student opened the page (before this visit): newer changes wear a "Berria" glow. */
function useSeenBefore() {
  const [before, setBefore] = useState<string | null>(null);
  useEffect(() => {
    let prev = '';
    try {
      prev = localStorage.getItem(SEEN_KEY) ?? '';
      localStorage.setItem(SEEN_KEY, LATEST);
      window.dispatchEvent(new Event('enbrioatlas:berriak-seen'));
    } catch {}
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read once, then mark as seen
    setBefore(prev);
  }, []);
  return before;
}

/** The little picture on each card. */
function Visual({ v, hot }: { v: Change['visual']; hot: boolean }) {
  const mod = useModKey();
  if (!v) return null;
  if (typeof v === 'object')
    return (
      <span className="wn-shot theme-stage" style={hueStyle(v.topic)}>
        <TopicShot week={v.topic} hot={hot} />
      </span>
    );
  const art: Record<string, ReactNode> = {
    opening: (
      <span className="wn-art wn-opening theme-stage">
        <i className="wn-ring" />
        <i className="wn-ring is-2" />
        <span className="wn-mark">
          <BrandMark size={54} />
        </span>
      </span>
    ),
    theme: (
      <span className="wn-art wn-theme">
        <span className="is-light">
          <IconSun size={22} />
          <b>Argia</b>
        </span>
        <span className="is-dark">
          <IconMoon size={22} />
          <b>Iluna</b>
        </span>
      </span>
    ),
    search: (
      <span className="wn-art wn-search theme-stage">
        <span className="wn-field">
          <IconSearch size={15} />
          <em>gibel</em>
          <span className="wn-caret" />
          <span className="wn-kbd">
            <kbd>{mod}</kbd>
            <kbd>K</kbd>
          </span>
        </span>
        <span className="wn-row is-on">
          <b>14</b> Gibela <small>etapa</small>
        </span>
        <span className="wn-row">
          <b>14</b> Gibel hodia <small>egitura</small>
        </span>
      </span>
    ),
    story: (
      <span className="wn-art wn-story theme-stage">
        {['0', '8', '15', '22', '56'].map((d, i) => (
          <span key={d} className="wn-day" style={{ '--i': i } as CSSProperties}>
            <b>{d}</b>
            <small>. eguna</small>
          </span>
        ))}
      </span>
    ),
    map: (
      <span className="wn-art wn-map">
        {[40, 18, 300, 28, 70, 355, 295, 80, 22, 12, 2, 255, 235, 155, 92, 325].map((h, i) => (
          <i key={i} style={{ '--th': h, '--i': i } as CSSProperties}>
            {i + 1}
          </i>
        ))}
      </span>
    ),
    kimu: (
      <span className="wn-art wn-kimu">
        <span className="wn-bubble">Animo!!!!</span>
        <KimuFace mood="happy" size={86} still />
      </span>
    ),
    cards: (
      <span className="wn-art wn-cards">
        <span className="wn-card is-back" />
        <span className="wn-card is-mid" />
        <span className="wn-card is-front">
          <small>Mintzak</small>
          <b>Zer bereizten dute mintz pleuroperikardikoek?</b>
        </span>
      </span>
    ),
  };
  return art[v] ?? null;
}

function Entry({ c, fresh, i }: { c: Change; fresh: boolean; i: number }) {
  const [hot, setHot] = useState(false);
  const k = KIND[c.kind];
  return (
    <li className={`wn-entry${fresh ? ' is-fresh' : ''}`} style={{ '--kh': k.hue, '--d': `${(i % 6) * 70}ms` } as CSSProperties} data-rv onPointerEnter={() => setHot(true)} onPointerLeave={() => setHot(false)}>
      <span className="wn-node" aria-hidden />
      <article className="wn-card-in">
        <div className="wn-visual">
          <Visual v={c.visual} hot={hot} />
        </div>
        <div className="wn-body">
          <p className="wn-meta">
            <span className="wn-kind">{k.label}</span>
            {fresh && <span className="wn-new">Ez duzu ikusi</span>}
          </p>
          <h3>{c.title}</h3>
          <p className="wn-text">{c.text}</p>
          {c.points && (
            <ul className="wn-points">
              {c.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          )}
          {c.href && (
            <Link className="wn-go" href={c.href}>
              {c.cta ?? 'Ikusi'} <span aria-hidden>→</span>
            </Link>
          )}
        </div>
      </article>
    </li>
  );
}

const FILTERS: (ChangeKind | 'denak')[] = ['denak', 'gaia', 'berria', 'hobekuntza', 'diseinua'];

/** "Berriak": what has changed in EnbrioAtlas, newest first, grouped by day. */
export function WhatsNew() {
  const before = useSeenBefore();
  const [filter, setFilter] = useState<ChangeKind | 'denak'>('denak');
  const list = useMemo(() => CHANGES.filter((c) => filter === 'denak' || c.kind === filter), [filter]);
  const days = useMemo(() => {
    const out: { date: string; items: Change[] }[] = [];
    for (const c of list) {
      const last = out[out.length - 1];
      if (last && last.date === c.date) last.items.push(c);
      else out.push({ date: c.date, items: [c] });
    }
    return out;
  }, [list]);
  const fresh = (c: Change) => before !== null && before !== '' && c.date > before;
  const unseen = before === null ? 0 : before === '' ? 0 : CHANGES.filter((c) => c.date > before).length;
  let n = 0;
  return (
    <div className="landing wn-page">
      <LandNav current="berriak" />
      <header className="ln-hero wn-hero">
        <p className="eyebrow">Berriak · azken eguneraketa {longDate(LATEST)}</p>
        <h1>Zer dago berri EnbrioAtlas-en</h1>
        <p className="hero-lead">
          Aplikazioa ikasten laguntzeko egunero hobetzen dugu. Hemen ikusiko dituzu gai berriak, ezaugarri berriak eta hobekuntzak, bakoitza zer den eta non ikusi.
          {unseen > 0 && (
            <>
              {' '}
              <b className="wn-unseen">Azken bisitatik {unseen} berri.</b>
            </>
          )}
        </p>
        <div className="qz-kinds wn-filters" role="group" aria-label="Mota">
          {FILTERS.map((f) => (
            <button key={f} type="button" className={filter === f ? 'is-on' : ''} onClick={() => setFilter(f)} style={f === 'denak' ? undefined : ({ '--kh': KIND[f].hue } as CSSProperties)}>
              {f !== 'denak' && <i className="wn-dot" aria-hidden />}
              {f === 'denak' ? 'Denak' : KIND[f].label}
              <small>{f === 'denak' ? CHANGES.length : CHANGES.filter((c) => c.kind === f).length}</small>
            </button>
          ))}
        </div>
      </header>

      <section className="wn-timeline" aria-label="Aldaketak">
        {days.map((d) => (
          <div key={d.date} className="wn-day-group">
            <h2 className="wn-date">
              <time dateTime={d.date}>{longDate(d.date)}</time>
            </h2>
            <ol className="wn-list">
              {d.items.map((c) => (
                <Entry key={c.id} c={c} fresh={fresh(c)} i={n++} />
              ))}
            </ol>
          </div>
        ))}
        {days.length === 0 && <p className="wn-empty">Ez dago mota honetako aldaketarik oraindik.</p>}
      </section>
      <LandFoot />
    </div>
  );
}
