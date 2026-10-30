# test-quality-review

[Canonical skill](../../plugins/workbench/skills/test-quality-review/SKILL.md)

## What it does

This skill reviews implemented test code for **trustworthiness**: whether each test protects the behavior it claims to protect. It reads the tests with the production code they exercise, because **"a test that compiles, runs green, and asserts almost nothing passes every other review gate."**

It is **dispatched, never self-served**: the `test-quality-reviewer` agent runs it as a separate Opus agent at `xhigh` effort on Claude Code or `gpt-6.1-sol` at `xhigh` reasoning effort on Codex, spawned without your session's history (the host's default model elsewhere). A change review returns `PASS` or `ISSUES_FOUND`; other requests get prioritized findings or a testing recommendation. The implementer owns fixes and permanent tooling changes.

## When to reach for it

It runs when a full change to production logic or tests is implemented, verified, and ready for delivery, in its own test-scoped prompt. Edits and intermediate checkpoints do not trigger it. Reach for it directly to audit existing tests or get a testing recommendation: give it the question or target, plus the base branch when known.

| The problem | The skill |
| --- | --- |
| A finished diff changes logic or tests | `test-quality-review` |
| Do the tests in this folder catch regressions? | `test-quality-review`, with the folder and question |
| What testing posture should this project adopt? | `test-quality-review`, with the project's risks |
| How should I write the tests in the first place? | [test-driven-development](test-driven-development.md) |

## The rubric

**Checklist.** Trivially-passing setup, weak or absent assertions, tautological or saturated mocks, wrong-path testing, missing edge cases, brittle coupling, non-determinism, and test-code complexity. A finding names a concrete way the test fails to protect its claimed behavior.

**Scope.** Mutate changed production behavior and the functions behind changed
test cases, including protection lost through a removed assertion. A pure move
keeps only changed wiring in scope. Pre-existing gaps remain strategy notes;
test files and their helpers are not mutation-tool targets.

**Execution.** The reviewer uses qualified framework runners where available,
or a focused command fallback with coverage limits disclosed. Setup and runs
stay in one disposable copy, with supported isolated runtime data and config
roots verified before writes. Source isolation alone does not protect app data.
The [canonical rubric](../../plugins/workbench/skills/test-quality-review/SKILL.md)
owns exact tool recipes, estimates, budgets, and reuse requirements.

**Limits.** Initial rounds have a thirty-minute ceiling including setup;
follow-ups have fifteen and cover the correction delta. Campaigns run one at a
time on the host: the reviewer checks `ps` before each launch and waits, up to
fifteen minutes outside the budget, for another session's campaign. The review's
disposable copy gets a new, absence-checked path, and follow-up rounds reuse it.
Completed scope is not rerun under another runner. Unsupported syntax,
slow tests, and parsed behavior tools cannot mutate use the rubric's bounded
fallbacks. Hand-applied defects need an inspected production diff and unchanged
test expectations before a failure counts.

| Result | What it means for the review |
| --- | --- |
| Behavioral survivor or newly lost protection | Issue with the assertion needed to catch it |
| Equivalent mutant or irrelevant wording change | Observation |
| Partial run or uncertain timeout | Scope and reason disclosed in strategy notes; no waiver or extension |
| Required run blocked after bounded setup | `ISSUES_FOUND`, with attempts, remaining work and the command; the next review round runs it, not the implementer |
| Code this host cannot build | `blocked` with the platform and a capable host's command; open until the user supplies that host or waives the run |
| Run waived by the user or a superseding repository rule | Explicit waiver, not a passing run |
| Unresolved writes outside the review's isolated state | Preservation gap and `ISSUES_FOUND` |

Known loop or hit-limit evidence can support timeout detection; unexplained
deadlines are not assertion kills. Saved results require unchanged relevant
inputs and explicit fresh/reused counts. A restart does not renew the budget.

**Judgment.** Mutation score and coverage are evidence, not pass thresholds.
Property-style checks matter where examples cannot cover the risk. The report
names concrete defects, protected behavior, runner limits and preservation.

## Common questions

**The diff is a pure move. Does the review mutate the moved code?**
No. The tests that exercised it before the move still characterize it; only the changed wiring and edited lines are in scope.

**My project has no mutation tool or config. Will the review set it up?**
Yes, in isolation, with a focused config and a passing, nonempty baseline. For Rust the run is `cargo mutants --in-place` inside the reviewer's clone, so the clone's build cache serves every mutant. Permanent changes go back to the implementer; an install restriction or unresolved environment failure is reported as a blocker.

