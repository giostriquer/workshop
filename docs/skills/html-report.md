# html-report

> **Looking for `doc-to-html`?** This is it. The skill was renamed to
> `html-report` and widened at the same time: the old name described the input,
> the new one describes the artifact. Saved invocations of `/doc-to-html` no
> longer resolve. ([decision](../decisions/html-report-rename-and-context-source.md))

## What it does

Takes a report (an audit, a review, a set of research findings) and renders it
as **one self-contained dark HTML page** that reads calmly on screen, navigates
with a sticky table of contents and keyboard keys, and prints clean. Then it
governs how that page gets edited afterward, which is the half people don't
expect: inserting a section, reordering findings, or reacting to "this looks
noisy" all run through rules rather than improvisation.

The source can be a markdown file on disk **or** material that only exists in
the conversation: an audit you just ran, findings gathered across a session, a
verdict reached in-thread. Both produce the same page to the same bar. What
changes is how fidelity gets enforced, because when there is no file there is
nothing to diff the page against.

It is a **renderer with edit governance, not an author**. It does not pick your
content, restructure your argument, trim your examples, or decide what matters.
Per the skill's non-goals, it is "not a general frontend-design skill," it ships
"no external assets, build steps, or frameworks," and the context source "widens
where content comes *from*; it does not license authoring it." If you need the
representation itself derived from code, that is `arch-map`.

## When to reach for it

It activates on its own description: turning "a report, audit, review, or
research/findings into a polished self-contained dark-themed HTML page: whether
the source is a markdown document or material that exists only in the
conversation, or when revising such a page." Revision triggers are explicit and
include "content tweaks, inserting/moving/renumbering sections, ordering findings
by severity, matching the repo's existing report style," and "this looks noisy /
unreadable / ugly / off" feedback.

Fitting situations: a markdown audit deck that should be shareable; a QA findings
list you want ordered by severity with evidence attached to every card; a
research doc that needs a real table of contents; a page you already generated
that needs a section inserted mid-document without breaking its ids.

| The problem | The skill |
| --- | --- |
| Findings already exist on disk or were reached in this session, and you want them as a page | `html-report` |
| No findings exist yet; the representation has to be derived by reading code, a diff, or a plan | `arch-map` |
| You don't have findings yet at all: something needs verifying or hunting first | `audit` (workbench), then bring its output here |
| You want a markdown document, not a page | No skill. Write the markdown. |
| The change is UI behavior that a still page cannot show | `ui-demo-video` |

## The two decisions it makes first

Before any markup gets generated, two things get settled. Both are expensive to
change later.

### 1. Source shape

| Source | Fidelity is | What that means for you |
| --- | --- | --- |
| A markdown file on disk | **Checkable** | Every section, finding, and number in the source either appears in the page or was deliberately restructured. The file is still there to diff. |
| Material from the conversation | **A discipline, not a check** | Four rules stand in for the diff you no longer have. |

The four rules that bind a from-context render:

- **"Render what the work established, never what would round it out."** No
  invented stat, severity, count, or fourth finding "because a grid looks sparse
  with three."
- **"Carry the hedges across."** A claim the session marked uncertain,
  unverified, single-sourced, or agent-reported ships with that qualifier visible.
  "Confidence is content; a page that renders every finding at identical
  certainty misreports the work that produced it."
- **"Keep each claim married to its evidence."** The `file:line`, command output,
  or reproduction that proved a claim in-session travels into the card with it.
- **"The page becomes the only record."** When the session ends, nothing else
  survives, so a Method section and a coverage-gaps section are **mandatory**
  here, where they are optional for a document that still exists on disk.

### 2. Output target

Decided "**before generating**, because the two targets need different document
skeletons and a wrong guess is a full rewrite."

| Target | What gets emitted |
| --- | --- |
| Standalone file (default) | A complete document with `<!doctype html>`, `<html>`, `<head>`, and `<body>` that opens from disk with no server. |
| Published artifact / embedded host | **Page content only**: a `<title>`, then `<style>`, markup, and `<script>`. The host injects the skeleton. Emitting your own "nests a document inside a document." Style `body` from CSS and set an explicit background, or a transparent body "borrows the host's ground." |

Everything else in the skill applies unchanged to both.

## How it works

**Step 0: match the repo's house style first.** Before applying any default,
the skill globs the repo (especially `tmp/` and `docs/`) for an existing
hand-authored standalone `.html` report, excluding generated output
(`node_modules/`, `dist/`, `coverage/`, `playwright-report/`, `.next/`). A
candidate counts only if it has an inline `<style>` block and prose content.
Minified or tool-emitted pages do not qualify. "If one exists, it is the house style." Several
qualify? The most recently modified one wins. The skill's own design system is
explicitly labelled **fallback only**.

**Architecture that ships on every page regardless of aesthetic.** House style
governs *visual treatment*; it "never waives the architecture bullets." The
requirements are a single self-contained file with inline CSS and JS; a ~288px sticky TOC sidebar
with scroll-spy and `j`/`k` keyboard navigation driven by one explicit array of
section ids; surfaces picked by reader action (facts sharing attributes → table,
ordered process → stepper, findings → card, nuance → dashed caveat box, bulk
output → terminal block or appendix); verified links only; styled scrollbars on
every scroll container; a print media query. Below ~900px the sidebar collapses
into static flow: "a fixed 288px rail otherwise eats a phone's whole viewport."

