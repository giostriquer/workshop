# handoff-pr + handoff-review Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship two direct-use handoff skills (`handoff-review` (produces a self-contained, unbiased review brief) and `handoff-pr` (produces a structured PR artifact for an authorized session)) through the existing `reviewers` marketplace plugin.

**Architecture:** Each skill is a single `SKILL.md` authored once as canonical at `.claude/skills/<name>/SKILL.md`, then mirrored byte-identical to its host ports, the `reviewers` plugin payload, and two onboard reference roots. Both are pure prompt artifacts: neither runs the downstream action (review tools / `gh pr create`). The `reviewers` plugin's "agents-only, no skills" invariant is consciously loosened in its validator and README.

**Tech Stack:** Markdown skill files, PowerShell validator (`scripts/validate-native-plugin.ps1`), JSON plugin manifests. No code/runtime.

**Spec:** `docs/decisions/handoff-skills.md`.

---

## File map (the validator enforces this exact set)

Per skill `<name>` ∈ {`handoff-review`, `handoff-pr`}: **9 git-tracked files**:

| # | Path | Content |
|---|------|---------|
| 1 | `.claude/skills/<name>/SKILL.md` | **canonical source** |
| 2 | `.codex/skills/<name>/SKILL.md` | == #1 (cmp-verified) |
| 3 | `.gemini/skills/<name>/SKILL.md` | == #1 (cmp-verified) |
| 4 | `plugins/reviewers/skills/<name>/SKILL.md` | == #1 (validator-enforced) |
| 5 | `skills/agent-workshop-onboard/references/skills/<name>.md` | == #1, **flat file** (validator-enforced) |
| 6 | `plugins/agent-workshop/skills/agent-workshop-onboard/references/skills/<name>.md` | == #1, flat (validator-enforced) |
| 7 | `docs/skills/<name>.md` | **origin doc source** |
| 8 | `skills/agent-workshop-onboard/references/docs/skills/<name>.md` | == #7 (validator-enforced) |
| 9 | `plugins/agent-workshop/skills/agent-workshop-onboard/references/docs/skills/<name>.md` | == #7 (validator-enforced) |

Files #2, #3, #4, #5, #6 are byte-identical to #1. Files #8, #9 are byte-identical to #7.

Shared, edited once (not per-skill):

- `docs/skills/README.md` + its two reference mirrors (`.../references/docs/skills/README.md` in both roots): roster 6 → 8.
- `scripts/validate-native-plugin.ps1`: loosen the reviewers skills assertion.
- `plugins/reviewers/README.md`: broaden identity.
- `plugins/reviewers/.claude-plugin/plugin.json`: version 0.2.0 → 0.3.0 (+ `handoff` keyword).
- `.claude-plugin/marketplace.json`: reviewers version → 0.3.0 (must match manifest).
- `docs/decisions/handoff-skills.md`: status Draft → Implemented (on landing).
- `docs/change-log.md`: entry via `change-log` skill.

**Byte-identity rule for the whole plan:** produce mirror copies with `Copy-Item`, never by retyping. The validator does CRLF-normalized content comparison; `Copy-Item` is the safe path.

**Base branch / trailer:** assume the PR base is `main` unless the repo says otherwise. End every commit message with the repo's standard trailer:
`Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`

---

## Task 1: Author `handoff-review` (canonical + all mirrors except the reviewers plugin copy)

End state: `scripts/validate-native-plugin.ps1` prints `native plugin validation ok`.

**Files:**
- Create: `.claude/skills/handoff-review/SKILL.md`
- Create: `docs/skills/handoff-review.md`
- Create (by copy): `.codex/skills/handoff-review/SKILL.md`, `.gemini/skills/handoff-review/SKILL.md`, `skills/agent-workshop-onboard/references/skills/handoff-review.md`, `plugins/agent-workshop/skills/agent-workshop-onboard/references/skills/handoff-review.md`, `skills/agent-workshop-onboard/references/docs/skills/handoff-review.md`, `plugins/agent-workshop/skills/agent-workshop-onboard/references/docs/skills/handoff-review.md`

- [ ] **Step 1: Write the canonical skill file** `.claude/skills/handoff-review/SKILL.md` with exactly this content:

