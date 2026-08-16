# reviewers Plugin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a second Claude Code marketplace plugin, `reviewers`, that ships four curated standalone-capable agents (`spec-reviewer`, `test-quality-reviewer`, `vigil`, `pattern-reviewer`) as active plugin agents (no onboarding skill) and enhance `pattern-reviewer` with a discovery/inference fallback so it works in repos with no domain layout.

**Architecture:** The four shipped agent files are byte-identical copies of the canonical `.claude/agents/<name>.md` specs (single source of truth, enforced by the validator). The `pattern-reviewer` enhancement is folded into the canonical spec and rippled to its origin doc and the onboarding plugin's bundled reference mirrors. A second entry is added to the existing `.claude-plugin/marketplace.json`, and `scripts/validate-native-plugin.ps1` is extended to validate the new plugin and the two-plugin marketplace. Claude Code is the only delivery host this slice.

**Tech Stack:** Markdown agent specs, JSON manifests, PowerShell validator, `claude plugin validate` CLI.

**Spec:** `docs/decisions/agent-workshop-direct-use-agents-plugin.md`

**Commit policy for this plan:** Stay on `main`; do **not** create branches or worktrees. Do **not** commit: the working tree has unrelated uncommitted mid-refactor changes; committing is deferred to the operator. Each task's "done" gate is the validator, not a commit.

---

## File Structure

**Modify (canonical sources + their enforced mirrors):**
- `.claude/agents/pattern-reviewer.md`: add discovery mode
- `docs/agents/pattern-reviewer.md`: origin doc: document discovery mode
- `marketplace/catalog.json`: add an adoption note to the `pattern-reviewer` entry
- Onboarding reference mirrors (kept byte-identical by the existing validator), both the root copy and the codex payload copy:
  - `skills/agent-workshop-onboard/references/agents/pattern-reviewer.md`
  - `plugins/agent-workshop/skills/agent-workshop-onboard/references/agents/pattern-reviewer.md`
  - `skills/agent-workshop-onboard/references/docs/agents/pattern-reviewer.md`
  - `plugins/agent-workshop/skills/agent-workshop-onboard/references/docs/agents/pattern-reviewer.md`
  - `skills/agent-workshop-onboard/references/catalog.json`
  - `plugins/agent-workshop/skills/agent-workshop-onboard/references/catalog.json`
- `.claude-plugin/marketplace.json`: add second plugin entry
- `scripts/validate-native-plugin.ps1`: validate the new plugin + two-plugin marketplace
- `README.md`: two-plugin overview
- `docs/marketplace/README.md`: two-plugin path
- `docs/change-log.md`: landing entry (via change-log skill)

**Create (the new plugin payload):**
- `plugins/reviewers/.claude-plugin/plugin.json`
- `plugins/reviewers/agents/spec-reviewer.md`
- `plugins/reviewers/agents/test-quality-reviewer.md`
- `plugins/reviewers/agents/vigil.md`
- `plugins/reviewers/agents/pattern-reviewer.md`
- `plugins/reviewers/README.md`

**Mirror-sync rule (applies whenever a canonical source changes):** the onboarding reference copies must stay byte-identical to their source. Always sync by copying the whole file, never by re-editing the mirror:
```powershell
Copy-Item -LiteralPath <source> -Destination <mirror> -Force
```

---

## Task 1: Enhance `pattern-reviewer` canonical spec + sync onboarding reference mirror

**Files:**
- Modify: `.claude/agents/pattern-reviewer.md`
- Sync: `skills/agent-workshop-onboard/references/agents/pattern-reviewer.md`
- Sync: `plugins/agent-workshop/skills/agent-workshop-onboard/references/agents/pattern-reviewer.md`

- [ ] **Step 1: Update Primary workflow step 6**

In `.claude/agents/pattern-reviewer.md`, replace the step-6 line:

```
6. Record any changed files outside the active review domains as not reviewed by this mode. If changed files match no defined domain at all, raise a coverage gap rather than a clean pass (see Domain coverage gaps).
```

