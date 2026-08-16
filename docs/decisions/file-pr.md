# Decision: evolve `handoff-pr` into `file-pr`: file the PR and see it through

**Date:** 2026-08-11

## Status

Implemented (2026-08-11). `validate-native-plugin.ps1` passes.

## Context

`handoff-pr` was built for an authorization split: the implementing session couldn't
open PRs, so it packaged a standalone artifact (template-true body, ticket link,
validation provenance) for a separately-authorized session to open. That split is no
longer real in the operator's environments (sessions are fully authorized) so the
artifact became ceremony: every invocation was followed by the same manual tail
(open it, watch CI, fix what breaks, resolve the conflict the moving base created).
With `fix-ci` (same day) landing the autonomous CI loop, the tail became
automatable end-to-end. Operator call: change the skill, don't add a sibling.

## Decision: evolve, keep the body machinery, bound the autonomy

`file-pr` keeps everything `handoff-pr` learned the hard way: template-follow-never-
replace (with the headings-match redo check), diff-grounded summaries, real ticket
links only, gate discovery (repo's own CI workflows / hooks / script targets, static
checks separately, `--no-verify` caveat), enforced title/branch conventions, and
changes the delivery:

- **Prepare**: sync with the base *before* filing (merge-based; never rebase
  published commits, never force-push) and run the discovered gates locally first.
  Filing on a known-red baseline wastes the tend loop's bounded attempts.
- **File**: push per repo conventions, `gh pr create`, report the URL immediately.
- **See it through**: CI through the **`fix-ci` skill's loop** (composition, not
  duplication because it owns flake triage, the two-attempt cap, and never-weaken-a-check);
  mergeability via `gh pr view --json mergeable,mergeStateStatus`; at most **two**
  base re-syncs on conflicts.
- **Autonomy stops at judgment**: semantic merge collisions (both sides changed the
  same logic with different intent) and intended-behavior questions end the loop
  with a report; only mechanical conflicts resolve autonomously. The skill **never
  merges the PR**: green-and-mergeable is the end state, merging stays human.
- **Ticket handling went autonomous-friendly**: one candidate → link it; several →
  ask; none → proceed and note it (ask only when the repo's template requires one).
  The artifact's two-block layout and `tmp/` / `inline` delivery modes are gone;
  validation provenance moves to the session report.

The old behavior stays recoverable: origin doc at
`docs/skills/deprecated/handoff-pr.md` (with the evolution note) and the pre-rename
spec in git history, for teams that genuinely retain the authorization split.

## What changed

- `git mv plugins/toolkit/skills/handoff-pr → plugins/toolkit/skills/file-pr`;
  SKILL.md rewritten. New origin doc `docs/skills/file-pr.md`; old origin doc moved
  to `docs/skills/deprecated/handoff-pr.md` with a deprecation note.
- `scripts/validate-native-plugin.ps1`: both expected-skills lists renamed the entry.
- Live references updated to `file-pr`: toolkit README (intro, install lists, table),
  root README, `docs/skills/README.md` (roster row, composition bullets, deprecated
  line), origin docs `handoff-goal` / `qa-sweep` / `empirical-proof` /
  `ui-demo-video`, adoption docs (`docs/adoption/README.md`,
  `docs/adoption/native-plugin.md`: whose Codex-surface lists were also stale,
  missing `fix-ci`, and were trued up to twelve). Historical decisions and change-log
  entries left as-is.
- Mirrors re-synced into the onboarding bundle (skills roster + both adoption docs).
- Versions: `toolkit` `0.18.0` → `0.19.0`, `agent-workshop` `0.1.24` → `0.1.25`,
  consistent across all manifests and the marketplace.

## Non-goals

- Not a merger. It never merges, auto-merges, closes, or re-targets the PR.
- Not an artifact producer: no authorization-split fallback mode; that behavior is
  deprecated, not hidden behind a flag.
- Not host-agnostic: assumes `gh`, like `fix-ci` / `ci-watcher`.

## Acceptance criteria

- Invoking `file-pr` on a ready branch: base sync, local gates, template-verbatim
  body, PR opened with URL reported, then tended: CI via `fix-ci`, conflicts via
  bounded merge re-syncs: ending green-and-mergeable or with a plain stop report.
- `toolkit` at `0.19.0` and `agent-workshop` at `0.1.25` consistently;
  `scripts/validate-native-plugin.ps1` passes.
