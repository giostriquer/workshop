# Decision: conditional screenshots in PR bodies

**Date:** 2026-09-16

**Release:** workbench 0.38.2

## Change and reason

Add a `Screenshots` section to `file-pr` when the diff changes what a user sees
rendered: a new or altered component, page, layout, style, template or
user-facing flow. The trigger is measured on the diff, so frontend-directory
changes that alter only tests, types, data fetching or build config get no
screenshots, and API-only, backend, CLI-text and non-visual changes never do.

Reviewers of a UI change otherwise had to run the branch to see it. The
`ui-demo-video` skill already produces per-scene frames for the model's own
verification; this change carries the human-facing evidence into the PR body
where reviewers meet it. Screenshots come from the real running head (repo run
path, `ui-demo-video` frames or a browser tool), pair before/after when existing
UI changed, live in the session's scratch location and never in the repository.
If the app cannot be run, the section is omitted and the gap is reported.

Placement mirrors the Architecture rule: the exact heading `## Screenshots`,
reused in place when the template already has a screenshots-style section,
otherwise immediately after `## Architecture` when that section is present, and
otherwise in the Architecture position (after the change-description sections,
before verification and footer sections; after `Summary` in the fallback body).

Upload uses `gh`'s native `--attach` on `pr create` / `pr edit` (gh 2.100+).
Because `gh` appends attachments after the body unless the body already
references the file, the body references each file as `![alt](./file.png)`
before the command runs, which keeps the section in position. Alt text
describes the state. A partial upload is repaired with `gh pr edit --attach`,
not by refiling.

## Focused checks

Three fresh-context probes with the revised skill: a rendered change on a
template that has an Architecture section, a CSS-only change on a template
without one, and a frontend-directory diff with no rendered change and no
template. Checked section presence, placement, body references matching the
`--attach` files, and template preservation.
