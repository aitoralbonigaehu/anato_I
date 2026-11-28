'use client';
import { useEffect, useRef, useState } from 'react';
import { KimuFace } from '@/components/kimu/KimuFace';
import type { KimuReply } from '@/lib/kimu/types';
import s from './journey.module.css';
import { topicNo } from '@/content/topic-no';

const questions = ['Non kokatzen dira somitak?', 'Non dago bihotz-goragunea?', 'Zer dira arku faringeoak?'];
export function KimuTrial({
  focus,
  onFocus,
  live,
  visit,
}: {
  focus: number;
  onFocus: (id: number) => void;
  live: boolean;
  visit: (url: string) => void;
}) {
  const [index, setIndex] = useState<number | null>(null),
    [answer, setAnswer] = useState<KimuReply | null>(null);
  const [error, setError] = useState(false),
    request = useRef(0);
  useEffect(
    () => () => {
      request.current++;
    },
    [],
  );
  async function ask(i: number) {
    const id = ++request.current;
    onFocus(0);
    setIndex(i);
    setAnswer(null);
    setError(false);
    try {
      const { askKimu } = await import('@/lib/kimu/engine');
      const result = await askKimu(questions[i], [], null, { offlineOnly: true });
      if (request.current === id) setAnswer(result);
    } catch {
      if (request.current === id) setError(true);
    }
  }
  const place = answer?.targets[0];
  return (
    <div className={s.chat}>
      <div className={s.kimuHead}>
        <span className={s.face} data-camera-target={focus ? undefined : true}>
          <KimuFace size={59} mood={answer ? 'happy' : index === null ? 'curious' : 'thinking'} still />
        </span>
        <div>
          <b>Kimu</b>
          <small>5. asteko enbrioia</small>
        </div>
      </div>
      {focus > 0 && (
        <div
          className={s.inspection}
          data-camera-target
          role="img"
          aria-label={['', 'Somitak', 'Bihotz-goragunea', 'Arku faringeoak'][focus]}
        />
      )}
      <div className={s.chatBody}>
        {index === null ? (
          <>
            <span className={s.chatLabel}>PROBATU GALDERA BAT</span>
            {questions.map((q, i) => (
              <button key={q} className={s.question} onClick={() => void ask(i)}>
                {q} <span>↗</span>
              </button>
            ))}
          </>
        ) : (
          <div className={s.exchange}>
            <p className={s.asked}>{questions[index]}</p>
            <p className={s.answer} role="status">
              {answer
                ? answer.reply.replace(/\*\*/g, '')
                : error
                  ? 'Ezin izan da erantzuna kargatu.'
                  : 'Apunteetan bilatzen…'}
            </p>
            {answer?.sources[0] && <small>{answer.sources[0].ref}</small>}
            {answer && live && !focus && (
              <button className={s.citation} onClick={() => onFocus(index + 1)}>
                Erakutsi enbrioian ↗
              </button>
            )}
            {place && (
              <button
                className={s.citation}
                onClick={() => {
                  const params = new URLSearchParams({ etapa: place.stage, une: String(place.at) });
                  if (place.structure) params.set('egitura', place.structure);
                  visit('/astea/' + place.week + '?' + params);
                }}
              >
                Ireki {topicNo(place.week)}. gaia ↗
              </button>
            )}
            <button
              className={s.again}
              onClick={() => {
                request.current++;
                onFocus(0);
                setIndex(null);
                setAnswer(null);
              }}
            >
              Beste galdera bat
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
