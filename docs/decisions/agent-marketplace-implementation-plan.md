# Agent Marketplace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a manifest-backed marketplace layer that catalogs the existing canonical agents into packs with profile requirements and adoption docs.

**Architecture:** Keep canonical agent specs in `.claude/agents/` and add `marketplace/catalog.json` as compact metadata only. Marketplace docs explain packs and profile slots; setup and index docs route adopters through pack selection before copying files.

**Tech Stack:** Markdown, JSON, Git, PowerShell built-ins (`ConvertFrom-Json`, `Test-Path`). No runtime or dev dependency changes.

---

## Files

- Create: `marketplace/catalog.json`
- Create: `docs/marketplace/README.md`
- Create: `docs/marketplace/packs.md`
- Create: `docs/marketplace/agent-profiles.md`
- Modify: `README.md`
- Modify: `docs/setup.md`
- Modify: `docs/agents/README.md`
- Modify: `docs/change-log.md`

## Task 1: Add The Marketplace Catalog

**Files:**

- Create: `marketplace/catalog.json`

- [ ] **Step 1: Add the catalog file**

Create `marketplace/catalog.json` with this exact structure:

```json
{
  "schemaVersion": 1,
  "generated": false,
  "packs": {
    "review-core": {
      "title": "Review Core",
      "description": "Pre-implementation and post-implementation review gates for projects that use specs, plans, and implementation review loops.",
      "defaultInstall": true,
      "requiresDecision": false,
      "agents": [
        "spec-reviewer",
        "pattern-reviewer",
        "test-quality-reviewer"
      ]
    },
    "docs-core": {
      "title": "Docs Core",
      "description": "Documentation retrieval, routing, audit, and diff-driven source-of-truth updates.",
      "defaultInstall": false,
      "requiresDecision": true,
      "agents": [
        "doc-indexer",
        "wiki-maintainer"
      ]
    },
    "governance": {
      "title": "Governance",
      "description": "Advisory review of the agent, skill, wrapper, and workflow-instruction layer itself.",
      "defaultInstall": false,
      "requiresDecision": true,
      "agents": [
        "vigil"
      ]
    },
    "specialized": {
      "title": "Specialized",
      "description": "Structured research notes and approved visual-asset execution for projects with those workflows.",
      "defaultInstall": false,
      "requiresDecision": true,
      "agents": [
        "research",
        "visual-implementer"
      ]
    }
  },
  "agents": {
    "doc-indexer": {
      "title": "Doc Indexer",
      "canonicalPath": ".claude/agents/doc-indexer.md",
      "originDoc": "docs/agents/doc-indexer.md",
      "role": "retrieval-only",
      "maturity": "profile-required",
      "packs": [
        "docs-core"
      ],
      "hostSupport": {
        "claude": true,
        "codex": true,
        "gemini": true,
        "opencode": true
      },
      "wrapperPaths": {
        "codex": ".codex/agents/doc-indexer.toml",
        "gemini": ".gemini/agents/doc-indexer.md",
        "opencode": ".opencode/agents/doc-indexer.md"
      },
      "requires": [
        "docsRoot",
        "docRoutingPolicy"
      ],
      "profileSlots": [
        "sourcePriorityDocs",
        "docsRoot",
        "docRoutingPolicy"
      ],
      "adoptionNotes": [
        "Use when documentation routing and audit questions are common enough to justify a retrieval-only helper.",
        "Omit until the project has enough docs that loading the maintainer for every question is wasteful."
      ]
    },
    "pattern-reviewer": {
      "title": "Pattern Reviewer",
      "canonicalPath": ".claude/agents/pattern-reviewer.md",
      "originDoc": "docs/agents/pattern-reviewer.md",
      "role": "review-only",
      "maturity": "profile-required",
      "packs": [
        "review-core"
      ],
      "hostSupport": {
        "claude": true,
        "codex": true,
        "gemini": true,
        "opencode": true
      },
      "wrapperPaths": {
        "codex": ".codex/agents/pattern-reviewer.toml",
        "gemini": ".gemini/agents/pattern-reviewer.md",
        "opencode": ".opencode/agents/pattern-reviewer.md"
      },
      "requires": [
        "patternDomains",
        "sourcePriorityDocs"
      ],
      "profileSlots": [
        "sourcePriorityDocs",
        "patternDomains",
        "wrapperPolicy"
      ],
      "adoptionNotes": [
        "Do not install as a real gate until the project defines domain modes and convention docs.",
        "The agent is portable because project-specific anti-patterns live in the project profile."
      ]
    },
    "research": {
      "title": "Research",
      "canonicalPath": ".claude/agents/research.md",
      "originDoc": "docs/agents/research.md",
      "role": "research-write",
      "maturity": "specialized",
      "packs": [
        "specialized"
      ],
      "hostSupport": {
        "claude": true,
        "codex": true,
        "gemini": true,
        "opencode": true
      },
      "wrapperPaths": {
        "codex": ".codex/agents/research.toml",
        "gemini": ".gemini/agents/research.md",
        "opencode": ".opencode/agents/research.md"
      },
      "requires": [
        "researchBriefSchema",
        "sourcePriorityDocs"
      ],
      "profileSlots": [
        "sourcePriorityDocs",
        "researchBriefSchema"
      ],
      "adoptionNotes": [
        "Install only with the companion research skill and a project-owned brief schema.",
        "This agent writes research notes; it does not promote findings into source-of-truth docs."
      ]
    },
    "spec-reviewer": {
      "title": "Spec Reviewer",
      "canonicalPath": ".claude/agents/spec-reviewer.md",
      "originDoc": "docs/agents/spec-reviewer.md",
      "role": "review-only",
      "maturity": "core",
      "packs": [
        "review-core"
      ],
      "hostSupport": {
        "claude": true,
        "codex": true,
        "gemini": true,
        "opencode": true
      },
      "wrapperPaths": {
        "codex": ".codex/agents/spec-reviewer.toml",
        "gemini": ".gemini/agents/spec-reviewer.md",
        "opencode": ".opencode/agents/spec-reviewer.md"
      },
      "requires": [
        "specPaths",
        "planPaths",
        "sourcePriorityDocs"
      ],
      "profileSlots": [
        "sourcePriorityDocs",
        "specPaths",
        "planPaths",
        "wrapperPolicy"
      ],
      "adoptionNotes": [
        "Use as the pre-implementation gate for meaningful specs and plans.",
        "Keep product-boundary and domain-invariant checks in the adopting project's profile."
      ]
    },
    "test-quality-reviewer": {
      "title": "Test Quality Reviewer",
      "canonicalPath": ".claude/agents/test-quality-reviewer.md",
      "originDoc": "docs/agents/test-quality-reviewer.md",
      "role": "review-only",
      "maturity": "core",
      "packs": [
        "review-core"
      ],
      "hostSupport": {
        "claude": true,
        "codex": true,
        "gemini": true,
        "opencode": true
      },
      "wrapperPaths": {
        "codex": ".codex/agents/test-quality-reviewer.toml",
        "gemini": ".gemini/agents/test-quality-reviewer.md",
        "opencode": ".opencode/agents/test-quality-reviewer.md"
      },
      "requires": [
        "testQualityPolicy"
      ],
      "profileSlots": [
        "sourcePriorityDocs",
        "testQualityPolicy",
        "wrapperPolicy"
      ],
      "adoptionNotes": [
        "Use mode: diff in the implementation review loop.",
        "Use mode: strategy to define project coverage targets, CRAP policy, property-test candidates, mutation-test candidates, and high-impact surfaces."
      ]
    },
    "vigil": {
      "title": "Vigil",
      "canonicalPath": ".claude/agents/vigil.md",
      "originDoc": "docs/agents/vigil.md",
      "role": "governance-review",
      "maturity": "specialized",
      "packs": [
        "governance"
      ],
      "hostSupport": {
        "claude": true,
        "codex": true,
        "gemini": true,
        "opencode": true
      },
      "wrapperPaths": {
        "codex": ".codex/agents/vigil.toml",
        "gemini": ".gemini/agents/vigil.md",
        "opencode": ".opencode/agents/vigil.md"
      },
      "requires": [
        "agentAuditScope",
        "wrapperPolicy"
      ],
      "profileSlots": [
        "sourcePriorityDocs",
        "agentAuditScope",
        "wrapperPolicy"
      ],
      "adoptionNotes": [
        "Install when the repo has enough agent, skill, wrapper, or workflow churn to need a governance reviewer.",
        "Do not use as a generic code reviewer."
      ]
    },
    "visual-implementer": {
      "title": "Visual Implementer",
      "canonicalPath": ".claude/agents/visual-implementer.md",
      "originDoc": "docs/agents/visual-implementer.md",
      "role": "asset-edit",
      "maturity": "specialized",
      "packs": [
        "specialized"
      ],
      "hostSupport": {
        "claude": true,
        "codex": true,
        "gemini": true,
        "opencode": true
      },
      "wrapperPaths": {
        "codex": ".codex/agents/visual-implementer.toml",
        "gemini": ".gemini/agents/visual-implementer.md",
        "opencode": ".opencode/agents/visual-implementer.md"
      },
      "requires": [
        "visualBaseline",
        "sourcePriorityDocs"
      ],
      "profileSlots": [
        "sourcePriorityDocs",
        "visualBaseline",
        "wrapperPolicy"
      ],
      "adoptionNotes": [
        "Install only when the project has approved visual assets, a baseline, and verification commands.",
        "This is edit-capable and should be treated as explicit opt-in."
      ]
    },
    "wiki-maintainer": {
      "title": "Wiki Maintainer",
      "canonicalPath": ".claude/agents/wiki-maintainer.md",
      "originDoc": "docs/agents/wiki-maintainer.md",
      "role": "docs-edit",
      "maturity": "profile-required",
      "packs": [
        "docs-core"
      ],
      "hostSupport": {
        "claude": true,
        "codex": true,
        "gemini": true,
        "opencode": true
      },
      "wrapperPaths": {
        "codex": ".codex/agents/wiki-maintainer.toml",
        "gemini": ".gemini/agents/wiki-maintainer.md",
        "opencode": ".opencode/agents/wiki-maintainer.md"
      },
      "requires": [
        "docsRoot",
        "changeLogPolicy"
      ],
      "profileSlots": [
        "sourcePriorityDocs",
        "docsRoot",
        "changeLogPolicy",
        "wrapperPolicy"
      ],
      "adoptionNotes": [
        "Install once docs updates are part of normal workflow.",
        "Pair with doc-indexer when routing and source discovery become frequent costs."
      ]
    }
  }
}
```

