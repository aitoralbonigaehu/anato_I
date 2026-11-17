'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { dayKey } from '@/lib/study/activity';
import { useAccount } from '@/components/account/account';
import { useActivity } from '@/components/study/useActivity';
import { useAnswers } from '@/components/shell/answers';
import { Glyph } from './glyphs';

/**
 * The site bar's way to the progress page: the streak (a flame, lit once today is studied) and who is
 * signed in. Light on purpose: the page itself does the counting.
 */
export function ProgressKey({ current }: { current?: boolean }) {
  const activity = useActivity();
  const answers = useAnswers();
  const acc = useAccount();
  const [now, setNow] = useState(0);
  useEffect(() => {
    const raf = window.setTimeout(() => setNow(Date.now()));
    return () => window.clearTimeout(raf);
  }, []);

  const days = new Set(Object.entries(activity.days).filter(([, d]) => d.s > 0 || d.ok + d.bad > 0 || d.st > 0).map(([k]) => k));
  for (const a of Object.values(answers)) for (const [t] of a.hist ?? []) days.add(dayKey(t));
  let streak = 0;
  let today = false;
  if (now) {
    const d = new Date(now);
    today = days.has(dayKey(now));
    for (let i = today ? 0 : 1; days.has(dayKey(new Date(d.getFullYear(), d.getMonth(), d.getDate() - i, 12).getTime())); i++) streak++;
  }
  const name = acc.user?.name;

  return (
    <Link href="/aurrerapena" className={`progress-key${today ? ' is-lit' : ''}`} data-tour="aurrerapena" aria-current={current ? 'page' : undefined} aria-label={`Zure aurrerapena${streak ? `: ${streak} eguneko bolada` : ''}`} data-tip="Zure aurrerapena: zer ikusi duzun, txartelak, bolada eta lorpenak" data-tip-pos="bottom">
      <span className="progress-key-flame">
        <Glyph name="flame" size={15} />
      </span>
      <b>{streak}</b>
      <span className="progress-key-who">{name ? name[0].toUpperCase() : <Glyph name="seed" size={13} />}</span>
    </Link>
  );
}
