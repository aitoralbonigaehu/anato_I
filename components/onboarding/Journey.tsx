'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { openAccount, useAccount } from '@/components/account/account';
import { BrandMark } from '@/components/shell/icons';
import { structures, weeks } from '@/content/registry';
import { AppFrame } from './AppFrame';
import { ERA_MAP, KIMU_QUESTION, PLATE_FIGURE, framePlate, playScene, runFullscreen, runKimu, runPlate, runSchemes, type Cursor } from './demo-runs';
import Show, { type Place } from './show/Show';
import ReleaseFilm, { type PalateState } from './ReleaseFilm';
import s from './journey.module.css';

/**
 * The first-visit journey, after the opening film: the problem (notes are flat, embryology moves), then
 * the app itself, live — the simulator, Kimu answering and taking you there, Belortzioak lighting one
 * structure, Eratorriak lighting an origin and all it gives in a mind map — what else is in it, and where to start. It is also the app's guide: the "?" keys open it.
 */
type App = 'sim' | 'bel' | 'era';
interface Stop {
  name: string;
  eyebrow: string;
  title: string;
  italic: string;
  body: string;
  /** The words of the body that carry the stop (marked, once the words are in). */
  key?: string;
  next: string;
  app?: App;
}

/** The body, with its key words marked. */
function lead({ body, key }: Stop) {
  const at = key ? body.indexOf(key) : -1;
  if (!key || at < 0) return body;
  return (
    <>
      {body.slice(0, at)}
      <strong className={s.key}>{key}</strong>
      {body.slice(at + key.length)}
    </>
  );
}

const STOPS: Stop[] = [
  {
    name: 'Hasiera',
    eyebrow: 'Enbriologian barrena',
    title: 'Hitzetatik',
    italic: 'formara.',
    body: 'Enbrioia ez da orrialde bat: hazi, tolestu eta biratu egiten da, hiru dimentsiotan. EnbrioAtlasek zure apunteak hartzen ditu eta bizia ematen die, urratsez urrats.',
    next: 'Hasi bidaia',
  },
  {
    name: 'Arazoa',
    eyebrow: 'Arazoa',
    title: 'Apunteak ez',
    italic: 'dira mugitzen.',
    body: 'Enbriologia mugimendua da: hastapenak hurbildu, tolestu eta fusionatu egiten dira. Apunteek, ordea, hitzak eta irudi lauak dituzte, eta gainerakoa zure buruan eraiki behar duzu: zer dagoen zeren atzean, zer mugitzen den eta noiz. Hor galtzen gara gehienok.',
    next: 'Ikusi irtenbidea',
  },
  {
    name: 'Simulagailua',
    eyebrow: 'Irtenbidea',
    title: 'Apunteak,',
    italic: 'bizirik.',
    body: 'Hau ez da bideo bat: benetako simulagailua da, 17. gaiaren lehen urratsa. Apunteetako esaldi bakoitza urrats bat da, eta urrats bakoitzak bere eszena du: aipatzen den egitura pizten da, eta mugitzen dena zure aurrean mugitzen da.',
    next: 'Ezagutu Kimu',
    app: 'sim',
  },
  {
    name: 'Kimu',
    eyebrow: 'Kimu',
    title: 'Galdetu,',
    italic: 'eta ikusi.',
    body: 'Zalantza bat? Idatzi zure hitzekin. Kimuk zure apunteetan bilatzen du erantzuna, gaia eta atala aipatzen ditu, eta botoi bakar batekin simulagailuan non ikusten den erakusten dizu.',
    key: 'simulagailuan non ikusten den erakusten dizu',
    next: 'Ezagutu Belortzioak',
    app: 'sim',
  },
  {
    name: 'Belortzioak',
    eyebrow: 'Belortzioak',
    title: 'Pasa sagua,',
    italic: 'eta pizten da.',
    body: 'Ikasgaiko irudiak, izen guztiekin. Pasa sagua izen baten gainetik: egitura hori bakarrik pizten da, osorik, eta gainerakoa itzali egiten da. Gero estali izenak eta galdetu zeure buruari: Zer da? Non dago?',
    next: 'Ezagutu Eratorriak',
    app: 'bel',
  },
  {
    name: 'Eratorriak',
    eyebrow: 'Eratorriak',
    title: 'Jatorritik',
    italic: 'eratorrira.',
    body: 'Gai bakoitza eskema batean, apunteen ordenan: hastapen bakoitzetik geziak, eta gezi bakoitzaren gainean zer gertatzen den. Pasa sagua egitura baten gainetik, eta hortik eratortzen den guztia pizten da, azken eratorriraino. Gero, Landu: galderak bi noranzkoetan, zeure burua probatzeko.',
    next: 'Eta gehiago',
    app: 'era',
  },
  {
    name: 'Dena',
    eyebrow: 'Dena leku batean',
    title: 'Ikasgai osoa,',
    italic: 'hiru dimentsiotan.',
    body: 'Gai guztiak, zure apunteekin bat eginda: eredu zainduak, izen bakoitza bere egituran, eta ikuspegi batetik bestera zu galdu gabe bidaiatzen duen kamera. Euskaraz, hasieratik bukaeraraino.',
    next: 'Hasi',
  },
  {
    name: 'Hasi',
    eyebrow: 'Zure ikasketa',
    title: 'Orain,',
    italic: 'zure txanda.',
    body: 'Hasi 17. gaitik, burua eta lepoa ulertzeko lehen urratsetik, edo aukeratu zurea. Ordenagailuan edo tabletan erabiltzea gomendatzen dizut: pantaila handian eredua eta apunteak batera ikusten dira.',
    next: 'Hasi ikasten',
  },
];

