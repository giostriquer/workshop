## Close every handoff with a next step

An owner return has these parts, in order:

1. **Progress:** acceptance criteria closed, criteria remaining, and the journey
   step now in work.
2. **Verified disposition:** results, revision and remaining gates. Distinguish
   validation, PR readiness, merge and epic completion. Include **Tracker sync**:
   confirmed ticket and epic statuses, pending updates with their owner and
   reason, or not applicable when no tracker is used.
3. **Required lane handoff:** the lane-specific label and populated fenced pointer
   from **Dispatching** for each affected lane. Include it when accepting or
   rejecting a report, returning a correction or ruling, or authorizing delivery, including after
   recovery and when no more implementation is needed. If only an operator
   decision remains, return the lane's disposition and current hold.
4. **Immediate next action:** continue authorized work or dispatch a revalidated
   workset; advance pending delivery; issue the closing audit; propose closure;
   or name a blocker, owner and unblock while advancing independent work. Put
   operator decisions here, outside the paste blocks. Do not ask the operator
   to select a routine next lane already determined by the plan.

Before sending the final reply, check that every lane-facing disposition has
its actual file, its own `Paste this into <LANE>:` label and its fenced pointer
in the reply, with the same canonical name in the label, pointer and ledger.
Progress updates and answers that carry no lane-facing disposition
can stay brief prose; a progress update still opens with **Progress**.

**Audit returns name what is finished.** In the return file and the operator-facing
disposition, state these separately:

- **Audit report:** accepted after owner corroboration, follow-up required, or
  blocked, with the contract and audited revision.
- **Auditor assignment:** complete with no further action, or the specific
  remaining check/hold and who owns the next action. Accepting findings does
  not assign their fixes to the auditor.
- **Epic:** open, closure proposed to the operator, or closed with the operator's
  decision source. Report acceptance and assignment completion do not close it.

When the report is accepted and no assigned audit work remains, explicitly tell
the auditor its assignment is complete; request acknowledgment only. Lead its
fenced pointer with that disposition, for example: "Auditor A2, audit-r2 at
c0ffee1 accepted; your audit assignment is complete. Acknowledge only. Epic
closure awaits the operator." Keep the dispatch path and reporting skill in
the pointer. Use the same explicit nouns when saying "validated", "done" or
"closed" in the ledger and final reply.
