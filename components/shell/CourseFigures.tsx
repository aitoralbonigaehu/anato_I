'use client';

import { useEffect, useMemo, useState } from 'react';
import type { BelItem, BelPlate } from '@/content/belortzioak';
import { Figure, type Marks as BelMarks } from './Belortzioak';
import styles from './CourseFigures.module.css';

/** `file` is the image-name prefix when it is not the list position (topic-numbered figures). */
const documents: { title: string; pages: number; file?: number }[] = [
  { title: 'Hezur-sistema', pages: 4 },
  { title: 'Muskulu-sistema', pages: 3 },
  { title: 'Enbriologia · muskulu-sistema', pages: 2 },
  { title: 'Enbriologia · hezur-sistema', pages: 4 },
  { title: 'Enbriologia · gorputz-barrunbeak', pages: 4 },
  { title: 'Enbriologia · liseri-aparatua', pages: 8 },
  { title: 'Enbriologia · zirkulazio-sistema', pages: 13 },
  { title: 'Enbriologia · burua eta lepoa (I)', pages: 11, file: 17 },
  { title: 'Enbriologia · burua eta lepoa (II)', pages: 22, file: 18 },
];
type Line = { text: string; x: number; y: number; w: number; h: number };
type Marks = Record<string, 1 | 2>;
const key = 'irudiak-pdf-marks-v1';

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

export function CourseFigures() {
  const [doc, setDoc] = useState(0);
  const [page, setPage] = useState(1);
  const [pageLines, setPageLines] = useState<{ id: string; lines: Line[] }>({ id: '', lines: [] });
  const [marks, setMarks] = useState<Marks>(() => {
    try { return typeof window === 'undefined' ? {} : JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; }
  });
  const [available, setAvailable] = useState(true);
  const id = `${documents[doc].file ?? doc + 1}-${page}`;
  const [size, setSize] = useState<{ id: string; wh: [number, number] } | null>(null);
  const [active, setActive] = useState<string | null>(null);

  // The drawing's own size, so the Belortzioak stage keeps its aspect ratio.
  useEffect(() => {
    const img = new Image();
    img.onload = () => setSize({ id, wh: [img.naturalWidth || 1, img.naturalHeight || 1] });
    img.src = `/irudiak-pdf/${id}.jpg`;
  }, [id]);

  const lines = useMemo(() => (pageLines.id === id ? pageLines.lines : []), [pageLines, id]);
  // Each detected name becomes a Belortzioak item: its name in a side column, a leader to where it sits on the drawing.
  const plate = useMemo<BelPlate | null>(() => {
    if (!size || size.id !== id) return null;
    const items: BelItem[] = lines.map((l, i) => {
      const c: [number, number] = [l.x + l.w / 2, l.y + l.h / 2];
      return { key: `${id}:${i}`, n: i + 1, tag: String(i + 1), name: l.text, label: c, targets: [c], marks: [], arrow: true, r: [Math.max(0.03, l.w / 2)] };
    });
    return { id: `pdf-${id}`, system: 'fusio', title: `${documents[doc].title}, ${page}. orria`, sub: '', size: size.wh, items };
  }, [size, id, lines, doc, page]);
  const belMarks = useMemo<BelMarks>(() => Object.fromEntries(lines.flatMap((_, i) => (marks[`${id}-${i}`] ? [[`${id}:${i}`, marks[`${id}-${i}`]]] : []))), [lines, marks, id]);
  const pick = (key: string) => mark(Number(key.split(':')[1]));

  useEffect(() => {
    let active = true;
    fetch(`/irudiak-pdf/${id}.jpg.json`).then(r => {
      if (!r.ok) throw new Error('unavailable');
      return r.json();
    }).then(data => { if (active) { setPageLines({ id, lines: Array.isArray(data.lines) ? groupLines(data.lines) : [] }); setAvailable(true); } })
      .catch(() => { if (active) { setPageLines({ id, lines: [] }); setAvailable(false); } });
    return () => { active = false; };
  }, [id]);
  function mark(index: number) {
    const markId = `${id}-${index}`;
    setMarks(current => {
      const next = { ...current };
      if (!next[markId]) next[markId] = 1;
      else if (next[markId] === 1) next[markId] = 2;
      else delete next[markId];
      try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* storage unavailable */ }
      return next;
    });
  }
  return <div className={styles.root}>
    <p>Irudia geziekin eta izenekin, Belortzioak bezala. Izenak sakatu: <strong>gorria → laranja → kendu</strong>. Markak gailu honetan gordetzen dira.</p>
    <p className={styles.note}>Testua automatikoki detektatu da; baliteke izen batzuk ez antzematea.</p>
    <label htmlFor="figure-doc">Dokumentua</label>{' '}
    <select id="figure-doc" value={doc} onChange={e => { setDoc(Number(e.target.value)); setPage(1); }}>
      {documents.map((d, i) => <option key={d.title} value={i}>{d.title}</option>)}
    </select>
    <div className={styles.paging}>
      <button type="button" disabled={page === 1} onClick={() => setPage(page - 1)}>← Aurrekoa</button>
      <span>{page} / {documents[doc].pages}</span>
      <button type="button" disabled={page === documents[doc].pages} onClick={() => setPage(page + 1)}>Hurrengoa →</button>
    </div>
    {available ? <div className={styles.figure}>
      {plate ? <Figure plate={plate} src={`/irudiak-pdf/${id}.jpg`} mode="esploratu" numbers={false} covered={() => false} active={active} onHover={setActive} onPick={pick} marks={belMarks} onMark={pick} asked={null} answered={false} tap={null} onTap={() => {}} missing={false} /> : <p>Kargatzen…</p>}
    </div> : <p>Irudia ezin izan da kargatu. Saiatu berriro.</p>}
  </div>;
}
