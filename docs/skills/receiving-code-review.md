# receiving-code-review

## What it does

`receiving-code-review` governs how you act on review feedback. Its opening
line sets the frame: "Code review requires technical evaluation, not emotional
performance." The core principle is three clauses — "Verify before
implementing. Ask before assuming. Technical correctness over social comfort."

It exists to prevent two opposite failures. One is performative agreement:
"You're absolutely right!", "Great point!", "Thanks for catching that!" — all
explicitly forbidden, along with any gratitude expression. The other is blind
implementation: taking a suggestion straight to code without checking whether
it is correct for this codebase, breaks existing functionality, or contradicts
a decision the user already made. Between those, it supplies a six-step
response pattern, source-specific handling for user feedback versus external
reviewers, an implementation order, and explicit guidance on pushing back.

The stopping behavior is the part that catches people out. If **any** item in
a batch of feedback is unclear, the skill stops everything: "STOP - do not
implement anything yet. ASK for clarification on unclear items." Not the
unclear ones — everything. It is also not a fetcher: getting the feedback off
a PR is `get-pr-comments`'s job.

## When to reach for it

Reach for it when review feedback arrives and before implementing any of it —
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

- **Clarify first, implement nothing.** The worked example: you're told to fix
  items 1–6, you understand 1, 2, 3, 6 and not 4, 5. Implementing the four you
  understand is marked wrong. The reason is stated: "Items may be related.
  Partial understanding = wrong implementation."
- **Source-specific handling.** From the user: trusted, implement after
  understanding, still ask if scope is unclear, no performative agreement.
  From external reviewers: five checks before implementing — is it technically
  correct for this codebase, does it break existing functionality, is there a
  reason for the current implementation, does it work on all
  platforms/versions, does the reviewer understand the full context. Rule of
  thumb: "external feedback — be skeptical, but check carefully."
- **A YAGNI check on "implement it properly" suggestions.** Grep the codebase
  for actual usage first. If nothing calls it, the honest answer is to propose
  removing it, not to build it out.
- **Implementation order.** Clarify anything unclear first, then blocking
  issues (breaks, security), then simple fixes, then complex ones — testing
  each individually and verifying no regressions.

## Common questions

**Why can't I thank the reviewer?** Because the skill treats acknowledgment as
something the code does: "Actions speak. Just fix it. The code itself shows
you heard the feedback." Approved responses are "Fixed. [brief description of
what changed]", "Good catch - [specific issue]. Fixed in [location]", or just
fixing it and showing the code. The instruction is blunt about the reflex: "If
you catch yourself about to write 'Thanks': DELETE IT. State the fix instead."

**I understand four of the six items. Can I start on those?** No. That case is
the skill's worked wrong-example. Clarify all items first, then implement.

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

**I pushed back and I was wrong.** State the correction factually and move on
— "You were right - I checked [X] and it does [Y]. Implementing now." Long
apologies, defending why you pushed back, and over-explaining are all listed
as the wrong move.

**I can't verify the claim.** Say so and ask for direction: "I can't verify
this without [X]. Should I [investigate/ask/proceed]?" Proceeding anyway is in
the Common Mistakes table as a mistake with a named fix.

**The feedback conflicts with something the user decided earlier.** Stop and
discuss with the user first, before implementing.

**Where do replies to inline comments go?** In the comment thread — `gh api
repos/{owner}/{repo}/pulls/{pr}/comments/{id}/replies` — not as a top-level PR
comment.

**Is this just a tone rule?** No. Tone is one of seven rows in its Common
Mistakes table; the others are blind implementation, batching without testing,
assuming the reviewer is right, avoiding pushback, partial implementation, and
proceeding when you can't verify. Each has a stated fix.

**Where does it come from?** It is derived from
[obra/superpowers](https://github.com/obra/superpowers) (MIT, (c) Jesse
Vincent) and adapted for the workbench system. When the workbench set was
assembled, it was the one borderline upstream skill kept — recorded as earning
its place because it complements `get-pr-comments` and the adversarial-review
flow. ([decision](../decisions/workbench-system.md))

## It's working if

- The first response to feedback restates the technical requirement, asks a
  specific question, or is simply the work starting — not an evaluation of the
  feedback's quality.
- Unclear items are surfaced as a batch before any implementation begins.
- Fixes land one at a time, each tested, with blocking issues first.
- A wrong suggestion produces reasoning and a question, not silent compliance.
- **Negative signal:** a reply opening with "You're absolutely right!", "Great
  point!", or any thanks. The skill names these as forbidden, and the first is
  flagged as an explicit instruction-file violation.
- **Negative signal:** code changed while an item in the same batch was still
  unclear.

## Where it fits

`receiving-code-review` is the second half of the workbench flow's feedback
stage: `get-pr-comments` triages what arrived, this skill governs acting on
it, and verified fixes re-enter implementation — where the usual disciplines
(`test-driven-development`, `systematic-debugging`) and the usual completion
gates apply again. It is the mirror image of `code-quality-review`: one
governs giving a hard review, this one governs taking it.
