import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProgressPanel } from '@/components/progress/ProgressPanel';
import { isProgressEnabled } from '@/lib/progress';

export const metadata: Metadata = {
  title: 'Aurrerapena — EnbrioAtlas',
  robots: { index: false, follow: false },
};

/** Hidden study-progress page: 404 unless NEXT_PUBLIC_PROGRESS_ENABLED=1 and Supabase is configured. */
export default function ProgressPage() {
  if (!isProgressEnabled()) notFound();
  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '48px 16px' }}>
      <h1>Aurrerapena</h1>
      <ProgressPanel />
    </main>
  );
}
