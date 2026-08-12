# handoff-pr (deprecated — evolved into `file-pr`, 2026-08-11)

> **Deprecation note.** `handoff-pr` existed for an authorization split: the
> implementing session couldn't open the PR, so it packaged an artifact for a
> session that could. The operator's environments converged on fully-authorized
> sessions, which turned the artifact into ceremony — the next action after "here's
> the artifact" was always "open it and watch CI." With `fix-ci` landing the
> autonomous CI loop, the whole tail became automatable, and the skill evolved into
> [`file-pr`](../file-pr.md): same template-derived body, ticket detection, and gate
> discovery, but it **opens the PR itself** and tends it (CI fixes via `fix-ci`,
> merge-based conflict resolution) until green and mergeable. Teams that still have
> the authorization split can recover the artifact behavior from this doc and the
> skill's git history (`plugins/toolkit/skills/handoff-pr/`, pre-2026-08-11).

## Origin

The other half of the end-of-branch prompt: "open a PR on our behalf with the right ticket links." Often the implementing session is not the one authorized to open the PR, so the work has to be packaged and handed to a session that is. Done by hand, the ticket link got forgotten, the body drifted from the diff, the review status went unrecorded — and the body ignored the repo's own PR template, so the PR didn't match the sections and checklist the team expected.

`handoff-pr` formalizes that into a structured PR artifact a separately-authorized session opens.

## Problem

Five failure modes in the ad-hoc flow:

1. **Unauthorized opener.** The session that wrote the code cannot open the PR; the context has to travel to one that can.
2. **Missing ticket link.** Hand-written PR bodies dropped the ClickUp / Linear / Jira link, breaking traceability.
3. **Session-memory drift.** The summary described what the author remembered doing, not what the diff actually changed.
4. **Reinvented body.** Hand-written bodies ignored the repo's `pull_request_template.md`, so the PR was missing the checklist the team asked for and carried sections the team never wanted — and handoff bookkeeping (validation provenance, review status) leaked into the public description.
5. **The static gate slipped through.** A branch was handed off and pushed without the repo's *required* fast static checks (a formatter / lint gate) ever running locally — commits made with `--no-verify` had bypassed the pre-commit hook, the handoff had no pre-push gate, and CI's formatter check failed fast and blocked the whole PR. "Tests pass" hid it because the failure was formatting, not logic.

## Solution shape

An artifact generator, not a PR opener. It detects branch + base, summarizes from the real diff, auto-detects and confirms the ticket link, and — before assembling anything — looks for the repo's own PR template. When one exists, the PR body *is* that template filled in verbatim (headings, order, checkboxes, and `<!-- markers -->` preserved); otherwise it falls back to a built-in Summary / Ticket / Caveats structure. The artifact is two visibly separate blocks: a paste-ready **PR body** (the only part that goes in the PR description) and **handoff notes** that carry the opener-only fields — which template was chosen, validation provenance, review status, and the `gh pr create` command — so process fields never leak into the public PR. Delivery is exactly one mode: by default it writes the artifact to a scratch file and reports the path; invoked with `inline`, it prints the artifact in-session instead and writes no file. It explicitly never runs `gh pr create` — that is the authorized session's job.

## Real invocation snippet

> /handoff-pr

Finds the repo's PR template, builds the PR body to its shape (or the built-in fallback), confirms the ticket, writes `tmp/handoff-pr-<branch-slug>.md`, and stops short of opening the PR.

> /handoff-pr inline

Same, but prints the artifact in-session and writes no `tmp/` file — for when a scratch artifact isn't wanted.

## Pitfalls observed

- **Opening the PR anyway.** The skill is artifact-only by design; the current session lacks authorization. Running `gh pr create` defeats the handoff.
- **Reinventing the body / replacing the template.** When the repo ships a PR template, the body must be that template filled in — not a parallel set of sections the team didn't ask for. Seen in lived use: PRs went out carrying the skill's *built-in fallback* headings (`Summary` / `Ticket` / `Caveats`) even though the repo had a template — the concrete fallback skeleton in the skill body acted as an attractor over the prose "follow the template" instruction. The skill now (a) makes template detection a **recorded gate** (the fallback is allowed only after an actual search came up empty), (b) **demotes** the fallback to an explicit no-template branch so it stops reading as the default, and (c) requires a **heading-conformance check** before finalizing. Don't add, drop, or rename the template's sections.
- **Leaking process fields.** Validation provenance and review status are handoff bookkeeping; pasted into the public PR body they read as noise and can expose internal scratch paths. They live in the opener-only notes.
- **Summarizing from memory.** The artifact may be opened by a session with no shared context, so the summary must come from the diff.
- **Omitting the ticket when none is auto-detected.** Ask for it rather than shipping a PR with no traceability.
- **Double delivery.** Earlier versions printed the full artifact inline *and* wrote the scratch file — the same long artifact landed twice, cluttering the session. Delivery is now exactly one mode: the file by default (path reported), inline-only when invoked with `inline`.
- **Trusting "tests pass" over the static gate.** Formatting / lint / type-check are usually the *required*, fail-fast CI gates and the cheapest to trip. Discover them from the repo and run them locally — and remember a `--no-verify` commit skipped the pre-commit formatter, so it must be run by hand before push. Record format / lint / type-check / tests separately so a later "known issue" note points at the gate that's actually red.

## Adaptation notes

- The body shape is no longer hardcoded — it follows the repo's PR template when one exists (root / `.github/` / `docs/`, including a `PULL_REQUEST_TEMPLATE/` directory of named variants, matched case-insensitively). The built-in Summary / Ticket / Caveats structure is only the fallback. Adjust template detection if your host honors other locations.
- When multiple templates exist (default vs `hotfix` / `release`), selection is by branch name / change intent; tune that heuristic to your branching model.
- Ticket detection scans branch / commits / PR description; adjust the patterns to your tracker's id format.
- The validation gate is **discovered, not hardcoded**: the skill names no formatter, linter, task runner, or hook tool — the producing session reads the repo's CI workflows, hook config, build/package scripts, and contributor docs to find the actual required checks, then runs them. A project on any toolchain gets the same behavior; nothing about a specific setup leaks into the skill. See [`docs/decisions/handoff-pr-prepush-validation-gate.md`](../decisions/handoff-pr-prepush-validation-gate.md).
- Title and branch conformance is also discovery-based: if the repo runs a PR-title linter, commit-lint, or a branch-name rule, the skill conforms the title/branch to the pattern it actually enforces (read from the linter/CI config), rather than hardcoding any project's scope vocabulary or ticket-id shape.
- The **Review status** field (in the opener-only notes, not the public body) records whatever pre-PR review ran. The coupling is light — `handoff-pr` does not enforce that a review ran. (Its former sibling `handoff-review` was retired to the attic 2026-08-10.)
