# Decision: frontmatter descriptions are plain YAML scalars, validated

**Date:** 2026-08-18

## Status

Implemented.

## Context

Nine `description:` values (seven in shipped plugin files, two in the attic)
contained a colon followed by a space inside an unquoted value. YAML reads
that as a nested mapping and rejects the file ("mapping values are not
allowed in this context"), so hosts failed to load the affected skills and
agent. `scripts/validate-native-plugin.ps1` did not read frontmatter at all,
so the defect shipped in several releases.

## Decision

- Descriptions stay **plain scalars**: no quoting. A value that needs a
  `: ` is reworded (comma, semicolon, or a connecting phrase) so the text
  reads the same and the YAML is unambiguous.
- The validator gains `Assert-Frontmatter`, run over every shipped
  `SKILL.md` and agent `.md`. It rejects an unquoted value that contains
  `: `, ends with `:`, contains ` #`, or starts with a reserved YAML
  indicator, and requires `name` and `description` keys. PowerShell has no
  built-in YAML parser, so the check is shape-based; it covers the flat
  frontmatter the plugins use.

## Consequences

A future description that breaks YAML fails validation locally with a
`file:line` message before it can ship. Attic files stay outside the
validator's scope, matching the existing boundary; the two attic
descriptions were reworded in the same change.
