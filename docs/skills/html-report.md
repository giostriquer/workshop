# html-report

## What it does

Renders a report (an audit, a review, research findings) as **one
self-contained dark HTML page** with a sticky table of contents, keyboard
navigation, and a clean print layout. Later edits to the page follow rules, not
improvisation.

The source can be a markdown file on disk **or** material that exists only in
the conversation, such as an audit you just ran. Both meet the same bar.

It renders; it does not author. Everything in the source reaches the page or is
deliberately restructured, and nothing is invented to fill a layout. When the
representation has to be derived from code, use `arch-map`.

## When to reach for it

It is **user-invoked only** (`disable-model-invocation: true`). Type
`/html-report` to turn a report into a page, or to revise one: content tweaks,
section changes, severity ordering, matching the repo's report style, or "this
looks noisy / unreadable / ugly / off" feedback.

| The problem | The skill |
| --- | --- |
| Findings exist on disk or in this session, and you want a page | `html-report` |
| The representation must be derived from code, a diff, or a plan | `arch-map` |
| Nothing has been verified or found yet | `audit` (workbench), then bring its output here |
| You want a markdown document | No skill. Write the markdown. |
| UI behavior a still page cannot show | `ui-demo-video` |

## The two decisions it makes first

Both are settled before any markup.

### 1. Source shape

A markdown file is **checkable**: it is still there to diff against. Material
from the conversation is not, so four rules stand in for the diff:

- **Render what the work established.** No invented stat, severity, count, or
  extra finding to fill a sparse grid.
- **Carry the hedges across.** A claim marked uncertain, unverified,
  single-sourced, or agent-reported keeps that qualifier on the page.
- **Keep each claim married to its evidence.** The `file:line`, command output,
  or reproduction travels into the card.
- **The page becomes the only record.** Method and coverage-gaps sections are
  mandatory, where they are optional for a document source.

### 2. Output target

| Target | What gets emitted |
| --- | --- |
| Standalone file (default) | A complete document that opens from disk with no server. |
| Published artifact / embedded host | **Page content only**: `<title>`, `<style>`, markup, `<script>`. The host injects the skeleton; `body` gets an explicit background. |

## How it works

**Step 0: house style.** The skill first globs the repo (especially `tmp/` and
`docs/`) for a hand-authored `.html` report. If one exists, it sets the style;
the newest wins. The built-in dark design is a fallback.

**Every page gets,** regardless of style: one file with inline CSS and JS; a
scroll-spy TOC with `j`/`k` navigation that collapses below ~900px; surfaces
chosen by what the reader does; verified links only; styled scrollbars; a print
stylesheet.

**Finding cards** carry the id, claim, and evidence. Severity, evidence tier,
action, and cost appear only when the source establishes them. Assessed findings
run most-severe-first; unassessed ones stay grouped or in source order.

**Rigid rules:**

| Rule | Effect |
| --- | --- |
| One pass | The full HTML is generated at once. |
| Recomputed numbers | Totals come from rendered items; a disagreeing source is flagged. No invented numbers. |
| Edit vs rewrite | Content tweaks are targeted edits. A design-direction change, including a target switch, is a clean rewrite. |
| One knob at a time | It asks which element fails (contrast, density, hierarchy) and turns that one. |
| Renumbering | Updates every cross-reference, TOC entry, element id, and nav array, then greps to verify. |

An 11-item pre-finish checklist runs before handover.

## Common questions

**It ignored the dark design and matched another page in my repo.** That is
Step 0: a hand-authored report in the repo outranks the defaults. Ask for the
defaults and expect a clean rewrite ([decision](../decisions/html-report.md)).

**My source says "34 findings" and the page says 35.** The page counts what it
rendered, and the mismatch gets flagged in the completion summary.

**Will it renumber my findings and break my cross-references?** Not if your
source owns a stable, cross-referenced id scheme; that is preserved.
Renumbering governs only ids the skill assigns.

**Can it tighten my document while rendering?** No. The checklist confirms
nothing was dropped. Edit the document instead.

**Can it pull in Tailwind or a CDN?** No. No external assets, no build step.

**A link I asked for didn't ship.** Only fetched links ship, and some doc URLs
are JS-rendered and 404 to a server-side fetch. Relative links ship only when
the target file exists.

**Where does the file land?** For a document source: beside it, same basename,
`.html` extension. For a context source: it asks, or places it with the work's
other artifacts, not in a per-run temp directory.

**I switched output target and it rewrote everything.** Expected: the target
sets the document skeleton.

## It's working if

- The page opens from disk with no server, network, or build.
- The TOC tracks your position, `j`/`k` moves between sections, and every entry
  lands somewhere real.
- Findings are ordered as above, and cards carry only fields the source
  established.
- Printing gives a white page with no navigation chrome.
- At phone width the sidebar sits in normal flow; only wide tables and terminal
  blocks scroll sideways.
- From a context source: Method and coverage gaps are present, and hedged claims
  still read as hedged.

**Not working if** the stat grid shows a number your source never stated, or an
uncertain finding renders as confidently as a reproduced one.

## Where it fits

`html-report` ships in **`toolkit`**, the optional plugin; nothing in the
`workbench` flow requires it. It usually closes an investigation: `audit`,
`claim-check`, or `qa-sweep` produce the findings, and this skill makes them
shareable.
