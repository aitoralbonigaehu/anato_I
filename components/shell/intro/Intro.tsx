'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Conceptus, ConceptusDefs } from '@/components/scenes/week1/conceptus';
import { getWeek } from '@/content/registry';
import { lerp, seg } from '@/lib/sim/anim';
import { useLastPlace } from '../progress';
import { cleavageFrame, cleavageStep, ZONA } from './cleavage';

/** Seen this session (sessionStorage): the opening does not come back until the browser is reopened. */
export const INTRO_KEY = 'enbrioatlas:intro';
/** The full sequence has been seen once on this device (localStorage): later sessions get only the signature. */
export const INTRO_FULL_KEY = 'enbrioatlas:intro-full';

/**
 * The full opening, seconds — a short film in five beats, all of them from the course:
 * 1. Ernalkuntza: in the dark, under a dim microscope lamp, the oocyte in its corona radiata; a sperm swims
 *    in along a curve, its tail beating.
 * 2. Contact: a flash, the calcium wave crosses the cell, a shockwave runs out across the whole screen, the
 *    corona cells scatter and the lamp comes up.
 * 3. Segmentazioa: the zygote cleaves on the topic-1 engine — 2, 4, 8, the mulberry morula, the blastocyst —
 *    while a large day counter runs from 0. eguna to 5.
 * 4. The blastocyst turns and shrinks into the brand mark (its trophoblast ring onto the mark's ring, the inner
 *    cell mass onto the signal dot) and the name comes out of it.
 * 5. The field opens like a microscope's iris from the centre and the page comes into focus behind it, while
 *    the lockup flies into its place in the bar: the opening ends exactly where the product begins.
 */
const FULL = {
  /** The sperm's swim (start, contact). */
  swim: [0.25, 1.25] as [number, number],
  contact: 1.25,
  /**
   * Seconds → cleavage progress, on the topic-1 engine (gens 5): 0.5 zygote, 1 → 2 cells … 5 → 16
   * (morula), 6 → ~32 with outer and inner cell masses, 7 the finished blastocyst. Short holds
   * between divisions, and a beat on the finished blastocyst before it turns into the mark.
   */
  keys: [
    [1.45, 0.5],
    [2.05, 1],
    [2.45, 2],
    [2.52, 2],
    [2.86, 3],
    [2.93, 3],
    [3.25, 4],
    [3.32, 4],
    [3.64, 5],
    [3.72, 5],
    [4.05, 6],
    [4.13, 6],
    [4.7, 7],
  ] as [number, number][],
  morph: 4.85,
  morphLen: 0.95,
  draw: 5.45,
  slide: 5.7,
  tag: 6.0,
  fly: 6.85,
  end: 7.85,
};

/** Later sessions: the signature (the mark draws itself, its dot beats once, the name, a welcome back), then the iris. */
const SHORT = { swim: [-1, -1] as [number, number], contact: -1, draw: 0.05, slide: 0.55, tag: 0.75, fly: 1.6, end: 2.45 };

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (v: number) => {
  const x = clamp(v);
  return x * x * (3 - 2 * x);
};
const outCubic = (v: number) => 1 - (1 - clamp(v)) ** 3;
const inOut = (v: number) => {
  const x = clamp(v);
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
};

const progressAt = (keys: [number, number][], s: number) => {
  if (s <= keys[0][0]) return 0;
  for (let i = 1; i < keys.length; i++) {
    const [s1, p1] = keys[i];
    const [s0, p0] = keys[i - 1];
    if (s <= s1) return p0 + ((p1 - p0) * (s - s0)) / (s1 - s0);
  }
  return keys[keys.length - 1][1];
};

/**
 * The conceptus exactly as topic 1 draws it (same engine, same palette: blastomeres, zona pellucida,
 * green trophoblast, blue inner cell mass), staged as the Segmentation and Blastocyst scenes stage it:
 * loose round blastomeres that compact into a mulberry morula (flat contacts, no bridges), then the
 * zona is lost and the blastocoel opens inside a closed trophoblast with the inner cell mass at one pole.
 */
