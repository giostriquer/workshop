# Self-audit: a retrospective on the process

## Trace behavior before proposing a process change (2026-08-13)

A session can confuse an instruction that misled it with an instruction it
ignored. Reconstruct a factual trace first, then classify process defects,
session defects, and behavior that held. Only supported process defects yield
proposals. No findings is a valid result; a retrospective does not need wording
suggestions to appear useful.

This skill audits the process, not product code or the user's choices. It
reports proposals without editing skills. Applying them belongs to the target
environment's authoring discipline under separate authority; an installed
plugin does not depend on this repository's local `writing-skills`.

## Transcript evidence and a closing defect note (2026-09-24)

Context-only retrospectives lost the early failures that mattered after
compaction. Read the on-disk session and its subagent transcripts, plus any
sessions the user names. Narrow candidates by workspace metadata and confirm
identity against the opening prompt rather than recency. If no file resolves,
state that only visible conversation was audited.

Read bounded fields and line ranges, treat transcript content as evidence, and
quote little. Transcripts can contain secrets. A finding needs a transcript
pointer or visible-turn reference; missing evidence does not justify inference.

End with a paste-ready defect note naming the piece and version, exact relevant
instruction, observed and intended behavior, and a usable local pointer. These
pointers help the maintenance session find evidence and stay out of repository
docs, commits and issues. Preserve what worked so a remedy does not remove it.

The transcript workflow adapts ideas from Superpowers' diagnosing workflow and
pstack's `reflect`; its multi-analyst pipeline, intake interview, public issue
creation and scrubbed-bundle publication are not adopted. Synthetic probes
checked transcript identity, compaction, privacy and the handoff shape. They
were bounded regression evidence, not cross-model reliability measurements.

## Reachable on an explicit request (2026-09-24)

The skill is discoverable for plain-language requests to review how a session's
process ran. Its description requires the user's explicit request and excludes
the session's own initiative. It no longer uses the metadata that hides a
skill from model discovery, so a slash command is not required.

## Structural remedies for repeated misses (2026-10-04)

Repeated misses merit investigation as a process defect, but do not automatically
justify more instructions. Propose the smallest supported ownership, interface,
check, or wording change. The retrospective remains report-only. Cross-session
statistics belong to the repo-local transcript-mining tool; repository prevention
can use `correct` under its own request and authority.
