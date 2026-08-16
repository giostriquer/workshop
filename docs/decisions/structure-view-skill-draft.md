> **Superseded 2026-08-05.** Renamed to **`arch-map`**. Active parked draft:
> [`arch-map-skill-draft.md`](arch-map-skill-draft.md). Rename + visual
> language: [`arch-map-rename-and-visual.md`](arch-map-rename-and-visual.md).
> Origin: [`../skills/arch-map.md`](../skills/arch-map.md). This file is the
> historical `structure-view` SKILL.md (dual-grammar era) kept for
> archaeology. Do not resume from it.

---
name: structure-view
description: Use when the operator wants to understand structure visually and no source document exists, whether the subject is a refactor in flight (branch or diff, current or planned, with a before/after structural change), an existing subsystem (repo-state modules, dependencies, and current data flow), or a proposed design (a plan or conversation that describes the target state); also use when revising such a page. Derives the representation itself and renders a self-contained architectural HTML page using dual layout grammars (containment=strata, flow=wires, refactor=loud delta chrome), a role palette with a mandatory legend, provenance stamps, every box and edge traceable to a real file, symbol, or diff hunk. Ephemeral-first (lands in tmp/ as an orientation aid) with a promote-to-durable pass on request. NOT for rendering an existing markdown report, audit, or findings doc; that is doc-to-html.
---

# Structure View

## Purpose

Derive an architectural representation (from the repo, a diff, or a plan)
and render it as a single self-contained HTML page built for orientation:
where things live, how they connect, what a change moves. Then govern how
that page is edited afterward.

The sibling boundary matters: `doc-to-html` renders a finished document and
may never invent content; `structure-view` **authors the representation**
and must therefore trace every element to something real. One skill's
discipline is fidelity to a source; this one's is fidelity to the code.

## When to use

Three input shapes, all doc-less:

1. **Refactor in flight**: a branch/diff exists (or is being planned):
   before/after module shapes, what moves where, what is deleted.
2. **Existing subsystem**: no diff: how some part of the codebase is
   structured today: modules, dependencies, data flow, entry points.
3. **Proposed design**: nothing implemented: a plan or conversation whose
   target state should be seen before it is committed to.

Not for: rendering an existing markdown doc (that is `doc-to-html`, even
when the doc is about architecture); freeform diagramming disconnected from
this repo's code, diff, or plan.

## Step 0: house style, adapted

Glob the repo (especially `tmp/` and `docs/`) for an existing standalone
`.html` **architecture page**: hand-authored (inline `<style>`), excluding
generated output (`node_modules/`, `dist/`, `coverage/`, `playwright-report/`
and similar). **Genre test:** a candidate governs only if its primary content
is structural graphics (nested module boxes, SVG edges, a legend) rather
than prose sections. A `doc-to-html`-style report sibling (TOC rail, finding
cards, chips) is a *different genre* and does not set the style for an
architectural page. If a qualifying arch-page sibling exists, match its
palette and component shapes; the defaults below are the no-sibling fallback.

When the analyzed repo and the output repo differ (the page lands somewhere
other than the code it describes), glob **both**; a qualifying sibling in
the **output** repo wins: the page must sit well next to its neighbors.

## The pipeline

### 1: Derive

Mine the input for boxes (modules, components, layers) and edges (calls,
imports, data flow). By input shape:

- **Subsystem:** find entry points, then the modules behind them, then the
  edges between modules and out to external dependencies. Look for
  architecture / dependency-rule tests first (an `architecture.test` file, a
  lint boundary config): **enforced** rules are the highest-fidelity edge
  source, better than current imports. Then read the code; for large
  surfaces, fan out read-only explore subagents per area and merge their
  findings.
- **Refactor:** classify the diff into adds / removes / moves / renames;
  reconstruct the old shape and the new; identify **the invariant**: what
  does *not* change because it is the single most orienting fact and the page must
  state it.
- **Proposed design:** extract components and relations from the plan or
  conversation; wherever it references real code, verify the reference
  against the repo; everything not yet real is marked proposed.

