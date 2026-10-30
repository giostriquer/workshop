# dependency-audit: decisions in force

Rationale for Toolkit's dependency upkeep skill. The
[canonical skill](../../plugins/toolkit/skills/dependency-audit/SKILL.md) owns the
procedure; its [ecosystem reference](../../plugins/toolkit/skills/dependency-audit/ecosystems.md)
owns package-manager commands.

## A dependency audit in toolkit (2026-09-24)

Dependency upkeep needs code-specific migration analysis, conflict checks,
security findings, and removal evidence. It is occasional work rather than a
mandatory development stage, so it belongs in Toolkit and has no hard
Workbench dependency. The operator directly requested the addition; there was
no earlier substantial-project use recorded for this piece.

## Model invocation (2026-10-30)

The operator requested model invocation for matching dependency work. Remove
the Claude restriction and enable implicit invocation in the Codex policy
sidecar. Explicit invocation remains available; scope and update authorization
still follow the request and the skill's report-first workflow.

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

## Default checkout scope and ecosystem-specific commands

Ordinary dependency upkeep covers the checkout and workspace members. The
incident extension below also covers explicitly requested machine software;
discovering a global tool does not expand a project-only request. Bare Python
and Ruby commands can resolve to shared environments, and some tools install
globally by default. Use the selected environment and its owning updater. A
disposable checkout copy can test a routine bump or generate a missing lockfile
without altering the user's tree; it is not a security sandbox.

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

## Incident response and requested machine software (2026-10-22)

The operator wants reliable, rapid response to supply-chain incidents, including
OS and installed applications. Keep one `dependency-audit` entry point. Add a
conditional incident/machine-software reference rather than a code-review or
general hardening skill. Routine project upkeep retains its existing report and
package-manager rules.

The old workflow had concrete gaps: a mandatory baseline install before advisory
assessment, unconditional encouragement to fetch ephemeral audit tools, an
absolute prohibition on machine inventory, and package-level verification that
did not establish which runtime an application or service actually used. An
ordinary rollback could also restore a known affected version. A named incident
needs a focused affected-asset inventory before any install or execution; it
should not wait for unrelated dependency modernization.

The new path distinguishes affected state from completed remediation. It checks
current primary advisories, exact artifacts and every relevant installed or
active copy. Package audit feeds can lag, a newer release can be withdrawn or
compromised, and package authenticity alone does not establish benign content.
Supported fixed releases and vendor mitigations determine the target. A version
change needs activation and verification through its actual consumer. Certificate
incidents require separate treatment of system, browser and bundled trust stores,
with meaningful failure reasons and a working positive control where a harmless
behavioral probe is available.

The request's approved targets carry forward, including machine updates when
selected. Audit-only requests remain read-only. Update plans name restarts,
reboots, administrative changes and recovery limits; an updater cannot silently
expand a selected batch. Broad hardening, remote changes, credential revocation,
evidence deletion and destructive recovery require their own scope and authority.
Known malicious execution leaves credential and host recovery open even after
the vulnerable package is gone. Independent authorized fixes continue while
unavailable releases or unsupported machines stay explicitly unresolved.

Current official guidance informed these boundaries:

- [npm lifecycle scripts](https://docs.npmjs.com/cli/using-npm/scripts) and
  [audit](https://docs.npmjs.com/cli/commands/npm-audit) document execution and
  advisory/signature checks. Context7 supplied the current CLI implementation;
  suppression flags are not a sandbox for explicit test/build execution.
- [Google's certificate response](https://blog.google/security/protecting-chrome-and-android-users-from-compromised-emudhra-intermediate-ca-certificates/)
  and [Mozilla's response](https://blog.mozilla.org/security/2026/10/20/protecting-firefox-users-following-the-compromise-of-emudhra-intermediate-certificates/)
  distinguish browser-delivered revocation from trust-store consumers.
- [CISA's package-compromise guidance](https://content.govdelivery.com/accounts/USDHSCISA/bulletins/413c7a5)
  distinguishes replacing affected packages from credential and environment
  recovery. Incident-specific fixed versions are intentionally not copied into
  the skill; every invocation must refresh that evidence.

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
