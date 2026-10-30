## Dispatching

Write each ready lane prompt, amendment, acceptance, ruling, audit brief or
authorization to its own file in the `dispatches/` folder of the epic's scope
folder, indexed by the ledger. Each file opens with `Lane: <LANE>` on its first
line, the canonical name, then its brief.
Acceptance and hold notices reference the active contract, identify the revision
and disposition, and state the lane's current authorized action or hold.

**Holds stop one step.** Missing or conflicting authority, a pending dependency
or an unfinished review holds only the exact step that consumes its output.
Each hold names that step, who can release it and its governing source. Keep
independent work, and work against an agreed interface, moving; record where it
reconciles with the held input. A review the operator schedules for later holds
neither implementation nor delivery unless the operator names it as a gate.

Resolve your own
delivery gate under **Completion review and delivery**; preserve gates explicitly
reserved to the operator. A hold creates no merge authority or new correction
round. Do not issue work whose trigger has not fired.

The final reply contains one complete handoff unit per destination, including
returns to an existing lane after accepting its correction. Each unit has its
own `Paste this into <LANE>:` label immediately above its fenced, paste-ready
pointer. `<LANE>` is exactly the canonical name recorded in the ledger, for
example `Paste this into Parser:`. Multiple ready lanes may go out in one reply:
repeat the complete label-and-block pair for each destination.

`Paste this into <LANE>:`

```
Lane <LANE>. <Role, what is authorized, fresh or existing session>. Read and execute:
<absolute dispatch path>
<lines governing instructions require verbatim, if any>
```

The dispatch path is absolute, because the lane reads it from its own worktree.
The label, the pointer and the file's `Lane:` line are read as written by the
tooling that carries handoffs, so returns to several existing lanes still use
the complete label-and-block pair for each. After a context compaction or a
resume, reread this section before writing the next handoff.

The pointer contains no repeated brief. Put operator decisions outside it.
The file and its populated pointer together complete the handoff; a saved file,
ledger update, link or prose recap alone does not. Implementation sessions still
go through the operator; helpers do not replace that handoff.
