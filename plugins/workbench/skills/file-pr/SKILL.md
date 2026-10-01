---
name: file-pr
description: Always use before opening a PR or pushing to a branch with an open PR, including before delegating either action.
---

# File PR

## MUST: the comment trim and the adversarial review run before the PR is filed

Before filing, the branch diff has had its comment trim and then its
adversarial review, each dispatched to a context that did not write the code:

1. The `trim-comments` skill, run by the `comment-trimmer` agent as that skill
   describes. It goes first, so the review sees the trimmed diff.
2. The `code-quality-review` skill, dispatched as that skill describes.
3. When the diff changes production logic or tests: the `test-quality-review` skill
   given the PR's base branch in a separate, test-scoped prompt, run by the
   `test-quality-reviewer` agent, dispatched by name with no model (on Codex, paste
   the agent file and use its Dispatch line, per `using-workbench`'s *Workbench
   agents on Codex*). It can run in parallel with the second.

If any has not run, run it now and act on its result first, carrying the
trim's encoding offers to the user as `trim-comments` describes.
Record each required verdict against the same trimmed scope and revision;
each review skill owns its own findings, follow-ups, and pass record.

**Violating the letter of this gate is violating the spirit of it.** The
review exists to be run by someone who did not write the code; a session that
reasons its way past it has produced the exact outcome the gate prevents.

Honor an explicit user waiver or superseding repository process. Otherwise the
following cases do not require a new review:

- **The branch changes no code.** Documentation, comments, and config-only
  edits with no behavior change. Measured on the diff, not on how routine the
  work felt.
- **The agreed scope already has completed review.** Each required stage returned
  and its reviewer confirmed every blocking disposition. Preserve the reviewed
  scope, revision, and closure evidence. Pending findings return to their owning
  review skill, which owns follow-up and closure. Filing or updating the PR does
  not itself repeat a completed stage. A later comment trim preserves review
  coverage as its skill states.

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
| "The review ran earlier in this work-stream." | Check that its scope and reviewer-confirmed closure cover the work being filed; preserve completed stages. |
| "The user asked for a PR now, so they've accepted the trade." | Asking for a PR is not waiving the gate. If time is the constraint, surface it and let them waive it explicitly. |
| "CI is green and the tests pass." | Passing tests say the code works. This review asks whether it should be built this way. |
| "The reviews passed; the trim is only cosmetic." | The trim is a gate stage with the same outs as the review. Run it; `trim-comments` says why the review still covers the revision. |
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

The work on the current branch is ready to open a PR or update an existing one,
including review corrections with green CI. Use this skill before either push.
Missing authorization and missing access are different gaps.
Finish local reviewable preparation, then report the exact delivery step needing
permission or access; do not ask again for authority already given.

**Delegated delivery.** Every dispatch that will open or push to a PR, to a
subagent, fork, workflow agent or epic lane, names `file-pr` as the skill the agent
loads before delivery, plus the agreed PR plan entry when a plan exists.

## PR text contract

**Describe the change this PR actually delivers.**

Read the final diff and identify its main contribution and the feature or
subsystem it affects. Use the repository's product terminology. Determine the
surface from the affected workflow and its callers; the containing application
or directory does not determine it.

**The title names that surface and the specific contribution.** Include the
operation, mechanism, or failure condition that distinguishes this change from
other work on the same problem. Select the main contribution; supporting edits
belong in the description. Follow the repository's title syntax; if its enforced
scope is broader, name the feature in the subject.

A ticket's desired outcome is context. A partial repair, diagnostic, workaround,
or recovery control must be named for what it contributes. Claim resolution only
as broadly as the implementation and verification support.

**The description explains the connection:** what observed problem prompted the
work, what changed, why that change addresses the problem, and what remains
unresolved or unverified. Write this as a coherent explanation within the
repository's template.

Before publishing, read the title alone: **can a reviewer tell what this PR
changes and where, and distinguish it from another PR addressing the same
symptom?** Keep both fields current with the final change, including during
synchronization and tending.

For example, these changes each address failed imports but deliver different
contributions:

- `fix(imports): retain uploaded files until the worker finishes`
- `feat(imports): add manual retry for failed uploads`
- `chore(imports): log rejected upload responses`

## Preserve the repository's PR template

