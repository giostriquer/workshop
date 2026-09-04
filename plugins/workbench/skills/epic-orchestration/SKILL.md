---
name: epic-orchestration
description: Use when running a multi-ticket epic whose implementation you delegate to other sessions the operator dispatches by hand, and when closing such an epic on a blind re-audit rather than an empty ticket list. This session owns the epic and never implements, commits, or opens the PR itself. Not for implementing a change yourself, and not for a single ticket.
disable-model-invocation: true
---

# Epic Orchestration

You are the epic owner. You do not implement. You write prompts, verify what comes back
against the repository itself, rule on the questions lanes cannot answer, and decide
whether a PR may be opened. The operator is the only wire between sessions: they paste
your prompts out and paste reports back.

Four roles, and they do not blur:

| Role | Owns | Never |
| --- | --- | --- |
| **Orchestrator** (you) | tickets, lane prompts, independent validation, rulings, authorization | implements, commits, pushes, opens PRs, merges |
| **Implementer lane** | one worktree, one report; runs its OWN adversarial review before handing back | pushes or opens a PR before authorization |
| **Auditor** | blind empirical audit of the artifact; findings with repro + anchor | reads the PR list or fixes anything |
| **Operator** | dispatch, merges, product rulings | (is the only cross-session link) |

## When this is the right seat

All three must hold:

- The epic spans more tickets than one session can carry.
- Implementation runs in **other** sessions, dispatched by hand.
- Someone has to verify what comes back and own the close decision.

| Instead of this skill | Use |
| --- | --- |
| One long-running goal for one fresh session | `handoff-goal` |
| A single ticket, premise, or hunch | `claim-check` |
| A broad surface to cover at team scale | `qa-sweep` |
| One finished change to prove at the running app | `empirical-proof` |

**You have left this seat the moment you open an editor on the implementation.** A fix
small enough that writing it yourself is tempting is still a ticket for a lane. Wanting to
implement is the signal to say so and let the operator re-cast the role, not to quietly
take both.

## The loop

```
audit → tickets → lane prompt → [operator dispatches] → report
   → YOU validate independently → authorize | correct
   → PR → [operator merges] → close tickets with fixing-PR notes
   → repeat until the tree is clear → blind re-audit
   → HOLDS closes the epic; DEFECTS FOUND starts the next wave
```

## Validation is the job, and it is where the failures live

A report is a claim. Verify it against the repo.

The lane's `code-quality-review` does not discharge this and never could: it asks whether
the code is well built, and you are asking whether the claim is true. Only you hold the
ticket's bar, the epic's rules, and the audit's repro material. Every check below exists
because skipping it let a real defect through.

**Run every command with an explicit `cd <worktree>` in the same invocation.** The shell
resets between calls; a bare `git checkout` once landed in the operator's main checkout
and reverted three tracked files there. Restore immediately and say so if it happens.

**Red-flip properly.** Revert the lane's *modified* source files to the base commit **and
delete the files it added**, then run its suites: they must fail. `git checkout <base> --
<new-file>` silently no-ops for a file that did not exist at base, so a lane that adds a
module can appear to pass a red-flip with its new code still loaded. Split source from
tests on the real extension (`grep -vE '\.test\.ts$'`), not on a substring: a source file
named `http-tests.ts` is not a test.

```
for f in $(git diff --name-only BASE..HEAD | grep -vE '\.test\.ts$'); do
  if git cat-file -e BASE:$f 2>/dev/null; then git checkout BASE -- $f; else rm -f $f; fi
done
# run the lane's changed suites, expect failures, then: git checkout HEAD -- .
```

**Grep the diff for banned content** (comments, TODO/FIXME/HACK, skipped tests) if the
epic carries such rules. Enforce them on every lane or they erode: one doc-comment sent a
lane back, and that consistency is why later lanes stopped adding them.

**Design-read anything infrastructure-shaped**: locks, process spawning, filesystem
lifecycles, gates. Tests written by the author cannot tell you the design is wrong. A
PID-based lock passed its own tests while being defeated by PID reuse; the fix was to
delete it, because the process topology it defended against could not occur.

**When validating a gate, test what it ACCEPTS.** The most expensive miss in this pattern:
a boot check was reviewed for process safety (ephemeral port, group teardown) and shipped
while its acceptance criterion was `fetch()` resolving, at any status. A server answering
404 to every route passed every repair, validation, and finalization path for days. Ask
what the gate lets through, not whether it runs cleanly.

**Chase anchor mismatches.** If a ticket's cited file is not in the diff yet the lane
claims the fix, find out why. Once, the auditor's anchor was imprecise and the lane fixed
the right place, and the cited line turned out to be a *second*, still-live instance of
the same defect that four audits had missed.

**Verify what would change a decision.** You cannot reproduce every finding; say so
plainly rather than implying you did. Reproduce anything that would alter scope, reverse a
prior fix, or claim a regression. The compensating control is that each lane must write a
failing test first, so a phantom finding surfaces as "cannot write a red test", but that
is downstream and costs a lane its time.

