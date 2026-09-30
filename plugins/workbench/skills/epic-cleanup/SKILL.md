---
name: epic-cleanup
description: Use when the user explicitly asks to clean up a repository or workspace (stale worktrees, merged or gone branches, build caches, Docker images, temp files, stray processes, disk space) or an epic's leftover artifacts and worktrees. Never on the agent's own initiative, including leftovers noticed during other work, and not as an automatic step when an epic closes.
---

# Epic Cleanup

Two modes, chosen from the request:

- **Workspace mode** for a repository or workspace: report-only. Inventory the
  candidates with evidence and remove only the entries the user picks.
- **Epic mode** when the request concerns an epic, named or known from context:
  remove the epic's verified disposable material under the rules below.

Never infer invocation from an epic reaching Done or from leftovers noticed
during other work.

## Worktrees that stay

In either mode, never remove a worktree, stop its processes or delete files in
it to make it removable when it:

- is dirty: staged, unstaged or untracked changes;
- has commits whose content is not on the default branch (after squash or
  rebase delivery, compare content; ancestry alone is insufficient);
- is the working directory of a live process or session, including another
  agent's session (check process working directories, such as `lsof -d cwd`,
  and harness session records).

This holds whatever scope the worktree seems to belong to: a ledger entry,
branch name or location does not override it. List the worktree with that
evidence. Only the user picking that exact entry after seeing it authorizes its
removal.

## Workspace mode

Scope is the current repository, or the repositories or workspace the user
names. The request authorizes inspection only; nothing is removed on the
agent's judgment.

1. Inventory, read-only:
   - worktrees from `git worktree list --porcelain`, including prunable,
     missing and locked entries, never the primary checkout;
   - local branches merged into the default branch or whose upstream is gone;
   - build caches and temp artifacts: generated or ignored directories and
     scratch files;
   - stray processes whose working directory or command line is inside the
     scope;
   - Docker images built or pulled for the work and containers referencing
     them, following Docker images below.
2. Give non-Docker entries their applicable evidence: last commit date; dirty or
   clean; commits not on the default branch; live processes or sessions using
   it as working directory; size. Give Docker entries the fields below. Write
   `unknown` when a check cannot run; unknown never reads as safe.
3. Present the inventory grouped by category and ask which entries to remove.
   Stop there: until the user picks, the inventory is the complete result.
4. Remove or stop only the picked entries, by exact path, name or PID. Recheck
   each immediately before acting and hold any whose evidence changed. Use
   non-force removal (`git worktree remove`, `git branch -d`, and
   `git worktree prune` only when its dry run lists nothing unpicked); report a
   refusal instead of forcing, unless the user explicitly asks to force that
   entry. Re-list and report what was removed and what remains.

## Docker images

When the work used Docker, reconcile build/pull logs, Compose configuration,
verification records and labels with the daemon inventory. Record the daemon
endpoint and identity, full image IDs, tags/digests, size, ownership evidence,
remaining consumers and disposition. Use during the work, a matching name, age
or dangling status alone does not prove exclusive ownership or disposability.

Resolve the daemon used for the work, including `DOCKER_HOST`/`DOCKER_CONTEXT`
overrides. Pin every command to that verified endpoint with `--context` or
`--host`; do not switch the user's global context. An unavailable daemon or
incomplete ownership/reference check holds affected entries, not independent
filesystem cleanup. Do not treat access errors as an empty inventory.

Inspect `docker image ls --all --no-trunc --digests` and selected image metadata.
List **all** containers with `docker container ls --all`, then inspect their
exact `.Image` IDs, including stopped containers. Check current project
references and other known consumers too. Inspect only necessary fields; image
and container environment/configuration can contain secrets. Shared base images,
remaining consumers and unknown ownership stay protected. Workspace mode still
requires the user's exact picks; epic mode removes verified disposable targets
within its request without another blanket approval.

Immediately before each removal, recheck daemon identity, full ID, every tag,
container references and remaining purpose. Tags can move to unrelated images.
If a stopped container blocks removal, remove it only when the request also
covers that container and its contents are verified disposable, including its
writable layer; use exact non-force `docker container rm` without `--volumes`.
Leave active or retained containers and their images in place; do not stop them
to make an image removable.

