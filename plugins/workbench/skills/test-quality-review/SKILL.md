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
   creates no new copy and does not rerun the initial round's scope. A follow-up
   round's mutation lane has 15 minutes of wall clock in total.
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

Use mutation thinking on every review: ask which obvious mutant would survive the tests.
Examples: invert a predicate, remove a guard, change a threshold, skip a branch, return an
empty result, ignore a permission check, or no-op a state mutation.

A test that would obviously survive a relevant mutant is a test-quality issue.

**Mutation scope.** For a change review, the scope is the production lines whose
content changed (`path:startLine-endLine`) and, behind a changed test file, the
production functions its added, changed or removed test cases call (Stryker
`path:start-end` ranges over those functions; cargo-mutants `--re` on their
names), not the whole file. A test file and the helpers it defines are never a
mutation target, whatever a dispatch names as scope: gate, oracle or parser
logic that lives in a test file is reviewed through the checklist (a setup that
passes trivially, a helper that cannot fail) and at most five hand-applied
defects for that file. When the diff removes or relaxes an assertion, the
lines that assertion pinned join the scope. A survivor on a line the diff did
not change is a pre-existing gap: record it under Strategy notes, not as an
Issue. Resolve the scope with rename detection (`git diff -M`) and, for content
that left one file and appeared in another, a byte comparison of the removed and
added text. Content that moved without an edit has no changed lines: the tests
that exercised it before the move still characterize it, and mutating it audits
those tests rather than this change. For a move, the scope is the wiring the diff
changed: the references, exports, and bindings that now point at the moved
content, plus any lines the move also edited. For an explicitly requested run
over existing code, use the named production scope and the code exercised by the
named tests.

**Workspace preservation, for setup and every mutation command:**

1. Record the author's staged, unstaged, and untracked state before running. Use an
   isolated sandbox or disposable checkout that includes the reviewed changes and
   tests. Mutate production code there, preserving test expectations. A documented
   command that edits files in place also runs in isolation.
2. After success, failure, or timeout, stop any remaining mutation processes,
   including test processes the mutated tests spawned (search `ps` for the copy's
   path), and compare the author checkout with that baseline. Remove only run-created
   artifacts whose ownership is established; preserve pre-existing work and useful
   evidence. Keep evidence in the scope's scratch location, verified to be outside
   the commit set. The disposable copy itself stays for the task's later rounds
   and goes after the final round's verdict. Never reset the checkout or delete
   unrelated files for cleanup.
3. Report the preservation result. Injected defects, mutant copies, temporary probe
   tests, and temporary run output do not belong in staged changes or deliverables.
   If preservation or cleanup remains unresolved, return `ISSUES_FOUND` with the
   affected paths and the remaining gap; do not certify the review as complete.

- **Set up, then run.** For each required or requested mutation run, cover the
  eligible behavior in scope. Use StrykerJS for `.ts`, `.tsx`, `.js`, and `.jsx` production
  code, and `cargo-mutants` for Rust. Mixed changes need both; a language with
  no production line and no test in scope gets no run and no setup. Mutate
  production behavior exercised by changed tests, not the tests' assertions. The run's test
  set is the focused tests that exercise the scope; a test whose own run takes
  longer than 60 seconds stays out of it, and the lines only it exercises get
  one hand-applied defect run once against that test, recorded on the Mutation
  run line. Reuse a project's
  documented command when its tool, targets and tests meet this scope; inspect
  its configuration. A command for another feature is not evidence for this diff.
  Explicit user waivers and superseding repository processes retain precedence.
- Setup is installing and configuring the named tools for the inputs they parse.
  In-scope content the named tool does not mutate (a template, a fixture, a
  generated artifact, a file of constant exports) gets `not applicable: <files and
  reason>` on the Mutation run line and mutation thinking in the review; its
  evidence is that record, not a hand-built harness (a custom instrumenter
  script, a mutant loop, or probe lanes).
- Missing or broken tooling is setup work. Install a compatible tool and required
  runner dependencies, or repair the config, in the disposable copy or a dedicated
  tool prefix. Use the project's package manager and runtime; record versions and
  setup commands. For Stryker, install `@stryker-mutator/core` and any required
  framework runner. For Rust, use `cargo install --locked cargo-mutants --root
  <isolated-tool-prefix>` and put that prefix's `bin` on the run's PATH. Keep
  installation caches and artifacts outside the author's checkout. Return needed
  permanent config or dependency changes to the implementer; do not edit the
  author's manifests or lockfiles. Existing authorization covers this isolated
  setup; explicit installation restrictions or actual permission failures still
  apply and must be reported.
