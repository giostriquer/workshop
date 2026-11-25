## PR text contract

**Describe the change this PR actually delivers.**

Read the final diff and identify its main contribution and the feature or
subsystem it affects. Use the repository's product terminology. Determine the
surface from the affected workflow and its callers; the containing application
or directory does not determine it.

**Describe the scope of the behavior, not the size of the patch.** When a flag,
default, route, or configuration selects an existing implementation, read that
implementation and its entry points. Explain the experience this PR activates,
including code introduced in earlier PRs. Distinguish newly enabled behavior
from fixes made in this diff. A one-line selector can replace an entire workflow.

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
repository's template. Lead with the user or consumer impact. A list of files,
implementation fixes, screenshots, or passing tests does not replace that
explanation.

Before publishing, read the title alone: **can a reviewer tell what this PR
changes and where, and distinguish it from another PR addressing the same
symptom?** Keep both fields current with the final change, including during
synchronization and tending.

For example, these changes each address failed imports but deliver different
contributions:

- `fix(imports): retain uploaded files until the worker finishes`
- `feat(imports): add manual retry for failed uploads`
- `chore(imports): log rejected upload responses`

### Technical writing style

Always use ASD-STE100 Simplified Technical English as a guiding style for PR
titles, bodies, and delivery reports, not as a claim of formal compliance.
Use precise, consistent terms. Prefer active voice and short, complete sentences.
Express one instruction or idea per sentence and one topic per paragraph.
Use vertical lists or tables for complex material. Preserve necessary domain
terms and technical accuracy. Do not simplify away essential detail. Preserve
exact identifiers and repository-required title syntax, headings, and markers.

### Explain impact before presenting proof

For a default switch, UI replacement, migration, removed behavior, or changed
consumer contract, explicitly cover each topic below. Scale the detail to the
affected behavior. A localized fix can use a few sentences; a capability-wide
cutover needs a workflow comparison and its consequences.

| Topic | What the reviewer must learn |
| --- | --- |
| Exposure and behavior | Who receives the change, through which entry points, and when. Describe the old and new workflows. Include existing users, saved sessions, and embedded consumers when affected. |
| Compatibility and breaking changes | Which prior behavior, API, route, saved state, configuration, or automation no longer works or needs a different action. State required migration or user action. Name compatibility that remains unverified. |
| Side effects | Relevant changes to persistence, generated output, invalidation, background work, performance, or shared callers. Separate intended effects from evidenced regression risks. |
| Rollout and rollback | The actual activation control and deployment order. State whether recovery needs a runtime toggle, rebuild, redeploy, or data restoration. Explain what reversal does not restore and whether it was tested. |
| Caveats and limits | Known failures, incomplete coverage, slow paths, deferred work, and unsupported workflows that affect the merge decision. Put each material limit beside the affected claim. |

Use existing risk, rollout, or compatibility fields when the template has them.
Otherwise put this information in its change-description fields, using bold
labels, lists, or a comparison table. Keep every original heading and marker.
The fallback uses Summary for impact and Caveats / follow-ups for limits.

When a known failure or unverified critical workflow remains, include a brief
**Known limits** paragraph or list in the change description. Summarize its
effect on using or releasing the change. Keep detailed run results in the
verification field. This makes the limitation visible before the test report.

Assess each topic from source and recorded evidence. State a supported absence
briefly when a topic has no impact. State unknowns as unknowns. Retained legacy
code alone does not prove a safe rollback. Passing tests alone do not establish
that there are no breaking changes or side effects. Keep simple wording edits
proportional; they need no impact table or speculative risk inventory.

### Make the explanation and evidence easy to inspect

Use the smallest useful visual beside the claim it explains: a before/after
table for workflow changes, pseudocode for local logic, or a shallow tree for
responsibilities. A short paragraph is enough for a simple change. Derive
visuals from source. The Architecture and Screenshots rules below govern their
sections; a sketch illustrates behavior and is not execution evidence.

In an existing testing or QA field, pair recorded before/after results for the
same relevant scenario. Include the command or action, observed result, and
coverage limit. When a baseline or runtime check is unavailable, say so. Separate
test results, observed UI behavior, and unverified end-to-end claims. Retain known
failures even when a rerun passes. If there is no testing field, keep execution
details in the delivery report and material evidence limits in the description.

