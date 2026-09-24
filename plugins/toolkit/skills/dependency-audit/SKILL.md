---
name: dependency-audit
description: Use when the user asks to audit, bump, upgrade or update a project's dependencies, or to check them for version conflicts, breaking-change caveats, security advisories, deprecated or unmaintained packages, or dependencies that could be removed or replaced. User-invoked only.
disable-model-invocation: true
---

# Dependency Audit

Report first, edit later. Phase 1 is a read-only audit of every direct
dependency, ending in one grouped report and a question: which groups to apply.
Phase 2 applies only the chosen groups, in batches, through the package manager,
with focused checks after each batch. The package manager writes every lockfile
change; never hand-edit a lockfile.

## Scope

The current checkout and its workspace members. Never audit, bump, install or
remove anything in machine-wide state (global, user and system environments):
no `-g`, `--global` or `--user` flags, no system package manager (Homebrew,
apt and the like), and no global tool install. A tool the audit needs but
lacks runs ephemerally (`npx`, `uvx`, `pnpm dlx`, `bunx`) or is reported as
missing. Commands that default to the machine's environment, a bare `pip`
above all, run in the scoped form [ecosystems.md](ecosystems.md) gives, or are
reported as a gap. A disposable copy of the checkout in a temp directory, used
to try a bump or generate a missing lockfile, counts as the checkout and is
deleted afterwards; notes stay in that copy or in the report.

## Before the audit

1. Read the repository's instruction files (`AGENTS.md`, `CLAUDE.md`,
   `CONTRIBUTING.md`) and any update policy (Renovate or Dependabot config,
   pinned tool versions); their rules win over this skill's defaults.
2. Detect every package manager from its manifest and lockfile, and every
   workspace member from the root config. [ecosystems.md](ecosystems.md) maps
   each ecosystem to its detection files, audit commands and apply commands.
   Audit each member; a version shared across members is one decision.
3. Read the manager's config (`.npmrc`, `.yarnrc.yml`, `pnpm-workspace.yaml`,
   `[tool.uv]`) for settings that change resolution, such as
   `legacy-peer-deps` or overrides. Never print or copy a token found there.
4. Run the checks you will use after each batch (install from the lockfile,
   typecheck, build, the tests that cover dependency call sites) once, so a
   later failure is attributable. Report a red baseline; do not fix it here.

## Phase 1: the audit (read-only)

No edits to manifests, lockfiles, config or source until the user picks
groups. Commands that write them (`npm install <pkg>`, `npm audit fix`,
`uv lock --upgrade`, `cargo update` without `--dry-run`) wait for phase 2.
Some read commands also lock by default (`uv tree`, `uv audit`, `cargo tree`,
`bundle check`): run the forms in [ecosystems.md](ecosystems.md), which carry
the flag that stops the write. Report a missing lockfile rather than create
one in the working tree; only a disposable copy may generate one.

1. **Inventory.** For each direct dependency (runtime, dev, optional; each
   workspace member): declared range, locked version, latest the range allows,
   latest overall, and the move classified as patch, minor or major. A `0.x`
   minor counts as major. Transitive packages enter the report only through a
   conflict, duplicate or advisory.
2. **Caveats per bump.** For every major, and every minor or patch whose notes
   flag a breaking change or deprecation, read the changelog, release notes or
   migration guide for every version between current and target. Use the host's
   documentation tool when available (for example Context7), otherwise the
   registry and the repository's releases or `CHANGELOG`. Record what the bump
   breaks here:
   - each changed or removed API, default or output the codebase relies on,
     with its call sites and asserting tests as `file:line` from a grep, or
     "no call site" when none;
   - config file, CLI flag or module format changes the repo's config and
     scripts rely on;
   - engine or runtime floors against the project's declared and CI runtime;
   - peer dependency ranges the new version needs, and the ranges of other
     packages it would violate.

   A bump whose notes you could not read is held back with that reason.
3. **Conflicts.** Peer-dependency mismatches, including ones a setting such as
   `legacy-peer-deps` hides (the manager's read-only peer check in
   [ecosystems.md](ecosystems.md)); duplicate
   versions in the tree; each override, resolution, patch or `replace` entry,
   what it forces, and whether it masks a conflict or is still needed; version
   ceilings another dependency sets that block a bump.
4. **Security and health.** Advisories from the ecosystem's audit tool, with
   the fixed version and whether the declared range reaches it. Deprecation
   notices and any successor they name, the last release date, and whether the
   repository is archived.
   Label a package unmaintained only when it is deprecated, archived, or its
   maintainers say so; otherwise report the dates.
