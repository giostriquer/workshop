# Decision: change-log keyed by plugin release, not by date

**Date:** 2026-08-11

## Status

Implemented (2026-08-11). `validate-native-plugin.ps1` passes.

## Context

`docs/change-log.md` was a date-keyed diary (`## YYYY-MM-DD` sections) inherited
from the change-log skill's origin project. But this repo's product is its
**plugins**, and nearly every meaningful entry already recorded a version bump
inline ("`toolkit` `0.16.5` → `0.17.0`"): the diary was release notes wearing a
diary's structure. Operator call: the log should reflect what each toolkit version
changed, not narrate every repo day.

## Decision

**Sections are keyed by the released plugin version**, newest first:

- `## toolkit X.Y.Z: date`: the primary product; `## reviewers X.Y.Z: date`
  for the pre-2026-06-16 name. Batched releases keep multiple `###` entries under
  one version; a same-entry pair of patch bumps may share a heading
  (`## toolkit 0.15.0 / 0.15.1`).
- `## agent-workshop X.Y.Z: date`: onboarding-plugin-only releases.
  `agent-workshop` bumps that merely ride a toolkit release (mirror re-syncs) stay
  a note inside the toolkit entry.
- `## repo: date`: work that shipped in no release (packaging, repo structure,
  docs-only), kept in chronological position.

The **entire history was re-keyed, bodies verbatim**: no entry text was rewritten;
inline bump sentences stay (they carry the from→to and co-bump detail). Two
archaeology calls made during the migration: the 2026-06-29 `ci-watcher` entry
moved above the `0.9.0` batch (it shipped `0.10.0`, after them: date order had
hidden that); and the 2026-07-31 `handoff-goal` description-scope entry was
confirmed via git (`d6276fb`) to have shipped **without** a bump; it sits under
`## repo` with a note that `0.14.1` first delivered it. The 2026-05-29 `reviewers`
introduction records no version, so its heading is `## reviewers introduced` rather
than a fabricated number.

The **change-log skill** (repo working set + onboarding-bundle template,
byte-identical ×3) gains the rule generically: versioned-product repos key by
release with the `repo` escape hatch; date-keyed remains the default for everything
else. Adopting projects that ship versioned artifacts inherit the variant.

## What changed

- `docs/change-log.md`: preamble explaining the keying; all ~48 date headings
  replaced by version headings; the one block move (`ci-watcher`) noted above.
- `change-log` skill: Format section rewritten in
  `.claude/skills/change-log/SKILL.md`, `.codex/skills/change-log/SKILL.md`, and
  the bundle template `references/skills/change-log.md` (hash-verified identical).
  Origin doc `docs/skills/change-log.md` updated for parity.
- `agent-workshop` `0.1.25` → `0.1.26` (bundle template changed); `toolkit`
  unchanged at `0.19.0` (it does not ship the skill).

## Non-goals

- Not a rewrite of entry bodies: history stays verbatim.
- Not a per-plugin `CHANGELOG.md` shipped inside the plugin payloads; noted as a
  possible follow-up (adopters would see release notes at update time), decided
  separately if wanted.

## Acceptance criteria

- Every section heading names a release (or `repo` / `introduced`); versions
  descend monotonically within each plugin lineage; no `## YYYY-MM-DD` headings
  remain.
- The three skill copies hash-identical; `agent-workshop` at `0.1.26` everywhere;
  `scripts/validate-native-plugin.ps1` passes.
