---
name: structure-view
description: Use when the operator wants to understand structure visually and no source document exists — a refactor in flight (branch or diff, current or planned — before/after structural change), an existing subsystem (repo state — modules, dependencies, data flow as they are today), or a proposed design (a plan or conversation — target-state view) — or when revising such a page. Derives the representation itself and renders a self-contained architectural HTML page: containment-first layouts, a role palette with a mandatory legend, change-state coloring for refactors, provenance stamps, every box and edge traceable to a real file, symbol, or diff hunk. Ephemeral-first (lands in tmp/ as an orientation aid) with a promote-to-durable pass on request. NOT for rendering an existing markdown report, audit, or findings doc — that is doc-to-html.
---

# Structure View

## Purpose

Derive an architectural representation — from the repo, a diff, or a plan —
and render it as a single self-contained HTML page built for orientation:
where things live, how they connect, what a change moves. Then govern how
that page is edited afterward.

The sibling boundary matters: `doc-to-html` renders a finished document and
may never invent content; `structure-view` **authors the representation**
and must therefore trace every element to something real. One skill's
discipline is fidelity to a source; this one's is fidelity to the code.

## When to use

Three input shapes, all doc-less:

1. **Refactor in flight** — a branch/diff exists (or is being planned):
   before/after module shapes, what moves where, what is deleted.
2. **Existing subsystem** — no diff: how some part of the codebase is
   structured today — modules, dependencies, data flow, entry points.
3. **Proposed design** — nothing implemented: a plan or conversation whose
   target state should be seen before it is committed to.

Not for: rendering an existing markdown doc (that is `doc-to-html`, even
when the doc is about architecture); freeform diagramming disconnected from
this repo's code, diff, or plan.

## Step 0 — house style, adapted

Glob the repo (especially `tmp/` and `docs/`) for an existing standalone
`.html` **architecture page** — hand-authored (inline `<style>`), excluding
generated output (`node_modules/`, `dist/`, `coverage/`, `playwright-report/`
and similar). **Genre test:** a candidate governs only if its primary content
is structural graphics — nested module boxes, SVG edges, a legend — rather
than prose sections. A `doc-to-html`-style report sibling (TOC rail, finding
cards, chips) is a *different genre* and does not set the style for an
architectural page. If a qualifying arch-page sibling exists, match its
palette and component shapes; the defaults below are the no-sibling fallback.

## The pipeline

### 1 — Derive

Mine the input for boxes (modules, components, layers) and edges (calls,
imports, data flow). By input shape:

- **Subsystem:** find entry points, then the modules behind them, then the
  edges between modules and out to external dependencies. Read the code;
  for large surfaces, fan out read-only explore subagents per area and merge
  their findings.
- **Refactor:** classify the diff into adds / removes / moves / renames;
  reconstruct the old shape and the new; identify **the invariant** — what
  does *not* change — it is the single most orienting fact and the page must
  state it.
- **Proposed design:** extract components and relations from the plan or
  conversation; wherever it references real code, verify the reference
  against the repo; everything not yet real is marked proposed.

**Traceability rule (load-bearing).** Every box and edge on the page traces
to something real — a file, a symbol, a diff hunk — and the box's caption or
tooltip carries the path(s). Proposed elements render visually distinct
(dashed) and never mix silently with observed ones. This is the
architectural equivalent of `doc-to-html`'s "never invent a number": a
plausible-looking box with no file behind it is a fabrication, not a
simplification.

### 2 — Choose views

Pick the **1–3 views** that answer the operator's actual question, and open
each view by stating the question it answers. The catalog:

| View | Question it answers | When |
|---|---|---|
| Containment / layers | "How is this organized?" | Subsystem maps; the default first view |
| Flow | "How does data / control move?" | Pipelines, request paths, event chains |
| Before / after panes | "What does this change?" | Larger refactors — two linked panes |
| Delta overlay | "What does this change?" | Small refactors — one diagram, change-state colors |

