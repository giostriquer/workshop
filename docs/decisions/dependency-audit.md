# dependency-audit: decisions in force

This is the rationale for the toolkit plugin's `dependency-audit` skill;
superseded choices are omitted, and git history keeps the originals.

## A user-invoked dependency audit in toolkit (2026-09-24)

The user asked for a skill to invoke when a project's dependencies need
bumping: check for conflicts, caveats and issues a bump might surface, and
recommend removing a dependency where one is not needed. No shipped piece
covers it. `audit` and `claim-check` investigate a question the user brings,
and neither knows how dependencies break; the workbench delivery flow starts
from a change that already exists.

**Inclusion bar.** `AGENTS.md` asks for lived-in proof from a substantial
project before a piece is added. This one has none recorded in this
repository: the user requested it directly, and that request is the basis for
adding it, as with `test-audit`.

**Toolkit, not workbench.** A dependency audit is occasional upkeep, not a
stage of the process workbench enforces, and every installed skill's listing
costs context. It ships in toolkit and depends on no workbench skill. Its one
mention of workbench is conditional: when workbench is installed, delivery is
its comment trim and review round, then `file-pr`, whose one-concern-per-PR
split usually gives a major bump or a removal its own PR.

**User-invoked only, on every host.** `SKILL.md` sets
`disable-model-invocation: true` and `agents/openai.yaml` sets
`policy.allow_implicit_invocation: false`, since Codex reads only the sidecar
(see [plugin-surfaces](plugin-surfaces.md)). A dependency ask that did not
invoke the skill ("bump lodash") stays ordinary work. The description is a
"Use when" trigger naming the requests and ends "User-invoked only." like the
other user-invoked toolkit skills. The name matches `test-audit`.

**Scoped to the checkout.** The user asked that the audit never reach past the
repository it runs in. It audits, bumps, installs and removes only in the
checkout and its workspace members, never in machine-wide state (global, user
and system environments): no `-g`, `--global` or `--user` flags, no system
package manager, no global tool install, and a tool it lacks runs ephemerally
(`npx`, `uvx`, `pnpm dlx`, `bunx`) or is reported missing. The rule is stated
once, in `SKILL.md`'s scope; `ecosystems.md` lists the commands that default
to the machine and their scoped forms. A disposable copy of the checkout in a
temp directory counts as the checkout and is deleted afterwards, with notes
kept in it or in the report: probe runs use one to try a bump, pnpm 10's peer
check needs one, and a Cargo library with no committed lockfile is audited in
one. The rule is aimed at machine-wide state, so it does not forbid the copy
the skill itself prescribes.

pip was the main leak: it acts on whatever interpreter runs it, and in a
scratch project with no virtualenv both `pip3` and `python3 -m pip` resolved to
the machine's Homebrew Python. It now runs only as `<venv>/bin/python -m pip`
against the project's environment. With none, the audit reads the requirements
files (`uvx pip-audit -r` found the same ten advisories with no `.venv`) and
reports the gap. With a `.venv`, `pip list --outdated`, `pip show`, `pip
check`, `pip install -r`, `uvx pipdeptree --python`, `uvx pip-audit --path`
and `pip-sync --python-executable` all resolved to it, and the machine's
`site-packages` was unchanged afterwards. The Poetry fallback reads the path
`poetry env info --path` prints: the in-project `.venv` when there is one, and
nothing with no environment or with `virtualenvs.create` false, where
Poetry's documentation says it installs into the system Python. The other
machine-wide paths are named and scoped: `gem install` and `gem dependency`
(the shared gem directory, which Bundler before 5 also installs into unless
`path` is set), `composer global`, `go install` (govulncheck runs through `go
run`), `cargo install` (a missing cargo plugin is reported), `mvn install`
and `publishToMavenLocal`, and npm's `-g` and `npm link`.

## Report first, then apply chosen groups in batches (2026-09-24)

The skill has two phases. The audit is read-only and ends in one report with
six fixed groups (safe bumps, bumps with caveats, conflicts, security and
health, removal candidates, held back) and a question: which groups to apply.
An invocation that already names the groups ("bump all patch and minor") skips
the question and restates the selection. Fixed groups make an omission
visible: "none" under conflicts is a claim, where a missing section is not. A
group a missing lockfile, tool or environment kept from being checked says
"not checked" and why, since "none" would claim a check that never ran: a
Cargo library that commits no `Cargo.lock` fails every `--locked` command
(verified on Cargo 1.97.1) unless a disposable copy generates one.

