# Decision: verification picker + generated-artifact surfaces (first real-project feedback round)

**Date:** 2026-08-12

## Status

Implemented.

## Context

First structured feedback from a real workbench-governed session (a
code-generator project: emits source code, tracker + PR workflow in play).
The operator endorsed three critiques as workbench's to fix:

1. **Verification overlap with no cheap picker.** Five pieces touch
   verification (`verification-before-completion`, `empirical-proof`,
   `qa-sweep`, `claim-check`, `file-pr`); selecting one meant reading
   several protocols: context and ceremony spent without improving the
   implementation.
2. **`empirical-proof` assumes a bootable app.** The project's deliverable
   is emitted source code; there was no live client to drive. The session
   designed the correct proof itself (driving the generated routers): the
   skill did not lead to it.
3. **Ceremony taxes attention.** The session's own verdict: workbench's
   greatest value was as *checkpoints*; correctness came from repo
   inspection, conservative design, and focused tests.

(The session's other observations, including planner heuristics, a missing
comparison run, and a lint gate, were project-specific and are not scaffold
concerns.)

## The shape

- **`empirical-proof` names the generated-artifact case**: a new "When the
  deliverable is generated code" section: the runnable surface is the
  emitted artifact; run the generator via the documented path, then build
  and drive the output as its real consumer would; the boot gate applies to
  that artifact, and an emitted artifact that won't build or boot is
  `broken` against the generator, not `blocked`. The description adds the
  emitted artifact to its surface list.
- **`using-workbench` gains a verification picker**: one line per
  verification-adjacent piece, chosen by the work's shape, with two
  principles attached: *keep the standard, drop the frame* when no frame
  fits (prove the deliverable the way its consumer would exercise it), and
  *checkpoints, not reading assignments* (load a protocol when its moment
  arrives, not preemptively).

## Non-goals

- No skill merging: the five pieces keep their scopes; the fix is a cheap
  chooser, not a consolidation.
- No new protocol for generator work: the generated-artifact case rides
  inside `empirical-proof`'s existing gate/scenario/corroboration machinery.

## Packaging

Ships as `workbench 0.20.5`. Origin docs were updated in step;
`docs/skills/empirical-proof.md`'s honesty note now records this first
real-project round, per its own promise.