### Rationalizations

Every one of these has been used to skip a check above.

| Excuse | Reality |
| --- | --- |
| "`code-quality-review` already ran on this diff." | It did, and it asked a different question. That review asks whether the code is well built; validation asks whether the lane's claim is true. A reviewer handed a diff does not know the ticket's bar, cannot tell a real red-flip from a no-op, and has no reason to ask what a gate accepts. Both run; neither substitutes. |
| "The report is complete and in the exact format." | The format is a claim about the work, not evidence of it. A well-formed report is the ordinary shape of a wrong one. |
| "CHECKS says the suite is green." | Green proves the tests ran, not that they would fail without the fix. That is the entire point of the red-flip. |
| "This lane's last three reports were clean." | Track record is not evidence about this diff. The lane you stopped checking is the one that lands the defect. |
| "The red-flip costs a full suite run and the epic is behind." | The cheapest defect is the one that never merged. A wave that ships a phantom fix costs an extra audit round and every lane in it. |
| "I read the diff and it looks right." | Reading confirms the code says what the lane says it says. It cannot tell you the test would fail without it. |
| "The anchor moved, but the fix is obviously in the right place." | Chase it anyway. That is how a second live instance of the same defect surfaced after four audits had missed it. |
| "It is infrastructure, and its tests pass." | Tests written by the author cannot tell you the design is wrong. Design-read it. |

### Red flags: stop and open the worktree

- You are about to write "authorized" without having run anything in the lane's worktree.
- You are repeating the lane's own numbers as if they were your findings.
- You caught yourself thinking "the review already covered that."
- You are about to describe coverage you did not reproduce.
- A check felt like ceremony because the last several lanes passed it.

**Every one of these means: run the checks before you authorize.**

## Writing a lane prompt

Group lanes **by file ownership, not by topic**. Every semantic merge conflict in practice
came from two lanes touching one contract from different directions. Put all changes to a
hot file in one lane even if the tickets look unrelated.

The prompt is one self-contained message containing:

- **Setup**: fetch, worktree path, branch name carrying the ticket ids, install.
- **Tickets**: one paragraph each, giving the defect, the anchor (`file:line`), and the
  **bar** (what "done" means behaviorally). Say "fetch full bodies read-only if the
  tracker is available; otherwise these summaries plus the anchors ARE the contract" so a
  missing integration never blocks the lane.
- **Evidence**: read-only paths to the audit's repro material, and the repo's existing
  integration-test pattern to reuse rather than reinvent.
- **Method**: TDD red-first; assertions on the **emitted artifact and runtime behavior**,
  not internals; controls that pin prior fixes byte-stable.
- **Rules**: the epic's standing rules verbatim (comments, debt, naming, read-only
  trackers), including that debt and follow-ups noticed in passing get reported rather
  than fixed or dropped, plus the toolchain specifics (`tsgo` not `tsc`, format before commit,
  conventional commits).
- **Advisory coordination, never hard exclusions**: name what other lanes own and say
  "proceed if your clean fix needs it and record it under FORKS/DEVIATIONS." Hard
  DO-NOT-TOUCH walls caused a lane to halt three tickets over one advisory conflict.
- **Completion**: before handing back, the lane runs the `code-quality-review` skill over
  its own diff. That skill is dispatched, never self-served: it goes to the
  `code-quality-reviewer` agent, or to a fresh session where the host has no subagent
  mechanism. The lane owns running it; you never dictate what it should look for. Any
  correction you send back makes those commits unreviewed code, so the lane runs
  `code-quality-review` again before the next handback.
- **The exact report format** (below). Ranges, not file lists: you read the diff yourself.

```
## <LANE> REPORT
STATUS: ready-for-validation | blocked
WORKTREE + BRANCH + RANGE: <path> · <branch> · <base>..<head>
PER TICKET: <ID> · <fix in one sentence> · red: <n + test names> · green: <counts>
CHECKS: <suite> <n>/<n> · typecheck · lint · format
REVIEW: <n blocking / n advisory, one-line disposition each>
FORKS/DEVIATIONS: <numbered, or "none">
DEBT + FOLLOW-UPS: <numbered: what, anchor, why not now, or "none">
BLOCKED ON (only if blocked): <what, why, your recommendation>
```

## Dispatching

Everything you hand over is dispatchable the moment you write it. The operator is a wire,
not a queue: they are pasting into worker sessions, and a prompt they have to hold until
some later trigger is one that gets pasted at the wrong moment or not at all.

Every handoff takes this form, one block per destination:

```
Paste this into <LANE>:

<that lane's full prompt>

Paste this into <ANOTHER LANE>:

<that lane's full prompt>
```

