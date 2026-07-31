# structure-view

## Origin

The recurring want: *"I'm mid-refactor and I want to see what's moving —
but there's no document to render."* `doc-to-html` couldn't take the job,
by design: its fourth-round comparative evaluation had already drawn the
boundary — "information-architecture / content-discipline guidance belongs
to an author, not a renderer" — and its rigid contract ("no markdown content
dropped," "never invent a number") is precisely what makes it trustworthy
for audits. Broadening it would have dissolved that. The authoring job was
simply unowned.

`structure-view` takes it: derive the representation — from the repo, a
diff, or a plan — then render it with a visual language built for
architecture rather than prose.

**A design-first birth, recorded honestly.** Unlike its siblings, this skill
was not distilled from accumulated field rounds; the operator chose a full
design over incubation (see `docs/decisions/structure-view.md`), with two
compensating controls: GREEN tests before landing (fresh subagents given
only the SKILL.md must produce conforming pages), and this doc naming which
conventions are provisional until real rounds harden them (see Maturity).

## Problem

Four failure families — the first three anticipated from watching sessions
improvise structural explanations, the fourth inherited from `doc-to-html`'s
lived history:

1. **Prose is the wrong medium for structure.** Asked "how is this
   organized?", a session answers in paragraphs — accurate, linear, and
   useless for orientation. Structure is containment and edges; the reader
   needs to *see* where things live and what a change moves.
2. **Invented architecture.** A diagram drawn from plausibility rather than
   the code: boxes with no files behind them, edges nobody verified. A
   confident-looking page is worse than no page when its shapes are
   fabricated — the architectural equivalent of a report inventing a
   number.
3. **Unbounded diagrams.** Everything derivable gets rendered: a 200-box
   canvas, every import an arrow. Complete, and unreadable — the page
   reproduces the complexity it was meant to tame.
4. **Render failures already paid for once.** Edge overlays that drift when
   content reflows, raw OS scrollbars, desktop-only layouts, pages that die
   when printed — the exact classes of bugs `doc-to-html` pinned shut for
   report pages would be rediscovered for arch pages.

Plus a shape-specific one: an **ephemeral page consulted later** with no
record of what state it described — orientation aids go stale silently.

## Solution shape

A three-phase pipeline the renderer-sibling deliberately lacks, then a
render contract:

- **Derive.** Mine the input per shape — subsystem (entry points → modules
  → edges; explore subagents fanned out for large surfaces), refactor (diff
  classified into adds/removes/moves/renames; the **invariant** — what does
  *not* change — identified, because it is the single most orienting fact),
  proposed design (components extracted from the plan, verified against the
  repo where they reference real code, marked proposed elsewhere). The
  load-bearing rule is **traceability**: every box and edge traces to a
  real file, symbol, or diff hunk, with the paths in the caption or
  tooltip; proposed elements render dashed, never silently mixed.
