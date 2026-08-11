---
name: handoff-pr
description: Use when a branch is ready for a PR but the current session is not authorized to open one. Produces a structured PR handoff artifact (title, body, ticket links, validation and review status) for a separately-authorized session or agent to open. Derives the PR body from the repo's own PR template when one exists. Auto-detects the ClickUp / Linear / Jira ticket and asks to confirm. Writes the artifact to a `tmp/` scratch file by default; `inline` prints it in-session instead and writes no file. Never opens the PR itself.
---

# Handoff PR

Package a finished branch into a **structured PR artifact** that a separately-authorized session or agent opens. This skill produces the artifact; it **never** runs `gh pr create`.

## When to use

The work is ready for a PR, but the current session does not hold PR-write authorization (or you deliberately want a clean, authorized session to open it). Hand it off instead of opening it here.

## The two rules that make this work

1. **The artifact must stand alone.** A separately-authorized session opens the PR with no access to this session, so every field — summary, ticket, status — is re-derived from the **branch diff and the ticket**, never from "what we discussed this session."
2. **The PR body belongs to the repo, not to this skill — follow its template, never replace it.** If the repo ships a PR template, the body **is** that template filled in — its exact headings, order, checkboxes, and hidden `<!-- markers -->`, nothing added or dropped. The built-in skeleton in *The artifact* is a **last resort for repos that have no template**; never emit it, or its `Summary` / `Ticket` / `Caveats` headings, when a template exists. Swapping the repo's template for this skill's outline is the failure this rule exists to prevent.

## Steps

