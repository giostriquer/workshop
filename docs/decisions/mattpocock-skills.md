# Matt Pocock's grilling and architecture skills: decisions in force

## Focused upstream refinements (2026-10-08)

The approved source review at `b0618bc436ad893b3c5e84e55fba86586d34a404`
contributes three small adaptations. In Toolkit grilling, a yes/no question
is phrased so yes accepts the recommendation; genuine multi-option choices
remain choices. In Workbench TDD, each selected test boundary names what it
catches and misses, using existing task authority without a new approval
exchange. Hand-applied mutation probes verify the actual source difference
before trusting RED, both during implementation and test-quality review.

Sources are Matt Pocock's MIT-licensed
[grilling](https://github.com/mattpocock/skills/blob/b0618bc436ad893b3c5e84e55fba86586d34a404/skills/productivity/grilling/SKILL.md),
[tdd](https://github.com/mattpocock/skills/blob/b0618bc436ad893b3c5e84e55fba86586d34a404/skills/engineering/tdd/SKILL.md), and
[diagnosing-bugs](https://github.com/mattpocock/skills/blob/b0618bc436ad893b3c5e84e55fba86586d34a404/skills/engineering/diagnosing-bugs/SKILL.md).
The latter two workflows are not imported wholesale. Local TDD, isolation,
focused-test, and review ownership rules remain in force. The source snapshot
is 44 commits beyond published `v1.3.1`; its manifest version does not make
those changes released. Scoped adoption records preserve that distinction.

A consuming-agent fixture check caught a mutation helper that exited
successfully without changing source. An inspected replacement then failed
at the intended assertion, and restored source passed with the original files
preserved. Two response-only probes covered the API test-boundary explanation
and recommendation-aligned grilling with a genuine three-option choice.
Those two probes executed no API or interview; this small sample supports
the specific guidance checks, not a general reliability claim.

This is the rationale for five toolkit skills ported from
[mattpocock/skills](https://github.com/mattpocock/skills) (MIT, Copyright (c)
2026 Matt Pocock): `grill-me`, `grilling`, `improve-codebase-architecture`,
`codebase-design` and `domain-modeling`. Superseded choices are omitted, and
git history keeps the originals.

## Port two entry points and the skills they load (2026-09-24)

The user asked for `grill-me` and `improve-codebase-architecture` with their
dependencies, and already runs the originals through the installed
`mattpocock-skills` plugin. That daily use is the lived-in proof `AGENTS.md`
asks for. The port is from upstream commit `c55ee46` (2026-09-18).

The dependency graph, walked from both entry points:

| Skill | Invocation | Loads |
| --- | --- | --- |
| `grill-me` | user-invoked | `grilling` |
| `improve-codebase-architecture` (+ `HTML-REPORT.md`) | user-invoked | `codebase-design`, `grilling`, `domain-modeling` |
| `grilling` | model-invocable | nothing |
| `codebase-design` (+ `DEEPENING.md`, `DESIGN-IT-TWICE.md`) | model-invocable | nothing |
| `domain-modeling` (+ `CONTEXT-FORMAT.md`, `ADR-FORMAT.md`) | model-invocable | nothing |

Nothing else is needed. `setup-matt-pocock-skills` writes per-repo tracker,
label and domain-doc config, but upstream's own ADR
(`.agents/adr/0001-explicit-setup-pointer-only-for-hard-dependencies.md`)
classes `improve-codebase-architecture` as a soft dependent: it reads
`CONTEXT.md` and ADRs when they exist and works without them, and
`domain-modeling` creates both lazily. `grill-with-docs`, `wayfinder`, `triage`,
`tdd` and `to-spec` share the same primitives, but neither entry point reaches
them.

The invocation pattern matches upstream. The two entry points set
`disable-model-invocation: true` and ship `agents/openai.yaml` with
`policy.allow_implicit_invocation: false`. The three dependencies stay
model-invocable, since on Claude Code the model cannot load a
`disable-model-invocation` skill through the Skill tool, and the entry points
load them. Every skill carries an `agents/openai.yaml`, as upstream does.
Descriptions are rewritten as triggers in the `writing-skills` form, ending in
"User-invoked only." for the entry points, like `test-audit`.

## Loading the toolkit copies when another plugin ships the same names (2026-09-24)

Upstream writes each dependency as "Call the Skill tool with X", which is
Claude Code's tool name. The ported text says "load `toolkit:X`", naming the
plain `X` for hosts that don't prefix plugin skills. That matches the repo's
existing wording ("Use the `test-driven-development` skill").

The skills keep their upstream names, following the precedent in
`workbench-system.md`: muscle memory and a trivial upstream diff. With the
`mattpocock-skills` plugin also installed, the hosts behave differently:

| Host | Plugin skill names | Both sets installed |
| --- | --- | --- |
| Claude Code | prefixed `plugin:skill` | Coexist; the entry points name `toolkit:X` |
| Codex | prefixed `plugin:skill` (`codex-rs` skill loader `namespace.rs`); a plain `$grilling` mention is refused when two skills share the name (`selection.rs`) | Coexist; `$toolkit:grill-me` invokes the toolkit set |
| OpenCode | flat; its docs require names unique across every scanned directory | Load one set, not both |
| Cursor, Antigravity | prefixing of plugin skills is not documented | Not verified |

Each entry point also says to prefer the toolkit copy over a same-named skill
from another plugin, so a host that lists both unprefixed still has a rule to
follow. A toolkit-specific rename (`toolkit-grilling`) was rejected. It would
break the names users type and every upstream diff, only to cover a
both-installed state on hosts where it is unverified. On Claude Code, with
`mattpocock-skills` enabled, every probe that loaded a dependency loaded the
toolkit copy.

## Generalized for five hosts and for adopters (2026-09-24)

- **Sub-agents.** "Spawn a sub-agent" became "through a sub-agent where the host
  has one". Design-it-twice gained a sequential fallback for hosts without
  sub-agents: write the designs one after another and don't revise an earlier
  one toward a later one.
- **ADR location.** `domain-modeling` writes ADRs in `docs/adr/` unless the repo
  already keeps decision records elsewhere or names a template in `AGENTS.md`
  or `CLAUDE.md`. Upstream records this as an open request. A repo like this
  one would otherwise grow a parallel `docs/adr/` beside `docs/decisions/`.
  `improve-codebase-architecture` reads ADRs from the same place.
- **Slash mentions.** `/codebase-design` in prose became the plain name.

Everything else is upstream text. The `❓` and `➡️` markers in the grilling
round stay, because answering a round by number depends on that shape.

## The report keeps its own contract and follows html-artifact's delivery standard (2026-09-24)

`HTML-REPORT.md` stays as the survey's report contract: header legend,
candidate card fields, strength badges, diagram patterns, tone and glossary.
Deferring to `html-artifact` was rejected for two reasons. It is user-invoked,
so on Claude Code the model cannot load it mid-survey. And it deliberately has
no fixed card vocabulary, while the survey's value is a fixed, comparable card
per candidate.

The scaffold changed. Upstream loads the Tailwind play CDN and Mermaid from
jsDelivr. Upstream's own usage page records an open failure: a hook demanding
SRI hashes blocked the scripts, and the report rendered unstyled with no
diagrams. The agent never saw it, because it never renders the page. The port
adopts `html-artifact`'s standard: one file that works offline, inline CSS,
inline SVG or HTML diagrams, no scripts, dark mode first. Mermaid's automatic
layout is the cost: graph diagrams are laid out by hand. `html-artifact`'s
render-and-inspect pass was not adopted. The report is a temp file for one
reader, and removing the scripts removes the failure class that pass would
catch.

## Improvements taken from pstack's architect (2026-09-24)

Lauren Tan's pstack (`pstack/`, MIT, Copyright (c) 2026 Lauren Tan, in
[cursor/plugins](https://github.com/cursor/plugins) at `12d587d`) has its own
`architect` skill. It is a design-then-implement driver: ground, sketch
candidates across models through `arena`, implement against the sketch, and
scrap it when friction repeats. The survey stays Matt Pocock's structure. Only
pieces that make its evidence and screening sharper were taken:

| Taken | Source (commit) | Where it landed |
| --- | --- | --- |
| Concrete signs for shallowness (callers coordinate several calls for one operation, options expose internal stages, pass-through forwarding), information leakage (one decision known in several modules, transport or storage types across an interface) and temporal decomposition | `pstack/skills/architect/references/design-red-flags.md` (`45c66fd`) | `improve-codebase-architecture` Explore list |
| Friction tells: the same workaround recurring across unrelated code, escape-hatch types (`any`, casts, always-set optional fields) | `pstack/skills/architect/SKILL.md` Phase E (`12d587d`) | Explore list |
| "Naming a file isn't grounding"; "Don't guess from names. Read the code"; name what you could not trace | `architect/SKILL.md` Phase A (`12d587d`), `pstack/skills/how/references/explorer-prompt.md` (`70b2dc8`) | Evidence paragraph, `file:line` in the card's Files, a Gaps slot |
| Screen every candidate against the red flags before presenting; a deep call chain is not a deep module; complexity in the data is not complexity in the design | `design-red-flags.md`, `architect/SKILL.md` Phases B and E | "Screen before presenting" paragraph |
| Usage before interface, reconciling the interface to the usage; don't hedge toward the other designs; a second flavour of one shape adds nothing | `pstack/skills/architect/references/runner-prompt.md` (`d7cde2b`), `pstack/skills/principle-exhaust-the-design-space/SKILL.md` (`45c66fd`) | `codebase-design`'s `DESIGN-IT-TWICE.md` |

Upstream's Explore questions name symptoms ("where do modules leak across
their seams?"). The pstack signs name what to look for in the code. The evidence
rule and the Gaps slot give each card an inspectable trace instead of a file
list. pstack's "boundary" and "layer" are translated into the `codebase-design`
glossary (seam, module).

Not taken: `arena`'s multi-model runners and the `pstack-models.mdc` rule, the
implement and scrap phases (the survey changes no code), the rationale
template (the card is the output shape), and the principle-skill
cross-references, which this repo does not ship.

## grilling is not brainstorming (2026-09-24)

Workbench's `brainstorming` also interviews the user. It drives toward its own
design and ends at a route pick. `grilling` interrogates the user's plan,
leaves every decision with them, and ends at a confirmed shared understanding
with no artifact. The usage pages carry that distinction. No skill text
changed for it: the trigger phrases barely overlap, and toolkit text would
otherwise name a workbench skill that a toolkit-only install lacks.

## Validation (2026-09-24)

These probes are bounded regression evidence, not a reliability estimate. They
ran as fresh `claude -p` sessions (`claude-opus-5-5`, effort high) with the
user's normal configuration. The installed toolkit was disabled, and a copy of
the changed toolkit was loaded with `--plugin-dir`. `mattpocock-skills` stayed
enabled, so every run also exercised the name collision. The architecture
fixture was a small TypeScript `webapp` repo with six commits, a `CONTEXT.md`,
and one ADR saying pricing stays in an owned pricing service. It had an
`OrderService` that only forwards to `OrderRepo`, and a `PricingClient` returning
a raw `Response` whose `total_cents` wire field two handlers parsed, with a
diverging default. `open` was denied, so no browser window appeared.

| Question | Result |
| --- | --- |
| `/toolkit:grill-me` on a plan: loads `toolkit:grilling`, asks one numbered round with a recommendation per question, writes nothing, waits | 4 of 4 (three on a queue-migration plan, one on a hiring decision); 4 to 7 questions per round |
| `/toolkit:improve-codebase-architecture`: loads the toolkit `codebase-design` | 3 of 3 (two through the Skill tool, one by reading the toolkit copy's files); 0 loaded the `mattpocock-skills` copy |
| Finds the pricing seam as the `Strong` top pick, framed as ports and adapters within the ADR | 3 of 3 |
| Finds the `OrderService` pass-through | 3 of 3 |
| Report is offline and dark (no `<script>`, no remote URL) | 3 of 3; upstream arm 0 of 2 (Tailwind and Mermaid CDNs, light) |
| Every card cites `file:line` evidence and names its Gaps | 3 of 3 (14 distinct references each); upstream arm 0 of 2 (2 and 0 references, no gaps) |
| Glossary held (no "component", "service layer", "boundary") and stops with "Which of these would you like to explore?" | 3 of 3 |
| After "Let's explore your top recommendation": loads `toolkit:grilling`, asks a round in seam, adapter and port terms, changes no files | 3 of 3 |
| After "Going with all your recommendations": loads `toolkit:domain-modeling` and edits `CONTEXT.md` inline, terms only | 1 of 2; it sharpened Line item and Quote and left the error type out as implementation detail. The other first re-asked two recommendations it had made conditional, so no term was settled yet |
| An unrelated coding task (add a `formatMoney` helper) in the same fixture loads none of the five skills | 0 of 3 loaded any |

On Codex, `codex debug prompt-input` (CLI 0.155.1) ran with the five skills
copied in as repository skills under probe names. The two entry points were
absent from the model-visible list and the three dependencies present.
Flipping `grill-me`'s sidecar to `allow_implicit_invocation: true` made it
appear. Codex behavior itself was not probed, nor were Cursor, Antigravity and
OpenCode.

## Agent contributions with partial context (2026-10-04)

The approved update from pstack 0.15.9 at `e43c7ee` adds split state ownership,
equivalent competing paths, importable internals, and hand-synchronized lists
to the architecture survey and candidate screening. `codebase-design` owns
the detailed vocabulary; design-it-twice compares how a plausible local edit
stays correct across the whole module. Each candidate identifies an enforcing
mechanism and a way to check it, without claiming that a sketch was executed.

The port preserves required compatibility, distinct adapters, and legitimate
replicas with explicit ownership. It does not turn every alternative path
into a deletion order. Workbench carries a concise independent review check
because Toolkit is optional. Source and behavioral checks are distinct.

## Glossary compatibility and source tracking (2026-10-04)

The approved review compares the original `c55ee46073ed923f86ce59a5eb3b6d895095d1b7`
baseline with `d81f3a183412e71a5b1e84ca21bc1a35eea03a60`. Across the five
ported skills, eleven source files are unchanged and four differ only in
the `CONTEXT` to `GLOSSARY` naming convention, including the format-file
rename. The upstream manifest still says `1.2.3`; a merge from a branch named
`release/v1.3` does not prove that version was published.

Toolkit accepts both conventions. Repository instructions choose the location
first, existing maps and glossaries are reused, and a new unconfigured repo
defaults to `GLOSSARY.md`. Ambiguous competing files require a location decision
before writing. No automatic rename, merge, or second glossary is authorized.
The existing `CONTEXT-FORMAT.md` owns this lookup contract for domain modeling,
architecture surveys, and design briefs; its filename remains stable for links.

The repo-local drift checker gains a Matt Pocock manifest, with the five carried
skills, explicit reviewed exclusions, and the exact source pin. Branch tracking
is deliberate: the adopted baseline and reviewed changes postdate the latest
published tag. Unreviewed skills remain unmapped so later changes surface.
`retro`, `pr`, and `implement-spec` were promoted upstream, but their concerns
already have local owners with different authority and delivery contracts.
No new workflow skill is imported.

Validation used fresh Astra contexts before and after the glossary change.
The baseline followed the old filename literally and proposed a parallel
`CONTEXT.md` for a new-name glossary or map. Ten post-change synthetic cases
preserved both naming conventions, followed mixed map paths and explicit repo
pointers, surfaced competing owners, and kept read-only surveys from creating
files. These are bounded response probes, not live host or reliability proof.
The real drift checker ran against a fetched upstream clone: the reviewed pin
was current, and replaying the original baseline produced three adopted review
blocks, 21 excluded changed paths, and no unmapped paths in that range.
