'use client';

import { studyKey } from '@/lib/study/storage-scope';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { LEARNING_MAPS } from '@/content/eratorriak/learning-maps';
import { taughtMap } from '@/content/eratorriak/taught';
import type { Flow } from '@/content/migrations';
import { buildReviewCards, gradeReview, parseReviewProgress, selectReviewCards, STORAGE_KEY, type ReviewProgress } from '@/lib/learning/scheme-review';
import { noteRecall } from '@/lib/study/activity';
import styles from './LearningMaps.module.css';

interface Props {
  week: number;
  renderScheme: (flow: Flow) => ReactNode;
  renderDetail: (flow: Flow) => ReactNode;
  resolveName: (id: string) => string;
  /** "Aurten emandakoa": maps, details and practice cards without the notes' blue text. */
  taughtOnly?: boolean;
}

export function LearningMaps({ week, renderScheme, renderDetail, resolveName, taughtOnly = false }: Props) {
  const [view, setView] = useState<'learn' | 'practice'>('learn');
  const [filter, setFilter] = useState<'all' | 'due' | 'mistakes'>('due');
  const [direction, setDirection] = useState<'both' | 'forward' | 'reverse'>('both');
  const [progress, setProgress] = useState<ReviewProgress>({});
  const [ready, setReady] = useState(false);
  const [storageOk, setStorageOk] = useState(true);
  const [revealedId, setRevealedId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [now, setNow] = useState(0);
  const [session, setSession] = useState<Set<string>>(new Set());
  const maps = useMemo(
    () => LEARNING_MAPS.filter((map) => map.week === week).map((map) => (taughtOnly ? taughtMap(map) : map)).filter((map) => map.roots.length),
    [week, taughtOnly],
  );
  const cards = useMemo(() => buildReviewCards(maps, resolveName), [maps, resolveName]);

  useEffect(() => {
    const hydrate = window.setTimeout(() => {
      try { setProgress(parseReviewProgress(localStorage.getItem(studyKey(STORAGE_KEY)))); }
      catch { setStorageOk(false); }
      setNow(Date.now());
      setReady(true);
    }, 0);
    const timer = window.setInterval(() => setNow(Date.now()), 60000);
    // Another tab, or the account sync, rewrote the stored cards: show them.
    const onStorage = (e: StorageEvent) => {
      if (e.key !== null && e.key !== studyKey(STORAGE_KEY)) return;
      try { setProgress(parseReviewProgress(localStorage.getItem(studyKey(STORAGE_KEY)))); } catch {}
    };
    window.addEventListener('storage', onStorage);
    return () => { window.clearTimeout(hydrate); window.clearInterval(timer); window.removeEventListener('storage', onStorage); };
  }, []);


  const eligible = selectReviewCards(cards, progress, filter, now).filter((card) => direction === 'both' || card.direction === direction);
  const queue = eligible.filter((card) => !session.has(card.id) || (progress[card.id] && progress[card.id].due <= now));
  if (!activeId && queue[0]) setActiveId(queue[0].id);
  const card = cards.find((item) => item.id === activeId) ?? queue[0];
  const revealed = !!card && revealedId === card.id;
  const reset = () => { setRevealedId(null); setActiveId(null); setSession(new Set()); setNow(Date.now()); };
  const grade = (known: boolean) => {
    if (!card || !revealed) return;
    const next = gradeReview(progress, card.id, known, Date.now());
    noteRecall(known);
    setProgress(next);
    try { localStorage.setItem(studyKey(STORAGE_KEY), JSON.stringify(next)); }
    catch { setStorageOk(false); }
    setNow(Date.now());
    setSession((current) => new Set(current).add(card.id));
    setRevealedId(null); setActiveId(null);
  };

  return <section className={styles.root} aria-label="Ikasteko ibilbidea">
    <div className={styles.toolbar}>
      <div className={styles.switch} role="group" aria-label="Ikasteko modua">
        <button type="button" aria-pressed={view === 'learn'} onClick={() => setView('learn')}>Ikasi</button>
        <button type="button" aria-pressed={view === 'practice'} onClick={() => { setView('practice'); reset(); }}>Landu</button>
      </div>
      <p>{maps.length} mapa nagusi · {maps.reduce((sum, map) => sum + map.flowIds.length, 0)} eskemaren edukia</p>
    </div>
    {view === 'learn' ? <>
      <p className={styles.intro}>{week >= 15
        ? 'Hasi ezkerreko egituratik eta jarraitu geziei. Geziaren gainean ageri da egituren arteko lotura.'
        : 'Hasi mapa nagusitik. Zabaldu xehetasunak urratsak eta salbuespenak lotzeko; gero landu bi noranzkoetan.'}</p>
      {maps.map((map, index) => <details className={styles.map} key={map.id} id={`mapa-${map.id}`} name={`learning-${week}`} open={index === 0}>
        <summary className={styles.mapTitle}><span>{String(index + 1).padStart(2, '0')}</span><h3>{map.title}</h3></summary>
        {map.details.some((d) => d.lead) && <ul className={styles.leads}>{map.details.filter((d) => d.lead).map((d) => <li key={d.id}>{d.lead}</li>)}</ul>}
        {renderScheme({ id: map.id, title: map.title, stage: map.details[0]?.stage ?? '', roots: map.roots })}
        {map.details.some((d) => d.pitfalls?.length) && <aside className={styles.kontuz} aria-label="Kontuz">
          <b>Kontuz</b>
          <ul>{map.details.flatMap((d) => (d.pitfalls ?? []).map((t) => <li key={`${d.id}-${t}`}>{t}</li>))}</ul>
        </aside>}
        <details className={styles.details}>
          <summary>Xehetasunak eta urratsak · {map.details.length}</summary>
          <div>{map.details.map((detail) => <div key={detail.id}>{renderDetail(detail)}</div>)}</div>
        </details>
      </details>)}
    </> : <div className={styles.practice}>
      <div className={styles.controls}>
        <label>Noranzkoa<select value={direction} onChange={(event) => { setDirection(event.target.value as typeof direction); reset(); }}><option value="both">Bi noranzkoak</option><option value="forward">Aurrera</option><option value="reverse">Atzera</option></select></label>
        <label>Errepasoa<select value={filter} onChange={(event) => { setFilter(event.target.value as typeof filter); reset(); }}><option value="due">Gaurkoak eta berriak</option><option value="mistakes">Huts egindakoak</option><option value="all">Guztiak</option></select></label>
      </div>
      {!storageOk && <p role="status">Aurrerapena saio honetan bakarrik gordeko da.</p>}
      {!ready ? <p role="status">Errepasoa prestatzen…</p> : card ? <>
        <p className={styles.meta}>{session.size} landuta · {queue.length} geratzen dira · {card.direction === 'forward' ? 'Aurrera' : 'Atzera'}</p>
        <div className={styles.question} key={card.id}>
          <h3>{card.prompt}</h3>
          {card.context && <p>{card.context}</p>}
          {revealed ? <div className={styles.answer} aria-live="polite">{card.answer}</div> : <button className={styles.reveal} type="button" onClick={() => setRevealedId(card.id)}>Erakutsi erantzuna</button>}
          {revealed && <div className={styles.grades}><button type="button" onClick={() => grade(false)}>Berrikusi</button><button type="button" onClick={() => grade(true)}>Badakit</button></div>}
        </div>
        <p className={styles.intro}>Erantzun zure hitzekin erakutsi aurretik. «Badakit» aukeratzean, harremana eta haren ñabardurak azaldu behar dituzu.</p>
      </> : <div className={styles.empty} role="status"><h3>{session.size ? 'Saio honetako txanda amaituta' : 'Ez dago txartelik hautaketa honetan'}</h3><p>Hurrengo errepasoak berriz agertuko dira dagokienean. Hautatu «Guztiak» nahi duzunean lantzen jarraitzeko.</p><button type="button" onClick={() => { setFilter('all'); reset(); }}>Guztiak landu</button></div>}
    </div>}
  </section>;
}
