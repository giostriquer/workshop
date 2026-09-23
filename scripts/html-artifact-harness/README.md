# HTML artifact layout harness (workshop only)

Maintainer tooling for checking HTML layout in this repo. **Not part of the
toolkit plugin payload**. The default corpus in `fixtures/` preserves two
former architecture examples as regression inputs, not as design templates
for `html-artifact`.

Pressure-tests generated HTML for:

- SVG text overflowing its box
- HTML card overflow
- Horizontal page overflow at 1280 / 1024 / 768 / 390

SVG and card checks recognize the fixtures' class vocabulary. For other pages,
passing those checks does not establish that every diagram or container was
covered. Review actual rendered content and meaningful interactive states too.
Use the browser-control tools permitted by the current host; this harness is
optional maintainer tooling, not a required skill execution path.

## Setup

```bash
cd scripts/html-artifact-harness
npm install
npx playwright install chromium
```

## Run

```bash
# inspect the exact file selection without installing or launching a browser
node check.mjs --list-files

# default corpus: retained regression fixtures
node check.mjs

# any page under development
node check.mjs ../../tmp/some-page.html
```

The default run requires both fixtures and fails if either is missing. Explicit
file selections replace the default corpus. Run the focused selection checks
with `node --test check.test.mjs`; these need only Node and do not launch a browser.