**Traceability rule (load-bearing).** Every box and edge on the page traces
to something real (a file, a symbol, a diff hunk) and the box's caption or
tooltip carries the path(s). Proposed elements render visually distinct
(dashed) and never mix silently with observed ones. This is the
architectural equivalent of `doc-to-html`'s "never invent a number": a
plausible-looking box with no file behind it is a fabrication, not a
simplification.

### 2: Choose views

Pick the **1–3 views** that answer the operator's actual question, and open
each view by stating the question it answers. The catalog:

| View | Question it answers | When |
|---|---|---|
| Containment / layers | "How is this organized?" | Subsystem maps; the default first view |
| Flow | "How does data / control move?" | Pipelines, request paths, event chains |
| Before / after panes | "What does this change?" | Larger refactors: two linked panes |
| Delta overlay | "What does this change?" | Small refactors: one diagram, change-state colors |

Deriving more than you show is fine; showing everything you derived is not.
An unchosen view is a sentence in the page intro ("X exists but is not shown
here"), not a fourth diagram.

### 3: Render

Single self-contained HTML file: inline CSS/JS/SVG, opens from disk.
Default output: `tmp/<YYYY-MM-DD>-<slug>.html`. Ephemeral by default: the
page is an orientation aid, generated fast, allowed to be imperfect.

**Promote** (on request) turns an ephemeral page durable: re-verify every
traced path and edge against the current repo, run the full checklist, then
move it to `docs/` (or wherever the repo keeps durable pages) with the
provenance stamp updated.

## Visual language

**Glanceability is the product.** Nesting, edges, and change state must read
before any label is parsed. Aesthetic taste is secondary; these are local
orientation pages.

### Dual layout grammars

Pick **one** grammar per view from the view type. Do not hybridize inside a
view (that is how edges and nesting both go mushy):

| View | Grammar | Layout engine |
|---|---|---|
| Containment / layers | **A · strata** | Stacked HTML bands + nested cards; relations by adjacency |
| Flow | **B · wires** | Swimlane columns + thick SVG edges (edges are the point) |
| Before / after panes | **C · linked panes** | Two panes, shared `data-key`, loud delta chrome |
| Delta overlay | **D · delta** | One canvas; change-state is primary; unchanged dims hard |

Worked specimen (match this when no house-style sibling exists):
`tmp/2026-08-05-structure-view-visual-specimen.html`.

### Shared rules (every grammar)

- **Role palette.** entry / domain / infra / external: 4px left rail +
  tinted card wash (tokens below). Same taxonomy across pages.
- **Change chrome outranks role.** On refactor views, added / removed /
  moved use fill + border + corner badge (`add`/`del`/`mov`). Role wash
  yields; never a thin left-accent alone for change.
- **Proposed** = dashed border; never silently mixed with observed.
- **Legend is mandatory.** Every color, border style, wire, and shape used
  appears in it. Trim to what the page actually uses.
- **Provenance** footer on every view; **invariant** callout on refactor
  pages (what does *not* change).
- **Mermaid escape hatch**: dense graph-shaped views only: pre-render via
  `mmdc` to inline SVG; vendored mermaid script is the knowing fallback;
  never a CDN.
- **Interactivity.** Flow: hover isolates neighborhood (dim rest, hot wire).
  Before/after: hover lights the shared `data-key` in both panes. Tooltips /
  `title` carry file paths. Panes and lanes stack at phone width.
- **Uniform fan-out**: one labeled representative edge or a caption; never
  a partial subset of identical edges.

### Grammar A: strata (containment)

Stacked `.band` layers with a 5px role rail and dashed separators. Nest
related modules inside `.nest` groups. **No SVG edges by default.**
Adjacency and a shared band carry relations. Visual weight follows story
importance, not file count.

### Grammar B: wires (flow)

Column swimlanes (`.lane`). Edges are first-class: stroke ≥2.75px, labeled,
arrowheaded, redrawn on resize via ResizeObserver into a `<g>` (never wipe
`<defs>`). Hover focus dims non-neighbors. Prefer side-exit / side-entry
beziers between lanes.

### Grammar C: linked panes (large refactor)

`.panes` grid: Before | After. Shared `data-key` hover. Change badges and
fills must beat role color at a glance. State the invariant above the panes.

### Grammar D: delta overlay (small refactor)

Single row/canvas. Unchanged at ~0.38 opacity + desaturate. Added / removed
/ moved use the same fill+badge vocabulary as C. Use when two panes would
be overkill.

## Process rules (rigid)

- **Traceability**: no box or edge without a real file / symbol / diff hunk
  behind it; proposed elements dashed, never silently mixed.
- **Provenance stamp.** Every view is footed with what it was derived from
  and when: `derived from <paths / diff-range> at <commit>`. Ephemeral pages
  go stale; the stamp says stale-as-of-what. Read every hash **live at
  generation time** (`git rev-parse --short HEAD`, or the analyzed range's
  own hashes), never from the session's startup snapshot, which goes stale
  as the session works. When the analyzed repo differs from the output repo,
  the stamp carries the **analyzed** repo's hashes (run `git rev-parse`
  there).
