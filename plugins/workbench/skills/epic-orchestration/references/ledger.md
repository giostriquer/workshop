## Keep a local epic ledger

Reuse the epic scope folder's README or CURRENT entry point; otherwise create
`LEDGER.md`. Other indexes point there. This is disposable working state under
`using-workbench`, not a second tracker or committed documentation layer.

Open with the primary journey and each step's state. Keep the approved goal,
closure bar, exclusions and scope sources distinct from discovered follow-ups,
including findings that move no step. Each follow-up and debt item carries the
operator's disposition (`do before close`, `separate ticket accepted` or `drop`)
or `awaiting operator`. Track each workset's state, assigned lane,
readiness dependencies and next action separately from a lane's completed history.
Track active lanes and contract revisions, worktrees, holds, decisions and their
sources and owners. For each active lane keep the latest reconciliation: the
date observed, its newest handback, worktree HEAD, working-tree fingerprint
(`git status --porcelain` plus a hash of `git diff HEAD`), whether the host's
session list shows the lane running (unknown where the host cannot list
sessions, which does not count as running), and `current`, `unrelayed handback`
or `silent since <last activity>`. A lane is `silent` only after two
reconciliations in a row with the same handback, HEAD and fingerprint. A closed-out lane, including one whose work was withdrawn or
reassigned, keeps its closeout date and leaves the active list. Record each hold with what it stops, its source's exact words, the
date it began and the date and evidence of its last recheck, so a recovered
session can neither widen it nor repeat it unobserved.
Index briefs, evidence, recovery material and the tracker backlog; governing
scope sources determine membership. Record local tooling locations and their
publication boundary, including the source of any explicit promotion, so recovery
does not turn local verification into a delivery obligation.
Distinguish reported claims from verified results and bind evidence to revisions.
Keep a **Tracker sync** entry with item references, last confirmed ticket and
epic statuses, and pending transitions; mark it not applicable without a tracker.

Start from the ledger and load sources needed for the next decision. Refresh
volatile facts before relying on them. After meaningful handbacks, rulings or
state changes, replace affected entries in place. Before compaction or handoff,
ensure a successor can recover the next action, authority, constraints and
proof without the conversation. Keep detailed reports beside the ledger instead
of copying them into a growing session history.

Confirmed in-scope work needing separate assignment gets a deduplicated ticket
under existing write authority. Never modify tickets the operator does not own;
reference them as context. Active-lane corrections remain in that contract.
Uncorroborated, disproved or scoped-out claims retain evidence and disposition.
Before wave closeout, give every finding and debt item a destination or explicit
disposition. Close fixed tickets with the fixing PR and resulting behavior.

Shared tracker updates carry what readers need: objective, behavioral bar,
owner, dependencies, delivery and a concise evidence summary. Local recovery
alone does not authorize publication; references must work for their readers.
Without write authority, retain the item locally with an owner and pending action.

Retain active contracts; accepted revisions and validation/review evidence while
delivery is pending; and final evidence, limits and durable follow-ups after
closure. Retire superseded instructions from startup only when active lanes,
dependent consumers and held delivery no longer need them. Preserve stable
references, frozen audit inputs and required recovery material. Retirement grants
no ticket, worktree, publication or deletion authority. Archive or delete only
under applicable retention and cleanup authority; epic closure is not a cleanup
request.