```markdown
---
name: handoff-review
description: Use when implementation on a branch is done (or mid-way) and you want a fresh, unbiased review before opening a PR. Produces a self-contained review brief (task-vs-code, rules conformance, information leak, correctness) for a separate agent or session to run. Default mode spawns a fresh reviewer; handoff mode writes the brief to a scratch file for a new session.
---

# Handoff Review

Produce a **self-contained, unbiased review brief** for a separate agent or session to run before a PR is opened. This skill writes the brief; it does **not** perform the review and does **not** prescribe which tools the reviewer uses: tool choice belongs to whoever picks up the brief.

## When to use

Implementation on a branch is done, or far enough along, and you want a fresh pair of eyes before opening a PR: confirming the code matches the task, conforms to the repo's rules, leaks nothing, and is correct.

## The one rule that makes this work

The brief must **stand alone**. A reviewer who shares this session's context inherits its blind spots, so the brief re-derives the task from the **ticket + diff**, never from "what we discussed this session."

"Stand alone" cuts one way only: exclude the implementing session's *interpretation* of the task (that is the bias being removed), but **include the ticket's acceptance criteria** (the ground truth the reviewer judges against). Those are different inputs: drop the first, carry the second.

## Steps

1. **Detect branch and base.** Run `git branch --show-current` and determine the base branch (default `main` unless the repo says otherwise). Capture the diff range with `git diff <base>...HEAD --stat` and the commit list.
2. **Identify the ticket.** Scan the branch name, commit messages, and any existing PR description for a ClickUp / Linear / Jira id or URL. Present what you found and ask the operator to confirm or supply the right one. If none is found, ask.
3. **Get the ticket's substance, not just its link**; this is what makes the task-vs-code check real:
   - If a tracker integration is reachable (ClickUp / Linear / Jira MCP, or web access to the ticket URL), fetch the ticket body / acceptance criteria and embed it verbatim in the brief.
   - Else, ask the operator to paste the acceptance criteria.
   - Else, write a short task summary and label it explicitly **"implementer's claim: verify against the actual ticket."** Never present a session-derived paraphrase as ground truth.
4. **Assemble the brief** using the template below. It names *what* to review, never *how*: no tool or skill names.
5. **Deliver by mode:**
   - **default (spawn):** dispatch a fresh agent (the host's general-purpose agent) with the brief as its entire prompt (no session history) and return its findings.
   - **handoff** (invoked as `handoff-review handoff` or `handoff-review session`): write the brief to `tmp/handoff-review-<branch-slug>.md` (sanitize the branch name: `/` → `-`), tell the operator the path, and print the brief for copy-paste into a new session. Do not spawn an agent.

## The review brief template

> **Review brief: `<branch>` vs `<base>`**
>
> **Task (from ticket `<id / url>`):**
> `<acceptance criteria, verbatim from the ticket, or, if unavailable, the labeled "implementer's claim, verify against the ticket" summary>`
>
> **Diff scope:** `<files / stat summary>`: see it with `git diff <base>...HEAD`.
>
> **Review the following and form your own judgment from the diff. Do not trust any summary above:**
> 1. **Task vs. code**: Does the diff actually deliver the acceptance criteria? Call out anything asked-for-but-missing and anything done-but-not-asked.
> 2. **Rules / conventions**: read this repo's own `CLAUDE.md` / `AGENTS.md` / convention docs and check the diff against them. (This brief does not restate the rules; read them.)
> 3. **Information leak**: secrets / keys / tokens, internal hostnames or absolute paths, and private domain content that should not ship.
> 4. **Correctness / quality**: bugs, missing error handling, untested risk.
>
> **Report:** findings grouped by severity (blocker / major / minor / nit), each with `file:line` and a concrete fix, then an overall **go / no-go**.

## Rules

- Never run the review yourself; never name tools or skills for the reviewer to use.
- Never let the implementing session's interpretation stand in for the ticket's acceptance criteria.
- The brief must be readable with zero access to this session.
```

- [ ] **Step 2: Write the origin doc** `docs/skills/handoff-review.md` with exactly this content:

```markdown
# handoff-review

## Origin

A prompt the maintainer rewrote by hand at the end of nearly every branch asked: "Give this a fresh, unbiased review before we open the PR. Does the code match the task? Does it follow our rules? Did we leak anything?" Written ad hoc, it drifted through different wording each time; sometimes the leak check disappeared, and sometimes the same session that wrote the code ran the review, making it the worst possible judge.

`handoff-review` formalizes that prompt into a self-contained review brief that a *different* agent or session runs.

## Problem

Two failure modes in the ad-hoc flow:

1. **Biased reviewer.** The implementing session "knows" the intent and reads it into the diff, so it confirms its own work. A genuinely fresh review has to re-derive the task from the ticket and the diff.
2. **Hollow task-vs-code check.** Handed only a ticket id, a fresh reviewer can't open it and silently falls back to reviewing commits alone: gutting the most important dimension.

## Solution shape

A brief generator, not a reviewer. It gathers branch + base + diff, identifies the ticket, and (critically) pulls the ticket's *acceptance criteria* into the brief (tracker fetch → operator paste → labeled "implementer's claim" fallback). The brief names four review dimensions (task-vs-code, rules conformance, information leak, correctness) and prescribes no tools. Two modes: spawn a fresh agent, or write the brief to a scratch file for a new session.

The load-bearing constraint: the brief stands alone. "Zero shared context" excludes the author's interpretation (the bias) but includes the ticket's ground truth (what the reviewer checks against).

## Real invocation snippet

> /handoff-review

Spawns a fresh reviewer with a brief built from the branch diff and the confirmed ticket's acceptance criteria.

> /handoff-review session

Writes the brief to `tmp/handoff-review-<branch-slug>.md` and prints it for copy-paste into a new session; spawns nothing.

## Pitfalls observed

- **Letting the implementing session's paraphrase stand in for the ticket.** That paraphrase is exactly the bias being removed; it ships only under the explicit "implementer's claim, verify" label.
- **Naming tools in the brief.** The consuming agent owns tool choice. Naming `code-review` / `security-review` couples the brief to one session's toolset and defeats portability.
- **Treating it as a reviewer.** It produces the brief; it never reviews.

## Adaptation notes

- The four review dimensions are portable; the **rules / conventions** dimension points the reviewer at the repo's own `CLAUDE.md` / `AGENTS.md` / convention docs rather than restating rules, so it adapts to any project automatically.
- Ticket trackers vary (ClickUp / Linear / Jira). The substance-fetch step degrades gracefully when no tracker integration is present.
- The scratch path (`tmp/...`) is a default; point it at whatever scratch dir your project uses, and gitignore it.
```

- [ ] **Step 3: Produce the byte-identical mirror copies**

Run (PowerShell, from repo root):

```powershell
$c = ".claude/skills/handoff-review/SKILL.md"
$d = "docs/skills/handoff-review.md"
New-Item -ItemType Directory -Force ".codex/skills/handoff-review" | Out-Null
New-Item -ItemType Directory -Force ".gemini/skills/handoff-review" | Out-Null
Copy-Item $c ".codex/skills/handoff-review/SKILL.md" -Force
Copy-Item $c ".gemini/skills/handoff-review/SKILL.md" -Force
Copy-Item $c "skills/agent-workshop-onboard/references/skills/handoff-review.md" -Force
Copy-Item $c "plugins/agent-workshop/skills/agent-workshop-onboard/references/skills/handoff-review.md" -Force
Copy-Item $d "skills/agent-workshop-onboard/references/docs/skills/handoff-review.md" -Force
Copy-Item $d "plugins/agent-workshop/skills/agent-workshop-onboard/references/docs/skills/handoff-review.md" -Force
```

- [ ] **Step 4: Run the validator (this is the test)**

Run: `pwsh -File scripts/validate-native-plugin.ps1`
Expected: `native plugin validation ok` (handoff-review is fully mirrored; no reviewers plugin copy yet, so `Assert-ReviewersPlugin` still passes).

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/handoff-review docs/skills/handoff-review.md .codex/skills/handoff-review .gemini/skills/handoff-review skills/agent-workshop-onboard/references plugins/agent-workshop/skills/agent-workshop-onboard/references
git commit -m "feat: add handoff-review skill (canonical + mirrors)"
```

---

## Task 2: Author `handoff-pr` (canonical + all mirrors except the reviewers plugin copy)

End state: `validate-native-plugin.ps1` prints `native plugin validation ok`.

**Files:** same shape as Task 1 with `<name>` = `handoff-pr`.

- [ ] **Step 1: Write the canonical skill file** `.claude/skills/handoff-pr/SKILL.md` with exactly this content:

```markdown
---
name: handoff-pr
description: Use when a branch is ready for a PR but the current session is not authorized to open one. Produces a structured PR handoff artifact (title, body, ticket links, validation and review status) for a separately-authorized session or agent to open. Auto-detects the ClickUp / Linear / Jira ticket and asks to confirm. Never opens the PR itself.
---

