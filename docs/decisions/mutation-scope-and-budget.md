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

## The scope behind a changed test is its subject; a follow-up reruns the delta (2026-09-22)

Eleven reviewer dispatches on 2026-09-22, seven on the 0.40.6 wording and four
on 0.40.8, showed that the budget and the moved-content rule stopped the
runaway but left the same total time per dispatch. The remaining time had four
sources. The clause "the whole production file behind a changed test" put 100
to 600 mutants on files whose diff touched ten lines (174 mutants and 30
minutes for one ten-line change; 494 mutants across three files for another),
and the survivors it produced were pre-existing gaps reported as findings; one
adopting project had already overridden the clause with a per-repository
"in-diff only, never whole files" rule. Follow-up rounds rebuilt the disposable
copy, reran the baseline and swept the initial scope again (40 of one
dispatch's 65 active minutes were its two follow-ups; another rebuilt a
worktree and reran Stryker for a four-line test-only delta). Hand-applied
defects ran in parallel copies of a 5 GB build tree and crashed, or were written
as a fresh harness per round. A multi-minute runtime test pulled into Stryker's
test set hit the tool's limit and produced no result. Six runs also lost a turn
each to `timeout`, which macOS does not have, and five to a `sleep` chained
before a command, which the host rejects.

The scope behind a changed test file is now the production functions its
added, changed or removed cases call, selected by line range in Stryker or by
name with cargo-mutants' `--re`, plus the lines a removed or relaxed assertion
pinned; a survivor on a line the diff did not change is recorded under Strategy
notes as a pre-existing gap. A follow-up round brings the initial round's copy
to the new revision, keeps its build caches, reruns the initial tool over the
round's delta and the lines behind each finding it claims to close, and has 15
minutes. The disposable copy is the cheapest the host offers, one for the task's
rounds, holding tool runs and hand-applied defects alike; hand-applied defects, in any
language, cover what the tool leaves and run one at a time in that copy, at
most five per changed file per round. A test slower than 60 seconds stays out
of the tool's test set and the lines only it reaches get one hand-applied
defect. The Mutation run line records the lane's elapsed time against the
budget, and the setup text names the macOS `timeout` and chained-`sleep` traps.

A plan-only micro-test compared the 0.40.8 wording with this one: three fresh
reviewer contexts per arm on an initial-round dispatch (a ten-line Rust change
inside an 812-line file with a changed test, a tuple comparison the tool cannot
mutate, a 257-second integration test, macOS) and three per arm on a follow-up
dispatch (a warm copy from the initial round, a three-line delta). The scored
questions and their counts are below; three reps per arm is regression
evidence for these dispatch shapes, not a reliability estimate.

| Question | 0.40.8 wording | This wording |
|---|---|---|
| Initial round: the whole file behind the changed test in scope | 3 of 3 | 0 of 3 |
| Initial round: a survivor on an unchanged line reported as an Issue | 3 of 3 | 0 of 3 (Strategy note) |
| Initial round: the 257-second test kept out of the tool's test set | 3 of 3 | 3 of 3 |
| Initial round: the lines only that test reaches covered by one hand-applied defect | 0 of 3 | 3 of 3 |
| Initial round: lines the tool cannot mutate covered by hand-applied defects, sequential in one copy | 0 of 3 (reasoning only) | 3 of 3 |
| Follow-up: the initial round's copy reused | 3 of 3 | 3 of 3 |
| Follow-up: the whole file swept again | 3 of 3 | 0 of 3 |
| Follow-up: a 15-minute lane stated | 0 of 3 (30 minutes) | 3 of 3 |
| Either round: a `timeout` command planned | 0 of 3 | 0 of 3 |

Every control plan cited the same sentences the transcripts followed: "the
whole production file behind a changed test", and hand-picked defects "for
other languages" only. Three questions did not separate the arms in a plan-only
test. Both arms kept the slow test out, primed by the 257-second figure in the
prompt, where the recorded run had pulled two such tests in; both avoided
`timeout`, primed by "macOS" in the prompt; and both reused the copy, which the
prompt said still existed, where the recorded runs had deleted it at the end of
the initial round as a run artifact. The preservation text now says the copy
stays until the final round's verdict.

## cargo-mutants runs in place inside the copy (2026-09-22)

The Rust recipe kept cargo-mutants' default temporary copy so a reviewer
could never mutate the author's tree in place. The disposable copy already
guarantees that, and the temporary copy costs the build cache: cargo-mutants
stopped copying `target/` in 24.9.0, and `--copy-target=true` (25.1.0, meant
for tests that need build artifacts) copies it byte for byte once per job. Two
reviews of a 4.6 GB Tauri crate on that setting saw 73- and 84-second
baselines and about 9.5 seconds per mutant across four jobs, because cargo's
fingerprints depend on the workspace path and the build script reran; the
setting had entered one project's dispatch rule as "earlier reviewers needed
it". A third review ran `--in-place` inside a filesystem clone of the worktree
and saw 2- to 39-second baselines and about 6 seconds per mutant on one job.
The recipe now runs `cargo mutants --in-place` inside the disposable copy as a
single job with `--copy-target` and `--jobs` unset, and the copy text says to
delete the `.git` pointer a clone of a linked worktree carries, since git
commands in the copy would otherwise reach the author's index.

