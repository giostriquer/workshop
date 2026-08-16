# Decision: `claim-check` readiness is shaped for scanning

**Date:** 2026-07-03

## Status

Implemented.

## Context

Observed in lived use: a claim-check run produced a strong verdict and
prior/parallel-work sweep, but rendered the readiness section as one dense
paragraph: the three candidate directions inline as "(a) … (b) … (c) …" with
the gotchas, dependencies, and adjacent-scope notes woven into the same prose.
The operator flagged it: verdict and prior-work read fine as paragraphs, but
readiness (the one section an implementer *returns to* while acting) was hard
to scan.

The Output contract's readiness item was a content list, not a shape: "if
actionable, where to start, the relevant code / docs, gotchas, dependencies,
open unknowns; if not, exactly what is missing or what decision unblocks it."
Nothing told the model how that content should sit on the page, so under the
report's overall "concise, verdict-first" pressure it defaulted to prose.

## The shape

Per `writing-skills` "match the form to the failure": this is a
**wrong-shaped-output** failure (the model complies on content), so the fix is
a **positive recipe** stating what readiness *is* rather than a prohibition on inline
options, which backfires on shaping problems. The Output item now reads:
readiness opens with a one-line call (actionable, blocked-and-on-what, or
not-actionable-and-what-unblocks-it, plus where to start when there is one),
and the substance follows as short labeled bullets: one per candidate
direction with its one-line trade-off (recommendation marked when there is
one), one per gotcha, dependency, or open unknown, each anchored to the
relevant code or docs. The Rules summary bullet gains the matching clause
("shape readiness as a one-line call followed by labeled bullets").

Verdict and prior/parallel work deliberately stay prose; they are read once,
top to bottom; only readiness is scan-shaped.

## Validation

RED is the lived run above (readiness as a dense inline-options paragraph).
The wording was micro-tested 5-vs-5 before landing: ten one-shot subagents
wrote the final report from identical raw notes reconstructed from the real
failing run: five against the incumbent Output contract, five against the
recipe. All five incumbent reps left at least the gotchas as dense prose (one
reproduced the fully-inline failure verbatim) and scattered across three
different shapes; all five recipe reps converged on the same scannable shape:
one-line call, direction bullets with the recommendation marked, gotcha /
non-issue / adjacent-scope bullets, with verdict and prior-work still prose.
Clear separation, low variance on the winning arm; no loopholes surfaced, so no
refactor pass was needed.

- `scripts/validate-native-plugin.ps1` passes.

## Non-goals

- No change to the three-part report structure, the verdict buckets, or the
  investigation steps because this is presentation-of-readiness only.
- The `description` (triggering conditions) is unchanged: *when* to reach for
  the skill hasn't changed.

## Packaging

Canonical `plugins/toolkit/skills/claim-check/SKILL.md` edited (the only copy;
claim-check ships in the toolkit plugin alone). Origin doc
`docs/skills/claim-check.md` updated for parity. `toolkit` `0.11.1` → `0.11.2`
across the three plugin manifests and `.claude-plugin/marketplace.json`.
