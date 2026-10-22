# dependency-audit

[Canonical skill](../../plugins/toolkit/skills/dependency-audit/SKILL.md)

## What it does

`dependency-audit`, in the optional `toolkit` plugin, handles routine dependency
upkeep and responses to software security incidents. It reports before changes
and carries forward targets you have already approved.

For routine project upkeep it works in two phases:

| Phase | What it does |
| --- | --- |
| Audit (read-only) | Lists every direct dependency's current, allowed and latest version as a patch, minor or major move. Reads the release notes for each major and for any bump that flags a breaking change, and greps where this codebase calls what changed. Finds peer conflicts (including ones a setting like `legacy-peer-deps` hides), duplicate versions, overrides, advisories, deprecated or archived packages, and dependencies nothing uses. |
| Apply | Only the groups you pick, in batches by risk, through the package manager, with the focused checks after each batch. |

The report always has six groups: safe bumps, bumps with caveats, conflicts,
security and health, removal candidates, and held back. A group it could not
check, for lack of a lockfile, tool or environment, says "not checked" and
why, never "none". Then it asks which groups to apply, unless you already chose.

For a named incident or a requested machine software audit, it follows a focused
path: current official advisories, affected assets, exact fixes or mitigations,
selected updates, and verification through the software actually in use. It can
include runtimes, developer tools, containers, installed applications and the OS
when you request them. A project-only request keeps its project scope.

The incident report distinguishes affected, unaffected and unknown assets. It
tracks fixed, mitigated, pending activation, blocked and unverified results
separately. It does not wait for unrelated dependency modernization before
reporting urgent findings or applying already-approved independent fixes.

It works across ecosystems: npm, pnpm, Yarn, Bun, pip and pip-tools, uv,
Poetry, Cargo, Go modules, Bundler, Composer, Maven and Gradle, and workspaces
or monorepos in any of them. It uses each ecosystem's own commands, listed in
the skill's `ecosystems.md`. Project operations stay in the project's environment;
machine updates use the actual installation owner and its official updater.
Missing tools require a source/version and execution-risk check before use.
During a suspected compromise, static inventory comes before installs or builds:
neither an ephemeral tool nor a throwaway checkout is automatically safe.

It is **user-invoked only** (`disable-model-invocation: true`, plus
`allow_implicit_invocation: false` for Codex). Invoke `/dependency-audit`, or
`$dependency-audit` in Codex, with the scope and anything you already know you
want:

- "Audit the dependencies and tell me what's safe to bump."
- "Bump all patch and minor versions, and list the majors with their caveats."
- "Which of our dependencies can we drop?"
- "Audit `packages/api` only."
- "Check this advisory across my projects, runtimes, installed apps and OS.
  Show affected assets and fixes before changing anything."
- "Apply the selected security fixes, including the listed restart, then verify
  the active applications and services."

## When to reach for it

| The problem | The skill |
| --- | --- |
| Dependencies are behind and you want to know what a bump would cost | `dependency-audit` |
| `npm audit` or Dependabot flagged something and you want the fix in context | `dependency-audit` |
| A malicious release, supply-chain incident or compromised CA may affect your software | `dependency-audit`, with the advisory and desired scope |
| You want OS, application or development-tool security updates checked and applied | `dependency-audit`, explicitly naming that wider scope |
| You suspect dead or oversized dependencies | `dependency-audit` |
| One ordinary package bump is already understood and has no incident context | No skill; run the package manager |
| A bump broke CI and the cause is unclear | [systematic-debugging](systematic-debugging.md) or [fix-ci](fix-ci.md) (workbench) |

## Common questions

**Will it upgrade things as soon as I invoke it?**
An audit request is read-only: no update, `npm audit fix`, lockfile or
manifest change. Routine read commands that would re-lock by default, such as
`uv tree` or `cargo tree`, run with `--frozen` or `--locked`. It reports first
and asks which groups to apply. If your invocation already said which ("bump
all patch and minor"), it restates the selection and applies it.

**Can it respond when the package audit says zero vulnerabilities?**

Yes. A named incident is checked against current primary advisories and exact
installed or locked artifacts, including relevant transitive dependencies.
Advisory feeds can lag, and a CA or malicious-release incident may not appear as
a package vulnerability. A signature establishes origin/integrity evidence;
it does not override a vendor's warning that the release is malicious.

**Does updating the OS fix every application's certificate trust?**

The skill checks each relevant consumer's effective trust source: system store,
browser updates, bundled runtime, application bundle or custom CA override.
It verifies the active executable as well as the installed version. A harmless
distrust test must fail for the expected certificate reason and have a working
valid control; a timeout or DNS failure cannot establish protection.

**What if there is no safe update yet, or an update needs a reboot?**

It reports the missing fix and any current vendor mitigation, including effects
and verification. Already-approved fixes elsewhere continue. Restart/reboot and
administrative effects appear in the selection; approved activation proceeds,
and outstanding activation stays visible. It never substitutes an unsigned
helper, disables TLS verification, or silently expands the updater's transaction.

**What if a malicious package already ran?**

It preserves evidence and identifies possible credential and host exposure.
Replacing the package does not establish recovery. It prepares the concrete
containment, credential and recovery actions still needed, carrying existing
authority forward and asking for actions outside it. Broad code review and
general hardening are separate work.

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
reverted while preserving pre-existing edits. During an incident, it chooses a
safe fallback or reports the blocker; it does not restore a known affected
release or undo a mitigation for green tests. It never papers over a failure with `--force`,
`--legacy-peer-deps`, a suppression or a skipped test. An override, resolution
or patch is only ever proposed in the report, with your go-ahead, never used
to rescue a failing batch.

**Which checks does it run after a bump?**
Your repository's own focused ones: an install from the lockfile, typecheck,
build, and the tests that cover the code the bump touches. The full suite is
left to CI unless your repository or you require a local run. During an incident,
it avoids executing known suspect code for a baseline and tests the corrected
consumer safely. An unsafe or unavailable check is reported as a gap.

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
- A security incident gets a prioritized affected-asset report, with current
  sources, exact targets and explicit unknowns, before unrelated upkeep.
- A machine update is checked through its active consumer; an old running
  process, unpatched container or pending reboot stays visible.
- A missing or withdrawn fix stays blocked; package removal does not silently
  close credential or host-recovery work after malicious execution.
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