**The finding card contract.** For audit, QA, and review output, each card is
id + severity/evidence chips → a one-line **claim** in a quote box → an
**Evidence** line that is concrete ("a live result, `file:line`, or an appendix
cite") → a **Fix** line with a cost pill. "The headline states the finding; the
body proves it and says what to do. Concise beats extensive, but never a claim
without its evidence." Findings are ordered by severity descending, always.

**Rigid process rules.** These do not bend to taste:

| Rule | Effect |
| --- | --- |
| One pass | The full HTML is generated in a single pass. |
| Derived numbers are recomputed | Totals and per-section counts come from the items actually rendered. A source that disagrees with itself gets the recomputed value plus a flag in the completion summary: "never silently ship either side." |
| The layout never invents numbers | No stat cell, percentage, or count the source doesn't back, "even when a grid slot looks empty without one." |
| Targeted edit vs clean rewrite | Content tweaks are targeted edits. A change of design *direction*, including matching a house style found late or switching output target, "is always a full clean rewrite." |
| One knob at a time | Dislike the result? The skill asks which specific element fails (contrast, density, hierarchy) and turns that one knob. |
| Renumbering procedure | Any insert, move, drop, sort, or re-group renumbers via descending replace-all or a temp placeholder, then updates every cross-reference, TOC entry, element id, and the keyboard-nav order array, and verifies with a grep. |

An 11-item pre-finish checklist runs before the page is handed over: parse
check, TOC targets resolve, severity order, styled scrollbars, badge alignment,
no dropped content, links fetched, print block, phone width, output target
honored, and (context sources only) hedges and evidence intact with Method and
coverage gaps present.

## Common questions

**I invoked `doc-to-html` and nothing happened.** The skill is `html-report`
now, and a rename breaks any saved invocation. The old name described the
input; the new one describes the artifact, which is what stays true now that a
report can come from a file or from the conversation. Older decision notes and
attic files still say `doc-to-html`; they record what was true when written.

**It ignored the dark design system and matched some other page in my repo.**
That is Step 0 working. A hand-authored HTML report already in `tmp/` or `docs/`
outranks the skill's defaults, because a field round found that applying the
built-in aesthetic without checking produced "a full wrong-aesthetic first pass
that had to be thrown away and rewritten against a sibling artifact"
([decision](../decisions/doc-to-html.md)). If you want the defaults instead, say
so. That is a design-direction change, so expect a clean rewrite rather than a
patch.

**My source says "34 findings" and the page says 35.** The page is right and the
divergence should be called out in the completion summary. A real run hit exactly
this: a source claiming "34 findings: 11/12/8/4," which sums to 35. Derived
numbers are recomputed from what actually rendered, and the mismatch gets flagged
rather than silently resolved either way.

**Will it renumber my findings and break my cross-references?** Not if your
source owns its ids. Severity ordering carries an explicit exception: "when the
source already carries a stable, cross-referenced id scheme of its own, preserve
those ids and skip reassignment: the Renumbering procedure governs ids this
skill assigns, not ids the source owns."

**Can it tighten my document while rendering: cut the examples, reorder for
readability?** No. Information-architecture and content-discipline guidance was
evaluated and rejected as out of scope: both "violate 'renders and maintains what
the markdown says' and the no-dropped-content checklist item." If your document
needs editing, edit the document.

**Can it pull in Tailwind or a CDN to look better?** No. External assets were
rejected because they break the opens-from-disk, print, and archive contract. The
page is self-contained by design. (`arch-map`, its sibling, does allow CDNs: the
two skills made different calls here deliberately.)

**A link I asked for didn't ship.** Verified links only: "Don't ship a link you
didn't fetch." Known trap: "some canonical-looking doc URLs are JS-rendered and
404 to a server-side fetch," so a URL that looks obviously right can still fail
verification. Relative links are checked by confirming the target file exists.

**Where does the file land?** For a document source: same directory, same
basename, `.html` extension. For a context source: it asks, or places the page
where the work's other artifacts live: "never a per-run temp directory unless
the page is genuinely throwaway."

**I told it the wrong output target and now it's rewriting everything.** Expected.
Switching target changes the document skeleton, and the skill classifies that as
a design-direction change, which is always a full clean rewrite rather than an
incremental restyle.

## It's working if

- The page opens from a double-click with no server, no network, and no build.
- The TOC highlights the section you're reading, `j`/`k` moves between sections,
  and every TOC entry lands somewhere real.
- Findings run most-severe-first, and every card carries a concrete Evidence line
  and a Fix with a cost pill.
- Printing gives you a white page with dark text and no navigation chrome.
- At phone width the sidebar has collapsed into normal flow and nothing scrolls
  sideways except things meant to (wide tables, terminal blocks).
- From a context source: the Method section says how the work was produced, a
  coverage-gaps section says what it didn't cover, and hedged claims still read as
  hedged.

**Not working if** the hero's stat grid shows a number your source never stated,
or a session's uncertain finding renders with the same confidence as a reproduced
one. Both mean the fidelity rules got skipped, which is exactly the failure mode
the from-context rules exist to prevent, since with no file on disk nothing else
would catch it.

## Where it fits

`html-report` ships in **`toolkit`**, the optional plugin, rather than in the
`workbench` process core. Toolkit is the grab-bag of artifact-making utilities
you install alongside workbench when you want them and skip to keep sessions
lean. Nothing in the workbench flow requires it. In practice it sits at the end
of an investigation: workbench's `audit`, `claim-check`, or `qa-sweep` produce
the findings, and `html-report` turns them into something you can hand to
somebody else.
