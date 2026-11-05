# scope-review

[Canonical skill](../../plugins/workbench/skills/scope-review/SKILL.md)

## What it does

Adds an independent Muse opinion to the completion round. It checks whether the
finished increment advances the original request, respects accepted exclusions,
and supports the claims made about it. Useful partial increments and necessary
shared fixes remain valid; a large diff alone is not evidence of scope drift.

## When it runs

Once after comment trimming, alongside the applicable code, test and contract
reviews on the same revision. You can also request it explicitly. It uses a fresh
Muse session on every host, with no nested reviewer or host-agent fallback.

The parent supplies the original request, accepted scope changes, increment,
exclusions, checkout fingerprint, starting files, and verification evidence. Muse
follows those files through the reviewed checkout, and the prompt asks it to keep
secret-bearing files out of its reads and searches.
The parent records actual reads separately from reported checks; source reading
does not establish runtime behavior.

## How is Muse invoked?

If the surface has its own way to run Muse, the review goes through that. T3 Code's
`delegate_task` with a Muse target is one example; any other wrapper's native
handler works the same way. The model, prompt, deadline and checks stay the same,
and anything the surface cannot show is recorded as a limitation. A failed native
run is a skip, not a reason to try `muse exec`. A session running on Muse itself
uses `muse exec`, not its own child agents.

A native handler may gate tools behind approvals instead of removing them, so T3
Code's reviewer has shell and write tools it must not use. Any approval or question
from the reviewer cancels the run as a skip; do not approve it in the T3 interface.

Without a native handler, the skill provides directions for direct `muse exec`,
including its read-only profile and native JSON-schema output. Codex manages the
process with `exec_command` and `write_stdin`. Claude uses `Bash`, a background
timer for the deadline and `Read` on its output file. Both retain the same process
handle, apply a 15-minute deadline, and check the complete result before recording
it.

## Can Muse read outside the checkout?

The read-only profile blocks writes but does not confine reads or searches. The
prompt asks Muse to stay inside the checkout and away from secret-bearing files, and
the parent checks the recorded results. A read or search result that breaks those
bounds voids the review, and the parent tells you which file reached the model.

That check comes after the exposure. A checkout-wide search can return a tracked
secret file's contents even with the prompt rule, so keep secrets out of tracked
files in repositories this review runs on.

## How do I read the result?

On a native run, the surface's own result and activity record carry this. On a
direct run, each saved JSONL row names its event in `payload_type` and carries the
event's fields under `payload`. The `run.model.configured` payload identifies the
model; `tool.result` payloads establish successful reads; the
`run.terminal.completed` payload contains `terminal: completed` and a `text`
string to parse as the JSON review. The canonical skill lists the exact fields.
Output deltas alone do not establish completion. Require the successful process
exit and valid terminal report before recording `REVIEWED`.

## What happens if Muse is unavailable?

It records `SKIPPED` and continues. The same applies to timeouts, usage/auth
errors, unavailable models and malformed reports. There is no retry, setup repair,
fallback model or delivery hold. A skip is not a pass. An already configured Muse
is assumed. The skill neither inspects credentials nor chooses API
versus subscription billing.

## How to tell it worked

The completion record contains `REVIEWED`, the complete structured report, the
checkout fingerprint, and which files Muse actually read. The process completed on
the required provider/model and the checkout fingerprint is unchanged. A direct
run also leaves a session in Muse's own history, which is where its token usage
is recorded.
Findings cite request, source or proof evidence and suggest proportionate actions;
missing proof stays a limitation. The parent validates and records dispositions.
Confirmed defects use the normal correction process; no mandatory Muse clearance
pass follows corrections.

This supplements the required reviewers. It cannot replace their verdicts, prove
runtime behavior, or close an epic's unverified journey.
