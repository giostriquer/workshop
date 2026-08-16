# Decision: add `handoff-pr` and `handoff-review` skills

**Date:** 2026-06-08

## Status

Implemented.

## Context

A recurring manual prompt sits at the end of branch work: *"keep the branch, open
a PR on our behalf with the right ticket links, validate our rules, check we
didn't leak anything, and review the task against the code first."* The maintainer
writes some variant of this by hand every time, so it drifts: different wording,
different coverage, sometimes the leak check is dropped, sometimes the ticket link
is forgotten.

Two things make that prompt awkward to run inline:

1. The reviewing/authoring work wants **fresh, unbiased context**. A session that
   just wrote the code is the worst judge of whether the code matches the task;
   it "knows" the intent and reads it into the diff. A genuinely unbiased pass
   has to re-derive the task from the ticket and the diff, not from session chat.
2. Opening the PR often needs a **separately-authorized** session/agent. The
   implementing session may not hold PR-write authorization.

This decision distills that manual prompt into two skills. The honest origin
framing: these **codify a handoff prompt the maintainer has written by hand
repeatedly**, not a new invention.

## The unifying idea

Both are **handoff skills**: each packages the current work into a *self-contained
brief* that a **different** session or agent consumes with **zero shared context**,
and **neither performs the downstream action itself**. `handoff-review` never runs
review tools; `handoff-pr` never runs `gh pr create`.

The load-bearing property is that every brief **re-derives the task from the ticket
+ diff**, never from "what we discussed this session." Without that, the consuming
agent inherits the implementing session's blind spots and the fresh-eyes goal is
defeated. "This brief stands alone" is an explicit requirement for every mode of
both skills.