5. **Removal candidates.** A dependency is a removal candidate only when every
   check below comes back empty, and the report cites the searches:
   - imports and requires, including dynamic ones (`import()`, `require` of a
     variable, `importlib`), subpath imports (`pkg/sub`) and type-only imports;
   - scripts, CI jobs, Dockerfiles and task runners that call its binary;
   - config files that name it (plugin and preset lists, `-r pkg/register`
     flags, test runner setup);
   - framework autoloading and entry points (see the ecosystem caveats);
   - other dependencies' peer requirements on it.

   Also flag a heavy dependency used for something trivial that the standard
   library or an existing dependency covers: name its call sites, the
   replacement, and any behavior difference at those call sites.

## The report

Every group appears, with "none" when empty. A group a missing lockfile, tool
or environment kept from being checked says "not checked" and why, never
"none": for example, conflicts and security for a Cargo library that commits
no `Cargo.lock`, where every `--locked` command fails, unless a disposable
copy generated one.

1. **Safe bumps**: patch and minor bumps whose notes show nothing that reaches
   this codebase. Current, target, kind.
2. **Bumps with caveats**: each with the caveat, the source it came from, and
   the code it touches (`file:line`).
3. **Conflicts**: what conflicts, what currently masks it, and the resolution.
4. **Security and health**: each advisory with its severity, affected path,
   fixed version and the bump that reaches it; deprecated, archived or
   unmaintained packages still in use, with the dates and any named
   successor.
5. **Removal candidates**: the evidence for each, and the replacement for a
   trivially used one. A removal candidate's bump stays in its bump group,
   marked as a removal candidate, so keeping the package never skips a fix.
   When both are chosen, the removal wins. Security names the bump as the
   fix and the removal as the alternative.
6. **Held back**: each package left alone, with the reason (unread notes,
   blocked by another package's range, engine floor above the project's
   runtime, repo policy). When the latest version's engine floor is above the
   project's runtime, offer the newest version whose floor fits, in its bump
   group, and hold back only the versions above it.

Then ask which groups to apply. When the invocation already named them ("bump
all patch and minor"), restate that selection and go on to phase 2.

## Phase 2: applying the chosen groups

1. Batch by risk: one batch for the chosen patch and minor bumps; one batch per
   major or per coupled group that must move together (a framework and its
   plugins, a package and its `@types`); one batch per removal or replacement.
   When a package's removal and its bump are both chosen, skip its bump.
2. Apply each batch with the manager's own commands (see
   [ecosystems.md](ecosystems.md)), writing each target in its entry's
   existing operator, bounds and group: exact pins stay exact, `>=3.6,<4`
   becomes `>=3.7,<4`, not `>=3.7`, and a dev dependency stays one.
3. After each batch, run the focused checks from the baseline: install from the
   lockfile, typecheck, build, and the tests that cover the touched call sites.
   Leave full suites to CI unless the repository or the user requires a local
   run.
4. A batch that breaks is fixed at the call sites its notes named, or reverted
   by restoring the manifest and lockfile and reinstalling. Never paper over it
   with `--force`, `--legacy-peer-deps`, a type or lint suppression, a skipped
   test, or an override (see Boundaries). Change a test's expected value only
   for a behavior change the report named and the user chose with that batch.
5. Report per batch: each package's from and to, packages the lockfile added or
   removed, call-site fixes, and each check command with its result.

Commit, push or open a PR only when authorized, through the repository's
delivery process. When workbench is installed, that is its delivery flow: the
comment trim and review round on the finished diff, then `file-pr`, where one
concern per PR usually gives a major bump or a removal its own PR.

## Boundaries

- Change a declared range only to an approved target. Never widen one (to
  `>=`, `*` or a looser operator), raise the project's own engine or runtime
  floor (`engines`, `requires-python`, `rust-version`, the `go` directive), or
  turn on a masking setting without naming it in the report and getting the
  go-ahead.
- An override, resolution or patch is only ever proposed in the report, with
  a go-ahead, never used to rescue a failing batch.
- No publishing (`npm publish`, `cargo publish`, `gem push`, `twine upload`),
  and never read out, change or copy registry credentials.

## Common mistakes

| Mistake | Instead |
| --- | --- |
| Running `uv tree` or `cargo tree` bare in the audit; each can rewrite the lockfile | `uv tree --frozen`, `cargo tree --locked` |
| `npm install <pkg>@<version>` on an exact or `~` entry; npm saves `^<version>` | `-E` for an exact entry, the full `~` spec otherwise |
| `uv add`, `cargo add`, `poetry add` or `composer require` on a dev entry with no group flag; it lands in runtime dependencies, or Cargo writes a duplicate | The entry's group flag from ecosystems.md (`--dev`, `--group <name>`) |
| "No call site" with no search behind it | Name the grep pattern, so the user can rerun it |
| Treating a `knip` or `depcheck` hit as a removal | A lead; it still needs every step 5 search, cited |
| Silencing an `ERESOLVE` with `--legacy-peer-deps` | Move the coupled pair (`react` with `react-dom`) in one batch |
| Editing the lockfile to pin a transitive version | Bump the parent that pulls it in (`npm explain <pkg>` names it) |
