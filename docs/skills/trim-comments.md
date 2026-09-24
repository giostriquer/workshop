# trim-comments

## What it does

`trim-comments` is workbench's comment-trim stage: a pass over a finished
diff's code comments that runs after verification and before the adversarial
review round. It edits code comments (`//`, `#`, `/* */`, doc comments and
suppression directives in source and config files) and nothing else; PR,
review and issue comments, commit messages and Markdown docs are out of its
scope. At completion it runs in the `comment-trimmer` agent, dispatched by the
session that wrote the code. You can also invoke it directly on a diff.

It removes, when the removal is behavior-neutral:

- narration and prose that restates the code;
- syntax explanation;
- banners and section dividers;
- commented-out code;
- comments the branch made wrong;
- workaround sermons: long justifications with no external constraint behind
  them. The report names the code each one excused, so you can decide whether
  that code should change.

It keeps:

- license and copyright headers;
- comments explaining behavior forced by something outside the repository's
  control, such as a dependency, platform, vendor, or protocol;
- doc comments that define a public API contract;
- issue or RFC links that explain a constraint the code can't express;
- formatter and tool directives, such as `prettier-ignore`, and suppressions of
  style-only lint rules.

A comment on neither list stays. When the repository has its own comment rules
(in `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING`, or similar), those win.