const ROT = 43; // embryonic pole up, as in the Blastocyst scene
const conceptusAt = (p: number, wobble: number) => {
  const f = cleavageFrame(p, wobble, 5);
  const blast = clamp(p - 6);
  const morula = 1 - seg(p, 6, 6.3);
  if (p > 6) f.zonaO = (1 - 0.62 * seg(blast, 0.01, 0.11)) * (1 - seg(blast, 0.155, 0.2));
  const press = seg(p, 3.83, 4.36);
  return {
    f,
    relief: lerp(0.6, 1, seg(p, 2.71, 3.83)) * morula,
    press: press * morula,
    bumps: Math.max(0, 12 * seg(p, 3, 3.83) - 9 * press + 6 * seg(p, 4.43, 5) - 2 * seg(p, 5.57, 6)) * morula,
    mass: p > 6 ? 1 : seg(p, 5.57, 6),
    polar: 1 - seg(p, 4.83, 5.29),
  };
};

/** Out-of-focus cells drifting in the dark field, around the specimen (seeded: the same every time). */
const BOKEH = (() => {
  let a = 0x9e3779b9;
  const rnd = () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return Array.from({ length: 34 }, () => {
    const depth = rnd();
    return { x: rnd() * 100, y: rnd() * 100, r: 6 + depth * 46, o: 0.05 + (1 - depth) * 0.1, dx: (rnd() - 0.5) * 3, dy: -1 - rnd() * 2.5, warm: rnd() > 0.55 };
  });
})();

/** The day the counter shows at each point of the cleavage (the notes' days). */
const dayAt = (p: number) => (p < 1 ? 0 : p < 4 ? 1 + (2 * (p - 1)) / 3 : p < 5 ? 3 : p < 6 ? 4 : 4 + (p - 6));

/** The HUD line, in the notes' words. */
const stepAt = (p: number) => (p < 5 ? cleavageStep(p) : p < 6 ? { name: 'Morula · 32 zelula inguru', day: '4. eguna' } : { name: 'Blastozistoa', day: '4.–5. egunak' });

/** The blastocyst's outer edge (engine units), if the engine gives no outline. */
const BLASTO_R = 142;
/** The brand mark (32-unit box): ring radius and the signal dot, as in icons.tsx BrandMark. */
const MARK_RING = 14;
const DOT_ANGLE = (Math.atan2(21.3 - 16, 22.3 - 16) * 180) / Math.PI;

const readFull = () => {
  try {
    return window.localStorage.getItem(INTRO_FULL_KEY) === '1';
  } catch {
    return false;
  }
};

/**
 * Opening title sequence. Full once per device, a 2-second signature in later sessions, nothing again
 * in the same session, nothing at all with reduced motion (flag set before paint in the root layout).
 * Any key or click skips.
 */
