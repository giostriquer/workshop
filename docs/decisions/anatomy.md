# Anatomy launcher

## Pinned upstream, explicit invocation (2026-10-12)

The operator requested [Anatomy](https://github.com/wheresryan22/anatomy)
unchanged in Toolkit, with automatic invocation disabled on Claude Code and
Codex, or a launcher if carrying the whole skill was too much.

The inspected source is `689dcf966e63d92be10a5d593c6e19e10acd4422`:
137 tracked files totaling 12,225,038 bytes, including 10,744,716 bytes of
examples. Toolkit was 197,268 bytes. The examples, geometry kit, browser
scripts, and references form a working package; copying only `SKILL.md` would
break its relative resources. The operator's launcher alternative avoids
vendoring this package and its maintenance surface.

`toolkit:anatomy` obtains a fresh checkout at that exact commit in the task's
scratch area, outside skill discovery. It reads the upstream skill in the
same session and resolves its resources from that checkout. It neither
rewrites upstream instructions nor installs their broad automatic trigger.
Generated work belongs in the target project. The upstream MIT license stays
with copied code. A pin update is an explicit maintenance change, not a fetch
of the latest branch at invocation time.

The launcher uses `disable-model-invocation: true` for Claude and
`policy.allow_implicit_invocation: false` in `agents/openai.yaml` for Codex.
Those controls apply to the launcher; the fetched upstream files remain
byte-identical. This is a launcher, not a claim that Toolkit bundles Anatomy
or provides offline cache reuse. Git and network access are needed to
fetch; upstream requires Node.js 20.10+ and Chrome or Chromium for its checks.

This directly requested addition is authorized by the operator, rather than
by an inference that another general illustration workflow is needed. It
does not change `html-artifact` or the Workbench completion process. Plugin
publication and global installation are separate from this local change.

## Validation

The launcher's fetch recipe retrieved the exact pin. All 137 working files
matched their Git blobs byte for byte, and the reference checkout stayed
clean. A separate working copy built the upstream dial-indicator example;
its browser capture rendered with a clean console and no horizontal overflow.
Chrome required an unsandboxed retry after aborting during sandboxed startup.

Native plugin validation, the focused clean-copy and invocation-policy checks,
Codex export with policy preservation, and the working-tree leak scan passed.
Independent review found no blocking issues. Three bounded static scenarios
covered explicit handoff, offline/dirty-cache preservation, and non-invocation
for ordinary UI work. These checks do not establish live Claude/Codex skill
discovery or the quality of a newly generated illustration through a host
session. No full test suite or plugin release was run.
