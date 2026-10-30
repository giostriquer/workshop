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
>   - **Refutation:** `<for behavior changes: the mutation that should turn it red: e.g. "in a disposable checkout, remove only the fix → intended assertion in T fails">`
>
> **Primary verifier:** `<the strongest check above, exercised on the surface where the outcome actually matters: the running app, the real workflow, the rendered page. Unit tests, builds, and inspection support it; they don't replace it.>`
> `<if the pursuing session will lack a capability the primary verifier needs, name it here as a blocked item: the exact manual test and evidence the operator must supply, never a silently weaker check>`
>
> ## Integrity rules
> While pursuing this goal you must not:
> - **Edit this file**: `goal.md` belongs to the operator. Needing to change it to reach done is the tripwire (see *When to stop*).
> - **Weaken the bar to clear it:** don't delete, skip, `.only`/`xit`, loosen, or rename/relocate a test so the runner stops collecting it, to make the goal "pass." Make the *real* thing pass by fixing the code under test; pointing the test at the corrected module or a proper new seam is a fix, not a dodge.
> - **Move the goalposts**: don't narrow scope, redefine done, or reinterpret the goal to make it reachable. If it can't be reached as stated, **escalate** (see *When to stop*).
> - **Claim without evidence**: don't mark a check done without showing the verifying output in your session. No "should work," no "probably fine." (Evidence is shown and recorded under the Commits rule, never written into the contract files: see `plan.md`.)
> - **Hide failures**: a failing step is reported failing, even when inconvenient: its box stays unchecked, and a failure that blocks progress is surfaced to the operator. A surprising pass is suspect until verified.
>
> ## Approval gates  <!-- include when consequential actions are plausible -->
> `<record existing authorizations, then the irreversible, public, shared, or costly actions that still need operator approval: sends, publishes, deploys, deletions, purchases, access changes, including when they appear inside a test workflow>`
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
> - **Commits:** `<message style + any operator/repo cadence; when unstated, default to a commit at every verified checkpoint and at minimum at each completed phase>`. Carry the operator's existing commit authority, including any no-commit instruction. When commits are authorized, each green commit is the recovery point; do not invent or repeat permission. When commits are allowed, never carry uncommitted work across a phase boundary. When prohibited, name the permitted checkpoint/evidence location outside the two contract files. **Push / PR** below is separately governed.
> - **Push / PR:** `<push policy; whether, when, and where a PR opens>`
> - **Validation:** `<gates that must pass, and when>`
> - **Quality posture:** `<operator-set; default is reliability over speed. Never skip a gate or weaken a check to save time; a slower correct path beats a fast plausible one; when uncertain, verify or ask rather than guess>`
> - **Scope / stop-and-ask:** `<actions that must go back to the operator>`
>
> ## When to stop
> - **Done** when every acceptance check is independently verified, and never earlier.
> - **Stop and ask** on: outcome-changing ambiguity; a required gate that FAILs and can't be fixed in scope; an approval gate reached; no progress in `<N>` iterations; or (the tripwire) **you notice you're tempted to change this file, the acceptance checks, or the scope to make "done" reachable.** That temptation means escalate, not edit.
>
> ## Activation
> On a runtime with durable goal support (e.g. Codex `create_goal`, Muse goals), activate only under its user-authorization rules, with this objective:
> `Complete and verify the objective in <dir>/goal.md by executing and maintaining <dir>/plan.md; re-read both after every compaction.`
> Elsewhere, adopt this contract directly and start at the `in progress` phase's first unchecked box in `plan.md` (no phase in progress → the first `pending` one).

## The `plan.md` template

> # Plan: `<title>` (route for [`goal.md`](./goal.md))
>
> **To the pursuing session:** this file is your route, not your notebook; the finish line lives in `goal.md` and only the operator changes it. Work the loop, not a straight line: **act → verify with an independent pass → record the checkpoint under the Commits rule → flip the status → repeat**. An "independent pass" means the check is confirmed by something other than the judgment that did the work (never just "I believe it works") and its weight scales with the work: for a small routine task, a clean re-run of the Verify command is the pass; do **not** dispatch reviewer agents for every small task. Bring in the reviewers after a substantial chunk lands: a feature, a bug fix, a risky refactor. And when a phase completes, run an **adversarial code-quality review** of the phase's cumulative diff (the `code-quality-review` skill where the runtime ships it, otherwise a fresh reviewer prompted to attack the diff's correctness and maintainability) before the phase is marked done.
>
> **You may edit this file only to update statuses.** The permitted writes, exactly: set a phase's `Status:` line (keep at most one `in progress`; `done` only when its verification passed; `blocked` as it occurs) and tick checkboxes whose condition verifiably holds. Nothing else: no prose entries, no evidence, no command output, no history, no notes, no new sections or files. The durable record is **git** when commits are allowed: each verified checkpoint is a commit, and the commit message carries what a note here would have carried. If the Commits rule prohibits commits, use its named checkpoint/evidence location outside the two contract files. What cannot be expressed as a status flip or the permitted record goes to the operator, not into this file. If the phases themselves no longer match reality (wrong, missing, obsolete) stop and ask the operator to revise the route; rewriting it yourself is not a permitted write.
>
> **This file is re-read at every boot and after every compaction: statuses are the recovery mechanism.** To resume: re-read `goal.md`, then this file, and continue at the `in progress` phase's first unchecked box (no phase in progress → promote the first `pending` one). Never reconstruct history first: the statuses and the permitted checkpoint record already carry it; when you need to confirm where a check stands, re-run its Verify command instead of consulting a log. A failed verification changes no status: the box stays unchecked; repeated failure is a stop condition (`goal.md` → When to stop), not material for a log.
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
> - [ ] Phase checkpoint recorded under the Commits rule: commit the work and name what was verified when allowed; when commits are prohibited, record the revision/diff and verifying evidence at the named location outside the contract files
> - [ ] Adversarial code-quality review of the phase's cumulative diff passed: findings fixed or explicitly operator-accepted
> - [ ] `<what must be true before the next phase starts>`
>
> ## Delegation lanes  <!-- include only when separable lanes exist and subagents are available -->
> `<each lane: objective, non-goals, verifier, stop condition, evidence to return in session output. Lanes are separable work: research, independent verification, an alternative approach; integration, conflicts, and completion stay with the pursuer.>`
