# systematic-debugging

Four-phase root-cause discipline: investigate → pattern-match → single
hypothesis → fix at the source. Derived near-verbatim from
[obra/superpowers](https://github.com/obra/superpowers) (MIT, Jesse Vincent);
adapted per [`workbench-system.md`](../decisions/workbench-system.md). Ships
`root-cause-tracing.md` (+ `find-polluter.sh`), `defense-in-depth.md`, and
`condition-based-waiting.md` (+ example helpers).

## Use it

- Trigger: any bug, test failure, or unexpected behavior — *before* proposing
  fixes; especially under time pressure, when a fix seems obvious, or after a
  fix didn't stick.
- The load-bearing patterns: read the full error first · reproduce before
  theorizing · the branch's own recent changes are prime suspects · in
  multi-component systems, instrument the boundaries and let evidence name the
  failing layer · one hypothesis, one minimal change, verified · fixes start
  with a failing test.
- The escalation rule: **3 failed fixes = stop and question the architecture**
  with the user — never attempt fix #4 first.

## Don't

- Don't stack fixes ("try changing X and Y and see") — you can't isolate what
  worked.
- Don't patch symptoms at the layer the error surfaced; trace to where the bad
  value was born.
- Don't skip Phase 1 for "simple" bugs or emergencies — systematic is faster
  than thrashing precisely then.
- Don't pretend to understand; "I don't understand X yet" is a legitimate
  status.
