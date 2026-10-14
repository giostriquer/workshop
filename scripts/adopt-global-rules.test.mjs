import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const pack = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../plugins/toolkit/skills/adopt-global-rules');

test('Muse adoption detects the host, preserves local content, and is idempotent', (t) => {
  const root = mkdtempSync(path.join(tmpdir(), 'adopt-rules-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const run = (...args) => {
    const result = spawnSync(process.execPath, [path.join(pack, 'adopt.mjs'), '--root', root, '--host', 'muse', '--json', ...args], {
      encoding: 'utf8', timeout: 10000,
    });
    assert.equal(result.status, 0, result.stderr);
    return JSON.parse(result.stdout);
  };
  const target = path.join(root, '.config/muse/AGENTS.md');
  const absent = run();
  assert.equal(absent.hosts.length, 1);
  assert.equal(absent.hosts[0].present, false);
  assert.equal(absent.actions[0].action, 'skipped');
  assert.equal(existsSync(target), false);

  mkdirSync(path.dirname(target), { recursive: true });
  const local = '# Acme preferences\nKeep the webapp examples local.\n';
  writeFileSync(target, local);
  const otherHosts = ['.claude/CLAUDE.md', '.codex/AGENTS.md'];
  for (const relative of otherHosts) {
    const file = path.join(root, relative);
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, local);
  }
  const plan = run('--dry-run');
  assert.equal(plan.hosts[0].present, true);
  assert.deepEqual(plan.actions.map(({ action }) => action), ['added', 'added']);
  assert.equal(readFileSync(target, 'utf8'), local);

  const applied = run();
  assert.deepEqual(applied.actions.map(({ ruleId, action }) => [ruleId, action]), [['globals', 'added'], ['model-floor', 'added']]);
  const installed = readFileSync(target, 'utf8');
  assert.ok(installed.startsWith(local));
  for (const [id, file] of [['globals', 'globals/MUSE.md'], ['model-floor', 'rules/core/model-floor.md']]) {
    const body = readFileSync(path.join(pack, file), 'utf8').trim();
    assert.ok(installed.includes(`<!-- workshop:rule id=${id} -->\n${body}\n<!-- /workshop:rule id=${id} -->`));
  }
  const repeated = run();
  assert.deepEqual(repeated.actions.map(({ action }) => action), ['unchanged', 'unchanged']);
  assert.equal(readFileSync(target, 'utf8'), installed);
  for (const relative of otherHosts) assert.equal(readFileSync(path.join(root, relative), 'utf8'), local);
});
