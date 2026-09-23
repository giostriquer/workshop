# Decision: keep mutation probes outside delivered tests

**Date:** 2026-09-21

**Release:** workbench 0.40.3

## Change and reason

TDD already says to ship only the tests the behavior needs. The test reviewer
already distinguishes meaningful survivors from equivalent mutants and incidental
wording. The missing contract is the boundary between useful regression tests and
temporary mutation work: the standalone review skill lacks the agent wrapper's
unchanged-worktree rule, and neither skill explicitly checks mutation artifacts
before delivery.

Keep that boundary in the two canonical skills. Mutation probes use isolated
copies of production code. Preserve the author's staged, unstaged, and untracked
work, verify preservation after every exit, and keep temporary probes and run
output out of commits. The reviewer reports preservation alongside mutation
results, including unresolved cleanup. Authors retain tests for required behavior,
strengthening existing cases where suitable instead of adding a test per mutant.

Update the paired usage pages and prepare the patch release. This change adds no
mutation tool, score threshold, test harness, or repository layout change.

## Verification

Four fresh consuming-agent probes compared the current and revised instructions:
one author scenario and one reviewer scenario per version. Each used a deadline,
elapsed effort, and waiting handoff pressure, with pre-existing staged and
untracked user work.

| Scenario | Current instructions | Revised instructions |
| --- | --- | --- |
| Author selecting mutation-derived tests and preparing a commit | Retained useful behavior coverage, consolidated duplicates, excluded temporary probes and reports, and preserved user work | Retained the same useful coverage; explicitly checked preservation after all exits and inspected the final commit contents |
| Reviewer running a custom tool with timeout and leftover-file cases | Used isolation and preserved user work, but returned a test-quality `PASS` with unresolved cleanup as an Observation | Reported preservation explicitly and returned `ISSUES_FOUND` when ownership or cleanup remained unresolved; allowed `PASS` after verified preservation |

These were instruction-consumption scenarios, not executions of a mutation tool
or real commits. Small samples establish regression evidence, not cross-model
reliability. The author baseline already handled test selection correctly; the
observed correction is the review verdict when cleanup remains unresolved.

## A probe is one hand-applied defect, never a tool sweep (2026-09-22)

A workflow that dispatched nine implementer agents to fix the findings of a
project-wide test-quality audit told each one to prove its fix by applying the
finding's mutant and watching the test fail. Seven of the nine instead reran
cargo-mutants over their slice, 35 to 451 mutants each, for one to two and a
half hours in parallel on one machine; every test-quality review dispatched
during that window ran under a load average above 20, with one-second test runs
taking up to 53 seconds. The TDD probe text described isolation and cleanup but
never said what a probe is, so an implementer read "prove it" as "run the tool".
The section now defines a probe as one named defect applied by hand and one
focused test run, and assigns mutation-tool sweeps to the test-quality review.
A plan-only micro-test of the fixer dispatch, three fresh contexts per arm, is
recorded below. The test-quality rubric gained the matching clause that a
language with no production line and no test in scope gets no run and no setup.

| Question (fixer plan, three findings with named mutants, Rust crate) | Current wording | This wording |
|---|---|---|
| Plans a cargo-mutants sweep over the file or crate | 0 of 3 | 0 of 3 |
| Runs cargo-mutants at all (one plan: scoped to the three named mutants, in place) | 1 of 3 | 0 of 3 |
| Proves each fix with a hand-applied mutant and one focused test run | 3 of 3 | 3 of 3 |

The plan-only test does not reproduce the sweeps; the nine fixer transcripts,
all with the TDD skill loaded, are the recorded failure. The wording closes the
remaining tool use in the one control plan that reached for it.
