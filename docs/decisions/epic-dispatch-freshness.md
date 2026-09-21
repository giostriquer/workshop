# Decision: revalidate epic work against the current integration branch

**Date:** 2026-09-21

**Release:** workbench 0.40.4

## Change and reason

Before delegating a lane or workset, the epic owner must refresh the integration
branch locally and check whether each ticket still describes work to do. The
existing lane setup fetch and general instruction to refresh volatile facts do
not make this a specific pre-dispatch responsibility. A later merge can fix a
ticket, move its anchor, or reduce its remaining scope while its tracker status
still says Open.

Use `origin/dev` unless the repository or operator explicitly names another
integration target. Pull fast-forward-only in a clean integration checkout, or
fetch and inspect the exact remote revision in an isolated local checkout.
Preserve active lane worktrees. A failed refresh or unresolved validity check
holds the affected dispatch rather than delegating stale work.

Bind the ledger and dispatch to the refreshed revision and each ticket's current
evidence and disposition. A simultaneous independent dispatch batch can share one
refresh; a later batch, postponed handoff, or intervening merge requires another.
Keep the implementation, review, and publication responsibilities unchanged.

## Verification

The baseline consuming-agent scenario already refreshed before delegation,
removed already-fixed work, narrowed partially fixed work, held on refresh
failure, and refreshed again after an intervening merge. This is an explicit
contract improvement requested by the operator, not a claim that the baseline
agent failed.

The revised core scenario retained those outcomes and bound handoffs to the
validated SHA. Checkout-safety probes covered dirty feature checkouts, unpublished
commits ahead of the remote, a missing default branch, an explicitly different
integration target, and a base that advances before lane setup. The first safety
probe chose a temporary worktree path. The skill now explicitly references the
existing worktree-location rules; a fresh probe with that referenced guidance
used ignored repository-local worktrees and preserved existing work in all five
cases.

Four fresh contexts ran in total: one baseline, one revised core scenario, and
two checkout-safety probes. These are bounded instruction-consumption checks,
not live Git or integration-test executions, and do not establish cross-model
reliability.
