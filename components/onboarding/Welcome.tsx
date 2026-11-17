'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { AccountForm } from '@/components/account/AccountForm';
import { useAccount } from '@/components/account/account';
import { Glyph } from '@/components/progress/glyphs';
import { BrandMark, IconClose } from '@/components/shell/icons';
import { markOffered, startTour, type TourId } from '@/components/shell/tour/store';

/**
 * The first-visit welcome ("Ongi etorri"): in a minute, what the app has, where each thing lives and how
 * it works, with the site bar and the simulator drawn small (each point lights its place). It ends by
 * offering to save progress with an account (when accounts are on) and the guided tour of the page.
 * Shown once per browser; «Ongietorria» in the footer and the guides open it again.
 */

const SEEN = 'enbrioatlas:ongietorri:v1';

/** Whether this browser has seen the welcome (the guides' quiet offers wait for it). */
export function welcomeSeen(): boolean {
  try {
    return window.localStorage.getItem(SEEN) === '1';
  } catch {
    return true;
  }
}

/** A footer link that opens the welcome again. */
export function WelcomeLink({ children = 'Ongietorria' }: { children?: React.ReactNode }) {
  return (
    <button type="button" className="foot-link-btn" onClick={openWelcome}>
      {children}
    </button>
  );
}

let forced = 0;
const listeners = new Set<() => void>();
export function openWelcome() {
  forced++;
  listeners.forEach((l) => l());
}
const useForced = () =>
  useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => forced,
    () => 0,
  );

type SiteKey = 'gaiak' | 'kronologia' | 'ikasgela' | 'bilatu' | 'laguntza' | 'aurrerapena' | 'sim' | 'kimu';
type SimKey = 'etapak' | 'eszena' | 'player' | 'apunteak' | 'tresnak';
interface Point {
  key?: SiteKey | SimKey;
  title: string;
  text: string;
}
interface Slide {
  id: string;
  kicker: string;
  title: string;
  lead: string;
  visual: 'hello' | 'site' | 'sim' | 'card' | 'progress' | 'account' | 'ready';
  points?: Point[];
}

