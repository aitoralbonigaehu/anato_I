'use client';

import { useEffect, useRef } from 'react';
import { BEL_ITEMS, BEL_SYSTEMS, type BelItem, type BelPlate } from '@/content/belortzioak';
import type { StudyRef, StudySession } from '@/lib/belortzioakCards';
import c from './bel-study.module.css';

interface Props {
  study: StudySession;
  /** The card asked now; null once the session is over. */
  item: BelItem | null;
  plate: BelPlate;
  onFlip: () => void;
  onAnswer: (knew: boolean) => void;
  onExit: () => void;
  /** A new session: the misses only, or (no argument) what is due next. */
  onAgain: (only?: StudyRef[]) => void;
  /** The mixed review (Zer da? + Non dago?) across every figure. */
  onMixed: () => void;
  onOpen: (key: string) => void;
}

const find = (key: string) => BEL_ITEMS.find((x) => x.item.key === key);

/**
 * Ikasketa modua: one card per arrow. The front asks, the back names the structure (and lights it on
 * the figure); the student says whether they knew it. A miss comes back a few cards later.
 */
export function StudyCard({ study, item, plate, onFlip, onAnswer, onExit, onAgain, onMixed, onOpen }: Props) {
  const done = study.seen.length;
  const pct = study.total ? Math.round((100 * (study.right + study.wrong)) / study.total) : 100;
  const missedKeys = Object.keys(study.misses);
  const again = !!item && study.seen.includes(item.key);
  const system = BEL_SYSTEMS.find((x) => x.id === plate.system)?.short ?? 'Fusionatua';
  const frontKey = useRef<HTMLButtonElement>(null);
  const backKey = useRef<HTMLButtonElement>(null);
  // Focus follows the card: the turn key on the front, "Banekien" on the back (Enter answers too).
  useEffect(() => {
    (study.flipped ? backKey : frontKey).current?.focus({ preventScroll: true });
  }, [study.flipped, item?.key]);

  if (!study.total)
    return (
      <div className={c.empty}>
        <span className={c.emptyIcon} aria-hidden>
          ✓
        </span>
        <h3>Gaur ez dago errepasatzeko ezer</h3>
        <p className="muted">Sistema hauetako txartel guztiak ikasita daude, eta errepasoa ez da oraindik iritsi. Aukeratu beste sistema bat, edo egin proba nahasia.</p>
        <div className="lab-actions">
          <button className="btn small" onClick={onMixed}>
            Proba nahasia
          </button>
          <button className="btn small ghost" onClick={onExit}>
            Irten
          </button>
        </div>
      </div>
    );

  if (!item)
    return (
      <div className={c.done}>
        <div className={c.score} style={{ ['--p' as string]: `${(100 * study.right) / Math.max(1, study.total)}%` }}>
          <b>{study.right}</b>
          <small>/{study.total}</small>
        </div>
        <p className={c.doneLead}>
          {study.wrong === 0 ? 'Dena lehen saiakeran. Bikain!' : study.right >= study.total * 0.7 ? 'Oso ondo. Huts egindakoak laster itzuliko dira.' : 'Lan ona: huts egindakoak lehenago itzuliko dira.'}
        </p>
        {missedKeys.length > 0 && (
          <>
            <p className="muted">Huts egindakoak:</p>
            <ul className={c.missed}>
              {missedKeys.map((k) => {
                const x = find(k);
                if (!x) return null;
                return (
                  <li key={k}>
                    <button onClick={() => onOpen(k)} title="Ireki irudian">
                      <span className="num-chip">{x.item.tag}</span> {x.item.name} <small>· {x.plate.title}</small>
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
        <div className="lab-actions">
          {missedKeys.length > 0 && (
            <button className="btn small" onClick={() => onAgain(missedKeys.flatMap((k) => (find(k) ? [{ plate: find(k)!.plate.id, key: k }] : [])))}>
              Hutsak berriz
            </button>
          )}
          <button className="btn primary small" onClick={() => onAgain()} autoFocus>
            Beste saio bat
          </button>
          <button className="btn small ghost" onClick={onExit}>
            Irten
          </button>
        </div>
      </div>
    );

  return (
    <div className={c.root}>
      <div className={c.head}>
        <span className={c.count}>
          {Math.min(done + (again ? 0 : 1), study.total)} / {study.total}
        </span>
        <span className={c.tally}>
          <span className={c.ok} title="Lehen saiakeran asmatuak">
            ✓ {study.right}
          </span>
          <span className={c.bad} title="Lehen saiakeran huts">
            ✗ {study.wrong}
          </span>
        </span>
        <button className="btn small ghost" onClick={onExit} title="Irten (Esc)">
          Irten
        </button>
      </div>
      <div className={c.bar} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Saioaren aurrerapena">
        <i style={{ width: `${pct}%` }} />
      </div>

      <div className={`${c.card}${study.flipped ? ` ${c.isFlipped}` : ''}`}>
        <div className={c.inner}>
          <div className={`${c.face} ${c.front}`} inert={study.flipped}>
            <small className={c.where}>
              {system} · {plate.title}
            </small>
            {again && <span className={c.againTag}>Berriz</span>}
            <h3>Zer seinalatzen du geziak?</h3>
            <p className="muted">Pentsatu izena, eta eman buelta txartelari.</p>
            <button ref={frontKey} className="btn primary" onClick={onFlip}>
              Buelta eman <kbd>Zuriunea</kbd>
            </button>
          </div>
          <div className={`${c.face} ${c.back}`} inert={!study.flipped}>
            <small className={c.where}>{item.group ?? system}</small>
            <h3 className={c.name}>{item.name}</h3>
            <p className="muted">Asmatu duzu?</p>
            <div className={c.verdict}>
              <button ref={backKey} className={c.yes} onClick={() => onAnswer(true)}>
                <span aria-hidden>✓</span> Banekien <kbd>1</kbd>
              </button>
              <button className={c.no} onClick={() => onAnswer(false)}>
                <span aria-hidden>✗</span> Ez nekien <kbd>2</kbd>
              </button>
            </div>
          </div>
        </div>
      </div>
      <p className="lab-keys">Teklak: zuriunea buelta · 1 banekien · 2 ez nekien · Esc irten</p>
    </div>
  );
}
