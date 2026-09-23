// Screenshot a selector (default the mental-model SVG) for visual verification.
// Usage: node shot.mjs <file> <out.png> [selector] [width]
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const file = path.resolve(process.argv[2]);
const out = path.resolve(process.argv[3]);
const selector = process.argv[4] || 'svg.arch-svg';
const width = Number(process.argv[5] || 1280);

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 2 });
await page.setViewportSize({ width, height: 1000 });
await page.goto(pathToFileURL(file).href, { waitUntil: 'networkidle' }).catch(() => {});
await page.waitForTimeout(300);
if (selector === 'full') {
  await page.screenshot({ path: out, fullPage: true });
} else {
  const el = await page.$(selector);
  if (el) await el.screenshot({ path: out });
  else await page.screenshot({ path: out, fullPage: true });
}
console.log(`shot → ${out}`);
await browser.close();
