import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const runnerFile = path.join(repoRoot, 'plugins/workbench/skills/fix-ci/scripts/watch-ci.mjs');
export const loadSource = () => readFileSync(runnerFile, 'utf8');

export async function loadRunner() {
  if (!process.env.CI_WATCHER_MUTANT) return import(pathToFileURL(runnerFile).href);
  const { mutate } = await import('./mutants.mjs');
  const source = mutate(loadSource(), process.env.CI_WATCHER_MUTANT);
  return import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
}
