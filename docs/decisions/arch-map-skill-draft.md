> **Shipped 2026-08-05 as `arch-map`.** Canonical copy:
> `plugins/toolkit/skills/arch-map/SKILL.md`. This file is the pre-ship draft
> retained for archaeology (same body as ship day, with parked banner).
> Decision: `arch-map-rename-and-visual.md`. Historical design notes remain
> under `structure-view.md` / deprecated origin.

---
name: arch-map
description: Use when you need a visual architecture map of a codebase and no finished source doc exists — an existing subsystem (how it is structured today), a refactor in flight (what moves), or a proposed design (target state). Derives boxes and edges from the repo, diff, or plan, then renders a self-contained HTML page whose first job is a graphical mental model (SVG system map), followed by supporting inventory. Cursor-like dark high-contrast chrome; scarce color (accent + good/bad only); CDNs allowed for fonts/icons/Mermaid. Ephemeral in tmp/ with promote-to-durable on request. NOT for rendering an existing markdown report — that is doc-to-html. Formerly structure-view.
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
structural graphics dominate (system map, layers, legend) — not a
`doc-to-html` report. If a sibling exists, match its tokens and component
shapes. Otherwise use the defaults below (specimen:
`tmp/architecture-overview.html`).

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
| **Mental model** (required) | "How do I hold this in my head?" | SVG layered system map (+ optional Mermaid import-rule graph) |
| Containment / layers | "How is it organized?" | Stacked bands + module cards |
| Flow | "How does data / control move?" | HTML connector steps or swimlanes |
| Before / after | "What does this change?" | Linked compare panes (large refactors) |
| Delta | "What does this change?" | One canvas, good/bad/dim chips (small refactors) |

Deriving more than you show is fine. Name unchosen views in the intro — do
not draw a fourth diagram.

### 3 — Render

Single HTML file (CDNs allowed for fonts, Lucide, Mermaid). Default:
`tmp/<YYYY-MM-DD>-<slug>.html`. **Promote** on request: re-verify traces,
full checklist, move to `docs/`.

## Visual language (rigid defaults)

### Cursor-like dark, high contrast

```css
:root{
  --bg:#181818; --surface:#1e1e1e; --raised:#252526;
  --ink:#ececec; --soft:#d4d4d4; --muted:#a0a0a0;
  --line:#2b2b2b; --line-strong:#3c3c3c;
  --accent:#3794ff; --accent-wash:#1a2f4a;
  --ok:#89d185; --ok-wash:#1b2a1c;
  --no:#f14c4c; --no-wash:#2a1818;
  --wire:#8b8b8b;
  --sans:"Source Sans 3","Segoe UI",system-ui,sans-serif;
  --serif:"Source Serif 4",Georgia,serif;
  --mono:"JetBrains Mono",ui-monospace,Consolas,monospace;
}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.55 var(--sans)}
```

Fonts via Google Fonts CDN; icons via Lucide CDN; Mermaid via jsDelivr when
needed. **Primary text is `--ink` / `--soft` — never mid-grey body on black.**

### Color scarcity

- Accent for sticky nav chrome, emphasis wires, section numbers.
- Green/red **only** for rule verdicts (✓/✕) and refactor good/bad.
- **No role rainbow** (do not paint every module entry/domain/infra/ext).

### Page skeleton (required order)

1. Sticky TOC
2. Hero (eyebrow + title + lede) + optional facts grid
3. **§ Mental model** — SVG system map (bands Browser → API → capabilities →
   infra → external) with dependency arrows; legend; optional Mermaid
   "what may import what"
4. Supporting sections as needed: stack, layers, rules, capabilities, API,
   flows, data, scripts
5. Provenance footer(s)

A page that skips (3) fails the skill — inventory without a diagram is the
failure mode this skill exists to prevent.

### Mental-model SVG pattern

Layered horizontal bands (`.band`), boxes (`.box` / `.box-emph` for process
owners / `.box-ext` dashed for external), wires with markers, lane labels.
Process owners that may spawn children call out with ★. Keep ~one ink
weight for titles (`#ececec`) and readable subs (`#a0a0a0`).

### Refactor chrome

Today/After compare panes: top border bad/good; chips `chip-good` /
`chip-bad` / `chip-dim`; HTML connectors preferred over SVG webs. State the
invariant above the panes.

### Flows

Prefer vertical HTML connectors (line + pill label + arrow) for sequential
paths. Use Mermaid when the story is a dense import/dependency graph.

