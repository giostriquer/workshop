# Decision: `handoff-goal` v2: the self-carrying split contract

**Date:** 2026-07-12

## Status

Implemented.

## Context

The operator brought in **ultragoal**, a Codex-native goal skill grown in real
use alongside Codex goal mode (`create_goal` / `update_goal`). Set against
`handoff-goal`, the two overlap heavily on anti-cheating and durable state but
split on lifecycle: `handoff-goal` hands a goal *off* to a new session and never
pursues; ultragoal designs, activates, and *operates* a goal in the same
runtime. Each carries rigor the other lacks.

`handoff-goal` has the goal defense: verifiable acceptance checks with
refutation forms, integrity rules, never-invent-rules, the evidence ledger, the
compaction drift check. Ultragoal has the design rigor: a **goal-fit check**
(is autonomous-goal mode even right for this?), a recorded **baseline**, a
**primary verifier on the real interaction surface** with a capability
inventory before activation, **approval gates** for irreversible actions, a
**red-team-before-activate** pass, a **goal/plan file split** (stable finish
line vs living route), and bounded **delegation lanes**.

Two findings shaped the architecture:

1. **The toolkit plugin already ships to Codex** (`.codex-plugin/plugin.json`
   exposes the same `skills/` set), so one canonical skill serves both
   runtimes; no host-side copy is needed.