Use non-force `docker image rm --no-prune` with exact verified IDs or tags.
For multiple tags, remove only disposable owned tags, rechecking each resolves
to the recorded ID. Preserve shared IDs and other tags. A refusal holds the
entry; do not retry with force. This scoped cleanup does not authorize broad
`image prune`, `system prune`, container/volume/network pruning, builder-cache
pruning, registry deletion or manual deletion of Docker storage. The
`--no-prune` flag also preserves unselected untagged parent images.

Re-list and verify each recorded ID on the same reachable daemon; only confirmed
absence counts as removed/already absent. Untagging alone is not image removal.
Report retained consumers and blockers, and measure disk changes with
`docker system df` when available; shared layers mean image size is not reclaimed
space. Unavailable inventory prevents claiming exhaustive Docker cleanup.

## Epic mode

Remove temporary material whose purpose has ended and every disposable worktree
owned by the epic. The user's explicit cleanup request authorizes this scoped
removal; proceed with verified removals without another blanket approval.

### Establish the inventory

1. Resolve the epic, repositories and scope folder from the request and current
   context. Read its ledger, dispatches, lane reports and closure record. Ask
   only for missing scope that prevents identifying the targets.
2. Reconcile those records with Git's full worktree list, harness records,
   known artifact locations and Docker images used during the work. Include
   implementation, correction, validation, review and audit worktrees, including
   detached or moved checkouts. Names and
   directory proximity alone do not prove ownership. Never target the primary
   checkout or another task's work.
3. Record each exact path or Docker identity, ownership evidence, remaining
   purpose and proposed disposition: remove, retain or blocked. Keep this inventory outside deletion
   targets. Check current delivery and unresolved consumers; an epic status or
   old lane report alone does not prove that today's contents are disposable.
   Use existing acceptance evidence; cleanup neither certifies closure nor
   starts a new audit. Continue independent safe cleanup when an item is held.

### Decide what can go

| Candidate | Required check |
| --- | --- |
| Prompts, logs, probes, builds and duplicate reports | Owned by this epic, obsolete or reproducible, and no remaining consumer or retention requirement |
| Final evidence, frozen audit inputs, decisions and follow-up material | Keep while needed; inspect references and recovery obligations before removal |
| Worktree | Inspect staged, unstaged, untracked and ignored files, local commits, nested repositories/submodules, locks and active sessions/processes; any condition under Worktrees that stay makes it blocked |
| Docker image used during the epic | Follow Docker images: verified daemon and full ID, disposable owned tags/content, all container references and no remaining consumer or retention requirement |

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

### Remove and verify

1. Recheck resolved paths, ownership and activity immediately before mutation.
   Move execution to a retained checkout. Active sessions, live processes in a
   worktree and unexplained locks hold removal; outside worktrees, stop only
   processes confirmed as disposable epic jobs. Delete exact entries verified
   disposable within the authorized scope, without following symlinks into
   other scopes.
2. Remove obsolete artifacts selectively. Preserve shipped code, reusable tests
   and durable docs. Use the harness's supported removal for harness-owned
   worktrees, otherwise Git worktree removal. If removal refuses, inspect the
   cause and hold the worktree; never use force, reset or broad clean commands
   to discard unknown or useful state.
3. Check missing registrations before pruning: an unavailable path is not proof
   of abandonment. Inspect the prune preview and proceed only if every affected
   entry is verified disposable and epic-owned. Otherwise leave registrations
   blocked; do not sweep unrelated stale entries. Branch deletion, remote writes,
   commits and tracker changes require separate authority.
4. Re-list worktrees, check filesystem absence, verify retained material and
   references, and reconcile every inventory entry. On a resumed invocation,
   verify already absent items and recheck remaining candidates. Retire the
   ledger last, after its useful records have a verified home.

Report **complete**, **partial** or **blocked**, with removed/already absent paths
and Docker IDs, untagged-only references, retained material and reasons,
remaining worktrees/images and the next action for each blocker. Complete
requires every owned worktree removed, every disposable artifact and image gone,
and retained material verified. Unknown ownership or unavailable
inventory prevents claiming exhaustive cleanup.
