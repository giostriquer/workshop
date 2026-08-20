# file-pr

## What it does

`file-pr` takes a finished branch and turns it into a pull request that is
actually landable. One invocation does three things: it builds a PR body from
the repo's own template, opens the PR with `gh pr create`, and then stays with
the PR (watching CI and fixing what breaks) until the PR is, in the skill's
words, **"green and mergeable"** or it reports precisely why it stopped.

The body is the part that surprises people. It is not written from what you
discussed in the session. Rule one: "The body must stand alone. Reviewers
arrive with no access to this session, so the summary and every field are
derived from the **branch diff and the ticket**." Rule two: "The PR body
belongs to the repo, not to this skill: follow its template, never replace
it." If your repo ships a pull request template, the body *is* that template
filled in, with its exact headings, order, checkboxes and hidden
`<!-- markers -->`.

It stops short of two things people expect. It **never merges the PR**; it
never enables auto-merge, closes it, or re-targets it; green-and-mergeable is
the end state and merging stays human. And it never force-pushes, rebases
published commits, or rewrites history; conflict resolution is merge-based. It
also has no fallback mode. If the session isn't authorized to push and open a
PR (unauthenticated `gh`, no PR write access), it "say[s] so plainly and
stop[s]. This skill does not fall back to producing artifacts."

## When to reach for it

Reach for it when the work on the current branch is done and someone should
file the PR and see it through. It assumes the completion gates already ran,
with one exception it backstops itself: it will not file a code PR whose diff
has not had the adversarial `code-quality-review`, dispatched to a reviewer
that did not write the code. If that review has not run, `file-pr` runs it and
acts on the findings first. The two exemptions are a trivial, non-code, or
documentation-only branch, and a review that already ran for this work-stream.

Everything else it still assumes. `using-workbench` puts the rest plainly:
"`file-pr`: landing, not verification." It is not the place to discover your
change is half-finished.

| The problem | The skill |
| --- | --- |
| A finished branch should become a PR, and someone should tend it to green | `file-pr` |
| A branch or PR already exists and its checks are red | `fix-ci` |
| You want to know whether CI passed and nothing else touched | the `ci-watcher` agent |
| The PR is open and review feedback arrived | `receiving-code-review` |
| You are not confident the work is actually complete | `verification-before-completion` |
| The change should be merged directly rather than reviewed | a plain merge or push: `file-pr` never merges |

## The three phases

**Prepare.** Detect the branch and base (`git branch --show-current`; base
defaults to `main` unless the repo says otherwise) and summarize the change
from `git diff <base>...HEAD` and the commit list. Fetch the latest base and,
if the branch is behind and conflicts, **merge the base into the branch** and
resolve. Then discover what this repo actually gates a PR on: CI workflow
definitions, hook config, build/package script targets, contributor docs, and
run the fast static checks (format, lint, type-check) separately from the
tests, against the freshly-synced base. Identify the ticket from the branch
name, commits, and any existing description, carrying its full link and never
synthesizing a URL from a bare id. Search for the repo's PR template
case-insensitively in `.github/`, `.github/PULL_REQUEST_TEMPLATE/`, the repo
root, and `docs/`, and **record the search outcome**: found (path) or
none-found-after-search: before building anything. Fill the template
verbatim, or use the minimal Summary / Ticket / Caveats fallback only after a
recorded empty search. Finally, conform to any enforced PR-title or
branch-name pattern, discovered from the linter or CI config rather than
guessed.

