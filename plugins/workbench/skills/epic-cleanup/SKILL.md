---
name: epic-cleanup
description: Use when the user explicitly requests cleanup after believing an epic is complete. User-invoked only; not an automatic epic closure step.
disable-model-invocation: true
---

# Epic Cleanup

Remove temporary material whose purpose has ended and every disposable worktree
owned by the epic. The user's explicit cleanup request authorizes this scoped
removal; proceed with verified removals without another blanket approval.
Never infer invocation from an epic reaching Done.

## Establish the inventory

1. Resolve the epic, repositories and scope folder from the request and current
   context. Read its ledger, dispatches, lane reports and closure record. Ask
   only for missing scope that prevents identifying the targets.
2. Reconcile those records with Git's full worktree list, harness records and
   known artifact locations. Include implementation, correction, validation,
   review and audit worktrees, including detached or moved checkouts. Names and
   directory proximity alone do not prove ownership. Never target the primary
   checkout or another task's work.
3. Record each exact path, ownership evidence, remaining purpose and proposed
   disposition: remove, retain or blocked. Keep this inventory outside deletion
   targets. Check current delivery and unresolved consumers; an epic status or
   old lane report alone does not prove that today's contents are disposable.
   Use existing acceptance evidence; cleanup neither certifies closure nor
   starts a new audit. Continue independent safe cleanup when an item is held.

## Decide what can go

| Candidate | Required check |
| --- | --- |
| Prompts, logs, probes, builds and duplicate reports | Owned by this epic, obsolete or reproducible, and no remaining consumer or retention requirement |
| Final evidence, frozen audit inputs, decisions and follow-up material | Keep while needed; inspect references and recovery obligations before removal |
| Worktree | Inspect staged, unstaged, untracked and ignored files, local commits, nested repositories/submodules, locks and active sessions/processes |

Verify each worktree's current HEAD against refreshed delivery evidence. For
squash/rebase delivery, verify the accepted content and check for later local
commits; ancestry alone is insufficient. Undelivered work needs an explicit
disposition. Unknown or unique files, including ignored configuration, stay
protected. Do not print secrets during inspection.

If retained material lives in a worktree being removed, preserve it in an
established retained location outside all deletion targets. Verify the copy and
repair local references before removing its source. Ask for a destination when
none is established. Do not silently archive everything or promote scratch to
committed documentation. Keep recovery records until all outstanding items have
a durable owner and destination.

## Remove and verify

1. Recheck resolved paths, ownership and activity immediately before mutation.
   Move execution to a retained checkout. Active sessions or unexplained locks
   hold removal; stop only processes confirmed as disposable epic jobs. Delete
   exact entries verified disposable within the authorized scope, without
   following symlinks into other scopes.
2. Remove obsolete artifacts selectively. Preserve shipped code, reusable tests
   and durable docs. Use the harness's supported removal for harness-owned
   worktrees, otherwise Git worktree removal. If removal refuses, inspect the
   cause. Remove verified disposable generated files and retry; never use force,
   reset or broad clean commands to discard unknown or useful state.
3. Check missing registrations before pruning: an unavailable path is not proof
   of abandonment. Inspect the prune preview and proceed only if every affected
   entry is verified disposable and epic-owned. Otherwise leave registrations
   blocked; do not sweep unrelated stale entries. Branch deletion, remote writes,
   commits and tracker changes require separate authority.
4. Re-list worktrees, check filesystem absence, verify retained material and
   references, and reconcile every inventory entry. On a resumed invocation,
   verify already absent items and recheck remaining candidates. Retire the
   ledger last, after its useful records have a verified home.

Report **complete**, **partial** or **blocked**, with removed/already absent paths,
retained material and reasons, remaining worktrees and the next action for each
blocker. Complete requires every owned worktree removed, every disposable
artifact gone and retained material verified. Unknown ownership or unavailable
inventory prevents claiming exhaustive cleanup.