- The disposable copy is the cheapest the host offers: a filesystem clone
  (`cp -c` on APFS) or `git worktree add --detach <revision>` with the author's
  dependency directory linked and build caches cloned, not a fresh dependency
  install when the author's serves. A clone of a linked worktree carries a
  `.git` file that points at the author's git directory: delete it from the
  copy before any git command runs there. One copy holds every run of the
  round, mutation tools and hand-applied defects alike. Bound a run with the host's
  tool timeout or a background job polled by an `until` loop: macOS has no
  `timeout` command, and some hosts reject a `sleep` chained before a command.
- For StrykerJS, prefer a compatible framework runner with coverage analysis.
  Scope both mutation targets and tests; create or adapt a run-specific config in
  the isolated copy when the existing config targets unrelated work. Preserve the
  author's config.
- Stryker's `command` runner is the fallback when no compatible framework
  runner works in the copy, with `coverageAnalysis: "off"` and an explicit
  command that selects relevant bounded test files and propagates failures,
  such as `bun test ./tests/parser.test.ts`; it is never a second pass over a
  scope a framework runner completed. Verify a nonempty baseline against
  the isolated source. A bare full-suite command does not qualify. It reruns the
  selected tests per mutant and cannot distinguish unexecuted mutants from other
  survivors. On the Mutation run line, name the runner and test scope and report
  `NoCoverage: unavailable`, even if the table displays zero. Review every survivor.

  Run Stryker from the directory that holds the config or `package.json`, with
  paths relative to it, and keep the sandbox outside the worktree:

  ```
  stryker run --mutate <path:start-end,...> --reporters clear-text --cleanTempDir always --tempDirName <new directory outside the worktree>
  ```

- For Rust, run `cargo mutants --in-place` from the crate or workspace inside the
  disposable copy, as a single job, with `--copy-target` and `--jobs` unset and
  `--output` outside the copy: the clone's build cache serves every mutant, where
  the tool's own temporary copy rebuilds cold or copies `target/` once per job.
  Select mutation packages with `--package`,
  quote source globs passed to `--file`, and use `--in-diff <patch>` for changed
  hunks where applicable, and `--re` on the function names behind a changed
  test instead of the whole file. Select relevant test packages
  with `--test-package` when needed; pass focused Cargo test targets after `--`,
  for example `cargo mutants --file 'src/parser.rs' -- --test parser`.
  Verify a passing, nonempty baseline using the same tests and feature flags.
  Inspect effective config so workspace defaults do not expand the test scope.
  Report caught / missed / timeout / unviable counts; review missed mutants as
  survivors and count timeouts with the caught. Do not infer coverage from
  cargo-mutants outcomes.
- **One run per scope, one campaign at a time.** A completed run is the
  round's evidence for its scope; the same scope does not run again in the
  round under another runner, coverage setting or test set to confirm or
  reconcile its counts. A survivor the reviewer wants to check by hand gets
  one hand-applied defect in the copy. Campaigns run one at a time on the
  host: a second Stryker or cargo-mutants process never starts while one is
  running. Timeouts from a run that shared the host with another campaign are
  load, not detection: record their lines as `partial` with the
  single-campaign command under Strategy notes.
- A per-mutant timeout (Stryker `Timeout`, cargo-mutants `timeout`) from a run
  that had the host to itself is a detected mutant: the mutated program never
  finished the tests, which a CI run would catch. Count it with the killed;
  never diagnose, rerun, or carry it as unknown. Only a run that exceeds its
  own limit (the baseline, or a whole invocation) is a setup problem.
- Diagnose and repair an unmatched glob, an empty or failing baseline, an
  instrumentation failure, or an invocation that exceeded its limit, then
  rerun. Zero mutants over content
  the tool parses is a configuration defect to repair, unless the lines hold no
  expression the tool mutates (an import, a member access): record that count
  and reason on the Mutation run line and cover the lines with mutation
  thinking. Zero mutants over content it does not parse is `not applicable` for
  that content. Do not skip tests, weaken assertions, suppress relevant mutants,
  or drop files to obtain a clean run. Test or production fixes belong to the
  implementer. Stop retrying when there is no actionable repair within
  authority, rather than repeating the same failed command.
