# Decision: one evidence home per work scope (Q17)

**Date:** 2026-08-12

## Status

Implemented. Joins the operator decisions ledger as **Q17**, refining Q12.

## Context

Third field failure of the day: an audit run left its evidence spread across
three per-agent system-temp directories
(`/tmp/<ticket>-benchmark-tests-<rand>/`, `/tmp/<ticket>-persistence-<rand>/`,
`/tmp/<ticket>-zod-<rand>/`) although all of it belonged to one work scope.

Q12 already named the location (`.workbench/<work_scope>/`), but two gaps let
the scatter happen:

1. **Subagents never see the convention**: `using-workbench` explicitly
   tells dispatched subagents to skip orientation, and the engines' operating
   contracts (`qa-sweep`, `empirical-proof`) listed environment facts and
   evidence *capture* without naming an evidence *location*. Each agent
   invented its own temp dir.
2. `claim-check`'s persist rule still said `tmp/<date>-<slug>-claim-check.md`:
   text predating Q12.

## The shape

**Q17:** everything a work-stream produces: dispatched agents' evidence
included: lands in the **same** `.workbench/<work_scope>/` folder, with the
path **handed to agents in their contract** (agents never pick their own
locations); never per-agent temp dirs, never the system temp.

Edits: `using-workbench`'s "Artifacts are disposable" gains the one-home
paragraph; `qa-sweep` and `empirical-proof` add the evidence directory to
their contracts' environment facts ("one sweep, one folder" / "one proof,
one folder"); `claim-check`'s persist path moves to the scope folder and its
repro artifacts follow. Q17 added to both flow-doc ledgers and inline in
`workbench-system.md`.

## Non-goals

- No change to what counts as evidence or to the disposable/promotion rules.
  Q12's substance stands; Q17 fixes where it lands and who decides.

## Packaging

Ships as `workbench 0.20.7`. Origin docs updated in step (`using-workbench`,
`qa-sweep`).
