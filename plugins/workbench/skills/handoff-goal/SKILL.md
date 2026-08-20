---
name: handoff-goal
description: Use only for long-running work that must outlive this session, meaning a defined goal a fresh session pursues autonomously over many turns, or an existing goal contract that needs critique. Not for work this session can finish, and not for open-ended research.
---

# Handoff Goal

Package a goal into a **self-contained goal contract** (a directory holding `goal.md` (the frozen contract) and `plan.md` (the status-tracked route)) that a new session picks up and pursues autonomously. This skill writes the contract; it does **not** pursue the goal.

## When to use

**Only for long-running work.** The goal must be one that outlives this session: many turns of pursuit, waiting, and recovery, not something this session would finish if it simply kept going. When the work fits in the session at hand, a plain task is the right tool and this skill is the wrong one, however well-defined the goal is.

Work should continue beyond this session (the remaining slices of a plan, a scoped piece of one, or something the operator has only just described) and a new session should be able to run with it without re-explaining the goal, the state, or the working rules. Also: an existing goal contract needs a fresh audit (see *Critique mode*).

## Check goal fit first

A goal handoff pays off when pursuit is a **loop**: progress needs repeated attempts, waiting, or recovery; done can be measured by checks that can fail; after a failure the pursuer can choose its next move without a fresh preference decision from the operator. When most of that is false (work that fits in one session, one-shot work, taste-driven choices at every step, no credible verifier, unbounded external action) say so and recommend the lighter tool (a plain task in this session). Proceed only if the operator insists.

## The two rules that make this work

1. **The contract is the only context that survives.** The pursuing session starts with zero access to this session and will compact while it works, so everything it needs to behave consistently (goal, state, operating rules) lives in the contract, and the contract tells the session to keep coming back to it. Anything left in chat instead of the contract is gone the first time it's needed. And because the contract is re-read at every boot and after every compaction, the files in that loop must stay **small**, which the contract makes mechanical: the pursuer's writes to `plan.md` are **status flips only** (phase status, checkbox ticks), never prose, evidence, or command output. History lives in git commits and session output, never in the contract directory. Any sanctioned evidence file grows without bound under pursuit pressure until re-reading it consumes the sessions it was meant to steer; that failure was observed twice before this rule (a 40k-line plan, then a 450k-character one), so there is no evidence file at all.

2. **The contract is the goal's defense against its own pursuer.** A session pursuing a goal under speed pressure is an optimizer, and an optimizer converges on whatever *looks* done; it will weaken a test, narrow the scope, or declare victory on its own say-so when those are the cheapest paths to "done." The contract stops that by defining done as checks the pursuer cannot fake, forbidding cheap proxies, forcing independent verification, demanding evidence (in session output and commits) before any claim, and naming the temptations that mean *escalate, don't reinterpret*. The file split makes one defense **mechanical**: the pursuer never edits `goal.md` (its only writes are status updates in `plan.md`), so the urge to touch `goal.md` *is* the redefinition tripwire firing. **Do not assume the target repo supplies this discipline**, because many repos mandate no gates, no mutation proofs, and no "don't weaken tests." The contract carries it.

## How much apparatus

Scale the defense to the goal's stakes and the operator's quality posture: don't wrap a one-file utility in a full invariant matrix. **Four parts are always on** in the emitted contract, whatever the goal; they are what convert a fast-but-plausible loop into a slower-but-reliable one:

- **Verifiable acceptance checks**: done is a checklist the pursuer can *run*, not prose it can interpret.
- **Integrity rules**: the prohibitions that name reward-hacking for what it is.
- **Independent verification**: done is confirmed by a pass the pursuer didn't make itself.
- **The redefinition tripwire**: "tempted to change the contract, the checks, or the scope to make done reachable" is a stop-and-ask, not a shortcut.

Three steps are always on *producer-side*: the fit check, the baseline capture, and the red-team pass cost this session a moment, not the contract a section. Everything else (Approval gates, Delegation lanes, an explicit Invariants section, a Non-goals list, a full reviewer-grade independent pass) scales up with stakes. A trivial goal carries the four; a high-stakes one carries all of it.

## Resolving the goal

How the skill was invoked decides where the goal comes from:

- **No argument**: infer the goal from the session's trajectory (the active plan, the work in progress, the stated intent). Present the inferred goal and ask the operator to confirm; if the session offers no clear candidate, ask outright instead of guessing.
- **A reference to existing work** (a plan, slices of it, a spec, a branch): scope the goal to exactly that reference, reading the referenced material rather than recalling it.
- **A description of something new**: no plan exists yet. Ask only what's needed to make the goal actionable (the outcome, hard constraints, where it lives), then shape it.
- **A path to an existing goal directory** (or "critique") does not request goal resolution. Switch to *Critique mode*.

