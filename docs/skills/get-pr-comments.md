# get-pr-comments

## What it does

`get-pr-comments` ships in the optional `toolkit` plugin. It collapses a
pull request's scattered feedback into one
prioritized list. PR feedback lives on three separate GitHub surfaces: the
conversation tab, review verdicts and summaries, and inline comments pinned to
diff lines, and reading them in the UI to work out "what must I actually
change" is slow and easy to do incompletely. This skill fetches all three in
one `gh` pass, groups them by **severity** (blocking / should-fix / nit) and
**actionability** (a clear change requested versus an open question), and
returns an action list ordered by priority plus the questions that still need
a human answer.

**It is read-only, and this is the point of the skill, not a caveat.** Its
first boundary is emphatic: "Do NOT reply to, resolve, react to, or otherwise
respond to any PR comment unless the user explicitly asks you to. This skill
*reads and summarizes* feedback; it never posts a reply, resolves a thread,
adds a reaction, or comments on the PR on its own. Posting any response
requires an explicit, per-action instruction from the user." It also does not
edit code, push, or change PR state.

So it does not close the loop, deliberately. It hands you a list. Acting on
that list is governed by `receiving-code-review`, which is a separate step you
direct.

## When to reach for it

Reach for it when a PR has feedback and you want a concise, actionable summary
of it. It is the first half of the workbench flow's feedback loop.

| The problem | The skill |
| --- | --- |
| "What does this PR's feedback actually ask me to change?" | `get-pr-comments` |
| Feedback in hand, now decide what to implement, question, or push back on | `receiving-code-review` |
| The PR's checks are red | `fix-ci` |
| You want a CI verdict, not comments | the `ci-watcher` agent |
| The branch isn't a PR yet | `file-pr` |

## The pass

1. Resolve the active PR for the current branch: `gh pr view --json
   number,url,headRefName,state`.
2. Fetch the feedback from both places it hides: conversation comments and
   review summaries via `gh pr view --json comments,reviews`, and inline
   review comments on the diff via `gh api
   repos/{owner}/{repo}/pulls/{number}/comments`.
3. Group by severity and actionability.
4. Return a concise action list ordered by priority, plus the questions that
   still need a human answer.

If there is no active PR for the branch, or `gh` is unauthenticated, it says
so plainly rather than guessing.

## Common questions

**Why didn't it reply to the reviewer or resolve the thread?** Because that
rule is the defining design choice of the skill: a decision note calls it "a
boundary, not a feature." Summarizing feedback and *answering* it are
different acts with different stakes: auto-replying on a shared PR is exactly
the kind of outward-facing side effect that should never fall out of "show me
the comments." The rule appears in the description and as the first item under
Boundaries so it cannot be missed.
([decision](../decisions/get-pr-comments.md))

**I do want it to reply.** Then say so, per action. An explicit instruction to
post a specific reply is what unlocks it. For the mechanics,
`receiving-code-review` carries the rule that inline review comments are
answered in the comment thread (`gh api
repos/{owner}/{repo}/pulls/{pr}/comments/{id}/replies`), not as a top-level PR
comment.

**It summarized but changed nothing.** Correct: acting on the feedback is a
separate step the user directs. Run `receiving-code-review` next.

**Will it catch the comments pinned to diff lines?** Yes, and that is why it
makes a second call. `gh pr view --json comments,reviews` alone misses inline
review comments; the `gh api .../pulls/{number}/comments` call is what picks
them up.

**Does it treat a bot's review differently from a human's?** It groups
everything by severity and actionability regardless of source. Judging whether
a suggestion is technically right for this codebase is `receiving-code-review`'s
job. It has explicit handling for feedback from external reviewers versus
from the user.

**Non-GitHub review host?** It assumes `gh`. The group-by-severity-and-
actionability shape ports; the fetch commands don't.

## It's working if

- You get one ordered list rather than three surfaces to reconcile, with
  requested changes separated from open questions that need a human.
- Items are ranked, so the blocking ones are at the top and the nits are
  identifiable as nits.
- **Negative signal:** after running it, the PR has a new reply, a resolved
  thread, or an emoji reaction on it that you did not explicitly ask for. That
  is a violation of the skill's first boundary, not a helpful extra.
- **Negative signal:** the working tree changed. This skill reads.

## Where it fits

`get-pr-comments` feeds the workbench flow's feedback stage from outside it.
The stage itself is `receiving-code-review`, which governs acting on the
feedback before verified fixes re-enter implementation; install `toolkit` and
this skill does the triage first. It is the comments counterpart to the `ci-watcher` agent's CI
verdict: the two read-only "what's the state of my PR" tools.
