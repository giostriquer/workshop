import assert from 'node:assert/strict';
import { copyFileSync, mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const here = path.dirname(fileURLToPath(import.meta.url));
const specimens = ['subsystem-specimen.html', 'refactor-specimen.html'];

function copyHarness(t, missing) {
  const dir = realpathSync(mkdtempSync(path.join(tmpdir(), 'html-artifact-check-')));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  copyFileSync(path.join(here, 'check.mjs'), path.join(dir, 'check.mjs'));
  mkdirSync(path.join(dir, 'fixtures'));
  for (const name of specimens) {
    if (name !== missing) {
      copyFileSync(path.join(here, 'fixtures', name), path.join(dir, 'fixtures', name));
    }
  }
  return dir;
}

function listFiles(dir, args = []) {
  return spawnSync(process.execPath, [path.join(dir, 'check.mjs'), '--list-files', ...args], {
    cwd: dir, encoding: 'utf8', timeout: 3000,
  });
}

test('lists both default fixtures without installed browser dependencies', (t) => {
  const dir = copyHarness(t);
  const result = listFiles(dir);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), specimens.map((name) => path.join(dir, 'fixtures', name)));
});

for (const missing of specimens) {
  test(`fails instead of checking a partial corpus when ${missing} is absent`, (t) => {
    const dir = copyHarness(t, missing);
    const result = listFiles(dir);
    assert.equal(result.status, 2, result.stderr);
    assert.ok(result.stderr.includes(missing), 'identifies the missing fixture');
    assert.equal(result.stdout, '');
  });
}

test('explicit selection uses only the requested page even without a full default corpus', (t) => {
  const dir = copyHarness(t, specimens[1]);
  const selected = path.join('fixtures', specimens[0]);
  const result = listFiles(dir, [selected]);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), [path.join(dir, selected)]);
});

test('ordinary checks still reach the browser boundary instead of only listing files', (t) => {
  const dir = copyHarness(t);
  const dependency = path.join(dir, 'node_modules', 'playwright');
  mkdirSync(dependency, { recursive: true });
  writeFileSync(path.join(dependency, 'package.json'), JSON.stringify({ type: 'module', exports: './index.js' }));
  writeFileSync(path.join(dependency, 'index.js'),
    'export const chromium = { launch() { throw new Error("browser boundary reached"); } };');
  const result = spawnSync(process.execPath, [path.join(dir, 'check.mjs')], {
    cwd: dir, encoding: 'utf8', timeout: 3000,
  });
  assert.equal(result.status, 2, result.stderr);
  assert.match(result.stderr, /browser boundary reached/);
  assert.equal(result.stdout, '');
});
