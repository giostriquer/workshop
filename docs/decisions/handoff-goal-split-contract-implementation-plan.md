# handoff-goal v2 (Split Contract) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework `handoff-goal` into the self-carrying split contract (`goal.md` + `plan.md`) per `docs/decisions/handoff-goal-split-contract.md`, with origin-doc parity, packaging sweep, and validation.

**Architecture:** One canonical skill file changes (`plugins/toolkit/skills/handoff-goal/SKILL.md`) plus its origin doc; a mechanical sweep updates the two roster/README descriptions that promise the old single-file output and bumps the toolkit version in four version-pinned files. No new skill, no new files outside docs.

**Tech Stack:** Markdown skill specs, PowerShell validation script (`scripts/validate-native-plugin.ps1`), `change-log` + `push` repo skills.

## Global Constraints

- Skill frontmatter `description` must stay ≤ 1024 characters (Claude skill limit).
- `docs/skills/README.md` and `plugins/agent-workshop/skills/agent-workshop-onboard/references/docs/skills/README.md` are byte-identical today and must remain byte-identical.
- Toolkit version `0.12.2` → `0.12.3` in exactly four files: `plugins/toolkit/.claude-plugin/plugin.json`, `plugins/toolkit/.codex-plugin/plugin.json`, `plugins/toolkit/.cursor-plugin/plugin.json`, `.claude-plugin/marketplace.json` (toolkit entry). The validator fails on any mismatch.
- No changes to `plugins/toolkit/skills/handoff-review/SKILL.md` (its handoff-goal pointers are name-only and stay accurate), and none to the adoption READMEs (name-only mentions).
- Repo sanitization rule: Codex may be named as an example runtime ("e.g. Codex `create_goal`"), but no project-specific domain content.
- Single commit at the end via the `push` skill, message derived from the `change-log` entry (repo convention; overrides frequent-commit defaults).

---

### Task 1: Rewrite the canonical SKILL.md

**Files:**
- Modify: `plugins/toolkit/skills/handoff-goal/SKILL.md` (full replacement)

**Interfaces:**
- Produces: the v2 skill spec; Task 2's origin doc and Task 3's roster lines must describe exactly this behavior (directory output `tmp/<YYYY-MM-DD>-<goal-slug>/` with `goal.md` + `plan.md`; critique mode; fit check; baseline; real-surface primary verifier; approval gates; red-team; activation note).

- [ ] **Step 1: Replace the entire file with the following content**

````markdown
---
name: handoff-goal
description: Use when a goal — the rest of an in-flight plan, a scoped slice of it, or a brand-new idea — should be handed to a new session to pursue autonomously, or when an existing goal contract needs critique. Produces a self-contained goal contract directory (`tmp/<YYYY-MM-DD>-<goal-slug>/`) holding `goal.md`, the frozen contract (outcome, baseline, acceptance checks with a real-surface primary verifier, integrity rules, approval gates, operating rules), and `plan.md`, the living route (phases, ledger, next action) the pursuing session maintains — so pursuit stays consistent across compactions on any runtime, including Codex goal mode, which can activate the contract directly. With no argument it infers the goal from session context and confirms; pointed at an existing goal directory (or "critique") it audits and tightens instead of writing anew; never pursues the goal itself.
---

# Handoff Goal

Package a goal into a **self-contained goal contract** — a directory holding `goal.md` (the frozen contract) and `plan.md` (the living route) — that a new session picks up and pursues autonomously. This skill writes the contract; it does **not** pursue the goal.

## When to use

Work should continue beyond this session — the remaining slices of a plan, a scoped piece of one, or something the operator has only just described — and a new session should be able to run with it without re-explaining the goal, the state, or the working rules. Also: an existing goal contract needs a fresh audit (see *Critique mode*).

## Check goal fit first

A goal handoff pays off when pursuit is a **loop**: progress needs repeated attempts, waiting, or recovery; done can be measured by checks that can fail; after a failure the pursuer can choose its next move without a fresh preference decision from the operator. When most of that is false — one-shot work, taste-driven choices at every step, no credible verifier, unbounded external action — say so and recommend the lighter tool (a plain task in this session, or a `handoff-review` continue brief). Proceed only if the operator insists.

## The two rules that make this work

