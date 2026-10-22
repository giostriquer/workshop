# Skills handbook

Usage pages for every skill shipped in a plugin: what each one does, when to
reach for it, what surprises people, and how to tell it worked.

For execution, read the canonical `SKILL.md` in
[`plugins/workbench/skills/`](../../plugins/workbench/skills/) or
[`plugins/toolkit/skills/`](../../plugins/toolkit/skills/). Each page links its
spec. For rationale, use [`docs/decisions/`](../decisions/). The spec is the
authority when these sources disagree.

## Two plugins

**`workbench`** is the process core: how work enters, gets scoped, gets built,
and lands. Start with [using-workbench](using-workbench.md), which maps the
whole flow and tells you which piece owns which moment.

**`toolkit`** is optional. Utilities you install alongside workbench when
you want them, and skip to keep sessions lean.

## Find the skill by the moment

| The moment | The skill |
| --- | --- |
| Getting oriented; "which skill do I use for X?" | [using-workbench](using-workbench.md) |
| Something to verify, hunt, or check | [audit](audit.md): uses the requested coverage and selects inline review or an investigation engine |
| One premise, ticket, or hunch to settle | [claim-check](claim-check.md) |
| A broad surface worth team-scale coverage | [qa-sweep](qa-sweep.md) |
| Designing a feature or a refactor | [brainstorming](brainstorming.md) |
| Shared words for a module's interface, seam, and depth | [codebase-design](codebase-design.md) |
| To settle a project's glossary terms (`GLOSSARY.md` or `CONTEXT.md`), or record an ADR | [domain-modeling](domain-modeling.md) |
| A long-running goal a fresh session should pursue alone | [handoff-goal](handoff-goal.md) |
| Implementing where a test harness exists | [test-driven-development](test-driven-development.md) |
| An unresolved failure requiring sustained investigation | [systematic-debugging](systematic-debugging.md) |
| About to claim something is done | [verification-before-completion](verification-before-completion.md) |
| Checking one finished change through its app or real consumer | [empirical-proof](empirical-proof.md) |
| Trimming a finished diff's code comments before the review round | [trim-comments](trim-comments.md), run by the `comment-trimmer` agent |
| The adversarial pass before PR-or-merge | [code quality](code-quality-review.md), [test quality](test-quality-review.md) for changed logic/tests, and [contract review](contract-review.md) for changed behavior, consumer contracts or wiring |
| Checking whether existing tests protect the behavior they claim to | [test-quality-review](test-quality-review.md) |
| Picking a model | [model-reference](model-reference.md) |
| Turning a branch into a PR and seeing it green | [file-pr](file-pr.md) |
| CI is red | [fix-ci](fix-ci.md) |
| Review feedback arrived | [receiving-code-review](receiving-code-review.md) |
| A multi-ticket epic whose lanes other sessions implement | [epic-orchestration](epic-orchestration.md) |
| Implementing a lane dispatched through epic-orchestration | [epic-implementation](epic-implementation.md) |
| Auditing a lane dispatched through epic-orchestration | [epic-auditor](epic-auditor.md) |
| Asking or telling another local session on this machine | [session-messaging](session-messaging.md) |
| Reclaiming project or machine disk space from worktrees, Docker, build caches, `.workbench` and `.tmp`, when you ask | [workspace-cleanup](workspace-cleanup.md) |
| Looking back at how the process itself ran | [self-audit](self-audit.md) |

## The optional toolkit

| What you want | The skill |
| --- | --- |
| An HTML report, plan, architecture explanation, or interactive product target | [html-artifact](html-artifact.md), user-invoked only |
| A detailed interactive isometric figure using upstream Anatomy | [anatomy](anatomy.md), user-invoked only |
| A catch-up on ongoing work and the decisions that need you | [ketchup](ketchup.md), user-invoked only |
| A recorded walkthrough of UI work, with frames the model reads back | [web-demo-video](web-demo-video.md) |
| To triage a PR's scattered feedback into one action list | [get-pr-comments](get-pr-comments.md) |
| To install the workshop's host-specific global instructions and rules on a machine | [adopt-global-rules](adopt-global-rules.md) |
| To use a system as a real human user and report what got in the way | [me-human](me-human.md) |
| To gate a new test, or audit and prune tests that don't earn their keep | [test-audit](test-audit.md), user-invoked only |
| To audit/upgrade dependencies or respond to security incidents across selected project and machine software | [dependency-audit](dependency-audit.md), user-invoked only |
| To be interviewed about a plan, design, or idea until every branch is settled | [grill-me](grill-me.md), user-invoked only |
| The round-based interview other skills run | [grilling](grilling.md) |
| To survey a codebase for refactors that deepen shallow modules | [improve-codebase-architecture](improve-codebase-architecture.md), user-invoked only |
| Prevent recurring repository mistakes, on an explicit request | [correct](correct.md) |
| Check the evidence behind a measured performance comparison | [benchmark-checklist](benchmark-checklist.md) |

## Invocation and completion

**Invocation.** Skills load on relevance unless marked user-invoked only.
Claude Code and Codex enforce that policy through their respective metadata.
Muse's native loader has an [accepted policy gap](../decisions/plugin-surfaces.md#muse-implicit-invocation-hole-accepted-2026-10-14).

**Completion.** Workbench has two default-on requirements:
`verification-before-completion` at every done-claim, and the comment trim
followed by the adversarial review when the full agreed implementation is
verified and about to ship through a PR or the repository delivery process
(`trim-comments`, then the applicable code, test, and behavior/contract reviews;
`test-quality-review` when production logic or tests changed, `contract-review` for changed observable
behavior, consumer contracts or cross-component wiring). Each stops only for an explicit decline or
a repo process that supersedes it.

**Proof stays focused.** `empirical-proof` supplies default consumer proof for
behavioral completion and reuses adequate current evidence. It does not add a
full suite, recording, team, or permanent harness. Broad `qa-sweep` stays
user-optioned, running only on your explicit ask, now or by standing rule.

## Not documented here

Six skills run only inside this repository and ship in no plugin:
`change-log`, `mine-transcripts`, `push`, `release`, `workbench-drift`, and `writing-skills`. Their canonical files live in `.claude/skills/`, with complete mirrors in
`.codex/skills/`. See the [repository map](../../README.md#repository-map).
