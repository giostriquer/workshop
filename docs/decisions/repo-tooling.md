# Repo tooling: decisions in force

Rationale for the repo-local maintenance tooling that ships in no plugin; superseded choices are omitted and git history keeps the originals.

## Mirrored pieces are re-copied wholesale, with recorded local deltas (2026-08-12)

The `workbench-drift` manifest has a `mirrored` disposition, beside `adopted` and `dropped`, for a piece carried byte-for-byte from upstream. `drift-check.mjs` lists mirrored pieces under their own Re-mirror heading, because the dropped bucket would silently ignore their upstream changes, and the skill re-copies the whole tree, gained and lost files included, without the adaptation filter: a partial copy that kept a pointer to a directory it had dropped proved a selective port is itself a fork. A mirrored entry may carry a short `localDeltas` list of deliberate divergences, printed under Re-mirror as re-apply-or-lose, since the re-copy is what destroys them. Past a few lines the piece wants `adopted`; otherwise it becomes a fork maintained in a JSON field. No manifest entry uses the disposition at present.

## Drift is measured against published releases (2026-08-12)

`drift-check.mjs` compares against upstream's newest tag matching `upstream.tagPattern` (default `v*`), dereferenced to its commit, never the branch tip; commits past that release are counted and excluded. A branch tip is whatever was committed last, so reviewing or mirroring it imports half-finished work upstream never stood behind. With no matching tags the script exits non-zero instead of falling back to the tip, which would restore the removed behavior where it is least visible; `track: "branch"` is the explicit opt-out. The reviewed pin lands only on a release and records its tag, because a pin between releases names a state nobody can reconstruct.

## Frontmatter values are plain YAML scalars, validated (2026-08-18)

Skill and agent descriptions stay unquoted plain scalars; a value that needs `: ` is reworded rather than quoted. An unquoted `: ` parses as a nested mapping, so hosts refused to load the affected pieces, and the defect shipped across releases because the validator never read frontmatter. The validator checks every shipped `SKILL.md` and agent `.md`, rejecting an unquoted value that contains `: `, ends with `:`, contains ` #`, or starts with a reserved YAML indicator, and requiring `name` and `description`. With no portable YAML parser available, the check is shape-based over the flat frontmatter the plugins use; the attic stays outside its scope.

## `writing-skills` is repo-local (2026-08-20)

`writing-skills` lives in `.claude/skills/writing-skills/` beside `change-log`, `push`, and `workbench-drift`: tooling the repo runs on itself and ships to nobody. `AGENTS.md` requires it for any skill change. The MIT notice for its superpowers-derived portions sits in the root `LICENSE`, because the obligation follows the code, and it has no `docs/skills/` page, a layer reserved for shipped skills. Shipped skills never name it, since an installed plugin cannot reach a repo-local skill; `self-audit` defers to whatever skill-authoring discipline the environment provides.

## The plugin validator is POSIX sh (2026-09-04)

`scripts/validate-native-plugin.sh` is POSIX `sh`, with `awk` for frontmatter and `node` for JSON, and runs from any working directory. Its PowerShell predecessor could not run on macOS, so it was skipped and a skill-list mismatch went unnoticed; a gate that silently does not execute is not a gate. `node` beats `jq` because the repo already needs node and Git Bash on Windows lacks `jq`; `sh` beats `bash` because macOS ships bash 3.2. The `.ps1` was deleted, since two implementations of one gate drift unseen until they disagree. Checks, messages, and the `native plugin validation ok` line are preserved because decision notes cite that string as evidence, and running the validator stays manual, with no CI.