# Handoff PR

Package a finished branch into a **structured PR artifact** that a separately-authorized session or agent opens. This skill produces the artifact; it **never** runs `gh pr create`.

## When to use

The work is ready for a PR, but the current session does not hold PR-write authorization (or you deliberately want a clean, authorized session to open it). Hand it off instead of opening it here.

## Steps

1. **Detect branch and base.** Run `git branch --show-current` and determine the base branch (default `main` unless the repo says otherwise). Summarize the change from `git diff <base>...HEAD` and the commit list rather than relying on session memory.
2. **Identify the ticket.** Scan the branch name, commit messages, and any existing PR description for a ClickUp / Linear / Jira id or URL. Present what you found and ask the operator to confirm or supply the right one. If none is found, ask. Capture the full ticket **link**, not just the id.
3. **Capture status fields:**
   - **Validation / tests:** what was run and the result (or "not run").
   - **Review:** whether a `handoff-review` pass ran and its outcome; link the findings if available. Do not block on it: record honestly if no review ran.
4. **Assemble the artifact** using the template below.
5. **Deliver:** print the artifact inline. Also write it to `tmp/handoff-pr-<branch-slug>.md` (sanitize the branch name: `/` → `-`) and report the path, so the authorized session can read it.
6. **Stop.** State plainly that opening the PR is the authorized session's job: it runs `gh pr create` with the title and body below. Do not run it.

## The PR artifact template

> **PR handoff: `<branch>` → `<base>`**
>
> **Title:** `<conventional-style subject, e.g. feat: ...>`
>
> **Body:**
>
> ## Summary
> `<what changed and why, grounded in the diff>`
>
> ## Ticket
> `<ClickUp / Linear / Jira link(s)>`
>
> ## Validation
> `<tests / checks run and results, or "not run">`
>
> ## Review
> `<handoff-review outcome + link, or "no review run">`
>
> ## Caveats / follow-ups
> `<anything the reviewer / merger should know; "none" if none>`
>
> **To open:** an authorized session runs `gh pr create --base <base> --head <branch>` with the title and body above. This skill does not open the PR.

## Rules

- Never run `gh pr create` (or any PR-opening command): produce the artifact only.
- Always carry a real ticket link; if you cannot find or confirm one, ask rather than omit it.
- Ground the summary in the actual diff, not session memory: the artifact may be opened by a session with no shared context.
```

- [ ] **Step 2: Write the origin doc** `docs/skills/handoff-pr.md` with exactly this content:

```markdown
# handoff-pr

## Origin

The other half of the end-of-branch prompt: "open a PR on our behalf with the right ticket links." Often the implementing session is not the one authorized to open the PR, so the work has to be packaged and handed to a session that is. Done by hand, the ticket link got forgotten, the body drifted from the diff, and the review status went unrecorded.

`handoff-pr` formalizes that into a structured PR artifact a separately-authorized session opens.

## Problem

Three failure modes in the ad-hoc flow:

1. **Unauthorized opener.** The session that wrote the code cannot open the PR; the context has to travel to one that can.
2. **Missing ticket link.** Hand-written PR bodies dropped the ClickUp / Linear / Jira link, breaking traceability.
3. **Session-memory drift.** The summary described what the author remembered doing, not what the diff actually changed.

## Solution shape

An artifact generator, not a PR opener. It detects branch + base, summarizes from the real diff, auto-detects and confirms the ticket link, and records validation + review status into a structured body. It prints the artifact and writes it to a scratch file. It explicitly never runs `gh pr create`; that is the authorized session's job.

## Real invocation snippet

> /handoff-pr

Builds the PR artifact, confirms the ticket, writes `tmp/handoff-pr-<branch-slug>.md`, and stops short of opening the PR.

## Pitfalls observed

