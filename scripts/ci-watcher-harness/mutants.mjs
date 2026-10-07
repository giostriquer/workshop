import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadSource } from './template.mjs';

export const MUTANTS = {
  'cancel-passes': ["if (result === 'cancelled') return 'cancel';", "if (result === 'cancelled') return 'pass';"],
  'ignore-child-failure': ["return [check({ ...run, name: run.name || `Run ${run.databaseId}` }), ...jobs];", "return [check({ ...run, name: run.name || `Run ${run.databaseId}` })];"],
  'accept-old-attempt': ['run.attempt <= c.afterAttempt', 'run.attempt < c.afterAttempt'],
  'ignore-expected-checks': ["if (c.expected.some(name => !rows.some(row => row.name === name && row.bucket === 'pass'))) return null;", 'if (false) return null;'],
  'never-block-read-errors': ['if (state.errors >= 4)', 'if (state.errors >= 400)'],
  'ignore-moved-head': ['if (pr.headRefOid !== c.sha)', 'if (false)'],
};

export function mutate(source, name) {
  const edit = MUTANTS[name];
  if (!edit) throw new Error(`Unknown mutant: ${name}`);
  if (source.split(edit[0]).length !== 2) throw new Error(`Stale mutant: ${name}`);
  return source.replace(edit[0], edit[1]);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const names = process.argv.length > 2 ? process.argv.slice(2) : Object.keys(MUTANTS);
  const testFile = fileURLToPath(new URL('./matrix.test.mjs', import.meta.url));
  const env = { ...process.env };
  delete env.CI_WATCHER_MUTANT;
  delete env.NODE_TEST_CONTEXT;
  const run = mutant => spawnSync(process.execPath, ['--test', '--test-reporter=tap', testFile], {
    env: mutant ? { ...env, CI_WATCHER_MUTANT: mutant } : env, encoding: 'utf8', timeout: 30000,
  });
  const baseline = run();
  if (baseline.status !== 0) {
    console.error(baseline.stdout, baseline.stderr);
    throw new Error('Clean runner tests failed; no mutation result is valid');
  }
  for (const name of names) {
    mutate(loadSource(), name);
    const result = run(name);
    const assertions = (result.stdout.match(/code: 'ERR_ASSERTION'/g) ?? []).length;
    const failures = Number(result.stdout.match(/^# fail (\d+)/m)?.[1] ?? 0);
    if (result.status === 1 && assertions > 0 && assertions === failures) {
      console.log(`killed ${name}: ${assertions} behavioral assertions`);
    } else {
      console.error(`unproven ${name}: status=${result.status}, assertions=${assertions}, failures=${failures}`);
      console.error(result.stderr);
      process.exitCode = 1;
    }
  }
}
