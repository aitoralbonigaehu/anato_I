'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { BEL_ITEMS, BEL_SYSTEMS } from '@/content/belortzioak';
import { POOL } from '@/content/pool';
import { weeks } from '@/content/registry';
import { readCards, STORE as BEL_STORE, type Cards } from '@/lib/belortzioakCards';
import { parseReviewProgress, STORAGE_KEY as SCHEME_KEY } from '@/lib/learning/scheme-review';
import { dayKey } from '@/lib/study/activity';
import { LEVELS, summarize, type Summary, type TopicRow } from '@/lib/study/summary';
import { askAccount, signOut, useAccount } from '@/components/account/account';
import { useActivity } from '@/components/study/useActivity';
import { useAnswers } from '@/components/shell/answers';
import { isWip } from '@/components/shell/LandNav';
import { resumeHref, useLastPlace, useVisitedAll } from '@/components/shell/progress';
import { hueOf } from '@/components/shell/topicHue';
import { Glyph } from './glyphs';
import p from './aurrerapena.module.css';

const Q_WEEK = new Map(POOL.map((q) => [q.id, q.week]));
const TOPICS = weeks.map((w) => ({ week: w.week, title: w.title, ready: !isWip(w), stages: w.stages.map((s) => ({ id: s.id, title: s.title })) }));
const SYSTEMS = BEL_SYSTEMS.map((s) => ({ id: s.id, title: s.short, keys: BEL_ITEMS.filter((x) => x.plate.system === s.id).map((x) => x.item.key) }));

