---
name: using-workbench
description: Use when starting any conversation to orient the session in the workbench flow before the first response. Covers how work enters, who owns each moment, and which skill to invoke when one applies. Also answers "how does the workbench flow work?" and "which skill do I use for X?" on demand.
metadata:
  system: workbench
---

If you were dispatched as a subagent to execute a specific task, skip this
orientation.

# Using Workbench

Orientation map for the **workbench** system: how work enters, gets scoped, gets
implemented, and lands.

## At session start

Skim the flow and the ownership table below before diving into the work. When
the task at hand matches a moment with an owning skill, invoke that skill
rather than improvising the process, and say so briefly ("Using audit to size
this investigation"). If a skill turns out wrong for the situation, you don't
have to follow it. Most of these are defaults the user configured rather than
gates: they fire on relevance, not compulsion.

**Two pieces are the exception. They fire by default, not by relevance.**
`verification-before-completion` at every done/fixed/passing claim, and the
adversarial `code-quality-review` once a work-stream's implementation is
complete. Each runs unless **the user explicitly declines it**, or **the repo's
own process supersedes it**. Those are the only two outs: a small diff, a
confident implementation, a tidy-looking change, or time pressure are not
among them, and neither is the session's own judgment that this one looks
fine.

**Repo process takes precedence, in both directions.** When the repo carries
its own process document (`CLAUDE.md`, `AGENTS.md`, `CONTRIBUTING`), follow it
for worktrees, test discipline, and completion gates rather than re-running the
flow's version of the same ceremony. Precedence is not only subtraction: a repo
gate can also invite a tier the flow would otherwise only offer, such as
`empirical-proof`. What survives regardless are the three user gates and the
adversarial review before PR-or-merge. Name which of those you skip and why.

## The flow at a glance

```
ENTRY (two optional doors)
  door A: verify · hunt · check:
      USER sizes the workload → audit runs the engine → USER confirms flagged
      points (only when flags exist) → report·done, or work revealed
  door B: an idea:
      ground it against the codebase → brainstorming owns what the code
      can't answer

SCOPING
  brainstorming, always before feature/refactor design → USER picks the route:
      direct (straight from session) · plan (mechanism from the user's stack:
      plugin skill → repo skill → repo standards → harness plan mode) ·
      handoff-goal (contract dir; fresh session pursues autonomously)

IMPLEMENTATION (agency = user/harness call; implementer gets the plan/goal if present)
  test-driven-development: default where a test harness exists;
      repo conventions take precedence on conflict
  systematic-debugging: on any bug, before fixes

COMPLETION (enters only when the work-stream's implementation is believed complete)
  test-quality review → deemed ready = verified with evidence
  (verification-before-completion; empirical-proof offered if runnable) →
  ONE adversarial review: REQUIRED, not offered (code-quality-review +
  comment trim, per repo rules); skipped only on an explicit user decline or a
  superseding repo process; fires here and nowhere else, right before the
  PR-or-merge ask, never mid-implementation →
  in-scope findings fixed + re-verified, out-of-scope → follow-ups,
  proceed (no re-review) →
  USER gate: session outlines what was done, asks PR or merge
  (explicit repo/user rules may pre-authorize) → land: file-pr · merge · push;
  fix-ci tends the checks

FEEDBACK
  get-pr-comments triages → receiving-code-review governs acting on it →
  verified fixes re-enter implementation
```

## Who owns each moment

| Moment | Piece |
| --- | --- |
| Something to verify / hunt / check | `audit` (engines: `claim-check`, `qa-sweep`) |
| Designing a feature or refactor | `brainstorming` → the user's route pick |
| Big autonomous goal | `handoff-goal` |
| Implementing with a test harness | `test-driven-development` |
| A bug, before proposing fixes | `systematic-debugging` |
| About to claim done / ready | `verification-before-completion` (offer `empirical-proof` if runnable) |
| The implementation's tests | `test-quality-reviewer` |
| The one adversarial pass: **required** once the work-stream is complete, right before PR-or-merge | `code-quality-review` |
| Landing | outline gate → `file-pr` / merge / push; `fix-ci` |
| Review feedback arrives | `get-pr-comments` → `receiving-code-review` |
| Authoring or editing skills | `writing-skills` (ships in the `toolkit` plugin) |

## Picking the verification piece

Several pieces touch verification: pick by the work's shape, don't read
them all:

- `verification-before-completion` is the always-on gate that requires fresh evidence
  before any done/fixed/passing claim. The others deepen it; this one never
  skips.
- `empirical-proof`: one just-finished change with a drivable surface. For
  generator work, the emitted artifact **is** that surface: generate,
  build, drive it.
- `qa-sweep`: a broad decomposable surface (release, branch, feature area)
  at team scale.
- `claim-check`: one premise, ticket, or hunch to investigate.
- `file-pr`: landing, not verification; it assumes the gates already ran.

When no frame fits the work's shape, keep the standard and drop the frame:
prove the deliverable the way its real consumer would exercise it, and
record the evidence. The protocols are checkpoints, not reading
assignments: load one when its moment arrives, not preemptively.

**Cost and authority:** two pieces are always-on:
`verification-before-completion` at every done-claim, and the adversarial
`code-quality-review` once the implementation is complete. Both are default-on
and stop only for an explicit user decline or a superseding repo process.
`empirical-proof` and `qa-sweep` are the expensive tiers.
**Offer them; never default to them.** They run on the user's explicit ask
(now or standing) and not otherwise. A repo's own completion gate that requires
driving the real artifact for a change of this kind **is** that standing ask:
run it, name the gate that invited it, and report the run as part of satisfying
the gate rather than offering it first. Most changes don't warrant them, and
running one uninvited spends the user's time and budget on ceremony they
didn't order.

## Artifacts are disposable

Everything the flow produces along the way, including audit reports written to disk,
brainstorm design docs, route plans, and outlines, is **working material, not
deliverable**: it endures only while the work is being done. Save such
artifacts under **`.workbench/<work_scope>/`** (or `.tmp/workbench/<work_scope>/`
in repos that centralize scratch under `.tmp/`), typically gitignored. Promotion
to a durable artifact is **the user's call**: it happens only when they
explicitly ask, or when the repo has an established pattern for that artifact
kind (e.g. a specs directory with a documented convention). Never quietly turn
working material into committed docs.

**One home per work scope.** Evidence and artifacts from dispatched agents
belong in the **same** folder as the rest of the scope's material: the
dispatching session hands the scope folder's path to every agent in its
contract; agents never invent their own locations. A run that scatters
evidence across per-agent temp directories (or the system temp) has lost its
scope: one work scope, one folder.

## Worktree location

Worktree placement is a convention, not a per-task choice. Prefer the
harness's native worktree mechanism when it has one; it places and cleans up
correctly by construction; hand-roll `git worktree add` only without one.
Before creating one, inspect `git worktree list` and any repo or user rule on
worktrees, and follow the established pattern. Absent one, create worktrees
under
`<repo>/.worktrees/<task-name>`: verifying first that the directory is
ignored (`git check-ignore .worktrees`), adding it to `.gitignore` before the
worktree exists if not, so a checkout never lands in the index. Never place
a worktree in the system temp directory or any path outside the repository
unless the user explicitly asks: temp space is for disposable non-repository
artifacts (logs, screenshots, evidence), not for a repository checkout.

## Scope guard

The accepted work defines the boundary. Two tripwires: either one stops
the work and brings a question to the user instead of growing the diff:

- **Spread:** the change starts crossing owner areas or subsystems the ask
  never named.
- **Size:** the diff grows well past what the accepted work implied: tens
  of files where a few were expected.

Stopping to ask "should this split?" is flow-correct behavior; growing
scope silently is the failure. Adjacent defects discovered along the way
are recorded as follow-up work, not folded in, and the adversarial
review's findings follow the same rule (out-of-scope → follow-up unless
they prove the change unsafe or incorrect).

## The three user gates

Workbench's signature: the user decides at exactly three moments: **size the
workload** (audit), **pick the route** (after brainstorming), **PR or merge**
(after the adversarial review, with the outline in hand; standing rules may
pre-authorize). Everything else is the session's to drive.

## Boundaries

- **Orientation, not compulsion, except for two standing gates.** At session
  start it maps; it never forces, and it never responds to "how does the flow
  work?" by starting the flow. The two default-on completion gates are the
  exceptions: they are the process the user configured, so skipping one is
  the user's call to make, never the session's.
- Workbench never dictates execution agency (in-session vs dispatched) and ships no hooks;
  skill descriptions and the user's own rules are the entire activation surface.
