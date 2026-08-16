# Decision: `handoff-pr` delivers in exactly one mode: file by default, `inline` on request

**Date:** 2026-07-07

## Status

Implemented.

## Context

The deliver step said: print the artifact inline **and** write it to
`tmp/handoff-pr-<branch-slug>.md`. In lived use that duplicated a long artifact;
the full PR body plus handoff notes landed in the session output *and* in the
scratch file. The file is the useful copy (the authorized session reads it);
the inline dump was noise on top. But sometimes the operator wants the opposite:
the artifact in-session with no scratch file left behind.

## The shape

Delivery becomes a single-mode conditional keyed to the invocation argument:

- **Default (no argument):** write the `tmp/` file and report the path; the
  in-session output is the path plus the PR title, not the full artifact.
- **`inline`** (`/handoff-pr inline`): print the full artifact in-session and
  write **no** file anywhere.

A rule reinforces it: exactly one mode, never both. Form (per `writing-skills`
"match the form to the failure"): the baseline produced the wrong output shape
(double delivery), so the fix is a conditional on an observable predicate (the
argument) plus a recipe for each mode's output instead of a bare prohibition.

The `description` gains one sentence naming the default and the `inline` option,
matching the house style set by `handoff-review` (whose description documents its
`handoff`/`continue` arguments).

## Non-goals

- No change to what the artifact contains, template derivation, ticket
  detection, validation provenance, or the never-open-the-PR rule.
- No change to the sibling handoff skills; `handoff-goal` and `handoff-review`
  have their own delivery semantics.

## Packaging

- Canonical `plugins/toolkit/skills/handoff-pr/SKILL.md` edited (sole copy; not
  in the repo's own `.claude/` working set or the onboarding bundle). Origin doc
  `docs/skills/handoff-pr.md` updated for parity.
- `toolkit` `0.12.1` → `0.12.2` across all four manifests.

## Validation

The RED is the lived double delivery above (operator report: every run produced
both the tmp artifact and the full inline dump). GREEN check: `/handoff-pr`
yields the file plus a path-and-title report with no full inline artifact;
`/handoff-pr inline` yields the inline artifact and leaves `tmp/` untouched.
`scripts/validate-native-plugin.ps1` passes with the unchanged skills set.