with:

```
6. Record any changed files outside the active review domains as not reviewed by this mode. If changed files match no defined domain at all, raise a coverage gap rather than a clean pass (see Domain coverage gaps). If the project defines no domain layout at all, use Discovery mode (see the Discovery mode section) instead of a blanket coverage gap.
```

- [ ] **Step 2: Add a distinguishing note to the Domain coverage gaps section**

Immediately after the line `A mandated review stage must never silently no-op on a surface it did not examine.` insert this paragraph:

```
This rule covers the case where a domain layout *exists* but does not reach some changed files. When the project defines **no domain layout at all** (no domain map and no convention docs anywhere) use Discovery mode instead (see the Discovery mode section) and fall back to discovered or inferred conventions rather than gapping every file.
```

- [ ] **Step 3: Insert the Discovery mode section**

Insert this entire section between the end of the `## Domain coverage gaps` section and the `## Primary workflow` heading:

```markdown
## Discovery mode (no documented domain layout)

The Domain coverage gaps rule assumes the project *has* a domain layout and some
surface falls outside it. A different case is a project with **no domain layout at
all**: no `CLAUDE.md` / `AGENTS.md` domain map and no `docs/conventions/<domain>/`
structure. There, refusing to review anything is unhelpful for a diff that clearly
follows some de-facto convention.

When, and only when, the project defines no domain layout and no convention docs
are discoverable, fall back to discovery mode instead of a blanket coverage gap:

1. **Discover documented conventions anywhere.** Look for convention or pattern
   docs outside the prescribed layout: `docs/` files whose names or headings
   describe conventions, style, architecture, or patterns. If found, treat them as
   the convention source for this review and note where they live.
2. **Infer from sibling files.** If no convention docs exist, infer the de-facto
   conventions from the closest sibling files to those changed: the established
   files in the same directory or module that the diff should resemble. Review the
   changed files for consistency with those inferred patterns: naming, folder
   placement, type-shape choices, import/layer boundaries, and test-file presence.
3. **Label confidence honestly.** Mark discovery-mode findings as **inferred
   (lower confidence)**. Inference is weaker evidence than a documented rule; say so
   in the report.
4. **Still surface the gap as an observation.** Report that the project documents
   no conventions, so this review relied on discovery/inference, and recommend the
   project add a domain layout and a `docs/conventions/<domain>/` surface so future
   reviews are grounded in documented rules.

Discovery mode preserves the no-silent-false-confidence principle: it never emits a
clean `pattern compliant` verdict on an unexamined surface. It examines, infers,
labels the confidence, and names the missing documentation. It is a fallback used only
when no domain layout exists. Otherwise, the standard documented-domain behavior and the
Domain coverage gaps rule apply unchanged.
```

- [ ] **Step 4: Sync the two onboarding reference mirrors**

Run:

```powershell
Copy-Item -LiteralPath ".claude/agents/pattern-reviewer.md" -Destination "skills/agent-workshop-onboard/references/agents/pattern-reviewer.md" -Force
Copy-Item -LiteralPath ".claude/agents/pattern-reviewer.md" -Destination "plugins/agent-workshop/skills/agent-workshop-onboard/references/agents/pattern-reviewer.md" -Force
```

- [ ] **Step 5: Verify the validator still passes**

Run: `pwsh -NoProfile -File ./scripts/validate-native-plugin.ps1`
Expected: `native plugin validation ok` (the mirrors match canonical again).

Run: `claude plugin validate .`
Expected: `✔ Validation passed`

---

## Task 2: Update `pattern-reviewer` origin doc + sync mirrors

**Files:**
- Modify: `docs/agents/pattern-reviewer.md`
- Sync: `skills/agent-workshop-onboard/references/docs/agents/pattern-reviewer.md`
- Sync: `plugins/agent-workshop/skills/agent-workshop-onboard/references/docs/agents/pattern-reviewer.md`