If the repo ships a PR template, the body **is** that template filled in: its
exact headings, order, checkboxes, and hidden `<!-- markers -->`, plus the
conditional `Architecture` and `Screenshots` sections below and additions
required by governing instructions, such as a host attribution footer. The
built-in skeleton below is a **last resort for repos that have no template**;
never emit it, or its `Summary` / `Ticket` / `Caveats` headings, when a template
exists.

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

## Screenshots in the PR body

Include screenshots when the diff changes what a user sees rendered: a new or
altered component, page, layout, style, template, or user-facing flow. Measured
on the diff, not on the work's label: a frontend-directory diff that only
touches tests, types, data fetching or build config changes no pixels and gets
no screenshots. API-only, backend, CLI-text and non-visual changes never do.

Capture the screenshots from the **real running change**, on this branch's
head, using the repo's documented run path (a project run skill, the
`web-demo-video` skill's frames, or an available browser tool). One screenshot
per distinct visual state the reviewer needs; when the diff alters existing UI,
pair a before capture from the base with the after capture. Write the files to
the session's scratch location, never into the repository. Reuse no stale,
mocked, or unrelated image. If the app cannot be run in this session, add no
section and no placeholder, and report the gap in the handback.

Use the exact heading `## Screenshots`, one line naming what each image shows,
and a Markdown image reference per file. Reuse that section, in place, if the
template already contains it (`Screenshots`, `Visuals`, `UI changes` or the
like). Otherwise it takes the position immediately after `## Architecture` when
that section is present; when it is not, apply the Architecture placement rule
verbatim: after the template's change-description sections and before the first
verification, testing, QA, checklist, release-note or footer section, first
after any leading comment block if there is no change-description section, and
after `Summary` in the fallback body.

Upload with the native `gh` attachment flag, one `--attach` per file, and keep
the section's position by referencing each file in the body **before** the
command runs, with the same path string given to `--attach`: `gh` rewrites a
body reference such as `![alt](./after.png)` to the uploaded asset in place, and
appends the attachment after the body only when no reference matches. Alt text goes after `#` in the flag or in the reference; make
it describe the state, not the filename.

```bash
gh pr create --base <base> --head <branch> --title "<title>" --body-file body.md \
  --attach './before.png#Settings page before the change' \
  --attach './after.png#Settings page with the new export button'
# updating an open PR: gh pr edit <n> --body-file body.md --attach ...
```

A partial upload leaves the PR created with the files that succeeded and a
non-zero exit; re-attach the missing files with `gh pr edit --attach` rather
than refiling.

## Steps

### Prepare

At entry and before each push, refresh the associated PR's state, head branch,
and actual target repository and branch, including merged PRs. If it merged, end
that PR's tending loop and report its merge revision. Preserve local work; carry
any authorized remaining changes onto a new branch from the current base for a
new PR. If none remain, delivery is
finished. Changes awaiting delivery authority retain an owner and pending action.
Reusing the merged head branch requires an explicit instruction.

1. **Detect branch and base.** `git branch --show-current`; an existing PR's
   current target is the base. Before filing, use the intended target from the
   user or repository; default to `main` only when neither specifies one. Resolve
   the remote for that target repository, which can differ from the feature
   branch's remote. Summarize what changed from `git diff
   <base>...HEAD` and the commit list rather than session memory; the why follows
   the PR text contract above.
   **Stop and propose a split, instead of filing,** when the diff goes beyond the
   agreed PR plan (a PR the plan does not name, or changes outside this PR's
   entry), or spans unrelated concerns (groups of changes with different
   motivations, none needed by another) that the plan does not assign to this PR.
   List each concern with its files and the PR it becomes, and file once the
   split is decided. A diff whose changes all serve one concern files normally,
   whatever its size.
2. **Synchronize the target before validation and every push.** Fetch the current
   target from its remote and **merge it into the working branch** whenever it has
   commits the branch lacks, even when there are no conflicts. This applies to
   the initial filing and every later push, including CI repairs and review fixes.
   Fetching alone or pulling only the feature branch does not satisfy this step.
   Preserve uncommitted work before syncing. Resolve mechanical conflicts
   (imports, adjacent edits, formatting) in-session and continue the merge. For a
   **semantic collision**, where both sides changed the same logic with different
   intent, resolve it when an existing governing contract or decision determines
   the result. Stop and report when resolution needs a new scope, product, policy
   or authority decision. A failed fetch or unresolved merge blocks the push;
   a resolvable conflict is work to complete. Run affected validation and any
   review whose prior coverage the integration changes invalidate before delivery.
   Never rebase published commits and never force-push.
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
6. **Build the body using the PR text contract.** If a template was found,
   fill it **verbatim** with the same headings, order,
   every checkbox, comment markers preserved; map content into the fields it already
   has, the why into its motivation or description field; tick `[x]` only what was
   actually verified; leave unfillable fields blank
   rather than fabricating. Before finalizing, check your headings against the
   template's: every original heading remains in order and is not renamed. The
   conditional `## Architecture` and `## Screenshots` sections are the only
   extra sections this skill requires; apply the rules above to both template
   and fallback bodies. Preserve
   other additions required by governing instructions. Required host attribution
   may follow the body without a new section. If there is no template, use the
   minimal fallback:

   > ## Summary
   > `<evidenced problem or need, final change and supported effect, with any material limit>`
   >
   > ## Ticket
   > `<ticket link(s), or omit the section if none>`
   >
   > ## Caveats / follow-ups
   > `<anything the reviewer should know; "none" if none>`
