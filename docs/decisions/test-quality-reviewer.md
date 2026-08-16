# Decision: add `test-quality-reviewer` and move the review loop to four stages

**Date:** 2026-05-16

## What changed

- Added `test-quality-reviewer` as the eighth canonical agent: a code-first reviewer of implemented test code for trustworthiness and test design. Canonical spec at `.claude/agents/test-quality-reviewer.md`, with Codex / Gemini / OpenCode thin wrappers and an origin doc at `docs/agents/test-quality-reviewer.md`.
- The implementation-review loop documented in `docs/examples/spec-driven-development.md` moved from three stages to four: spec compliance → code quality → pattern review → **test quality**.
- Realigned the test-related review ownership between the existing reviewers:
  - `pattern-reviewer` now explicitly defers test quality and test design to `test-quality-reviewer` (deferral-line touch-up).
  - `spec-reviewer`'s plan review keeps only the literal `Test existence (literal walk)` check and drops review of planned test correctness and test bodies. A new `Boundary with test-quality-reviewer` subsection records the split. The spec-mode `Testability` check is unchanged.

## Why

A test that compiles, runs green, and asserts almost nothing passes every other review gate. In the originating project, weak, trivially-passing, and misleading tests became a recurring source of rework: a failure distinct from general code-quality review, which is focused on production code and tends to wave green tests through. A dedicated test-trustworthiness stage closes that gap.

The realignment exists so no two stages double-own test judgment: plan review checks only that the plan *names* the tests the spec calls for; per TDD discipline the implementer writes each test body fresh; and implemented test-code quality is reviewed on real test code at the fourth stage. Adopting `test-quality-reviewer` without the realignment would leave `spec-reviewer` reviewing test bodies that do not exist yet.

## Deliberately excluded

The originating project pairs this agent with engine-specific coverage tooling (a coverage-package install, a batch-runner switch, and a complexity/coverage risk score). That tooling is domain-specific and was **not** propagated. The canonical spec keeps coverage and complexity metrics as a generic, **optional** prioritization input: a project with no coverage tooling adopts the agent and runs it fully qualitatively; a project that publishes a metrics artifact wires it in without the agent owning the tooling.

## Adoption note

Adopters that take `test-quality-reviewer` should also apply the handoff realignment to their `spec-reviewer` and `pattern-reviewer` so review ownership stays partitioned. See the Adaptation notes in `docs/agents/test-quality-reviewer.md`.

## Addendum 2026-05-16: mock-quality category added

A review against the cross-repo `test-quality-reviewer` skeleton found the propagated checklist was missing the skeleton's mock anti-patterns ("tests that only reassert mocked values," "over-mocking of same-domain services"). The source agent this was sanitized from had dropped them (its domain's test surface is mock-light) and the propagation inherited the omission. Since the scaffold serves mock-heavy adopters (backends, services), a **Mock-saturated / tautological-mock tests** category was added to the Test-quality checklist, restoring parity with the skeleton's coverage. The category is generic: mock only across real boundaries; do not mock the behavior under test.

## Addendum 2026-05-23: add risk and strategy lanes

The canonical agent was rewritten around explicit capability lanes instead of a single
flat checklist. The baseline test-trustworthiness gate remains, but the agent now also
documents metrics, property-testing, mutation-testing, and high-impact project lanes.

Key decisions:

- Keep one agent. Splitting CRAP, coverage, property testing, and mutation testing into
  separate default reviewers would add orchestration cost before projects prove they need
  it.
- Do not make every lane mandatory in every diff review. Metrics and advanced techniques
  are evidence inputs and strategy prompts unless an adopting project explicitly makes
  them gates.
- Set `CRAP <= 6` as the scaffold's default recommended ceiling when valid per-method CRAP
  data exists. Coverage remains project-defined because useful targets vary by product and
  test surface.
- Add `mode: strategy` so high-impact projects can ask for a test-quality profile:
  coverage target, CRAP target, property-test candidates, mutation-test candidates, and
  audit cadence.
- Treat acceptance mutation testing as a targeted strategy under the mutation lane:
  mutate a behavior an acceptance/integration test claims to protect and verify the test
  fails. It is not a universal per-diff requirement.

This keeps the agent portable while giving projects such as local infrastructure, terminal
tools, and operator dashboards a stronger scaffold for risk-aware test quality.
