# Decision: add the `claim-check` skill

**Date:** 2026-06-15

## Status

Implemented (2026-06-15). `validate-native-plugin.ps1` passes.

A completeness sweep during execution caught two skill-set enumerations the
packaging list below had missed: `docs/marketplace/native-plugin.md` and
`docs/marketplace/README.md` (each mirrored into both reference roots). Both
name the Codex reviewers skill surface and were updated to include
`claim-check`, then re-mirrored. The lesson for the next skill addition: the
reviewers skill set is enumerated in the marketplace docs too, not only the
plugin manifests and READMEs.

## Context

A recurring task across real sessions: the operator hands the session a
**premise**: most often a tracker ticket, but sometimes a hunch they are
carrying or a bare question, and wants it investigated *before* anyone acts on
it. The premise cannot be trusted at face value: the code may have moved, a
sibling ticket or merged PR may have addressed it in full or in part, or the
framing may simply be stale. But it also cannot be assumed wrong: **the premise
still holding is a perfectly good, often the best, outcome.**

The operator has been hand-rolling this prompt repeatedly. The wording drifts
every time ("spawn agents to explore," "never assume, if you are unsure,
search," "the ticket being correct is a fine answer," "gather context so we can
work it reliably"), but the intent is stable. That drift across a stable intent
is the textbook pressure for a skill: capture the invariant once, stop
re-deriving the prompt.

The investigation answers **two separate questions** the operator keeps asking
together:

1. Is the premise still true, given the current repo?
2. If it is actionable, what do we need to know to work it reliably, or what is
   missing that blocks it?

## The shape

`claim-check` is an **unbiased, evidence-grounded investigation skill** the main
session invokes with a premise. It is generalized over input source: a ticket
is the richest and primary worked example, not the skill's identity.

**Load-bearing rule (the invariant that makes it work):** every claim is a
*hypothesis to be checked against current repo reality*, neither assumed true nor
assumed false. The skill is not trying to prove the premise wrong *or* to
rubber-stamp it; "the premise still holds" is a first-class outcome.
Conclusions come only from evidence the session went and found. Anything unknown
resolves to "go search," never "probably."

**Input front-end (resolve the premise by source):**

- **A ticket / doc (link or pasted):** fetch its substance: tracker MCP / web
  if reachable, else ask the operator to paste the body + acceptance criteria.
  Its claims arrive pre-articulated. (Same graceful fallback as `handoff-review`
  for getting the ticket's substance, not just its link.)
- **A hunch / context the operator is carrying, or a bare question:** no claims
  are stated yet, so **articulate the premise into atomic, checkable claims and
  confirm them with the operator before investigating.** This articulation step
  is the guardrail that keeps generality from becoming mush: the investigation
  always operates on concrete hypotheses regardless of how fuzzy the input was.

**Investigation:**

1. Decompose the premise into atomic claims (the hypotheses).
2. Check each claim against the current repo. **Fan-out is the recommended tool
   here (not a mandate**) strongest for code/doc *scanning*; the main session
   orchestrates and may search directly. **Subagent briefs must be neutral and
   specific** ("what does the code at X currently do?", not "confirm X is
   missing") and must return **evidence, not judgments.** That neutrality plus
   tight scoping is what keeps the fan-out from drifting loose: the operator's
   stated concern.
3. Scan for prior / parallel work (commits, merged PRs, sibling tickets) that
   already addressed the premise in full or in part. (The "another ticket fixed
   it" case the premise itself can't see.)
4. **Adversarially re-check** any conclusion that came back "confirmed" *or*
   "obsolete": a second pass that tries to falsify it. This guards against both
   a wrong "it's already handled" and a lazy rubber-stamp.

**Two-axis output** (kept separate so a valid premise can still be "not ready"):

- **Validity verdict**: one of:
  - `confirmed`: the premise holds; worth acting on.
  - `partially-confirmed`: part holds, part is already addressed or false.
  - `refuted / obsolete`: no longer holds (already fixed, or never matches
    current reality).
  - `mis-scoped`: points at something real but its framing / scope is wrong;
    the actual situation differs.
  - `confirmed-but-blocked`: holds and actionable, but needs more info or a
    decision before it can be worked reliably.

  Each verdict carries its **evidence**: `file:line`, commits, related
  tickets / PRs.
- **Readiness**: if actionable, a **dossier**: where to start, the relevant
  code / docs, gotchas, dependencies, open unknowns. If not ready, **exactly
  what is missing** to make it workable.

**Terminal state:** deliver verdict + dossier, hand control back. The skill
**never implements** the work. That is a separate, deliberate step the operator
owns.

**Artifact:** structured in-chat report by default. The session *may* persist it
where it naturally belongs: a repo documentation home if one fits the existing
pattern, or `tmp/<YYYY-MM-DD>-<slug>-claim-check.md` when durability or handoff
is wanted. Not forced either way; the session judges by the repo's conventions
and the operator's intent.

**Rules section will pin:** never conclude from assumption; unbiased
(confirming the premise is a win); articulate fuzzy input into confirmed claims
before investigating; subagent briefs neutral + evidence-returning; stop at the
dossier, never implement.

## Skill body outline

Matches the reviewers-plugin house style (statement of what it does / doesn't →
*When to use* → *The one rule that makes this work* → *Resolving the premise* →
*Steps* → *Output* template → *Rules*). The ticket case is the inline worked
example.

## Packaging

Full `doc-to-html`-equivalent landing: core parity + the `reviewers` direct-use
channel + the onboarding reference mirrors (forced by the validation script) +
both plugin version bumps. The marketplace `catalog.json` is **not** touched
because it indexes agents only. The Codex marketplace file (`.agents/plugins/marketplace.json`)
is **not** touched because it carries no version or skill-list fields for either
plugin.

**Core parity (6):**

- Canonical: `.claude/skills/claim-check/SKILL.md`.
- Byte-identical mirrors: `.codex/skills/claim-check/SKILL.md`,
  `.gemini/skills/claim-check/SKILL.md` (per the skill-parity convention;
  `.opencode/` does not mirror skills).
- Origin doc: `docs/skills/claim-check.md`.
- Roster entry in `docs/skills/README.md` (count grows by one).
- `README.md` skills lines: both the reviewers skills line and the scaffold
  skill count: gain `claim-check`.

**`reviewers` channel (5): version `0.5.0` → `0.6.0`:**

- Byte-identical payload: `plugins/reviewers/skills/claim-check/SKILL.md`.
- `plugins/reviewers/README.md`: skills table + prose (four skills → five).
- `plugins/reviewers/.claude-plugin/plugin.json`: version.
- `plugins/reviewers/.codex-plugin/plugin.json`: version + `longDescription` +
  `defaultPrompt` (name the fifth skill).
- `.claude-plugin/marketplace.json`: `reviewers` entry version (+ description if
  it enumerates skills). Must equal the manifest version (validation asserts).

**Onboarding reference mirrors (6): forced by `validate-native-plugin.ps1`:**

The script asserts every `.claude/skills/*` and every `docs/skills/*` has a
byte-identical mirror in **both** reference roots. Adding the canonical skill and
origin doc therefore requires, in each of the root reference root
(`skills/agent-workshop-onboard/references`) and the Codex reference root
(`plugins/agent-workshop/skills/agent-workshop-onboard/references`):

- `references/skills/claim-check.md` (== canonical SKILL.md).
- `references/docs/skills/claim-check.md` (== origin doc).
- `references/docs/skills/README.md` (re-mirror, since the roster changed).

**Onboarding plugin version bump (`agent-workshop` `0.1.4` → `0.1.5`): payload
changed, so installs should refresh:**

- `.claude-plugin/plugin.json` (root manifest).
- `plugins/agent-workshop/.claude-plugin/plugin.json` (Claude payload manifest;
  validation asserts it equals the root manifest).
- `plugins/agent-workshop/.codex-plugin/plugin.json` (Codex payload manifest;
  validation asserts it equals the root manifest).
- `.claude-plugin/marketplace.json`: `agent-workshop` entry version (must equal
  the manifest version).

**Validation + change log (2):**

- `scripts/validate-native-plugin.ps1`: the two `$expectedSkills` arrays
  (`Assert-ReviewersPlugin`, `Assert-CodexReviewersPlugin`) widen to
  `@("claim-check", "doc-to-html", "handoff-goal", "handoff-pr", "handoff-review")`.
- `docs/change-log.md`: entry via the `change-log` skill when this lands.

## Amendment (2026-06-16): refinements from first runs

Two independent model runs on real tickets plus operator review converged on a
handful of changes, landed as `reviewers` `0.6.0` → `0.6.1` and `agent-workshop`
`0.1.5` → `0.1.6` (skill body + six mirrors, origin doc, this doc):

- **Verdict-first output.** Both runs flagged that the template buried the lede.
  The report now leads with the verdict and its how-verified, then readiness;
  `Source` drops to the bottom.
- **Lopsided per-claim reporting.** Investigate every claim atomically, but report
  only contested/divergent claims; settled ones collapse, and a uniform verdict
  needs no claim list. (Operator: the readiness section already carries what a
  flat per-claim list would.)
- **Provenance step.** Check where the premise's evidence came from vs. the repo's
  actual source of truth: the decisive move in one run, previously only implicit.
- **Verification harness ≠ fix.** The terminal boundary moved from "never run
  anything" to "never implement the fix": a repro / falsification test for a code
  claim is now explicitly part of the search. This revises the original
  "stop at the dossier, never implement" decision for code claims specifically.
- **Conflict reconciliation.** When subagents disagree, read the disputed lines
  yourself; never average: the disagreement is the signal.
- **Depth calibration.** Right-size the investigation to the claim's blast radius.
- **`mis-scoped` gets a "corrected framing" slot** in the output, which previously
  overloaded the readiness section.

## Amendment (2026-06-16): depth gate + `inconclusive` verdict

Operator reported that two separate sessions concluded too early: confident
verdicts that were only corrected after the operator contested them. Since depth
is the skill's whole purpose, this is the central failure mode, addressed as
`reviewers` `0.6.1` → `0.6.2` and `agent-workshop` `0.1.6` → `0.1.7`:

- **Evidence ladder + grounding gate** (new *Grounding a verdict* section): a
  claim earns `confirmed`/`refuted` only from direct evidence the session
  examined itself (ran a repro / read the source / read the generating artifact);
  a subagent's summary or an inference is `unverified` and the search continues. A
  headline verdict is only as strong as its weakest load-bearing claim.
- **Contest test:** before emitting any verdict, each load-bearing claim must be
  defensible by a specific artifact that would survive the operator pushing back;
  "I found something plausible" is not a stopping condition.
- **New `inconclusive` verdict** (sixth bucket): needs-more-information as a
  first-class honest outcome, but *earned*, gated behind a genuine deep search
  hitting a real wall, and required to name the wall and the breaching input. It
  is distinct from `confirmed-but-blocked` (work blocked vs. investigation
  incomplete) and explicitly not a lazy escape from digging.

This deepens, but does not contradict, the original "never conclude from
assumption" rule, which makes "assumption" concrete (anything below the top of the
evidence ladder) and gives the unreachable case an honest home.

## Amendment (2026-06-16): output trimmed to three parts

A real-run output was hard to read despite the verdict-first reordering: the
report was wrapped in a `>` blockquote (rendered as a dense annotation block that
buried the verdict), still enumerated a verdict per claim (which the operator had
twice said the readiness dossier already covers), echoed back a `Source` the
operator supplied, and pushed an over-long prior/parallel-work dump to the
bottom. The template's slots were the cause: the model dutifully filled each
one, so the fix deletes slots rather than reweighting them
(`reviewers` `0.6.2` → `0.6.3`, `agent-workshop` `0.1.7` → `0.1.8`):

- The report is now **three parts and nothing else**: Verdict (+ how-verified),
  Prior/parallel work, Readiness: written as **plain text, never a blockquote**.
- **No per-claim table.** Claims are still investigated atomically; only the
  conclusion is reported. The verdict synthesis and the readiness dossier carry
  which parts are real or stale.
- **Prior/parallel work stays a section but is trimmed** to what bears on the
  verdict (stale-closing commits, tickets to coordinate or not regress) and lifts
  back up above readiness; the exhaustive related-ticket/branch catalogue is cut.
- **No echoed `Source`.** An explicit **Do not** list in the skill pins all four
  cuts so the model cannot drift back.

## Non-goals

- Not a research / deep-research skill. Those face outward and forward (what's
  out there, what's coming); `claim-check` faces inward and present (is this
  true, here, now). It does not do web-survey research as its purpose.
- It does not implement the work it validates. The dossier is the terminal
  deliverable; acting on it is a separate step the operator triggers.
- It does not pick the premise for the operator. With no clear input it asks,
  rather than inventing a claim to check.
- It is not an agent. The main session orchestrates and fans out to subagents; a
  single dispatched agent cannot drive that fan-out.

## Validation

- `scripts/validate-native-plugin.ps1` passes (both `$expectedSkills` arrays
  widened; all mirrors byte-identical; both version bumps consistent across
  manifests and the Claude marketplace).
- GREEN test: a model given the skill and a premise that is *already addressed
  by a merged change* reports `refuted / obsolete` **with the addressing commit
  / PR as evidence**, rather than either assuming the premise true or
  rubber-stamping it.
- GREEN test: a model given the skill and a *fuzzy hunch* (not a ticket) first
  articulates atomic claims and confirms them before investigating, rather than
  investigating the vague statement directly.

## Acceptance criteria

- `/claim-check <ticket | claim | question>` runs the investigation and returns
  the two-axis output (validity verdict with evidence + readiness dossier or
  what's-missing), and stops without implementing.
- The skill text carries the neutral-subagent-brief rule and the
  articulate-before-investigating guardrail explicitly.
- All mirrors (`.codex`, `.gemini`, `plugins/reviewers`, both onboarding
  reference roots) are byte-identical to canonical / source.
- `reviewers` is at `0.6.0` and `agent-workshop` at `0.1.5`, consistent across
  every manifest and the Claude marketplace entry.
- `docs/change-log.md` gets an entry via the `change-log` skill when this lands.
