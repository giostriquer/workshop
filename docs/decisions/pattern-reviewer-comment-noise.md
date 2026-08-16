# Decision: pattern-reviewer comment-noise check

**Date:** 2026-06-05

## Status

Implemented.

## Context

`pattern-reviewer` is, by design, a runner against project-documented conventions:
its anti-pattern catalog lives in `docs/conventions/<domain>/`, and undocumented
project-specific rules are raised as observations, not findings. That discipline
keeps the agent from inventing rules.

One class of drift does not fit that model: redundant comments. Code-generating
models over-comment. They narrate the implementation line by line, repeat function
names as block headers, and write long comment blocks whose every claim is already
in the code. This noise inflates diffs, drifts out of sync with the code, and buries
the rare comment that carries intent or a warning. Operators end up trimming it by
hand after the fact.

This is near-universal hygiene, not a project-specific architectural convention, and
it is exactly the kind of thing a direct-use install (the `reviewers` plugin) should
catch in any repo, with no profile work done.

## Decision

Add a built-in **comment-noise** check to the canonical `pattern-reviewer` spec:

- It flags comments that only restate the adjacent code, narrate obvious control
  flow, repeat a name or signature as a header, or form a long block fully
  recoverable from the code, and recommends deletion or replacement-by-naming.
- It explicitly **keeps** comments that carry what code cannot: rationale / *why*,
  warnings and invariants, public-API intent, external references, legal headers,
  and `TODO`/`FIXME` markers. The flag-list plus keep-list stops the rule from
  degrading into "delete all comments."
- It applies in **all modes and regardless of domain**.

### Provenance carve-out

Because the check is a built-in universal rule rather than a documented project
convention, it is reported as a **finding even when the project documents no comment
conventions**. The spec's "raise undocumented project-specific rules as observations"
caveat is scoped to project-specific rules and explicitly does not apply to this
check. When a project documents its own comment conventions, the agent defers to
those. This carve-out keeps the spec internally consistent, without it, the new
section would contradict the anti-pattern-catalog discipline.

## Scope and parity

- Folded into canonical `.claude/agents/pattern-reviewer.md` (single source of
  truth) and rippled to its origin doc, the catalog note, and every byte-identical
  reference mirror (the `reviewers` payload plus the onboarding reference trees).
- Cross-host wrappers (`.codex` / `.gemini` / `.opencode`) are thin pointers to
  canonical and need no edit; they read the spec at runtime.
- The agent stays review-only: it reports comment noise; the implementer trims.

## Validation

`scripts/validate-native-plugin.ps1` prints `native plugin validation ok`
(byte-identity of the four shipped agents and the reference mirrors holds), and
`claude plugin validate ./plugins/reviewers` passes.
