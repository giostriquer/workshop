# Workbench operator decisions: rationale in force

Rationale behind the flow's operator decisions made after the initial design (the ledger in `docs/workbench-flow.md` lists the decisions themselves); superseded choices are omitted and git history keeps the originals.

## Audit sizing is a structured question with a runtime flag (2026-08-12)

Unless coverage is already stated, `audit` asks for the tier through a structured question tool with the recommendation first, because free-prose asks buried the tiers or skipped the pick. Tiers size breadth, not evidence source, so a "does X work" check sized as a quick look could quietly become greps. When the target is behavior a real client can drive, the same question confirms driving the booted app, which reaches the engine as scope.

## The first route is `direct`, asked like sizing (2026-08-12)

The first route's former slang name, left in by oversight, became `direct`: implement from session context. A route pick that is still needed, in `brainstorming` or at `audit`'s confirmed-fix exit, is asked like the sizing question, with user-facing labels (Direct, Plan, Long-running goal) instead of skill names.

## Q13: TDD is a default, not a mandate (2026-08-12)

A session ran tests despite a repo rule forbidding test runs before manual validation, because the skill's MANDATORY labels had no stated rank against repo rules. A conflicting stated repo or user convention now wins, announced in one line, while the compatible rest of the cycle still applies. Convenience alone never displaces a step, and the cycle's rigor is unchanged where TDD applies.

## Q14: Expensive verification is offered, not automatic (2026-08-12)

`empirical-proof` and `qa-sweep` fan out agents and boot apps, yet flow text like "empirical-proof if runnable" read as an order to run them whenever a change qualified. That spend is the user's call: they are offered when they fit and run only on an explicit ask, immediate or standing, such as a repo gate requiring the real artifact. `verification-before-completion` stays the cheap always-on claim gate. Q14 refines Q11.

## Worktrees live inside the repository (2026-08-12)

A session put a worktree in system temp, mixing a repository checkout into disposable space. Placement follows the repo or user convention, prefers the harness's native mechanism, and otherwise defaults to an ignored `<repo>/.worktrees/<task-name>`, never outside the repo unless the user asks. Upstream's full worktree skill was declined: one lived failure does not justify it; only its ignore check and prefer-native idea were borrowed.

## Q15: Review is a scoped completion gate (2026-08-12)

A field session grew a one-ticket change into a 52-file workset because the adversarial review had neither fixed timing nor scope classification, so it ran as an implementation-discovery engine. The initial review fires once implementation is believed complete, right before the PR-or-merge gate, never mid-implementation (refining Q3). Strictness applies inside the accepted work; outside findings become recorded follow-ups unless they prove the change unsafe or incorrect as shipped.

## Q17: One evidence home per work scope (2026-08-12)

An audit scattered one scope's evidence across three per-agent temp directories: Q12 named the location, but dispatched agents skip orientation and the engines' contracts named none. Everything a work-stream produces, agents' evidence included, now lands in one `.workbench/<work_scope>/` folder whose path the dispatcher hands every agent in its contract, never per-agent or system temp directories. Q17 refines Q12.

## Brainstorming classifies the request first (2026-08-12)

Upstream's three-path classifier was adopted: the session first announces the request as a spike (an answer, not code), bounded (a well-scoped change to existing code), or architectural (unresolved structure or depended-on interfaces). The local copy gave everything architectural ceremony, the over-ceremony the fork exists to remove, so this lightening was adopted, not dismissed as pressure tuning. Adapted: bounded and architectural work ends at the route resolution rather than upstream's dropped plan-writing hand-off, a spike ends in a reported recommendation, and only architectural work gets a written design.

## Scope is the user's to define: Q16 reversed (2026-08-25)

`using-workbench` no longer carries Q16's stop-and-rescope guard. Sessions read it as limiting what they could read, stopped tracing causes into subsystems the ticket never named, and missed root causes; a more precise rewrite only added terms to misread. Scope is the user's to define in the ask, so nothing replaces the guard; a repo or user wanting a size rule states it. Q15's labels stay: they classify findings, not the session's reach.

## Scope language never limits reading (2026-08-25)

A follow-up audit of all workbench skills and agents removed text readable as limiting what a session reads, traces, or root-causes. `test-driven-development` lost its scope-boundary section, which steered a session that traced a bug into another module toward a symptom fix, against `systematic-debugging`'s fix-at-source rule. Reviewers now read whatever surrounding code judging the change needs, `fix-ci` fixes the cause without bundling unrelated changes, and no new rule replaces the removed text.
