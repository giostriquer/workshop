## Keep tracker status current

Read current statuses and the available workflow states for both tickets and
the parent epic or project. Map the work's actual phase to those states:

- When work begins, move the active tickets and their epic to **In Progress**
  or the workflow's equivalent. Leave unstarted, queued tickets unchanged.
- Reflect review, blockers and resumed work as they occur. Keep an accurate
  review or blocked state instead of resetting every open item to In Progress.
  One blocked ticket does not block an epic whose other work can advance.
- Mark a ticket **Done** only after independent acceptance and required
  delivery are verified. A lane report, open PR or green CI alone is insufficient.
  Close the epic only after its closure gates and the operator's decision.

Apply only needed transitions to operator-owned items, then read back the result.
On recovery, repair stale statuses against verified work; preserve accurate
terminal states unless the work has been explicitly reopened within scope.
If the tracker, write authority or a suitable state is unavailable, or an update
fails, record the intended transition, reason and responsible owner as pending
in the ledger. Continue independent authorized work and retry when the blocker
clears; report confirmed tracker state separately from intended state.
