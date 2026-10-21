# Repo tooling: decisions in force

Rationale for the repo-local maintenance tooling that ships in no plugin; superseded choices are omitted and git history keeps the originals.

## Repo-local discovery and documentation ownership (2026-10-14)

Remove the repo-scoped `wiki-maintainer` definitions from `.claude/agents/`
and `.codex/agents/`. Documentation maintenance stays with the active session
under the repository's existing rules; no global agent or shipped plugin agent
is added or removed. `AGENTS.md` is left unchanged at the operator's request.

Mirror every `.claude/skills/<name>/` folder into `.codex/skills/`, including
scripts, references, manifests, and tests. The previously missing mirrors were
`writing-skills`, `workbench-drift`, and `mine-transcripts`. Canonical edits stay
in `.claude/`; only Codex invocation sidecars are host-specific. The validator
discovers canonical skill folders rather than maintaining another name list,
so newly added skills cannot silently miss the mirror check.

The root README owns installation and the repository map. Plugin READMEs list
their shipped pieces and link their contracts; the handbook routes by task and
explains usage. Workflow diagrams summarize the current specs without a second
decision ledger. Rationale belongs in the owning decision note. Consolidate
older amendments there once release notes no longer need their separate files;
retain release-linked anchors and upstream attribution. This avoids competing
catalogs, copied model scores, and obsolete procedures presented as current.

## Mirrored pieces are re-copied wholesale, with recorded local deltas (2026-08-12)

The `workbench-drift` manifest has a `mirrored` disposition, beside `adopted` and `dropped`, for a piece carried byte-for-byte from upstream. `drift-check.mjs` lists mirrored pieces under their own Re-mirror heading, because the dropped bucket would silently ignore their upstream changes, and the skill re-copies the whole tree, gained and lost files included, without the adaptation filter: a partial copy that kept a pointer to a directory it had dropped proved a selective port is itself a fork. A mirrored entry may carry a short `localDeltas` list of deliberate divergences, printed under Re-mirror as re-apply-or-lose, since the re-copy is what destroys them. Past a few lines the piece wants `adopted`; otherwise it becomes a fork maintained in a JSON field. No manifest entry uses the disposition at present.

## Drift is measured against published releases (2026-08-12)

`drift-check.mjs` compares against upstream's newest tag matching `upstream.tagPattern` (default `v*`), dereferenced to its commit, never the branch tip; commits past that release are counted and excluded. A branch tip is whatever was committed last, so reviewing or mirroring it imports half-finished work upstream never stood behind. With no matching tags the script exits non-zero instead of falling back to the tip, which would restore the removed behavior where it is least visible; `track: "branch"` is the explicit opt-out. For release-tracked sources, the reviewed pin lands only on a release and records its tag, because a pin between releases names a state nobody can reconstruct.

## Frontmatter values are plain YAML scalars, validated (2026-08-18)

Skill and agent descriptions stay unquoted plain scalars; a value that needs `: ` is reworded rather than quoted. An unquoted `: ` parses as a nested mapping, so hosts refused to load the affected pieces, and the defect shipped across releases because the validator never read frontmatter. The validator checks every shipped `SKILL.md` and agent `.md`, rejecting an unquoted value that contains `: `, ends with `:`, contains ` #`, or starts with a reserved YAML indicator, and requiring `name` and `description`. With no portable YAML parser available, the check is shape-based over the flat frontmatter the plugins use; the attic stays outside its scope.

## `writing-skills` is repo-local (2026-08-20)

`writing-skills` lives in `.claude/skills/writing-skills/` beside `change-log`, `push`, and `workbench-drift`: tooling the repo runs on itself and ships to nobody. `AGENTS.md` requires it for any skill change. The MIT notice for its Superpowers-derived portions sits in the root `THIRD_PARTY_NOTICES.md` alongside `LICENSE`, because the obligation follows the code, and it has no `docs/skills/` page, a layer reserved for shipped skills. Shipped skills never name it, since an installed plugin cannot reach a repo-local skill; `self-audit` defers to whatever skill-authoring discipline the environment provides.

**Authoring refinements (2026-10-12).** Adapt Matt Pocock's
[`writing-for-agents`](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/productivity/writing-for-agents/SKILL.md)
into this existing skill: references state the branch that needs them, shared
rules stay inline, a concept's definition and constraints stay together, and
steps end on observable completion criteria. The upstream MIT attribution is in
the root `THIRD_PARTY_NOTICES.md`. This adds no skill or documentation layer and changes no
host layout. Keep the local empirical wording checks and the distinction between
discipline failures and output-shaping failures; upstream's blanket claims about
negation and stronger adjectives are not adopted.

The baseline application probe already preserved conditional loading, grouped
rules, evidence distinctions and authority. These refinements make the authoring
criteria explicit, without a claim of measured improvement. Scenario evidence
stays in local scratch; existing preservation, verification and delivery
requirements remain in force.

A fresh proposed-guidance application also retained those properties and
produced a usable branch-specific excerpt and evidence-graded report. Neither
arm discarded the useful draft or inferred repair/publication authority.
One application per arm supports these scenarios only; it does not establish
a comparative reliability improvement.

## The plugin validator is POSIX sh (2026-09-04)

`scripts/validate-native-plugin.sh` is POSIX `sh`, with `awk` for frontmatter and `node` for JSON, and runs from any working directory. Its PowerShell predecessor could not run on macOS, so it was skipped and a skill-list mismatch went unnoticed; a gate that silently does not execute is not a gate. `node` beats `jq` because the repo already needs node and Git Bash on Windows lacks `jq`; `sh` beats `bash` because macOS ships bash 3.2. The `.ps1` was deleted, since two implementations of one gate drift unseen until they disagree. Checks, messages, and the `native plugin validation ok` line are preserved because decision notes cite that string as evidence, and running the validator stays manual, with no CI.

