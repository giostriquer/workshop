# code-quality-review

## Origin

The pressure is a familiar one: a standard review approves a change because the
behavior is correct, and the codebase quietly gets worse. The diff works, the
tests pass, the reviewer leaves a few rename-level nits — and a file crossed a
thousand lines, a special-case `if` got bolted onto an unrelated flow, feature
logic leaked into a shared path, and an abstraction that buys nothing got added
"to be safe." None of it is a bug. All of it is debt, and a correctness-first
review has no teeth against it.

`code-quality-review` is the deliberately harsh counter-pressure. It is not a
gentler reviewer dialed up; it is a different posture — **ambition about
structure**. Its first instinct is not "this could be a little cleaner" but "is
there a *code-judo* move that deletes whole categories of complexity here?" It is
tuned to push for the reframing that makes the change feel inevitable in
hindsight, and to treat the messy-but-working implementation as a problem to
solve, not a result to rubber-stamp.

## Problem

A maintainability review fails in predictable ways when its posture isn't pinned:

1. **It settles for rearranging, not deleting.** A reviewer flags complexity and
   suggests centralizing it — moving the same moving pieces around — when the real
   win was a structural reframe that removes the pieces entirely. Cleaner spaghetti
   is still spaghetti.
2. **"It works" becomes the bar.** Correct behavior ends the conversation, so
   every change that passes tests is waved through regardless of what it does to
   the surrounding code's legibility.
3. **Erosion has no threshold.** Files drift past a healthy size, special-case
   branches accrete in busy functions, casts and optionality paper over unclear
   invariants, and bespoke helpers duplicate canonical ones — each step too small
   to block on its own, and collectively how a codebase rots.
4. **Feedback aims too low.** "Maybe rename this" when the real issue is an
   ownership-boundary leak or a missing model trains everyone to treat structural
   problems as cosmetic.

## Solution shape

A review skill with one job: hold an unusually strict, structure-first bar and
refuse to lower it for working code. It is **model-invocable** — the description
triggers on "strict code quality review," "deep code quality audit," or
"especially harsh maintainability review" — and it layers explicit rules on top
of a baseline audit prompt:

- **A baseline prompt** that frames the pass as a deep audit aimed at improving
  abstractions, modularity, succinctness, and legibility *without changing
  behavior*, with an explicit license to restructure and a "measure twice, cut
  once" rigor bar.
- **Non-negotiable standards** that name the specific erosions to fight: be
  ambitious about structural simplification (rule 0); don't let a file cross 1000
  lines without a strong reason (rule 1); don't allow ad-hoc spaghetti growth
  (rule 2); clean the design rather than accept working code (rule 3); prefer
  direct over magical (rule 4); push on type/boundary cleanliness (rule 5); keep
  logic in the canonical layer (rule 6); flag avoidable sequential or non-atomic
  orchestration (rule 7).
- **A primary-questions checklist, a flag-aggressively list, and a
  preferred-remedies list** that all bias the same direction — toward *deleting*
  complexity over polishing it, and toward the reframe over the rearrangement.
- **An approval bar** that names a short set of presumptive blockers (the
  1000-line crossing, ad-hoc branching into existing flows, feature checks
  scattered across shared code, unnecessary wrappers/casts, boundary leaks,
  canonical-helper duplication, and an obvious-but-missed decomposition), each
  waivable only with a clear justification.
- **A scope boundary** (added 2026-08-12 from field feedback — Q15, after a
  session used the review as an implementation-discovery engine and grew a
  one-ticket change into a 52-file workset): the strictness applies within
  the accepted work's boundary; out-of-scope findings are labeled follow-up
  rather than fixed in this change, unless they prove the change unsafe or
  incorrect. The pass fires **once, only when the work-stream's
  implementation is believed complete, right before the PR-or-merge gate** —
  never mid-implementation.

The throughline is the tone section's demand: be direct and demanding, don't
soften major maintainability issues into mild suggestions, and don't be satisfied
with a cleaner version of the same messy idea when a much simpler idea is
plausible.

## Real invocation snippet

> /code-quality-review do a strict structural pass on the current branch

The skill runs the deep-audit baseline, then holds the strict bar against the
diff: it hunts for a code-judo reframe before accepting the implementation, calls
the 1000-line file crossing and the new special-case branch as presumptive
blockers, points feature logic that leaked into a shared path back to its own
abstraction, and prioritizes a few high-conviction structural findings over a
long list of cosmetic nits.

## Pitfalls observed

- **Drifting back to nits.** The skill's whole value is structural ambition; a
  review that returns a pile of rename suggestions has missed the point even if
  every nit is correct.
- **Rubber-stamping "it works."** Correct behavior is the entry condition for the
  review, not a passing grade.
- **Flooding the report.** A long list of low-value comments buries the one
  structural finding that matters; prefer a small number of high-conviction calls.
- **Treating the 1000-line rule as a hard cap.** It is a strong smell and a
  conversation-starter ("can we decompose this first?"), waivable for a compelling
  structural reason with a still-clearly-organized result — not a mechanical
  line-count gate.
- **Demanding a reframe that doesn't exist.** Ambition is the default, not a
  mandate to invent complexity; when no code-judo move is available, the honest
  call is to say so.
- **Using the review as an implementation-discovery engine.** Running it
  mid-implementation and feeding each round's findings back into the diff
  grows the change without bound (the lived case: one ticket → 52 files
  across six subsystems). It fires once, at believed-complete; out-of-scope
  findings become follow-ups.

## Adaptation notes

- The skill is host- and language-agnostic: it names no framework, package, or
  domain, and its type-cleanliness rule reads in TypeScript terms (`any`,
  `unknown`, optionality) but the underlying concern — don't let casts and silent
  fallbacks hide an unclear invariant — ports to any typed language.
- The 1000-line threshold is the one concrete number; adjust it to your codebase's
  norms, but keep it as a *threshold that starts a decomposition conversation*,
  not a blocker on its own.
- It is a strict counterpart to `pattern-reviewer` (conformance to documented
  patterns) and the correctness-focused review path: this skill owns
  *maintainability and structural ambition* specifically, and is meant to be run
  when you want the harsh, deep pass rather than a routine check.
- Run it on a bounded diff (a branch or PR). Pointed at an unbounded surface it
  will still find structural problems, but its prioritization and approval bar are
  written for "should this change land," not "audit the whole repo."
