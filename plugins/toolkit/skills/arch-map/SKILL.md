---
name: arch-map
description: Use when you need a visual architecture map of a codebase and no finished source doc exists — an existing subsystem (how it is structured today), a refactor in flight (what moves), or a proposed design (target state). Derives boxes and edges from the repo, diff, or plan, then renders a self-contained HTML page whose first job is a graphical mental model (SVG system map or before/after flow graph), followed by supporting inventory. Deep-dark "idoso" chrome (near-black gradient, glass cards, Inter + JetBrains Mono, sky accent, scarce green/red); CDNs allowed for fonts/icons/Mermaid/Tailwind. Ephemeral in tmp/ with promote-to-durable on request. NOT for rendering an existing markdown report — that is doc-to-html. Formerly structure-view.
---

# Arch Map

## Purpose

Derive an architectural representation — from the repo, a diff, or a plan —
and render a **self-contained HTML architecture map** optimized for
orientation: a graphical mental model first, then the inventory that backs it.

Sibling boundary: `doc-to-html` renders a finished document and may never
invent content; `arch-map` **authors the representation** and must trace
every element to something real (file, symbol, or diff hunk).

## When to use

Three input shapes, all doc-less:

1. **Existing subsystem** — how a part of the codebase is structured today.
2. **Refactor in flight** — branch/diff (or planned): what moves, what stays.
3. **Proposed design** — plan or conversation; target state before commit.

Not for: rendering existing markdown (use `doc-to-html`); freeform diagrams
disconnected from this repo's code, diff, or plan.

## Step 0 — house style

Glob `tmp/` and `docs/` for a hand-authored standalone `.html` architecture
page (inline styles; exclude `node_modules/`, `dist/`, etc.). **Genre test:**
structural graphics dominate (system map, layers, legend, before/after flow)
— not a `doc-to-html` report. If a sibling exists, match its tokens and
component shapes. Otherwise use the **idoso** defaults below.

Preferred specimens in this scaffold (match either):

- `tmp/cadence-overview-idoso.html` — subsystem map + inventory
- `tmp/forge-architecture-cadence-idoso.html` — refactor before/after graph

When analyzed repo ≠ output repo, glob both; **output repo sibling wins**.

## Pipeline

### 1 — Derive

Mine boxes (modules, layers, components) and edges (calls, imports, data
flow).

- **Subsystem:** entry points → modules → edges. Prefer architecture /
  dependency-rule tests first (`architecture.test`, boundary lint) — enforced
  rules beat guessed imports. Fan out explore subagents on large surfaces.
- **Refactor:** classify diff into add / remove / move / rename; state **the
  invariant** (what does *not* change).
- **Proposed design:** extract from plan; verify real references; mark the
  rest proposed (dashed).

**Traceability (load-bearing).** Every box and edge traces to a real file,
symbol, or diff hunk (path in caption/`title`). Proposed = dashed, never
silently mixed with observed.

### 2 — Choose views

At most **3 views** (plus the mandatory mental-model diagram). Each view
opens with the question it answers.

| Piece | Question | Form |
|---|---|---|
| **Mental model** (required) | "How do I hold this in my head?" | SVG layered system map, *or* for refactors a Today\|Target flow graph (chips + connectors) |
| Containment / layers | "How is it organized?" | Stacked glass bands + module cards |
| Flow | "How does data / control move?" | HTML connector steps |
| Before / after | "What does this change?" | Linked compare panes (large refactors) |
| Delta | "What does this change?" | One canvas, good/bad/dim chips (small refactors) |

Deriving more than you show is fine. Name unchosen views in the intro — do
not draw a fourth diagram.

### 3 — Render

Single HTML file (CDNs allowed: Inter/JetBrains fonts, Lucide, Mermaid,
optional Tailwind for layout grids). Default:
`tmp/<YYYY-MM-DD>-<slug>.html`. **Promote** on request: re-verify traces,
full checklist, move to `docs/`. **English only** for all UI chrome and
copy.

## Visual language — idoso (rigid defaults)

### Deep dark + glass

