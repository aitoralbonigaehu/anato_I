'use client';

import { useEffect, useState } from 'react';
import type { PoolQuestion } from '@/content/pool';

/** What the counting pages read from a question: no wording, only who it is and its answer. */
export type BankQuestion = Pick<PoolQuestion, 'id' | 'week' | 'comp' | 'concept' | 'options' | 'answer'>;
export type Bank = { POOL: BankQuestion[]; KEY_IDS: Map<string, string[]> };

let bank: Bank | null = null;
let loading: Promise<Bank> | null = null;

/** Built on the page itself: only where a worker cannot start (tests, very old browsers). */
const here = () => import('@/content/pool').then((m): Bank => ({ POOL: m.POOL, KEY_IDS: m.KEY_IDS }));

/**
 * The question bank, built once in a worker: building it is about a second of work, and on the page it
 * froze Home, Progress and the structure atlas while they opened (and every animation with them).
 */
export const loadBank = () =>
  (loading ??= new Promise<Bank>((resolve) => {
    let w: Worker;
    try {
      w = new Worker(new URL('../../content/bank.worker.ts', import.meta.url), { type: 'module' });
    } catch {
      resolve(here());
      return;
    }
    w.onmessage = (e: MessageEvent<{ pool: BankQuestion[]; keyIds: Map<string, string[]> }>) => {
      w.terminate();
      resolve({ POOL: e.data.pool, KEY_IDS: e.data.keyIds });
    };
    w.onerror = () => {
      w.terminate();
      resolve(here());
    };
  }).then((b) => (bank = b)));

/** The question bank for pages that only count with it: null at first, then the bank once it is built. */
export function usePool(): Bank | null {
  const [b, setB] = useState(bank);
  useEffect(() => {
    if (b) return;
    let live = true;
    void loadBank().then((x) => live && setB(x));
    return () => {
      live = false;
    };
  }, [b]);
  return b;
}
