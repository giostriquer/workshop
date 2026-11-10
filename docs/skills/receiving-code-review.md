# receiving-code-review

For the optional Muse `scope-review`, the parent verifies and records finding
dispositions. It does not require Muse confirmation or an automatic rerun. All
required review disciplines retain their own closure rules.

[Canonical skill](../../plugins/workbench/skills/receiving-code-review/SKILL.md)

## What it does

`receiving-code-review` governs how you act on review feedback: "Verify before
implementing. Ask before assuming. Technical correctness over social comfort."
Each item is checked against the codebase before it is implemented,
questioned, or pushed back on.

It also holds the dispatching session's half of the completion round's
correction loop. Blocking completion-review findings close only when the independent
reviewer confirms the fix or an evidence-based rejection. Passing tests support
a fix; they do not close it.

## When to reach for it

Whenever review feedback arrives, from a completion reviewer, a human reviewer,
a bot, or the user, and before implementing any of it.

| The problem | The skill |
| --- | --- |
| Feedback in hand; decide what to implement, question, or push back on | `receiving-code-review` |
| Feedback scattered across the PR, needing triage first | `get-pr-comments` |
| Giving a strict review of a finished work-stream | `code-quality-review` |
| The feedback is a failing CI check | `fix-ci` |

## The response pattern

Seven steps: **READ** all of it without reacting; **UNDERSTAND** by restating
it or asking; **VERIFY** against the codebase; **EVALUATE** for *this*
codebase; **RESPOND** with technical acknowledgment or reasoned pushback;
**IMPLEMENT** one item at a time, each with its focused check, then verify the
batch; **CLOSE** by returning the verified batch of blocking fixes and
evidence-based rejections to the independent reviewer, once.

- **Unclear items.** Ask, and pause only the changes that depend on the
  answer; verified independent fixes continue.
- **By source.** The user's feedback is trusted once understood. External
  feedback first gets five checks: correct for this codebase, breaks nothing,
  respects the reason for the current code, works on all platforms and
  versions, reviewer has full context.
- **YAGNI.** Before "implementing properly," check public API contracts,
  consumers, and compatibility obligations as well as local callers.
- **Order.** Blocking issues (breaks, security), then simple fixes, then
  complex ones, each tested for regressions.

## Completion-review findings

| Situation | What the session does |
| --- | --- |
| A report has no `## Verdict:` first line | Reads it as `ISSUES_FOUND` |
| Blocking findings | Fixes or rejects each with evidence, verifies the batch, returns it once to the reviewer that raised it |
| Advisory or out-of-scope findings | Records a disposition; an applied one never returns to the reviewer that raised it, and goes to any other reviewer whose ground it changes |
| A later delta, after a reviewer passed | Sends it only to reviewers whose ground it changes: production logic or tests (test quality); observable behavior, a consumer contract or wiring (contract); structure outside the lines its findings named (code quality) |
| A new commit, clean rebase, PR preparation or handoff | Reopens no review |
| A rebase that resolved conflicts, or a delta you explicitly ask a reviewer to see | Goes to the reviewers whose ground it changes, or to the reviewer you named |
| A correction batch | Is not re-trimmed |
| No progress, a rejection repeated without new evidence, or two follow-ups that each add a blocker | Holds delivery and reports to the epic owner or the user |
| `Disposable copy: <path>` on a review that ends without a pass | Removes that path, typed out literally, as a clone or as a worktree; lists it for approval where deletions need one |
| `blocked` for a platform this host cannot build | Runs the report's command on a host it is already authorised to use and returns the run id, or takes the line to the user |
| `blocked: dispatch restriction` | Resubmits without the limit, or cites the waiver that sets it |
| `blocked: host busy` | Sends that reviewer one follow-up for the uncovered scope; a second busy result goes to you |

A follow-up message carries the pass number, the reviewed and current
revisions, the correction delta and one line per finding, plus, only when they
apply, the uncovered mutation scope, your quoted request, forwarded mutation
results, a quoted waiver or a hold decision. It carries no verdict
vocabulary, severity scale, wait or budget numbers.

## Common questions

**Can I thank the reviewer?** Yes. Say what was verified or changed too.

**I understand four of the six items. Can I start on those?** Yes, if they
are verified, independent of the unclear ones, and in scope.

**The reviewer is wrong.** Push back with technical reasoning, specific
questions, and references to working code or tests; involve the user when it's
architectural.

**I don't want to argue.** Name the tension, then tell the user about the
issue.

**I pushed back and I was wrong.** Say so factually and move on: "You were
right - I checked [X] and it does [Y]." No long apology.

**I can't verify the claim.** Say so and ask: "I can't verify this without
[X]. Should I [investigate/ask/proceed]?"

**The feedback conflicts with an earlier user decision.** Stop and discuss
with the user first.

**Can it reply on the PR?** Only with explicit authorization; a request to
inspect or fix feedback does not grant it. Inline replies go in the comment
thread (`gh api repos/{owner}/{repo}/pulls/{pr}/comments/{id}/replies`), not
a top-level comment.

## It's working if

- The first response restates the requirement, asks a specific question, or
  starts the work.
- Unclear items surface before dependent implementation.
- Fixes land one at a time, tested, blocking first, and go back to their
  reviewer as one verified batch.
- A reviewer that passed is not sent a delta outside its ground.
- A wrong suggestion gets reasoning and a question, not silent compliance.
- Negative signal: agreement or implementation without checking the claim,
  dependent code changed while its requirement was unclear, a follow-up sent
  after a pass to confirm nits or another discipline's delta, or a disposable
  copy left behind after review ended.

## Where it fits

The completion round before landing and the feedback stage after it: verified
fixes re-enter implementation and its usual gates. Each finding returns to the
review discipline that owns it.
