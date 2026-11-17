import type { Metadata } from 'next';
import { Aurrerapena } from '@/components/progress/Aurrerapena';
import { LandFoot, LandNav } from '@/components/shell/LandNav';

export const metadata: Metadata = {
  title: 'Aurrerapena — EnbrioAtlas',
  robots: { index: false, follow: false },
};

/** The student's progress: level, streak, what was seen per topic and how often, flashcards, badges. */
export default function ProgressPage() {
  return (
    <div className="landing">
      <LandNav current="aurrerapena" />
      <main>
        <Aurrerapena />
      </main>
      <LandFoot>
        <p>Aurrerapena nabigatzaile honetan gordetzen da; saioa hasita, zure kontuan ere bai.</p>
      </LandFoot>
    </div>
  );
}