function minutes(sec: number) {
  const m = Math.round(sec / 60);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)} h ${m % 60 ? `${m % 60} min` : ''}`.trim();
}

/** The flashcard stores that are not React stores: read once, and again when they change. */
function useCardStores() {
  const [bel, setBel] = useState<Cards>({});
  const [scheme, setScheme] = useState({ reviewed: 0, known: 0 });
  useEffect(() => {
    const load = () => {
      setBel(readCards());
      try {
        const sp = parseReviewProgress(window.localStorage.getItem(SCHEME_KEY));
        const all = Object.values(sp);
        setScheme({ reviewed: all.length, known: all.filter((x) => x.correct > 0 && x.mistakes === 0).length });
      } catch {}
    };
    const raf = window.setTimeout(load);
    const onStorage = (e: StorageEvent) => (e.key === null || e.key === BEL_STORE || e.key === SCHEME_KEY) && load();
    window.addEventListener('storage', onStorage);
    return () => {
      window.clearTimeout(raf);
      window.removeEventListener('storage', onStorage);
    };
  }, []);
  return { bel, scheme };
}

export function Aurrerapena() {
  const activity = useActivity();
  const visited = useVisitedAll();
  const answers = useAnswers();
  const { bel, scheme } = useCardStores();
  const [now, setNow] = useState(0);
  useEffect(() => {
    const raf = window.setTimeout(() => setNow(Date.now()));
    return () => window.clearTimeout(raf);
  }, []);

  const sum = useMemo(
    () =>
      summarize({
        now,
        activity,
        visited,
        answers,
        questionWeek: (id) => Q_WEEK.get(id),
        bel,
        belSystems: SYSTEMS,
        scheme,
        topics: TOPICS,
      }),
    [now, activity, visited, answers, bel, scheme],
  );

  if (!now) return <div className={p.loading} aria-busy="true" />;

  return (
    <div className={p.root}>
      <Hero sum={sum} />
      <Tiles sum={sum} />
      <Next sum={sum} />
      <div className={p.split}>
        <Calendar sum={sum} now={now} />
        <Badges sum={sum} />
      </div>
      <Topics sum={sum} />
      <Cardboxes sum={sum} />
    </div>
  );
}

// ---- the hero: who, level, streak, today's goal ----------------------------------------------------

function Hero({ sum }: { sum: Summary }) {
  const acc = useAccount();
  const { level, xp, streak, goal } = sum;
  const span = level.to === null ? 1 : level.to - level.from;
  const into = level.to === null ? 1 : (xp - level.from) / span;
  const next = LEVELS[level.index + 1]?.[1];
  const name = acc.user?.name;
  return (
    <section className={p.hero} data-tour="aurrerapena-maila">
      <div className={p.who}>
        <div className={p.avatar} style={{ ['--p' as string]: `${Math.round(into * 100)}%` }}>
          <span>{name ? name[0].toUpperCase() : <Glyph name="seed" size={30} />}</span>
          <b className={p.levelNum}>{level.index + 1}</b>
        </div>
        <div className={p.whoText}>
          <p className={p.kicker}>{name ? `Kaixo, ${name}` : 'Zure aurrerapena'}</p>
          <h1 className={p.levelName}>{level.name}</h1>
          <div className={p.xpBar} role="meter" aria-valuemin={level.from} aria-valuemax={level.to ?? xp} aria-valuenow={xp} aria-label="Esperientzia">
            <i style={{ width: `${Math.round(into * 100)}%` }} />
          </div>
          <p className={p.xpText}>
            <b>{xp} XP</b>
            {level.to !== null ? (
              <>
                {' '}
                · {level.to - xp} XP falta «{next}» izateko
              </>
            ) : (
              ' · goiko maila!'
            )}
          </p>
          <AccountLine />
        </div>
      </div>

      <div className={p.heroSide}>
        <div className={`${p.streak}${streak.current > 0 ? ` ${p.isLit}` : ''}`} title={`Onena: ${streak.best} egun`}>
          <span className={p.flame}>
            <Glyph name="flame" size={30} />
          </span>
          <b>{streak.current}</b>
          <small>{streak.current === 1 ? 'egun' : 'egun jarraian'}</small>
          <em>{streak.today ? 'Gaur eginda ✓' : streak.current ? 'Ikasi gaur boladari eusteko' : 'Hasi gaur bolada bat'}</em>
        </div>
        <div className={p.goal} style={{ ['--p' as string]: `${Math.round(goal.done * 100)}%` }}>
          <div className={p.goalRing}>
            <span>{goal.done >= 1 ? <Glyph name="check" size={26} /> : `${Math.round(goal.done * 100)}%`}</span>
          </div>
          <div>
            <b>Gaurko helburua</b>
            <small>
              {minutes(goal.seconds)} / 15 min · {goal.recalls} / 20 txartel
            </small>
          </div>
        </div>
      </div>
    </section>
  );
}

function AccountLine() {
  const acc = useAccount();
  if (acc.status === 'in')
    return (
      <p className={p.account}>
        <Glyph name="cloud" size={15} /> Hodeian gordeta{acc.syncing ? '…' : ''} · {acc.user?.name}
        <button className={p.linkBtn} onClick={() => void signOut()}>
          Saioa itxi
        </button>
      </p>
    );
  if (acc.status === 'out')
    return (
      <p className={p.account}>
        <Glyph name="lock" size={15} /> Nabigatzaile honetan bakarrik gordeta.
        <button className="btn small primary" onClick={askAccount}>
          Gorde hodeian
        </button>
      </p>
    );
  return (
    <p className={p.account}>
      <Glyph name="lock" size={15} /> Nabigatzaile honetan gordetzen da.
    </p>
  );
}

// ---- tiles ------------------------------------------------------------------------------------------

function Tiles({ sum }: { sum: Summary }) {
  const t = sum.totals;
  const tries = t.right + t.wrong;
  const tiles = [
    { icon: 'eye', label: 'Etapak ikusita', value: `${t.stagesSeen}`, of: `/${t.stages}`, p: t.stagesSeen / Math.max(1, t.stages), note: `${t.views} aldiz ireki` },
    { icon: 'clock', label: 'Simulagailuan', value: minutes(t.seconds), of: '', p: Math.min(1, t.seconds / 36000), note: 'ikasten emandako denbora' },
    { icon: 'target', label: 'Asmatuak', value: tries ? `${Math.round((100 * t.right) / tries)}%` : '—', of: '', p: tries ? t.right / tries : 0, note: `${t.right} zuzen · ${t.wrong} huts` },
    { icon: 'cards', label: 'Txartelak ikasita', value: `${t.cardsKnown}`, of: '', p: t.cardsKnown / Math.max(1, t.cards), note: t.due ? `${t.due} errepasatzeko` : 'egunean' },
  ];
  return (
    <section className={p.tiles} aria-label="Laburpena">
      {tiles.map((x) => (
        <div key={x.label} className={p.tile}>
          <span className={p.tileIcon}>
            <Glyph name={x.icon} size={18} />
          </span>
          <small>{x.label}</small>
          <b>
            {x.value}
            {x.of && <span className={p.of}>{x.of}</span>}
          </b>
          <div className={p.thin}>
            <i style={{ width: `${Math.round(x.p * 100)}%` }} />
          </div>
          <em>{x.note}</em>
        </div>
      ))}
    </section>
  );
}

// ---- what to do next --------------------------------------------------------------------------------

function Next({ sum }: { sum: Summary }) {
  const last = useLastPlace();
  const lw = last ? weeks.find((w) => w.week === last.week) : undefined;
  const ls = lw?.stages.find((s) => s.id === last?.stage);
  const fresh = sum.topics.find((t) => t.ready && t.seen === 0);
  const half = sum.topics.filter((t) => t.ready && t.seen > 0 && t.seen < t.total).sort((a, b) => b.last - a.last)[0];
  const items: { href: string; icon: string; title: string; text: string; tone: string }[] = [];
  if (lw && ls) items.push({ href: resumeHref(lw.week, lw.stages, last), icon: 'play', title: 'Jarraitu utzi zenuen lekutik', text: `${lw.week}. gaia · ${ls.title}`, tone: p.toneSignal });
  if (sum.totals.due) items.push({ href: '/belortzioak', icon: 'cards', title: `${sum.totals.due} txartel errepasatzeko`, text: 'Belortzioak · Ikasketa modua', tone: p.toneAmber });
  if (half && half.week !== lw?.week) {
    const nextStage = half.stages.find((s) => !s.views);
    if (nextStage) items.push({ href: `/astea/${half.week}?etapa=${nextStage.id}`, icon: 'flag', title: `Amaitu ${half.week}. gaia`, text: `${half.total - half.seen} etapa falta · ${nextStage.title}`, tone: p.toneOk });
  }
  if (fresh && items.length < 3) items.push({ href: `/astea/${fresh.week}`, icon: 'compass', title: 'Gai berri bat', text: `${fresh.week}. gaia · ${fresh.title}`, tone: p.toneViolet });
  if (!items.length) return null;
  return (
    <section className={p.next} aria-label="Hurrengo urratsa">
      {items.slice(0, 3).map((x) => (
        <Link key={x.title} href={x.href} className={`${p.nextCard} ${x.tone}`}>
          <span className={p.nextIcon}>
            <Glyph name={x.icon} size={18} />
          </span>
          <span>
            <b>{x.title}</b>
            <small>{x.text}</small>
          </span>
          <span className={p.arrow} aria-hidden>
            →
          </span>
        </Link>
      ))}
    </section>
  );
}

// ---- the calendar -----------------------------------------------------------------------------------

const WEEKS_SHOWN = 18;
const DAY_NAMES = ['Al', 'Ar', 'Az', 'Og', 'Or', 'Lr', 'Ig'];

function Calendar({ sum, now }: { sum: Summary; now: number }) {
  const cols = useMemo(() => {
    const today = new Date(now);
    const dow = (today.getDay() + 6) % 7; // Monday first
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - dow - (WEEKS_SHOWN - 1) * 7, 12);
    return Array.from({ length: WEEKS_SHOWN }, (_, c) =>
      Array.from({ length: 7 }, (_, r) => {
        const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + c * 7 + r, 12);
        return { key: dayKey(d.getTime()), future: d.getTime() > now + 3_600_000, date: d };
      }),
    );
  }, [now]);
  const active = Object.values(sum.days).filter((d) => d.level > 0).length;
  return (
    <section className={p.card} aria-label="Ikasketa-egutegia">
      <header className={p.cardHead}>
        <h2>Egutegia</h2>
        <small>
          {active} egun ikasten · onena {sum.streak.best} egun jarraian
        </small>
      </header>
      <div className={p.cal}>
        <div className={p.calDays} aria-hidden>
          {DAY_NAMES.map((d, i) => (
            <span key={d}>{i % 2 ? '' : d}</span>
          ))}
        </div>
        {cols.map((col, c) => (
          <div key={c} className={p.calCol}>
            {col.map((d) => {
              const x = sum.days[d.key];
              return (
                <i
                  key={d.key}
                  className={`${p.cell} ${d.future ? p.isFuture : p[`l${x?.level ?? 0}`]}`}
                  title={d.future ? undefined : `${d.date.toLocaleDateString('eu', { month: 'short', day: 'numeric' })}: ${x ? `${minutes(x.seconds)} · ${x.recalls} txartel/galdera` : 'ezer ez'}`}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className={p.legendRow} aria-hidden>
        <small>Gutxiago</small>
        {[0, 1, 2, 3, 4].map((l) => (
          <i key={l} className={`${p.cell} ${p[`l${l}`]}`} />
        ))}
        <small>Gehiago</small>
      </div>
    </section>
  );
}

// ---- badges -----------------------------------------------------------------------------------------

function Badges({ sum }: { sum: Summary }) {
  const got = sum.badges.filter((b) => b.got).length;
  return (
    <section className={p.card} aria-label="Lorpenak" data-tour="aurrerapena-lorpenak">
      <header className={p.cardHead}>
        <h2>Lorpenak</h2>
        <small>
          {got}/{sum.badges.length} lortuta
        </small>
      </header>
      <ul className={p.badges}>
        {sum.badges.map((b) => (
          <li key={b.id} className={b.got ? p.isGot : ''} title={`${b.title}: ${b.text} (${b.count})`}>
            <span className={p.medal} style={{ ['--p' as string]: `${Math.round(b.progress * 100)}%` }}>
              <Glyph name={b.got ? b.icon : b.progress > 0 ? b.icon : 'lock'} size={20} />
            </span>
            <b>{b.title}</b>
            <small>{b.got ? 'Lortuta' : b.count}</small>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ---- topics -----------------------------------------------------------------------------------------

function Topics({ sum }: { sum: Summary }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className={p.section} aria-label="Gaika" data-tour="aurrerapena-gaiak">
      <header className={p.sectionHead}>
        <h2>Gaika</h2>
        <small>Etapa bakoitza zenbat aldiz ireki duzun, eta zenbat denbora eman duzun. Klikatu gai bat xehetasunetarako.</small>
      </header>
      <div className={p.topics}>
        {sum.topics.map((t) => (
          <TopicCard key={t.week} t={t} open={open === t.week} onToggle={() => setOpen((o) => (o === t.week ? null : t.week))} />
        ))}
      </div>
    </section>
  );
}

function TopicCard({ t, open, onToggle }: { t: TopicRow; open: boolean; onToggle: () => void }) {
  const pct = t.total ? t.seen / t.total : 0;
  const maxViews = Math.max(1, ...t.stages.map((s) => s.views));
  const tries = t.right + t.wrong;
  return (
    <article className={`${p.topic}${open ? ` ${p.isOpen}` : ''}${t.seen === t.total && t.total ? ` ${p.isFull}` : ''}${!t.ready ? ` ${p.isPrep}` : ''}`} style={{ ['--h' as string]: hueOf(t.week) }}>
      <button className={p.topicHead} onClick={onToggle} aria-expanded={open}>
        <span className={p.ring} style={{ ['--p' as string]: `${Math.round(pct * 100)}%` }}>
          <b>{t.week}</b>
        </span>
        <span className={p.topicText}>
          <b>{t.title}</b>
          <small>
            {t.seen}/{t.total} etapa · {t.views} aldiz{t.seconds ? ` · ${minutes(t.seconds)}` : ''}
            {tries ? ` · ${Math.round((100 * t.right) / tries)}% galderak` : ''}
          </small>
        </span>
        <span className={p.dots} aria-hidden>
          {t.stages.map((s) => (
            <i key={s.id} className={s.views ? p.isSeen : ''} style={{ opacity: s.views ? 0.45 + 0.55 * (s.views / maxViews) : undefined }} />
          ))}
        </span>
      </button>
      {open && (
        <ol className={p.stages}>
          {t.stages.map((s, i) => (
            <li key={s.id}>
              <Link href={`/astea/${t.week}?etapa=${s.id}`} className={p.stage}>
                <span className={p.stageN}>{i + 1}</span>
                <span className={p.stageT}>{s.title}</span>
                <span className={p.stageBar}>
                  <i style={{ width: `${(100 * s.views) / maxViews}%` }} />
                </span>
                <span className={p.stageCount}>{s.views ? `×${s.views}` : 'ikusi gabe'}</span>
                <span className={p.stageTime}>{s.seconds >= 60 ? minutes(s.seconds) : ''}</span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </article>
  );
}

// ---- flashcards by box ------------------------------------------------------------------------------

const BOXES = ['Berriak', 'Ikasten', 'Badakizu', 'Menderatuta'];

function Cardboxes({ sum }: { sum: Summary }) {
  return (
    <section className={p.section} aria-label="Belortzioak">
      <header className={p.sectionHead}>
        <h2>Belortzioak</h2>
        <small>Txartel bakoitza bere kutxan: asmatzen duzun bakoitzean aurrera egiten du, huts egitean hasierara itzultzen da.</small>
        <Link href="/belortzioak" className="btn small primary">
          Ikasketa modua{sum.totals.due ? ` · ${sum.totals.due}` : ''}
        </Link>
      </header>
      <div className={p.boxLegend} aria-hidden>
        {BOXES.map((b, i) => (
          <span key={b}>
            <i className={p[`b${i}`]} /> {b}
          </span>
        ))}
      </div>
      <div className={p.boxes}>
        {sum.bel.map((s) => (
          <div key={s.id} className={p.boxRow}>
            <b>{s.title}</b>
            <div className={p.stack} role="img" aria-label={`${s.title}: ${s.boxes.map((n, i) => `${BOXES[i]} ${n}`).join(', ')}`}>
              {/* Mastered first: the bar fills from the left as cards move up. */}
              {[3, 2, 1, 0].map((i) => (s.boxes[i] ? <i key={i} className={p[`b${i}`]} style={{ flexGrow: s.boxes[i] }} title={`${BOXES[i]}: ${s.boxes[i]}`} /> : null))}
            </div>
            <small>
              {s.boxes[2] + s.boxes[3]}/{s.total}
              {s.due ? <em> · {s.due} orain</em> : null}
            </small>
          </div>
        ))}
      </div>
    </section>
  );
}