- **View economy.** At most 3 views per page, each stating its question.
- **Zoom discipline.** A view caps at ~30 visible boxes. Beyond that, group
  (one box per cluster, expandable or linked to a deeper page), never a
  200-box canvas.
- **The invariant.** A refactor page always states what does not change.
- **One pass; direction change = clean rewrite; one knob at a time.**
  Inherited from `doc-to-html`, these rules are renderer-agnostic. Generate the
  full page in one pass, rewrite whole on an aesthetic direction change,
  and answer "looks off" by asking which element fails, not by swinging the
  whole design.

## Pre-finish checklist

1. Parse-check the HTML: balanced tags and valid inline JS (e.g. feed each
   `<script>` body to `node -e "new Function(...)"` or run a DOM parser over
   the file); no stray CSS/JS tokens.
2. Legend complete: every color, border style, and shape used on the page
   appears in it.
3. Every edge endpoint resolves to a rendered box id (the `EDGES` array and
   the DOM agree), and every edge-free box is *deliberately* so: its
   relations carried by band adjacency or a caption, not forgotten.
4. Provenance stamp present on every view; every hash read live at
   generation time (`git rev-parse`), not from the session's startup
   snapshot: a real-but-stale hash is still a false stamp.
5. Spot-check 3 boxes' paths against the repo; they exist, and they are
   what the box claims.
6. Views ≤ 3, each opening with its question; box cap respected.
7. Change-state colors appear only on refactor pages; role palette matches
   the tokens.
8. Styled scrollbars on every scroll container; print stylesheet present;
   panes and bands stack at phone width with no horizontal overflow.

## Reference markup

Full worked page (all four grammars): 
`tmp/2026-08-05-structure-view-visual-specimen.html`: open it, match it.
Below are the load-bearing recipes to copy into generated pages.

Tokens and role palette:

