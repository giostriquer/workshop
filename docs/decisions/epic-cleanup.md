# Decision: manual cleanup after an epic

**Date:** 2026-09-22
**Release:** workbench 0.41.0

## Problem

Completed epics leave dispatches, probes, logs and worktrees from implementation,
validation and audits. The existing orchestration skill defines retirement and
preservation, but retirement grants no cleanup authority. The operator needs a
separate invocation that removes material whose purpose has ended and accounts
for every worktree the epic owned.

## Change

Add `epic-cleanup` to Workbench's existing skills directory. Set
`disable-model-invocation: true` and Codex's
`policy.allow_implicit_invocation: false`. It is invoked by the operator after
they believe the epic is complete; orchestration never invokes it automatically.

Invocation authorizes removal of verified disposable epic material. The skill
reconciles the ledger and dispatches with Git and harness worktree inventories,
checks current contents and delivery, and removes the safe subset without a
second general approval. Ambiguous ownership, live consumers, undelivered work
and retention requirements hold the affected items. Cleanup does not certify
epic acceptance or start a new audit.

Useful evidence stays addressable. Retained material inside a disposable
worktree must have a verified destination and repaired references before the
worktree can go. Branch deletion, publication and tracker state changes remain
outside this invocation. The final result accounts for removed, already absent,
retained and blocked items; remaining owned worktrees prevent a complete claim.

## Validation

A six-case baseline without the new skill already preserved unique work and
useful evidence, included detached validation and audit worktrees, and allowed
safe partial progress. This is characterization evidence, not an observed
destructive failure. The new artifact supplies the missing explicit invocation
and repeatable inventory, removal and verification contract.

A fresh reader applied the new skill to those six scenarios plus a summary-only
request and preservation of evidence inside a disposable worktree. It included
all proven owned worktrees, preserved unrelated and useful material, continued
safe partial cleanup, avoided implicit invocation and verified relocation before
removal. These were read-only scenario checks; no actual epic was cleaned up and
they do not establish reliability across models or long sessions. Two wording
ambiguities were narrowed to name the user's cleanup request as the authority
and avoid implying another general approval gate.

Native plugin validation, explicit YAML invocation-policy checks, affected
documentation links, the leak scan and diff whitespace checks passed. The generic
skill-creator validator rejects the requested `disable-model-invocation` field
because its allowlist omits that host extension; it is retained and checked
separately. The settings follow [Claude Code's skill documentation](https://code.claude.com/docs/en/skills)
and [OpenAI's skill metadata requirements](https://developers.openai.com/plugins/deploy/submission-errors).
