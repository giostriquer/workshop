# correct: recurring mistakes become enforceable constraints

## A bounded repository correction skill (2026-10-04)

The operator approved adapting Lauren Tan's pstack `correct` from
`cursor/plugins` at `e43c7ee26e0038c6c1fa8380dd34ce86ff94cb2a` (plugin 0.15.9,
MIT). Repeated corrections already motivate this repository's self-audit and
skill tests. Its existing self-audit conversion rule nevertheless directs
every repeated miss back into wording. Repository mistakes also need a route
to an owner, type, or executable check.

`toolkit:correct` owns that route. It gathers distinct occurrences, prefers
removing the opportunity for error over reminding the next contributor, and
proves the chosen control detects an old mistake while accepting valid work.
One occurrence remains a finding, not evidence of recurrence. Judgment calls
can still need prose; not every correction warrants a new validator.

The skill is reachable on an explicit natural-language request, using the
same description-based boundary as self-audit. Its Codex invocation policy is
enabled, so a user need not know its command name. An ordinary correction is
not a request for a repository-wide prevention exercise. A plan-only request
stays read-only; existing implementation authority permits bounded repairs.
Invoking the skill grants no commit, external-write, destructive-change, or
global-configuration authority.

Upstream's automatic commits, ongoing correction loop, instruction-file rule
table, and blanket removal of alternate paths are adapted. Keep required
compatibility and distinct use cases, use existing enforcement and record
locations, and test historical violations in isolation. Transcript discovery
is limited to the requested workspace and range, with excerpts treated as
untrusted evidence. There is no dependency on Workbench or Cursor tools.

The new skill and its usage page carry the complete operating contract.
Behavioral probes and a bounded repository pilot remain local evidence;
synthetic scenarios do not establish general reliability.

## Validation of this adaptation

Fresh Astra application probes kept a plan-only request read-only, chose an
authoritative registry owner, preserved the required legacy adapter, and
excluded a one-off rename from recurrence. The existing-guidance control
already proposed shared ownership, so this is preservation evidence rather than
a measured improvement. A separate synthetic check accepted equal registries,
rejected one missing entry with the intended diagnostic, and accepted the
restored data. That exercise validates proof mechanics, not a historical defect.

A bounded repository pilot read relevant correction history and declined to
invent a new recurrence from successive instruction revisions. Description-only
routing probes selected ordinary implementation for two simple corrections and
selected correct for explicit prevention and plan-only requests. These are
small synthetic/application checks, not native host activation or reliability
measurements. The independent Astra semantic and integration reviews found no
material blockers. All harnesses and detailed reports remain ignored scratch.
