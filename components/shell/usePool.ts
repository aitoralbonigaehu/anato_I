'use client';

import { useEffect, useState } from 'react';
import type { PoolQuestion } from '@/content/pool';

/** What the counting pages read from a question: no wording, only who it is and its answer. */
export type BankQuestion = Pick<PoolQuestion, 'id' | 'week' | 'comp' | 'concept' | 'options' | 'answer'>;
export type Bank = { POOL: BankQuestion[]; KEY_IDS: Map<string, string[]> };

let bank: Bank | null = null;
let loading: Promise<Bank> | null = null;

/** The bank from a worker ('slim' or 'full'); built on the page itself only where a worker cannot start (tests, very old browsers). */
function fromWorker<T>(kind: 'slim' | 'full', here: () => Promise<T>, take: (d: { pool: PoolQuestion[]; keyIds: Map<string, string[]> }) => T) {
  return new Promise<T>((resolve) => {
    let w: Worker;
    try {
      w = new Worker(new URL('../../content/bank.worker.ts', import.meta.url), { type: 'module' });
    } catch {
      resolve(here());
      return;
    }
    w.onmessage = (e: MessageEvent<{ pool: PoolQuestion[]; keyIds: Map<string, string[]> }>) => {
      w.terminate();
      resolve(take(e.data));
    };
    w.onerror = () => {
      w.terminate();
      resolve(here());
    };
    w.postMessage(kind);
  });
}

/**
 * The question bank, built once in a worker: building it is about a second of work, and on the page it
 * froze Home, Progress and the structure atlas while they opened (and every animation with them).
 */
export const loadBank = () =>
  (loading ??= fromWorker<Bank>(
    'slim',
    () => import('@/content/pool').then((m): Bank => ({ POOL: m.POOL, KEY_IDS: m.KEY_IDS })),
    (d) => ({ POOL: d.pool, KEY_IDS: d.keyIds }),
  ).then((b) => (bank = b)));

let full: PoolQuestion[] | null = null;
let loadingFull: Promise<PoolQuestion[]> | null = null;
/** Every question whole (wording, options, explanations), also built in the worker: for the class's pool checks. */
export const loadFullPool = () =>
  (loadingFull ??= fromWorker<PoolQuestion[]>('full', () => import('@/content/pool').then((m) => m.POOL), (d) => d.pool).then((p) => (full = p)));

/** The whole questions: null until the worker has built them (asked for as soon as the component mounts). */
export function useFullPool(): PoolQuestion[] | null {
  const [p, setP] = useState(full);
  useEffect(() => {
    if (p) return;
    let live = true;
    void loadFullPool().then((x) => live && setP(x));
    return () => {
      live = false;
    };
  }, [p]);
  return p;
}

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
