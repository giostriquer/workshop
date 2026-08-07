# arch-map

> Canonical skill: [`plugins/toolkit/skills/arch-map/SKILL.md`](../../plugins/toolkit/skills/arch-map/SKILL.md).
> Visual language (deep-dark glass):
> [`../decisions/arch-map-idoso-visual.md`](../decisions/arch-map-idoso-visual.md);
> shipped specimens
> `plugins/toolkit/skills/arch-map/references/subsystem-specimen.html`,
> `plugins/toolkit/skills/arch-map/references/refactor-specimen.html`.
> Historical Cursor-dark note:
> [`../decisions/arch-map-rename-and-visual.md`](../decisions/arch-map-rename-and-visual.md).
> Pipeline history: [`../decisions/structure-view.md`](../decisions/structure-view.md).
> Former name: [`deprecated/structure-view.md`](deprecated/structure-view.md).

## Origin

The recurring want: *"I'm mid-refactor and I want to see what's moving —
but there's no document to render."* `doc-to-html` couldn't take the job,
by design: its fourth-round comparative evaluation had already drawn the
boundary — "information-architecture / content-discipline guidance belongs
to an author, not a renderer" — and its rigid contract ("no markdown content
dropped," "never invent a number") is precisely what makes it trustworthy
for audits. Broadening it would have dissolved that. The authoring job was
simply unowned.

`arch-map` (formerly `structure-view`) takes it: derive the representation
— from the repo, a diff, or a plan — then render a page whose first job is
a **graphical mental model**, not an inventory dump.

**A design-first birth, recorded honestly.** Unlike its siblings, this skill
was not distilled from accumulated field rounds; the operator chose a full
design over incubation (see `docs/decisions/structure-view.md`), with two
compensating controls: GREEN tests before landing (fresh subagents given
only the SKILL.md must produce conforming pages), and this doc naming which
conventions are provisional until real rounds harden them (see Maturity).

**Rename (2026-08-05).** `structure-view` was hard to type and did not
signal purpose. `arch-map` reads as "architecture map" and matches how
operators ask for the work.

**Visual hardening (2026-08-05).** Same-day dual-grammar role-rainbow and
quiet-light passes were rejected. Cursor-dark specimen
`tmp/architecture-overview.html` established mental-model-first + scarce
color.

**Deep-dark glass final pattern (2026-08-07).** Operator selected the
deep-dark glass language as the skill fallback: near-black gradient, glass
cards, Inter + JetBrains Mono, sky accent `#38bdf8`, emerald eyebrow,
rose/emerald refactor panes. Specimens were later sanitized and shipped
inside the skill package (`references/`) so adopters do not depend on
workshop-local `tmp/` files. See `arch-map-idoso-visual.md`.

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

And one observed after withdrawal: **inventory without a mental model** —
cards and lists that never give the eye a system picture. The page must
open with a graphical map.

## Solution shape

A three-phase pipeline the renderer-sibling deliberately lacks, then a
render contract:

- **Derive.** Mine the input per shape — subsystem (entry points → modules
  → edges; architecture / dependency-rule tests preferred; explore
  subagents for large surfaces), refactor (diff classified; the
  **invariant** identified), proposed design (plan extracted; real refs
  verified; rest dashed). Load-bearing rule: **traceability** — every box
  and edge traces to a real file, symbol, or diff hunk.
- **Choose views.** Mental-model diagram is **required**. At most 3
  supporting views, each opening with the question it answers
  (containment, flow, before/after, delta). Deriving more than you show is
  fine; showing everything is not.
- **Render.** Single HTML file (CDNs allowed for fonts, Lucide, Mermaid),
  landing in `tmp/<date>-<slug>.html` — ephemeral-first — with a
  **promote** pass when durable. Every view footed with **provenance**
  (live `git rev-parse` at generation time).

Visual defaults (see `arch-map-idoso-visual.md`): deep-dark glass —
near-black gradient, Inter + JetBrains Mono, accent `#38bdf8`, green/red
only for rules and refactor good/bad; **no role rainbow**; SVG or
Today|Target graph first, inventory after. Worked specimens ship with the
skill under `references/`. Fit rules are part of the skill contract (short
SVG labels, wrap CSS, spot-check) — no runtime harness required to use it.

Process rules inherited from `doc-to-html` where renderer-agnostic: one-pass
generation, direction change = clean rewrite, one knob at a time, styled
scrollbars, print stylesheet, narrow-screen stacking. Step 0 house-style
matching: only a hand-authored **arch-page** sibling governs (genre test:
structural graphics dominate).

## Real invocation snippet

> /arch-map show me how the plugin system is structured

Derive (entry points, modules, edges), mental-model SVG + layers, `tmp/`
page with legend and provenance.

> /arch-map what does the relay-sync branch actually move?

Diff classified, before/after panes with good/bad chips, the invariant
stated ("the wire protocol does not change").

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
- **Inventory without a map (observed — post-withdrawal iteration).** Pages
  that are only cards/lists fail orientation. Mental-model SVG is required.
- **Role rainbow (observed — 2026-08-05).** Painting every module by
  entry/domain/infra/ext hurt readability. Color reserved for accent +
  good/bad only.
- **Legend drift.** A stroke style used on the diagram but missing from the
  legend — the page becomes self-decoding only to its author.
- **Low-contrast body on dark (observed — 2026-08-05).** Mid-grey text on
  near-black fails; body uses `--ink` / `--soft`.
- **Report furniture on an arch page.** Reaching for `doc-to-html`'s cards
  and chips because they're nearby. Different genre.
- **Stale ephemeral pages trusted later.** Provenance stamp makes staleness
  checkable; promote re-verifies.

## Maturity

Provisional until hardened by real rounds — expect these to move:

- The **view cap (3 supporting)** and **box cap (~30)** are design-review
  numbers, not field-calibrated ones.
- The **genre test** in Step 0 (structural graphics dominate) has not yet
  had to classify a hard case.
- **CDN fonts / Lucide / Mermaid** are accepted for local orientation pages;
  promote-to-durable may later require offline-safe bundling — undecided.

**Round 1 (2026-07-31) — cross-repo field exercise** (under the old name).
A fresh session derived a three-view page of a real external codebase (the
artifact landing in this repo's `tmp/`). All checks passed — provenance
read live from the *source* repo, the house-style sibling correctly adopted
from the *output* repo — and five gaps folded back into the skill. See
deprecated origin for the full round write-up.

**Visual iteration (2026-08-05 → 2026-08-07).** Dual-grammar rainbow → quiet
light → scratch rebuild → Cursor-dark specimen → deep-dark glass accepted as
skill fallback. **Package self-containment (same day):** sanitized specimens
ship inside the skill package so plugin adopters are not pointed at
workshop-local `tmp/` files (`arch-map-idoso-visual.md`).

Record further rounds here as they land.

## Adaptation notes

- Output path (`tmp/`, promote to `docs/`) follows this scaffold's scratch
  conventions; point both at your project's equivalents.
- Traceability, provenance, view economy, zoom discipline, and
  mental-model-first are the portable half — they apply to any visual
  style.
- Sibling boundary: `doc-to-html` renders finished documents (including
  documents *about* architecture); `arch-map` owns the doc-less cases. The
  two descriptions should cross-point so sessions route by input, not topic.
