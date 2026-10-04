---
name: benchmark-checklist
description: Use when running a benchmark, reporting a measured performance change, or choosing between options using measured performance. Not for ordinary functional verification or an unmeasured performance hypothesis.
---

# Benchmark Checklist

Establish what a performance number means before using it to decide or report.
Answer from observations; source inspection alone cannot establish a limiter.

## Frame the measurement

Write the intended claim, workload, and metric with units. Identify revisions,
builds, configuration, data, and concurrency. Read the harness: what does the
timer include, what counts as success, and what is omitted? Reuse suitable
project tooling. Work within the authorized time and resource budget; an
evidence gap can end in an inconclusive verdict rather than a larger experiment.

Inspect competing machine load using available platform tools. Do not stop
someone else's workload. Control or interleave trials and report residual noise.
Use the platform's equivalents: `uptime`, `top`, or system monitors for load;
`nproc` on Linux or `sysctl -n hw.logicalcpu` on macOS for logical CPUs.

## Validate the number

1. **Completed, correct work.** Confirm execution inside the timed region:
   await completion, consume lazy results, and read back outputs or side effects.
   Count attempted, successful, and failed operations, including timeouts and
   retries. Compare equivalent correct results; fast errors or skipped work
   cannot establish a speedup.
2. **Comparable configuration.** Use production-relevant builds, versions,
   batching, indexes, pools, and cache states on each side. A comparison of debug
   defaults with a tuned release cannot choose an implementation winner. For
   an intentionally scoped configuration comparison, name exactly what differs
   and limit the conclusion to those settings.
3. **Observed limiter.** Find the resource or code path bounding the result,
   including a saturated load generator. Use counters or a separate profiling
   run with the runtime's available tools; profiler overhead belongs outside
   reported timing trials. Map the observed cost to source. If the cause is
   unknown, say so and withhold a causal or adoption conclusion it cannot support.
4. **Plausible limits.** Check units and arithmetic against available CPU,
   storage, or network capacity. A helper consuming 10% of elapsed time cannot
   save more than 10% of that elapsed time by disappearing. An implausible
   result calls for investigating caches, omitted work, or harness defects.
5. **Repeatability.** For comparisons, start with at least five trials per side,
   interleaving or randomizing their order with equivalent warmup. Report run
   count, median, and spread. Use the harness's appropriate statistical method
   for close calls; five runs alone do not establish significance. If the data
   cannot separate the effect from noise, report no measurable difference or
   inconclusive, explaining which applies. Preserve raw runs and exclusions.
6. **User relevance.** Relate a microbenchmark to the end-to-end operation with
   realistic data and concurrency. Report what share of the operation changed;
   do not promote a helper's percentage into the whole operation's speedup.

For an explicitly requested **one-run ballpark**, verify completed correct work
and errors, then report that one observation. Repetitions and profiling are not
required. Choosing between options is a comparison, not a ballpark.

## Report and next action

For comparisons, lead with **faster**, **slower**, **no measurable difference**,
or **inconclusive**, scoped to the workload. For a requested ballpark, lead with
the validated observation labeled as one run, without a comparison verdict.
Give units, revisions/configurations, run count, spread where measured,
successful work and failures, and the limiter or evidence gap. Link detailed
local evidence where appropriate; keep private inputs out of public reports.
Untuned adoption comparisons, unchecked correctness, or unconfirmed timed work
are inconclusive. A credible timing observation can still have an unknown cause;
label that limit rather than inventing one.

When optimization is authorized, order hypotheses by avoiding unnecessary work,
reusing results, reducing frequency or volume, deferring work, moving it outside
the user's wait, concurrency, then cheaper execution. Choose from measured
evidence, validate semantics and resource costs, and stop at the agreed target.
The checklist does not authorize implementation, new infrastructure, or shipping.