Near-black canvas with a subtle sky neon at the top; panels are translucent
glass, not flat Cursor `#181818` chrome.

```css
:root{
  --bg-gradient:radial-gradient(circle at 50% 0%,rgba(56,189,248,.08),transparent 35rem),
                linear-gradient(180deg,#020408 0%,#050811 100%);
  --bg:#020408;
  --surface:rgba(10,15,26,.85);
  --raised:rgba(0,0,0,.45);
  --ink:#f1f5f9; --soft:#cbd5e1; --muted:#94a3b8;
  --line:rgba(255,255,255,.07); --line-strong:rgba(255,255,255,.12);
  --accent:#38bdf8; --accent-wash:rgba(14,165,233,.16);
  --ok:#34d399; --ok-wash:rgba(6,78,59,.4);
  --no:#fb7185; --no-wash:rgba(136,19,55,.4);
  --sans:"Inter",system-ui,sans-serif;
  --mono:"JetBrains Mono",ui-monospace,Consolas,monospace;
  --radius:16px; --wire:#94a3b8;
}
body{margin:0;background:var(--bg-gradient);color:var(--ink);font:16px/1.55 var(--sans);min-height:100vh}
.glass-card{
  background:rgba(10,15,26,.75);
  border:1px solid rgba(255,255,255,.07);
  box-shadow:0 20px 50px rgba(0,0,0,.7);
  backdrop-filter:blur(20px);
}
code{
  font-family:var(--mono);font-size:.86em;
  background:rgba(10,15,26,.9);border:1px solid var(--line-strong);
  border-radius:6px;padding:.08em .4em;color:#7dd3fc;
}
```

Fonts: **Inter** (UI) + **JetBrains Mono** (paths/chips) via Google Fonts.
No Source Serif. Lucide CDN for icons. Mermaid when needed (theme below).

**Body text is `--ink` / `--soft`.** Use `--muted` for captions/paths only —
never mid-grey paragraphs on black.

### Color scarcity

- Sky accent (`#38bdf8` / `#7dd3fc`) for chrome, protocol tags, emphasis wires,
  section numbers, sticky-nav brand.
- Emerald eyebrow pill + green/red **only** for ✓/✕, refactor good/bad,
  Today/Target panel chrome.
- **No role rainbow** (do not paint modules entry/domain/infra/ext).

### Page skeleton

**Subsystem pages**

1. Sticky glass pill TOC (optional on short pages)
2. Glass hero: emerald eyebrow + large Inter title + lede + fact tiles
3. **§ Mental model** — SVG system map in a glass stage (+ optional Mermaid)
4. Supporting inventory (stack, layers, rules, flows, …)
5. Provenance footer

**Refactor pages**

1. Glass hero (eyebrow + title + lede + fact tiles)
2. **Today | Target** compare panes (the graph) — load-bearing
3. Rule card + migration stages (or other supporting views)
4. Provenance footer

A page that skips the graphical mental model / compare graph fails the
skill.

### Mental-model SVG (subsystem)

Layered bands (`.band`), boxes (`.box` / `.box-emph` process owners /
`.box-ext` dashed external), wires + markers, lane labels. ★ for spawn
owners.

```css
.arch-svg .band{fill:rgba(0,0,0,.45);stroke:rgba(255,255,255,.07)}
.arch-svg .box{fill:#050811;stroke:rgba(255,255,255,.2);stroke-width:1.25}
.arch-svg .box-emph{fill:rgba(14,165,233,.22);stroke:#38bdf8;stroke-width:1.75}
.arch-svg .box-ext{fill:rgba(0,0,0,.55);stroke:#94a3b8;stroke-dasharray:5 4}
.arch-svg .title{fill:#f1f5f9;font-weight:700}
.arch-svg .sub,.arch-svg .lane-label{fill:#94a3b8;font-family:var(--mono)}
.arch-svg .wire{stroke:#94a3b8;stroke-width:1.75;fill:none}
.arch-svg .wire-accent{stroke:#38bdf8;stroke-width:2.25}
.arch-svg .wire-label{fill:#cbd5e1;font-family:var(--mono);font-weight:600}
```