const SLIDES: Slide[] = [
  {
    id: 'ongi',
    kicker: 'Ongi etorri',
    title: 'Giza garapena, zelulaz zelula',
    lead: 'EnbrioAtlas zure enbriologia-apunteak dira, animatuta eta euskaraz: ernalkuntzatik gorputzaren sistemak eratu arte. Minutu batean erakutsiko dizugu zer dagoen, non dagoen eta nola dabilen.',
    visual: 'hello',
  },
  {
    id: 'sim',
    kicker: '1 · Simulagailua',
    title: 'Ikasi urratsez urrats',
    lead: 'Gai bakoitza etapatan dago, apunteen ordenan, eta etapa bakoitza urratsetan. Pasatu sagua puntu bakoitzetik: non dagoen ikusiko duzu.',
    visual: 'sim',
    points: [
      { key: 'etapak', title: 'Gaia eta etapak', text: 'Goian: zein gaitan eta etapatan zauden. Klikatuta, zerrenda osoa.' },
      { key: 'eszena', title: 'Eszena', text: 'Enbrioia, apunteetako izenekin. Klikatu egitura bat: zer den, nondik datorren eta zertan bihurtzen den. 2D eta 3D, ebaki desberdinak (1–9).' },
      { key: 'player', title: 'Urratsez urrats', text: 'Behean: hasi edo pausatu (Zuriunea), ← → urratsak. Modua: Gidatua (mantso, galderekin; gai batzuetan Kimu irakaslearen klasea), Arrunta edo Azkarra.' },
      { key: 'apunteak', title: 'Apunteak ondoan', text: 'Eskuinean, zure apunteak simulazioarekin batera argituta (N). Esaldi bat klikatuta, hara doa simulazioa.' },
      { key: 'tresnak', title: 'Kimu eta tresnak', text: 'Goian eskuinean: galdetu Kimuri (K), Galderak, Aurkitu, glosarioa eta kronologia «⋯» menuan.' },
    ],
  },
  {
    id: 'non',
    kicker: '2 · Non dago dena?',
    title: 'Goiko barra, orri guztietan',
    lead: 'Edozein orritatik, goiko barra berak eramaten zaitu leku guztietara.',
    visual: 'site',
    points: [
      { key: 'sim', title: 'Ireki simulagailua', text: 'Eskuinean beti: utzi zenuen etapara eramaten zaitu.' },
      { key: 'gaiak', title: 'Gaiak eta Kronologia', text: 'Gai guztiak garapenaren ordenan, eta garapen osoa egunez egun denbora-lerro bakarrean.' },
      { key: 'ikasgela', title: 'Ikasgela ▾', text: 'Gai bakoitzaren gela (mapa, taulak, fitxak), Eratorriak, Belortzioak, Irudiak, Egiturak eta Fitxak.' },
      { key: 'bilatu', title: 'Bilatu', text: 'Gai, etapa edo egitura bat idatzi, eta zuzenean hara (Ctrl + K).' },
      { key: 'laguntza', title: 'Gida «?»', text: 'Orri bakoitzaren gida laburra: hor dago beti.' },
      { key: 'kimu', title: 'Kimu', text: 'Behean eskuinean: galdetu edozer, euskaraz, gaztelaniaz edo ingelesez.' },
    ],
  },
  {
    id: 'praktikatu',
    kicker: '3 · Frogatu zure burua',
    title: 'Ikusi, gero gogoratu',
    lead: 'Irakurtzeak ez du nahikoa: gogoratzen saiatzeak finkatzen du. Huts egindakoak lehenago itzultzen dira, ondo dakizkizunak beranduago.',
    visual: 'card',
    points: [
      { title: 'Belortzioak · Ikasketa modua', text: 'Txartelak: gezi bat argitzen da, izena pentsatu, buelta eman eta esan «Banekien» edo «Ez nekien». Huts egindakoak berriz agertzen dira.' },
      { title: 'Galderak', text: 'Simulagailuan («Tresnak» → Galderak): akats bakoitzaren azalpenarekin, eta simulaziora eramaten zaitu.' },
      { title: 'Aurkitu', text: 'Egitura baten izena ematen da: aurkitu irudian.' },
      { title: 'Eratorrien txartelak', text: 'Ikasgelan eta Eratorrietan: zer datorren zertatik, buruz.' },
    ],
  },
  {
    id: 'aurrerapena',
    kicker: '4 · Zure aurrerapena',
    title: 'Zigotoa izatetik anatomista izatera',
    lead: 'Ikasten duzun guztiak puntuak ematen ditu, eta mailaz igotzen zara: zigotoa, morula, blastozistoa… anatomista. Sugarra goiko barran dago.',
    visual: 'progress',
    points: [
      { key: 'aurrerapena', title: 'Bolada eta gaurko helburua', text: 'Zenbat egun jarraian ikasi duzun, eta gaurko helburua: 15 minutu edo 20 txartel.' },
      { title: 'Gaika', text: 'Gai bakoitzean zer etapa ikusi dituzun, zenbat aldiz eta zenbat denbora.' },
      { title: 'Txartelak eta lorpenak', text: 'Zenbat dakizkizun, zenbat errepasatzeko dauden, eta 12 lorpen irabazteko.' },
    ],
  },
];

const tourOf = (path: string): TourId | null => (path === '/' ? 'home' : path.startsWith('/astea/') ? 'sim' : path.startsWith('/belortzioak') ? 'bel' : null);

/** Elements that must have gone before the welcome opens: the home page's opening, a running class. */
const BUSY = '.intro, .kimu-panel, .acc-dialog[open]';

