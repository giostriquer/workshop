#!/usr/bin/env node
// npx entry point. The implementation lives beside the skill that also runs it,
// so an installed plugin and a bare `npx` invocation execute the same file.
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
await import(pathToFileURL(join(here, "..", "plugins", "toolkit", "skills", "adopt-global-rules", "adopt.mjs")).href);