### Refactor chrome (Today | Target)

Glass panes with rose/emerald borders (not a 2px top bar alone). Chips +
HTML connectors carry the graph. State the **invariant** above or in the
lede.

```css
.panel{background:var(--surface);border:1px solid var(--line);border-radius:18px;
  padding:22px 20px;box-shadow:0 20px 50px rgba(0,0,0,.55);backdrop-filter:blur(20px)}
.panel-today{border-color:rgba(244,63,94,.28)}
.panel-target{border-color:rgba(52,211,153,.28)}
.chip{font:500 11px/1.3 var(--mono);padding:3px 8px;border-radius:9999px;
  border:1px solid var(--line-strong);background:var(--raised);color:var(--soft)}
.chip-good{border-color:rgba(52,211,153,.35);background:var(--ok-wash);color:#a7f3d0}
.chip-bad{border-color:rgba(244,63,94,.35);background:var(--no-wash);color:#fecdd3}
.chip-dim{opacity:.45;color:var(--muted)}
.protocol-tag{font:600 11px var(--mono);padding:2px 8px;border-radius:9999px;
  border:1px solid rgba(56,189,248,.3);background:rgba(56,189,248,.1);color:#7dd3fc}
```

### Flows

Prefer vertical HTML connectors (line + pill label + arrow). Use Mermaid for
dense import/dependency graphs only.

## Process rules

- **Traceability** — no invented boxes/edges; proposed dashed.
- **Provenance** — every view footed with derived-from + commit; hashes via
  live `git rev-parse` at generation time (analyzed repo when cross-repo).
- **View economy** — mental model + ≤3 supporting views.
- **Zoom** — ~30 visible boxes per view; group beyond that.
- **Invariant** — required on refactor pages.
- **Language** — English only for all generated chrome and copy.
- **One pass; direction change = clean rewrite; one knob at a time.**

## Pre-finish checklist

1. Parse-check HTML / inline JS (`new Function` on script bodies).
2. Mental-model graphic present (SVG map *or* Today|Target flow graph).
3. Legend covers every shape/stroke style used on diagrams.
4. Contrast: body text is `--ink` or `--soft`, not `--muted`.
5. No role-rainbow paints on modules.
6. Every edge endpoint resolves to a rendered id (or deliberate caption /
   band adjacency).
7. Provenance present; hashes live-read.
8. Spot-check 3 box paths against the repo.
9. Views within cap; refactor pages state the invariant.
10. Sticky TOC (if present) works; stacks at phone width; print stylesheet
    present when the page is long.
11. No non-English UI chrome.

## Reference markup (load-bearing scraps)

CDN head:

```html
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config={darkMode:'class',theme:{extend:{fontFamily:{
    sans:['Inter','sans-serif'],mono:['JetBrains Mono','monospace']}}}}
</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<script src="https://unpkg.com/lucide@0.469.0"></script>
<script type="module">
  import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
  mermaid.initialize({
    startOnLoad:true, theme:"dark",
    themeVariables:{
      darkMode:true, background:"#050811", primaryColor:"#082f49",
      primaryTextColor:"#e5edf7", primaryBorderColor:"#38bdf8",
      secondaryColor:"#1e293b", tertiaryColor:"#020408",
      lineColor:"#38bdf8", secondaryTextColor:"#cbd5e1",
      tertiaryTextColor:"#94a3b8",
      fontFamily:"Inter, system-ui, sans-serif", fontSize:"15px"
    },
    flowchart:{curve:"basis", padding:18, nodeSpacing:40, rankSpacing:52}
  });
</script>
```

Glass hero + fact tiles:

```html
<header class="hero glass-card">
  <p class="eyebrow"><i data-lucide="git-branch"></i> Target architecture</p>
  <h1>One door to the stack</h1>
  <p class="lede">Short orientation. <strong>Key nouns</strong> emphasized.
    Paths as <code>engine.getStackConfig()</code>.</p>
  <dl class="facts">
    <div class="fact"><dt>Door</dt><dd><code>getStackConfig()</code></dd></div>
    <div class="fact"><dt>Verified</dt><dd><code>abc1234</code></dd></div>
  </dl>
</header>
```