- [ ] **Step 2: Verify JSON parses**

Run:

```powershell
$catalog = Get-Content -Raw -LiteralPath 'marketplace/catalog.json' | ConvertFrom-Json
$catalog.schemaVersion
```

Expected output:

```text
1
```

- [ ] **Step 3: Verify catalog paths and pack relationships**

Run:

```powershell
$catalog = Get-Content -Raw -LiteralPath 'marketplace/catalog.json' | ConvertFrom-Json
$errors = [System.Collections.Generic.List[string]]::new()
foreach ($agentName in $catalog.agents.PSObject.Properties.Name) {
  $agent = $catalog.agents.$agentName
  if (-not (Test-Path -LiteralPath $agent.canonicalPath)) { $errors.Add("missing canonical: $agentName") }
  if (-not (Test-Path -LiteralPath $agent.originDoc)) { $errors.Add("missing origin doc: $agentName") }
  foreach ($wrapper in $agent.wrapperPaths.PSObject.Properties) {
    if (-not (Test-Path -LiteralPath $wrapper.Value)) { $errors.Add("missing wrapper: $agentName/$($wrapper.Name)") }
  }
  foreach ($packName in $agent.packs) {
    if (-not $catalog.packs.PSObject.Properties.Name.Contains($packName)) { $errors.Add("unknown pack on agent: $agentName/$packName") }
  }
}
foreach ($packName in $catalog.packs.PSObject.Properties.Name) {
  foreach ($agentName in $catalog.packs.$packName.agents) {
    if (-not $catalog.agents.PSObject.Properties.Name.Contains($agentName)) { $errors.Add("unknown agent in pack: $packName/$agentName") }
  }
}
if ($errors.Count) { $errors; exit 1 }
'catalog ok'
```

