---
name: receiving-code-review
description: Always use when receiving any sort of code review feedback, including a completion reviewer's report.
---

# Code Review Reception

## Overview

Code review requires technical evaluation, not emotional performance.

**Core principle:** Verify before implementing. Ask before assuming. Technical correctness over social comfort.

In the workbench flow this governs acting on review findings in two places: the
completion round's reports before landing, and feedback that arrives after
landing from a person, a bot or the user. Verified fixes re-enter
implementation.

## The Response Pattern

```
WHEN receiving code review feedback:

1. READ: Complete feedback without reacting
2. UNDERSTAND: Restate requirement in own words (or ask)
3. VERIFY: Check against codebase reality
4. EVALUATE: Technically sound for THIS codebase?
5. RESPOND: Technical acknowledgment or reasoned pushback
6. IMPLEMENT: One item at a time, each with its focused check; then verify the batch
7. CLOSE: Return the verified batch of blocking fixes and evidence-based rejections
   to the independent reviewer, once
```

For completion-review findings, follow **Completion-review findings** below.
Passing tests support a fix; that reviewer confirms closure of the finding.
Keep the same review record through feedback and handoffs.

The optional Muse `scope-review` is an explicit exception to reviewer-confirmed
closure: the parent verifies and records dispositions, with no automatic rerun
or delivery hold for Muse availability. Existing required reviews still own
their findings and follow-ups.

## Completion-review findings

`code-quality-reviewer`, `test-quality-reviewer` and `contract-reviewer` each own
their findings and pass record. This section is the dispatching session's half
of every correction round; each review skill holds its reviewer's half.

**Read the report.** Its first line is `## Verdict:`; a report without that line
reads as `ISSUES_FOUND`. In-scope blocking findings need a correction round. A
contract review's `BLOCKED` names a missing input, check or decision: supply it
and resubmit, or take the decision to its owner.
Advisory and out-of-scope findings get a recorded disposition. Applying one is
ordinary editing: it is never resubmitted to the reviewer that raised it, and
it is a delta for any other reviewer whose ground it changes.

**Correct as one batch.** Verify each blocking finding against the code, then
fix it or reject it with evidence, one finding at a time, each with its focused
check. The batch is ready when every blocker in that report has a disposition
and the batch passes its checks as a whole.

**Return the batch to the reviewer that raised it,** in that reviewer's session,
without asking anyone; no pass count limits it. A replacement for a reviewer
that never returned gets the same unchanged submission; any other replacement
gets the prior findings and evidence. The message is these lines, each of the
last five only in its case, and nothing else:

```
Follow-up pass <n>
Reviewed revision: <commit> · Current revision: <commit>
Correction delta: <range, diff fingerprint, or none>
<finding ID>: fixed (<evidence>) | rejected (<evidence>)
Uncovered mutation scope: <scope a prior round left blocked>
Requested by the user: <the user's words, quoted>
Mutation results: <host, run id, output path>
Waiver: <the user instruction or repository rule, quoted>
Hold decision: <who decided, and what>
```

A passing test or a one-line fix does not close a blocker; the reviewer's
confirmation does. Correction dispatches, lane handbacks and owner validation
are not passes.

**Send a later delta only to the reviewers whose ground it changes.** A reviewer
that already returned `PASS` gets a later delta when:

| Reviewer | The delta changes |
| --- | --- |
| test quality | production logic or tests |
| contract | observable behavior, a consumer contract or cross-component wiring |
| code quality | structure outside the lines its findings named: a file, function, type or module added, moved or renamed, a changed signature, or new control flow |

A new commit, a clean rebase, PR preparation or a handoff changes none of these
and reopens no review. An applied advisory finding, or a rebase that resolved
conflicts, is a delta like any other: it goes to the reviewers whose ground it
changes, never back to the reviewer that raised the advisory. A delta the user
explicitly asks a reviewer to see goes to that reviewer whatever its ground,
with the `Requested by the user:` line. New scope or a material
redesign goes to the reviewers whose ground it changes. The comment trim runs
once per work set: a correction batch is not re-trimmed.