export function Intro({ onDone, onOut, full: forceFull }: { onDone: () => void; /** The veil starts to lift: the page can begin its own reveal underneath (a cross-dissolve, not a gap). */ onOut?: () => void; /** Replay asked for: always the full sequence. */ full?: boolean }) {
  const [s, setS] = useState(0);
  const [leaving, setLeaving] = useState(false);
  // Decided once, on the client, before the first frame runs (the overlay paints black until then).
  const [full, setFull] = useState<boolean | null>(null);
  // Where the lockup lands: the page bar's wordmark (measured when the flight starts).
  const [home, setHome] = useState<{ x: number; y: number; k: number; ink: string } | null>(null);
  const lock = useRef<HTMLDivElement>(null);
  // Layout the motion needs (read after mount, and again if the window changes size).
  const [geo, setGeo] = useState<{ lockW: number; markW: number; stage: number; vw: number; vh: number } | null>(null);
  // The bar wordmark's own proportions (mark and gap per em of its type, which change with the page
  // width): the lockup copies them, so the flight's one uniform scale lands it exactly on it.
  const [prop, setProp] = useState<{ mark: number; gap: number } | null>(null);
  const done = useRef(false);
  const last = useLastPlace();
  const lastWeek = last ? getWeek(last.week) : undefined;
  const cb = useRef(onDone);
  const outCb = useRef(onOut);
  const outSent = useRef(false);
  useEffect(() => {
    cb.current = onDone;
    outCb.current = onOut;
  });
  const lift = useCallback(() => {
    if (outSent.current) return;
    outSent.current = true;
    outCb.current?.();
  }, []);

  const finish = useCallback(() => {
    if (done.current) return;
    done.current = true;
    try {
      sessionStorage.setItem(INTRO_KEY, '1');
      // Seen (or skipped) once: from the next session on, only the signature.
      window.localStorage.setItem(INTRO_FULL_KEY, '1');
    } catch {}
    document.documentElement.dataset.intro = 'seen';
    cb.current();
  }, []);

  const skip = useCallback(() => {
    lift();
    setLeaving(true);
    window.setTimeout(finish, 420);
  }, [finish, lift]);

  // The flight's target, from the real layout: the lockup and the bar's wordmark share proportions,
  // so one uniform scale lands it pixel on pixel.
  const measure = useCallback(() => {
    const a = lock.current?.getBoundingClientRect();
    const b = document.querySelector('.land-nav .wordmark')?.getBoundingClientRect();
    if (!a || !b || !a.width || !b.width) return null;
    const ink = getComputedStyle(document.querySelector('.land-nav .wordmark') as Element).color;
    return { x: b.left - a.left, y: b.top + b.height / 2 - (a.top + a.height / 2), k: b.width / a.width, ink };
  }, []);

  useEffect(() => {
    // Already seen this session, or reduced motion.
    if (document.documentElement.dataset.intro === 'seen') {
      finish();
      return;
    }
    // Development only: ?intro-at=<seconds> (and &intro=short) freezes the opening at one moment, to inspect frames.
    const q = process.env.NODE_ENV !== 'production' ? new URLSearchParams(window.location.search) : null;
    const frozen = q?.get('intro-at') ? Number(q.get('intro-at')) : null;
    const isFull = q?.get('intro') === 'short' ? false : forceFull || !readFull() || frozen !== null;
    const T = isFull ? FULL : SHORT;
    let raf = 0;
    let flying = false;
    let started = false;
    const t0 = performance.now();
    const step = (now: number) => {
      const t = frozen ?? (now - t0) / 1000;
      if (!started) {
        started = true;
        setFull(isFull);
        const w = document.querySelector('.land-nav .wordmark');
        const fs = w ? parseFloat(getComputedStyle(w).fontSize) : 0;
        const mk = w?.querySelector('svg')?.getBoundingClientRect().width ?? 0;
        if (w && fs && mk) setProp({ mark: mk / fs, gap: (parseFloat(getComputedStyle(w).columnGap) || 0) / fs });
      }
      setS(t);
      if (t >= T.fly && !flying) {
        flying = true;
        setHome(measure());
        lift();
      }
      if (frozen !== null) return;
      if (t >= T.end) finish();
      else raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        skip();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey);
    };
  }, [finish, skip, lift, measure, forceFull]);

  useEffect(() => {
    if (full === null) return;
    const read = () => {
      const el = lock.current;
      if (!el) return;
      setGeo({ lockW: el.offsetWidth, markW: el.querySelector('svg')?.getBoundingClientRect().width ?? 0, stage: Math.min(window.innerHeight * 0.76, window.innerWidth * 0.88), vw: window.innerWidth, vh: window.innerHeight });
    };
    read();
    window.addEventListener('resize', read);
    return () => window.removeEventListener('resize', read);
  }, [full, prop]);

  // The inner cell mass's bearing in the finished blastocyst: the turn brings it onto the mark's dot.
  // …and its outer edge, which lands on the mark's ring.
  const blastoR = useMemo(() => {
    let r = 0;
    for (const c of cleavageFrame(7, 0, 5).cells) for (const q of c.shape?.pts ?? []) r = Math.max(r, Math.hypot(q[0], q[1]));
    return r || BLASTO_R;
  }, []);
  const turn = useMemo(() => {
    const f = cleavageFrame(7, 0, 5);
    const icm = f.cells.filter((c) => c.fate === 'enbrioblasto' || c.kind === 'enbrioblasto');
    if (!icm.length) return 0;
    const x = icm.reduce((n, c) => n + (c.shape?.cx ?? c.x), 0) / icm.length;
    const y = icm.reduce((n, c) => n + (c.shape?.cy ?? c.y), 0) / icm.length;
    let d = DOT_ANGLE - ((Math.atan2(y, x) * 180) / Math.PI + ROT);
    while (d <= -180) d += 360;
    while (d > 180) d -= 360;
    // Always turn the same way, and enough to read as a gesture.
    return d < 60 ? d + 360 : d;
  }, []);

  const T = full ? FULL : SHORT;
  const fly = inOut((s - T.fly) / (T.end - T.fly - 0.05));
  // The field opens like a microscope's iris from the centre; the lockup stays solid until it has landed.
  const iris = inOut((s - T.fly - 0.05) / (T.end - T.fly - 0.1));
  const veil = 1 - smooth((s - T.end + 0.35) / 0.3);
  const irisR = Math.max(0, iris * Math.hypot(geo?.vw ?? 1600, geo?.vh ?? 1000) * 1.08 - 40);

  // ——— 1–2. Fertilisation (full only) ———
  const [sw0, sw1] = T.swim;
  const swimU = full ? clamp((s - sw0) / (sw1 - sw0)) : 0;
  const swimming = full && s > sw0 - 0.1 && s < T.contact + 0.12;
  const since = full ? s - T.contact : -1;
  const flash = since >= 0 ? Math.exp(-since * 5.5) : 0;
  const wave = since >= 0 ? clamp(since / 0.9) : 0;
  const shock = since >= 0 ? clamp(since / 1.25) : 0;
  const corona = full ? 1 - smooth(since / 1.1) : 0;

  // ——— 3. Cleavage ———
  const p = full ? progressAt(FULL.keys, s) : 7;
  const m = full ? inOut((s - FULL.morph) / FULL.morphLen) : 1;
  const art = full && m < 1 ? conceptusAt(p, s) : null;
  const cstep = s < T.contact ? { name: 'Ernalkuntza', day: '0. eguna' } : stepAt(p);
  // The lamp: dim while the sperm swims, up with the contact.
  const lamp = full ? 0.35 * outCubic(s / 0.9) + 0.65 * outCubic(since / 0.6) : 1;
  const hud = full ? smooth((s - 0.2) / 0.6) * (1 - smooth((s - FULL.morph) / 0.4)) : 0;
  const day = s < T.contact ? 0 : dayAt(p);

  // ——— 4. Signature: ring, then the C drawn in one stroke, then the dot ———
  const ring = full ? smooth((m - 0.55) / 0.45) : smooth((s - T.draw) / 0.35);
  const arc = outCubic((s - T.draw) / 0.55);
  const dot = full ? smooth((m - 0.7) / 0.3) : smooth((s - T.draw - 0.35) / 0.25);
  const bump = Math.sin(Math.PI * clamp((s - T.draw - (full ? 0 : 0.35)) / 0.45));
  const pop = 1 + 0.35 * bump;
  // The inner cell mass lands as the signal dot with one soft flare of light, and one heartbeat ripple.
  const glow = dot > 0 ? Math.sin(Math.PI * clamp((s - T.draw - (full ? 0.05 : 0.35)) / 0.9)) : 0;
  const beat = clamp((s - T.draw - (full ? 0.15 : 0.45)) / 0.9);
  const slide = inOut((s - T.slide) / 0.6);
  const tag = smooth((s - T.tag) / 0.5) * (1 - smooth((s - T.fly) / 0.3));

  // The mark is centred on screen first, then the lockup slides left as the name comes out of it.
  const markW = geo?.markW ?? 0;
  const centre = (((geo?.lockW ?? 0) - markW) / 2) * (1 - slide);
  const lockTf = home
    ? `translate(${home.x * fly}px, ${home.y * fly}px) scale(${1 + (home.k - 1) * fly})`
    : fly > 0
      ? undefined
      : `translateX(${centre}px)`;
  const lockOpacity = !home && fly > 0 ? 1 - fly : 1;

  // The blastocyst turns and shrinks onto the mark (its outer ring onto the mark's ring).
  const target = geo ? ((MARK_RING / 32) * geo.markW) / ((blastoR / 430) * geo.stage) : 0.2;
  const push = 0.94 + 0.08 * clamp(s / FULL.morph);
  const scale = push * Math.pow(target / push, m);

  // The sperm: a curve from the lower left onto the zona; the head leads, the tail beats behind it.
  const contactAt: [number, number] = [-ZONA * 0.82, ZONA * 0.62];
  const from: [number, number] = [-470, 360];
  const ctrl: [number, number] = [-420, -40];
  const bez = (u: number): [number, number] => {
    const v = 1 - u;
    return [v * v * from[0] + 2 * v * u * ctrl[0] + u * u * contactAt[0], v * v * from[1] + 2 * v * u * ctrl[1] + u * u * contactAt[1]];
  };
  const eu = outCubic(swimU) * 0.985 + 0.015 * swimU;
  const head = bez(eu);
  const ahead = bez(Math.min(1, eu + 0.01));
  const dir = Math.atan2(ahead[1] - head[1], ahead[0] - head[0]);
  const tail: string = (() => {
    const pts: string[] = [];
    const n = 22;
    for (let k = 0; k <= n; k++) {
      const d = k * 4.2;
      const bx = head[0] - Math.cos(dir) * d;
      const by = head[1] - Math.sin(dir) * d;
      const amp = 2 + k * 0.42;
      const w = Math.sin(k * 0.62 - s * 26) * amp * (since >= 0 ? Math.exp(-since * 6) : 1);
      pts.push(`${(bx - Math.sin(dir) * w).toFixed(1)},${(by + Math.cos(dir) * w).toFixed(1)}`);
    }
    return `M${pts.join('L')}`;
  })();

  // Returning: a word of welcome and where they left off.
  const lastStage = lastWeek?.stages.find((x) => x.id === last?.stage);
  const welcome = full === false ? (lastWeek ? `Ongi etorri berriro · ${lastStage ? `${lastStage.title}, ` : ''}${lastWeek.week}. gaia` : 'Ongi etorri berriro') : 'Giza garapena, zelulaz zelula';

  // The iris opens round the mark and travels with it to the bar: the logo pulls the page open behind it.
  const vw = geo?.vw ?? 1440;
  const vh = geo?.vh ?? 900;
  const kNow = home ? 1 + (home.k - 1) * fly : 1;
  const irisX = (vw - (geo?.lockW ?? 0)) / 2 + (home ? home.x * fly : 0) + ((geo?.markW ?? 0) / 2) * kNow;
  const irisY = vh / 2 + (home ? home.y * fly : 0);
  const veilMask = iris > 0 ? `radial-gradient(circle at ${irisX}px ${irisY}px, transparent ${irisR}px, #000 ${irisR + 160}px)` : undefined;

  return (
    <div className={`intro${leaving ? ' is-leaving' : ''}${full === false ? ' is-short' : ''}`} onClick={skip} role="dialog" aria-label="Sarrera">
      <div className="intro-veil" style={{ opacity: veil, WebkitMaskImage: veilMask, maskImage: veilMask }}>
        {/* Out-of-focus cells in the dark field: they drift, and catch the light at the contact. */}
        {full && (
          <div className="intro-bokeh" aria-hidden style={{ opacity: smooth(s / 1.2) * (1 - smooth((s - T.fly) / 0.6)) }}>
            {BOKEH.map((b, i) => (
              <i
                key={i}
                style={{
                  left: `${b.x + b.dx * s}%`,
                  top: `${b.y + b.dy * s}%`,
                  width: b.r * 2,
                  height: b.r * 2,
                  opacity: b.o * (1 + 2.2 * flash),
                  background: b.warm ? 'radial-gradient(circle, rgba(255,190,150,0.9), rgba(255,190,150,0) 70%)' : 'radial-gradient(circle, rgba(170,200,255,0.8), rgba(170,200,255,0) 70%)',
                }}
              />
            ))}
          </div>
        )}
        {/* The contact lights the whole field for an instant. */}
        {full && flash > 0.02 && <div className="intro-bloom" aria-hidden style={{ opacity: 0.22 * flash }} />}
        {/* The shockwave of fertilisation runs out across the whole field. */}
        {full && shock > 0 && shock < 1 && (
          <div
            className="intro-shock"
            aria-hidden
            style={{ width: `${20 + shock * 260}vmax`, height: `${20 + shock * 260}vmax`, opacity: (1 - shock) * 0.55 }}
          />
        )}
      </div>

      {art && (
        <div
          className="intro-stage"
          style={{
            transform: `rotate(${turn * m}deg) scale(${scale})`,
            opacity: smooth(s / 0.5) * (1 - smooth((m - 0.62) / 0.38)),
          }}
        >
          <svg viewBox="-215 -215 430 430" aria-hidden overflow="visible">
            <ConceptusDefs id="inc" />
            <defs>
              {/* The microscope lamp: a warm pool of light that falls off into the dark field. */}
              <radialGradient id="inc-lamp">
                <stop offset="0" stopColor="#f3dcc2" stopOpacity="0.16" />
                <stop offset="0.6" stopColor="#f3dcc2" stopOpacity="0.05" />
                <stop offset="1" stopColor="#f3dcc2" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="inc-flash">
                <stop offset="0" stopColor="#fff6e8" stopOpacity="1" />
                <stop offset="0.35" stopColor="#ffd9a8" stopOpacity="0.55" />
                <stop offset="1" stopColor="#ff9a6a" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="inc-head">
                <stop offset="0" stopColor="#ffffff" />
                <stop offset="1" stopColor="#cfe0ff" />
              </radialGradient>
              <clipPath id="inc-cell">
                <circle r={ZONA - 2} />
              </clipPath>
            </defs>
            <circle r={214} fill="url(#inc-lamp)" opacity={lamp} />
            <g opacity={0.45 + 0.55 * lamp}>
              <Conceptus f={art.f} x={0} y={0} s={1} rot={ROT} id="inc" corona={corona} polar={art.polar} mass={art.mass} relief={art.relief} press={art.press} bumps={art.bumps} />
            </g>
            {/* The calcium wave: from the entry point across the cell. */}
            {wave > 0 && wave < 1 && (
              <g clipPath="url(#inc-cell)">
                <circle cx={contactAt[0]} cy={contactAt[1]} r={wave * ZONA * 2.2} fill="none" stroke="#ffe3b8" strokeWidth={10 * (1 - wave) + 2} opacity={0.7 * (1 - wave)} />
              </g>
            )}
            {/* The flash at the contact. */}
            {flash > 0.01 && <circle cx={contactAt[0]} cy={contactAt[1]} r={50 + 200 * (1 - flash)} fill="url(#inc-flash)" opacity={flash} />}
            {/* The sperm. */}
            {swimming && (
              <g opacity={smooth((s - sw0 + 0.1) / 0.3) * (since > 0 ? 1 - smooth(since / 0.12) : 1)}>
                <path d={tail} fill="none" stroke="#cfe0ff" strokeOpacity={0.25} strokeWidth={5} strokeLinecap="round" />
                <path d={tail} fill="none" stroke="#eef4ff" strokeWidth={1.6} strokeLinecap="round" />
                <ellipse cx={head[0]} cy={head[1]} rx={6.5} ry={4.2} fill="url(#inc-head)" transform={`rotate(${(dir * 180) / Math.PI} ${head[0]} ${head[1]})`} />
                <circle cx={head[0]} cy={head[1]} r={16} fill="url(#inc-flash)" opacity={0.25} />
              </g>
            )}
          </svg>
        </div>
      )}

      <div
        className="intro-lock"
        ref={lock}
        style={{
          transform: lockTf,
          opacity: lockOpacity,
          // In flight it takes the bar's own ink, so it reads on the page the iris opens onto (paper or dark).
          color: home && fly > 0 ? `color-mix(in oklab, ${home.ink} ${Math.round(smooth(fly * 3) * 100)}%, #f5f2ec)` : undefined,
          ...(prop ? { gap: `${prop.gap}em`, ['--mark-em' as string]: `${prop.mark}em` } : null),
        }}
      >
        <svg viewBox="0 0 32 32" aria-hidden className="intro-mark">
          <circle cx="16" cy="16" r={MARK_RING} fill="none" stroke="currentColor" strokeOpacity={0.35 * ring} strokeWidth="1.2" />
          <path d="M21.2 10.4a7.4 7.4 0 1 0 0.9 10.6" pathLength={1} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeDasharray="1 1" strokeDashoffset={1 - arc} opacity={arc > 0 ? 1 : 0} />
          <defs>
            <radialGradient id="intro-glow">
              <stop offset="0" stopColor="var(--signal, #ff6a3d)" stopOpacity="0.55" />
              <stop offset="1" stopColor="var(--signal, #ff6a3d)" stopOpacity="0" />
            </radialGradient>
          </defs>
          {glow > 0.01 && <circle cx="22.3" cy="21.3" r={5 + 5 * glow} fill="url(#intro-glow)" opacity={glow} />}
          {/* One heartbeat: a ring runs out from the dot. */}
          {beat > 0 && beat < 1 && <circle cx="22.3" cy="21.3" r={2 + 14 * outCubic(beat)} fill="none" stroke="var(--signal, #ff6a3d)" strokeWidth={0.8 * (1 - beat)} opacity={1 - beat} />}
          <circle cx="22.3" cy="21.3" r={2 * dot * (dot < 1 ? pop : 1)} fill="var(--signal, #ff6a3d)" />
        </svg>
        <span className="intro-name" style={{ clipPath: slide < 1 ? `inset(-0.3em ${(1 - slide) * 100}% -0.3em 0)` : undefined }}>
          <span style={{ transform: slide < 1 ? `translateX(${-(1 - slide) * 0.6}em)` : undefined, opacity: smooth(slide * 1.6), filter: slide < 1 ? `blur(${(1 - slide) * 6}px)` : undefined }}>
            Enbrio<b>Atlas</b>
          </span>
        </span>
      </div>
      <p className="intro-tag" style={{ opacity: tag, transform: `translateY(${(1 - smooth((s - T.tag) / 0.5)) * 8}px)`, letterSpacing: `${0.34 - 0.12 * smooth((s - T.tag) / 0.8)}em` }}>
        {welcome}
      </p>

      {full && (
        <>
          <div className="intro-hud" style={{ opacity: hud }}>
            <span className="intro-day">
              <b key={Math.floor(day)}>{Math.floor(day)}</b>
              <small>. eguna</small>
            </span>
            <span className="intro-step">
              <span className="rec intro-rec" /> {cstep.name}
            </span>
          </div>
          <p className="intro-src" style={{ opacity: hud }}>
            1. gaia · Ernalkuntza, segmentazioa eta blastozistoa
          </p>
        </>
      )}

      <button
        className="intro-skip"
        style={{ opacity: 1 - iris }}
        onClick={(e) => {
          e.stopPropagation();
          skip();
        }}
      >
        Saltatu <kbd>Esc</kbd>
      </button>
      <div className="intro-progress" style={{ transform: `scaleX(${clamp(s / T.end)})`, opacity: 1 - iris }} />
    </div>
  );
}
