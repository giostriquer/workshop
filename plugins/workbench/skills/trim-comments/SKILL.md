---
name: trim-comments
description: Use when the full agreed work set is implemented and verified and about to ship through a PR or the repository's delivery process, before its adversarial review round, or when asked to trim code-comment slop from a diff. Code comments only, not PR, review or issue comments, commit messages or prose docs. Never fires on its own mid-implementation, where tidying your own comments is ordinary editing.
---

# Trim Comments

Trim code-comment slop from a finished diff before its review. Edit comments
only; preserve behavior absolutely.

## Who runs it: an agent that did not write the code

At completion this stage is **dispatched, never self-served.** The session
that wrote the diff wrote its comments too, so its narration reads as
explanation and its stale comments read as current. Dispatch the
`comment-trimmer` agent by name with no model (on Codex, paste the agent file
and use its Dispatch line, per `using-workbench`'s *Workbench agents on
Codex*), with the base branch or diff range. On a host without subagents, use
`code-quality-review`'s fresh-session route.

It runs once the full agreed work set is verified and about to ship, before
the one initial review round and never instead of it: `code-quality-review`,
plus `test-quality-review` when production logic or tests changed, remains the
required correctness and safety review and runs on the trimmed diff. Never
mid-implementation: there, tidying your own comments is ordinary editing, not
this stage. It is default-on with the same two outs as that review
(`using-workbench`'s completion requirements).

**Reading the result.** The agent's report ends with `## Trim: DONE |
NOTHING_TO_TRIM | BLOCKED`; a report without that line reads as `BLOCKED`.
`BLOCKED` leaves the stage pending: fix its cause and re-dispatch once, or ask
the user.

**How the trim reaches the round.** Both reviewers read one revision: the
working tree against the base's merge base, untracked files included. Where
the work is delivered as commits (an epic lane, or a session that has already
committed its work under its existing authority), commit the trim's edits as
their own comment-only commit, following the repository's commit conventions,
before the round; a lane's RANGE and pinned head then include that commit.
Commit the author's own changes before dispatching the trim, so that commit
stays comment-only, and confirm from `git show` that its diff is comment-only.
Otherwise the edits stay in the working tree, where the round reads them.
Never add a commit the session has no authority to make.

**Later changes.** A correction batch is not re-trimmed. Its comments are the
implementer's ordinary editing, and the focused correction review's standard 8
still reports the three kinds it covers (comments a repository rule governs,
suppressions that hide a correctness rule, enforceable constraint comments). A trim
that runs after the review round, as when `file-pr` finds it missing, is
comment-only: confirm that from its diff, and the round keeps covering the
revision.

When the user invokes this skill directly on a diff, a session that wrote that
diff dispatches `comment-trimmer` the same way; any other session applies the
checklist below.

## Checklist

1. Scope the pass to `git diff` against the default branch (`origin/main`, or
   whatever `origin/HEAD` names), or the branch's merge base with it when it
   differs, plus untracked files (`git ls-files --others --exclude-standard`).
   Touch only comments on lines the diff adds or changes, plus any comment the
   diff made wrong. Never run a repo-wide cleanup. Only code comments count:
   comments in source and config files (`//`, `#`, `/* */`, doc comments,
   suppression directives), never PR, review, issue or tracker comments,
   commit messages, or prose documents such as Markdown.
2. Read the repository's comment rules first (`AGENTS.md`, `CLAUDE.md`,
   `CONTRIBUTING`, or their equivalents). Where they say which comments to
   remove or keep, they win over the lists below.
3. In every changed hunk, remove these comments:
   - narration and prose that restates the code;
   - syntax explanation;
   - banners and section dividers;
   - commented-out code;
   - a comment the diff made wrong;
   - a workaround sermon: a long justification with no external constraint
     behind it. Remove it, and name the code it excused in the report for the
     author to reshape.
4. Keep these comments:
   - license and copyright headers;
   - a comment explaining non-obvious behavior forced by something outside the
     repository's control: a dependency, platform, vendor, or protocol;
   - doc comments that define a public API contract;
   - issue or RFC links that explain a constraint the code can't express;
   - formatter and tool directives, such as `prettier-ignore`.

   A comment on neither list stays.
5. Handle constraint comments and suppressions as below.
6. Make no functional edits. Change only comments; leave defensive checks,
   `try`/`catch`, casts, helpers, fallbacks and style to the review. If removing
   a comment could change behavior (a tool reads it), leave it. Before
   reporting, confirm every edit is a comment-only change: a line that differs
   from its original only in comment text (its code tokens identical, as when a
   trailing comment is removed from a code line), a deleted whole-line comment, a
   changed line inside a block comment, or a blank line deleted with the comment
   it set off.
7. Report the result in 1 to 3 sentences of plain prose, one sentence per
   part, in this order: what changed; each item left for the author, in a few
   words; and, when an encoding offer is waiting, the offer as a question. For
   example: "Removed four narrating comments, a banner and a commented-out
   retry in `src/session.ts`. Left for you: a `@ts-expect-error` in
   `refreshToken` hiding a possible `null` (narrow it first), and the polling
   loop in `fetchProfile` whose defending comment I removed. Should a test pin
   the `LOGIN_FAILED` message so its `do not change this wording` comment can
   go?"

## Constraint comments

A comment such as `do not remove`, `do not change this wording`, or `talk to X
before changing` states a constraint. Never delete it silently, however much
it reads like slop. Offer the cheapest in-scope encoding (a type, a runtime
check, a test, or a lint rule), finish the rest of the pass, and encode nothing
until the user approves. Applying the checklist yourself, ask and wait.

`comment-trimmer` returns the offer instead, to the dispatching session. When
the skill was invoked directly outside the completion stage, that session asks
the user right away. At completion, it names the open offers in the
`code-quality-review` dispatch, whose standard 8 then leaves them to the user,
and carries them into the PR-or-merge outline the user already sees, saying
that an approved encoding takes a follow-up review pass under
`code-quality-review`'s bounded correction review.

If approved, encode it, then delete the comment; once the review round has
run, that encoding is a correction and goes through `code-quality-review`'s
bounded correction review. Otherwise leave the comment and report the
constraint as open.

## Suppressions

For each `eslint-disable`, `@ts-ignore`, `@ts-expect-error`, `# noqa`,
`# type: ignore`, `#[allow(...)]` or similar in the diff, look up the rule it
silences. When the rule protects correctness or safety, leave the suppression
in place and report it with the fix the rule asks for; never delete it or keep
it silently. Keep a suppression of a style-only rule.
