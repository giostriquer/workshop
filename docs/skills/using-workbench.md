# using-workbench

## What it does

`using-workbench` is the orientation map for the workbench system: how work
enters, who owns each moment, which skill to invoke, and where working material
and worktrees go. It runs no loop and reaches no verdict: "**Orientation, not
compulsion, except for two standing gates.**"

Those two gates are the only parts that bind. `verification-before-completion`
fires at every done/fixed/passing claim. The comment trim (`trim-comments`,
run by the `comment-trimmer` agent) and then the adversarial review
(`code-quality-review`, plus `test-quality-review` when the diff changes
production logic or tests) fire once the implementation is complete, before
PR-or-merge. Each runs unless the user explicitly declines it or the repo's own
process supersedes it; a small diff, time pressure, or the session's confidence
are not reasons to skip. Everything else fires on relevance.

Repo process takes precedence in both directions: the repo's own `CLAUDE.md`,
`AGENTS.md`, or `CONTRIBUTING` governs worktrees, test discipline, and
completion gates, and a repo gate can also invite a tier the flow would
otherwise only offer.

## When to reach for it

Its description loads it before coding, auditing, planning, shipping, filing a
PR, debugging, or using any workbench skill. It answers "how does the flow
work?" and "which skill owns this task?" A subagent dispatched to execute a
specific task skips it.

| The problem | The skill |
| --- | --- |
| Which skill owns this moment? | `using-workbench` |
| Something to verify, hunt, or check | `audit` |
| Designing a feature or a refactor | `brainstorming` |
| About to claim done, fixed, or passing | `verification-before-completion` |
| Implementation complete, before PR-or-merge | `trim-comments`, then `code-quality-review` (+ `test-quality-review`) |
| Picking a model | `model-reference` |

## The map

- **Entry**: two optional doors. Door A is `audit`, which exits with a report
  or revealed work. Door B is an idea: ground it against the codebase, then
  `brainstorming` owns what the code cannot answer.
- **Scoping**: `brainstorming` settles open design, then follows the
  authorized route (direct, plan, or handoff-goal) or asks for a missing one.
- **Implementation**: `test-driven-development` where a test harness exists
  (repo conventions win on conflict); `systematic-debugging` for sustained,
  unresolved failures. In-session versus dispatched is the user's and the
  harness's call.
- **Completion**: only when the full agreed work set is implemented, verified,
  and about to ship, not at a checkpoint. The comment trim runs first, then one
  adversarial round runs both required stages on the trimmed diff, each
  dispatched to a context that did not write the code.
  Blocking corrections get focused re-review, which runs without asking until
  review stops converging; unresolved blockers hold delivery. Then the session outlines the
  work, with the trim's open encoding offers, and asks PR or merge, unless repo
  or user rules pre-authorize it.
- **Feedback**: `receiving-code-review`; verified fixes re-enter implementation.

**Picking the verification piece** by the work's shape:

| Shape | Piece |
| --- | --- |
| Any done/fixed/passing claim | `verification-before-completion`, always on |
| One just-finished change with a drivable surface | `empirical-proof` |
| A broad decomposable surface at team scale | `qa-sweep` |
| One premise, ticket, or hunch | `claim-check` |
| Landing; refuses a code PR without the comment trim and the adversarial review | `file-pr` |

When no frame fits, keep the standard and drop the frame: prove the
deliverable the way its real consumer would use it.

**Cost and authority.** `empirical-proof` and `qa-sweep` are the expensive
tiers: "**Offer them; never default to them.**" They run on the user's ask,
now or standing. A repo completion gate that requires driving the real
artifact counts as a standing ask; the session runs it and names the gate.

**Artifacts are disposable.** Working material lives in
`.workbench/<work_scope>/` (or `.tmp/workbench/<work_scope>/`), typically
gitignored. Promotion to a committed doc is the user's call. The dispatching
session hands that folder's path to every agent it dispatches.

**Worktree location.** Prefer the harness's native worktree mechanism and any
established repo or user pattern; otherwise `<repo>/.worktrees/<task-name>`,
confirmed ignored first. Never outside the repository unless the user asks.

**CI watching** always goes to a separate Opus agent on Claude or `gpt-6-sol`
agent on Codex, never parent polling.

**Workbench agents on Codex.** Each agent file has a Dispatch line naming how
it is dispatched, and the calling skills add only the run's inputs. Codex
registers no plugin agents, so the parent reads the agent's file from the
installed plugin (`agents/<name>.md`, two directories above the loaded skill's
`SKILL.md`), spawns with the arguments its Dispatch line names, and pastes its
body into the spawn message, under `You are the <name>. Your contract:` and
before the run's inputs. A follow-up to that agent carries only its own next
job. On Claude Code the registered agent carries its contract and model, so the
parent passes no model and pastes nothing
([decision](../decisions/plugin-surfaces.md)).

## Common questions

**It fired at the start of my session. Is it about to run a process on me?**

No. It maps and stops. A session whose task matches a moment invokes the
owning skill and says so ("Using audit to size this investigation").

**Which parts are actually mandatory?**

Two: `verification-before-completion`, and the comment trim followed by the
adversarial review. Both stop only for your explicit decline or a superseding
repo process
([decision](../decisions/code-quality-review.md)).

**Do dispatched subagents inherit these conventions?**

No; they skip the orientation. The dispatching session puts the scope
folder's path in each agent's contract, and names `file-pr` in any dispatch
that will open a PR.

**My one-ticket change turned into a sprawl. Does workbench catch that?**

At filing. `file-pr` stops and proposes a split when the diff goes beyond the
agreed PR plan or spans unrelated concerns the plan does not put together.
Scope is still yours to define and the session's to follow, and the
adversarial review sends out-of-scope findings to follow-ups rather than
growing the diff. State the boundary in the ask or the repo's rules when it
matters.

**Does it enforce anything with hooks?**

No. Skill descriptions and your own rules are the whole activation surface.

## It's working if

- The session names the moment and the skill before acting.
- Questions cover only missing scope, route, or delivery choices.
- Everything from one work scope, including dispatched agents' output, lands
  in one `.workbench/<work_scope>/` folder.
- Negative signal: you ask how the flow works and the session starts running
  it; work is called done without fresh verification output; or the
  adversarial review is skipped because the diff looked small.

## Where it fits

`using-workbench` is the frame, not a stage. It points to whichever skill owns
the moment: `audit` and `brainstorming` at entry, `test-driven-development` and
`systematic-debugging` in implementation, `verification-before-completion`, `trim-comments` and
`code-quality-review` at completion, `file-pr` and `fix-ci` at landing.
Re-read it when you cannot tell which piece owns what is in front of you.
