# Skills handbook: usage, with the spec as authority

## Usage pages stay separate from rationale (2026-08-12)

Keep one `docs/skills/<name>.md` page per shipped skill and use
[`docs/skills/README.md`](../skills/README.md) to route by task. These pages
help a reader choose a skill, understand its outputs and side effects, and
recognize success or a limit. Repo-only skills and agents get no separate
usage page.

The previous per-skill documentation repeated origin stories and decisions,
which multiplied maintenance and obscured the executable instructions. Keep
rationale in the owning `docs/decisions/` note, releases in `docs/change-log.md`,
and historical drafts in git. Examples use invented placeholders and claims
come from the current spec, without fabricated feedback or measurements.

When behavior changes, update the usage page in the same change. The canonical
`SKILL.md` and its referenced resources define behavior; a conflicting usage
page is the defect.

## Route to the contract without duplicating it (2026-10-14)

Each usage page links its canonical skill near the title. Use only the sections
that help with that skill; a small reference does not need a repeated workflow,
FAQ, and completion checklist. Put shared workflow orientation in
`using-workbench` and the flow map, and keep detailed execution rules in the
spec. The root README maps repository ownership; plugin READMEs enumerate
payloads; the handbook index maps user tasks. None copies the model score table.

This is repository documentation maintenance. It does not change skill
contracts, require a plugin release, or add a rationale layer to plugin payloads.
