// One-off: list elements whose right edge exceeds the viewport, to locate the
// true source of horizontal page overflow. Usage: node diag.mjs <file> <width>
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const file = path.resolve(process.argv[2]);
const width = Number(process.argv[3] || 390);
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width, height: 900 });
await page.goto(pathToFileURL(file).href, { waitUntil: 'networkidle' }).catch(() => {});
await page.waitForTimeout(200);

const rows = await page.evaluate((vw) => {
  const out = [];
  document.querySelectorAll('*').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    if (r.right > vw + 1) {
      const cs = getComputedStyle(el);
      out.push({
        tag: el.tagName.toLowerCase(),
        cls: String(el.className || '').slice(0, 40),
        right: Math.round(r.right),
        width: Math.round(r.width),
        minW: cs.minWidth,
        ws: cs.whiteSpace,
        ox: cs.overflowX,
        txt: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40),
      });
    }
  });
  // widest offenders first, dedupe-ish
  return out.sort((a, b) => b.right - a.right).slice(0, 12);
}, width);

console.log(`\n${path.basename(file)} @ ${width}px: innerWidth=${await page.evaluate(() => window.innerWidth)}`);
for (const r of rows) {
  console.log(`  right=${String(r.right).padStart(5)} w=${String(r.width).padStart(5)} ${r.tag}.${r.cls} [minW=${r.minW} ws=${r.ws} ox=${r.ox}] "${r.txt}"`);
}
await browser.close();
