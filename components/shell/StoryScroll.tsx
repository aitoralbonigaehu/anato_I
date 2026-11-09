'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { ORDERED, momentOf, periodOf, simHref, whenOf, type Milestone, type SimMoment } from '@/content/chronology';
import { nameOf } from '@/content/registry';
import { AgeScene, dayParts } from './Timeline';
import { hueStyle } from './topicHue';
import './timeline.css';

/**
 * The home page's story of development, told by scrolling: the key dates of the notes, in order, each with
 * the simulator's own scene of that moment (the process plays as the page moves), its day, what forms, and
 * the way into the simulator. A rail shows where in development you are; "Asmatu eguna" hides the days so
 * the student recalls them before seeing them.
 */

/** The chapters, by their name in the chronology (a name the data lacks is simply skipped). */
const PICKS = [
  'Ernalkuntza',
  'Blastozistoa',
  'Habiratzea hasi',
  'Bi orriko diskoa',
  'Lerro primitiboa',
  'Lehen somita bikotea',
  'Bihotz hodi bakarra',
  'Tolespenak',
  'Gorputz-adarren hasikinak',
  'Septumaren jaitsiera',
  'Enbrioi-aroaren bukaera',
  'Fetu-aroaren hasiera',
];

interface Chapter {
  m: Milestone;
  at: SimMoment;
}

const CHAPTERS: Chapter[] = PICKS.flatMap((name) => {
  const m = ORDERED.find((x) => x.short === name && x.weight === 'gakoa');
  const at = m ? momentOf(m) : null;
  return m && at ? [{ m, at }] : [];
}).sort((a, b) => a.m.day - b.m.day);

/** Scroll given to each chapter, in viewport heights. */
const PER = 0.6;
const QUIZ_KEY = 'enbrioatlas:story-asmatu';

const REDUCED = '(prefers-reduced-motion: reduce)';
const subscribeReduced = (cb: () => void) => {
  const m = window.matchMedia(REDUCED);
  m.addEventListener('change', cb);
  return () => m.removeEventListener('change', cb);
};
const useReduced = () => useSyncExternalStore(subscribeReduced, () => window.matchMedia(REDUCED).matches, () => false);
const smooth = (v: number) => {
  const x = Math.min(1, Math.max(0, v));
  return x * x * (3 - 2 * x);
};

