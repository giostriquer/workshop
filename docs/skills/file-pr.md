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
filled in, with its original headings, order, checkboxes and hidden
`<!-- markers -->`. A conditional `## Architecture` section adds a Mermaid diagram
when relevant module interactions need to be shown, even if the template does
not request one.

It never merges, enables auto-merge, closes or re-targets the PR, force-pushes, or rewrites published history.

If access or publishing authority is missing, complete the local reviewable preparation and identify the exact remaining delivery step. Existing authorization does not need to be requested again.

## When to reach for it

Reach for it when the work on the current branch is done and someone should
file the PR and see it through. It assumes the completion gates already ran,
with one exception it backstops itself: it will not file a code PR whose diff
has not had the adversarial `code-quality-review`, dispatched to a reviewer
that did not write the code. If that review has not run, `file-pr` runs it and
acts on the findings first. Nonbehavioral documentation/formatting changes, explicit user waivers, and superseding repository processes can change that gate. A prior review must cover the current revision and risk: verify direct corrections; obtain focused independent follow-up for material new behavior or risk.

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
recorded empty search. Apply the conditional Architecture rule to either body.
Finally, conform to any enforced PR-title or
branch-name pattern, discovered from the linter or CI config rather than
guessed.

**File.** Push the branch per the repo's conventions (pull first; use the
repo's own push skill if it ships one), then `gh pr create --base <base>
--head <branch>`. The PR URL is reported "as soon as it exists: the tending
continues after."

**See it through.** Checks run through the `fix-ci` skill's loop, which owns
the failing-log diagnosis, flake-vs-fault triage, minimal in-session fixes,
the per-cause two-attempt cap, and the never-weaken-a-check rule. The watcher
returns at the first failed required check, so the fix starts before the rest
of CI finishes. Mergeability comes
from `gh pr view --json mergeable,mergeStateStatus`. If the base moves and
conflicts appear, it merges the base in again and pushes: at most **two**
re-syncs. It stops when the PR is green and mergeable, or when a cap is hit,
and reports either way.

## Common questions

**My PR came out with `Summary` / `Ticket` / `Caveats` headings, but my repo
has a template. What went wrong?** The fallback replaced your template. Search
for the template first, preserve each original heading in order, and fill its
fields, checkboxes and hidden markers. The only additional section this skill
requires is the conditional `## Architecture` section below. Other additions
must come from governing instructions; they do not authorize replacing the
template with the fallback.

**When does the body get an Architecture section?**

When a Mermaid diagram materially clarifies relevant calls, dependencies,
responsibilities or data/control flow between modules or services. This includes
relationships changed by the diff and existing interactions needed to understand
the change's behavior or risk. Several changed files alone are not a reason for
a graph. Localized fixes, wording edits and mechanical changes without such an
interaction get no added section or placeholder.

Use the exact heading `## Architecture`, a short explanation and a fenced
`mermaid` graph. Reuse the template's exact Architecture section, in place, if
present. Otherwise the section sits with the change description: immediately
after the `Summary` / `What` / `Why` style sections and before verification,
testing, checklist, release-note or footer sections. It is never appended after
the last section. Preserve an existing template field according to the repo's
convention when no diagram is needed. The same relevance and placement rules
apply to the no-template fallback, where it follows `Summary`.

**The Architecture section landed after the Verification section. Why?** An
earlier revision of the skill said to append it after the filled template. That
put the diagram after the validation evidence, where it read as an afterthought.
Since workbench 0.37.3 the section is inserted right after the change-description
sections instead.

Show the smallest useful interaction with real module names and labelled edges
grounded in the final code and diff. Use a flowchart for dependency or data flow,
or a sequence diagram when call order matters. Check relationships against source
and Mermaid syntax with an available parser or renderer. If rendering could not
be verified, say so in the handback. The graph explains the change; it is not proof
that the behavior works.

**Why does it run my formatter before opening the PR?** Because a formatter
check is usually a required CI gate, is the cheapest thing to fail, and is
invisible locally when hooks were bypassed. A recorded field run had a PR fail
CI on a single formatter check (one unformatted line) while type-check,
lint, integration, e2e, and API-compat all passed; commits had been made with
`--no-verify`, so the pre-commit formatter never fired. The skill now names
that hazard: bypassed hooks do not establish that their checks passed. Run the affected required checks or reuse applicable evidence from the unchanged state. Fix in-scope failures before filing and disclose baseline issues; do not spend the bounded tend loop rediscovering known failures.
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

**Will the PR body mention its tooling?** Keep the substance focused on the change. Include attribution required by governing host/user/repository instructions; do not invent an extra footer. Preserve the repository template.

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

- The PR body preserves every original template heading in order, adding
  `## Architecture` only when the interaction warrants a graph. The report names
  the template path it used, or says "none (fallback)" after an actual search.
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
landing decision where the session outlines what was done and carries existing PR/merge authority forward, asking only if the choice remains open (the other two options being a direct merge and a plain push). Everything before it:
test-quality review, `verification-before-completion`, the one adversarial
`code-quality-review`, is assumed done, and the adversarial review is the one
`file-pr` checks rather than assumes. Everything after it is the feedback
loop: `receiving-code-review` governs acting on what reviewers say.

Review still precedes filing, including draft PRs. Respect explicit user waivers and superseding repository processes. Verify direct corrections; material changes receive focused independent follow-up. Discover local gates from workflows, hooks, package/build targets, and contributor docs, including bypassed hooks; run focused local tests rather than copying every CI suite. Watching always uses a separate Opus/Sol agent and evidence for the target SHA; check mergeability separately.
