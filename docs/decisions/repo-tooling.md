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

**Self-consistency corrections (2026-11-09).** A static audit found the skill
arguing with itself and with the validator. `testing-skills-with-subagents.md`
said "Don't test: pure reference skills" while the entrypoint said references
get retrieval tests and "Test before deploying. No exceptions.", and the same
entrypoint called its checklist "MANDATORY for EACH skill" two lines above
"track the checks relevant to this change" and allowed mechanical corrections
to apply directly. The one rule the Evidence section states is kept: a behavior
change is tested before it ships, a mechanical correction is not. The
"Don't test" list and the MANDATORY line are gone. `authoring-format.md` taught
a capitalized `name`, a 1024-character limit on the whole frontmatter and
150/200/500-word targets; the validator requires a lowercase name of at most 64
characters that matches the folder, the 1024 limit belongs to the description,
and every shipped skill exceeds those word targets under the 20,000-byte bound
that replaced them. The template, limits and verification command now match
what is enforced, and a stale `superpowers:` cross-reference names the
workbench skill. Second-level files (`persuasion-principles.md`, the worked
example, the flowchart conventions and renderer) get conditional pointers from
the entrypoint, since a file reached only through another reference tends to be
read in part. The four maintenance sessions that week had already followed the
conditional rule, so this removes a contradiction; it changes no practice.

