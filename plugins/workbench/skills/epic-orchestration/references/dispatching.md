## Dispatching

The entrypoint's **Dispatching** section holds the file rule, the label, the
pointer and the closeout form. This reference says what each kind of file
records.

**Briefs and amendments** follow [Lane contracts](lane-contracts.md).

**Acceptance and hold notices** reference the active contract, identify the
revision and disposition, and state the lane's current authorized action or
hold. A lane that keeps assigned work gets an ordinary pointer naming that
action, not a closeout.

**Closeout files** record the accepted revision (the lane's last observed HEAD
when its work was withdrawn), the delivery or audit
disposition (the merged PR and merge revision, the accepted audit report, or
the ruling that withdrew or reassigned the lane's remaining work), and that
nothing remains assigned. They ask for acknowledgment only and name
the lane's reporting skill. A closeout is for the whole assignment: an accepted
round, correction or workset on a lane with more assigned work is an acceptance
notice. Record the closeout in the ledger with its date.

**Several destinations.** Multiple ready lanes may go out in one reply: repeat
the complete label-and-block pair for each destination, including returns to an
existing lane after accepting its correction.

**Holds stop one step.** Missing or conflicting authority, a pending dependency
or an unfinished review holds only the exact step that consumes its output.
Each hold names that step, who can release it and its governing source, quoting
its exact words; a wider reading is the owner's own ruling. Keep independent
work, and work against an agreed interface, moving; record where it reconciles
with the held input. A review the operator schedules for later holds neither
implementation nor delivery unless the operator names it as a gate.

Resolve your own delivery gate under **Completion review and delivery**; preserve
gates explicitly reserved to the operator. A hold creates no merge authority or
new correction round. Do not issue work whose trigger has not fired.
