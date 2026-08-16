# Handoff-Review Verify-and-Continue Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Broaden the `handoff-review` skill so its self-contained brief serves both a pre-PR review *and* a clean-restart continuation, where a fresh session independently verifies the prior work before continuing it.

**Architecture:** Reshape the canonical SKILL.md around one spine (*verification is the precondition for continuing*) adding a third mode (`continue`/`resume`) that appends a light continuation block to the existing verify brief and escalates substantial forward work to `handoff-goal`. Propagate the reshaped SKILL.md byte-identically to its five mirrors, refresh the origin doc and roster prose for parity, and bump plugin/marketplace versions.

**Tech Stack:** Markdown skill/doc files; JSON plugin manifests; PowerShell validator (`scripts/validate-native-plugin.ps1`); Git Bash for byte-exact file copies.

## Global Constraints

- **Name stays `handoff-review`.** No directory rename, no new sibling skill. (Spec: Naming.)
- **All `SKILL.md` copies are byte-identical to canonical** (`.claude/skills/handoff-review/SKILL.md`), CRLF-normalized: enforced by `scripts/validate-native-plugin.ps1`. Always propagate by copying bytes, never by retyping.
- **The brief names *what* to verify, never *how***: no tool/skill names imposed on the receiver. The single allowed pointer: `continue` mode may tell the receiver to reach for `handoff-goal` when remaining work is substantial.
- **The brief stands alone:** re-derives the task from ticket + diff; excludes the prior session's interpretation but includes the ticket's acceptance criteria.
- **The continuation extension stays light**: current state + remaining outcome + operating rules. It does NOT reproduce `handoff-goal`'s acceptance-checks/integrity/ledger apparatus; it points there instead.
- **The skill still performs no downstream action.** It writes the brief but never reviews or pursues the continuation.
- **Version cross-checks** (validator-enforced): Codex manifest version == Claude manifest version; each marketplace entry version == its plugin manifest version; `plugins/agent-workshop/.claude-plugin/plugin.json` is byte-identical to root `.claude-plugin/plugin.json`.
- **Version bumps (patch, additive feature):** `toolkit` `0.8.3 → 0.8.4`; `agent-workshop` `0.1.14 → 0.1.15`. Both bump together (established commit cadence).
- **Decision note** already written at `docs/decisions/handoff-review-verify-and-continue.md`; commit it with the first task. `docs/decisions/*` is NOT mirrored into onboard references. Do not copy it anywhere.

---

### Task 1: Reshape the canonical SKILL.md and propagate to all five mirrors

**Files:**
- Modify: `.claude/skills/handoff-review/SKILL.md` (full replacement: content below)
- Modify (copy of canonical): `.codex/skills/handoff-review/SKILL.md`
- Modify (copy of canonical): `.gemini/skills/handoff-review/SKILL.md`
- Modify (copy of canonical): `plugins/toolkit/skills/handoff-review/SKILL.md`
- Modify (copy of canonical): `skills/agent-workshop-onboard/references/skills/handoff-review.md`
- Modify (copy of canonical): `plugins/agent-workshop/skills/agent-workshop-onboard/references/skills/handoff-review.md`
- Commit alongside: `docs/decisions/handoff-review-verify-and-continue.md` (the decision note)

**Interfaces:**
- Produces: the reshaped brief contract used by Task 2 (origin doc) and Task 3 (roster/README prose): modes `default`/`handoff`(`session`)/`continue`(`resume`); the brief template with a `continue`-only Continuation block; scratch path `tmp/handoff-review-<branch-slug>.md`.

- [ ] **Step 1: Replace the canonical SKILL.md with the reshaped content**

Write `.claude/skills/handoff-review/SKILL.md` with exactly this content:

````markdown
---
name: handoff-review
description: Use when work on a branch needs a fresh, unbiased pair of eyes: a pre-PR review, or a clean restart when this session's context has gone bad and a new session should independently verify what was already done and continue it. Produces a self-contained brief (task-vs-code, rules conformance, information leak, correctness) that re-derives the task from ticket + diff, never trusting the prior session. Default spawns a fresh reviewer (verify-only); `handoff`/`session` writes the brief to a scratch file for a new session (verify-only); `continue`/`resume` writes a verify-then-continue brief carrying current state, remaining work, and operating rules, pointing to handoff-goal for substantial forward work.
---

