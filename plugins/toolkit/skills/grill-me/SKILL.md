---
name: grill-me
description: Use when the user asks to be interviewed relentlessly about a plan, design, decision, or idea until every branch is settled, in a codebase or outside one. User-invoked only.
disable-model-invocation: true
---

# Grill Me

Load the `toolkit:grilling` skill (plain `grilling` on hosts that don't prefix plugin skills with the plugin name) and run it on what the user brought. Load it before the first question: its rounds are the interview, so don't improvise one from this file. If another installed plugin also ships a `grilling` skill, use the toolkit one.
