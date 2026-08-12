---
name: workbench-drift
description: Use when checking the workbench skill set — the workbench plugin's superpowers-derived process skills — against upstream (obra/superpowers), on demand ("check superpowers drift") or on a review cadence. Runs the bundled deterministic diff, then judges each upstream change against the manifest's recorded dispositions and recommends adopt / adapt / ignore, verdict-first. Never auto-applies upstream changes; advances the manifest's reviewed-commit pin only after the review completes; never commits.
metadata:
  system: workbench
---

# Workbench Drift

Keep the **workbench** skill set honest against its upstream. The manifest
(`manifest.json`, beside this file) records where each piece came from, whether it
was adopted or dropped, and *why*; this skill turns upstream churn into a reviewed
decision instead of a standing merge debt. The division of labor is strict: the
bundled script computes **what changed**; this skill judges **what it means**; the
operator decides **what lands**.

## Trigger

Use when the operator asks to check drift ("check superpowers drift", "anything
new upstream?"), or as a periodic review. Also use when the operator wants to
change a disposition (adopt a previously dropped piece, drop an adopted one) —
that is a manifest edit plus, for adoptions, the port workflow below.

## Workflow

1. **Run the script:** `node scripts/drift-check.mjs` (add `--json` when you want
   machine-readable output; `--manifest` / `--cache` to override paths). It
   clones or fetches upstream, diffs `lastReviewed..target` over the watched
   paths, and groups every change by the manifest's dispositions.

   **The target is upstream's newest published release, never the branch tip.**
   A branch tip is whatever was committed last — half-finished work, experiments,
   things the author has not shipped. Reviewing or mirroring that imports churn
   upstream never stood behind. Commits sitting past the release are reported as
   a count and excluded. If upstream ever stops tagging releases the script stops
   rather than silently falling back; `upstream.track: "branch"` is the explicit
   opt-out.
2. **Initial-pin mode** (manifest has no reviewed commit yet): the script reports
   coverage — upstream entries vs manifest pieces. Resolve every unmapped entry
   to a disposition with the operator, fix any stale mappings, then set
   `upstream.lastReviewed.commit` to the reported head. No diffs are judged on
   this run.
3. **Judge each review-required block** (changes to adopted pieces). Read the
   diff, not the commit messages. Classify it:
   - **Content improvement** — better technique, fixed error, sharper example in
     material we carry → candidate to adopt.
   - **Pressure tuning** — stronger imperatives, dispatcher coupling, pipeline
     hand-offs → ignore; that is the layer method removed. The piece's recorded
     `adaptations` say what was stripped at port time; drift that re-adds it is
     not an improvement.
   - **Irrelevant to our copy** — upstream restructuring, platform shims,
     references we did not carry → ignore.
4. **Recommend, verdict-first:** for each block, adopt / adapt / ignore with a
   one-line rationale anchored to the diff. Dropped-piece churn is reported as
   the FYI count only, unless a change is so significant it argues for reopening
   a disposition — then say so explicitly and leave the call to the operator.
5. **Apply what the operator approves.** Any *adopted* text passes the adaptation
   filter on the way in (defang imperatives, de-pipeline cross-references, carry
   only needed references, keep the provenance footer) — adopting upstream text
   is never a copy. Land it in the piece's `localPath`, and record the new
   adaptation in the manifest entry if it changed.
   **`mirrored` pieces are the exception**: they carry no adaptations by operator
   choice, so there is nothing to judge and no filter to apply. Re-copy the
   upstream tree wholesale, including files it gained or lost. The trade is
   recorded in the piece's manifest entry — fidelity to upstream over local
   correctness, dead cross-references included.
6. **Advance the pin.** Set `upstream.lastReviewed.commit` to the reviewed
   release's commit, and `release` to its tag — only after the review completed,
   including the ignores; an advanced pin asserts "everything up to here was
   seen." Land the pin on a release, never on a loose commit: a pin between
   releases cannot be described to anyone, including a later you.
7. **Report:** verdict-first — up-to-date / N changes reviewed (adopted /
   adapted / ignored) / unmapped pieces needing dispositions — with the applied
   edits listed.

## Output

- The drift verdict and the reviewed range (`lastReviewed` → head).
- Per review-required piece: the classification, the recommendation, and — if
  applied — what landed and how it was adapted.
- Dropped-piece churn as counts; any disposition worth reopening flagged.
- Unmapped upstream pieces with a proposed disposition each, awaiting the
  operator.

## Boundaries

- **Never auto-applies upstream changes** — every landing is operator-approved,
  and everything adopted passes the adaptation filter first.
- **Dropped stays dropped** unless the operator reopens it; the skill may argue,
  never act.
- **The pin only moves forward after a completed review** — never advance it to
  silence a report.
- Judges diffs on evidence: no classification without reading the change.
- Never commits or pushes; the repo's own conventions govern landing.

---

*The workbench system derives from [obra/superpowers](https://github.com/obra/superpowers)
(MIT, Jesse Vincent), adapted per `docs/decisions/workbench-system.md`.*
