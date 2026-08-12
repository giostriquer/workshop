# test-driven-development

RED-GREEN-REFACTOR with full anti-rationalization armor: failing test first,
watch it fail, minimal code to green, refactor. Derived near-verbatim from
[obra/superpowers](https://github.com/obra/superpowers) (MIT, Jesse Vincent);
adapted per [`workbench-system.md`](../decisions/workbench-system.md) — applicability
conditioned on a test harness existing (operator's Q2).

## Use it

- Trigger: implementing a feature or bugfix in a repo **with a test harness** —
  it's the method default there, not opt-in.
- **A default, not a mandate** (operator's Q13, 2026-08-12): implementation
  inherits the repo's patterns first — a stated repo/user convention that
  conflicts with a step (e.g. "no test runs before manual validation") wins.
  Announce the conflict in one line, apply what remains compatible (the test
  is still written first), defer the displaced step to the repo's gate.
- The load-bearing patterns: watch the test fail for the right reason before
  any production code · minimal code to pass, nothing more · code written
  before its test gets deleted, not adapted · bug fixes start with a failing
  reproduction test · read `writing-good-tests.md` when writing/changing tests
  (name the production change that would fail the test; assert real behavior,
  never mock behavior).
- Example: bugfix → `test('rejects empty email')` → fails right → two-line
  guard → green → next.

## Don't

- Don't apply it where the repo has no harness — skip silently; scaffolding a
  harness is the user's decision, not a TDD side effect.
- Don't treat "the harness is annoying" as "no harness."
- Don't keep pre-test code as "reference" — that's testing after.
- Don't negotiate exceptions with yourself; throwaway prototypes, generated
  code, and config changes are exceptions *the user grants* — and a stated
  repo rule is that grant in standing form, distinct from self-negotiation.
- Don't weaken the armor during upstream drift reviews — the strictness is
  content, not dispatcher pressure. (The precedence layer is not weakening:
  the armor targets self-negotiated skips, never the repo's own rules.)