1. **Detect branch and base.** Run `git branch --show-current` and determine the base branch (default `main` unless the repo says otherwise). Summarize the change from `git diff <base>...HEAD` and the commit list — do not rely on session memory.
2. **Identify the ticket.** Scan the branch name, commit messages, and any existing PR description for a ClickUp / Linear / Jira id or URL. Present what you found and ask the operator to confirm or supply the right one. If none is found, ask. Capture the full ticket **link**, not just the id; if only an id is available, ask the operator for the full URL — do not synthesize one.
3. **Find the repo's PR template.** Before assembling anything, look for a PR template GitHub would honor (match the filenames **case-insensitively**):
   - `.github/pull_request_template.md` and `.github/PULL_REQUEST_TEMPLATE.md`
   - any file under `.github/PULL_REQUEST_TEMPLATE/` (a directory of named variants)
   - the same names in the repo **root** and under **docs/** — `pull_request_template.md`, `docs/pull_request_template.md`, and their `PULL_REQUEST_TEMPLATE/` directory forms

   If **multiple** templates exist (e.g. a default plus `hotfix` / `release` variants), pick the one that matches the branch name / change intent, and record which one you chose and why.

   **Record the search outcome before building the body:** either **found** (the path — the body is then built *from that file*) or **none found after searching the locations above**. The built-in fallback is allowed *only* after you have recorded that search and come up empty; a fallback body produced without an actual search is the bug, not a shortcut.
4. **Capture status fields** (these feed the opener-only handoff notes, not necessarily the public body):
   - **Validation — discover the repo's gates, run them, record concretely.** Don't assume "tests pass" is enough. *Discover* what this repo actually gates a PR on rather than hardcoding a toolchain — read its CI workflow definitions (which checks block merge, which fail fast), its commit/push hook config, its build/package manifest's script targets, and any contributor docs. Identify the **fast static checks** (formatting, lint, type-check) **separately** from the test suites: they are usually the *required* CI gates and the cheapest to fail, so run them locally, not just the tests. Run everything against an **up-to-date base** (fetch the latest base first) and record the **exact commands and each result**, kept separate by kind (format / lint / type-check / tests). **If any commit used `--no-verify` or otherwise bypassed the pre-commit/pre-push hooks, the repo's formatter and linter never ran on it — run them manually before the branch is pushed**, or CI's static gate fails on code that looked clean locally. If a gate genuinely can't be run here, name which and why rather than implying it passed.
   - **Review:** whether a pre-PR review pass ran and its outcome; link the findings if available. Do not block on it — record honestly if no review ran.
5. **Build the PR body.**
   - **Template found:** fill that template's actual sections **verbatim** — preserve its headings, their order, every checkbox item, and any `<!-- comment markers -->`. Do **not** add, drop, or rename sections. Map our content into the fields the template already has: summary text into its summary/description field, the ticket link into its issue/ticket field, validation evidence into its testing/QA field *if it has one* (the commands run + their results, not bare test-file names). For a checklist, tick `[x]` **only** for items actually verified; leave the rest `[ ]`. If a field has no content to fill, leave it blank (or keep its placeholder) rather than fabricating one. **Before finalizing, check your body's headings against the template's: same set, same order, none added (no `Summary` / `Caveats` unless the template has them), none renamed — if they differ, you replaced the template instead of filling it; redo.**
   - **No template (only after the Step 3 search came up empty):** fall back to the built-in structure below.
6. **Assemble the artifact** using the layout below — the paste-ready **PR body** first, then the **handoff notes** that stay with the opener.
7. **Deliver — exactly one mode, chosen by the invocation argument:**
   - **Default (no argument):** write the artifact to `tmp/handoff-pr-<branch-slug>.md` (sanitize the branch name: `/` → `-`) and report the path so the authorized session can read it. Do not also print the full artifact inline — the path plus the PR title is the in-session output.
   - **`inline`** (invoked as `/handoff-pr inline`): print the full artifact inline and write **no** file — no `tmp/` artifact, no scratch copy anywhere.
8. **Stop.** State plainly that opening the PR is the authorized session's job: it pastes the PR body and runs the `gh pr create` command from the handoff notes. Do not run it.

## The artifact

Two clearly separated blocks. The **PR body** is the only part that goes into the public PR description; the **handoff notes** are for the opener and must not be pasted into the PR.

### PR body — paste-ready (this block, and nothing else, goes in the PR description)

**Normal case — a template was found:** this block **is** that template, filled in verbatim (its headings, order, checkboxes, and `<!-- markers -->`, our content mapped into its existing fields). Do not paste the skeleton below, and do not add headings the template doesn't have.

**Fallback — only when Step 3 found no template:** use this minimal built-in structure.

> ## Summary
> `<what changed and why, grounded in the diff>`
>
> ## Ticket
> `<ClickUp / Linear / Jira link(s)>`
>
> ## Caveats / follow-ups
> `<anything the reviewer / merger should know; "none" if none>`

### Handoff notes — opener-only (do NOT paste into the PR)

> **PR handoff — `<branch>` → `<base>`**
>
> **Title:** `<conventional-style subject, e.g. feat: ...>`
>
> **Template used:** `<path to the chosen template + why it was picked, or "none — built-in fallback">`
>
> **Validation provenance:** `<the discovered gate commands and each result, separated by kind — format / lint / type-check / tests — and the base they ran against; flag any commit that bypassed hooks (--no-verify) and whether the formatter/linter was re-run; "not run" only where literally true>`
>
> **Review status:** `<pre-PR review outcome + link, or "no review run">`
>
> **To open:** an authorized session pastes the PR body above, then runs `gh pr create --base <base> --head <branch>` with that body and the title above.

## Rules

- Never run `gh pr create` (or any PR-opening command) — produce the artifact only.
- Deliver in exactly one mode: the `tmp/` file by default, inline-only (no file written) when invoked with `inline` — never both.
- When the repo ships a PR template, the body **is** that template: same headings, order, checkboxes, and comment markers. Fill its fields; never add, drop, or rename sections.
- **Never replace a found template with the built-in skeleton.** The fallback's `Summary` / `Ticket` / `Caveats` headings appear *only* when the repo genuinely has no template. Use the fallback solely after an actual Step 3 search came up empty, and before finalizing a template-based body confirm its headings match the template's exactly.
- If the repo enforces PR **title** or **branch-name** conventions (a PR-title linter, commit-lint, a branch-name rule), conform the title and branch to the pattern it actually enforces — discover it from the linter / CI config rather than guessing a scope or prefix that gets the PR rejected.
- Keep the PR body and the handoff notes visibly separate. Validation provenance, review status, and the `gh` command are opener-only — they must never land in the public PR description.
- Keep the PR body tooling-agnostic: no named editors, bots, or AI assistants, and no "generated by" footers. Describe the change, not how it was produced.
- Always carry a real ticket link; if you cannot find or confirm one, ask rather than omit it.
- Ground the summary in the actual diff, not session memory — the artifact may be opened by a session with no shared context.
- Discover the repo's own validation gates rather than assuming or hardcoding a toolchain — read its CI workflows, hook config, build/package scripts, and contributor docs — then run them and record the concrete commands and results. The fast static checks (formatting, lint, type-check) are commonly the *required* CI gates and the first to fail; run them locally, not just the tests.
- A commit made with `--no-verify` (or any hook bypass) skips the repo's pre-commit formatter and linter — run those manually before push, or CI's static gate fails on code that "passed" locally.
- In any "known CI issues" note, separate a formatting failure from a type-check or test failure, and from a stale-base error — so the opener fixes the gate that is actually red instead of chasing a red herring.