- [ ] **Step 1: Add a Discovery mode section to the origin doc**

In `docs/agents/pattern-reviewer.md`, insert this section immediately after the `## Solution shape` section (before `## Real workflow snippet`):

```markdown
## Discovery mode (standalone / no domain layout)

The canonical spec assumes the project defines domains and `docs/conventions/<domain>/`
docs. That assumption breaks when the agent runs in a repo with no domain layout at
all, for example when it is installed as a direct-use plugin agent (see the
`reviewers` plugin) rather than adopted into a project that has done
the profile work.

Discovery mode is the fallback for that case: discover convention docs anywhere
under `docs/`, and if none exist, infer the de-facto conventions from the closest
sibling files to those changed, reviewing against those inferred patterns. Findings
are labelled **inferred (lower confidence)**, and the agent still reports that no
conventions are documented and recommends adding them.

This is additive. It does not weaken the strict documented-domain behavior, when a
domain layout exists, the Domain coverage gaps rule still applies and a clean pass on
an unexamined surface is still forbidden. Discovery mode only changes the "no layout
at all" case from "review nothing" to "review against inferred conventions, clearly
labelled."
```

- [ ] **Step 2: Add an adaptation note**

In `docs/agents/pattern-reviewer.md`, append this bullet to the end of the `## Adaptation notes` list:

```
- Discovery mode lets the agent be useful in a repo with no domain layout (e.g. direct-use plugin installs). It is a labelled, lower-confidence fallback, not a substitute for documenting conventions. The moment the project documents domains and `docs/conventions/<domain>/` files, the agent uses those instead.
```

- [ ] **Step 3: Sync the two onboarding reference doc mirrors**

Run:

```powershell
Copy-Item -LiteralPath "docs/agents/pattern-reviewer.md" -Destination "skills/agent-workshop-onboard/references/docs/agents/pattern-reviewer.md" -Force
Copy-Item -LiteralPath "docs/agents/pattern-reviewer.md" -Destination "plugins/agent-workshop/skills/agent-workshop-onboard/references/docs/agents/pattern-reviewer.md" -Force
```

- [ ] **Step 4: Verify the validator still passes**

Run: `pwsh -NoProfile -File ./scripts/validate-native-plugin.ps1`
Expected: `native plugin validation ok`

---

## Task 3: Add catalog note for `pattern-reviewer` + sync mirrors

**Files:**
- Modify: `marketplace/catalog.json`
- Sync: `skills/agent-workshop-onboard/references/catalog.json`
- Sync: `plugins/agent-workshop/skills/agent-workshop-onboard/references/catalog.json`

- [ ] **Step 1: Add an adoption note to the pattern-reviewer entry**

In `marketplace/catalog.json`, the `agents.pattern-reviewer.adoptionNotes` array currently is:

```json
      "adoptionNotes": [
        "Do not install as a real gate until the project defines domain modes and convention docs.",
        "The agent is portable because project-specific anti-patterns live in the project profile."
      ]
```

Replace it with (adds a third note; keep the existing two unchanged):

```json
      "adoptionNotes": [
        "Do not install as a real gate until the project defines domain modes and convention docs.",
        "The agent is portable because project-specific anti-patterns live in the project profile.",
        "A discovery/inference fallback lets it review with reduced confidence when no domain layout exists; full domain-aware gating still requires convention docs."
      ]
```

- [ ] **Step 2: Sync the two onboarding reference catalog mirrors**

Run:

```powershell
Copy-Item -LiteralPath "marketplace/catalog.json" -Destination "skills/agent-workshop-onboard/references/catalog.json" -Force
Copy-Item -LiteralPath "marketplace/catalog.json" -Destination "plugins/agent-workshop/skills/agent-workshop-onboard/references/catalog.json" -Force
```

- [ ] **Step 3: Verify the validator still passes**

Run: `pwsh -NoProfile -File ./scripts/validate-native-plugin.ps1`
Expected: `native plugin validation ok`

---

## Task 4: Create the `reviewers` plugin payload

