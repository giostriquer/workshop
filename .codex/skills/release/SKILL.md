---
name: release
description: Use when the user explicitly invokes release in the Workshop repo, because workbench or toolkit changes are waiting to ship or this machine's global Claude Code and Codex plugin caches lag the pushed plugins. User-invoked only.
disable-model-invocation: true
---

# Release

Ship every plugin with unreleased changes, then bring this machine's global
Claude Code and Codex caches up to the pushed release. Invoking the skill
authorizes what it lists: version bumps, release notes, one commit and push to
`main`, and updating the Workshop plugins this machine already has. It
authorizes nothing else, such as installing or removing a plugin.

Both hosts install Workshop from GitHub `main` and keep one cache folder per
version. A change pushed without a new version never reaches an installed copy:
`claude plugin update` answers "already at the latest version" and keeps the old
files. So every shipped change gets a new version, and the refresh follows the push.

The helper prints JSON:
`node .claude/skills/release/scripts/release.mjs plan | bump <plugin> <x.y.z> | refresh | verify-caches`.

## 1. Sync main

- Run on `main`. On another branch, stop and report: the hosts read `main`.
- `git pull --ff-only origin main`. A failure stops the release.

**Done:** HEAD contains `origin/main`.

## 2. Decide what ships

1. `git status --short`. Changes this session did not make belong to another
   session or to the user: list them and ask once which ship. Do not ask again
   later in the same release. Paths that do not ship stay out of the version
   choice, the notes and the commit.
2. Run `plan`. `changed` lists every file under the plugin that differs from
   `base`, the commit that set the released version, uncommitted work included;
   `commits` lists only the commits since `base`.

| Status | Meaning | Action |
| --- | --- | --- |
| `current` | nothing changed since the released version | none |
| `needs-bump` | files changed and the version did not | choose a version and run `bump` |
| `bumped` | the working version is above the released one | keep it, or raise it if the changes need more |
| `invalid` | the working version is not an x.y.z above the released one | stop and report |
| `new` | the plugin is not on `origin/main` yet | ask the user for its first version, then `bump` |

Choose the version from `git diff <base> -- <source>`. A minor bump is a new
skill, agent or command, or a change to what an existing one requires or
produces by default. A patch is a fix, or a refinement inside an existing
piece's contract. A major bump only when the user asks. When it could be either,
take the patch and name the call in the report. A plugin keeps one unreleased
version: raise an unreleased 0.48.2 in place to 0.49.0, never stack a second one.

If every plugin is `current`, nothing ships: leave the tree as it is and go to step 5.

**Done:** every plugin to ship has a decided version.

## 3. Bump and write the notes

- `bump <plugin> <version>` for each plugin that needs it. It edits the four
  plugin manifests and the marketplace entry, and nothing else.
- Apply the repo `change-log` skill for each new version, dated today. A raised
  version renames its unreleased section. Write the bullets from the diff since
  `base`. Link the decision note the change touched (find it with
  `git diff --name-only <base> -- docs` and `git status --short docs`), at the
  GitHub anchor of its dated heading. A substantive change without a decision
  note gets a bullet with no link, and the report names the gap. No em dashes:
  the validator rejects them.
- A changed shipped skill whose `docs/skills/<skill>.md` page was not updated
  is a gap for the report. The release does not write usage pages.
- `sh scripts/validate-native-plugin.sh` prints `native plugin validation ok`.

**Done:** in `plan`, every plugin that ships is `bumped` or `new` with
`notes: true`, and every other plugin is `current` or changed only in paths
kept out.

## 4. Commit and push

Apply the repo `push` skill on `main`, with two differences:

- Name the shipping files, not their directories, in both commands:
  `git add -- <files>`, then `git commit -- <files>`. A plain commit would also
  take files another session already staged. Check that `git show --stat HEAD`
  lists exactly those files.
- Message as in the history: subject `<fix|feat>(<plugin>|plugins): <what ships>`,
  then one paragraph per released version starting `Release <Plugin> x.y.z`, then a
  line on supporting docs. No trailer.

The leak-scan hooks run on commit and push; when one blocks, replace the flagged
text with a placeholder and commit again, never with `--no-verify`. The repo has
no CI: report CI as absent. A GitHub note that the push bypassed a rule is not a
check result.

**Done:** after `git fetch origin`, `git rev-parse HEAD` equals `git rev-parse origin/main`.

## 5. Refresh this machine's caches

Run `refresh`. For each host with its CLI on `PATH`, it updates the `workshop`
marketplace, then each user-scope Workshop plugin that `origin/main` releases.
A project- or local-scope install is skipped, because it updates from its own
project; report it.

**Done:** exit 0. A `failed` step carries the host's output: report it.

## 6. Verify

Run `verify-caches`. It compares every installed Workshop copy with
`origin/main`, byte for byte, and ignores the markers hosts and the OS add.

| Row status | Meaning |
| --- | --- |
| `match` | the copy is the released version, byte for byte |
| `stale` | the host loads an older version |
| `mismatch` | right version, other bytes: `differing`, `missing`, `extra` |
| `not-released` | installed, but `origin/main` no longer lists it; removing it is the user's call |
| `none` | the host has no Workshop plugin installed |
| `skipped` | the host's CLI is not on `PATH` |

**Done:** exit 0. For a `stale` or `mismatch` row, run `refresh` once more and
verify again. If the row still fails, report it: the refresh is not done.

On Windows the helper is unverified: a CLI installed only as a `.cmd` shim
reads as not on `PATH`.

## Report

- Each plugin: released version and new version, or unchanged, with its
  release-notes section and the minor/patch call.
- The commit and the push result, or why the release stopped and what it changed first.
- Each host and plugin: installed version and `verify-caches` status, including
  `not-released`, `none` and `skipped` rows.
- Gaps: missing decision notes or usage pages, changes kept out, anything not verified.
- Running sessions keep the plugin versions they loaded. Restart Claude Code and
  start a new Codex session to use the update.

## Maintenance

`node --test .claude/skills/release/tests/release.test.mjs` runs the helper's
tests over throwaway repositories and fake CLIs.
