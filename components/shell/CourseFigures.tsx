'use client';

import { studyKey } from '@/lib/study/storage-scope';
import { useEffect, useState } from 'react';
import legacyPanels from '@/content/course-figure-panels-legacy.json';
import recentPanels from '@/content/course-figure-panels-recent.json';
import styles from './CourseFigures.module.css';

/** `file` is the image-name prefix when it is not the list position (topic-numbered figures). */
const documents: { title: string; pages: number; file?: string }[] = [
  { title: 'Hezur-sistema', pages: 4 },
  { title: 'Muskulu-sistema', pages: 3 },
  { title: 'Enbriologia · muskulu-sistema', pages: 2 },
  { title: 'Enbriologia · hezur-sistema', pages: 4 },
  { title: 'Enbriologia · gorputz-barrunbeak', pages: 4 },
  { title: 'Enbriologia · liseri-aparatua', pages: 8 },
  { title: 'Enbriologia · zirkulazio-sistema', pages: 13 },
  { title: 'Enbriologia · gernu-sistema', pages: 5, file: 'gernu-sistema' },
  { title: 'Enbriologia · sistema genitala', pages: 6, file: 'sistema-genitala' },
  { title: 'Enbriologia · burua eta lepoa (I)', pages: 11, file: '17' },
  { title: 'Enbriologia · burua eta lepoa (II)', pages: 22, file: '18' },
  { title: 'Enbriologia · burua eta lepoa (2026–27)', pages: 7, file: 'burua-lepoa-26-27' },
  { title: 'Enbriologia · nerbio-sistema (I)', pages: 6, file: 'nerbio-sistema-i' },
  { title: 'Enbriologia · nerbio-sistema (I), irudi osagarriak', pages: 4, file: 'nerbio-sistema-i-osagarriak' },
];
type Line = { text: string; x: number; y: number; w: number; h: number };
type Marks = Record<string, 1 | 2>;
const markKey = 'irudiak-pdf-marks-v1';
const panelsByPage: Record<string, number[][]> = { ...legacyPanels, ...recentPanels };
const fullPage = [[0, 0, 1, 1]];

function pageId(doc: number, page: number) {
  return `${documents[doc].file ?? doc + 1}-${page}`;
}

function panelsFor(id: string) {
  return panelsByPage[id] ?? fullPage;
}

const percent = (fraction: number) => `${fraction * 100}%`;

/** Join short, closely aligned OCR lines, such as “Hodi” / “neurala”. */
function groupLines(lines: Line[]): Line[] {
  const remaining = [...lines].sort((a, b) => a.y - b.y || a.x - b.x);
  const grouped: Line[] = [];
  while (remaining.length) {
    const first = remaining.shift()!;
    let result = { ...first };
    let last = first;
    for (let count = 1; count < 3 && result.text.length < 50; count++) {
      if (last.text.trim().split(/\s+/).length > 3) break;
      const index = remaining.findIndex(next => {
        const gap = next.y - (last.y + last.h);
        const height = Math.max(last.h, next.h);
        return gap >= 0 && gap <= height * 0.55 && Math.abs(next.x - last.x) <= 0.012 &&
          next.text.trim().split(/\s+/).length <= 3 && Math.abs(next.h - last.h) < height * 0.45;
      });
      if (index < 0) break;
      const next = remaining.splice(index, 1)[0];
      const x = Math.min(result.x, next.x);
      const right = Math.max(result.x + result.w, next.x + next.w);
      result = { text: `${result.text} ${next.text}`, x, y: result.y, w: right - x, h: next.y + next.h - result.y };
      last = next;
    }
    grouped.push(result);
  }
  return grouped;
}

