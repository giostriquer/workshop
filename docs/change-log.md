# Release Notes

Release notes for the shipped plugins (`workbench` and `toolkit`) newest
first, one section per released version. Strictly plugin releases: repo-only
work (structure, docs, tooling) lives in `docs/decisions/` and the git log,
not here. **Bounded:** at most 15 release sections: adding one past the cap
deletes the oldest (git history keeps everything). Sections from before the
2026-08-11 plugin split (`reviewers`, pre-split `toolkit`) were dropped in the
2026-08-12 reformat.


## toolkit 0.14.0: 2026-09-29

- **UI demos use one reusable capture helper.** `ui-demo-video` now uses native Playwright CLI recording on Claude Code and Codex, with prerequisite checks, scene frames, run-wide browser diagnostics, tab video parts, interruption recovery, and owned-session cleanup. Host-specific setup and image inspection replace per-demo recorder harnesses. ([decision](decisions/ui-demo-video.md))

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

## workbench 0.43.4: 2026-09-25

- **The coordinator owns routine lane publication decisions.** After independent acceptance and required pre-publication gates, it authorizes branch push, PR creation or update, and CI work through the copyable lane handoff. Holds identify who can release them and their governing source; an owner-written dispatch or ledger cannot invent another operator approval requirement. Explicit operator or repository reservations remain binding, and merges remain operator decisions. ([decision](decisions/epic-orchestration.md#authorization-claims-the-pr-review-gate-2026-09-04))

## workbench 0.43.3: 2026-09-25

- **Always pull latest before opening a PR.** `file-pr` integrates missing commits from the latest remote base even when they merge cleanly. The final push pulls the remote head when it exists; incoming changes refresh the diff and body and run affected validation and review. Failed synchronization blocks filing. ([decision](decisions/file-pr.md#always-pull-latest-before-filing-2026-09-25))

## workbench 0.43.2: 2026-09-25

- **Lane-facing owner returns include a copyable handoff.** Accepting or rejecting a report, returning a correction or ruling, and authorizing delivery require a dispatch file and a separate fenced pointer for each affected lane. Accepted corrections still receive a handoff when only approval remains; status-only answers can stay brief prose. Pending delivery approval preserves the hold without creating correction work or merge authority. ([decision](decisions/epic-orchestration.md#dispatches-are-files-and-paste-blocks-are-pointers-2026-09-11))

## workbench 0.43.1: 2026-09-24

- **Epic assignments stay tied to approved scope.** The owner checks governing criteria and amendments before delegation and recovery; its own backlog or continuation packet cannot add obligations. Relevant integration changes invalidate affected evidence, while unrelated changes add no qualification work. ([decision](decisions/epic-orchestration.md#scope-membership-precedes-technical-validity-2026-09-24))
- **Lanes receive outcomes and concise amendments.** Initial contracts stay complete, amendments carry only changes, and implementation methods, conforming PR titles and conflicts within settled contracts belong to the lane. `file-pr` follows the same conflict boundary. Every final handback still contains the populated shared report. ([epic contracts](decisions/epic-orchestration.md#contracts-leave-implementation-choices-to-the-lane-2026-09-24), [merge resolution](decisions/file-pr.md#settled-contracts-govern-merge-resolution-2026-09-24))
- **Independent validation fits the claim.** Regression fixes need defect-sensitive evidence; preservation work may use equivalence and passing characterization with RED marked not applicable. Closure depends on acceptance evidence and a corroborated blind audit, not a predicted number of rounds. ([decision](decisions/epic-orchestration.md#contracts-leave-implementation-choices-to-the-lane-2026-09-24))
- **Epic handoffs preserve the current delivery gates.** Review follow-ups continue while converging and return to the owner when they stop; records survive handoffs and delivery. Reports include the comment trim and encoding offers, which remain operator decisions. ([review authority](decisions/epic-correction-review-authority.md#the-owner-decides-only-when-review-stops-converging-2026-09-24), [trim handoff](decisions/epic-orchestration.md#lanes-trim-before-their-completion-review-2026-09-24))

## workbench 0.43.0: 2026-09-24

- **`trim-comments` joins the delivery process.** Once the full agreed work set is verified and about to ship, the session dispatches the new `comment-trimmer` agent, then runs the review round on the trimmed diff. Like the reviews, the trim is default-on: only your explicit decline or a repo process that supersedes it skips it, and it never fires on its own mid-implementation. You can still invoke it directly; either way it scopes to the diff against the merge base plus untracked files (`git ls-files --others --exclude-standard`). It edits code comments only (never PR, review or issue comments, commit messages or Markdown docs), changes no code and never commits. ([decision](decisions/trim-comments.md#moved-into-workbench-as-a-delivery-stage-2026-09-24))
- **Both reviewers read the trimmed revision.** `code-quality-reviewer` now reads the working tree against the merge base, untracked files included, as `test-quality-review` does, so trim edits left uncommitted are reviewed. Where the work is already delivered as commits (an epic lane, or a session that committed under its existing authority), the session commits the trim as its own comment-only commit before the round, and a lane's range includes it; nothing is committed without that authority. A correction batch is not re-trimmed, and a late trim keeps the round's coverage. ([decision](decisions/trim-comments.md#moved-into-workbench-as-a-delivery-stage-2026-09-24))
- **`comment-trimmer` is dispatched, pinned and fresh.** Opus at `xhigh` on Claude Code and `gpt-6-sol` at `xhigh` on Codex, spawned without the parent's history, in `model-reference`'s test-quality exception, which now names both agents. It copies each file outside the repository before editing it and checks and undoes only against that copy, so your uncommitted code in the same file stays. It ends with `## Trim: DONE`, `NOTHING_TO_TRIM` or `BLOCKED`, restores every file it edited on `BLOCKED`, and a report without that line counts as `BLOCKED`. ([decision](decisions/model-reference.md#the-comment-trimmer-joins-the-test-quality-exception-2026-09-24))
- **Constraint-comment encodings wait for you.** The agent returns its offers (a test, type, runtime check or lint that could replace a "do not remove" comment) and never applies them. At completion the session carries them into the PR-or-merge outline and tells you an approved one takes a follow-up review pass; invoked directly, it asks you right away. `code-quality-review` standard 8 notes an offered comment rather than flagging it again. A declined offer leaves the comment and reports the constraint open. ([decision](decisions/trim-comments.md#moved-into-workbench-as-a-delivery-stage-2026-09-24))
- **`file-pr` requires the trim before a code PR.** Its gate lists the trim before the reviews, with the same outs. `code-quality-review` standard 8 reports what the trim left. ([decision](decisions/file-pr.md#the-gate-adds-the-comment-trim-2026-09-24))
- **Correction review runs until it stops converging, not to a pass count.** A focused follow-up pass on a verified correction now runs without asking, however many passes came before; the pass number is a record, never a limit. `code-quality-review` holds delivery and reports to you (or to the epic owner, for a lane) only when a follow-up closes or narrows none of the blockers it was sent, re-raises a finding the author rejected with evidence without new evidence, or, two passes in a row, raises a new blocker and ends with at least as many open blockers as it was sent; one fix that regresses and gets caught still runs on. On a follow-up the reviewer labels a finding outside its focus (the open blockers, the correction and what it affects) a follow-up unless it proves the change unsafe or incorrect as shipped, so it never blocks or holds delivery. After a hold, the decision restarts automatic passes unless it ends review. A blocker closes only on reviewer confirmation or your explicit waiver. ([decision](decisions/bounded-correction-review.md#convergence-replaces-the-follow-up-pass-count-2026-09-24))

## toolkit 0.13.0: 2026-09-24

- **`dependency-audit`, a user-invoked dependency audit.** It audits a project's dependencies in any ecosystem it detects, workspaces included, never reaching past the checkout (no global installs, and pip only through the project's environment), and changes nothing until it has reported six groups: safe bumps, bumps with caveats (each naming the breaking change and the `file:line` it touches), conflicts (including peer mismatches a masking setting hides), security and health (advisories, and deprecated, archived or unmaintained packages), removal candidates with the searches that came back empty, and what it held back; a group it could not check says "not checked", never "none". A removal candidate's bump stays in its bump group, so keeping the package never skips a fix. It then asks which groups to apply and applies them in batches by risk through the package manager, writing each new version in the entry's own operator and group (an exact pin stays exact, a dev dependency stays dev), with focused checks after each. A breaking batch is fixed at its call sites or reverted, never masked, and an engine floor never rises without your go-ahead. ([decision](decisions/dependency-audit.md#a-user-invoked-dependency-audit-in-toolkit-2026-09-24))
- **`trim-comments` moved to workbench.** Toolkit no longer ships it; it is now workbench's comment-trim delivery stage, run by the `comment-trimmer` agent. Update workbench to 0.43.0 to keep it. ([decision](decisions/trim-comments.md#moved-into-workbench-as-a-delivery-stage-2026-09-24))
