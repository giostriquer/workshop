## Owner returns

The entrypoint's **Close every handoff with a next step** section holds the
return's six parts and their order. This reference gives one worked return and
the wording for audit returns.

### A worked return

```
HOLD: L2, L4 (2 of 5 lanes) · since 2026-11-03 · ordered by epic owner · source: "hosted deploy probe returned 403" · released by operator, when the deploy token is reissued · rechecked 2026-11-05, probe still 403 · operator action: reissue the deploy token, or narrow this hold to L4
HOLD: L5 (1 of 5 lanes) · since 2026-11-05 · ordered by epic owner · source: "L5 has no live session; its HEAD is unchanged since 2026-11-04" · released by operator, by resuming L5 · rechecked 2026-11-05, session list and worktree · operator action: resume L5 with its last dispatch, or say to reassign its workset

Progress: 3 of 9 criteria closed, 6 remaining; step 4 in work; 2 follow-ups open.

Lane reconciliation: L1 had an unrelayed report from 2026-11-04, validated below; L5 is silent (held above); L2, L3 and L4 current.

Verified: L3 delivery merged at abc1234, checks green. L1 report validated at def5678; delivery gates satisfied. Tracker sync: ABC-123 Done confirmed; ABC-124 In Review confirmed.
```

`Paste this into L3:`

```
Lane L3, existing session. Delivery at abc1234 accepted; your implementation assignment is complete. Acknowledge only. Use workbench:epic-implementation. Read and execute:
/Users/me/acme/.workbench/webapp/dispatches/L3-closeout.md
```

`Paste this into L1:`

```
Lane L1. Implementer, delivery authorized, existing session. Read and execute:
/Users/me/acme/.workbench/webapp/dispatches/L1-delivery.md
```

```
Next actions: W7 is held on L1's interface (source: "W7 consumes the parser interface L1 delivers", from its ticket); the epic owner releases it when L1 merges. Every other open workset is active in a lane, dispatched above or held above.
```

Every workset in that return is done, active, dispatched or held with a release
owner. Each hold line carries this turn's recheck. The first hold stops more
than one lane and the second is one only the operator can release, so both open
the reply; W7's hold is the owner's to release and stays in **Next actions**.

### Audit returns name what is finished

In the return file and the operator-facing disposition, state these separately:

- **Audit report:** accepted after owner corroboration, follow-up required, or
  blocked, with the contract and audited revision.
- **Auditor assignment:** complete with no further action, or the specific
  remaining check/hold and who owns the next action. Accepting findings does
  not assign their fixes to the auditor.
- **Epic:** open, closure proposed to the operator, or closed with the operator's
  decision source. Report acceptance and assignment completion do not close it.

When the report is accepted and no assigned audit work remains, release the
auditor with the entrypoint's closeout pointer:

```
Lane A2, existing session. Audit at c0ffee1 accepted; your audit assignment is complete. Acknowledge only. Use workbench:epic-auditor. Read and execute:
/Users/me/acme/.workbench/webapp/dispatches/A2-closeout.md
```

Say where epic closure stands in the closeout file and in the return's prose,
for example "Epic closure awaits the operator." Use the same explicit nouns
when saying "validated", "done" or "closed" in the ledger and final reply.