1. **The contract is the only context that survives.** The pursuing session starts with zero access to this session and will compact while it works, so everything it needs to behave consistently — goal, state, operating rules — lives in the contract, and the contract tells the session to keep coming back to it. Anything left in chat instead of the contract is gone the first time it's needed.

2. **The contract is the goal's defense against its own pursuer.** A session pursuing a goal under speed pressure is an optimizer, and an optimizer converges on whatever *looks* done — it will weaken a test, narrow the scope, or declare victory on its own say-so when those are the cheapest paths to "done." The contract is what stops that: it defines done as checks the pursuer can't fake, forbids the cheap proxies, forces verification the pursuer didn't judge itself, logs the evidence, and names the temptations that mean *escalate, don't reinterpret*. The file split makes one defense **mechanical**: the pursuer never edits `goal.md` — all routine writes land in `plan.md` — so the urge to touch `goal.md` *is* the redefinition tripwire firing. **Do not assume the target repo supplies this discipline** — many repos mandate no gates, no mutation proofs, no "don't weaken tests." The contract carries it.

## How much apparatus

Scale the defense to the goal's stakes and the operator's quality posture — don't wrap a one-file utility in a full invariant matrix. **Four parts are always on** in the emitted contract, whatever the goal; they are what convert a fast-but-plausible loop into a slower-but-reliable one:

- **Verifiable acceptance checks** — done is a checklist the pursuer can *run*, not prose it can interpret.
- **Integrity rules** — the prohibitions that name reward-hacking for what it is.
- **Independent verification** — done is confirmed by a pass the pursuer didn't make itself.
- **The redefinition tripwire** — "tempted to change the contract, the checks, or the scope to make done reachable" is a stop-and-ask, not a shortcut.

Three steps are always on *producer-side* — the fit check, the baseline capture, and the red-team pass cost this session a moment, not the contract a section. Everything else — Approval gates, Delegation lanes, an explicit Invariants section, a Non-goals list, a full reviewer-grade independent pass — scales up with stakes. A trivial goal carries the four; a high-stakes one carries all of it.

## Resolving the goal

How the skill was invoked decides where the goal comes from:

- **No argument** — infer the goal from the session's trajectory (the active plan, the work in progress, the stated intent). Present the inferred goal and ask the operator to confirm; if the session offers no clear candidate, ask outright instead of guessing.
- **A reference to existing work** (a plan, slices of it, a spec, a branch) — scope the goal to exactly that reference, reading the referenced material rather than recalling it.
- **A description of something new** — no plan exists yet. Ask only what's needed to make the goal actionable (the outcome, hard constraints, where it lives), then shape it.
- **A path to an existing goal directory** (or "critique") — not goal resolution at all: switch to *Critique mode*.

Whatever the source, the contract states the goal as an **outcome with a definition of done**, not a step list — the pursuing session owns the path and is free to optimize it.

## Steps

