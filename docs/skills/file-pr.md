# file-pr

## What it does

`file-pr` turns a finished branch into a pull request, then tends it until it
is **green and mergeable**, or reports precisely why it stopped.

The title names the affected feature or shared subsystem and this PR's main
contribution. Its operation, mechanism, or failure condition distinguishes it
from other work on the same problem. The description connects the observed
problem to the implementation, why it helps, and what remains unresolved or
unverified. Both follow the final diff and its supported scope.
If the repo ships a PR template, the body fills it in with headings, order,
checkboxes and hidden `<!-- markers -->` intact. The skill adds only two
conditional sections: `## Architecture` and `## Screenshots`.

It never merges, enables auto-merge, closes or re-targets the PR, force-pushes,
or rewrites published history. Without publishing authority or access, it
finishes local preparation and names the delivery step still needed.

## When to reach for it

Before opening a PR or pushing to a branch with an open PR, including review
corrections when CI is green. It
assumes the completion gates ran, except these: it will not file a code PR whose
diff lacks its comment trim (`trim-comments`, run by the `comment-trimmer`
agent) and then its adversarial review by reviewers who did not write the code
(`code-quality-review`, plus `test-quality-review` when production logic or
tests changed). A missing stage runs first; a trim run after a finished review
edits comments only, so the review still covers the revision. The only exemptions: an explicit
user waiver, a superseding repo process, a diff that changes no code, or a prior
completed review covering the agreed scope. It retains each stage's result;
pending findings return to the owning review skill. Filing or updating the PR
does not itself restart a completed stage. Both receive the same trimmed scope
and revision, and keep separate verdicts and pass records. A draft PR is still a filed PR.

When another agent will open or push to the PR (a subagent, fork, workflow agent or epic
lane), the dispatch names `file-pr`, plus the agreed PR plan entry when there
is a plan, so that agent loads it.

| The problem | The skill |
| --- | --- |
| A finished branch should become a PR and be tended to green | `file-pr` |
| A branch with an open PR needs another push | `file-pr` before pushing |
| A branch or PR already exists and its checks are red | `fix-ci` |
| The PR is open and review feedback arrived | `receiving-code-review` |
| You are not sure the work is complete | `verification-before-completion` |
| The change should be merged directly | a plain merge or push |

## The three phases

At entry and before each push, it refreshes the PR's state and actual target
repository and branch. Before filing, it uses the intended target. A PR that
already merged ends tending; authorized remaining changes go on a new branch.

**Prepare.** Summarize from `git diff <base>...HEAD` and the commits. If the
diff goes beyond the agreed PR plan, or spans unrelated concerns the plan does
not put together, stop and propose a split instead of filing. Always pull the
latest base: fetch it from the remote and merge any commits the branch lacks,
even without conflicts. Preserve uncommitted work and resolve conflicts under
the accepted requirements; a failed fetch or unresolved merge blocks delivery.
Discover the repo's PR gates (CI workflows, hooks, build scripts, contributor
docs), run format, lint and type-check, then the affected
tests; full suites run in PR CI. Find the ticket link. Search for the PR
template case-insensitively in `.github/`, the repo root and `docs/`, and
record the result; the Summary / Ticket / Caveats fallback is allowed only
after an empty search. Draft the body and title using the PR text contract,
within enforced title or branch patterns.

**File.** Before every push, including CI and review fixes, pull the latest remote
feature head and fetch and merge the current target. A first push skips only the
nonexistent-head pull. Refresh scope, diff, title and body, run affected checks,
and refresh any review coverage invalidated by integration. Immediately before
pushing, refresh and fetch the target again and verify its tip is in HEAD. If it
changed or advanced beyond HEAD, integrate and validate again. Push per the
repo's conventions, then open or update the PR, with one
`--attach` per screenshot. The PR URL is reported as soon as it exists.

**See it through.** CI runs through `fix-ci`'s loop. A separate watcher (Sonnet 5.5 on
Claude Code or gpt-6.1-sol on Codex) returns at the first failed check or job,
including checks not listed as required. The parent then collects logs and
diagnoses the failure.
Mergeability comes from `gh pr view --json mergeable,mergeStateStatus`. It
resolves conflicts that appear while tending. Every push integrates the latest
target, even without conflicts. It refreshes the title and body when
the diff changes. It stops at green and mergeable, or at a cap, and reports
either way.

## Common questions

**What makes a useful title?** It tells a reader what this particular PR changes
and where, even when other PRs address the same symptom. Retaining uploaded files
until a worker finishes, adding a manual retry, and logging rejected responses
are different contributions; calling each "fix imports" hides the difference.
Name the main contribution and put supporting edits in the description.

