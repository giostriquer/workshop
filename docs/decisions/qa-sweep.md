# QA sweep: broad runtime coverage with firsthand corroboration

## Why a separate skill (2026-08-11)

A broad release check can split into independent feature areas, while one
premise or one finished change needs a different scope. `qa-sweep` owns the
team-scale case; `claim-check` owns a premise and `empirical-proof` owns focused
consumer proof. The skill ships in Workbench, with its usage page in the
handbook and its canonical contract in the plugin.

Parallel reports increase coverage but also multiply plausible wrong claims.
The useful mechanism is firsthand corroboration: the lead reproduces findings
that could change the verdict instead of treating agent summaries as proof.

## Decomposition and smoke are prerequisites

Split only when slices are independent or their mutable state can be isolated.
Otherwise inspect inline or establish isolation first. Drive the real artifact;
a substitute needs an evidenced equivalence claim and explicit disclosure.
Try documented authorized setup before dispatch. A boot defect is a product
finding; an unavailable prerequisite leaves the sweep blocked.

Each agent receives the same environment, harness, evidence home, reporting
schema and authority limits, with its own slice. Agents observe runtime behavior
and preserve evidence. They do not silently repair findings or touch production.

## Findings retain their evidence status

The lead reproduces every verdict-moving finding and separates severity from
regression status using a baseline. A low-stakes finding may rest on a captured
artifact. A finding that cannot be reproduced remains uncorroborated or blocked;
only contrary evidence disproves it. Missing coverage stays explicit.

The report gives the verdict, categorized findings, verification basis, gaps,
and unresolved leads. An optional repeatable orchestration workflow cannot
replace the lead's firsthand checks. The canonical skill owns its phase details
and output schema; old onboarding layouts and migration checklists remain in git.

## Scope and authority

Broad QA runs only on an explicit request or standing instruction, including the
team-sweep choice through `audit`. It does not follow automatically from ordinary
completion verification. The sweep ends with its report; separately authorized
repairs can continue afterward without erasing the original findings.