export function Welcome() {
  const path = usePathname() ?? '/';
  const forcedN = useForced();
  const acc = useAccount();
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);
  const [lit, setLit] = useState<string | null>(null);
  const ref = useRef<HTMLDialogElement>(null);
  const withAccount = acc.status === 'out';
  const slides: Slide[] = [
    ...SLIDES,
    withAccount
      ? { id: 'kontua', kicker: '5 · Aukerakoa', title: 'Gorde zure aurrerapena', lead: 'Hasi saioa, eta ikusitakoa, txartelak eta galderak edozein gailutan izango dituzu. Saiorik gabe ere dena dabil: nabigatzaile honetan gordetzen da.', visual: 'account' }
      : { id: 'prest', kicker: 'Prest', title: 'Hasteko prest', lead: 'Hau guztia «Ongietorria» atalean duzu berriz, orri-oinean. Orri bakoitzaren gida laburra, «?» botoian.', visual: 'ready' },
  ];
  const slide = slides[Math.min(i, slides.length - 1)];
  const last = i >= slides.length - 1;
  const tour = tourOf(path);

  // First visit: open once the page has settled (the opening has lifted, nothing else is up).
  useEffect(() => {
    if (path.startsWith('/dev')) return;
    try {
      if (window.localStorage.getItem(SEEN) === '1') return;
    } catch {
      return;
    }
    let tries = 0;
    const id = window.setInterval(() => {
      tries++;
      const busy = [...document.querySelectorAll(BUSY)].some((el) => el.getClientRects().length > 0);
      if (busy && tries < 60) return;
      window.clearInterval(id);
      setI(0);
      setOpen(true);
    }, 700);
    return () => window.clearInterval(id);
  }, [path]);

  useEffect(() => {
    if (!forcedN) return;
    const raf = window.setTimeout(() => {
      setI(0);
      setOpen(true);
    });
    return () => window.clearTimeout(raf);
  }, [forcedN]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  // Each slide lights its first point until the student points at another.
  useEffect(() => {
    const raf = window.setTimeout(() => setLit(slide.points?.find((p) => p.key)?.key ?? null));
    return () => window.clearTimeout(raf);
  }, [slide]);

  const close = (then?: () => void) => {
    try {
      window.localStorage.setItem(SEEN, '1');
    } catch {}
    // The page's guide is offered here at the end: the quiet first-visit offer need not come too.
    if (tour) markOffered(tour);
    setOpen(false);
    if (then) window.setTimeout(then, 250);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === 'ArrowRight' && !last) setI((x) => x + 1);
      if (e.key === 'ArrowLeft' && i > 0) setI((x) => x - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, i, last]);

  const finish = (
    <div className="welcome-cta">
      {tour && (
        <button className="btn primary" onClick={() => close(() => startTour(tour))}>
          Ikusi orri honen gida <small>1 min</small>
        </button>
      )}
      <button className={`btn${tour ? '' : ' primary'}`} onClick={() => close()}>
        {withAccount ? 'Orain ez, hasi ikasten' : 'Hasi ikasten'}
      </button>
    </div>
  );

  return (
    <dialog
      ref={ref}
      className="welcome"
      role="dialog"
      aria-labelledby="welcome-title"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
    >
      {open && (
        <div className="welcome-in">
          <header className="welcome-head">
            <span className="welcome-brand">
              <BrandMark size={20} />
              <span>
                Enbrio<b>Atlas</b>
              </span>
            </span>
            <ol className="welcome-dots" aria-label="Urratsak">
              {slides.map((s, k) => (
                <li key={s.id}>
                  <button className={k === i ? 'is-on' : k < i ? 'is-done' : ''} onClick={() => setI(k)} aria-label={`${k + 1}. ${s.title}`} aria-current={k === i ? 'step' : undefined} />
                </li>
              ))}
            </ol>
            <button className="icon-btn" onClick={() => close()} aria-label="Itxi (Esc)" title="Itxi (Esc)">
              <IconClose size={16} />
            </button>
          </header>

          <div className={`welcome-body is-${slide.visual}`} key={slide.id}>
            <div className="welcome-text">
              <p className="welcome-kicker">{slide.kicker}</p>
              <h2 id="welcome-title">{slide.title}</h2>
              <p className="welcome-lead">{slide.lead}</p>
              {slide.points && (
                <ul className="welcome-points" onPointerLeave={() => setLit(slide.points?.find((p) => p.key)?.key ?? null)}>
                  {slide.points.map((p) => (
                    <li
                      key={p.title}
                      className={p.key && p.key === lit ? 'is-lit' : ''}
                      onPointerEnter={() => p.key && setLit(p.key)}
                      onFocus={() => p.key && setLit(p.key)}
                      tabIndex={p.key ? 0 : undefined}
                    >
                      <b>{p.title}</b>
                      <span>{p.text}</span>
                    </li>
                  ))}
                </ul>
              )}
              {slide.visual === 'account' && finish}
              {slide.visual === 'ready' && finish}
            </div>
            <div className="welcome-visual" aria-hidden={slide.visual !== 'account'}>
              {slide.visual === 'hello' && <Hello />}
              {slide.visual === 'sim' && <SimMock lit={lit} />}
              {(slide.visual === 'site' || slide.visual === 'progress') && <SiteMock lit={lit} progress={slide.visual === 'progress'} />}
              {slide.visual === 'card' && <CardDemo />}
              {slide.visual === 'account' && <AccountForm onDone={() => close()} />}
              {slide.visual === 'ready' && <Ready />}
            </div>
          </div>

          <footer className="welcome-foot">
            <button className="btn ghost small" onClick={() => setI((x) => Math.max(0, x - 1))} disabled={i === 0}>
              ← Atzera
            </button>
            <span className="welcome-count">
              {i + 1} / {slides.length}
            </span>
            {!last ? (
              <button className="btn primary small" onClick={() => setI((x) => x + 1)} autoFocus>
                Hurrengoa →
              </button>
            ) : (
              <button className="btn ghost small" onClick={() => close()}>
                Itxi
              </button>
            )}
          </footer>
        </div>
      )}
    </dialog>
  );
}

