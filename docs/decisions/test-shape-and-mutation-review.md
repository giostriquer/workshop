# Decision: test shape up front, mutation evidence at review

**Date:** 2026-09-17

**Release:** workbench 0.39.0

## Change and reason

Five connected changes split test quality between the author and the reviewer.

1. **The test-quality review rides the adversarial review.** `file-pr`'s MUST
   gate, the `code-quality-review` spec, `using-workbench`, and
   `epic-orchestration` now require `test-quality-reviewer` (`mode: diff`, given
   the base branch, in its own test-scoped prompt) next to `code-quality-review`
   whenever the diff changes production logic or tests. The two dispatches can
   run in parallel. On a host without the agent type, the reviewer gets the agent
   file as its instructions. The epic lane report's `REVIEW` line records both
   verdicts and the mutation run. The flow no longer shows a separate
   test-quality step before "deemed ready"; the count of default-on completion
   gates stays two.
2. **The reviewer runs a mutation tool.** In `diff` mode, when production logic
   or tests changed, `test-quality-reviewer` runs the project's mutation command,
   or StrykerJS for JavaScript and TypeScript when the project has a Stryker
   config or an installed runner plugin, over the changed hunks and the
   production files behind changed tests. It never uses Stryker's `command`
   runner, keeps the sandbox outside the worktree, and treats an empty glob, 0
   mutants, a failed initial test run, or 15 minutes as `unavailable`. The output
   gets a required `Mutation run` line with the clear-text table's counts. The
   reviewer judges each survivor: consumer-visible behavior is an Issue, an
   equivalent mutant or unpinned wording is an Observation, and a suppression
   comment the diff adds without a checkable reason is an Issue. The score is not
   a threshold, and tooling is never installed. Diff mode reviews the change set
   against the base (committed, staged, unstaged, and untracked), because the
   review now fires after commits.
3. **Authors choose the test shape first.** `writing-good-tests.md` gains a
   Choose the Test Shape table: integration tests with real in-process
   collaborators for behavior that crosses modules, table-driven unit tests for
   pure logic, property-based and model-based tests (`fast-check` in TypeScript,
   its `FastCheck` re-export in Effect 3.10+ codebases) for invariants and
   operation sequences, and E2E only for release-blocking journeys in a slower
   pipeline stage.
4. **The reviewer's model is pinned.** `test-quality-reviewer` runs as a separate
   Opus agent on Claude Code or a `gpt-5.6-sol` agent on Codex, and on the host's
   default model elsewhere, recorded as an exception in `model-reference` beside
   the CI watcher.
5. **The rubric moves into a `test-quality-review` skill.** The full review
   (modes, workflows, lanes, mutation run, output format, refusal and scope
   rules) now lives in `skills/test-quality-review/SKILL.md`, and
   `agents/test-quality-reviewer.md` is a thin runner that loads it, matching the
   `code-quality-review` pair. The Codex manifest exposes skills but not agent
   files, so on Codex and other hosts without the agent type a reviewer context
   loads the skill instead of locating an agent file in the plugin payload. The
   gate references name the skill; a usage page covers it.

The operator's policy is that most tests are integration tests, test quality is
measured by mutation testing rather than line coverage, and the choice of test
shape happens before the code, while weaknesses are found by someone who did not
write the tests.

## Recorded problem

In the maintainer's saved Claude Code sessions, `code-quality-reviewer` was
dispatched in 85 sessions and `test-quality-reviewer` in 9; 76 sessions ran the
adversarial review with no test-quality review. The gate that sessions reliably
honor, `file-pr`'s MUST, named only `code-quality-review`.

## Focused checks

Fresh-context scenario runs on the session model, current wording against the
revised wording. Counts are regression evidence, not reliability estimates.

