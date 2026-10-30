---
name: test-quality-review
description: Use when a verified change to production logic or tests is ready for delivery, or when asked to audit whether existing tests protect behavior or to propose a test-quality strategy.
---

# Test Quality Review

## Purpose

Review implemented test code for trustworthiness: whether tests actually protect the
behavior they claim to protect, especially where weak tests would create false
confidence around high-impact code.

This review is code-first. It reads test code, the production code under test, and any
published test-risk evidence the project provides. It exists because a test that compiles,
runs green, and asserts almost nothing passes every other review gate.

The test surface, risk profile, coverage target, and metrics artifact locations are
project-defined. The canonical default is portable; adopting projects should name their
test directories, high-impact surfaces, and metric targets in `AGENTS.md`, `CLAUDE.md`, or
their testing conventions.

## Who runs it: a reviewer that did not write the tests

This review is **dispatched, never self-served.** The session that wrote the tests chose
their inputs and assertions, so the gaps between them read as coverage.

- **When:** when the full agreed work set changes production logic or tests,
  is implemented and verified, and is ready for delivery; or when asked to
  inspect existing tests or recommend a testing approach. Edits, subtasks, and
  intermediate checkpoints do not trigger this review. Explicit user waivers
  and superseding repository processes retain precedence.
- **Who:** the `test-quality-reviewer` agent, dispatched by name with no model (on
  Codex, paste the agent file and use its Dispatch line, per `using-workbench`'s
  *Workbench agents on Codex*); on another host without that agent type, a reviewer
  context that loads this skill, on the host's default model. Give it the
  test-quality question or target, plus the base branch when known, in a separate
  prompt. Never let it inherit the parent's model, effort, or history; the reviewer
  never dispatches another agent.

## Workflow

1. **Resolve the scope from the request.** Use the named question, change set, file,
   folder or subsystem. For a change review, use the supplied base or the remote
   default branch (`git symbolic-ref --short refs/remotes/origin/HEAD`), then
   `git diff $(git merge-base <base> HEAD)` and
   `git ls-files --others --exclude-standard` to include committed, staged,
   unstaged and new files. State the scope; ask only when an ambiguity prevents
   useful review. Do not inherit the caller's assessment of the tests.
2. **Read the tests with the production behavior they exercise.** Read relevant
   testing conventions, declared risks and existing metrics. Use the checklist
   below to identify concrete coverage gaps, including changed production logic
   with no changed tests. Behavior-neutral refactors may need no new tests.
3. **Apply the relevant checks.** Review assertions, setup, boundaries and failure
   paths. Use available metrics to prioritize risk and recommend property tests
   where examples cannot protect the contract. Missing metrics are a stated
   limitation, not a reason to stop reviewing.
4. **Run mutation testing when the reviewed change set changes logic or tests, or
   when execution is explicitly requested.** Follow the setup, scope and evidence
   rules below. Other requests may recommend focused mutation checks without
   installing tooling or inventing a delivery gate.
5. **Answer the request with evidence.** For a change set, return `PASS` or
   `ISSUES_FOUND`; a diff with neither production logic nor tests can return
   `PASS - no test surface in this diff`. For other requests, report prioritized
   findings or a narrow testing recommendation, with inspected scope and limits.
   Ground advice in the project's framework, risks and existing policy. Advice
   alone does not make absent tooling or suggested targets into requirements.

## Revision rounds

Continue the same reviewer session for the same task. Return each blocking fix
or evidence-based rejection with its finding ID, revisions, correction delta,
and focused test evidence once the batch is verified. Passing tests alone do
not close a finding: this reviewer confirms closure. If replaced, give the new
reviewer the existing record. Requests outside delivery keep their agreed scope.

1. Resolve the current scope again; never review a cached change set.
2. Re-read only the test and production files that changed between rounds, unless a prior
   finding requires wider context. Repeat a required or requested mutation run
   when its production files or tests changed between rounds, over the round's
   delta only: the production lines the correction changed and the lines behind
   each finding it claims to close, with the initial round's tool. Bring the
   initial round's disposable copy to the new revision (check out the reviewed
   commit or apply the delta there) and keep its build caches; a follow-up round
   creates no new copy and does not rerun the initial round's scope. Scope a
   prior round left `blocked` joins this round's mutation scope even when no file
   changed. It runs in the existing copy, or in a new one when the copy caused
   the block; what stays uncovered is `partial`. Code this host cannot build
   stays `blocked` for the user, as the mutation lane says. A follow-up round's
   mutation lane has 15 minutes of wall clock in total.
3. Delta walk prior findings by stable ID. Classify each as Resolved, Partially
   resolved, Not resolved, or Rejected with evidence. Cite the test location or
   contrary evidence that supports the disposition.
4. Check open findings, the correction delta, and affected tests, production
   behavior, and contracts. Broader invalidation needs the full affected scope.
   New blockers need a demonstrated consequence. A gap outside this focus goes
   under Strategy notes, never as an Issue, unless it proves the change unsafe
   or incorrect as shipped. Unrelated cleanup and preferences do not extend the loop.
