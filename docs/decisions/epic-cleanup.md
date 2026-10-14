# Cleanup authority and worktree preservation

## Explicit cleanup, separate from epic completion (2026-09-22)

Epics leave worktrees and evidence from implementation, review and validation.
Retirement does not itself authorize removal. An explicit epic cleanup request
covers verified disposable material owned by that epic; workspace cleanup first
presents an inventory and removes only selected entries. Neither path certifies
acceptance or starts another audit.

Preserve useful evidence and verify its destination and references before
removing its worktree. Report removed, absent, retained and blocked entries.
Unknown ownership, active consumers and undelivered work remain visible, and
safe independent cleanup can continue. The exact inventories, removal checks
and reporting contract live in the canonical skill.

## Workspace mode, a worktree guard and plain-words invocation (2026-09-24)

**Why.** A 30-day usage audit counted about 20 cleanup requests in 12+ sessions
across four repositories: stale worktrees, merged branches, caches, temp files,
stray processes and one disk-space hunt. The same cleanup prompt was pasted into
three repositories within one minute, twice. `epic-cleanup` had 0 uses in that
period. It covered only one epic's artifacts, and `disable-model-invocation`
hid it from a user who asks in plain words and never types slash commands.
Agents have also deleted active worktrees they believed were in an epic's scope.

**What changed.**

- **Workspace mode.** For one repository or workspace, the skill inventories
  stale worktrees, merged or gone branches, build caches, temp artifacts and
  stray processes. Each entry carries its last commit date, dirty or clean
  state, unmerged commits, any live process or session using it as working
  directory, and its size. It presents the list and removes only the entries
  the user picks. The user chose report-only over automatic removal because of
  the deleted-worktree incidents. Epic mode keeps its authority to remove
  verified disposable material without a second approval.
- **Worktrees that stay.** In both modes, the skill never removes a worktree
  that is dirty, has commits whose content is not on the default branch, or is
  the working directory of a live process or session. It also never stops that
  worktree's processes or cleans its files to make it removable. This holds
  whatever scope the worktree seems to belong to, and only the user's pick of
  that entry clears it. The previous text did not rule this out. "Stop only
  processes confirmed as disposable epic jobs" and "remove verified disposable
  generated files and retry" let an agent that trusted a ledger or lane report
  stop a process or discard changes, then remove the worktree. The first now
  applies only outside worktrees, and a refused removal now holds the worktree.
  Unmerged is judged by content after squash or rebase delivery, as the
  delivery rule already required; by ancestry, every squash-delivered lane
  would be held. The existing preservation rules are unchanged.
- **Invocation.** Plain-language cleanup requests must reach the skill.
  `disable-model-invocation` is removed, and Codex's
  `policy.allow_implicit_invocation` is `true`. The description now uses the
  "Use when" form: it fires on an explicit cleanup request and excludes the
  agent's own initiative, leftovers noticed during other work, and epic closure.
  The name stays `epic-cleanup`.

## Docker images used during the work (2026-09-29)

**Why.** Epic builds and browser or integration verification can leave Docker
images after their consumers and worktrees are gone. The skill has no Docker
inventory or removal procedure. Using an image during the epic does not make a
shared base image disposable, and a daemon-wide prune can affect other work.

**Change.** Include images built or pulled for the work in the cleanup inventory.
Bind each entry to its verified daemon, full image ID, tags and remaining
consumers. Inspect running and stopped containers and current project references.
Workspace mode still reports candidates for the user to pick. Epic mode removes
only verified disposable images within the cleanup request. Unknown ownership,
shared consumers, active containers and unavailable Docker inventory hold the
affected entries while independent cleanup continues.

Use exact non-force removals, with `--no-prune` to preserve unselected parent
images. Stopped containers need their own disposable-state and scope checks;
their writable data is not disposable merely because they exited. Leave volumes,
networks, build caches and registry contents outside this image-cleanup change.
Verify absence by ID on the same daemon; distinguish untagging from image
removal and report measured disk changes separately.

The command behavior was checked against current official Docker documentation
through Context7 and the [image removal](https://docs.docker.com/reference/cli/docker/image/rm/),
[image pruning](https://docs.docker.com/reference/cli/docker/image/prune/),
[container listing](https://docs.docker.com/reference/cli/docker/container/ls/)
and [context](https://docs.docker.com/engine/manage-resources/contexts/) references.

**Validation.** The previous skill preserved ownership and authority in five
read-only scenarios; this is a concrete inventory gap, not an observed
destructive failure. A fresh reader applied the updated skill to those cases
and one container-data/worktree preservation case. It selected exact disposable
targets, preserved shared images and retained data, and held incomplete Docker
checks while continuing independent cleanup. These are bounded scenario checks;
no actual Docker cleanup or cross-model reliability claim was made.