| Contract | Scenario | Current wording | Revised wording |
|---|---|---|---|
| `file-pr` gate | About to file; branch changes logic and tests; no review run yet | 0/2 dispatched `test-quality-reviewer` | 2/2 dispatched it with `code-quality-reviewer` |
| `using-workbench` map | Verified work, about to ask PR-or-merge | 2/2 dispatched both reviewers | 1/1 dispatched both |
| Reviewer | Small pricing diff: 6 survivors, 5 mutants hidden by an unexplained `Stryker disable` comment | 2/2 found every survivor by reasoning and flagged the comment | 1/1 ran StrykerJS, filled the `Mutation run` line, flagged the comment, classified the equivalent mutant; worktree left clean |
| Reviewer | Larger feed diff with thorough-looking tests: 8 behavior-changing survivors, 1 equivalent | 8/8 survivors in both runs, from reasoning | 8/8 survivors in both runs, each cited from the tool run; the equivalent mutant classified in both |
| Reviewer, stock StrykerJS 10 | Same feed diff split across a commit and a staged-only test file; project Stryker config; base `main` | not run | 1/1 found both parts of the change set, used the config's per-test runner on line ranges with the sandbox outside the worktree, reported the table's counts, raised the 8 behavior survivors as Issues and the equivalent and message-wording mutants as Observations; staged state untouched |
| Thin agent plus skill | Same stock-Stryker fixture, reviewer given only the agent file and the plugin folder on a host that does not auto-load skills | not run | 1/1 loaded `skills/test-quality-review/SKILL.md`, reproduced the same change set, mutation counts and classifications, and left the fixture untouched |
| Author | Serializer plus checkout with an in-memory store | 2/2 used real collaborators and a round-trip property test | 1/1 the same, plus an invariance property that alone caught a per-line rounding mutant |
| Author | Renewal job: existing test mocks the store, SQLite-backed store, external mailer, same-day deadline | 2/2 used the real SQLite store and faked only the mailer; no property test | 2/2 the same; 1/2 added a property test over generated subscription sets that alone caught a double-renewal mutant, 1/2 declined one with a stated reason |

### Why the trigger is repeated in `code-quality-review`

The orientation map explains the pairing, but it is often not in context when the gate
fires. Probes on the merge-and-push landing path, where `file-pr` never runs: with the
map loaded, both reviewers were dispatched from a `code-quality-review` that did not
mention the test review (2/2); with that skill alone, the test review was missed (1/1),
and it returned once the skill named the trigger: 1/1 with a long paragraph, and 2/2
with the three-line form that shipped. In the maintainer's 86 sessions
that dispatched `code-quality-reviewer`, the map's body appeared in 35; of the other 51,
29 had `file-pr` loaded and 22 had neither. So `code-quality-review` names the trigger
in three lines, and the reviewer's model routing stays in `model-reference` and
`test-quality-review`.

## Limits

- On this model the mutation run did not raise survivor recall on either reviewer
  fixture; it changed the evidence from reasoning to tool output and added
  equivalent-mutant classification at similar token cost. Its expected benefit
  is larger for reviewers on other models and for diffs too large to enumerate
  by hand; neither was measured, and neither was wall-clock or CPU cost on a
  real test suite.
- The earlier reviewer rows ran the rubric from the agent file before the move
  into the skill; the thin-agent row checks that the moved rubric behaves the
  same.
- The first three reviewer runs used the maintainer's `stryker` wrapper, which
  picks a per-test-coverage runner when a project has no config. Stock StrykerJS
  falls back to the `command` runner in that case. The revised instruction
  requires a config or an installed runner plugin and forbids the `command`
  runner; the stock-Stryker row checks it as written.
- On this model, authors already chose integration tests with real
  collaborators under the current wording, so the test-shape table did not
  change the test level. Its measured effect was on generated-input tests: 2 of
  3 revised runs added a property test that caught a mutant no example test
  caught, against 0 of 4 current runs. No regression toward over-built tests
  was observed.

## Deliberately excluded

- No third default-on gate: the test-quality review is part of the adversarial
  review moment that sessions already reach.
- No mutation-score threshold and no tool installation by the reviewer.
- `handoff-goal` phase reviews are unchanged.
