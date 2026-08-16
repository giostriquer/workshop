# Decision: `empirical-proof` stops absorbing exploratory runtime work

**Date:** 2026-08-12

## Status

Implemented.

## Context

An operator set out to drive an Electron app and hunt for bugs in a surface
area they had named. The session pulled in `empirical-proof`, hit a launch
failure, reported the environment `blocked`, and stopped, when the correct
path was a fresh worktree, `bun install`, `bun dev`, and driving the app.

The session's own post-mortem was partly right and partly wrong, and the wrong
half is instructive. It first claimed "Workbench should not have been in the
critical path," then walked that back under challenge: the custom bridge it
improvised and the temporary user data were **its own** inventions, forbidden
rather than caused by the skill. What the skill genuinely contributed was the
`blocked` exit: a principled-looking way to stop after one failed launch.

Two defects underneath that.

**1. `empirical-proof` is the only skill in the flow that says "drive the
running app."** Its `NOT for` clause excluded a release-wide pass (`qa-sweep`)
and premise-verification (`claim-check`), but said nothing about exploring a
running surface for unknown bugs. That work therefore had no other place to
land and was absorbed here, inheriting a gate and a verdict set built for
proving *one finished change*. Nothing is under test when you are hunting, so
`verified`/`broken`/`blocked` have nothing to attach to.

**2. The gate treated launching as somebody else's job.** It read: "make **one
clean start attempt** via the documented path… Anything beyond it is not yours
to do… If it will not come up: report `blocked` and stop. Fixing local setup is
out of scope by design."

That calibration is right for verification integrity; it stops a session
faking an environment to manufacture a green verdict. It is wrong as a general
rule about starting an app, because it makes one hiccup terminal. Combined with
defect 1, a session that only wanted to explore a surface got a rule that
ended the work.

## The change

**The exploratory exclusion is named in both trigger surfaces.** The
description's `NOT for` list and the body's *When to use* now both exclude
"driving an app to hunt for unknown bugs in a surface." The body explains the
misfire so a model can recognize it, rather than just prohibiting it.

**Launching is in scope; `blocked` is demoted to last resort.** Gate step 4 now
covers everything the project's docs prescribe: install, example env, build,
dev server: plus a clean retry when the first attempt fails for a reason the
docs let you fix, and states that a fresh worktree or clean install is ordinary
setup rather than environment fabrication. Step 5 becomes "`blocked` is the
last resort, not the first exit… One failed launch is not a blocked verdict; a
documented path you have actually exhausted is." The closing Rules recap, which
restated "one documented start attempt at most," was corrected to match; it
would otherwise have re-contradicted the fix two screens later.

**What is deliberately preserved:** the "Do not conjure the environment"
prohibition, unchanged. Stubbing a TCP listener, pointing an env var at a fake,
or editing a boot check is still forbidden, and out-of-scope still covers
repairing the *machine*: a broken toolchain, an absent service, local config
drift. The fix separates two things the old text conflated: *don't fabricate
dependencies* (kept, absolute) from *don't try twice to start the app*
(removed, wrong).

## Where exploratory hunting goes instead

Nowhere: deliberately. The flow gains no new skill for it.

Three candidates were weighed: a new `bug-hunt` skill, widening `qa-sweep` to
solo scale, or fixing `empirical-proof` alone. The operator chose the last.
`using-workbench` already carries the correct answer for work no protocol fits:
*"when no frame fits the work's shape, keep the standard and drop the frame."*
Driving an app to hunt bugs is ordinary session work: get the app up, drive it,
reproduce what you find, report it. It does not need a protocol, and giving it
one would have added a skill against this repo's stated inclusion bar.

## Cost, stated plainly

The file grows 1,536 → 1,719 words (+183). The added text is load-bearing: it
is what prevents the failure. A standing audit finding says ~250 words are
independently trimmable here (the Rationalizations / Red flags / Rules sections
overlap, each rule appearing three times). That trim was **not** folded in because
the flow's own scope guard says adjacent improvements become follow-ups rather
than growing the diff, and this change is a behavioral fix, not a cleanup.

## Packaging

`workbench` `0.20.11` → `0.20.12` across all three plugin manifests and the
Claude marketplace entry.
