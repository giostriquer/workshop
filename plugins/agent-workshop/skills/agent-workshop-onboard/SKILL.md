---
name: agent-workshop-onboard
description: Use when onboarding Agent Workshop agents into a repository, planning or applying repo-local agent packs, auditing existing agent-workshop adoption, or explaining pack/profile choices.
---

# Agent Workshop Onboard

This skill is the only active plugin surface for Agent Workshop. It does not
make the scaffold's agents global. It helps an operator decide which repo-local
agents, wrappers, skills, conventions, and profile definitions a target project
should adopt.

It adopts the scaffolding worth localizing — the agents and workflow skills that
benefit from per-repo adaptation (profile slots, conventions, host wrappers),
which is exactly the set in `references/catalog.json` and the bundled
`references/`. The self-contained, direct-use skills (`handoff-*`, `doc-to-html`,
`claim-check`, `qa-sweep`, `code-quality-review`, `arch-map`) and the self-contained
`code-quality-reviewer` agent are **not** bundled here — they ship ready-to-use in
the separate `toolkit` plugin; point the operator there for those. (The review
agents that *are* in the catalog can be adopted repo-local here, or used directly
from `toolkit` — the operator's choice.)

Default to `mode: plan`. Only `mode: apply` may write files, and only after the
operator approves a concrete plan from this session or supplies an approved plan
file.

## Inputs

- `mode`: `plan` (default), `apply`, `audit`, or `explain`
- `target`: target repository root; default to the current working directory
- `packs`: optional requested packs from `references/catalog.json`
- `agents`: optional requested agent ids from `references/catalog.json`
- `hosts`: optional target hosts such as Claude Code, Codex, Gemini, or OpenCode
- `approved_plan`: required for `mode: apply`; either the plan produced in this
  session or a path to an approved plan file

## Mode: plan

Inspect the target repo and produce an adoption plan. Do not write files.

Read, when present:

- `AGENTS.md`, `CLAUDE.md`, and host-specific workflow docs
- `.claude/`, `.codex/`, `.gemini/`, `.opencode/`
- `docs/`, especially conventions, setup, decisions, change logs, and testing docs
- existing plugin or marketplace manifests
- test tooling and quality policy docs when `test-quality-reviewer` is a candidate

Classify each candidate agent:

- `copy-as-is`: canonical scaffold can be copied with only path-neutral wrapper updates
- `profile-required`: suitable, but project profile slots must be filled first
- `needs-local-definition`: suitable only after a narrower local variant or convention docs are written
- `defer`: likely useful later, but the supporting workflow does not exist yet
- `skip`: the project does not currently have the problem the agent solves

Return:

- selected packs and agents
- classification and rationale for each candidate
- required profile slots
- exact files proposed for create/modify
- source template for each proposed file or reference path to the bundled template
- validation checks to run after apply
- risks, omitted agents, and follow-up decisions
- explicit prompt asking whether to proceed with `mode: apply`

## Mode: apply

Apply only an approved plan. Refuse to write if there is no concrete approved plan.

Before writing:

1. Re-read the approved plan.
2. Run `git status --short` in the target repo when it is a git checkout.
3. Report unrelated dirty files.
4. Refuse if the plan lacks exact file paths.
5. Refuse if any target file has conflicting uncommitted changes not accounted for in the plan.

When writing:

- write only files named in the approved plan
- preserve unrelated sections in existing `AGENTS.md`, `CLAUDE.md`, and docs
- prefer repo-local `.claude/`, `.codex/`, `.gemini/`, and `.opencode/` files
- never edit user/global host config
- never copy private local project paths from examples into the target repo
- do not commit unless the approved plan explicitly asks for a commit

After writing:

- run the approved validation checks
- report changed files, skipped files, validation output, and remaining profile gaps

## Mode: audit

Inspect an existing Agent Workshop adoption and report drift. Do not write files.

Check:

- installed agents versus `references/catalog.json`
- local divergence from bundled references
- wrapper pointers and host support
- skill mirrors when multiple hosts are supported
- required profile slots
- agreement between `AGENTS.md` and `CLAUDE.md`
- stale agents that no longer earn their keep
- plugin-global agents accidentally replacing repo-local agents

## Mode: explain

Answer questions about packs, profile slots, host wrappers, or agent boundaries.
Use `references/catalog.json` and bundled docs as the source model.

## Safety Rules

- Default to read-only planning.
- Do not install all agents by default.
- Do not install `pattern-reviewer` as a gate until pattern domains and convention docs exist.
- Do not install `visual-implementer` unless a visual baseline and proof path exist or are in the approved plan.
- Do not install `research` unless a project-owned research brief schema exists or is in the approved plan.
- Do not derive CRAP from coverage data unless complexity values are valid.
- Treat high-impact surfaces as profile-specific; average coverage is not enough.
- Do not overwrite existing local agents without showing the local diff and getting approval.

## Bundled References

Bundled templates live under `references/` inside this skill. They are source
material for repo-local adoption, not active plugin agents or skills. Reference
skill templates use `references/skills/<skill>.md` instead of nested `SKILL.md`
filenames so plugin hosts do not auto-discover them as active skills.
