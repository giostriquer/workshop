# PR walkthroughs

Use this recipe when an HTML artifact explains a pull request or change set.
The main skill's source integrity, offline packaging, dark initial theme,
accessibility and rendering checks still apply. Creating the walkthrough grants
no PR write, review approval, merge or publication authority.

## Establish the inspected change

Record the repository, actual target/base and head revisions, and whether the
input is a PR, a local diff or a supplied snapshot. Distinguish merge-base diffs
from target-tip comparisons. Bind all counts, explanations and proof to that
same scope. If the head changes while gathering evidence, refresh affected
material or label the artifact as the earlier snapshot.

Obtain the complete changed-file inventory and available patches for that
scope, including additions, deletions, renames, imports, lockfiles and generated
files. Check for pagination, truncation and binary or otherwise unavailable
patches. Keep unavailable files in the inventory with the reason; do not infer
their contents or call a partial patch complete. Supplied excerpts remain
excerpts unless the complete source was retrieved.

## Tell the reviewer what changed

Open with the concrete problem, resulting behavior and material limits. Explain
the before/after trigger or flow when it helps. Separate an author's stated
intent, behavior established by source inspection, and behavior demonstrated by
execution. A test file in the diff is not evidence that its tests passed.

Organize the explanation around the main changes and how supporting edits serve
them. For each central behavior or contract, connect the relevant files to a
short explanation and source excerpt. Use a diagram only when the connections
are easier to understand visually. Label proposed or unverified effects.

Group mechanical changes where useful, with a concrete reason for the grouping.
Imports can alter initialization, registration or execution, and generated
output can be the consumed artifact: inspect their role before classifying them.
An import-only file is not automatically mechanical or irrelevant.

## Make every change inspectable

Provide a complete file index with paths, change types, role in the change and
links to the matching detail. Make counts agree with the inspected inventory.
Core changes may open expanded; supporting detail can start collapsed with a
clear label. Keep every available hunk reachable, including imports. Do not
silently filter source lines or discard files to make the story simpler.

For a large patch, embed a complete diff view or supply a clearly identified
companion diff that is delivered and checked with the artifact. Useful excerpts
may sit beside the explanation, but label them as excerpts and link to the full
provided patch. The default single-file artifact embeds that patch. Keep any
unavailable content and retrieval limits visible in the file index.

Render source as escaped text, never executable HTML or script. Preserve line
content and distinguish added, removed and context lines beyond color alone.
Use readable code, local horizontal scrolling, keyboard-operable expansion and
stable anchors so a reviewer can navigate back to the explanation. Printing
should expose the source and evidence hidden behind controls.

## Keep proof and gaps visible

Tie each consequential claim to the relevant source or result. For executed
checks, show the inspected revision, check and outcome, plus environment or
coverage limits that affect interpretation. Separate unrun tests, reported
results, direct observations, CI, review and merge state. Preserve failed,
skipped and unavailable evidence alongside successful checks.

Before delivery, reconcile the index against the input inventory, inspect a
core change and a collapsed supporting change, and reach their complete source
with the keyboard. Verify dense code and navigation at wide and narrow sizes,
and check print expansion. Reconcile changes after any input refresh. The
walkthrough explains the evidence; it does not confer approval on the PR.
