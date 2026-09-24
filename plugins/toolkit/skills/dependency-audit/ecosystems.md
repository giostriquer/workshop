# Ecosystem commands

Commands per package manager for the audit and apply phases. Check the
installed tool's `--help` when a flag is refused: versions differ. A command
marked "if installed" is a plugin or separate tool; the skill's scope says how
to run a missing one.

## Detect

The lockfile names the manager; a `packageManager` field or a tool-version file
names its version. Workspace roots list the members to audit.

| Manager | Manifest and lockfile | Workspaces | Overrides and masking settings |
| --- | --- | --- | --- |
| npm | `package.json`, `package-lock.json` | `workspaces` in the root `package.json` | `overrides`; `.npmrc` `legacy-peer-deps`, `force` |
| pnpm | `package.json`, `pnpm-lock.yaml` | `pnpm-workspace.yaml` | `overrides`, `packageExtensions`, `peerDependencyRules`; `strict-peer-dependencies`, `auto-install-peers` |
| Yarn 1 | `package.json`, `yarn.lock` (no `.yarnrc.yml`) | `workspaces` | `resolutions` |
| Yarn 2+ | `package.json`, `yarn.lock`, `.yarnrc.yml` | `workspaces` | `resolutions`, `packageExtensions` |
| Bun | `package.json`, `bun.lock` or `bun.lockb` | `workspaces` | `overrides`, `resolutions` |
| pip | `requirements*.in` compiled to `requirements*.txt` by pip-tools (header says so), or hand-pinned `requirements*.txt` | one file per app | `-c constraints.txt` |
| uv | `pyproject.toml`, `uv.lock` | `[tool.uv.workspace] members` | `override-dependencies`, `constraint-dependencies` |
| Poetry | `pyproject.toml`, `poetry.lock` | none built in | none built in |
| Cargo | `Cargo.toml`, `Cargo.lock` | `[workspace] members` | `[patch]`; `rust-version` sets the floor |
| Go | `go.mod`, `go.sum` | `go.work` | `replace`, `exclude`; the `go` directive sets the floor |
| Bundler | `Gemfile`, `Gemfile.lock` | none | none built in |
| Composer | `composer.json`, `composer.lock` | path repositories | `replace`, `conflict`; `config.platform`, which fakes the PHP version |
| Maven | `pom.xml`, no lockfile; prefer the `./mvnw` wrapper | `<modules>` | `dependencyManagement`, `<exclusions>` |
| Gradle | `build.gradle(.kts)`, `gradle/libs.versions.toml`, and `gradle.lockfile` when dependency locking is on; prefer the `./gradlew` wrapper | `include` in `settings.gradle(.kts)` | `resolutionStrategy` (`force`), `constraints`, `exclude` |

## Stay inside the checkout

These default to machine-wide state rather than the project. Run the scoped
form, or report the gap.

- **pip:** a bare `pip` acts on whatever interpreter runs it, which without a
  project environment is the machine's global or user Python. Run it only as
  `<venv>/bin/python -m pip`, where `<venv>` is the project's `.venv` or the
  environment its tooling names, never as a bare `pip`. With no project
  environment, audit from the requirements files alone (`uvx pip-audit -r
  <file>`; latest versions from the index with `uvx pip index versions
  <pkg>`, or `uvx --from pip-tools pip-compile --upgrade --dry-run` on a `.in`
  file) and report the missing environment as a gap. Never install into, list
  or audit a global or user interpreter.
- **Poetry:** with `virtualenvs.create` false and no project environment,
  Poetry installs into the machine's Python, and it installs into any
  virtualenv already active. Install only when `poetry env info --path` names
  the project's own environment (its `.venv`, or the project's entry in
  Poetry's virtualenvs directory), or when `virtualenvs.create` is true and no
  other virtualenv is active. The command prints nothing when there is no
  project environment. Never `poetry self add`.
