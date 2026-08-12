# handoff-review (deprecated)

> **Deprecated 2026-08-10.** Retired from the `toolkit` plugin (last shipped in
> 0.16.5); the spec is parked verbatim alongside this doc in
> [`SKILL.md`](SKILL.md)
> and no plugin or host ships it. For handing substantial forward work to a new
> session use [`handoff-goal`](../../../../plugins/workbench/skills/handoff-goal/SKILL.md); for a pre-PR fresh-eyes pass,
> dispatch a reviewer directly. Kept here so the origin story stays findable.

## Origin

Two pressures, one skill.

The first: a prompt the maintainer rewrote by hand at the end of nearly every branch — "give this a fresh, unbiased review before we open the PR — does the code match the task, does it follow our rules, did we leak anything." Written ad hoc, it drifted: different wording each time, the leak check sometimes dropped, the review sometimes run by the same session that wrote the code (the worst possible judge).

The second surfaced in lived-in use: the narrow pre-PR framing saw low usage, because the moment that actually wants a fresh session is not "the branch is done, review it" but **this session's context has gone bad and I want to start over without losing the work.** Restarting by hand re-introduced the exact bias the review removes — the new session trusted the prior session's claims and built on unverified work.

`handoff-review` formalizes both into one self-contained brief that a *different* agent or session runs: verify the work unbiased, and — when needed — continue it from a verified foundation.

## Problem

Three failure modes in the ad-hoc flow:

1. **Biased reviewer.** The implementing session "knows" the intent and reads it into the diff, so it confirms its own work. A genuinely fresh review has to re-derive the task from the ticket and the diff.
2. **Hollow task-vs-code check.** Handed only a ticket id, a fresh reviewer can't open it and silently falls back to reviewing commits alone — gutting the most important dimension.
3. **Continuation on sand.** A hand-rolled restart trusts the prior (possibly compromised) session's "done" and builds on top of unverified work, propagating whatever sent the first session sideways.

## Solution shape

A brief generator, not a doer. It gathers branch + base + diff, identifies the ticket, and pulls the ticket's *acceptance criteria* into the brief (tracker fetch → operator paste → labeled "implementer's claim" fallback). The brief names four verification dimensions (task-vs-code, rules conformance, information leak, correctness) and prescribes no tools.

The load-bearing idea that unifies review and continuation: **verification is the precondition for continuing.** The receiver always verifies first; continuation, when in scope, builds only on a verified foundation.

Three modes:

- **default (spawn)** — a fresh agent verifies and returns findings.
- **handoff / session** — write a verify-only brief to a scratch file for a new session.
- **continue / resume** — write a verify-**then-continue** brief: it adds current state (re-derived from the repo), the remaining work as an outcome, and concrete operating rules; gates continuation on a clean verification; and, for substantial forward work, points at `handoff-goal` rather than duplicating its acceptance-checks / integrity apparatus.

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
- **Continuing before verifying.** The `continue` brief gates the build on a clean verification — building on the prior session's unverified "done" is the failure the recovery mode exists to prevent.
- **Treating it as a doer.** It produces the brief; it never reviews and never pursues the continuation.
- **Bloating the continuation.** The extension stays light (state + outcome + rules). Full forward-work discipline lives in `handoff-goal`; the brief points there rather than copying it.

## Adaptation notes

- The four verification dimensions are portable; the **rules / conventions** dimension points the receiver at the repo's own `CLAUDE.md` / `AGENTS.md` / convention docs rather than restating rules, so it adapts to any project automatically.
- Ticket trackers vary (ClickUp / Linear / Jira). The substance-fetch step degrades gracefully when no tracker integration is present.
- The scratch path (`tmp/...`) is a default; point it at whatever scratch dir your project uses, and gitignore it.
- The `continue` mode pairs with `handoff-goal`: this skill establishes a verified foundation and the remaining outcome; `handoff-goal` carries the heavyweight discipline for a substantial forward build.
