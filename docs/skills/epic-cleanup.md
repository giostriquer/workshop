# epic-cleanup

## What it does

Cleans up on request, in one of two modes.

**Workspace mode** covers one repository or workspace. It inventories stale
worktrees, merged or gone branches, build caches, temp artifacts, stray
processes and Docker images used by the work. Worktree entries show their last
commit date, whether they are dirty, any unmerged commits, any live process or
session using them as its working directory, and their size. Other entries carry
the applicable evidence. Docker entries show the daemon, full image ID, tags, size,
ownership and remaining consumers. It presents that list and removes only the
entries you pick.

**Epic mode** removes obsolete temporary artifacts and worktrees owned by a
completed epic, including disposable Docker images built or pulled for the work.
It accounts for implementation lanes and the worktrees used for corrections,
validation, reviews and audits. It preserves material that still has a purpose.

In both modes, a worktree that is dirty, has unmerged commits, or is the working
directory of a live process or session stays unless you pick it, even when it
looks like part of the epic.

## When to reach for it

Ask in plain words. The skill loads when you explicitly ask for cleanup:

```text
Clean up the stale worktrees and merged branches in this repo.
```

```text
ABC-123 is done. Clean up after the epic; its ledger is in .workbench/ABC-123/.
```

A request that concerns an epic runs epic mode; anything else runs workspace
mode. The skill does not fire on the agent's own initiative, in the middle of
other work, or when an epic's tickets close.

## Common questions

**Will workspace mode delete anything without asking?**

No. It reports and stops. You pick entries from the list; it rechecks each one
immediately before removing it and holds any whose evidence changed. It uses
non-force removal and reports a refusal instead of forcing, unless you ask it to
force that entry.

**Will epic mode ask before every deletion?**

No. Your request authorizes cleanup of verified disposable material owned by
the epic. It inspects the inventory and performs that cleanup. It asks only when
scope, ownership or a consequential disposition cannot be established.

**What if a worktree has uncommitted files, new commits or a running process?**

It stays, in both modes, even when the epic's ledger lists it or a lane report
calls its contents throwaway. The result lists it with that evidence, and it
goes only if you pick it. A previous squash merge does not prove later commits
were delivered. Safe cleanup elsewhere continues.

**What happens to the ledger and final audit evidence?**

It checks remaining consumers, references and retention requirements. Useful
material inside a worktree must be preserved in an established location and
verified before removing the worktree. The ledger is retired last. The skill
does not keep an archive of all scratch by default.

**Which Docker images can it remove?**

Images proven disposable within the request, after checking the exact daemon,
image ID, all tags, project references, and both running and stopped containers.
Using an image during the epic does not prove exclusive ownership. Shared base
images, active consumers and unknown ownership stay protected. It removes exact
targets without force or a broad Docker prune. A stopped container can be
removed first only when it is also in scope and disposable, including its
writable data; it preserves volumes.

**What if Docker is unavailable or the selected context has changed?**

It holds Docker cleanup until it can verify the daemon used for the work and its
inventory. Safe filesystem cleanup continues. Missing access is reported as a
gap, not as an empty image list. Untagging an image is reported separately from
removing its image ID or reclaiming disk space.

**Does it delete branches or close the epic?**

Epic mode does not. Branch deletion, tracker changes, commits and remote writes
require separate authority. It uses existing acceptance evidence and reports
gaps; it does not run another closing audit or certify acceptance. Workspace
mode lists merged or gone branches and deletes only the ones you pick.

## It's working if

In workspace mode, you get a list grouped by category with evidence for every
entry, and nothing changes until you pick. In epic mode, the result accounts for
every epic-owned worktree, temporary artifact and Docker image candidate, with
verified removals and clear reasons for anything retained. If worktrees or unresolved candidates
remain, the result is partial or blocked, with the next action needed to finish.
Repeating the request safely resumes that work. In either mode, a worktree with
active or unique work is still there unless you picked it.
