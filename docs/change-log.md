# Release Notes

Release notes for the shipped plugins (`workbench` and `toolkit`) newest
first, one section per released version. Strictly plugin releases: repo-only
work (structure, docs, tooling) lives in `docs/decisions/` and the git log,
not here. **Bounded:** at most 15 release sections: adding one past the cap
deletes the oldest (git history keeps everything). Sections from before the
2026-08-11 plugin split (`reviewers`, pre-split `toolkit`) were dropped in the
2026-08-12 reformat.


## workbench 0.45.6: 2026-10-01

- **Every PR push includes the latest target branch.** Filing and CI repairs refresh the actual target repository and branch, merge missing commits even without conflicts, and recheck the target after validation. Sessions resolve conflicts settled by existing requirements and validate the combined result; unresolved decisions and failed synchronization leave the push pending. ([decision](decisions/file-pr.md#synchronize-the-actual-target-before-every-push-2026-10-01))

## workbench 0.45.5: 2026-09-30

- **CI failures return to the parent before diagnostics.** The watcher reports any failed check or job on the pinned revision, even when it is not listed as required or its workflow is still running. It returns with the available evidence; the parent collects logs and decides the next action. ([decision](decisions/fix-ci.md#return-failures-before-diagnostics-or-required-check-filtering-2026-09-30))

## workbench 0.45.4: 2026-09-30

- **PR titles distinguish each change's actual contribution.** Identify the affected workflow or shared subsystem from the diff and callers, then name the operation, mechanism, or condition that separates this PR from other work on the same symptom. Descriptions connect the observed problem to the implementation and its supported effect, including unresolved work. ([decision](decisions/file-pr.md#titles-and-descriptions-share-an-evidence-boundary-2026-09-30))

## workbench 0.45.3: 2026-09-30

- **PR text uses one concise contract.** Replace the drafting worksheet, repeated checks, and claim-check report with a title formula, a description sequence, and one example. Titles retain the affected feature, concrete contribution, and failure condition for fixes. ([decision](decisions/file-pr.md#titles-and-descriptions-share-an-evidence-boundary-2026-09-30))

## workbench 0.45.2: 2026-09-30

- **PR titles explain the change without opening the description.** Name the affected feature and corrected behavior, including the restart, interruption, or failure condition for retention and recovery fixes. A worked example rejects a vague title even after its scope prefix is corrected; descriptions expand the same before/after claim. ([decision](decisions/file-pr.md#titles-and-descriptions-share-an-evidence-boundary-2026-09-30))

## workbench 0.45.1: 2026-09-30

- **PR titles and descriptions identify the actual contribution.** Ground both in the owning surface, final diff, supported result, and material limits. Check claims before publication, distinguish successive repairs to the same symptom, and refresh both title and body after synchronization or later corrections. ([decision](decisions/file-pr.md#titles-and-descriptions-share-an-evidence-boundary-2026-09-30))

## workbench 0.45.0: 2026-09-30

- **Empirical proof fits apps and their real consumers.** Cover web, desktop, mobile, CLI/TUI, API, MCP, libraries and generated output with general checks and surface-specific direction. Use available native tools and project workflows, keep evidence proportional, and show build identity and coverage gaps without a fixed health gate, probe matrix, transcript format or fan-out requirement. ([decision](decisions/empirical-proof.md#surface-aware-guidance-for-modern-harnesses-2026-09-30))

## toolkit 0.14.2: 2026-09-29

- **Capture help passes the native punctuation check.** Replace the help text's em dash with a colon; recording behavior is unchanged.

## workbench 0.44.6: 2026-09-29

- **Epic cleanup includes disposable Docker images.** Inventory images used by the work on the verified daemon, check shared and stopped-container consumers, and remove only exact disposable targets. Workspace cleanup remains report-only until you pick entries. ([decision](decisions/epic-cleanup.md#docker-images-used-during-the-work-2026-09-29))

## toolkit 0.14.1: 2026-09-29

- **Browser demos use `web-demo-video`.** Rename `ui-demo-video` and its discovery, usage, and catalog references to make the browser scope explicit. Existing capture settings and saved runs remain compatible. ([decision](decisions/web-demo-video.md#browser-specific-name-2026-09-29))

## workbench 0.44.5: 2026-09-29

- **PR screenshot guidance names `web-demo-video`.** The visual evidence reference uses the renamed Toolkit skill. ([decision](decisions/file-pr-screenshots-section.md))

## toolkit 0.14.0: 2026-09-29

- **UI demos use one reusable capture helper.** `ui-demo-video` now uses native Playwright CLI recording on Claude Code and Codex, with prerequisite checks, scene frames, run-wide browser diagnostics, tab video parts, interruption recovery, and owned-session cleanup. Host-specific setup and image inspection replace per-demo recorder harnesses. ([decision](decisions/web-demo-video.md))

## workbench 0.44.4: 2026-09-29

- **Model reference reflects the updated operator ratings.** Refresh the Sol 6.1, Astra, Fable, Opus, and Sonnet scores and remove the retired Sol 6 row. The usage page matches the canonical table; the scores remain legacy illustrations without a new calibration claim. ([decision](decisions/model-reference.md#operator-supplied-reference-rows-2026-09-29))

## workbench 0.44.3: 2026-09-29

- **Codex dispatches use Sol 6.1.** CI watching, test-quality review, and comment trimming now select `gpt-6.1-sol`; `xhigh` effort, fresh context, and the contract-message requirements stay intact. ([decision](decisions/model-reference.md#sol-61-dispatch-pins-2026-09-29))
- **Claude Code CI watching uses Sonnet 5.5.** The watcher pins `claude-sonnet-5-5` at `xhigh`, with matching skill and usage guidance. Test-quality review and comment trimming retain Opus. ([decision](decisions/fix-ci.md#claude-watcher-pinned-to-sonnet-55-2026-09-29))
- **Reference rows reflect the updated fleet.** Add Sol 6.1 and Sonnet 5.5 rows and raise the Opus 5.5 code score to 9.5. The scores remain legacy illustrations; they do not establish a current calibration. ([decision](decisions/model-reference.md#operator-supplied-reference-rows-2026-09-29))

## toolkit 0.13.2: 2026-09-29

- **Global rules permit Sonnet.** The model-floor rule now bans only Haiku and allows explicit Claude model selections, including the Sonnet 5.5 CI watcher. The adoption example and usage page match the rule. ([decision](decisions/adopt-global-rules.md#remove-the-sonnet-ban-retain-the-haiku-ban-2026-09-29))
