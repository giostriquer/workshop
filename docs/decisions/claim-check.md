# claim-check: decisions in force

This is the rationale for the `claim-check` skill, shipped by the workbench plugin; superseded choices are omitted, and git history keeps the originals.

## Investigate a premise before acting on it (2026-06-15)

Operators kept hand-rolling one drifting request: check a ticket, hunch, or question against the current repo before acting. The skill captures that intent: every claim is a hypothesis, assumed neither true nor false, and "the premise still holds" is as good an outcome as "already handled." Fuzzy input becomes atomic claims first, asking the operator only when competing interpretations would change the investigation. Subagent briefs stay neutral and return evidence, prior work is always swept, and confirmed and obsolete conclusions both get an adversarial recheck. It is a skill because the main session must drive the fan-out.

## Provenance, repros, and depth (2026-06-16)

First real-ticket runs added four moves. It checks where the premise's evidence came from, since a tidy claim can rest on the wrong source of truth. A falsifiable code claim gets a throwaway repro as part of the search, never a fix: authorized repair waits for the verdict, and a standalone check ends at the report. Disagreeing subagents are settled by reading the disputed lines, not averaging, and depth is sized to the claim's blast radius.

## Grounded verdicts and an earned `inconclusive` (2026-06-16)

Two confident verdicts collapsed under operator pushback. So a claim earns `confirmed` or `refuted` only from the top of an evidence ladder (a repro that ran, source read firsthand, or the generating artifact), and a verdict is only as strong as its weakest load-bearing claim, each of which must pass a contest test. `inconclusive` is earned only after a deep search hits a real wall, and names the wall and the input that would breach it.

## A three-part, verdict-first report (2026-06-16)

The model filled every template slot, burying the verdict, so the fix deleted slots rather than reweighting them. The report is Verdict, Prior/parallel work, and Readiness, in plain text, without blockquote or echoed source. Readiness stays separate so a true premise can still be blocked, `mis-scoped` carries a corrected framing, and prior work keeps only what bears on the verdict, plus what was searched.

## Pause when the premise's source is unreachable (2026-06-19)

A session that could not open its ticket reconstructed the premise from memory and judged a resource it never saw. The skill now requires firsthand access to the premise's source and the artifact it concerns; when either is unreachable and the operator cannot supply it, that claim pauses, the report names the resource and what would unblock it, and independent claims proceed. Substituting a slug, ticket ID, memory, or inference is named and prohibited. The pause is a precondition failure, not `inconclusive`.

## Readiness shaped for scanning (2026-07-03)

A lived run rendered readiness, which implementers return to, as one dense paragraph. Only form failed, so the fix is a positive recipe, not a prohibition: a one-line call (actionable, blocked on what, or not actionable and what unblocks it, plus where to start), then labeled bullets per candidate direction with its trade-off and per gotcha, dependency, or unknown.

## Bulleted verdict evidence and a prior-work status (2026-07-07)

The next run wove repro cases, a root-cause chain, and a caveat into one verdict paragraph, hiding the comparison. The verdict now gives a headline and rationale, then labeled bullets per repro case, the `file:line` chain, and each caveat. Prior/parallel work opens with one status word (`clean`, `in-flight`, `related`, or `blocked`), because operators glance at it to learn whether anyone already owns the work.
