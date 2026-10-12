# get-pr-comments: decisions in force

This is the rationale for the `get-pr-comments` skill, shipped by the toolkit plugin; superseded choices are omitted, and git history keeps the originals.

## Triage PR feedback, never answer it (2026-06-30)

The skill is adapted from the `get-pr-comments` skill in Cursor's MIT-licensed `cursor-team-kit` plugin ([cursor/plugins](https://github.com/cursor/plugins)). PR feedback is scattered across the conversation tab, review verdicts, and inline diff comments, and working out what must change from the UI is slow and easy to do incompletely. The skill collapses that into one `gh` pass over all three, groups the feedback by severity (blocking, should-fix, nit) and actionability (requested change or open question), and returns a prioritized action list plus the questions still waiting on a human. Its defining rule is a boundary: it never replies to, resolves, or reacts to a comment unless the operator explicitly asks for that specific action, because answering on a shared PR is an outward side effect that must never fall out of "show me the comments." It is otherwise read-only and reports a missing PR or unauthenticated `gh` plainly instead of guessing. Another review host would swap the fetch commands; the grouping is host-agnostic.

## Ship it in toolkit, not workbench (2026-08-20)

The skill is self-contained: one read-only `gh` pass with no dependency on any workbench skill, so it belongs with the optional utilities. The plugin split had carried it into workbench without retesting that placement, charging every workbench session always-loaded description context for an optional tool and leaving workbench text pointing at a skill a workbench-only install would lack. Workbench's feedback stage is therefore `receiving-code-review` alone, no workbench text names `get-pr-comments`, and the skill triages into that stage when toolkit is installed.

## Retrieve every inline-comment page (2026-10-12)

The unpaginated REST command could silently omit later inline feedback. The
pagination lesson from Lauren Tan's MIT-licensed `pstack` PR watcher in
[cursor/plugins](https://github.com/cursor/plugins) applies to this existing
reader without adopting the watcher's orchestration or write authority.

Use `gh api --paginate` and consume every returned page. The
[official CLI manual](https://cli.github.com/manual/gh_api) specifies that it
follows all pages. A successful first page does not establish complete retrieval:
`gh` can emit earlier comments before a later HTTP failure, leaving partial or
invalid JSON. Check the fetch exit status and make complete or partial coverage
explicit in the summary; preserve usable feedback while naming the failed source
and remaining gap. No reply, resolution, reaction, or other write authority
changes.

A focused fixture ran the installed GitHub CLI against a local paginated REST
endpoint. The previous command returned 30 of 101 inline comments and missed
the last-page blocker; the revised command retrieved all 101. A later-page
HTTP 503 returned a nonzero exit after partial output, and an empty result
completed cleanly. A separate consumer-agent check prioritized the last-page
blocker and reported the failed retrieval as partial with missing feedback
unknown. These checks cover CLI pagination and bounded summary scenarios,
not live GitHub authentication or host discovery.