```css
:root{
  --bg:#0a0d12; --bg-elev:#0f1319; --panel:#141a22; --panel-2:#1a222c;
  --card:#1c2530; --line:#2e3a4a; --line-strong:#4a5d73;
  --text:#e8eef6; --muted:#9aabbf; --faint:#6a7c90;
  --entry:#4db0ff; --entry-dim:#1a3a55;
  --domain:#3dcea0; --domain-dim:#163a2e;
  --infra:#e0b04a; --infra-dim:#3a3014;
  --ext:#e8894a; --ext-dim:#3a2414;
  --add:#3dd68c; --add-bg:#0f2a1c; --add-line:#1f6b45;
  --del:#ff6b5c; --del-bg:#2a1210; --del-line:#7a2e28;
  --move:#f0b429; --move-bg:#2a220c; --move-line:#7a5c14;
  --wire:#6a849e; --wire-hot:#7ec4ff;
  --sans:"Segoe UI","Helvetica Neue",system-ui,sans-serif;
  --mono:"Cascadia Code","SFMono-Regular",Consolas,Menlo,monospace;
}
body{margin:0;background:var(--bg);color:var(--text);font:15px/1.55 var(--sans)}
main{max-width:1180px;margin:0 auto;padding:40px 36px 96px}
*{scrollbar-width:thin;scrollbar-color:#3a4d66 transparent}
::-webkit-scrollbar{width:10px;height:10px}
::-webkit-scrollbar-thumb{background:#2c3a52;border-radius:6px;border:2px solid var(--bg)}
.mod{position:relative;z-index:2;background:var(--card);border:1px solid var(--line);
  border-radius:5px;padding:11px 13px;min-width:140px}
.mod h4{font:650 14px/1.25 var(--sans);margin:0}
.mod .path{font:11px/1.35 var(--mono);color:var(--faint);margin-top:4px}
.mod .from{font:11px var(--mono);color:var(--move);margin-top:5px}
.mod .from::before{content:"← "}
.mod .badge{position:absolute;top:-7px;right:8px;font:700 9px/1 var(--mono);
  letter-spacing:.06em;text-transform:uppercase;padding:3px 6px;border-radius:2px;color:var(--bg)}
.mod[data-role=entry]{border-left:4px solid var(--entry);background:linear-gradient(90deg,var(--entry-dim),var(--card) 28%)}
.mod[data-role=domain]{border-left:4px solid var(--domain);background:linear-gradient(90deg,var(--domain-dim),var(--card) 28%)}
.mod[data-role=infra]{border-left:4px solid var(--infra);background:linear-gradient(90deg,var(--infra-dim),var(--card) 28%)}
.mod[data-role=ext]{border-left:4px solid var(--ext);background:linear-gradient(90deg,var(--ext-dim),var(--card) 28%)}
.mod.add{border-color:var(--add-line);background:var(--add-bg);border-left:4px solid var(--add)}
.mod.add .badge{background:var(--add)}
.mod.del{border-color:var(--del-line);background:var(--del-bg);border-left:4px solid var(--del);opacity:.72}
.mod.del h4{text-decoration:line-through;color:var(--muted)}
.mod.del .badge{background:var(--del)}
.mod.mov{border-color:var(--move-line);background:var(--move-bg);border-left:4px solid var(--move)}
.mod.mov .badge{background:var(--move);color:#1a1400}
.mod.dim{opacity:.38;filter:saturate(.4)}
.mod.proposed{border-style:dashed;border-width:1.5px;border-left-width:4px}
.mod.hot{outline:2px solid var(--wire-hot);outline-offset:2px}
.prov{font:11.5px var(--mono);color:var(--faint);border-top:1px solid var(--line);margin-top:18px;padding-top:10px}
.view-head .invariant{margin:10px 0 0;padding:8px 12px;border-left:3px solid var(--move);
  background:var(--move-bg);font-size:13.5px}
```

Grammar A: strata bands (no SVG edges):

```html
<div class="strata">
  <div class="band" data-layer="entry"><h3>Entry</h3>
    <div class="row">
      <div class="mod" data-role="entry" id="api" title="src/api/"><h4>API</h4><div class="path">src/api/</div></div>
    </div>
  </div>
  <div class="band" data-layer="domain"><h3>Domain</h3>
    <div class="row">
      <div class="nest"><div class="nest-lbl">core</div>
        <div class="mod" data-role="domain" id="core" title="src/sync/"><h4>Engine</h4><div class="path">src/sync/</div></div>
      </div>
    </div>
  </div>
</div>
```

