## Closing the epic

**The blind audit.** The auditor starts from the artifact, not PR history, probes
declared epic surfaces against approved criteria and attacks prior fixes. Require
each fix family's held/broken result with evidence, and each finding's repro and
current source anchor. An unreproduced finding stays uncorroborated or blocked;
calling it disproved requires contrary evidence. Successful-run-only corpora
cannot establish absence of failures.

Corroborate the audit's verdict-moving claims yourself. A HOLDS label does not
replace missing required evidence. Another round needs an unresolved finding,
changed behavior or an evidence gap; round count is not a closure criterion.

**Follow-ups get a ruling first.** Before proposing closure, give the operator
the ledger's open follow-ups and debt items, one per line:

`<n>. <item> · <anchor> · <why it is not in the epic> · disposition: <do before close | separate ticket accepted | drop | awaiting operator>`

The operator sets each disposition. `do before close` is the operator's scope
amendment for that item: record it as a governing source, add it to the primary
journey (as a step after the user path when it serves none), then revalidate
and dispatch it as a workset; the epic stays open.
`separate ticket accepted` names the ticket. Closure is proposable when no line
reads `awaiting operator` and no `do before close` item is unfinished.

**The proposal.** Summarize coverage, accepted limits and the ruled follow-up
list with each disposition, and propose closure to the operator. An open item
is never an accepted limit: a limit is a boundary the operator already approved,
cited to its source. Only the operator closes the epic.

Preserve the audit report locally, publish a concise verdict under existing
authority, and retire working instructions only when their ledger obligations
are satisfied.
