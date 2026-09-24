# file-pr: decisions in force

This note is the rationale for the `file-pr` skill in the `workbench` plugin, which began as `handoff-pr` and was renamed when it took over filing; superseded choices are omitted and git history keeps the originals.

## The PR body is the repo's own template (2026-06-18)

Repos that care about PRs ship a template naming the sections and checklist they want; a skill-invented structure drops that checklist and adds sections nobody asked for. The skill searches, case-insensitively, wherever GitHub honors a template (`.github/`, the repo root, `docs/`) and fills the one found verbatim, preserving headings, order, checkboxes and hidden markers and ticking only verified items. Among several templates it picks by the branch's intent and records why. With none it falls back to a minimal Summary / Ticket / Caveats body; validation provenance and review status enter the PR only through a template's testing field. The body describes the change, not how it was produced, with attribution only where governing instructions require it.

## Discover and run the repo's gates before pushing (2026-06-19)

A PR failed CI on one formatter check because its commits used `--no-verify` and nothing ran the formatter before the push. The skill discovers the repo's gates from its CI workflows, hook config, script targets and contributor docs instead of assuming a toolchain, and runs the fast static checks (format, lint, type-check) separately from the tests against a freshly synced base. After a hook bypass, formatter and linter results are established manually. Results are recorded by kind, so a formatting failure is not mistaken for a type error or a stale base.

## Follow the template, never replace it (2026-06-19)

PRs still carried the fallback's `Summary` / `Ticket` / `Caveats` headings over a present template, because the fallback appeared as a concrete skeleton while template-following was only prose. The search outcome is now recorded (found at a path, or none after searching) before any body is built, the skeleton is labelled a last resort, and a heading check confirms every template heading remains in order and unrenamed. Testing-field evidence is commands with their results, not test-file names, and PR-title and branch-name patterns come from the repo's linter or CI config, never guesses.

## File the PR and see it through (2026-08-11)

Once sessions were fully authorized, `handoff-pr`'s split (packaging a PR for another session to open) became ceremony followed by the same manual tail: open, watch CI, fix, resolve conflicts. The skill now merges the base in before filing (never rebasing published commits or force-pushing), runs the discovered gates and fixes in-scope failures so the tend loop's bounded attempts are not spent on a known-red baseline, then files with `gh pr create` and reports the URL. It tends the PR through the `fix-ci` skill's loop, composed rather than duplicated, reads mergeability from `gh pr view`, and allows two base re-syncs at most. Mechanical conflicts resolve autonomously; semantic collisions and intended-behavior questions end the loop with a report, and the skill never merges. One ticket candidate is linked and several prompt a question; validation provenance lives in the session report.

## The review gate's exemptions are measured (2026-08-20)

The pre-filing review gate shipped with two undefended exemptions, and `writing-skills` answers skipping a known rule under pressure with a prohibition, a rationalization table and red flags. "Trivial" is gone: one exemption is a branch that changes no code, measured on the diff, and the other covers only the revision a completed review actually saw. Nothing else exempts, not a deadline, a waiting reviewer or the user asking for the PR; if the gate cannot be met, the session asks instead of filing. A nine-row table and five red flags name the reasoning that slips past, including an author's careful reading and a self-served pass. The rows are hypotheses drawn from obvious failure modes, not a pressure-tested baseline.

## Conditional architecture diagrams (2026-09-10)

A PR body gets a `## Architecture` section with a Mermaid diagram when one materially clarifies calls, dependencies or data flow between modules, whether those interactions changed or explain the change; localized edits keep their ordinary body. The diagram shows the smallest relevant interaction, derived from the final code and diff, and a template's existing section with that heading is reused in place. It adds no architecture report or artifact skill and leaves validation and delivery gates unchanged.

## Architecture sits with the change description (2026-09-11)

Appending the section after the filled template put the diagram after the verification evidence, where a reader has finished learning what changed. It now follows the template's change-description sections (`Summary`, `What`, `Why` and similar) and precedes the first verification, testing, checklist, release-note or footer section, following `Summary` in the fallback body. Inserting between sections keeps every original heading in order, so the preservation check is unchanged.

## Delegated filers, the split check and the evidenced why (2026-09-24)

