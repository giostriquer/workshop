# Skill wording hardening

Date: 2026-09-09
Status: accepted for workbench 0.37.0 and toolkit 0.10.0

## Decision

Correct the audit's concrete behavioral hazards with narrow changes to the original skills. The operator rejected the first pass because it replaced useful verification instructions with general advice. This revision restores the original procedures, examples, templates, checklists, report schemas, and review gates, then changes the offending triggers or clauses in place.

## Preserved safeguards

- TDD retains RED → GREEN → REFACTOR, intended-failure checks, concrete examples, and its completion checklist. Valid existing code is preserved; missing test sensitivity is established in an isolated comparison instead of deleting working code.
- Systematic debugging retains four phases, evidence gathering, causal tracing, hypothesis tests, and supporting guides. Invoke it for persistent, unclear, intermittent, cross-component, or failed-hypothesis investigations and explicit requests; expected RED, obvious localized fixes, and incidental out-of-scope defects do not activate it.
- Verification retains command selection, result inspection, and evidence-backed claims. Evidence stays current until relevant code, inputs, environment, or requirements change; message boundaries do not invalidate it.
- Empirical proof and QA retain real-client preparation, health checks, scenario coverage, raw transcripts, source/baseline comparison, independent corroboration, and cleanup. Missing proof remains unresolved or blocked; only contrary evidence disproves a claim. A recorded verdict does not cancel separately authorized repairs.
- Claim-check retains its evidence ladder, independent probes, contest test, and verdict/prior-work/readiness dossier. Review retains its structural rubric and concrete remedies. Scope and demonstrated consequences determine blockers; material new risk receives follow-up review.
- Handoff retains the frozen goal.md / status-only plan.md architecture, full templates, refutation checks, integrity rules, baseline capture, red-team pass, and phase review/checkpoint exits. Explicit no-commit rules are reflected throughout the emitted contract, and authorized migrations preserve evidence.
- Delivery retains log inspection, reproduction, focused verification, concrete commands, templates, and bounded retries: two CI-fix attempts and two PR base resyncs. Epic orchestration retains its lane prompts, report format, validation checklist, traceability, and blind closing audit.

## Specific corrections

Carry existing scope, design, route, and delivery authorization forward; batch independent questions and pause only dependent work. Do not require users to certify factual uncertainty. Keep requested audits broad enough for cross-cutting static review. PR attribution follows governing instructions, with neutral attribution as the default. Diagnostic examples test presence without revealing secrets. Validation belongs at distinct trust boundaries, not every layer by reflex.

CI monitoring is delegated to a separate read-only watcher: Claude Opus or Codex gpt-5.6-sol, never Astra or Fable. Even a parent already using the designated model delegates the wait. Reports identify the target revision and expected checks; unavailable dispatch is a stated capability gap. Fixing remains with the implementer. This explicit assignment overrides the general inheritance preference.

Epic dispatch and orchestration validation use focused local tests and mandatory local gates; PR CI runs full suites by default. A wider local run needs an explicit requirement or named unresolved integration risk. Each returned wave requires a verified acknowledgment followed by ready lane prompts, a named delivery gate, a blind audit dispatch, an evidence-backed completion proposal, or a concrete blocker. Existing external-write authority still governs ticket publication.

Toolkit retains its artifact recipes. Recordings are offered instead of run uninvited; installation and upload require existing authority; overlays remain visible by default. Dogfooding is a perspective, not identity denial. Report templates do not invent missing fields. Architecture artifacts use self-contained assets and verified paths. Historical model grades remain explicitly uncalibrated examples; a new model name is not a new measurement.

## Authoring and validation

Keep writing-skills' baseline → edit → retest process, concrete examples, and discovery guidance. Evaluate task outcomes, over-activation, and incorrect obedience alongside intended adherence; a control that already succeeds can justify removing a rule. Small or reused-session probes are regression evidence, not reliability measurements. Related changes can share a test batch without forcing one release per wording change.

The original audit and first-pass probe records remain local audit history. This correction is reviewed against the original specifications for lost safeguards and against the usage pages for contradictory instructions. Packaging, syntax, evidence partition behavior, and artifact checks accompany the final diff; unrun checks must not be reported as passed.

## Packaging

Prepare workbench 0.37.0 and toolkit 0.10.0 with synchronized host manifests and release notes. Preserve repository layout and existing operator edits. The result was reviewed uncommitted in the main checkout; the operator then authorized committing and pushing these releases to main.

## Validation result

- Native plugin validation passed with synchronized workbench 0.37.0 and toolkit 0.10.0 manifests. Changed Markdown links, all 23 usage-page counterparts, offline flow HTML structure/targets, and the 15-section release-note bound passed.
- Executed the QA workflow extracted from the skill with controlled agent responses: reproduced, disproved, uncorroborated, blocked, and missing verification retain the correct partitions, evidence, and baseline origin.
- Executed the recording harness against a mocked browser boundary: default overlays remain visible, explicit suppression works, and failed scenarios retain evidence and close the browser. This is not a real-app recording test.
- Rendered the actual flow page in Edge at 1440px and 390px widths, captured both, and checked page overflow. Executed the diagnostic presence example with a dummy secret; output contained only SET/UNSET.
- Reused-session decision probes preserved valid existing code, intended RED/GREEN, targeted freshness checks, and four-phase investigation for unclear failures while excluding expected RED and obvious localized fixes. These are bounded regression observations, not cross-model reliability estimates.
- Independent reviewers checked restoration of the original verification detail and source/usage consistency. Their final localized corrections were applied and the diff/link checks passed. At the review checkpoint, no full CI suites, publication, installation, commit, or push had been performed.
