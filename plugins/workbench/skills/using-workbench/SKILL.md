---
name: using-workbench
description: Use before coding, auditing, planning, shipping, filing a PR, debugging or using any workbench skill.
---

If you were dispatched as a subagent to execute a specific task, skip this orientation.

# Using Workbench

Orientation map for the **workbench** system: how work enters, gets scoped, gets
implemented, and lands.

## When orienting work

Skim the flow and the ownership table below before diving into the work. When
the task at hand matches a moment with an owning skill, invoke that skill
rather than improvising the process, and say so briefly ("Using audit to size
this investigation"). If a skill turns out wrong for the situation, you don't
have to follow it. Most of these are defaults the user configured rather than
gates: they fire on relevance, not compulsion.

**Two completion requirements apply by default:** `verification-before-completion`
at each done/fixed/passing claim, and independent `code-quality-review` before PR-or-merge. Run unless **the user explicitly declines it**, or **the repo's
own process supersedes it**. Those are the only two outs: a small diff, a
confident implementation, a tidy-looking change, or time pressure are not
among them, and neither is the session's own judgment that this one looks
fine.

**Repo process takes precedence, in both directions.** When the repo carries
its own process document (`CLAUDE.md`, `AGENTS.md`, `CONTRIBUTING`), follow it
for worktrees, test discipline, and completion gates rather than re-running the
flow's version of the same ceremony. Precedence is not only subtraction: a repo
gate can also invite a tier the flow would otherwise only offer, such as
`empirical-proof`. Existing scope and delivery authorization carries forward. Independent review
before PR-or-merge follows the explicit waiver/repository exceptions below.

## The flow at a glance

```
ENTRY (two optional doors)
  door A: verify · hunt · check:
      use requested scope; ask if unresolved → audit runs the engine → resolve flagged
      decisions; report empirical uncertainty → report·done, or work revealed
  door B: an idea:
      ground it against the codebase → brainstorming owns what the code
      can't answer

SCOPING
  brainstorming for unresolved design → follow the authorized route or resolve a missing choice:
      direct (straight from session) · plan (mechanism from the user's stack:
      plugin skill → repo skill → repo standards → harness plan mode) ·
      handoff-goal (contract dir; fresh session pursues autonomously)

IMPLEMENTATION (agency = user/harness call; implementer gets the plan/goal if present)
  test-driven-development: default where a test harness exists;
      repo conventions take precedence on conflict
  systematic-debugging: sustained unresolved investigations; skip expected RED and obvious fixes

COMPLETION (enters only when the work-stream's implementation is believed complete)
  test-quality review → deemed ready = verified with evidence
  (verification-before-completion; empirical-proof offered if runnable) →
  ONE adversarial review: REQUIRED, not offered (code-quality-review +
  comment trim, per repo rules); dispatched to a reviewer context that did not
  write the code, never self-served; skipped only on an explicit user decline
  or a superseding repo process; fires here and nowhere else, right before the
  PR-or-merge ask, never mid-implementation →
  blocking findings fixed + re-verified, advisory findings dispositioned, out-of-scope → follow-ups,
  material corrections receive focused independent follow-up; minor verified fixes proceed →
  USER gate: session outlines what was done, asks PR or merge
  (explicit repo/user rules may pre-authorize) → land: file-pr · merge · push;
  fix-ci delegates watching to Opus on Claude or gpt-5.6-sol on Codex

FEEDBACK
  receiving-code-review governs acting on what arrived →
  verified fixes re-enter implementation
```

## Who owns each moment

| Moment | Piece |
| --- | --- |
| Something to verify / hunt / check | `audit` (engines: `claim-check`, `qa-sweep`) |
| Designing a feature or refactor | `brainstorming` → the user's route pick |
| A long-running autonomous goal, outliving this session | `handoff-goal` |
| Implementing with a test harness | `test-driven-development` |
| An unresolved failure requiring sustained investigation | `systematic-debugging` |
| About to claim done / ready | `verification-before-completion` (offer `empirical-proof` if runnable) |
| The implementation's tests | `test-quality-reviewer` |
| The one adversarial pass: **required** once the work-stream is complete, right before PR-or-merge, **dispatched** to a reviewer that did not write the code | `code-quality-review`, run by the `code-quality-reviewer` agent |
| Landing | outline gate → `file-pr` / merge / push; `fix-ci` |
| Review feedback arrives | `receiving-code-review` |

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
- `file-pr`: landing, not verification; it assumes the gates already ran,
  except the adversarial review, which it will not file a code PR without.

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

Working artifacts are normally temporary. That is a storage convention, not permission to delete existing work or evidence. Save such
artifacts under **`.workbench/<work_scope>/`** (or `.tmp/workbench/<work_scope>/`
in repos that centralize scratch under `.tmp/`), typically gitignored. Promotion
to a durable artifact is **the user's call**: it happens only when they
explicitly ask, or when the repo has an established pattern for that artifact
kind (e.g. a specs directory with a documented convention). Never quietly turn
working material into committed docs.

**One home per work scope.** Evidence and artifacts from dispatched agents
belong in the **same** folder as the rest of the scope's material: the
dispatching session hands the scope folder's path to every agent in its
contract; agents never invent their own locations.

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
unless the user explicitly asks.

## User decisions and existing authority

Sizing, design/route choices, and delivery are decision points when the user has
not already settled them. Carry prior authorization forward; do not repeat a
permission question just to satisfy this map. Skills do not authorize destructive
actions or external writes. Missing evidence stays visible and does not become a
question for the user to certify as true.

CI watching always uses a separate Opus agent on Claude or gpt-5.6-sol agent on
Codex, even when the parent is idle or already uses that model. Never assign
watching to Astra/Fable or fall back to parent polling when dispatch is unavailable.
Epic returns require verified acknowledgment and a concrete next action; see
`epic-orchestration` for lane, delivery, audit, and closure handoffs.

## Boundaries

- **Orientation, not compulsion, except for two standing gates.** When needed
  it maps; it never forces, and it never responds to "how does the flow
  work?" by starting the flow. The two default-on completion gates are the
  exceptions: they are the process the user configured, so skipping one is
  the user's call to make, never the session's.
