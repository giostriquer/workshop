# claim-check

## What it does

`claim-check` takes a **premise** (a tracker ticket, a hunch, or a bare
question about the code) and investigates it against the current repo. It
reports whether the premise still holds and whether anyone can act on it. The
main session does the work itself: it breaks the premise into atomic claims,
sends subagents to scan, reads any disputed lines, and builds repros. It stops
at a verdict.

## When to reach for it

Invoke it by name with the premise (`/claim-check <ticket | claim | question>`),
or pick `audit`'s **deep audit** tier. It fits a stale ticket, a suspicion that
keeps coming back, or a claim that some work is complete.

| The problem | The skill |
| --- | --- |
| One premise, ticket, or hunch to test against the repo | `claim-check` |
| Something to check, not yet sized | `audit` |
| A broad surface at team scale | `qa-sweep` |
| One just-finished change with a drivable runtime surface | `empirical-proof` |
| A failure you are fixing that needs sustained debugging | `systematic-debugging` |

## The access precondition

Before investigating, the skill confirms it can reach two things: the premise's
source (the ticket, PR, or doc) and the artifact the premise is about. If
either is missing and you haven't supplied what it says, the skill **pauses
that claim**. It names the resource and the one thing that would unblock it.
Other claims go on. It never rebuilds a claim "from the link's slug, the ticket
ID, your own memory of it, or inference." The pause isn't an `inconclusive`
verdict, because it comes before any investigation. An unreachable tracker
backlog pauses nothing, and the report says the backlog wasn't searched
([decision](../decisions/claim-check.md)).

## The evidence ladder

From strongest to weakest:

1. A repro that ran, or source lines read firsthand.
2. The artifact the code conforms against (spec, config, codegen input).
3. A quoted snippet from a subagent that you can see and check.
4. A subagent's summary, or a doc that merely looks consistent.
5. Inference.

Only rungs 1 and 2 can carry `confirmed` or `refuted`, with rung 3 as support.
Rungs 4 and 5 count as unverified. A verdict is only as strong as its weakest
load-bearing claim. Each such claim must pass the **contest test**: which
artifact settles it, and would it survive the operator pushing back once?

## The verdicts

| Verdict | Meaning |
| --- | --- |
| `confirmed` | The premise holds |
| `refuted` / `obsolete` | Already fixed, or never true |
| `mis-scoped` | Real, but framed wrong; includes a corrected framing |
| `confirmed-but-blocked` | Holds, but needs information or a decision first |
| `inconclusive` | A real wall was hit; names the wall and the input that would get past it |

When claims come out differently, the verdict may hold a per-claim table.
`confirmed` and `obsolete` results both get an adversarial second pass.

## The steps

1. **Resolve the premise.** Read a ticket's claims as written. Turn a hunch
   into atomic claims. Ask only if different readings would change the
   investigation.
2. **Check each claim against the current repo.** Subagent briefs stay neutral
   and return evidence, not judgments. When subagents disagree, the session
   settles it by reading the lines.
3. **Check provenance.** Does the premise's evidence come from the artifact the
   repo actually follows?
4. **Build a repro** for any falsifiable code claim.
5. **Scan for prior or parallel work** in git history, and in the tracker when
   it can be queried.
6. **Re-check adversarially** any result that came back `confirmed` or
   `obsolete`.
7. **Ground the verdict** with the contest test.

Depth scales with the claim's blast radius.

## The report

Plain structured text, never a `>` blockquote, in three parts:

1. **Verdict: `<bucket>`.** The key sentence, then the method and its rung,
   then evidence bullets.
2. **Prior / parallel work: `<status>`.** One of `clean`, `in-flight`,
   `related`, or `blocked`, then anything that bears on the verdict and what
   was searched.
3. **Readiness.** A one-line call (actionable, blocked, or not actionable) and
   where to start, then bullets for options, gotchas, and unknowns.

By default the report stays in chat. If you want it kept or handed off, it goes
to `.workbench/<work_scope>/<slug>-claim-check.md` or a repo docs home, with
any repro worth keeping next to it
([decision](../decisions/workbench-operator-decisions.md)).

## Common questions

**It asked me to paste the ticket body. Is it broken?**
No. It couldn't reach the premise's source. Paste the text or grant access.

**Can it proceed on a best guess?**
No. It never investigates a premise it had to reconstruct.

**It came back `confirmed`. Did it just agree with me?**
No. A `confirmed` verdict needs rung 1 or 2 evidence and must survive the
adversarial re-check.

**Is `inconclusive` a cop-out?**
Only when it names no wall and no input that would get past it.

**Will it fix what it finds?**
Not during the investigation. Repairs you've already authorized come after, as
a separate step, and they don't overwrite the verdict.

**Is it always this heavy?**
For a five-minute suspicion, pick `audit`'s **quick look** tier.

## It's working if

- The report opens with a verdict.
- Every load-bearing claim traces to a repro or a `file:line`.
- Every falsifiable code claim came with a repro.
- Prior/parallel work states its status and what was searched.
- It paused on a premise it couldn't read.
- **Not working:** "likely" behind a `confirmed`, a blockquoted report, or a
  repair that quietly replaced the verdict.

## Where it fits

It is one of the two engines behind the flow's door A ("verify · hunt ·
check"). `audit` dispatches it. Findings shaped like a feature go to
`brainstorming`, and a confirmed fix goes to the route pick. `qa-sweep` applies
the same discipline to a broad surface, and `empirical-proof` proves one change
at runtime.
