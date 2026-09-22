# Decision: mutation scope excludes moved content; the lane gets a total budget

**Date:** 2026-09-22

## Status

Implemented.

## Context

A test-quality review of a byte-preserving move (ten emitted TypeScript bodies
lifted from template literals into `.template` files, six small wiring hunks, no
test changes) ran for over an hour. The reviewer finished the scoped Stryker run
over the wiring in about a minute (34 mutants, all killed), then treated the ten
moved bodies as changed production hunks, built a mutant generator on Stryker's
instrumenter because the tool does not parse `.template` files, opened six probe
worktrees with lane runners on 13-minute budgets that restart until done, and
reran every survivor against a wider test set. It generated 1,498 mutants and 447
survivors, all findings about the pre-existing suite rather than the diff, and
was still running when the session was inspected.

Every step complied with the 0.40.6 wording:

- "Mutate changed production hunks" has no notion of content that moved without
  an edit. A move shows up as whole-file additions, so every moved line qualified.
- 0.39.0 stopped a run at 15 minutes total and recorded it `unavailable`. 0.40.6
  turned that into "stop any individual invocation at 15 minutes; split slow
  work into focused runs that together cover the required scope", which removed
  the ceiling and told the reviewer to keep going.
- "Missing or broken tooling is setup work", "diagnose zero mutants, then rerun",
  and "establish a focused mutation method" for unsupported inputs all pointed at
  making the templates mutable instead of reporting that the tool does not cover
  them.

## Decision

1. **Scope is lines whose content changed.** Resolve it with rename detection and
   a byte comparison of removed and added text. Content that moved without an
   edit has no changed lines; a move's scope is the wiring that now points at it,
   plus any lines the move also edited. Mutating moved bodies audits the existing
   suite, which stays a separate request.
2. **The lane has a total budget.** 30 minutes of wall clock per review round,
   setup included, 15 minutes per invocation, on one disposable copy. Scope left
   uncovered when the budget ends is recorded as `partial: <covered> /
   <uncovered>` on the Mutation run line and handed to the implementer as a
   named Issue; the reviewer does not open more copies or lanes to continue.
3. **Setup covers the named tools' own inputs.** In-scope content a tool does not
   parse gets `not applicable: <files and reason>` plus mutation thinking, never a
   hand-built harness. Zero mutants over parsed content is a config defect to
   repair; zero mutants over unparsed content is `not applicable`. For languages
   without a project tool, the fallback is a small hand-picked injection set (at
   most five defects per changed file) rather than an open-ended method.

## Evidence

The session transcript is the recorded baseline failure. A plan-only micro-test
then compared the 0.40.6 wording against this wording: three fresh reviewer
contexts per arm, the same placeholder dispatch (a byte-preserving move of ten
template bodies, six wiring hunks, no test changes, a tool that does not parse
`.template`), no execution, one Read of the rubric each. Three questions were
scored by reading every plan.

| Question | 0.40.6 wording | This wording |
|---|---|---|
| Moved bodies in the mutation scope | 3 of 3 yes | 0 of 3 |
| Hand-built harness planned for the `.template` files | 3 of 3 yes | 0 of 3 |
| A total stop condition stated | 0 of 3 | 3 of 3 |

Every control plan cited the same sentences the transcript followed: "changed
production hunks", "establish a focused mutation method", and "split slow work
into focused runs that together cover the required scope", and two of them named
the missing total budget as a gap. One control plan estimated its own campaign at
an hour on four workers. Two plans under the new wording flagged that a parsed
hunk holding only an import and a member access yields zero mutants but fit
neither `not applicable` condition; the shipped text records that case on the
Mutation run line with mutation thinking.

Three reps per arm is regression evidence for this dispatch shape, not a
reliability estimate across dispatches or models.