**Hold when review stops converging.** Stop submitting, hold delivery and report
to the authority that owns the work (the epic owner for a delegated lane,
otherwise the user) when a report names a convergence hold, or when:

- a pass sent open blockers closed or narrowed none of them;
- a finding rejected with evidence came back without new evidence; or
- two consecutive follow-ups each raised a new blocker and ended with at least
  as many open blockers as they were sent.

Give each open finding with both sides' evidence and a recommended next step,
and record the authority's decision with the review record.
Unless that decision ends review, it restarts automatic passes and the two-pass
count; a correction made meanwhile waits for it. A held review is never `PASS`:
a blocker closes on reviewer confirmation or the user's explicit waiver.

**Test-quality report lines that need an action from this session:**

- `Disposable copy: <path> (clone | worktree of <repo>)`: a reviewer that
  passes removes its own copy. When the review ends any other way (a waiver, a
  decision that ends a held review, abandoned work), remove that path under the
  deletion authority this session already has, typed out in the command with no
  variable or glob: `rm -rf <path>` then `rmdir` on its emptied parent for a
  clone, `git -C <repo> worktree remove --force <path>` for a worktree. When
  the report's Mutation run line names the Bazel runner, first run `bazelisk
  clean --expunge` in the copy: Bazel keeps its build tree outside the copy.
  Where user or repository rules require approval for deletions, list the path
  for approval instead.
- `blocked`, naming a platform this host cannot build: when this session
  already has authority to use a host that builds it, such as the repository's
  CI runner for that platform, run the report's command there and add `Mutation
  results: <host, run id, output path>` to the follow-up. Otherwise take the
  line to the user, who supplies a host or waives the run.
- `blocked: dispatch restriction`: the dispatch limited the mutation lane and
  cited no waiver. Resubmit without the limit, or with the user instruction or
  repository rule that sets it.
- `blocked: host busy`: nothing ran, and no code change is asked. Send that
  reviewer one follow-up with the `Uncovered mutation scope` line. Delivery
  waits for that round's Mutation run line; any value other than `blocked:
  host busy` settles it, a budget-bounded `partial` included. A second
  `blocked: host busy` goes to the user, who supplies a later run or waives it.

## Forbidden Responses

**NEVER:**
- "You're absolutely right!" before checking the claim (unverified agreement)
- "Great point!" / "Excellent feedback!" (performative)
- "Let me implement that now" (before verification)

**INSTEAD:**
- Restate the technical requirement
- Ask clarifying questions
- Push back with technical reasoning if wrong
- Just start working (actions > words)

## Handling Unclear Feedback

```
IF any item is unclear:
  ASK about the unclear items and check dependencies
  PAUSE only changes that depend on those answers
  IMPLEMENT verified independent fixes under the existing request

WHY: Establish dependencies rather than assuming every item is coupled.
```

**Example:**
```
The user: "Fix 1-6"
You understand 1,2,3,6. Unclear on 4,5.

❌ WRONG: Guess what 4 and 5 mean, or block unrelated fixes without checking dependencies
✅ RIGHT: "I will fix independent items 1,2,3,6. Items 4 and 5 need this clarification: ..."
```

## Source-Specific Handling

### From the user
- **Trusted** - implement after understanding
- **Still ask** if scope unclear
- **No performative agreement**
- **Skip to action** or technical acknowledgment

### From External Reviewers
```
BEFORE implementing:
  1. Check: Technically correct for THIS codebase?
  2. Check: Breaks existing functionality?
  3. Check: Reason for current implementation?
  4. Check: Works on all platforms/versions?
  5. Check: Does reviewer understand full context?

IF suggestion seems wrong:
  Push back with technical reasoning

IF can't easily verify:
  Say so: "I can't verify this without [X]. Should I [investigate/ask/proceed]?"

IF conflicts with the user's prior decisions:
  Stop and discuss with the user first
