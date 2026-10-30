## Validate the claim independently

A lane report and its completion review do not replace owner acceptance. Inspect
the reported base/head, diff and relevant evidence, then choose checks that can
confirm or refute consequential claims against the acceptance criteria. Record
what you independently verified, what remains reported and what is unverified.

Match evidence to the claim:

- **Regression fix:** establish sensitivity to the intended defect using the old
  implementation or a controlled mutation, then confirm the fixed behavior.
  Preserve tests and expectations. A missing import, dependency or setup failure
  is not valid RED. Reverting the entire production diff is useful only when it
  recreates the defect without breaking the test setup.
- **Behavior preservation:** use equivalence, characterization and affected
  consumer checks. Correct baseline behavior may remain green; do not invent a
  regression or a failing test for it.
- **New behavior or interfaces:** exercise the required observable contract and
  relevant boundaries. **Docs or configuration:** check the actual consumers,
  examples or constraints affected. Apply repository and owning-skill gates.
- **User-reachable changes:** for a change a user can reach in the running app,
  acceptance includes the affected flow in the running app, or a named reason it
  is not reachable yet. A repository ban on running E2E suites is not a ban on
  launching the app; do not forbid, in dispatches or your own checks, launches
  the repository allows.
- **Gates and infrastructure:** inspect the design and exercise what it accepts
  and rejects, including legitimate work the fix might now refuse.
- **Artifact acceptance or derived authority:** use output from the actual
  producer, including disposable copies of saved versions covered by
  compatibility requirements.
  Distinguish expected refusals from crashes and verify recovery is available.
  A handwritten fixture alone does not prove the product supplies the input.

Investigate source-anchor mismatches; a fix elsewhere may leave another live
instance. Enforce applicable diff rules, including bans on comments or skipped
tests. Independently reproduce findings that would change a decision, reverse a
prior fix or establish a regression. Unavailable evidence remains a named gap.

Use explicit worktree directories for every command. Run mutation or revert
probes only in disposable validation checkouts after checking the resolved path.
Preserve the lane's staged, unstaged and untracked work, tests and fixtures; stop
probe processes and restore or discard only probe-owned state. Never broadly
restore the implementer's checkout. Keep injected defects and probe artifacts
out of delivery.

Use focused local checks and mandatory local gates. Completion evidence covers
affected test files and identified shared consumers, not only an iteration's
name filter. Full suites normally run in PR CI; broader local checks require an
explicit repository/user gate or a named unresolved integration risk. Choose
the smallest check that addresses it and disclose unavailable coverage.