```css
.strata{display:flex;flex-direction:column}
.band{position:relative;background:var(--panel);border:1px solid var(--line);border-bottom:none;padding:16px 16px 18px 20px}
.band:first-child{border-radius:8px 8px 0 0}
.band:last-of-type{border-bottom:1px solid var(--line);border-radius:0 0 8px 8px}
.band + .band{border-top:1px dashed var(--line-strong)}
.band::before{content:"";position:absolute;left:0;top:0;bottom:0;width:5px;background:var(--band)}
.band[data-layer=entry]{--band:var(--entry);background:linear-gradient(90deg,var(--entry-dim),var(--panel) 12%)}
.band[data-layer=domain]{--band:var(--domain);background:linear-gradient(90deg,var(--domain-dim),var(--panel) 12%)}
.band[data-layer=infra]{--band:var(--infra);background:linear-gradient(90deg,var(--infra-dim),var(--panel) 12%)}
.band[data-layer=ext]{--band:var(--ext);background:linear-gradient(90deg,var(--ext-dim),var(--panel) 12%)}
.band>h3{font:700 11px/1 var(--mono);letter-spacing:.14em;text-transform:uppercase;color:var(--band);margin:0 0 12px}
.row{display:flex;flex-wrap:wrap;gap:10px}
.nest{flex:1 1 220px;background:var(--panel-2);border:1px solid var(--line);border-radius:5px;padding:10px;display:flex;flex-direction:column;gap:8px}
.nest-lbl{font:10px/1 var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--faint)}
```

Grammar B: flow wires (edges first-class). Draw into `<g class="glinks">`;
ResizeObserver redraws; never `innerHTML` the whole SVG (wipes `<defs>`):

```html
<div class="flow" id="flow-canvas">
  <svg class="edges" aria-hidden="true">
    <defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto">
      <path d="M0,0L10,5L0,10z" fill="#6a849e"/></marker></defs>
    <g class="glinks"></g>
  </svg>
  <div class="lanes">
    <div class="lane"><h3>Input</h3>
      <div class="mod" data-role="entry" id="src"><h4>Source</h4></div>
    </div>
    <div class="lane"><h3>Domain</h3>
      <div class="mod" data-role="domain" id="core"><h4>Core</h4></div>
    </div>
  </div>
</div>
<script>
const EDGES=[['src','core','calls']];
function drawFlow(){
  const cv=document.getElementById('flow-canvas'),g=cv.querySelector('.glinks'),
        svg=cv.querySelector('.edges'),r0=cv.getBoundingClientRect();
  svg.setAttribute('width',cv.scrollWidth);svg.setAttribute('height',cv.scrollHeight);
  g.innerHTML=EDGES.map(([a,b,label])=>{
    const A=document.getElementById(a)?.getBoundingClientRect(),
          B=document.getElementById(b)?.getBoundingClientRect();
    if(!A||!B)return '';
    const x1=A.right-r0.left,y1=A.top-r0.top+A.height/2,
          x2=B.left-r0.left,y2=B.top-r0.top+B.height/2,mx=(x1+x2)/2;
    return `<path d="M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}" data-a="${a}" data-b="${b}"/>`
      +(label?`<text class="edge-label" x="${mx}" y="${(y1+y2)/2-6}" text-anchor="middle">${label}</text>`:'');
  }).join('');
}
new ResizeObserver(drawFlow).observe(document.getElementById('flow-canvas'));
addEventListener('load',drawFlow);
</script>
```

```css
.flow{position:relative;background:var(--bg-elev);border:1px solid var(--line);border-radius:8px;padding:20px 16px 28px}
.flow .lanes{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px;position:relative;z-index:2}
.lane>h3{font:700 10px/1 var(--mono);letter-spacing:.14em;text-transform:uppercase;color:var(--faint);margin:0 0 8px;padding-bottom:8px;border-bottom:1px solid var(--line)}
.flow .edges{position:absolute;inset:0;pointer-events:none;z-index:1}
.flow .edges path{fill:none;stroke:var(--wire);stroke-width:2.75;marker-end:url(#arr)}
.flow .edges path.hot{stroke:var(--wire-hot);stroke-width:3.25}
.edge-label{font:10.5px/1 var(--mono);fill:var(--text);paint-order:stroke fill;stroke:var(--bg);stroke-width:4px}
.flow.focus .edges path{opacity:.18}
.flow.focus .edges path.hot{opacity:1}
.flow.focus .mod{opacity:.28}
.flow.focus .mod.hot{opacity:1}
@media(max-width:900px){.flow .lanes{grid-template-columns:1fr 1fr}}
```

