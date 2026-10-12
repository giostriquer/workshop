# Ketchup: catch up without changing task ownership

## Explicit catch-up entry point (2026-10-12)

The operator approved adapting Lauren Tan's pstack `ketchup` from
[`cursor/plugins`](https://github.com/cursor/plugins/tree/1b6d44ff26d4e242f4e8f68c391e6d2f7ca16def/pstack/skills/ketchup)
at `1b6d44ff26d4e242f4e8f68c391e6d2f7ca16def` (source manifest 0.15.20,
MIT). Returning to long-running, multi-agent work is an established use case;
this addition was explicitly requested rather than inferred from the catalog.

Toolkit owns the optional entry point. `ketchup` summarizes what changed in
the current task since the user's preceding message and carries forward older
unresolved human decisions. It checks relevant current state where available,
separates observed results from reports and stale evidence, and gives each
human decision enough context to make the call. Agent-owned work stays with
the agent. This differs from a handoff, retrospective, or broad workspace
audit: it neither transfers ownership nor starts an investigation campaign.

The upstream whole-turn read-only rule conflicts with a status request during
already authorized work. Gathering the update remains read-only. A standalone
checkpoint request ends with its report; a status interruption reports and
continues the existing task under its existing authority. It never stops
workers, changes scope, or grants commit, delivery, or external-write authority.

The upstream `/bro` dependency is replaced with self-contained plain-language
output guidance. Visuals are optional and reuse relevant existing evidence;
there is no requirement to generate a new artifact for each decision. Failed
refreshes remain visible rather than prompting broad searches or fabricated
current state. Names come from the user's task, not invented lane labels.

`disable-model-invocation: true` and the Codex
`policy.allow_implicit_invocation: false` sidecar make this user-invoked only
on both hosts. Ordinary status questions do not require activating a skill.

## Bounded validation

Four synthetic consumer cases exercised ongoing work, a stale standalone
checkpoint, an explicit pause, and an empty update. The responses kept the
older pending decision visible, distinguished an agent's report from verified
results and current CI from an old revision, continued authorized work after
a status request, and paused only when asked. The standalone and empty cases
ended with their reports. This is application evidence for those cases, not
live host-discovery proof or a reliability estimate.
