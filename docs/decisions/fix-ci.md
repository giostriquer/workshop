# fix-ci and ci-watcher: decisions in force

This note is the rationale for the `fix-ci` skill and the `ci-watcher` agent it dispatches, both shipped in the `workbench` plugin; superseded choices are omitted and git history keeps the originals.

## ci-watcher absorbs the wait on CI (2026-06-29)

Waiting on CI was a recurring session tax: babysit the checks or forget to return, then dig the failing log out of a multi-job workflow. `ci-watcher` is a self-contained agent, needing only `git` and `gh`, that watches the requested revision's checks and returns a verdict with the failing-log excerpt or check link in hand. It is read-only by design, with `Bash` and `Read` as its only tools and no nested subagents; re-running, fixing and pushing belong to the caller. Background dispatch is described in its body rather than a frontmatter flag, since Claude Code agents have no such field. When there is no branch, no applicable CI or no `gh` access, it reports that gap precisely; other CI hosts would swap out the `gh` calls.

## fix-ci is a skill that composes the watcher (2026-08-11)

The recurring "CI is failing, take a look" was manual prompting on top of a watcher that only reports, so the fix half needed an invocable home. Giving `ci-watcher` edit tools was rejected: the plugin's agents are read-only, the session that pushed the breaking commit has the context to fix it fast, and a skill runs in the main session under the user's own permissions, the right authority for edits and pushes. `fix-ci` owns the loop (resolve the target, watch, collect evidence, triage flake from fault, fix minimally in-session, push per repo conventions, re-watch) and dispatches `ci-watcher` for the waiting. Its guardrails are part of the spec: a cap of two fix attempts per failing cause plus one flake rerun, no force-push or history rewrite, staging only what the fix touched, and never weakening a failing check to reach green. It goes beyond the watcher by working branches with no PR through their push-triggered runs and by rerunning a failed job once when the evidence says flake, and it neither merges nor manages PR state.
