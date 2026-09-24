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

## Mutation evidence is bounded, never negotiated (2026-09-23)

An epic lane's test review ran Stryker over its scope, judged every survivor,
and then held `ISSUES_FOUND` through both automatic follow-ups and an
owner-authorized third pass over two things the rubric had no answer for: nine
mutants scored `Timeout`, which it carried as "unknown" because the text said
to "diagnose and repair a timeout, then rerun", and two functions the lane's
budget had not reached, which the text made a mutation-evidence Issue. Its
report asked the epic owner for "a bounded diagnostic of those exact nine
mutants, or an explicit waiver naming them". The owner, a Codex session on
`epic-orchestration`, spent 28 of its 141 messages that day on mutation and
waiver rulings, about fifteen thousand tokens, and the lane's handback listed
mutation timeouts as its blocking debt. A per-mutant timeout is a detection:
Stryker scores `Timeout` as detected because "your CI build would detect it
because the tests will never complete", and cargo-mutants' guidance is to skip
functions that hang when mutated, not to investigate them.

The rubric now says what mutation evidence is and who decides nothing about it.
A per-mutant timeout counts with the killed and is never diagnosed, rerun or
carried as unknown; only an invocation exceeding its own limit is a setup
problem. What the lane ran within its budget is the evidence: a partial run
records `partial` with the uncovered scope's command under Strategy notes, and
neither a partial run nor a timeout is an Issue, holds delivery, triggers a
follow-up pass, or needs a waiver, ruling, extension or diagnosis from anyone;
the reviewer never returns a mutation question to the caller. The one
mutation-evidence Issue left is a required run that never happened over parsed
in-scope content after setup and repair within the budget (`blocked`), which
the implementer runs or repairs. `waived` records a run a repository rule or the
user removed in advance, never a decision the reviewer, a caller or an epic
owner makes, and `epic-orchestration` tells the owner to send any such request
back to the lane. A plan-only micro-test, three fresh reviewer contexts per arm
on the lane's own situation, is recorded below.

| Question (follow-up pass 2: three Issues fixed, nine `Timeout` mutants, two functions the budget never reached) | 0.41.3 wording | This wording |
|---|---|---|
| Verdict | `ISSUES_FOUND` 3 of 3, held by the uncovered scope as an Issue | `PASS` 3 of 3 |
| Timeouts counted as detected, not reran or carried as unknown | 3 of 3 | 3 of 3 |
| Uncovered scope recorded as a note with its command, not an Issue | 0 of 3 | 3 of 3 |
| A mutation decision sent to the owner | 0 of 3 (the hold itself triggers the extension machinery) | 0 of 3 |

The control reviewers read the timeout rule correctly where the recorded
Codex reviewer did not; the wording now leaves nothing to read. Their hold on
the uncovered scope is the mechanism that reached the owner in the recorded
run: a blocking Issue with no fix available to the lane consumes the follow-up
passes and lands on the owner's extension authority. Three reps per arm is
regression evidence for this dispatch shape, not a reliability estimate.

## One run per scope, one campaign at a time, an estimate first (2026-09-23)

A test review of a template-extraction change in a Bun monorepo (three
producers rewired to read templates, a 1,200-line package gate test that
gained parsers and grammar contexts) ran 33 minutes on the 0.41.4 rubric. Its
transcript and Stryker logs show where the time went:

| Phase | Minutes | What ran |
|---|---|---|
| Reading and a filesystem clone | 4 | dispatch, rubric, diff, gate file, lane evidence |
| Producers, framework runner with per-test coverage | 1.5 | 15 line ranges, 108 mutants, 60 killed / 48 survived / 0 timeouts |
| Gate helpers, same runner | 3 | 6 line ranges inside the test file, 262 mutants, 234 / 25 / 3 no-coverage |
| Both scopes rerun under the command runner, in parallel | 15 | gate: identical counts; producers: 27 killed / 68 timeout / 13 survived |
| Hand defects and preservation checks | 3 | |