**File.** Push the branch per the repo's conventions (pull first; use the
repo's own push skill if it ships one), then `gh pr create --base <base>
--head <branch>`. The PR URL is reported "as soon as it exists: the tending
continues after."

**See it through.** Checks run through the `fix-ci` skill's loop, which owns
the failing-log diagnosis, flake-vs-fault triage, minimal in-session fixes,
the two-attempt cap, and the never-weaken-a-check rule. Mergeability comes
from `gh pr view --json mergeable,mergeStateStatus`. If the base moves and
conflicts appear, it merges the base in again and pushes: at most **two**
re-syncs. It stops when the PR is green and mergeable, or when a cap is hit,
and reports either way.

## Common questions

**My PR came out with `Summary` / `Ticket` / `Caveats` headings, but my repo
has a template. What went wrong?** That is the exact failure this skill was
hardened against, and it is a bug, not a style choice. A field observation
recorded real PRs going out carrying the built-in fallback headings even
though the repo shipped a template: the model replaced the template with the
skill's outline, because the skeleton was the concrete structure in front of
it. Three guards exist now: the search outcome must be recorded before a body
is built, the fallback is labelled a last resort, and the emitted headings are
checked against the template's before finalizing: "same set, same order, none
added or renamed; if they differ, you replaced the template: redo."
([decision](../decisions/handoff-pr-follow-not-replace-template.md))

**Why does it run my formatter before opening the PR?** Because a formatter
check is usually a required CI gate, is the cheapest thing to fail, and is
invisible locally when hooks were bypassed. A recorded field run had a PR fail
CI on a single formatter check (one unformatted line) while type-check,
lint, integration, e2e, and API-compat all passed; commits had been made with
`--no-verify`, so the pre-commit formatter never fired. The skill now names
that hazard: if any commit bypassed hooks, "the formatter and linter never ran
on it: run them manually now." And it fixes what fails before filing, because
"a PR opened on a known-red baseline wastes the tend loop's bounded attempts."
([decision](../decisions/handoff-pr-prepush-validation-gate.md))

**It stopped mid-way and handed me a conflict.** That is by design when the
conflict is semantic: "both sides changed the same logic with different
intent." Mechanical conflicts (imports, adjacent edits, formatting) resolve
confidently; a semantic collision "stops the skill: report it as a decision,
don't guess." The same rule applies to a red check that encodes an
intended-behavior question.

**How long will it keep trying?** Two hard caps: `fix-ci`'s two fix attempts
for CI, and two base re-syncs for conflicts. "A base that keeps moving is
reported, not chased." After a cap, it reports rather than thrashes.

**It found no ticket.** It proceeds without one and notes the absence in the
report. It asks only when there are multiple candidates, or when the repo's
template has a required ticket field.

**My template has checkboxes.** It ticks `[x]` "only what was actually
verified," and leaves unfillable fields blank rather than fabricating them.

**Where does the validation evidence go?** Into the session report: the
discovered gate commands and each result, by kind (format / lint / type-check
/ tests). It lands in the PR body only where the template has a testing or QA
field for it. When it does, the evidence is the commands run and their
results, not bare test-file names.

**Will the PR body mention that a model wrote it?** No. The body stays
tooling-agnostic: "no named editors, bots, or AI assistants, and no 'generated
by' footers. Describe the change, not how it was produced."

**I remember this as `handoff-pr`.** It was. `handoff-pr` stopped at producing
a handoff artifact (a template-true body plus notes) for a separately
authorized session to open, because the implementing session couldn't open
PRs. Once that authorization split stopped being real, every invocation was
followed by the same manual tail: open it, watch CI, fix what breaks, resolve
the conflict the moving base created. `file-pr` keeps all the body machinery
and automates the tail. The old artifact's `tmp/` and `inline` delivery modes
are gone, and there is no flag to bring them back.
([decision](../decisions/file-pr.md))

**Does it work outside GitHub?** Not out of the box. It assumes `gh`, like
`fix-ci` and the `ci-watcher` agent.

## It's working if

- The PR body's headings match your template's exactly: same set, same
  order, and the report names the template path it used, or says "none
  (fallback)" after an actual search.
- You get the PR URL as soon as the PR exists, and the tending report arrives
  after it.
- The report leads with the verdict and end state: green and mergeable, still
  red, conflicted, or blocked; then the gate commands and results, ticket
  link, fixes applied, and attempts used.
- Fixes land as ordinary commits. **Negative signal:** a force-push, a rebased
  published commit, or a deleted or skipped check on the branch means
  something outside this skill's rules happened.
- **Negative signal:** the PR is merged, or auto-merge is enabled, at the end
  of the run. That is never this skill.

## Where it fits

`file-pr` is one of the three landing options in the workbench flow, after the
user gate where the session outlines what was done and asks "PR or merge?"
(the other two being a direct merge and a plain push). Everything before it:
test-quality review, `verification-before-completion`, the one adversarial
`code-quality-review`, is assumed done, and the adversarial review is the one
`file-pr` checks rather than assumes. Everything after it is the feedback
loop: `receiving-code-review` governs acting on what reviewers say.
