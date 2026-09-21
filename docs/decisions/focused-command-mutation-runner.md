# Focused mutation runs and tooling repair

Date: 2026-09-21
Status: accepted

## Problem

The test-quality-review skill prohibited Stryker's command runner on the premise
that it reruns the whole suite. A repository using Bun already configured that
runner with one explicit test file. The current-wording probe still refused a
focused run and reported mutation unavailable.

Stryker runs the configured command for each mutant. Its actual limitation is
lack of coverage analysis and per-test selection, not mandatory repository-wide
execution. See the official [command configuration](https://stryker-mutator.io/docs/stryker-js/configuration/#commandrunner-object)
and [coverage analysis](https://stryker-mutator.io/docs/stryker-js/configuration/#coverageanalysis-string).

The installation ban also allowed missing or broken tooling to end the mutation
check with a qualitative PASS. The requested behavior is to repair the setup and
run mutation testing, with explicit language defaults and an unresolved evidence
gap if execution remains blocked.

## Decision

Use StrykerJS for JavaScript and TypeScript, including JSX and TSX, and
`cargo-mutants` for Rust. In mixed changes, cover each language. Reuse applicable
project commands; an explicit user or repository override retains precedence.
Install missing tools and compatible runner dependencies, or repair configuration,
inside the disposable review copy or a dedicated tool prefix. Keep the author's
checkout intact; return any needed durable tooling changes to the implementer.

Prefer compatible framework runners. Permit the command runner when
its explicit command selects relevant bounded test files, propagates failures,
and runs a nonempty baseline against the isolated source. Scope both mutation
targets and tests; adapt an unrelated config only in the disposable copy.
For Rust, select source files, mutation packages and relevant test targets;
`cargo-mutants` uses a temporary copy by default. Its installation and Cargo
argument forms follow the official [installation](https://mutants.rs/installation.html),
[workspace](https://mutants.rs/workspaces.html) and
[Cargo argument](https://mutants.rs/cargo-args.html) documentation.

Missing tools, empty selections, baseline failures and timeouts require diagnosis
and repair. Keep each mutation invocation within 15 minutes; split slow scope
without dropping required coverage. An unresolved required run returns
ISSUES_FOUND with attempted repairs and remaining scope. Qualitative analysis
continues but cannot substitute for execution. Explicit waivers and verified
absence of executable behavior are reported separately from a completed run.
Requests to inspect existing tests or recommend a testing approach remain
advisory; this requirement applies to change reviews, including standalone work.
Automatic review remains at the delivery boundary. Explicit requests to execute
mutation testing also run it.

Report the runner and test scope, with NoCoverage unavailable for the command
runner. Its surviving mutants may represent either unexecuted code or inadequate
assertions; a zero NoCoverage count is not evidence that all mutants were covered.

## Evidence

An isolated fixture using installed StrykerJS 9.6.1 and Bun ran one named test
file while excluding an unrelated deliberately failing test. It generated nine
mutants: five killed and four survived. All four survivors were in an uncalled
function; the table reported zero NoCoverage. Original source and test files were
preserved, and Stryker removed its mutation sandbox. This proves the runner's
focused execution and reporting limit, not coverage of any adopting project's
changed code.

The same focused fixture also ran through the user-level StrykerJS 10.0.0 command
with the same nine outcomes. A Rust fixture began without `cargo-mutants`,
installed version 27.1.0 into a temporary tool prefix, and ran one named
integration test target against six mutants: three caught and three missed. All
missed mutants were in an uncalled function. A separate deliberately failing test
target stayed excluded. Fixture source and tests were preserved. This validates
the missing-tool setup path and focused Rust command, not an adopting project's
test coverage.
