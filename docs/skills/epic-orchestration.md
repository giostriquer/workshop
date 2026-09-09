# epic-orchestration

## What it does

`epic-orchestration` puts the session in the seat of the **epic owner**: the
one who holds the tickets, writes the prompts other sessions execute, verifies
what comes back against the repository itself, and decides whether a PR may be
opened. It never implements, commits, pushes, or merges.

It exists for the case where the work is too large for one session and the
runner is you. There is no dispatcher and no automation: the operator is the
only wire between sessions, pasting prompts out and reports back.

Four roles, and the skill refuses to let them blur:

| Role | Owns |
| --- | --- |
| Orchestrator (the session running this skill) | tickets, lane prompts, independent validation, rulings, authorization |
| Implementer lane | one worktree, one report, and a dispatched `code-quality-review` before handing back |
| Auditor | a blind empirical audit of the artifact, with repro and anchor per finding |
| Operator (you) | dispatch, merges, product rulings |

It is **user-invoked only** (`disable-model-invocation: true`).

## When to reach for it

Type `/epic-orchestration` when an epic spans enough tickets that one session
cannot hold it, and you intend to run the implementation sessions yourself by
hand. Also reach for it at the other end, when an epic looks finished and you
want it closed on evidence rather than on an empty ticket list.

| The problem | The skill |
| --- | --- |
| A multi-ticket epic, lanes dispatched by hand | `epic-orchestration` |
| One long-running goal a single fresh session should pursue alone | [handoff-goal](handoff-goal.md) |
| A broad surface worth team-scale coverage in one pass | [qa-sweep](qa-sweep.md) |
| One premise, ticket, or hunch to settle | [claim-check](claim-check.md) |
| One finished change to prove at the running app | [empirical-proof](empirical-proof.md) |

Not for implementing a change yourself, and not for a single ticket.

## Common questions

**What does it actually produce?**

Paste-ready blocks. A lane prompt is one self-contained message (setup, the
tickets with anchors and the behavioral bar, evidence paths, method, the epic's
standing rules verbatim, advisory coordination, and the exact report format).
Authorization is its own block.

Each one arrives inside a named envelope, `Paste this into <LANE>:` followed by
the prompt, repeated once per destination. Several lanes in one message is the
desirable case rather than the exception: that is what grouping by file
ownership buys, and a message with four live blocks costs you four pastes and no
decisions.

**Will it queue up prompts for me to send later?**

No. Everything it hands you is dispatchable the moment it writes it, because you
are routing prompts to workers rather than holding a queue, and a prompt you
have to sit on gets pasted at the wrong moment or not at all. A prompt whose
trigger has not fired is not written yet: the session holds it, watches for the
trigger itself, and issues it in its own block when it fires.

**How does it group work into lanes?**

By **file ownership, not by topic**. The rule comes from the failure it
prevents: every semantic merge conflict in practice came from two lanes
touching one contract from different directions. Unrelated-looking tickets that
touch the same hot file belong in one lane.

**How does it connect to the rest of the workbench?**

At two points, both named in the skill rather than left to the session. A lane
runs [code-quality-review](code-quality-review.md) over its own diff before
handing back, dispatched to a reviewer that did not write the code. And
authorization files the PR through [file-pr](file-pr.md), with the block saying
outright that `file-pr`'s review gate is already satisfied, because that review
ran on this diff.

That last part matters in practice: `file-pr` opens with a MUST that an
adversarial review has run, and a lane that is not told the gate is satisfied
will read the MUST and run a second full review on a diff that already had one.
The exemption being claimed is `file-pr`'s own ("the review already ran on this
diff"), not a loophole. Verify direct corrections without repeating the whole review; materially changed behavior or new risk needs focused independent follow-up. A semantic conflict while syncing the actual integration branch stops the lane for a decision rather than being guessed through.

**Does it trust the reports?**

The orchestrator pins the reported commit and creates a disposable validation checkout. Preserve the active lane, tests, and fixtures; revert/remove only changed production code identified from repository conventions. Run focused regression cases, require the intended assertion to fail, restore the fix in isolation, and require those cases to pass. When applicable, scan for banned content, review infrastructure design, and exercise what a gate accepts, including negative cases; do not infer coverage from a successful script alone.

**The lane already had its diff reviewed. Why validate again?**

Because the two ask different questions. `code-quality-review` asks whether the
code is well built. Validation asks whether the lane's claim is true, and the
reviewer handed a diff does not know the ticket's behavioral bar, cannot tell a
real red-flip from one that silently no-opped, and has no reason to ask what a
gate accepts. The skill carries a rationalization table for this and seven
other ways the check gets skipped.

**Can it reproduce every finding?**

No, and it is required to say so plainly rather than imply otherwise. What it
must reproduce is anything that would alter scope, reverse a prior fix, or
claim a regression.

**Where do debt and follow-ups go?**

Every item retains durable traceability. Confirmed actionable work gets a deduplicated ticket under existing explicit write authority; unresolved/disproved claims keep their evidence record and disposition. Without publication authority, prepare the ticket content and name the pending action.

The structural half is what makes it hold: `DEBT + FOLLOW-UPS` is a required
slot in the lane report format, so a lane either fills it in or visibly leaves
it empty. It cannot be silently skipped.

This includes debt the epic itself creates. A fix that widened a type, left a
shim in place, or pinned a version to get CI green is debt the moment it merges,
and it gets filed in the wave that created it rather than a cleanup pass nobody
schedules.

**When is the epic done?**

On a **blind re-audit**, not on an empty ticket list. The auditor starts from
the artifact and never from the PR list, and its mandate has two halves: probe
the surfaces, and attack the fixes the previous audit provoked, because those
are the least weathered code. Expect several rounds; the close decision is
yours, not the session's.

**Will the PR mention the process?**

No. PR text describes the change and its stakes. No lane names, no "epic", no
review mechanics; ticket links go in the actual repository template fields.

## It's working if

- Every prompt you receive is dispatchable as-is, with nothing for you to fill in.
- Reports come back validated against the repo, with the checks named and the
  unverified parts stated as unverified.
- Lanes that touch the same file arrive in the same prompt.
- Confirmed actionable debt, follow-ups, and deferrals have deduplicated ticket ids or a named pending publication step; unresolved/disproved claims retain their evidence record and disposition.
- Negative signal: a lane report accepted because it looked complete. The whole
  pattern exists to stop coverage claims that outrun their evidence.

## Where it fits

Above the workbench flow, and made of it. The other workbench skills run inside
a single session's work; this one coordinates several of those sessions across
an epic and owns the judgment none of them can make alone. It does not
reimplement what they do: a lane's review is
[code-quality-review](code-quality-review.md), and landing is
[file-pr](file-pr.md). That dependency is why it ships in `workbench` rather
than the optional `toolkit`, which installs without them.

Its closest neighbor is [handoff-goal](handoff-goal.md), which packages one
goal for one fresh session. `epic-orchestration` is the case where one package
is not enough and verifying what comes back is the job.

Every return ends with a verified acknowledgment and an immediate next action: dispatch ready lanes; name a pending delivery gate and owner; dispatch the blind closing audit; propose closure after corroboration; or identify a concrete blocker. Keep the full lane report and dispatch templates. Lanes and orchestration validation use focused local tests plus mandatory gates; full suites run in PR CI by default. Separate Opus/Sol agents watch CI, never Astra/Fable or the parent. Implementer lanes handle fixes; the orchestrator sends correction handoffs.
