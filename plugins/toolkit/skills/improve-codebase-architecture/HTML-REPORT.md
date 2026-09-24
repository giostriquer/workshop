# HTML Report Format

The architectural review is rendered as a single self-contained HTML file in the OS temp directory. It works offline: inline CSS, inline SVG and plain HTML diagrams, no scripts and no CDN, so a blocked network, a strict content policy or an SRI hook cannot leave it unstyled or missing its diagrams. It opens in dark mode. SVG graphs handle the graph-shaped diagrams; hand-built divs handle the more editorial visuals (mass diagrams, cross-sections). Mix the two: don't draw every candidate as the same boxes-and-arrows, it'll start to look generic.

## Scaffold

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Architecture review for {{repo name}}</title>
    <style>
      :root {
        color-scheme: dark;
        --bg: #111316; --panel: #1a1d22; --line: #2e333b;
        --text: #e7e5e4; --muted: #a8a29e;
        --accent: #34d399; /* Strong badge, the deep module */
        --warn: #fbbf24;   /* Worth exploring badge, ADR callouts */
        --leak: #f87171;   /* leakage edges */
        --spec: #94a3b8;   /* Speculative badge */
      }
      body { margin: 0; background: var(--bg); color: var(--text); font: 16px/1.6 system-ui, sans-serif; }
      main { max-width: 64rem; margin: 0 auto; padding: 3rem 1rem; display: grid; gap: 3rem; }
      h1, h2 { font-family: Georgia, serif; font-weight: 600; }
      article { background: var(--panel); border: 1px solid var(--line); border-radius: 12px; padding: 1.5rem; }
      .files { font: 0.85rem/1.5 ui-monospace, monospace; color: var(--muted); }
      .badge { display: inline-block; border: 1px solid currentColor; border-radius: 999px; padding: 0 0.6rem; font-size: 0.8rem; }
      .strong { color: var(--accent); } .explore { color: var(--warn); } .speculative { color: var(--spec); }
      .before-after { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
      @media (max-width: 720px) { .before-after { grid-template-columns: 1fr; } }
      .label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; }
      .adr { border-left: 3px solid var(--warn); padding-left: 0.75rem; }
      svg { width: 100%; height: auto; color: var(--text); }
      svg .seam { stroke-dasharray: 4 4; }
      svg .leak { stroke: var(--leak); }
      svg .deep { stroke-width: 3; }
    </style>
  </head>
  <body>
    <main>
      <header>...</header>
      <section id="candidates">...</section>
      <section id="top-recommendation">...</section>
    </main>
  </body>
</html>
```

## Header

Repo name, date, and a compact legend: solid box = module, dashed line = seam, red arrow = leakage, thick box = deep module. No introduction paragraph. Straight into the candidates.

## Candidate card

The diagrams carry the weight. Prose is sparse, plain, and uses the glossary terms (from the `codebase-design` skill) without ceremony.

Each candidate is one `<article>`:

- **Title**: short, names the deepening (e.g. "Collapse the Order intake pipeline").
- **Badge row**: recommendation strength (`Strong` = green, `Worth exploring` = amber, `Speculative` = slate), plus a tag for the dependency category (`in-process`, `local-substitutable`, `ports & adapters`, `mock`).
- **Files**: monospaced list with the `file:line` evidence from the traced path, `class="files"`.
- **Before / After diagram**: the centrepiece. Two columns, side by side. See patterns below.
- **Problem**: one sentence. What hurts.
- **Solution**: one sentence. What changes.
- **Wins**: bullets, ≤6 words each. e.g. "Tests hit one interface", "Pricing logic stops leaking", "Delete 4 shallow wrappers".
- **Gaps** (if any): one line naming what the trace could not settle.
- **ADR callout** (if applicable): one line in an amber-bordered box.

No paragraphs of explanation. If the diagram needs a paragraph to be understood, redraw the diagram.

## Diagram patterns

Pick the pattern that fits the candidate. Mix them. Don't make every diagram look the same. Variety is part of the point.

### SVG graph (the workhorse for dependencies / call flow)

Use an inline SVG graph when the point is "X calls Y calls Z, and look at the mess." Modules are `<rect>`s with `<text>` labels, calls are `<line>`s or `<path>`s ending in an arrow marker, leakage edges carry `class="leak"` and seams `class="seam"`. The same drawing works for "before: 6 round-trips; after: 1" sequences.

```html
<svg viewBox="0 0 340 120" role="img" aria-labelledby="c1-before">
  <title id="c1-before">Before: order intake passes through three shallow modules and leaks into pricing</title>
  <defs>
    <marker id="arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L8,4 L0,8 z" fill="currentColor" />
    </marker>
  </defs>
  <g fill="none" stroke="currentColor">
    <rect x="4" y="20" width="96" height="32" rx="4" />
    <rect x="122" y="20" width="96" height="32" rx="4" />
    <rect x="240" y="20" width="96" height="32" rx="4" />
    <rect x="240" y="80" width="96" height="32" rx="4" />
    <line x1="100" y1="36" x2="120" y2="36" marker-end="url(#arrow)" />
    <line x1="218" y1="36" x2="238" y2="36" marker-end="url(#arrow)" />
    <line class="leak" x1="170" y1="52" x2="238" y2="94" marker-end="url(#arrow)" />
  </g>
  <g fill="currentColor" font-size="9" text-anchor="middle" letter-spacing="0.08em">
    <text x="52" y="40">ORDERHANDLER</text>
    <text x="170" y="40">ORDERVALIDATOR</text>
    <text x="288" y="40">ORDERREPO</text>
    <text x="288" y="100">PRICINGCLIENT</text>
  </g>
