# Decision: remove the redundant root `skills/agent-workshop-onboard/` tree

**Date:** 2026-06-29

## Status

Implemented (2026-06-29). `validate-native-plugin.ps1` passes.

## Context

The repo carried **two** full copies of the onboarding plugin: the SKILL.md plus
its large `references/` tree (canonical agents, skills, wrappers, docs, catalog):

- `plugins/agent-workshop/skills/agent-workshop-onboard/`: the actual marketplace
  payload.
- `skills/agent-workshop-onboard/` (repo root): an 86-file near-clone of it.

The root copy was authored first (the original implementation plan created
`skills/agent-workshop-onboard/` and then copied it into the plugin payload), the
marketplace was pointed at the plugin payload, and the root copy was frozen in place
as a "source copy," kept alive only by the validator.

Investigation confirmed it is **dead weight**, not a live surface:

- **Nothing points at it.** Both marketplaces: Claude `.claude-plugin/marketplace.json`
  and Codex `.agents/plugins/marketplace.json`: set their source to
  `./plugins/agent-workshop`. The Codex manifest's `"skills": "./skills"` is
  plugin-relative (`plugins/agent-workshop/skills/`). A grep for any config
  referencing the root path returns nothing.
- **It is not a repo-usability surface.** Claude Code discovers project skills from
  `.claude/skills/`, where `agent-workshop-onboard` is deliberately absent. The
  cross-host parity convention in `AGENTS.md` covers `.codex/skills/` and
  `.gemini/skills/`; it never mentions the root `skills/`.
- **It is a clone.** The two trees were identical except the plugin copy's
  Codex-only `agents/openai.yaml` wrapper (87 vs 86 files).

The cost of keeping it was a standing maintenance tax: every new skill or agent had
to mirror its references into *both* onboarding trees (paid twice in the same
session, for the `code-quality-review` skill and the `code-quality-reviewer` agent).

## What changed

- Deleted `skills/agent-workshop-onboard/` (and the now-empty repo-root `skills/`).
- `scripts/validate-native-plugin.ps1`: dropped the root-tree checks:
  `Assert-SingleSkill "skills" ...`, the root↔Codex reference file-list/byte
  comparison, and the root SKILL.md parity check. `Assert-ReferenceSetMatchesSources`
  and the cataloged-agent check now run against the single remaining
  `plugins/agent-workshop/skills/agent-workshop-onboard/references` tree, so the
  installed payload is still validated against the canonical sources. Removed the
  now-unused `Get-RelativeFileList` helper.
- `docs/marketplace/native-plugin.md`: dropped the "root copy remains a source copy"
  paragraph, keeping the real rationale (installs point at the slim payload, never at
  repo root, so the canonical `.claude/skills/` tree isn't exposed as active skills).
  Re-mirrored to the plugin reference root.
- `README.md`: removed an unrelated in-the-weeds Codex caveat line from the install
  block (the toolkit-exposes-skills-not-agents-on-Codex nuance is already documented
  in `plugins/toolkit/README.md` and `native-plugin.md`).

## Why it's safe

The marketplace payload (`plugins/agent-workshop/`) is untouched, so installs are
byte-for-byte unchanged. No version bump: the installable artifacts (`toolkit`
`0.9.0`, `agent-workshop` `0.1.16`) did not change. The validator still proves the
payload's references mirror the canonical scaffold files.

## Follow-up (not done here)

This removes the *smaller* of two duplication layers. Two larger ones remain, for a
later structural pass:

- The plugin's `references/` tree is still a committed copy of `.claude/agents`,
  `.claude/skills`, `docs/*`, and the host wrappers: a self-contained payload that
  could instead be **generated at release time** rather than committed and validated.
- `.codex/skills/` and `.gemini/skills/` fully duplicate `.claude/skills/` for
  cross-host parity (the "mirrors" maintained per skill).

Both are the "stop committing N copies of everything" conversation; out of scope for
this change.
