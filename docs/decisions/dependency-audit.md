# dependency-audit: decisions in force

Rationale for Toolkit's dependency upkeep skill. The
[canonical skill](../../plugins/toolkit/skills/dependency-audit/SKILL.md) owns the
procedure; its [ecosystem reference](../../plugins/toolkit/skills/dependency-audit/ecosystems.md)
owns package-manager commands.

## A user-invoked dependency audit in toolkit (2026-09-24)

Dependency upkeep needs code-specific migration analysis, conflict checks,
security findings, and removal evidence. It is occasional work rather than a
mandatory development stage, so it belongs in Toolkit and has no hard
Workbench dependency. The operator directly requested the addition; there was
no earlier substantial-project use recorded for this piece.

Explicit invocation starts the skill. Claude Code uses frontmatter and Codex
uses its policy sidecar; Muse's native-loader limitation is recorded in
[plugin surfaces](plugin-surfaces.md#muse-implicit-invocation-hole-accepted-2026-10-14).
A general dependency request can still be ordinary work under the host's rules.

## Report first, then apply chosen groups in batches (2026-09-24)

Separating diagnosis from edits prevents an audit from becoming an unapproved
upgrade. Six report groups make omissions visible: safe bumps, bumps with
caveats, conflicts, security and health, removal candidates, and held-back
packages. An unchecked group names the missing check instead of claiming none.
Existing instructions that select groups carry forward without another question.

Caveats connect release changes to this checkout's call sites, configuration,
assertions, peer requirements, and runtime floors. Missing release evidence
holds the affected bump. Offer a compatible target when the newest release
needs a higher runtime; changing the project's runtime remains a separate choice.

Removal evidence extends beyond imports to scripts, configuration, autoloading,
types, and peer consumers. A candidate retains its available bump, especially
a security fix: a user who keeps the dependency must not lose the update.
When both removal and bump are selected, removal wins.

Apply by risk through the manager, preserving each entry's operator, bounds,
and dependency group. Ordinary install defaults had widened exact or bounded
ranges and moved development packages into runtime dependencies. Lockfiles stay
manager-generated. Focused checks follow each batch; failures require an
in-scope repair or reversal, not a masking flag or an unexplained assertion change.
Delivery follows existing repository authority.

## Checkout scope and ecosystem-specific commands (2026-09-24)

The audit covers the checkout and workspace members, never machine-wide package
state. Bare Python and Ruby commands can resolve to shared environments, and
some tools install globally by default. Use the project's environment, an
allowed ephemeral tool, or a named verification gap. A disposable checkout copy
can test a bump or generate a missing lockfile without altering the user's tree.

The common workflow stays in `SKILL.md`; command differences and runtime caveats
stay in `ecosystems.md`. The initial checks established why those forms matter:

- Some apparent read commands create or rewrite lockfiles. Audit commands need
  frozen or locked behavior; missing state is reported or generated in a copy.
- An advisory tool can audit its own environment instead of the project. Export
  all relevant groups and extras, or target the project's installed packages.
- Resolution settings can hide peer conflicts. Use the manager's strict or
  explanatory check without masking the result.
- A successful build may omit test-only dependencies. Lockfile-faithful checks
  need to cover the dependency groups being evaluated without running full CI.

The reference records the supported command forms. This note intentionally does
not duplicate version-specific CLI recipes.

## Evidence and remaining limits

Synthetic projects exercised the package-manager commands, including stale
lockfiles, exact pins, development groups, hidden peer conflicts, and scoped
Python environments. Tools unavailable during that work were checked from
source and documentation rather than reported as executed.

Fresh consuming-agent scenarios showed that both unguided and skill-guided runs
could find migration and removal issues. The meaningful difference was edit
authority: guided runs reported before applying selected groups. Follow-ups
exposed and corrected lost security bumps for removal candidates and dependency
specifier or group drift. Claude and Codex discovery probes checked their
explicit-invocation controls. These bounded checks do not establish general
reliability or native behavior on every supported host.