- **Estimate, then bound.** Every run has an estimate before its mutants
  execute: mutants × baseline seconds ÷ concurrency, from the counts the tool
  prints first (Stryker's `Instrumented N mutants` and `Initial test run
  succeeded ... in S seconds`; `cargo mutants --list` and the baseline build).
  An estimate over 10 minutes ends that run and narrows the scope before the
  next one starts: the functions behind a changed test shrink to the lines its
  new assertions pin, then the changed lines are sampled and the rest recorded
  as `partial`. The estimate and any narrowing go on the Mutation run line.
- **Time budget.** The mutation lane of one review round has 30 minutes of wall
  clock in total, setup included, and any single invocation stops at 15 minutes;
  both are ceilings, not targets. Split slow scope into focused runs inside that
  budget, on one disposable copy.
  When the budget ends with in-scope lines uncovered, stop: judge the survivors
  you have, record `partial: <covered scope> / <uncovered scope>` on the Mutation
  run line, and put the exact command for the uncovered scope under Strategy
  notes. Do not open another copy or lane to continue.
- **Mutation evidence is bounded, never negotiated.** What the lane ran within
  its budget is the evidence: the counts, `partial`, and the judged survivors.
  A partial run or a timeout is not an Issue, does not hold delivery, and needs
  no waiver, ruling, extension or diagnosis from anyone; never return a question
  about mutation scope, survivors, timeouts or waivers to the caller. The one
  mutation-evidence Issue is a required run that never happened over in-scope
  content the tool parses, after setup and repair within the budget: record
  `blocked: <failure, attempted repair, remaining scope>` on the Mutation run
  line with the exact command, and the implementer runs or repairs it. That
  verdict is `ISSUES_FOUND`; qualitative analysis cannot make the run PASS.
  `waived: <rule or user instruction>` records a run a repository rule or the
  user removed in advance, never a successful run and never a decision the
  reviewer, a caller or an epic owner makes.
  `not applicable` requires source evidence that the content has no executable
  behavior, or that it is an input the named tool does not parse; zero generated
  mutants alone does not establish either. For other languages, use the
  project's mutation tool when it has one; otherwise hand-applied defects on the
  changed lines are the evidence.
- Hand-applied defects, in any language, cover what the named tool leaves: a
  line it makes no mutant for (a JSX attribute, an `as const` object, a tuple
  comparison), a test file's own helpers, a survivor checked by hand, a test
  excluded for its run time, or a follow-up round under a project rule that
  waives the tool. They run one at a time in the one
  disposable copy, restoring the file between defects and reusing its
  incremental build, at most five per changed file per round, and never in
  parallel copies of the tree. Record each defect and its outcome.
- Judge every surviving and `NoCoverage` mutant in that code and classify it:
  - It changes behavior a consumer relies on: an Issue that gives the mutant and the
    assertion or case that kills it.
  - It changes nothing observable (an equivalent mutant): an Observation that says why.
  - It changes only wording that tests should not pin, such as a log or error message
    nobody matches on: an Observation that names it.
- A mutation-suppression comment the diff adds (`Stryker disable` or the tool's
  equivalent) is an Issue unless the comment states a reason a reader can check.
- The mutation score is not a pass/fail threshold.

Recommend the smallest behavioral improvement that covers a real gap: strengthen
an existing assertion or table case where suitable, or add a case for a distinct
requirement. Several mutants may be killed by one test. Do not request a separate
test per mutant or retain temporary mutation probes as regression coverage.

Acceptance mutation testing belongs here as a targeted strategy: mutate a behavior that an
acceptance or integration test claims to protect and verify the acceptance test fails.

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
  caught / missed / timeout / unviable; or "partial: <covered scope> /
  <uncovered scope>" when the time budget ended first; or "blocked: <failure,
  attempted repair, remaining scope>"; or "waived: <authority and scope>"; or
  "not applicable: <source evidence of no executable behavior, or files the
  tool does not parse>"]
- Workspace preservation: [verified against pre-run staged, unstaged, and untracked
  state; or "unresolved: <paths and reason>"; or "not applicable: no setup or run"]

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
