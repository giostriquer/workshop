# Decision: route-work — operator recalibration; reduced to a pure reference table

**Date:** 2026-08-12

## Status

Implemented.

## Context

Two things landed together:

1. **Operator recalibration of the canonical table.** The sol ladder
   collapsed from four rungs to two (low/medium and a re-graded xhigh —
   cost 6, intelligence 8.5, taste 8.5, code 9); `gpt-5.6-luna`
   (default: max — cost 10, flat 5s) replaces `gpt-5.6-terra` as the
   mechanical-bulk lane; `opus-5` re-graded to flat 8s; sol low/medium
   taste settled at 7. The table edit was the operator's own; the routing
   prose ("sol high is the workhorse", "climb xhigh then ultra/max",
   "opus-5 ties fable on code", four terra mentions, both worked examples)
   still described the old table and was reconciled to the new numbers.
2. **Trim of the calibration-history narrative.** The skill carried an
   18-line "Calibration notes" block — benchmark citations, the Opus 5
   launch story, opus-4.8's retirement. That is how-the-table-was-made
   history, owned by `docs/skills/route-work.md` and the route-work
   decision notes; in the shipped skill it was dead weight and, after the
   recalibration, factually wrong. Replaced by a three-sentence operational
   note: values are the operator's calibration (adopters re-grade) + the
   cross-subscription caveat.

A staleness sweep rode along: the skill's `/toolkit:route-work` invocations
became `/workbench:` — route-work has shipped in workbench since the split —
and the `code-quality-reviewer` agent's fallback path ("inside the toolkit
plugin") was fixed to workbench. The rest of the shipped set was checked: no
other skill embeds made-of history (provenance footers are one line by
design), and the remaining `toolkit` mentions (`writing-skills` ships there)
are accurate.

3. **Hard reduction to a reference table (operator escalation, same day).**
   The reconciled version still read as a dispatch procedure — a five-axis
   grading rubric, four named process patterns, a three-line output
   contract, worked examples, dispatch mechanics (codex flags, courier
   wrappers), and a description that fired "when a task is about to be
   dispatched." The operator's verdict: too much slop; the skill is **just
   a reference table**, must not be invoked before every subagent dispatch,
   and must not mention programmatic usage. Everything procedural was cut.
   What remains: the table with its axis definitions, the calibration
   note + cross-subscription caveat, the hard invariants, and four
   reading-notes bullets. The description was rewritten as a lookup trigger
   ("a lookup, not a process — not a step before every dispatch"). Roster
   surfaces (both READMEs, `docs/skills/README.md`, the Codex
   `defaultPrompt`) updated from "recommends a route before dispatch" to
   reference-table wording; the origin doc records the reduction and keeps
   the rubric era as history.

## Non-goals

- No rubric, invariant, or output-contract changes — the recalibration
  changes which routes the same rubric yields, nothing else.
- Historical docs (change-log entries, `route-work-code-axis.md`) keep their
  terra/opus-4.8 references — they describe the table as it was.

## Packaging

Ships as `workbench 0.20.5`. Origin doc `docs/skills/route-work.md` snippets
updated to the new invocations and routes.