- **uv:** keep to the project's `.venv`; never `uv tool install` or `uv pip
  install --system`.
- **Bundler:** before version 5, `bundle install` installs into the shared
  RubyGems directory (`gem env gemdir`) unless `path` is set. Give the run a
  path inside the checkout (`BUNDLE_PATH=vendor/bundle`), or skip the install
  and report it.
  `gem install`, `gem update`, `gem uninstall` and `gem dependency` act on
  that shared directory: use `bundle` and `Gemfile.lock` instead. `gem info
  -r` only reads the remote index.
- **Composer:** never `composer global`.
- **Go:** never `go install`. `go run golang.org/x/vuln/cmd/govulncheck@latest
  ./...` runs govulncheck without installing it.
- **Cargo:** never `cargo install`. A missing `cargo audit`, `cargo deny`,
  `cargo outdated` or `cargo machete` is reported as missing.
- **Maven and Gradle:** check with `./mvnw -DskipTests verify`, not
  `install`, which copies the artifact into the shared `~/.m2`; never
  `publishToMavenLocal`.
- **npm family:** never `-g`, `yarn global` or `npm link`, which writes a
  global symlink.

## Audit (read-only)

Some read commands lock by default: `uv tree`, `uv audit`, `cargo tree` and
`cargo info` create a missing lockfile and rewrite a stale one, and a dry-run
`cargo update` and `cargo audit` create a missing one, so run `cargo audit`
only when `Cargo.lock` exists. The forms below carry `--frozen` or `--locked`,
which stop the write; with no lockfile they fail, and the missing lockfile is
a finding. A Cargo library that commits no `Cargo.lock` is audited in a
disposable copy where `cargo generate-lockfile` runs, or its groups say "not
checked". On uv, `--locked` in place of `--frozen` also fails when `uv.lock`
has drifted from `pyproject.toml`; report that drift.

| Manager | Outdated | Why it is installed | Tree and duplicates | Advisories |
| --- | --- | --- | --- | --- |
| npm | `npm outdated` (`--workspaces`) | `npm explain <pkg>` | `npm ls --all`, `npm find-dupes` | `npm audit` |
| pnpm | `pnpm outdated -r` | `pnpm why -r <pkg>` | `pnpm list -r --depth Infinity`, `pnpm dedupe --check` | `pnpm audit` |
| Yarn 1 | `yarn outdated` | `yarn why <pkg>` | `yarn list` | `yarn audit` |
| Yarn 2+ | `yarn npm info <pkg> --fields version` per dependency (`upgrade-interactive` is interactive) | `yarn why <pkg>` | `yarn info -AR`, `yarn dedupe --check` | `yarn npm audit -AR` |
| Bun | `bun outdated` (`--filter`) | `bun why <pkg>` | `bun pm ls --all` | `bun audit` |
| pip | `<venv>/bin/python -m pip list --outdated` | `<venv>/bin/python -m pip show <pkg>` (Required-by), `uvx pipdeptree --python <venv>/bin/python -r -p <pkg>` | `uvx pipdeptree --python <venv>/bin/python`, `<venv>/bin/python -m pip check` | `uvx pip-audit -r <file>` |
| uv | `uv tree --outdated --depth 1 --frozen` | `uv tree --invert --package <pkg> --frozen` | `uv tree --frozen` | `uv audit --frozen` where uv has it, else pip-audit (below) |
| Poetry | `poetry show --outdated --top-level` | `poetry show --tree --why <pkg>` | `poetry show --tree` | pip-audit (below) |
| Cargo | `cargo update --dry-run --locked --verbose`, or `cargo outdated` if installed | `cargo tree -i <crate> --locked` | `cargo tree -d --locked` | `cargo audit` or `cargo deny --locked check advisories` if installed |
| Go | `go list -m -u all` | `go mod why -m <module>` | `go mod graph` | `govulncheck ./...` if installed, else through `go run` (above) |
| Bundler | `bundle outdated` | `Gemfile.lock`, which lists each gem's dependencies under it | `Gemfile.lock` | `bundle-audit check --update` if installed |
| Composer | `composer outdated --direct` | `composer why <pkg>`; `composer why-not <pkg> <version>` names what blocks a bump | `composer show --tree` | `composer audit` |
| Maven | `./mvnw versions:display-dependency-updates`, and `versions:display-property-updates` for versions held in properties | `./mvnw dependency:tree -Dverbose -Dincludes=<groupId>:<artifactId>` | `./mvnw dependency:tree -Dverbose` ("omitted for conflict with") | `./mvnw org.owasp:dependency-check-maven:check` if the project uses it |
| Gradle | `./gradlew dependencyUpdates` if the `com.github.ben-manes.versions` plugin is applied | `./gradlew dependencyInsight --dependency <name> --configuration runtimeClasspath` | `./gradlew dependencies --configuration runtimeClasspath` (`->` marks a version resolved upward) | `./gradlew dependencyCheckAnalyze` if the `org.owasp.dependencycheck` plugin is applied |

pip-audit with no arguments audits its own environment, so a bare `pip-audit`
or `uvx pip-audit` reports a false "none". Point it at the project through a
requirements file written to a temp directory, not the checkout, and deleted
afterwards (`uvx pip-audit` runs it without installing it):

- uv: `uv export --frozen --no-emit-workspace --all-extras --all-groups
  --format requirements-txt > <tmp>`, then `uvx pip-audit -r <tmp>`.
  `--no-emit-workspace` leaves out the project and every workspace member,
  whose editable lines pip-audit cannot install; `--all-extras --all-groups`
  keeps optional extras and non-default groups in the audit.
- Poetry: `poetry export --all-groups --all-extras --format requirements.txt
  --output <tmp>` (without both flags it exports the main group only), then
  `uvx pip-audit -r <tmp>`. From Poetry 2, `export` needs
  `poetry-plugin-export`; without it, audit the environment the baseline
  installed: `uvx pip-audit --path <site-packages>`, under the path `poetry
  env info --path` prints, once that path is the project's own environment
  (see Stay inside the checkout).

Gradle with dependency locking writes `gradle.lockfile` only through
`--write-locks` or `--update-locks <group>:<module>`; the commands above leave
it alone.

Registry facts for the health check (deprecation notice, release dates,
repository link, engine and peer ranges): `npm view <pkg> deprecated time
repository engines peerDependencies`, the PyPI JSON API
(`https://pypi.org/pypi/<pkg>/json`), `cargo info <crate> --locked`, `go list
-m -json <module>@latest`, `gem info -r <gem>`, `composer show -a <pkg>`. The
repository host shows whether it is archived.

Masked peer conflicts, read-only:

- npm: `npm install --dry-run --legacy-peer-deps=false` resolves without
  writing and prints any `ERESOLVE` the settings hide.
- pnpm: `pnpm peers check` (pnpm 11 and later) reads the lockfile. On pnpm 10,
  `pnpm install --resolution-only` prints the same issues but rewrites a
  drifted lockfile, so run it on a disposable copy of the checkout.
- Yarn 2+: `yarn explain peer-requirements` lists each peer requirement and
  marks the unmet ones with ✘.
- Composer: `composer check-platform-reqs --lock` checks the locked packages
  against the real PHP, which `config.platform` can hide.

Unused-dependency tools (`knip`, `depcheck`, `cargo machete`, `go mod tidy
-diff`, `mvn dependency:analyze`) produce leads. Each lead still needs the
removal evidence the skill lists; these tools can miss dynamic loading,
binaries called from CI jobs or Dockerfiles, and framework autoloading, and
can flag packages used only through config.

## Apply (phase 2 only)

Write each target in the entry's existing operator and bounds, changing only
the version: `2.1.2` becomes `2.1.3`, `~4.17.15` becomes `~4.17.21`, and
`>=3.6,<4` becomes `>=3.7,<4`. `<spec>` below is that rewritten specifier. On
npm, add `-E` (`--save-exact`) when the entry is exact: npm saves a bare
version as `^<version>`. Keep the entry's group: `--dev` or `--group <name>`
(`--optional <extra>`) on `uv add`, `--group <name>` on `poetry add`, `--dev`
or `--build` on `cargo add`, `--dev` on `composer require`, and the entry's
own field in `npm pkg set` (`devDependencies.<pkg>`). `npm install`, `pnpm
add`, `bun add`, `yarn upgrade` and `yarn up` keep the field on their own.

| Manager | Bump | Remove | Lockfile-faithful install |
| --- | --- | --- | --- |
| npm | `npm install "<pkg>@<spec>"` (`-w <ws>`) | `npm uninstall <pkg>` | `npm ci` |
| pnpm | `pnpm add "<pkg>@<spec>"` (`--filter <ws>`) | `pnpm remove <pkg>` | `pnpm install --frozen-lockfile` |
| Yarn 1 | `yarn upgrade "<pkg>@<spec>"` | `yarn remove <pkg>` | `yarn install --frozen-lockfile` |
| Yarn 2+ | `yarn up "<pkg>@<spec>"` | `yarn remove <pkg>` | `yarn install --immutable` |
| Bun | `bun add "<pkg>@<spec>"` | `bun remove <pkg>` | `bun install --frozen-lockfile` |
| pip-tools | `pip-compile --upgrade-package <pkg>==<version>`, from the project environment or `uvx --from pip-tools` | delete from the `.in` file, recompile | `pip-sync --python-executable <venv>/bin/python` |
| pip, hand-pinned | change the pin in the requirements file (it is the manifest) | delete the line | `<venv>/bin/python -m pip install -r <file>` |
| uv | `uv lock --upgrade-package <pkg>==<version>` inside the declared range; `uv add "<pkg><spec>"` to change the range | `uv remove <pkg>` | `uv sync --locked` |
| Poetry | `poetry update <pkg>` inside the declared range; `poetry add "<pkg>@<spec>"` to change it | `poetry remove <pkg>` | `poetry check --lock`, `poetry install` |
| Cargo | `cargo update -p <crate> --precise <version>` inside the declared requirement; `cargo add "<crate>@<spec>"` to change it | `cargo remove <crate>` | `cargo build --locked` |
| Go | `go get <module>@<version>`, then `go mod tidy` | remove the imports, then `go mod tidy` | `go mod verify`, `go build ./...` |
| Bundler | `bundle update --conservative <gem>` | `bundle remove <gem>` | `BUNDLE_FROZEN=true bundle install`, which fails rather than rewrite `Gemfile.lock`, with the path above |
| Composer | `composer update <pkg> --with-dependencies` inside the constraint; `composer require "<pkg>:<spec>"` to change it | `composer remove <pkg>` | `composer install` |
| Maven | `./mvnw versions:use-dep-version -Dincludes=<groupId>:<artifactId> -DdepVersion=<version> -DgenerateBackupPoms=false`; a version held in a property: `./mvnw versions:set-property -Dproperty=<name> -DnewVersion=<version> -DgenerateBackupPoms=false` | delete the `<dependency>` element | none (no lockfile); `./mvnw -DskipTests verify` resolves `pom.xml` and compiles the tests without running them |
| Gradle | change the version in the build file or version catalog, then, with locking, `./gradlew dependencies --update-locks <group>:<module>` | delete the declaration, then, with locking, `./gradlew dependencies --write-locks` | `./gradlew assemble testClasses`, which fails when resolution differs from `gradle.lockfile` and runs no tests (`assemble` alone misses test-only drift) |

npm saves a range as `^<resolved>` whenever that caret range fits inside it,
so `npm install "semver@>=7.7.2 <8"` writes `^7.8.5`. For such a range, set it
with `npm pkg set "<field>.<pkg>=<spec>"`, where `<field>` is the entry's own
(`dependencies`, `devDependencies`, `optionalDependencies`), and run `npm
install`, which locks the newest version the range allows.

## Ecosystem caveats worth checking

- **npm family:** a major that goes ESM-only breaks `require()` callers on
  runtimes without `require(esm)`; a dropped default export breaks
  `import x from`; `@types/<pkg>` moves with its package.
- **Go:** a major version from v2 on is a new module path (`/v2`), so every
  import changes; the `go` directive of a dependency can raise the project's
  own.
- **Bundler:** Rails' `Bundler.require` loads every default-group gem, so a gem
  with no `require` can still be used; grep for its constants.
- **Python:** the import name can differ from the distribution name
  (`PyYAML` imports as `yaml`, `beautifulsoup4` as `bs4`); pytest and other
  plugins load through entry points without any import.
- **Cargo:** a crate can be used only through a feature flag or a macro
  re-export; check `features` and `#[macro_use]`.