export function StoryScroll() {
  const reduced = useReduced();
  const box = useRef<HTMLElement>(null);
  const [pos, setPos] = useState({ i: 0, local: 0, p: 0 });
  const [quiz, setQuiz] = useState(false);
  const [shown, setShown] = useState<Set<number>>(() => new Set());
  const n = CHAPTERS.length;

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- read once from this browser
      if (localStorage.getItem(QUIZ_KEY) === '1') setQuiz(true);
    } catch {}
  }, []);

  // Scroll → chapter and progress inside it (only while the section is near the screen).
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let raf = 0;
    let near = false;
    const read = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const total = Math.max(1, r.height - window.innerHeight);
      const p = Math.min(1, Math.max(0, -r.top / total));
      const x = Math.min(n - 1e-4, p * n);
      const i = Math.floor(x);
      const local = Math.round((x - i) * 100) / 100;
      setPos((o) => (o.i === i && o.local === local ? o : { i, local, p }));
    };
    const onScroll = () => {
      if (near && !raf) raf = requestAnimationFrame(read);
    };
    const io = new IntersectionObserver(([e]) => {
      near = e.isIntersecting;
      if (near) onScroll();
    });
    io.observe(el);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [n]);

  const go = useCallback(
    (k: number) => {
      const el = box.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      const total = el.offsetHeight - window.innerHeight;
      window.scrollTo({ top: top + ((k + 0.05) / n) * total, behavior: reduced ? 'auto' : 'smooth' });
    },
    [n, reduced],
  );

  const toggleQuiz = () => {
    const next = !quiz;
    setQuiz(next);
    setShown(new Set());
    try {
      localStorage.setItem(QUIZ_KEY, next ? '1' : '0');
    } catch {}
  };

  const { m, at } = CHAPTERS[pos.i] ?? CHAPTERS[0];
  // The process plays through the first two thirds of the chapter's scroll, then holds on the moment.
  const grow = reduced ? 1 : smooth(pos.local / 0.66);
  const scene = useMemo<SimMoment>(() => ({ ...at, une: Math.max(0, at.une - 0.3 * (1 - grow)) }), [at, grow]);
  const [num, unit] = dayParts(m.day);
  const hidden = quiz && !shown.has(pos.i);
  const period = periodOf(m.day);

  if (!n) return null;
  return (
    <section ref={box} id="garapena" className="story" style={{ height: `calc(${n * PER * 100}vh + 100vh)` }} aria-labelledby="story-h">
      <div className="story-sticky" style={hueStyle(at.week)}>
        <header className="story-head">
          <p className="kicker">Garapena, egunez egun</p>
          <h2 id="story-h">Ernalkuntzatik fetu-arora, korritu ahala</h2>
          <button type="button" className={`story-quiz${quiz ? ' is-on' : ''}`} role="switch" aria-checked={quiz} onClick={toggleQuiz} title="Egunak ezkutatu: lehenik zeuk gogoratu, gero begiratu">
            <span className="story-quiz-track" aria-hidden>
              <span />
            </span>
            Asmatu eguna
          </button>
        </header>

        <div className="story-body">
          <figure className="story-figure theme-stage">
            <AgeScene at={scene} className="tl-scene story-scene" />
            <figcaption>
              <span>
                <b>{at.week}. gaia</b> · {at.stage.title}
              </span>
              <Link className="btn small primary" href={simHref(at)}>
                Ireki simulagailuan <span aria-hidden>→</span>
              </Link>
            </figcaption>
          </figure>

          <div className="story-text" key={pos.i}>
            <p className="story-period">{period.name}</p>
            {hidden ? (
              <button type="button" className="story-day is-hidden" onClick={() => setShown((s) => new Set(s).add(pos.i))} aria-label="Erakutsi eguna">
                ?<small>Zein egun? Sakatu ikusteko</small>
              </button>
            ) : (
              <p className="story-day">
                {num}
                <small>{unit}</small>
              </p>
            )}
            {!hidden && m.to && <p className="story-when">{whenOf(m)}</p>}
            <h3>{m.short}</h3>
            <p className="story-lead">{m.text}.</p>
            {m.makes && m.makes.length > 0 && (
              <ul className="story-makes" aria-label="Zer sortzen da">
                {m.makes.slice(0, 5).map((id) => (
                  <li key={id}>{nameOf(id)}</li>
                ))}
              </ul>
            )}
          </div>

          <nav className="story-rail" aria-label="Gako-datak">
            <span className="story-rail-fill" style={{ height: `${pos.p * 100}%` }} aria-hidden />
            {CHAPTERS.map((c, k) => {
              const newPeriod = k === 0 || periodOf(CHAPTERS[k - 1].m.day).id !== periodOf(c.m.day).id;
              return (
                <div key={c.m.short} className="story-rail-row">
                  {newPeriod && <span className="story-rail-period">{periodOf(c.m.day).short ?? periodOf(c.m.day).name}</span>}
                  <button type="button" style={hueStyle(c.at.week)} className={`story-rail-dot${k === pos.i ? ' is-on' : ''}${k < pos.i ? ' is-past' : ''}`} onClick={() => go(k)} aria-current={k === pos.i ? 'step' : undefined}>
                    <i aria-hidden />
                    <span>{c.m.short}</span>
                    <small>{quiz && !shown.has(k) && k >= pos.i ? '?' : dayParts(c.m.day).join('')}</small>
                  </button>
                </div>
              );
            })}
          </nav>
        </div>

        <p className="story-more">
          <span>
            {String(pos.i + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
          </span>
          <Link className="link-arrow" href={`/kronologia?eguna=${m.day}`}>
            Kronologia osoa <span aria-hidden>→</span>
          </Link>
        </p>
      </div>
    </section>
  );
}
