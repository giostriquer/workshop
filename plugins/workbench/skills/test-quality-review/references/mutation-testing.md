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
lines that assertion pinned join the scope. Lost protection introduced by the
test diff is an Issue even when production is unchanged; establish that loss
from the old assertion or before/after mutant evidence. A gap that already
existed before both the production and test diff belongs under Strategy notes.
Resolve the scope with rename detection (`git diff -M`) and, for content
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
   Before the first baseline, inspect the selected tests' external state: a source
   copy does not redirect application data, configuration, databases or child
   processes. Set supported run-owned temporary roots or isolated services and
   verify the resolved destinations before writes; verify containment on the
   baseline. Carry those settings into every mutant and child process. If this
   cannot be established, stop that execution path and report the setup gap.
   For a hand-applied defect, inspect the mutated source diff against the
   pristine copy before running: prove the intended production change landed
   and test expectations stayed intact. An unchanged file or setup failure
   cannot count as a detected mutant. A helper that applies, runs and restores
   one defect meets this when it checks that the diff against the pristine copy
   is exactly the intended production change, with no other line or test
   expectation touched, and stops before the tests run otherwise.
2. After success, failure, or timeout, stop any remaining mutation processes,
   including test processes the mutated tests spawned: search `ps` for the
   copy's, sandbox's and output's paths, never kill by tool name host-wide, and
   compare the author checkout with that baseline. Remove only run-created
   artifacts whose ownership is established; preserve pre-existing work and useful
   evidence. Keep evidence in the scope's scratch location, verified to be outside
   the commit set. The disposable copy itself stays for the task's later rounds
   and goes after the final round's verdict. Never reset the checkout or delete
   unrelated files for cleanup.
   Unexpected writes outside the isolated runtime are this review's preservation
   gap even if the faulty test predates the diff. Stop affected runs, record owned
   changes and unresolved paths, and respect existing cleanup authority. Never
   delete shared state or another session's data to obtain a clean verdict.
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
  In-scope inputs the named tool does not parse, such as an unsupported template
  format, get `not applicable: <files and reason>` on the Mutation run line and
  mutation thinking in the review; their
  evidence is that record, not a hand-built harness (a custom instrumenter
  script, a mutant loop, or probe lanes).
  Classify by actual syntax and tool support, not by labels such as fixture,
  generated file or constant export. Parsed runtime expressions with no supported
  mutant, such as an `as const` object, use the bounded hand-defect rule below.
  Do not rewrite production syntax just to make it mutable.
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
  copy before any git command runs there. Clone to a path that is absent
  before the clone, inside a fresh directory
  (`copy="$(mktemp -d <scratch>/tq.XXXXXX)/tree"`), and never clone into, clean
  or delete a folder another reviewer may hold. One copy holds every run of the
  round, mutation tools and hand-applied defects alike. Bound a run with the host's
  tool timeout or a background job polled by an `until` loop: macOS has no
  `timeout` command, and some hosts reject a `sleep` chained before a command.
- For StrykerJS, prefer a compatible framework runner with coverage analysis.
  Scope both mutation targets and tests; create or adapt a run-specific config in
  the isolated copy when the existing config targets unrelated work. Preserve the
  author's config.
  For Bun, a verified combination is StrykerJS 10, `@hughescr/stryker-bun-runner`
  1.6, Bun >=1.4, Node >=22 and TypeScript 6 for config parsing. Check installed
  package requirements when choosing other versions. Load the community runner
  explicitly and bound test files as well as mutation ranges:

  ```json
  {
    "appendPlugins": ["@hughescr/stryker-bun-runner"],
    "testRunner": "bun",
    "coverageAnalysis": "perTest",
    "testFiles": ["tests/parser.test.ts"],
    "mutate": ["src/parser.ts:10-25"]
  }
  ```

  Credit per-test coverage only after the selected nonempty baseline and coverage
  records agree. Keep runner errors and unattributed crashes separate from kills;
  an error is not evidence that an assertion caught the mutant.
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

  With Stryker 10, `--incremental --incrementalFile <scratch report.json>` preserves
  partial results on supported interruptions; retain logs too and verify the report
  was written. Reuse requires matching source, tests, helpers, snapshots, config,
  dependencies, tool/runner versions and runtime. The tool does not detect every
  change, especially static mutants or test changes under the command runner.
  If relevant inputs changed or provenance is missing, use `--incremental --force`
  with the current `--mutate` ranges, never an unrelated full sweep. Report fresh
  and reused outcomes separately; old out-of-scope entries are not current evidence.
  Resuming partial work does not restart the round's budget or authorize a second
  completed campaign over the same scope.