Whatever the source, the contract states the goal as an **outcome with a definition of done**, not a step list: the pursuing session owns the path and is free to optimize it.

## Steps

1. **Check fit** (above); recommend the lighter tool when the shape is wrong.
2. **Resolve the goal** (above), confirming with the operator when it was inferred or newly described.
3. **Turn the definition of done into acceptance checks.** Use a checklist instead of prose such as "X works." Each check must carry *how to verify it*, including a command and the evidence that proves it passed. For any behavior change, add the **refutation form**, which is the mutation that should turn it red ("revert the change → test T fails"). A check with no way to verify it is a proxy the pursuer will game; rewrite it until it is executable, or mark it explicitly as operator-judged.
4. **Name the primary verifier on the real surface.** Among the checks, one is the strongest independent signal of success, and it must live on the surface where the outcome actually matters: the running app, the real workflow, or the rendered page. Unit tests, builds, and inspection are supporting evidence, not substitutes for exercising an interactive outcome. Then determine whether the pursuing session has the access and tools that verifier needs (running environment, credentials, browser, devices). Name any gap in `goal.md` as an explicit blocked item with the exact manual test and evidence the operator must supply; never silently downgrade it to a weaker check.
5. **Capture baseline and current state from the repo, not memory.** The baseline is the fixed reference "done" is measured against (the exact failing command and its current output, or the starting metric) frozen in `goal.md`. Current state (branch, what exists, what's done / half-done, decisions already made) opens `plan.md` as the handoff snapshot; from there, pursuit state is carried by the phase statuses, not by rewriting the snapshot. Verify both with `git status` / `git log` / the files: session recollection drifts.
6. **Gather the operating rules, including the quality posture.** Take what the repo already mandates (`CLAUDE.md` / `AGENTS.md` / convention docs) and what the operator stated this session; ask for whatever is still open, typically the branch or worktree, commit cadence and message style, push policy, PR policy (whether, when, target), validation gates, what triggers stop-and-ask, and the **quality posture** (default: reliability over speed). Record **concrete values** ("PRs target `develop`, only after all checks pass"). Never invent a rule the operator didn't state and the repo doesn't mandate, with two exceptions that ship skill defaults when nobody states them: the quality posture above, and the **commit cadence** (commit at every verified checkpoint). A contract silent on commits leaves the pursuer treating git as someone else's decision and hoarding a giant uncommitted diff across phases; the default exists so no contract is ever silent. Under this contract, commits are also the durable record because the pursuer writes no evidence into contract files; the commit message is where a checkpoint's story lives.
7. **Size the integrity apparatus** (see *How much apparatus*). The always-on four ship in every `goal.md`; add **Approval gates** when consequential actions are plausible, **Delegation lanes** when separable lanes exist and subagents are available, Invariants / Non-goals as stakes warrant.
8. **Assemble the contract** from the two templates into `tmp/<YYYY-MM-DD>-<goal-slug>/` (today's date, short kebab-case goal name). Create `goal.md` and `plan.md`, cross-referencing each other. The contract contains only these two files; it ships no ledger, log, or evidence file, and pursuit never creates one.
9. **Red-team the draft before delivery.** Can success be faked by weakening a check? Could the words be satisfied while missing the operator's real outcome? Are consequential actions gated? Does the loop say what happens after a failed attempt? Is completion observable to someone other than the pursuer? Fix what fails, then deliver.
10. **Deliver.** Report the directory path and tell the operator to point a new session at `goal.md`. Do not begin pursuing the goal here.

## The `goal.md` template

> # Goal contract: `<title>` (`<YYYY-MM-DD>`)
>
> **To the pursuing session:** this file is your working contract, and it outranks your own recollection. **You may not edit it**: your only writes are status updates in [`plan.md`](./plan.md). If done seems to require changing this file, that is the redefinition tripwire: stop and escalate to the operator. After **every compaction** (and again before you mark any check done) re-read **Goal**, **Acceptance checks**, and **Integrity rules**, and confirm your work still targets the stated outcome, not a reinterpretation that's easier to reach.
>
> ## Goal
> `<the outcome in one or two sentences: what is true when this is done>`
>
> ## Baseline
> `<the fixed starting point "done" is measured against: the exact failing command + its current output, or the starting metric>`
>
> ## Acceptance checks
> Done = every check below independently verified (see Integrity rules). For each:
> - [ ] `<the check: a specific, observable claim>`
>   - **Verify:** `<command to run + the evidence that proves it passed>`
>   - **Refutation:** `<for behavior changes: the mutation that should turn it red: e.g. "revert the change → test T fails">`
>
> **Primary verifier:** `<the strongest check above, exercised on the surface where the outcome actually matters: the running app, the real workflow, the rendered page. Unit tests, builds, and inspection support it; they don't replace it.>`
> `<if the pursuing session will lack a capability the primary verifier needs, name it here as a blocked item: the exact manual test and evidence the operator must supply, never a silently weaker check>`
>
> ## Integrity rules
> While pursuing this goal you must not:
> - **Edit this file**: `goal.md` belongs to the operator. Needing to change it to reach done is the tripwire (see *When to stop*).
> - **Weaken the bar to clear it:** don't delete, skip, `.only`/`xit`, loosen, or rename/relocate a test so the runner stops collecting it, to make the goal "pass." Make the *real* thing pass by fixing the code under test; pointing the test at the corrected module or a proper new seam is a fix, not a dodge.
> - **Move the goalposts**: don't narrow scope, redefine done, or reinterpret the goal to make it reachable. If it can't be reached as stated, **escalate** (see *When to stop*).
> - **Claim without evidence**: don't mark a check done without showing the verifying output in your session. No "should work," no "probably fine." (Evidence is shown and committed, never written into the contract files: see `plan.md`.)
> - **Hide failures**: a failing step is reported failing, even when inconvenient: its box stays unchecked, and a failure that blocks progress is surfaced to the operator. A surprising pass is suspect until verified.
>
> ## Approval gates  <!-- include when consequential actions are plausible -->
> `<the irreversible, public, shared, or costly actions that need separate operator approval even mid-goal: sends, publishes, deploys, deletions, purchases, access changes, including when they appear inside a test workflow>`
>
> ## Context
> `<minimum background a fresh session needs; link to plan / spec files rather than restating them>`
>
> ## Invariants / must-not-break  <!-- include for non-trivial goals -->
> `<what must stay true while the goal is pursued: behaviors, contracts, data, gates a passing goal must not regress>`
>
> ## Non-goals  <!-- include when scope could drift -->
> `<what is explicitly out of scope, so "done" can't quietly expand or contract>`
>
> ## Operating rules
> - **Branch / worktree:** `<where the work happens>`
> - **Commits:** `<message style + any operator/repo cadence; when unstated, default to a commit at every verified checkpoint and at minimum at each completed phase>`. Local commits are routine, never consequential actions. They need no approval, and each green commit is the recovery point a later failure rolls back to. Never carry uncommitted work across a phase boundary; only **Push / PR** below is separately governed.
> - **Push / PR:** `<push policy; whether, when, and where a PR opens>`
> - **Validation:** `<gates that must pass, and when>`
> - **Quality posture:** `<operator-set; default is reliability over speed. Never skip a gate or weaken a check to save time; a slower correct path beats a fast plausible one; when uncertain, verify or ask rather than guess>`
> - **Scope / stop-and-ask:** `<boundaries; what must go back to the operator>`
>
> ## When to stop
> - **Done** when every acceptance check is independently verified, and never earlier.
> - **Stop and ask** on: outcome-changing ambiguity; a required gate that FAILs and can't be fixed in scope; an approval gate reached; no progress in `<N>` iterations; or (the tripwire) **you notice you're tempted to change this file, the acceptance checks, or the scope to make "done" reachable.** That temptation means escalate, not edit.
>
> ## Activation
> On a runtime with durable goal support (e.g. Codex `create_goal`), activate with this objective:
> `Complete and verify the objective in <dir>/goal.md by executing and maintaining <dir>/plan.md; re-read both after every compaction.`
> Elsewhere, adopt this contract directly and start at the `in progress` phase's first unchecked box in `plan.md` (no phase in progress → the first `pending` one).

## The `plan.md` template

> # Plan: `<title>` (route for [`goal.md`](./goal.md))
>
> **To the pursuing session:** this file is your route, not your notebook; the finish line lives in `goal.md` and only the operator changes it. Work the loop, not a straight line: **act → verify with an independent pass → commit the checkpoint → flip the status → repeat**. An "independent pass" means the check is confirmed by something other than the judgment that did the work (never just "I believe it works") and its weight scales with the work: for a small routine task, a clean re-run of the Verify command is the pass; do **not** dispatch reviewer agents for every small task. Bring in the reviewers after a substantial chunk lands: a feature, a bug fix, a risky refactor. And when a phase completes, run an **adversarial code-quality review** of the phase's cumulative diff (the `code-quality-review` skill where the runtime ships it, otherwise a fresh reviewer prompted to attack the diff's correctness and maintainability) before the phase is marked done.
>
> **You may edit this file only to update statuses.** The permitted writes, exactly: set a phase's `Status:` line (keep at most one `in progress`; `done` only when its verification passed; `blocked` as it occurs) and tick checkboxes whose condition verifiably holds. Nothing else: no prose entries, no evidence, no command output, no history, no notes, no new sections or files. The durable record is **git**: each verified checkpoint is a commit, and the commit message carries what a note here would have carried. What can't be expressed as a status flip or a commit goes to the operator, not into this file. If the phases themselves no longer match reality (wrong, missing, obsolete) stop and ask the operator to revise the route; rewriting it yourself is not a permitted write.
>
> **This file is re-read at every boot and after every compaction: statuses are the recovery mechanism.** To resume: re-read `goal.md`, then this file, and continue at the `in progress` phase's first unchecked box (no phase in progress → promote the first `pending` one). Never reconstruct history first: the statuses and `git log` already carry it; when you need to confirm where a check stands, re-run its Verify command instead of consulting a log. A failed verification changes no status: the box stays unchecked; repeated failure is a stop condition (`goal.md` → When to stop), not material for a log.
>
> ## Current state
> `<branch, what exists, what's done / half-done, decisions already made: the handoff snapshot, written once by the producing session; pursuit state lives in the phase statuses below, not here>`
>
> ## Phases
>
> ### Phase 1: `<observable milestone>`
> Status: pending | in progress | blocked | done
>
> Implementation
> - [ ] `<concrete change or investigation>`
>
> Verification
> - [ ] `<the acceptance check(s) this phase exercises, or the phase-level check: command + pass evidence>`
>
> Exit criteria
> - [ ] Phase work committed: the commit message names the phase and what was verified (a phase with uncommitted work is not done)
> - [ ] Adversarial code-quality review of the phase's cumulative diff passed: findings fixed or explicitly operator-accepted
> - [ ] `<what must be true before the next phase starts>`
>
> ## Delegation lanes  <!-- include only when separable lanes exist and subagents are available -->
> `<each lane: objective, non-goals, verifier, stop condition, evidence to return in session output. Lanes are separable work: research, independent verification, an alternative approach; integration, conflicts, and completion stay with the pursuer.>`

## Critique mode

Pointed at an existing goal directory (or asked to critique a draft), don't write a new contract: audit the existing one against this skill's own bar and tighten it in place:

- run the red-team questions from step 9;
- every acceptance check verifiable (command + evidence), refutation present for behavior changes;
- primary verifier named, on the real surface, capability gaps declared rather than papered over;
- operating rules carry concrete values, none invented;
- commit discipline mechanical: a concrete Commits rule (skill default if nobody stated one), the commit step in the loop, the committed-work exit criterion in each phase;
- review cadence right-sized: no per-task reviewer dispatches mandated (a small task's independent pass is the Verify re-run); reviewers after substantial chunks; the adversarial code-quality-review exit criterion present in each phase;
- the split honored: no living state in `goal.md`, no contract terms living only in `plan.md`;
- `plan.md` status-only: statuses and checkbox ticks are the only pursuit-side mutations the template sanctions (the permitted-writes paragraph present in the preamble, statuses `pending | in progress | blocked | done`, no ledger / log / next-action sections); a contract carrying accumulated history (prose entries, evidence, pasted output, or a legacy `ledger.md`) is migrated by **cutting the history** (git and the operator's session already hold it), re-deriving each phase's status and checkboxes from the repo and `git log`, and deleting any evidence file, so what remains is exactly the status-tracked route;
- the always-on four present; stakes-scaled sections match the actual stakes, both ways (missing where needed, fortress where trivial).

Report what was tightened and why; flag anything that needs the operator (a rule you'd have to invent, a verifier that needs a capability decision).

## Rules

- Never pursue the goal in this session: write the contract and hand off.
- The contract must be readable with zero access to this session; no "as discussed."
- Done is **verifiable acceptance checks, not prose**: each check states how to verify it; behavior changes state how to refute it; the primary verifier lives on the real surface, and a missing capability is a named blocked item, never a silent downgrade. State the goal as an outcome; leave the path to the pursuing session.
- `goal.md` is frozen at handoff and off-limits to the pursuer; `plan.md` is the pursuer's to **advance, not to write in**: its only permitted edits are status flips (at most one phase `in progress`, `done` when verified, `blocked` as it occurs) and checkbox ticks. No prose, evidence, command output, or history ever lands in the contract directory: git commits and session output are the record, re-runnable Verify commands are the proof, and route changes go back to the operator.
- The **always-on four** ship in every contract: verifiable acceptance checks, integrity rules, independent verification, and the redefinition tripwire. Fit check, baseline capture, and the red-team pass always run producer-side. Approval gates, Delegation lanes, Invariants, and Non-goals scale with stakes.
- **Inject the discipline into the contract**: don't assume the target repo mandates gates, mutation proofs, or "no weakening tests."
- Operating rules carry concrete values sourced from the repo's rule files or the operator, never "follow the usual conventions," and never a rule you invented. Two rules ship skill defaults when neither repo nor operator sets them: the quality posture (reliability over speed) and the commit cadence (commit at every verified checkpoint; never carry uncommitted work across a phase boundary).
- Confirm an inferred or newly-shaped goal with the operator before writing the contract.
