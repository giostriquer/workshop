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
  test-driven-development — default where a test harness exists
  systematic-debugging — on any bug, before fixes

COMPLETION
  test-quality review → deemed ready = verified with evidence
  (verification-before-completion; empirical-proof if runnable) →
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
| About to claim done / ready | `verification-before-completion` (`empirical-proof` if runnable) |
| The implementation's tests | `test-quality-reviewer` |
| The one adversarial pass | `code-quality-review` |
| Landing | outline gate → `file-pr` / merge / push; `fix-ci` |
| Review feedback arrives | `get-pr-comments` → `receiving-code-review` |
| Authoring or editing skills | `writing-skills` (ships in the `toolkit` plugin) |

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
