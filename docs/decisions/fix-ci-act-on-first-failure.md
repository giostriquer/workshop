# Decision: act on the first failed check, not the finished run

**Date:** 2026-09-11

**Release:** workbench 0.37.3

## Problem

`fix-ci` and `ci-watcher` described the watch step as "watch, then report a
verdict". The watcher therefore returned only when its watch command exited.
`gh pr checks --watch --fail-fast` does exit on the first failure, but `gh run
watch` has no fail-fast flag, and nothing told the watcher or the parent that a
failure was actionable before the remaining checks finished. In practice a check
that failed within the first minute sat untouched until a fifteen-minute workflow
completed. The `file-pr` tend loop, which composes `fix-ci`, inherited the wait.

## Change

- The watcher **returns at the first failed required check**, listing the checks
  still pending and those already passed. Branch-only CI polls `gh run view
  --json jobs` instead of `gh run watch`. Logs for a failed job in a still-running
  run come from `gh run view --log-failed` or `--job <job-id>`.
- The parent acts on that failure immediately. Checks still running when the fix
  is pushed rerun on the new head, so waiting for them buys nothing.
- Right before pushing, the parent takes one `gh pr checks` snapshot of the old
  head and folds in any further in-scope failure that appeared while the fix was
  being written, so two early independent failures do not cost two pushes.
- The two-attempt cap is now **per failing cause**. Acting early makes it normal
  for a different check to fail on the new head; that is a new cause with its
  own attempts. The same check failing after its second fix still ends the loop.
- `file-pr` step 9 and the usage pages state the same.

## Focused checks

The change is to a procedure's return condition, checked by reading the
commands: `gh pr checks --watch --fail-fast` exits on first failure; `gh run
watch` offers only `--exit-status`, `--interval` and `--compact`, hence the
polling substitute. No fresh-context scenario was run: the failure was a
recorded wait on a real PR, the correction removes the wait condition rather
than adding a judgment, and the read-only and never-weaken boundaries of both
pieces are untouched.
