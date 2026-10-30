# Muse scope review

Date: 2026-10-30
Status: accepted

## Decision (2026-10-30)

Attempt an independent Muse scope review once at completion alongside the existing
required reviews. It checks the original goal, accepted exclusions, and how the
finished increment advances an outcome or necessary prerequisite. It accepts
bounded partial progress and does not infer missing authorization from a scope
concern. Code structure, mutation testing and contract verification retain their
existing owners.

The user wants to use an already configured Muse subscription. Trust the CLI's
authentication and billing setup; do not inspect credentials or change them.
Always invoke Muse directly. Missing Muse, errors, timeouts, incomplete output or
an unavailable model produce `SKIPPED`, never another provider, an author-served
review, retries, setup work, or a delivery hold. Successful findings are advisory
inputs for evidence-based triage under the existing correction process.

## Shape and evidence

The skill owns the reviewer contract and invocation directions. Prefer a fresh
`muse exec` managed through the host's native shell and process lifecycle: Codex
uses `exec_command` / `write_stdin`; Claude Code uses `Bash`, background completion
and output-file reads. The parent supplies scope and a pinned, bounded source
read set. Muse uses its native read-only file tools and structured-output schema.
The existing Node runner remains an optional packet-only route, selected before
the attempt, not a fallback after failure. Neither route registers a generic
host reviewer: Muse itself must produce the opinion.

A bounded retrospective pilot found useful scope distinctions but no unique core
catch beyond the current contract rubric with equivalent inputs. Its initial
scope prompt over-gated partial increments; the correction explicitly preserves
them. This motivates an additional opinion, not a new required clearance. Native
Muse child results were truncated in the tested build; direct headless reports
were complete. The runner therefore uses the direct CLI route without a nested
reviewer or fallback.

This adds an explicit optional-on-failure exception to the completion review map.
The required code, test and contract review gates remain unchanged. No release or
installation refresh is implied by this implementation.

## Native host invocation (2026-10-30)

The first observed uses completed successfully, but the mandatory runner limited
Muse to evidence selected by the implementer. The operator requested directions
that use the Codex and Claude harnesses directly, comparison with the runner, and
bounded read-only source inspection. The source revision and input fingerprint,
actual successful file reads, complete report, and process completion belong in
the receipt. Native JSON-schema output shapes the report; the parent still
checks its semantics. Invocation failures remain a single recorded skip.

The read-only profile, disabled shell/write/web tools and bounded read contract
preserve the review's non-mutating purpose. An empty preset removes built-in
tools but does not remove configured MCP tools, so it is not described as an
isolation guarantee. The source-reading route permits only the listed local
reads, never MCP services or nested delegation. Source inspection does not
replace execution evidence or certify checks merely reported in the prompt.

A focused comparison ran both routes from actual Codex and Claude Code sessions
on one placeholder CSV scenario per host and route. Packet-only reviews flagged
the unsupported offline claim; both native reviews read the three allowed files
and additionally found the excluded telemetry call in the omitted source body.
All four returned complete reports, and source hashes were unchanged. Separate
injected invocation failures were skipped after one attempt on each host. These
are bounded functional probes, not reliability or performance estimates.

## Direct result envelope (2026-10-30)

Two later native callers first searched top-level `type` or `event` fields and
had to inspect the stream to recover its actual shape. The invocation guidance
now names `payload_type`, the nested `payload` fields for model and tool results,
and the JSON-encoded terminal `text`. This is a reference correction inside the
existing direct route; it adds no required parser script. Process success, tool
bounds, complete schema-valid output and unchanged-source checks still apply.
