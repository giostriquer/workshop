# Remove the onboarding reference bundle

## Direct installation replaces copy-and-adapt onboarding (2026-08-11)

The old `agent-workshop` plugin duplicated agent specs, flattened skill specs,
host wrappers, catalogs, and documentation in a reference bundle. Direct plugin
installation became the adoption path, leaving every source edit to update
copies that adopters did not use. Remove that plugin and its bundle.

Retired pieces remain under `attic/deprecated/`, discovered by no host; active
drafts live in the attic's separate in-progress tier. The [attic index](../../attic/README.md)
records their disposition. Canonical shipped pieces now live in `plugins/`,
with Workbench and Toolkit as separate plugins. Repo maintenance skills live in
`.claude/skills/` and complete `.codex/skills/` mirrors. The
[repository map](../../README.md#repository-map) owns the current layout.

## Installed references must remain reachable

A shipped skill may reference resources inside its own installed payload and
public URLs. Repository-only docs or maintenance tools are not installed with
the plugin, so provenance and rationale links use published URLs when needed.
Do not recreate a reference bundle merely to carry those docs.

The original single-plugin cutover, old host wrappers, and removed catalog paths
are historical. They do not describe the current marketplace or validation.