```css
.hero{padding:28px;border-radius:24px}
.eyebrow{display:inline-flex;align-items:center;gap:8px;font:600 12px/1 var(--mono);
  letter-spacing:.08em;text-transform:uppercase;color:#34d399;padding:6px 12px;
  border-radius:999px;background:rgba(52,211,153,.1);border:1px solid rgba(52,211,153,.3)}
.hero h1{font:800 40px/1.1 var(--sans);letter-spacing:-.03em;margin:12px 0;color:#f8fafc}
.fact{background:rgba(0,0,0,.55);border:1px solid var(--line);border-radius:14px;padding:12px 14px}
.fact dt{font:700 11px/1 var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
```

Module card + layer band (neutral):

```html
<div class="layer">
  <div class="layer-head"><h3>Browser · src/web/</h3><span class="hint">contracts only</span></div>
  <div class="mods">
    <div class="mod" id="spa" title="src/web/App.tsx">
      <h4>App shell</h4><div class="path">App.tsx · main.tsx</div>
      <p class="cap">Three always-mounted tabs.</p>
    </div>
  </div>
</div>
```

```css
.layer{background:var(--surface);border:1px solid var(--line);padding:16px 18px}
.layer-head h3{font:700 12px/1 var(--mono);letter-spacing:.08em;text-transform:uppercase;color:#e2e8f0;margin:0}
.mod{background:var(--raised);border:1px solid var(--line);border-radius:12px;padding:10px 12px}
.mod h4{font:700 14.5px/1.25 var(--sans);margin:0 0 3px;color:var(--ink)}
.mod .path{font:500 12px/1.3 var(--mono);color:var(--muted)}
.mod .cap{margin:7px 0 0;font-size:13px;color:var(--soft)}
```

Rule verdicts:

```html
<div class="rule ok"><span class="mark">✓</span><div class="body">
  <strong><code>src/web/</code> → <code>contracts.ts</code> only</strong>
  <p>No database, filesystem, or capability imports in the browser.</p>
</div></div>
```

```css
.rule{display:flex;gap:12px;background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:12px 14px}
.rule.ok{border-left:3px solid var(--ok);background:var(--ok-wash);border-color:rgba(52,211,153,.28)}
.rule.no{border-left:3px solid var(--no);background:var(--no-wash);border-color:rgba(244,63,94,.28)}
.rule .mark{font:700 14px/1 var(--mono)}
.rule.ok .mark{color:var(--ok)} .rule.no .mark{color:var(--no)}
```

HTML flow connector:

```html
<div class="conn"><div class="conn-line"></div>
  <div class="conn-label">POST /api/resource/action</div>
  <div class="conn-line"></div><div class="conn-arrow"></div></div>
```

```css
.conn{display:flex;flex-direction:column;align-items:center;padding:.35rem 0}
.conn-line{width:2px;min-height:8px;background:var(--line-strong)}
.conn-label{font:600 11px/1.3 var(--mono);color:#7dd3fc;background:rgba(10,15,26,.95);
  border:1px solid rgba(56,189,248,.3);border-radius:9999px;padding:2px 12px;margin:3px 0}
.conn-arrow{border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid var(--muted)}
.conn-good .conn-line{background:rgba(52,211,153,.55)}
.conn-good .conn-arrow{border-top-color:var(--ok)}
.conn-bad .conn-line{background:rgba(244,63,94,.55)}
.conn-bad .conn-arrow{border-top-color:var(--no)}
```

Worked specimens (copy structure + tokens):

- Subsystem: `tmp/cadence-overview-idoso.html`
- Refactor graph: `tmp/forge-architecture-cadence-idoso.html`

## Suggested invocation

- Map how the plugin system is structured. → subsystem: derive, mental
  model SVG, layers, `tmp/` page
- Show what this refactor branch actually moves. → diff, invariant,
  Today|Target panes
- Draw the target architecture we just discussed. → proposed (dashed) +
  verified real pieces
- Make this page shareable. → promote
- This diagram is too crowded. → zoom: group boxes, not smaller fonts
