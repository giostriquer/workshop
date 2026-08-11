# file-pr

## Origin

`file-pr` is the second life of [`handoff-pr`](deprecated/handoff-pr.md). The
original skill was born of an authorization split — the implementing session
couldn't open PRs, so it packaged a standalone artifact (template-true body, ticket
link, validation provenance) for a separately-authorized session to paste and open.
That split stopped being real: the operator's sessions became fully authorized, and
the artifact turned into ceremony — every invocation was followed by the same manual
tail: open it, watch the checks, fix what breaks, resolve the conflict the moving
base just created. Once `fix-ci` landed the autonomous CI loop, the tail was
automatable end-to-end, and the skill evolved: same body-building machinery, but it
**files the PR itself and sees it through**.

## Problem

1. **The artifact was a relay race with one runner.** When the same operator
   authorizes both halves, "package it for an authorized session" is an extra hop
   that produces a file instead of a PR.
2. **Filing is not the finish line.** A freshly-opened PR immediately meets two
   adversaries — CI and a moving base — and both used to come back as new prompts
   ("CI is failing", "it has conflicts"). The valuable end state is *green and
   mergeable*, not *open*.
3. **The hard-won body discipline was worth keeping.** Template-following (fill,
   never replace), diff-grounded summaries, real ticket links only, gate discovery
   (the repo's own CI workflows and hooks, static checks separately, `--no-verify`
   caveat) — all of that survives unchanged; only the delivery changed.

## Solution shape

**Prepare → file → see it through**, with the risky parts bounded:

- **Prepare** inherits `handoff-pr`'s machinery: diff-grounded summary, base sync
  *before* filing (merge-based, never a rebase of published commits), the repo's own
  gates run locally first — filing on a known-red baseline wastes the loop's capped
  attempts — ticket detection (one candidate → link it; several → ask; none →
  proceed and note it), template search with a recorded outcome, verbatim fill, and
  enforced title/branch conventions.
- **File**: push per repo conventions, `gh pr create`, report the URL immediately.
- **See it through**: CI runs through the **`fix-ci` skill's loop** (failing-log
  diagnosis, flake triage, two-attempt cap, never weaken a check); mergeability via
  `gh pr view --json mergeable,mergeStateStatus`; a base that moves gets merged in
  at most twice. **Semantic collisions** — both sides changed the same logic with
  different intent — always stop the loop with a report; only mechanical conflicts
  are resolved autonomously.
- **Never merges.** Green-and-mergeable is the contract's end state; clicking merge
  stays a human act.

## Real invocation snippet

> **User:** file the PR for this branch
>
> **Session (file-pr):** syncs with `main` (one mechanical conflict in a lockfile,
> resolved), runs the discovered gates (format + type-check + tests, all green),
> finds `.github/pull_request_template.md`, fills it verbatim with the ticket link
> from the branch name, pushes, opens the PR, reports the URL — then a required
> check goes red; `fix-ci` pulls the failing log, fixes the one broken import,
> pushes; re-watch reports green and mergeable. Final report: URL, verdict,
> validation provenance, one fix commit, one conflict resolved.

## Pitfalls observed

- **Filing on a red baseline.** Skipping the local gate run spends the tend loop's
  two CI attempts on failures that were knowable before the PR existed.
- **Replacing the repo's template.** Inherited from `handoff-pr`, still the top
  body failure: emitting the built-in skeleton when a template exists. The
  headings-match check before finalizing is the guard.
- **Guessing through a semantic conflict.** Auto-resolving a collision of intent
  produces code nobody wrote and nobody reviewed. Mechanical-only is the line.
- **Chasing a moving base.** On a busy repo, re-syncing forever never converges —
  two re-syncs, then report.
- **Finishing the job too well.** The loop ends at green-and-mergeable; merging,
  enabling auto-merge, or closing is out of bounds.

## Adaptation notes

- **GitHub + `gh` assumed**, like `fix-ci` and `ci-watcher`; other hosts swap the
  CLI calls, the prepare/file/tend shape is host-agnostic.
- **Authorization-split teams**: if your implementing sessions genuinely cannot open
  PRs, this skill is not for you — recover the artifact-producing `handoff-pr` from
  the deprecated origin doc and git history.
- **Rebase-only repos**: the merge-based conflict policy is the no-force-push
  default; a repo whose convention is rebase-and-force-push-with-lease can adapt
  step 2, accepting the rewritten-history trade-off deliberately.
- **Ticket rigor is tunable**: the origin project required ticket links on work
  PRs; personal repos proceed without and just note the absence.
