import { readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(process.argv[2] ?? join(dirname(fileURLToPath(import.meta.url)), '..'));
const roots = ['plugins/workbench/skills', 'plugins/toolkit/skills', '.claude/skills', '.codex/skills'];
const limit = 20000;
let count = 0;
let failed = false;

function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (entry.name === 'SKILL.md') {
      count++;
      const bytes = statSync(path).size;
      if (bytes >= limit) {
        console.error(`${relative(root, path).split('\\').join('/')}: ${bytes} bytes; SKILL.md must be under ${limit}`);
        failed = true;
      }
    }
  }
}

try {
  for (const directory of roots) walk(join(root, directory));
} catch (error) {
  console.error(`skill size validation failed: ${error.message}`);
  failed = true;
}
if (failed) process.exitCode = 1;
else console.log(`skill size validation ok (${count} entrypoints)`);