- **Opening the PR anyway.** The skill is artifact-only by design; the current session lacks authorization. Running `gh pr create` defeats the handoff.
- **Summarizing from memory.** The artifact may be opened by a session with no shared context, so the summary must come from the diff.
- **Omitting the ticket when none is auto-detected.** Ask for it rather than shipping a PR with no traceability.

## Adaptation notes

- The artifact body sections (Summary / Ticket / Validation / Review / Caveats) are portable; trim or extend to match your PR template.
- Ticket detection scans branch / commits / PR description; adjust the patterns to your tracker's id format.
- Pairs with `handoff-review`: the **Review** field records that outcome. The coupling is light: `handoff-pr` does not enforce that a review ran.
```

- [ ] **Step 3: Produce the byte-identical mirror copies**

```powershell
$c = ".claude/skills/handoff-pr/SKILL.md"
$d = "docs/skills/handoff-pr.md"
New-Item -ItemType Directory -Force ".codex/skills/handoff-pr" | Out-Null
New-Item -ItemType Directory -Force ".gemini/skills/handoff-pr" | Out-Null
Copy-Item $c ".codex/skills/handoff-pr/SKILL.md" -Force
Copy-Item $c ".gemini/skills/handoff-pr/SKILL.md" -Force
Copy-Item $c "skills/agent-workshop-onboard/references/skills/handoff-pr.md" -Force
Copy-Item $c "plugins/agent-workshop/skills/agent-workshop-onboard/references/skills/handoff-pr.md" -Force
Copy-Item $d "skills/agent-workshop-onboard/references/docs/skills/handoff-pr.md" -Force
Copy-Item $d "plugins/agent-workshop/skills/agent-workshop-onboard/references/docs/skills/handoff-pr.md" -Force
```

- [ ] **Step 4: Run the validator**

Run: `pwsh -File scripts/validate-native-plugin.ps1`
Expected: `native plugin validation ok`.

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/handoff-pr docs/skills/handoff-pr.md .codex/skills/handoff-pr .gemini/skills/handoff-pr skills/agent-workshop-onboard/references plugins/agent-workshop/skills/agent-workshop-onboard/references
git commit -m "feat: add handoff-pr skill (canonical + mirrors)"
```

---

## Task 3: Loosen the validator and add the reviewers plugin skill copies (same commit)

The current validator hard-fails on a `plugins/reviewers/skills` directory. The validator change and the plugin copies must land together so the repo stays green.

**Files:**
- Modify: `scripts/validate-native-plugin.ps1` (`Assert-ReviewersPlugin`)
- Create (by copy): `plugins/reviewers/skills/handoff-review/SKILL.md`, `plugins/reviewers/skills/handoff-pr/SKILL.md`

- [ ] **Step 1: Replace the no-skills assertion in `Assert-ReviewersPlugin`**

In `scripts/validate-native-plugin.ps1`, find this block:

```powershell
    if (Test-Path -LiteralPath "$root/skills" -PathType Container) {
        Fail "reviewers must not contain a skills directory"
    }
```

Replace it with:

```powershell
    $skillsDir = "$root/skills"
    if (-not (Test-Path -LiteralPath $skillsDir -PathType Container)) {
        Fail "reviewers must contain a skills directory"
    }
    $expectedSkills = @("handoff-pr", "handoff-review")
    $actualSkills = @(Get-ChildItem -LiteralPath $skillsDir -Directory | Select-Object -ExpandProperty Name | Sort-Object)
    Assert-SameFileList $expectedSkills $actualSkills "reviewers skills"
    foreach ($skillName in $expectedSkills) {
        Assert-SameFile ".claude/skills/$skillName/SKILL.md" "$skillsDir/$skillName/SKILL.md"
    }
```

- [ ] **Step 2: Create the reviewers plugin skill copies (byte-identical)**

```powershell
New-Item -ItemType Directory -Force "plugins/reviewers/skills/handoff-review" | Out-Null
New-Item -ItemType Directory -Force "plugins/reviewers/skills/handoff-pr" | Out-Null
Copy-Item ".claude/skills/handoff-review/SKILL.md" "plugins/reviewers/skills/handoff-review/SKILL.md" -Force
Copy-Item ".claude/skills/handoff-pr/SKILL.md" "plugins/reviewers/skills/handoff-pr/SKILL.md" -Force
```