- **Caveats are grounded in this codebase.** For every major, and any minor or
  patch whose notes flag a breaking change, the skill reads the notes for
  every version between current and target, through the host's documentation
  tool when there is one, and greps the changed APIs to `file:line`. A caveat
  without a call site ("check the changelog") tells the user nothing about the
  cost here. A bump whose notes could not be read is held back with that
  reason. Under an engine floor above the project's runtime, the newest
  version that fits is offered in its bump group and only the versions above
  it are held back, as every probe run did for `commander`.
- **Health has a group.** Phase 1 collects deprecations, archived
  repositories and the unmaintained label, so the fourth group is Security
  and health: deprecated, archived or unmaintained packages still in use, with
  the dates and any named successor, beside the advisories.
- **A removal candidate keeps its bump.** Its bump stays in its bump group,
  marked as a removal candidate, so keeping the package never skips a fix.
  When both are chosen, the removal wins and that package's bump is skipped.
  Security names the bump as the fix and the removal as the alternative.
- **Masked conflicts count.** Settings such as `legacy-peer-deps`, `--force`
  and overrides hide peer conflicts from the tree listing. The audit reads the
  manager config and resolves in strict mode as a dry run.
- **Removal needs evidence beyond imports.** A package can be used through a
  script's binary, a config file, framework autoloading, a type-only import or
  another package's peer requirement. A removal candidate needs every one of
  those searches to come back empty, cited in the report; unused-dependency
  tools produce leads, not evidence. A heavy dependency used trivially is
  flagged with its call sites and the standard-library or existing-dependency
  replacement.
- **Apply by risk, through the manager.** One batch for patch and minor, one
  per major or coupled group, one per removal, each followed by the
  repository's focused checks (install from the lockfile, typecheck, build,
  the tests covering the touched code), with full suites left to CI. A
  breaking batch is fixed at the call sites the notes named or reverted; it is
  never made to pass with a masking flag, suppression or skipped test, and an
  override, resolution or patch is only ever proposed in the report, with a
  go-ahead, never used to rescue a failing batch. The package manager writes
  every lockfile change.
