# Release Notes

Release notes for the shipped plugins (`workbench` and `toolkit`) newest
first, one section per released version. Strictly plugin releases: repo-only
work (structure, docs, tooling) lives in `docs/decisions/` and the git log,
not here. **Bounded:** at most 15 release sections: adding one past the cap
deletes the oldest (git history keeps everything). Sections from before the
2026-08-11 plugin split (`reviewers`, pre-split `toolkit`) were dropped in the
2026-08-12 reformat.


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

## toolkit 0.17.0: 2026-10-16

- **Adopt global rules on Muse.** `adopt-global-rules` adds a `muse` host that writes `globals/MUSE.md` and the shared rules as blocks in `~/.config/muse/AGENTS.md`, since Muse reads no rules directory. ([decision](decisions/plugin-surfaces.md#muse-adopt-global-rules-host-and-repo-local-skill-precedence-2026-10-14))
- **Shipped globals carry adopter defaults.** The global documents speak in the user's voice, preauthorize the task-tracker operations a task needs, comments included, and add a task-continuation rule; pull request comments and replies still need explicit authorization. ([decision](decisions/adopt-global-rules.md#shipped-globals-adopter-defaults-no-personal-grants-2026-10-15))
- **Toolkit installs on Muse.** A native Muse manifest ships with the plugin, and `web-demo-video` names Muse's file-reading tool for reviewing captured frames. ([decision](decisions/plugin-surfaces.md#muse-a-native-per-plugin-manifest-on-the-claude-marketplace-catalog-2026-10-14))

## workbench 0.48.3: 2026-10-14

- **Keep mutation evidence scoped and trustworthy.** Test-quality review verifies runtime-data isolation before its baseline, constrains Rust build and test targets, and distinguishes timeout uncertainty from assertion kills. It catches protection lost through test changes, clarifies constant-export coverage, and adds qualified Bun runner and incremental-report guidance while preserving existing budgets. ([decision](decisions/mutation-scope-and-budget.md#evidence-and-isolation-corrections-2026-10-14))

## workbench 0.48.2: 2026-10-14

- **Keep lane names stable across handoffs.** `epic-orchestration` assigns each lane one unique, short name and reuses it in paste labels, pointers, reports and the ledger. Worksets and delivery phases remain separate, and inherited composite labels map to a canonical name while preserving sessions and artifact references. ([decision](decisions/epic-orchestration.md#lane-names-stay-stable-across-handoffs-2026-10-14))

## toolkit 0.16.0: 2026-10-12

- **Invoke Anatomy for interactive isometric figures.** The explicit-only launcher loads the complete upstream package at a fixed commit and keeps its source unchanged. Automatic invocation is disabled on Claude Code and Codex; Git and network access are required, with Node.js and Chrome or Chromium for upstream checks. ([decision](decisions/anatomy.md))
- **Catch up with `ketchup`.** Summarize current work, distinguish verified results from reports and stale evidence, and surface unresolved human decisions. The explicit-only skill preserves task ownership and continues already authorized work after a status request. ([decision](decisions/ketchup.md))
- **Read every page of PR review comments.** `get-pr-comments` paginates inline feedback, checks retrieval failures, and identifies partial results and unknown missing feedback before summarizing. ([decision](decisions/get-pr-comments.md))

## workbench 0.48.1: 2026-10-12

- **Prove a usable journey after required setup.** `empirical-proof` checks initialization, migrations, and data before exercising the unchanged acceptance journey. Missing prerequisites remain visible, and stand-in environments disclose setup they supply that the target still needs. ([decision](decisions/empirical-proof.md))
- **Check compatibility beyond symbol references.** `claim-check` and `empirical-proof` name the assumption that makes a change safe, trace relevant persisted, wire, cross-language, configuration, and lifecycle consumers, and select the smallest real check that can refute it. ([decision](decisions/claim-check.md))

## workbench 0.48.0: 2026-10-08

- **Behavioral completion requires focused consumer proof.** `verification-before-completion` invokes `empirical-proof` by default for behavioral changes and refactors. Reuse sufficient current evidence; blocked checks remain incomplete, and explicit declines and repository rules retain precedence. Broad QA, recordings, teams, and permanent harnesses remain optional. ([decision](decisions/empirical-proof.md#focused-consumer-proof-is-the-completion-default-2026-10-08))
- **Tests state their boundary and mutation probes confirm their source change.** TDD explains what a selected test catches and misses without reopening agreed scope. Hand-applied mutants must differ from pristine source with expectations intact before their failures count as evidence. ([decision](decisions/mattpocock-skills.md#focused-upstream-refinements-2026-10-08))

## toolkit 0.15.2: 2026-10-08

- **Yes accepts the grilling recommendation.** Phrase yes/no questions so an affirmative answer selects the recommended action, while genuine multi-option decisions retain distinct choices. ([decision](decisions/mattpocock-skills.md#focused-upstream-refinements-2026-10-08))

## workbench 0.47.4: 2026-10-07

- **CI watchers execute one bundled runner.** `ci-watcher` and `fix-ci` invoke the same Node command for PR and branch monitoring, with pinned revisions, persisted deadlines and explicit rerun attempts. Failures return before diagnosis; cancelled or missing checks cannot certify a pass, and partial reruns preserve jobs that already passed. Node 18+ and authenticated `gh` are required; missing prerequisites produce a reported gap. ([decision](decisions/fix-ci.md#execute-a-bundled-watcher-instead-of-generating-loops-2026-10-07))
