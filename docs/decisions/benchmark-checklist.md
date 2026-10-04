# benchmark-checklist: support the meaning of a measurement

## Optional procedure, independent verification floor (2026-10-04)

The operator approved adapting pstack's `benchmark-checklist` and
`principle-explain-the-number` at
`e43c7ee26e0038c6c1fa8380dd34ce86ff94cb2a` (0.15.9, MIT, Lauren Tan).
The questions originate in Brendan Gregg's
[benchmarking checklist](https://www.brendangregg.com/blog/2018-06-30/benchmarking-checklist.html).

`toolkit:benchmark-checklist` is model-invocable when a task makes a measured
performance comparison or a decision based on one. It checks the timed work,
correct output, comparable configurations, limiting resources, variation,
and relevance. A requested one-run ballpark remains a one-run observation.
Missing evidence narrows the verdict; it does not authorize an expensive
experiment, terminating another process, or installing profiling tools.

The port keeps repeated interleaved measurements, separates profiling from
timing, and uses the existing harness's statistics when appropriate. Five runs
are a starting point, not a significance threshold. Platform-specific commands
are examples, not requirements. No benchmark harness or runtime dependency is
shipped. The performance strategy ordering is guidance after a valid baseline,
not a new performance workflow.

Workbench's verification floor states the minimum evidence for a performance
claim without requiring Toolkit. Empirical proof points to the optional
procedure when available and preserves its own invocation boundary. Skill
authoring applies the analogous trial-validity checks to evaluations, without
equating an agent score with resource-bound throughput.

The current-guidance control already rejected the supplied invalid comparison
and accepted the supplied one-run ballpark. That is preserved behavior, not a
measured improvement. New scenarios exercise the added procedure and its limits.

## Validation of this adaptation

Fresh Astra application probes covered the confounded comparison and valid
ballpark, a close comparison, micro versus end-to-end impact, analysis-only
authority with an unknown cause, and an evaluation claim that omitted tool
failures. Outputs retained the evidence gaps and bounded the claims. The
existing-guidance control also handled its two cases correctly; no improvement
percentage is inferred. An independent Astra reviewer suggested restricting
comparison verdict labels to comparisons, and the skill and usage page now
explicitly report a ballpark as a one-run observation.

Native plugin validation and Codex export checks cover artifact structure and
invocation metadata. They do not prove discovery in a running host, marketplace
publication, or a performance result. No benchmark harness is shipped.