**Which surface belongs in the title?** Use the repository's product terminology
for the affected workflow or shared subsystem, tracing callers when needed.
The containing application or directory alone does not determine the surface.
If the repository enforces a broader scope, name the feature in the subject.

**How should the description read?** Explain the observed problem, what changed,
why that change addresses it, and what remains unresolved or unverified, within
the existing template. A ticket's desired resolution can exceed the contribution
of one PR. Partial repairs, diagnostics, workarounds, and recovery controls are
named for what they deliver. Refresh title and body when the final change moves.

**My PR has `Summary` / `Ticket` / `Caveats` headings, but my repo has a
template.** The fallback replaced the template, which the skill forbids. Every
original heading must survive in order; the only additions are the two
conditional sections and anything governing instructions require, such as an
attribution footer.

**When does the body get an Architecture section?** When a Mermaid diagram
materially clarifies calls, dependencies or data flow between modules that the
change alters or depends on; several touched files alone are not a reason. It
reuses a template's Architecture section in place, otherwise sits after the
change-description sections and before verification, checklist or footer
sections.

**When does it get Screenshots?** When the diff changes rendered UI. A frontend
diff touching only tests, types, data fetching or build config gets none. Captures
come from the real running branch, before and after when existing UI changed, and
never land in the repo. The section follows `## Architecture`, or takes its
place. If the app cannot run, there is no section and the report says why.

**Why does the body reference images before upload?** `gh` rewrites a reference
such as `![alt](./after.png)` to the uploaded asset in place, keeping the
section where it belongs. Re-attach failed uploads with `gh pr edit --attach`.

**Why does it run my formatter first?** Format and lint are the cheapest required
checks to fail, and `--no-verify` commits skipped them. Known failures are fixed
before filing so the tend loop's attempts go to new ones.
([decision](../decisions/file-pr.md))

**It stopped and proposed a split.** The diff went beyond the agreed PR plan (a
PR the plan never named, or changes outside this PR's entry), or held changes
with different motivations, none needed by another, that the plan did not put
in this PR. Decide the split, or fold the work into the plan, and it files. A
large diff serving one concern files normally.

**What goes in the why?** The problem that prompted the change and how it
surfaced: a bug report, a failing check, a reproduction, a measurement, the
ticket. A problem first seen in the session is stated as that evidence;
reviewers never see the session.

**It stopped and handed me a conflict.** It resolves mechanical conflicts and
semantic collisions whose result is settled by an existing governing contract
or decision, then runs affected validation and review. A conflict that needs a
new scope, product, policy or authority decision comes back to you. So does a
red check that leaves an intended-behavior question unresolved.

**Does every repair include the latest target?** Yes. It reads the PR's current
target, including a retargeted PR or a target in another remote repository,
before every push. Pulling the feature branch alone is insufficient. A failed
target fetch leaves the push pending.

**How long will it keep trying?** Two fix attempts per CI cause. Each push allows
two additional synchronization rounds if concurrent target or head updates keep
invalidating the verified result. If another round is needed, it reports the
pending push; the cap never permits a stale push. Later repair pushes each
start with a fresh synchronization budget.

**It found no ticket.** It proceeds and says so, asking only when there are
several candidates or the template requires one.

**Does it work outside GitHub?** No. It assumes `gh`.

## It's working if

- Every original template heading survives in order, and the report names the
  template path, or "none: fallback" after a real search.
- **Negative signal:** screenshots on an API-only PR, or a UI PR whose report
  says nothing about them.
- The title identifies the affected surface and this PR's contribution,
  distinguishing it from other changes to the same symptom. The description
  connects problem, change, and supported effect, including remaining limits.
  Both stay current with the diff.
- **Negative signal:** a PR mixing unrelated concerns, or more PRs than the
  agreed plan, filed without a split proposal; a delegated agent opening a PR
  without loading `file-pr`.
- The PR URL arrives before the tending report.
- The report, in the session's required handback format or verdict-first, gives
  the end state (green and mergeable, merged, still red, conflicted, or blocked),
  gate results, fixes, attempts and re-syncs.
- **Negative signal:** a force-push, a rebased published commit, a skipped check,
  or the skill merging the PR.

## Where it fits

`file-pr` is one of three landing options, with a direct merge and a plain push.
`verification-before-completion`, the comment trim and the adversarial review
come before it; the trim and the review are the ones it checks rather than
assumes. After it,
`receiving-code-review` governs acting on reviewer feedback.