## Em dashes fail the validator (2026-09-24)

`scripts/validate-native-plugin.sh` fails when a git-tracked text file contains an em dash (U+2014) and prints `file:line` for each hit. Sweeps on 2026-08-16 and 2026-09-23 each cleared the repo, and four commits re-added em dashes in between, so the ban moved from periodic sweeps into the gate. The scan is `git grep -I`: tracked and staged files only, binaries skipped, so an untracked file is checked once it is added. The script builds the character with `printf`, so it never contains one itself, and no allowlist exists because no tracked file needs the character. Outside a git checkout the check fails instead of skipping. It reaches across the whole tracked repo; the mirror check separately covers repo-local skills.

## Scripts run through their interpreter (2026-09-24)

Adopted from superpowers v6.4.1: `writing-skills` runs `node ./render-graphs.js`, and its File Organization section says skill text invokes bundled scripts through their interpreter, never by bare path, because packagers strip executable bits. The repo had the failure: `render-graphs.js` and workbench's `find-polluter.sh` are committed as mode 100644, and both bare calls exited 126. A micro-test filling a script section showed no wording difference (3 of 3 per arm wrote `bash scripts/...`), so the rule rests on the recorded failure; three reps per arm is regression evidence, not a reliability estimate.

## The validator's failure paths are tested (2026-09-24)

`node --test scripts/validate-native-plugin.test.mjs` runs the validator over throwaway copies of what it reads (the script, `plugins/`, marketplaces, repo-local skill trees, and `.gitignore`), each under a fresh `git init` that cannot reach a parent repository or the user's git config. A clean repo only exercises the passing path: an independent test-quality review found four mutants of the invocation-parity and em dash checks that still printed `native plugin validation ok`, namely a relaxed policy regex, a missing sidecar that returned instead of failing, a `git grep -q` that captured no hits, and an exit-status guard that passed outside a checkout. The cases pin each failure, the `file:line` report, the tracked-only scope of the em dash scan (an untracked file passes), and skills that need no sidecar. They also pin a rule added with them: `disable-model-invocation` is spelled literally `true` or `false`, and any other value fails. The parity check keyed on the literal, so `True` or a quoted `"true"` skipped it silently, although Claude Code reads `True` as true and hides the skill from the model while Codex, without the sidecar, would not. The focused cases run by hand; the helper copies every current repo-local skill so new mirrors are covered.

## The ci-watcher runner's exit paths are tested (2026-10-07)

The harness under `scripts/ci-watcher-harness/` exercises the bundled Node
runner at `plugins/workbench/skills/fix-ci/scripts/watch-ci.mjs`. Its focused
matrix uses controlled GitHub responses and a virtual clock; the optional
mutant runner checks named defects. `template.mjs` is now the source loader,
not a shell-loop template. Earlier bash/zsh loop measurements are historical
and do not describe current coverage. See the [watcher decision](fix-ci.md).

The mutant runner counts a kill only when every failing test fails by
assertion. `ignore-child-failure` read as unproven because two tests indexed
`failed[0]` and crashed with a `TypeError` on an empty list; the matrix now
checks status and whole name lists, so every named mutant is killed by
assertion. Three further mutants pin evidence a review found unasserted: run
details replacing a stale rollup row, a superseded verdict carrying no old-head
checks, and a merged verdict carrying the rollup. The CLI cases write a
`{"type":"commonjs"}` `package.json` beside the copied fake `gh`, which failed as
an ES module whenever the temp directory sat under this repo's module-typed
`package.json`. The unused shell-era `bin/date` and `bin/sleep` fakes are gone.

## `release` ships plugin changes and refreshes this machine's caches (2026-10-14)

`.claude/skills/release/` (mirrored to `.codex/skills/release/`) is user-invoked only. It versions every plugin with unreleased changes, writes the release notes through `change-log`, pushes through `push`, then updates this machine's Claude Code and Codex installs and checks them. Both hosts install Workshop from GitHub `main` and keep one cache folder per version, so a change pushed without a new version never reaches an installed copy: `claude plugin update` reports the plugin as current and keeps the old files. Releases had been run by hand from a recipe in one host's memory, and a request to "update global caches" meant nothing to a session without it.

The deterministic steps live in `scripts/release.mjs`, the only state-changing host step included. `plan` measures changes from the commit on `origin/main` that set the released version, following first parents so a merged bump resolves to the merge, so an earlier push that skipped the bump still shows as `needs-bump`; a manifest diff that only moves the version is the bump, not a change. `bump` updates every host manifest, including Muse, and rewrites the version text in place, because the manifests are hand-formatted and a JSON round trip rewrites them. `refresh` and `verify-caches` share one reading of each host's installed Workshop plugins: `refresh` updates the marketplace and each user-scope plugin `origin/main` releases, skipping a project- or local-scope install whose folder the run cannot know, and `verify-caches` compares each copy's git object ids with `origin/main`, ignoring the markers hosts and the OS add, and names a Workshop plugin the marketplace no longer lists instead of dropping it. A host whose CLI is missing is skipped, not failed. The release names the shipping paths in both `git add` and `git commit`, so another session's work in the tree, staged or not, does not ride along. Invoking the skill authorizes the bump, the push to `main` and updating installed plugins; it installs and removes nothing. The helper's tests run by hand with `node --test .claude/skills/release/tests/release.test.mjs`, including a check that the Codex copy of `SKILL.md` matches the canonical one. On Windows a CLI installed only as a `.cmd` shim reads as missing, which is unverified.
