# Mutation review: scope, budgets, and evidence

## Changed behavior determines scope (2026-09-22)

A byte-preserving extraction triggered mutation of the moved bodies and repeated
campaigns over pre-existing gaps. Scope therefore follows changed content, not
added-file line counts: mutate changed production lines and the functions behind
added, changed, or removed test cases. Include protection lost when an assertion
is removed or weakened. Moved bodies are excluded; changed wiring remains in.
Test files and their helpers get checklist review and bounded hand-applied
defects, not mutation-tool targeting.

A consumer-visible survivor is a test-quality finding. Equivalent mutants and
unmatched wording changes are observations. Gaps predating both the production
and test diff remain strategy notes. Mutation score alone is never a verdict.

## The scope behind a changed test is its subject; a follow-up reruns the delta (2026-09-22)

Whole-file mutation behind one changed test produced unrelated findings and
repeated expensive baselines. Select the affected production functions and the
lines an altered assertion protected. Follow-ups update the existing review
copy and cover the correction delta plus the lines behind the findings being
closed. They do not repeat the initial scope.

## One run per scope, one campaign at a time, an estimate first (2026-09-23)

A completed run supplies the round's evidence for its scope. Rerunning it under
another runner or coverage mode added cost and changed classifications under
load, so campaigns run one at a time and completed scope is not repeated.
Estimate duration before mutants execute; an estimate over ten minutes narrows
the scope. The initial round has a thirty-minute total budget including setup,
a follow-up has fifteen, and any invocation stops at fifteen. These are ceilings.
Tests over sixty seconds stay outside the tool's test set; their uniquely
covered lines get one hand-applied defect. Hand defects run sequentially in the
same copy, at most five per changed file per round.

## Mutation evidence is bounded, never negotiated (2026-09-23)

Uncovered scope after a bounded run is `partial`, with the remaining command in
strategy notes. Partial coverage and timeouts do not hold delivery, require a
waiver, or authorize another campaign. A required run that never happened after
bounded setup remains `blocked`; a superseding repository rule or explicit user
instruction can make it `waived`. Concrete behavioral gaps still become Issues.
The reviewer owns this disposition instead of asking an epic owner to diagnose
mutation output. Timeout interpretation follows the later evidence correction
below; the earlier blanket timeout-as-detection rule is superseded.

## Focused runners and isolated setup (2026-09-21)

Prefer a qualified framework runner for per-test coverage. A command runner is
a fallback when it selects bounded relevant files, propagates failures, and
runs a nonempty baseline. It reports `NoCoverage: unavailable`; zero in that
column does not establish coverage. Missing tools and broken configuration are
repaired in the disposable review copy or an authorized tool prefix, never in
the author's manifests or lockfiles. Unresolved execution stays a named gap.

Unsupported formats get `not applicable` with a reason and mutation thinking,
not a custom instrumenter. Zero mutants alone is insufficient: inspect actual
syntax and configuration. Parsed runtime behavior that a tool cannot mutate
uses the existing bounded hand-defect fallback without rewriting production
syntax. The [canonical rubric](../../plugins/workbench/skills/test-quality-review/SKILL.md)
owns recipes and status definitions.

## cargo-mutants runs in place inside the copy (2026-09-22)

Run `cargo mutants --in-place` as a single job inside the isolated review copy.
An extra tool-managed source copy discards useful build-cache identity. Remove a
linked worktree's `.git` pointer from the disposable copy so its Git commands
cannot reach the author's index. The copy persists across review rounds; it is
not the author's checkout. Artifact and preservation responsibilities are in
[the mutation boundary decision](mutation-artifact-boundary.md).

## Evidence and isolation corrections (2026-10-14)

A transcript sample exposed Rust builds broader than the selected tests and
runtime writes outside disposable source copies. A focused CLI probe confirmed
that trailing `--test` selects only the test phase. Use `--cargo-arg` for targets
both build and test need. Before the baseline, redirect supported data/config
roots or services, verify destinations, and check containment during execution.
A clean source tree alone cannot establish preservation. Unresolved external
writes from the review prevent a preservation PASS.

