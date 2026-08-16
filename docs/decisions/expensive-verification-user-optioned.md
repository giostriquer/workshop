# Decision: expensive verification is user-optioned: offered, never automatic (Q14)

**Date:** 2026-08-12

## Status

Implemented. Joins the operator decisions ledger as **Q14**, refining Q11.

## Context

Follow-on operator call to the first field-feedback round
([`verification-shape-feedback.md`](verification-shape-feedback.md)), which
already flagged verification ceremony as an attention tax. The sharper
point: `empirical-proof` and `qa-sweep` are **expensive** workflows:
subagent fan-outs, booted apps, corroboration loops, and the flow's texts
("empirical-proof if runnable", "the deeper sibling") read as an instruction
to run them whenever a change qualifies. Not every workflow or change
warrants that spend; the choice is the user's.

## The shape

The rule, stated once and mirrored where sessions look:

- **`verification-before-completion` is the only always-on gate**: cheap,
  evidence-before-claims, never skipped.
- **`empirical-proof` and `qa-sweep` are user-optioned**: the model
  **offers** them when they fit (a runnable surface just changed; a broad
  surface deserves a sweep) and runs them only on the user's explicit ask:
  in the moment or as a standing rule, never uninvited.

Edits: both skills' descriptions carry the authority line
(`empirical-proof`: "offer it after runnable work, never run it uninvited";
`qa-sweep`: "runs on the user's ask, directly, or as audit's team-sweep
pick, never as a default"); `verification-before-completion`'s
deeper-sibling pointer becomes offer-framed in description and body;
`using-workbench`'s verification picker gains the cost/authority paragraph
and its flow line / ownership row read "empirical-proof **offered** if
runnable"; the doctrine snippet says "run it only if I ask or a standing
rule authorizes"; Q14 added to both flow docs' ledgers and inline beside
Q11 in `workbench-system.md`.

## Non-goals

- No change to the skills' internal rigor once they do run.
- `qa-sweep` via `audit` was already user-gated (the user picks the
  team-sweep tier); Q14 makes the same authority explicit for direct
  invocation and for `empirical-proof`.

## Packaging

Ships as `workbench 0.20.5`. Origin docs updated in step
(`verification-before-completion`, `using-workbench`).
