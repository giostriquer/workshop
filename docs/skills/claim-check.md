# claim-check

## What it does

`claim-check` takes a **premise**: a tracker ticket, a hunch you are carrying,
a bare question about the code, and investigates it against the current state
of the repo until it can say whether the premise still holds and whether anyone
can act on it. The skill's own framing: "Investigate a **premise** … deeply
against the current state of the repo, and report whether it still holds and
whether it can be acted on."

It is a **protocol the main session drives**, not an agent you dispatch. The
session orchestrates: it decomposes the premise into atomic claims, fans out
neutral subagent briefs for scanning, reads disputed lines itself, and, for a
falsifiable code claim, writes and runs a throwaway repro. The design record
is explicit that "it is not an agent … a single dispatched agent cannot drive
that fan-out."

The investigation ends at its verdict, including any repro needed to prove or break a claim. An audit-only request ends there. Already-authorized in-scope repairs continue as implementation after the findings are recorded.

## When to reach for it

Invoke it by name with the premise (`/claim-check <ticket | claim | question>`;
on hosts that namespace plugin skills, `/workbench:claim-check`). It is also the
engine the `audit` protocol dispatches when you pick the **deep audit** tier.
`audit` sizes the workload and runs the user exchanges; `claim-check` does the
investigating. A session may also reach for it unprompted when you hand it
something to verify before acting.

Situations that fit:

- A ticket written weeks ago that nobody has re-checked against today's code.
- A suspicion you keep repeating out loud ("I think our cache double-fetches").
- "Is the refactor actually complete?": a completeness claim someone asserted.
- Any premise where being wrong would cost real implementation work.

