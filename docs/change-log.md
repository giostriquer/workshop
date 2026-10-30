# Release Notes

Release notes for the shipped plugins (`workbench` and `toolkit`) newest
first, one section per released version. Strictly plugin releases: repo-only
work (structure, docs, tooling) lives in `docs/decisions/` and the git log,
not here. **Bounded:** at most 15 release sections: adding one past the cap
deletes the oldest (git history keeps everything). Sections from before the
2026-08-11 plugin split (`reviewers`, pre-split `toolkit`) were dropped in the
2026-08-12 reformat.

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

## toolkit 0.18.1: 2026-10-16

- **Preserve attribution across installation routes.** Standard MIT text and the existing upstream notices now ship as `LICENSE` and `THIRD_PARTY_NOTICES.md`; standalone-copy instructions require both in the copied skill folder. The standalone npm installer also retains its license and notices. ([decision](decisions/plugin-surfaces.md#license-notices-travel-with-copied-content-2026-10-16))

## workbench 0.50.0: 2026-10-16

- **Settle architecture before defining the workset.** Brainstorming explicitly covers architectural decisions and loads `codebase-design` when ownership, interfaces, state, dependencies, or extraction remain unresolved. The selected design carries constraints, exclusions, and verification into implementation and review; bounded work stays bounded and settled decisions stay settled. ([decision](decisions/workbench-system.md#architecture-before-the-workset-2026-10-16))
- **Design guidance ships with Workbench.** `codebase-design` and `domain-modeling`, including their references and invocation policies, move here from Toolkit. Workbench can use them without installing Toolkit. ([decision](decisions/mattpocock-skills.md#design-references-belong-to-workbench-2026-10-16))

## toolkit 0.18.0: 2026-10-16

- **Use Workbench's shared design guidance.** `improve-codebase-architecture` now requires Workbench's `codebase-design` and `domain-modeling`; `correct` uses Workbench when prevention needs an unresolved design choice. The moved skills are no longer shipped in Toolkit. Update Workbench alongside Toolkit for those paths; `grilling` and `grill-me` remain in Toolkit. ([decision](decisions/mattpocock-skills.md#design-references-belong-to-workbench-2026-10-16))

## workbench 0.49.0: 2026-10-16

- **Dispatch files declare their lane.** `epic-orchestration` writes each dispatch under the scope folder's `dispatches/`, opening with `Lane: <LANE>`, and names it by absolute path in the pointer. The label, pointer and `Lane:` line are read as written by the tooling that carries handoffs, so returns to several existing lanes keep a label-and-block pair each, and the section is reread after a compaction or resume. ([decision](decisions/epic-orchestration.md#handoffs-are-read-as-written-by-their-file-2026-10-16))
- **Run workbench on Muse.** A native `.muse-plugin/plugin.json` installs the plugin on Muse. Agents dispatch there by their scoped id, `workbench/<name>`, once the operator approves them; `session-messaging` reaches Muse peers through Muse's own messaging, and `handoff-goal`, `empirical-proof` and `model-reference` name Muse's surfaces. Muse's native loader does not honor `disable-model-invocation`; the README says how to restore it per machine. ([decision](decisions/plugin-surfaces.md#muse-a-native-per-plugin-manifest-on-the-claude-marketplace-catalog-2026-10-14))
- **Agents pin no tool allowlist.** One tool name a host did not know made Muse reject a whole agent definition at spawn, so every agent drops its `tools:` line; each body still states what its agent must not touch. ([decision](decisions/plugin-surfaces.md#muse-a-native-per-plugin-manifest-on-the-claude-marketplace-catalog-2026-10-14))
