# dependency-audit

## What it does

`dependency-audit`, in the optional `toolkit` plugin, audits a project's
dependencies and reports before it changes anything. It works in two phases:

| Phase | What it does |
| --- | --- |
| Audit (read-only) | Lists every direct dependency's current, allowed and latest version as a patch, minor or major move. Reads the release notes for each major and for any bump that flags a breaking change, and greps where this codebase calls what changed. Finds peer conflicts (including ones a setting like `legacy-peer-deps` hides), duplicate versions, overrides, advisories, deprecated or archived packages, and dependencies nothing uses. |
| Apply | Only the groups you pick, in batches by risk, through the package manager, with the focused checks after each batch. |

The report always has six groups: safe bumps, bumps with caveats, conflicts,
security and health, removal candidates, and held back. A group it could not
check, for lack of a lockfile, tool or environment, says "not checked" and
why, never "none". Then it asks which groups to apply.

It works across ecosystems: npm, pnpm, Yarn, Bun, pip and pip-tools, uv,
Poetry, Cargo, Go modules, Bundler, Composer, Maven and Gradle, and workspaces
or monorepos in any of them. It uses each ecosystem's own commands, listed in
the skill's `ecosystems.md`. It stays inside the checkout it runs in: no global
or `--user` installs, no system package manager, and pip only through the
project's own environment; a tool it lacks runs through `npx` or `uvx`, or is
reported as missing. A throwaway copy of the checkout in a temp directory,
used to try a bump, counts as the checkout and is deleted afterwards.

It is **user-invoked only** (`disable-model-invocation: true`, plus
`allow_implicit_invocation: false` for Codex). Invoke `/dependency-audit`, or
`$dependency-audit` in Codex, with the scope and anything you already know you
want:

- "Audit the dependencies and tell me what's safe to bump."
- "Bump all patch and minor versions, and list the majors with their caveats."
- "Which of our dependencies can we drop?"
- "Audit `packages/api` only."

## When to reach for it

| The problem | The skill |
| --- | --- |
| Dependencies are behind and you want to know what a bump would cost | `dependency-audit` |
| `npm audit` or Dependabot flagged something and you want the fix in context | `dependency-audit` |
| You suspect dead or oversized dependencies | `dependency-audit` |
| One named package needs a bump you already understand | No skill; run the package manager |
| A bump broke CI and the cause is unclear | [systematic-debugging](systematic-debugging.md) or [fix-ci](fix-ci.md) (workbench) |

## Common questions

**Will it upgrade things as soon as I invoke it?**
No. The audit is read-only: no install, no `npm audit fix`, no lockfile or
manifest change. Read commands that would re-lock by default, such as
`uv tree` or `cargo tree`, run with `--frozen` or `--locked`. It reports first
and asks which groups to apply. If your invocation already said which ("bump
all patch and minor"), it restates the selection and applies it.

**How does it decide a bump is "safe"?**
A patch or minor bump lands under safe bumps when its release notes show
nothing that reaches your code. A major, a `0.x` minor, or any bump whose
notes flag a breaking change goes under caveats. Each caveat names the change,
where the notes said it, and the `file:line` call sites it touches, or says
there are none. If it could not read a bump's notes, the bump is held back
with that reason.

**Why did it stop short of the latest major?**
When the latest version needs a newer runtime than your project declares (its
`engines`, `requires-python`, `rust-version` or `go` directive), it offers the
newest version that fits and holds the rest back with that reason. Raising your
project's own floor is your call; it never does that on its own.

**A package it wants to remove also has a bump. Which one applies?**
The bump stays in its bump group, marked as a removal candidate, so keeping
the package never skips a fix; an advisory on it names the bump as the fix and
the removal as the alternative. Choose only the bump group and the package is
bumped and kept. Choose the removal as well and the removal wins: that
package's bump is skipped.

**Why won't it remove a dependency that nothing imports?**
An import grep is not enough. Before recommending a removal it also checks
dynamic imports, type-only imports, scripts and CI jobs that call the
package's binary, config files that name it, framework autoloading, and other
packages' peer requirements. A package used only through `"clean": "rimraf
dist"` is used. A removal is always a recommendation with the searches cited.

**What about a big library used for one small thing?**
It flags it with its call sites and the replacement, such as `_.uniq(list)`
becoming `[...new Set(list)]`, and notes any behavior difference at those
call sites.

**A bump broke the build. Will it add an override to make it pass?**
No. A broken batch is fixed at the call sites the release notes named, or
reverted. It never papers over a failure with `--force`,
`--legacy-peer-deps`, a suppression or a skipped test. An override, resolution
or patch is only ever proposed in the report, with your go-ahead, never used
to rescue a failing batch.

**Which checks does it run after a bump?**
Your repository's own focused ones: an install from the lockfile, typecheck,
build, and the tests that cover the code the bump touches. The full suite is
left to CI unless your repository or you require a local run.

**Does it edit lockfiles?**
Only through the package manager. It never hand-edits a lockfile, and it
writes each new version in the entry's own operator and bounds: `2.1.2`
becomes `2.1.3`, `~4.17.15` becomes `~4.17.21`, `>=3.6,<4` becomes
`>=3.7,<4`. It also keeps the entry in its group: a dev dependency stays a dev
dependency.

**Does it commit or open the PR?**
Only when you authorize it, through your repository's delivery process. With
workbench installed, that is the comment trim and review round, then
`file-pr`, where a major bump or a removal usually gets its own PR.

**Does it need workbench?**
No. It runs on its own; the workbench delivery flow is used only when it is
installed.

## It's working if

- The report arrives before any manifest or lockfile changes.
- Every major bump in the report names the breaking change and the call sites
  it touches, or says none.
- A peer conflict hidden by a setting such as `legacy-peer-deps` shows up
  under conflicts.
- A deprecated or archived package shows up under security and health, with
  its dates and any successor its notice names.
- Each removal candidate cites the searches that came back empty, and a
  trivially used heavy dependency comes with its replacement.
- After you pick groups, each batch reports what moved and the checks it ran.
- Negative signal: a `package-lock.json` edited by hand, `npm audit fix
  --force` run on its own initiative, an exact pin turned into a `^` range, a
  dev dependency moved into runtime dependencies, a removal backed by an
  import grep alone, or a failing bump made to pass with an override or
  suppression.

## Where it fits

Outside the workbench gates, on your ask. The audit and the chosen bumps are
ordinary work; when workbench is installed, the finished change goes through
its comment trim and review round and lands through `file-pr`.
