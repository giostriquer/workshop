# Decision: `get-pr-comments` returns to the toolkit plugin

## What changed

`get-pr-comments` moved from `plugins/workbench/skills/` back to
`plugins/toolkit/skills/`. The skill text is byte-identical; only its plugin
changed.

## Why

The skill is self-contained: one `gh` pass against the current branch's PR,
read-only, no dependency on any workbench skill or convention. That is the
original placement argument from the
[first note](get-pr-comments.md), and the plugin split carried it into
`workbench` without re-testing it.

Workbench is the process core: the pieces a session must have to run the flow.
`get-pr-comments` is a convenience over the GitHub API, and its natural pair is
the read-only `ci-watcher` tool rather than the flow's gates. Keeping it in
workbench charged every workbench session a slot of always-loaded description
context for a tool that is optional by nature.

The move also removes a coupling that shipped text carried: workbench's
`receiving-code-review` and `using-workbench` both named `get-pr-comments` as
the first half of the feedback stage. An installed workbench without toolkit
would have followed those pointers to a skill that is not there.

## Consequences

- The workbench flow's feedback stage is now `receiving-code-review` alone.
  `get-pr-comments` triages into it when toolkit is installed, but the flow
  does not depend on it, and no workbench text names it.
- `receiving-code-review`'s description drops its "pairs with get-pr-comments"
  sentence; its body states the stage without naming an external skill.
- Toolkit manifests, both READMEs, the skills roster, the flow doc and its
  HTML view, and the validator's expected-skill lists follow the move.
- Versions: `workbench` `0.26.0` (loses a shipped skill), `toolkit` `0.8.0`
  (gains one).