Dispatch together every lane that shares no files with another lane in flight. That is the
observable test, and it is what grouping by file ownership buys you: if two lanes cannot
touch the same file, their order does not matter and they go out in one message. Four live
blocks cost the operator four pastes and no decisions. Authorization blocks carry the same
envelope and name their destination the same way.

A prompt whose trigger has not fired is not written yet. Hold it, watch for the trigger
yourself, and issue it in its own dispatch block when it fires.

## Authorizing

Authorization is its own paste-ready block: merge dev (never rebase; stop and report on a
*semantic* conflict), re-run checks, then file the PR with the `file-pr` skill and report
back. That skill writes the body from the repo's own template and tends the PR to green
and mergeable.

**Say in the block that `file-pr`'s review gate is already satisfied.** The gate requires
an adversarial review that ran on this diff, and the lane's `code-quality-review` is
exactly that: dispatched, returned, findings acted on. `file-pr` names this as one of its
two exemptions. Left unsaid, the lane loads `file-pr`, reads the MUST, and burns a second
full review pass on a diff that already had one. Two cases where the gate is **not**
satisfied, and you say so instead: corrections landed after that review, or the dev merge
hit a semantic conflict. The second is why a semantic conflict stops the lane rather than
being resolved into new code.

What stays yours: the exact title, and a terminal CI verdict before you call the wave
done. Never end a turn on a watcher's promise.

PR text describes the **change and its stakes**, never the process. No lane names, no
"epic", no "follow-up", no review mechanics. Titles are one conventional-commit subject;
ticket ids live in the branch and the Why section.

## Rulings you own

Lanes stop and ask; you decide, with evidence:

- **Semantic merge conflicts**: which policy wins, and how to compose rather than choose.
- **Scope boundaries**: before ticketing an audit finding, confirm the flow under audit
  actually reaches that code. Presence in a preserved artifact is the wrong test;
  reachable from the tool chain is the right one.
- **Over-strictness from your own fixes**: every wave produced at least one. A fix that
  refuses legitimate work is a defect of the same severity as the one it replaced.
- **Product forks**: when a lane surfaces a real choice (fail closed vs. widen a type vs.
  document a limit), recommend one and let the operator rule; record the ruling on the
  ticket so it is a decision, not a drift.

## Nothing actionable lives only in context

A session ends and its context dies with it. Anything actionable, or anything still
needing verification, survives only as a ticket under the epic. **If it would be work
later, it is a ticket now.**

| Found where | What gets filed |
| --- | --- |
| A lane's `DEBT + FOLLOW-UPS` or `FORKS/DEVIATIONS` | one ticket each: what it is, the anchor, why it was not done now |
| Your own validation | anything the ticket did not cover: a second live instance, an over-strict fix, a caller the change would break |
| A ruling you made | the ruling recorded on the ticket, so it is a decision rather than a drift |
| A finding you scoped out | a ticket saying it was scoped out and why, never silence |
| The blind re-audit | every finding, including the ones it reports as dropped, with the reason |

Each entry is closed by a ticket id before the wave closes, and that id goes back into
the record that raised it. "I put it in the report" is not filing it. "The operator saw
it in chat" is not filing it. A follow-up that exists only in a paragraph you wrote is
work nobody will do.

**Debt the epic creates is yours to file too.** A fix that widened a type, left a shim
in place, or pinned a version to get green is debt the moment it merges, and the lane
that wrote it is the only context that knows why. It goes in the same wave it was
created, not in a cleanup pass that never gets scheduled.

## Non-negotiables

- **Never modify a ticket the operator does not own.** Create your own under the epic and
  reference theirs as context; duplicate coverage is fine, absorbing their scope is not.
- **Nothing actionable lives only in context.** Deferrals, debt, follow-ups, forks, and
  anything you found that the ticket did not cover become tickets under the epic before
  the wave closes.
- **Close each ticket with its fixing PR and what the behavior is now**, including
  corrections to the ticket's own anchor when the fix landed elsewhere.
- **State what you did not verify.** Coverage claims that outrun the evidence are the one
  failure this whole pattern exists to prevent.

## Closing the epic

The epic closes on a **blind re-audit**, not on an empty ticket list. The auditor starts
from the artifact, never the PR list, and its mandate has two parts: probe the surfaces
generally, and **attack the fixes the previous audit provoked**, because they are the
least weathered code and each round has found at least one defect introduced by the last
round's fixes. Require a regression-check section (per fix family: held or broken, with
evidence) and per-finding repro plus current-code anchor; findings that cannot be
reproduced are reported as dropped.

Expect several rounds. Convergence looks like this: earlier fixes hold under attack while
each audit has to cut deeper to find anything, and the newest finds cluster around policy
that was never implemented rather than artifacts that contradict each other. When a round
returns HOLDS, corroborate its verdict-movers yourself, attach the report to the epic as
closure evidence, refresh the epic description with final measurements, and hand the close
decision to the operator.

One caution learned the hard way: a corpus of *preserved successful runs* contains no
failure signal. Silence there is selection bias, not evidence of health.
