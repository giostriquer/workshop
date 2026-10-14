# anatomy

[Canonical skill](../../plugins/toolkit/skills/anatomy/SKILL.md)

Use Anatomy when you want a detailed isometric machine or instrument that
explains how something works: an interactive SVG figure with carefully drawn
parts, motion, and a readout tied to the model it illustrates.

Invoke `/toolkit:anatomy` in Claude Code, or select Anatomy with `$` or
`/skills` in Codex, and describe the idea and intended output. For example:

> Explain a token bucket rate limiter as an interactive isometric machine
> in a standalone HTML page for the webapp documentation.

The skill runs only when explicitly invoked on both hosts. Toolkit contains
a small launcher that fetches a pinned, unchanged copy of
[upstream Anatomy](https://github.com/wheresryan22/anatomy), reads its full
instructions, and uses its geometry kit, references, examples, and checks.
The checkout lives in the task's scratch directory; it is not a global skill
installation. Fetching needs Git and network access. Building needs
Node.js 20.10+; browser checks need Chrome or Chromium.

Expect substantial drawing work. Upstream estimates 30 to 90 minutes for a
single mechanism and several hours for denser work, and sizes the request
before building. A small architecture map or ordinary report generally fits
[`html-artifact`](html-artifact.md) better.

The result should be a generated figure in the task's output area, with the
checks that ran and any gaps stated. Fetching the skill alone is not completion.
Keep the upstream MIT license with reused kit and example code.
