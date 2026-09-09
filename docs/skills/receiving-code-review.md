# receiving-code-review

## What it does

`receiving-code-review` governs how you act on review feedback. Its opening
line sets the frame: "Code review requires technical evaluation, not emotional
performance." The core principle is three clauses: "Verify before
implementing. Ask before assuming. Technical correctness over social comfort."

Ordinary thanks is fine. Keep the technical claim, verification, and disposition clear; gratitude does not substitute for checking feedback.

Check whether review items depend on the unclear point. Ask the needed question and pause dependent changes; continue verified independent corrections within the request.

## When to reach for it

Reach for it when review feedback arrives and before implementing any of it,
especially when the feedback seems unclear or technically questionable. It
applies to feedback from a human reviewer, a review bot, and from the user.

| The problem | The skill |
| --- | --- |
| Feedback in hand; decide what to implement, question, or push back on | `receiving-code-review` |
| Feedback is scattered across the PR and needs triaging first | `get-pr-comments` |
| You are the one giving a strict review of a finished work-stream | `code-quality-review` |
| A fix from the feedback turns out to be a real bug hunt | `systematic-debugging` |
| The feedback is a failing CI check, not a comment | `fix-ci` |

## The response pattern

The loop is six steps: **READ** the complete feedback without reacting;
**UNDERSTAND** by restating the requirement in your own words, or asking;
**VERIFY** against codebase reality; **EVALUATE** whether it is technically
sound for *this* codebase; **RESPOND** with technical acknowledgment or
reasoned pushback; **IMPLEMENT** one item at a time, testing each.

Around that loop sit four rules with teeth:

- **Clarify dependent work first.** Ask about unclear items and pause changes that depend on the answer; continue verified independent fixes within the request.
- **Source-specific handling.** From the user: trusted, implement after
  understanding, still ask if scope is unclear, no performative agreement.
  From external reviewers, apply five checks before implementing: Is it technically
  correct for this codebase, does it break existing functionality, is there a
  reason for the current implementation, does it work on all
  platforms/versions, does the reviewer understand the full context. Rule of
  thumb: "external feedback: be skeptical, but check carefully."
- **A YAGNI check on "implement it properly" suggestions.** Search local callers and check public APIs, dynamic consumers, and compatibility contracts. No local caller alone does not prove a public contract is unused; propose removal only when the evidence supports it.
- **Implementation order.** Clarify dependent items first, then blocking
  issues (breaks, security), then simple fixes, then complex ones: testing
  each individually and verifying no regressions.

## Common questions

**Can I thank the reviewer?** Yes. Brief, sincere thanks are compatible with technical evaluation. State what was verified or changed; gratitude does not substitute for checking the claim. External replies still require explicit write authority.

**I understand four of the six items. Can I start on those?** Yes, if they are verified, independent of the unclear items, and within the requested scope. Ask about the dependent items before changing them.

**The reviewer is wrong.** Push back. The skill lists six situations that
warrant it: the suggestion breaks existing functionality, the reviewer lacks
full context, it violates YAGNI, it's technically incorrect for this stack,
legacy or compatibility reasons exist, or it conflicts with the user's
architectural decisions. How to push back: technical reasoning rather than
defensiveness, specific questions, references to working tests or code, and
involving the user when the question is architectural.

**I don't want to argue with the reviewer.** The skill anticipates that: "If
you're uncomfortable pushing back out loud: Name that tension, then tell the
user about the issue you've seen."

**I pushed back and I was wrong.** State the correction factually and move on:
"You were right - I checked [X] and it does [Y]. Implementing now." Long
apologies, defending why you pushed back, and over-explaining are all listed
as the wrong move.

**I can't verify the claim.** Say so and ask for direction: "I can't verify
this without [X]. Should I [investigate/ask/proceed]?" Proceeding anyway is in
the Common Mistakes table as a mistake with a named fix.

**The feedback conflicts with something the user decided earlier.** Stop and
discuss with the user first, before implementing.

**Where do replies to inline comments go?** When a reply is explicitly authorized, use the comment thread: `gh api
repos/{owner}/{repo}/pulls/{pr}/comments/{id}/replies`, rather than as a top-level
PR comment.

**Is this just a tone rule?** No. Tone is one of seven rows in its Common
Mistakes table; the others are blind implementation, batching without testing,
assuming the reviewer is right, avoiding pushback, partial implementation, and
proceeding when you can't verify. Each has a stated fix.

**Where does it come from?** It is derived from
[obra/superpowers](https://github.com/obra/superpowers) (MIT, (c) Jesse
Vincent) and adapted for the workbench system. When the workbench set was
assembled, it was the one borderline upstream skill kept: recorded as earning
its place because it complements the adversarial-review flow. ([decision](../decisions/workbench-system.md))

## It's working if

- The first response to feedback restates the technical requirement, asks a
  specific question, or is simply the work starting instead of an evaluation of the
  feedback's quality.
- Unclear items are surfaced before dependent implementation begins.
- Fixes land one at a time, each tested, with blocking issues first.
- A wrong suggestion produces reasoning and a question, not silent compliance.
- **Negative signal:** technical agreement or an implemented suggestion without checking the claim. Brief sincere thanks are compatible with that check.
- **Negative signal:** dependent code changed while its requirement was still unclear.

## Where it fits

`receiving-code-review` is the workbench flow's feedback stage: it governs
acting on what arrived, and verified fixes re-enter implementation, where the usual disciplines
(`test-driven-development`, `systematic-debugging`) and the usual completion
gates apply again. It is the mirror image of `code-quality-review`: one
governs giving a hard review, this one governs taking it.

External review replies require explicit existing authorization. Before treating code as unused, check public contracts, external consumers, and compatibility obligations as well as local references.