**Files:**
- Create: `plugins/reviewers/.claude-plugin/plugin.json`
- Create: `plugins/reviewers/agents/spec-reviewer.md`
- Create: `plugins/reviewers/agents/test-quality-reviewer.md`
- Create: `plugins/reviewers/agents/vigil.md`
- Create: `plugins/reviewers/agents/pattern-reviewer.md`
- Create: `plugins/reviewers/README.md`

> Run Task 4 **after** Task 1, so the copied `pattern-reviewer.md` carries the discovery-mode enhancement.

- [ ] **Step 1: Confirm graceful degradation of the three faithful agents**

Before copying, read each of `.claude/agents/spec-reviewer.md`, `.claude/agents/test-quality-reviewer.md`, `.claude/agents/vigil.md` and confirm none contains a hard refuse-if-no-profile gate (i.e. each can produce a useful review when its profile slots are absent: pointed at a spec/plan, a test diff, or an agent layer respectively). If any does hard-fail without a profile, note it in the task result and stop for operator input rather than shipping a broken agent.

- [ ] **Step 2: Write the plugin manifest**

Create `plugins/reviewers/.claude-plugin/plugin.json`:

```json
{
  "name": "reviewers",
  "description": "Curated standalone review and governance agents from Agent Workshop, usable directly without onboarding.",
  "version": "0.1.0",
  "author": { "name": "Agent Workshop" },
  "homepage": "https://github.com/giostriquer/agent-workshop",
  "repository": "https://github.com/giostriquer/agent-workshop",
  "license": "MIT",
  "keywords": ["agents", "code-review", "governance", "spec-review", "test-quality"]
}
```

- [ ] **Step 3: Copy the four curated agents byte-for-byte**

Copy (do not retype) each canonical spec into the plugin's `agents/` directory:

```powershell
New-Item -ItemType Directory -Force -Path "plugins/reviewers/agents" | Out-Null
Copy-Item -LiteralPath ".claude/agents/spec-reviewer.md"          -Destination "plugins/reviewers/agents/spec-reviewer.md" -Force
Copy-Item -LiteralPath ".claude/agents/test-quality-reviewer.md"  -Destination "plugins/reviewers/agents/test-quality-reviewer.md" -Force
Copy-Item -LiteralPath ".claude/agents/vigil.md"                  -Destination "plugins/reviewers/agents/vigil.md" -Force
Copy-Item -LiteralPath ".claude/agents/pattern-reviewer.md"       -Destination "plugins/reviewers/agents/pattern-reviewer.md" -Force
```

- [ ] **Step 4: Write the plugin README**

Create `plugins/reviewers/README.md`:

```markdown
# reviewers

Direct-use Claude Code plugin from [Agent Workshop](https://github.com/giostriquer/agent-workshop).

Install this plugin when you want to **use** a curated set of Agent Workshop's
review and governance agents directly, without running the onboarding/adoption
flow. It ships only agents that work standalone in an arbitrary repo, with no
project profile slots to fill.

This is the counterpart to the `agent-workshop` plugin, whose `agent-workshop-onboard`
skill instead helps you adopt repo-local agent scaffolding into a project. That
onboarding skill is intentionally **not** part of this plugin.

## Agents

Installed agents are namespaced under the plugin, e.g. `reviewers:spec-reviewer`.

- **spec-reviewer**: pre-implementation review of a spec or plan you point it at.
- **test-quality-reviewer**: reviews a test diff for trustworthiness, risk coverage, and test design.
- **pattern-reviewer**: reviews a diff for implementation-pattern conformance. In a
  repo with no documented domain layout it falls back to discovery mode: it discovers
  convention docs under `docs/` or infers conventions from sibling files, labelling
  findings as lower-confidence.
- **vigil**: read-only governance review of a repo's agent / skill / wrapper layer.

## Not included

The profile-dependent and edit-capable agents (`doc-indexer`, `wiki-maintainer`,
`visual-implementer`, `research`) are not shipped here; they need project-specific
configuration or an approved baseline and belong to the onboarding adoption path.
```

