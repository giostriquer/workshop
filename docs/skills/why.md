# why

[Canonical skill](../../plugins/toolkit/skills/why/SKILL.md)

Reconstructs the historical rationale behind a design, behavior, threshold or
workaround. It separates documented intent from inference and unknowns, and
checks whether later decisions changed the original conditions.

## When to use it

Invoke `/why` or `$why` explicitly, for example:

- "Why did the webapp stop retrying this request?"
- "Why was this cache limit chosen, and does that reason still apply?"
- "What led to replacing this interface?"

Name a file, symbol, decision or revision when you have one. The skill can
resolve an obvious referent from the current task. For a current premise such
as whether retries are safe now, use Workbench's `claim-check`; a historical
answer may identify that as the next investigation.

## What to expect

The investigation starts from relevant repository history and follows concrete
links to available PRs, tickets or decision records. It widens when an open
question warrants it. It does not require a connector, a fixed team of agents
or access to every possible source.

The answer leads with the strongest supported rationale and cites its source.
It marks interpretations, unresolved contradictions and search limits. Original
intent and present fitness remain separate: current code does not explain the
author's motivation, and a closed ticket does not prove its proposal shipped.

When you are considering a change, the answer identifies what to preserve,
which conditions may have changed, and the next check needed before deciding.
It does not edit the implementation or contact the original author.

## Common questions

**What if the rationale was never recorded?** The result says what was searched
and what remains unknown. A plausible explanation stays an inference.

**What if sources disagree?** Both are retained with their dates and status.
The newest text does not automatically supersede an accepted decision.

**Will this activate on ordinary coding tasks?** It is explicit-only on hosts
that enforce invocation policy. See the Toolkit README for the known Muse
limitation. It is not a mandatory gate before editing code.

## How to tell it worked

You can follow the cited evidence to the decision, distinguish its original
constraint from today's behavior, and see exactly what remains uncertain.