- **Targets keep the entry's operator and group.** Each target is written in
  the entry's existing operator and bounds, changing only the version. The
  managers' defaults do not: `npm install <pkg>@<version>` turned an exact
  `2.1.2` into `^2.1.3` and a `~4.17.15` into `^4.17.21`, `uv add
  "<pkg>>=<version>"` replaced `>=3.6,<4` with `>=3.7`, `pnpm update
  <pkg>@<version>` turned `>=7.5.0 <8` into an exact `7.7.2`, and the old
  Poetry, Composer and Cargo templates wrote a caret over exact and bounded
  entries. Each Apply template takes the full specifier instead. The group
  was lost the same way. Without a group flag, `uv add` put a
  `[dependency-groups] dev` entry into `[project.dependencies]` and left the
  dev entry. `cargo add` wrote a second `[dependencies]` entry beside the
  `[dev-dependencies]` one, failed to resolve and left a manifest that no
  longer parses. `poetry add` added to the main group, `composer require`
  moved the entry from `require-dev` to `require`, and `npm pkg set
  dependencies.<pkg>` duplicated a devDependency. A dev tool shipped at
  runtime passes the build and the tests. With the entry's group (`uv add
  --dev`, `--group <name>`, `--optional <extra>`; `poetry add --group`;
  `cargo add --dev` or `--build`; `composer require --dev`; `npm pkg set
  devDependencies.<pkg>` or `optionalDependencies.<pkg>`) each updated the
  entry in place, and `npm install -E`, `pnpm add`, `bun add`, `yarn upgrade`
  and `yarn up` kept the field on their own.

## Ecosystem-neutral, with a command reference (2026-09-24)

The procedure is the same in every ecosystem; only the commands differ. The
skill detects managers from manifests and lockfiles, audits every workspace
member, and keeps per-ecosystem commands (outdated, why, tree and duplicates,
advisories, apply, remove, lockfile-faithful install) in `ecosystems.md`, with
the caveats that differ by ecosystem: ESM-only majors, Go's `/v2` module
paths, Bundler autoloading, Python import names that differ from distribution
names, Cargo features. Commands that need a plugin or separate tool are marked
"if installed", and the skill reports a missing one rather than installing it
globally.

- **Read commands must not re-lock.** Some lock by default. Reproduced on uv
  0.12.17: `uv tree` and `uv audit` created a missing `uv.lock` and rewrote a
  stale one. On Cargo 1.97.1, `cargo tree` and `cargo info` did the same to
  `Cargo.lock`, and a dry-run `cargo update` created a missing one;
  `cargo audit` generates a missing one (its source runs `cargo update
  --workspace`). On Bundler 2.4.22, `bundle check` rewrote `Gemfile.lock`
  when the installed gems satisfied a changed `Gemfile`. The audit forms carry
  `--frozen` or `--locked`, and a missing lockfile is reported, not created.
  The other audit commands left manifest and lockfile alone against a drifted
  manifest on npm 11.17, pnpm 10.26, Yarn 1.22 and 4.18, Bun 1.4, Poetry
  2.5.1, Go 1.27.1, Composer 2.10.3, Maven 3.9.16 and Gradle 9.8.0.
- **pip-audit targets the project.** A bare `uvx pip-audit` audits its own
  tool environment: it reported no vulnerabilities where `-r` over the
  project's export found ten. uv exports its lock to a temp file with
  `--no-emit-workspace`: in a workspace, `--no-emit-project` still emitted `-e
  ./packages/core` and pip-audit failed installing it, where
  `--no-emit-workspace` dropped every member and found the same ten. Poetry
  exports through `poetry-plugin-export`, which Poetry 2 no longer bundles, or
  pip-audit reads the baseline environment's `site-packages`. Both exports add
  `--all-extras --all-groups`: without them uv drops optional extras and
  non-default groups and Poetry exports the main group only, so an advisory
  there would go unreported.
- **Masked peers per manager.** npm's strict dry run, `pnpm peers check` on
  pnpm 11 and later (pnpm 10's `install --resolution-only` prints the same
  issues but rewrote a drifted lockfile), Yarn 2+'s `yarn explain
  peer-requirements`, and Composer's `config.platform`, which fakes the PHP
  version, checked with `composer check-platform-reqs --lock`. pnpm's
  `auto-install-peers` joins its masking settings.
- **Maven and Gradle get full rows.** Each has its own detect, audit and
  apply row through `./mvnw` and `./gradlew`. Maven bumps through the
  versions plugin: `use-dep-version` left a property-held version unchanged,
  so a property takes `set-property`. Gradle with dependency locking writes
  `gradle.lockfile` only through `--write-locks` or `--update-locks`, and
  resolution fails when it drifts from the lockfile. The lockfile-faithful
  checks run no tests, since phase 2 runs only the tests covering the touched
  code. `./mvnw -DskipTests verify` compiled the tests without running a
  failing one and failed on an unresolvable version. `./gradlew assemble`
  caught drift in `implementation` but not drift only in `testImplementation`,
  and neither did `build -x test`; `assemble testClasses` caught both and ran
  no tests.
- **Bundler's faithful install is frozen.** `BUNDLE_FROZEN=true bundle
  install` failed on a drifted `Gemfile.lock` instead of rewriting it, and
  installs when the lock is current; `bundle check` installs nothing and
  re-locks.

Each command above was run in a scratch project. `cargo audit`, `cargo deny`
and OWASP dependency-check were not installed, so their behavior and flags
come from their source and READMEs.

## Probes (2026-09-24)

These are bounded regression evidence, not a reliability estimate. Every run
was a fresh `claude-opus-5-5` context with the user's normal configuration,
working in its own copy of an invented npm `webapp`: a CLI that parses flags
with `commander` 6.2.0 (`program.port` at `src/config.js:12-14`, which v7
removed), declares `engines.node >=18` (commander 14 and 15 need 20 and 22.12),
dedupes tags with `lodash` 4.17.15 (`_.uniq` only, six advisories), carries an
unused `dotenv`, cleans with `rimraf` only through `"clean": "rimraf dist"`,
and pairs `react` 18.2.0 with `react-dom` 17.0.2, a peer conflict hidden by
`legacy-peer-deps=true` in `.npmrc`, with a test asserting react-dom 17's
`data-reactroot` output. Skill runs were told the user had invoked
`dependency-audit` and read the draft; controls got the same request with no
skill. The request was "Go through my dependencies: bump versions, check for
conflicts, caveats and issues that might surface, and recommend removing any
dependency we don't need", then "Apply the safe ones."

| Question | No skill | dependency-audit |
|---|---|---|
| No manifest, lockfile or source write attempted before the report | 0 of 3 | 3 of 3 |
| The commander v7 break named with `src/config.js:12-14` | 2 of 2 | 3 of 3 |
| The masked react / react-dom conflict found (strict dry run) | 2 of 2 | 3 of 3 |
| `dotenv` recommended for removal with the searches cited | 2 of 2 | 3 of 3 |
| `lodash` flagged, `[...new Set()]` named as the replacement | 2 of 2 | 3 of 3 |
| `rimraf` not called unused (its script use found) | 2 of 2 | 3 of 3 |
| `engines.node` and test expectations left alone without a go-ahead | 1 of 2 | 3 of 3 |
| Asked which groups to apply before attempting a change | 0 of 2 | 3 of 3 |
| "Apply the safe ones": only the safe group, through npm, then focused checks | 0 of 1 | 3 of 3 |

The analysis did not separate the conditions: both controls found the same
break, conflict and removal candidates. The workflow did. One control bumped
all seven packages to their latest majors, raised `engines.node` to
`>=22.12.0`, and rewrote the render test's expected value, then asked only
about removals. The other ran `npm install` before reporting and stopped only
because the host's permission check blocked it. A third no-skill sample, the
"update my deps" session below, installed new versions of all seven packages
on its own. Every skill run left the checkout untouched, held commander 14
and 15 back for the engine floor and offered 13.1.0 with the `program.opts()`
fix, and named the `data-reactroot` change as a caveat. Told "Apply the safe
ones", each bumped only its safe group (`ms` 2.1.3, plus `commander` 6.2.1 in
one run) with one `npm install`, kept the caret ranges, and ran `npm ci`, the
build, the config test file and a CLI run. The control, given the same reply,
bumped nothing (installs still blocked) and instead rewrote `src/config.js`,
`src/tags.js` and the `clean` script, preparing removals the user had not
picked. The first row's control count is three samples: two subagents and
the `claude -p` session.

An invocation that names its groups, "Bump all patch and minor versions. Leave
the majors for later.", ran twice with the skill. Both applied `commander`
6.2.1, `lodash` 4.18.1 and `ms` 2.1.3 through npm, left every major, and ran
`npm ci`, the build, the tests, a CLI run and `npm audit` (now clean). One also
bumped `react` to 18.3.1 with react-dom 17 still masked; the other held it back
as half of a coupled pair and asked.

Visibility, checked on the host. Claude Code 2.1.282 with the skill in a
scratch plugin (`--plugin-dir`), `claude -p --model claude-opus-5-5`: asked to
list its invocable skills, the session listed a copy of the skill with
`disable-model-invocation` removed and did not list `dependency-audit` or any
other user-invoked toolkit skill. An unrelated question ("what does
`src/tags.js` do?") made no Skill call. "update my deps" made no Skill call and
went straight to `npm install`; the same ask with only the flag-free copy
installed called that copy's Skill first. An explicit
`/probekitreal:dependency-audit` loaded the skill: the session read
`ecosystems.md` from the skill's folder and left the tree clean. Codex CLI
0.155.1, `codex debug prompt-input "update my deps"` in a scratch repository
holding the skill under `.agents/skills/` twice, with and without
`agents/openai.yaml`: the model-visible skill list holds only the copy without
the sidecar.

Three behaviors were recorded from the probes. The draft's "A removal
candidate is not also offered as a bump" kept `lodash` 4.18.1 out of every full
audit's safe group (`lodash` was a replacement candidate there), so "Apply the
safe ones" left its advisory open; each run said so and named the fallback
bump. The operator chose to keep a removal candidate's bump in its bump
group instead, marked as a removal candidate, so a kept package never misses
a fix, a security fix above all. Under "bump
all patch and minor", both runs skipped `dotenv`'s in-range 8.6.0 as unused and
offered its removal. Two of three audit runs and the explicit session tried
bumps in a throwaway copy outside the checkout to confirm a caveat, and two
runs briefly wrote notes or an npm log outside the project and deleted them;
the skill says nothing about scratch copies. The probes ran the draft before
one wording change: phase 1's "installed packages" became "config", since
every run's baseline reinstalls from the lockfile.

A regression probe followed the review fixes: two fresh `claude-opus-5-5`
subagent runs, same request, then "Apply the safe ones." One copy of the
fixture added an exact-pinned `picocolors` 1.0.0 used in `src/cli.js`, the
other pinned `ms` exact at 2.1.1. The second ran the final skill with the
scope section; the first ran it just before. Both audits left the checkout
untouched. Both carried a Security and health group: lodash's six advisories,
with the bump as the fix and the removal as the alternative, and the
deprecated rimraf 3, with its successor and the deprecated glob 7 and inflight
it pulls in. Both put lodash 4.18.1 in the safe group, marked as a removal
candidate, and held commander 14 and 15 and rimraf 6 back for the engine
floor, offering 13.1.0 and 5.0.10. Told "Apply the safe ones", both closed the
lodash advisory (`npm audit` 0) and kept every caret. The first run bumped
five packages; the second bumped four, installing `ms` with `-E`, and the pin
stayed exact at 2.1.3. The first run put picocolors 1.1.1 under caveats,
since its color detection changed, so it never exercised its exact pin. Both
runs again wrote notes or a trial copy outside the checkout; the scope now
allows that only as a disposable copy in a temp directory, deleted afterwards,
with the notes kept in it.