- [ ] **Step 3: Run the validator**

Run: `pwsh -File scripts/validate-native-plugin.ps1`
Expected: `native plugin validation ok` (now requires and finds exactly the two reviewers skills, each byte-identical to canonical).

- [ ] **Step 4: Negative check: confirm the assertion actually bites**

Temporarily rename one copy and confirm the validator fails, then restore:

```powershell
Rename-Item "plugins/reviewers/skills/handoff-pr/SKILL.md" "SKILL.md.bak"
pwsh -File scripts/validate-native-plugin.ps1  # expect: native plugin validation failed: missing mirrored file: ...handoff-pr/SKILL.md
Rename-Item "plugins/reviewers/skills/handoff-pr/SKILL.md.bak" "SKILL.md"
pwsh -File scripts/validate-native-plugin.ps1  # expect: native plugin validation ok
```

Expected: first run FAILS (missing mirrored file), second run prints `native plugin validation ok`.

- [ ] **Step 5: Commit**

```bash
git add scripts/validate-native-plugin.ps1 plugins/reviewers/skills
git commit -m "feat: ship handoff skills in the reviewers plugin"
```

---

## Task 4: Update the skills roster doc and its reference mirrors

**Files:**
- Modify: `docs/skills/README.md`
- Create (by copy): mirror to both reference roots.

- [ ] **Step 1: Update the roster in `docs/skills/README.md`**

Change the opening line `Origin docs for the six skills shipped in` to `Origin docs for the eight skills shipped in`.

Add these two rows to the Roster table, after the `visual-advisor` row:

```markdown
| [`handoff-review`](handoff-review.md) | Produces a self-contained, unbiased review brief (task-vs-code, rules, info-leak, correctness) for a separate agent/session; spawns a reviewer or writes a scratch file. |
| [`handoff-pr`](handoff-pr.md) | Produces a structured PR handoff artifact (title, body, ticket links, status) for a separately-authorized session; never opens the PR. |
```

Add to the **Composition** section's bullet list:

```markdown
- `handoff-review` and `handoff-pr` are end-of-branch handoff primitives: each emits a self-contained artifact a *different* session consumes; they stand alone, not orchestrating other skills.
```

- [ ] **Step 2: Mirror the README to both reference roots (byte-identical)**

```powershell
Copy-Item "docs/skills/README.md" "skills/agent-workshop-onboard/references/docs/skills/README.md" -Force
Copy-Item "docs/skills/README.md" "plugins/agent-workshop/skills/agent-workshop-onboard/references/docs/skills/README.md" -Force
```

- [ ] **Step 3: Run the validator**

Run: `pwsh -File scripts/validate-native-plugin.ps1`
Expected: `native plugin validation ok`.

- [ ] **Step 4: Commit**

```bash
git add docs/skills/README.md skills/agent-workshop-onboard/references/docs/skills/README.md plugins/agent-workshop/skills/agent-workshop-onboard/references/docs/skills/README.md
git commit -m "docs: list handoff skills in the skills roster"
```

---

## Task 5: Broaden the reviewers plugin identity and bump versions

**Files:**
- Modify: `plugins/reviewers/.claude-plugin/plugin.json`
- Modify: `.claude-plugin/marketplace.json`
- Modify: `plugins/reviewers/README.md`

- [ ] **Step 1: Bump the plugin manifest** `plugins/reviewers/.claude-plugin/plugin.json`

Change `"version": "0.2.0"` to `"version": "0.3.0"`.
Change the `"description"` to: `"Curated standalone review and governance agents plus PR/review handoff skills from Agent Workshop, usable directly without onboarding."`
Add `"handoff"` to the `keywords` array.

- [ ] **Step 2: Match the marketplace entry** `.claude-plugin/marketplace.json`

For the `reviewers` plugin entry, change `"version": "0.2.0"` to `"version": "0.3.0"` and update its `"description"` to match the manifest's broadened wording.

- [ ] **Step 3: Update `plugins/reviewers/README.md`**

- Change the lead sentence from "four curated review agents you can run in any repo with **no setup**" to wording that covers four review agents **and two handoff skills**.
- Update the install/post-install paragraph: skills are invoked as `handoff-review` / `handoff-pr`; agents remain namespaced `reviewers:<agent>`.
- Add a **Skills** table:

