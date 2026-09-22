# get-pr-comments

## What it does

`get-pr-comments`, in the optional `toolkit` plugin, turns a PR's scattered
feedback into one prioritized list. It fetches conversation comments, review
summaries and inline diff comments, groups them by **severity** (blocking /
should-fix / nit) and **actionability** (a requested change versus an open
question), and returns an action list ordered by priority plus the questions
that still need a human answer.

It is read-only. It never replies to, resolves or reacts to a PR comment unless
you explicitly ask, per action, and it does not edit code, push or change PR
state. Acting on the list is a separate step you direct.

## When to reach for it

When a PR has feedback and you want to know what it actually asks you to change.

| The problem | The skill |
| --- | --- |
| "What does this PR's feedback ask me to change?" | `get-pr-comments` |
| Feedback in hand; decide what to implement, question or push back on | `receiving-code-review` |
| The PR's checks are red | `fix-ci` |
| The branch isn't a PR yet | `file-pr` |

## The pass

1. Resolve the current branch's PR: `gh pr view --json
   number,url,headRefName,state`.
2. Fetch conversation comments and reviews with `gh pr view --json
   comments,reviews`, and inline comments with `gh api
   repos/{owner}/{repo}/pulls/{number}/comments`.
3. Group by severity and actionability.
4. Return the ordered action list and the open questions.

With no PR for the branch, or `gh` unauthenticated, it says so rather than
guessing.

## Common questions

**Why didn't it reply to the reviewer or resolve the thread?** Summarizing
feedback and answering it are different acts; posting on a shared PR needs your
explicit instruction. ([decision](../decisions/get-pr-comments.md))

**I do want it to reply.** Ask for each reply. `receiving-code-review` covers
answering an inline comment in its thread rather than as a top-level comment.

**Will it catch comments pinned to diff lines?** Yes; that is the second call,
since `gh pr view` alone misses them.

**Does it treat bot reviews differently?** No. Whether a suggestion is right for
the codebase is `receiving-code-review`'s call.

**Non-GitHub host?** It assumes `gh`.

## It's working if

- You get one ordered list: blocking items first, nits marked as nits, open
  questions kept apart from requested changes.
- **Negative signal:** a reply, resolved thread or reaction you did not ask for,
  or a changed working tree.

## Where it fits

`get-pr-comments` triages feedback before `receiving-code-review`, the workbench
flow's feedback stage, governs acting on it. It is the comments counterpart to
the `ci-watcher` agent's CI verdict.