| The problem | The skill |
| --- | --- |
| One premise, ticket, or hunch to test against the repo | `claim-check` |
| Something to check but you have not sized the work yet | `audit` asks for the tier, then dispatches |
| A broad surface (release, branch, feature area) at team scale | `qa-sweep` |
| One just-finished change with a drivable runtime surface | `empirical-proof` |
| About to claim done, fixed, or passing | `verification-before-completion` |
| A bug you already have in hand and intend to fix now | `systematic-debugging` |
| An idea to build rather than a claim to test | `brainstorming` (the flow's door B) |

## The access precondition

This is the part users hit first, so it comes before the mechanics.

Before investigating, the skill confirms it can reach **both** the premise's
source (the ticket, PR, or doc that *states* it) and the artifact the premise is
*about* (the repo, file, or reference). If either is unreachable and you cannot
supply it, the skill **stops that affected claim**: "If you cannot … then you do **not** have a
premise to check. **STOP and say so.**"

For affected claims, it reports the inaccessible resource, what it
tried, and the one thing that would unblock it: paste the ticket body, grant
repo access, share the doc. What you explicitly do *not* get is a reconstructed
premise. Independent accessible claims continue. The skill forbids rebuilding the claim "from the link's slug, the
ticket ID, your own memory of it, or inference."

That prohibition exists because of a lived failure, recorded in
[the access-precondition decision](../decisions/claim-check-access-precondition.md):
a session was handed a ticket URL it could not open, went ahead anyway,
reconstructed the premise from the link and its own memory, and produced a
confident verdict "on a resource the session never examined." The skill already
said to ask for a paste; it did not say *stop*, and a model under momentum read
that as a suggestion.

**This affected-claim STOP is not the `inconclusive` verdict.** The skill draws the line
itself: "`inconclusive` is *earned* after a genuine investigation hits a wall on
a load-bearing claim; the access STOP fires *before* you start, because the
premise's substance never arrived." One partial case still proceeds: if only the
*prior-work backlog* is unreachable (the tracker won't take a query), the
investigation runs and the report records that the backlog wasn't swept.

## The evidence ladder

The failure mode this skill is built to beat is **satisficing**: taking the
first plausible evidence and emitting a confident verdict. Two guards.

The ladder ranks what a claim can rest on, strongest first:

| Rung | Evidence | Can it carry a verdict? |
| --- | --- | --- |
| 1 | A repro that ran, or the exact source lines you read yourself | Yes |
| 2 | The generating artifact the code conforms against (spec, config, codegen input) | Yes |
| 3 | A subagent's *quoted* snippet you can see and check | Supports one, when the quote is visible and trustworthy |
| 4 | A subagent's summary, or a doc that merely looks consistent | No: **unverified**, keep digging |
| 5 | Inference, "it would make sense if" | No: **unverified**, keep digging |

And the rule that binds it: "A headline verdict is only as strong as its
**weakest load-bearing claim**." One unverified load-bearing claim means the
verdict cannot be `confirmed` or `refuted`.

The second guard is the **contest test**. Before any verdict, for each
load-bearing claim: "*what exact artifact did I examine that settles this, and
would it survive the operator pushing back once?*" If the honest answer is "I
inferred it" or "a subagent said so," the investigation isn't finished.

Both guards were added after two separate sessions concluded too early and were
only corrected when the operator contested them: the central failure mode for a
skill whose whole purpose is depth ([decision](../decisions/claim-check.md)).

## The verdicts

| Verdict | Meaning |
| --- | --- |
| `confirmed` | The premise holds; worth acting on. |
| `partially-confirmed` | Part holds; part is already addressed or false. |
| `refuted` / `obsolete` | No longer holds: already fixed, or never matched reality. |
| `mis-scoped` | Points at something real, but the framing or scope is wrong. Carries a one-line **corrected framing**. |
| `confirmed-but-blocked` | Holds and is actionable, but needs information or a decision first. |
| `inconclusive` | A genuine deep search hit a real wall. Names the wall and the one input that would breach it. |

The taxonomy is recorded in [the origin decision](../decisions/claim-check.md);
the skill body names every bucket except `partially-confirmed` inline.

`confirmed` is not a failure to find anything. The skill's load-bearing rule:
"**'the premise still holds' is a first-class outcome**, as good as 'already
handled.'" Both `confirmed` and `obsolete` conclusions get an adversarial second
pass that tries to falsify them, precisely so neither becomes a rubber stamp.

## The steps

1. **Resolve the premise.** A ticket or doc gives you its claims pre-articulated:
   read them as written. A hunch or bare question has no claims yet, so the
   skill **articulates atomic, checkable claims and proceeds when the meaning is clear; only material ambiguity needs confirmation**. Nothing clear to check? It asks rather than
   inventing a claim.
2. **Check each claim against the current repo.** Fan-out is recommended for
   scanning, but briefs must be "**neutral and specific**" and must "return
   **evidence, not a judgment**." When subagents disagree: "do not average them:
   read the disputed lines yourself and settle it on the evidence."
3. **Check the provenance of the premise's evidence.** Not just the claim, where
   its evidence came from, and whether that is the same artifact the repo
   actually conforms against. "The real finding often lives in the basis, not the
   assertion."
4. **For a falsifiable code claim, build the repro.** Writing and running it *is*
   the search.
5. **Scan for prior or parallel work**: git history always, the tracker when it
   is queryable. What was searched gets recorded "so 'none found' means
   something."
6. **Adversarially re-check** anything that came back `confirmed` or `obsolete`.
7. **Ground the verdict, then synthesize**: run the contest test first.

Depth is right-sized to the claim's blast radius up front: "Over-investigating a
typo and under-investigating a foundation are the same mistake."

## The report

Three parts and nothing else, as plain structured text, never wrapped in a `>`
blockquote.

1. **Verdict: `<bucket>`.** The single most important sentence, a one-or-two
   sentence rationale naming the decisive method and its rung on the ladder, then
   the evidence as short labeled bullets: one per repro case with its
   observed-vs-expected result, one for the root-cause chain of `file:line` hops,
   one per caveat.
2. **Prior / parallel work: `<status>`.** A one-word status so the landscape
   reads at a glance: `clean`, `in-flight`, `related`, or `blocked`. Then prose,
   limited to what bears on the verdict, plus one line on what was searched.
3. **Readiness.** A one-line call: actionable, blocked (and on what), or not
   actionable (and what would unblock it): plus where to start. Then labeled
   bullets: one per candidate direction with its one-line trade-off
   (recommendation marked), one per gotcha, dependency, or open unknown, each
   anchored to code or docs.

Keep the verdict, prior/parallel work, and readiness dossier. A compact per-claim table inside Verdict is useful when independent claims have mixed outcomes; it does not replace the evidence ladder or the overall conclusion.

By default the report lands in chat. Persist it only when durability or a handoff
is wanted: a repo docs home, or the work scope's folder as
`.workbench/<work_scope>/<slug>-claim-check.md`. Repro artifacts worth keeping go
in that same folder, "never a per-run temp directory."

## Common questions

**It stopped and asked me to paste the ticket body instead of investigating. Is
it broken?**
No. That is the access precondition firing, and it is the single most common
first encounter with this skill. It could not reach the ticket, PR, doc, or repo
the premise rests on. Paste the substance (body plus acceptance criteria), grant
access, or hand it the artifact directly, and it will run.

**Can I tell it to proceed anyway with its best guess?**
The skill has no such mode. Reconstructing the premise from a slug, an ID,
memory, or inference is prohibited outright, because "a confident report built on
a resource you never saw is exactly the failure this skill exists to prevent."
If you want a guess, you want a different kind of conversation.

**The verdict came back `confirmed`. Did it just agree with me?**
Not by construction. Anything `confirmed` gets an adversarial re-check that tries
to falsify it, and the verdict itself is admissible only from rungs 1–2 of the
evidence ladder. If the report cites a repro that ran or source lines the session
read, the agreement is earned.

**It said `inconclusive`. Is that a cop-out?**
It is a first-class outcome, but a gated one: legitimate "**only after** rungs
1–2 are genuinely exhausted." A real `inconclusive` names the specific wall and
the one input that would breach it. An `inconclusive` that names neither is the
skill being misapplied.

**Will it fix what it finds?**
The investigation builds the repro and preserves its verdict before any repair. A review-only request ends with that report. If the user already asked for repairs too, continue the authorized implementation as a separate step and verify it; do not erase the original finding. A falsification test remains part of the investigation ([decision](../decisions/claim-check.md)).

**Why is it asking me to approve a list of claims before it starts?**
It should ask only when intended meaning or scope remains materially ambiguous. Clear atomic claims can be investigated directly, whether they came from a ticket or a question.

**Can the report include a claim-by-claim table?**
Yes, when independent claims have mixed outcomes. Keep it inside Verdict and retain the evidence ladder, overall conclusion, prior-work summary, and readiness dossier.

**Does it search the web or survey the ecosystem?**
No. The design record draws this line: research skills "face outward and forward
(what's out there, what's coming); `claim-check` faces inward and present (is
this true, here, now)."

**Can I dispatch it as a single subagent and walk away?**
It is written for the orchestrating session. It fans out to subagents, reconciles
their disagreements by reading the disputed lines itself, and runs the repro: a
single dispatched agent cannot drive that.

**Where do the report and the repro files end up?**
In the work scope's folder, `.workbench/<work_scope>/`. This was tightened after
an audit run scattered evidence across three separate system-temp directories
that all belonged to one work scope
([decision](../decisions/evidence-one-home-per-scope.md)). One work scope, one
folder: agents are handed the path, they never pick their own.

**Is it always this heavy?**
Depth is right-sized to blast radius, but the floor is still an
evidence-grounded investigation. For a five-minute suspicion, take `audit`'s
**quick look** tier instead of this engine.

## It's working if

- The first line of the report is a verdict bucket, not a preamble.
- Every load-bearing claim traces to a repro that ran or to `file:line` you can
  open yourself.
- A falsifiable code claim came with a repro, not a reading of the code.
- Prior/parallel work opens with one of `clean` / `in-flight` / `related` /
  `blocked`, and says what was searched.
- Readiness scans in seconds: a one-line call, then labeled bullets you can act
  from.
- It stopped rather than investigating a premise it could not read.
- **Not working:** hedged language ("likely", "probably", "it would make sense
  if") carrying a `confirmed` verdict, an unsupported claim-by-claim verdict, a report wrapped
  in a blockquote, or the session silently replacing the original verdict with a repaired result or fixing without authority.

## Where it fits

`claim-check` sits at the workbench flow's **entry**: door A, "verify · hunt ·
check." You size the workload, `audit` dispatches this engine for the deep tier,
and the verdict either ends the work (report and done) or reveals work that
routes onward: feature- or refactor-shaped findings hand into `brainstorming`
with the findings as context, a confirmed fix goes straight to the route pick.
Its closest neighbors are `qa-sweep`: the same "treat it as a hypothesis, go
verify" spine, applied to a broad running surface at team scale rather than one
premise, and `empirical-proof`, which proves one finished change at its runtime
surface instead of testing a claim about the code.

Missing access pauses affected claims only; do not reconstruct their substance from URLs or memory. Continue independent accessible claims. Clear atomic claims can be investigated without a confirmation turn. Seek reachable discriminating evidence, then report any concrete limit when reasonable paths are exhausted.
