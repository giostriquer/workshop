# Pattern review includes comment noise

## A built-in check with a provenance exception (2026-06-05)

The pattern reviewer normally derives findings from project-documented
conventions. Redundant comments are a built-in exception: narration, repeated
signatures, obvious control flow and prose recoverable from adjacent code can
be findings even when the project has no comment policy. Otherwise the reviewer
would miss the same noise in every newly adopted repository.

Keep rationale, warnings, invariants, public API intent, external references,
legal headers and useful TODO/FIXME markers. Project comment rules take
precedence. Other undocumented project-specific preferences remain observations,
not invented conventions.

The canonical contract is
[`plugins/workbench/agents/pattern-reviewer.md`](../../plugins/workbench/agents/pattern-reviewer.md).
The agent reports findings and never edits. At delivery,
[`trim-comments`](../skills/trim-comments.md) performs the separate edit pass;
code review reports the remaining concerns within its own rubric. Historical
reviewer-plugin mirrors and onboarding reference trees are no longer active.
