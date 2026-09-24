# test-audit: decisions in force

This is the rationale for the toolkit plugin's `test-audit` skill; superseded
choices are omitted, and git history keeps the originals.

## Port OpenClaw's test-audit into toolkit (2026-09-24)

`test-audit` is a port of OpenClaw's repo-local skill,
[openclaw/openclaw](https://github.com/openclaw/openclaw)
`.agents/skills/test-audit/` at commit `80930af` (2026-09-23), MIT, Copyright
(c) 2026 OpenClaw Foundation. It adds what no shipped piece covers: one value
bar for whether a test should exist at all, applied at write time (the
authoring gate), over existing tests (audit), and over one subsystem's whole
test surface (the pruning campaign in `CAMPAIGN.md`). Its junk patterns,
retention bar, candidate evidence, edit shape and handoff are the doctrine; the
upstream split between `SKILL.md` and `CAMPAIGN.md`, and the link between them,
is kept.

**Inclusion bar.** `AGENTS.md` asks for lived-in proof from a substantial
project before a piece is added. This one has none in this repository's own
projects: the user requested it directly, and that request is the basis for
adding it. The upstream skill's own campaign history is the only field record
behind it.

**Toolkit, not workbench.** Workbench already owns test quality at the
completion gate (`test-quality-review` and its reviewer agent), and every
installed skill's listing costs context. `test-audit` is optional and
self-contained, so it ships in toolkit and depends on no workbench skill; its
one mention of workbench is conditional (`file-pr` files the PR when workbench
is installed).

**The line with `test-quality-review`.** That skill is the default-on
adversarial review of a finished diff: a dispatched reviewer that did not
write the tests looks for weak assertions, missing cases and surviving mutants,
returns a verdict, and never edits. `test-audit` runs only on the user's ask,
judges whether tests earn their maintenance cost, and, after recording
evidence, removes, consolidates or moves them. The usage page's routing table
carries this line.

## User-invoked only, on Claude Code and Codex (2026-09-24)

Upstream's description, "Invoke whenever writing, changing, reviewing, or
sweeping tests", is an auto-trigger that would fire next to
`test-driven-development` and `test-quality-review` on every test edit. The
user asked for this skill to run only when invoked. `SKILL.md` sets
`disable-model-invocation: true`, and `agents/openai.yaml` sets
`policy.allow_implicit_invocation: false`, since Codex reads only the sidecar
(see [plugin-surfaces](plugin-surfaces.md)). The description is rewritten as a
"Use when" trigger naming the three requests, ending in "User-invoked only"
like the other user-invoked toolkit skills.

## Generic doctrine kept, OpenClaw specifics generalized (2026-09-24)

Kept word for word: the authoring gate's four questions and its regression
rule, the junk patterns, the value bar (including "Read root and scoped
`AGENTS.md` files first"), candidate evidence, edit shape, handoff, and every
campaign step with its completion criterion. Changed:

- **Validation** named Vitest, `node scripts/run-vitest.mjs`,
  `$openclaw-testing`, `$crabbox`, `scripts/check-changed.mjs` and
  `$autoreview`. It now names the repository's focused test command, the script
  or dry-run owning a removed source check's contract, targeted formatting,
  `git diff --check`, the repository's changed-files gate, and
  `git diff --numstat` split into production and tests. "Never edit source or
  tests while the test runner is running" stays. The post-edit `$autoreview`
  step folds into landing's "review and PR process".
- **Landing** named `$openclaw-pr-maintainer` and `scripts/pr`. It now uses the
  repository's review and PR or delivery process, only when authorized, one
  coherent PR at a time, refreshing from the default branch after each.
- **Discovery lanes** `src/`, `packages/` and `extensions/` became neutral
  lanes: core and packages, plugins or extensions, UI and apps and tooling, and
  a cross-cutting sweep.
- **Retention and junk lists** read "SDK or plugin API" for "plugin SDK" and
  "provider- or plugin-local replays" for "provider-local replays".
- **Campaign examples** from OpenClaw's Telegram campaign (`extensions/telegram`,
  its lanes, "nine real gaps") became `plugins/chat` placeholders stated as
  possibilities rather than invented results. Each keeps its lesson: baseline
  failures can be product bugs, lanes follow owner boundaries, judge a test by
  its assertions, look for the redundant layer, and expect the preservation
  review to find real gaps. `main` became the default branch, and the ledger's
  `it.each` rule now covers any parameterized test.

## Probes (2026-09-24)

These are bounded regression evidence, not a reliability estimate. Each run was
a fresh subagent context on `claude-opus-5-5` with the user's normal
configuration, working in its own copy of an invented `webapp` checkout module:
`calculateTotal` with discount codes, tax and tax-exempt items, a README that
states the public contract, and a three-commit history that includes an
ABC-123 fix. Its `tests/cart.test.ts` mixes a self-comparison, an exact source
grep, a spy whose fake implements the asserted discount, and a duplicated
empty-cart invocation with a documented public-API rounding test and the
ABC-123 regression. Skill runs were told the user had invoked `test-audit` and
read the ported files; control runs got the same request with no skill.

| Question | No skill | test-audit |
|---|---|---|
| "Prune the junk": self-comparison, source grep and duplicate removed; the mocked discount test repaired at `calculateTotal` rather than deleted; public-API and ABC-123 tests kept | 1 of 1 | 2 of 2 |
| ...no lasting edit before every test's evidence was recorded | 1 of 1 | 2 of 2 |
| ...the ABC-123 test run against the pre-fix commit | 0 of 1 | 2 of 2 |
| Authoring, a spy on a new exported `_computeTax`: no seam lands; the ordering is asserted as a total at `calculateTotal` | 1 of 1 | 2 of 2 |
| Authoring, an injected `deps` parameter with fakes: the seam is rejected and the test lands at the public boundary | 0 of 1 | 2 of 2 |

The audit scenario did not separate the conditions: the control reached the
same dispositions and also noticed that the source grep was the only guard of
discount-before-tax. The skill runs named the junk pattern and the retention
bar clause behind each call, and ran `git diff --check` and `--numstat`. The
spy scenario did not separate them either: every run built the requested
export, saw the spy record zero calls (an ESM module calls its own function
directly), reverted it, and asserted the total instead.

The `deps` scenario is the one where the gate changed the outcome. The control
added a test-only third parameter to the documented public function, exported
`computeTax`, landed the fake-driven test verbatim, and deleted the source-grep
test so the refactor would pass. Both skill runs cited gate question 4 and the
"mocks that implement the asserted behavior" pattern. Both showed in a
temporary probe that the requested test still passes when the returned total is
wrong. Both left `src/cart.ts` unchanged and asserted 4400 through
`calculateTotal`. One added a new test; the other rewrote the mocked discount
test into it, citing question 3's preference for extending a close test.

Two behaviors are recorded, not corrected. No run paused for approval between
evidence and edits: the request asked for pruning, and every run recorded its
evidence before its only lasting edit. Most runs, with or without the skill,
also applied temporary source mutations or seam trials in the checkout during
analysis and restored them byte for byte, reading "read-only discovery" as
allowing restored probes; one skill audit run kept analysis read-only and
mutated only while validating its edit. Counts come from each run's report and
its copy's final diff. Campaign mode was not exercised.
