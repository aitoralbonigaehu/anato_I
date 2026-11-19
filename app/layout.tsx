import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './tokens.css';
import './globals.css';
import './ui.css';
import './finish.css';
import './art.css';
import './polish/home.css';
import './polish/sim-head.css';
import './polish/sim-dock.css';
import './polish/klasea.css';
import './polish/ikasgela.css';
import './polish/eratorriak.css';
import './polish/belortzioak.css';
import './polish/plates.css';
import './polish/egiturak.css';
import './polish/site.css';
import './polish/onboarding.css';
import { Kimu } from '@/components/kimu/Kimu';
import { KimuCheer } from '@/components/kimu/KimuCheer';
import { CommandBar } from '@/components/shell/CommandBar';
import { ThemeSync } from '@/components/shell/theme';
import { AccountRoot } from '@/components/account/AccountRoot';
import { StudyAccountGate } from '@/components/account/StudyAccountGate';
import { StudyMusic } from '@/components/shell/StudyMusic';
import { Welcome } from '@/components/onboarding/Welcome';
import { WELCOME_SEEN } from '@/components/onboarding/visit';
import { VisitBeacon } from '@/components/visits/VisitBeacon';
import { themeScript } from '@/components/shell/theme-script';
import { demoScript } from '@/lib/demo/demo-script';

const sans = Geist({ subsets: ['latin'], variable: '--font-geist', display: 'swap' });
const mono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono', display: 'swap' });

export const metadata: Metadata = {
  title: 'EnbrioAtlas — Giza garapena, zelulaz zelula',
  description: 'Giza enbriologia ikasteko simulagailu bisual eta interaktiboa, euskaraz: ernalkuntzatik enbrioi eta fetuaren ezaugarri nagusietara.',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f5f1' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0b' },
  ],
};

// The V2 film owns the automatic opening. The home footer can replay the fertilisation film.
const introFlag = `try {
  const flags = document.documentElement.dataset;
  const firstVisit = localStorage.getItem('${WELCOME_SEEN}') !== '1';
  const params = new URLSearchParams(location.search);
  const replay = params.get('ongietorria') === '1' || params.get('intro') === 'v2';
  if ((firstVisit || replay) && !location.pathname.startsWith('/dev')) flags.journeyLoading = '1';
  if (!params.has('intro-at') || flags.journeyLoading || matchMedia('(prefers-reduced-motion: reduce)').matches) flags.intro = 'seen';
} catch {}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="eu" className={`${sans.variable} ${mono.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: demoScript + themeScript + introFlag }} />
      </head>
      <body>
        <Welcome />
        <StudyMusic />
        <StudyAccountGate>
          {children}
          <Kimu />
          <KimuCheer />
          <CommandBar />
        </StudyAccountGate>
        <ThemeSync />
        <AccountRoot />
        <VisitBeacon />
      </body>
    </html>
  );
}
