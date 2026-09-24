// Reads ci-watcher's loop template from the agent file at run time, so the harness
// always tests the shipped text and never a copy of it.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const agentFile = path.join(repoRoot, 'plugins/workbench/agents/ci-watcher.md');

// The one fenced block holding `pr=<n>` (step 2's loop), with its list indentation removed.
export function loadTemplate() {
  const doc = readFileSync(agentFile, 'utf8');
  const blocks = [...doc.matchAll(/^( *)```[^\n]*\n([\s\S]*?)^\1```$/gm)]
    .filter(([, , body]) => body.includes('pr=<n>'))
    .map(([, indent, body]) => body.replace(new RegExp(`^${indent}`, 'gm'), ''));
  if (blocks.length !== 1) {
    throw new Error(`${path.relative(repoRoot, agentFile)}: expected one fenced block holding pr=<n>, found ${blocks.length}`);
  }
  return blocks[0];
}

// Replaces the single match of `from` (a string or a RegExp). Zero or several matches throw,
// so an edit that no longer fits the template fails loudly instead of testing something else.
export function replaceOnce(text, from, to, what = String(from)) {
  const count = typeof from === 'string'
    ? text.split(from).length - 1
    : (text.match(new RegExp(from.source, `${from.flags.replace('g', '')}g`)) ?? []).length;
  if (count !== 1) throw new Error(`${what} matches ${count} places in the template, expected 1`);
  return text.replace(from, () => to);
}
