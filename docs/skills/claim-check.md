# claim-check

## Origin

A prompt the maintainer rewrote by hand almost daily: hand a session a ticket
from an earlier audit and say, in some new phrasing each time, *"don't assume
this is still true — a previous investigation is done, but the scope may be
stale; spawn agents, never assume, if you're unsure search; and the ticket being
right is a perfectly good answer, we just have to know."* The intent never
changed; the wording drifted every time, and the two halves of the ask — *is it
still true?* and *can we actually tackle it?* — got tangled together differently
on each run.

`claim-check` formalizes that prompt into one repeatable investigation.

## Problem

Three failure modes in the ad-hoc flow:

1. **Trusting a stale premise.** The code moves and tickets age. A premise from
   last quarter's audit may be fully or partly fixed by a merged PR nobody linked
   back to the ticket — and acting on it wastes the work.
2. **Biased toward "the ticket is wrong."** Told to "double-check," a session
   often sets out to *refute*, and over-reports staleness. Confirming the premise
   is the better outcome when it is true; the investigation has to be genuinely
   two-sided.
3. **A verdict you can't act on.** Even a correct "yes, still valid" is useless if
   the session then has no idea where to start. The two questions — *true?* and
   *workable?* — must both be answered, separately.

## Solution shape

A run-it-now investigation, not a brief generator (it is the opposite of the
`handoff-*` skills in that respect). It resolves a premise from any source — a
ticket is the richest and primary case, but a hunch or a bare question works too
— decomposes it into atomic claims, and checks each against the current repo.
Fan-out is recommended for code and doc scanning but not mandated; the main
session orchestrates and keeps subagent briefs neutral and evidence-returning so
the search doesn't drift — and when subagents disagree, it reads the disputed
lines itself rather than averaging them. It interrogates the *provenance* of the
premise's evidence (is the basis the same artifact the repo conforms against?),
not only the claim. It scans for prior or parallel work the premise can't see,
adversarially re-checks both "confirmed" and "obsolete" conclusions, and returns
a concise, **verdict-first** report in three parts — the validity verdict (with
how it was verified), the prior/parallel work that bears on it, and the readiness
dossier (or exactly what's missing) — reporting the *conclusion*, not a
claim-by-claim table. For a falsifiable code claim it will build a repro to prove
or break it (that is the search, not the fix), but it stops short of implementing
the fix.

The load-bearing constraint: every claim is a hypothesis checked against
evidence, never assumed in either direction. "It still holds" and "already
handled" are equally good outcomes — the evidence decides. And the evidence must
be *direct* — source read, a generating artifact, or a repro that ran, not a
subagent's summary or an inference; a confident verdict is only as strong as its
weakest load-bearing claim, and when a deep search genuinely cannot reach ground
truth, `inconclusive` is the honest answer.

For a fuzzy input (a hunch, not a ticket) there is one extra gate: articulate the
premise into concrete claims and confirm them with the operator *before*
searching. Without it, a vague input yields a vague investigation.

## Real invocation snippet

> /claim-check https://tracker/…/CHAR-1234

Fetches the ticket's substance, decomposes its claims, investigates each against
the repo, and returns the verdict + dossier. The ticket being correct is a clean
result — followed by the dossier needed to work it.

> /claim-check I think our drive-item path resolver double-fetches children

No structured claims yet: the skill first restates this as atomic claims
("resolver calls children endpoint twice for nested paths", "the second call is
uncached"), confirms them with the operator, then investigates.

## Pitfalls observed

- **Leading subagent briefs.** "Confirm endpoint X is missing" biases the
  subagent toward the answer. Briefs ask "what does X do?" and return evidence,
  not a verdict to rubber-stamp.
- **Skipping the prior-work scan.** The most common reason a valid-looking premise
  is actually obsolete is a merged PR or sibling ticket — invisible unless you go
  look for it.
- **Stopping at the verdict.** A `confirmed` premise that is also
  `confirmed-but-blocked` needs the blocker surfaced; a `confirmed` premise that's
  ready needs the start-here dossier. The verdict alone isn't the deliverable.
- **Drifting into implementation.** Once the premise checks out, it is tempting to
  just start. The *fix* is the operator's step. (Refining a falsifiable code claim
  with a throwaway repro is not that drift — it is the search; only the fix is out
  of bounds.)

## Refinements from first runs

Surfaced by early lived-in use on real tickets:

- **Provenance, not just truth.** The decisive crack in one investigation was
  checking the ticket's *evidence source* against the repo's source of truth (a
  vendor doc vs. the cached spec the code is generated from), which flipped two
  rows of a "verified" comparison table. Promoted to an explicit step: interrogate
  where the premise's evidence came from, not only whether the claim reads true.
- **Verification harness ≠ fix.** A falsifiable code claim is best settled by a
  failing-then-passing repro — the strongest form of "go search." The terminal
  boundary is "don't implement the fix," not "don't run anything."
- **Conflicting subagents are the signal.** In multiple runs, two code-mapping
  agents disagreeing was the cue to read the disputed lines directly. The skill
  now says: never average conflicting reports; settle them yourself.
- **Lead with the verdict; report only the conclusion.** Reviewers had to scroll
  past a claim-by-claim table (and an echoed Source line) to reach "don't build
  this," and the verdict itself was buried in a blockquote annotation. The output
  is now three plain-text parts — verdict + how-verified, the prior/parallel work
  that bears on the verdict (trimmed to what matters, not a catalogue), and the
  readiness dossier — with no per-claim table, no echoed source, and no blockquote
  wrapper. Investigate every claim atomically; report the conclusion, not the
  table.
- **Right-size to blast radius.** An XS ticket does not warrant five agents; a
  load-bearing architectural claim does. Depth is now explicitly a function of
  what the claim would cost if wrong.
- **No source, no check — STOP before investigating.** A session handed a ticket it
  could not access (no integration, URL unreachable, no paste) ran the claim-check
  anyway, reconstructing the premise from the link and its own memory and producing
  a verdict on a resource it never saw. The substance-fetch fallback ("otherwise
  ask the operator to paste") read as a soft suggestion under momentum, and
  `inconclusive` didn't cover it — that outcome is *earned after* a real
  investigation hits a wall, whereas here the premise's substance never arrived. An
  explicit **access precondition** now fires first: if the premise's source, or the
  artifact it concerns (ticket, PR, repo, file, reference), can't be reached and
  the operator can't supply it, STOP and report the access gap — never substitute
  the slug, memory, or inference for the resource. Distinct from `inconclusive` by
  construction (can't-start vs hit-a-wall). See
  [`docs/decisions/claim-check-access-precondition.md`](../decisions/claim-check-access-precondition.md).
- **Readiness is shaped for scanning.** A real run returned a strong verdict and
  prior-work sweep but a readiness section written as one dense paragraph — the
  candidate directions inline as "(a) … (b) … (c) …" with the gotchas woven in —
  and the operator flagged it as hard to read. This is a shaped-output failure,
  not a discipline one, so per `writing-skills` ("match the form to the
  failure") the fix is a recipe, not a prohibition: readiness opens with a
  one-line call (actionable / blocked-and-on-what / not-actionable-and-why, plus
  where to start) and everything enumerable follows as short labeled bullets —
  one per candidate direction with its trade-off and marked recommendation, one
  per gotcha / dependency / open unknown, each anchored to code or docs. The
  wording was micro-tested 5-vs-5 against the incumbent on the real failing
  material: all five recipe reps converged on the scannable shape, while the
  incumbent left the gotchas as dense prose in five of five and reproduced the
  fully-inline failure in one. (This pass deliberately left verdict and
  prior/parallel work as prose — an assumption the next lived run falsified;
  see the following refinement.) See
  [`docs/decisions/claim-check-readiness-shape.md`](../decisions/claim-check-readiness-shape.md).
- **The verdict's evidence is bulleted too, and prior/parallel work opens with a
  status word.** The run right after the readiness reshape produced a verdict
  that opened well and then wove three repro cases, the root-cause chain, and a
  provenance caveat into one dense paragraph — parallel cases impossible to
  compare — while the prior/parallel section, though good, gave no first-glance
  answer to "is anyone on this?". Same failure class (wrong-shaped output),
  same fix form (a recipe, not a prohibition): the verdict is now headline +
  one-two-sentence rationale, then short labeled bullets — one per repro case
  with its observed-vs-expected result, one for the root-cause chain of
  `file:line` hops, one per caveat or limit on the evidence; prior/parallel
  work opens with a one-word status — `clean` / `in-flight` / `related` /
  `blocked` — then stays prose. Micro-tested 5-vs-5 on the real failing
  material: all five incumbent reps reproduced the dense-verdict failure, all
  five recipe reps converged on the bulleted shape and independently picked
  the same status word. See
  [`docs/decisions/claim-check-verdict-and-priorwork-shape.md`](../decisions/claim-check-verdict-and-priorwork-shape.md).
- **Depth over speed — and "needs more information" is honest.** Two separate
  sessions returned confident verdicts too early and only found the real evidence
  after the operator contested them. The fix is a grounding gate, not a nudge: an
  *evidence ladder* (ran-a-repro / read-the-source at the top; subagent summary
  and inference at the bottom) where a `confirmed`/`refuted` verdict is earned
  only from the top rungs, a verdict is only as strong as its weakest load-bearing
  claim, and a *contest test* ("would this survive the operator pushing back?")
  runs before any verdict ships. When a genuine deep search hits a real wall, the
  earned outcome is the new `inconclusive` verdict — name the wall and the one
  input that would breach it — explicitly gated so it cannot become its own lazy
  escape from digging.

## Adaptation notes

- The substance-fetch step degrades gracefully across trackers (ClickUp / Linear
  / Jira) — integration if present, operator paste otherwise — the same pattern
  `handoff-review` uses.
- The six-bucket verdict taxonomy (`confirmed` · `partially-confirmed` ·
  `refuted/obsolete` · `mis-scoped` · `confirmed-but-blocked` · `inconclusive`) is
  portable; rename to match how your team talks about outcomes.
- The artifact is in-chat by default; point the optional persisted copy at
  whatever docs home or scratch dir your project uses, and gitignore the scratch
  path.
- Pairs naturally with `handoff-goal`: when a `confirmed` premise is ready to
  work, the dossier feeds straight into a goal handoff for a fresh session.
