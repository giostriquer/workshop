---
name: file-pr
description: Always use before or to file/open a PR.
---

# File PR

## MUST: the adversarial review runs before the PR is filed

Before filing, the branch diff has had an adversarial code quality review: the
`code-quality-review` skill, dispatched to a reviewer context that did not
write the code. If it has not run, run it now and act on its findings first.

**Violating the letter of this gate is violating the spirit of it.** The
review exists to be run by someone who did not write the code; a session that
reasons its way past it has produced the exact outcome the gate prevents.

Honor an explicit user waiver or superseding repository process. Otherwise the
following cases do not require a new review:

- **The branch changes no code.** Documentation, comments, and config-only
  edits with no behavior change. Measured on the diff, not on how routine the
  work felt.
- **The review already ran on this diff.** It was dispatched, it came back,
  and its findings were acted on. Loading this skill is not a reason to run it
  a second time. Record its revision and dispositions; verify direct corrections.
  Material changes to behavior, design, or risk need focused independent follow-up.
  Repeat a full review only if subsequent work broadly invalidated it.

Nothing else is an exemption. Not a deadline, not a reviewer waiting, not a
branch that has been open a long time, not the user asking for the PR
directly. If the gate cannot be satisfied, say so and ask; do not file and
mention it afterward.

### What the exemptions are not

| The reasoning | What is actually true |
|---|---|
| "This is trivial: one file, small diff." | Trivial is not an exemption. Only *no code changed* is. A one-line change to a conditional is code. |
| "It's just a refactor, behavior is identical." | A refactor is the change class this review exists for. Structure is its entire subject. |
| "It's config / a version bump / generated output." | Config that changes behavior is code. If the diff changes what runs, the gate applies. |
| "I reviewed it carefully as I wrote it." | The author is the one context that cannot run this review. That is stated in `code-quality-review`, not implied. |
| "I ran the rubric over my own diff and found nothing." | A self-served pass is not this gate. It is reported as an author's pass or not at all. |
| "The review ran earlier in this work-stream." | Check its revision and later changes. Verified corrections need no full repeat; material changes need focused follow-up. |
| "The user asked for a PR now, so they've accepted the trade." | Asking for a PR is not waiving the gate. If time is the constraint, surface it and let them waive it explicitly. |
| "CI is green and the tests pass." | Passing tests say the code works. This review asks whether it should be built this way. |
| "I'll open it as a draft and get the review after." | A draft PR is a filed PR. The gate is before filing. |

### Red flags: stop and dispatch the review

- Reaching for a synonym of "trivial" to describe a diff that changes code.
- Counting your own pass over your own diff as the review.
- Counting an earlier review without checking whether later changes invalidate it.
- Treating urgency, a waiting reviewer, or a direct "open the PR" as a waiver.
- Filing as a draft to defer the gate.

**Each of these means: dispatch the review, then file.**

File a finished branch as a PR and see it through: a template-true body, `gh pr
create`, then an autonomous tend loop that fixes red CI (via the `fix-ci` skill) and
merge conflicts until the PR is **green and mergeable**, or reports precisely why it
stopped.

## When to use

The work on the current branch is ready for a PR and this session is authorized to
push and open one. Missing authorization and missing access are different gaps.
Finish local reviewable preparation, then report the exact delivery step needing
permission or access; do not ask again for authority already given.

## The two rules that make the body right

1. **The body must stand alone.** Reviewers arrive with no access to this session,
   so the summary and every field are derived from the **branch diff and the
   ticket**, never from "what we discussed this session."
2. **The PR body belongs to the repo, not to this skill: follow its template, never
   replace it.** If the repo ships a PR template, the body **is** that template
   filled in: its exact headings, order, checkboxes, and hidden `<!-- markers -->`,
   plus the conditional `Architecture` section below and additions required by
   governing instructions, such as a host attribution footer. The built-in skeleton
   below is a **last resort for repos that have no template**; never emit it, or its
   `Summary` / `Ticket` / `Caveats` headings, when a template exists.

## Architecture in the PR body

Include a Mermaid diagram when it materially clarifies relevant calls,
dependencies, responsibilities or data/control flow between modules or services.
This applies when those relationships change, or when existing interactions are
needed to understand the change's behavior or risk. Identify the relationship the
reviewer needs to see; touching several files alone does not establish the need.
Localized fixes, wording edits and mechanical changes with no such interaction
need no added section or diagram.

Use the exact heading `## Architecture`, a short explanation of the relevant
interaction or change, and a fenced `mermaid` graph. Reuse that section, in
place, if the template already contains it. Otherwise insert it where a reader
meets it while learning what changed: **immediately after the template's
change-description sections** (headings such as `Summary`, `What`, `Why`,
`Description`, `Overview`, `Motivation`, `Context`) and **before the first
verification, testing, QA, checklist, release-note or footer section**. If the
template has no change-description section, insert it first, after any leading
comment block. In the fallback body it follows `Summary`. Inserting a section
between existing ones keeps every original heading in order; appending it after
the last section is the one placement to avoid, since a diagram that arrives
after the verification evidence reads as an afterthought. When the trigger does
not hold, add neither a section nor a placeholder; preserve any
template-provided field according to the repo's convention.

Show the smallest useful interaction, with real module names and labelled edges
derived from the final code and diff. Use a flowchart for dependencies or flow;
use a sequence diagram when call order matters. Include surrounding modules only
to explain the changed path. Distinguish before/after relationships when needed to
make the change clear; avoid an unrelated system map or invented calls. Check each
relationship against source and check Mermaid syntax, using an available parser
or renderer when present. Report unverified rendering in the handback if no such
tool is available; do not treat the diagram as validation evidence.

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
3. **Run focused local checks and required local gates.** *Discover* what this repo gates a PR on
   rather than assuming a toolchain: read its CI workflow definitions, hook config,
   build/package script targets, and contributor docs. Run the **fast static
   checks** (format, lint, type-check) separately from the tests; they are usually
   the cheapest to fail: against the freshly-synced base. Run affected tests; full
   suites normally run in PR CI. A wider local run needs an explicit local gate or
   a specific unresolved integration risk, not merely the existence of a CI job.
   If any commit bypassed hooks (`--no-verify`), the formatter and linter never ran
   on it, establish their result manually unless unchanged relevant evidence already
   covers them. **Fix in-scope failures before filing** and disclose baseline issues. A PR opened on a
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
   template's: every original heading remains in order and is not renamed. The
   conditional `## Architecture` section is the only extra section this skill
   requires; apply the rule above to both template and fallback bodies. Preserve
   other additions required by governing instructions. Required host attribution
   may follow the body without a new section. If there is no template, use the
   minimal fallback:

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
   the per-cause two-attempt cap, and the never-weaken-a-check rule. The watcher
   returns at the first failed required check; the fix starts then, not after
   the remaining checks finish. Watching always runs in a
   separate Opus agent on Claude or gpt-5.6-sol agent on Codex, never Astra/Fable or
   the parent; accept only results for the target SHA and required checks. Mergeability comes from
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
- Keep substantive PR text focused on the change. Include attribution required
  by governing host/user/repository instructions; do not invent extra footers.
- Hard caps: `fix-ci`'s two fix attempts for CI, two base re-syncs for conflicts;
  after that, report rather than thrash.
- Semantic merge collisions and product decisions are never resolved by guessing.
  They end the loop with a plain report.
