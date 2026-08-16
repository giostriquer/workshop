# Decision: decouple the two plugins; drop the universal `.claude/` master

**Date:** 2026-06-29

## Status

Implemented (2026-06-29). `validate-native-plugin.ps1` passes.

## Context

The repo had grown a heavy mirroring discipline: every agent/skill lived as a
canonical copy in `.claude/`, was mirrored byte-identical into `.codex/`,
`.gemini/`, the `toolkit` plugin (for the toolkit subset), **and** the onboarding
plugin's `references/` bundle, and the validator enforced all of it against
`.claude/` as the single master. Two problems fell out of that:

1. **`.claude/` (and the host dirs) misrepresented the repo.** Because Claude Code
   activates everything under `.claude/`, this scaffold repo "used" all 13 skills +
   9 agents in its own sessions, even though its actual work: debate that converges
   on a spec, or an operator-handed spec: leans on almost none of them. A prior
   pass scoped them with `.claude/settings.json`, but that was a band-aid: the files
   were still physically present and claimed as the repo's own.
2. **Onboarding was force-coupled to toolkit.** The validator required the
   onboarding bundle to mirror *every* canonical piece, so the onboarding plugin
   carried templates for the direct-use, self-contained skills (handoffs,
   doc-to-html, claim-check, qa-sweep, code-quality-review) that no project ever
   needs to *copy and adapt*: an adopter just installs the `toolkit` plugin.

## The new model

**Each plugin is self-contained and authoritative for its own content; the two
need not carry the same set, and there is no universal `.claude/` master.**

- **`toolkit`** owns the **direct-use, self-contained** pieces. `plugins/toolkit/`
  is their canonical home.
- **`agent-workshop` (onboarding)** owns the **project-coupled** pieces that need
  per-repo adaptation. The bundle at
  `plugins/agent-workshop/skills/agent-workshop-onboard/references/` is their
  canonical home, and the bundle is self-contained (it carries only what it adopts).
- A piece that serves **both** roles (the reviewers `spec`/`pattern`/`test`/`vigil`)
  ships a copy in each plugin; the copies are allowed to diverge.
- The repo's host dirs (`.claude/`, `.codex/`, `.opencode/`) hold **only the set the
  scaffold runs on itself**: `change-log`, `push` (skills) and `wiki-maintainer`,
  `vigil` (agents), kept byte-identical to their onboarding-bundle templates.

The 3-bucket split:

| Bucket | Pieces | Home |
|---|---|---|
| toolkit-only | skills `handoff-review/pr/goal`, `doc-to-html`, `claim-check`, `qa-sweep`, `code-quality-review`; agent `code-quality-reviewer` | `plugins/toolkit/` |
| both | agents `spec-reviewer`, `pattern-reviewer`, `test-quality-reviewer`, `vigil` | `plugins/toolkit/` + onboarding bundle |
| onboarding-only | agents `doc-indexer`, `wiki-maintainer`, `research`, `visual-implementer`; skills `change-log`, `push`, `doc-audit`, `agent-audit`, `research`, `visual-advisor` | onboarding bundle |

## What changed

- **Host dirs trimmed** to the used-4 across `.claude/`, `.codex/`, `.opencode/`;
  **`.gemini/` deleted entirely** (Gemini stays an *adoption* target via the bundle's
  `wrappers/gemini/` templates and `hostSupport`, just not a repo host dir).
- **Onboarding bundle trimmed** to the adopt-set (8 agents, 6 skills): the 7
  toolkit-only skills and `code-quality-reviewer` were removed from
  `references/{agents,skills,wrappers,docs}`.
- **`code-quality-reviewer` dropped from `marketplace/catalog.json`** (self-contained,
  toolkit-only and not onboarding-adopted). The catalog now lists 8 agents.
- **Validator rewritten** from "every copy is byte-equal to `.claude/`" to a
  per-plugin model: manifest/version/marketplace structure (unchanged); toolkit ships
  exactly its declared skill/agent sets; the onboarding bundle is self-consistent
  (catalog mirror, every cataloged agent fully bundled, bundled origin docs fresh
  against `docs/`); and the few pieces the repo runs locally stay byte-identical to
  their bundle templates. The `.claude/`-master parity logic and the now-unused
  `Get-RelativeFileList` helper were removed.
- **`.claude/settings.json` reverted**: redundant now that the unused pieces are
  physically gone from `.claude/`.
- **Docs updated** to the new layout: `CLAUDE.md` source-of-truth boundaries +
  add/remove steps; `AGENTS.md` cross-host parity + path references; the agent/skill
  rosters; `docs/marketplace/{README,native-plugin}.md`; root `README.md`
  onboarding framing. The onboarding `SKILL.md` gained a scope note (it adopts the
  project-coupled set; direct-use pieces come from `toolkit`). `docs/setup.md` (the
  manual copy-by-hand guide) was **removed** as a follow-up: the guided onboarding
  skill is the adoption path, and its mechanics had become fiddly post-decouple; its
  references in `README.md`/`CLAUDE.md`/`AGENTS.md` were cleaned up. The **portable**
  convention docs (`cross-host-wrappers`, `skill-parity`, `doc-routing`) are
  unchanged because they describe the pattern adopters apply in *their* repos, where
  canonical does land in `.claude/`.

**No version bump.** The installable plugin payloads (`plugins/toolkit/` and the
onboarding payload) did not change content for installs; `toolkit` stays `0.9.0`,
`agent-workshop` `0.1.16`. What changed is repo-internal organization and the
validator.

## Notes / boundaries

- `catalog.json` `canonicalPath` / `wrapperPaths` now read as **adopter-landing
  paths** (where a piece goes in an adopting project's `.claude/`, `.codex/`, …),
  not where it lives in this repo. Documented in `CLAUDE.md`.
- The onboarding **skill** is the adoption mechanism (`mode: plan` → `mode: apply`,
  catalog-driven from the bundle). Manual copy-by-hand (from the plugin dirs) still
  works for hosts that can't load the plugin, but is no longer a step-by-step guide
  (`docs/setup.md` was removed).
- Installed plugins are orthogonal: if a maintainer has `toolkit` installed in their
  environment, its `toolkit:`-namespaced agents still surface in sessions; that's an
  install choice, separate from what this repo declares in `.claude/`.

## Follow-up (still open)

The remaining duplication is the "both" reviewers (a copy in toolkit + a copy in the
onboarding bundle) and the bundle being committed rather than generated. Both are the
"generate the payload instead of committing it" lever, deferred.
