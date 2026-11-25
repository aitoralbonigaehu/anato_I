'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ARCH_DRILL_17,
  ARCH_FAMILIES,
  ARCH_ORDER,
  CARDS17,
  CARDS17_TAGS,
  type ArchId,
} from '@/content/eratorriak/cards17';
import { Flashcards } from './kit/Flashcards';
import styles from './eratorriak.module.css';
import local from './Topic17.module.css';

function shuffle<T>(list: readonly T[]): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function ArchFamilyStrip({ arches, compact = false }: { arches: ArchId[]; compact?: boolean }) {
  return (
    <div className={`${local.familyList}${compact ? ` ${local.familyCompact}` : ''}`}>
      {arches.map((arch) => {
        const fam = ARCH_FAMILIES[arch];
        return (
          <div key={arch} className={local.familyCard}>
            <div className={local.familyHead}>
              <strong>{fam.label}</strong>
              <span>{fam.level}</span>
            </div>
            <div className={local.familyRows}>
              <span>
                <b>Kartilagoa / hezurrak:</b> {fam.cartilage}
              </span>
              <span>
                <b>Nerbioa:</b> {fam.nerve}
              </span>
              <span>
                <b>Muskuluak:</b> {fam.muscles}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ArchClassifier() {
  const [filter, setFilter] = useState<'all' | 'traps'>('all');
  const pool = useMemo(
    () => (filter === 'traps' ? ARCH_DRILL_17.filter((item) => item.trap) : ARCH_DRILL_17),
    [filter],
  );
  const [queue, setQueue] = useState<string[]>(() => ARCH_DRILL_17.map((item) => item.id));
  const [picked, setPicked] = useState<ArchId | null>(null);
  const [hits, setHits] = useState(0);
  const [tries, setTries] = useState(0);
  const [streak, setStreak] = useState(0);

  const reset = useCallback((nextFilter: 'all' | 'traps') => {
    const nextPool = nextFilter === 'traps' ? ARCH_DRILL_17.filter((item) => item.trap) : ARCH_DRILL_17;
    setFilter(nextFilter);
    setQueue(shuffle(nextPool).map((item) => item.id));
    setPicked(null);
    setHits(0);
    setTries(0);
    setStreak(0);
  }, []);

  const current = ARCH_DRILL_17.find((item) => item.id === queue[0]) ?? null;
  const correct = current && picked ? picked === current.arch : null;

  const choose = useCallback(
    (arch: ArchId) => {
      if (!current || picked) return;
      setPicked(arch);
      setTries((t) => t + 1);
      if (arch === current.arch) {
        setHits((h) => h + 1);
        setStreak((s) => s + 1);
      } else {
        setStreak(0);
      }
    },
    [current, picked],
  );

  const next = useCallback(() => {
    if (!current || !picked) return;
    const wasCorrect = picked === current.arch;
    setQueue((q) => {
      const rest = q.slice(1);
      if (wasCorrect) return rest;
      const at = Math.min(3, rest.length);
      return [...rest.slice(0, at), current.id, ...rest.slice(at)];
    });
    setPicked(null);
  }, [current, picked]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.closest('input, textarea, select') || target.isContentEditable)) return;
      if (!document.activeElement?.closest(`.${local.drill}`)) return;
      if (!picked && e.key >= '1' && e.key <= '5') {
        e.preventDefault();
        choose(ARCH_ORDER[Number(e.key) - 1]);
      } else if (picked && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [choose, next, picked]);

  const trapCount = useMemo(() => ARCH_DRILL_17.filter((item) => item.trap).length, []);

  return (
    <div className={local.drill} tabIndex={-1}>
      <div className={local.drillTop}>
        <div className={styles.cardTags} role="tablist" aria-label="Galdera motak">
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'all'}
            className={filter === 'all' ? styles.on : ''}
            onClick={() => reset('all')}
          >
            Dena <small>{ARCH_DRILL_17.length}</small>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'traps'}
            className={filter === 'traps' ? styles.on : ''}
            onClick={() => reset('traps')}
          >
            Nahasketa klasikoak <small>{trapCount}</small>
          </button>
        </div>
        <div className={local.stats}>
          <span>
            Falta: <b>{queue.length}</b> / {pool.length}
          </span>
          <span>
            Asmatuta: <b>{hits}</b> / {tries}
          </span>
          <span>
            Segida: <b>{streak}</b>
          </span>
        </div>
      </div>

      {current ? (
        <>
          <div className={local.prompt}>
            <span className={local.kind}>{current.kind}</span>
            <p className={local.item}>{current.item}</p>
          </div>

          <div className={local.choices} role="group" aria-label="Aukeratu arkua">
            {ARCH_ORDER.map((arch, idx) => {
              const isRight = picked !== null && arch === current.arch;
              const isWrong = picked === arch && arch !== current.arch;
              return (
                <button
                  key={arch}
                  type="button"
                  disabled={picked !== null}
                  className={`${local.choice}${isRight ? ` ${local.choiceOk}` : ''}${isWrong ? ` ${local.choiceBad}` : ''}`}
                  onClick={() => choose(arch)}
                >
                  <span>{arch}. arkua</span>
                  <small>{idx + 1}</small>
                </button>
              );
            })}
          </div>

          {picked && (
            <div className={`${local.feedback} ${correct ? local.feedbackOk : local.feedbackBad}`}>
              <div className={local.verdict}>
                <b className={correct ? local.verdictOk : local.verdictBad}>
                  {correct ? `Zuzen · ${current.arch}. arkua` : `Ez: ${current.arch}. arkua da (ez ${picked}.a)`}
                </b>
                <button type="button" className={styles.btn} onClick={next}>
                  Hurrengoa <kbd>↵</kbd>
                </button>
              </div>
              {current.contrast && <p className={local.contrast}>{current.contrast}</p>}
              <ArchFamilyStrip arches={[current.arch]} />
            </div>
          )}
        </>
      ) : (
        <div className={local.doneBox}>
          <b>Saioa osatuta</b>
          <p>
            {hits} / {tries} saiakeratan asmatuta. Huts egindakoak berriro agertu zaizkizu finkatzeko.
          </p>
          <button type="button" className={styles.btn} onClick={() => reset(filter)}>
            Berriro nahastu
          </button>
        </div>
      )}
    </div>
  );
}

/** Topic 17 study room: focused on locking in arch relationships (1-click classifier + relationship Anki). */
export function Topic17Study() {
  return (
    <section className={styles.room} id="a17-ikasgela" aria-labelledby="a17-title">
      <header className={styles.roomHead}>
        <p className={styles.eyebrow}>17. gaia · faringe-arkuak eta eratorriak</p>
        <h2 id="a17-title">Burua eta lepoa I: arkuen loturak ikasi</h2>
        <p className={styles.lead}>
          Arku bakoitza <b>pakete bakar</b> gisa gogoratzeko (kartilagoa ↔ nerbioa ↔ muskuluak): lehenengo sailkatu azkar{' '}
          <b>I · II · III · IV · VI</b> artean, eta gero finkatu <b>Anki kutxekin</b> (aurten emandakoa bakarrik).
        </p>
        <nav className={styles.subnav} aria-label="17. gaia atalak">
          <a href="#a17-lotu">
            <span>1</span>Zein arkutakoa da?
          </a>
          <a href="#a17-fitxak">
            <span>2</span>Anki fitxak
          </a>
        </nav>
      </header>

      <section className={styles.block} id="a17-lotu">
        <h3 className={styles.h3}>
          <b>1</b> Zein arkutakoa da?
        </h3>
        <p className={styles.lead}>
          Sakatu arkua klik bakarrean (edo <b>1–5</b> teklak). Erantzun bakoitzean arku horren familia osoa ikusiko duzu, eta huts
          egindakoak 3 galdera geroago itzuliko dira.
        </p>
        <ArchClassifier />
      </section>

      <section className={styles.block} id="a17-fitxak">
        <h3 className={styles.h3}>
          <b>2</b> Anki fitxak: loturak eta kontrasteak
        </h3>
        <p className={styles.lead}>
          Pista bakar batetik arku osoa berreraiki, eta bikote nahasgarriak (digastrikoa, hioidea, belarriko hezurtxoak, tiroidea,
          ertzatzaileak) aurrez aurre bereizi. <b>Zuriunea</b> biratzeko, <b>1</b> (ez nekien) / <b>2</b> (banekien).
        </p>
        <Flashcards
          cards={CARDS17}
          storeKey="enbrio-cards-17-v1"
          tags={CARDS17_TAGS}
          renderFigure={(card) => {
            const arches = (card.keys ?? []).filter((k): k is ArchId => k in ARCH_FAMILIES);
            return arches.length ? <ArchFamilyStrip arches={arches} compact /> : null;
          }}
        />
      </section>
    </section>
  );
}
