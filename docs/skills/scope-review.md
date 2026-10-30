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
exclusions, source/diff excerpts, revision, and verification evidence in a JSON
packet. The reviewer sees that packet only; paths alone are not enough. The
canonical skill contains the packet format and runner command.

## What happens if Muse is unavailable?

It records `SKIPPED` and continues. The same applies to timeouts, usage/auth
errors, unavailable models, malformed reports and any runner problem. There is
no retry, setup repair, fallback model or delivery hold. A skip is not a pass.
Node 18+ and an already configured `muse` on PATH are assumed; the skill neither
inspects credentials nor chooses API versus subscription billing.

## How to tell it worked

The runner returns `REVIEWED` with a complete structured report and the input
revision and hash. Findings cite supplied evidence and suggest proportionate
actions; missing proof is identified as a limitation. The parent validates and
records each disposition. Confirmed defects use the normal correction process;
there is no mandatory Muse clearance pass after corrections.

This supplements the required reviewers. It cannot replace their verdicts, prove
runtime behavior, or close an epic's unverified journey.
