---
name: using-workbench
description: Use when starting any conversation - establishes how to find and use skills, requiring skill invocation before ANY response including clarifying questions
metadata:
  system: workbench
---

If you were dispatched as a subagent to execute a specific task, ignore this skill. If you think there is even a 1% chance a skill might apply to what you are doing, you ABSOLUTELY MUST invoke the skill.
IF A SKILL APPLIES TO YOUR TASK, YOU DO NOT HAVE A CHOICE. YOU MUST USE IT.

This is not negotiable. You cannot rationalize your way out of this.

# The Rule
Invoke relevant or requested skills BEFORE any response or action — including clarifying questions, exploring the codebase, or checking files. If it turns out wrong for the situation, you don't have to use it.

Then announce "Using [skill] to [purpose]" and follow the skill exactly. If it has a checklist, create a todo per item.

# Using Workbench

Orientation map for the **workbench** system: how work enters, gets scoped, gets
implemented, and lands. This skill explains; it never enforces. The flow's
defaults activate through each skill's own trigger or the user's standing rules
— not through this page.

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
      rawdog (straight from session) · plan (mechanism from the user's stack:
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

- **Reference only.** Answer the question, point at the owning skill, stop —
  never respond to "how does the flow work?" by starting the flow.
- Workbench never dictates execution agency (direct vs agentic) and ships no hooks;
  skill descriptions and the user's own rules are the entire activation surface.

---
