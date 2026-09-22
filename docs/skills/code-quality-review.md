# code-quality-review

## What it does

A strict maintainability review of a finished change: abstraction quality, structure, pattern drift, file sprawl, and spaghetti growth. Its posture is ambition: it hunts for **"code judo" moves: restructurings that preserve behavior while making the implementation dramatically simpler**, so whole branches, helpers, or layers disappear.

It is **default-on**. Once the full agreed work set is implemented, verified, and about to ship through a PR or the repository's delivery process, it runs whether or not anyone asked. Only two things stop it: the user explicitly declining, or the repo's own process superseding it. A small diff, a clean-looking change, time pressure, or the session's own judgment are not exits. Edits, subtasks, and checkpoints never trigger it.

It is a gate, not a fixer or bug-hunter: a reviewer that did not write the code (the `code-quality-reviewer` agent or the host's equivalent) returns labeled, prioritized findings and never edits code.

## When to reach for it

Mostly you don't: it fires at completion, right before PR-or-merge. You can also invoke it directly for a strict or adversarial code quality review.

| The problem | The skill |
| --- | --- |
| Completed work needs its structural pass before landing | `code-quality-review` (fires by default) |
| A harsh maintainability audit right now | `code-quality-review`, invoked directly |
| Conformance to documented project patterns | `pattern-reviewer` agent |
| Trustworthy tests that cover the risk | [test-quality-review](test-quality-review.md) |
| Does the change actually work? | `verification-before-completion`, `empirical-proof` |
| Reviewing a spec or plan before implementation | `spec-reviewer` agent |

## The rubric

The baseline is a deep audit that restructures the change without altering behavior: **"Be extremely thorough and rigorous. Measure twice, cut once."** On top sit eight standards. Rule 0 is ambition: delete complexity rather than rearrange it. Rules 1 to 7 fight a file pushed past 1,000 lines, ad-hoc branches bolted into unrelated flows, rubber-stamped "it works" code, magic and thin wrappers, loose types and silent fallbacks, logic in the wrong layer or duplicated helpers, and needless sequential or non-atomic orchestration.

**Scope decides what a finding costs** ([decision](../decisions/workbench-operator-decisions.md)). Strictness applies inside the accepted work (ticket, plan, or agreed change), and every finding carries a label:

- **In-scope (blocking):** a demonstrated defect or material structural problem in this change.
- **In-scope (advisory):** a supported improvement without a blocking consequence.
- **Out-of-scope (follow-up):** adjacent defects, pre-existing mess this diff did not worsen, improvements beyond the accepted work. Recorded in the existing scope record, not folded into the change.

A finding that proves the change unsafe or incorrect as shipped blocks wherever it lives. An unlabeled finding reads as blocking. Any structural concern blocks only when the review demonstrates a correctness or material maintainability consequence; file length or an alternative design alone does not.

The report opens with `## Verdict: PASS` or `## Verdict: ISSUES_FOUND`, then the reviewed revision, follow-up pass count, and stable finding IDs; a missing verdict line reads as `ISSUES_FOUND`. Findings run structural regressions first and legibility last; few high-conviction comments beat many nits.

## Common questions

**My diff is three lines. Do I really have to run this?**
Yes, unless you decline it or your repo's own review process supersedes it ([decision](../decisions/code-quality-review.md)).

**The review found problems unrelated to my change. Do I fix them?**
No. They become out-of-scope follow-ups, so the diff stays the size the accepted work defined, unless one proves your change unsafe or incorrect as shipped.

**Can I run it midway through to catch problems early?**
Not as this gate. Mid-implementation, each round surfaces new work and the diff grows.

**Does "exactly one code-quality review" exclude test-quality review?**
No. When production logic or tests changed, one initial round includes both stages, dispatched separately in parallel and recorded against the same revision. If the test stage was missed, run it and keep the valid code verdict; the gate stays pending until both return.

**How do follow-ups work after I fix its findings?**
Return each blocking fix or evidence-based rejection to the same reviewer with finding IDs, revisions, the correction diff, and focused test evidence; a passing test alone does not close a blocker. Follow-up checks the corrections and what they affect. Code and test stages share at most two automatic follow-up passes. If blockers remain after that, delivery holds and the owning authority (the epic owner for a delegated lane, otherwise the user) decides the next step. An exhausted budget is never PASS, and a new reviewer or handoff does not reset the count.

**Is the 1000-line rule a hard cap?**
No. Crossing it makes the review ask whether to decompose first; a compelling structural reason with a clearly organized file waives it.

**Can I run it inline in the session that wrote the code?**
No. That session holds every justification behind the code, so the code-judo move is exactly what it cannot see. Dispatch the `code-quality-reviewer` agent, which loads this skill as its rubric and gathers `git diff <base>...HEAD` itself if needed. With no subagent mechanism, hand the diff to a fresh session and say so in the report. An author's own pass is never this gate.

## It's working if

- The review fired at completion unrequested, and every report opens with a verdict line.
- Every finding is labeled, and out-of-scope ones became follow-ups without touching the diff.
- The top findings are structural, and approval was withheld on working code that left the architecture messier.
- The reviewer confirmed blocking dispositions against the corrected revision.

It's misapplied if it fires mid-implementation, the diff grows from findings the accepted work never named, or it was skipped because the change looked small.

## Where it fits

The last gate before landing. After `verification-before-completion` (and `empirical-proof` if asked), the initial round runs, with [test-quality-review](test-quality-review.md) in parallel when production logic or tests changed; `pattern-reviewer` follows. Once blockers close, the session outlines the work and asks PR or merge, unless repo or user rules already settled that.