Expected output:

```text
catalog ok
```

- [ ] **Step 4: Commit Task 1**

Run:

```powershell
git add -- marketplace/catalog.json
git commit -m "feat: add agent marketplace catalog"
```

Expected result: commit succeeds and only `marketplace/catalog.json` is included.

## Task 2: Add Marketplace Documentation

**Files:**

- Create: `docs/marketplace/README.md`
- Create: `docs/marketplace/packs.md`
- Create: `docs/marketplace/agent-profiles.md`

- [ ] **Step 1: Create `docs/marketplace/README.md`**

Use this content:

```markdown
# Agent Marketplace

The marketplace is the catalog view of `agent-workshop`: it groups the canonical
agents into adoption packs, names the profile values an adopting project must
fill, and keeps raw copy decisions out of guesswork.

The canonical data lives in [`marketplace/catalog.json`](../../marketplace/catalog.json).
The docs in this directory explain how to read and apply that catalog.

## Start here

1. Pick one or more packs from [`packs.md`](packs.md).
2. Read the origin docs for the agents in each selected pack.
3. Fill the relevant profile slots from [`agent-profiles.md`](agent-profiles.md)
   in the adopting project's `CLAUDE.md`, `AGENTS.md`, and convention docs.
4. Copy the canonical agent specs and host wrappers for the selected agents.
5. Copy required skills separately when an agent depends on a skill-owned workflow.
6. Use the pack in real work, then prune anything that does not earn its keep.

## Marketplace principles

- Canonical agents stay generic.
- Project-specific policy lives in profiles.
- Packs are adoption bundles, not mandatory tiers.
- High-authority or specialized agents require explicit opt-in.
- The catalog is manifest-first, but no installer is implied yet.

## What the marketplace does not do

- It does not install files automatically.
- It does not move canonical specs out of `.claude/agents/`.
- It does not make all agents default.
- It does not encode private project paths or local domain decisions.
```