Before publishing, read the body as a reviewer who has not seen earlier PRs or
the session. Can they explain what changes for users, what could break, how to
recover, and what remains unverified? Fill missing impact information from source
or name the gap. More test counts and screenshots do not fill those gaps.

## Preserve the repository's PR template

If the repo ships a PR template, the body **is** that template filled in: its
exact headings, order, checkboxes, and hidden `<!-- markers -->`, plus the
conditional `Architecture` and `Screenshots` sections and the `CI run time`
section below, and additions required by governing instructions, such as a host
attribution footer. The
[built-in fallback](../SKILL.md#prepare) is a **last resort for repos that have no template**;
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

## CI run time in the PR body

Every PR whose head ran GitHub Actions jobs carries one `## CI run time`
section, in one form, so a reviewer sees whether this change made CI slower.
The bundled script writes it. Do not write the table by hand or with another
helper, and do not run a full suite locally to measure.

```bash
node "<skill dir>/scripts/ci-run-time.mjs" --pr <number> \
  --job '<part of a job name>' > ci-run-time.md
# another repository than the working directory: add --repo <owner/name>
```

When Actions checks are expected, put `Pending checks for <head>.` in the
timing section at filing and on each new push. Replace it as soon as the checks
finish. Through `gh` the script reads each job of the PR and the
same job in its last three successful runs on the PR's base branch. Give one
`--job` for each job that builds, lints or tests a path the diff changes. Those
rows stay in the table. The table also holds every job over the limit, every
new job and every job that failed or still runs; the script folds the other
jobs under the notes.

A job is over the limit when it changes by more than 10% and more than 20
seconds against the median of the base runs. It is **slower**, in bold, only
when it also took longer than every one of those base runs; otherwise the
script marks it inside the range of the base. When the user's or the
repository's rules give another limit or sample size, pass `--percent`,
`--seconds` and `--base-runs`.

**Place the section last in the body, above any footer, attribution or
bot-managed block.** Reuse, in place, a section the template already has for CI
or check timing. At each update, read the PR's current body first (`gh pr view
<number> --json headRefOid,body`), because bots and people edit it. Check that
the report belongs to that head, replace the timing content and send the body
with `gh pr edit <number> --body-file <file>`. Publish the generated comparison
as soon as it is available, including any unresolved slowdown markers. Read back
the head and body from GitHub and confirm the comparison appears once for that
head. If the head moved, refresh the section for the new head. Use the same
read, edit and readback when adding findings. Preserve the generated rows and
any template timing heading.

Under the table the script writes one line for each finding. Complete them:

- **A job in bold is slower.** Its line ends with `_cause and decision not
  written yet_`, and the line under it names the steps that grew most. Find what
  the change added. Compare the job with a base run by step (`gh run view <run>
  --json jobs`), and by test file where the job log gives those times. Then
  replace the marker with one of these:
  - **Removed.** The change did not need the cost: share setup, shorten a wait,
    test at a cheaper level, or drop a duplicate. Push through the normal
    steps, then write the section again at the new head.
  - **Not from this change.** The growth is in a step that the diff cannot
    reach, such as a dependency install, a runner or tool setup, or a cache
    restore. Name the step with its time here and in the base runs.
  - **Decided by the user.** The cost is needed, or the evidence does not show
    where it comes from. Report the numbers and what you found as a decision
    for the user, and wait. Then write the cause and their decision.
- **A job "inside the range" of the base** needs no action: a base run already
  took that long. Leave its line.
- **Add one line for the suite that the change touched** when the job log gives
  its own time: its tests and seconds on the base and here. A job total can
  hide a small suite.

While a line still holds `_cause and decision not written yet_`, the PR is not
*green and mergeable*: report the end state as blocked, and name that line.

The script exits 3 and writes nothing when no GitHub Actions job ran on the
settled head: remove the provisional section (clear only its contents in a
template timing field) and say "no GitHub Actions jobs" in the report. When it fails for
another reason, such as no `gh` access or an API error, add the section with
the one line `Not available: <reason>` and report the gap.
