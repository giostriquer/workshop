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