- [ ] **Step 2: Create `docs/marketplace/packs.md`**

Use this content:

```markdown
# Marketplace Packs

Pack metadata is defined in [`marketplace/catalog.json`](../../marketplace/catalog.json).
This page explains how to choose between packs.

## Review Core

Agents:

- `spec-reviewer`
- `pattern-reviewer`
- `test-quality-reviewer`

Adopt this pack when the project uses a spec-driven loop: design spec, plan,
implementation, and separate review stages.

Profile requirements:

- `sourcePriorityDocs`
- `specPaths`
- `planPaths`
- `patternDomains`
- `testQualityPolicy`
- `wrapperPolicy`

This is the closest thing to a default pack, but it is not universal. Tiny
scripts, throwaway prototypes, and repos without a review loop can omit it.

## Docs Core

Agents:

- `doc-indexer`
- `wiki-maintainer`

Adopt this pack when the project has enough documentation that retrieval,
routing, audit, and diff-driven source-of-truth updates are recurring work.

Profile requirements:

- `sourcePriorityDocs`
- `docsRoot`
- `docRoutingPolicy`
- `changeLogPolicy`
- `wrapperPolicy`

This pack is edit-capable through `wiki-maintainer`, so adopt it deliberately.

## Governance

Agents:

- `vigil`

Adopt this pack when the project has multiple local agents, multiple host
wrappers, or enough workflow-instruction churn that the agent layer itself needs
review.

Profile requirements:

- `sourcePriorityDocs`
- `agentAuditScope`
- `wrapperPolicy`

This pack is not a general code-review pack.

## Specialized

Agents:

- `research`
- `visual-implementer`

Adopt this pack only when the project has the matching workflows.

Profile requirements:

- `sourcePriorityDocs`
- `researchBriefSchema`
- `visualBaseline`
- `wrapperPolicy`

`research` needs a companion skill-owned brief schema. `visual-implementer`
needs a visual baseline, allowed asset surfaces, and verification commands.
```

- [ ] **Step 3: Create `docs/marketplace/agent-profiles.md`**

