---
name: using-workbench
description: Use when starting any conversation — orients the session in the workbench flow before the first response: how work enters, who owns each moment, and which skill to invoke when one applies. Also answers "how does the workbench flow work?" and "which skill do I use for X?" on demand.
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
rather than improvising the process — and say so briefly ("Using audit to size
this investigation"). If a skill turns out wrong for the situation, you don't
have to follow it. These are defaults the user configured, not gates: skills
fire on relevance, never on compulsion.

## The flow at a glance

```
ENTRY (two optional doors)
  door A — verify · hunt · check:
      USER sizes the workload → audit runs the engine → USER confirms flagged
      points (only when flags exist) → report·done, or work revealed
  door B — an idea:
      ground it against the codebase → brainstorming owns what the code
      can't answer

SCOPING
  brainstorming — always before feature/refactor design → USER picks the route:
      direct (straight from session) · plan (mechanism from the user's stack:
      plugin skill → repo skill → repo standards → harness plan mode) ·
      handoff-goal (contract dir; fresh session pursues autonomously)

IMPLEMENTATION (agency = user/harness call; implementer gets the plan/goal if present)
  test-driven-development — default where a test harness exists;
      repo conventions take precedence on conflict
  systematic-debugging — on any bug, before fixes

COMPLETION
  test-quality review → deemed ready = verified with evidence
  (verification-before-completion; empirical-proof offered if runnable) →
  ONE adversarial review (code-quality-review + comment trim, per repo rules) →
  findings fixed + re-verified, proceed (no re-review) →
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
| The one adversarial pass | `code-quality-review` |
| Landing | outline gate → `file-pr` / merge / push; `fix-ci` |
| Review feedback arrives | `get-pr-comments` → `receiving-code-review` |
| Authoring or editing skills | `writing-skills` (ships in the `toolkit` plugin) |

## Picking the verification piece

Several pieces touch verification — pick by the work's shape, don't read
them all:

- `verification-before-completion` — the always-on gate: fresh evidence
  before any done/fixed/passing claim. The others deepen it; this one never
  skips.
- `empirical-proof` — one just-finished change with a drivable surface. For
  generator work, the emitted artifact **is** that surface — generate,
  build, drive it.
- `qa-sweep` — a broad decomposable surface (release, branch, feature area)
  at team scale.
- `claim-check` — one premise, ticket, or hunch to investigate.
- `file-pr` — landing, not verification; it assumes the gates already ran.

When no frame fits the work's shape, keep the standard and drop the frame:
prove the deliverable the way its real consumer would exercise it, and
record the evidence. The protocols are checkpoints, not reading
assignments — load one when its moment arrives, not preemptively.

**Cost and authority:** `verification-before-completion` is the only
always-on piece. `empirical-proof` and `qa-sweep` are the expensive tiers —
**offer them, never default to them**: they run on the user's explicit ask
(now or standing) and not otherwise. Most changes don't warrant them, and
running one uninvited spends the user's time and budget on ceremony they
didn't order.

## Artifacts are disposable

Everything the flow produces along the way — audit reports written to disk,
brainstorm design docs, route plans, outlines — is **working material, not
deliverable**: it endures only while the work is being done. Save such
artifacts under **`.workbench/<work_scope>/`** (or `.tmp/workbench/<work_scope>/`
in repos that centralize scratch under `.tmp/`), typically gitignored. Promotion
to a durable artifact is **the user's call**: it happens only when they
explicitly ask, or when the repo has an established pattern for that artifact
kind (e.g. a specs directory with a documented convention). Never quietly turn
working material into committed docs.

## Worktree location

Worktree placement is a convention, not a per-task choice. Prefer the
harness's native worktree mechanism when it has one — it places and cleans up
correctly by construction; hand-roll `git worktree add` only without one.
Before creating one, inspect `git worktree list` and any repo or user rule on
worktrees, and follow the established pattern. Absent one, create worktrees
under
`<repo>/.worktrees/<task-name>` — verifying first that the directory is
ignored (`git check-ignore .worktrees`), adding it to `.gitignore` before the
worktree exists if not, so a checkout never lands in the index. Never place
a worktree in the system temp directory or any path outside the repository
unless the user explicitly asks — temp space is for disposable non-repository
artifacts (logs, screenshots, evidence), not for a repository checkout.

## The three user gates

Workbench's signature: the user decides at exactly three moments — **size the
workload** (audit), **pick the route** (after brainstorming), **PR or merge**
(after the adversarial review, with the outline in hand; standing rules may
pre-authorize). Everything else is the session's to drive.

## Boundaries

- **Orientation, not compulsion.** At session start it maps; it never forces —
  and it never responds to "how does the flow work?" by starting the flow.
- Workbench never dictates execution agency (in-session vs dispatched) and ships no hooks;
  skill descriptions and the user's own rules are the entire activation surface.

---
