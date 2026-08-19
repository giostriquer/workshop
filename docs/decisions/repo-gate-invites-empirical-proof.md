# Decision: a repo's own completion gate invites `empirical-proof`

**Date:** 2026-08-19

## Status

Implemented. Ships as `workbench 0.24.0`.

## Context

Arrived as a `self-audit` proposal from a field session in another repo: a
Tauri app whose `AGENTS.md` requires booting the real app for changes
affecting IPC, startup, and provider scanning. After the fix compiled green,
that session built a disposable environment, drove the real app over CDP, and
caught a copy bug the unit tests could not: a merged card still displayed a
stale reset window, which was the exact falsehood the fix existed to remove.

The session did that by following its repo, not the flow. `empirical-proof`
says "the user asked for empirical verification (offer it otherwise; never run
it uninvited)", and the repo gate is not the user asking. A session reading the
skill literally would have offered the run, waited, and shipped the bug.

Underneath the single skill is a structural asymmetry. Repo precedence appears
in three places (`test-driven-development`'s Precedence section,
`code-quality-review`'s two outs, `using-workbench`'s standing gates) and in
all three it only ever **subtracts**: a repo document can excuse a session from
flow ceremony, and nothing lets one require ceremony the flow would otherwise
only offer. `using-workbench` already says the expensive tiers run on the
user's ask "now or standing" without ever naming a repo process document as
that standing ask.

## The shape

Precedence runs both ways, stated in the general place and in the specific one.

- **`using-workbench`** gains a repo-precedence paragraph in *At session start*:
  where the repo carries its own process document, follow it for worktrees,
  test discipline, and completion gates instead of re-running the flow's
  version; a repo gate can also invite a tier the flow would otherwise only
  offer; the three user gates and the adversarial review before PR-or-merge
  survive regardless, and the session names which of those it skips and why.
- **The cost-and-authority paragraph** names a repo completion gate as the
  standing ask it was already implicitly describing.
- **`empirical-proof`** gains the same rule at the point of use, in both
  trigger surfaces: a repo completion gate requiring the real artifact is the
  invitation this skill waits for. The run is not offered first; it is run,
  attributed to the gate that invited it, and reported as part of satisfying
  that gate.

## Non-goals

- **No change to the skill's rigor once it runs.** The boot gate, the
  no-fabricated-dependencies rule, the verdict set, and the report shape are
  untouched.
- **Not a general "run it when a change qualifies" rule.** The invitation is a
  repo gate that covers the change in hand, not the session's own read that a
  surface looks drivable. Absent such a gate and absent the user's ask, the
  tier is still offered and never defaulted to.
- **No new activation mechanism.** The same self-audit round proposed replacing
  `using-workbench`'s "any conversation" trigger, arguing that seven skills
  failing to fire made it a wording defect. Declined: seven distinct skills
  each missed once are seven single occurrences, which the skill's own table
  classifies as session defects, and two of the claimed misses
  (`test-driven-development`, worktree discipline) are skills whose text already
  defers to the repo, so following the repo *was* the skill behaving correctly.
  Activation is also outside the skill's reach: workbench ships no hooks, so a
  session-start skill that does not fire is fixed in the user's own rules. The
  costly misses that round reported (the workload-sizing gate never asked,
  `code-quality-review` skipped before merge on a diff touching a
  credential-reading path) happened where the flow's text was unambiguous, so
  they stay session defects and earn no edit.

## Packaging

`workbench 0.24.0`. Usage pages updated in step: `docs/skills/empirical-proof.md`,
`docs/skills/using-workbench.md`.
