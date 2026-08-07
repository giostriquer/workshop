#!/usr/bin/env node
// arch-map layout pressure-test harness.
// Loads each arch-map HTML page in headless chromium and reports mechanical
// layout defects: SVG text overflowing its box, HTML content overflowing its
// container, and horizontal page overflow — across several viewport widths.
//
// Usage:
//   node check.mjs <file-or-glob> [more...]   (defaults to skill-shipped specimens)
//   node check.mjs --json report.json <files...>
//
// Workshop-only maintainer tooling — not part of the plugin payload.
// Exit code is non-zero when any ERROR-level finding exists.

import { chromium } from 'playwright';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { globSync } from 'node:fs';
import fs from 'node:fs';
import path from 'node:path';

const WIDTHS = [1280, 1024, 768, 390];
const SVG_PAD = 5;      // user-unit slack allowed inside a box before it counts as overflow
const HTML_TOL = 1;     // px slack for scrollWidth vs clientWidth

function parseArgs(argv) {
  const files = [];
  let jsonOut = null;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--json') { jsonOut = argv[++i]; continue; }
    files.push(argv[i]);
  }
  return { files, jsonOut };
}

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_CORPUS = [
  path.resolve(HERE, '../../plugins/toolkit/skills/arch-map/references/subsystem-specimen.html'),
  path.resolve(HERE, '../../plugins/toolkit/skills/arch-map/references/refactor-specimen.html'),
];

function resolveFiles(patterns) {
  if (!patterns.length) return DEFAULT_CORPUS.filter(fs.existsSync);
  const out = [];
  for (const p of patterns) {
    const hits = globSync(p, { windowsPathsNoEscape: true });
    if (hits.length) out.push(...hits.map((h) => path.resolve(h)));
    else if (fs.existsSync(p)) out.push(path.resolve(p));
    else console.error(`! no match for ${p}`);
  }
  return [...new Set(out)];
}

// Runs in the page. Returns SVG-text-vs-box overflow findings (width-independent).
function collectSvgFindings(pad) {
  const findings = [];
  const svgs = [...document.querySelectorAll('svg.arch-svg')];
  svgs.forEach((svg, si) => {
    const vb = (svg.getAttribute('viewBox') || '0 0 0 0').split(/\s+/).map(Number);
    const vbW = vb[2] || 0;
    const rects = [...svg.querySelectorAll('rect.box, rect.box-emph, rect.box-ext')].map((r) => ({
      x: +r.getAttribute('x'), y: +r.getAttribute('y'),
      w: +r.getAttribute('width'), h: +r.getAttribute('height'),
    }));
    const texts = [...svg.querySelectorAll('text.title, text.title-lg, text.sub')];
    texts.forEach((t) => {
      let bb;
      try { bb = t.getBBox(); } catch { return; }
      const cx = bb.x + bb.width / 2, cy = bb.y + bb.height / 2;
      const cand = rects
        .filter((r) => cx >= r.x && cx <= r.x + r.w && cy >= r.y - 2 && cy <= r.y + r.h + 2)
        .sort((a, b) => a.w * a.h - b.w * b.h);
      const r = cand[0];
      const label = (t.textContent || '').trim().slice(0, 60);
      if (r) {
        const overRight = (bb.x + bb.width) - (r.x + r.w - pad);
        const overLeft = (r.x + pad) - bb.x;
        const over = Math.max(overRight, overLeft, 0);
        if (over > 0.5) {
          findings.push({
            type: 'svg-text-overflow', level: 'ERROR', svgIndex: si, label,
            detail: `text width ${bb.width.toFixed(0)}u exceeds box ${r.w}u by ${over.toFixed(1)}u`,
          });
        }
      } else if (vbW && bb.x + bb.width > vbW - 2) {
        findings.push({
          type: 'svg-text-past-viewbox', level: 'ERROR', svgIndex: si, label,
          detail: `text right edge ${(bb.x + bb.width).toFixed(0)}u past viewBox width ${vbW}u`,
        });
      }
    });
  });
  return findings;
}

