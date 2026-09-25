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
| Does the change actually work? | `verification-before-completion`, `empirical-proof` |
| Reviewing a spec or plan before implementation | `spec-reviewer` agent |

## The rubric

The baseline is a deep audit that restructures the change without altering behavior: **"Be extremely thorough and rigorous. Measure twice, cut once."** On top sit nine standards. Rule 0 is ambition: delete complexity rather than rearrange it. Rules 1 to 7 fight a file pushed past 1,000 lines, ad-hoc branches bolted into unrelated flows, rubber-stamped "it works" code, magic and thin wrappers, loose types and silent fallbacks, logic in the wrong layer or duplicated helpers, and needless sequential or non-atomic orchestration. Rule 8 reports what the [comment trim](trim-comments.md) left: comments your repo's rules say to remove, a lint or type suppression that hides a correctness rule, and a "do not remove" comment a test, type, or lint could enforce.

**Scope decides what a finding costs** ([decision](../decisions/workbench-operator-decisions.md)). Strictness applies inside the accepted work (ticket, plan, or agreed change), which the dispatch hands the reviewer as its accepted scope, and every finding carries a label:

- **In-scope (blocking):** a demonstrated defect or material structural problem in this change.
- **In-scope (advisory):** a supported improvement without a blocking consequence.
- **Out-of-scope (follow-up):** adjacent defects, pre-existing mess this diff did not worsen, improvements beyond the accepted work. Recorded in the existing scope record, not folded into the change.

A finding that proves the change unsafe or incorrect as shipped blocks wherever it lives. An unlabeled finding reads as blocking. Any structural concern blocks only when the review demonstrates a correctness or material maintainability consequence; file length or an alternative design alone does not.

The report opens with `## Verdict: PASS` or `## Verdict: ISSUES_FOUND`, then the reviewed revision, follow-up pass number, and stable finding IDs; a missing verdict line reads as `ISSUES_FOUND`. Findings run structural regressions first and legibility last; few high-conviction comments beat many nits.

## Common questions

**My diff is three lines. Do I really have to run this?**
Yes, unless you decline it or your repo's own review process supersedes it ([decision](../decisions/code-quality-review.md)).

**The review found problems unrelated to my change. Do I fix them?**
No. They become out-of-scope follow-ups, so the diff stays the size the accepted work defined, unless one proves your change unsafe or incorrect as shipped.

**Can I run it midway through to catch problems early?**
Not as this gate. Mid-implementation, each round surfaces new work and the diff grows.

**How do follow-ups work after I fix its findings?**
Return each blocking fix or evidence-based rejection to the same reviewer with finding IDs, revisions, the correction diff, and focused test evidence; a passing test alone does not close a blocker. This review owns its follow-ups and pass record, checking the corrections and what they affect.

**Does every later edit restart review?**
No. Confirmation of all blockers ends the correction loop. A new edit or SHA alone does not reopen it. New scope or a material redesign that invalidates a prior conclusion needs review of the affected delta by its owning reviewer. Explicit review requests and repository gates still apply.

**Will the session stop to ask before another follow-up?**
No. A focused follow-up on a verified correction runs without asking, however many passes came before; the pass number is a record, not a limit ([decision](../decisions/bounded-correction-review.md#convergence-replaces-the-follow-up-pass-count-2026-09-24)). On a follow-up, the reviewer checks the open blockers, the correction and what it affects; anything it finds outside that focus is a follow-up, never a blocker, unless it proves the change unsafe or incorrect as shipped. Review stops only when it stops converging: a follow-up closes or narrows none of the blockers it was sent, a finding the author rejected with evidence comes back without new evidence, or two follow-ups in a row each raise a new blocker and end with at least as many open blockers as they were sent (fixes that keep producing new blockers). Narrowing a finding is progress, never churn. One fix that regresses and gets caught does not stop it. When review does stop, delivery holds and the owning authority (the epic owner for a delegated lane, otherwise you) decides the next step; unless that decision ends review, follow-ups run on their own again from there, and a fix made while review is held waits for it. A held review is never PASS: a blocker closes only on reviewer confirmation or your explicit waiver, and a new reviewer or handoff does not reset the record.

**Is the 1000-line rule a hard cap?**
No. Crossing it makes the review ask whether to decompose first; it blocks only when the review demonstrates a concrete maintainability consequence, never on the line count alone.

**Who trims the comments?**
The `trim-comments` stage, run by the `comment-trimmer` agent before this round, edits the diff's code comments. This review flags what remains, per your repo's rules, and the implementer acts on it; it never deletes a comment itself. With no comment rules in the repo, it still flags a suppression that hides a correctness rule and a constraint comment that a test, type, or lint could enforce; one the trim already offered to encode waits for your answer at the outline, so the review notes it rather than raising it again. A comment that only restates the code is `pattern-reviewer`'s check, which flags it by default wherever that agent runs.

**Can I run it inline in the session that wrote the code?**
No. That session holds every justification behind the code, so the code-judo move is exactly what it cannot see. Dispatch the `code-quality-reviewer` agent, which loads this skill as its rubric and, if needed, gathers the diff itself: the working tree against the base's merge base, untracked files included. Hand it the accepted scope, the ask as the ticket or plan put it, not your view of the code. It runs on your session's model, without your history. On Codex, spawn it as the agent file's Dispatch line says, which forks none of your history, and paste the file's body into the spawn message ahead of the three inputs, since Codex registers no plugin agents. With no subagent mechanism, hand the diff to a fresh session and say so in the report. An author's own pass is never this gate.

## It's working if

- The review fired at completion unrequested, and every report opens with a verdict line.
- Every finding is labeled, and out-of-scope ones became follow-ups without touching the diff.
- The top findings are structural, and approval was withheld on working code that left the architecture messier.
- The reviewer confirmed blocking dispositions against the corrected revision.
- Focused follow-ups ran without asking you, and the session stopped only when review stopped converging.

It's misapplied if it fires mid-implementation, the diff grows from findings the accepted work never named, it was skipped because the change looked small, the session asked permission for a focused follow-up, a finding outside the follow-up's focus held delivery, or review looped on fixes that kept producing new blockers.

## Where it fits

A completion gate before landing. After verification and the [comment trim](trim-comments.md), it reviews the trimmed diff and returns its own verdict. [using-workbench](using-workbench.md) and [file-pr](file-pr.md) coordinate delivery stages; this skill owns implementation structure, maintainability, and closure of its findings.
