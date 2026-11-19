'use client';

import type { ReactNode } from 'react';
import { useAccount } from './account';

export function StudyAccountGate({ children }: { children: ReactNode }) {
  const { status } = useAccount();
  const accountsPossible = process.env.NEXT_PUBLIC_ACCOUNTS === 'supabase' || process.env.NODE_ENV !== 'production';
  if (accountsPossible && status === 'loading') return <p role="status">Itxaron…</p>;
  return children;
}
