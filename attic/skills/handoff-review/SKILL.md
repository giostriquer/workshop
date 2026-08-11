---
name: handoff-review
description: Use when work on a branch needs a fresh, unbiased pair of eyes — a pre-PR review, or a clean restart when this session's context has gone bad and a new session should independently verify what was already done and continue it. Produces a self-contained brief (task-vs-code, rules conformance, information leak, correctness) that re-derives the task from ticket + diff, never trusting the prior session. Default spawns a fresh reviewer (verify-only); `handoff`/`session` writes the brief to a scratch file for a new session (verify-only); `continue`/`resume` writes a verify-then-continue brief carrying current state, remaining work, and operating rules, pointing to handoff-goal for substantial forward work.
---

# Handoff Review

Produce a **self-contained brief** for a separate agent or session: to **independently verify** the work on a branch, and — when the work isn't finished or this session's context has gone bad — to **continue it from a verified foundation.** This skill writes the brief; it does **not** perform the review, does **not** pursue the continuation, and does **not** prescribe which tools the receiver uses — tool choice belongs to whoever picks up the brief.

## When to use

- **Pre-PR review.** Implementation on a branch is done, or far enough along, and you want a fresh pair of eyes before opening a PR: confirming the code matches the task, conforms to the repo's rules, leaks nothing, and is correct.
- **Clean restart (recovery).** This session's context has gone bad and you'd rather start fresh — but the work so far is worth keeping. A new session picks up the brief, *independently verifies* what the prior session did (rather than trusting its word), and continues the remaining work from there.

## The one rule that makes this work

The brief must **stand alone**. A receiver who shares this session's context inherits its blind spots, so the brief re-derives the task from the **ticket + diff**, never from "what we discussed this session."

"Stand alone" cuts one way only: exclude the prior session's *interpretation* of the task (that is the bias being removed), but **include the ticket's acceptance criteria** (the ground truth the receiver judges against). Those are different inputs — drop the first, carry the second.

## Verify is the gate for continuing

Continuation rides on the same distrust the review is built from: **verification is the precondition for continuing.** A session that picks up unfinished work and trusts the prior session's "done" is building on sand — especially when the reason for the restart is that the prior session went sideways. So the receiver always **verifies first, then builds**: the review is not an add-on to the continuation, it is its gate.

## Modes

Three modes — the existing two are unchanged; `continue` adds the recovery case.