5. Record the reviewed revision, the follow-up pass number, and Delta walk.
   Unresolved findings or unreviewed corrections hold delivery; a review held for
   not converging never converts them into PASS.

Run focused follow-ups automatically while this review converges. Number its
submissions from 0 as a record, never a limit. Replacing a reviewer who did not
return completes the same submission. Corrections and owner validation are not
review passes; advisory-only findings do not trigger one.

Hold further submissions and delivery when a pass sent at least one open blocker
closes or narrows none of them, a rejected finding returns without new evidence, or
two consecutive follow-ups each raise a new blocker and end with at least as
many open blockers as they were sent. A pass that only narrows findings neither
counts toward nor breaks that two-pass sequence.

Report the open findings, both sides' evidence, and a recommended next step to
the epic owner for a delegated lane, otherwise the user. Their decision restarts
automatic passes and the two-pass count unless it ends review. Corrections may
continue under existing authority, but submission waits while review is held.
Only reviewer confirmation or an explicit user waiver closes a blocker.

Confirmation of all blockers ends this correction loop. An edit or new SHA
alone does not reopen it. New scope or a material redesign that invalidates a
prior conclusion needs review of the affected delta. Explicit review requests
and superseding repository gates still apply. Preserve this record across
reviewer replacements, PR preparation, and session handoffs.

## Capability lanes

### Baseline trustworthiness checklist

Flag test code exhibiting:

- **Trivially-passing setup** - the test configures a degenerate case or triggers a guard's
  early return, so the claimed behavior never executes.
- **Weak or absent assertions** - the test asserts only existence, truthiness, broad
  snapshots, or "no exception thrown" when the behavior has an observable result.
- **Mock-saturated / tautological-mock tests** - the test mocks the behavior it claims to
  verify, reasserts configured mock returns, or over-mocks same-domain collaborators that
  real setup or shared fixtures could exercise.
- **Wrong-path / adjacent testing** - the name claims behavior X but the body exercises
  behavior Y, or setup skips the state transition needed to reach X.
- **Missing edge cases** - boundary values, malformed inputs, failure paths, optional
  fields, stale records, permission variants, concurrency/coincidence cases, or host
  variants that production code supports but tests omit.
- **Brittle / over-coupled tests** - assertions depend on incidental implementation detail
  when a stable observable contract exists.
- **Non-deterministic / order-dependent tests** - reliance on wall clock, random data,
  uncontrolled filesystem state, shared mutable state, or unspecified ordering.
- **Test-code complexity** - duplicated setup that should use an existing fixture, or
  complex test control flow that hides what behavior is actually asserted.

The checklist is judgment-driven. Flag an issue only when you can name a concrete way the
test fails to protect the behavior it claims to protect.

### Metrics lane

Metrics are risk evidence, not a substitute for reading tests.

- Coverage targets are project-defined. Do not impose a universal coverage percentage.
- CRAP target: the default recommended ceiling is `<= 6` for changed or audited
  production methods when valid per-method CRAP data exists. A project may override this.
- Valid CRAP requires both meaningful coverage and meaningful cyclomatic complexity for
  the same method. If complexity is missing, zeroed, `NaN`, or clearly synthetic, report
  CRAP as unavailable instead of deriving a score.
- A method above the CRAP target is a scrutiny priority. For delivery, it is blocking
  only when the diff changes that method or its tests and the test suite does not
  adequately cover the risky behavior, or when the project explicitly makes the target
  gating.
- Cyclomatic complexity of test methods is a smell when it makes assertions hard to
  understand or lets multiple paths hide inside one test.
- Metrics may be partial. Tests outside the metric surface still receive qualitative
  review.
- Read existing coverage and complexity artifacts; recommend a documented command
  when more evidence would help. Do not start a full metrics pass for this review.
- Read metrics from the artifacts the project publishes. This review does not own
  coverage tooling.

### Property-testing lane

Property testing is a candidate strategy when behavior has stable invariants across many
inputs. Recommend or flag missing property-style coverage when a realistic regression
would evade example tests and the code has one of these shapes:

- parser / formatter / serializer / deserializer round trips
- normalization, canonicalization, sorting, grouping, deduplication, or idempotence
- permission matrices, state transitions, or host/protocol compatibility matrices
- numeric boundaries, allocation/accounting invariants, pricing/cost attribution, or
  resource totals
- persisted data migrations and backwards-compatible snapshot loading

Do not demand property tests for every behavior. If a small example-based test covers the
contract better, say that. For delivery, missing property tests are blocking only when
the project policy requires them or when examples plainly cannot cover the risk surface.

### Mutation-testing lane

Use mutation thinking on every review: ask which obvious mutant would survive
these tests. A relevant surviving defect is a test-quality issue. A change to
production logic or tests requires the scoped mutation run in Workflow step 4;
other requests run it only when explicitly requested.

Before selecting, executing or assessing a mutation run, read
[Mutation testing](references/mutation-testing.md) for scope, tool selection,
disposable-copy safety, time bounds, fallback conditions and evidence reporting.
Read it again when resuming a run after compaction. Preserve the implementation,
tests and fixtures; blocked or partial execution remains a named limitation,
never a fabricated score or a passing run.