# Handoff Review

Produce a **self-contained brief** that lets a separate agent or session **independently verify** the work on a branch and, when the work is unfinished or this session's context has gone bad, **continue it from a verified foundation.** This skill writes the brief; it does **not** perform the review, pursue the continuation, or prescribe which tools the receiver uses. Tool choice belongs to whoever picks up the brief.

## When to use

- **Pre-PR review.** Implementation on a branch is done, or far enough along, and you want a fresh pair of eyes before opening a PR: confirming the code matches the task, conforms to the repo's rules, leaks nothing, and is correct.
- **Clean restart (recovery).** This session's context has gone bad and you'd rather start fresh, but the work so far is worth keeping. A new session picks up the brief, *independently verifies* what the prior session did (rather than trusting its word), and continues the remaining work from there.

## The one rule that makes this work

The brief must **stand alone**. A receiver who shares this session's context inherits its blind spots, so the brief re-derives the task from the **ticket + diff**, never from "what we discussed this session."

"Stand alone" cuts one way only: exclude the prior session's *interpretation* of the task (that is the bias being removed), but **include the ticket's acceptance criteria** (the ground truth the receiver judges against). Those are different inputs: drop the first, carry the second.

## Verify is the gate for continuing

Continuation rides on the same distrust the review is built from: **verification is the precondition for continuing.** A session that picks up unfinished work and trusts the prior session's "done" is building on sand, especially when the reason for the restart is that the prior session went sideways. So the receiver always **verifies first, then builds**: the review is not an add-on to the continuation, it is its gate.

## Modes

Three modes: the existing two are unchanged; `continue` adds the recovery case.

