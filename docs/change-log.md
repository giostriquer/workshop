# Release Notes

Release notes for the shipped plugins (`workbench` and `toolkit`) newest
first, one section per released version. Strictly plugin releases: repo-only
work (structure, docs, tooling) lives in `docs/decisions/` and the git log,
not here. **Bounded:** at most 15 release sections: adding one past the cap
deletes the oldest (git history keeps everything). Sections from before the
2026-08-11 plugin split (`reviewers`, pre-split `toolkit`) were dropped in the
2026-08-12 reformat.


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

## toolkit 0.15.1: 2026-10-07

- **Haiku gets a narrow lane instead of a ban.** The shipped `model-floor` rule allows Haiku 5.5 for high-volume, cost-sensitive summaries, compactions, and database queries that fetch and report data. Coding, code review, auditing, profiling, debugging, planning, design, and judging another agent's output never go to Haiku; mixed or unclear tasks stay off it, and volume or budget never moves a task into the lane. ([decision](decisions/adopt-global-rules.md#haiku-gets-a-narrow-lane-2026-10-07))

## workbench 0.47.3: 2026-10-07

- **CI watching names its own Haiku exclusion.** `model-reference` and `ci-watcher` list Haiku beside Astra and Fable as models that never watch CI, instead of relying on the global Haiku ban the operator rule no longer carries. ([decision](decisions/model-reference.md#claude-ci-watching-uses-sonnet-55-2026-09-29))

## workbench 0.47.2: 2026-10-06

- **Keep synchronizing when the PR target advances.** `file-pr` and `fix-ci` continue merging and validating concurrent target or feature-head updates without a synchronization retry cap. The two-attempt limit remains scoped to fixes for the same CI failure; synchronization neither consumes nor resets it. ([decision](decisions/file-pr.md#remove-the-synchronization-retry-cap-2026-10-06))

## workbench 0.47.1: 2026-10-05

- **PR bodies explain the full impact of a change.** `file-pr` follows the behavior activated by flags and defaults, then explains workflow changes, compatibility, breaking changes, side effects, rollout, and rollback. Known failures and unverified critical workflows appear in the change description, with detailed evidence in the repository's verification field. ([decision](decisions/file-pr.md#clear-technical-prose-and-reviewer-evidence-2026-10-05))
- **PR writing uses precise technical English.** Titles, bodies, and delivery reports use ASD-STE100 Simplified Technical English as a guiding style without claiming formal compliance. Compact visuals, paired evidence, and recovery guidance adapt Matt Pocock's PR skill while preserving repository templates and delivery rules. ([decision](decisions/file-pr.md#clear-technical-prose-and-reviewer-evidence-2026-10-05))

## toolkit 0.15.0: 2026-10-04

- **Prevent recurring mistakes with `correct`.** Trace repeated repository mistakes to their cause, then use ownership, interfaces, types, checks, or behavioral tests to prevent recurrence. Plans stay read-only; authorized repairs require evidence that the check rejects the mistake and accepts valid work. ([decision](decisions/correct.md))
- **Check performance claims with `benchmark-checklist`.** Validate completed correct work, comparable configurations, repeated runs and variation before drawing conclusions. A requested one-run ballpark stays a labeled observation, and an unknown cause limits causal claims. ([decision](decisions/benchmark-checklist.md))
- **Design for contributors with partial context.** Architecture surveys and alternative designs check split ownership, equivalent competing paths, reachable internals, and hand-synchronized lists while preserving legitimate compatibility. ([decision](decisions/mattpocock-skills.md#agent-contributions-with-partial-context-2026-10-04))
- **Reuse either glossary convention.** Domain modeling, architecture surveys, and design briefs share one lookup rule for `GLOSSARY.md`, legacy `CONTEXT.md`, their maps, and repository-specific locations. Existing names remain intact; new unconfigured repos default to `GLOSSARY.md`. ([decision](decisions/mattpocock-skills.md#glossary-compatibility-and-source-tracking-2026-10-04))

## workbench 0.47.0: 2026-10-04

- **Performance claims carry comparable evidence.** Verification and empirical proof require completed correct work, comparable runs, variation, and explicit limits on causality, independently of Toolkit. ([decision](decisions/empirical-proof.md))
- **Reviews inspect enforceable contracts.** The quality rubric checks external-input validation against the whole declared type and identifies architecture that permits distant mistakes from plausible local edits. ([decision](decisions/code-quality-review.md))
- **Self-audits can propose structural prevention.** Repeated process misses can point to an owner, interface, or executable check; the retrospective remains a report with no new edit authority. ([decision](decisions/self-audit.md))