- [ ] **Step 5: Verify the plugin payload validates**

Run: `claude plugin validate ./plugins/reviewers`
Expected: `✔ Validation passed`

Run (confirm byte-identity of all four against canonical):

```powershell
foreach ($n in "spec-reviewer","test-quality-reviewer","vigil","pattern-reviewer") {
  $a = Get-Content -Raw ".claude/agents/$n.md"
  $b = Get-Content -Raw "plugins/reviewers/agents/$n.md"
  if (($a -replace "`r`n","`n") -ne ($b -replace "`r`n","`n")) { Write-Output "DRIFT: $n" } else { Write-Output "OK: $n" }
}
```
Expected: `OK:` for all four.

Run (confirm no skills dir leaked into the plugin):

```powershell
if (Test-Path "plugins/reviewers/skills") { Write-Output "FAIL: skills dir present" } else { Write-Output "OK: no skills dir" }
```
Expected: `OK: no skills dir`

---

## Task 5: Add the second marketplace entry

**Files:**
- Modify: `.claude-plugin/marketplace.json`

- [ ] **Step 1: Add the reviewers entry to the plugins array**

In `.claude-plugin/marketplace.json`, the `plugins` array currently holds one entry. Add a second entry so the array reads:

```json
  "plugins": [
    {
      "name": "agent-workshop",
      "version": "0.1.1",
      "source": "./plugins/agent-workshop",
      "description": "Onboard repo-local agent scaffolding with one guided skill",
      "author": { "name": "Agent Workshop" }
    },
    {
      "name": "reviewers",
      "version": "0.1.0",
      "source": "./plugins/reviewers",
      "description": "Use a curated set of standalone review and governance agents directly, without onboarding.",
      "author": { "name": "Agent Workshop" }
    }
  ]
```

- [ ] **Step 2: Verify the real loader accepts the two-plugin marketplace**

Run: `claude plugin validate .`
Expected: `✔ Validation passed`

(The PowerShell validator will fail at this point because it still expects exactly one plugin: Task 6 fixes that.)

---

## Task 6: Extend `scripts/validate-native-plugin.ps1`

**Files:**
- Modify: `scripts/validate-native-plugin.ps1`

- [ ] **Step 1: Read the reviewers manifest alongside the other manifests**

After the existing `$catalog = Read-JsonFile "marketplace/catalog.json"` line, add:

```powershell
$reviewersManifest = Read-JsonFile "plugins/reviewers/.claude-plugin/plugin.json"
```

- [ ] **Step 2: Replace the single-plugin marketplace assertion with a two-plugin, lookup-by-name assertion**

Replace this block:

```powershell
if ($claudeMarketplace.plugins.Count -ne 1 -or $claudeMarketplace.plugins[0].name -ne "agent-workshop") {
    Fail "Claude marketplace must contain only the agent-workshop plugin"
}
if ($claudeMarketplace.plugins[0].source -ne "./plugins/agent-workshop") {
    Fail "Claude marketplace source must be ./plugins/agent-workshop"
}
if ($claudeMarketplace.plugins[0].version -ne $claudeManifest.version) {
    Fail "Claude marketplace version must match the plugin manifest"
}
```

with:

```powershell
$claudePlugins = @($claudeMarketplace.plugins)
if ($claudePlugins.Count -ne 2) {
    Fail "Claude marketplace must contain exactly two plugins (agent-workshop, reviewers)"
}
$onboardEntry = $claudePlugins | Where-Object { $_.name -eq "agent-workshop" }
$reviewersEntry = $claudePlugins | Where-Object { $_.name -eq "reviewers" }
if (-not $onboardEntry) {
    Fail "Claude marketplace must contain the agent-workshop plugin"
}
if (-not $reviewersEntry) {
    Fail "Claude marketplace must contain the reviewers plugin"
}
if ($onboardEntry.source -ne "./plugins/agent-workshop") {
    Fail "agent-workshop marketplace source must be ./plugins/agent-workshop"
}
if ($onboardEntry.version -ne $claudeManifest.version) {
    Fail "agent-workshop marketplace version must match the plugin manifest"
}
if ($reviewersEntry.source -ne "./plugins/reviewers") {
    Fail "reviewers marketplace source must be ./plugins/reviewers"
}
if ($reviewersEntry.version -ne $reviewersManifest.version) {
    Fail "reviewers marketplace version must match its plugin manifest"
}
```