2. **Activation doesn't need a second skill.** `handoff-goal`'s emitted
   document already speaks to the pursuer ("this file is your working
   contract"). Extend that voice to carry the full pursuit discipline,
   plus a one-paragraph activation note for runtimes with durable goal support:
   covers ultragoal's activate/operate half without a new piece, honoring
   the repo's lived-in-use inclusion bar.

Decision: **enhance `handoff-goal`; add no new skill.** The emitted contract
becomes the shared format both runtimes pursue; the operator's Codex-side
ultragoal slims into a personal consumer of it.

## The shape

### The contract becomes a split directory

Output changes from `tmp/<YYYY-MM-DD>-<goal-slug>.md` to:

```
tmp/<YYYY-MM-DD>-<goal-slug>/
├─ goal.md: the contract. The pursuer MUST NOT edit it.
└─ plan.md: the living route. The pursuer maintains it.
```

This converts "don't move the goalposts" from a purely normative rule into a
**mechanical tripwire**: routine work never has a reason to write `goal.md`,
so the urge to touch it *is* the redefinition tripwire firing: escalate, not
edit.

**`goal.md`** (frozen at handoff): pursuer preamble (re-read after every
compaction and before marking anything done) · Goal · **Baseline** (the exact
failing command / starting metric, so "improved" is measurable) · Acceptance
checks with verify + refutation, the **primary verifier** flagged and named on
the real surface where the outcome matters · Integrity rules (now including
"you may not edit this file") · **Approval gates** (irreversible, public,
shared, or costly actions go back to the operator even mid-goal) · Context ·
Invariants · Non-goals · Operating rules · When to stop · **Activation note**
("on a runtime with durable goal support (for example, Codex `create_goal`), activate
with this compact objective: *Complete and verify the objective in
`<dir>/goal.md` by executing and maintaining `<dir>/plan.md`*; elsewhere,
adopt this contract directly").

**`plan.md`** (living): pursuit-discipline preamble: plan-update events
(operator steering, material new evidence, failed verification, completed
phase → re-read both files and update the plan before continuing), at most one
phase in progress, verification checked off only after the declared check
passes · Current state · Phases (status / implementation / verification / exit
criteria) · optional **Delegation lanes** (bounded lanes, each with its own
objective, verifier, and stop condition; the pursuer keeps integration and
completion) · Progress ledger (append-only, unchanged) · Next action.

Baseline (frozen, in `goal.md`) and Current state (living, in `plan.md`) split
what today is one section: the fixed reference point vs the evolving position.

### The skill gains five workflow steps

- **Fit check** (first) asks whether the goal fits autonomous pursuit through progress by
  repeatable attempts, a verifier that can fail, no repeated taste or
  preference decisions mid-loop? If not, say so and recommend a plain task or
  a `handoff-review continue` brief; proceed only if the operator insists.
- **Capture the baseline** alongside current state: from the repo, not
  memory, like the rest of state capture.
- **Real-surface verifier + capability inventory**: identify the primary
  verifier on the surface where the outcome actually matters (running app,
  browser, real workflow: unit tests, builds, and inspection are supporting
  evidence, not substitutes for exercising an interactive outcome); then
  verify the *pursuing* session will have the access and tools the checks
  require. A gap is named in `goal.md` as an explicit blocked item with the
  manual test and evidence required, never silently downgraded to a weaker
  check.
- **Red-team before delivery** asks whether success can be faked by weakening a check.
  Could the words be satisfied while missing the real outcome? Are
  consequential actions gated? Does the loop say what happens after a failed
  attempt? Fix, then deliver.
- **Critique mode**: invoked with a path to an existing goal directory (or
  "critique"), audit the contract against this same rubric and tighten it in
  place instead of writing a new one.

## Calibration

The **always-on four** stay always-on (verifiable acceptance checks, integrity
rules, independent verification, the redefinition tripwire). Fit check,
baseline, and red-team join them as always-on *skill-side* steps; they cost
the producer a moment, not the document a section. Approval gates and
delegation lanes are stakes-scaled sections like Invariants / Non-goals: added
when consequential actions or separable lanes are plausible, omitted for a
trivial goal.

## Non-goals

- **Not ported from ultragoal:** Design-mode-without-files, the Default
  Activation Rule, goal trees / child goals, `update_goal` mechanics, and its
  token-budget language: Codex-runtime concerns that belong in the operator's
  personal skill, not a host-neutral contract generator. (Its merge artifacts
 (duplicated step 6, duplicated red-team list, the `k1.` typo) die here
  too.)
- The skill still never pursues the goal in the producing session. Activation
  guidance rides in the document; the skill only writes.
- Done stays an outcome expressed as verifiable checks; the pursuer owns the
  path.
- No second skill, no new MCP server, hook, or runtime service.

## Packaging

- Canonical `plugins/toolkit/skills/handoff-goal/SKILL.md` reworked: the only
  copy; no mirrors exist under `.claude/` / `.codex/` / onboarding references
  in the current layout.
- The skill `description` frontmatter **changes** (it promises a single
  `tmp/<YYYY-MM-DD>-<goal-slug>.md` file and doesn't mention critique mode);
  update the output path to the directory form and add the critique trigger.
- Origin doc `docs/skills/handoff-goal.md` updated for parity; check the
  `docs/skills/README.md` roster line and both toolkit plugin manifests /
  READMEs for the stale single-file promise; check `handoff-review`'s pointer
  to handoff-goal (expected: name-only, no change).
- Rework of an existing skill: toolkit patch bump `0.12.2` → `0.12.3` in all
  four version-pinned files: the three manifests (`.claude-plugin`,
  `.codex-plugin`, `.cursor-plugin`) plus the toolkit entry in
  `.claude-plugin/marketplace.json` (the validator enforces the match).
  `scripts/validate-native-plugin.ps1` expected-skills set unchanged; must
  pass.
- `docs/change-log.md` entry via the `change-log` skill when this lands.

## Validation

Design-validated, plus a structural smoke test: emit a sample contract from
this session's own history (dry run into scratch, not committed) and check the
emitted pair against the rubric: goal.md carries the always-on four plus
baseline/primary-verifier/activation note; plan.md carries the discipline
preamble, phased shape, and ledger; the two cross-reference.

No behavioral RED→GREEN pressure test this round: the goal-defense decision
(`handoff-goal-goal-defense.md`) ran three methodologies and found the
reward-hack regime does not reproduce in bounded single-shot harnesses because
capable pursuers bring their own integrity when the trap is short and legible.
The split-contract tripwire targets the same unreproducible regime (long-loop
momentum, post-compaction drift), so a fourth harness would measure nothing
new. The mechanical claim this change *does* make: routine writes land in
`plan.md`, so `goal.md` diffs are anomalous. This is verified by inspection of the
emitted sample.