Use this content:

```markdown
# Agent Profiles

Profiles are the project-specific values that make marketplace agents safe to
adopt without baking local domain rules into the canonical specs.

An adopting project should write profile values into its `CLAUDE.md`,
`AGENTS.md`, and relevant `docs/conventions/` files. A value may be marked
`not-applicable`, but it should not be silently omitted when a selected pack
requires it.

## Profile slots

| Slot | Purpose |
|---|---|
| `sourcePriorityDocs` | Source-of-truth docs the agent should read first. |
| `specPaths` | Where design specs live. |
| `planPaths` | Where implementation plans live. |
| `patternDomains` | Pattern-review modes and their convention docs. |
| `testQualityPolicy` | Coverage target, CRAP policy, property/mutation expectations, and high-impact surfaces. |
| `docsRoot` | Documentation root and source-of-truth hierarchy. |
| `docRoutingPolicy` | When to dispatch `doc-indexer` versus reading directly. |
| `changeLogPolicy` | Whether and where meaningful changes are recorded. |
| `wrapperPolicy` | Host support and canonical-host choice. |
| `visualBaseline` | Approved visual baseline docs and proof requirements. |
| `researchBriefSchema` | Required fields for research dispatch briefs. |
| `agentAuditScope` | Local agent, skill, wrapper, and workflow surfaces `vigil` audits. |

## Example profile fragments

### Product-boundary project

Use for projects where non-goals and safety boundaries are central.

```markdown
profile.specReviewer.productBoundaries:
- local-first
- no hidden remote control
- no cloud orchestration without explicit approval
- source-of-truth state lives under `.project-state/`
```

### Domain-pattern project

Use for projects with multiple implementation surfaces.

```markdown
profile.patternReviewer.patternDomains:
- mode: backend
  docs: docs/conventions/backend.md
- mode: frontend
  docs: docs/conventions/frontend.md
- mode: docs
  docs: docs/conventions/docs.md
```

### High-impact test-quality project

Use for projects where weak tests on core behavior carry higher user or
operational risk.

```markdown
profile.testQualityPolicy:
  coverageTarget: project-defined
  crapTarget: "<= 6 when valid per-method CRAP data exists"
  propertyTesting: parsers, serializers, state transitions, permission matrices
  mutationTesting: targeted critical-path mutation or acceptance mutation
  highImpactSurfaces: terminal command execution, local state migration, billing/accounting, operator-visible status
```

### Documentation-heavy project

Use for projects where docs are source-of-truth, not just notes.

```markdown
profile.docs:
  docsRoot: docs/
  docRoutingPolicy: dispatch doc-indexer for routing, source discovery, and broad audits
  changeLogPolicy: record meaningful workflow, product, and agent-surface changes in docs/change-log.md
```

### Visual project

Use only when the project has approved visual proof artifacts.

```markdown
profile.visualBaseline:
  baselineDoc: docs/assets/current-baseline.md
  allowedSurfaces: approved generated assets, local cleanup, runtime wiring after approval
  proof: screenshot or runtime capture plus artifact path
```
```

- [ ] **Step 4: Verify profile-slot coverage in docs**

Run:

```powershell
$catalog = Get-Content -Raw -LiteralPath 'marketplace/catalog.json' | ConvertFrom-Json
$profiles = Get-Content -Raw -LiteralPath 'docs/marketplace/agent-profiles.md'
$missing = [System.Collections.Generic.List[string]]::new()
foreach ($agentName in $catalog.agents.PSObject.Properties.Name) {
  foreach ($slot in $catalog.agents.$agentName.profileSlots) {
    if ($profiles -notmatch [regex]::Escape($slot)) { $missing.Add("$agentName/$slot") }
  }
}
if ($missing.Count) { $missing; exit 1 }
'profile slots documented'
```

Expected output:

```text
profile slots documented
```

- [ ] **Step 5: Commit Task 2**

Run:

```powershell
git add -- docs/marketplace/README.md docs/marketplace/packs.md docs/marketplace/agent-profiles.md
git commit -m "docs: add marketplace adoption docs"
```

Expected result: commit succeeds and only the three marketplace docs are included.