Keep timeout counts separate from assertion kills. Known loop or hit-limit
evidence can establish timeout detection; unexplained deadlines remain
inconclusive even without another campaign. Inspection stays within the current
budget, and uncertainty becomes `partial`, not an extension or waiver request.

An unchanged production line can lose protection when its test changes; establish
that loss from the old assertion or before/after mutant evidence. Constant
exports are classified by syntax: a focused Stryker 10 probe generated mutants
for an ordinary exported object and none for its `as const` form. Neither the
filename nor zero generated mutants proves inapplicability.

Qualify framework runners and their per-test coverage. The Bun runner 1.6 upgrade
changed coverage and result classification, so old outcomes cannot certify the
new runner. Stryker 10 partial incremental reports can preserve completed work,
but reuse requires unchanged source, tests, helpers, snapshots, configuration,
dependencies, runner and runtime. Otherwise force the affected scope. Report
fresh and reused results separately; restarting does not renew the budget.

References: [Cargo argument forwarding](https://mutants.rs/cargo-args.html),
[Bun runner upgrade notes](https://github.com/hughescr/stryker-bun-runner/blob/1.6.0/README.md#upgrading-from-14),
and [Stryker incremental limits](https://stryker-mutator.io/docs/stryker-js/incremental/).
Historical scenario matrices remain in git; they are bounded regression
evidence, not cross-model reliability estimates.

## Blocked runs, shared hosts and copies (2026-10-21)

A 30-day transcript audit found the October 14 recipe corrections holding: no
trailing Rust target flags, no parallel jobs, and no invocation over fifteen
minutes. It also found three gaps. The rubric sent a `blocked` campaign to the
implementer ("the implementer runs or repairs it"), which contradicts
`test-driven-development`: sweeps belong to the review. Several implementers ran
campaigns after such a hand-back. Reviewers sharing a scratch folder cloned into
or deleted inside a sibling's copy, and the one-campaign rule had no procedure,
so some reviewers checked the host and waited while others launched blind or
killed processes host-wide. Code the host cannot build was recorded as `waived`
in one review and `blocked` in another.

The implementer now repairs only what it owns. Scope a round left `blocked`
joins the next round's mutation scope even when no file changed, so a review
round, not the implementer, runs the campaign. Another platform's code is
`blocked` with that platform and the command for a host that builds it, since
another round on the same host cannot run it (since 2026-11-09 a session
already authorised to use a capable host returns its results; see the last
section). The review's copy is cloned to an absent path inside
a fresh `mktemp -d` directory and reused by follow-up rounds while it exists;
processes stop by the run's own paths. Before each launch the reviewer lists running campaigns
with a self-excluding pattern and waits for another campaign, outside the budget
and for at most fifteen minutes per round (since 2026-11-06 the slot helper
below does this, and the listing is the fallback without Node). A listing that cannot see other
sessions is not evidence of a free host. Scope the wait leaves uncovered is
`partial`; a round in which no required scope ran at all is `blocked: host
busy`, carried to a later round. `partial` records the budget ending, estimate sampling, the wait
limit or a handback, or shared-host timeouts; otherwise remaining budget runs the
next focused part. Counts that put a run
under a minute serve as its estimate. A helper that applies one defect meets the
inspection rule when it proves the diff is exactly the intended production
change.

The fifteen-minute wait and the budget exclusion are defaults chosen with the
correction; they did not come from a measured trade-off.

## Queued campaigns, two reviewers per session, real dependency directories (2026-11-06)

A transcript scan of the previous 30 days found about 150 sessions with
mutation records, nearly all reporting no campaign wait. The exceptions cluster
on days when one session fans out several test-quality reviewers at once. On
2026-11-06 one session ran eleven, four to six at a time, each launching
cargo-mutants campaigns back to back, and four reviews on the host ended
`blocked: host busy`, including both rounds of a reviewer from another session.
That reviewer's wait log shows the mechanism: when a campaign ended, waiting
reviewers saw the free host in the same polling interval and launched together,
and the reviewer that backed off from the collision lost the slot every time
until its fifteen-minute wait ran out. Listing and then launching is not
atomic, and nothing ordered the waiters.

Campaigns now launch through `scripts/mutation-slot.mjs` in the
`test-quality-review` skill. It writes a ticket into a per-user queue directory,
waits until its ticket is the oldest live one, the lock directory is free and
no Stryker or cargo-mutants process runs (which covers reviewers still on the
listing procedure), then takes the lock with an atomic `mkdir`, runs the
campaign as its child and releases the lock when it exits. Tickets and locks
whose process has died or that stopped refreshing for two minutes are cleared,
so a crashed helper cannot hold the queue; a campaign it leaves running stays
in the process listing until the reviewer's cleanup stops it. Exit 75 reports
the wait limit. Where the queue directory cannot be written, the helper still
waits on the process listing and reports `ps-only`; where `ps` itself is
refused, as in Codex's macOS sandbox modes, it relies on the queue and reports
`listingError`, and every summary says whether the listing could see other
sessions. Every campaign re-queues, so concurrent reviewers alternate instead
of one reviewer running its whole series first.

The campaign stays in the caller's process group, and the helper passes each
signal it receives to the campaign. A host that kills the group on a timeout
therefore ends the campaign too; a detached campaign survived that kill in the
completion review's probe. Stryker 10.1.1 and cargo-mutants 27.1.0 both stop
their own workers on SIGINT, SIGTERM and SIGHUP (Stryker's exit handlers,
cargo-mutants' `ctrlc` termination handler and `killpg` of its children), so
the helper signals only its direct child. A host that signals the whole group
delivers the signal twice, and Stryker treats a second signal as a forced exit
that can leave workers or its sandbox behind; the rubric's cleanup step, which
stops processes by the review's paths, handles them.

The queue makes the slot fair but does not add capacity, so a session also
keeps at most two test-quality reviewers running at once, with other review
stages unlimited. Two lets one reviewer read and judge while the other's
campaign runs. Like the fifteen-minute wait, the number is a default chosen
with the correction, not a measured trade-off.

The same scan found six reviews in the period that repaired one Stryker setup
failure, all following the rubric's advice to link the author's dependency
directory into the disposable copy. Stryker 10.1.1's `findNodeModulesList`
keeps only `readdir` entries that are directories, so a symlinked
`node_modules` is never linked into the sandbox and dependencies fail to load;
its sandbox copy treats any other symlink to a directory as a file, and
`copyFile` fails with `ENOTSUP`. A probe against that function confirmed both:
the symlinked layout returned no `node_modules` and the sandbox raised
`MODULE_NOT_FOUND`, while a real directory of links to the author's entries was
found and resolved scoped packages. The rubric now gives that layout before
the first dry run.

## Restrictions, copies, busy hosts and other hosts (2026-11-09)

A transcript audit of 2026-11-02 to 2026-11-09 read 97 Claude Code
test-quality reviewer threads. No reviewer reported a lane over budget in 104
reported lane times, so the budgets stand. Six gaps remained.

**Dispatch restrictions.** The rubric said a caller cannot waive the run but
not what a reviewer records when a dispatch forbids, narrows or stretches the
lane. 26 of 97 threads carried such limits, with three outcomes: an Issue for
missing evidence, a silent PASS, and a wait stretched to ninety minutes. A
restriction that cites a user instruction or repository rule is `waived` with
that citation. One that cites neither leaves the scope unrun and is recorded
as `blocked: dispatch restriction` with the dispatch's words, the same Issue
as any required run that never happened, so the limit is visible to whoever
set it. Wait limits and budgets come from the reference; a number in a
dispatch does not replace them.

**The disposable copy's removal had no owner.** "After the final round's
verdict" named a moment the reviewer cannot see, and the dispatcher was never
told a copy existed. Leftover copies of 1.7 to 5.2 GB sat in four project
scratch folders, 29 more in session scratch directories and seven stale review
worktrees in one repository; some reviewers instead removed the copy every
round and rebuilt it. Cleanup through a variable path was refused by a host's
safety check eleven times. A reviewer that returns PASS now removes its copy,
by its absolute path typed out. On any other verdict the path goes in a
required `Disposable copy:` report line, and `receiving-code-review` tells the
dispatching session to remove it when the review ends without another round.
A follow-up after a pass makes a new copy.

**A busy host produced an Issue.** A reviewer that waited out its limit with
nothing run recorded `blocked: host busy`, which is `ISSUES_FOUND`: four
reviews ended that way on the day that prompted the queue. A first correction
made that outcome a passing `partial`, and the independent review of it showed
a change could then reach delivery with nothing run, so the outcome stays
`blocked: host busy` and `ISSUES_FOUND`. What changed is what the dispatching
session does with it: no code change is asked, one follow-up carries the
uncovered scope, and a second busy result goes to the user. The two-per-session cap
stays as the only count a dispatcher can observe: the slot is per host, so
other sessions' reviewers lengthen a wait rather than count toward the two.
The helper's wait limit is unchanged; ten threads on the queued helper waited
0.1 to 53 seconds, so there is no contention evidence for a longer one.

**Listings took the slot.** "Every invocation, dry runs included" sent
`cargo mutants --list` through the queue; one thread queued three listings of
about five seconds each. The helper now treats `--list`, `--list-files`,
`--version` and `--help` as listings: it runs one it is handed at once, with
queue mode `bypass`, and does not count a running listing as a campaign. A
Stryker dry run still builds and runs tests, so it keeps the slot. Covered by
two tests in `scripts/mutation-slot.test.mjs`.

**Waits hung on log lines.** "A background job polled by an `until` loop" named
no exit condition. One loop waited five hours for a score line its tool
version never prints; another lived forty-nine hours. A wait now ends on the
command's own exit (the host's completion notice, `wait`, or a `kill -0` loop
that also stops at the invocation's limit), never on a line in a log.

**Another platform's code had no route.** Six threads touched code the host
could not build. One ended `ISSUES_FOUND` on that alone with no change able to
close it. In another the dispatcher ran the campaign on the repository's CI
runner for that platform; the reviewer had no word for the state and invented
one, and the forwarded run had 50 missed mutants and produced a real finding.
The route is now named: a session already authorised to use a capable host
runs the report's command there and returns the host, run id and output in a
follow-up, which the reviewer judges like any run. Without such a host the
line stays `blocked` for the user, as before.

The slot helper change is under test. One scenario probe gave a reviewer a
dispatch that forbade the mutation run, capped waits at two minutes and asked
for its own severity words: the report opened with `## Verdict: ISSUES_FOUND`,
recorded `blocked: dispatch restriction` with the dispatch's words, did not
apply the wait number and mapped the severity words in the body. Each scenario ran once, in a fresh context on Opus 5.5, before the last round of review corrections: regression evidence for that scenario, not a reliability estimate.

## A busy host cannot stand in for mutation evidence (2026-11-09)

Recording a busy host with nothing run as a passing `partial` left paths where
a change reached delivery with no mutation evidence: the passed reviewer was
told to answer a follow-up in one line, and a session that never loaded
`receiving-code-review` saw only a `PASS` at `file-pr`'s gate. The outcome is
`blocked: host busy` and `ISSUES_FOUND` again, so every gate that reads the
verdict stops. A follow-up that carries an `Uncovered mutation scope:` line is
the reviewer's ground, any Mutation run value other than a second `blocked:
host busy` settles it, and a second one goes to the user. The slot helper also treated `-V` as a listing flag for both tools;
cargo-mutants reads it as `--unviable`, so such a campaign skipped the queue.
Listing flags are now keyed by tool, with a test. The `Disposable copy` line
says whether the copy is a clone or a worktree, because removing a worktree
with `rm -rf` leaves the stale registration this rule set out to stop.

## Rust built by Bazel with no Cargo manifest (2026-11-11)

A Rust workspace built and tested only through Bazel (`rules_rust`), with no
`Cargo.toml` anywhere, gave reviewers no mutation tool: cargo-mutants needs a
Cargo manifest to find the source and runs `cargo build` and `cargo test` for
each mutant. Reviewers there fell back to a few hand-made mutants.

The skill now bundles `scripts/rust-mutants-runner.mjs`, which splits the job.
cargo-mutants only generates: the runner copies the crate's `.rs` files to a
scratch folder under a stand-in `Cargo.toml` and runs `cargo mutants --list
--json --diff`, optionally `--in-diff` for changed lines, which builds nothing.
Bazel tests: the runner writes each mutant into the file in the review's copy,
runs `bazel test` on the named target, records the verdict and restores the
file, checking its digest. It applies each mutant's diff itself, refusing a
hunk that does not match at its stated line, so no fuzz, offset or reject file
can enter; on a signal it restores the file before stopping Bazel. Bazel exits
0 when tests pass, 1 when the build fails and 3 when a test fails or times out,
so the runner reads Bazel's summary line to tell `TIMEOUT` from `CAUGHT`, and
sets `--test_timeout` at five times the slowest baseline test, at least 20
seconds, as cargo-mutants does. Without it, a mutant that loops would hold the
target's own timeout, five minutes for a medium test. The slot helper treats
the runner as a campaign, and its `--list` and `--help` as listings.

The route is conditional and narrow: only a crate with no `Cargo.toml` up to
the repository root, in a repository with Bazel files, takes the runner. Every
crate with a Cargo manifest keeps the cargo-mutants recipe unchanged, including
one Bazel also builds. Each mutant is a Bazel rebuild of the crate and its
dependents in the test's graph, and Bazel runs one command per checkout at a
time, so the runner works in series under a cap (at most 10, spread evenly over
the list) and a wall-clock budget it enforces itself: it starts no mutant the
slowest so far would carry past the budget, stops one still running at the end
and records the rest `NOT RUN`. A new copy's first Bazel build is cold, since
Bazel keys its build tree by the checkout path, and that tree and Bazel's
server live outside the copy, so the reviewer shuts the server down when the
lane ends and expunges the tree before the copy goes. The prototype refused a
file with uncommitted changes; that refusal is gone, because the review's copy
usually carries the change uncommitted and the saved-copy restore with its
digest check is exact either way. `--in-diff` covers a copy whose `.git` file
was removed, where `--base` cannot run git.

`scripts/rust-mutants-runner.test.mjs` covers the diff application, the
verdict and timeout rules, the cap's spread, the budget guard on a fake clock,
the options and `--help`, and, with a stub in place of Bazel and the real
cargo-mutants, the exact change under test, the restore, `--base` with
committed and uncommitted changes, `--in-diff` from another checkout,
`--crate-root`, an untracked file, a failing or slow baseline, the budget, a
signal mid-mutant and a file that cannot be restored. Those cases skip when
cargo-mutants is missing. A throwaway bzlmod workspace (`rules_rust` 0.75.0,
Bazel 9.3.2, one `rust_library` with a `rust_test`, no Cargo manifest) gave the
real-Bazel evidence, every run through the slot helper. 22 mutants gave 15
`CAUGHT`, 6 `MISSED` (four in a function left untested on purpose, two
equivalent boundary mutants) and 1 `TIMEOUT` (a loop that never advanced),
with the file and its uncommitted change byte-identical afterwards. `--base`
kept 3 of the 22 for one committed and one uncommitted change. A SIGTERM to
the helper mid-mutant stopped Bazel (exit 8), restored the file and exited
143. In a cloned copy with its `.git` removed, `--in-diff` from the original
kept the same 3; the copy's first baseline took 86 seconds against 6 to 8
warm, and `bazelisk clean --expunge` removed its build tree and server. A
hand-applied defect check over the runner found 11 of 12 defects. The miss was
the budget guard keeping each mutant's time rounded to whole seconds, which the
budget test, timed on the real clock, could not tell apart; rounding up, and
refusing a mutant that would end exactly at the budget, passed it too. The
guard now counts whole milliseconds on a clock the tests replace, and its tests
fail for that rounding, for rounding up or down, for the boundary moved by one
millisecond either way, for seconds mixed with milliseconds and for a budget
not rounded to whole milliseconds. The real-clock budget test now makes the
first mutant the slowest, so its stop no longer depends on equal mutant times
under load. A second check planted 28 defects over the guard, `--help`,
`--crate-root`, the verdicts, the test timeout, the spread, the diff
application and the exit codes, and the tests caught all 28 once out-of-order
hunks had a test of their own.

The route wording had four scenario checks, each a fresh reviewer context on
Opus 5.5 given only the skill and a repository layout. A Bazel crate with no
manifest went to the runner, with `--in-diff` because its copy had no `.git`,
and `bazelisk shutdown` at the end. A crate with a `Cargo.toml` that Bazel
also builds, and a plain Cargo crate, stayed on `cargo mutants --in-place`. A
crate with neither a manifest nor Bazel files did not take the runner and
recorded `blocked`, as before. One run each: regression evidence for those
layouts, not a reliability estimate.

## mutest-rs first for Rust (2026-11-13)

cargo-mutants rebuilds the crate for every mutant, which is what the lane's
budget mostly pays for on Rust. mutest-rs compiles every mutation into one
test binary and switches between them at run time, so a scope costs one build
plus its tests, and no source file is edited. The operator asked for it as the
first Rust tool, the way Stryker is for TypeScript, with cargo-mutants and the
Bazel runner behind it and only one of the three running a scope.

The route is a table read from the crate: a `Cargo.toml` up to the repository
root means mutest-rs; cargo-mutants runs only when mutest-rs cannot; a crate
with no manifest that Bazel builds keeps the bundled runner, since both Cargo
tools need a manifest. "Cannot" is three observable cases: the install failed
or was refused, the crate does not build or pass its baseline under mutest-rs's
pinned nightly while `cargo test` passes under the project's toolchain, or a
test longer than 60 seconds reaches the scope, because the harness takes no
test-name filter. A completed run never passes its scope on: undetected
mutations, timeouts and lines with no mutation are that run's evidence, which
keeps the existing one-run-per-scope rule.

mutest-rs has no published release and no version tag. The reference pins
commit `16593ebb264a2224ed8b582be0155ac1845dcb09` and its build commands with
the self-contained `embed-runtime` driver, and accepts a `cargo mutest` already
on PATH. On the trial host that build was refused to an agent by the host's
permission policy and ran only when the operator typed it, so a host without a
preinstalled copy will often take the cargo-mutants row; the usage page says so.

What a trial on `nightly-2026-07-18` (cargo-mutest 0.0.0 at that commit, macOS
arm64) established, each written into the reference:

- Options go after `run`; the book's `cargo mutest -p <package> run` is rejected.
- `--filter-mutations file:<path>:<start>..<end>` scopes to lines, with the
  path relative to the workspace root even from the crate's directory. A path
  relative to the crate gives zero mutations and no error.
- The exit status is 0 after a compile error, after a failing baseline and
  with undetected mutations. A run is complete only when the summary line
  printed and `evaluation.json` exists.
- It mutates only code a selected test reaches within three calls (`--depth`),
  skips a function that contains an `unsafe` block under the default `--safe`,
  and has no operator for a bare literal. Those lines take hand-applied
  defects, or untested code would read as clean.
- An integration-test target mutates the library it calls. A project's own
  `rust-toolchain.toml` is overridden by the pinned nightly.
- Listing with `--print mutations --no-build` type-checks the crate, so the
  slot helper counts it as a campaign; only `--version` and `--help` bypass.
- A mutation that loops is reported as timed out inside the detected count.

On a 30-line sample crate mutest-rs made 24 mutations from the library's
tests and ran them in 11 seconds including the build; cargo-mutants lists 27
for the same file. Installing took about two and a half minutes on a loaded
host with the nightly already present.

The slot helper recognises `cargo mutest` and `cargo-mutest` through two new
tests written first; its 40 tests pass. One end-to-end run on Opus (the host's `opus` alias) followed
the edited reference over a one-commit change in a throwaway Cargo workspace:
it chose mutest-rs by the first row, listed and ran through the slot helper
with a workspace-relative filter, read 7 detected and 8 undetected of 15, and
covered three literal lines with hand-applied defects. Its two mutest-rs
frictions are fixed in the text: Cargo's `error: test failed` after a run with
survivors, and literals among the lines that get no mutation. Four route
probes on Fable 5.2, one run each in a fresh context, chose as intended: a
refused install went to cargo-mutants with the reason recorded; a completed
run with survivors and unmutated `unsafe` lines declined a cargo-mutants
cross-check and used hand-applied defects; a Bazel crate with no manifest took
the bundled runner; an exit 0 over a compile error under the nightly was read
as no run and sent to cargo-mutants. This is regression evidence for those
scenarios, not a reliability estimate. Not tried: Linux, a large workspace, a
crate with procedural macros or build scripts, and the batching options, which
the reference leaves unset.
