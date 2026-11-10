# Workspace cleanup and disk recovery

## Read-only directories are checked before worktree removal (2026-11-09)

A cleanup on 2026-11-09 ran approved non-force `git worktree remove` commands
against worktrees that contained read-only directories. Git stopped deleting at
those directories but had already dropped the registrations: four worktrees were
left unregistered with about 56 GB still on disk, four more kept read-only
remnants, and the operator had to approve a permission pass afterwards. The
skill treated a refusal as leaving the entry intact.

A scratch repository reproduced it: with one read-only directory inside,
`git worktree remove` exits non-zero, the worktree leaves `git worktree list`
and its files stay. The skill now checks for directories the owner cannot write
before removal, holds an entry that has any, and asks for the permission change
on that exact path first. The check printed the read-only directory in the
reproduction and nothing for a clean worktree.

## Session transcripts are never a candidate (2026-11-04)

A cleanup toward a used-space target listed agent session history as a 41 GB item
in a numbered step. The operator approved the step, and it permanently deleted 815
Claude Code transcripts, 378 session folders and 45 Codex session files older than
two days. The earlier rule only kept a general request from authorizing that
deletion, and its instruction to surface large out-of-scope items is what put
transcripts on the list. A later speed audit then had no Claude Code history
before the cleanup to compare against.

Transcripts are now excluded outright: they appear in no inventory, estimate,
batch or prevention action, and no approval wording reaches them. A target that
cannot be met without them ends as a reported gap. The exclusion is categorical
because the loss is unrecoverable, while the space is small next to what Docker
and build output reclaim.

## Purpose and authority (2026-10-22)

Rename `epic-cleanup` to `workspace-cleanup`. Cleanup serves recurring disk
recovery for a project, several repositories or the machine's development
storage. An epic is an optional scope filter, with no separate workflow or
broader deletion authority. Update the native manifests, catalogs and usage
page together; the old command is replaced rather than kept as a second skill.

Inventory first, ranked by likely recoverable space. Reuse the user's existing
approval for exact targets or clearly bounded categories; otherwise present
concrete batches for selection before deletion. Protected or uncertain entries
need their own informed disposition. Preserve active worktrees, undelivered
content, unique files and retained evidence. Broad storage cleanup remains
explicitly requested. Retiring a session's own temporary artifacts belongs to
the artifact lifecycle in `using-workbench`, subject to deletion authority.

## Recurring cleanup and VM storage (2026-11-02)

Repeated weekly cleanup exposed two gaps: the invocation still needed a scope
explanation each time, and VM caches were outside the concrete inventory. A bare
invocation now discovers machine development storage; an explicit repository or
path still narrows it. Start with known project roots, harness worktrees and
development caches, then drill into the largest allocated consumers.

A requested used-space or free-space target is a separate completion condition
from an approved batch. Measure its remaining gap and continue until met or
concrete holds or approval decisions explain what prevents reaching it.

Separate smolvm host image seeds from named machine disks, overlays, branches,
checkpoints and registry credentials. Machine-local pruning does not necessarily
evict host caches. Resolve installed command support and actual storage ownership
before selecting removals; an empty machine list does not prove the host cache
or checkpoint store is empty or disposable.

Retained scratch needs a current purpose and a release condition. A small receipt
records selected targets, results and remaining reasons so the next invocation
can recheck them without preserving bulky copies. Report recurring producers and
specific retention or cache-limit changes to consider; do not install schedules
or change shared settings as a side effect. Age and size remain discovery signals,
not deletion authority.

## Evidence behind the rework

The Claude transcript miner found 24 model invocations of `epic-cleanup` and two
additional definition reads from September 1 through October 22, 2026. The two
reads were in subagents, not additional user cleanup requests. Targeted reading
of invocation contexts found repeated repository and machine storage tasks:
weekly cleanup, merged worktrees across projects, Rust build output, Docker
images and containers, builder cache, volumes, `.workbench` and `.tmp` artifacts.
This supports a general cleanup workflow without requiring an epic or ledger.
These counts describe the available local transcripts, not every cleanup task.

The source examples also exposed useful constraints. An agent corrected a
reclaimed-space total that had summed folder sizes containing shared data.
Another recognized that pinned benchmark images remained necessary after a run
finished. One cleanup moved material to Trash and had to report that its space
was still occupied. An operator corrected an overly broad removal attempt.
These observations justify measured filesystem deltas, checking future consumers,
exact target selection and distinguishing relocation from disk recovery.

The previous skill already required work preservation and explicit authority.
Its concrete gaps were the two-mode authority split, weak discovery of large
scratch/build directories, and exclusion of builder cache and volumes from its
Docker procedure. The correction expands inventory and conditional procedures;
it does not treat old, ignored, untagged or unattached data as disposable.

## Storage categories and boundaries

- Size project roots before drilling into large descendants. Account for nested
  worktrees and shared storage once, and keep a filesystem baseline.
- Inspect `.workbench`, `.tmp` and similar directories by purpose and remaining
  consumers. Preserve active runs, frozen inputs and useful reports. Use an
  established or user-selected retained destination and verify preservation.
- Include Docker builder cache and volumes as separate candidates. Cache eviction
  needs an identified builder and an approved selection. Volumes need a verified
  data disposition even when no container references them.
- Keep host disk recovery distinct from Docker's logical accounting and apparent
  disk-image size. Permission failures and unavailable daemons remain gaps while
  independent approved cleanup continues.
- A general cleanup ask does not authorize application uninstall, remote branch
  deletion, forced removal or manual Docker storage deletion.

## Verification

Use consuming-agent scenarios for ordinary disk cleanup without an epic,
preapproved batches, mixed active and obsolete scratch, dirty or live worktrees,
retained image consumers, persistent volumes, changed daemon identity, and
unverified reclaimed-space claims. These are bounded instruction checks, not
actual deletion trials or reliability estimates.

Docker command details were checked through Context7 against official
[Buildx disk usage](https://github.com/docker/buildx/blob/master/docs/reference/buildx_du.md),
[Buildx pruning](https://github.com/docker/buildx/blob/master/docs/reference/buildx_prune.md),
[volume removal](https://github.com/docker/cli/blob/master/docs/reference/commandline/volume_rm.md),
[disk usage](https://github.com/docker/cli/blob/master/docs/reference/commandline/system_df.md)
and [Docker Desktop for Mac](https://github.com/docker/docs/blob/main/content/manuals/desktop/troubleshoot-and-support/faqs/macfaqs.md)
references. Runtime versions still need checking before selecting filters.
