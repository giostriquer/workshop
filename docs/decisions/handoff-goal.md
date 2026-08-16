# Decision: add the `handoff-goal` skill

**Date:** 2026-06-10

## Status

Implemented.

## Context

`handoff-review` and `handoff-pr` hand work *backward*; they package a finished
(or nearly finished) branch for a fresh reviewer or a separately-authorized PR
opener. A third handoff keeps recurring with no skill behind it: handing work
*forward*. The operator wants a new session to **pick up a goal and pursue it
autonomously**: finish the remaining slices of a plan, or build something that
was only just described, without re-explaining the goal, the current state, or
the working rules every time.

Written by hand, that forward handoff fails in two characteristic ways:

1. **The rules evaporate.** Preferences stated once in chat (which branch to
   work on, commit style, push policy, when a PR may be opened) live only in
   session context. The pursuing session starts well, compacts, and the rules
   are gone: behavior drifts mid-goal.
2. **The goal arrives as a step list, not an outcome.** Without a definition of
   done, the pursuing session either stops early or gold-plates; without an
   outcome framing it cannot optimize the path when the listed steps turn out
   to be the wrong ones.

A baseline test (a capable model asked cold to "write a handoff file so a new
session can finish this") confirmed the pattern before this skill was written:
the rules that were stated mid-session made it into the doc inconsistently, and
nothing instructed the pursuing session to re-read the rules after compaction
or to keep a progress log in the file rather than in its head.

## The shape

`handoff-goal` is the third member of the handoff family and obeys the family
contract: it packages the work into a **self-contained artifact** consumed by a
different session with zero shared context, and it **never performs the
downstream action**. It writes the goal document but does not pursue the goal.

Where it differs from its siblings: `handoff-review` deliberately *excludes*
the session's interpretation (that is the bias being removed); `handoff-goal`
deliberately *carries* the session's accumulated intent: goal, decisions made,
state, because continuation, not fresh eyes, is the point. What both share is
the standalone discipline: nothing the pursuing session needs may live only in
chat.

- **Goal resolution, three sources.** No argument → infer the goal from the
  session's trajectory and confirm with the operator (ask outright if no clear
  candidate). Argument referencing existing work (a plan, slices, a spec, a
  branch) → scope to exactly that reference, reading the referenced material
  rather than recalling it. Argument describing something new → ask only what
  is needed to make the goal actionable, then shape it.
- **Outcome, not step list.** The document states the goal as an outcome with
  an explicit definition of done; the pursuing session owns the path and may
  optimize it.
- **Operating rules with concrete values.** Branch / worktree, commit cadence
  and style, push policy, PR policy, validation gates, and scope boundaries.
  These are detected from the repo's own rule files where possible and asked of the operator
  where not, and recorded as actual values ("PRs go to `develop`"), never as
  "follow user preferences."
- **Compaction survival.** The document opens by telling the pursuing session
  to re-read the operating rules after every compaction and to append to a
  progress section as work lands: the file, not session memory, is the
  durable contract across compactions and across sessions.
- **Artifact path.** `tmp/<YYYY-MM-DD>-<goal-slug>.md` (the `tmp/` scratch dir
  is already gitignored).

## Packaging

Same footprint as the sibling handoff skills (see
`docs/decisions/handoff-skills.md` for the rationale of each piece):

- Canonical at `.claude/skills/handoff-goal/SKILL.md`; byte-identical mirrors
  at `.codex/` and `.gemini/` per the skill-parity convention (`.opencode/`
  does not mirror skills).
- Shipped in the `reviewers` plugin: byte-identical copy at
  `plugins/reviewers/skills/handoff-goal/SKILL.md`;
  `scripts/validate-native-plugin.ps1` `$expectedSkills` widens to exactly
  {`handoff-goal`, `handoff-pr`, `handoff-review`} in both the Claude and
  Codex assertions.
- Onboard references in both reference roots: `references/skills/handoff-goal.md`
  and `references/docs/skills/handoff-goal.md`, plus the re-mirrored
  `references/docs/skills/README.md`.
- Origin doc at `docs/skills/handoff-goal.md`; roster entry in
  `docs/skills/README.md` (nine skills).
- `reviewers` plugin version `0.3.0` → `0.4.0` (additive feature → minor bump)
  in both plugin manifests and the Claude marketplace entry; Codex manifest
  prose updated to name the third skill.

## Non-goals

- The skill never pursues the goal in the producing session.
- It does not prescribe the pursuing session's tools or plan the slices itself.
  It links to plan/spec files rather than restating them.
- No MCP server, hook, or runtime service.
- No divergent host copies: mirrors stay byte-identical to canonical.

## Validation

- `scripts/validate-native-plugin.ps1` passes with the widened skills set.
- `claude plugin validate .` and `claude plugin validate ./plugins/reviewers` pass.
- GREEN test: a model given the skill and the baseline scenario produces a doc
  carrying definition of done, concrete operating rules, and the
  compaction-survival preamble; a second model given only a sample document
  (zero session context) can state the goal, the rules, and its first action
  without asking anything.

## Acceptance criteria

- Installing `reviewers` from the local marketplace exposes the four agents and
  the three skills, each invocable directly.
- `/handoff-goal` with no argument infers and confirms; with an argument it
  scopes to referenced work or shapes a new goal, asking only what inference
  cannot supply.
- The produced document stands alone: goal + definition of done, context,
  current state re-derived from the repo, operating rules with concrete values,
  a progress section the pursuing session appends to, and a first action.
- `docs/change-log.md` gets an entry via the `change-log` skill when this lands.