- **default (spawn)** — `/handoff-review`: dispatch a fresh agent (the host's general-purpose agent) with the brief as its entire prompt — no session history — and return its findings. **Verify-only.**
- **handoff** (`handoff-review handoff`, alias `session`): write the brief to a scratch file for a new session and print it for copy-paste. Spawn nothing. **Verify-only.**
- **continue** (`handoff-review continue`, alias `resume`): write a **verify-then-continue** brief to a scratch file for a new session — it verifies the prior work, then continues the remaining work from the verified state. Spawn nothing: a fresh session is the whole point of a restart, and an ephemeral subagent cannot become your next working session.

## Steps

1. **Detect branch and base.** Run `git branch --show-current` and determine the base branch (default `main` unless the repo says otherwise). Capture the diff range with `git diff <base>...HEAD --stat` and the commit list.
2. **Identify the ticket.** Scan the branch name, commit messages, and any existing PR description for a ClickUp / Linear / Jira id or URL. Present what you found and ask the operator to confirm or supply the right one. If none is found, ask.
3. **Get the ticket's substance, not just its link** — this is what makes the task-vs-code check real:
   - If a tracker integration is reachable (ClickUp / Linear / Jira MCP, or web access to the ticket URL), fetch the ticket body / acceptance criteria and embed it verbatim in the brief.
   - Else, ask the operator to paste the acceptance criteria.
   - Else, write a short task summary and label it explicitly **"implementer's claim — verify against the actual ticket."** Never present a session-derived paraphrase as ground truth.
4. **For `continue` mode, also capture the continuation inputs** (skip for the two verify-only modes):
   - **Current state, from the repo not memory.** Branch, what exists, what's done / half-done, decisions already made — verified with `git status` / `git log` / the files, because the session handing off may be the unreliable one.
   - **Remaining work as an outcome.** State what's left as an outcome with a short definition of done, not a step list — the continuing session owns the path.
   - **Operating rules, concrete values.** Branch / worktree, commit cadence and message style, push policy, PR policy, validation gates, and the quality posture (default: reliability over speed) — sourced from the repo's rule files (`CLAUDE.md` / `AGENTS.md` / convention docs) and what the operator stated this session; ask for whatever is still open. Never invent a rule the operator didn't state and the repo doesn't mandate.
5. **Assemble the brief** using the template below. It names *what* to verify, never *how* — no tool or skill names. Include the **Continuation** block only in `continue` mode.
6. **Deliver by mode:**
   - **default (spawn):** dispatch a fresh agent with the brief as its entire prompt and return its findings.
   - **handoff / continue:** write the brief to `tmp/handoff-review-<branch-slug>.md` (sanitize the branch name: `/` → `-`), tell the operator the path, and print the brief for copy-paste into a new session. Do not spawn an agent.

## The brief template

> **Handoff brief — `<branch>` vs `<base>`**
>
> **Task (from ticket `<id / url>`):**
> `<acceptance criteria, verbatim from the ticket — or, if unavailable, the labeled "implementer's claim, verify against the ticket" summary>`
>
> **Diff scope:** `<files / stat summary>` — see it with `git diff <base>...HEAD`.
>
> **Verify the following, forming your own judgment from the diff — do not trust any summary above:**
> 1. **Task vs. code** — does the diff actually deliver the acceptance criteria? Call out anything asked-for-but-missing and anything done-but-not-asked.
> 2. **Rules / conventions** — read this repo's own `CLAUDE.md` / `AGENTS.md` / convention docs and check the diff against them. (This brief does not restate the rules; read them.)
> 3. **Information leak** — secrets / keys / tokens, internal hostnames or absolute paths, and private domain content that should not ship.
> 4. **Correctness / quality** — bugs, missing error handling, untested risk.
>
> **Report:** findings grouped by severity (blocker / major / minor / nit), each with `file:line` and a concrete fix, then a **verified-state verdict** — what is confirmed-good, what is broken, what is incomplete. (Verify-only modes can stop at an overall **go / no-go**.)
>
> **— Continuation (include this block only in `continue` mode) —**
>
> **You are not only verifying — you are continuing this work. But continue only from a verified foundation:** run the verification above first. If it surfaces blockers in the prior work, fix or escalate those *before* building on top. Never trust the prior session's "done."
>
> **Current state:** `<branch, what exists, what's done / half-done, decisions already made — re-derived from the repo>`
>
> **Remaining work (the outcome to reach):** `<the outcome + a short definition of done — not a step list>`
>
> **Operating rules:**
> - **Branch / worktree:** `<where the work happens>`
> - **Commits:** `<cadence, message style>`
> - **Push / PR:** `<push policy; whether, when, and where a PR opens>`
> - **Validation:** `<gates that must pass, and when>`
> - **Quality posture:** `<operator-set — default: reliability over speed>`
> - **Scope / stop-and-ask:** `<boundaries; what must go back to the operator>`
>
> **If the remaining work is substantial or high-stakes,** don't free-hand it: generate a `handoff-goal` document for it, so the forward build carries verifiable acceptance checks, integrity rules, and an independent-verification pass. This brief gets you a verified foundation and the outcome; `handoff-goal` carries the discipline for the build.

## Rules

- Never run the review yourself and never pursue the continuation yourself; this skill produces the brief and hands off.
- Never name tools or skills for the receiver to use — the one allowed exception is `continue` mode pointing at `handoff-goal` for substantial forward work.
- Never let the prior session's interpretation stand in for the ticket's acceptance criteria.
- The brief must be readable with zero access to this session.
- Continuation rides on verification: the `continue` brief always tells the receiver to verify first and continue only from a verified foundation.
- Keep the continuation extension light — current state, the remaining outcome, and operating rules. It does **not** reproduce `handoff-goal`'s acceptance-checks / integrity apparatus; for that, it points at `handoff-goal`.
