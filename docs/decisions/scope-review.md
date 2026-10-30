# Muse scope review

Date: 2026-10-30
Status: accepted

## Decision (2026-10-30)

Attempt an independent Muse scope review once at completion alongside the existing
required reviews. It checks the original goal, accepted exclusions, and how the
finished increment advances an outcome or necessary prerequisite. It accepts
bounded partial progress and does not infer missing authorization from a scope
concern. Code structure, mutation testing and contract verification retain their
existing owners.

The user wants to use an already configured Muse subscription. Trust the CLI's
authentication and billing setup; do not inspect credentials or change them.
Always invoke Muse directly. Missing Muse, errors, timeouts, incomplete output or
an unavailable model produce `SKIPPED`, never another provider, an author-served
review, retries, setup work, or a delivery hold. Successful findings are advisory
inputs for evidence-based triage under the existing correction process.

## Shape and evidence

The skill owns the reviewer contract. Its small Node runner launches a fresh
`muse exec` process, supplies a complete evidence packet and captures the final
structured report. It does not register a generic host agent: ordinary host
dispatch could execute that definition on the wrong provider. One bounded process
and one result make the same invocation usable from each host.

A bounded retrospective pilot found useful scope distinctions but no unique core
catch beyond the current contract rubric with equivalent inputs. Its initial
scope prompt over-gated partial increments; the correction explicitly preserves
them. This motivates an additional opinion, not a new required clearance. Native
Muse child results were truncated in the tested build; direct headless reports
were complete. The runner therefore uses the direct CLI route without a nested
reviewer or fallback.

This adds an explicit optional-on-failure exception to the completion review map.
The required code, test and contract review gates remain unchanged. No release or
installation refresh is implied by this implementation.
