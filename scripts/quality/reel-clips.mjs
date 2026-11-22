// The homepage showreel's clips (components/shell/HeroReel.tsx): the simulator's own 3D, recorded on the real GPU.
// A live WebGL model on the homepage would cost seconds of startup (shaders, meshes); a short H.264 clip costs a
// download, decoded by the GPU. Each clip is a stage's overview (the whole stage played in 8 s, the simulator's own
// "aurrebista"), every overlay hidden, cropped to the scene frame (1000:640), plus WebPs of its first frame (shown
// before the first clip plays) and its last (the still for reduced motion).
//
//   node scripts/quality/reel-clips.mjs [--base http://localhost:3000] [--only 18-aurpegi-fusioa,...]
//
// Needs Microsoft Edge (or EDGE=<path to a Chromium browser>) with a real GPU, ffmpeg on PATH and Python + Pillow.
// Keep CLIPS in step with HeroReel's PICKS.
import { createRequire } from 'node:module';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

export const CLIPS = [
  { week: 18, stage: 'aurpegi-fusioa' },
  { week: 17, stage: 'lehen-arkua-kartilagoak' },
  { week: 19, stage: 'gandor-neurala' },
  { week: 18, stage: 'aho-sabai-gandorrak' },
  { week: 17, stage: 'faringe-arkuak' },
  { week: 18, stage: 'txano-kanpai' },
];

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args.splice(i, 2)[1] : def;
};
const base = opt('base', 'http://localhost:3000');
const only = opt('only', '');
const out = resolve(opt('out', 'public/reel'));
mkdirSync(out, { recursive: true });

// From 0.7 s into the overview (the still picture of the whole embryo before the flight into the subject: the same
// in every clip) to its end and a breath on its last frame.
const SKIP = 0.7;
const SECONDS = 8.2;
const FPS = 30;
const OUT_W = 1120; // 2× the reel's widest CSS size, near enough
const EDGE = process.env.EDGE || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const browser = await chromium.launch({ executablePath: EDGE, headless: false, args: ['--ignore-gpu-blocklist'] });
// Every overlay hidden; the canvas kept, and the groups the 3D layer follows (it draws nothing for a hidden group).
const HIDE = `.viewport * { visibility: hidden !important; } .viewport .viewport-underlay canvas, .viewport svg g:has(.stage3d), .viewport .stage3d { visibility: visible !important; } .kimu-launch, .gida-offer, nextjs-portal { visibility: hidden !important; }`;