```

**Rule of thumb:** external feedback: be skeptical, but check carefully.

## YAGNI Check for "Professional" Features

```
IF reviewer suggests "implementing properly":
  Search code, public API contracts, consumers, and compatibility obligations
  A local search alone cannot prove externally exposed behavior is unused

  IF confirmed unused: "This endpoint isn't called. Remove it (YAGNI)?"
  IF used: Then implement properly
```

You and the reviewer both answer to the user. If the feature isn't needed, don't add it.

## Implementation Order

```
FOR multi-item feedback:
  1. Ask about unclear items and identify which changes depend on their answers
  2. Then implement in this order:
     - Blocking issues (breaks, security)
     - Simple fixes (typos, imports)
     - Complex fixes (refactoring, logic)
  3. Test each fix individually
  4. Verify no regressions across the batch
  5. Return the batch to its reviewer once, not fix by fix
```

## When To Push Back

Push back when:
- Suggestion breaks existing functionality
- Reviewer lacks full context
- Violates YAGNI (unused feature)
- Technically incorrect for this stack
- Legacy/compatibility reasons exist
- Conflicts with the user's architectural decisions

**How to push back:**
- Use technical reasoning, not defensiveness
- Ask specific questions
- Reference working tests/code
- Involve the user if architectural

**If you're uncomfortable pushing back out loud:** Name that tension, then tell the user about the issue you've seen. They'll appreciate your honesty.

## Acknowledging Correct Feedback

When feedback IS correct:
```
✅ "Fixed. [Brief description of what changed]"
✅ "Good catch - [specific issue]. Fixed in [location]."
✅ [Just fix it and show in the code]

❌ "You're absolutely right!"
❌ "Great point!"
✅ "Thanks for catching the boundary case; verified and fixed in [location]."
```

Ordinary gratitude is fine. Keep the technical finding, verification, and disposition clear; thanks does not replace those.

## Gracefully Correcting Your Pushback

If you pushed back and were wrong:
```
✅ "You were right - I checked [X] and it does [Y]. Implementing now."
✅ "Verified this and you're correct. My initial understanding was wrong because [reason]. Fixing."

❌ Long apology
❌ Defending why you pushed back
❌ Over-explaining
```

State the correction factually and move on.

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Performative agreement | State requirement or just act |
| Blind implementation | Verify against codebase first |
| Batch without testing | One at a time, test each, then verify the batch |
| Resubmitting after every fix | Return the verified batch once |
| Assuming reviewer is right | Check if breaks things |
| Avoiding pushback | Technical correctness > comfort |
| Unclear dependent work | Clarify its prerequisite; continue verified independent items |
| Can't verify, proceed anyway | State limitation, ask for direction |

## Real Examples

**Performative Agreement (Bad):**
```
Reviewer: "Remove legacy code"
❌ "You're absolutely right! Let me remove that..."
```

**Technical Verification (Good):**
```
Reviewer: "Remove legacy code"
✅ "Checking... build target is 10.15+, this API needs 13+. Need legacy for backward compat. Current impl has wrong bundle ID - fix it or drop pre-13 support?"
```

**YAGNI (Good):**
```
Reviewer: "Implement proper metrics tracking with database, date filters, CSV export"
✅ "Grepped codebase - nothing calls this endpoint. Remove it (YAGNI)? Or is there usage I'm missing?"
```

**Unclear Item (Good):**
```
The user: "Fix items 1-6"
You understand 1,2,3,6. Unclear on 4,5.
✅ "Items 1,2,3,6 are independent and verified; implementing them. Items 4 and 5 need clarification before their changes."
```

## GitHub Thread Replies

Only post replies under explicit existing user/workflow authorization; a request to inspect or fix feedback alone does not authorize an external comment. When replying to inline review comments on GitHub, reply in the comment thread (`gh api repos/{owner}/{repo}/pulls/{pr}/comments/{id}/replies`), not as a top-level PR comment.
