import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './tokens.css';
import './globals.css';
import './ui.css';
import { Kimu } from '@/components/kimu/Kimu';
import { KimuCheer } from '@/components/kimu/KimuCheer';
import { CommandBar } from '@/components/shell/CommandBar';
import { themeScript } from '@/components/shell/theme-script';

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

// Runs before first paint so the opening sequence never flashes when it was already seen this session.
const introFlag = `try{if(sessionStorage.getItem('enbrioatlas:intro')||matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.dataset.intro='seen'}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="eu" className={`${sans.variable} ${mono.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript + introFlag }} />
      </head>
      <body>
        {children}
        <Kimu />
        <KimuCheer />
        <CommandBar />
      </body>
    </html>
  );
}