7. **Draft the title using the PR text contract.** If the repo enforces PR-title
   or branch-name patterns (a title linter, commit-lint, a branch rule), discover the pattern from
   the linter / CI config and conform: don't guess a prefix that gets the PR
   rejected.

### File

8. **Push and open or update.** Pull the latest remote feature head using a merge,
   then perform step 2's target sync; a first push skips only the nonexistent-head
   pull. Refresh the scope check, diff, title and body for the combined result,
   and run affected validation and any invalidated review. Immediately before
   pushing, refresh the PR's target (or the intended target before filing) and
   fetch it again. Verify the fetched target tip is an ancestor of HEAD
   (for example, `git merge-base --is-ancestor
   <fetched-target> HEAD`). If the target changed or has missing commits, repeat
   synchronization and affected checks. Allow at most **two additional sync
   rounds per push attempt** if concurrent updates keep invalidating the result;
   if another round is needed, report the pending push instead of pushing without
   the latest fetched target. Resolve remote-head push rejection by syncing again under the
   same cap, never by force. Push per the repo's conventions
   (use its push skill if it ships one). Update an associated open PR in
   place; otherwise use `gh pr create --base <base> --head <branch>` with the title
   and body, adding one `--attach` per screenshot when the Screenshots rule holds.
   Report the PR URL as soon as it exists: the tending continues after.

### See it through

9. **Watch to a verdict.** Checks run through the **`fix-ci` skill's loop**; it
   owns the failing-log diagnosis, flake-vs-fault triage, minimal in-session fixes,
   the per-cause two-attempt cap, and the never-weaken-a-check rule. The watcher
   returns at the first failed check or job on the pinned revision, including
   checks not listed as required, or the moment the PR merges or closes. It
   reports before collecting logs; the parent starts diagnosis then. Watching always runs in the
   `ci-watcher` agent, dispatched as `fix-ci` says, never in the
   parent's own turns; accept only results for the target SHA, with required-check coverage stated. Mergeability comes from
   `gh pr view --json mergeable,mergeStateStatus`.
10. **If conflicts appear while tending**, use steps 2 and 8 to integrate the
    target, resolve them, validate, and push. Every push still integrates the
    latest target even when GitHub reports the PR as mergeable. The per-push cap
    bounds concurrent movement, not the number of later repairs that may sync.
11. **Stop when the PR is green and mergeable, or when a cap is hit**, and report
    either way.

## Output

Use the session's required handback format and include all information below
in its existing fields. If no format is required, use a verdict-first report.

- PR URL and end state: **green and mergeable** / merged / still red / conflicted / blocked.
- Validation provenance: the discovered gate commands and each result, by kind
  (format / lint / type-check / tests); this lives in the report, and lands in the
  PR body only where the template has a testing/QA field for it.
- Ticket link, template used (path, or "none: fallback"), fixes applied (files +
  commits), attempts and re-syncs used.
- Screenshots: attached (how they were captured), not applicable (no rendered
  change in the diff), or skipped because the app could not be run.
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
- Hard caps: `fix-ci`'s two fix attempts per cause, and two additional sync rounds
  per push attempt when concurrent updates keep invalidating validation. At a
  cap, report rather than bypassing synchronization or thrashing.
- Semantic merge collisions follow step 2's boundary; unresolved decisions end
  the loop with a plain report.