Hover neighborhood (flow) and linked panes (before/after):

```html
<script>
document.querySelectorAll('#flow-canvas .mod[id]').forEach(m=>{
  m.addEventListener('mouseenter',()=>{
    const cv=m.closest('.flow');cv.classList.add('focus');
    const hot=new Set([m.id]);
    EDGES.forEach(([a,b])=>{if(a===m.id)hot.add(b);if(b===m.id)hot.add(a)});
    cv.querySelectorAll('.mod[id]').forEach(x=>x.classList.toggle('hot',hot.has(x.id)));
    cv.querySelectorAll('.edges path').forEach(p=>
      p.classList.toggle('hot',p.dataset.a===m.id||p.dataset.b===m.id));
  });
  m.addEventListener('mouseleave',()=>{
    const cv=m.closest('.flow');cv.classList.remove('focus');
    cv.querySelectorAll('.hot').forEach(x=>x.classList.remove('hot'));
  });
});
document.querySelectorAll('.panes [data-key]').forEach(el=>{
  el.addEventListener('mouseenter',()=>document.querySelectorAll(
    `.panes [data-key="${el.dataset.key}"]`).forEach(x=>x.classList.add('hot')));
  el.addEventListener('mouseleave',()=>document.querySelectorAll('.panes .hot')
    .forEach(x=>x.classList.remove('hot')));
});
</script>
```

Grammar C: before/after panes:

```html
<div class="panes">
  <div class="pane"><h3>Before</h3>
    <div class="mod del" data-key="parser"><span class="badge">del</span>
      <h4>Parser</h4><div class="path">src/legacy/parser.ts</div></div>
  </div>
  <div class="pane after"><h3>After</h3>
    <div class="mod mov" data-key="parser"><span class="badge">mov</span>
      <h4>Parser</h4><div class="path">src/input/parser.ts</div>
      <div class="from">src/legacy/parser.ts</div></div>
  </div>
</div>
```

```css
.panes{display:grid;grid-template-columns:1fr 1fr;gap:0;border:1px solid var(--line);border-radius:8px;overflow:hidden}
.pane{padding:16px;background:var(--panel)}
.pane + .pane{border-left:1px solid var(--line-strong)}
.pane>h3{font:700 11px/1 var(--mono);letter-spacing:.14em;text-transform:uppercase;color:var(--faint);margin:0 0 14px}
@media(max-width:900px){.panes{grid-template-columns:1fr}.pane + .pane{border-left:none;border-top:1px solid var(--line-strong)}}
```

Legend and print (trim swatches to what the page uses):

```html
<div class="legend">
  <span><i class="sw rail" style="--c:var(--entry)"></i>entry</span>
  <span><i class="sw rail" style="--c:var(--domain)"></i>domain</span>
  <span><i class="sw rail" style="--c:var(--infra)"></i>infra</span>
  <span><i class="sw rail" style="--c:var(--ext)"></i>external</span>
  <span><i class="sw" style="--c:var(--add)"></i>added</span>
  <span><i class="sw" style="--c:var(--del)"></i>removed</span>
  <span><i class="sw" style="--c:var(--move)"></i>moved</span>
  <span><i class="sw dashed"></i>proposed</span>
</div>
```

```css
.legend{display:flex;flex-wrap:wrap;gap:10px 18px;padding:12px 14px;background:var(--bg-elev);
  border:1px solid var(--line);border-radius:6px;font-size:12.5px;color:var(--muted)}
.legend .sw{display:inline-block;width:11px;height:11px;border-radius:2px;background:var(--c,#666);margin-right:6px;vertical-align:-1px}
.legend .sw.rail{width:4px;height:14px;border-radius:1px;vertical-align:-3px}
.legend .sw.dashed{background:none;border:1.5px dashed var(--muted)}
@media print{
  body{background:#fff;color:#111}
  .band,.mod,.flow,.panes{background:#fff!important;border-color:#bbb;break-inside:avoid}
  .edges path{stroke:#555!important}
}
```

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
  deeper instead of using a smaller font)
