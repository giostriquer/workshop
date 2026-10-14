---
name: workbench-drift
description: Use when checking Workshop's adaptations against obra/superpowers, cursor/plugins pstack, or mattpocock/skills, or changing their recorded adoption decisions.
metadata:
  system: workbench
---

# Workbench Drift

Keep the shipped adaptations honest against their upstreams. Each manifest
beside this file records where each piece came from, whether it
was adopted or dropped, and *why*; this skill turns upstream churn into a reviewed
decision instead of a standing merge debt. The division of labor is strict: the
bundled script computes **what changed**; this skill judges **what it means**; the
operator decides **what lands**.

## Trigger

Use when the operator asks to check drift ("check superpowers drift", "anything
new upstream?"), or as a periodic review. Also use when the operator wants to
change a disposition (adopt a previously dropped piece, drop an adopted one).
That requires a manifest edit plus, for adoptions, the port workflow below.

## Workflow

Select the source the user requested; for an all-upstream check run each:

| Source | Manifest | Target policy |
| --- | --- | --- |
| Superpowers | `manifest.json` | Published release tags |
| pstack | `pstack-manifest.json` | Explicit branch tracking; record the exact commit and plugin manifest version |
| Matt Pocock | `mattpocock-manifest.json` | Explicit branch tracking; the adopted baseline postdates the latest published tag |

Use the existing script with the chosen `--manifest` path and an explicitly
repo-local ignored `--cache` directory. Resolve paths relative to this skill;
from the repository root, for example:

```sh
node .claude/skills/workbench-drift/scripts/drift-check.mjs --manifest .claude/skills/workbench-drift/pstack-manifest.json --cache .cache/pstack-drift --json
```

Follow the repository's hook-setup rule for a newly cloned cache. The pstack
and Matt Pocock manifests map carried pieces and explicitly reviewed exclusions,
not their entire older corpora. Other paths remain unmapped and surface when they next change;
never add a catch-all dropped entry that would hide new skills.

1. **Run the script:** `node scripts/drift-check.mjs` (add `--json` when you want
   machine-readable output; `--manifest` / `--cache` to override paths). It
   clones or fetches upstream, diffs `lastReviewed..target` over the watched
   paths, and groups every change by the manifest's dispositions.

   **Release tracking targets the newest published release, not the branch tip.**
   A branch tip is whatever was committed last: half-finished work, experiments,
   things the author has not shipped. Reviewing or mirroring that imports churn
   upstream never stood behind. Commits sitting past the release are reported as
   a count and excluded. If upstream ever stops tagging releases the script stops
   rather than silently falling back; `upstream.track: "branch"` is the explicit
   opt-out. pstack uses that opt-out because its source repository has no
   release tags. Its reported target is a source snapshot, not proof of a
   marketplace release. Read `pstack/.cursor-plugin/plugin.json` at that exact
   commit to record the version; do not guess it from the branch name.
   Matt Pocock also tracks the branch explicitly because the port and approved
   review are newer than its latest release tag. Read `.claude-plugin/plugin.json`
   at the target commit and record the latest published tag separately: a
   `release/v1.3` branch name is not evidence of a published 1.3 version.
2. **Initial-pin mode** (manifest has no reviewed commit yet): the script reports
   coverage: upstream entries vs manifest pieces. Resolve every unmapped entry
   to a disposition with the operator, fix any stale mappings, then set
   `upstream.lastReviewed.commit` to the reported head. No diffs are judged on
   this run.
3. **Judge each review-required block** (changes to adopted pieces). Read the
   diff, not the commit messages. Classify it:
   - **Content improvement**: better technique, fixed error, sharper example in
     material we carry → candidate to adopt.
   - **Pressure tuning**: stronger imperatives, dispatcher coupling, pipeline
     hand-offs → ignore; that is the layer method removed. The piece's recorded
     `adaptations` say what was stripped at port time; drift that re-adds it is
     not an improvement.
   - **Irrelevant to our copy**: upstream restructuring, platform shims,
     references we did not carry → ignore.
4. **Recommend, verdict-first:** for each block, adopt / adapt / ignore with a
   one-line rationale anchored to the diff. Dropped-piece churn is reported as
   the FYI count only, unless a change is so significant it argues for reopening
   a disposition: then say so explicitly and leave the call to the operator.
5. **Apply what the operator approves.** Any *adopted* text passes the adaptation
   filter on the way in (defang imperatives, de-pipeline cross-references, carry
   only needed references, keep the provenance footer): adopting upstream text
   is never a copy. Land it in the piece's `localPath`, and record the new
   adaptation in the manifest entry if it changed.
   **`mirrored` pieces are the exception**: they carry no adaptations by operator
   choice, so there is nothing to judge and no filter to apply. Re-copy the
   upstream tree wholesale, including files it gained or lost. The trade is
   recorded in the piece's manifest entry: fidelity to upstream over local
   correctness, dead cross-references included.
   **Then re-apply that entry's `localDeltas`, if it has any.** A mirrored piece
   may carry a short list of deliberate local divergences; the copy in step 5
   overwrites them, so re-applying is part of the re-mirror, not a follow-up.
   The script prints them under the Re-mirror heading: a re-mirror that ends
   without re-applying them has silently reverted an operator decision. Keep the
   list short: it is a recorded exception, not a reopened fork. If it grows past
   a few lines, the piece wants the `adopted` disposition instead.
6. **Advance the pin.** Only after reviewing every changed path in the watched
   range, including ignores and unmapped changes, set
   `upstream.lastReviewed.commit`. For release tracking, also record the release
   tag. For explicit branch tracking, record the exact source commit
   and its plugin manifest `version`, never a fabricated release tag. A pin
   records review coverage of that range, not adoption or publication of it.
7. **Report:** verdict-first: up-to-date / N changes reviewed (adopted /
   adapted / ignored) / unmapped pieces needing dispositions, with the applied
   edits listed.

## Output

- The drift verdict and the reviewed range (`lastReviewed` → head).
- Per review-required piece: the classification, the recommendation, and, if
  applied, what landed and how it was adapted.
- Dropped-piece churn as counts; any disposition worth reopening flagged.
- Unmapped upstream pieces with a proposed disposition each, awaiting the
  operator.

## Boundaries

- **Never auto-applies upstream changes**: every landing is operator-approved,
  and everything adopted passes the adaptation filter first.
- **Dropped stays dropped** unless the operator reopens it; the skill may argue,
  never act.
- **The pin only moves forward after a completed review.** Never advance it to
  silence a report.
- Judges diffs on evidence: no classification without reading the change.
- Never commits or pushes; the repo's own conventions govern landing.

---

*The workbench system derives from [obra/superpowers](https://github.com/obra/superpowers)
(MIT, Jesse Vincent), adapted per `docs/decisions/workbench-system.md`.*
