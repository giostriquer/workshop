# Release Notes

Release notes for the shipped plugins (`workbench` and `toolkit`) newest
first, one section per released version. Strictly plugin releases: repo-only
work (structure, docs, tooling) lives in `docs/decisions/` and the git log,
not here. **Bounded:** at most 15 release sections: adding one past the cap
deletes the oldest (git history keeps everything). Sections from before the
2026-08-11 plugin split (`reviewers`, pre-split `toolkit`) were dropped in the
2026-08-12 reformat.


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

## workbench 0.44.2: 2026-09-28

- **Epic coordination and verification tooling stays local.** Sessions may create progress scripts and qualification harnesses, but keep them and their supporting CI or package integration out of delivery unless explicitly approved as maintained deliverables. Dispatches, recovery notes and delivery checks carry that boundary; normal product regression tests still ship. ([decision](decisions/epic-orchestration.md#coordination-and-verification-tooling-stays-local-2026-09-28))
- **Every lane gets its own paste label.** Each destination has a visible `Paste this into <LANE>:` label directly above its fenced pointer, including returns to existing sessions. Multiple ready lanes still go out in one reply. ([decision](decisions/epic-orchestration.md#dispatches-are-files-and-paste-blocks-are-pointers-2026-09-11))

## workbench 0.44.1: 2026-09-26

- **Audit acceptance and assignment completion are explicit.** The orchestrator states report acceptance, the auditor's remaining work or completion, and epic closure separately. A completed auditor assignment ends with an acknowledgment instead of another validation report; findings, evidence gaps and the operator's closure authority remain intact. ([decision](decisions/epic-auditor.md#explicit-audit-acceptance-and-assignment-completion-2026-09-26))

## workbench 0.44.0: 2026-09-25

- **Epic auditors return complete, copyable reports.** The new `epic-auditor` skill keeps verdicts, coverage, fix-family results, findings, gaps and next actions together across audit follow-ups, amendments and recovery. `epic-orchestration` requires it in auditor dispatches and links the shared audit report template; implementation lanes retain their own reporting skill. ([decision](decisions/epic-auditor.md))

## workbench 0.43.5: 2026-09-25

- **Bounded CI repairs preserve completed reviews.** After review closes, a correction within the accepted scope and design continues through focused verification, push, and CI watching without restarting review or mutation rounds. `fix-ci` owns this delivery loop. ([decision](decisions/bounded-correction-review.md))
- **Each review discipline owns its process.** Code-quality and test-quality reviews keep separate findings, follow-ups, convergence decisions, and closure records. A missing stage runs without repeating a completed stage, and delivery callers preserve each result. ([decision](decisions/completion-review-stages.md))
- **Codex prompts match the plugin's skills.** PR-comment summarization is advertised by Toolkit, which ships that skill. ([decision](decisions/plugin-surfaces.md#codex-submission-export-2026-09-25))

## toolkit 0.13.1: 2026-09-25

- **Codex starter prompts describe shipped utilities.** PR-comment summarization replaces the obsolete skill-authoring prompt. All host manifests replace the stale skill-authoring keyword with PR review. ([decision](decisions/plugin-surfaces.md#codex-submission-export-2026-09-25))