- [ ] **Step 3: Add a reviewers-plugin assertion function**

Add this function near the other `Assert-*` functions (e.g. after `Assert-OnlyAllowedPluginAgents`):

```powershell
function Assert-ReviewersPlugin {
    $root = "plugins/reviewers"
    $manifest = Read-JsonFile "$root/.claude-plugin/plugin.json"

    if ($manifest.name -ne "reviewers") {
        Fail "reviewers plugin name must be reviewers"
    }
    if (Has-Property $manifest "mcpServers") {
        Fail "reviewers manifest must not contain mcpServers"
    }
    if (Test-Path -LiteralPath "$root/skills" -PathType Container) {
        Fail "reviewers must not contain a skills directory"
    }

    $agentDir = "$root/agents"
    if (-not (Test-Path -LiteralPath $agentDir -PathType Container)) {
        Fail "reviewers must contain an agents directory"
    }

    $expected = @("pattern-reviewer.md", "spec-reviewer.md", "test-quality-reviewer.md", "vigil.md")
    $actual = @(Get-ChildItem -LiteralPath $agentDir -File | Select-Object -ExpandProperty Name | Sort-Object)
    Assert-SameFileList $expected $actual "reviewers agents"

    foreach ($name in $expected) {
        Assert-SameFile ".claude/agents/$name" "$agentDir/$name"
    }
}
```

- [ ] **Step 4: Call the new function**

After the existing `Assert-OnlyAllowedPluginAgents` call (in the call block near the bottom, before the reference-set assertions), add:

```powershell
Assert-ReviewersPlugin
```

- [ ] **Step 5: Verify both validators pass**

Run: `pwsh -NoProfile -File ./scripts/validate-native-plugin.ps1`
Expected: `native plugin validation ok`

Run: `claude plugin validate .`
Expected: `✔ Validation passed`

---

## Task 7: Update top-level docs for the two-plugin marketplace

**Files:**
- Modify: `README.md`
- Modify: `docs/marketplace/README.md`

- [ ] **Step 1: README: add the new plugin to "What's here"**

In `README.md`, immediately after the bullet that begins ``- `plugins/agent-workshop/` and `skills/agent-workshop-onboard/``` , add:

```markdown
- `plugins/reviewers/`: a second Claude Code plugin that ships four standalone-capable agents (`spec-reviewer`, `test-quality-reviewer`, `pattern-reviewer`, `vigil`) as active plugin agents for direct use, with no onboarding skill. For people who want to use the agents without adopting the scaffold into a project. See [`docs/marketplace/README.md`](docs/marketplace/README.md).
```

- [ ] **Step 2: README: note the direct-use path under "How to use it"**

In `README.md`, immediately after the paragraph beginning `Start with the native onboarding plugin when your host supports it.` add:

```markdown
If instead you just want to *use* a few agents directly without adopting anything into a project, install the `reviewers` plugin. It exposes a curated, standalone-capable set (`spec-reviewer`, `test-quality-reviewer`, `pattern-reviewer`, `vigil`) as active plugin agents and includes no onboarding skill.
```

- [ ] **Step 3: docs/marketplace/README: describe the two plugins**

In `docs/marketplace/README.md`, immediately after the paragraph beginning `For Claude Code and Codex, the preferred guided path is the native plugin` add:

