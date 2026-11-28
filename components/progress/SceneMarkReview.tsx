'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { getWeek, nameOf } from '@/content/registry';
import { useSceneMarks } from '@/lib/study/scene-marks';
import p from './aurrerapena.module.css';
import { topicNo } from '@/content/topic-no';

const SECTION = 'izenak-errepasatu';

export function SceneMarkReview() {
  const marks = useSceneMarks();
  const section = useRef<HTMLElement>(null);
  useEffect(() => {
    if (location.hash !== `#${SECTION}`) return;
    const frame = requestAnimationFrame(() => section.current?.scrollIntoView({ behavior: 'instant' }));
    return () => cancelAnimationFrame(frame);
  }, []);

  const items = Object.entries(marks)
    .filter(([, mark]) => mark.state !== null)
    .map(([key, mark]) => ({
      key,
      mark,
      // Previously saved names for these ducts may still contain the eponym.
      name: mark.id === 'hodi-mesonefrikoa' || mark.id === 'hodi-paramesonefrikoa' ? nameOf(mark.id) : mark.name,
    }))
    .sort((a, b) => (a.mark.state === b.mark.state ? a.name.localeCompare(b.name, 'eu') : a.mark.state === 'red' ? -1 : 1));

  return (
    <section ref={section} id={SECTION} className={`${p.section} ${p.sceneMarkReview}`} aria-labelledby="scene-mark-heading">
      <div className={p.sectionHead}>
        <h2 id="scene-mark-heading">Izenak errepasatu</h2>
        <small>Sakatu eszenako izena gorriz markatzeko, berriro laranjaz eta hirugarrenez marka kentzeko.</small>
      </div>
      {items.length ? (
        <ul className={p.sceneMarks}>
          {items.map(({ key, mark, name }) => {
            const week = getWeek(mark.week);
            const stage = week?.stages.find((s) => s.id === mark.stage);
            const view = stage?.views.find((v) => v.id === mark.view);
            const query = new URLSearchParams({ etapa: mark.stage, une: String(mark.t), izenak: '1' });
            if (view) query.set('ikuspegia', view.id);
            if (mark.taughtOnly !== undefined) query.set('ikasgaia', mark.taughtOnly ? '1' : '0');
            return (
              <li key={key}>
                <span className={p.sceneMarkState} data-mark={mark.state}>
                  {mark.state === 'red' ? 'Ez dakit' : 'Zalantzak ditut'}
                </span>
                <div>
                  {stage ? (
                    <Link href={`/astea/${mark.week}?${query}`} prefetch={false}>{name} <span aria-hidden>→</span></Link>
                  ) : <strong>{name}</strong>}
                  <small>{topicNo(mark.week)}. gaia · {stage?.title ?? 'Eszena ez dago erabilgarri'}</small>
                </div>
              </li>
            );
          })}
        </ul>
      ) : <p className={p.sceneMarkEmpty}>Oraindik ez duzu izenik markatu.</p>}
    </section>
  );
}
