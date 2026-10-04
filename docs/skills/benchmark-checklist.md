# benchmark-checklist

## What it does

`benchmark-checklist` checks whether a measured performance result supports
the conclusion being drawn. It applies to benchmark runs, speedup or regression
claims, and choices between implementations or configurations.

The agent can load it when relevant. You can also invoke
`/toolkit:benchmark-checklist` or `$toolkit:benchmark-checklist` directly.

## What it checks

- The timed work completed and its results were correct, with errors counted.
- Configurations and workloads are comparable and relevant to production.
- A separate profile or counters identify the limiter, or uncertainty is stated.
- Units and results are plausible against resource and elapsed-time limits.
- Repeated interleaved trials distinguish an effect from variation.
- A microbenchmark's result is kept separate from the user's end-to-end wait.

A comparison report leads with faster, slower, no measurable difference, or
inconclusive, scoped to the actual workload. A requested ballpark leads with
the validated observation labeled as one run. Reports include units,
revision/configuration, repetitions and spread where measured, successful work
and errors, and evidence gaps.

## Common questions

**I only want a rough timing. Must it profile and run five times?**
No. An explicitly requested one-run ballpark checks completion and correctness,
then reports that single observation. Choosing between options needs comparison
evidence; calling the choice a ballpark does not change that.

**What if the benchmark is fast because requests fail?**
That cannot establish a speedup for successful work. Correct the harness or
report the comparison as inconclusive within the available authority.

**Does five runs prove statistical significance?**
No. It is a starting point. Close calls use an appropriate statistical method
or remain unresolved. Raw trials and exclusions stay available.

**Does it install profilers or stop other jobs?**
No. It uses available platform and project tools within the authorized budget.
Missing evidence may end in an inconclusive result. Profiling runs are separate
from timing trials so instrumentation overhead does not become the result.

**Is this required for every empirical proof?**
No. It applies to measured performance. Workbench has its own small evidence
floor and remains usable without Toolkit. This skill ships no harness and
does not authorize optimization or shipping.

## How to tell it worked

The stated claim can be checked against the actual workload and raw results.
Errors, skipped work, tuning differences, noise, and unmeasured user impact
remain visible instead of becoming a confident winner.

The [canonical skill](../../plugins/toolkit/skills/benchmark-checklist/SKILL.md)
is the authority for behavior.