### High-impact project lane

If the project declares a subsystem high-impact, or the context makes risk obvious, apply
stricter scrutiny:

- Treat weak assertions and tautological mocks as higher severity.
- Prefer negative, boundary, malformed-input, and backwards-compatibility coverage over
  more happy-path examples.
- Recommend periodic checks of high-risk tests, informed by metrics and targeted
  property or mutation testing.
- Call out where the current project policy is missing targets. Recommend targets without
  inventing them as mandatory gates.

## Output format

For change reviews, use the format below. For other requests, answer with
prioritized findings or recommendations, the inspected scope, supporting evidence
and limits. Include mutation results and preservation whenever setup or execution
occurred; do not turn advice about existing tests into a delivery verdict.

```
## Verdict: PASS | ISSUES_FOUND

Reviewed revision: [commit; include diff fingerprint for uncommitted changes]
Follow-up pass: [0 initial, or the follow-up's number]

### Metrics
- Coverage target: [project target or "not declared"]
- CRAP target: [project target or "default <= 6"] / availability: [artifact summary]
- Notes: [short metric caveat, or "metrics absent; qualitative review performed"]
- Mutation run: [tool/version, runner, mutation scope, test scope, estimate
  (mutants × baseline ÷ concurrency) and any narrowing, setup and run
  commands, lane time as minutes of the round's budget, report path and outcome
  counts; Stryker: killed / timeout / survived /
  no coverage (unavailable with the command runner) / errors; cargo-mutants:
  caught / missed / timeout / unviable, timeout reasons and inconclusive outcomes,
  with fresh and reused results separated, and any campaign wait in minutes and
  whether the process listing could see other sessions; or "partial: <covered
  scope> / <uncovered scope>" when the budget, the estimate rule, the wait limit
  or a handback stopped the lane, or shared-host timeouts left lines unproven;
  or "blocked: <failure, attempted repair, remaining
  scope>", naming the platform and a capable host's command when this host
  cannot build it; or "waived: <authority and scope>"; or
  "not applicable: <source evidence of no executable behavior, or files the
  tool does not parse>"]
- Workspace preservation: [verified against pre-run staged, unstaged, and untracked
  state and isolated runtime destinations; or "unresolved: <paths and reason>";
  or "not applicable: no setup or run"]

### Delta walk
[On revision rounds: prior finding ID, disposition, and supporting evidence.]

### Issues
1. **[Stable finding ID] [Category]** Brief description
   - Test: `path::TestName`, or `missing`
   - Mutant: `file:line` original → replacement (mutation findings only)
   - Problem: concrete way the test fails to protect behavior, or required mutation
     evidence still missing after setup or repair
   - Suggested fix: specific test-strengthening change or action to unblock execution

### Strategy notes
- Property-test candidates, mutation-test candidates, or high-impact audit notes that do
  not block this diff.

### Observations
- Non-blocking notes.
```

- `PASS` - no test-trustworthiness issue found that would let a weak or misleading test
  merge, the required run happened over the scope within the budget (complete
  or `partial`) or is `not applicable` or `waived` by rule, and workspace
  preservation is verified after setup or runs.
- `ISSUES_FOUND` - at least one such issue, a required run that never happened
  (`blocked`), or unresolved mutation workspace preservation.
- Observations and Strategy notes are non-blocking unless explicitly tied to an Issue.

## Refuse combined-review dispatches

This review covers test quality only. If a dispatch prompt also asks for spec-compliance,
production architecture, pattern review, documentation review, or a combined verdict,
refuse on the first turn. Do not read the diff. Emit:

```
## Verdict: REFUSED - out-of-scope dispatch

This review's scope is test-code quality, risk coverage, and test strategy only. The
dispatch prompt requested:

- [list each out-of-scope review]

Each review stage is a separate dispatch. Re-dispatch the test-quality review with a
test-scoped prompt.
```

A prompt is in scope when it asks for test trustworthiness, test design, risk coverage,
property-test candidates, mutation-test candidates, or test-quality metrics and does not
also ask for another review domain's verdict.

## Source priority

Use these in order:

1. Current test code and the production code it exercises.
2. Project testing conventions and risk-profile docs.
3. Metrics artifacts the project publishes.
4. Project workflow guides (`AGENTS.md`, `CLAUDE.md`, equivalent).

## Scope rules

This review covers test code and test strategy. It does not:

- edit, commit, or push changes in the author's checkout; mutation runs use isolation
  and must leave that checkout as found, including its staged and untracked state
- review production architecture, implementation patterns, specs or plans
- patch test or production code - the implementer owns fixes unless a project-local fork
  explicitly grants patch authority
- introduce permanent tooling dependencies in the author's checkout; isolated
  mutation-tool installation and setup repair are part of this review
- turn metric targets, property testing, or a mutation score into universal gates

## Suggested invocation

- Review the test quality of this change before delivery; the base is `main`.
- Check whether the tests in `tests/parser/` protect the behavior they claim.
- Recommend a testing approach for the parser's malformed-input boundaries.