## Task 3: Link Marketplace Into Existing Docs

**Files:**

- Modify: `README.md`
- Modify: `docs/setup.md`
- Modify: `docs/agents/README.md`
- Modify: `docs/change-log.md`

- [ ] **Step 1: Update `README.md`**

Add a `marketplace/catalog.json` bullet to "What's here" after the wrappers/skills bullets:

```markdown
- `marketplace/catalog.json`: machine-readable catalog of agent packs, maturity labels, role boundaries, host-wrapper support, and project profile slots.
```

Add a marketplace sentence to "How to use it":

```markdown
For pack-based adoption, start with [`docs/marketplace/README.md`](docs/marketplace/README.md) and [`marketplace/catalog.json`](marketplace/catalog.json), then use [`docs/setup.md`](docs/setup.md) for the file-copy mechanics.
```

Update the adoption checklist so step 1 points at the marketplace first:

```markdown
1. Read [`docs/marketplace/README.md`](docs/marketplace/README.md) and choose the smallest pack set that fits your project.
2. Read [`docs/setup.md`](docs/setup.md).
3. Copy the selected `.claude/agents/`, `.claude/skills/`, and host wrappers into your project's repo root.
4. Write your project's own `CLAUDE.md` and `AGENTS.md`. Do not copy this repo's files; they are for maintaining the scaffold itself.
5. Fill the required profile slots in your project docs and workflow instructions.
6. Read the origin docs for the agents and skills you copied. Sanitize any project-specific paths.
7. Drop in the conventions you'll actually use; skip the rest.
8. Use the agents in real work for a few weeks. Keep what earns its keep, prune what doesn't.
```

- [ ] **Step 2: Update `docs/setup.md`**

In "Adoption flow", add this paragraph before "1. Decide which agents and skills earn their keep":

```markdown
If you want a pack-based starting point, read [`docs/marketplace/README.md`](marketplace/README.md) first. The marketplace catalog groups agents into packs and names the profile slots you need to fill before the agents become safe project-local workflow.
```

Then update the starter-set guidance to reference marketplace packs:

```markdown
The marketplace names these common pack choices:

- `review-core` for `spec-reviewer`, `pattern-reviewer`, and `test-quality-reviewer` once you adopt a spec-driven development loop.
- `docs-core` for `doc-indexer` and `wiki-maintainer` once docs routing and source-of-truth maintenance are recurring work.
- `governance` for `vigil` when the agent/skill/wrapper layer itself needs review.
- `specialized` for `research` and `visual-implementer` only when those workflows exist.
```

- [ ] **Step 3: Update `docs/agents/README.md`**

Add a marketplace paragraph after the intro:

```markdown
Marketplace pack metadata lives in [`../../marketplace/catalog.json`](../../marketplace/catalog.json), with operator-facing guidance in [`../marketplace/`](../marketplace/). The roster below explains agent roles; the marketplace explains adoption bundles and required project profiles.
```

Replace the roster table with this pack-aware table:

```markdown
| Agent | Pack | One-line role |
|---|---|---|
| [`wiki-maintainer`](wiki-maintainer.md) | `docs-core` | Repo-local documentation owner; diff-driven by default, audit-mode on request. |
| [`doc-indexer`](doc-indexer.md) | `docs-core` | Routing and audit helper; reduces context burden on `wiki-maintainer`. |
| [`pattern-reviewer`](pattern-reviewer.md) | `review-core` | Diff-driven implementation-pattern compliance check after code-quality review. |
| [`spec-reviewer`](spec-reviewer.md) | `review-core` | Pre-implementation gate for design specs and implementation plans. |
| [`test-quality-reviewer`](test-quality-reviewer.md) | `review-core` | Test-code trustworthiness, risk coverage, and test-strategy review; diff, audit, and strategy modes. |
| [`research`](research.md) | `specialized` | Forward-looking research notes with structured scoring; dispatched by the `research` skill. |
| [`vigil`](vigil.md) | `governance` | Advisory review of the agent / skill / workflow-instruction layer itself. |
| [`visual-implementer`](visual-implementer.md) | `specialized` | Execution agent for approved AI-generated visual assets. |
```

