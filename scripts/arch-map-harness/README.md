# arch-map layout harness

Headless-chromium pressure test for [`arch-map`](../../plugins/toolkit/skills/arch-map/SKILL.md)
output. Catches the mechanical layout defects the visual language is prone to:

- **SVG text overflow** — every `.title` / `.title-lg` / `.sub` `getBBox()` is
  measured against the box `<rect>` it sits in; SVG never wraps or clips, so
  any bleed is an error.
- **HTML card overflow** — `.mod`, `.fact`, `.node`, `.chip`, `code`, etc. are
  checked for `scrollWidth > clientWidth` (long unbreakable paths/tokens).
- **Horizontal page overflow** — document `scrollWidth > innerWidth` at
  1280 / 1024 / 768 / 390.

## Setup

```bash
cd scripts/arch-map-harness
npm install
npx playwright install chromium
```

## Run

```bash
# default corpus (idoso specimens under tmp/)
node check.mjs

# specific pages, with a JSON report
node check.mjs --json report.json ../../tmp/cadence-overview-idoso.html /abs/path/page.html
```

Exit code is non-zero when any ERROR-level finding exists (SVG overflow or page
overflow). HTML card overflow is reported as WARN.

## Helpers

- `diag.mjs <file> <width>` — list the elements whose right edge exceeds the
  viewport, to pinpoint the true source of a page overflow.
- `shot.mjs <file> <out.png> [selector] [width]` — screenshot a selector
  (default `svg.arch-svg`) at 2× for visual verification.