- **Choose views.** At most 3 per page, each opening with the question it
  answers, picked from a small catalog: containment/layers ("how is it
  organized"), flow ("how does data move"), before/after panes ("what
  changes," large refactors), delta overlay ("what changes," small ones).
  Deriving more than you show is fine; showing everything is not.
- **Render.** A single self-contained HTML file (opens from disk), landing
  in `tmp/<date>-<slug>.html` — ephemeral-first, an orientation aid — with
  a **promote** pass (re-verify every trace, full checklist, move to
  `docs/`) when a page should become durable. Every view is footed with a
  **provenance stamp** ("derived from `<paths/diff-range>` at `<commit>`"),
  so a stale page at least says stale-as-of-what.

The visual language is containment-first — layers as bands, swimlanes,
nested module cards; CSS is the layout engine — with scarce hand-authored
SVG edges (redrawn on resize; the classic drift bug is pinned in the
reference JS), a consistent role palette (entry / domain / infra /
external), change-state semantics for refactors (added / removed-ghosted /
moved-with-provenance / unchanged-dim), and a **mandatory legend** covering
every color, border style, and shape used. Mermaid exists only as an escape
hatch for genuinely graph-shaped views, pre-rendered to inline SVG via
`mmdc` (vendored script as the knowing fallback) — never a CDN. Zoom
discipline caps a view at ~30 visible boxes; beyond that, group and link
deeper.

Process rules inherited from `doc-to-html` where renderer-agnostic: one-pass
generation, direction change = clean rewrite, one knob at a time, styled
scrollbars, print stylesheet, narrow-screen stacking. Step 0 house-style
matching is inherited *adapted*: only a hand-authored **arch-page** sibling
governs (genre test: structural graphics dominate), because a report sibling
is a different genre.

## Real invocation snippet

> /structure-view show me how the plugin system is structured

Derive (entry points, modules, edges), one containment view + maybe a flow
view, `tmp/` page with legend and provenance.

> /structure-view what does the relay-sync branch actually move?

Diff classified, before/after panes with linked highlighting, the invariant
stated ("the wire protocol does not change"), moved modules carrying
`from <old path>`.

> make this page shareable

Promote: every traced path re-verified against the current repo, full
checklist, page moved to `docs/`.

## Pitfalls observed

Designed-first: except the first entry (caught in the landing GREEN round),
the entries below are anticipated from the design review and from
`doc-to-html`'s lived history, not yet field-observed. Early rounds should
replace this caveat with real observations.

- **Stale provenance hash (observed — GREEN round).** The generating session
  stamped "repo HEAD" from its startup snapshot, three commits stale, while
  every analyzed-commit anchor on the same page was correct. The checklist's
  original wording ("commit hash real") let it through — a real-but-stale
  hash is still a false stamp. The rule now requires reading hashes live at
  generation time (`git rev-parse`), never from the snapshot.
- **Boxes without files.** The moment a diagram is drawn from memory of the
  codebase rather than from reading it, fabrication enters. The
  traceability rule and the checklist's spot-check (3 boxes' paths verified
  against the repo) exist for this.
- **The everything-diagram.** Rendering all derived nodes because deriving
  them was work. View economy and the box cap are the counters; "derived
  but not shown" is a sentence in the intro, not a fourth view.
- **Legend drift.** A change-state color or dashed border used on the page
  but missing from the legend — the page becomes self-decoding only to its
  author. Checklist item 2.
- **Edge overlay drift.** Absolutely-positioned SVG drawn once at load
  drifts as content reflows (fonts, collapses, viewport). The reference JS
  redraws via ResizeObserver; improvised overlays rediscover the bug.
- **Report furniture on an arch page.** Reaching for `doc-to-html`'s cards
  and chips because they're nearby. Different genre: module cards carry
  paths and roles, not severity chips.
- **Stale ephemeral pages trusted later.** An orientation page from last
  week consulted as if current. The provenance stamp makes the staleness
  checkable; promote re-verifies.

## Maturity

Provisional until hardened by real rounds — expect these to move:

- The **view cap (3)** and **box cap (~30)** are design-review numbers, not
  field-calibrated ones.
- The **role taxonomy** (entry / domain / infra / external) is a first cut;
  real codebases may demand different or per-repo roles.
- The **genre test** in Step 0 (structural graphics dominate) has not yet
  had to classify a hard case.

**Round 1 (2026-07-31) — cross-repo field exercise.** A fresh session
derived a three-view page of a real external codebase (the artifact landing
in this repo's `tmp/`). All checks passed — provenance read live from the
*source* repo, the house-style sibling correctly adopted from the *output*
repo — and five gaps folded back into the skill: cross-repo resolution for
Step 0 (glob both, output repo wins) and for provenance (analyzed repo's
hashes); the uniform fan-out pattern (one labeled edge or a caption, never
a partial subset); a prescribed parse-check method; an orphan-box check
(edge-free boxes must be deliberate); and architecture/dependency-rule
tests named as the highest-fidelity edge source in Derive. The field agent
also confirmed the view-economy discipline in practice: three derived-but-
unchosen views were named in the page intro rather than drawn.

Record further rounds here as they land, the way `doc-to-html`'s origin doc
did.

## Adaptation notes

- The role palette is a default taxonomy, not a claim about your
  architecture — swap the roles (and tokens) for the ones your codebase
  actually has; keep the rule that the palette is consistent across pages
  and fully covered by the legend.
- The output path (`tmp/`, promote to `docs/`) follows this scaffold's
  scratch conventions; point both at your project's equivalents.
- The traceability rule, provenance stamp, view economy, and zoom
  discipline are the portable half — they apply to any visual style.
- Sibling boundary: `doc-to-html` renders finished documents (including
  documents *about* architecture); `structure-view` owns the doc-less
  cases. The two descriptions cross-point so sessions route by input, not
  topic.