</svg>
```

Size the `viewBox` around the longest label, keep labels clear of edges and crossings, and give every SVG a `<title>` that states its takeaway.

### Hand-built boxes-and-arrows (when an SVG graph reads too uniform)

Modules as `<div>`s with borders and labels. Arrows as inline SVG `<line>` or `<path>` elements positioned absolutely over a relative container. Reach for this when you want the "after" diagram to feel like one thick-bordered deep module with greyed-out internals, which a graph of equal boxes won't render with the right weight.

### Cross-section (good for layered shallowness)

Stack horizontal bands (a fixed height with a thick left border) to show the modules a call passes through. Before: 6 thin bands each doing nothing. After: 1 thick band labelled with the consolidated responsibility.

### Mass diagram (good for "interface as wide as implementation")

Two rectangles per module: one for interface surface area, one for implementation. Before: interface rectangle is nearly as tall as the implementation rectangle (shallow). After: interface rectangle is short, implementation rectangle is tall (deep).

### Call-graph collapse

Before: a tree of function calls rendered as nested boxes. After: the same tree collapsed into one box, with the now-internal calls shown faded inside it.

## Style guidance

- Lean editorial, not corporate-dashboard. Generous whitespace. Serif optional for headings.
- Colour sparingly: one accent (green) plus red for leakage and amber for warnings, all from the `:root` tokens.
- Keep diagrams ~320px tall so before/after sits comfortably side by side without scrolling; below 720px wide the two columns stack.
- Use the small uppercase `.label` style for module labels inside diagrams, so they read as schematic, not as UI.
- No `<script>` and no external resources. The report is static and must render the same with the network off.

## Top recommendation section

One larger card. Candidate name, one sentence on why, anchor link to its card. That's it.

## Tone

Plain English, concise, but the architectural nouns and verbs come straight from the `codebase-design` skill. Concision is not an excuse to drift.

**Use exactly:** module, interface, implementation, depth, deep, shallow, seam, adapter, leverage, locality.

**Never substitute:** component, service, unit (for module) · API, signature (for interface) · boundary (for seam) · layer, wrapper (for module, when you mean module).

**Phrasings that fit the style:**

- "Order intake module is shallow: interface nearly matches the implementation."
- "Pricing leaks across the seam."
- "Deepen: one interface, one place to test."
- "Two adapters justify the seam: HTTP in prod, in-memory in tests."

**Wins bullets** name the gain in glossary terms: *"locality: bugs concentrate in one module"*, *"leverage: one interface, N call sites"*, *"interface shrinks; implementation absorbs the wrappers"*. Don't write *"easier to maintain"* or *"cleaner code"*, because those terms aren't in the glossary and don't earn their place.

No hedging, no throat-clearing, no "it's worth noting that…". If a sentence could be a bullet, make it a bullet. If a bullet could be cut, cut it. If a term isn't in the `codebase-design` glossary, reach for one that is before inventing a new one.
