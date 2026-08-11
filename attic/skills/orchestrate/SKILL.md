---
name: orchestrate
description: Use when the user hands over a set of work (a feature, a fix list, a refactor campaign) to complete autonomously by coordinating dispatched executors — this session decomposes, dispatches, judges, and iterates until the whole set is done. Not for single small tasks (dispatch those directly via codex-implement) or for work the user wants to drive step-by-step.
---

# orchestrate — this session is the orchestrator-judge

The orchestrating session owns judgment: decomposition, dispatch, review,
integration, and the call that the work is complete. It delegates labor, not
judgment. It does not write the implementation code itself beyond trivial
glue at its own discretion.

## Model doctrine

Orchestration runs on the session's own model — the strongest available
(Fable). Never delegate the orchestrator role downward to a subagent on a
weaker model; a middle-manager that is dumber than its judge serves no
purpose. Executors, per `~/.claude/rules/model-selection.md`:

- Coding labor → Codex GPT-5.5 via the **codex-implement** skill. Read that
  skill before the first dispatch; it owns the wrapper mechanics, brief
  doctrine, failure handling, and escalation budgets.
- Judgment-adjacent side work that must be a Claude subagent (reviewers,
  couriers) → `model: inherit` or `model: opus`. Sonnet and Haiku are banned
  for all tasks.
- Token-hungry investigation → codex read-only dispatch; consume only the
  summary.

## Campaign loop

1. **Intake.** Restate the set of work as a definition of done with
   observable criteria. If the host repo mandates a process (its CLAUDE.md),
   that process governs and this loop nests inside it; otherwise proceed
   lightweight — do not invent ceremony the repo doesn't ask for.
2. **Decompose** into units sized so one dispatch can plausibly finish each:
   a unit has a crisp goal, a bounded file surface, and a verifiable outcome.
   Order by dependency; mark units with no shared files as parallelizable.
3. **Track state that survives compaction.** One task-tracker entry per
   unit; record the executor session id, run dir, and fix-round count on the
   task as work proceeds. The tracker — not conversation memory — is the
   source of truth for campaign state.
4. **Dispatch** per codex-implement (background). Independent units may run
   as separate concurrent codex sessions; dependent units wait for their
   prerequisites to be judged done, not merely dispatched.
5. **Judge each unit to done before building on it.** Read the real diff
   (git, never the executor's claims), verify firsthand (build/tests/
   behavior), apply whatever review process the host repo mandates, send
   findings back via resume. Escalation budgets from codex-implement apply.
6. **Re-plan when reality disagrees.** A dispatch that reveals a wrong
   decomposition (unit too big, missing prerequisite, design flaw) means
   adjusting the remaining units — not brute-forcing fix rounds against a
   bad plan.
7. **Complete the set, not just the last unit.** The campaign is done only
   after a whole-of-work verification pass over the cumulative diff (full
   build/test run, plus exercising the changed behavior where it has a
   runtime surface), reconciled against the intake definition of done.
   Report what was verified and how.
8. **Surface to the user only at genuine decision points** — scope changes,
   destructive or hard-to-reverse actions, security posture, or a dead
   executor path after budgets are spent. Otherwise keep going; progress
   reports are not permission requests.

## Context hygiene

The orchestrator's context is the scarcest resource in the loop. Dispatches
run in the background; read artifacts and summaries, not raw streams.
Executors self-verify (codex runs its own builds under the full-access
default) so intermediate compiler noise never routes through this session —
the orchestrator verifies once per unit, and once for the whole.

## Artifact hygiene

- Run dirs and briefs in the session scratchpad are audit evidence — keep
  them, don't delete after reading. They are not campaign state: never infer
  what's done from directory contents; the task tracker is the source of
  truth.
- Executor-created scratch files inside the repo are the orchestrator's to
  clean (under the sandboxed mode codex cannot delete its own residue).
- On campaign close, mark any persistent handoff/campaign doc (repo `tmp/`,
  goal docs) as DONE with a status line at the top — in the artifact itself,
  not only in memory — so no future session mistakes a finished campaign for
  live work. Delete such docs only when this session created them.

## Anti-patterns

- One giant vague brief instead of a decomposition.
- Accepting "done" without reading the diff and running verification.
- An opus (or any weaker-model) subagent as a sub-orchestrator.
- Serializing units that share nothing.
- Declaring the campaign complete without the cumulative verification pass.
- Porting one repo's ceremony into another repo that never asked for it.
