---
name: file-pr
description: Use when a branch is ready to become a PR and the session should file it and see it through. Derives the body from the repo's own PR template, opens the PR with gh, then autonomously watches CI and fixes failing checks or merge conflicts until the PR is green and mergeable. Bounded fix loops, never force-pushes, never merges the PR. Formerly handoff-pr, which stopped at producing a handoff artifact.
---

# File PR

File a finished branch as a PR and see it through: a template-true body, `gh pr
create`, then an autonomous tend loop that fixes red CI (via the `fix-ci` skill) and
merge conflicts until the PR is **green and mergeable**, or reports precisely why it
stopped.

## When to use

The work on the current branch is ready for a PR and this session is authorized to
push and open one. If that authorization is missing (`gh` unauthenticated, no PR
write access), say so plainly and stop; this skill does not fall back to producing
artifacts.

## The two rules that make the body right

1. **The body must stand alone.** Reviewers arrive with no access to this session,
   so the summary and every field are derived from the **branch diff and the
   ticket**, never from "what we discussed this session."
2. **The PR body belongs to the repo, not to this skill: follow its template, never
   replace it.** If the repo ships a PR template, the body **is** that template
   filled in: its exact headings, order, checkboxes, and hidden `<!-- markers -->`,
   nothing added or dropped. The built-in skeleton below is a **last resort for
   repos that have no template**; never emit it, or its `Summary` / `Ticket` /
   `Caveats` headings, when a template exists.

## Steps

### Prepare

1. **Detect branch and base.** `git branch --show-current`; base defaults to `main`
   unless the repo says otherwise. Summarize the change from `git diff
   <base>...HEAD` and the commit list rather than session memory.
2. **Sync with the base before filing.** Fetch the latest base. If the branch is
   behind and conflicts, **merge the base into the branch** and resolve. Mechanical
   conflicts (imports, adjacent edits, formatting) resolve confidently; a
   **semantic collision**, where both sides changed the same logic with different intent,
   stops the skill. Report it as a decision; do not guess. Never rebase published
   commits and never force-push.
3. **Run the repo's own gates locally.** *Discover* what this repo gates a PR on
   rather than assuming a toolchain: read its CI workflow definitions, hook config,
   build/package script targets, and contributor docs. Run the **fast static
   checks** (format, lint, type-check) separately from the tests; they are usually
   the required CI gates and the cheapest to fail: against the freshly-synced base.
   If any commit bypassed hooks (`--no-verify`), the formatter and linter never ran
   on it, run them manually now. **Fix what fails before filing.** A PR opened on a
   known-red baseline wastes the tend loop's bounded attempts. Record the exact
   commands and results for the report.
4. **Identify the ticket.** Scan the branch name, commit messages, and any existing
   description for a ClickUp / Linear / Jira id or URL. Exactly one candidate →
   carry its full **link** (never synthesize a URL from a bare id). Multiple
   candidates → ask. None → proceed without and note the absence in the report,
   asking only if the repo's template has a required ticket field.
5. **Find the repo's PR template** (match filenames **case-insensitively**):
   `.github/pull_request_template.md` / `.github/PULL_REQUEST_TEMPLATE.md`, any file
   under `.github/PULL_REQUEST_TEMPLATE/`, and the same names in the repo root and
   under `docs/`. Multiple templates → pick the one matching the branch's intent and
   record why. **Record the search outcome** as found (path) or none-found-after-search
   before building anything; the fallback is allowed only after a recorded empty
   search.
6. **Build the body.** If a template was found, fill it **verbatim** with the same headings, order,
   every checkbox, comment markers preserved; map content into the fields it already
   has; tick `[x]` only what was actually verified; leave unfillable fields blank
   rather than fabricating. Before finalizing, check your headings against the
   template's: same set, same order, none added or renamed; if they differ, you
   replaced the template, redo the body. If there is no template, use the minimal fallback:

   > ## Summary
   > `<what changed and why, grounded in the diff>`
   >
   > ## Ticket
   > `<ticket link(s), or omit the section if none>`
   >
   > ## Caveats / follow-ups
   > `<anything the reviewer should know; "none" if none>`
7. **Conform to enforced conventions.** If the repo enforces PR-title or branch-name
   patterns (a title linter, commit-lint, a branch rule), discover the pattern from
   the linter / CI config and conform: don't guess a prefix that gets the PR
   rejected.

### File

8. **Push and open.** Push the branch per the repo's conventions (pull first; use
   its push skill if it ships one), then `gh pr create --base <base> --head
   <branch>` with the title and body. Report the PR URL as soon as it exists: the
   tending continues after.

### See it through

9. **Watch to a verdict.** Checks run through the **`fix-ci` skill's loop**; it
   owns the failing-log diagnosis, flake-vs-fault triage, minimal in-session fixes,
   the two-attempt cap, and the never-weaken-a-check rule. Mergeability comes from
   `gh pr view --json mergeable,mergeStateStatus`.
10. **If the base moves and conflicts appear**, merge the base in again, resolve,
    and push: at most **two** re-syncs; a base that keeps moving is reported, not
    chased. Semantic collisions stop the loop here too.
11. **Stop when the PR is green and mergeable, or when a cap is hit**, and report
    either way.

## Output

Verdict-first report:

- PR URL and end state: **green and mergeable** / still red / conflicted / blocked.
- Validation provenance: the discovered gate commands and each result, by kind
  (format / lint / type-check / tests); this lives in the report, and lands in the
  PR body only where the template has a testing/QA field for it.
- Ticket link, template used (path, or "none: fallback"), fixes applied (files +
  commits), attempts and re-syncs used.
- If stopped early: the diagnosis and the recommended next step.

## Boundaries

- Files and tends the PR; **never merges it**, never enables auto-merge, never
  closes or re-targets it.
- Never force-pushes, rebases published commits, or rewrites history: conflict
  resolution is merge-based.
- Never deletes, skips, or weakens a failing check to get to green; a red check that
  encodes an intended-behavior question is reported as a decision for the user.
- Keep the PR body tooling-agnostic: no named editors, bots, or AI assistants, and
  no "generated by" footers. Describe the change, not how it was produced.
- Hard caps: `fix-ci`'s two fix attempts for CI, two base re-syncs for conflicts;
  after that, report rather than thrash.
- Semantic merge collisions and product decisions are never resolved by guessing.
  They end the loop with a plain report.
