# Decision: structure-view — derive-and-render architectural pages (design)

**Date:** 2026-07-31

## Status

**Shipped 2026-08-05 as `arch-map`** (`toolkit` `0.16.0`). Canonical:
`plugins/toolkit/skills/arch-map/SKILL.md`; origin: `docs/skills/arch-map.md`;
rename + visual language: `arch-map-rename-and-visual.md`. Historical draft
at `structure-view-skill-draft.md`; former origin at
`docs/skills/deprecated/structure-view.md`. This file remains the
**historical design of record** for pipeline / process rules; visual
language of record is the 2026-08-05 rename decision + specimen
`tmp/architecture-overview.html`.

Prior state — implemented (2026-07-31), executed directly from this spec per
the repo's Spec → Execute workflow, no separate implementation-plan doc.
GREEN-tested before landing: two fresh subagents, given only the SKILL.md
and a real scenario, produced conforming pages — a subsystem map of this
repo's plugin system (2 views, legend, live-verified provenance, all 8
checklist items run) and a before/after of refactor `36ef5ff` (182 files;
the probe proved the invariant via an exhaustive blob-hash survivor check
and declined to render a claim the commit's own decision doc makes but its
diff doesn't back). The round surfaced one skill defect — a "repo HEAD"
provenance stamp taken from the session's stale startup snapshot, which the
original "commit hash real" checklist wording failed to catch — fixed by
requiring every stamped hash be read live at generation time.

## Context

The operator repeatedly wants to *understand structure visually* — most often
a refactor in flight — but `doc-to-html` requires a finished markdown source:
it is a renderer bound to "no markdown content dropped" and "derived numbers
recomputed, never invented," and its own round-four evaluation drew the
boundary explicitly ("information-architecture / content-discipline guidance
belongs to an author, not a renderer"). Broadening it would dissolve the
contract that makes it trustworthy for audits.

`structure-view` is the sibling that owns the other job: **derive** the
representation from the repo, a diff, or a plan — no source document exists —
then render it as a standalone HTML page whose visual language is designed
for architecture rather than prose reports.

Approach chosen by the operator: **full design now** (not thin-v1, not
ad-hoc incubation), with the repo's lived-in-proof bar compensated by GREEN
tests before landing and origin-doc honesty about which conventions are
awaiting field rounds.

## Scope & boundary

Triggers when the operator wants structural understanding and **no source
doc exists**. Three input shapes:

1. **Refactor in flight** — a branch/diff (or a planned one): before/after
   module shapes, what moves where, what is deleted.
2. **Existing subsystem** — repo state: modules, dependencies, data flow,
   entry points, as they are today.
3. **Proposed design** — a plan or conversation: target-state view, with
   proposed elements visually distinct from observed ones.

Explicit NOT-for: rendering an existing markdown document — that is
`doc-to-html`, whose description gains a one-line cross-pointer to
`structure-view` (and vice versa).

Audience: **ephemeral-first** — an orientation aid landing in `tmp/`,
optimized for fast generation and comprehension — with a **promote**
operation (verify claims, polish pass, move to `docs/`) when a page should
become a durable shareable explainer.

## Pipeline

Three phases; the first two are what `doc-to-html` deliberately lacks.

1. **Derive.** Mine the input for boxes and edges: for a subsystem — entry
   points, modules, dependency edges, data flow (fan out Explore subagents
   for large surfaces); for a refactor — classify the diff into
   adds/removes/moves/renames and map old shape → new shape; for a proposed
   design — extract components and relations from the plan, verifying
   against the current repo wherever it references real code.
   **Traceability rule (the load-bearing one):** every box and edge on the
   page traces to something real — a file, a symbol, a diff hunk. Proposed
   or speculative elements render visually distinct. This is the
   architectural equivalent of doc-to-html's "never invent a number."
2. **Choose views.** Pick the 1–3 views that answer the operator's actual
   question — containment/layers for "how is it organized," flow for "how
   does data move," before/after panes for "what changes," delta overlay for
   small refactors. Never render everything derivable.
3. **Render.** Single self-contained HTML file (inline CSS/JS/SVG, opens
   from disk).

## Visual language

**Superseded 2026-08-05** — see `arch-map-rename-and-visual.md` and specimen
`tmp/architecture-overview.html`. Historical dual-grammar notes below
(retained for archaeology):

**Dual layout grammars** (2026-08-05 redesign — see
`structure-view-visual-dual-grammar.md` and the working specimen
`tmp/2026-08-05-structure-view-visual-specimen.html`):

- **Containment / strata.** Layers as stacked bands with role rails and
  nested module cards via CSS — HTML's native strength. No SVG edges by
  default; adjacency and shared-band placement imply relations.
- **Flow / wires.** Swimlane columns; thick labeled SVG edges (≥2.75px) are
  first-class. Overlay redraws on resize (classic drift bug pinned). Hover
  isolates neighborhood.
- **Refactor semantics.** Change chrome outranks role: fill + border +
  corner badge. added / removed (ghosted + strikethrough) / moved (with
  "from X") / unchanged (dim ~0.38). Larger changes → before/after linked
  panes; small → delta overlay.
- **Role palette.** entry / domain / infra / external with rail + tinted
  wash; **mandatory legend** trimmed to what the page uses.
- **Own aesthetic.** Map-like orientation aid; dark high-contrast canvas;
  boxes are the primary surface. Step 0: only a sibling **arch page**
  counts as house style.
- **Mermaid escape hatch.** Dense graph-shaped views only; `mmdc` → inline
  SVG preferred; vendored script fallback; never CDN.
- **Interactivity.** Flow neighborhood focus; before/after `data-key`
  linking; tooltips carry paths; panes/lanes stack at phone width.

## Process rules

Inherited from doc-to-html where renderer-agnostic: one-pass generation,
direction change = clean rewrite, one knob at a time, styled scrollbars,
print stylesheet, narrow-screen behavior (panes stack).

New, structure-view-specific:

- **Traceability** (above) — no invented boxes or edges; proposed elements
  marked.
- **Provenance stamp.** Every view footed with "derived from `<paths /
  diff-range>` at `<commit>`" — ephemeral pages go stale; the stamp says
  stale-as-of-what.
- **View economy.** At most ~3 views per page; each opens by stating the
  question it answers.
- **Zoom discipline.** A view caps at ~30 visible boxes; beyond that, group
  and link deeper — never a 200-box canvas.
- **The invariant.** Refactor pages always state what does **not** change —
  the single most orienting fact in a refactor.
- **Default output path.** `tmp/<YYYY-MM-DD>-<slug>.html`; promote moves to
  `docs/` after a verify-and-polish pass.
- **Pre-finish checklist.** Parse-check; legend complete; every edge
  resolves to a real box; provenance stamp present; panes stack at phone
  width; print clean; styled scrollbars.

## Reference markup (embedded in the SKILL.md)

Role-palette tokens; layer-band shell; module card; SVG edge-overlay pattern
with its classic bug pinned shut (absolutely-positioned SVG must redraw on
container resize — ResizeObserver); before/after linked-pane pattern; legend
component; provenance footer; collapse/hover JS. Generic placeholders only,
per the repo's sanitization rule — no real product or path names.

## Packaging

- Canonical (only) copy at `plugins/toolkit/skills/arch-map/SKILL.md`
  — direct-use, self-contained; not mirrored to `.claude/`, not in the
  onboarding bundle.
- Origin doc: `docs/skills/arch-map.md` (active) /
  `docs/skills/deprecated/structure-view.md` (old name).
- `doc-to-html` description cross-points at `arch-map`.
- Shipped as `toolkit` `0.16.0` / `agent-workshop` `0.1.23` (bundled roster).

## Proof before landing

GREEN test per repo culture: fresh subagents given only the SKILL.md plus a
real scenario — one subsystem map, one refactor diff — must produce
conforming pages (traceable boxes, legend, provenance, view economy). A
failure revises the skill before it lands, not after.

## Non-goals

- Not a renderer for existing markdown docs (doc-to-html's lane) and not a
  general diagramming tool — the input is always this repo's code, diff, or
  plan.
- No runtime graph library as the primary path; auto-layout enters only
  through the mermaid escape hatch.
- No claim of field-proven conventions at birth: the origin doc records
  this as a designed-first skill and names the conventions most likely to
  move once real rounds land (view economy cap, box cap, role taxonomy).
