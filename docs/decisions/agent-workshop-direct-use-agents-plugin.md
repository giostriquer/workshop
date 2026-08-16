# Decision: add a direct-use agents plugin

**Date:** 2026-05-29

## Status

Draft for operator review.

## Context

`agent-workshop` already ships one native marketplace plugin, `agent-workshop`,
whose only active surface is the `agent-workshop-onboard` skill. That plugin is a
*bootstrapper*: it inspects a target repo, recommends which repo-local agents to
adopt, and writes approved files only in `mode: apply`. It deliberately does not
expose the scaffold agents as active global/plugin agents.

That serves adopters who want project-local workflow contracts. It does not serve
a second audience: people who just want to **use** a few of the agents directly
in whatever repo they are in, without running an adoption flow first.

This decision adds a second, separate plugin for that audience. Keeping it
separate preserves the bootstrapper's intent: the onboarding skill is not part
of the new plugin, and the new plugin ships no skills.

## Relationship to the existing non-goal

The native-onboard decision
(`docs/decisions/agent-workshop-native-onboard-plugin.md`) lists as a non-goal:
"Do not expose all scaffold agents as active global/plugin agents," and
`CLAUDE.md` frames agents as "project-local workflow contracts, not universal
runtime tools."

This decision **consciously and narrowly reverses** that boundary:

- The reversal is *bounded*. Only agents that genuinely work standalone, with no
  project profile slots to fill: ship as active plugin agents. The full set is
  not exposed.
- The bootstrapper plugin and its project-local-contract philosophy are
  unchanged. The two plugins coexist; users install whichever fits.
- "All scaffold agents" remains a non-goal. "A curated, standalone-capable
  subset" is the new, separate offering.

## Goal

Add a Claude Code marketplace plugin, `reviewers`, that exposes a
curated set of standalone-capable agents as active plugin agents, so a user can
install it and invoke those agents directly (e.g.
`/reviewers:spec-reviewer`) in any repo, with no onboarding step.

## Non-goals

- Do not ship the onboarding skill, or any skill, in this plugin.
- Do not ship the non-curated agents (`doc-indexer`, `wiki-maintainer`,
  `visual-implementer`, `research`) in this plugin.
- Do not auto-install or auto-activate anything beyond Claude's normal plugin
  agent discovery.
- Do not add an MCP server, app, or runtime service.
- Do not deliver this plugin to Codex, Gemini, or OpenCode in this slice.
- Do not fork the curated agents into divergent copies: the canonical
  `.claude/agents/` files remain the single source of truth.

## Curated set

Four agents, chosen because they work in an arbitrary repo without project
profile slots:

| Agent | Shipped as | Why it is standalone-capable |
| --- | --- | --- |
| `spec-reviewer` | faithful copy | reviews any spec/plan the invoker points it at |
| `test-quality-reviewer` | faithful copy | reviews any test diff with default heuristics |
| `vigil` | faithful copy | read-only; audits the agent/skill layer of whatever repo it runs in |
| `pattern-reviewer` | faithful copy of the **enhanced** canonical spec | works via the new discovery/inference fallback (see below) |

Excluded for this slice and why: `doc-indexer` and `wiki-maintainer` need a docs
root and routing/change-log policy; `visual-implementer` is edit-capable and
needs an approved asset baseline; `research` is write-capable and coupled to a
project research-output convention and brief schema. These remain adoption-only
through the onboarding plugin.

## Pattern-reviewer enhancement (folded into canonical)

The canonical `pattern-reviewer` is built around the project defining domains and
`docs/conventions/<domain>/` docs. In a repo with no domain layout it would, by
design, raise a coverage gap on everything rather than review against documented
rules: useless as a direct-use agent.

Add a documented **discovery mode** to `.claude/agents/pattern-reviewer.md` that
activates only when no domain layout / convention-doc structure is found:

1. **Discover**: look for convention/pattern docs anywhere under `docs/`, not
   only the prescribed `docs/conventions/<domain>/` layout.
2. **Infer**, if none are found, infer de-facto conventions from the closest
   sibling files to those changed, and review the diff against those inferred
   patterns.
3. **Label honestly**: inferred-pattern findings are marked lower-confidence,
   and the agent still reports "no documented conventions found" as an
   observation recommending the project document them.

