# workspace-cleanup

[Canonical skill](../../plugins/workbench/skills/workspace-cleanup/SKILL.md)

## What it does

Finds and removes development storage you no longer need, across one project,
several repositories or the machine. It sizes the biggest candidates first:
worktrees, build output, Docker images/containers/cache/volumes, `.workbench`,
`.tmp` and other scratch directories. It checks what still uses them, presents
concrete selections, performs approved removals and measures the space change.
No epic or ledger is required.

## When to reach for it

Ask in plain words, or invoke `/workbench:workspace-cleanup`:

```text
Time for a weekly cleanup. Find the disk bloat across my projects:
Docker, old worktrees, .workbench and .tmp. Keep ongoing runs.
```

```text
Clean up the merged worktrees and unused build output in this repo.
```

Name roots or exclusions when useful. Without a wider scope, it starts in the
current repository. An epic or task name can narrow the targets. The skill
loads on a cleanup request, never automatically after a merge or epic completion.

## Common questions

**Will it delete anything before I choose?**

It inventories first. If you have already approved exact targets or a clearly
bounded category, it applies that approval after verifying the concrete targets.
Otherwise it presents batches for selection. It does not ask again for unchanged
approval. Active or unique work and uncertain data need their own informed
selection; a broad cleanup request does not discard them.

**Does everything in `.workbench` or `.tmp` go?**

No. Those locations can contain ongoing runs, frozen inputs, useful reports and
follow-up evidence alongside disposable logs and build copies. It checks their
purpose and references. Material worth retaining is moved only to an established
or selected destination, verified before the original is removed.

**What protects my worktrees?**

It checks current files, local commits, delivery, locks, nested repositories and
live sessions/processes. Dirty, undelivered, active or uncertain worktrees stay
unless you select that exact entry after seeing the evidence. A squash merge
needs a content check, and a gone upstream is not proof of delivery. It does
not stop another session or clean files to make a worktree removable. Refused
non-force removal is reported; forcing needs explicit authorization.

**Does Docker cleanup include build cache and volumes?**

Yes, as separate candidates. Builder cache is inspected on the identified
builder and evicted only within your approved selection or cache policy.
Volumes need their own approval and data check: an unattached volume may still
hold a database. Images pinned for future runs and shared resources remain
protected. Stopped containers need a writable-data check. It uses scoped
operations and never substitutes a broad system prune or disk-image deletion.

**What if Docker is unavailable or a target is still active?**

That portion stays blocked while independent approved cleanup continues. A
changed endpoint or tag is rechecked. Missing access is not an empty inventory,
and a stopped run does not prove its inputs are no longer needed.

**Can it remove applications, transcripts or personal files?**

Those need a separate explicit request. Machine-wide discovery can surface
large items outside development storage without removing them. Local branches
and processes also need to be included in your selection; remote changes are
outside routine cleanup.

## It's working if

You get a ranked inventory with exact identities, sizes, purpose and clear
keep/remove/blocked reasons, followed by verified results for approved targets.
The report separates candidate size, Docker's accounting and the observed host
free-space change. Moving files to Trash does not count as reclaimed space.
Active work and useful retained material remain available, and unfinished items
have a concrete next action. A repeated request resumes from checked current
state.
