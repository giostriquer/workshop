# Test review follows the request

Date: 2026-09-21
Status: accepted

The test-quality skill already inferred its scope when no mode was supplied, but
still documented three modes, three workflows, separate output contracts, and
mode arguments in callers. This exposed an internal classification to every
dispatch and repeated the review procedure.

Use one workflow. The caller supplies a test-quality question or target and a
base branch when known. The reviewer resolves the scope from that request,
reads tests with their production code, and applies the relevant checks. Change
reviews retain their verdict and mutation execution requirements. Automatic review
still runs only at the shipping boundary, with the same correction requirements.
Requests to inspect existing tests or recommend a testing approach answer the
question with findings or advice, without inventing a delivery gate. Explicitly
requested mutation runs use the same setup, isolation and evidence rules.

Remove mode arguments from current callers and the companion agent. Remove
references to unrelated reviewer agents from the test-quality skill; its direct
test-quality boundary is sufficient. Preserve the trustworthiness rubric,
StrykerJS and cargo-mutants setup, focused execution, and workspace protection.
