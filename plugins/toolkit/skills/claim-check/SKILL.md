---
name: claim-check
description: Use when you have a premise to verify before acting on it — most often a tracker ticket, but also a hunch you are carrying or a bare question — and you want a deep, unbiased, evidence-grounded investigation rather than a guess. Treats each claim as a hypothesis checked against the current repo and the provenance of its own evidence; a confident verdict requires direct evidence the session examined itself, so "needs more information" is a legitimate honest outcome rather than a forced answer. Scans for work that already addressed it, and returns a concise verdict-first report — the validity verdict with how it was verified, the prior/parallel work that bears on it, and the readiness dossier (or what is missing). Builds a repro to prove or break a code claim, but does not implement the fix.
---

# Claim Check

Investigate a **premise** — a ticket, a hunch, a question — deeply against the
current state of the repo, and report whether it still holds and whether it can
be acted on. This skill **runs the investigation** — including any repro needed
to prove or break a claim — and stops at a verdict; it does **not** implement the
fix the premise calls for.

## When to use

Someone hands you something to act on and you should not take it at face value
first: a tracker ticket from an earlier audit, a suspicion you are carrying ("I
think our cache double-fetches"), or an open question about the code. The code
may have moved, a merged change may have addressed it in full or in part, or the
framing may be stale — and equally, it may be exactly right. You want to **know**
before anyone builds on it.

## The one rule that makes this work

Every claim is a **hypothesis to be checked against current repo reality** — not
assumed true, not assumed false. You are not trying to prove the premise wrong,
and you are not trying to rubber-stamp it: **"the premise still holds" is a
first-class outcome**, as good as "already handled." Conclusions come only from
evidence you went and found. Anything you cannot show is unknown, and unknown
means *go search* — never "probably." Do not under-search; an unverified claim is
not a finding.

## Access precondition — STOP if you can't reach the source

A claim-check is only as real as the evidence you can examine firsthand, and that
starts with the premise's own source. **Before investigating, confirm you can
actually reach what the premise rests on** — the ticket or PR that *states* it, and
the repo, file, doc, or reference it is *about*. If you cannot — no tracker
integration and the URL won't load, the PR or repo isn't accessible to this
session, the reference is missing or paywalled, and the operator hasn't pasted the
substance — then you do **not** have a premise to check. **STOP and say so.**

Report the gap plainly: which resource you could not access, what you tried, and
the one thing that would unblock you (paste the ticket body, grant repo access,
share the doc). Do **not** reconstruct the premise from the link's slug, the ticket
ID, your own memory of it, or inference, and do **not** run an investigation
against a guessed version of the claim — a confident report built on a resource you
never saw is exactly the failure this skill exists to prevent.

This STOP is distinct from `inconclusive`. `inconclusive` is *earned* after a
genuine investigation hits a wall on a load-bearing claim; the access STOP fires
*before* you start, because the premise's substance never arrived — it is a
precondition failure, not one of the verdict buckets. The partial case still
proceeds: when only the *prior-work backlog* is unreachable (the tracker won't take
a query) you investigate anyway and record that the backlog wasn't swept.

## Grounding a verdict

This is deliberately a *deep* investigation. The failure mode to beat is
**satisficing** — taking the first plausible evidence and emitting a confident
verdict. Two guards against it.

**The evidence ladder.** Rank what a claim rests on, strongest first:

1. a repro that ran, or the exact source lines you read yourself
2. the generating artifact the code conforms against (spec, config, codegen input)
3. a subagent's *quoted* snippet you can see and check
4. a subagent's summary, or a doc that merely looks consistent
5. inference / "it would make sense if"

A claim earns `confirmed` or `refuted` **only from rungs 1–2** (a quoted snippet
on rung 3 can support it when you can see and trust the quote). Anything resting
on rungs 4–5 is **unverified** — keep digging; do not promote it to a verdict. A
headline verdict is only as strong as its **weakest load-bearing claim**: if one
load-bearing claim is still unverified, the verdict cannot be `confirmed` or
`refuted`.

**The contest test.** Before you emit any verdict, for each load-bearing claim
ask: *what exact artifact did I examine that settles this, and would it survive
the operator pushing back once?* If the honest answer is "I inferred it" or "a
subagent said so," you are not done — go read the source. "I found something
plausible" is never a stopping condition; the stopping condition is "every
load-bearing claim sits at the top of the ladder, or I have hit a real wall."

**`inconclusive` is earned, not an escape.** When a genuine deep search hits a
real wall — an artifact you cannot access, an ambiguity the repo does not
resolve, context only the operator holds — the honest verdict is `inconclusive`:
name the specific wall and the one input that would breach it. This is legitimate
**only after** rungs 1–2 are genuinely exhausted; reaching for it to avoid
digging is the same premature-conclusion failure in a different coat.

## Resolving the premise

Where the claims come from depends on the input:

- **A ticket or doc (link or pasted).** Get its *substance, not just its link* —
  fetch the body and acceptance criteria via a tracker integration or the URL if
  reachable; otherwise ask the operator to paste them. If neither lands, **STOP**
  (see *Access precondition*) rather than checking a premise you never read. Its
  claims arrive pre-articulated; read them as written rather than recalling them.
- **A hunch you are carrying, or a bare question.** No claims are stated yet.
  **Articulate the premise into atomic, checkable claims and confirm them with
  the operator before investigating.** This step is what keeps a fuzzy input from
  producing a fuzzy investigation — everything downstream operates on concrete
  hypotheses.
- **Nothing clear to check.** Ask. Do not invent a claim to investigate.

## Steps

**Right-size the depth to the claim's blast radius** before you start — a
load-bearing or architectural claim earns a deep sweep; a trivial one does not.
Over-investigating a typo and under-investigating a foundation are the same
mistake. Then:

1. **Resolve the premise** (above) and state the atomic claims you are about to
   check. For a hunch or question, get the operator's nod on the claim list
   first.
2. **Check each claim against the current repo.** Fan-out is the recommended
   tool — especially for code and doc *scanning* — but you orchestrate it and may
   search directly when that is tighter. A subagent brief must be **neutral and
   specific** ("what does the handler at `X` currently do?", not "confirm `X` is
   missing") and must return **evidence, not a judgment** (`file:line`, a
   snippet, a commit). Keep each brief scoped to one claim or one scan. **When
   subagents disagree, do not average them — read the disputed lines yourself and
   settle it on the evidence. The disagreement is usually the signal.**
3. **Check the provenance of the premise's evidence, not just the claim.** Ask
   where the premise's own evidence came from — a doc, a spec, a table, a repro —
   and whether that is the *same artifact the repo actually conforms against*. A
   claim can be internally tidy yet rest on the wrong source of truth (a vendor
   doc instead of the cached spec the code is generated from). The real finding
   often lives in the basis, not the assertion.
4. **For a falsifiable code claim, build the repro.** Writing and running a
   throwaway repro or falsification test *is* the search — "unknown means go
   search," and a failing-then-passing probe is the strongest evidence there is.
   This is not implementing the work: the **fix** stays out of scope, the
   **harness that proves or breaks the claim** does not.
5. **Scan for prior or parallel work** — the case the premise itself cannot see.
   Always search the repo's git history for commits and merged PRs that already
   address it in full or in part. If the tracker is queryable (the same
   integration or web access used to fetch the premise), also search it for
   sibling or duplicate tickets; if it is not reachable, say the backlog was not
   swept rather than implying it was. Record what you searched, so "none found"
   means something.
6. **Adversarially re-check your conclusions.** For anything that came back
   *confirmed* and anything that came back *obsolete*, take a second pass that
   tries to falsify it. This guards equally against a wrong "it's already handled"
   and a lazy rubber-stamp.
7. **Ground the verdict, then synthesize.** Run the contest test (see *Grounding
   a verdict*): confirm every load-bearing claim sits at the top of the evidence
   ladder. If one does not, keep digging; if a real wall blocks it, the verdict is
   `inconclusive`. Only then write the output below.

## Output

Keep the report **concise and verdict-first**, written as **plain structured text
— never wrapped in a `>` blockquote** (that renders as an annotation block that
buries the verdict). It has three parts and nothing else:

1. **Verdict — `<bucket>`:** the single most important sentence, then a tight
   rationale in a sentence or two — why this verdict and how it was verified
   (the decisive method and its rung on the ladder). The evidence itself
   follows as short labeled bullets — one per repro case with its
   observed-vs-expected result, one for the root-cause chain of `file:line`
   hops, one per caveat or limit on the evidence — so parallel cases and
   caveats sit side by side and can be compared. For `mis-scoped`, add a
   one-line **corrected framing**; for `inconclusive`, name the wall and the
   one input that would breach it.
2. **Prior / parallel work — `<status>`:** the status is one word, so the
   landscape reads at a glance: `clean` (the search found nothing that
   addresses or constrains it), `in-flight` (parallel work on the same ground
   is underway — coordinate first), `related` (nothing touches it directly,
   but merged or adjacent work bears on the fix), or `blocked` (other work
   must land first); when several apply, pick the one the operator must act on
   first. Then, as prose, only what *bears on the verdict* — the commits or
   PRs that already closed part of it, and the sibling tickets that need
   coordination or that a fix here could regress — plus one line on what was
   searched (so "none found" means something). Not a catalogue of every
   related ticket and branch.
3. **Readiness:** the section an implementer scans back to, so it is shaped for
   scanning. It opens with a one-line call — actionable, blocked (and on what),
   or not actionable (and exactly what is missing or what decision unblocks it)
   — plus where to start when there is one. The substance follows as short
   labeled bullets: one per candidate direction with its one-line trade-off
   (mark the recommendation when you have one), one per gotcha, dependency, or
   open unknown, each anchored to the relevant code or docs.

A `confirmed` premise can still be `confirmed-but-blocked` on readiness — surface
that when it is true.

**Do not:** give a verdict per claim (investigate every claim atomically, but
report the *conclusion* — the rationale and the readiness dossier already carry
which parts are real or stale, so a claim-by-claim table only repeats them); echo
the premise's source back (the operator handed it to you); pad prior/parallel
work with non-load-bearing tickets or branches; wrap the report in a blockquote.

Persist the report only when durability or a handoff is wanted (a repo docs home,
or `tmp/<YYYY-MM-DD>-<slug>-claim-check.md`); otherwise in-chat.

## Rules

- A claim-check requires firsthand access to the premise's source and the artifact
  it concerns. If either is unreachable and the operator can't supply it, **STOP**
  and report the access gap — never substitute the link slug, the ticket ID,
  memory, or inference for the resource you could not open, and never investigate a
  guessed premise. This precondition STOP is not `inconclusive` (which is earned
  only after a real investigation hits a wall).
- Never conclude from assumption. A claim earns `confirmed`/`refuted` only from
  direct evidence you examined yourself — the top of the evidence ladder — never
  a subagent's summary or an inference; unknown resolves to *search*, and for a
  falsifiable code claim the search includes building the repro.
- Do not satisfice. The verdict is only as strong as its weakest load-bearing
  claim; run the contest test before emitting one, and treat "I found something
  plausible" as a cue to dig, not to stop.
- `inconclusive` (needs more information) is a first-class, honest outcome —
  earned only after a genuine deep search hits a real wall, never used to dodge
  digging. Name the wall and the one input that would breach it.
- Stay unbiased. Confirming the premise and refuting it are equally good
  outcomes, decided by the evidence — including the **provenance** of that
  evidence, not just the claim itself.
- Articulate before investigating. A fuzzy input becomes confirmed atomic claims
  *before* the search starts; a ticket that already states its claims skips this.
- Subagent briefs are neutral, specific, and return evidence — never a leading
  question. When subagents disagree, settle it by reading the disputed lines
  yourself; never average conflicting reports.
- Re-check both "confirmed" and "obsolete" conclusions adversarially before
  reporting them.
- Right-size depth to the claim's blast radius — neither over-investigate trivia
  nor under-investigate a load-bearing claim.
- Lead with the verdict; the report is verdict + prior/parallel work + readiness
  and nothing else — no per-claim table, no echoed source, no blockquote wrapper.
  Bullet the verdict's evidence; open prior/parallel work with its one-word
  status and keep it to what bears on the verdict; shape readiness as a one-line
  call followed by labeled bullets.
- Stop at the fix, not at the search. Build the harness that proves or breaks a
  claim; do not implement the fix — acting on the findings is the separate step
  the operator owns.
