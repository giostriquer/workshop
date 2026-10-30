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
Muse CLI process on every host, with no nested reviewer or host-agent fallback.

The parent supplies the original request, accepted scope changes, increment,
exclusions, pinned revision, relevant source paths, and verification evidence.
Muse can inspect the explicitly listed files with its native read-only tools.
The parent records actual reads separately from reported checks; source reading
does not establish runtime behavior.

## How do Codex and Claude invoke it?

The skill provides directions for direct `muse exec`, including its read-only
profile and native JSON-schema output. Codex manages the process with
`exec_command` and `write_stdin`. Claude uses `Bash`, background completion and
`Read` on its output file. Both retain the same process handle, apply a
120-second deadline, and check the complete result before recording it.

No wrapper script is required. The existing Node runner is still an optional
choice for a complete, packet-only review; it cannot inspect referenced source.
Choose the route before the single attempt, never as a fallback after failure.

## What happens if Muse is unavailable?

It records `SKIPPED` and continues. The same applies to timeouts, usage/auth
errors, unavailable models, malformed reports and any runner problem. There is
no retry, setup repair, fallback model or delivery hold. A skip is not a pass.
An already configured `muse` on PATH is assumed; Node 18+ is needed only for the
optional runner. The skill neither inspects credentials nor chooses API versus
subscription billing.

## How to tell it worked

The completion record contains `REVIEWED`, the complete structured report, exact
revision and input fingerprint, and which files Muse actually read. The process
completed on the required provider/model and the source fingerprint is unchanged.
Findings cite request, source or proof evidence and suggest proportionate actions;
missing proof stays a limitation. The parent validates and records dispositions.
Confirmed defects use the normal correction process; no mandatory Muse clearance
pass follows corrections.

This supplements the required reviewers. It cannot replace their verdicts, prove
runtime behavior, or close an epic's unverified journey.
