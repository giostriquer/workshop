# epic-cleanup

## What it does

Removes obsolete temporary artifacts and worktrees owned by a completed epic.
It accounts for implementation lanes and the worktrees used for corrections,
validation, reviews and audits. It preserves material that still has a purpose.

## When to reach for it

Invoke it manually after you believe the epic is complete. Supply the epic
identifier or scope folder when the current session does not already know it:

```text
Use workbench:epic-cleanup for ABC-123. Its ledger is in .workbench/ABC-123/.
```

The skill has `disable-model-invocation: true` and the corresponding explicit
invocation policy for Codex. It does not run automatically when tickets close.

## Common questions

**Will it ask before every deletion?**

No. Your invocation authorizes cleanup of verified disposable material owned by
the epic. It inspects the inventory and performs that cleanup. It asks only when
scope, ownership or a consequential disposition cannot be established.

**What if a worktree has uncommitted files or new commits?**

It inspects staged, unstaged, untracked and ignored files, plus the current
commit and delivery evidence. Useful or unresolved state holds that worktree.
A previous squash merge does not prove later commits were delivered. Safe
cleanup elsewhere continues.

**What happens to the ledger and final audit evidence?**

It checks remaining consumers, references and retention requirements. Useful
material inside a worktree must be preserved in an established location and
verified before removing the worktree. The ledger is retired last. The skill
does not keep an archive of all scratch by default.

**Does it delete branches or close the epic?**

No. Branch deletion, tracker changes, commits and remote writes require separate
authority. It uses existing acceptance evidence and reports gaps; it does not
run another closing audit or certify acceptance.

## It's working if

The result accounts for every epic-owned worktree and temporary artifact, with
verified removals and clear reasons for anything retained. If worktrees or
unresolved candidates remain, the result is partial or blocked, with the next
action needed to finish. Repeating the invocation safely resumes that work.
