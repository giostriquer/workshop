# arch-map layout harness (workshop only)

Maintainer tooling for developing the `arch-map` skill in this repo. **Not
part of the toolkit plugin payload** — adopters do not need it; the skill's
fit rules and shipped specimens are the contract.

Pressure-tests generated HTML for:

- SVG text overflowing its box
- HTML card overflow
- Horizontal page overflow at 1280 / 1024 / 768 / 390

## Setup

```bash
cd scripts/arch-map-harness
npm install
npx playwright install chromium
```

## Run

```bash
# default corpus: skill-shipped specimens
node check.mjs

# any page under development
node check.mjs ../../tmp/some-page.html
```
