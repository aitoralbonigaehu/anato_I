import type { Metadata } from 'next';
import Link from 'next/link';
import { LandFoot, LandNav, firstReady } from '@/components/shell/LandNav';
import { SimLink } from '@/components/shell/NavMenu';

export const metadata: Metadata = { title: 'Orri hau ez dago — EnbrioAtlas' };

export default function NotFound() {
  return (
    <div className="landing">
      <LandNav />
      <section className="ln-hero">
        <p className="eyebrow">404</p>
        <h1>Orri hau ez dago</h1>
        <p className="hero-lead">Bilatzen ari zaren helbidea ez da existitzen edo lekuz aldatu da.</p>
        <div className="hero-cta">
          <Link href="/" className="btn primary lg">
            Hasierara itzuli
          </Link>
          <SimLink fallback={`/astea/${firstReady.week}`} className="btn lg">
            Ireki simulagailua
          </SimLink>
        </div>
      </section>
      <LandFoot />
    </div>
  );
}