// ---- the pictures ---------------------------------------------------------------------------------

function Hello() {
  const tiles = [
    { icon: 'play', title: 'Simulagailua', text: '18 gai, urratsez urrats, 2D eta 3D' },
    { icon: 'map', title: 'Ikasgela', text: 'mapak, taulak, eratorriak, fitxak' },
    { icon: 'cards', title: 'Praktikatu', text: 'galderak eta txartelak' },
    { icon: 'flame', title: 'Aurrerapena', text: 'maila, bolada eta lorpenak' },
  ];
  return (
    <div className="welcome-hello">
      {tiles.map((t, k) => (
        <div key={t.title} className="welcome-tile" style={{ animationDelay: `${120 + k * 90}ms` }}>
          <span>
            <Glyph name={t.icon} size={22} />
          </span>
          <b>{t.title}</b>
          <small>{t.text}</small>
        </div>
      ))}
    </div>
  );
}

const on = (lit: string | null, k: string) => (lit === k ? ' is-lit' : '');

/** The site bar, drawn small; the point the student is reading lights its key. */
function SiteMock({ lit, progress }: { lit: string | null; progress?: boolean }) {
  return (
    <div className="mock mock-site">
      <div className="mock-bar">
        <span className="mock-logo">
          <BrandMark size={12} /> EnbrioAtlas
        </span>
        <span className={`mock-k${on(lit, 'kronologia')}${on(lit, 'gaiak')}`}>Kronologia</span>
        <span className={`mock-k${on(lit, 'gaiak')}`}>Gaiak</span>
        <span className={`mock-k${on(lit, 'ikasgela')}`}>Ikasgela ▾</span>
        <span className={`mock-k mock-search${on(lit, 'bilatu')}`}>⌕ Bilatu</span>
        <span className={`mock-k mock-round${on(lit, 'laguntza')}`}>?</span>
        <span className={`mock-k mock-flame${on(lit, 'aurrerapena')}`}>
          <Glyph name="flame" size={11} /> 3
        </span>
        <span className={`mock-k mock-go${on(lit, 'sim')}`}>Simulagailua</span>
      </div>
      {lit === 'ikasgela' && (
        <div className="mock-menu">
          {['Ikasgelak', 'Eratorriak', 'Belortzioak', 'Irudiak', 'Egiturak', 'Fitxak'].map((x) => (
            <span key={x}>{x}</span>
          ))}
        </div>
      )}
      {progress ? (
        <div className="mock-progress">
          <div className="mock-level">
            <span className="mock-ring">5</span>
            <span>
              <small>MAILA</small>
              <b>Gastrula</b>
              <i>
                <em />
              </i>
            </span>
          </div>
          <div className="mock-ladder">
            {['Zigotoa', 'Morula', 'Blastozistoa', 'Disko bilaminarra', 'Gastrula', 'Neurula', 'Enbrioia', 'Fetua', 'Jaioberria', 'Anatomista'].map((x, k) => (
              <span key={x} className={k < 4 ? 'is-done' : k === 4 ? 'is-now' : ''} title={x} />
            ))}
          </div>
          <div className="mock-medals">
            {['seed', 'compass', 'flame', 'cards', 'lock', 'lock'].map((g, k) => (
              <span key={k} className={g === 'lock' ? '' : 'is-got'}>
                <Glyph name={g} size={14} />
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="mock-page">
          <div className="mock-hero" />
          <div className={`mock-shelf${on(lit, 'gaiak')}`}>
            {Array.from({ length: 6 }, (_, k) => (
              <i key={k} />
            ))}
          </div>
          <span className={`mock-kimu${on(lit, 'kimu')}`}>K</span>
        </div>
      )}
    </div>
  );
}

/** The simulator, drawn small. */
function SimMock({ lit }: { lit: string | null }) {
  return (
    <div className="mock mock-sim">
      <div className="mock-sim-top">
        <span className={`mock-k${on(lit, 'etapak')}`}>7. gaia ▾</span>
        <span className={`mock-k mock-stages${on(lit, 'etapak')}`}>
          {Array.from({ length: 6 }, (_, k) => (
            <i key={k} className={k === 2 ? 'is-on' : ''} />
          ))}
        </span>
        <span className={`mock-k mock-tools${on(lit, 'tresnak')}`}>Kimu · ⋯</span>
      </div>
      <div className="mock-sim-mid">
        <div className={`mock-scene${on(lit, 'eszena')}`}>
          <svg viewBox="0 0 120 80" aria-hidden>
            <ellipse cx="58" cy="42" rx="36" ry="24" className="mock-emb" />
            <ellipse cx="44" cy="40" rx="10" ry="12" className="mock-org" />
            <path d="M78 30q8 12 0 24" className="mock-org2" />
            <line x1="44" y1="40" x2="20" y2="14" />
            <text x="6" y="11">Bihotza</text>
          </svg>
          <span className="mock-views">2D · 3D</span>
        </div>
        <div className={`mock-notes${on(lit, 'apunteak')}`}>
          <i />
          <i className="is-hl" />
          <i />
          <i />
        </div>
      </div>
      <div className={`mock-player${on(lit, 'player')}`}>
        <span className="mock-play">▶</span>
        <span className="mock-track">
          {Array.from({ length: 8 }, (_, k) => (
            <i key={k} className={k < 3 ? 'is-done' : ''} />
          ))}
        </span>
        <span className="mock-k">Gidatua</span>
      </div>
    </div>
  );
}

/** A flashcard that can be turned, as in Ikasketa modua. */
function CardDemo() {
  const [flip, setFlip] = useState(false);
  const [said, setSaid] = useState<null | boolean>(null);
  return (
    <div className="welcome-demo">
      <div className={`demo-card${flip ? ' is-flipped' : ''}`}>
        <div className="demo-inner">
          <div className="demo-face demo-front">
            <svg viewBox="0 0 160 90" aria-hidden>
              <ellipse cx="80" cy="48" rx="50" ry="30" className="mock-emb" />
              <ellipse cx="62" cy="46" rx="13" ry="15" className="mock-org is-lit" />
              <path d="M128 16 L76 42" className="demo-arrow" />
            </svg>
            <b>Zer seinalatzen du geziak?</b>
            <button className="btn small primary" onClick={() => setFlip(true)}>
              Buelta eman
            </button>
          </div>
          <div className="demo-face demo-back">
            <small>Kardiobaskularra</small>
            <b className="demo-name">Bihotz-hodi primitiboa</b>
            {said === null ? (
              <span className="demo-verdict">
                <button className="is-yes" onClick={() => setSaid(true)}>
                  ✓ Banekien
                </button>
                <button className="is-no" onClick={() => setSaid(false)}>
                  ✗ Ez nekien
                </button>
              </span>
            ) : (
              <span className="demo-said">
                {said ? 'Bikain: hiru egun barru itzuliko da.' : 'Ados: hiru txartel barru itzuliko da.'}
                <button
                  className="btn small ghost"
                  onClick={() => {
                    setSaid(null);
                    setFlip(false);
                  }}
                >
                  Berriz
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
      <p className="demo-hint">Probatu: eman buelta txartelari.</p>
    </div>
  );
}

function Ready() {
  return (
    <div className="welcome-ready">
      <span>
        <Glyph name="seed" size={40} />
      </span>
    </div>
  );
}