- [ ] **Step 4: Update `docs/change-log.md`**

Add this entry at the top of the `2026-05-23` section:

```markdown
### Manifest-backed agent marketplace

Added a marketplace layer for pack-based adoption. The new catalog defines initial agent packs (`review-core`, `docs-core`, `governance`, `specialized`), role and maturity labels, host-wrapper support, prerequisites, and project profile slots. Marketplace docs explain pack selection and keep project-specific behavior in profiles rather than canonical agent specs.
```

- [ ] **Step 5: Verify links and diff cleanliness**

Run:

```powershell
rg -n "marketplace/catalog.json|docs/marketplace|review-core|docs-core|governance|specialized" README.md docs/setup.md docs/agents/README.md docs/change-log.md
git diff --check
```

Expected result:

```text
# rg prints matching references in all four files.
# git diff --check prints nothing and exits 0.
```

- [ ] **Step 6: Commit Task 3**

Run:

```powershell
git add -- README.md docs/setup.md docs/agents/README.md docs/change-log.md
git commit -m "docs: surface marketplace adoption flow"
```

Expected result: commit succeeds and only the four docs are included.

## Task 4: Final Verification

**Files:**

- Verify: all files touched by Tasks 1-3.

- [ ] **Step 1: Run full catalog validation**

Run:

```powershell
$catalog = Get-Content -Raw -LiteralPath 'marketplace/catalog.json' | ConvertFrom-Json
$profiles = Get-Content -Raw -LiteralPath 'docs/marketplace/agent-profiles.md'
$errors = [System.Collections.Generic.List[string]]::new()
foreach ($agentName in $catalog.agents.PSObject.Properties.Name) {
  $agent = $catalog.agents.$agentName
  if (-not (Test-Path -LiteralPath $agent.canonicalPath)) { $errors.Add("missing canonical: $agentName") }
  if (-not (Test-Path -LiteralPath $agent.originDoc)) { $errors.Add("missing origin doc: $agentName") }
  foreach ($wrapper in $agent.wrapperPaths.PSObject.Properties) {
    if (-not (Test-Path -LiteralPath $wrapper.Value)) { $errors.Add("missing wrapper: $agentName/$($wrapper.Name)") }
  }
  foreach ($packName in $agent.packs) {
    if (-not $catalog.packs.PSObject.Properties.Name.Contains($packName)) { $errors.Add("unknown pack on agent: $agentName/$packName") }
  }
  foreach ($slot in $agent.profileSlots) {
    if ($profiles -notmatch [regex]::Escape($slot)) { $errors.Add("profile slot undocumented: $agentName/$slot") }
  }
}
foreach ($packName in $catalog.packs.PSObject.Properties.Name) {
  foreach ($agentName in $catalog.packs.$packName.agents) {
    if (-not $catalog.agents.PSObject.Properties.Name.Contains($agentName)) { $errors.Add("unknown agent in pack: $packName/$agentName") }
  }
}
if ($errors.Count) { $errors; exit 1 }
'marketplace validation ok'
```

Expected output:

```text
marketplace validation ok
```

- [ ] **Step 2: Run repository checks**

Run:

```powershell
git diff --check
git status --short
```

Expected output:

```text
# git diff --check prints nothing.
# git status --short prints nothing after Task 3 commit.
```

- [ ] **Step 3: Review final commit stack**

Run:

```powershell
git log --oneline -4
```

Expected result: the latest commits include:

```text
docs: surface marketplace adoption flow
docs: add marketplace adoption docs
feat: add agent marketplace catalog
docs: design agent marketplace
```

## Self-Review Checklist

- [ ] The plan implements every acceptance criterion in `docs/decisions/agent-marketplace.md`.
- [ ] No installer, service, runtime dependency, or dev dependency is added.
- [ ] All eight canonical agents appear in `marketplace/catalog.json`.
- [ ] Every profile slot in the catalog is documented in `docs/marketplace/agent-profiles.md`.
- [ ] Existing setup docs route adopters through pack selection before raw copying.
- [ ] The implementation changes metadata and docs only; canonical agent behavior stays unchanged.