The validator's mirror check now skips `__pycache__`, and `.gitignore` lists
it: a helper that imported `mine-transcripts`' readers left one beside the
scripts and the gate reported mirror drift
([mine-transcripts](mine-transcripts.md#a-round-ends-at-its-report-and-five-counting-corrections-2026-11-09)).
`scripts/validate-native-plugin.test.mjs` pins both halves: the cache passes,
an unmirrored script beside it still fails.

`workbench-drift` had two stale lines. Its first numbered step repeated the
script as a bare `node scripts/drift-check.mjs`, which clones into the OS temp
directory, against the repo-local ignored `--cache` its own preamble requires;
the step now points at the preamble's command and says to always pass
`--cache`. Its "repository's hook-setup rule" named a rule this repository does
not carry; it now names the operator's always-loaded instructions and states
the one thing that holds everywhere: the cache is an upstream checkout, never
committed in or pushed from.

## The plugin validator is POSIX sh (2026-09-04)

`scripts/validate-native-plugin.sh` is POSIX `sh`, with `awk` for frontmatter and `node` for JSON, and runs from any working directory. Its PowerShell predecessor could not run on macOS, so it was skipped and a skill-list mismatch went unnoticed; a gate that silently does not execute is not a gate. `node` beats `jq` because the repo already needs node and Git Bash on Windows lacks `jq`; `sh` beats `bash` because macOS ships bash 3.2. The `.ps1` was deleted, since two implementations of one gate drift unseen until they disagree. Checks, messages, and the `native plugin validation ok` line are preserved because decision notes cite that string as evidence, and running the validator stays manual, with no CI.

## Em dashes fail the validator (2026-09-24)

`scripts/validate-native-plugin.sh` fails when a git-tracked text file contains an em dash (U+2014) and prints `file:line` for each hit. Sweeps on 2026-08-16 and 2026-09-23 each cleared the repo, and four commits re-added em dashes in between, so the ban moved from periodic sweeps into the gate. The scan is `git grep -I`: tracked and staged files only, binaries skipped, so an untracked file is checked once it is added. The script builds the character with `printf`, so it never contains one itself, and no allowlist exists because no tracked file needs the character. Outside a git checkout the check fails instead of skipping. It reaches across the whole tracked repo; the mirror check separately covers repo-local skills.

## Scripts run through their interpreter (2026-09-24)

Adopted from superpowers v6.4.1: `writing-skills` runs `node ./render-graphs.js`, and its File Organization section says skill text invokes bundled scripts through their interpreter, never by bare path, because packagers strip executable bits. The repo had the failure: `render-graphs.js` and workbench's `find-polluter.sh` are committed as mode 100644, and both bare calls exited 126. A micro-test filling a script section showed no wording difference (3 of 3 per arm wrote `bash scripts/...`), so the rule rests on the recorded failure; three reps per arm is regression evidence, not a reliability estimate.

## The validator's failure paths are tested (2026-09-24)

`node --test scripts/validate-native-plugin.test.mjs` runs the validator over throwaway copies of what it reads (the script, `plugins/`, marketplaces, repo-local skill trees, and `.gitignore`), each under a fresh `git init` that cannot reach a parent repository or the user's git config. A clean repo only exercises the passing path: an independent test-quality review found four mutants of the invocation-parity and em dash checks that still printed `native plugin validation ok`, namely a relaxed policy regex, a missing sidecar that returned instead of failing, a `git grep -q` that captured no hits, and an exit-status guard that passed outside a checkout. The cases pin each failure, the `file:line` report, the tracked-only scope of the em dash scan (an untracked file passes), and skills that need no sidecar. They also pin a rule added with them: `disable-model-invocation` is spelled literally `true` or `false`, and any other value fails. The parity check keyed on the literal, so `True` or a quoted `"true"` skipped it silently, although Claude Code reads `True` as true and hides the skill from the model while Codex, without the sidecar, would not. The focused cases run by hand; the helper copies every current repo-local skill so new mirrors are covered.

Intermittent failures in those tests came from their 20-second limit. Healthy runs took 3 to over 30 seconds on a loaded machine, and all 9 failures across three instrumented suite runs were timeouts. The limit is now a 120-second hang guard, and a timeout fails as a timeout. The timeouts also exposed a real bug: the validator's `TERM` handler cleaned up without exiting, so a killed run continued without its temp dir and exited `1`, indistinguishable from a validation failure. It now exits 143, or 130 on `INT`. (2026-11-04)

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

`.claude/skills/release/` (mirrored to `.codex/skills/release/`) runs when the user asks for a release, never on the agent's own initiative. It was user-invoked only until 2026-10-29, when that gate stopped a session from running a release the user had asked for in plain words; the user's request, not the slash command, carries the authority. It versions every plugin with unreleased changes, writes the release notes through `change-log`, pushes through `push`, then updates this machine's Claude Code and Codex installs and checks them. Both hosts install Workshop from GitHub `main` and key the installed copy by version (Claude Code keeps a folder per version, Codex one folder that each refresh replaces; see the 2026-11-09 correction below), so a change pushed without a new version never reaches an installed copy: `claude plugin update` reports the plugin as current and keeps the old files. Releases had been run by hand from a recipe in one host's memory, and a request to "update global caches" meant nothing to a session without it.

The deterministic steps live in `scripts/release.mjs`, the only state-changing host step included. `plan` measures changes from the commit on `origin/main` that set the released version, following first parents so a merged bump resolves to the merge, so an earlier push that skipped the bump still shows as `needs-bump`; a manifest diff that only moves the version is the bump, not a change. `bump` updates every host manifest, including Muse, and rewrites the version text in place, because the manifests are hand-formatted and a JSON round trip rewrites them. `refresh` and `verify-caches` share one reading of each host's installed Workshop plugins: `refresh` updates the marketplace and each user-scope plugin `origin/main` releases, skipping a project- or local-scope install whose folder the run cannot know, and `verify-caches` compares each copy's git object ids with `origin/main`, ignoring the markers hosts and the OS add, and names a Workshop plugin the marketplace no longer lists instead of dropping it. A host whose CLI is missing is skipped, not failed. The release names the shipping paths in both `git add` and `git commit`, so another session's work in the tree, staged or not, does not ride along. Invoking the skill authorizes the bump, the push to `main` and updating installed plugins; it installs and removes nothing. The helper's tests run by hand with `node --test .claude/skills/release/tests/release.test.mjs`, including a check that the Codex copy of `SKILL.md` matches the canonical one. On Windows a CLI installed only as a `.cmd` shim reads as missing, which is unverified.

### Release reports what each host keeps (2026-11-09)

The skill said both hosts keep one cache folder per version and that running sessions keep the version they loaded. That holds for Claude Code only. Codex keeps a single folder per plugin and `codex plugin add` replaces it, so a release removes the files a running Codex session resolved: 36 missing-file reads in 16 Codex threads followed releases in the week of 2026-11-02, on skill entrypoints, references, an agent file and the bundled CI runner. The skill now states each host's behavior, counts live Codex processes with `pgrep -x codex` before `refresh`, and reports that those sessions need a new session before their next skill, reference or script read. The release still runs: the user's request authorizes the refresh, and deferring Codex would need per-host refresh the helper does not have. `fix-ci` and `ci-watcher` separately re-resolve a vanished runner path from the host's plugin record ([watcher decision](fix-ci.md#stalled-watches-resume-and-dispatches-carry-labelled-inputs-2026-11-09)).

Muse stays outside the helper. `bump` writes the Muse manifest, but `refresh` and `verify-caches` read only Claude Code and Codex, and this machine's Muse install sat several minor versions behind without the report saying so. The skill now reads `muse plugins list --json` and reports each Workshop plugin's installed and released version as not refreshed. Teaching the helper a third host is deferred until Muse updates are wanted from a release.

### `push` commits a named path list (2026-11-09)

`push` still carried its template text: a description that recited the procedure, an instruction to adapt a trailer line, and `git add -A`. No commit in this repository has carried a trailer since 2026-09-09, and `git add -A` takes whatever another session left in the tree, which `release` had to override. Two of the week's four releases also tripped on the override itself: the file list sat in a shell variable that zsh does not word-split, and a plain `git add` refuses a `.codex/` mirror path that a local exclude rule ignores. `push` now has a trigger-only description, writes the change's paths to a list file, and stages and commits with `git add -f --pathspec-from-file=<list>` and `git commit --pathspec-from-file=<list>`, checked on git 2.56 to leave another session's staged file out of the commit. `release` supplies the shipping files as that list. Whether `.codex/` stays in the local exclude is the operator's choice; `-f` makes the recipe work either way.

## Bounded skill entrypoints (2026-10-30)

Adopt the conservative under-20,000-byte SKILL.md guard from Superpowers v7.0.1
(commit `2ce8aa15d05bd57213e6f746f953aafb7ded7a8b`). Recent local compaction
records reattached oversized skills with a 20,000-character truncation marker.
This establishes the truncation mechanism, not its responsibility for any
particular workflow failure. Bytes provide a conservative bound for UTF-8 text.

Move substantial conditional procedures from six oversized entrypoints into
linked skill-local references. Shared authority, work preservation, recovery and
completion rules stay in the entrypoint. Keep the moved procedures intact and
load them at the applicable branch, including after compaction. The affected
pieces are writing-skills, code-quality-review, test-quality-review, file-pr,
handoff-goal and epic-orchestration. This changes packaging, not their gates.

For writing-skills, authoring format/discovery and discipline-specific examples
become conditional references. Its local outcome-based testing and preservation
rules continue to govern upstream examples. One copied red-flag example that
instructed deleting code now calls for preserving work and establishing the
missing defect-sensitive evidence, consistent with the existing core rule. The native validator checks shipped
and repo-local Claude/Codex entrypoints, including new ones. Supporting documents
and parked skills are outside this entrypoint budget. Boundary and UTF-8 tests
exercise the actual CLI; consuming-agent probes check reference retrieval.

The six entrypoints and their moved procedures were exercised in fresh consuming
contexts simulating recovery after compaction: PR drafting, a no-commit handoff
with missing browser access, a bounded correction review, an auditor closeout
and local harness ruling, a mutation follow-up, and a conditional authoring
reference repair. Consumers loaded the applicable references and retained the
authority and evidence boundaries. These are bounded scenario checks, not live
compaction trials or a reliability estimate. Ten shipped procedure extractions
also retain their original text after relative-link and terminal-newline repairs.

## Corrections from the independent review of the 2026-11-09 changes (2026-11-09)

`push` built its path list from `git status --short`, which hides new files
under a locally excluded `.codex/` and collapses new directories, so a new
mirror file never reached the list its `-f` was there to stage. It now reads
`-uall` plus an `--ignored` listing of `.codex`, passes
`--literal-pathspecs` so a path with glob characters cannot match other files,
and checks the commit with `git show --name-only`, which does not truncate
paths. `release` said its list held the files from step 2 "and nothing else",
which read literally leaves out the version bump and release notes; it now
names the files step 3 writes. Its `pgrep -x codex` count included helper
processes and the releasing session, so the report gives it as an estimate of
whether Codex is running. `writing-skills` pointed at a render script that
writes into the skill folder and needs Graphviz; the pointer now says both.
`mine.py` labelled a Codex reviewer named only by its contract header as an
anonymous agent; a header naming one of the six workbench agents now prints as
that role, and any other name stays hashed so default output cannot leak a
private agent's name, each with a test. `push` lists ignored paths under
`.codex/skills` only, so a local Codex config file is never a candidate. A release test that had failed since the Muse manifest was added (it
expected five manifest files, there are six) is corrected.