**"Zero shared context" excludes the implementing session's *interpretation*, not
the *ticket's ground truth*.** The reviewer must not inherit the author's reading
of the task (that's the bias being designed out), but it *does* need the task's
acceptance criteria to judge against. Those two are different inputs, and the brief
must carry the second: see the ticket-substance subsection under `handoff-review`.

## `handoff-review`

A review-brief generator. It produces an unbiased review prompt; it does **not**
review, and it does **not** prescribe which tools the reviewer should use.
Tool choice belongs to the session/agent that picks up the brief.

- **Trigger.** Work on a branch is done (or mid-way) and the operator wants a
  fresh, unbiased review before opening a PR.
- **Inputs it discovers.** The ticket (auto-detect → confirm, see `handoff-pr`
  detection); the branch and its diff against the base branch; and a re-derived
  statement of what the task was *supposed* to do, drawn from the ticket and
  commit messages rather than from session chat.
- **Output: a tool-agnostic review brief** that names *what* to check, never
  *how*:
  1. **Task vs. code**: Does the diff actually do what the ticket asked?
  2. **Rules / conventions conformance**: point the reviewer at the repo's own
     `CLAUDE.md` / `AGENTS.md` / convention docs; do not restate the rules in the
     brief.
  3. **Information leak**: secrets / keys, internal hostnames / paths, and
     private domain content (tied to the repo's own sanitization discipline).
  4. **General correctness / quality.**
  - Plus an explicit instruction to the reviewer to **form its own judgment from
    the diff, not trust this summary**, and a requested output shape (findings by
    severity + an overall go / no-go).
- **Ticket substance, not just a link.** The task-vs-code dimension is only as good
  as the acceptance criteria the reviewer can check against. Auto-detection yields a
  ticket *id / URL*; a freshly-spawned reviewer can't open it unless it has tracker
  access, so the most important dimension silently degrades to commits-only. The
  brief must therefore carry the task's *substance*, obtained in priority order:
  1. If a tracker integration is reachable (ClickUp / Linear / Jira MCP, or web
     access to the ticket URL), fetch the ticket body / acceptance criteria and
     embed it verbatim.
  2. Else, ask the operator to paste the acceptance criteria.
  3. Else, include a task summary but explicitly label it **"implementer's claim:
     verify against the actual ticket,"** paired with the "don't trust this summary"
     framing above.
  In spawn mode especially, the "what the task wanted" text must come from the
  ticket, **not** the implementing session's paraphrase: a session-derived summary
  is exactly the bias being designed out, so it only ever ships under the
  case-3 "implementer's claim" label.
- **Modes.**
  - **default (spawn).** Generate the brief and dispatch a fresh, unbiased
    subagent (via the host's Agent tool / general-purpose agent) to run it;
    return the findings. The subagent gets only the brief: no session history.
  - **handoff (`handoff-review handoff` / `session`).** Write the brief to a
    repo-local scratch file (default `tmp/handoff-review-<branch-slug>.md`, with the
    branch name sanitized: `/` → `-`) and print it for copy-paste into a new
    session. No agent is spawned.

## `handoff-pr`

A PR-artifact generator for a separately-authorized session. It **never opens the
PR**.

- **Trigger.** The work is ready for a PR but the current session isn't authorized
  to open one: package it for a session/agent that is.
- **Inputs it discovers.** Branch and base; commits / diff; the ticket
  (auto-detect → confirm); and the review status (passed? link to the review
  findings?).
- **Output: a structured PR artifact** (never opened here):
  - A suggested conventional-style title.
  - A body: change summary, **ticket link(s)** (ClickUp / Linear / Jira),
    validation / test status, review status, and any caveats / follow-ups.
  - Branch and base, plus an explicit note: *to open, an authorized session runs
    `gh pr create` with the above*: the skill itself never runs it.
- **Ticket detection.** Parse the branch name, commit messages, and any existing
  PR description for a ClickUp / Linear / Jira id or URL; present what was found;
  ask the operator to confirm or supply the correct one. If nothing is found, ask.
- **Delivery.** Structured output inline, optionally also written to a repo-local
  scratch md file (default `tmp/handoff-pr-<branch-slug>.md`, branch name sanitized
  the same way) for the authorized session to read.
- **Light coupling to `handoff-review`.** The artifact carries a *review status*
  field the operator fills from the review outcome; `handoff-pr` does not enforce
  that a review ran.

## Packaging: Path A (fold into `reviewers`, keep the name)

The `reviewers` plugin keeps its name and install path (`reviewers@agent-workshop`).
Its identity broadens from "four read-only review agents, no skills" to **review
and handoff tools (agents + skills)**: `handoff-review` *is* a review, and
`handoff-pr` is its natural ship-step sibling.

This touches several deliberately-agents-only invariants set by the original
`reviewers` decision (`docs/decisions/agent-workshop-direct-use-agents-plugin.md`)
and its comment-noise follow-up; those must be consciously loosened, not silently
broken:

- **Validator.** `scripts/validate-native-plugin.ps1` `Assert-ReviewersPlugin`
  currently hard-fails if `plugins/reviewers/skills` exists
  (`"reviewers must not contain a skills directory"`). That assertion must change
  to: the payload `skills/` directory contains exactly `handoff-pr` and
  `handoff-review`, each byte-identical to its `.claude/skills/<name>/SKILL.md`
  source (same discipline as the agent checks). The existing byte-identity checks
  for the four agents stay.
- **README.** `plugins/reviewers/README.md` "Not included" section currently reads
  "No skills, MCP servers, or hooks." Update to list the two shipped skills and
  keep the MCP/hooks exclusion. Update the lead description and add a skills table.
- **marketplace description.** The marketplace entry / plugin description text that
  says "without onboarding" stays true; broaden the wording to cover skills.

## Source of truth and parity

- **Canonical** lives at `.claude/skills/handoff-pr/SKILL.md` and
  `.claude/skills/handoff-review/SKILL.md`: the single source of truth, usable
  while working in the scaffold itself.
- **Plugin copies** at `plugins/reviewers/skills/<name>/SKILL.md` are
  byte-identical to canonical, enforced by the validator (same discipline the
  agents already follow: no divergent variants).
- **Host mirrors** per the skill-parity convention: `.codex/skills/<name>/SKILL.md`
  and `.gemini/skills/<name>/SKILL.md`, recorded in the project's skill-parity
  manifest with their expected per-host adaptation (default: byte-identical).
  `.opencode/` does not mirror skills by convention.
- **Onboard references (required: confirmed by the validator, not optional).**
  `Assert-ReferenceSetMatchesSources` enforces, for **both** reference roots
  (`skills/agent-workshop-onboard/references/` and the byte-identical copy under
  `plugins/agent-workshop/skills/agent-workshop-onboard/references/`):
  - every `.claude/skills/<name>/SKILL.md` has a byte-identical mirror at
    `references/skills/<name>.md` (a flat file, not a dir);
  - every `docs/skills/<name>.md` (including `README.md`) has a byte-identical
    mirror at `references/docs/skills/<name>.md`.
  So each new skill adds **four** reference files (two roots × {skill mirror, origin
  doc}), and editing `docs/skills/README.md`'s index forces updating its two
  reference copies too.
- **Origin docs** at `docs/skills/handoff-pr.md` and `docs/skills/handoff-review.md`
  (origin pressure, problem, solution shape, real workflow snippet, pitfalls,
  adaptation notes), plus index entries in `docs/skills/README.md`.

The full landing footprint per skill (≈10 files): canonical SKILL.md, `.codex`
mirror, `.gemini` mirror, plugin copy, two reference-skill mirrors, origin doc, two
reference-doc mirrors: plus the shared `docs/skills/README.md` and its two mirrors,
the validator change, the `reviewers` README + `plugin.json` version bump, and the
matching `marketplace.json` version. This is why it needs a written plan, not an
ad-hoc edit.

## Non-goals

- Neither skill performs the downstream action: `handoff-review` does not review,
  `handoff-pr` does not open the PR.
- `handoff-review` does **not** name or invoke specific review tools/skills (e.g.
  `code-review`, `security-review`): the consuming agent chooses its own tools.
- Do not add an MCP server, app, hook, or runtime service to the plugin.
- Do not fork the skills into divergent host copies: mirrors stay byte-identical
  to canonical except for recorded per-host adaptations.
- Do not widen the `reviewers` curated *agent* set in this slice.

## Validation

- `scripts/validate-native-plugin.ps1` passes with the loosened skills assertion:
  the `reviewers` payload exposes exactly the four agents and exactly the two
  skills, each byte-identical to canonical.
- `claude plugin validate .` and `claude plugin validate ./plugins/reviewers`
  both pass.
- The skill-parity script (`scripts/skill-parity.ps1` or equivalent) classifies
  both new skills as `IDENTICAL` (or `ALLOWED_DRIFT` with a recorded reason) across
  the mirrored hosts.

## Acceptance criteria

- From the local marketplace, installing `reviewers` exposes the four agents **and**
  the two skills (`handoff-pr`, `handoff-review`), each invocable directly.
- `handoff-review` produces a self-contained brief that re-derives the task from
  ticket + diff, covers the four dimensions, prescribes no tools, and supports both
  the spawn and handoff modes.
- `handoff-pr` produces a structured PR artifact with confirmed ticket link(s) and
  a review-status field, and never runs `gh pr create`.
- Ticket auto-detection finds an id/URL from branch/commits/PR description when
  present and asks to confirm; asks outright when absent.
- The two shipped skill files are byte-identical to canonical, enforced by the
  validator; mirrors are recorded in the skill-parity manifest.
- `docs/change-log.md` gets an entry via the `change-log` skill when the work lands.

## Open decisions

Settled for this slice:

- Path A (keep `reviewers` name, broaden identity). Operator-approved.
- `handoff-pr` is artifact-only; it never opens the PR.
- `handoff-review` is tool-agnostic; it names review dimensions, not tools.
- Ticket detection is auto-detect-then-confirm.
- Claude Code is the primary delivery host; `.codex` / `.gemini` mirrors follow the
  skill-parity convention.

To decide during implementation planning:

- Exact mode keyword for `handoff-review`'s file/paste mode (`handoff` vs `session`
  vs accept both).
- Exact scratch-file dir for handoff artifacts (`tmp/` assumed) and whether the
  skill instructs the operator to gitignore it.
- The `reviewers` plugin `version` bump (skills are an additive feature → minor
  bump) and whether `keywords` in `plugin.json` gain a `handoff` term.
