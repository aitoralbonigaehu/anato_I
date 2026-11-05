'use client';

import { useEffect, useState } from 'react';
import { fetchTopicProgress, type TopicProgress } from '@/lib/progress';

function duration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return h > 0 ? `${h} h ${m} min` : `${m} min`;
}

function Bar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      style={{ height: 8, borderRadius: 4, background: 'rgba(127,127,127,0.2)', overflow: 'hidden', minWidth: 80 }}
    >
      <div style={{ width: `${pct}%`, height: '100%', background: 'currentColor', opacity: 0.75 }} />
    </div>
  );
}

/** Hidden study-progress table (time studied and % correct per topic). Not linked from anywhere yet. */
export function ProgressPanel({ initial }: { initial?: TopicProgress[] }) {
  const [rows, setRows] = useState<TopicProgress[] | null>(initial ?? null);

  useEffect(() => {
    let alive = true;
    fetchTopicProgress().then((r) => {
      if (alive) setRows(r);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (rows === null) return <p>Kargatzen…</p>;
  if (rows.length === 0) return <p>Oraindik ez dago aurrerapen-daturik.</p>;

  const maxSeconds = Math.max(...rows.map((r) => r.totalSeconds), 1);

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ textAlign: 'left' }}>Gaia</th>
          <th style={{ textAlign: 'left' }}>Ikasitako denbora</th>
          <th style={{ textAlign: 'left' }}>Asmatuak</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.topic}>
            <td style={{ padding: '6px 8px 6px 0' }}>{r.topic}. gaia</td>
            <td style={{ padding: '6px 8px' }}>
              <div>{duration(r.totalSeconds)}</div>
              <Bar value={r.totalSeconds} max={maxSeconds} label={`${r.topic}. gaia: ikasitako denbora`} />
            </td>
            <td style={{ padding: '6px 8px' }}>
              <div>
                {r.percentCorrect === null ? '—' : `${Math.round(r.percentCorrect)} %`}{' '}
                <small>
                  ({r.correctCount}/{r.answersCount})
                </small>
              </div>
              <Bar value={r.percentCorrect ?? 0} max={100} label={`${r.topic}. gaia: asmatutakoen ehunekoa`} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
