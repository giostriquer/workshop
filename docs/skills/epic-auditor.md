# epic-auditor

## What it does

Keeps an epic auditor lane's audit results in one complete, copyable report
block. The report records the verdict, audited artifact, coverage, fix-family
results, findings, evidence gaps and next action. Progress updates can stay
brief prose.

## When to reach for it

Use it when auditing a lane assignment from
[epic-orchestration](epic-orchestration.md). The owner requires
`workbench:epic-auditor` in audit briefs, follow-ups, amendments, acceptance,
closeouts and recovery prompts. Standalone audits, implementation lanes and the
epic owner use their own skills.

## Common questions

**Where is the report template?**

The initial dispatch includes or links the shared
[audit report template](../../plugins/workbench/skills/epic-orchestration/references/audit-report.md).
If it is absent, the auditor reads that reference directly. The auditor does
not need to load the orchestration skill. Later prompts reference the active
contract; each audit result still contains all populated fields.

**How do status and verdict differ?**

Status describes the handoff. `ready-for-validation` means the owner can validate
the completed audit, even if it found defects. Verdict describes the evidence:
`HOLDS` needs complete required evidence and no remaining in-scope defect;
`ISSUES_FOUND` means an in-scope defect was reproduced; `INCONCLUSIVE` retains
unresolved proof gaps. A reproduced defect can coexist with coverage gaps.
No audit verdict establishes delivery or epic completion.

**Can the auditor fix a finding or close the epic?**

The auditor inspects the artifact without PR history and returns findings for
owner corroboration and routing. It does not implement fixes. The operator
decides epic closure. Scope and authority remain in the dispatch.

**What happens when a check is blocked?**

The report retains completed evidence, marks the blocked check and its effect,
and names the next action, owner and recommendation. An unreproduced finding
stays uncorroborated or blocked unless contrary evidence disproves it. A report
file supports the handback but does not replace it.

**How does the auditor know its assignment is done?**

The owner explicitly accepts the report and completes the assignment, naming
the contract and audited revision. The auditor gives a short acknowledgment
that its assignment is complete and retains the report and evidence unchanged.
It does not rerun the audit or send another `ready-for-validation` report.
Completion does not change the verdict, erase findings or close the epic;
the operator still owns epic closure. Further audit work needs an explicit
owner follow-up under the contract.

## It's working if

The operator can paste the complete audit report back to the owner after every
round, including recovery and blockers. The owner can distinguish the tested
revision, observed defects, missing evidence and next action from that block.
An accepted, completed assignment ends with a clear acknowledgment, without
another validation handback.
