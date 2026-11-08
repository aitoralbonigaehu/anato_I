// Quality harness for the 3D stages (docs/quality/3d-quality-bar.md): every stage of a topic shot at several
// moments into one contact sheet, with what the subject covers measured from the WebGL picture itself.
//
//   node scripts/quality/stage-sheet.mjs 15 [out-dir] [--at 0.15,0.5,0.9] [--stages a,b] [--base http://localhost:3000]
//
// A dev or production server must be running at --base. Writes <out>/index.html (open it in a browser),
// <out>/report.json and one PNG per shot. Flags per shot: `void` (the subject covers under 1.5% of the frame),
// `small` (its box spans under 38% of the picture's width and height), `edge` (it touches the picture's border:
// cut off). These are prompts to look, not verdicts: the sheet is for a person (or Claude) to judge against the bar.
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args.splice(i, 2)[1] : def;
};
const at = opt('at', '0.12,0.35,0.6,0.92').split(',').map(Number);
const only = opt('stages', '');
const base = opt('base', 'http://localhost:3000');
const gpu = opt('gl', 'swiftshader');
const [week, outArg] = args;
if (!week) throw new Error('usage: stage-sheet.mjs <week> [out-dir] [--at ...] [--stages ...] [--base ...]');
const out = resolve(outArg ?? `docs/quality/sheets/w${week}`);
mkdirSync(out, { recursive: true });

// The stages, in order, from the topic's content files (weekN.ts, weekNb.ts).
const stages = [];
for (const f of [`content/weeks/week${week}.ts`, `content/weeks/week${week}b.ts`]) {
  let src = '';
  try { src = readFileSync(f, 'utf8'); } catch { continue; }
  for (const m of src.matchAll(/^ {4}id: '([a-z0-9-]+)',$/gm)) stages.push(m[1]);
}
const list = only ? stages.filter((s) => only.split(',').includes(s)) : stages;
if (!list.length) throw new Error(`no stages found for week ${week}`);

const launchArgs = gpu === 'swiftshader' ? ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] : [];
const browser = await chromium.launch({ args: launchArgs });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => {
  // The renderer's harness hooks (coverage), and no mascot cheer over the first frame.
  window.__perf = {};
  try { sessionStorage.setItem('enbrioatlas:kimu-animo', '1'); } catch { /* storage may be off */ }
});
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message.slice(0, 300)));
const rows = [];
for (const stage of list) {
  const row = { stage, shots: [] };
  for (const u of at) {
    const file = `${stage}_${u}.png`;
    await page.goto(`${base}/astea/${week}?etapa=${stage}&une=${u}`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => !document.body.innerText.includes('3D eredua prestatzen'), null, { timeout: 120000 }).catch(() => {});
    await page.waitForTimeout(2200);
    // The hook belongs to the renderer that drew last; a view still handing over can answer null for a moment.
    let cov = null;
    for (let i = 0; i < 4 && !cov; i++) {
      cov = await page.evaluate(() => (window.__glCoverage ? window.__glCoverage() : null)).catch(() => null);
      if (!cov) await page.waitForTimeout(700);
    }
    const box = await page.locator('.stage').first().boundingBox();
    await page.screenshot({ path: join(out, file), clip: box ? { x: box.x, y: box.y, width: box.width, height: Math.min(box.height, 640) } : undefined });
    const flags = [];
    if (cov) {
      if (cov.cover < 0.015) flags.push('void');
      if (cov.box && cov.box[2] < 0.38 && cov.box[3] < 0.38) flags.push('small');
      if (cov.box && (cov.box[0] < 0.005 || cov.box[1] < 0.005 || cov.box[0] + cov.box[2] > 0.995 || cov.box[1] + cov.box[3] > 0.995)) flags.push('edge');
    } else flags.push('no-3d');
    row.shots.push({ u, file, cover: cov?.cover ?? null, box: cov?.box ?? null, flags });
    console.log(stage, u, cov ? `cover ${(cov.cover * 100).toFixed(1)}%` : 'no 3D', flags.join(' '));
  }
  rows.push(row);
}
await browser.close();

writeFileSync(join(out, 'report.json'), JSON.stringify({ date: new Date().toISOString(), week, at, base, errors, rows }, null, 2));
const cell = (s) => `<figure><img src="${s.file}" loading="lazy"><figcaption>${s.u} · ${s.cover == null ? '—' : (s.cover * 100).toFixed(1) + '%'} ${s.flags.map((f) => `<b class="${f}">${f}</b>`).join(' ')}</figcaption></figure>`;
writeFileSync(join(out, 'index.html'), `<!doctype html><meta charset="utf-8"><title>Topic ${week} stage sheet</title>
<style>body{background:#111;color:#ddd;font:13px system-ui;margin:16px}h2{font-size:14px;margin:18px 0 6px}
.row{display:grid;grid-template-columns:repeat(${at.length},1fr);gap:8px}img{width:100%;border-radius:6px;display:block}
figure{margin:0}figcaption{padding:4px 2px}b{padding:1px 6px;border-radius:8px;font-weight:600}
.void,.no-3d{background:#7f1d1d}.small{background:#854d0e}.edge{background:#1e3a8a}</style>
<h1>Topic ${week}: ${rows.length} stages × ${at.length} moments</h1>${errors.length ? `<pre>${errors.join('\n')}</pre>` : ''}
${rows.map((r) => `<h2>${r.stage}</h2><div class="row">${r.shots.map(cell).join('')}</div>`).join('\n')}`);
console.log(`\n${out}/index.html`);