/**
 * Where the opening show's points are at each stop: the face fusing in the first stop's picture, a quiet dust while
 * the page of notes and the live app take the stage (the canvas then stops drawing), the skull of topic 17 (where
 * the guide sends a student to start) on the last.
 */
/** The points' picture at each stop: with the v3 film the face opens the journey; with v2 its embryo does (CUE). */
const PLACE: Place[] = ['face', 'rest', 'rest', 'rest', 'rest', 'rest', 'rest', 'skull'];
const PLACE_V2: Place[] = ['rest', 'rest', 'rest', 'rest', 'rest', 'rest', 'rest', 'skull'];
/** The v2 film's camera cues per stop (ReleaseFilm): 0 the embryo in the picture, 3 out of the way. */
const CUE = [0, 3, 3, 3, 3, 3, 3, 3];
/** The stops of each live frame, and the one before (it loads there, out of sight). */
const FRAME_STOPS: Record<App, number[]> = { sim: [2, 3], bel: [4], era: [5] };
/** How long each stop's own motion lasts (ms): the next stop's frame loads after it (Arazoa: the page's whole timeline). */
const SETTLE: Record<number, number> = { 0: 3200, 1: 5600 };
/** The stop with the numbers and every topic. */
const DENA = 6;

const SIM_SRC = '/astea/17?etapa=sarrera&une=0.02';
const BEL_SRC = '/belortzioak?irudia=p07';
const ERA_SRC = '/eratorriak#a18-eskemak';
/** Where the guide leaves a student who starts from it: 17. gaia, from its first step. */
const LESSON = '/astea/17';

const SIM_POINTS = ['Eredua 3Dn: arrastatu biratzeko', 'Urrats bakoitza, apunteetako esaldi bat', 'Izen bakoitza, aipatzen den unean'];
/** The simulator's full screen: its key in the picture's tools, or F. */
const FS_POINT = 'Pantaila osoa: ⤢ botoia edo F tekla';
const ERA_STEPS = ['Egitura bat, eta hortik eratortzen den guztia', 'Landu: galdera bat, zure kabuz erantzuteko', 'Erakutsi erantzuna, eta egiaztatu'];
const KIMU_STEPS = ['Zure hitzekin galdetu', 'Apunteetatik erantzuten du, gaia eta atala aipatuta', 'Sakatu, eta hantxe zaude: urratsa eta apunteetako esaldia'];

const live = (v: { description: string }) => v.description !== 'Prestatzen';
const STATS = [
  { n: weeks.length, w: 'gai' },
  { n: weeks.reduce((n, w) => n + w.stages.filter((st) => st.views.some(live)).length, 0), w: 'etapa' },
  { n: weeks.reduce((n, w) => n + w.stages.reduce((m, st) => m + st.views.filter(live).length, 0), 0), w: 'ikuspegi' },
  { n: structures.size, w: 'egitura eta kontzeptu' },
];
const FEATURES = ['Kronologia', 'Frogatu', 'Modu gidatua', 'Ahotsa', 'Irudi-fitxak', 'Aurrerapena'];
const POSTERS = [17, 18, 16, 15, 14, 13, 12, 19].map((n) => ({ n, title: weeks.find((w) => w.week === n)?.title ?? '' }));