A 30-day Claude Code usage audit found 50 of 108 PR creations inside subagents (25 workflow agents, 16 forks, 9 general-purpose), none of which invoked `file-pr`; main-session PRs used it 52 of 58 times. The two worst PR-scope complaints came from delegated filers: a 145-file PR mixing concerns, and eight agreed PRs that became eighteen workflow-filed ones. Every dispatch that will open a PR, to a subagent, fork, workflow agent or epic lane, now names `file-pr`, with the agreed PR plan entry when a plan exists. The rule sits where a dispatching parent reads it: `file-pr`'s description, which now also triggers before such a dispatch, and its body; `using-workbench`'s landing row; and `epic-orchestration`'s delivery authorization, which also scopes the PR to its tickets and implementation range.

The user restated one PR per concern seven times, and `file-pr` had no such check. Step 1 now stops and proposes a split, instead of filing, when the diff goes beyond the agreed PR plan (a PR the plan does not name, or changes outside this PR's entry), or spans unrelated concerns (different motivations, none needed by another) that the plan does not assign to this PR. Per writing-skills' Match the Form to the Failure it is one conditional on an observable predicate; a diff serving one concern files whatever its size. A salvage mode for harvesting fixes from exploratory runs was considered and declined.

A 30-day Codex usage audit found about ten typed complaints in nine sessions about PR text: no why or evidence in the body, a vague description of a very large change, a title about the tracker and lanes instead of the work, a body stale against the diff. The first body rule derived every field "from the branch diff and the ticket, never from 'what we discussed this session'", which steered away from the problem that prompted the change. What changed still comes from the diff; the why states the evidenced problem, the observed defect or need and how it surfaced, and a problem first seen in the session is stated as that evidence rather than as the session's story. The title names what the change does; tracker, lane and ticket bookkeeping are not the change. The stale-body complaint is not addressed here.

Plan-only micro-tests, three fresh Opus contexts per arm (`claude -p`, customizations off, no tools), compared the 0.41.6 wording with this wording. A parent held the skill listing plus the skill it would have loaded; a filer held `file-pr`. The first split wording fired on any unrelated concerns, whatever the plan said, while every run still filed a lane PR whose authorization put two tickets together; the predicate now defers to the plan, and a revised arm re-ran the split and title scenarios.

| Question | 0.41.6 wording | This wording |
|---|---|---|
| The parent's dispatch names `file-pr` (filers dispatched with `using-workbench` or `file-pr` loaded, implement-then-file workflow agents, a background agent from the listing alone) | 12 of 12 | 12 of 12 |
| The parent loads `file-pr` before writing a workflow template or an epic authorization | 0 of 6 | 5 of 6 |
| The dispatch names the PR's agreed plan entry (parent holding `file-pr`; all six limit the agent to one PR for its branch) | 0 of 3 | 3 of 3 |
| The epic authorization names `file-pr` with the PR's tickets and range | 3 of 3 | 3 of 3 |
| Files a branch carrying a retry fix, a billing rename and a CI Node bump as one PR | 3 of 3 | 0 of 3 (0 of 3 revised; every run proposed the three-PR split) |
| Stops before a fourth PR beyond an agreed three-PR plan | 3 of 3 | 3 of 3 |
| Files a 29-file single-concern diff with its supporting extractions, no split | 3 of 3 | 3 of 3 (3 of 3 revised) |
| Files a lane PR whose authorization puts two unrelated tickets together | 3 of 3 | 3 of 3 (3 of 3 revised) |
| The description field states the defect and how it surfaced (a user report and a reproduction held only in the session) | 1 of 3 (two put the reproduction under testing) | 3 of 3 |
| The title is free of lane, epic and ticket bookkeeping (two scenarios, one baited with lane-prefixed commits and branch) | 6 of 6 | 6 of 6 (3 of 3 revised) |

The parent-side control never reproduced the audit's failure: every control dispatch named `file-pr`, so the naming rule rests on the audit, and the probes show only that the new wording costs nothing and adds the plan entry. Title bookkeeping was clean in both arms on Opus; the complaint came from Codex sessions, which these probes did not model. Under this wording, all three session-sourced bodies also recorded a declined 100k-row export cap as a reviewer-relevant decision, which the control dropped as session talk; no body in either arm narrated the session. Three reps per arm is regression evidence for these shapes, not a reliability estimate.
