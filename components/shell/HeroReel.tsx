'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, useSyncExternalStore, type PointerEvent } from 'react';
import { getWeek } from '@/content/registry-lite';
import { hueStyle } from './topicHue';

/**
 * The simulator's own 3D, played back to back as a showreel: what the app does, shown rather than told. Each
 * clip is a stage's overview recorded on the real GPU (scripts/quality/reel-clips.mjs → public/reel/): a live
 * WebGL model here would cost the homepage seconds of startup. Each has a name written for this strip (short
 * enough for six on one line at 1280 px; the stage's full title is its tooltip). A new clip joins with one line
 * here and one in the script's CLIPS.
 */
const PICKS: { week: number; stage: string; label: string }[] = [
  { week: 18, stage: 'aurpegi-fusioa', label: 'Aurpegia' },
  { week: 17, stage: 'lehen-arkua-kartilagoak', label: 'Meckel' },
  { week: 19, stage: 'gandor-neurala', label: 'Gandorra' },
  { week: 18, stage: 'aho-sabai-gandorrak', label: 'Aho sabaia' },
  { week: 17, stage: 'faringe-arkuak', label: 'Arkuak' },
  { week: 18, stage: 'txano-kanpai', label: 'Hortzak' },
];

interface Reel {
  week: number;
  n: string;
  topic: string;
  title: string;
  label: string;
  day: string;
  clip: string;
  href: string;
}

export const REEL: Reel[] = PICKS.flatMap((p) => {
  const w = getWeek(p.week);
  const s = w?.stages.find((x) => x.id === p.stage);
  const v = s?.views[0];
  if (!w || !s || !v) return [];
  return [{ week: p.week, n: String(p.week).padStart(2, '0'), topic: w.title, title: s.title, label: p.label, day: s.day, clip: `${p.week}-${p.stage}`, href: `/astea/${p.week}?etapa=${p.stage}&ikuspegia=${v.id}` }];
});

/** The clips' length (seconds), then a rest on the last frame and a dissolve into the next. */
const CLIP = 8.2;
const HOLD = 9.4;
const FADE = 1;
const FPS = 30;
/** A clip that has not started after this long (a slow network) is passed over rather than waited for. */
const STALL = 4;

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const ease = (v: number) => {
  const x = clamp(v);
  return x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2;
};

const REDUCED = '(prefers-reduced-motion: reduce)';
const subscribe = (cb: () => void) => {
  const m = window.matchMedia(REDUCED);
  m.addEventListener('change', cb);
  return () => m.removeEventListener('change', cb);
};

interface Frame {
  i: number;
  /** Seconds into the current clip, and into the dissolve from the previous one (null when none). */
  local: number;
  prev: number | null;
  fade: number;
}

