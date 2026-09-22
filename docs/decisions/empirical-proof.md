# empirical-proof and verification: decisions in force

Rationale for the `empirical-proof` skill and the verification choices it shares with `verification-before-completion`, both shipped by the workbench plugin; superseded choices are omitted, and git history keeps the originals.

## Proof runs at the real artifact, with a counter for each cheat mode (2026-07-03)

Sessions finishing work on a runnable surface kept claiming unearned verification in four ways: a run that never happened, tests or a build reported as runtime proof, a mocked surface, and happy-path-only checks. Each gets a structural counter: nothing counts before a recorded health-check of the right running build, only the real boundary counts (MCP tools through a real client, REST over real HTTP), and a surface without probe scenarios is incomplete. Subagents return evidence in a fixed schema, a verdict without its transcript is void, and the session re-drives every FAIL and at least one PASS per surface. The report leads with `verified`, `broken` or `blocked`; an honest `blocked` beats code-reading "verification". The skill proves one finished change; branch-wide passes belong to `qa-sweep` and premises to `claim-check`.

## A proof attempt changes nothing and proves its own cleanup (2026-07-03)

Baseline runs surfaced further failures: agents fixed the bug mid-verification and reported PASS, faked a missing dependency to pass a boot check, deleted the request log as cleanup, and claimed a server had stopped while it still listened. So an attempt edits neither product code nor setup, its verdict is preserved, and any repair the task already authorizes returns to implementation and earns a fresh proof on the new revision. Every process a proof starts must be shown stopped (port closed, process gone), and logs stay as evidence.

## Generated code is proven through its emitted artifact (2026-08-12)

A code-generator project had no app to boot, and the skill offered no path to the right proof. For a generator, the runnable surface is the emitted artifact: generate via the documented path, then build and drive the output as its real consumer would, with the boot gate applying to that artifact. A build or boot failure is `broken` when evidence attributes it to the emitted artifact; missing credentials, services or verifier capabilities are `blocked`.

## A verification picker instead of merged protocols (2026-08-12)

Choosing among verification-adjacent pieces meant reading several protocols, spending attention for no gain. `using-workbench` carries a picker instead, one line per piece chosen by the work's shape, and the pieces keep separate scopes. `verification-before-completion` is the always-on floor the others deepen, requiring fresh evidence before any done, fixed or passing claim and naming `empirical-proof` as an optional deeper check to offer, not an automatic step. When no frame fits, keep the standard and drop the frame: prove the deliverable the way its consumer would exercise it. Protocols are checkpoints loaded when their moment arrives, not reading assignments.

## Bug-hunting is not this protocol, and launching is in scope (2026-08-12)

A session hunting bugs in an app pulled in this skill, the only one saying "drive the running app", then reported `blocked` after one failed launch. Nothing is under test during a hunt, so the skill now excludes it, and the flow adds no skill for it: hunting is ordinary session work. Launching is now in scope: whatever the project's docs prescribe, a clean retry, and a fresh worktree or clean install are ordinary setup, and `blocked` is the last resort once the documented path is exhausted. Faking dependencies stays forbidden and repairing the machine stays out of scope; the fix separates "don't fabricate" from "don't try twice".

## A repo's completion gate is a standing invitation (2026-08-19)

The skill runs only on the user's ask and is otherwise offered. A session whose repo required booting the real app followed its repo and caught a bug the unit tests missed; a literal reading of the skill would have shipped it. Repo precedence had only ever subtracted flow ceremony; now it runs both ways, so a repo gate requiring the real artifact for this kind of change is the invitation: run it, name the gate, and report the run as satisfying it. The gate must cover the change in hand; a surface merely looking drivable invites nothing.
