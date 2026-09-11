# Decision: dispatches are files, paste blocks are pointers

**Date:** 2026-09-11

**Release:** workbench 0.37.4

## Problem

The Dispatching envelope read `Paste this into <LANE>:` followed by "that lane's
full prompt". Some sessions did exactly that and handed the operator a brief of
several hundred lines to copy from a terminal, which is hard to copy precisely.
Other sessions wrote the brief to a file and pasted a pointer, which the operator
found far easier. The ledger section already said dispatches are retained as
local files; the envelope simply did not use them.

## Change

Every lane prompt, audit brief and authorization is written to its own file
under the epic's scope folder next to the ledger and indexed there. The paste
block is a pointer: one or two lines of role and authority plus fresh-or-existing
session, "Read and execute this dispatch:", the absolute path, and any lines
governing instructions require verbatim in each dispatch. The block carries no
summary or restated rules. Operator decisions and questions sit outside the
blocks. The brief's content requirements, the report format, the dispatch-now
rule and the authorization content are unchanged.

## Focused checks

One fresh-context probe with the revised skill and a two-lane scenario checked
that the session wrote the briefs to files and emitted pointer blocks of the
stated shape with the required verbatim line, and that the full brief content
lived in the files rather than the blocks.