**A test file changed but the production file did not. What gets mutated?**
The functions the changed test cases call, selected by name or line range, not the whole file. A changed or removed assertion that loses protection creates an Issue even when production is unchanged. Gaps that predate both the production and test diff stay under Strategy notes.

**What does a follow-up round rerun?**
The delta: the lines the correction changed and the lines behind each finding it claims to close, plus scope a prior round left `blocked` (including `blocked: host busy`), in the initial round's copy brought to the new revision, within 15 minutes. Another platform's code is the exception: it stays blocked until you supply a host that builds it or waive the run.

**Who owns follow-ups and when do they stop?**
This skill does. Return verified fixes or evidence-based rejections to the same reviewer for confirmation. Follow-ups run automatically while findings close or narrow. Delivery holds on no progress, a rejection repeated without new evidence, or two consecutive passes that each add a blocker without reducing the open count. The owning authority decides the next step; a hold is never PASS. Once all blockers are confirmed closed, a later edit or SHA alone does not reopen review.

**Can it use Bun through Stryker's command runner?**
Yes, as the fallback when no framework runner works in the copy, with `coverageAnalysis: "off"` and an explicit command that selects the relevant test files and propagates failures; a bare full-suite command does not qualify. The report shows `NoCoverage: unavailable`. It is never a second pass over a scope a framework runner already completed.

**Some mutants timed out, or the lane's budget ended with scope uncovered. Who decides what happens?**
The reviewer records the evidence within the existing budget. Keep timeouts separate from assertion kills: a known hit-limit or loop reason establishes timeout detection; an unexplained deadline remains inconclusive even on an exclusive host. Record uncertain or uncovered scope as `partial` with the reason and command under Strategy notes. Timeouts and partial scope do not hold delivery, trigger a repeat campaign, or require a waiver; concrete test gaps remain Issues.

**Does every mutant need its own committed test?**
No. One strengthened assertion or table case can kill several. Injected defects, mutant copies, and probe tests stay out of the deliverable.

**Why does the Codex spawn name the effort and fork no history?**
A spawn that names a model but no effort runs at that model's default effort, and a forked history hands the reviewer the author's reasoning about the tests. The `test-quality-reviewer` agent file's Dispatch line names the spawn's model, effort and `fork_turns: "none"`, and since Codex registers no plugin agents, the spawn message pastes that file's body ahead of the question or target and the base branch. On Claude Code the agent file pins the model and effort, so pass no model. Which model and effort, and why, is `model-reference`'s test-quality review exception.

**Can one prompt ask for code and test quality together?**
No. The reviewer answers `## Verdict: REFUSED - out-of-scope dispatch`; each stage is a separate dispatch.

## It's working if

- Every PR that changed logic or tests had this review, run by a context that did not write the tests.
- The report has a `Mutation run` line with scope, its estimate, real counts and the lane's elapsed time against its budget, or an explicit `partial`, `blocked`, `waived`, or `not applicable` record.
- The `Workspace preservation` line verifies the author's checkout and isolated runtime destinations, with no unresolved external writes.
- Issues name concrete mutants and the assertions that kill them.

It's misapplied if the author's session ran it, missing tools produced a qualitative PASS, a pure move's bodies were mutated, a whole file was swept because one of its tests changed, a test file was mutated, a completed campaign was rerun under another runner, two campaigns ran at once, a follow-up round rebuilt the copy and reran the initial scope, a copy was cloned into a folder another reviewer held, a custom harness was built for unparsed files, the lane ran past its budget, another platform's code was recorded as `waived`, an implementer ran the campaign a review left blocked, or a mutation decision was sent to the caller or an epic owner.

## Where it fits

It returns an independent verdict on test trustworthiness, with its own findings, follow-ups, mutation evidence, and pass record. [using-workbench](using-workbench.md) and [file-pr](file-pr.md) coordinate delivery stages. A gap outside a follow-up's focus goes under Strategy notes unless it proves the change unsafe or incorrect as shipped.

## Mutation procedure

Before running or assessing mutations, the reviewer reads the [mutation procedure](../../plugins/workbench/skills/test-quality-review/references/mutation-testing.md), including after compaction. It retains tool selection, disposable-copy safety, time bounds, fallback conditions and reporting. Missing or partial execution stays visible; it does not become a passing score.
