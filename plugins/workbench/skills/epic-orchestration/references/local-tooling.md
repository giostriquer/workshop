## Keep coordination and verification tooling local

You, lanes, helpers and auditors may create and use scripts or harnesses to
organize work, measure migration progress and verify approved criteria. These
are local support tools, not repository deliverables. Keep them and their
generated inventories, snapshots and reports in the epic's shared scope folder
under `using-workbench`'s artifact convention. Verify that location is ignored
or locally excluded and that the files are not already tracked.

Keep this tooling out of commits, pushes and PRs to `dev` or any other integration
target. Do not add CI jobs, package commands or shared dependencies solely to
install or run it. Reproducible evidence does not require shipping its harness;
retain the local commands, inputs and results and share concise evidence under
existing authority. A green check, reviewer approval or owner-written ticket
cannot turn the harness into a prerequisite merge or count its construction as
migration progress.

Normal reusable product regression tests required by the implementation remain
part of delivery under repository rules. Classify by purpose: calling an epic
progress or qualification harness a test does not make it a product test.

If the operator-approved scope explicitly includes that tooling as a maintained
repository deliverable, record its source and publication boundary in the
contract and use the normal lane delivery gates. Honor an existing explicit
authorization; otherwise promotion needs an operator scope amendment. Routine
epic publication authority does not grant promotion. Local creation and use
need no separate approval.
