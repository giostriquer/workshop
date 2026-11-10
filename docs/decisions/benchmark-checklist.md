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

## The decision is written before the run (2026-11-09)

Upstream's `principle-explain-the-number` gained "write the decision before
you run": name the result that would change a decision and the noise floor,
and stop when run-to-run spread exceeds the effect. The stop rule is not
taken: the checklist's trial step already separates no measurable difference
from inconclusive, and stopping early could cut its trial floor short. The
rule applies to comparisons, not to the one-run ballpark. The checklist framed the
claim, workload and metric but set no threshold in advance and dealt with
noise only after the runs, so a result could be read to fit whatever came out.
The operator approved the adaptation, reviewed at `236e5481d05cbadc315b374a5de54971858c27bb` (source manifest
0.15.36). Upstream's other edits in the range were copy changes.

One scenario probe (Opus 5.5, fresh context, one run) asked for a comparison
of two parsers with a known share of request time. Before any run, the reply
wrote the decision rule (a threshold tied to that share and to the cost of the
swap), the expected run-to-run variation, and how the trials would be read
against both. Regression evidence for that scenario only. A first attempt at
this probe did not complete and was reworded.