// Runs in the page at a given width. Returns HTML overflow findings.
function collectHtmlFindings(tol) {
  const findings = [];
  const de = document.scrollingElement || document.documentElement;
  const pageOver = de.scrollWidth - window.innerWidth;
  if (pageOver > tol) {
    findings.push({ type: 'page-overflow', level: 'ERROR',
      detail: `document scrollWidth ${de.scrollWidth} exceeds viewport ${window.innerWidth} by ${pageOver}px` });
  }
  const sel = '.mod, .fact, .node, .conn-label, .chip, .layer-head h3, .hero h1, .rule .body strong, code, .protocol-tag, .pill, .tag';
  const seen = new Set();
  document.querySelectorAll(sel).forEach((el) => {
    const cs = getComputedStyle(el);
    if (cs.overflowX === 'auto' || cs.overflowX === 'scroll') return;
    const over = el.scrollWidth - el.clientWidth;
    if (over > tol) {
      const txt = (el.textContent || '').trim().slice(0, 50);
      const key = el.className + '|' + txt;
      if (seen.has(key)) return; seen.add(key);
      findings.push({ type: 'html-overflow', level: 'WARN',
        selector: (el.tagName.toLowerCase() + '.' + String(el.className).split(' ').join('.')).slice(0, 60),
        label: txt, detail: `content overflows by ${over}px (scroll ${el.scrollWidth} > client ${el.clientWidth})` });
    }
  });
  return findings;
}

async function main() {
  const { files: pats, jsonOut } = parseArgs(process.argv.slice(2));
  const files = resolveFiles(pats);
  if (!files.length) { console.error('No files to check.'); process.exit(2); }

  const browser = await chromium.launch();
  const report = [];
  let errorCount = 0;

  for (const file of files) {
    const url = pathToFileURL(file).href;
    const fileFindings = [];

    const page = await browser.newPage();
    await page.setViewportSize({ width: WIDTHS[0], height: 900 });
    await page.goto(url, { waitUntil: 'networkidle' }).catch(() => page.goto(url));
    await page.waitForTimeout(250); // let fonts settle

    // SVG check once (getBBox is CSS-scale independent)
    for (const f of await page.evaluate(collectSvgFindings, SVG_PAD)) fileFindings.push({ width: 'any', ...f });

    // HTML checks per width
    for (const w of WIDTHS) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.waitForTimeout(120);
      for (const f of await page.evaluate(collectHtmlFindings, HTML_TOL)) fileFindings.push({ width: w, ...f });
    }
    await page.close();

    const errs = fileFindings.filter((f) => f.level === 'ERROR').length;
    errorCount += errs;
    report.push({ file, findings: fileFindings });

    const name = path.basename(file);
    if (!fileFindings.length) { console.log(`\n\u2713 ${name} — clean`); continue; }
    console.log(`\n\u2717 ${name} — ${fileFindings.length} finding(s), ${errs} error(s)`);
    for (const f of fileFindings) {
      const tag = f.level === 'ERROR' ? 'ERR ' : 'warn';
      const w = f.width === 'any' ? '   ' : String(f.width).padStart(4);
      const where = f.label ? ` "${f.label}"` : (f.selector ? ` ${f.selector}` : '');
      console.log(`  [${tag}] @${w} ${f.type}${where} — ${f.detail}`);
    }
  }

  await browser.close();

  if (jsonOut) {
    fs.writeFileSync(jsonOut, JSON.stringify(report, null, 2));
    console.log(`\nJSON report → ${jsonOut}`);
  }

  const total = report.reduce((n, r) => n + r.findings.length, 0);
  console.log(`\n${'='.repeat(52)}\n${files.length} file(s) · ${total} finding(s) · ${errorCount} error(s)`);
  process.exit(errorCount ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(2); });