- **default (spawn):** `/handoff-review` dispatches a fresh agent (the host's general-purpose agent) with the brief as its entire prompt and no session history, then returns its findings. **Verify-only.**
- **handoff** (`handoff-review handoff`, alias `session`): write the brief to a scratch file for a new session and print it for copy-paste. Spawn nothing. **Verify-only.**
- **continue** (`handoff-review continue`, alias `resume`): write a **verify-then-continue** brief to a scratch file for a new session. It verifies the prior work, then continues the remaining work from the verified state. Spawn nothing because a fresh session is the whole point of a restart, and an ephemeral subagent cannot become your next working session.

## Steps

1. **Detect branch and base.** Run `git branch --show-current` and determine the base branch (default `main` unless the repo says otherwise). Capture the diff range with `git diff <base>...HEAD --stat` and the commit list.
2. **Identify the ticket.** Scan the branch name, commit messages, and any existing PR description for a ClickUp / Linear / Jira id or URL. Present what you found and ask the operator to confirm or supply the right one. If none is found, ask.
3. **Get the ticket's substance, not just its link**; this is what makes the task-vs-code check real:
   - If a tracker integration is reachable (ClickUp / Linear / Jira MCP, or web access to the ticket URL), fetch the ticket body / acceptance criteria and embed it verbatim in the brief.
   - Else, ask the operator to paste the acceptance criteria.
   - Else, write a short task summary and label it explicitly **"implementer's claim: verify against the actual ticket."** Never present a session-derived paraphrase as ground truth.
4. **For `continue` mode, also capture the continuation inputs** (skip for the two verify-only modes):
   - **Current state, from the repo not memory.** Branch, what exists, what's done / half-done, decisions already made: verified with `git status` / `git log` / the files, because the session handing off may be the unreliable one.
   - **Remaining work as an outcome.** State what's left as an outcome with a short definition of done, not a step list: the continuing session owns the path.
   - **Operating rules, concrete values.** Branch / worktree, commit cadence and message style, push policy, PR policy, validation gates, and the quality posture (default: reliability over speed): sourced from the repo's rule files (`CLAUDE.md` / `AGENTS.md` / convention docs) and what the operator stated this session; ask for whatever is still open. Never invent a rule the operator didn't state and the repo doesn't mandate.
5. **Assemble the brief** using the template below. It names *what* to verify, never *how*: no tool or skill names. Include the **Continuation** block only in `continue` mode.
6. **Deliver by mode:**
   - **default (spawn):** dispatch a fresh agent with the brief as its entire prompt and return its findings.
   - **handoff / continue:** write the brief to `tmp/handoff-review-<branch-slug>.md` (sanitize the branch name: `/` → `-`), tell the operator the path, and print the brief for copy-paste into a new session. Do not spawn an agent.

## The brief template

> **Handoff brief: `<branch>` vs `<base>`**
>
> **Task (from ticket `<id / url>`):**
> `<acceptance criteria, verbatim from the ticket, or, if unavailable, the labeled "implementer's claim, verify against the ticket" summary>`
>
> **Diff scope:** `<files / stat summary>`: see it with `git diff <base>...HEAD`.
>
> **Verify the following and form your own judgment from the diff. Do not trust any summary above:**
> 1. **Task vs. code**: Does the diff actually deliver the acceptance criteria? Call out anything asked-for-but-missing and anything done-but-not-asked.
> 2. **Rules / conventions**: read this repo's own `CLAUDE.md` / `AGENTS.md` / convention docs and check the diff against them. (This brief does not restate the rules; read them.)
> 3. **Information leak**: secrets / keys / tokens, internal hostnames or absolute paths, and private domain content that should not ship.
> 4. **Correctness / quality**: bugs, missing error handling, untested risk.
>
> **Report:** findings grouped by severity (blocker / major / minor / nit), each with `file:line` and a concrete fix, then a **verified-state verdict**: what is confirmed-good, what is broken, what is incomplete. (Verify-only modes can stop at an overall **go / no-go**.)
>
> **Continuation (include this block only in `continue` mode)**
>
> **You are continuing this work, not only verifying it. But continue only from a verified foundation:** run the verification above first. If it surfaces blockers in the prior work, fix or escalate those *before* building on top. Never trust the prior session's "done."
>
> **Current state:** `<branch, what exists, what's done / half-done, decisions already made: re-derived from the repo>`
>
> **Remaining work (the outcome to reach):** `<the outcome + a short definition of done rather than a step list>`
>
> **Operating rules:**
> - **Branch / worktree:** `<where the work happens>`
> - **Commits:** `<cadence, message style>`
> - **Push / PR:** `<push policy; whether, when, and where a PR opens>`
> - **Validation:** `<gates that must pass, and when>`
> - **Quality posture:** `<operator-set: default: reliability over speed>`
> - **Scope / stop-and-ask:** `<boundaries; what must go back to the operator>`
>
> **If the remaining work is substantial or high-stakes,** don't free-hand it: generate a `handoff-goal` document for it, so the forward build carries verifiable acceptance checks, integrity rules, and an independent-verification pass. This brief gets you a verified foundation and the outcome; `handoff-goal` carries the discipline for the build.

## Rules

- Never run the review yourself and never pursue the continuation yourself; this skill produces the brief and hands off.
- Never name tools or skills for the receiver to use: the one allowed exception is `continue` mode pointing at `handoff-goal` for substantial forward work.
- Never let the prior session's interpretation stand in for the ticket's acceptance criteria.
- The brief must be readable with zero access to this session.
- Continuation rides on verification: the `continue` brief always tells the receiver to verify first and continue only from a verified foundation.
- Keep the continuation extension light: current state, the remaining outcome, and operating rules. It does **not** reproduce `handoff-goal`'s acceptance-checks / integrity apparatus; for that, it points at `handoff-goal`.
````

- [ ] **Step 2: Propagate the canonical SKILL.md byte-identically to all five mirrors**

Run (from repo root, Git Bash):

```bash
cp .claude/skills/handoff-review/SKILL.md .codex/skills/handoff-review/SKILL.md
cp .claude/skills/handoff-review/SKILL.md .gemini/skills/handoff-review/SKILL.md
cp .claude/skills/handoff-review/SKILL.md plugins/toolkit/skills/handoff-review/SKILL.md
cp .claude/skills/handoff-review/SKILL.md skills/agent-workshop-onboard/references/skills/handoff-review.md
cp .claude/skills/handoff-review/SKILL.md plugins/agent-workshop/skills/agent-workshop-onboard/references/skills/handoff-review.md
```

- [ ] **Step 3: Verify all six copies are byte-identical**

Run:

```bash
for f in .codex/skills/handoff-review/SKILL.md .gemini/skills/handoff-review/SKILL.md plugins/toolkit/skills/handoff-review/SKILL.md skills/agent-workshop-onboard/references/skills/handoff-review.md plugins/agent-workshop/skills/agent-workshop-onboard/references/skills/handoff-review.md; do cmp .claude/skills/handoff-review/SKILL.md "$f" && echo "OK $f"; done
```

Expected: five lines, each `OK <path>`, no `differ` output.

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/handoff-review/SKILL.md .codex/skills/handoff-review/SKILL.md .gemini/skills/handoff-review/SKILL.md plugins/toolkit/skills/handoff-review/SKILL.md skills/agent-workshop-onboard/references/skills/handoff-review.md plugins/agent-workshop/skills/agent-workshop-onboard/references/skills/handoff-review.md docs/decisions/handoff-review-verify-and-continue.md
git commit -m "feat(handoff-review): add verify-then-continue mode"
```

---

### Task 2: Refresh the origin doc and propagate to its two reference mirrors

**Files:**
- Modify: `docs/skills/handoff-review.md` (full replacement: content below)
- Modify (copy): `skills/agent-workshop-onboard/references/docs/skills/handoff-review.md`
- Modify (copy): `plugins/agent-workshop/skills/agent-workshop-onboard/references/docs/skills/handoff-review.md`

**Interfaces:**
- Consumes: the reshaped brief contract from Task 1 (modes, the verify-is-the-gate idea, the `handoff-goal` escalation).

- [ ] **Step 1: Replace the origin doc with the refreshed content**

Write `docs/skills/handoff-review.md` with exactly this content:

````markdown
# handoff-review

## Origin

Two pressures, one skill.

The first was a prompt the maintainer rewrote by hand at the end of nearly every branch: "Give this a fresh, unbiased review before we open the PR. Does the code match the task? Does it follow our rules? Did we leak anything?" Written ad hoc, it drifted through different wording each time; sometimes the leak check disappeared, and sometimes the same session that wrote the code ran the review, making it the worst possible judge.

The second surfaced in lived-in use: the narrow pre-PR framing saw low usage, because the moment that actually wants a fresh session is not "the branch is done, review it" but **this session's context has gone bad and I want to start over without losing the work.** Restarting by hand re-introduced the exact bias the review removes: the new session trusted the prior session's claims and built on unverified work.

`handoff-review` formalizes both into one self-contained brief that a *different* agent or session runs: verify the work unbiased, and (when needed) continue it from a verified foundation.

## Problem

Three failure modes in the ad-hoc flow:

1. **Biased reviewer.** The implementing session "knows" the intent and reads it into the diff, so it confirms its own work. A genuinely fresh review has to re-derive the task from the ticket and the diff.
2. **Hollow task-vs-code check.** Handed only a ticket id, a fresh reviewer can't open it and silently falls back to reviewing commits alone: gutting the most important dimension.
3. **Continuation on sand.** A hand-rolled restart trusts the prior (possibly compromised) session's "done" and builds on top of unverified work, propagating whatever sent the first session sideways.

## Solution shape

A brief generator, not a doer. It gathers branch + base + diff, identifies the ticket, and pulls the ticket's *acceptance criteria* into the brief (tracker fetch → operator paste → labeled "implementer's claim" fallback). The brief names four verification dimensions (task-vs-code, rules conformance, information leak, correctness) and prescribes no tools.

The load-bearing idea that unifies review and continuation: **verification is the precondition for continuing.** The receiver always verifies first; continuation, when in scope, builds only on a verified foundation.

Three modes:

- **default (spawn)**: a fresh agent verifies and returns findings.
- **handoff / session**: write a verify-only brief to a scratch file for a new session.
- **continue / resume**: write a verify-**then-continue** brief. It adds current state (re-derived from the repo), the remaining work as an outcome, and concrete operating rules; gates continuation on a clean verification; and, for substantial forward work, points at `handoff-goal` rather than duplicating its acceptance-checks / integrity apparatus.

The standalone constraint still holds: "zero shared context" excludes the prior session's interpretation (the bias) but includes the ticket's ground truth (what the receiver checks against).

## Real invocation snippet

> /handoff-review

Spawns a fresh reviewer with a brief built from the branch diff and the confirmed ticket's acceptance criteria.

> /handoff-review handoff

Writes a verify-only brief to `tmp/handoff-review-<branch-slug>.md` and prints it for copy-paste into a new session; spawns nothing. (`/handoff-review session` is an accepted alias.)

> /handoff-review continue

Writes a verify-then-continue brief to the same scratch path: a new session verifies the prior work, then continues it from the verified state. (`/handoff-review resume` is an accepted alias.)

## Pitfalls observed

- **Letting the prior session's paraphrase stand in for the ticket.** That paraphrase is exactly the bias being removed; it ships only under the explicit "implementer's claim, verify" label.
- **Naming tools in the brief.** The consuming agent owns tool choice. The one allowed pointer is `continue` mode's nudge toward `handoff-goal` for substantial forward work.
- **Continuing before verifying.** The `continue` brief gates the build on a clean verification: building on the prior session's unverified "done" is the failure the recovery mode exists to prevent.
- **Treating it as a doer.** It produces the brief; it never reviews and never pursues the continuation.
- **Bloating the continuation.** The extension stays light (state + outcome + rules). Full forward-work discipline lives in `handoff-goal`; the brief points there rather than copying it.

## Adaptation notes

- The four verification dimensions are portable; the **rules / conventions** dimension points the receiver at the repo's own `CLAUDE.md` / `AGENTS.md` / convention docs rather than restating rules, so it adapts to any project automatically.
- Ticket trackers vary (ClickUp / Linear / Jira). The substance-fetch step degrades gracefully when no tracker integration is present.
- The scratch path (`tmp/...`) is a default; point it at whatever scratch dir your project uses, and gitignore it.
- The `continue` mode pairs with `handoff-goal`: this skill establishes a verified foundation and the remaining outcome; `handoff-goal` carries the heavyweight discipline for a substantial forward build.
````

- [ ] **Step 2: Propagate the origin doc to its two reference mirrors**

Run:

```bash
cp docs/skills/handoff-review.md skills/agent-workshop-onboard/references/docs/skills/handoff-review.md
cp docs/skills/handoff-review.md plugins/agent-workshop/skills/agent-workshop-onboard/references/docs/skills/handoff-review.md
```

- [ ] **Step 3: Verify the two mirrors are byte-identical**

Run:

```bash
cmp docs/skills/handoff-review.md skills/agent-workshop-onboard/references/docs/skills/handoff-review.md && echo OK1
cmp docs/skills/handoff-review.md plugins/agent-workshop/skills/agent-workshop-onboard/references/docs/skills/handoff-review.md && echo OK2
```

Expected: `OK1` and `OK2`, no `differ` output.

- [ ] **Step 4: Commit**

```bash
git add docs/skills/handoff-review.md skills/agent-workshop-onboard/references/docs/skills/handoff-review.md plugins/agent-workshop/skills/agent-workshop-onboard/references/docs/skills/handoff-review.md
git commit -m "docs(handoff-review): refresh origin doc for verify-then-continue"
```

---

### Task 3: Update the skills roster, composition prose, and toolkit README

**Files:**
- Modify: `docs/skills/README.md` (roster row + composition paragraph)
- Modify (copy): `skills/agent-workshop-onboard/references/docs/skills/README.md`
- Modify (copy): `plugins/agent-workshop/skills/agent-workshop-onboard/references/docs/skills/README.md`
- Modify: `plugins/toolkit/README.md` (Skills-table row)

**Interfaces:**
- Consumes: the reshaped brief contract from Task 1 (verify + continue; no longer backward-only).

- [ ] **Step 1: Update the roster row in `docs/skills/README.md`**

Replace this line:

```markdown
| [`handoff-review`](handoff-review.md) | Produces a self-contained, unbiased review brief (task-vs-code, rules, info-leak, correctness) for a separate agent/session; spawns a reviewer or writes a scratch file. |
```

with:

```markdown
| [`handoff-review`](handoff-review.md) | Produces a self-contained brief for a separate agent/session to independently verify a branch (task-vs-code, rules, info-leak, correctness) and, in `continue` mode, continue it from a verified foundation; spawns a reviewer or writes a scratch file. |
```

- [ ] **Step 2: Update the composition paragraph in `docs/skills/README.md`**

Replace this bullet:

```markdown
- `handoff-review`, `handoff-pr`, and `handoff-goal` are handoff primitives: each emits a self-contained artifact a *different* session consumes; they stand alone, not orchestrating other skills. The first two hand a finished branch backward (review, PR); `handoff-goal` hands work forward (a goal to pursue).
```

with:

```markdown
- `handoff-review`, `handoff-pr`, and `handoff-goal` are handoff primitives: each emits a self-contained artifact a *different* session consumes; they stand alone, not orchestrating other skills. `handoff-pr` packages a finished branch into a PR; `handoff-goal` hands work forward (a goal to pursue); `handoff-review` hands a branch to a fresh session to verify unbiased and (in `continue` mode) continue from a verified foundation, escalating substantial forward work to `handoff-goal`.
```

- [ ] **Step 3: Propagate `docs/skills/README.md` to its two reference mirrors**

Run:

```bash
cp docs/skills/README.md skills/agent-workshop-onboard/references/docs/skills/README.md
cp docs/skills/README.md plugins/agent-workshop/skills/agent-workshop-onboard/references/docs/skills/README.md
```

- [ ] **Step 4: Update the Skills-table row in `plugins/toolkit/README.md`**

Replace this line:

```markdown
| `handoff-review` | a self-contained, unbiased review brief (task-vs-code, rules, info-leak, correctness) for a separate agent/session to run before a PR |
```

with:

```markdown
| `handoff-review` | a self-contained brief for a separate agent/session to independently verify a branch (task-vs-code, rules, info-leak, correctness) before a PR and, in `continue` mode, continue the work from a verified foundation |
```

- [ ] **Step 5: Verify the README mirrors are byte-identical**

Run:

```bash
cmp docs/skills/README.md skills/agent-workshop-onboard/references/docs/skills/README.md && echo OK1
cmp docs/skills/README.md plugins/agent-workshop/skills/agent-workshop-onboard/references/docs/skills/README.md && echo OK2
```

Expected: `OK1` and `OK2`.

- [ ] **Step 6: Commit**

```bash
git add docs/skills/README.md skills/agent-workshop-onboard/references/docs/skills/README.md plugins/agent-workshop/skills/agent-workshop-onboard/references/docs/skills/README.md plugins/toolkit/README.md
git commit -m "docs(handoff-review): update roster and toolkit README for continue mode"
```

---

### Task 4: Bump plugin and marketplace versions

**Files:**
- Modify: `plugins/toolkit/.claude-plugin/plugin.json` (`0.8.3 → 0.8.4`)
- Modify: `plugins/toolkit/.codex-plugin/plugin.json` (`0.8.3 → 0.8.4`)
- Modify: `.claude-plugin/plugin.json` (`0.1.14 → 0.1.15`)
- Modify: `plugins/agent-workshop/.claude-plugin/plugin.json` (`0.1.14 → 0.1.15`)
- Modify: `plugins/agent-workshop/.codex-plugin/plugin.json` (`0.1.14 → 0.1.15`)
- Modify: `.claude-plugin/marketplace.json` (toolkit entry `0.8.3 → 0.8.4`; agent-workshop entry `0.1.14 → 0.1.15`)

**Interfaces:**
- Consumes: nothing. Produces the version state the validator cross-checks in Task 5.

- [ ] **Step 1: Bump toolkit to 0.8.4 (manifests)**

In `plugins/toolkit/.claude-plugin/plugin.json` change `"version": "0.8.3",` → `"version": "0.8.4",`.
In `plugins/toolkit/.codex-plugin/plugin.json` change `"version": "0.8.3",` → `"version": "0.8.4",`.

- [ ] **Step 2: Bump agent-workshop to 0.1.15 (manifests)**

In `.claude-plugin/plugin.json` change `"version": "0.1.14",` → `"version": "0.1.15",`.
In `plugins/agent-workshop/.claude-plugin/plugin.json` change `"version": "0.1.14",` → `"version": "0.1.15",`. (Must remain byte-identical to the root manifest: make the same single-line edit.)
In `plugins/agent-workshop/.codex-plugin/plugin.json` change `"version": "0.1.14",` → `"version": "0.1.15",`.

- [ ] **Step 3: Bump both entries in the marketplace**

In `.claude-plugin/marketplace.json`:
- agent-workshop entry: `"version": "0.1.14",` → `"version": "0.1.15",`
- toolkit entry: `"version": "0.8.3",` → `"version": "0.8.4",`

- [ ] **Step 4: Verify root and payload Claude manifests are still byte-identical**

Run:

```bash
cmp .claude-plugin/plugin.json plugins/agent-workshop/.claude-plugin/plugin.json && echo OK
```

Expected: `OK`.

- [ ] **Step 5: Commit**

```bash
git add .claude-plugin/plugin.json .claude-plugin/marketplace.json plugins/toolkit/.claude-plugin/plugin.json plugins/toolkit/.codex-plugin/plugin.json plugins/agent-workshop/.claude-plugin/plugin.json plugins/agent-workshop/.codex-plugin/plugin.json
git commit -m "chore: bump toolkit 0.8.4 and agent-workshop 0.1.15"
```

---

### Task 5: Validate, record the change-log entry, and push

**Files:**
- Modify: `docs/change-log.md` (via the `change-log` skill)

**Interfaces:**
- Consumes: all prior tasks. This is the gate that confirms byte-identity and version cross-checks pass.

- [ ] **Step 1: Run the native-plugin validator**

Run:

```bash
pwsh scripts/validate-native-plugin.ps1
```

Expected: final line `native plugin validation ok`. If it fails on a `file differs from source` error, re-copy the offending mirror from its canonical source (Tasks 1–3) and re-run.

- [ ] **Step 2: Run the host plugin validators (if `claude` CLI is available)**

Run:

```bash
claude plugin validate .
claude plugin validate ./plugins/toolkit
```

Expected: both report valid. If the `claude` CLI is not installed in this environment, note that and rely on Step 1.

- [ ] **Step 3: Record the change-log entry**

Invoke the `change-log` skill to add an entry to `docs/change-log.md` describing: `handoff-review` broadened with a `continue`/`resume` verify-then-continue mode (light continuation extension, escalates substantial work to `handoff-goal`); toolkit `0.8.4`, agent-workshop `0.1.15`. Follow the skill's compact-entry format; do not hand-write the entry outside the skill.

- [ ] **Step 4: Commit the change-log entry**

```bash
git add docs/change-log.md
git commit -m "docs: change-log entry for handoff-review verify-then-continue"
```

- [ ] **Step 5: Push**

Invoke the `push` skill (it pulls the current branch first, then pushes). Direct push to `main` is authorized for this repo.

---

## Self-Review

**1. Spec coverage:**
- Reshape into verify-then-(maybe)-continue, verify-as-gate → Task 1 (SKILL.md body + the "Verify is the gate" section + Continuation block).
- Three modes, existing two unchanged, `continue`/`resume` added → Task 1 (Modes section, brief template, Rules).
- Light continuation extension, escalate to `handoff-goal` → Task 1 (Continuation block + Rules), reinforced in Task 2 origin doc.
- Keep the name → Global Constraints; no rename steps anywhere.
- Origin-doc parity → Task 2. Roster + description parity → Task 3. Plugin/marketplace description text stays accurate (generic "PR/review/goal handoffs"), so no manifest prose edits, only the toolkit README skill-row and the docs roster carry per-skill descriptions, both updated in Task 3.
- Byte-identical mirrors → copy-then-`cmp` steps in Tasks 1–3; validator gate in Task 5.
- Version bumps → Task 4; cross-checks verified in Task 5.
- Change-log entry → Task 5.

**2. Placeholder scan:** Full content provided for SKILL.md (Task 1) and origin doc (Task 2); exact old→new strings for every roster/README/manifest edit. No "TBD"/"handle appropriately"/"similar to" left in the plan.

**3. Type consistency:** Mode names (`default`/spawn, `handoff`/`session`, `continue`/`resume`), the scratch path `tmp/handoff-review-<branch-slug>.md`, the "verified-state verdict" term, and the "verify is the gate for continuing" framing are used identically across the SKILL.md, the origin doc, the roster row, and the toolkit README row. Version targets (`toolkit 0.8.4`, `agent-workshop 0.1.15`) are identical in Global Constraints and Task 4.
