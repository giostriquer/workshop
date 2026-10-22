---
name: workspace-cleanup
description: Use when the user asks to reclaim disk space or clean up project or machine development storage, including worktrees, Docker, build caches, .workbench, .tmp and stale artifacts. Never on the agent's own initiative or automatically after delivery or epic completion.
---

# Workspace Cleanup

Recover disk space while preserving ongoing work and useful data. Scope can be
one repository, several projects or development storage across the machine.
An epic can narrow the targets; no epic, ledger or closure status is required.

## Scope and authority

Start with the repositories or locations the user names; otherwise use the
current repository. For a machine-wide request, discover project roots and
large development-storage locations before drilling down. Read applicable
cleanup and retention rules. Carry exclusions and other sessions' ownership
forward. Neither a directory name nor who created it decides disposability.

Inventory before deletion. An inspection request ends with recommendations.
For a cleanup request, present concrete batches to approve unless exact targets
or clearly bounded categories are already approved. Reuse that authority after
rechecking evidence; do not ask for the same approval again. Unclear scope
holds only the affected entries. An epic request follows these same rules.

A general cleanup request does not authorize deleting personal documents,
credentials, settings, session transcripts, installed applications or backups.
Surface large out-of-scope items separately. Remote writes, tracker changes and
commits need their own authority.

## Find the worthwhile candidates

1. Record available space on each affected filesystem using consistent units
   (`df` or the platform equivalent). Size the scoped roots, then inspect their
   largest descendants. Use allocated size where available. Avoid counting a
   parent and its children twice; folder totals and shared layers are estimates,
   not proof of reclaimable space.
2. Reconcile filesystem findings with Git worktree registrations, harness
   records, active processes and Docker inventories. Include hidden scratch
   directories and harness-owned worktrees outside the usual `.worktrees` path
   when they belong to the requested scope. Do not follow symlinks into new scopes.
   Before selecting a parent directory, apply the same worktree and retention
   checks to its descendants; a scratch root can contain an active checkout.
3. Give each candidate a stable selection ID, exact path or resource identity,
   category, size, purpose, remaining consumers, activity, preservation evidence,
   proposed disposition and expected rebuild cost. Mark missing evidence
   `unknown`. Keep this inventory outside deletion targets.
4. Present the largest useful batches first: proposed removals, retained items
   with reasons, and unresolved items needing a decision. Expand approved
   categories into concrete targets before acting; do not silently broaden them.

| Candidate | Evidence needed |
| --- | --- |
| Worktrees and stale registrations | Full Git/harness inventory, delivery, local files, locks and activity; follow Worktrees and branches below |
| Build output and dependency/tool caches | Generated contents, reproducibility, correct cache owner/root and no active build or runtime consumer; name the rebuild/download cost |
| `.workbench`, `.tmp`, `tmp` and scratch copies | Inspect each work scope's contents, active run state, references, retention and unique data; ignored or old does not mean disposable |
| Docker images, containers, builder cache and volumes | Verified endpoint, resource identity, references and data disposition; follow Docker below |
| Stray processes and open deleted files | Exact PID and current identity, command/cwd, owner and remaining purpose; stopping is a separate selected action |

Retain active runs, frozen audit inputs, pinned reference artifacts, useful
reports and unresolved follow-up evidence. For retained material inside a
selected target, use an established or user-selected destination outside all
removals, verify copied content and repair authorized references first. Do not
silently archive all scratch or promote it to committed docs. Retire a ledger
only after its remaining useful records have a verified home.

## Worktrees and branches

Use `git worktree list --porcelain` and reconcile missing, locked, detached and
moved entries. Never target the primary checkout. Inspect staged, unstaged,
untracked and ignored files, nested repositories/submodules, current HEAD,
last commit date, delivery evidence and live process/session working directories
(for example `lsof -d cwd` plus harness records).

Keep worktrees with dirty or unique files, undelivered content, live sessions or
processes, unexplained locks or incomplete evidence. A ledger or merged PR does
not override current contents. For squash/rebase delivery, compare accepted
content and check later local commits; ancestry alone is insufficient. Local
branches with a gone upstream are not necessarily delivered.