Two kinds of comment get special handling. A constraint comment ("do not
remove", "do not change this wording", "talk to X before changing") is never
deleted silently: the pass offers a check that could carry the rule and leaves
the comment until you answer. A suppression that silences a correctness or
safety rule (`eslint-disable`, `@ts-ignore`, `@ts-expect-error`, `noqa` and the
like) stays in place and goes in the report, with the fix the rule asks for.

It ends with a report of one to three sentences; from the agent, a result line
follows it: `## Trim: DONE`, `NOTHING_TO_TRIM` or `BLOCKED`.

## When to reach for it

Mostly you don't. Once the full agreed work set is implemented, verified and
about to ship through a PR or the repository's delivery process, the session
dispatches `comment-trimmer`, then runs the review round on the trimmed diff.
Like that review, it is default-on: only your explicit decline or a repo
process that supersedes it skips it, and a small diff or time pressure does
not. It never fires on its own mid-implementation, where tidying the comments
you are writing is ordinary editing. Invoke `/trim-comments` (or
`$trim-comments` in Codex) when you want a diff's comments trimmed outside that
moment.

| The problem | The skill |
| --- | --- |
| The branch is done; trim its code comments before the review | `trim-comments` (fires by default at completion) |
| The completion review of a finished diff, structure first. Its standard 8 reports what the trim left: comments a repo rule covers, suppressions that hide a correctness or safety rule, and constraint comments a test, type or lint could enforce | [code-quality-review](code-quality-review.md) |
| Comments that only restate the code, reported as pattern drift with or without a repo rule | `pattern-reviewer` agent |
| Code-level slop: needless defensive checks and `try`/`catch`, type-laundering casts, one-use helpers, unowned shims and fallbacks, style drift | [code-quality-review](code-quality-review.md) |
| Whether the diff's tests protect behavior | [test-quality-review](test-quality-review.md) |
| Triaging a PR's review comments | [get-pr-comments](get-pr-comments.md) (toolkit) |
| Which existing tests should exist at all | [test-audit](test-audit.md) (toolkit) |

The line with the review: `trim-comments` edits, then `code-quality-review` and
`pattern-reviewer` report what remains, and the implementer acts on it. The
trim lets the review spend its attention on structure and correctness instead
of comment noise. It never replaces the review, and code-level slop belongs to
`code-quality-review`.

## Common questions

**Why an agent, not the session that wrote the code?**
That session wrote the comments too, so its narration reads as explanation and
its stale comments read as current. `comment-trimmer` starts without that
history: Opus at `xhigh` effort on Claude Code, `gpt-6-sol` at `xhigh` on
Codex.

**Will it touch code outside my branch?**
No. It scopes to `git diff` against the default branch, or the branch's merge
base with it, plus untracked files, and never runs a repo-wide cleanup. It
touches comments on lines the branch adds or changes, plus a comment the branch
made wrong; slop in unrelated lines of a changed file stays where it is.

**Will it touch my uncommitted code?**
No. Before its first edit to a file, the agent copies that file, at its own path, into a temporary folder outside
the repository, and it checks and undoes its own edits against that copy, never
against git, so unstaged work in the same file stays as you left it. A change
counts as comment-only when the line differs only in comment text (a trailing
comment removed from a code line included), a whole-line comment is deleted,
a line inside a block comment changes, or a blank line goes with the comment
it set off.

**Does it commit?**
The agent never commits, stages or pushes. If your work is already delivered
as commits (an epic lane, or a branch the session committed under its existing
authority), the session commits the trim's edits as their own comment-only
commit before the review. Otherwise they stay in your working tree. Either way
both reviewers read the same revision: the working tree against the merge
base, untracked files included.

**It ended with `BLOCKED`.**
It could not resolve the diff, load the skill, or confirm its edits were
comment-only. It restores every file it edited and says so, and the stage stays
pending: the session fixes the cause and dispatches it once more, or asks you.
A report without the `## Trim:` line counts as `BLOCKED`.

**Will it edit my PR description, review threads or docs?**
No. It works on code comments only. Markdown docs, commit messages, and PR,
review and issue comments are outside its scope, even when they sit in the
same diff.

**Why did it leave my pointless `try`/`catch` alone?**
It edits comments only. Defensive code, casts, helpers and style are
`code-quality-review`'s findings, and removing them can change behavior.

**Why did it keep a comment I think is noise?**
It removes only what its remove list names; a comment on neither list, such
as a note on why an internal choice was made, stays. If your repository's
rules say that kind of comment goes, write that down in `AGENTS.md` or
`CLAUDE.md` and the pass follows it.

**It asked me about a "do not remove" comment.**
That is the design. A constraint comment records a rule someone needed. The
pass offers the cheapest check that could carry the rule instead (a type, a
runtime check, a test, or a lint rule) and never applies it on its own. When
you invoked the trim directly, the session asks you right away. At completion
the offer arrives with the session's outline, where you choose PR or merge,
and the review leaves that comment to your answer. Say yes and the check is
added and the comment deleted, as a correction that takes a follow-up review
pass under `code-quality-review`'s correction review. Say no and the comment
stays; the constraint is reported as open.

**It reported my `eslint-disable` instead of removing it.**
It looked up the rule. When the rule protects correctness or safety (an
unhandled promise, an unchecked index), the suppression hides a real problem,
and the fix the rule asks for changes code. So it names the suppression and
the fix rather than keeping it quietly or deleting it. A suppression of a
style-only rule stays without comment.

**Does a correction batch get trimmed again?**
No. Comments a correction adds are the implementer's ordinary editing; the
focused correction review still reports the kinds standard 8 covers (comments
a repository rule governs, suppressions hiding a correctness rule, enforceable
constraint comments). A trim that runs late, after the review round, edits comments
only, so the round still covers the revision.

**Can I skip it?**
Say so. Your explicit decline, or a repo process that supersedes it, are the
only outs. `file-pr` will not file a code PR until the trim and the review
have run, unless you waived them.

## It's working if

- The trim ran at completion before the review round, dispatched, unrequested.
- Every edit removes or changes a code comment inside the branch's changes,
  and no code line changed, your uncommitted code included.
- Committed work gets the trim as its own comment-only commit before the
  review; otherwise the edits sit in the working tree the reviewers read.
- Narration, banners, commented-out code and stale comments are gone.
- License headers, vendor and platform notes with their issue links, public
  API docs and tool directives are still there.
- Constraint comments are still there, each with an encoding offer, until you
  approve one.
- Correctness-hiding suppressions stay in the code and appear in the report
  with their fix.
- The report is one to three sentences: what changed, what is left for you,
  and any offer awaiting your answer.
- Negative signal: a code edit, an edit outside the diff or to a doc, PR or
  review comment, a deleted constraint comment you never approved, a deleted
  license header or vendor note, a trim that fired on its own
  mid-implementation, a commit made by the agent, or a `BLOCKED` run that left
  its edits in place.

## Where it fits

Between verification and the review round. `verification-before-completion`
backs the done claim, `trim-comments` trims the diff's code comments, then
`code-quality-review` (plus `test-quality-review` when logic or tests changed)
reviews the trimmed diff, the session outlines the work with any encoding
offers and asks PR or merge, and `file-pr` lands it.