Both first runs were line-scoped and complete by minute 12. The reviewer then
rebuilt both configs with `coverageAnalysis: "off"` to confirm the survivors
and ran the two campaigns at once; the rubric preferred the framework runner
and allowed the command runner, and said nothing about running both. The rerun
added no information for the gate and corrupted the producer evidence: under
twelve concurrent test processes, 68 of the same 108 mutants scored `Timeout`,
which 0.41.4 counts as detected, turning 48 survivors into 13. The gate test
file was in the mutation scope because the dispatch named "the new gate logic
(parsers, contexts, constraints)" as scope; the rubric said to mutate production
behavior "not the tests' assertions" and never said a test file is not a
target. Nothing asked for an estimate before a run, so the 30-minute budget was
the only bound, and an analysis of the run read it as a target.

The rubric now says a completed run is the round's evidence for its scope and
the same scope never runs again under another runner, coverage setting or test
set; the command runner is the fallback when no framework runner works, never a
second pass; campaigns run one at a time on the host, and timeouts from a run
that shared the host with another campaign are load, recorded as `partial`; a
survivor re-checked by hand is one hand-applied defect. A test file and its
helpers are never a mutation target, whatever a dispatch names, and get the
checklist plus at most five hand-applied defects. Every run has an estimate
before its mutants execute (mutants × baseline ÷ concurrency, from the counts
the tool prints first); over 10 minutes ends the run and narrows the scope; the
estimate goes on the Mutation run line; the 30- and 15-minute budgets are
ceilings, not targets.

Three of the seven proposals in the analysis that prompted this were not
adopted. Sampling the lane's own defect ledger instead of running would let the
lane pick the mutants and saves nothing once the rerun is gone (the reviewer's
own campaigns cost 4.5 minutes). Reusing a lane-provided checkout and a
per-test-command time limit were already covered by the clone rule and the
framework-runner preference, both of which the reviewer followed. Bounding
reading in the agent definitions waits for the next batch of transcripts.

A plan-only micro-test compared the 0.41.4 wording with this one: three fresh
reviewer contexts per arm, one Read of the rubric each, on a placeholder
dispatch shaped like the recorded run (a byte-exact template move, three
producers with fifteen changed hunks, a 1,200-line gate test whose new parser
and context helpers the dispatch names as mutation scope, a community Bun
framework runner with per-test coverage that prints warnings, a dispatch
saying the command runner "is acceptable", and a Stage 2 that hands the plan
the framework runner's completed counts with 22 minutes left).

| Question | 0.41.4 wording | This wording |
|---|---|---|
| The gate test file's helpers in a Stryker `--mutate` list | 1 of 3 | 0 of 3 |
| Two campaigns started at the same time | 1 of 3 | 0 of 3 |
| A command-runner pass over the completed producer scope started in Stage 2 | 0 of 3 (one plan keeps it as a conditional path whose counts "replace that run's numbers") | 0 of 3 |
| An estimate stated before mutants execute | 3 of 3 (an "ETA", with 10-, 12- and 15-minute thresholds) | 3 of 3 (10 minutes, on the Mutation run line) |
| The remaining budget called a ceiling, not a target | 1 of 3 | 3 of 3 |

The control plan that mutated the gate helpers is the one that ran its two
campaigns concurrently, and it read the old text the way the recorded reviewer
did: "mutate production behavior, not the tests' assertions" left the helpers
in. The Stage 2 facts (zero timeouts, eighteen tests per mutant) made a rerun
unattractive under both wordings, where the recorded reviewer reran after
inspecting three survivors' coverage lists; the recorded transcript is the
baseline for that question, and the new text removes the conditional path two
control plans kept. Every plan computed an estimate, so the wording fixes the
threshold and puts the estimate on the report line rather than introducing
the habit. Three reps per arm is regression evidence for this dispatch shape,
not a reliability estimate.
