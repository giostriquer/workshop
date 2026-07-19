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
├─ goal.md    — the frozen contract; the pursuer may not edit it
├─ plan.md    — the living route; the pursuer maintains it, kept boot-sized
└─ ledger.md  — append-only history archive; never re-read at boot
```

The contract is built on **two rules**:

1. *The contract is the only context that survives.* The pursuing session starts with zero access to the producing session and compacts while it works, so everything it needs — goal, state, operating rules — lives in the files, and the files tell it to keep coming back. And because those files are re-read at every boot and after every compaction, the ones in the boot path must stay small: `plan.md` carries steering state only, and history archives to `ledger.md`, which is never re-read at boot.
2. *The contract is the goal's defense against its own pursuer.* It defines done as checks the pursuer can't fake, forbids the cheap proxies, forces verification the pursuer didn't judge itself, logs the evidence, and names the temptations that mean *escalate, don't reinterpret*. The discipline is injected **into the contract** — the skill does not assume the target repo supplies it. The file split makes one defense **mechanical**: routine writes never touch `goal.md`, so the urge to edit it *is* the redefinition tripwire firing.

Concretely, `goal.md` carries: the goal as an outcome; the **baseline** (the exact failing command + output, or starting metric — the fixed reference "done" is measured against); **verifiable acceptance checks** (each with a verify command + expected evidence, and a refutation/mutation form for behavior changes) with the **primary verifier** flagged — the strongest check, exercised on the real surface where the outcome matters (running app, real workflow, rendered page; unit tests and builds support it, never replace it), and any capability the pursuer will lack named as an explicit blocked item rather than silently downgraded; an **integrity rules** block (don't edit `goal.md`; don't weaken / skip / rename-away tests or gates; don't narrow scope or reinterpret the goal — escalate; evidence before claims; report failures faithfully); stakes-scaled **approval gates** (irreversible, public, shared, or costly actions go back to the operator even mid-goal), **invariants**, and **non-goals**; operating rules with two skill-shipped defaults when neither repo nor operator states them — the **quality posture** (reliability over speed) and the **commit cadence** (commit at every verified checkpoint, at minimum at each completed phase; local commits are named routine and each green commit a recovery point, with only push/PR separately gated); **when-to-stop** conditions including the tripwire; and an **activation note** — on a runtime with durable goal support (e.g. Codex `create_goal`), the contract activates with a one-line objective pointing at both files; elsewhere a session adopts it directly.

`plan.md` carries the pursuit discipline: the loop shape (act → verify with an independent pass → record evidence → commit the checkpoint → repeat); **plan-update events** (operator steering, material new evidence, a failed verification, a completed phase → re-read both files and revise before continuing); **current state** (the handoff snapshot, evolving with pursuit); **phases** (status / implementation / verification / exit criteria — including a standing committed-work criterion: a phase with uncommitted work is not complete — at most one in progress); stakes-scaled **delegation lanes** (bounded lanes with their own objective, verifier, and stop condition; integration and completion stay with the pursuer); the **progress ledger**, kept boot-sized — one summary line per completed phase plus one-line entries for the phase in progress, the checkpoint sha as the evidence pointer, command output never pasted — with each completed phase's entries rolled up into the append-only `ledger.md` archive via a standing exit criterion; and the single **next action**.

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
- **The hoarded mega-diff.** Observed in live goal pursuit: a contract silent on commits — the producer couldn't invent a cadence nobody stated — inside a loop that gates "consequential actions" leaves the pursuer concluding git is the operator's call, and 50–70k-line uncommitted diffs pile up across phases, one bad command from loss. Micro-testing confirmed the mechanism: with a blank Commits line, pursuers commit only after deriving permission from silence and flag it as a deviation; with the shipped default, the commit step in the loop, and the committed-work exit criterion, committing is rule-following. Hence the skill-shipped cadence default — the one rule besides quality posture the producer writes without an operator statement.
- **The 40k-line plan.** Observed in live goal pursuit: with an append-only, rich-entry ledger inside the file the session re-reads at every boot and compaction, long pursuits grew `plan.md` to tens of thousands of lines — every boot paid the token cost of the goal's entire history, visibly slowing the loop. Micro-testing confirmed the template itself was the cause: under the old wording every control pursuer appended another multi-line prose entry (growth by design, no shedding mechanism), while under the size contract + one-line entry shape + rollup exit criterion all five treatment pursuers converged on the same behavior — one-line entry, phase entries archived to `ledger.md`, one summary line left behind, `plan.md` shrinking at phase completion. Hence the third contract file: steering state stays in the boot path, history doesn't.
- **Fortress for a one-liner.** The opposite failure: loading a trivial goal with the full apparatus. Gate it on stakes and quality posture; ship the always-on four and add the rest as warranted.
- **Treating it as an executor.** It writes the contract; pursuing the goal belongs to the new session. Starting the work in the producing session defeats the handoff.
- **Restating the plan.** The contract links to plan / spec files; copying their content in creates a second source of truth that goes stale.

## Adaptation notes

- The operating-rules categories (branch / commits / push-PR / validation / quality-posture / scope) are portable; the *values* come from each project's own rule files and operator, so the skill adapts automatically.
- The integrity apparatus is the generalized form of a repo's Regression-Prevention Gate. A project that already mandates gates and mutation proofs can lean on its own rule files; a project that doesn't gets the discipline from the contract itself.
- The scratch path (`tmp/<YYYY-MM-DD>-<goal-slug>/`) is a default; point it at whatever scratch dir your project uses, and gitignore it.
- A runtime-side goal-mode skill (e.g. a personal Codex "ultragoal") can consume the contract: design and critique stay here; activation is one `create_goal` call carrying the objective from `goal.md`'s Activation section.
- Pairs naturally with its siblings: pursue the goal, then `handoff-review` for a fresh-eyes review, then `handoff-pr` to package the PR.
