# Decision: `handoff-pr` follows the repo PR template instead of replacing it

**Date:** 2026-06-19

## Status

Implemented.

## Context

`handoff-pr` was already reworked to *derive the PR body from the repo's own PR
template* (see `handoff-pr-template-derived-body.md`). Its rules say the body **is**
the template, filled in. But in lived use the opposite happened: PRs went out
carrying the skill's **built-in fallback** headings (`Summary` / `Ticket` /
`Caveats`) even though the repo shipped a template. The model replaced the template
with the skill's outline.

Root cause is a skill-design attractor, not a missing rule. "The artifact" section
presented the built-in skeleton as a concrete, copy-ready blockquote, while
template-following was described only in prose. A model assembling the artifact
pattern-matches to the concrete structure in front of it. Two reinforcing gaps:

- **No forcing function on detection.** Nothing made the model prove it actually
  searched for a template before using the fallback; "none: built-in fallback" was
  an easy, unverified claim.
- **No conformance check.** Even when a template was found, nothing verified the
  emitted body's headings matched it, so added/renamed sections slipped through.

This was surfaced by a weaker model's review of real PRs. That review was **heavily
over-fitted to one specific repo** (a named formatter, package manager, task
runner, ticket-id scheme, review bot, tracker, branch-scope vocabulary, colleague
names, and PR numbers). Per the scaffold's portability rule, none of that may enter
the skill. The decision extracts only the **generalizable** defect: replace-vs-
follow, and fixes it tool-agnostically.

## The shape

Per `writing-skills` "match the form to the failure," this is a wrong-shaped-output
failure (used the skeleton instead of the template), so the fix is a positive
recipe + a structural gate + removing the attractor, not just another prohibition:

1. **Recorded detection gate (Step 3).** The body may be built only after the search
   outcome is recorded: *found (path)* or *none found after searching the listed
   locations*. A fallback body with no actual search is named as the bug.
2. **Demoted fallback (The artifact).** The PR-body block now leads with the
   template path as the normal case and labels the skeleton explicitly as
   "fallback, only when Step 3 found no template," so the skeleton stops reading as
   the default.
3. **Heading-conformance check (Step 5).** Before finalizing a template-based body,
   confirm its headings match the template's exactly: same set, same order, none
   added (no `Summary`/`Caveats` unless the template has them), none renamed.
4. **Named anti-pattern (Rules + two-rules).** "Never replace a found template with
   the built-in skeleton" is stated where the model will see it.

Two adjacent, genuinely generalizable nuggets from the review were folded in,
strictly tool-agnostic:

- Validation evidence mapped into a template's testing/QA field should be the
  **commands run + their results**, not bare test-file names.
- If the repo enforces **PR title / branch-name conventions** (a PR-title linter,
  commit-lint, a branch rule), conform to the pattern it actually enforces,
  discovered from config rather than from a guessed scope. (Real, common CI failure class;
  stated without any project's scope vocabulary or ticket shape.)

## Explicitly rejected (project-specific over-fit)

Not added, because they couple the scaffold to one repo: a hardcoded PR skeleton
with a specific `PR_TEMPLATE_ID` and metadata footer; named formatter / package
manager / task runner / lockfile-check commands; a specific ticket-id scheme and
tracker URL; named branch-scope vocabulary; a specific review bot's summary-block
(`CURSOR_SUMMARY`) preservation rule (and `handoff-pr` never edits a PR body after
creation, so it is out of scope regardless); colleague names and PR numbers. The
*general* forms of the useful ones (discover gates; discover title/branch rules;
commands+results in test evidence) are already in the skill.

## Non-goals

- No hardcoded template skeleton: the body is always the repo's own template, or
  the minimal fallback only when there is none.
- `handoff-pr` still never opens or edits the PR.
- The `description` (triggering conditions) is unchanged.

## Packaging

- Canonical `.claude/skills/handoff-pr/SKILL.md` edited; byte-identical mirrors
  re-propagated to `.codex/`, `.gemini/`, `plugins/toolkit/`, and both onboarding
  reference roots. Origin doc `docs/skills/handoff-pr.md` updated and mirrored.
- A subsequent change after the prior batch shipped: `toolkit` `0.8.2` → `0.8.3`
  (patch), `agent-workshop` `0.1.13` → `0.1.14` (patch: onboarding payload mirrors
  changed). `scripts/validate-native-plugin.ps1` `$expectedSkills` unchanged; passes.

## Validation

The RED is the lived observation (real PRs carried the fallback headings over a
present template). GREEN check: a repo with a `pull_request_template.md` produces a
handoff whose body uses that template's headings instead of `Summary` / `Ticket`
/ `Caveats`, and the detection outcome is recorded.
- `scripts/validate-native-plugin.ps1` passes with the unchanged skills set.
