# contract-review

[Canonical skill](../../plugins/workbench/skills/contract-review/SKILL.md)

## What it does

Checks whether the finished change delivers the agreed behavior through its real
entry points and preserves affected consumer contracts. The skill invokes the
independent `contract-reviewer`; the reviewer loads the skill's rubric and reports
findings. The implementer owns fixes.

## When to reach for it

Use it at completion when observable behavior, a consumer contract or
cross-component wiring changed, or explicitly request a scoped contract review.
It runs after verification and comment trimming, alongside applicable code-quality
and test-quality reviews. Pure prose, formatting and behavior-neutral internal
renames do not trigger it.

Give it accepted outcomes, approved design, compatibility requirements and
exclusions, the diff/base and revision, and existing verification evidence.
Existing task text and documents are enough; no new spec is required.

## Common questions

**What does it inspect?** Real entry points, callers, state transitions and
observable results, plus affected wire formats, persisted data, configuration
and consumers in other hosts or languages. It reuses adequate evidence and runs
a focused real-interface check only when consequential uncertainty remains.

**Can it reopen architecture?** Only a reachable failure or violated accepted
constraint can reopen the affected choice. A preferred abstraction or sibling
convention alone is not a finding. Code quality owns structure; test quality owns
assertions and coverage; comment trimming owns cosmetic narration.

**Which model runs it?** Opus 5.5 at `xhigh` on Claude Code, GPT-6.1 Sol at
`xhigh` on Codex, and the parent's model and effort on other harnesses. Dispatch
details live in the agent file. An unavailable required route leaves it blocked.

**How do corrections work?** Return verified fixes or evidence-based rejections
to the same reviewer with stable finding IDs, revisions and the correction delta.
There is no pass-count cap. A pass that makes no progress, a repeated rejection
without new evidence, or repeated growth in blockers holds further submissions
for the owner/user decision. Only reviewer confirmation or an explicit user
waiver closes a blocker. Completed results survive commits and handoffs.

## How to tell it worked

The report names the reviewed revision, contracts inspected, source reasoning
versus executed evidence, stable finding IDs and any correction dispositions.
`PASS` means no blockers remain; `ISSUES_FOUND` means a demonstrated blocker
remains; `BLOCKED` means a necessary input, check or decision is missing. A broken
consumer contract blocks, while an approved design departure does not attract
style demands.