This preserves the existing **no-silent-false-confidence** principle: a coverage
gap no longer means "review nothing and pass"; it means "review against inferred
patterns, clearly labeled." The strict documented-domain behavior is unchanged
when a domain layout exists; the fallback is additive.

Because this changes a canonical agent, it ripples to:

- `docs/agents/pattern-reviewer.md` (origin doc: document the discovery mode and
  its adaptation notes).
- the onboarding plugin's bundled reference copies of `pattern-reviewer.md` (the
  existing validator enforces reference == canonical, so these must re-sync).
- `marketplace/catalog.json`: add a note to the `pattern-reviewer` entry that a
  standalone discovery fallback now exists. Its `profile-required` maturity is
  unchanged for full domain-aware operation.

## Source of truth and parity

All four shipped agent files are byte-identical copies of their
`.claude/agents/<name>.md` source. No divergent variants. The new plugin's agents
are a mirror, kept honest by the validator.

## Host packaging

### Claude Code

```text
.claude-plugin/
  marketplace.json          # now lists two plugins
plugins/
  agent-workshop/           # existing bootstrapper (unchanged)
  reviewers/  # new
    .claude-plugin/
      plugin.json
    agents/
      spec-reviewer.md
      test-quality-reviewer.md
      vigil.md
      pattern-reviewer.md
    README.md
```

The marketplace entry points at `./plugins/reviewers` with its own
`version`. Claude auto-discovers the four `agents/*.md` files. The payload has no
`skills/`, no `.mcp.json`, and no plugin-level agent registration in
`plugin.json`.

### Other hosts

Codex, Gemini, and OpenCode are out of scope for this slice. The Codex
marketplace (`.agents/plugins/marketplace.json`) stays onboarding-only. A later
decision can add per-host agent delivery if wanted.

## Validation

Extend `scripts/validate-native-plugin.ps1`:

- the new plugin manifest exists, name is `reviewers`, contains no
  `mcpServers`, and the payload has no `skills/` directory at all.
- the new plugin's `agents/` directory contains exactly the four curated files
  and nothing else.
- each shipped agent file is byte-identical to its `.claude/agents/<name>.md`
  source.
- the root Claude `marketplace.json` lists exactly two plugins, each with a name,
  source, and version matching its payload manifest.
- `claude plugin validate .` and `claude plugin validate
  ./plugins/reviewers` both pass.

## Documentation updates

- This decision doc.
- `docs/agents/pattern-reviewer.md`: discovery-mode origin/adaptation notes.
- `README.md` and `docs/marketplace/`: describe the two-plugin marketplace
  ("onboard scaffolding" vs "use agents directly").
- `docs/change-log.md`: entry via the `change-log` skill when the plugin lands.

## Acceptance criteria

- Claude Code can install `reviewers` from the local marketplace
  and discover exactly the four curated agents, namespaced under the plugin.
- The onboarding skill is not present in the new plugin.
- Installing the new plugin does not expose the non-curated agents.
- `pattern-reviewer` produces a useful, honestly-labeled review in a repo that
  has no domain layout, and its strict documented-domain behavior is unchanged
  where a layout exists.
- The four shipped agent files are byte-identical to canonical, enforced by the
  validator.
- `claude plugin validate .` passes with two plugins present.

## Open decisions

Settled for this slice:

- Plugin name is `reviewers`: deliberately not prefixed with the repo name. A
  plugin name only needs to be unique within its marketplace, and it doubles as
  the agent-invocation namespace (`reviewers:spec-reviewer`), so the shorter name
  reads better and avoids redundant duplication of the `agent-workshop`
  marketplace name. The bootstrapper plugin keeps the name `agent-workshop` (its
  marketplace namesake): renaming it would cascade into its `agent-workshop-onboard`
  skill and its Codex delivery: a cross-host rebrand out of scope for this
  Claude-only slice.
- Curated set is `spec-reviewer`, `test-quality-reviewer`, `vigil`,
  `pattern-reviewer`.
- The pattern-reviewer discovery/inference fallback is folded into the canonical
  spec (single source of truth), not a divergent plugin variant.
- Claude Code is the only delivery host for this slice.

Still to decide during implementation planning:

- Exact `version` for the new plugin entry.
- Whether to add a minimal `bin/` or settings; default is neither.
- Whether later slices add Codex/Gemini/OpenCode delivery or widen the curated
  set.
