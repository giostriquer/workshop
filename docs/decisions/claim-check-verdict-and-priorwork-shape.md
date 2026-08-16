# Decision: `claim-check` bullets the verdict's evidence and tags prior/parallel work with a status

**Date:** 2026-07-07

## Status

Implemented. Supersedes one clause of
[`claim-check-readiness-shape.md`](claim-check-readiness-shape.md): "verdict
and prior/parallel work deliberately stay prose."

## Context

The readiness reshape (2026-07-03) fixed the readiness section, and the very
next lived run showed the same failure class migrating one section up. The
verdict opened well (bucket, headline sentence) and then wove three repro
cases, a multi-hop root-cause chain, and a provenance caveat into one dense
paragraph, making parallel cases impossible to compare side by side. The
prior/parallel-work section was judged good on content, but gave no
first-glance answer to the question the operator actually brings to it: *is
anyone already on this, or am I clear?*

The prior decision had explicitly reasoned that verdict and prior/parallel
work could stay prose because they are "read once, top to bottom." Lived use
falsified that for enumerable verdict evidence (cases and caveats are
compared, not just read) and for the prior-work landscape (it is glanced
before it is read).

## The shape

Both are wrong-shaped-output failures (content complies, form doesn't), so per
`writing-skills` "match the form to the failure" both fixes are positive
recipes, not prohibitions:

- **Verdict:** headline sentence + a one-two-sentence rationale (method and
  ladder rung), then the evidence as short labeled bullets: one per repro
  case with its observed-vs-expected result, one for the root-cause chain of
  `file:line` hops, one per caveat or limit on the evidence, so parallel
  cases and caveats sit side by side.
- **Prior / parallel work:** opens with a one-word status: `clean` (nothing
  found that addresses or constrains it), `in-flight` (parallel work underway:
  coordinate first), `related` (nothing touches it directly, but merged or
  adjacent work bears on the fix), `blocked` (other work must land first);
  when several apply, pick the one the operator must act on first. The body
  stays prose: the content contract (only what bears on the verdict, plus
  the what-was-searched line) is unchanged.

The Rules summary bullet gains the matching clauses ("bullet the verdict's
evidence; open prior/parallel work with its one-word status").

## Validation

RED is the lived run above (ABC-123 claim-check; dense verdict paragraph, no
prior-work status). The wording was micro-tested 5-vs-5 before landing: ten
one-shot subagents wrote the final report from identical raw notes
reconstructed from the real failing run: five against the incumbent Output
contract, five against the recipe. All five incumbent reps reproduced the
dense-verdict failure (cases, chain, and caveats inline in one paragraph; no
prior-work status). All five recipe reps converged on the same shape:
verdict headline + rationale, then repro-case / root-cause / caveat bullets;
prior/parallel work opening with a status word, and all five independently
chose the same status (`related`) for the same evidence, so the tag
definitions are binding, not decorative. Readiness kept its recipe shape in
all ten reps. Clear separation, low variance on the winning arm; no loopholes
surfaced, so no refactor pass was needed.

- `scripts/validate-native-plugin.ps1` passes.

## Non-goals

- No change to the three-part report structure, the verdict buckets, the
  content contract of any section, or the investigation steps; this is
  presentation only.
- The `description` (triggering conditions) is unchanged.
- Readiness is untouched (already recipe-shaped by the prior decision).

## Packaging

Canonical `plugins/toolkit/skills/claim-check/SKILL.md` edited (the only copy;
claim-check ships in the toolkit plugin alone). Origin doc
`docs/skills/claim-check.md` updated for parity (including a superseded-note
on the readiness-shape refinement's stay-prose clause). `toolkit` `0.12.0` →
`0.12.1` across the three plugin manifests and `.claude-plugin/marketplace.json`.