1. **Check fit** (above); recommend the lighter tool when the shape is wrong.
2. **Resolve the goal** (above), confirming with the operator when it was inferred or newly described.
3. **Turn the definition of done into acceptance checks.** Not prose ("X works") — a checklist where each check carries *how to verify it*: a command and the evidence that proves it passed. For any behavior change, add the **refutation form** — the mutation that should turn it red ("revert the change → test T fails"). A check with no way to verify it is a proxy the pursuer will game; rewrite it until it's executable, or mark it explicitly as operator-judged.
4. **Name the primary verifier — on the real surface.** Among the checks, one is the strongest independent signal of success, and it must live on the surface where the outcome actually matters: the running app, the real workflow, the rendered page. Unit tests, builds, and inspection are supporting evidence, not substitutes for exercising an interactive outcome. Then inventory capability: will the pursuing session actually have the access and tools that verifier needs (running environment, credentials, browser, devices)? A gap is named in `goal.md` as an explicit blocked item with the exact manual test and evidence the operator must supply — never silently downgraded to a weaker check.
5. **Capture baseline and current state from the repo, not memory.** The baseline is the fixed reference "done" is measured against — the exact failing command and its current output, or the starting metric — frozen in `goal.md`. Current state (branch, what exists, what's done / half-done, decisions already made) opens `plan.md` and evolves with pursuit. Verify both with `git status` / `git log` / the files — session recollection drifts.
6. **Gather the operating rules, including the quality posture.** Take what the repo already mandates (`CLAUDE.md` / `AGENTS.md` / convention docs) and what the operator stated this session; ask for whatever is still open — typically: branch or worktree, commit cadence and message style, push policy, PR policy (whether, when, target), validation gates, what triggers stop-and-ask, and the **quality posture** (default: reliability over speed). Record **concrete values** ("PRs target `develop`, only after all checks pass"). Never invent a rule the operator didn't state and the repo doesn't mandate.
7. **Size the integrity apparatus** (see *How much apparatus*). The always-on four ship in every `goal.md`; add **Approval gates** when consequential actions are plausible, **Delegation lanes** when separable lanes exist and subagents are available, Invariants / Non-goals as stakes warrant.
8. **Assemble the contract** from the two templates into `tmp/<YYYY-MM-DD>-<goal-slug>/` (today's date, short kebab-case goal name): `goal.md` and `plan.md`, cross-referencing each other.
9. **Red-team the draft before delivery.** Can success be faked by weakening a check? Could the words be satisfied while missing the operator's real outcome? Are consequential actions gated? Does the loop say what happens after a failed attempt? Is completion observable to someone other than the pursuer? Fix what fails, then deliver.
10. **Deliver.** Report the directory path and tell the operator to point a new session at `goal.md`. Do not begin pursuing the goal here.

## The `goal.md` template

> # Goal contract — `<title>` (`<YYYY-MM-DD>`)
>
> **To the pursuing session:** this file is your working contract, and it outranks your own recollection. **You may not edit it** — all routine writes belong in [`plan.md`](./plan.md). If done seems to require changing this file, that is the redefinition tripwire: stop and escalate to the operator. After **every compaction** — and again before you mark any check done — re-read **Goal**, **Acceptance checks**, and **Integrity rules**, and confirm your work still targets the stated outcome, not a reinterpretation that's easier to reach.
>
> ## Goal
> `<the outcome in one or two sentences — what is true when this is done>`
>
> ## Baseline
> `<the fixed starting point "done" is measured against — the exact failing command + its current output, or the starting metric>`
>
> ## Acceptance checks
> Done = every check below independently verified (see Integrity rules). For each:
> - [ ] `<the check — a specific, observable claim>`
>   - **Verify:** `<command to run + the evidence that proves it passed>`
>   - **Refutation:** `<for behavior changes: the mutation that should turn it red — e.g. "revert the change → test T fails">`
>
> **Primary verifier:** `<the strongest check above, exercised on the surface where the outcome actually matters — the running app, the real workflow, the rendered page. Unit tests, builds, and inspection support it; they don't replace it.>`
> `<if the pursuing session will lack a capability the primary verifier needs, name it here as a blocked item: the exact manual test and evidence the operator must supply — never a silently weaker check>`
>
> ## Integrity rules
> While pursuing this goal you must not:
> - **Edit this file** — `goal.md` belongs to the operator. Needing to change it to reach done is the tripwire (see *When to stop*).
> - **Weaken the bar to clear it** — don't delete, skip, `.only`/`xit`, loosen, or rename/relocate a test so the runner stops collecting it, to make the goal "pass." Make the *real* thing pass — fixing the code under test, including pointing the test at the corrected module or a proper new seam, is a fix, not a dodge.
> - **Move the goalposts** — don't narrow scope, redefine done, or reinterpret the goal to make it reachable. If it can't be reached as stated, **escalate** (see *When to stop*).
> - **Claim without evidence** — don't mark a check done without showing the verifying output. No "should work," no "probably fine."
> - **Hide failures** — a failing step is reported failing, in the ledger, even when inconvenient. A surprising pass is suspect until verified.
>
> ## Approval gates  <!-- include when consequential actions are plausible -->
> `<the irreversible, public, shared, or costly actions that need separate operator approval even mid-goal — sends, publishes, deploys, deletions, purchases, access changes — including when they appear inside a test workflow>`
>
> ## Context
> `<minimum background a fresh session needs; link to plan / spec files rather than restating them>`
>
> ## Invariants / must-not-break  <!-- include for non-trivial goals -->
> `<what must stay true while the goal is pursued — behaviors, contracts, data, gates a passing goal must not regress>`
>
> ## Non-goals  <!-- include when scope could drift -->
> `<what is explicitly out of scope — so "done" can't quietly expand or contract>`
>
> ## Operating rules
> - **Branch / worktree:** `<where the work happens>`
> - **Commits:** `<cadence, message style>`
> - **Push / PR:** `<push policy; whether, when, and where a PR opens>`
> - **Validation:** `<gates that must pass, and when>`
> - **Quality posture:** `<operator-set — default: reliability over speed: never skip a gate or weaken a check to save time; a slower correct path beats a fast plausible one; when uncertain, verify or ask rather than guess>`
> - **Scope / stop-and-ask:** `<boundaries; what must go back to the operator>`
>
> ## When to stop
> - **Done** when every acceptance check is independently verified — not before.
> - **Stop and ask** on: outcome-changing ambiguity; a required gate that FAILs and can't be fixed in scope; an approval gate reached; no progress in `<N>` iterations; or — the tripwire — **you notice you're tempted to change this file, the acceptance checks, or the scope to make "done" reachable.** That temptation means escalate, not edit.
>
> ## Activation
> On a runtime with durable goal support (e.g. Codex `create_goal`), activate with this objective:
> `Complete and verify the objective in <dir>/goal.md by executing and maintaining <dir>/plan.md; re-read both after every compaction.`
> Elsewhere, adopt this contract directly and start from `plan.md` → **Next action**.

## The `plan.md` template

> # Plan — `<title>` (route for [`goal.md`](./goal.md))
>
> **To the pursuing session:** this file is yours to maintain — the route, not the contract; the finish line lives in `goal.md` and only the operator changes it. Work the loop, not a straight line: **act → verify with an independent pass → record evidence in the ledger → repeat**. An "independent pass" means the check is confirmed by something other than the judgment that did the work — a fresh subagent prompted to *refute* done, or at minimum a clean re-run from the Verify command — never just "I believe it works."
>
> **Update this file before continuing whenever:** the operator steers, material new evidence lands, a verification fails, or a phase completes — re-read `goal.md` and this file, revise the affected phases and **Next action**, then resume. Keep at most one phase in progress. Check implementation boxes only when done; check verification boxes only after the declared check passed. Record failed checks without erasing evidence.
>
> ## Current state
> `<branch, what exists, what's done / half-done, decisions already made — starts as the handoff snapshot, updated as pursuit progresses>`
>
> ## Phases
>
> ### Phase 1: `<observable milestone>`
> Status: pending | in progress | blocked | complete
>
> Implementation
> - [ ] `<concrete change or investigation>`
>
> Verification
> - [ ] `<the acceptance check(s) this phase exercises, or the phase-level check — command + pass evidence>`
>
> Exit criteria
> - [ ] `<what must be true before the next phase starts>`
>
> ## Delegation lanes  <!-- include only when separable lanes exist and subagents are available -->
> `<each lane: objective, non-goals, verifier, stop condition, evidence to return. Lanes are separable work — research, independent verification, an alternative approach; integration, conflicts, and completion stay with the pursuer.>`
>
> ## Progress ledger
> `<append-only. Each entry: which acceptance check it advanced · the verification run (command + result) · any decision + why. An entry that advances no check needs a reason. This ledger outranks post-compaction recollection.>`
>
> ## Next action
> `<the single next concrete action>`

## Critique mode

Pointed at an existing goal directory (or asked to critique a draft), don't write a new contract — audit the existing one against this skill's own bar and tighten it in place:

- run the red-team questions from step 9;
- every acceptance check verifiable (command + evidence), refutation present for behavior changes;
- primary verifier named, on the real surface, capability gaps declared rather than papered over;
- operating rules carry concrete values, none invented;
- the split honored — no living state in `goal.md`, no contract terms living only in `plan.md`;
- the always-on four present; stakes-scaled sections match the actual stakes, both ways (missing where needed, fortress where trivial).

Report what was tightened and why; flag anything that needs the operator (a rule you'd have to invent, a verifier that needs a capability decision).

## Rules

- Never pursue the goal in this session — write the contract and hand off.
- The contract must be readable with zero access to this session; no "as discussed."
- Done is **verifiable acceptance checks, not prose** — each check states how to verify it; behavior changes state how to refute it; the primary verifier lives on the real surface, and a missing capability is a named blocked item, never a silent downgrade. State the goal as an outcome; leave the path to the pursuing session.
- `goal.md` is frozen at handoff and off-limits to the pursuer; `plan.md` is the pursuer's to maintain. All routine writes land in `plan.md`.
- The **always-on four** ship in every contract: verifiable acceptance checks, integrity rules, independent verification, and the redefinition tripwire. Fit check, baseline capture, and the red-team pass always run producer-side. Approval gates, Delegation lanes, Invariants, and Non-goals scale with stakes.
- **Inject the discipline into the contract** — don't assume the target repo mandates gates, mutation proofs, or "no weakening tests."
- Operating rules carry concrete values sourced from the repo's rule files or the operator — never "follow the usual conventions," and never a rule you invented. The quality posture is operator-set; default to reliability over speed.
- Confirm an inferred or newly-shaped goal with the operator before writing the contract.
````

- [ ] **Step 2: Verify the frontmatter description length**

Run (PowerShell):
```powershell
$m = [regex]::Match((Get-Content plugins/toolkit/skills/handoff-goal/SKILL.md -Raw), '(?s)description:\s*(.+?)\n---'); $m.Groups[1].Value.Trim().Length
```
Expected: a number ≤ 1024.

---

### Task 2: Origin-doc parity — rewrite `docs/skills/handoff-goal.md`

**Files:**
- Modify: `docs/skills/handoff-goal.md` (full replacement)

**Interfaces:**
- Consumes: the v2 behavior exactly as specified in Task 1 (names, section titles, output paths must match).

- [ ] **Step 1: Replace the entire file with the following content**

````markdown
# handoff-goal

## Origin

The third handoff the maintainer kept writing by hand: not handing a finished branch *backward* to a reviewer (`handoff-review`) or a PR opener (`handoff-pr`), but handing work *forward* — "here's the goal, here's where we are, here are the working rules; new session, go pursue it." Written ad hoc, the doc carried the goal but lost the rules: preferences stated once in chat (commit style, push policy, PR target) made it into the file inconsistently, and nothing told the pursuing session what to do when its own context compacted mid-goal.

`handoff-goal` formalizes that forward handoff into a goal contract a new session picks up and pursues autonomously.

A second pressure arrived from outside: a Codex-native goal skill ("ultragoal"), grown in real use alongside Codex goal mode, carried design rigor the handoff lacked — a goal-fit check, a recorded baseline, a primary verifier on the real interaction surface, approval gates, a red-team pass, and a goal/plan file split. Rather than ship a second, overlapping skill, `handoff-goal` absorbed the rigor and its emitted contract became the shared format any runtime can pursue — including Codex goal mode activating it directly (see `docs/decisions/handoff-goal-split-contract.md`).

## Problem

The ad-hoc flow fails in four characteristic ways. The first three are about *context loss*; the fourth is about *goal defense*, and it surfaced once the skill was actually used to drive autonomous loops.

1. **Rules evaporate at compaction.** The pursuing session starts well, compacts, and the operating rules — which lived in its early context — are gone. Behavior drifts mid-goal: pushes that weren't approved, PRs to the wrong base, validation skipped.
2. **Invented rules.** A baseline test showed a model writing a handoff cold will pad the rules with constraints nobody stated ("never rebase") and present them as user-mandated — the pursuing session then over-constrains itself.
3. **Step list instead of outcome.** Without a definition of done, the pursuing session stops early or gold-plates; without an outcome framing it can't optimize the path when the listed steps turn out wrong.
4. **The pursuer reward-hacks the goal.** A session pursuing a goal under speed pressure is an optimizer, and an optimizer converges on whatever *looks* done. Handed a prose "definition of done," it will weaken a test, narrow the scope, reinterpret the goal, or declare victory on its own say-so when those are the cheapest paths to "done." The original document stated the goal and *trusted* the pursuer — an excellent context preserver, a weak goal defender. The danger is sharp precisely because a handoff is only as disciplined as the repo it lands in: when the target repo's rule files already mandate gates, mutation proofs, and "no weakening tests," the pursuer inherits that discipline; many repos mandate none of it, and then nothing stands between the goal and a fast-but-plausible loop.

## Solution shape

A contract generator, not an executor. It resolves the goal from one of three sources — inferred from the session's trajectory (then confirmed), scoped to referenced existing work (a plan, slices, a spec), or shaped from a brand-new description (asking only what's needed to make it actionable) — after a **fit check**: goal handoffs pay off when pursuit is a loop (repeatable attempts, checks that can fail, no fresh preference decision after each failure); when the shape is wrong it recommends a lighter tool instead. It re-derives current state *and the baseline* from the repo rather than session memory, gathers operating rules (repo rule files + operator statements, asking for what's still open), red-teams the draft, and writes a **split contract**:

```
tmp/<YYYY-MM-DD>-<goal-slug>/
├─ goal.md   — the frozen contract; the pursuer may not edit it
└─ plan.md   — the living route; the pursuer maintains it
```

The contract is built on **two rules**:

1. *The contract is the only context that survives.* The pursuing session starts with zero access to the producing session and compacts while it works, so everything it needs — goal, state, operating rules — lives in the files, and the files tell it to keep coming back.
2. *The contract is the goal's defense against its own pursuer.* It defines done as checks the pursuer can't fake, forbids the cheap proxies, forces verification the pursuer didn't judge itself, logs the evidence, and names the temptations that mean *escalate, don't reinterpret*. The discipline is injected **into the contract** — the skill does not assume the target repo supplies it. The file split makes one defense **mechanical**: routine writes never touch `goal.md`, so the urge to edit it *is* the redefinition tripwire firing.

Concretely, `goal.md` carries: the goal as an outcome; the **baseline** (the exact failing command + output, or starting metric — the fixed reference "done" is measured against); **verifiable acceptance checks** (each with a verify command + expected evidence, and a refutation/mutation form for behavior changes) with the **primary verifier** flagged — the strongest check, exercised on the real surface where the outcome matters (running app, real workflow, rendered page; unit tests and builds support it, never replace it), and any capability the pursuer will lack named as an explicit blocked item rather than silently downgraded; an **integrity rules** block (don't edit `goal.md`; don't weaken / skip / rename-away tests or gates; don't narrow scope or reinterpret the goal — escalate; evidence before claims; report failures faithfully); stakes-scaled **approval gates** (irreversible, public, shared, or costly actions go back to the operator even mid-goal), **invariants**, and **non-goals**; operating rules with an operator-set **quality posture** (default: reliability over speed); **when-to-stop** conditions including the tripwire; and an **activation note** — on a runtime with durable goal support (e.g. Codex `create_goal`), the contract activates with a one-line objective pointing at both files; elsewhere a session adopts it directly.

`plan.md` carries the pursuit discipline: the loop shape (act → verify with an independent pass → record evidence → repeat); **plan-update events** (operator steering, material new evidence, a failed verification, a completed phase → re-read both files and revise before continuing); **current state** (the handoff snapshot, evolving with pursuit); **phases** (status / implementation / verification / exit criteria, at most one in progress); stakes-scaled **delegation lanes** (bounded lanes with their own objective, verifier, and stop condition; integration and completion stay with the pursuer); the append-only **progress ledger**; and the single **next action**.

A **critique mode** rounds it out: pointed at an existing goal directory, the skill audits the contract against its own bar (red-team questions, verifiable checks, real-surface verifier, concrete rules, split honored, apparatus matched to stakes) and tightens it in place instead of writing anew.

The goal is still stated as an outcome the pursuing session owns and may optimize — the acceptance checks pin *what done means*, not *how to get there*.

## Calibration

The defense scales with the goal's stakes and the operator's quality posture — a one-file utility shouldn't be wrapped in a full invariant matrix. **Four parts are always on** in the contract, because they are what convert a fast-but-plausible loop into a slower-but-reliable one: verifiable acceptance checks, integrity rules, independent verification, and the redefinition tripwire. Three steps are always on *producer-side* — the fit check, the baseline capture, and the red-team pass cost the producing session a moment, not the contract a section. Everything else — approval gates, delegation lanes, an explicit invariants section, a non-goals list, a full reviewer-grade independent pass — scales up with stakes.

## Real invocation snippet

> /handoff-goal

Infers the goal from the session (the active plan, the work in progress), confirms it with the operator, and writes the goal contract.

> /handoff-goal slices 3-9 of the relay-sync plan

Scopes the goal to exactly those slices, reading the plan file rather than recalling it.

> /handoff-goal I want a CLI that mirrors issue comments between two trackers...

No plan exists; asks only what's needed to make the goal actionable, then shapes it into the contract.

> /handoff-goal critique tmp/2026-07-12-relay-sync/

Audits an existing contract against the skill's bar and tightens it in place.

## Pitfalls observed

- **Vague rules.** "Follow the usual conventions" survives compaction as nothing. Rules carry concrete values — the actual branch, the actual PR target — each sourced from a repo rule file or the operator.
- **Invented rules.** The baseline failure above. If neither the repo nor the operator stated it, it doesn't go in the contract.
- **Prose definition of done.** "X works" is the gameable proxy. Done is a checklist of checks the pursuer can run, each with how to verify it; behavior changes carry the mutation that should turn them red.
- **Assuming the repo supplies the discipline.** The integrity rules ride in the contract precisely because the target repo may mandate nothing. Don't omit them on the assumption that "the repo's CLAUDE.md handles it."
- **Living state in `goal.md`.** The split only defends if routine writes never touch the contract: current state, phase status, and evidence live in `plan.md`; `goal.md` freezes at handoff.
- **Silently downgraded verifier.** When the pursuing session won't have the capability the real-surface check needs, the temptation is to swap in a unit test and move on. Name the gap as a blocked item with the manual test the operator must run instead.
- **Fortress for a one-liner.** The opposite failure: loading a trivial goal with the full apparatus. Gate it on stakes and quality posture; ship the always-on four and add the rest as warranted.
- **Treating it as an executor.** It writes the contract; pursuing the goal belongs to the new session. Starting the work in the producing session defeats the handoff.
- **Restating the plan.** The contract links to plan / spec files; copying their content in creates a second source of truth that goes stale.

## Adaptation notes

- The operating-rules categories (branch / commits / push-PR / validation / quality-posture / scope) are portable; the *values* come from each project's own rule files and operator, so the skill adapts automatically.
- The integrity apparatus is the generalized form of a repo's Regression-Prevention Gate. A project that already mandates gates and mutation proofs can lean on its own rule files; a project that doesn't gets the discipline from the contract itself.
- The scratch path (`tmp/<YYYY-MM-DD>-<goal-slug>/`) is a default; point it at whatever scratch dir your project uses, and gitignore it.
- A runtime-side goal-mode skill (e.g. a personal Codex "ultragoal") can consume the contract: design and critique stay here; activation is one `create_goal` call carrying the objective from `goal.md`'s Activation section.
- Pairs naturally with its siblings: pursue the goal, then `handoff-review` for a fresh-eyes review, then `handoff-pr` to package the PR.
````

- [ ] **Step 2: Cross-check parity**

Confirm every feature the origin doc names exists in the Task 1 SKILL.md under the same name (fit check, baseline, primary verifier, approval gates, delegation lanes, critique mode, Activation section, `tmp/<YYYY-MM-DD>-<goal-slug>/` path). Fix whichever file is wrong.

---

### Task 3: Packaging sweep — rosters, READMEs, version bumps, validation

**Files:**
- Modify: `docs/skills/README.md:26`
- Modify: `plugins/agent-workshop/skills/agent-workshop-onboard/references/docs/skills/README.md:26` (identical change)
- Modify: `plugins/toolkit/README.md:68`
- Modify: `plugins/toolkit/.claude-plugin/plugin.json:4` (version)
- Modify: `plugins/toolkit/.codex-plugin/plugin.json:3` (version)
- Modify: `plugins/toolkit/.cursor-plugin/plugin.json:4` (version)
- Modify: `.claude-plugin/marketplace.json:15` (toolkit entry version)

**Interfaces:**
- Consumes: the v2 output shape from Task 1 (contract directory, `goal.md` + `plan.md`).

- [ ] **Step 1: Update the roster line in BOTH `docs/skills/README.md` and the onboarding copy**

Replace (identical in both files):
```markdown
| [`handoff-goal`](handoff-goal.md) | Produces a self-contained goal document (goal + definition of done, state, concrete operating rules) for a new session to pursue autonomously across compactions; never pursues the goal itself. |
```
with:
```markdown
| [`handoff-goal`](handoff-goal.md) | Produces a self-contained goal contract directory — `goal.md`, the frozen contract (outcome, baseline, real-surface primary verifier, integrity rules, approval gates, operating rules), plus `plan.md`, the living route the pursuer maintains — for a new session on any runtime (incl. Codex goal mode) to pursue autonomously across compactions; also critiques existing contracts; never pursues the goal itself. |
```

- [ ] **Step 2: Update the toolkit README table row**

In `plugins/toolkit/README.md`, replace:
```markdown
| `handoff-goal` | a self-contained goal document (goal + definition of done, current state, concrete operating rules) for a new session to pursue autonomously across compactions — never pursues the goal itself |
```
with:
```markdown
| `handoff-goal` | a self-contained goal contract directory — `goal.md` (frozen: outcome, baseline, acceptance checks with a real-surface primary verifier, integrity rules, approval gates, operating rules) plus `plan.md` (living: phases, ledger, next action) — for a new session to pursue autonomously across compactions; activatable directly by Codex goal mode; never pursues the goal itself |
```

- [ ] **Step 3: Bump the toolkit version in all four version-pinned files**

In each of `plugins/toolkit/.claude-plugin/plugin.json`, `plugins/toolkit/.codex-plugin/plugin.json`, `plugins/toolkit/.cursor-plugin/plugin.json`, and the toolkit entry of `.claude-plugin/marketplace.json`, replace:
```json
"version": "0.12.2",
```
with:
```json
"version": "0.12.3",
```
(Do NOT touch the `0.1.18` agent-workshop version in `marketplace.json`.)

- [ ] **Step 4: Confirm the two roster READMEs are still byte-identical**

Run (bash): `diff docs/skills/README.md plugins/agent-workshop/skills/agent-workshop-onboard/references/docs/skills/README.md && echo IDENTICAL`
Expected: `IDENTICAL`

- [ ] **Step 5: Run the repo validator**

Run (PowerShell): `pwsh -File scripts/validate-native-plugin.ps1`
Expected: passes (exit 0, no `Fail` output). If it fails on a version mismatch, a fifth pinned location exists — fix it to `0.12.3` and re-run.

---

### Task 4: Smoke test — emit a sample contract and check it against the rubric

**Files:**
- Create (scratch, NOT committed): `C:\Users\giova\AppData\Local\Temp\claude\E--dev-agent-workshop\88e54fd0-c729-4514-8665-efa41111b0f1\scratchpad\smoke\2026-07-12-sample-goal\goal.md` and `plan.md`

**Interfaces:**
- Consumes: the final SKILL.md templates from Task 1, followed literally.

- [ ] **Step 1: Emit a sample contract**

Following the Task 1 SKILL.md exactly (as if invoked with a toy goal: "make `scripts/validate-native-plugin.ps1` runnable from any working directory"), write the two files into the scratch directory above. Fill every template slot with concrete values (real commands, real paths); include Approval gates and Delegation lanes only if the toy goal's stakes warrant them (they don't — omit, proving the stakes-scaling works).

- [ ] **Step 2: Check the emitted pair against the rubric**

Confirm, by reading the two emitted files:
- `goal.md` carries: the always-on four, Baseline, a flagged Primary verifier on a real surface, the "you may not edit this file" integrity rule, When to stop with the edit-tripwire, and the Activation section with the objective line pointing at both files.
- `plan.md` carries: the discipline preamble (loop shape + plan-update events + one-phase-in-progress), Current state, at least one Phase with status/implementation/verification/exit criteria, Progress ledger, Next action.
- The two files cross-reference each other; no living state appears in `goal.md`; no contract terms appear only in `plan.md`.

Fix the SKILL.md template (not the sample) if any item fails, then re-emit.

---

### Task 5: Change-log entry and single commit

**Files:**
- Modify: `docs/change-log.md` (via the `change-log` skill)

- [ ] **Step 1: Invoke the repo `change-log` skill** to record the handoff-goal v2 rework (split contract, absorbed ultragoal rigor, toolkit 0.12.3).

- [ ] **Step 2: Invoke the repo `push` skill** to stage, commit, and push everything (both decision docs, SKILL.md, origin doc, rosters, manifests, change-log) directly to `main` in one commit. Expected message shape: `feat: handoff-goal v2 — self-carrying split contract (goal.md + plan.md)`.

- [ ] **Step 3: Confirm clean tree**

Run: `git status`
Expected: nothing to commit, working tree clean; branch up to date with `origin/main`.
