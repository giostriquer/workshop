# Comment trimming: scope and delivery role

## Origin and attribution (2026-09-24)

The skill derives from OpenClaw's MIT-licensed
[deslop](https://github.com/openclaw/openclaw), commit `203aafc`, Copyright
(c) 2026 OpenClaw Foundation. Its constraint-comment, suppression, and keep-list
rules adapt Lauren Tan's MIT-licensed pstack `no-comments` (`e8d856f`) and
`comment-sicko` (`99559f2`) in
[cursor/plugins](https://github.com/cursor/plugins).

The user explicitly requested the port. OpenClaw's own review flow supplied the
upstream usage record; the initial Workshop probes did not establish broad
reliability. The original general cleanup pass was narrowed and renamed before
becoming a Workbench delivery stage. The broader port remains in git history.

## Comments only, renamed trim-comments (2026-09-24)

Comment-only edits have a checkable boundary: code tokens stay identical.
General cleanup requires behavioral judgments that belong to the implementer
and review disciplines. Scope covers comments added or changed by the diff,
untracked files, and comments the diff makes stale. It does not authorize a
repository-wide cleanup.

Remove narration, syntax explanations, banners, commented-out code, stale
comments and workaround sermons. Preserve legal notices, public API contracts,
external-platform constraints and their links, tool directives, and useful
rationale that neither list resolves. Repository comment rules take precedence.

Keep constraint comments until the user approves an encoding into a test, type,
runtime check or lint rule. Declining the encoding leaves the comment and open
constraint in place. Correctness-hiding suppressions stay and are reported with
the required fix; changing code to fix them is outside this pass. Persona rules,
uncertain-delete defaults, and upstream handoffs were not adopted.

## Moved into workbench as a delivery stage (2026-09-24)

The trim runs after verification and before the initial review round, at full
implementation readiness. A separate `comment-trimmer` applies the skill as its
rubric because the author is likely to read their own narration as useful
explanation. It edits comments only, never commits, stages, pushes, or applies
constraint encodings. The same explicit-user-decline and superseding-repository
exceptions apply as for the completion review. An explicit trim request can run
outside delivery; ordinary editing does not trigger it mid-implementation.

Before editing, preserve each file in an isolated copy with its repository-relative
path. Verify edits against that copy so rollback cannot erase pre-existing
unstaged work or confuse same-named files. On BLOCKED, restore the trim's edits
and report failed restores. A missing trim verdict is BLOCKED. The parent owns
re-dispatch and unresolved decisions.

Code and test reviewers inspect the same trimmed working tree, including
untracked files. When delivery already uses commits and commit authority exists,
the parent commits the trim separately before review and verifies it is
comment-only. Otherwise the edits stay uncommitted. A late trim changes only
comments and does not invalidate a completed review; correction batches use
ordinary editing rather than another trim stage.

The report is brief and ends with `## Trim: DONE`, `NOTHING_TO_TRIM`, or
`BLOCKED`. Encoding offers go to the user at the delivery outline; an accepted
encoding becomes an implementation correction and returns to affected review.

## Verification boundary

Historical isolated-checkout probes checked comment scope, user-work preservation,
constraint offers, suppressions, verdicts and rollback. They support those cases,
not a reliability percentage. The canonical skill and agent carry the exact
preservation procedure and report contract; this note records why those rules
exist rather than retaining the probe scripts or repeating their matrices.