```markdown
## Skills

| Skill | Produces |
| --- | --- |
| `handoff-review` | a self-contained, unbiased review brief (task-vs-code, rules, info-leak, correctness) for a separate agent/session to run before a PR |
| `handoff-pr` | a structured PR handoff artifact (title, body, ticket links, status) for a separately-authorized session to open; the skill never opens the PR itself |
```

- In the **Not included** section, change `No skills, MCP servers, or hooks.` to `No MCP servers or hooks.` and keep the note that the onboarding skill and edit-capable agents live in the separate `agent-workshop` plugin.

- [ ] **Step 4: Run the validator**

Run: `pwsh -File scripts/validate-native-plugin.ps1`
Expected: `native plugin validation ok` (marketplace version now matches the manifest version).

- [ ] **Step 5: Commit**

```bash
git add plugins/reviewers/.claude-plugin/plugin.json .claude-plugin/marketplace.json plugins/reviewers/README.md
git commit -m "feat: broaden reviewers plugin to include handoff skills (0.3.0)"
```

---

## Task 6: Full verification and decision-doc status flip

**Files:**
- Modify: `docs/decisions/handoff-skills.md`

- [ ] **Step 1: Run the native-plugin validator**

Run: `pwsh -File scripts/validate-native-plugin.ps1`
Expected: `native plugin validation ok`.

- [ ] **Step 2: Verify host parity by hand (no script enforces `.codex`/`.gemini` skill mirrors)**

```powershell
foreach ($n in @("handoff-review","handoff-pr")) {
  foreach ($h in @(".codex",".gemini")) {
    $a = ".claude/skills/$n/SKILL.md"; $b = "$h/skills/$n/SKILL.md"
    $ha = (Get-FileHash $a).Hash; $hb = (Get-FileHash $b).Hash
    "{0} {1} {2}" -f $n, $h, ($(if ($ha -eq $hb) {"IDENTICAL"} else {"DRIFT"}))
  }
}
```

Expected: four `IDENTICAL` lines.

- [ ] **Step 3: Run the Claude plugin validators (if the `claude` CLI is available)**

Run: `claude plugin validate .` and `claude plugin validate ./plugins/reviewers`
Expected: both pass. If the CLI is unavailable, note it and rely on Step 1.

- [ ] **Step 4: Flip the decision-doc status**

In `docs/decisions/handoff-skills.md`, change `## Status` body from `Draft for operator review.` to `Implemented.`

- [ ] **Step 5: Commit**

```bash
git add docs/decisions/handoff-skills.md
git commit -m "docs: mark handoff-skills decision implemented"
```

---

## Task 7: Change-log entry

- [ ] **Step 1: Invoke the `change-log` skill**

Use the `change-log` skill to add an entry under today's date recording: two new direct-use handoff skills (`handoff-review`, `handoff-pr`) shipped via the `reviewers` plugin (now 0.3.0, agents + skills); validator loosened to allow exactly those two skills; spec + plan at `docs/decisions/handoff-skills*.md`. Link the decision doc.

- [ ] **Step 2: Commit** (if the change-log skill does not commit)

```bash
git add docs/change-log.md
git commit -m "docs: change-log entry for handoff skills"
```

---

## Self-review notes (for the executor)

- **Byte-identity is the #1 failure mode.** If the validator reports `file differs from source`, re-run the `Copy-Item` for that file. Do not hand-edit the mirror.
- **Never reorder Tasks 1–3.** Adding a `.claude/skills/<name>/` without its reference mirrors, or adding `plugins/reviewers/skills/` before the validator change, breaks the validator mid-task.
- **The skills are prompt artifacts.** There is no runtime test; the validator + host-parity hash check + `claude plugin validate` are the full verification surface.
- **`marketplace/catalog.json` is deliberately untouched.** It enumerates *agents* only (the existing 6 skills are not catalogued either), so the two new skills follow the same absent pattern. Confirmed; not a gap.
- **Exposure is assumed-by-precedent, not proven here.** `claude plugin validate` checks structural validity, not that the skills load and invoke. Plugin skill auto-discovery is established by the `agent-workshop-onboard` precedent, so the assumption is sound, but confirming the spec's "installing `reviewers` exposes the two skills, invocable" acceptance criterion needs a real install in a clean session.
