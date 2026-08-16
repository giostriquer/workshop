# Decision: broaden `handoff-review` to verify-then-continue

**Date:** 2026-06-24

## Status

Accepted: implementation pending.

## Context

`handoff-review` was built for one job: a fresh, unbiased **pre-PR review** of a
finished branch. In lived-in use it under-performs that narrow framing: the
operator reaches for it rarely, because the moment it actually wants a fresh
session is not "the branch is done, review it" but "**this session's context has
gone bad and I want to start over without losing the work.**"

That recovery moment has no skill behind it. Today the operator either limps the
polluted session forward, or starts fresh and re-explains everything by hand,
while a hand-rolled restart inherits the exact failure `handoff-review` already
solves: the new session **trusts the prior session's claims** about what was
done, builds on top of unverified work, and propagates whatever confusion sent
the first session sideways.

The need is a single handoff that lets a fresh session **(a)** get oriented on
what the prior session did, **(b)** *independently verify* those changes/docs
rather than trust the compromised session's word, and **(c)** continue the
remaining work from a verified foundation.

## The unifying idea

`handoff-review` already owns the load-bearing property for this: the brief
**stands alone and re-derives the task from ticket + diff, never from "what we
discussed this session."** That is the same distrust the recovery case needs.

So the reshape does not bolt a second skill on; it extends one spine:
**verification is the precondition for safe continuation.** Continuing on top of
unverified prior work is building on sand. The fresh session therefore always
verifies first, *then* builds. The review is not an add-on; it is the gate.

This keeps the handoff-family boundaries clean:

- `handoff-goal` carries the session's intent **forward** and trusts the state
  because continuation is the point.
- `handoff-review` (reshaped) **distrusts** the state and verifies it first;
  continuation is a verified-foundation extension, not the premise.
- `handoff-pr` is the terminal ship step.

## The shape

### Modes: existing two unchanged, one added (backward compatible)

| Invocation | Delivery | Receiver's job |
| :-- | :-- | :-- |
| `/handoff-review` (default) | spawn a fresh agent | **verify-only** → findings by severity + go/no-go |
| `/handoff-review handoff` (alias `session`) | scratch file → new session | **verify-only** → findings |
| `/handoff-review continue` (alias `resume`) | scratch file → new session | **verify, then continue** the remaining work |

`continue` is inherently a new-session / scratch-file delivery: the operator is
bailing on the current session, so it has no spawn variant. An ephemeral
subagent cannot *become* the operator's next working session.

### The brief = verify core (all modes) + continuation extension (`continue` only)

**Verify core**: unchanged from today: the four dimensions (task-vs-code
re-derived from ticket + diff, rules/conventions, information leak,
correctness/quality), producing findings by severity plus a **verified-state
verdict**: what is confirmed-good, what is broken, what is incomplete.

**Continuation extension** (`continue` mode only): deliberately **light**, so it
does not duplicate `handoff-goal`'s apparatus:

- **Current state**: branch, what exists, what is done / half-done, decisions
  already made: *re-derived from the repo, not from session memory* (borrowing
  `handoff-goal`'s discipline).
- **Remaining work**: stated as an outcome with a short definition of done, not
  a step list.
- **Operating rules**: branch, commits, push/PR policy, validation gates,
  quality posture: concrete values from the repo's rule files or the operator,
  never "follow the usual conventions."
- **The gate**: continue *only* from a verified foundation: run the verify core
  first; if it surfaces blockers in the prior work, fix-or-escalate those before
  building on top; never trust the prior session's "done."
- **Escalation to `handoff-goal`**: if the remaining work is substantial or
  high-stakes, the brief tells the session to generate a `handoff-goal` document
  for the full acceptance-checks + integrity apparatus rather than free-handing
  it. This is the explicit boundary that keeps the two skills from overlapping.

### Receiver's order of operations (`continue` mode)

1. Read the brief (it stands alone).
2. Verify the prior work → verified-state verdict.
3. Blockers found in the prior work? Stop, report, fix-or-escalate before
   continuing.
4. Clean (or addressed)? Continue toward the definition of done; for substantial
   work, spin up a `handoff-goal` document.

## Naming

Keep the name `handoff-review`. A rename would touch ~46 files and 5+ mirrored
skill directories plus plugin registrations, and "verify" remains a review at its
core, so the name stays honest. The **description** broadens to advertise the
recovery / verify-then-continue use case: under-discoverability of that case is
part of why the skill saw low usage.

## Packaging

Same footprint discipline as the rest of the handoff family (see
`docs/decisions/handoff-skills.md`):

- **Canonical** `.claude/skills/handoff-review/SKILL.md`, with byte-identical
  mirrors at `.codex/`, `.gemini/`, `plugins/toolkit/skills/handoff-review/`, and
  both onboard reference roots
  (`skills/agent-workshop-onboard/references/skills/handoff-review.md` and the
  `plugins/agent-workshop/...` copy): all enforced byte-identical by
  `scripts/validate-native-plugin.ps1` and the skill-parity convention.
- **Origin doc** `docs/skills/handoff-review.md` refreshed for parity (new
  problem framing, the `continue` mode, the relationship to `handoff-goal`), plus
  its two onboard reference mirrors.
- **Descriptions** updated wherever the skill description is embedded:
  `docs/skills/README.md` roster entry (and its two reference mirrors), root
  `README.md` if it lists the skill, and any plugin/marketplace manifest carrying
  the description text.
- **Version bumps** following the recent commit pattern
  (`toolkit x.y.z`, `agent-workshop a.b.c`): additive feature → minor/patch per
  the existing cadence: in the plugin manifests and the marketplace entry.
- **Change-log** entry via the `change-log` skill when the work lands.

## Non-goals

- The skill still **never performs the downstream action**: it does not run the
  review and it does not pursue the continuation in the producing session; it
  writes the brief and hands off.
- The continuation extension does **not** reproduce `handoff-goal`'s full
  acceptance-checks / integrity / ledger apparatus. For substantial forward work,
  it points at `handoff-goal` instead.
- No rename, no new sibling skill, no divergent host copies (mirrors stay
  byte-identical to canonical).
- No new MCP server, hook, or runtime service.
- The brief still names *what* to verify, never *how*: no tool or skill names
  imposed on the receiver.

## Validation

- `scripts/validate-native-plugin.ps1` passes (byte-identity of the reshaped
  SKILL.md across all payload + reference copies; reference set still matches
  sources).
- `claude plugin validate .` and the toolkit plugin validate pass.
- The skill-parity check classifies `handoff-review` as `IDENTICAL` across hosts.
- GREEN test: a model given the reshaped skill and a "context went bad, restart
  this" scenario produces a `continue`-mode brief that stands alone, carries the
  verify core + current state + remaining-work outcome + concrete operating
  rules, gates continuation on verification, and points to `handoff-goal` for
  substantial work; a second model given only that brief (zero session context)
  can state what to verify, the remaining outcome, and its first action without
  asking anything.

## Acceptance criteria

- `/handoff-review` and `/handoff-review handoff` behave exactly as before
  (verify-only review, spawn and scratch-file delivery).
- `/handoff-review continue` (alias `resume`) writes a scratch-file brief that a
  new session uses to verify the prior work and then continue it, gated on a
  clean verification.
- The continuation extension stays light and explicitly escalates substantial
  work to `handoff-goal`.
- All SKILL.md copies are byte-identical to canonical; the origin doc and its
  mirrors, the README roster, and the descriptions are updated for parity.
- `docs/change-log.md` gets an entry via the `change-log` skill when this lands.
