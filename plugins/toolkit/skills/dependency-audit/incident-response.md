# Security incidents and machine software updates

Use for a named advisory, suspected supply-chain compromise, CA/trust incident,
or an explicit request to audit/patch machine software. Without a named incident,
use current vendor security advisories for the selected assets. Keep routine
project modernization in the main skill.

## Contents

- [Establish evidence without executing suspect code](#establish-evidence-without-executing-suspect-code)
- [Map affected assets and consumers](#map-affected-assets-and-consumers)
- [Present the prioritized action list](#present-the-prioritized-action-list)
- [Apply selected fixes](#apply-selected-fixes)
- [Verify the active consumer](#verify-the-active-consumer)
- [Close with explicit residual exposure](#close-with-explicit-residual-exposure)

## Establish evidence without executing suspect code

Record the request's scope, exclusions and existing update authority. Read the
applicable repository, device-management and update policies before acting.
Use current primary advisories from maintainers, vendors, registries or responsible
security authorities. Record URLs, retrieval time, affected versions/digests,
supported fixed releases or mitigations, and uncertainty. Verify release channel,
platform and distribution: a vendor backport can fix an older version number.
Refresh fast-changing guidance before applying a fix; a blog summary is only a lead.

For malicious releases, also check withdrawn versions and package/artifact
identities. Registry audit output can lag an incident or omit a non-CVE event.
Neither zero advisories, `latest`, semver size, a lockfile hash nor a valid
signature proves benign content. Check authentic origin and the vendor's
incident disposition separately. Do not infer a fix from an unrelated security
release or an unreleased source commit.

Start with trusted OS metadata, manifests, lockfiles, artifact records and
existing logs. Do not execute suspicious binaries, installers, package hooks,
project wrappers or test suites for inventory or baseline. A throwaway directory
does not isolate secrets, filesystem or network access. Do not bootstrap an
unverified `@latest` scanner from the possibly compromised channel. Use a trusted
available tool, a verified isolated route or report the gap. Do not disable TLS
validation to fetch a fix when the incident concerns certificate trust.

When malicious code may have run, preserve installation/execution evidence and
report possible credential or host exposure promptly, without printing secrets.
Do not reproduce the payload or delete evidence/caches for tidiness. Prepare
concrete containment, revocation/rotation and vendor-recovery actions for the
operator. Carry existing authority forward, but a package-update request alone
does not authorize credential changes, process termination or host rebuilding.
An upgrade does not undo prior execution or establish that credentials are safe.

Proceed when the incident facts and safe inventory method are established, or
record the missing evidence while continuing independent safe investigation.

## Map affected assets and consumers

Give each asset a stable ID and record location, installation owner/updater,
platform/channel, version or digest, evidence source, relevant dependency path,
active consumers and remaining uncertainty. Inspect only the requested scope.

| Layer | What to resolve |
| --- | --- |
| Projects | All relevant locked/installed transitive paths, including development, optional, build and test dependencies; workspace members, vendored copies and platform-specific resolutions |
| Runtimes and tools | Actual executable paths, version-manager shims, global/user installations, service/CI configuration and bundled copies; a shell's selected version may differ from the service's |
| Containers and build artifacts | Image/base-image digests, running containers, build inputs and cached copies that can reintroduce the affected artifact; a host update does not patch an image |
| Installed applications | App build/channel and vendor update mechanism; embedded browser engines, runtimes and CA bundles; plugins/extensions when implicated |
| OS and system packages | OS build, security update/backport status, package receipt/owner, managed-device restrictions, trust packages and pending restart/reboot |

Use the actual updater for each installation: OS updater, system package manager,
application updater/store, version manager or project package manager. Discover
the platform and installed tool version, then consult its current official docs
and help before choosing commands. Do not substitute a global package install
for an app's bundled runtime, mix installation owners, or run a blanket upgrade.

For CA incidents, map the **effective trust source per consumer**: OS keychain,
browser revocation/root updates, runtime-bundled store, application bundle or
explicit CA override. Inspect override locations without printing their secrets.
One browser's block or an OS update says nothing conclusive about another store.
Check both clients and in-scope services using an affected certificate chain;
certificate replacement or remote deployment needs its own authority.

Mark each asset **affected**, **unaffected** or **unknown**, with evidence.
Distinguish present-on-disk from installed, executed and currently active.
Inaccessible CI, remote hosts or containers remain unchecked; local metadata
does not prove remote activation. Do not read personal data to fill an inventory.

## Present the prioritized action list

Lead with affected assets and immediate actions; do not wait for unrelated
version freshness checks. For each asset include:

1. Current identity and exposure evidence, with advisory and check time.
2. Exact proposed target or mitigation and its official source. Prefer a
   supported confirmed fix; a safe downgrade/pin can be appropriate when newer
   releases are withdrawn or unconfirmed. Missing fixes stay pending.
3. Compatibility impact, required range/runtime changes, updater and coupled
   changes. Identify all assets an updater will change, not just its headline.
4. Activation effects: service/app restart, reboot, administrative privilege or
   managed-device action; rollback/recovery route and its limitations.
5. Verification through the real consumer and the disposition of any temporary
   mitigation once a permanent fix becomes available.

Apply already-selected targets or bounded security-fix groups after these
checks. Ask only for unresolved scope, newly discovered consequential effects
or unapproved changes. Audit-only requests stop at the list. User absence is
not approval for disruption, trust-store changes or additional assets. Keep
unavailable fixes separate so approved independent ones can proceed.

## Apply selected fixes

Recheck advisory, target identity, current state and authority immediately before
each batch. Use authentic vendor channels and available signature/checksum
verification; do not bypass a failed integrity check. Record what ran and what
changed without credentials. Preserve pre-existing work and configuration.

For project packages, use `ecosystems.md`, preserve declared groups/bounds unless
their change was selected, and regenerate locks through the manager. Prefer the
parent upgrade for an affected transitive dependency; propose a supported
override only with its rationale and explicit selection. For machine software,
use the identified owner/updater with exact selections. If the tool cannot
restrict its transaction to the selected assets, disclose the expansion first.

Rebuild affected distributable images/apps from corrected inputs when in scope;
updating a source lockfile or retagging an image does not replace deployed copies.
Retain evidence before removing confirmed tainted caches/artifacts, and target
only selected entries. Do not run broad cleanup as an incident-response shortcut.

Record safe baseline checks or why they were skipped. Existing unrelated test
failures remain separate from remediation failures; do not block a verified
independent fix on unrelated modernization. A failed batch needs a safe repair,
a known-good fallback or a blocker. Never restore a release known affected by
the incident or disable verification just to make tests green.

No-patch cases can use a current vendor mitigation only within its approved
scope, with the configuration delta, impact and verification made explicit.
Disabling TLS verification is not a mitigation. General firewall, account,
trust-store or hardening policy changes are not implied by an upgrade request.

## Verify the active consumer

Reinventory exact installed artifacts and confirm the running process, service,
application or container uses them. Check configured paths, loaded copies and
pending restart/reboot; a successful updater or a new shell version is only an
installation result. Perform selected activation steps; otherwise report them
pending without claiming the old process is fixed.

Re-run advisory/affected-artifact checks and focused compatibility checks on the
corrected consumer. When a safe incident-specific behavioral check exists, use
it through that consumer as well. Do not execute malware or collect secrets to
prove exposure. Record unavailable or unsafe checks as verification gaps.

For certificate distrust, a harmless controlled probe must reject the affected
chain for the expected certificate/trust reason while an appropriate valid
control succeeds. DNS failure, timeout, proxy denial or both controls failing
is inconclusive. Verify the actual path's proxy and CA configuration, with TLS
verification enabled and no credentials sent to probe endpoints. No trustworthy
probe means report vendor/version evidence and the remaining behavioral gap.

## Close with explicit residual exposure

For every selected asset report **fixed**, **mitigated**, **pending activation**,
**blocked**, or **unverified**, with before/after identity, actions and evidence.
Use **fixed** only when the confirmed correction is installed, active and passes
the applicable checks. **Mitigated** means a verified temporary control is active;
it retains its permanent-fix follow-up. A vendor's fixed-release announcement or
package receipt alone is neither status for an unchecked local consumer.
Keep exposure status separate from action status. Preserve excluded/unchecked
assets, missing releases, mitigation follow-ups and next owner/action in the
report. Final states must distinguish a completed audit from completed fixes.

Known or suspected malicious execution also keeps credential and host-recovery
items open until separately resolved. No clean audit output, successful update
or absence of current indicators certifies that past compromise never occurred.
The result covers the selected assets and checks; it is not a machine-wide
security certification. Scheduled monitoring is a separate requested action.
