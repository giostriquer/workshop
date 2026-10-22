# Workspace cleanup and disk recovery

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
content, unique files and retained evidence. Cleanup remains explicitly
requested, never an automatic response to delivery or incidental leftovers.

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
- A general cleanup ask does not authorize application uninstall, transcript
  deletion, remote branch deletion, forced removal or manual Docker storage deletion.

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