```markdown
The marketplace ships two Claude Code plugins for two different intents:

- **`agent-workshop`** (bootstrapper): exposes only `agent-workshop-onboard`, a
  skill that plans and applies repo-local agent adoption. Use this to adopt the
  scaffold into a project.
- **`reviewers`** (direct use): ships a curated set of
  standalone-capable agents (`spec-reviewer`, `test-quality-reviewer`,
  `pattern-reviewer`, `vigil`) as active plugin agents, with no onboarding skill.
  Use this to run those agents directly in any repo without adopting anything.

The onboarding skill is exclusive to the bootstrapper; the curated agents are
exclusive to the direct-use plugin. They do not overlap.
```

- [ ] **Step 4: Sync the `docs/marketplace/README.md` reference mirrors**

`docs/marketplace/` is part of the onboarding plugin's bundled reference set, so the validator requires its two mirrors to stay byte-identical to the source. `README.md` (repo root) is NOT mirrored, but `docs/marketplace/README.md` is. After Step 3, run:

```powershell
Copy-Item -LiteralPath "docs/marketplace/README.md" -Destination "skills/agent-workshop-onboard/references/docs/marketplace/README.md" -Force
Copy-Item -LiteralPath "docs/marketplace/README.md" -Destination "plugins/agent-workshop/skills/agent-workshop-onboard/references/docs/marketplace/README.md" -Force
```

- [ ] **Step 5: Verify links and structure**

Run: `pwsh -NoProfile -File ./scripts/validate-native-plugin.ps1`
Expected: `native plugin validation ok` (this DOES check the `docs/marketplace/` mirror parity, so the Step 4 sync is required).

Run: `claude plugin validate .`
Expected: `✔ Validation passed`

Read both files back and confirm the inserted sections render and the surrounding text still flows.

---

## Task 8: Record the change in the change log

**Files:**
- Modify: `docs/change-log.md`

- [ ] **Step 1: Add a change-log entry via the change-log skill**

Invoke the `change-log` skill to record: the new `reviewers` direct-use plugin (curated set: `spec-reviewer`, `test-quality-reviewer`, `pattern-reviewer`, `vigil`), the `pattern-reviewer` discovery-mode enhancement folded into the canonical spec, the marketplace going from one to two plugins, and the validator extension. Reference the decision doc `docs/decisions/agent-workshop-direct-use-agents-plugin.md`.

- [ ] **Step 2: Final full verification**

Run: `pwsh -NoProfile -File ./scripts/validate-native-plugin.ps1`
Expected: `native plugin validation ok`

Run: `claude plugin validate .`
Expected: `✔ Validation passed`

Run: `claude plugin validate ./plugins/reviewers`
Expected: `✔ Validation passed`

---

## Self-Review

**Spec coverage:** Goal (curated 4-agent direct-use plugin) → Tasks 4–6. No onboarding skill in plugin → Task 4 (no skills dir) + Task 6 (asserts no skills dir). Curated set membership → Task 4 + Task 6 (exactly four). Pattern-reviewer enhancement folded into canonical → Task 1; origin doc → Task 2; catalog note → Task 3; onboarding reference re-sync → Tasks 1–3 sync steps. Byte-identical source of truth → Task 4 copy + Task 6 `Assert-SameFile`. Marketplace two entries → Task 5 + Task 6 assertion. Validator extension → Task 6. Claude-only (no Codex/Gemini/OpenCode delivery) → no host-wrapper tasks; Codex marketplace untouched. Docs → Task 7. Change-log → Task 8. Graceful-degradation acceptance criterion → Task 4 Step 1. All spec sections map to a task.

**Placeholder scan:** No TBD/TODO/"handle edge cases"; every edit shows exact before/after text or exact file content; every verification names the command and expected output.

**Type/name consistency:** Plugin name `reviewers` and version `0.1.0` are identical in the manifest (Task 4), the marketplace entry (Task 5), and the validator (Task 6). The four agent filenames are identical across Task 4 copy, Task 6 `$expected`, and the READMEs. Mirror paths in the File Structure list match the sync commands in Tasks 1–3.
