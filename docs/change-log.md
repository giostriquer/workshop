# Release Notes

Release notes for the shipped plugins (`workbench` and `toolkit`) newest
first, one section per released version. Strictly plugin releases: repo-only
work (structure, docs, tooling) lives in `docs/decisions/` and the git log,
not here. **Bounded:** at most 15 release sections: adding one past the cap
deletes the oldest (git history keeps everything). Sections from before the
2026-08-11 plugin split (`reviewers`, pre-split `toolkit`) were dropped in the
2026-08-12 reformat.

## workbench 0.57.0: 2026-10-30

- **Add a Muse scope opinion at completion.** `scope-review` checks the original request, accepted increment, exclusions and evidence claims through one bounded Muse invocation. It trusts the configured authentication, skips invocation failures without fallback or delivery holds, and leaves finding triage to the parent while required reviewers retain their gates. ([decision](decisions/scope-review.md#decision-2026-10-30))

## workbench 0.56.0: 2026-10-30

- **Keep long skill entrypoints bounded.** Code-quality review, test-quality review, PR preparation, goal handoffs and epic orchestration now load detailed procedures through explicit references while retaining shared authority, recovery and completion gates in their entrypoints. The repository validator enforces an under-20,000-byte limit. ([decision](decisions/repo-tooling.md#bounded-skill-entrypoints-2026-10-30))
- **Start independent designers with fresh context.** New design-it-twice helpers receive scoped briefs and settled constraints without the parent's exploratory history or preferred design. Related refinements continue in the same helper session, with model routing unchanged. ([decision](decisions/mattpocock-skills.md#independent-helpers-start-with-fresh-context-2026-10-30))

## toolkit 0.20.0: 2026-10-30

- **Reconstruct historical rationale with `why`.** The new explicit-only skill follows relevant dated evidence, separates documented intent from inference and unknowns, and identifies what needs checking before revisiting a decision. It adds no mandatory swarm or write authority. ([decision](decisions/why.md#decision-2026-10-30))
- **Explain PRs with inspectable source.** The conditional HTML walkthrough recipe connects core and supporting changes, retains every available hunk including imports, discloses missing content, and separates source, execution and CI evidence. Offline, dark, keyboard and print behavior remain part of verification. ([decision](decisions/html-artifact.md#pr-walkthrough-reference-2026-10-30))
- **Give independent helpers a fresh brief.** Architecture explorers and grilling fact-finders start from accepted scope, source paths and evidence requirements rather than inherited exploratory history. Related follow-ups reuse the same helper; open user decisions remain with the user. ([decision](decisions/mattpocock-skills.md#independent-helpers-start-with-fresh-context-2026-10-30))

## workbench 0.55.1: 2026-10-29

- **Choose lane assignments before reusing names.** New worksets select available lanes by current file ownership, dependencies and capacity. Corrections and delivery preserve their session, independent ready work can proceed during PR checks within governing limits, and the ledger separates new assignments from completed history. ([decision](decisions/epic-orchestration.md#assignment-precedes-naming-2026-10-29))

## workbench 0.55.0: 2026-10-29

- **Let the host carry CI waiting.** On supported Claude Code hosts, `ci-watcher` uses background command completion notifications; other hosts retain bounded foreground slices or process waits. Watcher model and reasoning settings are unchanged. ([decision](decisions/fix-ci.md#let-the-host-own-waiting-and-the-runner-own-evidence-2026-10-29))
- **Bind watcher results to their protocol and target.** Protocol 2 rejects stale runner/state contracts, shares target ownership across state filenames, and reports compact verdicts with observation times. Completed job details are reused only with matching fresh run metadata; rate limits pause reads within the original deadline. ([decision](decisions/fix-ci.md#let-the-host-own-waiting-and-the-runner-own-evidence-2026-10-29))

## workbench 0.54.0: 2026-10-29

- **Advance epics along their primary journey.** `epic-orchestration` writes the epic's end-to-end steps from its acceptance criteria before the first workset, completes the thinnest path first, and has each dispatch name the step it moves and the tickets it closes. Valid findings that block no current step wait or go to the operator's follow-up list. Repeated partial deliveries trigger a re-plan, and owner returns open with criteria closed and remaining. Holds stop only the step that consumes the missing input, and user-reachable changes are accepted on the running app. ([decision](decisions/epic-orchestration.md#the-epic-advances-along-its-primary-journey-2026-10-29))

## workbench 0.53.2: 2026-10-28

- **Route lane questions through the orchestrator.** `epic-implementation` sends questions and approvals unresolved by the active contract through the normal `need-guidance` handback, including user-input requests from other skills. The orchestrator rules within delegated authority or escalates to the operator; independent authorized work continues while the dependent action waits. ([decision](decisions/epic-implementation.md#questions-through-the-orchestrator-2026-10-28))

## workbench 0.53.1: 2026-10-26

- **Keep epic and ticket statuses current.** `epic-orchestration` now explicitly moves active tickets and their epic to In Progress or the workflow's equivalent, reconciles later transitions, and reports confirmed or pending tracker updates. Queued work and existing completion gates are preserved. ([decision](decisions/epic-orchestration.md#tracker-status-follows-the-work-2026-10-26))

## workbench 0.53.0: 2026-10-22

- **Reclaim workspace disk space with `workspace-cleanup`.** This replaces `epic-cleanup` with one workflow for project and machine cleanup, covering worktrees, Docker, build caches, `.workbench` and `.tmp` artifacts. It measures bloat, preserves active and unique work, acts on selected targets under existing authorization, and verifies recovered space. ([decision](decisions/workspace-cleanup.md#purpose-and-authority-2026-10-22))

## toolkit 0.19.0: 2026-10-22

- **Respond to dependency and software security incidents.** `dependency-audit` now covers requested incident work across project dependencies, development tools, containers, installed applications and the OS. It checks current primary advisories before executing suspect software, selects known-safe upgrades or pins, and verifies the active consumer and trust store; pending restarts, unverified surfaces and compromise recovery remain explicit. Ordinary project audits keep their existing scope. ([decision](decisions/dependency-audit.md#incident-response-and-requested-machine-software-2026-10-22))

## workbench 0.52.2: 2026-10-21

- **A bug-fix check must be able to fail on the bug.** `verification-before-completion` and `empirical-proof` count an app or CLI check toward "bug fixed" only when it uses the reported trigger or was seen failing before the fix; a pass on input never shown to reach the defect leaves the fix unverified. A later pre-fix run uses a disposable checkout, never a revert in an active or dirty worktree. ([decision](decisions/empirical-proof.md#a-bug-fix-check-must-be-able-to-fail-on-the-defect-2026-10-21))

## workbench 0.52.1: 2026-10-21

- **Keep mutation campaigns with the review and off a busy host.** A `blocked` mutation run now joins the next test-quality review round instead of going to the implementer, and code the host cannot build stays `blocked` until the user supplies a capable host or waives it. Reviewers clone their copy to a fresh path, check for another running campaign before each launch and wait up to fifteen minutes outside the budget, and stop processes by their own paths. `partial` is recorded only for the budget, estimate sampling, the wait limit, a handback or shared-host timeouts. ([decision](decisions/mutation-scope-and-budget.md#blocked-runs-shared-hosts-and-copies-2026-10-21))

## workbench 0.52.0: 2026-10-21

- **Report merge conflicts ahead of CI results.** The CI watcher reads PR mergeability on every poll and returns a new `conflicted` verdict as soon as GitHub reports a merge conflict, ahead of any check result; `passed` now also requires a mergeable PR. Before, a conflicted PR with green checks was reported as passing, and one with no checks waited out the whole watch window. `fix-ci` and `file-pr` route `conflicted` to target synchronization, which uses no CI fix attempt. ([decision](decisions/fix-ci.md#merge-conflicts-end-the-watch-2026-10-21))

## workbench 0.51.0: 2026-10-16

- **Review agreed behavior and consumer contracts.** The new `contract-review` skill invokes `contract-reviewer`, replacing `pattern-reviewer`. It checks observable outcomes, affected consumers and integration at completion without reopening settled architecture for preferences. Custom dispatches must use the new agent name; correction rounds retain their existing convergence policy. ([decision](decisions/pattern-reviewer-comment-noise.md#review-the-agreed-behavior-and-affected-consumers-2026-10-16))
- **Use explicit contract-review models.** Claude Code runs Opus 5.5 at `xhigh`, and Codex runs GPT-6.1 Sol at `xhigh`. Other harnesses use the parent's model and effort; Muse overrides the shared Claude settings accordingly. ([decision](decisions/model-reference.md#contract-review-routing-2026-10-16))
- **Land with completed verification and review evidence.** `file-pr` checks existing completion records and returns missing stages to completion. It reuses valid evidence after unchanged synchronization, while preserving fresh checks for invalidated coverage and explicit delivery gates. ([decision](decisions/file-pr.md#landing-consumes-completed-gates-2026-10-16))

## workbench 0.50.1: 2026-10-16

- **Keep license notices with copied skills.** The package separates standard MIT text from complete upstream attribution in `THIRD_PARTY_NOTICES.md`, restores the 2025 Superpowers copyright year, and requires both files with standalone skill copies. Full-plugin installations and Codex exports retain both files. ([decision](decisions/plugin-surfaces.md#license-notices-travel-with-copied-content-2026-10-16))
