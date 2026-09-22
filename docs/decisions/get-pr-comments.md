# get-pr-comments: decisions in force

This is the rationale for the `get-pr-comments` skill, shipped by the toolkit plugin; superseded choices are omitted, and git history keeps the originals.

## Triage PR feedback, never answer it (2026-06-30)

PR feedback is scattered across the conversation tab, review verdicts, and inline diff comments, and working out what must change from the UI is slow and easy to do incompletely. The skill collapses that into one `gh` pass over all three, groups the feedback by severity (blocking, should-fix, nit) and actionability (requested change or open question), and returns a prioritized action list plus the questions still waiting on a human. Its defining rule is a boundary: it never replies to, resolves, or reacts to a comment unless the operator explicitly asks for that specific action, because answering on a shared PR is an outward side effect that must never fall out of "show me the comments." It is otherwise read-only and reports a missing PR or unauthenticated `gh` plainly instead of guessing. Another review host would swap the fetch commands; the grouping is host-agnostic.

## Ship it in toolkit, not workbench (2026-08-20)

The skill is self-contained: one read-only `gh` pass with no dependency on any workbench skill, so it belongs with the optional utilities. The plugin split had carried it into workbench without retesting that placement, charging every workbench session always-loaded description context for an optional tool and leaving workbench text pointing at a skill a workbench-only install would lack. Workbench's feedback stage is therefore `receiving-code-review` alone, no workbench text names `get-pr-comments`, and the skill triages into that stage when toolkit is installed.