## Process rules

- **Traceability** — no invented boxes/edges; proposed dashed.
- **Provenance** — every view footed with derived-from + commit; hashes via
  live `git rev-parse` at generation time (analyzed repo when cross-repo).
- **View economy** — mental model + ≤3 supporting views.
- **Zoom** — ~30 visible boxes per view; group beyond that.
- **Invariant** — required on refactor pages.
- **One pass; direction change = clean rewrite; one knob at a time.**

## Pre-finish checklist

1. Parse-check HTML / inline JS (`new Function` on script bodies).
2. Mental-model SVG present and legible at a glance (bands + arrows).
3. Legend covers every shape/stroke style used on the diagram.
4. Contrast: body text is `--ink` or `--soft`, not `--muted`.
5. No role-rainbow paints on modules.
6. Every edge endpoint resolves to a rendered id (or relation is a deliberate
   caption / band adjacency).
7. Provenance present; hashes live-read.
8. Spot-check 3 box paths against the repo.
9. Views within cap; refactor pages state the invariant.
10. Sticky TOC works; stacks at phone width; print stylesheet present.

## Reference markup (load-bearing scraps)

CDN head:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Source+Sans+3:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Source+Serif+4:opsz,wght@8..60,600;8..60,700&display=swap" rel="stylesheet">
<script src="https://unpkg.com/lucide@0.469.0"></script>
<script type="module">
  import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
  mermaid.initialize({
    startOnLoad:true, theme:"dark",
    themeVariables:{
      darkMode:true, background:"#1e1e1e", primaryColor:"#2a2d2e",
      primaryTextColor:"#ececec", primaryBorderColor:"#3c3c3c",
      lineColor:"#3794ff", fontFamily:"Source Sans 3, system-ui, sans-serif", fontSize:"15px"
    },
    flowchart:{curve:"basis", padding:18, nodeSpacing:40, rankSpacing:52}
  });
</script>
```

Module card + layer band (neutral — no role colors):

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
.layer-head h3{font:700 12px/1 var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--ink);margin:0}
.mod{background:var(--raised);border:1px solid var(--line);border-radius:6px;padding:10px 12px}
.mod h4{font:700 14.5px/1.25 var(--sans);margin:0 0 3px;color:var(--ink)}
.mod .path{font:500 12px/1.3 var(--mono);color:var(--muted)}
.mod .cap{margin:7px 0 0;font-size:13px;color:var(--soft)}
```

Rule verdicts (only green/red on the page besides accent):

```html
<div class="rule ok"><span class="mark">✓</span><div class="body">
  <strong><code>src/web/</code> → <code>contracts.ts</code> only</strong>
  <p>No database, filesystem, or capability imports in the browser.</p>
</div></div>
```

```css
.rule{display:flex;gap:12px;background:var(--surface);border:1px solid var(--line);border-radius:8px;padding:12px 14px}
.rule.ok{border-left:3px solid var(--ok);background:var(--ok-wash)}
.rule.no{border-left:3px solid var(--no);background:var(--no-wash)}
.rule .mark{font:700 14px/1 var(--mono)}
.rule.ok .mark{color:var(--ok)} .rule.no .mark{color:var(--no)}
```

Refactor chips:

```css
.chip{font:11px/1.3 var(--mono);padding:3px 7px;border-radius:4px;border:1px solid var(--line-strong);background:var(--surface);color:var(--soft)}
.chip-good{border-color:#2f6a47;background:var(--ok-wash);color:var(--ok)}
.chip-bad{border-color:#7c3a3a;background:var(--no-wash);color:var(--no)}
.chip-dim{opacity:.55}
.panel-today{border-top:2px solid var(--no)}
.panel-target{border-top:2px solid var(--ok)}
```

HTML flow connector:

```html
<div class="conn"><div class="conn-line"></div>
  <div class="conn-label">POST /api/drill/answer</div>
  <div class="conn-line"></div><div class="conn-arrow"></div></div>
```

Full worked specimen (copy structure, tokens, mental-model SVG approach):
`tmp/architecture-overview.html`.

## Suggested invocation

- Map how the plugin system is structured. → subsystem: derive, mental
  model SVG, layers, `tmp/` page
- Show what this refactor branch actually moves. → diff, invariant,
  before/after panes
- Draw the target architecture we just discussed. → proposed (dashed) +
  verified real pieces
- Make this page shareable. → promote
- This diagram is too crowded. → zoom: group boxes, not smaller fonts
