---
name: anatomy
description: Use when the user explicitly invokes Anatomy for a detailed, interactive isometric SVG illustration or technical explainer. User-invoked only.
disable-model-invocation: true
---

# Anatomy

Run [upstream Anatomy](https://github.com/wheresryan22/anatomy) unchanged,
at commit `689dcf966e63d92be10a5d593c6e19e10acd4422` (MIT, Copyright 2026 Ryan).
This is a launcher; the drawing instructions and complete supporting package
come from upstream.

1. Use the current task's permitted scratch directory, outside all host skill
   discovery paths. In a Git project, choose an already ignored directory.
   Resolve the target project's output directory before changing directories.
   Create a fresh checkout in the scratch directory; preserve any existing
   Anatomy checkout.
   Run the following with the shell working directory set to that scratch
   directory, stopping if any command fails:

   ```sh
   set -e
   anatomy_dir=$(mktemp -d "$PWD/anatomy.XXXXXX")
   git init -q "$anatomy_dir"
   git -C "$anatomy_dir" fetch --depth=1 https://github.com/wheresryan22/anatomy.git 689dcf966e63d92be10a5d593c6e19e10acd4422
   git -C "$anatomy_dir" -c core.autocrlf=false checkout -q --detach FETCH_HEAD
   git -C "$anatomy_dir" rev-parse HEAD
   git -C "$anatomy_dir" status --porcelain
   git -C "$anatomy_dir" hash-object --no-filters SKILL.md
   git -C "$anatomy_dir" rev-parse HEAD:SKILL.md
   ```

   Follow any repository-required hook setup for the new checkout. Confirm
   HEAD equals the pin above, status is empty, and the two SKILL hashes match
   before continuing. A failed fetch or mismatched checkout is a setup gap;
   report it and keep the pin.

2. Read the **complete** `SKILL.md` from that checkout in this session, then
   follow it for the user's original request. Resolve every upstream relative
   path against the checkout, including `kit/`, `references/`, `scripts/`, and
   `examples/`. Read referenced files as upstream directs. Loading the file
   is the handoff; calling `/anatomy` or `$anatomy` again would recurse into
   this launcher. Do not install the checkout in a host's skills directory.

3. Keep the reference checkout unchanged. Put generated figures and any
   working copies of examples or kit files in the task's output area,
   preserving their relative imports and MIT license. Run the upstream
   workflow and relevant checks using the host's available tools and rules.
   Upstream needs Node.js 20.10+ and Chrome or Chromium for browser checks;
   report unavailable prerequisites and unverified output honestly.

Deliver the generated figure and its verification result, not just a link to
Anatomy or a successful download.
