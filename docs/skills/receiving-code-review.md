# receiving-code-review

## What it does

`receiving-code-review` governs how you act on review feedback: "Verify before
implementing. Ask before assuming. Technical correctness over social comfort."
Each item is checked against the codebase before it is implemented,
questioned, or pushed back on.

Blocking completion-review findings close only when the independent reviewer
confirms the fix or an evidence-based rejection, under `code-quality-review`'s
bounded correction review. Passing tests support a fix; they do not close it.

## When to reach for it

Whenever review feedback arrives, from a human reviewer, a bot, or the user,
and before implementing any of it.

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
**IMPLEMENT** one item at a time, testing each; **CLOSE** by returning blocking
fixes or evidence-based rejections to the independent reviewer.

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
- Fixes land one at a time, tested, blocking first.
- A wrong suggestion gets reasoning and a question, not silent compliance.
- Negative signal: agreement or implementation without checking the claim, or
  dependent code changed while its requirement was unclear.

## Where it fits

The feedback stage of the workbench flow: verified fixes re-enter
implementation and its usual gates. It mirrors `code-quality-review`: one
gives a hard review, this one takes it.