/** The page of the notes this journey brings to life (18. gaia, 4.1): their own words and figures. */
function NotesPage() {
  return (
    <figure className={s.paper}>
      <header className={s.paperHead}>
        <span>18. gaia · 4.1</span>
        <span>Sudur plakodak eta aho sabaia</span>
      </header>
      <blockquote className={s.paperText}>
        …sudur hastapen hauek aurrekalderantz mugitzen/hurbiltzen dira biak fusionatzeko (sudur plakoda bietako <mark>ertz medialak</mark> fusionatzen dira).{' '}
        <mark>Luzapen maxilarrak</mark> alde medialerantz eta aurrerantz luzatzen dira ere, haien artean fusionatuz… 10. astean bi sudur plakoden ertz medialak haien artean fusionatzen dira…
      </blockquote>
      <div className={s.paperFigs} data-camera-target>
        {['18-15', '18-16', '18-17'].map((f, i) => (
          <span key={f} className={s.paperFig}>
            {i > 0 && <i aria-hidden>→</i>}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/irudiak-pdf/${f}.jpg`} alt="" />
          </span>
        ))}
      </div>
      <figcaption className={s.margin}>Eta tartean, zer mugitzen da?</figcaption>
    </figure>
  );
}

const vars = (v: Record<string, number>) => v as CSSProperties;

/** A number that counts up to `n` when the stop opens (it is simply `n` without motion). */
function CountUp({ n, delay }: { n: number; delay: number }) {
  const el = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const e = el.current;
    if (!e) return;
    e.textContent = String(n);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const t0 = performance.now() + delay;
    const tick = (now: number) => {
      const k = Math.min(1, Math.max(0, (now - t0) / 1500));
      e.textContent = String(Math.round(n * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    e.textContent = '0';
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [n, delay]);
  return <dd ref={el} aria-label={String(n)} />;
}

function Mosaic() {
  return (
    <div className={s.mosaic} data-camera-target>
      {POSTERS.map((p, i) => (
        <figure key={p.n} className={s.poster} style={vars({ '--d': i })}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/topic-shots/${p.n}.webp`} alt="" width={640} height={410} />
          <figcaption>
            <b>{p.n}.</b> {p.title}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

function Devices() {
  return (
    <div className={s.devices} aria-hidden="true">
      <div className={s.laptop}>
        <div className={s.screen} data-camera-target>
          <span className={s.specimenPoster} data-specimen-poster />
        </div>
        <div className={s.base} />
      </div>
      <div className={s.tablet}>
        <BrandMark size={34} />
      </div>
    </div>
  );
}

export default function Journey({ opening, onFilmEnd, onReplayFilm, onClose, home, start = 0 }: { opening: boolean; onFilmEnd: () => void; onReplayFilm: () => void; onClose: () => void; home: boolean; start?: number }) {
  const first = Math.max(0, Math.min(STOPS.length - 1, start));
  const [step, setStep] = useState(first);
  const [direction, setDirection] = useState(1);
  const [travelling, setTravelling] = useState(false);
  const [destination, setDestination] = useState<number | null>(null);
  const transfer = useRef(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const shell = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const scroll = useRef<HTMLDivElement>(null);
  const art = useRef<HTMLDivElement>(null);
  const turn = useRef({ yaw: 0, pitch: -0.1 });
  // The opening film: v2 (the embryo built from the notes' words). The particle show (v3) stays at ?intro=v3.
  const [filmV2] = useState(() => new URLSearchParams(window.location.search).get('intro') !== 'v3');
  const places = filmV2 ? PLACE_V2 : PLACE;
  const noPalate = useRef<PalateState | null>(null);
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const [fromFilm] = useState(opening);
  const [live, setLive] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const touched = useRef(false);
  const acc = useAccount();
  const router = useRouter();
  const stop = STOPS[step];
  const last = step === STOPS.length - 1;

  // The live frames and what they are doing.
  const sim = useRef<HTMLIFrameElement>(null);
  const bel = useRef<HTMLIFrameElement>(null);
  const era = useRef<HTMLIFrameElement>(null);
  const scale = useRef<Record<App, number>>({ sim: 1, bel: 1, era: 1 });
  const [simReady, setSimReady] = useState(false);
  const [belReady, setBelReady] = useState(false);
  const [kimuPhase, setKimuPhase] = useState(0);
  const [kimuRun, setKimuRun] = useState(0);
  const [kimuYours, setKimuYours] = useState(false);
  const [belYours, setBelYours] = useState(false);
  const [eraReady, setEraReady] = useState(false);
  const [eraPhase, setEraPhase] = useState(0);
  const [eraYours, setEraYours] = useState(false);
  const [cursor, setCursor] = useState<Cursor | null>(null);
  // Simulagailua: the full-screen lesson (the frame grown over the screen) and whether the student took over.
  const [fsPhase, setFsPhase] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [simYours, setSimYours] = useState(false);
  const toward = destination ?? step;
  // A frame loading inside this page holds up its animations for a second or two (same page, same thread),
  // so the next stop's frame starts loading only once this stop's own motion is over.
  const [settled, setSettled] = useState(-1);
  useEffect(() => {
    // The clock starts once the opening show has handed over (its points are still flying to the face then).
    if (opening) return;
    const id = window.setTimeout(() => setSettled(step), SETTLE[step] ?? 2600);
    return () => window.clearTimeout(id);
  }, [step, opening]);
  // The simulator, the heaviest, already loads on the opening stop once it is still: a student who goes
  // through Arazoa quickly finds it ready instead of loading.
  const ahead = (i: number) => settled === step && (i === step + 1 || (step === 0 && i === 2));
  const near = (app: App) => FRAME_STOPS[app].some((i) => i === step || i === toward || ahead(i));
  const showing = (app: App) => FRAME_STOPS[app].includes(step) && (!travelling || FRAME_STOPS[app].includes(toward));
  // Once loaded, a frame stays (going back and forth keeps its scene); it loads one stop early.
  const [mounted, setMounted] = useState<Record<App, boolean>>({ sim: false, bel: false, era: false });
  if (!opening && (['sim', 'bel', 'era'] as const).some((a) => !mounted[a] && near(a)))
    setMounted({ sim: mounted.sim || near('sim'), bel: mounted.bel || near('bel'), era: mounted.era || near('era') });

  useEffect(() => {
    if (opening || step !== 0 || !live || touched.current) return;
    const timer = window.setTimeout(() => {
      if (!touched.current) setShowHint(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [opening, step, live]);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    const before = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousScroll = { left: window.scrollX, top: window.scrollY };
    d.showModal();
    delete document.documentElement.dataset.journeyLoading;
    return () => {
      window.clearTimeout(transfer.current);
      d.close();
      window.scrollTo({ ...previousScroll, behavior: 'instant' });
      before?.focus({ preventScroll: true });
    };
  }, []);
  useEffect(() => {
    if (opening) return;
    heading.current?.focus({ preventScroll: true });
    scroll.current?.scrollTo(0, 0);
  }, [step, opening]);

  // Simulagailua: the scene plays by itself; then the pointer shows its full screen (the frame takes the screen).
  useEffect(() => {
    if (step !== 2 || !simReady || simYours) return;
    const win = sim.current?.contentWindow;
    if (!win) return;
    let alive = true;
    const mine = (e: Event) => {
      if (!e.isTrusted || !alive) return;
      alive = false;
      setSimYours(true);
      setCursor(null);
    };
    win.document.addEventListener('pointerdown', mine, true);
    win.document.addEventListener('keydown', mine, true);
    const id = window.setTimeout(() => {
      try {
        playScene(win);
      } catch {}
    }, 700);
    setFsPhase(0);
    runFullscreen(
      win,
      () => alive,
      (c) => alive && setCursor(c && { x: c.x * scale.current.sim, y: c.y * scale.current.sim }),
      (n) => {
        setFsPhase(n);
        if (n === 3) setExpanded(true);
        if (n === 4) setExpanded(false);
      },
    )
      .catch(() => {})
      .finally(() => setCursor(null));
    return () => {
      alive = false;
      window.clearTimeout(id);
      win.document.removeEventListener('pointerdown', mine, true);
      win.document.removeEventListener('keydown', mine, true);
    };
  }, [step, simReady, simYours]);
  /** A real full screen of the live simulator (the student's own press allows it); Esc comes back. */
  function tryFullscreen() {
    setExpanded(false);
    const f = sim.current;
    if (f?.requestFullscreen) void f.requestFullscreen().then(() => f.focus()).catch(() => {});
  }

  // Kimu: a question typed into the real Kimu, its answer, and its "take me there". A touch hands over.
  useEffect(() => {
    if (step !== 3 || !simReady) return;
    const win = sim.current?.contentWindow;
    if (!win) return;
    let alive = true;
    const mine = (e: Event) => {
      if (!e.isTrusted || !alive) return;
      alive = false;
      setKimuYours(true);
    };
    win.document.addEventListener('pointerdown', mine, true);
    win.document.addEventListener('keydown', mine, true);
    setKimuYours(false);
    setKimuPhase(0);
    runKimu(
      win,
      () => alive,
      (n) => {
        if (!alive) return;
        setKimuPhase(n);
        // Typing went into the frame: give the keys back to the journey (← →).
        if (n === 2 && document.activeElement === sim.current) heading.current?.focus({ preventScroll: true });
      },
    ).catch(() => {});
    return () => {
      alive = false;
      win.document.removeEventListener('pointerdown', mine, true);
      win.document.removeEventListener('keydown', mine, true);
    };
  }, [step, simReady, kimuRun]);

  // Belortzioak: the pointer goes from name to name; the student's own pointer takes over.
  useEffect(() => {
    if (step !== 4 || !belReady || belYours) return;
    const win = bel.current?.contentWindow;
    if (!win) return;
    let alive = true;
    const mine = (e: PointerEvent) => {
      if (!e.isTrusted || !alive) return;
      alive = false;
      setBelYours(true);
      setCursor(null);
    };
    win.document.addEventListener('pointermove', mine, true);
    win.document.addEventListener('pointerdown', mine, true);
    runPlate(
      win,
      () => alive,
      // In screen pixels of the frame (the app inside is scaled down).
      (c) => alive && setCursor(c && { x: c.x * scale.current.bel, y: c.y * scale.current.bel }),
    )
      .catch(() => {})
      .finally(() => setCursor(null));
    return () => {
      alive = false;
      win.document.removeEventListener('pointermove', mine, true);
      win.document.removeEventListener('pointerdown', mine, true);
    };
  }, [step, belReady, belYours]);

  // Eratorriak: the pointer follows the mind map's arrows, then "Landu" asks a question and shows its answer.
  useEffect(() => {
    if (step !== 5 || !eraReady || eraYours) return;
    const win = era.current?.contentWindow;
    if (!win) return;
    let alive = true;
    const mine = (e: PointerEvent) => {
      if (!e.isTrusted || !alive) return;
      alive = false;
      setEraYours(true);
      setCursor(null);
    };
    win.document.addEventListener('pointermove', mine, true);
    win.document.addEventListener('pointerdown', mine, true);
    runSchemes(
      win,
      () => alive,
      (c) => alive && setCursor(c && { x: c.x * scale.current.era, y: c.y * scale.current.era }),
      (n) => alive && setEraPhase(n),
    )
      .catch(() => {})
      .finally(() => setCursor(null));
    return () => {
      alive = false;
      win.document.removeEventListener('pointermove', mine, true);
      win.document.removeEventListener('pointerdown', mine, true);
    };
  }, [step, eraReady, eraYours]);

  function go(i: number) {
    if (i < 0 || i >= STOPS.length) return;
    window.clearTimeout(transfer.current);
    setDestination(i === step ? null : i);
    if (i === step) {
      setTravelling(false);
      return;
    }
    setDirection(i > step ? 1 : -1);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTravelling(false);
      setStep(i);
    } else {
      setTravelling(true);
      transfer.current = window.setTimeout(() => {
        setTravelling(false);
        setStep(i);
      }, 620);
    }
  }
  function leave(after?: () => void) {
    if (dialog.current?.dataset.exit === 'true') return;
    const done = () => {
      onClose();
      after?.();
    };
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      done();
      return;
    }
    if (dialog.current) dialog.current.dataset.exit = 'true';
    window.clearTimeout(transfer.current);
    transfer.current = window.setTimeout(done, 250);
  }
  function finish() {
    if (home) leave(() => router.push(LESSON));
    else leave();
  }

  const app = stop.app;

  return (
    <dialog
      ref={dialog}
      role="dialog"
      className={s.journey}
      aria-labelledby={opening ? 'release-title' : 'journey-heading'}
      onCancel={(e) => {
        e.preventDefault();
        if (opening) onFilmEnd();
        else if (expanded) setSimYours(true);
        else leave();
      }}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (opening) {
          if (
            e.key !== 'Tab' &&
            !e.altKey &&
            !e.metaKey &&
            !e.ctrlKey &&
            !['Shift', 'Control', 'Meta', 'Alt'].includes(e.key) &&
            !(e.target instanceof HTMLButtonElement && (e.key === 'Enter' || e.key === ' '))
          ) {
            e.preventDefault();
            onFilmEnd();
          }
          return;
        }
        if (e.target instanceof HTMLInputElement || e.altKey || e.ctrlKey || e.metaKey) return;
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          go(step + (e.key === 'ArrowRight' ? 1 : -1));
        }
      }}
    >
      {filmV2 && (
        <ReleaseFilm
          onLive={setLive}
          focus={0}
          palate={noPalate}
          opening={opening}
          step={CUE[step]}
          destination={destination === null ? null : CUE[destination]}
          onFinish={onFilmEnd}
          art={art}
          turn={turn}
        />
      )}
      {/* With the v2 film, the points (the last stop's skull) load once the first stop is still: never under the film. */}
      {(!filmV2 || (!opening && (step !== 0 || settled === 0))) && (
        <Show
          opening={opening && !filmV2}
          hidden={filmV2 && places[step] === 'rest' && places[destination ?? step] === 'rest'}
          place={places[step]}
          toward={places[destination ?? step]}
          onFinish={onFilmEnd}
          onLive={setLive}
          art={art}
          shell={shell}
          turn={turn}
        />
      )}
      <div ref={shell} className={s.shell} data-stop={step} data-cinema={fromFilm && step === 0} data-opening={opening} data-live={live} inert={opening}>
        <header className={s.head}>
          <span className={s.brand}>
            <BrandMark size={27} />
            <span>
              Enbrio<b>Atlas</b>
            </span>
          </span>
          <span className={s.headRule} aria-hidden="true" />
          <button className={s.skip} onClick={() => leave()}>
            Saltatu <span aria-hidden="true">×</span>
          </button>
        </header>
        <div className={s.scroller} ref={scroll}>
          <section className={s.chapter} key={step} data-direction={direction} data-leaving={travelling} data-app={!!app} data-wide={step === DENA}>
            <div className={s.copy}>
              <p className={s.eyebrow}>
                <i aria-hidden="true" />
                {stop.eyebrow}
              </p>
              <h2 id="journey-heading" ref={heading} tabIndex={-1}>
                <span className={s.line}>{stop.title}</span>
                <br /> <em className={s.line}>{stop.italic}</em>
              </h2>
              <p className={s.lead}>{lead(stop)}</p>
              {step === 2 && (
                <ul className={s.points}>
                  {SIM_POINTS.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                  <li className={s.fsPoint} data-now={fsPhase >= 1 && fsPhase < 4 && !simYours}>
                    {FS_POINT}
                  </li>
                </ul>
              )}
              {step === 3 && (
                <ol className={s.phases} aria-live="polite">
                  {KIMU_STEPS.map((p, i) => (
                    <li key={p} data-on={kimuPhase > i} data-now={!kimuYours && (kimuPhase === i + 1 || (i === 2 && kimuPhase >= 3))}>
                      <i aria-hidden>{i + 1}</i>
                      <span>
                        {p}
                        {i === 0 && (
                          <>
                            : <q>{KIMU_QUESTION}</q>
                          </>
                        )}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
              {step === 4 && <p className={s.hint}>{belYours ? 'Zure txanda: pasa sagua izenen gainetik, edo irudiaren gainetik.' : 'Begira: sagua izen batera doa, eta egitura hori bakarrik pizten da.'}</p>}
              {step === 5 && (
                <ol className={s.phases} aria-live="polite">
                  {ERA_STEPS.map((p, i) => (
                    <li key={p} data-on={eraYours || eraPhase > i} data-now={!eraYours && eraPhase === i + 1}>
                      <i aria-hidden>{i + 1}</i>
                      <span>{p}</span>
                    </li>
                  ))}
                </ol>
              )}
              {step === DENA && (
                <>
                  <dl className={s.stats}>
                    {STATS.map((x, i) => (
                      <div key={x.w} style={vars({ '--i': i })}>
                        <dt>{x.w}</dt>
                        <CountUp n={x.n} delay={520 + i * 140} />
                      </div>
                    ))}
                  </dl>
                  <p className={s.features}>
                    {FEATURES.map((f, i) => (
                      <span key={f} style={vars({ '--i': i })}>
                        {f}
                      </span>
                    ))}
                  </p>
                </>
              )}
              {last && (
                <div className={s.account}>
                  {acc.status === 'out' ? (
                    <>
                      <p>Lehen aldia bada, sortu zure kontua: izen bat eta 4 zenbakiko PIN bat. Zure aurrerapena bereiz gordeko da nabigatzaile honetan, beste norbaitek gailu bera erabili arren.</p>
                      <div className={s.accountActions}>
                        <button type="button" className={s.primary} onClick={() => leave(() => openAccount('sortu'))}>Sortu kontua</button>
                        <button type="button" className={s.accountSecondary} onClick={() => leave(() => openAccount('sartu'))}>Badut kontua: hasi saioa</button>
                        <button type="button" className={s.accountQuiet} onClick={finish}>Jarraitu konturik gabe</button>
                      </div>
                    </>
                  ) : (
                    <p>
                      {acc.status === 'in'
                        ? 'Saioa hasita duzu. Zure aurrerapena kontu honi lotuta gordeko da nabigatzaile honetan.'
                        : 'Saioa hasi gabe ikas dezakezu. Aurrerapena nabigatzaile honetan gordeko da. Kontuak erabilgarri daudenean, ikasle bakoitzak bere aurrerapena bereiz gorde dezake gailu berean.'}
                    </p>
                  )}
                </div>
              )}
              {!(last && acc.status === 'out') && <div className={s.actions}>
                <button className={s.primary} onClick={last ? finish : () => go(step + 1)}>
                  {last && home ? 'Ireki 17. gaia' : stop.next} <span aria-hidden="true">→</span>
                </button>
                {step === 0 && (
                  <button className={s.subtle} onClick={onReplayFilm}>Ikusi sarrera</button>
                )}
                {step === 2 && (
                  <button className={s.subtle} onClick={tryFullscreen} disabled={!simReady}>
                    Probatu pantaila osoan <span aria-hidden="true">⤢</span>
                  </button>
                )}
                {step === 3 && (kimuPhase >= 4 || kimuYours) && (
                  <button className={s.subtle} onClick={() => setKimuRun((r) => r + 1)}>
                    Ikusi berriro
                  </button>
                )}
                {step === 4 && belYours && (
                  <button className={s.subtle} onClick={() => setBelYours(false)}>
                    Ikusi berriro
                  </button>
                )}
                {step === 5 && eraYours && (
                  <button
                    className={s.subtle}
                    onClick={() => {
                      setEraPhase(0);
                      setEraYours(false);
                    }}
                  >
                    Ikusi berriro
                  </button>
                )}
                {last && home && (
                  <button className={s.subtle} onClick={() => leave()}>
                    Hasierara
                  </button>
                )}
              </div>}
              {step === 0 && <p className={s.phoneAdvice}>Ikasteko, erabili tableta edo ordenagailua ahal baduzu. Mugikorrean zaila da xehetasunak bereiztea.</p>}
            </div>
            <div className={s.art}>
              <div ref={art} className={app ? s.slot : s.stage} data-art={step} data-art-slot {...(app ? { 'data-frame-slot': '' } : {})}>
                {(step === 0 || (last && live)) && (
                  <button
                    type="button"
                    disabled={!live}
                    className={s.spin}
                    aria-label={step === 0 ? (filmV2 ? 'Biratu enbrioia' : 'Biratu aurpegia') : 'Biratu burezurra'}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                        touched.current = true;
                        setShowHint(false);
                        e.stopPropagation();
                        e.preventDefault();
                        turn.current.yaw += e.key === 'ArrowRight' ? 0.26 : -0.26;
                      }
                    }}
                    onClick={() => {
                      if (!drag.current?.moved) turn.current.yaw += 0.42;
                      drag.current = null;
                    }}
                    onPointerDown={(e) => {
                      touched.current = true;
                      setShowHint(false);
                      drag.current = { x: e.clientX, y: e.clientY, moved: false };
                      e.currentTarget.setPointerCapture(e.pointerId);
                    }}
                    onPointerMove={(e) => {
                      const d = drag.current;
                      if (!d || !e.buttons) return;
                      const dx = e.clientX - d.x,
                        dy = e.clientY - d.y;
                      if (Math.abs(dx) + Math.abs(dy) > 1) d.moved = true;
                      turn.current.yaw += dx * 0.012;
                      turn.current.pitch = Math.max(-0.75, Math.min(0.75, turn.current.pitch + dy * 0.008));
                      d.x = e.clientX;
                      d.y = e.clientY;
                    }}
                    onPointerCancel={() => {
                      drag.current = null;
                    }}
                  >
                    <span data-specimen-poster className={s.specimenPoster} />
                  </button>
                )}
                {step === 1 && <NotesPage />}
                {step === DENA && <Mosaic />}
                {step === DENA + 1 && !live && <Devices />}
              </div>
              {(step === 0 || (last && live)) && (
                <p className={s.figCaption}>
                  <span>{step === 0 ? '01. IRUDIA' : '17. GAIA'}</span>
                  <i />
                  {step === 0 ? (live && !filmV2 ? 'Aurpegiaren hastapenak, 5. astetik 10.era' : '5. asteko enbrioia') : 'Fetuaren burezurra, arku bakoitza bere kolorez'}
                  {(showHint || last) && live ? ' · Arrastatu biratzeko' : ''}
                </p>
              )}
            </div>
          </section>
        </div>
        {!opening && (
          <div className={s.frames} data-expanded={expanded && step === 2}>
            {mounted.sim && (
              <AppFrame
                src={SIM_SRC}
                shown={showing('sim')}
                label="17. gaia · Burua eta lepoa: gaiaren bidea"
                host={shell}
                frameRef={sim}
                expanded={expanded && step === 2}
                onScale={(k) => {
                  scale.current.sim = k;
                }}
                // The 3D drawn, or (no WebGL on this computer) its flat picture: either way the scene is there.
                isReady={(d) => !!d.querySelector('.viewport canvas, .viewport .stage3d-flat') && !!d.querySelector('[data-tour="play"]')}
                onReady={() => setSimReady(true)}
              >
                {cursor && step === 2 && <span className={s.ghost} data-press={fsPhase === 2} style={{ transform: `translate(${cursor.x}px, ${cursor.y}px)` }} aria-hidden />}
              </AppFrame>
            )}
            {mounted.bel && (
              <AppFrame
                src={BEL_SRC}
                shown={showing('bel')}
                label="Belortzioak · Bihotza, arteriak eta zainak"
                host={shell}
                frameRef={bel}
                onScale={(k) => {
                  scale.current.bel = k;
                }}
                isReady={(d) => d.querySelectorAll('button[class*="name"]').length > 3 && !!d.querySelector(PLATE_FIGURE)}
                onReady={() => {
                  if (bel.current?.contentWindow) framePlate(bel.current.contentWindow);
                  setBelReady(true);
                }}
              >
                {cursor && step === 4 && <span className={s.ghost} style={{ transform: `translate(${cursor.x}px, ${cursor.y}px)` }} aria-hidden />}
              </AppFrame>
            )}
            {mounted.era && (
              <AppFrame
                src={ERA_SRC}
                shown={showing('era')}
                label="Eratorriak · 18. gaia · Mapa mentalak"
                host={shell}
                frameRef={era}
                onScale={(k) => {
                  scale.current.era = k;
                }}
                isReady={(d) => !!d.querySelector(ERA_MAP)?.querySelector('[data-node]')}
                onReady={() => setEraReady(true)}
              >
                {cursor && step === 5 && <span className={s.ghost} style={{ transform: `translate(${cursor.x}px, ${cursor.y}px)` }} aria-hidden />}
              </AppFrame>
            )}
          </div>
        )}
        {expanded && step === 2 && (
          <div className={s.fsHud} role="status">
            <span>
              <kbd>⤢</kbd> edo <kbd>F</kbd> pantaila osoa
            </span>
            <i aria-hidden="true" />
            <span>
              <kbd>Esc</kbd> irteteko
            </span>
            <button type="button" onClick={() => setSimYours(true)}>
              Itxi
            </button>
          </div>
        )}
        <footer className={s.footer}>
          <nav className={s.rail} aria-label="Bidaiaren etapak">
            {STOPS.map((item, i) => (
              <button key={item.name} onClick={() => go(i)} aria-current={step === i ? 'step' : undefined} aria-label={i + 1 + '. ' + item.name} data-past={i < step}>
                <i aria-hidden="true" />
                <span>{item.name}</span>
              </button>
            ))}
          </nav>
          <div className={s.pager}>
            <button onClick={() => go(step - 1)} disabled={step === 0} aria-label="Aurreko etapa">
              ←
            </button>
            <span>
              0{step + 1} <b>/</b> 0{STOPS.length}
            </span>
            <button onClick={() => go(step + 1)} disabled={last} aria-label="Hurrengo etapa">
              →
            </button>
          </div>
        </footer>
      </div>
    </dialog>
  );
}
