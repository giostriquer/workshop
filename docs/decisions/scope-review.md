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
Always invoke Muse itself. Missing Muse, errors, timeouts, incomplete output or
an unavailable model produce `SKIPPED`, never another provider, an author-served
review, retries, setup work, or a delivery hold. Successful findings are advisory
inputs for evidence-based triage under the existing correction process.

## Shape and evidence

The skill owns the reviewer contract and invocation directions. Use the surface's
native Muse handler when it has one, otherwise a fresh `muse exec` managed through
the host's native shell and process lifecycle: Codex
uses `exec_command` / `write_stdin`; Claude Code uses `Bash`, background completion
and output-file reads. The parent supplies scope and names starting files. Muse
reads on through the checkout; on `muse exec` it uses read-only file tools and the
structured-output schema. No generic host reviewer is registered: Muse itself must
produce the opinion.

A bounded retrospective pilot found useful scope distinctions but no unique core
catch beyond the current contract rubric with equivalent inputs. Its initial
scope prompt over-gated partial increments; the correction explicitly preserves
them. This motivates an additional opinion, not a new required clearance. Native
Muse child results were truncated in the tested build; direct headless reports
were complete. The review therefore avoids nested Muse children, with no fallback.

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

## Checkout reads, no runner (2026-11-04)

The operator judged the review too restrictive and disliked the managing script.
t3code drives Muse as a long-lived `muse serve` session, gating actions with a
permission ceiling and live approvals. A one-shot `muse exec` has no such approver,
so this route still removes tools up front; a `muse serve` host was not scoped.

The packet-only runner and its test are gone: the direct route covers every use
and the runner could not read source. Reads widen from a listed file set to the
reviewed checkout, from named starting files. One 10-minute deadline, t3code's
default wait, replaces the 120-second deadline and 8-step cap. A Claude Code
background task ignores `timeout`, and a foreground one moves to the background
instead of ending, so a separate timer enforces it there. The 512 KiB prompt limit
went with the runner, its only enforcer.

On a placeholder repo with a telemetry call nine imports deep, the old contract
read its three listed files and flagged a claim gap without reaching the call. The
new one read the whole chain in 13 model steps and 64 seconds and reported the
violation. A second run, with a secret-bearing `.env` as the obvious next read,
left it unopened and recorded a limitation. These are single functional probes,
not reliability estimates.

The read-only profile blocks writes but does not confine reads or searches: a
direct request read a file outside the workspace, and policy allowed it. `search`
returns matching lines, so it can expose values without any read. A checkout-wide
search skipped a gitignored `.env` but hit a tracked secret file, and one scoped to
the `.env` returned its token. The contract asks Muse to exclude secret name
patterns from every search, starting with the first, but this is not shown to
prevent exposure: two runs of one identical prompt on a tracked secret file split,
with the value absent from one and returned twice in the other. Reports omitted or
softened the hit, so a report is no evidence of compliance. The bound stays a prompt
rule checked from recorded results, as the listed-file limit always was. A breach
rejects the run and is reported, because the model and saved events hold the
contents, so detection follows exposure. The event stream records no call arguments,
so paths come from tool result text.

A retest of native children on Muse 1.4.14 passed 40 KB through one child. Its
preview was still truncated; the parent recovered the full text from a spill file
in four reads, taking about six minutes and emitting two terminal events. Direct
headless review stays the route.

The operator then asked that a surface with its own Muse handler run the review
through it, naming T3 Code's `delegate_task`, so `muse exec` is now the route only
where no wrapper handler exists. A Muse host keeps `muse exec`, because the retest
above rejected its own children. Model, prompt, deadline and checks stay the same,
with anything a surface cannot show recorded as a limitation. The route is chosen
before the attempt, so a native failure is a skip.

The tool limits differ, and the operator confirmed shipping them. T3's
`approval-required` mode maps to Muse's `:ask-me`: shell and writes prompt for
approval, and the child keeps T3's MCP tools. Whether MCP, web or delegation calls
prompt is unverified, so those may rest on the prompt rule alone. The exclusion of
shell, write, web, MCP and delegation therefore holds by removal only on `muse exec`.
T3 agents cannot answer approvals, and one ends the wait, so any approval cancels the
run as a skip. A surface with no read record cannot run the breach check, which is
then a recorded limitation. Under `:ask-me` on `muse exec`, reads and searches ran
without prompting. The T3 directions come from its source and have not been run from
a T3 Code session.

With the runner's test gone, nothing failed if the reviewer contract or schema
broke, and a broken pair would surface only as a silent `SKIPPED`. The plugin
validator now checks that the schema parses and that its fields and values appear
in the contract. It validates shipped files and manages no Muse run.

## Higher effort, longer deadline (2026-11-05)

The operator raised the reviewer from `high` to `xhigh` reasoning and the deadline
from 10 to 15 minutes on every route: `muse exec`, T3 Code's `delegate_task`
(`timeoutMs: 900000`) and the Claude Code timer. The model stays
`muse-wonder-full-1.0` with no fallback. Muse 1.4.14 accepts `xhigh` for that
model and completed a placeholder run at it; the event stream records model and
provider but not effort, so the effort is set by the invocation and cannot be
checked from the saved events. Whether T3 accepts a 15-minute wait is unverified,
like the rest of its directions.
