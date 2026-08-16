# Decision: `doc-to-html` becomes `html-report`, and accepts a context source

**Date:** 2026-08-12

## Status

Implemented. Supersedes the naming and input contract in
[`doc-to-html.md`](doc-to-html.md); that note stays as the skill's origin
history.

## Context

The skill was built to render *a markdown file on disk*. In real use the more
common shape turned out to be different: a session produces the report: an
audit, a review, a set of findings, and the operator wants it as a page
without a markdown file ever existing. The name `doc-to-html` describes the
file case and actively mis-signals the other one, and the body's rules all
assumed a source that could be diffed against.

A second, smaller pressure: the same page can ship two ways: a standalone
file that opens from disk, or content published into a host that injects its
own document skeleton. Emitting the wrong skeleton for the target is not a
tweak; it is a full rewrite, and the skill said nothing about it.

## The change

**Renamed** `doc-to-html` → `html-report`. The old name described the input;
the new one describes the artifact, which is what stays true across both
source shapes.

**Two source shapes, one standard.** A document on disk, or material that
exists only in the conversation. The quality bar is identical; what differs is
how fidelity is enforced. With a file, fidelity is *checkable*: the source is
still there to diff. From context there is nothing to diff against, so the
skill carries four rules that do that job by discipline:

- render only what the work established, never invent a stat, severity, or
  finding to fill a layout slot (the existing never-invent-numbers rule,
  generalized past numbers);
- carry the hedges across, so an uncertain or agent-reported claim ships with
  its qualifier visible;
- keep each claim married to the evidence that proved it in-session;
- Method and coverage-gaps sections become **mandatory**, because when the
  session ends the page is the only surviving record of how it was produced.

**Output target is now an explicit up-front decision**: standalone file
(carries its own `<!doctype>`/`<html>`/`<head>`/`<body>`) versus published
artifact or embedded host (carries none, and must set an explicit `body`
background or it inherits the host's ground). Chosen before generating,
because switching after the fact is a design-direction change and those are
always clean rewrites.

**Sibling boundary redrawn.** `arch-map` previously separated itself with
"three input shapes, all doc-less", which stops discriminating the moment
`html-report` also accepts doc-less input. The line moved from *does a
document exist?* to *who authors the content*: `html-report` renders findings
that already exist (on disk or reached in-session) and may never invent;
`arch-map` authors the representation by reading code and traces every element
to a file, symbol, or diff hunk.

## Riding along: the token trims this skill's own audit found

A token-efficiency audit of all 23 skills flagged ~350–450 words of prose slack
here, applied during the rewrite: the "Suggested invocation" section (every
arrow pointed at a rule already stated), the thrice-stated house-style
precedence rule, the re-narration of the interactive chrome's own inline code
comments, the print-block cross-reference bookkeeping, and the Purpose
section's meta-commentary about why the skill's rules exist.

Measured, not assumed: the skill still grows **2,306 → 2,558 words** (+11%).
The trims returned roughly 400 words; the two new sections cost roughly 650.
Worth stating plainly rather than claiming the rewrite paid for itself; it
did not. The added capability is the justification, not a size win.

## Packaging

- Canonical spec moves to `plugins/toolkit/skills/html-report/SKILL.md`; the
  old directory is deleted.
- Live references updated: both marketplace files, all three toolkit plugin
  manifests, `README.md`, `plugins/toolkit/README.md`, `arch-map`'s four
  sibling references, and `scripts/validate-native-plugin.ps1`'s
  `ExpectedSkills`.
- Historical references in `docs/decisions/`, `attic/`, and the older
  `docs/change-log.md` sections keep the old name; they record what was true
  when written.
- `toolkit` `0.1.2` → `0.2.0` (a rename breaks any saved invocation).

## Non-goals

As stated in the origin note, this is not a general frontend-design skill, has no
external assets or build steps, and the skill still does not pick the
report's content; it renders what the source establishes. The context source
widens where content comes *from*; it does not license authoring it.
