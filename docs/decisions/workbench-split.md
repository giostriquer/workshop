# Decision: split the optional utilities into their own plugin; plugin names swapped

**Date:** 2026-08-11

## Status

Implemented (2026-08-11). `validate-native-plugin.ps1` (two-plugin) passes.
Both plugins ride the uncommitted batch: `workbench 0.20.0` (process core,
same lineage as the former `toolkit`), `toolkit 0.1.0` (utilities, new).

## Context

The process plugin had grown into one payload carrying two kinds of value: the
process-heavy core (review agents, everyday workflow skills, the workbench flow
layer) and artifact-making utilities that are genuinely optional per user.
Every installed skill's listing entry rides in every session's context, so
bundling optional utilities into the process plugin taxes integrators who never
use them. Operator call: split, so the integrating user decides: "that way
it's easier to control token load."

## Decision

**Two plugins, one marketplace, and the names swapped** (operator call, same
day): the workshop metaphor reads truer inverted. A *toolkit* is the grab-bag
of standalone tools you pick up when needed; a *workbench* is where the work
happens.

- **`workbench`** (version lineage `reviewers` → `toolkit` → `workbench`,
  currently `0.20.0`): the process core: five review agents, nine everyday
  skills, and the workbench flow layer (`audit`, `brainstorming`,
  `test-driven-development`, `systematic-debugging`,
  `verification-before-completion`, `receiving-code-review`,
  `using-workbench`).
- **`toolkit`** (new, `0.1.0`): the optional artifact-makers: `doc-to-html`,
  `arch-map`, `ui-demo-video`, `writing-skills`. Expected to grow with future
  optional utilities.

With the swap, the system formerly called **method** is renamed **workbench**
throughout: the plugin and the flow it implements now share one name
(`using-workbench`, `workbench-drift`, `docs/workbench-flow.*`,
`docs/decisions/workbench-system.md`, `metadata.system: workbench` tags).

**`writing-skills` reclassified** (operator call). It leaves the workbench set
because it was always meta-work outside the flow, and its system tag was dropped. Its
superpowers lineage is unchanged: the workbench manifest keeps its `adopted`
entry (localPath `plugins/toolkit/...`) and `workbench-drift` keeps reviewing
its upstream. Attribution follows the text: `toolkit` carries the LICENSE
derived-portions notice and README attribution for `writing-skills`;
`workbench`'s notice covers the five ported flow skills.

Mechanics: three host marketplaces list both plugins; the validator was
generalized to a per-plugin spec table (skills list, agents list or none):
`workbench` = 16 skills + 5 agents, `toolkit` = 4 skills, no agents.

## Boot-cost effect

Listing cost per session (chars/4): workbench ≈ 1,736 tokens; toolkit ≈ 378,
paid only by users who install it. A workbench-only environment boots ~1.8×
lighter than the pre-trim single plugin (≈ 3,166).

## Non-goals

- No behavior changes to any moved skill: the split is packaging.
- The flow is untouched: `writing-skills` never sat on the spine.
- Changelog history keeps names-at-the-time (`reviewers`, `toolkit`) for
  released versions; only the unreleased batch re-keyed.

## Acceptance criteria

- Both payloads validate; marketplaces list exactly `workbench` + `toolkit`;
  `writing-skills` untagged, drift-tracked at its new path; attribution correct
  per plugin; validator green.