Deriving more than you show is fine; showing everything you derived is not.
An unchosen view is a sentence in the page intro ("X exists but is not shown
here"), not a fourth diagram.

### 3 — Render

Single self-contained HTML file — inline CSS/JS/SVG, opens from disk.
Default output: `tmp/<YYYY-MM-DD>-<slug>.html`. Ephemeral by default: the
page is an orientation aid, generated fast, allowed to be imperfect.

**Promote** (on request) turns an ephemeral page durable: re-verify every
traced path and edge against the current repo, run the full checklist, then
move it to `docs/` (or wherever the repo keeps durable pages) with the
provenance stamp updated.

## Visual language

- **Containment first.** Layers as horizontal bands, swimlanes as columns,
  modules as nested cards — CSS grid/flex is the layout engine, and HTML is
  genuinely good at containment. A box's visual weight reflects its
  importance to the story, not its file count.
- **Edges are scarce.** Prefer adjacency and shared-band placement to imply
  relations; draw an SVG edge only where a connection is the point. Bundle
  parallel edges. The overlay redraws on container resize (reference JS
  below — this is the classic bug).
- **Role palette.** One consistent accent per architectural role — entry /
  domain / infra / external — reused across every page this skill produces
  (tokens below), so pages stay mutually legible.
- **Change-state semantics** (refactor pages only): added = green; removed =
  red, ghosted; moved = amber with a `from <old path>` provenance line;
  unchanged = dim. Before/after panes link by hover: the same element
  highlights in both panes.
- **Legend is mandatory.** Every color, border style, and shape used on the
  page appears in the legend. A reader who has never seen this skill's
  output must be able to decode the page from the legend alone.
- **Mermaid escape hatch — graph-shaped views only.** For a genuinely
  graph-shaped view (a dense dependency web where hand layout would be
  miserable), pre-render at authoring time to SVG and inline the SVG —
  `npx -y @mermaid-js/mermaid-cli -i graph.mmd -o graph.svg` — which stays
  self-contained, small, and restylable. Vendoring the mermaid script inline
  is the fallback when `mmdc` is unavailable; accept the multi-megabyte file
  knowingly. Never a CDN reference — the page must open from disk.
- **Interactivity.** Hovering a module highlights its edges and neighbors
  and dims the rest; tooltips carry the file paths behind a box; panes
  stack at phone width.

## Process rules (rigid)

- **Traceability** — no box or edge without a real file / symbol / diff hunk
  behind it; proposed elements dashed, never silently mixed.
- **Provenance stamp.** Every view is footed with what it was derived from
  and when: `derived from <paths / diff-range> at <commit>`. Ephemeral pages
  go stale; the stamp says stale-as-of-what. Read every hash **live at
  generation time** (`git rev-parse --short HEAD`, or the analyzed range's
  own hashes) — never from the session's startup snapshot, which goes stale
  as the session works.
- **View economy.** At most 3 views per page, each stating its question.
- **Zoom discipline.** A view caps at ~30 visible boxes. Beyond that, group
  (one box per cluster, expandable or linked to a deeper page) — never a
  200-box canvas.
- **The invariant.** A refactor page always states what does not change.
- **One pass; direction change = clean rewrite; one knob at a time.**
  Inherited from `doc-to-html` — they are renderer-agnostic: generate the
  full page in one pass, rewrite whole on an aesthetic direction change,
  and answer "looks off" by asking which element fails, not by swinging the
  whole design.

## Pre-finish checklist

1. Parse-check the HTML; no stray CSS/JS tokens.
2. Legend complete — every color, border style, and shape used on the page
   appears in it.
3. Every edge endpoint resolves to a rendered box id (the `EDGES` array and
   the DOM agree).
4. Provenance stamp present on every view; every hash read live at
   generation time (`git rev-parse`), not from the session's startup
   snapshot — a real-but-stale hash is still a false stamp.
5. Spot-check 3 boxes' paths against the repo — they exist, and they are
   what the box claims.
6. Views ≤ 3, each opening with its question; box cap respected.
7. Change-state colors appear only on refactor pages; role palette matches
   the tokens.
8. Styled scrollbars on every scroll container; print stylesheet present;
   panes and bands stack at phone width with no horizontal overflow.

## Reference markup

Tokens and role palette:

```css
:root{
  --bg:#0b0e13; --panel:#12161d; --card:#151b24; --line:#232a35;
  --text:#d7dee8; --muted:#93a0b0; --faint:#5d6774;
  --entry:#5aa7ff; --domain:#8f7dff; --infra:#3fb98f; --ext:#c98f4a;
  --add:#46c061; --del:#f0635a; --move:#e3a93c;
  --mono:'SFMono-Regular',Consolas,Menlo,monospace;
}
body{margin:0;background:var(--bg);color:var(--text);font:15.5px/1.6 system-ui,'Segoe UI',sans-serif}
main{max-width:1200px;margin:0 auto;padding:36px 40px 72px}
*{scrollbar-width:thin;scrollbar-color:#33415c transparent}
::-webkit-scrollbar{width:10px;height:10px}
::-webkit-scrollbar-thumb{background:#2c3a52;border-radius:6px;border:2px solid var(--bg)}
```

View header (the question), layer bands, module cards:

```html
<section class="view">
  <h2>Sync subsystem</h2>
  <p class="q">How is the sync subsystem organized, and what talks to what?</p>
  <div class="canvas">
    <div class="band"><h3>Entry</h3>
      <div class="row">
        <div class="mod" data-role="entry" id="api" title="src/api/routes.ts">
          <h4>API routes</h4><div class="path">src/api/</div>
        </div>
      </div>
    </div>
    <div class="band"><h3>Domain</h3>
      <div class="row">
        <div class="mod" data-role="domain" id="core" title="src/sync/engine.ts">
          <h4>Sync engine</h4><div class="path">src/sync/</div>
          <ul><li>reconcile()</li><li>applyDelta()</li></ul>
        </div>
      </div>
    </div>
    <svg class="edges" aria-hidden="true">
      <defs><marker id="arr" viewBox="0 0 8 8" refX="7" refY="4"
        markerWidth="7" markerHeight="7" orient="auto">
        <path d="M0,0L8,4L0,8z" fill="#3c4a5e"/></marker></defs>
      <g class="glinks"></g>
    </svg>
  </div>
  <footer class="prov">derived from <code>src/api/</code> + <code>src/sync/</code> at <code>abc1234</code></footer>
</section>
```

```css
.view{margin:36px 0}
.view h2{font-size:21px;margin:0 0 2px}
.view .q{color:var(--muted);font-size:13.5px;margin:0 0 16px}
.canvas{position:relative}
.band{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:14px 16px;margin-bottom:16px}
.band>h3{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--faint);margin:0 0 10px}
.row{display:flex;flex-wrap:wrap;gap:10px}
.mod{position:relative;z-index:2;background:var(--card);border:1px solid var(--line);border-left:3px solid var(--muted);border-radius:8px;padding:10px 14px;min-width:130px}
.mod[data-role=entry]{border-left-color:var(--entry)}
.mod[data-role=domain]{border-left-color:var(--domain)}
.mod[data-role=infra]{border-left-color:var(--infra)}
.mod[data-role=ext]{border-left-color:var(--ext)}
.mod h4{font-size:14.5px;margin:0}
.mod .path{font:11px var(--mono);color:var(--faint);margin-top:3px}
.mod ul{margin:8px 0 0;padding-left:16px;font-size:12.5px;color:var(--muted)}
.prov{font:12px var(--mono);color:var(--faint);border-top:1px solid var(--line);margin-top:16px;padding-top:9px}
@media(max-width:900px){main{padding:24px 18px 56px}.row{flex-direction:column}}
```

Change states (refactor pages) and proposed elements:

```css
.mod.add{border-color:#2c5e3b;background:#101d15;border-left-color:var(--add)}
.mod.del{border-color:#5c2925;background:#1c1210;opacity:.55}
.mod.del h4{text-decoration:line-through}
.mod.mov{border-left-color:var(--move)}
.mod.mov .from{font:11px var(--mono);color:var(--move);margin-top:3px}
.mod.dim{opacity:.6}
.mod.proposed{border-style:dashed}
```

Edge overlay — declared as data, drawn between element centers, redrawn on
resize. The two classic bugs are pinned shut: `innerHTML` on the whole SVG
would wipe the `<defs>` (draw into the `<g>` instead), and a static overlay
drifts when content reflows (ResizeObserver redraws):

```html
<script>
const EDGES=[['api','core','calls'],['core','store','reads/writes']];
function draw(cv){
  const g=cv.querySelector('.glinks'),svg=cv.querySelector('.edges'),
        r0=cv.getBoundingClientRect();
  svg.setAttribute('width',cv.scrollWidth);svg.setAttribute('height',cv.scrollHeight);
  g.innerHTML=EDGES.map(([a,b,label])=>{
    const A=document.getElementById(a)?.getBoundingClientRect(),
          B=document.getElementById(b)?.getBoundingClientRect();
    if(!A||!B)return '';                       // checklist item 3 catches this
    const x1=A.left-r0.left+A.width/2,y1=A.bottom-r0.top,
          x2=B.left-r0.left+B.width/2,y2=B.top-r0.top,my=(y1+y2)/2;
    return `<path d="M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}" data-a="${a}" data-b="${b}"/>`
      +(label?`<text x="${(x1+x2)/2}" y="${my-5}">${label}</text>`:'');
  }).join('');
}
const cv=document.querySelector('.canvas');
new ResizeObserver(()=>draw(cv)).observe(cv);
addEventListener('load',()=>draw(cv));
</script>
```

```css
.edges{position:absolute;inset:0;pointer-events:none;z-index:1}
.edges path{fill:none;stroke:#3c4a5e;stroke-width:1.5;marker-end:url(#arr)}
.edges text{fill:var(--faint);font:10.5px var(--mono);text-anchor:middle}
.canvas.focus .edges path{stroke:#242e3d}
.canvas.focus .edges path.hot{stroke:var(--entry);stroke-width:2}
.canvas.focus .mod{opacity:.35}
.canvas.focus .mod.hot{opacity:1}
```

Hover neighborhood highlight:

```html
<script>
document.querySelectorAll('.mod[id]').forEach(m=>{
  m.addEventListener('mouseenter',()=>{
    const cv=m.closest('.canvas');cv.classList.add('focus');
    const hot=new Set([m.id]);
    EDGES.forEach(([a,b])=>{if(a===m.id)hot.add(b);if(b===m.id)hot.add(a);});
    cv.querySelectorAll('.mod[id]').forEach(x=>x.classList.toggle('hot',hot.has(x.id)));
    cv.querySelectorAll('.edges path').forEach(p=>
      p.classList.toggle('hot',p.dataset.a===m.id||p.dataset.b===m.id));
  });
  m.addEventListener('mouseleave',()=>{
    const cv=m.closest('.canvas');cv.classList.remove('focus');
    cv.querySelectorAll('.hot').forEach(x=>x.classList.remove('hot'));
  });
});
</script>
```

Before/after panes with linked highlighting (elements sharing a `data-key`
light up together):

```html
<div class="panes">
  <div class="pane"><h3>Before</h3>
    <div class="mod" data-key="parser"><h4>Parser</h4><div class="path">src/legacy/parser.ts</div></div>
  </div>
  <div class="pane"><h3>After</h3>
    <div class="mod mov" data-key="parser"><h4>Parser</h4>
      <div class="path">src/input/parser.ts</div>
      <div class="from">from src/legacy/parser.ts</div></div>
  </div>
</div>
<script>
document.querySelectorAll('[data-key]').forEach(el=>{
  el.addEventListener('mouseenter',()=>document.querySelectorAll(
    `[data-key="${el.dataset.key}"]`).forEach(x=>x.classList.add('hot')));
  el.addEventListener('mouseleave',()=>document.querySelectorAll('.hot')
    .forEach(x=>x.classList.remove('hot')));
});
</script>
```

```css
.panes{display:grid;grid-template-columns:1fr 1fr;gap:18px}
.pane>h3{font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);margin:0 0 10px}
.mod.hot{outline:2px solid var(--entry);outline-offset:1px}
@media(max-width:900px){.panes{grid-template-columns:1fr}}
```

Legend and print:

```html
<div class="legend">
  <span><i class="sw" style="--c:var(--entry)"></i>entry</span>
  <span><i class="sw" style="--c:var(--domain)"></i>domain</span>
  <span><i class="sw" style="--c:var(--infra)"></i>infra</span>
  <span><i class="sw" style="--c:var(--ext)"></i>external</span>
  <span><i class="sw" style="--c:var(--add)"></i>added</span>
  <span><i class="sw" style="--c:var(--del)"></i>removed</span>
  <span><i class="sw" style="--c:var(--move)"></i>moved</span>
  <span><i class="sw dashed"></i>proposed</span>
</div>
```

```css
.legend{display:flex;flex-wrap:wrap;gap:14px;font-size:12.5px;color:var(--muted);margin:8px 0 20px}
.legend .sw{display:inline-block;width:12px;height:12px;border-radius:3px;background:var(--c,#666);margin-right:6px;vertical-align:-1px}
.legend .sw.dashed{background:none;border:1.5px dashed var(--muted)}
@media print{
  body{background:#fff;color:#111}
  .band,.mod{background:#fff;border-color:#bbb;break-inside:avoid}
  .edges path{stroke:#888} .edges text{fill:#666}
  a{color:#134a9e}
}
```

Trim the legend to the swatches the page actually uses — a subsystem map
carries no change-state swatches, a refactor page carries them all.

## Suggested invocation

- Show me how the plugin system is structured. (→ subsystem map: derive,
  containment view, `tmp/` page)
- Help me see what this refactor branch actually moves. (→ diff
  classification, before/after or delta view, the invariant stated)
- Draw the target state of the plan we just discussed. (→ proposed design:
  plan extraction, dashed proposed elements, verified where it touches real
  code)
- Make this page shareable. (→ promote: re-verify traces, full checklist,
  move to `docs/`)
- This diagram is too crowded. (→ zoom discipline: group boxes, link
  deeper — not a smaller font)
