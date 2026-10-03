# Decision: sessions message each other through `so post`

**Date:** 2026-10-03
**Release:** workbench 0.46.0

## Problem

Session Orchestrator could already deliver a plain message between any two
registered sessions, Claude Code or Codex, with `so post`. No session knew it
could. An operator who wanted one session to consult another relayed the words
by hand, and a session that received a message had no way to tell how to
answer it.

## Change

Add `session-messaging` to the Workbench skills. It covers finding a peer
(`so ls --live` and its `to:` column), sending one plain `so post` command,
ending the turn after sending, answering only what asks for an answer, and the
three ways `so post` does not deliver: refused (exit 3, stop and tell the
operator), undelivered (never resend) and error.

The receiving side needs no skill: Session Orchestrator puts the answering
command in every message's header. The budget that refuses the seventh
message between two sessions since the operator last spoke is enforced by the
store, so the skill only says what to do when it fires.

The skill states the Codex sandbox step because Codex runs shell commands
where `so post` cannot reach the store; an exec-policy rule for `so post`,
written by Codex when the operator allows it for good, lets it out.

## Validation

See the Session Orchestrator pull request that adds the budget: two real
sessions, Claude Code on Sonnet and Codex on gpt-5.6-luna, each with this
skill as a project skill, exchanged a question and its answer, then played a
counting game until the store refused a message, and resumed after one
operator prompt.