/** The crop and the OCR hit areas share the source page's coordinates. */
function CourseFigure({ id, title, crop, marks, onMark }: {
  id: string;
  title: string;
  crop: number[];
  marks: Marks;
  onMark: (index: number) => void;
}) {
  const [lines, setLines] = useState<Line[]>([]);
  const [imageSize, setImageSize] = useState<[number, number] | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const src = `/irudiak-pdf/${id}.jpg`;
  useEffect(() => {
    const request = new AbortController();
    fetch(`${src}.json`, { signal: request.signal }).then(r => {
      if (!r.ok) throw new Error('unavailable');
      return r.json();
    }).then(data => {
      if (!request.signal.aborted && Array.isArray(data?.lines)) setLines(groupLines(data.lines));
    }).catch(() => { /* The illustration is still usable without OCR. */ });
    return () => request.abort();
  }, [src]);

  const [left, top, right, bottom] = crop;
  const width = right - left;
  const height = bottom - top;
  const ratio = imageSize ? (imageSize[0] * width) / (imageSize[1] * height) : 1.42 * width / height;
  if (failed) {
    return (
      <div className={styles.message}>
        <p role="status">Irudia ezin izan da kargatu.</p>
        <button type="button" className={styles.control} onClick={() => { setAttempt(value => value + 1); setFailed(false); }}>
          Saiatu berriro
        </button>
      </div>
    );
  }
  return (
    <div className={styles.stage}>
      <figure className={styles.figure} style={{ aspectRatio: ratio }} aria-busy={!imageSize}>
        {/* The original PDF raster contains both the illustration and the printed annotations. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={attempt ? `${src}?retry=${attempt}` : src}
          alt={title}
          draggable={false}
          style={{ width: percent(1 / width), left: percent(-left / width), top: percent(-top / height) }}
          onLoad={event => setImageSize([event.currentTarget.naturalWidth, event.currentTarget.naturalHeight])}
          onError={() => setFailed(true)}
        />
        {!imageSize && <span className={styles.loading} role="status">Irudia kargatzen…</span>}
        {imageSize && lines.map((line, index) => {
          const x = line.x + line.w / 2;
          const y = line.y + line.h / 2;
          if (x < left || x >= right || y < top || y >= bottom) return null;
          const x0 = Math.max(line.x, left);
          const y0 = Math.max(line.y, top);
          const mark = marks[`${id}-${index}`];
          return (
            <button
              type="button"
              key={index}
              className={styles.spot}
              data-mark={mark}
              aria-label={mark ? `${line.text} (${mark === 1 ? 'gorriz markatuta' : 'laranjaz markatuta'})` : line.text}
              aria-pressed={Boolean(mark)}
              style={{
                left: percent((x0 - left) / width),
                top: percent((y0 - top) / height),
                width: percent((Math.min(line.x + line.w, right) - x0) / width),
                height: percent((Math.min(line.y + line.h, bottom) - y0) / height),
              }}
              onClick={() => onMark(index)}
            />
          );
        })}
      </figure>
    </div>
  );
}

export function CourseFigures() {
  const [{ doc, page, panel }, setSelection] = useState({ doc: 0, page: 1, panel: 0 });
  const [marks, setMarks] = useState<Marks>(() => {
    try { return typeof window === 'undefined' ? {} : JSON.parse(localStorage.getItem(studyKey(markKey)) || '{}') ?? {}; } catch { return {}; }
  });
  const document = documents[doc];
  const id = pageId(doc, page);
  const panels = panelsFor(id);
  const first = page === 1 && panel === 0;
  const last = page === document.pages && panel === panels.length - 1;

  function step(direction: -1 | 1) {
    const nextPanel = panel + direction;
    if (nextPanel >= 0 && nextPanel < panels.length) {
      setSelection({ doc, page, panel: nextPanel });
      return;
    }
    const nextPage = page + direction;
    if (nextPage < 1 || nextPage > document.pages) return;
    setSelection({ doc, page: nextPage, panel: direction > 0 ? 0 : panelsFor(pageId(doc, nextPage)).length - 1 });
  }

  function mark(index: number) {
    const markId = `${id}-${index}`;
    setMarks(current => {
      const next = { ...current };
      if (!next[markId]) next[markId] = 1;
      else if (next[markId] === 1) next[markId] = 2;
      else delete next[markId];
      try { localStorage.setItem(studyKey(markKey), JSON.stringify(next)); } catch { /* storage unavailable */ }
      return next;
    });
  }
  return (
    <div className={styles.root}>
      <div className={styles.filters}>
        <label>
          Dokumentua
          <select className={styles.control} value={doc} onChange={event => setSelection({ doc: Number(event.target.value), page: 1, panel: 0 })}>
            {documents.map((item, index) => <option key={item.title} value={index}>{item.title}</option>)}
          </select>
        </label>
        <label>
          PDFko orria
          <select className={styles.control} value={page} onChange={event => setSelection({ doc, page: Number(event.target.value), panel: 0 })}>
            {Array.from({ length: document.pages }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}
          </select>
        </label>
      </div>
      <nav className={styles.paging} aria-label="PDFetako irudien nabigazioa">
        <button type="button" className={styles.control} disabled={first} onClick={() => step(-1)}>
          <span aria-hidden="true">←</span> Aurrekoa
        </button>
        <span className={styles.position} aria-live="polite" aria-atomic="true">{page}. orria · {panel + 1}/{panels.length} irudia</span>
        <button type="button" className={styles.control} disabled={last} onClick={() => step(1)}>
          Hurrengoa <span aria-hidden="true">→</span>
        </button>
      </nav>
      <CourseFigure
        key={id}
        id={id}
        title={`${document.title}, ${page}. orria, ${panel + 1}. irudia`}
        crop={panels[panel]}
        marks={marks}
        onMark={mark}
      />
      <p className={styles.note}>Sakatu automatikoki antzemandako izenak markatzeko: <strong>gorria → laranja → kendu</strong>. Markak gailu honetan gordetzen dira.</p>
    </div>
  );
}
