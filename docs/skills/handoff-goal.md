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
├─ goal.md  — the frozen contract; the pursuer may not edit it
└─ plan.md  — the status-tracked route; the pursuer advances it by status flips only
```

The contract is built on **two rules**:

1. *The contract is the only context that survives.* The pursuing session starts with zero access to the producing session and compacts while it works, so everything it needs — goal, state, operating rules — lives in the files, and the files tell it to keep coming back. And because those files are re-read at every boot and after every compaction, they must stay small — which the contract makes mechanical: the pursuer's writes to `plan.md` are status flips only (phase status, checkbox ticks), never prose, evidence, or command output. History lives in git commits and session output, never in the contract directory — any sanctioned evidence file was observed to grow without bound under pursuit pressure, so there is none.
2. *The contract is the goal's defense against its own pursuer.* It defines done as checks the pursuer can't fake, forbids the cheap proxies, forces verification the pursuer didn't judge itself, demands evidence be shown (in session output and commits) before any claim, and names the temptations that mean *escalate, don't reinterpret*. The discipline is injected **into the contract** — the skill does not assume the target repo supplies it. The file split makes one defense **mechanical**: the pursuer never edits `goal.md` — its only writes are status updates in `plan.md` — so the urge to touch `goal.md` *is* the redefinition tripwire firing.

Concretely, `goal.md` carries: the goal as an outcome; the **baseline** (the exact failing command + output, or starting metric — the fixed reference "done" is measured against); **verifiable acceptance checks** (each with a verify command + expected evidence, and a refutation/mutation form for behavior changes) with the **primary verifier** flagged — the strongest check, exercised on the real surface where the outcome matters (running app, real workflow, rendered page; unit tests and builds support it, never replace it), and any capability the pursuer will lack named as an explicit blocked item rather than silently downgraded; an **integrity rules** block (don't edit `goal.md`; don't weaken / skip / rename-away tests or gates; don't narrow scope or reinterpret the goal — escalate; evidence before claims; report failures faithfully); stakes-scaled **approval gates** (irreversible, public, shared, or costly actions go back to the operator even mid-goal), **invariants**, and **non-goals**; operating rules with two skill-shipped defaults when neither repo nor operator states them — the **quality posture** (reliability over speed) and the **commit cadence** (commit at every verified checkpoint, at minimum at each completed phase; local commits are named routine and each green commit a recovery point, with only push/PR separately gated); **when-to-stop** conditions including the tripwire; and an **activation note** — on a runtime with durable goal support (e.g. Codex `create_goal`), the contract activates with a one-line objective pointing at both files; elsewhere a session adopts it directly.

`plan.md` carries the pursuit discipline: the loop shape (act → verify with an independent pass → commit the checkpoint → flip the status → repeat); the **review cadence**, scaled to the landed work — a small task's independent pass is a clean Verify re-run, never a per-task reviewer dispatch; reviewers come in after a substantial chunk (a feature, a bug fix, a risky refactor); and each completed phase gets an adversarial code-quality review of its cumulative diff (the `code-quality-review` skill where available), held in place by a standing exit criterion; the **permitted-writes contract** — the pursuer may only set a phase's status (at most one `in progress`; `done` when its verification passed; `blocked` as it occurs) and tick checkboxes whose condition verifiably holds, never prose, evidence, output, history, or new sections (the durable record is git — the commit message carries what a note would have; route changes go back to the operator); the **resumption rule** (re-read `goal.md` then `plan.md`, continue at the in-progress phase's first unchecked box; never reconstruct history first — re-run a Verify command to confirm where a check stands); **current state** (the handoff snapshot, written once — pursuit state lives in the statuses); **phases** (status / implementation / verification / exit criteria — including a standing committed-work criterion: a phase with uncommitted work is not done — at most one in progress); and stakes-scaled **delegation lanes** (bounded lanes with their own objective, verifier, and stop condition, evidence returned in session output; integration and completion stay with the pursuer).

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
- **Living state in `goal.md`.** The split only defends if routine writes never touch the contract: phase status and checkbox state live in `plan.md` (and evidence in git and session output); `goal.md` freezes at handoff.
- **Silently downgraded verifier.** When the pursuing session won't have the capability the real-surface check needs, the temptation is to swap in a unit test and move on. Name the gap as a blocked item with the manual test the operator must run instead.
- **The hoarded mega-diff.** Observed in live goal pursuit: a contract silent on commits — the producer couldn't invent a cadence nobody stated — inside a loop that gates "consequential actions" leaves the pursuer concluding git is the operator's call, and 50–70k-line uncommitted diffs pile up across phases, one bad command from loss. Micro-testing confirmed the mechanism: with a blank Commits line, pursuers commit only after deriving permission from silence and flag it as a deviation; with the shipped default, the commit step in the loop, and the committed-work exit criterion, committing is rule-following. Hence the skill-shipped cadence default — the one rule besides quality posture the producer writes without an operator statement.
- **The plan as evidence hoard.** Observed in live goal pursuit, twice, escalating. First: with an append-only, rich-entry ledger inside the file the session re-reads at every boot and compaction, long pursuits grew `plan.md` to ~40k lines — every boot paid the token cost of the goal's entire history. The first fix (toolkit `0.13.2`) bounded the record's shape — one-line entries, history rolled up to a third `ledger.md` file never re-read at boot — and micro-tested clean. It failed anyway: a later live pursuit produced a **450,388-character `plan.md`** the pursuer treated as "the authoritative append-only ledger," spending entire post-compaction sessions re-reading it in 40k-character chunks while doing no goal work — the contract's own "the ledger outranks recollection" converted the bloat into a mandatory full replay. The lesson: as long as *any* evidence recording into contract files is sanctioned, pursuit pressure inflates it. Hence the current design (see `docs/decisions/handoff-goal-status-only-plan.md`): pursuit-side plan writes are status flips only, `ledger.md` is gone, git commits and re-runnable Verify commands are the record, and resumption is by status, not history replay.
- **Fortress for a one-liner.** The opposite failure: loading a trivial goal with the full apparatus. Gate it on stakes and quality posture; ship the always-on four and add the rest as warranted.
- **Treating it as an executor.** It writes the contract; pursuing the goal belongs to the new session. Starting the work in the producing session defeats the handoff.
- **Restating the plan.** The contract links to plan / spec files; copying their content in creates a second source of truth that goes stale.

## Adaptation notes

- The operating-rules categories (branch / commits / push-PR / validation / quality-posture / scope) are portable; the *values* come from each project's own rule files and operator, so the skill adapts automatically.
- The integrity apparatus is the generalized form of a repo's Regression-Prevention Gate. A project that already mandates gates and mutation proofs can lean on its own rule files; a project that doesn't gets the discipline from the contract itself.
- The scratch path (`tmp/<YYYY-MM-DD>-<goal-slug>/`) is a default; point it at whatever scratch dir your project uses, and gitignore it.
- A runtime-side goal-mode skill (e.g. a personal Codex "ultragoal") can consume the contract: design and critique stay here; activation is one `create_goal` call carrying the objective from `goal.md`'s Activation section.
- Pairs naturally with its siblings: pursue the goal, then `handoff-review` for a fresh-eyes review, then `handoff-pr` to package the PR.