/** The hero's viewfinder: real 3D of the simulator, with a camera frame, a slow tilt that follows the pointer and a chapter strip. */
export function HeroReel({ playing = true }: { playing?: boolean }) {
  const reduced = useSyncExternalStore(subscribe, () => window.matchMedia(REDUCED).matches, () => false);
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const [f, setF] = useState<Frame>({ i: 0, local: 0, prev: null, fade: 1 });
  const box = useRef<HTMLElement>(null);
  const live = useRef({ i: 0, local: 0, prev: null as number | null, fade: 1, wait: 0 });
  const vids = useRef(new Map<string, HTMLVideoElement>());

  /** To clip k from its start: the clip left dissolves away over it. */
  const cut = (k: number) => {
    const s = live.current;
    if (k !== s.i) {
      vids.current.get(REEL[s.i].clip)?.pause();
      s.prev = s.i;
      s.i = k;
      s.fade = 0;
    }
    s.local = 0;
    s.wait = 0;
    const v = vids.current.get(REEL[k].clip);
    if (v) v.currentTime = 0;
  };
  const cutRef = useRef(cut);
  useEffect(() => {
    cutRef.current = cut;
  });

  useEffect(() => {
    const all = vids.current;
    if (reduced || !playing) {
      all.forEach((v) => v.pause());
      return;
    }
    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    if (box.current) io.observe(box.current);
    let last = performance.now();
    let acc = 0;
    const step = (now: number) => {
      raf = requestAnimationFrame(step);
      const dt = Math.max(0, Math.min(0.1, (now - last) / 1000));
      last = now;
      const s = live.current;
      const v = all.get(REEL[s.i].clip);
      if (!visible || document.hidden) {
        if (v && !v.paused) v.pause();
        return;
      }
      // The clock follows the clip while it plays (a clip still loading holds the reel, up to STALL), then runs on.
      if (v && !v.error && !v.ended && s.local < CLIP - 0.05 && s.wait < STALL) {
        if (v.paused) void v.play().catch(() => {});
        if (v.readyState >= 2 && v.currentTime > 0) s.local = Math.max(s.local, v.currentTime);
        else s.wait += dt;
      } else s.local += dt;
      if (s.prev !== null) s.fade += dt / FADE;
      if (s.fade >= 1) {
        s.prev = null;
        s.fade = 1;
      }
      if (s.local >= HOLD) cutRef.current((s.i + 1) % REEL.length);
      acc += dt;
      if (acc < 1 / FPS) return;
      acc = 0;
      setF({ i: s.i, local: s.local, prev: s.prev, fade: s.fade });
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      all.forEach((v) => v.pause());
    };
  }, [reduced, playing]);

  const go = (k: number) => {
    cut(k);
    const s = live.current;
    setF({ i: s.i, local: s.local, prev: s.prev, fade: s.fade });
  };

  const tilt = (e: PointerEvent<HTMLElement>) => {
    const el = box.current;
    if (!el || reduced || e.pointerType === 'touch') return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--rx', `${(-y * 3.2).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${(x * 4.4).toFixed(2)}deg`);
    el.style.setProperty('--gx', `${((x + 0.5) * 100).toFixed(1)}%`);
    el.style.setProperty('--gy', `${((y + 0.5) * 100).toFixed(1)}%`);
  };
  const untilt = () => {
    const el = box.current;
    if (!el) return;
    for (const k of ['--rx', '--ry']) el.style.removeProperty(k);
  };

  const cur = REEL[f.i];
  const t = reduced ? 1 : clamp(f.local / CLIP);
  const fadeIn = ease(f.fade);
  // On the page: the clip playing, the one dissolving away, and the next once this one is under way (so it is
  // loaded when its turn comes, without competing with the first clip while the homepage opens).
  const next = (f.i + 1) % REEL.length;
  const shown = [...new Set([f.i, ...(f.prev !== null ? [f.prev] : []), ...(f.local > 2 ? [next] : [])])];
  return (
    <figure className="lp-reel" ref={box} onPointerMove={tilt} onPointerLeave={untilt} style={hueStyle(cur.week)}>
      <div className="lp-reel-tilt theme-stage">
        <div className="lp-reel-glow" aria-hidden />
        <div className="lp-reel-media" role="img" aria-label={`${cur.topic}: ${cur.title}`}>
          {/* The first clip's opening frame, in the page from the server: the frame is never empty while it loads. */}
          {!reduced && f.i === 0 && f.prev === null && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`/reel/${REEL[0].clip}.first.webp`} alt="" />
          )}
          {mounted &&
            (reduced ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`/reel/${cur.clip}.webp`} alt="" />
            ) : (
              shown.map((k) => {
                const r = REEL[k];
                const role = k === f.i ? 'cur' : k === f.prev ? 'prev' : 'next';
                return (
                  <video
                    key={r.clip}
                    ref={(el) => {
                      if (el) vids.current.set(r.clip, el);
                      else vids.current.delete(r.clip);
                    }}
                    src={`/reel/${r.clip}.mp4`}
                    muted
                    playsInline
                    preload="auto"
                    disablePictureInPicture
                    aria-hidden
                    style={{ opacity: role === 'cur' ? 1 : role === 'prev' ? 1 - fadeIn : 0, zIndex: role === 'prev' ? 1 : 0 }}
                  />
                );
              })
            ))}
        </div>
        <span className="vf vf-tl" />
        <span className="vf vf-tr" />
        <span className="vf vf-bl" />
        <span className="vf vf-br" />
        <figcaption className="lp-reel-hud" key={f.i}>
          <span className="rec" />
          <span className="lp-reel-day">{cur.day}</span>
          {/* The topic's name where the frame has room for it; its number always. */}
          <span className="lp-reel-cap" title={cur.topic}>
            <b>{cur.n}</b> <span className="lp-reel-topic">{cur.topic}</span>
            <span className="lp-reel-gaia">gaia</span>
          </span>
        </figcaption>
        <div className="hv-scrub" aria-hidden>
          <span style={{ transform: `scaleX(${t})` }} />
        </div>
      </div>

      <nav className="lp-reel-strip" aria-label="Simulagailuko eszenak">
        {REEL.map((r, k) => (
          <button key={r.n + r.title} style={hueStyle(r.week)} className={k === f.i ? 'is-on' : ''} onClick={() => go(k)} aria-current={k === f.i ? 'true' : undefined} aria-label={`${r.week}. gaia: ${r.title}`} title={`${r.week}. gaia · ${r.title}`}>
            <i aria-hidden>
              <span style={{ transform: `scaleX(${k === f.i ? clamp(f.local / HOLD) : k < f.i ? 1 : 0})` }} />
            </i>
            <small>{r.n}</small>
            <span>{r.label}</span>
          </button>
        ))}
        <Link className="lp-reel-open" href={cur.href}>
          Ireki simulagailuan <span aria-hidden>→</span>
        </Link>
      </nav>
    </figure>
  );
}
