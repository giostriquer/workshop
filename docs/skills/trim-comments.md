# trim-comments

## What it does

`trim-comments`, in the optional `toolkit` plugin, is a comment pass over the
current branch's diff before review. It edits comments and nothing else.

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
deleted silently: the skill offers a check that could carry the rule and waits
for your answer. A suppression that silences a correctness or safety rule
(`eslint-disable`, `@ts-ignore`, `@ts-expect-error`, `noqa` and the like) stays
in place and goes in the report, with the fix the rule asks for.

It ends with a report of one to three sentences. It is **user-invoked only**
(`disable-model-invocation: true`, plus `allow_implicit_invocation: false` for
Codex). Invoke `/trim-comments`, or `$trim-comments` in Codex, on the branch
you are about to send for review.

## When to reach for it

When the branch works and you want its comment noise gone before anyone
reviews it.

| The problem | The skill |
| --- | --- |
| The branch is done; trim its comments before the review | `trim-comments` |
| The completion review of a finished diff, structure first. Its standard 8 reports comments a repo rule covers, suppressions that hide a correctness or safety rule, and constraint comments a test, type or lint could enforce | [code-quality-review](code-quality-review.md) (workbench) |
| Comments that only restate the code, reported as pattern drift with or without a repo rule | `pattern-reviewer` (workbench agent) |
| Code-level slop: needless defensive checks and `try`/`catch`, type-laundering casts, one-use helpers, unowned shims and fallbacks, style drift | [code-quality-review](code-quality-review.md) (workbench) |
| Whether the diff's tests protect behavior | [test-quality-review](test-quality-review.md) (workbench) |
| Which existing tests should exist at all | [test-audit](test-audit.md) |

The line with workbench: `code-quality-review` and `pattern-reviewer` report
comment findings, and the implementer trims. `trim-comments` is the edit pass
you run before them, so the review spends its attention on structure and
correctness instead of comment noise. It never replaces the review gate, and
code-level slop belongs to `code-quality-review`.

## Common questions

**Will it touch code outside my branch?**
No. It scopes to `git diff` against the default branch, or the branch's merge
base with it, and never runs a repo-wide cleanup. It touches comments on lines
the branch adds or changes, plus a comment the branch made wrong; slop in
unrelated lines of a changed file stays where it is.

**Why did it leave my pointless `try`/`catch` alone?**
It edits comments only. Defensive code, casts, helpers and style are
`code-quality-review`'s findings, and removing them can change behavior.

**Why did it keep a comment I think is noise?**
It removes only what its remove list names; a comment on neither list, such
as a note on why an internal choice was made, stays. If your repository's
rules say that kind of comment goes, write that down in `AGENTS.md` or
`CLAUDE.md` and the skill follows it.

**It asked me before removing a "do not remove" comment.**
That is the design. A constraint comment records a rule someone needed. The
skill offers the cheapest check that could carry the rule instead (a type, a
runtime check, a test, or a lint rule) and waits for your answer. Say yes and
it adds the check, then deletes the comment. Say no and the comment stays; the
report lists the constraint as open.

**It reported my `eslint-disable` instead of removing it.**
It looked up the rule. When the rule protects correctness or safety (an
unhandled promise, an unchecked index), the suppression hides a real problem,
and the fix the rule asks for changes code. So it names the suppression and
the fix rather than keeping it quietly or deleting it. A suppression of a
style-only rule stays without comment.

**Does it run the review for me?**
No. Run it before the review gate, never instead of it. With workbench
installed, that gate is `code-quality-review`.

**Does it need workbench?**
No. It runs on its own; the workbench pieces above are neighbours, not
dependencies.

## It's working if

- Every edit removes or changes a comment inside the branch's changes, and no
  code line changed.
- Narration, banners, commented-out code and stale comments are gone.
- License headers, vendor and platform notes with their issue links, public
  API docs and tool directives are still there.
- Constraint comments are still there, each with an encoding offer, until you
  approve one.
- Correctness-hiding suppressions stay in the code and appear in the report
  with their fix.
- The report is one to three sentences: what changed, what is left for you,
  and any offer awaiting your answer.
- Negative signal: a code edit, an edit outside the diff, a deleted constraint
  comment you never approved, a deleted license header or vendor note, or a
  long report that restates the diff.

## Where it fits

Between finishing the work and the review. When workbench is installed,
`verification-before-completion` backs the done claim, `trim-comments` runs on
your ask, then `code-quality-review` (plus `test-quality-review` when logic or
tests changed) reviews the result, and `file-pr` lands it.