Only an informed user selection of that exact protected entry can authorize
its disposal. Do not stop its processes or delete files to make it removable.
Recheck before acting and hold changed evidence. Move execution to a retained
checkout; use supported harness removal or non-force `git worktree remove`.
A refusal holds the entry; forcing requires explicit authority for that entry.
Never reset or broadly clean a worktree to bypass a refusal.

Delete local branches only when included in the selection; use `git branch -d`
and report refusals. Inspect the worktree-prune preview: prune only if every
affected registration is selected and verified stale. An unavailable mount is
not abandonment. Verify both registration and filesystem state afterward;
partial removal can leave large directories behind.

## Docker

Resolve the effective endpoint, including `DOCKER_HOST`/`DOCKER_CONTEXT`
overrides, and verify its identity. Pin commands with `--context` or `--host`;
do not change the user's global context. For Buildx, resolve the selected
builder's actual node endpoints too: its storage may be remote and cannot then
be counted as local disk recovery. Unavailable access holds Docker entries,
not independent filesystem cleanup.

Inventory with `docker system df -v`, full image IDs and tags/digests, **all**
containers including stopped ones, volume references and relevant builders.
Inspect only needed metadata; configuration/environment can contain secrets.
Check project files, pinned image references and future consumers as well as
live containers. Finished runs, age, dangling tags and zero attachments alone
do not prove disposability.

| Resource | Selection and removal |
| --- | --- |
| Images | Record full ID, all tags, ownership and consumers. Recheck each tag still resolves to that ID. Use exact non-force `docker image rm --no-prune`; remove only approved disposable tags and preserve shared IDs/other tags. Untagging is not image removal. |
| Stopped containers | Verify writable-layer data and mounts are disposable or preserved, and the container itself is selected. Use exact non-force removal without `--volumes`. Do not stop active containers to make images removable. |
| Builder cache | Inspect `docker buildx du --builder <name> --verbose` and current builder activity. For approved cache eviction, verify installed command/filter support and use builder-specific prune bounded to the selected records or approved cache policy. Recheck the selection immediately before pruning; do not substitute a daemon-wide prune when filters cannot express it. Reclaimable cache still has rebuild cost. |
| Volumes | Record exact name, purpose, data/recovery needs and all container references. Zero attachments is not a data-retention decision. Remove only explicitly selected volumes with a verified disposable-data disposition, using exact non-force `docker volume rm`. |

Keep shared or pinned resources and unknown data protected. A refusal holds the
resource. General cleanup does not authorize `system prune`, blanket image,
container, volume or network pruning, registry deletion, or manual deletion of
Docker's storage/disk image. Builder-cache pruning above is a scoped operation,
not permission to sweep other builders or resources.

Recheck endpoint/builder identity, references and selection before each mutation.
Afterward, re-list on the same reachable endpoint. Confirm image absence by ID,
and report untagged-only images separately. Re-measure Docker usage and host
free space separately: shared layers and Docker Desktop's sparse disk image
mean logical removal may not immediately free host blocks. Never claim the
image file's apparent maximum size as recovered space.

## Remove and verify

1. Recheck every selected path/resource, authorization, retention and activity
   immediately before mutation. Hold changed or unknown entries and continue
   independent approved work. Remove exact paths, avoiding broad globs and
   symlink traversal. For caches, prefer the owning tool's supported cleanup
   when its scope matches the selection.
2. Report permission errors, locks and partial failures. Do not widen deletion,
   permissions or force to get past a refusal without the user's authorization.
   Moving to Trash is relocation, not recovered space; do not empty unrelated
   Trash. Stop only selected disposable processes after rechecking their identity.
3. Verify filesystem absence, Git registrations, Docker resources, retained
   copies/references and process state as applicable. On resume, verify already
   absent entries and recheck the remaining targets.
4. Re-measure the same filesystems and Docker endpoints with the same units.
   Report observed free-space change separately from estimated candidate sizes
   and Docker's reported reclamation. Concurrent writes, shared blocks and delayed
   disk-image reclamation can limit attribution; state that limit.

Finish with **complete**, **partial** or **blocked** for the approved selection:
removed/already absent targets, measured space change, retained items, unresolved
entries and the next action for each. A completed scan is not a completed cleanup.
Unselected candidates may remain; unknown or inaccessible inventory prevents
claiming exhaustive cleanup.
