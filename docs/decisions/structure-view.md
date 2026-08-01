# Decision: structure-view — derive-and-render architectural pages (design)

**Date:** 2026-07-31

## Status

**Withdrawn from shipping (2026-07-31, same day it landed).** After the
first cross-repo exercise and two design generations of its output, the
operator pulled the skill from the toolkit payload: more thought is needed
before it ships. The draft SKILL.md (including the GREEN-round and round-1
refinements) is parked at `structure-view-skill-draft.md`; the origin doc
carries a draft banner; packaging reverted (toolkit `0.15.2`, roster back to
eleven skills, doc-to-html cross-pointer removed). This spec remains the
design of record for whenever work resumes.

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

- **Containment-first.** Layers as horizontal bands, swimlanes, nested
  module cards via CSS grid/flex — HTML's native strength. Hand-authored
  inline SVG only for cross-cutting arrows, kept few (bundle edges; prefer
  adjacency and shared-band positioning to imply relations).
- **Refactor semantics.** added (green) / removed (red, ghosted) / moved
  (amber, with "from X" provenance) / unchanged (dim). Larger changes get
  before/after panes with hover-linked highlighting; small refactors get a
  single delta view.
- **Role palette.** One consistent accent-per-architectural-role scheme
  (entry / domain / infra / external) reused across pages, with a
  **mandatory legend** — every color and shape used on the page appears in
  it.
- **Own aesthetic.** Map-like and quieter than doc-to-html's report
  furniture; dark, but boxes are the primary surface. The house-style Step 0
  is inherited *adapted*: only a sibling **arch page** counts as house
  style — a report sibling is a different genre and does not govern.
- **Mermaid escape hatch.** Only for genuinely graph-shaped views (dense
  dependency webs) where hand layout fails. Preferred form: pre-render at
  authoring time via `mmdc` to inline SVG (self-contained, small,
  restylable). Vendored-inline mermaid script is the fallback when `mmdc`
  is unavailable; accept the file-size cost knowingly.
- **Interactivity.** Hover highlights a node/edge neighborhood; layers
  collapse; tooltips carry the file paths behind a box; keyboard nav
  between views.

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

- Canonical (only) copy at `plugins/toolkit/skills/structure-view/SKILL.md`
  — direct-use, self-contained; not mirrored to `.claude/`, not in the
  onboarding bundle.
- Origin doc at `docs/skills/structure-view.md` (recording the design-first
  birth and which conventions await field rounds); roster entry in
  `docs/skills/README.md`.
- `doc-to-html` description gains the cross-pointer clause; its origin doc
  notes the sibling split.
- `toolkit` `0.14.1` → `0.15.0` (new skill = minor bump) in the three plugin
  manifests + the Claude marketplace entry; validator `$expectedSkills`
  widened; root and plugin `README.md` skill lists; Codex manifest prose and
  `defaultPrompt` gain the new entry.

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