async function record({ week, stage }) {
  const name = `${week}-${stage}`;
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await ctx.addInitScript(() => {
    for (const k of ['enbrioatlas:ongietorri:v1', 'enbrioatlas:film:v2-plus', 'enbrioatlas:intro']) localStorage.setItem(k, '1');
    localStorage.setItem('enbrioatlas:asks', '0');
    localStorage.setItem('enbrioatlas:fsAsk', '0');
    sessionStorage.setItem('enbrioatlas:kimu-animo', '1');
    // No voice: the overview runs on its own clock.
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: undefined });
    // The virtual clock: off (real time) until __vtStart, then frames run only when __vtStep says.
    const realRaf = window.requestAnimationFrame.bind(window), realCaf = window.cancelAnimationFrame.bind(window), realNow = performance.now.bind(performance);
    const vt = { on: false, base: 0, t: 0, q: new Map(), id: 1e9 };
    window.requestAnimationFrame = (cb) => {
      if (!vt.on) return realRaf(cb);
      const i = vt.id++;
      vt.q.set(i, cb);
      return i;
    };
    window.cancelAnimationFrame = (i) => (i >= 1e9 ? vt.q.delete(i) : realCaf(i));
    performance.now = () => (vt.on ? vt.base + vt.t : realNow());
    window.__vtStart = () => { vt.base = realNow(); vt.t = 0; vt.on = true; };
    window.__vtStep = (ms) => {
      vt.t += ms;
      const due = [...vt.q.values()];
      vt.q.clear();
      for (const cb of due) try { cb(vt.base + vt.t); } catch (e) { console.error(e); }
    };
  });
  const page = await ctx.newPage();
  await page.goto(`${base}/astea/${week}?etapa=${stage}&une=0`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => !!document.querySelector('.stage3d.is-gl') && !document.body.innerText.includes('3D eredua prestatzen'), null, { timeout: 150000, polling: 250 });
  await page.waitForTimeout(2000);
  await page.addStyleTag({ content: HIDE });
  await page.waitForTimeout(400);
  const box = await page.locator('.viewport').first().boundingBox();
  if (!box) throw new Error(`no viewport for ${name}`);
  const ar = 1000 / 640;
  let w = box.width, h = w / ar;
  if (h > box.height) { h = box.height; w = h * ar; }
  const crop = { x: Math.round(box.x + (box.width - w) / 2), y: Math.round(box.y + (box.height - h) / 2), w: Math.floor(w / 2) * 2, h: Math.floor(h / 2) * 2 };

  // Frame by frame on a virtual clock (the page's animation frames and performance.now are stepped from here, exactly
  // 1/30 s apart), each frame a screenshot: smooth however slow the capture, and the same every run.
  const dir = join(tmpdir(), `reel-${name}-${Date.now()}`);
  mkdirSync(dir, { recursive: true });
  await page.evaluate(() => window.__vtStart());
  await page.locator('[data-tour="play"]').first().click();
  await page.waitForTimeout(150);
  for (let f = 0; f < Math.round(SKIP * FPS) * 2; f++) {
    await page.evaluate((ms) => window.__vtStep(ms), 500 / FPS);
    await page.waitForTimeout(10);
  }
  const N = Math.round(SECONDS * FPS);
  for (let f = 0; f < N; f++) {
    // Two half steps: the playback clock moves, React commits, then the 3D layer draws the new frame.
    for (let k = 0; k < 2; k++) {
      await page.evaluate((ms) => window.__vtStep(ms), 500 / FPS);
      await page.waitForTimeout(20);
    }
    await page.screenshot({ path: join(dir, `f${String(f).padStart(5, '0')}.png`), clip: { x: crop.x, y: crop.y, width: crop.w, height: crop.h } });
  }
  await ctx.close();
  const mp4 = join(out, `${name}.mp4`);
  const vf = `scale=${OUT_W}:-2:flags=lanczos,format=yuv420p`;
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', join(dir, 'f%05d.png'), '-vf', vf, '-c:v', 'libx264', '-preset', 'slow', '-crf', '22', '-tune', 'animation', '-movflags', '+faststart', '-an', mp4]);
  // The opening frame (the homepage shows the first clip's before it plays) and the still: the clip's last frame.
  const first = join(dir, 'first.png');
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', mp4, '-frames:v', '1', first]);
  execFileSync('python', ['-c', `from PIL import Image;im=Image.open(r'${first}').convert('RGB');im.save(r'${join(out, `${name}.first.webp`)}',quality=80,method=6)`]);
  const png = join(dir, 'last.png');
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-sseof', '-0.1', '-i', mp4, '-frames:v', '1', '-update', '1', png]);
  execFileSync('python', ['-c', `from PIL import Image;im=Image.open(r'${png}').convert('RGB');im.save(r'${join(out, `${name}.webp`)}',quality=80,method=6)`]);
  if (!process.env.REEL_DEBUG) rmSync(dir, { recursive: true, force: true }); else console.log('frames in', dir);
  console.log(name, `${N} frames`, '→', mp4);
}

// --only takes any <week>-<stage> (to try a stage before it joins CLIPS).
const list = only ? only.split(',').map((x) => ({ week: Number(x.split('-')[0]), stage: x.slice(x.indexOf('-') + 1) })) : CLIPS;
for (const c of list) await record(c);
await browser.close();
