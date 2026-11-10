# Test authorship and independent review

## Authors choose the test boundary; reviewers challenge its protection (2026-09-17)

Test quality was being lost between implementation and delivery: code review
ran regularly, but a separate review of test trustworthiness often did not.
Keep the author and reviewer responsibilities explicit.

Authors choose a test shape from the behavior: integration checks through a
public interface for collaborating modules, table-driven unit checks for pure
logic, property or model-based checks for invariants and sequences, and E2E
coverage for release-critical journeys. The TDD skill's supporting reference
owns the detailed advice.

A separate `test-quality-reviewer` loads the `test-quality-review` rubric,
reads tests with their production code, and checks whether the asserted
behavior would survive a realistic defect. Changed logic or tests require
scoped mutation evidence under the [mutation rules](mutation-scope-and-budget.md).
The score is not the pass/fail line; meaningful surviving mutants are findings.
The author's hand-applied regression probes remain distinct from review campaigns.

The delivery caller pairs code and test review against the same scope and
revision. Each discipline owns its findings, verdict, and follow-ups; see
[review stages](completion-review-stages.md). Current host dispatch comes from
the agent contract, not historical model names in this note.

## Test review follows the request (2026-09-21)

Use one workflow. The caller supplies a question or target and a base branch
when known (since 2026-11-09, five labelled lines for a change review); it does
not select a mode. A change review has a verdict and the
applicable mutation requirements. An audit of existing tests or a strategy
question returns findings or recommendations without inventing a delivery gate.
An explicit request to run mutation testing uses the same isolation and evidence
rules. Permanent test and tooling changes remain with the implementer.

The original tool-installation ban, command-runner prohibition, broad file
scope, and generic unavailable status were superseded by the focused mutation
rules. They are retained only in git history. Earlier fixture probes established
specific routing and evidence behaviors, not general reviewer recall or a
performance improvement.

## Compaction-safe entrypoint (2026-10-30)

Keep `test-quality-review` below the entrypoint size guard and move its substantial
branch-specific procedures into skill-local references with explicit read
conditions. Shared authority, preservation and completion gates remain inline.
The [repo tooling decision](repo-tooling.md#bounded-skill-entrypoints-2026-10-30)
records the observed truncation and validation boundary. No delivery or review
requirement is relaxed by this layout change.

## Dispatch lines and the verdict line (2026-11-09)

A change review's dispatch is five labelled lines and nothing else: `Worktree`,
`Base or range`, `Revision`, `Accepted scope` and `Scope folder`; any other
request is still the question and its target. The lines sit in the
`test-quality-reviewer` description, the only part of the agent a Claude Code
parent reads. The rubric had no missing-verdict rule: in a transcript audit of
2026-11-02 to 2026-11-09, 19 of 238 Claude Code test-quality reports and 21 of
26 Codex test-quality children's last messages had no `## Verdict:` line,
against 2 of 290 for code quality, which has the rule. The first line of every
round's change-review report is now the verdict line, a report without it
reads as `ISSUES_FOUND`, and a dispatch's own verdict words are mapped in the
body. The report gained a required `Disposable copy:` line; its rationale is
in [mutation scope and budget](mutation-scope-and-budget.md#restrictions-copies-busy-hosts-and-other-hosts-2026-11-09).
