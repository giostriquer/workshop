# verification-before-completion

No completion claims without fresh verification evidence — workbench's **"deemed
ready" gate** (operator's Q11): implementation reaches its adversarial review
only through this. Derived from
[obra/superpowers](https://github.com/obra/superpowers) (MIT, Jesse Vincent);
adapted per [`workbench-system.md`](../decisions/workbench-system.md).

## Use it

- Trigger: about to say done / fixed / passing / ready — before committing,
  filing a PR, or moving on.
- The gate function: identify the command that proves the claim → run it fresh
  → read the full output → only then claim, *with* the evidence.
- Covers paraphrases and implications, not just the words — "looks good now" is
  a completion claim.
- Delegated work too: verify the diff, never trust an agent's "success."
- After review findings are fixed, the flow proceeds straight to the outline
  gate (Q5) — but through this gate again first.
- Example: "Ready — format clean, tsc clean, 41/41 tests pass" (all three run
  in this message).

## Don't

- Don't claim from a previous run, a partial check, or "should/probably/seems."
- Don't express satisfaction ("Perfect!", "Done!") before the evidence exists.
- Don't substitute a linter pass for a build, or a build for tests.
- Don't escalate to `empirical-proof` uninvited — for a runnable surface,
  offer the deeper sibling (real client, real calls); it runs on the user's
  ask or standing authorization (Q14). This gate is the always-on floor.
- Don't soften the rules to make casual conversation smoother; if it over-fires,
  fix trigger wording, not the law.
