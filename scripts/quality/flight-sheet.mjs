// Quality harness for the stage changes of a topic (docs/quality/3d-quality-bar.md, "Continuity"): every
// crossing from one stage to the next, held at several moments of its move (the camera's flight between two
// models, or the glide and the pose running on when the model stays), one strip of frames per crossing.
//
//   node scripts/quality/flight-sheet.mjs 16 [out-dir] [--at 0,0.2,0.4,0.6,0.8,1] [--stages a,b] [--back] [--base http://localhost:3000]
//
// A dev or production server must be running at --base. Writes <out>/<from>.png (the strip) per crossing and
// <out>/index.html with all of them. --stages: the stages to cross FROM. --back: cross to the stage before.
// The page's own hook holds the move (`window.__flightAt`), so a slow software GPU still shows exact moments.
// CHROME: another browser binary than the one this Playwright build expects.
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

// A busy dev server (several sessions compiling at once) can take long to settle or never go idle: wait for the
// page's load, give the network a moment, and try again once before giving up.
async function open(page, url) {
  for (let attempt = 0; ; attempt++) {
    try {
      await page.goto(url, { waitUntil: 'load', timeout: 120000 });
      await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
      return;
    } catch (e) {
      if (attempt >= 1) throw e;
    }
  }
}

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  if (i < 0) return false;
  args.splice(i, 1);
  return true;
};
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args.splice(i, 2)[1] : def;
};
const at = opt('at', '0,0.2,0.4,0.6,0.8,1').split(',').map(Number);
// --dwell <ms>: stay on the stage before crossing, as a student does (the next stage's model is built meanwhile).
const dwell = Number(opt('dwell', '0'));
const only = opt('stages', '');
const base = opt('base', 'http://localhost:3000');
const gpu = opt('gl', 'swiftshader');
const vw = Number(opt('vw', '1440'));
const vh = Number(opt('vh', '900'));
const cols = Number(opt('cols', '3'));
const shrink = Number(opt('shrink', '2.25'));
const back = flag('back');
const [week, outArg] = args;
if (!week) throw new Error('usage: flight-sheet.mjs <week> [out-dir] [--at ...] [--stages ...] [--back] [--base ...]');
const out = resolve(outArg ?? `docs/quality/sheets/w${week}-flights`);
mkdirSync(out, { recursive: true });

const stages = [];
for (const f of ['', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm'].map((part) => `content/weeks/week${week}${part}.ts`)) {
  let src = '';
  try { src = readFileSync(f, 'utf8'); } catch { continue; }
  for (const m of src.matchAll(/^ {4}id: '([a-z0-9-]+)',$/gm)) stages.push(m[1]);
}
// The topic's own play order, where its index file gives one (topics 17 on sort their stages by ORDER).
try {
  const order = [...(readFileSync(`content/weeks/week${week}.ts`, 'utf8').match(/const ORDER = \[([^\]]*)\]/)?.[1] ?? '').matchAll(/'([a-z0-9-]+)'/g)].map((m) => m[1]);
  if (order.length) stages.sort((a, b) => order.indexOf(a) - order.indexOf(b));
} catch { /* no index file: file order */ }
const crossings = stages.filter((s, i) => (back ? i > 0 : i < stages.length - 1) && (!only || only.split(',').includes(s)));
if (!crossings.length) throw new Error(`no crossings found for week ${week}`);

const launchArgs = gpu === 'swiftshader' ? ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] : [];
const browser = await chromium.launch({ args: launchArgs, executablePath: process.env.CHROME || undefined });
const ctx = await browser.newContext({ viewport: { width: vw, height: vh } });
await ctx.addInitScript(() => {
  window.__perf = {};
  try { sessionStorage.setItem('enbrioatlas:kimu-animo', '1'); localStorage.setItem('enbrioatlas:ongietorri:v1', '1'); } catch { /* storage may be off */ }
});
const page = await ctx.newPage();
const sheet = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message.slice(0, 300)));
const rows = [];
for (const stage of crossings) {
  const to = stages[stages.indexOf(stage) + (back ? -1 : 1)];
  await page.bringToFront();
  await open(page, `${base}/astea/${week}?etapa=${stage}&une=${back ? 0.02 : 0.985}`);
  await page.waitForFunction(() => !document.body.innerText.includes('3D eredua prestatzen'), null, { timeout: 120000 }).catch(() => {});
  await page.waitForTimeout(2400 + dwell);
  const box = await page.locator('.stage').first().boundingBox();
  const clip = box ? { x: box.x, y: box.y, width: box.width, height: Math.min(box.height, 640) } : undefined;
  const shots = [];
  shots.push({ label: `${stage} (before)`, png: await page.screenshot({ clip }) });
  await page.evaluate((p) => { window.__flightAt = p; }, at[0]);
  await page.keyboard.press(back ? 'Shift+ArrowLeft' : 'Shift+ArrowRight');
  await page.waitForTimeout(1600);
  for (const p of at) {
    await page.evaluate((v) => { window.__flightAt = v; }, p);
    await page.waitForTimeout(p === at[0] ? 900 : 650);
    shots.push({ label: `→ ${to} · ${p}`, png: await page.screenshot({ clip }) });
  }
  await page.evaluate(() => { window.__flightAt = undefined; });
  // The strip: the frames side by side, shrunk, shot as one picture.
  const w = Math.round((clip?.width ?? vw) / shrink);
  const html = `<body style="margin:0;background:#0c0d12;font:12px system-ui;color:#cfd6e6"><div style="display:grid;grid-template-columns:repeat(${cols},${w}px);gap:6px;padding:6px">${shots
    .map((s) => `<figure style="margin:0"><img src="data:image/png;base64,${s.png.toString('base64')}" style="width:${w}px;display:block"><figcaption style="padding:2px 4px">${s.label}</figcaption></figure>`)
    .join('')}</div></body>`;
  await sheet.bringToFront();
  await sheet.setViewportSize({ width: cols * (w + 6) + 6, height: 900 });
  await sheet.setContent(html);
  const strip = `${stage}${back ? '_back' : ''}.png`;
  await sheet.locator('body > div').screenshot({ path: join(out, strip) });
  rows.push({ from: stage, to, strip });
  console.log(stage, '→', to);
}
await browser.close();
writeFileSync(
  join(out, 'index.html'),
  `<!doctype html><meta charset="utf-8"><title>Topic ${week} · stage changes</title><body style="background:#0c0d12;color:#e8eefc;font:14px system-ui;margin:16px">` +
    `<h1 style="font-size:18px">Topic ${week} · stage changes${back ? ' (backwards)' : ''}</h1>` +
    rows.map((r) => `<h2 style="font-size:14px;margin:18px 0 6px">${r.from} → ${r.to}</h2><img src="${r.strip}" style="max-width:100%">`).join('') +
    (errors.length ? `<pre>${errors.join('\n')}</pre>` : '') +
    '</body>',
);
if (errors.length) console.log('page errors:', [...new Set(errors)].slice(0, 5));
console.log(join(out, 'index.html'));