- For Rust, run `cargo mutants --in-place` from the crate or workspace inside the
  disposable copy, as a single job, with `--copy-target` and `--jobs` unset and
  `--output` outside the copy: the clone's build cache serves every mutant, where
  the tool's own temporary copy rebuilds cold or copies `target/` once per job.
  Select mutation packages with `--package`,
  quote source globs passed to `--file`, and use `--in-diff <patch>` for changed
  hunks where applicable, and `--re` on the function names behind a changed
  test instead of the whole file. Select relevant test packages
  with `--test-package` when needed. Constrain both build and test phases with
  `--cargo-arg` for Cargo target flags, for example
  `cargo mutants --in-place --file 'src/parser.rs' --cargo-arg=--test=parser --output <outside-copy>`.
  Trailing arguments after `--` apply only to the test phase; use a further `--`
  for test-binary filters when needed. Verify the effective build command selects
  the intended targets, not just the eventual test execution.
  Verify a passing, nonempty baseline using the same tests and feature flags.
  Inspect effective config so workspace defaults do not expand the test scope.
  Report caught / missed / timeout / unviable counts; review missed mutants as
  survivors and keep timeouts separate from caught. Do not infer coverage from
  cargo-mutants outcomes.
- **One run per scope, one campaign at a time.** A completed run is the
  round's evidence for its scope; the same scope does not run again in the
  round under another runner, coverage setting or test set to confirm or
  reconcile its counts. A survivor the reviewer wants to check by hand gets
  one hand-applied defect in the copy. Campaigns run one at a time on the
  host: a second Stryker or cargo-mutants process never starts while one is
  running. Before each launch, list running campaigns with
  `ps -axo pid,etime,command | grep -E '[s]tryker|[c]argo-mutants'`, run as its
  own command rather than chained before the launch; the brackets keep the
  listing from matching itself, and a shell or poller that only names the tools
  is not a campaign. A listing without PID 1 or other
  users' processes cannot see other sessions, so it does not show a free host;
  the Mutation run line says so. While another campaign runs, wait for it:
  waiting time is outside the lane budget, at most 15 minutes per round, and
  goes on the Mutation run line. Scope still uncovered when the wait reaches
  that limit or the round must hand back is `partial`, with its command under
  Strategy notes; when no required scope ran at all, record `blocked: host busy`
  instead, and the next round carries it.
  Timeouts from a run that shared the host with another campaign cannot
  establish detection: record their lines as `partial` with the single-campaign
  command under Strategy notes.
- Keep per-mutant timeouts distinct from assertion kills in the evidence, whatever
  the tool's score counts. Record a known hit-limit or loop reason as timeout
  detection; an unexplained deadline, resource kill or runner error is inconclusive.
  No competing campaign does not rule out ordinary host load or a bad deadline.
  Inspect existing logs within the remaining budget when useful; do not rerun a
  completed campaign or request a waiver to settle a timeout. At the deadline,
  record inconclusive lines as `partial` with their reason and command under
  Strategy notes. Timeouts alone do not block delivery. A baseline or whole
  invocation exceeding its limit is a setup problem, repaired only within budget.
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
  When those counts put the run under one minute, the counts are its estimate.
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
  notes. Do not open another copy or lane to continue. Record `partial` only
  when the budget ends, the estimate rule samples the scope, the wait limit or a
  handback stops the lane, or shared-host timeouts leave lines unproven; in every
  other case, while budget remains, run the next focused part of the scope.
- **Mutation evidence is bounded, never negotiated.** What the lane ran within
  its budget is the evidence: the counts, `partial`, and the judged survivors.
  A partial run or a timeout is not an Issue, does not hold delivery, and needs
  no waiver, ruling, extension or diagnosis from anyone; never return a question
  about mutation scope, survivors, timeouts or waivers to the caller. The one
  mutation-evidence Issue is a required run that never happened over in-scope
  content the tool parses, after setup and repair within the budget: record
  `blocked: <failure, attempted repair, remaining scope>` on the Mutation run
  line with the exact command. That verdict is `ISSUES_FOUND`; qualitative
  analysis cannot make the run PASS. The implementer repairs what it owns, such
  as a failing baseline or its own config; the campaign itself runs in the next
  test-quality review round (see Revision rounds), never as the implementer's
  sweep. Code this host cannot build, such as another platform's target, is
  `blocked` with that platform and the command for a host that builds it. No
  later round on this host can run it, so it waits for the user to supply such
  a host or waive the run; it is neither `waived` nor `not applicable`.
  `waived: <rule or user instruction>` records a run a repository rule or the
  user removed in advance, never a successful run and never a decision the
  reviewer, a caller or an epic owner makes.
  `not applicable` requires source evidence that the content has no executable
  behavior, or that it is an input the named tool does not parse; zero generated
  mutants alone does not establish either. For other languages, use the
  project's mutation tool when it has one; otherwise hand-applied defects on the
  changed lines are the evidence.
- Hand-applied defects, in any language, cover parsed runtime behavior the named tool leaves: a
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
