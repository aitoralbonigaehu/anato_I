// Poster frames for the topic cards (Home, Berriak) of topics whose card scene is a 3D model: a live WebGL
// model in a 290 px card is slow to build, framed for the simulator not the card, and drags the scene's own
// overlays in. Each poster is the simulator's own frame at a chosen moment, shot on the real GPU, the
// picture's chrome hidden, cropped to the card.
//
//   node scripts/quality/topic-posters.mjs [out-dir=public/topic-shots] [--only 14,17] [--try stage@t,stage@t]
//
// With --try (one topic in --only) it shoots candidates as <out>/try-<stage>@<t>.png instead.
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

/** Topic → the simulator moment its card shows. Keep in step with TopicShot's POSTERS. */
export const POSTERS = {
  12: { stage: 'aorta-heldua', t: 0.9 },
  13: { stage: 'kaba-zainak', t: 0.45 },
  14: { stage: 'hernia-fisiologikoa', t: 0.9 },
  15: { stage: 'mesonefrosa', t: 0.95 },
  16: { stage: 'hodi-genitalak-arrak', t: 0.95 },
  17: { stage: 'faringe-arkuak', t: 0.9 },
  18: { stage: 'aurpegi-fusioa', t: 0.9 },
  19: { stage: 'gandor-neurala', t: 0.9 },
};

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args.splice(i, 2)[1] : def;
};
const only = opt('only', '');
const tries = opt('try', '');
const base = opt('base', 'http://localhost:3000');
const out = resolve(args[0] ?? 'public/topic-shots');
mkdirSync(out, { recursive: true });

// Card picture: 16:10-ish (the shelf's .lp-shot), shot at 2× its largest size.
const W = 1440, H = 900;
const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await ctx.addInitScript(() => {
  window.__perf = {};
  try { sessionStorage.setItem('enbrioatlas:kimu-animo', '1'); localStorage.setItem('enbrioatlas:ongietorri:v1', '1'); localStorage.setItem('enbrioatlas:film:v2', '1'); } catch {}
});
const page = await ctx.newPage();
// Only the model: every overlay of the picture hidden (names, legends, insets, keys), the main canvas kept.
const HIDE = `.viewport * { visibility: hidden !important; } .viewport canvas[data-poster] { visibility: visible !important; } .kimu-launch, .gida-offer, nextjs-portal { visibility: hidden !important; }`;

async function shoot(week, stage, t, file) {
  await page.goto(`${base}/astea/${week}?etapa=${stage}&une=${t}`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
  // Drawn: the renderer's coverage hook sees the subject (not the spinner, not an empty frame).
  await page.waitForFunction(() => !document.body.innerText.includes('3D eredua prestatzen') && (window.__glCoverage?.()?.cover ?? 0) > 0.02, null, { timeout: 150000, polling: 1000 }).catch(() => console.log('  (not drawn in time)', week, stage));
  await page.waitForTimeout(2500);
  await page.evaluate(() => {
    const big = [...document.querySelectorAll('.viewport canvas')].sort((a, b) => b.width * b.height - a.width * a.height)[0];
    big?.setAttribute('data-poster', '');
  });
  await page.addStyleTag({ content: HIDE });
  await page.waitForTimeout(600);
  const box = await page.locator('.viewport').first().boundingBox();
  if (!box) throw new Error(`no viewport for ${week}/${stage}`);
  // The card's shape, centred on the picture.
  const ar = 1.56;
  let w = box.width, h = w / ar;
  if (h > box.height) { h = box.height; w = h * ar; }
  const clip = { x: box.x + (box.width - w) / 2, y: box.y + (box.height - h) / 2, width: w, height: h };
  const png = join(out, file.replace(/\.webp$/, '.png'));
  await page.screenshot({ path: png, clip });
  return png;
}

const weeks = only ? only.split(',').map(Number) : Object.keys(POSTERS).map(Number);
if (tries) {
  for (const c of tries.split(',')) {
    const [stage, t] = c.split('@');
    console.log(await shoot(weeks[0], stage, Number(t), `try-${stage}@${t}.png`));
  }
} else {
  for (const w of weeks) {
    const p = POSTERS[w];
    const png = await shoot(w, p.stage, p.t, `${w}.png`);
    // 640 px wide WebP (2× the card), via Python/Pillow.
    execFileSync('python', ['-c', `from PIL import Image;im=Image.open(r'${png}').convert('RGB');im=im.resize((640,round(640*im.height/im.width)),Image.LANCZOS);im.save(r'${png.replace(/\.png$/, '.webp')}',quality=82,method=6)`]);
    console.log(w, p.stage, p.t, '→', png.replace(/\.png$/, '.webp'));
  }
}
await browser.close();
